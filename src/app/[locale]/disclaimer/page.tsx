import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { PageSection } from "@/app/components/atoms/PageSection";
import { PageHeader } from "@/app/components/atoms/PageHeader";
import { buildHreflang } from "@/app/lib/seo";
import type { LegalSection } from "@/app/types/legal";

export const metadata: Metadata = {
    title: "Disclaimer | CRealizr",
    description: "Important information about the nature and limitations of CRealizr, an unofficial D&D fan toolkit.",
    alternates: {
        canonical: "/disclaimer",
        languages: buildHreflang("/disclaimer"),
    },
    openGraph: {
        title: "Disclaimer | CRealizr",
        description: "Important information about the nature and limitations of CRealizr, an unofficial D&D fan toolkit.",
        url: "/disclaimer",
        type: "website",
        siteName: "CRealizr",
        images: [{ url: "/og-default.svg", width: 1200, height: 630, alt: "CRealizr" }],
    },
    twitter: {
        card: "summary_large_image",
        title: "Disclaimer | CRealizr",
        description: "Important information about the nature and limitations of CRealizr, an unofficial D&D fan toolkit.",
        images: ["/og-default.svg"],
    },
};

export default async function DisclaimerPage() {
    const t = await getTranslations();
    const sections = t.raw("disclaimer.sections") as LegalSection[];

    return (
        <PageSection>
            <PageHeader title={t("disclaimer.title")} description={t("disclaimer.description")} />
            <p className="text-sm text-muted italic">{t("disclaimer.updated")}</p>

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
