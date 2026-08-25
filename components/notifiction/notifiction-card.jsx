"use client"
import React from 'react'
import { Hand, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useReceiveContract } from '@/src/hooks/use-receive-contract'
import { getWaitingMinutes } from '@/components/RealtimeOrders/map-realtime-order'

// No backend SLA flag exists for unreceived orders yet — 12h is a stated
// client-side assumption for when to switch the waiting label to overdue-red.
const OVERDUE_HOURS = 12

export default function NotifictionCard({ order }) {
  const router = useRouter()
  const { mutate: acceptOrder, isPending } = useReceiveContract({
    onSuccess: () => {
      router.push(`/home/orders/${order?.id}`)
    },
  })

  const waitingHours = Math.floor(getWaitingMinutes(order) / 60)
  const isOverdue = waitingHours >= OVERDUE_HOURS
  const dateLabel = order?.updated_at
    ? new Date(order.updated_at).toLocaleDateString('ar-SA', { day: '2-digit', month: '2-digit', year: 'numeric' })
    : ''
  const waitingLabel = isOverdue ? `بلا استلام منذ ${waitingHours} ساعة` : 'بانتظار الاستلام'

  return (
    <div className='bg-surface-input border border-surface-border rounded-[16px] p-3.5 flex flex-col gap-3'>
      <div className='flex items-center justify-between gap-2'>
        <div className='flex items-center gap-2 min-w-0'>
          <span className='relative shrink-0'>
            <span className='flex items-center justify-center h-8 w-8 rounded-full bg-brand-accent/10 text-base'>
              🎉
            </span>
            <span className='absolute -top-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-[#FF4444] ring-2 ring-surface-input' />
          </span>
          <h4 className='text-13 font-black text-ink-heading leading-tight truncate'>
            طلب جديد {order?.contract_type || ''}
          </h4>
        </div>
        <span className='text-11 font-bold text-ink-placeholder tabular-nums shrink-0'>#{order?.uuid}</span>
      </div>

      <div className='flex flex-col gap-0.5'>
        <span className={`text-11 font-bold ${isOverdue ? 'text-[#D33A2C]' : 'text-ink-placeholder'}`}>{dateLabel}</span>
        <span className={`text-11 font-bold ${isOverdue ? 'text-[#D33A2C]' : 'text-ink-placeholder'}`}>{waitingLabel}</span>
      </div>

      <div className='flex items-center gap-2'>
        <button
          type='button'
          onClick={() => router.push(`/home/orders/${order?.id}`)}
          className='h-9 flex-1 rounded-full border border-surface-border bg-white text-ink-body text-13 font-bold hover:bg-surface-muted transition-colors'
        >
          استعراض
        </button>
        <button
          type='button'
          onClick={() => acceptOrder(order)}
          disabled={isPending}
          className='h-9 flex-[1.3] rounded-full bg-brand-accent hover:bg-brand-accent-hover disabled:opacity-60 transition-colors text-white flex items-center justify-center gap-1.5 font-bold text-13'
        >
          {isPending ? <Loader2 className='animate-spin h-4 w-4' /> : <Hand size={14} strokeWidth={2.5} className='rotate-[15deg]' />}
          <span>استلام</span>
        </button>
      </div>
    </div>
  )
}
