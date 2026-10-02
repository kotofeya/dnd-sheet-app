// js/arcana-data.js — rules data from GAZ3 The Principalities of Glantri (TSR 9208).
// The Seven Secret Crafts (pp. 69-76), the Great School of Magic (pp. 58-59),
// Creating Spells and Magical Items (pp. 64-66) and the Secret of the Radiance (pp. 68, 77-78).

const GAZ3 = 'GAZ3 The Principalities of Glantri';

// Study cycle per circle (p. 69). Cycle = days to study one ability; cost = ducats per day;
// xp = XP the disciple must earn with the new ability before the next cycle (then lost);
// level = minimum level to start the circle; base = success % before adding +1% per level.
const CRAFT_CIRCLES = [
    null,
    { circle: 1, cycle: 14, cost: 500,  xp: 5000,  level: 5,  base: 60, uses: 3, per: 'day',   usesLabel: '3 a day' },
    { circle: 2, cycle: 28, cost: 1000, xp: 10000, level: 7,  base: 50, uses: 2, per: 'day',   usesLabel: '2 a day' },
    { circle: 3, cycle: 42, cost: 1500, xp: 20000, level: 10, base: 40, uses: 1, per: 'day',   usesLabel: '1 a day' },
    { circle: 4, cycle: 56, cost: 2000, xp: 35000, level: 15, base: 30, uses: 1, per: 'week',  usesLabel: '1 a week' },
    { circle: 5, cycle: 70, cost: 2500, xp: 55000, level: 20, base: 20, uses: 1, per: 'month', usesLabel: '1 a month' },
];

const CRAFT_RULES = [
    'To enter an order you must find a disciple who will sponsor you, then swear loyalty. Revealing the craft gets you expelled and probably hunted.',
    'Abilities are innate, not spells: they need no memorising, but can be dispelled (except alchemy). A failed attempt counts as a use.',
    'Each ability takes one study cycle, paid in advance to the teacher. At the end roll d20 under Intelligence, or study it again.',
    'After learning an ability you must earn its circle\'s XP by using it before starting another cycle. Those XP are lost, not counted toward your level, and until they are earned the ability\'s success chance is halved.',
    'Learn every ability of a circle before the next. The 4th-circle disciple finds the way to the 5th alone, then duels the High Master: the 5th-circle ability is gained only by defeating him.',
    'A roll of 01 is always a mishap (see each ability).',
];

