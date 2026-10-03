import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { supabase } from "@/integrations/supabase/client";
import { announceArticlesChanged } from "@/hooks/use-live-sync";
import { approveDraft, archiveArticle, listLiveAdmin, createManualDraft, fetchNewDrafts, getAdminStatus, listQueue, rejectDraft, updateDraftAffiliate } from "@/lib/admin.functions";

type Cat = "World" | "Tech" | "Business" | "Culture";
function ManualDraft({ onSubmit, pending }: { onSubmit: (v: { title: string; subheadline: string; content: string; category: Cat; source_url: string }) => void; pending: boolean }) {
  const [open, setOpen] = useState(false);
  const [f, setF] = useState({ title: "", subheadline: "", content: "", category: "Tech" as Cat, source_url: "" });
  const field = "rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary";
  return (
    <div className="glass mt-8 rounded-[20px] p-6 ring-1 ring-foreground/10">
      <button onClick={() => setOpen(!open)} className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">
        {open ? "− Close" : "+ Create draft by hand"}
      </button>
      {open && (
        <form
          className="mt-4 grid gap-3"
          onSubmit={(e) => { e.preventDefault(); onSubmit(f); setF({ title: "", subheadline: "", content: "", category: f.category, source_url: "" }); }}
        >
          <input required value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="Headline" className={field} />
          <input value={f.subheadline} onChange={(e) => setF({ ...f, subheadline: e.target.value })} placeholder="Subheadline (optional)" className={field} />
          <textarea required rows={6} value={f.content} onChange={(e) => setF({ ...f, content: e.target.value })} placeholder="Article body — separate paragraphs with a blank line" className={field} />
          <div className="grid gap-3 sm:grid-cols-2">
            <select value={f.category} onChange={(e) => setF({ ...f, category: e.target.value as Cat })} className={field}>
              {(["Tech", "World", "Business", "Culture"] as Cat[]).map((c) => <option key={c}>{c}</option>)}
            </select>
            <input value={f.source_url} onChange={(e) => setF({ ...f, source_url: e.target.value })} placeholder="Source link (optional)" className={field} />
          </div>
          <button disabled={pending} className="justify-self-start rounded-full bg-foreground px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.15em] text-background disabled:opacity-50">
            {pending ? "Saving…" : "Add to queue"}
          </button>
        </form>
      )}
    </div>
  );
}

