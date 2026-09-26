import { createFileRoute } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { ArticleImageCard, SectionDivider } from "@/components/article-cards";
import { byCategory, CATEGORY_META, type Category } from "@/lib/news-data";

export function CategoryPage({ category }: { category: Category }) {
  const meta = CATEGORY_META[category];
  const list = byCategory(category);

  return (
    <div className="min-h-screen font-sans text-foreground antialiased">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-10 pb-20">
        <header className="animate-rise">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">{category}</p>
          <h1 className="mt-3 font-display text-[clamp(2.2rem,4vw,3.5rem)] font-bold leading-tight tracking-tight text-balance max-w-[24ch]">
            {meta.tagline}
          </h1>
          <p className="mt-3 max-w-[60ch] text-pretty text-muted-foreground">{meta.description}</p>
        </header>
        <div className="mt-10">
          <SectionDivider label="Latest" />
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {list.map((article, i) => (
              <ArticleImageCard
                key={article.slug}
                article={article}
                featured={i === 0}
                delay={i * 60}
                className={i === 0 ? "md:col-span-2" : undefined}
              />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