const SECRET_CRAFTS = {
    alchemy: {
        name: 'Alchemy', order: 'The Masters of Alchemy', title: 'Alchemist', bookName: "Alchemist's Codex", page: 70,
        summary: 'Rare ingredients and compounds; the alteration of matter, energy or bodies. Abilities are laboratory experiments, not spells: 1d6 hours at the 1st circle up to 5d6 at the 5th, uninterrupted (-5% per minor interruption). One experiment at a time.',
        notes: [
            'Laboratory: 5,000 dc per circle (25,000 dc for a High Master). Components cost 500 dc a month plus 1,000 dc per experiment; in Glantri City finding them takes a week per 1,000 dc, twice that elsewhere.',
            'Field laboratory: 3,000 dc per circle, usable up to the 3rd circle; ten uses, then 500 dc to restock. Chances of success are halved.',
        ],
        detail: { key: 'lab', label: 'Laboratory', options: ['Full laboratory', 'Field laboratory (chances halved)', 'None'] },
        abilities: [
            { id: 'alch_find', circle: 1, name: 'Find Components', text: 'Identify every component of a non-magical item or substance: minerals, metals, compounds, gases, liquids, plants, flesh. Ideal for detecting and identifying poisons. 01: a false interpretation.' },
            { id: 'alch_prep', circle: 1, name: 'Alchemical Preparation', text: 'Concoct a powder, balm or liquid with a specific effect. The formula must first be researched in a laboratory (as spell research) and written in the Codex. Preparations last 1d4 days. Not magical, but they can imitate neutralize poison, cure disease, cure light wounds (1d6 hp per character per day) or purify food and water, or make poisons, inflammable oil, smoke devices. The DM rolls in secret; 01 means harmful components.' },
            { id: 'alch_findmagic', circle: 2, name: 'Find Magical Components', text: 'As Find Components, but identifies the components of magical potions and items, and detects the kind of energy radiating from an item (electrical, Radiance, magical...). 01: a false interpretation.' },
            { id: 'alch_magprep', circle: 2, name: 'Magical Preparation', text: 'As Alchemical Preparation, but creates magical or clerical potions at half price without knowing the spells. Use the normal chance for making potions or the alchemist\'s success roll, whichever is better. Powders, balms, pills or oils are possible. They last 1d4 days per level of the alchemist. 01: a flaw in the components (effects up to the DM).' },
            { id: 'alch_transmute', circle: 3, name: 'Transmute Matter', text: 'Change one non-living object into another non-living matter (minerals, crystals, metals, gas, liquid, wood, hides, bone...). Up to 10 cn per level, 1 cu. ft. of gas or 1 quart of liquid per level; the result weighs the same, remaining matter burns away. The original must be a single item. Gems made are worth 1 dc per level per cn. 01: a fireball, 1d6 per 10 cn transmuted (max 20d6, save for half).' },
            { id: 'alch_energy', circle: 4, name: 'Transcend Energy', text: 'Focus energy into matter: a bolt from the sky in a storm, the Radiance (Brotherhood members), concentrated sunlight in a solar eruption, or spells dealing 60d6 at once. Recharges magic items, animates golems or constructs (1 HD per level), reverses ageing (1 week per level) or recalls a creature to life (dead no more than 1 day per level). Needs a laboratory device with a 12,000 dc component, destroyed at each use. 01: a fireball destroys the laboratory (1d6 per level, max 20d6, save for half).' },
            { id: 'alch_mutate', circle: 5, name: 'Mutate Lifeform', text: 'High Master. Alter part or all of your body (or a helpless man-sized victim\'s) into a mineral, metal, gas, liquid, crystal or another living flesh, gaining its innate abilities (troll flesh gives claws and bite, not regeneration; dragon flesh no breath). Only appearance and consistency change. 01: the recipient becomes that matter or lifeform for good.' },
        ],
    },
    dracology: {
        name: 'Dracology', order: 'The Masters of Dragons', title: 'Dracologist (Dragon Master)', bookName: 'Dragon lore', page: 71,
        summary: 'Protection from dragons, imitation of their powers, control, and finally becoming one. Choose a dragon colour matching your alignment (kept secret until an ability reveals it). You can speak the chosen dragons\' language. Abilities take a round to take effect; at higher levels they match large or huge specimens.',
        notes: [
            'Colours: Lawful crystal or gold; Neutral blue or onyx; Chaotic black or red. The colours of the Dragon Rulers cannot be chosen.',
        ],
        detail: { key: 'colour', label: 'Dragon colour', options: ['Crystal', 'Gold', 'Blue', 'Onyx', 'Black', 'Red', 'White', 'Green', 'Sapphire', 'Amber', 'Ruby', 'Jade', 'Pearl', 'Brown'] },
        abilities: [
            { id: 'drac_prot', circle: 1, name: 'Protection from Dragons', text: 'Automatic against dragons totalling up to your level in HD; beyond that a dragon saves vs. magic at +2 per level of difference. Protected, it cannot harm you, breathe on you or attack, but can converse and block you. Lasts while it stays visible within 150\'. Broken if you or your party attack it, steal its treasure or eggs, or cast spells on it; then it cannot be affected again until the next day. Dragons of your colour count as 3 levels higher. 01: enraged dragons attack.' },
            { id: 'drac_tooth', circle: 2, name: 'Dragon Tooth', text: 'Shadow fangs attack up to 20\' away, dealing your dragon\'s bite damage (white 2d8, black 2d10...) if your level is at least its Hit Dice, otherwise 2d6. Ends after five successful attacks.' },
            { id: 'drac_eye', circle: 2, name: 'Dragon Eye', text: 'Recognise any polymorphed dragon with no more HD than your level, and see through illusions dragons use to conceal themselves. One round per level.' },
            { id: 'drac_paw', circle: 2, name: 'Dragon Paw', text: 'Grow dragon claws on one or both hands, dealing the dragon\'s claw damage (white 1d4/1d4, black 2-5/2-5...), or 1-3 per hand below the required level. One round per level.' },
            { id: 'drac_scale', circle: 2, name: 'Dragon Scale', text: 'Scales give the chosen dragon\'s Armour Class (white AC 3, black AC 2...), or AC 4 until you reach the required level. One round per level.' },
            { id: 'drac_wing', circle: 2, name: 'Dragon Wing', text: 'Grow wings and fly at the dragon\'s speed, carrying 100 lb per dragon HD (two Dragon Paws needed for over 200 lb). Below the required level: 60\' per round, max 500 lb. One round per level.' },
            { id: 'drac_breath', circle: 3, uses: 3, name: 'Dragon Breath', text: 'Use your dragon\'s breath weapon (cone), its damage based on your own hit points; half your hit points below the required level. Three breaths per day.' },
            { id: 'drac_might', circle: 4, name: 'Dragon Might', text: 'Charm dragons totalling your level in HD; a mental link lets you command them by concentration and ride them without falling. If concentration breaks they keep doing what they were told. One turn per level.' },
            { id: 'drac_mastery', circle: 5, name: 'High Mastery of Dragons', text: 'High Master. Take your dragon\'s form in 1d4 rounds with all its statistics and abilities; revert to use human magic and items. From 24th level you may try to become the lesser Dragon Ruler of your alignment, which means a duel with the true one.' },
        ],
    },
    elementalism: {
        name: 'Elementalism', order: 'The Masters of the Elements', title: 'Elementalist', bookName: 'Academy notes', page: 72,
        summary: 'Protection from elemental forces, then conjuring and controlling elementals; the High Master can become an elemental. There are four rival Academies (Air, Water, Fire, Earth); you deal only with your own element and speak its elementals\' language. Abilities take 1d4 rounds.',
        notes: [
            'Taught spells, at the appropriate levels: dispel magic, protection from evil 10\' radius, conjure elemental, plus Fire: fire ball, wall of fire; Water: water breathing, lower water; Earth: wall of stone, move earth; Air: fly, weather control.',
            'These spells are taught only once you have learned every ability of the circle that matches your level.',
        ],
        detail: { key: 'academy', label: 'Academy', options: ['Air', 'Water', 'Fire', 'Earth'] },
        taughtSpells: { all: ['Dispel Magic', 'Protection from Evil 10\' Radius', 'Conjure Elemental'], Fire: ['Fire Ball', 'Wall of Fire'], Water: ['Water Breathing', 'Lower Water'], Earth: ['Wall of Stone', 'Move Earth'], Air: ['Fly', 'Weather Control'] },
        abilities: [
            { id: 'elem_prot', circle: 1, name: 'Protection from Elements', text: 'Half damage from your element: Fire (spells, breath, heat, fire elementals), Water (waves, ice, snow, water elementals), Earth (falling rocks, stone missiles, earth elementals), Air (winds, storms, whirlwinds, air elementals). Walk up to 90\' or 3 rounds over lava / water / quicksand and mud / clouds and smoke.' },
            { id: 'elem_minor', circle: 2, name: 'Minor Conjuration', text: 'Conjure 1d4 elementals of your academy, each with no more HD than your level; you control no more HD than your level, the rest are hostile. Give one order per level of complexity; no concentration needed. Control lasts a day per level, until dispelled or the mission ends. 01: a 16 HD elemental of the opposing plane, hostile. Dispel magic or dispel evil sends an unfriendly elemental back.' },
            { id: 'elem_major', circle: 3, name: 'Major Conjuration', text: 'Conjure and control any creature native to your plane: a djinni (Air), an undine (Water), an efreeti (Fire) or a kryst (Earth). Otherwise as Minor Conjuration. 01: the creatures are hostile.' },
            { id: 'elem_control', circle: 4, name: 'Full Elemental Control', text: 'Shape and move non-living matter of your element for 1 round per level; it can fight as a 12 or 16 HD elemental and moves up to 20\' per round. Air: winds up to a hurricane in 4\' radius per level, deflect non-magical missiles, carry you at 360\'. Water: still or storm 3\' radius per level, breathe water. Fire: put out or raise fire 2\' radius per level, walls of fire, immune to heat. Earth: shape stone 1\' radius per level, immune to falling stone and lava. 01: the area goes out of control and future elementalist checks suffer -10% permanently.' },
            { id: 'elem_meta', circle: 5, name: 'Metamorphosis', text: 'High Master. Become an elemental of your academy with HD equal to your level, keeping your spells and items, and enter or leave its plane at will. 01: the elemental ruler hunts you.' },
        ],
    },
    illusionism: {
        name: 'Illusionism', order: 'The Masters of Illusions', title: 'Illusionist', bookName: 'Dream journal', page: 73,
        summary: 'Abilities that influence what people see or think by affecting their minds directly, using emanations from the Dimension of Nightmares. They alter perception in every victim at once.',
        notes: [
            'On entering the order you are taught phantasmal force, confusion and hallucinatory terrain; for illusionists the last two become 3rd-level spells.',
        ],
        taughtSpells: { all: ['Phantasmal Force', 'Confusion', 'Hallucinatory Terrain'] },
        abilities: [
            { id: 'ill_hyp', circle: 1, name: 'Hypnosis', text: 'Speak casually for five rounds to sway one or more people (total HD or levels up to yours); the DM rolls in secret. Not a magical effect. Victims trust you and do whatever you say unless it is obviously dangerous: forget things, tell the truth, carry out one mission. The trance lasts until they are slapped or hurt or the mission ends. 01: you hypnotise yourself.' },
            { id: 'ill_dream', circle: 2, name: 'Dream Alteration', text: 'Affect one intelligent creature\'s dreams up to 1 mile per level: false messages or nightmares change an NPC\'s reasoning if it fails an Intelligence check next morning, and the night gives no rest (no spell recovery). You can send nightmare monsters (up to 1 HD per level); if they win, the victim loses a point of Constitution until it rests. Two failures on the same victim and you can never affect it again. 01: you must fight a nightmare yourself; if beaten you lose a point of Constitution permanently.' },
            { id: 'ill_delirium', circle: 3, name: 'Delirium Tremens', text: 'Illusions of any size in victims\' minds (1 HD or level per your level, within 120\'), plausible to every sense, needing no light. As phantasmal force, but damage is real: monsters from the Dimension of Nightmares, or other effects at 1d6 per level (max 20d6). Lasts as long as it takes. 01: you dream yourself into the Dimension of Nightmares until someone wakes you.' },
            { id: 'ill_shadow', circle: 4, name: 'Shadow Reality', text: 'Control shadows for 1 round per level: dimension door from one dark area to another, or stay in darkness as a non-corporeal form seen only by detect invisible (you can cast spells, affecting only shadows). Create immobile shadow objects (walls, doors, stairs, bridges), one yard per level; light spells act on them as dispel magic. 01: you are sent to the Dimension of Nightmares.' },
            { id: 'ill_dreamlands', circle: 5, name: 'Dreamlands', text: 'High Master. Enter or leave the Dimension of Nightmares once a month, build a stronghold of solid shadow there, and gate its creatures (up to your level in HD, once a month) to the Prime Plane on missions.' },
        ],
    },
    necromancy: {
        name: 'Necromancy', order: 'The Masters of Necromancy', title: 'Necromancer', bookName: 'Book of Necrology', page: 74,
        summary: 'The science of the dead: protection from undead, control, creation, recalling spirits; the High Master knows the secret of lichdom. Recognised as legitimate magic in Glantri; disciples are usually chaotic.',
        notes: [
            'Create Undead ceremonies are researched like spells: every 2 HD of undead equals a spell level (zombies 1st, wraiths 2nd, vampires 5th, revenants 9th). Liches cannot be created.',
        ],
        abilities: [
            { id: 'nec_prot', circle: 1, name: 'Protection from Undead', text: 'Keep at bay undead totalling up to your levels in HD (lower ones first; pawns of an affected liege stop counting). Lasts until you or your party attack them. 01: you fall prey to your own power and cannot harm undead unless one attacks you in melee.' },
            { id: 'nec_control', circle: 2, name: 'Control Undead', text: 'Control undead totalling up to your level in HD (never liches) until the next full moon; they obey to the best of their abilities up to 24 miles away, without concentration. You may destroy any undead you control by dismissing its soul. Can also be used as a cleric\'s turning, as a cleric of your level. 01: you become the pawn of the toughest undead present (or fall cataleptic for 1d8 hours if they are mindless).' },
            { id: 'nec_create', circle: 3, name: 'Create Undead', text: 'Perform a researched ceremony (in your Book of Necrology) to create undead permanently under your control, no more HD per ceremony than your level. 1d6 turns per creature, or 1d6 hours per asterisk. Needs a body (or part of one for spirits). Cannot be dispelled except skeletons and zombies. 01: your life force is drained, 1d6 damage per HD attempted +5 per asterisk; if this kills you, you rise as that undead.' },
            { id: 'nec_raise', circle: 4, name: 'Raise Dead', text: 'Recall a soul from beyond the grave, as the clerical spell raise dead fully. 01: you lose 1 Constitution per 2 levels or HD of the target (recover 1 per night of full rest); at 0 Constitution you crumble to ashes, beyond any raising.' },
            { id: 'nec_lich', circle: 5, name: 'Attain Lichdom', text: 'High Master. Become a lich (one day per level of ordeal): control undead as a liege, keep all other abilities, but never gain another level; prime components are a pint of nightcrawler venom and a red imp\'s skull. 01: you become a screaming demon under the DM\'s control.' },
        ],
    },
    cryptomancy: {
        name: 'Cryptomancy', order: 'The Masters of the Runes', title: 'Cryptomancer (Runemaster)', bookName: 'Book of Runes', page: 75,
        summary: 'All things have a truename; knowing a thing\'s rune lets you control it. Runes do not need memorising but each must be researched like a spell and written in your Book of Runes. Using a rune without opening the book needs an extra Intelligence check.',
        notes: [
            'Overusing runes upsets the balance of nature. On a roll of 01: no rune used yet today - a hurricane (24-mile radius, 1d12 hours); one rune already used - a minor earthquake (12 miles); two - a violent earthquake (36 miles); three or more - storm and earthquake, all magic and runes fail for 6d4 hours and the last rune used is forgotten.',
        ],
        runeLimit: true,
        abilities: [
            { id: 'cry_matter', circle: 1, name: 'Runes of Matter', text: 'Research runes for non-living materials (gold, steel, granite, sand, crystal, water, glass, leather, silk, tar...), each as a common 1st-level spell. With the rune you reshape matter within a one-foot sphere per level for 1d4 rounds; the change then becomes permanent or reverts, as you choose.' },
            { id: 'cry_life', circle: 2, name: 'Runes of Life', text: 'Research runes for non-intelligent or animal-intelligence life (fox, eagle, zombie, gray ooze, oak, iron statue, rust monster...), each as a 3rd-level spell. Affect up to your level in HD (or a one-foot sphere per level): a telepathic link, and the creature follows your orders as if charmed. One turn per level.' },
            { id: 'cry_power', circle: 3, name: 'Runes of Power', text: 'Research runes for energies (fire, cold, electricity, wind, light, gravity...), each as a 5th-level spell. Alter an energy within a one-foot sphere per level: up to 1d6 per level (max 20d6), or reduce its damage. Lasts up to 1 round per level.' },
            { id: 'cry_magic', circle: 4, name: 'Runes of Magic', text: 'Research runes for spell effects you know (each as a 7th-level spell) and inscribe one on an item with a trigger; it turns invisible (detect magic finds it, dispel magic removes it). Build magic circles that guard against an effect or a creature type. Five runes on one circle make it permanent; five runes of magic animate a golem (1 HD per level; 5,000 dc of components per asterisk).' },
            { id: 'cry_truename', circle: 5, name: 'Truename', text: 'High Master. Find the truename rune of one intelligent being (each as a new 9th-level spell, from 21st level) and command it as a Rune of Life. You can also read its memorised spells (Intelligence check) and cast them yourself.' },
        ],
    },
    witchcraft: {
        name: 'Witchcraft', order: 'The Mistresses of Witchcraft', title: 'Witch (Sorceress)', bookName: 'Book of brews', page: 76,
        summary: 'Age-old recipes and home-made magic: brews and philters, cursed dolls, charms and lies, curses. A few male wizards are sorcerers in this order.',
        notes: [
            'Each day you can cast spells from an open spellbook once per 6 levels, without memorising them.',
            'On finishing each circle you lose 2 points of Charisma (minimum 3): hunched backs, warts, bone deformities, horrible voices.',
        ],
        chaLoss: 2,
        abilities: [
            { id: 'wit_brews', circle: 1, name: 'Brews and Philters', text: 'As Magical Preparation, but always potions: poisons, philters of love (charms), soporifics and the like. A witch can join the 1st circle at 5th level and make potions then, at half the normal enchantment cost. They last 1d4 days per level. 01: a flaw - the poison helps or the charm breeds pathological hatred.' },
            { id: 'wit_tongue', circle: 1, name: 'Silver Tongue', text: 'Speak so persuasively that NPCs and monsters must save vs. spells or believe you, as long as your arguments are plausible and you speak their language. 01: the victims realise you are lying.' },
            { id: 'wit_doll', circle: 2, name: 'Doll Curse', text: 'Make two dolls of a personal foe (a day per level of the victim), hide one in their house and use the other nightly: Dolls of Pain (1d6 a night), Dolls of Sickness (a disease no magic cures until the doll is destroyed) or Dolls of Insanity. Up to three victims a night. 01: your doll is ruined and you suffer a minor curse.' },
            { id: 'wit_charm', circle: 2, name: "Witches' Charm", text: 'Purely phantasmal beauty: +1 Charisma per 3 levels (max 18, minimum 10) and your deformities go unnoticed, for 1 turn per level for everyone within 100\'. Dispel magic or any harmful act breaks it. 01: lose a point of Charisma permanently.' },
            { id: 'wit_spellbind', circle: 3, name: 'Spellbinding', text: 'Conjure loyal creatures of your alignment (gremlins, imps...) totalling up to your level in HD, and see, hear and talk through them. 01: one of them takes control of you for a day.' },
            { id: 'wit_curse', circle: 3, name: "Witches' Curse", text: 'As a reversed remove curse, but on up to your level in HD or levels; on a single victim it follows the family for generations equal to your level. Only a wish (or conditions you set) lifts it. 01: the curse falls on you and your family.' },
            { id: 'wit_shape', circle: 4, name: 'Shapechange', text: 'As the 9th-level magic-user spell: take the form of creatures of up to your level in HD (not a specific person), even several at once (a 10th-level witch as 10 black cats). One form is the original; if it dies, you die. 01: you cannot regain your human body until someone dispels the effect.' },
            { id: 'wit_possess', circle: 5, name: 'Ultimate Possession', text: 'High Mistress. As magic jar with no saving throw on a creature of lower level: use both your abilities and the victim\'s. 01: your own body dies and you are trapped in the victim.' },
        ],
    },
};

