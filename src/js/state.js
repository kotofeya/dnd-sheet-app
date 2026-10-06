// Глобальные базы данных и состояние
window.ClassesDatabase = {};
window.GlobalDeitiesDatabase = {};
window.GlobalWeaponsDatabase = {};
window.GlobalSpellsDatabase = {};
window.currentCharacter = null;
window.currentFileName = null;
window.isSpellbookLocked = true;
window.currentOpponentMode = 'armed';

// Ruleset switches. Defaults follow Dark Dungeons; set to true for Rules Cyclopedia behaviour.
window.RULESET = {
    primeRequisitePenalties: false, // RC: -20% / -10% XP for low prime requisites
};

// Debounce with flush()/cancel(): flush() runs a pending call immediately
// (used before switching characters), cancel() drops it (used before delete).
function debounce(func, delay) {
    let timeout = null;
    let lastArgs = [];
    const debounced = function (...args) {
        lastArgs = args;
        clearTimeout(timeout);
        timeout = setTimeout(() => { timeout = null; func(...lastArgs); }, delay);
    };
    debounced.flush = () => {
        if (timeout === null) return;
        clearTimeout(timeout);
        timeout = null;
        func(...lastArgs);
    };
    debounced.cancel = () => { clearTimeout(timeout); timeout = null; };
    return debounced;
}

const debouncedSave = debounce(() => {
    if (typeof window.saveChanges === 'function') window.saveChanges();
}, 500);

function safeSetVal(id, val) {
    const el = document.getElementById(id);
    if (el) el.value = (val !== undefined && val !== null) ? val : '';
}

function safeSetText(id, text) {
    const el = document.getElementById(id);
    if (el) el.innerText = (text !== undefined && text !== null) ? text : '';
}

// Escape any user-supplied text before it goes into an innerHTML template.
const HTML_ESCAPES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, ch => HTML_ESCAPES[ch]);
}

// Integer clamp that never treats 0 as "missing".
function clampInt(value, min, max, fallback) {
    const n = Math.trunc(Number(value));
    if (value === '' || value === null || value === undefined || !Number.isFinite(n)) return fallback;
    return Math.min(max, Math.max(min, n));
}

// Bonuses and Penalties for Ability Scores (3 = -3 ... 18 = +3).
function calculateModifier(score) {
    const s = Number(score);
    if (!Number.isFinite(s)) return 0;
    if (s <= 1) return -4;
    if (s <= 3) return -3;
    if (s <= 5) return -2;
    if (s <= 8) return -1;
    if (s <= 12) return 0;
    if (s <= 15) return 1;
    if (s <= 17) return 2;
    // Above 18 only through magic (Dark Dungeons Table 3-1).
    if (s <= 19) return 3;
    if (s <= 21) return 4;
    if (s <= 23) return 5;
    if (s <= 27) return 6;
    if (s <= 32) return 7;
    if (s <= 38) return 8;
    if (s <= 45) return 9;
    return 10;
}

