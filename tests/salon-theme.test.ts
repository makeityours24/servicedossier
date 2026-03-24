import test from "node:test";
import assert from "node:assert/strict";
import { getSalonThemeStyle } from "../lib/salon-theme";

test("salon theme style exposes accent variables from a valid salon color", () => {
  const style = getSalonThemeStyle("#4a89dc");

  assert.equal(style["--accent"], "#4a89dc");
  assert.equal(style["--accent-donker"], "#35639e");
  assert.equal(style["--accent-zacht"], "#e6eefa");
});

test("salon theme style falls back to the default accent for invalid values", () => {
  const style = getSalonThemeStyle("blauw");

  assert.equal(style["--accent"], "#b42323");
});
