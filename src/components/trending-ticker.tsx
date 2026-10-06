import { useQuery } from "@tanstack/react-query";
import { Link } from "@tanstack/react-router";
import { Flame } from "lucide-react";

import { LIVE_PREFIX } from "@/lib/live-articles";
import { listTrendingArticles, type TrendingRow } from "@/lib/live.functions";

const trendingQuery = {
  queryKey: ["trending-articles"],
  queryFn: () => listTrendingArticles(),
  staleTime: 60_000,
};

function Headline({ article }: { article: TrendingRow }) {
  return (
    <Link
      to="/article/$slug"
      params={{ slug: `${LIVE_PREFIX}${article.id}` }}
      className="trending-link"
    >
      <span>{article.title}</span>
      <span className="trending-views" aria-label={`${article.views} views`}>
        {article.views.toLocaleString()}
      </span>
    </Link>
  );
}

export function TrendingTicker() {
  const { data = [] } = useQuery(trendingQuery);
  if (data.length === 0) return null;

  return (
    <aside className="trending-bar" aria-label="Trending articles">
      <div className="mx-auto flex max-w-7xl items-stretch px-6">
        <div className="trending-label">
          <Flame aria-hidden className="size-3.5" />
          <span>Trending</span>
        </div>
        <div className="trending-viewport">
          <div className="trending-track">
            <div className="trending-set">
              {data.map((article) => <Headline key={article.id} article={article} />)}
            </div>
            <div className="trending-set" aria-hidden="true">
              {data.map((article) => <Headline key={`copy-${article.id}`} article={article} />)}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}