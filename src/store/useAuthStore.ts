import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '../api/client';
import { AuthStore, User } from '../types/auth';

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      getUsers: (): User[] => {
        return [];
      },

      getUserById: (id: string): User | undefined => {
        return undefined;
      },

      login: async (email: string, password: string): Promise<boolean> => {
        set({ isLoading: true, error: null });

        try {
          const data = await apiClient.login(email, password);
          set({ user: data.user, isAuthenticated: true, isLoading: false });
          return true;
        } catch (error: any) {
          set({ error: error.message || 'Login failed', isLoading: false });
          return false;
        }
      },

      register: async (email: string, username: string, password: string): Promise<boolean> => {
        set({ isLoading: true, error: null });

        try {
          const data = await apiClient.register(email, username, password);
          set({ user: data.user, isAuthenticated: true, isLoading: false });
          return true;
        } catch (error: any) {
          set({ error: error.message || 'Registration failed', isLoading: false });
          return false;
        }
      },

      logout: () => {
        apiClient.logout();
        set({ user: null, isAuthenticated: false, error: null });
      },

      clearError: () => {
        set({ error: null });
      },

      initAuth: async () => {
        const token = apiClient.getToken();
        if (!token) return;

        try {
          const data = await apiClient.getCurrentUser();
          set({ user: data.user, isAuthenticated: true });
        } catch (error) {
          apiClient.logout();
          set({ user: null, isAuthenticated: false });
        }
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated
      })
    }
  )
);
