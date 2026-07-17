/**
 * quiz.js - Personality quiz engine with keyboard accessibility and shareable results
 * @module quiz
 */

// ============ DATA DEFINITIONS ============

const personas = {
  visual: {
    name: 'The Visual Artist 🎨',
    description: 'You have a natural eye for aesthetics, color, and visual harmony. UI design is your calling! You love crafting pixel-perfect interfaces that delight users visually.',
    recommendedPath: 'Focus on UI Design, visual design systems, micro-interactions, and design tools like Figma and Sketch.',
    role: 'UI Designer'
  },
  problem_solving: {
    name: 'The Problem Solver 🧩',
    description: 'You thrive on logic, user flows, and making complex systems simple. UX design is where you\'ll shine! Your strength lies in creating intuitive, efficient experiences.',
    recommendedPath: 'Deep dive into UX design, information architecture, wireframing, prototyping, and usability testing.',
    role: 'UX Designer'
  },
  research: {
    name: 'The Researcher 🔍',
    description: 'You\'re naturally curious about human behavior and love data-driven decisions. UX Research is your path! You excel at understanding users and uncovering insights.',
    recommendedPath: 'Pursue UX Research, learn usability testing, user interviews, surveys, and data analysis methods.',
    role: 'UX Researcher'
  },
  hybrid: {
    name: 'The Hybrid Designer ⚡',
    description: 'You\'re a versatile designer who loves both the visual and functional aspects of design. Product Design is perfect for you! You can own the entire design process.',
    recommendedPath: 'Pursue Product Design — master both UI and UX, learn to manage design systems, and lead design projects end-to-end.',
    role: 'Product Designer'
  }
};

const quizQuestions = [
  {
    question: 'What excites you most about design?',
    options: [
      { text: 'Making things look beautiful and visually stunning', category: 'visual' },
      { text: 'Solving complex user problems and improving workflows', category: 'problem_solving' },
      { text: 'Understanding why users behave the way they do', category: 'research' },
      { text: 'All of the above — I love the complete process', category: 'hybrid' }
    ]
  },
  {
    question: 'How do you prefer to spend your design time?',
    options: [
      { text: 'Perfecting colors, typography, and visual details', category: 'visual' },
      { text: 'Mapping user flows and information architecture', category: 'problem_solving' },
      { text: 'Conducting user interviews and analyzing data', category: 'research' },
      { text: 'Switching between visuals, logic, and research', category: 'hybrid' }
    ]
  },
  {
    question: "What's your favorite part of a design project?",
    options: [
      { text: 'Creating the visual design and polishing the UI', category: 'visual' },
      { text: 'Wireframing and prototyping the user flow', category: 'problem_solving' },
      { text: 'User testing and iterating based on feedback', category: 'research' },
      { text: 'I enjoy every phase from start to finish', category: 'hybrid' }
    ]
  },
  {
    question: 'Which tool sounds most appealing to you?',
    options: [
      { text: 'Figma or Sketch for creating beautiful interfaces', category: 'visual' },
      { text: 'Miro or Whimsical for mapping user journeys', category: 'problem_solving' },
      { text: 'Hotjar or Google Analytics for user behavior insights', category: 'research' },
      { text: 'All of them — I adapt to whatever tool is needed', category: 'hybrid' }
    ]
  },
  {
    question: 'What would be your ideal design project?',
    options: [
      { text: 'Redesigning a mobile app to make it gorgeous', category: 'visual' },
      { text: 'Improving the checkout flow to reduce cart abandonment', category: 'problem_solving' },
      { text: 'Running usability tests to uncover user pain points', category: 'research' },
      { text: 'Leading a full redesign from research to final UI', category: 'hybrid' }
    ]
  }
];

// ============ QUIZ STATE ============

let currentQuestion = 0;
let answers = [];

// ============ DOM READY ============

document.addEventListener('DOMContentLoaded', function() {
  console.log('[Quiz] DOM ready, initializing quiz...');
  
  // Check if URL has a result param on load
  const params = new URLSearchParams(window.location.search);
  if (params.has('result')) {
    const resultType = params.get('result');
    if (personas[resultType]) {
      renderQuiz();
      // Small delay to let DOM settle, then show result directly
      setTimeout(function() {
        showResultsDirectly(resultType);
      }, 100);
      return;
    }
  }
  renderQuiz();
  console.log('[Quiz] Quiz initialized');
});

// ============ QUIZ FUNCTIONS ============

/**
 * Render the quiz start screen
 */
function renderQuiz() {
  console.log('[Quiz] Rendering quiz start screen');
  const container = document.getElementById('quizContainer');
  if (!container) {
    console.error('[Quiz] Quiz container not found!');
    return;
  }

  container.innerHTML = `
    <div id="quizStart" class="animate-fade-in">
      <h3 class="text-2xl font-bold mb-4 text-center">Discover Your Design Personality</h3>
      <p class="text-gray-600 dark:text-gray-300 text-center mb-8">Answer 5 questions to find out what type of designer you are.</p>
      <div class="text-center">
        <button onclick="startQuiz()" 
                class="px-8 py-4 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transform hover:scale-105 transition-all min-h-[44px] focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                aria-label="Start the personality quiz">
          Start Quiz 🚀
        </button>
      </div>
    </div>
  `;
}

