// Every former status-specific page (draft-contracts, completed-orders, etc.) now lives
// as a `?tab=` inside `/home/orders`, so a single prefix covers all of them.
const ORDER_PATH_PATTERNS = [
  /^\/home\/orders(\/|$)/,
  /^\/home\/return-orders/,
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
