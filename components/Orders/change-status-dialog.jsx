"use client"
import React, { useMemo, useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useMutation, useQuery } from '@tanstack/react-query'
import { axiosInstance } from '@/src/utils/axios'
import { Loader2, Plus, TrashIcon } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import ReturnRequestDialog from "./return-request-dialog"
import {
  canRequestOrderReturn,
  getOrderContractStatusDisplay,
  isReturnContractStatus,
  normalizeOrderForReturnRequest,
} from "@/components/analysis/returned/refund-contract-utils"
import { openDialogAfterMenuClose } from "@/src/lib/open-dialog-after-menu-close"
import { invalidateOrdersCaches, invalidateContractStatusCaches } from "@/src/lib/invalidate-orders-caches"
import {
  CONTRACT_STATUSES_ACTIVE_API,
  CONTRACT_STATUSES_ACTIVE_QUERY_KEY,
  CONTRACT_STATUSES_API,
  buildContractStatusWritePayload,
  extractContractStatusItems,
} from "@/src/lib/contract-statuses"
import ChangeOrderStatusFieldsDialog, {
  getStatusCaseFields,
  statusRequiresExtraFields,
} from "@/components/RealtimeOrders/ChangeOrderStatusFieldsDialog"
import { postOrderStatus } from "@/src/lib/order-status-api"

