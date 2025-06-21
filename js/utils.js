// Utility functions for SuperMart

// Show toast notification
function showToast(message, type = 'success') {
    const toast = document.getElementById('toast');
    if (!toast) return;
    
    toast.textContent = message;
    toast.className = `toast ${type}`;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, 3000);
}

// Format currency in Indian Rupees
function formatCurrency(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

// Format date
function formatDate(date) {
    return new Intl.DateTimeFormat('en-IN', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
    }).format(new Date(date));
}

// Generate unique ID
function generateId() {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
}

// Generate order ID
function generateOrderId() {
    return 'ORD-' + Date.now().toString(36).toUpperCase();
}

// Debounce function
function debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// Throttle function
function throttle(func, limit) {
    let inThrottle;
    return function() {
        const args = arguments;
        const context = this;
        if (!inThrottle) {
            func.apply(context, args);
            inThrottle = true;
            setTimeout(() => inThrottle = false, limit);
        }
    }
}

// Local storage helpers
const Storage = {
    get: (key, defaultValue = null) => {
        try {
            const item = localStorage.getItem(key);
            return item ? JSON.parse(item) : defaultValue;
        } catch (error) {
            console.error('Error getting from localStorage:', error);
            return defaultValue;
        }
    },
    
    set: (key, value) => {
        try {
            localStorage.setItem(key, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Error setting to localStorage:', error);
            return false;
        }
    },
    
    remove: (key) => {
        try {
            localStorage.removeItem(key);
            return true;
        } catch (error) {
            console.error('Error removing from localStorage:', error);
            return false;
        }
    },
    
    clear: () => {
        try {
            localStorage.clear();
            return true;
        } catch (error) {
            console.error('Error clearing localStorage:', error);
            return false;
        }
    }
};

// Theme management
const Theme = {
    init: () => {
        const savedTheme = Storage.get('theme', 'dark');
        Theme.apply(savedTheme);
        Theme.updateToggleButton();
    },
    
    toggle: () => {
        const currentTheme = Storage.get('theme', 'dark');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        Theme.apply(newTheme);
        Storage.set('theme', newTheme);
        Theme.updateToggleButton();
    },
    
    apply: (theme) => {
        document.documentElement.setAttribute('data-theme', theme);
        if (theme === 'light') {
            document.documentElement.style.setProperty('--bg-primary', '#ffffff');
            document.documentElement.style.setProperty('--bg-secondary', '#f8fafc');
            document.documentElement.style.setProperty('--bg-tertiary', '#e2e8f0');
            document.documentElement.style.setProperty('--text-primary', '#1a202c');
            document.documentElement.style.setProperty('--text-secondary', '#4a5568');
            document.documentElement.style.setProperty('--text-muted', '#718096');
            document.documentElement.style.setProperty('--border-color', '#e2e8f0');
        } else {
            // Reset to dark theme (default CSS variables)
            document.documentElement.style.removeProperty('--bg-primary');
            document.documentElement.style.removeProperty('--bg-secondary');
            document.documentElement.style.removeProperty('--bg-tertiary');
            document.documentElement.style.removeProperty('--text-primary');
            document.documentElement.style.removeProperty('--text-secondary');
            document.documentElement.style.removeProperty('--text-muted');
            document.documentElement.style.removeProperty('--border-color');
        }
    },
    
    updateToggleButton: () => {
        const themeToggle = document.getElementById('themeToggle');
        if (themeToggle) {
            const currentTheme = Storage.get('theme', 'dark');
            const icon = themeToggle.querySelector('i');
            if (icon) {
                icon.className = currentTheme === 'dark' ? 'fas fa-sun' : 'fas fa-moon';
            }
        }
    }
};

// Animation helpers
const Animation = {
    fadeIn: (element, duration = 300) => {
        element.style.opacity = '0';
        element.style.display = 'block';
        
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.min(progress / duration, 1);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            }
        };
        
        requestAnimationFrame(animate);
    },
    
    fadeOut: (element, duration = 300) => {
        let start = null;
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const opacity = Math.max(1 - (progress / duration), 0);
            
            element.style.opacity = opacity;
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
            }
        };
        
        requestAnimationFrame(animate);
    },
    
    slideDown: (element, duration = 300) => {
        element.style.height = '0';
        element.style.overflow = 'hidden';
        element.style.display = 'block';
        
        const targetHeight = element.scrollHeight;
        let start = null;
        
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const height = Math.min((progress / duration) * targetHeight, targetHeight);
            
            element.style.height = height + 'px';
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.height = 'auto';
                element.style.overflow = 'visible';
            }
        };
        
        requestAnimationFrame(animate);
    },
    
    slideUp: (element, duration = 300) => {
        const startHeight = element.offsetHeight;
        let start = null;
        
        const animate = (timestamp) => {
            if (!start) start = timestamp;
            const progress = timestamp - start;
            const height = Math.max(startHeight - (progress / duration) * startHeight, 0);
            
            element.style.height = height + 'px';
            element.style.overflow = 'hidden';
            
            if (progress < duration) {
                requestAnimationFrame(animate);
            } else {
                element.style.display = 'none';
                element.style.height = 'auto';
                element.style.overflow = 'visible';
            }
        };
        
        requestAnimationFrame(animate);
    }
};

// Form validation helpers
const Validation = {
    email: (email) => {
        const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return re.test(email);
    },
    
    phone: (phone) => {
        const re = /^\+?[\d\s\-\(\)]{10,}$/;
        return re.test(phone);
    },
    
    password: (password) => {
        return password.length >= 6;
    },
    
    required: (value) => {
        return value && value.toString().trim().length > 0;
    },
    
    minLength: (value, min) => {
        return value && value.toString().length >= min;
    },
    
    maxLength: (value, max) => {
        return value && value.toString().length <= max;
    },
    
    number: (value) => {
        return !isNaN(value) && !isNaN(parseFloat(value));
    },
    
    url: (url) => {
        try {
            new URL(url);
            return true;
        } catch {
            return false;
        }
    }
};

// API simulation helpers
const API = {
    delay: (ms = 1000) => new Promise(resolve => setTimeout(resolve, ms)),
    
    simulate: async (data, delay = 1000) => {
        await API.delay(delay);
        return {
            success: true,
            data: data,
            timestamp: new Date().toISOString()
        };
    },
    
    error: async (message = 'Something went wrong', delay = 1000) => {
        await API.delay(delay);
        throw new Error(message);
    }
};

// Event emitter for custom events
class EventEmitter {
    constructor() {
        this.events = {};
    }
    
    on(event, callback) {
        if (!this.events[event]) {
            this.events[event] = [];
        }
        this.events[event].push(callback);
    }
    
    off(event, callback) {
        if (!this.events[event]) return;
        this.events[event] = this.events[event].filter(cb => cb !== callback);
    }
    
    emit(event, data) {
        if (!this.events[event]) return;
        this.events[event].forEach(callback => callback(data));
    }
}

// Global event emitter instance
window.eventEmitter = new EventEmitter();

// Initialize theme on page load
document.addEventListener('DOMContentLoaded', () => {
    Theme.init();
    
    // Theme toggle event listener
    const themeToggle = document.getElementById('themeToggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', Theme.toggle);
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        showToast,
        formatCurrency,
        formatDate,
        generateId,
        generateOrderId,
        debounce,
        throttle,
        Storage,
        Theme,
        Animation,
        Validation,
        API,
        EventEmitter
    };
}