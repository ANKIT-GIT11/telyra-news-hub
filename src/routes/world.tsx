import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/category-page";

export const Route = createFileRoute("/world")({
  head: () => ({
    meta: [
      { title: "World — Telyra" },
      { name: "description", content: "Global dispatches, conflict and diplomacy, climate and cities — on-the-ground world reporting from Telyra." },
      { property: "og:title", content: "World — Telyra" },
      { property: "og:description", content: "Global dispatches, conflict and diplomacy, climate and cities — on-the-ground world reporting from Telyra." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CategoryPage category="World" />,
});
