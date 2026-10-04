// js/calendar.js — the game calendar and clock (Mystara's Thyatian calendar).
// 12 months of 28 days (336 days a year), weeks of 7 days, so every month and year starts on Lunadain.
// Months, holidays and seasons: Dawn of the Emperors, Players' Guide to Thyatis pp. 17-18.
// Shadow elf calendar: GAZ13 The Shadow Elves p. 36. Natural healing: Dark Dungeons p. 143.
// The calendar counts whole days (no time of day). Internally the date is stored as seconds since
// 1 Nuwmont, 0 AC, always on the start of a day.

const CAL_MONTHS = ['Nuwmont', 'Vatermont', 'Thaumont', 'Flaurmont', 'Yarthmont', 'Klarmont', 'Felmont', 'Fyrmont', 'Ambyrmont', 'Sviftmont', 'Eirmont', 'Kaldmont'];
const CAL_WEEKDAYS = ['Lunadain', 'Gromdain', 'Tserdain', 'Moldain', 'Nytdain', 'Loshdain', 'Soladain'];
const CAL_SEASONS = ['Winter', 'Winter', 'Spring', 'Spring', 'Spring', 'Summer', 'Summer', 'Summer', 'Autumn', 'Autumn', 'Autumn', 'Winter'];
// GAZ13 names 15 months for a 14-month year; its own worked example (day 101 = 5th of Crystals) omits "Name".
const SHADOW_ELF_MONTHS = ['Gathering', 'Refuge', 'Stone', 'Shaman', 'Crystals', 'Birth', 'Wanderers', 'Temple', 'Food', 'Days', 'Army', 'King', 'Others', 'Bounty'];
const CAL = { ROUND: 10, TURN: 600, HOUR: 3600, DAY: 86400, WEEK: 7 * 86400, MONTH: 28 * 86400, YEAR: 336 * 86400 };
// The Mystaran zodiac, one House per Thyatian month (Alphatian month names alongside).
// Kit Navarro, "Arcana Mystara: The Mystaran Zodiac", The Vaults of Pandius (pandius.com/mzodiac.html).
const CAL_ZODIAC = [
    { sign: 'Manticore', alphatian: 'Nyxmir', glyph: 'barbed wings and tail', rulers: 'Vanya, Planet of Ventures (Thyatian); Rathanos, Planet of Ardor (Alphatian)', virtues: 'bold, brave and cunning', flaws: 'short-tempered, violent, always looking for a fight' },
    { sign: 'Hydra', alphatian: 'Amphimir', glyph: 'many heads', rulers: 'Asterius, Alphaks', virtues: 'resourceful and shrewd; weighs many options and spots opportunities early', flaws: 'self-centred and greedy for the sake of self-preservation' },
    { sign: 'Centaur', alphatian: 'Alphamir', glyph: 'bow and arrow', rulers: 'Ixion, the Sun (life, birth and beginnings)', virtues: 'vigorous, strong and generous', flaws: 'egotistic, overly dramatic, extravagant, a spendthrift' },
    { sign: 'Basilisk', alphatian: 'Sulamir', glyph: 'crowned six-legged lizard', rulers: 'Valerias (love and romance)', virtues: 'passionate, robust, enthusiastic, an inspiring leader', flaws: 'overzealous, obsessive, domineering' },
    { sign: 'Chimera', alphatian: 'Sudmir', glyph: 'three heads on one body', rulers: 'Valerias (ancient); Patera, the Dark Moon (modern)', virtues: 'earthy confidence, enjoys material pleasures, a charismatic mystique', flaws: 'heedless, hedonistic, possessive, can seem aloof' },
    { sign: 'Gorgon', alphatian: 'Vertmir', glyph: 'bull\'s head with horns', rulers: 'Matera, the Moon (mind and consciousness)', virtues: 'reserved, quiet, studious', flaws: 'reclusive, inexpressive, prefers study to action' },
    { sign: 'Griffon', alphatian: 'Islamir', glyph: 'eagle\'s head and lion\'s body, wings poised for flight', rulers: 'Khoronus, Planet of Time', virtues: 'calm, warm, practical and steadfast', flaws: 'banal, fatalistic, resistant to change' },
    { sign: 'Dragon', alphatian: 'Andrumir', glyph: 'dragon taking wing', rulers: 'Khoronus (constancy) and Ordana (transformation)', virtues: 'independent, detached from worldly things, a keen sense of time, ambitious', flaws: 'impersonal, cold, antisocial' },
    { sign: 'Salamander', alphatian: 'Cyprimir', glyph: 'two salamanders, of fire and frost, moving apart', rulers: 'Tarastia (justice, revenge, punishment and reward)', virtues: 'calm, practical, sees both sides of an issue', flaws: 'overly critical, wishy-washy, miserly' },
    { sign: 'Pegasus', alphatian: 'Hastmir', glyph: 'winged horse', rulers: 'Asterius (thoughts, ideas, opportunities) and Alphatia (imagination, creativity)', virtues: 'enterprising, creative, fun, unafraid of risk', flaws: 'reckless and fickle; projects stay flights of fancy' },
    { sign: 'Warrior', alphatian: 'Eimir', glyph: 'helmet', rulers: 'Rathanos (Alphatian) or Vanya (Thyatian); later also Protius', virtues: 'courageous, astute, efficient; with Protius, wise and purposeful', flaws: 'jaded, heartless in its efficiency' },
    { sign: 'Giant', alphatian: 'Burymir', glyph: 'titan with a ploughshare', rulers: 'Tarastia (law) and Thanatos', virtues: 'strong, steadfast, a stubborn survivor', flaws: 'selfish, even more than the Salamander' },
];
function zodiacOf(month) { return CAL_ZODIAC[((Number(month) % 12) + 12) % 12] || null; }
function zodiacText(z) { return z ? `House of the ${z.sign} (${z.glyph}). Ruled by ${z.rulers}. At best ${z.virtues}; at worst ${z.flaws}.` : ''; }

