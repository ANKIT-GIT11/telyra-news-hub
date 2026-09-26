import { createFileRoute } from "@tanstack/react-router";
import { CategoryPage } from "@/components/category-page";

export const Route = createFileRoute("/culture")({
  head: () => ({
    meta: [
      { title: "Culture — Telyra" },
      { name: "description", content: "Film, literature, design, and the long-form thinking underneath them — culture coverage from Telyra." },
      { property: "og:title", content: "Culture — Telyra" },
      { property: "og:description", content: "Film, literature, design, and the long-form thinking underneath them — culture coverage from Telyra." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: () => <CategoryPage category="Culture" />,
});
