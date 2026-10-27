const { v4: uuidv4 } = require('uuid');

/**
 * Generate a unique reference code with a prefix
 * @param {string} prefix - e.g., 'REG', 'ABS', 'PAY'
 * @returns {string} - e.g., 'REG-2026-A1B2C3'
 */
const generateRef = (prefix = 'REF') => {
  const shortId = uuidv4().split('-')[0].toUpperCase();
  return `${prefix}-2026-${shortId}`;
};

/**
 * Count words in a text string, normalizing whitespace
 */
const countWords = (text) => {
  if (!text || typeof text !== 'string') return 0;
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
};

/**
 * Sanitize filename for safe storage
 */
const sanitizeFilename = (filename) => {
  return filename
    .replace(/[^a-zA-Z0-9._-]/g, '_')
    .replace(/_{2,}/g, '_')
    .substring(0, 200);
};

module.exports = { generateRef, countWords, sanitizeFilename };
