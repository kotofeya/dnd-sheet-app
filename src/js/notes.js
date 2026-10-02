// js/notes.js — the Notes tab: biography, journal, contacts, factions and one search across all of it.

const BIO_FIELDS = [
    'bio-age', 'bio-gender', 'bio-height', 'bio-weight',
    'bio-homeland', 'bio-deity', 'bio-languages', 'bio-family',
    'bio-appearance', 'bio-personality', 'bio-backstory'
];
const BIO_LABELS = {
    age: 'Age', gender: 'Gender', height: 'Height', weight: 'Weight', homeland: 'Homeland', deity: 'Deity',
    languages: 'Languages', family: 'Family & relations', appearance: 'Appearance', personality: 'Personality', backstory: 'Backstory',
};

// Attitude of a contact toward the character, from ally to enemy.
const ATTITUDES = [
    { id: 'ally',       label: 'Ally',       color: 'var(--good)' },
    { id: 'friendly',   label: 'Friendly',   color: 'var(--info)' },
    { id: 'neutral',    label: 'Neutral',    color: 'var(--text-muted)' },
    { id: 'unfriendly', label: 'Unfriendly', color: 'var(--warn)' },
    { id: 'hostile',    label: 'Enemy',      color: 'var(--danger)' },
];
const CONTACT_STATUS = [
    { id: 'alive',   label: 'Alive' },
    { id: 'missing', label: 'Missing' },
    { id: 'dead',    label: 'Dead' },
];
// Standing with a faction, -3 (sworn enemy) to +3 (honoured).
const STANDINGS = { '-3': 'Sworn enemy', '-2': 'Hostile', '-1': 'Distrusted', '0': 'Unknown', '1': 'Accepted', '2': 'Trusted', '3': 'Honoured' };
const FACTION_TYPES = ['Noble house', 'Secret order', 'School or guild', 'Temple or church', 'Nation or realm', 'Thieves & criminals', 'Mercenaries', 'Other'];
// Languages known from birth (Rules Cyclopedia: demihuman classes).
const RACIAL_LANGUAGES = {
    'Dwarf': ['Dwarvish', 'Gnome', 'Goblin', 'Kobold'],
    'Elf': ['Elvish', 'Gnoll', 'Hobgoblin', 'Orc'],
    'Halfling': ['Halfling'],
};
const NOTE_COIN_GP = { pp: 5, gp: 1, ep: 0.5, sp: 0.1, cp: 0.01 };

let activeJournalEntryId = null;
let journalPreview = false;
let contactFilter = 'all';

function notesId(prefix) { return `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`; }
function notesSave() { if (typeof debouncedSave === 'function') debouncedSave(); }

// The campaign notes, created and upgraded as needed. The old free-text contacts box becomes
// one contact per line ("Name: role"); the original text is kept in campaignNotes.contacts.
function notesState() {
    if (!currentCharacter) return null;
    if (!currentCharacter.bio || typeof currentCharacter.bio !== 'object') currentCharacter.bio = {};
    if (!currentCharacter.campaignNotes || typeof currentCharacter.campaignNotes !== 'object') currentCharacter.campaignNotes = {};
    const n = currentCharacter.campaignNotes;
    if (!Array.isArray(n.journalEntries)) n.journalEntries = [];
    if (!Array.isArray(n.npcs)) n.npcs = [];
    if (!Array.isArray(n.factions)) n.factions = [];
    if (!n.contactsMigrated) {
        String(n.contacts || '').split(/\r?\n/)
            .map(l => l.replace(/^[\s•*\-–—]+/, '').trim()).filter(Boolean)
            .forEach(line => {
                const m = line.match(/^(.{1,60}?)\s*(?::|\s[–—-]\s)\s*(.*)$/);
                n.npcs.push(newContact({ name: (m ? m[1] : line).trim().slice(0, 80), role: m ? m[2].trim() : '' }));
            });
        n.contactsMigrated = true;
    }
    return n;
}

function newContact(values = {}) {
    return { id: notesId('npc'), name: '', role: '', location: '', faction: '', attitude: 'neutral', status: 'alive', lastSeen: '', notes: '', ...values };
}

function syncNotesUI() {
    if (!currentCharacter) return;
    notesState();
    BIO_FIELDS.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.value = currentCharacter.bio[id.replace('bio-', '')] || '';
    });
    renderBioExtras();
    renderBirthday();
    renderJournalEntriesList();
    renderContacts();
    renderFactions();
    renderPortraitUI();
    renderHeraldryUI();
    const search = document.getElementById('notes-search');
    if (search && search.value) renderNotesSearch();
}

// ---------------------------------------------------------------------------
// Biography: portrait, heraldry, noble title and languages hint
// ---------------------------------------------------------------------------
function readBioImage(event, key, after) {
    const file = event.target?.files?.[0];
    if (!file) return;
    if (file.size > 3 * 1024 * 1024) { sheetAlert('Image size exceeds 3 MB. Please choose a smaller image.'); return; }
    const reader = new FileReader();
    reader.onload = (e) => {
        if (!currentCharacter) return;
        notesState();
        currentCharacter.bio[key] = e.target?.result || '';
        after();
        notesSave();
    };
    reader.readAsDataURL(file);
}
function clickFileInput(id) {
    const input = document.getElementById(id);
    if (input) { input.value = ''; input.click(); }
}

function triggerPortraitUpload() { clickFileInput('portrait-file-input'); }
function handlePortraitFile(event) { readBioImage(event, 'portrait', renderPortraitUI); }
function removePortrait() {
    if (!currentCharacter?.bio) return;
    currentCharacter.bio.portrait = '';
    renderPortraitUI();
    notesSave();
}
function renderPortraitUI() {
    const img = document.getElementById('portrait-img');
    const placeholder = document.getElementById('portrait-placeholder');
    const removeBtn = document.getElementById('portrait-remove-btn');
    const frame = document.getElementById('portrait-frame');
    if (!img || !placeholder) return;
    const src = currentCharacter?.bio?.portrait;
    img.src = src || '';
    img.style.display = src ? 'block' : 'none';
    placeholder.style.display = src ? 'none' : 'flex';
    if (removeBtn) removeBtn.style.display = src ? 'block' : 'none';
    if (frame) frame.style.borderStyle = src ? 'solid' : 'dashed';
}

function triggerHeraldryUpload() { clickFileInput('heraldry-file-input'); }
function handleHeraldryFile(event) { readBioImage(event, 'heraldry', renderHeraldryUI); }
function removeHeraldry() {
    if (!currentCharacter?.bio) return;
    currentCharacter.bio.heraldry = '';
    renderHeraldryUI();
    notesSave();
}
function renderHeraldryUI() {
    const img = document.getElementById('heraldry-img');
    const placeholder = document.getElementById('heraldry-placeholder');
    const removeBtn = document.getElementById('heraldry-remove-btn');
    const frame = document.getElementById('heraldry-frame');
    if (!img || !placeholder) return;
    const src = currentCharacter?.bio?.heraldry;
    img.src = src || '';
    img.style.display = src ? 'block' : 'none';
    placeholder.style.display = src ? 'none' : 'flex';
    if (removeBtn) removeBtn.style.display = src ? 'block' : 'none';
    if (frame) frame.classList.toggle('has-image', !!src);
}

// Languages the character should know: Common, the alignment tongue and any racial languages.
function defaultLanguages(cls, alignment) {
    return ['Common', alignment ? `${alignment} (alignment)` : 'Alignment tongue', ...(RACIAL_LANGUAGES[cls] || [])];
}
function extraLanguageCount(intScore) {
    const s = Number(intScore) || 0;
    return s >= 18 ? 3 : s >= 16 ? 2 : s >= 13 ? 1 : 0;
}