// Prime requisite XP bonus. "single": +5% at 13-15, +10% at 16+.
// "dual": +5% if EITHER score meets its threshold, +10% if BOTH do
// (Dark Dungeons Table 4-1 and the Mystara Extra Rules Compendium class tables).
const PRIME_REQUISITES = {
    'Fighter':        { single: 'strength' },
    'Dwarf':          { single: 'strength' },
    'Mystic':         { single: 'strength' },
    'Cleric':         { single: 'wisdom' },
    'Magic-User':     { single: 'intelligence' },
    'Thief':          { single: 'dexterity' },
    'Elf':            { dual: [['strength', 13], ['intelligence', 13]] },
    'Halfling':       { dual: [['strength', 13], ['dexterity', 13]] },
    'Arcane Warrior': { dual: [['strength', 13], ['intelligence', 16]] },
    'Archer':         { dual: [['strength', 13], ['dexterity', 13]] },
    'Bandit':         { dual: [['strength', 13], ['dexterity', 13]] },
    'Battlecaster':   { dual: [['strength', 16], ['intelligence', 16]] },
    'Beastmaster':    { dual: [['strength', 13], ['dexterity', 13]] },
    'Bounty Hunter':  { dual: [['intelligence', 13], ['dexterity', 13]] },
    'Rake':           { dual: [['strength', 13], ['dexterity', 13]] },
    'Witch':          { dual: [['intelligence', 13], ['wisdom', 13]] },
    // GAZ13: +5% if BOTH scores are 13+, +10% if the first is 16+ and the second 13+.
    'Shadow Elf':     { both: [['intelligence', 16], ['strength', 13]] },
    'Shadow Shaman':  { both: [['wisdom', 16], ['intelligence', 13]] },
    // PC1 / PC2 creature heroes.
    'Centaur':        { single: 'strength' },
    'Gnome':          { single: 'dexterity' },
    'Skygnome':       { single: 'dexterity' },
    // PC1 woodland beings (Table 1): +5% if every prime requisite is 13+, +10% if every one is 16+.
    'Brownie':        { single: 'dexterity' },
    'Redcap':         { single: 'dexterity' },
    'Dryad':          { all: ['wisdom', 'charisma'] },
    'Faun':           { single: 'dexterity' },
    'Hsiao':          { single: 'wisdom' },
    'Leprechaun':     { all: ['intelligence', 'dexterity'] },
    'Pixie':          { single: 'dexterity' },
    'Pooka':          { single: 'wisdom' },
    'Sidhe (Warrior)': { all: ['strength', 'intelligence'] },
    'Sidhe (Rogue)':  { all: ['intelligence', 'dexterity'] },
    'Sprite':         { all: ['intelligence', 'dexterity'] },
    'Treant':         { single: 'constitution' },
    'Wood Imp':       { single: 'dexterity' },
    'Woodrake':       { all: ['intelligence', 'dexterity'] },
    // PC2 skydwellers (p. 4): +5% if every prime requisite is 13+, +10% if they are and one is 16+.
    // A shaman or wicca adds Wisdom or Intelligence to the race's prime requisites.
    'Faenare':        { allAny: ['wisdom', 'charisma'] },
    'Windsinger':     { allAny: ['wisdom', 'charisma'] },
    'Gremlin':        { single: 'dexterity' },
    'Harpy':          { single: 'strength' },
    'Nagpa':          { allAny: ['intelligence', 'wisdom'] },
    'Pegataur':       { allAny: ['strength', 'constitution'] },
    'Sphinx (Female)': { allAny: ['wisdom', 'constitution'] },
    'Sphinx (Male)':  { allAny: ['wisdom', 'constitution'] },
    'Tabi':           { single: 'intelligence' },
    'Gnome Shaman':   { allAny: ['dexterity', 'wisdom'] },
    'Gnome Wicca':    { allAny: ['dexterity', 'intelligence'] },
    'Skygnome Shaman': { allAny: ['dexterity', 'wisdom'] },
    'Skygnome Wicca': { allAny: ['dexterity', 'intelligence'] },
    'Harpy Shaman':   { allAny: ['strength', 'wisdom'] },
    'Harpy Wicca':    { allAny: ['strength', 'intelligence'] },
    'Pegataur Shaman': { allAny: ['strength', 'constitution', 'wisdom'] },
    'Pegataur Wicca': { allAny: ['strength', 'constitution', 'intelligence'] },
    // PC1 woodland shamans and wiccas: the race's prime requisite and Wisdom (or Intelligence).
    'Centaur Shaman': { all: ['strength', 'wisdom'] },
    'Centaur Wicca':  { all: ['strength', 'intelligence'] },
    'Faun Shaman':    { all: ['dexterity', 'wisdom'] },
    'Treant Shaman':  { all: ['constitution', 'wisdom'] },
    'Wood Imp Shaman': { all: ['dexterity', 'wisdom'] },
};

