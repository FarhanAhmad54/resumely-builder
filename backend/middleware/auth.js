/**
 * Resumely Backend - Authentication Middleware
 * JWT token verification and user authentication
 */

const { verifyToken, getClientIP } = require('../utils/security');
const { statements } = require('../config/db');

/**
 * Middleware to authenticate requests using JWT
 */
function authenticate(req, res, next) {
    try {
        // Get token from header or cookie
        let token = null;

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.status(401).json({
                success: false,
                error: 'Authentication required',
                code: 'NO_TOKEN'
            });
        }

        // Verify token
        const decoded = verifyToken(token);
        if (!decoded) {
            return res.status(401).json({
                success: false,
                error: 'Invalid or expired token',
                code: 'INVALID_TOKEN'
            });
        }

        // Get user from database
        const user = statements.getUserById(decoded.userId);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: 'User not found',
                code: 'USER_NOT_FOUND'
            });
        }

        // Attach user to request
        req.user = user;
        req.userId = user.id;
        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            success: false,
            error: 'Authentication error',
            code: 'AUTH_ERROR'
        });
    }
}

/**
 * Optional authentication - doesn't fail if no token
 */
function optionalAuth(req, res, next) {
    try {
        let token = null;

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (token) {
            const decoded = verifyToken(token);
            if (decoded) {
                const user = statements.getUserById(decoded.userId);
                if (user) {
                    req.user = user;
                    req.userId = user.id;
                }
            }
        }
        next();
    } catch (error) {
        // Continue without authentication
        next();
    }
}

/**
 * Audit logging middleware
 */
function auditLog(action) {
    return (req, res, next) => {
        const originalSend = res.send;

        res.send = function (body) {
            // Log after response
            try {
                const details = JSON.stringify({
                    method: req.method,
                    path: req.path,
                    status: res.statusCode,
                    userAgent: req.headers['user-agent']
                });

                statements.createAuditLog(
                    req.userId || null,
                    action,
                    details,
                    getClientIP(req)
                );
            } catch (err) {
                console.error('Audit log error:', err);
            }

            return originalSend.call(this, body);
        };

        next();
    };
}

module.exports = { authenticate, optionalAuth, auditLog };