function renderBioExtras() {
    if (!currentCharacter) return;
    // Noble title from the Dominion tab
    const line = document.getElementById('bio-title-line');
    if (line) {
        const nob = currentCharacter.dominion?.nobility;
        let text = '';
        if (nob && nob.title && typeof titleName === 'function') {
            text = `${titleName(nob)} ${currentCharacter.name || ''}${nob.of ? ` of ${nob.of}` : ''}`.trim();
            if (nob.liege) text += ` · vassal of ${nob.liege}`;
        }
        line.innerHTML = text ? `${getIcon('crown', 14)} <span>${escapeHtml(text)}</span>` : '';
        line.style.display = text ? 'flex' : 'none';
    }
    // Languages hint: Intelligence allows extra languages beyond the native ones.
    const hint = document.getElementById('bio-languages-hint');
    if (hint) {
        const intScore = currentCharacter.abilities?.intelligence;
        const native = defaultLanguages(currentCharacter.characterClass, currentCharacter.alignment);
        const extra = extraLanguageCount(intScore);
        const known = String(currentCharacter.bio.languages || '').split(/[,;]/).map(s => s.trim()).filter(Boolean);
        const missing = native.filter(l => !known.some(k => k.toLowerCase().startsWith(l.split(' ')[0].toLowerCase())));
        hint.innerHTML = `Native: ${escapeHtml(native.join(', '))}${extra ? ` · Intelligence ${escapeHtml(String(intScore))} allows ${extra} more` : ''}`
            + (missing.length ? ` · <button type="button" class="link-btn" onclick="addMissingLanguages()">add ${escapeHtml(missing.join(', '))}</button>` : '');
    }
}

// --- Birthday (Thyatian calendar: 12 months of 28 days) ----------------------------
// bio.birthday = { day: 1-28, month: 0-11, year?: AC }. With a year of birth the age follows the
// game calendar; without one the calendar adds a year to the age on each birthday.
function birthdayOf(ch = currentCharacter) {
    const b = ch && ch.bio && ch.bio.birthday;
    if (!b || !(Number(b.day) >= 1) || !(Number(b.month) >= 0) || Number(b.month) > 11 || b.month === '' || b.day === '') return null;
    const year = b.year === '' || b.year === null || b.year === undefined || !Number.isFinite(Number(b.year)) ? null : Math.trunc(Number(b.year));
    return { day: Math.min(28, Math.trunc(Number(b.day))), month: Math.trunc(Number(b.month)), year };
}
function ageOnDate(b, p) {
    if (!b || b.year === null) return null;
    const before = p.month < b.month || (p.month === b.month && p.day < b.day);
    return p.year - b.year - (before ? 1 : 0);
}
// Keep the Age field in step with the calendar when the year of birth is known.
function syncBirthdayAge() {
    const b = birthdayOf();
    if (!b || b.year === null || typeof calParts !== 'function' || typeof calendarState !== 'function') return;
    const age = ageOnDate(b, calParts(calendarState().t));
    if (age === null || age < 0) return;
    if (String(currentCharacter.bio.age || '') !== String(age)) {
        currentCharacter.bio.age = String(age);
        safeSetVal('bio-age', currentCharacter.bio.age);
    }
}
function renderBirthday() {
    if (!currentCharacter) return;
    const months = typeof CAL_MONTHS !== 'undefined' ? CAL_MONTHS : [];
    const daySel = document.getElementById('bio-bday-day');
    const monSel = document.getElementById('bio-bday-month');
    const yearIn = document.getElementById('bio-bday-year');
    if (!daySel || !monSel || !yearIn) return;
    if (daySel.options.length < 29) daySel.innerHTML = '<option value="">Day</option>' + Array.from({ length: 28 }, (_, i) => `<option value="${i + 1}">${i + 1}</option>`).join('');
    if (monSel.options.length < months.length + 1) monSel.innerHTML = '<option value="">Month</option>' + months.map((m, i) => `<option value="${i}">${m}</option>`).join('');
    const raw = (currentCharacter.bio && currentCharacter.bio.birthday) || {};
    daySel.value = raw.day !== undefined ? String(raw.day) : '';
    monSel.value = raw.month !== undefined ? String(raw.month) : '';
    yearIn.value = raw.year !== undefined && raw.year !== null ? String(raw.year) : '';
    const clearBtn = document.getElementById('bio-bday-clear');
    if (clearBtn) { clearBtn.style.display = (raw.day || raw.month !== undefined || raw.year) ? '' : 'none'; clearBtn.innerHTML = getIcon('close', 12); }
    const hint = document.getElementById('bio-bday-hint');
    const ageIn = document.getElementById('bio-age');
    const b = birthdayOf();
    if (ageIn) { ageIn.readOnly = Boolean(b && b.year !== null); ageIn.title = ageIn.readOnly ? 'Worked out from the birthday and the game calendar' : ''; }
    if (!hint) return;
    if (!b) {
        hint.textContent = (raw.day || raw.month !== undefined) ? 'Choose both the day and the month.' : '';
        const zEl = document.getElementById('bio-zodiac'); if (zEl) zEl.style.display = 'none';
        return;
    }
    const parts = [];
    if (typeof calParts === 'function' && typeof calendarState === 'function') {
        const now = calParts(calendarState().t);
        if (b.year !== null) {
            const born = calParts((b.year * 336 + b.month * 28 + b.day - 1) * 86400);
            parts.push(`Born on ${CAL_WEEKDAYS[born.weekday]}, ${b.day} ${months[b.month]} ${b.year} AC`);
            const age = ageOnDate(b, now);
            if (age !== null) parts.push(age < 0 ? 'not born yet on the calendar' : `${age} year${age === 1 ? '' : 's'} old`);
        } else parts.push(`${b.day} ${months[b.month]} (${typeof CAL_SEASONS !== 'undefined' ? CAL_SEASONS[b.month].toLowerCase() : ''})`);
        const z = typeof zodiacOf === 'function' ? zodiacOf(b.month) : null;
        if (z) parts.push(`sign of the ${z.sign}`);
        const doyB = b.month * 28 + b.day - 1;
        const until = (doyB - now.doy + 336) % 336;
        parts.push(until === 0 ? 'birthday today!' : `next birthday in ${until} day${until === 1 ? '' : 's'}`);
    }
    hint.textContent = parts.join(' · ');
    const zEl = document.getElementById('bio-zodiac');
    const z = typeof zodiacOf === 'function' ? zodiacOf(b.month) : null;
    if (zEl) {
        zEl.style.display = z ? '' : 'none';
        if (z) zEl.innerHTML = `${getIcon('star', 12)} <strong>${escapeHtml(z.sign)}</strong> <span class="bio-zodiac-glyph">(${escapeHtml(z.glyph)})</span> · ruled by ${escapeHtml(z.rulers)}<br><span class="bio-zodiac-good">${escapeHtml(z.virtues)}</span> · <span class="bio-zodiac-bad">${escapeHtml(z.flaws)}</span>`;
    }
}
function readBirthdayForm() {
    if (!currentCharacter) return;
    notesState();
    const day = document.getElementById('bio-bday-day')?.value || '';
    const month = document.getElementById('bio-bday-month')?.value || '';
    const year = (document.getElementById('bio-bday-year')?.value || '').trim();
    if (!day && !month && !year) delete currentCharacter.bio.birthday;
    else currentCharacter.bio.birthday = {
        ...(day ? { day: Number(day) } : {}), ...(month !== '' ? { month: Number(month) } : {}),
        ...(year !== '' && Number.isFinite(Number(year)) ? { year: Math.trunc(Number(year)) } : {}),
    };
    syncBirthdayAge();
    renderBirthday();
    if (typeof renderGameClock === 'function') { try { renderGameClock(); } catch (e) { console.error(e); } }
    notesSave();
}
function clearBirthday() {
    if (!currentCharacter) return;
    notesState();
    delete currentCharacter.bio.birthday;
    renderBirthday();
    notesSave();
}
window.clearBirthday = clearBirthday;

