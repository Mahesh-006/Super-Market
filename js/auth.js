// Authentication management for SuperMart

class AuthManager {
    constructor() {
        this.currentUser = null;
        this.isAdmin = false;
        this.init();
    }
    
    init() {
        this.loadCurrentUser();
        this.setupEventListeners();
        this.updateUI();
    }
    
    loadCurrentUser() {
        const userData = Storage.get('currentUser');
        const adminData = Storage.get('currentAdmin');
        
        if (adminData) {
            this.currentUser = adminData;
            this.isAdmin = true;
        } else if (userData) {
            this.currentUser = userData;
            this.isAdmin = false;
        }
    }
    
    setupEventListeners() {
        // Auth button click
        const authBtn = document.getElementById('authBtn');
        const mobileAuthBtn = document.getElementById('mobileAuthBtn');
        
        if (authBtn) {
            authBtn.addEventListener('click', () => {
                if (this.currentUser) {
                    this.logout();
                } else {
                    this.showAuthModal();
                }
            });
        }
        
        if (mobileAuthBtn) {
            mobileAuthBtn.addEventListener('click', () => {
                if (this.currentUser) {
                    this.logout();
                } else {
                    this.showAuthModal();
                }
            });
        }
        
        // Profile login button
        const profileLoginBtn = document.getElementById('profileLoginBtn');
        if (profileLoginBtn) {
            profileLoginBtn.addEventListener('click', () => {
                this.showAuthModal();
            });
        }
        
        // Modal setup
        this.setupAuthModal();
        
        // Mobile menu toggle
        const mobileMenuBtn = document.getElementById('mobileMenuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (mobileMenuBtn && mobileMenu) {
            mobileMenuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('show');
            });
        }
    }
    
    setupAuthModal() {
        const authModal = document.getElementById('authModal');
        if (!authModal) return;
        
        const closeBtns = authModal.querySelectorAll('.close-btn');
        const tabBtns = authModal.querySelectorAll('.tab-btn');
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        // Close modal
        closeBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.hideAuthModal();
            });
        });
        
        // Click outside to close
        authModal.addEventListener('click', (e) => {
            if (e.target === authModal) {
                this.hideAuthModal();
            }
        });
        
        // Tab switching
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tab = btn.dataset.tab;
                this.switchAuthTab(tab);
            });
        });
        
        // Form submissions
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleLogin(loginForm);
            });
        }
        
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.handleRegister(registerForm);
            });
        }
    }
    
    showAuthModal() {
        const authModal = document.getElementById('authModal');
        if (authModal) {
            authModal.style.display = 'block';
            Animation.fadeIn(authModal);
        }
    }
    
    hideAuthModal() {
        const authModal = document.getElementById('authModal');
        if (authModal) {
            Animation.fadeOut(authModal);
            setTimeout(() => {
                authModal.style.display = 'none';
            }, 300);
        }
    }
    
    switchAuthTab(tab) {
        const tabBtns = document.querySelectorAll('.tab-btn');
        const forms = document.querySelectorAll('.auth-form');
        
        tabBtns.forEach(btn => {
            btn.classList.toggle('active', btn.dataset.tab === tab);
        });
        
        forms.forEach(form => {
            form.classList.toggle('active', form.id === `${tab}Form`);
        });
    }
    
    async handleLogin(form) {
        const formData = new FormData(form);
        const email = formData.get('email') || form.querySelector('input[type="email"]').value;
        const password = formData.get('password') || form.querySelector('input[type="password"]').value;
        
        if (!Validation.email(email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }
        
        if (!Validation.required(password)) {
            showToast('Please enter your password', 'error');
            return;
        }
        
        try {
            // Simulate API call
            await API.delay(1000);
            
            // Check if admin credentials
            if (email === 'admin@supermart.com' && password === 'admin123') {
                showToast('Admin login not allowed here. Please use admin portal.', 'error');
                return;
            }
            
            // Get existing users
            const users = Storage.get('users', []);
            const user = users.find(u => u.email === email && u.password === password);
            
            if (!user) {
                // For demo purposes, create user if not exists
                const newUser = {
                    id: generateId(),
                    name: email.split('@')[0],
                    email: email,
                    password: password,
                    phone: '',
                    address: '',
                    createdAt: new Date().toISOString()
                };
                
                users.push(newUser);
                Storage.set('users', users);
                this.currentUser = newUser;
            } else {
                this.currentUser = user;
            }
            
            Storage.set('currentUser', this.currentUser);
            this.updateUI();
            this.hideAuthModal();
            
            showToast(`Welcome back, ${this.currentUser.name}!`, 'success');
            
            // Emit login event
            window.eventEmitter.emit('userLogin', this.currentUser);
            
        } catch (error) {
            showToast('Login failed. Please try again.', 'error');
        }
    }
    
    async handleRegister(form) {
        const formData = new FormData(form);
        const inputs = form.querySelectorAll('input');
        const name = inputs[0].value;
        const email = inputs[1].value;
        const password = inputs[2].value;
        const confirmPassword = inputs[3].value;
        
        if (!Validation.required(name)) {
            showToast('Please enter your full name', 'error');
            return;
        }
        
        if (!Validation.email(email)) {
            showToast('Please enter a valid email address', 'error');
            return;
        }
        
        if (!Validation.password(password)) {
            showToast('Password must be at least 6 characters long', 'error');
            return;
        }
        
        if (password !== confirmPassword) {
            showToast('Passwords do not match', 'error');
            return;
        }
        
        try {
            // Simulate API call
            await API.delay(1000);
            
            // Check if user already exists
            const users = Storage.get('users', []);
            const existingUser = users.find(u => u.email === email);
            
            if (existingUser) {
                showToast('An account with this email already exists', 'error');
                return;
            }
            
            // Create new user
            const newUser = {
                id: generateId(),
                name: name,
                email: email,
                password: password,
                phone: '',
                address: '',
                createdAt: new Date().toISOString()
            };
            
            users.push(newUser);
            Storage.set('users', users);
            
            this.currentUser = newUser;
            Storage.set('currentUser', this.currentUser);
            
            this.updateUI();
            this.hideAuthModal();
            
            showToast(`Welcome to SuperMart, ${this.currentUser.name}!`, 'success');
            
            // Emit registration event
            window.eventEmitter.emit('userRegister', this.currentUser);
            
        } catch (error) {
            showToast('Registration failed. Please try again.', 'error');
        }
    }
    
    logout() {
        this.currentUser = null;
        this.isAdmin = false;
        Storage.remove('currentUser');
        Storage.remove('currentAdmin');
        
        this.updateUI();
        showToast('You have been logged out', 'success');
        
        // Emit logout event
        window.eventEmitter.emit('userLogout');
        
        // Redirect to home if on profile page
        if (window.location.pathname.includes('profile.html')) {
            window.location.href = '/';
        }
    }
    
    updateUI() {
        const authBtn = document.getElementById('authBtn');
        const mobileAuthBtn = document.getElementById('mobileAuthBtn');
        
        if (authBtn) {
            if (this.currentUser) {
                authBtn.textContent = 'Logout';
                authBtn.innerHTML = '<i class="fas fa-sign-out-alt"></i> Logout';
            } else {
                authBtn.textContent = 'Login';
                authBtn.innerHTML = 'Login';
            }
        }
        
        if (mobileAuthBtn) {
            if (this.currentUser) {
                mobileAuthBtn.textContent = 'Logout';
            } else {
                mobileAuthBtn.textContent = 'Login';
            }
        }
        
        // Update profile page
        this.updateProfilePage();
        
        // Update admin link visibility
        this.updateAdminAccess();
    }
    
    updateProfilePage() {
        const profileName = document.getElementById('profileName');
        const profileEmail = document.getElementById('profileEmail');
        const loginRequired = document.getElementById('loginRequired');
        const profileDashboard = document.getElementById('profileDashboard');
        
        if (profileName && profileEmail) {
            if (this.currentUser) {
                profileName.textContent = `Welcome, ${this.currentUser.name}`;
                profileEmail.textContent = this.currentUser.email;
                
                if (loginRequired) loginRequired.style.display = 'none';
                if (profileDashboard) profileDashboard.style.display = 'block';
            } else {
                profileName.textContent = 'Welcome';
                profileEmail.textContent = 'Please login to view your profile';
                
                if (loginRequired) loginRequired.style.display = 'block';
                if (profileDashboard) profileDashboard.style.display = 'none';
            }
        }
    }
    
    updateAdminAccess() {
        // Add admin link to navigation if user is admin
        const navLinks = document.querySelector('.nav-links');
        if (navLinks && this.isAdmin) {
            const existingAdminLink = navLinks.querySelector('.admin-link');
            if (!existingAdminLink) {
                const adminLink = document.createElement('a');
                adminLink.href = 'admin/dashboard.html';
                adminLink.className = 'nav-link admin-link';
                adminLink.innerHTML = '<i class="fas fa-shield-alt"></i> Admin';
                navLinks.insertBefore(adminLink, navLinks.lastElementChild);
            }
        }
    }
    
    requireAuth() {
        if (!this.currentUser) {
            this.showAuthModal();
            return false;
        }
        return true;
    }
    
    requireAdmin() {
        if (!this.isAdmin) {
            showToast('Admin access required', 'error');
            return false;
        }
        return true;
    }
    
    getCurrentUser() {
        return this.currentUser;
    }
    
    isLoggedIn() {
        return !!this.currentUser;
    }
    
    isAdminUser() {
        return this.isAdmin;
    }
}

// Initialize auth manager
const authManager = new AuthManager();

// Make it globally available
window.authManager = authManager;

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AuthManager;
}