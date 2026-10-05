// Fallback text only; classes.ts is the primary source (Dark Dungeons Chapter 4 equipment restrictions).
const CLASS_PROFICIENCIES_DATA = {
    'Fighter': { armor: 'Any armor (Leather, Scale, Chain, Banded, Plate, Suit)', shields: true, weapons: 'Any weapons' },
    'Cleric': { armor: 'Any armor', shields: true, weapons: 'Blunt weapons only (Club, Mace, War Hammer, Throwing Hammer, Sling, Staff, Blackjack)' },
    'Magic-User': { armor: 'None', shields: false, weapons: 'Dagger, Staff, Sling, Whip, Net, Blowgun, Pistol' },
    'Thief': { armor: 'Leather armor only', shields: false, weapons: 'Any one-handed weapon and any missile weapon (no two-handed melee, no shields)' },
    'Dwarf': { armor: 'Any armor', shields: true, weapons: 'Small & medium weapons (no large weapons, see Table 6-1)' },
    'Elf': { armor: 'Any armor', shields: true, weapons: 'Any weapons' },
    'Halfling': { armor: 'Any armor', shields: true, weapons: 'Small weapons only (see Table 6-1)' },
    'Mystic': { armor: 'None', shields: false, weapons: 'Any weapon (unarmed martial arts preferred)' }
};

function renderClassProficiencies() {
    const armorEl = document.getElementById('prof-armor-display');
    const weaponEl = document.getElementById('prof-weapons-display');
    if (!armorEl || !weaponEl || !currentCharacter) return;

    const className = currentCharacter.characterClass || 'Fighter';
    const option = (typeof getClassOption === 'function') ? getClassOption(currentCharacter) : null;
    const dbClassData = option || ((typeof ClassesDatabase !== 'undefined') ? ClassesDatabase[className] : null);
    const localData = CLASS_PROFICIENCIES_DATA[className] || CLASS_PROFICIENCIES_DATA['Fighter'];

    const armorText = (dbClassData && dbClassData.allowedArmor) ? dbClassData.allowedArmor : localData.armor;
    const hasShields = (dbClassData && dbClassData.allowedShields !== undefined) ? dbClassData.allowedShields : localData.shields;
    let weaponsText = (dbClassData && dbClassData.allowedWeapons) ? dbClassData.allowedWeapons : localData.weapons;

    const shieldText = hasShields ? 'Shields permitted' : 'No shields';
    armorEl.innerHTML = `<strong>${armorText}</strong> <span style="color: var(--text-muted);">(${shieldText})</span>`;

    const patron = currentCharacter.deity && GlobalDeitiesDatabase ? GlobalDeitiesDatabase[currentCharacter.deity] : null;
    if (patron && (className === 'Cleric' || hasDivineCasting(currentCharacter))) {
        const text = patron.weaponsText || patron.weapons || '';
        if (text) weaponsText += `<br><span style="color: var(--accent-gold); font-size: 0.8rem;" title="Codex Immortalis: favoured weapon, and the weapons this Immortal also allows">${getIcon('star', 12)} Patron (${escapeHtml(currentCharacter.deity)}): <strong>${escapeHtml(text)}</strong></span>`;
    }

    weaponEl.innerHTML = weaponsText;
}

function updateClassFeaturesDisplay() {
    if (typeof renderDailyUses === 'function') { try { renderDailyUses(); } catch (e) { console.error(e); } }
    const mainList = document.getElementById('main-features-list');
    const subList = document.getElementById('sub-features-list');
    const subCard = document.getElementById('subclass-features-card');

    if (!mainList || !subList || !subCard) return;

    mainList.innerHTML = '';
    subList.innerHTML = '';

    if (!currentCharacter) {
        mainList.innerHTML = '<div style="color: var(--text-muted); font-size: 0.9rem;">Select or create a character to view abilities.</div>';
        subCard.style.display = 'none';
        renderSpellbook({ type: null, effectiveLevel: 0, maxSpellLevel: 0 }, 'spellbook-section');
        renderSpellbook({ type: null, effectiveLevel: 0, maxSpellLevel: 0 }, 'spellbook-section-option');
        return;
    }

    const className = currentCharacter.characterClass || 'Fighter';
    const level = currentCharacter.level || 1;
    const classBadge = document.getElementById('features-class-badge');
    const stage = (typeof getCreatureStage === 'function') ? getCreatureStage(currentCharacter) : null;
    if (classBadge) classBadge.innerText = stage ? `${className} · ${stage.name}` : `${className} · Level ${toRoman(level)}`;

    const classInfo = ClassesDatabase[className];
    if (classInfo && classInfo.features) {
        const combatKeywords = ['smash', 'parry', 'multiple attack'];
        const availableFeatures = classInfo.features.filter(f => 
            level >= f.minLevel && !combatKeywords.some(k => f.name.toLowerCase().includes(k))
        );
        // Level-based values (PC2 gremlin aura, sphinx roar) for the current stage or level.
        const ls = classInfo.levelStats;
        if (ls) {
            const rows = ls.levels || [];
            const vals = stage ? (stage.stats || []) : (rows[Math.min(Number(level) || 1, rows.length - 1)] || []);
            if (vals.length) {
                const row = document.createElement('div');
                row.className = 'note-col';
                row.innerHTML = `<div class="note-col-head"><span class="note-col-title">${escapeHtml(ls.name)}</span><span class="eyebrow">${escapeHtml(stage ? stage.name : 'Level ' + toRoman(level))}</span></div>
                    <div class="note-col-body level-stats">${ls.columns.map((c, i) => `<div><span>${escapeHtml(c)}</span><strong>${escapeHtml(vals[i] ?? '—')}</strong></div>`).join('')}</div>`;
                mainList.appendChild(row);
            }
        }
        if (availableFeatures.length === 0) {
            mainList.innerHTML = '<div class="ledger-note">No abilities unlocked at this level.</div>';
        } else {
            availableFeatures.forEach(f => {
                const row = document.createElement('div');
                row.className = 'note-col';
                row.innerHTML = `
                    <div class="note-col-head">
                        <span class="note-col-title">${escapeHtml(f.name)}</span>
                        <span class="eyebrow">Level ${toRoman(f.minLevel)}</span>
                    </div>
                    <div class="note-col-body">${escapeHtml(f.description)}${f.name === 'Magic Item Use' && classInfo.itemUse ? `<div class="item-use-row">${escapeHtml(itemUseRowText(classInfo, level, stage))}</div>` : ''}</div>
                `;
                mainList.appendChild(row);
            });
        }
    } else {
        mainList.innerHTML = '<div class="ledger-note">No abilities found for this class.</div>';
    }

    const subClass = currentCharacter.subClass;
    const subLevel = currentCharacter.subClassLevel || 1;

    if (!subClass) {
        subCard.style.display = 'none';
    } else {
        subCard.style.display = 'block';
        const subBadge = document.getElementById('features-subclass-badge');
        if (subBadge) {
            if (subClass === 'Arcane Warrior') {
                subBadge.innerText = `${subClass} (Pact Level ${currentCharacter.arcaneWarriorStartLevel || 9})`;
            } else if (subClass === 'Paladin' || subClass === 'Avenger') {
                subBadge.innerText = `${subClass} (Effective Level ${chivalricLevel(currentCharacter.level || 1)})`;
            } else if (ClassesDatabase[subClass]?.sharesMainLevel) {
                subBadge.innerText = `${subClass} (Level ${toRoman(level)})`;
            } else {
                subBadge.innerText = `${subClass} (Level ${subLevel})`;
            }
        }

        const subInfo = ClassesDatabase[subClass];
        if (subInfo && subInfo.features) {
            const featureLevel = subInfo.sharesMainLevel ? level : subLevel;
            const availableSubFeatures = subInfo.features.filter(f => featureLevel >= f.minLevel);
            if (availableSubFeatures.length === 0) {
                subList.innerHTML = '<div class="ledger-note">No sub-class abilities unlocked at this level.</div>';
            } else {
                availableSubFeatures.forEach(f => {
                    const row = document.createElement('div');
                    row.className = 'note-col';
                    row.innerHTML = `
                        <div class="note-col-head">
                            <span class="note-col-title">${escapeHtml(f.name)}</span>
                            <span class="eyebrow">Level ${toRoman(f.minLevel)}</span>
                        </div>
                        <div class="note-col-body">${escapeHtml(f.description)}</div>
                    `;
                    subList.appendChild(row);
                });
            }
        } else {
            subList.innerHTML = '<div class="ledger-note">No abilities found for this sub-class.</div>';
        }
    }

    renderTurnUndead();
    renderThiefSkills();
    renderClassProficiencies();
    renderSpellbooks();
}

