// Profile page functionality

class ProfilePage {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupTabs();
        this.loadUserData();
        this.loadOrders();
        this.loadWishlist();
        this.loadFeedback();
        this.setupForms();
        
        // Listen for auth changes
        window.eventEmitter.on('userLogin', () => {
            this.loadUserData();
            this.loadOrders();
            this.loadWishlist();
        });
        
        window.eventEmitter.on('userLogout', () => {
            this.clearUserData();
        });
    }
    
    setupTabs() {
        const tabBtns = document.querySelectorAll('.profile-tabs .tab-btn');
        const tabPanes = document.querySelectorAll('.tab-pane');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                
                // Update active tab button
                tabBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update active tab pane
                tabPanes.forEach(pane => {
                    pane.classList.toggle('active', pane.id === `${tabName}Tab`);
                });
                
                // Load tab-specific data
                this.loadTabData(tabName);
            });
        });
    }
    
    loadTabData(tabName) {
        switch (tabName) {
            case 'orders':
                this.loadOrders();
                break;
            case 'wishlist':
                this.loadWishlist();
                break;
            case 'feedback':
                this.loadFeedback();
                break;
        }
    }
    
    loadUserData() {
        const user = authManager.getCurrentUser();
        if (!user) return;
        
        // Populate profile form
        const editName = document.getElementById('editName');
        const editEmail = document.getElementById('editEmail');
        const editPhone = document.getElementById('editPhone');
        const editAddress = document.getElementById('editAddress');
        
        if (editName) editName.value = user.name || '';
        if (editEmail) editEmail.value = user.email || '';
        if (editPhone) editPhone.value = user.phone || '';
        if (editAddress) editAddress.value = user.address || '';
    }
    
    clearUserData() {
        // Clear all forms
        const forms = document.querySelectorAll('.profile-form, .password-form, .feedback-form');
        forms.forEach(form => form.reset());
        
        // Clear lists
        const ordersList = document.getElementById('ordersList');
        const wishlistGrid = document.getElementById('wishlistGrid');
        const feedbackList = document.getElementById('feedbackList');
        
        if (ordersList) ordersList.innerHTML = '';
        if (wishlistGrid) wishlistGrid.innerHTML = '';
        if (feedbackList) feedbackList.innerHTML = '';
        
        // Show empty states
        this.showEmptyState('orders');
        this.showEmptyState('wishlist');
    }
    
    loadOrders() {
        const ordersList = document.getElementById('ordersList');
        const noOrders = document.getElementById('noOrders');
        
        if (!ordersList) return;
        
        const user = authManager.getCurrentUser();
        if (!user) {
            this.showEmptyState('orders');
            return;
        }
        
        const allOrders = Storage.get('orders', []);
        const userOrders = allOrders.filter(order => order.userId === user.id);
        
        if (userOrders.length === 0) {
            this.showEmptyState('orders');
            return;
        }
        
        if (noOrders) noOrders.style.display = 'none';
        
        ordersList.innerHTML = userOrders.map(order => `
            <div class="order-item" data-order-id="${order.id}">
                <div class="order-header">
                    <div class="order-id">${order.id}</div>
                    <div class="order-status ${order.status}">${order.status}</div>
                </div>
                <div class="order-details">
                    <div class="order-date">${formatDate(order.createdAt)}</div>
                    <div class="order-items-count">${order.items.length} items</div>
                    <div class="order-total">${formatCurrency(order.pricing.total)}</div>
                </div>
            </div>
        `).join('');
        
        // Add click listeners for order details
        this.setupOrderClickListeners();
    }
    
    setupOrderClickListeners() {
        const orderItems = document.querySelectorAll('.order-item');
        orderItems.forEach(item => {
            item.addEventListener('click', () => {
                const orderId = item.dataset.orderId;
                this.showOrderDetails(orderId);
            });
        });
    }
    
    showOrderDetails(orderId) {
        const allOrders = Storage.get('orders', []);
        const order = allOrders.find(o => o.id === orderId);
        
        if (!order) return;
        
        const modal = document.getElementById('orderModal');
        if (!modal) return;
        
        const orderInfo = document.getElementById('orderInfo');
        if (!orderInfo) return;
        
        orderInfo.innerHTML = `
            <div class="order-detail-header">
                <h3>Order ${order.id}</h3>
                <div class="order-status ${order.status}">${order.status}</div>
            </div>
            
            <div class="order-detail-section">
                <h4>Order Information</h4>
                <p><strong>Date:</strong> ${formatDate(order.createdAt)}</p>
                <p><strong>Status:</strong> ${order.status}</p>
                <p><strong>Payment Method:</strong> ${order.payment.method}</p>
                <p><strong>Estimated Delivery:</strong> ${formatDate(order.estimatedDelivery)}</p>
            </div>
            
            <div class="order-detail-section">
                <h4>Delivery Address</h4>
                <p>${order.delivery.address}</p>
                <p><strong>Phone:</strong> ${order.delivery.phone}</p>
            </div>
            
            <div class="order-detail-section">
                <h4>Order Items</h4>
                <div class="order-items-detail">
                    ${order.items.map(item => `
                        <div class="order-item-detail">
                            <img src="${item.image}" alt="${item.name}">
                            <div class="item-info">
                                <h5>${item.name}</h5>
                                <p>Quantity: ${item.quantity}</p>
                                <p>Price: ${formatCurrency(item.price)}</p>
                            </div>
                            <div class="item-total">${formatCurrency(item.price * item.quantity)}</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <div class="order-detail-section">
                <h4>Order Summary</h4>
                <div class="order-summary-detail">
                    <div class="summary-row"><span>Subtotal:</span><span>${formatCurrency(order.pricing.subtotal)}</span></div>
                    <div class="summary-row"><span>Tax:</span><span>${formatCurrency(order.pricing.tax)}</span></div>
                    <div class="summary-row"><span>Delivery:</span><span>${formatCurrency(order.pricing.deliveryFee)}</span></div>
                    ${order.pricing.discount > 0 ? `<div class="summary-row discount"><span>Discount:</span><span>-${formatCurrency(order.pricing.discount)}</span></div>` : ''}
                    <div class="summary-total"><span>Total:</span><span>${formatCurrency(order.pricing.total)}</span></div>
                </div>
            </div>
        `;
        
        modal.style.display = 'block';
        Animation.fadeIn(modal);
        
        // Setup modal close
        const closeBtn = modal.querySelector('.close-btn');
        if (closeBtn) {
            closeBtn.onclick = () => {
                Animation.fadeOut(modal);
                setTimeout(() => modal.style.display = 'none', 300);
            };
        }
        
        modal.onclick = (e) => {
            if (e.target === modal) {
                Animation.fadeOut(modal);
                setTimeout(() => modal.style.display = 'none', 300);
            }
        };
    }
    
    loadWishlist() {
        const wishlistGrid = document.getElementById('wishlistGrid');
        const noWishlist = document.getElementById('noWishlist');
        
        if (!wishlistGrid) return;
        
        const user = authManager.getCurrentUser();
        if (!user) {
            this.showEmptyState('wishlist');
            return;
        }
        
        const wishlist = Storage.get('wishlist', []);
        
        if (wishlist.length === 0) {
            this.showEmptyState('wishlist');
            return;
        }
        
        if (noWishlist) noWishlist.style.display = 'none';
        
        wishlistGrid.innerHTML = wishlist.map(item => `
            <div class="wishlist-item" data-product-id="${item.id}">
                <img src="${item.image}" alt="${item.name}">
                <h4>${item.name}</h4>
                <div class="price">${formatCurrency(item.price)}</div>
                <div class="wishlist-actions">
                    <button class="add-to-cart" data-product='${JSON.stringify(item)}'>
                        <i class="fas fa-cart-plus"></i> Add to Cart
                    </button>
                    <button class="remove-wishlist" data-product-id="${item.id}">
                        <i class="fas fa-trash"></i> Remove
                    </button>
                </div>
            </div>
        `).join('');
        
        // Setup wishlist actions
        this.setupWishlistActions();
    }
    
    setupWishlistActions() {
        const wishlistGrid = document.getElementById('wishlistGrid');
        if (!wishlistGrid) return;
        
        wishlistGrid.addEventListener('click', (e) => {
            if (e.target.classList.contains('add-to-cart') || e.target.closest('.add-to-cart')) {
                const button = e.target.classList.contains('add-to-cart') ? e.target : e.target.closest('.add-to-cart');
                const productData = JSON.parse(button.dataset.product);
                cartManager.addItem(productData);
            }
            
            if (e.target.classList.contains('remove-wishlist') || e.target.closest('.remove-wishlist')) {
                const button = e.target.classList.contains('remove-wishlist') ? e.target : e.target.closest('.remove-wishlist');
                const productId = button.dataset.productId;
                this.removeFromWishlist(productId);
            }
        });
    }
    
    removeFromWishlist(productId) {
        const wishlist = Storage.get('wishlist', []);
        const updatedWishlist = wishlist.filter(item => item.id !== productId);
        Storage.set('wishlist', updatedWishlist);
        
        showToast('Item removed from wishlist', 'success');
        this.loadWishlist();
        
        // Emit wishlist update event
        window.eventEmitter.emit('wishlistUpdated', updatedWishlist);
    }
    
    loadFeedback() {
        const feedbackList = document.getElementById('feedbackList');
        if (!feedbackList) return;
        
        const user = authManager.getCurrentUser();
        if (!user) return;
        
        const allFeedback = Storage.get('feedback', []);
        const userFeedback = allFeedback.filter(feedback => feedback.userId === user.id);
        
        if (userFeedback.length === 0) {
            feedbackList.innerHTML = '<p>No feedback submitted yet.</p>';
            return;
        }
        
        feedbackList.innerHTML = userFeedback.map(feedback => `
            <div class="feedback-item">
                <div class="feedback-header">
                    <div class="feedback-subject">${feedback.subject}</div>
                    <div class="feedback-date">${formatDate(feedback.createdAt)}</div>
                </div>
                <div class="feedback-rating">
                    ${this.generateStars(feedback.rating)}
                </div>
                <div class="feedback-message">${feedback.message}</div>
            </div>
        `).join('');
    }
    
    generateStars(rating) {
        let stars = '';
        for (let i = 1; i <= 5; i++) {
            stars += `<i class="fas fa-star" style="color: ${i <= rating ? 'var(--warning-color)' : 'var(--text-muted)'}"></i>`;
        }
        return stars;
    }
    
    showEmptyState(type) {
        const containers = {
            orders: { list: 'ordersList', empty: 'noOrders' },
            wishlist: { list: 'wishlistGrid', empty: 'noWishlist' }
        };
        
        const container = containers[type];
        if (!container) return;
        
        const listEl = document.getElementById(container.list);
        const emptyEl = document.getElementById(container.empty);
        
        if (listEl) listEl.innerHTML = '';
        if (emptyEl) emptyEl.style.display = 'block';
    }
    
    setupForms() {
        this.setupProfileForm();
        this.setupPasswordForm();
        this.setupFeedbackForm();
    }
    
    setupProfileForm() {
        const profileForm = document.getElementById('profileForm');
        if (!profileForm) return;
        
        profileForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const user = authManager.getCurrentUser();
            if (!user) return;
            
            const formData = new FormData(profileForm);
            const updatedUser = {
                ...user,
                name: document.getElementById('editName').value,
                email: document.getElementById('editEmail').value,
                phone: document.getElementById('editPhone').value,
                address: document.getElementById('editAddress').value
            };
            
            try {
                // Simulate API call
                await API.delay(1000);
                
                // Update user in storage
                const users = Storage.get('users', []);
                const userIndex = users.findIndex(u => u.id === user.id);
                if (userIndex > -1) {
                    users[userIndex] = updatedUser;
                    Storage.set('users', users);
                }
                
                // Update current user
                Storage.set('currentUser', updatedUser);
                authManager.currentUser = updatedUser;
                authManager.updateUI();
                
                showToast('Profile updated successfully', 'success');
                
            } catch (error) {
                showToast('Failed to update profile', 'error');
            }
        });
    }
    
    setupPasswordForm() {
        const passwordForm = document.getElementById('passwordForm');
        if (!passwordForm) return;
        
        passwordForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const user = authManager.getCurrentUser();
            if (!user) return;
            
            const inputs = passwordForm.querySelectorAll('input');
            const currentPassword = inputs[0].value;
            const newPassword = inputs[1].value;
            const confirmPassword = inputs[2].value;
            
            // Validate current password
            if (currentPassword !== user.password) {
                showToast('Current password is incorrect', 'error');
                return;
            }
            
            // Validate new password
            if (!Validation.password(newPassword)) {
                showToast('New password must be at least 6 characters long', 'error');
                return;
            }
            
            if (newPassword !== confirmPassword) {
                showToast('New passwords do not match', 'error');
                return;
            }
            
            try {
                // Simulate API call
                await API.delay(1000);
                
                // Update password
                const updatedUser = { ...user, password: newPassword };
                
                const users = Storage.get('users', []);
                const userIndex = users.findIndex(u => u.id === user.id);
                if (userIndex > -1) {
                    users[userIndex] = updatedUser;
                    Storage.set('users', users);
                }
                
                Storage.set('currentUser', updatedUser);
                authManager.currentUser = updatedUser;
                
                passwordForm.reset();
                showToast('Password changed successfully', 'success');
                
            } catch (error) {
                showToast('Failed to change password', 'error');
            }
        });
    }
    
    setupFeedbackForm() {
        const feedbackForm = document.getElementById('feedbackForm');
        if (!feedbackForm) return;
        
        feedbackForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const user = authManager.getCurrentUser();
            if (!user) return;
            
            const formData = new FormData(feedbackForm);
            const subject = formData.get('subject') || feedbackForm.querySelector('select').value;
            const rating = formData.get('rating') || document.querySelector('input[name="rating"]:checked')?.value;
            const message = formData.get('message') || feedbackForm.querySelector('textarea').value;
            
            if (!subject || !rating || !message.trim()) {
                showToast('Please fill in all fields', 'error');
                return;
            }
            
            try {
                // Simulate API call
                await API.delay(1000);
                
                const feedback = {
                    id: generateId(),
                    userId: user.id,
                    userName: user.name,
                    subject: subject,
                    rating: parseInt(rating),
                    message: message.trim(),
                    createdAt: new Date().toISOString()
                };
                
                const allFeedback = Storage.get('feedback', []);
                allFeedback.unshift(feedback);
                Storage.set('feedback', allFeedback);
                
                feedbackForm.reset();
                showToast('Feedback submitted successfully', 'success');
                this.loadFeedback();
                
            } catch (error) {
                showToast('Failed to submit feedback', 'error');
            }
        });
    }
}

// Initialize profile page functionality
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('profile.html')) {
        new ProfilePage();
    }
});

// Add CSS for profile page
const profileCSS = `
.order-detail-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 2rem;
    padding-bottom: 1rem;
    border-bottom: 1px solid var(--border-color);
}

