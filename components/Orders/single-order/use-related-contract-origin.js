"use client";

import { useEffect, useState } from "react";
import {
  getRelatedContractOriginId,
  syncRelatedContractOrigin,
} from "./related-contract-origin-storage";

export function useRelatedContractOrigin(orderData) {
  const currentContractId =
    orderData?.id ?? orderData?.contract_summary?.id ?? null;

  const [originContractId, setOriginContractId] = useState(() =>
    getRelatedContractOriginId()
  );

  useEffect(() => {
    if (!orderData || !currentContractId) return;
    const originId = syncRelatedContractOrigin(orderData);
    setOriginContractId(originId);
  }, [orderData, currentContractId]);

  return originContractId;
}
