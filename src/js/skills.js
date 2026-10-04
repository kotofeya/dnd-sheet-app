// js/skills.js — Полный модуль General Skills

// Descriptions follow the Rules Cyclopedia, Chapter 5 (General Skills), where it has the skill; the others come from
// GAZ5 The Elves of Alfheim, GAZ6 The Dwarves of Rockhome, GAZ10 The Orcs of Thar, GAZ11 The Republic of Darokin,
// Dawn of the Emperors (Players' Guide to Thyatis) and GAZ13 The Shadow Elves.
// SKILL_REFS (below) credits every skill to the earliest of these books.
const GENERAL_SKILLS_DATABASE = {
    // Strength
    'intimidation': { name: 'Intimidation', ability: 'strength', desc: 'Bully NPCs into doing what you want by threatening violence or dire consequences. Does not work on player characters or on NPCs of 5th level or higher, nor (at the DM\'s option) on someone in a much stronger position. Intimidated NPCs are unlikely ever to become your friends.' },
    'muscle': { name: 'Muscle', ability: 'strength', desc: 'Heavy lifting and hard labour: direct work gangs efficiently and use simple machinery (wedges, pulleys, levers). A successful check gives +2 to Strength rolls for tasks such as opening doors.' },
    'wrestling': { name: 'Wrestling', ability: 'strength', desc: 'In wrestling combat, a successful roll gives +1 to your wrestling rating (see Unarmed Combat). Each extra slot raises the bonus by 1 more (Wrestling +1 gives +2, and so on).' },

    // Intelligence
    'alchemy': { name: 'Alchemy', ability: 'intelligence', desc: 'Recognise and identify common alchemical substances, potions and poisons. If the DM allows it, a success lets you make an antidote for one specific type of poison.' },
    'alternate_magics': { name: 'Alternate Magics', ability: 'intelligence', desc: 'Basic familiarity with magic not related to standard spellcasting, including the magical abilities of well-known Prime Plane and extraplanar monsters and of Immortals. The DM defines what the skill covers.' },
    'art_int': { name: 'Art', ability: 'intelligence', hasSpec: true, specLabel: 'Art Form', desc: 'Create one form of art (painting, sculpture, woodcarving, mosaic, etc.); take the skill again for each other form. Presenting an NPC with a portrait or sculpture of them and making the roll gives +2 to their reaction.' },
    'artillery': { name: 'Artillery', ability: 'intelligence', desc: 'Either command the crew of a catapult or trebuchet (the DM may call for a roll each time you aim at a new target), or oversee building and repairing siege equipment. Take the skill twice to know both.' },
    'craft': { name: 'Craft', ability: 'intelligence', hasSpec: true, specLabel: 'Craft Type', desc: 'One craft such as armour-making, bow-making, tattooing, leatherworking, smithing or weapon-making. You can make a living at it and, with a successful roll, give expert opinions on it.' },
    'disguise': { name: 'Disguise', ability: 'intelligence', desc: 'Make a character look like someone else. Roll once for each character or group you are trying to fool; each target makes a Wisdom roll against your Disguise roll to see through it.' },
    'engineering': { name: 'Engineering', ability: 'intelligence', desc: 'Plan, design and build large structures (houses, bridges, dams). A large structure not built under a trained engineer will collapse or suffer some other calamity. Also lets you judge a structure\'s condition, age and builders.' },
    'fire_building': { name: 'Fire-Building', ability: 'intelligence', desc: 'With a tinderbox you start fires automatically in ordinary conditions. Without one, roll 1d6 each round and a 1 or 2 lights the fire. High winds or wet wood need a skill check with DM penalties.' },
    'healing': { name: 'Healing', ability: 'intelligence', desc: 'Restore 1d3 hit points to a wounded human or demihuman, once per set of wounds (usually all damage from one fight). A natural 20 inflicts 1d3 damage instead and that set of wounds cannot be treated again. Also diagnoses illness; making the roll by 5 or more tells whether it is natural or magical.' },
    'hunting': { name: 'Hunting', ability: 'intelligence', desc: 'Locate and stalk game. A success gives +1 to hit with a bow, sling or spear against an unaware target in a peaceful outdoor setting (not usable in most combats). You forage for yourself automatically in fertile areas; feeding one other person needs a daily roll, with a penalty of 1 for each extra person.' },
    'knowledge': { name: 'Knowledge', ability: 'intelligence', hasSpec: true, specLabel: 'Field of Study', desc: 'Expert in one field such as the culture or geography of an area, history, legends or theology. You can make a living teaching it and, with a successful roll, give expert commentary.' },
    'labor': { name: 'Labor', ability: 'intelligence', hasSpec: true, specLabel: 'Labor Trade', desc: 'Accomplished at one type of labour such as bricklaying, farming, mining or stonecutting. You can make a living at it and, with a successful roll, interpret information in light of your trade.' },
    'language': { name: 'Language', ability: 'intelligence', hasSpec: true, specLabel: 'Language Name', desc: 'Speak an extra language (not necessarily well) and read it if you can read your own. You understand slow, simple speech automatically; excited or technical speech, or explaining something complicated yourself, needs a roll.' },
    'lip_reading': { name: 'Lip Reading', ability: 'intelligence', desc: '"Overhear" a conversation if you can see the speakers\' lips and understand the language. The DM applies penalties for distance and poor light.' },
    'magical_engineering': { name: 'Magical Engineering', ability: 'intelligence', desc: 'Recognise the basic principles of unfamiliar magical devices and identify most common magic items with a successful roll. It cannot identify uncommon items or tell cursed or trapped items from safe ones, and gives no training in making them.' },
    'mapping': { name: 'Mapping/Cartography', ability: 'intelligence', desc: 'Understand and make maps even if you cannot read. Simple maps need no roll; interpreting or drafting complicated layouts, or mapping from memory, does. Not needed simply to map a dungeon while exploring.' },
    'military_tactics': { name: 'Military Tactics', ability: 'intelligence', desc: 'Interpret enemy troop movements and deploy your own forces. You decide your plan first; the DM rolls secretly and, on a success, tells you truthfully whether you read the situation right (with advice if not). The result sets bonuses or penalties in mass combat.' },
    'mimicry': { name: 'Mimicry', ability: 'intelligence', desc: 'Mimic animal noises and foreign-language accents convincingly, so animal-call signals do not give your party away.' },
    'nature_lore': { name: 'Nature Lore', ability: 'intelligence', hasSpec: true, specLabel: 'Terrain', desc: 'Common plants and animals of one terrain (desert, forest, jungle, mountain/hill, open sea, plains or arctic): edible and poisonous plants, healing herbs, signs of unnatural danger. -2 to the roll in your home terrain, none in similar terrain, up to +4 in very different terrain.' },
    'navigation': { name: 'Navigation', ability: 'intelligence', desc: 'Always know roughly where you are from the sun and stars. A successful roll, modified by distance from home and familiarity with the area, gives your position more precisely.' },
    'planar_geography': { name: 'Planar Geography', ability: 'intelligence', desc: 'General knowledge of the Prime, Inner, Outer, Astral and Ethereal Planes, including ways of travelling between them and their common inhabitants.' },
    'profession': { name: 'Profession', ability: 'intelligence', hasSpec: true, specLabel: 'Profession Title', desc: 'One non-labour profession such as politics, cooking, estate management, horse grooming or scribing (scribes must be literate). You can make a living at it and, with a successful roll, give expert commentary.' },
    'science': { name: 'Science', ability: 'intelligence', hasSpec: true, specLabel: 'Science Branch', desc: 'Expert in one branch of science such as astronomy, geology or metallurgy; you can make a living at it in large cities. Suited to characters from civilised lands, not primitive cultures.' },
    'shipbuilding': { name: 'Shipbuilding', ability: 'intelligence', desc: 'Design and supervise construction of professional-quality ships, by muscle or magic. Also lets you evaluate ships you meet: who built them and when.' },
    'signaling': { name: 'Signaling', ability: 'intelligence', hasSpec: true, specLabel: 'Signal System', desc: 'Leave messages only another Signaling specialist of the same culture, guild, army or school can read: trumpet calls, naval flags, smoke, drums, rock piles and so on. You must have a chance to learn the system.' },
    'snares': { name: 'Snares', ability: 'intelligence', desc: 'Build traps to catch animals, monsters and unwanted visitors. A successful roll means the trap works; the DM adjusts for time and materials available.' },
    'survival': { name: 'Survival', ability: 'intelligence', hasSpec: true, specLabel: 'Terrain', desc: 'Find food, shelter and water in one terrain: desert, forest/jungle, mountain/hill, open sea, plains or arctic. You forage for yourself automatically in fertile areas, even on the move; feeding others needs a daily roll at +1 per extra person.' },
    'tracking': { name: 'Tracking', ability: 'intelligence', desc: 'Follow tracks. The DM adjusts the roll for the age of the tracks, terrain, number of creatures and so on.' },
    'veterinary_healing': { name: 'Veterinary Healing', ability: 'intelligence', hasSpec: true, specOptional: true, specLabel: 'Specialty (leave blank for General)', desc: 'Healing for non-humans, monsters and animals. General: +1 penalty per type of creature treated. Specialized (one class of creature, e.g. equines): no penalty on your specialty, +2 on all others. Treating a human or demihuman is at +3.' },

    // Wisdom
    'animal_training': { name: 'Animal Training', ability: 'wisdom', hasSpec: true, specLabel: 'Animal Type', desc: 'Raise, train and care for one type of animal and teach it simple tricks or orders. A horse trainer can train any horse or pony; training dogs as well is a separate skill.' },
    'art_wis': { name: 'Art', ability: 'wisdom', hasSpec: true, specLabel: 'Art Form', desc: 'The Art skill rolled on Wisdom instead of Intelligence. Create one form of art (painting, sculpture, woodcarving, mosaic, etc.). Presenting an NPC with a portrait or sculpture of them and making the roll gives +2 to their reaction.' },
    'bravery': { name: 'Bravery', ability: 'wisdom', desc: 'A successful roll lets you resist the effects of any magical fear. An NPC with this skill can also ignore morale checks and Intimidation.' },
    'caving': { name: 'Caving', ability: 'wisdom', desc: 'Always know where you are in caves, caverns, underground rivers and mazes, and the route you took if conscious. Roll when disoriented or fleeing a long way; without the skill you get lost automatically.' },
    'ceremony': { name: 'Ceremony', ability: 'wisdom', hasSpec: true, specLabel: 'Immortal Name', desc: 'Honour one Immortal through ritual and ceremony, knowing its code of behaviour and pleasing rites. Lets a cleric perform his order\'s rituals and, if the DM allows, may gain the Immortal\'s attention.' },
    'danger_sense': { name: 'Danger Sense', ability: 'wisdom', desc: 'Detect an imminent danger, though not its nature or source. The DM rolls secretly and only tells you if the roll succeeds and danger is present.' },
    'detect_deception': { name: 'Detect Deception', ability: 'wisdom', desc: 'Recognise deceptive behaviour in an NPC; it only warns you to distrust them, not what is false or why. The DM rolls and tells you the result. Does not work on player characters.' },
    'gambling': { name: 'Gambling', ability: 'wisdom', desc: 'Win money at honest games of skill and betting; a successful roll improves your chances of winning.' },
    'law_justice': { name: 'Law and Justice', ability: 'wisdom', hasSpec: true, specLabel: 'Culture or Nation', desc: 'The laws and courts of one culture or country; needed to be a judge or advocate. Take the skill again for each other nation\'s laws.' },
    'mysticism': { name: 'Mysticism', ability: 'wisdom', desc: 'For non-clerics: instinctively know how best to please the Immortals in general, such as recognising an idol and paying it due respect.' },

    // Dexterity
    'acrobatics': { name: 'Acrobatics', ability: 'dexterity', desc: 'Acrobatic feats and balancing on ropes and wires; failure may mean a fall. A successful roll reduces the effective height of a fall by 10\'. The DM may give +2 to saves against traps where agility helps (tilting floors, pits). Mystics have this ability without buying the skill.' },
    'alertness': { name: 'Alertness', ability: 'dexterity', desc: 'Draw a weapon without losing time, avoid the effects of surprise, and wake at the slightest out-of-place noise.' },
    'blind_shooting': { name: 'Blind Shooting', ability: 'dexterity', desc: 'Shoot at a target you cannot see but can hear. On a successful check you make a normal attack roll without the usual darkness penalties.' },
    'cheating': { name: 'Cheating', ability: 'dexterity', desc: 'Win at gambling by cheating. Each other player rolls the best of Cheating, Gambling at -1 or Intelligence at -4 against your roll, and spots you if their roll is lower. Chaotic characters only.' },
    'escape': { name: 'Escape', ability: 'dexterity', desc: 'Get free when tied up or locked up; opening a locked door needs a second roll. The DM adjusts for the ropes and knots, the lock, and lack of tools.' },
    'mountaineering': { name: 'Mountaineering', ability: 'dexterity', desc: 'Climb difficult mountains and cliffs with ropes, pitons and gear, and rig lines so non-climbers can follow. Does not replace a thief\'s Climb Walls.' },
    'piloting': { name: 'Piloting', ability: 'dexterity', hasSpec: true, specLabel: 'Vessel Type', desc: 'The Riding skill for vessels, one category per skill: small boats, galleys, sailing ships, or flying vessels. Flying carpets and brooms need no skill.' },
    'quick_draw': { name: 'Quick Draw', ability: 'dexterity', desc: 'A successful check lets you nock and fire an arrow with +2 to individual initiative.' },
    'riding': { name: 'Riding', ability: 'dexterity', hasSpec: true, specLabel: 'Mount Type', desc: 'Care for and control one type of mount in difficult situations; rolling is only needed when the animal is spooked or similar. Using a weapon while mounted needs a roll. Wrong type of animal: +4 to the roll. No Riding skill at all: Dexterity check at +8.' },
    'stealth': { name: 'Stealth', ability: 'dexterity', hasSpec: true, specLabel: 'Terrain', desc: 'Move very quietly in one terrain: city/outdoors, indoors/caves, forest/jungle, plains, desert, arctic or mountains/hills. Roll when sneaking up on someone or when you might be heard; the DM may roll for you.' },

    // Constitution
    'endurance': { name: 'Endurance', ability: 'constitution', desc: 'Run or keep up a demanding task for an hour per successful check, with a cumulative +1 penalty for each extra hour. When you finish or fail and collapse, rest three times as long as you worked.' },
    'food_tasting': { name: 'Food Tasting', ability: 'constitution', desc: 'Taste food and water to tell whether it has spoiled. Detects added poison only if the DM rules that it has a taste.' },

    // Charisma
    'acting': { name: 'Acting', ability: 'charisma', desc: 'Make a living as a stage actor, assume a different personality or show false emotions. A success lets you tell convincing lies for a limited time.' },
    'bargaining': { name: 'Bargaining', ability: 'charisma', desc: 'A successful roll gets the best deal available for goods, services or information, though rarely something for nothing.' },
    'deception': { name: 'Deception', ability: 'charisma', desc: 'Make an NPC believe an untrue statement or accept a misleading one as honest; failure means you sound unconvincing. Does not work on player characters.' },
    'leadership': { name: 'Leadership', ability: 'charisma', desc: 'A success adds +1 to the morale of NPCs under your control and can convince other NPCs to follow your commands. NPCs with good reason not to follow resist automatically. Unlike Intimidation, it makes no enemies.' },
    'music': { name: 'Music', ability: 'charisma', hasSpec: true, specLabel: 'Instrument Group', desc: 'Play one group of related instruments skilfully: stringed, brass, percussion, woodwind, etc. Take the skill again for each other group.' },
    'persuasion': { name: 'Persuasion', ability: 'charisma', desc: 'Convince NPCs of your honesty and sincerity; you must believe what you say. The listener believes you but need not agree to what you propose. The DM adds +1 to +8 against a hostile audience.' },
    'singing': { name: 'Singing', ability: 'charisma', desc: 'Sing skilfully; you can make a living at it and may become a famous entertainer or bard.' },
    'storytelling': { name: 'Storytelling', ability: 'charisma', desc: 'Captivate an audience with stories and make a living as a storyteller; with a Knowledge skill such as history, you can tell stories of it.' },

    // ---- Skills from the Gazetteers and Dawn of the Emperors (not in the Rules Cyclopedia) ----
    // Strength
    'brawling': { name: 'Brawling', ability: 'strength', desc: 'Fight crowds with furniture and whatever is at hand: knock attackers off balance, swing from chandeliers and so on. Brawling damage is not lethal; a victim reduced to 0 hp is knocked out. A successful check doubles your damage for each +1 of your Strength bonus, spread among up to 10 attackers of the same group.' },

    // Intelligence
    'acting_int': { name: 'Acting (pretence)', ability: 'intelligence', desc: 'Pretend to be someone else or show false emotions; a success lets you keep up a lie over a period of time. GAZ13 bases this on Intelligence and says it is not the same as the Charisma skill of stage acting.' },
    'ancient_history': { name: 'Ancient History', ability: 'intelligence', desc: 'Detailed knowledge of your own people\'s history (for shadow elves, their own), general knowledge of the histories of neighbouring races and nations, and vague knowledge of more distant peoples.' },
    'boating': { name: 'Boating', ability: 'intelligence', desc: 'Handle small boats and barges, including fishing. Simple tasks are automatic; roll only in dangerous or unusual situations (a good roll may also warn of rapids ahead). GAZ5 lists it as Boat Handling.' },
    'doctor': { name: 'Doctor', ability: 'intelligence', desc: 'Treat wounds and diagnose illness. A success restores 1d3 hit points, once per set of wounds (all damage from one fight); new wounds can be treated again. A roll of 20 inflicts 1d3 damage and that set of wounds cannot be treated by you again. A success also diagnoses an illness, and made by 5 or more tells whether it is natural or magical.' },
    'helmsman_captain': { name: 'Helmsman/Captain', ability: 'intelligence', desc: 'Handle a larger ship and direct a competent crew. It does not cover challenges to the captain\'s authority, such as a mutiny, which call for Charisma or skills like Leadership or Persuasion.' },
    'hiding': { name: 'Hiding', ability: 'intelligence', desc: 'Hide like a forest hunter (Grunalf clan skill). Lots of cover +1, little cover -1, moving while hiding -2, very little cover -3, non-forest terrain -3, no cover -5; level 1-3 -1, level 7-10 +1, raised in the terrain +1. Made by 5 or more: even an elf spots you only on 1 in 1d6; by 10 or more, nobody finds you unless you reveal yourself.' },
    'know_terrain': { name: 'Know Terrain', ability: 'intelligence', hasSpec: true, specLabel: 'Region', desc: 'Knowledge of the land, water and conditions of one region: safest or fastest routes, local tunnels and waterways, environmental dangers. +2 in your home dominion; -2 to -4 in an unfamiliar but similar region. A beginning shadow elf cannot take it for a surface region.' },
    'magic_lore': { name: 'Knowledge of Magic Lore', ability: 'intelligence', desc: 'Long Runner clan skill, a Knowledge skill about magic: ancient magic items are likely to be known to you, and you can often work out the basic operation of a new item from your grasp of magical principles.' },
    'tree_of_life_lore': { name: 'Knowledge of the Tree of Life', ability: 'intelligence', desc: 'Feadiel clan skill: the care and treatment of Trees of Life and the uses of their properties. A successful roll about a Tree of Life\'s use or history gives one specific answer; the DM adjusts for how obscure the question is.' },
    'non_elvish_cultures': { name: 'Non-elvish Cultures', ability: 'intelligence', hasSpec: true, specOptional: true, specLabel: 'Region (leave blank for your homeland)', desc: 'General knowledge of the non-elvish races of a region (the Broken Lands for shadow elves): an incomplete grasp of their customs, ways of war and magic, and a very basic vocabulary.' },
    'read_write_language': { name: 'Read/Write Language', ability: 'intelligence', hasSpec: true, specLabel: 'Language', desc: 'Read and write one language, human, demihuman or humanoid. A check is needed each time you read or write it.' },
    'song_writing': { name: 'Song Writing', ability: 'intelligence', desc: 'Compose songs and music. GAZ5 lists the skill without an ability; Intelligence is used here (the DM may choose Charisma).' },

    // Wisdom
    'animal_empathy': { name: 'Animal Empathy', ability: 'wisdom', hasSpec: true, specLabel: 'Animals', desc: 'An affinity with one group of animals (GAZ5: forest animals): sense their moods and calm or befriend them. GAZ5 lists the skill without an ability or rules; Wisdom is used here and the DM sets its effects.' },
    'cooking': { name: 'Cooking', ability: 'wisdom', desc: 'Prepare everyday rations (for shadow elves, trania, their compressed preserved food) and, on feast days, special delicacies.' },
    'first_aid': { name: 'First Aid', ability: 'wisdom', desc: 'Simple medical aid: a success restores 1d4 hit points to any wounded character or creature, once per injury (again only after the patient is fully healed and wounded anew). A roll of 20 inflicts 1d4 damage instead.' },
    'guidance_counsel': { name: 'Guidance/Counsel', ability: 'wisdom', desc: 'The advisory skill of the kindly old cleric. You work out your advice for someone in trouble, then roll; on a success the DM tells you how accurate or helpful your idea is.' },
    'natural_healing': { name: 'Natural Healing', ability: 'wisdom', desc: 'Herbal and fungal cures. A success gives a poisoned character a second saving throw at -2, or lets patients heal naturally at 2 hp per day of complete rest.' },
    'teaching': { name: 'Teaching', ability: 'wisdom', desc: 'Teach a skill efficiently: on a success your apprentice learns it with a permanent +1, as long as his final score stays no higher than yours.' },

    // Dexterity
    'dancing': { name: 'Dancing', ability: 'dexterity', desc: 'Move rhythmically and gracefully to music; elves, surface and shadow alike, are superb dancers.' },
    'escape_artist': { name: 'Escape Artist', ability: 'dexterity', thief: 'Open Locks', desc: 'Shadow elf thief skill, similar to Open Locks. Not rolled on Dexterity: use the chance of a thief of your level, one level higher for each extra slot.' },
    'evade': { name: 'Evade', ability: 'dexterity', desc: 'Elude a pursuer. A success gives +10\' per round of movement for 10 rounds, or, when hiding, dodging or outguessing the pursuer, finds you a way to be overlooked.' },
    'find_traps': { name: 'Find Traps', ability: 'dexterity', thief: 'Find Traps', desc: 'Shadow elf thief skill: find the traps in a corridor or room after observing it (the margin of success shows how many). Setting or disarming each trap needs another check. Use the chance of a thief of your level, one level higher per extra slot.' },
    'hear_noise': { name: 'Hear Noise', ability: 'dexterity', thief: 'Hear Noise', desc: 'Shadow elf thief skill: hear faint noises or pick one sound from many and know its source. Gives +1 to Blind Shooting checks, or +1 to hit when shooting in the dark without that skill. Use the chance of a thief of your level, one level higher per extra slot.' },
    'hide_in_shadows': { name: 'Hide in Shadows', ability: 'dexterity', thief: 'Hide in Shadows', desc: 'Shadow elf thief skill, as the thief ability. Use the chance of a thief of your level, one level higher per extra slot.' },
    'juggling': { name: 'Juggling', ability: 'dexterity', desc: 'Juggle three objects of similar shape and size; more objects need a check at -1 per object beyond four, as do objects of different weights.' },
    'jump': { name: 'Jump', ability: 'dexterity', desc: 'Leap over obstacles and across gaps of up to 10\', or 20\' with a running start.' },
    'ledge_hopping': { name: 'Ledge Hopping', ability: 'dexterity', desc: 'Hop safely from one rocky ledge to another within 6\' with reasonable encumbrance, and pick the safest, most stable ledge on your way. Some circumstances call for a check.' },
    'martial_arts': { name: 'Martial Arts', ability: 'dexterity', hasSpec: true, specLabel: 'Style (Offensive or Defensive)', desc: 'Choose one style. Offensive: add your Strength bonus to open-hand or natural attacks, and a successful check doubles the damage (not the bonus). Defensive: AC permanently 1 better, and a check lets you dodge a nonmagical missile.' },
    'move_silently': { name: 'Move Silently', ability: 'dexterity', thief: 'Move Silently', desc: 'Shadow elf thief skill, as the thief ability. Use the chance of a thief of your level, one level higher per extra slot.' },
    'rapid_fire': { name: 'Rapid Fire', ability: 'dexterity', desc: 'A success lets you shoot a bow twice in a round, each at -3 to hit: the first arrow on your side\'s initiative, the second at the end of the round.' },
    'rope_use': { name: 'Rope Use', ability: 'dexterity', desc: 'Tie knots and make nets. A check is needed to throw a net, lasso or grapple so that it takes a solid hold.' },
    'skinwing_flying': { name: 'Skinwing Flying', ability: 'dexterity', desc: 'Control and ride a skinwing. Check in dangerous situations or when the beast is hit; on a failure it spins out of control until you make a check (one each round).' },
    'treewalking': { name: 'Treewalking', ability: 'dexterity', desc: 'Stay aloft in trees, cross between close-set trees and work or fight from a branch. Normal movement succeeds automatically; roll in storms, while fighting or for complex tasks. Home or sentinel oak +1, unfamiliar species -1, dead tree -2; level 1-3 -1, level 7-10 +1, over 800,000 XP +2, raised in Alfheim +1. Every Alfheim elf starts with it.' },
    'weapon_mastery_skill': { name: 'Weapon Mastery', ability: 'dexterity', hasSpec: true, specLabel: 'Weapon', desc: 'GAZ13 option: trade a skill choice to gain weapon mastery with one weapon (Master Players Book rules), and one more choice for each further mastery level. Record the rank itself on the Combat tab.' },

    // Constitution
    'drinking': { name: 'Drinking', ability: 'constitution', desc: 'Hold your drink. The first failed check means you are drunk; the second, you pass out.' },
    'slow_respiration': { name: 'Slow Respiration', ability: 'constitution', desc: 'Survive in a small air space, for example after a cave-in: a check each day at a cumulative -1 per day trapped (under water, -1 per minute). A failed roll means death by suffocation.' },
    'stamina': { name: 'Stamina', ability: 'constitution', desc: 'Keep up hard physical activity and endure hardship: run twice as long (40 rounds) before exhaustion, move as if one encumbrance class lighter, and +2 on Constitution checks against bad weather and fatigue.' },

    // Charisma
    'gain_trust': { name: 'Gain Trust', ability: 'charisma', desc: 'Win an NPC\'s trust through courtesy, respect for tradition and honourable behaviour; he treats you as trustworthy until given solid evidence otherwise. Enough by itself in routine situations (an inn, a farmstead); against hostile or wary NPCs the DM applies penalties or an opposed roll against the NPC\'s Wisdom.' },
    // ---- GAZ10 The Orcs of Thar (humanoid skills) ----
    'war_machine_engineering': { name: 'War Machine Engineering', ability: 'intelligence', desc: 'Manoeuvre a war machine and use its weapons, and command its crew to get the best out of it: +1 to the morale of the war machine\'s crew. Building one takes weeks or months, depending on its size and the materials at hand.' },
    'executioner': { name: 'Executioner', ability: 'wisdom', desc: 'The sinister art of making a prisoner talk, or frightening him into it. The victim can ignore a successful check by making a morale check (monsters and NPCs) or a Bravery check (characters).' },
    'tribal_healing': { name: 'Tribal Healing', ability: 'wisdom', desc: 'Tribal medicine (GAZ10 calls it Healing, on Wisdom). A companion below 0 hp loses no more than 1 hp a day; someone at 0 hp or more heals 1 hp a day. A check is needed to cure a natural disease; it does nothing against magical ones.' },
    'monster_empathy': { name: 'Monster Empathy', ability: 'wisdom', hasSpec: true, specLabel: 'Monster Type', desc: 'Sense and communicate basic feelings with one type of monster within 100\'. Each attempt needs a check, at -1 per Hit Die the monster has over you. Goblin tribal secret.' },
    'monster_training': { name: 'Monster Training', ability: 'wisdom', hasSpec: true, specLabel: 'Monster Type', desc: 'Raise, train and care for one type of monster of animal intelligence and teach it simple tricks or orders. A check each time it is used for anything significant, at -1 per Hit Die it has over its trainer.' },
    'outdoor_stealth': { name: 'Outdoor Stealth', ability: 'dexterity', hasSpec: true, specLabel: 'Terrain', desc: 'Like a thief\'s Hide in Shadows, but usable outdoors in full daylight in one terrain: caverns, grassy plains or hills, broken terrain, or city streets. Red orc tribal secret.' },
    'odor_scenting': { name: 'Odor Scenting', ability: 'dexterity', desc: 'Identify smells and their source; faint smells need a check. Gives +1 to Tracking and to Blind Shooting.' },
    'fighting_frenzy': { name: 'Fighting Frenzy', ability: 'constitution', desc: 'Keep fighting after being reduced to 0 hp or less: a check each round you fight below 0 hp. You collapse when a check fails or the fight ends. Bugbear tribal secret.' },
    'sleeping': { name: 'Sleeping', ability: 'constitution', desc: 'Sleep through anything: a successful check lets you sleep through a brawl or a battle. Handy for shamans who need rest and meditation. Troll tribal secret.' },
    'bawling': { name: 'Bawling', ability: 'charisma', desc: 'Shouting and verbal abuse to bully an NPC into doing what you want: on a success an NPC with fewer Hit Dice obeys. NPCs with as many HD or levels or more may ignore it with a morale or Bravery check. +1 to Commanding Troops, rising with each improvement. The Charisma version of Intimidation.' },
    'servility': { name: 'Servility', ability: 'charisma', desc: 'Grovel and look so pitiful that a tormentor or foe leaves you alone or spares your life for another day. With a success and a fitting penalty they might even let you go (but not your party). Works on NPCs only; role-play it.' },
    'singing_marches': { name: 'Singing Marches', ability: 'charisma', desc: 'Marching songs for horde leaders: +1 to your troops\' morale, and on a successful check the whole troop joins in, giving the enemy -1 to morale. Drinking songs count too: a success gives a bonus to reaction rolls.' },

    // ---- GAZ11 The Republic of Darokin (trades and merchant skills) ----
    'advocacy': { name: 'Advocacy', ability: 'wisdom', desc: 'Argue a criminal case in court. More specialised and more effective there than Lawyer (Law and Justice) or Persuasion; it will not make a judge ignore obvious facts, but it can decide a typical trial.' },
    'appraisal': { name: 'Appraisal', ability: 'intelligence', desc: 'Judge the value of an object; the DM gives a bonus for familiar goods and a penalty for ones wholly new to you. In GAZ11\'s trade rules a failed roll misjudges a cargo\'s value by 5% for each point you missed by. Darokin racial specialty of halflings.' },
    'armorer': { name: 'Armorer', ability: 'intelligence', desc: 'Design, make and maintain armour, and understand the protection each type gives, including its weak points. Darokin racial specialty of dwarves.' },
    'bargemaking': { name: 'Bargemaking', ability: 'intelligence', desc: 'Design and build barges for rivers and small lakes (they are not built for rough water). The DM sets the time from the supplies, labour and conditions available.' },
    'barrelmaking': { name: 'Barrelmaking', ability: 'intelligence', desc: 'Make barrels, a trade much in demand in small villages, and spot poor workmanship in barrels you buy.' },
    'blacksmithing': { name: 'Blacksmithing', ability: 'intelligence', desc: 'Work a forge and make tools and implements of iron, steel and similar metals; also repair broken or damaged metal items. Darokin racial specialty of dwarves.' },
    'bowyer': { name: 'Bowyer', ability: 'intelligence', desc: 'Make bows and other archery gear, and judge the workmanship and value of any bow you come across. Darokin racial specialty of elves.' },
    'brewing': { name: 'Brewing', ability: 'intelligence', desc: 'Brew beers, ales, liquors and wines, and judge alcoholic drinks well enough to spot a vintage worth selling elsewhere. Darokin racial specialty of halflings.' },
    'cabinetmaking': { name: 'Cabinetmaking', ability: 'intelligence', desc: 'Make furniture; you also spot hidden compartments and the like more easily than others (though not as well as a thief). Darokin racial specialty of halflings.' },
    'canvasmaking': { name: 'Canvasmaking', ability: 'intelligence', desc: 'Make sturdy canvas from hemp and cotton; in Darokin\'s ports it means a career in the sail-making trade.' },
    'cartmaking': { name: 'Cartmaking', ability: 'intelligence', desc: 'Build carts and similar vehicles, and repair and maintain existing ones.' },
    'cobbler': { name: 'Cobbler', ability: 'intelligence', desc: 'Make and repair shoes and boots: keeping a party\'s footwear in order keeps them fast and comfortable on long marches. Darokin racial specialty of dwarves.' },
    'drayer': { name: 'Drayer', ability: 'intelligence', desc: 'Load carts and wagons so the cargo neither shifts nor gets damaged on an overland trip; caravans hire drayers to set up and travel with them.' },
    'drover': { name: 'Drover', ability: 'intelligence', desc: 'Drive herds of animals where they are meant to go, and direct teams pulling very heavy loads.' },
    'farming': { name: 'Farming', ability: 'intelligence', desc: 'Raise crops and run a farm, one of the commonest skills in the Darokin countryside. (The Rules Cyclopedia treats farming as a type of Labor.)' },
    'finance': { name: 'Finance', ability: 'intelligence', desc: 'The finer points of money: letters of credit, loans, trusts, partnerships, interest rates. Moneylenders and the accounting branches of merchant houses hire people with this skill.' },
    'fletching': { name: 'Fletching', ability: 'intelligence', desc: 'Make arrows and crossbow bolts, usually marked so the maker (or, if made to order, the buyer) can be identified. Darokin racial specialty of elves.' },
    'gemcutting': { name: 'Gemcutting', ability: 'intelligence', desc: 'Split large gems into smaller ones for jewellery, or improve a stone\'s look; it can also disguise a stolen gem by cutting it up. Darokin racial specialty of dwarves.' },
    'glassblowing': { name: 'Glassblowing', ability: 'dexterity', desc: 'A rare talent: make glassware for daily use or as works of art. Darokin glass is among the finest in the Known World. Darokin racial specialty of elves.' },
    'jeweler': { name: 'Jeweler', ability: 'intelligence', desc: 'Make fine jewellery and ornaments; Darokinian jewellers are among the best in the Known World and live well. Darokin racial specialty of dwarves.' },
    'leatherworking': { name: 'Leatherworking', ability: 'dexterity', desc: 'Design, make and repair leather goods, cure hides, and judge the quality and value of leather items. Darokin racial specialty of elves.' },
    'lumberjack': { name: 'Lumberjack', ability: 'strength', desc: 'Fell trees and cut them into raw timber; respected work around Alfheim. Finished goods are for cabinetmakers, woodworkers and cartmakers.' },
    'mining': { name: 'Mining', ability: 'intelligence', desc: 'More than knowing how a mine is built and run: judge the best place for a mine and find ore where less skilled miners think it is worked out. Every dwarf of Rockhome learns Mining and Engineering (GAZ6). Darokin racial specialty of dwarves. (The Rules Cyclopedia treats mining as a type of Labor.)' },
    'negotiating': { name: 'Negotiating', ability: 'intelligence', desc: 'Set up and close complex business deals and political agreements, combining economics, law and logic. Large business transactions call for this rather than Bargaining.' },
    'netmaking': { name: 'Netmaking', ability: 'dexterity', desc: 'Make and repair nets for fishing and the like; a skilled netmaker can make snares strong enough for powerful beasts or even magical monsters.' },
    'potter': { name: 'Potter', ability: 'dexterity', desc: 'Make everyday pottery or fine works of art, and judge other potters\' work.' },
    'ropemaking': { name: 'Ropemaking', ability: 'dexterity', desc: 'Make anything from heavy hemp rope to fine silk cord, and inspect a rope before use to find weak points that would otherwise go unnoticed until too late.' },
    'saddlemaking': { name: 'Saddlemaking', ability: 'intelligence', desc: 'Make saddles, saddlebags, bridles and other riding gear, for unusual mounts too if you can study the beast first.' },
    'shepherd': { name: 'Shepherd', ability: 'intelligence', desc: 'Keep a flock of domestic animals within an area (where a drover moves herds along a trail).' },
    'spinning': { name: 'Spinning', ability: 'dexterity', desc: 'Spin fine thread, yarn and cord; with Weaving you can also turn it into cloth.' },
    'stonecutting': { name: 'Stonecutting', ability: 'intelligence', desc: 'Work stone, from rough block construction to finely detailed carving. Darokin racial specialty of dwarves. (The Rules Cyclopedia treats stonecutting as a type of Labor.)' },
    'tailor': { name: 'Tailor', ability: 'intelligence', desc: 'Make clothing from thread and cloth; a master tailor\'s fine apparel is valuable and sought after by the rich. Darokin racial specialty of halflings.' },
    'toolmaking': { name: 'Toolmaking', ability: 'intelligence', desc: 'Make tools such as hammers and vices, and understand "how things work": by watching a process you can often devise a new tool to save time or improve quality.' },
    'trapbuilding': { name: 'Trapbuilding', ability: 'intelligence', desc: 'Build security devices against thieves; it also gives a small chance to spot and disarm traps (no substitute for a thief, and the DM should use it carefully). Darokin racial specialty of dwarves and halflings.' },
    'wagonmaking': { name: 'Wagonmaking', ability: 'intelligence', desc: 'Build and repair wagons; nearly every big caravan takes a wagonmaker along in case of a major breakdown.' },
    'weaponsmithing': { name: 'Weaponsmithing', ability: 'intelligence', desc: 'Make weapons, including your own; a skilled weaponsmith is sought out by adventurers wanting the finest arms. Darokin racial specialty of dwarves.' },
    'weaving': { name: 'Weaving', ability: 'dexterity', desc: 'Weave thread and yarn into fabric or cloth; many weavers also have the Tailor skill.' },
    'wheelwright': { name: 'Wheelwright', ability: 'intelligence', desc: 'Make wheels and wheeled vehicles; a perfectly balanced wheel is rare and valuable.' },
    'woodworking': { name: 'Woodworking', ability: 'intelligence', desc: 'Make fine art or useful items from many woods, with carving and a wide range of carpentry. Darokinian woodworkers are among the best in the Known World. Darokin racial specialty of elves.' },
};

