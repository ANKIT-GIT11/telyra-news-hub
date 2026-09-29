const FEED_URLS = ["https://techcrunch.com/feed", "https://hnrss.org/frontpage"];
const GEMINI_MODEL = "gemini-3.8-flash";

type FeedItem = { title: string; description: string; link: string; pubDate: string };

function decode(s: string) {
  return s
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/<[^>]+>/g, "")
    .trim();
}

function tag(block: string, name: string) {
  const m = new RegExp(`<${name}[^>]*>([\\s\\S]*?)</${name}>`).exec(block);
  return m?.[1] ? decode(m[1]) : "";
}

async function fetchFeed(url: string): Promise<FeedItem[]> {
  const res = await fetch(url, { headers: { "User-Agent": "TelyraBot/1.0" } });
  if (!res.ok) throw new Error(`RSS fetch failed: ${res.status}`);
  const xml = await res.text();
  const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)].map((m) => {
    const b = m[1] ?? "";
    return { title: tag(b, "title"), description: tag(b, "description"), link: tag(b, "link"), pubDate: tag(b, "pubDate") };
  });
  return items
    .filter((i) => i.title && i.link)
    .sort((a, b) => Date.parse(b.pubDate || "0") - Date.parse(a.pubDate || "0"));
}

const FALLBACK_FEED_URLS = [
  "https://feeds.arstechnica.com/arstechnica/technology-lab",
  "https://venturebeat.com/feed/",
];
const BATCH_SIZE = 6; // hard cap per run (5–10 allowed)
const RECENCY_HOURS = 72;
const MIN_SCORE = 2;
const LOOSE_MIN_SCORE = 1;
const MIN_TARGET = 5;
const KEYWORDS: [RegExp, number][] = [
  [/\b(ai|a\.i\.|artificial intelligence|llm|gpt|gemini|claude|openai|anthropic|machine learning|neural|model)\b/i, 3],
  [/\b(saas|startup|software|platform|api|developer|open[- ]source|github|cloud|devops|kubernetes|database)\b/i, 2],
  [/\b(chip|gpu|nvidia|semiconductor|data ?cent(er|re)|infrastructure|security|cyber|funding|raises|acquires|launch(es)?)\b/i, 1],
];
function relevance(i: FeedItem) {
  const text = `${i.title} ${i.description}`;
  return KEYWORDS.reduce((n, [re, w]) => n + (re.test(text) ? w : 0), 0);
}

type Draft = { title: string; subheadline: string; content: string };

async function rewrite(item: FeedItem, apiKey: string): Promise<Draft | null> {
  const prompt = `You are the editorial gatekeeper and senior journalist at Telyra, a premium digital newspaper covering technology, software, AI, and digital infrastructure.

STEP 1 — Commercial Intent check (do this before writing anything):
Evaluate the raw news item below. Classify it as high-intent ONLY if it involves software, AI, monetizable tech tools, startups, products, platforms, developers, or digital infrastructure. REJECT it if it is general news, weather, politics without a tech angle, sports, crime, lifestyle, or a philosophical/culture essay — anything with no software, AI, or monetizable tech angle.
If REJECTED, return exactly: {"rejected": true}
Do not invent or stretch a tech angle that is not present.

STEP 2 — If ACCEPTED, rewrite the item into an original article in Telyra's voice: highly professional, cinematic, measured, precise.
Rules: exactly 3 paragraphs separated by blank lines; do not invent quotes, names, figures or facts beyond the source; British spelling is fine.
Return JSON with keys: "rejected": false, "title" (new headline, max 12 words), "subheadline" (one sentence), "content" (the 3 paragraphs).

Source headline: ${item.title}
Source summary: ${item.description}`;

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { responseMimeType: "application/json" },
      }),
    },
  );
  if (!res.ok) throw new Error(`Gemini ${res.status}: ${(await res.text()).slice(0, 300)}`);
  const json = (await res.json()) as { candidates?: { content?: { parts?: { text?: string }[] } }[] };
  const text = json.candidates?.[0]?.content?.parts?.map((p) => p.text ?? "").join("") ?? "";
  const parsed = JSON.parse(text) as Partial<Draft> & { rejected?: boolean };
  if (parsed.rejected === true || (!parsed.title && !parsed.content)) return null;
  if (!parsed.title || !parsed.content) throw new Error("Gemini returned an incomplete draft");
  return { title: parsed.title, subheadline: parsed.subheadline ?? "", content: parsed.content };
}

