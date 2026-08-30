"use client";

import dynamic from "next/dynamic";
import Loader from "@/components/home/loader";

const ContractStepEditorInner = dynamic(
  () =>
    import("./contract-step-editor").then((mod) => ({
      default: mod.ContractStepEditor,
    })),
  {
    ssr: false,
    loading: () => (
      <div className="flex min-h-[120px] items-center justify-center">
        <Loader />
      </div>
    ),
  }
);

export { ContractStepEditorInner as ContractStepEditor };
