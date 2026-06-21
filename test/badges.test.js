import { test } from "node:test";
import assert from "node:assert/strict";
import { roleColor, countryMeta, ROLE_COLORS } from "../js/badges.js";

test("known role returns its color", () => {
  assert.equal(roleColor("Fighter"), ROLE_COLORS.Fighter);
});
test("unknown role falls back to default", () => {
  assert.equal(roleColor("Spaceship"), ROLE_COLORS.default);
});
test("country meta returns flag and color", () => {
  const m = countryMeta("USA");
  assert.ok(m.flag && m.color);
});
test("unknown country falls back", () => {
  assert.equal(countryMeta("Atlantis").color, "#777");
});
