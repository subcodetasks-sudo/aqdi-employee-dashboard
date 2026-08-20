"use client";

export default function ContractStatusFormFields({ values, onChange }) {
  const set = (patch) => onChange?.({ ...values, ...patch });

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3">
        <label className="text-[13px] font-bold px-1">
          اسم الحالة <span className="text-[#FF4D4F] mr-1">*</span>
        </label>
        <input
          type="text"
          placeholder="ادخل اسم الحالة هنــا ..."
          value={values.name}
          onChange={(e) => set({ name: e.target.value })}
          className="w-full h-[54px] bg-[#F9F9F9] dark:bg-white/[0.04] border border-[#EEEEEE] dark:border-white/10 rounded-[16px] px-5 text-[15px] focus:outline-none focus:border-[#0B5345] font-medium text-right"
        />
      </div>

      <div className="flex flex-col gap-3">
        <label className="text-[13px] font-bold px-1">شرح للعميل</label>
        <textarea
          placeholder="شرح يظهر للعميل عند هذه الحالة..."
          value={values.client_explanation ?? ""}
          onChange={(e) => set({ client_explanation: e.target.value })}
          rows={3}
          className="w-full min-h-[96px] bg-[#F9F9F9] dark:bg-white/[0.04] border border-[#EEEEEE] dark:border-white/10 rounded-[16px] px-5 py-3 text-[15px] focus:outline-none focus:border-[#0B5345] font-medium text-right resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-6">
        <div className="flex flex-col gap-3">
          <label className="text-[13px] font-bold px-1">لون النص</label>
          <div className="relative">
            <input
              type="text"
              value={values.color_text}
              onChange={(e) => set({ color_text: e.target.value })}
              className="w-full h-[54px] bg-[#F9F9F9] dark:bg-white/[0.04] border border-[#EEEEEE] dark:border-white/10 rounded-[16px] pr-5 pl-14 text-[15px] focus:outline-none focus:border-[#0B5345] font-bold text-right"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden ring-1 ring-[#EEEEEE]">
              <input
                type="color"
                value={values.color_text || "#FFFFFF"}
                onChange={(e) => set({ color_text: e.target.value })}
                className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer"
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <label className="text-[13px] font-bold px-1">
            لون الخلفية <span className="text-[#FF4D4F] mr-1">*</span>
          </label>
          <div className="relative">
            <input
              type="text"
              value={values.color}
              onChange={(e) => set({ color: e.target.value })}
              className="w-full h-[54px] bg-[#F9F9F9] dark:bg-white/[0.04] border border-[#EEEEEE] dark:border-white/10 rounded-[16px] pr-5 pl-14 text-[15px] focus:outline-none focus:border-[#0B5345] font-bold text-right"
            />
            <div className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-white shadow-sm overflow-hidden ring-1 ring-[#EEEEEE]">
              <input
                type="color"
                value={values.color || "#22C55E"}
                onChange={(e) => set({ color: e.target.value })}
                className="absolute inset-[-50%] w-[200%] h-[200%] cursor-pointer"
              />
            </div>
          </div>
        </div>
      </div>

      <label className="flex items-center justify-between gap-3 px-1">
        <span className="text-[13px] font-bold">الحالة نشطة</span>
        <input
          type="checkbox"
          checked={values.is_active !== false}
          onChange={(e) => set({ is_active: e.target.checked })}
          className="size-5 accent-[#0B5345]"
        />
      </label>
    </div>
  );
}
