/**
 * Strict Email Validation Utility
 * Only allows genuine, trusted email providers (Gmail, Yahoo, Hotmail, Outlook, iCloud, Proton, Zoho, etc.)
 * Strictly blocks random domains, fake inputs, and disposable emails.
 */

// Strict list of allowed email provider domains
const ALLOWED_EMAIL_PROVIDERS = new Set([
  // Google
  'gmail.com',
  'googlemail.com',

  // Yahoo
  'yahoo.com',
  'ymail.com',
  'rocketmail.com',
  'yahoo.co.uk',
  'yahoo.ca',
  'yahoo.in',
  'yahoo.com.bd',
  'yahoo.com.au',
  'yahoo.com.sg',
  'yahoo.fr',
  'yahoo.de',
  'yahoo.es',
  'yahoo.it',

  // Microsoft
  'hotmail.com',
  'hotmail.co.uk',
  'hotmail.fr',
  'hotmail.de',
  'hotmail.es',
  'hotmail.it',
  'outlook.com',
  'outlook.co.uk',
  'outlook.fr',
  'outlook.de',
  'outlook.es',
  'outlook.in',
  'live.com',
  'live.co.uk',
  'live.fr',
  'msn.com',
  'windowslive.com',

  // Apple
  'icloud.com',
  'me.com',
  'mac.com',

  // Proton
  'proton.me',
  'protonmail.com',
  'pm.me',

  // Zoho
  'zoho.com',
  'zohomail.com',

  // Other major global providers
  'aol.com',
  'mail.com',
  'gmx.com',
  'gmx.net',
  'hey.com',
  'fastmail.com',
  'tutanota.com',
  'tuta.com',
  'yandex.com',
]);

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  cleanEmail?: string;
}

export function validateEmail(emailStr: string | unknown): EmailValidationResult {
  if (!emailStr || typeof emailStr !== 'string') {
    return { isValid: false, error: 'Please enter your email address.' };
  }

  const email = emailStr.trim().toLowerCase();

  // Basic syntax check (must contain exactly one @)
  const parts = email.split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Please enter a valid email (e.g. name@gmail.com, name@yahoo.com).' };
  }

  const [username, domain] = parts;

  // Validate username part
  if (!username || username.length < 2) {
    return { isValid: false, error: 'Email username is too short.' };
  }

  if (username.length > 64) {
    return { isValid: false, error: 'Email username is too long.' };
  }

  if (/^[._-]|[._-]$/.test(username) || /[.]{2,}/.test(username)) {
    return { isValid: false, error: 'Invalid email username format.' };
  }

  if (!/^[a-zA-Z0-9._%+-]+$/.test(username)) {
    return { isValid: false, error: 'Email username contains invalid characters.' };
  }

  // Strict domain check: Must be in recognized provider list
  if (!domain || !ALLOWED_EMAIL_PROVIDERS.has(domain)) {
    return {
      isValid: false,
      error: 'Please provide a valid email provider (Gmail, Yahoo, Hotmail, Outlook, iCloud, Proton, etc.).',
    };
  }

  return { isValid: true, cleanEmail: `${username}@${domain}` };
}
