import { cleanupHtmlToText, escapeRegex } from "./utils.js";

/**
 * Fetches the AMD driver page and returns version and releaseDate.
 */
export async function fetchDriverInfo(config) {
  const html = await fetchHtml(config.amdPageUrl);
  const parsed = extractDriverInfo(html, config.productName);

  if (!parsed.version) {
    throw new Error("Could not find a version number on the AMD page");
  }

  return {
    productName: config.productName,
    version: parsed.version,
    releaseDate: parsed.releaseDate,
    pageUrl: config.amdPageUrl
  };
}

async function fetchHtml(url) {
  const response = await fetch(url, {
    method: "GET",
    headers: {
      // AMD blocks requests without a User-Agent header
      "user-agent": "Mozilla/5.0 amd-chipset-notifier/1.0",
      "accept-language": "en-US,en;q=0.9"
    }
  });

  if (!response.ok) {
    throw new Error("Failed to load AMD page. HTTP " + response.status);
  }

  return await response.text();
}

/**
 * Extracts the version number and release date from the AMD page plaintext.
 * productName is used as an anchor so the regex targets the correct table.
 */
function extractDriverInfo(html, productName) {
  const text = cleanupHtmlToText(html);
  const escapedName = escapeRegex(productName);

  // [\s\S]{0,1200}? lazily matches everything including newlines up to "Revision Number"
  const versionRegex = new RegExp(
    escapedName +
      "[\\s\\S]{0,1200}?Revision Number[\\s\\S]{0,200}?([0-9]+(?:\\.[0-9]+)+)",
    "i"
  );

  const releaseDateRegex = new RegExp(
    escapedName +
      "[\\s\\S]{0,1400}?Release Date[\\s\\S]{0,100}?([0-9]{4}-[0-9]{2}-[0-9]{2})",
    "i"
  );

  const versionMatch = text.match(versionRegex);
  const releaseDateMatch = text.match(releaseDateRegex);

  // [1] is the first capture group (the part inside the parentheses in the regex)
  return {
    version: versionMatch ? versionMatch[1] : null,
    releaseDate: releaseDateMatch ? releaseDateMatch[1] : null
  };
}