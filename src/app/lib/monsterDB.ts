import type { Monster } from "@/app/types/monster";

export type CustomMonster = Monster & { id: string };

const DB_NAME = "crializr";
const DB_VERSION = 1;
const STORE_NAME = "custom_monsters";

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORE_NAME)) {
                const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
                store.createIndex("name", "name", { unique: true });
                store.createIndex("cr", "cr", { unique: false });
                store.createIndex("edition", "edition", { unique: false });
                store.createIndex("affiliation", "affiliation", { unique: false });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

function withStore<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    return openDB().then(
        (db) =>
            new Promise<T>((resolve, reject) => {
                const tx = db.transaction(STORE_NAME, mode);
                const store = tx.objectStore(STORE_NAME);
                const request = fn(store);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
                tx.oncomplete = () => db.close();
            })
    );
}

export function getAllMonsters(): Promise<CustomMonster[]> {
    return withStore("readonly", (store) => store.getAll() as IDBRequest<CustomMonster[]>);
}

export function addMonster(monster: Monster): Promise<string> {
    const id = crypto.randomUUID();
    const record: CustomMonster = { ...monster, id, source: "homebrew" };
    return withStore("readwrite", (store) => store.add(record)).then(() => id);
}

export function updateMonster(id: string, monster: Monster): Promise<void> {
    const record: CustomMonster = { ...monster, id, source: "homebrew" };
    return withStore("readwrite", (store) => store.put(record)).then(() => undefined);
}

export function deleteMonster(id: string): Promise<void> {
    return withStore("readwrite", (store) => store.delete(id) as IDBRequest<undefined>).then(() => undefined);
}

export function clearAll(): Promise<void> {
    return withStore("readwrite", (store) => store.clear() as IDBRequest<undefined>).then(() => undefined);
}
