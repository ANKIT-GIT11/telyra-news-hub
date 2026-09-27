import { CATEGORIES, articles as mock, type Article, type Category } from "@/lib/news-data";
import type { LiveRow } from "@/lib/live.functions";

export const LIVE_PREFIX = "live-";

function timeAgo(iso: string) {
  const mins = Math.max(1, Math.round((Date.now() - Date.parse(iso)) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** Maps a database row onto the card shape, borrowing editorial imagery from the demo set. */
export function toArticle(row: LiveRow, index = 0): Article {
  const category = (CATEGORIES as readonly string[]).includes(row.category) ? (row.category as Category) : "World";
  const pool = mock.filter((a) => a.category === category);
  const img = (pool.length ? pool : mock)[index % (pool.length || mock.length)] as Article;
  const body = row.content.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean);
  const words = row.content.split(/\s+/).length;
  return {
    slug: `${LIVE_PREFIX}${row.id}`,
    title: row.title,
    category,
    excerpt: row.subheadline ?? body[0] ?? "",
    author: "Telyra Desk",
    readTime: Math.max(1, Math.round(words / 220)),
    published: timeAgo(row.published_at),
    image: img.image,
    imageAlt: img.imageAlt,
    body,
    ...(row.affiliate_title && row.affiliate_url
      ? { affiliateTitle: row.affiliate_title, affiliateUrl: row.affiliate_url }
      : {}),
  };
}
