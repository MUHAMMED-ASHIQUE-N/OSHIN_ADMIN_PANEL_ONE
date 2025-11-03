import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore'; // Import auth store for token
import { ReviewPayload } from './reviewStore'; // Reuse the payload type

const BASE_URL = import.meta.env.VITE_API_URL;

// Re-define ReviewPayload if it's not exported from reviewStore
// interface ReviewPayload { ... }

interface TokenState {
  generatedToken: string | null;
  isLoading: boolean;
  error: string | null;

      isSubmitting: boolean;
  // For public validation
  publicCategory: 'room' | 'f&b' | null;
  isPublicLoading: boolean;
  publicError: string | null;

  generateToken: () => Promise<string | null>;
  validateToken: (token: string) => Promise<'room' | 'f&b' | null>;
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
  isSubmitting: false,
  publicCategory: null,
  isPublicLoading: true, // Start as true on public page
  publicError: null,

  clearToken: () => set({ generatedToken: null, error: null }),

  generateToken: async () => {
    set({ isLoading: true, error: null, generatedToken: null });
    try {
      // 1. Assumes this backend endpoint exists
      const response = await axios.post(
        `${BASE_URL}/token/generate`,
        {}, // Send empty body, user is identified by auth token
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
      // 2. Assumes this backend endpoint exists
      const response = await axios.get(
        `${BASE_URL}/public/validate/${token}`
      );
      const category = response.data.category;
      if (category === 'room' || category === 'f&b') {
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
      // 3. Assumes this backend endpoint exists
      await axios.post(`${BASE_URL}/public/review`, {
        ...payload,
        token: token, // Send the token along with the review
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