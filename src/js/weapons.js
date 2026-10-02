const WEAPON_FEAT_COST = { 'N': 0, 'B': 1, 'S': 2, 'E': 3, 'M': 4, 'G': 5 };


function setTargetOpponentMode(mode) {
    window.currentOpponentMode = mode;
    document.getElementById('target-mode-armed')?.classList.toggle('on', mode === 'armed');
    document.getElementById('target-mode-unarmed')?.classList.toggle('on', mode !== 'armed');
    syncWeaponFeatsUI();
}

function getTotalWeaponFeats(character) {
    if (!character) return 0;
    const className = character.characterClass || 'Fighter';
    const lvl = Number(character.level) || 1;
    const classData = window.ClassesDatabase[className];

    const martialFeatLevels = [3, 6, 9, 11, 15, 19, 23, 27, 30, 33, 36];
    const standardFeatLevels = [3, 6, 9, 11, 15, 23, 30, 36];
    const isMartial = (className === 'Fighter' || className === 'Dwarf');

    const start = classData?.weaponFeatsProgression?.start || (isMartial ? 4 : 2);
    const gainLevels = classData?.weaponFeatsProgression?.gainLevels || (isMartial ? martialFeatLevels : standardFeatLevels);

    let total = start;
    gainLevels.forEach(gainLvl => {
        if (lvl >= gainLvl) total++;
    });
    return total;
}

function getSpentWeaponFeats(character) {
    if (!character || !Array.isArray(character.weaponFeats)) return 0;
    // Every trained weapon counts, including ones missing from the weapons database.
    return character.weaponFeats.reduce((spent, item) => spent + (WEAPON_FEAT_COST[item.rank] || 0), 0);
}

function syncWeaponFeatsUI() {
    if (!window.currentCharacter) return;
    if (!Array.isArray(window.currentCharacter.weaponFeats)) {
        window.currentCharacter.weaponFeats = [];
    }

    // Feats whose weapon id is not in the database are kept (and shown as unknown)
    // rather than deleted, so renaming a database entry cannot destroy saved data.

    const total = getTotalWeaponFeats(window.currentCharacter);
    const spent = getSpentWeaponFeats(window.currentCharacter);
    const inTraining = window.currentCharacter.weaponTraining?.active ? 1 : 0;
    const available = total - spent - inTraining;

    window.safeSetText('wf-total-badge', total);
    window.safeSetText('wf-spent-badge', spent);
    const availBadge = document.getElementById('wf-avail-badge');
    if (availBadge) {
        availBadge.innerText = available;
        availBadge.style.color = available < 0 ? 'var(--danger)' : (available === 0 ? 'var(--text-muted)' : 'var(--good)');
    }

    renderWeaponFeatsGrid();
    if (typeof renderTrainingPanel === 'function') renderTrainingPanel();
    if (typeof window.renderCombatManoeuvres === 'function') window.renderCombatManoeuvres();
}

