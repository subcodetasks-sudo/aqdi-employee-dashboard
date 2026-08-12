"use client";

import AllOrdersWrapper from "@/components/Orders/AllOrdersWrapper";

export default function OrdersPage() {
  return (
    <div className="flex flex-col gap-4 min-h-full" dir="rtl">
      <AllOrdersWrapper />
    </div>
  );
}
