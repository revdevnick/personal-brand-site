import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact",
  description: "Write to Nick Perkins through the contact form.",
};

export default function ContactPage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-20">
      <p className="font-ui text-xs tracking-[0.2em] text-ink/50 uppercase">Contact</p>
      <h1 className="mt-4 font-display text-5xl">Write.</h1>
      <p className="mt-6 max-w-xl text-lg text-ink/75">
        If you need a pastor, a sermon link, or help with a technical problem, use the form. I will read it.
      </p>
      <ContactForm />
    </div>
  );
}
