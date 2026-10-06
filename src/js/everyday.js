// js/everyday.js — everyday conveniences: daily uses of abilities, and supplies & light.
// Both follow the game calendar: uses refill as days (weeks, months) pass, rations are eaten
// and lights burn out (calendar.js calls everydayTimePassed).

// ---------------------------------------------------------------------------
// Daily uses (Class Abilities tab)
const DU_PERIODS = { day: 'a day', week: 'a week', month: 'a month' };

function dailyUsesList() {
    if (!currentCharacter) return [];
    if (!Array.isArray(currentCharacter.dailyUses)) currentCharacter.dailyUses = [];
    return currentCharacter.dailyUses;
}

// Uses a day/week/month read from an ability's text ("three times a day", "once a day per
// three levels"...). Returns { count, per } or null.
const DU_WORDS = { once: 1, twice: 2, 'three times': 3, 'four times': 4, 'five times': 5, 'six times': 6 };
function parseUsesFromText(text, level) {
    const re = /\b(once|twice|three times|four times|five times|six times|(\d+) times)\s+(?:a|per|each)\s+(day|week|month)(?:\s+per\s+(level|two levels|three levels|four levels|five levels|(\d+) levels))?/i;
    const m = re.exec(String(text || ''));
    if (!m) return null;
    let count = m[2] ? Number(m[2]) : DU_WORDS[m[1].toLowerCase()] || 1;
    const per = m[3].toLowerCase();
    // "once a day at 5th level and one more time a day every two levels" (pooka haste).
    const grow = /at (\d+)\w* level,? and one more(?: time)? (?:a|per) (?:day|week|month) (?:every|with every) (two|three|four|five|\d+) levels/i.exec(String(text || ''));
    if (grow) {
        const n = { two: 2, three: 3, four: 4, five: 5 }[grow[2].toLowerCase()] || Number(grow[2]) || 2;
        count += Math.max(0, Math.floor(((Number(level) || 1) - Number(grow[1])) / n));
    }
    if (m[4]) {
        const lv = Math.max(1, Number(level) || 1);
        const stepWords = { level: 1, 'two levels': 2, 'three levels': 3, 'four levels': 4, 'five levels': 5 };
        const step = m[5] ? Number(m[5]) : (stepWords[m[4].toLowerCase()] || 1);
        const roundUp = /rounded up/i.test(text);
        count = Math.max(1, count * (roundUp ? Math.ceil(lv / step) : Math.floor(lv / step)));
    }
    return { count, per };
}

// Abilities of the class (and sub-class) at this level that say how often they can be used.
// Every ability with limited uses at the character's level: [{ name, max, per }].
function limitedUseAbilities(ch) {
    if (!ch || typeof ClassesDatabase === 'undefined') return [];
    const level = Number(ch.level) || 1;
    const feats = [];
    (ClassesDatabase[ch.characterClass]?.features || []).filter(f => level >= f.minLevel).forEach(f => feats.push(f));
    const opt = typeof getClassOption === 'function' ? getClassOption(ch) : null;
    const optLevel = opt?.ownXpTrack ? (Number(ch.subClassLevel) || 1) : level;
    (opt?.features || []).filter(f => optLevel >= f.minLevel).forEach(f => feats.push({ ...f, _lvl: optLevel }));
    const out = [];
    feats.forEach(f => { const u = parseUsesFromText(f.description, f._lvl || level); if (u) out.push({ name: f.name, max: u.count, per: u.per }); });
    return out;
}
// At a new level: tracked uses whose number grows ({ entry, max }), and new abilities not yet tracked.
function dailyUseChangesFor(ch) {
    const list = Array.isArray(currentCharacter?.dailyUses) ? currentCharacter.dailyUses : [];
    const abil = limitedUseAbilities(ch);
    const updates = [], fresh = [];
    abil.forEach(a => {
        const e = list.find(u => u.name.toLowerCase() === a.name.toLowerCase());
        if (e) { if (Number(e.max) !== a.max && (e.per || 'day') === a.per) updates.push({ entry: e, max: a.max }); }
        else fresh.push(a);
    });
    return { updates, fresh };
}
window.dailyUseChangesFor = dailyUseChangesFor;

