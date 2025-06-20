// Enhanced Microinteractions and Animations

class MicroInteractions {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupCartAnimations();
        this.setupButtonEffects();
        this.setupScrollAnimations();
        this.setupHoverEffects();
        this.setupLoadingStates();
        this.setupFormValidations();
        this.setupNotificationAnimations();
    }
    
    setupCartAnimations() {
        // Animate cart icon when items are added
        window.eventEmitter.on('cartUpdated', (cart) => {
            this.animateCartIcon();
            this.showCartPreview(cart);
        });
        
        // Animate add to cart buttons
        document.addEventListener('click', (e) => {
            if (e.target.closest('.add-to-cart-btn')) {
                this.animateAddToCart(e.target.closest('.add-to-cart-btn'));
            }
        });
    }
    
    animateCartIcon() {
        const cartIcons = document.querySelectorAll('#cartCount, .cart-count');
        cartIcons.forEach(icon => {
            icon.style.animation = 'none';
            icon.offsetHeight; // Trigger reflow
            icon.style.animation = 'cartBounce 0.6s ease-out';
        });
    }
    
    animateAddToCart(button) {
        // Create floating cart icon
        const rect = button.getBoundingClientRect();
        const cartIcon = document.createElement('i');
        cartIcon.className = 'fas fa-shopping-cart floating-cart-icon';
        cartIcon.style.cssText = `
            position: fixed;
            left: ${rect.left + rect.width / 2}px;
            top: ${rect.top + rect.height / 2}px;
            z-index: 9999;
            color: var(--primary-color);
            font-size: 1.5rem;
            pointer-events: none;
            animation: floatToCart 1s ease-out forwards;
        `;
        
        document.body.appendChild(cartIcon);
        
        // Remove after animation
        setTimeout(() => {
            cartIcon.remove();
        }, 1000);
        
        // Button feedback
        button.style.transform = 'scale(0.95)';
        setTimeout(() => {
            button.style.transform = '';
        }, 150);
    }
    
    showCartPreview(cart) {
        // Show mini cart preview
        const existingPreview = document.querySelector('.cart-preview');
        if (existingPreview) {
            existingPreview.remove();
        }
        
        if (cart.length === 0) return;
        
        const preview = document.createElement('div');
        preview.className = 'cart-preview';
        preview.innerHTML = `
            <div class="cart-preview-content">
                <h4>Added to Cart</h4>
                <div class="cart-preview-item">
                    <img src="${cart[cart.length - 1].image}" alt="${cart[cart.length - 1].name}">
                    <div>
                        <div class="item-name">${cart[cart.length - 1].name}</div>
                        <div class="item-price">${formatCurrency(cart[cart.length - 1].price)}</div>
                    </div>
                </div>
                <div class="cart-preview-total">
                    Total: ${formatCurrency(cart.reduce((sum, item) => sum + (item.price * item.quantity), 0))}
                </div>
                <button onclick="window.location.href='cart.html'" class="view-cart-btn">View Cart</button>
            </div>
        `;
        
        document.body.appendChild(preview);
        
        // Auto hide after 3 seconds
        setTimeout(() => {
            preview.classList.add('hiding');
            setTimeout(() => preview.remove(), 300);
        }, 3000);
    }
    
    setupButtonEffects() {
        // Ripple effect for buttons
        document.addEventListener('click', (e) => {
            const button = e.target.closest('button, .btn');
            if (button && !button.classList.contains('no-ripple')) {
                this.createRipple(e, button);
            }
        });
    }
    
    createRipple(event, element) {
        const circle = document.createElement('span');
        const diameter = Math.max(element.clientWidth, element.clientHeight);
        const radius = diameter / 2;
        
        const rect = element.getBoundingClientRect();
        circle.style.width = circle.style.height = `${diameter}px`;
        circle.style.left = `${event.clientX - rect.left - radius}px`;
        circle.style.top = `${event.clientY - rect.top - radius}px`;
        circle.classList.add('ripple');
        
        const ripple = element.getElementsByClassName('ripple')[0];
        if (ripple) {
            ripple.remove();
        }
        
        element.appendChild(circle);
        
        setTimeout(() => {
            circle.remove();
        }, 600);
    }
    
    setupScrollAnimations() {
        // Intersection Observer for scroll animations
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate-in');
                }
            });
        }, observerOptions);
        
        // Observe elements for animation
        const animateElements = document.querySelectorAll(
            '.product-card, .category-card, .offer-card, .stat-card, .feature-card'
        );
        
        animateElements.forEach(el => {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    }
    
    setupHoverEffects() {
        // Enhanced hover effects for product cards
        document.addEventListener('mouseenter', (e) => {
            const productCard = e.target.closest('.product-card');
            if (productCard) {
                this.enhanceProductCardHover(productCard, true);
            }
        }, true);
        
        document.addEventListener('mouseleave', (e) => {
            const productCard = e.target.closest('.product-card');
            if (productCard) {
                this.enhanceProductCardHover(productCard, false);
            }
        }, true);
    }
    
    enhanceProductCardHover(card, isHovering) {
        const image = card.querySelector('.product-image img');
        const addToCartBtn = card.querySelector('.add-to-cart-btn');
        
        if (isHovering) {
            if (image) {
                image.style.transform = 'scale(1.1)';
            }
            if (addToCartBtn) {
                addToCartBtn.style.transform = 'translateY(-2px)';
                addToCartBtn.style.boxShadow = 'var(--shadow-lg)';
            }
        } else {
            if (image) {
                image.style.transform = 'scale(1)';
            }
            if (addToCartBtn) {
                addToCartBtn.style.transform = 'translateY(0)';
                addToCartBtn.style.boxShadow = 'none';
            }
        }
    }
    
    setupLoadingStates() {
        // Enhanced loading states for forms and buttons
        document.addEventListener('submit', (e) => {
            const form = e.target;
            const submitBtn = form.querySelector('button[type="submit"]');
            
            if (submitBtn && !submitBtn.disabled) {
                this.showButtonLoading(submitBtn);
            }
        });
        
        // Loading states for AJAX requests
        window.eventEmitter.on('requestStart', (element) => {
            this.showLoadingState(element);
        });
        
        window.eventEmitter.on('requestEnd', (element) => {
            this.hideLoadingState(element);
        });
    }
    
    showButtonLoading(button) {
        const originalText = button.innerHTML;
        button.dataset.originalText = originalText;
        button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Loading...';
        button.disabled = true;
        button.classList.add('loading');
    }
    
    hideButtonLoading(button) {
        if (button.dataset.originalText) {
            button.innerHTML = button.dataset.originalText;
            delete button.dataset.originalText;
        }
        button.disabled = false;
        button.classList.remove('loading');
    }
    
    showLoadingState(element) {
        element.classList.add('loading');
        
        // Add skeleton loading for content areas
        if (element.classList.contains('products-grid')) {
            this.showSkeletonLoading(element);
        }
    }
    
    hideLoadingState(element) {
        element.classList.remove('loading');
        this.hideSkeletonLoading(element);
    }
    
    showSkeletonLoading(container) {
        const skeletonHTML = Array(8).fill().map(() => `
            <div class="skeleton-card">
                <div class="skeleton skeleton-image"></div>
                <div class="skeleton skeleton-text"></div>
                <div class="skeleton skeleton-text short"></div>
                <div class="skeleton skeleton-button"></div>
            </div>
        `).join('');
        
        const skeletonContainer = document.createElement('div');
        skeletonContainer.className = 'skeleton-container';
        skeletonContainer.innerHTML = skeletonHTML;
        
        container.appendChild(skeletonContainer);
    }
    
    hideSkeletonLoading(container) {
        const skeletonContainer = container.querySelector('.skeleton-container');
        if (skeletonContainer) {
            skeletonContainer.remove();
        }
    }
    
    setupFormValidations() {
        // Real-time form validation with animations
        document.addEventListener('input', (e) => {
            if (e.target.matches('input, textarea, select')) {
                this.validateField(e.target);
            }
        });
        
        document.addEventListener('blur', (e) => {
            if (e.target.matches('input, textarea, select')) {
                this.validateField(e.target, true);
            }
        });
    }
    
    validateField(field, showErrors = false) {
        const isValid = field.checkValidity();
        const formGroup = field.closest('.form-group');
        
        if (!formGroup) return;
        
        // Remove existing validation classes
        formGroup.classList.remove('valid', 'invalid');
        
        // Remove existing error messages
        const existingError = formGroup.querySelector('.form-error');
        if (existingError) {
            existingError.remove();
        }
        
        if (field.value.trim() === '') {
            return; // Don't validate empty fields unless required
        }
        
        if (isValid) {
            formGroup.classList.add('valid');
            this.showValidationIcon(field, true);
        } else if (showErrors) {
            formGroup.classList.add('invalid');
            this.showValidationIcon(field, false);
            this.showValidationError(field);
        }
    }
    
    showValidationIcon(field, isValid) {
        // Remove existing icons
        const existingIcon = field.parentElement.querySelector('.validation-icon');
        if (existingIcon) {
            existingIcon.remove();
        }
        
        const icon = document.createElement('i');
        icon.className = `fas ${isValid ? 'fa-check' : 'fa-times'} validation-icon`;
        icon.style.cssText = `
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            color: ${isValid ? 'var(--success-color)' : 'var(--error-color)'};
            animation: validationPop 0.3s ease-out;
        `;
        
        field.parentElement.style.position = 'relative';
        field.parentElement.appendChild(icon);
    }
    
    showValidationError(field) {
        const formGroup = field.closest('.form-group');
        const errorMessage = field.validationMessage || 'This field is invalid';
        
        const errorElement = document.createElement('div');
        errorElement.className = 'form-error';
        errorElement.textContent = errorMessage;
        errorElement.style.animation = 'slideDown 0.3s ease-out';
        
        formGroup.appendChild(errorElement);
    }
    
    setupNotificationAnimations() {
        // Enhanced toast notifications
        const originalShowToast = window.showToast;
        window.showToast = (message, type = 'success') => {
            this.showEnhancedToast(message, type);
        };
    }
    
    showEnhancedToast(message, type) {
        // Remove existing toasts
        document.querySelectorAll('.enhanced-toast').forEach(toast => {
            toast.remove();
        });
        
        const toast = document.createElement('div');
        toast.className = `enhanced-toast ${type}`;
        
        const icon = this.getToastIcon(type);
        toast.innerHTML = `
            <div class="toast-content">
                <i class="${icon} toast-icon"></i>
                <span class="toast-message">${message}</span>
                <button class="toast-close" onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.appendChild(toast);
        
        // Animate in
        setTimeout(() => {
            toast.classList.add('show');
        }, 100);
        
        // Auto remove
        setTimeout(() => {
            toast.classList.add('hiding');
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    }
    
    getToastIcon(type) {
        const icons = {
            success: 'fas fa-check-circle',
            error: 'fas fa-exclamation-circle',
            warning: 'fas fa-exclamation-triangle',
            info: 'fas fa-info-circle'
        };
        return icons[type] || icons.info;
    }
}

// Initialize microinteractions
document.addEventListener('DOMContentLoaded', () => {
    new MicroInteractions();
});

// Add CSS for microinteractions
const microInteractionsCSS = `
/* Cart Animation */
@keyframes cartBounce {
    0%, 20%, 53%, 80%, 100% {
        transform: scale(1);
    }
    40%, 43% {
        transform: scale(1.3);
    }
    70% {
        transform: scale(1.1);
    }
    90% {
        transform: scale(1.05);
    }
}

@keyframes floatToCart {
    0% {
        opacity: 1;
        transform: scale(1);
    }
    50% {
        opacity: 0.8;
        transform: scale(0.8) translateY(-20px);
    }
    100% {
        opacity: 0;
        transform: scale(0.3) translateY(-50px) translateX(200px);
    }
}

/* Cart Preview */
.cart-preview {
    position: fixed;
    top: 100px;
    right: 20px;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-xl);
    box-shadow: var(--shadow-xl);
    z-index: 9999;
    max-width: 300px;
    animation: slideInRight 0.3s ease-out;
}

.cart-preview.hiding {
    animation: slideOutRight 0.3s ease-in;
}

.cart-preview-content {
    padding: var(--space-lg);
}

.cart-preview h4 {
    color: var(--text-primary);
    margin-bottom: var(--space-md);
    font-size: var(--font-size-lg);
}

.cart-preview-item {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    margin-bottom: var(--space-md);
}

.cart-preview-item img {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: var(--radius-md);
}

.item-name {
    font-weight: 600;
    color: var(--text-primary);
    font-size: var(--font-size-sm);
}

.item-price {
    color: var(--success-color);
    font-weight: 600;
}

.cart-preview-total {
    font-weight: 700;
    color: var(--text-primary);
    margin-bottom: var(--space-md);
    padding-top: var(--space-md);
    border-top: 1px solid var(--border-color);
}

.view-cart-btn {
    width: 100%;
    background: var(--primary-color);
    color: white;
    border: none;
    border-radius: var(--radius-lg);
    padding: var(--space-sm);
    font-weight: 600;
    cursor: pointer;
    transition: all var(--transition-fast);
}

.view-cart-btn:hover {
    background: var(--primary-hover);
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

@keyframes slideOutRight {
    from {
        opacity: 1;
        transform: translateX(0);
    }
    to {
        opacity: 0;
        transform: translateX(100%);
    }
}

/* Ripple Effect */
.ripple {
    position: absolute;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: scale(0);
    animation: rippleEffect 0.6s linear;
    pointer-events: none;
}

@keyframes rippleEffect {
    to {
        transform: scale(4);
        opacity: 0;
    }
}

/* Scroll Animations */
.animate-on-scroll {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.6s ease-out;
}

.animate-on-scroll.animate-in {
    opacity: 1;
    transform: translateY(0);
}

/* Skeleton Loading */
.skeleton-container {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: var(--space-xl);
}

.skeleton-card {
    background: var(--bg-card);
    border-radius: var(--radius-xl);
    padding: var(--space-lg);
    border: 1px solid var(--border-color);
}

.skeleton {
    background: linear-gradient(90deg, var(--bg-secondary) 25%, var(--bg-tertiary) 50%, var(--bg-secondary) 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
    border-radius: var(--radius-md);
}

.skeleton-image {
    height: 200px;
    margin-bottom: var(--space-md);
}

.skeleton-text {
    height: 20px;
    margin-bottom: var(--space-sm);
}

.skeleton-text.short {
    width: 60%;
}

.skeleton-button {
    height: 40px;
    margin-top: var(--space-md);
}

/* Form Validation */
.form-group.valid .form-control {
    border-color: var(--success-color);
    box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.1);
}

.form-group.invalid .form-control {
    border-color: var(--error-color);
    box-shadow: 0 0 0 3px rgba(239, 68, 68, 0.1);
}

@keyframes validationPop {
    0% {
        opacity: 0;
        transform: translateY(-50%) scale(0.5);
    }
    100% {
        opacity: 1;
        transform: translateY(-50%) scale(1);
    }
}

.form-error {
    color: var(--error-color);
    font-size: var(--font-size-sm);
    margin-top: var(--space-xs);
}

/* Enhanced Toast */
.enhanced-toast {
    position: fixed;
    bottom: var(--space-xl);
    right: var(--space-xl);
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-xl);
    z-index: 9999;
    max-width: 400px;
    transform: translateX(100%);
    transition: transform var(--transition-normal);
}

.enhanced-toast.show {
    transform: translateX(0);
}

.enhanced-toast.hiding {
    transform: translateX(100%);
}

.toast-content {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-lg);
}

