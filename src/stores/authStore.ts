// src/stores/authStore.ts
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_URL;

export interface IUser {
  _id: string;
  fullName: string;
  username: string;
  role: 'admin' | 'staff' | 'viewer' | 'staff_room' | 'staff_f&b' | 'staff_cfc';
  // <-- MODIFIED: This now matches the populated object from the backend -->
  hotelId?: {
    _id: string;
    name: string;
  };
}

interface AuthState {
  token: string | null;
  user: IUser | null;
  isLoading: boolean;
  error: string | null;
  setAuth: (token: string, user: IUser) => void;
  logout: () => void;
  login: (username: string, password: string) => Promise<IUser | null>;
}

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
          
          // The user object (data.user) now contains the populated hotelId object
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
      name: 'auth-storage',
    }
  )
);