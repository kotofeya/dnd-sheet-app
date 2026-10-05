// js/catalogue.js — the item catalogue and the magic forge.
// Equipment from Dark Dungeons (Chapter 8), magic items from the Rules Cyclopedia (Chapter 16);
// the forge builds magic weapons and armour on any base (including Dark Dungeons and Compendium
// weapons) with the Rules Cyclopedia's bonuses, enemy bonuses, talents and powers.

// House-rule items converted from AD&D. Their AC comes from a BECMI armour (Dark Dungeons Table 8-2).
const HOUSE_MAGIC_ITEMS = [{
    id: 'misc_bracers_of_defense', name: 'Bracers of Defense', group: 'misc', usableBy: 'Any', slot: 'hands', weight: 10, houseRule: true,
    source: 'AD&D conversion (house rule)',
    // AD&D (DMG): bracers of defense come in AC 8 to AC 2 (same descending scale as BECMI).
    variants: [[8, 'as a shield alone'], [7, 'as leather armour'], [6, 'as scale mail'], [5, 'as chain mail'], [4, 'as banded mail'], [3, 'as plate mail'], [2, 'as plate mail and shield']]
        .map(([ac, as]) => ({ suffix: `(AC ${ac}, ${as})`, armourAC: ac })),
    desc: 'AD&D conversion (house rule). A pair of wrist bands that give the wearer an armour class of 8 down to 2, as in AD&D, without any weight, bulk or noise. They work only while the wearer wears no armour and carries no shield; with either they do nothing. They are not armour: any class may wear them, magic-users cast spells normally, and Dexterity, rings of protection and other protective items still apply on top. The DM may create them with the Rules Cyclopedia rules for new magic items.',
}];
if (typeof RC_MAGIC_ITEMS !== 'undefined') HOUSE_MAGIC_ITEMS.forEach(h => { if (!RC_MAGIC_ITEMS.some(x => x.id === h.id)) RC_MAGIC_ITEMS.push(h); });

// Ring of protection +5 (house rule: the Rules Cyclopedia stops at +4).
if (typeof RC_MAGIC_ITEMS !== 'undefined') {
    const rp = RC_MAGIC_ITEMS.find(x => x.id === 'ring_protection');
    if (rp && Array.isArray(rp.variants) && !rp.variants.some(v => v.suffix === '+5')) {
        const at = rp.variants.findIndex(v => v.suffix === '+4');
        rp.variants.splice(at + 1, 0, { suffix: '+5', acBonus: 5, saveBonus: 5 });
        rp.desc += ' House rule: a ring of protection +5 also exists, giving +5 to AC and saving throws.';
    }
}

// Corrections to the Rules Cyclopedia item data:
//  - an ointment of blessing gives +2 AC and saves for 1 turn after it is rubbed on, not while carried;
//  - a ring of spell turning reflects 2d6 spells each day: it has no charges to use up.
if (typeof RC_MAGIC_ITEMS !== 'undefined') {
    const ob = RC_MAGIC_ITEMS.find(x => x.id === 'misc_ointment_blessing');
    if (ob) { delete ob.acBonus; delete ob.saveBonus; }
    const st = RC_MAGIC_ITEMS.find(x => x.id === 'ring_spell_turning');
    if (st) delete st.charges;
}

// Displacer cloak (Rules Cyclopedia p. 237): +2 to saves vs. spells, wands/staves/rods and turn to stone.
if (typeof RC_MAGIC_ITEMS !== 'undefined') {
    const dc = RC_MAGIC_ITEMS.find(x => x.id === 'misc_displacer_cloak');
    if (dc && !dc.saveBonusBy) dc.saveBonusBy = { wands: 2, paralysis: 2, spells: 2 };
}

// Blackmoor technology: the "alien devices" of the starship Beagle, DA3 City of the Gods
// (Dave L. Arneson and David J. Ritchie, TSR 1987), "Alien Devices" pp. 32-35; prices are what
// The Fetch pays for them (p. 24). The Blackmoor natives' names are given in brackets.
// The module gives no weights: those here are estimates, except the suits, which add no encumbrance.
const PACK = 'Uses a standard 1" × 2" × ½" power pack; all packs are interchangeable and fully charged when found (less any charges just used). Each time someone untrained (e.g. a PC) changes a pack there is a 50% chance of damaging the device so it no longer works. Alien devices answer only to Galactica or the Federation battle languages, not Common, and are made of super-tough ceramics and acrylics: the device itself cannot be damaged by non-magical weapons or tools (this does not protect whoever carries or wears it).';
const BLACKMOOR_TECH = [
    { id: 'tech_battle_armour', name: 'Battle Armour ("Godsuit")', group: 'tech', usableBy: 'Any', weight: 0, cost: 1200, isArmor: true, baseAC: 0, anyClass: true, slot: 'armor',
      desc: 'Looks like a wondrously light, thin stocking knit with arms and legs to cover the whole body, with a small oblong box woven into the neck. All aliens and Soldiers of the Frog wear it: a form-fitting, light-weight acrylic mesh whose sensor raises a repulsion field, giving the wearer AC 0 without adding to his encumbrance. The suit itself cannot be damaged by normal weapons, but the wearer can still be hit and hurt by them: the protection is only the AC 0. Squeezing the box ejects the power pack. A new pack powers the armour for 4 months; packs in suits the PCs find are good for 1-4 months. On this sheet any class may wear it (it is not metal armour); whether a magic-user can cast spells in it is the DM\'s call. ' + PACK },
    { id: 'tech_pressure_suit', name: 'Pressure Suit ("Suit of Lights")', group: 'tech', usableBy: 'Any', weight: 0, cost: 2000, isArmor: true, baseAC: 0, anyClass: true, slot: 'armor',
      desc: 'Looks like battle armour with a hood and a slightly larger box in the neck; when active it wraps the wearer in a multicoloured aura. It has the same qualities as battle armour (AC 0, no encumbrance; the suit cannot be damaged by normal weapons, though the wearer still can) and also an atmospheric envelope: the wearer is immune to heat, cold and lack of air, and to neuron grenades. It must be recharged after every 12 hours of use, by replacing the power pack and hooking the neck box to the nozzle by the keypad in any of Beagle\'s air locks. ' + PACK },
    { id: 'tech_hand_blaster', name: 'Hand Blaster ("Wand of Sunflame")', group: 'tech', usableBy: 'Any', weight: 10, cost: 800, charges: '5d4', techWeapon: true,
      desc: 'A dark grey L-shaped pistol. It works like a wand of fireballs, doing 6d6 (6-36) damage at a range of 240\' each time the stud on the grip is pressed. A gauge in the grip shows the charges left. A new pack is good for 24 shots; the pack in a blaster when found holds 5-20. ' + PACK },
    { id: 'tech_heavy_blaster', name: 'Heavy Blaster ("Staff of Sunflame")', group: 'tech', usableBy: 'Any', weight: 50, cost: 1600, charges: '5d4', techWeapon: true,
      desc: 'A shoulder-fired weapon the size of a crossbow, shaped like a rifle (to the natives it looks like an arcane club). It works like a wand of fireballs, doing 8d6 (8-48) damage at a range of 360\'. A new pack is good for 24 shots; the pack in one when found holds 5-20. ' + PACK },
    { id: 'tech_needler', name: 'Needler ("Wand of Poisoned Dreams")', group: 'tech', usableBy: 'Any', weight: 10, cost: 400, charges: '5d4', techWeapon: true,
      desc: 'A small L-shaped pistol firing hollow needles of paralysing drug, range 60\'. A creature hit takes 1-2 damage and must save vs. paralysis or be paralysed for one hour. The light needles shatter on heavy armour: +5 to the hit roll needed against plate mail or monsters of AC 3 or better. Takes a power pack (24 shots) and an ammo pack (24 needles); the packs in one when found are good for 5-20 uses. ' + PACK },
    { id: 'tech_riot_stick', name: 'Riot Stick ("Wand of Pain")', group: 'tech', usableBy: 'Any', weight: 20, cost: 200, charges: '5d4', techWeapon: true,
      desc: 'A 24" white stick with an insulated grip and a pair of black gauntlets on a strap, made to put down shipboard mutinies. Twisting the grip sets one of 10 levels: 1 a harmless jolt, 2 does 1-2 damage, 3 does 1-4, and each level above adds 2 more, up to 15-19 at the tenth. A new pack is good for 24 uses; one found in it has 5-20. ' + PACK },
    { id: 'tech_light_sabre', name: 'Light Sabre ("Sword of Light")', group: 'tech', usableBy: 'Any', weight: 10, cost: 600, category: 'weapon', weaponId: 'sword_normal', magicBonus: 4, charges: '72',
      desc: 'A 6" grey metal tube with a lens at one end, made for fighting in spaceships without holing the hull. It projects a 3-foot beam of light shaped into a blade: treat it as a sword +4 (5-12 damage). A power pack gives 12 minutes (72 rounds) of continuous use; the charges count rounds. ' + PACK },
    { id: 'tech_grenade_launcher', name: 'Grenade Launcher ("Wand of Death Eggs")', group: 'tech', usableBy: 'Any', weight: 20, cost: 600, charges: '2d12', techWeapon: true,
      desc: 'A dark grey foot-long tube with a red firing button. Drop in a live grenade, aim and press: one round to arm, load and fire. Range 300\'; above 120\' it is very inaccurate (+5 to the hit roll needed). A new propellant and power pack are good for 24 shots; those in one when found, 2-24. Fired with more than one grenade inside, it explodes for 3d6 (3-18) damage to the user plus the grenades\' own effects. ' + PACK },
    { id: 'tech_grenade', name: 'Grenade ("Death Egg")', group: 'tech', usableBy: 'Any', weight: 5, cost: 200, category: 'consumable',
      variants: [
          { suffix: '(gamma, red)', note: 'Blast of radiation: every creature within 30\' saves vs. death ray or takes 8d6 (8-48) damage; no damage to the surroundings.' },
          { suffix: '(light, yellow)', note: 'A globe of light 60\' across, like continual light but lasting one turn. Anyone looking straight at it when it goes off saves vs. spells or is blinded for one round.' },
          { suffix: '(opacity, black)', note: 'A globe of darkness 60\' across, like reversed continual light but lasting one turn. It cannot be used to blind.' },
          { suffix: '(sonic, blue)', note: 'Focused blast of sound: every creature within 5\' saves vs. paralysis or takes 12-48 damage and is paralysed for 6 turns. Destroys furniture and fragile things in range and damages doors; wedged against a wall or floor it blows a hole through 1\' of stone or metal or 3\' of earth or wood.' },
          { suffix: '(neuron, green)', note: 'Nerve gas, 30\': everyone without a working pressure suit saves vs. breath attack or takes 1-4 damage and is paralysed for 6 turns. It only has to touch skin; armour and clothing do not help. No effect on machines, robots, golems, living statues or objects.' },
          { suffix: '(tangler, grey)', note: 'Monofilament web, 10\': save vs. wands or take 1-4 damage and be entangled, unable to move until cut free. Freeing each victim takes 3-18 points of damage to the web, and only magic blades and acid affect it; struggling costs 1-4 damage a round.' },
      ],
      desc: 'A smooth, heavy egg no more than an inch thick, with a seam around the middle; the colour shows the type. Thrown up to 60\' or fired from a grenade launcher. It does nothing until made live by twisting the two halves until they click; it then explodes five seconds later.' },
    { id: 'tech_medkit', name: 'Medkit ("Cube of Healing")', group: 'tech', usableBy: 'Humans', weight: 10, cost: 400, charges: '100',
      desc: 'A smooth white 4" cube with flashing lights and symbols. Held against the skin and switched on it examines the patient and treats wounds, burns and illness. It does not heal directly, but makes normal (not magical) healing go four times as fast, for up to 100 points of damage in all (the charges). Made for humans only: a non-human (demi-humans included) must save vs. poison or take 6-24 damage from malpractice. It has its own power source.' },
    { id: 'tech_communicator', name: 'Communicator ("Talk Box")', group: 'tech', usableBy: 'Any', weight: 2, cost: 800,
      desc: 'A grey egg-shaped device with a belt clip. Two-way talk with anyone who has an implant or communicator, or with devices on the alien network (a computer, for example), up to 48 miles away; it always receives its band, and when transmitting it sends all sounds within 12". Told "translate", it translates what it receives into the user\'s language. A pack powers 6 hours of talk (about 24 conversations). ' + PACK },
    { id: 'tech_glow_wand', name: 'Glow Wand ("Magic Torch")', group: 'tech', usableBy: 'Any', weight: 2, cost: 200,
      desc: 'A 6" ridged grey tube with a lens cap. Twisting the cap turns on a diffused glow that grows brighter and more focused the further it is turned. A power pack lasts 24 hours. ' + PACK },
    { id: 'tech_snoopers', name: 'Snoopers ("Far Seers")', group: 'tech', usableBy: 'Any', weight: 2, cost: 400, slot: 'head',
      desc: 'Goggles on an elastic strap. Focusing magnifies up to four times as clearly and as far; they brighten any available light so the wearer sees as in daylight, and with no light at all a toss of the head gives infravision as the spell. No power pack, but the lenses are delicate: a 2% chance per use of breaking them.' },
    { id: 'tech_translator', name: 'Translator Badge ("Medallion of Speaking")', group: 'tech', usableBy: 'Any', weight: 1, cost: 1000, slot: 'neck',
      desc: 'A 1" pin-on button with a turning ring of runes. It translates the wearer\'s words into the chosen language and everyone else\'s speech into his, so that the translation seems to come from the speaker\'s mouth. An unknown language is learnt gradually by listening. It has its own power and is thrown away when it runs out, after 5-20 months.' },
    { id: 'tech_power_pack', name: 'Power Pack', group: 'tech', usableBy: 'Any', weight: 1, cost: 100, category: 'consumable',
      desc: 'A standard 1" × 2" × ½" pack for alien devices, fully charged: 24 shots of a blaster, needler or riot stick, 4 months of battle armour, 12 hours of a pressure suit, 72 rounds of a light sabre, 24 hours of a glow wand, 6 hours of a communicator. Used packs can only be recharged in Beagle\'s power plant. Untrained users have a 50% chance of damaging a device when changing its pack.' },
    { id: 'tech_ammo_pack', name: 'Ammo Pack (needler)', group: 'tech', usableBy: 'Any', weight: 1, cost: 100, category: 'consumable',
      desc: 'A pack of 24 drugged needles for a needler, the same size as a power pack.' },
    { id: 'tech_propellant_pack', name: 'Propellant Pack (grenade launcher)', group: 'tech', usableBy: 'Any', weight: 1, cost: 100, category: 'consumable',
      desc: 'Propellant for a grenade launcher: with a power pack, good for 24 shots.' },
].map(x => ({ ...x, source: 'DA3 City of the Gods (TSR 1987), Alien Devices pp. 32-35; price p. 24', page: '' }));
if (typeof RC_MAGIC_ITEMS !== 'undefined') BLACKMOOR_TECH.forEach(h => { if (!RC_MAGIC_ITEMS.some(x => x.id === h.id)) RC_MAGIC_ITEMS.push(h); });

