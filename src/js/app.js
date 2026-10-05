function switchTab(tabId) {
    try {
        // 1. Скрываем все вкладки и снимаем классы
        document.querySelectorAll('.tab-content').forEach(tab => {
            tab.classList.remove('active-tab');
            tab.style.display = '';          // visibility comes from .active-tab in style.css
        });
        document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));

        // 2. Отображаем выбранную вкладку напрямую
        const targetTab = document.getElementById(tabId);
        if (targetTab) {
            targetTab.classList.add('active-tab');
        } else {
            console.warn(`Tab content "#${tabId}" not found in DOM!`);
        }

        // 3. Подсвечиваем активную кнопку
        const allBtns = document.querySelectorAll('.tab-btn');
        allBtns.forEach(btn => {
            const onclickAttr = btn.getAttribute('onclick') || '';
            if (onclickAttr.includes(tabId)) {
                btn.classList.add('active');
            }
        });

        // 4. Безопасные вызовы модулей под защитой try/catch
        if (tabId === 'tab-features' && typeof updateClassFeaturesDisplay === 'function') {
            try { updateClassFeaturesDisplay(); } catch (e) { console.error(e); }
        }
        if (tabId === 'tab-combat') {
            try { if (typeof syncWeaponFeatsUI === 'function') syncWeaponFeatsUI(); } catch (e) { console.error(e); }
            try { if (typeof renderCombatManoeuvres === 'function') renderCombatManoeuvres(); } catch (e) { console.error(e); }
        }
        if (tabId === 'tab-skills' && typeof syncSkillsUI === 'function') {
            try { syncSkillsUI(); } catch (e) { console.error(e); }
        }
        if (tabId === 'tab-inventory') {
            try { if (typeof syncPaperdollUI === 'function') syncPaperdollUI(); } catch (e) { console.error(e); }
            try { if (typeof syncInventoryUI === 'function') syncInventoryUI(); } catch (e) { console.error(e); }
        }
        if (tabId === 'tab-arcana') {
            try { if (typeof renderArcana === 'function') renderArcana(); } catch (e) { console.error(e); }
        }
        if (tabId === 'tab-companions') {
            try { if (typeof renderCompanions === 'function') renderCompanions(); } catch (e) { console.error(e); }
        }
        if (tabId === 'tab-holdings') {
            try { if (typeof renderHoldings === 'function') renderHoldings(); } catch (e) { console.error(e); }
        }
        if (tabId === 'tab-dominion') {
            try { if (typeof renderDominion === 'function') renderDominion(); } catch (e) { console.error(e); }
        }
        if (tabId === 'tab-notes') {
            try { if (typeof syncNotesUI === 'function') syncNotesUI(); } catch (e) { console.error(e); }
        }
    } catch (err) {
        console.error('Critical error in switchTab:', err);
    }
}

window.switchTab = switchTab;

async function loadRoster() {
    const roster = await window.api.getCharactersList();
    const select = document.getElementById('character-roster');
    select.innerHTML = '<option value="">-- Select Character --</option>';
    roster.forEach(char => {
        const option = document.createElement('option');
        option.value = char.id;
        option.textContent = `${char.name} (${char.class} ${char.level})`;
        if (currentFileName === char.id) {
            option.selected = true;
            document.getElementById('delete-char-btn').style.display = 'inline-flex';
        }
        select.appendChild(option);
    });
}

function populateDeitiesDropdown(keepValue) {
    const select = document.getElementById('char-deity');
    if (!select) return;
    const currentValue = keepValue || (currentCharacter ? currentCharacter.deity : select.value);
    select.innerHTML = '<option value="">None</option>';
    Object.keys(GlobalDeitiesDatabase).sort((a, b) => a.localeCompare(b)).forEach(deityName => {
        const d = GlobalDeitiesDatabase[deityName] || {};
        // Immortals without clerics (Rad's priests are arcane Shepherds) are not offered,
        // unless an older character already has one.
        if (d.noClerics && deityName !== currentValue) return;
        const option = document.createElement('option');
        option.value = deityName;
        option.textContent = d.alignment ? `${deityName} (${d.alignment})` : deityName;
        if (deityName === currentValue) option.selected = true;
        select.appendChild(option);
    });
}

