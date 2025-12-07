// Lazy Loading for Images
class LazyLoader {
    constructor() {
        this.images = [];
        this.observer = null;
        this.init();
    }

    init() {
        // Check if Intersection Observer is supported
        if ('IntersectionObserver' in window) {
            this.observer = new IntersectionObserver(
                (entries) => this.onIntersection(entries),
                {
                    rootMargin: '50px 0px',
                    threshold: 0.01
                }
            );

            this.observeImages();
        } else {
            // Fallback: load all images immediately
            this.loadAllImages();
        }
    }

    observeImages() {
        // Find all images with data-src attribute
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => {
            this.observer.observe(img);
            this.images.push(img);
        });
    }

    onIntersection(entries) {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                const img = entry.target;
                this.loadImage(img);
                this.observer.unobserve(img);
            }
        });
    }

    loadImage(img) {
        const src = img.getAttribute('data-src');
        if (!src) return;

        // Create a new image to preload
        const tempImg = new Image();
        tempImg.onload = () => {
            img.src = src;
            img.removeAttribute('data-src');
            img.classList.add('loaded');
        };
        tempImg.onerror = () => {
            console.error('Failed to load image:', src);
        };
        tempImg.src = src;
    }

    loadAllImages() {
        const lazyImages = document.querySelectorAll('img[data-src]');
        lazyImages.forEach(img => this.loadImage(img));
    }

    // Method to add new images after dynamic content load
    refresh() {
        if (this.observer) {
            this.observeImages();
        }
    }
}

// Initialize lazy loader when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.lazyLoader = new LazyLoader();
    });
} else {
    window.lazyLoader = new LazyLoader();
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = LazyLoader;
}