function addMissingLanguages() {
    if (!currentCharacter) return;
    notesState();
    const native = defaultLanguages(currentCharacter.characterClass, currentCharacter.alignment);
    const known = String(currentCharacter.bio.languages || '').split(/[,;]/).map(s => s.trim()).filter(Boolean);
    native.forEach(l => { if (!known.some(k => k.toLowerCase().startsWith(l.split(' ')[0].toLowerCase()))) known.push(l); });
    currentCharacter.bio.languages = known.join(', ');
    const el = document.getElementById('bio-languages');
    if (el) el.value = currentCharacter.bio.languages;
    renderBioExtras();
    notesSave();
}

// ---------------------------------------------------------------------------
// Light formatting: **bold**, *italic*, # headings, - lists, 1. lists, [[Name]] links
// ---------------------------------------------------------------------------
function findNoteTarget(name) {
    const n = notesState(); if (!n) return null;
    const key = String(name).trim().toLowerCase();
    const c = n.npcs.find(x => (x.name || '').trim().toLowerCase() === key);
    if (c) return { kind: 'contact', id: c.id };
    const f = n.factions.find(x => (x.name || '').trim().toLowerCase() === key);
    if (f) return { kind: 'faction', id: f.id };
    return null;
}

// `s` is already HTML-escaped.
function notesInline(s) {
    return s
        .replace(/\[\[([^\]]{1,80})\]\]/g, (m, label) => {
            const raw = label.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#0?39;/g, "'");
            const t = findNoteTarget(raw);
            if (!t) return `<span class="note-link missing" title="No contact or faction with this name yet">${label}</span>`;
            const fn = t.kind === 'contact' ? 'openContactEditor' : 'openFactionEditor';
            return `<a href="#" class="note-link" onclick="event.preventDefault(); closeJournalModal(); ${fn}('${t.id}')">${label}</a>`;
        })
        .replace(/\*\*(?=\S)(.+?)\*\*/g, '<strong>$1</strong>')
        .replace(/(^|[^*\w])\*(?=\S)([^*]+?)\*(?!\*)/g, '$1<em>$2</em>');
}

function renderNoteMarkup(text) {
    const lines = String(text || '').split(/\r?\n/);
    let html = '', list = null, para = [];
    const flushPara = () => { if (para.length) { html += `<p>${para.map(l => notesInline(escapeHtml(l))).join('<br>')}</p>`; para = []; } };
    const closeList = () => { if (list) { html += `</${list}>`; list = null; } };
    const openList = tag => { if (list !== tag) { closeList(); html += `<${tag}>`; list = tag; } };
    for (const raw of lines) {
        let m;
        if (!raw.trim()) { flushPara(); closeList(); continue; }
        if ((m = raw.match(/^\s*(#{1,3})\s+(.*)$/))) {
            flushPara(); closeList();
            const tag = `h${m[1].length + 3}`;
            html += `<${tag}>${notesInline(escapeHtml(m[2]))}</${tag}>`;
            continue;
        }
        if ((m = raw.match(/^\s*[-*•]\s+(.*)$/))) { flushPara(); openList('ul'); html += `<li>${notesInline(escapeHtml(m[1]))}</li>`; continue; }
        if ((m = raw.match(/^\s*\d+[.)]\s+(.*)$/))) { flushPara(); openList('ol'); html += `<li>${notesInline(escapeHtml(m[1]))}</li>`; continue; }
        closeList();
        para.push(raw);
    }
    flushPara(); closeList();
    return html;
}

function plainNoteText(text) {
    return String(text || '')
        .replace(/\[\[([^\]]*)\]\]/g, '$1')
        .replace(/^\s*#{1,3}\s+/gm, '')
        .replace(/^\s*[-*•]\s+/gm, '• ')
        .replace(/\*\*|\*/g, '')
        .replace(/\s+/g, ' ')
        .trim();
}

// ---------------------------------------------------------------------------
// Journal
// ---------------------------------------------------------------------------
function journalEntriesSorted() {
    const entries = notesState()?.journalEntries || [];
    return [...entries].sort((a, b) => (Number(a.timestamp) || 0) - (Number(b.timestamp) || 0));
}

// The adventure-log window an entry covers: after the previous entry was written, up to this one.
function journalLogRange(entry) {
    const sorted = journalEntriesSorted();
    const end = entry ? (Number(entry.timestamp) || 0) : Date.now();
    if (entry && !end) return null;
    const earlier = sorted.filter(e => e !== entry && (Number(e.timestamp) || 0) < end);
    const start = earlier.length ? Number(earlier[earlier.length - 1].timestamp) || 0 : 0;
    return { start, end };
}

function logEntriesBetween(range) {
    if (!range || !currentCharacter) return [];
    return (Array.isArray(currentCharacter.chronicle) ? currentCharacter.chronicle : []).filter(e => {
        const t = Date.parse(e.at);
        return t > range.start && t <= range.end && !['edit', 'restore'].includes(e.kind);
    });
}

function summarizeLog(entries) {
    const sum = { xp: 0, gp: 0, levels: [], events: 0, count: entries.length };
    entries.forEach(e => {
        const d = e.data || {};
        if (e.kind === 'xp') sum.xp += Number(d.credited ?? d.awarded) || 0;
        else if (e.kind === 'treasure') {
            sum.gp += Number(d.totalGP) || Object.entries(d.coins || {}).reduce((s, [k, v]) => s + (NOTE_COIN_GP[k] || 0) * (Number(v) || 0), 0);
        } else if (e.kind === 'level') {
            sum.levels.push(d.subClass ? `${d.subClass} ${d.from}→${d.to}` : `Level ${d.from}→${d.to}`);
        } else sum.events++;
    });
    return sum;
}

function summaryChips(sum) {
    if (!sum || !sum.count) return '';
    const chips = [];
    if (sum.xp) chips.push(`<span class="nj-chip">${getIcon('star', 12)} +${fmtNum(sum.xp)} XP</span>`);
    if (sum.gp) chips.push(`<span class="nj-chip">${getIcon('coin', 12)} ${sum.gp >= 10 ? fmtNum(sum.gp) : (Math.round(sum.gp * 100) / 100)} gp</span>`);
    sum.levels.forEach(l => chips.push(`<span class="nj-chip nj-chip-level">${getIcon('up', 12)} ${escapeHtml(l)}</span>`));
    if (sum.events) chips.push(`<span class="nj-chip">${sum.events} other event${sum.events === 1 ? '' : 's'}</span>`);
    return chips.join('');
}

function nextSessionNumber() {
    const nums = (notesState()?.journalEntries || []).map(e => Number(e.session) || 0);
    return nums.length ? Math.max(0, ...nums) + 1 : 1;
}

function renderJournalEntriesList() {
    const container = document.getElementById('journal-entries-container');
    if (!container || !currentCharacter) return;
    const entries = journalEntriesSorted();
    if (!entries.length) {
        container.innerHTML = '<div class="ledger-note" style="padding: 8px 0;">No journal entries yet. Click "+ New Entry" after a session: it shows the XP, treasure and level-ups recorded since your last entry.</div>';
        return;
    }
    const ordered = [...entries].reverse().sort((a, b) => (b.pinned ? 1 : 0) - (a.pinned ? 1 : 0));
    container.innerHTML = ordered.map(entry => {
        const sum = summarizeLog(logEntriesBetween(journalLogRange(entry)));
        const preview = plainNoteText(entry.content).slice(0, 140);
        const written = entry.timestamp ? new Date(Number(entry.timestamp)).toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }) : '';
        return `
            <div class="nj-row${entry.pinned ? ' pinned' : ''}" onclick="openJournalModal('${entry.id}')" role="button" tabindex="0" onkeydown="if (event.key === 'Enter') openJournalModal('${entry.id}')">
                <button type="button" class="nj-pin" onclick="event.stopPropagation(); toggleJournalPin('${entry.id}')" title="${entry.pinned ? 'Unpin' : 'Pin to the top'}" aria-label="${entry.pinned ? 'Unpin entry' : 'Pin entry'}">${getIcon('star', 14)}</button>
                <div class="nj-body">
                    <div class="nj-title">
                        ${entry.session ? `<span class="nj-session">Session ${escapeHtml(String(entry.session))}</span>` : ''}
                        <span>${escapeHtml(entry.title || 'Untitled Entry')}</span>
                        ${entry.date ? `<span class="nj-date">${escapeHtml(entry.date)}</span>` : ''}
                    </div>
                    ${preview ? `<div class="nj-preview">${escapeHtml(preview)}</div>` : ''}
                    ${sum.count ? `<div class="nj-chips">${summaryChips(sum)}</div>` : ''}
                </div>
                <span class="nj-written">${escapeHtml(written)}</span>
            </div>`;
    }).join('');
}

