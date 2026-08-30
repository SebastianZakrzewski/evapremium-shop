const STORAGE_KEY = 'eva-premium-visitor';
const VISITOR_PATTERN = /^[a-zA-Z0-9]{1,128}$/;

export function randomVisitorId(): string {
  const alphabet = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (byte) => alphabet[byte % alphabet.length]).join('');
}

export function ensureVisitorId(explicit?: string): string {
  if (explicit && VISITOR_PATTERN.test(explicit)) {
    return explicit;
  }

  if (typeof localStorage === 'undefined') {
    return randomVisitorId();
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && VISITOR_PATTERN.test(stored)) {
    return stored;
  }

  const next = randomVisitorId();
  localStorage.setItem(STORAGE_KEY, next);
  return next;
}

export const CONVERSATION_STORAGE_KEY = 'eva-premium-conversation';
