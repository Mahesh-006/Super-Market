// Shopping cart management for SuperMart

class CartManager {
    constructor() {
        this.cart = [];
        this.init();
    }
    
    init() {
        this.loadCart();
        this.updateCartUI();
        this.setupEventListeners();
    }
    
    loadCart() {
        this.cart = Storage.get('cart', []);
    }
    
    saveCart() {
        Storage.set('cart', this.cart);
        this.updateCartUI();
        window.eventEmitter.emit('cartUpdated', this.cart);
    }
    
    setupEventListeners() {
        // Listen for product additions
        window.eventEmitter.on('addToCart', (product) => {
            this.addItem(product);
        });
        
        // Listen for user login/logout to handle cart persistence
        window.eventEmitter.on('userLogin', () => {
            this.loadCart();
        });
        
        window.eventEmitter.on('userLogout', () => {
            // Keep cart for guest users
            this.updateCartUI();
        });
    }
    
    addItem(product, quantity = 1) {
        const existingItem = this.cart.find(item => item.id === product.id);
        
        if (existingItem) {
            existingItem.quantity += quantity;
        } else {
            this.cart.push({
                ...product,
                quantity: quantity,
                addedAt: new Date().toISOString()
            });
        }
        
        this.saveCart();
        showToast(`${product.name} added to cart`, 'success');
    }
    
    removeItem(productId) {
        const itemIndex = this.cart.findIndex(item => item.id === productId);
        if (itemIndex > -1) {
            const item = this.cart[itemIndex];
            this.cart.splice(itemIndex, 1);
            this.saveCart();
            showToast(`${item.name} removed from cart`, 'success');
        }
    }
    
    updateQuantity(productId, quantity) {
        const item = this.cart.find(item => item.id === productId);
        if (item) {
            if (quantity <= 0) {
                this.removeItem(productId);
            } else {
                item.quantity = quantity;
                this.saveCart();
            }
        }
    }
    
    clearCart() {
        this.cart = [];
        this.saveCart();
        showToast('Cart cleared', 'success');
    }
    
    getCart() {
        return this.cart;
    }
    
    getItemCount() {
        return this.cart.reduce((total, item) => total + item.quantity, 0);
    }
    
    getSubtotal() {
        return this.cart.reduce((total, item) => total + (item.price * item.quantity), 0);
    }
    
    getTax(subtotal = null) {
        const amount = subtotal || this.getSubtotal();
        const taxRate = Storage.get('taxRate', 8) / 100;
        return amount * taxRate;
    }
    
    getDeliveryFee() {
        const subtotal = this.getSubtotal();
        const freeDeliveryMin = Storage.get('freeDeliveryMin', 50);
        const standardFee = Storage.get('standardDeliveryFee', 2.99);
        
        return subtotal >= freeDeliveryMin ? 0 : standardFee;
    }
    
    getTotal() {
        const subtotal = this.getSubtotal();
        const tax = this.getTax(subtotal);
        const delivery = this.getDeliveryFee();
        return subtotal + tax + delivery;
    }
    
    updateCartUI() {
        this.updateCartCount();
        this.updateCartPage();
    }
    
    updateCartCount() {
        const cartCounts = document.querySelectorAll('#cartCount, .cart-count');
        const count = this.getItemCount();
        
        cartCounts.forEach(element => {
            if (element) {
                element.textContent = count;
                element.style.display = count > 0 ? 'inline' : 'none';
            }
        });
    }
    
    updateCartPage() {
        const cartItems = document.getElementById('cartItems');
        const cartEmpty = document.getElementById('cartEmpty');
        const cartSummary = document.getElementById('cartSummary');
        
        if (!cartItems) return;
        
        if (this.cart.length === 0) {
            if (cartEmpty) cartEmpty.style.display = 'block';
            if (cartSummary) cartSummary.style.display = 'none';
            cartItems.innerHTML = '';
            return;
        }
        
        if (cartEmpty) cartEmpty.style.display = 'none';
        if (cartSummary) cartSummary.style.display = 'block';
        
        cartItems.innerHTML = this.cart.map(item => `
            <div class="cart-item" data-id="${item.id}">
                <img src="${item.image}" alt="${item.name}">
                <div class="cart-item-info">
                    <h4>${item.name}</h4>
                    <p class="price">${formatCurrency(item.price)} each</p>
                </div>
                <div class="cart-item-controls">
                    <div class="quantity-controls">
                        <button class="qty-btn decrease-qty" data-id="${item.id}">-</button>
                        <span class="quantity">${item.quantity}</span>
                        <button class="qty-btn increase-qty" data-id="${item.id}">+</button>
                    </div>
                    <div class="item-total">${formatCurrency(item.price * item.quantity)}</div>
                    <button class="remove-item" data-id="${item.id}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `).join('');
        
        // Add event listeners for cart controls
        this.setupCartControls();
        
        // Update summary
        this.updateCartSummary();
    }
    
