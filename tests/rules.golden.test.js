// tests/rules.golden.test.js
// Golden-value tests for the class tables against Dark Dungeons (Chapter 4 / Chapter 6).
// Run after `npm run build`:   node --test   (discovers tests/*.test.js)
// Uses only Node's built-in test runner — no extra dependencies.

const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const { ClassesDatabase: DB } = require(path.join(__dirname, '..', 'dist', 'data', 'classes.js'));

const savesAt = (cls, level) => {
    const t = DB[cls].saves.find(s => level >= s.minLevel && level <= s.maxLevel);
    assert.ok(t, `${cls} has no save tier for level ${level}`);
    return [t.death, t.wands, t.paralysis, t.breath, t.spells];
};

test('every core class has a save tier for levels 1..36', () => {
    for (const cls of ['Fighter', 'Cleric', 'Magic-User', 'Thief', 'Dwarf', 'Elf', 'Halfling', 'Mystic']) {
        for (let L = 1; L <= 36; L++) savesAt(cls, L);
    }
});

test('saving throws — spot checks (DD Tables 4-2a..4-9)', () => {
    assert.deepEqual(savesAt('Fighter', 3), [11, 12, 13, 14, 15]);   // was 11,12,14,13,15
    assert.deepEqual(savesAt('Fighter', 7), [9, 10, 11, 12, 13]);
    assert.deepEqual(savesAt('Fighter', 20), [5, 5, 6, 6, 7]);
    assert.deepEqual(savesAt('Cleric', 25), [3, 4, 4, 5, 4]);
    assert.deepEqual(savesAt('Cleric', 36), [2, 2, 2, 2, 2]);
    assert.deepEqual(savesAt('Dwarf', 15), [2, 2, 3, 2, 2]);
    assert.deepEqual(savesAt('Halfling', 14), [2, 2, 2, 2, 2]);
    assert.deepEqual(savesAt('Mystic', 1), [12, 13, 14, 15, 16]);    // mystics save as fighters
    assert.deepEqual(savesAt('Mystic', 16), [5, 6, 6, 7, 8]);
    assert.deepEqual(savesAt('Thief', 1), [13, 14, 13, 16, 15]);
});

test('THAC0 = 20 - Base Attack Bonus; no falsy-zero fallback', () => {
    assert.equal(DB.Fighter.thac0[1], 19);
    assert.equal(DB.Fighter.thac0[30], 0);    // regression: `thac0[level] || thac0[36]` returned -3 here
    assert.equal(DB.Fighter.thac0[31], 0);
    assert.equal(DB.Fighter.thac0[36], -3);
    assert.equal(DB['Magic-User'].thac0[4], 19);
    assert.equal(DB['Magic-User'].thac0[36], 5);
    assert.equal(DB.Cleric.thac0[36], 2);
});

test('XP tables — Dwarf does not follow a constant step after 9th', () => {
    assert.equal(DB.Dwarf.xpTable[12], 660000);
    assert.equal(DB.Dwarf.xpTable[13], 800000);   // was 790000
    assert.equal(DB.Dwarf.xpTable[36], 4250000);  // was 3780000
    assert.equal(DB.Elf.xpTable[10], 550000);
    assert.equal(DB.Thief.xpTable[10], 280000);
    assert.equal(DB.Mystic.xpTable[9], 240000);
});

test('spell slots — Cleric and Magic-User/Elf', () => {
    assert.deepEqual(DB.Cleric.spellProgression[1], []);
    assert.deepEqual(DB.Cleric.spellProgression[2], [1]);
    assert.deepEqual(DB.Cleric.spellProgression[22], [7, 6, 5, 5, 5, 4, 4]);  // was [4,5,5,5,5,4,4]
    assert.deepEqual(DB.Cleric.spellProgression[36], [9, 9, 9, 9, 9, 9, 9]);
    assert.deepEqual(DB['Magic-User'].spellProgression[11], [4, 4, 4, 3, 2]);
    assert.deepEqual(DB['Magic-User'].spellProgression[36], [9, 9, 9, 9, 9, 9, 9, 9, 9]);
    assert.deepEqual(DB.Elf.spellProgression, DB['Magic-User'].spellProgression);
});

test('turn undead — level 5 row', () => {
    assert.deepEqual(DB.Cleric.turnMatrix[5].slice(0, 7), ['d', 'd', 't', 't', '7', '9', '11']);
});

test('hit points after 9th level (no Con bonus)', () => {
    const expected = { Fighter: 2, Dwarf: 2, Thief: 2, Mystic: 2, Cleric: 1, 'Magic-User': 1, Elf: 1, Halfling: 1 };
    for (const [cls, hp] of Object.entries(expected)) assert.equal(DB[cls].hpPerLevelAfter9, hp, cls);
});

test('weapon feats — 4 start / martial gains for Fighter & Dwarf, 2 start otherwise', () => {
    assert.equal(DB.Fighter.weaponFeatsProgression.start, 4);
    assert.deepEqual(DB.Fighter.weaponFeatsProgression.gainLevels, [3, 6, 9, 11, 15, 19, 23, 27, 30, 33, 36]);
    assert.equal(DB.Thief.weaponFeatsProgression.start, 2);
    assert.deepEqual(DB.Thief.weaponFeatsProgression.gainLevels, [3, 6, 9, 11, 15, 23, 30, 36]);
});

