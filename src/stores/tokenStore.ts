import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';
import { ReviewPayload } from './reviewStore'; // This should now work
import { useReviewStore } from './reviewStore'; // NEW: Import to set questions publicly

const BASE_URL = import.meta.env.VITE_API_URL;

interface TokenState {
  generatedToken: string | null;
  isLoading: boolean;
  error: string | null;
  isSubmitting: boolean;
  
  publicCategory: 'room' | 'f&b' | 'cfc' | null;
  publicHotelId: { _id: string; name: string } | null; // NEW: For logo/hotel in public
  isPublicLoading: boolean;
  publicError: string | null;

  generateToken: () => Promise<string | null>;
  validateToken: (token: string) => Promise<'room' | 'f&b' | 'cfc' | null>;
  // NEW: Public fetch questions (no auth)
  publicFetchQuestions: (category: 'room' | 'f&b' | 'cfc') => Promise<void>;
  submitPublicReview: (token: string, payload: ReviewPayload) => Promise<boolean>;
  clearToken: () => void;
}

const getAuthHeader = () => {
  const token = useAuthStore.getState().token;
  // This helper correctly gets the token. The backend will use it
  // to get the staff's hotelId and attach it to the generated token.
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const useTokenStore = create<TokenState>((set, _) => ({
  generatedToken: null,
  isLoading: false,
  error: null,
  isSubmitting: false,
  publicCategory: null,
  publicHotelId: null, // NEW
  isPublicLoading: true,
  publicError: null,

  clearToken: () => set({ generatedToken: null, error: null }),

  generateToken: async () => {
    set({ isLoading: true, error: null, generatedToken: null });
    try {
      const response = await axios.post(
        `${BASE_URL}/token/generate`,
        {},
        getAuthHeader() // Sends token
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
    set({ isPublicLoading: true, publicError: null, publicCategory: null, publicHotelId: null }); // UPDATED: Clear hotel too
    try {
      const response = await axios.get(
        `${BASE_URL}/public/validate/${token}`
      );
      const { category, hotelId } = response.data; // UPDATED: Destructure hotelId
      if (category === 'room' || category === 'f&b' || category === 'cfc') {
        set({ 
          publicCategory: category, 
          publicHotelId: hotelId, // NEW: Store populated hotel
          isPublicLoading: false 
        });
        return category;
      }
      throw new Error("Invalid category received.");
    } catch (err) {
      console.error("Failed to validate token:", err);
      set({ publicError: "This link is invalid or has expired.", isPublicLoading: false });
      return null;
    }
  },

  // NEW: Fetch questions publicly (no auth header)
  publicFetchQuestions: async (category) => {
    // const reviewStore = useReviewStore.getState(); // Get review store ref
    try {
      const response = await axios.get(`${BASE_URL}/public/questions/${category}`); // NEW: Public endpoint
      // Directly update review store (add setQuestions to reviewStore if needed)
      useReviewStore.setState({ 
        questions: response.data.data.questions || [], 
        isLoading: false, 
        error: null 
      });
    } catch (err) {
      console.error('Failed to fetch public questions:', err);
      useReviewStore.setState({ error: 'Could not load questions.', isLoading: false });
    }
  },

  submitPublicReview: async (token, payload) => {
    set({ isSubmitting: true, publicError: null });
    try {
      // The backend will get the hotelId from the token itself.
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