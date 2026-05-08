const rateLimit = require("express-rate-limit");

// ── Helper: consistent error response ────────────────────────
const makeMessage = (msg, retryMinutes) => ({
    success: false,
    message: msg,
    retryAfter: `${retryMinutes} minutes`,
});

// ── 1. Auth limiter (login / signup / google) ─────────────────
// 10 attempts per 15 minutes per IP
exports.authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 10,
    standardHeaders: true,   // sends RateLimit-* headers (RFC 6585)
    legacyHeaders: false,    // disable X-RateLimit-* headers
    message: makeMessage(
        "Too many login attempts from this IP. Please try again in 15 minutes.",
        15
    ),
    skipSuccessfulRequests: true, // successful logins don't count toward limit
});

// ── 2. Payment limiter (Razorpay order create + verify) ───────
// 5 attempts per 10 minutes per IP
exports.paymentLimiter = rateLimit({
    windowMs: 10 * 60 * 1000,
    max: 5,
    standardHeaders: true,
    legacyHeaders: false,
    message: makeMessage(
        "Too many payment requests. Please wait 10 minutes before trying again.",
        10
    ),
});

// ── 3. General API limiter ─────────────────────────────────────
// 100 requests per 15 minutes per IP — applies to all /api/* routes
exports.generalLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: makeMessage(
        "Too many requests from this IP. Please try again in 15 minutes.",
        15
    ),
});

// ── 4. Browse / public listing limiter ────────────────────────
// 200 requests per 15 minutes — relaxed for unauthenticated product browsing
exports.browseLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 200,
    standardHeaders: true,
    legacyHeaders: false,
    message: makeMessage(
        "Too many requests. Please slow down and try again in 15 minutes.",
        15
    ),
});
