"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { clearRelatedContractOrigin } from "@/components/Orders/single-order/related-contract-origin-storage";

const SINGLE_ORDER_PAGE = /^\/home\/orders\/[^/]+$/;

export default function OrdersLayout({ children }) {
  const pathname = usePathname();
  const wasOnSingleOrderPage = useRef(false);

  useEffect(() => {
    const isSingleOrderPage = SINGLE_ORDER_PAGE.test(pathname);

    if (wasOnSingleOrderPage.current && !isSingleOrderPage) {
      clearRelatedContractOrigin();
    }

    wasOnSingleOrderPage.current = isSingleOrderPage;
  }, [pathname]);

  useEffect(() => () => clearRelatedContractOrigin(), []);

  return children;
}
