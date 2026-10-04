// js/inventory.js — Модуль инвентаря и расчета переносимого веса

// Character Movement Rates and Encumbrance (RC p.87; Dark Dungeons Chapter 8).
const ENCUMBRANCE_TIERS = [
    { max: 400,      speed: 120, label: 'Unencumbered', color: 'var(--good)', bg: 'color-mix(in srgb, var(--good) 15%, transparent)' },
    { max: 800,      speed: 90,  label: 'Light Load',   color: 'var(--info)', bg: 'color-mix(in srgb, var(--info) 15%, transparent)' },
    { max: 1200,     speed: 60,  label: 'Heavy Load',   color: 'var(--warn)', bg: 'color-mix(in srgb, var(--warn) 15%, transparent)' },
    { max: 1600,     speed: 30,  label: 'Severe Load',  color: 'var(--warn-strong)', bg: 'color-mix(in srgb, var(--warn-strong) 15%, transparent)' },
    { max: 2400,     speed: 15,  label: 'Overloaded',   color: 'var(--danger)', bg: 'color-mix(in srgb, var(--danger) 15%, transparent)' },
    { max: Infinity, speed: 0,   label: 'Immobile',     color: 'var(--danger)', bg: 'color-mix(in srgb, var(--danger) 25%, transparent)' },
];
const ENCUMBRANCE_BAR_MAX = 2400;

// Some creature heroes have their own table (centaur: PC1 Table 18). The rows get the
// usual load names from fastest to slowest, the last ones always Overloaded / Immobile.
const ENCUMBRANCE_LOOKS = ENCUMBRANCE_TIERS.slice(0, 5);
function getEncumbranceTiers(character) {
    const own = character && window.ClassesDatabase?.[character.characterClass]?.encumbranceTable;
    if (!Array.isArray(own) || !own.length) return ENCUMBRANCE_TIERS;
    const names = ['Unencumbered', 'Light Load', 'Moderate Load', 'Heavy Load', 'Very Heavy Load', 'Severe Load'];
    const tiers = own.map((row, i) => {
        const last = i === own.length - 1;
        const look = ENCUMBRANCE_LOOKS[Math.min(ENCUMBRANCE_LOOKS.length - 1, Math.round(i * (ENCUMBRANCE_LOOKS.length - 1) / Math.max(1, own.length - 1)))];
        return { ...look, max: row.max, speed: row.speed, label: last ? 'Overloaded' : (names[i] || 'Severe Load') };
    });
    tiers.push({ ...ENCUMBRANCE_TIERS[ENCUMBRANCE_TIERS.length - 1], max: Infinity });
    return tiers;
}

function getEncumbranceTier(cn, character = window.currentCharacter) {
    return getEncumbranceTiers(character).find(t => cn <= t.max);
}

function encumbranceBarMax(character = window.currentCharacter) {
    const tiers = getEncumbranceTiers(character);
    return tiers.length > 1 ? tiers[tiers.length - 2].max : ENCUMBRANCE_BAR_MAX;
}

// The Combat tab's Load list follows the character's own table.
function syncMovementLoadOptions(character = window.currentCharacter) {
    const sel = document.getElementById('movement-load');
    if (!sel) return;
    const tiers = getEncumbranceTiers(character);
    const sig = tiers.map(t => t.speed).join(',');
    if (sel.dataset.sig === sig) return;
    const keep = sel.value;
    sel.innerHTML = tiers.map(t => `<option value="${t.speed}">${t.label} (${t.speed}')</option>`).join('');
    sel.dataset.sig = sig;
    sel.value = tiers.some(t => String(t.speed) === keep) ? keep : String(tiers[0].speed);
}

function getBagContentsWeight(bag, items) {
    const coins = bag.coins || {};
    const coinCount = (Number(coins.cp) || 0) + (Number(coins.sp) || 0) + (Number(coins.ep) || 0) + (Number(coins.gp) || 0) + (Number(coins.pp) || 0);
    const bagItems = items.filter(i => i.location === bag.id);
    const itemsWeight = bagItems.reduce((sum, i) => sum + ((Number(i.weight) || 0) * (Number(i.qty) || 1)), 0);
    return coinCount + itemsWeight;
}

function calculateCarriedWeight(character) {
    if (!character) return 0;
    const coins = character.coins || {};
    const carriedCoinsCount = (Number(coins.cp) || 0) + (Number(coins.sp) || 0) + (Number(coins.ep) || 0) + (Number(coins.gp) || 0) + (Number(coins.pp) || 0);

    const items = character.inventory || [];
    const bags = character.bagsOfHolding || [];
    const bagIds = bags.map(b => b.id);
    const mounts = character.mounts || [];
    const mountIds = mounts.map(m => m.id);
    const homeIds = (character.holdings || []).map(h => h.id);

    // Предметы на персонаже (не в Vault, не в сумках и не на животных)
    let carriedItemsWeight = items.reduce((sum, item) => {
        if (item.location === 'Vault' || bagIds.includes(item.location) || mountIds.includes(item.location) || homeIds.includes(item.location)) return sum;
        return sum + ((Number(item.weight) || 0) * (Number(item.qty) || 1));
    }, 0);

    // Вес надетых на куклу предметов
    const pd = character.paperdoll || {};
    Object.values(pd).forEach(slotItem => {
        if (slotItem && slotItem.weight) {
            carriedItemsWeight += Number(slotItem.weight) || 0;
        }
    });

    let carriedBagsWeight = 0;
    bags.forEach(bag => {
        if (bag.location !== 'Vault') {
            const contentsWeight = getBagContentsWeight(bag, items);
            carriedBagsWeight += bagOfHoldingWeight(contentsWeight);
        }
    });

    return Math.round((carriedCoinsCount + carriedItemsWeight + carriedBagsWeight) * 10) / 10;
}

function syncInventoryUI() {
    if (!currentCharacter) return;
    if (!currentCharacter.coins) currentCharacter.coins = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
    if (!currentCharacter.vaultCoins) currentCharacter.vaultCoins = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
    if (!Array.isArray(currentCharacter.inventory)) currentCharacter.inventory = [];

    // Обновление значений в полях кошелька
    safeSetVal('coin-cp', currentCharacter.coins.cp || 0);
    safeSetVal('coin-sp', currentCharacter.coins.sp || 0);
    safeSetVal('coin-ep', currentCharacter.coins.ep || 0);
    safeSetVal('coin-gp', currentCharacter.coins.gp || 0);
    safeSetVal('coin-pp', currentCharacter.coins.pp || 0);

    // Обновление значений в полях хранилища
    safeSetVal('vault-cp', currentCharacter.vaultCoins.cp || 0);
    safeSetVal('vault-sp', currentCharacter.vaultCoins.sp || 0);
    safeSetVal('vault-ep', currentCharacter.vaultCoins.ep || 0);
    safeSetVal('vault-gp', currentCharacter.vaultCoins.gp || 0);
    safeSetVal('vault-pp', currentCharacter.vaultCoins.pp || 0);

    const totalWeight = calculateCarriedWeight(currentCharacter);
    const weightEl = document.getElementById('inv-total-weight');
    const badgeEl = document.getElementById('encumbrance-badge');
    const barEl = document.getElementById('encumbrance-bar-fill');

    if (weightEl) weightEl.innerText = totalWeight;

    const tier = getEncumbranceTier(totalWeight);
    const category = `${tier.label} (${tier.speed}')`;
    const baseTurnSpeed = tier.speed;
    const color = tier.color;
    const bg = tier.bg;

    if (badgeEl) {
        badgeEl.innerText = category;
        badgeEl.style.color = color;
        badgeEl.style.borderColor = color;
        badgeEl.style.background = bg;
    }

    if (barEl) {
        const pct = Math.min(100, Math.round((totalWeight / encumbranceBarMax(currentCharacter)) * 100));
        barEl.style.width = pct + '%';
        barEl.style.background = color;
    }

    // Синхронизация боевой скорости в тактическом баре
    syncMovementLoadOptions(currentCharacter);
    const moveSelect = document.getElementById('movement-load');
    if (moveSelect && moveSelect.value !== String(baseTurnSpeed)) {
        moveSelect.value = String(baseTurnSpeed);
        if (typeof updateCombatVitals === 'function') updateCombatVitals();
    }

    renderGemsLists();
    renderBagsOfHolding();
    renderMounts();
    renderWeaponsList();
    renderMagicItemsList();
    renderEquipmentList();
    renderInventoryToolbar();
}

// Pack and riding animals and vehicles: Dark Dungeons Tables 8-4 and 8-5 (items-data.js).
// Animals carry up to twice their capacity at half speed; vehicles move at their team's speed.
const MOUNT_TYPES_DB = Object.fromEntries(Object.entries(typeof DD_MOUNTS === 'object' ? DD_MOUNTS : {}).map(([key, m]) => [key, {
    name: m.name, normal: m.normal, max: m.normal * 2, icon: m.icon, cost: m.cost,
    speedNormal: m.speed ? `${m.speed * 3}' (${m.speed}')` : "team's speed",
    speedLoaded: m.speed ? `${m.speed * 3 / 2}' (${m.speed / 2}')` : "half the team's speed",
}]));

function getMountContentsWeight(mount, items) {
    const coins = mount.coins || {};
    const coinCount = (Number(coins.cp) || 0) + (Number(coins.sp) || 0) + (Number(coins.ep) || 0) + (Number(coins.gp) || 0) + (Number(coins.pp) || 0);
    const mountItems = items.filter(i => i.location === mount.id);
    const itemsWeight = mountItems.reduce((sum, i) => sum + ((Number(i.weight) || 0) * (Number(i.qty) || 1)), 0);
    return coinCount + itemsWeight;
}

function transferAllCoins(direction) {
    if (!currentCharacter) return;
    if (!currentCharacter.coins) currentCharacter.coins = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
    if (!currentCharacter.vaultCoins) currentCharacter.vaultCoins = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };

    const denominations = ['cp', 'sp', 'ep', 'gp', 'pp'];
    if (direction === 'toVault') {
        denominations.forEach(d => {
            currentCharacter.vaultCoins[d] = (currentCharacter.vaultCoins[d] || 0) + (currentCharacter.coins[d] || 0);
            currentCharacter.coins[d] = 0;
        });
    } else if (direction === 'toPouch') {
        denominations.forEach(d => {
            currentCharacter.coins[d] = (currentCharacter.coins[d] || 0) + (currentCharacter.vaultCoins[d] || 0);
            currentCharacter.vaultCoins[d] = 0;
        });
    }

    syncInventoryUI();
    if (typeof debouncedSave === 'function') debouncedSave();
}

let pendingValuableTransferIndex = null;

