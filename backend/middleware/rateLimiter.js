/**
 * Resumely Backend - Rate Limiter Middleware
 * Prevents brute-force attacks and abuse
 */

const rateLimit = require('express-rate-limit');

// General API rate limiter
const apiLimiter = rateLimit({
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
    max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
    message: {
        success: false,
        error: 'Too many requests, please try again later',
        code: 'RATE_LIMIT_EXCEEDED'
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req) => {
        return req.ip || req.headers['x-forwarded-for'] || 'unknown';
    }
});

// Strict limiter for authentication endpoints
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 5, // 5 attempts per 15 minutes
    message: {
        success: false,
        error: 'Too many login attempts, please try again in 15 minutes',
        code: 'AUTH_RATE_LIMIT'
    },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: true, // Don't count successful logins
    keyGenerator: (req) => {
        // Rate limit by IP + email combination for login
        const email = req.body?.email || '';
        const ip = req.ip || req.headers['x-forwarded-for'] || 'unknown';
        return `${ip}:${email}`;
    }
});

// Password reset limiter
const passwordResetLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3, // 3 password reset requests per hour
    message: {
        success: false,
        error: 'Too many password reset requests, please try again later',
        code: 'RESET_RATE_LIMIT'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Registration limiter
const registerLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 registrations per hour per IP
    message: {
        success: false,
        error: 'Too many accounts created, please try again later',
        code: 'REGISTER_RATE_LIMIT'
    },
    standardHeaders: true,
    legacyHeaders: false
});

// Export limiter (PDF generation can be resource-intensive)
const exportLimiter = rateLimit({
    windowMs: 60 * 1000, // 1 minute
    max: 10, // 10 exports per minute
    message: {
        success: false,
        error: 'Too many export requests, please wait a moment',
        code: 'EXPORT_RATE_LIMIT'
    },
    standardHeaders: true,
    legacyHeaders: false
});

module.exports = {
    apiLimiter,
    authLimiter,
    passwordResetLimiter,
    registerLimiter,
    exportLimiter
};
