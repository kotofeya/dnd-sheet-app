export interface SaveTier {
    minLevel: number; maxLevel: number;
    death: number; wands: number; paralysis: number; breath: number; spells: number;
}

export interface ClassFeature {
    name: string;
    minLevel: number;
    description: string;
}

export interface ClassData {
    name: string;
    hitDie: number;
    /** Derived: 20 - attackBonus[level]. Kept for backward compatibility with the UI. */
    thac0: number[];
    /** Dark Dungeons Base Attack Bonus by level (index = level). */
    attackBonus?: readonly number[];
    /** Fixed hit points gained per level after 9th (no Con bonus). */
    hpPerLevelAfter9?: number;
    xpTable: readonly number[];
    saves: SaveTier[];
    features?: ClassFeature[];
    spellProgression?: number[][];
    undeadTypes?: string[];
    turnMatrix?: string[][];
    thiefSkillsList?: string[];
    thiefSkillsMatrix?: (number | string)[][];
    weaponFeatsProgression?: {
        start: number;
        gainLevels: number[];
    };
    allowedArmor?: string;
    allowedShields?: boolean;
    allowedWeapons?: string;
    /** Extra hit points added to every hit die before 9th level (Bandit: 1d6+1 per level). */
    hpDieBonus?: number;
    /** Minimum ability scores to take the class (checked and shown as a warning). */
    minScores?: Partial<Record<'strength' | 'intelligence' | 'wisdom' | 'dexterity' | 'constitution' | 'charisma', number>>;
    /** Other entry restrictions shown to the player (race, alignment...). */
    restrictions?: string[];
    /** Spellcasting from the class's own level using spellProgression. */
    casterType?: 'arcane' | 'divine';
    /** Armour the class may wear: any, none, leather only, or chain mail or lighter (AC 5+). */
    armour?: 'any' | 'none' | 'leather' | 'chainOrLighter';
    /** Level at which Smash and Parry become available. */
    smashParryLevel?: number;
    /** [level, attacks] steps for multiple attacks vs foes hit on a 2+. */
    multipleAttacks?: [number, number][];
    /** Rulebook the class comes from. */
    source?: string;
    /** [XP total, attacks] steps when the book gives multiple attacks by XP rather than level (GAZ13). */
    multipleAttacksXp?: [number, number][];
    /** Class option (sub-class) that is only offered to this base class. */
    optionOf?: string;
    /** Sub-class that rises in level together with the main class (no separate sub-class level). */
    sharesMainLevel?: boolean;
    /** Sub-class with its own level and XP bar (XP is split between the two tracks). */
    ownXpTrack?: boolean;
    /** Sub-class level may never exceed the main class level (GAZ13 shamans). */
    maxLevelIsMain?: boolean;
    /** Sub-class: XP needed on top of the main class's table at each level (Divine Magic Table 4.12). */
    extraXpTable?: readonly number[];
    /** Sub-class casts from its own spell list (spell casterType) instead of the general list. */
    spellList?: string;
    /** Sub-class: the only Immortal it may serve. */
    fixedDeity?: string;
    /** Sub-class turns undead as a Cleric of the same level. */
    turnsUndead?: boolean;
    /** Sub-class never gains Fighter Combat Options or multiple attacks. */
    noCombatOptions?: boolean;
    /** Sub-class may only use the weapons this class may use. */
    weaponsAs?: string;
    /** Minimum XP before the sub-class's spells work (Test of Rafiel at 1,000 XP). */
    spellsFromXp?: number;
    /** Creature heroes (PC1/PC2): Hit Dice by level as [dice, extra hp]; index = level. Past the end, +hpPerLevelAfter9 per level. */
    hitDiceTable?: readonly (readonly [number, number])[];
    /** Creature heroes: stages before 1st level, entered by XP (may be negative). */
    preStages?: { name: string; short: string; xp: number; dice: number; plus: number; armourClass?: number; thac0: number }[];
    /** Natural armour class when unarmoured; worn armour only counts if it is better. */
    naturalArmourClass?: number;
    /** Mystic-only level data (DD Table 4-8): natural AC, movement, strike-to-kill, thief-like abilities. */
    mysticTable?: {
        armourClass: readonly number[];
        movementPerRound: readonly number[];
        strikeToKillAttacks: readonly number[];
        strikeToKillDamage: readonly string[];
        thiefAbilities: readonly (readonly number[])[];
    };
}

// ---------------------------------------------------------------------------
// Level tables transcribed from Dark Dungeons, Chapter 4 (Tables 4-2a .. 4-9).
// Index 0 is unused; index N = character level N (1..36).
// Generated from the rulebook tables; do not hand-edit individual cells.
// ---------------------------------------------------------------------------

const FighterXP: readonly number[] = [0, 0, 2000, 4000, 8000, 16000, 32000, 64000, 120000, 240000, 360000, 480000, 600000, 720000, 840000, 960000, 1080000, 1200000, 1320000, 1440000, 1560000, 1680000, 1800000, 1920000, 2040000, 2160000, 2280000, 2400000, 2520000, 2640000, 2760000, 2880000, 3000000, 3120000, 3240000, 3360000, 3480000];
const FighterAttackBonus: readonly number[] = [0, 1, 1, 2, 2, 3, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 12, 12, 13, 14, 14, 15, 16, 16, 17, 18, 18, 19, 20, 20, 21, 22, 22, 23, 23];
const ClericXP: readonly number[] = [0, 0, 1500, 3000, 6000, 12000, 25000, 50000, 100000, 200000, 300000, 400000, 500000, 600000, 700000, 800000, 900000, 1000000, 1100000, 1200000, 1300000, 1400000, 1500000, 1600000, 1700000, 1800000, 1900000, 2000000, 2100000, 2200000, 2300000, 2400000, 2500000, 2600000, 2700000, 2800000, 2900000];
const ClericAttackBonus: readonly number[] = [0, 1, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18];
const MageXP: readonly number[] = [0, 0, 2500, 5000, 10000, 20000, 40000, 80000, 150000, 300000, 450000, 600000, 750000, 900000, 1050000, 1200000, 1350000, 1500000, 1650000, 1800000, 1950000, 2100000, 2250000, 2400000, 2550000, 2700000, 2850000, 3000000, 3150000, 3300000, 3450000, 3600000, 3750000, 3900000, 4050000, 4200000, 4350000];
const MageAttackBonus: readonly number[] = [0, 1, 1, 1, 1, 2, 2, 3, 3, 3, 4, 4, 5, 5, 5, 6, 6, 7, 7, 7, 8, 8, 9, 9, 9, 10, 10, 11, 11, 11, 12, 12, 13, 13, 13, 14, 15];
const ThiefXP: readonly number[] = [0, 0, 1200, 2400, 4800, 9600, 20000, 40000, 80000, 160000, 280000, 400000, 520000, 640000, 760000, 880000, 1000000, 1120000, 1240000, 1360000, 1480000, 1600000, 1720000, 1840000, 1960000, 2080000, 2200000, 2320000, 2440000, 2560000, 2680000, 2800000, 2920000, 3040000, 3160000, 3280000, 3400000];
const ThiefAttackBonus: readonly number[] = [0, 1, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18];
const DwarfXP: readonly number[] = [0, 0, 2200, 4400, 8800, 17000, 35000, 70000, 140000, 270000, 400000, 530000, 660000, 800000, 950000, 1100000, 1250000, 1400000, 1550000, 1700000, 1850000, 2000000, 2150000, 2300000, 2450000, 2600000, 2750000, 2900000, 3050000, 3200000, 3350000, 3500000, 3650000, 3800000, 3950000, 4100000, 4250000];
const DwarfAttackBonus: readonly number[] = [0, 1, 1, 2, 2, 3, 4, 4, 5, 6, 6, 7, 8, 8, 9, 10, 10, 11, 12, 12, 13, 14, 14, 15, 16, 16, 17, 18, 18, 19, 20, 20, 21, 22, 22, 23, 23];
const ElfXP: readonly number[] = [0, 0, 4000, 8000, 16000, 32000, 64000, 120000, 250000, 400000, 550000, 700000, 850000, 1000000, 1150000, 1300000, 1450000, 1600000, 1750000, 1900000, 2050000, 2200000, 2350000, 2500000, 2650000, 2800000, 2950000, 3100000, 3250000, 3400000, 3550000, 3700000, 3850000, 4000000, 4150000, 4300000, 4450000];
const ElfAttackBonus: readonly number[] = [0, 1, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18];
const HalflingXP: readonly number[] = [0, 0, 2000, 4000, 8000, 16000, 32000, 64000, 120000, 240000, 360000, 480000, 600000, 720000, 840000, 960000, 1080000, 1200000, 1320000, 1440000, 1560000, 1680000, 1800000, 1920000, 2040000, 2160000, 2280000, 2400000, 2520000, 2640000, 2760000, 2880000, 3000000, 3120000, 3240000, 3360000, 3480000];
const HalflingAttackBonus: readonly number[] = [0, 1, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18];
const MysticXP: readonly number[] = [0, 0, 2000, 4000, 8000, 16000, 32000, 64000, 120000, 240000, 360000, 480000, 600000, 720000, 840000, 960000, 1080000, 1200000, 1320000, 1440000, 1560000, 1680000, 1800000, 1920000, 2040000, 2160000, 2280000, 2400000, 2520000, 2640000, 2760000, 2880000, 3000000, 3120000, 3240000, 3360000, 3480000];
const MysticAttackBonus: readonly number[] = [0, 1, 1, 1, 2, 2, 3, 3, 4, 4, 5, 5, 6, 6, 7, 7, 8, 8, 9, 9, 10, 10, 11, 11, 12, 12, 13, 13, 14, 14, 15, 15, 16, 16, 17, 17, 18];

/** Dark Dungeons uses a Base Attack Bonus; THAC0 = 20 - BAB (hit if d20 + BAB + mods + targetAC >= 20). */
const toThac0 = (bab: readonly number[]): number[] => bab.map((b, i) => (i === 0 ? 20 : 20 - b));

