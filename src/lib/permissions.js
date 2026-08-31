/** Permission section keys (match API `section_key` / `permission_matrix` keys). */
export const PERMISSION_SECTIONS = {
  analytics: 'analytics',
  operating_expenses: 'operating_expenses',
  finance_expenses: 'finance_expenses',
  all_requests: 'all_requests',
  completed_request: 'completed_request',
  incomplete_request: 'incomplete_request',
  completed_whatsapp_request: 'completed_whatsapp_request',
  incomplete_whatsapp_request: 'incomplete_whatsapp_request',
  returned_request: 'returned_request',
  request_classification: 'request_classification',
  roles: 'roles',
  permissions: 'permissions',
  employees: 'employees',
  employee_salaries: 'employee_salaries',
  employee_kpis: 'employee_kpis',
  users: 'users',
  notifications: 'notifications',
  payments: 'payments',
  contract_payments: 'contract_payments',
  regions: 'regions',
  cities: 'cities',
  real_estates: 'real_estates',
  property_reference: 'property_reference',
  tenant_roles: 'tenant_roles',
  contract_statuses: 'contract_statuses',
  draft_contract_statuses: 'draft_contract_statuses',
  contract_periods: 'contract_periods',
  contract_whatsapp: 'contract_whatsapp',
  instrument_settings: 'instrument_settings',
  coupons: 'coupons',
  blogs: 'blogs',
  ads: 'ads',
  faqs: 'faqs',
  paperworks: 'paperworks',
  popup_contracts: 'popup_contracts',
  instruction_sections: 'instruction_sections',
  message_alerts: 'message_alerts',
  app_content: 'app_content',
  payment_messages: 'payment_messages',
  settings: 'settings',
  sms: 'sms',
  seo_crawl: 'seo_crawl',
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

/**
 * Normalize a login/refresh/profile payload (or a role payload) into `section.action` strings.
 * `permissions` and `permission_names` are the same list from the API — prefer `permissions`,
 * fall back to `permission_names`, then derive from `permission_matrix`. Whichever source has
 * data wins outright (no merging across sources) so a fresh login/refresh always fully replaces
 * what was previously known, never adds to it.
 */
export function normalizeUserPermissions(user) {
  if (!user) return [];

  const fromPermissions = extractNamesFromList(user.permissions);
  if (fromPermissions.length > 0) return fromPermissions;

  const fromNames = extractNamesFromList(user.permission_names);
  if (fromNames.length > 0) return fromNames;

  return matrixToPermissionNames(user.permission_matrix);
}

/** `is_system_admin` from the API is the only thing allowed to grant blanket access — never role name/title. */
export function isSuperAdmin(user) {
  return user?.is_system_admin === true;
}

export function hasPermission(permissions, section, action = 'view') {
  if (!section) return true;
  const key = `${section}.${action}`;
  return permissions.includes(key) || permissions.includes(`${section}.*`);
}

/** `section` may be a single section key or an array of section keys (ANY-of / OR semantics). */
export function canAccess(permissions, user, section, action = 'view') {
  if (isSuperAdmin(user)) return true;
  if (Array.isArray(section)) return section.some((s) => hasPermission(permissions, s, action));
  return hasPermission(permissions, section, action);
}

/** True if the user has ANY of the given actions on one section (e.g. show an actions column if edit OR delete is granted). */
export function canAccessAny(permissions, user, section, actions = []) {
  return actions.some((action) => canAccess(permissions, user, section, action));
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
  PERMISSION_SECTIONS.employee_kpis,
];

/**
 * First matching rule wins, so more specific prefixes must be listed before broader ones
 * (e.g. `/home/settings/cities` before the generic `/home/settings` catch-all).
 * `section: null` = any authenticated user. `section` may also be an array of section keys —
 * access is granted if the user has `view` on ANY of them (used for merged pages that gate
 * individual tabs more narrowly than the page itself).
 */
const MARKETING_SECTIONS = [
  PERMISSION_SECTIONS.analytics,
  PERMISSION_SECTIONS.blogs,
  PERMISSION_SECTIONS.seo_crawl,
];

export const ROUTE_SECTION_RULES = [
  { prefix: '/home/settings/unit-types', section: PERMISSION_SECTIONS.property_reference },
  { prefix: '/home/settings/unit-usage', section: PERMISSION_SECTIONS.property_reference },
  { prefix: '/home/settings/property-types', section: PERMISSION_SECTIONS.property_reference },
  { prefix: '/home/settings/property-usage', section: PERMISSION_SECTIONS.property_reference },
  { prefix: '/home/settings/regions', section: PERMISSION_SECTIONS.regions },
  { prefix: '/home/settings/cities', section: PERMISSION_SECTIONS.cities },
  { prefix: '/home/settings/order-duration', section: PERMISSION_SECTIONS.contract_periods },
  { prefix: '/home/settings/message-sections', section: PERMISSION_SECTIONS.message_alerts },
  { prefix: '/home/settings/message-section-items', section: PERMISSION_SECTIONS.message_alerts },
  { prefix: '/home/settings/message-for-employee', section: PERMISSION_SECTIONS.message_alerts },
  { prefix: '/home/settings/message-for-property', section: PERMISSION_SECTIONS.message_alerts },
  { prefix: '/home/settings/customer-app-messages', section: PERMISSION_SECTIONS.app_content },
  { prefix: '/home/settings/payment-types', section: PERMISSION_SECTIONS.app_content },
  { prefix: '/home/settings/terms', section: PERMISSION_SECTIONS.app_content },
  { prefix: '/home/settings/privacy', section: PERMISSION_SECTIONS.app_content },
  { prefix: '/home/settings/coupons', section: PERMISSION_SECTIONS.coupons },
  { prefix: '/home/settings/blogs', section: PERMISSION_SECTIONS.blogs },
  { prefix: '/home/settings/faqs', section: PERMISSION_SECTIONS.faqs },
  { prefix: '/home/settings/notifications', section: PERMISSION_SECTIONS.notifications },
  { prefix: '/home/settings/payments', section: PERMISSION_SECTIONS.payments },
  { prefix: '/home/settings/tenant-roles', section: PERMISSION_SECTIONS.tenant_roles },
  { prefix: '/home/settings/paperworks', section: PERMISSION_SECTIONS.paperworks },
  { prefix: '/home/contract-settings', section: PERMISSION_SECTIONS.settings },
  { prefix: '/home/settings', section: PERMISSION_SECTIONS.settings },
  { prefix: '/home/roles-and-employees', section: ROLES_AND_EMPLOYEES_SECTIONS },
  { prefix: '/home/return-orders', section: PERMISSION_SECTIONS.returned_request },
  { prefix: '/home/orders', section: ORDERS_SECTIONS },
  { prefix: '/home/reports', section: PERMISSION_SECTIONS.analytics },
  { prefix: '/home/users', section: PERMISSION_SECTIONS.users },
  { prefix: '/home/real-estates', section: PERMISSION_SECTIONS.real_estates },
  { prefix: '/home/marketing-and-content', section: MARKETING_SECTIONS },
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
  if (path === '/home/settings/blogs/create') {
    return { section: PERMISSION_SECTIONS.blogs, action: 'create' };
  }
  if (path.startsWith('/home/settings/blogs/') && path.endsWith('/edit')) {
    return { section: PERMISSION_SECTIONS.blogs, action: 'edit' };
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
      { label: 'طلبات الاسترجاع', href: '/home/return-orders', section: PERMISSION_SECTIONS.returned_request, badge: 'returned' },
      { label: 'الموظفون والأدوار', href: '/home/roles-and-employees', section: ROLES_AND_EMPLOYEES_SECTIONS },
      { label: 'التسويق والمحتوى', href: '/home/marketing-and-content', section: MARKETING_SECTIONS },
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

  return normalizeUserPermissions(roleData);
}
