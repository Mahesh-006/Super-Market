// js/auth.js
import { 
  initAuthObserver, 
  signInWithEmail, 
  signUpWithEmail, 
  signInWithGoogle, 
  signInAsGuest, 
  resetPassword, 
  logOut,
  signInWithPhone,
  setupRecaptcha,
  verifyOTP,
  getCurrentUser,
  isEmailVerified
} from './auth-service.js';

class AuthManager {
  constructor() {
    this.currentUser = null;
    this.isAdmin = false;
    this.init();
  }
  
  init() {
    this.loadCurrentUser();
    this.setupEventListeners();
    this.setupAuthObserver();
  }
  
  loadCurrentUser() {
    const userData = Storage.get('currentUser');
    if (userData) {
      this.currentUser = userData;
      this.isAdmin = this.currentUser.email === 'admin@supermart.com';
    }
  }
  
  setupAuthObserver() {
    initAuthObserver((user) => {
      if (user) {
        // User is signed in
        const userData = {
          id: user.uid,
          name: user.displayName || user.email?.split('@')[0] || 'User',
          email: user.email,
          phone: user.phoneNumber,
          photoURL: user.photoURL,
          isAnonymous: user.isAnonymous,
          emailVerified: user.emailVerified,
          createdAt: user.metadata.creationTime
        };
        
        this.currentUser = userData;
        this.isAdmin = userData.email === 'admin@supermart.com';
        Storage.set('currentUser', userData);
        this.updateUI();
        
        // Emit login event
        window.eventEmitter.emit('userLogin', userData);
      } else {
        // User is signed out
        this.currentUser = null;
        this.isAdmin = false;
        Storage.remove('currentUser');
        this.updateUI();
        
        // Emit logout event
        window.eventEmitter.emit('userLogout');
      }
    });
  }
  
