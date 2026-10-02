// src/types.ts
export interface CasterProfile {
    type: 'arcane' | 'divine' | null;
    effectiveLevel: number;
    slots: number[]; // Например, [2, 1] значит 2 спелла 1-го круга и 1 спелл 2-го круга
}

export interface SpellDefinition {
    id: string;
    name: string;
    level: number;
    casterType: 'arcane' | 'divine' | 'domain';
    deity?: string;
    range?: string;
    duration?: string;
    effect?: string;
    description: string;
    isCustom: boolean;
}

export interface SpellbookData {
    knownSpellIds: string[]; 
    customSpells: SpellDefinition[];
    preparedSpells?: { [spellId: string]: number }; // Ключ: spellId, Значение: количество подготовок
}

export interface AbilityScore {
    score: number;
    modifier: number;
}

export interface Abilities {
    strength: AbilityScore;
    intelligence: AbilityScore;
    wisdom: AbilityScore;
    dexterity: AbilityScore;
    constitution: AbilityScore;
    charisma: AbilityScore;
}

export interface HitPoints {
    maximum: number;
    current: number;
}

export interface SavingThrows {
    deathRayPoison: number;
    magicWands: number;
    paralysisTurnToStone: number;
    dragonBreath: number;
    rodStaffSpell: number;
}

export interface CombatDetails {
    tempHp?: number;
    baseArmor?: number;
    hasShield?: boolean;
    magicAcMod?: number;
    initBonus?: number;
    movementBase?: number;
}

export type ProficiencyRank = 'N' | 'B' | 'S' | 'E' | 'M' | 'G';

export interface WeaponStatTier {
    toHit: number;
    damage: string;
    acBonus?: string; // e.g. "-1 vs 1", "-2 vs 2"
    deflect?: number;
    range?: string;    // e.g. "10/20/30", "50/100/150"
    special?: string;  // e.g. "Stun", "Delay", "Disarm -2", "Double Damage (20)"
}

export interface WeaponMasteryEntry {
    id: string;
    name: string;
    type: '1h-melee' | '2h-melee' | 'versatile' | 'missile' | 'shield';
    useableBy: string[]; // e.g. ['Fighter', 'Dwarf', 'Elf', 'Thief']
    cost: string;
    weight?: number;   // encumbrance in cn
    source?: string;   // rulebook the entry comes from
    armed: Record<ProficiencyRank, WeaponStatTier>;
    unarmed: Record<ProficiencyRank, WeaponStatTier>;
    twoHandedArmed?: Record<ProficiencyRank, WeaponStatTier>;
    twoHandedUnarmed?: Record<ProficiencyRank, WeaponStatTier>;
}

export interface CharacterWeaponSlot {
    weaponId: string;
    rank: ProficiencyRank;
    isEquipped: boolean;
    customBonusToHit?: number;
    customBonusDamage?: number;
}

export interface Character {
    id: string;
    name: string;
    characterClass: string;
    level: number;
    experiencePoints: number;
    subClass?: string;
    subClassLevel?: number;
    subClassXP?: number;
    arcaneWarriorStartLevel?: number;
    deity?: string;
    spellbook?: SpellbookData;
    combatDetails?: CombatDetails;
    weaponFeats?: CharacterWeaponSlot[];
    alignment: string;
    abilities: Abilities;
    hitPoints: HitPoints;
    armorClass: number;
    thac0: number;
    savingThrows: SavingThrows;
}