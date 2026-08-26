"use client";

import { initializeApp, getApps } from "firebase/app";
import { getDatabase, ref, onValue } from "firebase/database";
import { getFirebaseConfig, isRealtimeDbConfigured } from "./config";

let dbInstance = null;

function getFirebaseApp() {
  if (getApps().length) return getApps()[0];
  return initializeApp(getFirebaseConfig());
}

export { isRealtimeDbConfigured };

function getRealtimeDb() {
  if (!isRealtimeDbConfigured()) return null;
  if (!dbInstance) dbInstance = getDatabase(getFirebaseApp());
  return dbInstance;
}

/**
 * Subscribes to a Realtime Database path with `onValue` (not a one-shot read).
 * Returns an unsubscribe function, or null if Realtime Database isn't configured.
 */
export function subscribeToPath(path, onData, onError) {
  const db = getRealtimeDb();
  if (!db || !path) return null;

  return onValue(
    ref(db, path),
    (snapshot) => onData(snapshot.val()),
    (error) => onError?.(error)
  );
}