/**
 * Start the quiz
 */
function startQuiz() {
  console.log('[Quiz] Starting quiz...');
  currentQuestion = 0;
  answers = [];
  // Clear any result URL param
  const url = new URL(window.location);
  url.searchParams.delete('result');
  window.history.replaceState(null, '', url);
  showQuestion();
  if (typeof toast !== 'undefined' && toast.info) {
    toast.info('Quiz started! Choose your answers honestly for the best results.', 3000);
  }
}

/**
 * Show current question with accessibility
 */
function showQuestion() {
  const container = document.getElementById('quizContainer');
  if (!container) return;

  const question = quizQuestions[currentQuestion];
  
  const progressPercent = Math.round((currentQuestion / quizQuestions.length) * 100);
  
  container.innerHTML = `
    <div class="animate-slide-in" role="region" aria-label="Quiz question ${currentQuestion + 1} of ${quizQuestions.length}">
      <div class="mb-6">
        <div class="flex justify-between items-center mb-4">
          <span class="text-sm font-medium text-gray-500 dark:text-gray-400">
            Question ${currentQuestion + 1} of ${quizQuestions.length}
          </span>
          <span class="text-sm font-bold text-purple-600 dark:text-purple-400">
            ${progressPercent}% complete
          </span>
        </div>
        
        <!-- Progress bar -->
        <div class="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-6">
          <div class="bg-gradient-to-r from-purple-600 to-indigo-600 h-2 rounded-full transition-all duration-500" 
               style="width: ${progressPercent}%"></div>
        </div>
        
        <!-- Question dots -->
        <div class="flex justify-center space-x-2 mb-6">
          ${quizQuestions.map((_, i) => 
            `<div class="w-3 h-3 rounded-full transition-colors ${
              i < currentQuestion ? 'bg-green-500' : 
              i === currentQuestion ? 'bg-purple-600' : 
              'bg-gray-300 dark:bg-gray-600'
            }" aria-hidden="true"></div>`
          ).join('')}
        </div>
        
        <h3 class="text-2xl font-bold mb-8">${sanitizeHTML(question.question)}</h3>
        
        <div class="space-y-4" role="radiogroup" aria-label="Answer options">
          ${question.options.map((option, index) => `
            <div class="quiz-option p-4 border-2 border-gray-200 dark:border-gray-600 rounded-xl hover:border-purple-400 dark:hover:border-purple-400 transition-all" 
                 onclick="selectAnswer(${index})"
                 onkeydown="handleQuizOptionKeydown(event, ${index})"
                 role="radio"
                 aria-checked="false"
                 tabindex="0"
                 aria-label="Option ${index + 1}: ${sanitizeHTML(option.text)}">
              <p class="text-gray-700 dark:text-gray-300">${sanitizeHTML(option.text)}</p>
            </div>
          `).join('')}
        </div>
        
        ${currentQuestion > 0 ? `
          <div class="mt-6 text-center">
            <button onclick="goBack()" 
                    class="px-6 py-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full hover:bg-gray-300 dark:hover:bg-gray-600 transition-all min-h-[44px] focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    aria-label="Go back to previous question">
              ← Back
            </button>
          </div>
        ` : ''}
      </div>
    </div>
  `;

  // Focus first option
  setTimeout(() => {
    const firstOption = container.querySelector('.quiz-option');
    if (firstOption) firstOption.focus();
  }, 100);
}

/**
 * Handle keyboard navigation for quiz options
 * @param {KeyboardEvent} event - Key event
 * @param {number} index - Option index
 */
function handleQuizOptionKeydown(event, index) {
  if (event.key === 'Enter' || event.key === ' ') {
    event.preventDefault();
    selectAnswer(index);
  }
  
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault();
    const options = document.querySelectorAll('.quiz-option');
    const direction = event.key === 'ArrowDown' ? 1 : -1;
    const newIndex = (index + direction + options.length) % options.length;
    options[newIndex].focus();
  }
}

/**
 * Select an answer and move to next question
 * @param {number} index - Selected option index
 */
function selectAnswer(index) {
  console.log('[Quiz] Selected answer:', index);
  const question = quizQuestions[currentQuestion];
  answers.push(question.options[index].category);
  
  // Visual feedback
  const options = document.querySelectorAll('.quiz-option');
  options.forEach((opt, i) => {
    opt.style.pointerEvents = 'none';
    opt.setAttribute('tabindex', '-1');
    if (i === index) {
      opt.classList.add('selected');
      opt.setAttribute('aria-checked', 'true');
    }
  });

  // Move to next question or show results
  setTimeout(() => {
    currentQuestion++;
    if (currentQuestion < quizQuestions.length) {
      showQuestion();
    } else {
      showResults();
    }
  }, 600);
}

/**
 * Go back to previous question
 */
function goBack() {
  if (currentQuestion > 0) {
    currentQuestion--;
    answers.pop();
    showQuestion();
  }
}

/**
 * Calculate and show quiz results
 */
function showResults() {
  console.log('[Quiz] Showing results...');
  const container = document.getElementById('quizContainer');
  if (!container) return;

  // Calculate result
  const counts = {};
  answers.forEach(category => {
    counts[category] = (counts[category] || 0) + 1;
  });
  
  let maxCount = 0;
  let dominantCategory = 'visual';
  Object.entries(counts).forEach(([category, count]) => {
    if (count > maxCount) {
      maxCount = count;
      dominantCategory = category;
    }
  });
  
  console.log('[Quiz] Dominant category:', dominantCategory);
  
  // Update URL with result
  const url = new URL(window.location);
  url.searchParams.set('result', dominantCategory);
  window.history.replaceState(null, '', url);
  
  renderResult(dominantCategory);
}

/**
 * Show results directly from URL parameter
 * @param {string} dominantCategory - Persona type
 */
function showResultsDirectly(dominantCategory) {
  console.log('[Quiz] Showing results directly for:', dominantCategory);
  renderResult(dominantCategory);
}

/**
 * Render result card
 * @param {string} dominantCategory - Persona type
 */
function renderResult(dominantCategory) {
  const container = document.getElementById('quizContainer');
  if (!container) return;
  
  const persona = personas[dominantCategory];
  if (!persona) {
    console.error('[Quiz] Persona not found:', dominantCategory);
    renderQuiz();
    return;
  }
  
  container.innerHTML = `
    <div class="text-center animate-fade-in" role="region" aria-label="Quiz results">
      <div class="text-6xl mb-6" aria-hidden="true">${persona.name.split(' ').pop()}</div>
      <h3 class="text-3xl font-bold mb-4">${sanitizeHTML(persona.name)}</h3>
      <p class="text-gray-600 dark:text-gray-300 mb-4">${sanitizeHTML(persona.description)}</p>
      <div class="bg-purple-50 dark:bg-purple-900/20 rounded-xl p-6 mb-6">
        <h4 class="font-bold text-purple-600 dark:text-purple-400 mb-2">Your Ideal Role:</h4>
        <p class="text-2xl font-bold text-gray-800 dark:text-gray-200 mb-2">${sanitizeHTML(persona.role)}</p>
        <p class="text-gray-600 dark:text-gray-300">${sanitizeHTML(persona.recommendedPath)}</p>
      </div>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button onclick="shareResults('${dominantCategory}')" 
                class="px-6 py-3 bg-indigo-600 text-white rounded-full font-semibold hover:bg-indigo-700 transition-all min-h-[44px] focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          📤 Share Results
        </button>
        <button onclick="copyResultLink('${dominantCategory}')" 
                class="px-6 py-3 bg-gray-600 text-white rounded-full font-semibold hover:bg-gray-700 transition-all min-h-[44px] focus:ring-2 focus:ring-gray-500 focus:ring-offset-2">
          🔗 Copy Link
        </button>
        <button onclick="retakeQuiz()" 
                class="px-6 py-3 bg-purple-600 text-white rounded-full font-semibold hover:bg-purple-700 transition-all min-h-[44px] focus:ring-2 focus:ring-purple-500 focus:ring-offset-2">
          🔄 Retake Quiz
        </button>
      </div>
    </div>
  `;

  if (typeof toast !== 'undefined' && toast.success) {
    toast.success(`You're ${persona.role}! 🎉`, 4000);
  }
}

