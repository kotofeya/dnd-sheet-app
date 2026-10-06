# Mystara Character Sheet

A desktop character sheet and campaign tracker for **Dungeons & Dragons BECMI / Rules Cyclopedia**, set in the world of **Mystara**. It keeps the whole character in one place (abilities, combat, spells, skills, gear, followers, homes, dominion and notes) and follows the Rules Cyclopedia and Dark Dungeons, with optional material from the Mystara gazetteers and fan supplements.

It is a record keeper, not a virtual tabletop: no maps or dice for the table, just the sheet.

## Features

- **Character creation guide**: ability scores, class, starting gold and a shop, languages and starting weapons.
- **Classes and options**: the Rules Cyclopedia classes, Mystic, Paladin/Avenger, Arcane Warrior, Shadow Elf and Shadow Shaman, and more.
- **Combat**: THAC0, saving throws, armour class from equipped gear, weapon mastery with training and costs, Mystic unarmed attacks.
- **Equipment**: a paper doll for worn items, inventory with weight and encumbrance, bags of holding and mounts, a catalogue of Rules Cyclopedia magic items, a magic forge. Items can raise ability scores, inventory can be sorted, and goods can be marked "for trade".
- **Spells**: cleric, druid and magic-user spellbooks with preparation and casting. Cleric spell lists follow the chosen Immortal (163 Immortals from the Codex Immortalis, with each one's extra spells from the Tome of the Magic of Mystara).
- **General skills**: over 100 skills from the Rules Cyclopedia, GAZ5, Dawn of the Emperors and GAZ13, including granted (free) skills.
- **Arcana**: Glantrian secret crafts, spell research and the Great School of Magic (GAZ3).
- **Companions**: retainers, mercenaries, specialists, familiars and animals, with morale, wages and experience.
- **Holdings**: homes, towers and shops outside a dominion, with staff, rooms, stored items, monthly costs and a construction planner (Dark Dungeons Table 8-8).
- **Dominion**: rule a dominion month by month (Rules Cyclopedia Chapter 12).
- **Calendar**: the Thyatian calendar with holidays, the shadow elf calendar, the Mystaran zodiac, birthdays, timers, healing and due bills as time passes.
- **Notes**: biography and portrait, heraldry, a journal, contacts, factions with standing, and search across everything.
- **Adventure log, history and parties**: every change is logged, earlier versions can be restored, and characters can share a party.

## Running it

**Ready-made Windows version:** download the zip from the [Releases](../../releases) page, unpack it anywhere and run `Mystara Character Sheet.exe`.

**From the source code** (needs [Node.js](https://nodejs.org)):

```
npm install
npm start
```

Characters are saved in `%APPDATA%\Mystara Character Sheet` (one `.json` file per character, plus earlier versions in `characters\history`).

## Building the .exe

`_build/make_release.sh` builds a portable Windows folder in `release/` from the Electron already in `node_modules`: it copies Electron, sets the app icon and name in the executable (`_build/patch_exe.py`, Python 3) and adds the app files. Run `npm start` once first so `dist/` is up to date, close the app, then run the script with Bash (for example Git Bash).

## Project layout

```
src/main.ts, preload.ts     Electron main process and the bridge to the page
src/index.html, style.css   the sheet
src/js/                     one script per part of the sheet (combat, magic, inventory, notes...)
src/data/                   classes, spells, Immortals and weapons
tests/                      rules tests (npm test)
_build/                     the Windows build script and icon
```

## Sources and credits

This is an unofficial fan project. Dungeons & Dragons, Mystara and the Rules Cyclopedia are trademarks of Wizards of the Coast; this project is not affiliated with or endorsed by them.

The rules come from:

- *Dungeons & Dragons Rules Cyclopedia* (TSR 1071) and the Mystara Gazetteers.
- *Dark Dungeons* (a free retro-clone of the Rules Cyclopedia).
- *Codex Immortalis* by Marco Dalmonte, for the Immortals and what they grant their clerics.
- *Tome of the Magic of Mystara*, vol. 1 (Arcane Magic) and vol. 2 (Divine Magic), for spell descriptions and each Immortal's additional spells.
- The *Mystara Extra Rules Compendium*.
- "Arcana Mystara: The Mystaran Zodiac" by Kit Navarro, from [The Vaults of Pandius](https://www.pandius.com/mzodiac.html).

Thanks to the Mystara fan community and The Vaults of Pandius, where most of these fan works can be found.
