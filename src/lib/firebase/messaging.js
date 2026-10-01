"use client";

import { initializeApp, getApps } from "firebase/app";
import { deleteToken, getMessaging, getToken, isSupported } from "firebase/messaging";
import { getFirebaseConfig, isFirebaseConfigured } from "./config";

const SW_PATH = "/firebase-messaging-sw.js";
const SW_SCOPE = "/";
const FCM_TOKEN_STORAGE_KEY = "fcm-token";
const FCM_PROJECT_STORAGE_KEY = "fcm-project-id";

let messagingInstance = null;
let serviceWorkerRegistration = null;

function getFirebaseApp() {
  if (getApps().length) return getApps()[0];
  return initializeApp(getFirebaseConfig());
}

export function getStoredFcmToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(FCM_TOKEN_STORAGE_KEY);
}

export function storeFcmToken(token) {
  if (typeof window === "undefined" || !token) return;
  localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token);
}

export function clearStoredFcmToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(FCM_TOKEN_STORAGE_KEY);
}

export function resetFirebaseMessagingState() {
  messagingInstance = null;
  serviceWorkerRegistration = null;
}

/**
 * Stops push delivery for this browser: deletes the FCM registration with
 * Firebase, then clears the locally cached token. Best-effort — never throws.
 */
export async function disconnectFcmToken() {
  if (typeof window === "undefined") return;

  const hadLocalToken = !!getStoredFcmToken();
  const hadMessaging = !!messagingInstance;

  // Already disconnected — avoid re-registering the service worker just to
  // discover there is nothing left to delete.
  if (!hadLocalToken && !hadMessaging) {
    return;
  }

  try {
    if (isFirebaseConfigured() && (await isSupported())) {
      const messaging =
        messagingInstance || (await getFirebaseMessaging().catch(() => null));
      if (messaging) {
        await deleteToken(messaging);
      }
    }
  } catch (error) {
    console.warn("[firebase] Failed to delete FCM token:", error);
  } finally {
    clearStoredFcmToken();
    resetFirebaseMessagingState();
  }
}

async function ensureFirebaseProjectSync() {
  if (typeof window === "undefined") return;

  const currentProject = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
  const storedProject = localStorage.getItem(FCM_PROJECT_STORAGE_KEY);

  if (storedProject && storedProject !== currentProject) {
    clearStoredFcmToken();
    resetFirebaseMessagingState();

    if ("serviceWorker" in navigator) {
      const registrations = await navigator.serviceWorker.getRegistrations();
      await Promise.all(registrations.map((registration) => registration.unregister()));
    }
  }

  if (currentProject) {
    localStorage.setItem(FCM_PROJECT_STORAGE_KEY, currentProject);
  }
}

export async function registerFirebaseServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    return null;
  }

  await ensureFirebaseProjectSync();

  if (serviceWorkerRegistration) {
    await serviceWorkerRegistration.update().catch(() => {});
    return serviceWorkerRegistration;
  }

  const existing = await navigator.serviceWorker.getRegistration(SW_SCOPE);
  serviceWorkerRegistration =
    existing || (await navigator.serviceWorker.register(SW_PATH, { scope: SW_SCOPE }));

  await serviceWorkerRegistration.update().catch(() => {});
  await navigator.serviceWorker.ready;
  return serviceWorkerRegistration;
}

export async function getFirebaseMessaging() {
  if (typeof window === "undefined") return null;
  if (!isFirebaseConfigured()) return null;
  if (!(await isSupported())) return null;

  const registration = await registerFirebaseServiceWorker();
  if (!registration) return null;

  if (!messagingInstance) {
    messagingInstance = getMessaging(getFirebaseApp());
  }

  return messagingInstance;
}

export async function requestFcmToken({ prompt = true } = {}) {
  if (typeof window === "undefined") return null;
  if (!isFirebaseConfigured()) return null;
  if (!(await isSupported())) return null;

  await ensureFirebaseProjectSync();

  if (Notification.permission === "default") {
    if (!prompt) return null;
    const permission = await Notification.requestPermission();
    if (permission !== "granted") return null;
  } else if (Notification.permission !== "granted") {
    return null;
  }

  const messaging = await getFirebaseMessaging();
  const registration = await registerFirebaseServiceWorker();
  if (!messaging || !registration) return null;

  const token = await getToken(messaging, {
    vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
    serviceWorkerRegistration: registration,
  });

  if (token) storeFcmToken(token);
  return token;
}
