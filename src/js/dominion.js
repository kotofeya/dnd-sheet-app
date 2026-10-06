// js/dominion.js — the Dominion tab: noble title and dominion rule.
// Rules Cyclopedia (TSR 1071) Chapter 12, Strongholds and Dominions (pp. 134-139),
// with Glantri's notes from GAZ3 (p. 14).

const RC_DOMINIONS = 'Rules Cyclopedia, Chapter 12';

const NOBLE_TITLES = [
    { id: '',         m: 'No title',  f: 'No title' },
    { id: 'Knight',   m: 'Knight',    f: 'Dame',        address: '"Sir" / "Madam"', holds: 'A knighthood, not a dominion.' },
    { id: 'Baron',    m: 'Baron',     f: 'Baroness',    address: '"Your Lordship" / "Your Ladyship"', domain: 'Barony', visit: 100, holds: 'Rules a dominion of at least one stronghold and the population to support it. May appoint seneschals.', glantri: 180 },
    { id: 'Viscount', m: 'Viscount',  f: 'Viscountess', address: '"Your Lordship" / "Your Ladyship"', domain: 'Viscounty', visit: 150, holds: 'Rules one or more baronies, at least one through a baron. May appoint seneschals.', glantri: 120 },
    { id: 'Count',    m: 'Count',     f: 'Countess',    address: '"Your Lordship" / "Your Ladyship"', domain: 'County', visit: 300, holds: 'A viscount who added a dominion by conquest and rules at least three lesser dominions. May appoint barons and seneschals.', glantri: 80 },
    { id: 'Marquis',  m: 'Marquis',   f: 'Marquise',    address: '"Your Lordship" / "Your Ladyship"', domain: 'Marquisate', visit: 400, holds: 'A count who added more dominions by conquest. May appoint barons and seneschals.', glantri: 50 },
    { id: 'Duke',     m: 'Duke',      f: 'Duchess',     address: '"Your Grace"', domain: 'Duchy', visit: 600, holds: 'A marquis who added one or more dominions by any means. May appoint seneschals, barons, viscounts, counts and marquises.', glantri: 40 },
    { id: 'Archduke', m: 'Archduke',  f: 'Archduchess', address: '"Your Grace"', domain: 'Grand duchy', visit: 700, holds: 'A duke related to a king or emperor, ruling a dominion in the kingdom or empire.', glantri: 30 },
    { id: 'Prince',   m: 'Prince',    f: 'Princess',    address: '"Your Highness"', domain: 'Principality', visit: null, holds: 'A child of a king or emperor (by birth, marriage or adoption); grants titles only within the limits of the dominion ruled.' },
    { id: 'King',     m: 'King',      f: 'Queen',       address: '"Your Majesty"', domain: 'Kingdom', visit: 1000, holds: 'Ruler of a kingdom, whose lesser dominions are ruled by archdukes, dukes and others.' },
    { id: 'Emperor',  m: 'Emperor',   f: 'Empress',     address: '"Your Imperial Majesty"', domain: 'Empire', visit: 1500, holds: 'Ruler of a group of independent dominions, each ruled by a king, archduke, duke or lesser ruler.' },
];

