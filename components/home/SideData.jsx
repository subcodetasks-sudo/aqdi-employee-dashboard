'use client'
import logo from "@/public/images/logo.svg";
import Image from "next/image";
import { useEffect } from "react";

import { useLogout } from "@/src/hooks/useLogout";
import { usePermissions } from "@/src/hooks/usePermissions";
import { SIDEBAR_NAV } from "@/src/lib/permissions";
import { Box, FileText, Loader2, Settings } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { BiSolidFolder, BiSolidFolderMinus } from "react-icons/bi";
import { FaEnvelopeOpen } from "react-icons/fa6";
import { HiMiniArrowPathRoundedSquare, HiUsers } from "react-icons/hi2";
import { LuLogOut } from "react-icons/lu";
import { RiMoneyDollarCircleFill, RiPentagonFill } from "react-icons/ri";
import { TbClipboardListFilled } from "react-icons/tb";
import { useSidebarStore } from "@/src/stores/sidebar-store";
import { useUnreceivedOrdersWatcher } from "@/src/hooks/use-unreceived-orders-watcher";
import NotificationList from "../notifiction/notification-list";
import CommentList from "../comment/comment-list";

const NAV_ICONS = {
  '/home/analysis': RiPentagonFill,
  '/home/orders': Box,
  '/home/draft-contracts': Box,
  '/home/contract-paid': Box,
  '/home/completed-orders': RiPentagonFill,
  '/home/incolpleted-orders-analysis/total': RiPentagonFill,
  '/home/completed-whatsapp': BiSolidFolder,
  '/home/incompleted-whatsapp': BiSolidFolderMinus,
  '/home/return-orders': HiMiniArrowPathRoundedSquare,
  '/home/sorting-orders': FaEnvelopeOpen,
  '/home/draft-contract-statuses': FaEnvelopeOpen,
  '/home/draft-completed-orders': RiPentagonFill,
  '/home/reliable-orders': RiPentagonFill,
  '/home/canceled-orders': RiPentagonFill,
  '/home/roles': TbClipboardListFilled,
  '/home/employees': HiUsers,
  '/home/salaries': RiMoneyDollarCircleFill,
  '/home/settings': Settings,
  '/home/contract-settings': FileText,
};

const DESKTOP_MEDIA = '(min-width: 1201px)';

function NavLink({ item, pathname }) {
  const Icon = NAV_ICONS[item.href] ?? RiPentagonFill;
  const isActive =
    pathname === item.href ||
    (item.href !== '/home' && pathname.startsWith(`${item.href}/`));

  return (
    <Link
      href={item.href}
      className={`${isActive ? 'active hover:bg-[var(--main-hover)] hover:text-white' : ''} bg-white h-12 rounded-[24px] text-[14px] font-normal flex items-center justify-between gap-2.5 px-5 transition-all hover:bg-[#eee] hover:scale-105 text-[#424242]`}
    >
      <span>{item.label}</span>
      <Icon size={16} className="size-4 shrink-0" />
    </Link>
  );
}

export default function SideData() {
  const pathname = usePathname();
  const { logout, logoutLoading } = useLogout();
  const { displayedPart, isSidebarOpen, setSidebarOpen, toggleSidebar } = useSidebarStore();
  const { can, isReady } = usePermissions();
  useUnreceivedOrdersWatcher();

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

  const expandedWidth =
    displayedPart !== 'default' ? 'max-[1700px]:w-[345px]' : 'max-[1700px]:w-[245px]';

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
        className={`relative h-screen shrink-0 overflow-y-auto border-e border-[#e9e9e9] bg-[#F5F5F5] p-[45px_35px] no-scrollbar transition-all duration-300 max-[1700px]:p-[30px_10px_10px] max-[1200px]:absolute max-[1200px]:inset-s-0 max-[1200px]:inset-y-0 max-[1200px]:z-[100] ${
          isSidebarOpen
            ? `w-[309px] translate-x-0 ${expandedWidth}`
            : 'w-0 !overflow-hidden border-e-0 !p-0 max-[1200px]:translate-x-full'
        }`}
      >
        {displayedPart === 'default' && (
          <>
            <div
              className="absolute top-[80px] inset-inline-end-[-30px] hidden h-[30px] w-[30px] cursor-pointer items-center justify-center rounded-s-[4px] border border-transparent bg-[#F5F5F5] transition-all hover:scale-105 hover:border-brand-main hover:bg-[#ddd] hover:text-white max-[1200px]:flex"
              onClick={toggleSidebar}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') toggleSidebar();
              }}
              aria-label={isSidebarOpen ? 'إغلاق القائمة' : 'فتح القائمة'}
            >
              <i className={`fa-solid ${isSidebarOpen ? 'fa-chevron-right' : 'fa-chevron-left'}`} />
            </div>

            <div className="mb-[25px] flex items-center gap-2.5 max-[1700px]:mb-5">
              <Link href="/home">
                <Image
                  src={logo}
                  alt="Aakdi"
                  width={52}
                  height={52}
                  className="flex h-[52px] w-[52px] items-center justify-center rounded-full border border-black/10 bg-white object-contain p-3 transition-all hover:scale-105 hover:border-brand-main hover:bg-[#ddd] hover:text-white"
                />
              </Link>
              <div>
                <h2 className="mb-[7px] text-[14px] font-semibold text-black max-[1700px]:text-[13px]">
                  عقــدي لتقنيـــات العقــاريـة
                </h2>
                <h5 className="text-[12px] font-normal text-[#686868]">داشبـــورد</h5>
              </div>
            </div>

            {visibleNav.map((group) => (
              <div key={group.group} className="mb-5 max-[1700px]:mb-2.5">
                <h3 className="mb-2.5 text-[12px] font-normal text-[#686868]">{group.group}</h3>
                <div className="flex flex-col gap-[5px]">
                  {group.items.map((item) => (
                    <NavLink key={item.href} item={item} pathname={pathname} />
                  ))}
                </div>
              </div>
            ))}

            <div className="mb-5 max-[1700px]:mb-2.5">
              <div className="flex flex-col gap-[5px]">
                <div
                  onClick={() => logout()}
                  className="flex h-12 cursor-pointer items-center justify-between gap-2.5 rounded-[24px] bg-white px-5 text-[14px] font-normal text-[#424242] transition-all hover:scale-105 hover:bg-[#eee]"
                >
                  <span>تسجيل الخـــروج</span>
                  {logoutLoading ? <Loader2 className="animate-spin" /> : <LuLogOut />}
                </div>
              </div>
            </div>
          </>
        )}

        {displayedPart === 'notification' && <NotificationList />}
        {displayedPart === 'comments' && <CommentList />}
      </div>
    </>
  );
}
