// js/companions.js — the Companions tab: retainers and hirelings, mercenaries, specialists,
// familiars (and homunculi), animals and other followers.
// Sources: Rules Cyclopedia Chapter 9 (pp. 132-133) and Charisma table (p. 10); Dark Dungeons
// Chapter 8 (Tables 8-8 to 8-10); Tome of the Magic of Mystara vol. 1 (Bind an Animal Familiar,
// Bind a Homunculus, pp. 5-6).

const COMPANION_KINDS = {
    retainer:   { label: 'Retainer / hireling', plural: 'Retainers & hirelings', icon: 'party' },
    mercenary:  { label: 'Mercenaries',          plural: 'Mercenaries',          icon: 'sword' },
    specialist: { label: 'Specialist',           plural: 'Specialists',          icon: 'candle' },
    familiar:   { label: 'Familiar',             plural: 'Familiars',            icon: 'eye' },
    animal:     { label: 'Animal or follower',   plural: 'Animals & other followers', icon: 'horse' },
};
const COMPANION_STATUS = [
    { id: 'with',      label: 'With the party' },
    { id: 'home',      label: 'At home / on duty' },
    { id: 'away',      label: 'Away on an errand' },
    { id: 'dismissed', label: 'Dismissed' },
    { id: 'dead',      label: 'Dead' },
];
const PAY_BASIS = [
    { id: 'month',   label: 'per month' },
    { id: 'mission', label: 'per mission' },
    { id: 'none',    label: 'unpaid' },
];
const TREASURE_SHARE = [
    { id: 'none', label: 'No share (salary only)' },
    { id: 'half', label: 'Half share' },
    { id: 'full', label: 'Full share' },
];

// Rules Cyclopedia p. 10, Charisma Adjustment Table.
function charismaRetainerRow(cha) {
    const s = Number(cha) || 10;
    if (s <= 3) return { reaction: -3, max: 1, morale: 4 };
    if (s <= 5) return { reaction: -2, max: 2, morale: 5 };
    if (s <= 8) return { reaction: -1, max: 3, morale: 6 };
    if (s <= 12) return { reaction: 0, max: 4, morale: 7 };
    if (s <= 15) return { reaction: 1, max: 5, morale: 8 };
    if (s <= 17) return { reaction: 2, max: 6, morale: 9 };
    return { reaction: 3, max: 7, morale: 10 };
}

