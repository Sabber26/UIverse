/**
 * roadmap.js - Interactive roadmap with progress tracking
 * @module roadmap
 */

document.addEventListener('DOMContentLoaded', () => {
  renderRoadmap();
  loadProgress();
});

const roadmapData = [
  {
    id: 1,
    title: 'Learn the Fundamentals',
    icon: '📚',
    description: 'Start with design principles: contrast, hierarchy, alignment, repetition, and balance. Study color theory, typography basics, and visual design foundations.',
    time: '2-4 weeks',
    resources: [
      { name: 'Design Principles 101', url: 'https://www.nngroup.com/articles/design-principles/' },
      { name: 'Color Theory for Designers', url: 'https://www.smashingmagazine.com/2010/01/color-theory-for-designers-part-1/' }
    ]
  },
  {
    id: 2,
    title: 'Understand Users',
    icon: '👥',
    description: 'Learn user research methods, create personas, map user journeys, and develop empathy for your users. Understanding user needs is the core of UX design.',
    time: '3-5 weeks',
    resources: [
      { name: 'User Research Basics', url: 'https://www.usability.gov/what-and-why/user-research.html' },
      { name: 'Creating Effective Personas', url: 'https://www.interaction-design.org/literature/article/personas-why-and-how-you-should-use-them' }
    ]
  },
  {
    id: 3,
    title: 'Master Typography & Spacing',
    icon: '✍️',
    description: 'Typography is 90% of design. Learn font pairing, sizing scales, line height, letter spacing, and how to create a proper typographic hierarchy.',
    time: '2-3 weeks',
    resources: [
      { name: 'Typography Handbook', url: 'https://www.fonts.com/content/learning/fontology' },
      { name: 'Google Fonts', url: 'https://fonts.google.com/' }
    ]
  },
  {
    id: 4,
    title: 'Learn Figma (or Design Tool)',
    icon: '🛠️',
    description: 'Master a design tool like Figma, Sketch, or Adobe XD. Learn components, auto-layout, prototyping, and collaboration features.',
    time: '3-4 weeks',
    resources: [
      { name: 'Figma for Beginners', url: 'https://www.figma.com/resources/learn-design/' },
      { name: 'Figma YouTube Channel', url: 'https://www.youtube.com/c/Figma' }
    ]
  },
  {
    id: 5,
    title: 'Build Your First Projects',
    icon: '🚀',
    description: 'Start with redesign challenges. Pick existing apps, identify problems, and redesign them. Build 3-5 solid case studies for your portfolio.',
    time: '4-6 weeks',
    resources: [
      { name: 'Daily UI Challenge', url: 'https://www.dailyui.co/' },
      { name: 'Sharpen Design Challenges', url: 'https://sharpen.design/' }
    ]
  },
  {
    id: 6,
    title: 'Create Your Portfolio',
    icon: '💼',
    description: 'Build a portfolio showcasing 3-4 case studies. Each should include: problem, research, process, solution, and results. Use platforms like Behance, Dribbble, or build your own site.',
    time: '2-3 weeks',
    resources: [
      { name: 'Portfolio Examples', url: 'https://www.bestfolios.com/' },
      { name: 'Behance', url: 'https://www.behance.net/' }
    ]
  },
  {
    id: 7,
    title: 'Apply for Jobs / Freelance',
    icon: '🎯',
    description: 'Prepare your resume, practice design interviews, network on LinkedIn, and start applying. Consider freelancing platforms to gain experience.',
    time: 'Ongoing',
    resources: [
      { name: 'UX Job Board', url: 'https://www.uxjobsboard.com/' },
      { name: 'Design Interview Preparation', url: 'https://www.interviewquery.com/blog-design-interview-questions/' }
    ]
  }
];

/**
 * Render the roadmap steps
 */
