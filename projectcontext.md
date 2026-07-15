# HUMBLE GROUNDS — PROJECT_CONTEXT.md

Build spec for humblegrounds site + illustrated bean-split opening animation.
Owner: Bryon Skvor, Clarity Companion LLC, Oberlin OH.
This document is the single source of truth. Read fully before generating any asset or writing any code.

---

## 1. WHAT THIS IS

A small-batch coffee roastery site relaunch. Bryon roasts on an AMBEX YM-5 under the Humble Grounds brand. Initial customer base is ~8 known people; the site exists to make ordering easy and the brand feel intentional, not to scale.

Two deliverables:

1. **The Opening** — a hand-drawn animated title sequence: a coffee bean transforms through processing stages, splits down its vertical seam, and the two halves become door panels that slide apart to reveal the site.
2. **The Site** — a simple, single-purpose ordering page in the same illustrated visual language.

Guiding principle: **continuity of the look.** Every pixel — animation, site chrome, product art, buttons — comes from one visual DNA (defined in §3). If an element could not plausibly have been drawn by the same hand as the opening animation, it does not ship.

---

## 2. BUSINESS RULES (site content constraints)

- **Three coffees per month.** A rotating monthly lineup of exactly 3 whole-bean/ground offerings. Each gets a name, origin/process story, tasting notes, roast level.
- **One batch cold brew.** A single cold brew offering, small-batch, quantity-limited.
- **Payment: Venmo or cash.** No Stripe, no cart, no checkout flow. The "order" action collects the order details and points to Venmo (deep link `https://venmo.com/u/<handle>` — handle TBD, use placeholder `VENMO_HANDLE`) or arranges cash on delivery.
- **Fulfillment: two modes.**
  - **Local doorstep delivery** — free/simple, within a 15-minute drive of Oberlin, Ohio, on **one designated day per week** (day TBD, placeholder `DELIVERY_DAY`).
  - **Shipping** — for everyone else.
- **Pricing: TBD.** Build all price displays as easily-editable data (see §6 data model). Use `$—` placeholders in mockups. Do not invent prices.
- **No accounts, no login, no database requirement for v1.** An order can be a structured mailto / form submission / simple Worker endpoint that emails or texts Bryon. Keep it that simple.

Voice note for all copy: Bryon's writing voice — natural rhythm, unconventional sentence structures allowed, warm and substantive, never corporate-smooth, **no em-dashes**. The kind of roaster who explains yeast fermentation to his customers because he thinks they'll find it interesting. Write copy accordingly and flag anything that reads like marketing filler.

---

## 3. THE LOCKED STYLE (visual DNA)

Derived from the Cannagraphy hero animation (mycannagraphy.site), which is the reference artifact. Humble Grounds is a sibling brand in the same illustrated universe.

### 3.1 Style description (canonical)

Vintage botanical / field-guide illustration:

- **Linework:** fine dark ink outlines, crow-quill pen quality — slightly scratchy, variable weight, never cartoon-thick.
- **Shading, two systems that never mix:**
  - **Ink crosshatching** for ground, shadows, and inert matter (soil, pebbles, husks, table surfaces, shadow pools).
  - **Soft colored-pencil / muted watercolor wash** inside the ink outlines of anything alive or valuable (the cherry, the bean, brewed coffee).
- **Color logic:** color signals life against a monochrome ink world.
- **Background:** warm aged cream paper with visible tooth/texture. Never pure white.
- **Composition:** centered subject, generous negative space, diagram-calm, single subject per plate.
- **Never:** photorealism, digital gradients, lens flare, 3D render look, thick black cartoon outlines, pure white backgrounds, rendered text inside images.

### 3.2 The locked style suffix (append VERBATIM to every image/video generation prompt)

```
Vintage botanical illustration style, fine dark ink linework like a crow-quill pen, delicate crosshatching for ground and shadows, soft colored-pencil and muted watercolor wash shading inside the ink outlines, warm aged cream paper background with subtle texture, muted natural palette, centered composition with generous negous space, hand-drawn scientific field-guide aesthetic, no photorealism, no digital gradients, no text.
```