const HEX_TYPES = [
    { id: 'Civilized',  families: '500-5,000' },
    { id: 'Borderland', families: '200-1,200' },
    { id: 'Wilderness', families: '10-100' },
];
const RESOURCE_TYPES = {
    Animal:    { gp: 2, examples: 'dairy, fat and oil, fish, fowl, furs, herds, bees, horses, ivory' },
    Vegetable: { gp: 1, examples: 'farm produce, foodstuffs, oil, fodder, wood and timber, paper, wine' },
    Mineral:   { gp: 3, examples: 'copper, silver, gold, platinum, iron, lead, tin, gems, tar and oil, clay, stone, coal' },
};
const OFFICIAL_ROLES = [
    { role: 'Seneschal', pay: 4000 }, { role: 'Castellan', pay: 2000 }, { role: 'Guard captain', pay: 4000 },
    { role: 'Magist', pay: 3000 }, { role: 'Chief magistrate', pay: 2000 }, { role: 'Sage', pay: 2000 },
    { role: 'Chief steward', pay: 1000 }, { role: 'Artillerist', pay: 750 }, { role: 'Engineer', pay: 750 },
    { role: 'Chaplain', pay: 500 }, { role: 'Reeve', pay: 500 }, { role: 'Herald', pay: 400 }, { role: 'Other', pay: 0 },
];
// Confidence level bands (RC p. 138). mult: income multipliers {std, res, tax}.
const CONFIDENCE_BANDS = [
    { min: 450, name: 'Ideal',       mult: { std: 1.1, res: 1.1, tax: 1.1 }, text: 'All income +10%. Enemy agents may be revealed (75% each). 25% chance a disaster does not happen. The level cannot drop below 400 at the next check, and +25 at the next check.' },
    { min: 400, name: 'Thriving',    mult: { std: 1.1, res: 1.1, tax: 1.1 }, text: 'All income +10%. Enemy agents may be revealed (75% each). 25% chance a disaster does not happen.' },
    { min: 350, name: 'Prosperous',  mult: { std: 1.1, res: 1.1, tax: 1.1 }, text: 'All income +10%. Agents revealed 25% each. 25% chance a disaster does not happen.' },
    { min: 300, name: 'Healthy',     mult: { std: 1.1, res: 1.1, tax: 1.1 }, text: 'All income +10%. Agents revealed 25% each.' },
    { min: 270, name: 'Steady',      mult: { std: 1, res: 1, tax: 1 }, text: 'Enemy agents revealed 25% each.' },
    { min: 230, name: 'Average',     mult: { std: 1, res: 1, tax: 1 }, text: 'No special effects.' },
    { min: 200, name: 'Unsteady',    mult: { std: 1, res: 1, tax: 1 }, text: '1 chance in 6 that the confidence level suddenly drops by 10%.' },
    { min: 150, name: 'Defiant',     mult: { std: 0.5, res: 0.5, tax: 0 }, text: 'Half the peasants form a militia. No tax income; standard and resource income half at best (one third where the militia is).' },
    { min: 100, name: 'Rebellious',  mult: { std: 1 / 3, res: 1 / 3, tax: 0 }, text: 'As Defiant, but standard and resource income one third or one quarter. -5 confidence each month below 200.' },
    { min: 50,  name: 'Belligerent', mult: { std: 0.25, res: 0.25, tax: 0 }, text: 'No tax; standard and resource income one quarter or none; -10 each month. Officials, caravans and travellers are attacked; demihumans are hostile.' },
    { min: 0,   name: 'Turbulent',   mult: { std: 0, res: 0, tax: 0 }, text: 'Open revolution: 95% of peasants join the militia. No income unless collected by force. Confidence cannot reach 100 until the ruler is removed.' },
];
const DOMINION_RULES = [
    'Income each month: standard income (services, not cash) 10 gp per family; tax 1 gp per family at the normal rate; resources 2 gp (animal), 1 gp (vegetable) or 3 gp (mineral) per family for each resource. A new dominion\'s income starts after one month.',
    'Experience: 1 XP per gp of resource and tax income, none for standard income or for what vassals pay you. The DM may limit this to about one level per 12-18 months of rule.',
    'Expenses: 20% of all income to your liege (usually as troops), and a 10% tithe to the local clerical order (without it no cleric serves in the dominion). Officials, troops, feasts, holidays and visitors are paid from the treasury.',
    'The treasury is cash and merchandise together; only 20-50% of it can be used as cash in a month.',
    'Population grows each month by +25% (1-100 families), +20% (101-200), +15% (201-300), +10% (301-400), +5% (401-500) or +1-5% (over 500), and may gain or lose 1-10 families for other reasons.',
    'Confidence: the base level is d% + 150 plus the total of the ruler\'s six ability scores, reset at the start of each year. Adjust it monthly for taxes, events, visitors, holidays and so on (about ±10 per item, ±50 a month at most).',
    'Each resource should be worked by at least 20% of the families. A hex bringing in over 15,000 gp of resources needs its own ruler.',
];

