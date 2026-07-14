interface ItemShowcaseCardProps {
    className?: string;
    name?: string;
    rarity?: string;
    flavor?: string;
    /** True (default) for the hero's decorative mockup use; false when this renders real, meaningful data. */
    decorative?: boolean;
}

// A small flat card mimicking Artifact Forge's generated item output —
// a name, rarity tag, and a hint of flavor text. Defaults to a decorative
// mockup; pass real fields to show actual tool output.
export function ItemShowcaseCard({
    className = "",
    name = "Ember-Kissed Blade",
    rarity = "Rare",
    flavor = "Forged in dragon-fire, it hums faintly whenever danger draws near.",
    decorative = true,
}: ItemShowcaseCardProps) {
    return (
        <div className={`border border-gold/20 bg-background/60 p-3 flex flex-col gap-1.5 ${className}`} aria-hidden={decorative || undefined}>
            <div className="flex items-center justify-between gap-2">
                <span className="font-serif text-sm accent-gold truncate">{name}</span>
                <span className="ui-tag border-crimson/40 text-crimson shrink-0">{rarity}</span>
            </div>
            <div className="h-px w-full bg-gold/10" />
            <p className="text-[10px] text-muted italic leading-relaxed line-clamp-2">
                &ldquo;{flavor}&rdquo;
            </p>
        </div>
    );
}
