import { Link } from "@tanstack/react-router";

const NAV = [
  { label: "World", to: "/world" },
  { label: "Tech", to: "/tech" },
  { label: "Business", to: "/business" },
  { label: "Culture", to: "/culture" },
] as const;

export function SiteHeader() {
  return (
    <header className="glass sticky top-0 z-50">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <Link to="/" className="flex items-center gap-3">
          <span className="font-display text-2xl font-bold tracking-tight">Telyra</span>
          <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground hidden sm:inline">
            Daily Edition
          </span>
        </Link>
        <nav className="hidden items-center gap-7 font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground md:flex">
          {NAV.map((item) => (
            <Link
              key={item.to}
              to={item.to}
              activeProps={{ className: "text-foreground" }}
              className="transition-colors hover:text-foreground"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <span className="font-mono text-[10px] text-muted-foreground hidden lg:inline">26 Sep 2026</span>
          <button
            type="button"
            className="rounded-full bg-foreground px-4 py-2 text-[11px] font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-primary hover:text-primary-foreground"
          >
            Subscribe
          </button>
        </div>
      </div>
    </header>
  );
}