// Books the general skills come from, oldest first. A skill found in several books is credited to the
// earliest; the others are listed as "also in". The descriptions follow the Rules Cyclopedia where it has
// the skill, otherwise the book that introduced it.
// Release dates (year, month) from the Mystara Collector's Guide, so books of the same year sort right.
const SKILL_BOOKS = {
    GAZ5:  { short: 'GAZ5',  title: 'GAZ5 The Elves of Alfheim', year: 1988.02 },
    GAZ6:  { short: 'GAZ6',  title: 'GAZ6 The Dwarves of Rockhome', year: 1988.04 },
    GAZ10: { short: 'GAZ10', title: 'GAZ10 The Orcs of Thar', year: 1988.12 },
    GAZ11: { short: 'GAZ11', title: 'GAZ11 The Republic of Darokin', year: 1989.02 },
    DotE:  { short: 'DotE',  title: 'Dawn of the Emperors: Players\' Guide to Thyatis', year: 1989.07 },
    GAZ13: { short: 'GAZ13', title: 'GAZ13 The Shadow Elves', year: 1990.05 },
    RC:    { short: 'RC',    title: 'Rules Cyclopedia', year: 1991.10 },
};
// key: [[book, page, name used there (if different), or '~note'], ...]
const SKILL_REFS = {
    // Strength
    intimidation: [['DotE', 21, 'Intimidate'], ['RC', 83], ['GAZ10', 35, 'Intimidate']],
    muscle: [['DotE', 21], ['GAZ13', 17], ['RC', 83], ['GAZ10', 35]],
    wrestling: [['DotE', 21], ['RC', 84]],
    brawling: [['GAZ13', 17], ['GAZ10', 35]],
    // Intelligence
    acting_int: [['GAZ13', 17, 'Acting']],
    alchemy: [['GAZ13', 17], ['RC', 81]],
    alternate_magics: [['GAZ13', 17], ['RC', 82]],
    ancient_history: [['GAZ13', 17]],
    art_int: [['RC', 82]],
    artillery: [['GAZ13', 17], ['RC', 82], ['GAZ10', 35]],
    boating: [['GAZ5', 51, 'Boat Handling'], ['GAZ13', 17]],
    craft: [['GAZ5', 49, 'Craftsman'], ['DotE', 21, 'Craftsman'], ['GAZ13', 17], ['RC', 82], ['GAZ6', 15, 'Craftsman'], ['GAZ10', 35, 'Craftsman']],
    disguise: [['GAZ13', 18], ['RC', 82]],
    engineering: [['GAZ13', 17, '~as a Profession'], ['RC', 82], ['GAZ6', 16, '~required of every dwarf'], ['GAZ10', 35, 'Stone Engineering'], ['GAZ11', 9, 'Building']],
    fire_building: [['RC', 82], ['GAZ10', 35]],
    healing: [['RC', 82]],
    doctor: [['DotE', 21]],
    helmsman_captain: [['GAZ13', 18]],
    hiding: [['GAZ5', 50]],
    hunting: [['RC', 83]],
    know_terrain: [['GAZ13', 18]],
    knowledge: [['GAZ5', 50], ['DotE', 21], ['RC', 83], ['GAZ6', 15], ['GAZ10', 35]],
    magic_lore: [['GAZ5', 50]],
    tree_of_life_lore: [['GAZ5', 50]],
    labor: [['GAZ5', 50], ['DotE', 21], ['RC', 83], ['GAZ6', 15]],
    language: [['DotE', 23, '~optional rule'], ['RC', 83], ['GAZ10', 38, '~costs a skill choice']],
    lip_reading: [['DotE', 21], ['RC', 83]],
    magical_engineering: [['RC', 83]],
    mapping: [['DotE', 22, 'Mapping (Cartography)'], ['GAZ13', 18], ['RC', 83], ['GAZ10', 35]],
    military_tactics: [['GAZ5', 50], ['DotE', 22], ['GAZ13', 18, 'Tactics'], ['RC', 83], ['GAZ6', 16], ['GAZ10', 35, 'Tactics']],
    mimicry: [['DotE', 22], ['GAZ13', 20, 'Sound Imitation'], ['RC', 83], ['GAZ10', 38, 'Sound Imitation']],
    nature_lore: [['GAZ13', 18], ['RC', 83]],
    navigation: [['DotE', 22], ['GAZ13', 18], ['RC', 83], ['GAZ11', 11]],
    non_elvish_cultures: [['GAZ13', 18]],
    planar_geography: [['RC', 84]],
    profession: [['GAZ5', 50], ['DotE', 22], ['GAZ13', 17], ['RC', 84], ['GAZ6', 15]],
    read_write_language: [['GAZ13', 18]],
    science: [['GAZ5', 50], ['DotE', 22], ['RC', 84], ['GAZ6', 15]],
    shipbuilding: [['GAZ13', 17, 'Ship Building (craft)'], ['RC', 84], ['GAZ11', 11]],
    signaling: [['DotE', 22, 'Signalling'], ['GAZ13', 18], ['RC', 84], ['GAZ10', 35]],
    snares: [['GAZ13', 18], ['RC', 84], ['GAZ10', 36]],
    song_writing: [['GAZ5', 51]],
    survival: [['GAZ5', 51, 'Forest Survival'], ['DotE', 22], ['GAZ13', 18], ['RC', 84], ['GAZ6', 15], ['GAZ10', 36]],
    tracking: [['GAZ5', 49], ['DotE', 22], ['GAZ13', 18], ['RC', 84], ['GAZ6', 15], ['GAZ10', 36]],
    veterinary_healing: [['DotE', 21, 'Veterinarian (mentioned)'], ['RC', 84]],
    // Wisdom
    animal_empathy: [['GAZ5', 51]],
    animal_training: [['GAZ5', 51, 'Animal Trainer'], ['DotE', 22, 'Animal Trainer'], ['GAZ13', 18], ['RC', 82], ['GAZ10', 37], ['GAZ11', 9]],
    art_wis: [['RC', 82]],
    bravery: [['GAZ13', 18], ['RC', 82], ['GAZ10', 37]],
    caving: [['DotE', 22], ['GAZ13', 18, 'Orientation in Caves'], ['RC', 82], ['GAZ6', 15], ['GAZ10', 35, 'Orientation']],
    ceremony: [['DotE', 23, 'Honor (Specific Immortal)'], ['RC', 82]],
    cooking: [['GAZ13', 18], ['GAZ10', 37]],
    danger_sense: [['DotE', 22], ['GAZ13', 18], ['RC', 82], ['GAZ10', 37, 'Instinct']],
    detect_deception: [['DotE', 22], ['GAZ13', 19], ['RC', 82]],
    first_aid: [['GAZ13', 19]],
    gambling: [['DotE', 22], ['RC', 82], ['GAZ6', 15], ['GAZ10', 38, '~on Charisma'], ['GAZ11', 10, '~on Intelligence']],
    guidance_counsel: [['DotE', 23], ['GAZ6', 15]],
    law_justice: [['GAZ5', 51, 'Lore of Law and Justice'], ['DotE', 22, 'Codes of Law and Justice'], ['GAZ13', 18, 'Codes of Law and Justice'], ['RC', 83], ['GAZ6', 15, 'Codes of Law and Justice'], ['GAZ11', 10, 'Lawyer']],
    mysticism: [['RC', 83], ['GAZ10', 37]],
    natural_healing: [['GAZ13', 19]],
    teaching: [['GAZ5', 51], ['GAZ13', 19], ['GAZ6', 15], ['GAZ10', 37]],
    // Dexterity
    acrobatics: [['DotE', 23], ['RC', 81]],
    alertness: [['DotE', 23], ['GAZ13', 19], ['RC', 81], ['GAZ10', 37]],
    blind_shooting: [['GAZ13', 19], ['RC', 82], ['GAZ10', 37]],
    cheating: [['DotE', 23, 'Cheating/Gambling'], ['RC', 82], ['GAZ6', 15, 'Cheating/Gambling']],
    dancing: [['GAZ5', 51], ['GAZ13', 19]],
    escape: [['RC', 82]],
    escape_artist: [['GAZ13', 19], ['GAZ10', 37]],
    evade: [['GAZ13', 19]],
    find_traps: [['GAZ13', 19], ['GAZ10', 38]],
    hear_noise: [['GAZ13', 19], ['GAZ10', 38]],
    hide_in_shadows: [['GAZ13', 19], ['GAZ10', 38]],
    juggling: [['GAZ13', 19], ['GAZ6', 15]],
    jump: [['GAZ13', 20]],
    ledge_hopping: [['GAZ13', 20], ['GAZ10', 38]],
    martial_arts: [['GAZ13', 20], ['GAZ10', 38]],
    mountaineering: [['DotE', 23], ['GAZ13', 19, 'Climbing'], ['RC', 83], ['GAZ6', 15, 'Climbing'], ['GAZ10', 37, 'Climbing'], ['GAZ11', 9, 'Climbing']],
    move_silently: [['GAZ13', 20], ['GAZ10', 38]],
    piloting: [['RC', 84], ['GAZ11', 11, 'Ship Sailing']],
    quick_draw: [['GAZ13', 20], ['RC', 84]],
    rapid_fire: [['GAZ13', 20]],
    riding: [['GAZ5', 51], ['DotE', 23], ['GAZ13', 19, 'Horsemanship'], ['RC', 84], ['GAZ6', 15], ['GAZ10', 38, 'Riding Monster'], ['GAZ11', 11]],
    rope_use: [['GAZ13', 20], ['GAZ10', 38]],
    skinwing_flying: [['GAZ13', 20]],
    stealth: [['RC', 84]],
    treewalking: [['GAZ5', 49], ['DotE', 23, '~required for Alfheim elves']],
    weapon_mastery_skill: [['GAZ13', 20], ['GAZ10', 38]],
    // Constitution
    drinking: [['GAZ13', 20], ['GAZ10', 38]],
    endurance: [['RC', 82], ['GAZ10', 38]],
    food_tasting: [['RC', 82]],
    slow_respiration: [['GAZ13', 20], ['GAZ10', 38]],
    stamina: [['GAZ13', 20]],
    // Charisma
    acting: [['DotE', 23], ['RC', 81]],
    bargaining: [['GAZ5', 49], ['DotE', 23], ['GAZ13', 20, 'Bargain'], ['RC', 82], ['GAZ6', 15], ['GAZ11', 9, '~on Intelligence']],
    deception: [['DotE', 23, 'Deceive (Fast-Talk)'], ['GAZ13', 20, 'Deceive'], ['RC', 82]],
    gain_trust: [['GAZ13', 20]],
    leadership: [['DotE', 23], ['GAZ13', 20], ['RC', 83]],
    music: [['GAZ5', 51, 'Instrument Playing'], ['DotE', 23], ['GAZ13', 20], ['RC', 83], ['GAZ6', 15]],
    persuasion: [['GAZ5', 51], ['DotE', 23], ['GAZ13', 20, 'Persuade'], ['RC', 83], ['GAZ6', 15], ['GAZ11', 11]],
    singing: [['GAZ5', 50], ['DotE', 23], ['GAZ13', 20], ['RC', 84], ['GAZ6', 15]],
    storytelling: [['GAZ5', 51], ['GAZ13', 20, 'Storyteller'], ['RC', 84], ['GAZ6', 15], ['GAZ10', 38, 'Storyteller']],
    // GAZ10 The Orcs of Thar
    war_machine_engineering: [['GAZ10', 35]],
    executioner: [['GAZ10', 37]],
    tribal_healing: [['GAZ10', 37, 'Healing']],
    monster_empathy: [['GAZ10', 37]],
    monster_training: [['GAZ10', 37]],
    outdoor_stealth: [['GAZ10', 38]],
    odor_scenting: [['GAZ10', 38]],
    fighting_frenzy: [['GAZ10', 38]],
    sleeping: [['GAZ10', 38]],
    bawling: [['GAZ10', 38]],
    servility: [['GAZ10', 38]],
    singing_marches: [['GAZ10', 38]],
    // GAZ11 The Republic of Darokin
    advocacy: [['GAZ11', 9]],
    appraisal: [['GAZ11', 9]],
    armorer: [['GAZ11', 9]],
    bargemaking: [['GAZ11', 9]],
    barrelmaking: [['GAZ11', 9]],
    blacksmithing: [['GAZ11', 9]],
    bowyer: [['GAZ11', 9]],
    brewing: [['GAZ11', 9]],
    cabinetmaking: [['GAZ11', 9]],
    canvasmaking: [['GAZ11', 9]],
    cartmaking: [['GAZ11', 9]],
    cobbler: [['GAZ11', 10]],
    drayer: [['GAZ11', 10]],
    drover: [['GAZ11', 10]],
    farming: [['GAZ11', 10]],
    finance: [['GAZ11', 10]],
    fletching: [['GAZ11', 10]],
    gemcutting: [['GAZ11', 10]],
    glassblowing: [['GAZ11', 10]],
    jeweler: [['GAZ11', 10]],
    leatherworking: [['GAZ11', 11]],
    lumberjack: [['GAZ11', 11]],
    mining: [['GAZ6', 16, '~required of every dwarf'], ['GAZ11', 11]],
    negotiating: [['GAZ11', 11]],
    netmaking: [['GAZ11', 11]],
    potter: [['GAZ11', 11]],
    ropemaking: [['GAZ11', 11]],
    saddlemaking: [['GAZ11', 11]],
    shepherd: [['GAZ11', 11]],
    spinning: [['GAZ11', 11]],
    stonecutting: [['GAZ11', 11]],
    tailor: [['GAZ11', 11]],
    toolmaking: [['GAZ11', 11]],
    trapbuilding: [['GAZ11', 12]],
    wagonmaking: [['GAZ11', 12]],
    weaponsmithing: [['GAZ11', 12]],
    weaving: [['GAZ11', 12]],
    wheelwright: [['GAZ11', 12]],
    woodworking: [['GAZ11', 12]],
};