    setupCartControls() {
        const cartItems = document.getElementById('cartItems');
        if (!cartItems) return;
        
        cartItems.addEventListener('click', (e) => {
            const productId = e.target.dataset.id;
            if (!productId) return;
            
            if (e.target.classList.contains('increase-qty')) {
                const item = this.cart.find(item => item.id === productId);
                if (item) {
                    this.updateQuantity(productId, item.quantity + 1);
                }
            } else if (e.target.classList.contains('decrease-qty')) {
                const item = this.cart.find(item => item.id === productId);
                if (item) {
                    this.updateQuantity(productId, item.quantity - 1);
                }
            } else if (e.target.classList.contains('remove-item') || e.target.parentElement.classList.contains('remove-item')) {
                this.removeItem(productId);
            }
        });
    }
    
    updateCartSummary() {
        const subtotal = this.getSubtotal();
        const tax = this.getTax(subtotal);
        const delivery = this.getDeliveryFee();
        const total = subtotal + tax + delivery;
        
        const subtotalEl = document.getElementById('subtotal');
        const taxEl = document.getElementById('tax');
        const deliveryFeeEl = document.getElementById('deliveryFee');
        const totalEl = document.getElementById('total');
        
        if (subtotalEl) subtotalEl.textContent = formatCurrency(subtotal);
        if (taxEl) taxEl.textContent = formatCurrency(tax);
        if (deliveryFeeEl) deliveryFeeEl.textContent = formatCurrency(delivery);
        if (totalEl) totalEl.textContent = formatCurrency(total);
    }
    
    applyCoupon(code) {
        const coupons = {
            'SAVE10': { discount: 0.1, type: 'percentage', description: '10% off' },
            'SAVE20': { discount: 0.2, type: 'percentage', description: '20% off' },
            'FIRST5': { discount: 5, type: 'fixed', description: '$5 off' },
            'WELCOME': { discount: 0.15, type: 'percentage', description: '15% off' }
        };
        
        const coupon = coupons[code.toUpperCase()];
        if (!coupon) {
            showToast('Invalid coupon code', 'error');
            return false;
        }
        
        const subtotal = this.getSubtotal();
        let discount = 0;
        
        if (coupon.type === 'percentage') {
            discount = subtotal * coupon.discount;
        } else {
            discount = coupon.discount;
        }
        
        // Store applied coupon
        Storage.set('appliedCoupon', { code, discount, description: coupon.description });
        
        // Update UI
        const discountRow = document.getElementById('discountRow');
        const discountEl = document.getElementById('discount');
        
        if (discountRow && discountEl) {
            discountRow.style.display = 'flex';
            discountEl.textContent = `-${formatCurrency(discount)}`;
        }
        
        // Update total
        const totalEl = document.getElementById('total');
        if (totalEl) {
            const newTotal = this.getTotal() - discount;
            totalEl.textContent = formatCurrency(newTotal);
        }
        
        showToast(`Coupon applied: ${coupon.description}`, 'success');
        return true;
    }
    
    getAppliedCoupon() {
        return Storage.get('appliedCoupon', null);
    }
    
    removeCoupon() {
        Storage.remove('appliedCoupon');
        
        const discountRow = document.getElementById('discountRow');
        if (discountRow) {
            discountRow.style.display = 'none';
        }
        
        this.updateCartSummary();
        showToast('Coupon removed', 'success');
    }
}

// Initialize cart manager
const cartManager = new CartManager();

// Make it globally available
window.cartManager = cartManager;

// Setup global event listeners
document.addEventListener('DOMContentLoaded', () => {
    // Add to cart buttons
    document.addEventListener('click', (e) => {
        if (e.target.classList.contains('add-to-cart-btn') || e.target.closest('.add-to-cart-btn')) {
            const button = e.target.classList.contains('add-to-cart-btn') ? e.target : e.target.closest('.add-to-cart-btn');
            const productCard = button.closest('.product-card');
            
            if (productCard) {
                const productData = JSON.parse(productCard.dataset.product || '{}');
                if (productData.id) {
                    cartManager.addItem(productData);
                }
            }
        }
    });
    
    // Coupon application
    const applyCouponBtn = document.getElementById('applyCoupon');
    const couponInput = document.getElementById('couponInput');
    
    if (applyCouponBtn && couponInput) {
        applyCouponBtn.addEventListener('click', () => {
            const code = couponInput.value.trim();
            if (code) {
                cartManager.applyCoupon(code);
                couponInput.value = '';
            }
        });
        
        couponInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                applyCouponBtn.click();
            }
        });
    }
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = CartManager;
}