function suggestedDailyUses() {
    const ch = currentCharacter;
    if (!ch || typeof ClassesDatabase === 'undefined') return [];
    const level = Number(ch.level) || 1;
    const feats = [];
    const main = ClassesDatabase[ch.characterClass];
    (main?.features || []).filter(f => level >= f.minLevel).forEach(f => feats.push(f));
    const opt = typeof getClassOption === 'function' ? getClassOption(ch) : null;
    const optLevel = opt?.ownXpTrack ? (Number(ch.subClassLevel) || 1) : level;
    (opt?.features || []).filter(f => optLevel >= f.minLevel).forEach(f => feats.push({ ...f, _lvl: optLevel }));
    const have = new Set(dailyUsesList().map(u => u.name.toLowerCase()));
    const out = [];
    feats.forEach(f => {
        const u = parseUsesFromText(f.description, f._lvl || level);
        if (u && !have.has(f.name.toLowerCase())) out.push({ name: f.name, max: u.count, per: u.per, note: '' });
    });
    return out;
}

function renderDailyUses() {
    const card = document.getElementById('daily-uses-card');
    if (!card) return;
    if (!currentCharacter) { card.style.display = 'none'; return; }
    card.style.display = '';
    const list = dailyUsesList();
    const sugg = suggestedDailyUses();
    const rows = list.map(u => {
        const max = Math.max(0, Number(u.max) || 0), used = Math.min(max, Math.max(0, Number(u.used) || 0));
        const left = max - used;
        const pips = max <= 12
            ? `<span class="du-pips">${Array.from({ length: max }, (_, i) => `<button type="button" class="du-pip${i < used ? ' spent' : ''}" onclick="toggleDailyUse('${u.id}', ${i})" title="${i < used ? 'Used — click to give it back' : 'Click when used'}" aria-label="${escapeHtml(u.name)} use ${i + 1}: ${i < used ? 'used' : 'ready'}"></button>`).join('')}</span>`
            : `<span class="du-count"><button type="button" class="icon-btn" onclick="stepDailyUse('${u.id}', 1)" title="Use one" aria-label="Use one ${escapeHtml(u.name)}">-</button><strong>${left}</strong> / ${max}<button type="button" class="icon-btn" onclick="stepDailyUse('${u.id}', -1)" title="Give one back" aria-label="Give back one ${escapeHtml(u.name)}">+</button></span>`;
        return `<div class="du-row${left === 0 && max > 0 ? ' du-spent' : ''}">
            <div class="du-name"><strong>${escapeHtml(u.name)}</strong><span class="eyebrow">${max} ${escapeHtml(DU_PERIODS[u.per] || 'a day')}${u.note ? ' · ' + escapeHtml(u.note) : ''}</span></div>
            ${pips}
            <span class="du-left">${left} left</span>
            <button type="button" class="icon-btn" onclick="editDailyUse('${u.id}')" title="Edit" aria-label="Edit ${escapeHtml(u.name)}">${getIcon('edit', 13)}</button>
        </div>`;
    }).join('');
    card.innerHTML = `
        <div class="panel-head">
            <h2>Daily Uses</h2>
            <div class="panel-head-tools">
                ${sugg.length ? `<button type="button" class="btn btn-sm" onclick="addSuggestedDailyUses()" title="${escapeHtml(sugg.map(s => `${s.name}: ${s.max} ${DU_PERIODS[s.per]}`).join('\n'))}">From abilities (${sugg.length})</button>` : ''}
                <button type="button" class="btn btn-sm" onclick="editDailyUse()">+ Add</button>
                ${list.length ? `<button type="button" class="btn btn-sm" onclick="resetDailyUses('day', true)" title="Refills the uses per day now without moving the calendar. To let a day pass, use + Day or Rest a day at the top of the sheet: they refill the uses and move the calendar.">Refill (no time passes)</button>` : ''}
            </div>
        </div>
        ${rows || '<div class="ledger-note">Abilities you can use only so often (charm three times a day, a roar twice a day, a power once a week...). Tick a box when you use one; they refill by themselves when days, weeks or months pass on the calendar.</div>'}`;
}

