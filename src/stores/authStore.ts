import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import axios from 'axios';
const BASE_URL = import.meta.env.VITE_API_URL 

// Define the shape of the user object
interface IUser {
  _id: string;
  fullName: string;
  username: string;
  role: 'admin' | 'staff';
}

// Define the shape of the store's state and actions
interface AuthState {
  token: string | null;
  user: IUser | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

// Create the store
export const useAuthStore = create<AuthState>()(
  // Use the 'persist' middleware to save the state to localStorage
  persist(
    (set) => ({
      token: null,
      user: null,
      isLoading: false,
      error: null,
      
      // The login action
      login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await axios.post(`${BASE_URL}/auth/login`, {
            username,
            password,
          });

          const { token, data } = response.data;
          
          // Only allow admins to log in to this panel
          if (data.user.role !== 'admin') {
              set({ isLoading: false, error: 'Access denied. Only admins are allowed.' });
              return;
          }

          set({ token, user: data.user, isLoading: false });
        } catch (err) {
          const errorMessage = axios.isAxiosError(err) && err.response 
            ? err.response.data.message 
            : 'Login failed. Please try again.';
          set({ error: errorMessage, isLoading: false });
        }
      },

      // The logout action
      logout: () => {
        set({ token: null, user: null });
      },
    }),
    {
      name: 'auth-storage', // Name for the localStorage item
    }
  )
);