export default function ChangeStatusDialog({ orderId, order, queryKey }) {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [statusFieldsOpen, setStatusFieldsOpen] = useState(false);
  const [pendingStatus, setPendingStatus] = useState(null);
  const [newCategory, setNewCategory] = useState({
    name: '',
    description: '',
    color_text: '#000000',
    color: '#000000'
  });
  const queryClient = useQueryClient()
  const returnOrder = normalizeOrderForReturnRequest(order, orderId)
  const showReturnRequest = canRequestOrderReturn(returnOrder)
  const currentStatus = getOrderContractStatusDisplay(order ?? returnOrder)

  function getStatus() {
    return axiosInstance(CONTRACT_STATUSES_ACTIVE_API)
  }
  const { data: statusData } = useQuery({
    queryKey: [CONTRACT_STATUSES_ACTIVE_QUERY_KEY],
    queryFn: getStatus
  })

  const statusItems = useMemo(() => {
    const items = extractContractStatusItems(statusData)
    const currentId = currentStatus?.id

    if (currentId == null || currentId === "") return items

    return items.filter(
      (item) => String(item?.id) !== String(currentId)
    )
  }, [statusData, currentStatus?.id])

  function addStatus() {
    return axiosInstance.post(
      CONTRACT_STATUSES_API,
      buildContractStatusWritePayload(newCategory)
    )
  }
  const { mutate: addStatusMutate, isPending: addStatusPending } = useMutation({
    mutationFn: addStatus,
    onSuccess: (res) => {
      setIsAddModalOpen(false);
      setNewCategory({ name: '', description: '', color_text: '#000000', color: '#000000' });
      invalidateContractStatusCaches(queryClient);
      changeStatusMutate({ statusId: res?.data?.data?.id })
    },
    onError: (error) => {
      toast.error(error.response.data.message);
    }
  })

  function changeStatus({ statusId, extraValues, fields }) {
    return postOrderStatus(orderId, { statusId, extraValues, fields })
  }
  const { mutate: changeStatusMutate, isPending: changeStatusPending } = useMutation({
    mutationFn: changeStatus,
    onSuccess: (res) => {
      setStatusFieldsOpen(false)
      setPendingStatus(null)
      toast.success(res?.data?.message || "تم تغيير حالة الطلب")
      invalidateOrdersCaches(queryClient, { queryKey, orderId })
    },
    onError: (res) => {
      toast.error(res?.response?.data?.message || "حدث خطأ أثناء تغيير حالة الطلب")
    }
  })

  const { mutate: deleteOrder, isPending: isDeleting } = useMutation({
    mutationFn: () => axiosInstance.post(`/admin/orders/${orderId}/delete`),
    onSuccess: (res) => {
      toast.success(res?.data?.message || "تم حذف الطلب بنجاح")
      invalidateOrdersCaches(queryClient, { queryKey, orderId })
    },
    onError: (error) => {
      toast.error(error?.response?.data?.message || "حدث خطأ أثناء حذف الطلب")
    },
  })

  const openReturnDialog = () => {
    openDialogAfterMenuClose(() => setReturnDialogOpen(true))
  }

  const handleStatusClick = (status) => {
    // استرجاع: افتح النموذج أولاً — تغيير الحالة يتم بعد نجاح إرسال الطلب
    if (isReturnContractStatus(status)) {
      if (!showReturnRequest) {
        toast.info("يوجد طلب استرجاع مسبقاً لهذا الطلب")
        return
      }
      openReturnDialog()
      return
    }

    if (statusRequiresExtraFields(status)) {
      setPendingStatus(status)
      openDialogAfterMenuClose(() => setStatusFieldsOpen(true))
      return
    }

    changeStatusMutate({ statusId: status.id })
  }

  return (
    <>
    <DropdownMenu dir="rtl" modal={false}>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          onClick={(e) => e.stopPropagation()}
          className="size-8 rounded-lg border border-[#E6EBE9] flex items-center justify-center bg-white text-[#6B7280] hover:text-[#0B5345] hover:border-[#0B5345]/30 transition-colors"
          aria-label="إجراءات الطلب"
        >
          <i className="fa-solid fa-ellipsis-vertical text-[14px]"></i>
        </button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        className="w-64 rounded-[16px] shadow-lg border-[#EEEEEE] p-2"
        onClick={(e) => e.stopPropagation()}
      >
        <DropdownMenuLabel>تغيير حالة الطلب</DropdownMenuLabel>
        <DropdownMenuSeparator className="bg-[#F5F5F5] my-1" />

        {statusItems.map((item) => (
          <div key={item?.id}>
            <DropdownMenuItem
              onSelect={() => {
                handleStatusClick(item)
              }}
              disabled={changeStatusPending}
              className="cursor-pointer hover:bg-[#F9F9F9] rounded-lg p-2"
            >
              <span className="font-medium text-[13px]">{item?.name}</span>
              {changeStatusPending ? (
                <Loader2 className="animate-spin mr-auto size-4" />
              ) : (
                <i className="fa-solid fa-chevron-left mr-auto text-[#A3A3A3] text-[10px]"></i>
              )}
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-[#F5F5F5] my-1" />
          </div>
        ))}

        <DropdownMenuItem
          onSelect={() => {
            openDialogAfterMenuClose(() => setIsAddModalOpen(true))
          }}
          className="cursor-pointer hover:bg-[#F9F9F9] rounded-lg p-2"
        >
          <Plus className="size-4" />
          <span className="font-medium text-[13px]">أخـرى</span>
          <i className="fa-solid fa-chevron-left mr-auto text-[#A3A3A3] text-[10px]"></i>
        </DropdownMenuItem>

        <DropdownMenuSeparator className="bg-[#F5F5F5] my-1" />

        <DropdownMenuItem
          className="cursor-pointer hover:bg-[#FFF5F5] text-red-600 rounded-lg p-2"
          disabled={isDeleting}
          onSelect={(e) => {
            e.stopPropagation?.()
            deleteOrder()
          }}
        >
          <TrashIcon className='text-red-600 size-4' />
          <span className="font-medium text-[13px] text-red-600">حذف الطلـب</span>
          {isDeleting ? (
            <Loader2 className="animate-spin mr-auto size-4" />
          ) : (
            <i className="fa-solid fa-chevron-left mr-auto text-red-300 text-[10px]"></i>
          )}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>

      <ReturnRequestDialog
        open={returnDialogOpen}
        onOpenChange={setReturnDialogOpen}
        order={returnOrder}
        orderId={orderId}
        queryKey={queryKey}
      />
      
      <ChangeOrderStatusFieldsDialog
        open={statusFieldsOpen}
        onOpenChange={(next) => {
          setStatusFieldsOpen(next)
          if (!next) setPendingStatus(null)
        }}
        status={pendingStatus}
        isPending={changeStatusPending}
        onSubmit={(extraValues) => {
          if (!pendingStatus) return
          changeStatusMutate({
            statusId: pendingStatus.id,
            extraValues,
            fields: getStatusCaseFields(pendingStatus),
          })
        }}
      />

      <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
        <DialogContent className="sm:max-w-[600px] p-8 rounded-[18px] border-0" dir="rtl">
          <DialogHeader className="mb-6">
            <DialogTitle className="text-[18px] font-black text-[#22302C] border-b border-[#EEF1EF] pb-4">إضافة حالة العقد</DialogTitle>
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
                onChange={(e) => setNewCategory(prev => ({ ...prev, name: e.target.value }))}
                className="w-full h-[54px] bg-[#F9F9F9] border border-[#EEEEEE] rounded-[16px] px-5 text-[15px] focus:outline-none focus:border-brand-main focus:bg-white transition-all font-medium text-right"
              />
            </div>

            <div className="flex flex-col gap-3">
              <label className="text-[13px] font-bold text-black px-1">
                وصف الحالة
              </label>
              <textarea
                placeholder="ادخل وصف الحالة هنا ..."
                value={newCategory.description}
                onChange={(e) => setNewCategory(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
                className="w-full min-h-[96px] bg-[#F9F9F9] border border-[#EEEEEE] rounded-[16px] px-5 py-3 text-[15px] focus:outline-none focus:border-brand-main focus:bg-white transition-all font-medium text-right resize-none"
              />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="flex flex-col gap-3">
                <label className="text-[13px] font-bold text-black px-1">
                  لون النص <span className="text-[#FF4D4F] mr-1">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={newCategory.color_text}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, color_text: e.target.value }))}
                    className="w-full h-[54px] bg-[#F9F9F9] border border-[#EEEEEE] rounded-[16px] pr-5 pl-14 text-[15px] focus:outline-none focus:border-brand-main focus:bg-white transition-all font-bold text-right"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden ring-1 ring-[#EEEEEE]">
                    <input
                      type="color"
                      value={newCategory.color_text}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, color_text: e.target.value }))}
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
                    value={newCategory.color}
                    onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                    className="w-full h-[54px] bg-[#F9F9F9] border border-[#EEEEEE] rounded-[16px] pr-5 pl-14 text-[15px] focus:outline-none focus:border-brand-main focus:bg-white transition-all font-bold text-right"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden ring-1 ring-[#EEEEEE]">
                    <input
                      type="color"
                      value={newCategory.color}
                      onChange={(e) => setNewCategory(prev => ({ ...prev, color: e.target.value }))}
                      className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer"
                    />
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => addStatusMutate()}
              disabled={addStatusPending}
              className="w-full h-[54px] bg-brand-main text-white rounded-[16px] font-bold text-[16px] hover:bg-brand-main/90 transition-all shadow-lg shadow-brand-main/25 mt-4"
            >
              {addStatusPending ? <Loader2 className="animate-spin mx-auto" /> : "إضـــافة الحالة"}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
