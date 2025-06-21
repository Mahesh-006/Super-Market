// Admin Panel Enhancements

class AdminEnhancements {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupAdvancedDashboard();
        this.setupInventoryAlerts();
        this.setupSalesAnalytics();
        this.setupUserManagement();
        this.setupStoreSettings();
    }
    
    setupAdvancedDashboard() {
        // Enhanced dashboard with real-time metrics
        window.eventEmitter.on('adminDashboardLoad', () => {
            this.loadAdvancedMetrics();
        });
    }
    
    loadAdvancedMetrics() {
        const products = Storage.get('products', []);
        const orders = Storage.get('orders', []);
        const users = Storage.get('users', []);
        
        // Calculate advanced metrics
        const metrics = {
            totalRevenue: orders.reduce((sum, order) => sum + order.pricing.total, 0),
            averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.pricing.total, 0) / orders.length : 0,
            topSellingProducts: this.getTopSellingProducts(orders),
            lowStockItems: products.filter(p => p.stock <= 5),
            recentCustomers: users.filter(u => u.role === 'customer').slice(-5),
            ordersByStatus: this.getOrdersByStatus(orders),
            salesTrend: this.getSalesTrend(orders)
        };
        
        this.updateDashboardMetrics(metrics);
    }
    
    getTopSellingProducts(orders) {
        const productSales = {};
        
        orders.forEach(order => {
            order.items.forEach(item => {
                if (productSales[item.id]) {
                    productSales[item.id].quantity += item.quantity;
                } else {
                    productSales[item.id] = {
                        ...item,
                        quantity: item.quantity
                    };
                }
            });
        });
        
        return Object.values(productSales)
            .sort((a, b) => b.quantity - a.quantity)
            .slice(0, 5);
    }
    
    getOrdersByStatus(orders) {
        return orders.reduce((acc, order) => {
            acc[order.status] = (acc[order.status] || 0) + 1;
            return acc;
        }, {});
    }
    
    getSalesTrend(orders) {
        const last7Days = [];
        const today = new Date();
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date(today);
            date.setDate(today.getDate() - i);
            const dateStr = date.toDateString();
            
            const dayOrders = orders.filter(order => 
                new Date(order.createdAt).toDateString() === dateStr
            );
            
            const dayRevenue = dayOrders.reduce((sum, order) => sum + order.pricing.total, 0);
            
            last7Days.push({
                date: date.toLocaleDateString('en-US', { weekday: 'short' }),
                revenue: dayRevenue,
                orders: dayOrders.length
            });
        }
        
        return last7Days;
    }
    
    updateDashboardMetrics(metrics) {
        // Update dashboard elements with new metrics
        const dashboardContainer = document.querySelector('.admin-container');
        if (!dashboardContainer) return;
        
        // Add advanced metrics section
        const advancedMetricsHTML = `
            <div class="advanced-metrics">
                <div class="metrics-grid">
                    <div class="metric-card">
                        <h4>Average Order Value</h4>
                        <span class="metric-value">${formatCurrency(metrics.averageOrderValue)}</span>
                    </div>
                    <div class="metric-card">
                        <h4>Low Stock Items</h4>
                        <span class="metric-value alert">${metrics.lowStockItems.length}</span>
                    </div>
                    <div class="metric-card">
                        <h4>Pending Orders</h4>
                        <span class="metric-value">${metrics.ordersByStatus.pending || 0}</span>
                    </div>
                    <div class="metric-card">
                        <h4>Total Revenue</h4>
                        <span class="metric-value success">${formatCurrency(metrics.totalRevenue)}</span>
                    </div>
                </div>
                
                <div class="charts-section">
                    <div class="chart-container">
                        <h4>Sales Trend (Last 7 Days)</h4>
                        <canvas id="salesTrendChart" width="400" height="200"></canvas>
                    </div>
                    <div class="top-products">
                        <h4>Top Selling Products</h4>
                        <div class="products-list">
                            ${metrics.topSellingProducts.map(product => `
                                <div class="product-item">
                                    <img src="${product.image}" alt="${product.name}">
                                    <div class="product-info">
                                        <span class="product-name">${product.name}</span>
                                        <span class="product-sales">${product.quantity} sold</span>
                                    </div>
                                </div>
                            `).join('')}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Insert after existing dashboard content
        const existingContent = dashboardContainer.querySelector('.stats-grid');
        if (existingContent) {
            existingContent.insertAdjacentHTML('afterend', advancedMetricsHTML);
            this.drawSalesTrendChart(metrics.salesTrend);
        }
    }
    
    drawSalesTrendChart(salesData) {
        const canvas = document.getElementById('salesTrendChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Chart settings
        const padding = 40;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;
        
        const maxRevenue = Math.max(...salesData.map(d => d.revenue), 100);
        const stepX = chartWidth / (salesData.length - 1);
        
        // Draw grid
        ctx.strokeStyle = '#e5e7eb';
        ctx.lineWidth = 1;
        
        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        
        // Draw sales line
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        salesData.forEach((data, index) => {
            const x = padding + stepX * index;
            const y = height - padding - (data.revenue / maxRevenue) * chartHeight;
            
            if (index === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        });
        
        ctx.stroke();
        
        // Draw data points
        ctx.fillStyle = '#3b82f6';
        salesData.forEach((data, index) => {
            const x = padding + stepX * index;
            const y = height - padding - (data.revenue / maxRevenue) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        });
        
        // Draw labels
        ctx.fillStyle = '#6b7280';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        
        salesData.forEach((data, index) => {
            const x = padding + stepX * index;
            ctx.fillText(data.date, x, height - 10);
        });
    }
    
    setupInventoryAlerts() {
        // Real-time inventory monitoring
        window.eventEmitter.on('stockUpdated', (data) => {
            if (data.newStock <= 5) {
                this.showInventoryAlert(data.productId, data.newStock);
            }
        });
        
        // Check for low stock on page load
        this.checkLowStock();
    }
    
    checkLowStock() {
        const products = Storage.get('products', []);
        const lowStockProducts = products.filter(p => p.stock <= 5);
        
        if (lowStockProducts.length > 0) {
            this.displayLowStockSummary(lowStockProducts);
        }
    }
    
    showInventoryAlert(productId, stock) {
        const products = Storage.get('products', []);
        const product = products.find(p => p.id === productId);
        
        if (product) {
            showToast(`Low stock alert: ${product.name} (${stock} remaining)`, 'warning');
        }
    }
    
    displayLowStockSummary(lowStockProducts) {
        const alertContainer = document.createElement('div');
        alertContainer.className = 'inventory-alerts';
        alertContainer.innerHTML = `
            <div class="alert-header">
                <h3><i class="fas fa-exclamation-triangle"></i> Inventory Alerts</h3>
                <span class="alert-count">${lowStockProducts.length} items need attention</span>
            </div>
            <div class="alert-items">
                ${lowStockProducts.map(product => `
                    <div class="alert-item">
                        <img src="${product.image}" alt="${product.name}">
                        <div class="item-info">
                            <span class="item-name">${product.name}</span>
                            <span class="item-stock ${product.stock === 0 ? 'out-of-stock' : 'low-stock'}">
                                ${product.stock === 0 ? 'Out of Stock' : `${product.stock} remaining`}
                            </span>
                        </div>
                        <button class="restock-btn" onclick="adminEnhancements.showRestockModal('${product.id}')">
                            Restock
                        </button>
                    </div>
                `).join('')}
            </div>
        `;
        
        // Insert into admin dashboard
        const dashboardContainer = document.querySelector('.admin-container');
        if (dashboardContainer) {
            dashboardContainer.appendChild(alertContainer);
        }
    }
    
    showRestockModal(productId) {
        const products = Storage.get('products', []);
        const product = products.find(p => p.id === productId);
        
        if (!product) return;
        
        const modal = document.createElement('div');
        modal.className = 'modal restock-modal';
        modal.innerHTML = `
            <div class="modal-content">
                <span class="close-btn">&times;</span>
                <h3>Restock Product</h3>
                <div class="product-info">
                    <img src="${product.image}" alt="${product.name}">
                    <div>
                        <h4>${product.name}</h4>
                        <p>Current Stock: ${product.stock}</p>
                    </div>
                </div>
                <div class="restock-form">
                    <label>Add Stock:</label>
                    <input type="number" id="restockQuantity" min="1" value="10">
                    <button onclick="adminEnhancements.restockProduct('${productId}')">
                        Update Stock
                    </button>
                </div>
            </div>
        `;
        
        document.body.appendChild(modal);
        modal.style.display = 'block';
        
        // Close modal functionality
        modal.querySelector('.close-btn').addEventListener('click', () => {
            modal.remove();
        });
    }
    
    restockProduct(productId) {
        const quantity = parseInt(document.getElementById('restockQuantity').value);
        if (quantity > 0) {
            const products = Storage.get('products', []);
            const productIndex = products.findIndex(p => p.id === productId);
            
            if (productIndex > -1) {
                products[productIndex].stock += quantity;
                Storage.set('products', products);
                
                showToast(`Stock updated successfully`, 'success');
                
                // Close modal and refresh page
                document.querySelector('.restock-modal').remove();
                window.location.reload();
            }
        }
    }
    
    setupSalesAnalytics() {
        // Advanced sales analytics
        window.salesAnalytics = {
            getRevenueByPeriod: (period) => {
                const orders = Storage.get('orders', []);
                const now = new Date();
                let startDate;
                
                switch (period) {
                    case 'today':
                        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
                        break;
                    case 'week':
                        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                        break;
                    case 'month':
                        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                        break;
                    default:
                        startDate = new Date(0);
                }
                
                return orders
                    .filter(order => new Date(order.createdAt) >= startDate)
                    .reduce((sum, order) => sum + order.pricing.total, 0);
            },
            
            getTopCustomers: () => {
                const orders = Storage.get('orders', []);
                const customerSpending = {};
                
                orders.forEach(order => {
                    if (customerSpending[order.customerEmail]) {
                        customerSpending[order.customerEmail] += order.pricing.total;
                    } else {
                        customerSpending[order.customerEmail] = order.pricing.total;
                    }
                });
                
                return Object.entries(customerSpending)
                    .sort(([,a], [,b]) => b - a)
                    .slice(0, 10)
                    .map(([email, total]) => ({ email, total }));
            },
            
            getCategoryPerformance: () => {
                const orders = Storage.get('orders', []);
                const categoryRevenue = {};
                
                orders.forEach(order => {
                    order.items.forEach(item => {
                        if (categoryRevenue[item.category]) {
                            categoryRevenue[item.category] += item.price * item.quantity;
                        } else {
                            categoryRevenue[item.category] = item.price * item.quantity;
                        }
                    });
                });
                
                return Object.entries(categoryRevenue)
                    .sort(([,a], [,b]) => b - a)
                    .map(([category, revenue]) => ({ category, revenue }));
            }
        };
    }
    
    setupUserManagement() {
        // Enhanced user management for admin
        window.userManager = {
            getAllUsers: () => {
                return Storage.get('users', []).filter(u => u.role === 'customer');
            },
            
            getUserOrders: (userId) => {
                const orders = Storage.get('orders', []);
                return orders.filter(order => order.userId === userId);
            },
            
            getUserStats: (userId) => {
                const orders = this.getUserOrders(userId);
                return {
                    totalOrders: orders.length,
                    totalSpent: orders.reduce((sum, order) => sum + order.pricing.total, 0),
                    averageOrderValue: orders.length > 0 ? orders.reduce((sum, order) => sum + order.pricing.total, 0) / orders.length : 0,
                    lastOrderDate: orders.length > 0 ? Math.max(...orders.map(o => new Date(o.createdAt).getTime())) : null
                };
            },
            
            blockUser: (userId) => {
                const users = Storage.get('users', []);
                const userIndex = users.findIndex(u => u.id === userId);
                
                if (userIndex > -1) {
                    users[userIndex].blocked = true;
                    Storage.set('users', users);
                    showToast('User blocked successfully', 'success');
                }
            },
            
            unblockUser: (userId) => {
                const users = Storage.get('users', []);
                const userIndex = users.findIndex(u => u.id === userId);
                
                if (userIndex > -1) {
                    users[userIndex].blocked = false;
                    Storage.set('users', users);
                    showToast('User unblocked successfully', 'success');
                }
            }
        };
    }
    
    setupStoreSettings() {
        // Enhanced store settings management
        window.storeSettingsManager = {
            updateDeliverySettings: (settings) => {
                Storage.set('deliverySettings', settings);
                showToast('Delivery settings updated', 'success');
            },
            
            updateTaxSettings: (taxRate) => {
                Storage.set('taxRate', taxRate);
                showToast('Tax settings updated', 'success');
            },
            
            updateStoreHours: (hours) => {
                Storage.set('storeHours', hours);
                showToast('Store hours updated', 'success');
            },
            
            toggleMaintenanceMode: (enabled) => {
                Storage.set('maintenanceMode', enabled);
                showToast(`Maintenance mode ${enabled ? 'enabled' : 'disabled'}`, 'info');
            }
        };
    }
}

// Initialize admin enhancements
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin/')) {
        window.adminEnhancements = new AdminEnhancements();
    }
});

// Add CSS for admin enhancements
const adminEnhancedCSS = `
/* Advanced Metrics */
.advanced-metrics {
    margin: var(--space-xl) 0;
}

.metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: var(--space-lg);
    margin-bottom: var(--space-xl);
}