function dominionState() {
    if (!currentCharacter) return null;
    const dm = currentCharacter.dominion && typeof currentCharacter.dominion === 'object' ? currentCharacter.dominion : (currentCharacter.dominion = {});
    if (!dm.nobility || typeof dm.nobility !== 'object') dm.nobility = {};
    if (!Array.isArray(dm.resources)) dm.resources = [];
    if (!Array.isArray(dm.officials)) dm.officials = [];
    if (dm.families === undefined) dm.families = 0;
    if (dm.taxRate === undefined) dm.taxRate = 1;
    if (dm.payLiege === undefined) dm.payLiege = true;
    if (dm.tithe === undefined) dm.tithe = true;
    if (dm.addXp === undefined) dm.addXp = true;
    return dm;
}
const domNum = v => Math.max(0, Number(v) || 0);
const fmtGp = n => `${Math.round(Number(n) || 0).toLocaleString('en-US')} gp`;
function domSave(rerender = true) {
    if (typeof debouncedSave === 'function') debouncedSave();
    if (rerender) renderDominion();
}
function domLog(text, data = {}) {
    if (typeof addChronicleEntry === 'function') addChronicleEntry('dominion', text, data);
}
function nobleTitle(id) {
    return NOBLE_TITLES.find(t => t.id === id) || NOBLE_TITLES[0];
}
function titleName(nob) {
    const t = nobleTitle(nob.title);
    return nob.female ? t.f : t.m;
}
function confidenceBand(level) {
    const n = Number(level) || 0;
    return CONFIDENCE_BANDS.find(b => n >= b.min) || CONFIDENCE_BANDS[CONFIDENCE_BANDS.length - 1];
}
function populationGrowthPct(families) {
    const f = Number(families) || 0;
    if (f <= 0) return 0;
    if (f <= 100) return 25;
    if (f <= 200) return 20;
    if (f <= 300) return 15;
    if (f <= 400) return 10;
    if (f <= 500) return 5;
    return null;               // over 500: 1-5%, rolled
}

function dominionIncome(dm = dominionState()) {
    const F = domNum(dm.families);
    const band = confidenceBand(dm.confidence);
    const resGp = dm.resources.reduce((s, r) => s + (RESOURCE_TYPES[r.type]?.gp || 0), 0);
    const std = Math.round(10 * F * band.mult.std);
    const res = Math.round(resGp * F * band.mult.res);
    const tax = Math.round(Number(dm.taxRate ?? 1) * F * band.mult.tax);
    const salt = domNum(dm.saltTax);
    const income = std + res + tax + salt;
    const liege = dm.payLiege ? Math.round((std + res + tax) * 0.2) : 0;
    const tithe = dm.tithe ? Math.round(income * 0.1) : 0;
    const officials = dm.officials.reduce((s, o) => s + domNum(o.pay), 0);
    const other = domNum(dm.otherCosts);
    const expenses = liege + tithe + officials + other;
    return { std, res, tax, salt, income, liege, tithe, officials, other, expenses, net: income - expenses, xp: res + tax, band, resGp };
}

// ----- Nobility -----
function setNobility(field, value) {
    const dm = dominionState(); if (!dm) return;
    const nob = dm.nobility;
    const before = titleName(nob);
    if (field === 'female') nob.female = Boolean(value);
    else nob[field] = String(value || '').slice(0, 200);
    if (field === 'title' && titleName(nob) !== before) {
        domLog(nob.title ? `Title: ${titleName(nob)}${nob.of ? ' of ' + nob.of : ''}.` : `Title ${before} given up.`, { title: nob.title });
    }
    domSave();
    if (typeof renderArcana === 'function') renderArcana();        // Radiance depends on the title
}