.toast-icon {
    font-size: var(--font-size-lg);
    flex-shrink: 0;
}

.enhanced-toast.success .toast-icon {
    color: var(--success-color);
}

.enhanced-toast.error .toast-icon {
    color: var(--error-color);
}

.enhanced-toast.warning .toast-icon {
    color: var(--warning-color);
}

.enhanced-toast.info .toast-icon {
    color: var(--info-color);
}

.toast-message {
    flex: 1;
    color: var(--text-primary);
    font-weight: 500;
}

.toast-close {
    background: none;
    border: none;
    color: var(--text-muted);
    cursor: pointer;
    padding: var(--space-xs);
    border-radius: 50%;
    transition: all var(--transition-fast);
}

.toast-close:hover {
    background: var(--bg-hover);
    color: var(--text-primary);
}

/* Loading States */
.loading {
    opacity: 0.6;
    pointer-events: none;
}

.loading button {
    cursor: not-allowed;
}

/* Enhanced Hover Effects */
.product-card {
    transition: all var(--transition-normal);
}

.product-card:hover {
    transform: translateY(-8px);
}

.category-card:hover {
    transform: translateY(-8px) scale(1.02);
}

/* Stagger Animation for Lists */
.stagger-animation > * {
    opacity: 0;
    transform: translateY(20px);
    animation: staggerIn 0.5s ease-out forwards;
}

