#!/usr/bin/env node
/**
 * Shared CLI utility functions for modern, consistent output formatting
 * Provides colored box-based output similar to modern CLI tools
 * Uses chalk for terminal colors and styling
 * Uses boxen for beautiful boxed output
 * Automatically detects GitHub Actions environment and uses annotations for better visibility
 */

import chalk from 'chalk';
import boxen from 'boxen';

/**
 * Check if running in GitHub Actions
 * @returns {boolean} True if running in GitHub Actions
 */
function isGitHubActions() {
  return process.env.GITHUB_ACTIONS === 'true';
}

/**
 * Ensure colors are enabled in GitHub Actions
 * GitHub Actions supports ANSI colors, but we need to ensure they're enabled
 */
if (isGitHubActions()) {
  // Force color output in GitHub Actions
  // Chalk will automatically detect this and enable colors
  if (!process.env.FORCE_COLOR) {
    process.env.FORCE_COLOR = '1';
  }
  // Also ensure chalk level is set to support colors
  if (chalk.level === 0) {
    // Force chalk to use colors even if TTY is not detected
    chalk.level = 1; // Basic colors (16 colors)
  }
}

/**
 * Escape message for GitHub Actions annotations
 * GitHub Actions annotations need special characters escaped
 * @param {string} message - Message to escape
 * @returns {string} Escaped message
 */
function escapeGitHubMessage(message) {
  return String(message).replace(/%/g, '%25').replace(/\r/g, '%0D').replace(/\n/g, '%0A');
}

/**
 * Create colored box prefix
 * @param {string} text - Text to display in box
 * @param {string} bgColor - Background color ('bgCyan', 'bgGreen', 'bgYellow', 'bgRed', 'bgBlue')
 * @param {string} textColor - Text color ('black' or 'white')
 * @returns {string} Formatted box string
 */
export function box(text, bgColor = 'bgCyan', textColor = 'black') {
  const bgMap = {
    bgCyan: chalk.bgCyan,
    bgGreen: chalk.bgGreen,
    bgYellow: chalk.bgYellow,
    bgRed: chalk.bgRed,
    bgBlue: chalk.bgBlue,
  };

  const textColorMap = {
    black: chalk.black,
    white: chalk.white,
  };

  const bgFn = bgMap[bgColor] || chalk.bgCyan;
  const textFn = textColorMap[textColor] || chalk.black;

  return bgFn(textFn(` ${text} `));
}

/**
 * Format context in square brackets if provided
 * @param {string|undefined} context - Optional context string
 * @returns {string} Formatted context or empty string
 */
function formatContext(context) {
  return context ? `${chalk.dim(`[${context}]`)} ` : '';
}

/**
 * Print info message with cyan box
 * @param {string} text - Message text
 * @param {string} [context] - Optional context to display in square brackets
 */
export function info(text, context) {
  const contextStr = formatContext(context);
  const message = `${box('INFO', 'bgCyan', 'black')} ${contextStr}${chalk.cyan(text)}`;
  if (isGitHubActions()) {
    // Use ::notice:: for info messages in GitHub Actions
    const fullMessage = context ? `[${context}] ${text}` : text;
    console.log(`::notice::${escapeGitHubMessage(fullMessage)}`);
  }
  console.log(message);
}

/**
 * Print success message with green box
 * @param {string} text - Message text
 * @param {string} [context] - Optional context to display in square brackets
 */
export function success(text, context) {
  const contextStr = formatContext(context);
  const message = `${box('DONE', 'bgGreen', 'black')} ${contextStr}${chalk.green('✓')} ${chalk.green(text)}`;
  // Success messages don't need GitHub Actions annotations, just normal output
  console.log(message);
}

/**
 * Print warning message with yellow box
 * @param {string} text - Message text
 * @param {string} [context] - Optional context to display in square brackets
 */
export function warn(text, context) {
  const contextStr = formatContext(context);
  const message = `${box('WARN', 'bgYellow', 'black')} ${contextStr}${chalk.yellow(text)}`;
  if (isGitHubActions()) {
    // Use ::warning:: for warnings in GitHub Actions
    const fullMessage = context ? `[${context}] ${text}` : text;
    console.log(`::warning::${escapeGitHubMessage(fullMessage)}`);
  }
  console.log(message);
}

/**
 * Print error message with red box
 * @param {string} text - Message text
 * @param {string} [context] - Optional context to display in square brackets
 */
export function error(text, context) {
  const contextStr = formatContext(context);
  const message = `${box('ERR', 'bgRed', 'white')} ${contextStr}${chalk.red(text)}`;
  if (isGitHubActions()) {
    // Use ::error:: for errors in GitHub Actions
    const fullMessage = context ? `[${context}] ${text}` : text;
    console.log(`::error::${escapeGitHubMessage(fullMessage)}`);
  }
  console.log(message);
}

