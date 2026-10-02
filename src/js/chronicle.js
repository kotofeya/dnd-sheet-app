// js/chronicle.js — the character's record: adventure log, level-up records and
// version history (restore points kept by the main process).

// ---------------------------------------------------------------------------
// Adventure log
// ---------------------------------------------------------------------------
const CHRONICLE_KINDS = {
    xp:       { label: 'Experience',  icon: 'star' },
    subxp:    { label: 'Sub-class XP', icon: 'star' },
    treasure: { label: 'Treasure',    icon: 'coin' },
    level:    { label: 'Level up',    icon: 'up' },
    edit:     { label: 'Edited',      icon: 'print' },
    restore:  { label: 'Restored',    icon: 'hourglass' },
    note:     { label: 'Note',        icon: 'import' },
    arcana:   { label: 'Arcana',      icon: 'flask' },
    training: { label: 'Training',    icon: 'sword' },
    dominion: { label: 'Dominion',    icon: 'crown' },
    companion: { label: 'Companions', icon: 'party' },
    holding:  { label: 'Holdings',    icon: 'vault' },
    time:     { label: 'Time',        icon: 'hourglass' },
};
let chronicleFilter = 'all';

function fmtNum(n) { return (Math.round(Number(n) || 0)).toLocaleString('en-US'); }

function addChronicleEntry(kind, text, data = {}) {
    if (!currentCharacter) return null;
    if (!Array.isArray(currentCharacter.chronicle)) currentCharacter.chronicle = [];
    const entry = { id: `log_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`, at: new Date().toISOString(), kind, text, data };
    if (typeof gameDateText === 'function') { try { entry.gameDate = gameDateText(); } catch (e) { /* no calendar yet */ } }
    currentCharacter.chronicle.push(entry);
    renderChronicle();
    if (typeof debouncedSave === 'function') debouncedSave();
    return entry;
}

function setChronicleFilter(kind) {
    chronicleFilter = kind;
    renderChronicle();
}

function renderChronicle() {
    const list = document.getElementById('chronicle-list');
    const count = document.getElementById('chronicle-count');
    if (!list) return;
    const all = (currentCharacter && Array.isArray(currentCharacter.chronicle)) ? currentCharacter.chronicle : [];
    const groups = { all: () => true, xp: e => e.kind === 'xp' || e.kind === 'subxp', treasure: e => e.kind === 'treasure',
                     level: e => e.kind === 'level' || e.kind === 'training', realm: e => e.kind === 'arcana' || e.kind === 'dominion',
                     other: e => ['edit', 'restore', 'note', 'companion', 'holding', 'time'].includes(e.kind) };
    const shown = all.filter(groups[chronicleFilter] || groups.all).slice().reverse();     // newest first
    if (count) count.innerText = all.length;
    document.querySelectorAll('[data-chronicle-filter]').forEach(b => b.classList.toggle('on', b.dataset.chronicleFilter === chronicleFilter));

    if (!shown.length) {
        list.innerHTML = `<div class="ledger-note" style="padding: 10px 0;">${all.length ? 'Nothing of this kind yet.' : 'No entries yet. XP awards, treasure shares, level-ups and edits will be recorded here.'}</div>`;
        return;
    }
    list.innerHTML = shown.map(e => {
        const meta = CHRONICLE_KINDS[e.kind] || CHRONICLE_KINDS.note;
        const when = new Date(e.at);
        const date = isNaN(when) ? '' : when.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
        const time = isNaN(when) ? '' : when.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
        return `
            <div class="chronicle-row" data-log-id="${String(e.id).replace(/[^\w-]/g, '')}">
                <span class="chronicle-icon" title="${escapeHtml(meta.label)}">${getIcon(meta.icon, 16)}</span>
                <div class="chronicle-body">
                    <div class="chronicle-text">${escapeHtml(e.text)}</div>
                    <div class="chronicle-meta">${escapeHtml(meta.label)}${e.gameDate ? ` · <span class="chronicle-gamedate" title="In-game date">${escapeHtml(e.gameDate)}</span>` : ''} · ${escapeHtml(date)} ${escapeHtml(time)}</div>
                </div>
                <button type="button" class="icon-btn danger" onclick="deleteChronicleEntry('${e.id}')" title="Delete entry (does not change your totals)" aria-label="Delete entry">${getIcon('close', 14)}</button>
            </div>`;
    }).join('');
}

