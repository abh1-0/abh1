import type { APIRoute } from 'astro';
import fs from 'node:fs';
import path from 'node:path';
import {
  sanitizeHTML,
  isValidSlug,
  checkRateLimit,
  SECURITY_HEADERS
} from '../../lib/security';

export const prerender = false;

interface CommentItem {
  id: string;
  author: string;
  text: string;
  createdAt: string;
}

interface DB {
  likes: Record<string, number>;
  comments: Record<string, CommentItem[]>;
}

const dbPath = path.join(process.cwd(), 'src', 'data', 'comments_db.json');

function getDB(): DB {
  try {
    if (fs.existsSync(dbPath)) {
      const data = fs.readFileSync(dbPath, 'utf-8');
      return JSON.parse(data);
    }
  } catch (err) {
    console.error('Error reading comments DB:', err);
  }
  return { likes: {}, comments: {} };
}

function saveDB(db: DB) {
  try {
    fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error saving comments DB:', err);
  }
}

function getClientIP(request: Request, clientAddress?: string): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  const realIp = request.headers.get('x-real-ip');
  if (realIp) return realIp.trim();
  return clientAddress || '127.0.0.1';
}

function validateOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  const referer = request.headers.get('referer');
  const host = request.headers.get('host');

  if (!origin && !referer) return true; // Direct/same-origin request fallback

  const checkUrl = origin || referer || '';
  if (!checkUrl) return true;

  try {
    const url = new URL(checkUrl);
    if (host && url.host === host) return true;
    if (url.hostname === 'localhost' || url.hostname === '127.0.0.1' || url.hostname.endsWith('abh1.xyz')) {
      return true;
    }
  } catch {
    return false;
  }
  return false;
}

export const GET: APIRoute = async ({ url, clientAddress }) => {
  const slug = url.searchParams.get('slug');

  // 1. Path Traversal & Slug Validation
  if (!isValidSlug(slug)) {
    return new Response(
      JSON.stringify({ error: 'Invalid or missing slug parameter' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...SECURITY_HEADERS }
      }
    );
  }

  const db = getDB();
  const likes = db.likes[slug] ?? 0;
  const comments = (db.comments[slug] ?? []).map((c) => ({
    ...c,
    // Ensure all stored output is sanitized before returning
    author: sanitizeHTML(c.author),
    text: sanitizeHTML(c.text)
  }));

  return new Response(JSON.stringify({ likes, comments }), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store, max-age=0',
      ...SECURITY_HEADERS
    }
  });
};

export const POST: APIRoute = async ({ request, clientAddress }) => {
  // 2. CSRF / Origin Validation
  if (!validateOrigin(request)) {
    return new Response(
      JSON.stringify({ error: 'Forbidden: CSRF / Origin validation failed' }),
      {
        status: 403,
        headers: { 'Content-Type': 'application/json', ...SECURITY_HEADERS }
      }
    );
  }

  try {
    const body = await request.json();
    const { slug, action, author, text } = body;

    // 3. Path Traversal & Slug Validation
    if (!isValidSlug(slug)) {
      return new Response(
        JSON.stringify({ error: 'Invalid slug identifier' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json', ...SECURITY_HEADERS }
        }
      );
    }

    const clientIp = getClientIP(request, clientAddress);

    // 4. Rate Limiting per IP
    const rateCheck = checkRateLimit(clientIp, action === 'comment' ? 'comment' : 'like');
    if (!rateCheck.allowed) {
      return new Response(
        JSON.stringify({
          error: `Rate limit exceeded. Please wait ${rateCheck.retryAfterSeconds} seconds.`
        }),
        {
          status: 429,
          headers: {
            'Content-Type': 'application/json',
            'Retry-After': String(rateCheck.retryAfterSeconds ?? 60),
            ...SECURITY_HEADERS
          }
        }
      );
    }

    const db = getDB();

    if (action === 'like') {
      db.likes[slug] = (db.likes[slug] ?? 0) + 1;
      saveDB(db);
      return new Response(
        JSON.stringify({ success: true, likes: db.likes[slug] }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...SECURITY_HEADERS }
        }
      );
    }

    if (action === 'comment') {
      // 5. Server-side Input Validation & Length Limits
      if (!text || typeof text !== 'string' || text.trim().length === 0) {
        return new Response(
          JSON.stringify({ error: 'Comment text cannot be empty' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...SECURITY_HEADERS }
          }
        );
      }

      if (text.length > 1000) {
        return new Response(
          JSON.stringify({ error: 'Comment text exceeds maximum allowed length of 1000 characters' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json', ...SECURITY_HEADERS }
          }
        );
      }

      const rawAuthor = (author && typeof author === 'string' && author.trim())
        ? author.trim().substring(0, 50)
        : 'Anonymous Community Member';

      // 6. XSS Input Sanitization & HTML Escaping
      const cleanAuthor = sanitizeHTML(rawAuthor);
      const cleanText = sanitizeHTML(text.trim());

      const newComment: CommentItem = {
        id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        author: cleanAuthor,
        text: cleanText,
        createdAt: new Date().toISOString()
      };

      if (!db.comments[slug]) {
        db.comments[slug] = [];
      }
      db.comments[slug].unshift(newComment);
      saveDB(db);

      return new Response(
        JSON.stringify({ success: true, comments: db.comments[slug] }),
        {
          status: 200,
          headers: { 'Content-Type': 'application/json', ...SECURITY_HEADERS }
        }
      );
    }

    return new Response(
      JSON.stringify({ error: 'Invalid action parameter' }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json', ...SECURITY_HEADERS }
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'Internal Server Error' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json', ...SECURITY_HEADERS }
      }
    );
  }
};
