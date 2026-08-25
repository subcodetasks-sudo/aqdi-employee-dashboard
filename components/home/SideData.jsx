'use client'
import logo from "@/public/images/logo.svg";
import defaultUser from "@/public/images/defaultUser.jpg";
import Image from "next/image";
import { useEffect } from "react";
import { useRouter } from "next/navigation";

import { useLogout } from "@/src/hooks/useLogout";
import { usePermissions } from "@/src/hooks/usePermissions";
import { SIDEBAR_NAV } from "@/src/lib/permissions";
import {
  BarChart3,
  ClipboardList,
  Loader2,
  Menu,
  ReceiptText,
  Settings,
  TrendingUp,
  UserRound,
  Users2,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HiMiniArrowPathRoundedSquare } from "react-icons/hi2";
import { LuLogOut } from "react-icons/lu";
import { useSidebarStore } from "@/src/stores/sidebar-store";
import { useUserStore } from "@/src/stores/user-store";
import { useUnreceivedOrdersWatcher } from "@/src/hooks/use-unreceived-orders-watcher";
import NotificationList from "../notifiction/notification-list";
import CommentList from "../comment/comment-list";
import PaymentNotificationList from "../RealtimeOrders/PaymentNotificationList";
import { toast } from "sonner";

const NAV_ICONS = {
  '/home/realtime-orders': Menu,
  '/home/clients': Users2,
  '/home/return-orders': HiMiniArrowPathRoundedSquare,
  '/home/roles-and-employees': UserRound,
  '/home/marketing-and-content': TrendingUp,
  '/home/reports': BarChart3,
  '/home/settings': Settings,
  '/home/orders': ClipboardList,
  '/home/invoices': ReceiptText,
};

const DESKTOP_MEDIA = '(min-width: 1201px)';
const EXPANDED_WIDTH = 'w-64';
const COLLAPSED_WIDTH = 'w-20';

function NavLink({ item, pathname, collapsed, badgeCount }) {
  const Icon = NAV_ICONS[item.href] ?? ClipboardList;
  const isActive =
    pathname === item.href ||
    (item.href !== '/home' && pathname.startsWith(`${item.href}/`));

  return (
    <Link
      href={item.href}
      title={collapsed ? item.label : undefined}
      className={`group flex h-11 items-center rounded-xl text-sm font-medium transition-colors ${
        isActive
          ? 'bg-white/10 text-brand-accent'
          : 'text-sidebar-foreground/90 hover:bg-white/[0.06] hover:text-sidebar-foreground'
      } ${collapsed ? 'w-11 mx-auto justify-center px-0' : 'justify-between gap-2.5 px-3.5'}`}
    >
      <span className={`flex min-w-0 items-center gap-2.5 ${collapsed ? '' : 'flex-1'}`}>
        <Icon
          size={18}
          className={`size-[18px] shrink-0 ${
            isActive ? 'text-brand-accent' : 'text-brand-accent/80 group-hover:text-brand-accent'
          }`}
        />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </span>
      {!collapsed && typeof badgeCount === 'number' && (
        <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#E8923A] px-1.5 text-11 font-semibold leading-none text-white">
          {badgeCount > 99 ? '99+' : badgeCount}
        </span>
      )}
      {collapsed && typeof badgeCount === 'number' && badgeCount > 0 && (
        <span className="absolute end-1.5 top-1.5 h-2 w-2 rounded-full bg-[#E8923A]" />
      )}
    </Link>
  );
}

