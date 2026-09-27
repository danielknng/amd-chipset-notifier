import { test } from "node:test";
import assert from "node:assert/strict";
import { compareVersions, cleanupHtmlToText, escapeRegex } from "../src/utils.js";

test("compareVersions: newer, older, equal", () => {
  assert.equal(compareVersions("6.10.10.3", "6.10.10.2"), 1);
  assert.equal(compareVersions("6.10.10.2", "6.10.10.3"), -1);
  assert.equal(compareVersions("6.10.10.3", "6.10.10.3"), 0);
});

test("compareVersions: different segment counts", () => {
  assert.equal(compareVersions("6.10", "6.10.0.1"), -1);
  assert.equal(compareVersions("6.10.0.0", "6.10"), 0);
});

test("compareVersions: non-numeric segments fall back to 0", () => {
  assert.equal(compareVersions("6.x.10", "6.0.10"), 0);
});

test("cleanupHtmlToText: strips tags, scripts, styles and entities", () => {
  const html = "<script>evil()</script><style>.a{}</style><p>Hello&nbsp;World</p>";
  assert.equal(cleanupHtmlToText(html), "Hello World");
});

test("cleanupHtmlToText: collapses whitespace across newlines", () => {
  const html = "<div>Line one</div>\n\n<div>   Line two</div>";
  assert.equal(cleanupHtmlToText(html), "Line one Line two");
});

test("escapeRegex: escapes regex special characters", () => {
  assert.equal(escapeRegex("AMD Ryzen (Chipset)"), "AMD Ryzen \\(Chipset\\)");
  assert.equal(new RegExp(escapeRegex("a.b+c")).test("a.b+c"), true);
  assert.equal(new RegExp(escapeRegex("a.b+c")).test("axbc"), false);
});
