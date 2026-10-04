// js/creation.js — guided character creation.
// Dark Dungeons Chapter 4 (Creating a Character, Table 4-1), Chapter 8 (starting money and equipment)
// and the Mystara Extra Rules Compendium (starting level, Intelligence and languages, its classes' tables).

const ABILITY_LIST = ['strength', 'intelligence', 'wisdom', 'dexterity', 'constitution', 'charisma'];
const ABILITY_SHORT = { strength: 'Str', intelligence: 'Int', wisdom: 'Wis', dexterity: 'Dex', constitution: 'Con', charisma: 'Cha' };
const ABILITY_LONG = { strength: 'Strength', intelligence: 'Intelligence', wisdom: 'Wisdom', dexterity: 'Dexterity', constitution: 'Constitution', charisma: 'Charisma' };

// Which abilities a class may raise (enhance) and lower (sacrifice), and its minimums.
// Core classes: Dark Dungeons Table 4-1. Compendium classes: their own tables.
const CLASS_ADJUSTMENTS = {
    'Cleric':        { up: ['wisdom'], down: ['strength', 'intelligence'], min: { wisdom: 9 } },
    'Dwarf':         { up: ['strength'], down: ['intelligence', 'wisdom'], min: { constitution: 9 } },
    'Elf':           { up: ['strength', 'intelligence'], down: ['wisdom'], min: { intelligence: 9 } },
    'Fighter':       { up: ['strength'], down: ['intelligence', 'wisdom'], min: { strength: 9 } },
    'Halfling':      { up: ['strength', 'dexterity'], down: ['intelligence', 'wisdom'], min: { dexterity: 9, constitution: 9 } },
    'Magic-User':    { up: ['intelligence'], down: ['strength', 'wisdom'], min: { intelligence: 9 } },
    'Mystic':        { up: ['strength', 'dexterity'], down: ['intelligence', 'wisdom'], min: { wisdom: 13, dexterity: 13 } },
    'Thief':         { up: ['dexterity'], down: ['strength', 'intelligence', 'wisdom'], min: { dexterity: 9 } },
    'Archer':        { up: ['strength', 'dexterity'], down: ['intelligence', 'wisdom'] },
    'Bandit':        { up: ['strength', 'dexterity'], down: ['wisdom'] },
    'Battlecaster':  { up: ['strength', 'intelligence'], down: ['wisdom'] },
    'Beastmaster':   { up: ['strength', 'dexterity'], down: ['intelligence', 'wisdom'] },
    'Bounty Hunter': { up: ['intelligence', 'dexterity'], down: ['wisdom'] },
    'Rake':          { up: ['strength', 'dexterity'], down: ['intelligence', 'wisdom'] },
    'Witch':         { up: ['intelligence', 'wisdom'], down: ['strength'] },
    'Shadow Elf':    { up: ['strength', 'intelligence'], down: ['wisdom'] },        // a Dark Dungeons elf
    'Gnome':         { up: [], down: [], note: 'PC2 gives gnomes no ability adjustment.' },
    'Skygnome':      { up: [], down: [], note: 'PC2 gives skygnomes no ability adjustment.' },
    'Centaur':       { up: [], down: [], note: 'PC1 gives centaurs no ability adjustment.' },
    ...Object.fromEntries(['Brownie', 'Dryad', 'Faun', 'Hsiao', 'Leprechaun', 'Pixie', 'Pooka', 'Redcap', 'Sidhe (Rogue)', 'Sidhe (Warrior)',
        'Sprite', 'Treant', 'Wood Imp', 'Woodrake'].map(c => [c, { up: [], down: [], note: 'PC1 gives woodland beings no ability adjustment; scores above the race maximum are lowered to it.' }])),
};
// Compendium: start at the lowest level of the campaign; starting gold is multiplied by it.
const START_LEVELS = [
    { level: 1, label: 'Basic (1st level)' },
    { level: 4, label: 'Expert, low (4th level)' },
    { level: 9, label: 'Expert, high (9th level)' },
    { level: 15, label: 'Companion (15th level)' },
    { level: 26, label: 'Master (26th level)' },
];
const CREATION_STEPS = ['Concept', 'Abilities', 'Class', 'Adjust', 'Level & wealth', 'Weapons & spells', 'Equipment', 'Review'];

let cc = null;          // creation state

const ccRoll = n => 1 + Math.floor(Math.random() * n);
const ccDice = (n, s) => { const r = []; for (let i = 0; i < n; i++) r.push(ccRoll(s)); return r; };
const ccMod = score => (typeof calculateModifier === 'function' ? calculateModifier(score) : 0);

function openCreationGuide() {
    cc = {
        step: 0, name: '', alignment: 'Neutral', gender: '', homeland: '', concept: '',
        rolled: null, dice: null, base: null, cls: '', adjusted: null, startLevel: 1,
        hp: null, hpRolls: null, gold: null, goldRolls: null, weapons: [], spell: '', cart: {}, shopTab: 'gear', shopQuery: '', languages: '',
    };
    const m = document.getElementById('creation-modal');
    if (!m) return;
    m.style.display = 'flex';
    renderCreation();
}
function closeCreationGuide() {
    const m = document.getElementById('creation-modal');
    if (m) m.style.display = 'none';
}
function ccClassInfo(cls = cc.cls) { return ClassesDatabase[cls] || null; }
function ccAdj(cls = cc.cls) {
    const a = CLASS_ADJUSTMENTS[cls] || { up: [], down: [] };
    const min = { ...(ccClassInfo(cls)?.minScores || {}), ...(a.min || {}) };
    return { ...a, min };
}
function ccScores() { return cc.adjusted || cc.base || {}; }
function ccMainClasses() {
    const sel = document.getElementById('char-class');
    const opts = sel ? [...sel.options].map(o => o.value) : Object.keys(CLASS_ADJUSTMENTS);
    return opts.filter(c => ClassesDatabase[c] && !ClassesDatabase[c].optionOf);
}
function ccClassLabel(c) {
    const sel = document.getElementById('char-class');
    const o = sel ? [...sel.options].find(x => x.value === c) : null;
    return o ? o.textContent : c;
}

