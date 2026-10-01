import { createFileRoute } from "@tanstack/react-router";
import { CONTACT_EMAIL, InfoPage } from "@/components/info-page";

const T = "Privacy Policy — Telyra";
const D = "How Telyra collects, uses and protects your data, including cookies and our AI-assisted editorial process.";

export const Route = createFileRoute("/privacy")({
  head: () => ({
    meta: [
      { title: T }, { name: "description", content: D },
      { property: "og:title", content: T }, { property: "og:description", content: D },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <InfoPage kicker="Legal" title="Privacy Policy" updated="1 October 2026">
      <p>Telyra respects your privacy. This policy explains what we collect when you read Telyra or subscribe to our briefing, and how we use it.</p>
      <h2>What we collect</h2>
      <ul>
        <li><strong>Newsletter sign-ups:</strong> your email address and the time you subscribed.</li>
        <li><strong>Technical data:</strong> standard server logs such as browser type and pages visited, used to keep the site secure and working.</li>
      </ul>
      <h2>Cookies</h2>
      <p>We use only essential cookies and local storage needed to run the site, such as keeping editors signed in. If we add analytics or advertising cookies in future, we will update this policy and ask for consent where the law requires it.</p>
      <h2>AI-assisted editorial workflow</h2>
      <p>Some Telyra stories start from public news sources and are drafted with the help of AI writing tools. Every AI-assisted draft is reviewed by a human editor before it is published. Each such story links to its original source. We do not use your personal data to train AI models.</p>
      <h2>Affiliate links</h2>
      <p>Some stories include "Related Tools" links. If you buy through them, we may earn a commission at no extra cost to you. Partners may set their own cookies once you leave Telyra.</p>
      <h2>Your rights</h2>
      <p>You can ask us to see, correct or delete your data, or unsubscribe at any time, by emailing <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
      <h2>Changes</h2>
      <p>We may update this policy from time to time. The date above shows the latest version.</p>
    </InfoPage>
  ),
});