async function deleteChronicleEntry(id) {
    if (!currentCharacter || !Array.isArray(currentCharacter.chronicle)) return;
    const ok = await sheetConfirm('Delete this log entry? Your XP, coins and hit points are not changed.', 'Delete');
    if (!ok) return;
    currentCharacter.chronicle = currentCharacter.chronicle.filter(e => e.id !== id);
    renderChronicle();
    if (typeof debouncedSave === 'function') debouncedSave();
}

function addChronicleNote() {
    const input = document.getElementById('chronicle-note-input');
    const text = input ? input.value.trim() : '';
    if (!text || !currentCharacter) return;
    addChronicleEntry('note', text);
    input.value = '';
}

// Manual edits of XP and levels are logged with their before/after values, so the
// record always explains the totals. The value is captured when the field gains focus.
const TRACKED_FIELDS = {
    'char-xp':       { label: 'XP',              read: () => Number(currentCharacter?.experiencePoints) || 0, fmt: fmtNum },
    'char-level':    { label: 'Level',           read: () => Number(currentCharacter?.level) || 1, fmt: v => v },
    'char-subxp':    { label: 'Sub-class XP',    read: () => Number(currentCharacter?.subClassXP) || 0, fmt: fmtNum },
    'char-sublevel': { label: 'Sub-class level', read: () => Number(currentCharacter?.subClassLevel) || 1, fmt: v => v },
    'hp-max':        { label: 'Maximum hit points', read: () => Number(currentCharacter?.hitPoints?.maximum) || 0, fmt: v => v },
};
document.addEventListener('focusin', e => {
    const f = TRACKED_FIELDS[e.target?.id];
    if (f && currentCharacter) e.target.dataset.before = String(f.read());
});
document.addEventListener('change', e => {
    const f = TRACKED_FIELDS[e.target?.id];
    if (!f || !currentCharacter || e.target.dataset.before === undefined) return;
    const before = Number(e.target.dataset.before);
    // Let the sheet's own listeners update the character first.
    setTimeout(() => {
        const after = f.read();
        if (after !== before) {
            addChronicleEntry('edit', `${f.label} changed by hand: ${f.fmt(before)} → ${f.fmt(after)}`, { field: e.target.id, before, after });
        }
        e.target.dataset.before = String(after);
    }, 0);
});

// ---------------------------------------------------------------------------
// Level-up record
// ---------------------------------------------------------------------------
let pendingLevelUp = null;

function withLevel(character, level) {
    return { ...character, level, experiencePoints: Math.max(Number(character.experiencePoints) || 0, 0) };
}

// What changes between two levels, for the record and the dialog.
function describeLevelGains(character, fromLvl, toLvl) {
    const info = ClassesDatabase[character.characterClass] || {};
    const option = (typeof getClassOption === 'function') ? getClassOption(character) : null;
    const notes = [];
    const conMod = Number(character.abilities?.constitution?.modifier) || 0;
    const con = conMod ? ` ${conMod > 0 ? '+' : ''}${conMod} (Con)` : '';

    // Hit points for the new level.
    let hpHint = '', fixedHp = null;
    if (Array.isArray(info.hitDiceTable)) {
        const [d0, p0] = info.hitDiceTable[fromLvl] || [0, 0];
        const [d1, p1] = info.hitDiceTable[toLvl] || [d0, p0];
        if (d1 > d0) hpHint = `Roll ${d1 - d0}d${info.hitDie}${con}`;
        else if (p1 > p0) { fixedHp = p1 - p0; hpHint = `+${fixedHp} (fixed, no Con)`; }
        else { fixedHp = 0; hpHint = 'No new Hit Die at this level'; }
    } else if (toLvl <= 9) {
        const bonus = Number(info.hpDieBonus) || 0;
        hpHint = `Roll 1d${info.hitDie || 8}${bonus ? ` +${bonus}` : ''}${con}`;
    } else {
        fixedHp = option?.hpPerLevelAfter9 ?? info.hpPerLevelAfter9 ?? 1;
        hpHint = `+${fixedHp} (fixed after 9th level, no Con)`;
    }

    // Skill slots and weapon feats.
    if (typeof getTotalSkillSlots === 'function') {
        const s = getTotalSkillSlots(withLevel(character, toLvl)) - getTotalSkillSlots(withLevel(character, fromLvl));
        if (s > 0) notes.push(`+${s} general skill slot${s > 1 ? 's' : ''}`);
    }
    const feats = info.weaponFeatsProgression;
    if (feats && Array.isArray(feats.gainLevels) && feats.gainLevels.includes(toLvl)) notes.push('+1 weapon feat');

    // Spells: compare slot rows of every spellbook.
    if (typeof getCasterProfiles === 'function') {
        const before = getCasterProfiles(withLevel(character, fromLvl));
        const after = getCasterProfiles(withLevel(character, toLvl));
        after.forEach(p => {
            const q = before.find(b => b.key === p.key) || { slots: [] };
            const changes = (p.slots || []).map((n, i) => n - ((q.slots || [])[i] || 0)).map((d, i) => d > 0 ? `+${d} level ${i + 1}` : '').filter(Boolean);
            if (changes.length) notes.push(`${p.title || (p.type === 'arcane' ? 'Spells' : 'Prayers')}: ${changes.join(', ')}`);
        });
    }

    // Class abilities gained at exactly this level.
    const features = [...(info.features || []), ...((option && option.sharesMainLevel) ? (option.features || []) : [])]
        .filter(f => f.minLevel > fromLvl && f.minLevel <= toLvl).map(f => f.name);
    if (features.length) notes.push(`New: ${features.join(', ')}`);
    if (info.smashParryLevel && fromLvl < info.smashParryLevel && toLvl >= info.smashParryLevel) notes.push('Fighter Combat Options');

    return { hpHint, fixedHp, notes };
}

