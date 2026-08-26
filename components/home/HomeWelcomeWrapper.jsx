'use client'
import React, { useState, useEffect } from 'react'
import Header from './Header'
import defaultUser from '@/public/images/defaultUser.jpg'
import logo from '@/public/images/logo.svg'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/src/stores/user-store'
import {
    ArrowUpLeft,
    CalendarDays,
    Clock3,
    ClipboardList,
    CheckCircle2,
    RotateCcw,
    UserPlus,
    Radio,
    Wallet,
    FileText,
    Users,
    BarChart3,
    Receipt,
} from 'lucide-react'
import {
    HOME_MOCK,
    formatHomeCurrency,
    formatHomeRelativeTime,
} from '@/components/home/home-mock-data'

const QUICK_ACTION_ICONS = {
    'realtime-orders': Radio,
    orders: ClipboardList,
    clients: Users,
    'return-orders': RotateCcw,
    reports: BarChart3,
    invoices: Receipt,
}

const ACTIVITY_ICONS = {
    order_completed: CheckCircle2,
    return_requested: RotateCcw,
    client_registered: UserPlus,
    invoice_paid: Wallet,
}

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

function getGreeting(date) {
    const hour = date.getHours()
    if (hour < 12) return 'صباح الخير'
    if (hour < 17) return 'مساء الخير'
    return 'مساء الخير'
}

function getFirstName(fullName) {
    if (!fullName) return ''
    return fullName.trim().split(/\s+/)[0]
}

function SummaryCard({ label, value, icon: Icon, accent }) {
    return (
        <div className="rounded-2xl border border-[#E8EEEC] bg-white px-4 py-3.5 dark:border-white/[0.06] dark:bg-[#0F1C16]">
            <div className="mb-2 flex items-center justify-between gap-2">
                <span className="text-[11px] font-medium text-[#6B7571] dark:text-white/45">
                    {label}
                </span>
                <span
                    className={`inline-flex size-7 items-center justify-center rounded-lg ${accent}`}
                >
                    <Icon className="size-3.5" strokeWidth={2} />
                </span>
            </div>
            <p className="text-xl font-bold tabular-nums text-[#0A1A16] dark:text-white">
                {value}
            </p>
        </div>
    )
}