// Dark Dungeons Table 8-9 (gp per month, peacetime; double for active war).
const MERCENARY_TYPES = [
    { id: 'archer',        name: 'Archer',            gear: 'leather, short bow, sword',      cost: { Human: 5, Elf: 10, Goblin: 2, Orc: 3 } },
    { id: 'cav_heavy',     name: 'Cavalry, heavy',    gear: 'plate, sword, lance, barded war horse', cost: { Human: 20 } },
    { id: 'cav_light',     name: 'Cavalry, light',    gear: 'leather, lance, war horse',      cost: { Human: 10, Elf: 20 } },
    { id: 'cav_medium',    name: 'Cavalry, medium',   gear: 'chain, lance, war horse',        cost: { Human: 15 } },
    { id: 'crossbowman',   name: 'Crossbowman',       gear: 'chain, heavy crossbow',          cost: { Human: 4, Dwarf: 6, Orc: 2 } },
    { id: 'foot_heavy',    name: 'Footman, heavy',    gear: 'chain, shield, sword',           cost: { Human: 3, Dwarf: 5, Elf: 6, Orc: 1.5 } },
    { id: 'foot_light',    name: 'Footman, light',    gear: 'leather, shield, sword',         cost: { Human: 2, Elf: 4, Goblin: 0.5, Orc: 1 } },
    { id: 'horse_archer',  name: 'Horse archer',      gear: 'short bow, horse',               cost: { Human: 15, Elf: 30 } },
    { id: 'longbowman',    name: 'Longbowman',        gear: 'chain, longbow, sword',          cost: { Human: 10, Elf: 20 } },
    { id: 'militia',       name: 'Militia',           gear: 'commoners with spears',          cost: { Human: 1 } },
    { id: 'pony_xbow',     name: 'Pony crossbowman',  gear: 'crossbow, pony',                 cost: { Dwarf: 15 } },
    { id: 'wolf_rider',    name: 'Wolf rider',        gear: 'leather, spear, dire wolf',      cost: { Goblin: 5 } },
];
// Dark Dungeons Table 8-10 (gp per month unless noted).
const SPECIALIST_TYPES = [
    ['Animal Trainer', 500, 'Trains unusual animals (not horses, mules or dogs); up to six of one species; about a month per trick.'],
    ['Armourer', 100, 'Makes and repairs armour; one per 50 troops.'],
    ['Artillerist', 750, 'Fighter of 3rd-5th level in charge of siege weapons.'],
    ['Bailiff', 5, 'Keeps part or all of a castle in good repair.'],
    ['Blacksmith', 25, 'Smelts iron and makes steel and simple metal goods.'],
    ['Castellan', 2000, 'Fighter of 5th-9th level in charge of a stronghold\'s military affairs.'],
    ['Chamberlain', 5, 'In charge of a stronghold\'s cleaning and cooking staff.'],
    ['Chaplain', 500, 'Salaried cleric running a stronghold\'s chapel.'],
    ['Chemist', 1000, 'Non-spellcaster alchemist: makes potions like a magic-user at twice the time and cost.'],
    ['Chief Magistrate', 2000, 'Oversees justice in a dominion, its magistrates and sheriffs.'],
    ['Engineer', 750, 'Oversees large construction; one per 100,000 gp of building.'],
    ['Equerry', 5, 'In charge of the stables.'],
    ['Guard Captain', 4000, 'Fighter of 8th level or more in charge of the guard and the stronghold\'s defence.'],
    ['Herald', 400, 'Announcements, news and heraldry of nearby rulers; advises on etiquette.'],
    ['Magist', 3000, 'Magic-user of 9th level or more advising on magical affairs (3,000 gp or more).'],
    ['Marshal', 5, 'Fighter in charge of a troop of soldiers.'],
    ['Provost', 5, 'Keeps order among the troops.'],
    ['Reeve', 500, 'Manages farmland and the peasants who work it.'],
    ['Rower', 2, 'Oars a galley or longship; fights only when desperate.'],
    ['Sage', 2000, 'Answers obscure questions, with a chance of failure; rare.'],
    ['Sailor', 10, 'Sails a vessel; fights as a light footman.'],
    ['Seneschal', 4000, 'Runs a whole stronghold on the ruler\'s behalf.'],
    ['Sheriff', 5, 'Keeps the peace in part of a dominion.'],
    ['Ship\'s Captain', 250, 'Commands a ship; knows coastal waters.'],
    ['Ship\'s Navigator', 150, 'Pilots on long ocean voyages; without one, a ship out of sight of land is lost.'],
    ['Spy', 500, 'Spies on a group, per mission (Rules Cyclopedia); loyalty known only to the DM.'],
    ['Steward', 1000, 'Household affairs: housekeeping and food supplies.'],
    ['Warden', 5, 'Guards a stronghold\'s prison or forest.'],
    ['Skilled worker', 5, 'Any other skilled specialist (leatherworker, scribe...).'],
    ['Unskilled worker', 2, 'Labourer, porter, servant.'],
];
// Tome of the Magic of Mystara vol. 1, p. 5: animal familiars and the skill each gives its master.
const FAMILIAR_ANIMALS = [
    ['Bat', 'Listen'], ['Bear', 'Endurance'], ['Cat', 'Balance'], ['Chameleon', 'Camouflage'], ['Dog', 'Scent'],
    ['Falcon', 'Observe'], ['Frog / toad', 'Jump'], ['Horse', 'Toughness'], ['Leopard', 'Jump'], ['Lion', 'Courage'],
    ['Monkey', 'Acrobatics'], ['Owl', 'Concentration'], ['Rat', 'Sneak'], ['Raven', 'Alertness'], ['Snake', 'Move Silently'],
    ['Squirrel', 'Climb'], ['Tiger', 'Intimidate'], ['Weasel', 'Surprise'],
];
// The sheet's own skill for a familiar's gift, where one fits; otherwise a homebrew skill of that name.
const FAMILIAR_SKILL_MAP = {
    Acrobatics: 'acrobatics', Alertness: 'alertness', Camouflage: 'hiding', Climb: 'mountaineering', Courage: 'bravery',
    Endurance: 'endurance', Intimidate: 'intimidation', Jump: 'jump', 'Move Silently': 'move_silently', Toughness: 'stamina',
    Sneak: 'stealth',
};
const FAMILIAR_SKILL_ABILITY = { Listen: 'wisdom', Scent: 'wisdom', Observe: 'wisdom', Concentration: 'wisdom', Balance: 'dexterity', Surprise: 'dexterity' };
// Bind a Homunculus (p. 5-6): all have AC 0, 3 HD, save as a 21st-level magic-user.
const HOMUNCULI = [
    { name: 'Aryth',  sphere: 'Thought', align: 'Good',    move: "90' (30'), fly 180' (60')",  attacks: 'claw + tail', damage: '1d4 / 1d4 + Str', powers: 'Tail: save vs. poison or sleep 2d4 rounds. Always knows when someone lies. Becomes a spider or sparrow at will. Circle of protection from evil 3/day.' },
    { name: 'Bogan',  sphere: 'Entropy', align: 'Evil',    move: "108' (36'), fly 300' (100')", attacks: 'bite + tail', damage: '1d4 + Str / 1d3', powers: 'Bite: save vs. poison or shaking, -2 to attacks and AC for 1d4 rounds. Immune to poison. Becomes a snake or macaw at will. Charm monster 3/day.' },
    { name: 'Fylgar', sphere: 'Matter',  align: 'Lawful',  move: "60' (20'), fly 240' (80')",  attacks: 'fist or tail (+4 to hit)', damage: '1d4 / 1d3', powers: '+1 initiative. Sees invisible always. Becomes a black cat or hawk at will. Circle of protection from evil 3/day.' },
    { name: 'Gretch', sphere: 'Time',    align: 'Neutral', move: "150' (50'), fly 180' (60')", attacks: 'bite or tail', damage: '1d4 / 1d4 + Str', powers: 'Tail: save vs. poison or -1 Dex for 2d4 turns (paralysed at 0). Immune to mind-affecting spells. Becomes a raven or rat at will. Slow once a day.' },
    { name: 'Ulzaq',  sphere: 'Energy',  align: 'Chaotic', move: "108' (36'), no flight",       attacks: '2 claws + bite', damage: '1d3 / 1d3 / 1d4 + Str', powers: 'Bite: save vs. poison or -1 Str for 2d4 turns (insensible at 0). Immune to electricity. Becomes a toad or bat at will. Confusion once a day.' },
];
const HOMUNCULUS_COMMON = 'AC 0, 3 HD, saves as a 21st-level magic-user; harmed only by magic weapons; immune to fire and cold; infravision 60\'; invisibility, detect evil and detect magic at will; regenerates 1 hp a round (and so does its master within 10\'). In contact with it the master gains +3 to all saving throws; it shares senses and speaks telepathically within 1 mile.';
const FAMILIAR_RULES = [
    'Binding an animal familiar: an arcane spellcaster of 3rd level or more with Summon Animal Ally prepares a day\'s food the animal likes and burns 20 gp of incense with a bit of its hide, then casts the spell. The animal may have up to twice the caster\'s level in Hit Dice (10 at most).',
    'Before the spell ends the caster makes a Charisma check. Failure: the animal leaves and the caster still loses 100 XP per Hit Die; try again after a day. Success: the caster permanently loses 300 XP per Hit Die (never enough to lose a level) and 1d4 hit points, which pass to the familiar.',
    'The familiar stays within 30\' unless ordered, shares its senses and thoughts telepathically, and is covered by its master\'s protective spells within 10\'. Its master gains its skill, or +2 if he already has it.',
    'If it dies, the master saves vs. death ray: success, stunned 1 round and the hit points come back; failure, stunned 2 rounds, the hit points are lost for good, and no new familiar until the next level.',
    'Homunculus (12th level, priests too): a week and about 10,000 gp of preparation, then Summon Planar Ally. Persuade it (30%, +30% if of the same alignment) or force it (opposed 1d20 + Int + Wis + Cha). Binding costs 10,000 XP; if it is destroyed the master loses 1d4+1 hp for good and must wait a year.',
];
// Familiar progression by the master's level (cumulative).
const FAMILIAR_PROGRESSION = [
    { from: 5,  text: '+1 HD, +1 to saves' },
    { from: 10, text: '+1 HD, AC 1 better, +1 to hit' },
    { from: 16, text: '+1 HD, +1 to saves, +1 damage' },
    { from: 25, text: '+1 HD, AC 1 better, +1 to hit' },
    { from: 31, text: '+1 HD, +1 to saves, +2 damage' },
];
function familiarBonuses(masterLevel) {
    const lvl = Number(masterLevel) || 1;
    const b = { hd: 0, saves: 0, ac: 0, hit: 0, dmg: 0 };
    if (lvl >= 5) { b.hd++; b.saves++; }
    if (lvl >= 10) { b.hd++; b.ac++; b.hit++; }
    if (lvl >= 16) { b.hd++; b.saves++; b.dmg++; }
    if (lvl >= 25) { b.hd++; b.ac++; b.hit++; }
    if (lvl >= 31) { b.hd++; b.saves++; b.dmg += 2; }
    return b;
}