export default function SideData() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, logoutLoading } = useLogout();
  const { displayedPart, isSidebarOpen, setSidebarOpen } = useSidebarStore();
  const { can, isReady } = usePermissions();
  const { user } = useUserStore();
  const unreceivedTotal = useUnreceivedOrdersWatcher();

  useEffect(() => {
    const media = window.matchMedia(DESKTOP_MEDIA);
    const syncSidebarForViewport = () => {
      if (displayedPart !== "default") {
        setSidebarOpen(true);
        return;
      }
      setSidebarOpen(media.matches);
    };

    syncSidebarForViewport();
    media.addEventListener("change", syncSidebarForViewport);
    return () => media.removeEventListener("change", syncSidebarForViewport);
  }, [setSidebarOpen, displayedPart]);

  const visibleNav = SIDEBAR_NAV.map((group) => ({
    ...group,
    items: group.items.filter((item) => !isReady || can(item.section, 'view')),
  })).filter((group) => group.items.length > 0);

  const isCollapsed = displayedPart === 'default' && !isSidebarOpen;
  const panelWidth = displayedPart !== 'default' ? 'w-80' : EXPANDED_WIDTH;

  const userName = user?.name || 'مستخدم';
  const userRole = user?.role_relation?.name || user?.role?.name || '—';
  const userInitial = userName.trim().charAt(0) || 'م';

  const openProfile = () => {
    if (!user?.id) {
      toast.error('تعذر تحديد حساب المستخدم');
      return;
    }
    router.push(`/home/roles-and-employees/employees/${user.id}?view=profile`);
  };

  return (
    <>
      {isSidebarOpen && (
        <button
          type="button"
          className="fixed inset-0 z-[99] hidden bg-black/30 max-[1200px]:block"
          onClick={() => setSidebarOpen(false)}
          aria-label="إغلاق القائمة الجانبية"
        />
      )}

      <div
        id="side-data"
        className={`relative flex h-screen shrink-0 flex-col overflow-hidden border-e border-white/10 bg-gradient-to-b from-sidebar to-sidebar-dark transition-all duration-300 max-[1200px]:absolute max-[1200px]:inset-s-0 max-[1200px]:inset-y-0 max-[1200px]:z-[100] ${
          isSidebarOpen
            ? `${panelWidth} translate-x-0`
            : `${COLLAPSED_WIDTH} translate-x-0 max-[1200px]:w-0 max-[1200px]:!p-0 max-[1200px]:!overflow-hidden max-[1200px]:border-e-0 max-[1200px]:translate-x-full`
        }`}
      >
        {displayedPart === 'default' && (
          <div className={`flex h-full min-h-0 flex-col ${isCollapsed ? 'px-2 py-4' : 'px-3.5 py-5'}`}>
            <div className={`mb-4 flex items-center gap-3 ${isCollapsed ? 'justify-center' : 'px-1'}`}>
              <Link
                href="/home"
                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-accent/15 ring-1 ring-brand-accent/25"
              >
                <Image
                  src={logo}
                  alt="عقدي"
                  width={28}
                  height={36}
                  className="h-7 w-auto object-contain"
                />
              </Link>
              {!isCollapsed && (
                <div className="min-w-0">
                  <h2 className="truncate text-15 font-bold leading-tight text-sidebar-foreground">
                    لوحة الموظفين
                  </h2>
                  <p className="mt-0.5 truncate text-11 font-normal text-sidebar-foreground/55">
                    إدارة طلبات العقود
                  </p>
                </div>
              )}
            </div>

            <div className="mx-1 mb-3 h-px bg-white/10" />

            <div className="min-h-0 flex-1 overflow-y-auto no-scrollbar">
              {visibleNav.map((group, groupIndex) => (
                <div key={group.group}>
                  {groupIndex > 0 && <div className="mx-1 my-3 h-px bg-white/10" />}
                  <div className="flex flex-col gap-1">
                    {group.items.map((item) => (
                      <div key={item.href} className="relative">
                        <NavLink
                          item={item}
                          pathname={pathname}
                          collapsed={isCollapsed}
                          badgeCount={
                            item.badge === 'unreceived' ? unreceivedTotal : undefined
                          }
                        />
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            <div className={`mt-3 shrink-0 ${isCollapsed ? '' : 'px-0.5'}`}>
              {isCollapsed ? (
                <div className="flex flex-col items-center gap-2">
                  <button
                    type="button"
                    onClick={openProfile}
                    title={userName}
                    className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-xl bg-white/10 text-sm font-bold text-sidebar-foreground transition-colors hover:bg-white/[0.14] ring-1 ring-white/10"
                  >
                    {user?.profile_image ? (
                      <Image
                        src={user.profile_image}
                        alt=""
                        width={44}
                        height={44}
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      userInitial
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => logout()}
                    disabled={logoutLoading}
                    title="تسجيل الخروج"
                    className="flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-white/10 hover:text-sidebar-foreground"
                  >
                    {logoutLoading ? (
                      <Loader2 className="size-4 animate-spin" />
                    ) : (
                      <LuLogOut className="size-4" />
                    )}
                  </button>
                </div>
              ) : (
                <div className="rounded-2xl bg-white/[0.08] p-2.5 ring-1 ring-white/10">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={openProfile}
                      className="flex min-w-0 flex-1 items-center gap-2.5 text-start rounded-xl p-1 -m-1 transition-colors hover:bg-white/[0.06]"
                    >
                      <span className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-full bg-brand-accent/20 text-sm font-bold text-brand-accent ring-2 ring-brand-accent/25">
                        <Image
                          src={user?.profile_image || defaultUser}
                          alt=""
                          width={44}
                          height={44}
                          className="h-full w-full object-cover"
                        />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-13 font-semibold text-sidebar-foreground">
                          {userName}
                        </span>
                        <span className="mt-0.5 block truncate text-11 text-sidebar-foreground/55">
                          صلاحية: {userRole}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => logout()}
                      disabled={logoutLoading}
                      title="تسجيل الخروج"
                      aria-label="تسجيل الخروج"
                      className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-white/10 hover:text-sidebar-foreground disabled:opacity-60"
                    >
                      {logoutLoading ? (
                        <Loader2 className="size-4 animate-spin" />
                      ) : (
                        <LuLogOut className="size-4 shrink-0" />
                      )}
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {displayedPart === 'notification' && (
          <div className="h-full overflow-y-auto px-3.5 py-5 no-scrollbar">
            <NotificationList />
          </div>
        )}
        {displayedPart === 'comments' && (
          <div className="h-full overflow-y-auto px-3.5 py-5 no-scrollbar">
            <CommentList />
          </div>
        )}
        {displayedPart === 'payments' && (
          <div className="h-full overflow-y-auto px-3.5 py-5 no-scrollbar">
            <PaymentNotificationList />
          </div>
        )}
      </div>
    </>
  );
}