// Thyatian holidays (month index, first day, last day).
const CAL_HOLIDAYS = [
    [0, 1, 7, 'New Year and the Winter Festivals (also the Crowning of Zendrolion I)'],
    [1, 22, 28, 'Late Vatermont: the port of Thyatis declares the Shipping Season open (the exact day varies)'],
    [2, 1, 1, 'First day of Spring; planting begins'],
    [3, 22, 22, 'Birthday of Emperor Thincol I: games, parades, gold for the poor'],
    [5, 1, 1, 'First day of Summer'],
    [5, 15, 21, 'Kerendan Days of the Hoof: races, jousts and horse fairs'],
    [6, 15, 15, 'Day of Valerias: romance, betrothals and duels for love'],
    [8, 1, 1, 'First day of Autumn'],
    [9, 8, 8, 'Vanya\'s Day: gifts, feasting, and only duels to the death'],
    [10, 22, 22, 'Protius\' Day: end of the shipping season'],
    [11, 1, 1, 'First day of Winter'],
    [11, 15, 21, 'Footman\'s Games: tournaments, fairs and bazaars'],
];

// ---------------------------------------------------------------------------
function calendarState(ch = currentCharacter) {
    if (!ch) return null;
    if (!ch.calendar || typeof ch.calendar !== 'object') ch.calendar = {};
    const c = ch.calendar;
    if (!Number.isFinite(Number(c.t))) c.t = 1000 * CAL.YEAR;     // 1 Nuwmont 1000 AC
    c.t = Math.floor(Number(c.t) / CAL.DAY) * CAL.DAY;           // whole days only
    // Bills start with the next month after the calendar is first used.
    if (c.wagesMonth === undefined) c.wagesMonth = calParts(c.t).monthAbs;
    if (c.dominionMonth === undefined) c.dominionMonth = calParts(c.t).monthAbs;
    if (!Array.isArray(c.timers)) c.timers = [];
    if (!Array.isArray(c.events)) c.events = [];
    if (!c.settings || typeof c.settings !== 'object') c.settings = { heal: true, age: true, shadowElf: false };
    return c;
}
function calParts(t) {
    const year = Math.floor(t / CAL.YEAR);
    let rem = t - year * CAL.YEAR;
    const doy = Math.floor(rem / CAL.DAY);
    rem -= doy * CAL.DAY;
    const month = Math.floor(doy / 28);
    return {
        year, doy, month, day: doy % 28 + 1, weekday: doy % 7,
        hour: Math.floor(rem / 3600), minute: Math.floor((rem % 3600) / 60), second: rem % 60,
        monthAbs: year * 12 + month, dayAbs: Math.floor(t / CAL.DAY),
    };
}
function calMoon(day) {
    // Matera is full on the 15th (Dawn of the Emperors: the Day of Valerias, 15 Felmont, is a full moon).
    if (day >= 13 && day <= 17) return 'Full moon';
    if (day <= 2 || day >= 27) return 'New moon';
    if (day >= 6 && day <= 10) return 'First quarter';
    if (day >= 20 && day <= 24) return 'Last quarter';
    return day < 15 ? 'Waxing moon' : 'Waning moon';
}
const pad2 = n => String(n).padStart(2, '0');
function calDateText(p, long = true) {
    return `${long ? CAL_WEEKDAYS[p.weekday] + ', ' : ''}${p.day} ${CAL_MONTHS[p.month]} ${p.year} AC`;
}
function shadowElfDateText(p) {
    return `${p.doy % 24 + 1} of the Month of ${SHADOW_ELF_MONTHS[Math.floor(p.doy / 24)]}, year ${p.year + 1105}`;
}
// Short in-game date for log entries and the journal (e.g. "17 Thaumont 1000 AC").
function gameDateText() {
    if (!currentCharacter) return '';
    return calDateText(calParts(calendarState().t), false);
}
function holidaysOn(month, day, year) {
    const c = calendarState();
    const fixed = CAL_HOLIDAYS.filter(h => h[0] === month && day >= h[1] && day <= h[2]).map(h => ({ name: h[3], fixed: true }));
    const own = (c?.events || []).filter(e => Number(e.month) === month && Number(e.day) === day && (!e.year || Number(e.year) === year)).map(e => ({ name: e.name, id: e.id }));
    const b = typeof birthdayOf === 'function' ? birthdayOf() : null;
    const bday = b && b.month === month && b.day === day && (b.year === null || year >= b.year)
        ? [{ name: `${currentCharacter.name || 'The character'}'s birthday${b.year !== null && year > b.year ? ` (${year - b.year})` : ''}`, birthday: true }] : [];
    return [...bday, ...fixed, ...own];
}
function formatDuration(secs) {
    const d = Math.max(0, Math.round(secs / CAL.DAY));
    if (d >= 28 && d % 28 === 0) { const m = d / 28; return `${m} month${m === 1 ? '' : 's'}`; }
    if (d >= 7 && d % 7 === 0) { const w = d / 7; return `${w} week${w === 1 ? '' : 's'}`; }
    return `${d} day${d === 1 ? '' : 's'}`;
}