export const Route = createFileRoute("/_authenticated/admin")({
  head: () => ({
    meta: [
      { title: "Review queue — Telyra" },
      { name: "description", content: "Approve AI-drafted stories before they go live on Telyra." },
      { property: "og:title", content: "Review queue — Telyra" },
      { property: "og:description", content: "Approve AI-drafted stories before they go live on Telyra." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: AdminPage,
});

function AdminPage() {
  const qc = useQueryClient();
  const navigate = useNavigate();
  const statusFn = useServerFn(getAdminStatus);
  const status = useQuery({ queryKey: ["admin-status"], queryFn: () => statusFn() });
  const queueFn = useServerFn(listQueue);
  const queue = useQuery({ queryKey: ["queue"], queryFn: () => queueFn(), enabled: status.data?.isAdmin === true });
  const approveFn = useServerFn(approveDraft);
  const rejectFn = useServerFn(rejectDraft);
  const saveAffiliateFn = useServerFn(updateDraftAffiliate);
  const ingestFn = useServerFn(fetchNewDrafts);
  const [note, setNote] = useState<string | null>(null);

  const liveFn = useServerFn(listLiveAdmin);
  const live = useQuery({ queryKey: ["admin-live"], queryFn: () => liveFn(), enabled: status.data?.isAdmin === true });
  const archiveFn = useServerFn(archiveArticle);
  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["queue"] });
    qc.invalidateQueries({ queryKey: ["admin-live"] });
    qc.invalidateQueries({ queryKey: ["live-articles"] });
  };
  const archive = useMutation({
    mutationFn: (id: string) => archiveFn({ data: { id } }),
    onSuccess: () => { setNote("Story removed from the site (kept in the archive)."); refresh(); void announceArticlesChanged(); },
    onError: (e) => setNote(e.message),
  });
  const approve = useMutation({
    mutationFn: async ({ id, affiliateTitle, affiliateUrl, editorNote }: { id: string; affiliateTitle: string; affiliateUrl: string; editorNote: string }) => {
      await saveAffiliateFn({ data: { id, affiliate_title: affiliateTitle || null, affiliate_url: affiliateUrl || null, editor_note: editorNote || null } });
      return approveFn({ data: { id } });
    },
    onSuccess: () => { refresh(); void announceArticlesChanged(); },
    onError: (e) => setNote(e.message),
  });
  const reject = useMutation({ mutationFn: (id: string) => rejectFn({ data: { id } }), onSuccess: refresh, onError: (e) => setNote(e.message) });
  const [cooldown, setCooldown] = useState(0);
  const startCooldown = () => {
    setCooldown(60);
    const t = setInterval(() => setCooldown((c) => { if (c <= 1) { clearInterval(t); return 0; } return c - 1; }), 1000);
  };
  const ingest = useMutation({
    mutationFn: () => ingestFn(),
    onMutate: () => setNote("Checking news sources…"),
    onSuccess: (r) => {
      const failed = r.results.filter((x) => !x.ok);
      console.log("[fetch] saved to review queue:", r.created, "results:", r.results);
      failed.forEach((f) => console.error("[fetch] not saved:", f.source, f.error));
      setNote(`${r.message}${failed.length && r.created ? ` ${failed.length} skipped (e.g. ${failed[0]?.error}).` : ""}`);
      refresh();
    },
    onError: () => setNote("Couldn't fetch stories right now. Please try again in a minute, or add a draft by hand below."),
    onSettled: startCooldown,
  });
  const manualFn = useServerFn(createManualDraft);
  const manual = useMutation({
    mutationFn: (v: { title: string; subheadline: string; content: string; category: "World" | "Tech" | "Business" | "Culture"; source_url: string }) =>
      manualFn({ data: v }),
    onSuccess: () => { setNote("Draft added to the queue."); refresh(); },
    onError: () => setNote("Couldn't save the draft — check the title (3+ characters), body (20+ characters) and link."),
  });

  const signOut = async () => {
    await supabase.auth.signOut();
    qc.clear();
    navigate({ to: "/" });
  };

  return (
    <div className="min-h-screen font-sans text-foreground antialiased">
      <SiteHeader />
      <main className="mx-auto max-w-5xl px-6 py-10 pb-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">Editorial desk</p>
            <h1 className="mt-2 font-display text-4xl font-bold">Review queue</h1>
          </div>
          <div className="flex gap-3">
            {status.data?.isAdmin && (
              <button
                onClick={() => ingest.mutate()} disabled={ingest.isPending || cooldown > 0}
                className="rounded-full bg-primary px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.15em] text-primary-foreground disabled:opacity-50"
              >
                {ingest.isPending ? "Drafting…" : cooldown > 0 ? `Wait ${cooldown}s` : "Fetch new stories"}
              </button>
            )}
            <button onClick={signOut} className="rounded-full border border-input px-5 py-2.5 text-[11px] uppercase tracking-[0.15em]">
              Sign out
            </button>
          </div>
        </div>
        {note && <p className="mt-4 text-sm text-muted-foreground">{note}</p>}

        {status.isLoading && <p className="mt-10 text-muted-foreground">Checking access…</p>}
        {status.data && !status.data.isAdmin && (
          <div className="glass mt-10 rounded-[20px] p-8 ring-1 ring-foreground/10">
            <h2 className="font-display text-2xl font-bold">Admin access required</h2>
            <p className="mt-2 text-muted-foreground">Your account is signed in but hasn't been made an editor yet.</p>
          </div>
        )}

        {status.data?.isAdmin && <ManualDraft onSubmit={(v) => manual.mutate(v)} pending={manual.isPending} />}
        {queue.isError && <p className="mt-10 text-muted-foreground">Couldn't load the queue. Refresh the page to try again.</p>}
        {queue.data && queue.data.length === 0 && (
          <p className="mt-10 text-muted-foreground">The queue is empty. Fetch new stories to draft fresh articles.</p>
        )}
        {live.data && live.data.length > 0 && (
          <section className="glass mt-8 rounded-[20px] p-6 ring-1 ring-foreground/10">
            <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">All articles ({live.data.length})</p>
            <ul className="mt-4 divide-y divide-border">
              {live.data.map((a) => (
                <li key={a.id} className="flex items-center justify-between gap-4 py-3">
                  <span className="min-w-0 text-sm font-medium leading-snug">
                    <span className="block truncate">{a.title || "Untitled article"}</span>
                    <span className="mt-1 block font-mono text-[9px] uppercase tracking-[0.15em] text-muted-foreground">
                      {a.category || "Uncategorised"} · {a.status || "Legacy / unset"}
                    </span>
                  </span>
                  <button
                    onClick={() => { if (confirm("Archive this story? It will stay in the database and disappear from public pages.")) archive.mutate(a.id); }}
                    disabled={archive.isPending}
                    className="shrink-0 rounded-full border border-input px-4 py-2 text-[10px] uppercase tracking-[0.15em] text-muted-foreground hover:text-destructive disabled:opacity-50"
                  >
                    Delete
                  </button>
                </li>
              ))}
            </ul>
          </section>
        )}
        <div className="mt-8 space-y-6">
          {queue.data?.map((d) => (
            <DraftCard key={d.id} draft={d} approve={approve} reject={reject} />
          ))}
        </div>
      </main>
    </div>
  );
}

type Draft = {
  id: string;
  title: string;
  subheadline: string | null;
  content: string;
  source_url: string | null;
  category: string;
  status: string;
  affiliate_title: string | null;
  affiliate_url: string | null;
  editor_note: string | null;
};

function DraftCard({
  draft: d,
  approve,
  reject,
}: {
  draft: Draft;
  approve: { mutate: (v: { id: string; affiliateTitle: string; affiliateUrl: string; editorNote: string }) => void; isPending: boolean };
  reject: { mutate: (id: string) => void; isPending: boolean };
}) {
  const [affiliateTitle, setAffiliateTitle] = useState(d.affiliate_title ?? "");
  const [affiliateUrl, setAffiliateUrl] = useState(d.affiliate_url ?? "");
  const [editorNote, setEditorNote] = useState(d.editor_note ?? "");

  return (
    <article className="glass rounded-[20px] p-7 ring-1 ring-foreground/10 animate-rise">
      <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
        {d.category} · {d.status}
        {d.source_url && (
          <> · <a href={d.source_url} target="_blank" rel="noreferrer" className="hover:text-foreground">source ↗</a></>
        )}
      </p>
      <h2 className="mt-2 font-display text-2xl font-bold leading-tight">{d.title}</h2>
      {d.subheadline && <p className="mt-2 text-muted-foreground">{d.subheadline}</p>}
      <div className="mt-4 space-y-3 text-[15px] leading-relaxed text-foreground/90">
        {d.content.split(/\n\s*\n/).map((p, i) => <p key={i}>{p}</p>)}
      </div>

      <div className="mt-6 rounded-xl border border-input bg-background/40 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Editor's take (optional — shown above the story)
        </p>
        <textarea
          rows={3}
          maxLength={2000}
          value={editorNote}
          onChange={(e) => setEditorNote(e.target.value)}
          placeholder="Your intro or personal takeaway for readers"
          className="mt-3 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
        />
      </div>

      <div className="mt-4 rounded-xl border border-input bg-background/40 p-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
          Related Tools box (optional — shown on the published story)
        </p>
        <div className="mt-3 grid gap-3 sm:grid-cols-2">
          <input
            value={affiliateTitle}
            onChange={(e) => setAffiliateTitle(e.target.value)}
            placeholder="Box title, e.g. The hosting stack we recommend"
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <input
            value={affiliateUrl}
            onChange={(e) => setAffiliateUrl(e.target.value)}
            placeholder="Link URL, e.g. https://…"
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        <button
          onClick={() => approve.mutate({ id: d.id, affiliateTitle, affiliateUrl, editorNote })}
          disabled={approve.isPending}
          className="rounded-full bg-foreground px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.15em] text-background hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
        >
          Approve
        </button>
        <button
          onClick={() => reject.mutate(d.id)} disabled={reject.isPending}
          className="rounded-full border border-input px-5 py-2.5 text-[11px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
        >
          Discard
        </button>
      </div>
    </article>
  );
}