function renderGemsLists() {
    const pouchContainer = document.getElementById('pouch-gems-list');
    const vaultContainer = document.getElementById('vault-gems-list');
    if (!pouchContainer || !vaultContainer || !currentCharacter) return;

    pouchContainer.innerHTML = '';
    vaultContainer.innerHTML = '';

    const items = currentCharacter.inventory || [];
    const valuables = items.filter(i => i.isValuable || i.valueGP > 0);

    let pouchCount = 0;
    let vaultCount = 0;

    valuables.forEach(item => {
        const originalIndex = items.indexOf(item);
        const qty = Number(item.qty) || 1;
        const qtyBadge = qty > 1 ? `<span style="color: var(--accent-gold); font-weight: bold; margin-right: 3px;">x${qty}</span>` : '';
        const totalVal = (Number(item.valueGP) || 0) * qty;
        const valText = qty > 1 ? `${totalVal} GP (${item.valueGP} ea)` : `${item.valueGP || 0} GP`;
        const isPouch = item.location !== 'Vault';

        const row = document.createElement('div');
        row.style.cssText = 'display: flex; justify-content: space-between; align-items: center; background: var(--inset); border: 1px solid color-mix(in srgb, var(--text-main) 5%, transparent); padding: 4px 6px; border-radius: 2px; font-size: 0.75rem; gap: 6px;';
        
        const transferBtn = isPouch
            ? `<button type="button" onclick="initiateValuableTransfer(${originalIndex})" style="background: transparent; border: 1px solid var(--info); color: var(--info); border-radius: 2px; padding: 1px 4px; font-size: 0.65rem; cursor: pointer;" title="Deposit to Vault">${getIcon('arrowRight', 14)} Vault</button>`
            : `<button type="button" onclick="initiateValuableTransfer(${originalIndex})" style="background: transparent; border: 1px solid var(--accent-gold); color: var(--accent-gold); border-radius: 2px; padding: 1px 4px; font-size: 0.65rem; cursor: pointer;" title="Withdraw to Pouch">${getIcon('arrowLeft', 14)} Pouch</button>`;

        const spendOneBtn = qty > 1
            ? `<button type="button" onclick="adjustItemQty(${originalIndex}, -1)" style="background: color-mix(in srgb, var(--text-main) 5%, transparent); border: 1px solid var(--border-color); color: var(--text-muted); border-radius: 2px; padding: 0 4px; font-size: 0.65rem; cursor: pointer;" title="Spend / Discard 1">-1</button>`
            : '';

        row.innerHTML = `
            <div style="overflow: hidden; text-overflow: ellipsis; white-space: nowrap; flex: 1; min-width: 0;" title="${escapeHtml(item.name)} (${valText})">
                ${qtyBadge}<span style="color: ${isPouch ? 'var(--accent-gold)' : 'var(--text-main)'}; display: inline-flex; align-items: center; gap: 4px;">${getIcon('gem', 14)} ${escapeHtml(item.name)}</span>
                <span style="color: var(--text-muted); font-size: 0.65rem;">(${valText})</span>
            </div>
            <div style="display: flex; align-items: center; gap: 4px; flex-shrink: 0;">
                ${spendOneBtn}
                ${transferBtn}
                <button type="button" onclick="removeInventoryItem(${originalIndex})" style="background: transparent; border: none; color: var(--danger); cursor: pointer; font-size: 0.75rem; padding: 0 2px;" title="Remove / Discard valuable" aria-label="Remove">${getIcon('close', 15)}</button>
            </div>
        `;

        if (isPouch) {
            pouchCount++;
            pouchContainer.appendChild(row);
        } else {
            vaultCount++;
            vaultContainer.appendChild(row);
        }
    });

    if (pouchCount === 0) pouchContainer.innerHTML = '<div style="color: var(--text-muted); font-size: 0.7rem;">No gems in pouch.</div>';
    if (vaultCount === 0) vaultContainer.innerHTML = '<div style="color: var(--text-muted); font-size: 0.7rem;">No gems in vault.</div>';
}

function initiateValuableTransfer(index) {
    if (!currentCharacter || !currentCharacter.inventory?.[index]) return;
    const item = currentCharacter.inventory[index];
    const qty = Number(item.qty) || 1;

    // Если предмет штучный, перекладываем мгновенно
    if (qty <= 1) {
        const targetLoc = (item.location === 'Vault') ? 'Pouch' : 'Vault';
        item.location = targetLoc;
        mergeIdenticalValuables();
        syncInventoryUI();
        if (typeof debouncedSave === 'function') debouncedSave();
        return;
    }

    // Если стопка из нескольких штук, открываем модалку
    pendingValuableTransferIndex = index;
    const modal = document.getElementById('valuable-transfer-modal');
    const nameEl = document.getElementById('valuable-transfer-item-name');
    const dirEl = document.getElementById('valuable-transfer-direction-text');
    const availEl = document.getElementById('valuable-transfer-avail-badge');
    const input = document.getElementById('valuable-transfer-qty-input');
    const err = document.getElementById('valuable-transfer-error');

    if (err) err.style.display = 'none';
    if (nameEl) nameEl.innerText = item.name;
    if (dirEl) {
        dirEl.innerHTML = (item.location === 'Vault') ? `Withdrawing: Vault ${getIcon('arrowRight', 14)} Pouch` : `Depositing: Pouch ${getIcon('arrowRight', 14)} Vault`;
    }
    if (availEl) availEl.innerText = `Available: ${qty}`;
    if (input) {
        input.value = 1;
        input.max = qty;
    }

    if (modal) modal.style.display = 'flex';
}

function closeValuableTransferModal() {
    const modal = document.getElementById('valuable-transfer-modal');
    if (modal) modal.style.display = 'none';
    pendingValuableTransferIndex = null;
}

function handleValuableTransferModalBackdrop(event) {
    if (event.target && event.target.id === 'valuable-transfer-modal') closeValuableTransferModal();
}

function setValuableTransferMax() {
    if (pendingValuableTransferIndex === null || !currentCharacter?.inventory?.[pendingValuableTransferIndex]) return;
    const item = currentCharacter.inventory[pendingValuableTransferIndex];
    const input = document.getElementById('valuable-transfer-qty-input');
    if (input) input.value = Number(item.qty) || 1;
}

function mergeIdenticalValuables() {
    if (!currentCharacter || !Array.isArray(currentCharacter.inventory)) return;
    const merged = [];

    currentCharacter.inventory.forEach(item => {
        if (item.isValuable || item.valueGP > 0) {
            const existing = merged.find(m => 
                m.name.toLowerCase() === item.name.toLowerCase() && 
                m.location === item.location && 
                Number(m.valueGP) === Number(item.valueGP)
            );
            if (existing) {
                existing.qty = (Number(existing.qty) || 1) + (Number(item.qty) || 1);
            } else {
                merged.push(item);
            }
        } else {
            merged.push(item);
        }
    });

    currentCharacter.inventory = merged;
}

function executeValuableTransfer() {
    if (pendingValuableTransferIndex === null || !currentCharacter?.inventory?.[pendingValuableTransferIndex]) return;
    const item = currentCharacter.inventory[pendingValuableTransferIndex];
    const availableQty = Number(item.qty) || 1;
    const input = document.getElementById('valuable-transfer-qty-input');
    const moveQty = Math.max(1, Number(input?.value) || 1);
    const err = document.getElementById('valuable-transfer-error');

    if (moveQty > availableQty) {
        if (err) { err.innerText = `Cannot move more than available (${availableQty})!`; err.style.display = 'block'; }
        return;
    }

    const targetLocation = (item.location === 'Vault') ? 'Pouch' : 'Vault';

    if (moveQty === availableQty) {
        // Перенос всей стопки целиком
        item.location = targetLocation;
    } else {
        // Отщепляем часть стопки в новую запись
        item.qty = availableQty - moveQty;
        currentCharacter.inventory.push({
            name: item.name,
            qty: moveQty,
            weight: item.weight || 1,
            valueGP: item.valueGP || 0,
            location: targetLocation,
            isValuable: true
        });
    }

    mergeIdenticalValuables();
    closeValuableTransferModal();
    syncInventoryUI();
    if (typeof debouncedSave === 'function') debouncedSave();
}

function toggleInvItemDesc(index) {
    const el = document.getElementById(`inv-desc-${index}`);
    const btn = document.getElementById(`inv-desc-toggle-${index}`);
    if (!el) return;
    const isHidden = el.style.display === 'none';
    el.style.display = isHidden ? 'block' : 'none';
    if (btn) btn.innerHTML = getIcon(isHidden ? 'up' : 'down', 15);
}

function consumeAmmunition(index, amount = 1) {
    if (!currentCharacter || !Array.isArray(currentCharacter.inventory)) return;
    const item = currentCharacter.inventory[index];
    if (!item) return;

    const currentQty = Number(item.qty) || 0;
    if (currentQty <= 0) {
        alert(`${item.name} is depleted! Refill or purchase more.`);
        return;
    }

    item.qty = Math.max(0, currentQty - amount);
    syncInventoryUI();
    if (typeof debouncedSave === 'function') debouncedSave();
}

function refillAmmunition(index, amount = 20) {
    if (!currentCharacter || !Array.isArray(currentCharacter.inventory)) return;
    const item = currentCharacter.inventory[index];
    if (!item) return;

    item.qty = (Number(item.qty) || 0) + amount;
    syncInventoryUI();
    if (typeof debouncedSave === 'function') debouncedSave();
}

function isWeaponOrAmmo(item) {
    if (item.category === 'weapon' || item.category === 'ammo') return true;
    if (item.category === 'equipment' || item.category === 'consumable') return false;
    // Фолбэк для ранее созданных предметов без явной категории
    const n = (item.name || '').toLowerCase();
    return n.includes('sword') || n.includes('bow') || n.includes('arrow') || 
           n.includes('bolt') || n.includes('dagger') || n.includes('axe') || 
           n.includes('mace') || n.includes('spear') || n.includes('quiver');
}

function renderWeaponsList() {
    const list = document.getElementById('weapons-list');
    if (!list || !currentCharacter) return;
    list.innerHTML = '';

    const items = currentCharacter.inventory || [];
    const weapons = items.filter(i => !(i.isValuable || i.valueGP > 0) && isWeaponOrAmmo(i));

    if (weapons.length === 0) {
        list.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem;">No carried weapons or ammunition. Click "+ Add Weapon / Ammo" to record weapons.</div>';
        return;
    }

    renderCustomItemList(weapons, list, true);
}

// Potions, scrolls, wands, rings and other magic (non-weapon) items get their own list.
const MAGIC_ITEM_GROUPS = ['potion', 'scroll', 'wand', 'staff', 'rod', 'ring', 'misc'];
function isMagicItem(item) {
    if (!item || isWeaponOrAmmo(item)) return false;
    return item.magic === true || MAGIC_ITEM_GROUPS.includes(item.group) || Number(item.magicBonus) !== 0 && Boolean(item.magicBonus)
        || Boolean(item.acBonus) || Boolean(item.saveBonus) || (Array.isArray(item.abilityMods) && item.abilityMods.length > 0) || (item.charges !== undefined && item.charges !== null && item.charges !== '');
}
function renderMagicItemsList() {
    const list = document.getElementById('magic-items-list');
    if (!list || !currentCharacter) return;
    list.innerHTML = '';
    const items = (currentCharacter.inventory || []).filter(i => !(i.isValuable || i.valueGP > 0) && isMagicItem(i));
    const count = document.getElementById('magic-items-count');
    if (count) count.innerText = items.length;
    if (items.length === 0) {
        list.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem;">No magic items carried. Use the Catalogue to add potions, scrolls, wands, rings and more.</div>';
        return;
    }
    renderCustomItemList(items, list, false);
}

