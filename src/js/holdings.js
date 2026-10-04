// js/holdings.js — homes and holdings that are not a dominion: a townhouse, a wizard's tower,
// a shop, a hideout... with their staff, rooms, stored goods, monthly costs and construction.
// Building costs: Dark Dungeons Table 8-8 (one day of work per 500 gp, one engineer per 100,000 gp;
// double cost in inaccessible regions, half in heavily settled ones). Staff pay: Dark Dungeons
// Table 8-10 (the same list as the Companions tab).

const HOLDING_TYPES = [
    { id: 'house', label: 'House / townhouse', icon: 'vault' },
    { id: 'cottage', label: 'Cottage / cabin', icon: 'vault' },
    { id: 'manor', label: 'Manor / villa', icon: 'crown' },
    { id: 'tower', label: "Wizard's tower", icon: 'flask' },
    { id: 'stronghold', label: 'Keep / castle (no dominion)', icon: 'shield' },
    { id: 'temple', label: 'Temple / shrine', icon: 'candle' },
    { id: 'shop', label: 'Shop / workshop', icon: 'coin' },
    { id: 'inn', label: 'Inn / tavern', icon: 'party' },
    { id: 'farm', label: 'Farm / estate', icon: 'horse' },
    { id: 'hideout', label: 'Hideout / guild house', icon: 'eye' },
    { id: 'other', label: 'Other', icon: 'vault' },
];
const HOLDING_STATUS = [
    { id: 'owned', label: 'Owned' },
    { id: 'rented', label: 'Rented' },
    { id: 'building', label: 'Being built' },
    { id: 'ruined', label: 'Damaged / ruined' },
    { id: 'lost', label: 'Sold / lost' },
];
const HOLDING_ROOMS = ['Library', 'Laboratory', 'Workshop', 'Chapel / shrine', 'Vault / treasury', 'Armoury', 'Stables', 'Kitchen',
    'Guest rooms', 'Servants\' quarters', 'Garden', 'Observatory', 'Summoning circle', 'Cellar / dungeon', 'Secret passage', 'Trophy hall', 'Training yard'];
// Dark Dungeons Table 8-8 (Buildings).
const BUILDING_PARTS = [
    { key: 'stone', name: 'Building, stone (2 storeys, 30\' × 40\')', cost: 3000 },
    { key: 'wood', name: 'Building, wood (2 storeys, 30\' × 40\')', cost: 1500 },
    { key: 'tower_s', name: 'Tower, small round', cost: 15000 },
    { key: 'tower_l', name: 'Tower, large round', cost: 30000 },
    { key: 'bastion', name: 'Tower, bastion', cost: 9000 },
    { key: 'keep', name: 'Keep, square (60\' × 60\', 80\' tall)', cost: 75000 },
    { key: 'gatehouse', name: 'Gatehouse (with portcullis)', cost: 6500 },
    { key: 'barbican', name: 'Barbican', cost: 37000 },
    { key: 'wall_castle', name: 'Wall, castle (100\')', cost: 5000 },
    { key: 'wall_wood', name: 'Wall, wood (100\')', cost: 1000 },
    { key: 'battlement', name: 'Battlement (100\')', cost: 500 },
    { key: 'gate', name: 'Gate, wooden', cost: 1000 },
    { key: 'drawbridge', name: 'Drawbridge', cost: 250 },
    { key: 'moat', name: 'Moat, unfilled (100\')', cost: 400 },
    { key: 'moat_f', name: 'Moat, filled (100\')', cost: 800 },
    { key: 'corridor', name: 'Dungeon corridor (10\' cube; × depth in 50\')', cost: 500 },
    { key: 'shifting', name: 'Shifting wall', cost: 1000 },
    { key: 'door_ext', name: 'Door, exterior (iron/stone)', cost: 100 },
    { key: 'door_int_is', name: 'Door, interior (iron/stone)', cost: 50 },
    { key: 'door_int_r', name: 'Door, interior (reinforced)', cost: 20 },
    { key: 'door_int_w', name: 'Door, interior (wood)', cost: 10 },
    { key: 'floor_f', name: 'Floor, flagstone or tile (10\' × 10\')', cost: 100 },
    { key: 'floor_w', name: 'Floor, polished wood (10\' × 10\')', cost: 40 },
    { key: 'stairs_s', name: 'Staircase, stone', cost: 60 },
    { key: 'stairs_w', name: 'Staircase, wood', cost: 20 },
    { key: 'arrow', name: 'Arrow slit', cost: 10 },
    { key: 'win_bar', name: 'Window, barred', cost: 20 },
    { key: 'win', name: 'Window, open', cost: 10 },
    { key: 'shutters', name: 'Shutters (window)', cost: 5 },
];
const BUILD_REGIONS = [
    { id: 'remote', label: 'Remote but reachable (listed cost)', mult: 1 },
    { id: 'settled', label: 'Heavily settled region (half cost)', mult: 0.5 },
    { id: 'inaccessible', label: 'Inaccessible region (double cost)', mult: 2 },
];
// Household staff: the specialists of Dark Dungeons Table 8-10 plus ordinary servants.
function holdingStaffRoles() {
    const roles = [['Servant / maid', 2], ['Cook', 5], ['Groom / stable hand', 2], ['Gardener', 2], ['Guard (light foot)', 2], ['Porter / labourer', 2]];
    if (typeof SPECIALIST_TYPES !== 'undefined') SPECIALIST_TYPES.forEach(([n, c]) => { if (!roles.some(r => r[0] === n)) roles.push([n, c]); });
    return roles;
}

