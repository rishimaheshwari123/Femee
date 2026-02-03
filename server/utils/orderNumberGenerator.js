const Counter = require("../models/Counter");
const crypto = require("crypto");

/**
 * Encrypt sequential number to random-looking code
 * Uses simple character mapping for obfuscation
 * @param {number} sequenceNumber - Sequential number (1, 2, 3...)
 * @returns {string} Encrypted code (e.g., "7A2K9")
 */
const encryptSequence = (sequenceNumber) => {
  // Character mapping for obfuscation (not real encryption, just scrambling)
  const charMap = {
    '0': 'K', '1': 'M', '2': 'P', '3': 'R', '4': 'T',
    '5': 'W', '6': 'X', '7': 'Y', '8': 'Z', '9': 'A'
  };
  
  // Add random salt based on number
  const salt = (sequenceNumber * 7 + 13) % 100; // Simple algorithm
  const combined = `${sequenceNumber}${salt}`;
  
  // Convert to scrambled format
  let encrypted = '';
  for (let char of combined) {
    encrypted += charMap[char] || char;
  }
  
  // Add random letters between digits for more obfuscation
  const letters = 'BCDFGHJLNQSV'; // Consonants
  let result = '';
  for (let i = 0; i < encrypted.length; i++) {
    result += encrypted[i];
    if (i < encrypted.length - 1) {
      const randomLetter = letters[Math.floor(Math.random() * letters.length)];
      result += randomLetter;
    }
  }
  
  return result.substring(0, 6).toUpperCase(); // Limit to 6 chars
};

/**
 * Generate order number with both sequential and encrypted format
 * Sequential: For admin tracking (1, 2, 3...)
 * Encrypted: For customer display (FEME-7A2K9)
 * @returns {Promise<Object>} { sequenceNumber, displayNumber }
 */
const generateOrderNumber = async () => {
  try {
    // Find and increment the counter atomically
    const counter = await Counter.findByIdAndUpdate(
      { _id: "orderNumber" },
      { $inc: { sequence_value: 1 } },
      { new: true, upsert: true }
    );

    const sequenceNumber = counter.sequence_value;
    
    // Generate encrypted display number
    const encryptedCode = encryptSequence(sequenceNumber);
    const displayNumber = `FCH026/${encryptedCode}`;
    
    console.log(`Order generated: Sequence=${sequenceNumber}, Display=${displayNumber}`);
    
    return {
      sequenceNumber: sequenceNumber,        // For admin: 1, 2, 3...
      displayNumber: displayNumber,          // For customer: FEME-7A2K9
      internalNumber: `FCH026/${String(sequenceNumber).padStart(4, "0")}` // FEME-0001 (optional)
    };
  } catch (error) {
    console.error("Error generating order number:", error);
    throw new Error("Failed to generate order number");
  }
};

/**
 * Get current order number count
 * @returns {Promise<number>} Current count
 */
const getCurrentOrderCount = async () => {
  try {
    const counter = await Counter.findById("orderNumber");
    return counter ? counter.sequence_value : 0;
  } catch (error) {
    console.error("Error getting order count:", error);
    return 0;
  }
};

/**
 * Reset order number counter (use with caution!)
 * @param {number} value - Value to reset to (default: 0)
 * @returns {Promise<boolean>}
 */
const resetOrderCounter = async (value = 0) => {
  try {
    await Counter.findByIdAndUpdate(
      { _id: "orderNumber" },
      { sequence_value: value },
      { upsert: true }
    );
    return true;
  } catch (error) {
    console.error("Error resetting order counter:", error);
    return false;
  }
};

module.exports = {
  generateOrderNumber,
  getCurrentOrderCount,
  resetOrderCounter,
};
