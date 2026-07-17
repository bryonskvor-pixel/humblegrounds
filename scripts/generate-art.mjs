// Station A site art (projectcontext.md §6): coffee plate cards, jar, glyphs.
//
//   node scripts/generate-art.mjs kochere           4 variants
//   node scripts/generate-art.mjs cold-brew --variants 2
//
// Same locked style + refs as generate-plate.mjs, 4:3 card aspect.
// Output: assets/art/candidates/<name>-v<n>.png, log in assets/art/PROMPTS.md.

import { readFileSync, writeFileSync, appendFileSync, mkdirSync, existsSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

const STYLE_SUFFIX =
  "Vintage botanical illustration style, fine dark ink linework like a crow-quill pen, delicate crosshatching for ground and shadows, soft colored-pencil and muted watercolor wash shading inside the ink outlines, warm aged cream paper background with subtle texture, muted natural palette, centered composition with generous negative space, hand-drawn scientific field-guide aesthetic, no photorealism, no digital gradients, no text.";

const FRAMING =
  "Botanical specimen plate composition, subjects levitating weightlessly against bare paper, no ground, no surface, only a faint soft ink-hatched shadow floating below.";

// §5.2: plate art echoes each coffee's tasting notes
const SUBJECTS = {
  kochere:
    "A single green coffee bean floating vertical at the center, flanked by a delicate sprig of white coffee blossom, a thin slice of lime, and a small stem of lemon verbena with tiny white flowers, arranged like a pressed specimen.",
  "cold-brew":
    "A glass mason jar filled with dark cold brew coffee, floating gently, condensation droplets drawn in fine ink on the glass, a soft celadon green watercolor tint in the highlights, two coffee beans drifting beside it.",
  "masthead-glyph":
    "A small antique hand-crank coffee roasting drum, drawn as a tiny scientific instrument diagram, simple and compact.",
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

function styleRefs() {
  const paths = [join(root, "assets", "style-refs", "hg-bean-ref.jpg")];
  const p1small = join(root, "assets", "plates", "refs-small", "p1.jpg");
  if (existsSync(p1small)) paths.push(p1small);
  return paths.map((path) => {
    const buf = readFileSync(path);
    const mime = /\.png$/i.test(path) ? "image/png" : "image/jpeg";
    return { name: path.split(/[\\/]/).pop(), dataUri: `data:${mime};base64,${buf.toString("base64")}` };
  });
}

async function generateOne(apiKey, model, prompt, refs, outPath, label) {
  const body = { prompt, width: 1440, height: 1088 };
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
  const { polling_url: pollingUrl } = await submit.json();

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
      return;
    }
    if (data.status !== "Pending" && data.status !== "Queued" && data.status !== "Processing") {
      throw new Error(`${label}: status ${data.status}: ${JSON.stringify(data.result ?? data)}`);
    }
  }
  throw new Error(`${label}: timed out`);
}

const args = process.argv.slice(2);
const subjectKey = args[0]?.toLowerCase();
if (!SUBJECTS[subjectKey]) {
  console.error(`Usage: node scripts/generate-art.mjs <${Object.keys(SUBJECTS).join("|")}> [--variants N] [--model M]`);
  process.exit(1);
}
const variants = Number(args[args.indexOf("--variants") + 1]) || 4;
const model = args.includes("--model") ? args[args.indexOf("--model") + 1] : "flux-2-pro";

const env = loadEnv();
if (!env.BFL_API_KEY) {
  console.error("BFL_API_KEY missing from .env.local");
  process.exit(1);
}

const prompt = `${SUBJECTS[subjectKey]} ${FRAMING} ${STYLE_SUFFIX}`;
const refs = styleRefs();
const outDir = join(root, "assets", "art", "candidates");
mkdirSync(outDir, { recursive: true });

console.log(`Art ${subjectKey} · ${variants} variants · ${model}`);

const results = await Promise.allSettled(
  Array.from({ length: variants }, (_, i) =>
    generateOne(env.BFL_API_KEY, model, prompt, refs, join(outDir, `${subjectKey}-v${i + 1}.png`), `${subjectKey}-v${i + 1}`)
  )
);
const failures = results.filter((r) => r.status === "rejected");
failures.forEach((f) => console.error(f.reason.message ?? f.reason));

appendFileSync(
  join(root, "assets", "art", "PROMPTS.md"),
  `\n## ${subjectKey} · ${new Date().toISOString()} · ${model} · ${variants - failures.length}/${variants} ok\n\n> ${prompt}\n`
);

console.log(`${variants - failures.length}/${variants} succeeded.`);
if (failures.length) process.exit(1);
