// Procedural, cel-shaded Supermarine Spitfire built from Three.js primitives.
// Stylized to match the site's bold "Fighter World" comic theme — flat toon
// shading with ink back-face outlines, not a photoreal model.
//
// mountSpitfire(container) builds the scene into `container` and returns a
// cleanup() that tears everything down (animation frame, listeners, GPU memory).

import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";

const INK   = "#0A1A2B";
const SKY   = "#BFE6F5";
const YELLOW = "#FFD23F";

const PALETTE = {
  body:    "#5d7a48",   // RAF olive topside
  wing:    "#54703f",
  spinner: YELLOW,
  prop:    INK,
  canopy:  "#1366D6",
  roundelBlue: "#0E4FA8",
  roundelRed:  "#D6263B",
  white:   "#ffffff",
};

const outlineMat = new THREE.MeshBasicMaterial({ color: INK, side: THREE.BackSide });

function toon(color, opts = {}) {
  return new THREE.MeshToonMaterial({ color, ...opts });
}

// A colored toon mesh wrapped with a slightly larger ink back-face shell, so the
// silhouette reads with a comic outline. Geometry is assumed centered on origin.
function part(geometry, color, { outline = 1.06, matOpts } = {}) {
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geometry, toon(color, matOpts)));
  if (outline) {
    const shell = new THREE.Mesh(geometry, outlineMat);
    shell.scale.setScalar(outline);
    g.add(shell);
  }
  return g;
}

function buildSpitfire() {
  const plane = new THREE.Group();

  // ---- Fuselage: tapered body + nose + tail cone, oriented nose toward +Z ----
  const body = new THREE.CylinderGeometry(0.22, 0.34, 2.0, 20);
  body.rotateX(Math.PI / 2);
  const fuselage = part(body, PALETTE.body);
  plane.add(fuselage);

  const nose = new THREE.CylinderGeometry(0.34, 0.18, 0.5, 20);
  nose.rotateX(Math.PI / 2);
  nose.translate(0, 0, 1.25);
  plane.add(part(nose, PALETTE.body));

  const tail = new THREE.CylinderGeometry(0.05, 0.22, 0.5, 16);
  tail.rotateX(Math.PI / 2);
  tail.translate(0, 0, -1.25);
  plane.add(part(tail, PALETTE.body));

  // ---- Elliptical wing (the Spitfire's signature): one flat ellipse through
  // the fuselage, span along X, chord along Z, thin in Y. ----
  const wingShape = new THREE.Shape();
  wingShape.absellipse(0, 0, 1.7, 0.46, 0, Math.PI * 2);
  const wingGeo = new THREE.ExtrudeGeometry(wingShape, { depth: 0.07, bevelEnabled: false });
  wingGeo.translate(0, 0, -0.035);          // center the thin extrusion
  wingGeo.rotateX(Math.PI / 2);             // lay flat: ellipse now in X-Z plane
  wingGeo.translate(0, -0.16, 0.08);        // low-wing, near centre of mass
  plane.add(part(wingGeo, PALETTE.wing, { outline: 1.04 }));

  // ---- Tail surfaces ----
  const hStabShape = new THREE.Shape();
  hStabShape.absellipse(0, 0, 0.62, 0.22, 0, Math.PI * 2);
  const hStab = new THREE.ExtrudeGeometry(hStabShape, { depth: 0.05, bevelEnabled: false });
  hStab.translate(0, 0, -0.025);
  hStab.rotateX(Math.PI / 2);
  hStab.translate(0, 0.02, -1.3);
  plane.add(part(hStab, PALETTE.wing, { outline: 1.04 }));

  const finShape = new THREE.Shape();
  finShape.absellipse(0, 0, 0.34, 0.42, 0, Math.PI * 2);
  const fin = new THREE.ExtrudeGeometry(finShape, { depth: 0.05, bevelEnabled: false });
  fin.translate(0, 0, -0.025);              // already vertical (X-Y plane)
  fin.translate(-1.18, 0.34, 0);            // shift so base sits on tail, then rotate into Z
  fin.rotateY(Math.PI / 2);
  plane.add(part(fin, PALETTE.wing, { outline: 1.04 }));

  // ---- Bubble canopy ----
  const canopyGeo = new THREE.SphereGeometry(0.26, 18, 14);
  canopyGeo.scale(0.85, 0.7, 1.5);
  canopyGeo.translate(0, 0.28, 0.12);
  plane.add(part(canopyGeo, PALETTE.canopy, {
    outline: 1.05,
    matOpts: { transparent: true, opacity: 0.85 },
  }));

  // ---- Spinner + animated 3-blade propeller at the nose (+Z) ----
  const spinnerGeo = new THREE.ConeGeometry(0.16, 0.34, 16);
  spinnerGeo.rotateX(Math.PI / 2);
  spinnerGeo.translate(0, 0, 1.62);
  plane.add(part(spinnerGeo, PALETTE.spinner));

  const propeller = new THREE.Group();
  propeller.position.set(0, 0, 1.55);
  // Slim, slightly root-tapered blades sized to the spinner.
  const bladeGeo = new THREE.BoxGeometry(0.05, 0.82, 0.018);
  bladeGeo.translate(0, 0.41, 0);          // pivot at the hub, blade extends outward
  for (let i = 0; i < 3; i++) {
    const blade = new THREE.Mesh(bladeGeo, toon(PALETTE.prop));
    blade.rotation.z = (i * Math.PI * 2) / 3;
    propeller.add(blade);
  }
  plane.add(propeller);

  // ---- RAF roundels on top of each wing ----
  // Non-overlapping rings + a center disc (coplanar but never stacked, so no
  // z-fighting) sitting just above the wing surface.
  function roundel(x) {
    const r = new THREE.Group();
    const flat = (geo, color) =>
      r.add(new THREE.Mesh(geo, new THREE.MeshBasicMaterial({ color, side: THREE.DoubleSide })));
    flat(new THREE.RingGeometry(0.125, 0.2, 32), PALETTE.roundelBlue);
    flat(new THREE.RingGeometry(0.055, 0.125, 32), PALETTE.white);
    flat(new THREE.CircleGeometry(0.055, 32), PALETTE.roundelRed);
    r.rotation.x = -Math.PI / 2;             // lay flat, facing up
    r.position.set(x, -0.105, 0.1);
    return r;
  }
  plane.add(roundel(0.95), roundel(-0.95));

  return { plane, propeller };
}

