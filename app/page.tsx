import menuData from "@/content/menu.json";
import type { Menu } from "@/lib/types";
import Ordering from "@/components/Ordering";
import Opener from "@/components/Opener";
import { GroundStrip, MapPinGlyph, ParcelGlyph } from "@/components/Glyphs";

const menu = menuData as Menu;

export default function Home() {
  return (
    <main>
      <Opener />

      <header className="masthead">
        <h1 className="sr-only">Humble Grounds. So much good in a cup. Small-batch coffee, roasted in Oberlin, Ohio.</h1>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          className="masthead-logo"
          src="/logo-horizontal.jpg"
          alt=""
          width={1400}
          height={525}
          fetchPriority="high"
        />
        <p className="tagline">So Much Good in a Cup</p>
      </header>

      <Ordering menu={menu} />

      <section className="section" id="how-it-works">
        <div className="wrap">
          <p className="eyebrow">GETTING YOUR COFFEE</p>
          <h2>How to get it</h2>
          <div className="get-grid">
            <div className="get-panel">
              <MapPinGlyph />
              <div>
                <h3>Local</h3>
                <p>
                  Doorstep delivery within 15 minutes of Oberlin, every {menu.deliveryDay}. Free, and I mean the
                  doorstep: leave a note on the slip if the coffee should go somewhere specific.
                </p>
              </div>
            </div>
            <div className="get-panel">
              <ParcelGlyph />
              <div>
                <h3>Shipped</h3>
                <p>Everywhere else, via USPS. Roasted, rested a day, then packed and sent.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap">
          <p>Roasted by Bryon in Oberlin, Ohio.</p>
          <p className="fine">
            Venmo <a href={`https://venmo.com/u/${menu.venmo}`}>@{menu.venmo}</a> · CONTACT_EMAIL
          </p>
        </div>
        <GroundStrip className="ground-strip" />
      </footer>
    </main>
  );
}
