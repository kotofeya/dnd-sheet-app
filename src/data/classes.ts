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
    preStages?: {
        name: string; short: string; xp: number; dice: number; plus: number; armourClass?: number; thac0: number;
        /** Hit die size at this stage if not the class's (a normal sidhe has 1d4). */
        die?: number;
        /** Spells per level at this stage (hsiao). */
        spells?: number[];
        /** Natural attacks at this stage. */
        attacks?: { count: number; note: string };
        /** Save-table level at this stage. */
        saveLevel?: number;
        /** Thief skills as a thief of this level (0 = none). */
        thiefLevel?: number;
        /** Level table row at this stage (see levelStats). */
        stats?: string[];
        /** Thief skill percentages at this stage (see thiefSkillTable). */
        thiefSkills?: number[];
        /** Own saving throws at this stage. */
        saves?: number[];
        /** Bonus to every save at this stage. */
        saveBonus?: number;
    }[];
    /** Own movement & encumbrance table (PC1 Table 18): walking speed per round-turn for up to `max` cn; more than the last row = immobile. */
    encumbranceTable?: readonly { max: number; speed: number }[];
    /** Natural armour class when unarmoured; worn armour only counts if it is better. */
    naturalArmourClass?: number;
    /** Saving throws are read at this level of the save table (index = class level); default the class level. */
    saveLevels?: readonly number[];
    /** Highest scores the race allows (PC1 Table 1). */
    maxScores?: Partial<Record<'strength' | 'intelligence' | 'wisdom' | 'dexterity' | 'constitution' | 'charisma', number>>;
    /** PC1 fairy item use for magic-user/elf/fairy items by level: [S max, F max, B max] on d%, the rest is U. */
    itemUse?: readonly (readonly [number, number, number])[];
    /** Flying movement & encumbrance (PC1 Table 18a), like encumbranceTable. */
    flyingTable?: readonly { max: number; speed: number }[];
    /** Natural attacks a round (claws, limbs...), shown instead of the weapon attacks. */
    naturalAttacks?: { count: number; note: string };
    /** Thief skills as a thief of this level (index = class level; 0 = none). */
    thiefSkillsAs?: readonly number[];
    /** Changes to the class's spell list: move a spell (by name) to another level, or add a race-only spell (by id). */
    spellListChanges?: { name?: string; id?: string; level: number }[];
    /** PC2: a first Hit Die roll below average counts as the average (5 on a d8). */
    firstHitDieAverage?: boolean;
    /** Natural AC by level (index = level), when it improves after 1st level. */
    naturalArmourByLevel?: readonly number[];
    /** A table of level-based values shown with the class abilities (gremlin aura, sphinx roar). */
    levelStats?: { name: string; columns: string[]; levels: readonly (readonly string[])[] };
    /** Thief-like skills with their own percentages by level (tabi, gremlin). */
    thiefSkillTable?: { names: string[]; levels: readonly (readonly number[])[] };
    /** Restricted spell list by name (PC2 shaman / wicca / tabi lists). */
    spellNames?: string;
    /** Extra spell types granted when the character takes a sub-class (faenare windsinger: druid spells and songs). */
    subClassSpells?: Record<string, string[]>;
    /** Sub-class: replaces the main class's spells-per-level table (windsinger past 12th level). */
    mainSpellProgression?: number[][];
    /** Sub-class: the main class no longer gains its own spells (pegataur wicca). */
    replacesMainSpells?: boolean;
    /** Sub-class: text shown before its spells begin. */
    spellsNote?: string;
    /** Bonus to every saving throw by level (nagpa). */
    saveBonus?: readonly number[];
    /** Own saving throws by level: [death, wands, paralysis, breath, spells] (pegataur). */
    savesByLevel?: readonly (readonly number[])[];
    /** Spell levels that share one pool of spells (tabi: levels 1-3 and 4-6). */
    slotPools?: [number, number][];
    /** Natural attacks by level (index = level). */
    naturalAttacksByLevel?: readonly { count: number; note: string }[];
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
        // PC1 Table 18 (p. 48): Movement & Encumbrance for centaurs.
        encumbranceTable: [
            { max: 1000, speed: 180 }, { max: 2000, speed: 150 }, { max: 3000, speed: 120 }, { max: 4000, speed: 90 },
            { max: 6000, speed: 60 }, { max: 7500, speed: 30 }, { max: 8000, speed: 15 },
        ],
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
            { minLevel: 1, name: "Movement", description: "180' (60') carrying up to 1,000 cn; 150' up to 2,000; 120' up to 3,000; 90' up to 4,000; 60' up to 6,000; 30' up to 7,500; 15' up to 8,000; more and you cannot move (PC1 Table 18)." },
            { minLevel: 1, name: "Hooves", description: "Besides a weapon, strike with your hooves for 1d6 damage each." },
            { minLevel: 1, name: "Lance Charge", description: "Charging with a lance deals double damage, like a mounted fighter, but then you cannot also attack with your hooves that round." },
            { minLevel: 1, name: "Monster Combat", description: "You always fight as a monster of your Hit Dice (not your level) and save as a fighter of your level." },
            { minLevel: 1, name: "Fighter's Magic Items", description: "Magic items permitted to fighters may be used by centaurs." },
            { minLevel: 1, name: "Languages", description: "Centaur, the local language, Dryad, Elvish and your alignment tongue; you can communicate with equines (horses, donkeys, etc.)." },
        ],
    },
};
Object.assign(ClassesDatabase, CreatureHeroClasses);

// ---------------------------------------------------------------------------
// The other PC1 creature heroes (Tall Tales of the Wee Folk, pp. 9-41, Tables 1, 3-17, 18, 18a).
// Woodland beings fight as monsters of their Hit Dice. Dexterity applies to AC; worn armour
// counts only if it is better than the natural AC.
// ---------------------------------------------------------------------------
type Stage = NonNullable<ClassData['preStages']>[number];
const stage = (name: string, short: string, xp: number, dice: number, extra: Partial<Stage> = {}): Stage =>
    ({ name, short, xp, dice, plus: 0, thac0: monsterThac0(dice, 0), ...extra });
const nmStage = (dice: number, extra: Partial<Stage> = {}): Stage => stage("Normal Monster", "NM", 0, dice, extra);
const monsterThac0Table = (hd: [number, number][]): number[] => hd.map(([d, p], lvl) => lvl === 0 ? 20 : monsterThac0(d, p));
/** Save-as level for every class level (index = level), capped at 36. */
const saveLevels = (hd: [number, number][], f: (dice: number, lvl: number) => number): number[] =>
    hd.map(([d], lvl) => lvl === 0 ? 1 : Math.max(1, Math.min(36, f(d, lvl))));
/** Spell table rows for levels 1.., then the last row repeated to 36th level. */
const expandSpells = (rows: number[][]): number[][] =>
    Array.from({ length: 37 }, (_, lvl) => lvl === 0 ? [] : (rows[Math.min(lvl, rows.length) - 1] ?? []).slice());
/** Magic item use (S/F/B/U) rows [S max, F max, B max] for levels 1-10; later levels keep the 10th-level row. */
const expandItemUse = (rows: [number, number, number][]): [number, number, number][] =>
    Array.from({ length: 37 }, (_, lvl) => lvl === 0 ? [0, 100, 100] as [number, number, number] : rows[Math.min(lvl, rows.length) - 1]!);
const enc = (rows: [number, number][]) => rows.map(([max, speed]) => ({ max, speed }));
/** PC1 Tables 18 and 18a: maximum cn at 15' / 30' / 60' / 90' / 120' / 150' / 180' / 210'. */
const encFromColumns = (cols: number[]) => {
    const speeds = [15, 30, 60, 90, 120, 150, 180, 210];
    return enc(cols.map((max, i) => [max, speeds[i]!] as [number, number]).reverse());
};
const PC1_PRIME_NOTE = "XP bonus: +5% if every prime requisite is 13+, +10% if every one is 16+";
const fairyFeatures = (visibleNote = "You become visible to anyone you attack."): ClassFeature[] => [
    { minLevel: 1, name: "Invisible to Mortals", description: `At will you bend light so that mortals cannot see you (only creatures with second sight, other fairies among them, and detect invisible can). ${visibleNote} After a round you can will yourself invisible again.` },
    { minLevel: 1, name: "Second Sight", description: "Like all fairies you recognise a fairy's true form, even when it is invisible to mortals, polymorphed or shapechanged." },
    { minLevel: 1, name: "Fairy Nature", description: "Fairies are immune to the paralysis of ghouls and never suffer natural diseases." },
];
const itemUseFeature = (who: string): ClassFeature =>
    ({ minLevel: 1, name: "Magic Item Use", description: `${who} From 1st level you may also try items restricted to magic-users, elves and spellcasting fairies: roll d% on your level's row (shown below). S = success; F = the item does nothing; B = backfire, aimed at the wrong target (usually you); U = unexpected result (1d6: 1-2 helpful, 3-4 harmful, 5-6 indifferent; the DM decides what happens).` });

