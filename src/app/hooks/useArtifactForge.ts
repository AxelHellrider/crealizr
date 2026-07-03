"use client";

import { useState, useMemo } from "react";
import { buildItemBlueprint, type ItemType, type ItemBlueprint } from "@/app/services/itemService";

type Ingredient = { name: string; quantity: number; unit?: string };

export type ArtifactForgeFields = {
    name: string;
    type: ItemType;
    attunement: boolean;
    level: number;
    targets: string[];
    tagInput: string;
    ingredients: Ingredient[];
    ingredientName: string;
    ingredientQty: number | "";
    ingredientUnit: string;
    craftingCost: number | "";
    craftingTime: number | "";
    craftingTimeUnit: "hours" | "days" | "weeks";
    craftingRequirement: string;
    lore: string;
    lockMechanics: boolean;
};

const INITIAL_FIELDS: ArtifactForgeFields = {
    name: "",
    type: "Weapon",
    attunement: false,
    level: 5,
    targets: [],
    tagInput: "",
    ingredients: [],
    ingredientName: "",
    ingredientQty: "",
    ingredientUnit: "",
    craftingCost: "",
    craftingTime: "",
    craftingTimeUnit: "days",
    craftingRequirement: "",
    lore: "",
    lockMechanics: false,
};

export function useArtifactForge() {
    const [fields, setFields] = useState<ArtifactForgeFields>(INITIAL_FIELDS);

    const setField = <K extends keyof ArtifactForgeFields>(key: K, value: ArtifactForgeFields[K]) => {
        setFields((prev) => ({ ...prev, [key]: value }));
    };

    const item: ItemBlueprint = useMemo(
        () =>
            buildItemBlueprint({
                name: fields.name,
                type: fields.type,
                attunement: fields.attunement,
                level: fields.level,
                targets: fields.targets,
                ingredients: fields.ingredients,
                craftingCost: fields.craftingCost === "" ? undefined : fields.craftingCost,
                craftingTime: fields.craftingTime === "" ? undefined : fields.craftingTime,
                craftingTimeUnit: fields.craftingTimeUnit,
                craftingRequirement: fields.craftingRequirement.trim() || undefined,
                lore: fields.lore.trim() || undefined,
            }),
        [
            fields.name, fields.type, fields.attunement, fields.level, fields.targets,
            fields.ingredients, fields.craftingCost, fields.craftingTime,
            fields.craftingTimeUnit, fields.craftingRequirement, fields.lore,
        ],
    );

    const loreWordCount = fields.lore.trim() ? fields.lore.trim().split(/\s+/).length : 0;

    const handleLoreChange = (value: string) => {
        const words = value.trim() ? value.trim().split(/\s+/) : [];
        setField("lore", words.length <= 100 ? value : words.slice(0, 100).join(" "));
    };

    const addTag = () => {
        const v = fields.tagInput.trim();
        if (!v || fields.targets.includes(v)) return;
        setFields((prev) => ({ ...prev, targets: [...prev.targets, v], tagInput: "" }));
    };

    const addTarget = (v: string) => {
        if (!fields.targets.includes(v))
            setFields((prev) => ({ ...prev, targets: [...prev.targets, v] }));
    };

    const removeTag = (v: string) => {
        setFields((prev) => ({ ...prev, targets: prev.targets.filter((x) => x !== v) }));
    };

    const addIngredient = () => {
        const nameValue = fields.ingredientName.trim();
        const qty = typeof fields.ingredientQty === "number" ? fields.ingredientQty : Number(fields.ingredientQty);
        if (!nameValue || !Number.isFinite(qty) || qty <= 0) return;
        setFields((prev) => ({
            ...prev,
            ingredients: [...prev.ingredients, { name: nameValue, quantity: qty, unit: prev.ingredientUnit.trim() || undefined }],
            ingredientName: "",
            ingredientQty: "",
            ingredientUnit: "",
        }));
    };

    const removeIngredient = (index: number) => {
        setFields((prev) => ({ ...prev, ingredients: prev.ingredients.filter((_, i) => i !== index) }));
    };

    const addQuickIngredient = (ingredient: Ingredient) => {
        setFields((prev) => ({ ...prev, ingredients: [...prev.ingredients, ingredient] }));
    };

    const applyExample = (example: {
        name: string; type: ItemType; level: number; attunement: boolean;
        targets: string[]; ingredients: Ingredient[];
        craftingCost: number; craftingTime: number;
        craftingTimeUnit: "hours" | "days" | "weeks";
        craftingRequirement: string; lore: string;
    }) => {
        setFields((prev) => ({
            ...prev,
            name: example.name,
            type: prev.lockMechanics ? prev.type : example.type,
            level: prev.lockMechanics ? prev.level : example.level,
            attunement: prev.lockMechanics ? prev.attunement : example.attunement,
            targets: example.targets,
            ingredients: example.ingredients,
            craftingCost: example.craftingCost,
            craftingTime: example.craftingTime,
            craftingTimeUnit: example.craftingTimeUnit,
            craftingRequirement: example.craftingRequirement,
            lore: example.lore,
        }));
    };

    const clearFlavor = () => setFields((prev) => ({ ...prev, name: "", targets: [], lore: "" }));
    const clearCrafting = () => setFields((prev) => ({
        ...prev, ingredients: [], craftingCost: "", craftingTime: "", craftingRequirement: "",
    }));

    return {
        fields, setField,
        item,
        loreWordCount,
        handleLoreChange,
        addTag, addTarget, removeTag,
        addIngredient, removeIngredient, addQuickIngredient,
        applyExample, clearFlavor, clearCrafting,
    };
}
