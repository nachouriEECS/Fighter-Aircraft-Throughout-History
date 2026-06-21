import { test } from "node:test";
import assert from "node:assert/strict";
import { fmtLength, fmtWeight, fmtSpeed, fmtRange, fmtAltitude, dexLabel } from "../js/format.js";

test("fmtLength shows metric and imperial", () => {
  assert.equal(fmtLength(13.05), "13.05 m (42.8 ft)");
});
test("fmtWeight formats with thousands separators", () => {
  assert.equal(fmtWeight(12700), "12,700 kg (27,999 lb)");
});
test("fmtSpeed converts km/h to mph", () => {
  assert.equal(fmtSpeed(3017), "3,017 km/h (1,875 mph)");
});
test("fmtRange converts km to mi", () => {
  assert.equal(fmtRange(5550), "5,550 km (3,449 mi)");
});
test("fmtAltitude converts m to ft", () => {
  assert.equal(fmtAltitude(20000), "20,000 m (65,617 ft)");
});
test("missing value returns dash", () => {
  assert.equal(fmtLength(null), "—");
  assert.equal(fmtWeight(undefined), "—");
});
test("dexLabel zero-pads to 4 digits", () => {
  assert.equal(dexLabel(7), "N.º 0007");
});
