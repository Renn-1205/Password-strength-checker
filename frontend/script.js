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

// Common dictionary words to check against
const commonWords = [
  'password', 'password1', '123456', '123456789', 'qwerty', 'abc123',
  'password123', 'admin', 'letmein', 'welcome', 'monkey', '1234567890',
  'iloveyou', 'princess', 'rockyou', '1234567', '12345678', 'password12',
  'qwerty123', '1q2w3e4r', 'baseball', 'football', 'soccer', 'hockey',
  'basketball', 'tennis', 'golf', 'swimming', 'volleyball', 'rugby'
];

// Password strength configurations (0-10 scale)
const strengthConfig = {
  0: { text: 'None', color: '#666666' },
  1: { text: 'Very Weak', color: '#ff4757' },
  2: { text: 'Weak', color: '#ff4757' },
  3: { text: 'Poor', color: '#ff6348' },
  4: { text: 'Fair', color: '#ffa726' },
  5: { text: 'Moderate', color: '#ffa726' },
  6: { text: 'Good', color: '#2ed573' },
  7: { text: 'Strong', color: '#2ed573' },
  8: { text: 'Very Strong', color: '#3742fa' },
  9: { text: 'Excellent', color: '#3742fa' },
  10: { text: 'Fortress', color: '#9c88ff' }
};

// Real-time password checking
passwordInput.addEventListener('input', checkPassword);

// Copy button functionality
copyBtn.addEventListener('click', async function() {
  const password = passwordInput.value;
  if (!password) return;

  try {
    await navigator.clipboard.writeText(password);
  } catch (err) {
    // Fallback for older browsers
    const textArea = document.createElement('textarea');
    textArea.value = password;
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
  }
});

// Main password checking function
function checkPassword() {
  const password = passwordInput.value;
  
  // Handle empty password
  if (password.length === 0) {
    updateStrengthMeter(0);
    updateAnalysis(password, 0);
    return;
  }
  
  let strength = 0;

  // Base criteria checks
  const baseCriteria = [
    { element: reqLength, test: password.length >= 12, points: 2 },
    { element: reqUppercase, test: (password.match(/[A-Z]/g) || []).length >= 2, points: 1 },
    { element: reqLowercase, test: (password.match(/[a-z]/g) || []).length >= 2, points: 1 },
    { element: reqNumbers, test: (password.match(/[0-9]/g) || []).length >= 2, points: 1 },
    { element: reqSpecial, test: (password.match(/[^A-Za-z0-9]/g) || []).length >= 2, points: 1 }
  ];

  // Advanced criteria checks
  const advancedCriteria = [
    { element: reqNoSeq, test: !hasSequentialChars(password), points: 1 },
    { element: reqNoRepeat, test: !hasRepeatedChars(password), points: 1 },
    { element: reqNoCommon, test: !containsCommonWord(password), points: 2 }
  ];

  // Check base criteria
  baseCriteria.forEach(criterion => {
    if (criterion.test) {
      criterion.element.classList.add('met');
      criterion.element.classList.remove('partial');
      strength += criterion.points;
    } else {
      criterion.element.classList.remove('met', 'partial');
    }
  });

  // Check advanced criteria
  advancedCriteria.forEach(criterion => {
    if (criterion.test) {
      criterion.element.classList.add('met');
      criterion.element.classList.remove('partial');
      strength += criterion.points;
    } else {
      criterion.element.classList.remove('met', 'partial');
    }
  });

  // Bonus points for length
  if (password.length >= 16) strength += 1;
  if (password.length >= 20) strength += 1;

  // Bonus points for variety
  const charTypes = [
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password)
  ].filter(Boolean).length;

  if (charTypes === 4) strength += 1;

  // Cap strength at 10
  strength = Math.min(strength, 10);

  // Update UI
  updateStrengthMeter(strength);
  updateAnalysis(password, strength);
}

// Helper functions for advanced checks
function hasSequentialChars(password) {
  const sequences = ['abcdefghijklmnopqrstuvwxyz', 'zyxwvutsrqponmlkjihgfedcba', '0123456789', '9876543210'];
  const lowerPass = password.toLowerCase();

  for (let seq of sequences) {
    for (let i = 0; i <= seq.length - 3; i++) {
      const substring = seq.substring(i, i + 3);
      if (lowerPass.includes(substring)) {
        return true;
      }
    }
  }
  return false;
}

function hasRepeatedChars(password) {
  // Check for 3 or more repeated characters
  for (let i = 0; i < password.length - 2; i++) {
    if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
      return true;
    }
  }
  return false;
}

function containsCommonWord(password) {
  const lowerPass = password.toLowerCase();
  return commonWords.some(word => lowerPass.includes(word));
}

// Update the visual strength meter
function updateStrengthMeter(strength) {
  const config = strengthConfig[strength] || strengthConfig[0];
  strengthText.textContent = config.text;
  strengthText.style.color = config.color;
  strengthBar.style.width = `${strength * 10}%`;
  strengthBar.style.background = config.color;
}

// Update analysis section
function updateAnalysis(password, strength) {
  // Length status
  const length = password.length;
  lengthStatus.textContent = `${length}/12`;
  lengthStatus.style.color = length >= 12 ? '#2ed573' : '#666666';

  // Character types status
  const types = [
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password)
  ].filter(Boolean).length;
  typesStatus.textContent = `${types}/4`;
  typesStatus.style.color = types === 4 ? '#2ed573' : types >= 2 ? '#ffa726' : '#666666';

  // Complexity status
  let complexity = 'Low';
  if (strength >= 7) complexity = 'High';
  else if (strength >= 4) complexity = 'Medium';

  complexityStatus.textContent = complexity;
  complexityStatus.style.color = complexity === 'High' ? '#2ed573' : complexity === 'Medium' ? '#ffa726' : '#666666';

  // Enable/disable action buttons
  const hasPassword = password.length > 0;
  copyBtn.disabled = !hasPassword;
}

// Helper function to show button success feedback
function showButtonSuccess(button, message) {
  const originalHTML = button.innerHTML;
  const originalClass = button.className;

  button.innerHTML = `<span class="btn-icon">[OK]</span>`;
  button.className = 'copy-btn success';

  setTimeout(() => {
    button.innerHTML = originalHTML;
    button.className = originalClass;
  }, 2000);
}

// Helper function to get current strength value
function getCurrentStrength() {
  const password = passwordInput.value;
  let strength = 0;

  // Calculate strength (same logic as checkPassword)
  if (password.length >= 12) strength += 2;
  if ((password.match(/[A-Z]/g) || []).length >= 2) strength += 1;
  if ((password.match(/[a-z]/g) || []).length >= 2) strength += 1;
  if ((password.match(/[0-9]/g) || []).length >= 2) strength += 1;
  if ((password.match(/[^A-Za-z0-9]/g) || []).length >= 2) strength += 1;
  if (!hasSequentialChars(password)) strength += 1;
  if (!hasRepeatedChars(password)) strength += 1;
  if (!containsCommonWord(password)) strength += 2;

  if (password.length >= 16) strength += 1;
  if (password.length >= 20) strength += 1;

  const charTypes = [
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password)
  ].filter(Boolean).length;

  if (charTypes === 4) strength += 1;

  return Math.min(strength, 10);
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
  checkPassword(); // Check empty password initially
});
