function getHpFormula(character) {
    if (!character) return '';
    const className = character.characterClass || 'Fighter';
    const lvl = window.clampInt(character.level, 1, 36, 1);
    const classInfo = window.ClassesDatabase[className];
    const hdSize = classInfo ? classInfo.hitDie : 8;
    
    // Fixed hit points per level after 9th (DD Chapter 4): Fighter/Dwarf/Thief/Mystic +2, others +1.
    // A class option can change it (Shadow Elf +2, Shadow Shaman +1).
    const option = (typeof window.getClassOption === 'function') ? window.getClassOption(character) : null;
    const perLvlBonus = option?.hpPerLevelAfter9 ?? classInfo?.hpPerLevelAfter9 ?? 1;
    const conMod = Number(character.abilities?.constitution?.modifier) || 0;
    const dieBonus = Number(classInfo?.hpDieBonus) || 0;           // Bandit: 1d6+1 per level

    // Creature heroes (PC1/PC2): their own Hit Dice table, including stages before 1st level.
    if (Array.isArray(classInfo?.hitDiceTable)) {
        const stage = (typeof window.getCreatureStage === 'function') ? window.getCreatureStage(character) : null;
        const [dice, plus] = stage ? [stage.dice, 0] : (classInfo.hitDiceTable[lvl] || [1, 0]);
        let f = `${dice}d${hdSize}${plus ? ` + ${plus}` : ''}`;
        const con = conMod * dice;                          // Con applies to Hit Dice only
        if (con !== 0) f += ` (${con > 0 ? '+' : ''}${con} Con)`;
        return f;
    }

    let diceCount = Math.min(lvl, 9);
    let formula = `${diceCount}d${hdSize}${dieBonus ? `+${diceCount * dieBonus}` : ''}`;
    if (lvl > 9) {
        let after9 = (lvl - 9) * perLvlBonus;
        // Arcane Warrior (Compendium): +1 hp per level after 9th, but only for the levels
        // gained as an Arcane Warrior; earlier Fighter levels keep the Fighter's +2.
        if (className === 'Fighter' && character.subClass === 'Arcane Warrior') {
            const aw = window.ClassesDatabase['Arcane Warrior'];
            const start = Math.max(9, window.clampInt(character.arcaneWarriorStartLevel, 9, 36, 9));
            const fighterLevels = Math.max(0, Math.min(lvl, start) - 9);
            after9 = fighterLevels * perLvlBonus + Math.max(0, lvl - Math.max(start, 9)) * (aw?.hpPerLevelAfter9 ?? 1);
        }
        formula += ` + ${after9}`;
    }
    const totalConBonus = conMod * diceCount;
    if (totalConBonus !== 0) {
        formula += ` (${totalConBonus > 0 ? '+' : ''}${totalConBonus} Con)`;
    }
    return formula;
}