function toggleDailyUse(id, i) {
    const u = dailyUsesList().find(x => x.id === id);
    if (!u) return;
    const used = Number(u.used) || 0;
    u.used = i < used ? i : i + 1;
    renderDailyUses();
    if (typeof debouncedSave === 'function') debouncedSave();
}
function stepDailyUse(id, delta) {
    const u = dailyUsesList().find(x => x.id === id);
    if (!u) return;
    u.used = Math.min(Number(u.max) || 0, Math.max(0, (Number(u.used) || 0) + delta));
    renderDailyUses();
    if (typeof debouncedSave === 'function') debouncedSave();
}

async function editDailyUse(id) {
    const list = dailyUsesList();
    const u = id ? list.find(x => x.id === id) : null;
    const res = await notesFormModal({
        title: u ? 'Edit daily use' : 'Add a daily use', okText: u ? 'Save' : 'Add', canDelete: Boolean(u),
        fields: [
            { key: 'name', label: 'Ability or item', placeholder: 'e.g. Charming touch', wide: true },
            { key: 'max', label: 'Uses', placeholder: '3' },
            { key: 'per', label: 'Per', type: 'select', options: Object.entries(DU_PERIODS).map(([value, label]) => ({ value, label: label.replace(/^a /, '') })) },
            { key: 'note', label: 'Note (optional)', placeholder: 'e.g. save at -2', wide: true },
        ],
        values: u ? { name: u.name, max: String(u.max), per: u.per, note: u.note || '' } : { max: '1', per: 'day' },
    });
    if (!res) return;
    if (res === '__delete__') {
        currentCharacter.dailyUses = list.filter(x => x !== u);
    } else {
        const name = String(res.name || '').trim();
        if (!name) return;
        const max = Math.max(1, Math.min(99, parseInt(res.max, 10) || 1));
        const per = DU_PERIODS[res.per] ? res.per : 'day';
        if (u) Object.assign(u, { name, max, per, note: String(res.note || '').trim(), used: Math.min(max, Number(u.used) || 0) });
        else list.push({ id: 'du_' + Date.now(), name, max, per, note: String(res.note || '').trim(), used: 0 });
    }
    renderDailyUses();
    if (typeof debouncedSave === 'function') debouncedSave();
}

async function addSuggestedDailyUses() {
    const sugg = suggestedDailyUses();
    if (!sugg.length) return;
    window.__duPick = sugg.map((_, i) => String(i));
    const res = await notesFormModal({
        title: 'Add from class abilities', okText: 'Add',
        fields: [],
        extraHtml: `<div class="ledger-note" style="margin-bottom: 6px;">Read from your abilities at this level; you can edit the numbers afterwards.</div>${sugg.map((s, i) =>
            `<label class="arc-check"><input type="checkbox" class="du-pick" value="${i}" checked> ${escapeHtml(s.name)} <span class="eyebrow">${s.max} ${escapeHtml(DU_PERIODS[s.per])}</span></label>`).join('')}`,
    });
    if (!res) return;
    const picks = new Set(window.__duPick || []);
    sugg.forEach((s, i) => { if (picks.has(String(i))) dailyUsesList().push({ id: 'du_' + Date.now() + '_' + i, ...s, used: 0 }); });
    window.__duPick = [];
    renderDailyUses();
    if (typeof debouncedSave === 'function') debouncedSave();
}
// notesFormModal removes its DOM before resolving, so remember the ticked boxes as they change.
document.addEventListener('change', e => {
    if (e.target && e.target.classList && e.target.classList.contains('du-pick')) {
        window.__duPick = [...document.querySelectorAll('.du-pick:checked')].map(x => x.value);
    }
}, true);

