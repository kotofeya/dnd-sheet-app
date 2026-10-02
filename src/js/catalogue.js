// js/catalogue.js — the item catalogue and the magic forge.
// Equipment from Dark Dungeons (Chapter 8), magic items from the Rules Cyclopedia (Chapter 16);
// the forge builds magic weapons and armour on any base (including Dark Dungeons and Compendium
// weapons) with the Rules Cyclopedia's bonuses, enemy bonuses, talents and powers.

// House-rule items converted from AD&D. Their AC comes from a BECMI armour (Dark Dungeons Table 8-2).
const HOUSE_MAGIC_ITEMS = [{
    id: 'misc_bracers_of_defense', name: 'Bracers of Defense', group: 'misc', usableBy: 'Any', slot: 'hands', weight: 10, houseRule: true,
    source: 'AD&D conversion (house rule)',
    variants: (typeof DD_ARMOUR !== 'undefined' ? DD_ARMOUR : []).filter(a => !a.isShield && a.baseAC >= 3)
        .sort((a, b) => b.baseAC - a.baseAC)
        .map(a => ({ suffix: `(AC ${a.baseAC}, as ${a.name.toLowerCase()})`, armourAC: a.baseAC })),
    desc: 'AD&D conversion (house rule). A pair of wrist bands that protect the wearer as well as a suit of armour (from leather, AC 7, to plate mail, AC 3) without its weight, bulk or noise. They work only while the wearer wears no armour and carries no shield; with either they do nothing. They are not armour: any class may wear them, magic-users cast spells normally, and Dexterity, rings of protection and other protective items still apply on top. The DM may create them with the Rules Cyclopedia rules for new magic items.',
}];
if (typeof RC_MAGIC_ITEMS !== 'undefined') HOUSE_MAGIC_ITEMS.forEach(h => { if (!RC_MAGIC_ITEMS.some(x => x.id === h.id)) RC_MAGIC_ITEMS.push(h); });

const MAGIC_GROUPS = { potion: 'Potions', scroll: 'Scrolls', wand: 'Wands', staff: 'Staves', rod: 'Rods', ring: 'Rings', misc: 'Miscellaneous', arms: 'Weapons & armour' };
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
        const allowed = a.isShield ? (typeof getArmourRule === 'function' ? getArmourRule(currentCharacter).shields : true)
            : (typeof isArmourAllowed === 'function' ? isArmourAllowed(currentCharacter, a.baseAC) : true);
        return catRow({
            id: a.id, name: a.name,
            meta: `${a.isShield ? 'AC -1' : `AC ${a.baseAC}`} · ${fmtWeight(a.weight)} · ${fmtCost(a.cost)}`,
            tagHtml: allowed ? '' : '<span class="tag" style="color: var(--danger);">Not for your class</span>',
            desc: `${escapeHtml(a.desc)}<div class="arc-source">${escapeHtml(a.source)}, Table 8-3</div>`,
            actions: `<button type="button" class="btn btn-sm" onclick="addArmourFromCatalogue('${a.id}')">Add</button><button type="button" class="btn btn-sm" onclick="catalogueEquip('armour', '${a.id}')">Equip</button><button type="button" class="btn btn-sm" onclick="openForgeFor('${a.isShield ? 'shield' : 'armour'}', '${a.id}')">Enchant</button>`,
        });
    }).join('');
}
function armourItem(a) {
    return a.isShield
        ? { catalogId: a.id, name: a.name, category: 'equipment', isShield: true, slot: 'offHand', weight: a.weight, cost: a.cost, desc: a.desc }
        : { catalogId: a.id, name: a.name, category: 'equipment', isArmor: true, baseAC: a.baseAC, slot: 'armor', weight: a.weight, cost: a.cost, desc: a.desc };
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
            const facts = [x.charges ? `Charges ${escapeHtml(x.charges)}` : '', x.duration ? `Duration ${escapeHtml(x.duration)}` : '', x.usableBy ? `Usable by ${escapeHtml(x.usableBy)}` : '', x.slot ? `Worn: ${escapeHtml(x.slot)}` : ''].filter(Boolean).join(' · ');
            return catRow({
                id: x.id, name: x.name, tagHtml: tags.join(''),
                meta: `${fmtWeight(x.weight)}`,
                warn: magicUsableNote(x),
                desc: `${facts ? `<div class="cat-facts">${facts}</div>` : ''}${escapeHtml(x.desc)}<div class="arc-source">${x.houseRule ? escapeHtml(x.source) : `Rules Cyclopedia p. ${x.page || ''}`}</div>`,
                actions: `${variants}<button type="button" class="btn btn-sm" onclick="addMagicFromCatalogue('${x.id}')">Add</button>${(x.slot || ['wand', 'staff', 'rod'].includes(x.group)) ? `<button type="button" class="btn btn-sm" onclick="catalogueEquip('magic', '${x.id}')">Equip</button>` : ''}`,
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
    const ac = v && v.acBonus != null ? v.acBonus : x.acBonus;
    const sv = v && v.saveBonus != null ? v.saveBonus : x.saveBonus;
    if (ac) item.acBonus = Number(ac);
    if (sv) item.saveBonus = Number(sv);
    // Roll the charges it is found with (e.g. "2d10 (optional 3d10)").
    if (x.charges) {
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
    if (field === 'kind') { forgeState = defaultForge(value); }
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
    const f = forgeState;
    const db = window.GlobalWeaponsDatabase || {};
    const r = forgeResult();
    const kinds = [['weapon', 'Weapon'], ['missile', 'Missiles'], ['armour', 'Armour'], ['shield', 'Shield']];
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
});
