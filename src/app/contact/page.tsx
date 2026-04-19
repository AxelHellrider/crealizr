import type { Metadata } from "next";
import { ContactForm } from "@/app/contact/ContactForm";

export const metadata: Metadata = {
  title: "Contact | CRealizr",
  description: "Contact the CRealizr project team.",
  alternates: {
    canonical: "/contact",
  },
};

export default function ContactPage() {
  return (
    <div className="grid gap-8 glass-panel p-8 sm:p-12 fantasy-border">
      <header className="border-b border-gold/20 pb-6">
        <h1 className="text-4xl font-serif accent-gold uppercase tracking-tight">Contact</h1>
        <p className="text-muted mt-2 font-light italic">
          Questions, bug reports, feature requests, and collaboration inquiries.
        </p>
      </header>

      <section className="grid gap-6">
        <div className="rounded border border-gold/20 bg-card/40 p-6">
          <h2 className="text-xl font-serif uppercase tracking-wide">Email</h2>
          <p className="text-muted mt-2">Reach us directly at:</p>
          <a
            href="mailto:contact@crealizr.net"
            className="mt-4 inline-flex ui-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
          >
            contact@crealizr.net
          </a>
        </div>

        <div className="rounded border border-gold/20 bg-card/40 p-6">
          <h2 className="text-xl font-serif uppercase tracking-wide">Quick Contact Form</h2>
          <p className="text-muted mt-2">
            Uses provider-agnostic spam defenses: honeypot, timing checks, validation, and rate limiting.
          </p>
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
