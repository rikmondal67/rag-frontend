import { create } from 'zustand';
import { persist } from 'zustand/middleware';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null, 
      
      loginUser: (userData) => set({ user: userData }),
      
      logoutUser: () => set({ user: null }),
    }),
    {
      name: 'user-auth-storage',
    }
  )
);

export default useAuthStore;