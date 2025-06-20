// Admin authentication management

class AdminAuthManager {
    constructor() {
        this.currentAdmin = null;
        this.init();
    }
    
    init() {
        this.loadCurrentAdmin();
        this.checkAdminAccess();
    }
    
    loadCurrentAdmin() {
        const adminData = Storage.get('currentAdmin');
        if (adminData) {
            this.currentAdmin = adminData;
        }
    }
    
    checkAdminAccess() {
        const isAdminPage = window.location.pathname.includes('/admin/') && 
                           !window.location.pathname.includes('login.html');
        
        if (isAdminPage && !this.currentAdmin) {
            window.location.href = 'login.html';
        }
    }
    
    async login(email, password) {
        try {
            // Simulate API call
            await API.delay(1000);
            
            // Check admin credentials
            if (email === 'admin@supermart.com' && password === 'admin123') {
                this.currentAdmin = {
                    id: 'admin-1',
                    name: 'Admin',
                    email: email,
                    role: 'admin',
                    loginAt: new Date().toISOString()
                };
                
                Storage.set('currentAdmin', this.currentAdmin);
                return { success: true };
            } else {
                throw new Error('Invalid admin credentials');
            }
        } catch (error) {
            throw error;
        }
    }
    
    logout() {
        this.currentAdmin = null;
        Storage.remove('currentAdmin');
        window.location.href = 'login.html';
    }
    
    getCurrentAdmin() {
        return this.currentAdmin;
    }
    
    isLoggedIn() {
        return !!this.currentAdmin;
    }
}

// Initialize admin auth manager
const adminAuthManager = new AdminAuthManager();

// Setup admin login form
document.addEventListener('DOMContentLoaded', () => {
    const adminLoginForm = document.getElementById('adminLoginForm');
    if (adminLoginForm) {
        adminLoginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const email = document.getElementById('adminEmail').value;
            const password = document.getElementById('adminPassword').value;
            
            if (!Validation.email(email)) {
                showToast('Please enter a valid email address', 'error');
                return;
            }
            
            if (!Validation.required(password)) {
                showToast('Please enter your password', 'error');
                return;
            }
            
            const submitBtn = adminLoginForm.querySelector('button[type="submit"]');
            const originalText = submitBtn.innerHTML;
            submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Logging in...';
            submitBtn.disabled = true;
            
            try {
                await adminAuthManager.login(email, password);
                showToast('Login successful! Redirecting...', 'success');
                
                setTimeout(() => {
                    window.location.href = 'dashboard.html';
                }, 1000);
                
            } catch (error) {
                showToast(error.message || 'Login failed', 'error');
            } finally {
                submitBtn.innerHTML = originalText;
                submitBtn.disabled = false;
            }
        });
    }
    
    // Setup admin logout buttons
    const logoutBtns = document.querySelectorAll('#adminLogoutBtn, .admin-logout-btn');
    logoutBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            adminAuthManager.logout();
        });
    });
    
    // Update admin user name in navigation
    const adminUserName = document.getElementById('adminUserName');
    if (adminUserName && adminAuthManager.currentAdmin) {
        adminUserName.textContent = adminAuthManager.currentAdmin.name;
    }
});

// Make it globally available
window.adminAuthManager = adminAuthManager;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AdminAuthManager;
}