const FighterSaves: SaveTier[] = [
    { minLevel: 1, maxLevel: 2, death: 12, wands: 13, paralysis: 14, breath: 15, spells: 16 },
    { minLevel: 3, maxLevel: 4, death: 11, wands: 12, paralysis: 13, breath: 14, spells: 15 },
    { minLevel: 5, maxLevel: 5, death: 10, wands: 11, paralysis: 12, breath: 13, spells: 14 },
    { minLevel: 6, maxLevel: 7, death: 9, wands: 10, paralysis: 11, breath: 12, spells: 13 },
    { minLevel: 8, maxLevel: 8, death: 8, wands: 9, paralysis: 10, breath: 11, spells: 12 },
    { minLevel: 9, maxLevel: 10, death: 7, wands: 8, paralysis: 9, breath: 10, spells: 11 },
    { minLevel: 11, maxLevel: 12, death: 6, wands: 7, paralysis: 8, breath: 9, spells: 10 },
    { minLevel: 13, maxLevel: 15, death: 6, wands: 6, paralysis: 7, breath: 8, spells: 9 },
    { minLevel: 16, maxLevel: 18, death: 5, wands: 6, paralysis: 6, breath: 7, spells: 8 },
    { minLevel: 19, maxLevel: 21, death: 5, wands: 5, paralysis: 6, breath: 6, spells: 7 },
    { minLevel: 22, maxLevel: 24, death: 4, wands: 5, paralysis: 5, breath: 5, spells: 6 },
    { minLevel: 25, maxLevel: 27, death: 4, wands: 4, paralysis: 5, breath: 4, spells: 5 },
    { minLevel: 28, maxLevel: 30, death: 3, wands: 4, paralysis: 4, breath: 3, spells: 4 },
    { minLevel: 31, maxLevel: 33, death: 3, wands: 3, paralysis: 3, breath: 2, spells: 3 },
    { minLevel: 34, maxLevel: 36, death: 2, wands: 2, paralysis: 2, breath: 2, spells: 2 },
];

const ClericSaves: SaveTier[] = [
    { minLevel: 1, maxLevel: 3, death: 11, wands: 12, paralysis: 14, breath: 16, spells: 15 },
    { minLevel: 4, maxLevel: 5, death: 10, wands: 11, paralysis: 13, breath: 15, spells: 14 },
    { minLevel: 6, maxLevel: 7, death: 9, wands: 10, paralysis: 12, breath: 14, spells: 13 },
    { minLevel: 8, maxLevel: 9, death: 8, wands: 9, paralysis: 11, breath: 13, spells: 12 },
    { minLevel: 10, maxLevel: 11, death: 7, wands: 8, paralysis: 10, breath: 12, spells: 11 },
    { minLevel: 12, maxLevel: 12, death: 7, wands: 8, paralysis: 9, breath: 11, spells: 10 },
    { minLevel: 13, maxLevel: 13, death: 6, wands: 7, paralysis: 9, breath: 11, spells: 10 },
    { minLevel: 14, maxLevel: 15, death: 6, wands: 7, paralysis: 8, breath: 10, spells: 9 },
    { minLevel: 16, maxLevel: 16, death: 6, wands: 7, paralysis: 7, breath: 9, spells: 8 },
    { minLevel: 17, maxLevel: 17, death: 5, wands: 7, paralysis: 7, breath: 9, spells: 8 },
    { minLevel: 18, maxLevel: 19, death: 5, wands: 7, paralysis: 6, breath: 8, spells: 7 },
    { minLevel: 20, maxLevel: 20, death: 5, wands: 6, paralysis: 6, breath: 7, spells: 6 },
    { minLevel: 21, maxLevel: 21, death: 4, wands: 6, paralysis: 5, breath: 7, spells: 6 },
    { minLevel: 22, maxLevel: 23, death: 4, wands: 5, paralysis: 5, breath: 6, spells: 5 },
    { minLevel: 24, maxLevel: 24, death: 4, wands: 5, paralysis: 5, breath: 5, spells: 5 },
    { minLevel: 25, maxLevel: 25, death: 3, wands: 4, paralysis: 4, breath: 5, spells: 4 },
    { minLevel: 26, maxLevel: 28, death: 3, wands: 4, paralysis: 4, breath: 4, spells: 4 },
    { minLevel: 29, maxLevel: 32, death: 2, wands: 3, paralysis: 3, breath: 3, spells: 3 },
    { minLevel: 33, maxLevel: 36, death: 2, wands: 2, paralysis: 2, breath: 2, spells: 2 },
];

const MageSaves: SaveTier[] = [
    { minLevel: 1, maxLevel: 3, death: 13, wands: 14, paralysis: 13, breath: 16, spells: 15 },
    { minLevel: 4, maxLevel: 4, death: 13, wands: 14, paralysis: 13, breath: 16, spells: 14 },
    { minLevel: 5, maxLevel: 5, death: 12, wands: 13, paralysis: 12, breath: 15, spells: 14 },
    { minLevel: 6, maxLevel: 6, death: 12, wands: 13, paralysis: 12, breath: 15, spells: 13 },
    { minLevel: 7, maxLevel: 7, death: 11, wands: 12, paralysis: 11, breath: 14, spells: 13 },
    { minLevel: 8, maxLevel: 8, death: 11, wands: 12, paralysis: 11, breath: 14, spells: 12 },
    { minLevel: 9, maxLevel: 9, death: 11, wands: 12, paralysis: 11, breath: 14, spells: 11 },
    { minLevel: 10, maxLevel: 10, death: 10, wands: 11, paralysis: 10, breath: 13, spells: 11 },
    { minLevel: 11, maxLevel: 11, death: 10, wands: 11, paralysis: 10, breath: 13, spells: 10 },
    { minLevel: 12, maxLevel: 12, death: 9, wands: 10, paralysis: 9, breath: 12, spells: 10 },
    { minLevel: 13, maxLevel: 13, death: 9, wands: 10, paralysis: 9, breath: 12, spells: 9 },
    { minLevel: 14, maxLevel: 14, death: 9, wands: 10, paralysis: 9, breath: 12, spells: 8 },
    { minLevel: 15, maxLevel: 15, death: 8, wands: 9, paralysis: 8, breath: 11, spells: 8 },
    { minLevel: 16, maxLevel: 16, death: 8, wands: 9, paralysis: 8, breath: 11, spells: 7 },
    { minLevel: 17, maxLevel: 17, death: 7, wands: 8, paralysis: 7, breath: 10, spells: 7 },
    { minLevel: 18, maxLevel: 19, death: 7, wands: 8, paralysis: 7, breath: 10, spells: 6 },
    { minLevel: 20, maxLevel: 21, death: 6, wands: 7, paralysis: 6, breath: 9, spells: 5 },
    { minLevel: 22, maxLevel: 23, death: 5, wands: 6, paralysis: 5, breath: 8, spells: 4 },
    { minLevel: 24, maxLevel: 24, death: 5, wands: 5, paralysis: 5, breath: 7, spells: 4 },
    { minLevel: 25, maxLevel: 25, death: 4, wands: 5, paralysis: 4, breath: 7, spells: 3 },
    { minLevel: 26, maxLevel: 27, death: 4, wands: 4, paralysis: 4, breath: 6, spells: 3 },
    { minLevel: 28, maxLevel: 28, death: 4, wands: 4, paralysis: 4, breath: 5, spells: 3 },
    { minLevel: 29, maxLevel: 29, death: 3, wands: 3, paralysis: 3, breath: 5, spells: 2 },
    { minLevel: 30, maxLevel: 31, death: 3, wands: 3, paralysis: 3, breath: 4, spells: 2 },
    { minLevel: 32, maxLevel: 32, death: 3, wands: 3, paralysis: 3, breath: 3, spells: 2 },
    { minLevel: 33, maxLevel: 33, death: 2, wands: 2, paralysis: 2, breath: 3, spells: 2 },
    { minLevel: 34, maxLevel: 36, death: 2, wands: 2, paralysis: 2, breath: 2, spells: 2 },
];

const ThiefSaves: SaveTier[] = [
    { minLevel: 1, maxLevel: 3, death: 13, wands: 14, paralysis: 13, breath: 16, spells: 15 },
    { minLevel: 4, maxLevel: 5, death: 12, wands: 13, paralysis: 12, breath: 15, spells: 14 },
    { minLevel: 6, maxLevel: 7, death: 11, wands: 12, paralysis: 11, breath: 14, spells: 13 },
    { minLevel: 8, maxLevel: 9, death: 10, wands: 11, paralysis: 10, breath: 13, spells: 12 },
    { minLevel: 10, maxLevel: 11, death: 9, wands: 10, paralysis: 9, breath: 12, spells: 11 },
    { minLevel: 12, maxLevel: 13, death: 8, wands: 9, paralysis: 8, breath: 11, spells: 10 },
    { minLevel: 14, maxLevel: 15, death: 7, wands: 8, paralysis: 7, breath: 10, spells: 9 },
    { minLevel: 16, maxLevel: 17, death: 6, wands: 7, paralysis: 6, breath: 9, spells: 8 },
    { minLevel: 18, maxLevel: 19, death: 5, wands: 6, paralysis: 5, breath: 8, spells: 7 },
    { minLevel: 20, maxLevel: 20, death: 5, wands: 6, paralysis: 5, breath: 7, spells: 6 },
    { minLevel: 21, maxLevel: 21, death: 4, wands: 5, paralysis: 4, breath: 7, spells: 6 },
    { minLevel: 22, maxLevel: 23, death: 4, wands: 5, paralysis: 4, breath: 6, spells: 5 },
    { minLevel: 24, maxLevel: 24, death: 4, wands: 5, paralysis: 4, breath: 5, spells: 5 },
    { minLevel: 25, maxLevel: 25, death: 3, wands: 4, paralysis: 3, breath: 5, spells: 4 },
    { minLevel: 26, maxLevel: 28, death: 3, wands: 4, paralysis: 3, breath: 4, spells: 4 },
    { minLevel: 29, maxLevel: 29, death: 2, wands: 3, paralysis: 2, breath: 3, spells: 3 },
    { minLevel: 30, maxLevel: 32, death: 2, wands: 3, paralysis: 2, breath: 3, spells: 2 },
    { minLevel: 33, maxLevel: 36, death: 2, wands: 2, paralysis: 2, breath: 2, spells: 2 },
];

const DwarfSaves: SaveTier[] = [
    { minLevel: 1, maxLevel: 2, death: 8, wands: 9, paralysis: 10, breath: 13, spells: 12 },
    { minLevel: 3, maxLevel: 3, death: 7, wands: 8, paralysis: 9, breath: 12, spells: 11 },
    { minLevel: 4, maxLevel: 4, death: 7, wands: 8, paralysis: 9, breath: 11, spells: 10 },
    { minLevel: 5, maxLevel: 5, death: 6, wands: 7, paralysis: 8, breath: 10, spells: 9 },
    { minLevel: 6, maxLevel: 6, death: 5, wands: 6, paralysis: 7, breath: 9, spells: 8 },
    { minLevel: 7, maxLevel: 7, death: 5, wands: 6, paralysis: 7, breath: 8, spells: 7 },
    { minLevel: 8, maxLevel: 8, death: 4, wands: 5, paralysis: 6, breath: 7, spells: 6 },
    { minLevel: 9, maxLevel: 9, death: 3, wands: 4, paralysis: 5, breath: 6, spells: 5 },
    { minLevel: 10, maxLevel: 10, death: 3, wands: 4, paralysis: 5, breath: 5, spells: 4 },
    { minLevel: 11, maxLevel: 12, death: 2, wands: 3, paralysis: 4, breath: 4, spells: 3 },
    { minLevel: 13, maxLevel: 14, death: 2, wands: 3, paralysis: 4, breath: 3, spells: 3 },
    { minLevel: 15, maxLevel: 18, death: 2, wands: 2, paralysis: 3, breath: 2, spells: 2 },
    { minLevel: 19, maxLevel: 36, death: 2, wands: 2, paralysis: 2, breath: 2, spells: 2 },
];

