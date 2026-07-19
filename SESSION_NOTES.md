# Session Notes

## 2026-07-19 (later) — Tasting Key, About Bryon, FAQ

### Accomplished
- **"Taste along" / Tasting Key shipped** on all three coffee cards. Bryon's HTML prototype
  (deconstructed flavor wheel) ported to `components/TastingKey.tsx` — full-screen overlay,
  z-index 80, opens per-coffee so the coffee name rides along with the submission. Dynamic
  import (JourneyMap pattern): the flavor tree only downloads on tap. Submissions POST to
  new `app/api/tasting/route.ts` (same Resend shape as /api/order; logs to console when
  keys are absent; payload types in `lib/types.ts`). Prototype's fake-success fallback
  removed — a failed send now shows a real error. Verified end-to-end headlessly:
  clicked Fruity → A berry → Blueberry → chips → add → share → send; server received it.
- **About Bryon section** (`#about`, between How to get it and Ask Bryon): never the same
  coffee twice, 20 years roasting, not pretentious, and pointers to Go there / Taste along
  styled like the actual buttons. Closer line italic in roast-brown.
- **FAQ section** (`#faq`, "GOOD TO KNOW / Common questions", after About): 7 native
  `<details>` accordions, no JS — brew ratios (1:16 lead), washed vs natural, honey
  process, anaerobic fermentation, roast levels/first crack, storage, why coffee changes
  over the first weeks. Sourced from Bryon's Coffee_Education_Guide.md.

### Context / gotchas a fresh agent needs
- **JSX whitespace bug in this Next (16.2.10/Turbopack)**: a literal space between an
  inline closing tag (`</strong>`) and following text sometimes compiles away, running
  words together ("Taste alongopens"). Trigger is unpredictable (identical-looking lines
  differ). Fix: explicit `{" "}` after the tag. After editing prose with inline tags,
  verify with: `curl -s localhost:3111/ | grep -oE "</strong>[a-zA-Z][a-z]*"` (empty = good).
- Tasting emails go to ORDER_EMAIL_TO with subject "Tasting notes: <name> — <coffee>".
  First real production submission still unverified against a real inbox (same as orders).
- Education guide §6 (interactive roasting simulator) deliberately NOT built — banked as a
  possible future toy alongside Go there / Taste along.
- Puppeteer verify recipe unchanged (scratchpad install, swiftshader); remember the opener:
  click "press to open", wait ~2.5s, then "skip" — or screenshots show only the door.

### Next steps
- Test a real order AND a real tasting submission end-to-end in production.
- Cold brew pricing / system idea; Mexico tasting notes + process string; plate
  illustrations (unchanged backlog).

## 2026-07-19 — Emails, pricing, and Street View "Look around"

### Accomplished
- **Opener swapped** to the new video (better crack hit at the end). Gotcha: the file dropped
  into `public/assets/opener/` was a 2-byte placeholder; the real one was `~/Downloads/New opener.mp4`.
  Re-encoded webm WITH audio (opener plays with sound), pulled a poster frame. Config in
  `lib/openerConfig.ts` points at `new-opener.*`; old opener files still on disk, unreferenced.
