// js/party.js — the Party view: every member at a glance, a shared party treasury,
// and splitting treasure and XP awards between the members' sheets.
// Parties are kept in parties.json beside the characters folder (main process).

let partyData = { parties: [], activeId: null };
let partyMembers = [];         // [{ file, data, missing }]
let partyBusy = false;
let partyRenaming = false;     // the party name is being edited in place

const COIN_KEYS = ['pp', 'gp', 'ep', 'sp', 'cp'];
const COIN_GP = { pp: 5, gp: 1, ep: 0.5, sp: 0.1, cp: 0.01 };
const coinsGp = c => COIN_KEYS.reduce((s, k) => s + (Number(c?.[k]) || 0) * COIN_GP[k], 0);
const fmtCoins = c => COIN_KEYS.filter(k => Number(c?.[k])).map(k => `${Number(c[k]).toLocaleString('en-US')} ${k}`).join(', ') || 'none';

function activeParty() {
    return partyData.parties.find(p => p.id === partyData.activeId) || partyData.parties[0] || null;
}
async function saveParties() {
    try { if (window.api.saveParties) await window.api.saveParties(partyData); }
    catch (e) { console.error(e); if (typeof showSaveError === 'function') showSaveError(`Could not save the party: ${e?.message || e}`); }
}
function newParty(name = 'The Party') {
    const p = { id: `party_${Date.now().toString(36)}`, name, members: [], treasury: { pp: 0, gp: 0, ep: 0, sp: 0, cp: 0 }, items: [], notes: '', log: [] };
    partyData.parties.push(p);
    partyData.activeId = p.id;
    return p;
}
function partyLog(text) {
    const p = activeParty(); if (!p) return;
    p.log.push({ at: new Date().toISOString(), text });
    if (p.log.length > 200) p.log = p.log.slice(-200);
}

async function openPartyView() {
    const m = document.getElementById('party-modal'); if (!m) return;
    m.style.display = 'flex';
    document.getElementById('party-body').innerHTML = '<div class="ledger-note" style="padding: 12px;">Loading the party…</div>';
    try {
        const data = window.api.getParties ? await window.api.getParties() : null;
        partyData = data && Array.isArray(data.parties) ? data : { parties: [] };
    } catch (e) { partyData = { parties: [] }; }
    if (!partyData.parties.length) {
        const p = newParty();
        // Start with the character on screen, if any.
        if (currentFileName) p.members.push(currentFileName);
        await saveParties();
    }
    if (!activeParty()) partyData.activeId = partyData.parties[0].id;
    partyRenaming = false;
    await loadPartyMembers();
    renderPartyView();
}
function closePartyView() {
    const m = document.getElementById('party-modal'); if (m) m.style.display = 'none';
    partyRenaming = false;
}
registerModalCloser('party-modal', closePartyView);
async function loadPartyMembers() {
    const p = activeParty();
    if (typeof debouncedSave?.flush === 'function') debouncedSave.flush();
    try { await saveQueue; } catch (e) { /* shown elsewhere */ }
    partyMembers = await Promise.all((p ? p.members : []).map(async file => {
        if (file === currentFileName && currentCharacter) return { file, data: currentCharacter, current: true };
        try { return { file, data: await window.api.loadCharacterData(file) }; }
        catch (e) { return { file, data: null, missing: true }; }
    }));
}

// ----- Member stats ---------------------------------------------------------------------------
function memberNextXp(c) {
    try {
        // The next stage for a young creature hero, otherwise the next level.
        if (typeof nextXpThreshold === 'function') { const n = nextXpThreshold(c); return n ? n.xp : null; }
        const t = getXpTableFor(c);
        const lvl = Number(c.level) || 1;
        return t && t[lvl + 1] !== undefined ? t[lvl + 1] : null;
    } catch (e) { return null; }
}
function memberSpellsLeft(c) {
    const b = c.spellbook;
    if (!b || !b.preparedSpells) return null;
    const prep = Object.values(b.preparedSpells).reduce((s, n) => s + (Number(n) || 0), 0);
    if (!prep) return null;
    const cast = Object.entries(b.castSpells || {}).reduce((s, [id, n]) => s + Math.min(Number(n) || 0, Number(b.preparedSpells[id]) || 0), 0);
    return { left: prep - cast, prep };
}
function memberXpBonus(c) {
    try { return getPrimeRequisiteBonus(getXpBonusClass(c), c.abilities) || 0; } catch (e) { return 0; }
}

