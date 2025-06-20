// Admin dashboard functionality

class AdminDashboard {
    constructor() {
        this.init();
    }
    
    init() {
        this.loadDashboardData();
        this.setupGreeting();
        this.loadRecentOrders();
        this.loadLowStockItems();
        this.setupSalesChart();
    }
    
    setupGreeting() {
        const adminGreeting = document.getElementById('adminGreeting');
        const admin = adminAuthManager.getCurrentAdmin();
        
        if (adminGreeting && admin) {
            const hour = new Date().getHours();
            let greeting = 'Good morning';
            
            if (hour >= 12 && hour < 17) {
                greeting = 'Good afternoon';
            } else if (hour >= 17) {
                greeting = 'Good evening';
            }
            
            adminGreeting.textContent = `${greeting}, ${admin.name}!`;
        }
    }
    
    loadDashboardData() {
        const products = Storage.get('products', []);
        const orders = Storage.get('orders', []);
        const users = Storage.get('users', []);
        
        // Calculate total revenue
        const totalRevenue = orders.reduce((sum, order) => sum + order.pricing.total, 0);
        
        // Update stats cards
        this.updateStatCard('totalProducts', products.length);
        this.updateStatCard('totalOrders', orders.length);
        this.updateStatCard('totalCustomers', users.length);
        this.updateStatCard('totalRevenue', formatCurrency(totalRevenue));
    }
    
    updateStatCard(id, value) {
        const element = document.getElementById(id);
        if (element) {
            element.textContent = value;
        }
    }
    
    loadRecentOrders() {
        const recentOrdersTable = document.getElementById('recentOrdersTable');
        if (!recentOrdersTable) return;
        
        const orders = Storage.get('orders', []);
        const recentOrders = orders.slice(0, 5);
        
        if (recentOrders.length === 0) {
            recentOrdersTable.innerHTML = '<p>No recent orders</p>';
            return;
        }
        
        const tableHTML = `
            <table class="orders-table">
                <thead>
                    <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Date</th>
                        <th>Total</th>
                        <th>Status</th>
                    </tr>
                </thead>
                <tbody>
                    ${recentOrders.map(order => `
                        <tr>
                            <td>${order.id}</td>
                            <td>${order.customerName}</td>
                            <td>${formatDate(order.createdAt)}</td>
                            <td>${formatCurrency(order.pricing.total)}</td>
                            <td><span class="order-status ${order.status}">${order.status}</span></td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        recentOrdersTable.innerHTML = tableHTML;
    }
    
    loadLowStockItems() {
        const lowStockItems = document.getElementById('lowStockItems');
        if (!lowStockItems) return;
        
        const products = Storage.get('products', []);
        const lowStock = products.filter(product => product.stock <= 10);
        
        if (lowStock.length === 0) {
            lowStockItems.innerHTML = '<p>All products are well stocked</p>';
            return;
        }
        
        lowStockItems.innerHTML = lowStock.map(product => `
            <div class="stock-item">
                <img src="${product.image}" alt="${product.name}">
                <div class="stock-info">
                    <h4>${product.name}</h4>
                    <p>Only ${product.stock} left in stock</p>
                </div>
            </div>
        `).join('');
    }
    
    setupSalesChart() {
        const canvas = document.getElementById('salesChart');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        const orders = Storage.get('orders', []);
        
        // Generate sales data for the last 7 days
        const salesData = this.generateSalesData(orders);
        
        this.drawSalesChart(ctx, salesData);
    }
    
    generateSalesData(orders) {
        const days = [];
        const sales = [];
        
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            
            const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
            const dayOrders = orders.filter(order => {
                const orderDate = new Date(order.createdAt);
                return orderDate.toDateString() === date.toDateString();
            });
            
            const dayTotal = dayOrders.reduce((sum, order) => sum + order.pricing.total, 0);
            
            days.push(dayName);
            sales.push(dayTotal);
        }
        
        return { days, sales };
    }
    
    drawSalesChart(ctx, data) {
        const canvas = ctx.canvas;
        const width = canvas.width;
        const height = canvas.height;
        
        // Clear canvas
        ctx.clearRect(0, 0, width, height);
        
        // Chart settings
        const padding = 40;
        const chartWidth = width - 2 * padding;
        const chartHeight = height - 2 * padding;
        
        const maxSales = Math.max(...data.sales, 100);
        const stepX = chartWidth / (data.days.length - 1);
        
        // Draw grid lines
        ctx.strokeStyle = '#404459';
        ctx.lineWidth = 1;
        
        // Horizontal grid lines
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            ctx.beginPath();
            ctx.moveTo(padding, y);
            ctx.lineTo(width - padding, y);
            ctx.stroke();
        }
        
        // Vertical grid lines
        for (let i = 0; i < data.days.length; i++) {
            const x = padding + stepX * i;
            ctx.beginPath();
            ctx.moveTo(x, padding);
            ctx.lineTo(x, height - padding);
            ctx.stroke();
        }
        
        // Draw sales line
        ctx.strokeStyle = '#3B82F6';
        ctx.lineWidth = 3;
        ctx.beginPath();
        
        for (let i = 0; i < data.sales.length; i++) {
            const x = padding + stepX * i;
            const y = height - padding - (data.sales[i] / maxSales) * chartHeight;
            
            if (i === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        
        ctx.stroke();
        
        // Draw data points
        ctx.fillStyle = '#3B82F6';
        for (let i = 0; i < data.sales.length; i++) {
            const x = padding + stepX * i;
            const y = height - padding - (data.sales[i] / maxSales) * chartHeight;
            
            ctx.beginPath();
            ctx.arc(x, y, 4, 0, 2 * Math.PI);
            ctx.fill();
        }
        
        // Draw labels
        ctx.fillStyle = '#B0B3C7';
        ctx.font = '12px Inter';
        ctx.textAlign = 'center';
        
        // Day labels
        for (let i = 0; i < data.days.length; i++) {
            const x = padding + stepX * i;
            ctx.fillText(data.days[i], x, height - 10);
        }
        
        // Sales labels
        ctx.textAlign = 'right';
        for (let i = 0; i <= 5; i++) {
            const y = padding + (chartHeight / 5) * i;
            const value = maxSales - (maxSales / 5) * i;
            ctx.fillText(`$${Math.round(value)}`, padding - 10, y + 4);
        }
    }
}

// Initialize admin dashboard
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin/dashboard.html')) {
        new AdminDashboard();
    }
});