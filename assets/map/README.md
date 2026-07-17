# Origin journeys: the monthly map playbook

The "Go there" flyover that travels from Oberlin to each coffee's origin.
This is everything a future session (or Bryon at 11pm) needs to rotate the month.

## The monthly update (the only required step)

Edit `content/menu.json`. Each coffee gets an optional `journey` block:

```json
"journey": {
  "label": "Masha Station · Kayanza, Burundi",
  "lngLat": [29.65, -2.96],
  "zoom": 11.5,
  "pitch": 60,
  "bearing": 30,
  "story": "Two or three sentences shown on arrival. Bryon voice, no em-dashes."
}
```

- `lngLat` is **[longitude, latitude]** — longitude first, the classic gotcha.
- A coffee without a `journey` block simply shows no "Go there" button. Nothing breaks.
- Commit, push, Vercel deploys. No code changes.

### Choosing the camera

- `zoom` 11–12 shows a mountain region; higher feels like a farm visit.
- `pitch` 60–62 makes the 3D terrain read.
- `bearing`: point the camera at the most interesting terrain. Scout in the
  Mapbox Studio preview or on the live site by temporarily tweaking values.
  (Mexico's 230 aims at Pico de Orizaba on the horizon. Do more of that.)
- Coordinates only need to be region-accurate. Peaks and towns can be found via
  peakvisor.com / plain web search; washing stations often publish commune + elevation only.

## Architecture (what exists and where)

- **Style**: hosted in Mapbox Studio at `mapbox://styles/photi/cmrottqq5001901s1bormg70f`
  (account `photi`). Fonts and colors are LOCKED as published — do not restyle
  without Bryon. Repo fallback copy: `assets/map/humble-grounds-field-guide.json`,
  used only if `NEXT_PUBLIC_MAPBOX_STYLE` is unset.
- **Component**: `components/JourneyMap.tsx` — lazy-loaded on "Go there" click
  (mapbox-gl never loads for visitors who don't travel). Adds at runtime, on top
  of whatever style loads: dashed ink route (great-circle), waypoint dots,
  hillshade relief, paper atmosphere with gold rim, and a water-color nudge that
  ONLY fires if the water is still the launch-era tan `#d9d3b4` (a published
  Studio recolor always wins).
- **Cards**: `components/Ordering.tsx` renders "Go there" when `coffee.journey` exists.
- **Env vars** (in `.env.local` AND Vercel project settings, `NEXT_PUBLIC_` prefix
  required or the browser can't see them; changing them requires restart/redeploy):
  - `NEXT_PUBLIC_MAPBOX_TOKEN`
  - `NEXT_PUBLIC_MAPBOX_STYLE`

## Editing the style in Studio

Edit → **Publish** (top right). Unpublished drafts do nothing on the site.
Rules that keep it on-DNA: land stays paper, linework stays ink, water stays a
muted wash, nothing saturated, labels stay in the published serif.

## Hard-won gotchas (each of these cost real debugging time)

1. **Studio uploads reject `geojson` sources.** The style must stay tile-only;
   route/waypoints are added at runtime by JourneyMap. Don't move them back.
2. **The map container must have explicit `width/height: 100%`**
   (`.journey-map` in `app/globals.css`). mapbox-gl stamps `.mapboxgl-map { position: relative }`
   on the same div and can win the cascade over `position: absolute; inset: 0`,
   collapsing it to zero height — map renders fine into zero pixels, console
   stays clean, page looks blank. Symptom to remember: captions run, no errors, no map.
3. **Map label fonts must exist in Mapbox's library or the photi account.**
   Missing fonts = silent 404s and no labels. Verified hosted: Source Serif Pro
   Regular, PT Serif Regular/Italic, Arial Unicode MS.
4. **`ERR_ABORTED` on tile requests during the flight is normal** (camera outruns
   tiles), not a bug.
5. **Flight ceiling**: `flyTo` gets `minZoom: 2.2` in JourneyMap. Without it the
   camera climbs until the globe is a dot and the screen is blank parchment.

## Verifying without a human (how this was tested)

Headless Chrome renders the real site + real tiles fine with
`--use-angle=swiftshader --enable-unsafe-swiftshader`. Puppeteer script pattern:
goto site → click "press to open" → click nth "Go there" → click "Skip ahead" →
wait ~12s → screenshot. Screenshots read back as images verify the whole chain
(env vars, style, tiles, terrain, route). Past proof shots from launch day are
banked in the repo root (`prod-*.png`, `shot-*.png`) — safe to delete anytime.
