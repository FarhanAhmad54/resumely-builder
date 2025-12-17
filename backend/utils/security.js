/**
 * Resumely Backend - Security Utilities
 * Password hashing, token generation, and security helpers
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const BCRYPT_ROUNDS = parseInt(process.env.BCRYPT_ROUNDS) || 12;
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

/**
 * Hash a password using bcrypt
 */
async function hashPassword(password) {
    return bcrypt.hash(password, BCRYPT_ROUNDS);
}

/**
 * Verify a password against a hash
 */
async function verifyPassword(password, hash) {
    return bcrypt.compare(password, hash);
}

/**
 * Generate a JWT token
 */
function generateToken(payload, expiresIn = JWT_EXPIRES_IN) {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

/**
 * Verify and decode a JWT token
 */
function verifyToken(token) {
    try {
        return jwt.verify(token, JWT_SECRET);
    } catch (error) {
        return null;
    }
}

/**
 * Generate a random UUID
 */
function generateId() {
    return crypto.randomUUID();
}

/**
 * Generate a secure random token (for session IDs, etc.)
 */
function generateSecureToken(length = 32) {
    return crypto.randomBytes(length).toString('hex');
}

/**
 * Hash a token for storage (don't store raw tokens)
 */
function hashToken(token) {
    return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Sanitize user input to prevent XSS
 */
function sanitizeInput(input) {
    if (typeof input !== 'string') return input;
    return input
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#x27;')
        .replace(/\//g, '&#x2F;');
}

/**
 * Deep sanitize an object
 */
function sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return sanitizeInput(obj);
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    const sanitized = {};
    for (const [key, value] of Object.entries(obj)) {
        sanitized[sanitizeInput(key)] = sanitizeObject(value);
    }
    return sanitized;
}

/**
 * Validate email format
 */
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

/**
 * Validate password strength
 */
function isStrongPassword(password) {
    // At least 8 characters, 1 uppercase, 1 lowercase, 1 number
    const minLength = password.length >= 8;
    const hasUpper = /[A-Z]/.test(password);
    const hasLower = /[a-z]/.test(password);
    const hasNumber = /[0-9]/.test(password);

    return {
        valid: minLength && hasUpper && hasLower && hasNumber,
        errors: [
            !minLength && 'Password must be at least 8 characters',
            !hasUpper && 'Password must contain an uppercase letter',
            !hasLower && 'Password must contain a lowercase letter',
            !hasNumber && 'Password must contain a number'
        ].filter(Boolean)
    };
}

/**
 * Get client IP address from request
 */
function getClientIP(req) {
    return req.ip ||
        req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
        req.connection?.remoteAddress ||
        'unknown';
}

/**
 * Calculate token expiration date
 */
function getExpirationDate(expiresIn = JWT_EXPIRES_IN) {
    const match = expiresIn.match(/^(\d+)([dhms])$/);
    if (!match) return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // Default 7 days

    const value = parseInt(match[1]);
    const unit = match[2];

    const multipliers = {
        's': 1000,
        'm': 60 * 1000,
        'h': 60 * 60 * 1000,
        'd': 24 * 60 * 60 * 1000
    };

    return new Date(Date.now() + value * multipliers[unit]);
}

module.exports = {
    hashPassword,
    verifyPassword,
    generateToken,
    verifyToken,
    generateId,
    generateSecureToken,
    hashToken,
    sanitizeInput,
    sanitizeObject,
    isValidEmail,
    isStrongPassword,
    getClientIP,
    getExpirationDate
};
