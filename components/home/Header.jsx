'use client';
import React from 'react'
import mainPagesHeaderIcon from '@/public/images/mainPagesHeaderIcon.svg'
import notificationIcon from '@/public/images/notificationIcon.svg'
import defaultUser from '@/public/images/defaultUser.jpg'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from "@/components/ui/button"
import { DropdownMenu, DropdownMenuContent, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuPortal, DropdownMenuSeparator, DropdownMenuShortcut, DropdownMenuSub, DropdownMenuSubContent, DropdownMenuSubTrigger, DropdownMenuTrigger, } from "@/components/ui/dropdown-menu"
import { useRouter, usePathname } from 'next/navigation'
import { isOrdersRelatedPath } from '@/src/lib/order-routes'
import OrderMessagesNav from '@/components/Orders/messages/order-messages-nav'
import { useUserStore } from '@/src/stores/user-store'
import { useSidebarStore } from '@/src/stores/sidebar-store'
import { useLogout } from '@/src/hooks/useLogout'
import { usePermissions } from '@/src/hooks/usePermissions'
import { PERMISSION_SECTIONS } from '@/src/lib/permissions'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { LuLogOut } from 'react-icons/lu'

export default function Header({orderId, isSingleOrder, page, title, isMain, first, firstURL, second, third, thirdURL, secondURL }) {
    const router = useRouter();
    const pathname = usePathname();
    const showOrderMessages = isOrdersRelatedPath(pathname);
    const { user } = useUserStore();
    const { setDisplayedPart, displayedPart, setOrderId, isSidebarOpen, toggleSidebar, setSidebarOpen } = useSidebarStore();
    const { logout, logoutLoading } = useLogout();
    const { can } = usePermissions();

    const redirectToEmployeePage = (view) => {
        if (!user?.id) {
            toast.error('تعذر تحديد حساب المستخدم');
            return;
        }
        const url = view ? `/home/employees/${user.id}?view=${view}` : `/home/employees/${user.id}`;
        router.push(url);
    };
    return (
        <div className={`mb-7 transition-all duration-300 ${
            isSidebarOpen
              ? "max-w-[calc(100vw-305px)] max-[1200px]:max-w-[calc(100vw-60px)]"
              : "max-w-full"
          }`}>
        <div className={`grid items-center gap-3 ${showOrderMessages ? "grid-cols-[1fr_auto_1fr]" : "grid-cols-[1fr_auto]"}`}>
            <div className="flex items-center gap-2.5 min-w-0">
                {
                    isMain ?
                        <button
                            type="button"
                            onClick={toggleSidebar}
                            aria-label={isSidebarOpen ? 'إغلاق القائمة الجانبية' : 'فتح القائمة الجانبية'}
                            aria-expanded={isSidebarOpen}
                            className="w-[52px] h-[52px] rounded-full bg-brand-hover transition-all duration-300 flex items-center justify-center hover:bg-brand-main hover:scale-105"
                        >
                            <Image src={mainPagesHeaderIcon} alt="" className="w-4 h-auto object-contain" />
                        </button> :
                        <button className="w-[52px] h-[52px] rounded-full bg-[#F3F3F3] transition-all duration-300 flex items-center justify-center hover:bg-[#eee] hover:scale-105" onClick={() => { router.back() }}>
                            <i className="fa-solid fa-arrow-right"></i>
                        </button>
                }
                <div className="max-[992px]:hidden">
                    {
                        title ?
                            <h2 className="text-lg font-bold text-black mb-1.5">{title}</h2>
                            : null
                    }
                    <div className="flex items-center gap-2.5">
                        {
                            first ?
                                <Link href={firstURL} className="text-[14px] text-[#424242] transition-all hover:text-brand-main">{first}</Link>
                                : null
                        }
                        {
                            second ?
                                <>
                                    <i className="fa-solid fa-chevron-left text-[14px] text-[#424242]"></i>
                                    <Link href={secondURL} className="text-[14px] text-[#424242] transition-all hover:text-brand-main">{second}</Link>
                                </>
                                : null
                        }
                        {
                            third ?
                                <>
                                    <i className="fa-solid fa-chevron-left text-[14px] text-[#424242]"></i>
                                    <Link href={thirdURL} className="text-[14px] text-[#424242] transition-all hover:text-brand-main">{third}</Link>
                                </>
                                : null
                        }
                    </div>

                </div>
            </div>

            {showOrderMessages ? (
                <div className="justify-self-center max-[1100px]:hidden relative z-40 pointer-events-auto">
                    <OrderMessagesNav />
                </div>
            ) : null}

            <div className="flex items-center gap-2.5 justify-end min-w-0">
                {
                    isSingleOrder ?
                        <button onClick={() => {
                            setOrderId(orderId);
                            if (displayedPart === "comments") {
                              setDisplayedPart("default");
                              return;
                            }
                            setSidebarOpen(true);
                            setDisplayedPart("comments");
                        }} className={` ${displayedPart === "comments" ? "bg-brand-main" : " bg-[#F3F3F3]"} w-[52px] h-[52px] rounded-full transition-all duration-300 flex items-center justify-center hover:bg-[#eee] hover:scale-105`} aria-label="تعليقات الطلب"><i className={`fa-regular fa-comments text-[18px] ${displayedPart === "comments" ? "text-white" : "text-[#4D4D4D]"}`}></i></button>
                        :
                        null
                }
                <button onClick={() => {
                    if (displayedPart === "notification") {
                        setDisplayedPart("default");
                    } else {
                        setSidebarOpen(true);
                        setDisplayedPart("notification");
                    }
                }} className={` ${displayedPart === "notification" ? "bg-brand-main" : " bg-[#F3F3F3]"} w-[52px] h-[52px] rounded-full transition-all duration-300 flex items-center justify-center hover:bg-[#eee] hover:scale-105`}><Image src={notificationIcon} alt="Aakdi" className="w-[20px] h-auto object-contain" /></button>
                <div className="h-[52px] bg-[#F3F3F3] rounded-[26px] flex items-center gap-2.5 p-[6px_10px] transition-all duration-300 hover:bg-[#eee] hover:scale-105 max-[992px]:w-[52px] max-[992px]:p-0 justify-center">
                    <Image
                        src={user?.profile_image || defaultUser}
                        alt="Aakdi"
                        width={39}
                        height={39}
                        className="w-[39px] h-[39px] object-cover rounded-full overflow-hidden max-[992px]:w-full max-[992px]:h-full"
                    />
                    <div className="max-[992px]:hidden">
                        <h3 className="text-[12px] font-medium text-black">{user?.name}</h3>
                        <span className="text-[10px] font-normal text-[#4D4D4D]">{user?.role_relation?.name}</span>
                    </div>
                </div>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="w-[52px] h-[52px] rounded-full !bg-black !text-white border-none shadow-none hover:!bg-[#424242] transition-all duration-300 flex items-center justify-center hover:scale-105">
                            <i className="fa-solid fa-chevron-down"></i>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 text-right" align="start" dir="rtl">
                        <DropdownMenuLabel>حسابي</DropdownMenuLabel>
                        <DropdownMenuGroup>
                            <DropdownMenuItem onClick={() => redirectToEmployeePage('profile')}>
                                الملف الشخصي
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => redirectToEmployeePage()}>
                                الفوترة
                            </DropdownMenuItem>
                            {can(PERMISSION_SECTIONS.settings, 'view') && (
                                <DropdownMenuItem onClick={() => router.push('/home/settings')}>
                                    الإعدادات
                                </DropdownMenuItem>
                            )}
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                            onSelect={(e) => {
                                e.preventDefault();
                                if (!logoutLoading) logout();
                            }}
                            disabled={logoutLoading}
                            className="text-red-600 focus:text-red-600 cursor-pointer"
                        >
                            <span className="flex items-center justify-between w-full gap-2">
                                <span>تسجيل الخـــروج</span>
                                {logoutLoading ? (
                                    <Loader2 className="size-4 animate-spin shrink-0" />
                                ) : (
                                    <LuLogOut className="size-4 shrink-0" />
                                )}
                            </span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </div>

        {showOrderMessages ? (
            <div className="hidden max-[1100px]:flex justify-center mt-4 relative z-40 pointer-events-auto">
                <OrderMessagesNav />
            </div>
        ) : null}
        </div>
    )
}