// Refill uses of one period ('day' also refills nothing else). Returns how many were refilled.
function resetDailyUses(per, render) {
    let n = 0;
    dailyUsesList().forEach(u => { if ((u.per || 'day') === per && Number(u.used) > 0) { u.used = 0; n++; } });
    if (render) { renderDailyUses(); if (typeof debouncedSave === 'function') debouncedSave(); }
    return n;
}

// ---------------------------------------------------------------------------
// Supplies & light (Inventory tab)
const LIGHTS = {
    torch: { label: 'Torch', turns: 6, note: '30\' radius, burns 1 hour' },
    lantern: { label: 'Lantern', turns: 24, note: '30\' radius, a flask of oil lasts 4 hours' },
};
const isRation = it => /ration/i.test(it.name || '') || /^dd_rations/.test(it.catalogId || '');
const isTorch = it => /\btorch(es)?\b/i.test(it.name || '') && !/holder|bracket/i.test(it.name || '');
const isOilFlask = it => (/\boil\b/i.test(it.name || '') && !/lamp|lantern|of\b/i.test(it.name || '')) || it.catalogId === 'dd_oil';
const isLantern = it => /lantern/i.test(it.name || '') || it.catalogId === 'dd_lantern';
const isSupply = it => it && !it.isArmor && !it.isShield && (it.category === 'ammo' || it.category === 'consumable'
    || isRation(it) || isTorch(it) || isOilFlask(it) || /waterskin|candle|arrow|bolt|quarrel|pellet|bullet|dart/i.test(it.name || ''));

function suppliesState() {
    const ch = currentCharacter;
    if (!ch.supplies || typeof ch.supplies !== 'object') ch.supplies = {};
    const s = ch.supplies;
    if (!Array.isArray(s.hidden)) s.hidden = [];
    if (!Array.isArray(s.lights)) s.lights = [];
    if (s.eaters === undefined) s.eaters = 1;
    if (s.eatRations === undefined) s.eatRations = false;
    if (s.openPortions === undefined) s.openPortions = 0;      // portions left in the ration pack already opened
    return s;
}
function inventoryItems() { return Array.isArray(currentCharacter?.inventory) ? currentCharacter.inventory : []; }
// What the character has along: not in the Vault, at a home or on a mount.
function itemsWithYou() {
    if (typeof invIsWithCharacter === 'function') return inventoryItems().filter(it => invIsWithCharacter(it));
    const c = currentCharacter || {};
    const away = new Set(['Vault', ...(c.holdings || []).map(h => h.id), ...(c.mounts || []).map(m => m.id)]);
    return inventoryItems().filter(it => it && !away.has(it.location));
}
function itemQty(it) { return (it.qty === undefined || it.qty === null || it.qty === '') ? 1 : Math.max(0, Number(it.qty) || 0); }
// A used-up stack stays in the inventory at 0 (shown as DEPLETED, with a Refill button).
function setItemQty(it, q) { it.qty = Math.max(0, q); }

// Food left, in days, for the people eating (a ration pack feeds one person for a week).
function foodDaysLeft() {
    const s = suppliesState();
    const portions = itemsWithYou().filter(isRation).reduce((sum, it) => sum + itemQty(it) * 7, 0) + (Number(s.openPortions) || 0);
    return { portions, days: Math.floor(portions / Math.max(1, Number(s.eaters) || 1)) };
}

// Eat n portions: from the open pack first, then open new packs (fresh food before preserved).
function eatPortions(n) {
    const s = suppliesState();
    let need = n, eaten = 0;
    const packs = () => itemsWithYou().filter(it => isRation(it) && itemQty(it) > 0)
        .sort((a, b) => (/fresh/i.test(b.name) ? 1 : 0) - (/fresh/i.test(a.name) ? 1 : 0));
    while (need > 0) {
        if (s.openPortions > 0) { const t = Math.min(need, s.openPortions); s.openPortions -= t; need -= t; eaten += t; continue; }
        const pack = packs()[0];
        if (!pack) break;
        setItemQty(pack, itemQty(pack) - 1);
        s.openPortions = 7;
    }
    return { eaten, short: need };
}

