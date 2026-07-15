import { NextResponse } from "next/server";
import type { OrderPayload } from "@/lib/types";

// One endpoint, no database (§5.3). Sends the order to Bryon via Resend when
// RESEND_API_KEY + ORDER_EMAIL_TO are configured; otherwise logs it so v1
// still works before keys exist.
export async function POST(request: Request) {
  let order: OrderPayload;
  try {
    order = await request.json();
  } catch {
    return NextResponse.json({ error: "bad json" }, { status: 400 });
  }

  if (
    !Array.isArray(order.items) ||
    order.items.length === 0 ||
    typeof order.name !== "string" ||
    !order.name.trim() ||
    typeof order.address !== "string" ||
    !order.address.trim() ||
    !["local", "ship"].includes(order.delivery) ||
    !["venmo", "cash"].includes(order.payment)
  ) {
    return NextResponse.json({ error: "missing fields" }, { status: 400 });
  }
  if (order.payment === "cash" && order.delivery !== "local") {
    return NextResponse.json({ error: "cash is local only" }, { status: 400 });
  }

  const lines = [
    `New Humble Grounds order from ${order.name.trim()}`,
    "",
    ...order.items.map((i) => `  ${i.qty} x ${i.name}`),
    "",
    `Delivery: ${order.delivery === "local" ? "local doorstep" : "ship"}`,
    `Address / instructions: ${order.address.trim()}`,
    `Payment: ${order.payment}`,
  ];
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
        from: process.env.ORDER_EMAIL_FROM ?? "orders@resend.dev",
        to: [to],
        subject: `Coffee order: ${order.name.trim()}`,
        text,
      }),
    });
    if (!res.ok) {
      console.error("resend failed", res.status, await res.text());
      return NextResponse.json({ error: "send failed" }, { status: 502 });
    }
  } else {
    // No email configured yet; keep the order visible in Vercel logs.
    console.log("[order]", text);
  }

  return NextResponse.json({ ok: true });
}