// ----- Rendering ---------------------------------------------------------------------------------
async function renderPartyView() {
    const body = document.getElementById('party-body'); if (!body) return;
    const p = activeParty();
    if (!p) { body.innerHTML = ''; return; }
    let roster = [];
    try { roster = await window.api.getCharactersList(); } catch (e) { roster = []; }
    const memberRows = partyMembers.map(({ file, data: c, missing, current }) => {
        if (missing || !c) return `<tr><td colspan="7" class="sub-caption">Missing character (${escapeHtml(file)}) <button type="button" class="btn btn-sm" onclick="togglePartyMember('${escapeHtml(file)}', false)">Remove</button></td></tr>`;
        const hp = c.hitPoints || {}; const cur = Number(hp.current) || 0, max = Math.max(1, Number(hp.maximum) || 1);
        const pct = Math.max(0, Math.min(100, Math.round(cur / max * 100)));
        const next = memberNextXp(c);
        const sp = memberSpellsLeft(c);
        const cls = c.subClass ? `${c.characterClass} / ${c.subClass}` : c.characterClass;
        return `<tr>
            <td><button type="button" class="arc-name party-open" onclick="openPartyMember('${escapeHtml(file)}')" title="Open this sheet">${escapeHtml(c.name || 'Unnamed')}</button>${current ? ' <span class="tag">on screen</span>' : ''}</td>
            <td>${escapeHtml(cls || '')} <strong>${toRoman(Number(c.level) || 1)}</strong></td>
            <td><div class="party-hp"><div class="party-hp-bar"><div style="width: ${pct}%; background: var(--${pct <= 25 ? 'danger' : pct <= 50 ? 'warn' : 'good'});"></div></div><span>${cur} / ${max}</span></div></td>
            <td class="party-num">${escapeHtml(String(c.armorClass ?? '—'))}</td>
            <td class="party-num">${(Number(c.experiencePoints) || 0).toLocaleString('en-US')}${next !== null ? `<div class="sub-caption" style="margin: 0;">${Math.max(0, next - (Number(c.experiencePoints) || 0)).toLocaleString('en-US')} to go</div>` : ''}</td>
            <td class="party-num">${sp ? `${sp.left} / ${sp.prep}` : '—'}</td>
            <td class="party-num">${Math.floor(coinsGp(c.coins)).toLocaleString('en-US')} gp</td>
        </tr>`;
    }).join('');
    const live = partyMembers.filter(m => m.data && !m.missing);
    const t = p.treasury;
    const shareInputs = live.map(m => `<label class="arc-field arc-narrow"><span class="eyebrow">${escapeHtml(m.data.name || '?')}</span><input type="number" min="0" step="0.5" class="stat-input arc-input party-share" data-file="${escapeHtml(m.file)}" value="${Number(p.shares?.[m.file] ?? 1)}" onchange="setPartyShare('${escapeHtml(m.file)}', this.value)"></label>`).join('');
    body.innerHTML = `
        <div class="arc-fields party-picker">
            ${partyRenaming ? `
            <label class="arc-field"><span class="eyebrow">Party name</span><input type="text" id="party-rename-input" class="stat-input arc-input" maxlength="80" value="${escapeHtml(p.name)}" onkeydown="if (event.key === 'Enter') { event.preventDefault(); renameParty(this.value); } else if (event.key === 'Escape') { event.preventDefault(); event.stopPropagation(); cancelPartyRename(); }"></label>
            <span class="arc-actions" style="margin: 0;"><button type="button" class="btn btn-sm btn-accent" onclick="renameParty(document.getElementById('party-rename-input').value)">Save name</button><button type="button" class="btn btn-sm" onclick="cancelPartyRename()">Cancel</button></span>`
            : `
            <label class="arc-field"><span class="eyebrow">Party</span><span class="party-pick-row"><select class="stat-input arc-input" aria-label="Party" onchange="switchParty(this.value)">${partyData.parties.map(x => `<option value="${x.id}" ${x.id === p.id ? 'selected' : ''}>${escapeHtml(x.name)}</option>`).join('')}</select><button type="button" class="icon-btn party-rename-btn" onclick="startPartyRename()" title="Rename this party" aria-label="Rename this party">${getIcon('edit', 14)}</button></span></label>
            <span class="arc-actions" style="margin: 0;"><button type="button" class="btn btn-sm" onclick="addParty()">+ New party</button></span>`}
        </div>

        <div class="arc-sub-head"><span class="eyebrow eyebrow-strong">Members</span><span class="eyebrow">${live.length} character${live.length === 1 ? '' : 's'}</span></div>
        ${live.length ? `<div class="party-table-wrap"><table class="party-table"><thead><tr><th>Name</th><th>Class</th><th>Hit points</th><th>AC</th><th>XP</th><th>Spells left</th><th>Purse</th></tr></thead><tbody>${memberRows}</tbody></table></div>` : '<p class="sub-caption">No members yet: tick characters below.</p>'}
        <details class="arc-rules" ${live.length ? '' : 'open'}><summary>Choose members</summary>
            <div class="cat-talents">${roster.map(r => `<label class="arc-check cat-talent"><input type="checkbox" ${p.members.includes(r.id) ? 'checked' : ''} onchange="togglePartyMember('${escapeHtml(r.id)}', this.checked)"> ${escapeHtml(r.name || r.id)} <span class="eyebrow">${escapeHtml(String(r.class || ''))} ${escapeHtml(String(r.level || ''))}</span></label>`).join('') || '<span class="sub-caption">No saved characters.</span>'}</div>
        </details>

        <div class="arc-sub-head"><span class="eyebrow eyebrow-strong">Party treasury</span><span class="eyebrow">${Math.floor(coinsGp(t) * 100) / 100} gp in value</span></div>
        <div class="arc-fields">${COIN_KEYS.map(k => `<label class="arc-field arc-narrow"><span class="eyebrow">${k.toUpperCase()}</span><input type="number" min="0" class="stat-input arc-input" value="${Number(t[k]) || 0}" onchange="setTreasuryCoin('${k}', this.value)"></label>`).join('')}</div>
        <div class="arc-book">${p.items.map(it => `<div class="arc-book-row"><span>${escapeHtml(it.text)}</span>${it.value ? `<span class="eyebrow">${Number(it.value).toLocaleString('en-US')} gp</span>` : ''}<button type="button" class="icon-btn danger" onclick="removeTreasuryItem('${it.id}')" aria-label="Remove">${getIcon('close', 13)}</button></div>`).join('') || '<div class="ledger-note">No shared items, gems or art.</div>'}</div>
        <div class="arc-actions"><input type="text" id="party-item-text" class="stat-input arc-input" placeholder="Shared item, gem or art object" style="flex: 1;"><input type="number" id="party-item-value" class="stat-input arc-input" placeholder="Value gp" style="max-width: 110px;"><button type="button" class="btn btn-sm" onclick="addTreasuryItem()">Add</button></div>

        <div class="arc-sub-head"><span class="eyebrow eyebrow-strong">Divide treasure &amp; award XP</span><span class="eyebrow">each member's prime-requisite bonus applies to XP</span></div>
        ${live.length ? `
        <div class="arc-fields">${shareInputs}</div>
        <p class="sub-caption arc-note">Shares: 1 each by default; give a retainer or hireling ½ a share, or 0 to leave someone out.</p>
        <div class="arc-fields">
            <label class="arc-field arc-narrow"><span class="eyebrow">XP for the party</span><input type="number" min="0" id="party-xp" class="stat-input arc-input" placeholder="0" oninput="renderPartySplitPreview()"></label>
            <label class="arc-field"><span class="eyebrow">Source (for the logs)</span><input type="text" id="party-source" class="stat-input arc-input" placeholder="e.g. Session 12: the Black Tower"></label>
        </div>
        <div class="arc-fields">${COIN_KEYS.map(k => `<label class="arc-field arc-narrow"><span class="eyebrow">Split ${k.toUpperCase()}</span><input type="number" min="0" id="party-split-${k}" class="stat-input arc-input" placeholder="0" oninput="renderPartySplitPreview()"></label>`).join('')}
            <label class="arc-check"><input type="checkbox" id="party-from-treasury" onchange="renderPartySplitPreview()"> Take the coins from the party treasury</label>
            <button type="button" class="btn btn-sm" onclick="fillSplitFromTreasury()">Use whole treasury</button>
        </div>
        <div id="party-split-preview"></div>
        <div class="arc-actions"><button type="button" class="btn btn-sm btn-accent" onclick="applyPartySplit()">Divide and award</button></div>` : '<p class="sub-caption">Add members first.</p>'}

        <div class="arc-sub-head"><span class="eyebrow eyebrow-strong">Party notes</span></div>
        <textarea class="stat-input arc-input" rows="3" placeholder="Goals, rumours, debts, who carries what…" onchange="setPartyNotes(this.value)">${escapeHtml(p.notes || '')}</textarea>
        ${p.log.length ? `<details class="arc-rules"><summary>Party log (${p.log.length})</summary><div class="chronicle-list">${p.log.slice().reverse().map(e => `<div class="chronicle-row" style="grid-template-columns: 1fr;"><div><div class="chronicle-text">${escapeHtml(e.text)}</div><div class="chronicle-meta">${escapeHtml(new Date(e.at).toLocaleString())}</div></div></div>`).join('')}</div></details>` : ''}
        <div class="party-delete-row"><button type="button" class="link-btn party-delete" onclick="deleteParty()">Delete this party…</button><span class="sub-caption">The characters themselves are kept.</span></div>`;
    renderPartySplitPreview();
}