// --- Abilities -------------------------------------------------------------------------
function ccRollAbilities() {
    cc.dice = {}; cc.base = {};
    ABILITY_LIST.forEach(k => { const d = ccDice(3, 6); cc.dice[k] = d; cc.base[k] = d[0] + d[1] + d[2]; });
    cc.adjusted = null; cc.rolled = true;
    renderCreation();
}
function ccSetBase(k, v) {
    if (!cc.base) { cc.base = {}; ABILITY_LIST.forEach(a => { cc.base[a] = 10; }); }
    cc.base[k] = Math.max(3, Math.min(18, Math.round(Number(v) || 3)));
    if (cc.dice) delete cc.dice[k];
    cc.adjusted = null; cc.rolled = true;
    renderCreation();
}
// DD: re-roll all six if none is above 9, or two or more are 6 or less.
function ccRollsPoor() {
    if (!cc.base) return false;
    const v = ABILITY_LIST.map(k => cc.base[k]);
    return !v.some(x => x > 9) || v.filter(x => x <= 6).length >= 2;
}

// --- Class and adjustment ------------------------------------------------------------------
// Can the class's minimums be met with this class's adjustments? 'yes' | 'adjust' | 'no'
function ccEligibility(cls) {
    if (!cc.base) return 'no';
    const a = ccAdj(cls);
    let need = 0;
    for (const [k, min] of Object.entries(a.min)) {
        const s = cc.base[k];
        if (s >= min) continue;
        if (!a.up.includes(k) || min > 18) return 'no';
        need += min - s;
    }
    if (!need) return 'yes';
    const spare = a.down.reduce((sum, k) => sum + Math.max(0, cc.base[k] - 9 - Math.max(0, (a.min[k] || 0) - 9)), 0);
    return Math.floor(spare / 2) >= need ? 'adjust' : 'no';
}
function ccPickClass(cls) {
    cc.cls = cls; cc.adjusted = { ...cc.base }; cc.spell = ''; cc.cart = {}; cc.hp = null; cc.gold = null;
    // PC1 Table 1: a woodland being's scores cannot go above its race's maximum.
    Object.entries(ccClassInfo(cls)?.maxScores || {}).forEach(([k, max]) => { if (cc.adjusted[k] > max) cc.adjusted[k] = max; });
    // Mystic martial arts need the Unarmed Strikes feat, so it is their first pick (Dark Dungeons, Chapter 4).
    cc.weapons = cls === 'Mystic' ? ['unarmed_strikes'] : [];
    renderCreation();
}
function ccAdjustState() {
    const a = ccAdj();
    const raised = a.up.reduce((s, k) => s + Math.max(0, cc.adjusted[k] - cc.base[k]), 0);
    const lowered = a.down.reduce((s, k) => s + Math.max(0, cc.base[k] - cc.adjusted[k]), 0);
    return { a, raised, lowered, spare: Math.floor(lowered / 2) - raised };
}
function ccAdjust(k, dir) {
    const { a, spare } = ccAdjustState();
    const cur = cc.adjusted[k], base = cc.base[k];
    if (a.up.includes(k)) {
        if (dir > 0 && cur < 18 && spare > 0) cc.adjusted[k]++;
        if (dir < 0 && cur > base) cc.adjusted[k]--;
    }
    if (a.down.includes(k)) {
        if (dir < 0 && cur > 9 && cur > (a.min[k] || 0)) cc.adjusted[k]--;
        if (dir > 0 && cur < base) {
            // Undoing a sacrifice must leave enough points for the raises already made.
            const st = ccAdjustState();
            if (Math.floor((st.lowered - 1) / 2) >= st.raised) cc.adjusted[k]++;
        }
    }
    renderCreation();
}
function ccUnmet() {
    const s = ccScores();
    return Object.entries(ccAdj().min).filter(([k, m]) => (s[k] || 0) < m).map(([k, m]) => `${ABILITY_SHORT[k]} ${m}`);
}
function ccXpBonus() {
    if (typeof getPrimeRequisiteBonus !== 'function' || !cc.cls) return 0;
    const s = ccScores();
    const abilities = {}; ABILITY_LIST.forEach(k => { abilities[k] = { score: s[k], modifier: ccMod(s[k]) }; });
    try { return getPrimeRequisiteBonus(cc.cls, abilities) || 0; } catch (e) { return 0; }
}