function renderEquipmentList() {
    const list = document.getElementById('equipment-list');
    if (!list || !currentCharacter) return;
    list.innerHTML = '';

    const items = currentCharacter.inventory || [];
    const gear = items.filter(i => !(i.isValuable || i.valueGP > 0) && !isWeaponOrAmmo(i) && !isMagicItem(i));

    if (gear.length === 0) {
        list.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem;">No adventuring gear logged yet. Click "+ Add Gear" to record packs, ropes, and torches.</div>';
        return;
    }

    renderCustomItemList(gear, list, false);
}

// --- Sorting, filtering and "for trade" ---------------------------------------
// Kept per character: inventorySort (order) and inventoryShow { trade: bool, places: [...] }
// (no places ticked = every place; "for trade" narrows whatever places are shown).
// "For trade" is a flag on the item.
const INV_SORTS = {
    added: null,
    name: (a, b) => String(a.name || '').localeCompare(String(b.name || '')),
    weight: (a, b) => (Number(b.weight) || 0) * (Number(b.qty) || 0) - (Number(a.weight) || 0) * (Number(a.qty) || 0),
    value: (a, b) => (Number(b.cost) || 0) * Math.max(1, Number(b.qty) || 0) - (Number(a.cost) || 0) * Math.max(1, Number(a.qty) || 0),
    location: (a, b) => inventoryLocationName(a).localeCompare(inventoryLocationName(b)),
};
const INV_PLACES = [['Carried', 'Carried / belt'], ['Backpack', 'Backpack'], ['Sack', 'Sack'], ['Saddlebags', 'Saddlebags'], ['Vault', 'Vault / stronghold']];
function inventoryShowState() {
    const c = currentCharacter || {};
    if (c.inventoryTradeOnly) { c.inventoryShow = 'trade'; delete c.inventoryTradeOnly; }      // older setting
    if (c.inventorySort === 'trade') c.inventorySort = 'added';                                // removed sort
    let s = c.inventoryShow;
    // Older single choices: 'all', 'trade', 'loc:<where>'.
    if (typeof s === 'string') s = s === 'trade' ? { trade: true, places: [] } : s.startsWith('loc:') ? { trade: false, places: [s.slice(4)] } : null;
    if (!s || typeof s !== 'object') return { trade: false, places: [] };
    return { trade: Boolean(s.trade), places: Array.isArray(s.places) ? s.places.map(String) : [] };
}
function inventoryShowMode() {
    const s = inventoryShowState();
    return !s.trade && !s.places.length ? 'all' : s.trade && !s.places.length ? 'trade' : 'filtered';
}
// Every place an item can be kept: the fixed spots, bags of holding, mounts, and homes.
function inventoryPlaces(extra) {
    const c = currentCharacter || {};
    const places = INV_PLACES.map(([v, l]) => [v, l]);
    (c.bagsOfHolding || []).forEach(b => places.push([b.id, `Bag: ${b.name}`]));
    (c.mounts || []).forEach(m => places.push([m.id, `On ${m.name}`]));
    (c.holdings || []).filter(h => h.status !== 'lost').forEach(h => places.push([h.id, `Home: ${h.name}`]));
    if (extra && !places.some(p => p[0] === extra)) places.push([extra, extra]);
    return places;
}

// Same item apart from where it is and how many: such stacks are merged when moved together.
function sameItemStack(a, b) {
    const strip = x => { const { qty, location, forTrade, id, ...rest } = x; return JSON.stringify(rest); };
    return strip(a) === strip(b);
}

// Move an item (or part of a stack) to another place.
async function moveInventoryItem(index, place, selectEl) {
    const items = currentCharacter && currentCharacter.inventory;
    const item = items && items[index];
    if (!item || !place) return;
    const from = item.location || 'Backpack';
    if (place === from) return;
    const qty = Number(item.qty) || 0;
    let howMany = qty;
    if (qty > 1 && typeof notesFormModal === 'function') {
        const placeName = (inventoryPlaces().find(p => p[0] === place) || [place, place])[1];
        const res = await notesFormModal({
            title: `Move ${item.name}`,
            values: { n: String(qty) },
            fields: [{ key: 'n', label: `How many to ${placeName}? (of ${qty})`, wide: true }],
            okText: 'Move',
        });
        if (!res || res === '__delete__') { if (selectEl) selectEl.value = from; return; }
        howMany = Math.max(0, Math.min(qty, Math.round(Number(res.n) || 0)));
        if (!howMany) { if (selectEl) selectEl.value = from; return; }
    }
    const target = items.find(o => o !== item && (o.location || 'Backpack') === place && sameItemStack(o, item));
    if (howMany >= qty) {
        if (target) { target.qty = (Number(target.qty) || 0) + qty; items.splice(index, 1); }
        else item.location = place;
    } else {
        item.qty = qty - howMany;
        if (target) target.qty = (Number(target.qty) || 0) + howMany;
        else items.splice(index + 1, 0, { ...JSON.parse(JSON.stringify(item)), qty: howMany, location: place, id: item.id ? item.id + '_' + Date.now().toString(36) : undefined });
    }
    syncInventoryUI();
    if (typeof debouncedSave === 'function') debouncedSave();
}

// Move every item the Show filter currently lists (weapons, magic items and gear) to one place.
async function moveShownItems(place, selectEl) {
    if (selectEl) selectEl.value = '';
    if (!currentCharacter || !place) return;
    const items = currentCharacter.inventory || [];
    const shown = items.filter(i => !(i.isValuable || i.valueGP > 0) && inventoryShowFilter(i) && (i.location || 'Backpack') !== place);
    const placeName = (inventoryPlaces().find(p => p[0] === place) || [place, place])[1];
    if (!shown.length) { await sheetAlert(`Everything shown is already in ${placeName}.`); return; }
    const filterNote = inventoryShowMode() === 'all' ? 'all your items' : 'every item shown by the current filter';
    if (!(await sheetConfirm(`Move ${shown.length} item${shown.length > 1 ? 's' : ''} (${filterNote}) to ${placeName}?`, 'Move'))) return;
    shown.forEach(it => {
        const target = items.find(o => o !== it && (o.location || 'Backpack') === place && sameItemStack(o, it));
        if (target) { target.qty = (Number(target.qty) || 0) + (Number(it.qty) || 0); it.__gone = true; }
        else it.location = place;
    });
    currentCharacter.inventory = items.filter(i => !i.__gone);
    syncInventoryUI();
    if (typeof debouncedSave === 'function') debouncedSave();
}
window.moveInventoryItem = moveInventoryItem;
window.moveShownItems = moveShownItems;

function inventoryShowFilter(item) {
    const s = inventoryShowState();
    if (s.trade && !item.forTrade) return false;
    if (s.places.length && !s.places.includes(item.location || 'Backpack')) return false;
    return true;
}
function inventoryLocationName(item) {
    const c = currentCharacter || {};
    const box = [...(c.bagsOfHolding || []), ...(c.mounts || []), ...(c.holdings || [])].find(x => x.id === item.location);
    return box ? box.name : String(item.location || 'Backpack');
}
function sortInventorySubset(subset) {
    const mode = (currentCharacter && currentCharacter.inventorySort) || 'added';
    let list = subset.filter(inventoryShowFilter);
    const cmp = INV_SORTS[mode];
    // Stable sort, ties keep the order the items were added; names break ties for the other sorts.
    if (cmp) list = list.map((it, i) => ({ it, i })).sort((x, y) => cmp(x.it, y.it) || (mode !== 'name' ? INV_SORTS.name(x.it, y.it) : 0) || x.i - y.i).map(x => x.it);
    return list;
}
function setInventorySort(mode) {
    if (!currentCharacter) return;
    currentCharacter.inventorySort = INV_SORTS.hasOwnProperty(mode) ? mode : 'added';
    syncInventoryUI();
    if (typeof debouncedSave === 'function') debouncedSave();
}
// mode: 'all' (clear), 'trade' (toggle), or 'loc:<where>' (toggle that place).
function setInventoryShow(mode, on) {
    if (!currentCharacter) return;
    const s = inventoryShowState();
    if (!mode || mode === 'all') { s.trade = false; s.places = []; }
    else if (mode === 'trade') s.trade = on === undefined ? !s.trade : Boolean(on);
    else if (mode.startsWith('loc:')) {
        const p = mode.slice(4); const has = s.places.includes(p);
        const want = on === undefined ? !has : Boolean(on);
        if (want && !has) s.places.push(p); else if (!want && has) s.places = s.places.filter(x => x !== p);
    }
    if (!s.trade && !s.places.length) delete currentCharacter.inventoryShow; else currentCharacter.inventoryShow = s;
    delete currentCharacter.inventoryTradeOnly;
    syncInventoryUI();
    if (typeof debouncedSave === 'function') debouncedSave();
}
function toggleItemForTrade(index) {
    const item = currentCharacter && currentCharacter.inventory && currentCharacter.inventory[index];
    if (!item) return;
    if (item.forTrade) delete item.forTrade; else item.forTrade = true;
    syncInventoryUI();
    if (typeof debouncedSave === 'function') debouncedSave();
}
function renderInventoryToolbar() {
    if (!currentCharacter) return;
    const sel = document.getElementById('inv-sort');
    if (sel) sel.value = currentCharacter.inventorySort || 'added';
    const show = document.getElementById('inv-show');
    if (show) {
        const c = currentCharacter;
        const st = inventoryShowState();
        const places = inventoryPlaces();
        // Any other place an item was put (older or hand-typed locations).
        (c.inventory || []).forEach(i => { const l = i.location || 'Backpack'; if (!places.some(p => p[0] === l)) places.push([l, l]); });
        const count = pred => (c.inventory || []).filter(pred).length;
        const box = (val, label, n, checked) => `<label class="inv-show-opt"><input type="checkbox" ${checked ? 'checked' : ''} onchange="setInventoryShow('${escapeHtml(val).replace(/'/g, '&#39;')}', this.checked)"> <span>${escapeHtml(label)}</span> <span class="inv-show-n">${n}</span></label>`;
        const placeNames = st.places.map(p => (places.find(x => x[0] === p) || [p, p])[1]);
        const summary = !st.trade && !st.places.length ? `All items (${count(() => true)})`
            : [st.trade ? 'For trade' : '', placeNames.length > 2 ? `${placeNames.length} places` : placeNames.join(' + ')].filter(Boolean).join(' · ')
              + ` (${count(inventoryShowFilter)})`;
        const wasOpen = show.open;
        show.innerHTML = `<summary class="stat-input">${escapeHtml(summary)}</summary>
            <div class="inv-show-menu">
                <button type="button" class="btn btn-sm" onclick="setInventoryShow('all')" ${!st.trade && !st.places.length ? 'disabled' : ''}>Show everything</button>
                ${box('trade', 'Only items for trade', count(i => i.forTrade), st.trade)}
                <div class="inv-show-sep">Kept in (none ticked = everywhere)</div>
                ${places.map(([v, l]) => box(`loc:${v}`, l, count(i => (i.location || 'Backpack') === v), st.places.includes(v))).join('')}
            </div>`;
        show.open = wasOpen;
        show.classList.toggle('inv-filter-on', st.trade || st.places.length > 0);
    }
    const mv = document.getElementById('inv-move-all');
    if (mv) mv.innerHTML = `<option value="">Choose a place…</option>` + inventoryPlaces().map(([v, l]) => `<option value="${escapeHtml(v)}">${escapeHtml(l)}</option>`).join('');
    const sum = document.getElementById('inv-trade-summary');
    if (sum) {
        const trade = (currentCharacter.inventory || []).filter(i => i.forTrade);
        const value = trade.reduce((t, i) => t + (Number(i.cost) || 0) * Math.max(1, Number(i.qty) || 0), 0);
        const pieces = trade.reduce((t, i) => t + Math.max(1, Number(i.qty) || 0), 0);
        sum.innerHTML = trade.length
            ? `${getIcon('coin', 13)} For trade: <strong>${pieces}</strong> item${pieces === 1 ? '' : 's'}${value ? ` · list price <strong>${typeof fmtCost === 'function' ? fmtCost(value) : value + ' gp'}</strong>` : ''}`
            : '<span class="ledger-note">Mark items with the coin button to put them up for trade.</span>';
    }
}
window.setInventorySort = setInventorySort;
window.setInventoryShow = setInventoryShow;
window.toggleItemForTrade = toggleItemForTrade;

