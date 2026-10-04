// js/vessels.js — Skyships and other vessels (Champions of Mystara: Designer's Manual, 1993).
// Owned, found or bought vessels are kept as record sheets (Designer's Manual p. 64); the designer
// works out a new skyship's statistics, cost and building time (pp. 4-16, worksheet p. 62).

const COM = 'Champions of Mystara, Designer\'s Manual';
const TON_CN = 20000;                                  // one ton = 20,000 cn (p. 4)

// Form spell results (p. 13). Iron and steel: the worksheet on p. 62 gives 40 tons, p. 13 gives 20.
const VESSEL_FORMS = {
    clothform: { name: 'Clothform (cloth)', spell: 'Clothform', level: 4, area: 900, tons: 1250 / TON_CN, ac: 8, hp: 2 },
    woodform:  { name: 'Woodform (wood)', spell: 'Woodform', level: 5, area: 1000, tons: 25, ac: 6, hp: 12 },
    stoneform: { name: 'Stoneform (stone)', spell: 'Stoneform', level: 6, area: 1000, tons: 75, ac: 6, hp: 20 },
    ironform:  { name: 'Ironform (iron)', spell: 'Ironform', level: 7, area: 500, tons: 20, ac: 2, hp: 6 },
    steelform: { name: 'Steelform (steel)', spell: 'Steelform', level: 8, area: 500, tons: 20, ac: 2, hp: 8 },
};

// Alphatian Windriders Table (p. 5), middle of each range. Dimensions from the ship descriptions.
const WINDRIDERS = {
    sloop:      { name: 'Sloop', length: 55, beamDiv: 4, sailors: 38, marines: 30, tons: 85, cargo: 33, day: 140, enc: 70, hp: 30, ac: 6, sails: 8100 },
    schooner:   { name: 'Schooner', length: 70, beamDiv: 3, sailors: 45, marines: 45, tons: 150, cargo: 75, day: 120, enc: 60, hp: 54, ac: 6, sails: 11000 },
    brigantine: { name: 'Brigantine', length: 88, beamDiv: 3, sailors: 75, marines: 75, tons: 285, cargo: 170, day: 120, enc: 60, hp: 84, ac: 6, sails: 13500 },
    clipper:    { name: 'Clipper', length: 200, beamDiv: 5, sailors: 50, marines: 0, tons: 800, cargo: 600, day: 160, enc: 80, hp: 264, ac: 6, sails: 31500 },
    manofwar:   { name: 'Man-of-War', length: 188, beamDiv: 4, sailors: 150, marines: 300, tons: 1100, cargo: 275, day: 120, enc: 60, hp: 384, ac: 5, sails: 18000 },
};

// Flying Mounts Chart (p. 60): yards per round, Maneuvering Factor, load (cn), young cost, upkeep a month.
const FLYING_MOUNTS = [
    { name: 'Dragon, blue (small)', speed: 80, mf: 3, load: 9000, cost: 6600, upkeep: 90 },
    { name: 'Dragon, blue (large)', speed: 100, mf: 1, load: 13300, cost: 6600, upkeep: 130 },
    { name: 'Dragon, gold (small)', speed: 80, mf: 3, load: 11000, cost: 11750, upkeep: 110 },
    { name: 'Dragon, gold (large)', speed: 100, mf: 1, load: 16300, cost: 11750, upkeep: 160 },
    { name: 'Dragon, white (small)', speed: 80, mf: 3, load: 9000, cost: 4300, upkeep: 90 },
    { name: 'Drolem', speed: 80, mf: 1 / 2, load: 20000, cost: 0, upkeep: 0 },
    { name: 'Griffon', speed: 120, mf: 1, load: 7000, cost: 450, upkeep: 70 },
    { name: 'Hippogriff', speed: 120, mf: 1, load: 3100, cost: 250, upkeep: 30 },
    { name: 'Pegasus', speed: 160, mf: 3, load: 3300, cost: 125, upkeep: 20 },
    { name: 'Roc (small)', speed: 160, mf: 1, load: 6000, cost: 6250, upkeep: 60 },
    { name: 'Roc (large)', speed: 160, mf: 1 / 2, load: 12000, cost: 6250, upkeep: 120 },
    { name: 'Roc (giant)', speed: 160, mf: 1 / 3, load: 36000, cost: 6250, upkeep: 360 },
    { name: 'Sphinx', speed: 120, mf: 1, load: 12000, cost: 5625, upkeep: 120 },
];

// Spells commonly enchanted onto a frame (levels: Rules Cyclopedia; skyship spells pp. 51-53).
const VESSEL_SPELLS = [
    ['Float in air', 1, 'lift'], ['Levitate', 2, 'lift'], ['Fly', 3, 'motive'], ['Shield', 1, ''], ['Invisibility', 2, ''],
    ['Displacer field', 2, ''], ['Phantasmal force', 2, ''], ['Climate', 3, ''], ['Haste', 3, ''], ['Create atmosphere', 4, ''],
    ['Dimension door', 4, ''], ['Automatic pilot', 5, ''], ['Teleport', 5, ''], ['Anti-magic shell', 6, ''],
    ['Weather control', 6, ''], ['Travel', 8, ''], ['Contingency', 9, ''],
];
// How an enchantment may be limited (p. 15): cost per section.
const VESSEL_USES = [
    { id: 'perm', label: 'Permanent', cost: (lvl) => 3000 * lvl },
    { id: 'charges', label: 'Charges (rechargeable)', cost: (lvl, n) => 100 * lvl * n },
    { id: 'chargesOnce', label: 'Charges (not rechargeable)', cost: (lvl, n) => 80 * lvl * n },
    { id: 'day', label: 'Uses per day', cost: (lvl, n) => 1000 * lvl + 100 * lvl * n },
    { id: 'week', label: 'Uses per week', cost: (lvl, n) => 800 * lvl + 100 * lvl * n },
    { id: 'month', label: 'Uses per month', cost: (lvl, n) => 600 * lvl + 100 * lvl * n },
    { id: 'year', label: 'Uses per year', cost: (lvl, n) => 400 * lvl + 100 * lvl * n },
];

// Fittings with a price in the rules: siege weapons and rams (Dark Dungeons Table 8-11), a simple cabin
// from building parts (Table 8-8: a 10' × 10' polished wood floor and a wooden door). Weight in cn.
const VESSEL_FITTINGS = [
    { name: 'Ballista', cost: 75, weight: 6000, note: '1d10+6, crew 4' },
    { name: 'Catapult, light', cost: 150, weight: 12000, note: '1d8+8, crew 1 artillerist + 5' },
    { name: 'Catapult, heavy', cost: 250, weight: 18000, note: '1d10+10, crew 1 artillerist + 7' },
    { name: 'Trebuchet', cost: 400, weight: 24000, note: '1d12+13, crew 1 artillerist + 11' },
    { name: 'Cannon', cost: 1000, weight: 10000, note: '1d10+10, crew 2 artillerists + 3; needs red powder' },
    { name: 'Ship\'s ram, light', cost: 3000, weight: 0, note: '3d8 against vessels' },
    { name: 'Ship\'s ram, heavy', cost: 10000, weight: 0, note: '6d6 against vessels' },
    { name: 'Cabin, 10\' × 10\' (wood floor and door)', cost: 50, weight: 0, note: 'Dark Dungeons building parts' },
];
// Rare spell components (p. 15): the DM may be generous or charge up to double the enchanting cost.
const VESSEL_COMPONENTS = [['none', 'Included in the enchanting cost'], ['half', 'Half again (+50% of enchanting)'], ['double', 'Double (+100% of enchanting)']];

const VESSEL_STATUS = [
    ['owned', 'In service'], ['building', 'Being built'], ['design', 'Design only'], ['docked', 'Laid up / docked'], ['lost', 'Lost or destroyed'],
];
const VESSEL_ORIGINS = [['built', 'Built'], ['found', 'Found on an adventure'], ['bought', 'Bought'], ['captured', 'Captured'], ['gift', 'Gift or reward']];