export default function HomeWelcomeWrapper() {
    const [now, setNow] = useState(() => new Date())
    const router = useRouter()
    const { user } = useUserStore()
    const firstName = getFirstName(user?.name)
    const roleLabel = user?.role_relation?.name ?? ''
    const time = formatArabicTime(now)
    const date = formatArabicDate(now)
    const greeting = getGreeting(now)

    // Mock until GET /admin/home is ready — see docs/home-api-request.md
    const home = HOME_MOCK
    const { motto, summary, quick_actions: quickActions, recent_activity: activity, primary_cta: cta } =
        home

    useEffect(() => {
        const interval = setInterval(() => setNow(new Date()), 1000)
        return () => clearInterval(interval)
    }, [])

    return (
        <>
            <Header page="welcome" title={null} isMain={true} />

            <div className="flex flex-col gap-5">
                <section className="relative isolate overflow-hidden rounded-[28px] border border-[#E8EEEC] bg-white dark:border-white/[0.08] dark:bg-[#0F1C16]">
                    <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
                        <div className="absolute -top-24 right-[-10%] h-[340px] w-[340px] rounded-full bg-[#0c6055]/[0.07] blur-3xl dark:bg-emerald-400/10" />
                        <div className="absolute bottom-[-20%] left-[-8%] h-[280px] w-[280px] rounded-full bg-[#10B981]/[0.06] blur-3xl dark:bg-teal-500/[0.08]" />
                        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-l from-transparent via-[#0c6055]/25 to-transparent dark:via-emerald-400/30" />
                    </div>

                    <div className="grid gap-10 p-8 max-[1100px]:gap-8 max-[1100px]:p-6 lg:grid-cols-[1.15fr_0.85fr] lg:gap-12 lg:p-10 xl:p-12">
                        <div className="flex min-w-0 flex-col justify-center">
                            <div className="mb-5 flex items-center gap-3">
                                <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-[#0c6055]/10 dark:bg-emerald-400/10">
                                    <Image
                                        src={logo}
                                        alt=""
                                        width={20}
                                        height={26}
                                        className="h-5 w-auto object-contain"
                                        aria-hidden
                                    />
                                </span>
                                <span className="text-xs font-semibold tracking-wide text-[#0c6055] dark:text-emerald-300">
                                    {motto.brand_label}
                                </span>
                            </div>

                            <h1 className="mb-5 max-w-xl text-[clamp(1.75rem,3.2vw,2.5rem)] font-extrabold leading-[1.35] text-[#0A1A16] dark:text-white">
                                {motto.title}
                            </h1>

                            <div className="relative max-w-xl pe-0 ps-5">
                                <span
                                    aria-hidden
                                    className="absolute inset-y-1 start-0 w-[3px] rounded-full bg-gradient-to-b from-[#0c6055] to-[#10B981] dark:from-emerald-400 dark:to-teal-600"
                                />
                                <p className="text-[15px] leading-8 text-[#4A5551] dark:text-white/65">
                                    {motto.body}
                                </p>
                                {motto.verse ? (
                                    <p className="mt-4 text-[15px] font-semibold leading-8 text-[#0c6055] dark:text-emerald-300">
                                        {motto.verse}
                                    </p>
                                ) : null}
                                {motto.footnote ? (
                                    <p className="mt-2 text-sm leading-7 text-[#6B7571] dark:text-white/45">
                                        {motto.footnote}
                                    </p>
                                ) : null}
                            </div>
                        </div>

                        <aside className="flex min-w-0 flex-col justify-center">
                            <div className="rounded-3xl border border-[#E8EEEC] bg-[#F7FAF9]/80 p-7 backdrop-blur-sm dark:border-white/[0.08] dark:bg-[#0B1411]/70 max-[640px]:p-5">
                                <div className="mb-7 flex items-start gap-4">
                                    <div className="relative shrink-0">
                                        <span
                                            aria-hidden
                                            className="absolute -inset-1 rounded-full bg-gradient-to-br from-[#0c6055] to-[#10B981] opacity-90 dark:from-emerald-400 dark:to-teal-600"
                                        />
                                        <Image
                                            src={user?.profile_image || defaultUser}
                                            alt={user?.name ?? 'المستخدم'}
                                            width={72}
                                            height={72}
                                            className="relative h-[72px] w-[72px] rounded-full border-[3px] border-white object-cover dark:border-[#0F1C16]"
                                        />
                                    </div>
                                    <div className="min-w-0 pt-1">
                                        <p className="mb-1 text-xs font-medium text-[#6B7571] dark:text-white/45">
                                            {greeting}
                                        </p>
                                        <h2 className="truncate text-xl font-bold text-[#0A1A16] dark:text-white">
                                            مرحباً بعودتك{firstName ? `، ${firstName}` : ''}
                                        </h2>
                                        {roleLabel ? (
                                            <p className="mt-1 truncate text-sm text-[#5C6763] dark:text-white/55">
                                                {roleLabel}
                                            </p>
                                        ) : null}
                                    </div>
                                </div>

                                <div className="mb-7 grid grid-cols-2 gap-3">
                                    <div className="rounded-2xl border border-[#E8EEEC] bg-white px-4 py-3.5 dark:border-white/[0.06] dark:bg-white/[0.03]">
                                        <div className="mb-2 flex items-center gap-1.5 text-[#6B7571] dark:text-white/40">
                                            <Clock3 className="size-3.5" strokeWidth={2} />
                                            <span className="text-[11px] font-medium">الوقت الآن</span>
                                        </div>
                                        <p className="text-base font-semibold tabular-nums text-[#0A1A16] dark:text-white">
                                            {time}
                                        </p>
                                    </div>
                                    <div className="rounded-2xl border border-[#E8EEEC] bg-white px-4 py-3.5 dark:border-white/[0.06] dark:bg-white/[0.03]">
                                        <div className="mb-2 flex items-center gap-1.5 text-[#6B7571] dark:text-white/40">
                                            <CalendarDays className="size-3.5" strokeWidth={2} />
                                            <span className="text-[11px] font-medium">التاريخ</span>
                                        </div>
                                        <p className="text-base font-semibold tabular-nums text-[#0A1A16] dark:text-white">
                                            {date}
                                        </p>
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    className="group flex h-14 w-full items-center justify-between rounded-2xl bg-[#0c6055] px-5 text-sm font-semibold text-white transition-colors hover:bg-[#0B5345] dark:bg-emerald-500 dark:text-[#0B1411] dark:hover:bg-emerald-400"
                                    onClick={() => router.push(cta?.href || '/home/reports')}
                                >
                                    <span>{cta?.label || 'ابدأ الآن'}</span>
                                    <span className="flex size-9 items-center justify-center rounded-xl bg-white/15 transition-transform duration-300 group-hover:-translate-x-0.5 group-hover:-translate-y-0.5 dark:bg-[#0B1411]/15">
                                        <ArrowUpLeft className="size-5" strokeWidth={2.25} />
                                    </span>
                                </button>
                            </div>
                        </aside>
                    </div>
                </section>

                {/* Summary KPIs — mock */}
                <section className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
                    <SummaryCard
                        label="طلبات معلّقة"
                        value={summary.pending_orders.toLocaleString('ar-EG')}
                        icon={ClipboardList}
                        accent="bg-[#0c6055]/10 text-[#0c6055] dark:bg-emerald-400/10 dark:text-emerald-300"
                    />
                    <SummaryCard
                        label="مكتملة اليوم"
                        value={summary.completed_today.toLocaleString('ar-EG')}
                        icon={CheckCircle2}
                        accent="bg-emerald-500/10 text-emerald-700 dark:bg-emerald-400/10 dark:text-emerald-300"
                    />
                    <SummaryCard
                        label="استرجاعات"
                        value={summary.return_orders.toLocaleString('ar-EG')}
                        icon={RotateCcw}
                        accent="bg-amber-500/10 text-amber-700 dark:bg-amber-400/10 dark:text-amber-300"
                    />
                    <SummaryCard
                        label="عملاء جدد (أسبوع)"
                        value={summary.new_clients_this_week.toLocaleString('ar-EG')}
                        icon={UserPlus}
                        accent="bg-sky-500/10 text-sky-700 dark:bg-sky-400/10 dark:text-sky-300"
                    />
                    <SummaryCard
                        label="طلبات مباشر"
                        value={summary.unreceived_realtime.toLocaleString('ar-EG')}
                        icon={Radio}
                        accent="bg-rose-500/10 text-rose-700 dark:bg-rose-400/10 dark:text-rose-300"
                    />
                    <SummaryCard
                        label="إيراد اليوم"
                        value={formatHomeCurrency(summary.revenue_today, summary.currency)}
                        icon={Wallet}
                        accent="bg-[#0c6055]/10 text-[#0c6055] dark:bg-emerald-400/10 dark:text-emerald-300"
                    />
                </section>

                <div className="grid gap-5 lg:grid-cols-[1fr_1.1fr]">
                    {/* Quick actions — mock */}
                    <section className="rounded-[24px] border border-[#E8EEEC] bg-white p-5 dark:border-white/[0.08] dark:bg-[#0F1C16] sm:p-6">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h3 className="text-base font-bold text-[#0A1A16] dark:text-white">
                                اختصارات سريعة
                            </h3>
                            <span className="rounded-full bg-[#F3F3F3] px-2.5 py-1 text-[10px] font-semibold text-[#686868] dark:bg-white/10 dark:text-white/50">
                                بيانات تجريبية
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-3">
                            {quickActions.map((action) => {
                                const Icon = QUICK_ACTION_ICONS[action.id] || FileText
                                return (
                                    <button
                                        key={action.id}
                                        type="button"
                                        onClick={() => router.push(action.href)}
                                        className="group relative flex flex-col items-start gap-3 rounded-2xl border border-[#E8EEEC] bg-[#F7FAF9] p-4 text-right transition-colors hover:border-[#0c6055]/30 hover:bg-[#0c6055]/[0.04] dark:border-white/[0.06] dark:bg-white/[0.03] dark:hover:border-emerald-400/30 dark:hover:bg-emerald-400/[0.06]"
                                    >
                                        {action.badge_count != null && action.badge_count > 0 ? (
                                            <span className="absolute left-3 top-3 inline-flex min-w-5 items-center justify-center rounded-full bg-[#0c6055] px-1.5 py-0.5 text-[10px] font-bold text-white dark:bg-emerald-400 dark:text-[#0B1411]">
                                                {action.badge_count.toLocaleString('ar-EG')}
                                            </span>
                                        ) : null}
                                        <span className="inline-flex size-9 items-center justify-center rounded-xl bg-white text-[#0c6055] shadow-sm dark:bg-[#0B1411] dark:text-emerald-300">
                                            <Icon className="size-4" strokeWidth={2} />
                                        </span>
                                        <span className="text-13 font-semibold text-[#0A1A16] dark:text-white">
                                            {action.label}
                                        </span>
                                    </button>
                                )
                            })}
                        </div>
                    </section>

                    {/* Recent activity — mock */}
                    <section className="rounded-[24px] border border-[#E8EEEC] bg-white p-5 dark:border-white/[0.08] dark:bg-[#0F1C16] sm:p-6">
                        <div className="mb-4 flex items-center justify-between gap-3">
                            <h3 className="text-base font-bold text-[#0A1A16] dark:text-white">
                                آخر النشاطات
                            </h3>
                            <span className="rounded-full bg-[#F3F3F3] px-2.5 py-1 text-[10px] font-semibold text-[#686868] dark:bg-white/10 dark:text-white/50">
                                بيانات تجريبية
                            </span>
                        </div>
                        <ul className="flex flex-col gap-1">
                            {activity.map((item) => {
                                const Icon = ACTIVITY_ICONS[item.type] || FileText
                                return (
                                    <li key={item.id}>
                                        <button
                                            type="button"
                                            onClick={() => item.href && router.push(item.href)}
                                            className="flex w-full items-start gap-3 rounded-2xl px-3 py-3 text-right transition-colors hover:bg-[#F7FAF9] dark:hover:bg-white/[0.04]"
                                        >
                                            <span className="mt-0.5 inline-flex size-9 shrink-0 items-center justify-center rounded-xl bg-[#0c6055]/10 text-[#0c6055] dark:bg-emerald-400/10 dark:text-emerald-300">
                                                <Icon className="size-4" strokeWidth={2} />
                                            </span>
                                            <span className="min-w-0 flex-1">
                                                <span className="block truncate text-13 font-semibold text-[#0A1A16] dark:text-white">
                                                    {item.title}
                                                </span>
                                                {item.subtitle ? (
                                                    <span className="mt-0.5 block truncate text-xs text-[#6B7571] dark:text-white/45">
                                                        {item.subtitle}
                                                    </span>
                                                ) : null}
                                            </span>
                                            <span className="shrink-0 pt-0.5 text-[11px] text-[#8A9490] dark:text-white/35">
                                                {formatHomeRelativeTime(item.created_at, now)}
                                            </span>
                                        </button>
                                    </li>
                                )
                            })}
                        </ul>
                    </section>
                </div>
            </div>
        </>
    )
}
