export async function sendDiscordNotification(config, data) {
  const payload = buildDiscordMessage(config, data);

  const response = await fetch(config.discordWebhookUrl, {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(
      "Discord Webhook Fehler. HTTP " + response.status + " Body: " + body
    );
  }
}

function buildDiscordMessage(config, data) {
  if (data.forceNotify) {
    return {
      content:
        "AMD Treiber Check Test\n" +
        "Produkt: " + config.productName + "\n" +
        "Aktuelle Version: " + data.currentVersion + "\n" +
        "Release Date: " + (data.releaseDate || "unbekannt") + "\n" +
        "Seite: " + config.amdPageUrl
    };
  }

  return {
    content:
      "Neuer AMD Chipset Treiber veröffentlicht!\n" +
      "Produkt: " + config.productName + "\n" +
      "Alt: " + data.previousVersion + "\n" +
      "Neu: " + data.currentVersion + "\n" +
      "Release Date: " + (data.releaseDate || "unbekannt") + "\n" +
      "Download: " + config.amdPageUrl
  };
}