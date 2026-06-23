import type { Monster, Terrain, Affiliation, Edition } from "@/app/types/monster";
import type { CustomMonster } from "@/app/lib/monsterDB";

const VALID_TERRAINS: Terrain[] = ["dungeon", "wilderness", "urban", "underwater", "planar", "any"];
const VALID_AFFILIATIONS: Affiliation[] = ["humanoid", "beast", "undead", "construct", "dragon", "fiend", "celestial", "fey", "monstrosity", "giant", "elemental", "aberration", "plant", "any"];
const VALID_EDITIONS: Edition[] = ["2014", "2024"];

export function exportMonsters(monsters: CustomMonster[]): void {
    const data = monsters.map(({ id: _, ...rest }) => rest);
    const json = JSON.stringify(data, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const date = new Date().toISOString().slice(0, 10);
    const a = document.createElement("a");
    a.href = url;
    a.download = `crializr-monsters-${date}.json`;
    a.click();
    URL.revokeObjectURL(url);
}

export function validateMonsterImport(data: unknown): { valid: Monster[]; errors: string[] } {
    const errors: string[] = [];

    if (!Array.isArray(data)) {
        return { valid: [], errors: ["Import data must be a JSON array."] };
    }

    const valid: Monster[] = [];

    for (let i = 0; i < data.length; i++) {
        const entry = data[i];
        const prefix = `Entry ${i + 1}`;

        if (!entry || typeof entry !== "object") {
            errors.push(`${prefix}: not an object.`);
            continue;
        }

        const e = entry as Record<string, unknown>;

        if (typeof e.name !== "string" || !e.name.trim()) {
            errors.push(`${prefix}: missing or invalid name.`);
            continue;
        }

        if (typeof e.cr !== "number" || !isFinite(e.cr) || e.cr < 0) {
            errors.push(`${prefix} (${e.name}): missing or invalid cr.`);
            continue;
        }

        if (!Array.isArray(e.terrain) || !e.terrain.every((t: unknown) => VALID_TERRAINS.includes(t as Terrain))) {
            errors.push(`${prefix} (${e.name}): invalid terrain.`);
            continue;
        }

        if (!VALID_AFFILIATIONS.includes(e.affiliation as Affiliation)) {
            errors.push(`${prefix} (${e.name}): invalid affiliation.`);
            continue;
        }

        if (!VALID_EDITIONS.includes(e.edition as Edition)) {
            errors.push(`${prefix} (${e.name}): invalid edition (must be "2014" or "2024").`);
            continue;
        }

        valid.push({
            ...e,
            name: (e.name as string).trim(),
            cr: e.cr as number,
            terrain: e.terrain as Terrain[],
            affiliation: e.affiliation as Affiliation,
            edition: e.edition as Edition,
            source: "homebrew",
        } as Monster);
    }

    return { valid, errors };
}