function renderCustomItemList(subset, container, isWeaponSection) {
    subset = sortInventorySubset(subset);
    if (!subset.length && inventoryShowMode() !== 'all') {
        container.innerHTML = `<div class="ledger-note">${inventoryShowMode() === 'trade' ? 'Nothing here is marked for trade.' : 'Nothing of this kind matches the Show filter.'}</div>`;
        return;
    }
    const allItems = currentCharacter.inventory || [];
    const bags = currentCharacter.bagsOfHolding || [];
    const mounts = currentCharacter.mounts || [];
    
    const containerMap = {};
    bags.forEach(b => { 
        containerMap[b.id] = `${typeof getIcon === 'function' ? getIcon('bag', 13) : ''} ${escapeHtml(b.name)} (0 cn)`; 
    });
    mounts.forEach(m => { 
        containerMap[m.id] = `${typeof getIcon === 'function' ? getIcon('horse', 13) : ''} ${escapeHtml(m.name)} (0 cn)`; 
    });
    (currentCharacter.holdings || []).forEach(h => {
        containerMap[h.id] = `${typeof getIcon === 'function' ? getIcon('vault', 13) : ''} ${escapeHtml(h.name)}`;
    });

    subset.forEach(item => {
        const originalIndex = allItems.indexOf(item);
        const qty = Number(item.qty) || 0;
        const totalItemWeight = Math.round((Number(item.weight) || 0) * qty * 100) / 100;
        const isDepleted = qty <= 0;
        // Whole words only: "Ring of Regeneration" is not a ration, "Thunderbolt" boots are not bolts.
        const isAmmoOrConsumable = item.category === 'ammo' || item.category === 'consumable' ||
            (!item.magic && !item.slot && /\b(arrows?|bolts?|quarrels?|torch(es)?|rations?)\b/i.test(item.name || ''));

        let locLabel = containerMap[item.location] || item.location || 'Backpack';
        const isOutsidePC = Boolean(containerMap[item.location]);

        const magicBadge = item.magicBonus && item.magicBonus !== 0
            ? `<span style="font-size: 0.65rem; color: ${item.magicBonus > 0 ? 'var(--info)' : 'var(--danger)'}; font-weight: bold; border: 1px solid currentColor; padding: 0 4px; border-radius: 2px;">${item.magicBonus > 0 ? '+' : ''}${item.magicBonus}</span>`
            : '';

        const cursedBadge = item.isCursed
            ? `<span style="font-size: 0.65rem; color: var(--danger); font-weight: bold; background: color-mix(in srgb, var(--danger) 15%, transparent); border: 1px solid var(--danger); padding: 0 4px; border-radius: 2px;" style="display: inline-flex; align-items: center; gap: 3px;">${getIcon('skull', 12)} CURSED</span>`
            : '';

        const hasDesc = Boolean(item.desc && item.desc.trim());
        const extraBadges = [];
        if (item.enemyBonus) extraBadges.push(`<span class="tag" style="color: var(--info);">+${Number(item.enemyBonus.bonus)} vs ${escapeHtml(item.enemyBonus.name)}</span>`);
        if (Array.isArray(item.talents)) item.talents.forEach(t => extraBadges.push(`<span class="tag" style="color: var(--arcane);">${escapeHtml(t)}</span>`));
        if (item.intelligence) extraBadges.push(`<span class="tag" style="color: var(--arcane);">Int ${Number(item.intelligence.int) || ''}</span>`);
        if (item.acBonus && !item.isShield) extraBadges.push(`<span class="tag" style="color: var(--info);">AC -${Number(item.acBonus)}</span>`);
        if (item.saveBonus) extraBadges.push(`<span class="tag" style="color: var(--info);">Saves +${Number(item.saveBonus)}</span>`);
        if (typeof saveBonusByTag === 'function') { const t = saveBonusByTag(item); if (t) extraBadges.push(t); }
        extraBadges.push(...abilityEffectTags(item));
        if (item.armourAC != null && item.armourAC !== '') extraBadges.push(`<span class="tag" style="color: var(--info);" title="Only with no armour and no shield">AC ${Number(item.armourAC)} unarmoured</span>`);
        if (item.isArmor && item.baseAC !== undefined) extraBadges.push(`<span class="tag">AC ${Number(item.baseAC) - (Number(item.magicBonus) || 0)}</span>`);
        const hasCharges = item.charges !== undefined && item.charges !== null && item.charges !== '';
        const chargeHtml = hasCharges
            ? `<span class="tag" style="color: var(--accent-gold);" title="${escapeHtml(item.chargesRule ? 'Found with ' + item.chargesRule : 'Charges left')}">${getIcon('zap', 11)} ${Number(item.charges)}</span>
               <button type="button" onclick="useItemCharge(${originalIndex})" class="icon-btn" title="Use one charge" ${Number(item.charges) <= 0 ? 'disabled' : ''}>-1</button>`
            : '';
        const stackValue = (Number(item.cost) || 0) * Math.max(1, qty);
        const costHtml = stackValue ? ` · <span title="Value of the stack">${typeof fmtCost === 'function' ? fmtCost(stackValue) : stackValue + ' gp'}</span>` : '';

        const row = document.createElement('div');
        row.style.cssText = `border: none; border-bottom: 1px dotted ${isDepleted ? 'var(--danger)' : 'var(--border-color)'}; border-radius: 0; padding: 10px 2px; background: ${isDepleted ? 'color-mix(in srgb, var(--danger) 6%, transparent)' : 'transparent'}; display: flex; flex-direction: column; gap: 6px;`;

        // Кнопка быстрого выстрела / расхода
        let quickActionButton = '';
        if (isAmmoOrConsumable) {
            const isMissileAmmo = item.category === 'ammo' || item.name.toLowerCase().includes('arrow') || item.name.toLowerCase().includes('bolt');
            const shootLabel = isMissileAmmo ? `-1 ${getIcon('bow', 13)} Shoot` : '-1 Use';
            quickActionButton = isDepleted
                ? `<button type="button" onclick="refillAmmunition(${originalIndex}, 20)" style="background: color-mix(in srgb, var(--accent-gold) 15%, transparent); border: 1px solid var(--accent-gold); color: var(--accent-gold); border-radius: 2px; padding: 2px 6px; font-size: 0.7rem; font-weight: bold; cursor: pointer;">+ Refill</button>`
                : `<button type="button" onclick="consumeAmmunition(${originalIndex}, 1)" style="background: color-mix(in srgb, var(--danger) 12%, transparent); border: 1px solid color-mix(in srgb, var(--danger) 40%, transparent); color: var(--danger); border-radius: 2px; padding: 2px 6px; font-size: 0.7rem; font-weight: bold; cursor: pointer;">${shootLabel}</button>`;
        }

        row.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 8px; overflow: hidden; flex: 1; min-width: 0;">
                    <span style="font-size: 0.75rem; color: ${isDepleted ? 'var(--danger)' : 'var(--accent-gold)'}; font-weight: bold; background: ${isDepleted ? 'color-mix(in srgb, var(--danger) 20%, transparent)' : 'var(--accent-gold-dim)'}; padding: 1px 6px; border-radius: 2px;">
                        ${isDepleted ? 'DEPLETED' : `x${qty}`}
                    </span>
                    <strong class="ledger-name" style="color: ${isDepleted ? 'var(--danger)' : 'var(--text-main)'}; white-space: nowrap; overflow: hidden; text-overflow: ellipsis;">${escapeHtml(item.name)}</strong>
                    ${magicBadge}
                    ${cursedBadge}
                    ${extraBadges.join('')}
                    ${item.forTrade ? '<span class="tag inv-trade-tag" title="Marked for trade">For trade</span>' : ''}
                    <select class="inv-loc-select" onchange="moveInventoryItem(${originalIndex}, this.value, this)" title="Where it is kept: choose another place to move it" aria-label="Move ${escapeHtml(item.name)}">${inventoryPlaces(item.location || 'Backpack').map(([v, l]) => `<option value="${escapeHtml(v)}" ${v === (item.location || 'Backpack') ? 'selected' : ''}>${escapeHtml(l)}</option>`).join('')}</select>
                </div>

                <div style="display: flex; align-items: center; gap: 8px; flex-shrink: 0;">
                    <span style="font-size: 0.8rem; color: ${isOutsidePC ? 'var(--good)' : 'var(--text-muted)'}; font-family: var(--font-headings);">
                        ${isOutsidePC ? '0 cn' : `${totalItemWeight} cn`}${costHtml}
                    </span>
                    ${chargeHtml}
                    ${quickActionButton}
                    <div style="display: flex; gap: 3px; align-items: center;">
                        <button type="button" onclick="adjustItemQty(${originalIndex}, -1)" class="icon-btn">-</button>
                        <button type="button" onclick="adjustItemQty(${originalIndex}, 1)" class="icon-btn">+</button>
                        ${hasDesc ? `<button type="button" id="inv-desc-toggle-${originalIndex}" onclick="toggleInvItemDesc(${originalIndex})" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; font-size: 0.7rem; padding: 0 3px;" title="Description">${getIcon('up', 15)}</button>` : ''}
                        ${typeof slotsForItem === 'function' && slotsForItem(item).length ? `<button type="button" onclick="equipInventoryItem(${originalIndex})" class="btn btn-sm" title="Put on or wield (${slotsForItem(item).map(s => SLOT_LABELS[s]).join(' or ')})">Equip</button>` : ''}
                        <button type="button" onclick="toggleItemForTrade(${originalIndex})" class="icon-btn inv-trade-btn${item.forTrade ? ' on' : ''}" title="${item.forTrade ? 'Marked for trade: click to keep it' : 'Mark for trade'}" aria-pressed="${item.forTrade ? 'true' : 'false'}" aria-label="${item.forTrade ? 'Unmark' : 'Mark'} ${escapeHtml(item.name)} for trade">${getIcon('coin', 14)}</button>
                        <button type="button" onclick="editInventoryItem(${originalIndex})" class="icon-btn" title="Edit item" aria-label="Edit ${escapeHtml(item.name)}">${getIcon('print', 14)}</button>
                        <button type="button" onclick="removeInventoryItem(${originalIndex})" class="icon-btn danger" title="Remove item" aria-label="Remove ${escapeHtml(item.name)}">${getIcon('close', 15)}</button>
                    </div>
                </div>
            </div>

            ${hasDesc ? `
                <div id="inv-desc-${originalIndex}" class="ledger-note" style="word-break: break-word;">
                    ${escapeHtml(item.desc)}
                </div>
            ` : ''}
        `;
        container.appendChild(row);
    });
}

function populateItemLocationSelect() {
    const select = document.getElementById('item-location-input');
    if (!select || !currentCharacter) return;
    select.innerHTML = `
        <option value="Carried">Carried / Belt</option>
        <option value="Backpack" selected>Backpack</option>
        <option value="Sack">Sack</option>
        <option value="Saddlebags">Saddlebags (General)</option>
        <option value="Vault">Vault / Stronghold</option>
    `;
    const bags = currentCharacter.bagsOfHolding || [];
    bags.forEach(bag => {
        const opt = document.createElement('option');
        opt.value = bag.id;
        opt.textContent = `[Bag] ${bag.name}`;
        select.appendChild(opt);
    });

    const mounts = currentCharacter.mounts || [];
    mounts.forEach(m => {
        const opt = document.createElement('option');
        opt.value = m.id;
        opt.textContent = `${m.name} (Saddlebags)`;
        select.appendChild(opt);
    });

    (currentCharacter.holdings || []).filter(h => h.status !== 'lost').forEach(h => {
        const opt = document.createElement('option');
        opt.value = h.id;
        opt.textContent = `[Home] ${h.name}`;
        select.appendChild(opt);
    });
}

let editingItemIndex = null;
function setItemModalMode(editing) {
    const title = document.getElementById('item-modal-title');
    const btn = document.getElementById('item-modal-save');
    if (title) title.innerText = editing ? 'Edit Inventory Item' : 'Add Inventory Item';
    if (btn) btn.innerText = editing ? 'Save Changes' : 'Add Item';
}
function editInventoryItem(index) {
    if (!currentCharacter || !Array.isArray(currentCharacter.inventory)) return;
    const item = currentCharacter.inventory[index];
    if (!item) return;
    openAddItemModal(item.category || 'equipment');
    editingItemIndex = index;
    setItemModalMode(true);
    safeSetVal('item-name-input', item.name || '');
    safeSetVal('item-qty-input', Number(item.qty) || 1);
    safeSetVal('item-weight-input', Number(item.weight) || 0);
    safeSetVal('item-magic-bonus', String(Number(item.magicBonus) || 0));
    safeSetVal('item-charges-input', item.charges ?? '');
    safeSetVal('item-desc-input', item.desc || '');
    const loc = document.getElementById('item-location-input');
    if (loc && item.location) { if (![...loc.options].some(o => o.value === item.location)) loc.add(new Option(item.location, item.location)); loc.value = item.location; }
    const cursedBox = document.getElementById('item-is-cursed'); if (cursedBox) cursedBox.checked = Boolean(item.isCursed);
    const concBox = document.getElementById('item-requires-concentration'); if (concBox) concBox.checked = Boolean(item.concentration);
    safeSetVal('item-slot-input', item.slot || '');
    const carried = document.getElementById('item-active-carried'); if (carried) carried.checked = Boolean(item.activeWhileCarried);
    safeSetVal('item-defence-kind', item.isShield ? 'shield' : (item.isArmor ? String(item.baseAC !== undefined && item.baseAC !== null ? Number(item.baseAC) : 7) : ''));
    safeSetVal('item-ac-bonus', !item.isShield && Number(item.acBonus) ? Number(item.acBonus) : '');
    safeSetVal('item-save-bonus', Number(item.saveBonus) ? Number(item.saveBonus) : '');
    const magicBox = document.getElementById('item-is-magic'); if (magicBox) magicBox.checked = item.magic === true || MAGIC_ITEM_GROUPS.includes(item.group);
    safeSetVal('item-magic-type', MAGIC_ITEM_GROUPS.includes(item.group) ? item.group : 'misc');
    const magicType = document.getElementById('item-magic-type'); if (magicType) magicType.disabled = !(magicBox && magicBox.checked);
    renderItemAbilityEffectRows(typeof itemAbilityMods === 'function' ? itemAbilityMods(item) : (item.abilityMods || []));
}

// ----- Ability-score effects in the item form -----
const ITEM_EFFECT_ABILITIES = [['strength', 'Strength'], ['intelligence', 'Intelligence'], ['wisdom', 'Wisdom'], ['dexterity', 'Dexterity'], ['constitution', 'Constitution'], ['charisma', 'Charisma']];
function itemEffectRowHtml(e) {
    return `<div class="item-effect-row">
        <select class="stat-input arc-input ie-ability" aria-label="Ability">${ITEM_EFFECT_ABILITIES.map(([k, n]) => `<option value="${k}" ${e.ability === k ? 'selected' : ''}>${n}</option>`).join('')}</select>
        <select class="stat-input arc-input ie-mode" aria-label="Effect">
            <option value="add" ${e.mode !== 'set' ? 'selected' : ''}>+/− (adds)</option>
            <option value="set" ${e.mode === 'set' ? 'selected' : ''}>set to</option>
        </select>
        <input type="number" class="stat-input arc-input ie-value" value="${Number(e.value) || 0}" min="-20" max="50" aria-label="Amount">
        <button type="button" class="icon-btn danger" onclick="this.closest('.item-effect-row').remove()" title="Remove effect" aria-label="Remove effect">${getIcon('close', 13)}</button>
    </div>`;
}
function renderItemAbilityEffectRows(list = []) {
    const box = document.getElementById('item-ability-effects');
    if (box) box.innerHTML = (list || []).map(itemEffectRowHtml).join('');
}
function addItemAbilityEffectRow() {
    const box = document.getElementById('item-ability-effects');
    if (box) box.insertAdjacentHTML('beforeend', itemEffectRowHtml({ ability: 'strength', mode: 'add', value: 1 }));
}
function readItemAbilityEffects() {
    return [...document.querySelectorAll('#item-ability-effects .item-effect-row')].map(r => ({
        ability: r.querySelector('.ie-ability').value,
        mode: r.querySelector('.ie-mode').value === 'set' ? 'set' : 'add',
        value: clampInt(r.querySelector('.ie-value').value, -20, 50, 0),
    })).filter(e => e.mode === 'set' || e.value !== 0);
}
// "STR 18", "DEX +1" tags for an item's ability effects.
function abilityEffectTags(item) {
    const mods = typeof itemAbilityMods === 'function' ? itemAbilityMods(item) : [];
    return mods.map(m => `<span class="tag" style="color: var(--good);" title="${m.mode === 'set' ? 'Sets' : 'Changes'} ${m.ability} ${m.mode === 'set' ? 'to' : 'by'} ${m.value}${item.activeWhileCarried ? ' while carried' : ' while worn'}">${m.ability.slice(0, 3).toUpperCase()} ${m.mode === 'set' ? m.value : (m.value > 0 ? '+' : '') + m.value}</span>`);
}
window.addItemAbilityEffectRow = addItemAbilityEffectRow;
function useItemCharge(index) {
    if (!currentCharacter || !Array.isArray(currentCharacter.inventory)) return;
    const item = currentCharacter.inventory[index];
    if (!item || item.charges === undefined || item.charges === null) return;
    item.charges = Math.max(0, (Number(item.charges) || 0) - 1);
    syncInventoryUI();
    if (typeof debouncedSave === 'function') debouncedSave();
}

function openAddItemModal(defaultCategory = 'equipment', opts = {}) {
    const modal = document.getElementById('item-modal');
    if (!modal) return;
    editingItemIndex = null;
    setItemModalMode(false);
    const errorEl = document.getElementById('item-modal-error');
    if (errorEl) errorEl.style.display = 'none';

    safeSetVal('item-name-input', '');
    safeSetVal('item-qty-input', defaultCategory === 'ammo' ? 20 : 1);
    safeSetVal('item-weight-input', defaultCategory === 'ammo' ? 1 : 10);
    safeSetVal('item-magic-bonus', '0');
    safeSetVal('item-charges-input', '');
    safeSetVal('item-desc-input', '');
    
    const catSelect = document.getElementById('item-category-select');
    if (catSelect) catSelect.value = defaultCategory;

    const cursedBox = document.getElementById('item-is-cursed');
    if (cursedBox) cursedBox.checked = false;
    const concBox = document.getElementById('item-requires-concentration');
    if (concBox) concBox.checked = false;
    safeSetVal('item-slot-input', '');
    const carried = document.getElementById('item-active-carried'); if (carried) carried.checked = false;
    safeSetVal('item-defence-kind', ''); safeSetVal('item-ac-bonus', ''); safeSetVal('item-save-bonus', '');
    const magicBox = document.getElementById('item-is-magic'); if (magicBox) magicBox.checked = Boolean(opts.magic);
    safeSetVal('item-magic-type', 'misc');
    const magicType = document.getElementById('item-magic-type'); if (magicType) magicType.disabled = !opts.magic;
    renderItemAbilityEffectRows([]);

    if (typeof populateItemLocationSelect === 'function') populateItemLocationSelect();
    modal.style.display = 'flex';
}

function saveInventoryItem() {
    if (!currentCharacter) return;
    const name = document.getElementById('item-name-input')?.value.trim();
    const category = document.getElementById('item-category-select')?.value || 'equipment';
    const qty = Math.max(1, Number(document.getElementById('item-qty-input')?.value) || 1);
    const weight = Math.max(0, Number(document.getElementById('item-weight-input')?.value) || 0);
    const location = document.getElementById('item-location-input')?.value || 'Backpack';
    const magicBonus = Number(document.getElementById('item-magic-bonus')?.value) || 0;
    const isCursed = document.getElementById('item-is-cursed')?.checked || false;
    const concentration = document.getElementById('item-requires-concentration')?.checked || false;
    const desc = document.getElementById('item-desc-input')?.value.trim() || '';
    const chargesVal = document.getElementById('item-charges-input')?.value;
    const charges = (chargesVal !== '' && !isNaN(chargesVal)) ? Number(chargesVal) : undefined;
    const slot = document.getElementById('item-slot-input')?.value || undefined;
    const activeWhileCarried = document.getElementById('item-active-carried')?.checked || false;
    const abilityMods = readItemAbilityEffects();
    const isMagic = document.getElementById('item-is-magic')?.checked || false;
    const magicType = document.getElementById('item-magic-type')?.value || 'misc';
    // Marked as a magic item: it goes to the Magic Items list; rings go on a finger, wands/staves/rods in the hand.
    const applyMagic = it => {
        if (isMagic) {
            it.magic = true;
            if (!it.isArmor && !it.isShield && it.category !== 'weapon' && it.category !== 'ammo') {
                it.group = magicType;
                if (magicType === 'ring') it.slot = 'ring';
                if (['potion', 'scroll'].includes(magicType)) it.category = 'consumable';
            }
        } else if (it.magic && !it.catalogId && !(Array.isArray(it.abilityMods) && it.abilityMods.length) && !it.acBonus && !it.saveBonus) {
            delete it.magic;
            if (MAGIC_ITEM_GROUPS.includes(it.group)) delete it.group;
        }
    };
    const defenceKind = document.getElementById('item-defence-kind')?.value || '';
    const acBonusIn = Math.max(0, Math.min(10, Number(document.getElementById('item-ac-bonus')?.value) || 0));
    const saveBonusIn = Math.max(0, Math.min(10, Number(document.getElementById('item-save-bonus')?.value) || 0));
    // Armour, shield, AC and save bonuses from the form (the paperdoll and saving throws read these).
    const applyDefence = it => {
        if (defenceKind === 'shield') {
            it.isShield = true; it.acBonus = 1; delete it.isArmor; delete it.baseAC; delete it.slot; it.group = it.group || 'armour';
        } else if (defenceKind !== '') {
            it.isArmor = true; it.baseAC = Number(defenceKind); delete it.isShield; delete it.slot; it.group = it.group || 'armour';
            if (acBonusIn) it.acBonus = acBonusIn; else delete it.acBonus;
        } else {
            if (it.isArmor || it.isShield) { delete it.isArmor; delete it.isShield; delete it.baseAC; if (it.group === 'armour') delete it.group; }
            if (acBonusIn) it.acBonus = acBonusIn; else delete it.acBonus;
        }
        if (saveBonusIn) it.saveBonus = saveBonusIn; else delete it.saveBonus;
        if (it.acBonus && !it.isShield || it.saveBonus) it.magic = true;
    };
    const errorEl = document.getElementById('item-modal-error');

    if (!name) {
        if (errorEl) { errorEl.innerText = 'Please enter an item name.'; errorEl.style.display = 'block'; }
        return;
    }

    if (!Array.isArray(currentCharacter.inventory)) currentCharacter.inventory = [];
    if (editingItemIndex !== null && currentCharacter.inventory[editingItemIndex]) {
        // Keep catalogue data (weapon id, armour AC, talents...) and change what the form shows.
        const it = currentCharacter.inventory[editingItemIndex];
        Object.assign(it, { name, category, qty, weight, location, magicBonus, isCursed, concentration, charges, desc, activeWhileCarried, abilityMods });
        if (it.category !== 'weapon') applyDefence(it);
        applyMagic(it);
        // Weapons, armour and wands keep their own slot rules; anything else may be given a worn slot.
        if (!it.isArmor && !it.isShield && it.category !== 'weapon' && !['wand', 'staff', 'rod'].includes(it.group)) { if (slot) it.slot = slot; else if (it.group !== 'ring') delete it.slot; }
        editingItemIndex = null;
        closeAddItemModal();
        if (typeof debouncedSave === 'function') debouncedSave();
        syncInventoryUI();
        if (typeof afterEquipChange === 'function') afterEquipChange();
        return;
    }
    const fresh = {
        name,
        category, // 'weapon' | 'ammo' | 'consumable' | 'equipment'
        qty,
        weight,
        location,
        magicBonus,
        isCursed,
        concentration,
        charges,
        desc,
        isValuable: false,
        ...(slot && category !== 'weapon' && category !== 'ammo' ? { slot } : {}),
        ...(abilityMods.length ? { abilityMods, magic: true } : {}),
        ...(activeWhileCarried ? { activeWhileCarried } : {}),
    };
    if (category !== 'weapon' && category !== 'ammo') applyDefence(fresh);
    applyMagic(fresh);
    currentCharacter.inventory.push(fresh);

    closeAddItemModal();
    if (typeof debouncedSave === 'function') debouncedSave();
    syncInventoryUI();
    if ((abilityMods.length || (activeWhileCarried && (fresh.acBonus || fresh.saveBonus))) && typeof afterEquipChange === 'function') afterEquipChange();
}

function closeAddItemModal() {
    const modal = document.getElementById('item-modal');
    if (modal) modal.style.display = 'none';
}

function handleItemModalBackdrop(event) {
    if (event.target && event.target.id === 'item-modal') closeAddItemModal();
}

function adjustItemQty(index, delta) {
    if (!currentCharacter || !Array.isArray(currentCharacter.inventory)) return;
    const item = currentCharacter.inventory[index];
    if (!item) return;
    item.qty = Number(item.qty) + delta;
    if (item.qty <= 0) {
        currentCharacter.inventory.splice(index, 1);
    }
    if (typeof debouncedSave === 'function') debouncedSave();
    syncInventoryUI();
}

async function removeInventoryItem(index) {
    if (!currentCharacter || !Array.isArray(currentCharacter.inventory)) return;
    const isConfirmed = await sheetConfirm('Delete this item from inventory?', 'Remove');
    if (!isConfirmed) return;
    const removed = currentCharacter.inventory[index];
    currentCharacter.inventory.splice(index, 1);
    if (removed && removed.activeWhileCarried && typeof afterEquipChange === 'function') setTimeout(afterEquipChange, 0);
    if (typeof debouncedSave === 'function') debouncedSave();
    syncInventoryUI();
}

// Слушатели живого ввода для монет кошелька и хранилища
['coin-cp', 'coin-sp', 'coin-ep', 'coin-gp', 'coin-pp'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('input', (e) => {
            if (!currentCharacter) return;
            if (!currentCharacter.coins) currentCharacter.coins = {};
            const coinKey = id.replace('coin-', '');
            currentCharacter.coins[coinKey] = Math.max(0, Number(e.target.value) || 0);
            
            const totalWeight = calculateCarriedWeight(currentCharacter);
            const weightEl = document.getElementById('inv-total-weight');
            if (weightEl) weightEl.innerText = totalWeight;
            syncInventoryUI();
            if (typeof debouncedSave === 'function') debouncedSave();
        });
    }
});

['vault-cp', 'vault-sp', 'vault-ep', 'vault-gp', 'vault-pp'].forEach(id => {
    const el = document.getElementById(id);
    if (el) {
        el.addEventListener('input', (e) => {
            if (!currentCharacter) return;
            if (!currentCharacter.vaultCoins) currentCharacter.vaultCoins = {};
            const coinKey = id.replace('vault-', '');
            currentCharacter.vaultCoins[coinKey] = Math.max(0, Number(e.target.value) || 0);
            if (typeof debouncedSave === 'function') debouncedSave();
        });
    }
});

let currentTransferDirection = 'deposit'; // 'deposit' (Pouch -> Vault) | 'withdraw' (Vault -> Pouch)

function openCoinTransferModal() {
    const modal = document.getElementById('coin-transfer-modal');
    if (!modal) return;
    const err = document.getElementById('transfer-modal-error');
    if (err) err.style.display = 'none';
    setTransferDirection('deposit');
    updateTransferBalancePreview();
    modal.style.display = 'flex';
}

function closeCoinTransferModal() {
    const modal = document.getElementById('coin-transfer-modal');
    if (modal) modal.style.display = 'none';
}

function handleCoinTransferModalBackdrop(event) {
    if (event.target && event.target.id === 'coin-transfer-modal') closeCoinTransferModal();
}

function setTransferDirection(dir) {
    currentTransferDirection = dir;
    const depBtn = document.getElementById('transfer-dir-deposit');
    const witBtn = document.getElementById('transfer-dir-withdraw');
    if (dir === 'deposit') {
        if (depBtn) { depBtn.style.background = 'var(--accent-gold)'; depBtn.style.color = 'var(--on-accent)'; }
        if (witBtn) { witBtn.style.background = 'transparent'; witBtn.style.color = 'var(--text-muted)'; }
    } else {
        if (witBtn) { witBtn.style.background = 'var(--accent-gold)'; witBtn.style.color = 'var(--on-accent)'; }
        if (depBtn) { depBtn.style.background = 'transparent'; depBtn.style.color = 'var(--text-muted)'; }
    }
    updateTransferBalancePreview();
}

function getSourceCoinsObject() {
    if (!currentCharacter) return {};
    return (currentTransferDirection === 'deposit') ? (currentCharacter.coins || {}) : (currentCharacter.vaultCoins || {});
}

function updateTransferBalancePreview() {
    const coinType = document.getElementById('transfer-coin-select')?.value || 'gp';
    const source = getSourceCoinsObject();
    const available = Number(source[coinType]) || 0;
    const balEl = document.getElementById('transfer-source-balance');
    if (balEl) {
        balEl.innerText = `Available: ${available} ${coinType.toUpperCase()}`;
    }
}

function setTransferAmountPreset(delta) {
    const input = document.getElementById('transfer-amount-input');
    if (!input) return;
    const current = Number(input.value) || 0;
    input.value = current + delta;
}

function setTransferMaxAmount() {
    const coinType = document.getElementById('transfer-coin-select')?.value || 'gp';
    const source = getSourceCoinsObject();
    const available = Number(source[coinType]) || 0;
    const input = document.getElementById('transfer-amount-input');
    if (input) input.value = available;
}

function executeCoinTransfer() {
    if (!currentCharacter) return;
    const coinType = document.getElementById('transfer-coin-select')?.value || 'gp';
    const amount = Math.max(1, Number(document.getElementById('transfer-amount-input')?.value) || 0);
    const errEl = document.getElementById('transfer-modal-error');

    if (!currentCharacter.coins) currentCharacter.coins = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
    if (!currentCharacter.vaultCoins) currentCharacter.vaultCoins = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };

    const source = (currentTransferDirection === 'deposit') ? currentCharacter.coins : currentCharacter.vaultCoins;
    const target = (currentTransferDirection === 'deposit') ? currentCharacter.vaultCoins : currentCharacter.coins;
    const currentAvailable = Number(source[coinType]) || 0;

    if (amount <= 0) {
        if (errEl) { errEl.innerText = 'Please enter an amount greater than 0.'; errEl.style.display = 'block'; }
        return;
    }

    if (amount > currentAvailable) {
        if (errEl) { errEl.innerText = `Not enough ${coinType.toUpperCase()}! You only have ${currentAvailable}.`; errEl.style.display = 'block'; }
        return;
    }

    source[coinType] = currentAvailable - amount;
    target[coinType] = (Number(target[coinType]) || 0) + amount;

    closeCoinTransferModal();
    syncInventoryUI();
    if (typeof debouncedSave === 'function') debouncedSave();
}

// Rules Cyclopedia p. 237: a bag of holding holds 10,000 cn yet weighs only 600 cn when full.
// It weighs in proportion to its load (6% of the contents), and at least as much as the empty bag.
const BAG_OF_HOLDING_EMPTY_CN = 10;
function bagOfHoldingWeight(contentsWeight) {
    return Math.max(BAG_OF_HOLDING_EMPTY_CN, Math.round((Number(contentsWeight) || 0) * 600 / 10000));
}

function addNewBagOfHolding() {
    if (!currentCharacter) return;
    if (!Array.isArray(currentCharacter.bagsOfHolding)) currentCharacter.bagsOfHolding = [];
    const count = currentCharacter.bagsOfHolding.length + 1;
    currentCharacter.bagsOfHolding.push({
        id: 'boh_' + Date.now(),
        name: `Bag of Holding #${count}`,
        location: 'Carried', // 'Carried' | 'Vault'
        coins: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }
    });
    if (typeof debouncedSave === 'function') debouncedSave();
    syncInventoryUI();
}

