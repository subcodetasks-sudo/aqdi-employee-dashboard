/**
 * Normalize GET /admin/employees list responses.
 * Backends have shipped both `{ data: { items, pagination } }` and Laravel
 * paginator `{ data: { data: [...], current_page, last_page, ... } }` shapes.
 */
export function normalizeEmployeesListResponse(body) {
  const root = body?.data ?? body;

  let items = [];
  if (Array.isArray(root?.items)) {
    items = root.items;
  } else if (Array.isArray(root?.data?.items)) {
    items = root.data.items;
  } else if (Array.isArray(root?.data)) {
    items = root.data;
  } else if (Array.isArray(root)) {
    items = root;
  } else if (Array.isArray(body?.items)) {
    items = body.items;
  }

  const nestedPagination = root?.pagination ?? body?.pagination ?? root?.meta ?? body?.meta;
  const laravelPagination =
    root && !Array.isArray(root) && (root.last_page != null || root.current_page != null)
      ? {
          current_page: root.current_page ?? 1,
          last_page: root.last_page ?? 1,
          total: root.total ?? items.length,
          per_page: root.per_page ?? items.length,
        }
      : null;

  return {
    items,
    pagination: nestedPagination ?? laravelPagination,
  };
}
