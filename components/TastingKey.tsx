"use client";

import { useEffect, useState, type ReactElement, type ReactNode } from "react";
import type { Coffee, TastingNote } from "@/lib/types";

// The Tasting Key: a deconstructed flavor wheel the taster walks one easy
// question at a time, opened from a coffee card so the coffee name rides
// along with anything they share. Ported from the standalone HTML prototype;
// the flavor tree below is the whole "wheel".

type Leaf = { leaf: true; name: string; calibrate: string; note: string };
type Choice = { lab: string; hint?: string; g: string; to: string | Leaf };
type KeyNode = { prompt: string; choices: Choice[] };
type Found = { name: string; when: string | null; temp: string | null };

function Glyph({ children }: { children: ReactNode }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.4" aria-hidden="true">
      {children}
    </svg>
  );
}

const GLYPHS: Record<string, ReactElement> = {
  berry: (
    <Glyph>
      <path d="M12 3v3.5" />
      <circle cx="9" cy="12" r="3.1" />
      <circle cx="15" cy="12" r="3.1" />
      <circle cx="12" cy="17" r="3.1" />
    </Glyph>
  ),
  citrus: (
    <Glyph>
      <circle cx="12" cy="12" r="8" />
      <path d="M12 4v16M4 12h16M6 6l12 12M18 6L6 18" />
    </Glyph>
  ),
  stone: (
    <Glyph>
      <circle cx="12" cy="12" r="8" />
      <ellipse cx="12" cy="12" rx="2.6" ry="4" />
    </Glyph>
  ),
  dried: (
    <Glyph>
      <path d="M6 10c0-3 3-5 6-5s6 2 6 5c0 5-3 9-6 9s-6-4-6-9z" />
      <path d="M9 9c1 1.5 1 4 0 5M15 9c-1 1.5-1 4 0 5" />
    </Glyph>
  ),
  tropical: (
    <Glyph>
      <path d="M12 21c5-4 8-9 8-14-4 0-7 2-8 5-1-3-4-5-8-5 0 5 3 10 8 14z" />
    </Glyph>
  ),
  flower: (
    <Glyph>
      <circle cx="12" cy="12" r="2.4" />
      <ellipse cx="12" cy="5.5" rx="2.1" ry="3.1" />
      <ellipse cx="12" cy="18.5" rx="2.1" ry="3.1" />
      <ellipse cx="5.5" cy="12" rx="3.1" ry="2.1" />
      <ellipse cx="18.5" cy="12" rx="3.1" ry="2.1" />
    </Glyph>
  ),
  drop: (
    <Glyph>
      <path d="M12 3c4 6 6 9 6 12a6 6 0 0 1-12 0c0-3 2-6 6-12z" />
    </Glyph>
  ),
  bean: (
    <Glyph>
      <ellipse cx="12" cy="12" rx="6.5" ry="9" />
      <path d="M12 4c-2 5 2 11 0 16" />
    </Glyph>
  ),
  leaf: (
    <Glyph>
      <path d="M5 19c0-8 6-14 14-14 0 8-6 14-14 14z" />
      <path d="M5 19C9 15 13 11 19 5" />
    </Glyph>
  ),
  spice: (
    <Glyph>
      <path d="M12 3l2 5 5 1-3.5 3.5L16 18l-4-2.5L8 18l.5-5.5L5 9l5-1z" />
    </Glyph>
  ),
  bubbles: (
    <Glyph>
      <circle cx="9" cy="15" r="3" />
      <circle cx="15" cy="17" r="2" />
      <circle cx="14" cy="9" r="2.4" />
      <circle cx="8" cy="8" r="1.6" />
    </Glyph>
  ),
  dot: (
    <Glyph>
      <circle cx="12" cy="12" r="7" />
      <circle cx="12" cy="12" r="2.4" fill="currentColor" />
    </Glyph>
  ),
};

const L = (name: string, calibrate: string, note: string): Leaf => ({ leaf: true, name, calibrate, note });

