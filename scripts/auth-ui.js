/**
 * Resumely - Authentication UI
 * Login, Register, and Account Management UI
 */

const AuthUI = (function () {
    let isOpen = false;
    let currentMode = 'login'; // 'login', 'register', 'account'

    // ==========================================
    // CREATE MODAL HTML
    // ==========================================

    function createModal() {
        const modal = document.createElement('div');
        modal.id = 'authModal';
        modal.className = 'modal';
        modal.innerHTML = `
            <div class="modal-backdrop"></div>
            <div class="modal-content">
                <div class="modal-header">
                    <h3 id="authModalTitle">Sign In</h3>
                    <button class="modal-close" data-close>&times;</button>
                </div>
                <div class="modal-body">
                    <!-- Login Form -->
                    <form id="loginForm" class="auth-form">
                        <div class="form-group">
                            <label for="loginEmail">Email</label>
                            <input type="email" id="loginEmail" class="form-control" placeholder="you@example.com" required>
                        </div>
                        <div class="form-group">
                            <label for="loginPassword">Password</label>
                            <input type="password" id="loginPassword" class="form-control" placeholder="••••••••" required>
                        </div>
                        <div class="form-error" id="loginError"></div>
                        <button type="submit" class="btn btn-primary btn-full">
                            <span>Sign In</span>
                        </button>
                        <p class="auth-switch">
                            Don't have an account? <a href="#" id="showRegister">Create one</a>
                        </p>
                    </form>

                    <!-- Register Form -->
                    <form id="registerForm" class="auth-form" style="display: none;">
                        <div class="form-group">
                            <label for="registerName">Full Name</label>
                            <input type="text" id="registerName" class="form-control" placeholder="John Doe">
                        </div>
                        <div class="form-group">
                            <label for="registerEmail">Email</label>
                            <input type="email" id="registerEmail" class="form-control" placeholder="you@example.com" required>
                        </div>
                        <div class="form-group">
                            <label for="registerPassword">Password</label>
                            <input type="password" id="registerPassword" class="form-control" placeholder="Min. 8 characters" required>
                            <small class="form-hint">Must have uppercase, lowercase, and a number</small>
                        </div>
                        <div class="form-group">
                            <label for="registerConfirm">Confirm Password</label>
                            <input type="password" id="registerConfirm" class="form-control" placeholder="••••••••" required>
                        </div>
                        <div class="form-error" id="registerError"></div>
                        <button type="submit" class="btn btn-primary btn-full">
                            <span>Create Account</span>
                        </button>
                        <p class="auth-switch">
                            Already have an account? <a href="#" id="showLogin">Sign in</a>
                        </p>
                    </form>

                    <!-- Account View -->
                    <div id="accountView" class="account-view" style="display: none;">
                        <div class="account-header">
                            <div class="account-avatar" id="accountAvatar">U</div>
                            <div class="account-info">
                                <h4 id="accountName">User</h4>
                                <p id="accountEmail">user@example.com</p>
                            </div>
                        </div>
                        <div class="account-stats">
                            <div class="stat">
                                <span class="stat-value" id="resumeCount">0</span>
                                <span class="stat-label">Resumes</span>
                            </div>
                        </div>
                        <div class="account-actions">
                            <button class="btn btn-outline btn-full" id="changePasswordBtn">
                                Change Password
                            </button>
                            <button class="btn btn-ghost btn-full" id="logoutBtn">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/>
                                    <polyline points="16 17 21 12 16 7"/>
                                    <line x1="21" y1="12" x2="9" y2="12"/>
                                </svg>
                                Logout
                            </button>
                        </div>
                    </div>

                    <!-- Change Password Form -->
                    <form id="changePasswordForm" class="auth-form" style="display: none;">
                        <div class="form-group">
                            <label for="currentPassword">Current Password</label>
                            <input type="password" id="currentPassword" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="newPassword">New Password</label>
                            <input type="password" id="newPassword" class="form-control" required>
                        </div>
                        <div class="form-group">
                            <label for="confirmNewPassword">Confirm New Password</label>
                            <input type="password" id="confirmNewPassword" class="form-control" required>
                        </div>
                        <div class="form-error" id="changePasswordError"></div>
                        <div class="form-actions">
                            <button type="button" class="btn btn-ghost" id="cancelPasswordChange">Cancel</button>
                            <button type="submit" class="btn btn-primary">Change Password</button>
                        </div>
                    </form>
                </div>
            </div>
        `;

        document.body.appendChild(modal);
        bindEvents(modal);
        return modal;
    }

    // ==========================================
    // EVENT BINDINGS
    // ==========================================

    function bindEvents(modal) {
        // Close modal
        modal.querySelector('.modal-backdrop').addEventListener('click', close);
        modal.querySelector('[data-close]').addEventListener('click', close);

        // Switch between login and register
        modal.querySelector('#showRegister').addEventListener('click', (e) => {
            e.preventDefault();
            showRegister();
        });

        modal.querySelector('#showLogin').addEventListener('click', (e) => {
            e.preventDefault();
            showLogin();
        });

        // Login form
        modal.querySelector('#loginForm').addEventListener('submit', handleLogin);

        // Register form
        modal.querySelector('#registerForm').addEventListener('submit', handleRegister);

        // Account actions
        modal.querySelector('#logoutBtn').addEventListener('click', handleLogout);
        modal.querySelector('#changePasswordBtn').addEventListener('click', showChangePassword);
        modal.querySelector('#cancelPasswordChange').addEventListener('click', showAccount);
        modal.querySelector('#changePasswordForm').addEventListener('submit', handleChangePassword);
    }

    // ==========================================
    // FORM HANDLERS
    // ==========================================

    async function handleLogin(e) {
        e.preventDefault();

        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        const errorEl = document.getElementById('loginError');
        const btn = e.target.querySelector('button[type="submit"]');

        try {
            btn.disabled = true;
            btn.innerHTML = '<span>Signing in...</span>';
            errorEl.textContent = '';

            const result = await API.login(email, password);

            if (result.success) {
                showToast('Welcome back!', 'success');
                close();
                updateAuthUI();

                // Reload resumes from server
                if (typeof loadUserResumes === 'function') {
                    loadUserResumes();
                }
            }
        } catch (error) {
            errorEl.textContent = error.error || 'Login failed. Please check your credentials.';
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<span>Sign In</span>';
        }
    }

    async function handleRegister(e) {
        e.preventDefault();

        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirm = document.getElementById('registerConfirm').value;
        const errorEl = document.getElementById('registerError');
        const btn = e.target.querySelector('button[type="submit"]');

        // Validate passwords match
        if (password !== confirm) {
            errorEl.textContent = 'Passwords do not match';
            return;
        }

        try {
            btn.disabled = true;
            btn.innerHTML = '<span>Creating account...</span>';
            errorEl.textContent = '';

            const result = await API.register(email, password, name);

            if (result.success) {
                showToast('Account created successfully!', 'success');
                close();
                updateAuthUI();
            }
        } catch (error) {
            if (error.details) {
                errorEl.textContent = error.details.map(d => d.message).join('. ');
            } else {
                errorEl.textContent = error.error || 'Registration failed';
            }
        } finally {
            btn.disabled = false;
            btn.innerHTML = '<span>Create Account</span>';
        }
    }

    async function handleLogout() {
        await API.logout();
        showToast('Logged out successfully', 'success');
        close();
        updateAuthUI();
    }

    async function handleChangePassword(e) {
        e.preventDefault();

        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmNewPassword = document.getElementById('confirmNewPassword').value;
        const errorEl = document.getElementById('changePasswordError');
        const btn = e.target.querySelector('button[type="submit"]');

        if (newPassword !== confirmNewPassword) {
            errorEl.textContent = 'New passwords do not match';
            return;
        }

        try {
            btn.disabled = true;
            btn.textContent = 'Changing...';
            errorEl.textContent = '';

            const result = await API.changePassword(currentPassword, newPassword);

            if (result.success) {
                showToast('Password changed. Please login again.', 'success');
                showLogin();
                updateAuthUI();
            }
        } catch (error) {
            errorEl.textContent = error.error || 'Failed to change password';
        } finally {
            btn.disabled = false;
            btn.textContent = 'Change Password';
        }
    }

    // ==========================================
    // VIEW SWITCHING
    // ==========================================

    function showLogin() {
        currentMode = 'login';
        document.getElementById('authModalTitle').textContent = 'Sign In';
        document.getElementById('loginForm').style.display = 'block';
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('accountView').style.display = 'none';
        document.getElementById('changePasswordForm').style.display = 'none';
    }

    function showRegister() {
        currentMode = 'register';
        document.getElementById('authModalTitle').textContent = 'Create Account';
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'block';
        document.getElementById('accountView').style.display = 'none';
        document.getElementById('changePasswordForm').style.display = 'none';
    }

    async function showAccount() {
        currentMode = 'account';
        document.getElementById('authModalTitle').textContent = 'Account';
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('accountView').style.display = 'block';
        document.getElementById('changePasswordForm').style.display = 'none';

        // Load user info
        const user = API.getUser() || await API.getCurrentUser();
        if (user) {
            document.getElementById('accountName').textContent = user.name || 'User';
            document.getElementById('accountEmail').textContent = user.email;
            document.getElementById('accountAvatar').textContent = (user.name || user.email || 'U')[0].toUpperCase();
        }

        // Load resume count
        try {
            const result = await API.getResumes();
            if (result.success) {
                document.getElementById('resumeCount').textContent = result.data.count;
            }
        } catch (e) {
            // Ignore
        }
    }

    function showChangePassword() {
        currentMode = 'changePassword';
        document.getElementById('authModalTitle').textContent = 'Change Password';
        document.getElementById('loginForm').style.display = 'none';
        document.getElementById('registerForm').style.display = 'none';
        document.getElementById('accountView').style.display = 'none';
        document.getElementById('changePasswordForm').style.display = 'block';
    }

    // ==========================================
    // MODAL CONTROL
    // ==========================================

    function open(mode = null) {
        let modal = document.getElementById('authModal');
        if (!modal) {
            modal = createModal();
        }

        if (mode === 'account' || (!mode && API.isAuthenticated())) {
            showAccount();
        } else if (mode === 'register') {
            showRegister();
        } else {
            showLogin();
        }

        modal.classList.add('active');
        isOpen = true;
    }

    function close() {
        const modal = document.getElementById('authModal');
        if (modal) {
            modal.classList.remove('active');
        }
        isOpen = false;
    }

    // ==========================================
    // UI UPDATE
    // ==========================================

    function updateAuthUI() {
        const accountBtn = document.getElementById('accountBtn');
        if (!accountBtn) return;

        if (API.isAuthenticated()) {
            const user = API.getUser();
            accountBtn.innerHTML = `
                <div class="account-avatar-mini">${(user?.name || user?.email || 'U')[0].toUpperCase()}</div>
                <span>Account</span>
            `;
            accountBtn.classList.add('authenticated');
        } else {
            accountBtn.innerHTML = `
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                </svg>
                <span>Sign In</span>
            `;
            accountBtn.classList.remove('authenticated');
        }
    }

    function showToast(message, type = 'info') {
        const toast = document.getElementById('toast');
        if (toast) {
            toast.querySelector('.toast-message').textContent = message;
            toast.className = `toast ${type} show`;
            setTimeout(() => {
                toast.classList.remove('show');
            }, 3000);
        }
    }

    // ==========================================
    // INITIALIZATION
    // ==========================================

    function init() {
        // Check auth status on load
        API.checkAuth().then(result => {
            updateAuthUI();
        });
    }

    // ==========================================
    // PUBLIC API
    // ==========================================

    return {
        open,
        close,
        showLogin,
        showRegister,
        showAccount,
        updateAuthUI,
        init
    };
})();

// Initialize when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    AuthUI.init();
});

// Make available globally
window.AuthUI = AuthUI;
