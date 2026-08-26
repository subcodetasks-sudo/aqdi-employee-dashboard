"use client";

import React from "react";
import Image from "next/image";
import { Clock } from "lucide-react";
import { cn } from "@/lib/utils";

export default function CommentCard({ comment }) {
  return (
    <div
      className={cn(
        "rounded-xl p-4 border flex flex-col gap-3.5",
        "bg-white border-[#ECECEA]",
        "dark:bg-[#13251E] dark:border-[#26473A]"
      )}
      dir="rtl"
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-full overflow-hidden ring-1 ring-[#E3E8E6] dark:ring-[#2C5648]">
            <Image
              src="/images/defaultUser.jpg"
              alt="User"
              width={100}
              height={100}
              className="object-cover w-full h-full"
            />
          </div>
          <div className="text-right">
            <h4 className="text-sm font-bold text-gray-900 dark:text-[#D6E5DE] leading-none">
              {comment?.employee_name}
            </h4>
            <span className="text-11 text-[#98A39E] dark:text-[#9FC0B4] font-medium mt-1 inline-block">
              {comment?.employee_role}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-[#98A39E] dark:text-[#9FC0B4] text-11 font-medium">
          <div className="w-5 h-5 rounded-full bg-[#F7F8F8] dark:bg-[#1B3A2E] flex items-center justify-center">
            <Clock size={11} strokeWidth={2.5} />
          </div>
          <span>{comment?.created_at_human}</span>
        </div>
      </div>

      <div className="text-right px-0.5">
        <p className="text-13 font-bold text-gray-700 dark:text-[#D6E5DE] leading-relaxed">
          {comment?.comment}
        </p>
      </div>
    </div>
  );
}