.order-detail-section {
    margin-bottom: 2rem;
}

.order-detail-section h4 {
    color: var(--text-primary);
    margin-bottom: 1rem;
}

.order-items-detail {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.order-item-detail {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: var(--bg-tertiary);
    border-radius: 8px;
}

.order-item-detail img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: 8px;
}

.order-item-detail .item-info {
    flex: 1;
}

.order-item-detail .item-info h5 {
    margin-bottom: 0.5rem;
    color: var(--text-primary);
}

.order-item-detail .item-info p {
    color: var(--text-secondary);
    font-size: 0.9rem;
    margin-bottom: 0.2rem;
}

.order-item-detail .item-total {
    font-weight: 600;
    color: var(--success-color);
}

.order-summary-detail {
    background: var(--bg-tertiary);
    border-radius: 8px;
    padding: 1rem;
}

.order-summary-detail .summary-row {
    display: flex;
    justify-content: space-between;
    margin-bottom: 0.5rem;
    color: var(--text-secondary);
}

.order-summary-detail .summary-total {
    display: flex;
    justify-content: space-between;
    font-weight: 700;
    font-size: 1.1rem;
    color: var(--text-primary);
    padding-top: 0.5rem;
    border-top: 1px solid var(--border-color);
    margin-top: 0.5rem;
}

.order-summary-detail .discount {
    color: var(--success-color);
}

@media (max-width: 768px) {
    .order-item-detail {
        flex-direction: column;
        text-align: center;
    }
    
    .order-detail-header {
        flex-direction: column;
        gap: 1rem;
    }
}
`;

// Inject profile CSS
const profileStyle = document.createElement('style');
profileStyle.textContent = profileCSS;
document.head.appendChild(profileStyle);