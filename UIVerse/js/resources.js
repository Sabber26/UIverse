/**
 * resources.js - Filterable resource library with search and bookmarks
 * @module resources
 */

// Global resources data - will be populated from JSON
let resourcesData = [];

document.addEventListener('DOMContentLoaded', () => {
  loadResourcesData();
});

/**
 * Load resources data from JSON file with fallback
 */
async function loadResourcesData() {
  PerformanceMonitor.start('resources-load');
  
  try {
    const response = await fetch('data/resources.json');
    if (!response.ok) throw new Error('Failed to fetch resources data');
    resourcesData = await response.json();
    
    const loadTime = PerformanceMonitor.end('resources-load');
    PerformanceMonitor.log('Resources Data Load', loadTime);
  } catch (error) {
    ErrorLogger.log(error, 'Resources Load');
    console.warn('Using fallback resources data');
    resourcesData = getFallbackResourcesData();
    
    const loadTime = PerformanceMonitor.end('resources-load');
    PerformanceMonitor.log('Resources Fallback Load', loadTime);
  }
  
  // Now render the resources
  renderResources();
  initFilters();
  initSearch();
}

/**
 * Fallback resources data if JSON fetch fails
 * @returns {Array} Resources data array
 */
function getFallbackResourcesData() {
  return [
    {
      id: 'nng',
      title: 'Nielsen Norman Group',
      description: 'World leaders in research-based user experience. Articles, reports, and training on UX best practices.',
      category: 'articles',
      url: 'https://www.nngroup.com/articles/',
      badge: 'Articles',
      icon: '📄'
    },
    {
      id: 'smashing',
      title: 'Smashing Magazine',
      description: 'High-quality articles on web design, UX, and front-end development.',
      category: 'articles',
      url: 'https://www.smashingmagazine.com/',
      badge: 'Articles',
      icon: '📄'
    },
    {
      id: 'figma-yt',
      title: 'Figma YouTube Channel',
      description: 'Official tutorials, design tips, and community showcases from the Figma team.',
      category: 'videos',
      url: 'https://www.youtube.com/@Figma',
      badge: 'Videos',
      icon: '🎥'
    },
    {
      id: 'flux',
      title: 'Flux Academy',
      description: 'Web design tutorials and career advice for aspiring designers on YouTube.',
      category: 'videos',
      url: 'https://www.youtube.com/@FluxAcademy',
      badge: 'Videos',
      icon: '🎥'
    },
    {
      id: 'dmmt',
      title: "Don't Make Me Think",
      description: 'A classic book on web usability by Steve Krug. Essential reading for UX designers.',
      category: 'books',
      url: 'https://sensible.com/dont-make-me-think/',
      badge: 'Books',
      icon: '📚'
    },
    {
      id: 'doet',
      title: 'The Design of Everyday Things',
      description: "Don Norman's masterpiece on the principles of user-centered design.",
      category: 'books',
      url: 'https://www.nngroup.com/books/design-everyday-things/',
      badge: 'Books',
      icon: '📚'
    },
    {
      id: 'figma',
      title: 'Figma',
      description: 'The industry-standard collaborative design tool. Free for individuals.',
      category: 'tools',
      url: 'https://www.figma.com/',
      badge: 'Tools',
      icon: '🛠️'
    },
    {
      id: 'coolors',
      title: 'Coolors',
      description: 'Generate beautiful color palettes for your design projects instantly.',
      category: 'tools',
      url: 'https://coolors.co/',
      badge: 'Tools',
      icon: '🛠️'
    },
    {
      id: 'designer-hangout',
      title: 'Designer Hangout',
      description: 'A Slack community with 20,000+ UX designers sharing knowledge and opportunities.',
      category: 'communities',
      url: 'https://www.designerhangout.co/',
      badge: 'Communities',
      icon: '👥'
    },
    {
      id: 'reddit-ux',
      title: 'r/userexperience',
      description: "Reddit's largest UX community. Discussions, portfolio reviews, and industry news.",
      category: 'communities',
      url: 'https://www.reddit.com/r/userexperience/',
      badge: 'Communities',
      icon: '👥'
    }
  ];
}

let currentFilter = 'all';
let currentSearch = '';

/**
 * Get saved/bookmarked resource IDs from localStorage
 * @returns {Array} Array of saved resource IDs
 */
function getSavedResources() {
  return StorageHelper.get('savedResources', []);
}

/**
 * Toggle save status of a resource
 * @param {string} resourceId - Resource ID
 * @returns {boolean} New saved status
 */
function toggleSaveResource(resourceId) {
  const saved = getSavedResources();
  const index = saved.indexOf(resourceId);
  
  let newSaved;
  if (index > -1) {
    saved.splice(index, 1);
    newSaved = false;
  } else {
    saved.push(resourceId);
    newSaved = true;
  }
  
  StorageHelper.set('savedResources', saved);
  return newSaved;
}

