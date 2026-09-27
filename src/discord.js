/**
 * Sends a message to all configured Discord webhooks.
 */
export async function sendDiscordNotification(config, data) {
  const payload = buildDiscordMessage(config, data);

  for (const url of config.discordWebhookUrls) {
    const response = await fetch(url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      // Include the response body since Discord usually returns a helpful error message
      const body = await response.text();
      throw new Error("Discord webhook error. HTTP " + response.status + " Body: " + body);
    }
  }
}

// AMD's own brand red, confirmed from amd.com's own stylesheet (not a third-party guess)
const EMBED_COLOR = 0xed1c24;

function buildDiscordMessage(config, data) {
  const fields = [
    { name: "Last Version", value: "`" + data.previousVersion + "`", inline: false },
    { name: "Current Version", value: "`" + data.currentVersion + "`", inline: false },
    { name: "Release date", value: "`" + (data.releaseDate || "unknown") + "`", inline: false }
  ];

  if (data.fileSize) {
    fields.push({ name: "File size", value: "`" + data.fileSize + "`", inline: false });
  }

  if (data.changelog) {
    fields.push({ name: "Changelog", value: quoteLines(data.changelog), inline: false });
  }

  return {
    embeds: [
      {
        author: { name: config.productName },
        // Different title for test notifications so it is clear this is not a real find
        title: data.forceNotify ? "TEST NOTIFICATION" : "New AMD Chipset Driver released!",
        url: config.amdPageUrl,
        color: EMBED_COLOR,
        fields
      }
    ]
  };
}

// Discord requires "> " at the start of every line for a blockquote, without
// this a multi-line changelog would only quote its first line.
function quoteLines(text) {
  return text
    .split("\n")
    .map((line) => "> " + line)
    .join("\n");
}