const MAGIC_GROUPS = { potion: 'Potions', scroll: 'Scrolls', wand: 'Wands', staff: 'Staves', rod: 'Rods', ring: 'Rings', misc: 'Miscellaneous', tech: 'Blackmoor technology', arms: 'Weapons & armour' };
const CATALOGUE_TABS = [
    { id: 'gear', label: 'Gear' },
    { id: 'weapons', label: 'Weapons' },
    { id: 'armour', label: 'Armour' },
    { id: 'mounts', label: 'Animals & vehicles' },
    { id: 'magic', label: 'Magic items' },
    { id: 'forge', label: 'Magic forge' },
];
// Missiles the forge can enchant (base item from the gear list).
const FORGE_MISSILES = [
    { id: 'dd_arrows', name: 'Arrow', plural: 'Arrows' },
    { id: 'dd_bolts', name: 'Quarrel', plural: 'Quarrels' },
    { id: 'dd_pellets', name: 'Sling Stone', plural: 'Sling Stones' },
    { id: 'dd_bullets', name: 'Bullet', plural: 'Bullets' },
    { id: 'dd_darts', name: 'Blowgun Dart', plural: 'Blowgun Darts' },
];

let catalogueState = { tab: 'gear', query: '', group: '', open: null };
let forgeState = null;