.stagger-animation > *:nth-child(1) { animation-delay: 0.1s; }
.stagger-animation > *:nth-child(2) { animation-delay: 0.2s; }
.stagger-animation > *:nth-child(3) { animation-delay: 0.3s; }
.stagger-animation > *:nth-child(4) { animation-delay: 0.4s; }
.stagger-animation > *:nth-child(5) { animation-delay: 0.5s; }
.stagger-animation > *:nth-child(6) { animation-delay: 0.6s; }
.stagger-animation > *:nth-child(7) { animation-delay: 0.7s; }
.stagger-animation > *:nth-child(8) { animation-delay: 0.8s; }

@keyframes staggerIn {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Pulse Animation for Important Elements */
.pulse {
    animation: pulse 2s infinite;
}

@keyframes pulse {
    0%, 100% {
        opacity: 1;
    }
    50% {
        opacity: 0.7;
    }
}

/* Shake Animation for Errors */
.shake {
    animation: shake 0.5s ease-in-out;
}

@keyframes shake {
    0%, 100% { transform: translateX(0); }
    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
    20%, 40%, 60%, 80% { transform: translateX(5px); }
}

/* Glow Effect */
.glow {
    box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
    animation: glow 2s ease-in-out infinite alternate;
}

@keyframes glow {
    from {
        box-shadow: 0 0 20px rgba(59, 130, 246, 0.5);
    }
    to {
        box-shadow: 0 0 30px rgba(59, 130, 246, 0.8);
    }
}

/* Responsive Animations */
@media (max-width: 768px) {
    .cart-preview {
        right: 10px;
        left: 10px;
        max-width: none;
    }
    
    .enhanced-toast {
        right: var(--space-md);
        left: var(--space-md);
        max-width: none;
    }
    
    .animate-on-scroll {
        transform: translateY(20px);
    }
}

/* Reduced Motion Support */
@media (prefers-reduced-motion: reduce) {
    .animate-on-scroll,
    .ripple,
    .skeleton,
    .enhanced-toast,
    .cart-preview {
        animation: none !important;
        transition: none !important;
    }
    
    .product-card:hover,
    .category-card:hover {
        transform: none !important;
    }
}
`;

// Inject microinteractions CSS
const microInteractionsStyle = document.createElement('style');
microInteractionsStyle.textContent = microInteractionsCSS;
document.head.appendChild(microInteractionsStyle);