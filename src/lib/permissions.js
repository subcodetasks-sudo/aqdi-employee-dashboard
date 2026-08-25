/** Permission section keys (match API `section_key` / `permission_matrix` keys). */
export const PERMISSION_SECTIONS = {
  analytics: 'analytics',
  all_requests: 'all_requests',
  completed_request: 'completed_request',
  incomplete_request: 'incomplete_request',
  completed_whatsapp_request: 'completed_whatsapp_request',
  incomplete_whatsapp_request: 'incomplete_whatsapp_request',
  returned_request: 'returned_request',
  request_classification: 'request_classification',
  roles: 'roles',
  employees: 'employees',
  employee_salaries: 'employee_salaries',
  settings: 'settings',
};

export const PERMISSION_ACTIONS = ['view', 'create', 'edit', 'delete', 'retrieve'];

function matrixToPermissionNames(matrix) {
  if (!matrix || typeof matrix !== 'object') return [];

  return Object.entries(matrix).flatMap(([section, actions]) => {
    if (!Array.isArray(actions)) return [];
    return actions.map((action) => `${section}.${action}`);
  });
}

function extractNamesFromList(list) {
  if (!Array.isArray(list)) return [];

  return list
    .map((item) => {
      if (typeof item === 'string') return item;
      if (item?.name) return item.name;
      if (item?.section && item?.action) return `${item.section}.${item.action}`;
      return null;
    })
    .filter(Boolean);
}

/** Normalize permissions from login user or role payload into `section.action` strings. */
export function normalizeUserPermissions(user) {
  if (!user) return [];

  const collected = [
    ...extractNamesFromList(user.permissions),
    ...extractNamesFromList(user.permission_names),
    ...extractNamesFromList(user.role?.permissions),
    ...extractNamesFromList(user.role_relation?.permissions),
    ...matrixToPermissionNames(user.permission_matrix),
    ...matrixToPermissionNames(user.role?.permission_matrix),
  ];

  return [...new Set(collected)];
}

export function isSuperAdmin(user, permissions = []) {
  if (!user) return false;

  const roleName =
    user.role_relation?.name ||
    user.role?.name ||
    user.role_name ||
    user.role;

  if (roleName === 'admin' || roleName === 'مدير النظام') return true;
  if (user.is_super_admin || user.activate_all_permissions) return true;
  if (permissions.includes('*')) return true;

  return false;
}

export function hasPermission(permissions, section, action = 'view') {
  if (!section) return true;
  const key = `${section}.${action}`;
  return permissions.includes(key) || permissions.includes(`${section}.*`);
}

/** `section` may be a single section key or an array of section keys (ANY-of / OR semantics). */
export function canAccess(permissions, user, section, action = 'view') {
  if (isSuperAdmin(user, permissions)) return true;
  if (Array.isArray(section)) return section.some((s) => hasPermission(permissions, s, action));
  return hasPermission(permissions, section, action);
}

/** ANY-of section groups shared between `ROUTE_SECTION_RULES` (page-level gate) and `SIDEBAR_NAV` (link visibility). */
const ORDERS_SECTIONS = [
  PERMISSION_SECTIONS.all_requests,
  PERMISSION_SECTIONS.completed_request,
  PERMISSION_SECTIONS.incomplete_request,
  PERMISSION_SECTIONS.request_classification,
  PERMISSION_SECTIONS.completed_whatsapp_request,
  PERMISSION_SECTIONS.incomplete_whatsapp_request,
];

const REALTIME_ORDERS_SECTIONS = [
  ...ORDERS_SECTIONS,
  PERMISSION_SECTIONS.returned_request,
];

const ROLES_AND_EMPLOYEES_SECTIONS = [
  PERMISSION_SECTIONS.employees,
  PERMISSION_SECTIONS.roles,
  PERMISSION_SECTIONS.employee_salaries,
];

/**
 * Longest-prefix wins. `section: null` = any authenticated user.
 * `section` may also be an array of section keys — access is granted if the user has `view` on ANY of them
 * (used for merged pages that gate individual tabs more narrowly than the page itself).
 */
