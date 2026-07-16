// Station A (projectcontext.md §7): FLUX.2 keyframe plate generation.
//
//   node scripts/generate-plate.mjs p1            4 variants of plate P1
//   node scripts/generate-plate.mjs p3 --variants 2
//   node scripts/generate-plate.mjs p1 --model flux-2-flex
//
// Reads BFL_API_KEY from .env.local. Style references: every canna-*.png/jpg
// in assets/style-refs plus hg-bean-ref.jpg (the approved brand bean).
// Output: assets/plates/candidates/<plate>-v<n>.png, log in assets/plates/PROMPTS.md.

import { readFileSync, writeFileSync, appendFileSync, mkdirSync, readdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

// §3.2 locked style suffix, verbatim (with the doc's flagged "negous" typo fixed)
const STYLE_SUFFIX =
  "Vintage botanical illustration style, fine dark ink linework like a crow-quill pen, delicate crosshatching for ground and shadows, soft colored-pencil and muted watercolor wash shading inside the ink outlines, warm aged cream paper background with subtle texture, muted natural palette, centered composition with generous negative space, hand-drawn scientific field-guide aesthetic, no photorealism, no digital gradients, no text.";

// Framing shared by all six plates so the bean reads as one metamorphosis (§4.2,
// revised per Bryon: subject levitates in empty space, no ground)
const FRAMING =
  "Wide 16:9 plate, single centered subject oriented vertical and levitating weightlessly in empty space against the bare paper, occupying roughly the middle 45 percent of the frame height, no ground, no soil, no grass, no surface anywhere, only a faint soft ink-hatched shadow floating well below the subject.";

// §4.2 plate descriptions
const PLATES = {
  p1: "A single ripe coffee cherry, deep muted red watercolor wash, floating serenely in space.",
  p2: "A coffee cherry whose skin has split and curls away in ink-lined petals that drift suspended around it, revealing a pale bean sheathed in glossy mucilage rendered as pale wash highlights.",
  p3: "A clean washed coffee bean, vertical with its seam running top to bottom, pale celadon green watercolor wash, matte surface, a few small ink-drawn water droplets suspended in the air around it, a beat of visual calm.",
  p4: "A coffee bean floating vertical, its color deepened through amber toward medium roast brown, two or three thin ink-hatched smoke curls rising above it, a warm amber glow wash gathering beneath it, absolutely no flame.",
  p5: "A medium roast coffee bean floating vertical, its center seam visibly parted a few millimeters, warm golden light rendered as watercolor wash emanating from the gap, the edges of the split slightly lifted.",
  p6: "Two separate halves of a roasted coffee bean floating apart in empty space like open double doors, a wide empty gap between them filled only with warm golden light, the left half in the left third of the frame and the right half in the right third, nothing crossing the vertical centerline of the frame, the flat cut faces of the halves facing each other and glowing gold.",
};

function loadEnv() {
  const envPath = join(root, ".env.local");
  const env = {};
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
      if (m && !line.trim().startsWith("#")) env[m[1]] = m[2].trim();
    }
  }
  return env;
}

function styleRefs(currentPlate) {
  const refDir = join(root, "assets", "style-refs");
  const entries = readdirSync(refDir)
    .filter((f) => /^canna-.*\.(png|jpe?g)$/i.test(f))
    .sort()
    .slice(0, 4)
    .map((f) => join(refDir, f));
  entries.push(join(refDir, "hg-bean-ref.jpg"));
  // approved plates anchor composition and paper across the sequence;
  // prefer the downscaled refs-small copies to keep request payloads small
  const plateDir = join(root, "assets", "plates");
  for (const p of ["p1", "p2", "p3", "p4", "p5", "p6"]) {
    if (p === currentPlate) continue;
    const small = join(plateDir, "refs-small", `${p}.jpg`);
    const full = join(plateDir, `${p}.png`);
    if (existsSync(small)) entries.push(small);
    else if (existsSync(full)) entries.push(full);
  }
  return entries.slice(0, 8).map((path) => {
    const buf = readFileSync(path);
    const mime = /\.png$/i.test(path) ? "image/png" : "image/jpeg";
    return { name: path.split(/[\\/]/).pop(), dataUri: `data:${mime};base64,${buf.toString("base64")}` };
  });
}