// ----- Party editing ------------------------------------------------------------------------------
async function switchParty(id) { partyRenaming = false; partyData.activeId = id; await saveParties(); await loadPartyMembers(); renderPartyView(); }
async function addParty() { partyRenaming = false; newParty(`Party ${partyData.parties.length + 1}`); await saveParties(); await loadPartyMembers(); renderPartyView(); }
async function deleteParty() {
    const p = activeParty(); if (!p) return;
    if (!(await sheetConfirm(`Delete the party "${p.name}"? The characters themselves are not touched.`, 'Delete'))) return;
    partyData.parties = partyData.parties.filter(x => x.id !== p.id);
    if (!partyData.parties.length) newParty();
    partyData.activeId = partyData.parties[0].id;
    await saveParties(); await loadPartyMembers(); renderPartyView();
}
async function renameParty(name) { const p = activeParty(); if (!p) return; p.name = String(name || '').trim().slice(0, 80) || 'The Party'; partyRenaming = false; await saveParties(); renderPartyView(); }
function startPartyRename() {
    partyRenaming = true;
    renderPartyView().then(() => { const el = document.getElementById('party-rename-input'); if (el) { el.focus(); el.select(); } });
}
function cancelPartyRename() { partyRenaming = false; renderPartyView(); }
async function setPartyNotes(v) { const p = activeParty(); if (!p) return; p.notes = String(v || '').slice(0, 20000); await saveParties(); }
async function togglePartyMember(file, on) {
    const p = activeParty(); if (!p) return;
    p.members = p.members.filter(f => f !== file);
    if (on) p.members.push(file);
    await saveParties(); await loadPartyMembers(); renderPartyView();
}
async function setPartyShare(file, v) {
    const p = activeParty(); if (!p) return;
    if (!p.shares) p.shares = {};
    p.shares[file] = Math.max(0, Math.round((Number(v) || 0) * 2) / 2);
    await saveParties(); renderPartySplitPreview();
}
async function setTreasuryCoin(k, v) { const p = activeParty(); if (!p) return; p.treasury[k] = Math.max(0, Math.floor(Number(v) || 0)); await saveParties(); renderPartyView(); }
async function addTreasuryItem() {
    const p = activeParty(); if (!p) return;
    const text = (document.getElementById('party-item-text')?.value || '').trim(); if (!text) return;
    const value = Math.max(0, Number(document.getElementById('party-item-value')?.value) || 0);
    p.items.push({ id: `pi_${Date.now().toString(36)}`, text: text.slice(0, 200), value });
    partyLog(`Added to the party treasury: ${text}${value ? ` (${value} gp)` : ''}.`);
    await saveParties(); renderPartyView();
}
async function removeTreasuryItem(id) { const p = activeParty(); if (!p) return; p.items = p.items.filter(i => i.id !== id); await saveParties(); renderPartyView(); }
function openPartyMember(file) {
    closePartyView();
    if (file === currentFileName) return;
    const sel = document.getElementById('character-roster'); if (!sel) return;
    sel.value = file;
    sel.dispatchEvent(new Event('change', { bubbles: true }));
}
function fillSplitFromTreasury() {
    const p = activeParty(); if (!p) return;
    COIN_KEYS.forEach(k => { const el = document.getElementById(`party-split-${k}`); if (el) el.value = Number(p.treasury[k]) || ''; });
    const box = document.getElementById('party-from-treasury'); if (box) box.checked = true;
    renderPartySplitPreview();
}

