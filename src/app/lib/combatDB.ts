import type { CombatState } from "@/app/types/combat";
import { withStore, STORES } from "@/app/lib/db";
import { migrateCombatState } from "@/app/utils/combatLogic";

// Only one combat can be active at a time (matches the hex layout's own
// single-current-encounter model), so it's stored as a single record under
// a fixed key rather than a list.
const CURRENT_KEY = "current";

type CombatRecord = CombatState & { id: typeof CURRENT_KEY };

function store<T>(mode: IDBTransactionMode, fn: (store: IDBObjectStore) => IDBRequest<T>): Promise<T> {
    return withStore(STORES.combatState, mode, fn);
}

export async function loadCombat(): Promise<CombatState | null> {
    const record = await store("readonly", (s) => s.get(CURRENT_KEY) as IDBRequest<CombatRecord | undefined>);
    if (!record) return null;
    const { id: _id, ...state } = record;
    void _id;
    return migrateCombatState(state);
}

export function saveCombat(state: CombatState): Promise<void> {
    const record: CombatRecord = { ...state, id: CURRENT_KEY };
    return store("readwrite", (s) => s.put(record)).then(() => undefined);
}

export function clearCombat(): Promise<void> {
    return store("readwrite", (s) => s.delete(CURRENT_KEY) as IDBRequest<undefined>).then(() => undefined);
}
