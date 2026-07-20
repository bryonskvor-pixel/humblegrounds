import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy · Humble Grounds",
  description: "How Humble Grounds handles the information you share.",
};

export default function PrivacyPage() {
  return (
    <main>
      <header className="masthead">
        <h1>Privacy</h1>
        <p className="subline">Humble Grounds &middot; Oberlin, Ohio</p>
      </header>

      <section className="section">
        <div className="wrap legal-copy">
          <p className="legal-updated">Last updated July 20, 2026.</p>

          <p>
            Humble Grounds is a one-person, small-batch coffee roaster. This page explains, in
            plain language, what happens to the information you share when you order coffee, ask
            a question, or share tasting notes.
          </p>

          <h2>What is collected</h2>
          <p>Only what you type into a form, and only when you submit it:</p>
          <ul>
            <li>
              <strong>Ordering</strong>: name, email, delivery or shipping address, what you
              ordered, and how you plan to pay.
            </li>
            <li>
              <strong>Asking a question</strong>: name, email, and your message.
            </li>
            <li>
              <strong>Tasting notes</strong>: the flavors you keyed out, and optionally your name
              and a comment. Every field there is optional except the notes themselves.
            </li>
          </ul>
          <p>
            The site does not use cookies, analytics, or tracking scripts, and there is no
            account or login.
          </p>

          <h2>How it is used</h2>
          <p>
            Everything you submit is emailed directly to Bryon so he can fulfill your order,
            answer your question, or read your tasting notes. If you leave an email address on an
            order, you also get a short confirmation email. Nothing is used for advertising, and
            nothing is sold.
          </p>

          <h2>Who sees it</h2>
          <p>These services help run the site and see only what is needed to do their job:</p>
          <ul>
            <li>
              <strong>Resend</strong> delivers the emails your form submissions generate.
            </li>
            <li>
              <strong>Vercel</strong> hosts the site and may log basic request data (like IP
              address) as part of normal web server operation.
            </li>
            <li>
              <strong>Mapbox</strong> and <strong>Google Maps</strong> power the &ldquo;Go
              there&rdquo; origin journeys and street-level views. Loading those maps sends a
              request to their servers the same way any embedded map would.
            </li>
          </ul>
          <p>No submitted form data is shared with anyone beyond what fulfilling your request requires.</p>

          <h2>How long it&apos;s kept</h2>
          <p>
            Order and message emails live in Bryon&apos;s inbox as long as any other email would.
            There is no separate database. If you&apos;d like your information deleted from past
            emails, just ask.
          </p>

          <h2>Your choices</h2>
          <p>
            You can always email Bryon directly instead of using a form, skip the optional name
            and comment fields on tasting notes, or ask him to delete anything you&apos;ve sent
            in. Reach him at{" "}
            <a href="mailto:bryon@humblegrounds.coffee">bryon@humblegrounds.coffee</a>.
          </p>

          <h2>Changes</h2>
          <p>
            If this page changes, the &ldquo;last updated&rdquo; date at the top will change with
            it.
          </p>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap">
          <p>Roasted by Bryon in Oberlin, Ohio.</p>
          <p className="fine">
            <Link href="/">Back home</Link> ·{" "}
            <Link href="/terms">Terms</Link> ·{" "}
            <a href="mailto:bryon@humblegrounds.coffee">bryon@humblegrounds.coffee</a>
          </p>
        </div>
      </footer>
    </main>
  );
}
