import type { AuthUser } from "./authTypes";

const STORAGE_KEY = "billing.auth.user";

function isValidUser(value: unknown): value is AuthUser {
  if (!value || typeof value !== "object") return false;
  const candidate = value as AuthUser;
  return Boolean(
    candidate.id &&
      typeof candidate.id === "string" &&
      candidate.email &&
      typeof candidate.email === "string" &&
      candidate.displayName &&
      typeof candidate.displayName === "string" &&
      candidate.role &&
      typeof candidate.role === "string"
  );
}

export function getStoredUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as unknown;
    if (!isValidUser(parsed)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return parsed;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function setStoredUser(user: AuthUser) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
}

export function clearStoredUser() {
  localStorage.removeItem(STORAGE_KEY);
}
