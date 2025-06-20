// Search Autocomplete Enhancement

class SearchAutocomplete {
    constructor() {
        this.searchInput = null;
        this.suggestionsContainer = null;
        this.products = [];
        this.categories = [];
        this.currentSuggestions = [];
        this.selectedIndex = -1;
        this.init();
    }
    
    init() {
        this.loadProducts();
        this.setupSearchInputs();
        this.setupEventListeners();
    }
    
    loadProducts() {
        this.products = Storage.get('products', []);
        this.categories = [...new Set(this.products.map(p => p.category))];
    }
    
    setupSearchInputs() {
        const searchInputs = document.querySelectorAll('#searchInput, .search-input');
        searchInputs.forEach(input => {
            this.enhanceSearchInput(input);
        });
    }
    
    enhanceSearchInput(input) {
        const container = input.parentElement;
        
        // Add search icon if not present
        if (!container.querySelector('.search-icon')) {
            const icon = document.createElement('i');
            icon.className = 'fas fa-search search-icon';
            container.appendChild(icon);
        }
        
        // Create suggestions container
        const suggestionsContainer = document.createElement('div');
        suggestionsContainer.className = 'search-suggestions';
        suggestionsContainer.style.display = 'none';
        container.appendChild(suggestionsContainer);
        
        // Setup input events
        input.addEventListener('input', (e) => {
            this.handleInput(e, suggestionsContainer);
        });
        
        input.addEventListener('keydown', (e) => {
            this.handleKeydown(e, suggestionsContainer);
        });
        
        input.addEventListener('focus', (e) => {
            if (e.target.value.trim()) {
                this.showSuggestions(e.target.value, suggestionsContainer);
            }
        });
        
        input.addEventListener('blur', (e) => {
            // Delay hiding to allow clicking on suggestions
            setTimeout(() => {
                this.hideSuggestions(suggestionsContainer);
            }, 200);
        });
    }
    
    setupEventListeners() {
        // Listen for product updates
        window.eventEmitter.on('productsUpdated', () => {
            this.loadProducts();
        });
        
        // Close suggestions when clicking outside
        document.addEventListener('click', (e) => {
            if (!e.target.closest('.search-container')) {
                this.hideAllSuggestions();
            }
        });
    }
    
    handleInput(event, suggestionsContainer) {
        const query = event.target.value.trim();
        
        if (query.length < 2) {
            this.hideSuggestions(suggestionsContainer);
            return;
        }
        
        this.showSuggestions(query, suggestionsContainer);
    }
    
    handleKeydown(event, suggestionsContainer) {
        const suggestions = suggestionsContainer.querySelectorAll('.search-suggestion');
        
        switch (event.key) {
            case 'ArrowDown':
                event.preventDefault();
                this.selectedIndex = Math.min(this.selectedIndex + 1, suggestions.length - 1);
                this.updateSelection(suggestions);
                break;
                
            case 'ArrowUp':
                event.preventDefault();
                this.selectedIndex = Math.max(this.selectedIndex - 1, -1);
                this.updateSelection(suggestions);
                break;
                
            case 'Enter':
                event.preventDefault();
                if (this.selectedIndex >= 0 && suggestions[this.selectedIndex]) {
                    this.selectSuggestion(suggestions[this.selectedIndex], event.target);
                } else {
                    this.performSearch(event.target.value);
                }
                break;
                
            case 'Escape':
                this.hideSuggestions(suggestionsContainer);
                event.target.blur();
                break;
        }
    }
    
    showSuggestions(query, container) {
        const suggestions = this.generateSuggestions(query);
        
        if (suggestions.length === 0) {
            this.hideSuggestions(container);
            return;
        }
        
        container.innerHTML = suggestions.map((suggestion, index) => `
            <div class="search-suggestion" data-type="${suggestion.type}" data-value="${suggestion.value}">
                <div class="search-suggestion-text">${this.highlightMatch(suggestion.text, query)}</div>
                <div class="search-suggestion-category">${suggestion.category}</div>
            </div>
        `).join('');
        
        // Add click listeners
        container.querySelectorAll('.search-suggestion').forEach((item, index) => {
            item.addEventListener('click', () => {
                this.selectSuggestion(item, container.previousElementSibling);
            });
        });
        
        container.style.display = 'block';
        this.selectedIndex = -1;
    }
    
    hideSuggestions(container) {
        container.style.display = 'none';
        this.selectedIndex = -1;
    }
    
    hideAllSuggestions() {
        document.querySelectorAll('.search-suggestions').forEach(container => {
            this.hideSuggestions(container);
        });
    }
    
