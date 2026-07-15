import type { Monster } from "@/app/types/monster";
import { newId } from "@/app/lib/id";
import { withStore, STORES } from "@/app/lib/db";

export type CustomMonster = Monster & { id: string };

function store<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    return withStore(STORES.customMonsters, mode, fn);
}

export function getAllMonsters(): Promise<CustomMonster[]> {
    return store("readonly", (s) => s.getAll() as IDBRequest<CustomMonster[]>);
}

export function addMonster(monster: Monster): Promise<string> {
    const id = newId();
    const record: CustomMonster = { ...monster, id, source: "homebrew" };
    return store("readwrite", (s) => s.add(record)).then(() => id);
}

export function updateMonster(id: string, monster: Monster): Promise<void> {
    const record: CustomMonster = { ...monster, id, source: "homebrew" };
    return store("readwrite", (s) => s.put(record)).then(() => undefined);
}

export function deleteMonster(id: string): Promise<void> {
    return store("readwrite", (s) => s.delete(id) as IDBRequest<undefined>).then(() => undefined);
}

export function clearAll(): Promise<void> {
    return store("readwrite", (s) => s.clear() as IDBRequest<undefined>).then(() => undefined);
}