function toggleJournalPin(id) {
    const entry = notesState()?.journalEntries.find(e => e.id === id);
    if (!entry) return;
    entry.pinned = !entry.pinned;
    renderJournalEntriesList();
    notesSave();
}

function renderJournalLogSummary() {
    const box = document.getElementById('journal-log-summary');
    if (!box) return;
    const entry = activeJournalEntryId ? notesState().journalEntries.find(e => e.id === activeJournalEntryId) : null;
    const range = journalLogRange(entry);
    const logs = logEntriesBetween(range);
    if (!logs.length) {
        box.innerHTML = `<span class="sub-caption">${range ? 'Nothing recorded in the adventure log ' + (entry ? 'between the previous entry and this one.' : 'since your last entry.') : 'This entry predates the adventure log.'}</span>`;
        return;
    }
    box.innerHTML = `
        <span class="eyebrow">${entry ? 'This session in the log' : 'Since your last entry'}</span>
        <div class="nj-chips">${summaryChips(summarizeLog(logs))}</div>
        <button type="button" class="btn btn-sm" onclick="insertLogIntoJournal()" title="Add the adventure log lines to the notes as a list">Insert log lines</button>`;
}

function insertLogIntoJournal() {
    const ta = document.getElementById('journal-entry-content');
    if (!ta) return;
    const entry = activeJournalEntryId ? notesState().journalEntries.find(e => e.id === activeJournalEntryId) : null;
    const logs = logEntriesBetween(journalLogRange(entry));
    if (!logs.length) return;
    const block = `## From the adventure log\n${logs.map(e => `- ${e.text}`).join('\n')}\n`;
    ta.value = ta.value.trim() ? `${ta.value.replace(/\s+$/, '')}\n\n${block}` : block;
    if (journalPreview) renderJournalPreview();
}

function openJournalModal(entryId = null) {
    const n = notesState();
    if (!n) return;
    activeJournalEntryId = entryId;
    const modal = document.getElementById('journal-entry-modal');
    if (!modal) return;
    const entry = entryId ? n.journalEntries.find(e => e.id === entryId) : null;
    const set = (id, v) => { const el = document.getElementById(id); if (el) el.value = v; };
    document.getElementById('journal-modal-heading').innerText = entry ? 'Journal Entry' : 'New Journal Entry';
    set('journal-entry-title', entry?.title || '');
    set('journal-entry-date', entry ? (entry.date || '') : (typeof gameDateText === 'function' ? gameDateText() : ''));
    set('journal-entry-content', entry?.content || '');
    set('journal-entry-session', entry ? (entry.session || '') : nextSessionNumber());
    const pin = document.getElementById('journal-entry-pinned'); if (pin) pin.checked = !!entry?.pinned;
    const del = document.getElementById('journal-delete-btn'); if (del) del.style.display = entry ? 'block' : 'none';
    renderJournalLogSummary();
    modal.style.display = 'flex';
    // Existing entries open for reading; new ones for writing.
    setJournalPreview(!!(entry && entry.content));
    if (!entry) document.getElementById('journal-entry-title')?.focus();
}

function closeJournalModal() {
    const modal = document.getElementById('journal-entry-modal');
    if (modal) modal.style.display = 'none';
    activeJournalEntryId = null;
}

function handleJournalModalBackdrop(event) {
    if (event.target && event.target.id === 'journal-entry-modal') closeJournalModal();
}

function renderJournalPreview() {
    const pane = document.getElementById('journal-entry-preview');
    const ta = document.getElementById('journal-entry-content');
    if (!pane || !ta) return;
    pane.innerHTML = ta.value.trim() ? renderNoteMarkup(ta.value) : '<p class="ledger-note">Nothing written yet.</p>';
}

function setJournalPreview(on) {
    journalPreview = !!on;
    const pane = document.getElementById('journal-entry-preview');
    const ta = document.getElementById('journal-entry-content');
    const tools = document.getElementById('journal-tools');
    if (!pane || !ta) return;
    if (journalPreview) renderJournalPreview();
    pane.style.display = journalPreview ? 'block' : 'none';
    ta.style.display = journalPreview ? 'none' : 'block';
    if (tools) tools.classList.toggle('disabled', journalPreview);
    tools?.querySelectorAll('button').forEach(b => { b.disabled = journalPreview; });
    document.getElementById('journal-view-write')?.classList.toggle('on', !journalPreview);
    document.getElementById('journal-view-read')?.classList.toggle('on', journalPreview);
    if (!journalPreview && document.getElementById('journal-entry-modal')?.style.display === 'flex') ta.focus();
}

// Formatting buttons: wrap the selection or prefix the selected lines.
function journalFormat(kind) {
    const ta = document.getElementById('journal-entry-content');
    if (!ta || journalPreview) return;
    const { selectionStart: s, selectionEnd: e, value: v } = ta;
    const sel = v.slice(s, e);
    const wrap = (before, after, placeholder) => {
        const inner = sel || placeholder;
        ta.value = v.slice(0, s) + before + inner + after + v.slice(e);
        ta.setSelectionRange(s + before.length, s + before.length + inner.length);
    };
    const prefix = (p) => {
        const lineStart = v.lastIndexOf('\n', s - 1) + 1;
        const block = v.slice(lineStart, e) || '';
        const done = block.split('\n').map(l => l.startsWith(p) ? l : p + l).join('\n');
        ta.value = v.slice(0, lineStart) + done + v.slice(e);
        ta.setSelectionRange(lineStart, lineStart + done.length);
    };
    if (kind === 'bold') wrap('**', '**', 'bold text');
    else if (kind === 'italic') wrap('*', '*', 'italic text');
    else if (kind === 'link') wrap('[[', ']]', 'Name');
    else if (kind === 'heading') prefix('## ');
    else if (kind === 'list') prefix('- ');
    ta.focus();
}

function saveCurrentJournalEntry() {
    const n = notesState();
    if (!n) return;
    const get = id => document.getElementById(id)?.value || '';
    const title = get('journal-entry-title').trim() || 'Untitled Entry';
    const date = get('journal-entry-date').trim();
    const content = get('journal-entry-content');
    const session = clampInt(get('journal-entry-session'), 0, 9999, 0) || '';
    const pinned = !!document.getElementById('journal-entry-pinned')?.checked;
    const entry = activeJournalEntryId ? n.journalEntries.find(e => e.id === activeJournalEntryId) : null;
    if (entry) Object.assign(entry, { title, date, content, session, pinned });
    else n.journalEntries.push({ id: notesId('journal'), title, date, content, session, pinned, timestamp: Date.now() });
    closeJournalModal();
    renderJournalEntriesList();
    refreshNotesSearch();
    notesSave();
}

async function deleteCurrentJournalEntry() {
    if (!currentCharacter || !activeJournalEntryId) return;
    const ok = await sheetConfirm('Are you sure you want to delete this journal entry?', 'Delete');
    if (!ok) return;
    const n = notesState();
    n.journalEntries = n.journalEntries.filter(e => e.id !== activeJournalEntryId);
    closeJournalModal();
    renderJournalEntriesList();
    refreshNotesSearch();
    notesSave();
}

