"use client";

import { FormEvent, useState } from "react";

const formId = process.env.NEXT_PUBLIC_FORMSPREE_ID;

export function ContactForm() {
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;

    if (!formId) {
      setStatus("sent");
      form.reset();
      return;
    }

    setStatus("sending");
    const data = new FormData(form);
    const response = await fetch(`https://formspree.io/f/${formId}`, {
      method: "POST",
      body: data,
      headers: { Accept: "application/json" },
    });
    setStatus(response.ok ? "sent" : "error");
    if (response.ok) form.reset();
  }

  return (
    <form onSubmit={onSubmit} className="mt-10 max-w-lg space-y-6">
      <label className="block font-ui text-sm">
        Name
        <input
          required
          name="name"
          className="mt-2 w-full border border-ink/20 bg-transparent px-3 py-3"
        />
      </label>
      <label className="block font-ui text-sm">
        Email
        <input
          required
          type="email"
          name="email"
          className="mt-2 w-full border border-ink/20 bg-transparent px-3 py-3"
        />
      </label>
      <label className="block font-ui text-sm">
        Message
        <textarea
          required
          name="message"
          rows={6}
          className="mt-2 w-full border border-ink/20 bg-transparent px-3 py-3"
        />
      </label>
      <button
        type="submit"
        disabled={status === "sending"}
        className="magnetic border border-ink bg-ink px-6 py-3 font-ui text-sm text-study"
      >
        {status === "sending" ? "Sending…" : "Send"}
      </button>
      {status === "sent" ? <p className="text-sm">Received. I will read it.</p> : null}
      {status === "error" ? (
        <p className="text-sm">The form did not send. Please try again in a moment.</p>
      ) : null}
    </form>
  );
}
