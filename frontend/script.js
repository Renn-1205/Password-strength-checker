// DOM Elements
const passwordInput = document.getElementById('password');
const toggleBtn = document.getElementById('toggle-visibility');
const copyBtn = document.getElementById('copy-btn');
const strengthText = document.getElementById('strength-text');
const strengthBar = document.getElementById('strength-bar');
const lengthStatus = document.getElementById('length-status');
const typesStatus = document.getElementById('types-status');
const complexityStatus = document.getElementById('complexity-status');

// Requirement elements
const reqLength = document.getElementById('req-length');
const reqUppercase = document.getElementById('req-uppercase');
const reqLowercase = document.getElementById('req-lowercase');
const reqNumbers = document.getElementById('req-numbers');
const reqSpecial = document.getElementById('req-special');
const reqNoSeq = document.getElementById('req-no-seq');
const reqNoRepeat = document.getElementById('req-no-repeat');
const reqNoCommon = document.getElementById('req-no-common');

// API Configuration
// For local development: 'http://localhost:3000'
// For production: Replace with your deployed backend URL (e.g., 'https://your-backend.onrender.com')
const API_BASE_URL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? 'http://localhost:3000'
  : 'https://password-strength-checker-8.onrender.com';

// Debounce function to limit API calls
function debounce(func, wait) {
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

// Real-time password checking with debounce
passwordInput.addEventListener('input', debounce(checkPassword, 300));

// Copy button functionality
copyBtn.addEventListener('click', async function() {
  const password = passwordInput.value;
  if (!password) return;

  try {
    await navigator.clipboard.writeText(password);
    showButtonSuccess(this);
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = password;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    showButtonSuccess(this);
  }
});

// Main password checking function - calls backend API
async function checkPassword() {
  const password = passwordInput.value;
  
  // Handle empty password locally for instant feedback
  if (password.length === 0) {
    updateStrengthMeter(0, 'None', '#666666');
    updateAnalysis(0, 0, 'Low');
    updateRequirements({
      length: false,
      uppercase: false,
      lowercase: false,
      numbers: false,
      special: false,
      noSequence: true,
      noRepeat: true,
      noCommon: true
    });
    copyBtn.disabled = true;
    return;
  }

  try {
    const response = await fetch(`${API_BASE_URL}/check-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ password }),
    });

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();

    // Update UI with API response
    updateStrengthMeter(data.strength, data.strengthText, data.strengthColor);
    updateAnalysis(data.analysis.length, data.analysis.charTypes, data.analysis.complexity);
    updateRequirements(data.requirements);
    copyBtn.disabled = false;

  } catch (error) {
    console.error('Error checking password:', error);
    // Show error state - backend is required
    showApiError();
  }
}

// Show error when API is unavailable
function showApiError() {
  updateStrengthMeter(0, 'Server Offline', '#ff4757');
  updateAnalysis(0, 0, 'N/A');
  updateRequirements({
    length: false,
    uppercase: false,
    lowercase: false,
    numbers: false,
    special: false,
    noSequence: false,
    noRepeat: false,
    noCommon: false
  });
  copyBtn.disabled = true;
}

// Update the visual strength meter
function updateStrengthMeter(strength, text, color) {
  strengthText.textContent = text;
  strengthText.style.color = color;
  strengthBar.style.width = `${strength * 10}%`;
  strengthBar.style.background = color;
}

// Update analysis section
function updateAnalysis(length, charTypes, complexity) {
  // Length status
  lengthStatus.textContent = `${length}/12`;
  lengthStatus.style.color = length >= 12 ? '#2ed573' : '#666666';

  // Character types status
  typesStatus.textContent = `${charTypes}/4`;
  typesStatus.style.color = charTypes === 4 ? '#2ed573' : charTypes >= 2 ? '#ffa726' : '#666666';

  // Complexity status
  complexityStatus.textContent = complexity;
  complexityStatus.style.color = complexity === 'High' ? '#2ed573' : complexity === 'Medium' ? '#ffa726' : '#666666';
}

// Update requirements display
function updateRequirements(requirements) {
  const reqMap = {
    length: reqLength,
    uppercase: reqUppercase,
    lowercase: reqLowercase,
    numbers: reqNumbers,
    special: reqSpecial,
    noSequence: reqNoSeq,
    noRepeat: reqNoRepeat,
    noCommon: reqNoCommon
  };

  for (const [key, element] of Object.entries(reqMap)) {
    if (requirements[key]) {
      element.classList.add('met');
      element.classList.remove('partial');
    } else {
      element.classList.remove('met', 'partial');
    }
  }
}

// Helper function to show button success feedback
function showButtonSuccess(button) {
  const originalHTML = button.innerHTML;
  button.innerHTML = `<span class="btn-icon">✓</span>`;
  button.classList.add('success');

  setTimeout(() => {
    button.innerHTML = originalHTML;
    button.classList.remove('success');
  }, 2000);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  checkPassword(); // Check empty password initially
});