# Spitfire 3D Viewer — Design

**Date:** 2026-06-22
**Status:** Approved, building

## Goal

Add a procedural, stylized 3D Supermarine Spitfire (dex №5) inside its detail panel
as a reference, to judge how a 3D model looks on the "Fighter World" comic-themed site.
Scope is the Spitfire only; no other aircraft, no photoreal accuracy, no downloadable assets.

## Approach

Procedural Three.js model (chosen over embedding a CC model or AI text-to-3D): no
accounts, no licensing, full control of the comic look.

## Components

### `js/spitfire3d.js` (new)
- `mountSpitfire(container)` → builds a Three.js scene into `container`, returns `cleanup()`.
- Parts: tapered fuselage, signature elliptical wings (extruded ellipse), tail fin +
  horizontal stabilizers, bubble canopy, spinner + animated 3-blade propeller, RAF
  roundel rings on wings.
- Look: `MeshToonMaterial` cel shading in theme palette + dark ink back-face outline.
- Interaction: auto-spin (disabled under `prefers-reduced-motion`), click-drag rotate,
  scroll zoom. Hand-rolled controls (no OrbitControls addon).
- Three.js loaded via ESM CDN.

### `js/app.js` (modified)
- `detailHTML(a)`: when `a.model3d` is truthy, render a viewer container + a
  "3D / Photo" toggle above the existing gallery. Other aircraft unchanged.
- `openDetail`: if flagged, dynamic `import()` of `spitfire3d.js` and mount; store
  `cleanup()`.
- `closeDetail`: call stored `cleanup()` (cancel rAF, dispose renderer/geometry).

### `data/aircraft.json` (modified)
- Add `"model3d": true` to the Spitfire entry (dex №5) — reusable flag for future planes.

### `css/styles.css` (modified)
- `.detail-3d` block matching comic frame (ink border, offset shadow, `--sky` bg),
  caption, and chip-styled toggle.

## Fallback & lifecycle
- If Three.js fails to load, hide the viewer; the photo gallery remains. Page never breaks.
- `cleanup()` prevents animation-frame / renderer leaks on close or when another card opens.

## Verification
Manual browser check on dex №5: renders, spins, drags, zooms, toggles to photo, and
cleans up on close. No automated test (Three.js doesn't run in the jsdom test setup).
