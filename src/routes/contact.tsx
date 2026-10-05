import { createFileRoute, Link } from "@tanstack/react-router";
import { CONTACT_EMAIL, InfoPage } from "@/components/info-page";

const T = "Contact Telyra — Tips, corrections and privacy requests";
const D = "Email the Telyra newsroom at contact.telyra2026@gmail.com for news tips, corrections, partnerships, advertising or privacy and data requests.";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://telyra.app/contact" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  return (
    <InfoPage
      kicker="Contact"
      title="Talk to the newsroom"
      lead="One inbox, read by real editors. Tips, corrections, partnership pitches and privacy requests all land in the same place."
    >
      <div className="info-cta">
        <div>
          <p className="info-cta-label">Email the newsroom</p>
          <a className="info-cta-mail" href={`mailto:${CONTACT_EMAIL}`}>
            {CONTACT_EMAIL}
          </a>
          <p className="info-cta-sub">We read every message and reply as soon as we can.</p>
        </div>
        <a className="info-cta-btn" href={`mailto:${CONTACT_EMAIL}`}>
          Write to us
        </a>
      </div>

      <h2>What to send us</h2>
      <ul>
        <li>
          <strong>News tips</strong> — the story, any links, and whether you would like to stay anonymous.
        </li>
        <li>
          <strong>Corrections</strong> — the article and what needs fixing. We update published stories when
          we are wrong.
        </li>
        <li>
          <strong>Partnerships and advertising</strong> — tell us about your product, campaign or audience.
        </li>
        <li>
          <strong>Privacy requests</strong> — to see, correct or delete the data we hold on you, or to
          unsubscribe from the briefing.
        </li>
        <li>
          <strong>Press and media</strong> — we are happy to be quoted or to give comment on technology and
          AI coverage.
        </li>
      </ul>

      <h2>Newsletter and unsubscribing</h2>
      <p>
        Every Telyra email carries an unsubscribe link. If you would rather we delete your address outright,
        reply to any message or write to{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a> and we will confirm once it is gone.
      </p>

      <h2>Privacy and legal</h2>
      <p>
        We keep personal data to a minimum: the email address you subscribe with, and standard technical
        logs. We do not sell it. Full details — including cookies, our AI-assisted editorial process and
        third-party advertising — are in our <Link to="/privacy">Privacy Policy</Link>, and the rules for
        using the site are in our <Link to="/terms">Terms of Service</Link>.
      </p>

      <div className="info-note">
        <strong>Response times:</strong> we do not promise a fixed window, but every message is read and
        anything urgent — a correction or a legal request — should say so in the subject line so it reaches
        the right editor first.
      </div>
    </InfoPage>
  );
}
