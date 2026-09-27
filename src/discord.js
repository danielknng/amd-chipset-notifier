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

function buildDiscordMessage(config, data) {
  // Discord ignores newlines ("\n") at the start of a message.
  // We therefore have to send a Zero Width Space (U+200B).
  const lines = [
    "\u200B",
    // Different title for test notifications so it is clear this is not a real find
    "**" + (data.forceNotify ? "TEST NOTIFICATION" : "New AMD Chipset Driver released!") + "**",
    "Product: " + config.productName,
    "Last Version: " + data.previousVersion,
    "Current Version: " + data.currentVersion,
    "Release date: " + (data.releaseDate || "unknown")
  ];

  if (data.changelog) {
    lines.push("Changelog: " + data.changelog);
  }

  lines.push((data.forceNotify ? "Page: " : "Download: ") + config.amdPageUrl);

  return { content: lines.join("\n") };
}