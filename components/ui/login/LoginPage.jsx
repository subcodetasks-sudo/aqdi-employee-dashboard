'use client';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import bluelogo from '@/public/images/blue-logo.svg';
import waving from '@/public/images/waving.svg';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormField, FormItem, FormControl, FormMessage, FormLabel } from '@/components/ui/form';
import Image from 'next/image';
import { useState } from 'react';
import Link from 'next/link';
import { ArrowUpRight, Eye, EyeOff } from 'lucide-react';
import { useMutation } from '@tanstack/react-query';
import { axiosInstance } from '@/src/utils/axios';
import { useUserStore } from '@/src/stores/user-store';
import { useRouter } from 'next/navigation';
import { setAuthCookie } from '@/src/app/actions/auth';
import { enrichUserWithRolePermissions } from '@/src/lib/permissions';
import { toast } from 'sonner';

export default function LoginPage() {
  const { setAuth } = useUserStore();
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);

  const FormSchema = z.object({
    email: z.string().email('يرجى إدخال بريد إلكتروني صحيح.'),
    password: z.string().min(6, 'كلمة المرور يجب أن تكون 6 أحرف على الأقل.'),
    remember: z.boolean().optional(),
  });
  
  const form = useForm({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: '',
      password: '',
      remember: false,
    },
  });
  

  const {mutate ,isPending}=useMutation({
    mutationFn:async(data)=>{
      const res = await axiosInstance.post('/admin/employees/login', {
        email: data.email,
        password: data.password,
      })
      return res.data
    },
    // Only auto-retry genuine connection failures (no response received) -
    // wrong credentials (4xx with a response) should surface immediately, not retry.
    retry: (failureCount, error) => !error?.response && failureCount < 2,
    retryDelay: (attemptIndex) => (attemptIndex === 0 ? 800 : 1500),
    onSuccess: async (response, variables) => {
      if (response?.success && response?.data?.token) {
        try {
          const userWithPermissions = await enrichUserWithRolePermissions(
            response.data,
            (roleId) => axiosInstance.get(`/admin/roles/${roleId}`).then((res) => res?.data)
          );
          toast.success(response?.message || "تم تسجيل الدخول بنجاح");
          setAuth(userWithPermissions, userWithPermissions?.token, variables.remember);
          await setAuthCookie(userWithPermissions?.token, variables.remember);
          router.push('/home');
        } catch (error) {
          console.error('Login post-processing error:', error);
          toast.error('حدث خطأ أثناء إكمال تسجيل الدخول');
        }
        return;
      }

      toast.error(response?.message || 'بيانات الدخول غير صحيحة');
    },
    onError: (error) => {
      const message =
        error?.response?.data?.message ||
        (error?.message === 'Network Error'
          ? 'تعذر الاتصال بالخادم، تحقق من اتصالك بالإنترنت'
          : 'حدث خطأ أثناء تسجيل الدخول');
      toast.error(message);
      console.error('Login error:', error);
    }
  })
  const onSubmit = (formdata) => {
    mutate(formdata);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-[#FAFAFA] relative overflow-hidden p-4" dir="rtl">
      <div className="w-full max-w-[580px] bg-white rounded-[40px] border border-[#F0F0F0] shadow-2xl p-[50px_60px] relative z-10 max-[768px]:p-8 max-[480px]:p-6 max-[480px]:rounded-[24px]">
        <div className="flex flex-col items-center text-center mb-10">
          <Link href="/" className="flex items-center gap-3  transition-transform hover:scale-105">
            <Image
              src={bluelogo}
              alt="عقدي"
              width={96}
              height={96}
              className="w-24 h-24 object-contain"
              priority
            />
          </Link>
          <Image src={waving} alt="" width={40} height={40} className="w-10 h-auto object-contain mb-4" aria-hidden />
          <p className="text-[18px]  text-[#363636]">لوحة تحكم الموظفين.</p>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-6">
            <FormField name="email" control={form.control} render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-2.5">
                  <FormLabel className="text-[14px]  text-black flex items-center gap-1">
                    البريـــد الإلكتـــرونـــي <span className="text-[#FF4444]">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input 
                        type="email" 
                        className="h-[54px] rounded-[16px] border-[#EEEEEE] bg-white px-5 text-right focus-visible:ring-1 focus-visible:ring-brand-main focus-visible:border-brand-main text-[14px] placeholder:text-[#C4C4C4]" 
                        placeholder="... أدخل بريدك الإلكتروني هنا" 
                        {...field} 
                    />
                  </FormControl>
                </div>
                <FormMessage className="text-[#FF4444] text-[12px] mt-1" />
              </FormItem>
            )} />
            
            <FormField name="password" control={form.control} render={({ field }) => (
              <FormItem>
                <div className="flex flex-col gap-2.5">
                  <FormLabel className="text-[14px]  text-black flex items-center gap-1">
                    كلمة المرور <span className="text-[#FF4444]">*</span>
                  </FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input 
                          type={showPassword ? 'text' : 'password'}
                          className="h-[54px] rounded-[16px] border-[#EEEEEE] bg-white px-5 pl-12 text-right focus-visible:ring-1 focus-visible:ring-brand-main focus-visible:border-brand-main text-[14px] placeholder:text-[#C4C4C4]" 
                          placeholder="... أدخل كلمة المرور هنا"  
                          {...field} 
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword((prev) => !prev)}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-[#A3A3A3] hover:text-[#363636] transition-colors"
                        aria-label={showPassword ? 'إخفاء كلمة المرور' : 'إظهار كلمة المرور'}
                      >
                        {showPassword ? (
                          <EyeOff className="size-5" strokeWidth={1.5} />
                        ) : (
                          <Eye className="size-5" strokeWidth={1.5} />
                        )}
                      </button>
                    </div>
                  </FormControl>
                </div>
                <FormMessage className="text-[#FF4444] text-[12px] mt-1" />
              </FormItem>
            )} />
            
            <FormField name="remember" control={form.control} render={({ field }) => (
              <FormItem>
                <FormControl>
                  <label className="flex items-center gap-2.5 cursor-pointer group w-fit">
                    <div className="relative flex items-center justify-center w-5 h-5">
                      <input
                        type="checkbox"
                        className="peer appearance-none w-5 h-5 rounded border-2 border-[#D9D9D9] bg-white checked:bg-brand-main checked:border-brand-main transition-all cursor-pointer"
                        checked={!!field.value}
                        onChange={field.onChange}
                      />
                      <i className="fa-solid fa-check absolute text-white text-[10px] opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                    <span className="text-[14px] text-[#363636] group-hover:text-black transition-colors">تذكرني</span>
                  </label>
                </FormControl>
              </FormItem>
            )} />
            
            <div className="mt-2">
              <Button
                type="submit"
                className="w-full h-[58px] rounded-[20px] bg-[#0004E2] hover:bg-[#0003c4] text-white  text-[16px] transition-all duration-300 flex items-center justify-between px-6 shadow-none"
                disabled={isPending}
              >
                <span>{isPending ? 'جار التحقق ...' : 'تسجيل الدخول'}</span>
                {!isPending && (
                  <span className="w-9 h-9 rounded-[10px] bg-white flex items-center justify-center shrink-0">
                    <ArrowUpRight className="size-5 text-[#0004E2]" strokeWidth={2.5} />
                  </span>
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}
