/**
 * accordion.js - FAQ accordion component with JSON data fetching
 * @module accordion
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('[Accordion] DOM ready, loading FAQ data...');
  loadFAQData();
});

/**
 * Load FAQ data from JSON file with fallback
 */
async function loadFAQData() {
  console.log('[Accordion] Starting FAQ data load...');
  PerformanceMonitor.start('faq-load');
  
  try {
    // Try to fetch from data/faq.json
    console.log('[Accordion] Fetching data/faq.json...');
    const response = await fetch('data/faq.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const faqData = await response.json();
    console.log('[Accordion] FAQ data loaded successfully:', faqData.length, 'items');
    renderFAQ(faqData);
    
    const loadTime = PerformanceMonitor.end('faq-load');
    PerformanceMonitor.log('FAQ Data Load', loadTime);
  } catch (error) {
    console.error('[Accordion] Failed to load FAQ data:', error);
    ErrorLogger.log(error, 'FAQ Load');
    console.warn('Using fallback FAQ data');
    renderFAQ(getFallbackFAQData());
    
    const loadTime = PerformanceMonitor.end('faq-load');
    PerformanceMonitor.log('FAQ Fallback Load', loadTime);
  }
}

/**
 * Fallback FAQ data if JSON fetch fails
 * @returns {Array} FAQ data array
 */
function getFallbackFAQData() {
  console.log('[Accordion] Using fallback FAQ data');
  return [
    {
      id: 1,
      question: 'Do I need to know how to code to become a UI/UX designer?',
      answer: 'No, you don\'t need to be a developer to be a UI/UX designer! While understanding basic HTML/CSS can be helpful (it helps you understand technical constraints), most design roles focus on the design process using tools like Figma, Sketch, or Adobe XD. However, having some coding knowledge can make you more versatile and valuable, especially in smaller companies or startups.'
    },
    {
      id: 2,
      question: 'How long does it take to learn UI/UX?',
      answer: 'The timeline varies depending on your dedication and learning path. On average: Self-taught route: 6-12 months of consistent learning (10-15 hours/week). Bootcamp: 3-6 months of intensive training. University degree: 2-4 years. Remember, learning is continuous — even experienced designers constantly learn new skills and tools.'
    },
    {
      id: 3,
      question: "What's the difference between UI and UX?",
      answer: 'UI (User Interface) is the visual design — colors, typography, buttons, icons, and layout. Think of it as the "look" of a product. UX (User Experience) is how the product works and feels — the user journey, ease of use, and solving user problems. Think of it as the "feel" of a product. A beautiful chair that\'s uncomfortable to sit on has good UI but poor UX.'
    },
    {
      id: 4,
      question: 'Is a degree necessary to become a UI/UX designer?',
      answer: 'No, a degree is not mandatory! Many successful designers are self-taught or come from bootcamps. What matters most is your portfolio, skills, and problem-solving ability. Companies care about what you can do, not necessarily your degree. However, degrees in design, HCI, psychology, or related fields can provide a strong theoretical foundation.'
    },
    {
      id: 5,
      question: 'What tools should I learn first?',
      answer: 'Start with Figma — it\'s free, browser-based, and industry-standard. It handles UI design, prototyping, and collaboration. Once comfortable, explore: Miro or FigJam (for whiteboarding/user flows), Maze or Useberry (for usability testing), Adobe Creative Suite (optional, for advanced visual design). Focus on mastering one tool deeply rather than being average at many.'
    },
    {
      id: 6,
      question: 'How do I build a portfolio with no experience?',
      answer: 'Start with passion projects and redesign challenges: 1. Redesign a poorly designed app you use daily. 2. Participate in Daily UI challenges. 3. Design a fictional app for a problem you care about. 4. Volunteer for local nonprofits or small businesses. 5. Create detailed case studies (problem → research → process → solution). Remember: 3 high-quality case studies > 10 mediocre ones. Show your process, not just the final product.'
    }
  ];
}

/**
 * Render FAQ accordion items
 * @param {Array} faqData - FAQ data array
 */
function renderFAQ(faqData) {
  const container = document.getElementById('faqContainer');
  if (!container) {
    console.error('[Accordion] FAQ container not found!');
    return;
  }

  console.log('[Accordion] Rendering FAQ items:', faqData.length);
  PerformanceMonitor.start('faq-render');

  // Render actual content
  container.innerHTML = faqData.map((faq, index) => `
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden animate-fade-in" role="listitem">
      <button class="faq-button w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-h-[44px]"
              aria-expanded="false"
              aria-controls="faq-content-${faq.id}"
              data-faq-index="${index}">
        <span class="text-lg font-semibold pr-4">${sanitizeHTML(faq.question)}</span>
        <svg class="w-5 h-5 flex-shrink-0 transform transition-transform" 
             id="faq-chevron-${index}" 
             fill="none" 
             stroke="currentColor" 
             viewBox="0 0 24 24"
             aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      <div id="faq-content-${faq.id}" 
           class="accordion-content" 
           role="region" 
           aria-labelledby="faq-header-${faq.id}">
        <div class="px-6 pb-6 text-gray-600 dark:text-gray-300">
          ${sanitizeHTML(faq.answer)}
        </div>
      </div>
    </div>
  `).join('');

  // Setup event delegation for FAQ
  setupFAQEvents();

  const renderTime = PerformanceMonitor.end('faq-render');
  PerformanceMonitor.log('FAQ Render', renderTime);
  
  if (typeof toast !== 'undefined' && toast.info) {
    toast.info(`Loaded ${faqData.length} frequently asked questions`, 2000);
  }
  
  console.log('[Accordion] FAQ rendering complete');
}

/**
 * Setup event delegation for FAQ interactions
 */
function setupFAQEvents() {
  const container = document.getElementById('faqContainer');
  if (!container) return;

  // Remove old event listeners by cloning
  const newContainer = container.cloneNode(true);
  container.parentNode.replaceChild(newContainer, container);

  // Click handler
  newContainer.addEventListener('click', (e) => {
    const button = e.target.closest('.faq-button');
    if (!button) return;
    
    const index = parseInt(button.getAttribute('data-faq-index'));
    toggleFAQ(index);
  });

  // Keyboard handler
  newContainer.addEventListener('keydown', (e) => {
    const button = e.target.closest('.faq-button');
    if (!button) return;

    const buttons = Array.from(newContainer.querySelectorAll('.faq-button'));
    const currentIndex = buttons.indexOf(button);

    switch(e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        const index = parseInt(button.getAttribute('data-faq-index'));
        toggleFAQ(index);
        break;
      
      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex < buttons.length - 1) {
          buttons[currentIndex + 1].focus();
        }
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex > 0) {
          buttons[currentIndex - 1].focus();
        }
        break;
      
      case 'Home':
        e.preventDefault();
        buttons[0].focus();
        break;
      
      case 'End':
        e.preventDefault();
        buttons[buttons.length - 1].focus();
        break;
    }
  });
}

