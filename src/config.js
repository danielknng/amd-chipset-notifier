// Add or remove entries here to change which AMD pages are watched.
// Each target needs a Discord webhook secret in Cloudflare named
// DISCORD_WEBHOOK_URL_<ID> (uppercase), e.g. id "x870e" reads
// DISCORD_WEBHOOK_URL_X870E. Comma-separate multiple webhooks per secret.
const TARGETS = [
  {
    id: "x870e",
    amdPageUrl: "https://www.amd.com/en/support/downloads/drivers.html/chipsets/am5/x870e.html",
    productName: "AMD Chipset Drivers"
  }
  // {
  //   id: "x670e",
  //   amdPageUrl: "https://www.amd.com/en/support/downloads/drivers.html/chipsets/am5/x670e.html",
  //   productName: "AMD Chipset Drivers"
  // }
];

/**
 * Builds the config object from TARGETS and the Cloudflare Worker env
 * context. env only supplies the webhook secrets and the KV binding.
 */
export function getConfig(env) {
  return {
    targets: TARGETS.map((target) => ({
      amdPageUrl: target.amdPageUrl,
      productName: target.productName,
      kvKey: "amd-" + target.id + "-chipset-version",
      discordWebhookUrls: (env["DISCORD_WEBHOOK_URL_" + target.id.toUpperCase()] || "")
        .split(",")
        .map((u) => u.trim())
        .filter(Boolean)
    })),
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

  if (!config.targets.length) {
    throw new Error("No targets configured in TARGETS");
  }

  config.targets.forEach((target) => {
    if (!target.discordWebhookUrls.length) {
      throw new Error("Missing Discord webhook secret for target with kvKey " + target.kvKey);
    }
  });
}