// Maneuvering Factors (p. 11): by length; one category better when moved by magic.
const MF_STEPS = [[2, 5, 3], [10, 3, 1], [50, 1, 1 / 2], [250, 1 / 2, 1 / 3], [1250, 1 / 3, 1 / 5], [Infinity, 1 / 5, 1 / 10]];
function mfIndex(length) { const L = Number(length) || 0; return MF_STEPS.findIndex(s => L <= s[0]); }
function mfValue(idx, aero) { const i = Math.max(0, Math.min(MF_STEPS.length - 1, idx)); return MF_STEPS[i][aero ? 1 : 2]; }
function mfText(v) {
    if (!(v > 0)) return '—';
    if (v >= 1) return String(Math.round(v));
    const d = Math.round(1 / v);
    return `1/${d}`;
}
// Tonnage/Lift Capacity → maximum Air Speed (p. 62).
function loadSpeedPct(ratio) {
    if (!(ratio > 0)) return 100;
    const steps = [[1, 100], [1.2, 90], [1.4, 80], [1.6, 70], [1.8, 60], [2, 50]];
    const hit = steps.find(s => ratio <= s[0] + 1e-9);
    return hit ? hit[1] : 0;
}
// Hull damage effects (Vessel Damage Summary, p. 63).
function hullDamageNote(v) {
    const max = Number(v.hpMax) || 0, cur = Number(v.hp ?? max);
    if (!max) return '';
    const lost = (max - cur) / max;
    if (lost >= 1) return 'Hull destroyed: the vessel breaks up and falls.';
    if (lost >= 0.9) return '90% lost: loses altitude in a Two-Maneuver Dive at least; a Piloting check for any change of direction; MF drops to 1/10.';
    if (lost >= 0.75) return '75% lost: a Piloting check every round at -4 or an unstoppable One-Maneuver Dive; cannot climb; loses one MF step.';
    if (lost >= 0.5) return '50% lost: no Three-Maneuver Climbs; Two-Maneuver Climbs need three Piloting checks; magical lift may fail (d20 each round: 18-20 loses one MF step).';
    if (lost >= 0.25) return '25% lost: an extra Piloting check for Two- or Three-Maneuver Climbs; lift enhancements fail (no lift for cargo); other frame enchantments may work at half value.';
    if (lost >= 0.1) return '10% lost: Air Speed -10% (each 10% lost on a wind-driven vessel\'s sails also costs 10%).';
    return '';
}

// ---------------------------------------------------------------------------
// The designer's arithmetic
function vesselDefaultsDesign() {
    return {
        name: '', shape: 'ship', preset: '', length: 100, beam: 30, depth: 15, area: '', thickness: 1, aero: true,
        hull: 'woodform', plating: '', fxWeight: 0, fxHp: 0, fxAc: 0, fxLook: 0,
        lift: 'fly', motive: 'fly', windEnc: 60, monster: 'Griffon', otherEnc: 40, liftEnh: 0, speedEnh: 0,
        crew: 40, officers: 4, marines: 0, passengers: 0, cargo: 0,
        spells: [{ name: 'Fly', level: 3, use: 'perm', n: 1, auto: true }],
        int: 18, level: 18, prepare: 0, hired: 0, extraCost: 0,
        components: 'none', engineers: 'auto', skilled: 0, unskilled: 0, fittings: [],
    };
}

function vesselArea(d) {
    const L = Number(d.length) || 0, B = Number(d.beam) || 0, D = Number(d.depth) || 0;
    if (d.shape === 'custom') return Math.max(0, Number(d.area) || 0);
    if (d.shape === 'flat') return L * B;
    if (d.shape === 'cylinder') return 2 * 3.14 * (B / 2) * L;
    if (d.shape === 'sphere') return 4 * 3.14 * (L / 2) * (L / 2);
    // Ship-shaped (p. 13): half a cylinder plus the deck; galleons (depth over half the beam) add the sides.
    const half = L * (B / 2 * 3.14) + L * B;
    return D > B / 2 ? half + 2 * L * (D - B / 2) : half;
}

