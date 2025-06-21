// Main JavaScript file for SuperMart

// Sample product data with Indian pricing in round figures
const sampleProducts = [
    {
        id: 'prod-1',
        name: 'Fresh Organic Apples',
        category: 'fruits',
        price: 200,
        originalPrice: 250,
        image: 'https://images.pexels.com/photos/102104/pexels-photo-102104.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.5,
        stock: 50,
        unit: 'kg',
        description: 'Fresh, crispy organic apples perfect for snacking or baking.',
        details: ['Organic certified', 'Rich in fiber', 'No pesticides', 'Locally sourced'],
        featured: true
    },
    {
        id: 'prod-2',
        name: 'Premium Bananas',
        category: 'fruits',
        price: 90,
        originalPrice: 110,
        image: 'https://images.pexels.com/photos/61127/pexels-photo-61127.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.3,
        stock: 75,
        unit: 'dozen',
        description: 'Sweet, ripe bananas packed with potassium and natural energy.',
        details: ['High in potassium', 'Natural energy boost', 'Perfect ripeness', 'Great for smoothies'],
        featured: true
    },
    {
        id: 'prod-3',
        name: 'Fresh Spinach',
        category: 'vegetables',
        price: 50,
        originalPrice: 60,
        image: 'https://images.pexels.com/photos/2255935/pexels-photo-2255935.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.7,
        stock: 30,
        unit: 'bunch',
        description: 'Fresh, tender spinach leaves perfect for salads and cooking.',
        details: ['Rich in iron', 'Fresh daily', 'Pesticide-free', 'Perfect for salads'],
        featured: true
    },
    {
        id: 'prod-4',
        name: 'Organic Milk',
        category: 'dairy',
        price: 70,
        originalPrice: 80,
        image: 'https://images.pexels.com/photos/236010/pexels-photo-236010.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.6,
        stock: 25,
        unit: 'liter',
        description: 'Pure organic milk from grass-fed cows.',
        details: ['Organic certified', 'Grass-fed cows', 'No hormones', 'Rich in calcium'],
        featured: true
    },
    {
        id: 'prod-5',
        name: 'Fresh Salmon Fillet',
        category: 'meat',
        price: 900,
        originalPrice: 1000,
        image: 'https://images.pexels.com/photos/725991/pexels-photo-725991.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.8,
        stock: 15,
        unit: 'kg',
        description: 'Fresh Atlantic salmon fillet, rich in omega-3 fatty acids.',
        details: ['Wild caught', 'Rich in omega-3', 'Sustainably sourced', 'Fresh daily'],
        featured: false
    },
    {
        id: 'prod-6',
        name: 'Artisan Bread',
        category: 'bakery',
        price: 90,
        originalPrice: 110,
        image: 'https://images.pexels.com/photos/209206/pexels-photo-209206.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.4,
        stock: 20,
        unit: 'loaf',
        description: 'Freshly baked artisan bread with a crispy crust.',
        details: ['Baked fresh daily', 'No preservatives', 'Traditional recipe', 'Crispy crust'],
        featured: false
    },
    {
        id: 'prod-7',
        name: 'Orange Juice',
        category: 'beverages',
        price: 150,
        originalPrice: 180,
        image: 'https://images.pexels.com/photos/96974/pexels-photo-96974.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.2,
        stock: 40,
        unit: 'liter',
        description: 'Fresh squeezed orange juice, no added sugar.',
        details: ['100% pure juice', 'No added sugar', 'Rich in vitamin C', 'Fresh squeezed'],
        featured: false
    },
    {
        id: 'prod-8',
        name: 'Cherry Tomatoes',
        category: 'vegetables',
        price: 80,
        originalPrice: 100,
        image: 'https://images.pexels.com/photos/533280/pexels-photo-533280.jpeg?auto=compress&cs=tinysrgb&w=400',
        rating: 4.5,
        stock: 35,
        unit: 'pack',
        description: 'Sweet cherry tomatoes perfect for salads and snacking.',
        details: ['Sweet flavor', 'Perfect for salads', 'Rich in lycopene', 'Fresh picked'],
        featured: false
    }
];

