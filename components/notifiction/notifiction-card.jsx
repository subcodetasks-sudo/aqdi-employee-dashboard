"use client"
import React from 'react'
import { Clock, Hand, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useReceiveContract } from '@/src/hooks/use-receive-contract'

export default function NotifictionCard({ order }) {
  const router = useRouter()
  const { mutate: acceptOrder, isPending } = useReceiveContract({
    onSuccess: () => {
      router.push(`/home/orders/${order?.id}`)
    },
  })

  return (
    <div className='bg-white rounded-[18px] p-4 border border-[#F0F0F0] shadow flex flex-col gap-3.5' >
      {/* Top Row: Time and Notification Icon */}
      <div className='flex items-center justify-between w-full'>
        <div className='relative'>
          <div className='w-9 h-9 rounded-full bg-[#F9F9F9] flex items-center justify-center border border-[#F0F0F0] text-[18px]'>
            🎉
          </div>
          <div className='absolute top-0 right-0 w-[9px] h-[9px] bg-[#FF4444] rounded-full border-2 border-white'></div>
        </div>
        <div className='flex items-center gap-1.5 text-[#A3A3A3] text-[12px] font-medium'>
          <div className='w-[22px] h-[22px] rounded-full bg-[#F5F5F5] flex items-center justify-center text-[#616161]'>
            <Clock size={12} strokeWidth={2.5} />
          </div>
          <span>منذ {new Date(order?.updated_at).toLocaleDateString('ar-SA', { day: '2-digit', month: '2-digit', year: 'numeric' })}</span>
        </div>

      </div>

      {/* Bottom Row: Action Button and Request Details */}
      <div className='flex items-center justify-between w-full'>

        <div className='flex flex-col text-right'>
          <h4 className='text-[16px] font-black text-black leading-none'>طلب جديد</h4>
          <span className='text-[13px] text-[#A3A3A3] font-bold mt-1'>{order?.uuid}</span>
        </div>
        <button onClick={() => acceptOrder(order)} disabled={isPending} className='bg-[#00801E] hover:bg-[#006418] transition-all duration-300 text-white h-[36px] px-5 rounded-[18px] flex items-center gap-2 font-bold text-[13px]'>
          <span>استلام</span>
          {
            isPending ? <Loader2 className='animate-spin h-4 w-4' /> : <Hand size={15} strokeWidth={2.5} className="rotate-[15deg]" />
          }
        </button>
      </div>
    </div>
  )
}
