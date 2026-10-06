// js/summary.js — a clean, read-only summary of the character, to show the DM or keep:
// opened in a window with Print and "Save as page" (an .html file anyone can open).

function summaryEsc(v) { return typeof escapeHtml === 'function' ? escapeHtml(String(v ?? '')) : String(v ?? ''); }
function summaryNum(n) { return Number(n || 0).toLocaleString('en-US'); }
function summaryVal(id) { const el = document.getElementById(id); return el ? (el.value ?? el.textContent ?? '') : ''; }

function buildCharacterSummary() {
    const ch = currentCharacter;
    if (!ch) return '';
    // Make sure every derived number on the sheet is current.
    ['updateClassStats', 'updateCombatVitals'].forEach(fn => { try { if (typeof window[fn] === 'function') window[fn](); } catch (e) { /* not on screen */ } });
    const E = summaryEsc;
    const info = (typeof ClassesDatabase !== 'undefined' && ClassesDatabase[ch.characterClass]) || {};
    const level = Number(ch.level) || 1;
    const stage = typeof getCreatureStage === 'function' ? getCreatureStage(ch) : null;
    const roman = n => (typeof toRoman === 'function' ? toRoman(n) : n);
    const opt = typeof getClassOption === 'function' ? getClassOption(ch) : null;
    const sub = ch.subClass ? `${ch.subClass}${opt?.ownXpTrack ? ` ${roman(Number(ch.subClassLevel) || 1)}` : ''}` : '';
    const nextT = typeof nextXpThreshold === 'function' ? nextXpThreshold(ch) : null;
    const nextXp = nextT ? nextT.xp : (info.xpTable ? info.xpTable[level + 1] : null);
    const nextLabel = nextT ? nextT.label.replace(/^Level /, 'level ') : 'next level';
    const bio = ch.bio || {};

    const abil = ['strength', 'intelligence', 'wisdom', 'dexterity', 'constitution', 'charisma'].map(k => {
        const base = Number(ch.abilities?.[k]?.score) || 0;
        const eff = typeof getEffectiveScore === 'function' ? getEffectiveScore(ch, k) : base;
        const mod = Number(ch.abilities?.[k]?.modifier) || 0;
        return `<div class="ab"><span>${k.slice(0, 3).toUpperCase()}</span><strong>${eff}</strong><em>${mod >= 0 ? '+' : ''}${mod}</em>${eff !== base ? `<small>base ${base}</small>` : ''}</div>`;
    }).join('');

    const st = ch.savingThrows || {};
    const saves = [['Death ray / poison', st.deathRayPoison], ['Magic wands', st.magicWands], ['Paralysis / stone', st.paralysisTurnToStone], ['Dragon breath', st.dragonBreath], ['Rod, staff, spell', st.rodStaffSpell]]
        .map(([l, v]) => `<tr><td>${l}</td><td class="n">${E(v ?? '—')}</td></tr>`).join('');
    const atk = typeof getAttacksPerRound === 'function' ? getAttacksPerRound(ch.characterClass, level, ch) : null;
    const hp = ch.hitPoints || {};
    const combat = [
        ['Hit points', `${E(hp.current ?? '—')} / ${E(hp.maximum ?? '—')}`],
        ['Armour class', E(summaryVal('combat-ac') || ch.armorClass || '—')],
        ['THAC0', E(summaryVal('combat-thac0') || ch.thac0 || '—')],
        ['Movement', `${E(summaryVal('speed-explore') || "120'")} (${E(summaryVal('speed-encounter') || "40'")} a round)`],
        ['Attacks', atk ? `${atk.count} · ${E(atk.note)}` : '1'],
    ];
    const fly = document.getElementById('speed-fly');
    if (fly && fly.style.display !== 'none' && fly.textContent) combat.push(['Flying', E(fly.textContent)]);

    // Equipped items.
    const labels = typeof SLOT_LABELS !== 'undefined' ? SLOT_LABELS : {};
    const worn = Object.entries(ch.paperdoll || {}).filter(([, it]) => it && it.name)
        .map(([slot, it]) => `<li><span class="k">${E(labels[slot] || slot)}</span> ${E(it.name)}</li>`).join('');

    // Weapon mastery.
    const W = window.GlobalWeaponsDatabase || {};
    const rankName = { B: 'Basic', S: 'Skilled', E: 'Expert', M: 'Master', G: 'Grand Master' };
    const feats = (ch.weaponFeats || []).map(w => `<li>${E(W[w.weaponId]?.name || w.weaponId)} <span class="k">${E(rankName[w.rank] || w.rank || '')}</span></li>`).join('');

    // Skills.
    const skills = (ch.skills || []).map(s => {
        const ab = s.ability || 'intelligence';
        const score = typeof getEffectiveScore === 'function' ? getEffectiveScore(ch, ab) : Number(ch.abilities?.[ab]?.score) || 10;
        const target = Math.min(19, score + (Number(s.slots) || 1) - 1);
        return `<li>${E(s.subType ? `${s.name} (${s.subType})` : s.name)} <span class="k">${ab.slice(0, 3).toUpperCase()} ≤ ${target}</span></li>`;
    }).join('');

    const thief = typeof getThiefAbilities === 'function' ? getThiefAbilities(ch) : [];
    const thiefHtml = thief.map(a => `<li>${E(a.name)} <span class="k">${E(a.value)}%</span></li>`).join('');

    // Class abilities at this level.
    const feats2 = (info.features || []).filter(f => level >= f.minLevel);
    const optFeats = (opt?.features || []).filter(f => (opt.ownXpTrack ? (Number(ch.subClassLevel) || 1) : level) >= f.minLevel);
    const featHtml = [...feats2, ...optFeats].map(f => `<li><strong>${E(f.name)}.</strong> ${E(f.description)}</li>`).join('');

    // Spells: what is prepared, and the spells known (arcane books).
    let spellsHtml = '';
    try {
        const profiles = typeof getCasterProfiles === 'function' ? getCasterProfiles(ch) : [];
        const book = ch.spellbook || {};
        const prep = book.preparedSpells || {};
        profiles.forEach(p => {
            if (!p.type || !(p.slots || []).length) return;
            const all = getSpellsForProfile(p, book, ch.deity);
            const byLvl = {};
            all.forEach(s => { (byLvl[s.level] = byLvl[s.level] || []).push(s); });
            const rows = p.slots.map((n, i) => {
                const lv = i + 1;
                const list = (byLvl[lv] || []).filter(s => p.type === 'arcane' && !p.spellList ? true : prep[s.id]);
                const names = list.sort((a, b) => a.name.localeCompare(b.name)).map(s => E(s.name) + (prep[s.id] ? ` <b>×${prep[s.id]}</b>` : '')).join(', ');
                return `<tr><td>Level ${lv}</td><td class="n">${n}</td><td>${names || '<span class="k">—</span>'}</td></tr>`;
            }).join('');
            const title = p.title || (p.type === 'arcane' ? 'Spellbook' : 'Prayers');
            spellsHtml += `<h3>${E(title)} <span class="k">casts as level ${roman(p.effectiveLevel)}</span></h3>
                <table class="spells"><tr><th>Spell level</th><th class="n">Slots</th><th>${p.type === 'arcane' && !p.spellList ? 'Spells in the book (× prepared)' : 'Prepared'}</th></tr>${rows}</table>`;
        });
    } catch (e) { console.error(e); }

    const uses = (ch.dailyUses || []).map(u => `<li>${E(u.name)} <span class="k">${Number(u.max) - (Number(u.used) || 0)} of ${E(u.max)} left (${E((typeof DU_PERIODS !== 'undefined' && DU_PERIODS[u.per]) || 'a day')})</span></li>`).join('');

    // Inventory by place.
    const where = it => (typeof inventoryLocationName === 'function' ? inventoryLocationName(it) : (it.location || 'Backpack'));
    const groups = {};
    (ch.inventory || []).forEach(it => { (groups[where(it)] = groups[where(it)] || []).push(it); });
    const invHtml = Object.entries(groups).map(([place, items]) => `<div class="place"><h4>${E(place)}</h4><ul class="inv">${items.map(it => {
        const q = it.qty === undefined || it.qty === null || it.qty === '' ? 1 : Number(it.qty) || 0;
        return `<li>${q !== 1 ? `${q} × ` : ''}${E(it.name)}${it.magicBonus ? ` (${it.magicBonus > 0 ? '+' : ''}${E(it.magicBonus)})` : ''}${it.charges !== undefined && it.charges !== null && it.charges !== '' ? ` <span class="k">${E(it.charges)} charges</span>` : ''}${it.forTrade ? ' <span class="k">for trade</span>' : ''}</li>`;
    }).join('')}</ul></div>`).join('');
    const coins = c => ['pp', 'gp', 'ep', 'sp', 'cp'].filter(k => Number(c?.[k])).map(k => `${summaryNum(c[k])} ${k}`).join(', ') || '—';

    const comps = (ch.companions || []).map(c => `<li>${E(c.name || 'Companion')} <span class="k">${E([c.role || c.kind || c.type, c.level ? `level ${c.level}` : '', c.className || c.class].filter(Boolean).join(' · '))}</span></li>`).join('');

    const section = (title, body) => body ? `<section><h2>${title}</h2>${body}</section>` : '';
    const today = new Date().toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric' });
    const gameDate = (typeof calendarState === 'function' && typeof calDateText === 'function' && typeof calParts === 'function') ? (() => { try { return calDateText(calParts(calendarState().t)); } catch (e) { return ''; } })() : '';

    return `<!doctype html><html><head><meta charset="utf-8"><title>${E(ch.name || 'Character')} — Summary</title>
<style>
body { font-family: 'EB Garamond', 'Palatino Linotype', Georgia, serif; color: #2A1F14; background: #FBF5E6; max-width: 52rem; margin: 1.5rem auto; padding: 0 1.2rem; line-height: 1.45; font-size: 15px; }
h1 { font-family: 'Cinzel', Georgia, serif; color: #9A2A1C; margin: 0; font-size: 1.9rem; }
.sub { color: #6A5842; margin: .2rem 0 1rem; }
h2 { font-family: 'Cinzel', Georgia, serif; font-size: 1.05rem; color: #9A2A1C; border-bottom: 1px solid #B8954A; margin: 1.2rem 0 .5rem; padding-bottom: 2px; }
h3 { font-size: 1rem; margin: .8rem 0 .3rem; } h4 { margin: .4rem 0 .2rem; font-size: .95rem; }
.k { color: #6A5842; font-size: .88em; }
.abil { display: grid; grid-template-columns: repeat(6, 1fr); gap: 8px; }
.ab { border: 1px solid #B8954A; border-radius: 3px; text-align: center; padding: 4px; display: flex; flex-direction: column; }
.ab span { font-size: .75rem; letter-spacing: .08em; color: #6A5842; } .ab strong { font-size: 1.4rem; } .ab em { font-style: normal; color: #9A2A1C; } .ab small { color: #6A5842; font-size: .7rem; }
.two { display: grid; grid-template-columns: 1fr 1fr; gap: 0 2rem; }
table { border-collapse: collapse; width: 100%; } td, th { padding: 2px 6px; border-bottom: 1px dotted #C9B488; text-align: left; vertical-align: top; } .n { text-align: right; white-space: nowrap; }
th { font-weight: normal; color: #6A5842; font-size: .85rem; }
ul { margin: .2rem 0; padding-left: 1.1rem; } li { margin: .1rem 0; }
ul.cols { columns: 2; column-gap: 2rem; } ul.feat li { margin: .3rem 0; font-size: .93rem; }
.places { columns: 2; column-gap: 2rem; } .place { break-inside: avoid; }
footer { margin-top: 2rem; color: #6A5842; font-size: .8rem; border-top: 1px solid #B8954A; padding-top: .4rem; }
@media print { body { background: #fff; margin: 0 auto; font-size: 12px; } h2 { break-after: avoid; } section { break-inside: auto; } }
@media (max-width: 600px) { .abil { grid-template-columns: repeat(3, 1fr); } .two, .places { grid-template-columns: 1fr; columns: 1; } ul.cols { columns: 1; } }
</style></head><body>
<h1>${E(ch.name || 'Unnamed hero')}</h1>
<div class="sub">${E([ch.characterClass, stage ? stage.name : `level ${roman(level)}`, sub, ch.alignment].filter(Boolean).join(' · '))}${bio.homeland ? ' · ' + E(bio.homeland) : ''}${ch.deity ? ' · follows ' + E(ch.deity) : ''}<br>
XP ${summaryNum(ch.experiencePoints)}${nextXp != null ? ` (${E(nextLabel)} at ${summaryNum(nextXp)})` : ''}${bio.gender ? ' · ' + E(bio.gender) : ''}${bio.age ? ' · age ' + E(bio.age) : ''}${bio.languages ? ' · languages: ' + E(bio.languages) : ''}</div>
<div class="abil">${abil}</div>
<div class="two">
  <section><h2>Combat</h2><table>${combat.map(([l, v]) => `<tr><td>${l}</td><td class="n">${v}</td></tr>`).join('')}</table></section>
  <section><h2>Saving Throws</h2><table>${saves}</table></section>
</div>
<div class="two">
  ${section('Equipped', worn ? `<ul>${worn}</ul>` : '')}
  ${section('Weapon Mastery', feats ? `<ul>${feats}</ul>` : '')}
</div>
${section('Skills', skills ? `<ul class="cols">${skills}</ul>` : '')}
${section('Thief Abilities', thiefHtml ? `<ul class="cols">${thiefHtml}</ul>` : '')}
${section('Spells', spellsHtml)}
${section('Daily Uses', uses ? `<ul class="cols">${uses}</ul>` : '')}
${section('Class Abilities', featHtml ? `<ul class="feat">${featHtml}</ul>` : '')}
${section('Inventory', `${invHtml ? `<div class="places">${invHtml}</div>` : '<p class="k">Nothing carried.</p>'}<p><strong>Purse:</strong> ${coins(ch.coins)}${ch.vaultCoins && coins(ch.vaultCoins) !== '—' ? ` · <strong>Vault:</strong> ${coins(ch.vaultCoins)}` : ''}</p>`)}
${section('Companions', comps ? `<ul class="cols">${comps}</ul>` : '')}
<footer>Read-only summary from the Mystara Character Sheet · ${E(today)}${gameDate ? ' · game date ' + E(gameDate) : ''}</footer>
</body></html>`;
}

