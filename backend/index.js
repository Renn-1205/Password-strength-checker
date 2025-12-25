const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files from the frontend directory
app.use(express.static(path.join(__dirname, "../frontend")));

// Common dictionary words to check against
const commonWords = [
  'password', 'password1', '123456', '123456789', 'qwerty', 'abc123',
  'password123', 'admin', 'letmein', 'welcome', 'monkey', '1234567890',
  'iloveyou', 'princess', 'rockyou', '1234567', '12345678', 'password12',
  'qwerty123', '1q2w3e4r', 'baseball', 'football', 'soccer', 'hockey',
  'basketball', 'tennis', 'golf', 'swimming', 'volleyball', 'rugby'
];

// Helper function to check for sequential characters
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

// Helper function to check for repeated characters
function hasRepeatedChars(password) {
  for (let i = 0; i < password.length - 2; i++) {
    if (password[i] === password[i + 1] && password[i] === password[i + 2]) {
      return true;
    }
  }
  return false;
}

// Helper function to check for common words
function containsCommonWord(password) {
  const lowerPass = password.toLowerCase();
  return commonWords.some(word => lowerPass.includes(word));
}

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

// Password strength API
app.post("/check-password", (req, res) => {
  const { password } = req.body;

  if (!password) {
    return res.json({
      strength: 0,
      strengthText: 'None',
      strengthColor: '#666666',
      requirements: {
        length: false,
        uppercase: false,
        lowercase: false,
        numbers: false,
        special: false,
        noSequence: true,
        noRepeat: true,
        noCommon: true
      },
      analysis: {
        length: 0,
        charTypes: 0,
        complexity: 'Low'
      }
    });
  }

  let strength = 0;

  // Check requirements
  const requirements = {
    length: password.length >= 12,
    uppercase: (password.match(/[A-Z]/g) || []).length >= 2,
    lowercase: (password.match(/[a-z]/g) || []).length >= 2,
    numbers: (password.match(/[0-9]/g) || []).length >= 2,
    special: (password.match(/[^A-Za-z0-9]/g) || []).length >= 2,
    noSequence: !hasSequentialChars(password),
    noRepeat: !hasRepeatedChars(password),
    noCommon: !containsCommonWord(password)
  };

  // Calculate strength points
  if (requirements.length) strength += 2;
  if (requirements.uppercase) strength += 1;
  if (requirements.lowercase) strength += 1;
  if (requirements.numbers) strength += 1;
  if (requirements.special) strength += 1;
  if (requirements.noSequence) strength += 1;
  if (requirements.noRepeat) strength += 1;
  if (requirements.noCommon) strength += 2;

  // Bonus points for length
  if (password.length >= 16) strength += 1;
  if (password.length >= 20) strength += 1;

  // Bonus for using all character types
  const charTypes = [
    /[A-Z]/.test(password),
    /[a-z]/.test(password),
    /[0-9]/.test(password),
    /[^A-Za-z0-9]/.test(password)
  ].filter(Boolean).length;

  if (charTypes === 4) strength += 1;

  // Cap strength at 10
  strength = Math.min(strength, 10);

  // Get strength config
  const config = strengthConfig[strength] || strengthConfig[0];

  // Calculate complexity
  let complexity = 'Low';
  if (strength >= 7) complexity = 'High';
  else if (strength >= 4) complexity = 'Medium';

  res.json({
    strength,
    strengthText: config.text,
    strengthColor: config.color,
    requirements,
    analysis: {
      length: password.length,
      charTypes,
      complexity
    }
  });
});

// Add a simple GET route for the root path (API info)
app.get("/api", (req, res) => {
  res.json({
    message: "Password Strength Checker API is running! 🎉",
    endpoints: {
      "POST /check-password": "Check password strength (send {password: 'yourpassword'} in JSON body)"
    }
  });
});

// Serve frontend for any other route
/* app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../frontend/index.html"));
}); */

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server run on http://localhost:${PORT}`);
});