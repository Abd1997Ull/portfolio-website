// Pagination for Portfolio Projects

class Pagination {
    constructor(options) {
        this.container = options.container;
        this.itemsPerPage = options.itemsPerPage || 6;
        this.currentPage = 1;
        this.allItems = [];
        this.filteredItems = [];
        this.onPageChange = options.onPageChange || null;
    }

    setItems(items) {
        this.allItems = items;
        this.filteredItems = items;
        this.currentPage = 1;
        this.render();
    }

    filterItems(filterFn) {
        this.filteredItems = this.allItems.filter(filterFn);
        this.currentPage = 1;
        this.render();
    }

    getTotalPages() {
        return Math.ceil(this.filteredItems.length / this.itemsPerPage);
    }

    getCurrentPageItems() {
        const start = (this.currentPage - 1) * this.itemsPerPage;
        const end = start + this.itemsPerPage;
        return this.filteredItems.slice(start, end);
    }

    goToPage(page) {
        const totalPages = this.getTotalPages();
        if (page < 1 || page > totalPages) return;

        this.currentPage = page;

        // Scroll to portfolio section
        const portfolioSection = document.getElementById('portfolio');
        if (portfolioSection) {
            portfolioSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }

        // Update URL with page number
        this.updateURL();

        // Trigger callback
        if (this.onPageChange) {
            this.onPageChange(this.getCurrentPageItems(), this.currentPage);
        }

        this.render();
    }

    nextPage() {
        this.goToPage(this.currentPage + 1);
    }

    prevPage() {
        this.goToPage(this.currentPage - 1);
    }

    updateURL() {
        const url = new URL(window.location);
        url.searchParams.set('page', this.currentPage);
        window.history.pushState({}, '', url);
    }

    loadPageFromURL() {
        const url = new URL(window.location);
        const page = parseInt(url.searchParams.get('page')) || 1;
        this.goToPage(page);
    }

    render() {
        if (!this.container) return;

        const totalPages = this.getTotalPages();
        if (totalPages <= 1) {
            this.container.innerHTML = '';
            return;
        }

        let html = '<div class="pagination-controls">';

        // Previous button
        html += `
            <button class="pagination-btn ${this.currentPage === 1 ? 'disabled' : ''}" 
                    onclick="portfolioPagination.prevPage()" 
                    ${this.currentPage === 1 ? 'disabled' : ''}>
                <i class="fas fa-chevron-left"></i>
                <span data-i18n="previous">السابق</span>
            </button>
        `;

        // Page numbers
        html += '<div class="pagination-numbers">';

        const maxPagesToShow = 5;
        let startPage = Math.max(1, this.current Page - Math.floor(maxPagesToShow / 2));
        let endPage = Math.min(totalPages, startPage + maxPagesToShow - 1);

        if (endPage - startPage < maxPagesToShow - 1) {
            startPage = Math.max(1, endPage - maxPagesToShow + 1);
        }

        // First page and ellipsis
        if (startPage > 1) {
            html += `<button class="pagination-number" onclick="portfolioPagination.goToPage(1)">1</button>`;
            if (startPage > 2) {
                html += '<span class="pagination-ellipsis">...</span>';
            }
        }

        // Page numbers
        for (let i = startPage; i <= endPage; i++) {
            html += `
                <button class="pagination-number ${i === this.currentPage ? 'active' : ''}" 
                        onclick="portfolioPagination.goToPage(${i})">
                    ${i}
                </button>
            `;
        }

        // Last page and ellipsis
        if (endPage < totalPages) {
            if (endPage < totalPages - 1) {
                html += '<span class="pagination-ellipsis">...</span>';
            }
            html += `<button class="pagination-number" onclick="portfolioPagination.goToPage(${totalPages})">${totalPages}</button>`;
        }

        html += '</div>';

        // Next button
        html += `
            <button class="pagination-btn ${this.currentPage === totalPages ? 'disabled' : ''}" 
                    onclick="portfolioPagination.nextPage()" 
                    ${this.currentPage === totalPages ? 'disabled' : ''}>
                <span data-i18n="next">التالي</span>
                <i class="fas fa-chevron-right"></i>
            </button>
        `;

        html += '</div>';

        // Items info
        const start = (this.currentPage - 1) * this.itemsPerPage + 1;
        const end = Math.min(this.currentPage * this.itemsPerPage, this.filteredItems.length);
        const lang = localStorage.getItem('lang') || 'ar';

        html += `
            <div class="pagination-info">
                ${lang === 'ar'
                ? `عرض ${start} - ${end} من ${this.filteredItems.length} مشروع`
                : `Showing ${start} - ${end} of ${this.filteredItems.length} projects`
            }
            </div>
        `;

        this.container.innerHTML = html;

        // Update translations
        if (window.updateTranslations) {
            window.updateTranslations();
        }
    }
}

// Export for use
if (typeof module !== 'undefined' && module.exports) {
    module.exports = Pagination;
}
