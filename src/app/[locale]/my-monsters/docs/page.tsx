import { getTranslations } from "next-intl/server";
import { PageSection } from "@/app/components/atoms/PageSection";
import { PageHeader } from "@/app/components/atoms/PageHeader";
import { DocSections, type DocSection } from "@/app/components/molecules/DocSections";

export default async function MyMonstersDocsPage() {
    const t = await getTranslations("myMonstersDocs");
    const sections = t.raw("sections") as DocSection[];

    return (
        <PageSection>
            <PageHeader title={t("title")} description={t("description")} />
            <DocSections sections={sections} note={t("note")} />
        </PageSection>
    );
}