// Chevaliers cast and turn "as a cleric of one third the chevalier's level";
// DD's worked example (17th level -> 6th level cleric) means rounding up.
function chivalricLevel(level) {
    return Math.ceil((Number(level) || 0) / 3);
}

// PC2 restricted lists (RC p. 216 "Spells Usable by Shamans / Wokani"; PC2 p. 29 tabi spells):
// [spell type, level, name] for each spell.
const PC2_SPELL_LISTS = {
    shaman: [
        ['divine', 1, 'Cure Light Wounds'], ['divine', 1, 'Detect Magic'], ['divine', 1, 'Light'], ['divine', 1, 'Protection from Evil'],
        ['divine', 2, 'Bless'], ['divine', 2, 'Hold Person'], ['divine', 2, 'Snake Charm'], ['divine', 2, 'Speak with Animal'],
        ['divine', 3, 'Continual Light'], ['divine', 3, 'Cure Blindness'], ['divine', 3, 'Cure Disease'], ['divine', 3, 'Remove Curse'],
        ['divine', 4, 'Cure Serious Wounds'], ['divine', 4, 'Dispel Magic'], ['divine', 4, 'Neutralize Poison'], ['divine', 4, 'Speak with Plants'],
        ['divine', 5, 'Create Food'], ['divine', 5, 'Cure Critical Wounds'], ['divine', 5, 'Dispel Evil'], ['divine', 5, 'Insect Plague'],
        ['divine', 6, 'Cureall'], ['divine', 6, 'Find the Path'], ['divine', 6, 'Speak with Monsters'], ['divine', 6, 'Word of Recall'],
    ],
    wicca: [
        ['arcane', 1, 'Detect Magic'], ['arcane', 1, 'Light'], ['arcane', 1, 'Protection from Evil'], ['arcane', 1, 'Read Languages'], ['arcane', 1, 'Read Magic'], ['arcane', 1, 'Sleep'],
        ['arcane', 2, 'Continual Light'], ['arcane', 2, 'Detect Evil'], ['arcane', 2, 'Detect Invisible'], ['arcane', 2, 'Invisibility'], ['arcane', 2, 'Levitate'], ['arcane', 2, 'Web'],
        ['arcane', 3, 'Clairvoyance'], ['arcane', 3, 'Dispel Magic'], ['arcane', 3, 'Fireball'], ['arcane', 3, 'Fly'], ['arcane', 3, 'Lightning Bolt'], ['arcane', 3, 'Water Breathing'],
        ['arcane', 4, 'Charm Monster'], ['arcane', 4, 'Growth of Plants'], ['arcane', 4, 'Ice Storm/Wall of Ice'], ['arcane', 4, 'Massmorph'], ['arcane', 4, 'Remove Curse'], ['arcane', 4, 'Wall of Fire'],
        ['arcane', 5, 'Animate Dead'], ['arcane', 5, 'Cloudkill'], ['arcane', 5, 'Dissolve'], ['arcane', 5, 'Hold Monster'], ['arcane', 5, 'Passwall'], ['arcane', 5, 'Wall of Stone'],
        ['arcane', 6, 'Death Spell'], ['arcane', 6, 'Move Earth'], ['arcane', 6, 'Projected Image'], ['arcane', 6, 'Reincarnation'], ['arcane', 6, 'Stone to Flesh'], ['arcane', 6, 'Wall of Iron'],
    ],
    tabi: [
        ['arcane', 1, 'Charm Person'], ['arcane', 1, 'Detect Magic'], ['arcane', 1, 'Shield'], ['arcane', 1, 'Ventriloquism'],
        ['arcane', 2, 'ESP'], ['arcane', 2, 'Invisibility'], ['arcane', 2, 'Mirror Image'], ['arcane', 2, 'Phantasmal Force'],
        ['arcane', 3, 'Haste'], ['divine', 3, 'Locate Object'], ['arcane', 3, 'Protection from Normal Missiles'],
        ['arcane', 4, 'Confusion'], ['arcane', 4, 'Dimension Door'], ['arcane', 4, 'Growth of Plants'], ['arcane', 4, 'Hallucinatory Terrain'],
        ['arcane', 5, 'Passwall'], ['druid', 5, 'Pass Plant'],
        ['arcane', 6, 'Projected Image'], ['druid', 6, 'Transport through Plants'],
    ],
};
PC2_SPELL_LISTS.shaman_druid = PC2_SPELL_LISTS.shaman;     // pegataur shamans add every druid spell (below)
function pc2NamedSpells(key) {
    const rows = PC2_SPELL_LISTS[key] || [];
    const all = Object.values(GlobalSpellsDatabase);
    const out = [];
    rows.forEach(([type, level, name]) => {
        const k = spellNameKey(name);
        const s = all.find(x => x.casterType === type && x.level === level && spellNameKey(x.name) === k)
            || all.find(x => x.casterType === type && spellNameKey(x.name) === k);
        if (s) out.push({ ...s, level });
    });
    if (key === 'shaman_druid') all.filter(s => s.casterType === 'druid').forEach(s => out.push(s));
    return out;
}

