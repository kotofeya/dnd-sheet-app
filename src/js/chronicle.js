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
                <button type="button" class="icon-btn danger" onclick="deleteChronicleEntry('${String(e.id).replace(/[^\w-]/g, '')}')" title="Delete entry (does not change your totals)" aria-label="Delete entry">${getIcon('close', 14)}</button>
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
// Level-up walkthrough: hit points, what changes, and what to do next
// ---------------------------------------------------------------------------
let pendingLevelUp = null;

// The character as it is at a level, or at a stage before 1st level (creature heroes).
function charAt(character, lvl, stage) {
    const info = ClassesDatabase[character.characterClass] || {};
    if (stage) return { ...character, level: 1, experiencePoints: stage.xp };
    const minXp = (info.xpTable && info.xpTable[lvl]) || 0;
    return { ...character, level: lvl, experiencePoints: Math.max(Number(character.experiencePoints) || 0, minXp, 0) };
}
function withLevel(character, level) { return charAt(character, level, null); }

// Saving throw row [death, wands, paralysis, breath, spells] at a level or stage (no Wisdom or items).
function savesAt(character, lvl, stage) {
    const info = ClassesDatabase[character.characterClass] || {};
    const own = stage?.saves || info.savesByLevel?.[lvl];
    let row = null;
    if (Array.isArray(own) && own.length === 5) row = own.slice();
    else {
        const sl = Math.max(1, Math.min(36, Number(stage?.saveLevel ?? info.saveLevels?.[lvl] ?? lvl) || 1));
        const t = (info.saves || []).find(x => sl >= x.minLevel && sl <= x.maxLevel);
        if (t) row = [t.death, t.wands, t.paralysis, t.breath, t.spells];
    }
    const bonus = Number(stage ? stage.saveBonus : info.saveBonus?.[lvl]) || 0;
    return row ? row.map(v => v - bonus) : null;
}
function thac0At(character, lvl, stage) {
    if (stage) return stage.thac0;
    const t = (typeof getThac0TableFor === 'function' && getThac0TableFor(withLevel(character, lvl))) || ClassesDatabase[character.characterClass]?.thac0;
    return t ? t[lvl] : undefined;
}
function hitDiceAt(character, lvl, stage) {
    const info = ClassesDatabase[character.characterClass] || {};
    if (stage) return { dice: stage.dice, plus: 0, die: stage.die || info.hitDie || 8 };
    const row = Array.isArray(info.hitDiceTable) ? (info.hitDiceTable[lvl] || [0, 0]) : null;
    return row ? { dice: row[0], plus: row[1] || 0, die: info.hitDie || 8 } : null;
}