// --- Level, hit points, money ------------------------------------------------------------------
function ccCharacterStub() {
    const s = ccScores();
    const abilities = {}; ABILITY_LIST.forEach(k => { abilities[k] = { score: s[k], modifier: ccMod(s[k]) }; });
    return { characterClass: cc.cls, level: cc.startLevel, abilities, experiencePoints: ccStartXp() };
}
function ccIsCreature() { return Array.isArray(ccClassInfo()?.preStages) && ccClassInfo().preStages.length > 0; }
// GAZ6 p. 16: every dwarf must take Mining and Engineering (two of the starting skill choices).
function ccStartingSkills() {
    if (cc.cls !== 'Dwarf' || typeof GENERAL_SKILLS_DATABASE === 'undefined') return [];
    return ['mining', 'engineering'].filter(k => GENERAL_SKILLS_DATABASE[k]).map(k => ({
        skillId: k, name: GENERAL_SKILLS_DATABASE[k].name, ability: GENERAL_SKILLS_DATABASE[k].ability, subType: '',
        desc: GENERAL_SKILLS_DATABASE[k].desc, slots: 1, isCustom: false,
    }));
}
function ccStartXp() {
    const info = ccClassInfo();
    if (!info) return 0;
    if (cc.startLevel === 1 && ccIsCreature()) return Math.min(...info.preStages.map(st => st.xp));
    const table = info.xpTable || [];
    return Number(table[cc.startLevel]) || 0;
}
function ccRollHp() {
    const info = ccClassInfo(); if (!info) return;
    const die = Number(info.hitDie) || 6;
    const con = ccMod(ccScores().constitution);
    const dieBonus = Number(info.hpDieBonus) || 0;
    const rolls = []; let total = 0;
    if (Array.isArray(info.hitDiceTable)) {
        const first = ccIsCreature() ? info.preStages.reduce((lo, st) => (st.xp < lo.xp ? st : lo)) : null;
        const dice = (cc.startLevel === 1 && first) ? first.dice : (info.hitDiceTable[cc.startLevel] || [1, 0])[0];
        const hdDie = (cc.startLevel === 1 && first?.die) ? first.die : die;
        const plus = (cc.startLevel === 1 && ccIsCreature()) ? 0 : ((info.hitDiceTable[cc.startLevel] || [1, 0])[1] || 0);
        for (let i = 0; i < dice; i++) { const r = ccRoll(hdDie); rolls.push(r); total += Math.max(1, r + con); }
        total += plus;
    } else {
        const dice = Math.min(cc.startLevel, 9);
        for (let i = 0; i < dice; i++) { const r = ccRoll(die); rolls.push(r); total += Math.max(1, r + dieBonus + con); }
        const option = null;
        const after = Number(option?.hpPerLevelAfter9 ?? info.hpPerLevelAfter9 ?? 1);
        if (cc.startLevel > 9) total += after * (cc.startLevel - 9);
    }
    cc.hp = Math.max(1, total); cc.hpRolls = rolls;
    renderCreation();
}
function ccRollGold() {
    const d = ccDice(3, 6);
    cc.goldRolls = d;
    cc.gold = (d[0] + d[1] + d[2]) * 10 * cc.startLevel;
    renderCreation();
}
function ccSet(field, value) {
    if (field === 'startLevel') { cc.startLevel = Number(value) || 1; cc.hp = null; cc.gold = null; cc.weapons = cc.weapons.slice(0, ccFeatCount()); }
    else if (field === 'hp' || field === 'gold') cc[field] = Math.max(0, Math.round(Number(value) || 0));
    else cc[field] = String(value ?? '').slice(0, 2000);
    if (['hp', 'gold', 'name', 'concept', 'homeland', 'gender', 'languages', 'shopQuery', 'spell'].includes(field)) {
        if (field === 'shopQuery') renderCreationBody();
        else ccUpdateFooter();
        return;
    }
    renderCreation();
}

// --- Weapons and spells -----------------------------------------------------------------------------
function ccFeatCount() {
    if (typeof getTotalWeaponFeats !== 'function' || !cc.cls) return 2;
    return getTotalWeaponFeats(ccCharacterStub());
}
function ccToggleWeapon(id) {
    const i = cc.weapons.indexOf(id);
    if (i >= 0) cc.weapons.splice(i, 1);
    else if (cc.weapons.length < ccFeatCount()) cc.weapons.push(id);
    renderCreation();
}
// Native languages: Common, the alignment tongue and the class's racial languages (Rules Cyclopedia).
function ccDefaultLanguages() {
    return typeof defaultLanguages === 'function' ? defaultLanguages(cc.cls, cc.alignment).join(', ') : `Common, ${cc.alignment}`;
}
// Fairies (PC1) cast arcane-like spells but keep no spellbook.
function ccIsArcane() { return ccClassInfo()?.casterType === 'arcane' && !ccClassInfo()?.spellList; }

