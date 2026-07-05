import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { ContactForm } from "./ContactForm";
import { PageSection } from "@/app/components/atoms/PageSection";
import { PageHeader } from "@/app/components/atoms/PageHeader";
import { buildHreflang } from "@/app/lib/seo";

export const metadata: Metadata = {
    title: "Contact the CRealizr Team",
    description: "Get in touch with the CRealizr team — feedback, bug reports, feature requests, or just to say hello.",
    alternates: {
        canonical: "/contact",
        languages: buildHreflang("/contact"),
    },
    openGraph: {
        title: "Contact | CRealizr",
        description: "Get in touch with the CRealizr team — feedback, bug reports, feature requests, or just to say hello.",
        url: "/contact",
        type: "website",
        siteName: "CRealizr",
        images: [{ url: "/og-default.svg", width: 1200, height: 630, alt: "CRealizr" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Contact | CRealizr",
        description: "Get in touch with the CRealizr team — feedback, bug reports, or feature requests.",
        images: ["/og-default.svg"],
    },
};

export default async function ContactPage() {
  const t = await getTranslations();
  return (
    <PageSection>
      <PageHeader title={t("contact.title")} description={t("contact.description")} />

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
    </PageSection>
  );
}
