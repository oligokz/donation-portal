/**
 * Simple in-memory session store for testing
 * In production, use a proper session store (Redis, database, etc.)
 */

import { AuthSessionData } from './types';

const sessions = new Map<string, AuthSessionData>();

export function storeSession(state: string, sessionData: AuthSessionData) {
  sessions.set(state, sessionData);
  // Clean up after 10 minutes
  setTimeout(() => sessions.delete(state), 10 * 60 * 1000);
}

export function getSession(state: string): AuthSessionData | undefined {
  return sessions.get(state);
}

export function deleteSession(state: string) {
  sessions.delete(state);
}

