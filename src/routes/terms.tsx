import { createFileRoute } from "@tanstack/react-router";
import { CONTACT_EMAIL, InfoPage } from "@/components/info-page";

const T = "Terms of Service — Telyra";
const D = "The terms that apply when you read, share or subscribe to Telyra.";

export const Route = createFileRoute("/terms")({
  head: () => ({
    meta: [
      { title: T }, { name: "description", content: D },
      { property: "og:title", content: T }, { property: "og:description", content: D },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <InfoPage kicker="Legal" title="Terms of Service" updated="1 October 2026">
      <p>By using Telyra you agree to these terms. If you do not agree, please do not use the site.</p>
      <h2>Content</h2>
      <p>Telyra's articles, design and branding belong to Telyra unless stated otherwise. You may share links and short quotes with credit. You may not republish full articles without permission.</p>
      <h2>Accuracy</h2>
      <p>We work hard to be accurate, but stories are for general information only, not professional, financial or legal advice. Some stories are drafted with AI help and checked by an editor. If you spot an error, please tell us.</p>
      <h2>Affiliate links and third parties</h2>
      <p>Some pages link to outside sites, including affiliate partners. We are not responsible for their content, products or policies.</p>
      <h2>Newsletter</h2>
      <p>By subscribing you agree to receive emails from Telyra. You can unsubscribe at any time.</p>
      <h2>Liability</h2>
      <p>Telyra is provided "as is". To the extent the law allows, we are not liable for losses arising from your use of the site.</p>
      <h2>Contact</h2>
      <p>Questions about these terms: <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.</p>
    </InfoPage>
  ),
});
