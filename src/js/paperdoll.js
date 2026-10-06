// js/paperdoll.js — Модуль куклы экипировки персонажа

const STANDARD_ARMORS = [
    { id: 'suit_armor', name: 'Suit Armor', baseAC: 0, weight: 750, desc: 'Complete plate harness with full enclosed helm.' },
    { id: 'plate_mail', name: 'Plate Mail', baseAC: 3, weight: 500, desc: 'Plate breastplate and greaves with open helmet.' },
    { id: 'banded_mail', name: 'Banded Mail', baseAC: 4, weight: 450, desc: 'Chain mail with horizontal metal strips fastened into it.' },
    { id: 'chain_mail', name: 'Chain Mail', baseAC: 5, weight: 400, desc: 'Interlinked metal rings with mail coif.' },
    { id: 'scale_mail', name: 'Scale Mail', baseAC: 6, weight: 300, desc: 'Leather plates with metal scales or studs sewn on.' },
    { id: 'leather_armor', name: 'Leather Armor', baseAC: 7, weight: 200, desc: 'Cured boiled leather with leather cap.' },
    { id: 'shield', name: 'Shield', acBonus: 1, weight: 100, desc: 'Grants -1 descending AC bonus (reduces AC by 1).' }
];

let activeSelectingSlot = null;
const PAPERDOLL_SLOTS = ['head', 'neck', 'cloak', 'mainHand', 'armor', 'offHand', 'ringLeft', 'belt', 'ringRight', 'hands', 'boots'];
// Slots whose items protect by being worn (rings and cloaks of protection, displacer cloak...).
const WORN_SLOTS = ['ringLeft', 'ringRight', 'cloak', 'neck', 'head', 'belt', 'boots', 'hands'];

// Bonus to every saving throw from worn magic items (ring of protection, etc.).
function getEquippedSaveBonus(character) {
    const pd = character && character.paperdoll;
    if (!pd) return 0;
    const mystic = (character.characterClass || character.class) === 'Mystic';
    const worn = PAPERDOLL_SLOTS.reduce((sum, slot) => sum + (mystic && isProtectiveItem(pd[slot]) ? 0 : (Number(pd[slot]?.saveBonus) || 0)), 0);
    return worn + (mystic ? 0 : carriedActiveItems(character).reduce((s, it) => s + (Number(it.saveBonus) || 0), 0));
}
// Items that work without being worn ("works while carried"), if they are actually with the character.
function carriedActiveItems(character) {
    const away = new Set(['Vault', ...((character && character.holdings) || []).map(h => h.id), ...((character && character.mounts) || []).map(m => m.id)]);
    return ((character && character.inventory) || []).filter(it => it && it.activeWhileCarried && !it.isArmor && !it.isShield && !away.has(it.location));
}
window.getEquippedSaveBonus = getEquippedSaveBonus;

// Bonuses to particular saving throws only (saveBonusBy: { death, wands, paralysis, breath, spells }).
// The Rules Cyclopedia's displacer cloak gives +2 vs. spells, wands/staves/rods and turn to stone.
const SAVE_KEYS = ['death', 'wands', 'paralysis', 'breath', 'spells'];
const KNOWN_SAVE_BONUS_BY = { misc_displacer_cloak: { wands: 2, paralysis: 2, spells: 2 } };
function itemSaveBonusBy(it) {
    if (!it) return null;
    if (it.saveBonusBy && typeof it.saveBonusBy === 'object') return it.saveBonusBy;
    return KNOWN_SAVE_BONUS_BY[it.catalogId] || null;          // items added before this existed
}
function getEquippedSaveBonuses(character) {
    const out = { death: 0, wands: 0, paralysis: 0, breath: 0, spells: 0 };
    const all = getEquippedSaveBonus(character);
    SAVE_KEYS.forEach(k => { out[k] += all; });
    const pd = (character && character.paperdoll) || {};
    const mystic = (character && (character.characterClass || character.class)) === 'Mystic';
    const items = [...PAPERDOLL_SLOTS.map(s => pd[s]), ...(mystic ? [] : carriedActiveItems(character))].filter(Boolean);
    items.forEach(it => {
        if (mystic && isProtectiveItem(it)) return;
        const by = itemSaveBonusBy(it);
        if (by) SAVE_KEYS.forEach(k => { out[k] += Number(by[k]) || 0; });
    });
    return out;
}
window.getEquippedSaveBonuses = getEquippedSaveBonuses;
function saveBonusByTag(it) {
    const by = itemSaveBonusBy(it);
    if (!by) return '';
    const names = { death: 'death', wands: 'wands', paralysis: 'stone', breath: 'breath', spells: 'spells' };
    const groups = {};
    SAVE_KEYS.forEach(k => { const v = Number(by[k]) || 0; if (v) (groups[v] = groups[v] || []).push(names[k]); });
    return Object.entries(groups).map(([v, ks]) => `<span class="tag" style="color: var(--info);" title="Saving throw bonus">Saves +${v} vs ${ks.join(', ')}</span>`).join('');
}
window.saveBonusByTag = saveBonusByTag;

// Does this inventory item belong in this paperdoll slot?
function itemFitsSlot(item, slot) {
    if (!item) return false;
    if (slot === 'armor') return Boolean(item.isArmor);
    if (slot === 'offHand') return Boolean(item.isShield) || (item.category === 'weapon' && item.weaponId && window.GlobalWeaponsDatabase?.[item.weaponId]?.type === '1h-melee');
    if (slot === 'mainHand') return item.category === 'weapon' || ['wand', 'staff', 'rod'].includes(item.group);
    if (slot === 'ringLeft' || slot === 'ringRight') return item.slot === 'ring';
    return item.slot === slot;
}

// Which paperdoll slots an item can go in (empty list = not wearable/holdable).
function slotsForItem(item) {
    if (!item || item.isValuable || Number(item.valueGP) > 0) return [];
    if (item.isArmor) return ['armor'];
    if (item.isShield) return ['offHand'];
    if (item.category === 'ammo') return [];
    if (item.category === 'weapon') {
        const t = window.GlobalWeaponsDatabase?.[item.weaponId]?.type;
        return t === '1h-melee' ? ['mainHand', 'offHand'] : ['mainHand'];
    }
    if (['wand', 'staff', 'rod'].includes(item.group) || item.techWeapon) return ['mainHand'];
    if (item.slot === 'ring') return ['ringLeft', 'ringRight'];
    if (['neck', 'cloak', 'head', 'belt', 'boots', 'hands'].includes(item.slot)) return [item.slot];
    return [];
}
// Suits any class may wear (Blackmoor battle armour, pressure suits): not barred by the class's armour rules.
// Mystics still never wear armour.
function anyClassArmourOk(item, character) {
    const cls = character?.characterClass || character?.class || '';
    return Boolean(item && item.isArmor && item.anyClass) && cls !== 'Mystic';
}
const SLOT_LABELS = { head: 'head', neck: 'neck', cloak: 'cloak', mainHand: 'main hand', armor: 'armour', offHand: 'off hand', ringLeft: 'left-hand ring', ringRight: 'right-hand ring', belt: 'belt', hands: 'hands', boots: 'feet' };

