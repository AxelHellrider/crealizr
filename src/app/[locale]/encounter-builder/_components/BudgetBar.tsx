/** Thin progress bar showing how close a suggestion's budget fit is to 100%. */
export function BudgetBar({ fit, accent = "gold" }: { fit: number; accent?: "gold" | "silver" }) {
    return (
        <div className={`mt-2.5 h-px w-full ${accent === "silver" ? "bg-silver/10" : "bg-gold/10"} rounded-full overflow-hidden`}>
            <div
                className={`h-full ${accent === "silver" ? "bg-silver shadow-[0_0_8px_rgba(148,163,184,0.5)]" : "bg-gold shadow-[0_0_8px_rgba(197,160,89,0.5)]"}`}
                style={{ width: `${Math.min(fit * 100, 100)}%` }}
            />
        </div>
    );
}
