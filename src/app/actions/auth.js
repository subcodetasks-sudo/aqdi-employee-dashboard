'use server'

import { cookies } from 'next/headers'

export async function setAuthCookie(token, remember = true) {
  const cookieStore = await cookies()
  const options = {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: false, // Set to false so it can be read by client if needed, but middleware will use it
  }
  // Session-only cookie (clears when the browser closes) when "remember me" is off
  if (remember) {
    options.maxAge = 60 * 60 * 24 * 30 // 30 days
  }
  cookieStore.set('token', token, options)
}

export async function removeAuthCookie() {
  const cookieStore = await cookies()
  cookieStore.delete('token')
}