const compNum = v => Math.max(0, Number(v) || 0);
const compGp = n => `${(Math.round((Number(n) || 0) * 100) / 100).toLocaleString('en-US')} gp`;
function compId() { return `comp_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`; }
function companionsState() {
    if (!currentCharacter) return [];
    if (!Array.isArray(currentCharacter.companions)) currentCharacter.companions = [];
    return currentCharacter.companions;
}
function compSave() { if (typeof debouncedSave === 'function') debouncedSave(); renderCompanions(); }
function compLog(text, data = {}) { if (typeof addChronicleEntry === 'function') addChronicleEntry('companion', text, data); }
function compRoll(n, sides) { let t = 0; for (let i = 0; i < n; i++) t += 1 + Math.floor(Math.random() * sides); return t; }
const isActiveCompanion = c => !['dismissed', 'dead'].includes(c.status);
function employerCharisma() {
    const ch = currentCharacter;
    const eff = typeof getEffectiveScore === 'function' ? getEffectiveScore(ch, 'charisma') : Number(ch?.abilities?.charisma?.score);
    return Number(eff) || 10;
}

// Hireling fee (Dark Dungeons Table 8-8): a tenth of the XP for the level above theirs; commoners 50 gp.
function hirelingFee(cls, level) {
    if (!cls || cls === 'Commoner') return 50;
    const t = window.ClassesDatabase?.[cls]?.xpTable;
    const next = t ? Number(t[(Number(level) || 1) + 1]) : 0;
    return next ? Math.round(next / 10) : 0;
}
function levelFromXp(cls, xp) {
    const t = window.ClassesDatabase?.[cls]?.xpTable;
    if (!t) return null;
    let lvl = 1;
    for (let i = 1; i < t.length; i++) if (Number(xp) >= Number(t[i])) lvl = i;
    return lvl;
}
function monthlyCost(c) {
    if (c.payBasis !== 'month' || !isActiveCompanion(c)) return 0;
    const each = compNum(c.pay) * (c.kind === 'mercenary' && c.wartime ? 2 : 1);
    return each * Math.max(1, compNum(c.count) || 1);
}

// ---------------------------------------------------------------------------
// Rendering
// ---------------------------------------------------------------------------
function hpCell(c) {
    const max = compNum(c.hpMax), cur = Number(c.hp ?? c.hpMax) || 0;
    if (!max && !cur) return '';
    const pct = max ? Math.max(0, Math.min(100, cur / max * 100)) : 100;
    return `<span class="comp-hp" title="Hit points">
        <button type="button" class="icon-btn" onclick="adjustCompanionHp('${c.id}', -1)" aria-label="Damage ${escapeHtml(c.name)}">−</button>
        <span class="comp-hp-val${cur <= 0 ? ' down' : ''}">${cur}${max ? ` / ${max}` : ''} hp</span>
        <button type="button" class="icon-btn" onclick="adjustCompanionHp('${c.id}', 1)" aria-label="Heal ${escapeHtml(c.name)}">+</button>
        ${max ? `<span class="comp-hp-bar"><span style="width: ${pct}%;"></span></span>` : ''}
    </span>`;
}