// Complementary courses of the Great School (p. 59). One at a time; finished on reaching the next level.
const SCHOOL_COURSES = [
    { id: 'agility', name: 'Agility Training', text: 'Roll d20 under Dexterity to cast while moving at a normal walking pace. Riding or dodging attacks adds a -1 to -10 penalty. If the roll fails the spell is lost.' },
    { id: 'companion', name: 'Conjure Companion', text: 'Summon a creature as your companion during a full moon: 2% per level, -10% per asterisk, using a part of that creature as the component. It has your level in hp and 1 HD per 2 points of Intelligence above 10, Intelligence 9-18, your alignment, and a mental link you can see and hear through. One at a time; it cannot be dismissed. If it dies you take damage equal to its hp and cannot conjure another for a year.' },
    { id: 'languages', name: 'Learning Languages', text: 'Learn one extra language per course, up to the number your Intelligence allows. Almost any language is taught.', repeatable: true },
    { id: 'mandragora', name: 'Mandragora', text: 'Recognise and safely harvest mandrake roots, used for soporific or truth drugs (Constitution check or sleep 1d6 days / answer 1d6 questions truthfully). At 9th level you can animate a root into a manikin.' },
    { id: 'meditation', name: 'Meditation', text: 'After an hour of absolute quiet, gain a bonus to one Intelligence check on a problem named to the DM: +1 up to 5th level, +2 up to 10th, and so on to +8 at 36th. It also improves chances of discovering spells, enchanting items and conjuring a companion.' },
    { id: 'quick', name: 'Quick Casting', text: 'Announce a spell at the start of a round with its components ready; it goes off first next round, before initiative. Change your mind and you do nothing that round.' },
    { id: 'combination', name: 'Spell Combination', text: 'Mix spell levels freely in your memorised spells, as long as the total spell levels do not exceed your capacity (a 4th-level magic-user with two 1st and two 2nd could memorise six 1st-level spells instead).' },
];