/**
 * Print watch/monitor message with blue box
 * @param {string} text - Message text
 * @param {string} [context] - Optional context to display in square brackets
 */
export function watch(text, context) {
  const contextStr = formatContext(context);
  const message = `${box('WATCH', 'bgBlue', 'white')} ${contextStr}${chalk.blue(text)}`;
  // Watch messages use ::notice:: in GitHub Actions
  if (isGitHubActions()) {
    const fullMessage = context ? `[${context}] ${text}` : text;
    console.log(`::notice::${escapeGitHubMessage(fullMessage)}`);
  }
  console.log(message);
}

/**
 * Print custom box message
 * @param {string} label - Box label
 * @param {string} text - Message text
 * @param {string} [bgColor] - Background color ('bgCyan', 'bgGreen', 'bgYellow', 'bgRed', 'bgBlue') (default: 'bgCyan')
 * @param {string} [context] - Optional context to display in square brackets
 */
export function custom(label, text, bgColor = 'bgCyan', context) {
  const contextStr = formatContext(context);
  const message = `${box(label, bgColor, bgColor === 'bgRed' || bgColor === 'bgBlue' ? 'white' : 'black')} ${contextStr}${chalk.cyan(text)}`;
  if (isGitHubActions()) {
    // Map bgColor to appropriate GitHub Actions annotation
    const fullMessage = context ? `[${context}] ${text}` : text;
    if (bgColor === 'bgRed') {
      console.log(`::error::${escapeGitHubMessage(fullMessage)}`);
    } else if (bgColor === 'bgYellow') {
      console.log(`::warning::${escapeGitHubMessage(fullMessage)}`);
    } else {
      console.log(`::notice::${escapeGitHubMessage(fullMessage)}`);
    }
  }
  console.log(message);
}

/**
 * Print header with custom label and description using boxen
 * @param {string} label - Box label
 * @param {string} description - Description text
 * @param {string} bgColor - Background color ('bgCyan', 'bgGreen', 'bgYellow', 'bgRed', 'bgBlue') (default: 'bgCyan')
 */
export function header(label, description, bgColor = 'bgCyan') {
  const colorMap = {
    bgCyan: { borderColor: 'cyan', titleColor: 'cyan' },
    bgGreen: { borderColor: 'green', titleColor: 'green' },
    bgYellow: { borderColor: 'yellow', titleColor: 'yellow' },
    bgRed: { borderColor: 'red', titleColor: 'red' },
    bgBlue: { borderColor: 'blue', titleColor: 'blue' },
  };

  const colors = colorMap[bgColor] || colorMap.bgCyan;

  const boxedMessage = boxen(chalk[colors.titleColor].bold(description), {
    title: label,
    titleAlignment: 'left',
    padding: 1,
    margin: { top: 1, bottom: 1 },
    borderStyle: 'round',
    borderColor: colors.borderColor,
  });

  if (isGitHubActions()) {
    // Use ::group:: for headers in GitHub Actions to create collapsible sections
    console.log(`::group::${escapeGitHubMessage(`${label}: ${description}`)}`);
  }
  console.log(boxedMessage);
}

/**
 * Print a summary box using boxen
 * @param {string} title - Box title
 * @param {string|Array<string>} content - Content to display (string or array of lines)
 * @param {string} borderColor - Border color ('cyan', 'green', 'yellow', 'red', 'blue') (default: 'green')
 */
export function summaryBox(title, content, borderColor = 'green') {
  const contentText = Array.isArray(content) ? content.filter(Boolean).join('\n') : content;

  const boxedMessage = boxen(contentText, {
    title,
    titleAlignment: 'left',
    padding: 1,
    margin: { top: 1, bottom: 1 },
    borderStyle: 'round',
    borderColor,
  });

  console.log(boxedMessage);
}

/**
 * End a GitHub Actions group (should be called after header when done with a section)
 * Only has effect in GitHub Actions
 */
export function endGroup() {
  if (isGitHubActions()) {
    console.log('::endgroup::');
  }
}

/**
 * Print a stat line with label and value
 * @param {string} label - Label text
 * @param {string|number} value - Value to display
 * @param {string} valueColor - Color for value ('green', 'yellow', 'red', 'blue', 'cyan')
 */
export function stat(label, value, valueColor = 'green') {
  const colorFn = chalk[valueColor] || chalk.green;
  console.log(`      ${chalk.dim(`${label}:`)} ${colorFn.bold(value)}`);
}

/**
 * Print a progress line with label, path, and result
 * @param {string} label - Label text to display (e.g., '[OK]', '[SKIP]', '[UPDATE]')
 * @param {string} path - File path
 * @param {string} result - Result text
 * @param {string} labelColor - Color for label (default: 'dim')
 */