function vesselDesignCalc(d) {
    const form = VESSEL_FORMS[d.hull] || VESSEL_FORMS.woodform;
    const plate = d.plating ? VESSEL_FORMS[d.plating] : null;
    const area = vesselArea(d);
    const thick = Math.max(0.25, Number(d.thickness) || 1);
    const fx = ['fxWeight', 'fxHp', 'fxAc', 'fxLook'].reduce((s, k) => s + Math.max(0, Math.round(Number(d[k]) || 0)), 0);
    const baseSections = Math.max(1, Math.ceil(area / form.area * thick));
    const plateSections = plate ? Math.max(1, Math.ceil(area / plate.area)) : 0;
    const mult = Math.pow(2, fx);                                         // each special effect doubles the sections
    const sections = (baseSections + plateSections) * mult;
    const weightF = Math.pow(0.8, Math.max(0, Number(d.fxWeight) || 0));
    const frameTons = (baseSections * form.tons + plateSections * (plate ? plate.tons : 0)) * weightF;
    const hpF = Math.pow(1.2, Math.max(0, Number(d.fxHp) || 0));
    const hp = Math.ceil((baseSections * form.hp + plateSections * (plate ? plate.hp : 0)) * hpF);
    const ac = (plate ? plate.ac : form.ac) - Math.max(0, Number(d.fxAc) || 0);
    const crewAll = (Number(d.crew) || 0) + (Number(d.officers) || 0) + (Number(d.marines) || 0);
    const fittings = (d.fittings || []).filter(f => f && f.name);
    const fittingsTons = fittings.reduce((s, f) => s + Math.max(0, Number(f.weight) || 0) * Math.max(1, Number(f.qty) || 1), 0) / TON_CN;
    const fittingsCost = fittings.reduce((s, f) => s + Math.max(0, Number(f.cost) || 0) * Math.max(1, Number(f.qty) || 1), 0);
    const tonnage = frameTons * 1.2 + crewAll / 5 + fittingsTons;        // +20% decks and gear, a ton per 5 crew (p. 11), plus fittings
    const passengersTons = (Number(d.passengers) || 0) / 5;
    const cargoTons = Math.max(0, Number(d.cargo) || 0) + passengersTons;

    // Lift (pp. 7, 15-16): magical lift equals the Tonnage (at least 4,000 cn); each enhancement +20% of it.
    const liftEnh = Math.min(5, Math.max(0, Math.round(Number(d.liftEnh) || 0)));
    let lift = 0, liftNote = '';
    let monsters = 0, monster = null;
    const liftKind = d.lift === 'none' && d.motive === 'fly' ? 'fly' : d.lift;      // fly also lifts the vessel
    if (['fly', 'float', 'levitate'].includes(liftKind)) {
        const base = Math.max(tonnage, 4000 / TON_CN);
        const per = Math.max(tonnage * 0.2, 4000 / TON_CN);
        lift = Math.min(base + per * liftEnh, Math.max(tonnage * 2, 24000 / TON_CN));
    }
    if (d.motive === 'monsters') {
        monster = FLYING_MOUNTS.find(m => m.name === d.monster) || FLYING_MOUNTS[0];
        // Float in air leaves a fifth of her weight for the monsters (p. 8: a 5-ton vessel with float in air
        // needs 6 griffons, not 29). With levitate or fly lifting her, they only pull: 10 times their load (p. 8).
        const weightCn = (tonnage + cargoTons) * TON_CN * (liftKind === 'float' ? 0.2 : 1);
        const each = (['fly', 'levitate'].includes(liftKind) ? 10 : 1) * monster.load;
        monsters = Math.ceil(weightCn / each);
        if (!lift) { lift = monsters * monster.load / TON_CN; liftNote = 'from the monsters'; }
    }
    if (liftKind === 'none' && d.motive !== 'monsters') liftNote = 'no magical lift: provide it some other way';

    // Motive power and Air Speed (yards a round; miles a day = 3 × that).
    const speedEnh = Math.min(5, Math.max(0, Math.round(Number(d.speedEnh) || 0)));
    let enc = 0, magicalMotive = false, mfIdx = mfIndex(d.length), mfNote = '';
    if (d.motive === 'fly') { enc = 120; magicalMotive = true; }
    else if (d.motive === 'wind') enc = Math.max(0, Number(d.windEnc) || 0);
    else if (d.motive === 'monsters') enc = monster ? monster.speed : 0;
    else enc = Math.max(0, Number(d.otherEnc) || 0);
    if (magicalMotive && speedEnh) enc = Math.min(enc * 2, enc * (1 + 0.2 * speedEnh));
    if (magicalMotive) mfIdx -= 1;
    let mf = mfValue(mfIdx, d.aero);
    if (d.motive === 'monsters' && monster) {
        const mIdx = MF_STEPS.findIndex(s => Math.abs((d.aero ? s[1] : s[2]) - monster.mf) < 1e-6);
        const monsterBased = mIdx >= 0 ? mfValue(mIdx + (d.aero ? 1 : 2), d.aero) : monster.mf;
        mf = Math.min(mf, monsterBased);
        mfNote = `worst of the vessel's and the monsters' (${monster.name})`;
    }
    const ratio = lift > 0 ? (tonnage + cargoTons) / lift : 0;
    const pct = lift > 0 ? loadSpeedPct(ratio) : 100;
    let effectiveEnc = Math.round(enc * pct / 100);


    // Cost and time (p. 15): per section, (form spell level + every frame spell's levels) × 3,000 gp,
    // or the reduced cost for limited enchantments; time = 1 week + 1 day per 1,000 gp, per section.
    const spellRows = (d.spells || []).filter(s => s && s.name && Number(s.level) > 0);
    const perSectionSpells = spellRows.reduce((sum, s) => {
        const u = VESSEL_USES.find(x => x.id === s.use) || VESSEL_USES[0];
        return sum + u.cost(Number(s.level) || 0, Math.max(1, Number(s.n) || 1));
    }, 0);
    const formCost = 3000 * form.level, plateCost = plate ? 3000 * plate.level : 0;
    const enchantCost = (baseSections * formCost + plateSections * plateCost) * mult + sections * perSectionSpells;
    // Enhancements: 2,000 gp × spell level × sections, for each application.
    const liftSpell = { fly: 3, float: 1, levitate: 2 }[liftKind] || 0;
    const enhanceCost = 2000 * sections * (liftSpell * liftEnh + (magicalMotive ? 3 * speedEnh : 0));
    const sectionGold = sections ? (enchantCost / sections) : 0;
    const days = sections * (7 + Math.floor(sectionGold / 1000));
    const hiredWages = Math.max(0, Number(d.hired) || 0) * 500 * Math.ceil(days / 7);
    const components = (d.components === 'double' ? 1 : d.components === 'half' ? 0.5 : 0) * enchantCost;
    // Specialists and workers (p. 15; Dark Dungeons Table 8-10): an engineer (750 gp a month) per 100,000 gp
    // of construction, skilled (5 gp) and unskilled (2 gp) workers a month, all for the whole building time.
    const months = Math.max(1, Math.ceil(days / 28));
    const magicCost = enchantCost + enhanceCost + components;
    const engineers = d.engineers === 'none' ? 0 : Math.max(1, Math.ceil(magicCost / 100000));
    const engineerWages = engineers * 750 * months;
    const workerWages = (Math.max(0, Number(d.skilled) || 0) * 5 + Math.max(0, Number(d.unskilled) || 0) * 2) * months;
    const extra = Math.max(0, Number(d.extraCost) || 0);
    const totalCost = magicCost + hiredWages + engineerWages + workerWages + fittingsCost + extra;

    // Chances (p. 14): (Int + level × 2) − 3 × spell level, +1% per level of a prepare enchantment caster.
    const intel = Number(d.int) || 0, lvl = Number(d.level) || 0, prep = Math.max(0, Number(d.prepare) || 0);
    const chance = sl => Math.max(0, Math.min(99, intel + lvl * 2 - 3 * sl + prep));
    const chances = [{ name: form.spell, level: form.level }, ...(plate ? [{ name: plate.spell, level: plate.level }] : []),
        ...spellRows.map(s => ({ name: s.name, level: Number(s.level) }))].map(s => ({ ...s, pct: chance(s.level) }));
    // Expected cost with failures (p. 14): a section is kept only if every spell on it works, so on average
    // it is made 1 ÷ (product of the chances) times. Optional rule: once for the first section, then one
    // roll at the hardest spell's chance for the rest, each failure redoing 1d4 × 10% (on average 25%) of them.
    const sectionOk = chances.reduce((p, ch) => p * ch.pct / 100, 1);
    const hardest = chances.length ? Math.min(...chances.map(ch => ch.pct)) / 100 : 1;
    const perSection = sections ? enchantCost / sections : 0;
    const expectedSections = sectionOk > 0 ? sections / sectionOk : Infinity;
    const optionalSections = sectionOk > 0 && hardest > 0 ? 1 / sectionOk + Math.max(0, sections - 1) * (1 + (1 - hardest) / hardest * 0.25) : Infinity;
    const failCost = s => Number.isFinite(s) ? (s - sections) * perSection * (1 + (components / Math.max(1, enchantCost))) : Infinity;
    const expected = {
        ok: sectionOk, sections: expectedSections, extraCost: failCost(expectedSections),
        days: Number.isFinite(expectedSections) ? days * expectedSections / Math.max(1, sections) : Infinity,
        optSections: optionalSections, optExtraCost: failCost(optionalSections),
        optDays: Number.isFinite(optionalSections) ? days * optionalSections / Math.max(1, sections) : Infinity,
    };

    const warnings = [];
    const small = tonnage <= 5;
    if (lvl < 18 && !(small && lvl >= 9)) warnings.push(small ? 'The enchanter must be at least 9th level (a vessel of 5 tons or less may count as a normal magic item).' : 'The enchanter must be at least 18th level to enchant a huge magical item (p. 14); vessels of 5 tons or less may be done at 9th level if the DM allows.');
    if (fx > 5) warnings.push('No more than five special effects per form spell (p. 10).');
    if (Number(d.liftEnh) > 5 || Number(d.speedEnh) > 5) warnings.push('No more than five enhancements of any effect (p. 16).');
    if (lift > 0 && ratio > 1 && ratio <= 2) warnings.push(`Loaded to ${Math.round(ratio * 100)}% of her lift: Air Speed limited to ${pct}% (p. 62). Add lift enhancements to carry cargo and passengers.`);
    if (lift > 0 && ratio > 2) warnings.push(`Loaded to ${Math.round(ratio * 100)}% of her lift: she cannot fly (at double her lift a vessel begins to fall).`);
    if (!lift && d.motive !== 'monsters') warnings.push('Nothing gives her Lift: choose float in air, levitate or fly, or another means.');
    if (liftKind === 'levitate') warnings.push('Levitate only lifts straight up and down: steering a climb or dive needs ailerons or similar (p. 15).');
    const have = n => spellRows.some(s => String(s.name).trim().toLowerCase() === n);
    const needLift = { fly: 'fly', float: 'float in air', levitate: 'levitate' }[liftKind];
    if (needLift && !have(needLift)) warnings.push(`Lift by ${needLift}: add it to the frame enchantments (its cost is counted there).`);
    if (d.motive === 'fly' && !have('fly')) warnings.push('Motive power fly: add Fly to the frame enchantments.');
    if (d.lift === 'float' && d.motive === 'fly') warnings.push('Fly already provides lift: float in air adds little unless you want a cheaper backup.');

    return {
        form, plate, area: Math.round(area), baseSections, plateSections, fx, mult, sections, frameTons, tonnage, cargoTons, crewAll,
        lift, liftNote, monsters, monster, enc, effectiveEnc, day: effectiveEnc * 3, mf, mfNote, ratio, pct, hp, ac,
        enchantCost, enhanceCost, hiredWages, totalCost, days, chances, warnings, magicalMotive,
        components, engineers, engineerWages, workerWages, fittingsCost, fittingsTons, extra, months, expected, magicCost,
    };
}

const fmtTons = t => {
    if (!(t > 0)) return '0 tons';
    if (t < 1) return `${Math.round(t * TON_CN).toLocaleString('en-US')} cn`;
    return `${(Math.round(t * 10) / 10).toLocaleString('en-US')} tons`;
};
const fmtVGp = n => `${Math.round(Number(n) || 0).toLocaleString('en-US')} gp`;
function fmtDays(n) {
    n = Math.round(Number(n) || 0);
    if (n >= 336) return `${n.toLocaleString('en-US')} days (about ${Math.round(n / 336 * 10) / 10} years)`;
    if (n >= 28) return `${n.toLocaleString('en-US')} days (about ${Math.round(n / 28)} months)`;
    return `${n} days`;
}

// ---------------------------------------------------------------------------
// State
function vesselsState(ch = currentCharacter) {
    if (!ch) return [];
    if (!Array.isArray(ch.vessels)) ch.vessels = [];
    ch.vessels.forEach(v => {
        if (!v.id) v.id = vesselId();
        if (!Array.isArray(v.artillery)) v.artillery = [];
        if (!Array.isArray(v.defenses)) v.defenses = [];
        if (!Array.isArray(v.enchantments)) v.enchantments = [];
    });
    return ch.vessels;
}
function vesselId() { return `ves_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`; }
function findVessel(id) { return vesselsState().find(v => v.id === id) || null; }
function vesselsSave() {
    if (typeof debouncedSave === 'function') debouncedSave();
    if (typeof renderHoldings === 'function') renderHoldings(); else renderVessels();   // household costs include vessel upkeep
}
function vesselsLog(text, data = {}) { if (typeof addChronicleEntry === 'function') addChronicleEntry('holding', text, data); }
const vNum = v => { const n = Number(String(v ?? '').replace(/[^\d.-]/g, '')); return Number.isFinite(n) ? n : 0; };
// Monthly upkeep of vessels in service (crew wages, mounts' feed, repairs): paid with the household costs.
function vesselsMonthlyBills(ch = currentCharacter) {
    return vesselsState(ch).filter(v => ['owned', 'docked'].includes(v.status) && vNum(v.upkeep) > 0).map(v => ({ name: v.name || 'Vessel', amount: vNum(v.upkeep) }));
}

