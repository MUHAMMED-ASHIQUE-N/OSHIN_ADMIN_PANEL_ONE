import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';
const BASE_URL = import.meta.env.VITE_API_URL;

export interface ApiQuestion {
  _id: string;
  text: string;
  questionType: 'rating' | 'yes_no';
  category: 'room' | 'f&b' | 'cfc';
}

// ✅ ADDED 'answerText'
export interface AnswerPayload {
  question: string;
  rating?: number;
  answerBoolean?: boolean;
  answerText?: string; // For "Yes" answer details
}

// 🔥 UPDATED: Removed email
export interface GuestInfoPayload {
  name?: string;
  phone?: string;
  roomNumber?: string; // For Room
}
export interface ReviewPayload {
  // ✅ ADDED 'cfc'
  category: 'room' | 'f&b' | 'cfc';
  answers: AnswerPayload[];
  description?: string;
  // ✅ RENAMED to 'guestInfo'
guestInfo?: GuestInfoPayload;
}



interface ReviewState {
  questions: ApiQuestion[];
  answers: Record<string, number | boolean | null>;
  yesNoAnswerText: Record<string, string>; // ✅ NEW STATE for text inputs
  isLoading: boolean;
  isSubmitting: boolean;
  error: string | null;
  // ✅ ADDED 'cfc'
  fetchQuestions: (category: 'room' | 'f&b' | 'cfc') => Promise<void>;
  setAnswer: (questionId: string, answer: number | boolean) => void;
  setYesNoAnswerText: (questionId: string, text: string) => void; // ✅ NEW ACTION
  submitReview: (payload: ReviewPayload) => Promise<boolean>;
  resetReview: () => void;
}

const getAuthHeader = () => {
  const token = useAuthStore.getState().token;
  const headers: Record<string, string> = {}; // Start with empty headers object
  if (token) { // Only add if token exists (not null/empty)
    headers.Authorization = `Bearer ${token}`;
  }
  return { headers }; // Always return { headers: { ... } } for axios config
};

export const useReviewStore = create<ReviewState>((set, get) => ({
  questions: [],
  answers: {},
  yesNoAnswerText: {}, // ✅ Initialize
  isLoading: false,
  isSubmitting: false,
  error: null,

  fetchQuestions: async (category) => {
    set({ isLoading: true, error: null });
    try {
      const res = await axios.get(
        `${BASE_URL}/reviews/questions/${category}`,
        getAuthHeader()
      );
      set({ questions: res.data.data.questions || [], isLoading: false, error: null });
      console.log({ "questions": res.data.data.questions});
    } catch (err) {
      set({ error: 'Could not load questions.', isLoading: false });
    }
  },

  setAnswer: (questionId, answer) => {
    set(state => ({ answers: { ...state.answers, [questionId]: answer } }));
    // ✅ If user clicks "No" or "N/A", clear the text for that question
    if (answer === false || answer === 0) {
      const newTextAnswers = { ...get().yesNoAnswerText };
      delete newTextAnswers[questionId];
      set({ yesNoAnswerText: newTextAnswers });
    }
  },

  // ✅ NEW ACTION
  setYesNoAnswerText: (questionId, text) => {
    set(state => ({
      yesNoAnswerText: { ...state.yesNoAnswerText, [questionId]: text }
    }));
  },

  submitReview: async (payload) => {
    set({ isSubmitting: true, error: null });
    try {
      await axios.post(`${BASE_URL}/reviews`, payload, getAuthHeader());
      set({ isSubmitting: false });
      return true;
    } catch (err) {
      set({ error: 'Submission failed. Please try again.', isSubmitting: false });
      return false;
    }
  },

  // ✅ UPDATED Reset
  resetReview: () => set({ answers: {}, questions: [], yesNoAnswerText: {} }),
}));