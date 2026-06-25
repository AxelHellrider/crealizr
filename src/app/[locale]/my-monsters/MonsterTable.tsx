"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { CustomMonster } from "@/app/lib/monsterDB";
import { Input } from "@/app/components/atoms/Input";
import { formatCR } from "@/app/lib/format";

type Props = {
    monsters: CustomMonster[];
    onEdit: (monster: CustomMonster) => void;
    onDelete: (id: string) => void;
};

export default function MonsterTable({ monsters, onEdit, onDelete }: Props) {
    const t = useTranslations("myMonsters");
    const [search, setSearch] = useState("");
    const [confirmId, setConfirmId] = useState<string | null>(null);

    const filtered = search
        ? monsters.filter((m) => m.name.toLowerCase().includes(search.toLowerCase()))
        : monsters;

    return (
        <div className="space-y-4">
            <Input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={t("search")}
            />

            {filtered.length === 0 ? (
                <div className="py-12 text-center border border-gold/10 rounded-sm">
                    <p className="text-muted text-sm italic">{t("emptyState")}</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map((monster) => (
                        <div
                            key={monster.id}
                            className="border border-gold/10 rounded-sm p-4 hover:border-gold/30 transition-colors bg-gradient-to-b from-gold/[0.02] to-transparent"
                        >
                            <div className="flex items-start justify-between mb-3">
                                <h3 className="font-serif accent-gold text-lg leading-tight">{monster.name}</h3>
                                <span className="ml-2 shrink-0 text-xs font-bold uppercase tracking-widest bg-gold/10 text-gold/70 px-2 py-1 rounded-sm">
                                    CR {formatCR(monster.cr)}
                                </span>
                            </div>

                            <div className="space-y-1 text-xs text-muted mb-4">
                                {monster.type && (
                                    <p className="capitalize">{monster.size} {monster.type}</p>
                                )}
                                <p className="capitalize">{monster.affiliation}</p>
                                <p>{monster.edition === "2024" ? "2024 Rules" : "2014 Rules"}</p>
                                {monster.stats && (
                                    <div className="grid grid-cols-3 gap-x-3 gap-y-0.5 mt-2 pt-2 border-t border-gold/10">
                                        <span>AC {monster.stats.ac}</span>
                                        <span>HP {monster.stats.hp}</span>
                                        <span>{monster.stats.speed}</span>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center gap-2 pt-3 border-t border-gold/10">
                                <button
                                    onClick={() => onEdit(monster)}
                                    className="ui-link text-xs uppercase tracking-widest"
                                >
                                    {t("editMonster")}
                                </button>
                                <span className="text-gold/10">|</span>
                                {confirmId === monster.id ? (
                                    <>
                                        <button
                                            onClick={() => { onDelete(monster.id); setConfirmId(null); }}
                                            className="text-red-400 hover:text-red-300 text-xs uppercase tracking-widest font-bold"
                                        >
                                            {t("confirmDelete")}
                                        </button>
                                        <span className="text-gold/10">|</span>
                                        <button
                                            onClick={() => setConfirmId(null)}
                                            className="text-muted hover:text-gold text-xs uppercase tracking-widest"
                                        >
                                            {t("cancel")}
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={() => setConfirmId(monster.id)}
                                        className="text-red-400/50 hover:text-red-400 text-xs uppercase tracking-widest"
                                    >
                                        {t("delete")}
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
