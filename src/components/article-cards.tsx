import { Link } from "@tanstack/react-router";
import type { Article } from "@/lib/news-data";
import { ArticleImage } from "@/components/article-image";

export function ArticleImageCard({
  article,
  featured = false,
  className,
  delay,
}: {
  article: Article;
  featured?: boolean;
  className?: string | undefined;
  delay?: number | undefined;
}) {

  return (
    <Link
      to="/article/$slug"
      params={{ slug: article.slug }}
      className={`group glass block overflow-hidden rounded-[min(1.5vw,16px)] ring-foreground/10 transition-all duration-300 ring-1 hover:-translate-y-1 hover:ring-primary/30 animate-rise ${className ?? ""}`}
      style={delay !== undefined ? { animationDelay: `${delay}ms` } : undefined}
    >
      <div className="relative">
        <ArticleImage src={article.image} alt={article.imageAlt} seed={article.slug} width={1024} height={640} lazy className="aspect-[16/10] w-full" />
        <span className="glass absolute top-4 left-4 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground">
          {article.category}
        </span>
      </div>
      <div className="p-5">
        <h3
          className={`font-display font-bold leading-tight tracking-tight text-balance group-hover:text-primary transition-colors ${
            featured ? "text-2xl" : "text-xl"
          }`}
        >
          {article.title}
        </h3>
        <p className="mt-3 font-mono text-[10px] text-muted-foreground">
          {article.author} · {article.readTime} min · {article.published}
        </p>
      </div>
    </Link>
  );
}

export function SectionDivider({ label }: { label: string }) {
  return (
    <div className="mb-6 flex items-center gap-4 animate-fadein">
      <span className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground">{label}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}
