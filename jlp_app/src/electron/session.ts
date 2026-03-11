/**
 * Main-process session state.
 * Stores the currently active userId for the duration of the app's lifetime.
 * Resets to null when the app quits.
 */

let currentUserId: number | null = null;

export function getCurrentUserId(): number | null {
  return currentUserId;
}

export function setCurrentUserId(userId: number | null): void {
  currentUserId = userId;
}
