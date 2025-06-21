// Modern Interactions and Animations for SuperMart

class ModernInteractions {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupScrollAnimations();
        this.setupParallaxEffects();
        this.setupHoverEffects();
        this.setupLoadingStates();
        this.setupSmoothScrolling();
        this.setupIntersectionObserver();
        this.setupModernToasts();
        this.setupAdvancedSearch();
        this.setupNewsletterForm();
    }
    
    setupScrollAnimations() {
        // Reveal animations on scroll
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                    
                    // Stagger animation for grid items
                    if (entry.target.classList.contains('stagger-parent')) {
                        const children = entry.target.children;
                        Array.from(children).forEach((child, index) => {
                            setTimeout(() => {
                                child.classList.add('animate-in');
                            }, index * 100);
                        });
                    }
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        const animateElements = document.querySelectorAll(
            '.feature-card, .category-card, .product-card, .offer-card, .section-title, .hero-content'
        );
        
        animateElements.forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
        
        // Add stagger class to grids
        document.querySelectorAll('.features-grid, .category-grid, .products-grid, .offers-grid').forEach(grid => {
            grid.classList.add('stagger-parent');
        });
    }
    
    setupParallaxEffects() {
        // Subtle parallax effect for hero section
        window.addEventListener('scroll', () => {
            const scrolled = window.pageYOffset;
            const hero = document.querySelector('.hero');
            
            if (hero) {
                const rate = scrolled * -0.5;
                hero.style.transform = `translateY(${rate}px)`;
            }
        });
    }
    
    setupHoverEffects() {
        // Enhanced hover effects for cards
        document.addEventListener('mouseenter', (e) => {
            // Check if e.target is an Element and has the closest method
            if (e.target && typeof e.target.closest === 'function') {
                const card = e.target.closest('.product-card, .category-card, .feature-card, .offer-card');
                if (card) {
                    this.enhanceCardHover(card, true);
                }
            }
        }, true);
        
        document.addEventListener('mouseleave', (e) => {
            // Check if e.target is an Element and has the closest method
            if (e.target && typeof e.target.closest === 'function') {
                const card = e.target.closest('.product-card, .category-card, .feature-card, .offer-card');
                if (card) {
                    this.enhanceCardHover(card, false);
                }
            }
        }, true);
        
        // Magnetic effect for buttons
        document.querySelectorAll('.cta-btn, .auth-btn, .offer-btn').forEach(btn => {
            btn.addEventListener('mousemove', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left - rect.width / 2;
                const y = e.clientY - rect.top - rect.height / 2;
                
                btn.style.transform = `translate(${x * 0.1}px, ${y * 0.1}px)`;
            });
            
            btn.addEventListener('mouseleave', () => {
                btn.style.transform = '';
            });
        });
    }
    
    enhanceCardHover(card, isHovering) {
        const image = card.querySelector('img');
        const content = card.querySelector('.product-info, .feature-card h3, .offer-content');
        
        if (isHovering) {
            if (image) {
                image.style.transform = 'scale(1.05)';
            }
            if (content) {
                content.style.transform = 'translateY(-4px)';
            }
            
            // Add glow effect
            card.style.boxShadow = '0 20px 40px rgba(14, 165, 233, 0.15)';
        } else {
            if (image) {
                image.style.transform = 'scale(1)';
            }
            if (content) {
                content.style.transform = 'translateY(0)';
            }
            
            card.style.boxShadow = '';
        }
    }
    
    setupLoadingStates() {
        // Enhanced loading states
        window.showLoading = (message = 'Loading...') => {
            const spinner = document.getElementById('loadingSpinner');
            if (spinner) {
                spinner.querySelector('p').textContent = message;
                spinner.style.display = 'flex';
                document.body.style.overflow = 'hidden';
            }
        };
        
        window.hideLoading = () => {
            const spinner = document.getElementById('loadingSpinner');
            if (spinner) {
                spinner.style.display = 'none';
                document.body.style.overflow = '';
            }
        };
        
        // Auto-hide loading after page load
        window.addEventListener('load', () => {
            setTimeout(() => {
                window.hideLoading();
            }, 500);
        });
    }
    
    setupSmoothScrolling() {
        // Smooth scrolling for anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            });
        });
    }
    
    setupIntersectionObserver() {
        // Navbar background change on scroll
        const navbar = document.querySelector('.navbar');
        const hero = document.querySelector('.hero');
        
        if (navbar && hero) {
            const observer = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        navbar.classList.remove('scrolled');
                    } else {
                        navbar.classList.add('scrolled');
                    }
                });
            }, { threshold: 0.1 });
            
            observer.observe(hero);
        }
    }
    
    setupModernToasts() {
        // Enhanced toast system
        window.showModernToast = (title, message, type = 'success', duration = 4000) => {
            const toast = document.getElementById('toast');
            if (!toast) return;
            
            const icons = {
                success: 'fas fa-check-circle',
                error: 'fas fa-exclamation-circle',
                warning: 'fas fa-exclamation-triangle',
                info: 'fas fa-info-circle'
            };
            
            const colors = {
                success: 'var(--success-100)',
                error: 'var(--error-100)',
                warning: 'var(--warning-100)',
                info: 'var(--primary-100)'
            };
            
            const iconColors = {
                success: 'var(--success-600)',
                error: 'var(--error-600)',
                warning: 'var(--warning-600)',
                info: 'var(--primary-600)'
            };
            
            // Update toast content
            const icon = toast.querySelector('.toast-icon i');
            const titleEl = toast.querySelector('.toast-title');
            const textEl = toast.querySelector('.toast-text');
            const iconContainer = toast.querySelector('.toast-icon');
            
            if (icon) icon.className = icons[type];
            if (titleEl) titleEl.textContent = title;
            if (textEl) textEl.textContent = message;
            if (iconContainer) {
                iconContainer.style.backgroundColor = colors[type];
                iconContainer.style.color = iconColors[type];
            }
            
            // Show toast
            toast.classList.add('show');
            
            // Auto hide
            setTimeout(() => {
                toast.classList.remove('show');
            }, duration);
            
            // Close button
            const closeBtn = toast.querySelector('.toast-close');
            if (closeBtn) {
                closeBtn.onclick = () => {
                    toast.classList.remove('show');
                };
            }
        };
        
        // Override default showToast
        window.showToast = (message, type = 'success') => {
            const titles = {
                success: 'Success!',
                error: 'Error!',
                warning: 'Warning!',
                info: 'Info'
            };
            
            window.showModernToast(titles[type], message, type);
        };
    }
    
    setupAdvancedSearch() {
        // Enhanced search with real-time suggestions
        const searchInput = document.getElementById('searchInput');
        if (!searchInput) return;
        
        let searchTimeout;
        
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            const query = e.target.value.trim();
            
            if (query.length < 2) {
                this.hideSearchSuggestions();
                return;
            }
            
            searchTimeout = setTimeout(() => {
                this.showSearchSuggestions(query);
            }, 300);
        });
        
        searchInput.addEventListener('focus', () => {
            if (searchInput.value.trim().length >= 2) {
                this.showSearchSuggestions(searchInput.value.trim());
            }
        });
        
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.nav-search')) {
                this.hideSearchSuggestions();
            }
        });
    }
    
    showSearchSuggestions(query) {
        // Create suggestions dropdown
        let dropdown = document.querySelector('.search-suggestions');
        if (!dropdown) {
            dropdown = document.createElement('div');
            dropdown.className = 'search-suggestions';
            document.querySelector('.nav-search').appendChild(dropdown);
        }
        
        // Mock suggestions (in real app, this would be from API)
        const suggestions = [
            'Fresh Apples',
            'Organic Bananas',
            'Whole Milk',
            'Sourdough Bread',
            'Greek Yogurt'
        ].filter(item => item.toLowerCase().includes(query.toLowerCase()));
        
        if (suggestions.length === 0) {
            this.hideSearchSuggestions();
            return;
        }
        
        dropdown.innerHTML = suggestions.map(suggestion => `
            <div class="suggestion-item" data-query="${suggestion}">
                <i class="fas fa-search"></i>
                <span>${suggestion}</span>
            </div>
        `).join('');
        
        dropdown.style.display = 'block';
        
        // Add click handlers
        dropdown.querySelectorAll('.suggestion-item').forEach(item => {
            item.addEventListener('click', () => {
                const query = item.dataset.query;
                document.getElementById('searchInput').value = query;
                this.hideSearchSuggestions();
                // Trigger search
                window.location.href = `products.html?search=${encodeURIComponent(query)}`;
            });
        });
    }
    
    hideSearchSuggestions() {
        const dropdown = document.querySelector('.search-suggestions');
        if (dropdown) {
            dropdown.style.display = 'none';
        }
    }
    
    setupNewsletterForm() {
        const subscribeBtn = document.getElementById('subscribeBtn');
        const emailInput = document.getElementById('newsletterEmail');
        
        if (subscribeBtn && emailInput) {
            subscribeBtn.addEventListener('click', () => {
                const email = emailInput.value.trim();
                
                if (!email) {
                    window.showModernToast('Error', 'Please enter your email address', 'error');
                    return;
                }
                
                if (!this.isValidEmail(email)) {
                    window.showModernToast('Error', 'Please enter a valid email address', 'error');
                    return;
                }
                
                // Simulate subscription
                subscribeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Subscribing...';
                subscribeBtn.disabled = true;
                
                setTimeout(() => {
                    window.showModernToast('Success!', 'Thank you for subscribing to our newsletter!', 'success');
                    emailInput.value = '';
                    subscribeBtn.innerHTML = '<span>Subscribe</span><i class="fas fa-paper-plane"></i>';
                    subscribeBtn.disabled = false;
                }, 1500);
            });
            
            emailInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    subscribeBtn.click();
                }
            });
        }
    }
    
    isValidEmail(email) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return emailRegex.test(email);
    }
}

