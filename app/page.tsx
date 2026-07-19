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
                  Doorstep delivery within 15 minutes of Oberlin{menu.deliveryDay ? `, every ${menu.deliveryDay}` : ""}.
                  Free, and I mean the doorstep: leave a note on the slip if the coffee should go somewhere
                  specific. Bryon will let you know when it&apos;s on the way.
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

      <section className="section" id="about">
        <div className="wrap">
          <p className="eyebrow">THE ROASTER</p>
          <h2>About Bryon</h2>
          <Reveal className="about-copy">
            <p>
              Every month Bryon picks three or four coffees worth knowing — and he never roasts the
              same one twice. Coffee is a harvest from a particular hillside in a particular year, and
              when it&apos;s gone, it&apos;s gone. So if you&apos;re hoping to find your one forever
              coffee, this is honestly the wrong place. If you like the idea of meeting a new one
              every month, you&apos;re home.
            </p>
            <p>
              He&apos;s been roasting for twenty years and still learns something new on a regular
              basis — that&apos;s half the fun. He isn&apos;t pretentious about coffee, no lectures,
              no gatekeeping. He just only drinks the good stuff, and only roasts what he&apos;d
              drink.
            </p>
            <p>
              Every coffee here comes with two invitations. <strong>Go there</strong> lifts you off
              the ground and sets you down in the place it grew — walk the streets, look around.{" "}
              <strong>Taste along</strong>{" "}
              opens the Tasting Key and helps you put words to
              what&apos;s in your cup, one easy question at a time.
            </p>
            <p className="about-closer">
              Either way, the idea is the same: we enjoy this together, and appreciate the craft of
              good coffee.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="section" id="faq">
        <div className="wrap">
          <p className="eyebrow">GOOD TO KNOW</p>
          <h2>Common questions</h2>
          <Reveal className="faq-list">
            <details className="faq-item">
              <summary>What ratio should I use when I brew?</summary>
              <p>
                Ratios are coffee to water, by weight, so a kitchen scale is the one gadget worth
                owning. If you only remember one number, make it <strong>1:16</strong> — about 25
                grams of coffee to 400 grams of water — and you&apos;ll get a lovely pour-over.
              </p>
              <p>
                By brewer: pour-over 1:15 to 1:17 (the wider ratio lets the delicate floral and
                fruit notes through), French press 1:12 to 1:15 (immersion brewing is gentler, so it
                wants a bit more coffee), AeroPress anywhere from 1:12 to 1:16, and cold brew
                concentrate a hefty 1:5 to 1:8. Espresso runs about 1:2, but that&apos;s a rabbit
                hole for another day.
              </p>
            </details>
            <details className="faq-item">
              <summary>What do &ldquo;washed&rdquo; and &ldquo;natural&rdquo; mean?</summary>
              <p>
                They describe how the fruit came off the bean, and it changes the flavor more than
                most people expect. A <strong>washed</strong>{" "}
                coffee has the fruit removed right
                away, then soaks clean in water tanks — the cup comes out crisp, bright, and true to
                the place it grew. A <strong>natural</strong>{" "}
                coffee dries inside the whole cherry
                for weeks in the sun, and all that fruit soaks in — heavier body, sweeter, often
                outright berry-like. If you ever taste blueberry in a coffee, that&apos;s usually a
                natural.
              </p>
            </details>
            <details className="faq-item">
              <summary>What is honey processed?</summary>
              <p>
                No bees involved. After the skin comes off, some of the sticky fruit layer — the
                &ldquo;honey&rdquo; — is left clinging to the bean while it dries. The result sits
                right between the other two styles: the clarity of a washed coffee with a good share
                of a natural&apos;s sweetness.
              </p>
            </details>
            <details className="faq-item">
              <summary>What is anaerobic fermentation?</summary>
              <p>
                The newest trick in the book. The coffee ferments in sealed tanks with no oxygen, so
                a different family of microbes does the work — and they leave behind creamy, complex,
                sometimes wonderfully funky tropical flavors that regular processing can&apos;t
                reach. When you see it on one of Bryon&apos;s bags, expect the boldest cup of the
                month.
              </p>
            </details>
            <details className="faq-item">
              <summary>What do the roast levels on the cards mean?</summary>
              <p>
                Roasting has landmarks you can hear. As the bean heats up it browns and builds
                flavor, and eventually the steam inside pops it open with an audible{" "}
                <strong>first crack</strong> — light roasts stop shortly after. Push further and the
                sugars caramelize toward a <strong>second crack</strong>, where roast flavor starts
                to speak louder than the bean itself. Bryon marks each coffee City (lighter, brighter),
                Full City (balanced, a touch of caramel), or Dark (bold and roasty) so you know where
                on that road it stopped.
              </p>
            </details>
            <details className="faq-item">
              <summary>How should I store my coffee?</summary>
              <p>
                A roasted bean is basically a dry sponge — it will happily absorb moisture and any
                smell in the neighborhood. Keep it sealed airtight, in a cool dark cupboard, as whole
                beans until you brew. Skip the fridge: it&apos;s damp, full of odors, and the
                in-and-out temperature swings make things worse. If you truly won&apos;t get to a bag
                for a month or more, the freezer works — sealed tight, and thaw the bag fully before
                opening it.
              </p>
            </details>
            <details className="faq-item">
              <summary>Why does it taste different a week after I got it?</summary>
              <p>
                Because it&apos;s alive, in a manner of speaking. Fresh-roasted coffee is full of
                carbon dioxide and spends its first days releasing it — brewed too soon it can taste
                a little sharp and unsettled. Bryon rests every roast a day before packing, and most
                coffees hit their stride somewhere between day four and two weeks, then slowly mellow
                from there. So the bag that tastes different on day ten isn&apos;t going bad —
                you&apos;re just meeting the same coffee at a different point in its life. It&apos;s
                a good excuse to pull up the Tasting Key more than once.
              </p>
            </details>
          </Reveal>
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
