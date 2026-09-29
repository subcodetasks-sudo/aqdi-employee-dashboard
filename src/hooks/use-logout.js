import { useUserStore } from "../stores/user-store";
import { useRouter } from "next/navigation";
import { axiosInstance, AUTH_ENDPOINTS } from "@/src/utils/axios";
import { disconnectFcmToken, getStoredFcmToken } from "@/src/lib/firebase/messaging";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

export const useLogout = () => {
  const { logout: clearStore } = useUserStore();
  const router = useRouter();
  const queryClient = useQueryClient();

  const { mutate: logout, isPending: logoutLoading } = useMutation({
    mutationFn: async () => {
      const fcmToken = getStoredFcmToken();
      const payload = {};
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
      const status = error.response?.status;
      if (status !== 401) {
        toast.error(error.response?.data?.message || "حدث خطأ أثناء تسجيل الخروج");
      } else {
        toast.success("تم تسجيل الخروج بنجاح");
      }
      router.push("/login");
    },
  });

  return { logout, logoutLoading };
};