// --- Equipment shop -----------------------------------------------------------------------------------
function ccShopItems() {
    const out = [];
    const stub = ccCharacterStub();
    DD_GEAR.forEach(g => out.push({ key: 'g:' + g.id, kind: 'gear', id: g.id, name: g.pack > 1 ? `${g.name} (${g.pack})` : g.name, price: g.cost * g.pack, weight: g.weight * g.pack, tab: 'gear', ok: true }));
    Object.values(window.GlobalWeaponsDatabase || {}).filter(w => !/^(oil|holy|rock|unarmed)/.test(w.id)).forEach(w => out.push({
        key: 'w:' + w.id, kind: 'weapon', id: w.id, name: w.name, price: parseCostGp(w.cost), weight: weaponWeight(w), tab: 'weapons',
        ok: typeof canCharacterUseWeapon === 'function' ? canCharacterUseWeapon(w, stub) : true,
    }));
    DD_ARMOUR.forEach(a => out.push({
        key: 'a:' + a.id, kind: 'armour', id: a.id, name: a.isShield ? a.name : `${a.name} (AC ${a.baseAC})`, price: a.cost, weight: a.weight, tab: 'armour',
        ok: a.isShield ? (typeof getArmourRule === 'function' ? getArmourRule(stub).shields : true) : (typeof isArmourAllowed === 'function' ? isArmourAllowed(stub, a.baseAC) : true),
    }));
    return out;
}
function ccCartTotal() {
    const items = ccShopItems();
    return Object.entries(cc.cart).reduce((s, [k, q]) => s + (items.find(i => i.key === k)?.price || 0) * q, 0);
}
function ccCartWeight() {
    const items = ccShopItems();
    return Object.entries(cc.cart).reduce((s, [k, q]) => s + (items.find(i => i.key === k)?.weight || 0) * q, 0);
}
function ccBuy(key, delta) {
    const items = ccShopItems();
    const it = items.find(i => i.key === key); if (!it) return;
    const q = (cc.cart[key] || 0) + delta;
    if (delta > 0 && ccCartTotal() + it.price > (cc.gold || 0) + 1e-9) return;
    if (q <= 0) delete cc.cart[key]; else cc.cart[key] = q;
    renderCreationBody(); ccUpdateFooter();
}
// The weapons picked for feats can be bought in one click.
function ccBuyFeatWeapons() {
    cc.weapons.filter(id => id !== 'unarmed_strikes').forEach(id => { const key = 'w:' + id; if (!cc.cart[key]) ccBuy(key, 1); });
    renderCreation();
}

// --- Navigation -------------------------------------------------------------------------------------
function ccStepProblem(step = cc.step) {
    if (step === 0 && !cc.name.trim()) return 'Give your character a name.';
    if (step === 1 && !cc.base) return 'Roll (or enter) the six ability scores.';
    if (step === 2 && !cc.cls) return 'Choose a class.';
    if (step === 3 && ccUnmet().length) return `This class still needs ${ccUnmet().join(', ')}.`;
    if (step === 4 && (cc.hp === null || cc.gold === null)) return 'Roll (or enter) hit points and starting gold.';
    return '';
}
function ccGo(delta) {
    if (delta > 0) {
        const p = ccStepProblem();
        if (p) { const el = document.getElementById('creation-problem'); if (el) el.textContent = p; return; }
    }
    cc.step = Math.max(0, Math.min(CREATION_STEPS.length - 1, cc.step + delta));
    if (cc.step === 3 && !cc.adjusted) cc.adjusted = { ...cc.base };
    renderCreation();
}
function ccGoTo(i) {
    for (let s = 0; s < i; s++) if (ccStepProblem(s)) return;
    cc.step = i; renderCreation();
}

