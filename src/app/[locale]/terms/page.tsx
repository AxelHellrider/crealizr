import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageSection } from "@/app/components/atoms/PageSection";
import { PageHeader } from "@/app/components/atoms/PageHeader";
import { buildHreflang } from "@/app/lib/seo";

export const metadata: Metadata = {
    title: "Terms of Use | CRealizr",
    description: "The terms governing your use of the CRealizr D&D toolkit.",
    alternates: {
        canonical: "/terms",
        languages: buildHreflang("/terms"),
    },
    openGraph: {
        title: "Terms of Use | CRealizr",
        description: "The terms governing your use of the CRealizr D&D toolkit.",
        url: "/terms",
        type: "website",
        siteName: "CRealizr",
        images: [{ url: "/og-default.svg", width: 1200, height: 630, alt: "CRealizr" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Terms of Use | CRealizr",
        description: "The terms governing your use of the CRealizr D&D toolkit.",
        images: ["/og-default.svg"],
    },
};

type Section = { heading: string; body: string[] };

export default async function TermsPage() {
    const t = await getTranslations();
    const sections = t.raw("terms.sections") as Section[];

    return (
        <PageSection>
            <PageHeader title={t("terms.title")} description={t("terms.description")} />
            <p className="text-sm text-muted italic">{t("terms.updated")}</p>

            <div className="grid gap-8">
                {sections.map((section, i) => (
                    <section key={i} className="rounded border border-gold/20 bg-card/40 p-6">
                        <h2 className="text-lg font-serif uppercase tracking-wide accent-gold">{section.heading}</h2>
                        <div className="mt-3 grid gap-3">
                            {section.body.map((paragraph, j) => (
                                <p key={j} className="text-muted leading-relaxed">{paragraph}</p>
                            ))}
                        </div>
                    </section>
                ))}
            </div>
        </PageSection>
    );
}