// A listed job is paid its usual wage automatically; only jobs you make up yourself take your own wage.
function holdingStandardRole(role) {
    const r = String(role || '').trim().toLowerCase();
    return r ? holdingStaffRoles().find(x => x[0].toLowerCase() === r) || null : null;
}
function staffWage(s) {
    const std = holdingStandardRole(s && s.role);
    return std ? std[1] : holdingNum(s && s.wage);
}

const holdingNum = v => { const n = Number(String(v ?? '').replace(/[^\d.-]/g, '')); return Number.isFinite(n) ? n : 0; };
const holdingGp = n => (typeof compGp === 'function' ? compGp(n) : `${(Math.round(n * 100) / 100).toLocaleString('en-US')} gp`);
const holdingSafeId = id => typeof id === 'string' && /^[\w-]+$/.test(id);
function holdingId(prefix = 'home') { return `${prefix}_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`; }
function holdingsSave() { if (typeof debouncedSave === 'function') debouncedSave(); renderHoldings(); }
function holdingsLog(text, data = {}) { if (typeof addChronicleEntry === 'function') addChronicleEntry('holding', text, data); }

function holdingsState(ch = currentCharacter) {
    if (!ch) return [];
    if (!Array.isArray(ch.holdings)) ch.holdings = [];
    ch.holdings.forEach(h => {
        if (!holdingSafeId(h.id)) {                       // keep stored items pointing at the right place
            const old = h.id; h.id = holdingId();
            (ch.inventory || []).forEach(it => { if (it && it.location === old) it.location = h.id; });
            (ch.companions || []).forEach(c => { if (c && c.home === old) c.home = h.id; });
        }
        if (!Array.isArray(h.staff)) h.staff = [];
        if (!Array.isArray(h.rooms)) h.rooms = [];
        h.staff.forEach(s => { if (!holdingSafeId(s.id)) s.id = holdingId('staff'); });
        h.rooms.forEach(r => { if (!holdingSafeId(r.id)) r.id = holdingId('room'); });
        if (!h.build || typeof h.build !== 'object') h.build = { parts: {}, region: 'remote' };
        if (!h.build.parts || typeof h.build.parts !== 'object') h.build.parts = {};
    });
    return ch.holdings;
}
function findHolding(id) { return holdingsState().find(h => h.id === id) || null; }
const holdingActive = h => !['lost'].includes(h.status);

// What a holding costs each month: rent, staff wages and other running costs.
function holdingMonthly(h) {
    if (!holdingActive(h)) return 0;
    const staff = (h.staff || []).reduce((s, x) => s + staffWage(x) * Math.max(0, holdingNum(x.count) || 1), 0);
    return staff + (h.status === 'rented' ? holdingNum(h.rent) : 0) + holdingNum(h.upkeep);
}
// Everything paid as household costs each month: homes, and vessels in service (js/vessels.js).
function householdBills(ch = currentCharacter) {
    const homes = holdingsState(ch).filter(h => holdingMonthly(h) > 0).map(h => ({ name: h.name, amount: holdingMonthly(h) }));
    const ships = typeof vesselsMonthlyBills === 'function' ? vesselsMonthlyBills(ch) : [];
    return [...homes, ...ships];
}
function holdingsMonthlyTotal(ch = currentCharacter) { return householdBills(ch).reduce((s, b) => s + b.amount, 0); }

function buildPlanCost(h) {
    const region = BUILD_REGIONS.find(r => r.id === h.build.region) || BUILD_REGIONS[0];
    const base = BUILDING_PARTS.reduce((s, p) => s + p.cost * Math.max(0, holdingNum(h.build.parts[p.key])), 0) + holdingNum(h.build.extra);
    const cost = Math.round(base * region.mult);
    return { base, cost, days: cost > 0 ? Math.ceil(cost / 500) : 0, engineers: cost > 0 ? Math.ceil(cost / 100000) : 0, region };
}
function buildFinishT(h) { return h.build && Number.isFinite(Number(h.build.startT)) && h.build.days ? Number(h.build.startT) + Number(h.build.days) * 86400 : null; }