function companionRow(c) {
    const status = COMPANION_STATUS.find(s => s.id === c.status) || COMPANION_STATUS[0];
    const gone = !isActiveCompanion(c);
    const lines = [];
    const tags = [];
    if (c.kind === 'retainer') {
        lines.push([c.race, c.cls ? `${c.cls}${c.level ? ' ' + c.level : ''}` : (c.level ? `level ${c.level}` : '')].filter(Boolean).join(' '));
        if (c.share && c.share !== 'none') tags.push(TREASURE_SHARE.find(s => s.id === c.share)?.label);
        if (c.xp) lines.push(`${Number(c.xp).toLocaleString('en-US')} XP`);
    } else if (c.kind === 'mercenary') {
        lines.push(`${compNum(c.count) || 1} × ${c.troop || 'troops'}${c.race ? ` (${c.race})` : ''}`);
        if (c.wartime) tags.push('Wartime: double pay');
    } else if (c.kind === 'specialist') {
        lines.push(c.role || 'Specialist');
    } else if (c.kind === 'familiar') {
        lines.push(c.homunculus ? `Homunculus (${c.homunculus})` : (c.species || 'Animal familiar'));
        if (c.skill) tags.push(`Gives: ${c.skill}`);
        if (c.hpTransferred) tags.push(`${c.hpTransferred} hp of yours bound`);
    } else {
        lines.push(c.species || '');
    }
    const home = c.home && Array.isArray(currentCharacter.holdings) ? currentCharacter.holdings.find(h => h.id === c.home) : null;
    if (home) tags.push(`At ${home.name}`);
    const stats = [];
    if (c.ac !== undefined && c.ac !== '') stats.push(`AC ${c.ac}`);
    if (c.hd) stats.push(`${c.hd} HD`);
    if (c.attacks) stats.push(c.attacks);
    const payText = c.payBasis && c.payBasis !== 'none' && compNum(c.pay)
        ? `${compGp(compNum(c.pay))} ${PAY_BASIS.find(p => p.id === c.payBasis)?.label || ''}${c.kind === 'mercenary' && (compNum(c.count) || 1) > 1 ? ' each' : ''}` : '';
    const moraleBtn = c.morale ? `<button type="button" class="btn btn-sm comp-morale" onclick="checkCompanionMorale('${c.id}')" title="Roll 2d6: equal to or under the morale score, they stand firm">Morale ${c.morale}</button>` : '';
    const skillBtn = c.kind === 'familiar' && c.skill && !c.skillGranted && isActiveCompanion(c)
        ? `<button type="button" class="btn btn-sm" onclick="grantFamiliarSkill('${c.id}')" title="Add ${escapeHtml(c.skill)} to your General Skills as granted (no slot), or +2 if you already have it">Take its skill</button>` : '';
    const xpBtn = c.kind === 'retainer' ? `<button type="button" class="btn btn-sm" onclick="awardCompanionXp('${c.id}')" title="Retainers get a full share of experience (Rules Cyclopedia p. 132)">+ XP</button>` : '';
    return `
        <div class="comp-row${gone ? ' gone' : ''}" data-companion-id="${c.id}">
            <div class="comp-main">
                <div class="comp-name"><button type="button" class="link-btn comp-name-btn" onclick="openCompanionEditor('${c.id}')">${escapeHtml(c.name || 'Unnamed')}</button>
                    <span class="comp-status comp-status-${c.status || 'with'}">${escapeHtml(status.label)}</span></div>
                <div class="nc-meta">${lines.filter(Boolean).map(escapeHtml).join(' · ')}${stats.length ? ` · ${escapeHtml(stats.join(' · '))}` : ''}</div>
                ${tags.filter(Boolean).length ? `<div class="comp-tags">${tags.filter(Boolean).map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('')}</div>` : ''}
                ${c.notes ? `<div class="comp-notes">${escapeHtml(c.notes)}</div>` : ''}
            </div>
            <div class="comp-side">
                ${hpCell(c)}
                ${payText ? `<span class="eyebrow">${escapeHtml(payText)}</span>` : ''}
                <span class="comp-actions">${skillBtn}${moraleBtn}${xpBtn}</span>
            </div>
        </div>`;
}

function renderCompanionSection(kind, intro, extraHead = '', extraBody = '') {
    const list = companionsState().filter(c => c.kind === kind);
    const k = COMPANION_KINDS[kind];
    list.sort((a, b) => (isActiveCompanion(a) ? 0 : 1) - (isActiveCompanion(b) ? 0 : 1) || (a.name || '').localeCompare(b.name || ''));
    return `
    <div class="card comp-card" id="comp-${kind}">
        <div class="panel-head">
            <h2 style="display: inline-flex; align-items: center; gap: 8px;">${getIcon(k.icon, 18)} ${escapeHtml(k.plural)}</h2>
            <div class="panel-head-tools">${extraHead}<button type="button" class="btn btn-sm btn-accent" onclick="openCompanionEditor(null, '${kind}')">+ Add</button></div>
        </div>
        <p class="sub-caption">${intro}</p>
        ${extraBody}
        <div class="comp-list">${list.length ? list.map(companionRow).join('') : '<div class="ledger-note">None yet.</div>'}</div>
    </div>`;
}

