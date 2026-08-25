"use client"
import React, { useState } from 'react'
import NotifictionCard from './notifiction-card'
import { Bell, Loader2, X } from 'lucide-react'
import { keepPreviousData, useQuery } from '@tanstack/react-query'
import { axiosInstance } from '@/src/utils/axios'
import { useSidebarStore } from '@/src/stores/sidebar-store'
import OrdersPagination from '../Orders/shared/orders-pagination'

export default function NotificationList() {
  const { setDisplayedPart } = useSidebarStore();
  const [currentPage, setCurrentPage] = useState(1);

  function getUnreceivedOrders() {
    return axiosInstance
      .get(`/admin/orders?status_id=1&per_page=100&page=${currentPage}`)
      .then((res) => res?.data)
      .catch((err) => {
        throw err;
      });
  }

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['unReceivedOrders', currentPage],
    queryFn: getUnreceivedOrders,
    placeholderData: keepPreviousData,
  });

  const responseData = data?.data;
  const unreceivedOrders = responseData?.items ?? (Array.isArray(responseData) ? responseData : []);
  const pagination = responseData?.pagination;
  const totalCount = pagination?.total ?? unreceivedOrders.length;


  if (isLoading) {
    return (
      <div className='h-full flex items-center justify-center'>
        <Loader2 className='animate-spin h-12 w-12 text-brand-accent' />
      </div>
    );
  }

  return (
    <div>
      {/* Close sits on the dark sidebar frame, breaking the light panel below it */}
      <div className='flex justify-end mb-2.5'>
        <button
          onClick={() => setDisplayedPart('default')}
          aria-label='إغلاق الإشعارات'
          className='size-9 rounded-full bg-brand-accent hover:bg-brand-accent-hover text-white shadow-lg shadow-black/20 flex items-center justify-center transition-colors'
        >
          <X className='h-4 w-4' />
        </button>
      </div>

      <div className='bg-white rounded-[26px] p-4 shadow-xl flex flex-col gap-4'>
        <div className='flex items-center gap-2'>
          <p className='font-bold text-lg text-ink-heading'>الإشعارات</p>
          <span className='relative flex size-1.5'>
            <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-accent opacity-75' />
            <span className='relative inline-flex size-1.5 rounded-full bg-brand-accent' />
          </span>
        </div>

        <div className='flex items-center justify-between rounded-[18px] bg-brand-accent/[0.06] p-3.5'>
          <div>
            <p className='text-13 font-bold text-ink-body'>طلبات جديدة</p>
            <p className='mt-1 font-black text-brand-dark text-4xl tabular-nums'>{totalCount}</p>
            <p className='mt-1 text-11 text-ink-placeholder'>بانتظار الاستلام من أي موظف</p>
          </div>
          <div className='relative flex items-center justify-center h-11 w-11 rounded-full bg-brand-accent/15 text-brand-accent shrink-0'>
            <span className='absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-accent/20' />
            <Bell size={19} strokeWidth={2.25} className='relative' />
          </div>
        </div>

        {unreceivedOrders.length === 0 ? (
          <div className='flex flex-col items-center justify-center gap-2 rounded-[18px] py-10 px-4 bg-surface-input border border-surface-border text-center'>
            <div className='flex items-center justify-center h-10 w-10 rounded-full bg-brand-accent/10 text-brand-accent'>
              <Bell size={18} strokeWidth={2} />
            </div>
            <p className='text-13 font-bold text-ink-body'>لا توجد طلبات جديدة الآن</p>
            <p className='text-11 text-ink-placeholder'>سيظهر أي طلب جديد هنا فور وصوله</p>
          </div>
        ) : (
          <div
            className={`flex flex-col gap-3 ${isFetching ? 'opacity-60 pointer-events-none transition-opacity' : ''}`}
          >
            {unreceivedOrders.map((order) => (
              <NotifictionCard key={order?.id} order={order} />
            ))}
          </div>
        )}

        <OrdersPagination
          pagination={pagination}
          currentPage={currentPage}
          onPageChange={setCurrentPage}
        />
      </div>
    </div>
  )
}