// The earliest book a skill appears in, and every book that has it.
function skillReferences(key) {
    const refs = (SKILL_REFS[key] || []).slice().sort((a, b) => (SKILL_BOOKS[a[0]]?.year || 9999) - (SKILL_BOOKS[b[0]]?.year || 9999));
    return refs.map(([book, page, as]) => ({ book, page, as, short: SKILL_BOOKS[book]?.short || book, title: SKILL_BOOKS[book]?.title || book }));
}
function skillRefNote(r) {
    if (!r.as) return '';
    return r.as.startsWith('~') ? ` (${r.as.slice(1)})` : ` (as ${r.as})`;
}
function skillSourceLabel(key) {
    const first = skillReferences(key)[0];
    return first ? `${first.short} p.${first.page}` : '';
}
function skillSourceTitle(key) {
    const refs = skillReferences(key);
    if (!refs.length) return '';
    const fmt = r => `${r.title}, p. ${r.page}${skillRefNote(r)}`;
    return `First in ${fmt(refs[0])}` + (refs.length > 1 ? `\nAlso in: ${refs.slice(1).map(fmt).join('; ')}` : '');
}

// Shadow elf "thief" skills use a thief's percentage instead of an ability roll:
// a thief of the character's level, one level higher per extra slot (GAZ13 p. 19).
function thiefSkillChance(character, thiefName, slots) {
    const thief = (typeof ClassesDatabase !== 'undefined' ? ClassesDatabase : window.ClassesDatabase || {})['Thief'];
    if (!thief || !thief.thiefSkillsMatrix || !thief.thiefSkillsList) return null;
    const lvl = Math.min(36, Math.max(1, (Number(character?.level) || 1) + (Number(slots) || 1) - 1));
    const v = thief.thiefSkillsMatrix[lvl]?.[thief.thiefSkillsList.indexOf(thiefName)];
    return typeof v === 'number' ? { value: v, level: lvl } : null;
}