/**
 * Check if a resource is saved
 * @param {string} resourceId - Resource ID
 * @returns {boolean} Is saved
 */
function isResourceSaved(resourceId) {
  return getSavedResources().includes(resourceId);
}

/**
 * Search resources by query
 * @param {string} query - Search query
 * @returns {Array} Filtered resources
 */
function searchResources(query) {
  if (!query || query.trim() === '') return resourcesData;
  
  const lower = query.toLowerCase().trim();
  return resourcesData.filter(r => 
    r.title.toLowerCase().includes(lower) || 
    r.description.toLowerCase().includes(lower) ||
    r.badge.toLowerCase().includes(lower)
  );
}

/**
 * Get filtered resources based on category and search
 * @returns {Array} Combined filtered resources
 */
function getFilteredResources() {
  let result = resourcesData;
  
  // Apply saved filter first
  if (currentFilter === 'saved') {
    const saved = getSavedResources();
    result = result.filter(r => saved.includes(r.id));
  }
  
  // Apply search filter
  if (currentSearch) {
    result = searchResources(currentSearch);
    // If also filtering by saved, intersect
    if (currentFilter === 'saved') {
      const saved = getSavedResources();
      result = result.filter(r => saved.includes(r.id));
    }
  }
  
  // Apply category filter (if not saved)
  if (currentFilter !== 'all' && currentFilter !== 'saved') {
    result = result.filter(resource => resource.category === currentFilter);
  }
  
  return result;
}

/**
 * Render resource cards
 * @param {string} filter - Category filter (default: 'all')
 * @param {string} searchQuery - Search query (default: '')
 */
function renderResources(filter = 'all', searchQuery = '') {
  const grid = document.getElementById('resourcesGrid');
  const noResults = document.getElementById('noResults');
  
  if (!grid) return;

  PerformanceMonitor.start('resources-render');

  // Show skeleton loader
  grid.innerHTML = Array(6).fill(0).map(() => `
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6">
      <div class="skeleton h-4 w-20 mb-3"></div>
      <div class="skeleton h-6 w-3/4 mb-2"></div>
      <div class="skeleton h-4 w-full mb-1"></div>
      <div class="skeleton h-4 w-5/6 mb-4"></div>
      <div class="skeleton h-4 w-24"></div>
    </div>
  `).join('');

  // Simulate loading for smooth transition
  setTimeout(() => {
    const filteredResources = getFilteredResources();
    
    if (filteredResources.length === 0) {
      grid.innerHTML = '';
      if (noResults) {
        noResults.classList.remove('hidden');
        const noResultsText = noResults.querySelector('p:last-child');
        if (noResultsText) {
          if (currentFilter === 'saved') {
            noResultsText.textContent = 'No saved resources yet. Click the star icon on any resource to save it!';
          } else if (currentSearch) {
            noResultsText.textContent = `No resources found for "${sanitizeHTML(currentSearch)}". Try a different search term.`;
          } else {
            noResultsText.textContent = 'No resources found in this category.';
          }
        }
      }
      return;
    }
    
    if (noResults) noResults.classList.add('hidden');
    
    grid.innerHTML = filteredResources.map(resource => {
      const saved = isResourceSaved(resource.id);
      return `
      <div class="resource-card bg-white dark:bg-gray-800 rounded-2xl shadow-md p-6 hover:shadow-xl transition-all animate-fade-in" data-resource-id="${resource.id}">
        <div class="flex justify-between items-start mb-3">
          <span class="inline-block px-3 py-1 rounded-full text-xs font-medium badge-${resource.category}">
            ${sanitizeHTML(resource.badge)}
          </span>
          <button class="save-btn p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors focus:ring-2 focus:ring-purple-500 focus:ring-offset-2 min-w-[36px] min-h-[36px] flex items-center justify-center"
                  aria-label="${saved ? 'Remove from saved' : 'Save resource'}"
                  aria-pressed="${saved}"
                  data-resource-id="${resource.id}">
            <span class="text-xl ${saved ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'} transition-colors" aria-hidden="true">
              ${saved ? '★' : '☆'}
            </span>
          </button>
        </div>
        <h3 class="text-lg font-bold mb-2">${sanitizeHTML(resource.title)}</h3>
        <p class="text-gray-600 dark:text-gray-300 text-sm mb-4">${sanitizeHTML(resource.description)}</p>
        <a href="${sanitizeURL(resource.url)}" 
           target="_blank" 
           rel="noopener noreferrer"
           class="inline-flex items-center px-4 py-2 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 rounded-lg hover:bg-purple-100 dark:hover:bg-purple-900/30 font-medium transition-all min-h-[44px] focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
           aria-label="Visit ${sanitizeHTML(resource.title)} (opens in new tab)">
          <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"></path>
          </svg>
          Visit Resource
        </a>
      </div>
    `}).join('');

    // Setup save button events
    setupSaveButtons();

    const renderTime = PerformanceMonitor.end('resources-render');
    PerformanceMonitor.log('Resources Render', renderTime);
  }, 300);
}

