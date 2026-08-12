"use client";

import SideData from "@/components/home/SideData";
import RoutePermissionGuard from "@/components/auth/RoutePermissionGuard";

export default function HomeLayoutShell({ children }) {
  return (
    <div className="relative flex bg-background dark:bg-[#0B1411]">
      <SideData />
      <div className="h-screen min-w-0 w-full flex-1 overflow-y-auto p-[45px] transition-all duration-300 max-[1700px]:p-[30px] bg-[#F4F6F5] dark:bg-[#0B1411]">
        <RoutePermissionGuard>{children}</RoutePermissionGuard>
      </div>
    </div>
  );
}
