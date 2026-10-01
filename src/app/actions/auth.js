'use server';

import { cookies } from 'next/headers';
import { clearAuthCookies } from '@/src/lib/auth-cookies';

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  clearAuthCookies(cookieStore);
}
