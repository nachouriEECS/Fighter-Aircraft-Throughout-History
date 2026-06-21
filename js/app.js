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
