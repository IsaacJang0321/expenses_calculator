/**
 * Counts English words in a text string
 * English words are defined as sequences of letters (a-z, A-Z)
 */
function countEnglishWords(text: string): number {
  const englishWordPattern = /\b[a-zA-Z]+\b/g;
  const matches = text.match(englishWordPattern);
  return matches ? matches.length : 0;
}

/**
 * Extracts Korean text from a bilingual string
 * Format: "한글 (English text)" or "한글 English text"
 */
function extractKorean(text: string): string {
  // Remove content in parentheses (English translations)
  let korean = text.replace(/\s*\([^)]*\)/g, '');
  
  // Remove standalone English words at the end
  korean = korean.replace(/\s+[a-zA-Z\s]+$/, '');
  
  return korean.trim();
}

/**
 * Returns Korean-only text if English word count is more than 1
 * Otherwise returns the original bilingual text
 */
export function formatBilingualText(text: string): string {
  const englishWordCount = countEnglishWords(text);
  
  // If more than 1 English word, return Korean only
  if (englishWordCount > 1) {
    return extractKorean(text);
  }
  
  return text;
}

/**
 * Formats bilingual error message - removes English if more than 1 word
 * Returns Korean only if English word count > 1, otherwise returns original
 */
export function formatBilingualError(text: string): string {
  const englishWordCount = countEnglishWords(text);
  
  // If more than 1 English word, return Korean only
  if (englishWordCount > 1) {
    return extractKorean(text);
  }
  
  // Otherwise return original text
  return text;
}

