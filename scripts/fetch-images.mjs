// One-off asset fetcher: downloads each aircraft's lead photo from Wikimedia
// (Commons-hosted = freely licensed only), records attribution, resizes for repo.
// Usage: node scripts/fetch-images.mjs
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

const UA = "FighterDexBot/1.0 (educational aircraft catalog; nachouri@umich.edu)";
const data = JSON.parse(readFileSync("data/aircraft.json", "utf8"));
mkdirSync("assets/img", { recursive: true });

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const stripHtml = (s) => (s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();

async function jget(host, params) {
  const url = `https://${host}/w/api.php?` + new URLSearchParams({ format: "json", ...params });
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`${host} ${r.status}`);
  return r.json();
}

// Resolve the best Wikipedia article title for an aircraft name.
async function resolveTitle(name, manufacturer) {
  const s = await jget("en.wikipedia.org", {
    action: "query", list: "search", srlimit: "1",
    srsearch: `${name} ${manufacturer} aircraft`,
  });
  return s?.query?.search?.[0]?.title || name;
}

// Get the page's lead image (original) + the File: title.
async function leadImage(title) {
  const q = await jget("en.wikipedia.org", {
    action: "query", prop: "pageimages", piprop: "name|original",
    redirects: "1", titles: title,
  });
  const pages = q?.query?.pages || {};
  const page = Object.values(pages)[0] || {};
  return { src: page?.original?.source, file: page?.pageimage };
}

// Look up license + author for a File on Commons.
async function license(file) {
  const q = await jget("commons.wikimedia.org", {
    action: "query", prop: "imageinfo", iiprop: "extmetadata|url",
    titles: `File:${file}`,
  });
  const pages = q?.query?.pages || {};
  const page = Object.values(pages)[0] || {};
  const md = page?.imageinfo?.[0]?.extmetadata || {};
  return {
    licenseName: stripHtml(md.LicenseShortName?.value) || "Unknown",
    artist: stripHtml(md.Artist?.value) || "Unknown",
    descUrl: page?.imageinfo?.[0]?.descriptionurl || "",
  };
}

function slugFromPath(p) {
  // "assets/img/p-51-mustang-1.jpg" -> "p-51-mustang-1"
  return p.replace(/^.*\//, "").replace(/\.\w+$/, "");
}

const rows = [];
const failures = [];

for (const a of data) {
  const outPath = a.images[0];
  const slug = slugFromPath(outPath);
  try {
    const title = await resolveTitle(a.name, a.manufacturer);
    const { src, file } = await leadImage(title);
    if (!src || !file) throw new Error("no lead image");
    // Commons-only guarantee: skip locally-hosted (possibly non-free) files.
    if (!/\/wikipedia\/commons\//.test(src)) throw new Error(`not on Commons (${src})`);
    const lic = await license(file);

    const img = await fetch(src, { headers: { "User-Agent": UA } });
    if (!img.ok) throw new Error(`download ${img.status}`);
    const buf = Buffer.from(await img.arrayBuffer());
    const tmp = `assets/img/${slug}.orig`;
    writeFileSync(tmp, buf);
    // Resize so the largest side <= 1400px (macOS sips), output jpg.
    execFileSync("sips", ["-s", "format", "jpeg", "-Z", "1400", tmp, "--out", outPath], { stdio: "ignore" });
    execFileSync("rm", ["-f", tmp]);

    rows.push({ name: a.name, file: outPath.replace("assets/img/", ""), title, ...lic });
    console.log(`OK  #${a.dexNo} ${a.name}  [${lic.licenseName}]`);
  } catch (e) {
    failures.push({ name: a.name, dexNo: a.dexNo, error: String(e.message || e) });
    console.log(`FAIL #${a.dexNo} ${a.name}: ${e.message || e}`);
  }
  await sleep(400); // be polite to the API
}

// Write CREDITS.md
let md = "# Image Credits\n\n";
md += "All images are sourced from Wikimedia Commons under the licenses noted below. ";
md += "Each links to its Commons description page for full terms and authorship.\n\n";
md += "| Aircraft | File | Author | License | Source |\n|---|---|---|---|---|\n";
for (const r of rows) {
  md += `| ${r.name} | ${r.file} | ${r.artist} | ${r.licenseName} | [Commons](${r.descUrl}) |\n`;
}
if (failures.length) {
  md += `\n## Images not auto-sourced (${failures.length})\n\n`;
  md += "These need manual sourcing; cards show a placeholder until added.\n\n";
  for (const f of failures) md += `- #${f.dexNo} ${f.name} — ${f.error}\n`;
}
writeFileSync("CREDITS.md", md);

console.log(`\nDONE: ${rows.length} images, ${failures.length} failures.`);
const licCounts = {};
for (const r of rows) licCounts[r.licenseName] = (licCounts[r.licenseName] || 0) + 1;
console.log("Licenses:", JSON.stringify(licCounts));
