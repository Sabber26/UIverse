/**
 * main.js - Navigation, scroll, theme, and global functionality
 * @module main
 */

document.addEventListener('DOMContentLoaded', function() {
  console.log('[Main] DOM ready, initializing...');
  PerformanceMonitor.start('page-init');
  
  // Hide loading spinner
  const spinner = document.getElementById('loadingSpinner');
  if (spinner) {
    setTimeout(() => {
      spinner.style.opacity = '0';
      setTimeout(() => spinner.remove(), 500);
    }, 300);
  }
  
  // Initialize modules with error boundaries
  try { initTheme(); } catch(e) { console.error('Theme init error:', e); }
  try { initMobileMenu(); } catch(e) { console.error('Mobile menu init error:', e); }
  try { initSmoothScroll(); } catch(e) { console.error('Smooth scroll init error:', e); }
  try { initScrollSpy(); } catch(e) { console.error('Scroll spy init error:', e); }
  try { initScrollToTop(); } catch(e) { console.error('Scroll to top init error:', e); }
  try { initFadeInSections(); } catch(e) { console.error('Fade in init error:', e); }
  try { initCounters(); } catch(e) { console.error('Counters init error:', e); }
  try { initKeyboardNavigation(); } catch(e) { console.error('Keyboard nav init error:', e); }
  try { initOfflineIndicator(); } catch(e) { console.error('Offline indicator init error:', e); }
  try { setupEventDelegation(); } catch(e) { console.error('Event delegation init error:', e); }
  
  var initTime = PerformanceMonitor.end('page-init');
  PerformanceMonitor.log('Page Initialization', initTime);
  console.log('[Main] Initialization complete');
});

/**
 * Initialize theme toggle with localStorage persistence
 * Fixes dark mode by checking saved preference AND system preference
 */
function initTheme() {
  console.log('[Main] Initializing theme...');
  var themeToggle = document.getElementById('themeToggle');
  var themeIcon = document.getElementById('themeIcon');
  var html = document.documentElement;

  if (!themeToggle) {
    console.error('[Main] Theme toggle button not found!');
    return;
  }

  // Check saved theme or system preference
  var savedTheme = StorageHelper.get('theme');
  var prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  
  console.log('[Main] Saved theme:', savedTheme, 'Prefers dark:', prefersDark);
  
  if (savedTheme === 'dark' || (!savedTheme && prefersDark)) {
    html.classList.add('dark');
    html.classList.remove('light');
    themeIcon.textContent = '☀️';
    console.log('[Main] Theme set to dark');
  } else {
    html.classList.remove('dark');
    html.classList.add('light');
    themeIcon.textContent = '🌙';
    console.log('[Main] Theme set to light');
  }

  themeToggle.addEventListener('click', function() {
    console.log('[Main] Theme toggle clicked');
    html.classList.toggle('dark');
    var isDark = html.classList.contains('dark');
    var success = StorageHelper.set('theme', isDark ? 'dark' : 'light');
    themeIcon.textContent = isDark ? '☀️' : '🌙';
    console.log('[Main] Theme now:', isDark ? 'dark' : 'light');
  });

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', function(e) {
    if (!StorageHelper.get('theme')) {
      if (e.matches) {
        html.classList.add('dark');
        html.classList.remove('light');
        themeIcon.textContent = '☀️';
      } else {
        html.classList.remove('dark');
        html.classList.add('light');
        themeIcon.textContent = '🌙';
      }
    }
  });
}

/**
 * Initialize mobile menu with accessibility and Escape key support
 */
function initMobileMenu() {
  var menuBtn = document.getElementById('mobileMenuBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  var menuIconOpen = document.getElementById('menuIconOpen');
  var menuIconClose = document.getElementById('menuIconClose');

  if (!menuBtn || !mobileMenu) return;

  function closeMenu() {
    mobileMenu.classList.add('hidden');
    menuIconOpen.classList.remove('hidden');
    menuIconClose.classList.add('hidden');
    menuBtn.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    menuBtn.focus();
  }

  function openMenu() {
    mobileMenu.classList.remove('hidden');
    menuIconOpen.classList.add('hidden');
    menuIconClose.classList.remove('hidden');
    menuBtn.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
    // Focus first link in mobile menu
    var firstLink = mobileMenu.querySelector('a');
    if (firstLink) firstLink.focus();
  }

  menuBtn.addEventListener('click', function() {
    var isOpen = menuBtn.getAttribute('aria-expanded') === 'true';
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  });

  // Close menu on link click using event delegation
  mobileMenu.addEventListener('click', function(e) {
    if (e.target.classList.contains('mobile-nav-link') || e.target.closest('.mobile-nav-link')) {
      closeMenu();
    }
  });

  // Add Escape key support to close mobile menu
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
      closeMenu();
    }
  });
}

