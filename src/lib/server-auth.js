import {
  canAccessRoute,
  getFirstAllowedHref,
  normalizeUserPermissions,
} from '@/src/lib/permissions';

const MAX_SNAPSHOT_BYTES = 3500;

function encodeBase64Url(value) {
  const bytes = new TextEncoder().encode(value);
  let binary = '';
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function decodeBase64Url(encoded) {
  const base64 = encoded.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64 + '='.repeat((4 - (base64.length % 4)) % 4);
  const binary = atob(padded);
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

/** Compact auth snapshot stored in an edge-readable cookie for route gating. */
export function buildAuthSnapshot(user) {
  if (!user) return null;

  const permissions = normalizeUserPermissions(user);
  const snapshot = {
    sa: user.is_system_admin === true,
    p: permissions,
  };

  const encoded = encodeBase64Url(JSON.stringify(snapshot));
  if (encoded.length > MAX_SNAPSHOT_BYTES) {
    return { sa: snapshot.sa, p: [] };
  }

  return snapshot;
}

export function encodeAuthSnapshot(snapshot) {
  if (!snapshot) return null;
  return encodeBase64Url(JSON.stringify(snapshot));
}

export function parseAuthSnapshot(raw) {
  if (!raw) return null;

  try {
    const parsed = JSON.parse(decodeBase64Url(raw));
    if (!parsed || typeof parsed !== 'object') return null;
    return {
      sa: parsed.sa === true,
      p: Array.isArray(parsed.p) ? parsed.p : [],
    };
  } catch {
    return null;
  }
}

export function snapshotToUser(snapshot) {
  if (!snapshot) return null;
  return {
    is_system_admin: snapshot.sa,
    permissions: snapshot.p,
  };
}

export function canAccessRouteFromSnapshot(pathname, snapshot) {
  if (!snapshot) return true;
  const user = snapshotToUser(snapshot);
  return canAccessRoute(pathname, snapshot.p, user);
}

export function getFirstAllowedHrefFromSnapshot(snapshot) {
  if (!snapshot) return '/home';
  const user = snapshotToUser(snapshot);
  return getFirstAllowedHref(snapshot.p, user);
}
