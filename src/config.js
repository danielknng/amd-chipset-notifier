export function getConfig(env) {
  return {
    amdPageUrl:
      env.AMD_PAGE_URL ||
      "https://www.amd.com/en/support/downloads/drivers.html/chipsets/am5/x870e.html",
    productName: env.PRODUCT_NAME || "AMD Chipset Drivers",
    kvKey: env.KV_KEY || "amd-x870e-chipset-version",
    discordWebhookUrl: env.DISCORD_WEBHOOK_URL || "",
    stateBinding: env.STATE
  };
}

export function validateConfig(config) {
  if (!config.stateBinding) {
    throw new Error("KV Binding STATE fehlt");
  }

  if (!config.amdPageUrl) {
    throw new Error("AMD_PAGE_URL fehlt");
  }

  if (!config.productName) {
    throw new Error("PRODUCT_NAME fehlt");
  }

  if (!config.kvKey) {
    throw new Error("KV_KEY fehlt");
  }

  if (!config.discordWebhookUrl) {
    throw new Error("DISCORD_WEBHOOK_URL fehlt");
  }
}