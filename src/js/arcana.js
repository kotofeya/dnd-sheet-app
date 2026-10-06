// js/arcana.js — the Arcana tab for wizards (GAZ3 The Principalities of Glantri):
// the Seven Secret Crafts, the Great School of Magic, spell research and enchanting,
// and the Brotherhood of the Radiance. Rules data lives in arcana-data.js.

// ---------------------------------------------------------------------------
// Shared helpers
// ---------------------------------------------------------------------------
function arcanaState() {
    if (!currentCharacter) return null;
    const a = currentCharacter.arcana && typeof currentCharacter.arcana === 'object' ? currentCharacter.arcana : (currentCharacter.arcana = {});
    if (!a.craft || typeof a.craft !== 'object') a.craft = {};
    const c = a.craft;
    if (!c.learned || typeof c.learned !== 'object') c.learned = {};
    if (!c.uses || typeof c.uses !== 'object') c.uses = {};
    if (!Array.isArray(c.book)) c.book = [];
    c.runesToday = clampInt(c.runesToday, 0, 99, 0);
    if (!a.school || typeof a.school !== 'object') a.school = {};
    if (!Array.isArray(a.school.done)) a.school.done = [];
    if (!a.school.companion || typeof a.school.companion !== 'object') a.school.companion = {};
    if (!Array.isArray(a.research)) a.research = [];
    a.research = a.research.filter(p => p && typeof p === 'object' && RESEARCH_KINDS[p.kind]);
    if (!a.library || typeof a.library !== 'object') a.library = { own: false, value: 0 };
    if (!Array.isArray(a.library.books)) a.library.books = [];
    if (!a.mentor || typeof a.mentor !== 'object') a.mentor = {};
    if (!Array.isArray(a.mentor.spells)) a.mentor.spells = [];
    if (!a.radiance || typeof a.radiance !== 'object') a.radiance = {};
    if (!Array.isArray(a.radiance.rotted)) a.radiance.rotted = [];
    a.radiance.rads = clampInt(a.radiance.rads, 0, 999, 0);
    return a;
}

// The level the arcane abilities work from (a Paladin-style sub-class level does not count).
function arcaneProfile(character = currentCharacter) {
    if (!character || typeof getCasterProfiles !== 'function') return null;
    try { return getCasterProfiles(character).find(p => p.type === 'arcane' && !p.spellList) || null; } catch (e) { return null; }
}
function isArcaneCharacter(character = currentCharacter) {
    return Boolean(arcaneProfile(character));
}
function arcaneLevel() {
    const p = arcaneProfile();
    return p ? Math.max(1, Number(p.effectiveLevel) || Number(currentCharacter.level) || 1) : (Number(currentCharacter?.level) || 1);
}
// Arcane Warriors (Mystara Extra Rules Compendium) are fighters taught by a mentor under a pact:
// no Great School, no secret orders, no Radiance; research only from 9th level as a magic-user.
function isArcaneWarrior(character = currentCharacter) {
    return Boolean(character) && character.characterClass === 'Fighter' && character.subClass === 'Arcane Warrior';
}
function arcIntScore() {
    return Number(currentCharacter?.abilities?.intelligence?.score) || 10;
}
function arcanaSave(rerender = true) {
    if (typeof debouncedSave === 'function') debouncedSave();
    if (rerender) renderArcana();
}
function arcanaLog(text, data = {}) {
    if (typeof addChronicleEntry === 'function') addChronicleEntry('arcana', text, data);
}
const fmtDc = n => `${Math.round(Number(n) || 0).toLocaleString('en-US')} dc`;
const arcRoll = sides => 1 + Math.floor(Math.random() * sides);
const ordinal = n => `${n}${['th', 'st', 'nd', 'rd'][(n % 100 > 10 && n % 100 < 14) ? 0 : (n % 10 < 4 ? n % 10 : 0)] || 'th'}`;

// Show the Arcana tab only for characters who cast magic-user spells.
function updateArcanaTabVisibility() {
    const btn = document.getElementById('btn-tab-arcana');
    if (!btn) return;
    const show = Boolean(currentCharacter) && isArcaneCharacter();
    btn.style.display = show ? '' : 'none';
    const tab = document.getElementById('tab-arcana');
    if (!show && tab && tab.classList.contains('active-tab') && typeof switchTab === 'function') switchTab('tab-core');
}

// ---------------------------------------------------------------------------
// The Seven Secret Crafts
// ---------------------------------------------------------------------------
function currentCraft() {
    const a = arcanaState();
    return a && a.craft.order ? SECRET_CRAFTS[a.craft.order] || null : null;
}
function craftCircleComplete(craft, learned, circle) {
    const abs = craft.abilities.filter(x => x.circle === circle);
    return abs.length > 0 && abs.every(x => learned[x.id]);
}
function craftCircleReached(craft, learned) {
    let n = 0;
    for (let c = 1; c <= 5; c++) { if (craftCircleComplete(craft, learned, c)) n = c; else break; }
    return n;
}
// The learned ability whose mastery XP is still owed (at most one: no new cycle until it is paid).
function craftPendingMastery(craft, learned) {
    return craft.abilities.find(x => learned[x.id] && (Number(learned[x.id].xpEarned) || 0) < CRAFT_CIRCLES[x.circle].xp) || null;
}
function craftSuccess(ability) {
    const a = arcanaState();
    const craft = currentCraft();
    const circle = CRAFT_CIRCLES[ability.circle];
    let pct = circle.base + arcaneLevel();
    const notes = [];
    const rec = a.craft.learned[ability.id];
    if (rec && (Number(rec.xpEarned) || 0) < circle.xp) { pct = Math.floor(pct / 2); notes.push('halved until mastery XP is earned'); }
    if (craft && craft === SECRET_CRAFTS.alchemy && /^Field/.test(a.craft.detail || '')) { pct = Math.floor(pct / 2); notes.push('halved in a field laboratory'); }
    return { pct: Math.max(1, Math.min(99, pct)), notes };
}
function craftStudyBlock(craft, ability) {
    const a = arcanaState();
    const learned = a.craft.learned;
    const circle = CRAFT_CIRCLES[ability.circle];
    if (learned[ability.id]) return 'Learned';
    if (ability.circle > 1 && !craftCircleComplete(craft, learned, ability.circle - 1)) return `Learn every ${ordinal(ability.circle - 1)}-circle ability first`;
    if (arcaneLevel() < circle.level) return `Needs ${ordinal(circle.level)} level`;
    const pending = craftPendingMastery(craft, learned);
    if (pending) return `Earn the mastery XP for ${pending.name} first`;
    if (a.craft.study) return 'Already studying';
    return '';
}