function renderRoadmap() {
  const container = document.getElementById('roadmapSteps');
  if (!container) return;

  PerformanceMonitor.start('roadmap-render');
  
  container.innerHTML = roadmapData.map(step => `
    <div class="bg-white dark:bg-gray-800 rounded-2xl shadow-md overflow-hidden transition-all duration-300" role="listitem">
      <button class="w-full p-6 flex items-center justify-between text-left hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors min-h-[44px]"
              aria-expanded="false"
              aria-controls="step-content-${step.id}"
              data-step-id="${step.id}">
        <div class="flex items-center space-x-4">
          <span class="text-3xl" aria-hidden="true">${step.icon}</span>
          <div>
            <h3 class="text-lg font-semibold">${sanitizeHTML(step.title)}</h3>
            <p class="text-sm text-gray-500 dark:text-gray-400">⏱️ ${sanitizeHTML(step.time)}</p>
          </div>
        </div>
        <div class="flex items-center space-x-3">
          <span id="check-${step.id}" class="text-2xl hidden" aria-label="Completed">✅</span>
          <svg class="w-5 h-5 transform transition-transform" id="chevron-${step.id}" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path>
          </svg>
        </div>
      </button>
      <div id="step-content-${step.id}" class="accordion-content" role="region" aria-labelledby="step-header-${step.id}">
        <div class="px-6 pb-6">
          <p class="text-gray-600 dark:text-gray-300 mb-4">${sanitizeHTML(step.description)}</p>
          <div class="mb-4">
            <h4 class="font-semibold mb-2">📖 Recommended Resources:</h4>
            <ul class="space-y-2" role="list">
              ${step.resources.map(res => 
                `<li><a href="${sanitizeURL(res.url)}" target="_blank" rel="noopener noreferrer" class="text-purple-600 dark:text-purple-400 hover:underline focus:outline-2 focus:outline-purple-500">🔗 ${sanitizeHTML(res.name)}</a></li>`
              ).join('')}
            </ul>
          </div>
          <label class="flex items-center space-x-3 cursor-pointer min-h-[44px] hover:bg-gray-50 dark:hover:bg-gray-700 rounded-lg px-2 -mx-2 transition-colors">
            <input type="checkbox" 
                   id="complete-${step.id}" 
                   class="w-5 h-5 text-purple-600 rounded focus:ring-purple-500 focus:ring-2"
                   aria-label="Mark ${sanitizeHTML(step.title)} as completed"
                   tabindex="0">
            <span class="text-sm font-medium select-none">Mark as completed</span>
          </label>
        </div>
      </div>
    </div>
  `).join('');

  // Setup event delegation for roadmap
  setupRoadmapEvents();
  
  const renderTime = PerformanceMonitor.end('roadmap-render');
  PerformanceMonitor.log('Roadmap Render', renderTime);
}

/**
 * Setup event delegation for roadmap interactions
 */
function setupRoadmapEvents() {
  const container = document.getElementById('roadmapSteps');
  if (!container) return;

  container.addEventListener('click', (e) => {
    // Handle step toggle buttons
    const button = e.target.closest('button[data-step-id]');
    if (button) {
      const stepId = parseInt(button.getAttribute('data-step-id'));
      toggleStep(stepId);
      return;
    }
  });

  // Handle checkbox changes
  container.addEventListener('change', (e) => {
    if (e.target.type === 'checkbox' && e.target.id.startsWith('complete-')) {
      const stepId = parseInt(e.target.id.replace('complete-', ''));
      handleCheckboxChange(stepId, e.target.checked);
    }
  });

  // Keyboard support for checkboxes
  container.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      const checkbox = e.target.closest('input[type="checkbox"]');
      if (checkbox) {
        e.preventDefault();
        checkbox.checked = !checkbox.checked;
        const stepId = parseInt(checkbox.id.replace('complete-', ''));
        handleCheckboxChange(stepId, checkbox.checked);
      }
    }
  });
}

/**
 * Toggle a roadmap step
 * @param {number} id - Step ID
 */
function toggleStep(id) {
  const content = document.getElementById(`step-content-${id}`);
  const chevron = document.getElementById(`chevron-${id}`);
  const button = document.querySelector(`button[data-step-id="${id}"]`);
  
  if (!content || !button) return;

  // Close all other steps
  document.querySelectorAll('#roadmapSteps .accordion-content.active').forEach(el => {
    if (el !== content) {
      el.classList.remove('active');
      const otherButton = el.previousElementSibling;
      if (otherButton) {
        otherButton.setAttribute('aria-expanded', 'false');
      }
      const otherChevron = el.previousElementSibling?.querySelector('svg:last-child');
      if (otherChevron) otherChevron.style.transform = 'rotate(0deg)';
    }
  });

  // Toggle current step
  const isOpen = !content.classList.contains('active');
  content.classList.toggle('active');
  button.setAttribute('aria-expanded', isOpen);
  
  if (chevron) {
    chevron.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
  }
}

/**
 * Handle checkbox state change
 * @param {number} id - Step ID
 * @param {boolean} checked - Checked state
 */
function handleCheckboxChange(id, checked) {
  const checkIcon = document.getElementById(`check-${id}`);
  
  if (checked && checkIcon) {
    checkIcon.classList.remove('hidden');
  } else if (checkIcon) {
    checkIcon.classList.add('hidden');
  }
  
  saveProgress();
  updateProgressBar();
  
  // Show toast notification
  const step = roadmapData.find(s => s.id === id);
  if (step && typeof toast !== 'undefined') {
    const message = checked 
      ? `✅ "${step.title}" marked as completed!` 
      : `"${step.title}" unmarked`;
    toast.show(message, checked ? 'success' : 'info', 2000);
  }
  
  // Check if all steps completed
  checkAllCompleted();
}

