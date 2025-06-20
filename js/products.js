// Products page specific functionality

class ProductsPage {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupFilters();
        this.setupViewToggle();
        this.loadInitialProducts();
    }
    
    setupFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const sortFilter = document.getElementById('sortFilter');
        const priceRange = document.getElementById('priceRange');
        const priceValue = document.getElementById('priceValue');
        const clearFilters = document.getElementById('clearFilters');
        
        // Category filter
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => {
                this.applyFilters();
            });
        }
        
        // Sort filter
        if (sortFilter) {
            sortFilter.addEventListener('change', () => {
                app.sortProducts(sortFilter.value);
            });
        }
        
        // Price range filter
        if (priceRange && priceValue) {
            priceRange.addEventListener('input', () => {
                priceValue.textContent = `$${priceRange.value}`;
                this.applyFilters();
            });
        }
        
        // Clear filters
        if (clearFilters) {
            clearFilters.addEventListener('click', () => {
                this.clearAllFilters();
            });
        }
    }
    
    setupViewToggle() {
        const gridView = document.getElementById('gridView');
        const listView = document.getElementById('listView');
        const productsGrid = document.getElementById('productsGrid');
        
        if (gridView && listView && productsGrid) {
            gridView.addEventListener('click', () => {
                gridView.classList.add('active');
                listView.classList.remove('active');
                productsGrid.classList.remove('list-view');
                productsGrid.classList.add('grid-view');
                Storage.set('viewMode', 'grid');
            });
            
            listView.addEventListener('click', () => {
                listView.classList.add('active');
                gridView.classList.remove('active');
                productsGrid.classList.remove('grid-view');
                productsGrid.classList.add('list-view');
                Storage.set('viewMode', 'list');
            });
            
            // Load saved view mode
            const savedViewMode = Storage.get('viewMode', 'grid');
            if (savedViewMode === 'list') {
                listView.click();
            }
        }
    }
    
    loadInitialProducts() {
        // Parse URL parameters for initial filters
        const urlParams = new URLSearchParams(window.location.search);
        const category = urlParams.get('category');
        const search = urlParams.get('search');
        
        // Set filter values from URL
        const categoryFilter = document.getElementById('categoryFilter');
        const searchInput = document.getElementById('searchInput');
        
        if (categoryFilter && category) {
            categoryFilter.value = category;
        }
        
        if (searchInput && search) {
            searchInput.value = search;
        }
        
        // Apply initial filters
        this.applyFilters();
    }
    
    applyFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const priceRange = document.getElementById('priceRange');
        const searchInput = document.getElementById('searchInput');
        
        const filters = {};
        
        if (categoryFilter && categoryFilter.value) {
            filters.category = categoryFilter.value;
        }
        
        if (priceRange && priceRange.value) {
            filters.maxPrice = parseFloat(priceRange.value);
        }
        
        if (searchInput && searchInput.value.trim()) {
            filters.search = searchInput.value.trim();
        }
        
        app.filterProducts(filters);
        
        // Update URL without page reload
        this.updateURL(filters);
    }
    
    clearAllFilters() {
        const categoryFilter = document.getElementById('categoryFilter');
        const sortFilter = document.getElementById('sortFilter');
        const priceRange = document.getElementById('priceRange');
        const priceValue = document.getElementById('priceValue');
        const searchInput = document.getElementById('searchInput');
        
        if (categoryFilter) categoryFilter.value = '';
        if (sortFilter) sortFilter.value = 'name';
        if (priceRange) {
            priceRange.value = priceRange.max;
            if (priceValue) priceValue.textContent = `$${priceRange.max}`;
        }
        if (searchInput) searchInput.value = '';
        
        // Clear URL parameters
        window.history.replaceState({}, document.title, window.location.pathname);
        
        // Reset products
        app.filteredProducts = [...app.products];
        app.currentPage = 1;
        app.renderProducts();
    }
    
    updateURL(filters) {
        const url = new URL(window.location);
        
        // Clear existing parameters
        url.searchParams.delete('category');
        url.searchParams.delete('search');
        url.searchParams.delete('maxPrice');
        
        // Add new parameters
        if (filters.category) {
            url.searchParams.set('category', filters.category);
        }
        
        if (filters.search) {
            url.searchParams.set('search', filters.search);
        }
        
        if (filters.maxPrice) {
            url.searchParams.set('maxPrice', filters.maxPrice);
        }
        
        // Update URL without page reload
        window.history.replaceState({}, document.title, url.toString());
    }
}

// Initialize products page functionality
document.addEventListener('DOMContentLoaded', () => {
    if (window.location.pathname.includes('products.html')) {
        new ProductsPage();
    }
});

// Add CSS for list view
const listViewCSS = `
.products-grid.list-view {
    display: flex;
    flex-direction: column;
    gap: 1rem;
}

.products-grid.list-view .product-card {
    display: flex;
    align-items: center;
    gap: 2rem;
    padding: 1.5rem;
}

.products-grid.list-view .product-image {
    flex-shrink: 0;
    width: 150px;
    height: 150px;
}

.products-grid.list-view .product-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
}

.products-grid.list-view .product-info {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.products-grid.list-view .product-info h3 {
    font-size: 1.3rem;
    margin-bottom: 0.5rem;
}

.products-grid.list-view .add-to-cart-btn {
    width: auto;
    align-self: flex-start;
    padding: 0.5rem 1rem;
}

@media (max-width: 768px) {
    .products-grid.list-view .product-card {
        flex-direction: column;
        text-align: center;
    }
    
    .products-grid.list-view .product-image {
        width: 100%;
        max-width: 200px;
    }
}
`;

// Inject list view CSS
const style = document.createElement('style');
style.textContent = listViewCSS;
document.head.appendChild(style);