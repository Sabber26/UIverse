/**
 * Toast notification system for UIVerse
 * @module toast
 */

/**
 * @class ToastNotification
 * @description Manages toast notifications with stacking limit
 */
class ToastNotification {
  constructor() {
    /** @type {HTMLElement} */
    this.container = document.getElementById('toastContainer');
    /** @type {Array<HTMLElement>} */
    this.toasts = [];
    /** @type {number} Maximum number of toasts to show at once */
    this.maxToasts = 5;
  }

  /**
   * Show a toast notification
   * @param {string} message - Toast message
   * @param {string} type - Toast type: 'success', 'error', 'warning', 'info'
   * @param {number} duration - Duration in milliseconds
   * @returns {HTMLElement|null} Toast element or null if limit reached
   */
  show(message, type, duration) {
    type = type || 'info';
    duration = duration || 3000;

    // Remove oldest toasts if exceeding limit
    while (this.toasts.length >= this.maxToasts) {
      this.remove(this.toasts[0]);
    }

    var icons = {
      success: '✅',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️'
    };

    var toast = document.createElement('div');
    toast.className = 'toast ' + type;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = '<span aria-hidden="true">' + (icons[type] || icons.info) + '</span>' +
                      '<span>' + sanitizeHTML(message) + '</span>';

    this.container.appendChild(toast);
    this.toasts.push(toast);

    // Auto remove after duration
    var self = this;
    setTimeout(function() {
      self.remove(toast);
    }, duration);

    return toast;
  }

  /**
   * Remove a toast notification
   * @param {HTMLElement} toast - Toast element to remove
   */
  remove(toast) {
    if (!toast || !toast.parentElement) return;

    toast.classList.add('removing');
    
    var self = this;
    setTimeout(function() {
      if (toast.parentElement) {
        toast.remove();
        self.toasts = self.toasts.filter(function(t) {
          return t !== toast;
        });
      }
    }, 300);
  }

  /**
   * Show success toast
   * @param {string} message - Message
   * @param {number} duration - Duration
   * @returns {HTMLElement|null}
   */
  success(message, duration) {
    return this.show(message, 'success', duration);
  }

  /**
   * Show error toast
   * @param {string} message - Message
   * @param {number} duration - Duration
   * @returns {HTMLElement|null}
   */
  error(message, duration) {
    return this.show(message, 'error', duration);
  }

  /**
   * Show warning toast
   * @param {string} message - Message
   * @param {number} duration - Duration
   * @returns {HTMLElement|null}
   */
  warning(message, duration) {
    return this.show(message, 'warning', duration);
  }

  /**
   * Show info toast
   * @param {string} message - Message
   * @param {number} duration - Duration
   * @returns {HTMLElement|null}
   */
  info(message, duration) {
    return this.show(message, 'info', duration);
  }

  /**
   * Clear all toasts
   */
  clearAll() {
    this.toasts.forEach(function(toast) {
      if (toast.parentElement) {
        toast.remove();
      }
    });
    this.toasts = [];
  }
}

// Initialize global toast instance
var toast = new ToastNotification();
window.toast = toast;