function renderSupplies() {
    const card = document.getElementById('supplies-card');
    if (!card) return;
    if (!currentCharacter) { card.style.display = 'none'; return; }
    card.style.display = '';
    const s = suppliesState();
    const inv = inventoryItems();
    // Only what the character has along: things in the Vault, at home or on a mount can't be used from here.
    const along = itemsWithYou();
    const alongSet = new Set(along);
    const shown = inv.map((it, i) => ({ it, i })).filter(({ it }) => alongSet.has(it) && isSupply(it) && !s.hidden.includes(it.id));
    const hiddenCount = along.filter(it => isSupply(it) && s.hidden.includes(it.id)).length;
    const awayCount = inv.filter(it => isSupply(it) && !alongSet.has(it)).length;
    const food = foodDaysLeft();
    const rowsHtml = shown.map(({ it, i }) => {
        const q = itemQty(it);
        const extra = isRation(it) ? '<span class="eyebrow">1 pack = 1 week for one</span>' : '';
        return `<div class="sup-row${q === 0 ? ' sup-out' : ''}">
            <div class="sup-name"><strong>${escapeHtml(it.name)}</strong>${it.location && it.location !== 'Carried' ? `<span class="tag">${escapeHtml(typeof inventoryLocationName === 'function' ? inventoryLocationName(it) : it.location)}</span>` : ''}${extra}</div>
            <span class="sup-qty"><button type="button" class="icon-btn" onclick="stepSupply(${i}, -1)" title="Use one" aria-label="Use one ${escapeHtml(it.name)}" ${q <= 0 ? 'disabled' : ''}>-</button><strong>${q}</strong><button type="button" class="icon-btn" onclick="stepSupply(${i}, 1)" title="Add one" aria-label="Add one ${escapeHtml(it.name)}">+</button></span>
            <button type="button" class="btn btn-sm sup-hide" onclick="hideSupply('${escapeHtml(String(it.id))}')" title="Hide it from this list (it stays in the inventory)" aria-label="Hide ${escapeHtml(it.name)} from supplies">Hide</button>
        </div>`;
    }).join('');
    const torches = along.filter(isTorch).reduce((n, it) => n + itemQty(it), 0);
    const oil = along.filter(isOilFlask).reduce((n, it) => n + itemQty(it), 0);
    const hasLantern = along.some(it => isLantern(it) && itemQty(it) > 0);
    const lightsHtml = s.lights.map(l => {
        const pct = Math.max(0, Math.min(100, Math.round(100 * l.turns / Math.max(1, l.total))));
        return `<div class="light-row">
            <div class="sup-name"><strong>${escapeHtml(l.name)}</strong><span class="eyebrow">${l.turns} turn${l.turns === 1 ? '' : 's'} left (${fmtTurns(l.turns)})</span></div>
            <div class="light-bar"><div style="width: ${pct}%;"></div></div>
            <button type="button" class="btn btn-sm" onclick="putOutLight('${l.id}')">Put out</button>
        </div>`;
    }).join('');
    card.innerHTML = `
        <div class="panel-head">
            <h2>Supplies &amp; Light</h2>
            <div class="panel-head-tools">${hiddenCount ? `<button type="button" class="btn btn-sm" onclick="showAllSupplies()">Show hidden (${hiddenCount})</button>` : ''}</div>
        </div>
        <div class="sup-grid">
            <div>
                <div class="eyebrow eyebrow-strong" style="margin-bottom: 6px;">Supplies</div>
                ${rowsHtml || '<div class="ledger-note">Ammunition, rations, torches, oil and other consumables you carry appear here, with quick -/+ buttons.</div>'}
                ${awayCount ? `<div class="ledger-note sup-away">${awayCount} more kept in the Vault, at home or on a mount (not usable from here).</div>` : ''}
                <div class="sup-food">
                    <label class="arc-check"><input type="checkbox" ${s.eatRations ? 'checked' : ''} onchange="setSupplyOption('eatRations', this.checked)"> Eat rations as days pass</label>
                    <label class="sup-eaters">People eating <input type="number" min="1" max="99" class="stat-input small-field" value="${Number(s.eaters) || 1}" onchange="setSupplyOption('eaters', this.value)"></label>
                    <span class="eyebrow">${food.portions > 0 ? `Food for <strong>${food.days}</strong> day${food.days === 1 ? '' : 's'}${s.openPortions ? ` · ${s.openPortions} portion${s.openPortions === 1 ? '' : 's'} left in the open pack` : ''}` : 'No rations carried'}</span>
                </div>
            </div>
            <div>
                <div class="eyebrow eyebrow-strong" style="margin-bottom: 6px;">Light</div>
                ${lightsHtml || '<div class="ledger-note">Nothing lit.</div>'}
                <div class="light-btns">
                    <button type="button" class="btn btn-sm" onclick="lightSource('torch')" ${torches ? '' : 'disabled'} title="${torches ? `Uses one of your ${torches} torches` : 'No torches carried'}">Light a torch</button>
                    <button type="button" class="btn btn-sm" onclick="lightSource('lantern')" ${hasLantern && oil ? '' : 'disabled'} title="${hasLantern ? (oil ? `Uses one of your ${oil} flasks of oil` : 'No oil carried') : 'No lantern carried'}">Fill &amp; light the lantern</button>
                    <button type="button" class="btn btn-sm" onclick="lightSource('other')">Other light…</button>
                </div>
                ${(() => {
                    const why = [!torches ? 'No torches carried' : `${torches} torch${torches === 1 ? '' : 'es'}`,
                        !hasLantern ? 'no lantern carried' : !oil ? 'lantern but no oil carried' : `lantern, ${oil} flask${oil === 1 ? '' : 's'} of oil`];
                    return `<div class="ledger-note sup-light-why">${escapeHtml(why.join(' · ').replace(/^./, c => c.toUpperCase()))}</div>`;
                })()}
                ${s.lights.length ? `<div class="light-btns"><span class="eyebrow">Time passes</span>
                    <button type="button" class="btn btn-sm" onclick="burnLights(1)">1 turn</button>
                    <button type="button" class="btn btn-sm" onclick="burnLights(6)">1 hour</button></div>` : ''}
            </div>
        </div>`;
}
function fmtTurns(t) {
    const h = Math.floor(t / 6), m = (t % 6) * 10;
    return h ? `${h} h${m ? ' ' + m + ' min' : ''}` : `${m} min`;
}

