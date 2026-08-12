"use client";

import React, { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { axiosInstance } from "@/src/utils/axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import Loader from "@/components/home/loader";
import { Loader2, RefreshCw } from "lucide-react";
import {
  DRAFT_CONTRACT_STATUSES_API,
  DRAFT_CONTRACT_STATUSES_QUERY_KEY,
  emptyDraftStatusForm,
  extractDraftStatusItems,
} from "@/src/lib/draft-contract-statuses";
import {
  invalidateContractStatusCaches,
  invalidateDraftOrdersCaches,
} from "@/src/lib/invalidate-orders-caches";

const RESOURCES = {
  contract: {
    label: "حالات العقود",
    api: "/admin/contract-statuses",
    queryKey: "status",
    listLabel: "قائمة التصنيفات",
    addLabel: "إضافة حالة العقد",
    editLabel: "تعديل حالة العقد",
    showSync: false,
  },
  "draft-contract": {
    label: "حالات مسودة العقود",
    api: DRAFT_CONTRACT_STATUSES_API,
    queryKey: DRAFT_CONTRACT_STATUSES_QUERY_KEY,
    listLabel: "قائمة حالات المسودة",
    addLabel: "إضافة حالة مسودة",
    editLabel: "تعديل حالة المسودة",
    showSync: true,
  },
};

function StatusColorFields({ values, onChange }) {
  return (
    <div className="grid grid-cols-2 gap-6">
      <div className="flex flex-col gap-3">
        <label className="text-[13px] font-bold text-black px-1">
          لون النص <span className="text-[#FF4D4F] mr-1">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={values.color_text}
            onChange={(e) => onChange({ ...values, color_text: e.target.value })}
            className="w-full h-[54px] bg-[#F9F9F9] border border-[#EEEEEE] rounded-[16px] pr-5 pl-14 text-[15px] focus:outline-none focus:border-brand-main focus:bg-white transition-all font-bold text-right"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden ring-1 ring-[#EEEEEE]">
            <input
              type="color"
              value={values.color_text}
              onChange={(e) => onChange({ ...values, color_text: e.target.value })}
              className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-[13px] font-bold text-black px-1">
          لون الخلفية <span className="text-[#FF4D4F] mr-1">*</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={values.color}
            onChange={(e) => onChange({ ...values, color: e.target.value })}
            className="w-full h-[54px] bg-[#F9F9F9] border border-[#EEEEEE] rounded-[16px] pr-5 pl-14 text-[15px] focus:outline-none focus:border-brand-main focus:bg-white transition-all font-bold text-right"
          />
          <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden ring-1 ring-[#EEEEEE]">
            <input
              type="color"
              value={values.color}
              onChange={(e) => onChange({ ...values, color: e.target.value })}
              className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer"
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function OrderStatusManager() {
  const [resource, setResource] = useState("contract");
  const config = RESOURCES[resource];

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [newCategory, setNewCategory] = useState(emptyDraftStatusForm);

  const queryClient = useQueryClient();

  const { data: statusData, isLoading: statusLoading } = useQuery({
    queryKey: [config.queryKey],
    queryFn: () => axiosInstance(config.api),
  });

  const statusItems = extractDraftStatusItems(statusData);

  const invalidateStatuses = () => {
    if (resource === "draft-contract") {
      invalidateDraftOrdersCaches(queryClient, { includeStatusDefinitions: true });
    } else {
      invalidateContractStatusCaches(queryClient);
    }
  };

  const { mutate: addStatusMutate, isPending: addStatusPending } = useMutation({
    mutationFn: () => axiosInstance.post(config.api, newCategory),
    onSuccess: (res) => {
      toast.success(res.data?.message || "تم إضافة الحالة بنجاح");
      setIsAddModalOpen(false);
      setNewCategory(emptyDraftStatusForm);
      invalidateStatuses();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء إضافة الحالة");
    },
  });

  const { mutate: updateStatusMutate, isPending: updateStatusPending } = useMutation({
    mutationFn: (id) => axiosInstance.post(`${config.api}/${id}`, editingCategory),
    onSuccess: (res) => {
      toast.success(res.data?.message || "تم تحديث الحالة بنجاح");
      setIsEditModalOpen(false);
      setEditingCategory(null);
      invalidateStatuses();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء تحديث الحالة");
    },
  });

  const { mutate: syncStatusesMutate, isPending: syncStatusesPending } = useMutation({
    mutationFn: () => axiosInstance.post(`${config.api}/sync`),
    onSuccess: (res) => {
      toast.success(res.data?.message || "تمت مزامنة الحالات بنجاح");
      invalidateStatuses();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء مزامنة الحالات");
    },
  });

  const switchResource = (next) => {
    setResource(next);
    setIsAddModalOpen(false);
    setIsEditModalOpen(false);
    setEditingCategory(null);
    setNewCategory(emptyDraftStatusForm);
  };

  return (
    <div className="flex flex-col gap-6" dir="rtl">
      <div className="flex flex-wrap gap-2">
        {Object.entries(RESOURCES).map(([key, cfg]) => (
          <button
            key={key}
            type="button"
            onClick={() => switchResource(key)}
            className={`h-9 px-4 rounded-full text-[13px] font-bold transition-all ${
              resource === key
                ? "bg-brand-main text-white"
                : "bg-white text-ink-body border border-surface-border hover:bg-surface-muted"
            }`}
          >
            {cfg.label}
          </button>
        ))}
      </div>

      {statusLoading ? (
        <Loader />
      ) : (
        <div className="flex flex-col gap-6 bg-white rounded-[32px] border border-[#F0F0F0] p-8 shadow-sm relative z-10">
          <div className="flex items-center justify-between pb-6 border-b border-[#F5F5F5] flex-wrap gap-3">
            <h2 className="text-[20px] font-black text-black">{config.listLabel}</h2>
            <div className="flex items-center gap-2 flex-wrap">
              {config.showSync ? (
                <button
                  type="button"
                  onClick={() => syncStatusesMutate()}
                  disabled={syncStatusesPending}
                  className="flex items-center gap-2 px-5 py-3 bg-[#F5F5F5] text-[#424242] rounded-full font-bold text-[14px] hover:bg-[#EEEEEE] transition-all disabled:opacity-60"
                >
                  {syncStatusesPending ? (
                    <Loader2 className="size-4 animate-spin" />
                  ) : (
                    <RefreshCw className="size-4" />
                  )}
                  <span>مزامنة من حالات العقود</span>
                </button>
              ) : null}
              <button
                type="button"
                onClick={() => setIsAddModalOpen(true)}
                className="flex items-center gap-2 px-6 py-3 bg-brand-main text-white rounded-full font-bold text-[14px] hover:bg-brand-main/90 transition-all shadow-lg shadow-brand-main/20"
              >
                <span>+ إضافة حالة جديدة</span>
              </button>
            </div>
          </div>

          <div className="w-full overflow-x-auto">
            <table className="w-full border-separate border-spacing-y-4">
              <thead>
                <tr className="bg-[#FAFAFA]">
                  <th className="text-right p-4 text-[#A3A3A3] text-[13px] font-bold rounded-r-[16px]">
                    اسم الحالة
                  </th>
                  <th className="text-right p-4 text-[#A3A3A3] text-[13px] font-bold">وصف الحالة</th>
                  <th className="text-center p-4 text-[#A3A3A3] text-[13px] font-bold">لون الحالة</th>
                  <th className="text-center p-4 text-[#A3A3A3] text-[13px] font-bold rounded-l-[16px]">
                    الاجـــراءات
                  </th>
                </tr>
              </thead>
              <tbody>
                {statusItems.length > 0 ? (
                  statusItems.map((category) => (
                    <tr key={category.id} className="group hover:bg-[#FAFAFA] transition-all">
                      <td className="p-4 bg-white group-hover:bg-[#FAFAFA] border-y border-r border-[#F0F0F0] first:rounded-r-[20px]">
                        <span className="text-[16px] font-bold text-black">{category?.name}</span>
                      </td>
                      <td className="p-4 bg-white group-hover:bg-[#FAFAFA] border-y border-[#F0F0F0] max-w-[280px]">
                        <p className="text-[13px] text-[#737373] line-clamp-2 text-right">
                          {category?.description || "—"}
                        </p>
                      </td>
                      <td className="p-4 bg-white group-hover:bg-[#FAFAFA] border-y border-[#F0F0F0]">
                        <div className="flex items-center justify-center gap-4">
                          <div
                            className="w-10 h-10 rounded-full border-4 border-white shadow-md ring-1 ring-[#F0F0F0]"
                            style={{ backgroundColor: category?.color }}
                          />
                          <div
                            className="px-4 py-1.5 rounded-full border border-[#EEEEEE] text-[13px] font-black"
                            style={{ color: category?.color_text, backgroundColor: category?.color }}
                          >
                            {(category?.color_text || "").toUpperCase()}
                          </div>
                        </div>
                      </td>
                      <td className="p-4 bg-white group-hover:bg-[#FAFAFA] border-y border-l border-[#F0F0F0] last:rounded-l-[20px]">
                        <div className="flex items-center justify-center gap-3">
                          <button
                            type="button"
                            onClick={() => {
                              setEditingCategory({
                                ...category,
                                description: category?.description ?? "",
                              });
                              setIsEditModalOpen(true);
                            }}
                            className="w-10 h-10 rounded-full bg-[#E6FFE6] text-[#10B981] flex justify-center items-center hover:bg-[#10B981] hover:text-white transition-all shadow-sm"
                          >
                            <i className="fa-solid fa-pen-to-square text-[14px]" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={4} className="text-center p-8 text-[#A3A3A3] text-sm">
                      لا توجد حالات حالياً.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-8 rounded-[32px] border-0" dir="rtl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-[22px] font-black text-black border-b border-[#F5F5F5] pb-4">
              {config.addLabel}
            </DialogTitle>
          </DialogHeader>

          <div className="flex flex-col gap-6">
            <div className="flex flex-col gap-3">
              <label className="text-[13px] font-bold text-black px-1">
                اسم الحالة <span className="text-[#FF4D4F] mr-1">*</span>
              </label>
              <input
                type="text"
                placeholder="ادخل اسم الحالة هنــا ..."
                value={newCategory.name}
                onChange={(e) => setNewCategory((prev) => ({ ...prev, name: e.target.value }))}
                className="w-full h-[54px] bg-[#F9F9F9] border border-[#EEEEEE] rounded-[16px] px-5 text-[15px] focus:outline-none focus:border-brand-main focus:bg-white transition-all font-medium text-right"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[13px] font-bold text-black px-1">وصف الحالة</label>
              <textarea
                placeholder="ادخل وصف الحالة هنا ..."
                value={newCategory.description ?? ""}
                onChange={(e) =>
                  setNewCategory((prev) => ({ ...prev, description: e.target.value }))
                }
                rows={3}
                className="w-full min-h-[96px] bg-[#F9F9F9] border border-[#EEEEEE] rounded-[16px] px-5 py-3 text-[15px] focus:outline-none focus:border-brand-main focus:bg-white transition-all font-medium text-right resize-none"
              />
            </div>

            <StatusColorFields values={newCategory} onChange={setNewCategory} />

            <button
              type="button"
              onClick={() => addStatusMutate()}
              disabled={addStatusPending || !newCategory.name.trim()}
              className="w-full h-[54px] bg-brand-main text-white rounded-[16px] font-bold text-[16px] hover:bg-brand-main/90 transition-all shadow-lg shadow-brand-main/25 mt-4 disabled:opacity-60"
            >
              {addStatusPending ? <Loader2 className="animate-spin mx-auto" /> : "إضـــافة الحالة"}
            </button>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-8 rounded-[32px] border-0" dir="rtl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-[22px] font-black text-black border-b border-[#F5F5F5] pb-4">
              {config.editLabel}
            </DialogTitle>
          </DialogHeader>

          {editingCategory && (
            <div className="flex flex-col gap-6">
              <div className="flex flex-col gap-3">
                <label className="text-[13px] font-bold text-black px-1">
                  اسم الحالة <span className="text-[#FF4D4F] mr-1">*</span>
                </label>
                <input
                  type="text"
                  value={editingCategory.name}
                  onChange={(e) =>
                    setEditingCategory((prev) => ({ ...prev, name: e.target.value }))
                  }
                  className="w-full h-[54px] bg-[#F9F9F9] border border-[#EEEEEE] rounded-[16px] px-5 text-[15px] focus:outline-none focus:border-brand-main focus:bg-white transition-all font-medium text-right"
                />
              </div>

              <div className="flex flex-col gap-3">
                <label className="text-[13px] font-bold text-black px-1">وصف الحالة</label>
                <textarea
                  placeholder="ادخل وصف الحالة هنا ..."
                  value={editingCategory.description ?? ""}
                  onChange={(e) =>
                    setEditingCategory((prev) => ({
                      ...prev,
                      description: e.target.value,
                    }))
                  }
                  rows={3}
                  className="w-full min-h-[96px] bg-[#F9F9F9] border border-[#EEEEEE] rounded-[16px] px-5 py-3 text-[15px] focus:outline-none focus:border-brand-main focus:bg-white transition-all font-medium text-right resize-none"
                />
              </div>

              <StatusColorFields values={editingCategory} onChange={setEditingCategory} />

              <button
                type="button"
                onClick={() => updateStatusMutate(editingCategory.id)}
                disabled={updateStatusPending || !editingCategory.name?.trim()}
                className="w-full h-[54px] bg-brand-main text-white rounded-[16px] font-bold text-[16px] hover:bg-brand-main/90 transition-all shadow-lg shadow-brand-main/25 mt-4 disabled:opacity-60"
              >
                {updateStatusPending ? <Loader2 className="animate-spin mx-auto" /> : "حفــظ التغييرات"}
              </button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
