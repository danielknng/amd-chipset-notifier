/**
 * Compares two version strings (e.g. "6.10.10.3").
 * Returns 1 if a is newer, -1 if older, 0 if equal.
 */
export function compareVersions(leftVersion, rightVersion) {
  const left = String(leftVersion)
    .split(".")
    .map((part) => parseInt(part, 10) || 0);

  const right = String(rightVersion)
    .split(".")
    .map((part) => parseInt(part, 10) || 0);

  // Use the longer array length so we don't miss trailing segments
  const maxLength = Math.max(left.length, right.length);

  for (let index = 0; index < maxLength; index++) {
    // || 0 because the shorter array returns undefined at this index
    const leftValue = left[index] || 0;
    const rightValue = right[index] || 0;

    if (leftValue > rightValue) return 1;
    if (leftValue < rightValue) return -1;
  }

  return 0;
}

/**
 * Strips tags, scripts, styles, and HTML entities from a raw HTML string.
 * Used to produce clean plaintext before running version regexes over it.
 */
export function cleanupHtmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ") // [\s\S] matches newlines too
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Escapes special characters in a string so it can safely be used in new RegExp().
 */
export function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& is the matched character itself
}

/**
 * Returns a consistent JSON response.
 */
export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8"
    }
  });
}