// One definition of "spells this caster can prepare", shared by the spellbook
// view and the preparation counter so the per-tier slot cap always matches.
function getSpellsForProfile(profile, book, deity) {
    const b = book || {};
    const allCustom = Array.isArray(b.customSpells) ? b.customSpells : [];
    // A class option's own list (Shadow Shaman): only those spells, all known as a cleric knows hers.
    // PC2 named lists (shaman, wicca, tabi), plus a sub-class's extra spells (faenare windsinger).
    if (profile.spellNames) {
        const list = pc2NamedSpells(profile.spellNames);
        const have = new Set(list.map(s => s.id));
        (profile.extraSpellTypes || []).forEach(t => Object.values(GlobalSpellsDatabase)
            .filter(s => s.casterType === t && !have.has(s.id)).forEach(s => { have.add(s.id); list.push(s); }));
        return list;
    }
    if (profile.spellList === 'dryad') {
        // PC1: a dryad casts as a druid (cleric and druid spells) plus the two spells PC1 suggests.
        return Object.values(GlobalSpellsDatabase).filter(s => ['divine', 'druid', 'dryad'].includes(s.casterType));
    }
    if (profile.spellList) {
        const list = Object.values(GlobalSpellsDatabase).filter(s => s.casterType === profile.spellList);
        // Race changes to the list (PC1: leprechauns, sprites and sidhe move or add a few spells).
        const changes = Array.isArray(profile.spellListChanges) ? profile.spellListChanges : [];
        if (!changes.length) return list;
        const out = list.map(s => {
            const ch = changes.find(c => c.name && spellNameKey(c.name) === spellNameKey(s.name));
            return ch ? { ...s, level: ch.level, grantNote: `Level ${ch.level} for this race (normally level ${s.level})` } : s;
        });
        changes.filter(c => c.id && GlobalSpellsDatabase[c.id]).forEach(c => out.push({ ...GlobalSpellsDatabase[c.id], level: c.level }));
        return out;
    }
    const custom = allCustom.filter(c => (c.casterType || 'arcane') === profile.type);
    if (profile.type === 'divine') {
        const divine = Object.values(GlobalSpellsDatabase).filter(s =>
            s.casterType === 'divine' || (s.casterType === 'domain' && s.deity === deity));
        return [...withPatronSpells(divine, deity), ...custom];
    }
    if (profile.type === 'arcane') {
        const known = (b.knownSpellIds || []).map(id => GlobalSpellsDatabase[id]).filter(Boolean);
        return [...known, ...custom];
    }
    return [];
}

// The patron's own prayers (Tome of the Magic of Mystara Vol. 2, Appendix "Additional spells of
// each Immortal"): extra spells at the level that Immortal grants them, some in place of a common
// spell, and for a few Immortals every druid spell up to a level.
const spellNameKey = n => String(n || '').toLowerCase().replace(/\*/g, '').replace(/[^a-z0-9]/g, '');
function withPatronSpells(list, deityName) {
    const deity = deityName && GlobalDeitiesDatabase ? GlobalDeitiesDatabase[deityName] : null;
    if (!deity) return list;
    const extras = Array.isArray(deity.extraSpells) ? deity.extraSpells : [];
    const replaced = new Set(extras.filter(e => e.replaces).map(e => spellNameKey(e.replaces)));
    const out = list.filter(s => !replaced.has(spellNameKey(s.name)));
    const have = new Set(out.map(s => s.id));
    const druidMax = Number(deity.druidSpellLevels) || 0;
    if (druidMax) {
        Object.values(GlobalSpellsDatabase).filter(s => s.casterType === 'druid' && s.level <= druidMax && !have.has(s.id)).forEach(s => {
            have.add(s.id);
            out.push({ ...s, grantedBy: deityName, grantNote: 'Druid spell granted to the clerics of ' + deityName });
        });
    }
    // "Silence" in the appendix is the Rules Cyclopedia's "Silence 15' Radius": don't list it twice.
    const haveNames = out.map(s => spellNameKey(s.name));
    extras.forEach(e => {
        const s = GlobalSpellsDatabase[e.id];
        if (!s || have.has(e.id)) return;
        const k = spellNameKey(s.name);
        if (haveNames.some(n => n === k || (n.startsWith(k) && /^\d/.test(n.slice(k.length))))) return;
        have.add(e.id);
        out.push({ ...s, level: Number(e.level) || s.level, grantedBy: deityName,
            grantNote: 'Granted by ' + deityName + (e.replaces ? ' in place of ' + e.replaces.replace(/\*/g, '') : '') });
    });
    return out;
}

// PC1 fairy item use (S/F/B/U on d%) for the character's level; below 1st level every try fails.
function itemUseRowText(classInfo, level, stage) {
    if (stage) return 'Below 1st level: F 01-00 (such items never work for you yet).';
    const lvl = Math.max(1, Math.min(36, Number(level) || 1));
    const [s, f, b] = classInfo.itemUse[lvl] || classInfo.itemUse[classInfo.itemUse.length - 1];
    const pct = n => n >= 100 ? '00' : String(n).padStart(2, '0');
    const range = (lo, hi) => lo > hi ? '—' : (lo === hi ? pct(lo) : `${pct(lo)}-${pct(hi)}`);
    return `Level ${toRoman(lvl)}: S ${range(1, s)} · F ${range(s + 1, f)} · B ${range(f + 1, b)} · U ${range(b + 1, 100)}`;
}

function getCasterProfile(character) {
    if (!character) return { type: null, effectiveLevel: 0, slots: [] };

    const className = character.characterClass || '';
    const subClass = character.subClass || '';
    const level = Number(character.level) || 1;
    const intScore = (character.abilities && character.abilities.intelligence && character.abilities.intelligence.score !== undefined)
        ? Number(character.abilities.intelligence.score)
        : 10;

    const clericProg = (ClassesDatabase['Cleric'] && ClassesDatabase['Cleric'].spellProgression) || [];
    const mageProg = (ClassesDatabase['Magic-User'] && ClassesDatabase['Magic-User'].spellProgression) || [];

    if (className === 'Fighter' && level >= 9) {
        if (subClass === 'Paladin' || subClass === 'Avenger') {
            const effectiveLevel = chivalricLevel(level);
            const slots = (clericProg[effectiveLevel] || []).slice();
            return { type: 'divine', effectiveLevel, slots };
        }
        if (subClass === 'Arcane Warrior') {
            const startLevel = character.arcaneWarriorStartLevel !== undefined ? Number(character.arcaneWarriorStartLevel) : 9;
            const effectiveLevel = Math.max(1, Math.floor((level - startLevel) / 2) + 1);
            const maxSpellTier = intScore - 10;
            const rawSlots = (mageProg[effectiveLevel] || []).slice();
            const slots = rawSlots.slice(0, Math.max(0, maxSpellTier));
            return { type: 'arcane', effectiveLevel, slots };
        }
    }

    if (className === 'Magic-User' || className === 'Elf') {
        const slots = (mageProg[level] || []).slice();
        return { type: 'arcane', effectiveLevel: level, slots };
    }

    if (className === 'Cleric') {
        const slots = (clericProg[level] || []).slice();
        return { type: 'divine', effectiveLevel: level, slots };
    }

    // Any other class that casts from its own level (Battlecaster, Witch...).
    const ownClass = ClassesDatabase[className];
    if (ownClass && ownClass.casterType && Array.isArray(ownClass.spellProgression)) {
        // Creature heroes below 1st level use their stage's spells (a young hsiao), or none.
        const stage = (typeof getCreatureStage === 'function') ? getCreatureStage(character) : null;
        // A sub-class may change the table (a faenare windsinger keeps rising after 12th level).
        const opt = (typeof getClassOption === 'function') ? getClassOption(character) : null;
        const prog = Array.isArray(opt?.mainSpellProgression) ? opt.mainSpellProgression : ownClass.spellProgression;
        const slots = stage ? (stage.spells || []).slice() : (prog[level] || []).slice();
        const extraSpellTypes = (ownClass.subClassSpells && character.subClass && ownClass.subClassSpells[character.subClass]) || null;
        if (ownClass.spellNames) return { type: ownClass.casterType, effectiveLevel: stage ? (slots.length ? 1 : 0) : level, slots,
            spellNames: ownClass.spellNames, spellList: 'named', extraSpellTypes, slotPools: ownClass.slotPools || null,
            title: ownClass.spellNames === 'tabi' ? 'Tabi Spells' : (extraSpellTypes ? 'Windsinger Spells & Songs' : 'Shaman Spells') };
        // PC1 races cast from their own list: fairy spells (leprechaun, sprite, sidhe), druid spells (dryad).
        return { type: ownClass.casterType, effectiveLevel: stage ? (slots.length ? 1 : 0) : level, slots, spellList: ownClass.spellList || null, spellListChanges: ownClass.spellListChanges || null };
    }

    return { type: null, effectiveLevel: 0, slots: [] };
}

