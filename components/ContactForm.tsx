"use client";

import { useState } from "react";

// Short question form (§ footer). Posts to /api/contact, which lands in
// Bryon's inbox via Resend.
export default function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState(""); // honeypot, left blank by real visitors
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) {
      setError("A name, so Bryon knows who's asking.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError("An email, so the answer has somewhere to go.");
      return;
    }
    if (!message.trim()) {
      setError("The question itself, please.");
      return;
    }
    setStatus("sending");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim(), email: email.trim(), message: message.trim(), company }),
      });
      if (!res.ok) throw new Error(`contact endpoint returned ${res.status}`);
      setStatus("sent");
    } catch {
      setStatus("idle");
      setError("Something hiccuped sending that. Try once more, or just email Bryon directly.");
    }
  }

  if (status === "sent") {
    return (
      <div className="contact-form contact-sent">
        <p>Got it. Bryon will be in touch.</p>
      </div>
    );
  }

  return (
    <form className="contact-form" onSubmit={submit}>
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

      <label htmlFor="contact-name">NAME</label>
      <input id="contact-name" type="text" value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />

      <label htmlFor="contact-email">EMAIL</label>
      <input id="contact-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email" />

      <label htmlFor="contact-message">YOUR QUESTION</label>
      <textarea id="contact-message" rows={4} value={message} onChange={(e) => setMessage(e.target.value)} />

      {error && <p className="slip-error">{error}</p>}

      <button className="order-btn" type="submit" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Send it"}
      </button>
    </form>
  );
}