let skillModalMode = 'standard'; // 'standard' | 'custom'

function showSkillError(msg) {
    const el = document.getElementById('skill-modal-error');
    if (!el) return;
    el.innerText = msg;
    el.style.display = 'block';
}

function clearSkillError() {
    const el = document.getElementById('skill-modal-error');
    if (el) el.style.display = 'none';
}

function setSkillModalMode(mode) {
    skillModalMode = mode;
    const stdBtn = document.getElementById('skill-tab-standard');
    const cstBtn = document.getElementById('skill-tab-custom');
    const stdFields = document.getElementById('skill-mode-standard-fields');
    const cstFields = document.getElementById('skill-mode-custom-fields');
    clearSkillError();

    if (mode === 'standard') {
        if (stdBtn) { stdBtn.style.background = 'var(--accent-gold)'; stdBtn.style.color = 'var(--on-accent)'; }
        if (cstBtn) { cstBtn.style.background = 'transparent'; cstBtn.style.color = 'var(--text-muted)'; }
        if (stdFields) stdFields.style.display = 'flex';
        if (cstFields) cstFields.style.display = 'none';
    } else {
        if (cstBtn) { cstBtn.style.background = 'var(--accent-gold)'; cstBtn.style.color = 'var(--on-accent)'; }
        if (stdBtn) { stdBtn.style.background = 'transparent'; stdBtn.style.color = 'var(--text-muted)'; }
        if (cstFields) cstFields.style.display = 'flex';
        if (stdFields) stdFields.style.display = 'none';
    }
}

