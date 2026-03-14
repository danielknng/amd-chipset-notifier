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
  // Different message for test notifications so it is clear this is not a real find
  if (data.forceNotify) {
    return {
      content:
        // Discord ignores newlines ("\n") at the start of a message. 
        // We therefore have to send a Zero Width Space (U+200B). 
        "\u200B\n" +
        "**TEST NOTIFICATION**\n" +
        "Product: " + config.productName + "\n" +
        "Current version: " + data.currentVersion + "\n" +
        "Release date: " + (data.releaseDate || "unknown") + "\n" +
        "Page: " + config.amdPageUrl
    };
  }

  return {
    content:
      "\u200B\n" +
      "**New AMD Chipset Driver released!**\n" +
      "Product: " + config.productName + "\n" +
      "Previous: " + data.previousVersion + "\n" +
      "New: " + data.currentVersion + "\n" +
      "Release date: " + (data.releaseDate || "unknown") + "\n" +
      "Download: " + config.amdPageUrl
  };
}