function suppliesChanged() {
    if (typeof syncInventoryUI === 'function') syncInventoryUI(); else renderSupplies();
    if (typeof updateCombatVitals === 'function') { try { updateCombatVitals(); } catch (e) { /* not on screen */ } }
    if (typeof debouncedSave === 'function') debouncedSave();
}
function stepSupply(index, delta) {
    const it = inventoryItems()[index];
    if (!it) return;
    setItemQty(it, itemQty(it) + delta);
    suppliesChanged();
}
function hideSupply(id) { const s = suppliesState(); if (!s.hidden.includes(id)) s.hidden.push(id); renderSupplies(); if (typeof debouncedSave === 'function') debouncedSave(); }
function showAllSupplies() { suppliesState().hidden = []; renderSupplies(); if (typeof debouncedSave === 'function') debouncedSave(); }
function setSupplyOption(key, value) {
    const s = suppliesState();
    if (key === 'eaters') s.eaters = Math.max(1, Math.min(99, parseInt(value, 10) || 1));
    else s[key] = Boolean(value);
    renderSupplies();
    if (typeof debouncedSave === 'function') debouncedSave();
}

async function lightSource(kind) {
    const s = suppliesState();
    const inv = itemsWithYou();
    let name, turns;
    if (kind === 'torch') {
        const it = inv.find(x => isTorch(x) && itemQty(x) > 0);
        if (!it) return;
        setItemQty(it, itemQty(it) - 1);
        name = 'Torch'; turns = LIGHTS.torch.turns;
    } else if (kind === 'lantern') {
        const it = inv.find(x => isOilFlask(x) && itemQty(x) > 0);
        if (!it || !inv.some(x => isLantern(x) && itemQty(x) > 0)) return;
        setItemQty(it, itemQty(it) - 1);
        name = 'Lantern'; turns = LIGHTS.lantern.turns;
    } else {
        const res = await notesFormModal({
            title: 'Other light', okText: 'Light it',
            fields: [
                { key: 'name', label: 'Light', placeholder: 'e.g. Candle', wide: true },
                { key: 'turns', label: 'Burns for (turns of 10 minutes)', placeholder: '6' },
            ],
            values: { turns: '6' },
        });
        if (!res || res === '__delete__') return;
        name = String(res.name || '').trim() || 'Light';
        turns = Math.max(1, parseInt(res.turns, 10) || 6);
    }
    s.lights.push({ id: 'light_' + Date.now(), name, turns, total: turns });
    suppliesChanged();
}
function putOutLight(id) {
    const s = suppliesState();
    s.lights = s.lights.filter(l => l.id !== id);
    renderSupplies();
    if (typeof debouncedSave === 'function') debouncedSave();
}
// Burn every light for some turns; those that run out are removed and noted. Returns their names.
function burnLights(turns, quiet) {
    const s = suppliesState();
    const out = [];
    s.lights.forEach(l => { l.turns = Math.max(0, l.turns - turns); if (l.turns === 0) out.push(l.name); });
    s.lights = s.lights.filter(l => l.turns > 0);
    if (!quiet) {
        if (out.length && typeof addChronicleEntry === 'function') addChronicleEntry('time', `${out.join(', ')} burnt out.`);
        renderSupplies();
        if (typeof debouncedSave === 'function') debouncedSave();
        if (out.length && typeof sheetAlert === 'function') sheetAlert(`${out.join(', ')} burnt out.`);
    }
    return out;
}