// ---------------------------------------------------------------------------
// Rendering (a card under the homes on the Holdings tab)
function renderVessels() {
    const root = document.getElementById('vessels-root');
    if (!root || !currentCharacter) return;
    const list = vesselsState();
    const active = list.filter(v => v.status !== 'lost');
    root.innerHTML = `
    <div class="card comp-summary">
        <div class="panel-head">
            <h2 style="display: inline-flex; align-items: center; gap: 8px;">${getIcon('wagon', 18)} Skyships &amp; Vessels</h2>
            <div class="panel-head-tools">
                <button type="button" class="btn btn-sm" onclick="openVesselEditor()">+ Add a vessel you have</button>
                <button type="button" class="btn btn-sm btn-accent" onclick="openSkyshipDesigner()">Design a skyship</button>
            </div>
        </div>
        <p class="sub-caption">Flying ships and other craft the character owns, captured or found. Design a new skyship to work out her size, lift, speed, cost and building time, or record one you already have from its record sheet.</p>
        <div class="tally"><span>Vessels <strong>${active.length}</strong></span>${vesselsMonthlyBills().length ? `<span>Upkeep <strong>${fmtVGp(vesselsMonthlyBills().reduce((s, b) => s + b.amount, 0))}</strong> / month (paid with household costs)</span>` : ''}</div>
    </div>
    ${list.length ? list.map(vesselCard).join('') : '<div class="card"><div class="ledger-note">No vessels yet.</div></div>'}
    <div class="arc-source">${escapeHtml(COM)}: designing pp. 4-11, building pp. 12-16, flying mounts p. 60, worksheet p. 62, damage p. 63, record sheet p. 64</div>`;
}

function vesselCard(v) {
    const st = VESSEL_STATUS.find(s => s[0] === v.status) || VESSEL_STATUS[0];
    const origin = VESSEL_ORIGINS.find(o => o[0] === v.origin);
    const hpMax = vNum(v.hpMax), hp = v.hp === '' || v.hp == null ? hpMax : vNum(v.hp);
    const dmg = hullDamageNote({ hp, hpMax });
    const line = (label, val) => val !== '' && val != null && val !== 0 && val !== '0' ? `<span>${label} <strong>${escapeHtml(String(val))}</strong></span>` : '';
    const b = v.build;
    const buildHtml = v.status === 'building' && b && b.sections ? `
        <div class="arc-panel">
            <div class="arc-row-head"><strong>Construction</strong><span class="eyebrow">Section ${b.done || 0} / ${b.sections}</span></div>
            <div class="xp-bar" style="margin: 6px 0;"><div class="xp-bar-fill" style="width: ${Math.min(100, Math.round((b.done || 0) / b.sections * 100))}%;"></div></div>
            <div class="tally"><span>Enchanting spent <strong>${fmtVGp(b.spent || 0)}</strong> of ${fmtVGp(b.cost || 0)}</span>${b.otherCost ? `<span>Other costs <strong>${fmtVGp(b.otherCost)}</strong> ${b.otherPaid ? '(paid)' : ''}</span>` : ''}<span>About <strong>${Math.round(b.perSectionDays || 0)} days</strong> a section</span>${b.failures ? `<span>Failed sections <strong>${b.failures}</strong></span>` : ''}</div>
            <div class="arc-actions">
                <button type="button" class="btn btn-sm btn-accent" onclick="vesselSectionDone('${v.id}', true)" title="Pay one section's enchanting and mark it finished">Section finished</button>
                <button type="button" class="btn btn-sm" onclick="vesselSectionDone('${v.id}', false)" title="An enchantment failed: the section is discarded and must be made again (its cost is spent)">Section failed</button>
                ${b.otherCost && !b.otherPaid ? `<button type="button" class="btn btn-sm" onclick="vesselPayOther('${v.id}')" title="Components, wages, fittings and the rest">Pay other costs</button>` : ''}
                ${(b.done || 0) >= b.sections ? `<button type="button" class="btn btn-sm btn-accent" onclick="launchVessel('${v.id}')">Launch her!</button>` : ''}
            </div>
        </div>` : '';
    return `
    <div class="card hold-card${v.status === 'lost' ? ' gone' : ''}">
        <div class="arc-row-head">
            <div><button type="button" class="link-btn comp-name-btn" onclick="openVesselEditor('${v.id}')">${escapeHtml(v.name || 'Unnamed vessel')}</button>
                <span class="comp-status">${escapeHtml(st[1])}</span>${origin ? ` <span class="tag">${escapeHtml(origin[1])}</span>` : ''}</div>
            <span class="arc-actions" style="margin: 0;">
                ${v.design ? `<button type="button" class="btn btn-sm" onclick="openSkyshipDesigner('${v.id}')">Designer</button>` : ''}
                <button type="button" class="btn btn-sm" onclick="openVesselEditor('${v.id}')">Record sheet</button>
            </span>
        </div>
        ${v.description ? `<div class="nc-meta">${escapeHtml(v.description)}</div>` : ''}
        <div class="tally" style="margin: 6px 0; flex-wrap: wrap; row-gap: 4px;">
            ${line('AC', v.ac)}
            ${hpMax ? `<span>Hull <strong>${hp} / ${hpMax}</strong> <button type="button" class="icon-btn" onclick="vesselHull('${v.id}', -1)" title="Damage">-</button><button type="button" class="icon-btn" onclick="vesselHull('${v.id}', 1)" title="Repair">+</button></span>` : ''}
            ${v.airDay || v.airEnc ? `<span>Air Speed <strong>${vNum(v.airDay)} (${vNum(v.airEnc)})</strong></span>` : ''}
            ${line('MF', v.mf)}
            ${line('Tonnage', v.tonnage)}
            ${line('Lift', v.lift)}
            ${line('Cargo', v.cargo)}
            ${line('Crew', v.crew)}
            ${line('QR', v.qr ? v.qr + '%' : '')}
        </div>
        ${dmg ? `<p class="sub-caption arc-note" style="color: var(--danger);">${escapeHtml(dmg)}</p>` : ''}
        ${v.motive ? `<div class="hold-line"><span class="eyebrow">Motive power</span> ${escapeHtml(v.motive)}</div>` : ''}
        ${v.enchantments.length ? `<div class="hold-line"><span class="eyebrow">Enchantments</span> ${v.enchantments.map(e => escapeHtml(e)).join(' · ')}</div>` : ''}
        ${v.artilleryText ? `<div class="hold-line"><span class="eyebrow">Artillery</span> ${escapeHtml(String(v.artilleryText))}</div>` : ''}
        ${v.defensesText ? `<div class="hold-line"><span class="eyebrow">Defenses</span> ${escapeHtml(v.defensesText)}</div>` : ''}
        ${vNum(v.upkeep) ? `<div class="hold-line"><span class="eyebrow">Upkeep</span> ${fmtVGp(vNum(v.upkeep))} a month</div>` : ''}
        ${v.notes ? `<div class="comp-notes">${escapeHtml(v.notes)}</div>` : ''}
        ${buildHtml}
    </div>`;
}

