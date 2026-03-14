/**
 * Builds the config object from the Cloudflare Worker env context.
 * env contains both the vars from wrangler.jsonc and KV bindings.
 */
export function getConfig(env) {
  return {
    amdPageUrl:
      env.AMD_PAGE_URL ||
      "https://www.amd.com/en/support/downloads/drivers.html/chipsets/am5/x870e.html",
    productName: env.PRODUCT_NAME || "AMD Chipset Drivers",
    kvKey: env.KV_KEY || "amd-x870e-chipset-version",
    // Webhook-URL must be set as a Cloudflare secret!
    // add as comma-separated list of webhook URLs, e.g. "https://discord.com/api/webhooks/123/abc,https://..."
    discordWebhookUrls: (env.DISCORD_WEBHOOK_URL || "").split(",").map(u => u.trim()).filter(Boolean),
    stateBinding: env.STATE // the KV namespace object itself, not just a name
  };
}

/**
 * Throws if a required config value is missing.
 * Called right after getConfig so problems surface before any requests are made.
 */
export function validateConfig(config) {
  if (!config.stateBinding) {
    throw new Error("KV binding STATE is missing");
  }

  if (!config.amdPageUrl) {
    throw new Error("AMD_PAGE_URL is missing");
  }

  if (!config.productName) {
    throw new Error("PRODUCT_NAME is missing");
  }

  if (!config.kvKey) {
    throw new Error("KV_KEY is missing");
  }

  if (!config.discordWebhookUrls.length) {
    throw new Error("DISCORD_WEBHOOK_URL is missing");
  }
}