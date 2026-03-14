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
  async scheduled(controller, env, ctx) {
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
  const previous = await loadStoredState(env, config.kvKey);

  const currentState = {
    productName: config.productName,
    version: current.version,
    releaseDate: current.releaseDate,
    pageUrl: config.amdPageUrl,
    checkedAt: new Date().toISOString()
  };

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