function holdingItems(h) { return (currentCharacter.inventory || []).filter(it => it && it.location === h.id); }
function holdingCompanions(h) { return (currentCharacter.companions || []).filter(c => c && c.home === h.id); }

// ---------------------------------------------------------------------------
// Rendering
function renderHoldings() {
    const root = document.getElementById('holdings-root');
    if (!root || !currentCharacter) return;
    const list = holdingsState();
    const monthly = holdingsMonthlyTotal();
    const value = list.filter(holdingActive).reduce((s, h) => s + holdingNum(h.value), 0);
    const staffCount = list.filter(holdingActive).reduce((s, h) => s + h.staff.reduce((t, x) => t + (Math.max(0, holdingNum(x.count)) || 1), 0), 0);
    const cal = typeof calendarState === 'function' ? calendarState() : null;
    const paidThisMonth = cal && cal.holdingsMonth !== undefined && cal.holdingsMonth >= calParts(cal.t).monthAbs;
    const summary = `
    <div class="card comp-summary">
        <div class="panel-head">
            <h2 style="display: inline-flex; align-items: center; gap: 8px;">${getIcon('vault', 18)} Homes &amp; Holdings</h2>
            <div class="panel-head-tools"><button type="button" class="btn btn-sm btn-accent" onclick="openHoldingEditor()">+ Add a home</button></div>
        </div>
        <p class="sub-caption">Houses, towers, shops and hideouts the character owns or rents, outside any dominion. Keep the household staff, rooms, stored goods and monthly costs of each. Rule a land? That goes on the Dominion tab.</p>
        <div class="tally">
            <span>Holdings <strong>${list.filter(holdingActive).length}</strong></span>
            <span>Staff <strong>${staffCount}</strong></span>
            <span>Worth <strong>${holdingGp(value)}</strong></span>
            <span>Costs <strong>${holdingGp(monthly)}</strong> / month${paidThisMonth ? ' <span class="tag" style="color: var(--good);">paid</span>' : ''}</span>
        </div>
        <div class="arc-actions" style="margin: 8px 0 0;">
            <button type="button" class="btn btn-sm btn-accent" onclick="payHoldingCosts()" ${monthly ? '' : 'disabled'} title="Wages, rent and running costs of every home">Pay this month's household costs</button>
            ${paySourceSelect()}
            ${cal ? `<label class="arc-check" title="When the calendar reaches a new month, wages and household costs are paid by themselves from the chosen money (for every month that passed)"><input type="checkbox" ${calendarState().settings.autoPay ? 'checked' : ''} onchange="setCalendarSetting('autoPay', this.checked)"> Pay automatically each month</label>` : ''}
        </div>
    </div>`;
    root.innerHTML = summary + (list.length ? list.map(holdingCard).join('') : `<div class="card"><div class="ledger-note">No homes yet. Add the inn room you rent, the tower you inherited or the house you plan to build.</div></div>`)
        + `<div class="arc-source">Dark Dungeons Chapter 8: Table 8-8 (buildings), Table 8-10 (specialists) · Rules Cyclopedia Chapter 11 (strongholds)</div>`;
    if (typeof renderVessels === 'function') { try { renderVessels(); } catch (e) { console.error(e); } }
}