function getIntelligenceSkillBonus(score) {
    const s = Number(score) || 10;
    if (s >= 18) return 3;
    if (s >= 16) return 2;
    if (s >= 13) return 1;
    return 0;
}

function getTotalSkillSlots(character) {
    if (!character) return 4;
    const lvl = Number(character.level) || 1;
    const intScore = character.abilities?.intelligence?.score ?? 10;
    const intBonus = getIntelligenceSkillBonus(intScore);
    const levelBonus = Math.floor((lvl - 1) / 4);
    return 4 + intBonus + levelBonus;
}

// Ranks granted for free (race, class, background, DM award) use no skill slots.
function skillFreeRanks(s) {
    return Math.max(0, Math.min(Number(s.freeSlots) || 0, Number(s.slots) || 1));
}
function getSpentSkillSlots(character) {
    if (!character || !Array.isArray(character.skills)) return 0;
    return character.skills.reduce((sum, s) => sum + (Number(s.slots) || 1) - skillFreeRanks(s), 0);
}
function getGrantedSkillRanks(character) {
    if (!character || !Array.isArray(character.skills)) return 0;
    return character.skills.reduce((sum, s) => sum + skillFreeRanks(s), 0);
}

function syncSkillsUI() {
    if (!currentCharacter) return;
    if (!Array.isArray(currentCharacter.skills)) currentCharacter.skills = [];

    const total = getTotalSkillSlots(currentCharacter);
    const spent = getSpentSkillSlots(currentCharacter);
    const avail = total - spent;

    const totalBadge = document.getElementById('skills-total-badge');
    const spentBadge = document.getElementById('skills-spent-badge');
    const availBadge = document.getElementById('skills-avail-badge');

    if (totalBadge) totalBadge.innerText = total;
    const grantedBadge = document.getElementById('skills-granted-badge');
    if (grantedBadge) grantedBadge.innerText = getGrantedSkillRanks(currentCharacter);
    if (spentBadge) spentBadge.innerText = spent;
    if (availBadge) {
        availBadge.innerText = avail;
        availBadge.style.color = avail < 0 ? 'var(--danger)' : (avail === 0 ? 'var(--text-muted)' : 'var(--good)');
    }

    renderSkillsGrid();
}

