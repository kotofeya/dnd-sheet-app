// js/training.js — weapon mastery training (Dark Dungeons, Chapter 11, "Learning Weapon Feats", Table 11-1).
// New weapon feats are only empty slots: each must be spent by training with a trainer.

const TRAINING_RANKS = ['B', 'S', 'E', 'M', 'G'];
const TRAINING_RANK_NAMES = { B: 'Basic', S: 'Skilled', E: 'Expert', M: 'Master', G: 'Grand Master' };
const TRAINING_WEEKS = { B: 1, S: 2, E: 4, M: 8, G: 12 };
const TRAINER_FEE = { B: 100, S: 250, E: 500, M: 750, G: 1000 };     // gp per week, by the trainer's expertise
// Chance of success: [desired expertise][trainer expertise]; null = that trainer cannot teach it.
const TRAINING_CHANCE = {
    B: { B: 60, S: 80, E: 95, M: 99, G: 99 },
    S: { B: 1, S: 50, E: 70, M: 90, G: 95 },
    E: { B: null, S: 1, E: 40, M: 60, G: 80 },
    M: { B: null, S: null, E: 1, M: 30, G: 50 },
    G: { B: null, S: null, E: null, M: 1, G: 20 },
};
const TRAINING_RULES = [
    'Weapon feats gained with a level are only empty slots: each is spent by training, either to learn a new weapon at Basic or to raise one weapon by one rank (up to Grand Master).',
    'Ideally the trainer has higher expertise than the student; a peer can teach, provided the student has at least Basic skill.',
    'Training takes 1 week for Basic, 2 for Skilled, 4 for Expert, 8 for Master and 12 for Grand Master. An NPC trainer charges 100, 250, 500, 750 or 1,000 gp a week by his own expertise.',
    'The chance of success is rolled halfway through. If it fails, most trainers say so and the student may abandon (saving the rest of the fee) or finish anyway.',
    'The feat is only used if the training succeeds. Completing a failed training gives +10% (cumulative) on all future training for the same rank in the same weapon.',
];

function trainingState() {
    if (!currentCharacter) return null;
    const t = currentCharacter.weaponTraining && typeof currentCharacter.weaponTraining === 'object' ? currentCharacter.weaponTraining : (currentCharacter.weaponTraining = {});
    if (!t.bonus || typeof t.bonus !== 'object') t.bonus = {};
    if (t.active && typeof t.active !== 'object') t.active = null;
    return t;
}
// Training is the normal way to spend feats; at 1st level (starting feats) or when correcting
// a sheet, ranks can be set directly instead.
function trainingDirectEdit() {
    const t = trainingState();
    if ((Number(currentCharacter?.level) || 1) === 1) return true;
    return false;     // both ways are offered: train (arrow) or set directly (+1)
}
function setTrainingDirect(on) {
    const t = trainingState(); if (!t) return;
    t.direct = Boolean(on);
    if (typeof debouncedSave === 'function') debouncedSave();
    syncWeaponFeatsUI();
}
function trainingChance(target, trainer) {
    const v = TRAINING_CHANCE[target]?.[trainer];
    return v === null || v === undefined ? null : v;
}
function trainingBonus(weaponId, target) {
    const t = trainingState();
    return Number(t?.bonus?.[`${weaponId}:${target}`]) || 0;
}
function freeFeatsForTraining() {
    const total = getTotalWeaponFeats(currentCharacter);
    const spent = getSpentWeaponFeats(currentCharacter);
    return total - spent - (trainingState()?.active ? 1 : 0);
}
function weaponNameOf(id) {
    return window.GlobalWeaponsDatabase?.[id]?.name || id;
}
function trainingLog(text, data = {}) {
    if (typeof addChronicleEntry === 'function') addChronicleEntry('training', text, data);
}