/**
 * Setup save button click handlers
 */
function setupSaveButtons() {
  const grid = document.getElementById('resourcesGrid');
  if (!grid) return;

  grid.addEventListener('click', (e) => {
    const saveBtn = e.target.closest('.save-btn');
    if (!saveBtn) return;

    e.preventDefault();
    e.stopPropagation();

    const resourceId = saveBtn.getAttribute('data-resource-id');
    const newSaved = toggleSaveResource(resourceId);
    
    // Update button appearance
    const starSpan = saveBtn.querySelector('span');
    if (starSpan) {
      starSpan.textContent = newSaved ? '★' : '☆';
      starSpan.className = `text-xl ${newSaved ? 'text-yellow-500' : 'text-gray-300 dark:text-gray-600'} transition-colors`;
    }
    
    saveBtn.setAttribute('aria-pressed', newSaved);
    saveBtn.setAttribute('aria-label', newSaved ? 'Remove from saved' : 'Save resource');
    
    // If viewing saved filter, re-render to remove unsaved item
    if (currentFilter === 'saved') {
      renderResources(currentFilter, currentSearch);
    }
  });
}

/**
 * Initialize search functionality
 */
function initSearch() {
  const searchInput = document.getElementById('resourceSearch');
  const clearBtn = document.getElementById('clearSearch');
  
  if (!searchInput) return;

  const debouncedSearch = debounce((value) => {
    currentSearch = value;
    renderResources(currentFilter, currentSearch);
    
    if (clearBtn) {
      clearBtn.classList.toggle('hidden', !value);
    }
    
    const filtered = getFilteredResources();
    const announcement = value 
      ? `Found ${filtered.length} resource${filtered.length !== 1 ? 's' : ''} for "${value}"`
      : 'Search cleared';
    
    announceToScreenReader(announcement);
  }, 300);

  searchInput.addEventListener('input', (e) => {
    debouncedSearch(e.target.value);
  });

  searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      searchInput.value = '';
      currentSearch = '';
      renderResources(currentFilter, '');
      if (clearBtn) clearBtn.classList.add('hidden');
      searchInput.blur();
      announceToScreenReader('Search cleared');
    }
  });

  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      searchInput.value = '';
      currentSearch = '';
      renderResources(currentFilter, '');
      clearBtn.classList.add('hidden');
      searchInput.focus();
      announceToScreenReader('Search cleared');
    });
  }
}

/**
 * Announce message to screen readers
 * @param {string} message - Message to announce
 */
function announceToScreenReader(message) {
  const ariaLive = document.createElement('div');
  ariaLive.setAttribute('aria-live', 'polite');
  ariaLive.setAttribute('aria-atomic', 'true');
  ariaLive.className = 'sr-only';
  ariaLive.textContent = message;
  document.body.appendChild(ariaLive);
  setTimeout(() => ariaLive.remove(), 1000);
}

/**
 * Initialize filter buttons with event delegation
 */
function initFilters() {
  const filterContainer = document.querySelector('.flex-wrap.justify-center.gap-3');
  if (!filterContainer) return;

  filterContainer.addEventListener('click', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    // Update active states
    filterContainer.querySelectorAll('.filter-btn').forEach(b => {
      b.classList.remove('active', 'bg-purple-600', 'text-white');
      b.classList.add('bg-white', 'dark:bg-gray-800', 'text-gray-700', 'dark:text-gray-300');
      b.setAttribute('aria-pressed', 'false');
    });

    btn.classList.add('active', 'bg-purple-600', 'text-white');
    btn.classList.remove('bg-white', 'dark:bg-gray-800', 'text-gray-700', 'dark:text-gray-300');
    btn.setAttribute('aria-pressed', 'true');

    currentFilter = btn.getAttribute('data-category');
    renderResources(currentFilter, currentSearch);
    
    const filtered = getFilteredResources();
    let announcement;
    if (currentFilter === 'saved') {
      announcement = `Showing ${filtered.length} saved resource${filtered.length !== 1 ? 's' : ''}`;
    } else if (currentFilter === 'all') {
      announcement = `Showing all ${filtered.length} resources`;
    } else {
      announcement = `Showing ${filtered.length} ${currentFilter} resource${filtered.length !== 1 ? 's' : ''}`;
    }
    
    announceToScreenReader(announcement);
  });

  // Keyboard support for filter buttons
  filterContainer.addEventListener('keydown', (e) => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;

    const buttons = Array.from(filterContainer.querySelectorAll('.filter-btn'));
    const currentIndex = buttons.indexOf(btn);

    if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextIndex = (currentIndex + 1) % buttons.length;
      buttons[nextIndex].focus();
    } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
      e.preventDefault();
      const prevIndex = (currentIndex - 1 + buttons.length) % buttons.length;
      buttons[prevIndex].focus();
    }
  });
}