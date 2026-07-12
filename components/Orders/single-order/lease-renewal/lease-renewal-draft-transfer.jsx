"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { axiosInstance } from "@/src/utils/axios";
import {
  DRAFT_CONTRACT_STATUSES_API,
  extractDraftStatusItems,
  getOrderDraftContractNumber,
  getOrderDraftStatusFromDetail,
} from "@/src/lib/draft-contract-statuses";

const DEFAULT_STATUS_STYLE = {
  backgroundColor: "#FFE8EE",
  borderColor: "#FFD6E0",
  color: "#E91E8C",
};

function getStatusButtonStyle(status) {
  if (!status?.color && !status?.colorText) return DEFAULT_STATUS_STYLE;

  return {
    backgroundColor: status.color || DEFAULT_STATUS_STYLE.backgroundColor,
    borderColor: status.color || DEFAULT_STATUS_STYLE.borderColor,
    color: status.colorText || DEFAULT_STATUS_STYLE.color,
  };
}

export default function LeaseRenewalDraftTransfer({
  orderId,
  orderData,
  layout = "stacked",
  showTransferLabel = true,
}) {
  const queryClient = useQueryClient();
  const queryKey = ["single-order", orderId];
  const currentStatus = getOrderDraftStatusFromDetail(orderData);
  const [draftNumber, setDraftNumber] = useState(() =>
    getOrderDraftContractNumber(orderData)
  );
  const [selectedStatus, setSelectedStatus] = useState(currentStatus);

  useEffect(() => {
    setDraftNumber(getOrderDraftContractNumber(orderData));
    setSelectedStatus(getOrderDraftStatusFromDetail(orderData));
  }, [orderData]);

  const { data: statusData, isLoading: statusesLoading } = useQuery({
    queryKey: ["draft-contract-statuses-active"],
    queryFn: () => axiosInstance(`${DRAFT_CONTRACT_STATUSES_API}/active`),
    staleTime: 5 * 60 * 1000,
  });

  const statusItems = extractDraftStatusItems(statusData);

  const invalidateOrder = () => {
    queryClient.invalidateQueries({ queryKey });
    queryClient.invalidateQueries({ queryKey: ["draft-orders-all-total"] });
    queryClient.invalidateQueries({ queryKey: ["draftContracts"] });
  };

  const { mutate: updateDraftStatus, isPending: isUpdatingStatus } = useMutation({
    mutationFn: (statusId) =>
      axiosInstance.post(`/admin/orders/${orderId}/draft-contract-status`, {
        draft_contract_status_id: statusId,
      }),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم تحديث حالة التحويل");
      invalidateOrder();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء تحديث حالة التحويل");
    },
  });

  const { mutate: saveDraftDetails, isPending: isSaving } = useMutation({
    mutationFn: () => {
      const payload = {
        draft_contract_number: draftNumber.trim(),
      };

      if (selectedStatus?.id) {
        payload.draft_contract_status_id = selectedStatus.id;
      }

      return axiosInstance.post(`/admin/orders/${orderId}/draft-contract-status`, payload);
    },
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم حفظ رقم مسودة العقد");
      invalidateOrder();
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء حفظ رقم مسودة العقد");
    },
  });

  const handleStatusSelect = (item) => {
    setSelectedStatus({
      id: item.id,
      name: item.name,
      color: item.color,
      colorText: item.color_text,
    });
    updateDraftStatus(item.id);
  };

  const handleSave = () => {
    if (!draftNumber.trim()) {
      toast.error("يرجى إدخال رقم مسودة العقد");
      return;
    }
    saveDraftDetails();
  };

  const statusStyle = getStatusButtonStyle(selectedStatus);
  const statusLabel = selectedStatus?.name || "اختر حالة التحويل";

  const transferBlock = (
    <div>
      {showTransferLabel ? (
        <p className="text-[13px] font-black text-black mb-2">تحويل الطلب :</p>
      ) : null}
      <DropdownMenu dir="rtl">
        <DropdownMenuTrigger asChild>
          <button
            type="button"
            disabled={statusesLoading || isUpdatingStatus}
            className="w-full flex items-center justify-between gap-2 px-4 py-3 rounded-2xl border text-[12px] font-bold transition-opacity disabled:opacity-70"
            style={{
              backgroundColor: statusStyle.backgroundColor,
              borderColor: statusStyle.borderColor,
              color: statusStyle.color,
            }}
          >
            <span className="flex items-center gap-2 min-w-0">
              {isUpdatingStatus ? (
                <Loader2 className="size-4 animate-spin shrink-0" />
              ) : (
                <span aria-hidden>🥳</span>
              )}
              <span className="truncate">{statusLabel}</span>
            </span>
            <ChevronLeft className="size-4 shrink-0" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent
          align="end"
          className="w-[min(320px,calc(100vw-32px))] rounded-[16px] border-[#EEEEEE] p-2"
        >
          {statusItems.length ? (
            statusItems.map((item) => (
              <DropdownMenuItem
                key={item.id}
                onClick={() => handleStatusSelect(item)}
                className="cursor-pointer rounded-lg p-2.5 text-right"
              >
                <span
                  className="inline-flex items-center rounded-full px-3 py-1 text-[12px] font-bold"
                  style={{
                    backgroundColor: item.color || "#F5F5F5",
                    color: item.color_text || "#000000",
                  }}
                >
                  {item.name}
                </span>
              </DropdownMenuItem>
            ))
          ) : (
            <p className="text-center text-[12px] text-[#A3A3A3] py-4">
              لا توجد حالات مسودة نشطة
            </p>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  const draftNumberBlock = (
    <div>
      <p
        className={`text-[13px] font-black text-black mb-2 ${
          layout === "column" ? "text-right" : ""
        }`}
      >
        رقم مسودة العقد{layout === "stacked" ? " :" : ""}
      </p>
      <div className={layout === "column" ? "space-y-4" : "flex items-center gap-2"}>
        <Input
          placeholder="أدخل رقم مسودة العقد هنا..."
          value={draftNumber}
          onChange={(e) => setDraftNumber(e.target.value)}
          className={`rounded-xl bg-white border-[#E0E0E0] text-right ${
            layout === "column" ? "h-12 mb-0" : "h-11 flex-1"
          }`}
        />
        <Button
          type="button"
          disabled={isSaving}
          className={`rounded-xl bg-[#0019FF] hover:bg-[#0015CC] font-bold text-white shrink-0 ${
            layout === "column" ? "w-full h-12" : "h-11 px-6"
          }`}
          onClick={handleSave}
        >
          {isSaving ? <Loader2 className="size-4 animate-spin" /> : "حفظ"}
        </Button>
      </div>
    </div>
  );

  if (layout === "column") {
    return (
      <div className="flex flex-col gap-5 h-fit">
        {transferBlock}
        {draftNumberBlock}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {transferBlock}
      {draftNumberBlock}
    </div>
  );
}