function holdingCard(h) {
    const type = HOLDING_TYPES.find(t => t.id === h.type) || HOLDING_TYPES[HOLDING_TYPES.length - 1];
    const status = HOLDING_STATUS.find(s => s.id === h.status) || HOLDING_STATUS[0];
    const monthly = holdingMonthly(h);
    const items = holdingItems(h);
    const comps = holdingCompanions(h);
    const plan = buildPlanCost(h);
    const finish = buildFinishT(h);
    const now = typeof calendarState === 'function' ? calendarState().t : null;
    let buildHtml = '';
    if (h.status === 'building' && finish !== null && now !== null) {
        const total = Number(h.build.days) * 86400;
        const done = Math.max(0, Math.min(1, (now - Number(h.build.startT)) / total));
        const left = Math.max(0, Math.ceil((finish - now) / 86400));
        buildHtml = `<div class="hold-build">
            <div class="hold-build-line"><span>${left ? `Ready in ${left} day${left === 1 ? '' : 's'}, on ${escapeHtml(calDateText(calParts(finish), false))}` : 'Construction finished'}</span>
            ${left ? '' : `<button type="button" class="btn btn-sm btn-accent" onclick="finishHoldingConstruction('${h.id}')">Move in</button>`}</div>
            <div class="comp-hp-bar"><span style="width: ${Math.round(done * 100)}%;"></span></div></div>`;
    }
    const staffHtml = h.staff.length ? h.staff.map(s => {
        const n = Math.max(0, holdingNum(s.count)) || 1;
        return `<div class="hold-line"><button type="button" class="link-btn" onclick="openHoldingStaffEditor('${h.id}', '${s.id}')">${n > 1 ? `${n} × ` : ''}${escapeHtml(s.role || 'Worker')}</button>${s.name ? ` <span class="sub-caption">${escapeHtml(s.name)}</span>` : ''}<span class="hold-amount" title="${holdingStandardRole(s.role) ? 'Usual pay for this job' : 'Your own wage'}">${staffWage(s) ? `${holdingGp(staffWage(s) * n)} / month` : 'unpaid'}</span></div>`;
    }).join('') : '<div class="ledger-note">No staff.</div>';
    const compHtml = comps.length ? `<div class="hold-sub">Companions stationed here: ${comps.map(c => `<button type="button" class="link-btn" onclick="switchTab('tab-companions'); setTimeout(() => openCompanionEditor('${c.id}'), 50)">${escapeHtml(c.name || 'Companion')}</button>`).join(', ')} <span class="sub-caption">(paid on the Companions tab)</span></div>` : '';
    const lib = currentCharacter.arcana?.library;
    const roomsHtml = h.rooms.length ? h.rooms.map(r => `<div class="hold-line"><button type="button" class="link-btn" onclick="openHoldingRoomEditor('${h.id}', '${r.id}')">${escapeHtml(r.name || 'Room')}</button>${r.notes ? ` <span class="sub-caption">${escapeHtml(r.notes)}</span>` : ''}${/^library/i.test(r.name || '') && lib && lib.own ? ` <span class="tag" title="Your research library on the Arcana tab">research library ${escapeHtml(String(typeof libraryTotal === 'function' ? libraryTotal(lib) : (lib.value || 0)))} dc${lib.books && lib.books.length ? `, ${lib.books.length} book${lib.books.length > 1 ? 's' : ''}` : ''}</span>` : ''}<span class="hold-amount">${holdingNum(r.value) ? holdingGp(holdingNum(r.value)) : ''}</span></div>`).join('') : '<div class="ledger-note">No rooms or features noted.</div>';
    const itemsHtml = items.length ? items.slice(0, 12).map(it => `${escapeHtml(it.name)}${Number(it.qty) > 1 ? ` ×${Number(it.qty)}` : ''}`).join(', ') + (items.length > 12 ? `, and ${items.length - 12} more` : '') : '<span class="ledger-note">Nothing stored. Set an item\'s location to this home on the Inventory tab.</span>';
    const facts = [type.label, h.location, h.status === 'rented' && holdingNum(h.rent) ? `rent ${holdingGp(holdingNum(h.rent))} / month` : '', holdingNum(h.value) ? `worth ${holdingGp(holdingNum(h.value))}` : ''].filter(Boolean);
    return `
    <div class="card hold-card${holdingActive(h) ? '' : ' gone'}" id="hold-${h.id}">
        <div class="panel-head">
            <h2 style="display: inline-flex; align-items: center; gap: 8px;">${getIcon(type.icon, 18)} ${escapeHtml(h.name || type.label)} <span class="comp-status hold-status-${status.id}">${escapeHtml(status.label)}</span></h2>
            <div class="panel-head-tools"><button type="button" class="btn btn-sm" onclick="openHoldingEditor('${h.id}')">Edit</button></div>
        </div>
        <p class="sub-caption">${facts.map(escapeHtml).join(' · ')}</p>
        ${h.description ? `<p class="hold-desc">${escapeHtml(h.description)}</p>` : ''}
        ${buildHtml}
        <div class="hold-grid">
            <div class="hold-col">
                <div class="arc-row-head"><span class="eyebrow eyebrow-strong">Staff</span><button type="button" class="btn btn-sm" onclick="openHoldingStaffEditor('${h.id}')">+ Staff</button></div>
                ${staffHtml}${compHtml}
            </div>
            <div class="hold-col">
                <div class="arc-row-head"><span class="eyebrow eyebrow-strong">Rooms &amp; features</span><button type="button" class="btn btn-sm" onclick="openHoldingRoomEditor('${h.id}')">+ Room</button></div>
                ${roomsHtml}
            </div>
        </div>
        <div class="hold-foot">
            <div><span class="eyebrow eyebrow-strong">Stored here</span> ${itemsHtml}</div>
            <div class="hold-costs"><span class="eyebrow eyebrow-strong">Monthly costs</span> <strong>${holdingGp(monthly)}</strong>${holdingNum(h.upkeep) ? ` <span class="sub-caption">(incl. ${holdingGp(holdingNum(h.upkeep))} upkeep)</span>` : ''}
                <button type="button" class="btn btn-sm" onclick="openBuildPlanner('${h.id}')" title="Dark Dungeons Table 8-8">${plan.cost ? `Building plan: ${holdingGp(plan.cost)}` : 'Plan construction'}</button></div>
        </div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Editing
async function openHoldingEditor(id = null) {
    const h = id ? findHolding(id) : null;
    if (id && !h) return;
    const res = await notesFormModal({
        title: h ? (h.name || 'Home') : 'New home', okText: 'Save', canDelete: !!h,
        values: h ? { ...h } : { type: 'house', status: 'owned' },
        fields: [
            { key: 'name', label: 'Name', max: 80, placeholder: 'e.g. The Leaning Tower of Specularum' },
            { key: 'type', label: 'Kind', type: 'select', options: HOLDING_TYPES.map(t => ({ value: t.id, label: t.label })) },
            { key: 'status', label: 'Status', type: 'select', options: HOLDING_STATUS.map(s => ({ value: s.id, label: s.label })) },
            { key: 'location', label: 'Where', max: 120, placeholder: 'e.g. Specularum, Old Quarter' },
            { key: 'value', label: 'Worth (gp)', placeholder: 'purchase price or building cost' },
            { key: 'rent', label: 'Rent (gp / month)', placeholder: 'if rented' },
            { key: 'upkeep', label: 'Other running costs (gp / month)', placeholder: 'repairs, food, firewood, taxes...' },
            { key: 'description', label: 'Description', type: 'textarea', wide: true, rows: 4, placeholder: 'What it looks like, its history, defences, secrets...' },
        ],
    });
    if (res === null) return;
    const list = holdingsState();
    if (res === '__delete__') {
        const items = holdingItems(h);
        if (!(await sheetConfirm(`Remove ${h.name || 'this home'} from the sheet?${items.length ? ` The ${items.length} item${items.length > 1 ? 's' : ''} stored there move to your vault.` : ''} (To keep a record, set its status to Sold / lost instead.)`, 'Remove'))) return;
        items.forEach(it => { it.location = 'Vault'; });
        (currentCharacter.companions || []).forEach(c => { if (c.home === h.id) delete c.home; });
        currentCharacter.holdings = list.filter(x => x.id !== h.id);
        holdingsSave();
        if (typeof syncInventoryUI === 'function') { try { syncInventoryUI(); } catch (e) { console.error(e); } }
        return;
    }
    const out = { ...res, value: res.value === '' ? '' : holdingNum(res.value), rent: res.rent === '' ? '' : holdingNum(res.rent), upkeep: res.upkeep === '' ? '' : holdingNum(res.upkeep) };
    out.name = out.name || (HOLDING_TYPES.find(t => t.id === out.type)?.label || 'Home');
    if (h) {
        const was = h.status;
        Object.assign(h, out);
        if (was !== h.status) holdingsLog(`${h.name}: now ${HOLDING_STATUS.find(s => s.id === h.status)?.label.toLowerCase()}.`);
    } else {
        const nh = { id: holdingId(), staff: [], rooms: [], build: { parts: {}, region: 'remote' }, ...out };
        list.push(nh);
        holdingsLog(`New home: ${nh.name}${nh.location ? ` (${nh.location})` : ''}, ${HOLDING_STATUS.find(s => s.id === nh.status)?.label.toLowerCase()}.`);
    }
    holdingsSave();
}

async function openHoldingStaffEditor(hid, sid = null) {
    const h = findHolding(hid);
    if (!h) return;
    const s = sid ? h.staff.find(x => x.id === sid) : null;
    const roles = holdingStaffRoles();
    const pending = notesFormModal({
        title: s ? (s.role || 'Staff') : `Staff for ${h.name}`, canDelete: !!s,
        values: s ? { ...s } : { count: '1' },
        fields: [
            { key: 'role', label: 'Job', placeholder: 'e.g. Steward', list: roles.map(r => r[0]) },
            { key: 'count', label: 'How many', placeholder: '1' },
            { key: 'wage', label: 'Wage each (gp / month)', placeholder: 'your own wage for this job' },
            { key: 'name', label: 'Names', max: 120, placeholder: 'e.g. Old Marta, the twins Pell and Tobb' },
            { key: 'notes', label: 'Notes', type: 'textarea', wide: true, rows: 3, placeholder: 'Loyalty, duties, quirks...' },
        ],
        extraHtml: `<span id="staff-form-marker" hidden></span><p class="sub-caption" id="staff-wage-note"></p><details class="arc-rules"><summary>Usual monthly pay</summary><p class="sub-caption">${roles.map(([n, c]) => `${escapeHtml(n)} ${c.toLocaleString('en-US')} gp`).join(' · ')}</p></details>`,
    });
    syncStaffWageField();
    const res = await pending;
    if (res === null) return;
    if (res === '__delete__') { h.staff = h.staff.filter(x => x.id !== s.id); holdingsLog(`${h.name}: ${s.role || 'staff'} dismissed.`); holdingsSave(); return; }
    const role = res.role || 'Worker';
    const usual = holdingStandardRole(role);
    const out = { ...res, role, count: Math.max(1, holdingNum(res.count) || 1), wage: usual ? usual[1] : holdingNum(res.wage) };
    if (s) Object.assign(s, out);
    else { h.staff.push({ id: holdingId('staff'), ...out }); holdingsLog(`${h.name}: hired ${out.count > 1 ? out.count + ' × ' : ''}${role}${out.wage ? ` at ${holdingGp(out.wage)} a month${out.count > 1 ? ' each' : ''}` : ''}.`); }
    holdingsSave();
}

async function openHoldingRoomEditor(hid, rid = null) {
    const h = findHolding(hid);
    if (!h) return;
    const r = rid ? h.rooms.find(x => x.id === rid) : null;
    const res = await notesFormModal({
        title: r ? (r.name || 'Room') : `Room or feature for ${h.name}`, canDelete: !!r,
        values: r ? { ...r } : {},
        fields: [
            { key: 'name', label: 'Room or feature', placeholder: 'e.g. Laboratory', list: HOLDING_ROOMS },
            { key: 'value', label: 'Value (gp)', placeholder: 'optional: books, equipment, furnishings' },
            { key: 'notes', label: 'Notes', type: 'textarea', wide: true, rows: 3, placeholder: 'Contents, wards, who may enter...' },
        ],
    });
    if (res === null) return;
    if (res === '__delete__') { h.rooms = h.rooms.filter(x => x.id !== r.id); holdingsSave(); return; }
    const out = { ...res, name: res.name || 'Room', value: res.value === '' ? '' : holdingNum(res.value) };
    if (r) Object.assign(r, out); else h.rooms.push({ id: holdingId('room'), ...out });
    holdingsSave();
}

// ---------------------------------------------------------------------------
// Construction planner (Dark Dungeons Table 8-8)
async function openBuildPlanner(hid) {
    const h = findHolding(hid);
    if (!h) return;
    const fields = [
        { key: 'region', label: 'Where it is built', type: 'select', options: BUILD_REGIONS.map(r => ({ value: r.id, label: r.label })) },
        { key: 'extra', label: 'Other work (gp, before the region)', placeholder: 'custom features' },
        ...BUILDING_PARTS.map(p => ({ key: `p_${p.key}`, label: `${p.name}, ${p.cost.toLocaleString('en-US')} gp`, placeholder: '0' })),
    ];
    const values = { region: h.build.region || 'remote', extra: h.build.extra || '' };
    BUILDING_PARTS.forEach(p => { if (holdingNum(h.build.parts[p.key])) values[`p_${p.key}`] = String(h.build.parts[p.key]); });
    const already = h.status === 'building';
    const res = await notesFormModal({
        title: `Building plan: ${h.name}`, okText: already ? 'Save plan' : 'Save plan', values, fields,
        extraHtml: `<p class="sub-caption" style="margin-top: 8px;">Prices include the labourers but not the engineers (750 gp a month each, one per 100,000 gp). Work takes one day per 500 gp. Fill in how many of each part; the total, time and engineers are worked out when you save.</p>`,
    });
    if (res === null || res === '__delete__') return;
    h.build.region = res.region;
    h.build.extra = res.extra === '' ? '' : holdingNum(res.extra);
    h.build.parts = {};
    BUILDING_PARTS.forEach(p => { const n = holdingNum(res[`p_${p.key}`]); if (n > 0) h.build.parts[p.key] = n; });
    const plan = buildPlanCost(h);
    holdingsSave();
    if (!plan.cost) return;
    const text = `${h.name}: ${holdingGp(plan.cost)} (${plan.region.label.split(' (')[0].toLowerCase()}), ${plan.days} days of work, ${plan.engineers} engineer${plan.engineers > 1 ? 's' : ''} on site.`;
    if (already || typeof calendarState !== 'function') { await sheetAlert(text); return; }
    const start = await sheetDialog(`${text}\n\nStart building today? The cost is paid from your ${paySourceLabel(monthlyPaySource())} and the calendar counts the days.`, { confirm: true, okText: 'Start building', cancelText: 'Just keep the plan' });
    if (!start) return;
    if (!(await holdingsPay(plan.cost, monthlyPaySource()))) return;
    const cal = calendarState();
    h.build.startT = cal.t; h.build.days = plan.days;
    h.status = 'building';
    h.value = holdingNum(h.value) + plan.cost;
    holdingsLog(`Construction begun on ${h.name}: ${holdingGp(plan.cost)}, ${plan.days} days, ready on ${calDateText(calParts(buildFinishT(h)), false)}.`, { spent: plan.cost });
    holdingsSave();
    if (typeof renderGameClock === 'function') renderGameClock();
}

function finishHoldingConstruction(hid) {
    const h = findHolding(hid);
    if (!h) return;
    h.status = 'owned';
    holdingsLog(`${h.name} is finished.`);
    holdingsSave();
    if (typeof renderGameClock === 'function') renderGameClock();
}

// ---------------------------------------------------------------------------
// Money
// Money for bills can come from the carried purse, the vault, or both (calendar option paySource).
const PAY_SOURCES = [
    ['purse', 'Purse'], ['vault', 'Vault'], ['vaultFirst', 'Vault, then purse'], ['purseFirst', 'Purse, then vault'],
];
function coinsValue(c) {
    c = c || {};
    return (Number(c.pp) || 0) * 5 + (Number(c.gp) || 0) + (Number(c.ep) || 0) / 2 + (Number(c.sp) || 0) / 10 + (Number(c.cp) || 0) / 100;
}
function holdingsPurse() { return coinsValue(currentCharacter.coins); }
function holdingsVault() { return coinsValue(currentCharacter.vaultCoins); }
function monthlyPaySource() {
    const s = typeof calendarState === 'function' ? calendarState()?.settings?.paySource : null;
    return PAY_SOURCES.some(p => p[0] === s) ? s : 'purse';
}
function paySourceLabel(src) { return (PAY_SOURCES.find(p => p[0] === src) || PAY_SOURCES[0])[1].toLowerCase(); }
function paySourceWallets(src) {
    const ch = currentCharacter;
    if (!ch.coins) ch.coins = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
    if (!ch.vaultCoins) ch.vaultCoins = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
    return src === 'vault' ? [ch.vaultCoins] : src === 'vaultFirst' ? [ch.vaultCoins, ch.coins] : src === 'purseFirst' ? [ch.coins, ch.vaultCoins] : [ch.coins];
}
function paySourceFunds(src) { return paySourceWallets(src).reduce((s, w) => s + coinsValue(w), 0); }
// Take up to `due` copper from one wallet (gold first, change given back); returns what is still owed.
function spendCoins(coins, due) {
    const value = { pp: 500, gp: 100, ep: 50, sp: 10, cp: 1 };
    const have = Math.round(coinsValue(coins) * 100);
    if (have <= due) { ['pp', 'gp', 'ep', 'sp', 'cp'].forEach(k => { coins[k] = 0; }); return due - have; }
    for (const k of ['gp', 'pp', 'ep', 'sp', 'cp']) {
        const n = Number(coins[k]) || 0;
        const use = Math.min(n, Math.ceil(due / value[k]));
        coins[k] = n - use; due -= use * value[k];
        if (due <= 0) break;
    }
    if (due < 0) { let change = -due; for (const k of ['gp', 'sp', 'cp']) { const n = Math.floor(change / value[k]); coins[k] = (Number(coins[k]) || 0) + n; change -= n * value[k]; } }
    return 0;
}
async function holdingsPay(total, src = 'purse') {
    const funds = paySourceFunds(src);
    if (funds + 1e-9 < total) {
        const where = src === 'purse' ? 'Your purse holds' : src === 'vault' ? 'Your vault holds' : 'Your purse and vault together hold';
        await sheetAlert(`${where} only ${holdingGp(funds)}, and ${holdingGp(total)} is needed.${src === 'purse' ? ' Move money from the vault first, or choose to pay bills from the vault.' : ''}`);
        return false;
    }
    let due = Math.round(total * 100);
    for (const w of paySourceWallets(src)) { if (due <= 0) break; due = spendCoins(w, due); }
    if (typeof syncInventoryUI === 'function') { try { syncInventoryUI(); } catch (e) { console.error(e); } }
    return true;
}
function setPaySource(src) {
    if (typeof calendarState !== 'function') return;
    calendarState().settings.paySource = PAY_SOURCES.some(p => p[0] === src) ? src : 'purse';
    if (typeof debouncedSave === 'function') debouncedSave();
    if (typeof renderCompanions === 'function') { try { renderCompanions(); } catch (e) { console.error(e); } }
    renderHoldings();
}
function paySourceSelect() {
    if (typeof calendarState !== 'function') return '';
    const cur = monthlyPaySource();
    return `<label class="arc-check" title="Where wages, household costs and building costs are paid from">Pay from <select class="stat-input arc-input pay-source" onchange="setPaySource(this.value)">${PAY_SOURCES.map(([v, l]) => `<option value="${v}" ${v === cur ? 'selected' : ''}>${l}</option>`).join('')}</select></label>`;
}
window.setPaySource = setPaySource;

async function payHoldingCosts() {
    const list = householdBills();
    const perMonth = list.reduce((s, b) => s + b.amount, 0);
    if (!perMonth) return;
    // Every month since the last payment is owed (at least the current one).
    const cal = typeof calendarState === 'function' ? calendarState() : null;
    const months = cal ? Math.max(1, calParts(cal.t).monthAbs - (cal.holdingsMonth ?? calParts(cal.t).monthAbs)) : 1;
    const total = perMonth * months;
    const lines = list.map(b => `${b.name}: ${holdingGp(b.amount)}`).join('\n');
    const what = months > 1 ? `${months} months of household costs (unpaid since then)` : 'a month of household costs';
    if (!(await sheetConfirm(`Pay ${what}, ${holdingGp(total)} in all, from your ${paySourceLabel(monthlyPaySource())}?\n\nEach month:\n${lines}`, 'Pay'))) return;
    if (!(await holdingsPay(total, monthlyPaySource()))) return;
    holdingsLog(`Paid ${what.replace(' (unpaid since then)', '')}: ${holdingGp(total)} (${list.map(h => h.name).join(', ')}).`, { spent: total, months });
    if (typeof calendarState === 'function') { calendarState().holdingsMonth = calParts(calendarState().t).monthAbs; if (typeof renderGameClock === 'function') renderGameClock(); }
    holdingsSave();
}

// For the calendar's "Due" list.
function holdingsDue() {
    if (!currentCharacter || typeof calendarState !== 'function') return [];
    const c = calendarState();
    const p = calParts(c.t);
    const due = [];
    if (c.holdingsMonth === undefined) c.holdingsMonth = p.monthAbs;      // bills start with the next month
    const total = holdingsMonthlyTotal();
    const hMonths = p.monthAbs - c.holdingsMonth;
    if (total > 0 && hMonths > 0) due.push({ text: hMonths > 1 ? `Household costs owed for ${hMonths} months: ${holdingGp(total * hMonths)}` : `Household costs for ${CAL_MONTHS[p.month]}: ${holdingGp(total)}`, tab: 'tab-holdings' });
    holdingsState().forEach(h => { const f = buildFinishT(h); if (h.status === 'building' && f !== null && f <= c.t) due.push({ text: `${h.name}: construction finished`, tab: 'tab-holdings' }); });
    return due;
}

// Companions can be stationed at a home.
function holdingHomeField() {
    const homes = holdingsState().filter(holdingActive);
    if (!homes.length) return [];
    return [{ key: 'home', label: 'Stationed at', type: 'select', options: [{ value: '', label: 'With you / elsewhere' }, ...homes.map(h => ({ value: h.id, label: h.name }))] }];
}

// In the staff form: a listed job fills in (and locks) its usual wage as you type it.
function syncStaffWageField() {
    if (!document.getElementById('staff-form-marker')) return;
    const role = document.getElementById('nf-role'), wage = document.getElementById('nf-wage'), note = document.getElementById('staff-wage-note');
    if (!role || !wage) return;
    const std = holdingStandardRole(role.value);
    if (std) {
        if (!wage.readOnly) wage.dataset.own = wage.value;
        wage.value = String(std[1]); wage.readOnly = true; wage.classList.add('wage-auto');
        if (note) note.textContent = `${std[0]}: paid the usual ${holdingGp(std[1])} a month automatically.`;
    } else {
        if (wage.readOnly) wage.value = wage.dataset.own || '';
        wage.readOnly = false; wage.classList.remove('wage-auto');
        if (note) note.textContent = role.value.trim() ? 'A job of your own: set its wage yourself.' : '';
    }
}
document.addEventListener('input', e => { if (e.target && e.target.id === 'nf-role') syncStaffWageField(); });
document.addEventListener('change', e => { if (e.target && e.target.id === 'nf-role') syncStaffWageField(); });
window.staffWage = staffWage;

window.renderHoldings = renderHoldings;
window.openHoldingEditor = openHoldingEditor;
window.openHoldingStaffEditor = openHoldingStaffEditor;
window.openHoldingRoomEditor = openHoldingRoomEditor;
window.openBuildPlanner = openBuildPlanner;
window.finishHoldingConstruction = finishHoldingConstruction;
window.payHoldingCosts = payHoldingCosts;