const NODES: Record<string, KeyNode> = {
  root: {
    prompt: "Take a sip and let it sit a second. What is the closest thing it reminds you of?",
    choices: [
      { lab: "Fruity", hint: "berries, citrus, peach", g: "berry", to: "fruit" },
      { lab: "Flowery or tea-like", hint: "like flowers or a cup of tea", g: "flower", to: "floral" },
      { lab: "Sweet, like dessert", hint: "honey, caramel, vanilla", g: "drop", to: "sweet" },
      { lab: "Chocolatey or nutty", hint: "cocoa, almond, hazelnut", g: "bean", to: "cocoanut" },
      { lab: "Fresh or herby", hint: "grassy, garden herbs, mint", g: "leaf", to: "green" },
      { lab: "Warm or toasty", hint: "cinnamon, toast, spice", g: "spice", to: "spice" },
      { lab: "Wild or boozy", hint: "wine-like, jammy, rum", g: "bubbles", to: "ferment" },
    ],
  },
  fruit: {
    prompt: "Nice. What kind of fruit?",
    choices: [
      { lab: "A berry", g: "berry", to: "berry" },
      { lab: "Something citrusy", g: "citrus", to: "citrus" },
      { lab: "A juicy fruit with a pit", g: "stone", to: "stone" },
      { lab: "A dried fruit", g: "dried", to: "dried" },
      { lab: "Something tropical", g: "tropical", to: "tropical" },
    ],
  },
  berry: {
    prompt: "Which berry feels closest?",
    choices: [
      { lab: "Blackberry", g: "dot", to: L("Blackberry", "a fresh blackberry, crushed between your fingers", "Good to know: deep, dark berry usually shows up when the coffee dried slowly with the fruit still on it.") },
      { lab: "Raspberry", g: "dot", to: L("Raspberry", "raspberry jam, going for the tart smell not the sugar", "Good to know: bright red-berry flavors turn up in some East African and Colombian coffees.") },
      { lab: "Blueberry", g: "dot", to: L("Blueberry", "a few fresh blueberries, warmed in your hand", "Good to know: blueberry is the classic sign of a coffee dried with the whole fruit on.") },
      { lab: "Strawberry", g: "dot", to: L("Strawberry", "a ripe strawberry, sniffed at the cut", "Good to know: strawberry shows up a lot in sweeter, fruitier coffees.") },
    ],
  },
  citrus: {
    prompt: "What kind of citrus?",
    choices: [
      { lab: "Lemon", g: "dot", to: L("Lemon", "the oil that sprays out when you zest a lemon", "Good to know: clean, lemony coffees tend to taste crisp and lively.") },
      { lab: "Lime", g: "dot", to: L("Lime", "a fresh lime, or a bruised lime verbena leaf", "Good to know: bright, zippy lime is common in East African coffees.") },
      { lab: "Grapefruit", g: "dot", to: L("Grapefruit", "a pink grapefruit, peel and all", "Good to know: grapefruit brings a pleasant little bite, tart and slightly bitter at once.") },
      { lab: "Orange", g: "dot", to: L("Orange", "orange peel, going for the oil not the juice", "Good to know: orange often shows up in rounder, chocolatey coffees.") },
    ],
  },
  stone: {
    prompt: "A juicy fruit with a pit. Which one?",
    choices: [
      { lab: "Peach", g: "dot", to: L("Peach", "a ripe peach, skin and all", "Good to know: peach is a sign of a delicate, well-grown coffee.") },
      { lab: "Apricot", g: "dot", to: L("Apricot", "a dried apricot, which reads clearer than fresh", "Good to know: apricot sits right between fresh fruit and honey sweetness.") },
      { lab: "Plum", g: "dot", to: L("Plum", "the skin of a ripe plum", "Good to know: plum leans into the deeper, darker fruit flavors.") },
      { lab: "Cherry", g: "dot", to: L("Cherry", "a dark sweet cherry, or cherry preserves", "Good to know: cherry is common in richer, jammier coffees.") },
    ],
  },
  dried: {
    prompt: "More like a dried fruit. Which?",
    choices: [
      { lab: "Raisin", g: "dot", to: L("Raisin", "a handful of raisins, warmed in your hand", "Good to know: raisin shows up in deeper coffees and slightly darker roasts.") },
      { lab: "Date", g: "dot", to: L("Date", "a medjool date, split open", "Good to know: date means low, syrupy sweetness and a soft, round cup.") },
      { lab: "Fig", g: "dot", to: L("Fig", "a dried fig at its seedy center", "Good to know: fig is a rich, honeyed, grown-up kind of sweetness.") },
      { lab: "Prune", g: "dot", to: L("Prune", "a prune, or stewed plums", "Good to know: a little prune is lovely. A lot can mean the roast ran a touch long.") },
    ],
  },
  tropical: {
    prompt: "Something tropical. Which?",
    choices: [
      { lab: "Pineapple", g: "dot", to: L("Pineapple", "fresh pineapple near the core", "Good to know: pineapple usually means a bright, lively, sunny cup.") },
      { lab: "Mango", g: "dot", to: L("Mango", "ripe mango skin near the stem", "Good to know: mango is soft, ripe, and juicy on the palate.") },
      { lab: "Passionfruit", g: "dot", to: L("Passionfruit", "a cut passionfruit, seeds and all", "Good to know: passionfruit is a standout note when a coffee has it.") },
    ],
  },
  floral: {
    prompt: "Light and perfumey. What is the closest match?",
    choices: [
      { lab: "Jasmine", g: "flower", to: L("Jasmine", "the steam off a cup of jasmine green tea", "Good to know: delicate flower notes like this are the calling card of washed coffees from high, cool farms.") },
      { lab: "Rose", g: "flower", to: L("Rose", "a real rose, or a little rosewater", "Good to know: rose shows up in the most delicate, elegant coffees.") },
      { lab: "Chamomile", g: "flower", to: L("Chamomile", "the steam off a chamomile tea bag", "Good to know: chamomile means a soft, gentle, easygoing cup.") },
      { lab: "Black tea", g: "leaf", to: L("Black tea", "dry black tea leaves, straight from the bag", "Good to know: a black-tea quality gives a coffee structure and grip more than sweetness.") },
      { lab: "Earl Grey", g: "flower", to: L("Earl Grey / bergamot", "an Earl Grey tea bag", "Good to know: this is flowers and citrus at the same time, and a lovely thing to find.") },
      { lab: "Lavender", g: "flower", to: L("Lavender", "a sprig of cooking lavender, rubbed between two fingers", "Good to know: lavender is rare and delicate. Wonderful when it is really there.") },
    ],
  },
  sweet: {
    prompt: "Sweet like what?",
    choices: [
      { lab: "Honey", g: "drop", to: L("Honey", "raw honey off the spoon, smelled not tasted", "Good to know: honey sweetness is soft, floral, and comforting.") },
      { lab: "Caramel", g: "drop", to: L("Caramel", "sugar melted to amber, right at the edge of burning", "Good to know: this sweetness comes from the roast itself, the same browning that sweetens toast.") },
      { lab: "Brown sugar", g: "drop", to: L("Brown sugar", "dark brown sugar, straight from the bag", "Good to know: brown sugar means a warm, comfortable, everyday kind of sweetness.") },
      { lab: "Vanilla", g: "drop", to: L("Vanilla", "a drop of real vanilla, or a split pod", "Good to know: vanilla is smooth and creamy, an easy one to love.") },
      { lab: "Maple", g: "drop", to: L("Maple", "real maple syrup, not the pancake kind", "Good to know: maple is a deep, rounded sweetness, cozy and full.") },
    ],
  },
  cocoanut: {
    prompt: "Chocolatey or nutty. Which way does it lean?",
    choices: [
      { lab: "Dark chocolate", g: "bean", to: L("Dark chocolate", "a dark chocolate bar, snapped fresh", "Good to know: chocolatey cups usually come from a slightly deeper roast.") },
      { lab: "Milk chocolate", g: "bean", to: L("Milk chocolate", "milk chocolate, softened in your hand", "Good to know: milk chocolate means a smooth, balanced, easy daily cup.") },
      { lab: "Cocoa", g: "bean", to: L("Cocoa", "raw cocoa, drier and sharper than a candy bar", "Good to know: a clean cocoa note is a sign of a dense, well-grown coffee.") },
      { lab: "Almond", g: "bean", to: L("Almond", "a fresh raw almond, cut open", "Good to know: almond is a gentle, mellow, nutty sweetness.") },
      { lab: "Hazelnut", g: "bean", to: L("Hazelnut", "a shelled hazelnut, skin and all", "Good to know: hazelnut is warm and toasty, a real comfort note.") },
      { lab: "Peanut", g: "bean", to: L("Peanut", "raw peanuts in the shell", "Good to know: a light peanut note is normal. A strong one can mean the roast was a little young.") },
    ],
  },
  green: {
    prompt: "Fresh and green. What is closest?",
    choices: [
      { lab: "Grassy", g: "leaf", to: L("Grassy / fresh pea", "a snapped raw sugar-snap pea", "Good to know: a little fresh-green is fine. A lot can mean a very young roast.") },
      { lab: "Lemongrass or verbena", g: "leaf", to: L("Lemongrass / verbena", "a bruised lemongrass stalk or verbena leaf", "Good to know: this bright, leafy note shows up in lively East African coffees.") },
      { lab: "Mint", g: "leaf", to: L("Mint", "a single crushed mint leaf", "Good to know: mint gives a cool, refreshing finish.") },
      { lab: "Green and sharp", g: "leaf", to: L("Green / sharp", "the white pith of a green banana peel", "Good to know: this one can be a quirk worth naming honestly, often from fruit picked a bit early.") },
    ],
  },
  spice: {
    prompt: "Warm and toasty. Which is it?",
    choices: [
      { lab: "Cinnamon", g: "spice", to: L("Cinnamon", "a broken cinnamon stick, not the ground jar", "Good to know: cinnamon is a warm, friendly spice note.") },
      { lab: "Clove", g: "spice", to: L("Clove", "a few whole cloves", "Good to know: clove is a bolder, spicier warmth.") },
      { lab: "Nutmeg", g: "spice", to: L("Nutmeg", "a little fresh-grated nutmeg", "Good to know: nutmeg is round and cozy, a baking-spice kind of note.") },
      { lab: "Cedar or tobacco", g: "spice", to: L("Cedar / tobacco", "a cigar box, or fresh pencil shavings", "Good to know: this woody warmth shows up in older, rested coffees.") },
      { lab: "Toast", g: "spice", to: L("Toast / malt", "the heel of a toasted loaf", "Good to know: toast is a comfortable, breakfast-table kind of flavor.") },
      { lab: "Roasty", g: "spice", to: L("Roasty", "the crust of something toasted a shade too far", "Good to know: a little is nice. If it takes over, the roast is louder than the bean.") },
    ],
  },
  ferment: {
    prompt: "Bold and a little wild. What is closest? Some of these are on purpose and some are just quirks, so go with your gut.",
    choices: [
      { lab: "Wine-like", g: "bubbles", to: L("Wine-like", "red wine you have let breathe for a while", "Good to know: some coffees are made to taste wine-like on purpose, and it can be gorgeous.") },
      { lab: "Jammy or overripe", g: "bubbles", to: L("Jammy / overripe", "fruit that is just past ripe", "Good to know: bold, jammy fruit is a feature in some coffees, kept in balance when it is done well.") },
      { lab: "Rum-like", g: "bubbles", to: L("Rum-like", "a capful of dark rum", "Good to know: a warm, boozy sweetness that shows up in the boldest coffees.") },
      { lab: "Sharp or funky", g: "bubbles", to: L("Sharp / funky", "ripe cheese, just a quick sniff", "Good to know: a sharp, funky edge usually means a bold coffee that pushed its flavors right to the limit.") },
    ],
  },
};

