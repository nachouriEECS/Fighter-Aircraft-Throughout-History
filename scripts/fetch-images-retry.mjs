// Retry fetcher for aircraft whose lead image failed: lists the article's
// images and picks the first real photograph (jpg, not insignia/flag/icon).
import { readFileSync, writeFileSync, appendFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const UA = "FighterDexBot/1.0 (educational aircraft catalog; nachouri@umich.edu)";
const data = JSON.parse(readFileSync("data/aircraft.json", "utf8"));
const byName = new Map(data.map((a) => [a.name, a]));
const stripHtml = (s) => (s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// name -> exact Wikipedia article title
const TARGETS = {
  "Messerschmitt Bf 109": "Messerschmitt Bf 109",
  "Messerschmitt Me 163 Komet": "Messerschmitt Me 163 Komet",
  "de Havilland Mosquito": "De Havilland Mosquito",
  "Lavochkin La-5": "Lavochkin La-5",
  "P-47 Thunderbolt": "Republic P-47 Thunderbolt",
  "Gloster Meteor": "Gloster Meteor",
  "Hawker Siddeley Harrier": "Hawker Siddeley Harrier",
};

const BAD = /roundel|insignia|flag|ensign|logo|icon|silhouette|\.svg$|map|emblem|cross|symbol|orthographic|line.?drawing|3-view|three.?view|diagram/i;

async function jget(host, params) {
  const url = `https://${host}/w/api.php?` + new URLSearchParams({ format: "json", ...params });
  const r = await fetch(url, { headers: { "User-Agent": UA } });
  if (!r.ok) throw new Error(`${host} ${r.status}`);
  return r.json();
}

async function pickPhoto(title) {
  const q = await jget("en.wikipedia.org", {
    action: "query", prop: "images", imlimit: "60", redirects: "1", titles: title,
  });
  const page = Object.values(q?.query?.pages || {})[0] || {};
  const imgs = (page.images || []).map((i) => i.title)
    .filter((t) => /\.(jpe?g)$/i.test(t) && !BAD.test(t));
  return imgs; // array of "File:...jpg"
}

async function fileInfo(fileTitle) {
  const q = await jget("commons.wikimedia.org", {
    action: "query", prop: "imageinfo", iiprop: "extmetadata|url|mime", titles: fileTitle,
  });
  const page = Object.values(q?.query?.pages || {})[0] || {};
  const ii = page?.imageinfo?.[0];
  if (!ii) return null;
  const md = ii.extmetadata || {};
  return {
    url: ii.url, mime: ii.mime, descUrl: ii.descriptionurl,
    licenseName: stripHtml(md.LicenseShortName?.value) || "Unknown",
    artist: stripHtml(md.Artist?.value) || "Unknown",
    free: md.NonFree?.value !== "true",
  };
}

const results = [];
for (const [name, title] of Object.entries(TARGETS)) {
  const a = byName.get(name);
  if (!a) { console.log(`SKIP ${name}: not in dataset`); continue; }
  const outPath = a.images[0];
  const slug = outPath.replace(/^.*\//, "").replace(/\.\w+$/, "");
  try {
    const candidates = await pickPhoto(title);
    let done = false;
    for (const cand of candidates.slice(0, 6)) {
      const info = await fileInfo(cand);
      await sleep(250);
      if (!info || !info.url || !info.free) continue;
      if (!/\/wikipedia\/commons\//.test(info.url)) continue; // Commons-only
      if (!/^image\/(jpeg|png)/.test(info.mime)) continue;
      const img = await fetch(info.url, { headers: { "User-Agent": UA } });
      if (!img.ok) continue;
      const buf = Buffer.from(await img.arrayBuffer());
      const tmp = `assets/img/${slug}.orig`;
      writeFileSync(tmp, buf);
      execFileSync("sips", ["-s", "format", "jpeg", "-Z", "1400", tmp, "--out", outPath], { stdio: "ignore" });
      execFileSync("rm", ["-f", tmp]);
      results.push({ name, file: outPath.replace("assets/img/", ""), title, ...info, cand });
      console.log(`OK  ${name}  <- ${cand}  [${info.licenseName}]`);
      done = true;
      break;
    }
    if (!done) console.log(`FAIL ${name}: no usable photo among ${candidates.length} candidates`);
  } catch (e) {
    console.log(`FAIL ${name}: ${e.message || e}`);
  }
  await sleep(400);
}

// Append recovered rows to CREDITS.md table (before the failures section if present)
let md = readFileSync("CREDITS.md", "utf8");
const newRows = results.map((r) => `| ${r.name} | ${r.file} | ${r.artist} | ${r.licenseName} | [Commons](${r.descUrl}) |`).join("\n");
if (newRows) {
  const marker = "\n## Images not auto-sourced";
  if (md.includes(marker)) md = md.replace(marker, newRows + "\n" + marker);
  else md = md.trimEnd() + "\n" + newRows + "\n";
  writeFileSync("CREDITS.md", md);
}
console.log(`\nRETRY DONE: ${results.length}/${Object.keys(TARGETS).length} recovered.`);
