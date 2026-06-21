# Fighter Aircraft Pokédex Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a Pokédex-style static web catalog of ~60–80 iconic fighter/combat aircraft (USA, UK, Germany, USSR/Russia, Japan, France) with a numbered card grid and inline accordion detail panels, deployable to GitHub Pages.

**Architecture:** Static site, no build step. `data/aircraft.json` is the dataset; vanilla ES-module JS renders the grid, expands one accordion panel at a time, and handles search/filter/sort + hash routing. Pure helper functions (unit formatting, filtering, validation) live in their own ES modules so they are importable by both the browser (`<script type="module">`) and Node's built-in test runner (`node --test`). UI behavior is verified manually in a browser.

**Tech Stack:** HTML5, CSS3 (no framework), vanilla JavaScript (ES modules), Node 24 built-in test runner for unit tests, GitHub Pages for hosting.

## Global Constraints

- No runtime dependencies, no bundler, no build step — site must run by opening `index.html` via a static server.
- Tests use only Node's built-in `node --test` (no npm install required).
- All units stored **metric** in JSON; displayed as **metric with imperial in parentheses** (e.g. `13.05 m (42.8 ft)`).
- Card badges show exactly two things: **Role** (first role drives color) and **Country**.
- Only **one accordion panel open at a time**.
- Dex numbers zero-padded to 4 digits (`N.º 0007`).
- Images: public-domain / CC only, committed to `assets/img/`, every image credited in `CREDITS.md`.
- Six countries only: USA, UK, Germany, USSR/Russia, Japan, France.

---

### Task 1: Project scaffold + seed data

**Files:**
- Create: `index.html`
- Create: `css/styles.css`
- Create: `js/app.js`
- Create: `data/aircraft.json`
- Create: `README.md`
- Create: `.gitignore`

**Interfaces:**
- Consumes: nothing.
- Produces: `data/aircraft.json` is an array of aircraft objects matching the schema in the spec (§5). `index.html` loads `js/app.js` as `<script type="module">` and contains a `<div id="grid"></div>` mount point plus a top bar with `<input id="search">`, `<div id="filters"></div>`, `<select id="sort"></select>`, and `<span id="count"></span>`.

- [ ] **Step 1: Create `data/aircraft.json` with 3 seed entries**

```json
[
  {
    "dexNo": 1,
    "name": "Supermarine Spitfire",
    "manufacturer": "Supermarine",
    "country": "UK",
    "roles": ["Fighter"],
    "generation": "WWII",
    "era": "WWII",
    "yearIntroduced": 1938,
    "yearDiscontinued": 1955,
    "status": "Retired",
    "notableConflicts": ["World War II", "Battle of Britain"],
    "specs": {
      "wingspan_m": 11.23,
      "weight_kg": 2309,
      "occupants": 1,
      "maxSpeed_kmh": 595,
      "range_km": 991,
      "ceiling_m": 11125,
      "powerplant": "1× Rolls-Royce Merlin V12",
      "armament": "8× .303 Browning machine guns"
    },
    "funFact": "Over 20,000 Spitfires were built, and it was the only British fighter produced continuously throughout WWII.",
    "blurb": "The iconic British single-seat fighter whose elliptical wing and Merlin engine made it a symbol of the Battle of Britain.",
    "images": ["assets/img/spitfire-1.jpg"]
  },
  {
    "dexNo": 2,
    "name": "Messerschmitt Bf 109",
    "manufacturer": "Messerschmitt",
    "country": "Germany",
    "roles": ["Fighter"],
    "generation": "WWII",
    "era": "WWII",
    "yearIntroduced": 1937,
    "yearDiscontinued": 1958,
    "status": "Retired",
    "notableConflicts": ["World War II", "Spanish Civil War"],
    "specs": {
      "wingspan_m": 9.92,
      "weight_kg": 2247,
      "occupants": 1,
      "maxSpeed_kmh": 640,
      "range_km": 850,
      "ceiling_m": 12000,
      "powerplant": "1× Daimler-Benz DB 605 V12",
      "armament": "2× 13mm MG 131, 1× 20mm/30mm cannon"
    },
    "funFact": "With nearly 34,000 built, it is the most-produced fighter aircraft in history.",
    "blurb": "Germany's principal fighter of WWII, flown by the highest-scoring aces in aviation history.",
    "images": ["assets/img/bf109-1.jpg"]
  },
  {
    "dexNo": 3,
    "name": "F-15 Eagle",
    "manufacturer": "McDonnell Douglas",
    "country": "USA",
    "roles": ["Air Superiority", "Fighter"],
    "generation": "4th gen",
    "era": "Cold War",
    "yearIntroduced": 1976,
    "yearDiscontinued": null,
    "status": "In service",
    "notableConflicts": ["Gulf War", "Operation Iraqi Freedom"],
    "specs": {
      "wingspan_m": 13.05,
      "weight_kg": 12700,
      "occupants": 1,
      "maxSpeed_kmh": 3017,
      "range_km": 5550,
      "ceiling_m": 20000,
      "powerplant": "2× Pratt & Whitney F100 turbofans",
      "armament": "20mm M61 Vulcan, AIM-9, AIM-120"
    },
    "funFact": "The F-15 has an air-to-air combat record of over 100 victories with zero losses.",
    "blurb": "A twin-engine all-weather air-superiority fighter designed to gain and maintain control of the skies.",
    "images": ["assets/img/f15-1.jpg"]
  }
]
```

- [ ] **Step 2: Create `index.html`**

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Fighter Aircraft Throughout History</title>
  <link rel="stylesheet" href="css/styles.css" />
