"use client";

import { useState } from "react";
import { openDialogAfterMenuClose } from "@/src/lib/open-dialog-after-menu-close";
import { statusRequiresExtraFields } from "@/components/realtime-orders/change-order-status-fields-dialog";

export function normalizeOrderMenuStatus(status) {
  return {
    id: status.id,
    name: status.name ?? status.label,
    label: status.label ?? status.name,
    color: status.color,
    status_case: status.status_case ?? null,
  };
}

/**
 * Shared confirm gate before applying an order status change.
 * Return-status flows should be handled by the caller before calling requestConfirm.
 */
export function useConfirmOrderStatusChange({
  onDirectChange,
  onNeedsFields,
} = {}) {
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [pendingConfirm, setPendingConfirm] = useState(null);

  const clearConfirm = () => {
    setConfirmOpen(false);
    setPendingConfirm(null);
  };

  const requestConfirm = ({ orderId, order, status, orderLabel }) => {
    const menuStatus = normalizeOrderMenuStatus(status);
    setPendingConfirm({
      orderId: orderId ?? order?.id,
      order: order ?? null,
      status: menuStatus,
      orderLabel:
        orderLabel ??
        order?.uuid ??
        order?.order_number ??
        orderId ??
        order?.id ??
        null,
      requiresFields: statusRequiresExtraFields(menuStatus),
    });
    openDialogAfterMenuClose(() => setConfirmOpen(true));
  };

  const handleConfirmOpenChange = (next) => {
    setConfirmOpen(next);
    if (!next) setPendingConfirm(null);
  };

  const confirmStatusChange = () => {
    if (!pendingConfirm) return;

    if (pendingConfirm.requiresFields) {
      onNeedsFields?.(pendingConfirm);
      clearConfirm();
      return;
    }

    onDirectChange?.(pendingConfirm);
  };

  return {
    confirmOpen,
    pendingConfirm,
    requestConfirm,
    confirmStatusChange,
    clearConfirm,
    handleConfirmOpenChange,
  };
}
