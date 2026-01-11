// Security validation utilities for Instructo POC
// This module provides functions to check for prompt injection patterns and hidden characters

// Prompt injection patterns to check for
export const INJECTION_PATTERNS = [
  /ignore\s+(?:all\s+)?previous\s+instructions?/i,
  /forget\s+(?:all\s+)?previous\s+(?:instructions?|rules)/i,
  /system\s+prompt/i,
  /override\s+(?:the\s+)?system/i,
  /new\s+important\s+instruction/i,
  /bypass\s+(?:the\s+)?restriction/i,
  /jailbreak/i,
  /developer\s+mode/i,
  /admin\s+mode/i,
  /unrestricted/i,
  /uncensored/i,
  /DAN\s+mode/i, // Common jailbreak persona
  /assistant.*override/i,
];

// Suspicious hidden characters (zero-width and other invisible characters)
export const HIDDEN_CHAR_PATTERNS = [
  /\u200B/g, // Zero-width space
  /\u200C/g, // Zero-width non-joiner
  /\u200D/g, // Zero-width joiner
  /\u200E/g, // Left-to-right mark
  /\u200F/g, // Right-to-left mark
  /\u202A/g, // Left-to-right embedding
  /\u202B/g, // Right-to-left embedding
  /\u202C/g, // Pop directional formatting
  /\u202D/g, // Left-to-right override
  /\u202E/g, // Right-to-left override
  /\uFEFF/g, // Zero-width no-break space (BOM)
  /\u00AD/g, // Soft hyphen
  // biome-ignore lint/suspicious/noControlCharactersInRegex: Control characters are intentionally checked for security
  /[\u0000-\u0008\u000B-\u000C\u000E-\u001F\u007F-\u009F]/g, // Control characters (excluding \t \n \r)
];

/**
 * Checks text for prompt injection patterns and hidden characters
 * @param {string} text - The text to check
 * @returns {string[]} Array of detected security issues
 */
export function checkContentSecurity(text) {
  const matches = [];
  for (const pattern of INJECTION_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      matches.push(`Injection pattern: ${match[0]}`);
    }
  }
  for (const pattern of HIDDEN_CHAR_PATTERNS) {
    const match = text.match(pattern);
    if (match) {
      matches.push(
        `Hidden character detected: ${match[0]} (Unicode: U+${match[0].codePointAt(0).toString(16).toUpperCase()})`,
      );
    }
  }
  return matches;
}
