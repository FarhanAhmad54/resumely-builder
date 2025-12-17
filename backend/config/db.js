/**
 * Resumely Backend - Database Configuration
 * SQLite database using sql.js (pure JavaScript, no native dependencies)
 */

const initSqlJs = require('sql.js');
const path = require('path');
const fs = require('fs');

let db = null;
let SQL = null;

// Ensure data directory exists
const dataDir = path.join(__dirname, '..', 'data');
if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
}

const dbPath = path.join(dataDir, 'resumely.db');

// Initialize database
async function initializeDatabase() {
    try {
        SQL = await initSqlJs();

        // Load existing database or create new one
        if (fs.existsSync(dbPath)) {
            const fileBuffer = fs.readFileSync(dbPath);
            db = new SQL.Database(fileBuffer);
            console.log('✓ Database loaded from file');
        } else {
            db = new SQL.Database();
            console.log('✓ New database created');
        }

        // Create tables
        db.run(`
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                email TEXT UNIQUE NOT NULL,
                password_hash TEXT NOT NULL,
                name TEXT,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now')),
                last_login TEXT,
                is_active INTEGER DEFAULT 1,
                failed_login_attempts INTEGER DEFAULT 0,
                locked_until TEXT
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS resumes (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                name TEXT DEFAULT 'Untitled Resume',
                data TEXT NOT NULL,
                template TEXT DEFAULT 'modern',
                customization TEXT,
                is_default INTEGER DEFAULT 0,
                created_at TEXT DEFAULT (datetime('now')),
                updated_at TEXT DEFAULT (datetime('now')),
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS sessions (
                id TEXT PRIMARY KEY,
                user_id TEXT NOT NULL,
                token_hash TEXT NOT NULL,
                expires_at TEXT NOT NULL,
                created_at TEXT DEFAULT (datetime('now')),
                ip_address TEXT,
                user_agent TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
            )
        `);

        db.run(`
            CREATE TABLE IF NOT EXISTS audit_log (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                action TEXT NOT NULL,
                details TEXT,
                ip_address TEXT,
                created_at TEXT DEFAULT (datetime('now'))
            )
        `);

        // Create indexes
        db.run(`CREATE INDEX IF NOT EXISTS idx_users_email ON users(email)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON resumes(user_id)`);
        db.run(`CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON sessions(user_id)`);

        // Save to disk
        saveDatabase();

        console.log('✓ Database schema initialized');
        return true;
    } catch (error) {
        console.error('Database initialization error:', error);
        throw error;
    }
}

// Save database to disk
function saveDatabase() {
    if (!db) return;
    try {
        const data = db.export();
        const buffer = Buffer.from(data);
        fs.writeFileSync(dbPath, buffer);
    } catch (error) {
        console.error('Error saving database:', error);
    }
}

// Auto-save every 30 seconds
setInterval(() => {
    saveDatabase();
}, 30000);