function updateCombatVitals() {
    if (!window.currentCharacter) return;
    const char = window.currentCharacter;

    const hpCurrent = Number(document.getElementById('hp-current')?.value) || 0;
    const hpMax = Math.max(1, Number(document.getElementById('hp-max')?.value) || 1);
    const hpBadge = document.getElementById('hp-status-badge');
    const formulaDisplay = document.getElementById('hp-formula-display');
    const headerFormula = document.getElementById('header-hp-formula');

    const formula = getHpFormula(char);
    if (formulaDisplay) formulaDisplay.innerText = formula;
    if (headerFormula) headerFormula.innerText = formula;

    if (hpBadge) {
        const pct = (hpCurrent / hpMax) * 100;
        if (hpCurrent <= 0) {
            // Compendium "Dying and Death": first Death save at the end of the NEXT round,
            // then every round until First Aid or magical healing.
            hpBadge.innerText = 'Dying: save vs Death each round';
            hpBadge.title = 'First Death saving throw at the end of the next round, then at the end of every round until tended with First Aid or magically healed.';
            hpBadge.style.color = 'var(--danger)';
            hpBadge.style.borderColor = 'var(--danger)';
            hpBadge.style.background = 'color-mix(in srgb, var(--danger) 15%, transparent)';
        } else if (pct <= 25) {
            hpBadge.title = '';
            hpBadge.innerText = 'Critical';
            hpBadge.style.color = 'var(--warn-strong)';
            hpBadge.style.borderColor = 'var(--warn-strong)';
            hpBadge.style.background = 'color-mix(in srgb, var(--warn-strong) 15%, transparent)';
        } else if (pct <= 50) {
            hpBadge.innerText = 'Bloodied';
            hpBadge.style.color = 'var(--warn)';
            hpBadge.style.borderColor = 'var(--warn)';
            hpBadge.style.background = 'color-mix(in srgb, var(--warn) 15%, transparent)';
        } else {
            hpBadge.innerText = 'Healthy';
            hpBadge.style.color = 'var(--good)';
            hpBadge.style.borderColor = 'var(--good)';
            hpBadge.style.background = 'color-mix(in srgb, var(--good) 15%, transparent)';
        }
    }

    const dexMod = Number(char.abilities?.dexterity?.modifier) || 0;
    const baseArmor = Number(document.getElementById('ac-base')?.value) || 9;
    const totalAC = baseArmor - dexMod;

    window.safeSetVal('combat-ac', totalAC);
    const dexHint = document.getElementById('ac-dex-hint');
    if (dexHint) {
        dexHint.innerText = `Dex: ${dexMod > 0 ? '-' + dexMod : (dexMod < 0 ? '+' + Math.abs(dexMod) : '0')} AC`;
        // Rake (Compendium): Dexterity modifier to AC is doubled against melee opponents.
        if (char.characterClass === 'Rake' && dexMod !== 0) {
            dexHint.innerText += ` · vs melee AC ${baseArmor - 2 * dexMod}`;
        }
    }

    const initBonus = Number(document.getElementById('init-bonus')?.value) || 0;
    const totalInit = dexMod + initBonus;
    window.safeSetText('init-total', totalInit >= 0 ? `+${totalInit}` : `${totalInit}`);

    // 0 is a real speed (immobile), so only an empty value falls back to 120'.
    const rawSpeed = document.getElementById('movement-load')?.value;
    const baseTurnSpeed = (rawSpeed === '' || rawSpeed == null) ? 120 : Number(rawSpeed);

    // Mystics move faster (DD Table 4-8); encumbrance slows them in the same proportion.
    const mysticTable = window.ClassesDatabase[char.characterClass]?.mysticTable;
    const lvl = window.clampInt(char.level, 1, 36, 1);
    const encounterSpeed = mysticTable
        ? Math.floor(mysticTable.movementPerRound[lvl] * baseTurnSpeed / 120)
        : Math.floor(baseTurnSpeed / 3);
    const turnSpeed = encounterSpeed * 3;

    window.safeSetText('speed-explore', `${turnSpeed}'`);
    window.safeSetText('speed-encounter', `${encounterSpeed}'`);
    window.safeSetText('speed-running', `${turnSpeed}'`);
}

function getAttacksPerRound(className, level, character) {
    const lvl = Number(level) || 1;
    const option = (character && typeof window.getClassOption === 'function') ? window.getClassOption(character) : null;
    if (option && option.noCombatOptions) return { count: 1, note: "Standard" };   // Shadow Shaman
    if (className === 'Centaur') return { count: 3, note: "weapon + 2 hooves (1d6 each)" };   // PC1
    if (className === 'Mystic') {
        if (lvl >= 13) return { count: 4, note: "Strike to Kill (Unarmed)" };
        if (lvl >= 9)  return { count: 3, note: "Strike to Kill (Unarmed)" };
        if (lvl >= 5)  return { count: 2, note: "Strike to Kill (Unarmed)" };
        return { count: 1, note: "Unarmed / Weapons" };
    }
    // [level, attacks] steps from the class data (Fighter 12/24/36, Dwarf 12/20/36, Elf & Halfling 11/18...).
    const info = window.ClassesDatabase[className] || {};
    let count = 1;
    if (character && Array.isArray(info.multipleAttacksXp)) {
        // GAZ13 gives the Shadow Elf's extra attacks by XP total (850,000 and 2,600,000).
        let xp = Number(character.experiencePoints) || 0;
        // A Shadow Shaman's total includes the extra shaman XP; only the elf share counts here.
        if (option && Array.isArray(option.extraXpTable)) xp -= Number(option.extraXpTable[lvl]) || 0;
        info.multipleAttacksXp.forEach(([minXp, attacks]) => { if (xp >= minXp) count = attacks; });
    } else {
        (info.multipleAttacks || []).forEach(([minLevel, attacks]) => { if (lvl >= minLevel) count = attacks; });
    }
    return { count, note: count > 1 ? "vs foes hit on 2+" : "Standard" };
}

// Class groups for the Rules Cyclopedia "Fighter Maneuvers" (Chapter 8). Who gets a
// manoeuvre and at what level follows Dark Dungeons / the Compendium class data.
const LANCE_CLASSES = ['Fighter', 'Paladin', 'Avenger', 'Dwarf', 'Elf', 'Shadow Elf'];
const SET_SPEAR_CLASSES = ['Fighter', 'Paladin', 'Avenger', 'Dwarf', 'Elf', 'Shadow Elf', 'Halfling', 'Mystic'];
// Classes whose Fighter Combat Options include Disarm (RC; GAZ13 for shadow elves). Compendium classes list Smash/Parry only.
const DISARM_CLASSES = ['Fighter', 'Dwarf', 'Elf', 'Shadow Elf', 'Halfling', 'Mystic'];

