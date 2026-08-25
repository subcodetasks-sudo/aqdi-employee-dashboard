import React, { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { axiosInstance } from '@/src/utils/axios'
import { useSidebarStore } from '@/src/stores/sidebar-store'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'

export default function CommentForm() {
  const [comment, setComment] = useState('')
  const queryClient = useQueryClient()
  const { orderId } = useSidebarStore()

  const { mutate: addComment, isPending } = useMutation({
    mutationFn: (data) => axiosInstance.post(`/admin/orders/${orderId}/comments`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['orderComments', orderId] })
      toast.success('تم إضافة الملاحظة بنجاح')
      setComment('')
    },
    onError: (err) => {
      toast.error(err?.response?.data?.message || 'حدث خطأ ما')
    }
  })

  const handleSubmit = () => {
    if (!comment.trim()) {
      toast.error('الرجاء كتابة ملاحظة أولاً')
      return
    }
    addComment({ comment })
  }

  return (
    <div className='flex flex-col gap-4' dir="rtl">
      <h3 className='font-bold text-ink-heading text-right'>هل ترغب بذكر ملاحظة !</h3>

      <textarea
        className='w-full min-h-40 p-6 rounded-xl border border-surface-border bg-surface-input text-base font-medium placeholder:text-ink-placeholder focus:outline-none focus:ring-1 focus:ring-brand-accent resize-none text-right'
        placeholder='أكتب هنا ...'
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={isPending}
        className='w-full h-12 bg-brand-accent hover:bg-brand-accent-hover disabled:opacity-60 transition-colors duration-300 text-white font-bold rounded-xl flex items-center justify-center gap-2'
      >
        {isPending ? <Loader2 className='animate-spin h-5 w-5' /> : 'إضافة'}
      </button>
    </div>
  )
}