    generateSuggestions(query) {
        const suggestions = [];
        const queryLower = query.toLowerCase();
        
        // Product suggestions
        const productMatches = this.products
            .filter(product => 
                product.name.toLowerCase().includes(queryLower) ||
                product.description.toLowerCase().includes(queryLower)
            )
            .slice(0, 5)
            .map(product => ({
                type: 'product',
                value: product.name,
                text: product.name,
                category: `Product in ${product.category}`,
                data: product
            }));
        
        suggestions.push(...productMatches);
        
        // Category suggestions
        const categoryMatches = this.categories
            .filter(category => category.toLowerCase().includes(queryLower))
            .slice(0, 3)
            .map(category => ({
                type: 'category',
                value: category,
                text: category.charAt(0).toUpperCase() + category.slice(1),
                category: 'Category',
                data: { category }
            }));
        
        suggestions.push(...categoryMatches);
        
        // Popular searches (simulated)
        const popularSearches = [
            'organic', 'fresh', 'dairy', 'vegetables', 'fruits', 'meat', 'bakery'
        ];
        
        const popularMatches = popularSearches
            .filter(term => term.toLowerCase().includes(queryLower))
            .slice(0, 2)
            .map(term => ({
                type: 'popular',
                value: term,
                text: term.charAt(0).toUpperCase() + term.slice(1),
                category: 'Popular search',
                data: { search: term }
            }));
        
        suggestions.push(...popularMatches);
        
        return suggestions.slice(0, 8);
    }
    
    highlightMatch(text, query) {
        const regex = new RegExp(`(${query})`, 'gi');
        return text.replace(regex, '<strong>$1</strong>');
    }
    
    updateSelection(suggestions) {
        suggestions.forEach((item, index) => {
            item.classList.toggle('selected', index === this.selectedIndex);
        });
    }
    
    selectSuggestion(suggestionElement, input) {
        const type = suggestionElement.dataset.type;
        const value = suggestionElement.dataset.value;
        
        input.value = value;
        this.hideSuggestions(suggestionElement.parentElement);
        
        // Perform search based on type
        switch (type) {
            case 'product':
                this.performSearch(value);
                break;
            case 'category':
                this.performCategorySearch(value);
                break;
            case 'popular':
                this.performSearch(value);
                break;
        }
    }
    
    performSearch(query) {
        if (window.location.pathname.includes('products.html')) {
            // Update search input and trigger search
            const searchInput = document.getElementById('searchInput');
            if (searchInput) {
                searchInput.value = query;
                if (window.app && window.app.searchProducts) {
                    window.app.searchProducts(query);
                }
            }
        } else {
            // Redirect to products page with search
            window.location.href = `products.html?search=${encodeURIComponent(query)}`;
        }
    }
    
    performCategorySearch(category) {
        if (window.location.pathname.includes('products.html')) {
            // Update category filter
            const categoryFilter = document.getElementById('categoryFilter');
            if (categoryFilter) {
                categoryFilter.value = category.toLowerCase();
                if (window.app && window.app.filterProducts) {
                    window.app.filterProducts({ category: category.toLowerCase() });
                }
            }
        } else {
            // Redirect to products page with category
            window.location.href = `products.html?category=${encodeURIComponent(category.toLowerCase())}`;
        }
    }
}

// Initialize search autocomplete
document.addEventListener('DOMContentLoaded', () => {
    new SearchAutocomplete();
});

// Add CSS for search suggestions
const searchCSS = `
.search-suggestions {
    position: absolute;
    top: 100%;
    left: 0;
    right: 0;
    background: var(--bg-card);
    border: 1px solid var(--border-color);
    border-radius: var(--radius-lg);
    box-shadow: var(--shadow-lg);
    z-index: var(--z-dropdown);
    max-height: 300px;
    overflow-y: auto;
    margin-top: var(--space-xs);
}

.search-suggestion {
    padding: var(--space-md);
    cursor: pointer;
    transition: background-color var(--transition-fast);
    border-bottom: 1px solid var(--border-color);
}

.search-suggestion:last-child {
    border-bottom: none;
}

.search-suggestion:hover,
.search-suggestion.selected {
    background: var(--bg-hover);
}

.search-suggestion-text {
    color: var(--text-primary);
    font-weight: 500;
    margin-bottom: var(--space-xs);
}

.search-suggestion-text strong {
    color: var(--primary-color);
    font-weight: 700;
}

.search-suggestion-category {
    color: var(--text-muted);
    font-size: var(--font-size-sm);
}

.search-container {
    position: relative;
}

.search-icon {
    position: absolute;
    left: var(--space-md);
    top: 50%;
    transform: translateY(-50%);
    color: var(--text-muted);
    pointer-events: none;
    z-index: 1;
}

.nav-search {
    position: relative;
}

.nav-search .search-icon {
    display: none;
}
`;

// Inject search CSS
const searchStyle = document.createElement('style');
searchStyle.textContent = searchCSS;
document.head.appendChild(searchStyle);