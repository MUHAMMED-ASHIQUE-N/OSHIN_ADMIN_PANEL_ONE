// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_URL;

// Define the shape of the user object
export interface IUser {
  _id: string;
  fullName: string;
  username: string;
  role: 'admin' | 'staff' | 'viewer';
}

// Define the shape of the store's state and actions
interface AuthState {
  token: string | null;
  user: IUser | null;
  isLoading: boolean;
  error: string | null;
  // This action will be called by our new central login page
  setAuth: (token: string, user: IUser) => void;
  logout: () => void;
  // We keep the login action for flexibility, but our page will use setAuth
  // Notice the role check is removed.
  login: (username: string, password: string) => Promise<IUser | null>;
}

// Create the store
export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoading: false,
      error: null,

      setAuth: (token, user) => {
        set({ token, user, isLoading: false, error: null });
      },

      logout: () => {
        set({ token: null, user: null });
      },
      
      login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${BASE_URL}/auth/login`, {
            username,
            password,
          });

          const { token, data } = response.data;
          
          // Just set the auth data and return the user
          set({ token, user: data.user, isLoading: false });
          return data.user;

        } catch (err) {
          const errorMessage = axios.isAxiosError(err) && err.response
            ? err.response.data.message
            : 'Login failed. Please try again.';
          set({ error: errorMessage, isLoading: false });
          return null; // Return null on failure
        }
      },
    }),
    {
      name: 'auth-storage', // Name for the localStorage item
    }
  )
);