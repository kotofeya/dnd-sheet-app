import { WeaponMasteryEntry } from '../types';

// useableBy and cost follow Dark Dungeons Table 6-1 (Master Weapon Table), extended for the
// Mystara Extra Rules Compendium classes (Archer, Bandit, Battlecaster, Beastmaster, Bounty Hunter, Rake, Witch).
// For the bastard sword (versatile) this is the one-handed row; two-handed use excludes Thieves.
export const WeaponsDatabase: Record<string, WeaponMasteryEntry> = {

"axe_battle": {
        id: "axe_battle",
        name: "Axe, Battle",
        type: "2h-melee",
        useableBy: ["Dwarf", "Elf", "Shadow Elf", "Fighter", "Mystic", "Archer", "Battlecaster", "Bounty Hunter", "Beastmaster", "Centaur"],
        cost: "7gp",
        armed: {
            N: { toHit: 0, damage: "1d4" },
            B: { toHit: 0, damage: "1d8" },
            S: { toHit: 1, damage: "1d8+2", special: "Delay" },
            E: { toHit: 2, damage: "1d8+4", range: "-/5/10", special: "Delay" },
            M: { toHit: 4, damage: "1d8+6", range: "-/5/10", special: "Delay, Stun" },
            G: { toHit: 6, damage: "1d8+8", range: "5/10/15", special: "Delay, Stun" }
        },
        unarmed: {
            N: { toHit: 0, damage: "1d4" },
            B: { toHit: 0, damage: "1d8" },
            S: { toHit: 2, damage: "1d8+2", acBonus: "-2 vs 2", special: "Delay" },
            E: { toHit: 4, damage: "1d8+4", acBonus: "-3 vs 2", range: "-/5/10", special: "Delay" },
            M: { toHit: 6, damage: "1d8+8", acBonus: "-3 vs 3", range: "-/5/10", special: "Delay, Stun" },
            G: { toHit: 8, damage: "1d10+10", acBonus: "-4 vs 4", range: "5/10/15", special: "Delay, Stun" }
        }
    },

"axe_hand": {
    id: "axe_hand",
    name: "Axe, Hand",
    type: "1h-melee",
    useableBy: ["Dwarf", "Elf", "Shadow Elf", "Fighter", "Halfling", "Mystic", "Thief", "Archer", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Centaur", "Gnome", "Skygnome"],
    cost: "4gp",
    armed: {
        N: { toHit: 0, damage: "1d3", range: "10/20/30" },
        B: { toHit: 0, damage: "1d6", range: "10/20/30" },
        S: { toHit: 1, damage: "1d6+2", range: "15/25/35" },
        E: { toHit: 2, damage: "1d6+3", range: "25/35/45" },
        M: { toHit: 4, damage: "1d6+4", range: "30/40/50" },
        G: { toHit: 6, damage: "1d6+6", range: "40/50/60" }
    },
    unarmed: {
        N: { toHit: 0, damage: "1d3", range: "10/20/30" },
        B: { toHit: 0, damage: "1d6", range: "10/20/30" },
        S: { toHit: 2, damage: "1d6+2", acBonus: "-1 vs 1", range: "15/25/35" },
        E: { toHit: 4, damage: "1d6+3", acBonus: "-2 vs 2", range: "25/35/45" },
        M: { toHit: 6, damage: "2d4+4", acBonus: "-3 vs 3", range: "30/40/50" },
        G: { toHit: 8, damage: "2d4+7", acBonus: "-3 vs 3", range: "40/50/60" }
    }
},

"blackjack": {
        id: "blackjack",
        name: "Blackjack",
        type: "1h-melee",
        useableBy: ["Cleric", "Druid", "Dwarf", "Elf", "Shadow Elf", "Fighter", "Halfling", "Mystic", "Thief", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Centaur", "Gnome", "Skygnome"],
        cost: "5gp",
        armed: {
            N: { toHit: 0, damage: "1" },
            B: { toHit: 0, damage: "1d2", special: "Knockout +0" },
            S: { toHit: 2, damage: "2d2", special: "Knockout -1" },
            E: { toHit: 4, damage: "1d4+1", special: "Knockout -2" },
            M: { toHit: 6, damage: "1d4+3", special: "Knockout -3" },
            G: { toHit: 8, damage: "1d4+5", special: "Knockout -4" }
        },
        unarmed: {
            N: { toHit: 0, damage: "1" },
            B: { toHit: 0, damage: "1d2", special: "Knockout +0" },
            S: { toHit: 1, damage: "2d2", special: "Knockout -1" },
            E: { toHit: 2, damage: "1d4+1", special: "Knockout -2" },
            M: { toHit: 4, damage: "1d6+1", special: "Knockout -3" },
            G: { toHit: 6, damage: "1d6+2", special: "Knockout -4" }
        }
    },

    "blowgun_small": {
        id: "blowgun_small",
        name: "Blowgun, Small",
        type: "missile",
        useableBy: ["Dwarf", "Elf", "Shadow Elf", "Fighter", "Magic-User", "Mystic", "Thief", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Witch", "Centaur"],
        cost: "6gp",
        armed: {
            N: { toHit: -1, damage: "-", range: "10/20/30", special: "Poison Save +0" },
            B: { toHit: 0, damage: "-", range: "10/20/30", special: "Poison Save +0" },
            S: { toHit: 2, damage: "-", range: "15/20/30", special: "Poison Save -1" },
            E: { toHit: 4, damage: "-", range: "15/25/35", special: "Poison Save -2" },
            M: { toHit: 6, damage: "-", range: "20/25/35", special: "Poison Save -3" },
            G: { toHit: 8, damage: "-", range: "25/30/40", special: "Poison Save -4" }
        },
        unarmed: {
            N: { toHit: -1, damage: "-", range: "10/20/30", special: "Poison Save +0" },
            B: { toHit: 0, damage: "-", range: "10/20/30", special: "Poison Save +0" },
            S: { toHit: 2, damage: "-", range: "15/20/30", special: "Poison Save -1" },
            E: { toHit: 4, damage: "-", range: "15/25/35", special: "Poison Save -2" },
            M: { toHit: 6, damage: "-", range: "20/25/35", special: "Poison Save -3" },
            G: { toHit: 8, damage: "-", range: "25/30/40", special: "Poison Save -4" }
        }
    },

    "blowgun_large": {
        id: "blowgun_large",
        name: "Blowgun, Large",
        type: "missile",
        useableBy: ["Dwarf", "Elf", "Shadow Elf", "Fighter", "Magic-User", "Mystic", "Thief", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Witch", "Centaur"],
        cost: "3gp",
        armed: {
            N: { toHit: -1, damage: "-", range: "20/25/30", special: "Poison Save +0" },
            B: { toHit: 0, damage: "-", range: "20/25/30", special: "Poison Save +0" },
            S: { toHit: 2, damage: "-", range: "20/25/30", special: "Poison Save -1" },
            E: { toHit: 4, damage: "-", range: "25/30/40", special: "Poison Save -2" },
            M: { toHit: 6, damage: "-", range: "30/35/40", special: "Poison Save -3" },
            G: { toHit: 8, damage: "-", range: "30/40/50", special: "Poison Save -4" }
        },
        unarmed: {
            N: { toHit: -1, damage: "-", range: "20/25/30", special: "Poison Save +0" },
            B: { toHit: 0, damage: "-", range: "20/25/30", special: "Poison Save +0" },
            S: { toHit: 2, damage: "-", range: "20/25/30", special: "Poison Save -1" },
            E: { toHit: 4, damage: "-", range: "25/30/40", special: "Poison Save -2" },
            M: { toHit: 6, damage: "-", range: "30/35/40", special: "Poison Save -3" },
            G: { toHit: 8, damage: "-", range: "30/40/50", special: "Poison Save -4" }
        }
    },

    "bolas": {
        id: "bolas",
        name: "Bolas",
        type: "missile",
        useableBy: ["Dwarf", "Elf", "Shadow Elf", "Fighter", "Mystic", "Thief", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Centaur"],
        cost: "5gp",
        armed: {
            N: { toHit: 0, damage: "1", range: "20/40/60" },
            B: { toHit: 0, damage: "1d2", range: "20/40/60", special: "Strangle 20" },
            S: { toHit: 2, damage: "1d3", acBonus: "-1 vs 1", range: "25/40/60", special: "Strangle 20 (-1)" },
            E: { toHit: 4, damage: "1d3+1", acBonus: "-2 vs 2", range: "30/50/70", special: "Strangle 19 (-2)" },
            M: { toHit: 6, damage: "1d3+2", acBonus: "-3 vs 3", range: "35/50/70", special: "Strangle 18 (-3)" },
            G: { toHit: 8, damage: "1d3+3", acBonus: "-4 vs 3", range: "40/60/80", special: "Strangle 17 (-4)" }
        },
        unarmed: {
            N: { toHit: 0, damage: "1", range: "20/40/60" },
            B: { toHit: 0, damage: "1d2", range: "20/40/60", special: "Strangle 20" },
            S: { toHit: 1, damage: "1d3", range: "25/40/60", special: "Strangle 20 (-1)" },
            E: { toHit: 2, damage: "1d3+1", range: "30/50/70", special: "Strangle 19 (-2)" },
            M: { toHit: 4, damage: "1d3+2", range: "35/50/70", special: "Strangle 18 (-3)" },
            G: { toHit: 6, damage: "1d3+3", range: "40/60/80", special: "Strangle 17 (-4)" }
        }
    },

    "bow_long": {
        id: "bow_long",
        name: "Bow, Long",
        type: "missile",
        useableBy: ["Elf", "Shadow Elf", "Fighter", "Mystic", "Thief", "Archer", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Centaur"],
        cost: "40gp",
        armed: {
            N: { toHit: -1, damage: "1d3", range: "70/140/210" },
            B: { toHit: 0, damage: "1d6", range: "70/140/210" },
            S: { toHit: 1, damage: "1d8+1", acBonus: "-1 vs 1", range: "90/150/220", special: "Delay (s/m)" },
            E: { toHit: 2, damage: "1d10+2", acBonus: "-2 vs 1", range: "110/170/230", special: "Delay (s/m)" },
            M: { toHit: 4, damage: "1d10+4", acBonus: "-2 vs 2", range: "130/180/240", special: "Delay (s/m)" },
            G: { toHit: 6, damage: "1d10+6", acBonus: "-2 vs 2", range: "150/200/250", special: "Delay (s/m)" }
        },
        unarmed: {
            N: { toHit: -1, damage: "1d3", range: "70/140/210" },
            B: { toHit: 0, damage: "1d6", range: "70/140/210" },
            S: { toHit: 2, damage: "1d8+1", range: "90/150/220", special: "Delay (s/m)" },
            E: { toHit: 4, damage: "1d10+2", range: "110/170/230", special: "Delay (s/m)" },
            M: { toHit: 6, damage: "3d6", range: "130/180/240", special: "Delay (s/m)" },
            G: { toHit: 8, damage: "4d4+2", range: "150/200/250", special: "Delay (s/m)" }
        }
    },

    "bow_short": {
        id: "bow_short",
        name: "Bow, Short",
        type: "missile",
        useableBy: ["Dwarf", "Elf", "Shadow Elf", "Fighter", "Halfling", "Mystic", "Thief", "Archer", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Centaur", "Gnome", "Skygnome"],
        cost: "25gp",
        armed: {
            N: { toHit: -1, damage: "1d3", range: "50/100/150" },
            B: { toHit: 0, damage: "1d6", range: "50/100/150" },
            S: { toHit: 1, damage: "1d6+2", acBonus: "-1 vs 1", range: "60/110/160", special: "Delay (s)" },
            E: { toHit: 2, damage: "1d6+4", acBonus: "-1 vs 2", range: "80/130/170", special: "Delay (s)" },
            M: { toHit: 4, damage: "1d4+6", acBonus: "-2 vs 2", range: "90/130/180", special: "Delay (s)" },
            G: { toHit: 6, damage: "1d6+7", acBonus: "-2 vs 2", range: "110/140/190", special: "Delay (s)" }
        },
        unarmed: {
            N: { toHit: -1, damage: "1d3", range: "50/100/150" },
            B: { toHit: 0, damage: "1d6", range: "50/100/150" },
            S: { toHit: 2, damage: "1d6+2", range: "60/110/160", special: "Delay (s)" },
            E: { toHit: 4, damage: "1d6+4", range: "80/130/170", special: "Delay (s)" },
            M: { toHit: 6, damage: "1d8+6", range: "90/130/180", special: "Delay (s)" },
            G: { toHit: 8, damage: "1d10+8", range: "110/140/190", special: "Delay (s)" }
        }
    },

    "cestus": {
        id: "cestus",
        name: "Cestus",
        type: "1h-melee",
        useableBy: ["Dwarf", "Elf", "Shadow Elf", "Fighter", "Halfling", "Mystic", "Thief", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Centaur", "Gnome", "Skygnome"],
        cost: "5gp",
        armed: {
            N: { toHit: 0, damage: "1" },
            B: { toHit: 0, damage: "1d3", special: "Off-Hand" },
            S: { toHit: 2, damage: "1d4+1", special: "Off-Hand" },
            E: { toHit: 4, damage: "2d4", special: "Off-Hand" },
            M: { toHit: 6, damage: "2d4", special: "Off-Hand" },
            G: { toHit: 8, damage: "3d4", special: "Off-Hand" }
        },
        unarmed: {
            N: { toHit: 0, damage: "1" },
            B: { toHit: 0, damage: "1d3", special: "Off-Hand" },
            S: { toHit: 1, damage: "1d4+1", special: "Off-Hand" },
            E: { toHit: 2, damage: "2d4", special: "Off-Hand" },
            M: { toHit: 4, damage: "1d4+3", special: "Off-Hand" },
            G: { toHit: 6, damage: "2d4+3", special: "Off-Hand" }
        }
    },

    "club": {
        id: "club",
        name: "Club",
        type: "1h-melee",
        useableBy: ["Cleric", "Druid", "Dwarf", "Elf", "Shadow Elf", "Fighter", "Mystic", "Thief", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Centaur"],
        cost: "3gp",
        armed: {
            N: { toHit: 0, damage: "1d2" },
            B: { toHit: 0, damage: "1d4" },
            S: { toHit: 1, damage: "1d6+1", acBonus: "-1 vs 2", deflect: 1 },
            E: { toHit: 2, damage: "1d6+3", acBonus: "-2 vs 2", deflect: 1, range: "-/15/25" },
            M: { toHit: 4, damage: "1d4+5", acBonus: "-3 vs 3", deflect: 2, range: "-/15/25" },
            G: { toHit: 6, damage: "1d4+6", acBonus: "-4 vs 4", deflect: 2, range: "10/25/40" }
        },
        unarmed: {
            N: { toHit: 0, damage: "1d2" },
            B: { toHit: 0, damage: "1d4" },
            S: { toHit: 2, damage: "1d6+1", acBonus: "-1 vs 2", deflect: 1 },
            E: { toHit: 4, damage: "1d6+3", acBonus: "-2 vs 2", deflect: 1, range: "-/15/25" },
            M: { toHit: 6, damage: "1d6+5", acBonus: "-3 vs 3", deflect: 2, range: "-/15/25" },
            G: { toHit: 8, damage: "1d6+6", acBonus: "-4 vs 4", deflect: 2, range: "10/25/40" }
        }
    },

    // 1. CROSSBOW, HEAVY (Таблицы 6-20 и 6-21)
    "crossbow_heavy": {
        id: "crossbow_heavy",
        name: "Crossbow, Heavy",
        type: "missile",
        useableBy: ["Elf", "Shadow Elf", "Fighter", "Mystic", "Thief", "Archer", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Centaur"],
        cost: "50gp",
        armed: {
            N: { toHit: -1, damage: "1d4", range: "80/160/240" },
            B: { toHit: 0, damage: "2d4", range: "80/160/240" },
            S: { toHit: 2, damage: "2d6", range: "90/160/240", special: "Stun (s/m)" },
            E: { toHit: 4, damage: "2d6+2", range: "100/170/240", special: "Stun (s/m)" },
            M: { toHit: 6, damage: "3d6+2", range: "110/170/240", special: "Stun (s/m)" },
            G: { toHit: 8, damage: "4d4+4", range: "120/180/240", special: "Stun (s/m)" }
        },
        unarmed: {
            N: { toHit: -1, damage: "1d4", range: "80/160/240" },
            B: { toHit: 0, damage: "2d4", range: "80/160/240" },
            S: { toHit: 1, damage: "2d6", acBonus: "-1 vs 1", range: "90/160/240", special: "Stun (s/m)" },
            E: { toHit: 2, damage: "2d6+2", acBonus: "-2 vs 2", range: "100/170/240", special: "Stun (s/m)" },
            M: { toHit: 4, damage: "1d12+4", acBonus: "-3 vs 2", range: "110/170/240", special: "Stun (s/m)" },
            G: { toHit: 6, damage: "1d10+6", acBonus: "-3 vs 3", range: "120/180/240", special: "Stun (s/m)" }
        }
    },

    // 2. CROSSBOW, LIGHT (Таблицы 6-22 и 6-23)
    "crossbow_light": {
        id: "crossbow_light",
        name: "Crossbow, Light",
        type: "missile",
        useableBy: ["Dwarf", "Elf", "Shadow Elf", "Fighter", "Halfling", "Mystic", "Thief", "Archer", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Centaur", "Gnome", "Skygnome"],
        cost: "30gp",
        armed: {
            N: { toHit: -1, damage: "1d3", range: "60/120/180" },
            B: { toHit: 0, damage: "1d6", range: "60/120/180" },
            S: { toHit: 2, damage: "1d6+2", range: "60/120/180", special: "Stun (s)" },
            E: { toHit: 4, damage: "1d6+4", range: "75/130/180", special: "Stun (s)" },
            M: { toHit: 6, damage: "1d8+6", range: "75/130/180", special: "Stun (s)" },
            G: { toHit: 8, damage: "1d6+7", range: "90/140/180", special: "Stun (s)" }
        },
        unarmed: {
            N: { toHit: -1, damage: "1d3", range: "60/120/180" },
            B: { toHit: 0, damage: "1d6", range: "60/120/180" },
            S: { toHit: 1, damage: "1d6+2", acBonus: "-1 vs 1", range: "60/120/180", special: "Stun (s)" },
            E: { toHit: 2, damage: "1d6+4", acBonus: "-2 vs 2", range: "75/130/180", special: "Stun (s)" },
            M: { toHit: 4, damage: "1d4+6", acBonus: "-3 vs 2", range: "75/130/180", special: "Stun (s)" },
            G: { toHit: 6, damage: "2d4+5", acBonus: "-3 vs 3", range: "90/140/180", special: "Stun (s)" }
        }
    },

    // 3. DAGGER (Таблицы 6-24 и 6-25)
    "dagger": {
        id: "dagger",
        name: "Dagger",
        type: "1h-melee",
        useableBy: ["Dwarf", "Elf", "Shadow Elf", "Fighter", "Halfling", "Magic-User", "Mystic", "Thief", "Archer", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Witch", "Centaur", "Gnome", "Skygnome"],
        cost: "3gp",
        armed: {
            N: { toHit: 0, damage: "1d2", range: "10/20/30" },
            B: { toHit: 0, damage: "1d4", range: "10/20/30" },
            S: { toHit: 2, damage: "1d6", acBonus: "-1 vs 1", range: "15/25/35", special: "Double Damage (20)" },
            E: { toHit: 4, damage: "2d4", acBonus: "-2 vs 2", range: "20/30/45", special: "Double Damage (19)" },
            M: { toHit: 6, damage: "3d4", acBonus: "-2 vs 2", range: "25/35/50", special: "Double Damage (18)" },
            G: { toHit: 8, damage: "4d4", acBonus: "-3 vs 3", range: "30/50/60", special: "Double Damage (17)" }
        },
        unarmed: {
            N: { toHit: 0, damage: "1d2", range: "10/20/30" },
            B: { toHit: 0, damage: "1d4", range: "10/20/30" },
            S: { toHit: 1, damage: "1d6", range: "15/25/35", special: "Double Damage (20)" },
            E: { toHit: 2, damage: "2d4", range: "20/30/45", special: "Double Damage (19)" },
            M: { toHit: 4, damage: "2d4+2", range: "25/35/50", special: "Double Damage (18)" },
            G: { toHit: 6, damage: "3d4+1", range: "30/50/60", special: "Double Damage (17)" }
        }
    },

    // 1. HALBERD (Таблицы 6-26 и 6-27)
    "halberd": {
        id: "halberd",
        name: "Halberd",
        type: "2h-melee",
        useableBy: ["Elf", "Shadow Elf", "Fighter", "Mystic", "Battlecaster", "Bounty Hunter", "Beastmaster", "Centaur"],
        cost: "7gp",
        armed: {
            N: { toHit: 0, damage: "1d5" },
            B: { toHit: 0, damage: "1d10", special: "Hook +0, Disarm +0" },
            S: { toHit: 2, damage: "1d10+3", acBonus: "-1 vs 1", special: "Hook -1, Disarm +0" },
            E: { toHit: 4, damage: "1d10+5", acBonus: "-2 vs 1", deflect: 1, special: "Hook -2, Disarm +0" },
            M: { toHit: 6, damage: "1d8+10", acBonus: "-2 vs 2", deflect: 1, special: "Hook -3, Disarm +0" },
            G: { toHit: 8, damage: "1d6+15", acBonus: "-3 vs 2", deflect: 2, special: "Hook -4, Disarm +0" }
        },
        unarmed: {
            N: { toHit: 0, damage: "1d5" },
            B: { toHit: 0, damage: "1d10", special: "Hook +0, Disarm +0" },
            S: { toHit: 1, damage: "1d10+3", special: "Hook -1, Disarm +0" },
            E: { toHit: 2, damage: "1d10+5", deflect: 1, special: "Hook -2, Disarm +0" },
            M: { toHit: 4, damage: "1d8+8", deflect: 1, special: "Hook -3, Disarm +0" },
            G: { toHit: 6, damage: "1d6+12", deflect: 2, special: "Hook -4, Disarm +0" }
        }
    },

    // 2. HAMMER, THROWING (Таблицы 6-28 и 6-29)
    "hammer_throwing": {
        id: "hammer_throwing",
        name: "Hammer, Throwing",
        type: "1h-melee",
        useableBy: ["Cleric", "Dwarf", "Elf", "Shadow Elf", "Fighter", "Mystic", "Thief", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Centaur", "Gnome", "Skygnome"],
        cost: "4gp",
        armed: {
            N: { toHit: 0, damage: "1d2", range: "10/20/30" },
            B: { toHit: 0, damage: "1d4", range: "10/20/30" },
            S: { toHit: 1, damage: "1d4+2", range: "10/20/30", special: "Stun (s/m)" },
            E: { toHit: 2, damage: "1d6+2", range: "20/30/45", special: "Stun (s/m)" },
            M: { toHit: 4, damage: "1d4+4", range: "20/40/45", special: "Stun (s/m)" },
            G: { toHit: 6, damage: "1d4+6", range: "30/50/60", special: "Stun (s/m)" }
        },
        unarmed: {
            N: { toHit: 0, damage: "1d2", range: "10/20/30" },
            B: { toHit: 0, damage: "1d4", range: "10/20/30" },
            S: { toHit: 2, damage: "1d4+2", acBonus: "-1 vs 2", range: "10/20/30", special: "Stun (s/m)" },
            E: { toHit: 4, damage: "1d6+2", acBonus: "-2 vs 3", range: "20/30/45", special: "Stun (s/m)" },
            M: { toHit: 6, damage: "1d6+4", acBonus: "-3 vs 4", range: "20/40/45", special: "Stun (s/m)" },
            G: { toHit: 8, damage: "1d6+6", acBonus: "-4 vs 5", range: "30/50/60", special: "Stun (s/m)" }
        }
    },

    // 3. HAMMER, WAR (Таблицы 6-30 и 6-31)
    "hammer_war": {
        id: "hammer_war",
        name: "Hammer, War",
        type: "1h-melee",
        useableBy: ["Cleric", "Dwarf", "Elf", "Shadow Elf", "Fighter", "Mystic", "Thief", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Centaur", "Gnome", "Skygnome"],
        cost: "5gp",
        armed: {
            N: { toHit: 0, damage: "1d3" },
            B: { toHit: 0, damage: "1d6" },
            S: { toHit: 2, damage: "1d6+2" },
            E: { toHit: 4, damage: "1d8+2", range: "-/10/20" },
            M: { toHit: 6, damage: "1d8+5", range: "-/10/20" },
            G: { toHit: 8, damage: "1d8+7", range: "10/20/30" }
        },
        unarmed: {
            N: { toHit: 0, damage: "1d3" },
            B: { toHit: 0, damage: "1d6" },
            S: { toHit: 1, damage: "1d6+2", acBonus: "-2 vs 2" },
            E: { toHit: 2, damage: "1d8+2", acBonus: "-3 vs 3", range: "-/10/20" },
            M: { toHit: 4, damage: "1d6+4", acBonus: "-4 vs 3", range: "-/10/20" },
            G: { toHit: 6, damage: "1d6+7", acBonus: "-5 vs 4", range: "10/20/30" }
        }
    },

    // 1. JAVELIN (Таблицы 6-32 и 6-33)
    "javelin": {
        id: "javelin",
        name: "Javelin",
        type: "1h-melee",
        useableBy: ["Dwarf", "Elf", "Shadow Elf", "Fighter", "Mystic", "Thief", "Archer", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Centaur"],
        cost: "1gp",
        armed: {
            N: { toHit: 0, damage: "1d3", range: "30/60/90" },
            B: { toHit: 0, damage: "1d6", range: "30/60/90" },
            S: { toHit: 2, damage: "1d6+2", range: "30/60/90" },
            E: { toHit: 4, damage: "1d6+4", range: "40/80/120" },
            M: { toHit: 6, damage: "1d6+6", range: "40/80/120" },
            G: { toHit: 8, damage: "1d6+9", range: "50/100/150" }
        },
        unarmed: {
            N: { toHit: 0, damage: "1d3", range: "30/60/90" },
            B: { toHit: 0, damage: "1d6", range: "30/60/90" },
            S: { toHit: 1, damage: "1d6+2", range: "30/60/90" },
            E: { toHit: 2, damage: "1d6+4", range: "40/80/120" },
            M: { toHit: 4, damage: "1d4+6", range: "40/80/120" },
            G: { toHit: 6, damage: "1d4+8", range: "50/100/150" }
        }
    },

    // 2. LANCE (Таблицы 6-34 и 6-35)
    "lance": {
        id: "lance",
        name: "Lance",
        type: "1h-melee",
        useableBy: ["Elf", "Shadow Elf", "Fighter", "Mystic", "Thief", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Centaur"],
        cost: "10gp",
        armed: {
            N: { toHit: 0, damage: "1d5", special: "Charge" },
            B: { toHit: 0, damage: "1d10", special: "Charge" },
            S: { toHit: 1, damage: "1d10+3", special: "Charge" },
            E: { toHit: 2, damage: "1d10+7", special: "Charge" },
            M: { toHit: 4, damage: "1d8+10", special: "Charge" },
            G: { toHit: 6, damage: "1d6+12", special: "Charge" }
        },
        unarmed: {
            N: { toHit: 0, damage: "1d5", special: "Charge" },
            B: { toHit: 0, damage: "1d10", special: "Charge" },
            S: { toHit: 2, damage: "1d10+3", acBonus: "-2 vs 1", special: "Charge" },
            E: { toHit: 4, damage: "1d10+7", acBonus: "-3 vs 1", special: "Charge" },
            M: { toHit: 6, damage: "1d8+12", acBonus: "-3 vs 2", special: "Charge" },
            G: { toHit: 8, damage: "1d8+16", acBonus: "-4 vs 2", special: "Charge" }
        }
    },

    // 3. MACE (Таблицы 6-36 и 6-37)
    "mace": {
        id: "mace",
        name: "Mace",
        type: "1h-melee",
        useableBy: ["Cleric", "Dwarf", "Elf", "Shadow Elf", "Fighter", "Mystic", "Thief", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Centaur"],
        cost: "5gp",
        armed: {
            N: { toHit: 0, damage: "1d3" },
            B: { toHit: 0, damage: "1d6" },
            S: { toHit: 2, damage: "2d4", acBonus: "-1 vs 1" },
            E: { toHit: 4, damage: "2d4+2", acBonus: "-2 vs 2", range: "-/10/20" },
            M: { toHit: 6, damage: "2d4+4", acBonus: "-3 vs 3", range: "-/10/20" },
            G: { toHit: 8, damage: "2d4+6", acBonus: "-4 vs 3", range: "10/20/30" }
        },
        unarmed: {
            N: { toHit: 0, damage: "1d3" },
            B: { toHit: 0, damage: "1d6" },
            S: { toHit: 2, damage: "2d4" },
            E: { toHit: 4, damage: "2d4+2", range: "-/10/20" },
            M: { toHit: 6, damage: "2d4+4", range: "-/10/20" },
            G: { toHit: 8, damage: "2d4+6", range: "10/20/30" }
        }
    },

    // 1. NET (Таблицы 6-38 и 6-39)
    "net": {
        id: "net",
        name: "Net",
        type: "1h-melee",
        useableBy: ["Dwarf", "Elf", "Shadow Elf", "Fighter", "Magic-User", "Mystic", "Thief", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Witch", "Centaur"],
        cost: "4gp",
        armed: {
            N: { toHit: 0, damage: "-", range: "10/20/30", special: "Entangle +0" },
            B: { toHit: 0, damage: "-", range: "10/20/30", special: "Entangle +0" },
            S: { toHit: 1, damage: "-", acBonus: "-2 vs 1", range: "15/25/35", special: "Entangle +1" },
            E: { toHit: 2, damage: "-", acBonus: "-4 vs 2", range: "20/30/40", special: "Entangle +2" },
            M: { toHit: 4, damage: "-", acBonus: "-6 vs 3", range: "25/35/45", special: "Entangle +2" },
            G: { toHit: 6, damage: "-", acBonus: "-8 vs 4", range: "30/40/50", special: "Entangle +3" }
        },
        unarmed: {
            N: { toHit: 0, damage: "-", range: "10/20/30", special: "Entangle +0" },
            B: { toHit: 0, damage: "-", range: "10/20/30", special: "Entangle +0" },
            S: { toHit: 2, damage: "-", acBonus: "-2 vs 1", range: "15/25/35", special: "Entangle +1" },
            E: { toHit: 4, damage: "-", acBonus: "-4 vs 2", range: "20/30/40", special: "Entangle +2" },
            M: { toHit: 6, damage: "-", acBonus: "-6 vs 3", range: "25/35/45", special: "Entangle +4" },
            G: { toHit: 8, damage: "-", acBonus: "-8 vs 4", range: "30/40/50", special: "Entangle +6" }
        }
    },

    // 2. PIKE (Таблицы 6-40 и 6-41)
    "pike": {
        id: "pike",
        name: "Pike",
        type: "2h-melee",
        useableBy: ["Elf", "Shadow Elf", "Fighter", "Mystic", "Battlecaster", "Bounty Hunter", "Beastmaster", "Centaur"],
        cost: "3gp",
        armed: {
            N: { toHit: 0, damage: "1d5" },
            B: { toHit: 0, damage: "1d10", special: "Set" },
            S: { toHit: 2, damage: "1d12+2", acBonus: "-2 vs 1", deflect: 1, special: "Set" },
            E: { toHit: 4, damage: "1d12+5", acBonus: "-2 vs 2", deflect: 1, special: "Set" },
            M: { toHit: 6, damage: "1d12+9", acBonus: "-3 vs 2", deflect: 2, special: "Set" },
            G: { toHit: 8, damage: "1d10+14", acBonus: "-3 vs 3", deflect: 2, special: "Set" }
        },
        unarmed: {
            N: { toHit: 0, damage: "1d5" },
            B: { toHit: 0, damage: "1d10", special: "Set" },
            S: { toHit: 1, damage: "1d12+2", deflect: 1, special: "Set" },
            E: { toHit: 2, damage: "1d12+5", deflect: 1, special: "Set" },
            M: { toHit: 4, damage: "1d10+8", deflect: 2, special: "Set" },
            G: { toHit: 6, damage: "1d8+10", deflect: 2, special: "Set" }
        }
    },

    // 3. PISTOL (Таблицы 6-42 и 6-43)
    "pistol": {
        id: "pistol",
        name: "Pistol",
        type: "missile",
        useableBy: ["Dwarf", "Elf", "Shadow Elf", "Fighter", "Halfling", "Magic-User", "Mystic", "Thief", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Witch", "Centaur", "Gnome", "Skygnome"],
        cost: "250gp",
        armed: {
            N: { toHit: -1, damage: "1d3", range: "50/100/150" },
            B: { toHit: 0, damage: "1d6", range: "50/100/150" },
            S: { toHit: 2, damage: "1d8+1", range: "60/110/160", special: "Delay (s/m)" },
            E: { toHit: 4, damage: "1d10+2", range: "80/130/170", special: "Delay (s/m)" },
            M: { toHit: 6, damage: "3d6", range: "90/130/180", special: "Delay (s/m)" },
            G: { toHit: 8, damage: "4d4+2", range: "110/140/190", special: "Delay (s/m)" }
        },
        unarmed: {
            N: { toHit: -1, damage: "1d3", range: "50/100/150" },
            B: { toHit: 0, damage: "1d6", range: "50/100/150" },
            S: { toHit: 1, damage: "1d8+1", range: "60/110/160", special: "Delay (s/m)" },
            E: { toHit: 2, damage: "1d10+2", range: "80/130/170", special: "Delay (s/m)" },
            M: { toHit: 4, damage: "1d10+4", range: "90/130/180", special: "Delay (s/m)" },
            G: { toHit: 6, damage: "1d10+6", range: "110/140/190", special: "Delay (s/m)" }
        }
    },

    // 1. POLEAXE (Таблицы 6-44 и 6-45)
    "poleaxe": {
        id: "poleaxe",
        name: "Poleaxe",
        type: "2h-melee",
        useableBy: ["Elf", "Shadow Elf", "Fighter", "Mystic", "Battlecaster", "Bounty Hunter", "Beastmaster", "Centaur"],
        cost: "5gp",
        armed: {
            N: { toHit: 0, damage: "1d5" },
            B: { toHit: 0, damage: "1d10" },
            S: { toHit: 2, damage: "1d10+3", acBonus: "-1 vs 1", deflect: 1 },
            E: { toHit: 4, damage: "1d10+6", acBonus: "-2 vs 1", deflect: 1 },
            M: { toHit: 6, damage: "1d10+10", acBonus: "-2 vs 2", deflect: 2 },
            G: { toHit: 8, damage: "1d8+16", acBonus: "-3 vs 2", deflect: 2 }
        },
        unarmed: {
            N: { toHit: 0, damage: "1d5" },
            B: { toHit: 0, damage: "1d10" },
            S: { toHit: 1, damage: "1d10+3", deflect: 1 },
            E: { toHit: 2, damage: "1d10+6", deflect: 1 },
            M: { toHit: 4, damage: "1d10+8", deflect: 2 },
            G: { toHit: 6, damage: "1d8+12", deflect: 2 }
        }
    },

    // 2. SHIELD, HORNED (Таблица 6-46 — vs All Opponents)
    "shield_horned": {
        id: "shield_horned",
        name: "Shield, Horned",
        type: "1h-melee",
        useableBy: ["Dwarf", "Elf", "Shadow Elf", "Fighter", "Halfling", "Bandit", "Battlecaster", "Bounty Hunter", "Centaur", "Gnome", "Skygnome"],
        cost: "15gp",
        armed: {
            N: { toHit: 0, damage: "1", special: "Off-Hand" },
            B: { toHit: 0, damage: "1d2", acBonus: "-1 vs 1", special: "Off-Hand" },
            S: { toHit: 2, damage: "2d2", acBonus: "-1 vs 1", special: "Off-Hand" },
            E: { toHit: 4, damage: "1d4+1", acBonus: "-1 vs 2", special: "Off-Hand" },
            M: { toHit: 6, damage: "1d4+3", acBonus: "-1 vs 4", special: "Off-Hand" },
            G: { toHit: 8, damage: "1d4+5", acBonus: "-1 vs 6", special: "Off-Hand" }
        },
        unarmed: {
            N: { toHit: 0, damage: "1", special: "Off-Hand" },
            B: { toHit: 0, damage: "1d2", acBonus: "-1 vs 1", special: "Off-Hand" },
            S: { toHit: 2, damage: "2d2", acBonus: "-1 vs 1", special: "Off-Hand" },
            E: { toHit: 4, damage: "1d4+1", acBonus: "-1 vs 2", special: "Off-Hand" },
            M: { toHit: 6, damage: "1d4+3", acBonus: "-1 vs 4", special: "Off-Hand" },
            G: { toHit: 8, damage: "1d4+5", acBonus: "-1 vs 6", special: "Off-Hand" }
        }
    },

    // 3. SHIELD, KNIFE (Таблица 6-47 — vs All Opponents)
    "shield_knife": {
        id: "shield_knife",
        name: "Shield, Knife",
        type: "1h-melee",
        useableBy: ["Dwarf", "Elf", "Shadow Elf", "Fighter", "Halfling", "Bandit", "Battlecaster", "Bounty Hunter", "Centaur", "Gnome", "Skygnome"],
        cost: "65gp",
        armed: {
            N: { toHit: 0, damage: "1d2", special: "Off-Hand, Breakable" },
            B: { toHit: 0, damage: "1d4+1", acBonus: "-1", special: "Off-Hand, Breakable" },
            S: { toHit: 2, damage: "1d6+1", acBonus: "-1", special: "Off-Hand, Breakable" },
            E: { toHit: 4, damage: "2d4+1", acBonus: "-2", special: "Off-Hand, Breakable" },
            M: { toHit: 6, damage: "3d4", acBonus: "-2", special: "Off-Hand, Breakable" },
            G: { toHit: 8, damage: "4d4", acBonus: "-2", special: "Off-Hand, Breakable" }
        },
        unarmed: {
            N: { toHit: 0, damage: "1d2", special: "Off-Hand, Breakable" },
            B: { toHit: 0, damage: "1d4+1", acBonus: "-1", special: "Off-Hand, Breakable" },
            S: { toHit: 2, damage: "1d6+1", acBonus: "-1", special: "Off-Hand, Breakable" },
            E: { toHit: 4, damage: "2d4+1", acBonus: "-2", special: "Off-Hand, Breakable" },
            M: { toHit: 6, damage: "3d4", acBonus: "-2", special: "Off-Hand, Breakable" },
            G: { toHit: 8, damage: "4d4", acBonus: "-2", special: "Off-Hand, Breakable" }
        }
    },

    // 1. SHIELD, SWORD (Таблица 6-48 — vs All Opponents)
    "shield_sword": {
        id: "shield_sword",
        name: "Shield, Sword",
        type: "1h-melee",
        useableBy: ["Dwarf", "Elf", "Shadow Elf", "Fighter", "Bandit", "Battlecaster", "Bounty Hunter", "Centaur"],
        cost: "200gp",
        armed: {
            N: { toHit: 0, damage: "1d2+1", special: "Off-Hand, Breakable" },
            B: { toHit: 0, damage: "1d4+2", acBonus: "-1 vs 2", special: "Off-Hand, Breakable" },
            S: { toHit: 2, damage: "1d6+3", acBonus: "-1 vs 2", special: "Off-Hand, Breakable" },
            E: { toHit: 4, damage: "1d6+4", acBonus: "-2 vs 3", special: "Off-Hand, Breakable" },
            M: { toHit: 6, damage: "1d6+7", acBonus: "-2 vs 3", special: "Off-Hand, Breakable" },
            G: { toHit: 8, damage: "1d6+9", acBonus: "-3 vs 4", special: "Off-Hand, Breakable" }
        },
        unarmed: {
            N: { toHit: 0, damage: "1d2+1", special: "Off-Hand, Breakable" },
            B: { toHit: 0, damage: "1d4+2", acBonus: "-1 vs 2", special: "Off-Hand, Breakable" },
            S: { toHit: 2, damage: "1d6+3", acBonus: "-1 vs 2", special: "Off-Hand, Breakable" },
            E: { toHit: 4, damage: "1d6+4", acBonus: "-2 vs 3", special: "Off-Hand, Breakable" },
            M: { toHit: 6, damage: "1d6+7", acBonus: "-2 vs 3", special: "Off-Hand, Breakable" },
            G: { toHit: 8, damage: "1d6+9", acBonus: "-3 vs 4", special: "Off-Hand, Breakable" }
        }
    },

    // 2. SHIELD, TUSKED (Таблица 6-49 — vs All Opponents)
    "shield_tusked": {
        id: "shield_tusked",
        name: "Shield, Tusked",
        type: "2h-melee",
        useableBy: ["Elf", "Shadow Elf", "Fighter", "Battlecaster", "Bounty Hunter", "Centaur"],
        cost: "200gp",
        armed: {
            N: { toHit: 0, damage: "1d2", special: "Two Attacks, Breakable" },
            B: { toHit: 0, damage: "1d4+1", acBonus: "-1", special: "Two Attacks, Breakable" },
            S: { toHit: 2, damage: "1d6+2", acBonus: "-2", special: "Two Attacks, Breakable" },
            E: { toHit: 4, damage: "2d4+2", acBonus: "-2", special: "Two Attacks, Breakable" },
            M: { toHit: 6, damage: "2d4+4", acBonus: "-3", special: "Two Attacks, Breakable" },
            G: { toHit: 8, damage: "2d4+6", acBonus: "-3", special: "Two Attacks, Breakable" }
        },
        unarmed: {
            N: { toHit: 0, damage: "1d2", special: "Two Attacks, Breakable" },
            B: { toHit: 0, damage: "1d4+1", acBonus: "-1", special: "Two Attacks, Breakable" },
            S: { toHit: 2, damage: "1d6+2", acBonus: "-2", special: "Two Attacks, Breakable" },
            E: { toHit: 4, damage: "2d4+2", acBonus: "-2", special: "Two Attacks, Breakable" },
            M: { toHit: 6, damage: "2d4+4", acBonus: "-3", special: "Two Attacks, Breakable" },
            G: { toHit: 8, damage: "2d4+6", acBonus: "-3", special: "Two Attacks, Breakable" }
        }
    },

    // 3. SLING (Таблицы 6-50 и 6-51)
    "sling": {
        id: "sling",
        name: "Sling",
        type: "missile",
        useableBy: ["Cleric", "Druid", "Dwarf", "Elf", "Shadow Elf", "Fighter", "Magic-User", "Mystic", "Thief", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Witch", "Centaur"],
        cost: "2gp",
        armed: {
            N: { toHit: -1, damage: "1d2", range: "40/80/160" },
            B: { toHit: 0, damage: "1d4", range: "40/80/160" },
            S: { toHit: 2, damage: "1d6", acBonus: "-1 vs 2", range: "40/80/160", special: "Stun (s/m)" },
            E: { toHit: 4, damage: "2d4", acBonus: "-2 vs 3", range: "60/110/170", special: "Stun (s/m)" },
            M: { toHit: 6, damage: "3d4", acBonus: "-3 vs 3", range: "60/110/170", special: "Stun (s/m)" },
            G: { toHit: 8, damage: "4d4", acBonus: "-4 vs 4", range: "80/130/180", special: "Stun (s/m)" }
        },
        unarmed: {
            N: { toHit: -1, damage: "1d2", range: "40/80/160" },
            B: { toHit: 0, damage: "1d4", range: "40/80/160" },
            S: { toHit: 1, damage: "1d6", range: "40/80/160", special: "Stun (s/m)" },
            E: { toHit: 2, damage: "2d4", range: "60/110/170", special: "Stun (s/m)" },
            M: { toHit: 4, damage: "1d8+2", range: "60/110/170", special: "Stun (s/m)" },
            G: { toHit: 6, damage: "1d10+2", range: "80/130/180", special: "Stun (s/m)" }
        }
    },

    // 1. SMOOTHBORE (Таблицы 6-52 и 6-53)
    "smoothbore": {
        id: "smoothbore",
        name: "Smoothbore",
        type: "missile",
        useableBy: ["Elf", "Shadow Elf", "Fighter", "Mystic", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Centaur"],
        cost: "150gp",
        armed: {
            N: { toHit: -1, damage: "1d4", range: "80/160/240" },
            B: { toHit: 0, damage: "2d4", range: "80/160/240" },
            S: { toHit: 1, damage: "2d6", range: "90/160/240", special: "Stun (s/m)" },
            E: { toHit: 2, damage: "2d6+2", range: "100/170/240", special: "Stun (s/m)" },
            M: { toHit: 4, damage: "1d12+4", range: "110/170/240", special: "Stun (s/m)" },
            G: { toHit: 6, damage: "1d10+6", range: "120/180/240", special: "Stun (s/m)" }
        },
        unarmed: {
            N: { toHit: -1, damage: "1d4", range: "80/160/240" },
            B: { toHit: 0, damage: "2d4", range: "80/160/240" },
            S: { toHit: 2, damage: "2d6", acBonus: "-1 vs 1", range: "90/160/240", special: "Stun (s/m)" },
            E: { toHit: 4, damage: "2d6+2", acBonus: "-2 vs 2", range: "100/170/240", special: "Stun (s/m)" },
            M: { toHit: 6, damage: "3d6+2", acBonus: "-3 vs 2", range: "110/170/240", special: "Stun (s/m)" },
            G: { toHit: 8, damage: "4d4+4", acBonus: "-3 vs 3", range: "120/180/240", special: "Stun (s/m)" }
        }
    },

    // 2. SPEAR (Таблица 6-54 — vs All Opponents)
    "spear": {
        id: "spear",
        name: "Spear",
        type: "1h-melee",
        useableBy: ["Elf", "Shadow Elf", "Fighter", "Mystic", "Thief", "Archer", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Centaur"],
        cost: "3gp",
        armed: {
            N: { toHit: 0, damage: "1d3", range: "20/40/60" },
            B: { toHit: 0, damage: "1d6", range: "20/40/60", special: "Set" },
            S: { toHit: 2, damage: "1d6+2", range: "20/40/60", special: "Set" },
            E: { toHit: 4, damage: "2d4+2", range: "40/60/75", special: "Set, Stun" },
            M: { toHit: 6, damage: "2d4+4", range: "40/60/75", special: "Set, Stun" },
            G: { toHit: 8, damage: "2d4+6", range: "60/75/80", special: "Set, Stun" }
        },
        unarmed: {
            N: { toHit: 0, damage: "1d3", range: "20/40/60" },
            B: { toHit: 0, damage: "1d6", range: "20/40/60", special: "Set" },
            S: { toHit: 2, damage: "1d6+2", range: "20/40/60", special: "Set" },
            E: { toHit: 4, damage: "2d4+2", range: "40/60/75", special: "Set, Stun" },
            M: { toHit: 6, damage: "2d4+4", range: "40/60/75", special: "Set, Stun" },
            G: { toHit: 8, damage: "2d4+6", range: "60/75/80", special: "Set, Stun" }
        }
    },

    // 3. STAFF (Таблица 6-55 — vs All Opponents)
    "staff": {
        id: "staff",
        name: "Staff",
        type: "2h-melee",
        useableBy: ["Cleric", "Druid", "Dwarf", "Elf", "Shadow Elf", "Fighter", "Magic-User", "Mystic", "Battlecaster", "Bounty Hunter", "Beastmaster", "Witch", "Centaur"],
        cost: "5gp",
        armed: {
            N: { toHit: 0, damage: "1d3" },
            B: { toHit: 0, damage: "1d6" },
            S: { toHit: 2, damage: "1d6+2", acBonus: "-1 vs 2", deflect: 1 },
            E: { toHit: 4, damage: "1d8+2", acBonus: "-2 vs 3", deflect: 2 },
            M: { toHit: 6, damage: "1d8+5", acBonus: "-3 vs 3", deflect: 3 },
            G: { toHit: 8, damage: "1d8+7", acBonus: "-4 vs 4", deflect: 4 }
        },
        unarmed: {
            N: { toHit: 0, damage: "1d3" },
            B: { toHit: 0, damage: "1d6" },
            S: { toHit: 2, damage: "1d6+2", acBonus: "-1 vs 2", deflect: 1 },
            E: { toHit: 4, damage: "1d8+2", acBonus: "-2 vs 3", deflect: 2 },
            M: { toHit: 6, damage: "1d8+5", acBonus: "-3 vs 3", deflect: 3 },
            G: { toHit: 8, damage: "1d8+7", acBonus: "-4 vs 4", deflect: 4 }
        }
    },

    "sword_bastard": {
        id: "sword_bastard",
        name: "Sword, Bastard",
        type: "versatile",
        useableBy: ["Elf", "Shadow Elf", "Fighter", "Mystic", "Thief", "Archer", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Centaur"],
        cost: "15gp",
        armed: {
            N: { toHit: 0, damage: "1d3" },
            B: { toHit: 0, damage: "1d6+1" },
            S: { toHit: 2, damage: "1d6+3", acBonus: "-1 vs 1" },
            E: { toHit: 4, damage: "1d6+5", acBonus: "-2 vs 2", deflect: 1 },
            M: { toHit: 6, damage: "1d8+8", acBonus: "-3 vs 2", deflect: 1 },
            G: { toHit: 8, damage: "1d8+10", acBonus: "-4 vs 3", deflect: 2 }
        },
        unarmed: {
            N: { toHit: 0, damage: "1d3" },
            B: { toHit: 0, damage: "1d6+1" },
            S: { toHit: 1, damage: "1d6+3" },
            E: { toHit: 2, damage: "1d6+5", deflect: 1 },
            M: { toHit: 4, damage: "1d6+7", deflect: 1 },
            G: { toHit: 6, damage: "1d6+8", deflect: 2 }
        },
        twoHandedArmed: {
            N: { toHit: 0, damage: "1d4" },
            B: { toHit: 0, damage: "1d8+1" },
            S: { toHit: 2, damage: "1d8+3", deflect: 1 },
            E: { toHit: 4, damage: "1d8+5", acBonus: "-1 vs 1", deflect: 1, range: "-/-/5" },
            M: { toHit: 6, damage: "1d10+8", acBonus: "-2 vs 2", deflect: 2, range: "-/-/5" },
            G: { toHit: 8, damage: "1d12+10", acBonus: "-3 vs 2", deflect: 3, range: "-/5/10" }
        },
        twoHandedUnarmed: {
            N: { toHit: 0, damage: "1d4" },
            B: { toHit: 0, damage: "1d8+1" },
            S: { toHit: 1, damage: "1d8+3", deflect: 1 },
            E: { toHit: 2, damage: "1d8+5", deflect: 1, range: "-/-/5" },
            M: { toHit: 4, damage: "1d8+7", deflect: 2, range: "-/-/5" },
            G: { toHit: 6, damage: "1d10+8", deflect: 3, range: "-/5/10" }
        }
    },

    // 3. SWORD, NORMAL (Таблицы 6-60 и 6-61)
    "sword_normal": {
        id: "sword_normal",
        name: "Sword, Normal",
        type: "1h-melee",
        useableBy: ["Dwarf", "Elf", "Shadow Elf", "Fighter", "Mystic", "Thief", "Archer", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Centaur"],
        cost: "10gp",
        armed: {
            N: { toHit: 0, damage: "1d4" },
            B: { toHit: 0, damage: "1d8" },
            S: { toHit: 2, damage: "1d12", acBonus: "-2 vs 1", deflect: 1, special: "Disarm +0" },
            E: { toHit: 4, damage: "2d8", acBonus: "-2 vs 2", deflect: 2, range: "-/5/10", special: "Disarm -1" },
            M: { toHit: 6, damage: "2d8+4", acBonus: "-3 vs 3", deflect: 2, range: "-/5/10", special: "Disarm -2" },
            G: { toHit: 8, damage: "2d6+8", acBonus: "-4 vs 3", deflect: 3, range: "5/10/15", special: "Disarm -4" }
        },
        unarmed: {
            N: { toHit: 0, damage: "1d4" },
            B: { toHit: 0, damage: "1d8" },
            S: { toHit: 1, damage: "1d12", deflect: 1, special: "Disarm +0" },
            E: { toHit: 2, damage: "2d8", deflect: 2, range: "-/5/10", special: "Disarm -1" },
            M: { toHit: 4, damage: "2d6+4", deflect: 2, range: "-/5/10", special: "Disarm -2" },
            G: { toHit: 6, damage: "2d4+8", deflect: 3, range: "5/10/15", special: "Disarm -4" }
        }
    },

    // 1. SWORD, SHORT (Таблицы 6-62 и 6-63)
    "sword_short": {
        id: "sword_short",
        name: "Sword, Short",
        type: "1h-melee",
        useableBy: ["Dwarf", "Elf", "Shadow Elf", "Fighter", "Halfling", "Mystic", "Thief", "Archer", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Centaur", "Gnome", "Skygnome"],
        cost: "7gp",
        armed: {
            N: { toHit: 0, damage: "1d3" },
            B: { toHit: 0, damage: "1d6" },
            S: { toHit: 2, damage: "1d6+2", acBonus: "-1 vs 1", deflect: 1, special: "Disarm -1" },
            E: { toHit: 4, damage: "1d6+4", acBonus: "-2 vs 2", deflect: 2, range: "-/10/20", special: "Disarm -2" },
            M: { toHit: 6, damage: "1d6+7", acBonus: "-2 vs 3", deflect: 3, range: "-/10/20", special: "Disarm -4" },
            G: { toHit: 8, damage: "1d6+9", acBonus: "-3 vs 4", deflect: 3, range: "10/20/30", special: "Disarm -6" }
        },
        unarmed: {
            N: { toHit: 0, damage: "1d3" },
            B: { toHit: 0, damage: "1d6" },
            S: { toHit: 1, damage: "1d6+2", deflect: 1, special: "Disarm -1" },
            E: { toHit: 2, damage: "1d6+4", deflect: 2, range: "-/10/20", special: "Disarm -2" },
            M: { toHit: 4, damage: "1d4+7", deflect: 3, range: "-/10/20", special: "Disarm -4" },
            G: { toHit: 6, damage: "1d4+9", deflect: 3, range: "10/20/30", special: "Disarm -6" }
        }
    },

    // 2. SWORD, TWO-HANDED (Таблицы 6-64 и 6-65)
    "sword_two_handed": {
        id: "sword_two_handed",
        name: "Sword, Two-Handed",
        type: "2h-melee",
        useableBy: ["Elf", "Shadow Elf", "Fighter", "Mystic", "Archer", "Battlecaster", "Bounty Hunter", "Beastmaster", "Centaur"],
        cost: "15gp",
        armed: {
            N: { toHit: 0, damage: "1d5" },
            B: { toHit: 0, damage: "1d10" },
            S: { toHit: 1, damage: "2d6+1", deflect: 1, special: "Stun" },
            E: { toHit: 2, damage: "2d8+2", deflect: 2, special: "Stun" },
            M: { toHit: 4, damage: "2d8+3", deflect: 2, special: "Stun" },
            G: { toHit: 6, damage: "3d6+2", deflect: 3, special: "Stun" }
        },
        unarmed: {
            N: { toHit: 0, damage: "1d5" },
            B: { toHit: 0, damage: "1d10" },
            S: { toHit: 2, damage: "2d6+1", deflect: 1, special: "Stun" },
            E: { toHit: 4, damage: "2d8+2", deflect: 2, special: "Stun" },
            M: { toHit: 6, damage: "3d6+3", deflect: 2, special: "Stun" },
            G: { toHit: 8, damage: "3d6+6", deflect: 3, special: "Stun" }
        }
    },

    // 3. TRIDENT (Таблицы 6-66 и 6-67)
    "trident": {
        id: "trident",
        name: "Trident",
        type: "1h-melee",
        useableBy: ["Dwarf", "Elf", "Shadow Elf", "Fighter", "Mystic", "Thief", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Centaur"],
        cost: "5gp",
        armed: {
            N: { toHit: 0, damage: "1d3", range: "10/20/30" },
            B: { toHit: 0, damage: "1d6", range: "10/20/30" },
            S: { toHit: 1, damage: "1d8+1", range: "10/20/30", special: "Skewer 4HD" },
            E: { toHit: 2, damage: "1d8+4", range: "20/30/45", special: "Skewer 7HD" },
            M: { toHit: 4, damage: "1d6+6", range: "20/30/45", special: "Skewer 10HD" },
            G: { toHit: 6, damage: "1d4+8", range: "30/45/60", special: "Skewer 15HD" }
        },
        unarmed: {
            N: { toHit: 0, damage: "1d3", range: "10/20/30" },
            B: { toHit: 0, damage: "1d6", range: "10/20/30" },
            S: { toHit: 2, damage: "1d8+1", range: "10/20/30", special: "Skewer 4HD" },
            E: { toHit: 4, damage: "1d8+4", range: "20/30/45", special: "Skewer 7HD" },
            M: { toHit: 6, damage: "1d8+6", range: "20/30/45", special: "Skewer 10HD" },
            G: { toHit: 8, damage: "1d6+9", range: "30/45/60", special: "Skewer 15HD" }
        }
    },

    // 1. UNARMED STRIKES (Таблицы 6-68 и 6-69)
    "unarmed_strikes": {
        id: "unarmed_strikes",
        name: "Unarmed Strikes",
        type: "1h-melee",
        useableBy: ["Cleric", "Druid", "Dwarf", "Elf", "Shadow Elf", "Fighter", "Halfling", "Magic-User", "Mystic", "Thief", "Archer", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Witch", "Centaur", "Gnome", "Skygnome"],
        cost: "0gp",
        armed: {
            N: { toHit: 0, damage: "1" },
            B: { toHit: 0, damage: "1", special: "Knockout +0" },
            S: { toHit: 2, damage: "1d3", special: "Knockout +0" },
            E: { toHit: 4, damage: "1d4+1", special: "Knockout -1, Off-Hand" },
            M: { toHit: 6, damage: "2d4", special: "Knockout -3, Off-Hand" },
            G: { toHit: 8, damage: "3d4", special: "Knockout -5, Off-Hand" }
        },
        unarmed: {
            N: { toHit: 0, damage: "1" },
            B: { toHit: 0, damage: "1", special: "Knockout +0" },
            S: { toHit: 1, damage: "1d3", special: "Knockout +0" },
            E: { toHit: 2, damage: "1d4+1", special: "Knockout -1, Off-Hand" },
            M: { toHit: 4, damage: "1d4+1", special: "Knockout -3, Off-Hand" },
            G: { toHit: 6, damage: "2d4+1", special: "Knockout -5, Off-Hand" }
        }
    },

    // 2. WHIP (Таблицы 6-70 и 6-71)
    "whip": {
        id: "whip",
        name: "Whip",
        type: "1h-melee",
        useableBy: ["Dwarf", "Elf", "Shadow Elf", "Fighter", "Magic-User", "Mystic", "Thief", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Witch", "Centaur"],
        cost: "10gp",
        armed: {
            N: { toHit: 0, damage: "1" },
            B: { toHit: 0, damage: "1d2", special: "Entangle +0" },
            S: { toHit: 1, damage: "1d4", special: "Entangle -1" },
            E: { toHit: 2, damage: "1d4+1", special: "Entangle -2" },
            M: { toHit: 4, damage: "1d3+2", special: "Entangle -3" },
            G: { toHit: 6, damage: "1d3+3", special: "Entangle -4" }
        },
        unarmed: {
            N: { toHit: 0, damage: "1" },
            B: { toHit: 0, damage: "1d2", special: "Entangle +0" },
            S: { toHit: 2, damage: "1d4", acBonus: "-2 vs 2", special: "Entangle -1" },
            E: { toHit: 4, damage: "1d4+1", acBonus: "-3 vs 3", special: "Entangle -2" },
            M: { toHit: 6, damage: "1d4+3", acBonus: "-4 vs 3", special: "Entangle -3" },
            G: { toHit: 8, damage: "1d4+5", acBonus: "-4 vs 4", special: "Entangle -4" }
        }
    },

    // ---- Mystara Extra Rules Compendium weapons ----
    "flail_one_handed": {
        id: "flail_one_handed",
        name: "Flail, One-Handed",
        type: "1h-melee",
        useableBy: ["Cleric", "Dwarf", "Elf", "Shadow Elf", "Fighter", "Mystic", "Thief", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Centaur"],
        cost: "5gp",
        weight: 40,
        source: "Mystara Extra Rules Compendium",
        armed: {
            N: {toHit: 0, damage: "1d3"},
            B: {toHit: 0, damage: "1d6"},
            S: {toHit: 2, damage: "1d6+2", acBonus: "-1 vs 1", deflect: 1},
            E: {toHit: 4, damage: "1d8+2", acBonus: "-1 vs 2", deflect: 2},
            M: {toHit: 6, damage: "1d8+4", acBonus: "-2 vs 2", deflect: 3},
            G: {toHit: 8, damage: "2d6+5", acBonus: "-2 vs 3", deflect: 4}
        },
        unarmed: {
            N: {toHit: 0, damage: "1d3"},
            B: {toHit: 0, damage: "1d6"},
            S: {toHit: 1, damage: "1d6+2", deflect: 1},
            E: {toHit: 2, damage: "1d8+2", deflect: 2},
            M: {toHit: 4, damage: "1d6+3", deflect: 3},
            G: {toHit: 6, damage: "1d8+4", deflect: 4}
        }
    },
    "flail_two_handed": {
        id: "flail_two_handed",
        name: "Flail, Two-Handed",
        type: "2h-melee",
        useableBy: ["Cleric", "Dwarf", "Elf", "Shadow Elf", "Fighter", "Mystic", "Battlecaster", "Bounty Hunter", "Beastmaster", "Centaur"],
        cost: "13gp",
        weight: 65,
        source: "Mystara Extra Rules Compendium",
        armed: {
            N: {toHit: 0, damage: "1d4"},
            B: {toHit: 0, damage: "1d8+1"},
            S: {toHit: 2, damage: "1d8+4", acBonus: "-1 vs 1", deflect: 1, special: "Stun"},
            E: {toHit: 4, damage: "2d6+4", acBonus: "-1 vs 2", deflect: 2, special: "Stun"},
            M: {toHit: 6, damage: "3d4+5", acBonus: "-2 vs 2", deflect: 3, special: "Stun"},
            G: {toHit: 8, damage: "2d8+7", acBonus: "-3 vs 2", deflect: 4, special: "Stun"}
        },
        unarmed: {
            N: {toHit: 0, damage: "1d4"},
            B: {toHit: 0, damage: "1d8+1"},
            S: {toHit: 1, damage: "1d8+4", deflect: 1, special: "Stun"},
            E: {toHit: 2, damage: "2d6+4", deflect: 2, special: "Stun"},
            M: {toHit: 4, damage: "2d6+5", deflect: 3, special: "Stun"},
            G: {toHit: 6, damage: "1d10+6", deflect: 4, special: "Stun"}
        }
    },
    "morningstar": {
        id: "morningstar",
        name: "Morningstar",
        type: "1h-melee",
        useableBy: ["Cleric", "Dwarf", "Elf", "Shadow Elf", "Fighter", "Mystic", "Thief", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Centaur"],
        cost: "5gp",
        weight: 30,
        source: "Mystara Extra Rules Compendium",
        armed: {
            N: {toHit: 0, damage: "1d3"},
            B: {toHit: 0, damage: "1d6+1"},
            S: {toHit: 2, damage: "1d8", acBonus: "-1 vs 1", special: "Stun, Disarm +0"},
            E: {toHit: 4, damage: "1d8+4", acBonus: "-1 vs 2", special: "Stun, Disarm -1"},
            M: {toHit: 6, damage: "2d6+4", acBonus: "-1 vs 3", special: "Stun, Disarm -2"},
            G: {toHit: 8, damage: "2d8+4", acBonus: "-1 vs 4", special: "Stun, Disarm -3"}
        },
        unarmed: {
            N: {toHit: 0, damage: "1d3"},
            B: {toHit: 0, damage: "1d6+1"},
            S: {toHit: 1, damage: "1d8", special: "Stun, Disarm +0"},
            E: {toHit: 2, damage: "1d8+4", special: "Stun, Disarm -1"},
            M: {toHit: 4, damage: "2d4+4", special: "Stun, Disarm -2"},
            G: {toHit: 6, damage: "2d6+4", special: "Stun, Disarm -3"}
        }
    },
    "crossbow_slingshot": {
        id: "crossbow_slingshot",
        name: "Slingshot Crossbow",
        type: "missile",
        useableBy: ["Cleric", "Dwarf", "Elf", "Shadow Elf", "Fighter", "Halfling", "Mystic", "Thief", "Archer", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Centaur", "Gnome", "Skygnome"],
        cost: "30gp",
        weight: 50,
        source: "Mystara Extra Rules Compendium",
        armed: {
            N: {toHit: -1, damage: "1d2", range: "60/120/180"},
            B: {toHit: 0, damage: "1d4", range: "60/120/180"},
            S: {toHit: 1, damage: "1d4+2", range: "60/120/180", special: "Stun (s/m)"},
            E: {toHit: 2, damage: "1d4+4", range: "75/130/180", special: "Stun (s/m)"},
            M: {toHit: 4, damage: "2d4+2", range: "75/130/180", special: "Stun (s/m)"},
            G: {toHit: 6, damage: "3d4+1", range: "90/140/180", special: "Stun (s/m)"}
        },
        unarmed: {
            N: {toHit: -1, damage: "1d2", range: "60/120/180"},
            B: {toHit: 0, damage: "1d4", range: "60/120/180"},
            S: {toHit: 2, damage: "1d4+2", acBonus: "-1 vs 1", range: "60/120/180", special: "Stun (s/m)"},
            E: {toHit: 4, damage: "1d4+4", acBonus: "-2 vs 2", range: "75/130/180", special: "Stun (s/m)"},
            M: {toHit: 6, damage: "1d6+6", acBonus: "-3 vs 2", range: "75/130/180", special: "Stun (s/m)"},
            G: {toHit: 8, damage: "1d4+7", acBonus: "-3 vs 3", range: "90/140/180", special: "Stun (s/m)"}
        }
    },
    "staff_sling": {
        id: "staff_sling",
        name: "Staff Sling",
        type: "missile",
        useableBy: ["Cleric", "Dwarf", "Elf", "Shadow Elf", "Fighter", "Magic-User", "Mystic", "Thief", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Witch", "Centaur"],
        cost: "7gp",
        weight: 60,
        source: "Mystara Extra Rules Compendium",
        armed: {
            N: {toHit: -1, damage: "1d3", range: "50/100/150"},
            B: {toHit: 0, damage: "1d6", range: "50/100/150"},
            S: {toHit: 2, damage: "1d8", acBonus: "-1 vs 2", range: "60/110/160", special: "Stun (s/m)"},
            E: {toHit: 4, damage: "2d6", acBonus: "-2 vs 3", range: "80/130/170", special: "Stun (s/m)"},
            M: {toHit: 6, damage: "2d8", acBonus: "-3 vs 3", range: "90/130/180", special: "Stun (s/m)"},
            G: {toHit: 8, damage: "3d6", acBonus: "-4 vs 4", range: "110/140/190", special: "Stun (s/m)"}
        },
        unarmed: {
            N: {toHit: -1, damage: "1d3", range: "50/100/150"},
            B: {toHit: 0, damage: "1d6", range: "50/100/150"},
            S: {toHit: 1, damage: "1d8", range: "60/110/160", special: "Stun (s/m)"},
            E: {toHit: 2, damage: "2d6", range: "80/130/170", special: "Stun (s/m)"},
            M: {toHit: 4, damage: "1d10+4", range: "90/130/180", special: "Stun (s/m)"},
            G: {toHit: 6, damage: "1d12+4", range: "110/140/190", special: "Stun (s/m)"}
        }
    },
    "garotte": {
        id: "garotte",
        name: "Garotte",
        type: "2h-melee",
        useableBy: ["Dwarf", "Elf", "Shadow Elf", "Fighter", "Mystic", "Thief", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Centaur"],
        cost: "1gp",
        weight: 3,
        source: "Mystara Extra Rules Compendium",
        armed: {
            N: {toHit: -1, damage: "1d2", special: "Strangle 20"},
            B: {toHit: 0, damage: "1d4", special: "Stun, Strangle 20"},
            S: {toHit: 1, damage: "1d4+1", special: "Stun, Strangle 19 (-1)"},
            E: {toHit: 2, damage: "1d6", special: "Stun, Strangle 18 (-2)"},
            M: {toHit: 4, damage: "1d6+1", special: "Stun, Strangle 17 (-3)"},
            G: {toHit: 6, damage: "2d4", special: "Stun, Strangle 16 (-4)"}
        },
        unarmed: {
            N: {toHit: -1, damage: "1d2", special: "Strangle 20"},
            B: {toHit: 0, damage: "1d4", special: "Stun, Strangle 20"},
            S: {toHit: 2, damage: "1d4+1", special: "Stun, Strangle 19 (-1)"},
            E: {toHit: 4, damage: "1d6", special: "Stun, Strangle 18 (-2)"},
            M: {toHit: 6, damage: "1d6+1", special: "Stun, Strangle 17 (-3)"},
            G: {toHit: 8, damage: "2d4", special: "Stun, Strangle 16 (-4)"}
        }
    },
    "bardiche": {
        id: "bardiche",
        name: "Bardiche",
        type: "2h-melee",
        useableBy: ["Elf", "Shadow Elf", "Fighter", "Mystic", "Battlecaster", "Bounty Hunter", "Beastmaster", "Centaur"],
        cost: "7gp",
        weight: 150,
        source: "Mystara Extra Rules Compendium",
        armed: {
            N: {toHit: 0, damage: "1d5"},
            B: {toHit: 0, damage: "1d10", special: "Set, Hook +0, Disarm +0"},
            S: {toHit: 2, damage: "1d10+3", acBonus: "-1 vs 1", deflect: 1, special: "Set, Hook -1, Disarm +0"},
            E: {toHit: 4, damage: "1d10+5", acBonus: "-2 vs 1", deflect: 1, special: "Set, Hook -2, Disarm +0"},
            M: {toHit: 6, damage: "1d8+10", acBonus: "-2 vs 2", deflect: 2, special: "Set, Hook -3, Disarm +0"},
            G: {toHit: 8, damage: "1d6+15", acBonus: "-3 vs 2", deflect: 2, special: "Set, Hook -4, Disarm +0"}
        },
        unarmed: {
            N: {toHit: 0, damage: "1d5"},
            B: {toHit: 0, damage: "1d10", special: "Set, Hook +0, Disarm +0"},
            S: {toHit: 1, damage: "1d10+3", deflect: 1, special: "Set, Hook -1, Disarm +0"},
            E: {toHit: 2, damage: "1d10+5", deflect: 1, special: "Set, Hook -2, Disarm +0"},
            M: {toHit: 4, damage: "1d8+8", deflect: 2, special: "Set, Hook -3, Disarm +0"},
            G: {toHit: 6, damage: "1d6+12", deflect: 2, special: "Set, Hook -4, Disarm +0"}
        }
    },
    "bill": {
        id: "bill",
        name: "Bill",
        type: "2h-melee",
        useableBy: ["Elf", "Shadow Elf", "Fighter", "Mystic", "Battlecaster", "Bounty Hunter", "Beastmaster", "Centaur"],
        cost: "7gp",
        weight: 150,
        source: "Mystara Extra Rules Compendium",
        armed: {
            N: {toHit: 0, damage: "1d5"},
            B: {toHit: 0, damage: "1d10", special: "Hook +0"},
            S: {toHit: 2, damage: "1d10+3", acBonus: "-1 vs 1", deflect: 1, special: "Hook -1"},
            E: {toHit: 4, damage: "1d10+6", acBonus: "-2 vs 1", deflect: 1, special: "Hook -2"},
            M: {toHit: 6, damage: "1d10+10", acBonus: "-2 vs 2", deflect: 2, special: "Hook -3"},
            G: {toHit: 8, damage: "1d8+16", acBonus: "-3 vs 2", deflect: 2, special: "Hook -4"}
        },
        unarmed: {
            N: {toHit: 0, damage: "1d5"},
            B: {toHit: 0, damage: "1d10", special: "Hook +0"},
            S: {toHit: 1, damage: "1d10+3", deflect: 1, special: "Hook -1"},
            E: {toHit: 2, damage: "1d10+6", deflect: 1, special: "Hook -2"},
            M: {toHit: 4, damage: "1d10+8", deflect: 2, special: "Hook -3"},
            G: {toHit: 6, damage: "1d8+12", deflect: 2, special: "Hook -4"}
        }
    },
    "gisarme": {
        id: "gisarme",
        name: "Gisarme",
        type: "2h-melee",
        useableBy: ["Elf", "Shadow Elf", "Fighter", "Mystic", "Battlecaster", "Bounty Hunter", "Beastmaster", "Centaur"],
        cost: "7gp",
        weight: 150,
        source: "Mystara Extra Rules Compendium",
        armed: {
            N: {toHit: 0, damage: "1d5"},
            B: {toHit: 0, damage: "1d10", special: "Set, Hook +0"},
            S: {toHit: 2, damage: "1d12+2", acBonus: "-2 vs 1", deflect: 1, special: "Set, Hook -1"},
            E: {toHit: 4, damage: "1d12+5", acBonus: "-2 vs 2", deflect: 1, special: "Set, Hook -2"},
            M: {toHit: 6, damage: "1d12+9", acBonus: "-3 vs 2", deflect: 2, special: "Set, Hook -3"},
            G: {toHit: 8, damage: "1d10+14", acBonus: "-3 vs 3", deflect: 2, special: "Set, Hook -4"}
        },
        unarmed: {
            N: {toHit: 0, damage: "1d5"},
            B: {toHit: 0, damage: "1d10", special: "Set, Hook +0"},
            S: {toHit: 1, damage: "1d12+2", deflect: 1, special: "Set, Hook -1"},
            E: {toHit: 2, damage: "1d12+5", deflect: 1, special: "Set, Hook -2"},
            M: {toHit: 4, damage: "1d10+8", deflect: 2, special: "Set, Hook -3"},
            G: {toHit: 6, damage: "1d8+10", deflect: 2, special: "Set, Hook -4"}
        }
    },
    "glaive": {
        id: "glaive",
        name: "Glaive",
        type: "2h-melee",
        useableBy: ["Elf", "Shadow Elf", "Fighter", "Mystic", "Battlecaster", "Bounty Hunter", "Beastmaster", "Centaur"],
        cost: "7gp",
        weight: 150,
        source: "Mystara Extra Rules Compendium",
        armed: {
            N: {toHit: 0, damage: "1d5"},
            B: {toHit: 0, damage: "1d10", special: "Set"},
            S: {toHit: 2, damage: "1d10+3", acBonus: "-1 vs 1", deflect: 1, special: "Set, Double Damage (20)"},
            E: {toHit: 4, damage: "1d10+6", acBonus: "-2 vs 1", deflect: 1, special: "Set, Double Damage (19)"},
            M: {toHit: 6, damage: "1d10+10", acBonus: "-2 vs 2", deflect: 2, special: "Set, Double Damage (18)"},
            G: {toHit: 8, damage: "1d8+16", acBonus: "-3 vs 2", deflect: 2, special: "Set, Double Damage (17)"}
        },
        unarmed: {
            N: {toHit: 0, damage: "1d5"},
            B: {toHit: 0, damage: "1d10", special: "Set"},
            S: {toHit: 1, damage: "1d10+3", deflect: 1, special: "Set, Double Damage (20)"},
            E: {toHit: 2, damage: "1d10+6", deflect: 1, special: "Set, Double Damage (19)"},
            M: {toHit: 4, damage: "1d10+8", deflect: 2, special: "Set, Double Damage (18)"},
            G: {toHit: 6, damage: "1d8+12", deflect: 2, special: "Set, Double Damage (17)"}
        }
    },
    "lochaber_axe": {
        id: "lochaber_axe",
        name: "Lochaber Axe",
        type: "2h-melee",
        useableBy: ["Elf", "Shadow Elf", "Fighter", "Mystic", "Battlecaster", "Bounty Hunter", "Beastmaster", "Centaur"],
        cost: "7gp",
        weight: 150,
        source: "Mystara Extra Rules Compendium",
        armed: {
            N: {toHit: 0, damage: "1d5"},
            B: {toHit: 0, damage: "1d10", special: "Hook +0, Disarm +0"},
            S: {toHit: 2, damage: "1d10+3", acBonus: "-1 vs 1", special: "Hook -1, Disarm +0"},
            E: {toHit: 4, damage: "1d10+5", acBonus: "-2 vs 1", deflect: 1, special: "Hook -2, Disarm +0"},
            M: {toHit: 6, damage: "1d8+10", acBonus: "-2 vs 2", deflect: 1, special: "Stun, Hook -3, Disarm +0"},
            G: {toHit: 8, damage: "1d6+15", acBonus: "-3 vs 2", deflect: 2, special: "Stun, Hook -4, Disarm +0"}
        },
        unarmed: {
            N: {toHit: 0, damage: "1d5"},
            B: {toHit: 0, damage: "1d10", special: "Hook +0, Disarm +0"},
            S: {toHit: 1, damage: "1d10+3", special: "Hook -1, Disarm +0"},
            E: {toHit: 2, damage: "1d10+5", deflect: 1, special: "Hook -2, Disarm +0"},
            M: {toHit: 4, damage: "1d8+8", deflect: 1, special: "Stun, Hook -3, Disarm +0"},
            G: {toHit: 6, damage: "1d6+12", deflect: 2, special: "Stun, Hook -4, Disarm +0"}
        }
    },
    "partizan": {
        id: "partizan",
        name: "Partizan",
        type: "2h-melee",
        useableBy: ["Elf", "Shadow Elf", "Fighter", "Mystic", "Battlecaster", "Bounty Hunter", "Beastmaster", "Centaur"],
        cost: "7gp",
        weight: 150,
        source: "Mystara Extra Rules Compendium",
        armed: {
            N: {toHit: 0, damage: "1d5"},
            B: {toHit: 0, damage: "1d10", special: "Set, Disarm +0"},
            S: {toHit: 2, damage: "1d12+2", acBonus: "-2 vs 1", deflect: 1, special: "Set, Disarm +0"},
            E: {toHit: 4, damage: "1d12+5", acBonus: "-2 vs 2", deflect: 1, special: "Set, Disarm +0"},
            M: {toHit: 6, damage: "1d12+9", acBonus: "-3 vs 2", deflect: 2, special: "Set, Disarm +0"},
            G: {toHit: 8, damage: "1d10+14", acBonus: "-3 vs 3", deflect: 2, special: "Set, Disarm +0"}
        },
        unarmed: {
            N: {toHit: 0, damage: "1d5"},
            B: {toHit: 0, damage: "1d10", special: "Set, Disarm +0"},
            S: {toHit: 1, damage: "1d12+2", deflect: 1, special: "Set, Disarm +0"},
            E: {toHit: 2, damage: "1d12+5", deflect: 1, special: "Set, Disarm +0"},
            M: {toHit: 4, damage: "1d10+8", deflect: 2, special: "Set, Disarm +0"},
            G: {toHit: 6, damage: "1d8+10", deflect: 2, special: "Set, Disarm +0"}
        }
    },
    "ranseur": {
        id: "ranseur",
        name: "Ranseur",
        type: "2h-melee",
        useableBy: ["Elf", "Shadow Elf", "Fighter", "Mystic", "Battlecaster", "Bounty Hunter", "Beastmaster", "Centaur"],
        cost: "7gp",
        weight: 150,
        source: "Mystara Extra Rules Compendium",
        armed: {
            N: {toHit: 0, damage: "1d5"},
            B: {toHit: 0, damage: "1d10", special: "Set, Hook +0"},
            S: {toHit: 2, damage: "1d10+3", acBonus: "-1 vs 1", special: "Set, Hook -1, Disarm +0"},
            E: {toHit: 4, damage: "1d10+5", acBonus: "-2 vs 1", deflect: 1, special: "Set, Hook -2, Disarm +0"},
            M: {toHit: 6, damage: "1d8+10", acBonus: "-2 vs 2", deflect: 1, special: "Set, Hook -3, Disarm +0"},
            G: {toHit: 8, damage: "1d6+15", acBonus: "-3 vs 2", deflect: 2, special: "Set, Hook -4, Disarm +0"}
        },
        unarmed: {
            N: {toHit: 0, damage: "1d5"},
            B: {toHit: 0, damage: "1d10", special: "Set, Hook +0"},
            S: {toHit: 1, damage: "1d10+3", special: "Set, Hook -1, Disarm +0"},
            E: {toHit: 2, damage: "1d10+5", deflect: 1, special: "Set, Hook -2, Disarm +0"},
            M: {toHit: 4, damage: "1d8+8", deflect: 1, special: "Set, Hook -3, Disarm +0"},
            G: {toHit: 6, damage: "1d6+12", deflect: 2, special: "Set, Hook -4, Disarm +0"}
        }
    },
    "spetum": {
        id: "spetum",
        name: "Spetum",
        type: "2h-melee",
        useableBy: ["Elf", "Shadow Elf", "Fighter", "Mystic", "Battlecaster", "Bounty Hunter", "Beastmaster", "Centaur"],
        cost: "7gp",
        weight: 150,
        source: "Mystara Extra Rules Compendium",
        armed: {
            N: {toHit: 0, damage: "1d5"},
            B: {toHit: 0, damage: "1d10", special: "Set"},
            S: {toHit: 2, damage: "1d12+2", acBonus: "-2 vs 1", deflect: 1, special: "Set, Disarm +0"},
            E: {toHit: 4, damage: "1d12+5", acBonus: "-2 vs 2", deflect: 1, special: "Set, Disarm +0"},
            M: {toHit: 6, damage: "1d12+9", acBonus: "-3 vs 2", deflect: 2, special: "Set, Disarm +0"},
            G: {toHit: 8, damage: "1d10+14", acBonus: "-3 vs 3", deflect: 2, special: "Set, Disarm +0"}
        },
        unarmed: {
            N: {toHit: 0, damage: "1d5"},
            B: {toHit: 0, damage: "1d10", special: "Set"},
            S: {toHit: 1, damage: "1d12+2", deflect: 1, special: "Set, Disarm +0"},
            E: {toHit: 2, damage: "1d12+5", deflect: 1, special: "Set, Disarm +0"},
            M: {toHit: 4, damage: "1d10+8", deflect: 2, special: "Set, Disarm +0"},
            G: {toHit: 6, damage: "1d8+10", deflect: 2, special: "Set, Disarm +0"}
        }
    },
    "spontoon": {
        id: "spontoon",
        name: "Spontoon",
        type: "2h-melee",
        useableBy: ["Elf", "Shadow Elf", "Fighter", "Mystic", "Battlecaster", "Bounty Hunter", "Beastmaster", "Centaur"],
        cost: "7gp",
        weight: 150,
        source: "Mystara Extra Rules Compendium",
        armed: {
            N: {toHit: 0, damage: "1d3"},
            B: {toHit: 0, damage: "1d6", special: "Set"},
            S: {toHit: 2, damage: "1d6+2", special: "Set, Double Damage (20)"},
            E: {toHit: 4, damage: "2d4+2", deflect: 1, special: "Set, Stun, Double Damage (19)"},
            M: {toHit: 6, damage: "2d4+4", deflect: 1, special: "Set, Stun, Double Damage (18)"},
            G: {toHit: 8, damage: "2d4+6", deflect: 2, special: "Set, Stun, Double Damage (17)"}
        },
        unarmed: {
            N: {toHit: 0, damage: "1d3"},
            B: {toHit: 0, damage: "1d6", special: "Set"},
            S: {toHit: 2, damage: "1d6+2", special: "Set, Double Damage (20)"},
            E: {toHit: 4, damage: "2d4+2", deflect: 1, special: "Set, Stun, Double Damage (19)"},
            M: {toHit: 6, damage: "2d4+4", deflect: 1, special: "Set, Stun, Double Damage (18)"},
            G: {toHit: 8, damage: "2d4+6", deflect: 2, special: "Set, Stun, Double Damage (17)"}
        }
    },
    "voulge": {
        id: "voulge",
        name: "Voulge",
        type: "2h-melee",
        useableBy: ["Elf", "Shadow Elf", "Fighter", "Mystic", "Battlecaster", "Bounty Hunter", "Beastmaster", "Centaur"],
        cost: "7gp",
        weight: 150,
        source: "Mystara Extra Rules Compendium",
        armed: {
            N: {toHit: 0, damage: "1d5+1"},
            B: {toHit: 0, damage: "1d10+2"},
            S: {toHit: 2, damage: "1d10+5", acBonus: "-1 vs 1", special: "Double Damage (20)"},
            E: {toHit: 4, damage: "1d10+8", acBonus: "-2 vs 1", deflect: 1, special: "Double Damage (19)"},
            M: {toHit: 6, damage: "1d10+12", acBonus: "-2 vs 2", deflect: 1, special: "Double Damage (18)"},
            G: {toHit: 8, damage: "1d8+18", acBonus: "-3 vs 2", deflect: 2, special: "Double Damage (17)"}
        },
        unarmed: {
            N: {toHit: 0, damage: "1d5+1"},
            B: {toHit: 0, damage: "1d10+2"},
            S: {toHit: 1, damage: "1d10+5", special: "Double Damage (20)"},
            E: {toHit: 2, damage: "1d10+8", deflect: 1, special: "Double Damage (19)"},
            M: {toHit: 4, damage: "1d10+10", deflect: 1, special: "Double Damage (18)"},
            G: {toHit: 6, damage: "1d8+14", deflect: 2, special: "Double Damage (17)"}
        }
    },
    "oil_burning": {
        id: "oil_burning",
        name: "Burning Oil (thrown)",
        type: "missile",
        useableBy: ["Cleric", "Dwarf", "Elf", "Shadow Elf", "Fighter", "Halfling", "Magic-User", "Mystic", "Thief", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Witch", "Centaur", "Gnome", "Skygnome"],
        cost: "2gp",
        weight: 10,
        source: "Mystara Extra Rules Compendium (improvised: proficiency does not apply)",
        armed: {
            N: {toHit: 0, damage: "1d8", range: "10/30/50", special: "Ignites 5%/pt dmg; burns 1d4/rnd for 1d6 rnds; splash 1d4 within 5'"},
            B: {toHit: 0, damage: "1d8", range: "10/30/50", special: "Ignites 5%/pt dmg; burns 1d4/rnd for 1d6 rnds; splash 1d4 within 5'"},
            S: {toHit: 0, damage: "1d8", range: "10/30/50", special: "Ignites 5%/pt dmg; burns 1d4/rnd for 1d6 rnds; splash 1d4 within 5'"},
            E: {toHit: 0, damage: "1d8", range: "10/30/50", special: "Ignites 5%/pt dmg; burns 1d4/rnd for 1d6 rnds; splash 1d4 within 5'"},
            M: {toHit: 0, damage: "1d8", range: "10/30/50", special: "Ignites 5%/pt dmg; burns 1d4/rnd for 1d6 rnds; splash 1d4 within 5'"},
            G: {toHit: 0, damage: "1d8", range: "10/30/50", special: "Ignites 5%/pt dmg; burns 1d4/rnd for 1d6 rnds; splash 1d4 within 5'"}
        },
        unarmed: {
            N: {toHit: 0, damage: "1d8", range: "10/30/50", special: "Ignites 5%/pt dmg; burns 1d4/rnd for 1d6 rnds; splash 1d4 within 5'"},
            B: {toHit: 0, damage: "1d8", range: "10/30/50", special: "Ignites 5%/pt dmg; burns 1d4/rnd for 1d6 rnds; splash 1d4 within 5'"},
            S: {toHit: 0, damage: "1d8", range: "10/30/50", special: "Ignites 5%/pt dmg; burns 1d4/rnd for 1d6 rnds; splash 1d4 within 5'"},
            E: {toHit: 0, damage: "1d8", range: "10/30/50", special: "Ignites 5%/pt dmg; burns 1d4/rnd for 1d6 rnds; splash 1d4 within 5'"},
            M: {toHit: 0, damage: "1d8", range: "10/30/50", special: "Ignites 5%/pt dmg; burns 1d4/rnd for 1d6 rnds; splash 1d4 within 5'"},
            G: {toHit: 0, damage: "1d8", range: "10/30/50", special: "Ignites 5%/pt dmg; burns 1d4/rnd for 1d6 rnds; splash 1d4 within 5'"}
        }
    },
    "holy_water": {
        id: "holy_water",
        name: "Holy Water (thrown)",
        type: "missile",
        useableBy: ["Cleric", "Dwarf", "Elf", "Shadow Elf", "Fighter", "Halfling", "Magic-User", "Mystic", "Thief", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Witch", "Centaur", "Gnome", "Skygnome"],
        cost: "25gp",
        weight: 1,
        source: "Mystara Extra Rules Compendium (improvised: proficiency does not apply)",
        armed: {
            N: {toHit: 0, damage: "1d8", range: "10/30/50", special: "Undead only"},
            B: {toHit: 0, damage: "1d8", range: "10/30/50", special: "Undead only"},
            S: {toHit: 0, damage: "1d8", range: "10/30/50", special: "Undead only"},
            E: {toHit: 0, damage: "1d8", range: "10/30/50", special: "Undead only"},
            M: {toHit: 0, damage: "1d8", range: "10/30/50", special: "Undead only"},
            G: {toHit: 0, damage: "1d8", range: "10/30/50", special: "Undead only"}
        },
        unarmed: {
            N: {toHit: 0, damage: "1d8", range: "10/30/50", special: "Undead only"},
            B: {toHit: 0, damage: "1d8", range: "10/30/50", special: "Undead only"},
            S: {toHit: 0, damage: "1d8", range: "10/30/50", special: "Undead only"},
            E: {toHit: 0, damage: "1d8", range: "10/30/50", special: "Undead only"},
            M: {toHit: 0, damage: "1d8", range: "10/30/50", special: "Undead only"},
            G: {toHit: 0, damage: "1d8", range: "10/30/50", special: "Undead only"}
        }
    },
    "rock_thrown": {
        id: "rock_thrown",
        name: "Rock (thrown)",
        type: "missile",
        useableBy: ["Cleric", "Dwarf", "Elf", "Shadow Elf", "Fighter", "Halfling", "Magic-User", "Mystic", "Thief", "Bandit", "Battlecaster", "Bounty Hunter", "Beastmaster", "Rake", "Witch", "Centaur", "Gnome", "Skygnome"],
        cost: "1sp",
        weight: 10,
        source: "Mystara Extra Rules Compendium (improvised: proficiency does not apply)",
        armed: {
            N: {toHit: 0, damage: "1d3", range: "10/30/50", special: "Stun (s)"},
            B: {toHit: 0, damage: "1d3", range: "10/30/50", special: "Stun (s)"},
            S: {toHit: 0, damage: "1d3", range: "10/30/50", special: "Stun (s)"},
            E: {toHit: 0, damage: "1d3", range: "10/30/50", special: "Stun (s)"},
            M: {toHit: 0, damage: "1d3", range: "10/30/50", special: "Stun (s)"},
            G: {toHit: 0, damage: "1d3", range: "10/30/50", special: "Stun (s)"}
        },
        unarmed: {
            N: {toHit: 0, damage: "1d3", range: "10/30/50", special: "Stun (s)"},
            B: {toHit: 0, damage: "1d3", range: "10/30/50", special: "Stun (s)"},
            S: {toHit: 0, damage: "1d3", range: "10/30/50", special: "Stun (s)"},
            E: {toHit: 0, damage: "1d3", range: "10/30/50", special: "Stun (s)"},
            M: {toHit: 0, damage: "1d3", range: "10/30/50", special: "Stun (s)"},
            G: {toHit: 0, damage: "1d3", range: "10/30/50", special: "Stun (s)"}
        }
    }
};

// PC1 Tall Tales of the Wee Folk: woodland beings borrow a class's weapon list (sized to fit them).
// Hsiao and treants use no weapons, only claws and limbs.
const PC1_WEAPONS_AS: [string, string][] = [
    ["Brownie", "Fighter"], ["Redcap", "Fighter"],          // "no limit ... so long as they are of a suitable size"
    ["Faun", "Fighter"], ["Wood Imp", "Fighter"], ["Leprechaun", "Fighter"], ["Pixie", "Fighter"], ["Pooka", "Fighter"],
    ["Sidhe (Warrior)", "Fighter"], ["Sidhe (Rogue)", "Thief"], ["Woodrake", "Thief"],
    ["Dryad", "Magic-User"], ["Sprite", "Halfling"],
    // PC2 Top Ballista: pegataurs any weapon; harpies melee weapons only (no missiles).
    ["Pegataur", "Fighter"], ["Harpy", "Fighter"],
];
// PC2: races with a short list of their own weapons. Sphinxes and tabi use none.
const PC2_WEAPON_LISTS: Record<string, string[]> = {
    "Faenare": ["sling", "bow_short", "sword_short", "sword_normal", "dagger", "bolas"],
    "Gremlin": ["dagger", "sling"],
    "Nagpa": ["dagger", "sword_short", "axe_hand", "club", "blackjack", "hammer_throwing", "staff", "crossbow_light", "crossbow_heavy", "sling", "bow_short", "bow_long"],
};
Object.values(WeaponsDatabase).forEach(w => {
    if (!Array.isArray(w.useableBy)) return;
    PC1_WEAPONS_AS.forEach(([race, as]) => {
        if (race === "Harpy" && w.type === "missile" && w.id !== "rock_thrown") return;
        if (w.useableBy.includes(as) && !w.useableBy.includes(race)) w.useableBy.push(race);
    });
    Object.entries(PC2_WEAPON_LISTS).forEach(([race, ids]) => {
        if ((ids.includes(w.id) || /^(unarmed|rock)/.test(w.id)) && !w.useableBy.includes(race)) w.useableBy.push(race);
    });
});
