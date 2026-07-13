"use client";

import { toast } from "sonner";
import FirebasePushToast from "@/components/firebase/firebase-push-toast";
import { parseFirebasePayload } from "@/src/lib/firebase/push-payload";

export function showFirebasePushToast(payload, { onAction } = {}) {
  const parsed = parseFirebasePayload(payload);

  return toast.custom(
    (t) => (
      <FirebasePushToast
        title={parsed.title}
        body={parsed.body}
        orderId={parsed.orderId}
        variant={parsed.variant}
        onDismiss={() => toast.dismiss(t)}
        onAction={
          onAction
            ? () => {
                onAction(parsed);
                toast.dismiss(t);
              }
            : undefined
        }
      />
    ),
    {
      duration: 10000,
    }
  );
}