const ElfSaves: SaveTier[] = [
    { minLevel: 1, maxLevel: 2, death: 12, wands: 13, paralysis: 13, breath: 15, spells: 15 },
    { minLevel: 3, maxLevel: 3, death: 11, wands: 12, paralysis: 12, breath: 14, spells: 14 },
    { minLevel: 4, maxLevel: 4, death: 9, wands: 11, paralysis: 11, breath: 12, spells: 12 },
    { minLevel: 5, maxLevel: 5, death: 8, wands: 10, paralysis: 10, breath: 11, spells: 11 },
    { minLevel: 6, maxLevel: 6, death: 7, wands: 9, paralysis: 9, breath: 10, spells: 10 },
    { minLevel: 7, maxLevel: 7, death: 5, wands: 8, paralysis: 8, breath: 8, spells: 8 },
    { minLevel: 8, maxLevel: 8, death: 4, wands: 7, paralysis: 7, breath: 7, spells: 7 },
    { minLevel: 9, maxLevel: 9, death: 3, wands: 6, paralysis: 6, breath: 6, spells: 6 },
    { minLevel: 10, maxLevel: 10, death: 3, wands: 5, paralysis: 5, breath: 4, spells: 4 },
    { minLevel: 11, maxLevel: 12, death: 2, wands: 4, paralysis: 4, breath: 3, spells: 3 },
    { minLevel: 13, maxLevel: 13, death: 2, wands: 4, paralysis: 4, breath: 2, spells: 2 },
    { minLevel: 14, maxLevel: 16, death: 2, wands: 3, paralysis: 3, breath: 2, spells: 2 },
    { minLevel: 17, maxLevel: 36, death: 2, wands: 2, paralysis: 2, breath: 2, spells: 2 },
];

const HalflingSaves: SaveTier[] = [
    { minLevel: 1, maxLevel: 2, death: 8, wands: 9, paralysis: 10, breath: 13, spells: 12 },
    { minLevel: 3, maxLevel: 3, death: 7, wands: 8, paralysis: 9, breath: 12, spells: 11 },
    { minLevel: 4, maxLevel: 4, death: 6, wands: 7, paralysis: 8, breath: 10, spells: 9 },
    { minLevel: 5, maxLevel: 5, death: 5, wands: 6, paralysis: 7, breath: 9, spells: 8 },
    { minLevel: 6, maxLevel: 6, death: 4, wands: 5, paralysis: 6, breath: 8, spells: 7 },
    { minLevel: 7, maxLevel: 7, death: 3, wands: 4, paralysis: 5, breath: 6, spells: 5 },
    { minLevel: 8, maxLevel: 9, death: 2, wands: 3, paralysis: 4, breath: 5, spells: 4 },
    { minLevel: 10, maxLevel: 11, death: 2, wands: 2, paralysis: 3, breath: 4, spells: 3 },
    { minLevel: 12, maxLevel: 13, death: 2, wands: 2, paralysis: 2, breath: 3, spells: 2 },
    { minLevel: 14, maxLevel: 36, death: 2, wands: 2, paralysis: 2, breath: 2, spells: 2 },
];

const MysticSaves: SaveTier[] = [
    { minLevel: 1, maxLevel: 2, death: 12, wands: 13, paralysis: 14, breath: 15, spells: 16 },
    { minLevel: 3, maxLevel: 4, death: 11, wands: 12, paralysis: 13, breath: 14, spells: 15 },
    { minLevel: 5, maxLevel: 5, death: 10, wands: 11, paralysis: 12, breath: 13, spells: 14 },
    { minLevel: 6, maxLevel: 7, death: 9, wands: 10, paralysis: 11, breath: 12, spells: 13 },
    { minLevel: 8, maxLevel: 8, death: 8, wands: 9, paralysis: 10, breath: 11, spells: 12 },
    { minLevel: 9, maxLevel: 10, death: 7, wands: 8, paralysis: 9, breath: 10, spells: 11 },
    { minLevel: 11, maxLevel: 12, death: 6, wands: 7, paralysis: 8, breath: 9, spells: 10 },
    { minLevel: 13, maxLevel: 15, death: 6, wands: 6, paralysis: 7, breath: 8, spells: 9 },
    { minLevel: 16, maxLevel: 18, death: 5, wands: 6, paralysis: 6, breath: 7, spells: 8 },
    { minLevel: 19, maxLevel: 21, death: 5, wands: 5, paralysis: 6, breath: 6, spells: 7 },
    { minLevel: 22, maxLevel: 24, death: 4, wands: 5, paralysis: 5, breath: 5, spells: 6 },
    { minLevel: 25, maxLevel: 27, death: 4, wands: 4, paralysis: 5, breath: 4, spells: 5 },
    { minLevel: 28, maxLevel: 30, death: 3, wands: 4, paralysis: 4, breath: 3, spells: 4 },
    { minLevel: 31, maxLevel: 33, death: 3, wands: 3, paralysis: 3, breath: 2, spells: 3 },
    { minLevel: 34, maxLevel: 36, death: 2, wands: 2, paralysis: 2, breath: 2, spells: 2 },
];

const ClericSpells: number[][] = [
    [], [], [1], [2], [2,1], [2,2],
    [2,2,1], [3,2,2], [3,3,2,1], [3,3,3,2], [4,4,3,2,1], [4,4,3,3,2],
    [4,4,4,3,2,1], [5,5,4,3,2,2], [5,5,5,3,3,2], [6,5,5,3,3,3], [6,5,5,4,4,3], [6,6,5,4,4,3,1],
    [6,6,5,4,4,3,2], [7,6,5,4,4,4,2], [7,6,5,4,4,4,3], [7,6,5,5,5,4,3], [7,6,5,5,5,4,4], [7,7,6,6,5,4,4],
    [8,7,6,6,5,5,4], [8,7,6,6,5,5,5], [8,7,7,6,6,5,5], [8,8,7,6,6,6,5], [8,8,7,7,7,6,5], [8,8,7,7,7,6,6],
    [8,8,8,7,7,7,6], [8,8,8,8,8,7,6], [9,8,8,8,8,7,7], [9,9,8,8,8,8,7], [9,9,9,8,8,8,8], [9,9,9,9,9,8,8],
    [9,9,9,9,9,9,9],
];

const MageSpells: number[][] = [
    [], [1], [2], [2,1], [2,2], [2,2,1],
    [3,2,2], [3,2,2,1], [3,3,2,2], [3,3,2,2,1], [4,3,3,2,2], [4,4,4,3,2],
    [4,4,4,3,2,1], [5,4,4,3,2,2], [5,4,4,4,3,2], [5,4,4,4,3,2,1], [5,5,5,4,3,2,2], [6,5,5,4,4,3,2],
    [6,5,5,4,4,3,2,1], [6,5,5,5,4,3,2,2], [6,5,5,5,4,4,3,2], [6,5,5,5,4,4,3,2,1], [6,6,5,5,5,4,3,2,2], [6,6,6,6,5,4,3,3,2],
    [7,7,6,6,5,5,4,3,2], [7,7,6,6,5,5,4,4,3], [7,7,7,6,6,5,5,4,3], [7,7,7,6,6,5,5,5,4], [8,8,7,6,6,6,6,5,4], [8,8,7,7,7,6,6,5,5],
    [8,8,8,7,7,7,6,6,5], [8,8,8,7,7,7,7,6,6], [9,8,8,8,8,7,7,7,6], [9,9,9,8,8,8,7,7,7], [9,9,9,9,8,8,8,8,7], [9,9,9,9,9,9,8,8,8],
    [9,9,9,9,9,9,9,9,9],
];

/** Mystic-only per-level data (Table 4-8). */
export const MysticTable = {
    armourClass: [9, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, -1, -2, -3, -4, -5, -6, -6, -6, -6, -6, -6, -6, -6, -6, -6, -6, -6, -6, -6, -6, -6, -6, -6, -6, -6, -6],
    movementPerRound: [40, 40, 45, 45, 50, 55, 55, 60, 65, 65, 70, 75, 80, 85, 90, 95, 100, 100, 105, 105, 105, 105, 105, 105, 105, 105, 105, 105, 105, 105, 105, 105, 105, 105, 105, 105, 105],
    strikeToKillAttacks: [1, 1, 1, 1, 1, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4],
    strikeToKillDamage: ['1d4', '1d4', '1d4+1', '1d6', '1d6+1', '1d8', '1d8+1', '1d10', '1d12', '2d8', '2d10', '2d12', '3d8+1', '4d6+2', '5d6', '4d8', '3d12', '3d12', '3d12', '3d12', '3d12', '3d12', '3d12', '3d12', '3d12', '3d12', '3d12', '3d12', '3d12', '3d12', '3d12', '3d12', '3d12', '3d12', '3d12', '3d12', '3d12'],
    // Find Traps, Remove Traps, Climb Walls, Move Silently, Hide in Shadows
    thiefAbilities: [[], [10,10,87,20,10], [15,15,88,25,15], [20,20,89,30,20], [25,25,90,35,24], [30,30,91,40,28], [35,34,92,44,32], [40,38,93,48,35], [45,42,94,52,38], [50,46,95,55,41], [54,50,96,58,44], [58,54,97,61,47], [62,58,98,64,50], [66,61,99,66,53], [70,64,100,68,56], [73,67,101,70,58], [76,70,102,72,60], [80,73,103,74,62], [83,76,104,76,64], [86,79,105,78,66], [89,82,106,80,68], [92,85,107,82,70], [94,88,108,84,72], [96,91,109,86,74], [98,94,110,88,76], [99,97,111,89,78], [100,100,112,90,80], [101,103,113,91,82], [102,106,114,92,84], [103,109,115,93,86], [104,112,116,94,88], [105,115,117,95,90], [106,118,118,96,92], [107,121,118,97,94], [108,124,119,98,96], [109,127,119,99,98], [110,130,120,100,100]],
} as const;

