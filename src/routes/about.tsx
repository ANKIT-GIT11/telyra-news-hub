import { createFileRoute, Link } from "@tanstack/react-router";
import { CONTACT_EMAIL, InfoPage } from "@/components/info-page";

const T = "About Telyra — Independent tech and AI newsroom";
const D = "Telyra's mission: clear, accurate coverage of AI, software, hardware, security and the digital infrastructure behind them, written for readers and reviewed by human editors.";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: T },
      { name: "description", content: D },
      { property: "og:title", content: T },
      { property: "og:description", content: D },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://telyra.app/about" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <InfoPage
      kicker="About us"
      title="Signal over noise"
      lead="Telyra is an independent digital newsroom covering technology, software, AI and the infrastructure that runs behind them."
    >
      <h2>Our mission</h2>
      <p>
        Technology moves faster than most coverage can explain. Telyra exists to make it legible: we follow
        the day's most important developments in AI, software, hardware, security and cloud infrastructure,
        and publish them as short, accurate stories that respect your time. No hype, no press-release copy,
        no filler.
      </p>

      <h2>What we cover</h2>
      <ul>
        <li>
          <strong>AI and machine learning</strong> — model releases, research, tooling and the companies
          building them.
        </li>
        <li>
          <strong>Software and developer tools</strong> — platforms, frameworks, open-source projects and
          pricing changes that affect the people who build.
        </li>
        <li>
          <strong>Hardware and chips</strong> — silicon, devices and the supply chain behind them.
        </li>
        <li>
          <strong>Security and privacy</strong> — breaches, vulnerabilities and regulation, and what they
          mean in practice.
        </li>
        <li>
          <strong>Commerce and infrastructure</strong> — payments, cloud and the services the modern internet
          quietly depends on.
        </li>
      </ul>

      <h2>How a story reaches you</h2>
      <ol>
        <li>We watch a small set of trusted primary sources around the clock.</li>
        <li>
          AI tools turn the most relevant items into a clean draft in Telyra's house style, with no facts
          invented.
        </li>
        <li>
          A human editor checks the details, adds context, decides what runs, and links every story back to
          its original source.
        </li>
        <li>If we get something wrong, we correct it — tell us and we will fix it.</li>
      </ol>

      <h2>Independence and affiliate links</h2>
      <p>
        Some stories carry a "Related Tools" panel with affiliate links. If you buy through one, we may earn
        a commission at no extra cost to you. Partners never choose what we cover or what we say, and every
        affiliate placement is disclosed on the page where it appears.
      </p>

      <h2>Policies at a glance</h2>
      <p>
        A plain-language summary of the rules we run the site by. The full text lives in our{" "}
        <Link to="/privacy">Privacy Policy</Link> and <Link to="/terms">Terms of Service</Link>.
      </p>
      <ul>
        <li>
          <strong>What we collect:</strong> your email address if you subscribe to the briefing, plus
          standard technical logs used to keep the site secure and working.
        </li>
        <li>
          <strong>Cookies:</strong> essential cookies and local storage. If we run advertising or analytics,
          third-party vendors — including Google — may set cookies to serve and measure ads based on your
          prior visits.
        </li>
        <li>
          <strong>Your data:</strong> we do not sell it, and we do not use it to train AI models.
        </li>
        <li>
          <strong>Your choices:</strong> see, correct or delete the data we hold on you, or unsubscribe from
          the briefing, at any time by emailing{" "}
          <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
        </li>
      </ul>

      <div className="info-note">
        <strong>Who runs Telyra:</strong> an independent editorial team. For anything about the site —
        advertising, corrections, partnerships or data requests — write to{" "}
        <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>.
      </div>
    </InfoPage>
  );
}