async function removeBagOfHolding(bagId) {
    if (!currentCharacter || !Array.isArray(currentCharacter.bagsOfHolding)) return;
    const bag = currentCharacter.bagsOfHolding.find(b => b.id === bagId);
    if (!bag) return;

    const items = currentCharacter.inventory || [];
    const contentsWeight = getBagContentsWeight(bag, items);
    if (contentsWeight > 0) {
        alert('Cannot remove Bag of Holding: empty its coins and items first!');
        return;
    }

    const isConfirmed = await sheetConfirm(`Remove ${bag.name}?`, 'Remove');
    if (!isConfirmed) return;

    currentCharacter.bagsOfHolding = currentCharacter.bagsOfHolding.filter(b => b.id !== bagId);
    if (typeof debouncedSave === 'function') debouncedSave();
    syncInventoryUI();
}

function toggleBagLocation(bagId) {
    if (!currentCharacter || !Array.isArray(currentCharacter.bagsOfHolding)) return;
    const bag = currentCharacter.bagsOfHolding.find(b => b.id === bagId);
    if (!bag) return;
    bag.location = (bag.location === 'Vault') ? 'Carried' : 'Vault';
    if (typeof debouncedSave === 'function') debouncedSave();
    syncInventoryUI();
}

function renderBagsOfHolding() {
    const container = document.getElementById('bags-container');
    if (!container || !currentCharacter) return;
    container.innerHTML = '';

    const bags = currentCharacter.bagsOfHolding || [];
    const items = currentCharacter.inventory || [];

    if (bags.length === 0) {
        container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; grid-column: 1/-1;">No Bags of Holding owned. Click "+ Add Bag of Holding" if your character has found one.</div>';
        return;
    }

    bags.forEach(bag => {
        const contentsWeight = getBagContentsWeight(bag, items);
        const pct = Math.min(100, Math.round((contentsWeight / 10000) * 100));
        const isOverfilled = contentsWeight > 10000;
        const isCarried = bag.location !== 'Vault';
        const effectiveWeight = isCarried ? bagOfHoldingWeight(contentsWeight) : 0;

        const coins = bag.coins || {};
        let coinStrings = [];
        if (coins.pp > 0) coinStrings.push(`${coins.pp} PP`);
        if (coins.gp > 0) coinStrings.push(`${coins.gp} GP`);
        if (coins.ep > 0) coinStrings.push(`${coins.ep} EP`);
        if (coins.sp > 0) coinStrings.push(`${coins.sp} SP`);
        if (coins.cp > 0) coinStrings.push(`${coins.cp} CP`);
        const coinsDisplay = coinStrings.length > 0 ? coinStrings.join(', ') : 'No coins';

        const card = document.createElement('div');
        card.style.cssText = 'background: var(--inset); border: 1px solid var(--border-color); border-radius: 2px; padding: 12px; display: flex; flex-direction: column; gap: 8px;';
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div>
                    <strong style="color: var(--accent-gold); font-size: 0.95rem; display: inline-flex; align-items: center; gap: 5px;">${getIcon('bag', 15)} ${escapeHtml(bag.name)}</strong>
                    <div style="font-size: 0.7rem; color: var(--text-muted);">
                        Carried Weight: <span style="color: ${isCarried ? 'var(--text-main)' : 'var(--good)'}; font-weight: bold;">${effectiveWeight} cn</span> (${isCarried ? 'on person' : 'in Vault'})
                    </div>
                </div>
                <div style="display: flex; gap: 4px; align-items: center;">
                    <button type="button" onclick="toggleBagLocation('${bag.id}')" style="background: transparent; border: 1px solid ${isCarried ? 'var(--info)' : 'var(--accent-gold)'}; color: ${isCarried ? 'var(--info)' : 'var(--accent-gold)'}; border-radius: 2px; padding: 2px 6px; font-size: 0.65rem; cursor: pointer;">
                        ${isCarried ? `${getIcon('arrowRight', 14)} Put in Vault` : `${getIcon('arrowLeft', 14)} Carry Bag`}
                    </button>
                    <button type="button" onclick="removeBagOfHolding('${bag.id}')" style="background: transparent; border: none; color: var(--danger); cursor: pointer; font-size: 0.85rem; padding: 0 4px;" title="Delete empty bag" aria-label="Delete bag">${getIcon('close', 15)}</button>
                </div>
            </div>

            <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 3px;">
                    <span style="color: var(--text-muted);">Inside: <strong style="color: ${isOverfilled ? 'var(--danger)' : 'var(--text-main)'};">${contentsWeight}</strong> / 10,000 cn</span>
                    <span style="color: ${isOverfilled ? 'var(--danger)' : 'var(--text-muted)'};">${pct}%</span>
                </div>
                <div style="background: var(--shadow); border: 1px solid var(--border-color); height: 6px; border-radius: 2px; overflow: hidden;">
                    <div style="width: ${pct}%; height: 100%; background: ${isOverfilled ? 'var(--danger)' : (pct > 80 ? 'var(--warn-strong)' : 'var(--good)')};"></div>
                </div>
            </div>

            <div style="background: color-mix(in srgb, var(--text-main) 3%, transparent); border: 1px solid color-mix(in srgb, var(--text-main) 5%, transparent); border-radius: 2px; padding: 6px 8px; display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 0.75rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px; display: flex; align-items: center; gap: 4px;">
                    ${typeof getIcon === 'function' ? getIcon('coin', 14) : ''}
                    <span>${coinsDisplay}</span>
                </div>
                <button type="button" onclick="openBagCoinModal('${bag.id}')" style="background: transparent; border: 1px solid var(--accent-gold); color: var(--accent-gold); border-radius: 2px; padding: 2px 6px; font-size: 0.65rem; cursor: pointer;">Transfer Coins</button>
            </div>
        `;
        container.appendChild(card);
    });
}

let currentActiveBagId = null;
let bagCoinDirection = 'in'; // 'in': Pouch -> Bag, 'out': Bag -> Pouch

function openBagCoinModal(bagId) {
    currentActiveBagId = bagId;
    const bag = (currentCharacter.bagsOfHolding || []).find(b => b.id === bagId);
    if (!bag) return;
    const modal = document.getElementById('bag-coin-modal');
    const title = document.getElementById('bag-coin-title');
    const err = document.getElementById('bag-coin-error');
    if (err) err.style.display = 'none';
    if (title) title.innerText = `Coins: ${bag.name}`;
    setBagCoinDirection('in');
    if (modal) modal.style.display = 'flex';
}

function closeBagCoinModal() {
    const modal = document.getElementById('bag-coin-modal');
    if (modal) modal.style.display = 'none';
    currentActiveBagId = null;
}

function handleBagCoinModalBackdrop(event) {
    if (event.target && event.target.id === 'bag-coin-modal') closeBagCoinModal();
}

function setBagCoinDirection(dir) {
    bagCoinDirection = dir;
    const inBtn = document.getElementById('bag-dir-in');
    const outBtn = document.getElementById('bag-dir-out');
    if (dir === 'in') {
        if (inBtn) { inBtn.style.background = 'var(--accent-gold)'; inBtn.style.color = 'var(--on-accent)'; }
        if (outBtn) { outBtn.style.background = 'transparent'; outBtn.style.color = 'var(--text-muted)'; }
    } else {
        if (outBtn) { outBtn.style.background = 'var(--accent-gold)'; outBtn.style.color = 'var(--on-accent)'; }
        if (inBtn) { inBtn.style.background = 'transparent'; inBtn.style.color = 'var(--text-muted)'; }
    }
    updateBagCoinPreview();
}

function updateBagCoinPreview() {
    const coinType = document.getElementById('bag-coin-select')?.value || 'gp';
    const bag = (currentCharacter.bagsOfHolding || []).find(b => b.id === currentActiveBagId);
    const availEl = document.getElementById('bag-coin-available');
    if (!bag || !availEl) return;

    const source = (bagCoinDirection === 'in') ? (currentCharacter.coins || {}) : (bag.coins || {});
    const count = Number(source[coinType]) || 0;
    availEl.innerText = `Available: ${count} ${coinType.toUpperCase()}`;
}

function executeBagCoinTransfer() {
    const bag = (currentCharacter.bagsOfHolding || []).find(b => b.id === currentActiveBagId);
    if (!bag || !currentCharacter) return;
    if (!bag.coins) bag.coins = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
    if (!currentCharacter.coins) currentCharacter.coins = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };

    const coinType = document.getElementById('bag-coin-select')?.value || 'gp';
    const amount = Math.max(1, Number(document.getElementById('bag-coin-amount')?.value) || 0);
    const errEl = document.getElementById('bag-coin-error');

    const source = (bagCoinDirection === 'in') ? currentCharacter.coins : bag.coins;
    const target = (bagCoinDirection === 'in') ? bag.coins : currentCharacter.coins;
    const avail = Number(source[coinType]) || 0;

    if (amount > avail) {
        if (errEl) { errEl.innerText = `Not enough ${coinType.toUpperCase()}! You only have ${avail}.`; errEl.style.display = 'block'; }
        return;
    }

    if (bagCoinDirection === 'in') {
        const currentInside = getBagContentsWeight(bag, currentCharacter.inventory || []);
        if (currentInside + amount > 10000) {
            if (errEl) { errEl.innerText = `Exceeds 10,000 cn capacity! Available room: ${10000 - currentInside} cn.`; errEl.style.display = 'block'; }
            return;
        }
    }

    source[coinType] = avail - amount;
    target[coinType] = (Number(target[coinType]) || 0) + amount;

    closeBagCoinModal();
    syncInventoryUI();
    if (typeof debouncedSave === 'function') debouncedSave();
}

function renderMounts() {
    const container = document.getElementById('mounts-container');
    if (!container || !currentCharacter) return;
    container.innerHTML = '';

    const mounts = currentCharacter.mounts || [];
    const items = currentCharacter.inventory || [];

    if (mounts.length === 0) {
        container.innerHTML = '<div style="color: var(--text-muted); font-size: 0.85rem; grid-column: 1/-1;">No mounts or transport assigned. Click "+ Add Mount / Cart" if the party bought mules or horses.</div>';
        return;
    }

    mounts.forEach(mount => {
        const typeDef = MOUNT_TYPES_DB[mount.type] || MOUNT_TYPES_DB['mule'];
        const currentWeight = getMountContentsWeight(mount, items);
        const maxWeight = mount.customMax || typeDef.max;
        const normalWeight = mount.customNormal || typeDef.normal;
        const pct = Math.min(100, Math.round((currentWeight / maxWeight) * 100));

        let statusLabel = `Normal Load (${typeDef.speedNormal})`;
        let statusColor = 'var(--good)';
        let statusBg = 'color-mix(in srgb, var(--good) 15%, transparent)';

        if (currentWeight > maxWeight) {
            statusLabel = 'Overburdened (Cannot Move)';
            statusColor = 'var(--danger)';
            statusBg = 'color-mix(in srgb, var(--danger) 15%, transparent)';
        } else if (currentWeight > normalWeight) {
            statusLabel = `Half Speed (${typeDef.speedLoaded})`;
            statusColor = 'var(--warn-strong)';
            statusBg = 'color-mix(in srgb, var(--warn-strong) 15%, transparent)';
        }

        const coins = mount.coins || {};
        let coinStrings = [];
        if (coins.pp > 0) coinStrings.push(`${coins.pp} PP`);
        if (coins.gp > 0) coinStrings.push(`${coins.gp} GP`);
        if (coins.ep > 0) coinStrings.push(`${coins.ep} EP`);
        if (coins.sp > 0) coinStrings.push(`${coins.sp} SP`);
        if (coins.cp > 0) coinStrings.push(`${coins.cp} CP`);
        const coinsDisplay = coinStrings.length > 0 ? coinStrings.join(', ') : 'Empty';

        const card = document.createElement('div');
        card.style.cssText = 'background: var(--inset); border: 1px solid var(--border-color); border-radius: 2px; padding: 12px; display: flex; flex-direction: column; gap: 8px;';
        card.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: flex-start;">
                <div style="display: flex; align-items: center; gap: 8px;">
                    ${typeof getIcon === 'function' ? getIcon(typeDef.icon, 20) : ''}
                    <div>
                        <strong style="color: var(--accent-gold); font-size: 0.95rem;">${escapeHtml(mount.name)}</strong>
                        <div style="font-size: 0.7rem; color: var(--text-muted);">${typeDef.name}</div>
                    </div>
                </div>
                <div style="display: flex; gap: 4px; align-items: center;">
                    <div style="font-size: 0.68rem; font-weight: bold; padding: 2px 6px; border-radius: 2px; background: ${statusBg}; color: ${statusColor}; border: 1px solid ${statusColor};">${statusLabel}</div>
                    <button type="button" onclick="removeMount('${mount.id}')" style="background: transparent; border: none; color: var(--danger); cursor: pointer; font-size: 0.85rem; padding: 0 4px;" title="Remove mount" aria-label="Remove mount">${getIcon('close', 15)}</button>
                </div>
            </div>

            <div>
                <div style="display: flex; justify-content: space-between; font-size: 0.75rem; margin-bottom: 3px;">
                    <span style="color: var(--text-muted);">Cargo: <strong style="color: ${statusColor};">${currentWeight}</strong> / ${maxWeight} cn</span>
                    <span style="color: var(--text-muted); font-size: 0.7rem;">Normal: ≤${normalWeight} cn</span>
                </div>
                <div style="background: var(--shadow); border: 1px solid var(--border-color); height: 6px; border-radius: 2px; overflow: hidden;">
                    <div style="width: ${pct}%; height: 100%; background: ${statusColor}; transition: width 0.3s;"></div>
                </div>
            </div>

            <div style="background: color-mix(in srgb, var(--text-main) 3%, transparent); border: 1px solid color-mix(in srgb, var(--text-main) 5%, transparent); border-radius: 2px; padding: 6px 8px; display: flex; justify-content: space-between; align-items: center;">
                <div style="font-size: 0.75rem; color: var(--text-muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; max-width: 200px; display: flex; align-items: center; gap: 4px;">
                    ${typeof getIcon === 'function' ? getIcon('coin', 14) : ''}
                    <span>${coinsDisplay}</span>
                </div>
                <button type="button" onclick="openMountCoinModal('${mount.id}')" style="background: transparent; border: 1px solid var(--accent-gold); color: var(--accent-gold); border-radius: 2px; padding: 2px 6px; font-size: 0.65rem; cursor: pointer;">Transfer Coins</button>
            </div>
        `;
        container.appendChild(card);
    });
}