(Note: fix "negous" → "generous" — kept here so a find/replace confirms you read the doc.)

### 3.3 Style reference images

Use the Cannagraphy frames as image references on every generation that supports reference inputs (FLUX.2 `image_references`, Seedance 2.0 `image_references`). Store them at `assets/style-refs/canna-01.png … canna-06.png`. Best single reference for the bean plates: the lone-seed-on-ground frame (image 6 in the source set) — it is compositionally closest to the keyframes.

### 3.4 Color tokens

The animation's chromatic arc IS the brand palette. Sample final values from approved plates; targets:

| Token | Target | Role |
|---|---|---|
| `--paper` | `#EDE7D8` (warm aged cream) | page background, matches plate backgrounds exactly — this is critical for the door illusion |
| `--ink` | `#2B2620` (warm near-black) | linework, body text, borders |
| `--cherry` | `#A63A2E` (muted deep red) | primary accent: order buttons, active states |
| `--celadon` | `#8FA07A` (washed-bean green) | secondary accent: fresh/available states, cold brew |
| `--roast` | `#6B4A32` (medium roast brown) | headings, footer, roast-level indicators |
| `--glow` | `#E8C878` (seam-light gold) | hover states, the door-crack light, highlights |

Rule: `--paper` must be sampled from the actual approved plates, not this hex. The site background and the animation background must be indistinguishable or the door illusion breaks.

### 3.5 Typography

- **Display:** a face with hand-set, early-scientific-print character. First choices: **IM Fell English** or **Sorts Mill Goudy** (Google Fonts, free). It should look like the labels on antique botanical plates.
- **Body:** a humanist serif with good screen legibility at small sizes: **Source Serif 4** or **Lora**.
- **Utility/captions (tasting notes, meta):** a typewriter-adjacent mono used sparingly: **Courier Prime** — evokes cupping-log notes.
- Sentence case throughout. Display face used with restraint (page title, coffee names). No letterspaced all-caps labels — that reads modern-brand, not field guide.

---

## 4. THE OPENING ANIMATION

### 4.1 Concept

One bean, standing **vertical** (seam running top-to-bottom), centered on the paper background. It transforms through the real processing stages of Bryon's coffee (washed process — this matters, see plate 3), then splits along its seam. The split IS the site transition: the video freezes at the moment the seam parts, and two DOM panels wearing the final frame's halves slide left/right, revealing the page beneath. Total video runtime target: **7–9 seconds**. The site reveal (door slide) is CSS, ~1.2s, so full experience lands under 10s — matching the Cannagraphy opener's feel.

### 4.2 The six keyframe plates

Generate as stills FIRST (FLUX.2 via BFL API in Claude Code). Iterate until each plate is right before any video generation. Every prompt = the plate description below + the locked style suffix (§3.2) + Cannagraphy style refs (§3.3). Aspect ratio 16:9, subject centered and sized/positioned IDENTICALLY across all six plates (the bean occupies the middle ~45% of frame height, vertical orientation). Consistent placement is non-negotiable — it is what makes the sequence read as one metamorphosis.

