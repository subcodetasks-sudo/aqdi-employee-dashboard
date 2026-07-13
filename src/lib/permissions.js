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

export function canAccess(permissions, user, section, action = 'view') {
  if (isSuperAdmin(user, permissions)) return true;
  return hasPermission(permissions, section, action);
}

/** Longest-prefix wins. `section: null` = any authenticated user. */
export const ROUTE_SECTION_RULES = [
  { prefix: '/home/contract-settings', section: PERMISSION_SECTIONS.settings },
  { prefix: '/home/settings', section: PERMISSION_SECTIONS.settings },
  { prefix: '/home/salaries', section: PERMISSION_SECTIONS.employee_salaries },
  { prefix: '/home/employees', section: PERMISSION_SECTIONS.employees },
  { prefix: '/home/roles', section: PERMISSION_SECTIONS.roles },
  { prefix: '/home/sorting-orders', section: PERMISSION_SECTIONS.request_classification },
  { prefix: '/home/draft-contract-statuses', section: PERMISSION_SECTIONS.request_classification },
  { prefix: '/home/draft-completed-orders', section: PERMISSION_SECTIONS.request_classification },
  { prefix: '/home/reliable-orders', section: PERMISSION_SECTIONS.request_classification },
  { prefix: '/home/canceled-orders', section: PERMISSION_SECTIONS.request_classification },
  { prefix: '/home/return-orders', section: PERMISSION_SECTIONS.returned_request },
  { prefix: '/home/incompleted-whatsapp', section: PERMISSION_SECTIONS.incomplete_whatsapp_request },
  { prefix: '/home/completed-whatsapp', section: PERMISSION_SECTIONS.completed_whatsapp_request },
  { prefix: '/home/incolpleted-orders-analysis', section: PERMISSION_SECTIONS.incomplete_request },
  { prefix: '/home/completed-orders', section: PERMISSION_SECTIONS.completed_request },
  { prefix: '/home/received-orders', section: PERMISSION_SECTIONS.completed_request },
  { prefix: '/home/draft-contracts', section: PERMISSION_SECTIONS.all_requests },
  { prefix: '/home/contract-paid', section: PERMISSION_SECTIONS.all_requests },
  { prefix: '/home/orders', section: PERMISSION_SECTIONS.all_requests },
  {
    prefix: '/home/analysis',
    section: PERMISSION_SECTIONS.analytics,
  },
  { prefix: '/home/staff-analysis', section: PERMISSION_SECTIONS.analytics },
  { prefix: '/home/financial-analysis', section: PERMISSION_SECTIONS.analytics },
  { prefix: '/home/expense-analysis', section: PERMISSION_SECTIONS.analytics },
  { prefix: '/home/Properties-analysis', section: PERMISSION_SECTIONS.analytics },
  { prefix: '/home/Units-analysis', section: PERMISSION_SECTIONS.analytics },
  { prefix: '/home/user-analysis', section: PERMISSION_SECTIONS.analytics },
  { prefix: '/home/users', section: PERMISSION_SECTIONS.analytics },
  { prefix: '/home/orders-analysis', section: PERMISSION_SECTIONS.analytics },
  { prefix: '/home/return-analysis', section: PERMISSION_SECTIONS.analytics },
  { prefix: '/home/real-estates', section: PERMISSION_SECTIONS.analytics },
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

  if (path === '/home/roles/add') {
    return { section: PERMISSION_SECTIONS.roles, action: 'create' };
  }
  if (path.startsWith('/home/roles/edit')) {
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
    group: 'الرئيســية',
    items: [
      { label: 'التحليــلات', href: '/home/analysis', section: PERMISSION_SECTIONS.analytics },
    ],
  },
  {
    group: 'العقــود',
    items: [
      { label: 'جميع الطلبات', href: '/home/orders', section: PERMISSION_SECTIONS.all_requests },
      { label: 'مسودة العقود', href: '/home/draft-contracts', section: PERMISSION_SECTIONS.all_requests },
      { label: 'إنشاء عقد مدفوع', href: '/home/contract-paid', section: PERMISSION_SECTIONS.all_requests },
      { label: 'طلـب مكتمـــل', href: '/home/completed-orders', section: PERMISSION_SECTIONS.completed_request },
      { label: 'طلـب مسوده و مكتمــل', href: '/home/draft-completed-orders', section: PERMISSION_SECTIONS.completed_request },
      { label: 'طلـب مستلم من العميل', href: '/home/received-orders', section: PERMISSION_SECTIONS.completed_request },
      {
        label: 'طلـب غيــر مكتمل',
        href: '/home/incolpleted-orders-analysis/total',
        section: PERMISSION_SECTIONS.incomplete_request,
      },
      { label: 'طلـب مستــرجع', href: '/home/return-orders', section: PERMISSION_SECTIONS.returned_request },

      {
        label: 'طلب موثق ',
        href: '/home/reliable-orders',
        section: PERMISSION_SECTIONS.request_classification,
      },
      {
        label: 'طلب ملغي ',
        href: '/home/canceled-orders',
        section: PERMISSION_SECTIONS.request_classification,
      },
      {
        label: 'تصنيف مسودة العقود',
        href: '/home/draft-contract-statuses',
        section: PERMISSION_SECTIONS.request_classification,
      },
      {
        label: 'تصنيــف الطلبـــــات',
        href: '/home/sorting-orders',
        section: PERMISSION_SECTIONS.request_classification,
      },
    ],
  },

  {
    group: 'الموظفيــن والأدوار',
    items: [
      { label: 'الأدوار', href: '/home/roles', section: PERMISSION_SECTIONS.roles },
      { label: 'الموظفيــن', href: '/home/employees', section: PERMISSION_SECTIONS.employees },
      {
        label: 'رواتــب الموظفيــن',
        href: '/home/salaries',
        section: PERMISSION_SECTIONS.employee_salaries,
      },
    ],
  },

  {
    group: 'إعــدادت النظام',
    items: [
      { label: 'الاعــدادات', href: '/home/settings', section: PERMISSION_SECTIONS.settings },
      { label: 'اعــدادات العقــود', href: '/home/contract-settings', section: PERMISSION_SECTIONS.settings },
    ],
  },
  {
    group: 'المحتوي ',
    items: [
      { label: 'الصفحه الرئيسيه', href: '/home/content/home', section: PERMISSION_SECTIONS.all_requests },
      { label: 'صفحة من نحن ', href: '/home/content/about', section: PERMISSION_SECTIONS.all_requests },
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

/** Attach permission names to login user from role when missing. */
export async function enrichUserWithRolePermissions(userData, fetchRole) {
  if (!userData) return userData;

  let permissions = normalizeUserPermissions(userData);
  if (permissions.length === 0 && userData.role_id && fetchRole) {
    try {
      const roleResponse = await fetchRole(userData.role_id);
      permissions = extractPermissionsFromRole(roleResponse);
    } catch {
      // keep empty; hook may retry
    }
  }

  if (permissions.length === 0) return userData;

  return { ...userData, permissions };
}