// ---------------------------------------------------------------------------
// Record sheet editor (p. 64) for vessels you already have
async function openVesselEditor(id = null, preset = null) {
    const v = id ? findVessel(id) : null;
    const wr = preset ? WINDRIDERS[preset] : null;
    const values = v ? { ...v } : wr ? {
        name: '', status: 'owned', origin: 'bought', description: `Alphatian ${wr.name.toLowerCase()} (windrider)`, motive: 'Wind (sails), float in air',
        length: wr.length, beam: Math.round(wr.length / wr.beamDiv), depth: Math.round(wr.length / wr.beamDiv / 2), tonnage: wr.tons, cargo: `${wr.cargo} tons`,
        crew: `${wr.sailors} sailors${wr.marines ? `, ${wr.marines} marines` : ''}`, airDay: wr.day, airEnc: wr.enc, hpMax: wr.hp, ac: wr.ac,
        mf: mfText(mfValue(mfIndex(wr.length), true)), notes: `Sails ${wr.sails.toLocaleString('en-US')} sq ft (keep track of sail hit points separately).`,
    } : { status: 'owned', origin: 'found' };
    const res = await notesFormModal({
        title: v ? (v.name || 'Vessel') : 'Add a vessel', canDelete: !!v, okText: v ? 'Save' : 'Add vessel',
        values: { ...values, enchantText: (values.enchantments || []).join(', ') },
        fields: [
            { key: 'name', label: 'Name', max: 80, placeholder: 'e.g. Princess Ark' },
            { key: 'status', label: 'Status', type: 'select', options: VESSEL_STATUS.map(([value, label]) => ({ value, label })) },
            { key: 'origin', label: 'How she came to you', type: 'select', options: VESSEL_ORIGINS.map(([value, label]) => ({ value, label })) },
            { key: 'description', label: 'Description', max: 160, placeholder: 'e.g. Alphatian sloop, elven lightship' },
            { key: 'motive', label: 'Motive power(s)', wide: true, max: 160, placeholder: 'e.g. Fly (primary), sails (secondary)' },
            { key: 'length', label: 'Length (ft)' }, { key: 'beam', label: 'Beam (ft)' },
            { key: 'depth', label: 'Depth (ft)' }, { key: 'tonnage', label: 'Tonnage', placeholder: 'e.g. 85 tons' },
            { key: 'lift', label: 'Lift capacity', placeholder: 'e.g. 120 tons' }, { key: 'cargo', label: 'Cargo capacity', placeholder: 'e.g. 30 tons' },
            { key: 'crew', label: 'Crew', placeholder: 'e.g. 20 sailors, 10 marines' }, { key: 'passengers', label: 'Passengers' },
            { key: 'ac', label: 'Armour class' }, { key: 'hpMax', label: 'Hull points (max)' },
            { key: 'hp', label: 'Hull points (now)', placeholder: 'same as max' }, { key: 'mf', label: 'Maneuvering Factor', placeholder: 'e.g. 1/2' },
            { key: 'airDay', label: 'Air Speed: miles a day', placeholder: 'e.g. 360' }, { key: 'airEnc', label: 'Air Speed: yards a round', placeholder: 'e.g. 120' },
            { key: 'qr', label: 'Quality rating (%)', placeholder: 'optional, e.g. 50' }, { key: 'cost', label: 'Cost / value (gp)' },
            { key: 'upkeep', label: 'Upkeep (gp / month)', placeholder: 'paid with household costs' },
            { key: 'enchantText', label: 'Enchantments (comma between)', wide: true, max: 400, placeholder: 'e.g. Fly, Float in air +2, Shield, Climate (captain\'s cabin)' },
            { key: 'artilleryText', label: 'Artillery', wide: true, max: 400, placeholder: 'e.g. 2 light catapults (2d6), wand of lightning bolts' },
            { key: 'defensesText', label: 'Defenses', wide: true, max: 300, placeholder: 'e.g. Shield (AC 5), invisibility 1/day' },
            { key: 'notes', label: 'Notes', type: 'textarea', wide: true, rows: 3, placeholder: 'Where she is moored, captain, history...' },
        ],
        extraHtml: v ? '' : `<p class="sub-caption arc-note">Quick start from the Alphatian Windriders Table (p. 5): ${Object.entries(WINDRIDERS).map(([k, w]) => `<button type="button" class="link-btn" onclick="window.__vesselPreset='${k}'; document.querySelector('#notes-form-modal [data-act=cancel]').click();">${w.name}</button>`).join(' · ')}</p>`,
    });
    if (window.__vesselPreset) { const p = window.__vesselPreset; delete window.__vesselPreset; return openVesselEditor(null, p); }
    if (!res) return;
    if (res === '__delete__') {
        if (!(await sheetConfirm(`Remove ${v.name || 'this vessel'} from the sheet? (To keep a record, set her status to Lost instead.)`, 'Remove'))) return;
        currentCharacter.vessels = vesselsState().filter(x => x.id !== v.id);
        vesselsSave();
        return;
    }
    const out = { ...res, enchantments: String(res.enchantText || '').split(',').map(s => s.trim()).filter(Boolean) };
    delete out.enchantText;
    ['hpMax', 'airDay', 'airEnc', 'upkeep'].forEach(k => { out[k] = out[k] === '' ? '' : vNum(out[k]); });
    if (out.hp === '' && out.hpMax !== '') out.hp = out.hpMax; else if (out.hp !== '') out.hp = Math.min(vNum(out.hp), vNum(out.hpMax) || vNum(out.hp));
    out.name = out.name || 'Unnamed vessel';
    if (v) Object.assign(v, out);
    else { vesselsState().push({ id: vesselId(), artillery: [], defenses: [], ...out }); vesselsLog(`Vessel added: ${out.name}${out.description ? ` (${out.description})` : ''}.`); }
    vesselsSave();
}

function vesselHull(id, delta) {
    const v = findVessel(id); if (!v) return;
    const max = vNum(v.hpMax);
    const cur = v.hp === '' || v.hp == null ? max : vNum(v.hp);
    v.hp = Math.max(0, Math.min(max || cur + delta, cur + delta));
    vesselsSave();
}

// Building progress: each finished section is paid for (from the bills' money source).
async function vesselSectionDone(id, ok) {
    const v = findVessel(id); if (!v || !v.build) return;
    const b = v.build;
    const cost = b.sections ? Math.round((b.cost || 0) / b.sections) : 0;
    const src = typeof monthlyPaySource === 'function' ? monthlyPaySource() : 'purse';
    if (cost > 0 && typeof holdingsPay === 'function') {
        if (!(await sheetConfirm(`${ok ? 'Section finished' : 'Section failed and discarded'}: pay its enchanting, ${fmtVGp(cost)}, from your ${typeof paySourceLabel === 'function' ? paySourceLabel(src) : 'purse'}?`, 'Pay'))) return;
        if (!(await holdingsPay(cost, src))) return;
    }
    b.spent = (b.spent || 0) + cost;
    if (ok) b.done = Math.min(b.sections, (b.done || 0) + 1); else b.failures = (b.failures || 0) + 1;
    vesselsSave();
}
async function vesselPayOther(id) {
    const v = findVessel(id); if (!v || !v.build || !v.build.otherCost || v.build.otherPaid) return;
    const src = typeof monthlyPaySource === 'function' ? monthlyPaySource() : 'purse';
    if (!(await sheetConfirm(`Pay the other building costs of ${v.name} (components, wages, fittings and the rest), ${fmtVGp(v.build.otherCost)}, from your ${typeof paySourceLabel === 'function' ? paySourceLabel(src) : 'purse'}?`, 'Pay'))) return;
    if (typeof holdingsPay === 'function' && !(await holdingsPay(v.build.otherCost, src))) return;
    v.build.otherPaid = true;
    vesselsLog(`${v.name}: paid ${fmtVGp(v.build.otherCost)} of other building costs.`);
    vesselsSave();
}
function launchVessel(id) {
    const v = findVessel(id); if (!v) return;
    v.status = 'owned';
    if (v.hp === '' || v.hp == null) v.hp = v.hpMax;
    vesselsLog(`${v.name} is finished and takes her maiden flight! ${v.build && v.build.spent ? `(${fmtVGp(v.build.spent)} spent on enchanting)` : ''}`);
    vesselsSave();
}

// ---------------------------------------------------------------------------
// The skyship designer
let skyDesign = null, skyDesignVessel = null;
function openSkyshipDesigner(id = null) {
    const v = id ? findVessel(id) : null;
    skyDesignVessel = v ? v.id : null;
    skyDesign = { ...vesselDefaultsDesign(), ...(v && v.design ? JSON.parse(JSON.stringify(v.design)) : {}) };
    if (v && !v.design) skyDesign.name = v.name || '';
    const ch = currentCharacter;
    if (!v) {
        const intel = typeof getEffectiveScore === 'function' ? getEffectiveScore(ch, 'intelligence') : Number(ch?.abilities?.intelligence?.score) || 10;
        skyDesign.int = intel; skyDesign.level = Number(ch?.level) || 1;
    }
    document.getElementById('skyship-designer')?.remove();
    const wrap = document.createElement('div');
    wrap.id = 'skyship-designer';
    wrap.className = 'notes-form-wrap';
    wrap.setAttribute('role', 'dialog');
    wrap.setAttribute('aria-modal', 'true');
    wrap.innerHTML = `<div class="card notes-form-card sky-card">
        <div class="arc-row-head" style="border-bottom: 1px solid var(--border-color); padding-bottom: 8px;">
            <h2 style="border: none; padding: 0; margin: 0; font-size: 1.1rem;">Skyship designer</h2>
            <button type="button" class="icon-btn" onclick="closeSkyshipDesigner()" aria-label="Close">${getIcon('close', 14)}</button>
        </div>
        <div class="sky-grid">
            <div id="sky-form"></div>
            <div id="sky-result" class="sky-result"></div>
        </div>
        <div class="notes-form-actions">
            <span class="sub-caption" style="margin: 0;">${escapeHtml(COM)}, pp. 4-16 and 62</span>
            <span style="flex: 1;"></span>
            <button type="button" class="btn btn-sm" onclick="closeSkyshipDesigner()">Cancel</button>
            <button type="button" class="btn btn-sm" onclick="saveSkyshipDesign('design')">Save the design</button>
            <button type="button" class="btn btn-sm btn-primary" onclick="saveSkyshipDesign('building')">Start building</button>
        </div>
    </div>`;
    wrap.addEventListener('click', e => { if (e.target === wrap) closeSkyshipDesigner(); });
    document.body.appendChild(wrap);
    renderSkyForm();
    renderSkyResult();
}
function closeSkyshipDesigner() { document.getElementById('skyship-designer')?.remove(); skyDesign = null; }