// What changes between two points (levels, or stages before 1st level), and what to do about it.
// opts: { stageFrom, stageTo, sub } (sub = a sub-class with its own level).
function describeLevelGains(character, fromLvl, toLvl, opts = {}) {
    const info = ClassesDatabase[character.characterClass] || {};
    const option = (typeof getClassOption === 'function') ? getClassOption(character) : null;
    const notes = [], steps = [];
    const conMod = Number(character.abilities?.constitution?.modifier) || 0;
    const con = conMod ? ` ${conMod > 0 ? '+' : ''}${conMod} (Con)` : '';
    const { stageFrom = null, stageTo = null, sub = false } = opts;
    const before = charAt(character, fromLvl, stageFrom), after = charAt(character, toLvl, stageTo);

    if (sub && option) {
        // Sub-class with its own level: its spells and abilities only.
        const subAt = l => ({ ...character, subClassLevel: l, subClassXP: Math.max(Number(character.subClassXP) || 0, option.xpTable?.[l] || 0) });
        if (typeof getCasterProfiles === 'function') {
            const p0 = getCasterProfiles(subAt(fromLvl)).find(p => p.key === 'option') || { slots: [] };
            const p1 = getCasterProfiles(subAt(toLvl)).find(p => p.key === 'option');
            if (p1) {
                const ch = (p1.slots || []).map((n, i) => n - ((p0.slots || [])[i] || 0)).map((d, i) => d > 0 ? `+${d} level ${i + 1}` : '').filter(Boolean);
                if (ch.length) notes.push(`${p1.title || 'Spells'}: ${ch.join(', ')}`);
            }
        }
        const feats = (option.features || []).filter(f => f.minLevel > fromLvl && f.minLevel <= toLvl).map(f => f.name);
        if (feats.length) notes.push(`New: ${feats.join(', ')}`);
        return { hpHint: '', fixedHp: 0, noHp: true, notes, steps };
    }

    // Hit points.
    let hpHint = '', fixedHp = null;
    const hd0 = hitDiceAt(character, fromLvl, stageFrom), hd1 = hitDiceAt(character, toLvl, stageTo);
    if (hd0 && hd1) {
        if (hd1.dice > hd0.dice) hpHint = `Roll ${hd1.dice - hd0.dice}d${hd1.die}${con}`;
        else if (hd1.dice === hd0.dice && hd1.die > hd0.die) hpHint = `Roll 1d${hd1.die - hd0.die} more${con} (your Hit Die grows from d${hd0.die} to d${hd1.die})`;
        else if (hd1.plus > hd0.plus) { fixedHp = hd1.plus - hd0.plus; hpHint = `+${fixedHp} (fixed, no Con)`; }
        else { fixedHp = 0; hpHint = 'No new Hit Die at this level'; }
    } else if (toLvl <= 9) {
        const bonus = Number(info.hpDieBonus) || 0;
        hpHint = `Roll ${toLvl - fromLvl > 1 ? (toLvl - fromLvl) : 1}d${info.hitDie || 8}${bonus ? ` +${bonus} each` : ''}${con}`;
    } else {
        fixedHp = (option?.hpPerLevelAfter9 ?? info.hpPerLevelAfter9 ?? 1) * Math.max(1, toLvl - Math.max(fromLvl, 9));
        hpHint = `+${fixedHp} (fixed after 9th level, no Con)`;
    }

    // Combat numbers.
    const t0 = thac0At(character, fromLvl, stageFrom), t1 = thac0At(character, toLvl, stageTo);
    if (t0 !== undefined && t1 !== undefined && t1 < t0) notes.push(`THAC0 ${t0} → ${t1}`);
    const s0 = savesAt(character, fromLvl, stageFrom), s1 = savesAt(character, toLvl, stageTo);
    if (s0 && s1) {
        const names = ['death ray', 'wands', 'paralysis', 'breath', 'spells'];
        const better = s1.map((v, i) => v < s0[i] ? `${names[i]} ${s0[i]} → ${v}` : '').filter(Boolean);
        if (better.length) notes.push(`Saves: ${better.join(', ')}`);
    }
    if (typeof getNaturalArmourClass === 'function') {
        const a0 = getNaturalArmourClass(before), a1 = getNaturalArmourClass(after);
        if (a0 != null && a1 != null && a1 < a0) notes.push(`Natural AC ${a0} → ${a1}`);
    }
    if (typeof getAttacksPerRound === 'function') {
        try {
            const k0 = getAttacksPerRound(character.characterClass, before.level, before), k1 = getAttacksPerRound(character.characterClass, after.level, after);
            if (k1.count > k0.count || k1.note !== k0.note) notes.push(`Attacks: ${k1.count} a round (${k1.note})`);
        } catch (e) { /* combat module not loaded */ }
    }

    // Skill slots and weapon feats.
    if (typeof getTotalSkillSlots === 'function') {
        const n = getTotalSkillSlots(after) - getTotalSkillSlots(before);
        if (n > 0) {
            notes.push(`+${n} general skill slot${n > 1 ? 's' : ''}`);
            steps.push({ key: 'skill', label: `Learn ${n > 1 ? n + ' skills' : 'a skill'} (or raise one you know)`, run: () => { if (typeof switchTab === 'function') switchTab('tab-skills'); if (typeof openAddSkillModal === 'function') openAddSkillModal(); } });
        }
    }
    const fp = info.weaponFeatsProgression;
    const newFeats = fp && Array.isArray(fp.gainLevels) ? fp.gainLevels.filter(l => l > fromLvl && l <= toLvl).length : 0;
    if (newFeats) {
        notes.push(`+${newFeats} weapon feat${newFeats > 1 ? 's' : ''}`);
        steps.push({ key: 'feat', label: `Train a weapon (${newFeats} new feat${newFeats > 1 ? 's' : ''})`, run: () => { if (typeof switchTab === 'function') switchTab('tab-combat'); if (typeof openAddWeaponModal === 'function') openAddWeaponModal(); } });
    }

    // Spells: compare slot rows of every spellbook.
    if (typeof getCasterProfiles === 'function') {
        const pb = getCasterProfiles(before), pa = getCasterProfiles(after);
        pa.forEach(p => {
            const q = pb.find(b => b.key === p.key) || { slots: [] };
            const changes = (p.slots || []).map((n, i) => n - ((q.slots || [])[i] || 0)).map((d, i) => d > 0 ? `+${d} level ${i + 1}` : '').filter(Boolean);
            if (!changes.length) return;
            notes.push(`${p.title || (p.type === 'arcane' ? 'Spells' : 'Prayers')}: ${changes.join(', ')}`);
            const newTier = (p.slots || []).length > (q.slots || []).length;
            if (p.key === 'main' && p.type === 'arcane' && !p.spellList && typeof openCompendiumModal === 'function') {
                steps.push({ key: 'spells', label: newTier ? `Add level ${p.slots.length} spells to your spellbook` : 'Add new spells to your spellbook', run: () => { if (typeof switchTab === 'function') switchTab('tab-features'); openCompendiumModal(); } });
            }
        });
    }

    // Class abilities gained here (by level, or by stage for a growing creature).
    // (Abilities of 1st level already show while a creature grows, so a stage change adds none.)
    const lvlFrom = stageFrom ? 1 : fromLvl;
    const features = stageTo ? [] : [...(info.features || []), ...((option && option.sharesMainLevel) ? (option.features || []) : [])]
        .filter(f => f.minLevel > lvlFrom && f.minLevel <= toLvl).map(f => f.name);
    if (features.length) notes.push(`New: ${features.join(', ')}`);
    if (info.smashParryLevel && fromLvl < info.smashParryLevel && toLvl >= info.smashParryLevel) notes.push('Fighter Combat Options');

    // Daily uses that grow with level, and new abilities with limited uses.
    if (typeof dailyUseChangesFor === 'function') {
        const du = dailyUseChangesFor(after);
        du.updates.forEach(u => notes.push(`Daily uses: ${u.entry.name} ${u.entry.max} → ${u.max} (updated when you record)`));
        const prev = new Set((typeof limitedUseAbilities === 'function' ? limitedUseAbilities(before) : []).map(a => a.name));
        du.fresh = du.fresh.filter(f => !prev.has(f.name));
        if (du.fresh.length) steps.push({ key: 'uses', label: `Track uses of ${du.fresh.map(f => f.name).join(', ')}`, run: () => { if (typeof switchTab === 'function') switchTab('tab-features'); if (typeof addSuggestedDailyUses === 'function') addSuggestedDailyUses(); } });
    }
    return { hpHint, fixedHp, notes, steps };
}