/**
 * Save progress to localStorage
 */
function saveProgress() {
  try {
    const completed = [];
    roadmapData.forEach(step => {
      const checkbox = document.getElementById(`complete-${step.id}`);
      if (checkbox && checkbox.checked) {
        completed.push(step.id);
      }
    });
    const success = StorageHelper.set('roadmapProgress', completed);
    if (success) {
      console.log('Progress saved successfully');
    }
  } catch (error) {
    ErrorLogger.log(error, 'Roadmap Save Progress');
    if (typeof toast !== 'undefined') {
      toast.error('Failed to save progress', 3000);
    }
  }
}

/**
 * Load progress from localStorage
 */
function loadProgress() {
  try {
    const completed = StorageHelper.get('roadmapProgress', []);
    
    completed.forEach(id => {
      const checkbox = document.getElementById(`complete-${id}`);
      const checkIcon = document.getElementById(`check-${id}`);
      if (checkbox) {
        checkbox.checked = true;
        if (checkIcon) checkIcon.classList.remove('hidden');
      }
    });
    
    updateProgressBar();
  } catch (error) {
    ErrorLogger.log(error, 'Roadmap Load Progress');
    // Use default state - no progress
    updateProgressBar();
  }
}

/**
 * Update the progress bar and percentage
 */
function updateProgressBar() {
  const progressBar = document.getElementById('progressBar');
  const progressPercentage = document.getElementById('progressPercentage');
  const progressContainer = document.querySelector('[role="progressbar"]');
  
  if (!progressBar || !progressPercentage) return;
  
  const total = roadmapData.length;
  let completed = 0;
  
  roadmapData.forEach(step => {
    const checkbox = document.getElementById(`complete-${step.id}`);
    if (checkbox && checkbox.checked) completed++;
  });
  
  const percentage = Math.round((completed / total) * 100);
  progressBar.style.width = percentage + '%';
  progressPercentage.textContent = percentage + '%';
  
  if (progressContainer) {
    progressContainer.setAttribute('aria-valuenow', percentage);
  }
}

/**
 * Check if all steps are completed and celebrate
 */
function checkAllCompleted() {
  const total = roadmapData.length;
  let completed = 0;
  
  roadmapData.forEach(step => {
    const checkbox = document.getElementById(`complete-${step.id}`);
    if (checkbox && checkbox.checked) completed++;
  });
  
  if (completed === total) {
    triggerConfetti();
    if (typeof toast !== 'undefined' && toast.success) {
      toast.success('🎉 Congratulations! You completed the entire roadmap!', 5000);
    }
  }
}

/**
 * Trigger confetti animation
 */
function triggerConfetti() {
  const colors = ['#a855f7', '#9333ea', '#7e22ce', '#c084fc', '#e9d5ff', '#f97316', '#fb923c'];
  
  for (let i = 0; i < 100; i++) {
    setTimeout(() => {
      const confetti = document.createElement('div');
      confetti.className = 'confetti-piece';
      confetti.setAttribute('aria-hidden', 'true');
      confetti.style.left = Math.random() * 100 + '%';
      confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
      confetti.style.animationDuration = (Math.random() * 2 + 2) + 's';
      confetti.style.width = (Math.random() * 10 + 5) + 'px';
      confetti.style.height = (Math.random() * 10 + 5) + 'px';
      document.body.appendChild(confetti);
      
      // Safer cleanup: check if still in DOM
      const cleanup = () => {
        if (confetti.parentNode) {
          confetti.remove();
        }
      };
      
      // Use animationend event for precise cleanup
      confetti.addEventListener('animationend', cleanup, { once: true });
      
      // Fallback timeout in case animationend doesn't fire
      setTimeout(cleanup, 5000);
    }, i * 30);
  }
}

// Reset roadmap progress
document.addEventListener('DOMContentLoaded', () => {
  const resetBtn = document.getElementById('resetRoadmap');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      if (confirm('Are you sure you want to reset all your progress? This cannot be undone.')) {
        roadmapData.forEach(step => {
          const checkbox = document.getElementById(`complete-${step.id}`);
          const checkIcon = document.getElementById(`check-${step.id}`);
          if (checkbox) {
            checkbox.checked = false;
            if (checkIcon) checkIcon.classList.add('hidden');
          }
        });
        StorageHelper.remove('roadmapProgress');
        updateProgressBar();
        if (typeof toast !== 'undefined') {
          toast.info('Progress has been reset', 3000);
        }
      }
    });
  }
});