const UndeadTypes = [
    "Skeleton", "Zombie", "Ghoul", "Wight", "Wraith", "Mummy", "Spectre", 
    "Vampire", "Phantom", "Haunt", "Spirit", "Nightshade", "Lich", "Special"
];

const TurnUndeadMatrix = [
    [], // 0
    ["7", "9", "11", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], // 1
    ["t", "7", "9", "11", "-", "-", "-", "-", "-", "-", "-", "-", "-", "-"], // 2
    ["t", "t", "7", "9", "11", "-", "-", "-", "-", "-", "-", "-", "-", "-"], // 3
    ["d", "t", "t", "7", "9", "11", "-", "-", "-", "-", "-", "-", "-", "-"], // 4
    ["d", "d", "t", "t", "7", "9", "11", "-", "-", "-", "-", "-", "-", "-"], // 5  (DD Table 4-2b: Wraith = t)
    ["d", "d", "d", "t", "t", "7", "9", "11", "-", "-", "-", "-", "-", "-"], // 6
    ["d", "d", "d", "d", "t", "t", "7", "9", "11", "-", "-", "-", "-", "-"], // 7
    ["d", "d", "d", "d", "d", "t", "t", "7", "9", "11", "-", "-", "-", "-"], // 8
    ["d", "d", "d", "d", "d", "d", "t", "t", "7", "9", "11", "-", "-", "-"], // 9
    ["d", "d", "d", "d", "d", "d", "t", "t", "7", "9", "11", "-", "-", "-"], // 10
    ["D", "d", "d", "d", "d", "d", "d", "t", "t", "7", "9", "11", "-", "-"], // 11
    ["D", "d", "d", "d", "d", "d", "d", "t", "t", "7", "9", "11", "-", "-"], // 12
    ["D", "D", "d", "d", "d", "d", "d", "d", "t", "t", "7", "9", "11", "-"], // 13
    ["D", "D", "d", "d", "d", "d", "d", "d", "t", "t", "7", "9", "11", "-"], // 14
    ["D", "D", "D", "d", "d", "d", "d", "d", "d", "t", "t", "7", "9", "11"], // 15
    ["D", "D", "D", "d", "d", "d", "d", "d", "d", "t", "t", "7", "9", "11"], // 16
    ["D", "D", "D", "D", "d", "d", "d", "d", "d", "d", "t", "t", "7", "9"],  // 17
    ["D", "D", "D", "D", "d", "d", "d", "d", "d", "d", "t", "t", "7", "9"],  // 18
    ["D", "D", "D", "D", "d", "d", "d", "d", "d", "d", "t", "t", "7", "9"],  // 19
    ["D", "D", "D", "D", "d", "d", "d", "d", "d", "d", "t", "t", "7", "9"],  // 20
    ["D", "D", "D", "D", "D", "d", "d", "d", "d", "d", "d", "t", "t", "7"],  // 21
    ["D", "D", "D", "D", "D", "d", "d", "d", "d", "d", "d", "t", "t", "7"],  // 22
    ["D", "D", "D", "D", "D", "d", "d", "d", "d", "d", "d", "t", "t", "7"],  // 23
    ["D", "D", "D", "D", "D", "d", "d", "d", "d", "d", "d", "t", "t", "7"],  // 24
    ["X", "D", "D", "D", "D", "D", "d", "d", "d", "d", "d", "d", "t", "t"],  // 25
    ["X", "D", "D", "D", "D", "D", "d", "d", "d", "d", "d", "d", "t", "t"],  // 26
    ["X", "D", "D", "D", "D", "D", "d", "d", "d", "d", "d", "d", "t", "t"],  // 27
    ["X", "D", "D", "D", "D", "D", "d", "d", "d", "d", "d", "d", "t", "t"],  // 28
    ["X", "X", "D", "D", "D", "D", "D", "d", "d", "d", "d", "d", "t", "t"],  // 29
    ["X", "X", "D", "D", "D", "D", "D", "d", "d", "d", "d", "d", "t", "t"],  // 30
    ["X", "X", "D", "D", "D", "D", "D", "d", "d", "d", "d", "d", "t", "t"],  // 31
    ["X", "X", "D", "D", "D", "D", "D", "d", "d", "d", "d", "d", "t", "t"],  // 32
    ["X", "X", "X", "D", "D", "D", "D", "D", "d", "d", "d", "d", "t", "t"],  // 33
    ["X", "X", "X", "D", "D", "D", "D", "D", "d", "d", "d", "d", "t", "t"],  // 34
    ["X", "X", "X", "D", "D", "D", "D", "D", "d", "d", "d", "d", "t", "t"],  // 35
    ["X", "X", "X", "D", "D", "D", "D", "D", "d", "d", "d", "d", "t", "t"]   // 36
];

const ThiefSkillsList = [
    "Open Locks", "Find Traps", "Remove Traps", "Climb Walls", 
    "Move Silently", "Hide in Shadows", "Pick Pockets", "Hear Noise", 
    "Read Languages", "Use Magic-User Scroll"
];

const ThiefSkillsMatrix = [
    [], // 0
    [15, 10, 10, 87, 20, 10, 20, 30, "-", "-"], // 1
    [20, 15, 15, 88, 25, 15, 25, 35, "-", "-"], // 2
    [25, 20, 20, 89, 30, 20, 30, 40, "-", "-"], // 3
    [30, 25, 25, 90, 35, 24, 35, 45, 80, "-"],  // 4
    [35, 30, 30, 91, 40, 28, 40, 50, 80, "-"],  // 5
    [40, 35, 34, 92, 44, 32, 45, 54, 80, "-"],  // 6
    [45, 40, 38, 93, 48, 35, 50, 58, 80, "-"],  // 7
    [50, 45, 42, 94, 52, 38, 55, 62, 80, "-"],  // 8
    [54, 50, 46, 95, 55, 41, 60, 66, 80, "-"],  // 9
    [58, 54, 50, 96, 58, 44, 65, 70, 80, 90],   // 10
    [62, 58, 54, 97, 61, 47, 70, 74, 80, 90],   // 11
    [66, 62, 58, 98, 64, 50, 75, 78, 80, 90],   // 12
    [69, 66, 61, 99, 66, 53, 80, 81, 80, 90],   // 13
    [72, 70, 64, 100, 68, 56, 85, 84, 80, 90],  // 14
    [75, 73, 67, 101, 70, 58, 90, 87, 80, 90],  // 15
    [78, 76, 70, 102, 72, 60, 95, 90, 80, 90],  // 16
    [81, 80, 73, 103, 74, 62, 100, 92, 80, 90], // 17
    [84, 83, 76, 104, 76, 64, 105, 94, 80, 90], // 18
    [86, 86, 79, 105, 78, 66, 110, 96, 80, 90], // 19
    [88, 89, 82, 106, 80, 68, 115, 98, 80, 90], // 20
    [90, 92, 85, 107, 82, 70, 120, 100, 80, 90], // 21
    [92, 94, 88, 108, 84, 72, 125, 102, 80, 90], // 22
    [94, 96, 91, 109, 86, 74, 130, 104, 80, 90], // 23
    [96, 98, 94, 110, 88, 76, 135, 106, 80, 90], // 24
    [98, 99, 97, 111, 89, 78, 140, 108, 80, 90], // 25
    [100, 100, 100, 112, 90, 80, 145, 110, 80, 90], // 26
    [102, 101, 103, 113, 91, 82, 150, 112, 80, 90], // 27
    [104, 102, 106, 114, 92, 84, 155, 114, 80, 90], // 28
    [106, 103, 109, 115, 93, 86, 160, 116, 80, 90], // 29
    [108, 104, 112, 116, 94, 88, 165, 118, 80, 90], // 30
    [110, 105, 115, 117, 95, 90, 170, 120, 80, 90], // 31
    [112, 106, 118, 118, 96, 92, 175, 122, 80, 90], // 32
    [114, 107, 121, 118, 97, 94, 180, 124, 80, 90], // 33
    [116, 108, 124, 119, 98, 96, 185, 126, 80, 90], // 34
    [118, 109, 127, 119, 99, 98, 190, 128, 80, 90], // 35
    [120, 110, 130, 120, 100, 100, 195, 130, 80, 90]  // 36
];

