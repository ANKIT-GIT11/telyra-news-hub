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

export async function runIngestion() {
  const apiKey = process.env["GOOGLE_AI_API_KEY"];
  if (!apiKey) throw new Error("GOOGLE_AI_API_KEY is not configured");
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

  const settled = await Promise.allSettled(FEED_URLS.map((url) => fetchFeed(url)));
  const feedErrors = settled.flatMap((s, i) =>
    s.status === "rejected"
      ? [{ source: FEED_URLS[i] ?? "feed", ok: false, error: `Feed unreachable: ${s.reason instanceof Error ? s.reason.message : String(s.reason)}` }]
      : [],
  );
  const feeds = settled.flatMap((s) => (s.status === "fulfilled" ? [s.value] : []));
  if (feeds.length === 0) throw new Error(`All news feeds failed. ${feedErrors.map((e) => e.error).join("; ")}`);
  const items = feeds.flat().sort((a, b) => Date.parse(b.pubDate || "0") - Date.parse(a.pubDate || "0"));
  const links = items.map((i) => i.link);
  const [{ data: q }, { data: a }] = await Promise.all([
    supabaseAdmin.from("review_queue").select("source_url").in("source_url", links),
    supabaseAdmin.from("articles").select("source_url").in("source_url", links),
  ]);
  const seen = new Set([...(q ?? []), ...(a ?? [])].map((r) => r.source_url));
  const fresh = items.filter((i) => !seen.has(i.link)).slice(0, 3);

  const results: { source: string; ok: boolean; error?: string }[] = [...feedErrors];
  for (const item of fresh) {
    try {
      const draft = await rewrite(item, apiKey);
      if (!draft) {
        results.push({ source: item.link, ok: false, error: "Rejected: no commercial intent (not tech/software/AI)" });
        continue;
      }
      const { error } = await supabaseAdmin.from("review_queue").insert({
        ...draft,
        source_url: item.link,
        category: "World",
        published_at: item.pubDate ? new Date(item.pubDate).toISOString() : null,
        status: "pending",
      });
      if (error) throw new Error(error.message);
      results.push({ source: item.link, ok: true });
    } catch (e) {
      results.push({ source: item.link, ok: false, error: e instanceof Error ? e.message : String(e) });
    }
  }
  return { created: results.filter((r) => r.ok).length, results };
}