/**
 * Share quiz results
 * @param {string} personaType - Persona type
 */
function shareResults(personaType) {
  const persona = personas[personaType];
  const shareUrl = `${window.location.origin}${window.location.pathname}?result=${personaType}`;
  const shareText = `I'm ${persona.name} - ${persona.role}! Take the UIVerse quiz to discover your design personality.`;
  
  if (navigator.share) {
    navigator.share({
      title: 'My UIVerse Design Personality',
      text: shareText,
      url: shareUrl,
    }).catch(() => {
      copyToClipboard(shareText + ' ' + shareUrl).then(success => {
        if (success && typeof toast !== 'undefined') {
          toast.success('Results copied to clipboard!', 3000);
        }
      });
    });
  } else {
    copyToClipboard(shareText + ' ' + shareUrl).then(success => {
      if (success && typeof toast !== 'undefined') {
        toast.success('Results copied to clipboard!', 3000);
      }
    });
  }
}

/**
 * Copy result link to clipboard
 * @param {string} personaType - Persona type
 */
function copyResultLink(personaType) {
  const shareUrl = `${window.location.origin}${window.location.pathname}?result=${personaType}`;
  copyToClipboard(shareUrl).then(success => {
    if (success && typeof toast !== 'undefined') {
      toast.success('Link copied! Share it with friends.', 3000);
    }
  });
}

/**
 * Retake the quiz
 */
function retakeQuiz() {
  console.log('[Quiz] Retaking quiz...');
  currentQuestion = 0;
  answers = [];
  // Clear URL param
  const url = new URL(window.location);
  url.searchParams.delete('result');
  window.history.replaceState(null, '', url);
  renderQuiz();
}