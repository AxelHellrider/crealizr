export function newId(): string {
    return typeof crypto !== "undefined" && "randomUUID" in crypto
        ? crypto.randomUUID()
        : `n-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}
