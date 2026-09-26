import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/category-page";

export const Route = createFileRoute("/tech")({
  head: () => ({
    meta: [
      { title: "Tech — Telyra" },
      { name: "description", content: "Computing, chips, space, and the engineering bets that will define the next decade — technology coverage from Telyra." },
      { property: "og:title", content: "Tech — Telyra" },
      { property: "og:description", content: "Computing, chips, space, and the engineering bets that will define the next decade — technology coverage from Telyra." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CategoryPage category="Tech" />,
});
