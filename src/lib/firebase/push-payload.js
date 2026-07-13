function getNotificationType(data = {}) {
  return (
    data.type ||
    data.notification_type ||
    data.event ||
    data.category ||
    ""
  ).toLowerCase();
}

function getOrderId(data = {}) {
  return data.order_id || data.orderId || data.contract_id || data.contractId || null;
}

export function parseFirebasePayload(payload = {}) {
  const data = payload?.data || {};
  const type = getNotificationType(data);
  const orderId = getOrderId(data);
  const title = payload?.notification?.title || data.title || "إشعار جديد";
  const body = payload?.notification?.body || data.body || "";

  const isComment =
    type.includes("comment") ||
    type === "order_comment" ||
    type === "new_comment";

  const isOrderNotification =
    type.includes("order") ||
    type.includes("notification") ||
    type === "unreceived_order" ||
    type === "new_order";

  let variant = "default";
  if (isComment) variant = "comment";
  else if (isOrderNotification) variant = "order";

  return {
    data,
    type,
    orderId,
    title,
    body,
    isComment,
    isOrderNotification,
    variant,
  };
}