// --- Tables -----------------------------------------------------------------
// Table 3: dryad. Spells as a druid (cleric table, first spell at 2nd level).
const DryadXP = expandXp([0, 3000, 9000, 21000, 45000, 95000, 190000, 380000, 680000, 980000, 1280000, 1580000], 300000);
const DryadHD = expandHitDice([[0, 0], [2, 0], [3, 0], [3, 0], [4, 0], [4, 0], [5, 0], [5, 0], [6, 0], [6, 0], [7, 0], [7, 1]], 1);
// Table 4: faun.
const FaunXP = expandXp([0, 1000, 2000, 4000, 8000, 16000, 32000, 64000, 130000, 260000, 460000], 200000);
const FaunHD = expandHitDice([[0, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [10, 2]], 2);
// Table 5: hsiao. Spells as a cleric four levels higher, up to the 11th-level row.
const HsiaoXP = expandXp([0, 8000, 24000, 56000, 115000, 250000, 500000, 800000, 1100000, 1400000, 1700000, 2000000, 2300000], 300000);
const HsiaoHD = expandHitDice([[0, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [11, 0], [12, 0], [13, 0], [14, 0], [15, 0], [15, 1]], 1);
const HsiaoSpells = expandSpells([[2, 2], [2, 2, 1], [3, 2, 2], [3, 3, 2, 1], [3, 3, 3, 2], [4, 4, 3, 2, 1], [4, 4, 3, 3, 2],
    [4, 4, 4, 3, 2, 1], [5, 5, 4, 3, 2, 2], [5, 5, 5, 3, 3, 2], [6, 5, 5, 3, 3, 2]]);
// Table 6: treant.
const TreantXP = expandXp([0, 48000, 145000, 340000, 640000, 940000, 1240000, 1540000, 1840000, 2140000, 2440000], 300000);
const TreantHD = expandHitDice([[0, 0], [8, 0], [9, 0], [9, 0], [10, 0], [10, 0], [11, 0], [11, 0], [12, 0], [12, 0], [12, 3]], 3);
// Table 7: wood imp.
const WoodImpXP = expandXp([0, 800, 1600, 3200, 6400, 12800, 25000, 50000, 100000, 200000, 360000, 520000], 160000);
const WoodImpHD = expandHitDice([[0, 0], [2, 0], [3, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [10, 2]], 2);
// Table 9: brownie (and redcap).
const BrownieXP = expandXp([0, 2000, 6000, 14000, 30500, 62000, 125000, 250000, 500000, 800000, 1100000], 300000);
const BrownieHD = expandHitDice([[0, 0], [3, 0], [4, 0], [5, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [10, 2]], 2);
const BrownieItemUse = expandItemUse([[5, 89, 99], [5, 89, 98], [10, 89, 97], [15, 89, 96], [15, 89, 95], [20, 89, 94], [20, 89, 93], [25, 89, 92], [25, 89, 91], [30, 89, 90]]);
// Table 10: leprechaun.
const LeprechaunXP = expandXp([0, 2000, 4000, 8000, 16000, 32000, 64000, 130000, 260000, 520000, 780000, 1040000, 1300000], 260000);
const LeprechaunHD = expandHitDice([[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [9, 0], [9, 1], [9, 2]], 1);
const LeprechaunSpells = expandSpells([[1], [2], [2, 1], [2, 2], [2, 2, 1], [3, 2, 2], [3, 2, 2, 1], [3, 3, 2, 2], [3, 3, 2, 2, 1], [4, 3, 3, 2, 2], [4, 4, 4, 3, 3], [4, 4, 4, 4, 4]]);
// Tables 11 & 12: pixie and sprite (same XP).
const PixieXP = expandXp([0, 2000, 4000, 8000, 16000, 32000, 64000, 128000, 250000, 500000, 800000], 300000);
const PixieHD = expandHitDice([[0, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [10, 0], [10, 1]], 1);
const PixieItemUse = expandItemUse([[5, 84, 99], [10, 84, 98], [10, 84, 97], [15, 84, 96], [20, 84, 95], [20, 84, 94], [25, 84, 93], [30, 84, 92], [30, 84, 91], [35, 84, 90]]);
// Table 13: sprite spells.
const SpriteSpells = expandSpells([
    [1], [2], [2, 1], [2, 2], [2, 2, 1], [2, 2, 2], [2, 2, 2, 1], [3, 2, 2, 2], [3, 2, 2, 2, 1], [3, 3, 2, 2, 2],
    [3, 3, 3, 2, 2, 1], [4, 3, 3, 2, 2, 2], [4, 4, 3, 2, 2, 2, 1], [4, 4, 3, 3, 3, 2, 1], [4, 4, 4, 3, 3, 2, 2], [4, 4, 4, 4, 4, 3, 2],
    [4, 4, 4, 4, 4, 3, 3], [4, 4, 4, 4, 4, 4, 4], [5, 5, 5, 4, 4, 4, 4], [5, 5, 5, 5, 5, 4, 4], [5, 5, 5, 5, 5, 5, 5], [6, 6, 5, 5, 5, 5, 5],
    [6, 6, 6, 6, 5, 5, 5], [6, 6, 6, 6, 6, 6, 5], [6, 6, 6, 6, 6, 6, 6], [7, 7, 7, 6, 6, 6, 6], [7, 7, 7, 7, 7, 6, 6], [7, 7, 7, 7, 7, 7, 7],
    [8, 8, 7, 7, 7, 7, 7], [8, 8, 8, 8, 7, 7, 7], [8, 8, 8, 8, 8, 8, 7], [8, 8, 8, 8, 8, 8, 8], [9, 9, 8, 8, 8, 8, 8], [9, 9, 9, 9, 8, 8, 8],
    [9, 9, 9, 9, 9, 9, 8], [9, 9, 9, 9, 9, 9, 9]]);
// Table 14: pooka.
const PookaXP = expandXp([0, 4000, 12000, 28000, 60500, 125500, 250500, 500000, 800000, 1100000, 1400000], 300000);
const PookaHD = expandHitDice([[0, 0], [3, 0], [3, 0], [4, 0], [5, 0], [5, 0], [6, 0], [7, 0], [8, 0], [8, 1], [8, 2]], 1);
const PookaItemUse = expandItemUse([[5, 79, 98], [10, 79, 96], [15, 79, 94], [20, 79, 92], [25, 79, 90], [30, 79, 88], [35, 79, 86], [40, 79, 84], [45, 79, 82], [50, 79, 80]]);
// Tables 15 & 16: sidhe (warrior d8, rogue d4; same XP and spells).
const SidheXP = expandXp([0, 2500, 5000, 10000, 20000, 40000, 80000, 160000, 320000, 620000, 920000, 1220000], 290000);
const SidheWarriorHD = expandHitDice([[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [9, 1], [9, 1]], 1);
const SidheRogueHD = expandHitDice([[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [5, 0], [6, 0], [7, 0], [8, 0], [9, 0], [9, 1], [9, 2]], 1);
const SidheSpells = expandSpells([
    [1], [2], [2, 1], [2, 2], [3, 2], [3, 2, 1], [3, 2, 2], [3, 3, 2], [3, 3, 2, 1], [3, 3, 2, 2],
    [3, 3, 3, 2], [3, 3, 3, 2, 1], [3, 3, 3, 2, 2], [3, 3, 3, 3, 2], [3, 3, 3, 3, 2, 1], [3, 3, 3, 3, 2, 2],
    [3, 3, 3, 3, 3, 2], [3, 3, 3, 3, 3, 2, 1], [3, 3, 3, 3, 3, 2, 2], [3, 3, 3, 3, 3, 3, 3], [4, 4, 3, 3, 3, 3, 3], [4, 4, 4, 4, 3, 3, 3],
    [4, 4, 4, 4, 4, 4, 3], [4, 4, 4, 4, 4, 4, 4], [5, 5, 4, 4, 4, 4, 4], [5, 5, 5, 5, 4, 4, 4], [5, 5, 5, 5, 5, 5, 4], [5, 5, 5, 5, 5, 5, 5],
    [6, 6, 5, 5, 5, 5, 5], [6, 6, 6, 6, 5, 5, 5], [6, 6, 6, 6, 6, 6, 5], [6, 6, 6, 6, 6, 6, 6], [7, 7, 6, 6, 6, 6, 6], [7, 7, 7, 7, 6, 6, 6],
    [7, 7, 7, 7, 7, 7, 6], [7, 7, 7, 7, 7, 7, 7]]);
// Table 17: woodrake.
const WoodrakeXP = expandXp([0, 16000, 48000, 112000, 240000, 500000, 800000, 1100000, 1400000, 1700000, 2000000], 250000);
const WoodrakeHD = expandHitDice([[0, 0], [5, 0], [5, 0], [6, 0], [7, 0], [7, 0], [8, 0], [9, 0], [9, 0], [10, 0], [10, 1]], 1);
const WoodrakeItemUse = BrownieItemUse;
// Thief skills: as a thief of its Hit Dice to 10th level, then one thief level per two levels.
const WoodrakeThief = WoodrakeHD.map(([d], lvl) => lvl === 0 ? 0 : (lvl <= 10 ? d : 10 + Math.floor((lvl - 10) / 2)));

const fairySpellNote = "Fairy spells: no spellbook or prayer. You commune with nature to store spell energy and then cast as a magic-user does (Fairy-Charms list, PC1 p. 41)";

const PC1WoodlandClasses: Record<string, ClassData> = {
    "Brownie": {
        name: "Brownie", source: PC1, hitDie: 8, hpPerLevelAfter9: 2,
        xpTable: BrownieXP, saves: HalflingSaves, saveLevels: saveLevels(BrownieHD, d => Math.min(8, d)),
        thac0: monsterThac0Table(BrownieHD), hitDiceTable: BrownieHD,
        preStages: [stage("Young Brownie", "Young", -2000, 1, { saveLevel: 1 }), nmStage(2, { saveLevel: 2 })],
        encumbranceTable: encFromColumns([1200, 800, 600, 400, 200]),
        itemUse: BrownieItemUse,
        weaponFeatsProgression: { start: 2, gainLevels: standardFeatLevels },
        minScores: { strength: 5, dexterity: 8 }, maxScores: { charisma: 16 },
        restrictions: ["Starts at -2,000 XP", PC1_PRIME_NOTE],
        armour: 'any', allowedShields: true,
        allowedArmor: "Any armour or shield sized to fit a brownie",
        allowedWeapons: "Brownie-sized weapons. One-handed: blackjack, blowgun, bola, club, dagger, hand axe, horned shield, javelin, knife shield, short sword, sling, throwing hammer. Two-handed (no shield): light crossbow, mace, net, normal sword, shortbow, staff, whip",
        features: [
            { minLevel: 1, name: "Growing Up", description: "You start at -2,000 XP (1 Hit Die), become a normal monster at 0 XP (2 Hit Dice) and reach 1st level at 2,000 XP. You fight as a monster of your Hit Dice and save as a halfling of a level equal to your Hit Dice (8th at most)." },
            ...fairyFeatures("Unlike most special abilities, you have it from the very first stage. You become visible to anyone you attack."),
            itemUseFeature("Magic items for fighters, dwarves and halflings work for you as usual."),
            { minLevel: 1, name: "Movement", description: "120' (40') carrying up to 200 cn; 90' up to 400; 60' up to 600; 30' up to 800; 15' up to 1,200; more and you cannot move (PC1 Table 18)." },
            { minLevel: 1, name: "Languages", description: "Fairy, the local language, Halfling and your alignment tongue; you can speak with animals." },
        ],
    },
    "Dryad": {
        name: "Dryad", source: PC1, hitDie: 8, hpPerLevelAfter9: 1,
        xpTable: DryadXP, saves: ClericSaves,
        thac0: monsterThac0Table(DryadHD), hitDiceTable: DryadHD,
        preStages: [stage("Young Dryad", "Young", -3000, 1), nmStage(2)],
        naturalArmourClass: 7,
        encumbranceTable: encFromColumns([2400, 1600, 1200, 800, 400]),
        casterType: 'divine', spellList: 'dryad', spellProgression: ClericSpells,
        weaponFeatsProgression: { start: 2, gainLevels: standardFeatLevels },
        minScores: { wisdom: 8, charisma: 12 }, maxScores: { strength: 16 },
        restrictions: ["Starts at -3,000 XP", PC1_PRIME_NOTE],
        armour: 'none', allowedShields: false,
        allowedArmor: "None (as a magic-user)",
        allowedWeapons: "As a magic-user: dagger, staff, sling, whip, net, blowgun",
        features: [
            { minLevel: 1, name: "Growing Up", description: "You start at -3,000 XP (1 Hit Die), become a normal monster at 0 XP (2 Hit Dice) and reach 1st level at 3,000 XP. You fight as a monster of your Hit Dice and save as a cleric of your level." },
            { minLevel: 1, name: "Natural Armour", description: "AC 7 (Dexterity applies). You cannot wear armour." },
            { minLevel: 1, name: "Magic Items", description: "Any non-weapon magic item permitted to clerics, and magic versions of the weapons you may use." },
            { minLevel: 1, name: "Charm", description: "From normal monster on: charm as the magic-user spell charm person, three times a day (targets save normally). A dryad bound to a soul-tree may use it once a round, with victims saving at -2, but can never go more than 240' from her tree." },
            { minLevel: 1, name: "Druid Spells", description: "You cast spells as a druid of your level (cleric and druid spells; the first spell comes at 2nd level). PC1 also suggests insect messenger (1st) and polymorph other to plant (3rd)." },
            { minLevel: 1, name: "Movement", description: "120' (40') carrying up to 400 cn; 90' up to 800; 60' up to 1,200; 30' up to 1,600; 15' up to 2,400; more and you cannot move (PC1 Table 18)." },
            { minLevel: 1, name: "Languages", description: "Dryad, the local language, Elvish, Fairy, Treant and your alignment tongue; you can speak with plants." },
            { minLevel: 3, name: "Plant Shape", description: "Shapechange into one chosen plant form and back once a day (each change takes a round); every two levels after 3rd, one more use a day and one more plant form. Each change heals 1d4 hp per level, but never more than half the damage you had taken. In plant form you can be hurt normally and can neither cast spells nor fight." },
            { minLevel: 10, name: "Famine Curse", description: "Once a month, on a creature that has violated (cut, burned...) a dryad's soul-tree: unless it saves vs. spells at -4 it suffers insatiable hunger and starves to death in 3-12 weeks. Only a wish, or remove curse by a Lawful cleric of 17th level or more, can save it." },
        ],
    },
    "Faun": {
        name: "Faun", source: PC1, hitDie: 4, hpPerLevelAfter9: 2,
        xpTable: FaunXP, saves: ThiefSaves,
        thac0: monsterThac0Table(FaunHD), hitDiceTable: FaunHD,
        preStages: [nmStage(1)],
        naturalArmourClass: 8,
        encumbranceTable: encFromColumns([1800, 1500, 1200, 900, 600, 300]),
        weaponFeatsProgression: { start: 2, gainLevels: standardFeatLevels },
        minScores: { dexterity: 8, constitution: 5 }, maxScores: { strength: 16, intelligence: 15, charisma: 15 },
        restrictions: [PC1_PRIME_NOTE],
        armour: 'any', allowedShields: true,
        allowedArmor: "Any armour suited to your body",
        allowedWeapons: "Any weapon suited to your body",
        features: [
            { minLevel: 1, name: "Normal Monster Stage", description: "You start as a normal monster (0 XP, 1 Hit Die) and reach 1st level at 1,000 XP. You fight as a monster of your Hit Dice and save as a thief of your level." },
            { minLevel: 1, name: "Natural Armour", description: "AC 8 (Dexterity applies); armour counts only if it is better." },
            { minLevel: 1, name: "Magic Items", description: "Any magic item not restricted to magic-users, plus any item in the form of food, drink or a musical instrument." },
            { minLevel: 1, name: "Movement", description: "150' (50') carrying up to 300 cn; 120' up to 600; 90' up to 900; 60' up to 1,200; 30' up to 1,500; 15' up to 1,800; more and you cannot move (PC1 Table 18)." },
            { minLevel: 1, name: "Languages", description: "Dryad, the local language and your alignment tongue; you can speak with animals." },
            { minLevel: 5, name: "Amplify Impulse", description: "Playing an instrument you know (preferably shepherd's pipes) for at least a round, you draw out an impulse already present in someone (anger, confusion, love, hunger, thirst, panic) until it rules them. They save vs. spells at +4 the first round, +3 the second, and so on down to -4 from the 9th round. From the 5th round you must also save each round or be swept up by the same impulse. Any interruption starts it over. Deaf or magically silenced targets are immune. Saves are a further -1 against a 10th-level faun, -2 against 15th, and so on every five levels." },
            { minLevel: 10, name: "Make Plants Grow", description: "Playing for five rounds or more, you can amplify plants' urge to grow: treat it as the growth of plants spell." },
        ],
    },
    "Hsiao": {
        name: "Hsiao", source: PC1, hitDie: 8, hpPerLevelAfter9: 1,
        xpTable: HsiaoXP, saves: ClericSaves,
        thac0: monsterThac0Table(HsiaoHD), hitDiceTable: HsiaoHD,
        preStages: [
            stage("Hatchling", "Young", -8000, 1, { armourClass: 8, attacks: { count: 3, note: "claw/claw/bite 1-2/1-2/1-2" } }),
            stage("Fledgling", "Young", -6000, 2, { armourClass: 7, spells: [1], attacks: { count: 3, note: "claw/claw/bite 1-3/1-3/1-2" } }),
            stage("Young Hsiao", "Young", -4000, 3, { armourClass: 6, spells: [2], attacks: { count: 3, note: "claw/claw/bite 1-4/1-4/1-3" } }),
            nmStage(4, { armourClass: 5, spells: [2, 1] }),
        ],
        naturalArmourClass: 5,
        naturalAttacks: { count: 3, note: "claw/claw/bite 1-6/1-6/1-4" },
        encumbranceTable: encFromColumns([500, 350, 200, 100]),
        flyingTable: encFromColumns([300, 250, 200, 150, 100, 75, 50, 20]),
        casterType: 'divine', spellProgression: HsiaoSpells,
        minScores: { intelligence: 6, wisdom: 8 }, maxScores: { strength: 16 },
        restrictions: ["Starts at -8,000 XP", "Almost always Lawful", PC1_PRIME_NOTE],
        armour: 'none', allowedShields: false,
        allowedArmor: "No normal armour (special hsiao armour pieces may improve AC slightly)",
        allowedWeapons: "None: claws and beak",
        features: [
            { minLevel: 1, name: "Growing Up", description: "You hatch at -8,000 XP (1 Hit Die, AC 8), grow through -6,000 (2 HD, AC 7, first spell) and -4,000 (3 HD, AC 6), become a normal monster at 0 XP (4 HD, AC 5) and reach 1st level at 8,000 XP. You fight as a monster of your Hit Dice and save as a cleric of your level." },
            { minLevel: 1, name: "Claws and Beak", description: "Three attacks a round (claw/claw/bite): 1-2/1-2/1-2 at -8,000 XP, 1-3/1-3/1-2 at -6,000, 1-4/1-4/1-3 at -4,000, and 1-6/1-6/1-4 from 0 XP. Like monsters, high-level hsiao can hit creatures that normally need magic weapons." },
            { minLevel: 1, name: "Natural Armour", description: "AC 5 (Dexterity applies). You cannot wear normal armour." },
            { minLevel: 1, name: "Magic Items", description: "Any non-weapon, non-armour magic item permitted to clerics, if its shape suits your wings." },
            { minLevel: 1, name: "Clerical Spells", description: "You cast cleric spells as a cleric four levels higher, up to 15th-level ability (the 11th-level row)." },
            { minLevel: 1, name: "Flight", description: "Flying: 210' (70') carrying up to 20 cn; 180' up to 50; 150' up to 75; 120' up to 100; 90' up to 150; 60' up to 200; 30' up to 250; 15' up to 300 (PC1 Table 18a). An encumbered flyer must rest one turn after every three turns of flying. Walking: 90' (30') up to 100 cn, 60' up to 200, 30' up to 350, 15' up to 500." },
            { minLevel: 1, name: "Languages", description: "Hsiao, the local language, Centaur, Dryad, Elvish, Fairy, Treant and your alignment tongue; you can speak with birds." },
        ],
    },
    "Leprechaun": {
        name: "Leprechaun", source: PC1, hitDie: 4, hpPerLevelAfter9: 1,
        xpTable: LeprechaunXP, saves: ElfSaves, saveLevels: LeprechaunHD.map((_, lvl) => Math.max(1, Math.min(10, lvl))),
        thac0: monsterThac0Table(LeprechaunHD), hitDiceTable: LeprechaunHD,
        preStages: [nmStage(1, { die: 2, thac0: monsterThac0(1, 0) })],
        encumbranceTable: encFromColumns([100, 50, 20]),
        casterType: 'arcane', spellList: 'fairy', spellProgression: LeprechaunSpells,
        spellListChanges: [
            { name: "Warp Wood", level: 1 }, { name: "Locate Object", level: 1 }, { name: "Polymorph Natural Object", level: 4 },
            { name: "Contingency", level: 5 }, { name: "Metal to Wood", level: 5 }, { name: "Permanence", level: 5 },
            { name: "Polymorph Any Object", level: 5 }, { name: "Summon Object", level: 5 },
        ],
        weaponFeatsProgression: { start: 2, gainLevels: standardFeatLevels },
        minScores: { intelligence: 9, dexterity: 9, constitution: 5 }, maxScores: { strength: 13, constitution: 16 },
        restrictions: [PC1_PRIME_NOTE],
        armour: 'any', allowedShields: true,
        allowedArmor: "Any armour of your size (no hindrance to spellcasting)",
        allowedWeapons: "Any weapon of your size",
        features: [
            { minLevel: 1, name: "Normal Monster Stage", description: "You start as a normal monster (0 XP, 1-2 hp) and reach 1st level at 2,000 XP, gaining another 1-2 hp (in effect a 1d4 Hit Die; Constitution applies to both rolls). You fight as a monster of your Hit Dice and save as an elf of your level (1st as a normal monster, 10th at most)." },
            ...fairyFeatures("If a mortal sees you, you cannot vanish from that person's eyes until they look away, however briefly. You become visible to anyone you attack."),
            { minLevel: 1, name: "Magic Items", description: "Any magic item not limited to clerics." },
            { minLevel: 1, name: "Fairy Spells", description: `${fairySpellNote}. For leprechauns warp wood and locate object are 1st level, polymorph natural object 4th, and contingency, create normal animals, metal to wood, permanence, polymorph any object and summon object 5th (the DM may keep the 5th-level ones for high levels). Maximum spell ability is the 12th-level row.` },
            { minLevel: 1, name: "Movement", description: "60' (20') carrying up to 20 cn; 30' up to 50; 15' up to 100; more and you cannot move (PC1 Table 18)." },
            { minLevel: 1, name: "Languages", description: "Fairy, the local language, Elvish, Gnome and your alignment tongue; you can speak with animals." },
        ],
    },
    "Pixie": {
        name: "Pixie", source: PC1, hitDie: 8, hpPerLevelAfter9: 1,
        xpTable: PixieXP, saves: ElfSaves, saveLevels: saveLevels(PixieHD, d => d),
        thac0: monsterThac0Table(PixieHD), hitDiceTable: PixieHD,
        preStages: [nmStage(1)],
        encumbranceTable: encFromColumns([200, 150, 75, 25]),
        flyingTable: encFromColumns([40, 35, 25, 20, 15, 10, 5]),
        itemUse: PixieItemUse,
        weaponFeatsProgression: { start: 2, gainLevels: standardFeatLevels },
        minScores: { intelligence: 8, dexterity: 9 }, maxScores: { strength: 13, constitution: 16 },
        restrictions: [PC1_PRIME_NOTE],
        armour: 'any', allowedShields: true,
        allowedArmor: "Any armour or shield of suitable size",
        allowedWeapons: "Any weapon of suitable size",
        features: [
            { minLevel: 1, name: "Normal Monster Stage", description: "You start as a normal monster (0 XP, 1 Hit Die) and reach 1st level at 2,000 XP. You fight as a monster of your Hit Dice and save as an elf of a level equal to your Hit Dice." },
            ...fairyFeatures("Pixies stay invisible even while attacking: you always gain surprise against those who cannot see the invisible, and they attack you at -4 in later rounds."),
            itemUseFeature("Magic items permitted to fighters work for you (if their size fits)."),
            { minLevel: 1, name: "Flight", description: "Flying: 180' (60') carrying up to 5 cn; 150' up to 10; 120' up to 15; 90' up to 20; 60' up to 25; 30' up to 35; 15' up to 40 (PC1 Table 18a). After three turns of flying you must rest at least one turn. Walking: 90' (30') up to 25 cn, 60' up to 75, 30' up to 150, 15' up to 200." },
            { minLevel: 1, name: "Languages", description: "Fairy, the local language, Elvish, Gnome, Halfling and your alignment tongue; you can speak with animals." },
        ],
    },
    "Pooka": {
        name: "Pooka", source: PC1, hitDie: 8, hpPerLevelAfter9: 1,
        xpTable: PookaXP, saves: ThiefSaves, saveLevels: saveLevels(PookaHD, (d, lvl) => Math.max(d, lvl)),
        thac0: monsterThac0Table(PookaHD), hitDiceTable: PookaHD,
        preStages: [stage("Young Pooka", "Young", -4000, 1, { saveLevel: 1 }), nmStage(2, { saveLevel: 2 })],
        naturalArmourClass: 7,
        encumbranceTable: encFromColumns([2400, 1600, 1200, 800, 400]),
        itemUse: PookaItemUse,
        weaponFeatsProgression: { start: 2, gainLevels: standardFeatLevels },
        minScores: { wisdom: 8, constitution: 5, charisma: 8 },
        restrictions: ["Starts at -4,000 XP", PC1_PRIME_NOTE],
        armour: 'none', allowedShields: false,
        allowedArmor: "No armour or shields",
        allowedWeapons: "Only if your animal shape allows it (e.g. a bipedal mouse); otherwise the real animal's natural attacks",
        features: [
            { minLevel: 1, name: "Growing Up", description: "You start at -4,000 XP (1 Hit Die), become a normal monster at 0 XP (2 Hit Dice) and reach 1st level at 4,000 XP. You fight as a monster of your Hit Dice and save as a thief of your level or Hit Dice, whichever is higher." },
            { minLevel: 1, name: "Animal Shape", description: "You have one animal shape (horse, goat, hound, a bipedal man-sized rabbit in tailored clothes...) and can always speak as a human. Some shapes give natural attacks as the real animal (a riding horse: two hooves, 1-4/1-4, and no weapons)." },
            { minLevel: 1, name: "Natural Armour", description: "AC 7 (Dexterity applies). You cannot wear armour." },
            ...fairyFeatures("Unlike other fairies, you may let some mortals see you while staying invisible to the rest. You become visible to anyone you attack."),
            itemUseFeature("Non-weapon magic items permitted to thieves work for you as usual."),
            { minLevel: 1, name: "Nightmares", description: "From normal monster on, you may put whatever dreams you wish into a sleeper's mind (save vs. spells). They have no power as such, but may be taken as a sign." },
            { minLevel: 1, name: "Age Inanimate Object", description: "From normal monster on, at will by touch: speeds up time for a non-living thing (food spoils, metal rusts, wood rots, wine or beer ferments to just the right age)." },
            { minLevel: 1, name: "Movement", description: "120' (40') carrying up to 400 cn; 90' up to 800; 60' up to 1,200; 30' up to 1,600; 15' up to 2,400; more and you cannot move (PC1 Table 18)." },
            { minLevel: 1, name: "Languages", description: "Fairy, the local language and your alignment tongue; you can speak with animals." },
            { minLevel: 3, name: "Hasten Self", description: "As the haste spell on yourself only: 10 rounds a day at 3rd level, two more rounds a day for every level after (20 at 8th)." },
            { minLevel: 5, name: "Haste / Slow Other", description: "Cast haste or slow on others as the magic-user spell, once a day at 5th level and one more time a day every two levels (three at 9th)." },
            { minLevel: 7, name: "Healing", description: "By touch and concentration, restore 1 hp per round; up to twice your level in rounds a day." },
            { minLevel: 9, name: "Dodge", description: "Step out of time to avoid one attack or spell: a successful save vs. spells avoids it entirely; if the save fails against a spell, you still get its normal save at +2. Only one effect at a time; once a day per level." },
            { minLevel: 10, name: "Shapechange", description: "Take any normal animal form (one round), once a day per three levels." },
            { minLevel: 12, name: "Withering", description: "Once a day by touch: the effect of a staff of withering." },
            { minLevel: 15, name: "Timestop", description: "(PC1 prints no level for this power; it comes between withering at 12th and temporal stasis at 18th, so 15th is assumed.) Like the 9th-level spell, lasting up to your level in rounds, but attacks are possible in only 1-3 of them; item use is limited to non-offensive personal devices. Once a day per five levels (rounded up). From 20th level you can bring one other being with you." },
            { minLevel: 18, name: "Temporal Stasis", description: "Once a day put yourself or another out of time (unwilling targets save vs. spells) for a period you set, up to one year per level; no ageing, healing, food or air. Dispel magic against your level ends it. You may also make the subject invisible to mortals." },
        ],
    },
    "Redcap": {
        name: "Redcap", source: PC1, hitDie: 8, hpPerLevelAfter9: 2,
        xpTable: BrownieXP, saves: HalflingSaves, saveLevels: saveLevels(BrownieHD, d => Math.min(8, d)),
        thac0: monsterThac0Table(BrownieHD), hitDiceTable: BrownieHD,
        preStages: [stage("Young Redcap", "Young", -2000, 1, { saveLevel: 1 }), nmStage(2, { saveLevel: 2 })],
        encumbranceTable: encFromColumns([1200, 800, 600, 400, 200]),
        itemUse: BrownieItemUse,
        weaponFeatsProgression: { start: 2, gainLevels: standardFeatLevels },
        minScores: { strength: 5, dexterity: 8 }, maxScores: { charisma: 10 },
        restrictions: ["Starts at -2,000 XP", "Chaotic (an evil brownie)", PC1_PRIME_NOTE],
        armour: 'any', allowedShields: true,
        allowedArmor: "Any armour or shield sized to fit (redcaps favour sturdy iron boots)",
        allowedWeapons: "As a brownie (pikestaff and knife favoured)",
        features: [
            { minLevel: 1, name: "Evil Brownie", description: "Redcaps are the evil kin of brownies, with the same statistics and abilities. They haunt ruins and sites of old tyranny, fear the Immortals (holy symbols may ward them off; holy water does them 2-8 damage) and vanish in a flame when killed, leaving only a large tooth." },
            { minLevel: 1, name: "Growing Up", description: "You start at -2,000 XP (1 Hit Die), become a normal monster at 0 XP (2 Hit Dice) and reach 1st level at 2,000 XP. You fight as a monster of your Hit Dice and save as a halfling of a level equal to your Hit Dice (8th at most)." },
            { minLevel: 1, name: "Claws and Bite", description: "Disarmed, you can fight with claw-like nails and a bite (1-2/1-2/1)." },
            ...fairyFeatures("You have it from the very first stage. You become visible to anyone you attack."),
            itemUseFeature("Magic items for fighters, dwarves and halflings work for you as usual."),
            { minLevel: 1, name: "Movement", description: "120' (40') carrying up to 200 cn; 90' up to 400; 60' up to 600; 30' up to 800; 15' up to 1,200; more and you cannot move (PC1 Table 18)." },
            { minLevel: 1, name: "Languages", description: "Fairy, the local language, Halfling and your alignment tongue; you can speak with animals." },
        ],
    },
    "Sidhe (Warrior)": {
        name: "Sidhe (Warrior)", source: PC1, hitDie: 8, hpPerLevelAfter9: 1,
        xpTable: SidheXP, saves: FighterSaves,
        thac0: monsterThac0Table(SidheWarriorHD), hitDiceTable: SidheWarriorHD,
        preStages: [nmStage(1, { die: 4 })],
        multipleAttacks: FIGHTER_ATTACKS,
        encumbranceTable: encFromColumns([2400, 1600, 1200, 800, 400]),
        casterType: 'arcane', spellList: 'fairy', spellProgression: SidheSpells,
        spellListChanges: [{ name: "Polymorph Self", level: 2 }],
        weaponFeatsProgression: { start: 4, gainLevels: martialFeatLevels },
        minScores: { strength: 8, intelligence: 8 },
        restrictions: ["Nothing made of iron", PC1_PRIME_NOTE],
        armour: 'any', allowedShields: true,
        allowedArmor: "Any armour open to fighters, but never of iron (bronze, silver, mithril...)",
        allowedWeapons: "Any weapon open to fighters, but never of iron (stone, bronze, silver...; enchanted +3 or better is fine)",
        features: [
            { minLevel: 1, name: "Normal Monster Stage", description: "You start as a normal sidhe (0 XP, 1d4 hp, like a normal human) and reach 1st level at 2,500 XP, gaining another 1d4 hp (in effect a 1d8 Hit Die; Constitution applies to both rolls). You fight as a monster of your Hit Dice and save as a fighter of your level." },
            ...fairyFeatures(),
            { minLevel: 1, name: "Breathe Water", description: "You breathe water as easily as air." },
            { minLevel: 1, name: "Iron Is Poison", description: "Iron weapons do you no extra damage, but long contact slowly and permanently drains hit points and ability scores (ingested iron too). You never use weapons, armour or tools of iron." },
            { minLevel: 1, name: "Magic Items", description: "Any magic item permitted to magic-users or fighters." },
            { minLevel: 1, name: "Fairy Spells", description: `${fairySpellNote}. Sidhe are renowned shapechangers: polymorph self is a 2nd-level spell for you, and lasts until you choose to return, are killed or it is dispelled.` },
            { minLevel: 1, name: "Movement", description: "120' (40') carrying up to 400 cn; 90' up to 800; 60' up to 1,200; 30' up to 1,600; 15' up to 2,400; more and you cannot move (PC1 Table 18)." },
            { minLevel: 1, name: "Languages", description: "Fairy, the local language, Dryad, Elvish, Gnome, Treant and your alignment tongue; you can speak with animals." },
        ],
    },
    "Sidhe (Rogue)": {
        name: "Sidhe (Rogue)", source: PC1, hitDie: 4, hpPerLevelAfter9: 1,
        xpTable: SidheXP, saves: ThiefSaves,
        thac0: monsterThac0Table(SidheRogueHD), hitDiceTable: SidheRogueHD,
        preStages: [nmStage(1)],
        thiefSkillsAs: Array.from({ length: 37 }, (_, lvl) => lvl),
        encumbranceTable: encFromColumns([2400, 1600, 1200, 800, 400]),
        casterType: 'arcane', spellList: 'fairy', spellProgression: SidheSpells,
        spellListChanges: [{ name: "Polymorph Self", level: 2 }],
        weaponFeatsProgression: { start: 2, gainLevels: standardFeatLevels },
        minScores: { strength: 8, intelligence: 8, dexterity: 8 },
        restrictions: ["Nothing made of iron", PC1_PRIME_NOTE],
        armour: 'leather', allowedShields: false,
        allowedArmor: "As a thief (leather), never of iron",
        allowedWeapons: "Any weapon open to thieves, but never of iron (stone, bronze, silver...; enchanted +3 or better is fine)",
        features: [
            { minLevel: 1, name: "Normal Monster Stage", description: "You start as a normal sidhe (0 XP, 1d4 hp, like a normal human) and reach 1st level at 2,500 XP; rogues gain no hit points for reaching 1st level. You fight as a monster of your Hit Dice and save as a thief of your level." },
            { minLevel: 1, name: "Thief Skills", description: "You have the special skills of a thief of your level (open locks, backstab...)." },
            ...fairyFeatures(),
            { minLevel: 1, name: "Breathe Water", description: "You breathe water as easily as air." },
            { minLevel: 1, name: "Iron Is Poison", description: "Iron weapons do you no extra damage, but long contact slowly and permanently drains hit points and ability scores (ingested iron too). You never use weapons, armour or tools of iron." },
            { minLevel: 1, name: "Magic Items", description: "Any magic item permitted to magic-users or thieves." },
            { minLevel: 1, name: "Fairy Spells", description: `${fairySpellNote}. Sidhe are renowned shapechangers: polymorph self is a 2nd-level spell for you, and lasts until you choose to return, are killed or it is dispelled.` },
            { minLevel: 1, name: "Movement", description: "120' (40') carrying up to 400 cn; 90' up to 800; 60' up to 1,200; 30' up to 1,600; 15' up to 2,400; more and you cannot move (PC1 Table 18)." },
            { minLevel: 1, name: "Languages", description: "Fairy, the local language, Dryad, Elvish, Gnome, Treant and your alignment tongue; you can speak with animals." },
        ],
    },
    "Sprite": {
        name: "Sprite", source: PC1, hitDie: 4, hpPerLevelAfter9: 1,
        xpTable: PixieXP, saves: ElfSaves, saveLevels: saveLevels(PixieHD, d => d),
        thac0: monsterThac0Table(PixieHD), hitDiceTable: PixieHD,
        preStages: [nmStage(1)],
        naturalArmourClass: 8,
        encumbranceTable: encFromColumns([150, 75, 25]),
        flyingTable: encFromColumns([30, 25, 20, 15, 10, 5, 3]),
        casterType: 'arcane', spellList: 'fairy', spellProgression: SpriteSpells,
        spellListChanges: [{ id: "fairy_sprite_curse", level: 2 }, { id: "fairy_sprite_confusion", level: 3 }],
        weaponFeatsProgression: { start: 2, gainLevels: standardFeatLevels },
        minScores: { intelligence: 9, dexterity: 13 }, maxScores: { strength: 9, constitution: 16 },
        restrictions: [PC1_PRIME_NOTE],
        armour: 'none', allowedShields: false,
        allowedArmor: "None (it hinders flying and spellcasting)",
        allowedWeapons: "One-handed weapons of your size",
        features: [
            { minLevel: 1, name: "Normal Monster Stage", description: "You start as a normal monster (0 XP, 1 Hit Die) and reach 1st level at 2,000 XP. You fight as a monster of your Hit Dice and save as an elf of a level equal to your Hit Dice." },
            { minLevel: 1, name: "Natural Armour", description: "AC 8 (Dexterity applies). You wear no armour." },
            ...fairyFeatures(),
            { minLevel: 1, name: "Sprite Curse", description: "Five sprites together can cast one of their famous mischievous curses. Higher-level sprites can take curse as a 2nd-level spell of their own (remove curse stays 3rd), and a single-target confusion at 3rd level; anyone protected from being pixy-led is immune to it." },
            { minLevel: 1, name: "Fairy Spells", description: `${fairySpellNote}. Sprites rise quickly to 7th-level spells but hold fewer in all (63 at 36th level).` },
            { minLevel: 1, name: "Flight", description: "Flying: 180' (60') carrying up to 3 cn; 150' up to 5; 120' up to 10; 90' up to 15; 60' up to 20; 30' up to 25; 15' up to 30 (PC1 Table 18a). An encumbered flyer must rest one turn after every three turns of flying. Walking: 60' (20') up to 25 cn, 30' up to 75, 15' up to 150." },
            { minLevel: 1, name: "Languages", description: "Fairy, the local language, Elvish, Gnome, Halfling and your alignment tongue; you can speak with animals." },
        ],
    },
    "Treant": {
        name: "Treant", source: PC1, hitDie: 8, hpPerLevelAfter9: 3,
        xpTable: TreantXP, saves: FighterSaves, saveLevels: saveLevels(TreantHD, (d, lvl) => Math.max(d, lvl)),
        thac0: monsterThac0Table(TreantHD), hitDiceTable: TreantHD,
        preStages: [
            stage("Sapling", "Young", -48000, 2, { armourClass: 8, saveLevel: 2, attacks: { count: 2, note: "limbs 1-6/1-6" } }),
            stage("Young Treant", "Young", -36500, 4, { armourClass: 6, saveLevel: 4, attacks: { count: 2, note: "limbs 1-8/1-8" } }),
            stage("Awakened Treant", "Young", -24000, 6, { armourClass: 4, saveLevel: 6, attacks: { count: 2, note: "limbs 1-10/1-10" } }),
            nmStage(8, { armourClass: 2, saveLevel: 8 }),
        ],
        naturalArmourClass: 2,
        naturalAttacks: { count: 2, note: "limbs 2-12/2-12" },
        encumbranceTable: encFromColumns([10000, 5000, 2000]),
        minScores: { strength: 10, wisdom: 6, constitution: 8 }, maxScores: { dexterity: 13 },
        restrictions: ["Starts at -48,000 XP", "Druidic (shaman) option at Wisdom 15+ not yet on the sheet", PC1_PRIME_NOTE],
        armour: 'none', allowedShields: false,
        allowedArmor: "None",
        allowedWeapons: "None: two massive limbs",
        features: [
            { minLevel: 1, name: "Growing Up", description: "You awaken at -48,000 XP (2 Hit Dice, AC 8), grow through -36,500 (4 HD, AC 6) and -24,000 (6 HD, AC 4), become a normal monster at 0 XP (8 HD, AC 2) and reach 1st level at 48,000 XP. You fight as a monster of your Hit Dice and save as a fighter of your Hit Dice or level, whichever is greater." },
            { minLevel: 1, name: "Limbs", description: "Two attacks a round with your limbs: 1-6, 1-8, 1-10 each while growing, 2-12 each from normal monster on (Strength applies). High Hit Dice treants can hit creatures that normally need magic weapons." },
            { minLevel: 1, name: "Natural Armour", description: "AC 2 (Dexterity applies). You cannot wear armour." },
            { minLevel: 1, name: "Tough Bark", description: "Blunt weapons do you only 1 point of damage (plus magic or Strength bonuses)." },
            { minLevel: 1, name: "Fear of Fire", description: "Fire-based attacks do you 1 extra point of damage per die." },
            { minLevel: 1, name: "Tree Disguise", description: "Standing still in your natural surroundings you look just like a tree: surprise on 1-3 on 1d6." },
            { minLevel: 1, name: "Animate Trees", description: "From normal monster on, animate any two trees within 60' to move and fight as treants (AC 2, HD 8, #AT 2, Dmg 2-12/2-12, MV 30' (10'), Save F8, ML 12)." },
            { minLevel: 1, name: "Magic Items", description: "Any magic item permitted to fighters, if its shape fits (a necklace may serve as a ring...)." },
            { minLevel: 1, name: "Movement", description: "60' (20') carrying up to 2,000 cn; 30' up to 5,000; 15' up to 10,000; more and you cannot move (PC1 Table 18)." },
            { minLevel: 1, name: "Languages", description: "Treant, the local language, Dryad, Elvish, Fairy and your alignment tongue; you can talk with plants and forest animals." },
            { minLevel: 10, name: "Brew Potions", description: "Given time, make common potions (especially healing) from natural forest ingredients, as magic-users do." },
        ],
    },
    "Wood Imp": {
        name: "Wood Imp", source: PC1, hitDie: 4, hpPerLevelAfter9: 2,
        xpTable: WoodImpXP, saves: FighterSaves,
        thac0: monsterThac0Table(WoodImpHD), hitDiceTable: WoodImpHD,
        preStages: [nmStage(1)],
        encumbranceTable: encFromColumns([200, 150, 75, 25]),
        weaponFeatsProgression: { start: 2, gainLevels: standardFeatLevels },
        minScores: { strength: 6, dexterity: 6 }, maxScores: { strength: 16, charisma: 16 },
        restrictions: ["Shaman option at Wisdom 14+ not yet on the sheet", PC1_PRIME_NOTE],
        armour: 'any', allowedShields: true,
        allowedArmor: "Any armour of suitable size",
        allowedWeapons: "Any weapon of suitable size (bows and two-handed swords preferred)",
        features: [
            { minLevel: 1, name: "Normal Monster Stage", description: "You start as a normal monster (0 XP, 1 Hit Die) and reach 1st level at 800 XP. You fight as a monster of your Hit Dice; as a normal monster you save as a normal man, then as a fighter of your level." },
            { minLevel: 1, name: "Forest Ambush", description: "In forests you gain surprise on 1-3 on 1d6." },
            { minLevel: 1, name: "Spider Venom", description: "Non-Lawful wood imps may poison their arrows with giant spider venom." },
            { minLevel: 1, name: "Magic Items", description: "Any magic item permitted to fighters." },
            { minLevel: 1, name: "Lost Fairy Gifts", description: "Wood imps have lost the fairies' invisibility; there is a 1 in 20 chance that you have second sight." },
            { minLevel: 1, name: "Movement", description: "90' (30') carrying up to 25 cn; 60' up to 75; 30' up to 150; 15' up to 200; more and you cannot move (PC1 Table 18). Wood imps often ride huge wood spiders." },
            { minLevel: 1, name: "Languages", description: "Wood Imp, the local language and your alignment tongue; you can speak with arachnids." },
        ],
    },
    "Woodrake": {
        name: "Woodrake", source: PC1, hitDie: 8, hpPerLevelAfter9: 1,
        xpTable: WoodrakeXP, saves: MageSaves, saveLevels: saveLevels(WoodrakeHD, d => 2 * d),
        thac0: monsterThac0Table(WoodrakeHD), hitDiceTable: WoodrakeHD,
        preStages: [
            stage("Drakeling", "Young", -16000, 1, { armourClass: 8, saveLevel: 2, thiefLevel: 0, attacks: { count: 3, note: "drake form: claw/claw/bite 1-2/1-2/1-3" } }),
            stage("Young Drake", "Young", -12000, 2, { armourClass: 6, saveLevel: 4, thiefLevel: 1, attacks: { count: 3, note: "drake form: claw/claw/bite 1-2/1-2/1-4" } }),
            stage("Adolescent Drake", "Young", -8000, 3, { armourClass: 4, saveLevel: 6, thiefLevel: 3, attacks: { count: 3, note: "drake form: claw/claw/bite 1-2/1-2/1-6" } }),
            nmStage(4, { armourClass: 2, saveLevel: 8, thiefLevel: 5 }),
        ],
        naturalArmourClass: 2,
        naturalAttacks: { count: 3, note: "drake form: claw/claw/bite 1-2/1-2/1-8" },
        thiefSkillsAs: WoodrakeThief,
        encumbranceTable: encFromColumns([3000, 2750, 1500, 750, 500]),
        flyingTable: encFromColumns([600, 200]),
        itemUse: WoodrakeItemUse,
        weaponFeatsProgression: { start: 2, gainLevels: standardFeatLevels },
        minScores: { dexterity: 13 },
        restrictions: ["Starts at -16,000 XP", "Natural AC, movement and claws in drake form only", PC1_PRIME_NOTE],
        armour: 'leather', allowedShields: false,
        allowedArmor: "In elf or halfling form, armour permitted to thieves",
        allowedWeapons: "In elf or halfling form, weapons permitted to thieves",
        features: [
            { minLevel: 1, name: "Growing Up", description: "You start at -16,000 XP (1 Hit Die, AC 8), grow through -12,000 (2 HD, AC 6) and -8,000 (3 HD, AC 4), become a normal monster at 0 XP (4 HD, AC 2) and reach 1st level at 16,000 XP. You fight as a monster of your Hit Dice and save as a magic-user of twice your Hit Dice." },
            { minLevel: 1, name: "Shapechange", description: "At will, change among drake, elf and halfling forms. In drake form (a small red dragon) you have AC 2 and three attacks (claw/claw/bite, up to 1-2/1-2/1-8; Strength applies). In elf or halfling form you use thieves' weapons, armour and magic items and the normal encumbrance rules." },
            { minLevel: 1, name: "Thief Skills", description: "No skills in the first stage; then as a 1st-level thief, a 3rd-level thief, and a 5th-level thief as a normal monster. From 1st to 10th level, as a thief of your Hit Dice; after that one thief level per two levels (23rd at 36th level)." },
            itemUseFeature("Magic items permitted to thieves work for you as usual (in elf or halfling form)."),
            { minLevel: 1, name: "Spell Immunity", description: "From normal monster on, twice your level in spell-immune rounds a day (a normal monster counts as 1st level): immune to spells of 4th level or below. Declare them before the round starts." },
            { minLevel: 1, name: "Flight", description: "In drake form: 30' (10') carrying up to 200 cn, 15' up to 600 (PC1 Table 18a). Walking in drake form: 120' (40') up to 500 cn; 90' up to 750; 60' up to 1,500; 30' up to 2,750; 15' up to 3,000." },
            { minLevel: 1, name: "Second Sight", description: "Like all fairies you recognise a fairy's true form, even when it is invisible to mortals or shapechanged." },
            { minLevel: 1, name: "Languages", description: "Fairy, the local language, Elvish, Halfling and your alignment tongue; you can speak with animals." },
            { minLevel: 2, name: "Invisible to Mortals", description: "From 2nd level you may use the fairy invisibility to mortals again; you become visible to anyone you attack." },

        ],
    },
};
Object.assign(ClassesDatabase, PC1WoodlandClasses);

// ---------------------------------------------------------------------------
// PC2 Top Ballista: the other skydwellers (faenare, gremlin, harpy, nagpa, pegataur,
// sphinx, tabi) and the creature spellcasters (shamans and wiccas, pp. 31-32).
// Until 8th level they fight and save as monsters of their Hit Dice; from 8th, by their
// Hit Dice or their level (as a conventional hero), whichever is better (p. 5).
// ---------------------------------------------------------------------------
/** THAC0 by level: monster of its Hit Dice, from 8th level the better of that or a hero of `bab`. */
const pc2Thac0 = (hd: [number, number][], bab: readonly number[]): number[] =>
    hd.map(([d, p], lvl) => lvl === 0 ? 20 : (lvl >= 8 ? Math.min(monsterThac0(d, p), 20 - (bab[lvl] ?? 0)) : monsterThac0(d, p)));
/** Save as a class of level = Hit Dice; from 8th level by Hit Dice or level, whichever is higher. */
const pc2SaveLevels = (hd: [number, number][], mult = 1): number[] =>
    hd.map(([d], lvl) => lvl === 0 ? 1 : Math.max(1, Math.min(36, lvl >= 8 ? Math.max(d * mult, lvl) : d * mult)));
/** Standard encumbrance (RC p. 87) with carrying limits multiplied (PC2 p. 4). */
const scaledEnc = (mult: number, base = 120, extra = 0) =>
    [[400, 120], [800, 90], [1200, 60], [1600, 30], [2400, 15]].map(([max, sp]) => ({ max: Math.round(max! * mult) + extra, speed: Math.round(sp! * base / 120) }));
/** Clerical (or magic-user) table capped at a maximum spellcaster level. */
const capSpells = (table: number[][], max: number): number[][] => table.map((row, lvl) => (table[Math.min(lvl, max)] ?? row).slice());
const PC2_PRIME_NOTE = "XP bonus: +5% if every prime requisite is 13+, +10% if they are and one is 16+";
const firstDieNote = "PC2: a first Hit Die roll below average (5 on a d8) counts as 5";

// Table 3: faenare. Spells as printed in the table (the 2nd-level row is read as 2/2).
const FaenareXP = expandXp([0, 4000, 12000, 28000, 60000, 125000, 250000, 500000, 800000, 1100000], 300000);
const FaenareHD = expandHitDice([[0, 0], [2, 0], [3, 0], [4, 0], [4, 0], [5, 0], [6, 0], [6, 0], [7, 0], [7, 2]], 2);
const FaenareSpells = expandSpells([[2, 1], [2, 2], [2, 2, 1], [3, 2, 2], [3, 3, 2, 1], [3, 3, 2, 2], [4, 4, 3, 2, 1], [4, 4, 3, 3, 2], [4, 4, 4, 3, 2, 1]]);
// Windsingers go past 12th level using the rulebook cleric table (p. 10).
const WindsingerSpells = FaenareSpells.map((row, lvl) => lvl > 12 ? (ClericSpells[lvl] ?? row).slice() : row.slice());
// Table 5: gremlin.
const GremlinXP = expandXp([0, 3000, 9000, 21000, 45000, 95000, 190000, 380000, 680000, 980000], 300000);
const GremlinHD = expandHitDice([[0, 0], [1, 1], [2, 1], [2, 2], [3, 2], [3, 3], [4, 3], [4, 4], [5, 4], [5, 6]], 2);
const gremlinRow = (enemy: string, fumble: string, aura: string, save: string) => [enemy, fumble, aura, save];
const GremlinStats = [[], gremlinRow("+2", "-3", "10'", "+2"), gremlinRow("+1", "-2", "12'", "+2"), gremlinRow("+1", "-2", "14'", "+2"),
    gremlinRow("+1", "-2", "15'", "+3"), gremlinRow("0", "-1", "16'", "+3"), gremlinRow("0", "-1", "17'", "+3"), gremlinRow("0", "-1", "18'", "+3"),
    gremlinRow("-1", "-1", "19'", "+3"), gremlinRow("-1", "0", "20'", "+4")];
// Table 6: harpy.
const HarpyXP = expandXp([0, 6000, 18000, 42000, 90000, 180000, 360000, 660000, 960000, 1260000], 300000);
const HarpyHD = expandHitDice([[0, 0], [4, 0], [4, 0], [5, 0], [6, 0], [7, 0], [7, 0], [8, 0], [9, 0], [9, 2]], 2);
// Table 7: nagpa (maximum Hit Dice at 7th level).
const NagpaXP = expandXp([0, 300000, 600000, 900000, 1200000, 1500000, 1800000, 2100000, 2400000, 2700000], 300000);
const NagpaHD = expandHitDice([[0, 0], [10, 0], [10, 0], [11, 0], [11, 0], [12, 0], [12, 0], [13, 0], [13, 0], [13, 2]], 2);
const NagpaAC = NagpaHD.map((_, lvl) => lvl >= 9 ? 2 : lvl >= 4 ? 3 : 4);
const NagpaSaveBonus = NagpaHD.map((_, lvl) => lvl >= 9 ? 4 : lvl >= 3 ? 3 : 2);
// Table 8: pegataur, with its own saving throws (death, wands, paralysis, breath, spells).
const PegataurXP = expandXp([0, 10000, 60000, 140000, 300000, 600000, 900000, 1200000, 1500000, 1800000], 300000);
const PegataurHD = expandHitDice([[0, 0], [5, 0], [6, 0], [7, 0], [7, 0], [8, 0], [9, 0], [9, 0], [10, 0], [10, 2]], 2);
const pegSaveRows: number[][] = [[], [10, 11, 12, 13, 14], [8, 9, 10, 11, 12], [8, 9, 10, 11, 11], [8, 9, 10, 11, 11], [6, 7, 8, 9, 10],
    [4, 7, 7, 7, 7], [4, 7, 7, 7, 7], [4, 7, 7, 7, 7], [2, 4, 4, 4, 3]];
const PegataurSaves = Array.from({ length: 37 }, (_, lvl) => lvl === 0 ? [] : pegSaveRows[Math.min(lvl, 9)]!.slice());
// Table 9: sphinx.
const SphinxXP = expandXp([0, 300000, 600000, 900000], 300000);
const SphinxHD = expandHitDice([[0, 0], [13, 0], [14, 0], [14, 2]], 2);
const roar = (z1: string, z2: string, z3: string, dmg: string, mod: string, stun: string, fear: string) => [`${z1} / ${z2} / ${z3}`, dmg, mod, stun, fear];
const SphinxRoar = [[], roar("13'", "65'", "130'", "6d6", "-4", "1d6 rounds", "1d6 turns"), roar("14'", "70'", "140'", "7d6", "-4", "1d6 rounds", "1d6 turns"),
    roar("15'", "75'", "150'", "7d6", "-4", "1d8 rounds", "1d8 turns")];
// Table 10: tabi. Spells usable from levels 1-3 and 4-6 (any mix within each band).
const TabiXP = expandXp([0, 32000, 100000, 300000, 600000, 900000, 1200000, 1500000, 1800000, 2100000], 300000);
const TabiHD = expandHitDice([[0, 0], [5, 0], [6, 0], [6, 0], [7, 0], [7, 0], [8, 0], [8, 0], [9, 0], [9, 2]], 2);
const tabiPools: [number, number][] = [[0, 0], [1, 0], [2, 0], [3, 0], [4, 0], [4, 1], [4, 2], [4, 3], [4, 4]];
const TabiSpells = Array.from({ length: 37 }, (_, lvl) => {
    if (lvl === 0) return [];
    const [a, b] = tabiPools[Math.min(lvl, 8)]!;
    return b ? [a, a, a, b, b, b] : [a, a, a];
});
const tabiThief: number[][] = [[], [45, 50, 50], [50, 60, 60], [55, 70, 70], [60, 75, 75], [65, 80, 80], [70, 82, 82], [75, 84, 84], [80, 86, 86], [82, 88, 88]];
const TabiThief = Array.from({ length: 37 }, (_, lvl) => lvl === 0 ? [] : (lvl <= 9 ? tabiThief[lvl]! : tabiThief[9]!.map(v => Math.min(100, v + 2 * (lvl - 9)))));
const GremlinHide = Array.from({ length: 37 }, (_, lvl) => lvl === 0 ? [] : [Math.min(95, 35 + 5 * lvl)]);

const featureList = (rows: [number, string, string][]): ClassFeature[] => rows.map(([minLevel, name, description]) => ({ minLevel, name, description }));

const PC2SkydwellerClasses: Record<string, ClassData> = {
    "Faenare": {
        name: "Faenare", source: PC2, hitDie: 8, hpPerLevelAfter9: 2, firstHitDieAverage: true,
        xpTable: FaenareXP, saves: ElfSaves, saveLevels: pc2SaveLevels(FaenareHD),
        thac0: pc2Thac0(FaenareHD, ElfAttackBonus), hitDiceTable: FaenareHD,
        preStages: [
            stage("Young Faenare", "Young", -4000, 1, { armourClass: 7, saveLevel: 1 }),
            stage("Teen Faenare", "Teen", -2000, 1, { armourClass: 7, saveLevel: 1, spells: [1] }),
            nmStage(2, { armourClass: 6, saveLevel: 2, spells: [2] }),
        ],
        naturalArmourClass: 6, naturalArmourByLevel: FaenareHD.map((_, lvl) => lvl >= 3 ? 5 : 6),
        flyingTable: scaledEnc(1, 360, 100),
        casterType: 'divine', spellProgression: FaenareSpells,
        spellNames: 'shaman', subClassSpells: { Windsinger: ['druid', 'windsong'] },
        weaponFeatsProgression: { start: 2, gainLevels: standardFeatLevels },
        minScores: { intelligence: 5, wisdom: 7, dexterity: 6, charisma: 7 }, maxScores: { strength: 17 },
        restrictions: ["Starts at -4,000 XP", "Wisdom 13+ to rise past normal monster", "12th level at most unless a windsinger", PC2_PRIME_NOTE],
        armour: 'none', allowedShields: true,
        allowedArmor: "No armour (if one insists: movement halved and Dexterity -2 for leather or chain, -4 for others); shields and protective magic are fine",
        allowedWeapons: "Sling (+1 to hit), short bow, short sword, normal sword, dagger, knife, bola; huge or coarse weapons are avoided",
        features: featureList([
            [1, "Growing Up", "You start as a young faenare at -4,000 XP (1 Hit Die, AC 7), become a teen at -2,000 and a normal monster at 0 XP (2 Hit Dice, AC 6), and reach 1st level at 4,000 XP. AC 5 from 3rd level. Until 8th level you fight and save (as an elf) by your Hit Dice; from 8th, by Hit Dice or level, whichever is better."],
            [1, "Flight", "Fly at 360' (120'). In flight you carry 100 cn more than normal before you slow down. Your winged hands can only grip small, light things in flight, but your feet can fight, use weapons and even fire bows."],
            [1, "Bird Kin", "Immune to the charm of harpy song. No natural bird (eagles and rocs included) will attack you, even if magically controlled. Speak with birds at will, in birdsong."],
            [1, "Alert", "Surprised only on a 1 in 12. +4 to saves against air-based spells and attacks."],
            [1, "Shaman", "All faenare are shamans (no XP cost): you cast the shaman's clerical spells (RC p. 216) from Table 3, beginning as a teen. A windsinger (Wisdom 15+, a double Singing skill slot) also has druid spells and the windsongs."],
            [1, "Protection from Lightning", "From the teen stage you are permanently protected from lightning, as the 4th-level druid spell."],
            [1, "Group Bless", "From normal monster on, once a day five or more faenare singing together for a round can bless themselves (ends if any of them moves more than 100' from the others)."],
            [1, "Morale", "9 alone, 11 with the clan, 12 in the nest."],
            [1, "Languages", "Cloud Giant, Elven, Fairy, Giant Eagle, Harpy, Giant Roc and your alignment tongue; you can speak with birds."],
            [7, "Summon Eagles", "Once a day, by a round of song, call 2-8 eagles or 1-4 giant eagles from within a mile. They help you (not suicidally) and expect a reward, usually food."],
        ]),
    },
    "Windsinger": {
        name: "Windsinger", source: PC2, optionOf: "Faenare", sharesMainLevel: true,
        hitDie: 8, hpPerLevelAfter9: 2, xpTable: FaenareXP, saves: ElfSaves,
        thac0: pc2Thac0(FaenareHD, ElfAttackBonus), mainSpellProgression: WindsingerSpells,
        minScores: { wisdom: 15 },
        restrictions: ["Needs a double skill slot in Singing", "Neutral"],
        features: featureList([
            [1, "Windsongs", "Songs are learned and memorised like spells and take a spell slot of their level; each takes two rounds to sing and is lost if you are interrupted. Songs of 6th level and below come automatically with your spellcaster level; 7th-level songs must be found at sacred places. You also have the druid spells."],
            [1, "No Level Limit", "At 12th level an avatar of your Immortal awakens the songs within you: rituals to rise further fail only on a natural 20 Wisdom check (and then for good). Above 12th level, spells follow the rulebook cleric table."],
            [17, "Mastersinger", "No more Wisdom checks to rise in level; Charisma 18 to other faenare. The 7th-level spells holy word, survival and travel become available."],
        ]),
    },
    "Gremlin": {
        name: "Gremlin", source: PC2, hitDie: 8, hpPerLevelAfter9: 2, firstHitDieAverage: true,
        xpTable: GremlinXP, saves: ElfSaves, saveLevels: pc2SaveLevels(GremlinHD),
        thac0: pc2Thac0(GremlinHD, ElfAttackBonus), hitDiceTable: GremlinHD,
        preStages: [
            stage("Young Gremlin", "Young", -3000, 1, { saveLevel: 1, stats: gremlinRow("+3", "-4", "5'", "+1"), thiefSkills: [25] }),
            nmStage(1, { saveLevel: 1, stats: gremlinRow("+2", "-3", "8'", "+1"), thiefSkills: [35] }),
        ],
        naturalArmourClass: 7,
        encumbranceTable: scaledEnc(1 / 3),
        levelStats: { name: "Aura & Defences", columns: ["Enemy saves", "Foe fumbles", "Aura radius", "Save vs. mind & illusion"], levels: GremlinStats },
        thiefSkillTable: { names: ["Hide in Crannies"], levels: GremlinHide },
        weaponFeatsProgression: { start: 2, gainLevels: standardFeatLevels },
        minScores: { dexterity: 6 }, maxScores: { strength: 13, constitution: 16 },
        restrictions: ["Starts at -3,000 XP", "Cannot become a shaman or wicca", "Strength is relative to its size; carries a third of normal", PC2_PRIME_NOTE],
        armour: 'none', allowedShields: false,
        allowedArmor: "None (no armour fits, and gremlins would rather take it apart)",
        allowedWeapons: "Nothing bigger than a dagger (1-3 damage); only slings and tiny daggers as missiles",
        features: featureList([
            [1, "Growing Up", "You start as a young gremlin at -3,000 XP (1 Hit Die), become a normal monster at 0 XP and reach 1st level at 3,000 XP. Until 8th level you fight and save (as an elf) by your Hit Dice; from 8th, by Hit Dice or level, whichever is better."],
            [1, "Chaotic Aura", "Murphy's Law: within your aura anything that can go wrong will (victims save vs. spells, with the Enemy Saves modifier). Pick an outcome and the DM sets the chance: easy 95%, simple 75%, tricky 50%, difficult 30%, very difficult 10% (+5% per helping gremlin, up to +20%). One round per try, one try per task. A foe who misses you rolls again against himself, adding the Foe Fumbles modifier. Spells cast at you within the aura need a save or they rebound on the caster (or help the gremlins)."],
            [1, "Hide in Crannies", "Hide in nooks, crannies and behind machinery like a thief hiding in shadows; at half that chance you are effectively invisible to anyone not looking your way. +5% a level after 9th, to 95%."],
            [1, "Tumbling and Jumping", "Ignore the first 10' of any fall. Leap 8' (12' with a 10' run) and 5' up (7' with a run)."],
            [1, "Resistant Mind", "The 'Save vs. mind & illusion' bonus applies to saves against mind control (charm, feeblemind, magic jar...) and illusions."],
            [1, "Magic Trouble", "Magic items fail or misbehave for you: a 10% chance per level (10% at least, and always at least a 10% chance they work). Check again each level; items work again 2d4 days after you drop them. Permanent items without charges (weapons, armour, rings, cloaks, boots) are not affected."],
            [1, "Languages", "Fairy, Gnome, Leprechaun, the local language and your alignment tongue."],
            [1, "Bigger Tumbles", "From 1st level you ignore the first 20' of a fall."],
            [2, "Bigger Jumps", "Leap 12' (15' with a run) and 6' up (9' with a run)."],
            [3, "Leg Whip", "Twice a day: range twice your aura radius, one creature saves vs. spells (big strong ones at +2) or its legs are bound for 2d4 rounds; it can only hop at 1/5 speed, and if it was running it must make a Dexterity check or fall (1-3 damage)."],
            [6, "Side-Splitter", "Twice a day: one creature within your aura that can see you saves vs. spells at -2 or drops what it holds and falls over laughing; a new save each round, then a round to recover and another to pick things up. No spellcasting until recovered."],
            [9, "Confusion", "Once a day, as the 4th-level magic-user spell."],
        ]),
    },
    "Harpy": {
        name: "Harpy", source: PC2, hitDie: 8, hpPerLevelAfter9: 2, firstHitDieAverage: true,
        xpTable: HarpyXP, saves: FighterSaves, saveLevels: pc2SaveLevels(HarpyHD),
        thac0: pc2Thac0(HarpyHD, FighterAttackBonus), hitDiceTable: HarpyHD,
        preStages: [
            stage("Young Harpy", "Young", -6000, 1, { saveLevel: 1, attacks: { count: 2, note: "claws 1-2/1-2, or a weapon in the talons" } }),
            stage("Teen Harpy", "Teen", -3000, 2, { saveLevel: 2, attacks: { count: 2, note: "claws 1-3/1-3, or a weapon in the talons" } }),
            nmStage(3, { saveLevel: 3 }),
        ],
        naturalArmourClass: 7,
        naturalAttacks: { count: 2, note: "claws 1-4/1-4, or a weapon in the talons (club 1-6); bite 1-6 only at helpless foes" },
        flyingTable: scaledEnc(1, 150),
        weaponFeatsProgression: { start: 2, gainLevels: standardFeatLevels },
        maxScores: { intelligence: 16 },
        restrictions: ["Starts at -6,000 XP", PC2_PRIME_NOTE],
        armour: 'none', allowedShields: false,
        allowedArmor: "None (protective magic items are fine)",
        allowedWeapons: "Melee weapons held in the talons; no missile weapons",
        features: featureList([
            [1, "Growing Up", "You start as a young harpy at -6,000 XP (1 Hit Die), become a teen at -3,000 (2 HD) and a normal monster at 0 XP (3 HD), and reach 1st level at 6,000 XP. Until 8th level you fight and save (as a fighter) by your Hit Dice; from 8th, by Hit Dice or level, whichever is better."],
            [1, "Flight", "Fly at 150' (50'). Flying time each day: a third of your Constitution in hours with 1 HD, half with 2 HD, your Constitution with 3+ HD (14 hours at most)."],
            [1, "Charming Song", "Charm person by song at will; victims save at +2 while you are young, +1 as a teen and normally from normal monster on. You can hold only one charmed victim at a time: a new charm frees the old one."],
            [1, "Claws", "Claws 1-2/1-2 while young, 1-3/1-3 as a teen, 1-4/1-4 from normal monster on; or a weapon held in the talons. You may bite helpless foes for 1-6 (not with other attacks)."],
            [1, "Languages", "Giant Eagle and your alignment tongue; 30% chance of the local language and 30% of Faenare."],
            [2, "Charming Touch", "Once a day, charm person by touch (a hit roll, no damage; save at -2). It lasts longer than song charm (one extra week between checks) and counts as two levels higher against dispel magic."],
            [4, "Charming Touch (3/day)", "Charm person by touch three times a day."],
            [5, "Charm Monster", "Once a day, charm monster by touch (hit roll; save at -2)."],
            [7, "Charm Monster (3/day)", "Charm monster by touch three times a day."],
        ]),
    },
    "Nagpa": {
        name: "Nagpa", source: PC2, hitDie: 8, hpPerLevelAfter9: 2, firstHitDieAverage: true,
        xpTable: NagpaXP, saves: MageSaves, saveLevels: pc2SaveLevels(NagpaHD), saveBonus: NagpaSaveBonus,
        thac0: pc2Thac0(NagpaHD, MageAttackBonus), hitDiceTable: NagpaHD,
        preStages: [
            stage("Young Nagpa", "Young", -1100000, 2, { armourClass: 7, saveLevel: 2, saveBonus: 0 }),
            stage("Nagpa (4 HD)", "Young", -1000000, 4, { armourClass: 7, saveLevel: 4, saveBonus: 1 }),
            stage("Nagpa (6 HD)", "Young", -800000, 6, { armourClass: 6, saveLevel: 6, saveBonus: 1 }),
            stage("Nagpa (7 HD)", "Young", -600000, 7, { armourClass: 6, saveLevel: 7, saveBonus: 1 }),
            stage("Nagpa (8 HD)", "Young", -300000, 8, { armourClass: 5, saveLevel: 8, saveBonus: 1 }),
            nmStage(9, { armourClass: 4, saveLevel: 9, saveBonus: 2 }),
        ],
        naturalArmourClass: 4, naturalArmourByLevel: NagpaAC,
        weaponFeatsProgression: { start: 2, gainLevels: standardFeatLevels },
        minScores: { intelligence: 9, wisdom: 7 }, maxScores: { strength: 16, dexterity: 16, constitution: 17, charisma: 16 },
        restrictions: ["Starts at -1,100,000 XP", "Cannot become a shaman or wicca", "Usually Chaotic", PC2_PRIME_NOTE],
        armour: 'none', allowedShields: false,
        allowedArmor: "No armour or shields (protective magic such as a cloak of protection is fine)",
        allowedWeapons: "Small one-handed weapons (short sword...), staff, crossbows, sling; bows at -2 to hit",
        features: featureList([
            [1, "Growing Up", "You start at -1,100,000 XP (2 Hit Dice, AC 7) and grow through -1,000,000, -800,000, -600,000 and -300,000 to a normal monster at 0 XP (9 HD, AC 4); 1st level comes at 300,000 XP. AC 3 from 4th level, AC 2 at 9th. Until 8th level you fight and save (as a magic-user) by your Hit Dice; from 8th, by Hit Dice or level. Your magical nature adds the bonus shown to every saving throw."],
            [1, "Darkness, Paralysis, Create Flames", "Each once a day from the start: darkness (reversed light); paralysis (every Lawful creature within 10' saves vs. spells or is paralysed 1d4 rounds); create flames (an object within 60' burns 1-3 rounds; if carried, 2d6 a round, save for half). Three times a day each from -1,000,000 (darkness), -800,000 (paralysis) and -600,000 XP (create flames)."],
            [1, "Phantasmal Force", "From -600,000 XP, three times a day, as the 2nd-level spell."],
            [1, "Corruption", "From -300,000 XP, three times a day (Chaotic nagpa only): one non-living object within 60' (a yard cube at most) rots to uselessness; magic items save vs. spells at their owner's level."],
            [1, "Kariwa", "Spend half an hour each afternoon in reverie. Miss it and at dawn save vs. spells or sleep 1d4 hours; each further day without it, the save is 2 worse and the sleep an hour longer, with a 5% (cumulative) daily chance of some insanity."],
            [1, "Scholar", "Start with six skills, at least three of them Knowledge skills; gain a Knowledge skill and may learn a new language (preferably arcane) each level above normal monster."],
            [1, "Hideous", "Other races react badly to your looks whatever your Charisma; it takes time to overcome first impressions."],
            [1, "Languages", "The local language, your alignment tongue and arcane languages."],
            [2, "Polymorph Self", "Once a day, for an hour per level, into a humanoid (human, elf, dwarf, halfling, orc...)."],
            [4, "Anti-Magic", "5% anti-magic (yourself only): 10% at 6th, 15% at 7th, 20% at 8th level."],
            [5, "Animate Dead", "Once a day, one skeleton or zombie per level; you can control no more than that at once."],
            [9, "Homunculus or Tabi", "Summon a homunculus or tabi servant, once you find the rare summoning ritual and components. If it dies you lose 1d4+1 hp for good."],
        ]),
    },
    "Pegataur": {
        name: "Pegataur", source: PC2, hitDie: 8, hpPerLevelAfter9: 2, firstHitDieAverage: true,
        xpTable: PegataurXP, saves: FighterSaves, savesByLevel: PegataurSaves,
        thac0: pc2Thac0(PegataurHD, FighterAttackBonus), hitDiceTable: PegataurHD,
        preStages: [
            stage("Foal", "Young", -20000, 2, { saves: [12, 13, 13, 15, 15] }),
            stage("Yearling", "Young", -15000, 3, { saves: [12, 13, 13, 15, 15] }),
            stage("Young Pegataur", "Young", -10000, 4, { saves: [12, 13, 13, 15, 15] }),
            nmStage(5, { saves: [10, 11, 12, 13, 14] }),
        ],
        naturalArmourClass: 6,
        encumbranceTable: scaledEnc(2),
        flyingTable: scaledEnc(2, 360),
        casterType: 'arcane', spellProgression: MageSpells,
        smashParryLevel: 10, multipleAttacks: [[10, 2], [17, 3]],
        weaponFeatsProgression: { start: 4, gainLevels: martialFeatLevels },
        minScores: { strength: 9, constitution: 8 },
        restrictions: ["Starts at -20,000 XP", "Strength is relative to its size; carries twice normal", PC2_PRIME_NOTE],
        armour: 'any', allowedShields: true,
        allowedArmor: "Pegataur barding (and large shields over the forequarters with a one-handed weapon)",
        allowedWeapons: "Any weapons (lance, long bow, two-handed sword and mace favoured; basic mastery in these at the start)",
        features: featureList([
            [1, "Growing Up", "You start at -20,000 XP (2 Hit Dice) and grow through -15,000 and -10,000 to a normal monster at 0 XP (5 HD); 1st level comes at 10,000 XP. You save with Table 8 and fight as a monster of your Hit Dice until 8th level, then by Hit Dice or as a fighter of your level."],
            [1, "Flight", "Fly at 360' (120')."],
            [1, "Elf Spells", "Unless you become a wicca, you gain magic-user spells as an elf of your level, from 1st level."],
            [1, "Barding", "AC 6 is your natural AC: barding helps only if better. Barding by an expert armourer counts as 2 better (non-magical)."],
            [1, "Jousting", "Pegataur jousts: each rolls 1d10 + Strength and Dexterity bonuses + Hit Dice (15 at most); highest wins."],
            [1, "Languages", "Centaur, Giant Eagle, Pegasus, Giant Roc and your alignment tongue; 50% chance each of Fairy and Elven."],
            [10, "Attack Ranks", "From 10th level you climb the elf attack ranks (rank C at 10th, D at 11th...), gaining fighter combat options and elven special defences."],
        ]),
    },
    "Sphinx (Female)": {
        name: "Sphinx (Female)", source: PC2, hitDie: 8, hpPerLevelAfter9: 2, firstHitDieAverage: true,
        xpTable: SphinxXP, saves: FighterSaves, saveLevels: SphinxHD.map(([d], lvl) => lvl === 0 ? 1 : Math.min(36, 2 * d)),
        thac0: pc2Thac0(SphinxHD, FighterAttackBonus), hitDiceTable: SphinxHD,
        preStages: [],
        naturalArmourClass: 0, naturalArmourByLevel: SphinxHD.map((_, lvl) => lvl >= 2 ? -1 : 0),
        naturalAttacks: { count: 3, note: "claw/claw/bite 3d6/3d6/2d10" },
        encumbranceTable: scaledEnc(3),
        flyingTable: scaledEnc(3, 360),
        levelStats: { name: "Roar (twice a day)", columns: ["Radius Z1 / Z2 / Z3", "Damage (Z1)", "Save mod.", "Stun (Z1-Z2)", "Fear (Z1-Z3)"], levels: SphinxRoar },
        casterType: 'divine', spellProgression: capSpells(ClericSpells, 12),
        minScores: { strength: 6, intelligence: 6, wisdom: 8, constitution: 8 },
        restrictions: ["Starts at -3,000,000 XP", "Strength is relative to its size; carries three times normal", PC2_PRIME_NOTE],
        armour: 'none', allowedShields: false,
        allowedArmor: "None (barding only if the DM allows, at 100 times the cost)",
        allowedWeapons: "None: claws and bite",
        features: [],
    },
    "Tabi": {
        name: "Tabi", source: PC2, hitDie: 8, hpPerLevelAfter9: 2, firstHitDieAverage: true,
        xpTable: TabiXP, saves: MageSaves, saveLevels: pc2SaveLevels(TabiHD),
        thac0: pc2Thac0(TabiHD, MageAttackBonus), hitDiceTable: TabiHD,
        preStages: [
            stage("Young Tabi", "Young", -32000, 2, { saveLevel: 2, thiefSkills: [25, 15, 15] }),
            stage("Tabi (3 HD)", "Young", -24000, 3, { saveLevel: 3, thiefSkills: [30, 20, 20] }),
            stage("Tabi (4 HD)", "Young", -16000, 4, { saveLevel: 4, thiefSkills: [35, 30, 30] }),
            nmStage(5, { saveLevel: 5, thiefSkills: [40, 40, 40] }),
        ],
        naturalArmourClass: 7,
        naturalAttacks: { count: 2, note: "claws 1-4/1-4 + venom (save vs. poison or attack the nearest creature for 2d6 turns)" },
        encumbranceTable: scaledEnc(1 / 3),
        flyingTable: scaledEnc(1 / 3, 240),
        thiefSkillTable: { names: ["Pick Pockets", "Move Silently", "Hide in Shadows"], levels: TabiThief },
        casterType: 'arcane', spellProgression: TabiSpells, slotPools: [[1, 3], [4, 6]],
        spellNames: 'tabi',
        minScores: { intelligence: 6, dexterity: 6 }, maxScores: { strength: 17, wisdom: 16 },
        restrictions: ["Starts at -32,000 XP", "Cannot become a shaman or wicca", "Strength is relative to its size; carries a third of normal", PC2_PRIME_NOTE],
        armour: 'none', allowedShields: false,
        allowedArmor: "None (protective magic that fits, such as rings, is fine)",
        allowedWeapons: "None: venomous claws",
        features: featureList([
            [1, "Growing Up", "You start at -32,000 XP (2 Hit Dice) and grow through -24,000 and -16,000 to a normal monster at 0 XP (5 HD); 1st level comes at 32,000 XP. Until 8th level you fight and save (as a magic-user) by your Hit Dice; from 8th, by Hit Dice or level."],
            [1, "Flight", "Fly at 240' (80')."],
            [1, "Venomous Claws", "Claws 1-4/1-4; a creature struck saves vs. poison or believes everyone around is hostile and attacks the nearest, for 2d6 turns or until neutralize poison (no spells or wands meanwhile). Like a sphinx, you can hit creatures that need magic weapons: +1 at 4-7 HD, +2 at 8-11 HD..."],
            [1, "Thief Skills", "Pick pockets, move silently and hide in shadows (also in familiar jungle or woodland). A tabi's smell makes them much harder."],
            [1, "Rotting Smell", "At will, a 100' radius stench that spreads and fades at 10' a round."],
            [1, "Tabi Spells", "From 1st level, a number of spells you may choose from levels 1-3, and from 5th level from levels 4-6, from the tabi list. You need a spellbook to learn them but not to re-memorise them. At most 4 + 4 (8th level)."],
            [1, "Languages", "Gnome, Phanaton, the local language and your alignment tongue."],
            [1, "Speak with Apes", "From normal monster on, speak with any natural ape or monkey."],
            [1, "Brave", "+1 to saves against fear from 1st level; +2 at 4th, +3 at 5th, +4 at 7th."],
            [3, "Rotting Blight", "Your rotting smell acts as a blight spell on all non-tabi in its radius (undead, nagpa and creatures without a sense of smell are immune)."],
            [3, "Knowledge Skills", "A Knowledge skill (usually historical) every two levels above 1st."],
            [8, "Lore", "Once a week, the 7th-level magic-user spell lore, on whatever intrigues you."],
        ]),
    },
};
// Sphinx (Male) is the female's twin with magic-user spells.
const sphinxFeatures = (female: boolean): ClassFeature[] => featureList([
    [1, "Growing Up", "You start at -3,000,000 XP (2 Hit Dice, AC 5) and grow through ten stages, gaining a Hit Die each 300,000 XP, to a normal monster at 0 XP (12 HD, AC 0); 1st level comes at 300,000 XP (13 HD), AC -1 from 2nd. You save as a fighter of twice your Hit Dice and fight as a monster of your Hit Dice."],
    [1, "Claws and Bite", "Claw/claw/bite growing from 1d2/1d2/1d6 to 3d6/3d6/2d8 at normal monster, 2d10 bite at 1st and 2d12 at 3rd. For each 4 HD you can hit creatures needing one more 'plus' of magic weapon (+1 at 4-7 HD, +2 at 8-11...)."],
    [1, "Flight", "Fly at 360' (120')."],
    [1, "Roar", "Twice a day. Everyone in range is affected, friends too. Zone 3: save vs. spells or flee in fear. Zone 2: also save vs. paralysis or be stunned. Zone 1: also deafened 1d10 turns (save for 1d4) and roar damage, with no save. The save modifier applies to all these saves. Your current figures are in the Roar card."],
    [1, "Speak with Animals", "From -2,400,000 XP, at will with desert creatures or those within three miles of your home."],
    [1, "Spell Resistance", "+4 to saves against 1st-level spells from -1,800,000 XP, against 2nd-level from -1,200,000 and 3rd-level from normal monster on. (Optional full immunity costs 100,000 / 150,000 / 200,000 XP more.) It works on helpful spells too."],
    [1, "Magic Hide", "From -600,000 XP only magic weapons, or monsters of 4+ HD, can harm you."],
    [1, female ? "Cleric Spells" : "Magic-User Spells", `From 1st level you cast ${female ? "the full clerical list" : "any magic-user spell"} as a ${female ? "cleric" : "magic-user"} of your level, up to 12th-level ability, with no ritual or study needed. You may use magic items for ${female ? "clerics" : "magic-users"} that you can physically use.`],
    [1, "Riddles", "Obsessed with riddles and puzzles; many sphinxes collect rare and obscure things."],
    [1, "Languages", "The local language, 1d3 languages of neighbouring countries and your alignment tongue."],
]);
const sphinxStages = (): Stage[] => {
    const dmg = ["1d2/1d2/1d6", "1d4/1d4/1d8", "1d4/1d4/1d8", "1d6/1d6/1d8", "1d6/1d6/1d8", "2d6/2d6/1d8", "2d6/2d6/1d8", "3d6/3d6/1d8", "3d6/3d6/1d8", "3d6/3d6/2d8"];
    const ac = [5, 5, 4, 4, 3, 3, 2, 2, 1, 1];
    const roars = [roar("2'", "10'", "20'", "1d6", "0", "1 round", "1d4 rounds"), roar("3'", "15'", "30'", "2d6", "-1", "1 round", "1d6 rounds"),
        roar("4'", "20'", "40'", "2d6", "-1", "1 round", "1d8 rounds"), roar("—", "25'", "50'", "3d6", "-1", "1d2 rounds", "1d10 rounds"),
        roar("5'", "30'", "60'", "3d6", "-2", "1d2 rounds", "2d10 rounds"), roar("6'", "35'", "70'", "3d6", "-2", "1d3 rounds", "3d10 rounds"),
        roar("8'", "40'", "80'", "4d6", "-2", "1d3 rounds", "1d3 turns"), roar("9'", "45'", "90'", "4d6", "-3", "1d4 rounds", "1d3 turns"),
        roar("10'", "50'", "100'", "5d6", "-3", "1d4 rounds", "1d4 turns"), roar("11'", "55'", "110'", "5d6", "-3", "1d4 rounds", "1d4 turns")];
    const out: Stage[] = dmg.map((d, i) => stage(i === 0 ? "Sphinx Cub" : `Young Sphinx (${i + 2} HD)`, "Young", -3000000 + 300000 * i, i + 2,
        { armourClass: ac[i] ?? 5, saveLevel: 2 * (i + 2), attacks: { count: 3, note: `claw/claw/bite ${d}` }, stats: roars[i] ?? [] }));
    out.push(nmStage(12, { armourClass: 0, saveLevel: 24, attacks: { count: 3, note: "claw/claw/bite 3d6/3d6/2d8" }, stats: roar("12'", "60'", "120'", "6d6", "-4", "1d6 rounds", "1d6 turns") }));
    return out;
};
const sphinxF = PC2SkydwellerClasses["Sphinx (Female)"]!;
sphinxF.preStages = sphinxStages();
sphinxF.features = sphinxFeatures(true);
sphinxF.naturalAttacksByLevel = SphinxHD.map((_, lvl) => ({ count: 3, note: `claw/claw/bite 3d6/3d6/${lvl >= 3 ? "2d12" : "2d10"}` }));
PC2SkydwellerClasses["Sphinx (Male)"] = { ...sphinxF, name: "Sphinx (Male)", casterType: 'arcane', spellProgression: capSpells(MageSpells, 12), features: sphinxFeatures(false) };

// Creature spellcasters (pp. 31-32): shamans (restricted clerical list; pegataurs also druid
// spells) and wiccas (restricted magic-user list), with their own XP track on top of the race's.
const CreatureCasterXP = expandXp([0, 0, 2000, 4000, 8000, 16000, 32000, 64000, 130000, 260000, 460000], 200000);
const creatureCaster = (race: string, kind: 'Shaman' | 'Wicca', max: number, min: number, extra: Partial<ClassData> = {}): ClassData => {
    const base = ClassesDatabase[race] ?? PC2SkydwellerClasses[race]!;
    const shaman = kind === 'Shaman';
    return {
        name: `${race} ${kind}`, source: PC2 + " (pp. 31-32)", optionOf: race, ownXpTrack: true,
        hitDie: base.hitDie, hpPerLevelAfter9: base.hpPerLevelAfter9 ?? 2, thac0: base.thac0, saves: base.saves,
        xpTable: CreatureCasterXP, spellsFromXp: 1000,
        spellsNote: `${kind} spells begin after the initiation ritual, at 1,000 ${kind.toLowerCase()} XP (${shaman ? 'a Wisdom' : 'an Intelligence'} check, -2 with a tutor; three failures and you can never become a spellcaster).`,
        casterType: shaman ? 'divine' : 'arcane', spellProgression: capSpells(shaman ? ClericSpells : MageSpells, max),
        spellNames: shaman ? 'shaman' : 'wicca',
        minScores: shaman ? { wisdom: min } : { intelligence: min },
        restrictions: [`${max}th spellcaster level at most`, "A shaman cannot also be a wicca"],
        features: featureList([
            [1, `${race} ${kind}`, `Your ${kind.toLowerCase()} level has its own XP bar (Table 12: 1,000 XP for 1st, 2,000 for 2nd, 4,000 for 3rd... then +200,000 a level): to rise, earn the next race level's XP and the next ${kind.toLowerCase()} level's XP. ${shaman ? 'A 1st-level shaman has no spells yet (still on trial).' : ''} Maximum level ${max}; going beyond needs a daunting ritual and a check at +2, failure costing the XP.`],
            [1, "Spell List", shaman ? "Shamans pray for a restricted clerical list (RC p. 216) and cannot turn undead; they may use any clerical magic item." : "Wiccas learn a restricted magic-user list (RC p. 216) from spellbooks; they may use any magic-user item."],
            [1, "Optional Saves", `You may use the saving throws of a ${shaman ? 'cleric' : 'magic-user'} of your ${kind.toLowerCase()} level where they are better, category by category.`],
            [1, "More Spells", "Other rulebook spells can be learned by a day's ritual or study per spell level and 1,000 gp per spell level: chance ((Wisdom + spellcaster level) x 2) - (3 x spell level)%; new spells take twice as long and cost twice as much, with 5 x spell level."],
        ]),
        ...extra,
    };
};
Object.assign(ClassesDatabase, PC2SkydwellerClasses);
const PC2CasterOptions: ClassData[] = [
    creatureCaster("Gnome", "Shaman", 12, 14), creatureCaster("Gnome", "Wicca", 12, 13),
    creatureCaster("Skygnome", "Shaman", 12, 14), creatureCaster("Skygnome", "Wicca", 12, 13),
    creatureCaster("Harpy", "Shaman", 6, 15), creatureCaster("Harpy", "Wicca", 4, 15),
    creatureCaster("Pegataur", "Shaman", 8, 15, { spellNames: 'shaman_druid' }),
    creatureCaster("Pegataur", "Wicca", 8, 15, { replacesMainSpells: true }),
];
PC2CasterOptions.forEach(o => { ClassesDatabase[o.name] = o; });
// Gnomes and skygnomes (above) are PC2 creatures too: the first Hit Die rule and the spellcaster options.
["Gnome", "Skygnome"].forEach(n => {
    const g = ClassesDatabase[n];
    if (!g) return;
    g.firstHitDieAverage = true;
    g.restrictions = (g.restrictions || []).filter(r => !/^Shaman or wicca/.test(r))
        .concat(["Shaman (Wisdom 14+) or wicca (Intelligence 13+) up to 12th level: choose it as the sub-class"]);
});
