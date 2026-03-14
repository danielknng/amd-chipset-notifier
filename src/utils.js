export function compareVersions(leftVersion, rightVersion) {
  const left = String(leftVersion)
    .split(".")
    .map((part) => parseInt(part, 10) || 0);

  const right = String(rightVersion)
    .split(".")
    .map((part) => parseInt(part, 10) || 0);

  const maxLength = Math.max(left.length, right.length);

  for (let index = 0; index < maxLength; index++) {
    const leftValue = left[index] || 0;
    const rightValue = right[index] || 0;

    if (leftValue > rightValue) {
      return 1;
    }

    if (leftValue < rightValue) {
      return -1;
    }
  }

  return 0;
}

export function cleanupHtmlToText(html) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/&nbsp;/gi, " ")
    .replace(/&#160;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/\s+/g, " ")
    .trim();
}

export function escapeRegex(value) {
  return String(value).replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data, null, 2), {
    status,
    headers: {
      "content-type": "application/json; charset=UTF-8"
    }
  });
}