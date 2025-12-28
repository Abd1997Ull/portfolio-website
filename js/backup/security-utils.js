/**
 * Security Utilities for XSS Prevention
 * This module provides helper functions to sanitize user input and prevent XSS attacks.
 */

/**
 * Escape HTML special characters to prevent XSS attacks
 * @param {string} text - The text to escape
 * @returns {string} - Escaped HTML-safe text
 */
function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

/**
 * Sanitize URL to prevent javascript: and data: exploits
 * @param {string} url - The URL to sanitize
 * @returns {string} - Safe URL or '#' if dangerous
 */
function sanitizeUrl(url) {
    if (!url || typeof url !== 'string') return '#';
    const trimmed = url.trim().toLowerCase();
    if (trimmed.startsWith('javascript:') ||
        trimmed.startsWith('data:') ||
        trimmed.startsWith('vbscript:')) {
        console.warn('Blocked potentially dangerous URL:', url);
        return '#';
    }
    return url;
}

/**
 * Sanitize an object's string properties recursively
 * @param {Object} obj - The object to sanitize
 * @returns {Object} - Sanitized object
 */
function sanitizeObject(obj) {
    if (typeof obj !== 'object' || obj === null) {
        return typeof obj === 'string' ? escapeHtml(obj) : obj;
    }

    if (Array.isArray(obj)) {
        return obj.map(item => sanitizeObject(item));
    }

    const sanitized = {};
    for (const key in obj) {
        if (Object.prototype.hasOwnProperty.call(obj, key)) {
            sanitized[key] = sanitizeObject(obj[key]);
        }
    }
    return sanitized;
}

// Export for global use
window.SecurityUtils = {
    escapeHtml,
    sanitizeUrl,
    sanitizeObject
};

console.log('✅ Security utilities loaded');
