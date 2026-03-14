export async function loadStoredState(env, kvKey) {
  return await env.STATE.get(kvKey, "json");
}

export async function saveCurrentState(env, kvKey, state) {
  await env.STATE.put(kvKey, JSON.stringify(state));
}

export async function updateCheckedAtOnly(env, kvKey, previousState) {
  const updated = {
    ...previousState,
    checkedAt: new Date().toISOString()
  };

  await env.STATE.put(kvKey, JSON.stringify(updated));
}