/**
 * Toggle FAQ item with animation
 * @param {number} index - FAQ item index
 */
function toggleFAQ(index) {
  const container = document.getElementById('faqContainer');
  const buttons = container.querySelectorAll('.faq-button');
  const button = buttons[index];
  
  if (!button) return;
  
  const contentId = button.getAttribute('aria-controls');
  const content = document.getElementById(contentId);
  const chevron = button.querySelector('svg');
  
  if (!content) return;

  const isCurrentlyOpen = content.classList.contains('active');

  // Close all other FAQ items
  container.querySelectorAll('.accordion-content.active').forEach(el => {
    if (el !== content) {
      el.classList.remove('active');
      const otherButton = el.previousElementSibling;
      if (otherButton) {
        otherButton.setAttribute('aria-expanded', 'false');
      }
      const otherChevron = otherButton?.querySelector('svg');
      if (otherChevron) otherChevron.style.transform = 'rotate(0deg)';
    }
  });

  // Toggle current FAQ
  if (!isCurrentlyOpen) {
    content.classList.add('active');
    button.setAttribute('aria-expanded', 'true');
    if (chevron) chevron.style.transform = 'rotate(180deg)';
  } else {
    content.classList.remove('active');
    button.setAttribute('aria-expanded', 'false');
    if (chevron) chevron.style.transform = 'rotate(0deg)';
  }
}/**
 * accordion.js - FAQ accordion component with JSON data fetching
 * @module accordion
 */

document.addEventListener('DOMContentLoaded', () => {
  console.log('[Accordion] DOM ready, loading FAQ data...');
  loadFAQData();
});

