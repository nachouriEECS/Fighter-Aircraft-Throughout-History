// test/filter.test.js
import { test } from "node:test";
import assert from "node:assert/strict";
import { applyControls, facetValues } from "../js/filter.js";

const data = [
  { dexNo:1, name:"Spitfire", manufacturer:"Supermarine", country:"UK", roles:["Fighter"], generation:"WWII", era:"WWII", yearIntroduced:1938 },
  { dexNo:2, name:"F-15 Eagle", manufacturer:"McDonnell Douglas", country:"USA", roles:["Air Superiority","Fighter"], generation:"4th gen", era:"Cold War", yearIntroduced:1976 },
];
const empty = { country:new Set(), roles:new Set(), generation:new Set(), era:new Set() };

test("query matches name", () => {
  const r = applyControls(data, { query:"eagle", filters:empty, sort:"dexNo" });
  assert.equal(r.length, 1); assert.equal(r[0].name, "F-15 Eagle");
});
test("query matches manufacturer", () => {
  const r = applyControls(data, { query:"supermarine", filters:empty, sort:"dexNo" });
  assert.equal(r[0].name, "Spitfire");
});
test("country filter", () => {
  const f = { ...empty, country:new Set(["USA"]) };
  const r = applyControls(data, { query:"", filters:f, sort:"dexNo" });
  assert.equal(r.length, 1); assert.equal(r[0].country, "USA");
});
test("role filter matches any role", () => {
  const f = { ...empty, roles:new Set(["Air Superiority"]) };
  const r = applyControls(data, { query:"", filters:f, sort:"dexNo" });
  assert.equal(r.length, 1);
});
test("sort by year", () => {
  const r = applyControls(data, { query:"", filters:empty, sort:"yearIntroduced" });
  assert.equal(r[0].yearIntroduced, 1938);
});
test("facetValues for roles flattens and dedupes", () => {
  const v = facetValues(data, "roles");
  assert.deepEqual(v, ["Air Superiority", "Fighter"]);
});
test("facetValues respects explicit ordinal order", () => {
  const eras = [
    { era: "Cold War" }, { era: "Modern" }, { era: "WWII" },
  ];
  const v = facetValues(eras, "era", ["WWII", "Cold War", "Modern"]);
  assert.deepEqual(v, ["WWII", "Cold War", "Modern"]);
});
test("facetValues sorts unordered values to the end alphabetically", () => {
  const gens = [
    { generation: "5th gen" }, { generation: "Zeppelin" }, { generation: "WWII" },
  ];
  const v = facetValues(gens, "generation", ["WWII", "5th gen"]);
  assert.deepEqual(v, ["WWII", "5th gen", "Zeppelin"]);
});
