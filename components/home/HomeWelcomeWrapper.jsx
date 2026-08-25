'use client'
import React, { useState, useEffect } from 'react'
import Header from './Header'
import defaultUser from '@/public/images/defaultUser.jpg'
import logo from '@/public/images/logo.svg'
import waving from '@/public/images/waving.svg'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/src/stores/user-store'
import { ArrowUpRight } from 'lucide-react'

function formatArabicTime(date) {
    const hours = date.getHours()
    const minutes = String(date.getMinutes()).padStart(2, '0')
    const hour12 = hours % 12 || 12
    const period = hours < 12 ? 'صباحاً' : 'مساءً'
    return `${hour12}:${minutes} ${period}`
}

function formatArabicDate(date) {
    const day = String(date.getDate()).padStart(2, '0')
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const year = date.getFullYear()
    return `${day} / ${month} / ${year}`
}

function getFirstName(fullName) {
    if (!fullName) return ''
    return fullName.trim().split(/\s+/)[0]
}

export default function HomeWelcomeWrapper() {
    const [time, setTime] = useState('')
    const [date, setDate] = useState('')
    const router = useRouter()
    const { user } = useUserStore()
    const firstName = getFirstName(user?.name)
    const roleLabel = user?.role_relation?.name ?? ''

    useEffect(() => {
        const updateTime = () => {
            const now = new Date()
            setTime(formatArabicTime(now))
            setDate(formatArabicDate(now))
        }

        updateTime()
        const interval = setInterval(updateTime, 1000)

        return () => clearInterval(interval)
    }, [])

    return (
        <>
            <Header page="welcome" title={null} isMain={true} />

            <div className="[&>h1]:mb-[15px] [&>h1]:text-[24px] [&>h1]:font-bold [&>h1]:text-black [&>p]:mb-[44px] [&>p]:max-w-2xl [&>p]:text-sm [&>p]:text-[#363636]">
                <h1>الإتقــان طريــق الخلــود في الأثــر ...</h1>
                <p>
                    الإتقان ليس في كثرة العمل، بل في صدق النية وجودة الأداء. من يعمل بضمير يترك أثراً لا يُمحى، قال تعالى: ﴿لِيَبْلُوَكُمْ أَيُّكُمْ أَحْسَنُ عَمَلًا﴾ ‏. ‏العبرة، بمعيار الجودة ‏والإحسان، ﻻبالكثرة والقلة !
                </p>

                <div className="relative mx-auto mb-[50px] flex w-full max-w-[575px] flex-col items-center justify-center rounded-[40px] border border-black/10 bg-white p-10 shadow-[0_4px_24px_rgba(0,0,0,0.06)]">
                    <Image
                        src={logo}
                        alt="عقدي"
                        width={36}
                        height={36}
                        className="absolute left-6 top-6 h-9 w-auto object-contain"
                    />

                    <Image
                        src={user?.profile_image || defaultUser}
                        alt={user?.name ?? 'المستخدم'}
                        width={112}
                        height={112}
                        className="mb-[15px] h-[112px] w-[112px] rounded-full object-cover"
                    />
                    <h3 className="mb-[6px] text-center text-sm font-bold text-black">{user?.name}</h3>
                    <p className="mb-[35px] text-center text-sm font-normal lowercase text-[#757575]">
                        {roleLabel}
                    </p>

                    <div className="mb-[35px] flex flex-col items-center gap-[15px]">
                        <p className="text-2xl font-semibold text-black">{time}</p>
                        <p className="text-sm font-normal text-[#757575]">{date}</p>
                    </div>

                    <div className="mb-[35px] flex flex-col items-center gap-[25px]">
                        <Image
                            src={waving}
                            alt=""
                            width={60}
                            height={60}
                            className="h-[60px] w-auto object-contain"
                            aria-hidden
                        />
                        <h2 className="mb-0 text-center text-[32px] font-semibold leading-tight text-brand-hover">
                            مرحباً بعودتك، {firstName} !.
                        </h2>
                        <span className="text-lg font-normal text-[#757575]">{roleLabel}</span>
                    </div>

                    <button
                        type="button"
                        className="flex h-[58px] items-center gap-3 rounded-full bg-black px-[18px] text-sm font-semibold text-white transition-colors hover:bg-[#1a1a1a]"
                        onClick={() => router.push('/home/reports')}
                    >
                        <span>ابدأ الآن</span>
                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-white">
                            <ArrowUpRight className="size-5 text-black" strokeWidth={2.5} />
                        </span>
                    </button>
                </div>
            </div>
        </>
    )
}
