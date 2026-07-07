"use client";

import { useReducer, useMemo } from "react";
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

type ExampleInput = {
    name: string; type: ItemType; level: number; attunement: boolean;
    targets: string[]; ingredients: Ingredient[];
    craftingCost: number; craftingTime: number;
    craftingTimeUnit: "hours" | "days" | "weeks";
    craftingRequirement: string; lore: string;
};

type Action =
    | { type: "SET_FIELD"; key: keyof ArtifactForgeFields; value: ArtifactForgeFields[keyof ArtifactForgeFields] }
    | { type: "SET_LORE"; value: string }
    | { type: "ADD_TAG" }
    | { type: "ADD_TARGET"; value: string }
    | { type: "REMOVE_TAG"; value: string }
    | { type: "ADD_INGREDIENT" }
    | { type: "REMOVE_INGREDIENT"; index: number }
    | { type: "ADD_QUICK_INGREDIENT"; ingredient: Ingredient }
    | { type: "APPLY_EXAMPLE"; example: ExampleInput }
    | { type: "CLEAR_FLAVOR" }
    | { type: "CLEAR_CRAFTING" };

function reducer(state: ArtifactForgeFields, action: Action): ArtifactForgeFields {
    switch (action.type) {
        case "SET_FIELD":
            return { ...state, [action.key]: action.value };
        case "SET_LORE": {
            const words = action.value.trim() ? action.value.trim().split(/\s+/) : [];
            return { ...state, lore: words.length <= 100 ? action.value : words.slice(0, 100).join(" ") };
        }
        case "ADD_TAG": {
            const v = state.tagInput.trim();
            if (!v || state.targets.includes(v)) return state;
            return { ...state, targets: [...state.targets, v], tagInput: "" };
        }
        case "ADD_TARGET":
            if (state.targets.includes(action.value)) return state;
            return { ...state, targets: [...state.targets, action.value] };
        case "REMOVE_TAG":
            return { ...state, targets: state.targets.filter((x) => x !== action.value) };
        case "ADD_INGREDIENT": {
            const nameValue = state.ingredientName.trim();
            const qty = typeof state.ingredientQty === "number" ? state.ingredientQty : Number(state.ingredientQty);
            if (!nameValue || !Number.isFinite(qty) || qty <= 0) return state;
            return {
                ...state,
                ingredients: [...state.ingredients, { name: nameValue, quantity: qty, unit: state.ingredientUnit.trim() || undefined }],
                ingredientName: "",
                ingredientQty: "",
                ingredientUnit: "",
            };
        }
        case "REMOVE_INGREDIENT":
            return { ...state, ingredients: state.ingredients.filter((_, i) => i !== action.index) };
        case "ADD_QUICK_INGREDIENT":
            return { ...state, ingredients: [...state.ingredients, action.ingredient] };
        case "APPLY_EXAMPLE": {
            const example = action.example;
            return {
                ...state,
                name: example.name,
                type: state.lockMechanics ? state.type : example.type,
                level: state.lockMechanics ? state.level : example.level,
                attunement: state.lockMechanics ? state.attunement : example.attunement,
                targets: example.targets,
                ingredients: example.ingredients,
                craftingCost: example.craftingCost,
                craftingTime: example.craftingTime,
                craftingTimeUnit: example.craftingTimeUnit,
                craftingRequirement: example.craftingRequirement,
                lore: example.lore,
            };
        }
        case "CLEAR_FLAVOR":
            return { ...state, name: "", targets: [], lore: "" };
        case "CLEAR_CRAFTING":
            return { ...state, ingredients: [], craftingCost: "", craftingTime: "", craftingRequirement: "" };
        default:
            return state;
    }
}

export function useArtifactForge() {
    const [fields, dispatch] = useReducer(reducer, INITIAL_FIELDS);

    const setField = <K extends keyof ArtifactForgeFields>(key: K, value: ArtifactForgeFields[K]) => {
        dispatch({ type: "SET_FIELD", key, value });
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

    const handleLoreChange = (value: string) => dispatch({ type: "SET_LORE", value });
    const addTag = () => dispatch({ type: "ADD_TAG" });
    const addTarget = (value: string) => dispatch({ type: "ADD_TARGET", value });
    const removeTag = (value: string) => dispatch({ type: "REMOVE_TAG", value });
    const addIngredient = () => dispatch({ type: "ADD_INGREDIENT" });
    const removeIngredient = (index: number) => dispatch({ type: "REMOVE_INGREDIENT", index });
    const addQuickIngredient = (ingredient: Ingredient) => dispatch({ type: "ADD_QUICK_INGREDIENT", ingredient });
    const applyExample = (example: ExampleInput) => dispatch({ type: "APPLY_EXAMPLE", example });
    const clearFlavor = () => dispatch({ type: "CLEAR_FLAVOR" });
    const clearCrafting = () => dispatch({ type: "CLEAR_CRAFTING" });

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
