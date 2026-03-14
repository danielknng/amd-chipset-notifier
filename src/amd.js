import { cleanupHtmlToText, escapeRegex } from "./utils.js";

export async function fetchDriverInfo(config) {
  const html = await fetchHtml(config.amdPageUrl);
  const parsed = extractDriverInfo(html, config.productName);

  if (!parsed.version) {
    throw new Error("Konnte keine Versionsnummer auf der AMD Seite finden");
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
      "user-agent": "Mozilla/5.0 amd-x870e-discord-worker/1.0",
      "accept-language": "en-US,en;q=0.9"
    }
  });

  if (!response.ok) {
    throw new Error("AMD Seite konnte nicht geladen werden. HTTP " + response.status);
  }

  return await response.text();
}

function extractDriverInfo(html, productName) {
  const text = cleanupHtmlToText(html);
  const escapedName = escapeRegex(productName);

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

  return {
    version: versionMatch ? versionMatch[1] : null,
    releaseDate: releaseDateMatch ? releaseDateMatch[1] : null
  };
}