function skyField(key, label, type = 'number', opts = {}) {
    const d = skyDesign;
    const val = d[key] ?? '';
    let input;
    if (type === 'select') input = `<select class="stat-input arc-input" data-k="${key}">${opts.options.map(([v, l]) => `<option value="${escapeHtml(String(v))}" ${String(v) === String(val) ? 'selected' : ''}>${escapeHtml(l)}</option>`).join('')}</select>`;
    else if (type === 'check') input = `<label class="arc-check"><input type="checkbox" data-k="${key}" ${val ? 'checked' : ''}> ${escapeHtml(opts.text || '')}</label>`;
    else input = `<input type="${type}" class="stat-input arc-input" data-k="${key}" value="${escapeHtml(String(val))}" ${opts.min !== undefined ? `min="${opts.min}"` : ''} ${opts.step ? `step="${opts.step}"` : ''} placeholder="${escapeHtml(opts.placeholder || '')}">`;
    return `<label class="arc-field ${opts.narrow ? 'arc-narrow' : ''}" ${opts.hide ? 'style="display:none"' : ''}><span class="eyebrow">${escapeHtml(label)}</span>${input}</label>`;
}
function renderSkyForm() {
    const el = document.getElementById('sky-form'); if (!el || !skyDesign) return;
    const d = skyDesign;
    el.innerHTML = `
        <div class="arc-fields">${skyField('name', 'Name', 'text', { placeholder: 'e.g. Sky Lark' })}
            ${skyField('preset', 'Start from', 'select', { options: [['', '—'], ...Object.entries(WINDRIDERS).map(([k, w]) => [k, `Alphatian ${w.name.toLowerCase()}`])] })}</div>
        <div class="eyebrow eyebrow-strong sky-head">Size and shape (pp. 5-6, 13)</div>
        <div class="arc-fields">
            ${skyField('shape', 'Shape', 'select', { options: [['ship', 'Ship-shaped hull'], ['flat', 'Flat (raft, barge, platform)'], ['cylinder', 'Cylinder'], ['sphere', 'Sphere (length = diameter)'], ['custom', 'Other: enter the hull area']] })}
            ${skyField('aero', '', 'check', { text: 'Aerodynamic shape' })}
        </div>
        <div class="arc-fields">
            ${skyField('length', 'Length (ft)', 'number', { min: 0, narrow: true })}
            ${skyField('beam', d.shape === 'cylinder' ? 'Diameter (ft)' : 'Beam (ft)', 'number', { min: 0, narrow: true, hide: d.shape === 'sphere' || d.shape === 'custom' })}
            ${skyField('depth', 'Depth (ft)', 'number', { min: 0, narrow: true, hide: d.shape !== 'ship' })}
            ${skyField('area', 'Hull area (sq ft)', 'number', { min: 0, narrow: true, hide: d.shape !== 'custom' })}
            ${skyField('thickness', 'Thickness ×', 'number', { min: 0.25, step: 0.25, narrow: true })}
        </div>
        <div class="arc-fields">
            ${skyField('hull', 'Hull (form spell)', 'select', { options: Object.entries(VESSEL_FORMS).map(([k, f]) => [k, `${f.name}: AC ${f.ac}, ${f.hp} HP, ${f.area} sq ft`]) })}
            ${skyField('plating', 'Armour plating', 'select', { options: [['', 'None'], ...Object.entries(VESSEL_FORMS).map(([k, f]) => [k, `${f.name} over the hull`])] })}
        </div>
        <div class="eyebrow eyebrow-strong sky-head">Special effects on each form spell (p. 10, at most 5; each doubles the sections)</div>
        <div class="arc-fields">
            ${skyField('fxWeight', '-20% weight', 'number', { min: 0, narrow: true })}${skyField('fxHp', '+20% hull points', 'number', { min: 0, narrow: true })}
            ${skyField('fxAc', '-1 AC', 'number', { min: 0, narrow: true })}${skyField('fxLook', 'Looks (colour etc.)', 'number', { min: 0, narrow: true })}
        </div>
        <div class="eyebrow eyebrow-strong sky-head">Lift and motive power (pp. 6-9, 15-16)</div>
        <div class="arc-fields">
            ${skyField('lift', 'Lift', 'select', { options: [['fly', 'Fly enchantment'], ['float', 'Float in air'], ['levitate', 'Levitate'], ['none', 'No magical lift']] })}
            ${skyField('motive', 'Motive power', 'select', { options: [['fly', 'Fly: 360 (120)'], ['wind', 'Wind (sails)'], ['monsters', 'Flying monsters'], ['other', 'Oars, muscle or machine']] })}
            ${skyField('windEnc', 'Wind speed (yards/round)', 'number', { min: 0, narrow: true, hide: d.motive !== 'wind' })}
            ${skyField('monster', 'Monster', 'select', { hide: d.motive !== 'monsters', options: FLYING_MOUNTS.map(m => [m.name, `${m.name}: ${m.speed} yds, load ${m.load.toLocaleString('en-US')} cn`]) })}
            ${skyField('otherEnc', 'Speed (yards/round)', 'number', { min: 0, narrow: true, hide: d.motive !== 'other' })}
        </div>
        <div class="arc-fields">
            ${skyField('liftEnh', 'Lift enhancements (+20% each)', 'number', { min: 0, narrow: true })}
            ${skyField('speedEnh', 'Speed enhancements (+20% each)', 'number', { min: 0, narrow: true, hide: d.motive !== 'fly' })}
        </div>
        <div class="eyebrow eyebrow-strong sky-head">Crew and load (p. 11)</div>
        <div class="arc-fields">
            ${skyField('crew', 'Sailors', 'number', { min: 0, narrow: true })}${skyField('officers', 'Officers', 'number', { min: 0, narrow: true })}
            ${skyField('marines', 'Marines', 'number', { min: 0, narrow: true })}${skyField('passengers', 'Passengers', 'number', { min: 0, narrow: true })}
            ${skyField('cargo', 'Cargo (tons)', 'number', { min: 0, narrow: true })}
        </div>
        <div class="eyebrow eyebrow-strong sky-head">Frame enchantments (each section must have all of them, p. 12)</div>
        <div id="sky-spells"></div>
        <div class="eyebrow eyebrow-strong sky-head">The enchanter (pp. 14-15)</div>
        <div class="arc-fields">
            ${skyField('int', 'Intelligence', 'number', { min: 3, narrow: true })}${skyField('level', 'Level', 'number', { min: 1, narrow: true })}
            ${skyField('prepare', 'Prepare enchantment caster level', 'number', { min: 0, narrow: true })}
            ${skyField('hired', 'Hired enchanter level (500 gp/level a week)', 'number', { min: 0, narrow: true })}
        </div>
        <div class="eyebrow eyebrow-strong sky-head">Other costs (p. 15)</div>
        <div class="arc-fields">
            ${skyField('components', 'Rare spell components', 'select', { options: VESSEL_COMPONENTS })}
            ${skyField('engineers', 'Engineers (750 gp a month)', 'select', { options: [['auto', 'Hire one per 100,000 gp of work'], ['none', 'None: the builder has the skills']] })}
        </div>
        <div class="arc-fields">
            ${skyField('skilled', 'Skilled workers (5 gp/month)', 'number', { min: 0, narrow: true })}
            ${skyField('unskilled', 'Labourers (2 gp/month)', 'number', { min: 0, narrow: true })}
            ${skyField('extraCost', 'Anything else (gp)', 'number', { min: 0, narrow: true, placeholder: 'masts, sails, furnishings' })}
        </div>
        <div class="eyebrow eyebrow-strong sky-head">Fittings: weapons, rams, cabins (Dark Dungeons Tables 8-8, 8-11)</div>
        <div id="sky-fittings"></div>`;
    renderSkySpells();
    renderSkyFittings();
    el.oninput = el.onchange = e => {
        const t = e.target; const k = t && t.dataset && t.dataset.k;
        if (!k || !skyDesign) return;
        skyDesign[k] = t.type === 'checkbox' ? t.checked : t.type === 'number' ? (t.value === '' ? '' : Number(t.value)) : t.value;
        if (k === 'preset' && t.value) { applySkyPreset(t.value); return; }
        if (['lift', 'motive'].includes(k)) syncSkyRequiredSpells();
        if (['shape', 'motive', 'lift'].includes(k)) { renderSkyForm(); }
        renderSkyResult();
    };
}
// The lift and motive spells are kept in the enchantment list by themselves (rows the designer added: auto).
function syncSkyRequiredSpells() {
    const d = skyDesign; if (!d) return;
    const need = [];
    const liftKind = d.lift === 'none' && d.motive === 'fly' ? 'fly' : d.lift;
    if (liftKind === 'fly' || d.motive === 'fly') need.push(['Fly', 3]);
    if (liftKind === 'float') need.push(['Float in air', 1]);
    if (liftKind === 'levitate') need.push(['Levitate', 2]);
    d.spells = (d.spells || []).filter(s => !s.auto || need.some(n => n[0] === s.name));
    need.forEach(([name, level]) => { if (!d.spells.some(s => String(s.name).toLowerCase() === name.toLowerCase())) d.spells.unshift({ name, level, use: 'perm', n: 1, auto: true }); });
}
function applySkyPreset(key) {
    const w = WINDRIDERS[key]; if (!w) return;
    Object.assign(skyDesign, { shape: 'ship', aero: true, length: w.length, beam: Math.round(w.length / w.beamDiv), depth: Math.round(w.length / w.beamDiv / 2),
        hull: 'woodform', lift: 'float', motive: 'wind', windEnc: w.enc, crew: w.sailors, marines: w.marines,
        spells: [{ name: 'Float in air', level: 1, use: 'perm', n: 1, auto: true }, ...(key === 'manofwar' ? [{ name: 'Shield', level: 1, use: 'perm', n: 1 }] : [])] });
    renderSkyForm(); renderSkyResult();
}
function renderSkySpells() {
    const el = document.getElementById('sky-spells'); if (!el || !skyDesign) return;
    const rows = skyDesign.spells || (skyDesign.spells = []);
    el.innerHTML = rows.map((s, i) => `<div class="sky-spell-row">
        <input type="text" class="stat-input arc-input" list="sky-spell-list" value="${escapeHtml(s.name || '')}" onchange="skySpellSet(${i}, 'name', this.value)" aria-label="Spell">
        <input type="number" class="stat-input arc-input" min="1" max="9" value="${Number(s.level) || ''}" onchange="skySpellSet(${i}, 'level', this.value)" aria-label="Spell level" title="Spell level">
        <select class="stat-input arc-input" onchange="skySpellSet(${i}, 'use', this.value)" aria-label="How often">${VESSEL_USES.map(u => `<option value="${u.id}" ${u.id === s.use ? 'selected' : ''}>${u.label}</option>`).join('')}</select>
        <input type="number" class="stat-input arc-input" min="1" value="${Number(s.n) || 1}" onchange="skySpellSet(${i}, 'n', this.value)" aria-label="How many" title="Charges or uses" ${s.use === 'perm' ? 'disabled' : ''}>
        <button type="button" class="icon-btn danger" onclick="skySpellRemove(${i})" aria-label="Remove">${getIcon('close', 13)}</button>
    </div>`).join('') + `<datalist id="sky-spell-list">${VESSEL_SPELLS.map(([n]) => `<option value="${escapeHtml(n)}"></option>`).join('')}</datalist>
    <button type="button" class="btn btn-sm" onclick="skySpellAdd()">+ Enchantment</button>`;
}
function skySpellSet(i, key, value) {
    const s = skyDesign && skyDesign.spells[i]; if (!s) return;
    delete s.auto;                                  // edited by hand: the designer leaves it alone
    if (key === 'name') {
        s.name = value;
        const known = VESSEL_SPELLS.find(x => x[0].toLowerCase() === String(value).trim().toLowerCase());
        if (known) s.level = known[1];
        renderSkySpells();
    } else if (key === 'use') { s.use = value; renderSkySpells(); }
    else s[key] = Number(value) || 0;
    renderSkyResult();
}
function skySpellAdd() { skyDesign.spells.push({ name: '', level: 1, use: 'perm', n: 1 }); renderSkySpells(); }
function skySpellRemove(i) { skyDesign.spells.splice(i, 1); renderSkySpells(); renderSkyResult(); }

