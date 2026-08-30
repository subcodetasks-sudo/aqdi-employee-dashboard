'use server';

import { cookies } from 'next/headers';
import { buildAuthSnapshot, encodeAuthSnapshot } from '@/src/lib/server-auth';

const TOKEN_COOKIE = 'token';
const SNAPSHOT_COOKIE = 'auth_snapshot';

function cookieOptions(remember = true) {
  const options = {
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    httpOnly: false,
  };

  if (remember) {
    options.maxAge = 60 * 60 * 24 * 30;
  }

  return options;
}

export async function setAuthCookie(token, remember = true) {
  const cookieStore = await cookies();
  cookieStore.set(TOKEN_COOKIE, token, cookieOptions(remember));
}

export async function setAuthSnapshotCookie(user, remember = true) {
  const snapshot = buildAuthSnapshot(user);
  const encoded = encodeAuthSnapshot(snapshot);
  if (!encoded) return;

  const cookieStore = await cookies();
  cookieStore.set(SNAPSHOT_COOKIE, encoded, cookieOptions(remember));
}

/** Writes token + permission snapshot cookies after login or permission refresh. */
export async function setAuthSessionCookies(token, user, remember = true) {
  await setAuthCookie(token, remember);
  if (user) {
    await setAuthSnapshotCookie(user, remember);
  }
}

export async function removeAuthCookie() {
  const cookieStore = await cookies();
  cookieStore.delete(TOKEN_COOKIE);
  cookieStore.delete(SNAPSHOT_COOKIE);
}