// Begin training: a new weapon (Basic) or the next rank of a known weapon.
async function startWeaponTraining(weaponId, target) {
    const t = trainingState(); if (!t) return false;
    if (t.active) { await sheetAlert(`You are already training ${weaponNameOf(t.active.weaponId)}. Finish or abandon that first.`); return false; }
    if (freeFeatsForTraining() < 1) { await sheetAlert('You have no free weapon feat to spend. Feats come with new levels.'); return false; }
    const known = (currentCharacter.weaponFeats || []).find(w => w.weaponId === weaponId);
    if (!target) target = known ? TRAINING_RANKS[TRAINING_RANKS.indexOf(known.rank) + 1] : 'B';
    if (!target) { await sheetAlert(`${weaponNameOf(weaponId)} is already at Grand Master.`); return false; }
    // Default trainer: one rank above the goal (a peer for Grand Master).
    const trainer = TRAINING_RANKS[Math.min(4, TRAINING_RANKS.indexOf(target) + 1)];
    t.active = { weaponId, target, trainer, trainerName: '', npc: true, payFromPurse: true, weeks: 0, paid: 0, check: null, roll: null, started: new Date().toISOString() };
    if (typeof calendarState === 'function') { t.active.startedGame = typeof gameDateText === 'function' ? gameDateText() : ''; calendarState().trainingWeekT = calendarState().t; }
    trainingLog(`Began training ${weaponNameOf(weaponId)} to ${TRAINING_RANK_NAMES[target]} (${TRAINING_WEEKS[target]} week${TRAINING_WEEKS[target] > 1 ? 's' : ''}).`, { weaponId, target });
    if (typeof debouncedSave === 'function') debouncedSave();
    syncWeaponFeatsUI();
    document.getElementById('weapon-training-panel')?.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    return true;
}
function setTrainingField(field, value) {
    const t = trainingState(); if (!t || !t.active) return;
    const a = t.active;
    if (field === 'trainer') { if (a.weeks > 0) return; if (trainingChance(a.target, value) !== null) a.trainer = value; }
    else if (field === 'npc' || field === 'payFromPurse') a[field] = Boolean(value);
    else if (field === 'trainerName') a.trainerName = String(value || '').slice(0, 80);
    if (typeof debouncedSave === 'function') debouncedSave();
    renderTrainingPanel();
}
async function trainWeek() {
    const t = trainingState(); if (!t || !t.active) return;
    const a = t.active;
    const total = TRAINING_WEEKS[a.target];
    if (a.weeks >= total) return;
    const halfway = Math.max(1, Math.floor(total / 2));
    if (a.weeks >= halfway && !a.check) { await sheetAlert('Roll the halfway check before training further.'); return; }
    if (a.npc) {
        const fee = TRAINER_FEE[a.trainer];
        if (a.payFromPurse) {
            const coins = currentCharacter.coins || (currentCharacter.coins = { cp: 0, sp: 0, ep: 0, gp: 0, pp: 0 });
            if ((Number(coins.gp) || 0) < fee) { await sheetAlert(`Not enough gold in your purse for this week (${fee} gp). Untick "pay from purse" if it is paid some other way.`); return; }
            coins.gp = (Number(coins.gp) || 0) - fee;
            if (typeof syncInventoryUI === 'function') syncInventoryUI();
        }
        a.paid += fee;
    }
    a.weeks += 1;
    if (typeof calendarState === 'function' && currentCharacter) calendarState().trainingWeekT = calendarState().t;   // the calendar's "training due" reminder
    // A one-week course is checked at its end, before it can finish.
    if (a.weeks >= total && a.check) await finishWeaponTraining();
    if (typeof debouncedSave === 'function') debouncedSave();
    syncWeaponFeatsUI();
}
// The halfway check: d% against the table chance plus any bonus from earlier completed attempts.
function rollTrainingCheck(forced = null) {
    const t = trainingState(); if (!t || !t.active) return;
    const a = t.active;
    const chance = Math.min(100, (trainingChance(a.target, a.trainer) || 0) + trainingBonus(a.weaponId, a.target));
    let passed;
    if (forced === null) { a.roll = 1 + Math.floor(Math.random() * 100); passed = a.roll <= chance; }
    else { a.roll = null; passed = Boolean(forced); }
    a.check = passed ? 'pass' : 'fail';
    a.chance = chance;
    const done = a.weeks >= TRAINING_WEEKS[a.target];
    trainingLog(`Halfway check for ${weaponNameOf(a.weaponId)} (${TRAINING_RANK_NAMES[a.target]}): ${a.roll !== null ? `rolled ${a.roll} against ${chance}%` : 'recorded'}, ${passed ? 'progressing well' : 'not working out'}.`);
    if (done) { finishWeaponTraining(); if (typeof debouncedSave === 'function') debouncedSave(); syncWeaponFeatsUI(); return; }
    if (typeof debouncedSave === 'function') debouncedSave();
    renderTrainingPanel();
}
async function finishWeaponTraining() {
    const t = trainingState(); if (!t || !t.active) return;
    const a = t.active;
    const name = weaponNameOf(a.weaponId);
    const cost = a.paid ? ` ${a.weeks} weeks, ${a.paid.toLocaleString('en-US')} gp.` : ` ${a.weeks} weeks.`;
    if (a.check === 'pass') {
        if (!Array.isArray(currentCharacter.weaponFeats)) currentCharacter.weaponFeats = [];
        const known = currentCharacter.weaponFeats.find(w => w.weaponId === a.weaponId);
        if (known) known.rank = a.target; else currentCharacter.weaponFeats.push({ weaponId: a.weaponId, rank: a.target, isEquipped: true });
        delete t.bonus[`${a.weaponId}:${a.target}`];
        trainingLog(`Training succeeded: ${name} is now ${TRAINING_RANK_NAMES[a.target]}.${cost}`, { weaponId: a.weaponId, rank: a.target, paid: a.paid });
    } else {
        const key = `${a.weaponId}:${a.target}`;
        t.bonus[key] = (Number(t.bonus[key]) || 0) + 10;
        trainingLog(`Training failed: ${name} stays at its rank. +${t.bonus[key]}% on future ${TRAINING_RANK_NAMES[a.target]} training with it.${cost}`, { weaponId: a.weaponId, paid: a.paid });
    }
    t.active = null;
}
async function abandonWeaponTraining() {
    const t = trainingState(); if (!t || !t.active) return;
    const a = t.active;
    const msg = a.check === 'fail'
        ? `Abandon training ${weaponNameOf(a.weaponId)}? You save the rest of the fee, but get no +10% bonus for next time.`
        : `Abandon training ${weaponNameOf(a.weaponId)}? The weeks and gold spent so far are lost and the feat stays unspent.`;
    if (!(await sheetConfirm(msg, 'Abandon'))) return;
    trainingLog(`Abandoned training ${weaponNameOf(a.weaponId)} to ${TRAINING_RANK_NAMES[a.target]} after ${a.weeks} week${a.weeks === 1 ? '' : 's'}${a.paid ? ` (${a.paid.toLocaleString('en-US')} gp paid)` : ''}.`);
    t.active = null;
    if (typeof debouncedSave === 'function') debouncedSave();
    syncWeaponFeatsUI();
}

