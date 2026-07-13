"use client";

import { useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useCustomMonsters } from "@/app/context/CustomMonstersContext";
import type { CustomMonster } from "@/app/lib/monsterDB";
import MonsterTable from "./MonsterTable";
import { Button } from "@/app/components/atoms/Button";
import { InfoGrid } from "@/app/components/molecules/InfoGrid";
import { PageSection } from "@/app/components/atoms/PageSection";
import { PageHeader } from "@/app/components/atoms/PageHeader";

export default function MyMonstersPage() {
    const t = useTranslations("myMonsters");
    const locale = useLocale();
    const router = useRouter();
    const { customMonsters, deleteMonster, importMonsters, exportAllMonsters, loading } = useCustomMonsters();

    const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    function handleEdit(monster: CustomMonster) {
        router.push(`/${locale}/my-monsters/edit/${monster.id}`);
    }

    async function handleDelete(id: string) {
        await deleteMonster(id);
        setFeedback(null);
    }

    async function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (!file) return;

        try {
            const text = await file.text();
            const data = JSON.parse(text);
            const result = await importMonsters(data);

            if (result.errors.length > 0) {
                setFeedback({
                    type: "error",
                    message: `${t("importErrors")}\n${result.errors.join("\n")}`,
                });
            }
            if (result.added > 0) {
                setFeedback({
                    type: "success",
                    message: t("importSuccess", { count: result.added }),
                });
            }
        } catch {
            setFeedback({ type: "error", message: "Invalid JSON file." });
        }

        if (fileInputRef.current) fileInputRef.current.value = "";
    }

    if (loading) return null;

    return (
        <PageSection>

            {/* ── Header ── */}
            <PageHeader title={t("title")} description={t("description")} />

            {/* ── Info cards ── */}
            <InfoGrid items={[
                { label: t("infoStorage"), description: t("infoStorageDesc") },
                { label: t("infoUsage"), description: t("infoUsageDesc") },
                { label: t("infoPortability"), description: t("infoPortabilityDesc") },
            ]} />

            {/* ── Feedback ── */}
            {feedback && (
                <div className={`p-4 rounded-sm text-sm border ${
                    feedback.type === "success" ? "border-green-500/20 bg-green-500/5 text-green-400" : "border-red-500/20 bg-red-500/5 text-red-400"
                }`}>
                    <pre className="whitespace-pre-wrap font-sans">{feedback.message}</pre>
                </div>
            )}

            {/* ── Actions bar ── */}
            <div className="flex flex-wrap items-center gap-3">
                <Button data-testid="add-monster-btn" onClick={() => router.push(`/${locale}/my-monsters/add`)} className="px-5 py-2.5 text-xs uppercase tracking-widest">
                    + {t("addMonster")}
                </Button>
                <span className="hidden sm:block w-px h-6 bg-gold/10" />
                <Button
                    onClick={exportAllMonsters}
                    disabled={customMonsters.length === 0}
                    className="px-4 py-2 text-xs uppercase tracking-widest"
                >
                    {t("export")} ({customMonsters.length})
                </Button>
                <label className="ui-button px-4 py-2 text-xs uppercase tracking-widest cursor-pointer">
                    {t("import")}
                    <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
                </label>
            </div>

            {/* ── Monster list ── */}
            <MonsterTable monsters={customMonsters} onEdit={handleEdit} onDelete={handleDelete} />
        </PageSection>
    );
}