function toggleSkillDesc(index) {
    const el = document.getElementById(`skill-desc-${index}`);
    const btn = document.getElementById(`skill-desc-toggle-${index}`);
    if (!el) return;
    const isHidden = el.style.display === 'none';
    el.style.display = isHidden ? 'block' : 'none';
    if (btn) btn.innerHTML = getIcon(isHidden ? 'up' : 'down', 15);
}

// How the learned skills are listed (the stored order is kept; only the view is sorted).
const SKILL_SORTS = [
    { value: 'learned', label: 'Order learned' },
    { value: 'name', label: 'Name (A–Z)' },
    { value: 'nameDesc', label: 'Name (Z–A)' },
    { value: 'ability', label: 'Ability' },
    { value: 'target', label: 'Best chance first' },
    { value: 'slots', label: 'Most slots first' },
    { value: 'source', label: 'Book' },
];
const SKILL_ABILITY_ORDER = ['strength', 'intelligence', 'wisdom', 'dexterity', 'constitution', 'charisma'];

function skillDisplayName(s) { return s.subType ? `${s.name} (${s.subType})` : (s.name || ''); }

// Chance in percent, so ability rolls (d20) and thief percentages compare fairly.
function skillChancePct(item) {
    const key = item.ability || 'intelligence';
    const score = typeof getEffectiveScore === 'function' ? getEffectiveScore(currentCharacter, key) : (Number(currentCharacter.abilities?.[key]?.score) || 10);
    const slots = Number(item.slots) || 1;
    const thiefDef = !item.isCustom && GENERAL_SKILLS_DATABASE[item.skillId]?.thief;
    const thief = thiefDef ? thiefSkillChance(currentCharacter, thiefDef, slots) : null;
    return thief ? thief.value : Math.max(5, Math.min(19, score + slots - 1)) * 5;
}

