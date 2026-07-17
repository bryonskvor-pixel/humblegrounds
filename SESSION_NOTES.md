# Session Notes

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