test('Mystara Extra Rules Compendium classes', () => {
    for (const cls of ['Archer', 'Bandit', 'Battlecaster', 'Beastmaster', 'Bounty Hunter', 'Rake', 'Witch']) {
        assert.ok(DB[cls], `${cls} missing`);
        for (let L = 1; L <= 36; L++) {
            savesAt(cls, L);
            assert.equal(typeof DB[cls].thac0[L], 'number', `${cls} THAC0 L${L}`);
            assert.equal(typeof DB[cls].xpTable[L], 'number', `${cls} XP L${L}`);
        }
    }
    assert.deepEqual(DB.Archer.xpTable, DB['Magic-User'].xpTable);            // XP as a Magic-User
    assert.equal(DB.Archer.hitDie, 6);                                          // HP as a Cleric
    assert.equal(DB.Bandit.xpTable[2], 1800);                                   // Thief x1.5
    assert.equal(DB.Bandit.hpDieBonus, 1);                                      // 1d6+1 per level
    assert.equal(DB.Battlecaster.xpTable[4], 8000);                             // Fighter until 4th...
    assert.equal(DB.Battlecaster.xpTable[5], 20000);                            // ...then Magic-User
    assert.deepEqual(savesAt('Battlecaster', 1), savesAt('Magic-User', 1));     // saves as a Magic-User
    assert.equal(DB.Battlecaster.thac0[12], DB.Fighter.thac0[12]);              // attack as a Fighter
    assert.deepEqual(DB.Beastmaster.xpTable, DB.Elf.xpTable);                   // XP as an Elf
    assert.equal(DB['Bounty Hunter'].hpPerLevelAfter9, 2);                      // HP as a Fighter
    assert.deepEqual(DB.Rake.saves, DB.Thief.saves);
    assert.deepEqual(DB.Witch.spellProgression, DB['Magic-User'].spellProgression);
});

test('Arcane Warrior (Compendium): +1 hp after 9th, Str 10 / Int 13', () => {
    assert.equal(DB['Arcane Warrior'].hpPerLevelAfter9, 1);
    assert.deepEqual(DB['Arcane Warrior'].minScores, { strength: 10, intelligence: 13 });
});

test('Shadow Elf (GAZ13 on the DD elf) and Shadow Shaman (Divine Magic p.151)', () => {
    const se = DB['Shadow Elf'], ss = DB['Shadow Shaman'];
    assert.equal(se.hpPerLevelAfter9, 2);
    assert.deepEqual(se.xpTable, DB.Elf.xpTable);
    assert.equal(se.smashParryLevel, 12);                        // 850,000 XP = DD elf 12th level
    assert.deepEqual(se.multipleAttacksXp, [[850000, 2], [2600000, 3]]);
    assert.equal(DB.Shaman, undefined);
    assert.equal(DB.Wokan, undefined);
    assert.equal(ss.optionOf, 'Shadow Elf');
    assert.equal(ss.fixedDeity, 'Rafiel');
    assert.equal(ss.turnsUndead, undefined);                      // GAZ13: shamans do not turn undead
    assert.equal(ss.hpPerLevelAfter9, se.hpPerLevelAfter9);       // house rule: as a Shadow Elf
    assert.deepEqual(ss.thac0, se.thac0);
    assert.equal(ss.noCombatOptions, undefined);
    assert.equal(ss.weaponsAs, undefined);
    assert.equal(ss.ownXpTrack, true);                            // separate shaman XP bar
    assert.equal(ss.xpTable[2], 2000);                            // Divine Magic Table 4.12
    assert.equal(ss.xpTable[10], 300000);
    assert.equal(ss.xpTable[23], 1925000);                        // +125,000 per level past 22nd
    assert.deepEqual(ss.spellProgression[1], [1]);
    assert.deepEqual(ss.spellProgression[20], [8, 6, 5, 5, 4, 2, 1]);
    assert.deepEqual(ss.spellProgression[36], [8, 8, 7, 6, 5, 3, 2]);   // no more spells after 22nd
});

test('Creature heroes: Gnome (PC2 Table 4) and Centaur (PC1 Table 2)', () => {
    const g = DB.Gnome, c = DB.Centaur;
    assert.deepEqual([...g.xpTable.slice(1, 11)], [2000, 4000, 8000, 16000, 32000, 60000, 120000, 250000, 510000, 810000]);
    assert.deepEqual(g.hitDiceTable[6], [6, 0]);                 // no new Hit Die at 6th
    assert.deepEqual(g.hitDiceTable[10], [8, 4]);                // +2 hp per level after 9th
    assert.equal(g.thac0[1], 18);                                // 2 HD monster
    assert.equal(g.thac0[8], 12);                                // 8 HD monster
    assert.equal(g.thac0[16], 10);                               // dwarf of 16th level beats 8+ HD
    assert.equal(g.preStages[0].thac0, 19);
    assert.deepEqual(g.saves, DB.Dwarf.saves);
    assert.deepEqual([...c.xpTable.slice(1, 12)], [4000, 12000, 28000, 60000, 124000, 250000, 500000, 800000, 1100000, 1400000, 1700000]);
    assert.deepEqual(c.hitDiceTable[4], [6, 0]);
    assert.deepEqual(c.hitDiceTable[10], [10, 2]);
    assert.equal(c.thac0[8], 11);                                // 9 HD monster
    assert.equal(c.thac0[20], 10);                               // stays a 10+ HD monster
    assert.deepEqual(c.preStages.map(s => [s.xp, s.dice, s.armourClass]), [[-4000, 2, 8], [0, 4, 7]]);
    assert.deepEqual(c.saves, DB.Fighter.saves);
    assert.equal(DB.Skygnome.xpTable, g.xpTable);
});
