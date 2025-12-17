/**
 * Resumely - API Client
 * Frontend integration with the backend API
 */

const API = (function () {
    // Determine API base URL based on environment
    // In production (Netlify), use the Render backend URL
    // In development (localhost), use relative path
    const isProduction = window.location.hostname !== 'localhost' &&
        window.location.hostname !== '127.0.0.1';
    const BASE_URL = isProduction
        ? 'https://resumely.onrender.com/api'  // Your Render backend URL
        : '/api';

    let authToken = null;
    let currentUser = null;

    // ==========================================
    // HTTP REQUEST HELPER
    // ==========================================

    async function request(endpoint, options = {}) {
        const url = `${BASE_URL}${endpoint}`;

        const config = {
            headers: {
                'Content-Type': 'application/json',
                ...options.headers
            },
            credentials: 'include', // Include cookies
            ...options
        };

        // Add auth token if available
        if (authToken) {
            config.headers['Authorization'] = `Bearer ${authToken}`;
        }

        // Stringify body if it's an object
        if (config.body && typeof config.body === 'object') {
            config.body = JSON.stringify(config.body);
        }

        try {
            const response = await fetch(url, config);
            const data = await response.json();

            if (!response.ok) {
                throw {
                    status: response.status,
                    ...data
                };
            }

            return data;
        } catch (error) {
            // Network error
            if (error instanceof TypeError) {
                throw {
                    success: false,
                    error: 'Network error. Please check your connection.',
                    code: 'NETWORK_ERROR'
                };
            }
            throw error;
        }
    }

    // ==========================================
    // AUTHENTICATION
    // ==========================================

    async function register(email, password, name = '') {
        const result = await request('/auth/register', {
            method: 'POST',
            body: { email, password, name }
        });

        if (result.success && result.data) {
            authToken = result.data.token;
            currentUser = result.data.user;
            saveTokenToStorage(authToken);
        }

        return result;
    }

    async function login(email, password) {
        const result = await request('/auth/login', {
            method: 'POST',
            body: { email, password }
        });

        if (result.success && result.data) {
            authToken = result.data.token;
            currentUser = result.data.user;
            saveTokenToStorage(authToken);
        }

        return result;
    }

    async function logout() {
        try {
            await request('/auth/logout', { method: 'POST' });
        } catch (e) {
            // Continue with local logout even if server fails
        }

        authToken = null;
        currentUser = null;
        removeTokenFromStorage();

        return { success: true };
    }

    async function checkAuth() {
        try {
            const result = await request('/auth/check');
            if (result.success && result.authenticated) {
                currentUser = result.user;
                return { authenticated: true, user: result.user };
            }
        } catch (e) {
            // Not authenticated
        }
        return { authenticated: false };
    }

    async function getCurrentUser() {
        if (currentUser) return currentUser;

        try {
            const result = await request('/auth/me');
            if (result.success && result.data) {
                currentUser = result.data.user;
                return currentUser;
            }
        } catch (e) {
            // Not authenticated
        }
        return null;
    }

    async function changePassword(currentPassword, newPassword) {
        return await request('/auth/password', {
            method: 'PUT',
            body: { currentPassword, newPassword }
        });
    }

    // ==========================================
    // RESUME OPERATIONS
    // ==========================================

    async function getResumes() {
        return await request('/resumes');
    }

    async function getResume(id) {
        return await request(`/resumes/${id}`);
    }

    async function createResume(resumeData) {
        return await request('/resumes', {
            method: 'POST',
            body: resumeData
        });
    }

    async function updateResume(id, resumeData) {
        return await request(`/resumes/${id}`, {
            method: 'PUT',
            body: resumeData
        });
    }

    async function deleteResume(id) {
        return await request(`/resumes/${id}`, {
            method: 'DELETE'
        });
    }

    async function setDefaultResume(id) {
        return await request(`/resumes/${id}/default`, {
            method: 'POST'
        });
    }

    async function duplicateResume(id) {
        return await request(`/resumes/${id}/duplicate`, {
            method: 'POST'
        });
    }

    // ==========================================
    // TOKEN STORAGE (with fallback to localStorage)
    // ==========================================

    function saveTokenToStorage(token) {
        try {
            localStorage.setItem('resumely_token', token);
        } catch (e) {
            console.warn('Could not save token to localStorage');
        }
    }

    function loadTokenFromStorage() {
        try {
            return localStorage.getItem('resumely_token');
        } catch (e) {
            return null;
        }
    }

    function removeTokenFromStorage() {
        try {
            localStorage.removeItem('resumely_token');
        } catch (e) {
            // Ignore
        }
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    function init() {
        // Load token from storage
        const storedToken = loadTokenFromStorage();
        if (storedToken) {
            authToken = storedToken;
        }
    }

    function isAuthenticated() {
        return !!authToken;
    }

    function getUser() {
        return currentUser;
    }

    // Initialize on load
    init();

    // ==========================================
    // PUBLIC API
    // ==========================================

    return {
        // Auth
        register,
        login,
        logout,
        checkAuth,
        getCurrentUser,
        changePassword,
        isAuthenticated,
        getUser,

        // Resumes
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
