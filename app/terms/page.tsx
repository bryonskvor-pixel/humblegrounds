import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms · Humble Grounds",
  description: "The plain-language terms for ordering from Humble Grounds.",
};

export default function TermsPage() {
  return (
    <main>
      <header className="masthead">
        <h1>Terms</h1>
        <p className="subline">Humble Grounds &middot; Oberlin, Ohio</p>
      </header>

      <section className="section">
        <div className="wrap legal-copy">
          <p className="legal-updated">Last updated July 20, 2026.</p>

          <p>
            Humble Grounds is a one-person, small-batch coffee roaster in Oberlin, Ohio. These
            terms are short on purpose &mdash; this is a real coffee cart of a business, not a
            storefront with a legal department.
          </p>

          <h2>Ordering</h2>
          <p>
            Placing an order through the site sends Bryon a request &mdash; it is not an
            automatic, guaranteed sale. A coffee marked &ldquo;spoken for&rdquo; is sold out.
            Prices shown at the time you order are what you owe; Bryon will follow up to confirm
            details and arrange payment and delivery.
          </p>
          <p>
            Local doorstep delivery is offered within about 15 minutes of Oberlin on the delivery
            day noted on the site. Everywhere else ships via USPS. Delivery timing is
            best-effort, not guaranteed.
          </p>

          <h2>Payment</h2>
          <p>
            Payment is by Venmo or, for local delivery only, cash at the door. There is no
            on-site checkout or stored payment information &mdash; Humble Grounds never sees or
            handles your card details.
          </p>

          <h2>Coffee, freshness, and refunds</h2>
          <p>
            Every batch is roasted, rested, then packed and sent or delivered. Because it&apos;s a
            small, rotating harvest, once a coffee is gone it&apos;s gone until the next one
            comes around. If something arrives wrong or damaged, email Bryon and he&apos;ll make
            it right.
          </p>

          <h2>The site itself</h2>
          <p>
            The &ldquo;Go there&rdquo; origin journeys and the Tasting Key are offered for fun and
            for learning &mdash; they&apos;re not guaranteed to be perfectly accurate, and the
            underlying maps are provided by Mapbox and Google. Site content, photography, and
            writing belong to Humble Grounds unless noted otherwise.
          </p>
          <p>Please don&apos;t use the order or contact forms to send spam, abusive content, or anything unlawful.</p>

          <h2>Changes</h2>
          <p>
            These terms may be updated as the site grows. The &ldquo;last updated&rdquo; date at
            the top will change when they do. Continuing to use the site after a change means you
            accept the updated terms.
          </p>

          <h2>Questions</h2>
          <p>
            Email Bryon anytime at{" "}
            <a href="mailto:bryon@humblegrounds.coffee">bryon@humblegrounds.coffee</a>.
          </p>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap">
          <p>Roasted by Bryon in Oberlin, Ohio.</p>
          <p className="fine">
            <Link href="/">Back home</Link> ·{" "}
            <Link href="/privacy">Privacy</Link> ·{" "}
            <a href="mailto:bryon@humblegrounds.coffee">bryon@humblegrounds.coffee</a>
          </p>
        </div>
      </footer>
    </main>
  );
}
