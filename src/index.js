import { getConfig, validateConfig } from "./config.js";
import { fetchDriverInfo } from "./amd.js";
import { sendDiscordNotification } from "./discord.js";
import {
  loadStoredState,
  saveCurrentState,
  updateCheckedAtOnly
} from "./state.js";
import { compareVersions, jsonResponse } from "./utils.js";

export default {
  // Invoked by the Cloudflare cron trigger (schedule defined in wrangler.jsonc)
  async scheduled(controller, env, ctx) {
    // ctx.waitUntil keeps the Worker alive until runCheck has finished
    ctx.waitUntil(runCheck(env, { forceNotify: false, manual: false }));
  },

  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    try {
      if (url.pathname === "/run") {
        const result = await runCheck(env, { forceNotify: false, manual: true });
        return jsonResponse(result, 200);
      }

      if (url.pathname === "/notify-test") {
        // Sends a Discord notification even if the version has not changed
        const result = await runCheck(env, { forceNotify: true, manual: true });
        return jsonResponse(result, 200);
      }

      if (url.pathname === "/state") {
        const config = getConfig(env);
        validateConfig(config);
        const state = await loadStoredState(env, config.kvKey);

        return jsonResponse(
          {
            ok: true,
            state: state || null
          },
          200
        );
      }

      return new Response("OK", { status: 200 });
    } catch (error) {
      return jsonResponse(
        {
          ok: false,
          error: error instanceof Error ? error.message : String(error)
        },
        500
      );
    }
  }
};

async function runCheck(env, options = {}) {
  const config = getConfig(env);
  validateConfig(config);

  const forceNotify = options.forceNotify === true;
  const manual = options.manual === true;

  const current = await fetchDriverInfo(config);

  // null on the very first run before any state has been saved
  const previous = await loadStoredState(env, config.kvKey);

  const currentState = {
    productName: config.productName,
    version: current.version,
    releaseDate: current.releaseDate,
    pageUrl: config.amdPageUrl,
    checkedAt: new Date().toISOString()
  };

  // First run: no previous version to compare against, just save and exit
  if (!previous) {
    await saveCurrentState(env, config.kvKey, currentState);

    return {
      ok: true,
      initialized: true,
      changed: false,
      notified: false,
      manual,
      previous: null,
      current: currentState
    };
  }

  // > 0 means current is newer than previous
  const versionDiff = compareVersions(current.version, previous.version);
  const changed = versionDiff > 0;
  const shouldNotify = changed || forceNotify;

  if (shouldNotify) {
    await sendDiscordNotification(config, {
      previousVersion: previous.version,
      currentVersion: current.version,
      releaseDate: current.releaseDate,
      forceNotify
    });
  }

  if (changed) {
    await saveCurrentState(env, config.kvKey, currentState);
  } else {
    // No version change, only update the timestamp
    await updateCheckedAtOnly(env, config.kvKey, previous);
  }

  return {
    ok: true,
    initialized: false,
    changed,
    notified: shouldNotify,
    manual,
    previous,
    current: currentState
  };
}