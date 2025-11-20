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
 * Returns Korean-only text by removing all English text
 * Format: "한글 (English text)" -> "한글"
 */
export function formatBilingualText(text: string): string {
  // Always return Korean only
  return extractKorean(text);
}

/**
 * Formats bilingual error message - removes all English text
 * Returns Korean only
 */
export function formatBilingualError(text: string): string {
  // Always return Korean only
  return extractKorean(text);
}