/**
 * Initialize smooth scrolling for anchor links
 */
function initSmoothScroll() {
  document.addEventListener('click', function(e) {
    var anchor = e.target.closest('a[href^="#"]');
    if (anchor) {
      var targetId = anchor.getAttribute('href').substring(1);
      var target = document.getElementById(targetId);
      
      if (target) {
        e.preventDefault();
        target.scrollIntoView({
          behavior: 'smooth',
          block: 'start'
        });
        
        // Update URL hash without jumping
        history.pushState(null, null, '#' + targetId);
      }
    }
  });
}

/**
 * Initialize scroll spy for active navigation link
 */
function initScrollSpy() {
  var sections = document.querySelectorAll('section[id]');
  var navLinks = document.querySelectorAll('.nav-link');

  var observerOptions = {
    root: null,
    rootMargin: '-50% 0px -50% 0px',
    threshold: 0
  };

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var id = entry.target.getAttribute('id');
        navLinks.forEach(function(link) {
          link.classList.remove('text-purple-600', 'dark:text-purple-400');
          if (link.getAttribute('href') === '#' + id) {
            link.classList.add('text-purple-600', 'dark:text-purple-400');
          }
        });
      }
    });
  }, observerOptions);

  sections.forEach(function(section) {
    observer.observe(section);
  });
}

/**
 * Initialize scroll to top button
 */
function initScrollToTop() {
  var scrollBtn = document.getElementById('scrollToTop');

  var handleScroll = debounce(function() {
    if (window.scrollY > 500) {
      scrollBtn.classList.add('visible');
    } else {
      scrollBtn.classList.remove('visible');
    }
  }, 50);

  window.addEventListener('scroll', handleScroll, { passive: true });
  
  scrollBtn.addEventListener('click', function() {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  });
}

/**
 * Initialize fade-in animations on scroll
 */
function initFadeInSections() {
  var sections = document.querySelectorAll('.fade-in-section');

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        entry.target.style.opacity = '1';
        entry.target.style.transform = 'translateY(0)';
        observer.unobserve(entry.target);
      }
    });
  }, {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  });

  sections.forEach(function(section) {
    section.style.opacity = '0';
    section.style.transform = 'translateY(20px)';
    section.style.transition = 'opacity 0.6s ease-out, transform 0.6s ease-out';
    observer.observe(section);
  });
}

/**
 * Initialize counter animations
 */
function initCounters() {
  var counters = document.querySelectorAll('.counter');

  var observer = new IntersectionObserver(function(entries) {
    entries.forEach(function(entry) {
      if (entry.isIntersecting) {
        var counter = entry.target;
        var target = parseInt(counter.getAttribute('data-target'));
        var duration = 2000;
        var step = target / (duration / 16);
        var current = 0;

        function updateCounter() {
          current += step;
          if (current < target) {
            counter.textContent = Math.ceil(current);
            requestAnimationFrame(updateCounter);
          } else {
            counter.textContent = target;
          }
        }

        updateCounter();
        observer.unobserve(counter);
      }
    });
  }, {
    threshold: 0.5
  });

  counters.forEach(function(counter) {
    observer.observe(counter);
  });
}

/**
 * Initialize keyboard navigation enhancements
 */
function initKeyboardNavigation() {
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      var target = e.target.closest('[role="button"]');
      if (target && target.tagName !== 'BUTTON' && target.tagName !== 'A') {
        e.preventDefault();
        target.click();
      }
    }
  });
}

/**
 * Initialize offline/online indicator
 */
function initOfflineIndicator() {
  var indicator = document.getElementById('offlineIndicator');

  window.addEventListener('online', function() {
    indicator.classList.remove('visible');
  });

  window.addEventListener('offline', function() {
    indicator.classList.add('visible');
  });

  if (!navigator.onLine) {
    indicator.classList.add('visible');
  }
}

/**
 * Setup event delegation for common patterns
 */
function setupEventDelegation() {
  document.addEventListener('click', function(e) {
    var link = e.target.closest('a[target="_blank"]');
    if (link) {
      // Only validate if it has an href
      if (link.href && !isValidURL(link.href)) {
        e.preventDefault();
        console.warn('Blocked invalid external link:', link.href);
      }
    }
  });
}
