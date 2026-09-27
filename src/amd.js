import { cleanupHtmlToText, escapeRegex } from "./utils.js";

/**
 * Fetches the AMD driver page and returns version, releaseDate and changelog.
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
    fileSize: parsed.fileSize,
    changelog: parsed.releaseNotesUrl ? await fetchChangelog(parsed.releaseNotesUrl) : null,
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
 * Extracts the version number, release date and release notes link from the
 * AMD page. productName is used as an anchor so the regexes target the
 * correct table. The href regex runs on the raw HTML (not the cleaned
 * plaintext) since cleanupHtmlToText strips all tags, hrefs included.
 */
export function extractDriverInfo(html, productName) {
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

  const fileSizeRegex = new RegExp(
    escapedName + "[\\s\\S]{0,1300}?File Size[\\s\\S]{0,100}?([0-9.]+ ?[KMGT]B)",
    "i"
  );

  const releaseNotesRegex = new RegExp(
    escapedName + "[\\s\\S]{0,2000}?href=\"([^\"]*release-notes[^\"]*)\"",
    "i"
  );

  const versionMatch = text.match(versionRegex);
  const releaseDateMatch = text.match(releaseDateRegex);
  const fileSizeMatch = text.match(fileSizeRegex);
  const releaseNotesMatch = html.match(releaseNotesRegex);

  // [1] is the first capture group (the part inside the parentheses in the regex)
  return {
    version: versionMatch ? versionMatch[1] : null,
    releaseDate: releaseDateMatch ? releaseDateMatch[1] : null,
    fileSize: fileSizeMatch ? fileSizeMatch[1] : null,
    releaseNotesUrl: releaseNotesMatch ? normalizeUrl(releaseNotesMatch[1]) : null
  };
}

function normalizeUrl(url) {
  return url.startsWith("http") ? url : "https://www.amd.com" + url;
}

/**
 * Fetches the release notes page linked from the driver table and pulls out
 * its "Release Highlights" summary. Missing or unparsable release notes
 * shouldn't fail the whole check, AMD's own changelog for the day is more
 * valuable than none, so this returns null instead of throwing.
 */
async function fetchChangelog(releaseNotesUrl) {
  try {
    const html = await fetchHtml(releaseNotesUrl);
    const text = cleanupHtmlToText(html);

    const match = text.match(
      /Release Highlights([\s\S]{0,1000}?)(Known Issues|Chipset Support|Package Contents|Change Details|$)/i
    );

    return match ? match[1].trim() || null : null;
  } catch {
    return null;
  }
}