// ----- Dominion -----
function setDominionField(field, value) {
    const dm = dominionState(); if (!dm) return;
    const bools = ['has', 'payLiege', 'tithe', 'addXp'];
    const nums = ['families', 'taxRate', 'confidence', 'baseConfidence', 'hexes', 'distance', 'saltTax', 'otherCosts', 'treasury', 'month', 'year'];
    if (bools.includes(field)) dm[field] = Boolean(value);
    else if (nums.includes(field)) dm[field] = field === 'taxRate' ? Math.max(0, Number(value) || 0) : Math.round(Number(value) || 0);
    else dm[field] = String(value || '').slice(0, 200);
    if (field === 'confidence') dm.confidence = Math.max(0, Math.min(500, dm.confidence));
    if (field === 'has' && value && !dm.name) domLog('Became the ruler of a dominion.');
    domSave();
}
function addResource() {
    const dm = dominionState(); if (!dm) return;
    dm.resources.push({ id: `res_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`, type: 'Vegetable', name: '' });
    domSave();
}
function updateResource(id, field, value) {
    const dm = dominionState(); if (!dm) return;
    const r = dm.resources.find(x => x.id === id); if (!r) return;
    r[field] = String(value || '').slice(0, 80);
    domSave();
}
function removeResource(id) {
    const dm = dominionState(); if (!dm) return;
    dm.resources = dm.resources.filter(x => x.id !== id);
    domSave();
}
function addOfficial() {
    const dm = dominionState(); if (!dm) return;
    const sel = document.getElementById('dom-official-role');
    const role = OFFICIAL_ROLES.find(r => r.role === sel?.value) || OFFICIAL_ROLES[0];
    dm.officials.push({ id: `off_${Date.now()}_${Math.random().toString(36).slice(2, 5)}`, role: role.role, name: '', pay: role.pay });
    domSave();
}
function updateOfficial(id, field, value) {
    const dm = dominionState(); if (!dm) return;
    const o = dm.officials.find(x => x.id === id); if (!o) return;
    if (field === 'pay') o.pay = Math.max(0, Math.round(Number(value) || 0));
    else o[field] = String(value || '').slice(0, 80);
    domSave();
}
function removeOfficial(id) {
    const dm = dominionState(); if (!dm) return;
    dm.officials = dm.officials.filter(x => x.id !== id);
    domSave();
}
// Base confidence: d% + 150 + the six ability scores.
function rollBaseConfidence() {
    const dm = dominionState(); if (!dm || !currentCharacter) return;
    const abilities = ['strength', 'intelligence', 'wisdom', 'dexterity', 'constitution', 'charisma'].reduce((s, k) => s + (Number(currentCharacter.abilities?.[k]?.score) || 10), 0);
    const roll = 1 + Math.floor(Math.random() * 100);
    dm.baseConfidence = Math.min(500, roll + 150 + abilities);
    dm.confidence = dm.baseConfidence;
    domLog(`Base confidence set to ${dm.baseConfidence} (d% ${roll} + 150 + abilities ${abilities}): ${confidenceBand(dm.confidence).name}.`);
    domSave();
}
function newDominionYear() {
    const dm = dominionState(); if (!dm) return;
    const wasIdeal = confidenceBand(dm.confidence).name === 'Ideal';
    const base = Number(dm.baseConfidence) || Number(dm.confidence) || 0;
    dm.confidence = Math.min(500, base + (wasIdeal ? 25 : 0));
    if (wasIdeal) dm.confidence = Math.max(400, dm.confidence);
    dm.year = (Number(dm.year) || 0) + 1;
    const band = confidenceBand(dm.confidence);
    domLog(`New year in ${dm.name || 'the dominion'}: confidence check at ${dm.confidence}, ${band.name}. ${band.text} Roll 1d4 events for the year.`, { confidence: dm.confidence });
    domSave();
}
// Award XP that the bonus percentages do not apply to (one level per award at most).
function awardRawXp(amount, text) {
    if (!currentCharacter || amount <= 0) return 0;
    const table = getXpTableFor(currentCharacter);
    const lvl = Number(currentCharacter.level) || 1;
    const xpBefore = Number(currentCharacter.experiencePoints) || 0;
    let newXp = xpBefore + amount;
    if (table && lvl < 36) newXp = Math.min(newXp, typeof xpAwardCap === 'function' ? xpAwardCap(currentCharacter) : (table[lvl + 2] ?? Infinity) - 1);
    const stageBefore = typeof getCreatureStage === 'function' ? getCreatureStage(currentCharacter) : null;
    currentCharacter.experiencePoints = newXp;
    let levelAfter = lvl;
    if (table && lvl < 36 && table[lvl + 1] !== undefined && newXp >= table[lvl + 1]) {
        levelAfter = lvl + 1;
        currentCharacter.level = levelAfter;
        safeSetVal('char-level', levelAfter);
    }
    writeXp('char-xp', newXp);
    try { updateClassStats(); updateCombatVitals(); updateXPDisplay(); } catch (e) { console.error(e); }
    const credited = newXp - xpBefore;
    if (typeof addChronicleEntry === 'function') addChronicleEntry('xp', `${text}: +${credited.toLocaleString('en-US')} XP${credited < amount ? ' (capped: one level per award)' : ''}. Total ${newXp.toLocaleString('en-US')}.`, { awarded: amount, credited, total: newXp });
    const stageAfter = typeof getCreatureStage === 'function' ? getCreatureStage(currentCharacter) : null;
    if (typeof openLevelUpDialog === 'function') {
        if (stageBefore && stageAfter !== stageBefore) openLevelUpDialog(lvl, levelAfter, { stageFrom: stageBefore, stageTo: stageAfter });
        else if (levelAfter > lvl) openLevelUpDialog(lvl, levelAfter);
    }
    return credited;
}
function endDominionMonth() {
    const dm = dominionState(); if (!dm) return;
    if (typeof calendarState === 'function') { calendarState().dominionMonth = calParts(calendarState().t).monthAbs; if (typeof renderGameClock === 'function') renderGameClock(); }
    const inc = dominionIncome(dm);
    const extraFamilies = Math.round(Number(document.getElementById('dom-month-families')?.value) || 0);
    const confAdj = Math.round(Number(document.getElementById('dom-month-confidence')?.value) || 0);
    const F = domNum(dm.families);
    let pct = populationGrowthPct(F);
    if (pct === null) pct = 1 + Math.floor(Math.random() * 5);
    const growth = Math.floor(F * pct / 100);
    dm.families = Math.max(0, F + growth + extraFamilies);
    dm.treasury = Math.round((Number(dm.treasury) || 0) + inc.net);
    let confText = '';
    let monthlyPenalty = 0;
    if (inc.band.name === 'Rebellious') monthlyPenalty = -5;
    if (inc.band.name === 'Belligerent') monthlyPenalty = -10;
    if (confAdj || monthlyPenalty) {
        const before = Number(dm.confidence) || 0;
        dm.confidence = Math.max(0, Math.min(500, before + confAdj + monthlyPenalty));
        confText = ` Confidence ${before} → ${dm.confidence} (${confidenceBand(dm.confidence).name}).`;
    }
    dm.month = (Number(dm.month) || 0) + 1;
    const where = dm.name || 'the dominion';
    domLog(`Month ${dm.month} in ${where}: income ${fmtGp(inc.income)} (standard ${fmtGp(inc.std)}, resources ${fmtGp(inc.res)}, tax ${fmtGp(inc.tax)}${inc.salt ? `, vassals ${fmtGp(inc.salt)}` : ''}), expenses ${fmtGp(inc.expenses)}, treasury ${fmtGp(dm.treasury)}. Population ${F} → ${dm.families} families (+${pct}%${extraFamilies ? `, ${extraFamilies > 0 ? '+' : ''}${extraFamilies} other` : ''}).${confText}`,
        { income: inc.income, expenses: inc.expenses, treasury: dm.treasury, families: dm.families, xp: inc.xp });
    if (dm.addXp && inc.xp > 0) awardRawXp(inc.xp, `Rule of ${where}, month ${dm.month} (resource and tax income)`);
    if (typeof saveChanges === 'function') saveChanges();
    renderDominion();
}

