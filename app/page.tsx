import menuData from "@/content/menu.json";
import type { Menu } from "@/lib/types";
import Ordering from "@/components/Ordering";
import Opener from "@/components/Opener";
import Reveal from "@/components/Reveal";
import AmbientFloat from "@/components/AmbientFloat";
import ContactForm from "@/components/ContactForm";
import { GroundStrip, MapPinGlyph, ParcelGlyph } from "@/components/Glyphs";

// unknown hop: JSON imports type tuple fields ([lng, lat]) as number[]
const menu = menuData as unknown as Menu;

export default function Home() {
  return (
    <main>
      <Opener />

      <header className="masthead">
        <AmbientFloat />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="masthead-glyph"
          src="/assets/brand/mark-square.png"
          alt=""
          width={1200}
          height={1200}
          fetchPriority="high"
        />
        <h1>Humble Grounds</h1>
        <p className="subline">Small-batch coffee &middot; Oberlin, Ohio</p>
        <p className="tagline">
          so much <em className="glow-good">good</em> in a cup
          <span className="tagline-spark" aria-hidden="true">
            &#10022;
          </span>
        </p>
      </header>

      <Ordering menu={menu} />

      <section className="section" id="how-it-works">
        <div className="wrap">
          <p className="eyebrow">GETTING YOUR COFFEE</p>
          <h2>How to get it</h2>
          <div className="get-grid">
            <Reveal className="get-panel">
              <MapPinGlyph />
              <div>
                <h3>Local</h3>
                <p>
                  Doorstep delivery within 15 minutes of Oberlin, every {menu.deliveryDay}. Free, and I mean the
                  doorstep: leave a note on the slip if the coffee should go somewhere specific.
                </p>
              </div>
            </Reveal>
            <Reveal className="get-panel" delay={90}>
              <ParcelGlyph />
              <div>
                <h3>Shipped</h3>
                <p>Everywhere else, via USPS. Roasted, rested a day, then packed and sent.</p>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="section" id="questions">
        <div className="wrap">
          <p className="eyebrow">QUESTIONS</p>
          <h2>Ask Bryon</h2>
          <Reveal>
            <p className="contact-lede">
              If you have any questions, you can email Bryon at{" "}
              <a href="mailto:bryon@humblegrounds.coffee">bryon@humblegrounds.coffee</a> or fill out this
              short form and he will be in touch.
            </p>
            <ContactForm />
          </Reveal>
        </div>
      </section>

      <footer className="footer">
        <Reveal className="wrap">
          <p>Roasted by Bryon in Oberlin, Ohio.</p>
          <p className="fine">
            Venmo <a href={`https://venmo.com/u/${menu.venmo}`}>@{menu.venmo}</a> ·{" "}
            <a href="mailto:bryon@humblegrounds.coffee">bryon@humblegrounds.coffee</a>
          </p>
        </Reveal>
        <GroundStrip className="ground-strip" />
      </footer>
    </main>
  );
}
