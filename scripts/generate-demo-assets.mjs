// Generates the placeholder SVG artwork used by the demo wedding.
// Run with: node scripts/generate-demo-assets.mjs
// Replace files in public/demo/ with real photos when setting up a real wedding.
import { mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const out = join(process.cwd(), "public", "demo");

const palettes = [
  ["#6B1F2A", "#C9A24B", "#FBF6EC"],
  ["#4E6B3A", "#E8A317", "#FFF7E0"],
  ["#8E3B4F", "#E9B8A5", "#FDF0EE"],
  ["#1F5C7A", "#C9A24B", "#F2F6F4"],
  ["#B4532A", "#F2C14E", "#FFF4DD"],
  ["#3E2C4F", "#D9A6C4", "#F7EEF5"],
];

const write = (path, svg) => {
  const full = join(out, path);
  mkdirSync(join(full, ".."), { recursive: true });
  writeFileSync(full, svg.trim() + "\n");
};

const kasavu = (w, h, gold) => `
  <rect x="0" y="${h - 26}" width="${w}" height="26" fill="${gold}" opacity="0.9"/>
  <rect x="0" y="${h - 32}" width="${w}" height="3" fill="${gold}" opacity="0.6"/>`;

const lamp = (cx, by, s, gold, flame = "#F6B93B") => `
  <g transform="translate(${cx} ${by}) scale(${s})">
    <ellipse cx="0" cy="-160" rx="10" ry="20" fill="${flame}"/>
    <ellipse cx="0" cy="-156" rx="4" ry="9" fill="#FFF3C4"/>
    <path d="M-40 -136 Q0 -116 40 -136 L30 -126 Q0 -112 -30 -126Z" fill="${gold}"/>
    <rect x="-5" y="-124" width="10" height="100" fill="${gold}"/>
    <path d="M-28 -60 Q0 -48 28 -60 L22 -52 Q0 -44 -22 -52Z" fill="${gold}"/>
    <path d="M-48 0 Q0 -30 48 0Z" fill="${gold}"/>
  </g>`;

const jasmine = (cx, cy, r, color = "#FFFFFF") => {
  let petals = "";
  for (let i = 0; i < 5; i++) {
    const a = (i * 72 * Math.PI) / 180;
    petals += `<ellipse cx="${(cx + Math.cos(a) * r).toFixed(1)}" cy="${(cy + Math.sin(a) * r).toFixed(1)}" rx="${r}" ry="${(r * 0.55).toFixed(1)}" transform="rotate(${i * 72} ${(cx + Math.cos(a) * r).toFixed(1)} ${(cy + Math.sin(a) * r).toFixed(1)})" fill="${color}"/>`;
  }
  return `${petals}<circle cx="${cx}" cy="${cy}" r="${(r * 0.45).toFixed(1)}" fill="#F2D27A"/>`;
};

const garland = (w, y, gold) => {
  let s = `<path d="M0 ${y} Q${w / 2} ${y + 90} ${w} ${y}" fill="none" stroke="${gold}" stroke-width="3" opacity="0.6"/>`;
  for (let i = 1; i < 12; i++) {
    const t = i / 12;
    const x = t * w;
    const yy = (1 - t) * (1 - t) * y + 2 * (1 - t) * t * (y + 90) + t * t * y;
    s += jasmine(Math.round(x), Math.round(yy), 9);
  }
  return s;
};

const people = (cx, by, s, c1, c2) => `
  <g transform="translate(${cx} ${by}) scale(${s})" opacity="0.92">
    <circle cx="-38" cy="-150" r="26" fill="${c1}"/>
    <path d="M-80 0 Q-80 -110 -38 -118 Q4 -110 4 0Z" fill="${c1}"/>
    <circle cx="38" cy="-160" r="27" fill="${c2}"/>
    <path d="M-4 0 Q-4 -122 38 -128 Q82 -122 82 0Z" fill="${c2}"/>
  </g>`;

const arch = (w, h, gold) => `
  <path d="M${w * 0.18} ${h} L${w * 0.18} ${h * 0.42} Q${w * 0.5} ${h * 0.08} ${w * 0.82} ${h * 0.42} L${w * 0.82} ${h}" fill="none" stroke="${gold}" stroke-width="10" opacity="0.75"/>
  <path d="M${w * 0.24} ${h} L${w * 0.24} ${h * 0.45} Q${w * 0.5} ${h * 0.16} ${w * 0.76} ${h * 0.45} L${w * 0.76} ${h}" fill="none" stroke="${gold}" stroke-width="3" opacity="0.5"/>`;

const leaf = (cx, cy, s, green) => `
  <g transform="translate(${cx} ${cy}) rotate(-12) scale(${s})">
    <path d="M-220 0 Q0 -120 220 0 Q0 120 -220 0Z" fill="${green}"/>
    <path d="M-210 0 L210 0" stroke="#DCEBC8" stroke-width="3"/>
    <circle cx="-80" cy="-20" r="18" fill="#F2C14E"/><circle cx="-30" cy="25" r="16" fill="#C0392B"/>
    <circle cx="20" cy="-28" r="15" fill="#F7F1E1"/><circle cx="70" cy="20" r="17" fill="#E67E22"/>
    <circle cx="120" cy="-12" r="14" fill="#8E5A2B"/>
  </g>`;

const sun = (cx, cy, r, c) => `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${c}" opacity="0.85"/>`;

const scenes = [
  (w, h, [d, g, l]) => lamp(w / 2, h * 0.86, h / 520, g) + garland(w, h * 0.08, g),
  (w, h, [d, g, l]) => arch(w, h, g) + people(w / 2, h * 0.92, h / 520, d, g) + garland(w, h * 0.06, g),
  (w, h, [d, g, l]) => leaf(w / 2, h * 0.58, w / 620, "#4E6B3A") + sun(w * 0.8, h * 0.2, h * 0.08, g),
  (w, h, [d, g, l]) => {
    let s = "";
    for (let i = 0; i < 18; i++) s += jasmine((i * 97) % w, ((i * 151) % h) * 0.9 + 30, 10 + (i % 4) * 4, i % 3 ? "#FFFFFF" : l);
    return s;
  },
  (w, h, [d, g, l]) => sun(w / 2, h * 0.55, h * 0.22, g) + `<path d="M0 ${h * 0.7} Q${w / 2} ${h * 0.6} ${w} ${h * 0.72} L${w} ${h} L0 ${h}Z" fill="${d}" opacity="0.85"/>` + people(w * 0.5, h * 0.82, h / 700, "#2B1C18", "#3a2a22"),
  (w, h, [d, g, l]) => people(w * 0.3, h * 0.9, h / 640, d, g) + people(w * 0.72, h * 0.9, h / 700, g, d) + garland(w, h * 0.1, g),
];

const photoCaptions = [
  "Lamp lighting", "Mandapam ready", "Sadya leaf", "Jasmine strings", "Golden hour", "Cousins squad",
  "Haldi giggles", "Garland exchange", "Pookalam", "Nadaswaram", "Mehendi hands", "Grandparents",
  "Thali moment", "Akshata shower", "Fort Kochi sunset", "Dance floor", "Coffee break", "Team Bride",
  "Team Groom", "Kasavu details", "First look", "Payasam round two", "Family portrait", "Just married",
];

const sizes = [[800, 1000], [800, 600], [800, 800], [800, 1100], [800, 640], [800, 900]];

function photo(i) {
  const [w, h] = sizes[i % sizes.length];
  const pal = palettes[i % palettes.length];
  const [d, g, l] = pal;
  const scene = scenes[i % scenes.length](w, h, pal);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" width="${w}" height="${h}">
  <defs><linearGradient id="g" x1="0" y1="0" x2="0.4" y2="1"><stop offset="0" stop-color="${l}"/><stop offset="1" stop-color="${g}" stop-opacity="0.55"/></linearGradient></defs>
  <rect width="${w}" height="${h}" fill="url(#g)"/>
  ${scene}
  ${kasavu(w, h, g)}
  <text x="28" y="${h - 48}" font-family="Georgia, serif" font-size="30" fill="${d}" opacity="0.85">${photoCaptions[i]}</text>
</svg>`;
}

for (let i = 0; i < 24; i++) write(`photos/p${String(i + 1).padStart(2, "0")}.svg`, photo(i));

// Couple portraits
function portrait(name, initial, [d, g, l]) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 600 750" width="600" height="750">
  <defs><radialGradient id="r" cx="0.5" cy="0.35" r="0.8"><stop offset="0" stop-color="${l}"/><stop offset="1" stop-color="${g}" stop-opacity="0.7"/></radialGradient></defs>
  <rect width="600" height="750" fill="url(#r)"/>
  ${garland(600, 30, g)}
  <circle cx="300" cy="300" r="92" fill="${d}" opacity="0.9"/>
  <path d="M140 750 Q140 450 300 430 Q460 450 460 750Z" fill="${d}" opacity="0.9"/>
  <path d="M190 750 Q200 520 300 500 Q400 520 410 750" fill="none" stroke="${g}" stroke-width="8"/>
  <text x="300" y="330" text-anchor="middle" font-family="Georgia, serif" font-size="96" fill="${l}">${initial}</text>
  ${kasavu(600, 750, g)}
  <text x="300" y="690" text-anchor="middle" font-family="Georgia, serif" font-size="40" fill="${l}">${name}</text>
</svg>`;
}
write("couple/anjali.svg", portrait("Anjali", "A", palettes[0]));
write("couple/karthik.svg", portrait("Karthik", "K", palettes[3]));

// Story illustrations
const story = {
  umbrella: (w, h) => `
    <rect width="${w}" height="${h}" fill="#2E4A5C"/>
    ${Array.from({ length: 40 }, (_, i) => `<line x1="${(i * 53) % w}" y1="${(i * 37) % h}" x2="${((i * 53) % w) - 8}" y2="${((i * 37) % h) + 28}" stroke="#A9C6D6" stroke-width="2" opacity="0.6"/>`).join("")}
    <path d="M${w / 2 - 170} ${h * 0.45} Q${w / 2} ${h * 0.12} ${w / 2 + 170} ${h * 0.45}Z" fill="#C9A24B"/>
    <path d="M${w / 2} ${h * 0.45} L${w / 2} ${h * 0.72} Q${w / 2} ${h * 0.78} ${w / 2 - 20} ${h * 0.76}" stroke="#2B1C18" stroke-width="7" fill="none"/>
    ${people(w / 2, h * 0.98, h / 560, "#6B1F2A", "#1F5C7A")}
    <rect x="${w * 0.06}" y="${h * 0.2}" width="${w * 0.2}" height="${h * 0.5}" fill="#E8A317" opacity="0.35"/>`,
  coffee: (w, h) => `
    <rect width="${w}" height="${h}" fill="#F3E3C7"/>
    <g transform="translate(${w * 0.32} ${h * 0.62})"><path d="M-70 -90 L70 -90 L55 40 L-55 40Z" fill="#C9A24B"/><path d="M-90 40 L90 40 L70 70 L-70 70Z" fill="#A47E32"/><path d="M-20 -110 Q0 -140 -10 -170 M20 -110 Q40 -140 30 -170" stroke="#8E5A2B" stroke-width="5" fill="none"/></g>
    <g transform="translate(${w * 0.68} ${h * 0.62})"><rect x="-55" y="-90" width="110" height="130" rx="14" fill="#B4532A"/><path d="M55 -60 Q95 -40 55 -5" stroke="#B4532A" stroke-width="12" fill="none"/><path d="M-10 -110 Q10 -140 0 -170" stroke="#8E5A2B" stroke-width="5" fill="none"/></g>
    <text x="${w / 2}" y="${h * 0.2}" text-anchor="middle" font-family="Georgia, serif" font-size="44" fill="#6B1F2A">vs</text>`,
  calls: (w, h) => `
    <rect width="${w}" height="${h}" fill="#1E2340"/>
    ${Array.from({ length: 30 }, (_, i) => `<circle cx="${(i * 71) % w}" cy="${(i * 43) % (h * 0.6)}" r="${1 + (i % 3)}" fill="#FFF3C4" opacity="0.8"/>`).join("")}
    <circle cx="${w * 0.8}" cy="${h * 0.2}" r="42" fill="#FFF3C4"/>
    <rect x="${w * 0.15}" y="${h * 0.35}" width="120" height="220" rx="18" fill="#C9A24B"/><rect x="${w * 0.15 + 10}" y="${h * 0.35 + 18}" width="100" height="170" rx="8" fill="#2E4A5C"/>
    <rect x="${w * 0.85 - 120}" y="${h * 0.35}" width="120" height="220" rx="18" fill="#C9A24B"/><rect x="${w * 0.85 - 110}" y="${h * 0.35 + 18}" width="100" height="170" rx="8" fill="#2E4A5C"/>
    <path d="M${w * 0.15 + 130} ${h * 0.5} Q${w / 2} ${h * 0.3} ${w * 0.85 - 130} ${h * 0.5}" stroke="#E8A317" stroke-width="4" stroke-dasharray="10 12" fill="none"/>
    <path d="M${w / 2 - 22} ${h * 0.42} a12 12 0 0 1 22 -8 a12 12 0 0 1 22 8 q0 14 -22 30 q-22 -16 -22 -30z" fill="#E86A7A"/>`,
  proposal: (w, h) => `
    <defs><linearGradient id="s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#F6B93B"/><stop offset="0.6" stop-color="#E86A4A"/><stop offset="1" stop-color="#6B1F2A"/></linearGradient></defs>
    <rect width="${w}" height="${h}" fill="url(#s)"/>
    ${sun(w / 2, h * 0.55, 80, "#FFE8A3")}
    <rect y="${h * 0.62}" width="${w}" height="${h * 0.38}" fill="#3E2C4F" opacity="0.8"/>
    <g stroke="#2B1C18" stroke-width="5" fill="none"><path d="M${w * 0.08} ${h * 0.62} L${w * 0.2} ${h * 0.2} L${w * 0.32} ${h * 0.62}"/><path d="M${w * 0.2} ${h * 0.2} L${w * 0.05} ${h * 0.35} M${w * 0.2} ${h * 0.2} L${w * 0.35} ${h * 0.35}"/></g>
    ${people(w * 0.7, h * 0.66, h / 900, "#2B1C18", "#2B1C18")}`,
  mandapam: (w, h) => `
    <rect width="${w}" height="${h}" fill="#FBF6EC"/>
    ${arch(w, h, "#C9A24B")}
    ${garland(w, h * 0.05, "#C9A24B")}
    ${lamp(w * 0.12, h * 0.95, h / 900, "#C9A24B")}${lamp(w * 0.88, h * 0.95, h / 900, "#C9A24B")}
    ${people(w / 2, h * 0.95, h / 600, "#6B1F2A", "#1F5C7A")}
    ${kasavu(w, h, "#C9A24B")}`,
};
for (const [name, fn] of Object.entries(story)) {
  write(`story/${name}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600" width="800" height="600">${fn(800, 600)}</svg>`);
}

// Film posters (16:9)
const films = [
  ["save-the-date", "Save the date", palettes[0]],
  ["highlights", "Wedding highlights", palettes[3]],
  ["reception", "Reception reel", palettes[5]],
];
for (const [id, title, [d, g, l]] of films) {
  write(`films/${id}.svg`, `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1280 720" width="1280" height="720">
  <defs><linearGradient id="f" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${d}"/><stop offset="1" stop-color="#1b1210"/></linearGradient></defs>
  <rect width="1280" height="720" fill="url(#f)"/>
  ${garland(1280, 20, g)}
  ${lamp(160, 680, 1.2, g)}${lamp(1120, 680, 1.2, g)}
  <text x="640" y="330" text-anchor="middle" font-family="Georgia, serif" font-size="84" fill="${l}">Karthik &amp; Anjali</text>
  <text x="640" y="410" text-anchor="middle" font-family="Georgia, serif" font-size="40" fill="${g}" letter-spacing="6">${title.toUpperCase()}</text>
  ${kasavu(1280, 720, g)}
</svg>`);
}

console.log("Demo assets written to", out);