function renderCompanions() {
    const root = document.getElementById('companions-root');
    if (!root || !currentCharacter) return;
    const all = companionsState();
    const cha = employerCharisma();
    const row = charismaRetainerRow(cha);
    const retainers = all.filter(c => c.kind === 'retainer' && isActiveCompanion(c)).length;
    const monthly = all.reduce((s, c) => s + monthlyCost(c), 0);
    const level = Number(currentCharacter.level) || 1;
    const fb = familiarBonuses(level);
    const fbText = [fb.hd && `+${fb.hd} HD`, fb.saves && `+${fb.saves} to saves`, fb.ac && `AC ${fb.ac} better`, fb.hit && `+${fb.hit} to hit`, fb.dmg && `+${fb.dmg} damage`].filter(Boolean).join(', ');
    const mounts = Array.isArray(currentCharacter.mounts) ? currentCharacter.mounts.length : 0;

    const summary = `
    <div class="card comp-summary">
        <div class="tally">
            <span>Charisma <strong>${cha}</strong></span>
            <span>Retainers <strong style="color: ${retainers > row.max ? 'var(--danger)' : 'inherit'};">${retainers} / ${row.max}</strong></span>
            <span>Retainer morale <strong>${row.morale}</strong></span>
            <span>Reaction <strong>${row.reaction > 0 ? '+' : ''}${row.reaction}</strong></span>
            <span>Wages <strong>${compGp(monthly)}</strong> / month</span>
        </div>
        <div class="arc-actions" style="margin: 8px 0 0;">
            <button type="button" class="btn btn-sm" onclick="rollRetainerReaction()" title="2d6 + your Charisma reaction adjustment (Rules Cyclopedia p. 132)">Hiring reaction roll</button>
            <button type="button" class="btn btn-sm btn-accent" onclick="payCompanionWages()" ${monthly ? '' : 'disabled'}>Pay a month's wages</button>
        </div>
    </div>`;

    root.innerHTML = summary
        + renderCompanionSection('retainer',
            `Retainers adventure with you and are run by the DM. You may keep up to ${row.max} (Charisma ${cha}); their morale starts at ${row.morale}. They earn a full share of experience but no treasure unless promised. Hirelings for one mission cost a tenth of the XP for the level above theirs (commoners 50 gp), or that much per month of wilderness travel, half in advance.`)
        + renderCompanionSection('mercenary',
            'Trained soldiers for wars, garrisons and wilderness campaigns, not dungeons. Costs are peacetime pay per soldier; active war doubles them. They bring their own gear but need armourers to keep it.')
        + renderCompanionSection('specialist',
            'Skilled employees who never go adventuring: engineers, sages, armourers, ship\'s crews, stronghold staff. Hire as many as you can pay.')
        + renderCompanionSection('familiar',
            `A telepathic animal (or, from 12th level, a homunculus) bound by ritual. At your level a familiar gains ${fbText || 'no bonuses yet (the first come at 5th level)'}.`,
            '', `<details class="arc-rules"><summary>How familiars are bound</summary><ul>${FAMILIAR_RULES.map(r => `<li>${escapeHtml(r)}</li>`).join('')}</ul><p class="sub-caption">Progression by your level (cumulative): ${FAMILIAR_PROGRESSION.map(p => `${p.from}th: ${p.text}`).join('; ')}.</p></details>`)
        + renderCompanionSection('animal',
            `War dogs, trained hawks, charmed or summoned creatures and other followers.${mounts ? ` Your ${mounts} mount${mounts > 1 ? 's and pack animals are' : ' is'} kept with the saddlebags on the <button type="button" class="link-btn" onclick="switchTab('tab-inventory')">Inventory</button> tab.` : ' Mounts and pack animals are kept on the Inventory tab.'}`)
        + `<div class="arc-source">Rules Cyclopedia pp. 10, 132-133 · Dark Dungeons Chapter 8 (Tables 8-8 to 8-10) · Tome of the Magic of Mystara vol. 1, pp. 5-6</div>`;
}

