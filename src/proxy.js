import { NextResponse } from 'next/server';

export function proxy(request) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // 1. Redirect authenticated users away from login page
  if (pathname.startsWith('/login')) {
    if (token) {
      return NextResponse.redirect(new URL('/home', request.url));
    }
  }

  // 2. Protect /home and other private routes
  if (pathname.startsWith('/home')) {
    if (!token) {
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  return NextResponse.next();
}

// See "Matching Paths" below to learn more
export const config = {
  matcher: [
    '/login',
    '/home/:path*',
  ],
};