// Initialize modern interactions
document.addEventListener('DOMContentLoaded', () => {
    new ModernInteractions();
});

// Add CSS for modern interactions
const modernInteractionsCSS = `
/* Scroll Animations */
.animate-on-scroll {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s cubic-bezier(0.4, 0, 0.2, 1);
}

.animate-on-scroll.animate-in {
    opacity: 1;
    transform: translateY(0);
}

/* Navbar scroll effect */
.navbar.scrolled {
    background: rgba(255, 255, 255, 0.98);
    backdrop-filter: blur(20px);
    box-shadow: var(--shadow-lg);
}

[data-theme="dark"] .navbar.scrolled {
    background: rgba(17, 24, 39, 0.98);
}

/* Search Suggestions */
.search-suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-xl);
    z-index: var(--z-dropdown);
    max-height: 300px;
    overflow-y: auto;
    margin-top: var(--space-2);
    display: none;
}

.suggestion-item {
    display: flex;
    align-items: center;
    gap: var(--space-3);
    padding: var(--space-3) var(--space-4);
    cursor: pointer;
    transition: all var(--transition-fast);
    border-bottom: 1px solid var(--border-light);
}

.suggestion-item:last-child {
    border-bottom: none;
}

.suggestion-item:hover {
    background: var(--bg-hover);
}

.suggestion-item i {
    color: var(--text-muted);
    font-size: var(--font-size-sm);
}

.suggestion-item span {
    color: var(--text-primary);
    font-weight: var(--font-weight-medium);
}

/* Enhanced Card Animations */
.product-card,
.category-card,
.feature-card,
.offer-card {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.product-card:hover,
.category-card:hover,
.feature-card:hover,
.offer-card:hover {
    transform: translateY(-8px) scale(1.02);
}

/* Magnetic Button Effect */
.cta-btn,
.auth-btn,
.offer-btn {
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
}

/* Stagger Animation */
.stagger-parent > * {
    opacity: 0;
    transform: translateY(20px);
    transition: all 0.6s cubic-bezier(0.4, 0, 0.2, 1);
}

.stagger-parent > *.animate-in {
    opacity: 1;
    transform: translateY(0);
}

/* Loading Animation */
.loading-state {
    position: relative;
    overflow: hidden;
}

.loading-state::after {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.4), transparent);
    animation: shimmer 1.5s infinite;
}

@keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
}

/* Pulse Animation */
.pulse {
    animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.5;
    }
}

/* Bounce Animation */
.bounce {
    animation: bounce 1s infinite;
}

@keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
        transform: translate3d(0, 0, 0);
    }
    40%, 43% {
        transform: translate3d(0, -30px, 0);
    }
    70% {
        transform: translate3d(0, -15px, 0);
    }
    90% {
        transform: translate3d(0, -4px, 0);
    }
}

/* Fade In Animation */
.fade-in {
    animation: fadeIn 0.5s ease-out;
}

@keyframes fadeIn {
    from {
        opacity: 0;
        transform: translateY(20px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Scale In Animation */
.scale-in {
    animation: scaleIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes scaleIn {
    from {
        opacity: 0;
        transform: scale(0.9);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}

/* Slide In Animation */
.slide-in-right {
    animation: slideInRight 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(100%);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

.slide-in-left {
    animation: slideInLeft 0.5s cubic-bezier(0.4, 0, 0.2, 1);
}

@keyframes slideInLeft {
    from {
        opacity: 0;
        transform: translateX(-100%);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

/* Responsive Animations */
@media (max-width: 768px) {
    .animate-on-scroll {
        transform: translateY(20px);
    }
    
    .product-card:hover,
    .category-card:hover,
    .feature-card:hover,
    .offer-card:hover {
        transform: translateY(-4px) scale(1.01);
    }
}

/* Reduced Motion */
@media (prefers-reduced-motion: reduce) {
    .animate-on-scroll,
    .product-card,
    .category-card,
    .feature-card,
    .offer-card,
    .cta-btn,
    .auth-btn,
    .offer-btn {
        transition: none !important;
        animation: none !important;
    }
    
    .animate-on-scroll {
        opacity: 1;
        transform: none;
    }
}
`;

// Inject modern interactions CSS
const modernInteractionsStyle = document.createElement('style');
modernInteractionsStyle.textContent = modernInteractionsCSS;
document.head.appendChild(modernInteractionsStyle);