function openAddMountModal() {
    const modal = document.getElementById('mount-modal');
    if (!modal) return;
    const err = document.getElementById('mount-modal-error');
    if (err) err.style.display = 'none';
    safeSetVal('mount-name-input', '');
    const sel = document.getElementById('mount-type-select');
    if (sel) {
        const keep = sel.value || 'riding_horse';
        sel.innerHTML = Object.entries(MOUNT_TYPES_DB).map(([k, m]) => `<option value="${k}">${escapeHtml(m.name)} (${m.normal.toLocaleString('en-US')} / ${m.max.toLocaleString('en-US')} cn)</option>`).join('');
        sel.value = MOUNT_TYPES_DB[keep] ? keep : 'riding_horse';
    }
    modal.style.display = 'flex';
}

function closeAddMountModal() {
    const modal = document.getElementById('mount-modal');
    if (modal) modal.style.display = 'none';
}

function handleMountModalBackdrop(event) {
    if (event.target && event.target.id === 'mount-modal') closeAddMountModal();
}

function saveNewMount() {
    console.log('saveNewMount triggered');
    if (!currentCharacter) {
        alert('No character loaded!');
        return;
    }

    const nameInput = document.getElementById('mount-name-input');
    const typeSelect = document.getElementById('mount-type-select');
    const errEl = document.getElementById('mount-modal-error');

    const name = nameInput ? nameInput.value.trim() : '';
    const type = typeSelect ? typeSelect.value : 'riding_horse';

    if (!name) {
        if (errEl) {
            errEl.innerText = 'Please enter a name for the mount or transport.';
            errEl.style.display = 'block';
        } else {
            alert('Please enter a name for the mount or transport.');
        }
        return;
    }

    if (errEl) errEl.style.display = 'none';

    if (!Array.isArray(currentCharacter.mounts)) {
        currentCharacter.mounts = [];
    }

    const newMount = {
        id: 'mount_' + Date.now(),
        name: name,
        type: type,
        coins: { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 }
    };

    currentCharacter.mounts.push(newMount);

    closeAddMountModal();
    
    try {
        syncInventoryUI();
    } catch (e) {
        console.error('Error during syncInventoryUI after adding mount:', e);
    }

    if (typeof debouncedSave === 'function') debouncedSave();
}

