import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { SiteHeader } from "@/components/site-header";
import { supabase } from "@/integrations/supabase/client";
import { approveDraft, fetchNewDrafts, getAdminStatus, listQueue, rejectDraft, updateDraftAffiliate } from "@/lib/admin.functions";

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

  const refresh = () => {
    qc.invalidateQueries({ queryKey: ["queue"] });
    qc.invalidateQueries({ queryKey: ["live-articles"] });
  };
  const approve = useMutation({
    mutationFn: async ({ id, affiliateTitle, affiliateUrl }: { id: string; affiliateTitle: string; affiliateUrl: string }) => {
      await saveAffiliateFn({ data: { id, affiliate_title: affiliateTitle || null, affiliate_url: affiliateUrl || null } });
      return approveFn({ data: { id } });
    },
    onSuccess: refresh,
    onError: (e) => setNote(e.message),
  });
  const reject = useMutation({ mutationFn: (id: string) => rejectFn({ data: { id } }), onSuccess: refresh, onError: (e) => setNote(e.message) });
  const ingest = useMutation({
    mutationFn: () => ingestFn(),
    onSuccess: (r) => {
      const failed = r.results.filter((x) => !x.ok);
      setNote(`${r.created} new draft(s) added.${failed.length ? ` ${failed.length} failed: ${failed[0]?.error}` : ""}`);
      refresh();
    },
    onError: (e) => setNote(e.message),
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
                onClick={() => ingest.mutate()} disabled={ingest.isPending}
                className="rounded-full bg-primary px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.15em] text-primary-foreground disabled:opacity-50"
              >
                {ingest.isPending ? "Drafting…" : "Fetch new stories"}
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

        {queue.data && queue.data.length === 0 && (
          <p className="mt-10 text-muted-foreground">The queue is empty. Fetch new stories to draft fresh articles.</p>
        )}
        <div className="mt-8 space-y-6">
          {queue.data?.map((d) => (
            <article key={d.id} className="glass rounded-[20px] p-7 ring-1 ring-foreground/10 animate-rise">
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
              <div className="mt-6 flex gap-3">
                <button
                  onClick={() => approve.mutate(d.id)} disabled={approve.isPending}
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
          ))}
        </div>
      </main>
    </div>
  );
}
