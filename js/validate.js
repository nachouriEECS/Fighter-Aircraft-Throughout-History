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
