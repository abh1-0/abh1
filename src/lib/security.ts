import crypto from 'node:crypto';

/**
 * Server-side HTML Escaping & XSS Sanitization
 * Converts dangerous HTML special characters to safe HTML entities.
 */
export function sanitizeHTML(str: string): string {
  if (typeof str !== 'string') return '';
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;')
    .replace(/`/g, '&#x60;');
}

/**
 * Validates slug format to prevent Path Traversal or Injection attacks.
 */
export function isValidSlug(slug: unknown): slug is string {
  return typeof slug === 'string' && /^[a-zA-Z0-9_-]{1,100}$/.test(slug);
}

/**
 * Sliding Window In-Memory Rate Limiter by IP Address.
 */
interface RateLimitRecord {
  timestamps: number[];
}

const rateLimitStore = new Map<string, RateLimitRecord>();

// Cleanup stale rate limit records every 10 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, record] of rateLimitStore.entries()) {
    record.timestamps = record.timestamps.filter((ts) => now - ts < 600000);
    if (record.timestamps.length === 0) {
      rateLimitStore.delete(key);
    }
  }
}, 600000);

export function checkRateLimit(
  ip: string,
  action: 'comment' | 'like'
): { allowed: boolean; retryAfterSeconds?: number } {
  const now = Date.now();
  const windowMs = action === 'comment' ? 300000 : 60000; // 5 min for comments, 1 min for likes
  const maxAllowed = action === 'comment' ? 5 : 20; // max 5 comments / 5 min, 20 likes / 1 min

  const key = `${ip}:${action}`;
  const record = rateLimitStore.get(key) || { timestamps: [] };

  // Filter timestamps within the current window
  record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);

  if (record.timestamps.length >= maxAllowed) {
    const oldest = record.timestamps[0];
    const retryAfterSeconds = Math.ceil((oldest + windowMs - now) / 1000);
    return { allowed: false, retryAfterSeconds };
  }

  record.timestamps.push(now);
  rateLimitStore.set(key, record);
  return { allowed: true };
}

/**
 * CSRF Protection Utilities
 */
export function generateCSRFToken(): string {
  return crypto.randomBytes(32).toString('hex');
}

export function validateCSRFToken(
  tokenFromClient: string | null,
  tokenFromSession: string | null
): boolean {
  if (!tokenFromClient || !tokenFromSession) return false;
  try {
    return crypto.timingSafeEqual(
      Buffer.from(tokenFromClient),
      Buffer.from(tokenFromSession)
    );
  } catch {
    return false;
  }
}

/**
 * Secure HTTP Headers (Content Security Policy, X-Content-Type-Options, etc.)
 */
export const SECURITY_HEADERS = {
  'Content-Security-Policy':
    "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';",
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()'
};
