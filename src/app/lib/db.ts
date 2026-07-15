// Shared IndexedDB connection for the whole app. All object stores live in
// one database/version pair — IndexedDB throws a VersionError if two
// modules open the same DB name with different version numbers, so every
// store must be declared here rather than per-feature.
const DB_NAME = "crializr";
const DB_VERSION = 2;

export const STORES = {
    customMonsters: "custom_monsters",
    combatState: "combat_state",
} as const;

function openDB(): Promise<IDBDatabase> {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onupgradeneeded = () => {
            const db = request.result;
            if (!db.objectStoreNames.contains(STORES.customMonsters)) {
                const store = db.createObjectStore(STORES.customMonsters, { keyPath: "id" });
                store.createIndex("name", "name", { unique: true });
                store.createIndex("cr", "cr", { unique: false });
                store.createIndex("edition", "edition", { unique: false });
                store.createIndex("affiliation", "affiliation", { unique: false });
            }
            if (!db.objectStoreNames.contains(STORES.combatState)) {
                db.createObjectStore(STORES.combatState, { keyPath: "id" });
            }
        };

        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
    });
}

export function withStore<T>(
    storeName: string,
    mode: IDBTransactionMode,
    fn: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
    return openDB().then(
        (db) =>
            new Promise<T>((resolve, reject) => {
                const tx = db.transaction(storeName, mode);
                const store = tx.objectStore(storeName);
                const request = fn(store);
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error);
                tx.oncomplete = () => db.close();
            })
    );
}