  setupEventListeners() {
    // Auth button click
    const authBtn = document.getElementById('authBtn');
    const mobileAuthBtn = document.getElementById('mobileAuthBtn');
    
    if (authBtn) {
      authBtn.addEventListener('click', (e) => {
        e.preventDefault();
        if (this.currentUser) {
          this.logout();
        } else {
          this.showAuthModal();
        }
      });
    }
    
    if (mobileAuthBtn) {
      mobileAuthBtn.addEventListener('click', (e) => {
        e.preventDefault();
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
    
    // Setup auth forms
    this.setupAuthForms();
    
    // Mobile menu toggle
    const mobileMenuBtn = document.getElementById('mobileMenuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (mobileMenuBtn && mobileMenu) {
      mobileMenuBtn.addEventListener('click', () => {
        mobileMenu.classList.toggle('hidden');
      });
    }
  }
  
  setupAuthForms() {
    // Login form
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;
        
        const submitBtn = loginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="material-icons animate-spin">refresh</span> Logging in...';
        submitBtn.disabled = true;
        
        const result = await signInWithEmail(email, password);
        
        if (result.success) {
          showToast('Login successful!', 'success');
          this.hideAuthModal();
        } else {
          showToast(result.error, 'error');
        }
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      });
    }
    
    // Register form
    const registerForm = document.getElementById('registerForm');
    if (registerForm) {
      registerForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;
        
        if (password !== confirmPassword) {
          showToast('Passwords do not match', 'error');
          return;
        }
        
        const submitBtn = registerForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="material-icons animate-spin">refresh</span> Creating account...';
        submitBtn.disabled = true;
        
        const result = await signUpWithEmail(email, password, name);
        
        if (result.success) {
          showToast('Account created! Please verify your email.', 'success');
          switchAuthTab('login');
        } else {
          showToast(result.error, 'error');
        }
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      });
    }
    
    // Google login button
    const googleLoginBtn = document.getElementById('googleLoginBtn');
    if (googleLoginBtn) {
      googleLoginBtn.addEventListener('click', async () => {
        const result = await signInWithGoogle();
        
        if (result.success) {
          showToast('Login successful!', 'success');
          this.hideAuthModal();
        } else {
          showToast(result.error, 'error');
        }
      });
    }
    
    // Guest login button
    const guestLoginBtn = document.getElementById('guestLoginBtn');
    if (guestLoginBtn) {
      guestLoginBtn.addEventListener('click', async () => {
        const result = await signInAsGuest();
        
        if (result.success) {
          showToast('Logged in as guest', 'success');
          this.hideAuthModal();
        } else {
          showToast(result.error, 'error');
        }
      });
    }
    
    // Phone login form
    const phoneLoginForm = document.getElementById('phoneLoginForm');
    if (phoneLoginForm) {
      phoneLoginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const phoneNumber = document.getElementById('phoneNumber').value;
        const recaptchaContainer = document.getElementById('recaptcha-container');
        
        const submitBtn = phoneLoginForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="material-icons animate-spin">refresh</span> Sending OTP...';
        submitBtn.disabled = true;
        
        const recaptchaVerifier = setupRecaptcha('recaptcha-container');
        const result = await signInWithPhone(phoneNumber, recaptchaVerifier);
        
        if (result.success) {
          document.getElementById('phoneStep1').classList.add('hidden');
          document.getElementById('phoneStep2').classList.remove('hidden');
          showToast('OTP sent to your phone', 'success');
        } else {
          showToast(result.error, 'error');
        }
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      });
    }
    
    // OTP verification form
    const otpForm = document.getElementById('otpForm');
    if (otpForm) {
      otpForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const otp = document.getElementById('otpInput').value;
        
        const submitBtn = otpForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="material-icons animate-spin">refresh</span> Verifying...';
        submitBtn.disabled = true;
        
        const result = await verifyOTP(otp);
        
        if (result.success) {
          showToast('Phone verification successful!', 'success');
          this.hideAuthModal();
        } else {
          showToast(result.error, 'error');
        }
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      });
    }
    
    // Reset password form
    const resetPasswordForm = document.getElementById('resetPasswordForm');
    if (resetPasswordForm) {
      resetPasswordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        const email = document.getElementById('resetEmail').value;
        
        const submitBtn = resetPasswordForm.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        submitBtn.innerHTML = '<span class="material-icons animate-spin">refresh</span> Sending...';
        submitBtn.disabled = true;
        
        const result = await resetPassword(email);
        
        if (result.success) {
          showToast('Password reset email sent!', 'success');
          document.getElementById('resetPasswordContainer').classList.add('hidden');
          document.getElementById('loginContainer').classList.remove('hidden');
        } else {
          showToast(result.error, 'error');
        }
        
        submitBtn.innerHTML = originalText;
        submitBtn.disabled = false;
      });
    }
    
    // Forgot password link
    const forgotPasswordLink = document.getElementById('forgotPasswordLink');
    if (forgotPasswordLink) {
      forgotPasswordLink.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('loginContainer').classList.add('hidden');
        document.getElementById('resetPasswordContainer').classList.remove('hidden');
      });
    }
    
    // Back to login link
    const backToLoginLink = document.getElementById('backToLoginLink');
    if (backToLoginLink) {
      backToLoginLink.addEventListener('click', (e) => {
        e.preventDefault();
        document.getElementById('resetPasswordContainer').classList.add('hidden');
        document.getElementById('loginContainer').classList.remove('hidden');
      });
    }
  }
  
  showAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
      authModal.classList.remove('hidden');
      authModal.classList.add('flex');
    }
  }
  
  hideAuthModal() {
    const authModal = document.getElementById('authModal');
    if (authModal) {
      authModal.classList.add('hidden');
      authModal.classList.remove('flex');
    }
  }
  
  async logout() {
    const result = await logOut();
    if (result.success) {
      showToast('You have been logged out', 'success');
    } else {
      showToast(result.error, 'error');
    }
  }
  
  updateUI() {
    const authBtn = document.getElementById('authBtn');
    const mobileAuthBtn = document.getElementById('mobileAuthBtn');
    
    if (authBtn) {
      if (this.currentUser) {
        authBtn.innerHTML = '<span class="material-icons mr-2">logout</span>Logout';
      } else {
        authBtn.innerHTML = '<span class="material-icons mr-2">login</span>Login';
      }
    }
    
    if (mobileAuthBtn) {
      if (this.currentUser) {
        mobileAuthBtn.innerHTML = '<span class="material-icons mr-2">logout</span>Logout';
      } else {
        mobileAuthBtn.innerHTML = '<span class="material-icons mr-2">login</span>Login';
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
        profileEmail.textContent = this.currentUser.email || this.currentUser.phone || 'Guest User';
        
        if (loginRequired) loginRequired.style.display = 'none';
        if (profileDashboard) profileDashboard.style.display = 'block';
        
        // Update profile form if exists
        const editName = document.getElementById('editName');
        const editEmail = document.getElementById('editEmail');
        const editPhone = document.getElementById('editPhone');
        
        if (editName) editName.value = this.currentUser.name || '';
        if (editEmail) editEmail.value = this.currentUser.email || '';
        if (editPhone) editPhone.value = this.currentUser.phone || '';
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
  
  isVerified() {
    return isEmailVerified();
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

// Auth tab switching
function switchAuthTab(tab) {
  const loginTab = document.getElementById('loginTab');
  const registerTab = document.getElementById('registerTab');
  const phoneTab = document.getElementById('phoneTab');
  
  const loginForm = document.getElementById('loginForm');
  const registerForm = document.getElementById('registerForm');
  const phoneLoginContainer = document.getElementById('phoneLoginContainer');
  
  if (tab === 'login') {
    loginTab.classList.add('bg-gray-600', 'text-white');
    loginTab.classList.remove('text-gray-300');
    
    registerTab.classList.remove('bg-gray-600', 'text-white');
    registerTab.classList.add('text-gray-300');
    
    if (phoneTab) {
      phoneTab.classList.remove('bg-gray-600', 'text-white');
      phoneTab.classList.add('text-gray-300');
    }
    
    loginForm.classList.remove('hidden');
    registerForm.classList.add('hidden');
    if (phoneLoginContainer) phoneLoginContainer.classList.add('hidden');
    
    document.getElementById('authTitle').textContent = 'Welcome Back';
  } else if (tab === 'register') {
    registerTab.classList.add('bg-gray-600', 'text-white');
    registerTab.classList.remove('text-gray-300');
    
    loginTab.classList.remove('bg-gray-600', 'text-white');
    loginTab.classList.add('text-gray-300');
    
    if (phoneTab) {
      phoneTab.classList.remove('bg-gray-600', 'text-white');
      phoneTab.classList.add('text-gray-300');
    }
    
    registerForm.classList.remove('hidden');
    loginForm.classList.add('hidden');
    if (phoneLoginContainer) phoneLoginContainer.classList.add('hidden');
    
    document.getElementById('authTitle').textContent = 'Create Account';
  } else if (tab === 'phone') {
    phoneTab.classList.add('bg-gray-600', 'text-white');
    phoneTab.classList.remove('text-gray-300');
    
    loginTab.classList.remove('bg-gray-600', 'text-white');
    loginTab.classList.add('text-gray-300');
    
    registerTab.classList.remove('bg-gray-600', 'text-white');
    registerTab.classList.add('text-gray-300');
    
    phoneLoginContainer.classList.remove('hidden');
    loginForm.classList.add('hidden');
    registerForm.classList.add('hidden');
    
    document.getElementById('authTitle').textContent = 'Phone Login';
  }
}

function closeAuthModal() {
  const authModal = document.getElementById('authModal');
  if (authModal) {
    authModal.classList.add('hidden');
    authModal.classList.remove('flex');
  }
}

