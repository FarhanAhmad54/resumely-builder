/**
 * Resumely - API Client (Simplified - No Auth)
 * Frontend utilities without authentication
 */

const API = (function () {
    // ==========================================
    // STUB AUTHENTICATION (Always not authenticated)
    // ==========================================

    function isAuthenticated() {
        return false;
    }

    function getUser() {
        return null;
    }

    async function checkAuth() {
        return { authenticated: false };
    }

    async function getCurrentUser() {
        return null;
    }

    // Stub functions to prevent errors if called
    async function register() { return { success: false, error: 'Authentication disabled' }; }
    async function login() { return { success: false, error: 'Authentication disabled' }; }
    async function logout() { return { success: true }; }
    async function changePassword() { return { success: false, error: 'Authentication disabled' }; }

    // Resume operations (disabled without auth)
    async function getResumes() { return { success: false, error: 'Authentication disabled' }; }
    async function getResume() { return { success: false, error: 'Authentication disabled' }; }
    async function createResume() { return { success: false, error: 'Authentication disabled' }; }
    async function updateResume() { return { success: false, error: 'Authentication disabled' }; }
    async function deleteResume() { return { success: false, error: 'Authentication disabled' }; }
    async function setDefaultResume() { return { success: false, error: 'Authentication disabled' }; }
    async function duplicateResume() { return { success: false, error: 'Authentication disabled' }; }

    function init() {
        // No initialization needed without auth
    }

    // ==========================================
    // PUBLIC API
    // ==========================================

    return {
        // Auth (stubs)
        register,
        login,
        logout,
        checkAuth,
        getCurrentUser,
        changePassword,
        isAuthenticated,
        getUser,

        // Resumes (stubs)
        getResumes,
        getResume,
        createResume,
        updateResume,
        deleteResume,
        setDefaultResume,
        duplicateResume,

        // Utility
        init
    };
})();

// Make API available globally
window.API = API;