// opts: { stageFrom, stageTo } for a growing creature, { sub: true } for a sub-class level.
function openLevelUpDialog(fromLvl, toLvl, opts = {}) {
    if (!currentCharacter) return;
    const gains = describeLevelGains(currentCharacter, fromLvl, toLvl, opts);
    pendingLevelUp = { fromLvl, toLvl, gains, opts, done: new Set() };
    // Keep a copy of the saved sheet from before this level-up (Backups); not again when reopened after "Later".
    if (typeof backupBeforeLevelUp === 'function' && !opts.reopened) {
        backupBeforeLevelUp(opts.sub ? `${currentCharacter.subClass} level ${toLvl}` : opts.stageFrom ? `growing past ${opts.stageFrom.name}` : `level ${toLvl}`);
    }
    const who = currentCharacter.name || 'Your hero';
    const stageName = s => s ? s.name : `level ${toRoman(toLvl)}`;
    const title = opts.sub ? `${who}: ${currentCharacter.subClass} level ${toRoman(toLvl)}`
        : (opts.stageFrom ? `${who} grows: ${opts.stageFrom.name} → ${stageName(opts.stageTo)}` : `${who} reaches level ${toRoman(toLvl)}`);
    safeSetText('levelup-title', title);
    safeSetText('levelup-hp-hint', gains.hpHint);
    const hpWrap = document.getElementById('levelup-hp-wrap');
    if (hpWrap) hpWrap.style.display = gains.noHp ? 'none' : '';
    const hpInput = document.getElementById('levelup-hp');
    if (hpInput) { hpInput.value = gains.fixedHp !== null ? gains.fixedHp : ''; hpInput.placeholder = 'Hit points rolled'; }
    const list = document.getElementById('levelup-gains');
    if (list) list.innerHTML = gains.notes.length ? gains.notes.map(n => `<li>${escapeHtml(n)}</li>`).join('') : '<li>No other changes at this level.</li>';
    renderLevelUpSteps();
    const noHpBtn = document.getElementById('levelup-nohp-btn');
    if (noHpBtn) noHpBtn.style.display = gains.noHp ? 'none' : '';
    const m = document.getElementById('levelup-modal');
    m.style.display = 'flex';
    m.style.zIndex = '1000';
    if (typeof resetFormEdits === 'function') resetFormEdits(m);
    if (hpInput && gains.fixedHp === null && !gains.noHp) setTimeout(() => hpInput.focus(), 50);
}

