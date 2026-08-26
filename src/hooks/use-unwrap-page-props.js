"use client";

import { use } from "react";

const EMPTY = Promise.resolve({});

/**
 * Unwrap Next.js 15 async page props (`params` / `searchParams` Promises).
 * Prevents sync-dynamic-apis warnings when tools enumerate component props
 * (e.g. Cursor inspector Object.keys on the Promise proxies).
 */
export function useUnwrapPageProps(params, searchParams) {
  use(params ?? EMPTY);
  use(searchParams ?? EMPTY);
}