// Every spellbook the character has: the class's own, plus a class option's
// (a Shadow Shaman keeps her elf spells and also prays to Rafiel).
function getCasterProfiles(character) {
    const profiles = [];
    const main = getCasterProfile(character);
    const option = (typeof getClassOption === 'function') ? getClassOption(character) : null;
    // A pegataur wicca stops gaining elf spells (PC2 p. 24).
    if (main.type && !option?.replacesMainSpells) profiles.push({ ...main, key: 'main' });
    if (option && option.casterType && Array.isArray(option.spellProgression)) {
        const level = option.ownXpTrack ? (Number(character.subClassLevel) || 1) : (Number(character.level) || 1);
        const xp = option.ownXpTrack ? (Number(character.subClassXP) || 0) : (Number(character.experiencePoints) || 0);
        const ready = !option.spellsFromXp || xp >= option.spellsFromXp;
        profiles.push({
            key: 'option', type: option.casterType, spellList: option.spellList || (option.spellNames ? 'named' : null), spellNames: option.spellNames || null,
            title: `${option.name} Spells` + (option.fixedDeity ? ` (${option.fixedDeity})` : ''),
            effectiveLevel: ready ? level : 0,
            slots: ready ? (option.spellProgression[level] || []).slice() : [],
            notReadyNote: ready ? '' : (option.spellsNote || `Shaman spells begin at ${option.spellsFromXp.toLocaleString()} shaman XP, after the Test of Rafiel.`),
        });
    }
    return profiles;
}

function getProfileByKey(key) {
    return getCasterProfiles(currentCharacter).find(p => p.key === key) || null;
}

// Draw every spellbook into its own card.
function renderSpellbooks() {
    const profiles = currentCharacter ? getCasterProfiles(currentCharacter) : [];
    const main = profiles.find(p => p.key === 'main');
    const option = profiles.find(p => p.key === 'option');
    renderSpellbook(main || { type: null, slots: [] }, 'spellbook-section');
    renderSpellbook(option || { type: null, slots: [] }, 'spellbook-section-option');
}

// The custom spell being edited (null while creating a new one).
let editingCustomSpellId = null;

function openSpellModal(spellId) {
    const spell = spellId ? ((currentCharacter && currentCharacter.spellbook && currentCharacter.spellbook.customSpells) || []).find(s => s.id === spellId) : null;
    editingCustomSpellId = spell ? spell.id : null;
    document.getElementById('custom-spell-modal').style.display = 'flex';
    const title = document.getElementById('custom-spell-title');
    if (title) title.textContent = spell ? 'Edit Custom Spell' : 'Create Custom Spell';
    const save = document.getElementById('custom-spell-save');
    if (save) save.textContent = spell ? 'Save Changes' : 'Save Spell';
    safeSetVal('new-spell-name', spell ? spell.name || '' : '');
    safeSetVal('new-spell-level', spell ? spell.level || 1 : 1);
    safeSetVal('new-spell-range', spell ? spell.range || '' : '');
    safeSetVal('new-spell-duration', spell ? spell.duration || '' : '');
    safeSetVal('new-spell-effect', spell ? spell.effect || '' : '');
    safeSetVal('new-spell-desc', spell ? spell.description || '' : '');
    showResearchedOption('new-spell-researched', !spell);
}

// "I researched it" on the add-spell windows: only for a wizard who owns a library (GAZ3 p. 66).
function showResearchedOption(id, show) {
    const row = document.getElementById(id + '-row');
    const box = document.getElementById(id);
    const ok = show && typeof libraryCanTakeResearch === 'function' && libraryCanTakeResearch();
    if (row) row.style.display = ok ? 'flex' : 'none';
    if (box) box.checked = false;
}
function researchedOptionChecked(id) {
    const row = document.getElementById(id + '-row');
    return Boolean(row && row.style.display !== 'none' && document.getElementById(id)?.checked);
}

function closeSpellModal() {
    document.getElementById('custom-spell-modal').style.display = 'none';
    editingCustomSpellId = null;
}

function saveCustomSpell() {
    if (!currentCharacter) return;
    const name = document.getElementById('new-spell-name').value.trim();
    const level = Math.min(9, Math.max(1, Math.round(Number(document.getElementById('new-spell-level').value) || 1)));
    const range = document.getElementById('new-spell-range').value.trim();
    const duration = document.getElementById('new-spell-duration').value.trim();
    const effect = document.getElementById('new-spell-effect').value.trim();
    const desc = document.getElementById('new-spell-desc').value.trim();
    
    if (!name) return alert("Spell needs a name!");
    if (!currentCharacter.spellbook) currentCharacter.spellbook = { knownSpellIds: [], customSpells: [], preparedSpells: {} };
    
    if (!Array.isArray(currentCharacter.spellbook.customSpells)) currentCharacter.spellbook.customSpells = [];

    const existing = editingCustomSpellId && currentCharacter.spellbook.customSpells.find(s => s.id === editingCustomSpellId);
    if (existing) {
        // A spell moved to another level can't stay prepared in its old level's slots.
        if (existing.level !== level) {
            const book = currentCharacter.spellbook;
            if (book.preparedSpells) delete book.preparedSpells[existing.id];
            if (book.castSpells) delete book.castSpells[existing.id];
        }
        Object.assign(existing, { name, level, range, duration, effect, description: desc });
        closeSpellModal();
        debouncedSave();
        renderSpellbooks();
        return;
    }

    const profile = getCasterProfile(currentCharacter);
    const casterType = profile.type || 'arcane';

    const newId = 'custom_' + Date.now();
    currentCharacter.spellbook.customSpells.push({
        id: newId,
        name, level, casterType, range, duration, effect, description: desc, isCustom: true
    });
    if (researchedOptionChecked('new-spell-researched') && typeof addResearchedSpellToLibrary === 'function') addResearchedSpellToLibrary(name, level, newId);
    
    closeSpellModal();
    debouncedSave();
    renderSpellbooks();
}

