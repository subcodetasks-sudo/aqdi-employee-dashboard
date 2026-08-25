"use client"
import React from 'react'
import CommentForm from './comment-form'
import CommentCard from './comment-card'
import { useSidebarStore } from '@/src/stores/sidebar-store'
import { useQuery } from '@tanstack/react-query'
import { Loader2, MessageSquare, X } from 'lucide-react'
import { axiosInstance } from '@/src/utils/axios'

export default function CommentList() {
  const { orderId, setDisplayedPart, displayedPart } = useSidebarStore();
  function getOrderComments() {
    return axiosInstance.get(`/admin/orders/${orderId}/comments`)
      .then((res) => res?.data)
      .catch((err) => {
        throw err;
      })
  }
  const { data, isLoading } = useQuery({
    queryKey: ["orderComments", orderId],
    queryFn: getOrderComments,
    enabled: Boolean(orderId) && displayedPart === "comments",
  });
  const comments = data?.data?.items;

  return (
    <div className='flex flex-col gap-6'>
      <div className='flex items-center gap-2'>
        <p className='font-bold text-lg text-ink-heading'>التعليقات</p>
        <button
          onClick={() => setDisplayedPart("default")}
          aria-label='إغلاق التعليقات'
          className='size-8 rounded-full bg-surface-muted hover:bg-surface-muted-hover text-ink-body flex items-center justify-center ms-auto transition-colors'
        >
          <X className='h-4 w-4' />
        </button>
      </div>

      <CommentForm />

      <div className='flex flex-col gap-4'>
        <p className='font-bold text-13 text-ink-body'>ملاحظات الموظفيــن :</p>
        {isLoading ? (
          <div className='flex items-center justify-center py-6'>
            <Loader2 className='animate-spin h-6 w-6 text-brand-accent' />
          </div>
        ) : comments?.length ? (
          comments.map((comment) => (
            <CommentCard key={comment.id} comment={comment} />
          ))
        ) : (
          <div className='flex flex-col items-center justify-center gap-2 rounded-[18px] py-10 px-4 bg-surface-input border border-surface-border text-center'>
            <div className='flex items-center justify-center h-10 w-10 rounded-full bg-brand-accent/10 text-brand-accent'>
              <MessageSquare size={18} strokeWidth={2} />
            </div>
            <p className='text-13 font-bold text-ink-body'>لا توجد ملاحظات بعد</p>
            <p className='text-11 text-ink-placeholder'>أول من يكتب ملاحظة يظهر هنا</p>
          </div>
        )}
      </div>
    </div>
  )
}