.metric-card {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
    text-align: center;
}

.metric-card h4 {
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
    margin-bottom: var(--space-sm);
    text-transform: uppercase;
    letter-spacing: 0.5px;
}

.metric-value {
    font-size: var(--font-size-2xl);
    font-weight: 700;
    color: var(--text-primary);
}

.metric-value.success {
    color: var(--success-color);
}

.metric-value.alert {
    color: var(--error-color);
}

.charts-section {
    display: grid;
    grid-template-columns: 2fr 1fr;
    gap: var(--space-xl);
}

.chart-container {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
}

.chart-container h4 {
    margin-bottom: var(--space-lg);
    color: var(--text-primary);
}

.top-products {
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    padding: var(--space-lg);
}

.top-products h4 {
    margin-bottom: var(--space-lg);
    color: var(--text-primary);
}

.products-list {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}

.product-item {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-sm);
    border-radius: var(--radius-md);
    background: var(--bg-secondary);
}

.product-item img {
    width: 40px;
    height: 40px;
    object-fit: cover;
    border-radius: var(--radius-sm);
}

.product-info {
    flex: 1;
}

.product-name {
    display: block;
    font-weight: 600;
    color: var(--text-primary);
    font-size: var(--font-size-sm);
}

.product-sales {
    display: block;
    color: var(--text-muted);
    font-size: var(--font-size-xs);
}

