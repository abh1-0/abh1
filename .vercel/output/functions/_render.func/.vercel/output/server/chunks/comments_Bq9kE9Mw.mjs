import { t as __exportAll } from "./rolldown-runtime_D7D4PA-g.mjs";
import fs from "node:fs";
import nodePath from "node:path";
//#region src/lib/security.ts
/**
* Server-side HTML Escaping & XSS Sanitization
* Converts dangerous HTML special characters to safe HTML entities.
*/
function sanitizeHTML(str) {
	if (typeof str !== "string") return "";
	return str.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#x27;").replace(/\//g, "&#x2F;").replace(/`/g, "&#x60;");
}
/**
* Validates slug format to prevent Path Traversal or Injection attacks.
*/
function isValidSlug(slug) {
	return typeof slug === "string" && /^[a-zA-Z0-9_-]{1,100}$/.test(slug);
}
var rateLimitStore = /* @__PURE__ */ new Map();
setInterval(() => {
	const now = Date.now();
	for (const [key, record] of rateLimitStore.entries()) {
		record.timestamps = record.timestamps.filter((ts) => now - ts < 6e5);
		if (record.timestamps.length === 0) rateLimitStore.delete(key);
	}
}, 6e5);
function checkRateLimit(ip, action) {
	const now = Date.now();
	const windowMs = action === "comment" ? 3e5 : 6e4;
	const maxAllowed = action === "comment" ? 5 : 20;
	const key = `${ip}:${action}`;
	const record = rateLimitStore.get(key) || { timestamps: [] };
	record.timestamps = record.timestamps.filter((ts) => now - ts < windowMs);
	if (record.timestamps.length >= maxAllowed) {
		const oldest = record.timestamps[0];
		return {
			allowed: false,
			retryAfterSeconds: Math.ceil((oldest + windowMs - now) / 1e3)
		};
	}
	record.timestamps.push(now);
	rateLimitStore.set(key, record);
	return { allowed: true };
}
/**
* Secure HTTP Headers (Content Security Policy, X-Content-Type-Options, etc.)
*/
var SECURITY_HEADERS = {
	"Content-Security-Policy": "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self'; frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self';",
	"X-Content-Type-Options": "nosniff",
	"X-Frame-Options": "DENY",
	"X-XSS-Protection": "1; mode=block",
	"Referrer-Policy": "strict-origin-when-cross-origin",
	"Permissions-Policy": "camera=(), microphone=(), geolocation=()"
};
//#endregion
//#region src/pages/api/comments.ts
var comments_exports = /* @__PURE__ */ __exportAll({
	GET: () => GET,
	POST: () => POST,
	prerender: () => false
});
var dbPath = nodePath.join(process.cwd(), "src", "data", "comments_db.json");
function getDB() {
	try {
		if (fs.existsSync(dbPath)) {
			const data = fs.readFileSync(dbPath, "utf-8");
			return JSON.parse(data);
		}
	} catch (err) {
		console.error("Error reading comments DB:", err);
	}
	return {
		likes: {},
		comments: {}
	};
}
function saveDB(db) {
	try {
		fs.writeFileSync(dbPath, JSON.stringify(db, null, 2), "utf-8");
	} catch (err) {
		console.error("Error saving comments DB:", err);
	}
}
function getClientIP(request, clientAddress) {
	const forwarded = request.headers.get("x-forwarded-for");
	if (forwarded) return forwarded.split(",")[0].trim();
	const realIp = request.headers.get("x-real-ip");
	if (realIp) return realIp.trim();
	return clientAddress || "127.0.0.1";
}
function validateOrigin(request) {
	const origin = request.headers.get("origin");
	const referer = request.headers.get("referer");
	const host = request.headers.get("host");
	if (!origin && !referer) return true;
	const checkUrl = origin || referer || "";
	if (!checkUrl) return true;
	try {
		const url = new URL(checkUrl);
		if (host && url.host === host) return true;
		if (url.hostname === "localhost" || url.hostname === "127.0.0.1" || url.hostname.endsWith("abh1.xyz")) return true;
	} catch {
		return false;
	}
	return false;
}
var GET = async ({ url, clientAddress }) => {
	const slug = url.searchParams.get("slug");
	if (!isValidSlug(slug)) return new Response(JSON.stringify({ error: "Invalid or missing slug parameter" }), {
		status: 400,
		headers: {
			"Content-Type": "application/json",
			...SECURITY_HEADERS
		}
	});
	const db = getDB();
	const likes = db.likes[slug] ?? 0;
	const comments = (db.comments[slug] ?? []).map((c) => ({
		...c,
		author: sanitizeHTML(c.author),
		text: sanitizeHTML(c.text)
	}));
	return new Response(JSON.stringify({
		likes,
		comments
	}), {
		status: 200,
		headers: {
			"Content-Type": "application/json",
			"Cache-Control": "no-store, max-age=0",
			...SECURITY_HEADERS
		}
	});
};
var POST = async ({ request, clientAddress }) => {
	if (!validateOrigin(request)) return new Response(JSON.stringify({ error: "Forbidden: CSRF / Origin validation failed" }), {
		status: 403,
		headers: {
			"Content-Type": "application/json",
			...SECURITY_HEADERS
		}
	});
	try {
		const { slug, action, author, text } = await request.json();
		if (!isValidSlug(slug)) return new Response(JSON.stringify({ error: "Invalid slug identifier" }), {
			status: 400,
			headers: {
				"Content-Type": "application/json",
				...SECURITY_HEADERS
			}
		});
		const rateCheck = checkRateLimit(getClientIP(request, clientAddress), action === "comment" ? "comment" : "like");
		if (!rateCheck.allowed) return new Response(JSON.stringify({ error: `Rate limit exceeded. Please wait ${rateCheck.retryAfterSeconds} seconds.` }), {
			status: 429,
			headers: {
				"Content-Type": "application/json",
				"Retry-After": String(rateCheck.retryAfterSeconds ?? 60),
				...SECURITY_HEADERS
			}
		});
		const db = getDB();
		if (action === "like") {
			db.likes[slug] = (db.likes[slug] ?? 0) + 1;
			saveDB(db);
			return new Response(JSON.stringify({
				success: true,
				likes: db.likes[slug]
			}), {
				status: 200,
				headers: {
					"Content-Type": "application/json",
					...SECURITY_HEADERS
				}
			});
		}
		if (action === "comment") {
			if (!text || typeof text !== "string" || text.trim().length === 0) return new Response(JSON.stringify({ error: "Comment text cannot be empty" }), {
				status: 400,
				headers: {
					"Content-Type": "application/json",
					...SECURITY_HEADERS
				}
			});
			if (text.length > 1e3) return new Response(JSON.stringify({ error: "Comment text exceeds maximum allowed length of 1000 characters" }), {
				status: 400,
				headers: {
					"Content-Type": "application/json",
					...SECURITY_HEADERS
				}
			});
			const cleanAuthor = sanitizeHTML(author && typeof author === "string" && author.trim() ? author.trim().substring(0, 50) : "Anonymous Community Member");
			const cleanText = sanitizeHTML(text.trim());
			const newComment = {
				id: `c_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
				author: cleanAuthor,
				text: cleanText,
				createdAt: (/* @__PURE__ */ new Date()).toISOString()
			};
			if (!db.comments[slug]) db.comments[slug] = [];
			db.comments[slug].unshift(newComment);
			saveDB(db);
			return new Response(JSON.stringify({
				success: true,
				comments: db.comments[slug]
			}), {
				status: 200,
				headers: {
					"Content-Type": "application/json",
					...SECURITY_HEADERS
				}
			});
		}
		return new Response(JSON.stringify({ error: "Invalid action parameter" }), {
			status: 400,
			headers: {
				"Content-Type": "application/json",
				...SECURITY_HEADERS
			}
		});
	} catch (err) {
		return new Response(JSON.stringify({ error: "Internal Server Error" }), {
			status: 500,
			headers: {
				"Content-Type": "application/json",
				...SECURITY_HEADERS
			}
		});
	}
};
//#endregion
//#region \0virtual:astro:page:src/pages/api/comments@_@ts
var page = () => comments_exports;
//#endregion
export { page };