function openLevelUpDialog(fromLvl, toLvl) {
    if (!currentCharacter) return;
    const gains = describeLevelGains(currentCharacter, fromLvl, toLvl);
    pendingLevelUp = { fromLvl, toLvl, gains };
    safeSetText('levelup-title', `${currentCharacter.name || 'Your hero'} reaches level ${toRoman(toLvl)}`);
    safeSetText('levelup-hp-hint', gains.hpHint);
    const hpInput = document.getElementById('levelup-hp');
    if (hpInput) { hpInput.value = gains.fixedHp !== null ? gains.fixedHp : ''; hpInput.placeholder = 'Hit points rolled'; }
    const list = document.getElementById('levelup-gains');
    if (list) list.innerHTML = gains.notes.length ? gains.notes.map(n => `<li>${escapeHtml(n)}</li>`).join('') : '<li>No other changes at this level.</li>';
    document.getElementById('levelup-modal').style.display = 'flex';
    if (hpInput && gains.fixedHp === null) setTimeout(() => hpInput.focus(), 50);
}

function confirmLevelUp(recordHp = true) {
    if (!pendingLevelUp || !currentCharacter) return closeLevelUpDialog();
    const { fromLvl, toLvl, gains } = pendingLevelUp;
    const raw = document.getElementById('levelup-hp')?.value;
    const hp = recordHp && raw !== '' && raw != null ? Math.max(0, Math.trunc(Number(raw) || 0)) : null;
    let text = `Level ${fromLvl} → ${toLvl}.`;
    if (hp !== null) {
        if (!currentCharacter.hitPoints) currentCharacter.hitPoints = { current: 0, maximum: 0 };
        currentCharacter.hitPoints.maximum = (Number(currentCharacter.hitPoints.maximum) || 0) + hp;
        currentCharacter.hitPoints.current = (Number(currentCharacter.hitPoints.current) || 0) + hp;
        safeSetVal('hp-max', currentCharacter.hitPoints.maximum);
        safeSetVal('hp-current', currentCharacter.hitPoints.current);
        if (typeof updateCombatVitals === 'function') updateCombatVitals();
        text += ` Hit points +${hp} (${gains.hpHint}), now ${currentCharacter.hitPoints.maximum}.`;
    } else {
        text += ' Hit points not recorded.';
    }
    if (gains.notes.length) text += ' ' + gains.notes.join('; ') + '.';
    addChronicleEntry('level', text, { from: fromLvl, to: toLvl, hpGained: hp, hpMax: currentCharacter.hitPoints?.maximum, gains: gains.notes });
    closeLevelUpDialog();
}

function closeLevelUpDialog() {
    pendingLevelUp = null;
    const m = document.getElementById('levelup-modal');
    if (m) m.style.display = 'none';
}

