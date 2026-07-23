"use client";

import Image from "next/image";
import { Shield } from "lucide-react";

function isImageUrl(value) {
  if (!value || typeof value !== "string") return false;
  return (
    value.startsWith("http://") ||
    value.startsWith("https://") ||
    value.startsWith("/") ||
    value.startsWith("data:")
  );
}

function toFaClass(icon) {
  if (!icon) return null;
  const trimmed = String(icon).trim();
  if (!trimmed) return null;
  if (trimmed.includes("fa-")) {
    if (trimmed.includes("fa-solid") || trimmed.includes("fa-regular") || trimmed.includes("fa-brands")) {
      return trimmed;
    }
    return `fa-solid ${trimmed}`;
  }
  return `fa-solid fa-${trimmed}`;
}

export default function TenantRoleIcon({ icon, className = "size-9", size = 18 }) {
  if (!icon) {
    return (
      <div
        className={`flex items-center justify-center rounded-xl border border-[#E4E4E4] bg-white text-[#A3A3A3] ${className}`}
      >
        <Shield size={size} />
      </div>
    );
  }

  if (isImageUrl(icon)) {
    return (
      <div
        className={`relative overflow-hidden rounded-xl border border-[#E4E4E4] bg-white ${className}`}
      >
        <Image src={icon} alt="" fill className="object-contain p-1" unoptimized />
      </div>
    );
  }

  const faClass = toFaClass(icon);
  return (
    <div
      className={`flex items-center justify-center rounded-xl border border-[#E4E4E4] bg-white text-brand-main ${className}`}
      title={icon}
    >
      <i className={faClass} style={{ fontSize: size }} aria-hidden />
    </div>
  );
}