async function removeMount(mountId) {
    if (!currentCharacter || !Array.isArray(currentCharacter.mounts)) return;
    const mount = currentCharacter.mounts.find(m => m.id === mountId);
    if (!mount) return;

    const items = currentCharacter.inventory || [];
    const cargoWeight = getMountContentsWeight(mount, items);
    if (cargoWeight > 0) {
        alert('Cannot remove mount: unload all items and saddlebag coins first!');
        return;
    }

    const isConfirmed = await sheetConfirm(`Remove ${mount.name} from party?`, 'Remove');
    if (!isConfirmed) return;

    currentCharacter.mounts = currentCharacter.mounts.filter(m => m.id !== mountId);
    syncInventoryUI();
    if (typeof debouncedSave === 'function') debouncedSave();
}

let activeMountCoinId = null;
let mountCoinDirection = 'in'; // 'in': Pouch -> Mount, 'out': Mount -> Pouch

function openMountCoinModal(mountId) {
    activeMountCoinId = mountId;
    const mount = (currentCharacter.mounts || []).find(m => m.id === mountId);
    if (!mount) return;
    const modal = document.getElementById('mount-coin-modal');
    const title = document.getElementById('mount-coin-title');
    const err = document.getElementById('mount-coin-error');
    if (err) err.style.display = 'none';
    if (title) title.innerText = `Saddlebags: ${mount.name}`;
    setMountCoinDirection('in');
    if (modal) modal.style.display = 'flex';
}

