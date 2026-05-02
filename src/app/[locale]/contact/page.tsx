import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContactForm } from "./ContactForm";

export const metadata: Metadata = {
  title: "Contact | CRealizr",
  description: "Contact the CRealizr project team.",
  alternates: {
    canonical: "/contact",
  },
};

export default async function ContactPage() {
  const t = await getTranslations();
  return (
    <div className="grid gap-8 glass-panel p-8 sm:p-12 fantasy-border lg:rounded-none lg:border-x-0 lg:border-t-0">
      <header className="border-b border-gold/20 pb-6">
        <h1 className="text-4xl font-serif accent-gold uppercase tracking-tight">{t("contact.title")}</h1>
        <p className="text-muted mt-2 font-light italic">
          {t("contact.description")}
        </p>
      </header>

      <section className="grid gap-6">
        <div className="rounded border border-gold/20 bg-card/40 p-6">
          <h2 className="text-xl font-serif uppercase tracking-wide">{t("contact.email.title")}</h2>
          <p className="text-muted mt-2">{t("contact.email.description")}</p>
          <a
            href={`mailto:${t("contact.email.address")}`}
            className="mt-4 inline-flex ui-button focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold/50"
          >
            {t("contact.email.address")}
          </a>
        </div>

        <div className="rounded border border-gold/20 bg-card/40 p-6">
          <h2 className="text-xl font-serif uppercase tracking-wide">{t("contact.form.title")}</h2>
          <ContactForm />
        </div>
      </section>
    </div>
  );
}