function renderWeaponFeatsGrid() {
    const grid = document.getElementById('weapon-feats-grid');
    if (!grid || !window.currentCharacter) return;

    grid.innerHTML = '';
    const weapons = window.currentCharacter.weaponFeats || [];
    // Mystics need the Unarmed Strikes feat for their martial arts (Dark Dungeons, Chapter 4 and 6).
    const isMystic = window.currentCharacter.characterClass === 'Mystic';
    if (isMystic && !weapons.some(w => w.weaponId === 'unarmed_strikes')) {
        const note = document.createElement('div');
        note.className = 'ledger-row mystic-unarmed-note';
        note.innerHTML = `<div class="ledger-note" style="grid-column: 1 / -1; display: flex; flex-wrap: wrap; gap: 8px; align-items: center; color: var(--warn);">
            Mystic martial arts (Strike to Kill and Strike to Stun) use the Unarmed Strikes weapon feat, which this mystic does not have.
            <button type="button" class="btn btn-sm btn-accent" onclick="addMysticUnarmedFeat()">Add Unarmed Strikes (Basic)</button></div>`;
        grid.appendChild(note);
    }
    if (weapons.length === 0) {
        if (!isMystic) grid.innerHTML = '<div class="ledger-note" style="padding: 12px 0;">No weapons trained yet. Use “+ Train Weapon” to spend a weapon feat.</div>';
        return;
    }

    const strMod = Number(window.currentCharacter.abilities?.strength?.modifier) || 0;
    const dexMod = Number(window.currentCharacter.abilities?.dexterity?.modifier) || 0;
    const baseThac0 = Number(window.currentCharacter.thac0) || 19;
    const mode = window.currentOpponentMode || 'armed';

    let renderedCount = 0;
    weapons.forEach((item, index) => {
        const weaponData = window.GlobalWeaponsDatabase[item.weaponId];
        if (!weaponData) {
            const unknown = document.createElement('div');
            unknown.className = 'ledger-row';
            unknown.style.cssText = 'grid-template-columns: 1fr auto;';
            unknown.innerHTML = `
                <div style="font-size: 0.85rem; color: var(--danger);">Unknown weapon <code>${escapeHtml(item.weaponId)}</code> (${escapeHtml(item.rank)}) — not in the weapons database</div>
                <button onclick="removeWeaponFeat(${index})" style="background: transparent; border: none; color: var(--danger); cursor: pointer; font-size: 0.85rem;" title="Untrain Weapon" aria-label="Untrain weapon">${getIcon('close', 15)}</button>
            `;
            grid.appendChild(unknown);
            return;
        }

        renderedCount++;
        const tierData = (weaponData[mode] && weaponData[mode][item.rank]) ? weaponData[mode][item.rank] : weaponData[mode]['B'];
        const isMissile = weaponData.type === 'missile';

        // Проверка надетого в руку оружия из Paperdoll
        const mainWeaponItem = window.currentCharacter.paperdoll?.mainHand;
        // Link the held item to this feat by weapon id; fall back to an exact name match
        // for items saved before ids were stored (never a substring, which matched every sword).
        const isHoldingThisWeapon = Boolean(mainWeaponItem) && (
            mainWeaponItem.weaponId
                ? mainWeaponItem.weaponId === item.weaponId
                : weaponNameMatches(mainWeaponItem.name, weaponData.name)
        );
        const magicWeaponBonus = (isHoldingThisWeapon && Number(mainWeaponItem.magicBonus)) ? Number(mainWeaponItem.magicBonus) : 0;

        // Archer (Compendium): missile bonus with bows unless wearing plate/suit armour,
        // plus +1 when using a magic missile weapon.
        let archerBonus = 0;
        if (window.currentCharacter.characterClass === 'Archer' && isMissile) {
            const lvl = Number(window.currentCharacter.level) || 1;
            const armourAC = window.currentCharacter.paperdoll?.armor?.baseAC;
            const inPlate = armourAC !== undefined && Number(armourAC) <= 3;
            if (!inPlate && ['bow_long', 'bow_short'].includes(item.weaponId)) {
                archerBonus += lvl >= 13 ? 4 : lvl >= 10 ? 3 : lvl >= 7 ? 2 : lvl >= 4 ? 1 : 0;
            }
            if (isHoldingThisWeapon && magicWeaponBonus > 0) archerBonus += 1;
        }

        const finalToHitBonus = tierData.toHit + (isMissile ? dexMod : strMod) + magicWeaponBonus + archerBonus;
        const weaponThac0 = baseThac0 - finalToHitBonus;

        let finalDamage = tierData.damage;
        if (!isMissile && strMod !== 0) {
            finalDamage += (strMod > 0 ? ` + ${strMod}` : ` - ${Math.abs(strMod)}`);
        }
        if (magicWeaponBonus !== 0) {
            finalDamage += (magicWeaponBonus > 0 ? ` + ${magicWeaponBonus} (mag)` : ` - ${Math.abs(magicWeaponBonus)} (curse)`);
        }
        if (archerBonus > 0) finalDamage += ` + ${archerBonus} (archer)`;

        // Mystic: Unarmed Strikes can strike to stun (the feat's damage) or to kill (Table 4-8 damage,
        // Strength bonus, extra attacks, no knockout). Same to-hit bonus either way.
        let damageHtml = escapeHtml(finalDamage);
        let mysticNote = '';
        if (isMystic && item.weaponId === 'unarmed_strikes') {
            const mt = window.ClassesDatabase['Mystic']?.mysticTable;
            const lvl = Math.min(36, Math.max(1, Number(window.currentCharacter.level) || 1));
            const kill = (mt?.strikeToKillDamage?.[lvl] || '1d4') + (strMod > 0 ? ` + ${strMod}` : strMod < 0 ? ` - ${Math.abs(strMod)}` : '');
            const attacks = mt?.strikeToKillAttacks?.[lvl] || 1;
            damageHtml = `<span class="mystic-strike"><span class="eyebrow">Kill</span> ${escapeHtml(kill)}${attacks > 1 ? ` <span class="mystic-x">×${attacks}</span>` : ''}</span>`
                + `<span class="mystic-strike"><span class="eyebrow">Stun</span> ${escapeHtml(finalDamage)}</span>`;
            mysticNote = `Strike to kill: ${attacks} attack${attacks > 1 ? 's' : ''}/round, no knockout. Strike to stun: knockout, off-hand as the feat. Choose before initiative.`;
        }

        const isLevel1 = (Number(window.currentCharacter.level) || 1) === 1;
        const rankOrder = ['B', 'S', 'E', 'M', 'G'];
        const currRankIdx = rankOrder.indexOf(item.rank);

        const RANK_NAMES = { N: 'Unskilled', B: 'Basic', S: 'Skilled', E: 'Expert', M: 'Master', G: 'Grand Master' };
        const downBtnHtml = currRankIdx > 0
            ? `<button type="button" class="icon-btn" onclick="downgradeWeaponFeat(${index})" title="Lower rank" aria-label="Lower ${escapeHtml(weaponData.name)} rank">${getIcon('down', 15)}</button>`
            : '';
        const direct = typeof trainingDirectEdit === 'function' ? trainingDirectEdit() : true;
        const trainingThis = window.currentCharacter.weaponTraining?.active?.weaponId === item.weaponId;
        const canRaise = !isLevel1 && currRankIdx < rankOrder.length - 1;
        const nextName = canRaise ? RANK_NAMES[rankOrder[currRankIdx + 1]] : '';
        // Two ways up: train (Dark Dungeons Chapter 11) or just set the rank.
        const trainBtn = canRaise && !direct && !trainingThis
            ? `<button type="button" class="icon-btn" onclick="upgradeWeaponFeat(${index})" title="Train to ${nextName}" aria-label="Train ${escapeHtml(weaponData.name)} to ${nextName}">${getIcon('up', 15)}</button>` : '';
        const directBtn = canRaise
            ? `<button type="button" class="icon-btn" onclick="upgradeWeaponFeat(${index}, true)" title="Raise to ${nextName} without training" aria-label="Raise ${escapeHtml(weaponData.name)} to ${nextName} without training">+1</button>` : '';
        const upBtnHtml = (trainingThis ? `<span class="tag" style="color: var(--arcane);" title="In training">training</span>` : trainBtn) + directBtn;

        const isAllowedByClass = canCharacterUseWeapon(weaponData, window.currentCharacter);
        const isPatronWeapon = isPatronWeaponFor(weaponData, window.currentCharacter);
        const tags = [];
        if (isPatronWeapon) tags.push(`<span class="tag" style="color: var(--gilt);" title="Favoured weapon of your patron">${getIcon('star', 11)} Patron</span>`);
        if (isHoldingThisWeapon && magicWeaponBonus !== 0) tags.push(`<span class="tag" style="color: ${magicWeaponBonus > 0 ? 'var(--info)' : 'var(--danger)'};">${magicWeaponBonus > 0 ? `+${magicWeaponBonus} magic` : `${magicWeaponBonus} cursed`}</span>`);
        if (isHoldingThisWeapon && mainWeaponItem.enemyBonus) tags.push(`<span class="tag" style="color: var(--info);" title="Total bonus to attack and damage against these foes">+${Number(mainWeaponItem.enemyBonus.bonus)} vs ${escapeHtml(mainWeaponItem.enemyBonus.name)}</span>`);
        if (isHoldingThisWeapon && Array.isArray(mainWeaponItem.talents)) mainWeaponItem.talents.forEach(t => tags.push(`<span class="tag" style="color: var(--arcane);">${escapeHtml(t)}</span>`));
        if (!isAllowedByClass) tags.push(`<span class="tag" style="color: var(--danger);" title="This weapon violates your class restrictions">Prohibited</span>`);

        // Two-handed weapons cannot be used with a shield. The bastard sword may still be
        // used one-handed (Compendium: no shield while it is used two-handed).
        const hasShield = Boolean(window.currentCharacter.paperdoll?.offHand?.isShield);
        if (hasShield && weaponData.type === '2h-melee') tags.push(`<span class="tag" style="color: var(--warn);" title="Two-handed weapon: remove the shield to use it">Needs both hands</span>`);
        if (hasShield && weaponData.type === 'versatile') tags.push(`<span class="tag" style="color: var(--warn);" title="With a shield this weapon can only be used one-handed">One-handed only (shield)</span>`);

        const specialParts = [];
        if (tierData.acBonus) specialParts.push(`${tierData.acBonus} AC`);
        if (tierData.deflect) specialParts.push(`Deflect ${tierData.deflect}`);
        if (tierData.special) specialParts.push(tierData.special);
        if (tierData.range) specialParts.push(`Range ${tierData.range}`);

        const row = document.createElement('div');
        row.className = 'ledger-row';
        row.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 3px; min-width: 0;">
                <span class="ledger-name" style="color: ${isAllowedByClass ? 'var(--text-main)' : 'var(--danger)'};">${escapeHtml(weaponData.name)} ${isHoldingThisWeapon && mainWeaponItem.isCursed ? getIcon('skull', 14) : ''}</span>
                ${tags.length ? `<span style="display: flex; flex-wrap: wrap; gap: 4px;">${tags.join('')}</span>` : ''}
            </div>
            <div class="rank-cell">
                ${downBtnHtml}
                <span class="rank-seal" title="${RANK_NAMES[item.rank] || item.rank}">${escapeHtml(item.rank)}</span>
                ${upBtnHtml}
            </div>
            <div class="ledger-num">${finalToHitBonus >= 0 ? '+' + finalToHitBonus : finalToHitBonus}</div>
            <div class="ledger-num rubric">${weaponThac0}</div>
            <div class="ledger-num" style="font-size: 1.1rem;">${damageHtml}</div>
            <div class="ledger-note">${specialParts.length || mysticNote ? escapeHtml([...specialParts, mysticNote].filter(Boolean).join(' · ')) : '—'}</div>
            <div class="ledger-actions"><button type="button" class="icon-btn danger" onclick="removeWeaponFeat(${index})" title="Untrain weapon" aria-label="Untrain ${escapeHtml(weaponData.name)}">${getIcon('close', 15)}</button></div>
        `;
        grid.appendChild(row);
    });
}

// "Sword, Short" matches "Short Sword", "short sword +1", "Sword, Short" — but not "Sword, Normal".
function weaponNameMatches(itemName, dbName) {
    const words = str => String(str || '').toLowerCase().replace(/[+-]\d+/g, '').split(/[^a-z]+/).filter(Boolean).sort().join(' ');
    return words(itemName) !== '' && words(itemName) === words(dbName);
}

// A patron's favoured weapons are listed like "Short swords, Clubs".
// Each entry must name this exact weapon (plural "s" ignored), so "Short swords"
// favours "Sword, Short" but not every weapon with "sword" in its name.
function isPatronWeaponFor(weaponData, character) {
    const deity = character && character.deity ? window.GlobalDeitiesDatabase?.[character.deity] : null;
    return Boolean(deity && weaponListMatches(deity.weapons, weaponData));
}

// A weapon the patron also allows (Codex: "allowed all bludgeoning weapons and short sword").
function isPatronAllowedWeapon(weaponData, character) {
    const deity = character && character.deity ? window.GlobalDeitiesDatabase?.[character.deity] : null;
    return Boolean(deity && weaponListMatches(deity.allowedWeapons, weaponData));
}

// Codex weapon names that the Rules Cyclopedia list calls something else.
const PATRON_WEAPON_SYNONYMS = {
    'longsword': 'Sword, Normal', 'long sword': 'Sword, Normal', 'broadsword': 'Sword, Normal', 'sword': 'Sword, Normal',
    'gladius': 'Sword, Short', 'quarterstaff': 'Staff', 'warhammer': 'Hammer, War', 'war hammer': 'Hammer, War',
    'battleaxe': 'Axe, Battle', 'battle axe': 'Axe, Battle', 'hand axe': 'Axe, Hand', 'morning star': 'Morningstar',
    'short spear': 'Spear', 'short spears': 'Spear', 'half spear': 'Spear', 'knife': 'Dagger', 'stiletto': 'Dagger',
    'long bow': 'Bow, Long', 'longbow': 'Bow, Long', 'short bow': 'Bow, Short', 'shortbow': 'Bow, Short',
    'two handed sword': 'Sword, Two-Handed', 'two-handed sword': 'Sword, Two-Handed', 'blowpipe': 'Blowgun, Small',
};
function weaponListMatches(list, weaponData) {
    if (!list || !weaponData) return false;
    return String(list).split(',').some(raw => {
        const entry = raw.trim();
        const syn = PATRON_WEAPON_SYNONYMS[entry.toLowerCase()];
        if (syn) return weaponNameMatches(syn, weaponData.name);
        if (!entry) return false;
        const singular = entry.replace(/(\w+?)(es|s)\b/gi, (m, stem, suf) => (suf.toLowerCase() === 'es' && /(ss|x|sh|ch)$/i.test(stem)) ? stem : (suf.toLowerCase() === 's' ? stem : m.slice(0, -1)));
        // A single generic word ("Swords", "bows") covers that whole family: Sword, Normal / Short / Bastard / Two-Handed.
        const isFamily = /^[a-z]+$/i.test(singular.trim());
        const family = String(weaponData.name).split(',')[0].trim().toLowerCase();
        const words = String(weaponData.name).toLowerCase().split(/[\s,]+/);
        return (isFamily && (family === singular.trim().toLowerCase() || words[words.length - 1] === singular.trim().toLowerCase()))
            || weaponNameMatches(singular, weaponData.name) || weaponNameMatches(entry, weaponData.name)
            || weaponNameMatches(entry.replace(/^(long|short)\s?(\w+)$/i, '$2, $1'), weaponData.name);
    });
}

function showWeaponModalError(msg) {
    const el = document.getElementById('weapon-modal-error');
    if (el) { el.innerText = msg; el.style.display = 'block'; }
}

function clearWeaponModalError() {
    const el = document.getElementById('weapon-modal-error');
    if (el) el.style.display = 'none';
}

function handleWeaponModalBackdrop(event) {
    if (event.target && event.target.id === 'weapon-modal') closeAddWeaponModal();
}

function closeAddWeaponModal() {
    const modal = document.getElementById('weapon-modal');
    if (modal) modal.style.display = 'none';
    clearWeaponModalError();
}

function updateWeaponCostPreview() {
    const rankSelect = document.getElementById('weapon-rank-select');
    const costDisplay = document.getElementById('weapon-cost-preview');
    if (!rankSelect || !costDisplay) return;
    const cost = WEAPON_FEAT_COST[rankSelect.value] || 1;
    costDisplay.innerText = `Feat Cost: ${cost} slot(s)`;
}

function canCharacterUseWeapon(weaponData, character) {
    if (!weaponData || !character) return false;
    let className = character.characterClass || 'Fighter';
    // A class option may narrow the weapons (Shadow Shaman: bludgeoning only, as a Cleric).
    const option = (typeof window.getClassOption === 'function') ? window.getClassOption(character) : null;
    if (option && option.weaponsAs) className = option.weaponsAs;

    // A divine caster may also use the patron's favoured and allowed weapons (Codex Immortalis).
    const divine = className === 'Cleric' || (typeof hasDivineCasting === 'function' && hasDivineCasting(character));
    if (divine && (isPatronWeaponFor(weaponData, character) || isPatronAllowedWeapon(weaponData, character))) return true;

    return Array.isArray(weaponData.useableBy) && weaponData.useableBy.includes(className);
}

function updateRankSelectOptions() {
    const rankSelect = document.getElementById('weapon-rank-select');
    if (!rankSelect || !window.currentCharacter) return;

    const isLevel1 = (Number(window.currentCharacter.level) || 1) === 1;
    const currentVal = rankSelect.value;

    const allRanks = [
        { value: 'B', label: 'Basic (B)' },
        { value: 'S', label: 'Skilled (S)' },
        { value: 'E', label: 'Expert (E)' },
        { value: 'M', label: 'Master (M)' },
        { value: 'G', label: 'Grandmaster (G)' }
    ];

    rankSelect.innerHTML = '';
    allRanks.forEach(r => {
        const opt = document.createElement('option');
        opt.value = r.value;
        opt.textContent = r.label;
        if (isLevel1 && r.value !== 'B') {
            opt.disabled = true;
            opt.textContent += ' [Level 2+]';
        }
        rankSelect.appendChild(opt);
    });

    rankSelect.value = (isLevel1 || !currentVal) ? 'B' : currentVal;
    updateWeaponCostPreview();
}

function populateWeaponSelectOptions() {
    const select = document.getElementById('weapon-select');
    const filterBox = document.getElementById('weapon-ignore-class-filter');
    const showAll = filterBox ? filterBox.checked : false;
    if (!select || !window.currentCharacter) return;

    select.innerHTML = '';
    const weaponEntries = Object.values(window.GlobalWeaponsDatabase || {});
    const trainedIds = (window.currentCharacter.weaponFeats || []).map(w => w.weaponId);
    const className = window.currentCharacter.characterClass || 'Hero';

    if (weaponEntries.length === 0) {
        select.innerHTML = '<option value="">-- No weapons loaded in database --</option>';
        return;
    }

    const candidateWeapons = weaponEntries.filter(w => !trainedIds.includes(w.id));
    const filteredWeapons = candidateWeapons.filter(w => showAll || canCharacterUseWeapon(w, window.currentCharacter));

    if (filteredWeapons.length === 0) {
        select.innerHTML = `<option value="">-- No available weapons for ${className} --</option>`;
        return;
    }

    filteredWeapons.sort((a, b) => a.name.localeCompare(b.name)).forEach(w => {
        const isAllowed = canCharacterUseWeapon(w, window.currentCharacter);
        const isPatron = isPatronWeaponFor(w, window.currentCharacter);
        
        const opt = document.createElement('option');
        opt.value = w.id;
        let label = `${w.name} (${w.cost || 'N/A'})`;
        if (isPatron) label += ' (Patron)';
        else if (!isAllowed) label += ` [Prohibited for ${className}]`;
        opt.textContent = label;
        if (!isAllowed) opt.style.color = 'var(--danger)';
        select.appendChild(opt);
    });
}

function openAddWeaponModal() {
    const modal = document.getElementById('weapon-modal');
    const filterBox = document.getElementById('weapon-ignore-class-filter');
    if (!modal) return;
    if (filterBox) filterBox.checked = false;
    clearWeaponModalError();
    populateWeaponSelectOptions();
    updateRankSelectOptions();
    // Above 1st level: "Begin Training" (to Basic, or the next rank) or "Add Directly" at the chosen rank.
    const training = (Number(window.currentCharacter?.level) || 1) > 1 && typeof trainingDirectEdit === 'function' && !trainingDirectEdit();
    const trainBtn = document.getElementById('weapon-modal-train');
    if (trainBtn) trainBtn.style.display = training ? '' : 'none';
    const saveBtn = document.getElementById('weapon-modal-save');
    if (saveBtn) saveBtn.textContent = training ? 'Add Directly' : 'Learn Weapon';
    const hint = document.getElementById('weapon-modal-hint');
    if (hint) hint.textContent = training ? 'Begin Training: a new weapon trains to Basic, a known one to its next rank. Add Directly: set the chosen rank now, without training.' : '';
    modal.style.display = 'flex';
}

function saveCharacterWeapon(directly = false) {
    if (!window.currentCharacter) return;
    clearWeaponModalError();

    const select = document.getElementById('weapon-select');
    const rankSelect = document.getElementById('weapon-rank-select');
    const weaponId = select ? select.value : '';
    const rank = rankSelect ? rankSelect.value : 'B';
    const isLevel1 = (Number(window.currentCharacter.level) || 1) === 1;

    if (!weaponId) {
        showWeaponModalError('Please choose a valid weapon from the list.');
        return;
    }
    // Above 1st level a feat is spent through training unless ranks are being edited directly.
    if (!directly && !isLevel1 && typeof trainingDirectEdit === 'function' && !trainingDirectEdit()) {
        const known = (window.currentCharacter.weaponFeats || []).find(w => w.weaponId === weaponId);
        closeAddWeaponModal();
        startWeaponTraining(weaponId, known ? null : 'B');
        return;
    }
    if (isLevel1 && rank !== 'B') {
        showWeaponModalError('Level 1 characters can only train Basic (B) proficiency.');
        return;
    }
    if (!Array.isArray(window.currentCharacter.weaponFeats)) {
        window.currentCharacter.weaponFeats = [];
    }

    const existing = window.currentCharacter.weaponFeats.find(w => w.weaponId === weaponId);
    if (existing) {
        if (isLevel1) {
            showWeaponModalError('First-level characters cannot spend multiple feats on the same weapon.');
            return;
        }
        existing.rank = rank;
    } else {
        window.currentCharacter.weaponFeats.push({ weaponId, rank, isEquipped: true });
    }

    closeAddWeaponModal();
    if (typeof window.debouncedSave === 'function') window.debouncedSave();
    syncWeaponFeatsUI();
}

async function removeWeaponFeat(index) {
    if (!window.currentCharacter || !window.currentCharacter.weaponFeats) return;
    const isConfirmed = await sheetConfirm('Remove this weapon feat?', 'Remove');
    if (!isConfirmed) return;
    window.currentCharacter.weaponFeats.splice(index, 1);
    if (typeof window.debouncedSave === 'function') window.debouncedSave();
    syncWeaponFeatsUI();
}

function upgradeWeaponFeat(index, directly = false) {
    if (!window.currentCharacter || !Array.isArray(window.currentCharacter.weaponFeats)) return;
    const item = window.currentCharacter.weaponFeats[index];
    if (!item) return;
    if ((Number(window.currentCharacter.level) || 1) === 1) {
        alert('Characters of 1st level cannot advance weapons beyond Basic proficiency!');
        return;
    }
    const rankProgression = { 'B': 'S', 'S': 'E', 'E': 'M', 'M': 'G' };
    // Normally a new rank is gained by training (Dark Dungeons Chapter 11).
    if (!directly && typeof trainingDirectEdit === 'function' && !trainingDirectEdit()) {
        if (rankProgression[item.rank]) startWeaponTraining(item.weaponId, rankProgression[item.rank]);
        return;
    }
    if (rankProgression[item.rank]) {
        item.rank = rankProgression[item.rank];
        if (typeof window.debouncedSave === 'function') window.debouncedSave();
        syncWeaponFeatsUI();
    }
}

function downgradeWeaponFeat(index) {
    if (!window.currentCharacter || !Array.isArray(window.currentCharacter.weaponFeats)) return;
    const item = window.currentCharacter.weaponFeats[index];
    if (!item) return;
    const rankRegression = { 'G': 'M', 'M': 'E', 'E': 'S', 'S': 'B' };
    if (rankRegression[item.rank]) {
        item.rank = rankRegression[item.rank];
        if (typeof window.debouncedSave === 'function') window.debouncedSave();
        syncWeaponFeatsUI();
    }
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        const modal = document.getElementById('weapon-modal');
        if (modal && modal.style.display === 'flex') closeAddWeaponModal();
    }
});

window.WEAPON_FEAT_COST = WEAPON_FEAT_COST;
window.setTargetOpponentMode = setTargetOpponentMode;
window.getTotalWeaponFeats = getTotalWeaponFeats;
window.getSpentWeaponFeats = getSpentWeaponFeats;
window.syncWeaponFeatsUI = syncWeaponFeatsUI;
window.renderWeaponFeatsGrid = renderWeaponFeatsGrid;
window.openAddWeaponModal = openAddWeaponModal;
window.closeAddWeaponModal = closeAddWeaponModal;
window.saveCharacterWeapon = saveCharacterWeapon;
window.handleWeaponModalBackdrop = handleWeaponModalBackdrop;
window.populateWeaponSelectOptions = populateWeaponSelectOptions;
window.updateWeaponCostPreview = updateWeaponCostPreview;
window.removeWeaponFeat = removeWeaponFeat;
window.upgradeWeaponFeat = upgradeWeaponFeat;
window.downgradeWeaponFeat = downgradeWeaponFeat;

// Give a mystic the Unarmed Strikes feat (Basic) their martial arts rely on.
async function addMysticUnarmedFeat() {
    const ch = window.currentCharacter;
    if (!ch) return;
    if (!Array.isArray(ch.weaponFeats)) ch.weaponFeats = [];
    if (ch.weaponFeats.some(w => w.weaponId === 'unarmed_strikes')) return;
    const free = getTotalWeaponFeats(ch) - getSpentWeaponFeats(ch) - (ch.weaponTraining?.active ? 1 : 0);
    if (free < 1 && !(await sheetConfirm('No weapon feats are free. Add Unarmed Strikes anyway (your feats will show as overspent until you remove another weapon)?', 'Add anyway'))) return;
    ch.weaponFeats.push({ weaponId: 'unarmed_strikes', rank: 'B', isEquipped: true });
    if (typeof debouncedSave === 'function') debouncedSave();
    syncWeaponFeatsUI();
}
window.addMysticUnarmedFeat = addMysticUnarmedFeat;
