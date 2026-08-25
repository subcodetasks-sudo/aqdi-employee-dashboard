import React from 'react'
import Image from 'next/image'
import { Clock } from 'lucide-react'

export default function CommentCard({ comment }) {
  return (
    <div className='bg-surface-input rounded-xl p-4 border border-surface-border flex flex-col gap-3.5' dir="rtl">
      {/* User Info Row */}
      <div className='flex items-center justify-between w-full'>
        {/* Right: User Avatar and Name */}
        <div className='flex items-center gap-2.5'>
          <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-surface-border">
            <Image
              src={"/images/defaultUser.jpg"}
              alt="User"
              width={100}
              height={100}
              className="object-cover w-full h-full"
            />
          </div>
          <div className='text-right'>
            <h4 className='text-sm font-bold text-ink-heading leading-none'>{comment?.employee_name}</h4>
            <span className='text-11 text-ink-placeholder font-medium mt-1 inline-block'>{comment?.employee_role}</span>
          </div>
        </div>

        {/* Left: Time */}
        <div className='flex items-center gap-1.5 text-ink-placeholder text-11 font-medium'>
          <div className='w-[20px] h-[20px] rounded-full bg-white flex items-center justify-center text-ink-placeholder'>
            <Clock size={11} strokeWidth={2.5} />
          </div>
          <span>{comment?.created_at_human}</span>
        </div>
      </div>

      {/* Comment Content */}
      <div className='text-right px-0.5'>
        <p className='text-13 font-bold text-ink-body leading-relaxed'>
          {comment?.comment}
        </p>
      </div>
    </div>
  )
}
