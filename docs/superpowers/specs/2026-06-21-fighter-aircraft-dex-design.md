# Fighter Aircraft Throughout History — Pokédex-Style Catalog (Design)

**Date:** 2026-06-21
**Status:** Approved design, pending spec review
**Repo:** https://github.com/nachouriEECS/Fighter-Aircraft-Throughout-History

## 1. Goal

A "Pokédex-style" web catalog of significant fighters and combat aircraft developed by
six air forces since the 1930s: **USA, UK (Royal Air Force), Germany, USSR/Russia, Japan,
and France**. A responsive grid of cards (numbered like a Pokédex) where clicking a card
expands an inline accordion panel with full details and photos.

## 2. Scope

- **Curated iconic set: ~60–80 aircraft** — the most significant/iconic combat aircraft per
  country per era (e.g. Spitfire, Bf 109, P-51 Mustang, A6M Zero, MiG-15, F-86 Sabre,
  F-4 Phantom, MiG-21, F-15 Eagle, Su-27, Mirage 2000, Rafale, Eurofighter Typhoon, F-22…).
- Rich, accurate data per entry. The schema is **extensible** — more fields and more
  aircraft can be added later without rework.
- Out of scope (for now): exhaustive coverage of prototypes/variants, 3D models,
  user accounts, backend/database.

## 3. Architecture

**Static site, data-in-JSON, vanilla HTML/CSS/JS. No build step.** Deploys to GitHub Pages
as-is. Adding an aircraft = adding one JSON object + its image(s).

```
index.html
css/styles.css
js/app.js          # render grid, accordion expand/collapse, filter, search, hash routing
data/aircraft.json # the dataset (array of aircraft objects)
assets/img/...      # committed, optimized photos
CREDITS.md          # per-image source + license attribution
README.md
docs/superpowers/specs/2026-06-21-fighter-aircraft-dex-design.md
```

## 4. Visual representation

- **Photos only** (no 3D models for now). Each card uses a clean side-profile / hero photo.
- Detail panel shows a small gallery (2–4 photos).
- Images are **public-domain or Creative Commons** (Wikimedia Commons, US gov/military
  works), **downloaded and committed** to `assets/img/` (more reliable than hotlinking).
- `CREDITS.md` lists source URL + license + author for every image.
- Future option: add interactive glTF 3D viewer for a few flagship jets.

## 5. Data model (`data/aircraft.json`)

Array of objects. Example entry:

```json
{
  "dexNo": 7,
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
  "funFact": "The F-15 has a perfect air-to-air combat record with over 100 kills and zero losses.",
  "blurb": "A twin-engine all-weather air-superiority fighter designed to gain and maintain air supremacy...",
  "images": ["assets/img/f15-1.jpg", "assets/img/f15-2.jpg"]
}
```

**Field notes**
- `yearDiscontinued`: `null` when still in service (UI shows "In service").
- `roles`: array; the **first role** drives the primary badge color.
- `notableConflicts`: array of strings, shown in the detail panel.
- `weight_kg`: empty/loaded weight noted in `blurb` if relevant; store a single representative figure.
- `occupants`: crew/seats (1 = single-seat, 2 = two-seat trainer/interceptor, etc.).
- Units stored in **metric** in JSON; UI shows **metric with imperial in parentheses** (e.g. `13.05 m (42.8 ft)`, `12,700 kg (28,000 lb)`, `3,017 km/h (1,875 mph)`).
- Schema is extensible: e.g. `numberBuilt`, `length_m`, `topVariant` can be added later.

## 6. UI components

### 6.1 Card (grid tile)
- Light rounded tile, side-profile photo centered.
- `N.º 0007` dex number (zero-padded to 4 digits).
- Aircraft name.
- **Two badges shown on card: Role + Country** (color-coded; country shows flag + national color).
- Responsive grid: ~4 columns desktop → 2 tablet → 1–2 mobile.

### 6.2 Accordion detail panel (inline expansion)
- Clicking a card opens a **full-width panel below that card's row**, pushing the grid down.
- Click the card again or the ✕ to collapse. **Only one panel open at a time** — opening a new one closes the previous.
- On mobile, expands directly under the tapped card.
- URL hash updates (e.g. `#f-15-eagle`) so entries are bookmarkable/shareable; loading a
  hash auto-opens that entry.
- Contents:
  - Large badges (Role + Country) + generation + era
  - Photo gallery (2–4 images)
  - Identity: manufacturer, country, year introduced, year discontinued/status
  - Specs table: wingspan, weight, occupants, max speed, range, ceiling, powerplant, armament
  - Notable conflicts
  - History blurb
  - Fun fact (highlighted callout)

### 6.3 Top bar — search, filter, sort
- **Search** box: matches name + manufacturer (live).
- **Filter** chips (multi-select): Country, Role, Generation, Era.
- **Sort**: Dex № · Year introduced · Country.
- Live re-render with a visible result count.

## 7. Styling / look & feel

- Pokédex-inspired: light grey card tiles, rounded corners, bold name typography, pill badges.
- **Role badge palette** (color per role): Fighter, Interceptor, Multirole, Air Superiority,
  Attack, Bomber, etc.
- **Country badge**: national flag emoji/icon + national color accent.
- Clean, modern, readable. Distinct visual identity (see frontend-design during build).

## 8. Behavior / edge cases

- Missing image → placeholder silhouette.
- Missing optional field (e.g. `yearDiscontinued`) → hidden or "—" / "In service".
- Empty filter result → friendly "No aircraft match" message.
- Works fully offline once loaded (static assets); no external API calls at runtime.

## 9. Testing / verification

- JSON validates against the expected shape (a small schema check script or manual review).
- Grid renders all entries; badges/colors correct.
- Accordion open/close, single-open behavior, hash routing all work.
- Filters + search + sort combine correctly; result count accurate.
- Responsive layout checks at desktop / tablet / mobile widths.
- All images load and are credited in `CREDITS.md`.

## 10. Future extensions (not in this build)

- glTF 3D model viewer for flagship aircraft.
- More aircraft / fuller coverage.
- Additional fields (number built, length, unit cost, comparison view).
- "Compare two aircraft" side-by-side mode.