const WHENS = ["First sip", "As it opens up", "After you swallow"];
const TEMPS = ["Hot", "Warm", "Cool"];

export default function TastingKey({ coffee, onClose }: { coffee: Coffee; onClose: () => void }) {
  const [started, setStarted] = useState(false);
  const [current, setCurrent] = useState<KeyNode | Leaf>(NODES.root);
  const [history, setHistory] = useState<(KeyNode | Leaf)[]>([]);
  const [trail, setTrail] = useState<string[]>([]);
  const [found, setFound] = useState<Found[]>([]);
  const [whenMark, setWhenMark] = useState<string | null>(null);
  const [tempMark, setTempMark] = useState<string | null>(null);
  const [justAdded, setJustAdded] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [shareName, setShareName] = useState("");
  const [shareComment, setShareComment] = useState("");
  const [shareErr, setShareErr] = useState("");
  const [company, setCompany] = useState(""); // honeypot, left blank by real visitors

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  function clearMarks() {
    setWhenMark(null);
    setTempMark(null);
    setJustAdded(false);
  }

  function go(choice: Choice) {
    setHistory((h) => [...h, current]);
    setTrail((t) => [...t, choice.lab]);
    clearMarks();
    setCurrent(typeof choice.to === "string" ? NODES[choice.to] : choice.to);
  }

  function back() {
    if (!history.length) return;
    setCurrent(history[history.length - 1]);
    setHistory((h) => h.slice(0, -1));
    setTrail((t) => t.slice(0, -1));
    clearMarks();
  }

  function tasteAnother() {
    setCurrent(NODES.root);
    setHistory([]);
    setTrail([]);
    clearMarks();
  }

  function addToCup(leaf: Leaf) {
    setFound((f) => [...f, { name: leaf.name, when: whenMark, temp: tempMark }]);
    tasteAnother();
    setJustAdded(true);
  }

  async function submit() {
    setShareErr("");
    if (!found.length) {
      setShareErr("Add at least one note first.");
      return;
    }
    setStatus("sending");
    const notes: TastingNote[] = found.map((f) => ({
      flavor: f.name,
      when: f.when || "",
      temperature: f.temp || "",
    }));
    try {
      const res = await fetch("/api/tasting", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submittedAt: new Date().toISOString(),
          coffee: coffee.name,
          taster: shareName.trim(),
          comment: shareComment.trim(),
          notes,
          company,
        }),
      });
      if (!res.ok) throw new Error(`tasting endpoint returned ${res.status}`);
      setStatus("sent");
    } catch {
      setStatus("idle");
      setShareErr("Something hiccuped. Try once more.");
    }
  }

  const timing = (f: Found) => [f.when, f.temp && f.temp.toLowerCase()].filter(Boolean).join(", ");
  const crumbs = trail.join(" › ");
  const leaf = "leaf" in current && current.leaf ? current : null;

  return (
    <div className="tk-overlay" role="dialog" aria-label={`The Tasting Key — ${coffee.name}`}>
      <div className="tk-plate">
        <button className="close-btn tk-close" onClick={onClose}>
          ✕ close
        </button>
        <p className="eyebrow">HUMBLE GROUNDS · TASTE ALONG</p>
        <h2 className="tk-title">The Tasting Key</h2>
        <p className="tk-coffee-line">{coffee.name}</p>

        {!started ? (
          <div>
            <p className="tk-lede">
              Want to have a little more fun with this coffee? Pull this up while you drink it. It gives
              you words for what you are already tasting. You might do this with wine. Coffee has even
              more going on. There are around a thousand flavor compounds packed into one bean, shaped by
              where it grew, how it was processed, how far it traveled, how it was roasted, and how you
              brewed it. This walks you through all of it, one easy question at a time. When you are
              done, you can send your notes to Bryon as a little review of this coffee.
            </p>
            <p className="tk-reassure">No experience needed. Go with your gut, there is no wrong answer.</p>
            <button className="order-btn tk-start" onClick={() => setStarted(true)}>
              Take a sip and start
            </button>
          </div>
        ) : (
          <div className="tk-grid">
            <div>
              {leaf ? (
                <div>
                  <p className="tk-crumbs">{crumbs ? `${crumbs} ›` : ""}</p>
                  <p className="tk-found">YOU FOUND IT</p>
                  <p className="tk-name">{leaf.name}</p>
                  <div className="tk-row">
                    <span className="tk-k">WANT TO BE SURE? GO SMELL</span>
                    <p className="tk-v">{leaf.calibrate}.</p>
                  </div>
                  <div className="tk-row">
                    <span className="tk-k">A LITTLE MORE</span>
                    <p className="tk-v">{leaf.note}</p>
                  </div>
                  <div className="tk-row">
                    <span className="tk-k">WHEN DID YOU TASTE IT?</span>
                    <div className="tk-chips">
                      {WHENS.map((w) => (
                        <button
                          key={w}
                          className={`tk-chip${whenMark === w ? " on" : ""}`}
                          onClick={() => setWhenMark(whenMark === w ? null : w)}
                        >
                          {w}
                        </button>
                      ))}
                    </div>
                    <div className="tk-chips">
                      {TEMPS.map((t) => (
                        <button
                          key={t}
                          className={`tk-chip${tempMark === t ? " on" : ""}`}
                          onClick={() => setTempMark(tempMark === t ? null : t)}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                    <p className="tk-cool-note">
                      Coffee tastes different as it cools, so it is worth trying the same cup a few times.
                    </p>
                  </div>
                  <div className="tk-nav">
                    <button className="tk-add" onClick={() => addToCup(leaf)}>
                      ＋ add to my cup
                    </button>
                    <button className="tk-ghost" onClick={back}>
                      ← back a step
                    </button>
                    <button className="tk-ghost" onClick={tasteAnother}>
                      taste something else
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="tk-crumbs">{crumbs ? `${crumbs} ›` : ""}</p>
                  {justAdded && (
                    <p className="tk-added">Added to your cup. Find another flavor, or share your notes.</p>
                  )}
                  <p className="tk-prompt">{(current as KeyNode).prompt}</p>
                  <div className="tk-choices">
                    {(current as KeyNode).choices.map((c) => (
                      <button key={c.lab} className="tk-choice" onClick={() => go(c)}>
                        {GLYPHS[c.g] ?? GLYPHS.dot}
                        <span>
                          <span className="tk-lab">{c.lab}</span>
                          {c.hint && <span className="tk-hint">{c.hint}</span>}
                        </span>
                      </button>
                    ))}
                  </div>
                  <p className="tk-gut">Go with your gut. There is no wrong answer.</p>
                  <div className="tk-nav">
                    <button className="tk-ghost" onClick={back} disabled={!history.length}>
                      ← back a step
                    </button>
                  </div>
                </div>
              )}
            </div>

            <aside className="tk-slip">
              <h3>Your cup, in words</h3>
              <div className="tk-date">
                {new Date()
                  .toLocaleDateString(undefined, { month: "long", day: "numeric", year: "numeric" })
                  .toUpperCase()}
              </div>
              {status === "sent" ? (
                <div>
                  <p className="tk-v">Thank you. Your notes are on their way to Bryon.</p>
                  <button
                    className="tk-linkish"
                    onClick={() => {
                      setFound([]);
                      setShareOpen(false);
                      setStatus("idle");
                      setShareName("");
                      setShareComment("");
                      tasteAnother();
                    }}
                  >
                    taste another cup
                  </button>
                </div>
              ) : shareOpen ? (
                <div className="tk-share-form">
                  <input
                    type="text"
                    name="company"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    className="hp-field"
                    tabIndex={-1}
                    autoComplete="off"
                    aria-hidden="true"
                  />
                  <p className="tk-v" style={{ fontSize: "0.9rem" }}>
                    Sending {found.length} note{found.length === 1 ? "" : "s"} on {coffee.name} to Bryon.
                    Every field is optional.
                  </p>
                  <label htmlFor="tk-name">YOUR NAME</label>
                  <input id="tk-name" type="text" value={shareName} onChange={(e) => setShareName(e.target.value)} />
                  <label htmlFor="tk-comment">ANYTHING TO ADD?</label>
                  <textarea
                    id="tk-comment"
                    rows={3}
                    value={shareComment}
                    onChange={(e) => setShareComment(e.target.value)}
                  />
                  {shareErr && <p className="tk-err">{shareErr}</p>}
                  <div className="tk-share-actions">
                    <button className="tk-send" onClick={submit} disabled={status === "sending"}>
                      {status === "sending" ? "Sending…" : "Send"}
                    </button>
                    <button
                      className="tk-ghost"
                      onClick={() => {
                        setShareOpen(false);
                        setShareErr("");
                      }}
                    >
                      Back
                    </button>
                  </div>
                  <p className="tk-mini">Bryon reads every one. It helps him dial in the next roast.</p>
                </div>
              ) : (
                <div>
                  {found.length === 0 ? (
                    <p className="tk-empty">Nothing yet. Key out a flavor, then add it to your cup.</p>
                  ) : (
                    <>
                      <ul className="tk-cup">
                        {found.map((f, i) => (
                          <li key={i}>
                            <span className="tk-fl">{f.name}</span>
                            {timing(f) && <span className="tk-tm">{timing(f)}</span>}
                          </li>
                        ))}
                      </ul>
                      <button className="tk-share-btn" onClick={() => setShareOpen(true)}>
                        Share these notes with Bryon →
                      </button>
                    </>
                  )}
                  <p className="tk-closer">Every coffee keys out a little differently. Come back with your next cup.</p>
                </div>
              )}
            </aside>
          </div>
        )}
      </div>
    </div>
  );
}