function skillSortOrder(skills, mode) {
    const idx = skills.map((_, i) => i);
    const byName = (a, b) => skillDisplayName(skills[a]).localeCompare(skillDisplayName(skills[b]));
    const bookRank = i => {
        const s = skills[i];
        if (s.isCustom) return 99999;
        const first = skillReferences(s.skillId)[0];
        return first ? (SKILL_BOOKS[first.book]?.year || 9999) : 9999;
    };
    if (mode === 'name') idx.sort(byName);
    else if (mode === 'nameDesc') idx.sort((a, b) => byName(b, a));
    else if (mode === 'ability') idx.sort((a, b) => (SKILL_ABILITY_ORDER.indexOf(skills[a].ability || 'intelligence') - SKILL_ABILITY_ORDER.indexOf(skills[b].ability || 'intelligence')) || byName(a, b));
    else if (mode === 'target') idx.sort((a, b) => (skillChancePct(skills[b]) - skillChancePct(skills[a])) || byName(a, b));
    else if (mode === 'slots') idx.sort((a, b) => ((Number(skills[b].slots) || 1) - (Number(skills[a].slots) || 1)) || byName(a, b));
    else if (mode === 'source') idx.sort((a, b) => (bookRank(a) - bookRank(b)) || byName(a, b));
    return idx;
}

function setSkillSort(mode) {
    if (!currentCharacter) return;
    if (mode === 'learned') delete currentCharacter.skillSort; else currentCharacter.skillSort = mode;
    if (typeof debouncedSave === 'function') debouncedSave();
    renderSkillsGrid();
}
window.setSkillSort = setSkillSort;

function renderSkillsGrid() {
    const grid = document.getElementById('skills-grid');
    if (!grid || !currentCharacter) return;
    const sortMode = SKILL_SORTS.some(o => o.value === currentCharacter.skillSort) ? currentCharacter.skillSort : 'learned';
    const sortSel = document.getElementById('skill-sort');
    if (sortSel) {
        if (!sortSel.options.length) sortSel.innerHTML = SKILL_SORTS.map(o => `<option value="${o.value}">${o.label}</option>`).join('');
        sortSel.value = sortMode;
    }

    grid.innerHTML = '';
    const skills = currentCharacter.skills || [];

    if (skills.length === 0) {
        grid.innerHTML = '<div class="ledger-note" style="padding: 12px 0;">No skills learned yet. Use “+ Learn Skill” to spend a slot.</div>';
        return;
    }

    skillSortOrder(skills, sortMode).forEach(index => {
        const item = skills[index];
        const abilityKey = item.ability || 'intelligence';
        const abilityScore = typeof getEffectiveScore === 'function' ? getEffectiveScore(currentCharacter, abilityKey) : (Number(currentCharacter.abilities?.[abilityKey]?.score) || 10);
        const slotsSpent = Number(item.slots) || 1;
        const freeRanks = skillFreeRanks(item);
        const rawTarget = abilityScore + (slotsSpent - 1);
        const targetScore = Math.min(rawTarget, 19);          // a natural 20 always fails
        const thiefDef = !item.isCustom && GENERAL_SKILLS_DATABASE[item.skillId]?.thief;
        const thiefChance = thiefDef ? thiefSkillChance(currentCharacter, thiefDef, slotsSpent) : null;
        const srcLabel = !item.isCustom ? skillSourceLabel(item.skillId) : '';
        const displayName = item.subType ? `${item.name} (${item.subType})` : item.name;
        const abilityAbbr = abilityKey.substring(0, 3).toUpperCase();
        
        // Подтягиваем описание из навыка или из справочника
        const skillDef = GENERAL_SKILLS_DATABASE[item.skillId];
        // Standard skills always show the current rules text; homebrew skills keep their own.
        const descText = (!item.isCustom && skillDef ? skillDef.desc : item.desc) || 'No description provided.';

        const row = document.createElement('div');
        row.className = 'ledger-row';
        row.innerHTML = `
            <div style="display: flex; flex-direction: column; gap: 3px; min-width: 0;">
                <span class="ledger-name">${escapeHtml(displayName)}</span>
                ${item.isCustom || freeRanks || srcLabel ? `<span class="ledger-tags">${srcLabel ? `<span class="tag skill-src" title="${escapeHtml(skillSourceTitle(item.skillId))}">${escapeHtml(srcLabel)}</span> ` : ''}${item.isCustom ? '<span class="tag" style="color: var(--info);">Homebrew</span> ' : ''}${freeRanks ? `<span class="tag" style="color: var(--good);" title="${freeRanks} rank${freeRanks > 1 ? 's' : ''} granted free: no slot used">${freeRanks >= slotsSpent ? 'Granted' : `${freeRanks} granted`}${item.freeSource ? ' · ' + escapeHtml(item.freeSource) : ''}</span>` : ''}</span>` : ''}
            </div>
            <span class="rank-seal" style="width: 40px; font-size: 0.7rem;" title="${escapeHtml(abilityKey)}">${abilityAbbr}</span>
            ${thiefChance ? `<span class="ledger-num rubric" title="Percentile roll: as a level ${thiefChance.level} thief (GAZ13)">${thiefChance.value}%</span>`
                : `<span class="ledger-num rubric" title="${rawTarget > 19 ? `Score ${rawTarget}, but a natural 20 always fails` : 'A natural 1 always succeeds, a 20 always fails'}">≤ ${targetScore}</span>`}
            <div class="rank-cell">
                ${slotsSpent > 1 ? `<button type="button" class="icon-btn" onclick="downgradeSkillSlot(${index})" title="Remove a slot" aria-label="Remove a slot from ${escapeHtml(displayName)}">${getIcon('down', 15)}</button>` : ''}
                <button type="button" class="ledger-num skill-ranks-btn" onclick="editSkillRanks(${index})" title="${freeRanks ? `${slotsSpent} rank${slotsSpent > 1 ? 's' : ''}, ${freeRanks} granted free. ` : ''}Click to set granted (free) ranks">${slotsSpent}${freeRanks ? `<sup>${freeRanks === slotsSpent ? 'F' : freeRanks + 'F'}</sup>` : ''}</button>
                <button type="button" class="icon-btn" onclick="upgradeSkillSlot(${index})" title="Spend a slot (+1 target)" aria-label="Spend a slot on ${escapeHtml(displayName)}">${getIcon('up', 15)}</button>
            </div>
            <div class="ledger-note" id="skill-desc-${index}">${escapeHtml(descText)}</div>
            <div class="ledger-actions"><button type="button" class="icon-btn" onclick="editSkillRanks(${index})" title="Edit skill" aria-label="Edit ${escapeHtml(displayName)}">${getIcon('edit', 15)}</button><button type="button" class="icon-btn danger" onclick="removeSkill(${index})" title="Forget skill" aria-label="Forget ${escapeHtml(displayName)}">${getIcon('close', 15)}</button></div>
        `;
        grid.appendChild(row);
    });
}

window.toggleSkillDesc = toggleSkillDesc;

function onSkillSelectionChange() {
    const select = document.getElementById('skill-select');
    const preview = document.getElementById('skill-info-preview');
    const specGroup = document.getElementById('skill-spec-group');
    const specLabel = document.getElementById('skill-spec-label');
    if (!select) return;

    const skillKey = select.value;
    const skill = GENERAL_SKILLS_DATABASE[skillKey];
    if (!skill) return;

    if (preview) {
        const refs = skillReferences(skillKey);
        const refText = refs.length ? `<div style="margin-top: 4px; color: var(--gilt);">${refs.map((r, i) => `${i === 0 ? '<strong>' : ''}${escapeHtml(r.short)} p.${r.page}${escapeHtml(skillRefNote(r))}${i === 0 ? '</strong>' : ''}`).join(' · ')}</div>` : '';
        preview.innerHTML = `<strong>${escapeHtml(skill.name)}</strong> (${skill.ability.toUpperCase()}${skill.thief ? ', thief %' : ''}) — ${escapeHtml(skill.desc)}${refText}`;
    }

    if (specGroup && specLabel) {
        if (skill.hasSpec) {
            specGroup.style.display = 'block';
            specLabel.innerText = skill.specLabel ? `${skill.specLabel}:` : 'Specialization:';
        } else {
            specGroup.style.display = 'none';
        }
    }
}

function openAddSkillModal() {
    const modal = document.getElementById('skill-modal');
    const select = document.getElementById('skill-select');
    if (!modal || !select) return;

    clearSkillError();
    select.innerHTML = '';

    const sortedKeys = Object.keys(GENERAL_SKILLS_DATABASE).sort((a, b) => 
        GENERAL_SKILLS_DATABASE[a].name.localeCompare(GENERAL_SKILLS_DATABASE[b].name)
    );

    sortedKeys.forEach(k => {
        const s = GENERAL_SKILLS_DATABASE[k];
        const opt = document.createElement('option');
        opt.value = k;
        const src = skillReferences(k)[0];
        opt.textContent = `${s.name} [${s.ability.substring(0,3).toUpperCase()}]${src ? ` · ${src.short}` : ''}`;
        select.appendChild(opt);
    });

    setSkillModalMode('standard');
    onSkillSelectionChange();
    modal.style.display = 'flex';
}

