"use client";

import { useParams, useRouter } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useCustomMonsters } from "@/app/context/CustomMonstersContext";
import type { Monster } from "@/app/types/monster";
import MonsterForm from "../../MonsterForm";
import { PageSection } from "@/app/components/atoms/PageSection";
import { PageHeader } from "@/app/components/atoms/PageHeader";
import { Button } from "@/app/components/atoms/Button";

export default function EditMonsterPage() {
    const t = useTranslations("myMonsters");
    const locale = useLocale();
    const router = useRouter();
    const params = useParams<{ id: string }>();
    const { customMonsters, updateMonster, loading } = useCustomMonsters();

    if (loading) return null;

    const monster = customMonsters.find((m) => m.id === params.id);

    if (!monster) {
        return (
            <PageSection>
                <PageHeader title={t("editMonster")} description={t("description")} />
                <p className="text-muted text-sm">{t("emptyState")}</p>
                <Button onClick={() => router.push(`/${locale}/my-monsters`)} className="px-5 py-2.5 text-xs uppercase tracking-widest self-start">
                    {t("cancel")}
                </Button>
            </PageSection>
        );
    }

    const existingNames = new Set(
        customMonsters.filter((m) => m.id !== monster.id).map((m) => m.name.toLowerCase())
    );

    const handleSave = async (updated: Monster) => {
        await updateMonster(monster.id, updated);
        router.push(`/${locale}/my-monsters`);
    };

    return (
        <PageSection>
            <PageHeader title={t("editMonster")} description={t("description")} />
            <MonsterForm
                initial={monster}
                existingNames={existingNames}
                onSave={handleSave}
                onCancel={() => router.push(`/${locale}/my-monsters`)}
            />
        </PageSection>
    );
}