function openCompendiumModal() {
    if (!currentCharacter) return;
    const select = document.getElementById('compendium-select');
    const preview = document.getElementById('compendium-preview');
    const book = currentCharacter.spellbook || { knownSpellIds: [], customSpells: [] };
    const knownIds = book.knownSpellIds || [];

    const availableSpells = Object.values(GlobalSpellsDatabase).filter(s => 
        s.casterType === 'arcane' && !knownIds.includes(s.id)
    ).sort((a, b) => (a.level - b.level) || String(a.name).localeCompare(String(b.name)));

    select.innerHTML = '';
    if (availableSpells.length === 0) {
        select.innerHTML = '<option value="">-- No Spells Available --</option>';
        preview.innerText = 'All compendium spells are already in your spellbook.';
    } else {
        availableSpells.forEach(s => {
            const opt = document.createElement('option');
            opt.value = s.id;
            opt.textContent = `[Tier ${s.level}] ${s.name}`;
            select.appendChild(opt);
        });
        preview.innerText = availableSpells[0].description || '';
    }

    select.onchange = (e) => {
        const spell = GlobalSpellsDatabase[e.target.value];
        preview.innerText = spell ? spell.description : '';
    };

    document.getElementById('compendium-modal').style.display = 'flex';
    showResearchedOption('compendium-researched', true);
}

function closeCompendiumModal() {
    document.getElementById('compendium-modal').style.display = 'none';
}

function addSpellFromCompendium() {
    if (!currentCharacter) return;
    const select = document.getElementById('compendium-select');
    const spellId = select.value;
    if (!spellId) return;

    if (!currentCharacter.spellbook) currentCharacter.spellbook = { knownSpellIds: [], customSpells: [], preparedSpells: {} };
    if (!currentCharacter.spellbook.knownSpellIds) currentCharacter.spellbook.knownSpellIds = [];

    if (!currentCharacter.spellbook.knownSpellIds.includes(spellId)) {
        currentCharacter.spellbook.knownSpellIds.push(spellId);
        const sp = GlobalSpellsDatabase[spellId];
        if (sp && researchedOptionChecked('compendium-researched') && typeof addResearchedSpellToLibrary === 'function') addResearchedSpellToLibrary(sp.name, sp.level, sp.id);
    }

    closeCompendiumModal();
    debouncedSave();
    renderSpellbooks();
}

