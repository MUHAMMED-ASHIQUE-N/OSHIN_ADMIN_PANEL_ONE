// src/stores/yesNoResponseStore.ts
import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore'; // Ensure path is correct

const BASE_URL = import.meta.env.VITE_API_URL;

// Interface for a single Q/A pair within a review
interface YesNoAnswerPair {
    questionText: string;
    answer: boolean; // true for Yes, false for No
}

// Updated Interface: Represents a single Review containing Yes/No answers
export interface YesNoReviewResponse {
  _id: string; // Changed from reviewId to match backend _id
  createdAt: string;
  description?: string;
  roomGuestInfo?: {
    name?: string;
    phone?: string;
    roomNumber?: string;
  };
  yesNoAnswers: YesNoAnswerPair[]; // Array of question/answer pairs
}

// State Interface remains similar but uses the new data structure
interface YesNoResponseState {
  responses: YesNoReviewResponse[]; // Array of full reviews
  isLoading: boolean;
  error: string | null;
  fetchResponses: (category: 'room' | 'f&b', startDate?: string, endDate?: string) => Promise<void>;
}

export const useYesNoResponseStore = create<YesNoResponseState>((set) => ({
  responses: [],
  isLoading: false,
  error: null,

  fetchResponses: async (category, startDate, endDate) => {
    set({ isLoading: true, error: null, responses: [] });
    const token = useAuthStore.getState().token;
    const params: any = { category };
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;
    const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: params
    };

    try {
      // Expect the new data structure
      const response = await axios.get<{ data: YesNoReviewResponse[] }>(
        `${BASE_URL}/analytics/yes-no-responses`, // Correct URL
        config
      );
      set({ responses: response.data.data, isLoading: false });
      console.log({ "yesNoReviewResponses": response.data.data }); // Log new structure
    } catch (err) {
      console.error("Failed to fetch yes/no responses:", err);
      const errorMsg = axios.isAxiosError(err) && err.response?.data?.message
                       ? err.response.data.message
                       : 'Failed to load responses.';
      set({ error: errorMsg, isLoading: false });
    }
  },
}));