- **P1 — The Cherry.** A single ripe coffee cherry, deep muted red wash, standing upright on crosshatched ground with small ink pebbles, tiny grass tufts. (Direct compositional descendant of the Cannagraphy lone-seed frame.)
- **P2 — The Peel.** The cherry's skin split and curling away in ink-lined petals (echoing the Cannagraphy cracked-seed halves), revealing a pale bean sheathed in glossy mucilage, rendered as pale wash highlights.
- **P3 — Washed.** The clean bean, vertical, celadon green wash, matte, a few ink-drawn water droplets on the ground, crosshatch shadow beneath. This plate is the coffee's actual story: fully washed, crystal clean. Give it a beat of visual calm.
- **P4 — The Roast.** Same bean, same position, color deepened through amber toward medium brown (City to Full City — do NOT go dark/oily), two or three thin ink-hatched smoke curls rising. Heat is implied by a warm underglow wash at the ground line — **no flame anywhere.** (Hard-learned: video models cannot keep a flame off the bean. The illustrated style doesn't need one.)
- **P5 — First Crack.** The roasted bean with its vertical center seam visibly parted a few millimeters, warm gold (`--glow`) light rendered as wash emanating from the gap, edges of the split slightly lifted.
- **P6 — The Doors.** The two halves parted wider (gap ~15–20% of frame width), gold light filling the gap, each half fully intact and cleanly separable down the vertical centerline of the frame. **This plate becomes the door panels — the composition must allow a clean vertical split of the image into left/right halves.**

Deliverable per plate: 1 approved PNG at max available resolution, saved to `assets/plates/p1.png … p6.png`, plus the generation prompt logged in `assets/plates/PROMPTS.md`.

### 4.3 The clip plan (Higgsfield, Seedance 2.0 Mini/Fast — start_image + end_image)

Five clips, each animating between adjacent approved plates. Generate at 720p, 16:9, silent (audio comes later or never), duration per clip below. Pass the relevant plates as `start_image` and `end_image`, Cannagraphy refs as `image_references`, and a motion-only prompt (the style is carried by the pinned frames — describe ONLY the transformation and its pacing).

| Clip | Frames | Duration | Motion prompt core |
|---|---|---|---|
| C1 | P1→P2 | 2s | "The cherry's skin slowly splits and peels open in curling petals, revealing the glossy bean inside; gentle, continuous, hand-drawn animation feel" |
| C2 | P2→P3 | 2s | "Water washes down over the bean; the peel petals settle to the ground; the bean comes clean and pale green; drawn water droplets" |
| C3 | P3→P4 | 2–3s | "A warm glow rises from below; the bean's color deepens slowly from pale green through amber to medium brown; thin drawn smoke curls rise; no flame" |
| C4 | P4→P5 | 1.5s | "The glow fades; a beat of stillness; the bean's vertical seam cracks open and warm golden light appears in the gap" |
| C5 | P5→P6 | 1.5s | "The split widens; the two halves part further as golden light pours from between them; slow and deliberate" |

Assembly: stitch C1–C5 in order with Higgsfield's explainer_video assembly tool (free) or ffmpeg locally. Final export: MP4 (H.264) AND WebM, target ≤ 1.5 MB total via aggressive compression — the illustrated style with flat washes compresses extremely well. Also export **P6 at full quality** and pre-split it into `door-left.png` / `door-right.png` (exact vertical bisection of the frame).

Budget guardrails: preflight every video generation with `get_cost:true`. Expect Mini clips in the ~8–20 credit range each. One approved take per clip before any re-rolls; log every generation (prompt, cost, keep/kill) in `assets/clips/LOG.md`. Total video budget ceiling: 150 credits. If a clip fights consistency twice, stop and re-examine the plates rather than re-rolling a third time.

### 4.4 The door mechanic (front end)

```
Load sequence:
1. Page loads with a full-viewport <video> (poster = P1) over the site content.
   Site content is fully rendered underneath from the start (no layout shift).
2. Video plays through C1–C5 (muted, playsinline, autoplay).
3. On video 'ended': swap video element for two absolutely-positioned divs,
   .door-left and .door-right, each backed by its half of P6
   (background-image door-left.png / door-right.png). The swap must be
   pixel-invisible: same frame, same position.
4. Animate: .door-left → translateX(-100%), .door-right → translateX(100%),
   1.2s, cubic-bezier(0.65, 0, 0.35, 1). A soft --glow light wash on the
   revealed content fades out over the same duration.
5. Remove door elements from DOM on transitionend.
```

Rules:

- **Session flag:** `sessionStorage.hg_opened = 1`. Returning visitors within a session skip straight to the open site (no video download even — gate the video element render on the flag).
- **Skip affordance:** a small ink-drawn "skip →" in the lower corner, visible after 1.5s. Clicking jumps to step 3 immediately (seek video to end).
- **`prefers-reduced-motion: reduce`:** never autoplay the video; show P6 as a static hero with doors already open, or simply the open site.
- **Mobile:** video is 16:9 letterboxed on the paper background (`--paper` fills the bars, which is invisible by design); doors still split vertically. Test that `autoplay muted playsinline` fires on iOS Safari.
- **Perf:** `preload="auto"` on the video only when the session flag is absent; poster image = P1 compressed to <60 KB so first paint is instant.

### 4.5 Fallback (ship-now option)

Until the illustrated animation is complete, the banked photoreal Veo take (take 2, the "pro" one) may be used as an interim opener with the light-bloom-to-fade transition instead of doors. Build the loader so the video file and transition mode are swappable via one config object. Do not let the interim version's existence stall the site launch.

---

## 5. THE SITE

### 5.1 Structure (single page + one utility page)

```
/                 The page. Everything lives here.
/how-it-works     Optional tiny page (or anchor section): delivery/shipping/payment explained.
```

Single-page anatomy, top to bottom:

1. **The Opening** (§4) → doors part to reveal:
2. **Masthead.** "Humble Grounds" in the display face, drawn like a botanical plate title. Sub-line in body serif: "Small-batch coffee. Roasted in Oberlin, Ohio." A small ink-drawn roaster or bean glyph — generated with the style suffix — may sit beside it. No nav bar; the page is short enough to scroll.
3. **This Month.** Eyebrow in Courier Prime: the month + year, like a cupping-log date ("JULY 2026 · BATCH NOTES"). Then the three coffees as **plate cards** (see 5.2), followed by the cold brew as a fourth, visually distinct card.
4. **How to get it.** Two-column (stacked on mobile) ink-illustrated panel: LOCAL — "Doorstep delivery within 15 minutes of Oberlin, every DELIVERY_DAY." / SHIPPED — "Everywhere else, via USPS." Each with a small hand-drawn map-pin / parcel illustration in the house style.
5. **Order block.** The single interactive moment (see 5.3).
6. **Footer.** Ink rule, "Roasted by Bryon in Oberlin, Ohio," Venmo handle, contact email. Crosshatched ground illustration running along the very bottom edge of the page — the same ground the bean stood on, closing the loop.

### 5.2 The plate card (signature component)

Each coffee is presented as a **botanical plate**: a framed panel on the paper background with a fine double ink rule border, containing:

- An illustrated plate of the coffee (generated: e.g. for the Kochere — a vertical bean beside a sprig of coffee blossom and a lime slice + verbena flower echoing the tasting notes, all in the locked style). One image per coffee per month, `assets/coffees/YYYY-MM/<slug>.png`.
- Coffee name in display face.
- Origin line in body serif: "Kochere, Ethiopia · Bonde washing station · 2100 masl".
- Process note, one sentence, Bryon-voiced.
- Tasting notes in Courier Prime, set like a specimen label: `white tea · floral · lime verbena · vanilla · passionfruit`.
- Roast level as a row of five small bean glyphs, filled left-to-right in `--roast` (City–Full City = 2–3 filled).
- Price (`$—` placeholder) and an "Order this" button (5.3).

The cold brew card uses the same frame but a `--celadon` wash tint and a jar illustration (a direct cousin of the Cannagraphy mason-jar frame — same jar language, coffee instead).

Hover: the plate's wash colors deepen slightly and a faint `--glow` edge light appears — the "held up to the light" micro-interaction. Subtle; 150ms.

### 5.3 Ordering (no cart)

One flow, minimal state:

- Each "Order this" button adds the item to a simple in-page order note (a slide-up "order slip" styled like a paper receipt in the house style — ink rules, Courier Prime).
- The slip collects: name, delivery choice (Local DELIVERY_DAY doorstep / Ship to address), address or drop instructions, payment choice (Venmo / cash on delivery — cash only valid for Local).
- Submit → POST to a single Cloudflare Worker endpoint that emails/texts Bryon the order (Resend or a simple mailto fallback for v1), then shows a confirmation state: "Got it. Venmo @VENMO_HANDLE when you're ready, or have cash at the door DELIVERY_DAY." with a Venmo deep link button.
- No inventory logic v1 beyond a per-item `soldOut: true` flag that renders a hand-drawn "SPOKEN FOR" stamp diagonally across the plate card.

### 5.4 Data model (make monthly rotation trivial)

All content lives in one file: `content/menu.json` (or `.ts`). Editing this file and dropping in new plate images IS the monthly update — no code changes.

```json
{
  "month": "2026-07",
  "deliveryDay": "DELIVERY_DAY",
  "venmo": "VENMO_HANDLE",
  "coffees": [
    {
      "slug": "kochere-yeast-washed",
      "name": "Kochere Yeast Ferment",
      "origin": "Kochere, Ethiopia",
      "station": "Bonde washing station · Iseral Degefa",
      "elevation": "2100 masl",
      "variety": "74158 indigenous cultivar",
      "process": "Washed, 48-hour yeast-inoculated ferment",
      "processNote": "",
      "notes": ["white tea", "floral", "lime verbena", "vanilla", "passionfruit"],
      "roastLevel": 2.5,
      "price": null,
      "soldOut": false,
      "plate": "/assets/coffees/2026-07/kochere.png"
    }
  ],
  "coldBrew": {
    "name": "",
    "notes": [],
    "price": null,
    "soldOut": false,
    "plate": ""
  }
}
```

### 5.5 Stack

Bryon's house stack: **Next.js on Cloudflare Pages** (matching Currently / remodel.guide) or plain Astro if simpler — builder's choice, but static-first, one Worker endpoint for orders, no database. Repo name suggestion: `humble-grounds`. All generation assets and this document live in the repo.

### 5.6 Quality floor

Responsive to 360px; visible keyboard focus (ink-style 2px `--ink` outline offset, not default blue); reduced-motion path (§4.4); semantic HTML; the video never blocks content paint; Lighthouse perf ≥ 90 on mobile with the opener enabled.

---

## 6. ASSET BACKLOG (all generated with the locked suffix + refs)

Priority order:

1. Six keyframe plates (§4.2) — blocks everything.
2. door-left/door-right split of P6.
3. Three coffee plates + one cold brew jar plate for launch month.
4. Masthead glyph (small roaster or bean).
5. Local/Shipped panel illustrations (map pin sketch, wrapped parcel).
6. "SPOKEN FOR" stamp.
7. Favicon + OG image (P1 cherry works for both).
8. Later: pour-over workshop plate, roast-level diagram, bag label art (print — generate at 2K).

---

## 7. PIPELINE & SEQUENCING

**Station A — Claude Code + Black Forest Labs FLUX.2 API (stills).** All plates and site art. Script the loop: prompt + suffix + style refs → 4 variants → contact sheet → pick → refine. Log prompts and picks.

**Station B — Google Workspace Gemini/Veo (free experiments).** Motion tests, wildcards. 3/day. Not on the critical path.

**Station C — Higgsfield, Starter, MONTHLY billing (video).** Purchase ONLY after all six plates are approved. Entire month + 200 credits spent on: importing plates, five Seedance end-frame-pinned clips, assembly. Preflight every cost. Cancel before renewal unless it has earned the next project.

Order of work:
1. Style refs into repo → 2. Plates P1–P6 approved (Station A) → 3. Site built with fallback opener (§4.5) and menu.json — SHIP IT, the 8 customers can order while art continues → 4. Higgsfield month: clips C1–C5 + assembly → 5. Swap in illustrated opener via config → 6. Coffee plates for the live month → 7. Backlog.

Note the inversion: **the site ships before the fancy animation.** Eight people want coffee; the doors can arrive after the door-to-door does.

---

## 8. OPEN DECISIONS (placeholders in code, ask Bryon before launch)

- `DELIVERY_DAY` — which day of the week
- `VENMO_HANDLE`
- Prices (all null in menu.json until set)
- Contact email / order notification destination (email vs text)
- Domain (humblegrounds.___ — check availability, Bryon to choose)
- Whether take-2 photoreal opener ships as interim or site launches doors-open until illustrated version lands
