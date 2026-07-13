"use client";

import SideData from "@/components/home/SideData";
import RoutePermissionGuard from "@/components/auth/RoutePermissionGuard";

export default function HomeLayoutShell({ children }) {
  return (
    <div className="relative flex">
      <SideData />
      <div className="h-screen min-w-0 w-full flex-1 overflow-y-auto p-[45px] transition-all duration-300 max-[1700px]:p-[30px]">
        <RoutePermissionGuard>{children}</RoutePermissionGuard>
      </div>
    </div>
  );
}