// The Secret of the Radiance (pp. 68, 77-78). Nobility rank: Baron 1 ... Prince 7.
const RADIANCE_RANKS = [
    { rank: 1, title: 'Baron',    callRange: 24 },
    { rank: 2, title: 'Viscount', callRange: 48 },
    { rank: 3, title: 'Count',    callRange: 72 },
    { rank: 4, title: 'Marquis',  callRange: 90 },
    { rank: 5, title: 'Duke',     callRange: 120 },
    { rank: 6, title: 'Archduke', callRange: 144 },
    { rank: 7, title: 'Prince',   callRange: 168 },
];
const RADIANCE_BODY_PARTS = ['Left hand', 'Right hand', 'Left arm', 'Right arm', 'Left leg', 'Right leg', 'Chest', 'Back', 'Head', 'Face'];
const RADIANCE_RULES = [
    'The Radiance is drawn only near your receptacle: a single crystal of at least 4,000 cn enchanted as a permanent 6th-level effect (36,000 dc). It must stay within your own dominion; the Brotherhood\'s first law is to draw the power of Rad only from your own fief.',
    'Every use of a Radiance spell has a 1% chance to rot a body part (hand, arm, leg, chest, back, head or face; ten in all), a disease no mortal magic heals. If the face or head rots you may lose Charisma, sight, hearing or speech. When the whole body is affected the wizard becomes a lich (21st level or more) or a zombie-like creature.',
    'Radiance spells are researched at twice the normal cost with half the normal chance. They cannot be bought or stolen; the ingredients and lore come from quests.',
    'The higher your title, the closer to the capital your dominion and the more power you can draw.',
];

