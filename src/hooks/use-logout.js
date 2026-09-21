import { useUserStore } from "../stores/user-store";
import { useRouter } from "next/navigation";
import { axiosInstance, AUTH_ENDPOINTS, cancelQueuedRefreshes } from "@/src/utils/axios";
import { getRefreshToken } from "@/src/lib/auth-session";
import { disconnectFcmToken, getStoredFcmToken } from "@/src/lib/firebase/messaging";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useLogout = () => {
  const { logout: clearStore } = useUserStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate: logout, isPending: logoutLoading } = useMutation({
    mutationFn: async () => {
      // Unblock anything queued behind an in-flight silent refresh before we
      // tear the session down out from under it.
      cancelQueuedRefreshes(new Error("User logged out"));

      const fcmToken = getStoredFcmToken();
      const payload = { refresh_token: getRefreshToken() };
      if (fcmToken) {
        payload.fcm_token = fcmToken;
      }

      try {
        await axiosInstance.post(AUTH_ENDPOINTS.logout, payload);
      } finally {
        // Always drop the local FCM registration so the notification icon /
        // service worker stop receiving pushes for this session.
        await disconnectFcmToken();
      }
    },
    onMutate: () => {
      toast.loading("جاري تسجيل الخروج...");
    },
    onSuccess: async () => {
      await clearStore();
      queryClient.clear();
      toast.dismiss();
      toast.success("تم تسجيل الخروج بنجاح");
      router.push("/login");
    },
    onError: async (error) => {
      await clearStore();
      queryClient.clear();
      toast.dismiss();
      toast.error(error.response?.data?.message || "حدث خطأ أثناء تسجيل الخروج");
      router.push("/login");
    },
  });

  return { logout, logoutLoading };
};
