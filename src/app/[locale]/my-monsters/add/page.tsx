"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCustomMonsters } from "@/app/context/CustomMonstersContext";
import type { Monster } from "@/app/types/monster";
import MonsterForm from "../MonsterForm";
import { PageSection } from "@/app/components/atoms/PageSection";
import { PageHeader } from "@/app/components/atoms/PageHeader";

export default function AddMonsterPage() {
    const t = useTranslations("myMonsters");
    const locale = useLocale();
    const router = useRouter();
    const { customMonsters, addMonster, loading } = useCustomMonsters();

    const existingNames = new Set(customMonsters.map((m) => m.name.toLowerCase()));

    async function handleSave(monster: Monster) {
        await addMonster(monster);
        router.push(`/${locale}/my-monsters`);
    }

    if (loading) return null;

    return (
        <PageSection>
            <PageHeader title={t("addMonster")} description={t("description")} />
            <MonsterForm
                existingNames={existingNames}
                onSave={handleSave}
                onCancel={() => router.push(`/${locale}/my-monsters`)}
            />
        </PageSection>
    );
}