export const ROUTE_SECTION_RULES = [
  { prefix: '/home/contract-settings', section: PERMISSION_SECTIONS.settings },
  { prefix: '/home/settings', section: PERMISSION_SECTIONS.settings },
  { prefix: '/home/roles-and-employees', section: ROLES_AND_EMPLOYEES_SECTIONS },
  { prefix: '/home/return-orders', section: PERMISSION_SECTIONS.returned_request },
  { prefix: '/home/orders', section: ORDERS_SECTIONS },
  { prefix: '/home/reports', section: PERMISSION_SECTIONS.analytics },
  { prefix: '/home/users', section: PERMISSION_SECTIONS.analytics },
  { prefix: '/home/real-estates', section: PERMISSION_SECTIONS.analytics },
  { prefix: '/home/marketing-and-content', section: PERMISSION_SECTIONS.all_requests },
  { prefix: '/home/clients', section: null },
  { prefix: '/home/realtime-orders', section: REALTIME_ORDERS_SECTIONS },
  { prefix: '/home/invoices', section: null },
  { prefix: '/home', section: null },
];

export function getSectionForPath(pathname = '') {
  const path = pathname.split('?')[0];

  for (const rule of ROUTE_SECTION_RULES) {
    if (path === rule.prefix || path.startsWith(`${rule.prefix}/`)) {
      return rule.section;
    }
  }

  return null;
}

/** Stricter rules for create/edit routes (default is section `view`). */
export function getRouteActionRequirement(pathname = '') {
  const path = pathname.split('?')[0];

  if (path === '/home/roles-and-employees/roles/add') {
    return { section: PERMISSION_SECTIONS.roles, action: 'create' };
  }
  if (path.startsWith('/home/roles-and-employees/roles/edit')) {
    return { section: PERMISSION_SECTIONS.roles, action: 'edit' };
  }

  return null;
}

export function canAccessRoute(pathname, permissions, user) {
  const actionReq = getRouteActionRequirement(pathname);
  if (actionReq) {
    return canAccess(permissions, user, actionReq.section, actionReq.action);
  }

  const section = getSectionForPath(pathname);
  if (section === null) return true;
  return canAccess(permissions, user, section, 'view');
}

export const SIDEBAR_NAV = [
  {
    group: 'main',
    items: [
      { label: 'الطلبات مباشر', href: '/home/realtime-orders', section: REALTIME_ORDERS_SECTIONS, badge: 'unreceived' },
      { label: 'العملاء', href: '/home/clients', section: null },
      { label: 'طلبات الاسترجاع', href: '/home/return-orders', section: PERMISSION_SECTIONS.returned_request },
      { label: 'الموظفون والأدوار', href: '/home/roles-and-employees', section: ROLES_AND_EMPLOYEES_SECTIONS },
      { label: 'التسويق والمحتوى', href: '/home/marketing-and-content', section: PERMISSION_SECTIONS.all_requests },
      { label: 'التقارير', href: '/home/reports', section: PERMISSION_SECTIONS.analytics },
      { label: 'إعدادات النظام', href: '/home/settings', section: PERMISSION_SECTIONS.settings },
    ],
  },
  {
    group: 'secondary',
    items: [
      { label: 'جميع الطلبات', href: '/home/orders', section: ORDERS_SECTIONS },
      { label: 'الفواتير', href: '/home/invoices', section: null },
    ],
  },
];

export function getFirstAllowedHref(permissions, user) {
  for (const group of SIDEBAR_NAV) {
    for (const item of group.items) {
      if (canAccess(permissions, user, item.section, 'view')) {
        return item.href;
      }
    }
  }
  return '/home';
}

export function extractPermissionsFromRole(roleResponse) {
  const roleData = roleResponse?.data ?? roleResponse;
  if (!roleData) return [];

  const fromList = normalizeUserPermissions(roleData);
  if (fromList.length > 0) return fromList;

  return normalizeUserPermissions({
    permission_matrix: roleData.permission_matrix,
    permissions: roleData.permissions,
  });
}
