import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";

export function InfoPage({ kicker, title, updated, children }: { kicker: string; title: string; updated?: string; children: ReactNode }) {
  return (
    <div className="min-h-screen font-sans text-foreground antialiased">
      <SiteHeader />
      <main className="mx-auto max-w-[72ch] px-6 py-12 pb-16">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">{kicker}</p>
        <h1 className="mt-2 font-display text-4xl font-bold tracking-tight">{title}</h1>
        {updated && <p className="mt-2 font-mono text-[11px] text-muted-foreground">Last updated {updated}</p>}
        <div className="glass mt-8 space-y-5 rounded-[20px] p-7 text-[16px] leading-relaxed text-foreground/90 ring-1 ring-foreground/10 [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-bold [&_a]:text-primary [&_ul]:list-disc [&_ul]:pl-5">
          {children}
        </div>
      </main>
    </div>
  );
}

export const CONTACT_EMAIL = "contact.telyra2026@gmail.com";
