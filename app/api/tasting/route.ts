import { NextResponse } from "next/server";
import type { TastingPayload } from "@/lib/types";

// One endpoint, no database, same shape as /api/order. Sends the taster's notes
// to Bryon via Resend when RESEND_API_KEY + ORDER_EMAIL_TO are configured;
// otherwise logs them so the feature works before keys exist.
//
// Everything the taster sends is optional except the notes themselves. This is
// a "for fun, if you want" feature, so keep validation light and never block a
// friendly submission over a missing name.

export async function POST(request: Request) {
  let body: TastingPayload;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  // Honeypot: a field real visitors never see or fill. Bots that fill every
  // input trip it; report success without sending so they don't retry.
  if (typeof body.company === "string" && body.company.trim()) {
    return NextResponse.json({ ok: true });
  }

  const notes = Array.isArray(body.notes)
    ? body.notes
        .filter((n) => n && typeof n.flavor === "string" && n.flavor.trim() && n.flavor.length <= 200)
        .map((n) => ({
          flavor: n.flavor.trim(),
          when: typeof n.when === "string" ? n.when.slice(0, 100) : undefined,
          temperature: typeof n.temperature === "string" ? n.temperature.slice(0, 100) : undefined,
        }))
    : [];

  if (notes.length === 0) {
    return NextResponse.json({ error: "no notes" }, { status: 400 });
  }
  // Gentle ceiling so a stuck loop or a bad actor can't mail a novel.
  if (notes.length > 40) {
    return NextResponse.json({ error: "too many notes" }, { status: 400 });
  }

  const taster = (typeof body.taster === "string" ? body.taster : "").trim().slice(0, 200);
  const coffee = (typeof body.coffee === "string" ? body.coffee : "").trim().slice(0, 200);
  const comment = (typeof body.comment === "string" ? body.comment : "").trim().slice(0, 2000);

  const lines = [
    `New tasting notes${taster ? ` from ${taster}` : " (no name given)"}`,
    coffee ? `Coffee: ${coffee}` : "Coffee: not specified",
    "",
    ...notes.map((n) => {
      const when = [n.when, n.temperature].filter(Boolean).join(", ");
      return `  ${n.flavor}${when ? `  (${when})` : ""}`;
    }),
    "",
    comment ? `They added: ${comment}` : "",
  ].filter((l, i, a) => !(l === "" && a[i - 1] === "")); // no double blanks
  const text = lines.join("\n");

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.ORDER_EMAIL_TO;

  if (apiKey && to) {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from: process.env.ORDER_EMAIL_FROM ?? "Humble Grounds <bryon@humblegrounds.coffee>",
        to: [to],
        subject: `Tasting notes${taster ? `: ${taster}` : ""}${coffee ? ` — ${coffee}` : ""}`,
        text,
      }),
    });
    if (!res.ok) {
      console.error("resend failed", res.status, await res.text());
      return NextResponse.json({ error: "send failed" }, { status: 502 });
    }
  } else {
    // No email configured yet; keep the notes visible in Vercel logs.
    console.log("[tasting]", text);
  }

  return NextResponse.json({ ok: true });
}
