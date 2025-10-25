// src/stores/reviewStore.ts
import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore'; // Import the central auth store
const BASE_URL = import.meta.env.VITE_API_URL;

// Define the shape of a question from your API
export interface ApiQuestion {
  _id: string;
  text: string;
  questionType: 'rating' | 'yes_no';
}

// Define the payload for submission
interface AnswerPayload {
  question: string;
  rating?: number;
  answerBoolean?: boolean;
}
interface ReviewPayload {
  category: 'room' | 'f&b';
  answers: AnswerPayload[];
  description?: string;
  roomGuestInfo?: {
    name: string;
    phone: string;
    roomNumber: string;
  };
}

// Define the state and actions for the store
interface ReviewState {
  questions: ApiQuestion[];
  // Answers can be a number (rating) or boolean (yes/no)
  answers: Record<string, number | boolean | null>;
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  fetchQuestions: (category: 'room' | 'f&b') => Promise<void>;
  setAnswer: (questionId: string, answer: number | boolean) => void;
  submitReview: (payload: ReviewPayload) => Promise<boolean>;
  resetReview: () => void;
}

const getAuthHeader = () => {
  const token = useAuthStore.getState().token;
  return { headers: { Authorization: `Bearer ${token}` } };
};

export const useReviewStore = create<ReviewState>((set, _) => ({
  questions: [],
  answers: {},
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchQuestions: async (category) => {
    set({ isLoading: true });
    try {
      // Use the new, protected endpoint
      const res = await axios.get(
        `${BASE_URL}/reviews/questions/${category}`,
        getAuthHeader()
      );
      set({ questions: res.data.data.questions, isLoading: false, error: null });
      console.log({ "questions": res.data.data.questions});
    } catch (err) {
      set({ error: 'Could not load questions.', isLoading: false });
    }
  },

  setAnswer: (questionId, answer) => {
    set(state => ({ answers: { ...state.answers, [questionId]: answer } }));
  },

  submitReview: async (payload) => {
    set({ isSubmitting: true, error: null });
    
    // The user ID is now attached on the backend via the auth token
    
    try {
      await axios.post(`${BASE_URL}/reviews`, payload, getAuthHeader());
      set({ isSubmitting: false });
      return true;
    } catch (err) {
      set({ error: 'Submission failed. Please try again.', isSubmitting: false });
      return false;
    }
  },

  resetReview: () => set({ answers: {}, questions: [] }),
}));