// ---------------------------------------------------------------------------
// Version history
// ---------------------------------------------------------------------------
async function openHistoryModal() {
    const modal = document.getElementById('history-modal');
    const list = document.getElementById('history-list');
    if (!modal || !list) return;
    modal.style.display = 'flex';
    if (!currentCharacter) { list.innerHTML = '<div class="ledger-note">Open a character first.</div>'; return; }
    if (typeof debouncedSave?.flush === 'function') debouncedSave.flush();
    await saveQueue;
    if (!currentFileName) { list.innerHTML = '<div class="ledger-note">This character has not been saved yet.</div>'; return; }
    list.innerHTML = '<div class="ledger-note">Loading…</div>';
    let versions = [];
    try { versions = await window.api.listCharacterVersions(currentFileName); }
    catch (err) { list.innerHTML = `<div class="ledger-note">Could not read the history: ${escapeHtml(err?.message || String(err))}</div>`; return; }
    if (!versions.length) {
        list.innerHTML = '<div class="ledger-note">No restore points yet. One is kept automatically every 10 minutes while you edit, or use “Save restore point now”.</div>';
        return;
    }
    list.innerHTML = versions.map(v => {
        const when = new Date(v.savedAt);
        const hp = v.hitPoints ? ` · HP ${v.hitPoints.current ?? '?'}/${v.hitPoints.maximum ?? '?'}` : '';
        return `
            <div class="chronicle-row">
                <span class="chronicle-icon">${getIcon('hourglass', 16)}</span>
                <div class="chronicle-body">
                    <div class="chronicle-text">${escapeHtml(when.toLocaleString())}</div>
                    <div class="chronicle-meta">${escapeHtml(v.name || '')} · ${escapeHtml(v.characterClass || '')} level ${escapeHtml(String(v.level ?? '?'))} · ${fmtNum(v.experiencePoints)} XP${escapeHtml(hp)}</div>
                </div>
                <button type="button" class="btn btn-sm" onclick="restoreVersion('${escapeHtml(v.file)}')">Restore</button>
            </div>`;
    }).join('');
}

function closeHistoryModal() {
    const m = document.getElementById('history-modal');
    if (m) m.style.display = 'none';
}

async function saveRestorePointNow() {
    if (!currentCharacter) return;
    if (typeof debouncedSave?.cancel === 'function') debouncedSave.cancel();
    window.__forceRestorePoint = true;
    await saveChanges();
    await openHistoryModal();
}

async function restoreVersion(file) {
    if (!currentCharacter || !currentFileName) return;
    const when = new Date(Number(String(file).replace('.json', ''))).toLocaleString();
    if (!(await sheetConfirm(`Restore ${currentCharacter.name || 'this character'} to the version saved ${when}?\n\nThe current version is kept as a restore point first.`, 'Restore'))) return;
    try {
        if (typeof debouncedSave?.cancel === 'function') debouncedSave.cancel();
        await saveQueue;
        const data = await window.api.loadCharacterVersion(currentFileName, file);
        data.id = currentCharacter.id;                              // same character, same file
        // The log is a record of what happened, so it survives a restore.
        data.chronicle = Array.isArray(currentCharacter.chronicle) ? currentCharacter.chronicle.slice() : [];
        loadCharacterToUI(data);
        addChronicleEntry('restore', `Restored the version saved ${when}.`, { file });
        if (typeof debouncedSave?.cancel === 'function') debouncedSave.cancel();
        window.__forceRestorePoint = true;                          // keep what was there before
        await saveChanges();
        closeHistoryModal();
    } catch (err) {
        showSaveError(`Could not restore that version: ${err?.message || err}`);
    }
}

window.addChronicleEntry = addChronicleEntry;
window.renderChronicle = renderChronicle;
window.setChronicleFilter = setChronicleFilter;
window.deleteChronicleEntry = deleteChronicleEntry;
window.addChronicleNote = addChronicleNote;
window.openLevelUpDialog = openLevelUpDialog;
window.confirmLevelUp = confirmLevelUp;
window.closeLevelUpDialog = closeLevelUpDialog;
window.describeLevelGains = describeLevelGains;
window.openHistoryModal = openHistoryModal;
window.closeHistoryModal = closeHistoryModal;
window.saveRestorePointNow = saveRestorePointNow;
window.restoreVersion = restoreVersion;
