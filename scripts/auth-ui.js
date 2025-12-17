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
                    <h3 id="authModalTitle">Account</h3>
                    <button class="modal-close" data-close>&times;</button>
                </div>
                <div class="modal-body">
                    <!-- Coming Soon Message -->
                    <div class="coming-soon-view" style="text-align: center; padding: 30px 20px;">
                        <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #10B981 0%, #059669 100%); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
                            <svg viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="2" style="width: 40px; height: 40px;">
                                <path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/>
                                <circle cx="12" cy="7" r="4"/>
                            </svg>
                        </div>
                        <h3 style="color: #fff; margin-bottom: 12px; font-size: 20px;">Cloud Sync Coming Soon!</h3>
                        <p style="color: rgba(255,255,255,0.7); margin-bottom: 20px; line-height: 1.6;">
                            Account login with cloud backup is coming soon. 
                            <br><br>
                            <strong style="color: #10B981;">Good news:</strong> Your resume is automatically saved in your browser!
                        </p>
                        <div style="background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); border-radius: 12px; padding: 16px; margin-bottom: 20px;">
                            <p style="color: #10B981; margin: 0; font-size: 14px;">
                                ✓ All your data is saved locally<br>
                                ✓ Use Save button to keep your progress<br>
                                ✓ Export to PDF anytime
                            </p>
                        </div>
                        <button class="btn btn-primary btn-full" onclick="AuthUI.close()">
                            Got it!
                        </button>
                    </div>
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
        // Close modal on backdrop click or close button
        modal.querySelector('.modal-backdrop').addEventListener('click', close);
        modal.querySelector('[data-close]').addEventListener('click', close);
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
            errorEl.textContent = error.error || 'Login failed';
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
