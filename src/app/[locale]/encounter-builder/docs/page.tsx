import { getTranslations } from "next-intl/server";
import { PageSection } from "@/app/components/atoms/PageSection";
import { PageHeader } from "@/app/components/atoms/PageHeader";
import { DocSections, type DocSection } from "@/app/components/molecules/DocSections";

export default async function BalanceDocsPage() {
    const t = await getTranslations("encounterBuilderDocs");
    const sections = t.raw("sections") as DocSection[];

    return (
        <PageSection>
            <PageHeader title={t("title")} description={t("description")} />
            <DocSections sections={sections} note={t("note")} />
        </PageSection>
    );
}
