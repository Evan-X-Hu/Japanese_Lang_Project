/**
 * Main-process session state.
 *
 * Persistence strategy:
 *   On sign-in/sign-out, we write the userId to a small JSON file in the
 *   app's userData directory (e.g. ~/.config/jlp_app/session.json).
 *   On the next launch, loadSession() reads it back before any IPC handlers
 *   run, so user:getCurrent immediately returns the last signed-in user.
 *
 * Why a file instead of tokens?
 *   Tokens (JWT) exist so a *server* can verify identity without hitting the
 *   database on every request. Here the app itself IS the database, so there
 *   is nothing to verify against — persisting the userId is both sufficient
 *   and simpler. A token would add complexity with no security benefit.
 */

import * as fs from 'fs';
import * as path from 'path';
import { app } from 'electron';

let currentUserId: number | null = null;

function sessionFilePath(): string {
  return path.join(app.getPath('userData'), 'session.json');
}

/**
 * Load the persisted session from disk.
 * Must be called after app.whenReady() so that app.getPath() is available.
 */
export function loadSession(): void {
  try {
    const filePath = sessionFilePath();
    if (fs.existsSync(filePath)) {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      currentUserId = typeof data.userId === 'number' ? data.userId : null;
    }
  } catch {
    // Corrupt or missing file — start with no session
    currentUserId = null;
  }
}

export function getCurrentUserId(): number | null {
  return currentUserId;
}

/**
 * Update the active user in memory and persist it to disk.
 * Passing null clears the session (sign-out).
 */
export function setCurrentUserId(userId: number | null): void {
  currentUserId = userId;
  try {
    fs.writeFileSync(sessionFilePath(), JSON.stringify({ userId }), 'utf-8');
  } catch {
    // Non-fatal — the in-memory session still works, it just won't survive restart
    console.warn('[session] Failed to persist session to disk');
  }
}
