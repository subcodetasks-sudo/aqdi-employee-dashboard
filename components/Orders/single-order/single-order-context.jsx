"use client";

import { createContext, useContext, useEffect } from "react";
import { useSingleOrder } from "./use-single-order";
import { syncRelatedContractOrigin } from "./related-contract-origin-storage";

const SingleOrderContext = createContext(null);

export function SingleOrderProvider({ contractId, children }) {
  const value = useSingleOrder(contractId);

  useEffect(() => {
    if (value.orderData) {
      syncRelatedContractOrigin(value.orderData);
    }
  }, [value.orderData, contractId]);

  return (
    <SingleOrderContext.Provider value={value}>{children}</SingleOrderContext.Provider>
  );
}

export function useSingleOrderContext() {
  const ctx = useContext(SingleOrderContext);
  if (!ctx) {
    throw new Error("useSingleOrderContext must be used within SingleOrderProvider");
  }
  return ctx;
}