</head>
<body>
  <header class="site-header">
    <h1>Fighter Aircraft Throughout History</h1>
    <p class="tagline">A field guide to iconic combat aircraft since the 1930s</p>
  </header>

  <div class="toolbar">
    <input id="search" type="search" placeholder="Search name or manufacturer…" />
    <div id="filters" class="filters"></div>
    <label class="sort-label">Sort:
      <select id="sort">
        <option value="dexNo">Dex №</option>
        <option value="yearIntroduced">Year</option>
        <option value="country">Country</option>
      </select>
    </label>
    <span id="count" class="count"></span>
  </div>

  <main id="grid" class="grid"></main>

  <script type="module" src="js/app.js"></script>
</body>
</html>
```

- [ ] **Step 3: Create minimal `css/styles.css`**

```css
:root { --bg:#f5f5f5; --tile:#ececec; --text:#222; }
* { box-sizing: border-box; }
body { margin:0; font-family: system-ui, sans-serif; color:var(--text); background:#fff; }
.site-header { padding:1.5rem 1rem .5rem; }
.grid { display:grid; grid-template-columns:repeat(auto-fill,minmax(220px,1fr)); gap:1rem; padding:1rem; }
```

- [ ] **Step 4: Create `js/app.js` stub that loads data and logs count**

```js
async function main() {
  const res = await fetch("data/aircraft.json");
  const aircraft = await res.json();
  document.getElementById("count").textContent = `${aircraft.length} aircraft`;
  console.log("Loaded", aircraft.length, "aircraft");
}
main();
```

- [ ] **Step 5: Create `README.md` and `.gitignore`**

`README.md`:
```markdown
# Fighter Aircraft Throughout History

A Pokédex-style catalog of iconic combat aircraft (USA, UK, Germany, USSR/Russia, Japan, France) since the 1930s.

## Run locally
```bash
python3 -m http.server 8000
# open http://localhost:8000
```

## Test
```bash
node --test
```
```

`.gitignore`:
```
.DS_Store
node_modules/
```

- [ ] **Step 6: Serve and verify it loads**

Run: `python3 -m http.server 8000` then open `http://localhost:8000`
Expected: page shows the header and "3 aircraft" in the toolbar; browser console logs `Loaded 3 aircraft`. (Grid empty for now.)

- [ ] **Step 7: Commit**

```bash
git add index.html css/styles.css js/app.js data/aircraft.json README.md .gitignore
git commit -m "feat: scaffold project with seed data and page shell"
```

---

### Task 2: Data validation module + test

**Files:**
- Create: `js/validate.js`
- Create: `test/validate.test.js`

**Interfaces:**
- Consumes: aircraft objects from `data/aircraft.json`.
- Produces: `export function validateAircraft(record)` → returns `string[]` of error messages (empty array = valid). `export function validateDataset(records)` → returns `{ errors: string[] }` aggregating per-record errors prefixed by dexNo, and flags duplicate `dexNo` values.

- [ ] **Step 1: Write the failing test**

```js
// test/validate.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { validateAircraft, validateDataset } from "../js/validate.js";

const valid = {
  dexNo: 1, name: "X", manufacturer: "Y", country: "USA",
  roles: ["Fighter"], generation: "4th gen", era: "Cold War",
  yearIntroduced: 1976, yearDiscontinued: null, status: "In service",
  notableConflicts: [], specs: {}, funFact: "f", blurb: "b", images: ["a.jpg"]
};

test("valid record has no errors", () => {
  assert.deepEqual(validateAircraft(valid), []);
});

test("missing name is reported", () => {
  const bad = { ...valid, name: "" };
  assert.ok(validateAircraft(bad).some(e => e.includes("name")));
});

test("roles must be a non-empty array", () => {
  const bad = { ...valid, roles: [] };
  assert.ok(validateAircraft(bad).some(e => e.includes("roles")));
});

test("invalid country is reported", () => {
  const bad = { ...valid, country: "Spain" };
  assert.ok(validateAircraft(bad).some(e => e.includes("country")));
});

test("dataset flags duplicate dexNo", () => {
  const { errors } = validateDataset([valid, { ...valid }]);
  assert.ok(errors.some(e => e.includes("duplicate")));
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test`
Expected: FAIL — cannot find module `../js/validate.js`.

- [ ] **Step 3: Write `js/validate.js`**

```js
const COUNTRIES = ["USA", "UK", "Germany", "USSR/Russia", "Japan", "France"];
const REQUIRED_STRINGS = ["name", "manufacturer", "generation", "era", "blurb", "funFact"];

export function validateAircraft(r) {
  const errors = [];
  for (const f of REQUIRED_STRINGS) {
    if (typeof r[f] !== "string" || r[f].trim() === "") errors.push(`${f} is required`);
  }
  if (!Number.isInteger(r.dexNo)) errors.push("dexNo must be an integer");
  if (!COUNTRIES.includes(r.country)) errors.push(`country must be one of ${COUNTRIES.join(", ")}`);
  if (!Array.isArray(r.roles) || r.roles.length === 0) errors.push("roles must be a non-empty array");
  if (!Array.isArray(r.images) || r.images.length === 0) errors.push("images must be a non-empty array");
  if (!Number.isInteger(r.yearIntroduced)) errors.push("yearIntroduced must be an integer");
  if (r.yearDiscontinued !== null && !Number.isInteger(r.yearDiscontinued)) errors.push("yearDiscontinued must be an integer or null");
  if (typeof r.specs !== "object" || r.specs === null) errors.push("specs must be an object");
  return errors;
}

export function validateDataset(records) {
  const errors = [];
  const seen = new Set();
  for (const r of records) {
    for (const e of validateAircraft(r)) errors.push(`#${r.dexNo}: ${e}`);
    if (seen.has(r.dexNo)) errors.push(`duplicate dexNo ${r.dexNo}`);
    seen.add(r.dexNo);
  }
  return { errors };
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test`
Expected: PASS — all 5 tests pass.

- [ ] **Step 5: Add a dataset check test against the real JSON**

```js
// append to test/validate.test.js
import { readFileSync } from "node:fs";
test("data/aircraft.json is valid", () => {
  const data = JSON.parse(readFileSync(new URL("../data/aircraft.json", import.meta.url)));
  const { errors } = validateDataset(data);
  assert.deepEqual(errors, [], errors.join("\n"));
});
```

- [ ] **Step 6: Run and commit**

Run: `node --test` → Expected: PASS.
```bash
git add js/validate.js test/validate.test.js
git commit -m "feat: add aircraft data validation with tests"
```

---

### Task 3: Unit formatting module + test

**Files:**
- Create: `js/format.js`
- Create: `test/format.test.js`

**Interfaces:**
- Produces:
  - `export function metersToFeet(m)` → number (feet, 1 decimal).
  - `export function kmhToMph(kmh)` → number (mph, integer).
  - `export function kgToLb(kg)` → number (lb, integer).
  - `export function kmToMi(km)` → number (mi, integer).
  - `export function fmtLength(m)` → e.g. `"13.05 m (42.8 ft)"`; returns `"—"` when value is null/undefined.
  - `export function fmtWeight(kg)`, `fmtSpeed(kmh)`, `fmtRange(km)`, `fmtAltitude(m)` → same `"metric (imperial)"` pattern with `—` fallback.
  - `export function dexLabel(n)` → `"N.º 0007"`.

- [ ] **Step 1: Write the failing test**

```js
// test/format.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { fmtLength, fmtWeight, fmtSpeed, fmtRange, fmtAltitude, dexLabel } from "../js/format.js";

test("fmtLength shows metric and imperial", () => {
  assert.equal(fmtLength(13.05), "13.05 m (42.8 ft)");
});
test("fmtWeight formats with thousands separators", () => {
  assert.equal(fmtWeight(12700), "12,700 kg (27,999 lb)");
});
test("fmtSpeed converts km/h to mph", () => {
  assert.equal(fmtSpeed(3017), "3,017 km/h (1,875 mph)");
});
test("fmtRange converts km to mi", () => {
  assert.equal(fmtRange(5550), "5,550 km (3,449 mi)");
});
test("fmtAltitude converts m to ft", () => {
  assert.equal(fmtAltitude(20000), "20,000 m (65,617 ft)");
});
test("missing value returns dash", () => {
  assert.equal(fmtLength(null), "—");
  assert.equal(fmtWeight(undefined), "—");
});
test("dexLabel zero-pads to 4 digits", () => {
  assert.equal(dexLabel(7), "N.º 0007");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test`
Expected: FAIL — cannot find module `../js/format.js`.

- [ ] **Step 3: Write `js/format.js`**

```js
const n = (x) => x.toLocaleString("en-US");
const has = (v) => v !== null && v !== undefined;

export const metersToFeet = (m) => Math.round(m * 3.28084 * 10) / 10;
export const kmhToMph = (k) => Math.round(k * 0.621371);
export const kgToLb = (k) => Math.round(k * 2.20462);
export const kmToMi = (k) => Math.round(k * 0.621371);

export const fmtLength = (m) => has(m) ? `${m} m (${metersToFeet(m)} ft)` : "—";
export const fmtWeight = (kg) => has(kg) ? `${n(kg)} kg (${n(kgToLb(kg))} lb)` : "—";
export const fmtSpeed = (kmh) => has(kmh) ? `${n(kmh)} km/h (${n(kmhToMph(kmh))} mph)` : "—";
export const fmtRange = (km) => has(km) ? `${n(km)} km (${n(kmToMi(km))} mi)` : "—";
export const fmtAltitude = (m) => has(m) ? `${n(m)} m (${n(metersToFeet(m))} ft)` : "—";
export const dexLabel = (num) => `N.º ${String(num).padStart(4, "0")}`;
```

Note: `fmtWeight(12700)` → `kgToLb(12700)=28000` ✓. `fmtSpeed(3017)` → `kmhToMph(3017)=1875` ✓. `fmtRange(5550)` → `3449` ✓. `fmtAltitude(20000)` → `metersToFeet(20000)=65616.8`→rounded display: use integer for altitude/length>1000. Adjust: altitude uses `Math.round(metersToFeet(m))` via separate path — see Step 4 if test fails.

- [ ] **Step 4: Run test; reconcile rounding**

Run: `node --test`
Expected: PASS. If `fmtAltitude` fails because `metersToFeet(20000)=65616.8` (not 65617), change `fmtAltitude` to use rounded feet:
```js
export const fmtAltitude = (m) => has(m) ? `${n(m)} m (${n(Math.round(metersToFeet(m)))} ft)` : "—";
```
Re-run `node --test` → Expected: PASS.

- [ ] **Step 5: Commit**

```bash
git add js/format.js test/format.test.js
git commit -m "feat: add unit formatting helpers with tests"
```

---

### Task 4: Badge config + grid card rendering

**Files:**
- Create: `js/badges.js`
- Modify: `js/app.js`
- Modify: `css/styles.css`
- Create: `test/badges.test.js`

**Interfaces:**
- `js/badges.js` produces:
  - `export const ROLE_COLORS` → object mapping role name → hex color (Fighter, Interceptor, Multirole, "Air Superiority", Attack, Bomber, "Ground Attack", Reconnaissance, with a `default`).
  - `export const COUNTRY_META` → object mapping country → `{ flag: "🇺🇸", color: "#3c3b6e" }` for all six countries.
  - `export function roleColor(role)` → hex (falls back to default).
  - `export function countryMeta(country)` → `{ flag, color }` (falls back to `{ flag:"🏳️", color:"#777" }`).
- `js/app.js` produces: `export function cardHTML(a)` → string of a card's inner HTML (used by grid render), and renders all cards into `#grid`.

- [ ] **Step 1: Write the failing test for badges**

```js
// test/badges.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { roleColor, countryMeta, ROLE_COLORS } from "../js/badges.js";

test("known role returns its color", () => {
  assert.equal(roleColor("Fighter"), ROLE_COLORS.Fighter);
});
test("unknown role falls back to default", () => {
  assert.equal(roleColor("Spaceship"), ROLE_COLORS.default);
});
test("country meta returns flag and color", () => {
  const m = countryMeta("USA");
  assert.ok(m.flag && m.color);
});
test("unknown country falls back", () => {
  assert.equal(countryMeta("Atlantis").color, "#777");
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test`
Expected: FAIL — cannot find module `../js/badges.js`.

- [ ] **Step 3: Write `js/badges.js`**

```js
export const ROLE_COLORS = {
  "Fighter": "#c0392b",
  "Interceptor": "#8e44ad",
  "Multirole": "#2980b9",
  "Air Superiority": "#16a085",
  "Attack": "#d35400",
  "Ground Attack": "#7f8c8d",
  "Bomber": "#34495e",
  "Reconnaissance": "#27ae60",
  "default": "#95a5a6"
};

export const COUNTRY_META = {
  "USA": { flag: "🇺🇸", color: "#3c3b6e" },
  "UK": { flag: "🇬🇧", color: "#012169" },
  "Germany": { flag: "🇩🇪", color: "#000000" },
  "USSR/Russia": { flag: "🇷🇺", color: "#d52b1e" },
  "Japan": { flag: "🇯🇵", color: "#bc002d" },
  "France": { flag: "🇫🇷", color: "#0055a4" }
};

export const roleColor = (role) => ROLE_COLORS[role] || ROLE_COLORS.default;
export const countryMeta = (c) => COUNTRY_META[c] || { flag: "🏳️", color: "#777" };
```

- [ ] **Step 4: Run badges test to verify pass**

Run: `node --test`
Expected: PASS.

- [ ] **Step 5: Implement card rendering in `js/app.js`**

Replace `js/app.js` contents:
```js
import { dexLabel } from "./format.js";
import { roleColor, countryMeta } from "./badges.js";

let ALL = [];

export function cardHTML(a) {
  const cm = countryMeta(a.country);
  const role = a.roles[0];
  const img = a.images[0] || "";
  return `
    <article class="card" data-dex="${a.dexNo}">
      <div class="card-img"><img loading="lazy" src="${img}" alt="${a.name}"
           onerror="this.classList.add('missing')" /></div>
      <div class="card-dex">${dexLabel(a.dexNo)}</div>
      <h2 class="card-name">${a.name}</h2>
      <div class="card-badges">
        <span class="badge" style="background:${roleColor(role)}">${role}</span>
        <span class="badge" style="background:${cm.color}">${cm.flag} ${a.country}</span>
      </div>
    </article>`;
}

function renderGrid(list) {
  const grid = document.getElementById("grid");
  grid.innerHTML = list.map(cardHTML).join("");
  document.getElementById("count").textContent = `${list.length} aircraft`;
}

async function main() {
  const res = await fetch("data/aircraft.json");
  ALL = await res.json();
  ALL.sort((a, b) => a.dexNo - b.dexNo);
  renderGrid(ALL);
}
main();
```

- [ ] **Step 6: Add card CSS**

Append to `css/styles.css`:
```css
.toolbar { display:flex; flex-wrap:wrap; gap:.75rem; align-items:center; padding:.5rem 1rem; }
.card { background:#fff; border-radius:14px; padding:.75rem; box-shadow:0 1px 4px rgba(0,0,0,.08); cursor:pointer; transition:transform .1s, box-shadow .1s; }
.card:hover { transform:translateY(-2px); box-shadow:0 4px 12px rgba(0,0,0,.12); }
.card-img { background:var(--tile); border-radius:10px; aspect-ratio:4/3; display:flex; align-items:center; justify-content:center; overflow:hidden; }
.card-img img { width:100%; height:100%; object-fit:contain; }
.card-img img.missing { visibility:hidden; }
.card-dex { color:#888; font-size:.85rem; margin-top:.5rem; }
.card-name { font-size:1.25rem; margin:.1rem 0 .4rem; }
.card-badges { display:flex; gap:.4rem; flex-wrap:wrap; }
.badge { color:#fff; font-size:.8rem; padding:.2rem .6rem; border-radius:999px; }
```

- [ ] **Step 7: Verify in browser**

Run: `python3 -m http.server 8000`, open `http://localhost:8000`.
Expected: 3 cards render with dex number, name, and two colored badges (role + country flag). Images show placeholder tile (no images committed yet) — card-img stays empty/grey without breaking layout.

- [ ] **Step 8: Commit**

```bash
git add js/badges.js js/app.js css/styles.css test/badges.test.js
git commit -m "feat: render aircraft cards with role and country badges"
```

---

### Task 5: Accordion detail panel (single-open) + hash routing

**Files:**
- Modify: `js/app.js`
- Modify: `css/styles.css`

**Interfaces:**
- Consumes: `cardHTML`, formatting helpers (`fmtLength`, `fmtWeight`, `fmtSpeed`, `fmtRange`, `fmtAltitude`), `roleColor`, `countryMeta`.
- Produces: `export function slug(name)` → URL-safe slug (lowercase, hyphenated). `export function detailHTML(a)` → full panel inner HTML. Clicking a card inserts a `<section class="detail">` after that card's row; only one open at a time; clicking the same card or the ✕ closes it; URL hash set to `#<slug>`; on load, an existing hash auto-opens the matching entry.

- [ ] **Step 1: Add `slug` + `detailHTML` to `js/app.js`**

Add imports at top:
```js
import { dexLabel, fmtLength, fmtWeight, fmtSpeed, fmtRange, fmtAltitude } from "./format.js";
```
Add functions:
```js
export function slug(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

export function detailHTML(a) {
  const cm = countryMeta(a.country);
  const s = a.specs || {};
  const discontinued = a.yearDiscontinued ? a.yearDiscontinued : (a.status || "In service");
  const gallery = a.images.map(src =>
    `<img loading="lazy" src="${src}" alt="${a.name}" onerror="this.style.display='none'">`).join("");
  const roleBadges = a.roles.map(r =>
    `<span class="badge" style="background:${roleColor(r)}">${r}</span>`).join("");
  const conflicts = (a.notableConflicts || []).map(c => `<li>${c}</li>`).join("") || "<li>—</li>";
  return `
    <button class="detail-close" aria-label="Close">✕</button>
    <div class="detail-head">
      <div class="detail-badges">${roleBadges}
        <span class="badge" style="background:${cm.color}">${cm.flag} ${a.country}</span>
        <span class="badge badge-meta">${a.generation}</span>
        <span class="badge badge-meta">${a.era}</span>
      </div>
      <h2>${dexLabel(a.dexNo)} — ${a.name}</h2>
    </div>
    <div class="detail-gallery">${gallery}</div>
    <div class="detail-grid">
      <dl class="specs">
        <dt>Manufacturer</dt><dd>${a.manufacturer}</dd>
        <dt>Country</dt><dd>${cm.flag} ${a.country}</dd>
        <dt>Introduced</dt><dd>${a.yearIntroduced}</dd>
        <dt>Discontinued</dt><dd>${discontinued}</dd>
        <dt>Wingspan</dt><dd>${fmtLength(s.wingspan_m)}</dd>
        <dt>Weight</dt><dd>${fmtWeight(s.weight_kg)}</dd>
        <dt>Occupants</dt><dd>${s.occupants ?? "—"}</dd>
        <dt>Max speed</dt><dd>${fmtSpeed(s.maxSpeed_kmh)}</dd>
        <dt>Range</dt><dd>${fmtRange(s.range_km)}</dd>
        <dt>Ceiling</dt><dd>${fmtAltitude(s.ceiling_m)}</dd>
        <dt>Powerplant</dt><dd>${s.powerplant ?? "—"}</dd>
        <dt>Armament</dt><dd>${s.armament ?? "—"}</dd>
      </dl>
      <div class="detail-text">
        <p>${a.blurb}</p>
        <h3>Notable conflicts</h3><ul>${conflicts}</ul>
        <div class="funfact"><strong>Fun fact:</strong> ${a.funFact}</div>
      </div>
    </div>`;
}
```

- [ ] **Step 2: Wire click + single-open + hash behavior**

Add to `js/app.js` (replace `renderGrid`/`main` interaction section):
```js
let byDex = new Map();

function closeDetail() {
  document.querySelectorAll(".detail").forEach(d => d.remove());
  document.querySelectorAll(".card.open").forEach(c => c.classList.remove("open"));
  history.replaceState(null, "", location.pathname);
}

function openDetail(card) {
  const dex = Number(card.dataset.dex);
  const a = byDex.get(dex);
  if (!a) return;
  closeDetail();
  card.classList.add("open");
  const panel = document.createElement("section");
  panel.className = "detail";
  panel.innerHTML = detailHTML(a);
  // insert after the end of the card's visual row
  const grid = document.getElementById("grid");
  let next = card;
  const top = card.offsetTop;
  while (next.nextElementSibling && next.nextElementSibling.classList.contains("card")
         && next.nextElementSibling.offsetTop === top) {
    next = next.nextElementSibling;
  }
  next.after(panel);
  panel.querySelector(".detail-close").addEventListener("click", (e) => { e.stopPropagation(); closeDetail(); });
  history.replaceState(null, "", `#${slug(a.name)}`);
  panel.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function attachGridHandler() {
  document.getElementById("grid").addEventListener("click", (e) => {
    const card = e.target.closest(".card");
    if (!card) return;
    if (card.classList.contains("open")) closeDetail();
    else openDetail(card);
  });
}

function openFromHash() {
  const h = location.hash.slice(1);
  if (!h) return;
  const match = ALL.find(a => slug(a.name) === h);
  if (match) {
    const card = document.querySelector(`.card[data-dex="${match.dexNo}"]`);
    if (card) openDetail(card);
  }
}
```
Update `main()`:
```js
async function main() {
  const res = await fetch("data/aircraft.json");
  ALL = await res.json();
  ALL.sort((a, b) => a.dexNo - b.dexNo);
  byDex = new Map(ALL.map(a => [a.dexNo, a]));
  renderGrid(ALL);
  attachGridHandler();
  openFromHash();
}
main();
```

- [ ] **Step 3: Add detail CSS (full-width row)**

Append to `css/styles.css`:
```css
.detail { grid-column:1 / -1; position:relative; background:#fafafa; border:1px solid #e3e3e3; border-radius:14px; padding:1.25rem 1.5rem; margin:.25rem 0 1rem; }
.detail-close { position:absolute; top:.75rem; right:.75rem; border:none; background:#e3e3e3; border-radius:999px; width:2rem; height:2rem; cursor:pointer; font-size:1rem; }
.detail-badges { display:flex; gap:.4rem; flex-wrap:wrap; margin-bottom:.4rem; }
.badge-meta { background:#666; }
.detail-gallery { display:flex; gap:.6rem; overflow-x:auto; padding:.5rem 0; }
.detail-gallery img { height:180px; border-radius:10px; object-fit:cover; }
.detail-grid { display:grid; grid-template-columns:1fr 1fr; gap:1.5rem; }
.specs { display:grid; grid-template-columns:auto 1fr; gap:.25rem .75rem; margin:0; }
.specs dt { font-weight:600; color:#555; }
.specs dd { margin:0; }
.funfact { margin-top:.75rem; background:#fff7d6; border-left:4px solid #f1c40f; padding:.6rem .8rem; border-radius:6px; }
.card.open { outline:3px solid #2980b9; }
@media (max-width:640px){ .detail-grid{ grid-template-columns:1fr; } }
```

- [ ] **Step 4: Verify in browser**

Run server, open page.
Expected: clicking a card opens a full-width panel below its row with badges, specs (metric + imperial), conflicts, fun fact; URL gains `#supermarine-spitfire`; clicking another card moves the panel and closes the first; ✕ closes it and clears the hash; reloading with a `#slug` auto-opens that aircraft.

- [ ] **Step 5: Commit**

```bash
git add js/app.js css/styles.css
git commit -m "feat: inline accordion detail panel with hash routing"
```

---

### Task 6: Search, filter, and sort

**Files:**
- Create: `js/filter.js`
- Modify: `js/app.js`
- Modify: `css/styles.css`
- Create: `test/filter.test.js`

**Interfaces:**
- `js/filter.js` produces:
  - `export function applyControls(list, { query, filters, sort })` → filtered+sorted array. `query` matches name/manufacturer case-insensitively. `filters` is `{ country:Set, roles:Set, generation:Set, era:Set }`; a record passes a facet if its value is in the set or the set is empty; `roles` matches if any of the record's roles is in the set. `sort` is one of `"dexNo" | "yearIntroduced" | "country"`.
  - `export function facetValues(list, key)` → sorted unique values for building filter chips (`key` of `"country" | "generation" | "era"`, and `"roles"` flattens arrays).

- [ ] **Step 1: Write the failing test**

```js
// test/filter.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { applyControls, facetValues } from "../js/filter.js";

const data = [
  { dexNo:1, name:"Spitfire", manufacturer:"Supermarine", country:"UK", roles:["Fighter"], generation:"WWII", era:"WWII", yearIntroduced:1938 },
  { dexNo:2, name:"F-15 Eagle", manufacturer:"McDonnell Douglas", country:"USA", roles:["Air Superiority","Fighter"], generation:"4th gen", era:"Cold War", yearIntroduced:1976 },
];
const empty = { country:new Set(), roles:new Set(), generation:new Set(), era:new Set() };

test("query matches name", () => {
  const r = applyControls(data, { query:"eagle", filters:empty, sort:"dexNo" });
  assert.equal(r.length, 1); assert.equal(r[0].name, "F-15 Eagle");
});
test("query matches manufacturer", () => {
  const r = applyControls(data, { query:"supermarine", filters:empty, sort:"dexNo" });
  assert.equal(r[0].name, "Spitfire");
});
test("country filter", () => {
  const f = { ...empty, country:new Set(["USA"]) };
  const r = applyControls(data, { query:"", filters:f, sort:"dexNo" });
  assert.equal(r.length, 1); assert.equal(r[0].country, "USA");
});
test("role filter matches any role", () => {
  const f = { ...empty, roles:new Set(["Air Superiority"]) };
  const r = applyControls(data, { query:"", filters:f, sort:"dexNo" });
  assert.equal(r.length, 1);
});
test("sort by year", () => {
  const r = applyControls(data, { query:"", filters:empty, sort:"yearIntroduced" });
  assert.equal(r[0].yearIntroduced, 1938);
});
test("facetValues for roles flattens and dedupes", () => {
  const v = facetValues(data, "roles");
  assert.deepEqual(v, ["Air Superiority", "Fighter"]);
});
```

- [ ] **Step 2: Run test to verify it fails**

Run: `node --test`
Expected: FAIL — cannot find module `../js/filter.js`.

- [ ] **Step 3: Write `js/filter.js`**

```js
export function applyControls(list, { query, filters, sort }) {
  const q = (query || "").trim().toLowerCase();
  let out = list.filter(a => {
    if (q && !(`${a.name} ${a.manufacturer}`.toLowerCase().includes(q))) return false;
    if (filters.country.size && !filters.country.has(a.country)) return false;
    if (filters.generation.size && !filters.generation.has(a.generation)) return false;
    if (filters.era.size && !filters.era.has(a.era)) return false;
    if (filters.roles.size && !a.roles.some(r => filters.roles.has(r))) return false;
    return true;
  });
  const cmp = {
    dexNo: (a, b) => a.dexNo - b.dexNo,
    yearIntroduced: (a, b) => a.yearIntroduced - b.yearIntroduced,
    country: (a, b) => a.country.localeCompare(b.country) || a.dexNo - b.dexNo,
  }[sort] || ((a, b) => a.dexNo - b.dexNo);
  return out.sort(cmp);
}

export function facetValues(list, key) {
  const set = new Set();
  for (const a of list) {
    if (key === "roles") a.roles.forEach(r => set.add(r));
    else set.add(a[key]);
  }
  return [...set].sort();
}
```

- [ ] **Step 4: Run test to verify it passes**

Run: `node --test`
Expected: PASS.

- [ ] **Step 5: Wire controls into `js/app.js`**

Add import:
```js
import { applyControls, facetValues } from "./filter.js";
```
Add state + control rendering:
```js
const state = {
  query: "",
  filters: { country:new Set(), roles:new Set(), generation:new Set(), era:new Set() },
  sort: "dexNo",
};

const FACETS = [
  ["country", "Country", "country"],
  ["roles", "Role", "roles"],
  ["generation", "Generation", "generation"],
  ["era", "Era", "era"],
];

function renderFilters() {
  const wrap = document.getElementById("filters");
  wrap.innerHTML = FACETS.map(([stateKey, label, dataKey]) => {
    const chips = facetValues(ALL, dataKey).map(v =>
      `<button class="chip" data-facet="${stateKey}" data-val="${v}">${v}</button>`).join("");
    return `<div class="facet"><span class="facet-label">${label}</span>${chips}</div>`;
  }).join("");
  wrap.addEventListener("click", (e) => {
    const chip = e.target.closest(".chip");
    if (!chip) return;
    const set = state.filters[chip.dataset.facet];
    const v = chip.dataset.val;
    if (set.has(v)) { set.delete(v); chip.classList.remove("active"); }
    else { set.add(v); chip.classList.add("active"); }
    update();
  });
}

function update() {
  closeDetail();
  const list = applyControls(ALL, state);
  renderGrid(list);
}
```
Hook search + sort in `main()` after `renderGrid(ALL)`:
```js
  renderFilters();
  document.getElementById("search").addEventListener("input", (e) => { state.query = e.target.value; update(); });
  document.getElementById("sort").addEventListener("change", (e) => { state.sort = e.target.value; update(); });
```

- [ ] **Step 6: Add chip CSS**

Append to `css/styles.css`:
```css
.filters { display:flex; flex-wrap:wrap; gap:.75rem; }
.facet { display:flex; align-items:center; gap:.3rem; flex-wrap:wrap; }
.facet-label { font-size:.75rem; color:#888; text-transform:uppercase; letter-spacing:.04em; }
.chip { border:1px solid #ccc; background:#fff; border-radius:999px; padding:.15rem .6rem; font-size:.8rem; cursor:pointer; }
.chip.active { background:#2980b9; color:#fff; border-color:#2980b9; }
#search { padding:.4rem .7rem; border:1px solid #ccc; border-radius:8px; min-width:240px; }
.count { color:#888; font-size:.85rem; margin-left:auto; }
```

- [ ] **Step 7: Verify in browser**

Run server, open page.
Expected: filter chips appear per facet; clicking toggles them (highlighted) and narrows the grid; typing in search narrows live; sort dropdown reorders; count updates; an open detail panel closes when controls change; "No aircraft" handled in next task if empty.

- [ ] **Step 8: Add empty-state + commit**

In `renderGrid`, handle empty list:
```js
  if (list.length === 0) grid.innerHTML = `<p class="empty">No aircraft match your filters.</p>`;
```
(place before `grid.innerHTML = list.map(...)` as an early return path). Add CSS:
```css
.empty { grid-column:1/-1; text-align:center; color:#888; padding:2rem; }
```
Run `node --test` (still PASS) and verify empty state by selecting conflicting filters.
```bash
git add js/filter.js js/app.js css/styles.css test/filter.test.js
git commit -m "feat: add search, multi-select filters, sort, and empty state"
```

---

### Task 7: Build the full dataset (~60–80 aircraft) + images + credits

**Files:**
- Modify: `data/aircraft.json`
- Create: `assets/img/*` (committed photos)
- Create: `CREDITS.md`

**Interfaces:**
- Consumes: schema validated by `js/validate.js`; `node --test` dataset check (Task 2 Step 5) must pass for the full file.
- Produces: a complete, validated dataset; every `images[]` path points to a committed file in `assets/img/`; `CREDITS.md` lists source URL + license + author per image.

- [ ] **Step 1: Assemble the aircraft list (balanced across countries/eras)**

Target ~60–80 entries, roughly balanced. Suggested coverage (adjust to hit count):
- **USA:** P-51 Mustang, P-47 Thunderbolt, F-86 Sabre, F-4 Phantom II, F-104 Starfighter, F-105 Thunderchief, F-14 Tomcat, F-15 Eagle, F-16 Fighting Falcon, F/A-18 Hornet, A-10 Thunderbolt II, F-22 Raptor, F-35 Lightning II, P-38 Lightning.
- **UK:** Spitfire, Hawker Hurricane, Gloster Meteor, Hawker Hunter, English Electric Lightning, Harrier (Hawker Siddeley), Tornado (Panavia), Eurofighter Typhoon, de Havilland Mosquito.
- **Germany:** Bf 109, Fw 190, Me 262, Me 163 Komet, Tornado (German service — list under UK/Panavia once), Eurofighter (shared — list once). Add: Heinkel He 162, Stuka (Ju 87, attack).
- **USSR/Russia:** Polikarpov I-16, Yak-3, La-5, MiG-15, MiG-17, MiG-21, MiG-23, MiG-25, MiG-29, MiG-31, Su-27, Su-35, Su-57, Il-2 Sturmovik.
- **Japan:** A6M Zero, Nakajima Ki-43 Hayabusa, Kawasaki Ki-61 Hien, Mitsubishi J2M Raiden, Kawanishi N1K, Mitsubishi F-2, Mitsubishi F-1.
- **France:** Dewoitine D.520, Dassault Mystère IV, Mirage III, Mirage F1, Mirage 2000, Dassault Rafale, Super Étendard.

Note shared programs (Tornado, Eurofighter) get **one** entry with `country` set to the lead/most-associated operator; mention partners in `blurb`.

- [ ] **Step 2: Source one public-domain/CC image per aircraft**

For each aircraft, find a Wikimedia Commons image that is Public Domain or CC BY / CC BY-SA. Prefer clean side or 3/4 views. Download to `assets/img/<slug>-1.jpg`, resize to ≤1600px wide, optimize. Record source URL, author, and license for `CREDITS.md`. Use the existing `slug()` convention for filenames.

- [ ] **Step 3: Write each entry to `data/aircraft.json`**

Assign sequential `dexNo` (chronological by `yearIntroduced` is recommended so the dex reads historically). Each object must include every required field (see validator): `name, manufacturer, country, roles, generation, era, yearIntroduced, yearDiscontinued, status, notableConflicts, specs{wingspan_m, weight_kg, occupants, maxSpeed_kmh, range_km, ceiling_m, powerplant, armament}, funFact, blurb, images`. Pull stats from the aircraft's Wikipedia spec box; convert any imperial sources to metric before storing.

- [ ] **Step 4: Validate the full dataset**

Run: `node --test`
Expected: PASS, including "data/aircraft.json is valid" (no missing fields, no duplicate dexNo, all countries valid).

- [ ] **Step 5: Write `CREDITS.md`**

```markdown
# Image Credits

All images are Public Domain or Creative Commons as noted.

| Aircraft | File | Source | Author | License |
|----------|------|--------|--------|---------|
| Supermarine Spitfire | spitfire-1.jpg | <url> | <author> | CC BY-SA 4.0 |
| ... | ... | ... | ... | ... |
```
Fill one row per image.

- [ ] **Step 6: Verify in browser**

Run server, open page.
Expected: all ~60–80 cards render with real photos; filters show all countries/roles/generations/eras; spot-check several detail panels for correct specs and working images.

- [ ] **Step 7: Commit**

```bash
git add data/aircraft.json assets/img CREDITS.md
git commit -m "feat: add full curated aircraft dataset with images and credits"
```

---

### Task 8: Responsive polish, accessibility, and GitHub Pages deploy

**Files:**
- Modify: `css/styles.css`
- Modify: `index.html`
- Modify: `README.md`

**Interfaces:**
- Consumes: the complete app from Tasks 1–7.
- Produces: a responsive, accessible, deployed site.

- [ ] **Step 1: Responsive breakpoints**

Append/adjust in `css/styles.css`:
```css
@media (max-width:900px){ .grid{ grid-template-columns:repeat(auto-fill,minmax(160px,1fr)); } }
@media (max-width:560px){ .grid{ grid-template-columns:repeat(2,1fr); } .toolbar{ gap:.5rem; } #search{ min-width:100%; } .count{ margin-left:0; } }
```

- [ ] **Step 2: Accessibility pass**

- Add `aria-pressed` toggling to filter chips in `renderFilters`/click handler (`chip.setAttribute("aria-pressed", set.has(v))`).
- Ensure cards are keyboard-activatable: in `cardHTML`, add `tabindex="0" role="button"`; in `attachGridHandler`, also listen for `keydown` Enter/Space on a focused `.card`.
- Confirm color-contrast of badges is legible (white text on the chosen role/country colors).

```js
// in attachGridHandler, add:
document.getElementById("grid").addEventListener("keydown", (e) => {
  if (e.key !== "Enter" && e.key !== " ") return;
  const card = e.target.closest(".card");
  if (!card) return;
  e.preventDefault();
  card.classList.contains("open") ? closeDetail() : openDetail(card);
});
```

- [ ] **Step 3: Title/meta polish**

Add favicon link (optional emoji favicon) and a `<meta name="description">` in `index.html`.

- [ ] **Step 4: Final verification**

Run: `node --test` → Expected: PASS (all suites).
Run server; manually verify at desktop/tablet/mobile widths: grid reflows, accordion works, keyboard activation works, filters/search/sort work, no console errors.

- [ ] **Step 5: Enable GitHub Pages**

Document in `README.md`: in repo Settings → Pages → Source = `main` branch, root. Site serves at `https://nachourieecs.github.io/Fighter-Aircraft-Throughout-History/`.

- [ ] **Step 6: Commit and push**

```bash
git add css/styles.css index.html README.md js/app.js
git commit -m "feat: responsive polish, accessibility, and Pages docs"
git push -u origin main
```

---

## Self-Review

**Spec coverage:**
- Inline accordion, single-open, hash routing → Task 5 ✓
- Card with role+country badges, dex number → Task 4 ✓
- Detail panel contents (specs, conflicts, fun fact, blurb, gallery) → Task 5 ✓
- Metric + imperial display → Task 3 ✓
- Search/filter(Country,Role,Generation,Era)/sort + count + empty state → Task 6 ✓
- Data model + extensible JSON + validation → Tasks 1, 2 ✓
- ~60–80 curated aircraft across 6 countries → Task 7 ✓
- Public-domain/CC images committed + CREDITS.md → Task 7 ✓
- Static, no-build, GitHub Pages → Tasks 1, 8 ✓
- Responsive + missing-image/optional-field handling → Tasks 4, 5, 8 ✓

**Placeholder scan:** Task 7 is necessarily data-entry work (cannot inline 80 aircraft of researched stats), but it specifies exact required fields, the source (Wikipedia spec boxes / Wikimedia Commons), the validation gate (`node --test`), and the file/naming conventions — no vague "implement later" in code tasks.

**Type consistency:** `slug()`, `cardHTML()`, `detailHTML()`, `applyControls()`, `facetValues()`, `validateAircraft()`, `validateDataset()`, and all `fmt*`/`dexLabel` helpers are defined once and consumed with matching signatures. Filter state shape `{country,roles,generation,era}` (Sets) is consistent between `js/app.js` and `js/filter.js`. `roles` facet uses dataKey `"roles"` consistently.
