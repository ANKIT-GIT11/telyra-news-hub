import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/category-page";

export const Route = createFileRoute("/business")({
  head: () => ({
    meta: [
      { title: "Business — Telyra" },
      { name: "description", content: "Markets, money, and the new economy — sharp business and finance coverage from Telyra." },
      { property: "og:title", content: "Business — Telyra" },
      { property: "og:description", content: "Markets, money, and the new economy — sharp business and finance coverage from Telyra." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CategoryPage category="Business" />,
});