function renderSkyFittings() {
    const el = document.getElementById('sky-fittings'); if (!el || !skyDesign) return;
    const rows = skyDesign.fittings || (skyDesign.fittings = []);
    el.innerHTML = rows.map((f, i) => `<div class="sky-fit-row">
        <input type="text" class="stat-input arc-input" list="sky-fit-list" value="${escapeHtml(f.name || '')}" onchange="skyFitSet(${i}, 'name', this.value)" aria-label="Fitting" placeholder="e.g. Catapult, light">
        <input type="number" class="stat-input arc-input" min="1" value="${Number(f.qty) || 1}" onchange="skyFitSet(${i}, 'qty', this.value)" aria-label="How many" title="How many">
        <input type="number" class="stat-input arc-input" min="0" value="${Number(f.cost) || 0}" onchange="skyFitSet(${i}, 'cost', this.value)" aria-label="Cost each (gp)" title="Cost each (gp)">
        <input type="number" class="stat-input arc-input" min="0" value="${Number(f.weight) || 0}" onchange="skyFitSet(${i}, 'weight', this.value)" aria-label="Weight each (cn)" title="Weight each (cn)">
        <button type="button" class="icon-btn danger" onclick="skyFitRemove(${i})" aria-label="Remove">${getIcon('close', 13)}</button>
    </div>`).join('') + (rows.length ? '<div class="sub-caption sky-fit-head"><span>Fitting</span><span>How many</span><span>gp each</span><span>cn each</span></div>' : '')
    + `<datalist id="sky-fit-list">${VESSEL_FITTINGS.map(f => `<option value="${escapeHtml(f.name)}">${f.cost} gp${f.note ? ' · ' + escapeHtml(f.note) : ''}</option>`).join('')}</datalist>
    <button type="button" class="btn btn-sm" onclick="skyFitAdd()">+ Fitting</button>`;
}
function skyFitSet(i, key, value) {
    const f = skyDesign && skyDesign.fittings[i]; if (!f) return;
    if (key === 'name') {
        f.name = value;
        const known = VESSEL_FITTINGS.find(x => x.name.toLowerCase() === String(value).trim().toLowerCase());
        if (known) { f.cost = known.cost; f.weight = known.weight; }
        renderSkyFittings();
    } else f[key] = Math.max(0, Number(value) || 0);
    renderSkyResult();
}
function skyFitAdd() { skyDesign.fittings.push({ name: '', qty: 1, cost: 0, weight: 0 }); renderSkyFittings(); }
function skyFitRemove(i) { skyDesign.fittings.splice(i, 1); renderSkyFittings(); renderSkyResult(); }