function renderSpellbook(profile, containerId = 'spellbook-section') {
    const container = document.getElementById(containerId);
    if (!container) return;
    const key = (profile && profile.key) || 'main';

    if (profile && profile.notReadyNote) {
        container.style.display = 'block';
        container.innerHTML = `<div class="panel-head"><h2>${escapeHtml(profile.title || 'Spells')}</h2></div><div class="ledger-note">${escapeHtml(profile.notReadyNote)}</div>`;
        return;
    }

    if (!profile || !profile.type || !profile.slots || profile.slots.length === 0 || Number(profile.effectiveLevel) <= 0) {
        container.style.display = 'none';
        container.innerHTML = '';
        return;
    }

    container.style.display = 'block';
    const title = profile.title || (profile.spellList === 'fairy' ? 'Fairy Spells' : profile.spellList === 'dryad' ? 'Druid Spells'
        : profile.type === 'arcane' ? 'Arcane Spellbook' : 'Divine Prayers');
    const maxSpellLevel = profile.slots.length;
    const book = (currentCharacter && currentCharacter.spellbook) || { knownSpellIds: [], customSpells: [], preparedSpells: {} };
    
    const allSpells = getSpellsForProfile(profile, book, currentCharacter && currentCharacter.deity);

    let tiersHtml = '';
    const spellSort = SPELL_SORTS.some(o => o.value === book.sortBy) ? book.sortBy : 'book';
    const safeSlots = profile.slots || [];
    const prepMap = book.preparedSpells || {};
    const castMap = book.castSpells || {};
    let preparedTotal = 0, castTotal = 0;
    // Spell Combination (GAZ3 Great School course): prepare any mix within the total spell levels.
    const combo = spellCombinationActive(profile);
    const capacity = safeSlots.reduce((sum, n, i) => sum + (Number(n) || 0) * (i + 1), 0);
    const levelsUsed = allSpells.filter(s => s.level <= maxSpellLevel).reduce((sum, s) => sum + (prepMap[s.id] || 0) * s.level, 0);

    for (let lvl = 1; lvl <= maxSpellLevel; lvl++) {
        const slotCount = safeSlots[lvl - 1] || 0;
        const spellsOfLevel = sortSpellList(allSpells.filter(s => s.level === lvl), spellSort, prepMap);
        const totalPreparedInTier = spellsOfLevel.reduce((sum, s) => sum + (prepMap[s.id] || 0), 0);
        const castInTier = spellsOfLevel.reduce((sum, s) => sum + Math.min(castMap[s.id] || 0, prepMap[s.id] || 0), 0);
        preparedTotal += totalPreparedInTier; castTotal += castInTier;
        // Tabi (PC2): spell levels 1-3 and 4-6 each share one pool of spells.
        const pool = Array.isArray(profile.slotPools) ? profile.slotPools.find(([a, b]) => lvl >= a && lvl <= b) : null;
        const poolPrepared = pool ? allSpells.filter(s => s.level >= pool[0] && s.level <= pool[1]).reduce((sum, s) => sum + (prepMap[s.id] || 0), 0) : 0;
        const isTierFull = combo ? levelsUsed + lvl > capacity : pool ? poolPrepared >= slotCount : totalPreparedInTier >= slotCount;
        const slotText = combo ? `Prepared ${totalPreparedInTier}` : pool ? `Levels ${pool[0]}-${pool[1]}: ${poolPrepared} / ${slotCount}` : `Slots: ${totalPreparedInTier} / ${slotCount}`;

        const spellsListHtml = spellsOfLevel.map(s => {
            const count = prepMap[s.id] || 0;
            const cast = Math.min(castMap[s.id] || 0, count);
            // One pip per prepared copy: filled = already cast today.
            const pipsHtml = count > 0
                ? `<span class="cast-pips" onclick="event.stopPropagation();">${Array.from({ length: count }, (_, i) =>
                    `<button type="button" class="cast-pip${i < cast ? ' spent' : ''}" onclick="toggleSpellCast('${s.id}', ${i})" title="${i < cast ? 'Cast — click to un-mark' : 'Prepared — click when cast'}" aria-label="${escapeHtml(s.name)} copy ${i + 1}: ${i < cast ? 'cast' : 'ready'}"></button>`).join('')}</span>`
                : '';
            const allSpent = count > 0 && cast >= count;
            const rangeHtml = s.range ? `<div><span style="color: var(--text-main);">Range:</span> ${escapeHtml(s.range)}</div>` : '';
            const durationHtml = s.duration ? `<div><span style="color: var(--text-main);">Duration:</span> ${escapeHtml(s.duration)}</div>` : '';
            const effectHtml = s.effect ? `<div><span style="color: var(--text-main);">Effect:</span> ${escapeHtml(s.effect)}</div>` : '';
            const metaBlock = (rangeHtml || durationHtml || effectHtml) 
                ? `<div style="margin-bottom: 8px; font-family: var(--font-headings); font-size: 0.85rem; color: var(--text-muted);">${rangeHtml}${durationHtml}${effectHtml}</div>` 
                : '';

            const isDeletable = s.isCustom || (profile.type === 'arcane' && book.knownSpellIds && book.knownSpellIds.includes(s.id));
            const editBtnHtml = (!isSpellbookLocked && s.isCustom)
                ? `<button type="button" onclick="openSpellModal('${s.id}'); event.stopPropagation();" class="spell-edit-btn" title="Edit spell" aria-label="Edit ${escapeHtml(s.name)}">${getIcon('edit', 14)}</button>`
                : '';
            const deleteBtnHtml = (!isSpellbookLocked && isDeletable) 
                ? `<button onclick="deleteSpell('${s.id}', ${s.isCustom}); event.stopPropagation();" style="background: transparent; border: none; color: var(--danger); cursor: pointer; font-size: 0.9rem; display: inline-flex;" title="Remove Spell" aria-label="Remove spell">${getIcon('close', 15)}</button>` 
                : '';

            return `
            <div style="margin-top: 8px; padding-top: 8px; border-top: 1px solid color-mix(in srgb, var(--text-main) 5%, transparent);">
                <div style="display: flex; justify-content: space-between; align-items: center; user-select: none;">
                    <div onclick="toggleSpellDetails('${s.id}')" style="color: ${allSpent ? 'var(--text-muted)' : (count > 0 ? 'var(--accent-gold)' : 'var(--text-main)')}; ${allSpent ? 'text-decoration: line-through;' : ''} font-weight: bold; font-size: 0.9rem; cursor: pointer; flex-grow: 1;">
                        ${escapeHtml(s.name)} ${s.isCustom ? `<span style="color:var(--accent-gold);" title="Custom Spell">${getIcon('star', 12)}</span>` : ''}${s.grantedBy ? `<span class="patron-spell-tag" title="${escapeHtml(s.grantNote || '')}">${getIcon('candle', 11)}</span>` : ''}${pipsHtml}
                    </div>
                    ${editBtnHtml || deleteBtnHtml ? `<span class="spell-row-actions">${editBtnHtml}${deleteBtnHtml}</span>` : ''}
                    <div style="display: flex; align-items: center; gap: 6px; background: var(--inset); padding: 2px 6px; border-radius: 2px; border: 1px solid var(--border-color); margin-left: 8px;" onclick="event.stopPropagation();">
                        <button onclick="adjustPreparedSpell('${s.id}', ${lvl}, -1, ${slotCount}, '${key}')" style="background: transparent; border: none; color: var(--text-muted); cursor: pointer; padding: 0 4px; font-weight: bold;">-</button>
                        <span style="color: ${count > 0 ? 'var(--accent-gold)' : 'var(--text-muted)'}; font-family: monospace; width: 12px; text-align: center;">${count}</span>
                        <button onclick="adjustPreparedSpell('${s.id}', ${lvl}, 1, ${slotCount}, '${key}')" style="background: transparent; border: none; color: ${isTierFull ? 'var(--border-color)' : 'var(--text-muted)'}; cursor: ${isTierFull ? 'default' : 'pointer'}; padding: 0 4px; font-weight: bold;">+</button>
                    </div>
                </div>
                <div id="spell-details-${s.id}" style="display: none; margin-top: 8px; padding-left: 8px; border-left: 2px solid var(--accent-gold-dim);">
                    ${s.grantNote ? `<div class="patron-spell-note">${escapeHtml(s.grantNote)}</div>` : ''}
                    ${metaBlock}
                    <div style="color: var(--text-muted); font-size: 0.8rem; line-height: 1.4; white-space: pre-wrap;">${escapeHtml(s.description)}</div>
                    ${s.source ? `<div class="patron-spell-src">${escapeHtml(s.source)}</div>` : ''}
                </div>
            </div>
            `;
        }).join('');

        tiersHtml += `
            <div style="border: 1px solid ${isTierFull ? 'var(--accent-gold-dim)' : 'var(--border-color)'}; border-radius: 2px; padding: 10px; background: color-mix(in srgb, var(--text-main) 3%, transparent);">
                <div style="display: flex; justify-content: space-between; align-items: baseline; margin-bottom: 4px;">
                    <span class="note-col-title">${['First','Second','Third','Fourth','Fifth','Sixth','Seventh','Eighth','Ninth'][lvl - 1] || lvl} Level</span>
                    <span style="font-size: 0.75rem; color: ${isTierFull ? 'var(--good)' : 'var(--text-muted)'}; font-family: var(--font-ui);">${slotText}${totalPreparedInTier ? ` · ${totalPreparedInTier - castInTier} left` : ''}</span>
                </div>
                ${spellsListHtml}
            </div>
        `;
    }

    const compendiumBtn = (profile.type === 'arcane' && !profile.spellList && !isSpellbookLocked) 
        ? `<button onclick="openCompendiumModal()" style="background: transparent; color: var(--good); border: 1px solid color-mix(in srgb, var(--good) 50%, transparent); border-radius: 2px; padding: 4px 8px; font-size: 0.9rem; cursor: pointer;">+ Compendium</button>` 
        : '';

    const customSpellBtn = (profile.type === 'arcane' && !profile.spellList && !isSpellbookLocked)
        ? `<button onclick="openSpellModal()" style="background: transparent; color: var(--accent-gold); border: 1px solid var(--accent-gold); border-radius: 2px; padding: 4px 8px; font-size: 0.9rem; cursor: pointer;">+ Custom Spell</button>`
        : '';

    container.innerHTML = `
        <div class="panel-head">
            <h2>${title}</h2>
            <div style="display: flex; gap: 8px;">
                <button onclick="toggleSpellbookLock()" style="background: transparent; color: ${isSpellbookLocked ? 'var(--text-muted)' : 'var(--danger)'}; border: 1px solid ${isSpellbookLocked ? 'var(--border-color)' : 'var(--danger)'}; border-radius: 2px; padding: 4px 8px; font-size: 0.9rem; cursor: pointer;">
                    ${isSpellbookLocked ? `${getIcon('lock', 14)} Locked` : `${getIcon('unlock', 14)} Unlocked`}
                </button>
                <button type="button" class="btn btn-sm" onclick="restSpellbook('${key}')" title="After a night's rest: all prepared spells are ready again">Rest</button>
                ${compendiumBtn}
                ${customSpellBtn}
            </div>
        </div>
        <div class="tally spell-tally" style="margin-bottom: 16px;">
            <span>Casts as level <strong>${toRoman(profile.effectiveLevel)}</strong></span>
            <span>Highest spell level <strong>${maxSpellLevel}</strong></span>
            ${combo ? `<span title="Spell Combination: any mix of spell levels up to your total">Spell levels <strong>${levelsUsed} / ${capacity}</strong></span>` : ''}
            ${preparedTotal ? `<span>Spells left today <strong>${preparedTotal - castTotal} / ${preparedTotal}</strong></span>` : ''}
            <label class="spell-sort">Sort <select class="stat-input" onchange="setSpellSort(this.value)" aria-label="Sort spells">${SPELL_SORTS.map(o => `<option value="${o.value}" ${o.value === spellSort ? 'selected' : ''}>${o.label}</option>`).join('')}</select></label>
        </div>
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(200px, 1fr)); gap: 12px;">
            ${tiersHtml}
        </div>
    `;
}

// How the spells inside each level are ordered.
const SPELL_SORTS = [
    { value: 'book', label: 'Book order' },
    { value: 'name', label: 'Name (A–Z)' },
    { value: 'nameDesc', label: 'Name (Z–A)' },
    { value: 'prepared', label: 'Prepared first' },
    { value: 'special', label: 'Custom & patron first' },
];