/**
 * Load FAQ data from JSON file with fallback
 */
async function loadFAQData() {
  console.log('[Accordion] Starting FAQ data load...');
  PerformanceMonitor.start('faq-load');
  
  try {
    // Try to fetch from data/faq.json
    console.log('[Accordion] Fetching data/faq.json...');
    const response = await fetch('data/faq.json');
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const faqData = await response.json();
    console.log('[Accordion] FAQ data loaded successfully:', faqData.length, 'items');
    renderFAQ(faqData);
    
    const loadTime = PerformanceMonitor.end('faq-load');
    PerformanceMonitor.log('FAQ Data Load', loadTime);
  } catch (error) {
    console.error('[Accordion] Failed to load FAQ data:', error);
    ErrorLogger.log(error, 'FAQ Load');
    console.warn('Using fallback FAQ data');
    renderFAQ(getFallbackFAQData());
    
    const loadTime = PerformanceMonitor.end('faq-load');
    PerformanceMonitor.log('FAQ Fallback Load', loadTime);
  }
}

/**
 * Fallback FAQ data if JSON fetch fails
 * @returns {Array} FAQ data array
 */
function getFallbackFAQData() {
  console.log('[Accordion] Using fallback FAQ data');
  return [
    {
      id: 1,
      question: 'Do I need to know how to code to become a UI/UX designer?',
      answer: 'No, you don\'t need to be a developer to be a UI/UX designer! While understanding basic HTML/CSS can be helpful (it helps you understand technical constraints), most design roles focus on the design process using tools like Figma, Sketch, or Adobe XD. However, having some coding knowledge can make you more versatile and valuable, especially in smaller companies or startups.'
    },
    {
      id: 2,
      question: 'How long does it take to learn UI/UX?',
      answer: 'The timeline varies depending on your dedication and learning path. On average: Self-taught route: 6-12 months of consistent learning (10-15 hours/week). Bootcamp: 3-6 months of intensive training. University degree: 2-4 years. Remember, learning is continuous — even experienced designers constantly learn new skills and tools.'
    },
    {
      id: 3,
      question: "What's the difference between UI and UX?",
      answer: 'UI (User Interface) is the visual design — colors, typography, buttons, icons, and layout. Think of it as the "look" of a product. UX (User Experience) is how the product works and feels — the user journey, ease of use, and solving user problems. Think of it as the "feel" of a product. A beautiful chair that\'s uncomfortable to sit on has good UI but poor UX.'
    },
    {
      id: 4,
      question: 'Is a degree necessary to become a UI/UX designer?',
      answer: 'No, a degree is not mandatory! Many successful designers are self-taught or come from bootcamps. What matters most is your portfolio, skills, and problem-solving ability. Companies care about what you can do, not necessarily your degree. However, degrees in design, HCI, psychology, or related fields can provide a strong theoretical foundation.'
    },
    {
      id: 5,
      question: 'What tools should I learn first?',
      answer: 'Start with Figma — it\'s free, browser-based, and industry-standard. It handles UI design, prototyping, and collaboration. Once comfortable, explore: Miro or FigJam (for whiteboarding/user flows), Maze or Useberry (for usability testing), Adobe Creative Suite (optional, for advanced visual design). Focus on mastering one tool deeply rather than being average at many.'
    },
    {
      id: 6,
      question: 'How do I build a portfolio with no experience?',
      answer: 'Start with passion projects and redesign challenges: 1. Redesign a poorly designed app you use daily. 2. Participate in Daily UI challenges. 3. Design a fictional app for a problem you care about. 4. Volunteer for local nonprofits or small businesses. 5. Create detailed case studies (problem → research → process → solution). Remember: 3 high-quality case studies > 10 mediocre ones. Show your process, not just the final product.'
    }
  ];
}

/**
 * Render FAQ accordion items
 * @param {Array} faqData - FAQ data array
 */