function renderLevelUpSteps() {
    const wrap = document.getElementById('levelup-steps-wrap');
    const box = document.getElementById('levelup-steps');
    if (!wrap || !box || !pendingLevelUp) return;
    const steps = pendingLevelUp.gains.steps || [];
    wrap.style.display = steps.length ? '' : 'none';
    box.innerHTML = steps.map((st, i) => {
        const done = pendingLevelUp.done.has(st.key);
        return `<div class="levelup-step${done ? ' done' : ''}"><span class="levelup-tick">${done ? getIcon('check', 13) : ''}</span><span>${escapeHtml(st.label)}</span><button type="button" class="btn btn-sm" onclick="runLevelUpStep(${i})">${done ? 'Again' : 'Do it'}</button></div>`;
    }).join('');
}
// A step opens its window in front of the level-up window, which waits behind it.
function runLevelUpStep(i) {
    const st = pendingLevelUp?.gains.steps?.[i];
    if (!st) return;
    pendingLevelUp.done.add(st.key);
    renderLevelUpSteps();
    const m = document.getElementById('levelup-modal');
    if (m) m.style.zIndex = '990';
    try { st.run(); } catch (e) { console.error(e); }
}

function confirmLevelUp(recordHp = true) {
    if (!pendingLevelUp || !currentCharacter) return closeLevelUpDialog();
    const { fromLvl, toLvl, gains, opts } = pendingLevelUp;
    if (opts.sub) {
        addChronicleEntry('level', `${currentCharacter.subClass} level ${fromLvl} → ${toLvl}.${gains.notes.length ? ' ' + gains.notes.join('; ') + '.' : ''}`,
            { subClass: currentCharacter.subClass, from: fromLvl, to: toLvl, gains: gains.notes });
        closeLevelUpDialog();
        return;
    }
    const raw = document.getElementById('levelup-hp')?.value;
    const hp = recordHp && raw !== '' && raw != null ? Math.max(0, Math.trunc(Number(raw) || 0)) : null;
    let text = opts.stageFrom ? `${opts.stageFrom.name} → ${opts.stageTo ? opts.stageTo.name : 'level ' + toLvl}.` : `Level ${fromLvl} → ${toLvl}.`;
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
    // Daily uses that grow with level.
    if (typeof dailyUseChangesFor === 'function') {
        const du = dailyUseChangesFor(currentCharacter);
        du.updates.forEach(u => { u.entry.max = u.max; });
        if (du.updates.length && typeof renderDailyUses === 'function') renderDailyUses();
    }
    if (gains.notes.length) text += ' ' + gains.notes.map(n => n.replace(/ \(updated when you record\)$/, '')).join('; ') + '.';
    addChronicleEntry('level', text, { from: fromLvl, to: toLvl, hpGained: hp, hpMax: currentCharacter.hitPoints?.maximum, gains: gains.notes });
    if (typeof debouncedSave === 'function') debouncedSave();
    closeLevelUpDialog();
}

function closeLevelUpDialog() {
    pendingLevelUp = null;
    const m = document.getElementById('levelup-modal');
    if (m) m.style.display = 'none';
}

// "Later": close without writing anything to the log. The level itself is already on the sheet;
// a short message offers to open the window again.
function laterLevelUp() {
    const p = pendingLevelUp;
    closeLevelUpDialog();
    if (!p || typeof sheetToast !== 'function') return;
    sheetToast('Level-up not written to the Adventure Log.', {
        action: 'Open again', ms: 8000,
        onAction: () => openLevelUpDialog(p.fromLvl, p.toLvl, { ...p.opts, reopened: true }),
    });
}
// Esc or a click outside = Later (asking first if hit points were typed).
async function dismissLevelUp() {
    const m = document.getElementById('levelup-modal');
    if (typeof okToDiscard === 'function' && !(await okToDiscard(m))) return;
    laterLevelUp();
}
(function setupLevelUpWindow() {
    const m = document.getElementById('levelup-modal');
    if (!m) return;
    if (typeof watchFormEdits === 'function') watchFormEdits(m);
    m.addEventListener('click', e => { if (e.target === m) dismissLevelUp(); });
    if (typeof registerModalCloser === 'function') registerModalCloser('levelup-modal', dismissLevelUp);
})();
window.runLevelUpStep = runLevelUpStep;
window.laterLevelUp = laterLevelUp;

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
// Read-only window: Esc closes it (the backdrop click is in index.html).
if (typeof registerModalCloser === 'function') registerModalCloser('history-modal', closeHistoryModal);

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