function closeMountCoinModal() {
    const modal = document.getElementById('mount-coin-modal');
    if (modal) modal.style.display = 'none';
    activeMountCoinId = null;
}

function handleMountCoinModalBackdrop(event) {
    if (event.target && event.target.id === 'mount-coin-modal') closeMountCoinModal();
}

function setMountCoinDirection(dir) {
    mountCoinDirection = dir;
    const inBtn = document.getElementById('mount-dir-in');
    const outBtn = document.getElementById('mount-dir-out');
    if (dir === 'in') {
        if (inBtn) { inBtn.style.background = 'var(--accent-gold)'; inBtn.style.color = 'var(--on-accent)'; }
        if (outBtn) { outBtn.style.background = 'transparent'; outBtn.style.color = 'var(--text-muted)'; }
    } else {
        if (outBtn) { outBtn.style.background = 'var(--accent-gold)'; outBtn.style.color = 'var(--on-accent)'; }
        if (inBtn) { inBtn.style.background = 'transparent'; inBtn.style.color = 'var(--text-muted)'; }
    }
    updateMountCoinPreview();
}

function updateMountCoinPreview() {
    const coinType = document.getElementById('mount-coin-select')?.value || 'gp';
    const mount = (currentCharacter.mounts || []).find(m => m.id === activeMountCoinId);
    const availEl = document.getElementById('mount-coin-available');
    if (!mount || !availEl) return;

    const source = (mountCoinDirection === 'in') ? (currentCharacter.coins || {}) : (mount.coins || {});
    const count = Number(source[coinType]) || 0;
    availEl.innerText = `Available: ${count} ${coinType.toUpperCase()}`;
}

function executeMountCoinTransfer() {
    const mount = (currentCharacter.mounts || []).find(m => m.id === activeMountCoinId);
    if (!mount || !currentCharacter) return;
    if (!mount.coins) mount.coins = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
    if (!currentCharacter.coins) currentCharacter.coins = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };

    const coinType = document.getElementById('mount-coin-select')?.value || 'gp';
    const amount = Math.max(1, Number(document.getElementById('mount-coin-amount')?.value) || 0);
    const errEl = document.getElementById('mount-coin-error');

    const source = (mountCoinDirection === 'in') ? currentCharacter.coins : mount.coins;
    const target = (mountCoinDirection === 'in') ? mount.coins : currentCharacter.coins;
    const avail = Number(source[coinType]) || 0;

    if (amount > avail) {
        if (errEl) { errEl.innerText = `Not enough ${coinType.toUpperCase()}! You only have ${avail}.`; errEl.style.display = 'block'; }
        return;
    }

    source[coinType] = avail - amount;
    target[coinType] = (Number(target[coinType]) || 0) + amount;

    closeMountCoinModal();
    syncInventoryUI();
    if (typeof debouncedSave === 'function') debouncedSave();
}

window.openAddMountModal = openAddMountModal;
window.closeAddMountModal = closeAddMountModal;
window.handleMountModalBackdrop = handleMountModalBackdrop;
window.saveNewMount = saveNewMount;
window.removeMount = removeMount;
window.openMountCoinModal = openMountCoinModal;
window.closeMountCoinModal = closeMountCoinModal;
window.handleMountCoinModalBackdrop = handleMountCoinModalBackdrop;
window.setMountCoinDirection = setMountCoinDirection;
window.updateMountCoinPreview = updateMountCoinPreview;
window.executeMountCoinTransfer = executeMountCoinTransfer;
window.renderMounts = renderMounts;
window.consumeAmmunition = consumeAmmunition;
window.refillAmmunition = refillAmmunition;
window.renderWeaponsList = renderWeaponsList;
window.renderEquipmentList = renderEquipmentList;

// The Show list closes when you click anywhere else.
document.addEventListener('click', e => {
    const dd = document.getElementById('inv-show');
    if (dd && dd.open && !dd.contains(e.target)) dd.open = false;
});