// ---------------------------------------------------------------------------
// Editing
// ---------------------------------------------------------------------------
function companionFields(kind, c) {
    const status = { key: 'status', label: 'Status', type: 'select', options: COMPANION_STATUS.map(s => ({ value: s.id, label: s.label })) };
    const notes = { key: 'notes', label: 'Notes', type: 'textarea', wide: true, rows: 3, placeholder: 'Personality, equipment, orders, history...' };
    const hp = [{ key: 'hpMax', label: 'Hit points (max)', placeholder: 'e.g. 8' }, { key: 'hp', label: 'Hit points (now)', placeholder: 'same as max' }];
    const classes = ['Commoner', ...Object.keys(window.ClassesDatabase || {})];
    if (kind === 'retainer') return [
        { key: 'name', label: 'Name', max: 80, placeholder: 'e.g. Brother Anselm' }, status,
        { key: 'cls', label: 'Class', placeholder: 'e.g. Cleric', list: classes },
        { key: 'level', label: 'Level', placeholder: '1' },
        { key: 'race', label: 'Race / people', placeholder: 'e.g. Thyatian, dwarf' },
        { key: 'ac', label: 'Armour class', placeholder: '9' }, ...hp,
        { key: 'morale', label: 'Morale (2-12)', placeholder: String(charismaRetainerRow(employerCharisma()).morale) },
        { key: 'pay', label: 'Pay (gp)', placeholder: 'leave empty to use the hireling fee' },
        { key: 'payBasis', label: 'Paid', type: 'select', options: PAY_BASIS.map(p => ({ value: p.id, label: p.label })) },
        { key: 'share', label: 'Treasure', type: 'select', options: TREASURE_SHARE.map(p => ({ value: p.id, label: p.label })) },
        { key: 'xp', label: 'Experience points', placeholder: '0' }, notes,
    ];
    if (kind === 'mercenary') return [
        { key: 'name', label: 'Unit name', max: 80, placeholder: 'e.g. The Black Lances' }, status,
        { key: 'troop', label: 'Troop type', type: 'select', options: MERCENARY_TYPES.map(m => ({ value: m.name, label: `${m.name} (${m.gear})` })) },
        { key: 'race', label: 'Race', type: 'select', options: ['Human', 'Dwarf', 'Elf', 'Goblin', 'Orc'].map(r => ({ value: r, label: r })) },
        { key: 'count', label: 'Number of soldiers', placeholder: '10' },
        { key: 'pay', label: 'Pay each (gp / month)', placeholder: 'leave empty for Table 8-9' },
        { key: 'wartime', label: 'Duty', type: 'select', options: [{ value: '', label: 'Peacetime' }, { value: '1', label: 'Active war (double pay)' }] },
        { key: 'morale', label: 'Morale', placeholder: 'e.g. 8' }, notes,
    ];
    if (kind === 'specialist') return [
        { key: 'name', label: 'Name', max: 80, placeholder: 'e.g. Master Gerd' }, status,
        { key: 'role', label: 'Specialist', type: 'select', options: SPECIALIST_TYPES.map(([n, cost]) => ({ value: n, label: `${n} (${cost.toLocaleString('en-US')} gp)` })) },
        { key: 'pay', label: 'Pay (gp)', placeholder: 'leave empty for Table 8-10' },
        { key: 'payBasis', label: 'Paid', type: 'select', options: PAY_BASIS.map(p => ({ value: p.id, label: p.label })) }, notes,
    ];
    if (kind === 'familiar') return [
        { key: 'name', label: 'Name', max: 80, placeholder: 'e.g. Grimalkin' }, status,
        { key: 'species', label: 'Animal (or homunculus)', type: 'select', options: [
            ...FAMILIAR_ANIMALS.map(([a, s]) => ({ value: a, label: `${a} (${s})` })),
            ...HOMUNCULI.map(h => ({ value: `Homunculus: ${h.name}`, label: `Homunculus: ${h.name} (${h.sphere}, ${h.align})` })),
            { value: 'Other', label: 'Other animal' }] },
        { key: 'skill', label: 'Skill it gives you', placeholder: 'from the list, or your own' },
        { key: 'hd', label: 'Hit Dice', placeholder: 'e.g. 1' },
        { key: 'ac', label: 'Armour class', placeholder: 'e.g. 7' }, ...hp,
        { key: 'attacks', label: 'Attacks', placeholder: 'e.g. 2 claws 1d2, bite 1d3' },
        ...(c ? [] : [{ key: 'bind', label: 'Binding cost', type: 'select', options: [
            { value: '', label: 'Already bound (no cost now)' },
            { value: '1', label: 'Pay it now: -300 XP per HD, 1d4 hp pass to it' }] }]),
        notes,
    ];
    return [
        { key: 'name', label: 'Name', max: 80, placeholder: 'e.g. Wolfhound "Brutus"' }, status,
        { key: 'species', label: 'Creature', placeholder: 'e.g. war dog, charmed ogre' },
        { key: 'hd', label: 'Hit Dice', placeholder: 'e.g. 2' },
        { key: 'ac', label: 'Armour class', placeholder: 'e.g. 6' }, ...hp,
        { key: 'attacks', label: 'Attacks', placeholder: 'e.g. bite 2d4' },
        { key: 'morale', label: 'Morale', placeholder: 'e.g. 9' },
        { key: 'pay', label: 'Upkeep (gp)', placeholder: '0' },
        { key: 'payBasis', label: 'Paid', type: 'select', options: PAY_BASIS.map(p => ({ value: p.id, label: p.label })) }, notes,
    ];
}

function companionDefaults(kind) {
    const row = charismaRetainerRow(employerCharisma());
    if (kind === 'retainer') return { kind, status: 'with', level: 1, morale: row.morale, payBasis: 'mission', share: 'none', ac: 9 };
    if (kind === 'mercenary') return { kind, status: 'home', troop: MERCENARY_TYPES[0].name, race: 'Human', count: 10, payBasis: 'month', morale: 8 };
    if (kind === 'specialist') return { kind, status: 'home', role: SPECIALIST_TYPES[0][0], payBasis: 'month' };
    if (kind === 'familiar') return { kind, status: 'with', species: 'Cat', skill: 'Balance', hd: 1, payBasis: 'none' };
    return { kind, status: 'with', payBasis: 'none' };
}

async function openCompanionEditor(id = null, kind = 'retainer') {
    const list = companionsState();
    const c = id ? list.find(x => x.id === id) : null;
    if (id && !c) return;
    kind = c ? c.kind : kind;
    const values = c ? { ...c, wartime: c.wartime ? '1' : '' } : companionDefaults(kind);
    const res = await notesFormModal({
        title: c ? (c.name || COMPANION_KINDS[kind].label) : `New ${COMPANION_KINDS[kind].label.toLowerCase()}`,
        values: { home: '', ...values }, canDelete: !!c, fields: [...companionFields(kind, c), ...(typeof holdingHomeField === 'function' ? holdingHomeField() : [])],
        extraHtml: kind === 'familiar' ? `<p class="sub-caption" style="margin-top: 8px;">${escapeHtml(HOMUNCULUS_COMMON)}</p>` : '',
    });
    if (res === null) return;
    if (res === '__delete__') {
        if (!(await sheetConfirm(`Remove ${c.name || 'this companion'} from the sheet? (To keep a record, set the status to Dismissed or Dead instead.)`, 'Remove'))) return;
        currentCharacter.companions = list.filter(x => x.id !== c.id);
        compSave();
        return;
    }
    const num = (v, d = '') => (v === '' || v === undefined) ? d : (Number.isFinite(Number(v)) ? Number(v) : d);
    const out = { ...(c ? {} : companionDefaults(kind)), ...res, kind };   // keep defaults the form does not show (mercenaries are paid monthly)
    if (kind === 'mercenary') out.payBasis = 'month';
    ['level', 'hpMax', 'hp', 'morale', 'count', 'hd', 'xp'].forEach(k => { if (k in out) out[k] = num(out[k]); });
    if ('ac' in out) out.ac = out.ac === '' ? '' : num(out.ac, '');
    if ('morale' in out && out.morale !== '') out.morale = Math.max(2, Math.min(12, out.morale));
    out.wartime = out.wartime === '1';
    if (out.hp === '' && out.hpMax !== '') out.hp = out.hpMax;
    out.name = out.name || COMPANION_KINDS[kind].label;
    // Fill in book prices when no pay was given.
    if (out.pay === '' || out.pay === undefined) {
        if (kind === 'retainer' && out.payBasis !== 'none') out.pay = hirelingFee(out.cls, out.level);
        if (kind === 'mercenary') { const m = MERCENARY_TYPES.find(t => t.name === out.troop); out.pay = m?.cost[out.race] ?? m?.cost.Human ?? 0; }
        if (kind === 'specialist') { const s = SPECIALIST_TYPES.find(t => t[0] === out.role); out.pay = s ? s[1] : 0; if (out.role === 'Spy') out.payBasis = 'mission'; }
    } else out.pay = num(out.pay, 0);
    if (kind === 'familiar') {
        const h = HOMUNCULI.find(x => `Homunculus: ${x.name}` === out.species);
        out.homunculus = h ? h.name : '';
        if (h) { out.hd = (!out.hd || out.hd === 1) ? 3 : out.hd; out.ac = out.ac === '' ? 0 : out.ac; out.attacks = out.attacks || `${h.attacks} ${h.damage}`; if (!out.notes) out.notes = h.powers; }
        // The skill follows the chosen animal unless the player typed one of their own.
        const listed = FAMILIAR_ANIMALS.map(a => a[1]);
        if (!out.skill || listed.includes(out.skill)) out.skill = h ? '' : (FAMILIAR_ANIMALS.find(a => a[0] === out.species)?.[1] || out.skill || '');
    }
    if (!out.home) delete out.home;
    if (c && !out.home) delete c.home;
    const bind = out.bind === '1'; delete out.bind;
    if (c) Object.assign(c, out);
    else {
        const nc = { id: compId(), ...out };
        if (bind && kind === 'familiar' && !(await bindFamiliarCost(nc))) return;
        list.push(nc);
        compLog(`${COMPANION_KINDS[kind].label} joined: ${nc.name}${nc.cls ? ` (${nc.cls} ${nc.level || 1})` : ''}${nc.species ? ` (${nc.species})` : ''}.`, { companion: nc.id });
    }
    compSave();
}