// ---------------------------------------------------------------------------
// Called by the calendar when time passes. Returns lines for the time log.
function everydayTimePassed(before, after, secs) {
    if (!currentCharacter) return [];
    const notes = [];
    const days = after.dayAbs - before.dayAbs;
    if (days > 0) {
        const d = resetDailyUses('day');
        const w = Math.floor(after.dayAbs / 7) !== Math.floor(before.dayAbs / 7) ? resetDailyUses('week') : 0;
        const m = after.monthAbs !== before.monthAbs ? resetDailyUses('month') : 0;
        if (d + w + m) notes.push('daily uses refilled');
    }
    const s = suppliesState();
    if (s.lights.length) {
        const gone = burnLights(Math.ceil(secs / 600), true);
        if (gone.length) notes.push(`${gone.join(', ')} burnt out`);
    }
    if (days > 0 && s.eatRations) {
        const want = days * Math.max(1, Number(s.eaters) || 1);
        const { eaten, short } = eatPortions(want);
        const left = foodDaysLeft();
        if (eaten) notes.push(`ate ${eaten} day${eaten === 1 ? '' : 's'}' food for one (rations left for ${left.days} day${left.days === 1 ? '' : 's'})`);
        if (short) notes.push(`ran out of rations: ${short} meal${short === 1 ? '' : 's'} short`);
    }
    try { renderDailyUses(); } catch (e) { console.error(e); }
    try { if (typeof syncInventoryUI === 'function') syncInventoryUI(); else renderSupplies(); } catch (e) { console.error(e); }
    return notes;
}

window.renderDailyUses = renderDailyUses;
window.toggleDailyUse = toggleDailyUse;
window.stepDailyUse = stepDailyUse;
window.editDailyUse = editDailyUse;
window.addSuggestedDailyUses = addSuggestedDailyUses;
window.resetDailyUses = resetDailyUses;
window.renderSupplies = renderSupplies;
window.stepSupply = stepSupply;
window.hideSupply = hideSupply;
window.showAllSupplies = showAllSupplies;
window.setSupplyOption = setSupplyOption;
window.lightSource = lightSource;
window.putOutLight = putOutLight;
window.burnLights = burnLights;
window.everydayTimePassed = everydayTimePassed;
