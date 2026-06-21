// Re-source specific aircraft images that were wrong/duplicated.
// Uses Commons File-namespace search with strict word-boundary name matching
// + per-aircraft exclusions + landscape/size filtering. Updates CREDITS.md rows.
import { readFileSync, writeFileSync } from "node:fs";
import { execFileSync } from "node:child_process";

const UA = "FighterDexBot/1.0 (educational aircraft catalog; nachouri@umich.edu)";
const data = JSON.parse(readFileSync("data/aircraft.json", "utf8"));
const byName = new Map(data.map((a) => [a.name, a]));
const strip = (s) => (s || "").replace(/<[^>]*>/g, "").replace(/\s+/g, " ").trim();
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const norm = (s) => s.toLowerCase().replace(/[_\-]/g, " ").replace(/\s+/g, " ");
const BADGEN = /roundel|insignia|\bflag\b|logo|icon|\.svg|drawing|3.?view|diagram|cockpit|\bengine\b|cowling|wreck|crash|\bmap\b|airport|flughafen|si.?ge social|book|stamp|marka|memorial|\bgrave\b|interior|gauge|patch|badge|emblem/i;

// name -> { q: search query, inc: [include word-tokens], exc: [exclude word-tokens] }
const JOBS = {
  "Focke-Wulf Fw 190": { q: "Focke-Wulf Fw 190 flying", inc: ["fw 190"], exc: ["fw 189", "fw 200", "fw 44", "fw 61", "ta 152"] },
  "Messerschmitt Me 262": { q: "Messerschmitt Me 262 aircraft", inc: ["me 262"], exc: ["me 163", "me 309", "me 410", "bf 109"] },
  "Yakovlev Yak-3": { q: "Yakovlev Yak-3 fighter", inc: ["yak 3"], exc: ["yak 38", "yak 9", "yak 1", "yak 7", "yak 15", "yak 130", "yak 52"] },
  "Heinkel He 162": { q: "Heinkel He 162 Spatz aircraft", inc: ["he 162"], exc: ["he 111", "he 178", "he 219"] },
  "MiG-15": { q: "Mikoyan-Gurevich MiG-15 aircraft", inc: ["mig 15"], exc: ["mig 17", "mig 19", "mig 21", "mig 25"] },
  "MiG-17": { q: "Mikoyan-Gurevich MiG-17 aircraft", inc: ["mig 17"], exc: ["mig 15", "mig 19"] },
  "MiG-19": { q: "Mikoyan-Gurevich MiG-19 Farmer aircraft", inc: ["mig 19"], exc: ["mig 15", "mig 17", "mig 21", "mig 25"] },
  "MiG-21": { q: "Mikoyan-Gurevich MiG-21 flying", inc: ["mig 21"], exc: ["mig 23", "mig 25", "mig 19"] },
  "MiG-23": { q: "Mikoyan-Gurevich MiG-23 Flogger aircraft", inc: ["mig 23"], exc: ["mig 21", "mig 25", "mig 27 "] },
  "Hawker Hunter": { q: "Hawker Hunter jet flying", inc: ["hunter"], exc: ["nimrod", "typhoon", "tempest", "hurricane"] },
  "Dassault Mystère IV": { q: "Dassault Mystere IV aircraft", inc: ["mystere iv", "mystere 4"], exc: ["super mystere", "social", "siege"] },
  "Dassault Mirage III": { q: "Dassault Mirage III flying", inc: ["mirage iii", "mirage 3"], exc: ["mirage 2000", "mirage iv", "mirage 4000", "mirage f1", "mirage 5", "mirage g", "social"] },
  "Dassault Mirage F1": { q: "Dassault Mirage F1 flying", inc: ["mirage f1", "mirage f 1"], exc: ["mirage iii", "mirage 2000", "mirage 4000", "social"] },
  "Dassault Super Étendard": { q: "Dassault Super Etendard navy aircraft", inc: ["super etendard", "etendard"], exc: ["super mystere", "social"] },
  "Mitsubishi F-1": { q: "Mitsubishi F-1 JASDF aircraft", inc: ["mitsubishi f 1"], exc: ["f 15", "f 2 ", "f 86", "f 104", "t 2"] },
  "Mitsubishi F-2": { q: "Mitsubishi F-2 JASDF aircraft", inc: ["mitsubishi f 2"], exc: ["f 15", "f 16", "f 1 "] },
  "Dassault Mirage 2000": { q: "Dassault Mirage 2000 flying", inc: ["mirage 2000"], exc: ["mirage iii", "mirage 4000", "mirage f1", "social"] },
  "Nakajima Ki-43 Hayabusa": { q: "Nakajima Ki-43 Hayabusa Oscar", inc: ["ki 43", "hayabusa"], exc: ["ki 44", "ki 45", "ki 61", "ki 84", "book"] },
};