function sortSpellList(list, mode, prepMap = {}) {
    const byName = (a, b) => String(a.name || '').localeCompare(String(b.name || ''));
    const out = list.slice();
    if (mode === 'name') out.sort(byName);
    else if (mode === 'nameDesc') out.sort((a, b) => byName(b, a));
    else if (mode === 'prepared') out.sort((a, b) => ((prepMap[b.id] || 0) - (prepMap[a.id] || 0)) || byName(a, b));
    else if (mode === 'special') {
        const rank = s => s.isCustom ? 0 : s.grantedBy ? 1 : 2;
        out.sort((a, b) => (rank(a) - rank(b)) || byName(a, b));
    }
    return out;
}

function setSpellSort(mode) {
    if (!currentCharacter) return;
    if (!currentCharacter.spellbook) currentCharacter.spellbook = { knownSpellIds: [], customSpells: [], preparedSpells: {} };
    if (mode === 'book') delete currentCharacter.spellbook.sortBy; else currentCharacter.spellbook.sortBy = mode;
    debouncedSave();
    renderSpellbooks();
}

function spellCombinationActive(profile) {
    if (!profile || profile.type !== 'arcane' || profile.spellList || (profile.key || 'main') !== 'main') return false;
    const school = currentCharacter && currentCharacter.arcana && currentCharacter.arcana.school;
    return Boolean(school && Array.isArray(school.done) && school.done.some(x => x && x.id === 'combination') && school.useCombination !== false);
}

function toggleSpellDetails(spellId) {
    const el = document.getElementById(`spell-details-${spellId}`);
    if (el) el.style.display = (el.style.display === 'none' || el.style.display === '') ? 'block' : 'none';
}

// Mark one prepared copy of a spell as cast (or un-mark it).
function toggleSpellCast(spellId, pipIndex) {
    if (!currentCharacter || !currentCharacter.spellbook) return;
    const book = currentCharacter.spellbook;
    if (!book.castSpells) book.castSpells = {};
    const prepared = (book.preparedSpells || {})[spellId] || 0;
    const cast = Math.min(book.castSpells[spellId] || 0, prepared);
    const next = pipIndex < cast ? pipIndex : Math.min(prepared, pipIndex + 1);
    if (next > 0) book.castSpells[spellId] = next; else delete book.castSpells[spellId];
    debouncedSave();
    renderSpellbooks();
}

// After rest every prepared spell in this book is ready again (preparations are kept).
function restSpellbook(profileKey = 'main') {
    if (!currentCharacter || !currentCharacter.spellbook) return;
    const book = currentCharacter.spellbook;
    const profile = getProfileByKey(profileKey);
    if (!profile || !book.castSpells) return;
    getSpellsForProfile(profile, book, currentCharacter.deity).forEach(s => { delete book.castSpells[s.id]; });
    debouncedSave();
    renderSpellbooks();
}

function toggleSpellbookLock() {
    isSpellbookLocked = !isSpellbookLocked;
    renderSpellbooks();
}

function adjustPreparedSpell(spellId, tier, delta, maxSlots, profileKey = 'main') {
    if (!currentCharacter) return;
    if (!currentCharacter.spellbook) currentCharacter.spellbook = { knownSpellIds: [], customSpells: [], preparedSpells: {} };
    if (!currentCharacter.spellbook.preparedSpells) currentCharacter.spellbook.preparedSpells = {};

    const prepMap = currentCharacter.spellbook.preparedSpells;
    const currentCount = prepMap[spellId] || 0;
    const profile = getProfileByKey(profileKey);
    if (!profile) return;
    const book = currentCharacter.spellbook;
    
    const allSpells = getSpellsForProfile(profile, book, currentCharacter.deity).filter(s => s.level === tier);

    const currentTierPrepared = allSpells.reduce((sum, s) => sum + (prepMap[s.id] || 0), 0);

    if (delta > 0) {
        if (spellCombinationActive(profile)) {
            const capacity = (profile.slots || []).reduce((sum, n, i) => sum + (Number(n) || 0) * (i + 1), 0);
            const used = getSpellsForProfile(profile, book, currentCharacter.deity)
                .filter(s => s.level <= (profile.slots || []).length)
                .reduce((sum, s) => sum + (prepMap[s.id] || 0) * s.level, 0);
            if (used + tier > capacity) return;
        } else if (Array.isArray(profile.slotPools) && profile.slotPools.some(([a, b]) => tier >= a && tier <= b)) {
            const [a, b] = profile.slotPools.find(([lo, hi]) => tier >= lo && tier <= hi);
            const inPool = getSpellsForProfile(profile, book, currentCharacter.deity).filter(s => s.level >= a && s.level <= b)
                .reduce((sum, s) => sum + (prepMap[s.id] || 0), 0);
            if (inPool >= ((profile.slots || [])[a - 1] || 0)) return;
        } else if (currentTierPrepared >= maxSlots) return;
        prepMap[spellId] = currentCount + 1;
    } else if (delta < 0) {
        if (currentCount <= 0) return;
        prepMap[spellId] = currentCount - 1;
        if (prepMap[spellId] === 0) delete prepMap[spellId];
        const castMap = currentCharacter.spellbook.castSpells || {};
        if ((castMap[spellId] || 0) > (prepMap[spellId] || 0)) {
            if (prepMap[spellId]) castMap[spellId] = prepMap[spellId]; else delete castMap[spellId];
        }
    }

    debouncedSave();
    renderSpellbooks();
}

async function deleteSpell(spellId, isCustom) {
    if (!currentCharacter || !currentCharacter.spellbook) return;
    const isConfirmed = await sheetConfirm('Are you sure you want to remove this spell from your spellbook?', 'Remove');
    if (!isConfirmed) return;

    if (isCustom) {
        currentCharacter.spellbook.customSpells = currentCharacter.spellbook.customSpells.filter(s => s.id !== spellId);
    } else {
        if (currentCharacter.spellbook.knownSpellIds) {
            currentCharacter.spellbook.knownSpellIds = currentCharacter.spellbook.knownSpellIds.filter(id => id !== spellId);
        }
    }
    
    if (currentCharacter.spellbook.preparedSpells && currentCharacter.spellbook.preparedSpells[spellId]) {
        delete currentCharacter.spellbook.preparedSpells[spellId];
    }
    
    debouncedSave();
    renderSpellbooks();
}

function getTurningLevel(character) {
    if (!character) return 0;
    const cls = character.characterClass || '';
    const sub = character.subClass || '';
    const lvl = Number(character.level) || 1;
    
    if (cls === 'Cleric') return lvl;
    const option = (typeof getClassOption === 'function') ? getClassOption(character) : null;
    if (option && option.turnsUndead) return option.ownXpTrack ? (Number(character.subClassLevel) || 1) : lvl;   // Shadow Shaman: as a Cleric of her shaman level
    if (cls === 'Fighter' && lvl >= 9 && (sub === 'Paladin' || sub === 'Avenger')) return chivalricLevel(lvl);
    return 0;
}