export function progress(label, path, result = '', labelColor = 'dim') {
  const labelColorFn = labelColor === 'dim' ? chalk.dim : chalk[labelColor] || chalk.dim;
  const parts = [`      ${labelColorFn(label)}`, chalk.dim(path)];
  if (result) {
    parts.push(chalk.dim('→'), result);
  }
  console.log(parts.join(' '));
}

/**
 * Print a table with headers and rows
 * @param {Array<string>} headers - Array of header column names
 * @param {Array<Array<string|number>>} rows - Array of rows, each row is an array of cell values
 * @param {Object} options - Table options
 * @param {number} options.padding - Padding between columns (default: 2)
 * @param {string} options.headerColor - Color for headers ('cyan', 'green', 'yellow', 'red', 'blue', 'dim') (default: 'cyan')
 * @param {Function} options.rowColor - Function to determine row color: (rowIndex: number, row: Array) => string (optional)
 * @param {boolean} options.border - Show border around table (default: false)
 */
export function table(headers, rows, options = {}) {
  const { padding = 2, headerColor = 'cyan', rowColor = null, border = false } = options;

  if (!headers || headers.length === 0) {
    return;
  }

  // Convert all values to strings and calculate column widths
  const allRows = [headers, ...rows];
  const columnWidths = headers.map((_, colIndex) => {
    return Math.max(
      ...allRows.map((row) => {
        const cell = row[colIndex];
        // Use nullish coalescing to handle 0 and false correctly
        return String(cell ?? '').length;
      })
    );
  });

  // Header color function
  const headerColorFn = chalk[headerColor] || chalk.cyan;

  // Print border top if enabled
  if (border) {
    const borderLine = '─'.repeat(columnWidths.reduce((sum, w) => sum + w + padding * 2, 0) + headers.length - 1);
    console.log(`┌${borderLine}┐`);
  }

  // Print header row
  const headerCells = headers.map((header, i) => {
    const padded = String(header).padEnd(columnWidths[i]);
    return headerColorFn.bold(padded);
  });
  const headerRow = headerCells.join(' '.repeat(padding));
  console.log(border ? `│ ${headerRow} │` : `      ${headerRow}`);

  // Print separator line if border enabled
  if (border) {
    const separator = columnWidths.map((w) => '─'.repeat(w + padding)).join('┼');
    console.log(`├${separator}┤`);
  }

  // Print data rows
  rows.forEach((row, rowIndex) => {
    const rowCells = row.map((cell, colIndex) => {
      // Use nullish coalescing to handle 0 and false correctly
      const cellStr = String(cell ?? '').padEnd(columnWidths[colIndex]);

      // Apply row color if provided
      if (rowColor) {
        const color = rowColor(rowIndex, row);
        const colorFn = chalk[color] || chalk.reset;
        return colorFn(cellStr);
      }

      return cellStr;
    });
    const rowStr = rowCells.join(' '.repeat(padding));
    console.log(border ? `│ ${rowStr} │` : `      ${rowStr}`);
  });

  // Print border bottom if enabled
  if (border) {
    const borderLine = '─'.repeat(columnWidths.reduce((sum, w) => sum + w + padding * 2, 0) + headers.length - 1);
    console.log(`└${borderLine}┘`);
  }
}

/**
 * Print a plain log message (simple console.log replacement)
 * @param {...any} args - Arguments to log (same as console.log)
 */
export function log(...args) {
  console.log(...args);
}

/**
 * Export chalk for direct use if needed
 */
export { chalk };

/**
 * Legacy colors object for backward compatibility
 * @deprecated Use chalk directly instead
 */
export const colors = {
  reset: '',
  dim: chalk.dim,
  cyan: chalk.cyan,
  green: chalk.green,
  yellow: chalk.yellow,
  red: chalk.red,
  blue: chalk.blue,
  bgCyan: chalk.bgCyan.black,
  bgGreen: chalk.bgGreen.black,
  bgYellow: chalk.bgYellow.black,
  bgRed: chalk.bgRed.white,
  bgBlue: chalk.bgBlue.white,
  black: chalk.black,
};

/**
 * Business Card Generation Utilities
 */

/**
 * Validate email address
 * @param {string} email - Email address to validate
 * @returns {boolean} True if valid email format
 */
