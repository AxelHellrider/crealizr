export type DMG2014Row = {
    cr: number;
    profBonus: number;
    expectedAC: number; // ideal AC
    hpMin: number;
    hpMax: number;
    dprMin: number;
    dprMax: number;
    atkBonus: number; // typical attack bonus for offensive CR (approx)
    saveDC: number; // typical save DC for spells/abilities at that CR
};