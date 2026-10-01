import { createFileRoute } from "@tanstack/react-router";
import { InfoPage } from "@/components/info-page";

const T = "About Telyra — Tech and AI news, edited by people";
const D = "Telyra is a digital newsroom covering technology, software, AI and digital infrastructure.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: T }, { name: "description", content: D },
      { property: "og:title", content: T }, { property: "og:description", content: D },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <InfoPage kicker="About us" title="Signal over noise">
      <p>Telyra is a digital newsroom for technology, software, AI and the infrastructure behind them. We follow the day's most important tech stories and explain why they matter.</p>
      <h2>How we work</h2>
      <p>We monitor trusted tech sources around the clock. AI tools help us turn the most relevant stories into clear drafts. A human editor reviews every draft, adds context, and decides what gets published. Every story links back to its original source.</p>
      <h2>Independence</h2>
      <p>Some stories recommend tools through affiliate links, which help fund our work. Partners never decide what we cover or what we say.</p>
    </InfoPage>
  ),
});
