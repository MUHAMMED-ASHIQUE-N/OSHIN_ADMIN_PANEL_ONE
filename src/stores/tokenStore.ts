import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';
import { ReviewPayload } from './reviewStore'; // This should now work

const BASE_URL = import.meta.env.VITE_API_URL;

interface TokenState {
  generatedToken: string | null;
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean; // Added this
  
  // ✅ ADDED 'cfc'
  publicCategory: 'room' | 'f&b' | 'cfc' | null;
  isPublicLoading: boolean;
  publicError: string | null;

  generateToken: () => Promise<string | null>;
  // ✅ ADDED 'cfc'
  validateToken: (token: string) => Promise<'room' | 'f&b' | 'cfc' | null>;
  submitPublicReview: (token: string, payload: ReviewPayload) => Promise<boolean>;
  clearToken: () => void;
}

const getAuthHeader = () => {
  const token = useAuthStore.getState().token;
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const useTokenStore = create<TokenState>((set) => ({
  generatedToken: null,
  isLoading: false,
  error: null,
  isSubmitting: false, // Initialize
  publicCategory: null,
  isPublicLoading: true,
  publicError: null,

  clearToken: () => set({ generatedToken: null, error: null }),

  generateToken: async () => {
    set({ isLoading: true, error: null, generatedToken: null });
    try {
      const response = await axios.post(
        `${BASE_URL}/token/generate`,
        {},
        getAuthHeader()
      );
      const token = response.data.token;
      set({ generatedToken: token, isLoading: false });
      return token;
    } catch (err) {
      console.error("Failed to generate token:", err);
      const errorMsg = (axios.isAxiosError(err) && err.response?.data?.message)
        ? err.response.data.message
        : "Failed to generate link.";
      set({ error: errorMsg, isLoading: false });
      return null;
    }
  },

  validateToken: async (token) => {
    set({ isPublicLoading: true, publicError: null, publicCategory: null });
    try {
      const response = await axios.get(
        `${BASE_URL}/public/validate/${token}`
      );
      const category = response.data.category;
      // ✅ ADDED 'cfc'
      if (category === 'room' || category === 'f&b' || category === 'cfc') {
        set({ publicCategory: category, isPublicLoading: false });
        return category;
      }
      throw new Error("Invalid category received.");
    } catch (err) {
      console.error("Failed to validate token:", err);
      set({ publicError: "This link is invalid or has expired.", isPublicLoading: false });
      return null;
    }
  },

  submitPublicReview: async (token, payload) => {
    set({ isSubmitting: true, publicError: null });
    try {
      await axios.post(`${BASE_URL}/public/review`, {
        ...payload,
        token: token,
      });
      set({ isSubmitting: false });
      return true;
    } catch (err) {
       console.error("Failed to submit public review:", err);
       const errorMsg = (axios.isAxiosError(err) && err.response?.data?.message)
        ? err.response.data.message
        : "Submission failed. This link may have been used or expired.";
      set({ publicError: errorMsg, isSubmitting: false });
      return false;
    }
  },
}));