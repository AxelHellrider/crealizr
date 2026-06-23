"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import type { CustomMonster } from "@/app/lib/monsterDB";
import { Input } from "@/app/components/atoms/Input";

function formatCR(cr: number): string {
    if (cr === 0.125) return "1/8";
    if (cr === 0.25) return "1/4";
    if (cr === 0.5) return "1/2";
    return String(cr);
}

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
                <div className="overflow-x-auto border border-gold/10 rounded-sm">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gold/20 text-left">
                                <th className="py-3 px-4 text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">{t("form.name")}</th>
                                <th className="py-3 px-4 text-xs uppercase tracking-[0.2em] text-gold/70 font-bold">{t("form.cr")}</th>
                                <th className="py-3 px-4 text-xs uppercase tracking-[0.2em] text-gold/70 font-bold hidden sm:table-cell">{t("form.edition")}</th>
                                <th className="py-3 px-4 text-xs uppercase tracking-[0.2em] text-gold/70 font-bold hidden md:table-cell">{t("form.affiliation")}</th>
                                <th className="py-3 px-4"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {filtered.map((monster) => (
                                <tr key={monster.id} className="border-b border-gold/5 hover:bg-gold/5 transition-colors">
                                    <td className="py-3 px-4 font-serif accent-gold">{monster.name}</td>
                                    <td className="py-3 px-4 text-muted">{formatCR(monster.cr)}</td>
                                    <td className="py-3 px-4 text-muted hidden sm:table-cell">{monster.edition}</td>
                                    <td className="py-3 px-4 text-muted capitalize hidden md:table-cell">{monster.affiliation}</td>
                                    <td className="py-3 px-4 text-right whitespace-nowrap">
                                        <button
                                            onClick={() => onEdit(monster)}
                                            className="ui-link text-xs uppercase tracking-widest"
                                        >
                                            {t("editMonster")}
                                        </button>
                                        <span className="mx-2 text-gold/10">|</span>
                                        {confirmId === monster.id ? (
                                            <>
                                                <button
                                                    onClick={() => { onDelete(monster.id); setConfirmId(null); }}
                                                    className="text-red-400 hover:text-red-300 text-xs uppercase tracking-widest font-bold"
                                                >
                                                    {t("confirmDelete")}
                                                </button>
                                                <span className="mx-2 text-gold/10">|</span>
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
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