function renderSkyResult() {
    const el = document.getElementById('sky-result'); if (!el || !skyDesign) return;
    const c = vesselDesignCalc(skyDesign);
    const row = (k, v, title = '') => `<div class="sky-row" ${title ? `title="${escapeHtml(title)}"` : ''}><span>${k}</span><strong>${v}</strong></div>`;
    el.innerHTML = `
        <div class="eyebrow eyebrow-strong">Her statistics</div>
        ${row('Hull area', `${c.area.toLocaleString('en-US')} sq ft`)}
        ${row('Frame sections', `${c.sections.toLocaleString('en-US')}${c.mult > 1 ? ` (${c.baseSections + c.plateSections} × ${c.mult})` : ''}`, 'One form spell per section; each special effect doubles the number')}
        ${row('Frame weight', fmtTons(c.frameTons))}
        ${row('Tonnage', fmtTons(c.tonnage), 'Frame +20% for decks and gear, plus a ton for every 5 crew (p. 11)')}
        ${row('Lift capacity', c.lift ? fmtTons(c.lift) + (c.liftNote ? ` (${c.liftNote})` : '') : '—')}
        ${row('Spare lift for cargo', c.lift ? fmtTons(Math.max(0, c.lift - c.tonnage)) : '—')}
        ${row('Load carried', fmtTons(c.cargoTons), 'Cargo plus passengers (a ton per 5)')}
        ${c.monster ? row(`Needed: ${c.monster.name}`, `${c.monsters} (young ${fmtVGp(c.monsters * c.monster.cost)}, upkeep ${fmtVGp(c.monsters * c.monster.upkeep)} / month)`, 'Flying Mounts Chart, p. 60') : ''}
        ${row('Armour class', c.ac)}
        ${row('Hull points', c.hp)}
        ${row('Maneuvering Factor', mfText(c.mf) + (c.mfNote ? ` (${c.mfNote})` : ''))}
        ${row('Air Speed', `${c.day.toLocaleString('en-US')} (${c.effectiveEnc})${c.pct < 100 ? ` · ${c.pct}% for her load` : ''}`, 'Miles a day (yards a round)')}
        <div class="eyebrow eyebrow-strong" style="margin-top: 10px;">Building her</div>
        ${row('Enchanting', fmtVGp(c.enchantCost), 'Per section: (form spell level + all frame spell levels) × 3,000 gp, less for limited enchantments')}
        ${c.enhanceCost ? row('Enhancements', fmtVGp(c.enhanceCost), '2,000 gp × spell level × sections, per application') : ''}
        ${c.components ? row('Rare components', fmtVGp(c.components)) : ''}
        ${c.hiredWages ? row('Hired enchanter', fmtVGp(c.hiredWages)) : ''}
        ${c.engineerWages ? row(`Engineer${c.engineers > 1 ? `s (${c.engineers})` : ''}`, fmtVGp(c.engineerWages), `750 gp a month each for ${c.months} month${c.months > 1 ? 's' : ''}; one per 100,000 gp of work`) : ''}
        ${c.workerWages ? row('Workers', fmtVGp(c.workerWages), `for ${c.months} month${c.months > 1 ? 's' : ''}`) : ''}
        ${c.fittingsCost ? row('Fittings', fmtVGp(c.fittingsCost) + (c.fittingsTons ? ` (${fmtTons(c.fittingsTons)})` : '')) : ''}
        ${c.extra ? row('Anything else', fmtVGp(c.extra)) : ''}
        ${row('Total cost', fmtVGp(c.totalCost))}
        ${row('Time', fmtDays(c.days), 'A week plus a day per 1,000 gp, for every section (one enchanter)')}
        <div class="eyebrow eyebrow-strong" style="margin-top: 10px;">Counting failures</div>
        ${row('A section works', `${Math.round(c.expected.ok * 1000) / 10}% of tries`, 'Every spell on it must succeed')}
        ${Number.isFinite(c.expected.sections)
            ? row('Expected total', `${fmtVGp(c.totalCost + c.expected.extraCost)}`, `About ${Math.round(c.expected.sections).toLocaleString('en-US')} sections made for ${c.sections}; ${fmtDays(c.expected.days)}`)
              + row('Expected time', fmtDays(c.expected.days))
              + (Number.isFinite(c.expected.optSections) ? row('With the optional rule', `${fmtVGp(c.totalCost + c.expected.optExtraCost)} · ${fmtDays(c.expected.optDays)}`, 'One roll for the first section, then one for the rest at the hardest spell\'s chance') : '')
            : row('Expected total', 'never: a spell cannot succeed')}
        <div class="eyebrow eyebrow-strong" style="margin-top: 10px;">Chance per spell, per section</div>
        ${c.chances.map(ch => row(`${escapeHtml(ch.name)} (${ch.level})`, `${ch.pct}%`)).join('')}
        <p class="sub-caption">On a failure the section is discarded and made again. Optional rule: roll once for the first section, then once for the rest; a failure there redoes 1d4 × 10% of them.</p>
        ${c.warnings.map(w => `<p class="sub-caption arc-note" style="color: var(--danger);">${escapeHtml(w)}</p>`).join('')}`;
}

function saveSkyshipDesign(mode) {
    if (!skyDesign) return;
    const d = skyDesign;
    const c = vesselDesignCalc(d);
    const list = vesselsState();
    let v = skyDesignVessel ? findVessel(skyDesignVessel) : null;
    const name = (d.name || '').trim() || (v && v.name) || 'New skyship';
    const motiveText = { fly: 'Fly', wind: 'Wind (sails)', monsters: c.monster ? `Flying monsters: ${c.monsters} × ${c.monster.name}` : 'Flying monsters', other: 'Oars, muscle or machine' }[d.motive];
    const liftText = { fly: 'fly', float: 'float in air', levitate: 'levitate', none: '' }[d.lift];
    const record = {
        name, description: `${VESSEL_FORMS[d.hull].name.split(' ')[0]} ${d.shape === 'ship' ? 'ship-shaped' : d.shape} skyship${d.plating ? `, ${VESSEL_FORMS[d.plating].name.split(' ')[0].toLowerCase()} plating` : ''}`,
        motive: `${motiveText}${liftText && d.lift !== d.motive ? `; lift: ${liftText}` : ''}`,
        length: d.length, beam: d.beam, depth: d.depth, tonnage: fmtTons(c.tonnage), lift: c.lift ? fmtTons(c.lift) : '', cargo: c.lift ? fmtTons(Math.max(0, c.lift - c.tonnage)) : '',
        crew: `${d.crew || 0} sailors${d.officers ? `, ${d.officers} officers` : ''}${d.marines ? `, ${d.marines} marines` : ''}`, passengers: d.passengers || '',
        ac: c.ac, hpMax: c.hp, mf: mfText(c.mf), airDay: c.day, airEnc: c.effectiveEnc, cost: Math.round(c.totalCost),
        enchantments: (d.spells || []).filter(s => s.name).map(s => { const u = VESSEL_USES.find(x => x.id === s.use); return s.use === 'perm' ? s.name : `${s.name} (${s.n} ${u ? u.label.toLowerCase() : ''})`; })
            .concat(d.liftEnh ? [`Lift enhanced ×${d.liftEnh}`] : []).concat(d.speedEnh ? [`Speed enhanced ×${d.speedEnh}`] : []),
        upkeep: c.monster ? c.monsters * c.monster.upkeep : '',
        artilleryText: (d.fittings || []).filter(f => f.name && Number(f.weight) > 0 || /ram|catapult|ballista|cannon|trebuchet/i.test(f.name || '')).map(f => `${Math.max(1, Number(f.qty) || 1) > 1 ? `${f.qty} × ` : ''}${f.name}`).join(', '),
        design: JSON.parse(JSON.stringify(d)),
    };
    if (v) {
        Object.assign(v, record);
        if (mode === 'building' && v.status !== 'building') { v.status = 'building'; v.build = { sections: c.sections, done: 0, cost: Math.round(c.enchantCost + c.enhanceCost), otherCost: Math.round(c.totalCost - c.enchantCost - c.enhanceCost), spent: 0, perSectionDays: c.days / Math.max(1, c.sections) }; }
        else if (v.build && v.status === 'building') Object.assign(v.build, { sections: c.sections, cost: Math.round(c.enchantCost + c.enhanceCost), otherCost: Math.round(c.totalCost - c.enchantCost - c.enhanceCost), perSectionDays: c.days / Math.max(1, c.sections) });
    } else {
        v = { id: vesselId(), status: mode, origin: 'built', artillery: [], defenses: [], hp: c.hp, ...record };
        if (mode === 'building') v.build = { sections: c.sections, done: 0, cost: Math.round(c.enchantCost + c.enhanceCost), otherCost: Math.round(c.totalCost - c.enchantCost - c.enhanceCost), spent: 0, perSectionDays: c.days / Math.max(1, c.sections) };
        list.push(v);
        vesselsLog(`${mode === 'building' ? 'Began building' : 'Designed'} the skyship ${name}: ${fmtTons(c.tonnage)}, AC ${c.ac}, ${c.hp} hull points, Air Speed ${c.day} (${c.effectiveEnc}); ${fmtVGp(c.totalCost)} and ${fmtDays(c.days)} to enchant.`);
    }
    closeSkyshipDesigner();
    vesselsSave();
}

Object.assign(window, {
    renderVessels, openVesselEditor, vesselHull, vesselSectionDone, launchVessel, openSkyshipDesigner, closeSkyshipDesigner,
    saveSkyshipDesign, skySpellSet, skySpellAdd, skySpellRemove, vesselsMonthlyBills, vesselDesignCalc,
    skyFitSet, skyFitAdd, skyFitRemove, vesselPayOther,
});
