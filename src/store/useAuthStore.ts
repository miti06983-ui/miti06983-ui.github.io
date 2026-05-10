import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthStore, User } from '../types/auth';

const generateId = (): string => {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
};

const hashPassword = (password: string): string => {
  let hash = 0;
  for (let i = 0; i < password.length; i++) {
    const char = password.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash;
  }
  return 'hashed_' + Math.abs(hash).toString(16);
};

const STORAGE_KEYS = {
  USERS: 'music_player_users',
  CURRENT_USER: 'music_player_current_user'
};

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,

      getUsers: (): User[] => {
        const data = localStorage.getItem(STORAGE_KEYS.USERS);
        return data ? JSON.parse(data) : [];
      },

      getUserById: (id: string): User | undefined => {
        const users = get().getUsers();
        return users.find(user => user.id === id);
      },

      login: async (email: string, password: string): Promise<boolean> => {
        set({ isLoading: true, error: null });

        try {
          await new Promise(resolve => setTimeout(resolve, 500));

          const users = get().getUsers();
          const hashedPassword = hashPassword(password);
          const userData = localStorage.getItem(`user_password_${email}`);
          
          if (!userData || userData !== hashedPassword) {
            set({ error: 'Invalid email or password', isLoading: false });
            return false;
          }

          const user = users.find(u => u.email === email);
          
          if (!user) {
            set({ error: 'User not found', isLoading: false });
            return false;
          }

          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
          set({ user, isAuthenticated: true, isLoading: false });
          return true;
        } catch (error) {
          set({ error: 'Login failed', isLoading: false });
          return false;
        }
      },

      register: async (email: string, username: string, password: string): Promise<boolean> => {
        set({ isLoading: true, error: null });

        try {
          await new Promise(resolve => setTimeout(resolve, 500));

          const users = get().getUsers();
          
          if (users.find(u => u.email === email)) {
            set({ error: 'Email already registered', isLoading: false });
            return false;
          }

          if (password.length < 6) {
            set({ error: 'Password must be at least 6 characters', isLoading: false });
            return false;
          }

          const hashedPassword = hashPassword(password);
          const newUser: User = {
            id: generateId(),
            email,
            username,
            createdAt: new Date().toISOString()
          };

          users.push(newUser);
          localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
          localStorage.setItem(`user_password_${email}`, hashedPassword);
          localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(newUser));

          set({ user: newUser, isAuthenticated: true, isLoading: false });
          return true;
        } catch (error) {
          set({ error: 'Registration failed', isLoading: false });
          return false;
        }
      },

      logout: () => {
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        set({ user: null, isAuthenticated: false, error: null });
      },

      clearError: () => {
        set({ error: null });
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
