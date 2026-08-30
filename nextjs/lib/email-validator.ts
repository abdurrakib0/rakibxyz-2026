/**
 * Robust Email Validation Utility
 * Supports major trusted email providers (Gmail, Outlook, Yahoo, Proton, iCloud, Zoho, etc.)
 * and genuine corporate/educational custom domains, while blocking fake/spam/disposable inputs.
 */

// Major recognized email providers
const TRUSTED_PUBLIC_PROVIDERS = new Set([
  'gmail.com',
  'googlemail.com',
  'outlook.com',
  'hotmail.com',
  'live.com',
  'msn.com',
  'yahoo.com',
  'ymail.com',
  'rocketmail.com',
  'yahoo.co.uk',
  'yahoo.ca',
  'yahoo.in',
  'yahoo.com.bd',
  'icloud.com',
  'me.com',
  'mac.com',
  'proton.me',
  'protonmail.com',
  'pm.me',
  'zoho.com',
  'zohomail.com',
  'aol.com',
  'aim.com',
  'gmx.com',
  'gmx.net',
  'mail.com',
  'hey.com',
  'fastmail.com',
  'tutanota.com',
  'tuta.com',
  'tuta.io',
  'yandex.com',
  'yandex.ru',
  'web.de',
]);

// Known temporary / disposable / throwaway domains to block
const DISPOSABLE_DOMAINS = new Set([
  'mailinator.com',
  'tempmail.com',
  '10minutemail.com',
  'guerrillamail.com',
  'throwawaymail.com',
  'trashmail.com',
  'sharklasers.com',
  'yopmail.com',
  'dispostable.com',
  'temp-mail.org',
  'getairmail.com',
  'fakemailgenerator.com',
  'maildrop.cc',
  'mytemp.email',
  'nada.ltd',
  'crazymailing.com',
  'tempail.com',
  'burnermail.io',
]);

// Common valid top-level domains
const COMMON_TLDS = new Set([
  'com', 'org', 'net', 'edu', 'gov', 'mil', 'int',
  'io', 'ai', 'dev', 'tech', 'co', 'me', 'app', 'xyz', 'info', 'biz',
  'agency', 'studio', 'cloud', 'digital', 'systems', 'design', 'software',
  'global', 'world', 'site', 'online', 'pro', 'in', 'us', 'uk', 'ca',
  'de', 'fr', 'au', 'jp', 'sg', 'ae', 'bd', 'ac.bd', 'co.uk', 'com.bd',
]);

export interface EmailValidationResult {
  isValid: boolean;
  error?: string;
  cleanEmail?: string;
}

export function validateEmail(emailStr: string | unknown): EmailValidationResult {
  if (!emailStr || typeof emailStr !== 'string') {
    return { isValid: false, error: 'Please enter an email address.' };
  }

  const email = emailStr.trim().toLowerCase();

  // Basic syntax check (must contain exactly one @, with characters before and after)
  const parts = email.split('@');
  if (parts.length !== 2) {
    return { isValid: false, error: 'Please enter a complete email address (e.g. name@domain.com).' };
  }

  const [username, domain] = parts;

  // 1. Validate username part
  if (!username || username.length < 2) {
    return { isValid: false, error: 'Email username is too short.' };
  }

  if (username.length > 64) {
    return { isValid: false, error: 'Email username is too long.' };
  }

  // Username must not start or end with a dot or special char
  if (/^[._-]|[._-]$/.test(username) || /[.]{2,}/.test(username)) {
    return { isValid: false, error: 'Invalid email username format.' };
  }

  // Allowed username characters
  if (!/^[a-zA-Z0-9._%+-]+$/.test(username)) {
    return { isValid: false, error: 'Email username contains invalid characters.' };
  }

  // 2. Validate domain part
  if (!domain || !domain.includes('.')) {
    return { isValid: false, error: 'Please include a valid domain extension (e.g. .com, .org).' };
  }

  // Check if it's a known disposable / throwaway email
  if (DISPOSABLE_DOMAINS.has(domain)) {
    return { isValid: false, error: 'Temporary/disposable email addresses are not supported.' };
  }

  // If it's in trusted public providers list, it's immediately valid
  if (TRUSTED_PUBLIC_PROVIDERS.has(domain)) {
    return { isValid: true, cleanEmail: `${username}@${domain}` };
  }

  // 3. For custom / corporate / institutional domains:
  const domainParts = domain.split('.');
  const tld = domainParts.slice(1).join('.'); // handles 'co.uk', 'com.bd', 'ac.bd' as well as single 'com'
  const primaryTld = domainParts[domainParts.length - 1];
  const domainName = domainParts[0];

  // Domain name must be at least 2 characters (e.g. "ph.com" or "brac.net")
  if (domainName.length < 2) {
    return { isValid: false, error: 'Please enter a valid domain name.' };
  }

  // Domain name must only contain alphanumeric and hyphens
  if (!/^[a-zA-Z0-9-]+$/.test(domainName) || domainName.startsWith('-') || domainName.endsWith('-')) {
    return { isValid: false, error: 'Invalid domain name format.' };
  }

  // TLD must be valid letters (at least 2 chars)
  if (!/^[a-zA-Z.]+$/.test(tld) || primaryTld.length < 2) {
    return { isValid: false, error: 'Invalid domain extension (TLD).' };
  }

  // Reject obvious fake domains like "@abl.abl", "@abc.abc", etc.
  if (domainParts.length === 2 && domainParts[0] === domainParts[1]) {
    return { isValid: false, error: 'Please provide a legitimate email domain.' };
  }

  return { isValid: true, cleanEmail: `${username}@${domain}` };
}