function renderTurnUndead() {
    const container = document.getElementById('turn-undead-section');
    const grid = document.getElementById('turn-undead-grid');
    const badge = document.getElementById('turn-level-badge');
    if (!container || !grid || !badge) return;

    const turnLvl = getTurningLevel(currentCharacter);
    if (turnLvl <= 0 || !ClassesDatabase['Cleric'] || !ClassesDatabase['Cleric'].turnMatrix) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    badge.innerText = turnLvl;
    grid.innerHTML = '';

    const types = ClassesDatabase['Cleric'].undeadTypes || [];
    const safeLvl = Math.min(36, Math.max(1, turnLvl));
    const matrixRow = ClassesDatabase['Cleric'].turnMatrix[safeLvl] || [];

    types.forEach((undead, index) => {
        const result = matrixRow[index];
        if (!result || result === '-') return;

        let displayResult = '';
        let color = 'var(--text-main)';
        
        // Table 4-2b: a number is the 2d6 roll needed; T turns, D destroys (HD affected: 2d6, 3d6 for D, 4d6 for X).
        let bigText = result, subText = '';
        if (!isNaN(result)) { bigText = `${result}+`; subText = 'Roll 2d6 to turn'; }
        else if (result === 't') { bigText = 'T'; subText = 'Turns automatically'; color = 'var(--good)'; }
        else if (result === 'd') { bigText = 'D'; subText = 'Destroys · 2d6 HD'; color = 'var(--accent-gold)'; }
        else if (result === 'D') { bigText = 'D'; subText = 'Destroys · 3d6 HD'; color = 'var(--accent-gold)'; }
        else if (result === 'X') { bigText = 'D'; subText = 'Destroys · 4d6 HD'; color = 'var(--accent-gold)'; }
        displayResult = bigText;

        grid.innerHTML += `
            <div class="stat-box">
                <span class="name">${escapeHtml(undead)}</span>
                <span class="big" style="color: ${color};">${escapeHtml(bigText)}</span>
                <span class="sub">${escapeHtml(subText)}</span>
            </div>
        `;
    });
}

// Thief-style abilities for every class that has them, as { name, value, note }.
// Thief and Rake use Table 4-9; Mystics their own Table 4-8 column; Bandits and
// Bounty Hunters borrow Thief values at an adjusted level (Mystara Extra Rules Compendium).
function getThiefAbilities(character) {
    const thief = ClassesDatabase['Thief'];
    if (!character || !thief || !thief.thiefSkillsMatrix) return [];
    const cls = character.characterClass || '';
    const lvl = Math.min(36, Math.max(1, Number(character.level) || 1));
    const names = thief.thiefSkillsList || [];
    const at = (skill, thiefLevel) => {
        const row = thief.thiefSkillsMatrix[Math.min(36, Math.max(1, thiefLevel))] || [];
        return row[names.indexOf(skill)];
    };
    const list = [];
    const add = (name, value, note = '') => { if (value !== undefined && value !== '-') list.push({ name, value, note }); };

    if (cls === 'Thief' || cls === 'Rake') {
        names.forEach(n => {
            if (cls === 'Rake' && n === 'Pick Pockets') return;       // rakes do not steal
            add(n, at(n, lvl));
        });
    } else if (cls === 'Mystic') {
        const row = ClassesDatabase['Mystic']?.mysticTable?.thiefAbilities?.[lvl] || [];
        ['Find Traps', 'Remove Traps', 'Climb Walls', 'Move Silently', 'Hide in Shadows'].forEach((n, i) => add(n, row[i]));
    } else if (cls === 'Bandit') {
        add('Climb Walls', at('Climb Walls', lvl));
        add('Hide in Natural Terrain', at('Hide in Shadows', lvl), 'Camouflage outdoors');
        add('Find Outdoor Traps', at('Find Traps', lvl), 'Outdoors only; one try per trap');
        add('Remove Outdoor Traps', at('Remove Traps', lvl), 'Outdoors only; one try per trap');
        add('Cover Tracks', Math.min(100, 50 + 3 * (lvl - 1)), `Up to ${lvl} turn(s) per day`);
        add('Track (outdoors)', 75, '+2%/creature, -10%/day, -25%/hr rain');
    } else if (ClassesDatabase[cls]?.thiefSkillTable) {
        // PC2 tabi and gremlin: their own percentages by stage and level.
        const tbl = ClassesDatabase[cls].thiefSkillTable;
        const stage = (typeof getCreatureStage === 'function') ? getCreatureStage(character) : null;
        const row = stage ? (stage.thiefSkills || []) : (tbl.levels[lvl] || []);
        tbl.names.forEach((n, i) => add(n, row[i]));
    } else if (Array.isArray(ClassesDatabase[cls]?.thiefSkillsAs)) {
        // PC1: a rogue sidhe as a thief of its level; a woodrake by its own steps (and by stage while growing).
        const stage = (typeof getCreatureStage === 'function') ? getCreatureStage(character) : null;
        const tl = stage ? (Number(stage.thiefLevel) || 0) : (Number(ClassesDatabase[cls].thiefSkillsAs[lvl]) || 0);
        if (tl > 0) names.forEach(n => add(n, at(n, tl), tl !== lvl || stage ? `As a level ${tl} Thief` : ''));
    } else if (cls === 'Bounty Hunter' && lvl >= 2) {
        const half = Math.max(1, Math.floor(lvl / 2));
        add('Open Locks', at('Open Locks', half), `As a level ${half} Thief`);
        add('Pick Pockets', at('Pick Pockets', half), `As a level ${half} Thief`);
        ['Move Silently', 'Hide in Shadows', 'Climb Walls'].forEach(n => add(n, at(n, lvl - 1), `As a level ${lvl - 1} Thief`));
    }

    // Compendium: Remove Traps sets the trap off if the roll is more than twice the chance.
    list.forEach(item => {
        if (/Remove/.test(item.name) && typeof item.value === 'number') {
            const trigger = item.value * 2;
            const text = trigger >= 100 ? 'Never triggers on a failed roll' : `Trap triggers on a roll over ${trigger}%`;
            item.note = item.note ? `${item.note}. ${text}` : text;
        }
    });
    return list;
}

function renderThiefSkills() {
    const container = document.getElementById('thief-skills-section');
    const grid = document.getElementById('thief-skills-grid');
    if (!container || !grid || !currentCharacter) return;

    const abilities = getThiefAbilities(currentCharacter);
    if (abilities.length === 0) {
        container.style.display = 'none';
        return;
    }

    container.style.display = 'block';
    grid.innerHTML = abilities.map(a => `
            <div class="stat-box">
                <span class="name">${escapeHtml(a.name)}</span>
                <span class="big">${a.value}%</span>
                ${a.note ? `<span class="sub" style="font-size: 0.85rem;">${escapeHtml(a.note)}</span>` : ''}
            </div>
        `).join('');
}
window.getThiefAbilities = getThiefAbilities;

// Глобальные бинды для HTML-атрибутов
window.openSpellModal = openSpellModal;
window.closeSpellModal = closeSpellModal;
window.saveCustomSpell = saveCustomSpell;
window.openCompendiumModal = openCompendiumModal;
window.closeCompendiumModal = closeCompendiumModal;
window.addSpellFromCompendium = addSpellFromCompendium;
window.toggleSpellDetails = toggleSpellDetails;
window.toggleSpellbookLock = toggleSpellbookLock;
window.adjustPreparedSpell = adjustPreparedSpell;
window.deleteSpell = deleteSpell;
window.toggleSpellCast = toggleSpellCast;
window.restSpellbook = restSpellbook;