/* Inventory Alerts */
.inventory-alerts {
    background: var(--bg-card);
    border: 1px solid var(--warning-color);
    border-radius: var(--radius-lg);
    margin: var(--space-xl) 0;
    overflow: hidden;
}

.alert-header {
    background: var(--warning-color);
    color: white;
    padding: var(--space-lg);
    display: flex;
    justify-content: space-between;
    align-items: center;
}

.alert-header h3 {
    margin: 0;
    display: flex;
    align-items: center;
    gap: var(--space-sm);
}

.alert-count {
    background: rgba(255, 255, 255, 0.2);
    padding: var(--space-xs) var(--space-sm);
    border-radius: var(--radius-md);
    font-size: var(--font-size-sm);
}

.alert-items {
    padding: var(--space-lg);
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}

.alert-item {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    padding: var(--space-md);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    background: var(--bg-secondary);
}

.alert-item img {
    width: 50px;
    height: 50px;
    object-fit: cover;
    border-radius: var(--radius-sm);
}

.item-info {
    flex: 1;
}

.item-name {
    display: block;
    font-weight: 600;
    color: var(--text-primary);
    margin-bottom: var(--space-xs);
}

.item-stock {
    display: block;
    font-size: var(--font-size-sm);
}

.item-stock.low-stock {
    color: var(--warning-color);
}

