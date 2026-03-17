import { create } from 'zustand';
import type { UserRecord } from '../types/index';

interface UserState {
  currentUser: UserRecord | null;
  setCurrentUser: (user: UserRecord | null) => void;
  initUser: () => Promise<void>;
}

export const useUserStore = create<UserState>((set) => ({
  currentUser: null,

  /**
   * Called once on app mount. Restores the session from the main process
   * so the current user persists across renderer reloads.
   */
  initUser: async () => {
    const user = (await window.user?.getCurrent()) ?? null;
    set({ currentUser: user });
  },

  /**
   * Set the active user both in the store and in the main-process session.
   * Pass null to sign out (main-process session is not cleared here —
   * sign-out just drops the renderer reference).
   */
  setCurrentUser: (user) => {
    set({ currentUser: user });
    if (user) {
      window.user?.setCurrent(user.userId);
    }
  },
}));