// --- Rendering --------------------------------------------------------------------------------------
function renderCreation() {
    if (!cc) return;
    const steps = document.getElementById('creation-steps');
    if (steps) steps.innerHTML = CREATION_STEPS.map((s, i) => `<button type="button" class="${i === cc.step ? 'on' : ''}" onclick="ccGoTo(${i})">${i + 1}. ${s}</button>`).join('');
    renderCreationBody();
    ccUpdateFooter();
}
function ccUpdateFooter() {
    const f = document.getElementById('creation-footer');
    if (!f || !cc) return;
    const last = cc.step === CREATION_STEPS.length - 1;
    f.innerHTML = `
        <span id="creation-problem" class="sub-caption" style="margin: 0; color: var(--warn-strong);"></span>
        <span style="margin-left: auto; display: inline-flex; gap: 8px;">
            ${cc.step === 0 ? '<button type="button" class="btn btn-sm" onclick="createBlankCharacter()">Skip: blank sheet</button>' : `<button type="button" class="btn btn-sm" onclick="ccGo(-1)">Back</button>`}
            ${last ? '<button type="button" class="btn btn-sm btn-accent" onclick="finishCreation()">Create character</button>' : '<button type="button" class="btn btn-sm btn-accent" onclick="ccGo(1)">Next</button>'}
        </span>`;
}
function ccAbilityRow(k, s, extra = '') {
    const m = ccMod(s);
    return `<div class="cc-ab"><span class="cc-ab-name">${ABILITY_LONG[k]}</span>${extra}<strong class="cc-ab-score">${s}</strong><span class="cc-ab-mod">${m > 0 ? '+' + m : m}</span></div>`;
}
function renderCreationBody() {
    const body = document.getElementById('creation-body');
    if (!body || !cc) return;
    const S = cc.step;
    let h = '';
    if (S === 0) {
        h = `
        <p class="sub-caption">Step 1 (Dark Dungeons Chapter 4): decide what sort of character you want to play before picking up the dice, and talk to your GM.</p>
        <div class="arc-fields">
            <label class="arc-field"><span class="eyebrow">Name</span><input type="text" class="stat-input arc-input" value="${escapeHtml(cc.name)}" oninput="ccSet('name', this.value)" placeholder="e.g. Black Leaf"></label>
            <label class="arc-field arc-narrow"><span class="eyebrow">Alignment</span><select class="stat-input arc-input" onchange="ccSet('alignment', this.value)">${['Lawful', 'Neutral', 'Chaotic'].map(a => `<option ${cc.alignment === a ? 'selected' : ''}>${a}</option>`).join('')}</select></label>
            <label class="arc-field arc-narrow"><span class="eyebrow">Gender</span><input type="text" class="stat-input arc-input" value="${escapeHtml(cc.gender)}" oninput="ccSet('gender', this.value)"></label>
            <label class="arc-field"><span class="eyebrow">Homeland</span><input type="text" class="stat-input arc-input" value="${escapeHtml(cc.homeland)}" oninput="ccSet('homeland', this.value)" placeholder="e.g. Karameikos"></label>
        </div>
        <label class="arc-field"><span class="eyebrow">Concept</span><textarea class="stat-input arc-input" rows="3" oninput="ccSet('concept', this.value)" placeholder="A carefree young tearaway who grew up with merchant caravans...">${escapeHtml(cc.concept)}</textarea></label>`;
    } else if (S === 1) {
        const poor = ccRollsPoor();
        h = `
        <p class="sub-caption">Step 2: roll 3d6 for each ability, in order. If none is above 9, or two or more are 6 or less, roll all six again. You can also type the scores your table rolled.</p>
        <div class="arc-actions"><button type="button" class="btn btn-sm btn-accent" onclick="ccRollAbilities()">${cc.base ? 'Roll again' : 'Roll 3d6 in order'}</button></div>
        ${cc.base ? `<div class="cc-abilities">${ABILITY_LIST.map(k => `
            <div class="cc-ab"><span class="cc-ab-name">${ABILITY_LONG[k]}</span>
                <span class="cc-dice">${cc.dice && cc.dice[k] ? cc.dice[k].join(' + ') : 'entered'}</span>
                <input type="number" min="3" max="18" class="stat-input arc-input cc-ab-input" value="${cc.base[k]}" onchange="ccSetBase('${k}', this.value)">
                <span class="cc-ab-mod">${ccMod(cc.base[k]) > 0 ? '+' : ''}${ccMod(cc.base[k])}</span></div>`).join('')}</div>
        ${poor ? '<p class="sub-caption" style="color: var(--warn-strong);">These rolls are poor enough to re-roll all six (Dark Dungeons). Keep them only if your GM agrees.</p>' : ''}` : ''}`;
    } else if (S === 2) {
        const list = ccMainClasses();
        h = `<p class="sub-caption">Step 3: choose a class. Green classes can be played as rolled; amber ones need the ability adjustment in the next step; grey ones are out of reach of these scores (your GM may let you swap two scores).</p>
        <div class="cc-classes">${list.map(c => {
            const e = ccEligibility(c);
            const a = ccAdj(c);
            const req = Object.entries(a.min).map(([k, m]) => `${ABILITY_SHORT[k]} ${m}`).join(', ') || 'none';
            return `<button type="button" class="cc-class ${e} ${cc.cls === c ? 'on' : ''}" onclick="ccPickClass('${c}')">
                <strong>${escapeHtml(ccClassLabel(c))}</strong>
                <span>Needs ${escapeHtml(req)}</span>
                <span>${a.up.length ? `Raise ${a.up.map(k => ABILITY_SHORT[k]).join('/')} · lower ${a.down.map(k => ABILITY_SHORT[k]).join('/')}` : 'No adjustment'}</span>
            </button>`;
        }).join('')}</div>`;
    } else if (S === 3) {
        const st = ccAdjustState();
        const unmet = ccUnmet();
        const s = cc.adjusted;
        h = `<p class="sub-caption">Step 3 (cont.): a ${escapeHtml(cc.cls)} may raise ${st.a.up.length ? st.a.up.map(k => ABILITY_LONG[k]).join(' and ') : 'nothing'} (to 18 at most) by lowering ${st.a.down.length ? st.a.down.map(k => ABILITY_LONG[k]).join(' and ') : 'nothing'} two points for every point raised. No ability can be lowered below 9.</p>
        ${st.a.note ? `<p class="sub-caption">${escapeHtml(st.a.note)}</p>` : ''}
        <div class="cc-abilities">${ABILITY_LIST.map(k => {
            const canUp = st.a.up.includes(k), canDown = st.a.down.includes(k);
            const ctl = canUp || canDown ? `<span class="cc-ctl"><button type="button" class="icon-btn" onclick="ccAdjust('${k}', -1)" aria-label="Lower ${ABILITY_LONG[k]}">−</button><button type="button" class="icon-btn" onclick="ccAdjust('${k}', 1)" aria-label="Raise ${ABILITY_LONG[k]}">+</button></span>` : '<span class="cc-ctl"></span>';
            const tag = canUp ? '<span class="tag" style="color: var(--good);">raise</span>' : canDown ? '<span class="tag" style="color: var(--warn-strong);">sacrifice</span>' : '<span></span>';
            const diff = s[k] - cc.base[k];
            return ccAbilityRow(k, s[k], `${tag}<span class="cc-dice">${diff ? `rolled ${cc.base[k]} (${diff > 0 ? '+' : ''}${diff})` : `rolled ${cc.base[k]}`}</span>${ctl}`);
        }).join('')}</div>
        <div class="tally" style="margin: 10px 0;">
            <span>Points lowered <strong>${st.lowered}</strong></span><span>Raised <strong>${st.raised}</strong></span><span>Available <strong>${Math.max(0, st.spare)}</strong></span>
            <span>XP bonus <strong>${ccXpBonus() > 0 ? '+' : ''}${ccXpBonus()}%</strong></span>
        </div>
        ${unmet.length ? `<p class="sub-caption" style="color: var(--danger);">Still needed for a ${escapeHtml(cc.cls)}: ${unmet.join(', ')}.</p>` : '<p class="sub-caption" style="color: var(--good);">The class requirements are met.</p>'}
        ${st.lowered % 2 ? '<p class="sub-caption">An odd point lowered is wasted: lower one more or undo one.</p>' : ''}`;
    } else if (S === 4) {
        const info = ccClassInfo();
        const xp = ccStartXp();
        h = `<p class="sub-caption">Starting level (Compendium): a new player's first character starts at the lowest level of the campaign; starting gold is multiplied by that level.</p>
        <div class="arc-fields">
            <label class="arc-field"><span class="eyebrow">Campaign level</span><select class="stat-input arc-input" onchange="ccSet('startLevel', this.value)">${START_LEVELS.map(l => `<option value="${l.level}" ${cc.startLevel === l.level ? 'selected' : ''}>${l.label}</option>`).join('')}</select></label>
        </div>
        <div class="tally" style="margin: 6px 0 12px;"><span>Starting XP <strong>${xp.toLocaleString('en-US')}</strong></span>${ccIsCreature() && cc.startLevel === 1 ? `<span>Starts as <strong>${escapeHtml(info.preStages.reduce((lo, st) => (st.xp < lo.xp ? st : lo)).name)}</strong></span>` : ''}</div>
        <div class="arc-panel">
            <div class="arc-row-head"><strong>Hit points</strong><span class="eyebrow">d${info?.hitDie || 6} per level${cc.startLevel > 9 ? `, +${info?.hpPerLevelAfter9 ?? 1} per level after 9th` : ''}, Con ${ccMod(ccScores().constitution) >= 0 ? '+' : ''}${ccMod(ccScores().constitution)} per die</span></div>
            <div class="arc-actions"><button type="button" class="btn btn-sm btn-accent" onclick="ccRollHp()">Roll</button>
                <input type="number" min="1" class="stat-input arc-input" style="max-width: 100px;" value="${cc.hp ?? ''}" placeholder="HP" oninput="ccSet('hp', this.value)">
                <span class="sub-caption" style="margin: 0;">${cc.hpRolls ? `Dice: ${cc.hpRolls.join(', ')}` : ''}</span></div>
        </div>
        <div class="arc-panel">
            <div class="arc-row-head"><strong>Starting gold</strong><span class="eyebrow">3d6 × 10${cc.startLevel > 1 ? ` × ${cc.startLevel}` : ''} gp, plus a set of peasant clothes</span></div>
            <div class="arc-actions"><button type="button" class="btn btn-sm btn-accent" onclick="ccRollGold()">Roll</button>
                <input type="number" min="0" class="stat-input arc-input" style="max-width: 120px;" value="${cc.gold ?? ''}" placeholder="gp" oninput="ccSet('gold', this.value)">
                <span class="sub-caption" style="margin: 0;">${cc.goldRolls ? `Dice: ${cc.goldRolls.join(' + ')}` : ''}</span></div>
        </div>`;
    } else if (S === 5) {
        const n = ccFeatCount();
        const stub = ccCharacterStub();
        const weapons = Object.values(window.GlobalWeaponsDatabase || {}).filter(w => !/^(oil|holy|rock)/.test(w.id) && (typeof canCharacterUseWeapon !== 'function' || canCharacterUseWeapon(w, stub))).sort((a, b) => a.name.localeCompare(b.name));
        const spells = ccIsArcane() ? Object.values(GlobalSpellsDatabase).filter(s => s.casterType === 'arcane' && s.level === 1 && s.id !== 'arcane_read_magic').sort((a, b) => a.name.localeCompare(b.name)) : [];
        h = `<p class="sub-caption">Weapon feats: a ${escapeHtml(cc.cls)} ${cc.startLevel === 1 ? 'starts' : `of level ${cc.startLevel} has`} ${n} weapon feat${n > 1 ? 's' : ''}. ${cc.startLevel === 1 ? 'At 1st level each must be spent on Basic proficiency with a different weapon.' : 'Pick weapons at Basic here; raise ranks on the Combat tab afterwards.'}</p>
        ${cc.cls === 'Mystic' ? '<p class="sub-caption">Mystics fight with martial arts, so Unarmed Strikes is chosen for you: both Strike to Kill and Strike to Stun use it. Untick it only if your DM allows otherwise.</p>' : ''}
        <div class="tally" style="margin-bottom: 8px;"><span>Chosen <strong>${cc.weapons.length} / ${n}</strong></span></div>
        <div class="cc-weapons">${weapons.map(w => `<label class="arc-check cat-talent"><input type="checkbox" ${cc.weapons.includes(w.id) ? 'checked' : ''} ${!cc.weapons.includes(w.id) && cc.weapons.length >= n ? 'disabled' : ''} onchange="ccToggleWeapon('${w.id}')"> ${escapeHtml(w.name)}</label>`).join('')}</div>
        ${ccIsArcane() ? `
        <div class="arc-sub-head"><span class="eyebrow eyebrow-strong">Spell book</span></div>
        <p class="sub-caption">A new ${escapeHtml(cc.cls)} starts with a spell book holding Read Magic and one other 1st-level spell.</p>
        <select class="stat-input arc-input" style="max-width: 320px;" onchange="ccSet('spell', this.value)"><option value="">Choose a spell</option>${spells.map(s => `<option value="${s.id}" ${cc.spell === s.id ? 'selected' : ''}>${escapeHtml(s.name)}</option>`).join('')}</select>` : ''}`;
    } else if (S === 6) {
        const items = ccShopItems().filter(i => i.tab === cc.shopTab && (!cc.shopQuery || i.name.toLowerCase().includes(cc.shopQuery.toLowerCase())));
        const total = ccCartTotal();
        const left = (cc.gold || 0) - total;
        const cartRows = Object.entries(cc.cart).map(([k, q]) => { const it = ccShopItems().find(i => i.key === k); return it ? `<div class="arc-book-row"><span>${q} × ${escapeHtml(it.name)}</span><span class="eyebrow">${fmtCost(it.price * q)}</span><button type="button" class="icon-btn" onclick="ccBuy('${k}', -1)">−</button></div>` : ''; }).join('');
        h = `<p class="sub-caption">Spend your starting gold on equipment (Dark Dungeons Chapter 8 prices). Peasant clothes are free. Whatever is left goes in your purse.</p>
        <div class="tally" style="margin-bottom: 8px;"><span>Gold <strong>${(cc.gold || 0).toLocaleString('en-US')} gp</strong></span><span>Spent <strong>${fmtCost(total)}</strong></span><span>Left <strong style="color: var(--${left < 0 ? 'danger' : 'good'});">${fmtCost(left) === '—' ? '0 gp' : fmtCost(left)}</strong></span><span>Weight <strong>${Math.round(ccCartWeight())} cn</strong></span></div>
        ${cc.weapons.length ? '<div class="arc-actions"><button type="button" class="btn btn-sm" onclick="ccBuyFeatWeapons()">Buy my feat weapons</button></div>' : ''}
        <div class="cc-shop">
            <div>
                <div class="segmented" style="margin-bottom: 6px;">${[['gear', 'Gear'], ['weapons', 'Weapons'], ['armour', 'Armour']].map(([t, l]) => `<button type="button" class="${cc.shopTab === t ? 'on' : ''}" onclick="cc.shopTab='${t}'; renderCreationBody()">${l}</button>`).join('')}</div>
                <input type="search" class="stat-input arc-input" placeholder="Search" value="${escapeHtml(cc.shopQuery)}" oninput="ccSet('shopQuery', this.value)" style="margin-bottom: 6px;">
                <div class="cc-shop-list">${items.map(i => `<div class="arc-book-row${i.ok ? '' : ' cc-no'}"><span>${escapeHtml(i.name)}${i.ok ? '' : ' <span class="tag" style="color: var(--danger);">not for your class</span>'}</span><span class="eyebrow">${fmtCost(i.price)} · ${Math.round(i.weight * 10) / 10} cn</span><button type="button" class="icon-btn" onclick="ccBuy('${i.key}', 1)" ${i.price > left + 1e-9 ? 'disabled' : ''} aria-label="Buy ${escapeHtml(i.name)}">+</button></div>`).join('')}</div>
            </div>
            <div><div class="eyebrow eyebrow-strong" style="margin-bottom: 6px;">Bought</div><div class="arc-book">${cartRows || '<div class="ledger-note">Nothing yet.</div>'}</div></div>
        </div>`;
    } else if (S === 7) {
        const s = ccScores();
        const intS = s.intelligence;
        const langs = intS <= 3 ? 'Has trouble speaking; cannot read or write.' : intS <= 5 ? 'Cannot read or write Common.' : intS <= 8 ? 'Can write simple Common words.' : intS <= 12 ? 'Reads and writes their native languages (usually Common and their alignment tongue).' : `Reads and writes their native languages, plus ${intS <= 15 ? 1 : intS <= 17 ? 2 : 3} more.`;
        const skills = typeof getTotalSkillSlots === 'function' ? getTotalSkillSlots(ccCharacterStub()) : 4;
        h = `<div class="cc-review">
            <div><div class="eyebrow eyebrow-strong">${escapeHtml(cc.name)}</div><div>${escapeHtml(ccClassLabel(cc.cls))}, level ${cc.startLevel} · ${escapeHtml(cc.alignment)}</div>
                <div class="sub-caption" style="margin: 4px 0;">${cc.startXp ? '' : ''}XP ${ccStartXp().toLocaleString('en-US')} · HP ${cc.hp} · ${(Math.max(0, (cc.gold || 0) - ccCartTotal())).toLocaleString('en-US', { maximumFractionDigits: 2 })} gp left · XP bonus ${ccXpBonus() > 0 ? '+' : ''}${ccXpBonus()}%</div></div>
            <div class="cc-abilities">${ABILITY_LIST.map(k => ccAbilityRow(k, s[k])).join('')}</div>
            <div class="tally"><span>Weapons <strong>${cc.weapons.map(weaponNameOf).join(', ') || '—'}</strong></span>${ccIsArcane() ? `<span>Spells <strong>Read Magic${cc.spell ? ', ' + escapeHtml(GlobalSpellsDatabase[cc.spell]?.name || '') : ''}</strong></span>` : ''}<span>Items <strong>${Object.values(cc.cart).reduce((a, b) => a + b, 0) + 1}</strong></span></div>
        </div>
        <label class="arc-field" style="margin-top: 10px;"><span class="eyebrow">Languages</span><input type="text" class="stat-input arc-input" value="${escapeHtml(cc.languages || ccDefaultLanguages())}" oninput="ccSet('languages', this.value)" placeholder="Common, ${escapeHtml(cc.alignment)}..."></label>
        <p class="sub-caption">${escapeHtml(langs)}</p>
        ${cc.cls === 'Dwarf' ? '<p class="sub-caption">Every dwarf of Rockhome learns Mining and Engineering (GAZ6 p. 16): the sheet adds both, using two of your skill choices. Remove them on the General Skills tab if your dwarf is from elsewhere.</p>' : ''}
        <p class="sub-caption">After creating: choose ${cc.cls === 'Dwarf' ? `the other ${Math.max(0, skills - 2)}` : skills} general skill${skills > 1 ? 's' : ''} on the General Skills tab (4, plus your Intelligence bonus${cc.startLevel > 1 ? ', plus one per four levels' : ''}), and pick a deity on the sheet if your class needs one.</p>`;
    }
    body.innerHTML = h;
}

