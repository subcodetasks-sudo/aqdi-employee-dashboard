'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { RefreshCw, Search, Loader2, FileSpreadsheet, PanelLeft } from 'lucide-react';
import { LuLogOut } from 'react-icons/lu';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import mainPagesHeaderIcon from '@/public/images/mainPagesHeaderIcon.svg';
import notificationIcon from '@/public/images/notificationIcon.svg';
import messageIcon from '@/public/images/messegeIcon.svg';
import defaultUser from '@/public/images/defaultUser.jpg';
import { useSidebarStore } from '@/src/stores/sidebar-store';
import { useUserStore } from '@/src/stores/user-store';
import { useLogout } from '@/src/hooks/useLogout';
import { usePermissions } from '@/src/hooks/usePermissions';
import { PERMISSION_SECTIONS } from '@/src/lib/permissions';
import { toast } from 'sonner';

export default function SubPageHeader({
  title,
  isMain = false,
  first,
  firstURL,
  second,
  secondURL,
  third,
  thirdURL,
  searchQuery = '',
  onSearchChange,
  searchPlaceholder = 'البحث الذكي...!',
  onRefresh,
  refreshTitle = 'تحديث',
  onExport,
  isExporting = false,
  exportLabel = 'تصدير Excel',
}) {
  const router = useRouter();
  const { user } = useUserStore();
  const { setDisplayedPart, displayedPart, isSidebarOpen, toggleSidebar, setSidebarOpen } =
    useSidebarStore();
  const { logout, logoutLoading } = useLogout();
  const { can } = usePermissions();

  const redirectToEmployeePage = (view) => {
    if (!user?.id) {
      toast.error('تعذر تحديد حساب المستخدم');
      return;
    }
    const url = view
      ? `/home/roles-and-employees/employees/${user.id}?view=${view}`
      : `/home/roles-and-employees/employees/${user.id}`;
    router.push(url);
  };

  const toggleNotification = () => {
    if (displayedPart === 'notification') {
      setDisplayedPart('default');
    } else {
      setSidebarOpen(true);
      setDisplayedPart('notification');
    }
  };

  return (
    <div
      className={`mb-7 transition-all duration-300 ${isSidebarOpen ? 'max-w-[calc(100vw-256px)] max-[1200px]:max-w-[calc(100vw-60px)]' : 'max-w-[calc(100vw-80px)] max-[1200px]:max-w-full'}`}
      dir="rtl"
    >
      <div className="flex items-center gap-3 w-full">
        <div className="flex items-center gap-2.5 shrink-0 min-w-0">
          {!isMain && (
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={isSidebarOpen ? 'طي القائمة الجانبية' : 'توسيع القائمة الجانبية'}
              aria-expanded={isSidebarOpen}
              className="w-[52px] h-[52px] rounded-full bg-sidebar text-sidebar-foreground transition-all duration-300 flex items-center justify-center hover:bg-sidebar-hover hover:scale-105 shrink-0"
            >
              <PanelLeft className="size-5" />
            </button>
          )}
          {isMain ? (
            <button
              type="button"
              onClick={toggleSidebar}
              aria-label={isSidebarOpen ? 'إغلاق القائمة الجانبية' : 'فتح القائمة الجانبية'}
              aria-expanded={isSidebarOpen}
              className="w-[52px] h-[52px] rounded-full bg-brand-hover transition-all duration-300 flex items-center justify-center hover:bg-brand-main hover:scale-105 shrink-0"
            >
              <Image src={mainPagesHeaderIcon} alt="" className="w-4 h-auto object-contain" />
            </button>
          ) : (
            <button
              type="button"
              className="w-[52px] h-[52px] rounded-full bg-surface-muted transition-all duration-300 flex items-center justify-center hover:bg-surface-muted-hover hover:scale-105 shrink-0"
              onClick={() => router.back()}
              aria-label="رجوع"
            >
              <i className="fa-solid fa-arrow-right" />
            </button>
          )}

          <div className="min-w-0 max-[992px]:hidden">
            {title ? (
              <h2 className="text-lg font-bold text-black mb-1.5 whitespace-nowrap">{title}</h2>
            ) : null}
            <div className="flex items-center gap-2.5 flex-wrap">
              {first ? (
                <Link
                  href={firstURL}
                  className="text-[14px] text-ink-body transition-all hover:text-brand-main whitespace-nowrap"
                >
                  {first}
                </Link>
              ) : null}
              {second ? (
                <>
                  <i className="fa-solid fa-chevron-left text-[14px] text-ink-body" />
                  <Link
                    href={secondURL}
                    className="text-[14px] text-ink-body transition-all hover:text-brand-main whitespace-nowrap"
                  >
                    {second}
                  </Link>
                </>
              ) : null}
              {third ? (
                <>
                  <i className="fa-solid fa-chevron-left text-[14px] text-ink-body" />
                  <Link
                    href={thirdURL}
                    className="text-[14px] text-ink-body transition-all hover:text-brand-main whitespace-nowrap"
                  >
                    {third}
                  </Link>
                </>
              ) : null}
            </div>
          </div>
        </div>

        <div className="relative flex-1 min-w-[140px]">
          <Search className="absolute right-4 top-1/2 -translate-y-1/2 text-ink-placeholder size-5 pointer-events-none" />
          <input
            type="text"
            placeholder={searchPlaceholder}
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            className="w-full h-[46px] bg-surface-input border border-surface-border rounded-full pr-12 pl-4 text-[14px] focus:outline-none focus:border-brand-main focus:bg-white transition-all shadow-inner"
          />
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          {onExport ? (
            <button
              type="button"
              onClick={onExport}
              disabled={isExporting}
              className="h-[46px] px-5 rounded-full border border-brand-accent bg-white text-brand-accent hover:bg-brand-accent hover:text-white font-bold text-[14px] transition-all flex items-center gap-2 shrink-0 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-white disabled:hover:text-brand-accent max-[768px]:px-3"
              title={exportLabel}
            >
              {isExporting ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <FileSpreadsheet className="size-4" />
              )}
              <span className="max-[768px]:hidden">
                {isExporting ? 'جاري التصدير...' : exportLabel}
              </span>
            </button>
          ) : null}

          {onRefresh ? (
            <button
              type="button"
              onClick={onRefresh}
              className="w-[46px] h-[46px] flex items-center justify-center rounded-full border border-surface-border bg-brand-accent text-white hover:bg-brand-accent-hover transition-all shadow-sm shrink-0"
              title={refreshTitle}
              aria-label={refreshTitle}
            >
              <RefreshCw className="size-5" />
            </button>
          ) : null}

          <button
            type="button"
            className="w-[52px] h-[52px] rounded-full bg-surface-muted transition-all duration-300 flex items-center justify-center hover:bg-surface-muted-hover hover:scale-105 shrink-0"
            aria-label="الرسائل"
          >
            <Image src={messageIcon} alt="" className="w-[20px] h-auto object-contain" />
          </button>

          <button
            type="button"
            onClick={toggleNotification}
            className={`${displayedPart === 'notification' ? 'bg-brand-main' : 'bg-surface-muted'} w-[52px] h-[52px] rounded-full transition-all duration-300 flex items-center justify-center hover:bg-surface-muted-hover hover:scale-105 shrink-0`}
            aria-label="الإشعارات"
          >
            <Image src={notificationIcon} alt="" className="w-[20px] h-auto object-contain" />
          </button>

          <div className="h-[52px] bg-surface-muted rounded-[26px] flex items-center gap-2.5 p-[6px_10px] transition-all duration-300 hover:bg-surface-muted-hover hover:scale-105 max-[992px]:w-[52px] max-[992px]:p-0 justify-center shrink-0">
            <Image
              src={user?.profile_image || defaultUser}
              alt=""
              width={39}
              height={39}
              className="w-[39px] h-[39px] object-cover rounded-full overflow-hidden max-[992px]:w-full max-[992px]:h-full"
            />
            <div className="max-[992px]:hidden">
              <h3 className="text-[12px] font-medium text-black">{user?.name}</h3>
              <span className="text-[10px] font-normal text-ink-subtle">
                {user?.role_relation?.name}
              </span>
            </div>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                className="w-[52px] h-[52px] rounded-full !bg-black !text-white border-none shadow-none hover:!bg-ink-body transition-all duration-300 flex items-center justify-center hover:scale-105 shrink-0"
              >
                <i className="fa-solid fa-chevron-down" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56 text-right" align="start" dir="rtl">
              <DropdownMenuLabel>حسابي</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem onClick={() => redirectToEmployeePage('profile')}>
                  الملف الشخصي
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => redirectToEmployeePage()}>
                  الفوترة
                </DropdownMenuItem>
                {can(PERMISSION_SECTIONS.settings, 'view') && (
                  <DropdownMenuItem onClick={() => router.push('/home/settings')}>
                    الإعدادات
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onSelect={(e) => {
                  e.preventDefault();
                  if (!logoutLoading) logout();
                }}
                disabled={logoutLoading}
                className="text-red-600 focus:text-red-600 cursor-pointer"
              >
                <span className="flex items-center justify-between w-full gap-2">
                  <span>تسجيل الخـــروج</span>
                  {logoutLoading ? (
                    <Loader2 className="size-4 animate-spin shrink-0" />
                  ) : (
                    <LuLogOut className="size-4 shrink-0" />
                  )}
                </span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