export function validateEmail(email) {
  if (!email) return false;
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (basic validation)
 * @param {string} phone - Phone number to validate
 * @returns {boolean} True if valid phone format
 */
export function validatePhone(phone) {
  if (!phone) return false;
  // Allow digits, spaces, +, -, (, )
  const phoneRegex = /^[\d\s\+\-\(\)]+$/;
  return phoneRegex.test(phone) && phone.replace(/\D/g, '').length >= 6;
}

/**
 * Validate URL
 * @param {string} url - URL to validate
 * @returns {boolean} True if valid URL format
 */
export function validateUrl(url) {
  if (!url) return false;
  try {
    // Add protocol if missing
    const urlWithProtocol = url.startsWith('http://') || url.startsWith('https://') 
      ? url 
      : `https://${url}`;
    new URL(urlWithProtocol);
    return true;
  } catch {
    return false;
  }
}

/**
 * Normalize URL (add protocol if missing)
 * @param {string} url - URL to normalize
 * @returns {string} Normalized URL
 */
export function normalizeUrl(url) {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
}

/**
 * Validate contact data for business card generation
 * @param {Object} data - Contact data object
 * @returns {Object} Validation result with isValid and errors array
 */
export function validateContactData(data) {
  const errors = [];

  if (!data.name || data.name.trim().length === 0) {
    errors.push('Name ist erforderlich');
  }

  if (data.email && !validateEmail(data.email)) {
    errors.push('E-Mail-Adresse ist ungültig');
  }

  if (data.phone && !validatePhone(data.phone)) {
    errors.push('Telefonnummer ist ungültig');
  }

  if (data.mobile && !validatePhone(data.mobile)) {
    errors.push('Mobilnummer ist ungültig');
  }

  if (data.website && !validateUrl(data.website)) {
    errors.push('Website-URL ist ungültig');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Print progress for business card generation steps
 * @param {string} step - Step description
 * @param {string} [status] - Status ('generating', 'done', 'error')
 */
export function cardProgress(step, status = 'generating') {
  const statusMap = {
    generating: { label: '[GEN]', color: 'cyan' },
    done: { label: '[OK]', color: 'green' },
    error: { label: '[ERR]', color: 'red' },
  };

  const { label, color } = statusMap[status] || statusMap.generating;
  progress(label, step, '', color);
}

/**
 * Format contact data for preview display
 * @param {Object} contactData - Contact data object
 * @returns {string} Formatted preview string
 */
export function formatContactPreview(contactData) {
  const lines = [];
  
  if (contactData.name) {
    lines.push(`${chalk.bold('Name:')} ${contactData.name}`);
  }
  
  if (contactData.position) {
    lines.push(`${chalk.bold('Position:')} ${contactData.position}`);
  }
  
  if (contactData.email) {
    lines.push(`${chalk.bold('E-Mail:')} ${contactData.email}`);
  }
  
  if (contactData.phone) {
    lines.push(`${chalk.bold('Telefon:')} ${contactData.phone}`);
  }
  
  if (contactData.mobile) {
    lines.push(`${chalk.bold('Mobil:')} ${contactData.mobile}`);
  }
  
  if (contactData.address || contactData.city || contactData.postalCode) {
    const addressParts = [
      contactData.address,
      contactData.postalCode,
      contactData.city,
    ].filter(Boolean);
    if (addressParts.length > 0) {
      lines.push(`${chalk.bold('Adresse:')} ${addressParts.join(', ')}`);
    }
  }
  
  if (contactData.country) {
    lines.push(`${chalk.bold('Land:')} ${contactData.country}`);
  }
  
  if (contactData.website) {
    lines.push(`${chalk.bold('Website:')} ${contactData.website}`);
  }
  
  if (contactData.socialMedia) {
    if (Array.isArray(contactData.socialMedia)) {
      // New format: array of objects
      const socialMediaList = contactData.socialMedia.map(entry => {
        if (entry.url) {
          return `${entry.name}: ${entry.url}`;
        }
        return entry.name;
      }).join(', ');
      lines.push(`${chalk.bold('Social Media:')} ${socialMediaList}`);
    } else {
      // Legacy format: simple string
      lines.push(`${chalk.bold('Social Media:')} ${contactData.socialMedia}`);
    }
  }
  
  return lines.join('\n');
}

/**
 * Prompt with retry logic
 * @param {Function} promptFn - Function that returns a promise resolving to prompt result
 * @param {Object} options - Retry options
 * @param {number} options.maxRetries - Maximum number of retries (default: 3)
 * @param {Function} options.onError - Error handler function
 * @returns {Promise<any>} Prompt result
 */
export async function promptWithRetry(promptFn, options = {}) {
  const { maxRetries = 3, onError } = options;
  let lastError;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await promptFn();
    } catch (err) {
      lastError = err;
      if (onError) {
        onError(err, attempt + 1, maxRetries);
      }
      if (attempt < maxRetries - 1) {
        warn(`Fehler aufgetreten. Versuch ${attempt + 2}/${maxRetries}...`);
      }
    }
  }
  
  throw lastError;
}
