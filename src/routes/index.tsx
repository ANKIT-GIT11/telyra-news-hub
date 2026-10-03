import { createFileRoute, Link } from "@tanstack/react-router";
import { queryOptions, useSuspenseQuery } from "@tanstack/react-query";
import { SiteHeader } from "@/components/site-header";
import { ArticleImageCard, SectionDivider } from "@/components/article-cards";
import { articles as mockArticles, type Article } from "@/lib/news-data";
import { listLiveArticles } from "@/lib/live.functions";
import { toArticle } from "@/lib/live-articles";
import { ArticleImage } from "@/components/article-image";

const liveQuery = queryOptions({
  queryKey: ["live-articles"],
  queryFn: () => listLiveArticles(),
});

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Telyra — Today's front page" },
      { name: "description", content: "The latest tech and AI stories from the Telyra newsroom, updated as they are published." },
      { property: "og:title", content: "Telyra — Today's front page" },
      { property: "og:description", content: "The latest tech and AI stories from the Telyra newsroom, updated as they are published." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  loader: ({ context }) => context.queryClient.ensureQueryData(liveQuery),
  component: Index,
  errorComponent: () => <div className="p-10 text-center text-muted-foreground">The front page couldn't load.</div>,
  notFoundComponent: () => <div className="p-10 text-center text-muted-foreground">Not found.</div>,
});

function Index() {
  const { data: rows } = useSuspenseQuery(liveQuery);
  const isLive = rows.length > 0;
  const list: Article[] = isLive ? rows.map((r, i) => toArticle(r, i)) : mockArticles;
  const hero = list[0] as Article;
  const trending = list.slice(1, 5);
  const grid = list.slice(isLive ? 1 : 5);

  return (
    <div className="min-h-screen font-sans text-foreground antialiased">
      <SiteHeader />
      <main className="mx-auto max-w-7xl px-6">
        <section className="grid grid-cols-12 gap-6 py-8">
          <div className="col-span-12 lg:col-span-8">
            <Link
              to="/article/$slug"
              params={{ slug: hero.slug }}
              className="group glass block overflow-hidden rounded-[min(1.5vw,20px)] ring-foreground/10 ring-1 animate-rise"
            >
              <div className="relative">
                <ArticleImage src={hero.image} alt={hero.imageAlt} seed={hero.slug} category={hero.category} width={1536} height={864} className="aspect-[16/9] w-full" />
                <span className="glass absolute top-4 left-4 rounded-full px-3 py-1 font-mono text-[10px] uppercase tracking-[0.2em] text-foreground">
                  {hero.category}
                </span>
              </div>
              <div className="p-7">
                <h1 className="font-display text-[clamp(2rem,4vw,3.25rem)] font-bold leading-[1.05] tracking-tight text-balance max-w-[20ch] transition-colors group-hover:text-primary">
                  {hero.title}
                </h1>
                <p className="mt-4 max-w-[52ch] text-pretty text-muted-foreground">{hero.excerpt}</p>
                <div className="mt-5 flex items-center gap-3 font-mono text-[11px] text-muted-foreground">
                  <span className="font-medium text-foreground">By {hero.author}</span>
                  <span>·</span>
                  <span>{hero.readTime} min read</span>
                  <span>·</span>
                  <span>{hero.published}</span>
                </div>
              </div>
            </Link>
          </div>

          <aside className="col-span-12 lg:col-span-4">
            <div className="glass h-full rounded-[min(1.5vw,20px)] p-6 ring-foreground/10 ring-1 animate-rise" style={{ animationDelay: "120ms" }}>
              <div className="mb-5 flex items-center justify-between">
                <h2 className="font-mono text-[11px] uppercase tracking-[0.2em] text-foreground">Latest</h2>
                <span className="font-mono text-[10px] text-muted-foreground">{isLive ? "Live" : "Preview"}</span>
              </div>
              <ol className="divide-y divide-border">
                {trending.map((article, i) => (
                  <li key={article.slug} className="flex gap-4 py-3">
                    <span className="font-display text-xl leading-none font-bold text-primary/70">{String(i + 1).padStart(2, "0")}</span>
                    <Link to="/article/$slug" params={{ slug: article.slug }} className="group/trend block">
                      <p className="text-sm leading-snug font-medium transition-colors group-hover/trend:text-primary">{article.title}</p>
                      <p className="mt-1 font-mono text-[10px] text-muted-foreground">
                        {article.category} · {article.readTime} min
                      </p>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          </aside>
        </section>

        {grid.length > 0 && (
          <section className="py-6 pb-16">
            <SectionDivider label="The newsroom" />
            <div className="grid grid-cols-12 gap-6">
              {grid.map((article, i) => (
                <div key={article.slug} className="col-span-12 md:col-span-4">
                  <ArticleImageCard article={article} delay={260 + i * 60} />
                </div>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
