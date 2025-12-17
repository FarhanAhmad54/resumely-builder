/**
 * Resumely Backend - Authentication Routes
 * Signup, login, logout, and password management
 */

const express = require('express');
const router = express.Router();

const { statements } = require('../config/db');
const { authenticate, auditLog } = require('../middleware/auth');
const { authLimiter, registerLimiter } = require('../middleware/rateLimiter');
const { registerValidation, loginValidation, passwordChangeValidation, sanitizeBody } = require('../middleware/validator');
const {
    hashPassword,
    verifyPassword,
    generateToken,
    generateId,
    getClientIP,
    getExpirationDate
} = require('../utils/security');

/**
 * POST /api/auth/register
 * Create a new user account
 */
router.post('/register',
    registerLimiter,
    sanitizeBody,
    registerValidation,
    auditLog('USER_REGISTER'),
    async (req, res) => {
        try {
            const { email, password, name } = req.body;

            // Check if email already exists
            const existingUser = statements.getUserByEmail(email);
            if (existingUser) {
                return res.status(409).json({
                    success: false,
                    error: 'An account with this email already exists',
                    code: 'EMAIL_EXISTS'
                });
            }

            // Hash password
            const passwordHash = await hashPassword(password);

            // Create user
            const userId = generateId();
            statements.createUser(userId, email.toLowerCase(), passwordHash, name || null);

            // Generate token
            const token = generateToken({ userId, email });

            // Set cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
            });

            res.status(201).json({
                success: true,
                message: 'Account created successfully',
                data: {
                    user: {
                        id: userId,
                        email,
                        name: name || null
                    },
                    token
                }
            });
        } catch (error) {
            console.error('Registration error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create account',
                code: 'REGISTER_ERROR'
            });
        }
    }
);

/**
 * POST /api/auth/login
 * Authenticate user and return token
 */
router.post('/login',
    authLimiter,
    sanitizeBody,
    loginValidation,
    auditLog('USER_LOGIN'),
    async (req, res) => {
        try {
            const { email, password } = req.body;

            // Get user
            const user = statements.getUserByEmail(email.toLowerCase());
            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password',
                    code: 'INVALID_CREDENTIALS'
                });
            }

            // Check if account is locked
            if (user.locked_until && new Date(user.locked_until) > new Date()) {
                const lockRemaining = Math.ceil((new Date(user.locked_until) - new Date()) / 60000);
                return res.status(423).json({
                    success: false,
                    error: `Account temporarily locked. Try again in ${lockRemaining} minutes`,
                    code: 'ACCOUNT_LOCKED'
                });
            }

            // Verify password
            const isValid = await verifyPassword(password, user.password_hash);
            if (!isValid) {
                // Increment failed attempts
                statements.incrementFailedLogins(email.toLowerCase());

                // Lock account after 5 failed attempts
                if (user.failed_login_attempts >= 4) {
                    statements.lockAccount(email.toLowerCase());
                }

                return res.status(401).json({
                    success: false,
                    error: 'Invalid email or password',
                    code: 'INVALID_CREDENTIALS'
                });
            }

            // Update last login
            statements.updateLastLogin(user.id);

            // Generate token
            const token = generateToken({ userId: user.id, email: user.email });

            // Set cookie
            res.cookie('token', token, {
                httpOnly: true,
                secure: process.env.NODE_ENV === 'production',
                sameSite: 'lax',
                maxAge: 7 * 24 * 60 * 60 * 1000
            });

            res.json({
                success: true,
                message: 'Login successful',
                data: {
                    user: {
                        id: user.id,
                        email: user.email,
                        name: user.name
                    },
                    token
                }
            });
        } catch (error) {
            console.error('Login error:', error);
            res.status(500).json({
                success: false,
                error: 'Login failed',
                code: 'LOGIN_ERROR'
            });
        }
    }
);

/**
 * POST /api/auth/logout
 * Logout user and clear token
 */
router.post('/logout',
    authenticate,
    auditLog('USER_LOGOUT'),
    (req, res) => {
        try {
            // Clear all user sessions
            statements.deleteUserSessions(req.userId);

            // Clear cookie
            res.clearCookie('token');

            res.json({
                success: true,
                message: 'Logged out successfully'
            });
        } catch (error) {
            console.error('Logout error:', error);
            res.status(500).json({
                success: false,
                error: 'Logout failed',
                code: 'LOGOUT_ERROR'
            });
        }
    }
);

/**
 * GET /api/auth/me
 * Get current user info
 */
router.get('/me', authenticate, (req, res) => {
    res.json({
        success: true,
        data: {
            user: req.user
        }
    });
});

/**
 * PUT /api/auth/password
 * Change password
 */
router.put('/password',
    authenticate,
    sanitizeBody,
    passwordChangeValidation,
    auditLog('PASSWORD_CHANGE'),
    async (req, res) => {
        try {
            const { currentPassword, newPassword } = req.body;

            // Get full user data with password
            const user = statements.getUserByEmail(req.user.email);
            if (!user) {
                return res.status(404).json({
                    success: false,
                    error: 'User not found',
                    code: 'USER_NOT_FOUND'
                });
            }

            // Verify current password
            const isValid = await verifyPassword(currentPassword, user.password_hash);
            if (!isValid) {
                return res.status(401).json({
                    success: false,
                    error: 'Current password is incorrect',
                    code: 'INVALID_PASSWORD'
                });
            }

            // Hash new password
            const newPasswordHash = await hashPassword(newPassword);

            // Update password
            statements.updateUserPassword(newPasswordHash, req.userId);

            // Invalidate all sessions
            statements.deleteUserSessions(req.userId);

            // Clear cookie
            res.clearCookie('token');

            res.json({
                success: true,
                message: 'Password changed successfully. Please login again.'
            });
        } catch (error) {
            console.error('Password change error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to change password',
                code: 'PASSWORD_CHANGE_ERROR'
            });
        }
    }
);

/**
 * GET /api/auth/check
 * Check if user is authenticated (for frontend)
 */
router.get('/check', (req, res) => {
    try {
        let token = null;

        const authHeader = req.headers.authorization;
        if (authHeader && authHeader.startsWith('Bearer ')) {
            token = authHeader.substring(7);
        } else if (req.cookies && req.cookies.token) {
            token = req.cookies.token;
        }

        if (!token) {
            return res.json({ success: true, authenticated: false });
        }

        const { verifyToken } = require('../utils/security');
        const decoded = verifyToken(token);

        if (!decoded) {
            return res.json({ success: true, authenticated: false });
        }

        const user = statements.getUserById(decoded.userId);
        if (!user) {
            return res.json({ success: true, authenticated: false });
        }

        res.json({
            success: true,
            authenticated: true,
            user: {
                id: user.id,
                email: user.email,
                name: user.name
            }
        });
    } catch (error) {
        res.json({ success: true, authenticated: false });
    }
});

module.exports = router;
