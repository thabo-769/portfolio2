const KEY_STORAGE = 'thabo_remote_devices_secret_v1';

function canUseCrypto(): boolean {
  return typeof crypto !== 'undefined' && typeof crypto.subtle !== 'undefined';
}

function canUseStorage(): boolean {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }
  return btoa(binary);
}

function base64ToBytes(value: string): Uint8Array {
  const binary = atob(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
}

async function getOrCreateKey(): Promise<CryptoKey | null> {
  if (!canUseCrypto()) {
    return null;
  }

  let raw = '';
  if (canUseStorage()) {
    try {
      raw = localStorage.getItem(KEY_STORAGE) ?? '';
    } catch {
      raw = '';
    }
  }

  if (!raw) {
    const bytes = new Uint8Array(32);
    crypto.getRandomValues(bytes);
    raw = bytesToBase64(bytes);
    if (canUseStorage()) {
      try {
        localStorage.setItem(KEY_STORAGE, raw);
      } catch {
        // If storage is unavailable, the key stays in memory only.
      }
    }
  }

  try {
    return await crypto.subtle.importKey('raw', base64ToBytes(raw), 'AES-GCM', false, ['encrypt', 'decrypt']);
  } catch {
    return null;
  }
}

export function normalizePairingCode(code: string): string {
  return code.replace(/\D/g, '').slice(0, 6);
}

export function formatPairingCode(code: string): string {
  const normalized = normalizePairingCode(code);
  if (normalized.length <= 3) {
    return normalized;
  }
  return `${normalized.slice(0, 3)} ${normalized.slice(3)}`;
}

export function generatePairingCode(): string {
  const digits = new Uint8Array(6);
  crypto.getRandomValues(digits);
  return formatPairingCode(Array.from(digits, value => String(value % 10)).join(''));
}

export async function hashPairingCode(code: string): Promise<string> {
  if (!canUseCrypto()) {
    return normalizePairingCode(code);
  }

  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(normalizePairingCode(code)));
  return bytesToBase64(new Uint8Array(digest));
}

export async function encryptSensitiveValue(value: string): Promise<string> {
  const key = await getOrCreateKey();
  if (!key) {
    return bytesToBase64(new TextEncoder().encode(value));
  }

  const iv = new Uint8Array(12);
  crypto.getRandomValues(iv);
  const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, new TextEncoder().encode(value));
  return `${bytesToBase64(iv)}.${bytesToBase64(new Uint8Array(cipher))}`;
}

export async function decryptSensitiveValue(payload: string): Promise<string> {
  const [ivPart, cipherPart] = payload.split('.');
  if (!ivPart || !cipherPart) {
    return atob(payload);
  }

  const key = await getOrCreateKey();
  if (!key) {
    return new TextDecoder().decode(base64ToBytes(cipherPart));
  }

  const iv = base64ToBytes(ivPart);
  const cipher = base64ToBytes(cipherPart);
  const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, cipher);
  return new TextDecoder().decode(plain);
}