// ----- Render -----
function renderNobilityCard() {
    const dm = dominionState();
    const nob = dm.nobility;
    const t = nobleTitle(nob.title);
    const name = titleName(nob);
    const level = Number(currentCharacter.level) || 1;
    const visit = t.id === 'Prince' ? 'the cost of the dominion title + 100 gp' : (t.visit ? fmtGp(t.visit) : '');
    const style = nob.title ? `${name} ${escapeHtml(currentCharacter.name || '')}${nob.of ? ` of ${escapeHtml(nob.of)}` : ''}` : escapeHtml(currentCharacter.name || '');
    const glantriNote = (t.glantri && nob.glantri) ? `
        <p class="sub-caption arc-note">In Glantri only wizards of 9th level or higher may be nobles${level < 9 ? ` <span style="color: var(--danger);">(you are level ${level})</span>` : ''}, and a ${escapeHtml(t.domain.toLowerCase())} lies no closer than ${t.glantri} miles to the capital.</p>` : '';
    return `
    <div class="card" id="dominion-nobility-card">
        <div class="panel-head">
            <h2>Nobility</h2>
            <span class="eyebrow eyebrow-strong">${style}</span>
        </div>
        <div class="arc-fields">
            <label class="arc-field"><span class="eyebrow">Title</span>
                <select class="stat-input arc-input" onchange="setNobility('title', this.value)">${NOBLE_TITLES.map(x => `<option value="${x.id}" ${nob.title === x.id ? 'selected' : ''}>${escapeHtml(x.id ? `${x.m} / ${x.f}` : x.m)}</option>`).join('')}</select></label>
            <label class="arc-check"><input type="checkbox" ${nob.female ? 'checked' : ''} onchange="setNobility('female', this.checked)"> Feminine form</label>
            <label class="arc-field"><span class="eyebrow">Of (seat or land)</span><input type="text" class="stat-input arc-input" value="${escapeHtml(nob.of || '')}" placeholder="e.g. Mariksen" onchange="setNobility('of', this.value)"></label>
            <label class="arc-field"><span class="eyebrow">Liege</span><input type="text" class="stat-input arc-input" value="${escapeHtml(nob.liege || '')}" placeholder="Who granted the title" onchange="setNobility('liege', this.value)"></label>
            <label class="arc-field"><span class="eyebrow">Other titles and honours</span><input type="text" class="stat-input arc-input" value="${escapeHtml(nob.other || '')}" placeholder="Lesser titles, charges, orders" onchange="setNobility('other', this.value)"></label>
            <label class="arc-check"><input type="checkbox" ${nob.glantri ? 'checked' : ''} onchange="setNobility('glantri', this.checked ? '1' : '')"> Glantrian nobility</label>
        </div>
        ${nob.title ? `
        <div class="tally" style="margin: 10px 0;">
            ${t.address ? `<span>Address <strong>${escapeHtml(t.address)}</strong></span>` : ''}
            ${t.domain ? `<span>Dominion <strong>${escapeHtml(t.domain)}</strong></span>` : ''}
            ${visit ? `<span>Hosting your visit costs <strong>${escapeHtml(visit)}</strong> a day</span>` : ''}
        </div>
        <p class="sub-caption">${escapeHtml(t.holds || '')}${['Archduke', 'Prince', 'King', 'Emperor'].includes(t.id) ? ' Royalty usually says "we" in formal speech.' : ''} Titles are cumulative and are kept even if the dominion is lost.</p>` : '<p class="sub-caption">Nobles usually gain their titles by grant from royalty or another sovereign ruler. A character who settles true wilderness may choose a title, though neighbours may react to the upstart.</p>'}
        ${glantriNote}
        <div class="arc-source">${escapeHtml(RC_DOMINIONS)}, pp. 135-136${nob.glantri ? '; GAZ3 p. 14' : ''}</div>
    </div>`;
}

