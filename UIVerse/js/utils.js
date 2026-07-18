/**
 * Utility functions for UIVerse application
 * @module utils
 */

/**
 * StorageHelper - Safe localStorage operations with error handling
 */
class StorageHelper {
  /**
   * Safely get item from localStorage
   * @param {string} key - Storage key
   * @param {*} defaultValue - Default value if key doesn't exist or on error
   * @returns {*} Parsed value or default
   */
  static get(key, defaultValue = null) {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    } catch (error) {
      console.warn(`StorageHelper: Failed to get "${key}" from localStorage`, error);
      return defaultValue;
    }
  }

  /**
   * Safely set item in localStorage
   * @param {string} key - Storage key
   * @param {*} value - Value to store (will be JSON stringified)
   * @returns {boolean} Success status
   */
  static set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (error) {
      if (error.name === 'QuotaExceededError') {
        console.warn(`StorageHelper: Quota exceeded for "${key}"`, error);
        // Optionally notify user
        if (typeof toast !== 'undefined' && toast.warning) {
          toast.warning('Storage full! Some data may not be saved.', 4000);
        }
      } else {
        console.warn(`StorageHelper: Failed to set "${key}" in localStorage`, error);
      }
      return false;
    }
  }

  /**
   * Safely remove item from localStorage
   * @param {string} key - Storage key
   * @returns {boolean} Success status
   */
  static remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`StorageHelper: Failed to remove "${key}" from localStorage`, error);
      return false;
    }
  }

  /**
   * Check if localStorage is available
   * @returns {boolean} Availability status
   */
  static isAvailable() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }
}

/**
 * Debounce function to limit execution frequency
 * @param {Function} func - Function to debounce
 * @param {number} wait - Wait time in milliseconds
 * @returns {Function} Debounced function
 */
function debounce(func, wait = 100) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Sanitize HTML string to prevent XSS
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
function sanitizeHTML(str) {
  if (typeof str !== 'string') return '';
  const div = document.createElement('div');
  div.textContent = str;
  return div.innerHTML;
}

/**
 * Sanitize URL string for safe href/src attributes
 * Only allows http:, https:, mailto:, tel:, and relative URLs
 * @param {string} url - URL to sanitize
 * @returns {string} Sanitized URL or empty string if invalid
 */
function sanitizeURL(url) {
  if (typeof url !== 'string') return '';
  
  // Allow relative URLs (starting with /, ./, ../, or #)
  if (/^(\/|\.{0,2}\/|#)/.test(url)) return url;
  
  try {
    const parsed = new URL(url);
    // Only allow safe protocols
    if (['http:', 'https:', 'mailto:', 'tel:'].includes(parsed.protocol)) {
      return url;
    }
    return '';
  } catch {
    return '';
  }
}

/**
 * Validate URL format (for general validation, not sanitization)
 * @param {string} url - URL to validate
 * @returns {boolean} Is valid URL
 */
function isValidURL(url) {
  if (typeof url !== 'string') return false;
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Generate unique ID
 * @returns {string} Unique ID
 */
function generateId() {
  return 'id-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(36);
}

/**
 * Check if element is in viewport
 * @param {Element} element - DOM element
 * @returns {boolean} Is in viewport
 */
function isInViewport(element) {
  const rect = element.getBoundingClientRect();
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  );
}

/**
 * Trap focus within an element (for modals)
 * @param {Element} element - Container element
 */
function trapFocus(element) {
  const focusableElements = element.querySelectorAll(
    'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
  );
  
  if (focusableElements.length === 0) return;
  
  const firstFocusable = focusableElements[0];
  const lastFocusable = focusableElements[focusableElements.length - 1];

  element.addEventListener('keydown', function(e) {
    if (e.key === 'Tab') {
      if (e.shiftKey) {
        if (document.activeElement === firstFocusable) {
          e.preventDefault();
          lastFocusable.focus();
        }
      } else {
        if (document.activeElement === lastFocusable) {
          e.preventDefault();
          firstFocusable.focus();
        }
      }
    }
  });

  firstFocusable.focus();
}

/**
 * Format number with commas
 * @param {number} num - Number to format
 * @returns {string} Formatted number
 */
function formatNumber(num) {
  if (typeof num !== 'number') return '';
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

/**
 * Get CSS custom property value
 * @param {string} property - CSS custom property name (with --)
 * @returns {string} Property value
 */
function getCSSVariable(property) {
  return getComputedStyle(document.documentElement).getPropertyValue(property).trim();
}

/**
 * Copy text to clipboard
 * @param {string} text - Text to copy
 * @returns {Promise<boolean>} Success status
 */
function copyToClipboard(text) {
  return new Promise((resolve) => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).then(() => {
        resolve(true);
      }).catch(() => {
        resolve(false);
      });
    } else {
      // Fallback for older browsers
      try {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.left = '-9999px';
        textarea.style.top = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        const success = document.execCommand('copy');
        document.body.removeChild(textarea);
        resolve(success);
      } catch {
        resolve(false);
      }
    }
  });
}

/**
 * Performance monitoring helper
 */
const PerformanceMonitor = {
  marks: {},

  /**
   * Start timing
   * @param {string} name - Mark name
   */
  start(name) {
    this.marks[name] = performance.now();
  },

  /**
   * End timing and get duration
   * @param {string} name - Mark name
   * @returns {number} Duration in milliseconds
   */
  end(name) {
    if (this.marks[name]) {
      const duration = performance.now() - this.marks[name];
      delete this.marks[name];
      return duration;
    }
    return 0;
  },

  /**
   * Log performance metric
   * @param {string} metric - Metric name
   * @param {number} value - Metric value
   */
  log(metric, value) {
    if (window.console && window.console.log) {
      console.log(`[Performance] ${metric}: ${value.toFixed(2)}ms`);
    }
  }
};

/**
 * Error logging utility
 */
const ErrorLogger = {
  errors: [],

  /**
   * Log an error
   * @param {Error|string} error - Error to log
   * @param {string} context - Error context
   */
  log(error, context = 'General') {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      context,
      message: error.message || error,
      stack: error.stack || null
    };
    
    this.errors.push(errorEntry);
    
    if (window.console && window.console.error) {
      console.error(`[${context}]`, error);
    }

    // Keep only last 50 errors
    if (this.errors.length > 50) {
      this.errors.shift();
    }
  },

  /**
   * Get all logged errors
   * @returns {Array} Error entries
   */
  getAll() {
    return this.errors;
  },

  /**
   * Clear all errors
   */
  clear() {
    this.errors = [];
  }
};

// Export for use in other modules
window.StorageHelper = StorageHelper;
window.debounce = debounce;
window.sanitizeHTML = sanitizeHTML;
window.sanitizeURL = sanitizeURL;
window.isValidURL = isValidURL;
window.generateId = generateId;
window.isInViewport = isInViewport;
window.trapFocus = trapFocus;
window.formatNumber = formatNumber;
window.getCSSVariable = getCSSVariable;
window.copyToClipboard = copyToClipboard;
window.PerformanceMonitor = PerformanceMonitor;
window.ErrorLogger = ErrorLogger;