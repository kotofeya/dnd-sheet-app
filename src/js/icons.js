// js/icons.js — medieval icon set for the sheet.
// One engraved/woodcut-like style: 24x24 grid, 1.5 strokes, round joins, light
// "ink wash" fills (currentColor at low opacity) and small rivet/bead details.
// Icons follow the text colour (currentColor), so they work in light and dark mode.

const ICON_ATTRS = 'viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false"';
const wash = 'fill="currentColor" fill-opacity=".22"';
const dot = (x, y, r = 0.8) => `<circle cx="${x}" cy="${y}" r="${r}" fill="currentColor" stroke="none"/>`;

const ICON_PATHS = {
    // --- Paperdoll slots -------------------------------------------------------
    // Great helm with eye slits, cross reinforcement and breathing holes.
    helm: `<path d="M5.5 21V8.2C5.5 5.6 8.4 3.5 12 3.5s6.5 2.1 6.5 4.7V21z" ${wash}/><path d="M7 11h3.8M13.2 11h3.8" stroke-width="2.2"/><path d="M12 3.5v4.6M12 11v10"/><path d="M5.5 21h13"/>${dot(9, 15.5)}${dot(9, 18)}${dot(15, 15.5)}${dot(15, 18)}`,
    // Amulet on a beaded chain.
    neck: `<path d="M5 3c.5 5 3.3 8.3 7 9.3 3.7-1 6.5-4.3 7-9.3" stroke-dasharray="0.1 2.1" stroke-width="1.8"/><circle cx="12" cy="16.5" r="4.5" ${wash}/><path d="M12 13.5v6M9 16.5h6"/>${dot(12, 16.5, 1.1)}`,
    // Hooded cloak with a round clasp.
    cloak: `<path d="M9 3.5h6l1.2 3.2L20 20c-2.6 1.1-5.2 1.5-8 1.5s-5.4-.4-8-1.5L7.8 6.7z" ${wash}/><path d="M9 3.5c-.6 2.3.6 4 3 4.8 2.4-.8 3.6-2.5 3-4.8"/><path d="M10.2 11 9 20.5M13.8 11l1.2 9.5"/>${dot(12, 9.2, 1.1)}`,
    // Arming sword: blade with fuller, crossguard, grip and pommel.
    sword: `<path d="M20.5 3.5 19 8.2l-8.3 8.3-3.2-3.2L15.8 5z" ${wash}/><path d="M18.8 5.2l-9.2 9.2" stroke-width="1"/><path d="M5.3 13.2l5.5 5.5"/><path d="M8 16l-3.2 3.2"/><circle cx="3.8" cy="20.2" r="1.3"/>`,
    // Breastplate with pauldrons, ridge and rivets.
    armor: `<path d="M8 3.5 12 5.5l4-2 3.5 2 .8 4-2.3 1.2V19c-2 1.5-4 2-6 2s-4-.5-6-2v-8.3L3.7 9.5l.8-4z" ${wash}/><path d="M12 5.5V20.5"/><path d="M6.8 14c3.4 1.6 7 1.6 10.4 0"/>${dot(8.5, 8.5)}${dot(15.5, 8.5)}${dot(8.5, 11.2)}${dot(15.5, 11.2)}`,
    // Heater shield with a heraldic cross.
    shield: `<path d="M4 3.5h16V10c0 6.2-3.8 10.2-8 12-4.2-1.8-8-5.8-8-12z" ${wash}/><path d="M12 3.5v18M4.2 10h15.6"/>`,
    // Signet ring with a set stone.
    ring: `<circle cx="12" cy="15" r="6"/><circle cx="12" cy="15" r="3.8" stroke-width="1" opacity=".6"/><path d="M9.2 9.7 10 7h4l.8 2.7"/><path d="M10 7l2-3.5L14 7z" ${wash}/>`,
    // Belt with a square buckle and holes.
    belt: `<path d="M2 9.8h20M2 14.2h20"/><rect x="7.5" y="7.5" width="7" height="9" rx="1.2" ${wash}/><path d="M9.8 12h7"/>${dot(18.5, 12, 0.7)}${dot(20.7, 12, 0.7)}`,
    // Riding boot with a turned cuff and pointed toe.
    boots: `<path d="M7.5 2.5h6v11l6.4 3.6c1 .6 1.4 1.7 1.1 2.9H6a2 2 0 0 1-2-2v-4.8l3.5-1.7z" ${wash}/><path d="M7.4 5.8h6.2"/><path d="M4 20h17" stroke-width="1.8"/>${dot(10.5, 9, 0.6)}${dot(10.5, 11.5, 0.6)}${dot(15.2, 16, 0.6)}`,

    // --- Treasure and packs ----------------------------------------------------
    // Coin: beaded rim, cross stamp.
    coin: `<circle cx="12" cy="12" r="9" ${wash}/><circle cx="12" cy="12" r="6.6" stroke-dasharray="0.1 1.9" stroke-width="1.6"/><path d="M12 8.6v6.8M8.6 12h6.8"/>`,
    // Cut gemstone.
    gem: `<path d="M7 4h10l4 5-9 12L3 9z" ${wash}/><path d="M3 9h18" stroke-width="1"/><path d="M9.2 4 7.5 9 12 21l4.5-12-1.7-5" stroke-width="1"/>`,
    // Drawstring purse.
    pouch: `<path d="M8.5 7.5C5.6 9.6 3.5 13 3.5 16a5 5 0 0 0 5 5h7a5 5 0 0 0 5-5c0-3-2.1-6.4-5-8.5z" ${wash}/><path d="M8.5 7.5h7"/><path d="M9.5 7.5 8 3.5M12 7.5V3M14.5 7.5l1.5-4"/><path d="M8 10c2.6 1.1 5.4 1.1 8 0" stroke-width="1" opacity=".7"/>${dot(12, 10.6, 1)}`,
    // Iron-bound chest with a lock plate.
    vault: `<path d="M3 11c0-3.3 4-5.5 9-5.5s9 2.2 9 5.5v9H3z" ${wash}/><path d="M3 11h18"/><path d="M7.2 6.3V20M16.8 6.3V20"/><rect x="10.4" y="11.6" width="3.2" height="4" rx=".6" fill="currentColor" stroke="none"/>`,
    // Leather satchel with flap and buckle.
    bag: `<path d="M8 8c0-3 1.8-5 4-5s4 2 4 5"/><path d="M4.8 8h14.4l1 12a1 1 0 0 1-1 1H4.8a1 1 0 0 1-1-1z" ${wash}/><path d="M4.8 8c.5 4 3.3 6 7.2 6s6.7-2 7.2-6"/><rect x="10.6" y="13.2" width="2.8" height="3" rx=".5"/>`,
    // Knight's horse head.
    horse: `<path d="M8.5 21h10c.2-4.7-.7-8-2-10.2l1.8-2.6-1.3-4.1-3.1 1.3C10.8 4.4 7.4 6 6.3 9.6L3.5 13l1.8 2 3.1-.8c.9 1.3.9 3.2.1 6.8z" ${wash}/><path d="M13.2 4.4c1.7.9 2.8 2.6 3.3 4.6" stroke-width="1" opacity=".7"/>${dot(12.8, 8.2, 0.9)}`,
    // Two-wheeled cart with shafts.
    wagon: `<path d="M2.5 7.5h14v6h-14z" ${wash}/><path d="M2.5 10.5h14"/><path d="M16.5 11h5"/><circle cx="8" cy="16.5" r="4"/><path d="M8 12.5v8M4 16.5h8M5.2 13.7l5.6 5.6M10.8 13.7l-5.6 5.6" stroke-width="1"/>`,
    // Bow with a nocked arrow.
    bow: `<path d="M6 3c6.2 2.6 9 5.8 9 9s-2.8 6.4-9 9"/><path d="M6 3v18" stroke-width="1" opacity=".7"/><path d="M3 12h16"/><path d="M17 9.8 21 12l-4 2.2z" fill="currentColor" stroke-width="1"/><path d="M3 12 2 10M3 12l-1 2" stroke-width="1"/>`,

    // --- Marks and states ------------------------------------------------------
    // Skull and crossbones.
    skull: `<path d="M4 17.5l16 4.5M20 17.5 4 22" stroke-width="1.6"/><path d="M6 9.5a6 6 0 0 1 12 0c0 2-.9 3.3-2 3.9V16H8v-2.6c-1.1-.6-2-1.9-2-3.9z" ${wash}/>${dot(9.6, 9.8, 1.3)}${dot(14.4, 9.8, 1.3)}<path d="M12 11.6l-.8 1.4h1.6z" fill="currentColor" stroke="none"/><path d="M10.2 16v-1.6M12 16v-1.6M13.8 16v-1.6" stroke-width="1"/>`,
    // Heraldic lightning bolt (charges).
    zap: `<path d="M14.5 2 5.5 13.5h5.3L8.7 22l9.8-12.5h-5.4L16.5 2z" ${wash}/>`,
    // Open eye with rays (concentration).
    eye: `<path d="M2.5 13c2.6-4 5.8-6 9.5-6s6.9 2 9.5 6c-2.6 4-5.8 6-9.5 6s-6.9-2-9.5-6z" ${wash}/><circle cx="12" cy="13" r="3"/>${dot(12, 13, 1.2)}<path d="M12 2.5v2M6.3 4l1.1 1.7M17.7 4l-1.1 1.7" stroke-width="1.2"/>`,
    // Heraldic mullet (five-pointed star, pierced).
    star: `<path d="M12 2.5l2.7 6.4 6.8.5-5.2 4.4 1.7 6.7L12 16.8l-6 3.7 1.7-6.7-5.2-4.4 6.8-.5z" ${wash}/><circle cx="12" cy="12" r="1.6"/>`,
    // Padlock, locked and open.
    lock: `<path d="M8 11V8a4 4 0 0 1 8 0v3"/><path d="M5 11h14v8.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5z" ${wash}/>${dot(12, 15, 1.3)}<path d="M12 15.8v2.6"/>${dot(7, 13, 0.6)}${dot(17, 13, 0.6)}`,
    unlock: `<path d="M8 11V8a4 4 0 0 1 7.6-1.8"/><path d="M5 11h14v8.5a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 5 19.5z" ${wash}/>${dot(12, 15, 1.3)}<path d="M12 15.8v2.6"/>${dot(7, 13, 0.6)}${dot(17, 13, 0.6)}`,

    // --- Controls --------------------------------------------------------------
    // Remove / close: a saltire with flared ends.
    close: `<path d="M6 6l12 12M18 6 6 18" stroke-width="1.8"/><path d="M3.8 7.2l3.4-3.4M16.8 20.2l3.4-3.4M16.8 3.8l3.4 3.4M3.8 16.8l3.4 3.4" stroke-width="1.4"/>`,
    // Raise / lower: barbed arrowheads.
    up: `<path d="M4.5 15.5 12 8l7.5 7.5"/><path d="M8.5 16 12 12.5l3.5 3.5" stroke-width="1" opacity=".6"/>`,
    down: `<path d="M4.5 8.5 12 16l7.5-7.5"/><path d="M8.5 8 12 11.5 15.5 8" stroke-width="1" opacity=".6"/>`,
    // Fletched arrows for moving things between places.
    arrowRight: `<path d="M3 12h15"/><path d="M16 8.5 21.5 12 16 15.5z" ${wash}/><path d="M3.5 12 2 9.5M3.5 12 2 14.5M6.5 12 5 9.5M6.5 12 5 14.5" stroke-width="1.1"/>`,
    arrowLeft: `<path d="M21 12H6"/><path d="M8 8.5 2.5 12 8 15.5z" ${wash}/><path d="M20.5 12 22 9.5M20.5 12 22 14.5M17.5 12 19 9.5M17.5 12 19 14.5" stroke-width="1.1"/>`,
    swap: `<path d="M3 8h14"/><path d="M15.5 5.5 20 8l-4.5 2.5z" ${wash}/><path d="M21 16H7"/><path d="M8.5 13.5 4 16l4.5 2.5z" ${wash}/><path d="M3.5 8 2.5 6.5M3.5 8l-1 1.5M20.5 16l1-1.5M20.5 16l1 1.5" stroke-width="1"/>`,
    // Tick drawn with a quill flourish.
    check: `<path d="M3.5 12.5 9 18 20.5 5.5"/><path d="M20.5 5.5c.6-.9 1.2-1.2 1.8-1.2" stroke-width="1"/>`,

    // --- Top bar and tools -----------------------------------------------------
    // Export: a letter closed with a wax seal.
    export: `<path d="M3 6h18v12.5H3z" ${wash}/><path d="M3 6l9 7 9-7"/><path d="M10.2 15.5 9.3 20l2.7-1.3 2.7 1.3-.9-4.5" stroke-width="1.2"/><circle cx="12" cy="13.5" r="2.6" fill="currentColor" stroke="none"/>`,
    // Import: open parchment with rolled ends and writing.
    import: `<rect x="3.5" y="3" width="17" height="3.6" rx="1.8" ${wash}/><rect x="3.5" y="17.4" width="17" height="3.6" rx="1.8" ${wash}/><path d="M5.5 6.6v10.8M18.5 6.6v10.8"/><path d="M8 9.5h8M8 12h8M8 14.5h5" stroke-width="1" opacity=".75"/>`,
    // Print: quill in an inkwell.
    print: `<path d="M4.5 21h10.5l-1.3-5.2H5.8z" ${wash}/><path d="M7 15.8V14h5.5v1.8"/><path d="M9.8 14C11.8 8.8 15.8 5 21.5 2.5 20.4 8 17 11.8 11.6 14"/><path d="M9.8 14 17.5 6.5" stroke-width="1"/>`,
    // Theme: a candle on its dish.
    candle: `<path d="M4.5 20.5h15"/><path d="M6.8 20.5c0-1.6 2.3-2.6 5.2-2.6s5.2 1 5.2 2.6"/><rect x="10" y="10" width="4" height="8" rx=".6" ${wash}/><path d="M12 8.2V10" stroke-width="1"/><path d="M12 3c1.7 1.9 2.1 3.3 1.4 4.5-.5.8-2.3.8-2.8 0-.7-1.2-.3-2.6 1.4-4.5z" fill="currentColor" fill-opacity=".45"/><path d="M14 11.3v2.2" stroke-width="1" opacity=".7"/>`,
    // History: an hourglass in a turned frame.
    hourglass: `<path d="M5 3h14M5 21h14"/><path d="M7 3c0 4.5 5 6 5 9s-5 4.5-5 9M17 3c0 4.5-5 6-5 9s5 4.5 5 9"/><path d="M9.2 18.5c1-1.4 1.9-1.8 2.8-1.8s1.8.4 2.8 1.8V21H9.2z" fill="currentColor" fill-opacity=".45" stroke="none"/><path d="M9.5 7h5" stroke-width="1" opacity=".7"/>`,
    // Copy: two parchment leaves.
    copy: `<path d="M8 7.5h9l3 3V21H8z" ${wash}/><path d="M17 7.5v3h3"/><path d="M5 17V3.5h9.5l1.8 1.8" opacity=".7"/><path d="M10.5 13h7M10.5 15.5h7M10.5 18h4.5" stroke-width="1" opacity=".75"/>`,
    // Portrait: a bust in an oval cameo frame.
    // Hands slot: a mailed gauntlet with a flared cuff.
    gauntlet: `<path d="M7 21v-4.5L5.2 12a1.6 1.6 0 0 1 2.9-1.3L9.5 13V5.2a1.4 1.4 0 0 1 2.8 0V11V4.2a1.4 1.4 0 0 1 2.8 0V11V5.4a1.4 1.4 0 0 1 2.8 0v8.4c0 2.6-.9 4.3-2.4 5.4V21z" ${wash}/><path d="M6.2 21h11"/><path d="M9.5 16.8h6.6" stroke-width="1" opacity=".7"/>${dot(9, 19, 0.6)}${dot(12, 19, 0.6)}${dot(15, 19, 0.6)}`,
    // Party: three companions, the middle one in front.
    party: `<circle cx="6" cy="8.5" r="2.4"/><circle cx="18" cy="8.5" r="2.4"/><path d="M1.8 19c.4-3.2 2-5 4.2-5 1.3 0 2.3.5 3 1.4M22.2 19c-.4-3.2-2-5-4.2-5-1.3 0-2.3.5-3 1.4"/><circle cx="12" cy="7.5" r="3" ${wash}/><path d="M6.5 21c.5-4.2 2.7-6.6 5.5-6.6s5 2.4 5.5 6.6z" ${wash}/>`,
    // Arcana: an alchemist's round flask with a stopper and bubbles.
    flask: `<path d="M9.5 3h5M10.3 3v5.2L5.6 15.6A3.6 3.6 0 0 0 8.7 21h6.6a3.6 3.6 0 0 0 3.1-5.4l-4.7-7.4V3"/><path d="M7 14.2h10l1.4 2.3A2.6 2.6 0 0 1 16.2 20H7.8a2.6 2.6 0 0 1-2.2-3.5z" ${wash}/>${dot(10.5, 16.8, 0.7)}${dot(13.6, 18, 0.9)}${dot(12.6, 11.5, 0.6)}`,
    // Dominion: a five-pointed crown with jewels.
    crown: `<path d="M3.5 18 2.8 7.5l5 4.2L12 4.5l4.2 7.2 5-4.2-.7 10.5z" ${wash}/><path d="M3.5 18h17M4 20.5h16"/>${dot(12, 4.5, 1)}${dot(2.8, 7.5, 0.9)}${dot(21.2, 7.5, 0.9)}${dot(8.5, 15, 0.7)}${dot(12, 15, 0.9)}${dot(15.5, 15, 0.7)}`,
    portrait: `<ellipse cx="12" cy="12" rx="8" ry="9.5" ${wash}/><ellipse cx="12" cy="12" rx="6.6" ry="8.1" stroke-width="1" opacity=".6"/><circle cx="12" cy="10" r="2.8"/><path d="M7.2 18.6c.9-2.7 2.8-4 4.8-4s3.9 1.3 4.8 4"/>`,
};
// Older names kept so existing calls keep working.
ICON_PATHS.brain = ICON_PATHS.eye;

const SVG_ICONS = Object.fromEntries(Object.entries(ICON_PATHS).map(([k, body]) => [k, `<svg ${ICON_ATTRS}>${body}</svg>`]));

function getIcon(name, size = 16, className = '') {
    const svg = SVG_ICONS[name] || '';
    return `<span class="ui-icon ${className}" style="width: ${size}px; height: ${size}px;">${svg}</span>`;
}

// Static markup uses <span data-icon="name" data-size="16"></span>; fill those in.
function hydrateIcons(root = document) {
    root.querySelectorAll('[data-icon]').forEach(el => {
        const svg = SVG_ICONS[el.dataset.icon];
        if (!svg) return;
        const size = Number(el.dataset.size) || 16;
        el.classList.add('ui-icon');
        el.style.width = `${size}px`;
        el.style.height = `${size}px`;
        el.innerHTML = svg;
    });
}
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', () => hydrateIcons());
else hydrateIcons();

window.getIcon = getIcon;
window.hydrateIcons = hydrateIcons;
window.SVG_ICONS = SVG_ICONS;
