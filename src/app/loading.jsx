import React from 'react'

export default function Loading() {
    return (
        <div className="fixed inset-0 min-h-screen bg-white/80 backdrop-blur-sm z-[9999] flex flex-col items-center justify-center">
            <div className="relative w-16 h-16">
                <div className="absolute inset-0 rounded-full border-[4px] border-neutral-100"></div>
                <div className="absolute inset-0 rounded-full border-[4px] border-[#0c6055] border-t-transparent animate-spin"></div>
            </div>
            <p className="mt-4 text-[#0c6055] font-bold text-sm font-sans">جــارٍ التحميـــل ...</p>
        </div>
    )
}