async function loadFeeds(urls: string[]) {
  const settled = await Promise.allSettled(urls.map((url) => fetchFeed(url)));
  const errors = settled.flatMap((s, i) =>
    s.status === "rejected"
      ? [{ source: urls[i] ?? "feed", ok: false, error: `Feed unreachable: ${s.reason instanceof Error ? s.reason.message : String(s.reason)}` }]
      : [],
  );
  const items = settled.flatMap((s) => (s.status === "fulfilled" ? s.value : []));
  return { items, errors };
}

export async function runIngestion() {
  const apiKey = process.env["GOOGLE_AI_API_KEY"];
  if (!apiKey) throw new Error("GOOGLE_AI_API_KEY is not configured");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const cutoff = Date.now() - RECENCY_HOURS * 3600_000;
  const recent = (list: FeedItem[]) =>
    list.filter((i) => { const t = Date.parse(i.pubDate || ""); return !Number.isNaN(t) && t >= cutoff; });

  const primary = await loadFeeds(FEED_URLS);
  const feedErrors = [...primary.errors];
  let pool = recent(primary.items);

  const pickFresh = async (minScore: number) => {
    const ranked = pool
      .map((i) => ({ i, score: relevance(i) }))
      .filter((x) => x.score >= minScore)
      .sort((x, y) => y.score - x.score || Date.parse(y.i.pubDate) - Date.parse(x.i.pubDate))
      .map((x) => x.i);
    const unique = [...new Map(ranked.map((i) => [i.link, i])).values()];
    if (unique.length === 0) return [];
    const links = unique.map((i) => i.link);
    const [{ data: q }, { data: a }] = await Promise.all([
      supabaseAdmin.from("review_queue").select("source_url").in("source_url", links),
      supabaseAdmin.from("articles").select("source_url").in("source_url", links),
    ]);
    const seen = new Set([...(q ?? []), ...(a ?? [])].map((r) => r.source_url));
    return unique.filter((i) => !seen.has(i.link));
  };

  let fresh = await pickFresh(MIN_SCORE);
  if (fresh.length < MIN_TARGET) {
    // Primary feeds thin or down — pull in backup tech sources.
    const backup = await loadFeeds(FALLBACK_FEED_URLS);
    feedErrors.push(...backup.errors);
    pool = [...pool, ...recent(backup.items)];
    fresh = await pickFresh(MIN_SCORE);
  }
  if (fresh.length < MIN_TARGET) fresh = await pickFresh(LOOSE_MIN_SCORE); // loosen keyword match slightly
  fresh = fresh.slice(0, BATCH_SIZE);

  if (pool.length === 0) {
    return { created: 0, results: feedErrors, message: "News sources are unavailable right now. Try again later, or add a draft by hand below." };
  }
  if (fresh.length === 0) {
    return { created: 0, results: feedErrors, message: `No new tech/AI stories from the last ${RECENCY_HOURS / 24} days — everything recent is already drafted.` };
  }

  const results: { source: string; ok: boolean; error?: string }[] = [...feedErrors];
  for (const item of fresh) {
    try {
      const draft = await rewrite(item, apiKey);
      if (!draft) {
        results.push({ source: item.link, ok: false, error: "Rejected: no commercial intent (not tech/software/AI)" });
        continue;
      }
      const { data: saved, error } = await supabaseAdmin
        .from("review_queue")
        .insert({
          ...draft,
          source_url: item.link,
          category: "World",
          published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
          status: "pending",
        })
        .select("id")
        .single();
      if (error) throw new Error(`Save failed: ${error.message}`);
      if (!saved?.id) throw new Error("Save failed: database did not confirm the draft");
      results.push({ source: item.link, ok: true });
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      results.push({ source: item.link, ok: false, error: msg });
      if (/Gemini (429|403|402)/.test(msg)) break; // stop the batch on quota/limit errors
    }
  }
  const created = results.filter((r) => r.ok).length;
  return { created, results, message: `${created} new draft(s) added from ${fresh.length} checked.` };
}