// Equip an inventory item straight from the inventory list (or the catalogue).
async function equipInventoryItem(index, wantSlot = null) {
    if (!currentCharacter || !Array.isArray(currentCharacter.inventory)) return false;
    const item = currentCharacter.inventory[index];
    const slots = slotsForItem(item);
    if (!slots.length) return false;
    if (!currentCharacter.paperdoll) syncPaperdollUI();
    const pd = currentCharacter.paperdoll;
    const allowed = slots.filter(s => checkSlotRestriction(s, currentCharacter).allowed || (s === 'armor' && anyClassArmourOk(item, currentCharacter)));
    if (!allowed.length) { await sheetAlert(checkSlotRestriction(slots[0], currentCharacter).reason); return false; }
    const itemBlock = itemRestriction(item, allowed[0], currentCharacter);
    if (itemBlock) { await sheetAlert(itemBlock); return false; }
    if (item.isArmor && !anyClassArmourOk(item, currentCharacter) && !isArmourAllowed(currentCharacter, item.baseAC !== undefined ? Number(item.baseAC) : 7)) {
        await sheetAlert(`${currentCharacter.characterClass} cannot wear that armour (${ClassesDatabase[currentCharacter.characterClass]?.allowedArmor || 'restricted'}).`);
        return false;
    }
    let slot = wantSlot && allowed.includes(wantSlot) ? wantSlot : (allowed.find(s => !pd[s]) || allowed[0]);
    const current = pd[slot];
    if (current) {
        if (current.isCursed) { await sheetAlert(`${current.name} is cursed and cannot be removed from your ${SLOT_LABELS[slot]} without remove curse.`); return false; }
        if (!(await sheetConfirm(`Swap ${current.name} for ${item.name}? ${current.name} goes back to the backpack.`, 'Swap'))) return false;
        const { id: _id, uid: _uid, ...back } = current;
        currentCharacter.inventory.push({ ...back, location: 'Backpack', qty: 1 });
        pd[slot] = null;
    }
    activeSelectingSlot = slot;
    equipFromInventory(index);
    return true;
}
window.slotsForItem = slotsForItem;
window.equipInventoryItem = equipInventoryItem;

// Catalogue items that fit a slot, for the equip window.
function catalogueChoicesForSlot(slot) {
    const out = [];
    const db = window.GlobalWeaponsDatabase || {};
    if (slot === 'mainHand' || slot === 'offHand') {
        Object.values(db).filter(w => !/^(oil|holy|rock|unarmed)/.test(w.id) && (slot === 'mainHand' || w.type === '1h-melee'))
            .sort((a, b) => a.name.localeCompare(b.name)).forEach(w => out.push({ kind: 'weapon', id: w.id, name: w.name, note: 'Weapon',
                unusable: typeof canCharacterUseWeapon === 'function' && currentCharacter && !canCharacterUseWeapon(w, currentCharacter) ? pdNotUsableText() : '' }));
    }
    if (typeof RC_MAGIC_ITEMS !== 'undefined') {
        RC_MAGIC_ITEMS.forEach(x => {
            const fits = (slot === 'mainHand' && (['wand', 'staff', 'rod'].includes(x.group) || x.techWeapon))
                || ((slot === 'ringLeft' || slot === 'ringRight') && x.slot === 'ring')
                || (x.slot && x.slot === slot);
            if (!fits) return;
            const note = x.houseRule ? 'House rule' : x.group === 'tech' ? 'Blackmoor (DA3)' : 'Rules Cyclopedia';
            // Items with variants (rings of protection +1..+4, bracers AC 7..3) are listed one by one.
            const barred = itemRestriction(x, slot, currentCharacter) ? (currentCharacter?.characterClass === 'Mystic' ? 'Not for mystics' : 'Does not fit') : '';
            const usableNote = typeof magicUsableNote === 'function' ? magicUsableNote(x) : '';
            const unusable = /^usable by/i.test(usableNote) ? pdNotUsableText() : '';
            if (Array.isArray(x.variants) && x.variants.length) x.variants.forEach((v, i) => out.push({ kind: 'magic', id: `${x.id}~${i}`, name: `${x.name} ${v.suffix}`, note, cursed: x.cursed, barred, unusable, anyClass: x.anyClass }));
            else out.push({ kind: 'magic', id: x.id, name: x.name, note, cursed: x.cursed, barred, unusable, anyClass: x.anyClass });
        });
    }
    return out;
}
// "Not usable by Magic-User" for catalogue items the character's class cannot use.
function pdNotUsableText() {
    const cls = (currentCharacter && (currentCharacter.characterClass || currentCharacter.class)) || 'your class';
    return `Not usable by ${cls}`;
}
let paperdollModalAnyClassOnly = false;
function renderSlotCatalogue() {
    const list = document.getElementById('paperdoll-catalogue-list');
    if (!list || !activeSelectingSlot) return;
    const q = (document.getElementById('paperdoll-catalogue-search')?.value || '').trim().toLowerCase();
    const items = catalogueChoicesForSlot(activeSelectingSlot).filter(c => (!q || c.name.toLowerCase().includes(q)) && (!paperdollModalAnyClassOnly || c.anyClass));
    list.innerHTML = items.length ? items.map(c => `
        <button type="button" class="pd-cat-item" ${c.barred ? `disabled title="${escapeHtml(c.barred)}" style="opacity: .5; cursor: not-allowed;"` : `onclick="equipFromCatalogue('${c.kind}', '${c.id}')"`}>
            <span>${escapeHtml(c.name)}${c.cursed ? ' <span class="tag" style="color: var(--danger);">Cursed</span>' : ''}${c.barred ? ` <span class="tag" style="color: var(--danger);">${escapeHtml(c.barred)}</span>` : ''}${!c.barred && c.unusable ? ` <span class="tag pd-unusable" style="color: var(--warn-strong);" title="Your class cannot normally use this">${escapeHtml(c.unusable)}</span>` : ''}</span>
            <span class="eyebrow">${escapeHtml(c.note)}</span>
        </button>`).join('') : '<div class="ledger-note">Nothing in the catalogue fits this slot.</div>';
}
// Add a catalogue item to the inventory, then put it straight into the slot being chosen.
function equipFromCatalogue(kind, id) {
    if (!currentCharacter || !activeSelectingSlot) return;
    const slot = activeSelectingSlot;
    if (!Array.isArray(currentCharacter.inventory)) currentCharacter.inventory = [];
    const before = currentCharacter.inventory.length;
    const quiet = { quiet: true };
    let got;
    if (kind === 'weapon') got = addWeaponFromCatalogue(id, quiet);
    else if (kind === 'magic') { const [mid, vi] = String(id).split('~'); got = addMagicFromCatalogue(mid, vi === undefined ? null : vi, quiet); id = mid; }
    else if (kind === 'armour') got = addArmourFromCatalogue(id, quiet);
    const inv = currentCharacter.inventory;
    let idx = typeof got === 'number' && got >= 0 && inv[got] ? got : (inv.length > before ? inv.length - 1 : -1);
    if (idx < 0) idx = inv.map(i => i.catalogId).lastIndexOf(kind === 'weapon' ? 'weapon_' + id : id);
    if (idx < 0) return;
    activeSelectingSlot = slot;
    equipFromInventory(idx);
}
window.renderSlotCatalogue = renderSlotCatalogue;
window.equipFromCatalogue = equipFromCatalogue;

