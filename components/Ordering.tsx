"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import type { Coffee, ColdBrew, Menu, OrderItem } from "@/lib/types";
import { BeanGlyph, JarGlyph } from "./Glyphs";
import { useCardFx } from "@/lib/useCardFx";
import { useMagnetic } from "@/lib/useMagnetic";

// mapbox-gl only downloads when someone actually taps "Go there"
const JourneyMap = dynamic(() => import("./JourneyMap"), { ssr: false });

function priceLabel(price: number | null) {
  return price === null ? "$—" : `$${price.toFixed(2)}`;
}

function RoastRow({ level }: { level: number }) {
  return (
    <div className="roast-row" aria-label={`Roast level ${level} of 5`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.max(0, Math.min(1, level - i));
        return <BeanGlyph key={i} filled={fill >= 0.75 ? 1 : fill >= 0.25 ? 0.5 : 0} className="bean" />;
      })}
      <span className="roast-label" style={{ color: "var(--roast)" }}>
        {level <= 2.5 ? "City" : level <= 3.5 ? "Full City" : "Dark"}
      </span>
    </div>
  );
}

function CoffeeCard({
  coffee,
  index,
  onOrder,
  onGoThere,
}: {
  coffee: Coffee;
  index: number;
  onOrder: (slug: string, name: string) => void;
  onGoThere: (coffee: Coffee) => void;
}) {
  const { ref, visible, onPointerMove, onPointerLeave } = useCardFx<HTMLElement>();
  const goThereRef = useMagnetic<HTMLButtonElement>(10);
  const orderRef = useMagnetic<HTMLButtonElement>(8);

  return (
    <article
      ref={ref}
      className={`plate-card${visible ? " reveal-visible" : ""}`}
      style={{ transitionDelay: `${Math.min(index, 5) * 70}ms` }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {coffee.soldOut && <span className="spoken-for">SPOKEN FOR</span>}
      <div className="plate-art">
        {coffee.plate ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={coffee.plate} alt={`Illustrated plate of ${coffee.name}`} />
        ) : (
          <BeanGlyph filled={0} />
        )}
      </div>
      <h3>{coffee.name}</h3>
      <p className="origin-line">
        {[coffee.origin, coffee.station, coffee.elevation].filter(Boolean).join(" · ")}
      </p>
      {coffee.journey && (
        <button ref={goThereRef} className="go-there" onClick={() => onGoThere(coffee)}>
          Go there →
        </button>
      )}
      {coffee.processNote && <p className="process-note">{coffee.processNote}</p>}
      <p className="tasting-notes">{coffee.notes.join(" · ")}</p>
      <RoastRow level={coffee.roastLevel} />
      <div className="plate-foot">
        <span className="price">{priceLabel(coffee.price)}</span>
        <button
          ref={orderRef}
          className="order-btn"
          disabled={coffee.soldOut}
          onClick={() => onOrder(coffee.slug, coffee.name)}
        >
          Order this
        </button>
      </div>
    </article>
  );
}

function ColdBrewCard({
  coldBrew,
  index,
  onOrder,
}: {
  coldBrew: ColdBrew;
  index: number;
  onOrder: (slug: string, name: string) => void;
}) {
  const { ref, visible, onPointerMove, onPointerLeave } = useCardFx<HTMLElement>();
  const orderRef = useMagnetic<HTMLButtonElement>(8);

  return (
    <article
      ref={ref}
      className={`plate-card cold-brew${visible ? " reveal-visible" : ""}`}
      style={{ transitionDelay: `${Math.min(index, 5) * 70}ms` }}
      onPointerMove={onPointerMove}
      onPointerLeave={onPointerLeave}
    >
      {coldBrew.soldOut && <span className="spoken-for">SPOKEN FOR</span>}
      {coldBrew.header ? (
        <div className="plate-art">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={coldBrew.header} alt="" />
        </div>
      ) : (
        <div className="plate-art">
          {coldBrew.plate ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={coldBrew.plate} alt={`Illustrated jar of ${coldBrew.name}`} />
          ) : (
            <JarGlyph />
          )}
        </div>
      )}
      <h3>{coldBrew.name}</h3>
      <p className="tasting-notes">{coldBrew.notes.join(" · ")}</p>
      {coldBrew.aboutFarm
        ? coldBrew.aboutFarm.split("\n\n").map((para, i) => (
            <p className="process-note" key={i}>
              {para}
            </p>
          ))
        : (
            <p className="process-note">Brewed once, in one batch. When it is gone it is gone until next time.</p>
          )}
      <div className="plate-foot">
        <span className="price">{priceLabel(coldBrew.price)}</span>
        <button
          ref={orderRef}
          className="order-btn"
          disabled={coldBrew.soldOut}
          onClick={() => onOrder(coldBrew.slug, coldBrew.name)}
        >
          Order this
        </button>
      </div>
    </article>
  );
}