// ---------------------------------------------------------------------------
// What is due: monthly wages and dominion accounts, weapon training, studies, expired timers.
function calendarDue() {
    const ch = currentCharacter;
    if (!ch) return [];
    const c = calendarState();
    const p = calParts(c.t);
    const due = [];
    const wages = typeof monthlyCost === 'function' && Array.isArray(ch.companions) ? ch.companions.reduce((s, x) => s + monthlyCost(x), 0) : 0;
    const wMonths = c.wagesMonth === undefined ? 1 : p.monthAbs - c.wagesMonth;
    if (wages > 0 && wMonths > 0) due.push({ text: wMonths > 1 ? `Wages owed for ${wMonths} months: ${(wages * wMonths).toLocaleString('en-US')} gp` : `Wages for ${CAL_MONTHS[p.month]}: ${wages.toLocaleString('en-US')} gp`, tab: 'tab-companions' });
    if (ch.dominion?.has && (c.dominionMonth === undefined || c.dominionMonth < p.monthAbs)) due.push({ text: 'Dominion accounts for the month', tab: 'tab-dominion' });
    const tr = ch.weaponTraining?.active;
    if (tr) {
        const weeksSince = c.trainingWeekT !== undefined ? Math.floor((c.t - c.trainingWeekT) / CAL.WEEK) : 0;
        if (weeksSince >= 1) due.push({ text: `Weapon training: ${weeksSince} week${weeksSince > 1 ? 's' : ''} passed since the last training week`, tab: 'tab-combat' });
    }
    c.timers.filter(x => x.ends <= c.t).forEach(x => due.push({ text: `${x.name}: time is up`, timer: x.id }));
    if (typeof holdingsDue === 'function') due.push(...holdingsDue());
    return due;
}
function activeStudies() {
    const a = currentCharacter?.arcana;
    if (!a) return [];
    const out = [];
    (a.research || []).filter(r => r.status === 'active').forEach(r => out.push({ key: `research:${r.id}`, label: `Research: ${r.name || r.kind}`, add: n => { r.days = (Number(r.days) || 0) + n; } }));
    if (a.craft?.study) out.push({ key: 'craft', label: 'Secret craft study', add: n => { a.craft.study.days = (Number(a.craft.study.days) || 0) + n; } });
    (a.mentor?.spells || []).filter(s => s.status === 'studying').forEach(s => out.push({ key: `mentor:${s.id}`, label: `Learning ${s.name} from the mentor`, add: n => { s.days = (Number(s.days) || 0) + n; } }));
    return out;
}

