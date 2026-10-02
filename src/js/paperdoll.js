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
    return PAPERDOLL_SLOTS.reduce((sum, slot) => sum + (mystic && isProtectiveItem(pd[slot]) ? 0 : (Number(pd[slot]?.saveBonus) || 0)), 0);
}
window.getEquippedSaveBonus = getEquippedSaveBonus;

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
    if (['wand', 'staff', 'rod'].includes(item.group)) return ['mainHand'];
    if (item.slot === 'ring') return ['ringLeft', 'ringRight'];
    if (['neck', 'cloak', 'head', 'belt', 'boots', 'hands'].includes(item.slot)) return [item.slot];
    return [];
}
const SLOT_LABELS = { head: 'head', neck: 'neck', cloak: 'cloak', mainHand: 'main hand', armor: 'armour', offHand: 'off hand', ringLeft: 'left hand', ringRight: 'right hand', belt: 'belt', hands: 'hands', boots: 'feet' };

// Equip an inventory item straight from the inventory list (or the catalogue).
async function equipInventoryItem(index, wantSlot = null) {
    if (!currentCharacter || !Array.isArray(currentCharacter.inventory)) return false;
    const item = currentCharacter.inventory[index];
    const slots = slotsForItem(item);
    if (!slots.length) return false;
    if (!currentCharacter.paperdoll) syncPaperdollUI();
    const pd = currentCharacter.paperdoll;
    const allowed = slots.filter(s => checkSlotRestriction(s, currentCharacter).allowed);
    if (!allowed.length) { await sheetAlert(checkSlotRestriction(slots[0], currentCharacter).reason); return false; }
    const itemBlock = itemRestriction(item, allowed[0], currentCharacter);
    if (itemBlock) { await sheetAlert(itemBlock); return false; }
    if (item.isArmor && !isArmourAllowed(currentCharacter, item.baseAC !== undefined ? Number(item.baseAC) : 7)) {
        await sheetAlert(`${currentCharacter.characterClass} cannot wear that armour (${ClassesDatabase[currentCharacter.characterClass]?.allowedArmor || 'restricted'}).`);
        return false;
    }
    let slot = wantSlot && allowed.includes(wantSlot) ? wantSlot : (allowed.find(s => !pd[s]) || allowed[0]);
    const current = pd[slot];
    if (current) {
        if (current.isCursed) { await sheetAlert(`${current.name} is cursed and cannot be removed from your ${SLOT_LABELS[slot]} without remove curse.`); return false; }
        if (!(await sheetConfirm(`Swap ${current.name} for ${item.name}? ${current.name} goes back to the backpack.`, 'Swap'))) return false;
        currentCharacter.inventory.push({ ...current, location: 'Backpack', qty: 1 });
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
            .sort((a, b) => a.name.localeCompare(b.name)).forEach(w => out.push({ kind: 'weapon', id: w.id, name: w.name, note: 'Weapon' }));
    }
    if (typeof RC_MAGIC_ITEMS !== 'undefined') {
        RC_MAGIC_ITEMS.forEach(x => {
            const fits = (slot === 'mainHand' && ['wand', 'staff', 'rod'].includes(x.group))
                || ((slot === 'ringLeft' || slot === 'ringRight') && x.slot === 'ring')
                || (x.slot && x.slot === slot);
            if (!fits) return;
            const note = x.houseRule ? 'House rule' : 'Rules Cyclopedia';
            // Items with variants (rings of protection +1..+4, bracers AC 7..3) are listed one by one.
            const barred = itemRestriction(x, slot, currentCharacter) ? 'Not for mystics' : '';
            if (Array.isArray(x.variants) && x.variants.length) x.variants.forEach((v, i) => out.push({ kind: 'magic', id: `${x.id}~${i}`, name: `${x.name} ${v.suffix}`, note, cursed: x.cursed, barred }));
            else out.push({ kind: 'magic', id: x.id, name: x.name, note, cursed: x.cursed, barred });
        });
    }
    return out;
}
function renderSlotCatalogue() {
    const list = document.getElementById('paperdoll-catalogue-list');
    if (!list || !activeSelectingSlot) return;
    const q = (document.getElementById('paperdoll-catalogue-search')?.value || '').trim().toLowerCase();
    const items = catalogueChoicesForSlot(activeSelectingSlot).filter(c => !q || c.name.toLowerCase().includes(q));
    list.innerHTML = items.length ? items.map(c => `
        <button type="button" class="pd-cat-item" ${c.barred ? `disabled title="${escapeHtml(c.barred)}" style="opacity: .5; cursor: not-allowed;"` : `onclick="equipFromCatalogue('${c.kind}', '${c.id}')"`}>
            <span>${escapeHtml(c.name)}${c.cursed ? ' <span class="tag" style="color: var(--danger);">cursed</span>' : ''}${c.barred ? ` <span class="tag" style="color: var(--danger);">${escapeHtml(c.barred)}</span>` : ''}</span>
            <span class="eyebrow">${escapeHtml(c.note)}</span>
        </button>`).join('') : '<div class="ledger-note">Nothing in the catalogue fits this slot.</div>';
}
// Add a catalogue item to the inventory, then put it straight into the slot being chosen.
function equipFromCatalogue(kind, id) {
    if (!currentCharacter || !activeSelectingSlot) return;
    const slot = activeSelectingSlot;
    if (!Array.isArray(currentCharacter.inventory)) currentCharacter.inventory = [];
    const before = currentCharacter.inventory.length;
    if (kind === 'weapon') addWeaponFromCatalogue(id);
    else if (kind === 'magic') { const [mid, vi] = String(id).split('~'); addMagicFromCatalogue(mid, vi === undefined ? null : vi); id = mid; }
    else if (kind === 'armour') addArmourFromCatalogue(id);
    const inv = currentCharacter.inventory;
    let idx = inv.length > before ? inv.length - 1 : -1;
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
    (character?.inventory || []).forEach(it => { if (it && it.activeWhileCarried) push(it, 'carried'); });
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
    if (Number(it.acBonus) || Number(it.saveBonus) || (it.armourAC != null && it.armourAC !== '')) return true;
    if (Array.isArray(it.variants) && it.variants.some(v => Number(v.acBonus) || Number(v.saveBonus) || (v.armourAC != null && v.armourAC !== ''))) return true;
    return /\b(protection|displacement|defen[cs]e)\b/i.test(String(it.name || '')) && !/\bscroll\b/i.test(String(it.name || ''));
}
function itemRestriction(item, slot, character) {
    const cls = character?.characterClass || character?.class || '';
    if (cls !== 'Mystic' || !item) return '';
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
function migrateLegacyEquipment(character) {
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
    currentCharacter.inventory.push({ ...item, location: 'Backpack', qty: 1 });
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
        alert(`${item.name} expended its final charge! It permanently becomes an inert non-magical item.`);
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
            ? `<span style="font-size: 0.65rem; color: var(--danger); font-weight: bold; background: color-mix(in srgb, var(--danger) 15%, transparent); border: 1px solid var(--danger); padding: 0 4px; border-radius: 2px; display: inline-flex; align-items: center; gap: 3px;">${getIcon('skull', 13)} CURSED</span>`
            : '';

        const concBadge = item.concentration
            ? `<span style="font-size: 0.65rem; color: var(--arcane); font-weight: bold; border: 1px solid var(--arcane); padding: 0 4px; border-radius: 2px; display: inline-flex; align-items: center; gap: 3px;" title="Cannot move or cast spells while activating">${getIcon('brain', 13)} Concentration</span>`
            : '';

        const chargeBlock = item.charges !== undefined && item.charges !== null
            ? `<div style="display: flex; align-items: center; gap: 4px;">
                 <span style="font-size: 0.75rem; color: var(--accent-gold); font-weight: bold; display: inline-flex; align-items: center; gap: 3px;">${getIcon('zap', 13)} ${item.charges} charges</span>
                 <button type="button" onclick="spendItemCharge('${slot}')" style="background: color-mix(in srgb, var(--accent-gold) 15%, transparent); border: 1px solid var(--accent-gold); color: var(--accent-gold); border-radius: 2px; padding: 1px 6px; font-size: 0.65rem; cursor: pointer;">-1 Use</button>
               </div>`
            : '';

        row.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <div style="display: flex; align-items: center; gap: 6px; overflow: hidden;">
                    <span style="font-size: 0.65rem; color: var(--text-muted); font-family: var(--font-headings); letter-spacing: 0.1em; text-transform: uppercase;">[${slot}]</span>
                    <strong style="color: var(--accent-gold); font-size: 0.85rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(item.name)}</strong>
                    ${bonusBadge}
                    ${cursedBadge}
                    ${concBadge}
                    ${item.enemyBonus ? `<span class="tag" style="color: var(--info);">+${Number(item.enemyBonus.bonus)} vs ${escapeHtml(item.enemyBonus.name)}</span>` : ''}
                    ${item.acBonus && !item.isShield ? `<span class="tag" style="color: var(--info);">AC -${Number(item.acBonus)}</span>` : ''}
                    ${item.saveBonus ? `<span class="tag" style="color: var(--info);">Saves +${Number(item.saveBonus)}</span>` : ''}
                    ${item.armourAC != null ? (activeBracers(currentCharacter) === item ? `<span class="tag" style="color: var(--info);">AC ${Number(item.armourAC)}</span>` : `<span class="tag" style="color: var(--warn);" title="Bracers work only with no armour and no shield">AC ${Number(item.armourAC)}: inactive (armour or shield)</span>`) : ''}
                </div>
                ${chargeBlock}
            </div>
            ${item.desc ? `<div style="font-size: 0.72rem; color: var(--text-main); line-height: 1.35; border-top: 1px solid color-mix(in srgb, var(--text-main) 5%, transparent); padding-top: 4px;">${escapeHtml(item.desc)}</div>` : ''}
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
            warnBadge.innerText = 'Magic-User: Armor & Shields Prohibited';
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
        const restriction = checkSlotRestriction(slotKey, currentCharacter);

        el.classList.remove('equipped', 'restricted');

        if (!restriction.allowed) {
            el.classList.add('restricted');
            if (contentEl) contentEl.innerText = 'Prohibited';
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

            if (contentEl) contentEl.innerHTML = skullHtml + nameHtml + chargesHtml;
            el.title = `${displayTitle} (Click to unequip)`;
            if (item.isCursed) el.style.borderColor = 'var(--danger)';
            else el.style.borderColor = (Number(item.magicBonus) > 0) ? 'var(--info)' : 'var(--accent-gold)';
        } else {
            if (contentEl) contentEl.innerText = 'Empty';
            el.title = 'Empty slot. Click to equip.';
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
        alert(restriction.reason);
        return;
    }

    // Если слот уже занят — снимаем предмет
    if (currentCharacter.paperdoll && currentCharacter.paperdoll[slotKey]) {
        unequipSlot(slotKey);
        return;
    }

    openPaperdollModal(slotKey);

}

function openPaperdollModal(slotKey) {
    activeSelectingSlot = slotKey;
    const modal = document.getElementById('paperdoll-modal');
    const titleEl = document.getElementById('paperdoll-modal-title');
    const warnEl = document.getElementById('paperdoll-modal-warning');
    const container = document.getElementById('paperdoll-options-container');
    const baseSelect = document.getElementById('custom-armor-base');
    const shieldGroup = document.getElementById('custom-slot-shield-group');
    const shieldBox = document.getElementById('custom-slot-shield');

    if (!modal || !container) return;

    if (warnEl) warnEl.style.display = 'none';
    if (titleEl) titleEl.innerText = `Equip Slot: ${slotKey.toUpperCase()}`;
    if (baseSelect) { baseSelect.style.display = (slotKey === 'armor') ? 'block' : 'none'; baseSelect.value = '7'; }
    const isMystic = (currentCharacter.characterClass || currentCharacter.class) === 'Mystic';
    if (shieldGroup) shieldGroup.style.display = (slotKey === 'offHand' && !isMystic) ? 'flex' : 'none';
    if (shieldBox) shieldBox.checked = false;

    // Сброс полей
    safeSetVal('custom-slot-name', '');
    safeSetVal('custom-slot-weight', 10);
    safeSetVal('custom-slot-magic', '0');
    safeSetVal('custom-slot-charges', '');
    safeSetVal('custom-slot-desc', '');
    const cursedBox = document.getElementById('custom-slot-cursed');
    if (cursedBox) cursedBox.checked = false;
    const concBox = document.getElementById('custom-slot-concentration');
    if (concBox) concBox.checked = false;

    container.innerHTML = '';
    const cls = currentCharacter.characterClass || currentCharacter.class || 'Fighter';

    if (slotKey === 'armor') {
        STANDARD_ARMORS.filter(a => a.id !== 'shield').forEach(arm => {
            const isAllowed = isArmourAllowed(currentCharacter, arm.baseAC);
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.style.cssText = `background: var(--inset); border: 1px solid var(--border-color); padding: 8px; border-radius: 2px; text-align: left; cursor: ${isAllowed ? 'pointer' : 'not-allowed'}; opacity: ${isAllowed ? '1' : '0.5'};`;
            btn.innerHTML = `
                <div style="display: flex; justify-content: space-between;">
                    <strong style="color: var(--accent-gold);">${arm.name} (AC ${arm.baseAC})</strong>
                    <span style="font-size: 0.75rem; color: var(--text-muted);">${arm.weight} cn</span>
                </div>
                <div style="font-size: 0.7rem; color: var(--text-muted);">${arm.desc}</div>
            `;
            if (isAllowed) {
                btn.onclick = () => equipStandardArmor(arm);
            }
            container.appendChild(btn);
        });
    } else if (slotKey === 'offHand') {
        const shield = STANDARD_ARMORS.find(a => a.id === 'shield');
        const isAllowed = getArmourRule(currentCharacter).shields && cls !== 'Mystic';
        if (shield && isAllowed) {
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.style.cssText = 'background: var(--inset); border: 1px solid var(--border-color); padding: 8px; border-radius: 2px; text-align: left; cursor: pointer;';
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

    // From the catalogue (searchable).
    const catChoices = catalogueChoicesForSlot(slotKey);
    if (catChoices.length) {
        const sec = document.createElement('div');
        sec.innerHTML = `
            <div class="pd-section-title">From the catalogue</div>
            <input type="search" id="paperdoll-catalogue-search" class="stat-input arc-input" placeholder="Search ${catChoices.length} items" oninput="renderSlotCatalogue()" style="margin: 4px 0;">
            <div id="paperdoll-catalogue-list" class="pd-cat-list"></div>`;
        container.appendChild(sec);
    } else if (slotKey === 'armor' || slotKey === 'offHand') {
        const sec = document.createElement('div');
        sec.innerHTML = `<button type="button" class="btn btn-sm" onclick="closePaperdollModal(); openCatalogue('forge')">Make magic ${slotKey === 'armor' ? 'armour' : 'shield'} in the Magic forge</button>`;
        container.appendChild(sec);
    }

    const invItems = currentCharacter.inventory || [];
    if (invItems.length > 0) {
        const divider = document.createElement('div');
        divider.style.cssText = 'font-size: 0.7rem; color: var(--text-muted); font-family: var(--font-headings); letter-spacing: 0.1em; text-transform: uppercase; margin-top: 6px;';
        divider.innerText = 'From your inventory:';
        container.appendChild(divider);

        const order = invItems.map((it, idx) => ({ it, idx, fits: itemFitsSlot(it, slotKey) }))
            .filter(o => !(o.it.isValuable || o.it.valueGP > 0))
            .sort((a, b) => Number(b.fits) - Number(a.fits));
        order.forEach(({ it, idx, fits }) => {
            const barred = itemRestriction(it, slotKey, currentCharacter);
            if (barred) fits = false;
            const btn = document.createElement('button');
            btn.type = 'button';
            btn.style.cssText = 'background: color-mix(in srgb, var(--text-main) 3%, transparent); border: 1px solid var(--border-color); padding: 6px 8px; border-radius: 2px; text-align: left; cursor: pointer; display: flex; justify-content: space-between; align-items: center;';
            btn.innerHTML = `
                <span style="color: ${fits ? 'var(--accent-gold)' : 'var(--text-main)'}; font-size: 0.8rem;">${escapeHtml(it.name)}${fits ? ' <span class="tag">fits</span>' : ''}${barred ? ' <span class="tag" style="color: var(--danger);">not for mystics</span>' : ''}</span>
                <span style="font-size: 0.7rem; color: var(--text-muted);">${it.weight || 0} cn</span>
            `;
            if (barred) { btn.disabled = true; btn.title = barred; btn.style.opacity = '0.5'; btn.style.cursor = 'not-allowed'; }
            else btn.onclick = () => equipFromInventory(idx);
            container.appendChild(btn);
        });
    }

    modal.style.display = 'flex';
    if (catChoices.length) renderSlotCatalogue();
}

function equipFromInventory(invIndex) {
    if (!currentCharacter || !activeSelectingSlot) return;
    const item = currentCharacter.inventory[invIndex];
    if (!item) return;
    const block = itemRestriction(item, activeSelectingSlot, currentCharacter);
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

    const { qty: _qty, location: _loc, ...rest } = item;
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
    activeSelectingSlot = null;
}

function handlePaperdollModalBackdrop(event) {
    if (event.target && event.target.id === 'paperdoll-modal') closePaperdollModal();
}

function equipStandardArmor(armorData) {
    if (!currentCharacter) return;
    const cls = currentCharacter.characterClass || currentCharacter.class || 'Fighter';
    const raceSize = cls === 'Halfling' ? 'Halfling' : 'Human';
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
