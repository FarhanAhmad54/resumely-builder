/**
 * Resumely Backend - Input Validator Middleware
 * Request validation and sanitization
 */

const { body, param, validationResult } = require('express-validator');
const { sanitizeObject } = require('../utils/security');

/**
 * Handle validation errors
 */
function handleValidationErrors(req, res, next) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({
            success: false,
            error: 'Validation failed',
            details: errors.array().map(err => ({
                field: err.path,
                message: err.msg
            }))
        });
    }
    next();
}

/**
 * Sanitize request body middleware
 */
function sanitizeBody(req, res, next) {
    if (req.body && typeof req.body === 'object') {
        req.body = sanitizeObject(req.body);
    }
    next();
}

/**
 * Registration validation rules
 */
const registerValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail()
        .isLength({ max: 255 })
        .withMessage('Email must be less than 255 characters'),

    body('password')
        .isLength({ min: 8 })
        .withMessage('Password must be at least 8 characters')
        .isLength({ max: 128 })
        .withMessage('Password must be less than 128 characters')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number'),

    body('name')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Name must be between 1 and 100 characters'),

    handleValidationErrors
];

/**
 * Login validation rules
 */
const loginValidation = [
    body('email')
        .isEmail()
        .withMessage('Please provide a valid email address')
        .normalizeEmail(),

    body('password')
        .notEmpty()
        .withMessage('Password is required'),

    handleValidationErrors
];

/**
 * Password change validation rules
 */
const passwordChangeValidation = [
    body('currentPassword')
        .notEmpty()
        .withMessage('Current password is required'),

    body('newPassword')
        .isLength({ min: 8 })
        .withMessage('New password must be at least 8 characters')
        .matches(/[A-Z]/)
        .withMessage('Password must contain at least one uppercase letter')
        .matches(/[a-z]/)
        .withMessage('Password must contain at least one lowercase letter')
        .matches(/[0-9]/)
        .withMessage('Password must contain at least one number')
        .custom((value, { req }) => {
            if (value === req.body.currentPassword) {
                throw new Error('New password must be different from current password');
            }
            return true;
        }),

    handleValidationErrors
];

/**
 * Resume validation rules
 */
const resumeValidation = [
    body('name')
        .optional()
        .trim()
        .isLength({ min: 1, max: 100 })
        .withMessage('Resume name must be between 1 and 100 characters'),

    body('data')
        .isObject()
        .withMessage('Resume data must be an object'),

    body('template')
        .optional()
        .isIn(['modern', 'classic', 'creative', 'minimal', 'ats', 'executive', 'tech', 'elegant', 'bold', 'timeline'])
        .withMessage('Invalid template'),

    body('customization')
        .optional()
        .isObject()
        .withMessage('Customization must be an object'),

    handleValidationErrors
];

/**
 * Resume ID parameter validation
 */
const resumeIdValidation = [
    param('id')
        .isUUID()
        .withMessage('Invalid resume ID'),

    handleValidationErrors
];

module.exports = {
    handleValidationErrors,
    sanitizeBody,
    registerValidation,
    loginValidation,
    passwordChangeValidation,
    resumeValidation,
    resumeIdValidation
};
