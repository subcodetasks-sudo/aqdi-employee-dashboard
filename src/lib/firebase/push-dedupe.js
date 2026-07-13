const recentMessageIds = new Map();
const DEDUPE_WINDOW_MS = 4000;

export function shouldHandlePushPayload(payload) {
  const id =
    payload?.messageId ||
    payload?.fcmMessageId ||
    payload?.data?.messageId ||
    `${payload?.notification?.title || ""}:${payload?.notification?.body || ""}:${payload?.data?.type || ""}`;

  if (!id) return true;

  const now = Date.now();
  const lastSeen = recentMessageIds.get(id);

  if (lastSeen && now - lastSeen < DEDUPE_WINDOW_MS) {
    return false;
  }

  recentMessageIds.set(id, now);

  if (recentMessageIds.size > 50) {
    for (const [key, timestamp] of recentMessageIds) {
      if (now - timestamp > DEDUPE_WINDOW_MS) {
        recentMessageIds.delete(key);
      }
    }
  }

  return true;
}