function getPrimeRequisiteBonus(className, stats) {
    const rule = PRIME_REQUISITES[className];
    if (!rule || !stats) return 0;
    const score = key => Number(stats[key]?.score) || 10;

    if (rule.both) {
        const [[key16], [key13]] = rule.both;
        if (score(key16) >= 13 && score(key13) >= 13) return score(key16) >= 16 ? 10 : 5;
        return 0;
    }

    if (rule.allAny) {
        const vals = rule.allAny.map(score);
        if (Math.min(...vals) < 13) return 0;
        return Math.max(...vals) >= 16 ? 10 : 5;
    }

    if (rule.all) {
        const low = Math.min(...rule.all.map(score));
        return low >= 16 ? 10 : (low >= 13 ? 5 : 0);
    }

    if (rule.dual) {
        const met = rule.dual.filter(([key, min]) => score(key) >= min).length;
        return met === 2 ? 10 : (met === 1 ? 5 : 0);
    }

    const s = score(rule.single);
    if (s >= 16) return 10;
    if (s >= 13) return 5;
    // Optional Rules Cyclopedia penalties (Dark Dungeons Table 4-1 has bonuses only).
    if (window.RULESET.primeRequisitePenalties) {
        if (className === 'Mystic') { if (s <= 5) return -10; if (s <= 8) return -5; }
        else { if (s <= 5) return -20; if (s <= 8) return -10; }
    }
    return 0;
}

// Which prime requisite rule applies to a character's main XP: an Arcane Warrior
// earns XP with its own Compendium rule rather than the plain Fighter one.
function getXpBonusClass(character) {
    if (!character) return '';
    if (character.characterClass === 'Fighter' && character.subClass === 'Arcane Warrior') return 'Arcane Warrior';
    const option = getClassOption(character);
    if (option && option.sharesMainLevel) return option.name;   // otherwise the option has its own XP bar
    return character.characterClass;
}

// A class option (sub-class offered only to one base class, e.g. Shadow Shaman for a
// Shadow Elf) that levels together with the main class. Returns its ClassData or null.
function getClassOption(character) {
    if (!character || !character.subClass || typeof ClassesDatabase === 'undefined') return null;
    const info = ClassesDatabase[character.subClass];
    return info && info.optionOf && info.optionOf === character.characterClass ? info : null;
}

// XP needed per level: a class option such as the Shadow Shaman adds its own extra XP.
function getXpTableFor(character) {
    if (!character || typeof ClassesDatabase === 'undefined') return null;
    const option = getClassOption(character);
    if (option && option.extraXpTable && Array.isArray(option.xpTable)) return option.xpTable;
    return ClassesDatabase[character.characterClass]?.xpTable || null;
}

// THAC0 by level, from the class option when it fights differently (Shadow Shaman: as a Cleric).
function getThac0TableFor(character) {
    if (!character || typeof ClassesDatabase === 'undefined') return null;
    const option = getClassOption(character);
    if (option && Array.isArray(option.thac0) && option.thac0.length) return option.thac0;
    return ClassesDatabase[character.characterClass]?.thac0 || null;
}

window.debounce = debounce;
window.debouncedSave = debouncedSave;
window.safeSetVal = safeSetVal;
window.safeSetText = safeSetText;
window.calculateModifier = calculateModifier;
window.escapeHtml = escapeHtml;
window.clampInt = clampInt;
window.formatPercent = (n) => (n >= 0 ? `+${n}%` : `${n}%`);
// ---- Theme & ornaments ----------------------------------------------------
// Light/dark: follows the system until the candle button picks one, then remembers it.
function currentTheme() {
    const set = document.documentElement.getAttribute('data-theme');
    if (set === 'light' || set === 'dark') return set;
    return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}
function toggleTheme() {
    const next = currentTheme() === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try { localStorage.setItem('sheet-theme', next); } catch (e) { /* storage unavailable: choice lasts this session */ }
}