export const ClassesDatabase: Record<string, ClassData> = {

    "Fighter": { 
        name: "Fighter", hitDie: 8, hpPerLevelAfter9: 2, attackBonus: FighterAttackBonus, thac0: toThac0(FighterAttackBonus), xpTable: FighterXP, saves: FighterSaves,
        allowedArmor: "Any armor (Leather, Scale, Chain, Banded, Plate, Suit)",
        allowedShields: true,
        allowedWeapons: "Any weapons",
        features: [
            { minLevel: 9, name: "Castle & Barony", description: "May build a stronghold, become a Baron/Baroness, and attract loyal men-at-arms." }
        ]
    },
    "Cleric": { 
        name: "Cleric", hitDie: 6, hpPerLevelAfter9: 1, attackBonus: ClericAttackBonus, thac0: toThac0(ClericAttackBonus), xpTable: ClericXP, saves: ClericSaves,
        allowedArmor: "Any armor (Leather, Chain, Plate, Suit)",
        allowedShields: true,
        allowedWeapons: "Blunt weapons only (Club, Mace, War Hammer, Throwing Hammer, Sling, Staff, Blackjack)",
        spellProgression: ClericSpells,
        undeadTypes: UndeadTypes,
        turnMatrix: TurnUndeadMatrix,
        features: [
            { minLevel: 1, name: "Turn Undead", description: "Can channel divine power to turn or destroy undead." },
            { minLevel: 2, name: "Divine Spells", description: "Gains access to clerical spell preparation." }
        ]
    },
    "Magic-User": { 
        name: "Magic-User", hitDie: 4, hpPerLevelAfter9: 1, attackBonus: MageAttackBonus, thac0: toThac0(MageAttackBonus), xpTable: MageXP, saves: MageSaves,
        allowedArmor: "None",
        allowedShields: false,
        allowedWeapons: "Dagger, Staff, Sling, Whip, Net, Blowgun, Pistol",
        spellProgression: MageSpells,
        features: [
            { minLevel: 1, name: "Arcane Spells", description: "Can cast arcane spells from a spellbook." }
        ]
    },
    "Thief": { 
        name: "Thief", hitDie: 4, hpPerLevelAfter9: 2, attackBonus: ThiefAttackBonus, thac0: toThac0(ThiefAttackBonus), xpTable: ThiefXP, saves: ThiefSaves,
        allowedArmor: "Leather armor only",
        allowedShields: false,
        allowedWeapons: "Any one-handed melee weapons, any missile weapons (no two-handed melee)",
        thiefSkillsList: ThiefSkillsList,
        thiefSkillsMatrix: ThiefSkillsMatrix,
        features: [
            { minLevel: 1, name: "Thief Skills", description: "Gains specialized thievery skills (Open Locks, Find Traps, Climb Walls, etc.)." },
            { minLevel: 4, name: "Read Languages", description: "80% chance to understand non-magical written text in any language." },
            { minLevel: 9, name: "Thieves' Guild", description: "May establish a thieves' den or guild branch and attract apprentice rogues." },
            { minLevel: 10, name: "Use Arcane Scrolls", description: "90% chance to decipher and cast spells from magic-user scrolls." }
        ]
    },
    "Dwarf": { 
        name: "Dwarf", hitDie: 8, hpPerLevelAfter9: 2, attackBonus: DwarfAttackBonus, thac0: toThac0(DwarfAttackBonus), xpTable: DwarfXP, saves: DwarfSaves,
        allowedArmor: "Any armor suitable for small stature",
        allowedShields: true,
        allowedWeapons: "Small & medium weapons (no two-handed swords, longbows, or polearms)",
        features: [
            { minLevel: 1, name: "Heatvision & Stonelore", description: "Can see heat sources in the dark up to 60' and detect stone mechanisms on a 1-2 on 1d6." },
            { minLevel: 16, name: "Spell Resistance", description: "Takes half damage from spells (quarter on successful saving throw)." }
        ]
    },
    "Elf": { 
        name: "Elf", hitDie: 6, hpPerLevelAfter9: 1, attackBonus: ElfAttackBonus, thac0: toThac0(ElfAttackBonus), xpTable: ElfXP, saves: ElfSaves,
        allowedArmor: "Any armor",
        allowedShields: true,
        allowedWeapons: "Any weapons",
        spellProgression: MageSpells, // DD Table 4-4 is identical to Table 4-7
        features: [
            { minLevel: 1, name: "Heatvision, Elfsight & Ghoul Immunity", description: "60' heatvision, heightened secret door detection, and immune to ghoul paralysis." },
            { minLevel: 1, name: "Spells", description: "Can prepare and cast magic-user spells." },
            { minLevel: 14, name: "Breath Evasion", description: "Takes half damage from breath attacks (quarter on save)." }
        ]
    },
    "Halfling": { 
        name: "Halfling", hitDie: 6, hpPerLevelAfter9: 1, attackBonus: HalflingAttackBonus, thac0: toThac0(HalflingAttackBonus), xpTable: HalflingXP, saves: HalflingSaves,
        allowedArmor: "Any armor sized for halflings",
        allowedShields: true,
        allowedWeapons: "Small & medium weapons suitable for size",
        features: [
            { minLevel: 1, name: "Small, Nimble & Unobtrusive", description: "+2 AC vs large foes, +1 missile to-hit and initiative, 90% outdoor hiding." },
            { minLevel: 9, name: "Spell Resistance", description: "Takes half damage from spells (quarter on save)." },
            { minLevel: 15, name: "Breath Evasion", description: "Takes half damage from breath attacks (quarter on save)." }
        ]
    },
    "Mystic": { 
        name: "Mystic", hitDie: 6, hpPerLevelAfter9: 2, attackBonus: MysticAttackBonus, thac0: toThac0(MysticAttackBonus), xpTable: MysticXP, saves: MysticSaves,
        allowedArmor: "None",
        allowedShields: false,
        allowedWeapons: "Any weapon (unarmed martial arts preferred)",
        features: [
            { minLevel: 1, name: "Unarmed Discipline & Natural AC", description: "Natural armor class scaling and increasing unarmed combat damage." },
            { minLevel: 2, name: "Alertness", description: "Only surprised on a roll of 1 on 1d6." },
            { minLevel: 4, name: "Self Healing", description: "Once per day heals 1 HP per level." },
            { minLevel: 6, name: "Speak With Animals", description: "Can telepathically communicate with animals." },
            { minLevel: 8, name: "Spell Resistance & Breath Evasion", description: "Half damage from spells and breath attacks." },
            { minLevel: 10, name: "Speak With Anyone", description: "Can communicate with any creature possessing a language." },
            { minLevel: 12, name: "Mind Blank", description: "Immune to Charm, Hold, Slow, ESP, Quest, and Geas." },
            { minLevel: 14, name: "Fade", description: "Can become mentally undetectable once per day for 1 round per level." },
        ]
    },
    "Paladin": { 
        name: "Paladin", hitDie: 0, thac0: [], xpTable: [], saves: [],
        features: [
            { minLevel: 1, name: "Divine Spells", description: "Can cast Cleric spells as a Cleric of one-third your Fighter level." },
            { minLevel: 1, name: "Detect Evil", description: "Can cast Detect Evil at will. Takes one round of concentration; cannot attack in the same round." },
            { minLevel: 1, name: "Turn Undead", description: "Can turn undead as a Cleric of one-third your Fighter level." },
            { minLevel: 1, name: "Lay on Hands", description: "Once per day, heal yourself or another by 2 hit points per experience level. Only if your Immortal grants it (see Codex Immortalis Vol. 1). (Mystara Extra Rules Compendium)" }
        ]
    },
    "Avenger": { 
        name: "Avenger", hitDie: 0, thac0: [], xpTable: [], saves: [],
        features: [
            { minLevel: 1, name: "Divine Spells", description: "Can cast Cleric spells as a Cleric of one-third your Fighter level." },
            { minLevel: 1, name: "Detect Evil", description: "Can cast Detect Evil at will. Takes one round of concentration; cannot attack in the same round." },
            { minLevel: 1, name: "Turn Undead", description: "Can turn undead as a Cleric of one-third your Fighter level." }
        ]
    },
    "Arcane Warrior": {
        name: "Arcane Warrior", hitDie: 8, hpPerLevelAfter9: 1, thac0: [], xpTable: [], saves: [],
        minScores: { strength: 10, intelligence: 13 },
        restrictions: ["At least 9th-level Fighter", "Needs a mage mentor (pact)"],
        source: "Mystara Extra Rules Compendium",
        features: [
            { minLevel: 1, name: "Arcane Spells", description: "Can cast Magic-User spells. Effective level is based on Pact Level, max spell tier is limited by Intelligence." },
            { minLevel: 1, name: "Magic Items", description: "Can use MU scrolls and magic items, but with a fixed 10% chance of failure or malfunction." },
            { minLevel: 9, name: "Create Magic Items", description: "Upon reaching 9th effective MU level, can create magic items and free themselves from the mentor's pact." },
            { minLevel: 1, name: "Fighter Training", description: "Multiple attacks as a Fighter, but not the Fighter's combat options (Smash, Parry). Hit points after 9th level: +1 per level." }
        ]
    }
    
};


// Каноничные уровни прогрессии фитов по Chapter 4 книги Dark Dungeons
const martialFeatLevels = [3, 6, 9, 11, 15, 19, 23, 27, 30, 33, 36];
const standardFeatLevels = [3, 6, 9, 11, 15, 23, 30, 36];

// Воинские классы: старт 4 фита, финал 15 фитов
if (ClassesDatabase["Fighter"]) {
    ClassesDatabase["Fighter"].weaponFeatsProgression = { start: 4, gainLevels: martialFeatLevels };
    ClassesDatabase["Fighter"].allowedArmor = "Any armor (Leather, Chain, Plate, Suit)";
    ClassesDatabase["Fighter"].allowedShields = true;
    ClassesDatabase["Fighter"].allowedWeapons = "Any weapons";
}

if (ClassesDatabase["Dwarf"]) {
    ClassesDatabase["Dwarf"].weaponFeatsProgression = { start: 4, gainLevels: martialFeatLevels };
    ClassesDatabase["Dwarf"].allowedArmor = "Any armor";
    ClassesDatabase["Dwarf"].allowedShields = true;
    ClassesDatabase["Dwarf"].allowedWeapons = "Small & medium weapons (no large weapons, see Table 6-1)";
}

// Остальные классы: старт 2 фита, финал 10 фитов
if (ClassesDatabase["Cleric"]) {
    ClassesDatabase["Cleric"].weaponFeatsProgression = { start: 2, gainLevels: standardFeatLevels };
    ClassesDatabase["Cleric"].allowedArmor = "Any armor (Leather, Chain, Plate, Suit)";
    ClassesDatabase["Cleric"].allowedShields = true;
    ClassesDatabase["Cleric"].allowedWeapons = "Blunt weapons only (Club, Mace, War Hammer, Throwing Hammer, Sling, Staff, Blackjack)";
}

if (ClassesDatabase["Magic-User"]) {
    ClassesDatabase["Magic-User"].weaponFeatsProgression = { start: 2, gainLevels: standardFeatLevels };
    ClassesDatabase["Magic-User"].allowedArmor = "None";
    ClassesDatabase["Magic-User"].allowedShields = false;
    ClassesDatabase["Magic-User"].allowedWeapons = "Dagger, Staff, Sling, Whip, Net, Blowgun, Pistol";
}

if (ClassesDatabase["Thief"]) {
    ClassesDatabase["Thief"].weaponFeatsProgression = { start: 2, gainLevels: standardFeatLevels };
    ClassesDatabase["Thief"].allowedArmor = "Leather armor only";
    ClassesDatabase["Thief"].allowedShields = false;
    ClassesDatabase["Thief"].allowedWeapons = "Any one-handed weapon and any missile weapon (no two-handed melee, no shields)";
}

if (ClassesDatabase["Elf"]) {
    ClassesDatabase["Elf"].weaponFeatsProgression = { start: 2, gainLevels: standardFeatLevels };
    ClassesDatabase["Elf"].allowedArmor = "Any armor";
    ClassesDatabase["Elf"].allowedShields = true;
    ClassesDatabase["Elf"].allowedWeapons = "Any weapons";
}

if (ClassesDatabase["Halfling"]) {
    ClassesDatabase["Halfling"].weaponFeatsProgression = { start: 2, gainLevels: standardFeatLevels };
    ClassesDatabase["Halfling"].allowedArmor = "Any armor";
    ClassesDatabase["Halfling"].allowedShields = true;
    ClassesDatabase["Halfling"].allowedWeapons = "Small weapons only (see Table 6-1)";
}

if (ClassesDatabase["Mystic"]) {
    ClassesDatabase["Mystic"].weaponFeatsProgression = { start: 2, gainLevels: standardFeatLevels };
    ClassesDatabase["Mystic"].allowedArmor = "None";
    ClassesDatabase["Mystic"].allowedShields = false;
    ClassesDatabase["Mystic"].allowedWeapons = "Any weapon (unarmed martial arts preferred)";
    ClassesDatabase["Mystic"].mysticTable = MysticTable;
}