// Query helpers
const statements = {
    // User operations
    createUser: (id, email, passwordHash, name) => {
        db.run(`INSERT INTO users (id, email, password_hash, name) VALUES (?, ?, ?, ?)`,
            [id, email, passwordHash, name]);
        saveDatabase();
    },

    getUserByEmail: (email) => {
        const result = db.exec(`SELECT * FROM users WHERE email = ? AND is_active = 1`, [email]);
        if (result.length === 0 || result[0].values.length === 0) return null;
        return rowToObject(result[0]);
    },

    getUserById: (id) => {
        const result = db.exec(`SELECT id, email, name, created_at, updated_at, last_login FROM users WHERE id = ? AND is_active = 1`, [id]);
        if (result.length === 0 || result[0].values.length === 0) return null;
        return rowToObject(result[0]);
    },

    updateLastLogin: (id) => {
        db.run(`UPDATE users SET last_login = datetime('now'), failed_login_attempts = 0 WHERE id = ?`, [id]);
        saveDatabase();
    },

    incrementFailedLogins: (email) => {
        db.run(`UPDATE users SET failed_login_attempts = failed_login_attempts + 1 WHERE email = ?`, [email]);
        saveDatabase();
    },

    lockAccount: (email) => {
        db.run(`UPDATE users SET locked_until = datetime('now', '+30 minutes') WHERE email = ?`, [email]);
        saveDatabase();
    },

    updateUserPassword: (passwordHash, id) => {
        db.run(`UPDATE users SET password_hash = ?, updated_at = datetime('now') WHERE id = ?`, [passwordHash, id]);
        saveDatabase();
    },

    // Resume operations
    createResume: (id, userId, name, data, template, customization) => {
        db.run(`INSERT INTO resumes (id, user_id, name, data, template, customization) VALUES (?, ?, ?, ?, ?, ?)`,
            [id, userId, name, data, template, customization]);
        saveDatabase();
    },

    getResumesByUser: (userId) => {
        const result = db.exec(`SELECT id, name, template, is_default, created_at, updated_at FROM resumes WHERE user_id = ? ORDER BY updated_at DESC`, [userId]);
        if (result.length === 0) return [];
        return rowsToArray(result[0]);
    },

    getResumeById: (id, userId) => {
        const result = db.exec(`SELECT * FROM resumes WHERE id = ? AND user_id = ?`, [id, userId]);
        if (result.length === 0 || result[0].values.length === 0) return null;
        return rowToObject(result[0]);
    },

    updateResume: (name, data, template, customization, id, userId) => {
        db.run(`UPDATE resumes SET name = ?, data = ?, template = ?, customization = ?, updated_at = datetime('now') WHERE id = ? AND user_id = ?`,
            [name, data, template, customization, id, userId]);
        saveDatabase();
    },

    deleteResume: (id, userId) => {
        db.run(`DELETE FROM resumes WHERE id = ? AND user_id = ?`, [id, userId]);
        saveDatabase();
    },

    setDefaultResume: (id, userId) => {
        db.run(`UPDATE resumes SET is_default = CASE WHEN id = ? THEN 1 ELSE 0 END WHERE user_id = ?`, [id, userId]);
        saveDatabase();
    },

    // Session operations
    createSession: (id, userId, tokenHash, expiresAt, ipAddress, userAgent) => {
        db.run(`INSERT INTO sessions (id, user_id, token_hash, expires_at, ip_address, user_agent) VALUES (?, ?, ?, ?, ?, ?)`,
            [id, userId, tokenHash, expiresAt, ipAddress, userAgent]);
        saveDatabase();
    },

    getSession: (id) => {
        const result = db.exec(`SELECT * FROM sessions WHERE id = ? AND expires_at > datetime('now')`, [id]);
        if (result.length === 0 || result[0].values.length === 0) return null;
        return rowToObject(result[0]);
    },

    deleteSession: (id) => {
        db.run(`DELETE FROM sessions WHERE id = ?`, [id]);
        saveDatabase();
    },

    deleteUserSessions: (userId) => {
        db.run(`DELETE FROM sessions WHERE user_id = ?`, [userId]);
        saveDatabase();
    },

    cleanExpiredSessions: () => {
        db.run(`DELETE FROM sessions WHERE expires_at < datetime('now')`);
        saveDatabase();
    },

    // Audit operations
    createAuditLog: (userId, action, details, ipAddress) => {
        db.run(`INSERT INTO audit_log (user_id, action, details, ip_address) VALUES (?, ?, ?, ?)`,
            [userId, action, details, ipAddress]);
        saveDatabase();
    }
};

// Helper: Convert sql.js result row to object
function rowToObject(result) {
    if (!result || !result.columns || !result.values || result.values.length === 0) return null;
    const obj = {};
    result.columns.forEach((col, i) => {
        obj[col] = result.values[0][i];
    });
    return obj;
}

// Helper: Convert sql.js result to array of objects
function rowsToArray(result) {
    if (!result || !result.columns || !result.values) return [];
    return result.values.map(row => {
        const obj = {};
        result.columns.forEach((col, i) => {
            obj[col] = row[i];
        });
        return obj;
    });
}

// Clean expired sessions periodically
setInterval(() => {
    try {
        if (db) statements.cleanExpiredSessions();
    } catch (err) {
        console.error('Error cleaning sessions:', err);
    }
}, 3600000); // Every hour

// Graceful shutdown
process.on('SIGTERM', () => {
    console.log('Saving database before shutdown...');
    saveDatabase();
});

process.on('SIGINT', () => {
    console.log('Saving database before shutdown...');
    saveDatabase();
});

module.exports = {
    initializeDatabase,
    statements,
    getDb: () => db,
    saveDatabase
};