// Pay the binding cost of a new animal familiar (or 10,000 XP for a homunculus).
async function bindFamiliarCost(f) {
    const ch = currentCharacter;
    const hd = Math.max(1, compNum(f.hd) || 1);
    const xpCost = f.homunculus ? 10000 : 300 * hd;
    const t = window.ClassesDatabase?.[ch.characterClass]?.xpTable;
    const floor = t ? Number(t[Number(ch.level) || 1]) || 0 : 0;
    const xp = Number(ch.experiencePoints) || 0;
    if (xp - xpCost < floor) {
        await sheetAlert(`Binding costs ${xpCost.toLocaleString('en-US')} XP, which would drop you below level ${ch.level}. The ritual needs enough experience to spare.`);
        return false;
    }
    const hpLoss = f.homunculus ? 0 : compRoll(1, 4);
    if (!(await sheetConfirm(`Bind ${f.name}: lose ${xpCost.toLocaleString('en-US')} XP permanently${hpLoss ? ` and ${hpLoss} hit point${hpLoss > 1 ? 's' : ''} (1d4), which pass to the familiar` : ''}?`, 'Bind'))) return false;
    ch.experiencePoints = xp - xpCost;
    if (typeof writeXp === 'function') writeXp('char-xp', ch.experiencePoints);
    if (hpLoss) { f.hpTransferred = hpLoss; f.hpMax = compNum(f.hpMax) + hpLoss; f.hp = compNum(f.hp) + hpLoss; }
    compLog(`Bound ${f.name} as a familiar: -${xpCost.toLocaleString('en-US')} XP${hpLoss ? `, ${hpLoss} hp passed to it (lower your maximum hit points by ${hpLoss} while it lives)` : ''}.`, { companion: f.id, xp: -xpCost, hp: hpLoss });
    if (typeof updateClassStats === 'function') { try { updateClassStats(); } catch (e) { console.error(e); } }
    return true;
}

function adjustCompanionHp(id, delta) {
    const c = companionsState().find(x => x.id === id);
    if (!c) return;
    const max = compNum(c.hpMax);
    const cur = Number(c.hp ?? max) || 0;
    c.hp = max ? Math.min(max, cur + delta) : cur + delta;
    compSave();
}

// Rules Cyclopedia: roll 2d6; equal to or under the morale score, the retainer stands firm.
async function checkCompanionMorale(id) {
    const c = companionsState().find(x => x.id === id);
    if (!c || !c.morale) return;
    const roll = compRoll(2, 6);
    const ok = roll <= Number(c.morale);
    compLog(`Morale check for ${c.name}: rolled ${roll} against ${c.morale}, ${ok ? 'stands firm' : 'breaks (flees, surrenders or refuses)'}.`, { companion: c.id, roll });
    await sheetAlert(`${c.name}: rolled ${roll} on 2d6 against morale ${c.morale}.\n${ok ? 'Stands firm.' : 'Fails: flees, surrenders or refuses the order, as the DM decides.'}`);
    renderCompanions();
}

// Rules Cyclopedia p. 132, Retainer Reaction Table (2d6 + the employer's Charisma reaction adjustment).
async function rollRetainerReaction() {
    const adj = charismaRetainerRow(employerCharisma()).reaction;
    const dice = compRoll(2, 6);
    const total = dice + adj;
    const text = total <= 2 ? 'Refuses, insulted: other candidates nearby react at -1.'
        : total <= 5 ? 'Refuses.'
        : total <= 8 ? 'Undecided: roll again (sweeten the offer?).'
        : total <= 11 ? 'Accepts.'
        : 'Accepts, impressed: +1 to this retainer\'s morale.';
    await sheetAlert(`Hiring reaction: ${dice} on 2d6 ${adj >= 0 ? '+' : '−'} ${Math.abs(adj)} (Charisma) = ${total}.\n${text}`);
}

