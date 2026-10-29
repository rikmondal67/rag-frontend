import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      hasHydrated: false,

      loginUser: (userData) => set({ user: userData }),
      logoutUser: () => set({ user: null }),
      setHasHydrated: (value) => set({ hasHydrated: value }),
    }),
    {
      name: 'user-auth-storage',

      // Only save the user; hydration status is set fresh on each page load.
      partialize: (state) => ({ user: state.user }),

      onRehydrateStorage: () => (state, error) => {
        if (error) {
          console.error('Failed to restore auth state:', error);
        }

        state?.setHasHydrated(true);
      },
    }
  )
);

export default useAuthStore;