// ---------------------------------------------------------------------------
// Passing time
// opts: { rest: bool (full rest: 2 hp a day), studies: [keys], recoverSpells: bool, quiet: bool }
async function advanceTime(secs, opts = {}) {
    const ch = currentCharacter;
    if (!ch || !(secs > 0)) return;
    const c = calendarState();
    const before = calParts(c.t);
    const dueBefore = new Set(calendarDue().map(d => d.text));
    c.t += Math.round(secs);
    const after = calParts(c.t);
    const notes = [];

    // Natural healing for each day that passes: 1 hp a day, 2 if resting (Dark Dungeons p. 143).
    const mornings = after.dayAbs - before.dayAbs;
    if (c.settings.heal && mornings > 0 && ch.hitPoints) {
        const max = Number(ch.hitPoints.maximum) || 0, cur = Number(ch.hitPoints.current) || 0;
        if (cur < max && cur > 0) {
            const heal = Math.min(max - cur, mornings * (opts.rest ? 2 : 1));
            ch.hitPoints.current = cur + heal;
            if (typeof safeSetVal === 'function') safeSetVal('hp-current', ch.hitPoints.current);
            notes.push(`healed ${heal} hp (${mornings} day${mornings > 1 ? 's' : ''}, ${opts.rest ? 'resting' : 'active'})`);
        }
    }
    // Downtime counted toward studies.
    const days = Math.floor(secs / CAL.DAY);
    if (days > 0 && Array.isArray(opts.studies) && opts.studies.length) {
        activeStudies().filter(s => opts.studies.includes(s.key)).forEach(s => { s.add(days); notes.push(`+${days} day${days > 1 ? 's' : ''} to ${s.label.toLowerCase()}`); });
        if (typeof renderArcana === 'function') { try { renderArcana(); } catch (e) { console.error(e); } }
    }
    // Ageing: on the character's birthday, or on 1 Nuwmont if no birthday is set.
    const bday = typeof birthdayOf === 'function' ? birthdayOf(ch) : null;
    if (bday && ch.bio) {
        let crossed = 0;
        for (let y = before.year; y <= after.year; y++) {
            const tb = (y * 336 + bday.month * 28 + bday.day - 1) * CAL.DAY;
            if (tb > c.t - Math.round(secs) && tb <= c.t) crossed++;
        }
        if (crossed > 0) {
            const old = ch.bio.age;
            if (bday.year !== null) syncBirthdayAge();
            else if (c.settings.age && Number.isFinite(parseInt(ch.bio.age, 10))) {
                ch.bio.age = String(parseInt(ch.bio.age, 10) + crossed);
                if (typeof safeSetVal === 'function') safeSetVal('bio-age', ch.bio.age);
            }
            notes.push(String(ch.bio.age) !== String(old) && ch.bio.age ? `birthday (${bday.day} ${CAL_MONTHS[bday.month]}): now ${ch.bio.age} years old` : `birthday (${bday.day} ${CAL_MONTHS[bday.month]})`);
        }
    } else if (c.settings.age && after.year > before.year && ch.bio) {
        const age = parseInt(ch.bio.age, 10);
        if (Number.isFinite(age)) {
            ch.bio.age = String(age + (after.year - before.year));
            if (typeof safeSetVal === 'function') safeSetVal('bio-age', ch.bio.age);
            notes.push(`now ${ch.bio.age} years old`);
        }
    }
    if (typeof renderBirthday === 'function') { try { renderBirthday(); } catch (e) { console.error(e); } }
    // Monthly bills paid by themselves (option): one charge for each month that began.
    const autoPaid = c.settings.autoPay ? autoPayMonthly(after) : [];
    notes.push(...autoPaid);
    if (opts.recoverSpells && typeof getCasterProfiles === 'function' && typeof restSpellbook === 'function') {
        const profiles = getCasterProfiles(ch) || [];
        if (profiles.length) { profiles.forEach(pr => { try { restSpellbook(pr.key); } catch (e) { console.error(e); } }); notes.push('spells recovered'); }
    }

    const label = opts.label || `${formatDuration(secs)} passed`;
    if (typeof addChronicleEntry === 'function') addChronicleEntry('time', `${label}: now ${calDateText(after)}.${notes.length ? ' ' + notes.join('; ') + '.' : ''}`, { from: before, secs });
    if (typeof debouncedSave === 'function') debouncedSave();
    renderGameClock();
    if (document.getElementById('calendar-modal')) renderCalendarModal();

    // New alerts: timers that ran out, a new month's bills, holidays reached.
    if (opts.quiet) return;
    const fresh = calendarDue().filter(d => !dueBefore.has(d.text)).map(d => d.text);
    autoPaid.forEach(t => fresh.push(t.charAt(0).toUpperCase() + t.slice(1)));
    if (after.dayAbs !== before.dayAbs) holidaysOn(after.month, after.day, after.year).forEach(h => fresh.push(`Today: ${h.name}`));
    if (fresh.length && typeof sheetAlert === 'function') await sheetAlert(`${calDateText(after)}\n\n${fresh.map(f => '• ' + f).join('\n')}`);
}

// Wages and household costs for each new month, from the purse. Returns lines for the log.
function autoPayMonthly(now) {
    const ch = currentCharacter, c = calendarState(), out = [];
    if (typeof holdingsPay !== 'function' || typeof paySourceFunds !== 'function') return out;
    const src = monthlyPaySource();
    const fmt = n => `${(Math.round(n * 100) / 100).toLocaleString('en-US')} gp`;
    const bill = (monthKey, perMonth, what, logFn, names) => {
        if (c[monthKey] === undefined) { c[monthKey] = now.monthAbs; return; }
        const months = now.monthAbs - c[monthKey];
        if (months <= 0 || !(perMonth > 0)) { if (months > 0 && !(perMonth > 0)) c[monthKey] = now.monthAbs; return; }
        const total = perMonth * months;
        const label = months > 1 ? `${months} months of ${what}` : `${what} for ${CAL_MONTHS[now.month]}`;
        if (paySourceFunds(src) + 1e-9 < total) { out.push(`could not pay ${label} (${fmt(total)}): not enough in the ${src === 'purse' ? 'purse' : src === 'vault' ? 'vault' : 'purse and vault'}`); return; }
        holdingsPay(total, src);      // enough money, so this never stops to ask
        c[monthKey] = now.monthAbs;
        out.push(`paid ${label}: ${fmt(total)}`);
        if (typeof logFn === 'function') logFn(`Paid automatically from the ${paySourceLabel(src)}: ${label}, ${fmt(total)}${names ? ` (${names})` : ''}.`, { spent: total, auto: true });
    };
    const comps = Array.isArray(ch.companions) && typeof monthlyCost === 'function' ? ch.companions.filter(x => monthlyCost(x) > 0) : [];
    bill('wagesMonth', comps.reduce((s, x) => s + monthlyCost(x), 0), 'wages', typeof compLog === 'function' ? compLog : null, comps.map(x => x.name).join(', '));
    const homes = typeof householdBills === 'function' ? householdBills() : [];
    bill('holdingsMonth', homes.reduce((s, b) => s + b.amount, 0), 'household costs', typeof holdingsLog === 'function' ? holdingsLog : null, homes.map(b => b.name).join(', '));
    if (out.length) {
        if (typeof renderCompanions === 'function') { try { renderCompanions(); } catch (e) { console.error(e); } }
        if (typeof renderHoldings === 'function') { try { renderHoldings(); } catch (e) { console.error(e); } }
    }
    return out;
}

