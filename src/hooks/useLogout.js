
import { useUserStore } from "../stores/user-store";
import { useRouter } from "next/navigation";
import { axiosInstance, AUTH_ENDPOINTS, cancelQueuedRefreshes } from "@/src/utils/axios";
import { getRefreshToken } from "@/src/lib/auth-session";
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
      cancelQueuedRefreshes(new Error('User logged out'));
      await axiosInstance.post(AUTH_ENDPOINTS.logout, { refresh_token: getRefreshToken() });
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

return {logout,logoutLoading};
};
