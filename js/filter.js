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

// `order` (optional) is an explicit ordering for ordinal facets (e.g. era,
// generation). Values found in `order` sort by their index; any not listed
// fall to the end alphabetically. Without `order`, sorts alphabetically.
export function facetValues(list, key, order) {
  const set = new Set();
  for (const a of list) {
    if (key === "roles") a.roles.forEach(r => set.add(r));
    else set.add(a[key]);
  }
  const vals = [...set];
  if (!order) return vals.sort();
  return vals.sort((a, b) => {
    const ia = order.indexOf(a), ib = order.indexOf(b);
    if (ia === -1 && ib === -1) return a.localeCompare(b);
    if (ia === -1) return 1;
    if (ib === -1) return -1;
    return ia - ib;
  });
}