// --- Create -----------------------------------------------------------------------------------------
function createBlankCharacter() {
    closeCreationGuide();
    if (typeof createNewCharacterSheet === 'function') createNewCharacterSheet();
}
function finishCreation() {
    for (let s = 0; s < CREATION_STEPS.length; s++) { const p = ccStepProblem(s); if (p) { cc.step = s; renderCreation(); const el = document.getElementById('creation-problem'); if (el) el.textContent = p; return; } }
    const s = ccScores();
    const abilities = {}; ABILITY_LIST.forEach(k => { abilities[k] = { score: s[k], modifier: ccMod(s[k]) }; });
    const shop = ccShopItems();
    const inventory = [{ catalogId: 'dd_clothes_peasant', name: 'Clothes (peasant)', category: 'equipment', qty: 1, weight: 0, cost: 0.5, location: 'Carried', desc: 'Worn: does not count toward encumbrance.', magicBonus: 0, isCursed: false, isValuable: false }];
    Object.entries(cc.cart).forEach(([k, q]) => {
        const it = shop.find(i => i.key === k); if (!it) return;
        let item;
        if (it.kind === 'gear') { const g = DD_GEAR.find(x => x.id === it.id); item = { catalogId: g.id, name: g.name, category: g.category, qty: g.pack * q, weight: g.weight, cost: g.cost, desc: g.desc, source: g.source }; }
        if (it.kind === 'weapon') { const w = GlobalWeaponsDatabase[it.id]; item = { catalogId: 'weapon_' + w.id, weaponId: w.id, name: w.name, category: 'weapon', qty: q, weight: weaponWeight(w), cost: parseCostGp(w.cost), desc: '' }; }
        if (it.kind === 'armour') { const a = DD_ARMOUR.find(x => x.id === it.id); item = { ...armourItem(a), qty: q }; }
        if (item) inventory.push({ location: 'Backpack', magicBonus: 0, isCursed: false, isValuable: false, uid: newItemId(), ...item });
    });
    const goldLeft = Math.max(0, (cc.gold || 0) - ccCartTotal());
    const gp = Math.floor(goldLeft + 1e-9), rest = Math.round((goldLeft - gp) * 100);
    const char = {
        name: cc.name.trim(), characterClass: cc.cls, level: cc.startLevel, alignment: cc.alignment, experiencePoints: ccStartXp(),
        abilities, armorClass: 9, thac0: 19, hitPoints: { current: cc.hp, maximum: cc.hp },
        savingThrows: { deathRayPoison: 12, magicWands: 13, paralysisTurnToStone: 14, dragonBreath: 15, rodStaffSpell: 16 },
        coins: { cp: rest % 10, sp: Math.floor(rest / 10), ep: 0, gp, pp: 0 },
        inventory, weaponFeats: cc.weapons.map(id => ({ weaponId: id, rank: 'B', isEquipped: true })), skills: ccStartingSkills(), notes: [],
        bio: { gender: cc.gender, homeland: cc.homeland, languages: (cc.languages || '').trim() || ccDefaultLanguages(), personality: cc.concept },
    };
    if (ccIsArcane()) char.spellbook = { knownSpellIds: ['arcane_read_magic', ...(cc.spell ? [cc.spell] : [])], customSpells: [], preparedSpells: {} };
    if (typeof debouncedSave?.flush === 'function') debouncedSave.flush();
    currentFileName = null;
    const del = document.getElementById('delete-char-btn'); if (del) del.style.display = 'none';
    loadCharacterToUI(char);
    const rolled = ABILITY_LIST.map(k => `${ABILITY_SHORT[k]} ${cc.base[k]}${s[k] !== cc.base[k] ? `→${s[k]}` : ''}`).join(', ');
    if (typeof addChronicleEntry === 'function') addChronicleEntry('note', `Character created: ${char.name}, ${cc.cls} level ${cc.startLevel}. Abilities ${rolled}. ${cc.hp} hit points, ${cc.gold} gp starting gold.`, { created: true });
    saveChanges();
    closeCreationGuide();
    if (typeof switchTab === 'function') switchTab('tab-core');
}

Object.assign(window, {
    openCreationGuide, closeCreationGuide, renderCreation, renderCreationBody, ccGo, ccGoTo, ccSet, ccRollAbilities, ccSetBase,
    ccPickClass, ccAdjust, ccRollHp, ccRollGold, ccToggleWeapon, ccBuy, ccBuyFeatWeapons, createBlankCharacter, finishCreation,
});
