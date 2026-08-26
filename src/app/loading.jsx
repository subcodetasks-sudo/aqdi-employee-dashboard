/**
 * Root-segment fallback (e.g. /login). Kept minimal and non-fixed so it never
 * paints a fullscreen overlay over the home shell when that layout is mounting.
 */
export default function Loading() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center gap-4 bg-[#F4F6F5] dark:bg-[#0B1411]">
      <div className="relative size-12">
        <div className="absolute inset-0 rounded-full border-[3px] border-[#E3E8E6] dark:border-white/10" />
        <div className="absolute inset-0 rounded-full border-[3px] border-brand-dark border-t-transparent dark:border-emerald-400 dark:border-t-transparent animate-spin" />
      </div>
      <p className="text-sm font-bold text-brand-dark dark:text-emerald-300">
        جــارٍ التحميـــل ...
      </p>
    </div>
  );
}