class SuperMartApp {
    constructor() {
        this.products = [];
        this.filteredProducts = [];
        this.currentPage = 1;
        this.productsPerPage = 8;
        this.init();
    }
    
    init() {
        this.loadProducts();
        this.setupEventListeners();
        this.renderFeaturedProducts();
        this.setupSearch();
        
        // Initialize products display immediately
        this.initializeProductsDisplay();
    }
    
    initializeProductsDisplay() {
        // Force render products on any page
        setTimeout(() => {
            if (window.location.pathname.includes('products.html')) {
                this.renderProducts();
            }
            this.renderFeaturedProducts();
        }, 100);
    }
    
    loadProducts() {
        // Always use sample data to ensure products are visible
        this.products = [...sampleProducts];
        this.filteredProducts = [...this.products];
        
        // Store in localStorage for other components
        Storage.set('products', this.products);
        
        // Emit event for other components
        if (window.eventEmitter) {
            window.eventEmitter.emit('productsLoaded', this.products);
        }
        
        console.log('Products loaded:', this.products.length);
    }
    
    setupEventListeners() {
        // Category card clicks
        document.addEventListener('click', (e) => {
            const categoryCard = e.target.closest('.category-card');
            if (categoryCard) {
                const category = categoryCard.dataset.category;
                if (category) {
                    window.location.href = `products.html?category=${category}`;
                }
            }
        });
        
        // Product card clicks (for modal)
        document.addEventListener('click', (e) => {
            const productCard = e.target.closest('.product-card');
            if (productCard && !e.target.closest('.add-to-cart-btn') && !e.target.closest('.wishlist-btn')) {
                const productData = JSON.parse(productCard.dataset.product || '{}');
                if (productData.id) {
                    this.showProductModal(productData);
                }
            }
        });
        
        // Wishlist buttons
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('wishlist-btn') || e.target.closest('.wishlist-btn')) {
                e.stopPropagation();
                const button = e.target.classList.contains('wishlist-btn') ? e.target : e.target.closest('.wishlist-btn');
                const productCard = button.closest('.product-card');
                
                if (productCard) {
                    const productData = JSON.parse(productCard.dataset.product || '{}');
                    if (productData.id) {
                        this.toggleWishlist(productData, button);
                    }
                }
            }
        });
        
        // Setup product modal
        this.setupProductModal();
    }
    
    setupSearch() {
        const searchInput = document.getElementById('searchInput');
        const searchBtn = document.getElementById('searchBtn');
        
        if (searchInput) {
            const debouncedSearch = debounce((query) => {
                this.searchProducts(query);
            }, 300);
            
            searchInput.addEventListener('input', (e) => {
                debouncedSearch(e.target.value);
            });
            
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    this.searchProducts(e.target.value);
                }
            });
        }
        
        if (searchBtn) {
            searchBtn.addEventListener('click', () => {
                if (searchInput) {
                    this.searchProducts(searchInput.value);
                }
            });
        }
    }
    
    searchProducts(query) {
        if (!query.trim()) {
            this.filteredProducts = [...this.products];
        } else {
            this.filteredProducts = this.products.filter(product =>
                product.name.toLowerCase().includes(query.toLowerCase()) ||
                product.category.toLowerCase().includes(query.toLowerCase()) ||
                product.description.toLowerCase().includes(query.toLowerCase())
            );
        }
        
        // If on products page, update the display
        if (window.location.pathname.includes('products.html')) {
            this.renderProducts();
        } else {
            // Redirect to products page with search query
            window.location.href = `products.html?search=${encodeURIComponent(query)}`;
        }
    }
    
    renderFeaturedProducts() {
        const featuredContainer = document.getElementById('featuredProducts');
        if (!featuredContainer) return;
        
        const featuredProducts = this.products.filter(product => product.featured).slice(0, 4);
        
        if (featuredProducts.length > 0) {
            featuredContainer.innerHTML = featuredProducts.map(product => 
                this.createProductCard(product)
            ).join('');
        } else {
            // Fallback: show first 4 products if no featured products
            const fallbackProducts = this.products.slice(0, 4);
            featuredContainer.innerHTML = fallbackProducts.map(product => 
                this.createProductCard(product)
            ).join('');
        }
    }
    
    renderProducts() {
        const productsGrid = document.getElementById('productsGrid');
        const productsCount = document.getElementById('productsCount');
        const loadingSpinner = document.getElementById('loadingSpinner');
        const noProducts = document.getElementById('noProducts');
        
        console.log('Rendering products:', this.filteredProducts.length);
        
        if (!productsGrid) {
            console.log('Products grid not found');
            return;
        }
        
        // Hide loading spinner
        if (loadingSpinner) {
            loadingSpinner.style.display = 'none';
        }
        
        if (this.filteredProducts.length === 0) {
            productsGrid.innerHTML = '';
            if (noProducts) noProducts.style.display = 'block';
            if (productsCount) productsCount.textContent = 'No products found';
            return;
        }
        
        // Hide no products message
        if (noProducts) noProducts.style.display = 'none';
        
        const startIndex = (this.currentPage - 1) * this.productsPerPage;
        const endIndex = startIndex + this.productsPerPage;
        const productsToShow = this.filteredProducts.slice(startIndex, endIndex);
        
        console.log('Products to show:', productsToShow.length);
        
        // Generate product cards HTML
        const productsHTML = productsToShow.map(product => 
            this.createProductCard(product)
        ).join('');
        
        productsGrid.innerHTML = productsHTML;
        
        if (productsCount) {
            productsCount.textContent = `Showing ${productsToShow.length} of ${this.filteredProducts.length} products`;
        }
        
        this.renderPagination();
    }
    
    createProductCard(product) {
        const discount = product.originalPrice ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100) : 0;
        const isWishlisted = this.isInWishlist(product.id);
        
        return `
            <div class="bg-gray-800 rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 product-card" data-product='${JSON.stringify(product)}'>
                <div class="relative">
                    <img src="${product.image}" alt="${product.name}" class="w-full h-48 object-cover">
                    ${discount > 0 ? `<div class="absolute top-2 left-2 bg-red-600 text-white px-2 py-1 rounded-full text-xs font-bold">${discount}% OFF</div>` : ''}
                    ${product.stock <= 5 ? '<div class="absolute top-2 right-2 bg-yellow-600 text-white px-2 py-1 rounded-full text-xs font-bold">Low Stock</div>' : ''}
                    <button class="absolute top-2 right-2 w-8 h-8 bg-white bg-opacity-80 rounded-full flex items-center justify-center text-gray-600 hover:text-red-500 transition-colors wishlist-btn ${isWishlisted ? 'text-red-500' : ''}" data-id="${product.id}">
                        <span class="material-icons text-sm">favorite</span>
                    </button>
                </div>
                <div class="p-4">
                    <h3 class="text-lg font-semibold text-white mb-2">${product.name}</h3>
                    <div class="flex items-center mb-2">
                        <div class="flex text-yellow-400">
                            ${this.generateStars(product.rating)}
                        </div>
                        <span class="text-gray-400 text-sm ml-2">(${product.rating})</span>
                    </div>
                    <div class="flex items-center justify-between mb-4">
                        <div class="flex items-center space-x-2">
                            <span class="text-xl font-bold text-green-400">₹${product.price}</span>
                            ${product.originalPrice ? `<span class="text-gray-500 line-through">₹${product.originalPrice}</span>` : ''}
                        </div>
                        <span class="text-gray-400 text-sm">${product.unit}</span>
                    </div>
                    <button class="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md transition duration-200 add-to-cart-btn ${product.stock === 0 ? 'opacity-50 cursor-not-allowed' : ''}" ${product.stock === 0 ? 'disabled' : ''}>
                        <span class="material-icons mr-2 text-sm">add_shopping_cart</span>
                        ${product.stock === 0 ? 'Out of Stock' : 'Add to Cart'}
                    </button>
                </div>
            </div>
        `;
    }
    
    generateStars(rating) {
        const fullStars = Math.floor(rating);
        const hasHalfStar = rating % 1 !== 0;
        const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
        
        let stars = '';
        
        for (let i = 0; i < fullStars; i++) {
            stars += '<span class="material-icons text-sm">star</span>';
        }
        
        if (hasHalfStar) {
            stars += '<span class="material-icons text-sm">star_half</span>';
        }
        
        for (let i = 0; i < emptyStars; i++) {
            stars += '<span class="material-icons text-sm text-gray-600">star_border</span>';
        }
        
        return stars;
    }
    
    renderPagination() {
        const pagination = document.getElementById('pagination');
        if (!pagination) return;
        
        const totalPages = Math.ceil(this.filteredProducts.length / this.productsPerPage);
        
        if (totalPages <= 1) {
            pagination.innerHTML = '';
            return;
        }
        
        let paginationHTML = '';
        
        // Previous button
        paginationHTML += `
            <button class="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors ${this.currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''}" ${this.currentPage === 1 ? 'disabled' : ''} onclick="app.goToPage(${this.currentPage - 1})">
                <span class="material-icons">chevron_left</span> Previous
            </button>
        `;
        
        // Page numbers
        for (let i = 1; i <= totalPages; i++) {
            if (i === 1 || i === totalPages || (i >= this.currentPage - 2 && i <= this.currentPage + 2)) {
                paginationHTML += `
                    <button class="px-4 py-2 rounded-md transition-colors ${i === this.currentPage ? 'bg-blue-600 text-white' : 'bg-gray-700 text-white hover:bg-gray-600'}" onclick="app.goToPage(${i})">
                        ${i}
                    </button>
                `;
            } else if (i === this.currentPage - 3 || i === this.currentPage + 3) {
                paginationHTML += '<span class="px-2 text-gray-400">...</span>';
            }
        }
        
        // Next button
        paginationHTML += `
            <button class="px-4 py-2 bg-gray-700 text-white rounded-md hover:bg-gray-600 transition-colors ${this.currentPage === totalPages ? 'opacity-50 cursor-not-allowed' : ''}" ${this.currentPage === totalPages ? 'disabled' : ''} onclick="app.goToPage(${this.currentPage + 1})">
                Next <span class="material-icons">chevron_right</span>
            </button>
        `;
        
        pagination.innerHTML = `<div class="flex items-center justify-center space-x-2">${paginationHTML}</div>`;
    }
    
    goToPage(page) {
        this.currentPage = page;
        this.renderProducts();
        
        // Scroll to top of products section
        const productsSection = document.querySelector('.products-section');
        if (productsSection) {
            productsSection.scrollIntoView({ behavior: 'smooth' });
        }
    }
    
    setupProductModal() {
        const modal = document.getElementById('productModal');
        if (!modal) return;
        
        const closeBtn = modal.querySelector('.close-btn');
        const decreaseBtn = document.getElementById('decreaseQty');
        const increaseBtn = document.getElementById('increaseQty');
        const addToCartBtn = document.getElementById('addToCartModal');
        const addToWishlistBtn = document.getElementById('addToWishlist');
        
        // Close modal
        if (closeBtn) {
            closeBtn.addEventListener('click', () => {
                this.hideProductModal();
            });
        }
        
        // Click outside to close
        modal.addEventListener('click', (e) => {
            if (e.target === modal) {
                this.hideProductModal();
            }
        });
        
        // Quantity controls
        if (decreaseBtn) {
            decreaseBtn.addEventListener('click', () => {
                const qtySpan = document.getElementById('selectedQty');
                const currentQty = parseInt(qtySpan.textContent);
                if (currentQty > 1) {
                    qtySpan.textContent = currentQty - 1;
                }
            });
        }
        
        if (increaseBtn) {
            increaseBtn.addEventListener('click', () => {
                const qtySpan = document.getElementById('selectedQty');
                const currentQty = parseInt(qtySpan.textContent);
                qtySpan.textContent = currentQty + 1;
            });
        }
        
        // Add to cart from modal
        if (addToCartBtn) {
            addToCartBtn.addEventListener('click', () => {
                const productData = JSON.parse(modal.dataset.product || '{}');
                const quantity = parseInt(document.getElementById('selectedQty').textContent);
                
                if (productData.id) {
                    cartManager.addItem(productData, quantity);
                    this.hideProductModal();
                }
            });
        }
        
        // Add to wishlist from modal
        if (addToWishlistBtn) {
            addToWishlistBtn.addEventListener('click', () => {
                const productData = JSON.parse(modal.dataset.product || '{}');
                if (productData.id) {
                    this.toggleWishlist(productData, addToWishlistBtn);
                }
            });
        }
    }
    
    showProductModal(product) {
        const modal = document.getElementById('productModal');
        if (!modal) return;
        
        // Store product data
        modal.dataset.product = JSON.stringify(product);
        
        // Update modal content
        document.getElementById('modalProductImage').src = product.image;
        document.getElementById('modalProductImage').alt = product.name;
        document.getElementById('modalProductName').textContent = product.name;
        document.getElementById('modalProductRating').innerHTML = `
            <div class="flex text-yellow-400">${this.generateStars(product.rating)}</div>
            <span class="text-gray-400 ml-2">(${product.rating})</span>
        `;
        document.getElementById('modalProductPrice').innerHTML = `
            <span class="text-2xl font-bold text-green-400">₹${product.price}</span>
            ${product.originalPrice ? `<span class="text-gray-500 line-through ml-2">₹${product.originalPrice}</span>` : ''}
        `;
        document.getElementById('modalProductDescription').textContent = product.description;
        
        // Update product details
        const detailsList = document.getElementById('modalProductDetails');
        detailsList.innerHTML = product.details.map(detail => `<li class="text-gray-300">${detail}</li>`).join('');
        
        // Reset quantity
        document.getElementById('selectedQty').textContent = '1';
        
        // Update wishlist button
        const wishlistBtn = document.getElementById('addToWishlist');
        const isWishlisted = this.isInWishlist(product.id);
        wishlistBtn.innerHTML = `
            <span class="material-icons mr-2">favorite</span>
            ${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
        `;
        wishlistBtn.classList.toggle('bg-red-600', isWishlisted);
        wishlistBtn.classList.toggle('hover:bg-red-700', isWishlisted);
        wishlistBtn.classList.toggle('bg-gray-600', !isWishlisted);
        wishlistBtn.classList.toggle('hover:bg-gray-700', !isWishlisted);
        
        // Show modal
        modal.style.display = 'flex';
        Animation.fadeIn(modal);
    }
    
    hideProductModal() {
        const modal = document.getElementById('productModal');
        if (modal) {
            Animation.fadeOut(modal);
            setTimeout(() => {
                modal.style.display = 'none';
            }, 300);
        }
    }
    
    toggleWishlist(product, button) {
        if (!authManager.isLoggedIn()) {
            showToast('Please login to add items to wishlist', 'warning');
            // Open auth modal
            document.getElementById('authModal').classList.remove('hidden');
            document.getElementById('authModal').classList.add('flex');
            return;
        }
        
        const wishlist = Storage.get('wishlist', []);
        const existingIndex = wishlist.findIndex(item => item.id === product.id);
        
        if (existingIndex > -1) {
            // Remove from wishlist
            wishlist.splice(existingIndex, 1);
            button.classList.remove('text-red-500');
            showToast(`${product.name} removed from wishlist`, 'success');
        } else {
            // Add to wishlist
            wishlist.push({
                ...product,
                addedAt: new Date().toISOString()
            });
            button.classList.add('text-red-500');
            showToast(`${product.name} added to wishlist`, 'success');
        }
        
        Storage.set('wishlist', wishlist);
        
        // Update modal button if it exists
        const modalWishlistBtn = document.getElementById('addToWishlist');
        if (modalWishlistBtn) {
            const isWishlisted = this.isInWishlist(product.id);
            modalWishlistBtn.innerHTML = `
                <span class="material-icons mr-2">favorite</span>
                ${isWishlisted ? 'Remove from Wishlist' : 'Add to Wishlist'}
            `;
            modalWishlistBtn.classList.toggle('bg-red-600', isWishlisted);
            modalWishlistBtn.classList.toggle('hover:bg-red-700', isWishlisted);
            modalWishlistBtn.classList.toggle('bg-gray-600', !isWishlisted);
            modalWishlistBtn.classList.toggle('hover:bg-gray-700', !isWishlisted);
        }
        
        // Emit wishlist update event
        if (window.eventEmitter) {
            window.eventEmitter.emit('wishlistUpdated', wishlist);
        }
    }
    
    isInWishlist(productId) {
        const wishlist = Storage.get('wishlist', []);
        return wishlist.some(item => item.id === productId);
    }
    
    filterProducts(filters) {
        this.filteredProducts = this.products.filter(product => {
            let matches = true;
            
            if (filters.category && filters.category !== '') {
                matches = matches && product.category === filters.category;
            }
            
            if (filters.maxPrice) {
                matches = matches && product.price <= filters.maxPrice;
            }
            
            if (filters.search) {
                const searchTerm = filters.search.toLowerCase();
                matches = matches && (
                    product.name.toLowerCase().includes(searchTerm) ||
                    product.description.toLowerCase().includes(searchTerm) ||
                    product.category.toLowerCase().includes(searchTerm)
                );
            }
            
            return matches;
        });
        
        this.currentPage = 1;
        this.renderProducts();
    }
    
    sortProducts(sortBy) {
        switch (sortBy) {
            case 'name':
                this.filteredProducts.sort((a, b) => a.name.localeCompare(b.name));
                break;
            case 'price-low':
                this.filteredProducts.sort((a, b) => a.price - b.price);
                break;
            case 'price-high':
                this.filteredProducts.sort((a, b) => b.price - a.price);
                break;
            case 'rating':
                this.filteredProducts.sort((a, b) => b.rating - a.rating);
                break;
            default:
                break;
        }
        
        this.renderProducts();
    }
}

// Initialize the app
const app = new SuperMartApp();

// Make it globally available
window.app = app;

// Handle page-specific initialization
document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM loaded, initializing app...');
    
    // Force initialization after a short delay
    setTimeout(() => {
        // Check if we're on the products page
        if (window.location.pathname.includes('products.html')) {
            console.log('On products page, rendering products...');
            
            // Parse URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const category = urlParams.get('category');
            const search = urlParams.get('search');
            
            // Apply filters from URL
            const filters = {};
            if (category) filters.category = category;
            if (search) filters.search = search;
            
            if (Object.keys(filters).length > 0) {
                app.filterProducts(filters);
            } else {
                app.renderProducts();
            }
            
            // Update search input if search parameter exists
            const searchInput = document.getElementById('searchInput');
            if (searchInput && search) {
                searchInput.value = search;
            }
        }
        
        // Always render featured products on home page
        if (window.location.pathname === '/' || window.location.pathname.includes('index.html') || window.location.pathname === '/index.html') {
            console.log('On home page, rendering featured products...');
            app.renderFeaturedProducts();
        }
    }, 200);
});

// Export for use in other modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SuperMartApp;
}