// ---------------------------------------------------------------------------
// Items that change ability scores ("Strength becomes 18", "+1 Dexterity").
// They count while worn on the paperdoll, or while carried if the item says so.
// The typed score stays the character's own; the modifier uses the changed score.
// ---------------------------------------------------------------------------
const ABILITY_PREFIX = { strength: 'str', intelligence: 'int', wisdom: 'wis', dexterity: 'dex', constitution: 'con', charisma: 'cha' };
// Catalogue items whose effect on a score the Rules Cyclopedia states outright.
const CATALOGUE_ABILITY_MODS = {
    misc_gauntlets_of_ogre_power: [{ ability: 'strength', mode: 'set', value: 18 }],
    ring_weakness: [{ ability: 'strength', mode: 'set', value: 3 }],            // cursed (RC p. 238)
};
function itemAbilityMods(item) {
    if (!item) return [];
    const list = Array.isArray(item.abilityMods) ? item.abilityMods : (CATALOGUE_ABILITY_MODS[item.catalogId] || []);
    return list.filter(m => m && ABILITY_KEYS.includes(m.ability) && Number.isFinite(Number(m.value)))
        .map(m => ({ ability: m.ability, mode: m.mode === 'set' ? 'set' : 'add', value: Number(m.value) }));
}
function abilityEffectsFor(character, key) {
    const out = [];
    const push = (item, how) => itemAbilityMods(item).filter(m => m.ability === key).forEach(m => out.push({ ...m, name: item.name || 'Item', how }));
    const pd = character?.paperdoll || {};
    PAPERDOLL_SLOTS.forEach(slot => { if (pd[slot]) push(pd[slot], 'worn'); });
    carriedActiveItems(character).forEach(it => push(it, 'carried'));
    return out;
}
// "Becomes N" effects take the highest such value; "changes by" effects are then added.
function getEffectiveScore(character, key) {
    const base = Number(character?.abilities?.[key]?.score) || 10;
    const fx = abilityEffectsFor(character, key);
    const sets = fx.filter(f => f.mode === 'set').map(f => f.value);
    const score = (sets.length ? Math.max(...sets) : base) + fx.filter(f => f.mode === 'add').reduce((a, f) => a + f.value, 0);
    return Math.max(1, score);
}
function applyItemAbilityEffects(character = currentCharacter) {
    if (!character || !character.abilities) return;
    ABILITY_KEYS.forEach(key => {
        const a = character.abilities[key];
        if (!a) return;
        const base = Number(a.score) || 10;
        const eff = getEffectiveScore(character, key);
        if (key === 'constitution' && typeof applyConDrain === 'function') applyConDrain(character);   // uses the changed score
        else {
            a.modifier = calculateModifier(eff);
            const modEl = document.getElementById(`${ABILITY_PREFIX[key]}-mod`);
            if (modEl && character === currentCharacter) modEl.value = a.modifier;
        }
        if (character !== currentCharacter) return;
        const input = document.getElementById(`${ABILITY_PREFIX[key]}-score`);
        if (!input) return;
        let note = document.getElementById(`${ABILITY_PREFIX[key]}-item-note`);
        if (!note) {
            note = document.createElement('span');
            note.id = `${ABILITY_PREFIX[key]}-item-note`;
            note.className = 'ability-item-note';
            input.parentElement.insertBefore(note, input.nextSibling);
        }
        const fx = abilityEffectsFor(character, key);
        if (fx.length && eff !== base) {
            note.style.display = '';
            note.textContent = `→ ${eff}`;
            note.title = `Your own score ${base}; with items ${eff}:\n` + fx.map(f => `${f.name} (${f.how}): ${f.mode === 'set' ? 'becomes ' + f.value : (f.value > 0 ? '+' : '') + f.value}`).join('\n');
        } else { note.style.display = 'none'; note.textContent = ''; note.title = ''; }
    });
    if (character === currentCharacter && typeof refreshOrnaments === 'function') { try { refreshOrnaments(); } catch (e) { /* ornaments are cosmetic */ } }
}
Object.assign(window, { itemAbilityMods, getEffectiveScore, applyItemAbilityEffects, abilityEffectsFor });

// Equipment changed: saves, AC and the paperdoll all follow.
function afterEquipChange() {
    try { applyItemAbilityEffects(); } catch (e) { console.error(e); }
    if (typeof updateClassStats === 'function') { try { updateClassStats(); } catch (e) { console.error(e); syncPaperdollUI(); } }
    else syncPaperdollUI();
}

// Armour and shield rules come from the class data (armour: any / none / leather /
// chainOrLighter, allowedShields), so new classes need no code changes here.
function getArmourRule(character) {
    const cls = character?.characterClass || character?.class || 'Fighter';
    const data = window.ClassesDatabase?.[cls] || {};
    return { cls, armour: data.armour || 'any', shields: data.allowedShields !== false };
}

function isArmourAllowed(character, baseAC) {
    const { armour } = getArmourRule(character);
    if (armour === 'none') return false;
    if (armour === 'leather') return Number(baseAC) >= 7;
    if (armour === 'chainOrLighter') return Number(baseAC) >= 5;
    return true;
}

function checkSlotRestriction(slot, character) {
    if (!character) return { allowed: true };
    const { cls, armour, shields } = getArmourRule(character);

    // Mystics: no armour (the slot is closed). Shields and protective devices are refused item by
    // item (itemRestriction), so a mystic may still wear an ordinary ring, cloak, hat or amulet.
    if (slot === 'armor' && (armour === 'none' || cls === 'Mystic')) {
        return { allowed: false, reason: `${cls}s may not wear armour.` };
    }
    if (slot === 'offHand' && !shields && cls !== 'Mystic') {
        return { allowed: false, reason: `${cls}s may not use shields.` };
    }
    return { allowed: true };
}

// 1. Расчет нисходящего AC с учетом магии брони, щита и защитных колец/плащей
// Rules Cyclopedia: "Mystics can never wear armor of any type, nor can they ever use protective
// magical devices (such as rings, cloaks, etc.)". DD: no "armour class boosting items such as rings
// of protection". So a mystic refuses shields and anything that improves AC or saving throws.
function isProtectiveItem(it) {
    if (!it) return false;
    if (it.isShield === true || it.isArmor) return true;
    if (Number(it.acBonus) || Number(it.saveBonus) || it.saveBonusBy || (it.armourAC != null && it.armourAC !== '')) return true;
    if (Array.isArray(it.variants) && it.variants.some(v => Number(v.acBonus) || Number(v.saveBonus) || (v.armourAC != null && v.armourAC !== ''))) return true;
    return /\b(protection|displacement|defen[cs]e)\b/i.test(String(it.name || '')) && !/\bscroll\b/i.test(String(it.name || ''));
}
function itemRestriction(item, slot, character) {
    const cls = character?.characterClass || character?.class || '';
    if (!item) return '';
    // Centaur barding (PC1 Table 19) fits only a centaur, and a centaur's body armour must be barding.
    if (item.centaurOnly && cls !== 'Centaur') return `${item.name || 'This barding'} is made for a centaur.`;
    if (cls === 'Centaur' && slot === 'armor' && item.isArmor && !item.centaurOnly && !item.anyClass)
        return `A centaur needs barding made for its body (PC1): ${item.name || 'this armour'} does not fit. Look for Centaur Barding in the catalogue.`;
    // Pegataur barding (PC2 p. 39) likewise.
    if (item.pegataurOnly && cls !== 'Pegataur') return `${item.name || 'This barding'} is made for a pegataur.`;
    if (cls === 'Pegataur' && slot === 'armor' && item.isArmor && !item.pegataurOnly && !item.anyClass)
        return `A pegataur needs barding made for its horse body (PC2): ${item.name || 'this armour'} does not fit. Look for Pegataur Barding in the catalogue.`;
    if (cls !== 'Mystic') return '';
    if (slot === 'offHand' ? isShieldItem(item) : isProtectiveItem(item)) {
        return `Mystics never use shields or protective devices (rings, cloaks, bracers of protection...): ${item.name || 'this item'} is not allowed.`;
    }
    return '';
}

// Natural (unarmoured) AC: mystics by level (DD Table 4-8); creature heroes such as the
// centaur by stage (PC1: AC 8 while young, AC 7 after). null = ordinary AC 9.
function getNaturalArmourClass(character) {
    const info = window.ClassesDatabase?.[character.characterClass];
    if (!info) return null;
    const lvl = window.clampInt(character.level, 1, 36, 1);
    if (info.mysticTable) return info.mysticTable.armourClass[lvl] ?? 9;
    const stage = typeof window.getCreatureStage === 'function' ? window.getCreatureStage(character) : null;
    if (stage && stage.armourClass !== undefined) return stage.armourClass;
    if (Array.isArray(info.naturalArmourByLevel) && info.naturalArmourByLevel[lvl] !== undefined) return info.naturalArmourByLevel[lvl];
    return info.naturalArmourClass ?? null;
}