function openCharacterSummary() {
    if (!currentCharacter) { if (typeof sheetAlert === 'function') sheetAlert('Choose a character first.'); return; }
    if (typeof saveChanges === 'function') { try { saveChanges(); } catch (e) { /* keep going */ } }
    const html = buildCharacterSummary();
    let m = document.getElementById('summary-modal');
    if (!m) {
        m = document.createElement('div');
        m.id = 'summary-modal';
        m.className = 'notes-form-wrap';
        m.setAttribute('role', 'dialog');
        m.setAttribute('aria-modal', 'true');
        m.setAttribute('aria-label', 'Character summary');
        m.addEventListener('click', e => { if (e.target === m) closeCharacterSummary(); });
        document.body.appendChild(m);
    }
    m.innerHTML = `<div class="card summary-card" onclick="event.stopPropagation();">
        <div class="panel-head"><h2>Character Summary</h2>
            <div class="panel-head-tools">
                <button type="button" class="btn btn-sm" onclick="printCharacterSummary()">${getIcon('print', 14)} Print</button>
                <button type="button" class="btn btn-sm" onclick="saveCharacterSummary()" title="Save as a page anyone can open in a browser">${getIcon('export', 14)} Save as page</button>
                <button type="button" class="btn btn-sm" onclick="exportCharacterJSON()" title="The full character file, to back up or to import on another computer">${getIcon('export', 14)} Export character file</button>
                <button type="button" class="icon-btn" onclick="closeCharacterSummary()" aria-label="Close">${getIcon('close', 15)}</button>
            </div>
        </div>
        <iframe id="summary-frame" class="summary-frame" title="Character summary"></iframe>
    </div>`;
    document.getElementById('summary-frame').srcdoc = html;
    m.querySelector('.panel-head-tools button')?.focus();
}
// Read-only window: Esc (via registerModalCloser) and a click outside close it.
function closeCharacterSummary() {
    document.getElementById('summary-modal')?.remove();
}
if (typeof registerModalCloser === 'function') registerModalCloser('summary-modal', closeCharacterSummary);
function printCharacterSummary() {
    const f = document.getElementById('summary-frame');
    try { f.contentWindow.focus(); f.contentWindow.print(); } catch (e) { console.error(e); }
}
function saveCharacterSummary() {
    if (!currentCharacter) return;
    const html = buildCharacterSummary();
    const name = (currentCharacter.name || 'Character').replace(/[\\/:*?"<>|]+/g, '_');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([html], { type: 'text/html' }));
    a.download = `${name} - Summary.html`;
    document.body.appendChild(a);
    a.click();
    setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

window.openCharacterSummary = openCharacterSummary;
window.closeCharacterSummary = closeCharacterSummary;
window.printCharacterSummary = printCharacterSummary;
window.saveCharacterSummary = saveCharacterSummary;
window.buildCharacterSummary = buildCharacterSummary;