function fmtSignedBonus(n) { return n >= 0 ? `+${n}` : `${n}`; }

function renderCombatManoeuvres() {
    const listContainer = document.getElementById('combat-manoeuvres-list');
    const rateBadge = document.getElementById('combat-attacks-rate-badge');
    if (!listContainer || !window.currentCharacter) return;

    const char = window.currentCharacter;
    const className = document.getElementById('char-class')?.value || char.characterClass || 'Fighter';
    const lvl = Number(document.getElementById('char-level')?.value) || Number(char.level) || 1;
    const subClass = document.getElementById('char-subclass')?.value || char.subClass || '';
    const classInfo = window.ClassesDatabase[className] || {};

    const attackInfo = getAttacksPerRound(className, lvl, { ...char, characterClass: className, subClass });
    if (rateBadge) {
        rateBadge.innerHTML = `Attacks per round: <strong style="color: var(--accent-gold);">${attackInfo.count}</strong> · ${escapeHtml(attackInfo.note)}`;
    }

    const dexMod = Number(char.abilities?.dexterity?.modifier) || 0;
    const encounterSpeed = document.getElementById('speed-encounter')?.innerText || '';

    const manoeuvres = [];
    const isArcaneWarrior = (subClass === 'Arcane Warrior');   // Compendium: no Fighter Combat Options
    const subInfo = window.ClassesDatabase[subClass];
    const isRestrictedOption = Boolean(subInfo && subInfo.optionOf === className && subInfo.noCombatOptions);   // Shadow Shaman
    const smashLevel = classInfo.smashParryLevel;
    const hasCombatOptions = !isArcaneWarrior && !isRestrictedOption && smashLevel !== undefined && lvl >= smashLevel;
    const canDisarm = hasCombatOptions && DISARM_CLASSES.includes(className);
    // A Shadow Shaman may only use bludgeoning weapons, so no lance and no spear.
    const canLance = LANCE_CLASSES.includes(className) && !isRestrictedOption;

    if (hasCombatOptions) {
        manoeuvres.push({
            name: "Smash", tag: "Fighter Option",
            desc: "Declare at the start of the round, before initiative. You automatically lose initiative and take −5 to hit "
                + "(Strength and magic bonuses still apply). On a hit, add your Strength bonus, magic bonuses and your entire "
                + "Strength score to the weapon's damage."
        });
        manoeuvres.push({
            name: "Parry", tag: "Fighter Option",
            desc: "Declare at the start of the round, before initiative. You make no attack roll; instead you block for the whole round. "
                + "Every enemy attacking you takes −4 to hit with melee and thrown weapons (missile fire is not affected)."
        });
    }
    if (canDisarm) {
        manoeuvres.push({
            name: "Disarm", tag: "Fighter Option",
            desc: "Only against a weapon-using opponent. Roll to hit with your normal Strength and magic bonuses; a hit does no damage. "
                + `Instead the victim rolls 1d20, minus their Dexterity bonus, plus yours (${fmtSignedBonus(dexMod)}). `
                + "If the result is higher than their Dexterity score, they drop their weapon."
        });
    }

    if (attackInfo.count > 1 && className !== 'Mystic' && className !== 'Centaur') {
        const kinds = ['a normal attack', 'a throw'];
        if (canLance) kinds.push('a lance attack');
        if (canDisarm) kinds.push('a disarm');
        manoeuvres.push({
            name: "Multiple Attacks", tag: "Fighter Option",
            desc: `Against a foe you can hit on a roll of 2 (after all modifiers) you make ${attackInfo.count} attacks per round. `
                + `Each one can be ${kinds.slice(0, -1).join(', ')} or ${kinds[kinds.length - 1]}, mixed as you like, `
                + "and you may give up an attack to move or act instead."
        });
    }

    // Set vs Charge: a class manoeuvre for fighters, demihumans and mystics; anyone else
    // only through a weapon feat whose special includes "Set".
    const feats = Array.isArray(char.weaponFeats) ? char.weaponFeats : [];
    const setFeatWeapons = feats
        .map(w => window.GlobalWeaponsDatabase[w.weaponId] ? { data: window.GlobalWeaponsDatabase[w.weaponId], rank: w.rank } : null)
        .filter(x => x && /\bset\b/i.test(x.data.armed?.[x.rank]?.special || ''))
        .map(x => x.data.name);

    if (SET_SPEAR_CLASSES.includes(className) && !isRestrictedOption) {
        const extra = setFeatWeapons.filter(n => !/^(Spear|Pike|Lance|Shield, Sword)$/i.test(n));
        manoeuvres.push({
            name: "Set Spear vs Charge", tag: "Fighter Manoeuvre",
            desc: "On foot with a spear, pike, sword shield or lance" + (extra.length ? ` (or your ${extra.join(', ')})` : '')
                + ". Declare it before the charging enemy reaches you, even rounds ahead. A charge is a rush of 20 yards or more. "
                + "You strike during the enemy's movement, as it comes into reach, with Strength and magic bonuses. "
                + "A hit does double damage (roll, double, then add bonuses); if it kills, the enemy cannot attack you."
        });
    } else if (setFeatWeapons.length) {
        manoeuvres.push({
            name: "Set vs Charge", tag: "Weapon Ability",
            desc: `Your ${setFeatWeapons.join(', ')} can be set against a charge (weapon feat). If you are aware of an enemy rushing you `
                + "20 yards or more this round and you hit it, it takes double damage."
        });
    }

    if (className === 'Centaur') {
        manoeuvres.push({
            name: "Hooves", tag: "Natural Attack",
            desc: "Besides your weapon attack, strike with both hooves for 1d6 damage each."
        });
        manoeuvres.push({
            name: "Lance Charge", tag: "Class Special",
            desc: "Charging with a lance deals double damage, as a mounted fighter does (roll, double, then add bonuses), "
                + "but you cannot also attack with your hooves that round."
        });
    }

    if (canLance) {
        manoeuvres.push({
            name: "Lance Attack", tag: "Fighter Manoeuvre",
            desc: "Mounted, with a lance. If your mount runs (flies, swims) 20 yards or more toward the target, a hit does double damage "
                + "(roll, double, then add Strength and magic bonuses). If it moves less, the lance does normal damage. "
                + "With multiple attacks, each attack must be at a different target along the mount's path."
        });
    }

    if (className === 'Thief' || className === 'Bounty Hunter') {
        manoeuvres.push({
            name: "Sneak Attack", tag: "Class Special",
            desc: (className === 'Bounty Hunter' ? "Capture weapons only. " : "")
                + "Strike a foe who does not know where you are: you must be hidden, invisible or otherwise concealed, "
                + "not merely behind them. Gain +4 to hit and deal double damage, in melee or with a missile or thrown weapon at short range; "
                + "with two weapons both attacks qualify. In combat you may spend your turn hiding (Move Silently or Hide in Shadows); "
                + "on a success you can sneak attack an unsuspecting target."
        });
    }

    if (className === 'Mystic') {
        const mt = classInfo.mysticTable;
        const dmg = mt?.strikeToKillDamage?.[lvl] || '';
        const n = mt?.strikeToKillAttacks?.[lvl] || attackInfo.count;
        manoeuvres.push({
            name: "Strike to Kill", tag: "Martial Arts",
            desc: `Unarmed martial arts: ${n} attack${n > 1 ? 's' : ''} per round, ${dmg} damage plus Strength bonus. `
                + "No stun or knockout. Choose the form before initiative. The extra attacks do not apply with weapons."
        });
        manoeuvres.push({
            name: "Strike to Stun", tag: "Martial Arts",
            desc: "Unarmed strike with the Unarmed Strikes weapon feat, at its normal damage and without the extra Strike to Kill attacks. "
                + "A target hit must save vs Death Ray (with a penalty set by your proficiency) or be delayed, stunned or knocked out, "
                + "depending on its Hit Dice against your proficiency. A knockout lasts 1d100 rounds. Choose the form before initiative."
        });
    }

    manoeuvres.push({
        name: "Fighting Withdrawal", tag: "Movement",
        desc: "Only if you begin the round in melee. Back away 5' this round. You attack only if an enemy follows you in its movement phase: "
            + "then you strike at the end of its move, before it attacks. If you are out of melee when your next movement comes, you may run."
    });
    manoeuvres.push({
        name: "Retreat", tag: "Movement",
        desc: `Only if you begin the round in melee. Run away at more than half, up to your full encounter speed${encounterSpeed ? ` (${encounterSpeed})` : ''}. `
            + "You lose any shield AC bonus, and anyone attacking you later this round, following or with missiles, gets +2 to hit. "
            + "If you are out of melee when your next movement comes, you may run."
    });

    listContainer.innerHTML = '';
    manoeuvres.forEach(m => {
        const col = document.createElement('div');
        col.className = 'note-col';
        col.innerHTML = `
            <div class="note-col-head">
                <span class="note-col-title">${escapeHtml(m.name)}</span>
                <span class="tag" style="color: var(--text-muted);">${escapeHtml(m.tag)}</span>
            </div>
            <div class="note-col-body">${escapeHtml(m.desc)}</div>
        `;
        listContainer.appendChild(col);
    });
}

window.getHpFormula = getHpFormula;
window.updateCombatVitals = updateCombatVitals;
window.getAttacksPerRound = getAttacksPerRound;
window.renderCombatManoeuvres = renderCombatManoeuvres;