function calculateEquippedArmorAC(character) {
    if (!character) return 9;
    const natural = getNaturalArmourClass(character);
    if (!character.paperdoll) return natural ?? 9;
    const pd = character.paperdoll;
    // Unarmoured AC is 9 unless the class has a natural AC.
    let baseAC = natural ?? 9;

    // Доспех: базовый AC минус магический бонус (в BECMI +1 к доспеху улучшает AC, т.е. вычитает 1)
    if (pd.armor) {
        const armorBase = pd.armor.baseAC !== undefined ? Number(pd.armor.baseAC) : 7;
        const armorMagic = Number(pd.armor.magicBonus) || 0;
        // With natural armour, worn armour only counts if it is better (PC1/PC2).
        baseAC = natural !== null ? Math.min(natural, armorBase - armorMagic) : armorBase - armorMagic;
    }

    // Bracers of defense (house rule): armour-equivalent AC, only with no armour and no shield.
    const bracers = activeBracers(character);
    if (bracers) baseAC = Math.min(baseAC, Number(bracers.armourAC));

    // Щит: дает базовый -1 AC, плюс дополнительный бонус зачарования
    if (pd.offHand && pd.offHand.isShield && (character.characterClass || character.class) !== 'Mystic') {
        const shieldBonus = 1 + (Number(pd.offHand.magicBonus) || 0);
        baseAC -= shieldBonus;
    }

    // Защитные кольца и плащи (Ring of Protection / Cloak of Protection)
    let protectionBonus = 0;
    const mystic = (character.characterClass || character.class) === 'Mystic';
    WORN_SLOTS.forEach(slot => {
        const it = pd[slot];
        if (mystic && it && isProtectiveItem(it)) return;
        if (it && it.acBonus) {
            protectionBonus += Number(it.acBonus) || 0;
        } else if (it && it.magicBonus && !it.catalogId && (slot.includes('ring') || slot === 'cloak')) {
            // Older hand-entered items: a "+N" ring or cloak counted as protection.
            protectionBonus += Number(it.magicBonus) || 0;
        }
    });
    if (!mystic) carriedActiveItems(character).forEach(it => { protectionBonus += Number(it.acBonus) || 0; });
    baseAC -= protectionBonus;

    return baseAC;
}

// Worn bracers of defense, if they are working (no armour worn, no shield carried).
function wornBracers(character) {
    const pd = character && character.paperdoll;
    if (!pd) return null;
    for (const slot of WORN_SLOTS) { const it = pd[slot]; if (it && it.armourAC != null && it.armourAC !== '') return it; }
    return null;
}
function activeBracers(character) {
    const it = wornBracers(character);
    const pd = character && character.paperdoll;
    if (!it || pd.armor || isShieldItem(pd.offHand)) return null;
    return it;
}

// Only real shields improve AC from the off hand (a torch or dagger does not).
function isShieldItem(item) {
    if (!item) return false;
    if (item.isShield === true || item.acBonus !== undefined) return true;
    return /\bshield\b/i.test(String(item.name || ''));
}

// One-time upgrade of equipment saved by earlier versions:
//  - armour used to be stored with its enchantment already subtracted from baseAC,
//    which made the bonus count twice; restore the raw AC;
//  - anything held in the off hand used to count as a shield.
// Catalogue items saved with effects they should not have (fixed in the catalogue later):
// an ointment of blessing only helps for 1 turn after use; a ring of spell turning works
// 2d6 times a day (not a store of charges); a ring of wishes holds 1-4 wishes, not 1-10.
function fixCatalogueItemData(character) {
    const all = [...((character && character.inventory) || []), ...Object.values((character && character.paperdoll) || {})].filter(Boolean);
    all.forEach(it => {
        if (it.catalogId === 'misc_ointment_blessing') { delete it.acBonus; delete it.saveBonus; }
        if (it.catalogId === 'ring_spell_turning' && it.chargesRule) { delete it.charges; delete it.chargesRule; }
        if (it.catalogId === 'ring_wishes' && Number(it.charges) > 4) it.charges = 4;
    });
}
window.fixCatalogueItemData = fixCatalogueItemData;

function migrateLegacyEquipment(character) {
    try { fixCatalogueItemData(character); } catch (e) { console.error(e); }
    if (!character || character.equipmentVersion >= 2) return;
    const pd = character.paperdoll;
    if (pd && typeof pd === 'object') {
        const armor = pd.armor;
        if (armor && !armor.isArmor && Number(armor.magicBonus) && armor.baseAC !== undefined) {
            armor.baseAC = Number(armor.baseAC) + Number(armor.magicBonus);
        }
        if (pd.offHand && pd.offHand.isShield && !isShieldItem({ ...pd.offHand, isShield: false })) {
            pd.offHand.isShield = false;
        }
    }
    character.equipmentVersion = 2;
}
window.migrateLegacyEquipment = migrateLegacyEquipment;

// 2. Снятие предмета с защитой от проклятия
async function unequipSlot(slotKey) {
    if (!currentCharacter || !currentCharacter.paperdoll) return;
    const item = currentCharacter.paperdoll[slotKey];
    if (!item) return;

    // Проверка проклятия (Rules Cyclopedia: нельзя снять без Remove Curse)
    if (item.isCursed) {
        const override = await sheetConfirm(
            `CURSED ITEM COMPULSION!\n${item.name} is cursed and magically binds to you. You cannot voluntarily remove or discard it.\n\nCast "Remove Curse" to break the attunement and unequip?`
        , 'Remove curse & unequip');
        if (!override) return;
    }

    // Возврат в инвентарь
    if (!Array.isArray(currentCharacter.inventory)) currentCharacter.inventory = [];
    const { id: _id, uid: _uid, ...back } = item;
    currentCharacter.inventory.push({ ...back, location: 'Backpack', qty: 1 });
    currentCharacter.paperdoll[slotKey] = null;

    afterEquipChange();
    if (typeof syncInventoryUI === 'function') syncInventoryUI();
    if (typeof debouncedSave === 'function') debouncedSave();
}

// 3. Расход зарядов жезлов / посохов в кукле
function spendItemCharge(slotKey) {
    if (!currentCharacter || !currentCharacter.paperdoll?.[slotKey]) return;
    const item = currentCharacter.paperdoll[slotKey];
    if (item.charges === undefined || item.charges === null) return;

    if (item.charges <= 1) {
        item.charges = 0;
        item.magicBonus = 0;
        sheetAlert(`${item.name} used its last charge: it is now an ordinary, non-magical item.`);
    } else {
        item.charges -= 1;
    }

    syncPaperdollUI();
    if (typeof debouncedSave === 'function') debouncedSave();
}

