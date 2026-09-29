import { NextResponse } from "next/server";
import { proxyApiRequest } from "@/src/lib/api-proxy";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

async function handle(request, context) {
  const params = await context.params;
  return proxyApiRequest(request, params?.path, NextResponse);
}

export const GET = handle;
export const POST = handle;
export const PUT = handle;
export const PATCH = handle;
export const DELETE = handle;
export const HEAD = handle;