// Which alignments may serve this Immortal as a cleric (Codex Immortalis "Followers' Alignment").
function deityClericAlignments(deity) {
    const f = String((deity && deity.followers) || '');
    const ALL = ['lawful', 'neutral', 'chaotic'];
    const m = f.match(/clerics?[^;.]*?(must be|cannot be|can't be|can be)\s+([^;.(]*)/i);
    let names = null, rule = '';
    if (m) {
        names = (m[2].match(/lawful|neutral|chaotic/gi) || []).map(x => x.toLowerCase());
        rule = m[1].toLowerCase();
        if (/^can(not|'t) be/.test(rule)) names = ALL.filter(a => !names.includes(a));
        else if (rule === 'can be' && !names.length) names = null;
    } else if (!/\bany\b/i.test(f)) {
        names = (f.match(/lawful|neutral|chaotic/gi) || []).map(x => x.toLowerCase());
    }
    return names && names.length ? [...new Set(names)] : null;
}

function deityAlignmentWarning(deityName, alignment) {
    const deity = GlobalDeitiesDatabase && GlobalDeitiesDatabase[deityName];
    const ok = deityClericAlignments(deity);
    if (!ok || !alignment) return '';
    return ok.includes(String(alignment).toLowerCase()) ? '' : `${deityName}'s clerics must be ${ok.map(a => a[0].toUpperCase() + a.slice(1)).join(' or ')}.`;
}

function openDeityInfo(name) {
    const deityName = name || (currentCharacter && currentCharacter.deity) || document.getElementById('char-deity')?.value;
    const d = deityName && GlobalDeitiesDatabase ? GlobalDeitiesDatabase[deityName] : null;
    if (!d) { sheetAlert('Choose a deity first.'); return; }
    const row = (label, val) => val ? `<div class="deity-row"><span class="deity-label">${label}</span><span>${escapeHtml(val)}</span></div>` : '';
    const byLevel = {};
    (d.extraSpells || []).forEach(e => {
        const s = GlobalSpellsDatabase[e.id];
        if (!s) return;
        (byLevel[e.level] = byLevel[e.level] || []).push(`<span title="${escapeHtml(s.source || '')}">${escapeHtml(s.name)}</span>${e.replaces ? ` <span class="deity-repl">(in place of ${escapeHtml(e.replaces.replace(/\*/g, ''))})</span>` : ''}`);
    });
    const ord = n => ['1st', '2nd', '3rd', '4th', '5th', '6th', '7th', '8th', '9th'][n - 1] || n + 'th';
    const spellsHtml = Object.keys(byLevel).sort((a, b) => a - b).map(l => `<div class="deity-row"><span class="deity-label">${ord(Number(l))}</span><span>${byLevel[l].join(', ')}</span></div>`).join('');
    const warn = currentCharacter ? deityAlignmentWarning(deityName, currentCharacter.alignment) : '';
    const old = document.getElementById('deity-info'); if (old) old.remove();
    const wrap = document.createElement('div');
    wrap.id = 'deity-info';
    wrap.setAttribute('role', 'dialog'); wrap.setAttribute('aria-modal', 'true');
    wrap.className = 'deity-overlay';
    wrap.innerHTML = `
        <div class="card deity-card">
            <div class="panel-head"><h2>${escapeHtml(deityName)}</h2><button type="button" class="btn btn-sm" data-close aria-label="Close">${getIcon('close', 14)}</button></div>
            ${d.titles ? `<p class="deity-titles">${escapeHtml(d.titles)}</p>` : ''}
            ${warn ? `<p class="deity-warn">${escapeHtml(warn)}</p>` : ''}
            ${row('Rank', [d.rank, d.alignment, d.sphere && 'Sphere of ' + d.sphere].filter(Boolean).join(', '))}
            ${row('Symbol', d.symbol)}
            ${row('Portfolio', d.portfolio)}
            ${row('Followers', d.followers)}
            ${row('Weapons', d.weaponsText)}
            ${row('Clerics', d.clericPowers)}
            ${row('Paladins', d.paladinPowers)}
            ${row('Avengers', d.avengerPowers)}
            ${row('Spells (Codex)', d.codexSpells)}
            <h3 class="deity-sub">Additional spells</h3>
            ${d.spellNote ? `<p class="deity-note">${escapeHtml(d.spellNote)}</p>` : ''}
            ${d.druidSpellLevels ? `<p class="deity-note">Also prays for every druid spell up to ${ord(d.druidSpellLevels)} level.</p>` : ''}
            ${spellsHtml || (d.spellNote || d.druidSpellLevels ? '' : '<p class="deity-note">None listed.</p>')}
            <p class="deity-src">Codex Immortalis${d.source ? ' · sources: ' + escapeHtml(d.source) : ''}; spells: Tome of the Magic of Mystara Vol. 2, Appendix.</p>
        </div>`;
    const close = () => { wrap.remove(); document.removeEventListener('keydown', onKey, true); };
    const onKey = e => { if (e.key === 'Escape') { e.preventDefault(); close(); } };
    wrap.addEventListener('click', e => { if (e.target === wrap || e.target.closest('[data-close]')) close(); });
    document.addEventListener('keydown', onKey, true);
    document.body.appendChild(wrap);
}

function hasDivineCasting(character) {
    return getCasterProfiles(character).some(p => p.type === 'divine');
}

function updateDeityDisplay() {
    const deityGroup = document.getElementById('deity-group');
    const select = document.getElementById('char-deity');
    if (!deityGroup || !currentCharacter) return;
    const option = getClassOption(currentCharacter);
    const fixed = option && option.fixedDeity;
    deityGroup.style.display = (fixed || hasDivineCasting(currentCharacter)) ? 'flex' : 'none';
    if (select) {
        // A Shadow Shaman serves Rafiel alone: set it and lock the picker.
        if (fixed && currentCharacter.deity !== fixed) {
            currentCharacter.deity = fixed;
            safeSetVal('char-deity', fixed);
        }
        select.disabled = Boolean(fixed);
        const noCl = currentCharacter.deity && GlobalDeitiesDatabase[currentCharacter.deity]?.noClerics;
        const warn = noCl || (currentCharacter.deity ? deityAlignmentWarning(currentCharacter.deity, currentCharacter.alignment) : '');
        select.title = fixed ? `${option.name}s serve ${fixed} only` : warn;
        select.classList.toggle('deity-mismatch', Boolean(warn));
    }
    const infoBtn = document.getElementById('deity-info-btn');
    if (infoBtn) infoBtn.disabled = !currentCharacter.deity;
}

function updateSubclassOptions() {
    const subSelect = document.getElementById('char-subclass');
    if (!subSelect || !currentCharacter) return;

    const currentSub = currentCharacter.subClass || "";
    const className = currentCharacter.characterClass || "Fighter";
    const level = Number(currentCharacter.level) || 1;

    let options = [{ value: "", label: "None" }];
    if (className === 'Fighter' && level >= 9) {
        options.push({ value: "Paladin", label: "Paladin" });
        options.push({ value: "Avenger", label: "Avenger" });
        // Arcane Warrior needs Str 10 and Int 13 (Mystara Extra Rules Compendium).
        const unmet = getUnmetMinScores(ClassesDatabase['Arcane Warrior'], currentCharacter);
        options.push({
            value: "Arcane Warrior",
            label: unmet.length ? `Arcane Warrior (needs ${unmet.join(', ')})` : "Arcane Warrior",
            disabled: unmet.length > 0 && currentSub !== 'Arcane Warrior',
        });
    }
    // Class options offered to this class only (Shadow Shaman for a Shadow Elf).
    Object.values(ClassesDatabase).filter(c => c.optionOf === className).forEach(c => {
        const unmet = getUnmetMinScores(c, currentCharacter);
        options.push({
            value: c.name,
            label: unmet.length ? `${c.name} (needs ${unmet.join(', ')})` : c.name,
            disabled: unmet.length > 0 && currentSub !== c.name,
        });
    });

    subSelect.innerHTML = '';
    options.forEach(opt => {
        const optionEl = document.createElement('option');
        optionEl.value = opt.value;
        optionEl.textContent = opt.label;
        if (opt.disabled) optionEl.disabled = true;
        if (opt.value === currentSub) optionEl.selected = true;
        subSelect.appendChild(optionEl);
    });

    if (!options.some(opt => opt.value === currentSub)) {
        currentCharacter.subClass = "";
        subSelect.value = "";
    }
}

const ABILITY_ABBR = { strength: 'Str', intelligence: 'Int', wisdom: 'Wis', dexterity: 'Dex', constitution: 'Con', charisma: 'Cha' };

// Returns e.g. ["Str 10", "Int 13"] for each minimum score the character does not meet.
function getUnmetMinScores(classInfo, character) {
    if (!classInfo || !classInfo.minScores || !character) return [];
    return Object.entries(classInfo.minScores)
        .filter(([key, min]) => (Number(character.abilities?.[key]?.score) || 0) < min)
        .map(([key, min]) => `${ABILITY_ABBR[key]} ${min}`);
}

// Returns e.g. ["Str 13"] for each racial maximum (PC1 Table 1) the character goes over.
function getOverMaxScores(classInfo, character) {
    if (!classInfo || !classInfo.maxScores || !character) return [];
    return Object.entries(classInfo.maxScores)
        .filter(([key, max]) => (Number(character.abilities?.[key]?.score) || 0) > max)
        .map(([key, max]) => `${ABILITY_ABBR[key]} ${max}`);
}

// Warn (without blocking) when the class's entry requirements are not met.
function renderClassRequirements() {
    const el = document.getElementById('class-req-warning');
    if (!el || !currentCharacter) return;
    const classInfo = ClassesDatabase[currentCharacter.characterClass];
    const subInfo = currentCharacter.subClass ? ClassesDatabase[currentCharacter.subClass] : null;
    const notes = [];
    const unmet = getUnmetMinScores(classInfo, currentCharacter);
    if (unmet.length) notes.push(`Requires ${unmet.join(', ')}`);
    const over = getOverMaxScores(classInfo, currentCharacter);
    if (over.length) notes.push(`Maximum ${over.join(', ')}`);
    const subUnmet = getUnmetMinScores(subInfo, currentCharacter);
    if (subUnmet.length) notes.push(`${currentCharacter.subClass} requires ${subUnmet.join(', ')}`);
    [...(classInfo?.restrictions || []), ...(subInfo?.restrictions || [])].forEach(r => notes.push(r));
    el.textContent = notes.join(' · ');
    el.style.display = notes.length ? 'block' : 'none';
    el.style.color = (unmet.length || subUnmet.length || over.length) ? 'var(--warn)' : 'var(--text-muted)';
}
window.renderClassRequirements = renderClassRequirements;

function updateClassStats() {
    const className = document.getElementById('char-class').value;
    const level = clampInt(document.getElementById('char-level').value, 1, 36, 1);
    const classInfo = ClassesDatabase[className];
    if (!classInfo) return; 

    document.getElementById('char-hd').value = "d" + classInfo.hitDie;
    
    if (classInfo.saves && classInfo.saves.length > 0) {
        // Some creature heroes save at another level (a brownie as a halfling of its Hit Dice, a pooka by
        // the higher of level and Hit Dice...), and by stage before 1st level (PC1).
        const stage = (currentCharacter && typeof getCreatureStage === 'function') ? getCreatureStage(currentCharacter) : null;
        const saveLevel = clampInt(stage?.saveLevel ?? classInfo.saveLevels?.[level] ?? level, 1, 36, level);
        let saves0 = classInfo.saves.find(tier => saveLevel >= tier.minLevel && saveLevel <= tier.maxLevel);
        // Own saving throw rows (PC2 pegataur), by stage or level.
        const ownRow = stage?.saves || classInfo.savesByLevel?.[level];
        if (Array.isArray(ownRow) && ownRow.length === 5) {
            const [death, wands, paralysis, breath, spells] = ownRow;
            saves0 = { death, wands, paralysis, breath, spells };
        }
        // A bonus to every save (PC2 nagpa), by stage or level.
        const allBonus = Number(stage ? stage.saveBonus : classInfo.saveBonus?.[level]) || 0;
        if (saves0 && allBonus) saves0 = { death: saves0.death - allBonus, wands: saves0.wands - allBonus, paralysis: saves0.paralysis - allBonus, breath: saves0.breath - allBonus, spells: saves0.spells - allBonus };
        const wisMod = Number(document.getElementById('wis-mod').value) || 0;
        // Worn magic items (ring of protection...) improve every saving throw.
        const zero = { death: 0, wands: 0, paralysis: 0, breath: 0, spells: 0 };
        const itemSave = (currentCharacter && typeof getEquippedSaveBonuses === 'function') ? getEquippedSaveBonuses(currentCharacter) : zero;
        const saves = saves0 && { death: saves0.death - itemSave.death, wands: saves0.wands - itemSave.wands, paralysis: saves0.paralysis - itemSave.paralysis, breath: saves0.breath - itemSave.breath, spells: saves0.spells - itemSave.spells };
        const note = document.getElementById('save-item-note');
        if (note) {
            const labels = { death: 'death ray/poison', wands: 'wands', paralysis: 'paralysis/turn to stone', breath: 'breath', spells: 'spells' };
            const vals = Object.values(itemSave);
            const same = vals.every(v => v === vals[0]);
            const text = !vals.some(Boolean) ? '' : same ? `Includes +${vals[0]} from magic items worn.`
                : `Includes from magic items worn: ${Object.entries(itemSave).filter(([, v]) => v).map(([k, v]) => `+${v} ${labels[k]}`).join(', ')}.`;
            note.textContent = text; note.style.display = text ? 'block' : 'none';
        }

        if (saves) {
            document.getElementById('save-death').value = Math.max(2, saves.death);
            document.getElementById('save-wands').value = Math.max(2, saves.wands);
            document.getElementById('save-paralysis').value = Math.max(2, saves.paralysis);
            document.getElementById('save-breath').value = Math.max(2, saves.breath);
            document.getElementById('save-spells').value = Math.max(2, saves.spells - wisMod);
            
            if (currentCharacter) {
                if (!currentCharacter.savingThrows) currentCharacter.savingThrows = {};
                currentCharacter.savingThrows.deathRayPoison = Math.max(2, saves.death);
                currentCharacter.savingThrows.magicWands = Math.max(2, saves.wands);
                currentCharacter.savingThrows.paralysisTurnToStone = Math.max(2, saves.paralysis);
                currentCharacter.savingThrows.dragonBreath = Math.max(2, saves.breath);
                currentCharacter.savingThrows.rodStaffSpell = Math.max(2, saves.spells - wisMod);
            }
        }
    }
    
    const thac0Table = (currentCharacter && getThac0TableFor(currentCharacter)) || classInfo.thac0;
    if (thac0Table && thac0Table.length > 0) {
        // Index directly: a THAC0 of 0 (Fighter/Dwarf 30-31) is a real value, not "missing".
        const stage = currentCharacter ? getCreatureStage(currentCharacter) : null;
        const thac0Value = stage ? stage.thac0 : thac0Table[level];
        if (thac0Value !== undefined) {
            document.getElementById('combat-thac0').value = thac0Value;
            if (currentCharacter) currentCharacter.thac0 = thac0Value;
        } else {
            console.warn(`No THAC0 for ${className} level ${level}`);
        }
    }

    updateClassFeaturesDisplay();
    renderClassRequirements();
    refreshOrnaments();
    // Natural armour (centaur stages, mystics) depends on class and XP.
    if (typeof syncPaperdollUI === 'function' && currentCharacter) { try { syncPaperdollUI(); } catch (e) { console.error(e); } }

    const headerFormula = document.getElementById('header-hp-formula');
    if (headerFormula && typeof getHpFormula === 'function') {
        headerFormula.innerText = getHpFormula(currentCharacter);
    }

    if (typeof syncWeaponFeatsUI === 'function') syncWeaponFeatsUI();
    if (typeof renderCombatManoeuvres === 'function') renderCombatManoeuvres();
    if (typeof renderArcana === 'function') { try { renderArcana(); } catch (e) { console.error(e); } }
}

function saveChanges() {
    if (!currentCharacter) return;

    currentCharacter.name = document.getElementById('char-name').value;
    currentCharacter.characterClass = document.getElementById('char-class').value;
    currentCharacter.level = clampInt(document.getElementById('char-level').value, 1, 36, 1);
    currentCharacter.alignment = document.getElementById('char-alignment').value;
    currentCharacter.experiencePoints = readXp('char-xp');

    normalizeCharacter(currentCharacter);
    currentCharacter.abilities.strength.score = clampInt(document.getElementById('str-score').value, 3, 18, 10);
    currentCharacter.abilities.strength.modifier = calculateModifier(currentCharacter.abilities.strength.score);
    currentCharacter.abilities.intelligence.score = clampInt(document.getElementById('int-score').value, 3, 18, 10);
    currentCharacter.abilities.intelligence.modifier = calculateModifier(currentCharacter.abilities.intelligence.score);
    currentCharacter.abilities.wisdom.score = clampInt(document.getElementById('wis-score').value, 3, 18, 10);
    currentCharacter.abilities.wisdom.modifier = calculateModifier(currentCharacter.abilities.wisdom.score);
    currentCharacter.abilities.dexterity.score = clampInt(document.getElementById('dex-score').value, 3, 18, 10);
    currentCharacter.abilities.dexterity.modifier = calculateModifier(currentCharacter.abilities.dexterity.score);
    currentCharacter.abilities.constitution.score = clampInt(document.getElementById('con-score').value, 3, 18, 10);
    currentCharacter.abilities.constitution.modifier = calculateModifier(currentCharacter.abilities.constitution.score);
    currentCharacter.conDrain = clampInt(document.getElementById('con-drain')?.value, 0, 18, 0);
    applyConDrain(currentCharacter);
    currentCharacter.abilities.charisma.score = clampInt(document.getElementById('cha-score').value, 3, 18, 10);
    currentCharacter.abilities.charisma.modifier = calculateModifier(currentCharacter.abilities.charisma.score);
    if (typeof applyItemAbilityEffects === 'function') applyItemAbilityEffects(currentCharacter);   // worn items that change scores

    currentCharacter.armorClass = Number(document.getElementById('combat-ac').value);
    currentCharacter.thac0 = Number(document.getElementById('combat-thac0').value);
    
    if (!currentCharacter.hitPoints) currentCharacter.hitPoints = {};
    currentCharacter.hitPoints.current = Number(document.getElementById('hp-current').value);
    currentCharacter.hitPoints.maximum = Number(document.getElementById('hp-max').value);

    if (!currentCharacter.combatDetails) currentCharacter.combatDetails = {};
    currentCharacter.combatDetails.tempHp = Number(document.getElementById('hp-temp').value) || 0;
    { const raw = document.getElementById('ac-base').value; currentCharacter.combatDetails.baseArmor = (raw === '' || !Number.isFinite(Number(raw))) ? 9 : Number(raw); }
    currentCharacter.combatDetails.initBonus = Number(document.getElementById('init-bonus').value) || 0;
    const loadVal = document.getElementById('movement-load').value;
    currentCharacter.combatDetails.movementBase = loadVal === '' ? 120 : Number(loadVal);

    if (!currentCharacter.savingThrows) currentCharacter.savingThrows = {};
    currentCharacter.savingThrows.deathRayPoison = Math.max(2, Number(document.getElementById('save-death').value));
    currentCharacter.savingThrows.magicWands = Math.max(2, Number(document.getElementById('save-wands').value));
    currentCharacter.savingThrows.paralysisTurnToStone = Math.max(2, Number(document.getElementById('save-paralysis').value));
    currentCharacter.savingThrows.dragonBreath = Math.max(2, Number(document.getElementById('save-breath').value));
    currentCharacter.savingThrows.rodStaffSpell = Math.max(2, Number(document.getElementById('save-spells').value));

    currentCharacter.subClass = document.getElementById('char-subclass').value;
    currentCharacter.subClassLevel = Number(document.getElementById('char-sublevel').value) || 1;
    currentCharacter.subClassXP = readXp('char-subxp');
    currentCharacter.arcaneWarriorStartLevel = Number(document.getElementById('char-arcane-start').value) || 9;
    currentCharacter.deity = document.getElementById('char-deity').value;

    if (typeof currentCharacter.id !== 'string' || !UUID_RE.test(currentCharacter.id)) {
        currentCharacter.id = newCharacterId();
    }
    // Snapshot now, so a later edit or character switch cannot change what this save writes.
    const snapshot = JSON.parse(JSON.stringify(currentCharacter));
    const oldFilename = currentFileName;
    // Ask the main process to keep the version on disk as a restore point first.
    const keepRestorePoint = Boolean(window.__forceRestorePoint);
    window.__forceRestorePoint = false;
    const charRef = currentCharacter;

    // Saves run one at a time, in order, so two writes of the same file never overlap.
    saveQueue = saveQueue
        .then(() => window.api.saveCharacter({ data: snapshot, oldFilename, snapshot: keepRestorePoint }))
        .then(result => {
            if (result && currentCharacter === charRef && currentFileName !== result.filename) {
                currentFileName = result.filename;
                loadRoster();
            }
        })
        .catch(err => {
            console.error('Save failed:', err);
            showSaveError(`Could not save ${snapshot.name || 'character'}: ${err?.message || err}`);
        });
    return saveQueue;
}

let saveQueue = Promise.resolve();
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function newCharacterId() {
    if (window.crypto && typeof window.crypto.randomUUID === 'function') return window.crypto.randomUUID();
    const b = window.crypto.getRandomValues(new Uint8Array(16));
    b[6] = (b[6] & 0x0f) | 0x40; b[8] = (b[8] & 0x3f) | 0x80;
    const h = [...b].map(x => x.toString(16).padStart(2, '0')).join('');
    return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(16, 20)}-${h.slice(20)}`;
}

function showSaveError(message) {
    let el = document.getElementById('save-error-toast');
    if (!el) {
        el = document.createElement('div');
        el.id = 'save-error-toast';
        el.style.cssText = 'position: fixed; bottom: 16px; right: 16px; max-width: 360px; z-index: 9999; background: var(--danger); color: #FFF8EC; padding: 10px 14px; border-radius: 2px; font-size: 0.85rem; cursor: pointer;';
        el.title = 'Click to dismiss';
        el.onclick = () => el.remove();
        document.body.appendChild(el);
    }
    el.textContent = message;
}

const ABILITY_KEYS = ['strength', 'intelligence', 'wisdom', 'dexterity', 'constitution', 'charisma'];

// Fill in missing structures and recompute ability modifiers from scores,
// so an old or hand-edited file cannot crash saving or show stale modifiers.
function normalizeCharacter(char) {
    if (!char || typeof char !== 'object') return char;
    if (!char.characterClass && typeof char.class === 'string') char.characterClass = char.class;
    if (!char.abilities || typeof char.abilities !== 'object') char.abilities = {};
    if (!Array.isArray(char.chronicle)) char.chronicle = [];
    ABILITY_KEYS.forEach(key => {
        const a = char.abilities[key];
        const score = clampInt(a && typeof a === 'object' ? a.score : a, 3, 18, 10);
        char.abilities[key] = { score, modifier: calculateModifier(score) };
    });
    char.level = clampInt(char.level, 1, 36, 1);
    // Only creature heroes with a stage below 0 XP (young centaur) may have negative XP.
    const lowestXp = Math.min(0, ...((ClassesDatabase[char.characterClass]?.preStages || []).map(s => s.xp)));
    char.experiencePoints = Math.max(lowestXp, Number(char.experiencePoints) || 0);
    if (!char.hitPoints || typeof char.hitPoints !== 'object') char.hitPoints = { current: 8, maximum: 8 };
    if (!char.savingThrows || typeof char.savingThrows !== 'object') char.savingThrows = {};
    if (!char.combatDetails || typeof char.combatDetails !== 'object') char.combatDetails = {};
    char.conDrain = clampInt(char.conDrain, 0, 18, 0);
    applyConDrain(char);
    sanitizeIds(char);
    return char;
}

// Compendium "Level Drain -> Constitution Drain": drained points lower CON (and so the
// CON modifier used for hit points). CON 0 means death. The hit points lost from a
// lower CON modifier are shown so the player can reduce Max HP.
function applyConDrain(char) {
    if (!char || !char.abilities || !char.abilities.constitution) return;
    const score = typeof getEffectiveScore === 'function' ? getEffectiveScore(char, 'constitution') : char.abilities.constitution.score;
    const drain = clampInt(char.conDrain, 0, 18, 0);
    const effective = Math.max(0, score - drain);
    const baseMod = calculateModifier(score);
    const mod = effective > 0 ? calculateModifier(effective) : -3;
    char.abilities.constitution.modifier = mod;

    const modEl = document.getElementById('con-mod');
    if (modEl && document.getElementById('con-score')) modEl.value = mod;
    const note = document.getElementById('con-drain-note');
    if (!note) return;
    if (drain <= 0) { note.style.display = 'none'; note.textContent = ''; return; }
    const hitDice = Math.min(clampInt(char.level, 1, 36, 1), 9);
    const hpLoss = Math.max(0, (baseMod - mod) * hitDice);
    note.textContent = effective <= 0
        ? 'Constitution 0: the character dies.'
        : `Effective CON ${effective}${hpLoss ? ` · reduce Max HP by ${hpLoss}` : ''}`;
    note.style.display = 'block';
}
window.applyConDrain = applyConDrain;

// Ids are placed inside inline onclick="fn('id')" handlers, so they must be
// plain word characters. Anything else (e.g. from a hand-edited or shared file)
// is rewritten, and every reference to it is updated to match.
function sanitizeIds(char) {
    const clean = id => String(id ?? '').replace(/[^\w-]/g, '_');
    const remap = {};
    ['bagsOfHolding', 'mounts'].forEach(key => {
        if (!Array.isArray(char[key])) return;
        char[key].forEach(entry => {
            if (!entry || typeof entry !== 'object') return;
            const safe = clean(entry.id);
            if (safe !== entry.id) { remap[entry.id] = safe; entry.id = safe; }
        });
    });
    if (Array.isArray(char.inventory)) {
        char.inventory.forEach(item => {
            if (item && remap[item.location] !== undefined) item.location = remap[item.location];
        });
    }
    // Arcana and dominion lists also put their ids in onclick handlers.
    const cleanList = list => { if (Array.isArray(list)) list.forEach(e => { if (e && typeof e === 'object') e.id = clean(e.id); }); };
    if (char.arcana && typeof char.arcana === 'object') {
        cleanList(char.arcana.research);
        if (char.arcana.mentor && typeof char.arcana.mentor === 'object') cleanList(char.arcana.mentor.spells);
        if (char.arcana.craft && typeof char.arcana.craft === 'object') cleanList(char.arcana.craft.book);
    }
    cleanList(char.companions);
    if (char.calendar && typeof char.calendar === 'object') { cleanList(char.calendar.timers); cleanList(char.calendar.events); }
    if (char.campaignNotes && typeof char.campaignNotes === 'object') {
        cleanList(char.campaignNotes.journalEntries);
        cleanList(char.campaignNotes.npcs);
        cleanList(char.campaignNotes.factions);
    }
    if (char.dominion && typeof char.dominion === 'object') {
        cleanList(char.dominion.resources);
        cleanList(char.dominion.officials);
    }
    const book = char.spellbook;
    if (book && typeof book === 'object') {
        const spellRemap = {};
        if (Array.isArray(book.customSpells)) {
            book.customSpells.forEach(sp => {
                if (!sp || typeof sp !== 'object') return;
                const safe = clean(sp.id);
                if (safe !== sp.id) { spellRemap[sp.id] = safe; sp.id = safe; }
            });
        }
        if (Array.isArray(book.knownSpellIds)) book.knownSpellIds = book.knownSpellIds.map(clean);
        if (book.preparedSpells && typeof book.preparedSpells === 'object') {
            const fixed = {};
            Object.entries(book.preparedSpells).forEach(([k, v]) => { fixed[clean(spellRemap[k] ?? k)] = v; });
            book.preparedSpells = fixed;
        }
    }
}
window.normalizeCharacter = normalizeCharacter;

function loadCharacterToUI(char) {
    currentCharacter = char ? normalizeCharacter(char) : char;
    if (!char) return;
    migrateLegacyEquipment(char);

    safeSetVal('char-name', char.name || "Unknown");
    safeSetVal('char-class', char.characterClass || "Fighter");
    safeSetVal('char-level', char.level || 1);
    safeSetVal('char-subclass', char.subClass || "");
    safeSetVal('char-sublevel', char.subClassLevel || 1);
    safeSetVal('char-arcane-start', char.arcaneWarriorStartLevel || 9);
    if (char.deity && GlobalDeitiesDatabase[char.deity]?.noClerics) populateDeitiesDropdown(char.deity);
    safeSetVal('char-deity', char.deity || "");
    safeSetVal('char-alignment', char.alignment || "Neutral");
    writeXp('char-xp', char.experiencePoints || 0);
    writeXp('char-subxp', char.subClassXP || 0);

    if (char.abilities) {
        safeSetVal('str-score', char.abilities.strength?.score ?? 10);
        safeSetVal('str-mod', char.abilities.strength?.modifier ?? 0);
        safeSetVal('int-score', char.abilities.intelligence?.score ?? 10);
        safeSetVal('int-mod', char.abilities.intelligence?.modifier ?? 0);
        safeSetVal('wis-score', char.abilities.wisdom?.score ?? 10);
        safeSetVal('wis-mod', char.abilities.wisdom?.modifier ?? 0);
        safeSetVal('dex-score', char.abilities.dexterity?.score ?? 10);
        safeSetVal('dex-mod', char.abilities.dexterity?.modifier ?? 0);
        safeSetVal('con-score', char.abilities.constitution?.score ?? 10);
        safeSetVal('con-mod', char.abilities.constitution?.modifier ?? 0);
        safeSetVal('cha-score', char.abilities.charisma?.score ?? 10);
        safeSetVal('cha-mod', char.abilities.charisma?.modifier ?? 0);
        if (typeof applyItemAbilityEffects === 'function') { try { applyItemAbilityEffects(char); } catch (e) { console.error(e); } }
    }
    safeSetVal('con-drain', char.conDrain || 0);
    applyConDrain(char);

    safeSetVal('combat-ac', char.armorClass ?? 9);
    safeSetVal('combat-thac0', char.thac0 ?? 19);
    safeSetVal('hp-current', char.hitPoints?.current ?? 8);
    safeSetVal('hp-max', char.hitPoints?.maximum ?? 8);

    const cd = char.combatDetails || {};
    safeSetVal('hp-temp', cd.tempHp || 0);
    safeSetVal('ac-base', cd.baseArmor ?? 9);
    safeSetVal('init-bonus', cd.initBonus || 0);
    if (typeof syncMovementLoadOptions === 'function') syncMovementLoadOptions(char);
    safeSetVal('movement-load', cd.movementBase ?? 120);

    if (char.savingThrows) {
        safeSetVal('save-death', char.savingThrows.deathRayPoison ?? 12);
        safeSetVal('save-wands', char.savingThrows.magicWands ?? 13);
        safeSetVal('save-paralysis', char.savingThrows.paralysisTurnToStone ?? 14);
        safeSetVal('save-breath', char.savingThrows.dragonBreath ?? 15);
        safeSetVal('save-spells', char.savingThrows.rodStaffSpell ?? 16);
    }

    try { updateSubclassOptions(); } catch (e) { console.error(e); }
    try { updateClassStats(); } catch (e) { console.error(e); }
    try { updateXPDisplay(); } catch (e) { console.error(e); }
    try { updateSubClassDisplay(); } catch (e) { console.error(e); }
    try { updateDeityDisplay(); } catch (e) { console.error(e); }
    try { updateCombatVitals(); } catch (e) { console.error(e); }
    try { updateClassFeaturesDisplay(); } catch (e) { console.error(e); }
    try { renderClassProficiencies(); } catch (e) { console.error(e); }
    try { renderCombatManoeuvres(); } catch (e) { console.error(e); }
    try { renderTurnUndead(); } catch (e) { console.error(e); }
    try { renderSpellbooks(); } catch (e) { console.error(e); }
    try { syncWeaponFeatsUI(); } catch (e) { console.error(e); }
    try { syncSkillsUI(); } catch (e) { console.error(e); }
    try { syncInventoryUI(); } catch (e) { console.error(e); }
    try { if (typeof syncPaperdollUI === 'function') syncPaperdollUI(); } catch (e) { console.error(e); }
    try { syncInventoryUI(); } catch (e) { console.error(e); }
    try { if (typeof syncNotesUI === 'function') syncNotesUI(); } catch (e) { console.error(e); }

    try { if (typeof renderChronicle === 'function') renderChronicle(); } catch (e) { console.error(e); }
    try { if (typeof renderArcana === 'function') renderArcana(); } catch (e) { console.error(e); }
    try { if (typeof renderDominion === 'function') renderDominion(); } catch (e) { console.error(e); }
    try { if (typeof renderCompanions === 'function') renderCompanions(); } catch (e) { console.error(e); }
    try { if (typeof renderHoldings === 'function') renderHoldings(); } catch (e) { console.error(e); }
    try { if (typeof renderGameClock === 'function') renderGameClock(); } catch (e) { console.error(e); }

    safeSetText('xp-message', '');
    safeSetText('xp-preview', '');
}

// Слушатели ростера
document.getElementById('character-roster').addEventListener('change', async (e) => {
    if (!e.target.value) {
        document.getElementById('delete-char-btn').style.display = 'none';
        return;
    }
    debouncedSave.flush();                 // write pending edits of the CURRENT character first
    const nextFile = e.target.value;
    let charData;
    try {
        charData = await window.api.loadCharacterData(nextFile);
    } catch (err) {
        console.error('Load failed:', err);
        showSaveError(`Could not open that character: ${err?.message || err}`);
        e.target.value = currentFileName || '';
        return;
    }
    currentFileName = nextFile;            // switch identity only once the new data is in hand
    loadCharacterToUI(charData);
    document.getElementById('delete-char-btn').style.display = 'inline-flex';
});

// "+ New Character" opens the creation guide; it can also make a blank sheet.
document.getElementById('new-char-btn').addEventListener('click', () => {
    if (typeof openCreationGuide === 'function') openCreationGuide();
    else createNewCharacterSheet();
});

function createNewCharacterSheet() {
    debouncedSave.flush();
    currentFileName = null; 
    document.getElementById('delete-char-btn').style.display = 'none';
    const newChar = {
        name: "New Hero", characterClass: "Fighter", level: 1, alignment: "Neutral", experiencePoints: 0,
        abilities: {
            strength: { score: 10, modifier: 0 }, intelligence: { score: 10, modifier: 0 },
            wisdom: { score: 10, modifier: 0 }, dexterity: { score: 10, modifier: 0 },
            constitution: { score: 10, modifier: 0 }, charisma: { score: 10, modifier: 0 }
        },
        armorClass: 9, thac0: 19, hitPoints: { current: 8, maximum: 8 },
        savingThrows: { deathRayPoison: 12, magicWands: 13, paralysisTurnToStone: 14, dragonBreath: 15, rodStaffSpell: 16 }
    };
    loadCharacterToUI(newChar);
    saveChanges();
}
window.createNewCharacterSheet = createNewCharacterSheet;

document.getElementById('delete-char-btn').addEventListener('click', async () => {
    if (!currentFileName || !currentCharacter) return;
    const isConfirmed = await sheetConfirm(`Are you sure you want to delete ${currentCharacter.name}? This cannot be undone.`, 'Delete');
    if (isConfirmed) {
        debouncedSave.cancel();
        await saveQueue;                   // let any in-flight save finish before deleting
        await window.api.deleteCharacter(currentFileName);
        currentCharacter = null;
        currentFileName = null;
        document.getElementById('delete-char-btn').style.display = 'none';
        document.getElementById('char-name').value = "";
        document.querySelectorAll('input.stat-input').forEach(input => input.value = '');
        updateXPDisplay(); 
        loadRoster(); 
    }
});


// Кнопка начисления базового опыта
document.getElementById('add-xp-btn').addEventListener('click', () => {
    if (!currentCharacter) return;
    const monsterXP = Number(document.getElementById('calc-xp-monster').value) || 0;
    const treasureXP = Number(document.getElementById('calc-xp-treasure').value) || 0;
    const baseGainedXP = monsterXP + treasureXP;
    if (baseGainedXP <= 0) return;

    const primeBonus = getPrimeRequisiteBonus(getXpBonusClass(currentCharacter), currentCharacter.abilities);
    const mapBonus = document.getElementById('bonus-map').checked ? 5 : 0;
    const marriedBonus = document.getElementById('bonus-married').checked ? 5 : 0;
    const totalBonusPct = primeBonus + mapBonus + marriedBonus;
    const finalAddedXP = Math.floor(baseGainedXP + (baseGainedXP * (totalBonusPct / 100)));

    const xpTableForChar = getXpTableFor(currentCharacter);
    let msg = `Added ${finalAddedXP} XP.`;
    const levelBefore = Number(currentCharacter.level) || 1;
    const xpBefore = Number(currentCharacter.experiencePoints) || 0;

    if (xpTableForChar) {
        const xpTable = xpTableForChar;
        const currentLvl = currentCharacter.level || 1;
        const nextLvl = currentLvl + 1;
        const capLvl = currentLvl + 2;

        let newXP = currentCharacter.experiencePoints + finalAddedXP;
        if (currentLvl < 36) {
            if (xpTable[capLvl] !== undefined) {
                const maxAllowedXP = xpTable[capLvl] - 1;
                if (newXP > maxAllowedXP) {
                    newXP = maxAllowedXP;
                    msg += ` (Capped: max 1 level per award)`;
                }
            }
            currentCharacter.experiencePoints = newXP;
            if (currentCharacter.experiencePoints >= xpTable[nextLvl]) {
                currentCharacter.level = nextLvl;
                document.getElementById('char-level').value = currentCharacter.level;
                msg += ` LEVEL UP! You are now level ${currentCharacter.level}!`;
                updateClassStats();
                updateClassFeaturesDisplay();
                syncWeaponFeatsUI();
                renderCombatManoeuvres();
            }
        } else {
            currentCharacter.experiencePoints = newXP;
        }
    } else {
        currentCharacter.experiencePoints += finalAddedXP;
    }

    writeXp('char-xp', currentCharacter.experiencePoints);
    updateClassStats();
    updateCombatVitals();
    document.getElementById('xp-message').innerText = msg;

    // Record the award in the adventure log, then the level-up if there was one.
    const sourceEl = document.getElementById('calc-xp-source');
    const source = sourceEl ? sourceEl.value.trim() : '';
    const credited = (Number(currentCharacter.experiencePoints) || 0) - xpBefore;
    const parts = [];
    if (monsterXP) parts.push(`${monsterXP.toLocaleString('en-US')} monsters`);
    if (treasureXP) parts.push(`${treasureXP.toLocaleString('en-US')} treasure`);
    const bonusTxt = totalBonusPct ? ` ${totalBonusPct > 0 ? '+' : ''}${totalBonusPct}% bonus` : '';
    const capTxt = credited < finalAddedXP ? ` (capped at ${credited.toLocaleString('en-US')}: one level per award)` : '';
    addChronicleEntry('xp', `${source ? source + ': ' : ''}+${finalAddedXP.toLocaleString('en-US')} XP (${parts.join(' + ')}${bonusTxt})${capTxt}. Total ${Number(currentCharacter.experiencePoints).toLocaleString('en-US')}.`,
        { source, monster: monsterXP, treasure: treasureXP, bonusPct: totalBonusPct, awarded: finalAddedXP, credited, total: currentCharacter.experiencePoints });
    if (sourceEl) sourceEl.value = '';
    const levelAfter = Number(currentCharacter.level) || 1;
    if (levelAfter > levelBefore) openLevelUpDialog(levelBefore, levelAfter);
    document.getElementById('calc-xp-monster').value = '';
    document.getElementById('calc-xp-treasure').value = '';
    document.getElementById('xp-preview').innerText = ''; 
    updateXPDisplay(); 
    saveChanges();
});

// Кнопка начисления опыта подкласса
document.getElementById('sub-add-xp-btn').addEventListener('click', () => {
    if (!currentCharacter || !currentCharacter.subClass) return;
    const monsterXP = Number(document.getElementById('sub-calc-xp-monster').value) || 0;
    const treasureXP = Number(document.getElementById('sub-calc-xp-treasure').value) || 0;
    const baseGainedXP = monsterXP + treasureXP;
    if (baseGainedXP <= 0) return;

    const primeBonus = getPrimeRequisiteBonus(currentCharacter.subClass, currentCharacter.abilities);
    const mapBonus = document.getElementById('sub-bonus-map').checked ? 5 : 0;
    const marriedBonus = document.getElementById('sub-bonus-married').checked ? 5 : 0;
    const totalBonusPct = primeBonus + mapBonus + marriedBonus;
    const finalAddedXP = Math.floor(baseGainedXP + (baseGainedXP * (totalBonusPct / 100)));

    const classInfo = ClassesDatabase[currentCharacter.subClass];
    let msg = `Added ${finalAddedXP} Sub-XP.`;
    const subLevelBefore = Number(currentCharacter.subClassLevel) || 1;
    const subXpBefore = Number(currentCharacter.subClassXP) || 0;

    if (classInfo && classInfo.xpTable) {
        const xpTable = classInfo.xpTable;
        const currentSubLvl = currentCharacter.subClassLevel || 1;
        const nextSubLvl = currentSubLvl + 1;
        const capSubLvl = currentSubLvl + 2;

        let newSubXP = (currentCharacter.subClassXP || 0) + finalAddedXP;
        if (currentSubLvl < 36) {
            if (xpTable[capSubLvl] !== undefined) {
                const maxAllowedSubXP = xpTable[capSubLvl] - 1;
                if (newSubXP > maxAllowedSubXP) {
                    newSubXP = maxAllowedSubXP;
                    msg += ` (Sub-XP capped)`;
                }
            }
            // GAZ13: a shaman's level can never exceed the character's regular level.
            const mainLvl = Number(currentCharacter.level) || 1;
            if (classInfo.maxLevelIsMain && nextSubLvl > mainLvl && xpTable[nextSubLvl] !== undefined && newSubXP >= xpTable[nextSubLvl]) {
                newSubXP = xpTable[nextSubLvl] - 1;
                msg += ` (Capped: ${currentCharacter.subClass} level cannot exceed your ${currentCharacter.characterClass} level)`;
            }
            currentCharacter.subClassXP = newSubXP;
            if (currentCharacter.subClassXP >= xpTable[nextSubLvl]) {
                currentCharacter.subClassLevel = nextSubLvl;
                document.getElementById('char-sublevel').value = currentCharacter.subClassLevel;
                msg += ` SUB-CLASS LEVEL UP!`;
                updateSubClassDisplay();
                updateClassFeaturesDisplay();
            }
        } else {
            currentCharacter.subClassXP = newSubXP;
        }
    } else {
        currentCharacter.subClassXP = (currentCharacter.subClassXP || 0) + finalAddedXP;
    }

    writeXp('char-subxp', currentCharacter.subClassXP);
    document.getElementById('sub-xp-message').innerText = msg;
    {
        const credited = (Number(currentCharacter.subClassXP) || 0) - subXpBefore;
        const capTxt = credited < finalAddedXP ? ` (capped at ${credited.toLocaleString('en-US')})` : '';
        addChronicleEntry('subxp', `${currentCharacter.subClass}: +${finalAddedXP.toLocaleString('en-US')} XP${totalBonusPct ? ` (${totalBonusPct > 0 ? '+' : ''}${totalBonusPct}% bonus)` : ''}${capTxt}. Total ${Number(currentCharacter.subClassXP).toLocaleString('en-US')}.`,
            { awarded: finalAddedXP, credited, bonusPct: totalBonusPct, total: currentCharacter.subClassXP });
        const subLevelAfter = Number(currentCharacter.subClassLevel) || 1;
        if (subLevelAfter > subLevelBefore) {
            addChronicleEntry('level', `${currentCharacter.subClass} level ${subLevelBefore} → ${subLevelAfter}.`, { subClass: currentCharacter.subClass, from: subLevelBefore, to: subLevelAfter });
        }
    }
    document.getElementById('sub-calc-xp-monster').value = '';
    document.getElementById('sub-calc-xp-treasure').value = '';
    document.getElementById('sub-xp-preview').innerText = ''; 
    updateSubClassDisplay(); 
    updateClassFeaturesDisplay();   // shaman spells unlock at 1,000 shaman XP
    debouncedSave();
});

// Глобальные слушатели ввода
document.addEventListener('input', (e) => {
    if (!currentCharacter || e.target.id === 'character-roster') return;

    if (e.target.id.endsWith('-score')) {
        const statPrefix = e.target.id.split('-')[0];
        // Scores are 3-18; an out-of-range entry is treated as the nearest legal score.
        const newScore = clampInt(e.target.value, 3, 18, 10);
        const newMod = calculateModifier(newScore);
        document.getElementById(`${statPrefix}-mod`).value = newMod;

        const statMap = { 'str': 'strength', 'int': 'intelligence', 'wis': 'wisdom', 'dex': 'dexterity', 'con': 'constitution', 'cha': 'charisma' };
        if (!currentCharacter.abilities) currentCharacter.abilities = {};
        if (!currentCharacter.abilities[statMap[statPrefix]]) currentCharacter.abilities[statMap[statPrefix]] = {};
        
        currentCharacter.abilities[statMap[statPrefix]].score = newScore;
        currentCharacter.abilities[statMap[statPrefix]].modifier = newMod;
        if (statPrefix === 'con') applyConDrain(currentCharacter);
        if (typeof applyItemAbilityEffects === 'function') applyItemAbilityEffects(currentCharacter);
        refreshOrnaments();

        updateSubclassOptions();
        renderClassRequirements();
        if (statPrefix === 'wis' || statPrefix === 'int') {
                updateClassStats();
                renderSpellbooks();
                if (statPrefix === 'int' && typeof syncSkillsUI === 'function') {
                    syncSkillsUI();
                }
            }
        if (statPrefix === 'dex' || statPrefix === 'con') updateCombatVitals();
        if (statPrefix === 'str' || statPrefix === 'dex') {
                if (typeof renderWeaponFeats === 'function') renderWeaponFeats();
            }
    }

    if (e.target.id === 'con-drain') {
        currentCharacter.conDrain = clampInt(e.target.value, 0, 18, 0);
        applyConDrain(currentCharacter);
        refreshOrnaments();
        updateCombatVitals();
    }

    if (['hp-current', 'hp-max', 'hp-temp', 'ac-base', 'init-bonus'].includes(e.target.id)) {
        updateCombatVitals();
    }

    if (e.target.id === 'char-level') {
        currentCharacter.level = clampInt(e.target.value, 1, 36, 1);
        if (ClassesDatabase[currentCharacter.subClass]?.maxLevelIsMain && (Number(currentCharacter.subClassLevel) || 1) > currentCharacter.level) {
            currentCharacter.subClassLevel = currentCharacter.level;
            safeSetVal('char-sublevel', currentCharacter.level);
            if (typeof updateSubClassDisplay === 'function') updateSubClassDisplay();
        }
        updateSubclassOptions();
        // Never lower the XP the player has earned: only raise it to the new level's
        // minimum if it is below it (typing "12" passes through "1" on the way).
        const xpTable = getXpTableFor(currentCharacter);
        // At 1st level keep whatever XP the character has (creature heroes may be below 1st level).
        const levelMinimum = (xpTable && currentCharacter.level > 1) ? (xpTable[currentCharacter.level] ?? 0) : -Infinity;
        if ((Number(currentCharacter.experiencePoints) || 0) < levelMinimum) {
            currentCharacter.experiencePoints = levelMinimum;
            writeXp('char-xp', levelMinimum);
        }
        updateClassStats();
        updateClassFeaturesDisplay();
        renderCombatManoeuvres();
        if (typeof syncSkillsUI === 'function') {
                syncSkillsUI();
        }
    }

    if (e.target.id === 'char-arcane-start') {
        currentCharacter.arcaneWarriorStartLevel = Number(e.target.value) || 9;
        updateClassFeaturesDisplay();
    }

    if (e.target.id === 'char-sublevel') {
        const subMax = ClassesDatabase[currentCharacter.subClass]?.maxLevelIsMain ? (Number(currentCharacter.level) || 1) : 36;
        currentCharacter.subClassLevel = clampInt(e.target.value, 1, subMax, 1);
        if (String(currentCharacter.subClassLevel) !== String(e.target.value)) e.target.value = currentCharacter.subClassLevel;
        const subTable = currentCharacter.subClass ? ClassesDatabase[currentCharacter.subClass]?.xpTable : null;
        const subMinimum = subTable ? (subTable[currentCharacter.subClassLevel] ?? 0) : 0;
        if ((Number(currentCharacter.subClassXP) || 0) < subMinimum) {
            currentCharacter.subClassXP = subMinimum;
            writeXp('char-subxp', subMinimum);
        }
        updateSubClassDisplay();
        updateClassFeaturesDisplay();
    }

    if (e.target.id === 'char-subxp') {
        currentCharacter.subClassXP = readXp('char-subxp');
        if (typeof updateSubClassDisplay === 'function') updateSubClassDisplay();
        updateClassFeaturesDisplay();
    }

    if (e.target.id === 'char-xp') {
        currentCharacter.experiencePoints = readXp('char-xp');
        const levelTable = getXpTableFor(currentCharacter);
        if (levelTable) {
            while (currentCharacter.level < 36 && currentCharacter.experiencePoints >= levelTable[currentCharacter.level + 1]) {
                currentCharacter.level++;
                document.getElementById('char-level').value = currentCharacter.level;
            }
        }
        updateClassStats();                  // THAC0, HD and AC can change with XP (creature stages)
        updateCombatVitals();
    }

    updateXPDisplay();
    updateXPPreview();

    if (e.target.classList.contains('stat-input') || e.target.type === 'checkbox') {
        debouncedSave();
    }
});

document.addEventListener('change', (e) => {
    if (e.target.id === 'character-roster') return;

    if (e.target.id === 'char-class') {
        currentCharacter.characterClass = e.target.value;
        updateSubclassOptions();
        if (!hasDivineCasting(currentCharacter)) {
            currentCharacter.deity = "";
            safeSetVal('char-deity', "");
        }
        updateSubClassDisplay();
        updateClassStats();
        updateXPDisplay();
        updateDeityDisplay();
        updateClassFeaturesDisplay();
        renderClassProficiencies();
        updateCombatVitals();
        renderCombatManoeuvres();
        syncWeaponFeatsUI();
        debouncedSave();
    }

    if (e.target.id === 'char-subclass') {
        const leavingFixed = getClassOption(currentCharacter)?.fixedDeity;
        currentCharacter.subClass = e.target.value;
        if (leavingFixed && !getClassOption(currentCharacter)?.fixedDeity && currentCharacter.deity === leavingFixed) {
            currentCharacter.deity = "";
            safeSetVal('char-deity', "");
        }
        updateClassStats();
        renderClassRequirements();
        updateXPDisplay();
        if (currentCharacter.subClass && !currentCharacter.subClassLevel) {
            currentCharacter.subClassLevel = 1;
            currentCharacter.subClassXP = 0;
        }
        updateSubClassDisplay();
        updateDeityDisplay();
        updateClassFeaturesDisplay();
        updateCombatVitals();
        renderCombatManoeuvres();
        syncWeaponFeatsUI();
        debouncedSave();
    }

    if (e.target.id === 'char-deity') {
        currentCharacter.deity = e.target.value;
        updateClassFeaturesDisplay();
        renderClassProficiencies();
        renderSpellbooks();
        if (typeof renderWeaponFeatsGrid === 'function') try { renderWeaponFeatsGrid(); } catch (err) { console.error(err); }
        updateDeityDisplay();
        const warn = currentCharacter.deity ? deityAlignmentWarning(currentCharacter.deity, currentCharacter.alignment) : '';
        if (warn && hasDivineCasting(currentCharacter)) sheetAlert(warn + ' (Codex Immortalis)');
    }
    if (e.target.id === 'char-alignment') { currentCharacter.alignment = e.target.value; updateDeityDisplay(); }

    if (e.target.id === 'movement-load') updateCombatVitals();
    if (e.target.id === 'weapon-rank-select') updateWeaponCostPreview();
    if (e.target.classList.contains('stat-input') || e.target.type === 'checkbox') debouncedSave(); 
});

const levelInput = document.getElementById('char-level');
    if (levelInput) {
        levelInput.addEventListener('input', () => {
            syncWeaponFeatsUI();
            renderCombatManoeuvres();
            if (typeof syncSkillsUI === 'function') {
                syncSkillsUI();
            }
        });
    }

async function initApp() {
    try {
        const getDbFn = window.api.getClassesDB || window.api.getClassesDb;
        if (typeof getDbFn === 'function') ClassesDatabase = await getDbFn();

        const getSpellsFn = window.api.getSpellsDB || window.api.getSpellsDb;
        if (typeof getSpellsFn === 'function') GlobalSpellsDatabase = await getSpellsFn();

        const getDeitiesFn = window.api.getDeitiesDB || window.api.getDeitiesDb;
        if (typeof getDeitiesFn === 'function') GlobalDeitiesDatabase = await getDeitiesFn();

        const getWeaponsFn = window.api.getWeaponsDB || window.api.getWeaponsDb;
        if (typeof getWeaponsFn === 'function') GlobalWeaponsDatabase = await getWeaponsFn();
    } catch (e) {
        console.error("Initialization error:", e);
    }

    syncWeaponFeatsUI();
    populateDeitiesDropdown();
    await loadRoster();
}

window.switchTab = switchTab;
initApp();

// ЭКСПОРТ В JSON
function exportCharacterJSON() {
    if (!currentCharacter) {
        alert('No character loaded to export!');
        return;
    }

    // Принудительно сохраняем актуальные значения из полей перед выгрузкой
    if (typeof saveChanges === 'function') saveChanges();

    const rawName = currentCharacter.name || 'Hero';
    const safeName = rawName.replace(/[^a-z0-9а-яё_-]/gi, '_').toLowerCase();
    const level = currentCharacter.level || 1;
    const fileName = `${safeName}_lvl${level}_becmi.json`;

    const jsonString = JSON.stringify(currentCharacter, null, 2);
    const blob = new Blob([jsonString], { type: 'application/json' });
    const downloadUrl = URL.createObjectURL(blob);

    const anchor = document.createElement('a');
    anchor.href = downloadUrl;
    anchor.download = fileName;
    document.body.appendChild(anchor);
    anchor.click();
    document.body.removeChild(anchor);
    URL.revokeObjectURL(downloadUrl);
}

// ИМПОРТ ИЗ JSON
function triggerImportJSON() {
    const fileInput = document.getElementById('import-json-file');
    if (fileInput) {
        fileInput.value = '';
        fileInput.click();
    }
}

function handleImportFile(event) {
    const file = event.target?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
        try {
            const text = e.target?.result;
            if (typeof text !== 'string') return;
            const importedData = JSON.parse(text);

            // Базовая валидация структуры листа персонажа BECMI
            if (!importedData || typeof importedData !== 'object' || (!importedData.characterClass && !importedData.class)) {
                alert('Import Error: The selected file does not appear to be a valid BECMI character sheet.');
                return;
            }

            // Imported sheets always become a NEW character with a new id,
            // so importing can never overwrite an existing sheet.
            debouncedSave.flush();
            delete importedData.id;
            currentFileName = null;
            loadCharacterToUI(importedData);
            await saveChanges();

            alert(`Successfully imported "${importedData.name || 'Hero'}"!`);
        } catch (err) {
            console.error('Failed to parse JSON file:', err);
            alert('Import Error: Invalid or corrupted JSON file.');
        }
    };
    reader.readAsText(file);
}

window.exportCharacterJSON = exportCharacterJSON;
window.triggerImportJSON = triggerImportJSON;
window.handleImportFile = handleImportFile;