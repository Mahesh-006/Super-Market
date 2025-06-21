// Performance Optimizations for SuperMart

class PerformanceOptimizer {
    constructor() {
        this.init();
    }
    
    init() {
        this.setupLazyLoading();
        this.setupImageOptimization();
        this.setupCaching();
        this.setupVirtualScrolling();
        this.setupSearchOptimization();
        this.setupDataPagination();
    }
    
    setupLazyLoading() {
        // Intersection Observer for lazy loading images
        const imageObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const img = entry.target;
                    img.src = img.dataset.src;
                    img.classList.remove('lazy');
                    observer.unobserve(img);
                }
            });
        });
        
        // Observe all lazy images
        document.querySelectorAll('img[data-src]').forEach(img => {
            imageObserver.observe(img);
        });
        
        // Setup for dynamically added images
        window.setupLazyImage = (img) => {
            img.classList.add('lazy');
            imageObserver.observe(img);
        };
    }
    
    setupImageOptimization() {
        // Optimize images based on device pixel ratio and screen size
        window.getOptimizedImageUrl = (baseUrl, width = 400, height = 400) => {
            const dpr = window.devicePixelRatio || 1;
            const optimizedWidth = Math.round(width * dpr);
            const optimizedHeight = Math.round(height * dpr);
            
            // For demo purposes, return original URL
            // In production, you'd use a service like Cloudinary or ImageKit
            return `${baseUrl}?w=${optimizedWidth}&h=${optimizedHeight}&fit=crop&auto=format`;
        };
    }
    
    setupCaching() {
        // Intelligent caching system
        const cache = new Map();
        const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
        
        window.cachedFetch = async (key, fetchFunction) => {
            const cached = cache.get(key);
            const now = Date.now();
            
            if (cached && (now - cached.timestamp) < CACHE_DURATION) {
                return cached.data;
            }
            
            const data = await fetchFunction();
            cache.set(key, { data, timestamp: now });
            
            return data;
        };
        
        // Clear expired cache entries periodically
        setInterval(() => {
            const now = Date.now();
            for (const [key, value] of cache.entries()) {
                if ((now - value.timestamp) > CACHE_DURATION) {
                    cache.delete(key);
                }
            }
        }, 60000); // Check every minute
    }
    
    setupVirtualScrolling() {
        // Virtual scrolling for large product lists
        class VirtualScroller {
            constructor(container, itemHeight = 300, buffer = 5) {
                this.container = container;
                this.itemHeight = itemHeight;
                this.buffer = buffer;
                this.items = [];
                this.visibleItems = [];
                this.scrollTop = 0;
                this.containerHeight = 0;
                
                this.init();
            }
            
            init() {
                this.container.style.position = 'relative';
                this.container.style.overflow = 'auto';
                
                this.container.addEventListener('scroll', debounce(() => {
                    this.handleScroll();
                }, 16)); // ~60fps
                
                this.updateContainerHeight();
                window.addEventListener('resize', debounce(() => {
                    this.updateContainerHeight();
                }, 250));
            }
            
            setItems(items) {
                this.items = items;
                this.render();
            }
            
            updateContainerHeight() {
                this.containerHeight = this.container.clientHeight;
                this.render();
            }
            
            handleScroll() {
                this.scrollTop = this.container.scrollTop;
                this.render();
            }
            
            render() {
                const startIndex = Math.max(0, Math.floor(this.scrollTop / this.itemHeight) - this.buffer);
                const endIndex = Math.min(
                    this.items.length - 1,
                    Math.ceil((this.scrollTop + this.containerHeight) / this.itemHeight) + this.buffer
                );
                
                this.visibleItems = this.items.slice(startIndex, endIndex + 1);
                
                // Create virtual container
                const totalHeight = this.items.length * this.itemHeight;
                const offsetY = startIndex * this.itemHeight;
                
                this.container.innerHTML = `
                    <div style="height: ${totalHeight}px; position: relative;">
                        <div style="transform: translateY(${offsetY}px); position: absolute; width: 100%;">
                            ${this.visibleItems.map((item, index) => this.renderItem(item, startIndex + index)).join('')}
                        </div>
                    </div>
                `;
            }
            
            renderItem(item, index) {
                // Override this method to customize item rendering
                return `<div style="height: ${this.itemHeight}px; padding: 10px; border-bottom: 1px solid #eee;">
                    Item ${index}: ${JSON.stringify(item)}
                </div>`;
            }
        }
        
        window.VirtualScroller = VirtualScroller;
    }
    
    setupSearchOptimization() {
        // Optimized search with indexing
        class SearchIndex {
            constructor() {
                this.index = new Map();
                this.products = [];
            }
            
            buildIndex(products) {
                this.products = products;
                this.index.clear();
                
                products.forEach((product, productIndex) => {
                    // Index product name
                    this.addToIndex(product.name.toLowerCase(), productIndex);
                    
                    // Index product description
                    this.addToIndex(product.description.toLowerCase(), productIndex);
                    
                    // Index product category
                    this.addToIndex(product.category.toLowerCase(), productIndex);
                    
                    // Index individual words
                    const words = [
                        ...product.name.toLowerCase().split(' '),
                        ...product.description.toLowerCase().split(' '),
                        product.category.toLowerCase()
                    ];
                    
                    words.forEach(word => {
                        if (word.length > 2) { // Skip very short words
                            this.addToIndex(word, productIndex);
                        }
                    });
                });
            }
            
            addToIndex(term, productIndex) {
                if (!this.index.has(term)) {
                    this.index.set(term, new Set());
                }
                this.index.get(term).add(productIndex);
            }
            
            search(query) {
                if (!query || query.length < 2) return this.products;
                
                const terms = query.toLowerCase().split(' ').filter(term => term.length > 1);
                let resultIndices = null;
                
                terms.forEach(term => {
                    const termResults = new Set();
                    
                    // Exact matches
                    if (this.index.has(term)) {
                        this.index.get(term).forEach(index => termResults.add(index));
                    }
                    
                    // Partial matches
                    for (const [indexedTerm, indices] of this.index.entries()) {
                        if (indexedTerm.includes(term) || term.includes(indexedTerm)) {
                            indices.forEach(index => termResults.add(index));
                        }
                    }
                    
                    if (resultIndices === null) {
                        resultIndices = termResults;
                    } else {
                        // Intersection of results
                        resultIndices = new Set([...resultIndices].filter(x => termResults.has(x)));
                    }
                });
                
                return resultIndices ? 
                    [...resultIndices].map(index => this.products[index]) : 
                    [];
            }
        }
        
        window.searchIndex = new SearchIndex();
        
        // Build index when products are loaded
        window.eventEmitter.on('productsLoaded', (products) => {
            window.searchIndex.buildIndex(products);
        });
    }
    
    setupDataPagination() {
        // Efficient data pagination
        class DataPaginator {
            constructor(data, pageSize = 20) {
                this.data = data;
                this.pageSize = pageSize;
                this.currentPage = 1;
                this.totalPages = Math.ceil(data.length / pageSize);
            }
            
            getPage(pageNumber = this.currentPage) {
                const startIndex = (pageNumber - 1) * this.pageSize;
                const endIndex = startIndex + this.pageSize;
                
                return {
                    data: this.data.slice(startIndex, endIndex),
                    currentPage: pageNumber,
                    totalPages: this.totalPages,
                    totalItems: this.data.length,
                    hasNext: pageNumber < this.totalPages,
                    hasPrev: pageNumber > 1
                };
            }
            
            nextPage() {
                if (this.currentPage < this.totalPages) {
                    this.currentPage++;
                    return this.getPage();
                }
                return null;
            }
            
            prevPage() {
                if (this.currentPage > 1) {
                    this.currentPage--;
                    return this.getPage();
                }
                return null;
            }
            
            goToPage(pageNumber) {
                if (pageNumber >= 1 && pageNumber <= this.totalPages) {
                    this.currentPage = pageNumber;
                    return this.getPage();
                }
                return null;
            }
            
            updateData(newData) {
                this.data = newData;
                this.totalPages = Math.ceil(newData.length / this.pageSize);
                this.currentPage = 1;
                return this.getPage();
            }
        }
        
        window.DataPaginator = DataPaginator;
    }
    
    // Performance monitoring
    setupPerformanceMonitoring() {
        const performanceMetrics = {
            pageLoadTime: 0,
            searchTime: 0,
            renderTime: 0,
            memoryUsage: 0
        };
        
        // Measure page load time
        window.addEventListener('load', () => {
            performanceMetrics.pageLoadTime = performance.now();
        });
        
        // Measure search performance
        const originalSearch = window.app?.searchProducts;
        if (originalSearch) {
            window.app.searchProducts = function(query) {
                const startTime = performance.now();
                const result = originalSearch.call(this, query);
                performanceMetrics.searchTime = performance.now() - startTime;
                return result;
            };
        }
        
        // Monitor memory usage
        if ('memory' in performance) {
            setInterval(() => {
                performanceMetrics.memoryUsage = performance.memory.usedJSHeapSize;
            }, 10000); // Check every 10 seconds
        }
        
        window.getPerformanceMetrics = () => performanceMetrics;
    }
}

// Initialize performance optimizations
document.addEventListener('DOMContentLoaded', () => {
    new PerformanceOptimizer();
});

// Add CSS for performance optimizations
const performanceCSS = `
/* Lazy loading images */
.lazy {
    opacity: 0;
    transition: opacity 0.3s;
}

.lazy.loaded {
    opacity: 1;
}

/* Skeleton loading for better perceived performance */
.skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
}

@keyframes loading {
    0% {
        background-position: 200% 0;
    }
    100% {
        background-position: -200% 0;
    }
}

/* Optimized scrolling */
.smooth-scroll {
    scroll-behavior: smooth;
}

/* GPU acceleration for animations */
.gpu-accelerated {
    transform: translateZ(0);
    will-change: transform;
}

/* Reduce motion for accessibility */
@media (prefers-reduced-motion: reduce) {
    * {
        animation-duration: 0.01ms !important;
        animation-iteration-count: 1 !important;
        transition-duration: 0.01ms !important;
    }
}
`;

// Inject performance CSS
const performanceStyle = document.createElement('style');
performanceStyle.textContent = performanceCSS;
document.head.appendChild(performanceStyle);