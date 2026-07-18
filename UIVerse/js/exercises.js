/**
 * exercises.js - Interactive design exercises
 * @module exercises
 */

document.addEventListener('DOMContentLoaded', () => {
  try { initContrastChecker(); } catch(e) { console.error('Contrast checker init error:', e); }
  try { initTypographyScale(); } catch(e) { console.error('Typography scale init error:', e); }
  try { initUXExercise(); } catch(e) { console.error('UX exercise init error:', e); }
});

// ==================== CONTRAST CHECKER ====================

/**
 * Initialize color contrast checker with modern UI
 */
function initContrastChecker() {
  const textColor = document.getElementById('contrastText');
  const textHex = document.getElementById('contrastTextHex');
  const bgColor = document.getElementById('contrastBg');
  const bgHex = document.getElementById('contrastBgHex');
  const preview = document.getElementById('contrastPreview');
  const ratioDisplay = document.getElementById('contrastRatio');
  const ratingDisplay = document.getElementById('contrastRating');
  const swapBtn = document.getElementById('swapColors');
  const randomBtn = document.getElementById('randomColors');

  if (!textColor || !bgColor) return;

  function updateContrast() {
    const text = textColor.value;
    const bg = bgColor.value;
    
    // Update hex inputs
    textHex.value = text;
    bgHex.value = bg;
    
    // Update preview
    preview.style.color = text;
    preview.style.backgroundColor = bg;
    
    // Calculate contrast ratio
    const ratio = getContrastRatio(text, bg);
    ratioDisplay.textContent = ratio.toFixed(2);
    
    // Determine WCAG rating with modern styling
    let rating, ratingClass, ratingBg;
    if (ratio >= 7) {
      rating = 'AAA ✓';
      ratingClass = 'text-green-600';
      ratingBg = 'bg-green-100 dark:bg-green-900/30';
    } else if (ratio >= 4.5) {
      rating = 'AA ✓';
      ratingClass = 'text-green-600';
      ratingBg = 'bg-green-100 dark:bg-green-900/30';
    } else if (ratio >= 3) {
      rating = 'AA Large ⚠️';
      ratingClass = 'text-yellow-600';
      ratingBg = 'bg-yellow-100 dark:bg-yellow-900/30';
    } else {
      rating = 'Fail ✗';
      ratingClass = 'text-red-600';
      ratingBg = 'bg-red-100 dark:bg-red-900/30';
    }
    
    ratingDisplay.textContent = rating;
    ratingDisplay.className = `text-3xl font-bold ${ratingClass} px-4 py-2 rounded-lg ${ratingBg}`;
  }

  // Color picker events
  textColor.addEventListener('input', updateContrast);
  bgColor.addEventListener('input', updateContrast);
  
  // Hex input events with real-time validation
  textHex.addEventListener('input', (e) => {
    const hex = e.target.value;
    if (isValidHex(hex)) {
      textColor.value = hex;
      updateContrast();
    }
  });
  
  bgHex.addEventListener('input', (e) => {
    const hex = e.target.value;
    if (isValidHex(hex)) {
      bgColor.value = hex;
      updateContrast();
    }
  });

  // Swap colors button
  if (swapBtn) {
    swapBtn.addEventListener('click', () => {
      const temp = textColor.value;
      textColor.value = bgColor.value;
      bgColor.value = temp;
      updateContrast();
    });
  }

  // Random colors button
  if (randomBtn) {
    randomBtn.addEventListener('click', () => {
      const randomText = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
      const randomBg = '#' + Math.floor(Math.random()*16777215).toString(16).padStart(6, '0');
      textColor.value = randomText;
      bgColor.value = randomBg;
      updateContrast();
    });
  }

  // Copy colors button
  const copyBtn = document.getElementById('copyColors');
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const text = textColor.value;
      const bg = bgColor.value;
      const ratio = ratioDisplay.textContent;
      const rating = ratingDisplay.textContent;
      const textToCopy = `Text: ${text}\nBackground: ${bg}\nContrast Ratio: ${ratio}:1\nWCAG: ${rating}`;
      copyToClipboard(textToCopy);
    });
  }

  // Initial calculation
  updateContrast();
}

/**
 * Check if string is valid hex color
 * @param {string} hex - Hex string
 * @returns {boolean} Is valid
 */
function isValidHex(hex) {
  return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex);
}

/**
 * Calculate relative luminance of a color
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {number} Luminance
 */