// Spell research and enchantment (pp. 64-66).
const RESEARCH_MATERIALS = [
    { label: 'Precious stones (gems, crystal)', mod: 6 },
    { label: 'Precious metals (gold, silver)', mod: 4 },
    { label: 'Rare, elaborately carved woods', mod: 2 },
    { label: 'Common metal', mod: 0 },
    { label: 'Common wood', mod: -2 },
    { label: 'Common stones', mod: -4 },
    { label: 'Other mundane material (bone, claw, leather, powder...)', mod: -6 },
];
const RESEARCH_TIME_LIMITS = [
    { label: 'No limit', cut: 0 },
    { label: 'Usable hourly', cut: 20 },
    { label: 'Usable daily', cut: 25 },
    { label: 'Usable weekly', cut: 30 },
    { label: 'Usable monthly', cut: 35 },
];
const RESEARCH_RULES = [
    'Spell research needs a large library (a major city\'s or a Wizard-Prince\'s, or your own) and components, usually from a monster with HD at least equal to the spell level.',
    'Cost: 1,000 dc x spell level. Time: a week plus a day per 1,000 dc. You spend 1,000 dc a day until the DM calls for the roll, and may stop to adventure and resume later.',
    'Chance: (Intelligence + level) x 2, minus 3 per spell level for a common spell or 5 for a new one. A roll of 95 or more always fails.',
    'Magic items need 9th level and a component for each effect. Effects are rolled separately, as new spells (as common spells once you have made that item before). Each interruption costs 5%.',
    'Your own library must be worth 4,000 dc for 1st-level research plus 2,000 dc per further spell level. Every 2,000 dc above that minimum adds +1% (max +10%), and 10% of the gold spent on each discovery is added to its value.',
];
