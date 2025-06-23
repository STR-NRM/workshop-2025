// Utility functions for the whole project

/**
 * Escapes HTML special characters in a string to prevent XSS.
 * @param {string} text
 * @returns {string}
 */
export function escapeHtml(text) {
    if (typeof text !== 'string') return text;
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * Safely gets an element by ID. Throws an error if not found.
 * @param {string} id
 * @returns {HTMLElement}
 */
export function getRequiredElement(id) {
    const el = document.getElementById(id);
    if (!el) {
        throw new Error(`Element with id '${id}' not found`);
    }
    return el;
}

/**
 * Shows a non-blocking notification message.
 * @param {string} message
 * @param {string} type 'success' | 'error' | 'info'
 */
export function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.textContent = message;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: ${type === 'error' ? '#e53e3e' : type === 'success' ? '#38a169' : 'var(--primary, #6366f1)'};
        color: white;
        padding: 16px 24px;
        border-radius: 8px;
        box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        z-index: 10000;
        font-size: 1rem;
        animation: slideIn 0.3s ease-out;
    `;
    document.body.appendChild(notification);
    setTimeout(() => notification.remove(), 3000);
} 