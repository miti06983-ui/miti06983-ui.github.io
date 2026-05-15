export interface User {
  id: string;
  email: string;
  username: string;
  avatar?: string;
  createdAt: string;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

export interface AuthActions {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, username: string, password: string) => Promise<boolean>;
  logout: () => void;
  clearError: () => void;
  getUsers: () => User[];
  getUserById: (id: string) => User | undefined;
  initAuth: () => Promise<void>;
}

export type AuthStore = AuthState & AuthActions;
