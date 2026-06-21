import { dexLabel, fmtLength, fmtWeight, fmtSpeed, fmtRange, fmtAltitude } from "./format.js";
import { roleColor, countryMeta } from "./badges.js";

let ALL = [];
let byDex = new Map();

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