// ---------------------------------------------------------------------------
// Combat options for the core classes (Dark Dungeons Chapter 4).
// ---------------------------------------------------------------------------
const FIGHTER_ATTACKS: [number, number][] = [[12, 2], [24, 3], [36, 4]];
const coreCombat: Record<string, Pick<ClassData, 'smashParryLevel' | 'multipleAttacks' | 'armour'>> = {
    "Fighter":    { smashParryLevel: 9,  multipleAttacks: FIGHTER_ATTACKS, armour: 'any' },
    "Dwarf":      { smashParryLevel: 12, multipleAttacks: [[12, 2], [20, 3], [36, 4]], armour: 'any' },
    "Elf":        { smashParryLevel: 11, multipleAttacks: [[11, 2], [18, 3]], armour: 'any' },
    "Halfling":   { smashParryLevel: 11, multipleAttacks: [[11, 2], [18, 3]], armour: 'any' },
    "Mystic":     { smashParryLevel: 9,  armour: 'none' },
    "Cleric":     { armour: 'any' },
    "Magic-User": { armour: 'none' },
    "Thief":      { armour: 'leather' },
};
for (const [name, extra] of Object.entries(coreCombat)) {
    const cls = ClassesDatabase[name];
    if (cls) Object.assign(cls, extra);
}
if (ClassesDatabase["Magic-User"]) ClassesDatabase["Magic-User"].casterType = 'arcane';
if (ClassesDatabase["Elf"]) ClassesDatabase["Elf"].casterType = 'arcane';
if (ClassesDatabase["Cleric"]) ClassesDatabase["Cleric"].casterType = 'divine';

// ---------------------------------------------------------------------------
// Classes from the Mystara Extra Rules Compendium.
// Each is defined "as a Fighter / Thief / Magic-User..." in the Compendium,
// so the level tables are reused from the Dark Dungeons classes above.
// ---------------------------------------------------------------------------
const COMPENDIUM = "Mystara Extra Rules Compendium";
const martialFeats = { start: 4, gainLevels: martialFeatLevels };
const standardFeats = { start: 2, gainLevels: standardFeatLevels };
const fighterCombat = {
    attackBonus: FighterAttackBonus, thac0: toThac0(FighterAttackBonus),
    smashParryLevel: 9, multipleAttacks: FIGHTER_ATTACKS,
};

/** Bandit: "Experience Progression: As a Thief x1.5". */
const BanditXP: readonly number[] = ThiefXP.map(xp => Math.round(xp * 1.5));
/** Battlecaster: "Until 4th level as a Fighter, later as a Magic-User". */
const BattlecasterXP: readonly number[] = MageXP.map((xp, level) => (level <= 4 ? (FighterXP[level] ?? xp) : xp));

const CompendiumClasses: Record<string, ClassData> = {
    "Archer": {
        name: "Archer", source: COMPENDIUM,
        hitDie: 6, hpPerLevelAfter9: 1,                        // HP as a Cleric
        xpTable: MageXP, saves: FighterSaves, ...fighterCombat,
        weaponFeatsProgression: martialFeats,
        minScores: { strength: 12, dexterity: 12 },
        armour: 'any', allowedShields: true,
        allowedArmor: "Any armor (plate or suit armor cancels the Archer missile bonus)",
        allowedWeapons: "Bows, crossbows, axes, daggers, javelins, spears, swords",
        features: [
            { minLevel: 1, name: "Archer's Touch", description: "A magic missile weapon and/or magic missile gets +1 in your hands, over and above its own bonus." },
            { minLevel: 1, name: "Missile Bonus", description: "When not wearing plate or suit armor, +to-hit and damage with a well-made bow and arrows: +0 (L1-3), +1 (L4-6), +2 (L7-9), +3 (L10-12), +4 (L13+). Applied automatically on the Combat tab." },
            { minLevel: 3, name: "Make Missiles", description: "Craft a dozen arrows in an 8-hour day, given raw materials." },
            { minLevel: 5, name: "Make Bows", description: "Craft a bow or crossbow in d6+8 days. A crude bow (-2 to hit, no Archer bonuses) takes under an hour." },
            { minLevel: 7, name: "Archer Spells (1/day)", description: "With Int 9+: Magic Missile, Shield, Unmissable Shot*. Learned by spell research; never from scrolls. (*Tome of the Magic of Mystara Vol. 1)" },
            { minLevel: 9, name: "Archer Spells (2/day)", description: "Adds Camouflage*, Deflecting Shield*, Enchanted Weapon*, Sure Strike*, Mirror Image." },
            { minLevel: 11, name: "Archer Spells (3/day)", description: "Adds Enchant Object*, Elemental Weapon*, Incendiary Darts*, Infravision, Protection From Normal Missiles." },
            { minLevel: 13, name: "Archer Spells (4/day)", description: "Adds Create Projectiles*, Exceptional Range*." },
        ],
    },
    "Bandit": {
        name: "Bandit", source: COMPENDIUM,
        hitDie: 6, hpDieBonus: 1, hpPerLevelAfter9: 1,         // 1d6+1 per level, +1 after 9th
        xpTable: BanditXP, saves: FighterSaves, ...fighterCombat,
        weaponFeatsProgression: martialFeats,
        minScores: { strength: 12, dexterity: 12 },
        restrictions: ["Alignment: Neutral or Chaotic"],
        armour: 'chainOrLighter', allowedShields: true,
        allowedArmor: "Chain mail or lighter",
        allowedWeapons: "All missile weapons; one-handed melee weapons only",
        features: [
            { minLevel: 1, name: "Wilderness Thief Skills", description: "Climb Walls, Hide in natural terrain, and find/remove outdoor traps as a Thief of equal level (see Thief Abilities). Outdoor traps only, one attempt per trap." },
            { minLevel: 1, name: "Ambush", description: "Surprises others on 1-3; is only surprised on a 1." },
            { minLevel: 1, name: "Cover Tracks", description: "At half speed, leave no visible trail: 50% +3% per level above 1st, up to 1 turn per level per day. Trackers suffer -50% (-10 to Tracking)." },
            { minLevel: 1, name: "Track", description: "Track outdoors at 75% base: +2% per creature followed, -10% per 24 hours since, -25% per hour of precipitation. Not indoors." },
            { minLevel: 1, name: "Evasion", description: "+10% to escape pursuit outdoors (the Bandit alone), when not covering tracks." },
        ],
    },
    "Battlecaster": {
        name: "Battlecaster", source: COMPENDIUM,
        hitDie: 6, hpPerLevelAfter9: 1,
        xpTable: BattlecasterXP, saves: MageSaves, ...fighterCombat,
        weaponFeatsProgression: standardFeats,                 // as a Magic-User
        spellProgression: MageSpells, casterType: 'arcane',
        minScores: { strength: 9, intelligence: 12 },
        armour: 'chainOrLighter', allowedShields: true,
        allowedArmor: "Chain mail or lighter",
        allowedWeapons: "Any weapons",
        features: [
            { minLevel: 1, name: "Arcane Spells", description: "Casts spells as a Magic-User of the same level." },
            { minLevel: 1, name: "Magic Items", description: "May use all items allowed to Fighters and Magic-Users." },
        ],
    },
    "Beastmaster": {
        name: "Beastmaster", source: COMPENDIUM + " (work in progress)",
        hitDie: 6, hpPerLevelAfter9: 1,                        // HP as a Cleric
        xpTable: ElfXP, saves: ClericSaves,
        attackBonus: FighterAttackBonus, thac0: toThac0(FighterAttackBonus), // no Smash/Parry or multiple attacks listed
        weaponFeatsProgression: martialFeats,
        minScores: { strength: 12, dexterity: 12 },
        restrictions: ["Race: Human or Halfling", "Alignment: Neutral only"],
        armour: 'leather', allowedShields: false,
        allowedArmor: "Leather armor only", allowedWeapons: "Any weapons",
        features: [
            { minLevel: 1, name: "Animal Affinity", description: "Special abilities are still being written in the Compendium." },
        ],
    },
    "Bounty Hunter": {
        name: "Bounty Hunter", source: COMPENDIUM,
        hitDie: 8, hpPerLevelAfter9: 2,                        // HP as a Fighter
        xpTable: MageXP, saves: FighterSaves, ...fighterCombat,
        weaponFeatsProgression: martialFeats,
        minScores: { intelligence: 12, dexterity: 12 },
        restrictions: ["Alignment: Neutral only", "At least one weapon feat in a capture weapon (blowgun, bolas, net...)"],
        armour: 'any', allowedShields: true,
        allowedArmor: "Any armor (thief abilities need chain mail or lighter)",
        allowedWeapons: "Any weapons",
        features: [
            { minLevel: 1, name: "Tracking", description: "Underground: 50% along passages, 45% doors/stairs, 35% trap doors, 25% chimneys/concealed doors, 15% secret doors. Outdoors: 70% base, +2% per extra creature, -15% per 24 hours, -30% per hour of precipitation." },
            { minLevel: 1, name: "Questioning", description: "+1 reaction when questioning in taverns and gatherings; 10% (+2% per extra party member) someone knows your reputation." },
            { minLevel: 1, name: "Knockout Blows", description: "In melee, half the damage can be temporary. Reduced to 0 hp this way, the victim is unconscious for 1d10 minutes." },
            { minLevel: 1, name: "Sneak Attack", description: "Sneak Attack with capture weapons only." },
            { minLevel: 2, name: "Thief Abilities", description: "Open Locks and Pick Pockets as a Thief of half your level (min. 1st); Move Silently, Hide in Shadows and Climb Walls as a Thief one level lower. Needs chain mail or lighter." },
        ],
    },
    "Rake": {
        name: "Rake", source: COMPENDIUM,
        hitDie: 4, hpPerLevelAfter9: 2,
        attackBonus: ThiefAttackBonus, thac0: toThac0(ThiefAttackBonus),
        xpTable: ThiefXP, saves: ThiefSaves,
        weaponFeatsProgression: standardFeats,
        thiefSkillsList: ThiefSkillsList, thiefSkillsMatrix: ThiefSkillsMatrix,
        minScores: { strength: 9, dexterity: 9 },
        armour: 'leather', allowedShields: false,
        allowedArmor: "Leather armor only",
        allowedWeapons: "Any one-handed weapon and any missile weapon (no two-handed melee, no shields)",
        features: [
            { minLevel: 1, name: "Thief Abilities", description: "As a Thief, except no Pick Pockets and no Sneak Attack." },
            { minLevel: 1, name: "Two-Weapon Fighting", description: "No penalty for fighting with two weapons." },
            { minLevel: 1, name: "Dazzling Defence", description: "Against melee opponents, the Dexterity modifier to AC is doubled (shown on the Combat tab)." },
        ],
    },
    "Witch": {
        name: "Witch", source: COMPENDIUM + " (work in progress)",
        hitDie: 4, hpPerLevelAfter9: 1,
        attackBonus: MageAttackBonus, thac0: toThac0(MageAttackBonus),
        xpTable: MageXP, saves: MageSaves,
        weaponFeatsProgression: standardFeats,
        spellProgression: MageSpells, casterType: 'arcane',
        minScores: { intelligence: 9, wisdom: 9 },
        armour: 'none', allowedShields: false,
        allowedArmor: "None", allowedWeapons: "Dagger, Staff, Sling, Whip, Net, Blowgun, Pistol",
        features: [
            { minLevel: 1, name: "Witch Spells", description: "Spell slots as a Magic-User; starts with Read Magic plus one spell. New spells come from ritual sacrifice to her deity, then are learned as a Magic-User learns them (Table 11-2)." },
            { minLevel: 3, name: "Brew Poisons & Narcotics", description: "One dose per day; ingested only. Poisons by level: L3 5gp 2d8, L5 30gp 3d8, L7 200gp 4d8, L9 500gp death (4d8 on save), L11 1,000gp death (5d8 on save)." },
            { minLevel: 4, name: "Brew Truth Drug", description: "One dose per week, potent for one day. Victim of equal or lower level who fails save vs. poison answers d4 questions truthfully; stupor 2d6 x 10 minutes." },
            { minLevel: 5, name: "Brew Love Potion", description: "(Work in progress in the Compendium.)" },
            { minLevel: 6, name: "Manufacture Potions and Scrolls", description: "(Work in progress in the Compendium.)" },
            { minLevel: 7, name: "Candle Magic", description: "(Work in progress in the Compendium.)" },
            { minLevel: 9, name: "Use All Magical Scrolls", description: "(Work in progress in the Compendium.)" },
            { minLevel: 10, name: "Acquire Familiar", description: "(Work in progress in the Compendium.)" },
            { minLevel: 12, name: "Manufacture Magical Items", description: "(Work in progress in the Compendium.)" },
        ],
    },
};
Object.assign(ClassesDatabase, CompendiumClasses);