function parseCostGp(text) {
    const m = String(text || '').toLowerCase().replace(/,/g, '').match(/([\d.]+)\s*(gp|sp|cp|pp|ep)?/);
    if (!m) return 0;
    const v = Number(m[1]) || 0;
    return v * ({ gp: 1, sp: 0.1, cp: 0.01, pp: 5, ep: 0.5 }[m[2] || 'gp']);
}
function fmtCost(gp) {
    const v = Math.round((Number(gp) || 0) * 10000) / 10000;     // per-item prices of packs (1/30 gp) add back up exactly
    if (!v) return '—';
    if (v >= 1) return `${Math.round(v * 100) / 100} gp`.replace(/\.0+ gp$/, ' gp');
    if (v >= 0.1) return `${Math.round(v * 10)} sp`;
    return `${Math.round(v * 100)} cp`;
}
function fmtWeight(cn) {
    const v = Number(cn) || 0;
    return `${Math.round(v * 100) / 100} cn`;
}
function weaponWeight(w) {
    if (!w) return 0;
    if (Number(w.weight)) return Number(w.weight);
    const n = w.name || '';
    return DD_WEAPON_WEIGHTS[n] ?? DD_WEAPON_WEIGHTS[n.replace(/s$/, '')] ?? 0;
}
function catalogueMatches(text) {
    const q = catalogueState.query.trim().toLowerCase();
    return !q || String(text).toLowerCase().includes(q);
}
function newItemId() {
    return `itm_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

function addCatalogueItemToInventory(item, opts = {}) {
    if (!currentCharacter) return;
    if (!Array.isArray(currentCharacter.inventory)) currentCharacter.inventory = [];
    const entry = { location: 'Backpack', qty: 1, magicBonus: 0, isCursed: false, concentration: false, isValuable: false, ...item, uid: newItemId() };
    // Identical mundane items stack.
    const same = !entry.magic && !entry.charges && currentCharacter.inventory.find(i => i.catalogId && i.catalogId === entry.catalogId && i.location === entry.location && !i.magic && !(i.isValuable || i.valueGP > 0));
    if (same) same.qty = (Number(same.qty) || 0) + (Number(entry.qty) || 1);
    else currentCharacter.inventory.push(entry);
    if (typeof syncInventoryUI === 'function') syncInventoryUI();
    if (typeof debouncedSave === 'function') debouncedSave();
    const msg = document.getElementById('catalogue-msg');
    if (msg) { msg.textContent = `Added ${entry.qty > 1 ? entry.qty + ' × ' : ''}${entry.name}.`; msg.style.opacity = 1; }
    if (opts.log && typeof addChronicleEntry === 'function') addChronicleEntry('note', `Gained ${entry.name}.`, { item: entry.catalogId });
}

// ---------------------------------------------------------------------------
// Modal
// ---------------------------------------------------------------------------
function openCatalogue(tab = 'gear', group = '') {
    catalogueState = { tab, query: '', group, open: null };
    const modal = document.getElementById('catalogue-modal');
    if (!modal) return;
    modal.style.display = 'flex';
    const search = document.getElementById('catalogue-search');
    if (search) search.value = '';
    renderCatalogue();
    if (search) search.focus();
}
function closeCatalogue() {
    const modal = document.getElementById('catalogue-modal');
    if (modal) modal.style.display = 'none';
}
function setCatalogueTab(tab) {
    catalogueState.tab = tab; catalogueState.group = ''; catalogueState.open = null;
    renderCatalogue();
}
function setCatalogueQuery(q) {
    catalogueState.query = q;
    renderCatalogueBody();
}
function setCatalogueGroup(g) {
    catalogueState.group = g;
    renderCatalogueBody();
}
function toggleCatalogueRow(id) {
    catalogueState.open = catalogueState.open === id ? null : id;
    renderCatalogueBody();
}

function renderCatalogue() {
    const tabs = document.getElementById('catalogue-tabs');
    if (tabs) tabs.innerHTML = CATALOGUE_TABS.map(t => `<button type="button" class="${catalogueState.tab === t.id ? 'on' : ''}" onclick="setCatalogueTab('${t.id}')">${t.label}</button>`).join('');
    const filters = document.getElementById('catalogue-filters');
    const search = document.getElementById('catalogue-search');
    if (search) search.style.display = catalogueState.tab === 'forge' ? 'none' : '';
    if (filters) {
        filters.innerHTML = catalogueState.tab === 'magic'
            ? `<select class="stat-input arc-input" style="max-width: 220px;" onchange="setCatalogueGroup(this.value)"><option value="">All magic items</option>${Object.entries(MAGIC_GROUPS).map(([k, v]) => `<option value="${k}" ${catalogueState.group === k ? 'selected' : ''}>${v}</option>`).join('')}</select>`
            : '';
    }
    renderCatalogueBody();
}

function catRow({ id, name, meta, desc, actions, warn = '', tagHtml = '' }) {
    const open = catalogueState.open === id;
    return `
    <div class="cat-row${open ? ' open' : ''}">
        <div class="cat-row-head">
            <button type="button" class="arc-name" onclick="toggleCatalogueRow('${id}')">${escapeHtml(name)}</button>
            ${tagHtml}
            <span class="cat-meta">${meta}</span>
            <span class="cat-actions">${actions}</span>
        </div>
        ${warn ? `<div class="cat-warn">${escapeHtml(warn)}</div>` : ''}
        ${open ? `<div class="cat-desc">${desc}</div>` : ''}
    </div>`;
}

function renderCatalogueBody() {
    const body = document.getElementById('catalogue-body');
    if (!body) return;
    const t = catalogueState.tab;
    let html = '';
    if (t === 'gear') html = renderGearTab();
    else if (t === 'weapons') html = renderWeaponsTab();
    else if (t === 'armour') html = renderArmourTab();
    else if (t === 'mounts') html = renderMountsTab();
    else if (t === 'magic') html = renderMagicTab();
    else if (t === 'forge') html = renderForge();
    body.innerHTML = html || '<div class="ledger-note" style="padding: 12px;">Nothing matches.</div>';
}

// ----- Gear -----
function renderGearTab() {
    return DD_GEAR.filter(g => catalogueMatches(g.name + ' ' + g.desc)).map(g => catRow({
        id: g.id, name: g.pack > 1 ? `${g.name} (${g.pack})` : g.name,
        meta: `${fmtWeight(g.weight * g.pack)} · ${escapeHtml(g.costText)}`,
        desc: `${escapeHtml(g.desc)}<div class="arc-source">${escapeHtml(g.source)}</div>`,
        actions: `<button type="button" class="btn btn-sm" onclick="addGearFromCatalogue('${g.id}')">Add</button>`,
    })).join('');
}
function addGearFromCatalogue(id) {
    const g = DD_GEAR.find(x => x.id === id); if (!g) return;
    addCatalogueItemToInventory({ catalogId: g.id, name: g.name, category: g.category, qty: g.pack, weight: g.weight, cost: g.cost, desc: g.desc, source: g.source });
}

// ----- Weapons -----
function renderWeaponsTab() {
    const db = window.GlobalWeaponsDatabase || {};
    return Object.values(db).filter(w => catalogueMatches(w.name)).sort((a, b) => a.name.localeCompare(b.name)).map(w => {
        const usable = typeof canCharacterUseWeapon === 'function' ? canCharacterUseWeapon(w, currentCharacter) : true;
        const basic = w.armed?.B || {};
        const typeLabel = { '1h-melee': 'One-handed', '2h-melee': 'Two-handed', versatile: 'One- or two-handed', missile: 'Missile', thrown: 'Thrown' }[w.type] || w.type || '';
        return catRow({
            id: 'w_' + w.id, name: w.name,
            meta: `${fmtWeight(weaponWeight(w))} · ${escapeHtml(w.cost || '—')}`,
            tagHtml: usable ? '' : '<span class="tag" style="color: var(--danger);">Not for your class</span>',
            desc: `${escapeHtml(typeLabel)}. Basic mastery: damage ${escapeHtml(basic.damage || '—')}${basic.range ? `, range ${escapeHtml(basic.range)}` : ''}${basic.special ? `, ${escapeHtml(basic.special)}` : ''}. Weapon feats and mastery are on the Combat tab.<div class="arc-source">Dark Dungeons Table 8-2 / Mystara Extra Rules Compendium</div>`,
            actions: `<button type="button" class="btn btn-sm" onclick="addWeaponFromCatalogue('${w.id}')">Add</button><button type="button" class="btn btn-sm" onclick="catalogueEquip('weapon', '${w.id}')">Equip</button><button type="button" class="btn btn-sm" onclick="openForgeFor('weapon', '${w.id}')" title="Make a magic one">Enchant</button>`,
        });
    }).join('');
}
function addWeaponFromCatalogue(weaponId) {
    const w = (window.GlobalWeaponsDatabase || {})[weaponId]; if (!w) return;
    addCatalogueItemToInventory({ catalogId: 'weapon_' + w.id, weaponId: w.id, name: w.name, category: 'weapon', weight: weaponWeight(w), cost: parseCostGp(w.cost), desc: '' });
}

// ----- Armour -----
function renderArmourTab() {
    return DD_ARMOUR.filter(a => catalogueMatches(a.name + ' ' + a.desc)).map(a => {
        const isCentaur = currentCharacter && currentCharacter.characterClass === 'Centaur';
        const isPegataur = currentCharacter && currentCharacter.characterClass === 'Pegataur';
        const allowed = a.isShield ? (typeof getArmourRule === 'function' ? getArmourRule(currentCharacter).shields : true)
            : a.centaurOnly ? isCentaur
            : a.pegataurOnly ? isPegataur
            : isCentaur ? false                                   // PC1: a centaur needs barding made for it
            : isPegataur ? false                                  // PC2: so does a pegataur
            : (typeof isArmourAllowed === 'function' ? isArmourAllowed(currentCharacter, a.baseAC) : true);
        return catRow({
            id: a.id, name: a.name,
            meta: `${a.isShield ? 'AC -1' : `AC ${a.baseAC}`} · ${fmtWeight(a.weight)} · ${fmtCost(a.cost)}`,
            tagHtml: allowed ? '' : '<span class="tag" style="color: var(--danger);">Not for your class</span>',
            desc: `${escapeHtml(a.desc)}<div class="arc-source">${escapeHtml(a.source)}${a.centaurOnly || a.pegataurOnly ? '' : ', Table 8-3'}</div>`,
            actions: `<button type="button" class="btn btn-sm" onclick="addArmourFromCatalogue('${a.id}')">Add</button><button type="button" class="btn btn-sm" onclick="catalogueEquip('armour', '${a.id}')">Equip</button><button type="button" class="btn btn-sm" onclick="openForgeFor('${a.isShield ? 'shield' : 'armour'}', '${a.id}')">Enchant</button>`,
        });
    }).join('');
}
function armourItem(a) {
    return a.isShield
        ? { catalogId: a.id, name: a.name, category: 'equipment', isShield: true, slot: 'offHand', weight: a.weight, cost: a.cost, desc: a.desc }
        : { catalogId: a.id, name: a.name, category: 'equipment', isArmor: true, baseAC: a.baseAC, slot: 'armor', weight: a.weight, cost: a.cost, desc: a.desc, ...(a.centaurOnly ? { centaurOnly: true } : {}), ...(a.pegataurOnly ? { pegataurOnly: true } : {}) };
}
function addArmourFromCatalogue(id) {
    const a = DD_ARMOUR.find(x => x.id === id); if (!a) return;
    addCatalogueItemToInventory(armourItem(a));
}

// ----- Animals and vehicles -----
function renderMountsTab() {
    return Object.entries(DD_MOUNTS).filter(([, m]) => catalogueMatches(m.name + ' ' + m.note)).map(([key, m]) => catRow({
        id: 'm_' + key, name: m.name,
        meta: `${m.normal.toLocaleString('en-US')} cn${m.speed ? ` · ${m.speed}'/round` : ''} · ${fmtCost(m.cost)}`,
        desc: `${escapeHtml(m.note)} Carries ${m.normal.toLocaleString('en-US')} cn at full speed and up to ${(m.normal * 2).toLocaleString('en-US')} cn at half speed.<div class="arc-source">Dark Dungeons Tables 8-4 and 8-5</div>`,
        actions: `<input type="text" class="stat-input arc-input cat-name-input" id="mount-name-${key}" placeholder="Name"><button type="button" class="btn btn-sm" onclick="addMountFromCatalogue('${key}')">Add</button>`,
    })).join('') + `<p class="sub-caption" style="padding: 8px 4px;">Saddles, saddle bags and barding are on the Gear tab. Animals appear under Mounts &amp; Transport, where you can load them.</p>`;
}
function addMountFromCatalogue(key) {
    if (!currentCharacter || !DD_MOUNTS[key]) return;
    const input = document.getElementById(`mount-name-${key}`);
    const name = (input?.value || '').trim() || DD_MOUNTS[key].name;
    if (!Array.isArray(currentCharacter.mounts)) currentCharacter.mounts = [];
    currentCharacter.mounts.push({ id: 'mount_' + Date.now(), name, type: key, coins: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 } });
    if (typeof syncInventoryUI === 'function') syncInventoryUI();
    if (typeof debouncedSave === 'function') debouncedSave();
    const msg = document.getElementById('catalogue-msg');
    if (msg) msg.textContent = `Added ${name}.`;
}

// ----- Magic items -----
function magicUsableNote(item) {
    const by = String(item.usableBy || 'Any');
    if (!currentCharacter || /^any/i.test(by)) return '';
    const cls = currentCharacter.characterClass || '';
    const profiles = typeof getCasterProfiles === 'function' ? getCasterProfiles(currentCharacter) : [];
    const arcane = profiles.some(p => p.type === 'arcane'), divine = profiles.some(p => p.type === 'divine');
    const b = by.toLowerCase();
    const ok = b.includes(cls.toLowerCase()) || (arcane && /magic-user|elves|elf|spellcaster/.test(b)) || (divine && /cleric|spellcaster/.test(b))
        || (!arcane && !divine && /fighter|dwarves|halflings|thieves|mystics|non-spellcaster/.test(b));
    if (ok && typeof isArcaneWarrior === 'function' && isArcaneWarrior() && /magic-user|elves|elf/.test(b)) return 'Arcane warrior: 10% chance it fails or malfunctions each use';
    return ok ? '' : `Usable by: ${by}`;
}
function renderMagicTab() {
    const g = catalogueState.group;
    let html = '';
    if (g !== 'arms') {
        const list = RC_MAGIC_ITEMS.filter(x => (!g || x.group === g) && catalogueMatches(x.name + ' ' + x.desc));
        if (g && RC_ITEM_RULES[`${g === 'staff' || g === 'rod' ? 'wand' : g}_rules`]) {
            const r = RC_ITEM_RULES[`${g === 'staff' || g === 'rod' ? 'wand' : g}_rules`];
            html += `<details class="arc-rules" style="margin: 6px 4px 10px;"><summary>${escapeHtml(r.name)}</summary><p class="sub-caption">${escapeHtml(r.desc)}</p></details>`;
        }
        html += list.map(x => {
            const variants = Array.isArray(x.variants) && x.variants.length ? `<select class="stat-input arc-input cat-variant" id="var-${x.id}">${x.variants.map((v, i) => `<option value="${i}">${escapeHtml(v.suffix)}</option>`).join('')}</select>` : '';
            const tags = [`<span class="tag">${escapeHtml(MAGIC_GROUPS[x.group] || x.group)}</span>`];
            if (x.cursed) tags.push(`<span class="tag" style="color: var(--danger);">Cursed</span>`);
            if (x.houseRule) tags.push(`<span class="tag" style="color: var(--warn);">House rule</span>`);
            if (x.anyClass) tags.push(`<span class="tag" style="color: var(--info);" title="Not metal armour: any class may wear it on this sheet">Any class</span>`);
            const facts = [x.charges ? `Charges ${escapeHtml(x.charges)}` : '', x.duration ? `Duration ${escapeHtml(x.duration)}` : '', x.usableBy ? `Usable by ${escapeHtml(x.usableBy)}` : '', x.slot ? `Worn: ${escapeHtml(x.slot)}` : ''].filter(Boolean).join(' · ');
            return catRow({
                id: x.id, name: x.name, tagHtml: tags.join(''),
                meta: `${fmtWeight(x.weight)}${x.cost ? ` · ${fmtCost(x.cost)}` : ''}`,
                warn: magicUsableNote(x),
                desc: `${facts ? `<div class="cat-facts">${facts}</div>` : ''}${escapeHtml(x.desc)}${Array.isArray(x.variants) && x.variants.some(v => v.note) ? `<ul class="cat-variant-notes">${x.variants.map(v => `<li><strong>${escapeHtml(v.suffix)}</strong> ${escapeHtml(v.note || '')}</li>`).join('')}</ul>` : ''}<div class="arc-source">${x.houseRule || (x.source && x.source !== 'Rules Cyclopedia') ? escapeHtml(x.source) : `Rules Cyclopedia p. ${x.page || ''}`}</div>`,
                actions: `${variants}<button type="button" class="btn btn-sm" onclick="addMagicFromCatalogue('${x.id}')">Add</button>${(x.slot || x.techWeapon || x.weaponId || ['wand', 'staff', 'rod'].includes(x.group)) ? `<button type="button" class="btn btn-sm" onclick="catalogueEquip('magic', '${x.id}')">Equip</button>` : ''}`,
            });
        }).join('');
    }
    if (!g || g === 'arms') {
        const arms = [...RC_ARMS.namedWeapons.map(w => ({ ...w, kind: 'weapon' })), ...RC_ARMS.namedArmour.map(a => ({ ...a, kind: 'armour' }))]
            .filter(x => catalogueMatches(x.name + ' ' + x.desc));
        if (g === 'arms') html += `<p class="sub-caption" style="padding: 4px;">The Rules Cyclopedia's magic weapons and armour. To enchant any other weapon (Dark Dungeons and Compendium weapons too) use the Magic forge.</p>`;
        html += arms.map(x => {
            const base = forgeBaseForNamed(x);
            const tags = [`<span class="tag">${x.kind === 'weapon' ? 'Weapon' : 'Armour'}</span>`];
            if (x.cursed) tags.push(`<span class="tag" style="color: var(--danger);">Cursed</span>`);
            return catRow({
                id: 'rc_' + x.id, name: x.name, tagHtml: tags.join(''), meta: '',
                desc: `${escapeHtml(x.desc)}<div class="arc-source">Rules Cyclopedia p. ${x.page || ''}</div>`,
                actions: base ? `<button type="button" class="btn btn-sm" onclick="openForgeNamed('${x.id}')">Forge</button>` : '',
            });
        }).join('');
    }
    return html;
}
function addMagicFromCatalogue(id, variantIndex = null) {
    const x = RC_MAGIC_ITEMS.find(i => i.id === id); if (!x) return;
    // A bag of holding becomes a container you can put things in.
    if (id === 'misc_bag_of_holding' && typeof addNewBagOfHolding === 'function') {
        addNewBagOfHolding();
        const msg = document.getElementById('catalogue-msg');
        if (msg) msg.textContent = 'Added a Bag of Holding (see Bags of Holding).';
        return;
    }
    const sel = document.getElementById(`var-${id}`);
    const vi = variantIndex !== null ? Number(variantIndex) : sel ? Number(sel.value) || 0 : 0;
    const v = Array.isArray(x.variants) && x.variants.length ? x.variants[vi] || x.variants[0] : null;
    const item = {
        catalogId: x.id, name: v ? `${x.name} ${v.suffix}` : x.name, group: x.group, magic: true,
        category: x.group === 'potion' || x.group === 'scroll' ? 'consumable' : 'equipment',
        weight: x.weight, desc: x.desc, slot: x.slot || undefined, isCursed: Boolean(x.cursed), concentration: Boolean(x.concentration),
        usableBy: x.usableBy, duration: x.duration, page: x.page, source: x.source || 'Rules Cyclopedia',
    };
    if (v && v.armourAC != null) item.armourAC = Number(v.armourAC);
    if (v && v.note) item.desc = `${v.note} ${x.desc}`;
    // Armour, weapons and other catalogue fields carried over as they are (Blackmoor technology).
    ['isArmor', 'baseAC', 'anyClass', 'techWeapon', 'weaponId', 'magicBonus', 'cost', 'saveBonusBy'].forEach(k => { if (x[k] !== undefined) item[k] = x[k]; });
    if (x.category) item.category = x.category;
    if (x.isArmor) delete item.slot;
    const ac = v && v.acBonus != null ? v.acBonus : x.acBonus;
    const sv = v && v.saveBonus != null ? v.saveBonus : x.saveBonus;
    if (ac) item.acBonus = Number(ac);
    if (sv) item.saveBonus = Number(sv);
    // Roll the charges it is found with (e.g. "2d10 (optional 3d10)").
    if (x.id === 'ring_wishes') {
        // 1d10: 1-4 one wish, 5-7 two, 8-9 three, 10 four (Rules Cyclopedia).
        const r = 1 + Math.floor(Math.random() * 10);
        item.charges = r <= 4 ? 1 : r <= 7 ? 2 : r <= 9 ? 3 : 4; item.chargesRule = '1d10: 1-4 = 1, 5-7 = 2, 8-9 = 3, 10 = 4 wishes';
    } else if (x.charges) {
        const m = String(x.charges).match(/^(\d+)d(\d+)(?:\s*\+\s*(\d+))?/);
        if (m) { let t = Number(m[3]) || 0; for (let i = 0; i < Number(m[1]); i++) t += 1 + Math.floor(Math.random() * Number(m[2])); item.charges = t; item.chargesRule = x.charges; }
        else if (/^\d+$/.test(String(x.charges))) item.charges = Number(x.charges);
    }
    addCatalogueItemToInventory(item);
}

