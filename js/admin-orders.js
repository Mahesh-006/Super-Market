// Admin orders management

class AdminOrders {
    constructor() {
        this.orders = [];
        this.filteredOrders = [];
        this.init();
    }
    
    init() {
        this.loadOrders();
        this.setupEventListeners();
        this.renderOrders();
        this.updateOrderStats();
    }
    
    loadOrders() {
        this.orders = Storage.get('orders', []);
        this.filteredOrders = [...this.orders];
    }
    
    setupEventListeners() {
        // Search and filters
        this.setupFilters();
        
        // Refresh button
        const refreshBtn = document.getElementById('refreshOrders');
        if (refreshBtn) {
            refreshBtn.addEventListener('click', () => {
                this.refreshOrders();
            });
        }
        
        // Order detail modal
        this.setupOrderModal();
    }
    
    setupFilters() {
        const orderSearch = document.getElementById('orderSearch');
        const searchBtn = document.getElementById('searchOrderBtn');
        const statusFilter = document.getElementById('statusFilter');
        const dateFilter = document.getElementById('dateFilter');
        
        if (orderSearch) {
            const debouncedSearch = debounce(() => {
                this.applyFilters();
            }, 300);
            
            orderSearch.addEventListener('input', debouncedSearch);
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.applyFilters();
            });
        }
        
        if (statusFilter) {
            statusFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }
        
        if (dateFilter) {
            dateFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }
    }
    
    applyFilters() {
        const searchTerm = document.getElementById('orderSearch')?.value.toLowerCase() || '';
        const status = document.getElementById('statusFilter')?.value || '';
        const date = document.getElementById('dateFilter')?.value || '';
        
        this.filteredOrders = this.orders.filter(order => {
            let matches = true;
            
            // Search filter
            if (searchTerm) {
                matches = matches && (
                    order.id.toLowerCase().includes(searchTerm) ||
                    order.customerName.toLowerCase().includes(searchTerm) ||
                    order.customerEmail.toLowerCase().includes(searchTerm)
                );
            }
            
            // Status filter
            if (status) {
                matches = matches && order.status === status;
            }
            
            // Date filter
            if (date) {
                const orderDate = new Date(order.createdAt).toDateString();
                const filterDate = new Date(date).toDateString();
                matches = matches && orderDate === filterDate;
            }
            
            return matches;
        });
        
        this.renderOrders();
    }
    
    renderOrders() {
        const tableBody = document.getElementById('ordersTableBody');
        const noOrders = document.getElementById('noOrders');
        
        if (!tableBody) return;
        
        if (this.filteredOrders.length === 0) {
            tableBody.innerHTML = '';
            if (noOrders) noOrders.style.display = 'block';
            return;
        }
        
        if (noOrders) noOrders.style.display = 'none';
        
        tableBody.innerHTML = this.filteredOrders.map(order => `
            <tr class="order-row" data-order-id="${order.id}">
                <td>${order.id}</td>
                <td>
                    <div>
                        <div>${order.customerName}</div>
                        <div style="font-size: 0.8rem; color: var(--text-muted);">${order.customerEmail}</div>
                    </div>
                </td>
                <td>${formatDate(order.createdAt)}</td>
                <td>${order.items.length} items</td>
                <td>${formatCurrency(order.pricing.total)}</td>
                <td>
                    <span class="order-status ${order.status}">${order.status}</span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="edit-btn" onclick="adminOrders.viewOrder('${order.id}')">
                            <i class="fas fa-eye"></i>
                        </button>
                        <select onchange="adminOrders.updateOrderStatus('${order.id}', this.value)" style="padding: 0.2rem; border-radius: 4px; border: 1px solid var(--border-color); background: var(--bg-tertiary); color: var(--text-primary);">
                            <option value="pending" ${order.status === 'pending' ? 'selected' : ''}>Pending</option>
                            <option value="processing" ${order.status === 'processing' ? 'selected' : ''}>Processing</option>
                            <option value="delivered" ${order.status === 'delivered' ? 'selected' : ''}>Delivered</option>
                            <option value="cancelled" ${order.status === 'cancelled' ? 'selected' : ''}>Cancelled</option>
                        </select>
                    </div>
                </td>
            </tr>
        `).join('');
        
        // Add click listeners for order rows
        this.setupOrderRowListeners();
    }
    
    setupOrderRowListeners() {
        const orderRows = document.querySelectorAll('.order-row');
        orderRows.forEach(row => {
            row.addEventListener('click', (e) => {
                // Don't trigger if clicking on action buttons
                if (e.target.closest('.action-buttons')) return;
                
                const orderId = row.dataset.orderId;
                this.viewOrder(orderId);
            });
        });
    }
    
    updateOrderStats() {
        const pendingOrders = document.getElementById('pendingOrders');
        const processingOrders = document.getElementById('processingOrders');
        const deliveredOrders = document.getElementById('deliveredOrders');
        
        const pending = this.orders.filter(order => order.status === 'pending').length;
        const processing = this.orders.filter(order => order.status === 'processing').length;
        const delivered = this.orders.filter(order => order.status === 'delivered').length;
        
        if (pendingOrders) pendingOrders.textContent = pending;
        if (processingOrders) processingOrders.textContent = processing;
        if (deliveredOrders) deliveredOrders.textContent = delivered;
    }
    
    refreshOrders() {
        this.loadOrders();
        this.applyFilters();
        this.updateOrderStats();
        showToast('Orders refreshed', 'success');
    }
    
    viewOrder(orderId) {
        const order = this.orders.find(o => o.id === orderId);
        if (!order) return;
        
        const modal = document.getElementById('orderDetailModal');
        if (!modal) return;
        
        // Populate modal content
        this.populateOrderModal(order);
        
        // Show modal
        modal.style.display = 'block';
        Animation.fadeIn(modal);
    }
    
    populateOrderModal(order) {
        const modalOrderId = document.getElementById('modalOrderId');
        const customerInfo = document.getElementById('customerInfo');
        const deliveryInfo = document.getElementById('deliveryInfo');
        const orderItemsList = document.getElementById('orderItemsList');
        const orderSubtotal = document.getElementById('orderSubtotal');
        const orderTax = document.getElementById('orderTax');
        const orderDelivery = document.getElementById('orderDelivery');
        const orderTotal = document.getElementById('orderTotal');
        const statusUpdate = document.getElementById('statusUpdate');
        
        if (modalOrderId) modalOrderId.textContent = order.id;
        
        if (customerInfo) {
            customerInfo.innerHTML = `
                <p><strong>Name:</strong> ${order.customerName}</p>
                <p><strong>Email:</strong> ${order.customerEmail}</p>
                <p><strong>Order Date:</strong> ${formatDate(order.createdAt)}</p>
            `;
        }
        
        if (deliveryInfo) {
            deliveryInfo.innerHTML = `
                <p><strong>Address:</strong> ${order.delivery.address}</p>
                <p><strong>Phone:</strong> ${order.delivery.phone}</p>
                <p><strong>Delivery Option:</strong> ${order.delivery.option}</p>
                <p><strong>Estimated Delivery:</strong> ${formatDate(order.estimatedDelivery)}</p>
            `;
        }
        
        if (orderItemsList) {
            orderItemsList.innerHTML = order.items.map(item => `
                <div class="order-item">
                    <img src="${item.image}" alt="${item.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
                    <div style="flex: 1;">
                        <h5>${item.name}</h5>
                        <p>Quantity: ${item.quantity}</p>
                        <p>Price: ${formatCurrency(item.price)}</p>
                    </div>
                    <div style="font-weight: 600; color: var(--success-color);">
                        ${formatCurrency(item.price * item.quantity)}
                    </div>
                </div>
            `).join('');
        }
        
        if (orderSubtotal) orderSubtotal.textContent = formatCurrency(order.pricing.subtotal);
        if (orderTax) orderTax.textContent = formatCurrency(order.pricing.tax);
        if (orderDelivery) orderDelivery.textContent = formatCurrency(order.pricing.deliveryFee);
        if (orderTotal) orderTotal.textContent = formatCurrency(order.pricing.total);
        
        if (statusUpdate) {
            statusUpdate.value = order.status;
            statusUpdate.dataset.orderId = order.id;
        }
    }
    
    setupOrderModal() {
        const modal = document.getElementById('orderDetailModal');
        if (!modal) return;
        
        const closeBtn = modal.querySelector('.close-btn');
        const updateBtn = document.getElementById('updateOrderStatus');
        
        // Close modal
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideOrderModal();
            });
        }
        
        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideOrderModal();
            }
        });
        
        // Update status
        if (updateBtn) {
            updateBtn.addEventListener('click', () => {
                const statusSelect = document.getElementById('statusUpdate');
                if (statusSelect) {
                    const orderId = statusSelect.dataset.orderId;
                    const newStatus = statusSelect.value;
                    this.updateOrderStatus(orderId, newStatus);
                }
            });
        }
    }
    
    hideOrderModal() {
        const modal = document.getElementById('orderDetailModal');
        if (modal) {
            Animation.fadeOut(modal);
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }
    
    async updateOrderStatus(orderId, newStatus) {
        try {
            // Find and update order
            const orderIndex = this.orders.findIndex(order => order.id === orderId);
            if (orderIndex === -1) return;
            
            const oldStatus = this.orders[orderIndex].status;
            this.orders[orderIndex].status = newStatus;
            this.orders[orderIndex].updatedAt = new Date().toISOString();
            
            // Save to storage
            Storage.set('orders', this.orders);
            
            // Update filtered orders
            this.filteredOrders = this.filteredOrders.map(order => 
                order.id === orderId ? this.orders[orderIndex] : order
            );
            
            // Re-render
            this.renderOrders();
            this.updateOrderStats();
            
            // Update modal if open
            const modal = document.getElementById('orderDetailModal');
            if (modal && modal.style.display === 'block') {
                const statusSelect = document.getElementById('statusUpdate');
                if (statusSelect && statusSelect.dataset.orderId === orderId) {
                    statusSelect.value = newStatus;
                }
            }
            
            showToast(`Order ${orderId} status updated to ${newStatus}`, 'success');
            
        } catch (error) {
            showToast('Failed to update order status', 'error');
        }
    }
}

// Initialize admin orders
let adminOrders;

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin/orders.html')) {
        adminOrders = new AdminOrders();
        
        // Make it globally available for onclick handlers
        window.adminOrders = adminOrders;
    }
});