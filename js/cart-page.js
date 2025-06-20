// Cart page specific functionality

class CartPage {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupCheckout();
        this.loadCartData();
        
        // Listen for cart updates
        window.eventEmitter.on('cartUpdated', () => {
            this.loadCartData();
        });
    }
    
    loadCartData() {
        // Cart data is already loaded by CartManager
        // This method can be used for any cart page specific updates
        this.updateCheckoutButton();
    }
    
    updateCheckoutButton() {
        const checkoutBtn = document.getElementById('checkoutBtn');
        const cart = cartManager.getCart();
        
        if (checkoutBtn) {
            checkoutBtn.disabled = cart.length === 0;
            if (cart.length === 0) {
                checkoutBtn.textContent = 'Cart is Empty';
            } else {
                checkoutBtn.textContent = 'Proceed to Checkout';
            }
        }
    }
    
    setupCheckout() {
        const checkoutBtn = document.getElementById('checkoutBtn');
        const checkoutModal = document.getElementById('checkoutModal');
        
        if (checkoutBtn) {
            checkoutBtn.addEventListener('click', () => {
                if (cartManager.getCart().length === 0) {
                    showToast('Your cart is empty', 'warning');
                    return;
                }
                
                if (!authManager.isLoggedIn()) {
                    showToast('Please login to proceed with checkout', 'warning');
                    authManager.showAuthModal();
                    return;
                }
                
                this.showCheckoutModal();
            });
        }
        
        this.setupCheckoutModal();
    }
    
    setupCheckoutModal() {
        const modal = document.getElementById('checkoutModal');
        if (!modal) return;
        
        const closeBtn = modal.querySelector('.close-btn');
        const checkoutForm = document.getElementById('checkoutForm');
        
        // Close modal
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideCheckoutModal();
            });
        }
        
        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideCheckoutModal();
            }
        });
        
        // Setup step navigation
        this.setupCheckoutSteps();
        
        // Setup form submission
        if (checkoutForm) {
            checkoutForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.processOrder();
            });
        }
    }
    
    setupCheckoutSteps() {
        const nextStepBtns = document.querySelectorAll('.next-step');
        const prevStepBtns = document.querySelectorAll('.prev-step');
        
        nextStepBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.nextCheckoutStep();
            });
        });
        
        prevStepBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                this.prevCheckoutStep();
            });
        });
        
        // Payment method change
        const paymentMethods = document.querySelectorAll('input[name="payment"]');
        paymentMethods.forEach(method => {
            method.addEventListener('change', () => {
                this.toggleCardDetails(method.value === 'card');
            });
        });
    }
    
    showCheckoutModal() {
        const modal = document.getElementById('checkoutModal');
        if (!modal) return;
        
        // Reset to first step
        this.goToCheckoutStep(1);
        
        // Populate order review
        this.populateOrderReview();
        
        // Show modal
        modal.style.display = 'block';
        Animation.fadeIn(modal);
    }
    
    hideCheckoutModal() {
        const modal = document.getElementById('checkoutModal');
        if (modal) {
            Animation.fadeOut(modal);
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }
    
    goToCheckoutStep(stepNumber) {
        const steps = document.querySelectorAll('.step');
        const stepPanes = document.querySelectorAll('.checkout-step');
        
        // Update step indicators
        steps.forEach((step, index) => {
            step.classList.toggle('active', index + 1 === stepNumber);
        });
        
        // Update step content
        stepPanes.forEach((pane, index) => {
            pane.classList.toggle('active', index + 1 === stepNumber);
        });
    }
    
    nextCheckoutStep() {
        const activeStep = document.querySelector('.checkout-step.active');
        const stepNumber = Array.from(document.querySelectorAll('.checkout-step')).indexOf(activeStep) + 1;
        
        // Validate current step
        if (!this.validateCheckoutStep(stepNumber)) {
            return;
        }
        
        if (stepNumber < 3) {
            this.goToCheckoutStep(stepNumber + 1);
        }
    }
    
    prevCheckoutStep() {
        const activeStep = document.querySelector('.checkout-step.active');
        const stepNumber = Array.from(document.querySelectorAll('.checkout-step')).indexOf(activeStep) + 1;
        
        if (stepNumber > 1) {
            this.goToCheckoutStep(stepNumber - 1);
        }
    }
    
    validateCheckoutStep(stepNumber) {
        switch (stepNumber) {
            case 1: // Delivery step
                const deliveryInputs = document.querySelectorAll('#deliveryStep input[required], #deliveryStep textarea[required]');
                for (let input of deliveryInputs) {
                    if (!input.value.trim()) {
                        showToast('Please fill in all required delivery information', 'error');
                        input.focus();
                        return false;
                    }
                }
                break;
                
            case 2: // Payment step
                const paymentMethod = document.querySelector('input[name="payment"]:checked');
                if (!paymentMethod) {
                    showToast('Please select a payment method', 'error');
                    return false;
                }
                
                if (paymentMethod.value === 'card') {
                    const cardInputs = document.querySelectorAll('#cardDetails input[required]');
                    for (let input of cardInputs) {
                        if (!input.value.trim()) {
                            showToast('Please fill in all card details', 'error');
                            input.focus();
                            return false;
                        }
                    }
                }
                break;
        }
        
        return true;
    }
    
    toggleCardDetails(show) {
        const cardDetails = document.getElementById('cardDetails');
        if (cardDetails) {
            cardDetails.style.display = show ? 'block' : 'none';
        }
    }
    
    populateOrderReview() {
        const orderReview = document.getElementById('orderReview');
        const finalTotal = document.getElementById('finalTotal');
        
        if (!orderReview) return;
        
        const cart = cartManager.getCart();
        const appliedCoupon = cartManager.getAppliedCoupon();
        
        let reviewHTML = '<h4>Order Items</h4>';
        reviewHTML += cart.map(item => `
            <div class="review-item">
                <span>${item.name} x ${item.quantity}</span>
                <span>${formatCurrency(item.price * item.quantity)}</span>
            </div>
        `).join('');
        
        reviewHTML += '<div class="review-summary">';
        reviewHTML += `<div class="review-row"><span>Subtotal:</span><span>${formatCurrency(cartManager.getSubtotal())}</span></div>`;
        reviewHTML += `<div class="review-row"><span>Tax:</span><span>${formatCurrency(cartManager.getTax())}</span></div>`;
        reviewHTML += `<div class="review-row"><span>Delivery:</span><span>${formatCurrency(cartManager.getDeliveryFee())}</span></div>`;
        
        if (appliedCoupon) {
            reviewHTML += `<div class="review-row discount"><span>Discount:</span><span>-${formatCurrency(appliedCoupon.discount)}</span></div>`;
        }
        
        reviewHTML += '</div>';
        
        orderReview.innerHTML = reviewHTML;
        
        // Update final total
        let total = cartManager.getTotal();
        if (appliedCoupon) {
            total -= appliedCoupon.discount;
        }
        
        if (finalTotal) {
            finalTotal.textContent = formatCurrency(total);
        }
    }
    
    async processOrder() {
        try {
            // Show loading state
            const submitBtn = document.querySelector('.place-order-btn');
            const originalText = submitBtn.textContent;
            submitBtn.textContent = 'Processing...';
            submitBtn.disabled = true;
            
            // Simulate order processing
            await API.delay(2000);
            
            // Create order object
            const order = this.createOrder();
            
            // Save order
            const orders = Storage.get('orders', []);
            orders.unshift(order);
            Storage.set('orders', orders);
            
            // Clear cart
            cartManager.clearCart();
            
            // Remove applied coupon
            Storage.remove('appliedCoupon');
            
            // Hide modal
            this.hideCheckoutModal();
            
            // Show success message
            showToast(`Order placed successfully! Order ID: ${order.id}`, 'success');
            
            // Redirect to profile page to view order
            setTimeout(() => {
                window.location.href = 'profile.html';
            }, 2000);
            
        } catch (error) {
            showToast('Failed to process order. Please try again.', 'error');
            console.error('Order processing error:', error);
        } finally {
            // Reset button
            const submitBtn = document.querySelector('.place-order-btn');
            if (submitBtn) {
                submitBtn.textContent = 'Place Order';
                submitBtn.disabled = false;
            }
        }
    }
    
    createOrder() {
        const cart = cartManager.getCart();
        const appliedCoupon = cartManager.getAppliedCoupon();
        const user = authManager.getCurrentUser();
        
        // Get form data
        const deliveryInputs = document.querySelectorAll('#deliveryStep input, #deliveryStep textarea');
        const deliveryData = {};
        deliveryInputs.forEach(input => {
            if (input.name || input.id) {
                deliveryData[input.name || input.id] = input.value;
            }
        });
        
        const paymentMethod = document.querySelector('input[name="payment"]:checked').value;
        const deliveryOption = document.querySelector('input[name="delivery"]:checked').value;
        
        const subtotal = cartManager.getSubtotal();
        const tax = cartManager.getTax();
        const deliveryFee = cartManager.getDeliveryFee();
        const discount = appliedCoupon ? appliedCoupon.discount : 0;
        const total = subtotal + tax + deliveryFee - discount;
        
        return {
            id: generateOrderId(),
            userId: user.id,
            customerName: user.name,
            customerEmail: user.email,
            items: cart.map(item => ({
                id: item.id,
                name: item.name,
                price: item.price,
                quantity: item.quantity,
                image: item.image
            })),
            delivery: {
                option: deliveryOption,
                address: deliveryData.address || deliveryData.textarea,
                phone: deliveryData.phone || deliveryData.tel
            },
            payment: {
                method: paymentMethod,
                status: 'pending'
            },
            pricing: {
                subtotal,
                tax,
                deliveryFee,
                discount,
                total
            },
            appliedCoupon: appliedCoupon ? appliedCoupon.code : null,
            status: 'pending',
            createdAt: new Date().toISOString(),
            estimatedDelivery: this.calculateEstimatedDelivery(deliveryOption)
        };
    }
    
    calculateEstimatedDelivery(deliveryOption) {
        const now = new Date();
        const deliveryDate = new Date(now);
        
        if (deliveryOption === 'express') {
            deliveryDate.setDate(now.getDate() + 1);
        } else {
            deliveryDate.setDate(now.getDate() + 3);
        }
        
        return deliveryDate.toISOString();
    }
}

// Initialize cart page functionality
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('cart.html')) {
        new CartPage();
    }
});

// Add CSS for checkout modal
const checkoutCSS = `
.review-item {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    border-bottom: 1px solid var(--border-color);
}

.review-item:last-child {
    border-bottom: none;
}

.review-summary {
    margin-top: 1rem;
    padding-top: 1rem;
    border-top: 1px solid var(--border-color);
}

.review-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    color: var(--text-secondary);
}

.review-row.discount {
    color: var(--success-color);
}

.card-details {
    margin-top: 1rem;
}

.card-details input {
    margin-bottom: 1rem;
}
`;

// Inject checkout CSS
const checkoutStyle = document.createElement('style');
checkoutStyle.textContent = checkoutCSS;
document.head.appendChild(checkoutStyle);