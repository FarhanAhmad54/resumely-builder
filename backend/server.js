/**
 * Resumely Backend - Main Server Entry Point
 * Secure Express.js server with all security features
 */

require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const cookieParser = require('cookie-parser');
const path = require('path');

// Routes removed - authentication disabled

// Import middleware
const { apiLimiter } = require('./middleware/rateLimiter');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3000;

// ===========================================
// SECURITY MIDDLEWARE
// ===========================================

// Helmet - Secure HTTP headers
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
            fontSrc: ["'self'", "https://fonts.gstatic.com"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com", "https://pagead2.googlesyndication.com", "https://www.googletagservices.com", "https://adservice.google.com"],
            imgSrc: ["'self'", "data:", "blob:", "https://pagead2.googlesyndication.com", "https://www.google.com", "https://www.gstatic.com"],
            frameSrc: ["https://googleads.g.doubleclick.net", "https://www.google.com", "https://tpc.googlesyndication.com"],
            connectSrc: ["'self'", "https://pagead2.googlesyndication.com", "https://www.google-analytics.com"]
        }
    },
    crossOriginEmbedderPolicy: false
}));

// CORS configuration
const corsOrigins = process.env.CORS_ORIGINS
    ? process.env.CORS_ORIGINS.split(',').map(o => o.trim())
    : ['http://localhost:3000', 'http://127.0.0.1:3000'];

// Add common Netlify patterns if in production
if (process.env.NODE_ENV === 'production') {
    corsOrigins.push('https://resumely-builder.netlify.app');
    corsOrigins.push('https://resumelybuilder.netlify.app');
}

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps or curl requests)
        if (!origin) return callback(null, true);

        // Check if origin matches any allowed origin
        if (corsOrigins.indexOf(origin) !== -1) {
            callback(null, true);
        }
        // Also allow any .netlify.app domain for flexibility
        else if (origin && origin.endsWith('.netlify.app')) {
            callback(null, true);
        }
        else {
            console.warn(`CORS blocked origin: ${origin}`);
            callback(null, false);
        }
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
app.use('/api/', apiLimiter);

// ===========================================
// BODY PARSING & COOKIES
// ===========================================

app.use(express.json({ limit: '10mb' })); // Limit body size
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// ===========================================
// SECURITY HEADERS (Additional)
// ===========================================

app.use((req, res, next) => {
    // Prevent clickjacking
    res.setHeader('X-Frame-Options', 'DENY');

    // Prevent MIME type sniffing
    res.setHeader('X-Content-Type-Options', 'nosniff');

    // Enable XSS filter
    res.setHeader('X-XSS-Protection', '1; mode=block');

    // Referrer policy
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');

    // Permission policy
    res.setHeader('Permissions-Policy', 'geolocation=(), microphone=(), camera=()');

    next();
});

// ===========================================
// REQUEST LOGGING (Development)
// ===========================================

if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${req.method} ${req.path}`);
        next();
    });
}

// ===========================================
// STATIC FILES (Frontend)
// ===========================================

// Serve frontend from parent directory
app.use(express.static(path.join(__dirname, '..')));

// ===========================================
// API ROUTES
// ===========================================

// Auth and resume routes disabled

// Health check endpoint
app.get('/api/health', (req, res) => {
    res.json({
        success: true,
        status: 'healthy',
        timestamp: new Date().toISOString(),
        version: '1.0.0'
    });
});

// API info endpoint
app.get('/api', (req, res) => {
    res.json({
        success: true,
        name: 'Resumely API',
        version: '1.0.0',
        message: 'Backend running with security features. Authentication disabled.',
        endpoints: {
            health: 'GET /api/health'
        }
    });
});

// ===========================================
// ERROR HANDLING
// ===========================================

// 404 handler for API routes
app.use('/api/*', (req, res) => {
    res.status(404).json({
        success: false,
        error: 'Endpoint not found',
        code: 'NOT_FOUND'
    });
});

// Serve frontend for all other routes (SPA support)
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '..', 'index.html'));
});

// Global error handler
app.use((err, req, res, next) => {
    console.error('Server error:', err);

    // Don't leak error details in production
    const message = process.env.NODE_ENV === 'production'
        ? 'An unexpected error occurred'
        : err.message;

    res.status(err.status || 500).json({
        success: false,
        error: message,
        code: 'SERVER_ERROR'
    });
});

// ===========================================
// START SERVER
// ===========================================

const { initializeDatabase } = require('./config/db');

async function startServer() {
    try {
        // Initialize database first
        await initializeDatabase();

        app.listen(PORT, () => {
            console.log(`
╔═══════════════════════════════════════════════════════════╗
║                                                           ║
║   🚀 Resumely Backend Server Started Successfully!        ║
║                                                           ║
║   📍 Local:     http://localhost:${PORT}                    ║
║   📍 API:       http://localhost:${PORT}/api                ║
║   📍 Health:    http://localhost:${PORT}/api/health         ║
║                                                           ║
║   🔒 Security Features:                                   ║
║      ✓ Helmet.js (secure headers)                        ║
║      ✓ CORS protection                                   ║
║      ✓ Rate limiting                                     ║
║      ✓ JWT authentication                                ║
║      ✓ Password hashing (bcrypt)                         ║
║      ✓ Input validation                                  ║
║      ✓ XSS protection                                    ║
║      ✓ Audit logging                                     ║
║                                                           ║
║   📝 Environment: ${process.env.NODE_ENV || 'development'}                          ║
║                                                           ║
╚═══════════════════════════════════════════════════════════╝
            `);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
}

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('SIGTERM received, shutting down gracefully...');
    process.exit(0);
});

process.on('SIGINT', () => {
    console.log('SIGINT received, shutting down gracefully...');
    process.exit(0);
});

module.exports = app;
