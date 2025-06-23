console.log('utils.js loaded');
// Utility functions for the whole project

window.utils = {
    escapeHtml: function(text) {
        if (typeof text !== 'string') return text;
        const map = {
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            '"': '&quot;',
            "'": '&#039;'
        };
        return text.replace(/[&<>"']/g, m => map[m]);
    },
    getRequiredElement: function(id) {
        const el = document.getElementById(id);
        if (!el) {
            throw new Error(`Element with id '${id}' not found`);
        }
        return el;
    },
    showNotification: function(message, type = 'info') {
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
}; 