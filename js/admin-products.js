// Admin products management

class AdminProducts {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.editingProduct = null;
        this.init();
    }
    
    init() {
        this.loadProducts();
        this.setupEventListeners();
        this.renderProducts();
    }
    
    loadProducts() {
        this.products = Storage.get('products', []);
        this.filteredProducts = [...this.products];
    }
    
    setupEventListeners() {
        // Add product button
        const addProductBtn = document.getElementById('addProductBtn');
        if (addProductBtn) {
            addProductBtn.addEventListener('click', () => {
                this.showProductModal();
            });
        }
        
        // Search and filters
        this.setupFilters();
        
        // Product form
        this.setupProductForm();
        
        // Delete modal
        this.setupDeleteModal();
    }
    
    setupFilters() {
        const productSearch = document.getElementById('productSearch');
        const searchBtn = document.getElementById('searchProductBtn');
        const categoryFilter = document.getElementById('categoryFilterAdmin');
        const stockFilter = document.getElementById('stockFilter');
        
        if (productSearch) {
            const debouncedSearch = debounce(() => {
                this.applyFilters();
            }, 300);
            
            productSearch.addEventListener('input', debouncedSearch);
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                this.applyFilters();
            });
        }
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }
        
        if (stockFilter) {
            stockFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }
    }
    
    applyFilters() {
        const searchTerm = document.getElementById('productSearch')?.value.toLowerCase() || '';
        const category = document.getElementById('categoryFilterAdmin')?.value || '';
        const stockFilter = document.getElementById('stockFilter')?.value || '';
        
        this.filteredProducts = this.products.filter(product => {
            let matches = true;
            
            // Search filter
            if (searchTerm) {
                matches = matches && (
                    product.name.toLowerCase().includes(searchTerm) ||
                    product.category.toLowerCase().includes(searchTerm) ||
                    product.description.toLowerCase().includes(searchTerm)
                );
            }
            
            // Category filter
            if (category) {
                matches = matches && product.category === category;
            }
            
            // Stock filter
            if (stockFilter) {
                switch (stockFilter) {
                    case 'in-stock':
                        matches = matches && product.stock > 10;
                        break;
                    case 'low-stock':
                        matches = matches && product.stock > 0 && product.stock <= 10;
                        break;
                    case 'out-of-stock':
                        matches = matches && product.stock === 0;
                        break;
                }
            }
            
            return matches;
        });
        
        this.renderProducts();
    }
    
    renderProducts() {
        const tableBody = document.getElementById('productsTableBody');
        if (!tableBody) return;
        
        if (this.filteredProducts.length === 0) {
            tableBody.innerHTML = `
                <tr>
                    <td colspan="8" style="text-align: center; padding: 2rem; color: var(--text-muted);">
                        No products found
                    </td>
                </tr>
            `;
            return;
        }
        
        tableBody.innerHTML = this.filteredProducts.map(product => `
            <tr>
                <td>
                    <img src="${product.image}" alt="${product.name}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 8px;">
                </td>
                <td>${product.name}</td>
                <td>${product.category}</td>
                <td>${formatCurrency(product.price)}</td>
                <td>${product.stock}</td>
                <td>${product.rating}</td>
                <td>
                    <span class="stock-status ${this.getStockStatus(product.stock)}">
                        ${this.getStockStatusText(product.stock)}
                    </span>
                </td>
                <td>
                    <div class="action-buttons">
                        <button class="edit-btn" onclick="adminProducts.editProduct('${product.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="delete-btn" onclick="adminProducts.deleteProduct('${product.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </td>
            </tr>
        `).join('');
    }
    
    getStockStatus(stock) {
        if (stock === 0) return 'out-of-stock';
        if (stock <= 10) return 'low-stock';
        return 'in-stock';
    }
    
    getStockStatusText(stock) {
        if (stock === 0) return 'Out of Stock';
        if (stock <= 10) return 'Low Stock';
        return 'In Stock';
    }
    
    setupProductForm() {
        const productForm = document.getElementById('productForm');
        const modal = document.getElementById('productModal');
        const closeBtn = modal?.querySelector('.close-btn');
        const cancelBtn = document.getElementById('cancelProduct');
        
        // Close modal
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideProductModal();
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideProductModal();
            });
        }
        
        // Click outside to close
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideProductModal();
                }
            });
        }
        
        // Form submission
        if (productForm) {
            productForm.addEventListener('submit', (e) => {
                e.preventDefault();
                this.saveProduct();
            });
        }
    }
    
    showProductModal(product = null) {
        const modal = document.getElementById('productModal');
        const modalTitle = document.getElementById('productModalTitle');
        const form = document.getElementById('productForm');
        
        if (!modal || !form) return;
        
        this.editingProduct = product;
        
        // Update modal title
        if (modalTitle) {
            modalTitle.textContent = product ? 'Edit Product' : 'Add New Product';
        }
        
        // Populate form
        if (product) {
            document.getElementById('productName').value = product.name;
            document.getElementById('productCategory').value = product.category;
            document.getElementById('productPrice').value = product.price;
            document.getElementById('productStock').value = product.stock;
            document.getElementById('productImage').value = product.image;
            document.getElementById('productDescription').value = product.description || '';
            document.getElementById('productRating').value = product.rating;
            document.getElementById('productUnit').value = product.unit || 'piece';
        } else {
            form.reset();
            document.getElementById('productRating').value = '4.0';
        }
        
        // Show modal
        modal.style.display = 'block';
        Animation.fadeIn(modal);
    }
    
    hideProductModal() {
        const modal = document.getElementById('productModal');
        if (modal) {
            Animation.fadeOut(modal);
            setTimeout(() => {
                modal.style.display = 'none';
                this.editingProduct = null;
            }, 300);
        }
    }
    
    async saveProduct() {
        const form = document.getElementById('productForm');
        const formData = new FormData(form);
        
        // Validate form
        const name = document.getElementById('productName').value.trim();
        const category = document.getElementById('productCategory').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        const stock = parseInt(document.getElementById('productStock').value);
        const image = document.getElementById('productImage').value.trim();
        
        if (!name || !category || !price || !stock || !image) {
            showToast('Please fill in all required fields', 'error');
            return;
        }
        
        if (!Validation.url(image)) {
            showToast('Please enter a valid image URL', 'error');
            return;
        }
        
        try {
            // Show loading state
            const saveBtn = document.getElementById('saveProduct');
            const originalText = saveBtn.textContent;
            saveBtn.textContent = 'Saving...';
            saveBtn.disabled = true;
            
            // Simulate API call
            await API.delay(1000);
            
            const productData = {
                id: this.editingProduct ? this.editingProduct.id : generateId(),
                name: name,
                category: category,
                price: price,
                originalPrice: price * 1.2, // Add 20% as original price for demo
                stock: stock,
                image: image,
                description: document.getElementById('productDescription').value.trim(),
                rating: parseFloat(document.getElementById('productRating').value),
                unit: document.getElementById('productUnit').value,
                details: [
                    'High quality product',
                    'Fresh and natural',
                    'Carefully selected',
                    'Best value for money'
                ],
                featured: false
            };
            
            if (this.editingProduct) {
                // Update existing product
                const index = this.products.findIndex(p => p.id === this.editingProduct.id);
                if (index > -1) {
                    this.products[index] = { ...this.editingProduct, ...productData };
                }
                showToast('Product updated successfully', 'success');
            } else {
                // Add new product
                this.products.unshift(productData);
                showToast('Product added successfully', 'success');
            }
            
            // Save to storage
            Storage.set('products', this.products);
            
            // Update filtered products and re-render
            this.applyFilters();
            
            // Hide modal
            this.hideProductModal();
            
        } catch (error) {
            showToast('Failed to save product', 'error');
        } finally {
            // Reset button
            const saveBtn = document.getElementById('saveProduct');
            if (saveBtn) {
                saveBtn.textContent = 'Save Product';
                saveBtn.disabled = false;
            }
        }
    }
    
    editProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (product) {
            this.showProductModal(product);
        }
    }
    
    deleteProduct(productId) {
        const product = this.products.find(p => p.id === productId);
        if (!product) return;
        
        // Show delete confirmation modal
        const modal = document.getElementById('deleteModal');
        if (!modal) return;
        
        modal.dataset.productId = productId;
        modal.style.display = 'block';
        Animation.fadeIn(modal);
    }
    
    setupDeleteModal() {
        const modal = document.getElementById('deleteModal');
        if (!modal) return;
        
        const closeBtn = modal.querySelector('.close-btn');
        const cancelBtn = document.getElementById('cancelDelete');
        const confirmBtn = document.getElementById('confirmDelete');
        
        // Close modal
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideDeleteModal();
            });
        }
        
        if (cancelBtn) {
            cancelBtn.addEventListener('click', () => {
                this.hideDeleteModal();
            });
        }
        
        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideDeleteModal();
            }
        });
        
        // Confirm delete
        if (confirmBtn) {
            confirmBtn.addEventListener('click', () => {
                this.confirmDelete();
            });
        }
    }
    
    hideDeleteModal() {
        const modal = document.getElementById('deleteModal');
        if (modal) {
            Animation.fadeOut(modal);
            setTimeout(() => {
                modal.style.display = 'none';
                delete modal.dataset.productId;
            }, 300);
        }
    }
    
    async confirmDelete() {
        const modal = document.getElementById('deleteModal');
        const productId = modal?.dataset.productId;
        
        if (!productId) return;
        
        try {
            // Show loading state
            const confirmBtn = document.getElementById('confirmDelete');
            const originalText = confirmBtn.textContent;
            confirmBtn.textContent = 'Deleting...';
            confirmBtn.disabled = true;
            
            // Simulate API call
            await API.delay(1000);
            
            // Remove product
            this.products = this.products.filter(p => p.id !== productId);
            Storage.set('products', this.products);
            
            // Update filtered products and re-render
            this.applyFilters();
            
            showToast('Product deleted successfully', 'success');
            this.hideDeleteModal();
            
        } catch (error) {
            showToast('Failed to delete product', 'error');
        } finally {
            // Reset button
            const confirmBtn = document.getElementById('confirmDelete');
            if (confirmBtn) {
                confirmBtn.textContent = 'Delete';
                confirmBtn.disabled = false;
            }
        }
    }
}

// Initialize admin products
let adminProducts;

document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('admin/products.html')) {
        adminProducts = new AdminProducts();
        
        // Make it globally available for onclick handlers
        window.adminProducts = adminProducts;
    }
});