// ----- Dividing treasure and XP --------------------------------------------------------------------
function readSplit() {
    const p = activeParty();
    const coins = {}; COIN_KEYS.forEach(k => { coins[k] = Math.max(0, Math.floor(Number(document.getElementById(`party-split-${k}`)?.value) || 0)); });
    const xp = Math.max(0, Math.floor(Number(document.getElementById('party-xp')?.value) || 0));
    const fromTreasury = Boolean(document.getElementById('party-from-treasury')?.checked);
    const live = partyMembers.filter(m => m.data && !m.missing);
    const shares = live.map(m => ({ m, share: Number(p.shares?.[m.file] ?? 1) }));
    const total = shares.reduce((s, x) => s + x.share, 0);
    const per = shares.map(({ m, share }) => {
        const got = {}; COIN_KEYS.forEach(k => { got[k] = total ? Math.floor(coins[k] * share / total) : 0; });
        const baseXp = total ? Math.floor(xp * share / total) : 0;
        const bonus = memberXpBonus(m.data);
        return { m, share, coins: got, baseXp, bonus, xp: Math.floor(baseXp * (1 + bonus / 100)) };
    });
    const left = {}; COIN_KEYS.forEach(k => { left[k] = coins[k] - per.reduce((s, x) => s + x.coins[k], 0); });
    return { coins, xp, fromTreasury, per, left, total };
}
function renderPartySplitPreview() {
    const el = document.getElementById('party-split-preview'); if (!el) return;
    const s = readSplit(); const p = activeParty();
    const any = s.xp || COIN_KEYS.some(k => s.coins[k]);
    if (!any) { el.innerHTML = ''; return; }
    const short = s.fromTreasury ? COIN_KEYS.filter(k => s.coins[k] > (Number(p.treasury[k]) || 0)) : [];
    el.innerHTML = `
        <div class="party-table-wrap"><table class="party-table"><thead><tr><th>Member</th><th>Shares</th><th>Coins</th><th>XP</th></tr></thead><tbody>
        ${s.per.map(x => `<tr><td>${escapeHtml(x.m.data.name || '?')}</td><td class="party-num">${x.share}</td><td>${escapeHtml(fmtCoins(x.coins))}</td><td class="party-num">${x.xp.toLocaleString('en-US')}${x.bonus ? ` <span class="eyebrow">(${x.baseXp.toLocaleString('en-US')} ${x.bonus > 0 ? '+' : ''}${x.bonus}%)</span>` : ''}</td></tr>`).join('')}
        </tbody></table></div>
        <p class="sub-caption arc-note">Left over (goes to the party treasury): ${escapeHtml(fmtCoins(s.left))}.${!s.total ? ' <span style="color: var(--danger);">Nobody has a share.</span>' : ''}${short.length ? ` <span style="color: var(--danger);">The treasury does not hold that much ${short.join(', ')}.</span>` : ''}</p>`;
}
// Add XP to a character's data (one level per award at most, like the sheet's own award).
function addXpToData(c, amount, text) {
    const table = getXpTableFor(c);
    const lvl = Number(c.level) || 1;
    const before = Number(c.experiencePoints) || 0;
    let xp = before + amount;
    if (table && lvl < 36) xp = Math.min(xp, typeof xpAwardCap === 'function' ? xpAwardCap(c) : (table[lvl + 2] ?? Infinity) - 1);
    const stageBefore = typeof getCreatureStage === 'function' ? getCreatureStage(c) : null;
    c.experiencePoints = xp;
    let after = lvl;
    if (table && lvl < 36 && table[lvl + 1] !== undefined && xp >= table[lvl + 1]) { after = lvl + 1; c.level = after; }
    if (!Array.isArray(c.chronicle)) c.chronicle = [];
    const stamp = () => ({ id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, at: new Date().toISOString() });
    c.chronicle.push({ ...stamp(), kind: 'xp', text: `${text}: +${(xp - before).toLocaleString('en-US')} XP${xp - before < amount ? ' (capped: one level per award)' : ''}. Total ${xp.toLocaleString('en-US')}.`, data: { awarded: amount, credited: xp - before, total: xp } });
    if (after > lvl) c.chronicle.push({ ...stamp(), kind: 'level', text: `Level ${lvl} → ${after} (party award). Hit points not yet rolled: add them on the sheet.`, data: { from: lvl, to: after } });
    else {
        const stageAfter = typeof getCreatureStage === 'function' ? getCreatureStage(c) : null;
        if (stageBefore && stageAfter !== stageBefore) c.chronicle.push({ ...stamp(), kind: 'level', text: `${stageBefore.name} → ${stageAfter ? stageAfter.name : 'level I'} (party award). New Hit Dice not yet rolled: add them on the sheet.`, data: { from: lvl, to: after } });
    }
    return { credited: xp - before, levelUp: after > lvl ? [lvl, after] : null };
}
async function applyPartySplit() {
    if (partyBusy) return;
    const p = activeParty(); if (!p) return;
    const s = readSplit();
    if (!s.total) { await sheetAlert('Nobody has a share.'); return; }
    if (!s.xp && !COIN_KEYS.some(k => s.coins[k])) { await sheetAlert('Enter XP or coins to divide.'); return; }
    if (s.fromTreasury && COIN_KEYS.some(k => s.coins[k] > (Number(p.treasury[k]) || 0))) { await sheetAlert('The party treasury does not hold that many coins.'); return; }
    if (!(await sheetConfirm(`Divide ${fmtCoins(s.coins)}${s.xp ? ` and ${s.xp.toLocaleString('en-US')} XP` : ''} between ${s.per.filter(x => x.share).length} members? Each sheet is updated and saved.`, 'Divide'))) return;
    partyBusy = true;
    const source = (document.getElementById('party-source')?.value || '').trim();
    const label = source || `Party award (${p.name})`;
    const results = [];
    try {
        if (typeof debouncedSave?.flush === 'function') debouncedSave.flush();
        try { await saveQueue; } catch (e) { /* */ }
        for (const x of s.per) {
            if (!x.share) continue;
            const isCurrent = x.m.file === currentFileName && currentCharacter;
            const c = isCurrent ? currentCharacter : await window.api.loadCharacterData(x.m.file);
            if (!c.coins) c.coins = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 };
            COIN_KEYS.forEach(k => { c.coins[k] = (Number(c.coins[k]) || 0) + x.coins[k]; });
            const coinText = COIN_KEYS.some(k => x.coins[k]) ? fmtCoins(x.coins) : '';
            let lv = null;
            if (isCurrent) {
                if (coinText && typeof addChronicleEntry === 'function') addChronicleEntry('treasure', `${label}: share of the treasure (${x.share} share${x.share === 1 ? '' : 's'}): ${coinText}.`, { coins: x.coins });
                if (x.xp) {
                    const lvlBefore = Number(c.level) || 1;
                    awardRawXp(x.xp, `${label}${x.bonus ? ` (${x.baseXp.toLocaleString('en-US')} ${x.bonus > 0 ? '+' : ''}${x.bonus}% bonus)` : ''}`);
                    if ((Number(c.level) || 1) > lvlBefore) lv = [lvlBefore, c.level];
                }
                if (typeof syncInventoryUI === 'function') syncInventoryUI();
                saveChanges();
            } else {
                if (!Array.isArray(c.chronicle)) c.chronicle = [];
                if (coinText) c.chronicle.push({ id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, at: new Date().toISOString(), kind: 'treasure', text: `${label}: share of the treasure (${x.share} share${x.share === 1 ? '' : 's'}): ${coinText}.`, data: { coins: x.coins } });
                if (x.xp) lv = addXpToData(c, x.xp, `${label}${x.bonus ? ` (${x.baseXp.toLocaleString('en-US')} ${x.bonus > 0 ? '+' : ''}${x.bonus}% bonus)` : ''}`).levelUp;
                const res = await window.api.saveCharacter({ data: c, oldFilename: x.m.file });
                if (res && res.filename && res.filename !== x.m.file) p.members = p.members.map(f => (f === x.m.file ? res.filename : f));
            }
            results.push(`${c.name}: ${coinText || 'no coins'}${x.xp ? `, ${x.xp.toLocaleString('en-US')} XP` : ''}${lv ? ` (level ${lv[1]}!)` : ''}`);
        }
        if (s.fromTreasury) COIN_KEYS.forEach(k => { p.treasury[k] = (Number(p.treasury[k]) || 0) - s.coins[k] + s.left[k]; });
        else COIN_KEYS.forEach(k => { p.treasury[k] = (Number(p.treasury[k]) || 0) + s.left[k]; });
        partyLog(`${label}: divided ${fmtCoins(s.coins)}${s.xp ? ` and ${s.xp.toLocaleString('en-US')} XP` : ''}. ${results.join('; ')}.`);
        await saveParties();
        if (typeof loadRoster === 'function') loadRoster();
    } catch (e) {
        console.error(e);
        await sheetAlert(`Something went wrong while dividing: ${e?.message || e}. Check the members' sheets.`);
    } finally {
        partyBusy = false;
    }
    COIN_KEYS.forEach(k => { const el = document.getElementById(`party-split-${k}`); if (el) el.value = ''; });
    await loadPartyMembers();
    await renderPartyView();
    const msg = results.some(r => r.includes('level')) ? ' Members who gained a level need their hit points rolled on their sheets.' : '';
    await sheetAlert(`Done. ${results.join('\n')}${msg}`);
}

Object.assign(window, {
    openPartyView, closePartyView, startPartyRename, cancelPartyRename, switchParty, addParty, deleteParty, renameParty, setPartyNotes, togglePartyMember,
    setPartyShare, setTreasuryCoin, addTreasuryItem, removeTreasuryItem, openPartyMember, fillSplitFromTreasury,
    renderPartySplitPreview, applyPartySplit,
});