function toRoman(n) {
    let num = Math.max(1, Math.min(3999, Math.trunc(Number(n) || 1)));
    const map = [[1000,'M'],[900,'CM'],[500,'D'],[400,'CD'],[100,'C'],[90,'XC'],[50,'L'],[40,'XL'],[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];
    let out = '';
    map.forEach(([v, s]) => { while (num >= v) { out += s; num -= v; } });
    return out;
}

// Wax-seal modifiers (filled when non-zero) and the Roman-numeral level.
function refreshOrnaments() {
    ['str', 'int', 'wis', 'dex', 'con', 'cha'].forEach(prefix => {
        const el = document.getElementById(`${prefix}-mod`);
        if (!el) return;
        const v = Number(el.value) || 0;
        el.value = v > 0 ? `+${v}` : String(v);     // Number('+2') still reads back as 2
        el.dataset.sign = v > 0 ? 'plus' : (v < 0 ? 'minus' : 'zero');
    });
    const lvl = document.getElementById('char-level');
    const stage = (typeof currentCharacter !== 'undefined') ? getCreatureStage(currentCharacter) : null;
    safeSetText('char-level-roman', stage ? stage.short : toRoman(lvl ? lvl.value : 1));
}

// Creature heroes (PC1/PC2) begin below 1st level: "Young" and "Normal Monster"
// stages chosen by XP (which may be negative). Returns the stage or null.
function getCreatureStage(character) {
    if (!character || typeof ClassesDatabase === 'undefined') return null;
    const info = ClassesDatabase[character.characterClass];
    if (!info || !Array.isArray(info.preStages) || !info.preStages.length) return null;
    if ((Number(character.level) || 1) > 1) return null;
    const xp = Number(character.experiencePoints) || 0;
    if (xp >= (info.xpTable?.[1] ?? 0)) return null;               // reached 1st level
    let stage = info.preStages[0];
    info.preStages.forEach(s => { if (xp >= s.xp) stage = s; });
    return stage;
}

// Every XP threshold in order: a creature hero's stages before 1st level, then each level.
// Used so an award crosses at most one threshold (RC: one level per award; a stage counts as one).
function xpThresholds(character) {
    const info = (typeof ClassesDatabase !== 'undefined' && ClassesDatabase[character?.characterClass]) || {};
    const table = getXpTableFor(character) || info.xpTable || [];
    const stages = (Array.isArray(info.preStages) ? info.preStages : []).map(s => ({ xp: s.xp, label: s.name, stage: s }))
        .sort((a, b) => a.xp - b.xp);
    const levels = [];
    for (let l = 1; l <= 36; l++) if (table[l] !== undefined) levels.push({ xp: Number(table[l]) || 0, label: `Level ${toRoman(l)}`, level: l });
    // A level-1 entry at 0 XP is the same point as a "Normal Monster" stage at 0 only when no stage sits there.
    return [...stages, ...levels.filter(t => !(t.level === 1 && stages.length && t.xp <= stages[stages.length - 1].xp))];
}
// Where the character stands on that list (index of the last threshold reached).
function xpThresholdIndex(character, list = xpThresholds(character)) {
    const stage = getCreatureStage(character);
    if (stage) return Math.max(0, list.findIndex(t => t.stage === stage));
    const lvl = Number(character?.level) || 1;
    const i = list.findIndex(t => t.level === lvl);
    return i >= 0 ? i : 0;
}
// The next threshold ({ xp, label }) or null at the top.
function nextXpThreshold(character) {
    const list = xpThresholds(character);
    return list[xpThresholdIndex(character, list) + 1] || null;
}
// Highest XP one award can bring: just below the threshold after the next one.
function xpAwardCap(character) {
    const list = xpThresholds(character);
    const after = list[xpThresholdIndex(character, list) + 2];
    // Never below what the character already has (e.g. a level lowered by hand or drained).
    return after ? Math.max(after.xp - 1, Number(character?.experiencePoints) || 0) : Infinity;
}
// The lowest XP the character may have: its first stage (negative for young creatures), else 0.
function lowestXpFor(character) {
    const info = (typeof ClassesDatabase !== 'undefined' && ClassesDatabase[character?.characterClass]) || {};
    return Math.min(0, ...((info.preStages || []).map(s => s.xp)));
}
window.xpThresholds = xpThresholds;
window.nextXpThreshold = nextXpThreshold;
window.xpAwardCap = xpAwardCap;
window.lowestXpFor = lowestXpFor;

// XP fields show thousands separators ("16,000"); commas are ignored when reading,
// and the field is re-formatted when it loses focus.
function readXp(id) {
    const el = document.getElementById(id);
    if (!el) return 0;
    const raw = String(el.value).trim();
    const n = Number(raw.replace(/[^\d]/g, '')) || 0;
    return raw.startsWith('-') ? -n : n;       // young creature heroes start with negative XP
}
function writeXp(id, value) {
    const el = document.getElementById(id);
    if (!el) return;
    const n = Math.trunc(Number(value) || 0);
    el.value = document.activeElement === el ? String(n) : n.toLocaleString('en-US');
}
document.addEventListener('focusout', e => {
    if (e.target && e.target.matches && e.target.matches('[data-xp-field]')) writeXp(e.target.id, readXp(e.target.id));
});

// Progress ribbon from this level's XP threshold to the next one.
function renderXpBar(prefix, level, xp, xpTable, stageInfo) {
    const bar = document.getElementById(`${prefix}xp-bar`);
    const fill = document.getElementById(`${prefix}xp-bar-fill`);
    if (!bar || !fill) return;
    const lvl = clampInt(level, 1, 36, 1);
    const fmt = n => Math.round(n).toLocaleString('en-US');
    // stageInfo (creature heroes below 1st level): { fromLabel, from, toLabel, to }
    const from = stageInfo ? stageInfo.from : (Array.isArray(xpTable) ? (xpTable[lvl] ?? 0) : 0);
    const to = stageInfo ? stageInfo.to : (Array.isArray(xpTable) && lvl < 36 ? xpTable[lvl + 1] : undefined);

    let pct, togo, toLabel, state = 'progress';
    if (!Array.isArray(xpTable) || xpTable.length === 0) {
        pct = 0; togo = ''; toLabel = '';
    } else if (to === undefined) {
        pct = 100; togo = 'Highest level'; toLabel = 'Max';
        state = 'max';
    } else {
        pct = to > from ? ((xp - from) / (to - from)) * 100 : 100;
        pct = Math.max(0, Math.min(100, pct));
        togo = xp >= to ? 'Ready to advance' : `${fmt(to - xp)} to go`;
        toLabel = `${stageInfo ? stageInfo.toLabel : `Level ${toRoman(lvl + 1)}`} · ${fmt(to)}`;
        if (xp >= to) state = 'ready';
    }
    fill.style.width = `${pct}%`;
    bar.dataset.state = state;
    bar.setAttribute('aria-valuenow', String(Math.round(pct)));
    safeSetText(`${prefix}xp-bar-from`, `${stageInfo ? stageInfo.fromLabel : `Level ${toRoman(lvl)}`} · ${fmt(from)}`);
    safeSetText(`${prefix}xp-bar-togo`, togo);
    safeSetText(`${prefix}xp-bar-to`, toLabel);
}

// In-page message and confirm dialogs. The browser's own alert()/confirm() are not used:
// in Electron on Windows they can leave the window unable to take clicks or typing.
function sheetDialog(message, { confirm = false, okText = 'OK', cancelText = 'Cancel' } = {}) {
    return new Promise(resolve => {
        const old = document.getElementById('sheet-dialog');
        if (old) old.remove();
        const wrap = document.createElement('div');
        wrap.id = 'sheet-dialog';
        wrap.setAttribute('role', 'dialog');
        wrap.setAttribute('aria-modal', 'true');
        wrap.style.cssText = 'position: fixed; inset: 0; background: var(--overlay); z-index: 2000; display: flex; justify-content: center; align-items: center; padding: 16px;';
        const box = document.createElement('div');
        box.className = 'card';
        box.style.cssText = 'width: min(420px, 100%); display: flex; flex-direction: column; gap: 14px; margin: 0;';
        const text = document.createElement('div');
        text.style.cssText = 'white-space: pre-wrap; line-height: 1.45;';
        text.textContent = String(message ?? '');
        const row = document.createElement('div');
        row.style.cssText = 'display: flex; justify-content: flex-end; gap: 8px;';
        const done = value => { wrap.remove(); document.removeEventListener('keydown', onKey, true); resolve(value); };
        const onKey = e => {
            if (e.key === 'Escape') { e.preventDefault(); done(false); }
            else if (e.key === 'Enter') { e.preventDefault(); done(true); }
        };
        if (confirm) {
            const cancel = document.createElement('button');
            cancel.type = 'button'; cancel.className = 'btn btn-sm'; cancel.textContent = cancelText;
            cancel.onclick = () => done(false);
            row.appendChild(cancel);
        }
        const ok = document.createElement('button');
        ok.type = 'button'; ok.className = 'btn btn-sm btn-accent'; ok.textContent = okText;
        ok.onclick = () => done(true);
        row.appendChild(ok);
        box.append(text, row);
        wrap.appendChild(box);
        wrap.addEventListener('click', e => { if (e.target === wrap) done(false); });
        document.addEventListener('keydown', onKey, true);
        document.body.appendChild(wrap);
        ok.focus();
    });
}
function sheetAlert(message) { return sheetDialog(message); }
function sheetConfirm(message, okText = 'OK') { return sheetDialog(message, { confirm: true, okText }); }
// Any remaining alert() call shows the in-page dialog instead (it does not block).
window.alert = message => { sheetAlert(message); };
window.sheetDialog = sheetDialog;
window.sheetAlert = sheetAlert;
window.sheetConfirm = sheetConfirm;

// A short message at the bottom of the window that fades by itself, with an optional
// action button (e.g. Undo). sheetToast(text, { action: 'Undo', onAction: fn, ms: 6000 })
function sheetToast(text, { action = '', onAction = null, ms = 5000 } = {}) {
    let host = document.getElementById('sheet-toasts');
    if (!host) { host = document.createElement('div'); host.id = 'sheet-toasts'; host.setAttribute('aria-live', 'polite'); document.body.appendChild(host); }
    const t = document.createElement('div');
    t.className = 'sheet-toast';
    const span = document.createElement('span'); span.textContent = String(text ?? ''); t.appendChild(span);
    let timer = null;
    const close = () => { clearTimeout(timer); t.classList.add('leaving'); setTimeout(() => t.remove(), 250); };
    if (action && typeof onAction === 'function') {
        const b = document.createElement('button'); b.type = 'button'; b.className = 'btn btn-sm'; b.textContent = action;
        b.onclick = () => { close(); onAction(); };
        t.appendChild(b);
    }
    const x = document.createElement('button'); x.type = 'button'; x.className = 'icon-btn'; x.setAttribute('aria-label', 'Dismiss'); x.textContent = '×'; x.onclick = close;
    t.appendChild(x);
    host.appendChild(t);
    while (host.children.length > 4) host.firstChild.remove();
    timer = setTimeout(close, ms);
    t.addEventListener('mouseenter', () => clearTimeout(timer));
    t.addEventListener('mouseleave', () => { timer = setTimeout(close, 2500); });
    return close;
}
window.sheetToast = sheetToast;

// Forms: remember whether anything was typed, so a click outside or Esc asks before throwing it away.
function watchFormEdits(root) {
    if (!root || root.__watching) return;
    root.__watching = true; root.__edited = false;
    const mark = e => { if (e.isTrusted) root.__edited = true; };
    root.addEventListener('input', mark, true);
    root.addEventListener('change', mark, true);
}
function resetFormEdits(root) { if (root) root.__edited = false; }
async function okToDiscard(root) {
    if (!root || !root.__edited) return true;
    const ok = await sheetConfirm('Discard what you typed?', 'Discard');
    if (ok) root.__edited = false;
    return ok;
}
window.watchFormEdits = watchFormEdits;
window.resetFormEdits = resetFormEdits;
window.okToDiscard = okToDiscard;

// Esc closes the topmost open window. Each window registers its element id and how to close it
// (the close function may ask okToDiscard first). Handlers that close something themselves call
// e.preventDefault(), so one Esc never closes two windows.
const MODAL_CLOSERS = new Map();
function registerModalCloser(id, close) { MODAL_CLOSERS.set(id, close); }
function topmostOpenModal() {
    let best = null, bestZ = -Infinity, bestOrder = -1;
    const all = [...document.querySelectorAll('body *')];
    MODAL_CLOSERS.forEach((close, id) => {
        const el = document.getElementById(id);
        if (!el) return;
        const cs = getComputedStyle(el);
        if (cs.display === 'none' || cs.visibility === 'hidden') return;
        const z = Number(cs.zIndex) || 0;
        const order = all.indexOf(el);
        if (z > bestZ || (z === bestZ && order > bestOrder)) { best = { id, close }; bestZ = z; bestOrder = order; }
    });
    return best;
}
document.addEventListener('keydown', e => {
    if (e.key !== 'Escape' || e.defaultPrevented) return;
    if (document.getElementById('sheet-dialog')) return;          // the message box handles its own Esc
    const top = topmostOpenModal();
    if (!top) return;
    e.preventDefault();
    try { top.close(); } catch (err) { console.error(err); }
});
window.registerModalCloser = registerModalCloser;

// Search box for a long drop-down list: hide the options that don't match, and pick the first
// one that does if the chosen one was hidden (its change handler runs to update any preview).
function filterSelectOptions(selectId, text) {
    const sel = document.getElementById(selectId);
    if (!sel) return;
    const q = String(text || '').trim().toLowerCase();
    let first = null;
    [...sel.options].forEach(o => {
        const show = !q || o.textContent.toLowerCase().includes(q);
        o.hidden = !show;
        if (show && !first && o.value) first = o;
    });
    const cur = sel.options[sel.selectedIndex];
    if (first && (!cur || cur.hidden)) { sel.value = first.value; sel.dispatchEvent(new Event('change')); }
}
window.filterSelectOptions = filterSelectOptions;

window.readXp = readXp;
window.writeXp = writeXp;
window.renderXpBar = renderXpBar;
window.getPrimeRequisiteBonus = getPrimeRequisiteBonus;
window.toggleTheme = toggleTheme;
window.toRoman = toRoman;
window.refreshOrnaments = refreshOrnaments;
window.getXpBonusClass = getXpBonusClass;
window.getClassOption = getClassOption;
window.getCreatureStage = getCreatureStage;
window.getXpTableFor = getXpTableFor;
window.getThac0TableFor = getThac0TableFor;

// Windows close when you click on the dark area around them. A click that started inside a
// window (for example while selecting text in a field) and ended outside it is not such a click:
// the browser reports it on the backdrop, so it is stopped here before any window can close.
(function guardBackdropClicks() {
    let downTarget = null;
    document.addEventListener('mousedown', e => { downTarget = e.target; }, true);
    document.addEventListener('click', e => {
        const t = e.target;
        if (!downTarget || t === downTarget || !(t instanceof Element)) return;
        if (!t.contains(downTarget)) return;                       // pressed and released on unrelated places
        const st = getComputedStyle(t);
        const isBackdrop = st.position === 'fixed' && t.offsetWidth >= window.innerWidth * 0.9 && t.offsetHeight >= window.innerHeight * 0.9;
        if (isBackdrop) { e.stopPropagation(); e.preventDefault(); }
    }, true);
})();

// Lay the tab bar out on one line while it fits comfortably, otherwise in two even rows.
(function setupTabLayout() {
    let observer = null;
    function layoutTabs() {
        const bar = document.querySelector('.tabs');
        if (!bar) return;
        if (observer) observer.disconnect();          // our own measuring must not re-trigger us
        try { measureAndLay(bar); } finally { if (observer) observer.observe(bar, { attributes: true, subtree: true, attributeFilter: ['style'] }); }
    }
    function measureAndLay(bar) {
        const tabs = [...bar.querySelectorAll('.tab-btn')].filter(t => t.style.display !== 'none');
        if (!tabs.length) return;
        bar.classList.remove('tabs-two-rows');
        // Natural width of every visible tab on a single line.
        const gap = parseFloat(getComputedStyle(bar).columnGap) || 0;
        const needed = tabs.reduce((sum, t) => {
            const prev = t.style.flex; t.style.flex = '0 0 auto';
            const w = t.getBoundingClientRect().width;
            t.style.flex = prev;
            return sum + w + gap;
        }, -gap);
        // Nine or more tabs are too crowded on one line even when they just fit.
        if (tabs.length >= 9 || needed > bar.clientWidth + 1) {
            bar.style.setProperty('--tab-cols', String(Math.ceil(tabs.length / 2)));
            bar.classList.add('tabs-two-rows');
        }
    }
    window.layoutTabs = layoutTabs;
    function start() {
        const bar = document.querySelector('.tabs');
        if (!bar) return;
        layoutTabs();
        let pending = false;
        const soon = () => { if (pending) return; pending = true; requestAnimationFrame(() => { pending = false; layoutTabs(); }); };
        window.addEventListener('resize', soon);
        observer = new MutationObserver(soon);
        observer.observe(bar, { attributes: true, subtree: true, attributeFilter: ['style'] });
        if (document.fonts && document.fonts.ready) document.fonts.ready.then(soon);
    }
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start); else start();
})();