function renderDominionCard() {
    const dm = dominionState();
    const head = `
        <div class="panel-head">
            <h2>Dominion</h2>
            <label class="arc-check"><input type="checkbox" ${dm.has ? 'checked' : ''} onchange="setDominionField('has', this.checked)"> Rules a dominion</label>
        </div>`;
    if (!dm.has) {
        return `<div class="card" id="dominion-card">${head}<p class="sub-caption">A stronghold, the land around it and the families who work it. Tick the box when your character rules one to track population, resources, income, confidence and the treasury month by month.</p><div class="arc-source">${escapeHtml(RC_DOMINIONS)}</div></div>`;
    }
    const inc = dominionIncome(dm);
    const hex = HEX_TYPES.find(h => h.id === dm.hexType);
    const growth = populationGrowthPct(dm.families);
    const resRows = dm.resources.map(r => `
        <div class="arc-book-row">
            <select class="stat-input arc-input" style="max-width: 140px;" onchange="updateResource('${r.id}', 'type', this.value)">${Object.keys(RESOURCE_TYPES).map(k => `<option ${r.type === k ? 'selected' : ''}>${k}</option>`).join('')}</select>
            <input type="text" class="stat-input arc-input" style="flex: 1;" value="${escapeHtml(r.name || '')}" placeholder="${escapeHtml(RESOURCE_TYPES[r.type]?.examples || '')}" onchange="updateResource('${r.id}', 'name', this.value)">
            <span class="eyebrow">${RESOURCE_TYPES[r.type]?.gp || 0} gp / family</span>
            <button type="button" class="icon-btn danger" onclick="removeResource('${r.id}')" aria-label="Remove resource">${getIcon('close', 13)}</button>
        </div>`).join('');
    const offRows = dm.officials.map(o => `
        <div class="arc-book-row">
            <span style="min-width: 120px;"><strong>${escapeHtml(o.role)}</strong></span>
            <input type="text" class="stat-input arc-input" style="flex: 1;" value="${escapeHtml(o.name || '')}" placeholder="Name" onchange="updateOfficial('${o.id}', 'name', this.value)">
            <input type="number" min="0" class="stat-input arc-input" style="max-width: 110px;" value="${domNum(o.pay)}" onchange="updateOfficial('${o.id}', 'pay', this.value)"><span class="eyebrow">gp / month</span>
            <button type="button" class="icon-btn danger" onclick="removeOfficial('${o.id}')" aria-label="Remove official">${getIcon('close', 13)}</button>
        </div>`).join('');
    const num = (field, label, val, attrs = '') => `<label class="arc-field arc-narrow"><span class="eyebrow">${label}</span><input type="number" class="stat-input arc-input" value="${escapeHtml(val ?? '')}" ${attrs} onchange="setDominionField('${field}', this.value)"></label>`;
    const txt = (field, label, val, ph = '') => `<label class="arc-field"><span class="eyebrow">${label}</span><input type="text" class="stat-input arc-input" value="${escapeHtml(val || '')}" placeholder="${escapeHtml(ph)}" onchange="setDominionField('${field}', this.value)"></label>`;
    const band = inc.band;
    const conf = Number(dm.confidence) || 0;
    return `
    <div class="card" id="dominion-card">
        ${head}
        <div class="arc-fields">
            ${txt('name', 'Name', dm.name, 'e.g. Barony of Mariksen')}
            ${txt('stronghold', 'Stronghold', dm.stronghold, 'Castle, tower...')}
            <label class="arc-field"><span class="eyebrow">Land</span><select class="stat-input arc-input" onchange="setDominionField('hexType', this.value)"><option value="">Choose...</option>${HEX_TYPES.map(h => `<option ${dm.hexType === h.id ? 'selected' : ''}>${h.id}</option>`).join('')}</select></label>
            ${txt('terrain', 'Terrain', dm.terrain, 'Hills, woods...')}
            ${num('hexes', 'Hexes (24 mi)', dm.hexes, 'min="0"')}
            ${num('distance', 'Miles from capital', dm.distance, 'min="0"')}
            ${txt('liege', 'Liege', dm.liege, 'Leave empty if independent')}
        </div>

        <div class="arc-sub-head"><span class="eyebrow eyebrow-strong">People and land</span>${hex ? `<span class="eyebrow">${escapeHtml(hex.id)} hexes start with ${hex.families} families</span>` : ''}</div>
        <div class="arc-fields">
            ${num('families', 'Peasant families', dm.families, 'min="0"')}
            ${num('taxRate', 'Tax (gp per family)', dm.taxRate, 'min="0" step="0.5"')}
            ${num('saltTax', 'From vassals (gp/month)', dm.saltTax, 'min="0"')}
        </div>
        <p class="sub-caption arc-note">About ${(domNum(dm.families) * 5).toLocaleString('en-US')} people. Monthly growth ${growth === null ? '+1d5%' : `+${growth}%`}${growth === 0 ? '' : ''}.</p>
        <div class="arc-sub-head"><span class="eyebrow eyebrow-strong">Resources</span><button type="button" class="btn btn-sm" onclick="addResource()">+ Resource</button></div>
        <div class="arc-book">${resRows || '<div class="ledger-note">No resources yet (most dominions have 2-3).</div>'}</div>

        <div class="arc-sub-head"><span class="eyebrow eyebrow-strong">Confidence</span><span class="eyebrow">${band.name}</span></div>
        <div class="arc-fields">
            ${num('confidence', 'Current (1-500)', dm.confidence, 'min="0" max="500"')}
            ${num('baseConfidence', 'Base this year', dm.baseConfidence, 'min="0" max="500"')}
            <div class="arc-actions" style="margin: 0;"><button type="button" class="btn btn-sm" onclick="rollBaseConfidence()" title="d% + 150 + your six ability scores">Roll base</button><button type="button" class="btn btn-sm" onclick="newDominionYear()">New year: confidence check</button></div>
        </div>
        <div class="xp-bar" style="margin: 8px 0 4px;" title="${conf} / 500"><div class="xp-bar-fill" style="width: ${Math.min(100, conf / 5)}%;"></div></div>
        <p class="sub-caption arc-note"><strong>${band.name}.</strong> ${escapeHtml(band.text)}</p>

        <div class="arc-sub-head"><span class="eyebrow eyebrow-strong">Officials</span>
            <span class="arc-actions" style="margin: 0; flex-wrap: nowrap;"><select id="dom-official-role" class="stat-input arc-input" style="max-width: 200px;">${OFFICIAL_ROLES.map(r => `<option>${r.role}</option>`).join('')}</select><button type="button" class="btn btn-sm" onclick="addOfficial()">+ Official</button></span></div>
        <div class="arc-book">${offRows || '<div class="ledger-note">No officials hired.</div>'}</div>

        <div class="arc-sub-head"><span class="eyebrow eyebrow-strong">Monthly accounts</span>${band.mult.std !== 1 || band.mult.tax !== 1 ? `<span class="eyebrow">adjusted for a ${band.name.toLowerCase()} dominion</span>` : ''}</div>
        <div class="dom-ledger">
            <div><span>Standard income (services)</span><strong>${fmtGp(inc.std)}</strong></div>
            <div><span>Resource income (${inc.resGp} gp × families)</span><strong>${fmtGp(inc.res)}</strong></div>
            <div><span>Tax income</span><strong>${fmtGp(inc.tax)}</strong></div>
            ${inc.salt ? `<div><span>From vassals</span><strong>${fmtGp(inc.salt)}</strong></div>` : ''}
            <div class="dom-total"><span>Income</span><strong>${fmtGp(inc.income)}</strong></div>
            <div><span><label class="arc-check"><input type="checkbox" ${dm.payLiege ? 'checked' : ''} onchange="setDominionField('payLiege', this.checked)"> 20% to the liege</label></span><strong>−${fmtGp(inc.liege)}</strong></div>
            <div><span><label class="arc-check"><input type="checkbox" ${dm.tithe ? 'checked' : ''} onchange="setDominionField('tithe', this.checked)"> 10% tithe</label></span><strong>−${fmtGp(inc.tithe)}</strong></div>
            <div><span>Officials</span><strong>−${fmtGp(inc.officials)}</strong></div>
            <div><span>Other costs <input type="number" min="0" class="stat-input arc-input" style="max-width: 110px; display: inline-block;" value="${domNum(dm.otherCosts)}" onchange="setDominionField('otherCosts', this.value)"></span><strong>−${fmtGp(inc.other)}</strong></div>
            <div class="dom-total"><span>Net to the treasury</span><strong style="color: var(--${inc.net >= 0 ? 'good' : 'danger'});">${inc.net >= 0 ? '+' : '−'}${fmtGp(Math.abs(inc.net))}</strong></div>
            <div><span>Experience (resource + tax)</span><strong>${inc.xp.toLocaleString('en-US')} XP</strong></div>
        </div>
        ${inc.res > 15000 ? '<p class="sub-caption arc-note" style="color: var(--danger);">Over 15,000 gp of resources from one hex: it needs its own ruler, or d10 × 10% is stolen.</p>' : ''}

        <div class="arc-fields" style="margin-top: 10px;">
            ${num('treasury', 'Treasury (gp)', dm.treasury)}
            <span class="sub-caption arc-note" style="align-self: end;">Cash usable this month: ${fmtGp(domNum(dm.treasury) * 0.2)}-${fmtGp(domNum(dm.treasury) * 0.5)}</span>
        </div>
        <div class="arc-panel">
            <div class="arc-row-head"><strong>End of month ${(Number(dm.month) || 0) + 1}</strong><span class="eyebrow">Year ${Number(dm.year) || 1}</span></div>
            <div class="arc-fields">
                <label class="arc-field arc-narrow"><span class="eyebrow">Other family change</span><input type="number" id="dom-month-families" class="stat-input arc-input" value="0" title="Gain or loss of 1-10 families (weather, harvests, accidents)"></label>
                <label class="arc-field arc-narrow"><span class="eyebrow">Confidence change</span><input type="number" id="dom-month-confidence" class="stat-input arc-input" value="0" title="±10 per item, ±50 a month at most"></label>
                <label class="arc-check"><input type="checkbox" ${dm.addXp ? 'checked' : ''} onchange="setDominionField('addXp', this.checked)"> Add the XP to the character</label>
                <button type="button" class="btn btn-sm btn-accent" onclick="endDominionMonth()">End month</button>
            </div>
            <p class="sub-caption" style="margin: 6px 0 0;">Adds the net income to the treasury, grows the population, applies the confidence change${dm.addXp ? ', credits the XP' : ''} and writes it to the Adventure Log.</p>
        </div>
        <details class="arc-rules"><summary>How dominions work</summary><ul>${DOMINION_RULES.map(r => `<li>${escapeHtml(r)}</li>`).join('')}</ul></details>
        <div class="arc-source">${escapeHtml(RC_DOMINIONS)}, pp. 136-139</div>
    </div>`;
}

function renderDominion() {
    const root = document.getElementById('dominion-root');
    if (!root || !currentCharacter) return;
    dominionState();
    const active = document.activeElement && root.contains(document.activeElement) ? document.activeElement.id : null;
    root.innerHTML = renderNobilityCard() + renderDominionCard();
    if (active) { const el = document.getElementById(active); if (el) el.focus(); }
}

Object.assign(window, {
    renderDominion, dominionState, dominionIncome, confidenceBand, setNobility, setDominionField,
    addResource, updateResource, removeResource, addOfficial, updateOfficial, removeOfficial,
    rollBaseConfidence, newDominionYear, endDominionMonth, awardRawXp,
});
