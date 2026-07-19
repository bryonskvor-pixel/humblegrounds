import { NextResponse } from "next/server";
import type { ContactPayload } from "@/lib/types";

// Contact form endpoint. Same shape as /api/order: Resend when configured,
// Vercel logs otherwise.

function looksLikeEmail(s: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s);
}

export async function POST(request: Request) {
  let msg: ContactPayload;
  try {
    msg = await request.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  if (
    typeof msg.name !== "string" ||
    !msg.name.trim() ||
    typeof msg.email !== "string" ||
    !looksLikeEmail(msg.email.trim()) ||
    typeof msg.message !== "string" ||
    !msg.message.trim() ||
    msg.message.length > 5000
  ) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }

  const text = [
    `Question from the site, from ${msg.name.trim()} <${msg.email.trim()}>`,
    "",
    msg.message.trim(),
  ].join("\n");

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
        from: "Humble Grounds <bryon@humblegrounds.coffee>",
        to: [to],
        reply_to: msg.email.trim(),
        subject: `Site question from ${msg.name.trim()}`,
        text,
      }),
    });
    if (!res.ok) {
      console.error("resend failed", res.status, await res.text());
      return NextResponse.json({ error: "send failed" }, { status: 502 });
    }
  } else {
    console.log("[contact]", text);
  }

  return NextResponse.json({ ok: true });
}