async function commonsSearch(q) {
  const u = "https://commons.wikimedia.org/w/api.php?" + new URLSearchParams({
    format: "json", action: "query", generator: "search", gsrnamespace: "6",
    gsrlimit: "40", gsrsearch: q, prop: "imageinfo",
    iiprop: "url|mime|size|extmetadata",
  });
  const r = await fetch(u, { headers: { "User-Agent": UA } });
  return Object.values((await r.json())?.query?.pages || {});
}

function matches(title, inc, exc) {
  const n = norm(title);
  const incOk = inc.some((t) => new RegExp(`\\b${t.replace(/\s/g, "\\s")}\\b`).test(n));
  const excBad = exc.some((t) => new RegExp(`\\b${t.trim().replace(/\s/g, "\\s")}\\b`).test(n));
  return incOk && !excBad;
}

let creds = readFileSync("CREDITS.md", "utf8");
const summary = [];
for (const [name, job] of Object.entries(JOBS)) {
  const a = byName.get(name);
  const out = a.images[0];
  const slug = out.replace(/^.*\//, "").replace(/\.\w+$/, "");
  try {
    const pages = await commonsSearch(job.q);
    // prefer in-flight/landscape big photos
    const cands = pages
      .filter((p) => /\.(jpe?g)$/i.test(p.title) && !BADGEN.test(p.title) && matches(p.title, job.inc, job.exc))
      .map((p) => ({ p, ii: p.imageinfo?.[0] }))
      .filter((c) => c.ii && c.ii.url && /\/wikipedia\/commons\//.test(c.ii.url) && /^image\/jpeg/.test(c.ii.mime) && c.ii.width >= 900 && c.ii.width >= c.ii.height)
      .sort((x, y) => {
        const fx = /flight|flying|airshow|display/i.test(x.p.title) ? 0 : 1;
        const fy = /flight|flying|airshow|display/i.test(y.p.title) ? 0 : 1;
        return fx - fy;
      });
    if (!cands.length) { summary.push(`FAIL ${name}: no match`); continue; }
    const { p, ii } = cands[0];
    const md = ii.extmetadata || {};
    if (md.NonFree?.value === "true") { summary.push(`FAIL ${name}: top match non-free`); continue; }
    const img = await fetch(ii.url, { headers: { "User-Agent": UA } });
    const tmp = `assets/img/${slug}.orig`;
    writeFileSync(tmp, Buffer.from(await img.arrayBuffer()));
    execFileSync("sips", ["-s", "format", "jpeg", "-Z", "1400", tmp, "--out", out], { stdio: "ignore" });
    execFileSync("rm", ["-f", tmp]);
    // update CREDITS row
    const file = out.replace("assets/img/", "");
    const re = new RegExp(`^\\| ${name.replace(/[.*+?^${}()|[\\]\\\\]/g, "\\$&")} \\|.*$`, "m");
    const row = `| ${name} | ${file} | ${strip(md.Artist?.value) || "Unknown"} | ${strip(md.LicenseShortName?.value) || "Unknown"} | [Commons](${ii.descriptionurl}) |`;
    creds = re.test(creds) ? creds.replace(re, row) : creds;
    summary.push(`OK   ${name} <- ${p.title} [${strip(md.LicenseShortName?.value)}] ${ii.width}x${ii.height}`);
  } catch (e) {
    summary.push(`FAIL ${name}: ${e.message || e}`);
  }
  await sleep(400);
}
writeFileSync("CREDITS.md", creds);
console.log(summary.join("\n"));