export function mountSpitfire(container) {
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const scene = new THREE.Scene();
  scene.background = new THREE.Color(SKY);

  const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 100);
  let camDist = 5.2;

  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(renderer.domElement);
  renderer.domElement.style.cursor = "grab";
  renderer.domElement.style.display = "block";
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";

  // Lighting tuned for flat, punchy toon shading.
  scene.add(new THREE.HemisphereLight(0xffffff, 0x6688aa, 0.7));
  const key = new THREE.DirectionalLight(0xffffff, 1.1);
  key.position.set(3, 5, 4);
  scene.add(key);
  const fill = new THREE.DirectionalLight(0xfff2c4, 0.45);
  fill.position.set(-4, 1, -2);
  scene.add(fill);

  const { plane, propeller } = buildSpitfire();
  plane.rotation.y = -Math.PI * 0.18;
  plane.rotation.x = 0.12;
  scene.add(plane);

  // ---- Hand-rolled drag-to-rotate + scroll-to-zoom ----
  let dragging = false, lastX = 0, lastY = 0;
  const onDown = (e) => {
    dragging = true;
    const p = e.touches ? e.touches[0] : e;
    lastX = p.clientX; lastY = p.clientY;
    renderer.domElement.style.cursor = "grabbing";
  };
  const onMove = (e) => {
    if (!dragging) return;
    const p = e.touches ? e.touches[0] : e;
    plane.rotation.y += (p.clientX - lastX) * 0.01;
    plane.rotation.x = Math.max(-1.0, Math.min(1.0, plane.rotation.x + (p.clientY - lastY) * 0.01));
    lastX = p.clientX; lastY = p.clientY;
    if (e.touches) e.preventDefault();
  };
  const onUp = () => { dragging = false; renderer.domElement.style.cursor = "grab"; };
  const onWheel = (e) => {
    e.preventDefault();
    camDist = Math.max(3, Math.min(9, camDist + e.deltaY * 0.005));
  };

  const el = renderer.domElement;
  el.addEventListener("mousedown", onDown);
  el.addEventListener("touchstart", onDown, { passive: true });
  window.addEventListener("mousemove", onMove);
  el.addEventListener("touchmove", onMove, { passive: false });
  window.addEventListener("mouseup", onUp);
  el.addEventListener("touchend", onUp);
  el.addEventListener("wheel", onWheel, { passive: false });

  // ---- Sizing ----
  function resize() {
    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  const ro = new ResizeObserver(resize);
  ro.observe(container);
  resize();

  // ---- Render loop ----
  let raf = 0;
  function tick() {
    raf = requestAnimationFrame(tick);
    propeller.rotation.z += reduceMotion ? 0.12 : 0.45;
    if (!dragging && !reduceMotion) plane.rotation.y += 0.004;
    camera.position.set(0, 1.1, camDist);
    camera.lookAt(0, 0, 0);
    renderer.render(scene, camera);
  }
  tick();

  // ---- Cleanup ----
  return function cleanup() {
    cancelAnimationFrame(raf);
    ro.disconnect();
    el.removeEventListener("mousedown", onDown);
    el.removeEventListener("touchstart", onDown);
    window.removeEventListener("mousemove", onMove);
    el.removeEventListener("touchmove", onMove);
    window.removeEventListener("mouseup", onUp);
    el.removeEventListener("touchend", onUp);
    el.removeEventListener("wheel", onWheel);
    scene.traverse((o) => {
      if (o.geometry) o.geometry.dispose();
      if (o.material) (Array.isArray(o.material) ? o.material : [o.material]).forEach((m) => m.dispose());
    });
    renderer.dispose();
    if (el.parentNode) el.parentNode.removeChild(el);
  };
}
