// Enhanced Features for SuperMart - Additional functionality inspired by React component

class EnhancedFeatures {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupAdvancedSearch();
        this.setupProductFiltering();
        this.setupWishlistFeatures();
        this.setupOrderTracking();
        this.setupStoreStatus();
        this.setupThirdPartyIntegrations();
        this.setupAdvancedProductModal();
        this.setupInventoryManagement();
    }
    
    setupAdvancedSearch() {
        // Enhanced search with category suggestions and recent searches
        const searchInputs = document.querySelectorAll('#searchInput, .search-input');
        
        searchInputs.forEach(input => {
            input.addEventListener('input', debounce((e) => {
                this.performAdvancedSearch(e.target.value);
            }, 300));
        });
    }
    
    performAdvancedSearch(query) {
        if (!query.trim()) return;
        
        const products = Storage.get('products', []);
        const results = products.filter(product => 
            product.name.toLowerCase().includes(query.toLowerCase()) ||
            product.description.toLowerCase().includes(query.toLowerCase()) ||
            product.category.toLowerCase().includes(query.toLowerCase())
        );
        
        // Save recent search
        const recentSearches = Storage.get('recentSearches', []);
        if (!recentSearches.includes(query)) {
            recentSearches.unshift(query);
            if (recentSearches.length > 10) recentSearches.pop();
            Storage.set('recentSearches', recentSearches);
        }
        
        // Emit search results
        window.eventEmitter.emit('searchResults', { query, results });
    }
    
    setupProductFiltering() {
        // Advanced filtering with multiple criteria
        const filterContainer = document.createElement('div');
        filterContainer.className = 'advanced-filters';
        filterContainer.innerHTML = `
            <div class="filter-group">
                <label>Price Range:</label>
                <div class="price-range">
                    <input type="range" id="minPrice" min="0" max="100" value="0">
                    <input type="range" id="maxPrice" min="0" max="100" value="100">
                    <div class="price-display">
                        <span id="minPriceDisplay">$0</span> - <span id="maxPriceDisplay">$100</span>
                    </div>
                </div>
            </div>
            <div class="filter-group">
                <label>Rating:</label>
                <select id="ratingFilter">
                    <option value="">All Ratings</option>
                    <option value="4">4+ Stars</option>
                    <option value="3">3+ Stars</option>
                    <option value="2">2+ Stars</option>
                </select>
            </div>
            <div class="filter-group">
                <label>Availability:</label>
                <select id="stockFilter">
                    <option value="">All Products</option>
                    <option value="in-stock">In Stock</option>
                    <option value="low-stock">Low Stock</option>
                </select>
            </div>
        `;
        
        // Insert advanced filters into products page
        const productsPage = document.querySelector('.filters');
        if (productsPage) {
            productsPage.appendChild(filterContainer);
            this.setupFilterListeners();
        }
    }
    
    setupFilterListeners() {
        const minPrice = document.getElementById('minPrice');
        const maxPrice = document.getElementById('maxPrice');
        const ratingFilter = document.getElementById('ratingFilter');
        const stockFilter = document.getElementById('stockFilter');
        
        [minPrice, maxPrice, ratingFilter, stockFilter].forEach(element => {
            if (element) {
                element.addEventListener('change', () => {
                    this.applyAdvancedFilters();
                });
            }
        });
        
        // Update price display
        if (minPrice && maxPrice) {
            [minPrice, maxPrice].forEach(slider => {
                slider.addEventListener('input', () => {
                    document.getElementById('minPriceDisplay').textContent = `$${minPrice.value}`;
                    document.getElementById('maxPriceDisplay').textContent = `$${maxPrice.value}`;
                });
            });
        }
    }
    
    applyAdvancedFilters() {
        const minPrice = parseFloat(document.getElementById('minPrice')?.value || 0);
        const maxPrice = parseFloat(document.getElementById('maxPrice')?.value || 100);
        const rating = parseFloat(document.getElementById('ratingFilter')?.value || 0);
        const stock = document.getElementById('stockFilter')?.value || '';
        
        const products = Storage.get('products', []);
        const filtered = products.filter(product => {
            let matches = true;
            
            // Price filter
            matches = matches && product.price >= minPrice && product.price <= maxPrice;
            
            // Rating filter
            if (rating > 0) {
                matches = matches && product.rating >= rating;
            }
            
            // Stock filter
            if (stock === 'in-stock') {
                matches = matches && product.stock > 10;
            } else if (stock === 'low-stock') {
                matches = matches && product.stock > 0 && product.stock <= 10;
            }
            
            return matches;
        });
        
        window.eventEmitter.emit('productsFiltered', filtered);
    }
    
    setupWishlistFeatures() {
        // Enhanced wishlist with categories and sharing
        this.createWishlistManager();
    }
    
    createWishlistManager() {
        const wishlistManager = {
            add: (productId) => {
                const wishlist = Storage.get('wishlist', []);
                if (!wishlist.includes(productId)) {
                    wishlist.push(productId);
                    Storage.set('wishlist', wishlist);
                    this.showWishlistNotification('added', productId);
                }
            },
            
            remove: (productId) => {
                const wishlist = Storage.get('wishlist', []);
                const updated = wishlist.filter(id => id !== productId);
                Storage.set('wishlist', updated);
                this.showWishlistNotification('removed', productId);
            },
            
            getByCategory: (category) => {
                const wishlist = Storage.get('wishlist', []);
                const products = Storage.get('products', []);
                return wishlist
                    .map(id => products.find(p => p.id === id))
                    .filter(p => p && p.category === category);
            },
            
            share: () => {
                const wishlist = Storage.get('wishlist', []);
                const products = Storage.get('products', []);
                const wishlistProducts = wishlist
                    .map(id => products.find(p => p.id === id))
                    .filter(Boolean);
                
                const shareData = {
                    title: 'My SuperMart Wishlist',
                    text: `Check out my wishlist with ${wishlistProducts.length} items!`,
                    url: window.location.href
                };
                
                if (navigator.share) {
                    navigator.share(shareData);
                } else {
                    // Fallback: copy to clipboard
                    navigator.clipboard.writeText(shareData.url);
                    showToast('Wishlist link copied to clipboard!', 'success');
                }
            }
        };
        
        window.wishlistManager = wishlistManager;
    }
    
    showWishlistNotification(action, productId) {
        const products = Storage.get('products', []);
        const product = products.find(p => p.id === productId);
        if (product) {
            const message = `${product.name} ${action} ${action === 'added' ? 'to' : 'from'} wishlist`;
            showToast(message, 'success');
        }
    }
    
    setupOrderTracking() {
        // Enhanced order tracking with status updates
        this.createOrderTracker();
    }
    
    createOrderTracker() {
        const orderTracker = {
            updateStatus: (orderId, status) => {
                const orders = Storage.get('orders', []);
                const orderIndex = orders.findIndex(o => o.id === orderId);
                
                if (orderIndex > -1) {
                    orders[orderIndex].status = status;
                    orders[orderIndex].updatedAt = new Date().toISOString();
                    Storage.set('orders', orders);
                    
                    this.showOrderStatusNotification(orderId, status);
                    window.eventEmitter.emit('orderStatusUpdated', { orderId, status });
                }
            },
            
            getEstimatedDelivery: (orderId) => {
                const orders = Storage.get('orders', []);
                const order = orders.find(o => o.id === orderId);
                
                if (order) {
                    const orderDate = new Date(order.createdAt);
                    const estimatedDate = new Date(orderDate);
                    estimatedDate.setDate(orderDate.getDate() + 3); // 3 days delivery
                    return estimatedDate;
                }
                return null;
            },
            
            getTrackingInfo: (orderId) => {
                const orders = Storage.get('orders', []);
                const order = orders.find(o => o.id === orderId);
                
                if (order) {
                    const stages = [
                        { name: 'Order Placed', completed: true, date: order.createdAt },
                        { name: 'Processing', completed: order.status !== 'pending', date: order.updatedAt },
                        { name: 'Shipped', completed: order.status === 'delivered', date: order.updatedAt },
                        { name: 'Delivered', completed: order.status === 'delivered', date: order.updatedAt }
                    ];
                    
                    return { order, stages };
                }
                return null;
            }
        };
        
        window.orderTracker = orderTracker;
    }
    
    showOrderStatusNotification(orderId, status) {
        const statusMessages = {
            pending: 'Order is being processed',
            processing: 'Order is being prepared',
            delivered: 'Order has been delivered!'
        };
        
        const message = `Order ${orderId}: ${statusMessages[status] || status}`;
        showToast(message, status === 'delivered' ? 'success' : 'info');
    }
    
    setupStoreStatus() {
        // Store open/closed status management
        const storeStatus = Storage.get('storeStatus', { isOpen: true, message: '' });
        
        if (!storeStatus.isOpen) {
            this.showStoreClosedBanner(storeStatus.message);
        }
        
        // Admin can toggle store status
        window.storeManager = {
            setStatus: (isOpen, message = '') => {
                Storage.set('storeStatus', { isOpen, message });
                
                if (!isOpen) {
                    this.showStoreClosedBanner(message);
                } else {
                    this.hideStoreClosedBanner();
                }
                
                window.eventEmitter.emit('storeStatusChanged', { isOpen, message });
            },
            
            getStatus: () => Storage.get('storeStatus', { isOpen: true, message: '' })
        };
    }
    
    showStoreClosedBanner(message) {
        const banner = document.createElement('div');
        banner.id = 'storeClosedBanner';
        banner.className = 'store-closed-banner';
        banner.innerHTML = `
            <div class="banner-content">
                <i class="fas fa-exclamation-triangle"></i>
                <span>Store is currently closed. ${message}</span>
                <button onclick="this.parentElement.parentElement.remove()">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
        
        document.body.insertBefore(banner, document.body.firstChild);
    }
    
    hideStoreClosedBanner() {
        const banner = document.getElementById('storeClosedBanner');
        if (banner) banner.remove();
    }
    
    setupThirdPartyIntegrations() {
        // Integration toggles for delivery services
        const integrations = Storage.get('integrations', {
            blinkit: false,
            zepto: false,
            swiggy: false
        });
        
        window.integrationManager = {
            toggle: (service, enabled) => {
                integrations[service] = enabled;
                Storage.set('integrations', integrations);
                
                showToast(
                    `${service.charAt(0).toUpperCase() + service.slice(1)} integration ${enabled ? 'enabled' : 'disabled'}`,
                    'success'
                );
                
                window.eventEmitter.emit('integrationToggled', { service, enabled });
            },
            
            getStatus: (service) => integrations[service] || false,
            
            getAll: () => integrations
        };
    }
    
    setupAdvancedProductModal() {
        // Enhanced product modal with nutrition info, ingredients, etc.
        window.eventEmitter.on('showProductModal', (product) => {
            this.showAdvancedProductModal(product);
        });
    }
    
    showAdvancedProductModal(product) {
        const modal = document.createElement('div');
        modal.className = 'modal advanced-product-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-btn">&times;</span>
                <div class="product-detail-grid">
                    <div class="product-image-section">
                        <img src="${product.image}" alt="${product.name}">
                        <div class="product-badges">
                            ${product.stock <= 5 ? '<span class="badge low-stock">Low Stock</span>' : ''}
                            ${product.featured ? '<span class="badge featured">Featured</span>' : ''}
                        </div>
                    </div>
                    <div class="product-info-section">
                        <h2>${product.name}</h2>
                        <div class="rating-section">
                            ${this.generateStars(product.rating)}
                            <span class="rating-text">(${product.rating})</span>
                        </div>
                        <div class="price-section">
                            <span class="current-price">${formatCurrency(product.price)}</span>
                            ${product.originalPrice ? `<span class="original-price">${formatCurrency(product.originalPrice)}</span>` : ''}
                        </div>
                        <p class="description">${product.description}</p>
                        
                        <div class="product-details-tabs">
                            <div class="tab-buttons">
                                <button class="tab-btn active" data-tab="details">Details</button>
                                <button class="tab-btn" data-tab="nutrition">Nutrition</button>
                                <button class="tab-btn" data-tab="reviews">Reviews</button>
                            </div>
                            <div class="tab-content">
                                <div class="tab-pane active" id="details">
                                    <ul>
                                        ${product.details ? product.details.map(detail => `<li>${detail}</li>`).join('') : '<li>No additional details available</li>'}
                                    </ul>
                                </div>
                                <div class="tab-pane" id="nutrition">
                                    <p>${product.nutrition || 'Nutrition information not available'}</p>
                                </div>
                                <div class="tab-pane" id="reviews">
                                    <p>Customer reviews coming soon...</p>
                                </div>
                            </div>
                        </div>
                        
                        <div class="quantity-section">
                            <label>Quantity:</label>
                            <div class="quantity-controls">
                                <button class="qty-btn decrease">-</button>
                                <span class="quantity">1</span>
                                <button class="qty-btn increase">+</button>
                            </div>
                        </div>
                        
                        <div class="action-buttons">
                            <button class="add-to-cart-btn primary" data-product='${JSON.stringify(product)}'>
                                <i class="fas fa-cart-plus"></i> Add to Cart
                            </button>
                            <button class="wishlist-btn" data-product-id="${product.id}">
                                <i class="fas fa-heart"></i> Wishlist
                            </button>
                            <button class="share-btn">
                                <i class="fas fa-share"></i> Share
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        
        // Setup modal interactions
        this.setupModalInteractions(modal, product);
        
        // Show modal
        modal.style.display = 'block';
        Animation.fadeIn(modal);
    }
    
    setupModalInteractions(modal, product) {
        // Close modal
        const closeBtn = modal.querySelector('.close-btn');
        closeBtn.addEventListener('click', () => {
            Animation.fadeOut(modal);
            setTimeout(() => modal.remove(), 300);
        });
        
        // Tab switching
        const tabBtns = modal.querySelectorAll('.tab-btn');
        const tabPanes = modal.querySelectorAll('.tab-pane');
        
        tabBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const tabName = btn.dataset.tab;
                
                tabBtns.forEach(b => b.classList.remove('active'));
                tabPanes.forEach(p => p.classList.remove('active'));
                
                btn.classList.add('active');
                modal.querySelector(`#${tabName}`).classList.add('active');
            });
        });
        
        // Quantity controls
        const decreaseBtn = modal.querySelector('.qty-btn.decrease');
        const increaseBtn = modal.querySelector('.qty-btn.increase');
        const quantitySpan = modal.querySelector('.quantity');
        
        decreaseBtn.addEventListener('click', () => {
            const current = parseInt(quantitySpan.textContent);
            if (current > 1) {
                quantitySpan.textContent = current - 1;
            }
        });
        
        increaseBtn.addEventListener('click', () => {
            const current = parseInt(quantitySpan.textContent);
            quantitySpan.textContent = current + 1;
        });
        
        // Add to cart
        const addToCartBtn = modal.querySelector('.add-to-cart-btn');
        addToCartBtn.addEventListener('click', () => {
            const quantity = parseInt(quantitySpan.textContent);
            cartManager.addItem(product, quantity);
            Animation.fadeOut(modal);
            setTimeout(() => modal.remove(), 300);
        });
        
        // Wishlist toggle
        const wishlistBtn = modal.querySelector('.wishlist-btn');
        wishlistBtn.addEventListener('click', () => {
            window.wishlistManager.add(product.id);
        });
        
        // Share product
        const shareBtn = modal.querySelector('.share-btn');
        shareBtn.addEventListener('click', () => {
            this.shareProduct(product);
        });
    }
    
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<i class="fas fa-star star"></i>';
        }
        
        if (hasHalfStar) {
            stars += '<i class="fas fa-star-half-alt star"></i>';
        }
        
        for (let i = 0; i < emptyStars; i++) {
            stars += '<i class="far fa-star star"></i>';
        }
        
        return stars;
    }
    
    shareProduct(product) {
        const shareData = {
            title: product.name,
            text: `Check out ${product.name} at SuperMart - ${formatCurrency(product.price)}`,
            url: window.location.href
        };
        
        if (navigator.share) {
            navigator.share(shareData);
        } else {
            navigator.clipboard.writeText(`${shareData.text} - ${shareData.url}`);
            showToast('Product link copied to clipboard!', 'success');
        }
    }
    
    setupInventoryManagement() {
        // Enhanced inventory tracking for admin
        window.inventoryManager = {
            updateStock: (productId, newStock) => {
                const products = Storage.get('products', []);
                const productIndex = products.findIndex(p => p.id === productId);
                
                if (productIndex > -1) {
                    const oldStock = products[productIndex].stock;
                    products[productIndex].stock = newStock;
                    Storage.set('products', products);
                    
                    // Trigger low stock alert
                    if (newStock <= 5 && oldStock > 5) {
                        this.triggerLowStockAlert(products[productIndex]);
                    }
                    
                    window.eventEmitter.emit('stockUpdated', { productId, oldStock, newStock });
                }
            },
            
            getLowStockItems: () => {
                const products = Storage.get('products', []);
                return products.filter(p => p.stock <= 5);
            },
            
            getOutOfStockItems: () => {
                const products = Storage.get('products', []);
                return products.filter(p => p.stock === 0);
            }
        };
    }
    
    triggerLowStockAlert(product) {
        showToast(`Low stock alert: ${product.name} (${product.stock} remaining)`, 'warning');
        
        // Store alert for admin dashboard
        const alerts = Storage.get('stockAlerts', []);
        alerts.unshift({
            id: generateId(),
            productId: product.id,
            productName: product.name,
            stock: product.stock,
            timestamp: new Date().toISOString(),
            type: 'low-stock'
        });
        
        // Keep only last 50 alerts
        if (alerts.length > 50) alerts.splice(50);
        Storage.set('stockAlerts', alerts);
    }
}

