"use client";

import { useFirebaseMessaging } from "@/src/hooks/use-firebase-messaging";

export default function FirebaseMessagingProvider() {
  useFirebaseMessaging();
  return null;
}
