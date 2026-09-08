"use client";

import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";

/**
 * Card + header + <Form> + submit button shared by every content-admin section form.
 * Put the section's fields as children.
 */
export default function SectionFormShell({
  title,
  description,
  form,
  onSubmit,
  isPending,
  submitLabel,
  submitDisabled = false,
  formClassName = "space-y-5",
  headerExtra = null,
  children,
}) {
  return (
    <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-card dark:shadow-none">
      <div className="mb-6 flex items-start justify-between gap-4 max-md:flex-col">
        <div>
          <h2 className="text-lg font-black text-black dark:text-white">{title}</h2>
          <p className="mt-2 max-w-2xl text-sm leading-7 text-[#707070] dark:text-white/55">
            {description}
          </p>
        </div>
        {headerExtra}
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className={formClassName}>
          {children}

          <Button
            type="submit"
            disabled={isPending || submitDisabled}
            className="h-12 rounded-full bg-brand-main px-8 text-sm font-bold text-white hover:bg-brand-hover"
          >
            {isPending ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                جاري الحفظ...
              </>
            ) : (
              submitLabel
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