async function quickAdvance(kind) {
    if (kind === 'day') return advanceTime(CAL.DAY, { label: 'A day passed' });
    if (kind === 'week') return advanceTime(CAL.WEEK, { label: 'A week passed' });
    if (kind === 'rest') {
        const casters = typeof getCasterProfiles === 'function' ? (getCasterProfiles(currentCharacter) || []).length : 0;
        const recover = casters ? await sheetDialog('Rest for a day (heals 2 hp). Recover spells as well (a full night\'s sleep, then study or prayer)?', { confirm: true, okText: 'Recover spells', cancelText: 'Just rest' }) : false;
        return advanceTime(CAL.DAY, { label: 'Rested a day', rest: true, recoverSpells: recover });
    }
}

async function openPassTime() {
    window.__calStudyPick = [];
    const studies = activeStudies();
    const res = await notesFormModal({
        title: 'Pass time', okText: 'Pass time',
        fields: [
            { key: 'amount', label: 'How much', placeholder: 'e.g. 3' },
            { key: 'unit', label: 'Unit', type: 'select', options: [
                { value: CAL.DAY, label: 'days' }, { value: CAL.WEEK, label: 'weeks' }, { value: CAL.MONTH, label: 'months (28 days)' }] },
            { key: 'rest', label: 'Activity', type: 'select', options: [{ value: '', label: 'Active: travel, work, adventure (heal 1 hp a day)' }, { value: '1', label: 'Complete rest (heal 2 hp a day)' }] },
            { key: 'why', label: 'What happened (for the log)', placeholder: 'e.g. Travelled to Specularum', wide: true },
        ],
        values: { amount: '1', unit: CAL.DAY },
        extraHtml: studies.length ? `<div class="cal-studies"><span class="eyebrow">Count the days toward</span>${studies.map(s => `<label class="arc-check"><input type="checkbox" class="cal-study" value="${escapeHtml(s.key)}"> ${escapeHtml(s.label)}</label>`).join('')}</div>` : '',
    });
    // notesFormModal removes its DOM before resolving, so read the study boxes from a snapshot taken on click.
    if (!res) return;
    const secs = Math.round((Number(res.amount) || 0) * Number(res.unit));
    if (!(secs > 0)) return;
    await advanceTime(secs, { rest: res.rest === '1', studies: window.__calStudyPick || [], label: res.why ? `${res.why} (${formatDuration(secs)})` : undefined });
    window.__calStudyPick = [];
}
// Remember which study boxes were ticked before the dialog closes.
document.addEventListener('change', e => {
    if (e.target && e.target.classList && e.target.classList.contains('cal-study')) {
        window.__calStudyPick = [...document.querySelectorAll('.cal-study:checked')].map(x => x.value);
    }
}, true);

// ---------------------------------------------------------------------------
// The clock bar under the character's name
function renderGameClock() {
    const bar = document.getElementById('game-clock');
    if (!bar) return;
    if (!currentCharacter) { bar.style.display = 'none'; return; }
    bar.style.display = '';
    const c = calendarState();
    const p = calParts(c.t);
    const today = holidaysOn(p.month, p.day, p.year);
    const due = calendarDue();
    const nextTimer = c.timers.filter(x => x.ends > c.t).sort((a, b) => a.ends - b.ends)[0];
    bar.innerHTML = `
        <button type="button" class="game-clock-date" onclick="openCalendar()" title="Open the calendar">
            <span class="gc-date">${escapeHtml(calDateText(p))}</span>
            <span class="gc-meta">${CAL_SEASONS[p.month]} · ${calMoon(p.day)}${c.settings.shadowElf ? ` · ${escapeHtml(shadowElfDateText(p))}` : ''}</span>
            ${today.length ? `<span class="gc-holiday" title="${escapeHtml(today.map(h => h.name).join('\n'))}">${getIcon('star', 12)} ${escapeHtml(today[0].name.split(':')[0].split('(')[0].trim())}</span>` : ''}
            ${nextTimer ? `<span class="gc-timer" title="Next timer">${getIcon('hourglass', 12)} ${escapeHtml(nextTimer.name)}: ${formatDuration(nextTimer.ends - c.t)}</span>` : ''}
            ${due.length ? `<span class="gc-due" title="${escapeHtml(due.map(d => d.text).join('\n'))}">${due.length} due</span>` : ''}
        </button>
        <span class="game-clock-btns" role="group" aria-label="Pass time">
            <button type="button" class="btn btn-sm" onclick="quickAdvance('day')">+ Day</button>
            <button type="button" class="btn btn-sm" onclick="quickAdvance('week')">+ Week</button>
            <button type="button" class="btn btn-sm" onclick="quickAdvance('rest')" title="A full day of rest: heals 2 hp; casters may recover spells">Rest a day</button>
            <button type="button" class="btn btn-sm btn-accent" onclick="openPassTime()">Pass time…</button>
        </span>`;
}

