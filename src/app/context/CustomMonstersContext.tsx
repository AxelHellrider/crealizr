"use client";

import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from "react";
import type { Monster } from "@/app/types/monster";
import {
    type CustomMonster,
    getAllMonsters,
    addMonster as dbAdd,
    updateMonster as dbUpdate,
    deleteMonster as dbDelete,
} from "@/app/lib/monsterDB";
import { exportMonsters as ioExport, validateMonsterImport } from "@/app/lib/monsterIO";

type CustomMonstersContextValue = {
    customMonsters: CustomMonster[];
    loading: boolean;
    addMonster: (monster: Monster) => Promise<string>;
    updateMonster: (id: string, monster: Monster) => Promise<void>;
    deleteMonster: (id: string) => Promise<void>;
    importMonsters: (data: unknown) => Promise<{ added: number; errors: string[] }>;
    exportAllMonsters: () => void;
};

const CustomMonstersContext = createContext<CustomMonstersContextValue | null>(null);

export function CustomMonstersProvider({ children }: { children: ReactNode }) {
    const [customMonsters, setCustomMonsters] = useState<CustomMonster[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getAllMonsters()
            .then(setCustomMonsters)
            .catch(() => setCustomMonsters([]))
            .finally(() => setLoading(false));
    }, []);

    const addMonster = useCallback(async (monster: Monster): Promise<string> => {
        const id = await dbAdd(monster);
        const record: CustomMonster = { ...monster, id, source: "homebrew" };
        setCustomMonsters((prev) => [...prev, record]);
        return id;
    }, []);

    const updateMonster = useCallback(async (id: string, monster: Monster): Promise<void> => {
        await dbUpdate(id, monster);
        const record: CustomMonster = { ...monster, id, source: "homebrew" };
        setCustomMonsters((prev) => prev.map((m) => (m.id === id ? record : m)));
    }, []);

    const deleteMonster = useCallback(async (id: string): Promise<void> => {
        await dbDelete(id);
        setCustomMonsters((prev) => prev.filter((m) => m.id !== id));
    }, []);

    const importMonsters = useCallback(async (data: unknown): Promise<{ added: number; errors: string[] }> => {
        const { valid, errors } = validateMonsterImport(data);
        const existingNames = new Set(customMonsters.map((m) => m.name.toLowerCase()));
        let added = 0;

        for (const monster of valid) {
            if (existingNames.has(monster.name.toLowerCase())) {
                errors.push(`"${monster.name}" already exists, skipped.`);
                continue;
            }
            const id = await dbAdd(monster);
            const record: CustomMonster = { ...monster, id, source: "homebrew" };
            setCustomMonsters((prev) => [...prev, record]);
            existingNames.add(monster.name.toLowerCase());
            added++;
        }

        return { added, errors };
    }, [customMonsters]);

    const exportAllMonsters = useCallback(() => {
        ioExport(customMonsters);
    }, [customMonsters]);

    return (
        <CustomMonstersContext value={{
            customMonsters,
            loading,
            addMonster,
            updateMonster,
            deleteMonster,
            importMonsters,
            exportAllMonsters,
        }}>
            {children}
        </CustomMonstersContext>
    );
}

export function useCustomMonsters(): CustomMonstersContextValue {
    const ctx = useContext(CustomMonstersContext);
    if (!ctx) throw new Error("useCustomMonsters must be used within CustomMonstersProvider");
    return ctx;
}