function closeAddSkillModal() {
    const modal = document.getElementById('skill-modal');
    if (modal) modal.style.display = 'none';
    clearSkillError();
    safeSetVal('skill-spec-input', '');
    safeSetVal('custom-skill-name', '');
    safeSetVal('custom-skill-desc', '');
    safeSetVal('skill-granted-source', '');
    const g = document.getElementById('skill-granted-free'); if (g) g.checked = false;
    const gs = document.getElementById('skill-granted-source'); if (gs) gs.style.display = 'none';
}

function handleSkillModalBackdrop(event) {
    if (event.target && event.target.id === 'skill-modal') closeAddSkillModal();
}

function saveCharacterSkill() {
    if (!currentCharacter) {
        showSkillError('No character loaded.');
        return;
    }

    clearSkillError();

    const granted = !!document.getElementById('skill-granted-free')?.checked;
    const grantedBy = (document.getElementById('skill-granted-source')?.value || '').trim();
    const totalSlots = getTotalSkillSlots(currentCharacter);
    const spentSlots = getSpentSkillSlots(currentCharacter);
    if (!granted && totalSlots - spentSlots <= 0) {
        showSkillError('No available skill slots! Level up, remove another skill, or tick “Granted free” if this skill comes from your race, class, background or the DM.');
        return;
    }

    if (!Array.isArray(currentCharacter.skills)) currentCharacter.skills = [];

    let newSkill = null;

    if (skillModalMode === 'standard') {
        const select = document.getElementById('skill-select');
        const specInput = document.getElementById('skill-spec-input');
        const skillKey = select ? select.value : '';
        const skillDef = GENERAL_SKILLS_DATABASE[skillKey];

        if (!skillDef) {
            showSkillError('Please choose a valid skill.');
            return;
        }

        const subType = (skillDef.hasSpec && specInput) ? specInput.value.trim() : '';
        if (skillDef.hasSpec && !subType && !skillDef.specOptional) {
            showSkillError('Please enter a specialization or type.');
            return;
        }

        const effectiveSub = subType || (skillDef.specOptional ? 'General' : '');
        const isDup = currentCharacter.skills.some(s => s.skillId === skillKey && (s.subType || '').toLowerCase() === effectiveSub.toLowerCase());
        if (isDup) {
            showSkillError('Skill already learned. Spend more slots on it with its raise button instead.');
            return;
        }

        newSkill = {
            skillId: skillKey,
            name: skillDef.name,
            ability: skillDef.ability,
            subType: subType || (skillDef.specOptional ? 'General' : ''),
            desc: skillDef.desc,
            slots: 1,
            isCustom: false
        };
    } else {
        const nameInput = document.getElementById('custom-skill-name');
        const abilitySelect = document.getElementById('custom-skill-ability');
        const descInput = document.getElementById('custom-skill-desc');

        const customName = nameInput ? nameInput.value.trim() : '';
        const customAbility = abilitySelect ? abilitySelect.value : 'intelligence';
        const customDesc = descInput ? descInput.value.trim() : '';

        if (!customName) {
            showSkillError('Please enter a skill name.');
            return;
        }

        const isDup = currentCharacter.skills.some(s => s.name.toLowerCase() === customName.toLowerCase());
        if (isDup) {
            showSkillError('A skill with this name already exists.');
            return;
        }

        newSkill = {
            skillId: 'custom_' + Date.now(),
            name: customName,
            ability: customAbility,
            subType: '',
            desc: customDesc,
            slots: 1,
            isCustom: true
        };
    }

    if (granted) { newSkill.freeSlots = 1; if (grantedBy) newSkill.freeSource = grantedBy; }
    currentCharacter.skills.push(newSkill);
    closeAddSkillModal();
    if (typeof debouncedSave === 'function') debouncedSave();
    syncSkillsUI();
}

function upgradeSkillSlot(index) {
    if (!currentCharacter || !Array.isArray(currentCharacter.skills)) return;
    const item = currentCharacter.skills[index];
    if (!item) return;

    const total = getTotalSkillSlots(currentCharacter);
    const spent = getSpentSkillSlots(currentCharacter);
    if (total - spent <= 0) {
        alert('No available skill slots left to upgrade!');
        return;
    }

    item.slots = (Number(item.slots) || 1) + 1;
    if (typeof debouncedSave === 'function') debouncedSave();
    syncSkillsUI();
}

function downgradeSkillSlot(index) {
    if (!currentCharacter || !Array.isArray(currentCharacter.skills)) return;
    const item = currentCharacter.skills[index];
    if (!item || (item.slots || 1) <= 1) return;

    item.slots = Number(item.slots) - 1;
    if (Number(item.freeSlots) > item.slots) item.freeSlots = item.slots;      // paid ranks go first
    if (typeof debouncedSave === 'function') debouncedSave();
    syncSkillsUI();
}

async function removeSkill(index) {
    if (!currentCharacter || !Array.isArray(currentCharacter.skills)) return;
    const isConfirmed = await sheetConfirm('Remove this general skill?', 'Remove');
    if (!isConfirmed) return;

    currentCharacter.skills.splice(index, 1);
    if (typeof debouncedSave === 'function') debouncedSave();
    syncSkillsUI();
}

// Set how many of a skill's ranks are granted free (race, class, background, DM award).
async function editSkillRanks(index) {
    const item = currentCharacter?.skills?.[index];
    if (!item || typeof notesFormModal !== 'function') return;
    const name = item.subType ? `${item.name} (${item.subType})` : item.name;
    const def = !item.isCustom ? GENERAL_SKILLS_DATABASE[item.skillId] : null;
    const ABIL = ['strength', 'intelligence', 'wisdom', 'dexterity', 'constitution', 'charisma'];
    // Homebrew skills can be renamed and rewritten; a standard skill's specialty can be corrected.
    const ownFields = item.isCustom ? [
        { key: 'name', label: 'Skill name', wide: true, max: 80 },
        { key: 'ability', label: 'Ability', type: 'select', options: ABIL.map(a => ({ value: a, label: a[0].toUpperCase() + a.slice(1) })) },
        { key: 'desc', label: 'What it does', type: 'textarea', rows: 3, wide: true },
    ] : (def && def.hasSpec ? [{ key: 'subType', label: def.specLabel || 'Specialty', wide: true, max: 60 }] : []);
    const res = await notesFormModal({
        title: name,
        values: { slots: Number(item.slots) || 1, freeSlots: skillFreeRanks(item), freeSource: item.freeSource || '', name: item.name, ability: item.ability || 'intelligence', desc: item.desc || '', subType: item.subType === 'General' && def?.specOptional ? '' : (item.subType || '') },
        fields: [
            ...ownFields,
            { key: 'slots', label: 'Ranks in all (target = ability + ranks − 1)', placeholder: '1' },
            { key: 'freeSlots', label: 'Of which granted free', placeholder: '0' },
            { key: 'freeSource', label: 'Granted by', placeholder: 'e.g. Racial, background, DM award', wide: true, max: 60 },
        ],
    });
    if (!res || res === '__delete__') return;
    if (item.isCustom) {
        const newName = (res.name || '').trim();
        if (!newName) { await sheetAlert('The skill needs a name.'); return; }
        if (currentCharacter.skills.some(s => s !== item && (s.name || '').toLowerCase() === newName.toLowerCase())) { await sheetAlert('A skill with this name already exists.'); return; }
    } else if (def && def.hasSpec) {
        const sub = (res.subType || '').trim() || (def.specOptional ? 'General' : '');
        if (!sub) { await sheetAlert('Please enter a specialization or type.'); return; }
        if (currentCharacter.skills.some(s => s !== item && s.skillId === item.skillId && (s.subType || '').toLowerCase() === sub.toLowerCase())) { await sheetAlert('You already have this skill with that specialization.'); return; }
    }
    const slots = clampInt(res.slots, 1, 20, Number(item.slots) || 1);
    const free = clampInt(res.freeSlots, 0, slots, 0);
    const paidBefore = (Number(item.slots) || 1) - skillFreeRanks(item);
    const left = getTotalSkillSlots(currentCharacter) - getSpentSkillSlots(currentCharacter);
    if ((slots - free) - paidBefore > left) {
        await sheetAlert(`That needs ${(slots - free) - paidBefore} more skill slot${(slots - free) - paidBefore > 1 ? 's' : ''}, but only ${Math.max(0, left)} ${left === 1 ? 'is' : 'are'} left. Mark more ranks as granted free, or free up a slot.`);
        return;
    }
    if (item.isCustom) { item.name = res.name.trim().slice(0, 80); if (res.ability) item.ability = res.ability; item.desc = res.desc || ''; }
    else if (def && def.hasSpec) item.subType = (res.subType || '').trim().slice(0, 60) || (def.specOptional ? 'General' : '');
    item.slots = slots;
    if (free) item.freeSlots = free; else delete item.freeSlots;
    if (free && res.freeSource) item.freeSource = res.freeSource.slice(0, 60); else delete item.freeSource;
    if (typeof debouncedSave === 'function') debouncedSave();
    syncSkillsUI();
}
window.editSkillRanks = editSkillRanks;

// Привязка к глобальному объекту window
window.openAddSkillModal = openAddSkillModal;
window.closeAddSkillModal = closeAddSkillModal;
window.handleSkillModalBackdrop = handleSkillModalBackdrop;
window.onSkillSelectionChange = onSkillSelectionChange;
window.setSkillModalMode = setSkillModalMode;
window.saveCharacterSkill = saveCharacterSkill;
window.upgradeSkillSlot = upgradeSkillSlot;
window.downgradeSkillSlot = downgradeSkillSlot;
window.removeSkill = removeSkill;
window.syncSkillsUI = syncSkillsUI;