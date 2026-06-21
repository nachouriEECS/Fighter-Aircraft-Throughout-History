import { test } from "node:test";
import assert from "node:assert/strict";
import { validateAircraft, validateDataset } from "../js/validate.js";
import { readFileSync } from "node:fs";

const valid = {
  dexNo: 1, name: "X", manufacturer: "Y", country: "USA",
  roles: ["Fighter"], generation: "4th gen", era: "Cold War",
  yearIntroduced: 1976, yearDiscontinued: null, status: "In service",
  notableConflicts: [], specs: {}, funFact: "f", blurb: "b", images: ["a.jpg"]
};

test("valid record has no errors", () => {
  assert.deepEqual(validateAircraft(valid), []);
});

test("missing name is reported", () => {
  const bad = { ...valid, name: "" };
  assert.ok(validateAircraft(bad).some(e => e.includes("name")));
});

test("roles must be a non-empty array", () => {
  const bad = { ...valid, roles: [] };
  assert.ok(validateAircraft(bad).some(e => e.includes("roles")));
});

test("invalid country is reported", () => {
  const bad = { ...valid, country: "Spain" };
  assert.ok(validateAircraft(bad).some(e => e.includes("country")));
});

test("dataset flags duplicate dexNo", () => {
  const { errors } = validateDataset([valid, { ...valid }]);
  assert.ok(errors.some(e => e.includes("duplicate")));
});

test("data/aircraft.json is valid", () => {
  const data = JSON.parse(readFileSync(new URL("../data/aircraft.json", import.meta.url)));
  const { errors } = validateDataset(data);
  assert.deepEqual(errors, [], errors.join("\n"));
});
