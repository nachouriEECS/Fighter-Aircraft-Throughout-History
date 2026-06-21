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
