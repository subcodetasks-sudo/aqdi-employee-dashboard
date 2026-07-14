const ORDER_PATH_PATTERNS = [
  /^\/home\/orders(\/|$)/,
  /^\/home\/draft-contracts/,
  /^\/home\/contract-paid/,
  /^\/home\/completed-orders/,
  /^\/home\/return-orders/,
  /^\/home\/completed-whatsapp/,
  /^\/home\/incompleted-whatsapp/,
  /^\/home\/draft-contract-statuses/,
  /^\/home\/sorting-orders/,
  /^\/home\/draft-completed-orders/,
  /^\/home\/received-orders/,
  /^\/home\/reliable-orders/,
  /^\/home\/canceled-orders/,
  /^\/home\/orders-analysis/,
  /^\/home\/incolpleted-orders-analysis/,
];

export function isOrdersRelatedPath(pathname) {
  if (!pathname) return false;
  return ORDER_PATH_PATTERNS.some((pattern) => pattern.test(pathname));
}

/** جميع الطلبات list only — not `/home/orders/[id]` or other order pages. */
export function isAllOrdersListPath(pathname) {
  if (!pathname) return false;
  return /^\/home\/orders\/?$/.test(pathname);
}