// ---------------------------------------------------------------------------
// Magic forge (RC Chapter 16 rules on any base item)
// ---------------------------------------------------------------------------
function defaultForge(kind = 'weapon', baseId = '') {
    const db = window.GlobalWeaponsDatabase || {};
    const first = { weapon: baseId || (db.sword_normal ? 'sword_normal' : Object.keys(db)[0]), missile: baseId || 'dd_arrows', armour: baseId || 'dd_chain', shield: 'dd_shield' }[kind];
    return { kind, base: first, bonus: 1, enemy: '', enemyBonus: 2, returning: false, talents: [], qty: kind === 'missile' ? 10 : 1, intelligent: false, int: 7, ego: 5, alignment: 'Neutral', languages: '', primary: [], extraordinary: [], name: '' };
}
function openForgeFor(kind, baseId) {
    forgeState = defaultForge(kind, baseId);
    catalogueState.tab = 'forge';
    renderCatalogue();
}
function forgeBaseForNamed(x) {
    const db = window.GlobalWeaponsDatabase || {};
    if (x.kind === 'armour') {
        const name = String(x.base || '').toLowerCase();
        if (name === 'shield') return { kind: 'shield', base: 'dd_shield' };
        const a = DD_ARMOUR.find(a => !a.isShield && a.name.toLowerCase().startsWith(name.split(' ')[0]));
        return a && !/\+/.test(x.base) ? { kind: 'armour', base: a.id } : null;
    }
    const b = String(x.base || '');
    const miss = { Arrow: 'dd_arrows', Quarrel: 'dd_bolts', 'Sling Stone': 'dd_pellets' }[b];
    if (miss) return { kind: 'missile', base: miss };
    const w = Object.values(db).find(w => w.name.toLowerCase() === b.toLowerCase() || w.name.toLowerCase().replace(/s$/, '') === b.toLowerCase());
    return w ? { kind: 'weapon', base: w.id } : null;
}
function openForgeNamed(id) {
    const x = [...RC_ARMS.namedWeapons.map(w => ({ ...w, kind: 'weapon' })), ...RC_ARMS.namedArmour.map(a => ({ ...a, kind: 'armour' }))].find(i => i.id === id);
    if (!x) return;
    const b = forgeBaseForNamed(x); if (!b) return;
    forgeState = defaultForge(b.kind, b.base);
    if (Number.isFinite(Number(x.bonus)) && x.bonus) forgeState.bonus = Number(x.bonus);
    if (x.cursed && forgeState.bonus > 0) forgeState.bonus = -forgeState.bonus;
    if (x.enemy) {
        const e = RC_ARMS.enemyBonuses.find(e => e.id === x.enemy || e.name.toLowerCase().includes(String(x.enemy).toLowerCase()));
        if (e) { forgeState.enemy = e.id; forgeState.enemyBonus = Math.max(1, (Number(x.enemyBonus) || 0) - (Number(x.bonus) || 0)); }
    }
    if (x.quantity) forgeState.qty = 10;
    catalogueState.tab = 'forge';
    renderCatalogue();
}
function forgeSet(field, value) {
    if (!forgeState) forgeState = defaultForge();
    if (field === 'kind') { forgeState = value === 'item' ? defaultForgeItem() : defaultForge(value); }
    else if (['bonus', 'enemyBonus', 'qty', 'int', 'ego'].includes(field)) forgeState[field] = Number(value) || 0;
    else if (['returning', 'intelligent'].includes(field)) forgeState[field] = Boolean(value);
    else forgeState[field] = value;
    renderCatalogueBody();
}
function forgeToggle(list, id, on) {
    if (!forgeState) return;
    forgeState[list] = forgeState[list].filter(x => x !== id);
    if (on) forgeState[list].push(id);
    renderCatalogueBody();
}
function forgeBase() {
    const f = forgeState;
    const db = window.GlobalWeaponsDatabase || {};
    if (f.kind === 'weapon') { const w = db[f.base]; return w ? { name: w.name, weight: weaponWeight(w), price: parseCostGp(w.cost), weapon: w } : null; }
    if (f.kind === 'missile') { const g = DD_GEAR.find(x => x.id === f.base); const m = FORGE_MISSILES.find(x => x.id === f.base); return g ? { name: m.plural, single: m.name, weight: g.weight, price: g.cost, gear: g } : null; }
    const a = DD_ARMOUR.find(x => x.id === f.base);
    return a ? { name: a.name, weight: a.weight, price: a.cost, armour: a } : null;
}
function forgeIsSword(base) {
    return Boolean(base && base.weapon && /^sword/i.test(base.weapon.name));
}
function forgeIsThrowable(base) {
    if (!base || !base.weapon) return false;
    const w = base.weapon;
    return w.type === 'thrown' || /axe, hand|dagger|hammer|javelin|spear|bola|net|trident/i.test(w.name) || Boolean(w.armed?.B?.range && w.type !== 'missile');
}
function forgeResult() {
    const f = forgeState;
    const base = forgeBase();
    if (!base) return null;
    const bonus = Number(f.bonus) || 0;
    const sign = n => (n > 0 ? `+${n}` : `${n}`);
    const enemy = f.enemy ? RC_ARMS.enemyBonuses.find(e => e.id === f.enemy) : null;
    const talentList = f.kind === 'missile' ? RC_ARMS.missileTalents : (f.kind === 'weapon' ? RC_ARMS.weaponTalents : RC_ARMS.armourPowers);
    const talents = f.talents.map(id => talentList.find(t => t.id === id)).filter(Boolean);
    const sword = forgeIsSword(base);
    let name = `${f.kind === 'missile' ? base.plural || base.name : base.name} ${sign(bonus)}`;
    if (enemy && bonus > 0 && f.kind === 'weapon') name += `, ${sign(bonus + f.enemyBonus)} ${enemy.name.replace(/^vs\.\s*/i, 'vs. ')}`;
    if (bonus < 0) name += ' (cursed)';
    if (f.returning && f.kind === 'weapon') name += ', returning';
    if (talents.length) name += ` (${talents.map(t => t.name).join(', ')})`;
    // RC enchantment cost (initial x bonus, enemy bonus at half, talents/powers priced by the DM).
    const isArmour = f.kind === 'armour' || f.kind === 'shield';
    const raw = isArmour ? base.price * base.weight / 3 : base.price * base.weight * 5;
    const initial = Math.max(isArmour ? 3000 : 100, Math.ceil(raw / 10) * 10);
    const abs = Math.abs(bonus);
    let cost = initial * Math.max(1, abs);
    if (enemy && bonus > 0 && f.kind === 'weapon') cost += initial * 0.5 * f.enemyBonus;
    const descParts = [];
    if (bonus > 0) descParts.push(isArmour ? `${sign(bonus)} magic: improves AC by ${bonus}${f.kind === 'shield' ? ' (on top of the shield\'s normal 1)' : ''}.` : `${sign(bonus)} to attack and damage rolls.`);
    if (bonus < 0) descParts.push(isArmour ? `Cursed: worsens AC by ${abs} once the wearer first fights; cannot be removed without remove curse.` : `Cursed: ${sign(bonus)} to attack and damage; the owner is compelled to keep and use it (remove curse needed to be rid of it).`);
    if (enemy && bonus > 0 && f.kind === 'weapon') descParts.push(`${sign(bonus + f.enemyBonus)} in total against ${enemy.name.replace(/^vs\.\s*/i, '')}: ${enemy.desc}`);
    if (f.returning && f.kind === 'weapon') descParts.push('Returning: when thrown it flies back to the thrower\'s hand at the end of the round, hit or miss.');
    if (f.kind === 'missile') descParts.push('Each missile loses its magic when fired, hit or miss. A magic launcher\'s bonus adds to the missile\'s.');
    talents.forEach(t => descParts.push(`${t.name}: ${t.desc}`));
    let intel = null;
    if (sword && f.intelligent) {
        const comm = f.int >= 10 ? 'speech' : 'empathy';
        const prim = f.primary.map(id => RC_ARMS.swordPowers.primary.find(p => p.id === id)).filter(Boolean);
        const extra = f.extraordinary.map(id => RC_ARMS.swordPowers.extraordinary.find(p => p.id === id)).filter(Boolean);
        intel = { int: f.int, ego: f.ego, alignment: f.alignment, communication: comm, languages: f.languages, primary: prim.map(p => p.name), extraordinary: extra.map(p => p.name) };
        descParts.push(`Intelligent sword: Int ${f.int}, Ego ${f.ego}, ${f.alignment}, communicates by ${comm}${f.languages ? `; languages: ${f.languages}` : ''}.`);
        prim.forEach(p => descParts.push(`${p.name}: ${p.desc}`));
        extra.forEach(p => descParts.push(`${p.name}: ${p.desc}`));
    }
    return { base, name: (f.name || '').trim() || name, autoName: name, cost: Math.round(cost), initial, desc: descParts.join(' '), talents, enemy, intel, sword, isArmour };
}
function renderForge() {
    if (!forgeState) forgeState = defaultForge();
    if (forgeState.kind === 'item') return renderForgeItem();
    const f = forgeState;
    const db = window.GlobalWeaponsDatabase || {};
    const r = forgeResult();
    const kinds = [['weapon', 'Weapon'], ['missile', 'Missiles'], ['armour', 'Armour'], ['shield', 'Shield'], ['item', 'Other magic item']];
    let baseOpts = '';
    if (f.kind === 'weapon') baseOpts = Object.values(db).filter(w => !/^(oil|holy|rock)/.test(w.id)).sort((a, b) => a.name.localeCompare(b.name)).map(w => `<option value="${w.id}" ${f.base === w.id ? 'selected' : ''}>${escapeHtml(w.name)}</option>`).join('');
    if (f.kind === 'missile') baseOpts = FORGE_MISSILES.map(m => `<option value="${m.id}" ${f.base === m.id ? 'selected' : ''}>${escapeHtml(m.plural)}</option>`).join('');
    if (f.kind === 'armour') baseOpts = DD_ARMOUR.filter(a => !a.isShield).map(a => `<option value="${a.id}" ${f.base === a.id ? 'selected' : ''}>${escapeHtml(a.name)} (AC ${a.baseAC})</option>`).join('');
    if (f.kind === 'shield') baseOpts = '<option value="dd_shield" selected>Shield</option>';
    const bonusOpts = [1, 2, 3, 4, 5, -1, -2, -3, -4, -5].map(b => `<option value="${b}" ${f.bonus === b ? 'selected' : ''}>${b > 0 ? '+' + b : b + ' (cursed)'}</option>`).join('');
    const isArm = f.kind === 'armour' || f.kind === 'shield';
    const talentList = f.kind === 'missile' ? RC_ARMS.missileTalents : (f.kind === 'weapon' ? RC_ARMS.weaponTalents : RC_ARMS.armourPowers);
    const talentLabel = f.kind === 'missile' ? 'Missile talents' : (f.kind === 'weapon' ? 'Talents' : 'Special powers');
    const talentsHtml = talentList.map(t => `<label class="arc-check cat-talent" title="${escapeHtml(t.desc)}"><input type="checkbox" ${f.talents.includes(t.id) ? 'checked' : ''} onchange="forgeToggle('talents', '${t.id}', this.checked)"> ${escapeHtml(t.name)}</label>`).join('');
    const sword = r && r.sword;
    const intelHtml = sword ? `
        <div class="arc-sub-head"><label class="arc-check"><input type="checkbox" ${f.intelligent ? 'checked' : ''} onchange="forgeSet('intelligent', this.checked)"> Intelligent sword</label><span class="eyebrow">swords only</span></div>
        ${f.intelligent ? `
        <div class="arc-fields">
            <label class="arc-field arc-narrow"><span class="eyebrow">Intelligence</span><select class="stat-input arc-input" onchange="forgeSet('int', this.value)">${[7, 8, 9, 10, 11, 12].map(i => `<option ${f.int === i ? 'selected' : ''}>${i}</option>`).join('')}</select></label>
            <label class="arc-field arc-narrow"><span class="eyebrow">Ego</span><input type="number" min="1" max="12" class="stat-input arc-input" value="${f.ego}" onchange="forgeSet('ego', this.value)"></label>
            <label class="arc-field arc-narrow"><span class="eyebrow">Alignment</span><select class="stat-input arc-input" onchange="forgeSet('alignment', this.value)">${['Lawful', 'Neutral', 'Chaotic'].map(a => `<option ${f.alignment === a ? 'selected' : ''}>${a}</option>`).join('')}</select></label>
            <label class="arc-field"><span class="eyebrow">Languages</span><input type="text" class="stat-input arc-input" value="${escapeHtml(f.languages)}" placeholder="Int 10+ speaks" onchange="forgeSet('languages', this.value)"></label>
        </div>
        <div class="eyebrow" style="margin-top: 6px;">Primary powers</div>
        <div class="cat-talents">${RC_ARMS.swordPowers.primary.map(t => `<label class="arc-check cat-talent" title="${escapeHtml(t.desc)}"><input type="checkbox" ${f.primary.includes(t.id) ? 'checked' : ''} onchange="forgeToggle('primary', '${t.id}', this.checked)"> ${escapeHtml(t.name)}</label>`).join('')}</div>
        <div class="eyebrow" style="margin-top: 6px;">Extraordinary powers</div>
        <div class="cat-talents">${RC_ARMS.swordPowers.extraordinary.map(t => `<label class="arc-check cat-talent" title="${escapeHtml(t.desc)}"><input type="checkbox" ${f.extraordinary.includes(t.id) ? 'checked' : ''} onchange="forgeToggle('extraordinary', '${t.id}', this.checked)"> ${escapeHtml(t.name)}</label>`).join('')}</div>
        <details class="arc-rules"><summary>Intelligent swords</summary><p class="sub-caption">${escapeHtml(RC_ARMS.intelligentSwords)}</p></details>` : ''}` : '';
    return `
    <div class="cat-forge">
        <p class="sub-caption">Make a magic item on any base, including Dark Dungeons and Compendium weapons, using the Rules Cyclopedia's magic weapon and armour rules.</p>
        <div class="arc-fields">
            <label class="arc-field arc-narrow"><span class="eyebrow">Kind</span><select class="stat-input arc-input" onchange="forgeSet('kind', this.value)">${kinds.map(([k, l]) => `<option value="${k}" ${f.kind === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
            <label class="arc-field"><span class="eyebrow">Base item</span><select class="stat-input arc-input" onchange="forgeSet('base', this.value)">${baseOpts}</select></label>
            <label class="arc-field arc-narrow"><span class="eyebrow">Bonus</span><select class="stat-input arc-input" onchange="forgeSet('bonus', this.value)">${bonusOpts}</select></label>
            ${f.kind === 'missile' ? `<label class="arc-field arc-narrow"><span class="eyebrow">How many</span><input type="number" min="1" class="stat-input arc-input" value="${f.qty}" onchange="forgeSet('qty', this.value)"></label>` : ''}
        </div>
        ${f.kind === 'weapon' ? `
        <div class="arc-fields">
            <label class="arc-field"><span class="eyebrow">Extra bonus against</span><select class="stat-input arc-input" onchange="forgeSet('enemy', this.value)"><option value="">None</option>${RC_ARMS.enemyBonuses.map(e => `<option value="${e.id}" ${f.enemy === e.id ? 'selected' : ''}>${escapeHtml(e.name)}</option>`).join('')}</select></label>
            ${f.enemy ? `<label class="arc-field arc-narrow"><span class="eyebrow">Extra</span><select class="stat-input arc-input" onchange="forgeSet('enemyBonus', this.value)">${[1, 2, 3, 4, 5].map(b => `<option value="${b}" ${f.enemyBonus === b ? 'selected' : ''}>+${b}</option>`).join('')}</select></label>` : ''}
            ${f.kind === 'weapon' && forgeIsThrowable(r && r.base) ? `<label class="arc-check"><input type="checkbox" ${f.returning ? 'checked' : ''} onchange="forgeSet('returning', this.checked)"> Returning (thrown)</label>` : ''}
        </div>` : ''}
        <div class="arc-sub-head"><span class="eyebrow eyebrow-strong">${talentLabel}</span><span class="eyebrow">hover for the rules</span></div>
        <div class="cat-talents">${talentsHtml}</div>
        ${intelHtml}
        ${r ? `
        <div class="arc-panel">
            <div class="arc-fields"><label class="arc-field"><span class="eyebrow">Name</span><input type="text" class="stat-input arc-input" value="${escapeHtml(f.name || '')}" placeholder="${escapeHtml(r.autoName)}" onchange="forgeSet('name', this.value)"></label></div>
            <div class="tally" style="margin: 6px 0;">
                <span>Weight <strong>${fmtWeight(r.base.weight * (f.kind === 'missile' ? f.qty : 1))}</strong></span>
                <span title="Rules Cyclopedia: base price × encumbrance (×5 weapons, ÷3 armour), × bonus, + half the cost of an extra bonus; talents and powers extra">Enchantment cost <strong>${r.cost.toLocaleString('en-US')} gp</strong>${r.talents.length || (r.intel) ? ' + talents' : ''}${f.kind === 'missile' ? ' each' : ''}</span>
                <span>Market price about <strong>${(r.cost * 2).toLocaleString('en-US')} gp</strong></span>
            </div>
            <p class="sub-caption" style="margin: 4px 0;">${escapeHtml(r.desc)}</p>
            <div class="arc-actions"><button type="button" class="btn btn-sm btn-accent" onclick="addForgedItem()">Add to inventory</button>${f.kind !== 'missile' ? '<button type="button" class="btn btn-sm" onclick="catalogueEquip(\'forge\')">Add &amp; equip</button>' : ''}</div>
        </div>` : ''}
        <details class="arc-rules"><summary>${isArm ? 'Magic armour rules' : (f.kind === 'missile' ? 'Magic missile rules' : 'Magic weapon rules')}</summary><p class="sub-caption">${escapeHtml(isArm ? RC_ARMS.armourRules : (f.kind === 'missile' ? RC_ARMS.missileRules : RC_ARMS.swordRules + ' ' + RC_ARMS.miscWeaponRules))}</p></details>
        <details class="arc-rules"><summary>Enchantment costs</summary><p class="sub-caption">${escapeHtml(RC_ARMS.enchantmentRules)}</p></details>
    </div>`;
}
function addForgedItem() {
    if (forgeState && forgeState.kind === 'item') { if (currentCharacter) addForgedMiscItem(); return; }
    const r = forgeResult(); if (!r || !currentCharacter) return;
    const f = forgeState;
    const bonus = Number(f.bonus) || 0;
    const item = {
        catalogId: 'forge', name: r.name, magic: true, magicBonus: bonus, isCursed: bonus < 0, desc: r.desc,
        cost: r.cost * 2, enchantCost: r.cost, source: 'Rules Cyclopedia (magic forge)',
    };
    if (f.kind === 'weapon') Object.assign(item, { category: 'weapon', weaponId: f.base, weight: r.base.weight });
    if (f.kind === 'missile') Object.assign(item, { category: 'ammo', qty: Math.max(1, f.qty), weight: r.base.weight, ammoFor: f.base });
    if (f.kind === 'armour') Object.assign(item, { category: 'equipment', isArmor: true, baseAC: r.base.armour.baseAC, slot: 'armor', weight: r.base.weight });
    if (f.kind === 'shield') Object.assign(item, { category: 'equipment', isShield: true, slot: 'offHand', weight: r.base.weight });
    if (r.enemy && bonus > 0 && f.kind === 'weapon') item.enemyBonus = { id: r.enemy.id, name: r.enemy.name.replace(/^vs\.\s*/i, ''), bonus: bonus + f.enemyBonus };
    if (r.talents.length) item.talents = r.talents.map(t => t.name);
    if (f.returning && f.kind === 'weapon') item.returning = true;
    if (r.intel) item.intelligence = r.intel;
    addCatalogueItemToInventory(item);
}


// ---------------------------------------------------------------------------
// Other magic items (Rules Cyclopedia, Making Magical Items: miscellaneous items).
// Initial cost 1,000 gp per spell level; charges cost 10% of that each, permanence 5 times it;
// usable N times an hour/day/week/month: initial cost -20/25/30/35%, then 30 + N charges.
// Chance of success per spell: (Int + level) x 2 - 3 x spell level. Time: 1 week + 1 day per 1,000 gp.
const FORGE_ITEM_TYPES = [
    { id: 'misc', label: 'Miscellaneous (cloak, boots, amulet...)' }, { id: 'ring', label: 'Ring' },
    { id: 'wand', label: 'Wand' }, { id: 'staff', label: 'Staff' }, { id: 'rod', label: 'Rod' },
    { id: 'potion', label: 'Potion' }, { id: 'scroll', label: 'Scroll' },
];
const FORGE_PERIODS = [{ id: 'hour', label: 'an hour', cut: 0.20 }, { id: 'day', label: 'a day', cut: 0.25 }, { id: 'week', label: 'a week', cut: 0.30 }, { id: 'month', label: 'a month', cut: 0.35 }];
function defaultForgeItem() {
    return { kind: 'item', type: 'misc', object: '', slot: '', weight: 10, name: '', spells: [{ name: '', level: 1 }], use: 'permanent', charges: 20, uses: 1, period: 'day',
             acBonus: 0, saveBonus: 0, ability: '', abilityMode: 'add', abilityValue: 1, carried: false, cursed: false, notes: '' };
}
function forgeSpellNames() {
    const db = window.GlobalSpellsDatabase || {};
    const seen = new Map();
    Object.values(db).forEach(s => { if (s && s.name && !seen.has(s.name)) seen.set(s.name, s.level); });
    return [...seen.entries()].sort((a, b) => a[0].localeCompare(b[0]));
}
function forgeItemResult() {
    const f = forgeState;
    const spells = f.spells.filter(s => s.name.trim() && Number(s.level) > 0);
    const levels = spells.reduce((t, s) => t + Math.max(1, Math.min(9, Number(s.level) || 1)), 0);
    const initial = levels * 1000;
    let total = 0, useText = '';
    if (f.use === 'permanent') { total = initial * 6; useText = 'permanent (5 times the initial cost)'; }
    else if (f.use === 'charges') { const n = Math.max(1, Number(f.charges) || 1); total = initial + initial * 0.1 * n; useText = `${n} charge${n > 1 ? 's' : ''} (10% of the initial cost each)`; }
    else {
        const p = FORGE_PERIODS.find(x => x.id === f.period) || FORGE_PERIODS[1];
        const n = Math.max(1, Number(f.uses) || 1);
        const cut = initial * (1 - p.cut);
        total = cut + cut * 0.1 * (30 + n);
        useText = `${n} time${n > 1 ? 's' : ''} ${p.label} (initial cost -${Math.round(p.cut * 100)}%, then ${30 + n} charges)`;
    }
    total = Math.round(total);
    const ch = currentCharacter || {};
    const intScore = Number(typeof getEffectiveScore === 'function' ? getEffectiveScore(ch, 'intelligence') : ch.abilities?.intelligence?.score) || 10;
    const lvl = Number(ch.level) || 1;
    const chances = spells.map(s => ({ name: s.name, level: Number(s.level), pct: Math.max(0, Math.min(100, (intScore + lvl) * 2 - 3 * Number(s.level))) }));
    const objectName = (f.object || '').trim() || { misc: 'Amulet', ring: 'Ring', wand: 'Wand', staff: 'Staff', rod: 'Rod', potion: 'Potion', scroll: 'Scroll' }[f.type];
    const autoName = spells.length ? `${objectName} of ${spells.map(s => s.name.trim()).join(' and ')}` : objectName;
    const extras = [];
    if (Number(f.acBonus)) extras.push(`+${Number(f.acBonus)} to AC`);
    if (Number(f.saveBonus)) extras.push(`+${Number(f.saveBonus)} to saving throws`);
    if (f.ability) extras.push(`${f.abilityMode === 'set' ? 'sets' : 'changes'} ${f.ability} ${f.abilityMode === 'set' ? 'to' : 'by'} ${Number(f.abilityValue) > 0 && f.abilityMode !== 'set' ? '+' : ''}${Number(f.abilityValue)}`);
    const desc = [
        spells.length ? `Spell effects: ${spells.map(s => `${s.name.trim()} (level ${s.level})`).join(', ')}.` : '',
        `Use: ${f.use === 'permanent' ? 'permanent, never used up' : f.use === 'charges' ? `${Math.max(1, Number(f.charges) || 1)} charges` : `${Math.max(1, Number(f.uses) || 1)} time(s) ${(FORGE_PERIODS.find(x => x.id === f.period) || FORGE_PERIODS[1]).label}`}.`,
        extras.length ? `Also ${extras.join(', ')}${f.carried ? ' while carried' : ' while worn'}.` : '',
        f.cursed ? 'Cursed.' : '',
        (f.notes || '').trim(),
    ].filter(Boolean).join(' ');
    return { name: (f.name || '').trim() || autoName, autoName, levels, initial, total, useText, chances, days: 7 + Math.ceil(total / 1000), desc, intScore, lvl };
}
function forgeItemSet(field, value) {
    if (!forgeState || forgeState.kind !== 'item') forgeState = defaultForgeItem();
    if (['weight', 'charges', 'uses', 'acBonus', 'saveBonus', 'abilityValue'].includes(field)) forgeState[field] = Number(value) || 0;
    else if (['carried', 'cursed'].includes(field)) forgeState[field] = Boolean(value);
    else forgeState[field] = value;
    if (field === 'type') forgeState.slot = { ring: 'ring', wand: 'held', staff: 'held', rod: 'held' }[value] || (['potion', 'scroll'].includes(value) ? '' : forgeState.slot);
    if (field === 'type' && ['potion', 'scroll'].includes(value) && forgeState.use === 'permanent') forgeState.use = 'charges', forgeState.charges = 1;
    renderCatalogueBody();
}
function forgeSpell(i, field, value) {
    const s = forgeState && forgeState.spells && forgeState.spells[i];
    if (!s) return;
    s[field] = field === 'level' ? Math.max(1, Math.min(9, Number(value) || 1)) : value;
    if (field === 'name') { const hit = forgeSpellNames().find(([n]) => n.toLowerCase() === String(value).trim().toLowerCase()); if (hit) s.level = hit[1]; }
    renderCatalogueBody();
}
function forgeSpellAdd() { forgeState.spells.push({ name: '', level: 1 }); renderCatalogueBody(); }
function forgeSpellRemove(i) { forgeState.spells.splice(i, 1); if (!forgeState.spells.length) forgeState.spells.push({ name: '', level: 1 }); renderCatalogueBody(); }
function renderForgeItem() {
    const f = forgeState;
    const r = forgeItemResult();
    const kinds = [['weapon', 'Weapon'], ['missile', 'Missiles'], ['armour', 'Armour'], ['shield', 'Shield'], ['item', 'Other magic item']];
    const names = forgeSpellNames();
    const slots = [['', 'Not worn (carried)'], ['head', 'Head'], ['neck', 'Neck'], ['cloak', 'Cloak / robe'], ['ring', 'Ring (finger)'], ['belt', 'Belt'], ['hands', 'Hands / bracers'], ['boots', 'Feet / boots'], ['held', 'Held in the hand']];
    const sel = (opts, val, fn) => `<select class="stat-input arc-input" onchange="${fn}">${opts.map(([v, l]) => `<option value="${v}" ${String(val) === String(v) ? 'selected' : ''}>${escapeHtml(l)}</option>`).join('')}</select>`;
    const spellRows = f.spells.map((s, i) => `
        <div class="forge-spell-row">
            <input type="text" class="stat-input arc-input" list="forge-spell-list" value="${escapeHtml(s.name)}" placeholder="Spell, e.g. Invisibility" onchange="forgeSpell(${i}, 'name', this.value)">
            <label class="forge-lvl"><span class="eyebrow">Level</span><input type="number" min="1" max="9" class="stat-input arc-input" value="${s.level}" onchange="forgeSpell(${i}, 'level', this.value)"></label>
            <button type="button" class="icon-btn danger" onclick="forgeSpellRemove(${i})" aria-label="Remove spell">${getIcon('close', 12)}</button>
        </div>`).join('');
    return `
    <div class="cat-forge">
        <p class="sub-caption">Make any other magic item (rings, wands, cloaks, boots, potions...) with the Rules Cyclopedia's rules for miscellaneous magic items: each power is a spell effect costing 1,000 gp per spell level.</p>
        <div class="arc-fields">
            <label class="arc-field arc-narrow"><span class="eyebrow">Kind</span><select class="stat-input arc-input" onchange="forgeSet('kind', this.value)">${kinds.map(([k, l]) => `<option value="${k}" ${f.kind === k ? 'selected' : ''}>${l}</option>`).join('')}</select></label>
            <label class="arc-field"><span class="eyebrow">Type</span>${sel(FORGE_ITEM_TYPES.map(t => [t.id, t.label]), f.type, "forgeItemSet('type', this.value)")}</label>
            <label class="arc-field"><span class="eyebrow">Object</span><input type="text" class="stat-input arc-input" value="${escapeHtml(f.object)}" placeholder="e.g. Cloak, Boots, Brooch" onchange="forgeItemSet('object', this.value)"></label>
            <label class="arc-field arc-narrow"><span class="eyebrow">Worn</span>${sel(slots, f.slot, "forgeItemSet('slot', this.value)")}</label>
            <label class="arc-field arc-narrow"><span class="eyebrow">Weight (cn)</span><input type="number" min="0" class="stat-input arc-input" value="${f.weight}" onchange="forgeItemSet('weight', this.value)"></label>
        </div>
        <div class="arc-sub-head"><span class="eyebrow eyebrow-strong">Spell effects</span><button type="button" class="btn btn-sm" onclick="forgeSpellAdd()">+ Spell effect</button></div>
        <datalist id="forge-spell-list">${names.map(([n, l]) => `<option value="${escapeHtml(n)}">level ${l}</option>`).join('')}</datalist>
        ${spellRows}
        <div class="arc-fields">
            <label class="arc-field"><span class="eyebrow">Use</span>${sel([['permanent', 'Permanent'], ['charges', 'Charges'], ['perday', 'Limited uses per time']], f.use, "forgeItemSet('use', this.value)")}</label>
            ${f.use === 'charges' ? `<label class="arc-field arc-narrow"><span class="eyebrow">Charges</span><input type="number" min="1" class="stat-input arc-input" value="${f.charges}" onchange="forgeItemSet('charges', this.value)"></label>` : ''}
            ${f.use === 'perday' ? `<label class="arc-field arc-narrow"><span class="eyebrow">Uses</span><input type="number" min="1" class="stat-input arc-input" value="${f.uses}" onchange="forgeItemSet('uses', this.value)"></label><label class="arc-field arc-narrow"><span class="eyebrow">Per</span>${sel(FORGE_PERIODS.map(p => [p.id, p.label.replace(/^an? /, '')]), f.period, "forgeItemSet('period', this.value)")}</label>` : ''}
        </div>
        <div class="arc-sub-head"><span class="eyebrow eyebrow-strong">Effects on the sheet</span><span class="eyebrow">priced by the DM</span></div>
        <div class="arc-fields">
            <label class="arc-field arc-narrow"><span class="eyebrow">AC bonus</span><input type="number" min="0" max="10" class="stat-input arc-input" value="${f.acBonus}" onchange="forgeItemSet('acBonus', this.value)"></label>
            <label class="arc-field arc-narrow"><span class="eyebrow">Save bonus</span><input type="number" min="0" max="10" class="stat-input arc-input" value="${f.saveBonus}" onchange="forgeItemSet('saveBonus', this.value)"></label>
            <label class="arc-field"><span class="eyebrow">Ability score</span>${sel([['', 'None'], ['strength', 'Strength'], ['intelligence', 'Intelligence'], ['wisdom', 'Wisdom'], ['dexterity', 'Dexterity'], ['constitution', 'Constitution'], ['charisma', 'Charisma']], f.ability, "forgeItemSet('ability', this.value)")}</label>
            ${f.ability ? `<label class="arc-field arc-narrow"><span class="eyebrow">How</span>${sel([['add', '+/-'], ['set', 'set to']], f.abilityMode, "forgeItemSet('abilityMode', this.value)")}</label><label class="arc-field arc-narrow"><span class="eyebrow">Value</span><input type="number" class="stat-input arc-input" value="${f.abilityValue}" onchange="forgeItemSet('abilityValue', this.value)"></label>` : ''}
        </div>
        <div class="arc-fields">
            <label class="arc-check"><input type="checkbox" ${f.carried ? 'checked' : ''} onchange="forgeItemSet('carried', this.checked)"> Works while carried</label>
            <label class="arc-check"><input type="checkbox" ${f.cursed ? 'checked' : ''} onchange="forgeItemSet('cursed', this.checked)"> Cursed</label>
        </div>
        <label class="arc-field"><span class="eyebrow">Notes</span><input type="text" class="stat-input arc-input" value="${escapeHtml(f.notes)}" placeholder="Command word, appearance, how it works..." onchange="forgeItemSet('notes', this.value)"></label>
        <div class="arc-panel">
            <div class="arc-fields"><label class="arc-field"><span class="eyebrow">Name</span><input type="text" class="stat-input arc-input" value="${escapeHtml(f.name || '')}" placeholder="${escapeHtml(r.autoName)}" onchange="forgeItemSet('name', this.value)"></label></div>
            <div class="tally" style="margin: 6px 0;">
                <span title="1,000 gp per spell level">Initial cost <strong>${r.initial.toLocaleString('en-US')} gp</strong></span>
                <span title="${escapeHtml(r.useText)}">Total cost <strong>${r.total.toLocaleString('en-US')} gp</strong></span>
                <span>Time <strong>${r.days} days</strong></span>
                <span>Market price about <strong>${(r.total * 2).toLocaleString('en-US')} gp</strong></span>
            </div>
            ${r.chances.length ? `<p class="sub-caption" style="margin: 2px 0;">Chance of success for you (Int ${r.intScore}, level ${r.lvl}): ${r.chances.map(c => `${escapeHtml(c.name)} ${c.pct}%`).join(' · ')}. If the first roll fails the item is ruined; a later failure loses that power and stops further enchantment.</p>` : '<p class="sub-caption">Add at least one spell effect to price the item, or leave it empty for a found item.</p>'}
            <p class="sub-caption" style="margin: 4px 0;">${escapeHtml(r.desc)}</p>
            <div class="arc-actions"><button type="button" class="btn btn-sm btn-accent" onclick="addForgedItem()">Add to inventory</button>${!['potion', 'scroll'].includes(f.type) && f.slot ? '<button type="button" class="btn btn-sm" onclick="catalogueEquip(\'forge\')">Add &amp; equip</button>' : ''}</div>
        </div>
        <details class="arc-rules"><summary>Making magical items</summary><p class="sub-caption">Only a magic-user or cleric of 9th level or more can make magic items, and each needs a rare component found by adventure. Initial cost: 1,000 gp per spell level of all the spell effects. Charges cost 10% of the initial cost each; a permanent item costs 5 times the initial cost more (as 50 charges). Items usable a number of times an hour, day, week or month cut the initial cost by 20%, 25%, 30% or 35% and then pay for 30 charges plus one per use. Chance of success, rolled for each spell: (Intelligence + level) × 2 − 3 × spell level. Time: one week plus one day per 1,000 gp, working 8 hours a day.</p><div class="arc-source">Rules Cyclopedia, Chapter 16: Making Magical Items</div></details>
    </div>`;
}
function addForgedMiscItem() {
    const f = forgeState, r = forgeItemResult();
    const group = f.type;
    const item = {
        catalogId: 'forge_item', name: r.name, group, magic: true, category: ['potion', 'scroll'].includes(group) ? 'consumable' : 'equipment',
        weight: Math.max(0, Number(f.weight) || 0), desc: r.desc, isCursed: Boolean(f.cursed),
        cost: r.total * 2, enchantCost: r.total, source: 'Rules Cyclopedia (magic forge)',
    };
    const slot = f.slot === 'held' ? '' : f.slot;
    if (slot) item.slot = slot;
    if (f.slot === 'held' && !['wand', 'staff', 'rod'].includes(group)) item.techWeapon = true;   // held in the main hand
    if (f.use === 'charges') item.charges = Math.max(1, Number(f.charges) || 1);
    if (Number(f.acBonus)) item.acBonus = Number(f.acBonus);
    if (Number(f.saveBonus)) item.saveBonus = Number(f.saveBonus);
    if (f.ability) item.abilityMods = [{ ability: f.ability, mode: f.abilityMode === 'set' ? 'set' : 'add', value: Number(f.abilityValue) || 0 }];
    if (f.carried) item.activeWhileCarried = true;
    addCatalogueItemToInventory(item);
    if ((item.abilityMods || item.acBonus || item.saveBonus) && f.carried && typeof afterEquipChange === 'function') afterEquipChange();
}

// Add from the catalogue (or forge) and equip at once.
async function catalogueEquip(kind, id) {
    if (!currentCharacter) return;
    if (!Array.isArray(currentCharacter.inventory)) currentCharacter.inventory = [];
    const before = currentCharacter.inventory.length;
    if (kind === 'weapon') addWeaponFromCatalogue(id);
    else if (kind === 'armour') addArmourFromCatalogue(id);
    else if (kind === 'magic') addMagicFromCatalogue(id);
    else if (kind === 'forge') addForgedItem();
    const inv = currentCharacter.inventory;
    let idx = inv.length > before ? inv.length - 1 : inv.map(i => i.catalogId).lastIndexOf(kind === 'weapon' ? 'weapon_' + id : id);
    if (idx < 0) return;
    const name = inv[idx].name;
    const ok = await equipInventoryItem(idx);
    const msg = document.getElementById('catalogue-msg');
    if (msg) msg.textContent = ok ? `Equipped ${name}.` : `Added ${name} to the backpack (not equipped).`;
}

Object.assign(window, {
    catalogueEquip,
    openCatalogue, closeCatalogue, setCatalogueTab, setCatalogueQuery, setCatalogueGroup, toggleCatalogueRow,
    addGearFromCatalogue, addWeaponFromCatalogue, addArmourFromCatalogue, addMountFromCatalogue, addMagicFromCatalogue,
    openForgeFor, openForgeNamed, forgeSet, forgeToggle, addForgedItem, parseCostGp, fmtCost,
    forgeItemSet, forgeSpell, forgeSpellAdd, forgeSpellRemove,
});
