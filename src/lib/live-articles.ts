import { CATEGORIES, type Article, type Category } from "@/lib/news-data";
import type { LiveRow } from "@/lib/live.functions";

export const LIVE_PREFIX = "live-";

function timeAgo(iso: string) {
  const mins = Math.max(1, Math.round((Date.now() - Date.parse(iso)) / 60000));
  if (mins < 60) return `${mins}m ago`;
  const h = Math.round(mins / 60);
  if (h < 24) return `${h}h ago`;
  return new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });
}

/** Maps a database row onto the card shape, with exactly one (fallback) image. */
export function toArticle(row: LiveRow, _index = 0): Article {
  const category = (CATEGORIES as readonly string[]).includes(row.category) ? (row.category as Category) : "World";
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
    image: "", // no source image stored — ArticleImage renders the abstract fallback
    imageAlt: row.title,
    body,
    views: row.views,
    ...(row.editor_note ? { editorNote: row.editor_note } : {}),
    ...(row.affiliate_title && row.affiliate_url
      ? { affiliateTitle: row.affiliate_title, affiliateUrl: row.affiliate_url }
      : {}),
  };
}
