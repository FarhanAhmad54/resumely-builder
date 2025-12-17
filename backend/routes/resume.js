/**
 * Resumely Backend - Resume Routes
 * CRUD operations for resumes
 */

const express = require('express');
const router = express.Router();

const { statements } = require('../config/db');
const { authenticate, auditLog } = require('../middleware/auth');
const { resumeValidation, resumeIdValidation, sanitizeBody } = require('../middleware/validator');
const { exportLimiter } = require('../middleware/rateLimiter');
const { generateId, sanitizeObject } = require('../utils/security');

/**
 * GET /api/resumes
 * Get all resumes for the authenticated user
 */
router.get('/', authenticate, (req, res) => {
    try {
        const resumes = statements.getResumesByUser(req.userId);

        res.json({
            success: true,
            data: {
                resumes: resumes.map(r => ({
                    id: r.id,
                    name: r.name,
                    template: r.template,
                    isDefault: Boolean(r.is_default),
                    createdAt: r.created_at,
                    updatedAt: r.updated_at
                })),
                count: resumes.length
            }
        });
    } catch (error) {
        console.error('Get resumes error:', error);
        res.status(500).json({
            success: false,
            error: 'Failed to fetch resumes',
            code: 'FETCH_ERROR'
        });
    }
});

/**
 * GET /api/resumes/:id
 * Get a specific resume
 */
router.get('/:id',
    authenticate,
    resumeIdValidation,
    (req, res) => {
        try {
            const resume = statements.getResumeById(req.params.id, req.userId);

            if (!resume) {
                return res.status(404).json({
                    success: false,
                    error: 'Resume not found',
                    code: 'NOT_FOUND'
                });
            }

            res.json({
                success: true,
                data: {
                    resume: {
                        id: resume.id,
                        name: resume.name,
                        data: JSON.parse(resume.data),
                        template: resume.template,
                        customization: resume.customization ? JSON.parse(resume.customization) : null,
                        isDefault: Boolean(resume.is_default),
                        createdAt: resume.created_at,
                        updatedAt: resume.updated_at
                    }
                }
            });
        } catch (error) {
            console.error('Get resume error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to fetch resume',
                code: 'FETCH_ERROR'
            });
        }
    }
);

/**
 * POST /api/resumes
 * Create a new resume
 */
router.post('/',
    authenticate,
    sanitizeBody,
    resumeValidation,
    auditLog('RESUME_CREATE'),
    (req, res) => {
        try {
            const { name, data, template, customization } = req.body;

            const resumeId = generateId();
            const sanitizedData = sanitizeObject(data);

            statements.createResume(
                resumeId,
                req.userId,
                name || 'Untitled Resume',
                JSON.stringify(sanitizedData),
                template || 'modern',
                customization ? JSON.stringify(customization) : null
            );

            res.status(201).json({
                success: true,
                message: 'Resume created successfully',
                data: {
                    resume: {
                        id: resumeId,
                        name: name || 'Untitled Resume',
                        template: template || 'modern'
                    }
                }
            });
        } catch (error) {
            console.error('Create resume error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to create resume',
                code: 'CREATE_ERROR'
            });
        }
    }
);

/**
 * PUT /api/resumes/:id
 * Update a resume
 */
router.put('/:id',
    authenticate,
    resumeIdValidation,
    sanitizeBody,
    resumeValidation,
    auditLog('RESUME_UPDATE'),
    (req, res) => {
        try {
            const { name, data, template, customization } = req.body;

            // Check if resume exists and belongs to user
            const existing = statements.getResumeById(req.params.id, req.userId);
            if (!existing) {
                return res.status(404).json({
                    success: false,
                    error: 'Resume not found',
                    code: 'NOT_FOUND'
                });
            }

            const sanitizedData = sanitizeObject(data);

            statements.updateResume(
                name || existing.name,
                JSON.stringify(sanitizedData),
                template || existing.template,
                customization ? JSON.stringify(customization) : existing.customization,
                req.params.id,
                req.userId
            );

            res.json({
                success: true,
                message: 'Resume updated successfully',
                data: {
                    resume: {
                        id: req.params.id,
                        name: name || existing.name,
                        template: template || existing.template,
                        updatedAt: new Date().toISOString()
                    }
                }
            });
        } catch (error) {
            console.error('Update resume error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to update resume',
                code: 'UPDATE_ERROR'
            });
        }
    }
);

/**
 * DELETE /api/resumes/:id
 * Delete a resume
 */
router.delete('/:id',
    authenticate,
    resumeIdValidation,
    auditLog('RESUME_DELETE'),
    (req, res) => {
        try {
            // Check if resume exists and belongs to user
            const existing = statements.getResumeById(req.params.id, req.userId);
            if (!existing) {
                return res.status(404).json({
                    success: false,
                    error: 'Resume not found',
                    code: 'NOT_FOUND'
                });
            }

            statements.deleteResume(req.params.id, req.userId);

            res.json({
                success: true,
                message: 'Resume deleted successfully'
            });
        } catch (error) {
            console.error('Delete resume error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to delete resume',
                code: 'DELETE_ERROR'
            });
        }
    }
);

/**
 * POST /api/resumes/:id/default
 * Set a resume as default
 */
router.post('/:id/default',
    authenticate,
    resumeIdValidation,
    auditLog('RESUME_SET_DEFAULT'),
    (req, res) => {
        try {
            // Check if resume exists and belongs to user
            const existing = statements.getResumeById(req.params.id, req.userId);
            if (!existing) {
                return res.status(404).json({
                    success: false,
                    error: 'Resume not found',
                    code: 'NOT_FOUND'
                });
            }

            statements.setDefaultResume(req.params.id, req.userId);

            res.json({
                success: true,
                message: 'Default resume updated'
            });
        } catch (error) {
            console.error('Set default resume error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to set default resume',
                code: 'UPDATE_ERROR'
            });
        }
    }
);

/**
 * POST /api/resumes/:id/duplicate
 * Duplicate a resume
 */
router.post('/:id/duplicate',
    authenticate,
    resumeIdValidation,
    auditLog('RESUME_DUPLICATE'),
    (req, res) => {
        try {
            // Get original resume
            const original = statements.getResumeById(req.params.id, req.userId);
            if (!original) {
                return res.status(404).json({
                    success: false,
                    error: 'Resume not found',
                    code: 'NOT_FOUND'
                });
            }

            // Create duplicate
            const newId = generateId();
            const newName = `${original.name} (Copy)`;

            statements.createResume(
                newId,
                req.userId,
                newName,
                original.data,
                original.template,
                original.customization
            );

            res.status(201).json({
                success: true,
                message: 'Resume duplicated successfully',
                data: {
                    resume: {
                        id: newId,
                        name: newName,
                        template: original.template
                    }
                }
            });
        } catch (error) {
            console.error('Duplicate resume error:', error);
            res.status(500).json({
                success: false,
                error: 'Failed to duplicate resume',
                code: 'DUPLICATE_ERROR'
            });
        }
    }
);

module.exports = router;
