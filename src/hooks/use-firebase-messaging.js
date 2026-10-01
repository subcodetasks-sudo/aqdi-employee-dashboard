"use client";

import { useCallback, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { onMessage } from "firebase/messaging";
import { useUserStore } from "@/src/stores/user-store";
import { axiosInstance, AUTH_ENDPOINTS } from "@/src/utils/axios";
import { useSidebarStore } from "@/src/stores/sidebar-store";
import { isFirebaseConfigured } from "@/src/lib/firebase/config";
import {
  getFirebaseMessaging,
  requestFcmToken,
} from "@/src/lib/firebase/messaging";
import { handleFirebasePushPayload } from "@/src/lib/firebase/notification-handler";

const FCM_CHANNEL_NAME = "aqdi-fcm";

export function useFirebaseMessaging() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const isAuthenticated = useUserStore((state) => state.isAuthenticated);
  const hasHydrated = useUserStore((state) => state._hasHydrated);
  const unsubscribeRef = useRef(() => {});

  const handlePayload = useCallback(
    (payload) => {
      if (!payload) return;

      handleFirebasePushPayload(payload, {
        queryClient,
        sidebarStore: useSidebarStore.getState(),
        router,
      });
    },
    [queryClient, router]
  );

  useEffect(() => {
    if (!hasHydrated || !isAuthenticated || !isFirebaseConfigured()) return;

    let cancelled = false;
    let broadcastChannel = null;

    const setupMessaging = async () => {
      try {
        const fcmToken = await requestFcmToken();
        if (cancelled) return;

        if (!fcmToken) {
          console.warn("[firebase] Notification permission denied or token unavailable");
          return;
        }

        void axiosInstance
          .post(AUTH_ENDPOINTS.fcm, { fcm_token: fcmToken })
          .catch((error) => {
            console.warn("[firebase] Failed to register FCM token:", error);
          });

        const messaging = await getFirebaseMessaging();
        if (!messaging || cancelled) return;

        unsubscribeRef.current();
        unsubscribeRef.current = onMessage(messaging, (payload) => {
          handlePayload(payload);
        });
      } catch (error) {
        console.warn("[firebase] Messaging setup failed:", error);
      }
    };

    const handleServiceWorkerMessage = (event) => {
      if (event.data?.type === "FCM_PUSH") {
        handlePayload(event.data.payload);
        return;
      }

      if (event.data?.type === "FCM_NOTIFICATION_CLICK") {
        handlePayload({ data: event.data.data, notification: {} });

        if (event.data.targetUrl) {
          router.push(event.data.targetUrl);
        }
      }
    };

    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.addEventListener("message", handleServiceWorkerMessage);
    }

    if ("BroadcastChannel" in window) {
      broadcastChannel = new BroadcastChannel(FCM_CHANNEL_NAME);
      broadcastChannel.onmessage = (event) => {
        handlePayload(event.data);
      };
    }

    void setupMessaging();

    return () => {
      cancelled = true;
      unsubscribeRef.current();
      unsubscribeRef.current = () => {};

      if ("serviceWorker" in navigator) {
        navigator.serviceWorker.removeEventListener("message", handleServiceWorkerMessage);
      }

      broadcastChannel?.close();
    };
  }, [hasHydrated, isAuthenticated, handlePayload, router]);

  useEffect(() => {
    if (hasHydrated && !isAuthenticated) {
      unsubscribeRef.current();
      unsubscribeRef.current = () => {};
    }
  }, [hasHydrated, isAuthenticated]);
}