export default function Ordering({ menu }: { menu: Menu }) {
  const [items, setItems] = useState<OrderItem[]>([]);
  const [slipOpen, setSlipOpen] = useState(false);
  const [name, setName] = useState("");
  const [delivery, setDelivery] = useState<"local" | "ship">("local");
  const [address, setAddress] = useState("");
  const [payment, setPayment] = useState<"venmo" | "cash">("venmo");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [error, setError] = useState("");
  const [journeyCoffee, setJourneyCoffee] = useState<Coffee | null>(null);

  function addItem(slug: string, itemName: string) {
    setItems((prev) => {
      const existing = prev.find((i) => i.slug === slug);
      if (existing) {
        return prev.map((i) => (i.slug === slug ? { ...i, qty: i.qty + 1 } : i));
      }
      return [...prev, { slug, name: itemName, qty: 1 }];
    });
    setSlipOpen(true);
    setStatus("idle");
  }

  function changeQty(slug: string, delta: number) {
    setItems((prev) =>
      prev
        .map((i) => (i.slug === slug ? { ...i, qty: i.qty + delta } : i))
        .filter((i) => i.qty > 0)
    );
  }

  async function submit() {
    setError("");
    if (items.length === 0) {
      setError("The slip is empty. Add a coffee first.");
      return;
    }
    if (!name.trim()) {
      setError("A name, so the right person gets the right coffee.");
      return;
    }
    if (!address.trim()) {
      setError(delivery === "local" ? "Drop instructions or an address, please." : "A shipping address, please.");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items, name: name.trim(), delivery, address: address.trim(), payment }),
      });
      if (!res.ok) throw new Error(`order endpoint returned ${res.status}`);
      setStatus("sent");
    } catch {
      setStatus("error");
      setError("Something hiccuped sending the order. Try once more, or just text Bryon.");
    }
  }

  const cashAllowed = delivery === "local";
  const itemCount = items.reduce((n, i) => n + i.qty, 0);

  return (
    <>
      <section className="section" id="this-month">
        <div className="wrap">
          <p className="eyebrow">
            {menu.monthLabel} · BATCH NOTES
          </p>
          <h2>This Month</h2>
          <div className="plate-grid">
            {menu.coffees.map((coffee, index) => (
              <CoffeeCard
                key={coffee.slug}
                coffee={coffee}
                index={index}
                onOrder={addItem}
                onGoThere={setJourneyCoffee}
              />
            ))}
            <ColdBrewCard coldBrew={menu.coldBrew} index={menu.coffees.length} onOrder={addItem} />
          </div>
        </div>
      </section>

      {journeyCoffee && <JourneyMap coffee={journeyCoffee} onClose={() => setJourneyCoffee(null)} />}

      {!slipOpen && itemCount > 0 && (
        <button className="slip-fab" onClick={() => setSlipOpen(true)}>
          Order slip · {itemCount}
        </button>
      )}

      {slipOpen && (
        <>
          <div className="slip-backdrop" onClick={() => setSlipOpen(false)} />
          <div className="order-slip" role="dialog" aria-label="Order slip">
            {status === "sent" ? (
              <div className="slip-confirm">
                <h2>Got it.</h2>
                <p>
                  Venmo @{menu.venmo} when you&apos;re ready
                  {delivery === "local" ? `, or have cash at the door ${menu.deliveryDay}.` : "."}
                </p>
                <a className="venmo-link" href={`https://venmo.com/u/${menu.venmo}`}>
                  Open Venmo
                </a>
                <div className="slip-actions">
                  <button
                    className="close-btn"
                    onClick={() => {
                      setSlipOpen(false);
                      setItems([]);
                      setStatus("idle");
                    }}
                  >
                    Close
                  </button>
                </div>
              </div>
            ) : (
              <>
                <h2>Order slip</h2>
                <ul className="slip-items">
                  {items.length === 0 && <li>Nothing on the slip yet.</li>}
                  {items.map((item) => (
                    <li key={item.slug}>
                      <span className="item-name">{item.name}</span>
                      <button className="qty-btn" aria-label={`One fewer ${item.name}`} onClick={() => changeQty(item.slug, -1)}>
                        −
                      </button>
                      <span>{item.qty}</span>
                      <button className="qty-btn" aria-label={`One more ${item.name}`} onClick={() => changeQty(item.slug, 1)}>
                        +
                      </button>
                    </li>
                  ))}
                </ul>

                <label htmlFor="slip-name">NAME</label>
                <input id="slip-name" type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />

                <label>GETTING IT</label>
                <div className="radio-row">
                  <label>
                    <input
                      type="radio"
                      name="delivery"
                      checked={delivery === "local"}
                      onChange={() => setDelivery("local")}
                    />
                    Doorstep, {menu.deliveryDay} (near Oberlin)
                  </label>
                  <label>
                    <input
                      type="radio"
                      name="delivery"
                      checked={delivery === "ship"}
                      onChange={() => {
                        setDelivery("ship");
                        setPayment("venmo");
                      }}
                    />
                    Ship it
                  </label>
                </div>

                <label htmlFor="slip-address">
                  {delivery === "local" ? "ADDRESS / DROP INSTRUCTIONS" : "SHIPPING ADDRESS"}
                </label>
                <textarea id="slip-address" rows={3} value={address} onChange={(e) => setAddress(e.target.value)} />

                <label>PAYING BY</label>
                <div className="radio-row">
                  <label>
                    <input type="radio" name="payment" checked={payment === "venmo"} onChange={() => setPayment("venmo")} />
                    Venmo
                  </label>
                  <label style={{ opacity: cashAllowed ? 1 : 0.45 }}>
                    <input
                      type="radio"
                      name="payment"
                      disabled={!cashAllowed}
                      checked={payment === "cash"}
                      onChange={() => setPayment("cash")}
                    />
                    Cash at the door {cashAllowed ? "" : "(local only)"}
                  </label>
                </div>

                {error && <p className="slip-error">{error}</p>}

                <div className="slip-actions">
                  <button className="order-btn" onClick={submit} disabled={status === "sending"}>
                    {status === "sending" ? "Sending…" : "Send the order"}
                  </button>
                  <button className="close-btn" onClick={() => setSlipOpen(false)}>
                    Keep browsing
                  </button>
                </div>
              </>
            )}
          </div>
        </>
      )}
    </>
  );
}