// ---------------------------------------------------------------------------
// Shadow Elf (GAZ13 The Shadow Elves). Level tables, saves and spells are the
// Dark Dungeons Elf; special abilities, hit points and combat options follow GAZ13.
// ---------------------------------------------------------------------------
const GAZ13 = "GAZ13 The Shadow Elves";
const DIVINE_MAGIC = "Tome of the Magic of Mystara Vol. 2: Divine Magic";

/** Divine Magic Table 4.12: shaman XP per level, kept on its own track (index = level). */
const ShadowShamanExtraXP: readonly number[] = [0,
    1000, 2000, 4000, 8000, 16000, 32500, 60000, 125000, 200000, 300000, 425000,
    550000, 675000, 800000, 925000, 1050000, 1175000, 1300000, 1425000, 1550000, 1675000, 1800000,
    ...Array.from({ length: 14 }, (_, i) => 1800000 + 125000 * (i + 1))];   // +125,000 per level past 22nd

/** Divine Magic Table 4.12: shaman spells per spell level (no further spells after 22nd). */
const ShadowShamanSpellRows: number[][] = [[],
    [1], [2], [2, 1], [2, 2], [2, 2, 1], [3, 2, 1], [3, 3, 1], [3, 3, 2], [3, 3, 2, 1], [4, 3, 2, 1],
    [4, 4, 3, 1], [5, 4, 3, 2], [5, 4, 3, 2, 1], [5, 4, 4, 3, 1], [6, 5, 4, 3, 2], [6, 5, 4, 3, 2, 1],
    [6, 5, 4, 4, 3, 1], [7, 6, 5, 4, 3, 2], [7, 6, 5, 4, 3, 2, 1], [8, 6, 5, 5, 4, 2, 1],
    [8, 7, 6, 5, 4, 3, 2], [8, 8, 7, 6, 5, 3, 2]];
const ShadowShamanSpells: number[][] = Array.from({ length: 37 }, (_, lvl) =>
    (ShadowShamanSpellRows[Math.min(lvl, 22)] || []).slice());

const ShadowElfClasses: Record<string, ClassData> = {
    "Shadow Elf": {
        name: "Shadow Elf", source: GAZ13,
        hitDie: 6, hpPerLevelAfter9: 2,                            // GAZ13: d6 to 9th, then +2 per level
        attackBonus: ElfAttackBonus, thac0: toThac0(ElfAttackBonus),
        xpTable: ElfXP, saves: ElfSaves,
        spellProgression: MageSpells, casterType: 'arcane',
        weaponFeatsProgression: { start: 2, gainLevels: standardFeatLevels },
        minScores: { intelligence: 9 },
        armour: 'any', allowedShields: true,
        allowedArmor: "Any armor", allowedWeapons: "Any weapons",
        // GAZ13: Combat Options and 2 attacks at 850,000 XP (DD elf 12th level); 3 attacks at 2,600,000 XP; never 4.
        smashParryLevel: 12,
        multipleAttacks: [[12, 2]],
        multipleAttacksXp: [[850000, 2], [2600000, 3]],
        features: [
            { minLevel: 1, name: "Infravision", description: "Natural infravision with a range of 90' in the dark." },
            { minLevel: 1, name: "Ghoul Immunity", description: "Cannot be paralysed by ghouls or other undead; other kinds of paralysis still affect you." },
            { minLevel: 1, name: "Keen Eyes", description: "Whenever you search for anything, not just hidden doors, the DM rolls 1d6 and you find it on a 1 or 2 (if it is in the area searched)." },
            { minLevel: 1, name: "Languages", description: "Shadow elf (a dialect of Elvish), your alignment tongue, gnoll, orc and hobgoblin." },
            { minLevel: 1, name: "Orientation in Caves", description: "Every shadow elf knows this skill (the Caving skill on the General Skills tab); take it as one of your starting skills." },
            { minLevel: 1, name: "Spells", description: "Prepare and cast magic-user spells as a Dark Dungeons elf." },
            { minLevel: 1, name: "Clan and City", description: "You belong to a clan, which usually decides your home city; marriage can move you to your spouse's clan." },
            { minLevel: 9, name: "Stronghold", description: "May build a stronghold near the shadow elves' domains, founding a new settlement that belongs to your clan." },
            { minLevel: 17, name: "Breath Evasion", description: "At 1,600,000 XP you automatically take half damage from any breath weapon." },
        ],
    },
    "Shadow Shaman": {
        name: "Shadow Shaman", source: DIVINE_MAGIC + " (p. 151) / " + GAZ13,
        optionOf: "Shadow Elf", ownXpTrack: true, maxLevelIsMain: true,
        // House rule: hit points and combat exactly as a Shadow Elf (not Divine Magic's +1 hp / cleric THAC0).
        hitDie: 6, hpPerLevelAfter9: 2,
        attackBonus: ElfAttackBonus, thac0: toThac0(ElfAttackBonus),
        // Own progression (GAZ13 / Divine Magic): shaman XP is split off from the elf's.
        // Level 1 starts at 0; the first shaman spells need 1,000 XP (Test of Rafiel).
        xpTable: ShadowShamanExtraXP.map((xp, lvl) => (lvl <= 1 ? 0 : xp)),
        saves: ElfSaves,
        spellProgression: ShadowShamanSpells, casterType: 'divine', spellList: 'shadow_shaman',
        spellsFromXp: 1000,
        fixedDeity: "Rafiel",                                   // GAZ13 gives no Turn Undead (Divine Magic's is not used)
        weaponFeatsProgression: { start: 2, gainLevels: standardFeatLevels },
        minScores: { intelligence: 12, wisdom: 12 },
        restrictions: ["Must bear the Mark of Rafiel from birth", "Shaman magic needs a soul crystal and does not work on the surface"],
        armour: 'any', allowedShields: true,
        allowedArmor: "Any armor", allowedWeapons: "Any weapons",
        smashParryLevel: 12, multipleAttacks: [[12, 2]], multipleAttacksXp: [[850000, 2], [2600000, 3]],
        features: [
            { minLevel: 1, name: "Mark and Test of Rafiel", description: "Chosen by Rafiel at birth. Shaman levels have their own XP bar (Divine Magic Table 4.12): split the XP you earn between it and your elf XP as you wish. Your first shaman spells come at 1,000 shaman XP, after passing the Test of Rafiel. Your shaman level can never exceed your elf level." },
            { minLevel: 1, name: "Shaman Spells", description: "Cast Rafiel's spells (Shadow Shaman list only) and memorise them as a cleric. You need a soul crystal whose purity equals the spell level. You may carry only one crystal, and crystals crumble in sunlight, so shaman magic fails on the surface. You still cast elf spells as normal." },
            { minLevel: 1, name: "Shaman's Combat", description: "Fights exactly as a Shadow Elf: same THAC0, hit points, weapons, armour and weapon mastery, with Combat Options and extra attacks at the same XP totals (house rule)." },
            { minLevel: 1, name: "Clanless", description: "Once you join the Temple of Rafiel you serve all shadow elves rather than one clan." },
            { minLevel: 1, name: "Required Skills", description: "Divine Magic (bonus skill), Religion: Rafiel and Direction Sense." },
            { minLevel: 1, name: "Acolyte", description: "Order of Rafiel, levels 1-4." },
            { minLevel: 5, name: "Initiate Shaman", description: "Levels 5-9: prepare acolytes, perform everyday rituals and travel where Rafiel's will requires." },
            { minLevel: 9, name: "Temple of Rafiel", description: "May found a temple of Rafiel near the shadow elves' domain, a new settlement of your clan." },
            { minLevel: 10, name: "Death Shaman", description: "Levels 10-12: preside over the abandonment of the unwhole and the banishing of Wanderers." },
            { minLevel: 13, name: "Life Shaman", description: "Levels 13-15: healers and historians; must learn the History of the shadow elves skill. First use Call upon Souls with a 5th-level crystal." },
            { minLevel: 16, name: "Colourless Shaman", description: "Levels 16-18: meditation and study; may cast 6th-level spells, including Resurrection." },
            { minLevel: 19, name: "White Shaman", description: "Level 19+: may cast 7th-level spells and enter the Chamber of the Spheres. The Radiant Shaman is chosen from White Shamans of 21st level or higher." },
            { minLevel: 22, name: "Spell Limit", description: "No further shaman spells after 22nd level; later levels need 125,000 extra XP each. Maximum level 36." },
        ],
    },
};
Object.assign(ClassesDatabase, ShadowElfClasses);

