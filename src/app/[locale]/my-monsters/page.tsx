"use client";

import { useState, useRef } from "react";
import { useTranslations } from "next-intl";
import { useCustomMonsters } from "@/app/context/CustomMonstersContext";
import type { CustomMonster } from "@/app/lib/monsterDB";
import type { Monster } from "@/app/types/monster";
import MonsterForm from "./MonsterForm";
import MonsterTable from "./MonsterTable";
import { Card } from "@/app/components/atoms/Card";
import { Button } from "@/app/components/atoms/Button";

export default function MyMonstersPage() {
    const t = useTranslations("myMonsters");
    const { customMonsters, addMonster, updateMonster, deleteMonster, importMonsters, exportAllMonsters, loading } = useCustomMonsters();

    const [mode, setMode] = useState<"list" | "add" | "edit">("list");
    const [editingMonster, setEditingMonster] = useState<CustomMonster | null>(null);
    const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const existingNames = new Set(
        customMonsters
            .filter((m) => m.id !== editingMonster?.id)
            .map((m) => m.name.toLowerCase())
    );

    async function handleSave(monster: Monster) {
        if (mode === "edit" && editingMonster) {
            await updateMonster(editingMonster.id, monster);
        } else {
            await addMonster(monster);
        }
        setMode("list");
        setEditingMonster(null);
    }

    function handleEdit(monster: CustomMonster) {
        setEditingMonster(monster);
        setMode("edit");
        setFeedback(null);
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
        <section className="grid gap-8 glass-panel p-5 lg:p-12 fantasy-border lg:rounded-none lg:border-x-0 lg:border-t-0">

            {/* ── Header ── */}
            <header className="flex flex-col lg:flex-row lg:items-baseline justify-between gap-4 border-b border-gold/20 pb-6">
                <div>
                    <h1 className="text-4xl font-serif accent-gold uppercase tracking-tight">{t("title")}</h1>
                    <p className="text-muted mt-2 font-light italic">{t("description")}</p>
                </div>
            </header>

            {/* ── Info cards ── */}
            <Card className="p-6 border-gold/10">
                <div className="grid gap-4 grid-cols-1 lg:grid-cols-3 text-sm">
                    <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">{t("infoStorage")}</div>
                        <p className="text-muted mt-2">{t("infoStorageDesc")}</p>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">{t("infoUsage")}</div>
                        <p className="text-muted mt-2">{t("infoUsageDesc")}</p>
                    </div>
                    <div>
                        <div className="text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">{t("infoPortability")}</div>
                        <p className="text-muted mt-2">{t("infoPortabilityDesc")}</p>
                    </div>
                </div>
            </Card>

            {/* ── Feedback ── */}
            {feedback && (
                <div className={`p-4 rounded-sm text-sm border ${
                    feedback.type === "success" ? "border-green-500/20 bg-green-500/5 text-green-400" : "border-red-500/20 bg-red-500/5 text-red-400"
                }`}>
                    <pre className="whitespace-pre-wrap font-sans">{feedback.message}</pre>
                </div>
            )}

            {mode === "list" ? (
                <>
                    {/* ── Actions bar ── */}
                    <div className="flex flex-wrap items-center gap-3">
                        <Button onClick={() => { setMode("add"); setFeedback(null); }} className="px-5 py-2.5 text-xs uppercase tracking-widest">
                            + {t("addMonster")}
                        </Button>
                        <span className="hidden sm:block w-px h-6 bg-gold/10" />
                        <button
                            onClick={exportAllMonsters}
                            disabled={customMonsters.length === 0}
                            className="ui-button px-4 py-2 text-xs uppercase tracking-widest disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                            {t("export")} ({customMonsters.length})
                        </button>
                        <label className="ui-button px-4 py-2 text-xs uppercase tracking-widest cursor-pointer">
                            {t("import")}
                            <input ref={fileInputRef} type="file" accept=".json" onChange={handleImport} className="hidden" />
                        </label>
                    </div>

                    {/* ── Monster list ── */}
                    <MonsterTable monsters={customMonsters} onEdit={handleEdit} onDelete={handleDelete} />
                </>
            ) : (
                <MonsterForm
                    initial={editingMonster ?? undefined}
                    existingNames={existingNames}
                    onSave={handleSave}
                    onCancel={() => { setMode("list"); setEditingMonster(null); }}
                />
            )}
        </section>
    );
}
