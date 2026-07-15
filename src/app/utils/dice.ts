/** Rolls a single die with the given number of sides (1..sides, inclusive). */
export function rollDie(sides: number): number {
    return Math.floor(Math.random() * sides) + 1;
}

/** Rolls 1d20 + modifier, as used for initiative and ability checks. */
export function rollD20(modifier = 0): number {
    return rollDie(20) + modifier;
}
