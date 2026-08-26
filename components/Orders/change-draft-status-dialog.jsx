"use client";

import React, { useState } from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { axiosInstance } from "@/src/utils/axios";
import { Loader2, Plus, TrashIcon } from "lucide-react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DRAFT_CONTRACT_STATUSES_API,
  emptyDraftStatusForm,
  extractDraftStatusItems,
} from "@/src/lib/draft-contract-statuses";
import {
  invalidateDraftOrdersCaches,
  invalidateOrdersCaches,
} from "@/src/lib/invalidate-orders-caches";
import PermissionGate from "@/components/auth/PermissionGate";
import { PERMISSION_SECTIONS } from "@/src/lib/permissions";

export default function ChangeDraftStatusDialog({ orderId, queryKey }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCategory, setNewCategory] = useState(emptyDraftStatusForm);
  const queryClient = useQueryClient();

  const { data: statusData } = useQuery({
    queryKey: ["draft-contract-statuses-active"],
    queryFn: () => axiosInstance(`${DRAFT_CONTRACT_STATUSES_API}/active`),
  });

  const statusItems = extractDraftStatusItems(statusData);

  const invalidateRelated = ({ includeStatusDefinitions = false } = {}) => {
    invalidateDraftOrdersCaches(queryClient, {
      queryKey,
      orderId,
      includeStatusDefinitions,
    });
  };

  const { mutate: changeStatusMutate, isPending: changeStatusPending } = useMutation({
    mutationFn: (statusId) =>
      axiosInstance.post(`/admin/orders/${orderId}/draft-contract-status`, {
        draft_contract_status_id: statusId,
      }),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم تغيير حالة المسودة");
      invalidateRelated();
    },
    onError: (res) => {
      toast.error(res?.response?.data?.message || "حدث خطأ أثناء تغيير حالة المسودة");
    },
  });

  const { mutate: addStatusMutate, isPending: addStatusPending } = useMutation({
    mutationFn: () => axiosInstance.post(DRAFT_CONTRACT_STATUSES_API, newCategory),
    onSuccess: (res) => {
      setIsAddModalOpen(false);
      setNewCategory(emptyDraftStatusForm);
      invalidateRelated({ includeStatusDefinitions: true });
      changeStatusMutate(res?.data?.data?.id);
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء إضافة الحالة");
    },
  });

  const { mutate: deleteOrder, isPending: isDeleting } = useMutation({
    mutationFn: () => axiosInstance.post(`/admin/orders/${orderId}/delete`),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم حذف الطلب بنجاح");
      invalidateRelated();
      invalidateOrdersCaches(queryClient, { queryKey, orderId });
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء حذف الطلب");
    },
  });

  return (
    <>
      <DropdownMenu dir="rtl">
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            onClick={(e) => e.stopPropagation()}
            className="w-8 h-8 rounded-full flex items-center justify-center bg-neutral-100 text-ink-subtle hover:bg-brand-main hover:text-white transition-all"
            aria-label="إجراءات الطلب"
          >
            <i className="fa-solid fa-ellipsis-vertical text-sm" />
          </button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          className="w-64 rounded-2xl shadow-lg border-surface-border p-2"
          onClick={(e) => e.stopPropagation()}
        >
          <DropdownMenuLabel>تغيير حالة المسودة</DropdownMenuLabel>
          <DropdownMenuSeparator className="bg-neutral-100 my-1" />

          {statusItems.map((item) => (
            <div key={item?.id}>
              <DropdownMenuItem
                onClick={() => changeStatusMutate(item?.id)}
                disabled={changeStatusPending}
                className="cursor-pointer hover:bg-surface-input rounded-lg p-2"
              >
                <span className="font-medium text-13">{item?.name}</span>
                {changeStatusPending ? (
                  <Loader2 className="animate-spin" />
                ) : (
                  <i className="fa-solid fa-chevron-left mr-auto text-ink-placeholder text-10" />
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator className="bg-neutral-100 my-1" />
            </div>
          ))}

          <PermissionGate section={PERMISSION_SECTIONS.draft_contract_statuses} action="create">
            <DropdownMenuItem
              onClick={() => setIsAddModalOpen(true)}
              className="cursor-pointer hover:bg-surface-input rounded-lg p-2"
            >
              <Plus />
              <span className="font-medium text-13">أخـرى</span>
              <i className="fa-solid fa-chevron-left mr-auto text-ink-placeholder text-10" />
            </DropdownMenuItem>
          </PermissionGate>
          <DropdownMenuSeparator className="bg-neutral-100 my-1" />

          <DropdownMenuItem
            className="cursor-pointer hover:bg-[#FFF5F5] text-red-600 rounded-lg p-2"
            disabled={isDeleting}
            onClick={(e) => {
              e.stopPropagation();
              deleteOrder();
            }}
          >
            <TrashIcon className="text-red-600" />
            <span className="font-medium text-13 text-red-600">حذف الطلـب</span>
            {isDeleting ? (
              <Loader2 className="animate-spin mr-auto size-4" />
            ) : (
              <i className="fa-solid fa-chevron-left mr-auto text-red-300 text-10" />
            )}
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-8 rounded-32 border-0" dir="rtl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-22 font-black text-black border-b border-neutral-100 pb-4">
              إضافة حالة مسودة
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <label className="text-13 font-bold text-black px-1">
                اسم الحالة <span className="text-status-danger mr-1">*</span>
              </label>
              <input
                type="text"
                placeholder="ادخل اسم الحالة هنــا ..."
                value={newCategory.name}
                onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full h-13.5 bg-surface-input border border-surface-border rounded-2xl px-5 text-15 focus:outline-none focus:border-brand-main focus:bg-white transition-all font-medium text-right"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-13 font-bold text-black px-1">
                وصف الحالة
              </label>
              <textarea
                placeholder="ادخل وصف الحالة هنا ..."
                value={newCategory.description ?? ""}
                onChange={(e) =>
                  setNewCategory((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
                className="w-full min-h-[96px] bg-surface-input border border-surface-border rounded-2xl px-5 py-3 text-15 focus:outline-none focus:border-brand-main focus:bg-white transition-all font-medium text-right resize-none"
              />
            </div>

            <button
              type="button"
              onClick={() => addStatusMutate()}
              disabled={addStatusPending || !newCategory.name.trim()}
              className="w-full h-13.5 bg-brand-main text-white rounded-2xl font-bold text-base hover:bg-brand-main/90 transition-all shadow-lg shadow-brand-main/25 mt-4 disabled:opacity-60"
            >
              {addStatusPending ? <Loader2 className="animate-spin mx-auto" /> : "إضـــافة الحالة"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