// ---------------------------------------------------------------------------
// The calendar window
let calView = null;      // { year, month } being shown
function openCalendar() {
    if (!currentCharacter) return;
    const p = calParts(calendarState().t);
    calView = { year: p.year, month: p.month };
    let m = document.getElementById('calendar-modal');
    if (!m) {
        m = document.createElement('div');
        m.id = 'calendar-modal';
        m.className = 'notes-form-wrap';
        m.addEventListener('click', e => { if (e.target === m) closeCalendar(); });
        document.body.appendChild(m);
        document.addEventListener('keydown', calendarKeys, true);
    }
    renderCalendarModal();
}
function calendarKeys(e) {
    if (e.key === 'Escape' && document.getElementById('calendar-modal') && !document.getElementById('sheet-dialog') && !document.getElementById('notes-form-modal')) closeCalendar();
}
function closeCalendar() {
    document.getElementById('calendar-modal')?.remove();
    document.removeEventListener('keydown', calendarKeys, true);
}
function calShiftMonth(delta) {
    let m = calView.month + delta, y = calView.year;
    while (m < 0) { m += 12; y--; } while (m > 11) { m -= 12; y++; }
    calView = { year: y, month: m };
    renderCalendarModal();
}
function renderCalendarModal() {
    const m = document.getElementById('calendar-modal');
    if (!m || !currentCharacter) return;
    const c = calendarState();
    const now = calParts(c.t);
    const { year, month } = calView;
    const cells = [];
    for (let d = 1; d <= 28; d++) {
        const hol = holidaysOn(month, d, year);
        const isToday = year === now.year && month === now.month && d === now.day;
        const moon = calMoon(d);
        cells.push(`<button type="button" class="cal-day${isToday ? ' today' : ''}${hol.length ? ' holiday' : ''}${hol.some(h => h.birthday) ? ' birthday' : ''}" onclick="calPickDay(${d})" title="${escapeHtml([`${CAL_WEEKDAYS[(d - 1) % 7]} ${d} ${CAL_MONTHS[month]}`, moon, ...hol.map(h => h.name)].join('\n'))}">
            <span class="cal-num">${d}</span>${moon === 'Full moon' && d === 15 ? '<span class="cal-moon full" aria-label="Full moon"></span>' : moon === 'New moon' && d === 1 ? '<span class="cal-moon new" aria-label="New moon"></span>' : ''}
            ${hol.length ? `<span class="cal-hol">${escapeHtml(hol[0].name.split(':')[0].split('(')[0].trim())}</span>` : ''}</button>`);
    }
    const bdayHere = typeof birthdayOf === 'function' ? birthdayOf() : null;
    const monthHols = [...(bdayHere && bdayHere.month === month ? [`${bdayHere.day}: ${escapeHtml(currentCharacter.name || 'The character')}'s birthday${bdayHere.year !== null ? ` (born ${bdayHere.year} AC)` : ''}`] : []),
        ...CAL_HOLIDAYS.filter(h => h[0] === month).map(h => `${h[1]}${h[2] !== h[1] ? '-' + h[2] : ''}: ${h[3]}`),
        ...c.events.filter(e => Number(e.month) === month && (!e.year || Number(e.year) === year)).map(e => `${e.day}: ${e.name}${e.year ? '' : ' (every year)'} <button type="button" class="icon-btn danger" onclick="removeCalendarEvent('${e.id}')" aria-label="Remove event">${getIcon('close', 11)}</button>`)];
    const timers = c.timers.slice().sort((a, b) => a.ends - b.ends);
    const due = calendarDue();
    m.innerHTML = `
    <div class="card cal-card">
        <div class="arc-row-head" style="border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
            <div><h2 style="border: none; padding: 0; margin: 0; font-size: 1.15rem;">${escapeHtml(calDateText(now))}</h2>
                <span class="sub-caption">${CAL_SEASONS[now.month]}, ${calMoon(now.day).toLowerCase()} · Shadow elves: ${escapeHtml(shadowElfDateText(now))}</span></div>
            <button type="button" class="icon-btn" onclick="closeCalendar()" aria-label="Close">${getIcon('close', 14)}</button>
        </div>
        <div class="cal-layout">
            <div>
                <div class="cal-nav">
                    <button type="button" class="icon-btn" onclick="calShiftMonth(-1)" aria-label="Previous month">${getIcon('arrowLeft', 14)}</button>
                    <strong>${CAL_MONTHS[month]} ${year} AC</strong> <span class="eyebrow">${CAL_SEASONS[month]}</span>
                    <span class="eyebrow cal-zodiac" title="${escapeHtml(zodiacText(zodiacOf(month)) + ' Alphatian month: ' + zodiacOf(month).alphatian + '.')}">${getIcon('star', 11)} ${escapeHtml(zodiacOf(month).sign)}</span>
                    <button type="button" class="icon-btn" onclick="calShiftMonth(1)" aria-label="Next month">${getIcon('arrowRight', 14)}</button>
                </div>
                <div class="cal-grid">${CAL_WEEKDAYS.map(w => `<span class="cal-wd" title="${w}">${w.slice(0, 3)}</span>`).join('')}${cells.join('')}</div>
                <p class="sub-caption">Click a day to jump to it (or to add an event). Matera is full on the 15th.</p>
                ${monthHols.length ? `<div class="cal-list"><span class="eyebrow eyebrow-strong">This month</span>${monthHols.map(h => `<div>${h}</div>`).join('')}</div>` : ''}
            </div>
            <div class="cal-side">
                <div class="cal-list"><span class="eyebrow eyebrow-strong">Due</span>${due.length ? due.map(d => `<div class="cal-due-row">${escapeHtml(d.text)} ${d.tab ? `<button type="button" class="link-btn" onclick="closeCalendar(); switchTab('${d.tab}')">open</button>` : ''}${d.timer ? `<button type="button" class="link-btn" onclick="removeCalendarTimer('${d.timer}')">clear</button>` : ''}</div>`).join('') : '<div class="ledger-note">Nothing due.</div>'}</div>
                <div class="cal-list"><span class="arc-row-head"><span class="eyebrow eyebrow-strong">Timers</span><button type="button" class="btn btn-sm" onclick="addCalendarTimer()">+ Timer</button></span>
                    ${timers.length ? timers.map(x => `<div class="cal-timer${x.ends <= c.t ? ' done' : ''}"><span>${escapeHtml(x.name)}</span><span class="eyebrow">${x.ends <= c.t ? 'done' : formatDuration(x.ends - c.t) + ' left'}</span><button type="button" class="icon-btn danger" onclick="removeCalendarTimer('${x.id}')" aria-label="Remove timer">${getIcon('close', 11)}</button></div>`).join('') : '<div class="ledger-note">No timers. Count down the days to anything: a ship sailing, a debt falling due, a wand recharging.</div>'}</div>
                <div class="cal-list"><span class="eyebrow eyebrow-strong">Set the date</span>
                    <div class="cal-set">
                        <input type="number" id="cal-set-day" class="stat-input arc-input" min="1" max="28" value="${now.day}" aria-label="Day">
                        <select id="cal-set-month" class="stat-input arc-input" aria-label="Month">${CAL_MONTHS.map((n, i) => `<option value="${i}" ${i === now.month ? 'selected' : ''}>${n}</option>`).join('')}</select>
                        <input type="number" id="cal-set-year" class="stat-input arc-input" value="${now.year}" aria-label="Year (AC)">
                        <button type="button" class="btn btn-sm" onclick="setCalendarFromForm()">Set</button>
                    </div>
                    <p class="sub-caption">Setting the date moves the calendar without healing, wages or log entries; use “Pass time” for time that the characters live through.</p>
                </div>
                <div class="cal-list"><span class="eyebrow eyebrow-strong">Options</span>
                    <label class="arc-check"><input type="checkbox" ${c.settings.heal ? 'checked' : ''} onchange="setCalendarSetting('heal', this.checked)"> Heal naturally each day (1 hp, 2 if resting)</label>
                    <label class="arc-check"><input type="checkbox" ${c.settings.age ? 'checked' : ''} onchange="setCalendarSetting('age', this.checked)"> Add a year to the character's age on their birthday (1 Nuwmont if no birthday is set)</label>
                    <label class="arc-check"><input type="checkbox" ${c.settings.autoPay ? 'checked' : ''} onchange="setCalendarSetting('autoPay', this.checked)"> Pay wages and household costs automatically when a new month begins</label>
                    ${typeof paySourceSelect === 'function' ? paySourceSelect() : ''}
                    <label class="arc-check"><input type="checkbox" ${c.settings.shadowElf ? 'checked' : ''} onchange="setCalendarSetting('shadowElf', this.checked)"> Show the shadow elf date on the calendar bar</label>
                    ${typeof activeParty === 'function' ? '<button type="button" class="btn btn-sm" onclick="shareDateWithParty()" title="Set every party member\'s calendar to this date and time">Share this date with the party</button>' : ''}
                </div>
            </div>
        </div>
        <div class="arc-source">Calendar and holidays: Dawn of the Emperors, Players' Guide to Thyatis pp. 17-18 · Shadow elf calendar: GAZ13 p. 36 · Healing: Dark Dungeons p. 143</div>
    </div>`;
}