function getLuminance(r, g, b) {
  const [rs, gs, bs] = [r, g, b].map(c => {
    c = c / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * rs + 0.7152 * gs + 0.0722 * bs;
}

/**
 * Calculate contrast ratio between two colors
 * @param {string} hex1 - First hex color
 * @param {string} hex2 - Second hex color
 * @returns {number} Contrast ratio
 */
function getContrastRatio(hex1, hex2) {
  const rgb1 = hexToRgb(hex1);
  const rgb2 = hexToRgb(hex2);
  
  if (!rgb1 || !rgb2) return 0;
  
  const lum1 = getLuminance(rgb1.r, rgb1.g, rgb1.b);
  const lum2 = getLuminance(rgb2.r, rgb2.g, rgb2.b);
  
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  
  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Convert hex to RGB
 * @param {string} hex - Hex color
 * @returns {Object|null} RGB object
 */
function hexToRgb(hex) {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result ? {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  } : null;
}

// ==================== TYPOGRAPHY SCALE GENERATOR ====================

/**
 * Initialize typography scale generator
 */
function initTypographyScale() {
  const baseFontSize = document.getElementById('baseFontSize');
  const scaleRatio = document.getElementById('scaleRatio');
  const preview = document.getElementById('typographyPreview');
  const copyBtn = document.getElementById('copyTypography');

  if (!baseFontSize || !scaleRatio || !preview) return;

  function generateScale() {
    const base = parseInt(baseFontSize.value) || 16;
    const ratio = parseFloat(scaleRatio.value) || 1.414;
    
    const scale = {
      h1: Math.round(base * Math.pow(ratio, 5)),
      h2: Math.round(base * Math.pow(ratio, 4)),
      h3: Math.round(base * Math.pow(ratio, 3)),
      h4: Math.round(base * Math.pow(ratio, 2)),
      h5: Math.round(base * Math.pow(ratio, 1)),
      body: base,
      small: Math.round(base * Math.pow(ratio, -1))
    };

    preview.innerHTML = `
      <div class="border-l-4 border-purple-600 pl-4 mb-4">
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Heading 1</p>
        <p style="font-size: ${scale.h1}px; line-height: 1.2;" class="font-bold m-0">The quick brown fox</p>
      </div>
      <div class="border-l-4 border-indigo-600 pl-4 mb-4">
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Heading 2</p>
        <p style="font-size: ${scale.h2}px; line-height: 1.3;" class="font-bold m-0">The quick brown fox</p>
      </div>
      <div class="border-l-4 border-pink-600 pl-4 mb-4">
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Heading 3</p>
        <p style="font-size: ${scale.h3}px; line-height: 1.4;" class="font-bold m-0">The quick brown fox</p>
      </div>
      <div class="border-l-4 border-green-600 pl-4 mb-4">
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Body Text</p>
        <p style="font-size: ${scale.body}px; line-height: 1.6;" class="m-0">The quick brown fox jumps over the lazy dog</p>
      </div>
      <div class="border-l-4 border-yellow-600 pl-4">
        <p class="text-sm text-gray-500 dark:text-gray-400 mb-1">Small Text</p>
        <p style="font-size: ${scale.small}px; line-height: 1.5;" class="m-0">The quick brown fox</p>
      </div>
    `;
  }

  // Event listeners
  baseFontSize.addEventListener('input', generateScale);
  scaleRatio.addEventListener('change', generateScale);

  // Copy to clipboard
  if (copyBtn) {
    copyBtn.addEventListener('click', () => {
      const base = parseInt(baseFontSize.value) || 16;
      const ratio = parseFloat(scaleRatio.value) || 1.414;
      const css = `/* Typography Scale - Base: ${base}px, Ratio: ${ratio} */
--font-size-h1: ${Math.round(base * Math.pow(ratio, 5))}px;
--font-size-h2: ${Math.round(base * Math.pow(ratio, 4))}px;
--font-size-h3: ${Math.round(base * Math.pow(ratio, 3))}px;
--font-size-h4: ${Math.round(base * Math.pow(ratio, 2))}px;
--font-size-h5: ${Math.round(base * Math.pow(ratio, 1))}px;
--font-size-body: ${base}px;
--font-size-small: ${Math.round(base * Math.pow(ratio, -1))}px;`;
      copyToClipboard(css);
    });
  }

  // Initial generation
  generateScale();
}

// ==================== SPOT THE UX ISSUE ====================

const uxExercises = [
  {
    title: 'Button Contrast',
    optionA: { label: 'Click Me', style: 'background:#ccc;color:#999;padding:8px 16px;border-radius:4px;border:none;font-size:14px;cursor:pointer;' },
    optionB: { label: 'Click Me', style: 'background:#9333ea;color:#fff;padding:12px 24px;border-radius:8px;border:none;font-size:16px;font-weight:600;cursor:pointer;box-shadow:0 4px 12px rgba(147,51,234,0.3);' },
    correct: 'B',
    explanation: 'The right button has better contrast (purple on white), larger touch target (44px min), clear visual hierarchy, and a shadow for affordance.'
  },
  {
    title: 'Form Labels',
    optionA: { label: 'Email:\n[          ]', style: 'font-size:12px;color:#666;' },
    optionB: { label: 'Email Address\n[                    ]', style: 'font-size:16px;color:#333;font-weight:500;' },
    correct: 'B',
    explanation: 'The right form has a descriptive label, larger readable text, and adequate input size. The left uses a vague abbreviation and tiny text.'
  },
  {
    title: 'Error Messages',
    optionA: { label: 'Error!\n[Retry]', style: 'color:red;font-size:12px;' },
    optionB: { label: 'Unable to save. Check your connection and try again.\n[Try Again]', style: 'color:#dc2626;font-size:14px;line-height:1.5;padding:12px;background:#fef2f2;border-radius:8px;' },
    correct: 'B',
    explanation: 'The right error explains what went wrong AND how to fix it. The left just says "Error!" with no helpful context.'
  },
  {
    title: 'Navigation Menu',
    optionA: { label: 'Home\nAbout\nServices\nContact', style: 'display:flex;flex-direction:column;font-size:14px;color:#333;' },
    optionB: { label: 'Home\nAbout\nServices\nContact', style: 'display:flex;flex-direction:column;font-size:16px;color:#111827;padding:8px 0;border-bottom:2px solid #e5e7eb;' },
    correct: 'B',
    explanation: 'The right navigation has better spacing, larger text, and a clear visual indicator (border) showing the current page.'
  },
  {
    title: 'Card Design',
    optionA: { label: 'Product\n$99\n[Buy Now]', style: 'border:1px solid #ddd;padding:12px;border-radius:4px;' },
    optionB: { label: 'Product\n$99\n[Buy Now]', style: 'border:1px solid #e5e7eb;padding:20px;border-radius:12px;box-shadow:0 4px 6px rgba(0,0,0,0.1);' },
    correct: 'B',
    explanation: 'The right card has better padding, rounded corners, and a subtle shadow creating visual depth and hierarchy.'
  },
  {
    title: 'Search Input',
    optionA: { label: '[🔍 Search...]', style: 'width:100%;padding:6px 10px;border:1px solid #ccc;border-radius:4px;font-size:12px;' },
    optionB: { label: '[🔍 Search products, articles, or help...]', style: 'width:100%;padding:12px 16px;border:2px solid #d1d5db;border-radius:8px;font-size:16px;outline:none;' },
    correct: 'B',
    explanation: 'The right search has better placeholder text, larger touch target, thicker border, and proper focus state.'
  }
];

let currentUXExercise = 0;

/**
 * Initialize UX exercise
 */
function initUXExercise() {
  renderUXExercise();
}

/**
 * Render current UX exercise
 */
function renderUXExercise() {
  const container = document.getElementById('uxExerciseContainer');
  const feedback = document.getElementById('uxExerciseFeedback');
  if (!container) return;

  const exercise = uxExercises[currentUXExercise];
  
  // Hide feedback
  if (feedback) feedback.classList.add('hidden');

  container.innerHTML = `
    <button onclick="selectUXOption('A')" 
            class="ux-option w-full p-8 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-400 transition-all text-left min-h-[120px]"
            aria-label="Option A: ${exercise.title}"
            data-option="A">
      <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Option A</p>
      <div style="${exercise.optionA.style};display:inline-block;">
        ${exercise.optionA.label.replace(/\n/g, '<br>')}
      </div>
    </button>
    
    <button onclick="selectUXOption('B')" 
            class="ux-option w-full p-8 rounded-xl border-2 border-gray-200 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-400 transition-all text-left min-h-[120px]"
            aria-label="Option B: ${exercise.title}"
            data-option="B">
      <p class="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">Option B</p>
      <div style="${exercise.optionB.style};display:inline-block;">
        ${exercise.optionB.label.replace(/\n/g, '<br>')}
      </div>
    </button>
    `;
}

/**
 * Handle UX option selection
 * @param {string} option - Selected option ('A' or 'B')
 */
function selectUXOption(option) {
  const exercise = uxExercises[currentUXExercise];
  const feedback = document.getElementById('uxExerciseFeedback');
  const feedbackTitle = document.getElementById('uxFeedbackTitle');
  const feedbackText = document.getElementById('uxFeedbackText');
  
  if (!feedback || !feedbackTitle || !feedbackText) return;

  const isCorrect = option === exercise.correct;
  
  // Disable buttons
  document.querySelectorAll('.ux-option').forEach(btn => {
    btn.disabled = true;
    btn.style.pointerEvents = 'none';
    const btnOption = btn.getAttribute('data-option');
    if (btnOption === exercise.correct) {
      btn.classList.add('border-green-500', 'bg-green-50', 'dark:bg-green-900/10');
    } else if (btnOption === option && !isCorrect) {
      btn.classList.add('border-red-500', 'bg-red-50', 'dark:bg-red-900/10');
    }
  });

  // Show feedback
  feedback.classList.remove('hidden');
  feedbackTitle.textContent = isCorrect ? 'Correct! 🎉' : 'Not quite! 🤔';
  feedbackTitle.className = isCorrect 
    ? 'text-green-800 dark:text-green-200 font-semibold text-lg mb-2'
    : 'text-yellow-800 dark:text-yellow-200 font-semibold text-lg mb-2';
  feedbackText.textContent = exercise.explanation;
  
  // Update feedback container colors
  const feedbackContainer = feedback.querySelector('div:first-child');
  if (feedbackContainer) {
    feedbackContainer.className = isCorrect
      ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-xl p-6'
      : 'bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-xl p-6';
  }
}

/**
 * Load next UX exercise
 */
function nextUXExercise() {
  currentUXExercise = (currentUXExercise + 1) % uxExercises.length;
  renderUXExercise();
}