// Initialize enhanced features
document.addEventListener('DOMContentLoaded', () => {
    new EnhancedFeatures();
});

// Add CSS for enhanced features
const enhancedCSS = `
/* Advanced Filters */
.advanced-filters {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    margin-bottom: var(--space-xl);
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
    gap: var(--space-lg);
}

.price-range {
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.price-range input[type="range"] {
    width: 100%;
}

.price-display {
    text-align: center;
    font-weight: 600;
    color: var(--text-primary);
}

/* Store Closed Banner */
.store-closed-banner {
    background: var(--error-color);
    color: white;
    padding: var(--space-md);
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9999;
    animation: slideDown 0.3s ease-out;
}

.banner-content {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-md);
    max-width: 1200px;
    margin: 0 auto;
}

.banner-content button {
    background: none;
    border: none;
    color: white;
    cursor: pointer;
    padding: var(--space-xs);
    border-radius: 50%;
    transition: background-color var(--transition-fast);
}

.banner-content button:hover {
    background: rgba(255, 255, 255, 0.2);
}

/* Advanced Product Modal */
.advanced-product-modal .modal-content {
    max-width: 900px;
    max-height: 90vh;
    overflow-y: auto;
}

.product-detail-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: var(--space-xl);
}

.product-image-section {
    position: relative;
}

.product-image-section img {
    width: 100%;
    height: 400px;
    object-fit: cover;
    border-radius: var(--radius-lg);
}

.product-badges {
    position: absolute;
    top: var(--space-md);
    left: var(--space-md);
    display: flex;
    flex-direction: column;
    gap: var(--space-sm);
}

.badge {
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
    font-weight: 600;
}

.badge.low-stock {
    background: var(--warning-color);
    color: white;
}

.badge.featured {
    background: var(--success-color);
    color: white;
}

.product-info-section {
    display: flex;
    flex-direction: column;
    gap: var(--space-lg);
}

.product-info-section h2 {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    color: var(--text-primary);
}

.rating-section {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.price-section {
    display: flex;
    align-items: center;
    gap: var(--space-md);
}

.current-price {
    font-size: var(--font-size-xl);
    font-weight: 700;
    color: var(--success-color);
}

.original-price {
    font-size: var(--font-size-lg);
    color: var(--text-muted);
    text-decoration: line-through;
}

.product-details-tabs {
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    overflow: hidden;
}

.tab-buttons {
    display: flex;
    background: var(--bg-secondary);
}

.tab-btn {
    flex: 1;
    padding: var(--space-md);
    border: none;
    background: none;
    cursor: pointer;
    transition: all var(--transition-fast);
    color: var(--text-secondary);
    font-weight: 500;
}

.tab-btn.active {
    background: var(--bg-card);
    color: var(--text-primary);
    font-weight: 600;
}

.tab-btn:hover {
    background: var(--bg-hover);
}

.tab-content {
    padding: var(--space-lg);
}

.tab-pane {
    display: none;
}

.tab-pane.active {
    display: block;
}

.quantity-section {
    display: flex;
    align-items: center;
    gap: var(--space-md);
}

.quantity-controls {
    display: flex;
    align-items: center;
    gap: var(--space-sm);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    padding: var(--space-xs);
}

.qty-btn {
    width: 32px;
    height: 32px;
    border: none;
    background: var(--bg-secondary);
    border-radius: var(--radius-sm);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all var(--transition-fast);
}

.qty-btn:hover {
    background: var(--bg-hover);
}

.quantity {
    min-width: 40px;
    text-align: center;
    font-weight: 600;
}

.action-buttons {
    display: flex;
    gap: var(--space-md);
}

.action-buttons button {
    flex: 1;
    padding: var(--space-md);
    border: none;
    border-radius: var(--radius-lg);
    cursor: pointer;
    font-weight: 600;
    transition: all var(--transition-fast);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: var(--space-sm);
}

.add-to-cart-btn.primary {
    background: var(--primary-color);
    color: white;
}

.add-to-cart-btn.primary:hover {
    background: var(--primary-hover);
}

.wishlist-btn {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}

.wishlist-btn:hover {
    background: var(--bg-hover);
}

.share-btn {
    background: var(--bg-secondary);
    color: var(--text-primary);
    border: 1px solid var(--border-color);
}

.share-btn:hover {
    background: var(--bg-hover);
}

/* Responsive Design */
@media (max-width: 768px) {
    .product-detail-grid {
        grid-template-columns: 1fr;
    }
    
    .product-image-section img {
        height: 250px;
    }
    
    .action-buttons {
        flex-direction: column;
    }
    
    .advanced-filters {
        grid-template-columns: 1fr;
    }
}

/* Animations */
@keyframes slideDown {
    from {
        transform: translateY(-100%);
    }
    to {
        transform: translateY(0);
    }
}
`;

// Inject enhanced CSS
const enhancedStyle = document.createElement('style');
enhancedStyle.textContent = enhancedCSS;
document.head.appendChild(enhancedStyle);