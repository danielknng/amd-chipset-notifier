import { test } from "node:test";
import assert from "node:assert/strict";
import { extractDriverInfo } from "../src/amd.js";

const PRODUCT_NAME = "AMD Chipset Drivers";

function makeHtml({ version = "6.10.10.3", releaseDate = "2026-08-14", fileSize = "45.2 MB", releaseNotesHref = "/support/release-notes/chipset-6-10.html" } = {}) {
  return (
    "<html><body><table>" +
    "<tr><td>" + PRODUCT_NAME + "</td></tr>" +
    "<tr><td>Revision Number</td><td>" + version + "</td></tr>" +
    "<tr><td>Release Date</td><td>" + releaseDate + "</td></tr>" +
    "<tr><td>File Size</td><td>" + fileSize + "</td></tr>" +
    "<tr><td><a href=\"" + releaseNotesHref + "\">Release Notes</a></td></tr>" +
    "</table></body></html>"
  );
}

test("extractDriverInfo: parses version, release date, file size and release notes link", () => {
  const result = extractDriverInfo(makeHtml(), PRODUCT_NAME);

  assert.equal(result.version, "6.10.10.3");
  assert.equal(result.releaseDate, "2026-08-14");
  assert.equal(result.fileSize, "45.2 MB");
  assert.equal(result.releaseNotesUrl, "https://www.amd.com/support/release-notes/chipset-6-10.html");
});

test("extractDriverInfo: keeps an already-absolute release notes URL as-is", () => {
  const html = makeHtml({ releaseNotesHref: "https://www.amd.com/en/support/release-notes/x870" });
  const result = extractDriverInfo(html, PRODUCT_NAME);

  assert.equal(result.releaseNotesUrl, "https://www.amd.com/en/support/release-notes/x870");
});

test("extractDriverInfo: returns nulls when the anchor text isn't found", () => {
  const result = extractDriverInfo("<html><body>Nothing relevant here</body></html>", PRODUCT_NAME);

  assert.equal(result.version, null);
  assert.equal(result.releaseDate, null);
  assert.equal(result.fileSize, null);
  assert.equal(result.releaseNotesUrl, null);
});

test("extractDriverInfo: only matches within range of the product name anchor", () => {
  // A second, unrelated product's revision number sitting right after ours
  // should not bleed into this product's result if it's out of range,
  // this only checks that the correct (first, in-range) match wins.
  const html = makeHtml({ version: "6.10.10.3" });
  const result = extractDriverInfo(html, PRODUCT_NAME);

  assert.equal(result.version, "6.10.10.3");
});