async function setCraftOrder(order) {
    const a = arcanaState(); if (!a) return;
    const had = Object.keys(a.craft.learned).length;
    if (order === (a.craft.order || '')) return;
    if (had && !(await sheetConfirm('Leaving an order means losing its secrets (and revealing them is a major crime). Clear this order\'s abilities and switch?', 'Switch order'))) { renderArcana(); return; }
    const before = a.craft.order ? SECRET_CRAFTS[a.craft.order]?.name : '';
    a.craft = { order, learned: {}, uses: {}, book: [], runesToday: 0, sponsor: a.craft.sponsor || '' };
    if (order) arcanaLog(`Joined the secret order: ${SECRET_CRAFTS[order].order}.`, { order });
    else if (before) arcanaLog(`Left the order of ${before}.`);
    arcanaSave();
}
function setCraftField(field, value) {
    const a = arcanaState(); if (!a) return;
    a.craft[field] = String(value || '').slice(0, 200);
    arcanaSave();
}
function startCraftStudy(abilityId) {
    const a = arcanaState(); const craft = currentCraft(); if (!a || !craft) return;
    const ab = craft.abilities.find(x => x.id === abilityId); if (!ab || craftStudyBlock(craft, ab)) return;
    a.craft.study = { id: abilityId, days: 0 };
    arcanaSave();
}
function adjustCraftStudy(days) {
    const a = arcanaState(); const craft = currentCraft(); if (!a || !craft || !a.craft.study) return;
    const ab = craft.abilities.find(x => x.id === a.craft.study.id); if (!ab) return;
    const cycle = CRAFT_CIRCLES[ab.circle].cycle;
    a.craft.study.days = Math.max(0, Math.min(cycle, (Number(a.craft.study.days) || 0) + days));
    arcanaSave();
}
function cancelCraftStudy() {
    const a = arcanaState(); if (!a) return;
    a.craft.study = null;
    arcanaSave();
}
function finishCraftStudy(passed) {
    const a = arcanaState(); const craft = currentCraft(); if (!a || !craft || !a.craft.study) return;
    const ab = craft.abilities.find(x => x.id === a.craft.study.id); if (!ab) return;
    const circle = CRAFT_CIRCLES[ab.circle];
    const paid = (Number(a.craft.study.days) || 0) * circle.cost;
    if (!passed) {
        a.craft.study.days = 0;
        arcanaLog(`${craft.name}: failed the Intelligence roll for ${ab.name} after a ${circle.cycle}-day cycle (${fmtDc(paid)}). Studying it again.`, { ability: ab.id });
        return arcanaSave();
    }
    learnCraftAbility(craft, ab, `after ${circle.cycle} days of study (${fmtDc(paid)})`);
}
async function gainCraftByDuel(abilityId) {
    const craft = currentCraft(); if (!craft) return;
    const ab = craft.abilities.find(x => x.id === abilityId); if (!ab) return;
    if (!(await sheetConfirm(`Record that you defeated the High Master of ${craft.name} in a duel and gained ${ab.name}?`))) return;
    learnCraftAbility(craft, ab, 'by defeating the High Master in a duel');
}
function learnCraftAbility(craft, ab, how) {
    const a = arcanaState();
    const wasComplete = craftCircleComplete(craft, a.craft.learned, ab.circle);
    a.craft.learned[ab.id] = { xpEarned: 0, at: new Date().toISOString() };
    a.craft.study = null;
    arcanaLog(`${craft.name}: learned ${ab.name} (${ordinal(ab.circle)} circle) ${how}. Earn ${CRAFT_CIRCLES[ab.circle].xp.toLocaleString('en-US')} XP using it before the next cycle.`, { ability: ab.id, circle: ab.circle });
    // Witches lose 2 Charisma on finishing each circle.
    if (craft.chaLoss && !wasComplete && craftCircleComplete(craft, a.craft.learned, ab.circle)) {
        const cha = currentCharacter.abilities.charisma;
        const before = Number(cha.score) || 10;
        const after = Math.max(3, before - craft.chaLoss);
        if (after !== before) {
            cha.score = after; cha.modifier = calculateModifier(after);
            safeSetVal('cha-score', after); safeSetVal('cha-mod', cha.modifier);
            arcanaLog(`Witchcraft: finishing the ${ordinal(ab.circle)} circle lowered Charisma ${before} → ${after}.`, { from: before, to: after });
        }
    }
    arcanaSave();
}
async function forgetCraftAbility(abilityId) {
    const a = arcanaState(); const craft = currentCraft(); if (!a || !craft) return;
    const ab = craft.abilities.find(x => x.id === abilityId); if (!ab) return;
    if (!(await sheetConfirm(`Remove ${ab.name} from your learned abilities?`, 'Remove'))) return;
    delete a.craft.learned[abilityId];
    delete a.craft.uses[abilityId];
    arcanaSave();
}
function addCraftMasteryXp() {
    const a = arcanaState(); const craft = currentCraft(); if (!a || !craft) return;
    const pending = craftPendingMastery(craft, a.craft.learned); if (!pending) return;
    const input = document.getElementById('craft-mastery-xp');
    const amount = Math.max(0, Math.trunc(Number(input?.value) || 0));
    if (!amount) return;
    const rec = a.craft.learned[pending.id];
    const need = CRAFT_CIRCLES[pending.circle].xp;
    const before = Number(rec.xpEarned) || 0;
    rec.xpEarned = Math.min(need, before + amount);
    const used = rec.xpEarned - before;
    arcanaLog(`${craft.name}: +${used.toLocaleString('en-US')} mastery XP for ${pending.name} (${rec.xpEarned.toLocaleString('en-US')} / ${need.toLocaleString('en-US')}). These XP do not count toward your level.${rec.xpEarned >= need ? ' Mastered.' : ''}`, { ability: pending.id, xp: used });
    arcanaSave();
}
function toggleCraftUse(abilityId, index) {
    const a = arcanaState(); const craft = currentCraft(); if (!a || !craft) return;
    const ab = craft.abilities.find(x => x.id === abilityId); if (!ab) return;
    const max = ab.uses || CRAFT_CIRCLES[ab.circle].uses;
    const used = Math.min(Number(a.craft.uses[abilityId]) || 0, max);
    const next = index < used ? index : Math.min(max, index + 1);
    if (next > 0) a.craft.uses[abilityId] = next; else delete a.craft.uses[abilityId];
    arcanaSave();
}
// New day resets daily abilities (and runes used today); a new week also weekly; a new month all.
function resetCraftUses(period) {
    const a = arcanaState(); const craft = currentCraft(); if (!a || !craft) return;
    const resets = { day: ['day'], week: ['day', 'week'], month: ['day', 'week', 'month'] }[period] || ['day'];
    craft.abilities.forEach(ab => { if (resets.includes(CRAFT_CIRCLES[ab.circle].per)) delete a.craft.uses[ab.id]; });
    a.craft.runesToday = 0;
    arcanaSave();
    if (typeof sheetToast === 'function') sheetToast(`${{ day: 'Daily', week: 'Daily and weekly', month: 'All' }[period] || 'Daily'} craft abilities are ready again. The calendar did not move.`);
}
// Called by the calendar when time passes (after the clock has moved): a new day refills the daily
// craft abilities and runes used today; crossing into a new week (7 days) or month (28 days) also
// refills the weekly and monthly ones. Returns the periods reset, e.g. ['day', 'week'].
function arcanaTimePassed(days) {
    const n = Number(days) || 0;
    if (!currentCharacter || n <= 0) return [];
    const a = arcanaState(); const craft = currentCraft();
    if (!a || !craft) return [];
    const DAY = 86400;
    let nowDay = null;
    try { if (typeof calendarState === 'function') nowDay = Math.floor(Number(calendarState().t) / DAY); } catch (e) { nowDay = null; }
    const crossed = len => n >= len || (Number.isFinite(nowDay) && Math.floor(nowDay / len) !== Math.floor((nowDay - Math.ceil(n)) / len));
    if (n < 1 && !crossed(1)) return [];
    const periods = ['day'];
    if (crossed(7)) periods.push('week');
    if (crossed(28)) periods.push('month');
    const hadUses = Object.keys(a.craft.uses).length || a.craft.runesToday;
    craft.abilities.forEach(ab => { if (periods.includes(CRAFT_CIRCLES[ab.circle].per)) delete a.craft.uses[ab.id]; });
    a.craft.runesToday = 0;
    if (hadUses) arcanaSave(); else if (typeof debouncedSave === 'function') debouncedSave();
    return periods;
}
window.arcanaTimePassed = arcanaTimePassed;
function adjustRunesToday(delta) {
    const a = arcanaState(); if (!a) return;
    a.craft.runesToday = Math.max(0, (Number(a.craft.runesToday) || 0) + delta);
    arcanaSave();
}
function addCraftBookEntry() {
    const a = arcanaState(); if (!a) return;
    const input = document.getElementById('craft-book-input');
    const text = (input?.value || '').trim();
    if (!text) return;
    a.craft.book.push({ id: `bk_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, text: text.slice(0, 300) });
    arcanaSave();
}
function deleteCraftBookEntry(id) {
    const a = arcanaState(); if (!a) return;
    a.craft.book = a.craft.book.filter(e => e.id !== id);
    arcanaSave();
}
// Elementalists and illusionists are taught certain spells: add the ones the compendium has.
function addTaughtSpells() {
    const a = arcanaState(); const craft = currentCraft(); if (!a || !craft || !craft.taughtSpells) return;
    const names = [...(craft.taughtSpells.all || []), ...((a.craft.detail && craft.taughtSpells[a.craft.detail]) || [])];
    const norm = s => String(s).toLowerCase().replace(/[’'`]/g, "'").replace(/[^a-z0-9']+/g, ' ').trim();
    const byName = {};
    Object.values(GlobalSpellsDatabase).forEach(s => { if (s.casterType === 'arcane') byName[norm(s.name)] = s; });
    if (!currentCharacter.spellbook) currentCharacter.spellbook = { knownSpellIds: [], customSpells: [], preparedSpells: {} };
    const book = currentCharacter.spellbook;
    if (!Array.isArray(book.knownSpellIds)) book.knownSpellIds = [];
    const added = [], missing = [];
    names.forEach(n => {
        const sp = byName[norm(n)];
        if (!sp) { missing.push(n); return; }
        if (!book.knownSpellIds.includes(sp.id)) { book.knownSpellIds.push(sp.id); added.push(sp.name); }
    });
    if (added.length) arcanaLog(`${craft.name}: added taught spells to the spellbook: ${added.join(', ')}.`);
    const msg = document.getElementById('craft-taught-msg');
    if (typeof renderSpellbooks === 'function') renderSpellbooks();
    arcanaSave();
    const msg2 = document.getElementById('craft-taught-msg');
    if (msg2) msg2.textContent = added.length ? `Added: ${added.join(', ')}.` : (missing.length ? `Not in the compendium: ${missing.join(', ')}.` : 'Already in your spellbook.');
    void msg;
}

function renderCraftCard() {
    const a = arcanaState();
    const craft = currentCraft();
    const c = a.craft;
    const level = arcaneLevel();
    const options = ['<option value="">None (not a disciple)</option>',
        ...Object.entries(SECRET_CRAFTS).map(([k, v]) => `<option value="${k}" ${c.order === k ? 'selected' : ''}>${escapeHtml(v.name)} · ${escapeHtml(v.order)}</option>`)].join('');

    let body = '';
    if (!craft) {
        body = `<p class="sub-caption">Seven secret orders work inside the Great School of Magic: Alchemy, Dracology, Elementalism, Illusionism, Necromancy, Cryptomancy and Witchcraft. Their disciples gain innate powers in five circles, from 5th level. Choose an order once a disciple has sponsored you.</p>`;
    } else {
        const learned = c.learned;
        const reached = craftCircleReached(craft, learned);
        const pending = craftPendingMastery(craft, learned);
        const detailHtml = craft.detail ? `
            <label class="arc-field"><span class="eyebrow">${escapeHtml(craft.detail.label)}</span>
                <select class="stat-input arc-input" onchange="setCraftField('detail', this.value)">
                    <option value="">Choose...</option>
                    ${craft.detail.options.map(o => `<option ${c.detail === o ? 'selected' : ''}>${escapeHtml(o)}</option>`).join('')}
                </select></label>` : '';

        // Study panel or what can be studied next
        let studyHtml = '';
        if (c.study) {
            const ab = craft.abilities.find(x => x.id === c.study.id);
            if (ab) {
                const circle = CRAFT_CIRCLES[ab.circle];
                const days = Number(c.study.days) || 0;
                const done = days >= circle.cycle;
                studyHtml = `
                <div class="arc-panel">
                    <div class="arc-row-head"><strong>Studying ${escapeHtml(ab.name)}</strong><span class="eyebrow">${ordinal(ab.circle)} circle</span></div>
                    <div class="xp-bar" style="margin: 8px 0 4px;"><div class="xp-bar-fill" style="width: ${Math.round(days / circle.cycle * 100)}%;"></div></div>
                    <div class="tally"><span>Day <strong>${days} / ${circle.cycle}</strong></span><span>Fee <strong>${fmtDc(circle.cost)}</strong> a day</span><span>Paid <strong>${fmtDc(days * circle.cost)}</strong> of ${fmtDc(circle.cycle * circle.cost)}</span></div>
                    <div class="arc-actions">
                        ${done ? `<span class="sub-caption" style="margin: 0;">Roll d20 under Intelligence (${arcIntScore()}):</span>
                            <button type="button" class="btn btn-sm btn-accent" onclick="finishCraftStudy(true)">Learned</button>
                            <button type="button" class="btn btn-sm" onclick="finishCraftStudy(false)">Failed: study again</button>`
                        : `<button type="button" class="btn btn-sm" onclick="adjustCraftStudy(1)">+1 day</button>
                            <button type="button" class="btn btn-sm" onclick="adjustCraftStudy(7)">+7 days</button>
                            <button type="button" class="btn btn-sm" onclick="adjustCraftStudy(-1)">-1 day</button>`}
                        <button type="button" class="btn btn-sm btn-danger" onclick="cancelCraftStudy()" style="margin-left: auto;">Stop</button>
                    </div>
                </div>`;
            }
        }

        let masteryHtml = '';
        if (pending) {
            const need = CRAFT_CIRCLES[pending.circle].xp;
            const have = Number(learned[pending.id].xpEarned) || 0;
            masteryHtml = `
            <div class="arc-panel arc-warn">
                <div class="arc-row-head"><strong>Mastering ${escapeHtml(pending.name)}</strong><span class="eyebrow">${have.toLocaleString('en-US')} / ${need.toLocaleString('en-US')} XP</span></div>
                <div class="xp-bar" style="margin: 8px 0 6px;"><div class="xp-bar-fill" style="width: ${Math.round(have / need * 100)}%;"></div></div>
                <p class="sub-caption" style="margin: 0 0 8px;">XP earned using this ability go here instead of to your level (they are then lost). Until it is mastered its success chance is halved and no new study cycle can begin.</p>
                <div class="arc-actions"><input type="number" id="craft-mastery-xp" class="stat-input arc-input" min="0" placeholder="XP earned with it" style="max-width: 180px;" onkeydown="if (event.key === 'Enter') addCraftMasteryXp()">
                    <button type="button" class="btn btn-sm btn-accent" onclick="addCraftMasteryXp()">Add mastery XP</button></div>
            </div>`;
        }

        const circlesHtml = [1, 2, 3, 4, 5].map(n => {
            const circle = CRAFT_CIRCLES[n];
            const abs = craft.abilities.filter(x => x.circle === n);
            const rows = abs.map(ab => {
                const rec = learned[ab.id];
                const max = ab.uses || circle.uses;
                const used = Math.min(Number(c.uses[ab.id]) || 0, max);
                const block = craftStudyBlock(craft, ab);
                let status;
                if (rec) {
                    const s = craftSuccess(ab);
                    const pips = Array.from({ length: max }, (_, i) =>
                        `<button type="button" class="cast-pip${i < used ? ' spent' : ''}" onclick="toggleCraftUse('${ab.id}', ${i})" title="${i < used ? 'Used — click to un-mark' : 'Ready — click when used'}" aria-label="${escapeHtml(ab.name)} use ${i + 1}"></button>`).join('');
                    status = `<span class="arc-pct" title="${escapeHtml(s.notes.join('; ') || `${circle.base}% + 1% per level`)}">${s.pct}%</span>
                        <span class="cast-pips">${pips}</span><span class="eyebrow">${ab.uses ? `${ab.uses} a day` : circle.usesLabel}</span>
                        <button type="button" class="icon-btn danger" onclick="forgetCraftAbility('${ab.id}')" title="Remove ${escapeHtml(ab.name)}" aria-label="Remove ${escapeHtml(ab.name)}">${getIcon('close', 13)}</button>`;
                } else if (n === 5) {
                    const ready = craftCircleComplete(craft, learned, 4) && level >= circle.level && !craftPendingMastery(craft, learned);
                    status = ready ? `<button type="button" class="btn btn-sm" onclick="gainCraftByDuel('${ab.id}')">Defeated the High Master</button>`
                        : `<span class="eyebrow">By duel with the High Master · ${ordinal(circle.level)} level</span>`;
                } else {
                    status = block ? `<span class="eyebrow">${escapeHtml(block)}</span>`
                        : `<button type="button" class="btn btn-sm" onclick="startCraftStudy('${ab.id}')">Begin study</button>`;
                }
                return `
                <div class="arc-ability${rec ? ' learned' : ''}">
                    <div class="arc-row-head">
                        <button type="button" class="arc-name" onclick="this.closest('.arc-ability').classList.toggle('open')">${escapeHtml(ab.name)}</button>
                        <div class="arc-status">${status}</div>
                    </div>
                    <div class="arc-text">${escapeHtml(ab.text)}</div>
                </div>`;
            }).join('');
            return `
            <div class="arc-circle${n <= reached ? ' done' : ''}">
                <div class="arc-circle-head"><span class="note-col-title">${ordinal(n)} Circle</span>
                    <span class="eyebrow">From ${ordinal(circle.level)} level · ${circle.cycle} days × ${fmtDc(circle.cost)} · ${circle.xp.toLocaleString('en-US')} XP · ${circle.base}% + 1%/lvl</span></div>
                ${rows}
            </div>`;
        }).join('');

        const runesHtml = craft.runeLimit ? `
            <div class="arc-panel">
                <div class="arc-row-head"><strong>Runes used today</strong>
                    <span class="arc-actions" style="margin: 0;"><button type="button" class="btn btn-sm" onclick="adjustRunesToday(-1)">-</button><strong style="min-width: 24px; text-align: center;">${c.runesToday}</strong><button type="button" class="btn btn-sm" onclick="adjustRunesToday(1)">+</button></span></div>
                <p class="sub-caption" style="margin: 6px 0 0;">On a 01 now: ${escapeHtml(['a hurricane (24-mile radius, 1d12 hours)', 'a minor earthquake (12-mile radius)', 'a violent earthquake (36-mile radius)'][c.runesToday] || 'storm and earthquake; all magic fails 6d4 hours and the last rune used is forgotten')}.</p>
            </div>` : '';

        const taughtHtml = craft.taughtSpells ? `
            <div class="arc-actions"><button type="button" class="btn btn-sm" onclick="addTaughtSpells()">Add taught spells to spellbook</button><span id="craft-taught-msg" class="sub-caption" style="margin: 0;"></span></div>` : '';

        const bookHtml = `
            <div class="arc-sub-head"><span class="eyebrow eyebrow-strong">${escapeHtml(craft.bookName)}</span><span class="eyebrow">formulas, runes, ceremonies, dragons met...</span></div>
            <div class="arc-book">${c.book.map(e => `<div class="arc-book-row"><span>${escapeHtml(e.text)}</span><button type="button" class="icon-btn danger" onclick="deleteCraftBookEntry('${e.id}')" aria-label="Delete">${getIcon('close', 13)}</button></div>`).join('') || '<div class="ledger-note">Nothing recorded yet.</div>'}</div>
            <div class="arc-actions"><input type="text" id="craft-book-input" class="stat-input arc-input" placeholder="Add an entry" style="flex: 1;" onkeydown="if (event.key === 'Enter') addCraftBookEntry()"><button type="button" class="btn btn-sm" onclick="addCraftBookEntry()">Add</button></div>`;

        body = `
            <p class="sub-caption">${escapeHtml(craft.summary)}</p>
            ${craft.notes.map(n => `<p class="sub-caption arc-note">${escapeHtml(n)}</p>`).join('')}
            <div class="arc-fields">
                <label class="arc-field"><span class="eyebrow">Sponsor</span><input type="text" class="stat-input arc-input" value="${escapeHtml(c.sponsor || '')}" placeholder="Who vouched for you" onchange="setCraftField('sponsor', this.value)"></label>
                ${detailHtml}
            </div>
            <div class="tally" style="margin: 10px 0;">
                <span>Circle <strong>${reached ? ordinal(reached) : '—'}</strong></span>
                <span>Abilities <strong>${Object.keys(learned).filter(id => craft.abilities.some(x => x.id === id)).length} / ${craft.abilities.length}</strong></span>
                <span>Disciple level <strong>${toRoman(level)}</strong></span>
            </div>
            <div class="arc-actions">
                <span class="eyebrow">Refill uses (no time passes)</span>
                <button type="button" class="btn btn-sm" onclick="resetCraftUses('day')" title="Daily abilities${craft.runeLimit ? ' and runes used today' : ''} are ready again; the calendar does not move">Daily</button>
                <button type="button" class="btn btn-sm" onclick="resetCraftUses('week')" title="Daily and weekly abilities are ready again; the calendar does not move">Daily and weekly</button>
                <button type="button" class="btn btn-sm" onclick="resetCraftUses('month')" title="Every ability is ready again; the calendar does not move">All</button>
            </div>
            <p class="sub-caption" style="margin: 4px 0 0;">Moving the calendar (+ Day, Rest a day) refills them by itself: daily each day, weekly at each new week, monthly at each new month.</p>
            ${studyHtml}${masteryHtml}${runesHtml}
            ${circlesHtml}
            ${taughtHtml}
            ${bookHtml}
            <details class="arc-rules"><summary>How the crafts work</summary><ul>${CRAFT_RULES.map(r => `<li>${escapeHtml(r)}</li>`).join('')}</ul></details>`;
    }

    return `
    <div class="card" id="arcana-craft-card">
        <div class="panel-head">
            <h2>Secret Craft</h2>
            <select class="stat-input arc-input" style="max-width: 320px;" onchange="setCraftOrder(this.value)" aria-label="Secret order">${options}</select>
        </div>
        ${body}
        <div class="arc-source">${escapeHtml(GAZ3)}, pp. 69-76${craft ? ` (${escapeHtml(craft.name)} p. ${craft.page})` : ''}</div>
    </div>`;
}

// ---------------------------------------------------------------------------
// The Great School of Magic
// ---------------------------------------------------------------------------
function meditationBonus(level = arcaneLevel()) {
    return Math.min(8, Math.max(1, Math.ceil(level / 5)));
}
function schoolHasCourse(id) {
    const a = arcanaState();
    return Boolean(a && a.school.done.some(x => x.id === id));
}
// A course is finished on reaching the next level.
function checkCourseCompletion() {
    const a = arcanaState(); if (!a || !a.school.current) return false;
    const cur = a.school.current;
    if (Number(currentCharacter.level) > Number(cur.startLevel)) {
        const course = SCHOOL_COURSES.find(x => x.id === cur.id);
        a.school.done.push({ id: cur.id, level: Number(currentCharacter.level) });
        a.school.current = null;
        arcanaLog(`Great School: completed the course ${course ? course.name : cur.id} on reaching level ${currentCharacter.level}.`, { course: cur.id });
        if (typeof debouncedSave === 'function') debouncedSave();
        return true;
    }
    return false;
}
function setSchoolField(field, value) {
    const a = arcanaState(); if (!a) return;
    const before = a.school[field];
    a.school[field] = String(value || '').slice(0, 200);
    if (field === 'status' && before !== value) {
        const label = { student: 'Enrolled at the Great School of Magic', graduate: 'Graduated from the Great School of Magic', '': 'Left the Great School of Magic' }[value];
        if (label) arcanaLog(`${label}.`);
    }
    arcanaSave();
}
function startCourse() {
    const a = arcanaState(); if (!a) return;
    const id = document.getElementById('school-course-select')?.value;
    const course = SCHOOL_COURSES.find(x => x.id === id); if (!course || a.school.current) return;
    a.school.current = { id, startLevel: Number(currentCharacter.level) || 1, at: new Date().toISOString() };
    arcanaLog(`Great School: began the course ${course.name}.`, { course: id });
    arcanaSave();
}
function finishCourseNow() {
    const a = arcanaState(); if (!a || !a.school.current) return;
    const course = SCHOOL_COURSES.find(x => x.id === a.school.current.id);
    a.school.done.push({ id: a.school.current.id, level: Number(currentCharacter.level) });
    a.school.current = null;
    arcanaLog(`Great School: completed the course ${course ? course.name : ''} (marked by hand).`);
    arcanaSave();
}
function dropCourse() {
    const a = arcanaState(); if (!a) return;
    a.school.current = null;
    arcanaSave();
}
async function removeCompletedCourse(index) {
    const a = arcanaState(); if (!a) return;
    if (!(await sheetConfirm('Remove this completed course?', 'Remove'))) return;
    a.school.done.splice(index, 1);
    arcanaSave();
}
function setCompanionField(field, value) {
    const a = arcanaState(); if (!a) return;
    a.school.companion[field] = String(value ?? '').slice(0, 200);
    arcanaSave();
}
function toggleSpellCombination(on) {
    const a = arcanaState(); if (!a) return;
    a.school.useCombination = Boolean(on);
    if (typeof renderSpellbooks === 'function') renderSpellbooks();
    arcanaSave();
}

function renderSchoolCard() {
    const a = arcanaState();
    const s = a.school;
    const level = arcaneLevel();
    const charLevel = Number(currentCharacter.level) || 1;
    const status = s.status || '';
    const tuition = 5 * charLevel;
    const weeks = 3 + charLevel + 1;
    const doneIds = s.done.map(x => x.id);
    const available = SCHOOL_COURSES.filter(c => c.repeatable || !doneIds.includes(c.id));

    const currentHtml = s.current ? (() => {
        const c = SCHOOL_COURSES.find(x => x.id === s.current.id);
        return `
        <div class="arc-panel">
            <div class="arc-row-head"><strong>Taking ${escapeHtml(c ? c.name : s.current.id)}</strong><span class="eyebrow">Finished on reaching level ${Number(s.current.startLevel) + 1}</span></div>
            <p class="sub-caption" style="margin: 6px 0;">${escapeHtml(c ? c.text : '')}</p>
            <div class="arc-actions"><button type="button" class="btn btn-sm" onclick="finishCourseNow()">Mark finished</button><button type="button" class="btn btn-sm btn-danger" onclick="dropCourse()">Drop course</button></div>
        </div>`;
    })() : (status === 'student' ? `
        <div class="arc-actions">
            <select id="school-course-select" class="stat-input arc-input" style="max-width: 260px;">${available.map(c => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join('')}</select>
            <button type="button" class="btn btn-sm btn-accent" onclick="startCourse()">Begin course</button>
            <span class="sub-caption" style="margin: 0;">One course at a time, learned by your next level.</span>
        </div>` : `<p class="sub-caption">Courses are taught to students of the School alongside their training.</p>`);

    const doneHtml = s.done.length ? s.done.map((d0, i) => {
        const c = SCHOOL_COURSES.find(x => x.id === d0.id);
        if (!c) return '';
        let extra = '';
        if (c.id === 'meditation') extra = `<div class="arc-extra">Current bonus: <strong>+${meditationBonus(level)}</strong> to one Intelligence check after an hour of meditation.</div>`;
        if (c.id === 'agility') extra = `<div class="arc-extra">Cast while walking: roll d20 ≤ <strong>${Number(currentCharacter.abilities?.dexterity?.score) || 10}</strong> (Dexterity).</div>`;
        if (c.id === 'combination') extra = `<label class="arc-extra arc-check"><input type="checkbox" ${s.useCombination !== false ? 'checked' : ''} onchange="toggleSpellCombination(this.checked)"> Use Spell Combination in the spellbook (prepare by total spell levels)</label>`;
        if (c.id === 'companion') {
            const comp = s.companion;
            const ast = clampInt(comp.asterisks, 0, 9, 0);
            const chance = Math.max(0, 2 * level - 10 * ast);
            const hd = Math.max(1, Math.floor((arcIntScore() - 10) / 2));
            extra = `
            <div class="arc-extra">Chance at the full moon: <strong>${chance}%</strong> (2% per level, -10% per asterisk). A companion has <strong>${level} hp</strong> and up to <strong>${hd} HD</strong>.</div>
            <div class="arc-fields">
                <label class="arc-field"><span class="eyebrow">Companion</span><input type="text" class="stat-input arc-input" value="${escapeHtml(comp.name || '')}" placeholder="Name" onchange="setCompanionField('name', this.value)"></label>
                <label class="arc-field"><span class="eyebrow">Creature</span><input type="text" class="stat-input arc-input" value="${escapeHtml(comp.creature || '')}" placeholder="e.g. black cat, gremlin" onchange="setCompanionField('creature', this.value)"></label>
                <label class="arc-field arc-narrow"><span class="eyebrow">Asterisks</span><input type="number" min="0" max="9" class="stat-input arc-input" value="${ast}" onchange="setCompanionField('asterisks', this.value)"></label>
                <label class="arc-field arc-narrow"><span class="eyebrow">Int</span><input type="number" min="9" max="18" class="stat-input arc-input" value="${escapeHtml(comp.int || '')}" placeholder="9-18" onchange="setCompanionField('int', this.value)"></label>
                <label class="arc-field arc-narrow"><span class="eyebrow">HP</span><input type="number" min="0" class="stat-input arc-input" value="${escapeHtml(comp.hp || '')}" placeholder="${level}" onchange="setCompanionField('hp', this.value)"></label>
            </div>`;
        }
        return `
        <div class="arc-ability learned">
            <div class="arc-row-head">
                <button type="button" class="arc-name" onclick="this.closest('.arc-ability').classList.toggle('open')">${escapeHtml(c.name)}</button>
                <div class="arc-status"><span class="eyebrow">Level ${toRoman(d0.level || 1)}</span><button type="button" class="icon-btn danger" onclick="removeCompletedCourse(${i})" aria-label="Remove">${getIcon('close', 13)}</button></div>
            </div>
            <div class="arc-text">${escapeHtml(c.text)}</div>
            ${extra}
        </div>`;
    }).join('') : '<div class="ledger-note">No courses completed yet.</div>';

    return `
    <div class="card" id="arcana-school-card">
        <div class="panel-head">
            <h2>Great School of Magic</h2>
            <select class="stat-input arc-input" style="max-width: 240px;" onchange="setSchoolField('status', this.value)" aria-label="School status">
                <option value="" ${!status ? 'selected' : ''}>Not enrolled</option>
                <option value="student" ${status === 'student' ? 'selected' : ''}>Student</option>
                <option value="graduate" ${status === 'graduate' ? 'selected' : ''}>Graduate (licensed wizard)</option>
            </select>
        </div>
        <div class="arc-fields">
            <label class="arc-field"><span class="eyebrow">Master</span><input type="text" class="stat-input arc-input" value="${escapeHtml(s.master || '')}" placeholder="Your teacher" onchange="setSchoolField('master', this.value)"></label>
        </div>
        ${status === 'student' ? `<div class="tally" style="margin: 10px 0;"><span>Tuition <strong>${fmtDc(tuition)}</strong> a day</span><span>Training for level ${charLevel + 1} <strong>${weeks} weeks</strong> at least</span></div>
            <p class="sub-caption">Tuition is 5 dc a day per level and covers teaching, room, board, the laboratory and library. Your master trains you for each new level (three weeks plus one per level gained) and teaches you at least one spell.</p>` : ''}
        ${status === 'graduate' ? `<p class="sub-caption">Graduates pass the final ordeal in the School's dungeons and receive the diploma of wizardry, the key to Glantrian nobility. They study on their own from now on.</p>` : ''}
        <div class="arc-sub-head"><span class="eyebrow eyebrow-strong">Courses</span></div>
        ${currentHtml}
        ${doneHtml}
        <div class="arc-source">${escapeHtml(GAZ3)}, pp. 58-63</div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Research and enchanting
// ---------------------------------------------------------------------------
const RESEARCH_KINDS = { spell: 'Spell', item: 'Magic item', weapon: 'Weapon enchantment', armour: 'Armour enchantment' };

// The library's worth: the listed books (studied ones at their true value, the others at what
// you believe they are worth) plus everything else in it (the value field, which also
// receives 10% of each discovery's cost).
function bookValue(b) { return Math.max(0, Number(b.studied && b.trueValue !== '' && b.trueValue != null ? b.trueValue : b.value) || 0); }
function libraryBooksValue(lib) { return ((lib && lib.books) || []).reduce((s, b) => s + bookValue(b), 0); }
function libraryTotal(lib = arcanaState()?.library) { return lib ? (Number(lib.value) || 0) + libraryBooksValue(lib) : 0; }
function bookStudyDays(b) { return Math.max(1, Math.ceil((Number(b.trueValue) || Number(b.value) || 0) / 100)); }

function libraryMinimum(spellLevel) {
    return 4000 + 2000 * Math.max(0, spellLevel - 1);
}
function libraryBonus(spellLevel) {
    const a = arcanaState();
    if (!a.library.own) return 0;
    const over = libraryTotal(a.library) - libraryMinimum(spellLevel);
    return over > 0 ? Math.min(10, Math.floor(over / 2000)) : 0;
}
function researchCalc(p) {
    const a = arcanaState();
    const level = arcaneLevel();
    const medit = (p.meditated && schoolHasCourse('meditation')) ? meditationBonus(level) : 0;
    const int = arcIntScore() + medit;
    const material = (RESEARCH_MATERIALS[clampInt(p.material, 0, RESEARCH_MATERIALS.length - 1, 3)] || {}).mod || 0;
    const interrupts = clampInt(p.interruptions, 0, 99, 0);
    const warnings = [];
    const chanceFor = (spellLevel, isNew, radiance) => {
        let pct = (int + level) * 2 - (isNew ? 5 : 3) * spellLevel;
        pct += libraryBonus(spellLevel) + material - 5 * interrupts;
        if (radiance) pct = Math.floor(pct / 2);
        return Math.max(0, Math.min(94, pct));
    };
    let cost = 0; const chances = [];
    if (p.kind === 'spell') {
        const L = clampInt(p.level, 1, 9, 1);
        cost = 1000 * L * (p.radiance ? 2 : 1);
        chances.push({ label: `${p.isNew ? 'New' : 'Common'} ${ordinal(L)}-level spell${p.radiance ? ' (Radiance)' : ''}`, pct: chanceFor(L, p.isNew, p.radiance) });
        if (a.library.own && libraryTotal(a.library) < libraryMinimum(L)) warnings.push(`Your library must be worth ${fmtDc(libraryMinimum(L))} for ${ordinal(L)}-level research.`);
    } else if (p.kind === 'item') {
        const levels = String(p.effects || '').split(/[,;\s]+/).map(Number).filter(n => n >= 1 && n <= 9);
        const total = levels.reduce((s, n) => s + n, 0);
        const cut = (RESEARCH_TIME_LIMITS[clampInt(p.timeLimit, 0, 4, 0)] || {}).cut || 0;
        const restr = clampInt(p.restrictions, 0, 9, 0);
        const initial = Math.round(total * 1000 * (1 - cut / 100) * (1 - restr / 10));
        const extra = p.permanent ? initial * 0.1 * 50 : initial * 0.1 * clampInt(p.charges, 0, 999, 0);
        cost = initial + extra;
        levels.forEach((L, i) => chances.push({ label: `Effect ${i + 1} (${ordinal(L)} level)`, pct: chanceFor(L, !p.madeBefore, false) }));
        if (!levels.length) warnings.push('List the spell level of each effect, e.g. "3" or "4, 4".');
        if (level < 9) warnings.push('Magic items can only be made from 9th level.');
        p._initial = initial;
    } else {
        const price = Math.max(0, Number(p.price) || 0), enc = Math.max(0, Number(p.enc) || 0);
        const plus = clampInt(p.plus, 1, 5, 1);
        const raw = p.kind === 'weapon' ? price * enc * 5 : price * enc / 3;
        const initial = Math.max(p.kind === 'weapon' ? 100 : 3000, Math.ceil(raw / 10) * 10);
        cost = initial * plus;
        chances.push({ label: `+${plus} (as a common ${ordinal(plus)}-level spell)`, pct: chanceFor(plus, false, false) });
        if (level < 9) warnings.push('Enchanting can only be done from 9th level.');
        p._initial = initial;
    }
    let days = 7 + Math.ceil(cost / 1000);
    if (isArcaneWarrior() && p.kind === 'spell') days *= 2;     // Compendium: double time to write a spell
    // GAZ3 p. 60 wizard XP: spells 1,000 XP per spell level (x1.5 new, x1 common; nothing for a
    // failed attempt); enchanting 1 XP per ducat spent (all on success, 1/10 on failure).
    const spent = (Number(p.gold) || 0) > 0 ? Number(p.gold) : cost;
    let xpSuccess, xpFail;
    if (p.kind === 'spell') { const L = clampInt(p.level, 1, 9, 1); xpSuccess = Math.round(1000 * L * (p.isNew ? 1.5 : 1)); xpFail = 0; }
    else { xpSuccess = Math.round(spent); xpFail = Math.round(spent / 10); }
    return { cost, days, chances, warnings, medit, xpSuccess, xpFail, spentForXp: spent };
}
// GAZ3's wizard XP is on by default for wizards; arcane warriors earn XP as fighters.
function wizardXpOn() {
    const a = arcanaState();
    return a && a.wizardXp !== undefined ? Boolean(a.wizardXp) : !isArcaneWarrior();
}
function setWizardXp(on) {
    const a = arcanaState(); if (!a) return;
    a.wizardXp = Boolean(on);
    arcanaSave();
}
function addResearchProject(kind) {
    const a = arcanaState(); if (!a) return;
    const base = { id: `rs_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, kind, name: '', status: 'active', material: 3, interruptions: 0, days: 0, gold: 0, created: new Date().toISOString() };
    if (kind === 'spell') Object.assign(base, { level: 1, isNew: true, radiance: false });
    if (kind === 'item') Object.assign(base, { effects: '', charges: 0, permanent: true, timeLimit: 0, restrictions: 0, madeBefore: false });
    if (kind === 'weapon') Object.assign(base, { price: 10, enc: 60, plus: 1, material: 3 });
    if (kind === 'armour') Object.assign(base, { price: 60, enc: 500, plus: 1, material: 3 });
    a.research.push(base);
    arcanaSave();
}
function updateResearch(id, field, value) {
    const a = arcanaState(); if (!a) return;
    const p = a.research.find(x => x.id === id); if (!p) return;
    if (['isNew', 'radiance', 'permanent', 'madeBefore', 'meditated'].includes(field)) p[field] = Boolean(value);
    else if (field === 'name' || field === 'effects') p[field] = String(value || '').slice(0, 120);
    else p[field] = Number(value) || 0;
    arcanaSave();
}
function workResearchDay(id, days = 1) {
    const a = arcanaState(); if (!a) return;
    const p = a.research.find(x => x.id === id); if (!p) return;
    p.days = Math.max(0, (Number(p.days) || 0) + days);
    p.gold = Math.max(0, (Number(p.gold) || 0) + 1000 * days);
    arcanaSave();
}
function resolveResearch(id, success) {
    const a = arcanaState(); if (!a) return;
    const p = a.research.find(x => x.id === id); if (!p) return;
    const calc = researchCalc(p);
    p.status = success ? 'success' : 'failed';
    p.resolvedAt = new Date().toISOString();
    const what = p.name || RESEARCH_KINDS[p.kind];
    let extra = '';
    // GAZ3 p. 66: 10% of the gold spent on a discovered spell goes into your own library (once per project).
    if (success && a.library.own && p.kind === 'spell' && !p.libraryAdded) {
        const add = addSpellToLibraryValue(Number(p.gold) || calc.cost);
        p.libraryAdded = add;
        extra = ` Library value +${fmtDc(add)}.`;
    }
    if (success && p.kind === 'spell') extra += addResearchedSpell(p);
    arcanaLog(`Research ${success ? 'succeeded' : 'failed'}: ${what} (${RESEARCH_KINDS[p.kind]}), ${p.days || 0} days, ${fmtDc(p.gold || 0)} spent.${extra}`, { kind: p.kind, success });
    // Award the experience (GAZ3 p. 60), once per project.
    // A reopened project is only topped up to its full value, never paid twice.
    const xp = Math.max(0, (success ? calc.xpSuccess : calc.xpFail) - (Number(p.xpAwarded) || 0));
    if (wizardXpOn() && xp > 0 && typeof awardRawXp === 'function') {
        const why = p.kind === 'spell'
            ? `${p.isNew ? 'Researched a new' : 'Rediscovered a common'} ${ordinal(clampInt(p.level, 1, 9, 1))}-level spell: ${what}`
            : `${success ? 'Enchanted' : 'Failed to enchant'} ${what} (${fmtDc(calc.spentForXp)} spent${success ? '' : ', 1/10'})`;
        p.xpAwarded = (Number(p.xpAwarded) || 0) + (Number(awardRawXp(xp, why)) || 0);
    }
    arcanaSave();
    if (typeof renderSpellbooks === 'function') renderSpellbooks();
}
// A successful spell goes into the spellbook: the compendium spell if it exists, else a custom entry.
function addResearchedSpell(p) {
    if (!p.name) return '';
    if (!currentCharacter.spellbook) currentCharacter.spellbook = { knownSpellIds: [], customSpells: [], preparedSpells: {} };
    const book = currentCharacter.spellbook;
    if (!Array.isArray(book.knownSpellIds)) book.knownSpellIds = [];
    if (!Array.isArray(book.customSpells)) book.customSpells = [];
    const want = p.name.trim().toLowerCase();
    const found = Object.values(GlobalSpellsDatabase).find(s => (s.casterType === 'arcane' || s.casterType === 'radiance') && s.name.toLowerCase() === want);
    if (found) {
        if (!book.knownSpellIds.includes(found.id)) { book.knownSpellIds.push(found.id); return ` ${found.name} added to the spellbook.`; }
        return '';
    }
    if (book.customSpells.some(s => s.name.toLowerCase() === want)) return '';
    book.customSpells.push({ id: 'custom_' + Date.now(), name: p.name.trim(), level: clampInt(p.level, 1, 9, 1), casterType: 'arcane', range: '', duration: '', effect: '', description: 'Researched spell (fill in its details).', isCustom: true });
    return ` ${p.name.trim()} added to the spellbook as a custom spell.`;
}
function reopenResearch(id) {
    const a = arcanaState(); if (!a) return;
    const p = a.research.find(x => x.id === id); if (!p) return;
    p.status = 'active';
    arcanaSave();
}
async function deleteResearch(id) {
    const a = arcanaState(); if (!a) return;
    if (!(await sheetConfirm('Delete this research project?', 'Delete'))) return;
    a.research = a.research.filter(x => x.id !== id);
    arcanaSave();
}
// ---- Books (GAZ3 p. 66, Creating a Library) -------------------------------------------
async function editLibraryBook(id) {
    const a = arcanaState(); if (!a || typeof notesFormModal !== 'function') return;
    const book = id ? a.library.books.find(b => b.id === id) : null;
    const appraisal = (arcIntScore() + arcaneLevel()) * 2;
    const res = await notesFormModal({
        title: book ? 'Edit book' : 'Add a book to the library',
        canDelete: Boolean(book),
        values: book ? { ...book, trueValue: book.trueValue ?? '', studiedState: book.studied ? 'yes' : 'no' } : { pay: 'no' },
        fields: [
            { key: 'title', label: 'Title', wide: true, max: 120, placeholder: 'e.g. Codex of the Radiant Flame' },
            { key: 'subject', label: 'Subject', max: 80, placeholder: 'e.g. fire magic, necromancy, history' },
            { key: 'source', label: 'Where it came from', max: 80, placeholder: 'Merchant, treasure, abandoned library…' },
            { key: 'value', label: 'Value you believe (dc)', placeholder: '0' },
            { key: 'price', label: 'Price paid (dc)', placeholder: '0' },
            ...(book ? [] : [{ key: 'pay', label: 'Pay the price now', type: 'select', options: [{ value: 'no', label: 'No (already paid / found)' }, { value: 'yes', label: 'Yes, from my purse' }] }]),
            { key: 'trueValue', label: 'True value, once studied (dc)', placeholder: 'the DM reveals it' },
            ...(book && book.studied ? [{ key: 'studiedState', label: 'Studied', type: 'select', options: [{ value: 'yes', label: 'Yes, studied' }, { value: 'no', label: 'Mark as not studied' }] }] : []),
            { key: 'notes', label: 'Notes (wards, appearance, contents…)', type: 'textarea', rows: 3, wide: true },
        ],
        extraHtml: `<p class="sub-caption arc-note">A book found or offered for sale is worth 10 dc × d100. Your Appraisal Score is ${appraisal}% ((Int + level) × 2): the DM rolls it in secret; on a failure your estimate is off by the difference in percent (even: too high, odd: too low). Studying a book takes a day per 100 dc of its true value and reveals that value. GAZ3 p. 66.</p>`,
    });
    if (!res) return;
    if (res === '__delete__') {
        if (!(await sheetConfirm(`Remove “${book.title || 'this book'}” from the library?`, 'Remove'))) return;
        a.library.books = a.library.books.filter(b => b.id !== book.id);
        arcanaSave();
        return;
    }
    const num = v => { const n = Math.round(Number(String(v).replace(/[^0-9.\-]/g, ''))); return Number.isFinite(n) && n > 0 ? n : 0; };
    const data = {
        title: (res.title || '').trim().slice(0, 120) || 'Untitled book',
        subject: (res.subject || '').slice(0, 80), source: (res.source || '').slice(0, 80),
        value: num(res.value), price: num(res.price), notes: (res.notes || '').slice(0, 2000),
        trueValue: String(res.trueValue || '').trim() === '' ? '' : num(res.trueValue),
    };
    if (!book && res.pay === 'yes' && data.price > 0) {
        if (typeof holdingsPay !== 'function' || !(await holdingsPay(data.price))) return;
    }
    if (book && book.studied && res.studiedState === 'no') {
        if (!(await sheetConfirm(`Mark “${data.title}” as not studied? Its value counts as the one you believe again until you study it.`, 'Mark as not studied'))) return;
        data.studied = false;
    }
    if (book) Object.assign(book, data);
    else {
        a.library.books.push({ id: 'bk_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 5), ...data, studied: false, added: new Date().toISOString() });
        arcanaLog(`Library: added “${data.title}”${data.price ? ` for ${fmtDc(data.price)}` : ''}${data.value ? ` (believed worth ${fmtDc(data.value)})` : ''}.`, { library: true });
    }
    arcanaSave();
}
async function studyLibraryBook(id) {
    const a = arcanaState(); if (!a) return;
    const book = a.library.books.find(b => b.id === id); if (!book) return;
    if (book.studied) return;          // un-studying is in the book's edit window
    const res = await notesFormModal({
        title: `Studied: ${book.title}`,
        values: { trueValue: book.trueValue !== '' && book.trueValue != null ? book.trueValue : book.value },
        fields: [{ key: 'trueValue', label: 'True value the DM reveals (dc)', wide: true }],
        extraHtml: `<p class="sub-caption arc-note">Studying takes a day per 100 dc of the book's true value (${bookStudyDays(book)} day${bookStudyDays(book) > 1 ? 's' : ''} at the value you believe).</p>`,
        okText: 'Mark studied',
    });
    if (!res || res === '__delete__') return;
    const tv = Math.max(0, Math.round(Number(res.trueValue) || 0));
    book.trueValue = tv; book.studied = true;
    arcanaLog(`Library: studied “${book.title}” (${bookStudyDays(book)} days); true value ${fmtDc(tv)}${book.value && tv !== book.value ? `, not ${fmtDc(book.value)} as believed` : ''}.`, { library: true });
    arcanaSave();
}

function renderLibraryBooks(lib) {
    const books = lib.books || [];
    const rows = books.map(b => {
        const shown = bookValue(b);
        const unsure = !b.studied;
        return `<div class="lib-book">
            <div class="lib-book-main">
                <button type="button" class="link-btn lib-book-title" onclick="editLibraryBook('${b.id}')">${escapeHtml(b.title || 'Untitled book')}</button>
                ${b.subject ? `<span class="sub-caption">${escapeHtml(b.subject)}</span>` : ''}
                ${b.notes ? `<div class="sub-caption lib-book-notes">${escapeHtml(b.notes)}</div>` : ''}
            </div>
            <span class="lib-book-val" title="${unsure ? 'The value you believe; studying the book reveals its true value' : 'True value'}">${fmtDc(shown)}${unsure ? '?' : ''}</span>
            ${b.studied
                ? `<span class="tag lib-studied" title="Studied: its true value is known. To undo, open the book (click its title).">${getIcon('check', 11)} Studied</span>`
                : `<button type="button" class="btn btn-sm btn-accent" onclick="studyLibraryBook('${b.id}')" title="Study it: about ${bookStudyDays(b)} day${bookStudyDays(b) > 1 ? 's' : ''}">Study (${bookStudyDays(b)} d)</button>`}
        </div>`;
    }).join('');
    return `<div class="arc-panel lib-books">
        <div class="arc-row-head"><strong>Books (${books.length})</strong><span class="tally"><span>Books <strong>${fmtDc(libraryBooksValue(lib))}</strong></span>${Number(lib.fromResearch) ? `<span title="10% of the cost of each spell discovered (GAZ3 p. 66), included in the other library value">From research <strong>${fmtDc(lib.fromResearch)}</strong></span>` : ''}<span>Library total <strong>${fmtDc(libraryTotal(lib))}</strong></span></span><span class="arc-actions" style="margin: 0;"><button type="button" class="btn btn-sm" onclick="countResearchedSpells()" title="Add 10% of the research cost of spells already in your spellbook that you researched yourself (GAZ3 p. 66)">Count researched spells</button><button type="button" class="btn btn-sm" onclick="editLibraryBook()">+ Book</button></span></div>
        ${rows || '<div class="ledger-note">No books listed yet. Add the tomes you buy or find; their value counts toward the library.</div>'}
    </div>`;
}

// Adds 10% of a discovered spell's cost to the library (GAZ3 p. 66) and returns the amount.
function addSpellToLibraryValue(goldSpent) {
    const a = arcanaState(); if (!a || !a.library.own) return 0;
    const add = Math.round((Number(goldSpent) || 0) * 0.1);
    a.library.value = (Number(a.library.value) || 0) + add;
    a.library.fromResearch = (Number(a.library.fromResearch) || 0) + add;
    return add;
}
// For spells researched outside a research project here (entered through + Compendium or + Custom Spell).
function libraryCanTakeResearch() {
    const a = currentCharacter && currentCharacter.arcana;
    return Boolean(a && a.library && a.library.own && typeof isArcaneCharacter === 'function' && isArcaneCharacter());
}
function addResearchedSpellToLibrary(name, level, spellId) {
    const lvl = clampInt(level, 1, 9, 1);
    const lib = arcanaState().library;
    if (!Array.isArray(lib.countedSpells)) lib.countedSpells = [];
    if (spellId) { if (lib.countedSpells.includes(spellId)) return 0; lib.countedSpells.push(spellId); }
    const add = addSpellToLibraryValue(1000 * lvl);
    if (add) arcanaLog(`Library: researched ${name} (${ordinal(lvl)} level, ${fmtDc(1000 * lvl)}); library value +${fmtDc(add)}.`, { library: true });
    arcanaSave();
    return add;
}

// Spells already in the spellbook that were researched before this was tracked: pick them once.
async function countResearchedSpells() {
    const a = arcanaState(); if (!a || !a.library.own) return;
    const lib = a.library;
    if (!Array.isArray(lib.countedSpells)) lib.countedSpells = [];
    const book = currentCharacter.spellbook || {};
    const fromProjects = new Set(a.research.filter(p => p.kind === 'spell' && p.libraryAdded).map(p => String(p.name || '').trim().toLowerCase()));
    const spells = [
        ...(book.knownSpellIds || []).map(id => GlobalSpellsDatabase[id]).filter(Boolean),
        ...(book.customSpells || []).filter(s => (s.casterType || 'arcane') === 'arcane'),
    ].filter(s => !lib.countedSpells.includes(s.id) && !fromProjects.has(String(s.name).toLowerCase()))
     .sort((x, y) => (x.level - y.level) || String(x.name).localeCompare(String(y.name)));
    if (!spells.length) { await sheetAlert('Every spell in your spellbook has already been counted toward the library.'); return; }
    window.__libPick = new Set();
    const rows = spells.map(s => `<label class="arc-check lib-pick"><input type="checkbox" onchange="window.__libPick[this.checked ? 'add' : 'delete']('${s.id}'); document.getElementById('lib-pick-sum').textContent = [...window.__libPick].reduce((t, id) => t + 100 * (window.__libPickLvl[id] || 0), 0).toLocaleString('en-US') + ' dc';"> ${escapeHtml(s.name)} <span class="sub-caption">${ordinal(clampInt(s.level, 1, 9, 1))} level · +${fmtDc(100 * clampInt(s.level, 1, 9, 1))}</span></label>`).join('');
    window.__libPickLvl = Object.fromEntries(spells.map(s => [s.id, clampInt(s.level, 1, 9, 1)]));
    const res = await notesFormModal({
        title: 'Spells you researched yourself',
        fields: [],
        okText: 'Add to library',
        extraHtml: `<p class="sub-caption arc-note">Tick the spells your character discovered by research (not ones copied, taught or found). Each adds 10% of its research cost, 1,000 dc × level (GAZ3 p. 66). Each spell can be counted only once.</p>
            <div class="lib-pick-list">${rows}</div>
            <div class="tally" style="margin-top: 8px;"><span>Adds <strong id="lib-pick-sum">0 dc</strong></span></div>`,
    });
    const picked = [...(window.__libPick || [])];
    delete window.__libPick; delete window.__libPickLvl;
    if (!res || !picked.length) return;
    let total = 0;
    spells.filter(s => picked.includes(s.id)).forEach(s => {
        const lvl = clampInt(s.level, 1, 9, 1);
        lib.countedSpells.push(s.id);
        total += addSpellToLibraryValue(1000 * lvl);
    });
    arcanaLog(`Library: ${picked.length} researched spell${picked.length > 1 ? 's' : ''} counted; library value +${fmtDc(total)}.`, { library: true });
    arcanaSave();
}

function setLibrary(field, value) {
    const a = arcanaState(); if (!a) return;
    if (field === 'own') a.library.own = Boolean(value);
    else a.library.value = Math.max(0, Math.round(Number(value) || 0));
    arcanaSave();
}

function renderResearchRow(p) {
    const c = researchCalc(p);
    const id = p.id;
    const sel = (field, opts, val) => `<select class="stat-input arc-input" onchange="updateResearch('${id}', '${field}', this.value)">${opts.map((o, i) => `<option value="${i}" ${Number(val) === i ? 'selected' : ''}>${escapeHtml(o)}</option>`).join('')}</select>`;
    const num = (field, label, val, attrs = '') => `<label class="arc-field arc-narrow"><span class="eyebrow">${label}</span><input type="number" class="stat-input arc-input" value="${escapeHtml(val ?? '')}" ${attrs} onchange="updateResearch('${id}', '${field}', this.value)"></label>`;
    const chk = (field, label, val, disabled = false) => `<label class="arc-check"><input type="checkbox" ${val ? 'checked' : ''} ${disabled ? 'disabled' : ''} onchange="updateResearch('${id}', '${field}', this.checked)"> ${label}</label>`;
    let fields = '';
    if (p.kind === 'spell') {
        fields = `${num('level', 'Spell level', p.level, 'min="1" max="9"')}
            <div class="arc-checks">${chk('isNew', 'New spell (not in the rules)', p.isNew)}${chk('radiance', 'Radiance spell (x2 cost, ½ chance)', p.radiance)}</div>`;
    } else if (p.kind === 'item') {
        fields = `<label class="arc-field"><span class="eyebrow">Spell level of each effect</span><input type="text" class="stat-input arc-input" value="${escapeHtml(p.effects || '')}" placeholder="e.g. 3 or 4, 4" onchange="updateResearch('${id}', 'effects', this.value)"></label>
            <label class="arc-field"><span class="eyebrow">Usage limit</span>${sel('timeLimit', RESEARCH_TIME_LIMITS.map(t => t.cut ? `${t.label} (-${t.cut}%)` : t.label), p.timeLimit)}</label>
            ${num('restrictions', 'Restrictions (-10% each)', p.restrictions, 'min="0" max="9"')}
            ${p.permanent ? '' : num('charges', 'Charges', p.charges, 'min="0"')}
            <div class="arc-checks">${chk('permanent', 'Permanent (= 50 charges)', p.permanent)}${chk('madeBefore', 'Made one before (common chance)', p.madeBefore)}</div>`;
    } else {
        fields = `${num('price', 'Item price (gp)', p.price, 'min="0"')}${num('enc', 'Encumbrance (cn)', p.enc, 'min="0"')}${num('plus', 'Bonus +', p.plus, 'min="1" max="5"')}`;
    }
    const meditOk = schoolHasCourse('meditation');
    const common = `
        <label class="arc-field"><span class="eyebrow">Main material</span>${sel('material', RESEARCH_MATERIALS.map(m => `${m.label} (${m.mod >= 0 ? '+' : ''}${m.mod}%)`), clampInt(p.material, 0, 6, 3))}</label>
        ${num('interruptions', 'Interruptions (-5% each)', p.interruptions, 'min="0"')}
        ${meditOk ? `<div class="arc-checks">${chk('meditated', `Meditated (+${meditationBonus()} Int)`, p.meditated)}</div>` : ''}`;
    const active = p.status === 'active';
    const statusTag = active ? '' : `<span class="tag" style="color: var(--${p.status === 'success' ? 'good' : 'danger'});">${p.status === 'success' ? 'Succeeded' : 'Failed'}</span>`;
    return `
    <div class="arc-project${active ? '' : ' closed'}">
        <div class="arc-row-head">
            <input type="text" class="stat-input arc-input arc-title-input" value="${escapeHtml(p.name || '')}" placeholder="${escapeHtml(RESEARCH_KINDS[p.kind])} name" onchange="updateResearch('${id}', 'name', this.value)" ${active ? '' : 'disabled'}>
            <span class="eyebrow">${escapeHtml(RESEARCH_KINDS[p.kind])}</span>${statusTag}
            <button type="button" class="icon-btn danger" onclick="deleteResearch('${id}')" title="Delete project" aria-label="Delete project">${getIcon('close', 14)}</button>
        </div>
        ${active ? `<div class="arc-fields">${fields}${common}</div>` : ''}
        <div class="tally" style="margin: 8px 0;">
            <span>Cost <strong>${fmtDc(c.cost)}</strong></span>
            <span>Time <strong>${c.days} days</strong></span>
            ${p.kind === 'spell' && arcanaState().library.own ? (p.libraryAdded ? `<span title="GAZ3 p. 66">Added to library <strong>${fmtDc(p.libraryAdded)}</strong></span>` : `<span title="GAZ3 p. 66: 10% of the gold spent on a discovered spell is added to your library">Library on success <strong>+${fmtDc(Math.round((Number(p.gold) || c.cost) * 0.1))}</strong></span>`) : ''}
            ${wizardXpOn() ? `<span title="GAZ3 p. 60${p.kind !== 'spell' ? ': 1 XP per ducat spent' + ((Number(p.gold) || 0) > 0 ? '' : ' (uses the full cost until you record gold spent)') : ''}">XP <strong>${c.xpSuccess.toLocaleString('en-US')}</strong>${c.xpFail ? ` / failed ${c.xpFail.toLocaleString('en-US')}` : ''}</span>` : ''}
            ${c.chances.map(ch => `<span>${escapeHtml(ch.label)} <strong>${ch.pct}%</strong></span>`).join('')}
        </div>
        ${c.warnings.map(w => `<p class="sub-caption arc-note" style="color: var(--danger);">${escapeHtml(w)}</p>`).join('')}
        <div class="arc-actions">
            <span class="eyebrow">Worked <strong>${p.days || 0}</strong> days · spent <strong>${fmtDc(p.gold || 0)}</strong></span>
            ${active ? `<button type="button" class="btn btn-sm" onclick="workResearchDay('${id}', 1)">+1 day (1,000 dc)</button>
                <button type="button" class="btn btn-sm" onclick="workResearchDay('${id}', 7)">+7 days</button>
                <button type="button" class="btn btn-sm btn-accent" onclick="resolveResearch('${id}', true)" style="margin-left: auto;">Success</button>
                <button type="button" class="btn btn-sm" onclick="resolveResearch('${id}', false)">Failure</button>`
            : `<button type="button" class="btn btn-sm" onclick="reopenResearch('${id}')" style="margin-left: auto;">Reopen</button>`}
        </div>
    </div>`;
}

function renderResearchCard() {
    const a = arcanaState();
    const level = arcaneLevel();
    if (isArcaneWarrior() && level < 9) {
        return `
        <div class="card" id="arcana-research-card">
            <div class="panel-head"><h2>Research &amp; Enchanting</h2></div>
            <p class="sub-caption">An arcane warrior can research spells and create magic items only from 9th level as a magic-user (you cast as level ${level}). Until then every spell comes from your mentor.</p>
            <div class="arc-source">Mystara Extra Rules Compendium, Arcane Warrior</div>
        </div>`;
    }
    const lib = a.library;
    const appraisal = (arcIntScore() + level) * 2;
    const active = a.research.filter(p => p.status === 'active');
    const closed = a.research.filter(p => p.status !== 'active');
    return `
    <div class="card" id="arcana-research-card">
        <div class="panel-head">
            <h2>Research &amp; Enchanting</h2>
            <div class="panel-head-tools">
                <button type="button" class="btn btn-sm" onclick="addResearchProject('spell')">+ Spell</button>
                <button type="button" class="btn btn-sm" onclick="addResearchProject('item')">+ Magic item</button>
                <button type="button" class="btn btn-sm" onclick="addResearchProject('weapon')">+ Weapon</button>
                <button type="button" class="btn btn-sm" onclick="addResearchProject('armour')">+ Armour</button>
            </div>
        </div>
        <div class="arc-fields">
            <label class="arc-check"><input type="checkbox" ${lib.own ? 'checked' : ''} onchange="setLibrary('own', this.checked)"> I own a library</label>
            <label class="arc-check" title="GAZ3 p. 60: XP for discovering spells and enchanting items"><input type="checkbox" ${wizardXpOn() ? 'checked' : ''} onchange="setWizardXp(this.checked)"> Award GAZ3 wizard XP</label>
            ${lib.own ? `<label class="arc-field"><span class="eyebrow">${lib.books.length ? 'Other library value (besides the books below)' : 'Library value'}</span><input type="number" min="0" class="stat-input arc-input" value="${Number(lib.value) || 0}" onchange="setLibrary('value', this.value)"></label>` : ''}
        </div>
        ${lib.own ? renderLibraryBooks(lib) : ''}
        <div class="tally" style="margin: 10px 0;">
            ${lib.own ? `<span>Supports research up to <strong>${(() => { let L = 0; for (let i = 1; i <= 9; i++) if (libraryTotal(lib) >= libraryMinimum(i)) L = i; return L ? ordinal(L) + ' level' : 'none yet'; })()}</strong></span>` : '<span>Using a public or princely library (no bonus)</span>'}
            <span>Book appraisal <strong>${appraisal}%</strong></span>
            <span>Base chance <strong>(${arcIntScore()} + ${level}) × 2 = ${(arcIntScore() + level) * 2}%</strong></span>
        </div>
        ${active.map(renderResearchRow).join('') || '<div class="ledger-note">No research under way. Add a spell, magic item, weapon or armour project.</div>'}
        ${closed.length ? `<details class="arc-rules"><summary>Finished projects (${closed.length})</summary>${closed.map(renderResearchRow).join('')}</details>` : ''}
        ${isArcaneWarrior() ? '<p class="sub-caption arc-note">Arcane warrior: writing a researched spell takes double the normal time, and your chances stay low because they use your magic-user level.</p>' : ''}
        <details class="arc-rules"><summary>How research works</summary><ul>${RESEARCH_RULES.map(r => `<li>${escapeHtml(r)}</li>`).join('')}</ul></details>
        <div class="arc-source">${escapeHtml(GAZ3)}, pp. 64-66</div>
    </div>`;
}

// ---------------------------------------------------------------------------
// The Radiance
// ---------------------------------------------------------------------------
const RADIANCE_SPELL_IDS = ['radiance_call', 'radiance_summon', 'radiance_retain', 'radiance_destiny', 'radiance_discharge', 'radiance_transcend'];

function radianceRank() {
    const title = (currentCharacter?.dominion?.nobility?.title || '').toLowerCase();
    if (!title) return 0;
    const map = { baron: 1, viscount: 2, count: 3, marquis: 4, duke: 5, archduke: 6, prince: 7, king: 7, emperor: 7 };
    return map[title] || 0;
}
function setRadianceField(field, value) {
    const a = arcanaState(); if (!a) return;
    if (field === 'member') {
        a.radiance.member = Boolean(value);
        arcanaLog(value ? 'Joined the Brotherhood of the Radiance.' : 'Left the Brotherhood of the Radiance.');
    } else {
        a.radiance[field] = String(value || '').slice(0, 200);
    }
    arcanaSave();
}
function adjustRads(delta) {
    const a = arcanaState(); if (!a) return;
    a.radiance.rads = Math.max(0, a.radiance.rads + delta);
    arcanaSave();
}
// Retain Power: store 1d20 rads. Above your level each excess rad gives a 1% chance of
// 2 hp damage per excess rad and the rotting disease, checked when the spell is cast.
function castRetainPower() {
    const a = arcanaState(); if (!a) return;
    const roll = arcRoll(20);
    a.radiance.rads += roll;
    const level = arcaneLevel();
    const excess = Math.max(0, a.radiance.rads - level);
    let text = `Retain Power: +${roll} rads (now ${a.radiance.rads}).`;
    if (excess > 0) {
        const check = arcRoll(100);
        if (check <= excess) {
            const dmg = 2 * excess;
            const hp = currentCharacter.hitPoints || (currentCharacter.hitPoints = { current: 0, maximum: 0 });
            hp.current = (Number(hp.current) || 0) - dmg;
            safeSetVal('hp-current', hp.current);
            if (typeof updateCombatVitals === 'function') updateCombatVitals();
            const part = rotRandomPart();
            text += ` Over the safe limit by ${excess}: rolled ${check} ≤ ${excess}, took ${dmg} damage${part ? ` and the rot struck the ${part.toLowerCase()}` : ''}.`;
        } else {
            text += ` Over the safe limit by ${excess} (rolled ${check}, no harm).`;
        }
    }
    arcanaLog(text, { rads: a.radiance.rads });
    arcanaSave();
}
function rotRandomPart() {
    const a = arcanaState();
    const free = RADIANCE_BODY_PARTS.filter(p => !a.radiance.rotted.includes(p));
    if (!free.length) return null;
    const part = free[Math.floor(Math.random() * free.length)];
    a.radiance.rotted.push(part);
    return part;
}
function spendRads() {
    const a = arcanaState(); if (!a) return;
    const input = document.getElementById('radiance-spend');
    const n = Math.max(0, Math.trunc(Number(input?.value) || 0));
    const purpose = document.getElementById('radiance-spend-for')?.value || 'Control Destiny';
    if (!n) return;
    const spent = Math.min(n, a.radiance.rads);
    a.radiance.rads -= spent;
    arcanaLog(`${purpose}: spent ${spent} rads (${a.radiance.rads} left).`, { rads: a.radiance.rads, spent });
    arcanaSave();
}
// Every use of a Radiance spell carries a 1% chance of rot.
function checkRadianceCorruption() {
    const a = arcanaState(); if (!a) return;
    const roll = arcRoll(100);
    let text;
    if (roll === 1) {
        const part = rotRandomPart();
        text = part ? `Radiance corruption check: rolled 01. The rot strikes the ${part.toLowerCase()}.` : 'Radiance corruption check: rolled 01, and the whole body is already affected.';
    } else {
        text = `Radiance corruption check: rolled ${String(roll).padStart(2, '0')}, no harm.`;
    }
    arcanaLog(text, { roll });
    arcanaSave();
    const msg = document.getElementById('radiance-msg');
    if (msg) msg.textContent = text;
}
function toggleRotPart(part, on) {
    const a = arcanaState(); if (!a) return;
    a.radiance.rotted = a.radiance.rotted.filter(p => p !== part);
    if (on) a.radiance.rotted.push(part);
    arcanaSave();
}
function toggleRadianceSpell(id, on) {
    if (!currentCharacter) return;
    if (!currentCharacter.spellbook) currentCharacter.spellbook = { knownSpellIds: [], customSpells: [], preparedSpells: {} };
    const book = currentCharacter.spellbook;
    if (!Array.isArray(book.knownSpellIds)) book.knownSpellIds = [];
    book.knownSpellIds = book.knownSpellIds.filter(x => x !== id);
    if (on) book.knownSpellIds.push(id);
    const sp = GlobalSpellsDatabase[id];
    if (sp) arcanaLog(on ? `Discovered the Radiance spell ${sp.name}.` : `Removed ${sp.name} from the spellbook.`);
    if (typeof renderSpellbooks === 'function') renderSpellbooks();
    arcanaSave();
}

function renderRadianceCard() {
    const a = arcanaState();
    const r = a.radiance;
    const level = arcaneLevel();
    const head = `
        <div class="panel-head">
            <h2>The Radiance</h2>
            <label class="arc-check"><input type="checkbox" ${r.member ? 'checked' : ''} onchange="setRadianceField('member', this.checked)"> Brother of the Radiance</label>
        </div>`;
    if (!r.member) {
        return `<div class="card" id="arcana-radiance-card">${head}
            <p class="sub-caption">A magical power radiating from beneath Glantri City enhances the spells of those who know its secret and may, at the very end, open the way to Immortality in the Sphere of Energy. Only noble wizards of the Brotherhood can draw on it, through spells they must research themselves.</p>
            <div class="arc-source">${escapeHtml(GAZ3)}, pp. 68, 77-79</div></div>`;
    }
    const rank = radianceRank();
    const rankInfo = RADIANCE_RANKS.find(x => x.rank === rank);
    const title = currentCharacter?.dominion?.nobility?.title || '';
    const excess = Math.max(0, r.rads - level);
    const glowing = r.rads >= 12;
    const known = new Set((currentCharacter.spellbook?.knownSpellIds) || []);
    const spellsHtml = RADIANCE_SPELL_IDS.map(id => {
        const sp = GlobalSpellsDatabase[id];
        if (!sp) return '';
        return `
        <div class="arc-ability${known.has(id) ? ' learned' : ''}">
            <div class="arc-row-head">
                <button type="button" class="arc-name" onclick="this.closest('.arc-ability').classList.toggle('open')">${escapeHtml(sp.name)} <span class="eyebrow">Level ${sp.level}</span></button>
                <label class="arc-check"><input type="checkbox" ${known.has(id) ? 'checked' : ''} onchange="toggleRadianceSpell('${id}', this.checked)"> In spellbook</label>
            </div>
            <div class="arc-text">${escapeHtml(`Range: ${sp.range}. Duration: ${sp.duration}. ${sp.description}`)}</div>
        </div>`;
    }).join('');
    const rotCount = r.rotted.length;
    return `
    <div class="card" id="arcana-radiance-card">
        ${head}
        <div class="tally" style="margin-bottom: 10px;">
            <span>Title <strong>${escapeHtml(title || 'none')}</strong></span>
            ${rank ? `<span>Call upon Radiance <strong>+${rank} caster level${rank > 1 ? 's' : ''}</strong> or <strong>+${rank * 10}%</strong> range, duration or area</span>
                <span>Draw within <strong>${rankInfo.callRange} miles</strong> of the capital or your receptacle</span>
                <span>Summon Radiance range <strong>${24 * rank} miles</strong></span>`
                : '<span>Set a noble title (Baron to Prince) on the Dominion tab to draw on the Radiance.</span>'}
        </div>
        <div class="arc-fields">
            <label class="arc-field"><span class="eyebrow">Receptacle</span><input type="text" class="stat-input arc-input" value="${escapeHtml(r.receptacle || '')}" placeholder="Crystal of 4,000 cn+ in your dominion" onchange="setRadianceField('receptacle', this.value)"></label>
        </div>
        <div class="arc-panel${excess ? ' arc-warn' : ''}">
            <div class="arc-row-head"><strong>Stored power</strong>
                <span class="arc-actions" style="margin: 0;"><button type="button" class="btn btn-sm" onclick="adjustRads(-1)">-</button><strong style="min-width: 40px; text-align: center; font-size: 1.2rem;">${r.rads}</strong><span class="eyebrow">rads</span><button type="button" class="btn btn-sm" onclick="adjustRads(1)">+</button></span></div>
            <p class="sub-caption" style="margin: 6px 0;">Safe limit: <strong>${level}</strong> (your level).${excess ? ` <span style="color: var(--danger);">${excess} over: each Retain Power has a ${excess}% chance of ${2 * excess} damage and the rot.</span>` : ''}${glowing ? ' <strong>You glow an eerie blue</strong> (12+ rads; cannot be dispelled).' : ''}</p>
            <div class="arc-actions">
                <button type="button" class="btn btn-sm btn-accent" onclick="castRetainPower()">Cast Retain Power (+1d20)</button>
                <input type="number" id="radiance-spend" class="stat-input arc-input" min="0" placeholder="Rads" style="max-width: 90px;">
                <select id="radiance-spend-for" class="stat-input arc-input" style="max-width: 170px;"><option>Control Destiny</option><option>Discharge</option><option>Transcend Life Force</option><option>Other</option></select>
                <button type="button" class="btn btn-sm" onclick="spendRads()">Spend</button>
            </div>
            <p class="sub-caption" style="margin: 6px 0 0;">Control Destiny: 1 rad per point a roll is changed, at least 5 rads each time. Discharge: a 20d6 blast, its cloud spreading 200 yards per rad. Transcend Life Force needs 50 rads.</p>
        </div>
        <div class="arc-panel">
            <div class="arc-row-head"><strong>The rot</strong><span class="eyebrow">${rotCount} / 10 parts affected</span></div>
            <div class="arc-rot">${RADIANCE_BODY_PARTS.map(p => `<label class="arc-check"><input type="checkbox" ${r.rotted.includes(p) ? 'checked' : ''} onchange="toggleRotPart('${p}', this.checked)"> ${escapeHtml(p)}</label>`).join('')}</div>
            <div class="arc-actions"><button type="button" class="btn btn-sm" onclick="checkRadianceCorruption()">Used a Radiance spell: roll 1%</button><span id="radiance-msg" class="sub-caption" style="margin: 0;"></span></div>
            ${rotCount >= 10 ? `<p class="sub-caption" style="color: var(--danger);">The whole body is affected: the wizard becomes ${level >= 21 ? 'a lich' : 'a zombie-like creature (1 HD per level)'}.</p>` : ''}
        </div>
        <div class="arc-sub-head"><span class="eyebrow eyebrow-strong">Radiance spells</span><span class="eyebrow">found only through research and quests</span></div>
        ${spellsHtml}
        <details class="arc-rules"><summary>The Radiance and the Brotherhood</summary><ul>${RADIANCE_RULES.map(x => `<li>${escapeHtml(x)}</li>`).join('')}</ul></details>
        <div class="arc-source">${escapeHtml(GAZ3)}, pp. 68, 77-79</div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Arcane Warrior: mentor and pact (Mystara Extra Rules Compendium)
// ---------------------------------------------------------------------------
function setMentorField(field, value) {
    const a = arcanaState(); if (!a) return;
    const m = a.mentor;
    if (field === 'dead' || field === 'freed') {
        m[field] = Boolean(value);
        if (field === 'freed' && value) arcanaLog(`Freed from the pact with ${m.name || 'the mentor'} (final gift of at least 30,000 gp).`);
        if (field === 'dead' && value) arcanaLog(`Mentor ${m.name || ''} died. Magical progress stops until a new mentor is found.`);
    } else {
        m[field] = String(value || '').slice(0, 300);
    }
    arcanaSave();
}
function addMentorSpell() {
    const a = arcanaState(); if (!a) return;
    const name = (document.getElementById('mentor-spell-name')?.value || '').trim();
    const level = clampInt(document.getElementById('mentor-spell-level')?.value, 1, 9, 1);
    if (!name) return;
    a.mentor.spells.push({ id: `ms_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`, name: name.slice(0, 80), level, status: 'studying', days: 0 });
    arcanaSave();
}
function resolveMentorSpell(id, learned) {
    const a = arcanaState(); if (!a) return;
    const sp = a.mentor.spells.find(x => x.id === id); if (!sp) return;
    sp.status = learned ? 'learned' : 'failed';
    let extra = '';
    if (learned) extra = addResearchedSpell({ name: sp.name, level: sp.level });
    arcanaLog(`${learned ? 'Learned' : 'Failed to learn'} ${sp.name} (level ${sp.level}) from ${a.mentor.name || 'the mentor'}.${extra}`);
    if (typeof renderSpellbooks === 'function') renderSpellbooks();
    arcanaSave();
}
async function removeMentorSpell(id) {
    const a = arcanaState(); if (!a) return;
    const sp = a.mentor.spells.find(x => x.id === id); if (!sp) return;
    if (!(await sheetConfirm(`Remove ${sp.name} from the spells taught by your mentor?${sp.status === 'learned' ? ' It stays in your spellbook.' : ''}`, 'Remove'))) return;
    a.mentor.spells = a.mentor.spells.filter(x => x.id !== id);
    arcanaSave();
}
function renderMentorCard() {
    const a = arcanaState();
    const m = a.mentor;
    const level = arcaneLevel();
    const fighterLevel = Number(currentCharacter.level) || 1;
    const start = Number(currentCharacter.arcaneWarriorStartLevel) || 9;
    const maxSpell = Math.max(0, arcIntScore() - 10);
    const rows = m.spells.map(sp => `
        <div class="arc-book-row">
            <span><strong>${escapeHtml(sp.name)}</strong> <span class="eyebrow">level ${sp.level}</span></span>
            <span class="eyebrow">Gift ${(1000 * sp.level).toLocaleString('en-US')} gp · ${7 + sp.level} days</span>
            ${sp.status === 'studying'
                ? `<button type="button" class="btn btn-sm btn-accent" onclick="resolveMentorSpell('${sp.id}', true)">Learned</button><button type="button" class="btn btn-sm" onclick="resolveMentorSpell('${sp.id}', false)">Failed</button>`
                : `<span class="tag" style="color: var(--${sp.status === 'learned' ? 'good' : 'danger'});">${sp.status === 'learned' ? 'Learned' : 'Failed'}</span>`}
            <button type="button" class="icon-btn danger" onclick="removeMentorSpell('${sp.id}')" title="Remove ${escapeHtml(sp.name)}" aria-label="Remove ${escapeHtml(sp.name)}">${getIcon('close', 13)}</button>
        </div>`).join('');
    return `
    <div class="card" id="arcana-mentor-card">
        <div class="panel-head">
            <h2>Mentor &amp; Pact</h2>
            <span class="eyebrow eyebrow-strong">Casts as a level ${toRoman(level)} magic-user</span>
        </div>
        <p class="sub-caption">An arcane warrior serves a mage as a knight serves a church: he protects his mentor and fights his enemies, and in return is housed, protected and taught. He learns only the spells his mentor teaches him.</p>
        <div class="arc-fields">
            <label class="arc-field"><span class="eyebrow">Mentor</span><input type="text" class="stat-input arc-input" value="${escapeHtml(m.name || '')}" placeholder="A mage of higher level than you" onchange="setMentorField('name', this.value)"></label>
            <label class="arc-field"><span class="eyebrow">Terms of the pact</span><input type="text" class="stat-input arc-input" value="${escapeHtml(m.pact || '')}" placeholder="Geas, gifts, quests, oaths..." onchange="setMentorField('pact', this.value)"></label>
        </div>
        <div class="tally" style="margin: 10px 0;">
            <span>Apprenticed at fighter level <strong>${start}</strong> (study: ${2 * start} weeks)</span>
            <span>Highest spell level <strong>${maxSpell}</strong> (Int − 10)</span>
            <span>Next magic-user level at fighter level <strong>${fighterLevel % 2 === start % 2 ? fighterLevel + 2 : fighterLevel + 1}</strong></span>
        </div>
        <div class="arc-sub-head"><span class="eyebrow eyebrow-strong">Spells from the mentor</span><span class="eyebrow">gift 1,000 gp per spell level · 1 week + 1 day per level, then the learning check</span></div>
        <div class="arc-book">${rows || '<div class="ledger-note">No spells taught yet.</div>'}</div>
        <div class="arc-actions">
            <input type="text" id="mentor-spell-name" class="stat-input arc-input" placeholder="Spell name" aria-label="Spell name" style="flex: 1;">
            <input type="number" id="mentor-spell-level" class="stat-input arc-input" min="1" max="${Math.max(1, maxSpell)}" value="1" style="max-width: 80px;" title="Spell level" aria-label="Spell level">
            <button type="button" class="btn btn-sm" onclick="addMentorSpell()">Begin learning</button>
        </div>
        ${level < 9 ? `<p class="sub-caption arc-note">Writing a spell without your mentor before magic-user level 9 risks a flawed formula: ${[1, 2, 3, 4, 5, 6].map(l => `${l * 5}% at level ${l}`).join(', ')}. A flawed spell is only found out when first cast.</p>` : ''}
        <div class="arc-fields" style="margin-top: 10px;">
            ${level >= 9 ? `<label class="arc-check"><input type="checkbox" ${m.freed ? 'checked' : ''} onchange="setMentorField('freed', this.checked)"> Freed from the pact (final gift of 30,000 gp or more)</label>` : ''}
            <label class="arc-check"><input type="checkbox" ${m.dead ? 'checked' : ''} onchange="setMentorField('dead', this.checked)"> Mentor has died</label>
        </div>
        ${m.dead && level < 9 && !m.freed ? '<p class="sub-caption arc-note" style="color: var(--danger);">Your mentor died before you reached magic-user level 9: your magic cannot advance until you swear to a new mentor, and fighter levels gained meanwhile do not count toward your spellcasting.</p>' : ''}
        ${m.freed ? '<p class="sub-caption arc-note">Free of the pact. Breaking it any other way makes your old mentor a sworn enemy.</p>' : ''}
        <p class="sub-caption arc-note">Arcane scrolls (with read magic) and magic-user items work for you, but always with a 10% chance of failing or malfunctioning.</p>
        <div class="arc-source">Mystara Extra Rules Compendium, Arcane Warrior</div>
    </div>`;
}

// ---------------------------------------------------------------------------
// Tab
// ---------------------------------------------------------------------------
function renderArcana() {
    updateArcanaTabVisibility();
    const root = document.getElementById('arcana-root');
    if (!root || !currentCharacter) return;
    if (!isArcaneCharacter()) { root.innerHTML = ''; return; }
    arcanaState();
    // Keep what the user is typing in a field across a re-render.
    const active = document.activeElement && root.contains(document.activeElement) ? document.activeElement.id : null;
    if (isArcaneWarrior()) {
        root.innerHTML = renderMentorCard() + renderResearchCard();
    } else {
        checkCourseCompletion();
        root.innerHTML = renderCraftCard() + renderSchoolCard() + renderResearchCard() + renderRadianceCard();
    }
    if (active) { const el = document.getElementById(active); if (el) el.focus(); }
}

Object.assign(window, {
    renderArcana, updateArcanaTabVisibility, isArcaneCharacter, isArcaneWarrior,
    setMentorField, addMentorSpell, setWizardXp, wizardXpOn, resolveMentorSpell, removeMentorSpell, arcanaState, schoolHasCourse, meditationBonus, researchCalc,
    setCraftOrder, setCraftField, startCraftStudy, adjustCraftStudy, cancelCraftStudy, finishCraftStudy, gainCraftByDuel,
    forgetCraftAbility, addCraftMasteryXp, toggleCraftUse, resetCraftUses, adjustRunesToday, addCraftBookEntry, deleteCraftBookEntry, addTaughtSpells,
    setSchoolField, startCourse, finishCourseNow, dropCourse, removeCompletedCourse, setCompanionField, toggleSpellCombination,
    addResearchProject, updateResearch, workResearchDay, resolveResearch, reopenResearch, deleteResearch, setLibrary,
    editLibraryBook, studyLibraryBook, libraryTotal, libraryCanTakeResearch, addResearchedSpellToLibrary, countResearchedSpells,
    setRadianceField, adjustRads, castRetainPower, spendRads, checkRadianceCorruption, toggleRotPart, toggleRadianceSpell, radianceRank,
});