async function awardCompanionXp(id) {
    const c = companionsState().find(x => x.id === id);
    if (!c) return;
    const res = await notesFormModal({
        title: `Experience for ${c.name}`, okText: 'Award',
        fields: [{ key: 'amount', label: 'XP (a full share of the party\'s award)', placeholder: 'e.g. 450' }],
    });
    const amount = Math.round(Number(res?.amount) || 0);
    if (!amount) return;
    const before = Number(c.level) || 1;
    c.xp = compNum(c.xp) + amount;
    const lvl = c.cls ? levelFromXp(c.cls, c.xp) : null;
    if (lvl && lvl > before) c.level = lvl;
    compLog(`${c.name} gains ${amount.toLocaleString('en-US')} XP (now ${c.xp.toLocaleString('en-US')})${lvl && lvl > before ? ` and reaches level ${lvl}` : ''}.`, { companion: c.id, xp: amount });
    compSave();
    if (lvl && lvl > before) await sheetAlert(`${c.name} reaches level ${lvl}! Roll the new hit dice and update the hit points.`);
}

async function payCompanionWages() {
    const list = companionsState().filter(c => monthlyCost(c) > 0);
    const total = list.reduce((s, c) => s + monthlyCost(c), 0);
    if (!total) return;
    const coins = currentCharacter.coins || (currentCharacter.coins = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 });
    const purse = (Number(coins.pp) || 0) * 5 + (Number(coins.gp) || 0) + (Number(coins.ep) || 0) / 2 + (Number(coins.sp) || 0) / 10 + (Number(coins.cp) || 0) / 100;
    const lines = list.map(c => `${c.name}: ${compGp(monthlyCost(c))}`).join('\n');
    if (!(await sheetConfirm(`Pay a month's wages, ${compGp(total)} in all, from your purse?\n\n${lines}`, 'Pay'))) return;
    if (purse + 1e-9 < total) { await sheetAlert(`Your purse holds only ${compGp(purse)}. Move money from the vault first, or pay them some other way.`); return; }
    // Spend gold first, then platinum, electrum, silver and copper, giving change in copper.
    let due = Math.round(total * 100);              // in copper pieces
    const value = { pp: 500, gp: 100, ep: 50, sp: 10, cp: 1 };
    for (const k of ['gp', 'pp', 'ep', 'sp', 'cp']) {
        const have = Number(coins[k]) || 0;
        const use = Math.min(have, Math.ceil(due / value[k]));
        coins[k] = have - use;
        due -= use * value[k];
        if (due <= 0) break;
    }
    if (due < 0) {                                   // change back
        let change = -due;
        for (const k of ['gp', 'sp', 'cp']) { const n = Math.floor(change / value[k]); coins[k] = (Number(coins[k]) || 0) + n; change -= n * value[k]; }
    }
    compLog(`Paid a month's wages: ${compGp(total)} (${list.map(c => c.name).join(', ')}).`, { wages: total });
    if (typeof calendarState === 'function') { calendarState().wagesMonth = calParts(calendarState().t).monthAbs; if (typeof renderGameClock === 'function') renderGameClock(); }
    if (typeof syncInventoryUI === 'function') { try { syncInventoryUI(); } catch (e) { console.error(e); } }
    compSave();
}

// The master gains the familiar's skill (free), or +2 if he already has it (Tome of the Magic of Mystara).
async function grantFamiliarSkill(id) {
    const f = companionsState().find(x => x.id === id);
    if (!f || !f.skill) return;
    const ch = currentCharacter;
    if (!Array.isArray(ch.skills)) ch.skills = [];
    const key = FAMILIAR_SKILL_MAP[f.skill];
    const def = key && typeof GENERAL_SKILLS_DATABASE !== 'undefined' ? GENERAL_SKILLS_DATABASE[key] : null;
    const have = ch.skills.find(s => (key && s.skillId === key) || (s.name || '').toLowerCase() === f.skill.toLowerCase());
    const source = `Familiar: ${f.name}`;
    if (have) {
        have.slots = (Number(have.slots) || 1) + 2;
        have.freeSlots = (Number(have.freeSlots) || 0) + 2;
        have.freeSource = have.freeSource ? `${have.freeSource}; ${source}` : source;
    } else if (def) {
        ch.skills.push({ skillId: key, name: def.name, ability: def.ability, subType: def.hasSpec && !def.specOptional ? 'General' : (def.specOptional ? 'General' : ''), desc: def.desc, slots: 1, freeSlots: 1, freeSource: source, isCustom: false });
    } else {
        ch.skills.push({ skillId: 'custom_' + Date.now(), name: f.skill, ability: FAMILIAR_SKILL_ABILITY[f.skill] || 'wisdom', subType: '', desc: `Granted by the familiar ${f.name} while it lives.`, slots: 1, freeSlots: 1, freeSource: source, isCustom: true });
    }
    f.skillGranted = true;
    compLog(`${f.name} gives its master ${have ? `+2 to ${have.name}` : `the ${f.skill} skill`} (no skill slot used).`, { companion: f.id });
    if (typeof syncSkillsUI === 'function') syncSkillsUI();
    compSave();
    await sheetAlert(`${have ? `${have.name} +2` : f.skill} added on the General Skills tab as granted by ${f.name}. Remove it there if the familiar is lost.`);
}

Object.assign(window, {
    grantFamiliarSkill,
    renderCompanions, openCompanionEditor, adjustCompanionHp, checkCompanionMorale, rollRetainerReaction,
    awardCompanionXp, payCompanionWages, hirelingFee, charismaRetainerRow, familiarBonuses,
});
