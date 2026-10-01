import { Link } from "@tanstack/react-router";

const LINKS = [
  { label: "About", to: "/about" },
  { label: "Contact", to: "/contact" },
  { label: "Privacy", to: "/privacy" },
  { label: "Terms", to: "/terms" },
] as const;

export function SiteFooter() {
  return (
    <footer className="glass-soft mt-10 border-t border-foreground/10">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 px-6 py-8 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <span className="font-display text-lg font-bold">Telyra</span>
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground">
            © {new Date().getFullYear()} Telyra · Tech &amp; AI news
          </p>
        </div>
        <nav className="flex flex-wrap gap-6 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground">
          {LINKS.map((l) => (
            <Link key={l.to} to={l.to} className="transition-colors hover:text-foreground">
              {l.label}
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  );
}