// ---------------------------------------------------------------------------
// Creature heroes: Gnome / Skygnome (PC2 Top Ballista) and Centaur (PC1 Tall
// Tales of the Wee Folk). They start below 1st level, gain Hit Dice on their own
// tables and fight as monsters of their Hit Dice (Rules Cyclopedia p. 107).
// ---------------------------------------------------------------------------
const PC1 = "PC1 Tall Tales of the Wee Folk";
const PC2 = "PC2 Top Ballista";

/** RC "Attack Rolls Table: All Monsters", AC 0 column. dice + (plus ? "+" : ""). */
const monsterThac0 = (dice: number, plus: number): number => {
    const hd = dice + (plus > 0 ? 0.5 : 0);
    const rows: [number, number][] = [[1, 19], [2, 18], [3, 17], [4, 16], [5, 15], [6, 14], [7, 13], [8, 12], [9, 11],
        [11, 10], [13, 9], [15, 8], [17, 7], [19, 6], [21, 5], [23, 4], [25, 3], [35, 2]];
    for (const [max, thac0] of rows) if (hd <= max) return thac0;
    return 1;
};
/** Expand a Hit Dice table to levels 1..36 (fixed hp after the last listed level). */
const expandHitDice = (rows: [number, number][], perLevel: number): [number, number][] => {
    const out: [number, number][] = [[0, 0]];
    const last = rows.length - 1;
    const [lastDice, lastPlus] = rows[last] ?? [0, 0];
    for (let lvl = 1; lvl <= 36; lvl++) {
        out.push(lvl <= last ? (rows[lvl] ?? [0, 0]) : [lastDice, lastPlus + (lvl - last) * perLevel]);
    }
    return out;
};
/** Level XP table: listed levels, then a fixed amount per level. */
const expandXp = (rows: number[], perLevel: number): number[] =>
    Array.from({ length: 37 }, (_, lvl) => lvl < rows.length ? (rows[lvl] ?? 0) : (rows[rows.length - 1] ?? 0) + (lvl - rows.length + 1) * perLevel);

// PC2 Table 4. Index 0 unused; level 6 gains no Hit Die; after 9th, +2 hp per level.
const GnomeXP = expandXp([0, 2000, 4000, 8000, 16000, 32000, 60000, 120000, 250000, 510000], 300000);
const GnomeHD = expandHitDice([[0, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [6, 0], [7, 0], [8, 0], [8, 2]], 2);
// PC2: monster of its HD until 8th level; from 8th the better of that or a dwarf of its level.
const GnomeThac0 = GnomeHD.map(([d, p], lvl) => lvl === 0 ? 20
    : (lvl >= 8 ? Math.min(monsterThac0(d, p), 20 - (DwarfAttackBonus[lvl] ?? 0)) : monsterThac0(d, p)));
// PC1 Table 2. After 10th, +2 hp per level.
const CentaurXP = expandXp([0, 4000, 12000, 28000, 60000, 124000, 250000, 500000, 800000, 1100000, 1400000], 300000);
const CentaurHD = expandHitDice([[0, 0], [4, 0], [5, 0], [6, 0], [6, 0], [7, 0], [8, 0], [8, 0], [9, 0], [10, 0], [10, 2]], 2);
const CentaurThac0 = CentaurHD.map(([d, p], lvl) => lvl === 0 ? 20 : monsterThac0(d, p));   // PC1: always as a monster

const gnomeCommon = {
    hitDie: 8, hpPerLevelAfter9: 2,
    xpTable: GnomeXP, saves: DwarfSaves,                     // "Gnomes save as dwarves of the same level"
    thac0: GnomeThac0, hitDiceTable: GnomeHD,
    preStages: [{ name: "Normal Monster", short: "NM", xp: 0, dice: 1, plus: 0, thac0: monsterThac0(1, 0) }],
    weaponFeatsProgression: { start: 2, gainLevels: standardFeatLevels },
    minScores: { dexterity: 8, constitution: 6 },
    restrictions: ["Armour heavier than chain mail: Dexterity -2", "Shaman or wicca option (up to 12th level) not yet on the sheet"],
    armour: 'any' as const, allowedShields: true,
    allowedArmor: "Leather or chain mail preferred; heavier armour gives Dexterity -2",
    allowedWeapons: "Weapons no larger than a short sword (hand axes and hammers preferred), crossbows, short bows",
    source: PC2,
};
const gnomeLanguages = "Dwarf, Goblin, Halfling, Kobold, the local language (Skycommon in Serraine) and your alignment tongue.";

const CreatureHeroClasses: Record<string, ClassData> = {
    "Gnome": {
        name: "Gnome", ...gnomeCommon,
        features: [
            { minLevel: 1, name: "Normal Monster Stage", description: "You start as a normal monster (0 XP, 1 Hit Die) and reach 1st level at 2,000 XP. You fight as a monster of your Hit Dice; from 8th level, as the better of that or a dwarf of your level." },
            { minLevel: 1, name: "Infravision", description: "Excellent infravision to 90'." },
            { minLevel: 1, name: "Dwarven Detection", description: "The same detection chances as dwarves: 1-2 on 1d6 to notice traps, sliding walls, sloping corridors and new construction." },
            { minLevel: 1, name: "Earth Resistance", description: "+1 to saves against earth-based attacks, including acid (e.g. black dragon breath) and petrification." },
            { minLevel: 1, name: "Small Target", description: "-1 AC bonus in combat against creatures larger than man-size." },
            { minLevel: 1, name: "Speak with Burrowers", description: "Speak at will with natural burrowing animals (badgers, moles, etc.)." },
            { minLevel: 1, name: "Languages", description: gnomeLanguages },
            { minLevel: 2, name: "Earth Resistance +2", description: "The save bonus against earth-based attacks rises to +2." },
            { minLevel: 5, name: "Mechanical Aptitude", description: "-1 bonus to any Ability Check made when dealing with machinery." },
            { minLevel: 8, name: "Wall of Stone", description: "Once per week cast wall of stone as a 9th-level caster, only underground with no access to the open sky; up to double size inside your home burrows." },
            { minLevel: 9, name: "Meddling", description: "A wish-like gift for inventions: -2 bonus to Fantasy Physics checks, and a device or part works as you wish despite your technical limits." },
        ],
    },
    "Skygnome": {
        name: "Skygnome", ...gnomeCommon,
        features: [
            { minLevel: 1, name: "Normal Monster Stage", description: "You start as a normal monster (0 XP, 1 Hit Die) and reach 1st level at 2,000 XP. You fight as a monster of your Hit Dice; from 8th level, as the better of that or a dwarf of your level." },
            { minLevel: 1, name: "Infravision", description: "Excellent infravision to 90'." },
            { minLevel: 1, name: "Sky Sense", description: "Aboard a flying machine, mount or structure: 50% chance (+10% per three levels, max 90%) to know height, speed, safety of manoeuvres, and whether the weather is natural or magical. The DM rolls." },
            { minLevel: 1, name: "Air Resistance", description: "+1 to saves against air-based spells and attacks (lightning, electricity, an air elemental's whirlwind...)." },
            { minLevel: 1, name: "Small Target", description: "-1 AC bonus in combat against creatures larger than man-size." },
            { minLevel: 1, name: "Mechanical Aptitude", description: "-1 bonus to any Ability Check made when dealing with machinery." },
            { minLevel: 1, name: "Languages", description: gnomeLanguages },
            { minLevel: 2, name: "Lucky Grab", description: "In the sky (not dungeon pits), a save vs. Death Magic avoids an accidental fall of more than 10'. Dexterity adjusts the save: +1 (13-15), +2 (16-17), +3 (18). Jumping on purpose doesn't count." },
            { minLevel: 5, name: "Air Resistance +2", description: "The save bonus against air-based attacks rises to +2." },
            { minLevel: 8, name: "Aerial Servant", description: "Once per week, under an open sky, cast aerial servant (as the 6th-level clerical spell), usually for heavy work." },
            { minLevel: 9, name: "Meddling", description: "A wish-like gift for inventions: -2 bonus to Fantasy Physics checks, and a device or part works as you wish despite your technical limits." },
        ],
    },
    "Centaur": {
        name: "Centaur", source: PC1,
        hitDie: 8, hpPerLevelAfter9: 2,
        xpTable: CentaurXP, saves: FighterSaves,              // "Centaurs make Saving Throws as fighters of the same level"
        thac0: CentaurThac0, hitDiceTable: CentaurHD,
        naturalArmourClass: 7,
        preStages: [
            { name: "Young Centaur", short: "Young", xp: -4000, dice: 2, plus: 0, armourClass: 8, thac0: monsterThac0(2, 0) },
            { name: "Normal Monster", short: "NM", xp: 0, dice: 4, plus: 0, armourClass: 7, thac0: monsterThac0(4, 0) },
        ],
        weaponFeatsProgression: { start: 4, gainLevels: martialFeatLevels },
        minScores: { strength: 9, constitution: 5 },
        restrictions: ["Starts at -4,000 XP as a young centaur", "Shaman or wicca option not yet on the sheet"],
        armour: 'any', allowedShields: true,
        allowedArmor: "Special centaur barding (human armour and horse barding combined)",
        allowedWeapons: "Any weapons (club, lance and bow preferred)",
        features: [
            { minLevel: 1, name: "Growing Up", description: "You start as a young centaur at -4,000 XP (2 Hit Dice, AC 8), become a normal monster at 0 XP (4 Hit Dice, AC 7) and reach 1st level at 4,000 XP." },
            { minLevel: 1, name: "Natural Armour", description: "AC 7 (AC 8 while young). Barding counts only if it is better; Dexterity and shields still apply." },
            { minLevel: 1, name: "Hooves", description: "Besides a weapon, strike with your hooves for 1d6 damage each." },
            { minLevel: 1, name: "Lance Charge", description: "Charging with a lance deals double damage, like a mounted fighter, but then you cannot also attack with your hooves that round." },
            { minLevel: 1, name: "Monster Combat", description: "You always fight as a monster of your Hit Dice (not your level) and save as a fighter of your level." },
            { minLevel: 1, name: "Fighter's Magic Items", description: "Magic items permitted to fighters may be used by centaurs." },
            { minLevel: 1, name: "Languages", description: "Centaur, the local language, Dryad, Elvish and your alignment tongue; you can communicate with equines (horses, donkeys, etc.)." },
        ],
    },
};
Object.assign(ClassesDatabase, CreatureHeroClasses);