// The whole journal as one page, oldest first, ready to open in a browser and print.
function exportJournalDiary() {
    if (!currentCharacter) return;
    const entries = journalEntriesSorted();
    if (!entries.length) { sheetAlert('The journal is empty: there is nothing to export yet.'); return; }
    const name = currentCharacter.name || 'Unnamed hero';
    const cls = [currentCharacter.characterClass, currentCharacter.level ? `level ${currentCharacter.level}` : ''].filter(Boolean).join(', ');
    const body = entries.map(e => {
        const sum = summarizeLog(logEntriesBetween(journalLogRange(e)));
        const facts = [];
        if (sum.xp) facts.push(`+${fmtNum(sum.xp)} XP`);
        if (sum.gp) facts.push(`${fmtNum(sum.gp)} gp in treasure`);
        facts.push(...sum.levels);
        const written = e.timestamp ? new Date(Number(e.timestamp)).toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' }) : '';
        return `<article>
            <h2>${e.session ? `<span class="s">Session ${escapeHtml(String(e.session))}</span> ` : ''}${escapeHtml(e.title || 'Untitled Entry')}</h2>
            <div class="meta">${[e.date, written ? `written ${written}` : ''].filter(Boolean).map(escapeHtml).join(' · ')}</div>
            ${facts.length ? `<div class="facts">${facts.map(escapeHtml).join(' · ')}</div>` : ''}
            ${renderNoteMarkup(e.content).replace(/<a href="#"[^>]*>(.*?)<\/a>/g, '<span class="link">$1</span>')}
        </article>`;
    }).join('\n');
    const doc = `<!doctype html><html><head><meta charset="utf-8"><title>${escapeHtml(name)} — Journal</title>
<style>
body { font-family: 'EB Garamond', 'Palatino Linotype', Georgia, serif; color: #2A1F14; background: #FBF5E6; max-width: 46rem; margin: 2rem auto; padding: 0 1.2rem; line-height: 1.55; }
h1 { font-family: 'Cinzel', Georgia, serif; color: #9A2A1C; margin-bottom: 0; } .sub { color: #6A5842; margin-bottom: 2rem; }
article { border-top: 1px solid #B8954A; padding-top: 1rem; margin-top: 1.6rem; page-break-inside: avoid; }
h2 { font-family: 'Cinzel', Georgia, serif; font-size: 1.2rem; margin: 0; } h2 .s { color: #9A2A1C; }
.meta { color: #6A5842; font-style: italic; font-size: .9rem; } .facts { color: #3F6B2A; font-size: .9rem; margin: .3rem 0 .6rem; }
.link { color: #244A73; } h4, h5, h6 { margin: 1rem 0 .3rem; }
@media print { body { background: #fff; margin: 0 auto; } }
</style></head><body>
<h1>${escapeHtml(name)}</h1><div class="sub">${escapeHtml(cls)}${currentCharacter.bio?.homeland ? ' · ' + escapeHtml(currentCharacter.bio.homeland) : ''} · ${entries.length} journal entr${entries.length === 1 ? 'y' : 'ies'}</div>
${body}
</body></html>`;
    const blob = new Blob([doc], { type: 'text/html' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${name.replace(/[\\/:*?"<>|]+/g, '_')} - Journal.html`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

// ---------------------------------------------------------------------------
// A small form dialog for contacts and factions (above the sheet, below sheetDialog).
// Resolves to the values, '__delete__', or null when cancelled.
// ---------------------------------------------------------------------------
let notesFormDone = null;
function notesCloseForm() { if (notesFormDone) notesFormDone(null); }

function notesFormModal({ title, fields, values = {}, okText = 'Save', canDelete = false, extraHtml = '' }) {
    notesCloseForm();
    return new Promise(resolve => {
        const wrap = document.createElement('div');
        wrap.id = 'notes-form-modal';
        wrap.className = 'notes-form-wrap';
        wrap.setAttribute('role', 'dialog');
        wrap.setAttribute('aria-modal', 'true');
        const fieldHtml = f => {
            const v = values[f.key] ?? f.default ?? '';
            const id = `nf-${f.key}`;
            let input;
            if (f.type === 'textarea') input = `<textarea id="${id}" class="stat-input arc-input" rows="${f.rows || 4}" placeholder="${escapeHtml(f.placeholder || '')}">${escapeHtml(String(v))}</textarea>`;
            else if (f.type === 'select') input = `<select id="${id}" class="stat-input arc-input">${f.options.map(o => `<option value="${escapeHtml(String(o.value))}" ${String(o.value) === String(v) ? 'selected' : ''}>${escapeHtml(o.label)}</option>`).join('')}</select>`;
            else input = `<input type="text" id="${id}" class="stat-input arc-input" value="${escapeHtml(String(v))}" placeholder="${escapeHtml(f.placeholder || '')}" ${f.list ? `list="${id}-list"` : ''} maxlength="${f.max || 200}">`
                + (f.list ? `<datalist id="${id}-list">${f.list.map(o => `<option value="${escapeHtml(o)}"></option>`).join('')}</datalist>` : '');
            return `<label class="arc-field ${f.wide ? 'nf-wide' : ''}"><span class="eyebrow">${escapeHtml(f.label)}</span>${input}</label>`;
        };
        wrap.innerHTML = `
            <div class="card notes-form-card">
                <div class="arc-row-head" style="border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
                    <h2 style="border: none; padding: 0; margin: 0; font-size: 1.1rem;">${escapeHtml(title)}</h2>
                    <button type="button" class="icon-btn" data-act="cancel" aria-label="Close">${getIcon('close', 14)}</button>
                </div>
                <div class="notes-form-fields">${fields.map(fieldHtml).join('')}</div>
                ${extraHtml}
                <div class="notes-form-actions">
                    ${canDelete ? '<button type="button" class="btn btn-sm btn-danger" data-act="delete">Delete</button>' : ''}
                    <span style="flex: 1;"></span>
                    <button type="button" class="btn btn-sm" data-act="cancel">Cancel</button>
                    <button type="button" class="btn btn-sm btn-primary" data-act="ok">${escapeHtml(okText)}</button>
                </div>
            </div>`;
        const collect = () => Object.fromEntries(fields.map(f => [f.key, (document.getElementById(`nf-${f.key}`)?.value ?? '').trim()]));
        const done = value => {
            notesFormDone = null;
            wrap.remove();
            document.removeEventListener('keydown', onKey, true);
            resolve(value);
        };
        const onKey = e => {
            if (document.getElementById('sheet-dialog')) return;            // a confirm is open above us
            if (e.key === 'Escape') { e.preventDefault(); done(null); }
            else if (e.key === 'Enter' && e.target.tagName === 'INPUT') { e.preventDefault(); done(collect()); }
        };
        wrap.addEventListener('click', e => {
            if (e.target === wrap) return done(null);
            const act = e.target.closest('[data-act]')?.dataset.act;
            if (act === 'cancel') done(null);
            else if (act === 'ok') done(collect());
            else if (act === 'delete') done('__delete__');
        });
        notesFormDone = done;
        document.addEventListener('keydown', onKey, true);
        document.body.appendChild(wrap);
        wrap.querySelector('input, textarea, select')?.focus();
    });
}

// Journal entries that mention a name, as links for the contact and faction dialogs.
function journalMentions(name) {
    const key = String(name || '').trim().toLowerCase();
    if (key.length < 2) return '';
    const hits = journalEntriesSorted().filter(e => `${e.title}\n${e.content}`.toLowerCase().includes(key));
    if (!hits.length) return '';
    return `<div class="nf-mentions"><span class="eyebrow">Mentioned in the journal</span>
        ${hits.map(e => `<a href="#" class="note-link" onclick="event.preventDefault(); notesCloseForm(); openJournalModal('${e.id}')">${e.session ? `Session ${escapeHtml(String(e.session))}: ` : ''}${escapeHtml(e.title || 'Untitled')}</a>`).join('')}</div>`;
}

// ---------------------------------------------------------------------------
// Contacts
// ---------------------------------------------------------------------------
const attitudeOf = id => ATTITUDES.find(a => a.id === id) || ATTITUDES[2];
const CONTACT_FILTERS = {
    all: () => true,
    friends: c => (c.attitude === 'ally' || c.attitude === 'friendly') && c.status === 'alive',
    neutral: c => c.attitude === 'neutral' && c.status === 'alive',
    enemies: c => (c.attitude === 'unfriendly' || c.attitude === 'hostile') && c.status === 'alive',
    gone: c => c.status !== 'alive',
};

function setContactFilter(f) { contactFilter = CONTACT_FILTERS[f] ? f : 'all'; renderContacts(); }

function contactRowHtml(c) {
    const att = attitudeOf(c.attitude);
    const status = c.status && c.status !== 'alive' ? (CONTACT_STATUS.find(s => s.id === c.status)?.label || '') : '';
    const meta = [c.location, c.faction, c.lastSeen ? `last seen ${c.lastSeen}` : ''].filter(Boolean).map(escapeHtml).join(' · ');
    return `
        <div class="nc-row${status ? ' gone' : ''}" data-contact-id="${c.id}" onclick="openContactEditor('${c.id}')" role="button" tabindex="0" onkeydown="if (event.key === 'Enter') openContactEditor('${c.id}')">
            <span class="nc-att" style="--att: ${att.color};">${escapeHtml(att.label)}</span>
            <div class="nc-body">
                <div class="nc-name">${escapeHtml(c.name || 'Unnamed')}${c.role ? ` <span class="nc-role">${escapeHtml(c.role)}</span>` : ''}${status ? ` <span class="nc-status">${escapeHtml(status)}</span>` : ''}</div>
                ${meta ? `<div class="nc-meta">${meta}</div>` : ''}
            </div>
        </div>`;
}

// People the rest of the sheet already knows about: liege, dominion officials and an arcane mentor.
function linkedContacts() {
    const out = [];
    const ch = currentCharacter || {};
    const nob = ch.dominion?.nobility;
    if (nob?.liege) out.push({ name: nob.liege, role: 'Liege', source: 'Dominion', attitude: 'friendly' });
    (ch.dominion?.officials || []).forEach(o => { if (o && (o.name || o.role)) out.push({ name: o.name || '', role: o.role || 'Official', source: 'Dominion', attitude: 'ally' }); });
    const m = ch.arcana?.mentor;
    if (m?.name) out.push({ name: m.name, role: 'Mentor', source: 'Arcana', attitude: m.dead ? 'neutral' : 'ally', status: m.dead ? 'dead' : 'alive' });
    return out;
}

function renderContacts() {
    const list = document.getElementById('contacts-list');
    if (!list || !currentCharacter) return;
    const n = notesState();
    document.querySelectorAll('[data-contact-filter]').forEach(b => b.classList.toggle('on', b.dataset.contactFilter === contactFilter));
    const shown = n.npcs.filter(CONTACT_FILTERS[contactFilter] || CONTACT_FILTERS.all)
        .sort((a, b) => (a.status === 'alive' ? 0 : 1) - (b.status === 'alive' ? 0 : 1) || (a.name || '').localeCompare(b.name || ''));
    list.innerHTML = shown.length ? shown.map(contactRowHtml).join('')
        : `<div class="ledger-note" style="padding: 6px 0;">${n.npcs.length ? 'No contacts of this kind.' : 'No contacts yet. Add the people you meet: patrons, rivals, informants, innkeepers.'}</div>`;

    const linkedBox = document.getElementById('contacts-linked');
    if (!linkedBox) return;
    const known = new Set(n.npcs.map(c => (c.name || '').trim().toLowerCase()));
    const linked = linkedContacts().filter(l => l.name && !known.has(l.name.trim().toLowerCase()));
    linkedBox.innerHTML = linked.length ? `
        <div class="arc-sub-head"><span class="eyebrow eyebrow-strong">From your sheet</span><span class="eyebrow">not yet in your contacts</span></div>
        ${linked.map((l, i) => `
            <div class="nc-row nc-linked-row">
                <span class="nc-att" style="--att: ${attitudeOf(l.attitude).color};">${escapeHtml(l.source)}</span>
                <div class="nc-body"><div class="nc-name">${escapeHtml(l.name)} <span class="nc-role">${escapeHtml(l.role)}</span></div></div>
                <button type="button" class="btn btn-sm" onclick="adoptLinkedContact(${i})">Add</button>
            </div>`).join('')}` : '';
}

function adoptLinkedContact(index) {
    const n = notesState();
    const known = new Set(n.npcs.map(c => (c.name || '').trim().toLowerCase()));
    const l = linkedContacts().filter(x => x.name && !known.has(x.name.trim().toLowerCase()))[index];
    if (!l) return;
    n.npcs.push(newContact({ name: l.name, role: l.role, attitude: l.attitude, status: l.status || 'alive', notes: `From the ${l.source} tab.` }));
    renderContacts();
    notesSave();
}

async function openContactEditor(id = null) {
    const n = notesState();
    if (!n) return;
    const c = id ? n.npcs.find(x => x.id === id) : null;
    if (id && !c) return;
    const values = await notesFormModal({
        title: c ? (c.name || 'Contact') : 'New Contact',
        values: c || newContact(),
        canDelete: !!c,
        fields: [
            { key: 'name', label: 'Name', placeholder: 'e.g. Lord Dmitrios', max: 80 },
            { key: 'role', label: 'Role', placeholder: 'Patron, innkeeper, rival wizard...' },
            { key: 'attitude', label: 'Attitude toward you', type: 'select', options: ATTITUDES.map(a => ({ value: a.id, label: a.label })) },
            { key: 'status', label: 'Status', type: 'select', options: CONTACT_STATUS.map(s => ({ value: s.id, label: s.label })) },
            { key: 'location', label: 'Where to find them', placeholder: 'e.g. Specularum, the Lucky Lance inn' },
            { key: 'faction', label: 'Faction', placeholder: 'e.g. Veiled Society', list: n.factions.map(f => f.name).filter(Boolean) },
            { key: 'lastSeen', label: 'Last seen', placeholder: 'In-game date or session' },
            { key: 'notes', label: 'Notes', type: 'textarea', wide: true, placeholder: 'What they want, what they owe you, what you owe them...' },
        ],
        extraHtml: c ? journalMentions(c.name) : '',
    });
    if (values === null) return;
    if (values === '__delete__') {
        if (!(await sheetConfirm(`Delete ${c.name || 'this contact'}?`, 'Delete'))) return;
        n.npcs = n.npcs.filter(x => x.id !== c.id);
    } else {
        values.name = values.name || 'Unnamed';
        if (c) Object.assign(c, values); else n.npcs.push(newContact(values));
    }
    renderContacts();
    refreshNotesSearch();
    notesSave();
}

// ---------------------------------------------------------------------------
// Factions and standing
// ---------------------------------------------------------------------------
function standingLabel(v) { return STANDINGS[String(clampInt(v, -3, 3, 0))]; }

function factionPresets() {
    const presets = [];
    if (typeof SECRET_CRAFTS === 'object') Object.values(SECRET_CRAFTS).forEach(c => presets.push({ name: c.order, type: 'Secret order' }));
    presets.push({ name: 'Great School of Magic', type: 'School or guild' });
    const deity = (currentCharacter?.bio?.deity || currentCharacter?.deity || '').trim();
    if (deity) presets.push({ name: `Church of ${deity}`, type: 'Temple or church' });
    const nob = currentCharacter?.dominion?.nobility;
    if (nob?.liege) presets.push({ name: `Court of ${nob.liege}`, type: 'Noble house' });
    return presets;
}

function renderFactionPresetSelect() {
    const sel = document.getElementById('faction-preset');
    if (!sel) return;
    const have = new Set((notesState()?.factions || []).map(f => (f.name || '').toLowerCase()));
    const opts = factionPresets().filter(p => !have.has(p.name.toLowerCase()));
    sel.innerHTML = `<option value="">Add a faction…</option><option value="__custom__">Custom faction (type your own)…</option>`
        + (opts.length ? `<optgroup label="Suggested">${opts.map(p => `<option value="${escapeHtml(p.name)}">${escapeHtml(p.name)}</option>`).join('')}</optgroup>` : '');
}

function addFactionPreset(name) {
    if (!name) return;
    if (name === '__custom__') { openFactionEditor(); return; }
    const p = factionPresets().find(x => x.name === name);
    if (!p) return;
    const n = notesState();
    const f = { id: notesId('fac'), name: p.name, type: p.type, rank: '', standing: 0, notes: '', history: [] };
    // Members of a secret craft start in good standing with their own order.
    const craft = currentCharacter.arcana?.craft;
    if (craft?.order && typeof SECRET_CRAFTS === 'object' && SECRET_CRAFTS[craft.order]?.order === p.name) {
        f.standing = 1;
        f.rank = `${SECRET_CRAFTS[craft.order].title}${craft.circle ? `, circle ${craft.circle}` : ''}`;
    }
    n.factions.push(f);
    renderFactions();
    notesSave();
}

function renderFactions() {
    const list = document.getElementById('factions-list');
    if (!list || !currentCharacter) return;
    const n = notesState();
    renderFactionPresetSelect();
    if (!n.factions.length) {
        list.innerHTML = '<div class="ledger-note" style="padding: 6px 0;">No factions yet. Track the houses, orders, temples and guilds whose favour matters to you.</div>';
        return;
    }
    const ordered = [...n.factions].sort((a, b) => (Number(b.standing) || 0) - (Number(a.standing) || 0) || (a.name || '').localeCompare(b.name || ''));
    list.innerHTML = ordered.map(f => {
        const v = clampInt(f.standing, -3, 3, 0);
        const last = (f.history || []).slice(-1)[0];
        const pips = [-3, -2, -1, 0, 1, 2, 3].map(i => `<span class="nf-pip${i === v ? ' on' : ''}${i < 0 ? ' neg' : i > 0 ? ' pos' : ''}" title="${escapeHtml(STANDINGS[String(i)])}"></span>`).join('');
        return `
            <div class="nf-row" data-faction-id="${f.id}">
                <div class="nf-main" onclick="openFactionEditor('${f.id}')" role="button" tabindex="0" onkeydown="if (event.key === 'Enter') openFactionEditor('${f.id}')">
                    <div class="nf-name">${escapeHtml(f.name || 'Unnamed')}</div>
                    <div class="nc-meta">${[f.type, f.rank].filter(Boolean).map(escapeHtml).join(' · ')}</div>
                    ${last ? `<div class="nc-meta nf-last">${escapeHtml(last.reason ? `${last.reason} (${standingLabel(last.to)})` : `Now ${standingLabel(last.to)}`)}</div>` : ''}
                </div>
                <div class="nf-standing">
                    <div class="nf-pips" aria-label="Standing ${escapeHtml(standingLabel(v))}">${pips}</div>
                    <div class="nf-standing-row">
                        <button type="button" class="icon-btn" onclick="changeFactionStanding('${f.id}', -1)" ${v <= -3 ? 'disabled' : ''} title="Standing worsens" aria-label="Lower standing">−</button>
                        <span class="nf-label nf-${v < 0 ? 'neg' : v > 0 ? 'pos' : 'zero'}">${escapeHtml(standingLabel(v))}</span>
                        <button type="button" class="icon-btn" onclick="changeFactionStanding('${f.id}', 1)" ${v >= 3 ? 'disabled' : ''} title="Standing improves" aria-label="Raise standing">+</button>
                    </div>
                </div>
            </div>`;
    }).join('');
}

async function changeFactionStanding(id, delta) {
    const f = notesState()?.factions.find(x => x.id === id);
    if (!f) return;
    const from = clampInt(f.standing, -3, 3, 0);
    const to = clampInt(from + delta, -3, 3, from);
    if (to === from) return;
    const res = await notesFormModal({
        title: `${f.name}: ${standingLabel(from)} → ${standingLabel(to)}`,
        okText: delta > 0 ? 'Raise standing' : 'Lower standing',
        fields: [
            { key: 'reason', label: 'Why? (optional)', placeholder: delta > 0 ? 'e.g. Returned the stolen grimoire' : 'e.g. Refused the Prince\'s summons', wide: true },
            { key: 'when', label: 'In-game date (optional)', placeholder: 'e.g. 3 Felmont 1000 AC' },
        ],
    });
    if (!res) return;
    f.standing = to;
    if (!Array.isArray(f.history)) f.history = [];
    f.history.push({ at: new Date().toISOString(), from, to, reason: res.reason, when: res.when });
    if (typeof addChronicleEntry === 'function') {
        addChronicleEntry('note', `Standing with ${f.name}: ${standingLabel(from)} → ${standingLabel(to)}${res.reason ? ` (${res.reason})` : ''}.`, { faction: f.id, from, to });
    }
    renderFactions();
    refreshNotesSearch();
    notesSave();
}

async function openFactionEditor(id = null) {
    const n = notesState();
    if (!n) return;
    const f = id ? n.factions.find(x => x.id === id) : null;
    if (id && !f) return;
    const history = (f?.history || []).slice().reverse();
    const historyHtml = history.length ? `
        <div class="nf-history"><span class="eyebrow">Standing history</span>
        ${history.map(h => {
            const d = new Date(h.at);
            const real = isNaN(d) ? '' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
            return `<div class="nf-history-row"><span>${escapeHtml(standingLabel(h.from))} → <strong>${escapeHtml(standingLabel(h.to))}</strong>${h.reason ? ` · ${escapeHtml(h.reason)}` : ''}</span><span class="nc-meta">${escapeHtml([h.when, real].filter(Boolean).join(' · '))}</span></div>`;
        }).join('')}</div>` : '';
    const values = await notesFormModal({
        title: f ? (f.name || 'Faction') : 'New Faction',
        values: f || { type: 'Other', standing: 0 },
        canDelete: !!f,
        fields: [
            { key: 'name', label: 'Name', placeholder: 'e.g. House Ritterburg', max: 80 },
            { key: 'type', label: 'Kind', type: 'select', options: FACTION_TYPES.map(t => ({ value: t, label: t })) },
            { key: 'standing', label: 'Standing', type: 'select', options: [3, 2, 1, 0, -1, -2, -3].map(v => ({ value: v, label: STANDINGS[String(v)] })) },
            { key: 'rank', label: 'Your rank or role', placeholder: 'e.g. Initiate, sworn knight, informant' },
            { key: 'notes', label: 'Notes', type: 'textarea', wide: true, placeholder: 'Leaders, goals, favours owed, secrets learned...' },
        ],
        extraHtml: historyHtml + (f ? journalMentions(f.name) : ''),
    });
    if (values === null) return;
    if (values === '__delete__') {
        if (!(await sheetConfirm(`Delete ${f.name || 'this faction'} and its standing history?`, 'Delete'))) return;
        n.factions = n.factions.filter(x => x.id !== f.id);
    } else {
        values.name = values.name || 'Unnamed';
        values.standing = clampInt(values.standing, -3, 3, 0);
        if (f) {
            const before = clampInt(f.standing, -3, 3, 0);
            if (values.standing !== before) {
                if (!Array.isArray(f.history)) f.history = [];
                f.history.push({ at: new Date().toISOString(), from: before, to: values.standing, reason: 'Set by hand' });
            }
            Object.assign(f, values);
        } else n.factions.push({ id: notesId('fac'), history: [], ...values });
    }
    renderFactions();
    renderContacts();
    refreshNotesSearch();
    notesSave();
}

// ---------------------------------------------------------------------------
// Search across the journal, contacts, factions, biography and the adventure log
// ---------------------------------------------------------------------------
function searchSnippet(text, q, radius = 50) {
    const s = String(text || '').replace(/\s+/g, ' ');
    const i = s.toLowerCase().indexOf(q);
    if (i < 0) return escapeHtml(s.slice(0, radius * 2));
    const a = Math.max(0, i - radius), b = Math.min(s.length, i + q.length + radius);
    return `${a > 0 ? '…' : ''}${escapeHtml(s.slice(a, i))}<mark>${escapeHtml(s.slice(i, i + q.length))}</mark>${escapeHtml(s.slice(i + q.length, b))}${b < s.length ? '…' : ''}`;
}

function notesSearchResults(query) {
    const q = String(query || '').trim().toLowerCase();
    if (q.length < 2 || !currentCharacter) return [];
    const n = notesState();
    const groups = [];
    const push = (label, items) => { if (items.length) groups.push({ label, items }); };
    const firstHit = (pairs) => pairs.find(([, t]) => String(t || '').toLowerCase().includes(q));

    push('Journal', journalEntriesSorted().reverse().map(e => {
        const hit = firstHit([['title', e.title], ['date', e.date], ['content', plainNoteText(e.content)]]);
        return hit && { title: `${e.session ? `Session ${e.session}: ` : ''}${e.title || 'Untitled'}`, snippet: searchSnippet(hit[1], q), open: `openJournalModal('${e.id}')` };
    }).filter(Boolean));

    push('Contacts', n.npcs.map(c => {
        const hit = firstHit([['name', c.name], ['role', c.role], ['location', c.location], ['faction', c.faction], ['lastSeen', c.lastSeen], ['notes', c.notes]]);
        return hit && { title: c.name || 'Unnamed', snippet: searchSnippet(hit[1], q), open: `openContactEditor('${c.id}')` };
    }).filter(Boolean));

    push('Factions', n.factions.map(f => {
        const hit = firstHit([['name', f.name], ['type', f.type], ['rank', f.rank], ['notes', f.notes], ...(f.history || []).map(h => ['history', h.reason])]);
        return hit && { title: f.name || 'Unnamed', snippet: searchSnippet(hit[1], q), open: `openFactionEditor('${f.id}')` };
    }).filter(Boolean));

    push('Companions', (Array.isArray(currentCharacter.companions) ? currentCharacter.companions : []).map(c => {
        const hit = firstHit([['name', c.name], ['type', c.cls || c.species || c.role || c.troop], ['notes', c.notes]]);
        return hit && { title: c.name || 'Companion', snippet: searchSnippet(hit[1], q), open: `showCompanion('${String(c.id).replace(/[^\w-]/g, '')}')` };
    }).filter(Boolean));

    push('Biography', Object.keys(BIO_LABELS).map(k => {
        const v = currentCharacter.bio?.[k];
        return v && String(v).toLowerCase().includes(q) && { title: BIO_LABELS[k], snippet: searchSnippet(v, q), open: `focusBioField('bio-${k}')` };
    }).filter(Boolean));

    push('Adventure log', (currentCharacter.chronicle || []).slice().reverse().filter(e => String(e.text || '').toLowerCase().includes(q)).map(e => {
        const d = new Date(e.at);
        return { title: isNaN(d) ? 'Log entry' : d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' }), snippet: searchSnippet(e.text, q), open: `showLogEntry('${String(e.id).replace(/[^\w-]/g, '')}')` };
    }));
    return groups;
}

function renderNotesSearch() {
    const input = document.getElementById('notes-search');
    const box = document.getElementById('notes-search-results');
    if (!input || !box) return;
    const q = input.value.trim();
    if (q.length < 2) { box.style.display = 'none'; box.innerHTML = ''; return; }
    const groups = notesSearchResults(q);
    const total = groups.reduce((s, g) => s + g.items.length, 0);
    box.style.display = 'block';
    if (!total) { box.innerHTML = `<div class="ledger-note">Nothing matches “${escapeHtml(q)}”.</div>`; return; }
    const LIMIT = 8;
    box.innerHTML = `<div class="eyebrow" style="margin-bottom: 4px;">${total} match${total === 1 ? '' : 'es'}</div>` + groups.map(g => `
        <div class="ns-group">
            <div class="eyebrow eyebrow-strong">${escapeHtml(g.label)} <span class="eyebrow">${g.items.length}</span></div>
            ${g.items.slice(0, LIMIT).map(it => `
                <button type="button" class="ns-item" onclick="${it.open}">
                    <span class="ns-title">${escapeHtml(it.title)}</span>
                    <span class="ns-snippet">${it.snippet}</span>
                </button>`).join('')}
            ${g.items.length > LIMIT ? `<div class="sub-caption">and ${g.items.length - LIMIT} more: narrow the search.</div>` : ''}
        </div>`).join('');
}

function refreshNotesSearch() {
    const input = document.getElementById('notes-search');
    if (input && input.value.trim().length >= 2) renderNotesSearch();
}

function flashElement(el) {
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
    el.classList.remove('notes-flash');
    void el.offsetWidth;
    el.classList.add('notes-flash');
    setTimeout(() => el.classList.remove('notes-flash'), 2000);
}

function focusBioField(id) {
    const el = document.getElementById(id);
    if (!el) return;
    flashElement(el);
    el.focus({ preventScroll: true });
}

function showCompanion(id) {
    if (typeof switchTab === 'function') switchTab('tab-companions');
    setTimeout(() => flashElement(document.querySelector(`[data-companion-id="${id}"]`)), 50);
}

function showLogEntry(id) {
    if (typeof switchTab === 'function') switchTab('tab-core');
    if (typeof setChronicleFilter === 'function') setChronicleFilter('all');
    setTimeout(() => flashElement(document.querySelector(`[data-log-id="${id}"]`)), 50);
}

// ---------------------------------------------------------------------------
function initNotesListeners() {
    ['bio-bday-day', 'bio-bday-month', 'bio-bday-year'].forEach(id => {
        const el = document.getElementById(id);
        if (el) el.addEventListener('change', readBirthdayForm);
    });
    BIO_FIELDS.forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        el.addEventListener('input', (e) => {
            if (!currentCharacter) return;
            notesState();
            currentCharacter.bio[id.replace('bio-', '')] = e.target.value;
            if (id === 'bio-languages') renderBioExtras();
            if (id === 'bio-deity') renderFactionPresetSelect();
            notesSave();
        });
    });
    const ta = document.getElementById('journal-entry-content');
    if (ta) ta.addEventListener('keydown', e => {
        if (!(e.ctrlKey || e.metaKey)) return;
        const k = e.key.toLowerCase();
        if (k === 'b') { e.preventDefault(); journalFormat('bold'); }
        else if (k === 'i') { e.preventDefault(); journalFormat('italic'); }
        else if (k === 's') { e.preventDefault(); saveCurrentJournalEntry(); }
    });
    // Notes tab refreshes when it is opened, so links to the Dominion and Arcana tabs stay current.
    document.getElementById('btn-tab-notes')?.addEventListener('click', () => {
        try { renderBioExtras(); renderContacts(); renderFactions(); renderJournalEntriesList(); } catch (err) { console.error(err); }
    });
}

document.addEventListener('DOMContentLoaded', () => {
    initNotesListeners();
});

Object.assign(window, {
    syncNotesUI, renderJournalEntriesList, openJournalModal, closeJournalModal, handleJournalModalBackdrop,
    saveCurrentJournalEntry, deleteCurrentJournalEntry, toggleJournalPin, setJournalPreview, journalFormat,
    insertLogIntoJournal, exportJournalDiary, renderNoteMarkup,
    triggerPortraitUpload, handlePortraitFile, removePortrait, renderPortraitUI,
    triggerHeraldryUpload, handleHeraldryFile, removeHeraldry, renderHeraldryUI, addMissingLanguages, renderBioExtras,
    setContactFilter, openContactEditor, adoptLinkedContact, renderContacts,
    openFactionEditor, changeFactionStanding, addFactionPreset, renderFactions,
    renderNotesSearch, focusBioField, showLogEntry, showCompanion, notesCloseForm, defaultLanguages,
});