.item-stock.out-of-stock {
    color: var(--error-color);
    font-weight: 600;
}

.restock-btn {
    background: var(--primary-color);
    color: white;
    border: none;
    padding: var(--space-sm) var(--space-md);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-weight: 600;
    transition: all var(--transition-fast);
}

.restock-btn:hover {
    background: var(--primary-hover);
}

/* Restock Modal */
.restock-modal .modal-content {
    max-width: 500px;
}

.restock-modal .product-info {
    display: flex;
    align-items: center;
    gap: var(--space-md);
    margin-bottom: var(--space-lg);
    padding: var(--space-md);
    background: var(--bg-secondary);
    border-radius: var(--radius-md);
}

.restock-modal .product-info img {
    width: 60px;
    height: 60px;
    object-fit: cover;
    border-radius: var(--radius-sm);
}

.restock-modal .product-info h4 {
    margin: 0 0 var(--space-xs) 0;
    color: var(--text-primary);
}

.restock-modal .product-info p {
    margin: 0;
    color: var(--text-secondary);
    font-size: var(--font-size-sm);
}

.restock-form {
    display: flex;
    flex-direction: column;
    gap: var(--space-md);
}

.restock-form label {
    font-weight: 600;
    color: var(--text-primary);
}

.restock-form input {
    padding: var(--space-md);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-md);
    font-size: var(--font-size-base);
}

.restock-form button {
    background: var(--success-color);
    color: white;
    border: none;
    padding: var(--space-md);
    border-radius: var(--radius-md);
    cursor: pointer;
    font-weight: 600;
    transition: all var(--transition-fast);
}

.restock-form button:hover {
    background: var(--success-hover);
}

/* Responsive Design */
@media (max-width: 768px) {
    .charts-section {
        grid-template-columns: 1fr;
    }
    
    .metrics-grid {
        grid-template-columns: repeat(2, 1fr);
    }
    
    .alert-item {
        flex-direction: column;
        text-align: center;
    }
}

@media (max-width: 480px) {
    .metrics-grid {
        grid-template-columns: 1fr;
    }
}
`;

// Inject admin enhanced CSS
const adminEnhancedStyle = document.createElement('style');
adminEnhancedStyle.textContent = adminEnhancedCSS;
document.head.appendChild(adminEnhancedStyle);