async function generateOne(apiKey, model, prompt, refs, outPath, label) {
  const body = { prompt, width: 1920, height: 1088 };
  refs.forEach((r, i) => {
    body[i === 0 ? "input_image" : `input_image_${i + 1}`] = r.dataUri;
  });

  let submit;
  for (let attempt = 1; ; attempt++) {
    try {
      submit = await fetch(`https://api.bfl.ai/v1/${model}`, {
        method: "POST",
        headers: { "x-key": apiKey, "Content-Type": "application/json", accept: "application/json" },
        body: JSON.stringify(body),
      });
      if (submit.ok) break;
      throw new Error(`submit failed ${submit.status}: ${await submit.text()}`);
    } catch (err) {
      if (attempt >= 4) throw new Error(`${label}: ${err.message ?? err}`);
      console.log(`  ${label}: attempt ${attempt} failed (${err.cause?.code ?? err.message}), retrying...`);
      await new Promise((r) => setTimeout(r, attempt * 3000));
    }
  }
  const { polling_url: pollingUrl, id } = await submit.json();

  for (let tries = 0; tries < 120; tries++) {
    await new Promise((r) => setTimeout(r, 2000));
    const poll = await fetch(pollingUrl, { headers: { "x-key": apiKey, accept: "application/json" } });
    if (!poll.ok) throw new Error(`${label}: poll failed ${poll.status}`);
    const data = await poll.json();
    if (data.status === "Ready") {
      const img = await fetch(data.result.sample);
      if (!img.ok) throw new Error(`${label}: download failed ${img.status}`);
      writeFileSync(outPath, Buffer.from(await img.arrayBuffer()));
      console.log(`  saved ${outPath}`);
      return { id, ok: true };
    }
    if (data.status !== "Pending" && data.status !== "Queued" && data.status !== "Processing") {
      throw new Error(`${label}: status ${data.status}: ${JSON.stringify(data.result ?? data)}`);
    }
  }
  throw new Error(`${label}: timed out`);
}

const args = process.argv.slice(2);
const plateKey = args[0]?.toLowerCase();
if (!PLATES[plateKey]) {
  console.error(`Usage: node scripts/generate-plate.mjs <p1..p6> [--variants N] [--model M]`);
  process.exit(1);
}
const variants = Number(args[args.indexOf("--variants") + 1]) || 4;
const model = args.includes("--model") ? args[args.indexOf("--model") + 1] : "flux-2-pro";

const env = loadEnv();
if (!env.BFL_API_KEY) {
  console.error("BFL_API_KEY missing from .env.local");
  process.exit(1);
}

const prompt = `${PLATES[plateKey]} ${FRAMING} ${STYLE_SUFFIX}`;
const refs = styleRefs(plateKey);
const outDir = join(root, "assets", "plates", "candidates");
mkdirSync(outDir, { recursive: true });

console.log(`Plate ${plateKey.toUpperCase()} · ${variants} variants · ${model}`);
console.log(`Refs: ${refs.map((r) => r.name).join(", ")}`);

const results = await Promise.allSettled(
  Array.from({ length: variants }, (_, i) =>
    generateOne(env.BFL_API_KEY, model, prompt, refs, join(outDir, `${plateKey}-v${i + 1}.png`), `${plateKey}-v${i + 1}`)
  )
);

const failures = results.filter((r) => r.status === "rejected");
failures.forEach((f) => console.error(f.reason.message ?? f.reason));

appendFileSync(
  join(root, "assets", "plates", "PROMPTS.md"),
  [
    ``,
    `## ${plateKey.toUpperCase()} · ${new Date().toISOString()} · ${model} · ${variants - failures.length}/${variants} ok`,
    ``,
    `Refs: ${refs.map((r) => r.name).join(", ")}`,
    ``,
    `> ${prompt}`,
    ``,
  ].join("\n")
);

console.log(`${variants - failures.length}/${variants} succeeded.`);
if (failures.length) process.exit(1);
