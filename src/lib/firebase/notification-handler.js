import { parseFirebasePayload } from "@/src/lib/firebase/push-payload";
import { shouldHandlePushPayload } from "@/src/lib/firebase/push-dedupe";
import { showFirebasePushToast } from "@/src/lib/firebase/show-firebase-push-toast";

function runNotificationSideEffects(parsed, { queryClient, sidebarStore, router } = {}, { navigate = false } = {}) {
  if (!queryClient || !sidebarStore) return;

  const { isComment, isOrderNotification, orderId } = parsed;

  if (isComment) {
    if (orderId) {
      sidebarStore.setOrderId(String(orderId));
      queryClient.invalidateQueries({
        queryKey: ["orderComments", String(orderId)],
      });
    }

    sidebarStore.setSidebarOpen(true);
    sidebarStore.setDisplayedPart("comments");

    if (navigate && orderId && router) {
      router.push(`/home/orders/${orderId}`);
    }
    return;
  }

  if (isOrderNotification) {
    queryClient.invalidateQueries({ queryKey: ["unReceivedOrders"] });
    queryClient.invalidateQueries({ queryKey: ["unReceivedOrdersTotal"] });
    sidebarStore.setSidebarOpen(true);
    sidebarStore.setDisplayedPart("notification");

    if (navigate && orderId && router) {
      router.push(`/home/orders/${orderId}`);
    }
  }
}

export function handleFirebasePushPayload(payload, deps = {}) {
  if (!shouldHandlePushPayload(payload)) return;

  const parsed = parseFirebasePayload(payload);

  showFirebasePushToast(payload, {
    onAction: () => runNotificationSideEffects(parsed, deps, { navigate: true }),
  });

  runNotificationSideEffects(parsed, deps, { navigate: false });
}
