import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { SiteHeader } from "@/components/site-header";
import { ArticleImageCard, SectionDivider } from "@/components/article-cards";
import { byCategory, getArticle, type Article, type Category } from "@/lib/news-data";
import { getLiveArticle } from "@/lib/live.functions";
import { LIVE_PREFIX, toArticle } from "@/lib/live-articles";

const CATEGORY_ROUTES: Record<Category, "/world" | "/tech" | "/business" | "/culture"> = {
  World: "/world",
  Tech: "/tech",
  Business: "/business",
  Culture: "/culture",
};

export const Route = createFileRoute("/article/$slug")({
  loader: async ({ params }) => {
    if (params.slug.startsWith(LIVE_PREFIX)) {
      const id = params.slug.slice(LIVE_PREFIX.length);
      const row = await getLiveArticle({ data: { id } }).catch(() => null);
      if (!row) throw notFound();
      return { article: toArticle(row), sourceUrl: row.source_url };
    }
    const article = getArticle(params.slug);
    if (!article) throw notFound();
    return { article, sourceUrl: null as string | null };
  },
  head: ({ loaderData }) => {
    const article = loaderData?.article;
    if (!article) {
      return {
        meta: [{ title: "Not found — Telyra" }, { name: "robots", content: "noindex" }],
      };
    }
    return {
      meta: [
        { title: `${article.title} — Telyra` },
        { name: "description", content: article.excerpt },
        { property: "og:title", content: `${article.title} — Telyra` },
        { property: "og:description", content: article.excerpt },
        { property: "og:type", content: "article" },
        { name: "twitter:card", content: "summary_large_image" },
      ],
    };
  },
  component: ArticlePage,
  notFoundComponent: ArticleNotFound,
  errorComponent: ArticleNotFound,
});

function ArticlePage() {
  const { article, sourceUrl } = Route.useLoaderData() as { article: Article; sourceUrl: string | null };
  const related = byCategory(article.category)
    .filter((a) => a.slug !== article.slug)
    .slice(0, 3);

  return (
    <div className="min-h-screen font-sans text-foreground antialiased">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6 py-8 pb-20">
        <article className="glass overflow-hidden rounded-[min(1.5vw,20px)] ring-foreground/10 ring-1 animate-rise">
          <div className="relative">
            <img
              src={article.image}
              alt={article.imageAlt}
              width={1024}
              height={640}
              className="aspect-[21/9] w-full object-cover"
            />
            <span className="glass absolute top-4 left-4 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground">
              {article.category}
            </span>
          </div>
          <div className="p-7 md:p-10">
            <h1 className="font-display text-[clamp(2rem,3.6vw,3rem)] font-bold leading-[1.08] tracking-tight text-balance max-w-[24ch]">
              {article.title}
            </h1>
            <p className="mt-4 max-w-[60ch] text-pretty text-lg leading-relaxed text-muted-foreground">
              {article.excerpt}
            </p>
            <div className="mt-6 flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
              <span className="font-medium text-foreground">By {article.author}</span>
              <span>·</span>
              <span>{article.readTime} min read</span>
              <span>·</span>
              <span>{article.published}</span>
            </div>
          </div>
        </article>

        <div className="mx-auto mt-10 max-w-[68ch]">
          {article.body.map((paragraph, i) => (
            <p
              key={i}
              className={`mb-6 text-[17px] leading-relaxed text-foreground/90 ${
                i === 0
                  ? "first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:font-display first-letter:text-6xl first-letter:leading-[0.75] first-letter:font-bold first-letter:text-primary"
                  : ""
              }`}
            >
              {paragraph}
            </p>
          ))}
          <div className="mt-8 flex items-center gap-4 animate-fadein">
            <Link
              to="/"
              className="rounded-full bg-foreground px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-primary hover:text-primary-foreground"
            >
              Back to front page
            </Link>
            <Link
              to={CATEGORY_ROUTES[article.category]}
              className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
            >
              More in {article.category} →
            </Link>
            {sourceUrl && (
              <a
                href={sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="font-mono text-[11px] uppercase tracking-[0.2em] text-muted-foreground transition-colors hover:text-foreground"
              >
                Original source ↗
              </a>
            )}

          </div>
        </div>

        {related.length > 0 && (
          <div className="mt-16">
            <SectionDivider label={`More from ${article.category}`} />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
              {related.map((a, i) => (
                <ArticleImageCard key={a.slug} article={a} delay={i * 60} />
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

function ArticleNotFound() {
  return (
    <div className="min-h-screen font-sans text-foreground antialiased">
      <SiteHeader />
      <main className="mx-auto flex max-w-7xl flex-col items-start px-6 py-24">
        <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">404</p>
        <h1 className="mt-3 font-display text-4xl font-bold tracking-tight">This story has been moved or unpublished.</h1>
        <Link
          to="/"
          className="mt-8 rounded-full bg-foreground px-5 py-2.5 text-[11px] font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          Back to front page
        </Link>
      </main>
    </div>
  );
}