// 4. Отрисовка слотов куклы с отображением бонусов и зарядов
function syncPaperdollUI() {
    if (!currentCharacter) return;
    if (!currentCharacter.paperdoll) {
        currentCharacter.paperdoll = {
            head: null, neck: null, cloak: null, mainHand: null,
            armor: null, offHand: null, ringLeft: null, belt: null,
            ringRight: null, hands: null, boots: null
        };
    }
    if (!('hands' in currentCharacter.paperdoll)) currentCharacter.paperdoll.hands = null;

    function renderPaperdollEffectsList() {
    const list = document.getElementById('paperdoll-effects-list');
    const countBadge = document.getElementById('active-magic-count');
    if (!list || !currentCharacter) return;

    list.innerHTML = '';
    const pd = currentCharacter.paperdoll || {};
    const activeItems = [];

    Object.entries(pd).forEach(([slot, item]) => {
        if (item && (Number(item.magicBonus) || item.isCursed || (item.charges !== undefined && item.charges !== null) || item.desc || item.concentration || item.acBonus || item.saveBonus || item.talents || item.enemyBonus)) {
            activeItems.push({ slot, item });
        }
    });

    if (countBadge) countBadge.innerText = `${activeItems.length} active`;

    if (activeItems.length === 0) {
        list.innerHTML = '<div style="color: var(--text-muted); font-size: 0.8rem; padding: 8px; text-align: center; border: 1px dashed color-mix(in srgb, var(--text-main) 5%, transparent); border-radius: 2px;">No active magical items equipped. Equip enchanted rings, cloaks, weapons, or armor to see effects.</div>';
        return;
    }

    activeItems.forEach(({ slot, item }) => {
        const row = document.createElement('div');
        row.style.cssText = 'border: 1px solid var(--border-color); border-radius: 2px; padding: 8px 10px; background: var(--inset); display: flex; flex-direction: column; gap: 4px;';
        
        const bonusBadge = item.magicBonus && item.magicBonus !== 0
            ? `<span style="font-size: 0.65rem; color: ${item.magicBonus > 0 ? 'var(--info)' : 'var(--danger)'}; font-weight: bold; border: 1px solid currentColor; padding: 0 4px; border-radius: 2px;">${item.magicBonus > 0 ? '+' : ''}${item.magicBonus}</span>`
            : '';

        const cursedBadge = item.isCursed
            ? `<span style="font-size: 0.65rem; color: var(--danger); font-weight: bold; background: color-mix(in srgb, var(--danger) 15%, transparent); border: 1px solid var(--danger); padding: 0 4px; border-radius: 2px; display: inline-flex; align-items: center; gap: 3px;">${getIcon('skull', 13)} Cursed</span>`
            : '';

        const concBadge = item.concentration
            ? `<span style="font-size: 0.65rem; color: var(--arcane); font-weight: bold; border: 1px solid var(--arcane); padding: 0 4px; border-radius: 2px; display: inline-flex; align-items: center; gap: 3px;" title="Requires concentration: cannot move or cast spells while using it">${getIcon('brain', 13)} Requires concentration</span>`
            : '';

        const chargeBlock = item.charges !== undefined && item.charges !== null
            ? `<div style="display: flex; align-items: center; gap: 4px;">
                 <span style="font-size: 0.75rem; color: var(--accent-gold); font-weight: bold; display: inline-flex; align-items: center; gap: 3px;">${getIcon('zap', 13)} ${item.charges} charges</span>
                 <button type="button" class="btn btn-sm" onclick="spendItemCharge('${slot}')" title="Spend one charge of ${escapeHtml(item.name)}" ${Number(item.charges) <= 0 ? 'disabled' : ''}>Use charge</button>
               </div>`
            : '';

        row.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 6px; overflow: hidden;">
                    <span style="font-size: 0.65rem; color: var(--text-muted); font-family: var(--font-headings); letter-spacing: 0.1em; text-transform: uppercase; white-space: nowrap;">[${escapeHtml(SLOT_LABELS[slot] || slot)}]</span>
                    <strong style="color: var(--accent-gold); font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(item.name)}</strong>
                    ${bonusBadge}
                    ${cursedBadge}
                    ${concBadge}
                    ${item.enemyBonus ? `<span class="tag" style="color: var(--info);">+${Number(item.enemyBonus.bonus)} vs ${escapeHtml(item.enemyBonus.name)}</span>` : ''}
                    ${item.acBonus && !item.isShield ? `<span class="tag" style="color: var(--info);">AC -${Number(item.acBonus)}</span>` : ''}
                    ${item.saveBonus ? `<span class="tag" style="color: var(--info);">Saves +${Number(item.saveBonus)}</span>` : ''}${saveBonusByTag(item)}
                    ${item.armourAC != null ? (activeBracers(currentCharacter) === item ? `<span class="tag" style="color: var(--info);">AC ${Number(item.armourAC)}</span>` : `<span class="tag" style="color: var(--warn);" title="Bracers work only with no armour and no shield">AC ${Number(item.armourAC)}: inactive (armour or shield)</span>`) : ''}
                </div>
                ${chargeBlock}
            </div>
            ${item.desc ? (() => {
                // Long rules text is folded to a few lines with a "more" button (no scroll box inside a scroll box).
                const long = String(item.desc).length > 260;
                const open = pdOpenEffects.has(slot);
                return `<div id="pd-eff-${slot}" class="pd-effect-desc${long && !open ? ' clamped' : ''}">${escapeHtml(item.desc)}</div>`
                    + (long ? `<button type="button" class="pd-more-btn" onclick="togglePdEffectText('${slot}')" aria-expanded="${open}" aria-controls="pd-eff-${slot}">${open ? 'Less' : 'More'}</button>` : '');
            })() : ''}
        `;
        list.appendChild(row);
    });
}

    const cls = currentCharacter.characterClass || currentCharacter.class || 'Fighter';
    const warnBadge = document.getElementById('paperdoll-class-warning');
    if (warnBadge) {
        if (cls === 'Mystic') {
            warnBadge.innerText = 'Mystic: No Armour, Shields or Protective Items';
            warnBadge.style.display = 'inline-block';
        } else if (cls === 'Magic-User') {
            warnBadge.innerText = 'Magic-User: No Armour or Shields';
            warnBadge.style.display = 'inline-block';
        } else if (cls === 'Thief') {
            warnBadge.innerText = 'Thief: Leather Armor Only (No Shields)';
            warnBadge.style.display = 'inline-block';
        } else {
            warnBadge.style.display = 'none';
        }
    }

    const slots = PAPERDOLL_SLOTS;

    slots.forEach(slotKey => {
        const el = document.getElementById(`slot-${slotKey}`);
        if (!el) return;
        const item = currentCharacter.paperdoll[slotKey];
        const contentEl = el.querySelector('.slot-content');
        let restriction = checkSlotRestriction(slotKey, currentCharacter);
        if (!restriction.allowed && slotKey === 'armor' && anyClassArmourOk(item, currentCharacter)) restriction = { allowed: true };

        el.classList.remove('equipped', 'restricted', 'limited');
        const cls = currentCharacter.characterClass || currentCharacter.class || '';

        if (!restriction.allowed && slotKey === 'armor' && !item && cls !== 'Mystic') {
            // No ordinary armour for this class, but suits any class may wear still fit.
            el.classList.add('limited');
            if (contentEl) { contentEl.innerText = 'Suits only'; contentEl.removeAttribute('title'); }
            el.title = `${restriction.reason} Suits any class may wear (Blackmoor battle armour, pressure suits) can still go here: click to choose one.`;
            el.style.borderColor = '';
        } else if (!restriction.allowed) {
            el.classList.add('restricted');
            if (contentEl) { contentEl.innerText = 'Prohibited'; contentEl.removeAttribute('title'); }
            el.title = restriction.reason;
            el.style.borderColor = '';
        } else if (item) {
            el.classList.add('equipped');
            
            let displayTitle = item.name;
            // Catalogue and forged items already carry the bonus in their name.
            if (item.magicBonus && item.magicBonus !== 0 && !/[+-]\d/.test(String(item.name))) {
                displayTitle = (item.magicBonus > 0 ? `+${item.magicBonus} ` : `${item.magicBonus} `) + displayTitle;
            }
            const nameHtml = escapeHtml(displayTitle);
            const skullHtml = item.isCursed ? `${getIcon('skull', 12)} ` : '';
            const chargesHtml = (item.charges !== undefined && item.charges !== null) ? ` (${item.charges} ${getIcon('zap', 11)})` : '';
            if (item.isCursed) displayTitle = 'Cursed: ' + displayTitle;
            if (item.charges !== undefined && item.charges !== null) displayTitle += ` (${item.charges} charges)`;

            if (contentEl) { contentEl.innerHTML = skullHtml + nameHtml + chargesHtml; contentEl.title = displayTitle; }
            el.title = `${displayTitle}: click for details, swap or unequip`;
            if (item.isCursed) el.style.borderColor = 'var(--danger)';
            else el.style.borderColor = (Number(item.magicBonus) > 0) ? 'var(--info)' : 'var(--accent-gold)';
        } else {
            if (contentEl) { contentEl.innerText = 'Empty'; contentEl.removeAttribute('title'); }
            el.title = `Empty ${SLOT_LABELS[slotKey] || slotKey} slot: click to equip something`;
            el.style.borderColor = '';
        }
    });

    const autoBaseAC = calculateEquippedArmorAC(currentCharacter);
    const acBaseInput = document.getElementById('ac-base');
    if (acBaseInput) {
        acBaseInput.value = autoBaseAC;
        if (typeof updateCombatVitals === 'function') updateCombatVitals();
    }

    renderPaperdollEffectsList();
}

function handleSlotClick(slotKey) {
    if (!currentCharacter) return;
    const restriction = checkSlotRestriction(slotKey, currentCharacter);
    if (!restriction.allowed) {
        // A suit any class may wear can still go on (or come off) the armour slot.
        const worn = currentCharacter.paperdoll && currentCharacter.paperdoll[slotKey];
        if (slotKey === 'armor' && worn && anyClassArmourOk(worn, currentCharacter)) { openSlotMenu(slotKey); return; }
        if (slotKey === 'armor' && (currentCharacter.characterClass || '') !== 'Mystic') { openPaperdollModal(slotKey, { anyClassOnly: true }); return; }
        sheetAlert(restriction.reason);
        return;
    }

    // A filled slot opens a small menu (Details, Swap…, Unequip) instead of unequipping at once.
    if (currentCharacter.paperdoll && currentCharacter.paperdoll[slotKey]) {
        openSlotMenu(slotKey);
        return;
    }

    openPaperdollModal(slotKey);

}

let pdShowAllItems = false;          // "Show all items" in the equip window (off: only items that fit)
let pdModalOpts = {};
function openPaperdollModal(slotKey, opts = {}) {
    activeSelectingSlot = slotKey;
    pdModalOpts = opts || {};
    pdShowAllItems = false;
    closeSlotMenu();
    const modal = document.getElementById('paperdoll-modal');
    const titleEl = document.getElementById('paperdoll-modal-title');
    const warnEl = document.getElementById('paperdoll-modal-warning');
    const container = document.getElementById('paperdoll-options-container');
    const baseSelect = document.getElementById('custom-armor-base');
    const shieldGroup = document.getElementById('custom-slot-shield-group');
    const shieldBox = document.getElementById('custom-slot-shield');

    if (!modal || !container) return;

    if (warnEl) warnEl.style.display = 'none';
    if (titleEl) titleEl.innerText = `Equip: ${SLOT_LABELS[slotKey] || slotKey}`;
    if (baseSelect) { baseSelect.style.display = (slotKey === 'armor') ? 'block' : 'none'; baseSelect.value = '7'; }
    const isMystic = (currentCharacter.characterClass || currentCharacter.class) === 'Mystic';
    if (shieldGroup) shieldGroup.style.display = (slotKey === 'offHand' && !isMystic) ? 'flex' : 'none';
    if (shieldBox) shieldBox.checked = false;

    // Сброс полей
    safeSetVal('custom-slot-name', '');
    safeSetVal('custom-slot-weight', 0);
    safeSetVal('custom-slot-magic', '0');
    safeSetVal('custom-slot-charges', '');
    safeSetVal('custom-slot-desc', '');
    const cursedBox = document.getElementById('custom-slot-cursed');
    if (cursedBox) cursedBox.checked = false;
    const concBox = document.getElementById('custom-slot-concentration');
    if (concBox) concBox.checked = false;
    const customBox = document.getElementById('pd-custom');
    if (customBox) customBox.open = false;

    container.innerHTML = '';
    const cls = currentCharacter.characterClass || currentCharacter.class || 'Fighter';

    // Swapping: say what is worn now and where it goes.
    const worn = currentCharacter.paperdoll && currentCharacter.paperdoll[slotKey];
    if (worn) {
        const note = document.createElement('div');
        note.className = 'ledger-note pd-worn-note';
        note.textContent = `Now worn: ${worn.name}. Whatever you choose replaces it, and ${worn.name} goes back to the backpack.`;
        container.appendChild(note);
    }

    if (opts.anyClassOnly) {
        const note = document.createElement('div');
        note.className = 'ledger-note';
        note.textContent = `${cls}s may not wear armour, but suits any class may wear (Blackmoor battle armour, pressure suits) can go here.`;
        container.appendChild(note);
    } else if (slotKey === 'armor') {
        STANDARD_ARMORS.filter(a => a.id !== 'shield').forEach(arm => {
            const isAllowed = isArmourAllowed(currentCharacter, arm.baseAC);
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'pd-opt';
            btn.style.cssText = `cursor: ${isAllowed ? 'pointer' : 'not-allowed'}; opacity: ${isAllowed ? '1' : '0.5'};`;
            btn.innerHTML = `
                <div style="display: flex; justify-content: space-between;">
                    <strong style="color: var(--accent-gold);">${arm.name} (AC ${arm.baseAC})</strong>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${arm.weight} cn</span>
                </div>
                <div style="font-size: 0.7rem; color: var(--text-muted);">${isAllowed ? arm.desc : `Not usable by ${escapeHtml(cls)}. ${arm.desc}`}</div>
            `;
            if (isAllowed) btn.onclick = () => equipStandardArmor(arm);
            else btn.disabled = true;
            container.appendChild(btn);
        });
    } else if (slotKey === 'offHand') {
        const shield = STANDARD_ARMORS.find(a => a.id === 'shield');
        const isAllowed = getArmourRule(currentCharacter).shields && cls !== 'Mystic';
        if (shield && isAllowed) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.className = 'pd-opt';
            btn.innerHTML = `
                <div style="display: flex; justify-content: space-between;">
                    <strong style="color: var(--accent-gold);">Shield (-1 AC bonus)</strong>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${shield.weight} cn</span>
                </div>
                <div style="font-size: 0.7rem; color: var(--text-muted);">${shield.desc}</div>
            `;
            btn.onclick = () => equipShieldItem(shield);
            container.appendChild(btn);
        }
    }

    // Your own items first (those that fit; "Show all items" lists the rest too).
    const hasInv = (currentCharacter.inventory || []).some(it => !(it.isValuable || it.valueGP > 0));
    if (hasInv) {
        const sec = document.createElement('div');
        sec.innerHTML = `
            <div class="pd-section-head"><span class="pd-section-title">From your inventory</span>
                <label class="pd-show-all"><input type="checkbox" id="pd-show-all" onchange="setPdShowAll(this.checked)"> Show all items</label></div>
            <div id="pd-inv-list" class="pd-inv-list"></div>`;
        container.appendChild(sec);
    }

    // From the catalogue (searchable).
    const catChoices = catalogueChoicesForSlot(slotKey).filter(c => !opts.anyClassOnly || c.anyClass);
    paperdollModalAnyClassOnly = Boolean(opts.anyClassOnly);
    if (catChoices.length) {
        const sec = document.createElement('div');
        sec.innerHTML = `
            <div class="pd-section-title">From the catalogue</div>
            <input type="search" id="paperdoll-catalogue-search" class="stat-input arc-input" placeholder="Search ${catChoices.length} items" aria-label="Search the catalogue" oninput="renderSlotCatalogue()" style="margin: 4px 0;">
            <div id="paperdoll-catalogue-list" class="pd-cat-list"></div>`;
        container.appendChild(sec);
    } else if (slotKey === 'armor' || slotKey === 'offHand') {
        const sec = document.createElement('div');
        sec.innerHTML = `<button type="button" class="btn btn-sm" onclick="closePaperdollModal(); openCatalogue('forge')">Make magic ${slotKey === 'armor' ? 'armour' : 'shield'} in the Magic forge</button>`;
        container.appendChild(sec);
    }

    modal.style.display = 'flex';
    const card = modal.querySelector('.card');
    if (card) card.scrollTop = 0;
    const form = pdCustomForm();             // only the custom-item fields count as typing (not search or filters)
    if (form) { watchFormEdits(form); resetFormEdits(form); }
    renderSlotInventory();
    if (catChoices.length) renderSlotCatalogue();
}

// The inventory part of the equip window.
function renderSlotInventory() {
    const list = document.getElementById('pd-inv-list');
    const slotKey = activeSelectingSlot;
    if (!list || !slotKey || !currentCharacter) return;
    const invItems = currentCharacter.inventory || [];
    const opts = pdModalOpts || {};
    const order = invItems.map((it, idx) => ({ it, idx, fits: itemFitsSlot(it, slotKey) }))
        .filter(o => !(o.it.isValuable || o.it.valueGP > 0))
        .filter(o => !opts.anyClassOnly || anyClassArmourOk(o.it, currentCharacter))
        .filter(o => pdShowAllItems || o.fits)
        .sort((a, b) => Number(b.fits) - Number(a.fits));
    list.innerHTML = '';
    if (!order.length) {
        list.innerHTML = `<div class="ledger-note">Nothing you own fits the ${escapeHtml(SLOT_LABELS[slotKey] || slotKey)} slot. Tick “Show all items” to choose something else.</div>`;
        return;
    }
    order.forEach(({ it, idx, fits }) => {
        const barred = itemRestriction(it, slotKey, currentCharacter);
        if (barred) fits = false;
        const where = typeof inventoryLocationName === 'function' ? inventoryLocationName(it) : (it.location || 'Backpack');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'pd-opt pd-inv-opt';
        btn.innerHTML = `
            <span style="color: ${fits ? 'var(--accent-gold)' : 'var(--text-main)'}; font-size: 0.85rem;">${escapeHtml(it.name)}${barred ? ' <span class="tag" style="color: var(--danger);">Not for mystics</span>' : ''}</span>
            <span style="font-size: 0.72rem; color: var(--text-muted); white-space: nowrap;">${escapeHtml(where)} · ${it.weight || 0} cn</span>
        `;
        if (barred) { btn.disabled = true; btn.title = barred; btn.style.opacity = '0.5'; btn.style.cursor = 'not-allowed'; }
        else btn.onclick = () => equipFromInventory(idx);
        list.appendChild(btn);
    });
}
function setPdShowAll(on) { pdShowAllItems = Boolean(on); renderSlotInventory(); }

// ---------------------------------------------------------------------------
// The small menu on a filled slot: Details, Swap…, Unequip.
let pdMenuJustClosed = null;
function closeSlotMenu() {
    const m = document.getElementById('pd-slot-menu');
    if (m) m.remove();
}
function openSlotMenu(slotKey) {
    const item = currentCharacter && currentCharacter.paperdoll && currentCharacter.paperdoll[slotKey];
    const slotEl = document.getElementById(`slot-${slotKey}`);
    if (!item || !slotEl) return;
    if (pdMenuJustClosed && pdMenuJustClosed.slot === slotKey && Date.now() - pdMenuJustClosed.t < 400) { pdMenuJustClosed = null; return; }   // second click on the same slot closes it
    closeSlotMenu();
    const m = document.createElement('div');
    m.id = 'pd-slot-menu';
    m.className = 'pd-slot-menu';
    m.dataset.slot = slotKey;
    m.setAttribute('role', 'menu');
    m.setAttribute('aria-label', `${item.name} (${SLOT_LABELS[slotKey] || slotKey})`);
    m.innerHTML = `
        <div class="pd-menu-title" title="${escapeHtml(item.name)}">${item.isCursed ? getIcon('skull', 12) + ' ' : ''}${escapeHtml(item.name)}</div>
        <button type="button" role="menuitem" class="btn btn-sm" onclick="pdMenuDetails('${slotKey}')">Details</button>
        <button type="button" role="menuitem" class="btn btn-sm" onclick="pdMenuSwap('${slotKey}')">Swap…</button>
        <button type="button" role="menuitem" class="btn btn-sm btn-danger" onclick="pdMenuUnequip('${slotKey}')">Unequip</button>`;
    document.body.appendChild(m);
    const r = slotEl.getBoundingClientRect();
    const w = m.offsetWidth, h = m.offsetHeight;
    let left = Math.min(Math.max(8, r.left + r.width / 2 - w / 2), window.innerWidth - w - 8);
    let top = r.bottom + 6;
    if (top + h > window.innerHeight - 8) top = Math.max(8, r.top - h - 6);
    m.style.left = `${left}px`;
    m.style.top = `${top}px`;
    m.querySelector('button')?.focus();
}
function pdItemDetailsText(item, slotKey) {
    const lines = [`${item.name} (${SLOT_LABELS[slotKey] || slotKey})`];
    const facts = [];
    if (Number(item.magicBonus)) facts.push(`${Number(item.magicBonus) > 0 ? '+' : ''}${Number(item.magicBonus)} magic`);
    if (item.isArmor || slotKey === 'armor') facts.push(`AC ${item.baseAC !== undefined ? Number(item.baseAC) : 7}${Number(item.magicBonus) ? ` (${(item.baseAC !== undefined ? Number(item.baseAC) : 7) - Number(item.magicBonus)} with magic)` : ''}`);
    if (item.isShield) facts.push('Shield: AC -1');
    if (item.acBonus && !item.isShield) facts.push(`AC -${Number(item.acBonus)}`);
    if (item.saveBonus) facts.push(`Saves +${Number(item.saveBonus)}`);
    if (item.charges !== undefined && item.charges !== null && item.charges !== '') facts.push(`${item.charges} charges`);
    if (item.isCursed) facts.push('Cursed');
    if (item.concentration) facts.push('Requires concentration');
    if (Number(item.weight)) facts.push(`${Number(item.weight)} cn`);
    if (facts.length) lines.push(facts.join(' · '));
    if (item.desc) lines.push('', item.desc);
    return lines.join('\n');
}
function pdMenuDetails(slotKey) {
    const item = currentCharacter?.paperdoll?.[slotKey];
    closeSlotMenu();
    if (item) sheetAlert(pdItemDetailsText(item, slotKey));
}
async function pdMenuSwap(slotKey) {
    const item = currentCharacter?.paperdoll?.[slotKey];
    closeSlotMenu();
    if (!item) return;
    // A cursed item must come off first (remove curse), then the slot is free to fill.
    if (item.isCursed) {
        await unequipSlot(slotKey);
        if (currentCharacter.paperdoll[slotKey]) return;
    }
    const restricted = !checkSlotRestriction(slotKey, currentCharacter).allowed;
    openPaperdollModal(slotKey, restricted && slotKey === 'armor' ? { anyClassOnly: true } : {});
}
function pdMenuUnequip(slotKey) { closeSlotMenu(); unequipSlot(slotKey); }
// A click anywhere else closes the menu.
document.addEventListener('pointerdown', e => {
    const m = document.getElementById('pd-slot-menu');
    if (!m || m.contains(e.target)) return;
    const slotEl = document.getElementById(`slot-${m.dataset.slot}`);
    if (slotEl && slotEl.contains(e.target)) pdMenuJustClosed = { slot: m.dataset.slot, t: Date.now() };
    closeSlotMenu();
}, true);
window.addEventListener('resize', closeSlotMenu);
document.addEventListener('scroll', closeSlotMenu, true);

// The worn item goes back to the backpack when something else is put in its slot.
function pdStowCurrent(slotKey) {
    const pd = currentCharacter && currentCharacter.paperdoll;
    const cur = pd && pd[slotKey];
    if (!cur) return;
    if (!Array.isArray(currentCharacter.inventory)) currentCharacter.inventory = [];
    const { id: _id, uid: _uid, ...back } = cur;
    currentCharacter.inventory.push({ ...back, location: 'Backpack', qty: 1 });
    pd[slotKey] = null;
}

// Longer effect text folds open and shut.
const pdOpenEffects = new Set();
function togglePdEffectText(slot) {
    const el = document.getElementById(`pd-eff-${slot}`);
    if (!el) return;
    const open = el.classList.contains('clamped');
    el.classList.toggle('clamped', !open);
    if (open) pdOpenEffects.add(slot); else pdOpenEffects.delete(slot);
    const btn = el.nextElementSibling;
    if (btn && btn.classList.contains('pd-more-btn')) { btn.textContent = open ? 'Less' : 'More'; btn.setAttribute('aria-expanded', String(open)); }
}
Object.assign(window, { setPdShowAll, openSlotMenu, closeSlotMenu, pdMenuDetails, pdMenuSwap, pdMenuUnequip, togglePdEffectText, renderSlotInventory });

function equipFromInventory(invIndex) {
    if (!currentCharacter || !activeSelectingSlot) return;
    const item = currentCharacter.inventory[invIndex];
    if (!item) return;
    let block = itemRestriction(item, activeSelectingSlot, currentCharacter);
    const slotNow = activeSelectingSlot;
    if (!block && slotNow === 'armor' && !item.isArmor && item.baseAC === undefined) block = `${item.name} is not armour.`;
    if (!block && slotNow !== 'armor' && item.isArmor) block = `${item.name} is armour: put it in the armour slot.`;
    if (!block && item.isShield && slotNow !== 'offHand') block = `${item.name} is a shield: it goes in the off hand.`;
    if (!block && slotNow === 'armor' && !anyClassArmourOk(item, currentCharacter) && !isArmourAllowed(currentCharacter, item.baseAC !== undefined ? Number(item.baseAC) : 7))
        block = `${currentCharacter.characterClass} cannot wear that armour (${ClassesDatabase[currentCharacter.characterClass]?.allowedArmor || 'restricted'}).`;
    if (!block && slotNow === 'offHand' && item.isShield && !checkSlotRestriction('offHand', currentCharacter).allowed) block = checkSlotRestriction('offHand', currentCharacter).reason;
    if (block) {
        const warn = document.getElementById('paperdoll-modal-warning');
        if (warn) { warn.textContent = block; warn.style.display = 'block'; } else sheetAlert(block);
        return false;
    }

    if (item.qty > 1) {
        item.qty -= 1;
    } else {
        currentCharacter.inventory.splice(invIndex, 1);
    }
    pdStowCurrent(activeSelectingSlot);

    const { qty: _qty, location: _loc, id: _id, uid: _uid, forTrade: _ft, ...rest } = item;
    currentCharacter.paperdoll[activeSelectingSlot] = {
        ...rest,
        name: item.name,
        weight: item.weight || 0,
        magicBonus: item.magicBonus || 0,
        isCursed: item.isCursed || false,
        concentration: item.concentration || false,
        charges: item.charges,
        desc: item.desc || '',
        weaponId: item.weaponId,
        isShield: activeSelectingSlot === 'offHand' && isShieldItem(item),
        // Store the RAW armour AC; the enchantment is applied once in calculateEquippedArmorAC.
        baseAC: activeSelectingSlot === 'armor' ? (item.baseAC !== undefined ? Number(item.baseAC) : 7) : undefined
    };

    closePaperdollModal();
    afterEquipChange();
    if (typeof syncInventoryUI === 'function') syncInventoryUI();
    if (typeof debouncedSave === 'function') debouncedSave();
}

// (renderPaperdollEffectsList is local to syncPaperdollUI; exporting it here threw a ReferenceError at load.)

function closePaperdollModal() {
    const modal = document.getElementById('paperdoll-modal');
    if (modal) modal.style.display = 'none';
    resetFormEdits(pdCustomForm());
    activeSelectingSlot = null;
}
function pdCustomForm() { return document.getElementById('pd-custom') || document.querySelector('#paperdoll-modal .card'); }
// Esc or a click outside: the custom-item form asks before throwing away what was typed.
async function pdCloseModalAsk() {
    if (!(await okToDiscard(pdCustomForm()))) return;
    closePaperdollModal();
}

function handlePaperdollModalBackdrop(event) {
    if (event.target && event.target.id === 'paperdoll-modal') pdCloseModalAsk();
}
if (typeof registerModalCloser === 'function') {
    registerModalCloser('paperdoll-modal', pdCloseModalAsk);
    registerModalCloser('pd-slot-menu', closeSlotMenu);
}

function equipStandardArmor(armorData) {
    if (!currentCharacter) return;
    const cls = currentCharacter.characterClass || currentCharacter.class || 'Fighter';
    const raceSize = cls === 'Halfling' ? 'Halfling' : 'Human';
    pdStowCurrent('armor');
    currentCharacter.paperdoll.armor = {
        name: armorData.name,
        baseAC: armorData.baseAC,
        weight: armorData.weight,
        size: raceSize,
        isArmor: true,
        magicBonus: 0,
        isCursed: false
    };
    closePaperdollModal();
    afterEquipChange();
    if (typeof syncInventoryUI === 'function') syncInventoryUI();
    if (typeof debouncedSave === 'function') debouncedSave();
}

function equipShieldItem(shieldData) {
    if (!currentCharacter) return;
    pdStowCurrent('offHand');
    currentCharacter.paperdoll.offHand = {
        name: shieldData.name,
        acBonus: 1,
        weight: shieldData.weight,
        isShield: true,
        magicBonus: 0,
        isCursed: false
    };
    closePaperdollModal();
    afterEquipChange();
    if (typeof syncInventoryUI === 'function') syncInventoryUI();
    if (typeof debouncedSave === 'function') debouncedSave();
}

function equipCustomItem() {
    if (!currentCharacter || !activeSelectingSlot) return;
    const name = document.getElementById('custom-slot-name')?.value.trim();
    const weight = Number(document.getElementById('custom-slot-weight')?.value) || 0;
    const magicBonus = Number(document.getElementById('custom-slot-magic')?.value) || 0;
    const isCursed = document.getElementById('custom-slot-cursed')?.checked || false;
    const concentration = document.getElementById('custom-slot-concentration')?.checked || false;
    const desc = document.getElementById('custom-slot-desc')?.value.trim() || '';
    const chargesVal = document.getElementById('custom-slot-charges')?.value;
    const armorBase = Number(document.getElementById('custom-armor-base')?.value);
    const markedShield = document.getElementById('custom-slot-shield')?.checked || false;
    const charges = (chargesVal !== '' && !isNaN(chargesVal)) ? Number(chargesVal) : undefined;

    if (!name) return;
    const customBlock = itemRestriction({ name, isShield: activeSelectingSlot === 'offHand' && (markedShield || isShieldItem({ name })) }, activeSelectingSlot, currentCharacter);
    if (customBlock) {
        const warn = document.getElementById('paperdoll-modal-warning');
        if (warn) { warn.textContent = customBlock; warn.style.display = 'block'; }
        return;
    }
    if (activeSelectingSlot === 'armor' && !isArmourAllowed(currentCharacter, Number.isFinite(armorBase) ? armorBase : 7)) {
        const warn = document.getElementById('paperdoll-modal-warning');
        if (warn) {
            warn.textContent = `${currentCharacter.characterClass} cannot wear that armour type (${ClassesDatabase[currentCharacter.characterClass]?.allowedArmor || 'restricted'}).`;
            warn.style.display = 'block';
        }
        return;
    }

    pdStowCurrent(activeSelectingSlot);
    currentCharacter.paperdoll[activeSelectingSlot] = {
        name,
        weight,
        magicBonus,
        isCursed,
        concentration,
        charges,
        desc,
        isShield: activeSelectingSlot === 'offHand' && (markedShield || isShieldItem({ name })),
        // RAW armour AC from the armour-type picker; the enchantment is applied once later.
        baseAC: activeSelectingSlot === 'armor' ? (Number.isFinite(armorBase) ? armorBase : 7) : undefined
    };

    closePaperdollModal();
    afterEquipChange();
    if (typeof syncInventoryUI === 'function') syncInventoryUI();
    if (typeof debouncedSave === 'function') debouncedSave();
}

window.handleSlotClick = handleSlotClick;
window.closePaperdollModal = closePaperdollModal;
window.handlePaperdollModalBackdrop = handlePaperdollModalBackdrop;
window.equipCustomItem = equipCustomItem;
window.syncPaperdollUI = syncPaperdollUI;
window.calculateEquippedArmorAC = calculateEquippedArmorAC;
window.spendItemCharge = spendItemCharge;