function renderTrainingPanel() {
    const el = document.getElementById('weapon-training-panel');
    if (!el || !currentCharacter) return;
    const t = trainingState();
    const level = Number(currentCharacter.level) || 1;
    const free = freeFeatsForTraining();
    const directBox = level > 1 ? '<span class="eyebrow">+1 on a weapon raises it without training</span>' : '';
    const rules = `<details class="arc-rules"><summary>Weapon training rules</summary><ul>${TRAINING_RULES.map(r => `<li>${escapeHtml(r)}</li>`).join('')}</ul></details>`;
    if (!t.active) {
        const note = level === 1
            ? 'Starting weapon feats are spent at once on Basic proficiency. Feats gained at later levels must be trained.'
            : (free > 0 ? `You have ${free} free weapon feat${free > 1 ? 's' : ''} to train: use the arrow on a weapon to train it, or “+ Train Weapon” for a new one.` : 'No free weapon feats to train. More come with new levels.');
        el.innerHTML = `<div class="arc-row-head"><span class="eyebrow eyebrow-strong">Training</span>${directBox}</div><p class="sub-caption" style="margin: 6px 0;">${escapeHtml(note)}</p>${rules}`;
        return;
    }
    const a = t.active;
    const total = TRAINING_WEEKS[a.target];
    const halfway = Math.max(1, Math.floor(total / 2));
    const bonus = trainingBonus(a.weaponId, a.target);
    const chance = Math.min(100, (trainingChance(a.target, a.trainer) || 0) + bonus);
    const fee = TRAINER_FEE[a.trainer];
    const known = (currentCharacter.weaponFeats || []).find(w => w.weaponId === a.weaponId);
    const trainerOpts = TRAINING_RANKS.map(r => {
        const c = trainingChance(a.target, r);
        return `<option value="${r}" ${a.trainer === r ? 'selected' : ''} ${c === null ? 'disabled' : ''}>${TRAINING_RANK_NAMES[r]} trainer — ${c === null ? 'cannot teach this' : `${c}%, ${TRAINER_FEE[r]} gp/week`}</option>`;
    }).join('');
    const needCheck = a.weeks >= halfway && !a.check;
    let status = '';
    if (needCheck) status = `<div class="arc-actions"><strong>Halfway: roll for success (${chance}%)</strong><button type="button" class="btn btn-sm btn-accent" onclick="rollTrainingCheck()">Roll d%</button><button type="button" class="btn btn-sm" onclick="rollTrainingCheck(true)">Passed</button><button type="button" class="btn btn-sm" onclick="rollTrainingCheck(false)">Failed</button></div>`;
    else if (a.check === 'pass') status = `<p class="sub-caption" style="margin: 6px 0; color: var(--good);">The halfway check succeeded${a.roll ? ` (rolled ${a.roll} against ${a.chance}%)` : ''}: finish the training to gain the rank.</p>`;
    else if (a.check === 'fail') status = `<p class="sub-caption" style="margin: 6px 0; color: var(--danger);">The trainer warns it isn't working out${a.roll ? ` (rolled ${a.roll} against ${a.chance}%)` : ''}. Abandon now to save the rest of the fee, or finish anyway for +10% next time.</p>`;
    el.innerHTML = `
        <div class="arc-row-head"><span class="eyebrow eyebrow-strong">Training</span>${directBox}</div>
        <div class="arc-panel${a.check === 'fail' ? ' arc-warn' : ''}">
            <div class="arc-row-head"><strong>${escapeHtml(weaponNameOf(a.weaponId))}: ${known ? `${TRAINING_RANK_NAMES[known.rank]} → ` : 'new weapon → '}${TRAINING_RANK_NAMES[a.target]}</strong><span class="eyebrow">Week ${a.weeks} / ${total}</span></div>
            <div class="xp-bar" style="margin: 8px 0 4px;"><div class="xp-bar-fill" style="width: ${Math.round(a.weeks / total * 100)}%;"></div></div>
            <div class="arc-fields">
                <label class="arc-field"><span class="eyebrow">Trainer's expertise</span><select class="stat-input arc-input" ${a.weeks > 0 ? 'disabled' : ''} onchange="setTrainingField('trainer', this.value)">${trainerOpts}</select></label>
                <label class="arc-field"><span class="eyebrow">Trainer</span><input type="text" class="stat-input arc-input" value="${escapeHtml(a.trainerName || '')}" placeholder="Name" onchange="setTrainingField('trainerName', this.value)"></label>
            </div>
            <div class="arc-fields">
                <label class="arc-check"><input type="checkbox" ${a.npc ? 'checked' : ''} onchange="setTrainingField('npc', this.checked)"> NPC trainer (${fee} gp a week)</label>
                ${a.npc ? `<label class="arc-check"><input type="checkbox" ${a.payFromPurse ? 'checked' : ''} onchange="setTrainingField('payFromPurse', this.checked)"> Pay from purse</label>` : ''}
            </div>
            <div class="tally" style="margin: 6px 0;">
                <span>Chance <strong>${chance}%</strong>${bonus ? ` (incl. +${bonus}%)` : ''}</span>
                <span>Check after week <strong>${halfway}</strong></span>
                <span>Paid <strong>${a.paid.toLocaleString('en-US')} gp</strong>${a.npc ? ` of ${(fee * total).toLocaleString('en-US')}` : ''}</span>
            </div>
            ${status}
            <div class="arc-actions">
                <button type="button" class="btn btn-sm btn-accent" onclick="trainWeek()" ${needCheck ? 'disabled' : ''}>Train one week${a.npc ? ` (${fee} gp)` : ''}</button>
                <button type="button" class="btn btn-sm btn-danger" onclick="abandonWeaponTraining()" style="margin-left: auto;">Abandon</button>
            </div>
        </div>
        ${rules}`;
}

Object.assign(window, {
    trainingState, trainingDirectEdit, setTrainingDirect, startWeaponTraining, setTrainingField, trainWeek,
    rollTrainingCheck, abandonWeaponTraining, renderTrainingPanel, freeFeatsForTraining,
});
