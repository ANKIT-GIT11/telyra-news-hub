import { createFileRoute } from "@tanstack/react-router";
import { CONTACT_EMAIL, InfoPage } from "@/components/info-page";

const T = "Contact Telyra";
const D = "Get in touch with the Telyra newsroom for tips, corrections, partnerships or privacy requests.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: T }, { name: "description", content: D },
      { property: "og:title", content: T }, { property: "og:description", content: D },
      { property: "og:type", content: "website" }, { name: "twitter:card", content: "summary" },
    ],
  }),
  component: () => (
    <InfoPage kicker="Contact us" title="Talk to the newsroom">
      <p>We read every message. Email us at <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we'll reply as soon as we can.</p>
      <ul>
        <li><strong>News tips:</strong> send us the story and any links.</li>
        <li><strong>Corrections:</strong> tell us the article and what needs fixing.</li>
        <li><strong>Partnerships and advertising:</strong> tell us about your product.</li>
        <li><strong>Privacy requests:</strong> to see or delete your data, or unsubscribe.</li>
      </ul>
    </InfoPage>
  ),
});