function renderFAQ(faqData) {
  const container = document.getElementById('faqContainer');
  if (!container) {
    console.error('[Accordion] FAQ container not found!');
    return;
  }

  console.log('[Accordion] Rendering FAQ items:', faqData.length);
  PerformanceMonitor.start('faq-render');

  // Render actual content
  container.innerHTML = faqData.map((faq, index) => `
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden animate-fade-in" role="listitem">
      <button class="faq-button w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-h-[44px]"
              aria-expanded="false"
              aria-controls="faq-content-${faq.id}"
              data-faq-index="${index}">
        <span class="text-lg font-semibold pr-4">${sanitizeHTML(faq.question)}</span>
        <svg class="w-5 h-5 flex-shrink-0 transform transition-transform" 
             id="faq-chevron-${index}" 
             fill="none" 
             stroke="currentColor" 
             viewBox="0 0 24 24"
             aria-hidden="true">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
        </svg>
      </button>
      <div id="faq-content-${faq.id}" 
           class="accordion-content" 
           role="region" 
           aria-labelledby="faq-header-${faq.id}">
        <div class="px-6 pb-6 text-gray-600 dark:text-gray-300">
          ${sanitizeHTML(faq.answer)}
        </div>
      </div>
    </div>
  `).join('');

  // Setup event delegation for FAQ
  setupFAQEvents();

  const renderTime = PerformanceMonitor.end('faq-render');
  PerformanceMonitor.log('FAQ Render', renderTime);
  
  if (typeof toast !== 'undefined' && toast.info) {
    toast.info(`Loaded ${faqData.length} frequently asked questions`, 2000);
  }
  
  console.log('[Accordion] FAQ rendering complete');
}

/**
 * Setup event delegation for FAQ interactions
 */
function setupFAQEvents() {
  const container = document.getElementById('faqContainer');
  if (!container) return;

  // Remove old event listeners by cloning
  const newContainer = container.cloneNode(true);
  container.parentNode.replaceChild(newContainer, container);

  // Click handler
  newContainer.addEventListener('click', (e) => {
    const button = e.target.closest('.faq-button');
    if (!button) return;
    
    const index = parseInt(button.getAttribute('data-faq-index'));
    toggleFAQ(index);
  });

  // Keyboard handler
  newContainer.addEventListener('keydown', (e) => {
    const button = e.target.closest('.faq-button');
    if (!button) return;

    const buttons = Array.from(newContainer.querySelectorAll('.faq-button'));
    const currentIndex = buttons.indexOf(button);

    switch(e.key) {
      case 'Enter':
      case ' ':
        e.preventDefault();
        const index = parseInt(button.getAttribute('data-faq-index'));
        toggleFAQ(index);
        break;
      
      case 'ArrowDown':
        e.preventDefault();
        if (currentIndex < buttons.length - 1) {
          buttons[currentIndex + 1].focus();
        }
        break;
      
      case 'ArrowUp':
        e.preventDefault();
        if (currentIndex > 0) {
          buttons[currentIndex - 1].focus();
        }
        break;
      
      case 'Home':
        e.preventDefault();
        buttons[0].focus();
        break;
      
      case 'End':
        e.preventDefault();
        buttons[buttons.length - 1].focus();
        break;
    }
  });
}

/**
 * Toggle FAQ item with animation
 * @param {number} index - FAQ item index
 */
function toggleFAQ(index) {
  const container = document.getElementById('faqContainer');
  const buttons = container.querySelectorAll('.faq-button');
  const button = buttons[index];
  
  if (!button) return;
  
  const contentId = button.getAttribute('aria-controls');
  const content = document.getElementById(contentId);
  const chevron = button.querySelector('svg');
  
  if (!content) return;

  const isCurrentlyOpen = content.classList.contains('active');

  // Close all other FAQ items
  container.querySelectorAll('.accordion-content.active').forEach(el => {
    if (el !== content) {
      el.classList.remove('active');
      const otherButton = el.previousElementSibling;
      if (otherButton) {
        otherButton.setAttribute('aria-expanded', 'false');
      }
      const otherChevron = otherButton?.querySelector('svg');
      if (otherChevron) otherChevron.style.transform = 'rotate(0deg)';
    }
  });

  // Toggle current FAQ
  if (!isCurrentlyOpen) {
    content.classList.add('active');
    button.setAttribute('aria-expanded', 'true');
    if (chevron) chevron.style.transform = 'rotate(180deg)';
  } else {
    content.classList.remove('active');
    button.setAttribute('aria-expanded', 'false');
    if (chevron) chevron.style.transform = 'rotate(0deg)';
  }
}