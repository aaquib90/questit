const textEncoder = new TextEncoder();
const textDecoder = new TextDecoder();
const keyCache = new Map();

function base64UrlDecode(segment) {
  if (!segment || typeof segment !== 'string') {
    throw new Error('Invalid JWT segment');
  }
  const normalized = segment.replace(/-/g, '+').replace(/_/g, '/');
  const padded = normalized + '='.repeat((4 - (normalized.length % 4 || 4)) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i += 1) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

async function importHmacKey(secret) {
  if (keyCache.has(secret)) {
    return keyCache.get(secret);
  }
  const keyMaterial = textEncoder.encode(secret);
  const key = await crypto.subtle.importKey(
    'raw',
    keyMaterial,
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['verify']
  );
  keyCache.set(secret, key);
  return key;
}

function createAuthError(message, status = 401) {
  const error = new Error(message);
  error.status = status;
  return error;
}

export function getBearerToken(request) {
  const header = request.headers.get('authorization') || request.headers.get('Authorization');
  if (!header) return null;
  const [scheme, value] = header.split(' ');
  if (!scheme || scheme.toLowerCase() !== 'bearer') {
    return null;
  }
  return value?.trim() || null;
}

export async function verifySupabaseJwt(token, env) {
  if (!env.SUPABASE_JWT_SECRET) {
    throw createAuthError('SUPABASE_JWT_SECRET is not configured.', 500);
  }
  const parts = token.split('.');
  if (parts.length !== 3) {
    throw createAuthError('Invalid authorization token.', 401);
  }
  const [encodedHeader, encodedPayload, encodedSignature] = parts;
  const key = await importHmacKey(env.SUPABASE_JWT_SECRET);
  const unsigned = `${encodedHeader}.${encodedPayload}`;
  const signatureBytes = base64UrlDecode(encodedSignature);
  const dataBytes = textEncoder.encode(unsigned);
  const isValid = await crypto.subtle.verify('HMAC', key, signatureBytes, dataBytes);
  if (!isValid) {
    throw createAuthError('Invalid authorization token.', 401);
  }

  const headerJson = JSON.parse(textDecoder.decode(base64UrlDecode(encodedHeader)));
  if ((headerJson.alg || '').toUpperCase() !== 'HS256') {
    throw createAuthError('Unsupported token algorithm.', 401);
  }

  const payload = JSON.parse(textDecoder.decode(base64UrlDecode(encodedPayload)));
  if (payload.exp && Date.now() >= payload.exp * 1000) {
    throw createAuthError('Authorization token has expired.', 401);
  }
  return payload;
}

export async function requireSupabaseUser(request, env) {
  const token = getBearerToken(request);
  if (!token) {
    throw createAuthError('Authorization header is required.', 401);
  }
  const payload = await verifySupabaseJwt(token, env);
  const userId = payload.sub || payload.user_id || payload.userId || null;
  if (!userId) {
    throw createAuthError('Authorization token is missing a subject.', 401);
  }
  return { token, userId, payload };
}

export async function getOptionalSupabaseUser(request, env) {
  const token = getBearerToken(request);
  if (!token) {
    return { token: null, userId: null, payload: null };
  }
  try {
    const payload = await verifySupabaseJwt(token, env);
    const userId = payload.sub || payload.user_id || payload.userId || null;
    return { token, userId, payload };
  } catch (error) {
    return { token: null, userId: null, payload: null, error };
  }
}

export default {
  getBearerToken,
  verifySupabaseJwt,
  requireSupabaseUser,
  getOptionalSupabaseUser
};

