"use client";

import { useCallback, useState } from "react";
import { exportMonster, exportItem } from "@/app/lib/exportCard";
import type { MonsterBase } from "@/app/types/monster";
import type { ItemBlueprint } from "@/app/services/itemService";

type ExportFormat = "png" | "pdf";

export function useMonsterExport() {
    const [isExporting, setIsExporting] = useState(false);

    const exportAs = useCallback(
        async (monster: MonsterBase, filename: string, format: ExportFormat, labels: Parameters<typeof exportMonster>[3]) => {
            setIsExporting(true);
            try {
                await exportMonster(monster, filename, format, labels);
            } finally {
                setIsExporting(false);
            }
        },
        [],
    );

    return { exportAs, isExporting };
}

export function useItemExport() {
    const [isExporting, setIsExporting] = useState(false);

    const exportAs = useCallback(async (item: ItemBlueprint, filename: string, format: ExportFormat) => {
        setIsExporting(true);
        try {
            await exportItem(item, filename, format);
        } finally {
            setIsExporting(false);
        }
    }, []);

    return { exportAs, isExporting };
}