async function calPickDay(d) {
    const c = calendarState();
    const now = calParts(c.t);
    const label = `${CAL_WEEKDAYS[(d - 1) % 7]}, ${d} ${CAL_MONTHS[calView.month]} ${calView.year} AC`;
    const res = await notesFormModal({
        title: label, okText: 'Save',
        fields: [
            { key: 'action', label: 'What to do', type: 'select', options: [
                { value: 'pass', label: 'Pass time until this day (counts as lived time)' },
                { value: 'set', label: 'Set the calendar to this day (no healing or log)' },
                { value: 'event', label: 'Add an event on this day' },
                { value: 'yearly', label: 'Add a yearly event (birthday, festival...)' }] },
            { key: 'name', label: 'Event name (for events)', placeholder: 'e.g. Meeting with the Duke', wide: true },
        ],
        values: { action: 'event' },
    });
    if (!res) return;
    const target = calView.year * CAL.YEAR + (calView.month * 28 + d - 1) * CAL.DAY;
    if (res.action === 'pass') {
        if (target <= c.t) { await sheetAlert('That day is not in the future. Use “Set the calendar” to go back.'); return; }
        await advanceTime(target - c.t, { label: `Time passed until ${label}` });
    } else if (res.action === 'set') {
        c.t = target;
        if (typeof debouncedSave === 'function') debouncedSave();
        renderGameClock(); renderCalendarModal();
    } else {
        if (!res.name) return;
        c.events.push({ id: `ev_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, name: res.name.slice(0, 120), month: calView.month, day: d, year: res.action === 'yearly' ? null : calView.year });
        if (typeof debouncedSave === 'function') debouncedSave();
        renderCalendarModal(); renderGameClock();
    }
}
function removeCalendarEvent(id) {
    const c = calendarState();
    c.events = c.events.filter(e => e.id !== id);
    if (typeof debouncedSave === 'function') debouncedSave();
    renderCalendarModal(); renderGameClock();
}
function setCalendarFromForm() {
    const c = calendarState();
    const d = clampInt(document.getElementById('cal-set-day')?.value, 1, 28, 1);
    const mo = clampInt(document.getElementById('cal-set-month')?.value, 0, 11, 0);
    const y = clampInt(document.getElementById('cal-set-year')?.value, -5000, 20000, 1000);
    c.t = y * CAL.YEAR + (mo * 28 + d - 1) * CAL.DAY;
    calView = { year: y, month: mo };
    if (typeof debouncedSave === 'function') debouncedSave();
    if (typeof syncBirthdayAge === 'function') { syncBirthdayAge(); renderBirthday(); }
    renderGameClock(); renderCalendarModal();
}
function setCalendarSetting(key, value) {
    calendarState().settings[key] = !!value;
    if (typeof debouncedSave === 'function') debouncedSave();
    renderGameClock();
    if (key === 'autoPay') {
        if (typeof renderCompanions === 'function') { try { renderCompanions(); } catch (e) { console.error(e); } }
        if (typeof renderHoldings === 'function') { try { renderHoldings(); } catch (e) { console.error(e); } }
    }
}
async function addCalendarTimer() {
    const res = await notesFormModal({
        title: 'New timer', okText: 'Start',
        fields: [
            { key: 'name', label: 'Name', placeholder: 'e.g. Ship sails, Debt is due, Wand recharges' },
            { key: 'amount', label: 'Lasts', placeholder: 'e.g. 6' },
            { key: 'unit', label: 'Unit', type: 'select', options: [
                { value: CAL.DAY, label: 'days' }, { value: CAL.WEEK, label: 'weeks' }, { value: CAL.MONTH, label: 'months' }] },
        ],
        values: { amount: '3', unit: CAL.DAY },
    });
    if (!res) return;
    const secs = Math.round(Math.max(0, Number(res.amount) || 0)) * Number(res.unit);
    const name = (res.name || 'Timer').slice(0, 80);
    if (!(secs > 0)) return;
    const c = calendarState();
    c.timers.push({ id: `tm_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, name, ends: c.t + secs, length: secs });
    if (typeof debouncedSave === 'function') debouncedSave();
    renderGameClock(); renderCalendarModal();
}
function removeCalendarTimer(id) {
    const c = calendarState();
    c.timers = c.timers.filter(x => x.id !== id);
    if (typeof debouncedSave === 'function') debouncedSave();
    renderGameClock(); renderCalendarModal();
}

// Copy this character's date and time to the other members of the active party.
async function shareDateWithParty() {
    const party = typeof activeParty === 'function' ? activeParty() : null;
    const members = (party?.members || []).filter(f => typeof f === 'string' && f && f !== currentFileName);
    if (!members.length) { await sheetAlert('No other party members to share the date with. Add them in the Party window first.'); return; }
    if (!(await sheetConfirm(`Set the calendar of ${members.length} other party member${members.length > 1 ? 's' : ''} to ${gameDateText()}?`, 'Share'))) return;
    const t = calendarState().t;
    let done = 0;
    for (const file of members) {
        try {
            const data = await window.api.loadCharacterData(file);
            if (!data) continue;
            if (!data.calendar || typeof data.calendar !== 'object') data.calendar = {};
            data.calendar.t = t;
            await window.api.saveCharacter({ data, oldFilename: file });
            done++;
        } catch (e) { console.error(e); }
    }
    await sheetAlert(`Date shared with ${done} party member${done === 1 ? '' : 's'}.`);
}

Object.assign(window, {
    calendarState, calParts, gameDateText, advanceTime, quickAdvance, openPassTime, renderGameClock, openCalendar, closeCalendar,
    calShiftMonth, calPickDay, removeCalendarEvent, setCalendarFromForm, setCalendarSetting, addCalendarTimer, removeCalendarTimer,
    shareDateWithParty, calendarDue, formatDuration,
});
