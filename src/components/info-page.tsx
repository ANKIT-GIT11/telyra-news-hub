import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";

export const CONTACT_EMAIL = "contact.telyra2026@gmail.com";

const QUICK_LINKS = [
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
] as const;

/**
 * Shared shell for the site information pages (About, Contact, Privacy, Terms).
 * Light page chrome with a single deep-navy editorial panel, matching the
 * "Frosted editorial" direction and the sponsored-tools callout family.
 */
export function InfoPage({
  kicker,
  title,
  lead,
  updated,
  children,
}: {
  kicker: string;
  title: string;
  lead?: string;
  updated?: string;
  children: ReactNode;
}) {
  return (
    <div className="min-h-screen font-sans text-foreground antialiased">
      <SiteHeader />
      <main className="mx-auto max-w-3xl px-6 pb-20 pt-12 sm:pt-16">
        <header className="animate-fadein">
          <p className="info-kicker">{kicker}</p>
          <h1 className="mt-4 font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-[3.1rem]">
            {title}
          </h1>
          {lead && (
            <p className="mt-4 max-w-[58ch] text-[17px] leading-relaxed text-muted-foreground">{lead}</p>
          )}
          {updated && (
            <p className="mt-5 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
              Last updated {updated}
            </p>
          )}
        </header>

        <section className="info-panel animate-rise mt-10">{children}</section>

        <nav
          aria-label="Site information"
          className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-foreground/10 pt-5 font-mono text-[10px] uppercase tracking-[0.18em] text-muted-foreground"
        >
          {QUICK_LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ))}
          <a href={`mailto:${CONTACT_EMAIL}`} className="transition-colors hover:text-foreground">
            {CONTACT_EMAIL}
          </a>
        </nav>
      </main>
    </div>
  );
}