- **Resend emails live.** Order slip now requires the customer's email; `/api/order` sends
  Bryon the order (reply-to customer) AND a confirmation to the customer from
  `Humble Grounds <bryon@humblegrounds.coffee>` ("Bryon will be in touch soon to let you know
  the arrival"). Confirmation failure never fails the order. New `/api/contact` +
  `components/ContactForm.tsx` power the "Ask Bryon" section above the footer; footer's
  CONTACT_EMAIL placeholder replaced with the real address.
- **Honduras coffee fixed**: renamed "Honduras Comayagua Santa Lucia Reserve Organic",
  station Finca Santa Lucia · Tres Pinos, process "Washed · sun-dried · certified organic",
  full two-paragraph farm story (Raul Rodriguez, Don Ermenegildo, Ovata/Pacamara, toucans,
  75 pickers/15 families, school rebuild). JourneyMap now splits aboutFarm on \n\n.
- **Pricing shipped**: 16 oz bags, $20 local / $26 shipped (`bagSize`/`bagPriceLocal`/
  `bagPriceShip` in menu.json). Cards show both prices; slip totals by delivery method;
  `/api/order` recomputes the total SERVER-SIDE from the menu (never trusts the client) and
  puts it in both emails. Cold brew: "price coming soon", orderable, flagged price-TBD.
- **Venmo real**: @Bryon-Skvor. **Delivery day**: deliberately blank ("fluid") — copy reads
  naturally without it; setting `deliveryDay` re-inserts the day in all three spots.
- **"Go there" doubled** (1.625rem, 2px dashed underline) so the journey isn't missed.
- **Street View "Look around" shipped** — the big one. After the flyover lands, the arrival
  card shows one button per spot (`journey.lookArounds[]` in menu.json, rendered by
  `components/LookAround.tsx`): Veracruz = downtown walk + El Tajín (official walkable
  imagery, heading 315 → pyramid); Honduras = Comayagua plaza (2022 contributed 360,
  cathedral at golden hour, heading 40); Burundi = Bujumbura lakeshore market (PINNED pano,
  see below) + Gitega National Museum. Maps JS API loads only on click.

### Context / gotchas a fresh agent needs
- Google Maps key: `NEXT_PUBLIC_GOOGLE_MAPS_KEY` in `.env.local` AND Vercel. Key is
  website-restricted (localhost:3000 + humblegrounds.vercel.app + humblegrounds.coffee).
  Watch out: Google's UI silently accepts comma-separated patterns in ONE row — they must
  be separate rows or nothing matches (cost an hour of RefererNotAllowedMapError).
- With `loading=async`, `google.maps.importLibrary` appears AFTER script onload — the
  loader in LookAround.tsx polls for it. Don't "simplify" that away.
- Metadata/getPanorama passes referer checks that PANORAMA RENDERING enforces — a spot can
  "find" imagery but render black if the referer isn't allowlisted, and heavy testing gets
  tile 429s that also render black (panorama binds, attribution shows, tiles never paint).
  Prod has its own quota context; don't panic over local black frames.
- Burundi has near-zero coverage: no Kibira, no Gishora, no real beach pano that renders.
  BEST-preference radius search FLAPS between panos there, hence `pano:` pinning in the
  LookAroundSpot type (radius search stays as self-heal fallback). Scouted candidates and
  pano ids are in this session's scratchpad scripts (gone now) — re-scout via
  StreetViewService in a puppeteer page if needed.
- Puppeteer verify recipe still: install in scratchpad, swiftshader flags, drive prod/local,
  read screenshots. React owns <html>/<body> (App Router), so DOM injected by tests gets
  eaten by hydration — drive the real UI instead.
- Order flow has ZERO placeholders left. Resend domain assumed verified (user said set up);
  customer copy untested against a real inbox — worth one live test order.

### Next steps
- Test a real order end-to-end (does the confirmation land in a real inbox?).
- Cold brew pricing; Bryon's idea: sell a home cold-brew SYSTEM once + mail coffee packets
  for it (cheaper to ship than liquid) — see memory `cold-brew-system-idea`.
- Mexico tasting notes once cupped; Mexico `process` string still empty.
- Plate illustrations for the three coffees + cold brew (asset backlog).
- humblegrounds.coffee domain: when connected, it's already in the Google key allowlist;
  Resend from-address already matches.

## 2026-07-17 — Origin journeys shipped

### Accomplished
- Built and shipped the "Go there" origin journey feature end to end, live at humblegrounds.vercel.app:
  plate card → full-screen Mapbox globe flyover from Oberlin → dashed ink great-circle route →
  3D terrain arrival with story caption. All three coffees have journeys:
  - Montaña de La Choca, Comayagua, Honduras (peak in Parque Nacional Montaña de Comayagua)
  - Kayanza Masha Anaerobic Natural, Gatara commune, Burundi (1,672 masl, red bourbon)
  - Veracruz Finca La Laja, Tlaltetela cloud forest (Sampieri family since 1920; camera aims at Pico de Orizaba)
- Designed the field-guide Mapbox style (paper land, wash water, ink coastlines, dashed borders,
  engraved contours + hillshade, globe with gold-rim paper atmosphere). Uploaded to Studio:
  `mapbox://styles/photi/cmrottqq5001901s1bormg70f`. Repo fallback: `assets/map/humble-grounds-field-guide.json`.
- Replaced the Ethiopia placeholder lineup in `content/menu.json` with the real July coffees.
- Fixed en route: Studio rejecting geojson sources (route/waypoints moved to runtime),
  fonts 404ing (Mapbox-hosted serifs), and the big one — zero-height map container
  (mapbox-gl CSS cascade; see gotcha #2 in `assets/map/README.md`).
- Verified everything by driving production headlessly (Puppeteer + swiftshader) and reading
  screenshots: opener → Go there → skip → arrival, for all three origins.
- Wrote the monthly playbook: **`assets/map/README.md`** — how to rotate journeys each month,
  camera tips, architecture, and the hard-won gotchas.

### State
- Feature complete and verified on production. Bryon's Studio font + water color choices are
  published and LOCKED (his words) — do not restyle the map without him.
- Mexico coffee still has `"notes to come"` tasting notes and no process string (not yet cupped).
- Prices, DELIVERY_DAY, VENMO_HANDLE still placeholders (pre-existing, §8 of projectcontext.md).
- Proof screenshots sitting untracked in repo root (`prod-*.png`, `shot-*.png`) — deletable.
- Puppeteer install lives in the session scratchpad (gone next session; recipe in the README).

### Next steps
- Plate illustrations for the three July coffees + cold brew (asset backlog item 3 — the art loop
  in `scripts/generate-art.mjs` and `assets/art/` was started in a prior session).
- Mexico tasting notes once cupped; fill Mexico `process`.
- Consider journey polish: hand-drawn compass rose SVG overlay on the map corner; fix the
  opener's aria-hidden focus warning (skip button retains focus inside aria-hidden ancestor).
- Illustrated opener video work (C1–C5 clips) still pending per projectcontext.md §4.

### Context
- The journey data model: optional `journey` block per coffee in `content/menu.json` —
  everything about monthly rotation is in `assets/map/README.md`.
- Env vars must carry the `NEXT_PUBLIC_` prefix and exist in BOTH `.env.local` and Vercel
  (they bake in at build; redeploy after changing).
- The Vercel project hosting humblegrounds.vercel.app is NOT in the Vercel account connected
  to Claude's MCP connector (that one only has remodel-guide, cannagraphy, etc.) — deploy
  status must be checked by polling the site.
- lngLat is [longitude, latitude]. Longitude first. Always.
