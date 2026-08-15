/* ============================================================
   NOYA Kids · Life Lab — SVG art
   ------------------------------------------------------------
   All illustrations are hand-drawn as light line-art so the world
   feels like a storybook map, not a cartoon app.  Everything is a
   pure string builder — no dependencies — so it's easy to tweak
   or extend an island later.
   ============================================================ */
(function (NOYA) {
  'use strict';

  const SVG = {};

  /* Small line motifs drawn INSIDE each island, in soft ink. */
  const MOTIF = {
    learning: `
      <g stroke="#5b4f3f" stroke-width="1.6" fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M-16 6 q16 -8 16 0 q0 -8 16 0" />
        <path d="M-16 6 v-13 q16 -8 16 0 v13" />
        <path d="M16 6 v-13 q-16 -8 -16 0" />
        <path d="M0 -7 v13" />
      </g>
      <g stroke="#c69a3f" stroke-width="1.4" fill="none" stroke-linecap="round">
        <circle cx="14" cy="-16" r="3.4" fill="#e7c66e" stroke="#c69a3f"/>
        <path d="M14 -23 v-3 M14 -6 v-3 M21 -16 h3 M4 -16 h3 M19 -21 l2 -2 M9 -21 l-2 -2"/>
      </g>`,
    life: `
      <g fill="none" stroke-linecap="round" stroke-linejoin="round">
        <path d="M-18 8 q18 -14 36 0" stroke="#5b4f3f" stroke-width="1.6"/>
        <circle cx="0" cy="-6" r="7" fill="#f0d9a8" stroke="#c9a24b" stroke-width="1.4"/>
        <g stroke="#c9a24b" stroke-width="1.3">
          <path d="M0 -18 v-3 M0 4 v3 M-13 -6 h-3 M13 -6 h3 M-9 -15 l-2 -2 M9 -15 l2 -2"/>
        </g>
        <path d="M-6 12 q6 6 12 0" stroke="#7fa1bd" stroke-width="1.5"/>
      </g>`,
    home: `
      <g fill="none" stroke="#5b4f3f" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M-13 8 v-11 l13 -10 l13 10 v11 z"/>
        <path d="M-17 -3 l17 -13 l17 13"/>
        <rect x="-4" y="-1" width="8" height="9" rx="1"/>
      </g>
      <path d="M6 -18 q6 -3 6 -9" fill="none" stroke="#c08763" stroke-width="1.4" stroke-linecap="round"/>`,
    growth: `
      <g fill="none" stroke="#5b7a52" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round">
        <path d="M0 10 v-20"/>
        <path d="M0 -4 q-11 -2 -13 -12 q11 0 13 8"/>
        <path d="M0 -10 q11 -2 13 -12 q-11 0 -13 8"/>
      </g>`,
    money: `
      <g fill="none" stroke="#4c7268" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round">
        <path d="M-13 9 v-9 a13 6 0 0 1 26 0 v9 a13 6 0 0 1 -26 0 z"/>
        <path d="M-13 0 a13 6 0 0 0 26 0"/>
      </g>
      <g stroke="#c9a24b" stroke-width="1.4" fill="#e7c66e">
        <circle cx="0" cy="-13" r="4.6"/>
      </g>
      <path d="M0 -16 v6 M-2.4 -13 h4.8" stroke="#a9822f" stroke-width="1.1" fill="none"/>`,
  };

  /* One island: soft cast shadow, layered landmass, grass cap, motif,
     a ring of progress dots, and its label.  cx/cy = centre on the map. */
  SVG.island = function (isl, opts) {
    const { cx, cy, scale = 1, progress = 0 } = opts;
    const c = isl.color, tint = isl.tint;
    const dots = 5;
    const filled = Math.round((progress / 100) * dots);
    let dotStr = '';
    for (let i = 0; i < dots; i++) {
      const dx = cx - (dots - 1) * 6 + i * 12;
      dotStr += `<circle cx="${dx}" cy="${cy + 58 * scale}" r="3"
        fill="${i < filled ? c : 'none'}" stroke="${c}" stroke-width="1.4" opacity="0.9"/>`;
    }
    return `
      <g class="isle" data-action="open-island" data-island="${isl.id}" role="button" tabindex="0"
         aria-label="${isl.name} ${isl.en}">
        <ellipse cx="${cx}" cy="${cy + 34 * scale}" rx="${70 * scale}" ry="${16 * scale}" fill="#00000012"/>
        <g class="isle-body">
          <path d="M${cx - 66 * scale} ${cy + 20 * scale}
                   q-14 -20 8 -30 q6 -22 34 -22 q18 -8 34 6
                   q24 2 22 22 q14 12 -4 26 q-10 14 -44 12
                   q-40 6 -50 -12 z"
                fill="${c}"/>
          <path d="M${cx - 60 * scale} ${cy + 8 * scale}
                   q-8 -18 10 -24 q8 -18 30 -18 q16 -6 30 6
                   q20 2 18 20 q-30 10 -60 6 q-24 4 -28 4 z"
                fill="${tint}" opacity="0.85"/>
          <g transform="translate(${cx}, ${cy - 2 * scale}) scale(${scale})">${MOTIF[isl.id] || ''}</g>
        </g>
        <text x="${cx}" y="${cy + 46 * scale}" text-anchor="middle" class="isle-no">${isl.no}</text>
        <text x="${cx}" y="${cy + 74 * scale}" text-anchor="middle" class="isle-name">${isl.name}</text>
        <text x="${cx}" y="${cy + 88 * scale}" text-anchor="middle" class="isle-en">${isl.en}</text>
        ${dotStr}
      </g>`;
  };

  /* Little scattered scenery so the sea isn't empty. */
  SVG.tree = (x, y, s = 1) => `
    <g transform="translate(${x},${y}) scale(${s})" opacity="0.8">
      <path d="M0 6 v-6" stroke="#7c6a4d" stroke-width="1.6"/>
      <path d="M0 2 q-8 -2 -9 -11 q9 1 9 7 q0 -6 9 -7 q-1 9 -9 11z" fill="#8ba676" stroke="#5b7a52" stroke-width="1"/>
    </g>`;

  SVG.star = (x, y, r = 2.4, o = 0.9) => `
    <path transform="translate(${x},${y})" opacity="${o}" fill="#e7cf9a"
      d="M0 ${-r} L${r*0.3} ${-r*0.3} L${r} 0 L${r*0.3} ${r*0.3} L0 ${r} L${-r*0.3} ${r*0.3} L${-r} 0 L${-r*0.3} ${-r*0.3} Z"/>`;

  SVG.lighthouse = (x, y) => `
    <g transform="translate(${x},${y})" opacity="0.9">
      <path d="M-6 22 L-3 -8 L3 -8 L6 22 Z" fill="#eadfca" stroke="#7c6a4d" stroke-width="1.3"/>
      <path d="M-4 6 L4 6 M-5 14 L5 14" stroke="#c08763" stroke-width="2"/>
      <rect x="-4" y="-14" width="8" height="6" rx="1" fill="#d9a441" stroke="#7c6a4d" stroke-width="1"/>
      <path d="M-3 -14 L0 -19 L3 -14 Z" fill="#c08763" stroke="#7c6a4d" stroke-width="1"/>
      <path d="M4 -11 q10 -1 14 3" stroke="#e7cf9a" stroke-width="1.4" fill="none" opacity="0.7"/>
    </g>`;

  SVG.compass = (x, y) => `
    <g transform="translate(${x},${y})" opacity="0.75">
      <circle r="16" fill="#f7efdd" stroke="#7c6a4d" stroke-width="1.3"/>
      <circle r="16" fill="none" stroke="#c9a24b" stroke-width="0.6" stroke-dasharray="1 3"/>
      <path d="M0 -12 L4 0 L0 12 L-4 0 Z" fill="#c08763" stroke="#7c6a4d" stroke-width="0.8"/>
      <path d="M0 -12 L4 0 L-4 0 Z" fill="#d9a441"/>
      <text y="-18" text-anchor="middle" font-size="7" fill="#7c6a4d" font-family="Georgia,serif">N</text>
    </g>`;

  SVG.boat = (x, y) => `
    <g transform="translate(${x},${y})" opacity="0.9">
      <path d="M-10 4 q10 6 20 0 l-3 5 q-7 3 -14 0 z" fill="#c08763" stroke="#7c6a4d" stroke-width="1"/>
      <path d="M0 4 v-14 l9 10 z" fill="#f2e6cf" stroke="#7c6a4d" stroke-width="1"/>
    </g>`;

  /* Money vessels — a purse, jar, chest, heart-jar and seed-pot. */
  SVG.vessel = function (type, color) {
    const base = { fill: color, stroke: '#5b4f3f', 'stroke-width': 1.6 };
    const s = `fill="${color}" stroke="#5b4f3f" stroke-width="1.6" stroke-linejoin="round"`;
    switch (type) {
      case 'purse': return `<g ${s}><path d="M8 18 q-4 -20 20 -20 q24 0 20 20 z"/><path d="M14 -2 q6 -8 20 0" fill="none"/><circle cx="28" cy="9" r="2.4" fill="#fff8e8"/></g>`;
      case 'jar':   return `<g ${s}><rect x="10" y="0" width="36" height="26" rx="6"/><rect x="14" y="-6" width="28" height="8" rx="3"/></g>`;
      case 'chest': return `<g ${s}><rect x="8" y="6" width="40" height="18" rx="3"/><path d="M8 8 q20 -14 40 0 v0" /><rect x="24" y="10" width="8" height="8" rx="1.5" fill="#f0d9a8"/></g>`;
      case 'heart': return `<g ${s}><path d="M28 24 q-20 -10 -20 -22 q0 -8 10 -6 q6 1 10 8 q4 -7 10 -8 q10 -2 10 6 q0 12 -20 22z"/></g>`;
      case 'seed':  return `<g ${s}><path d="M12 24 q4 -14 16 -14 q12 0 16 14 z"/><path d="M28 10 q0 -10 8 -14 q-2 10 -8 14" fill="#8ba676" stroke="#5b7a52"/></g>`;
      default:      return `<circle cx="28" cy="12" r="14" ${s}/>`;
    }
  };

  NOYA.SVG = SVG;
})(window.NOYA = window.NOYA || {});
