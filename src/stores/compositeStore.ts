//stores/compositeStore.ts

import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';
const BASE_URL = import.meta.env.VITE_API_URL

export interface Composite {
  _id: string;
  name: string;
  questions: string[]; // Array of question IDs
  category: 'room' | 'f&b';
  order: number; // ✅ ADDED
}

interface CompositeState {
  composites: Composite[];
  isLoading: boolean;
  error: string | null;
  fetchComposites: () => Promise<void>;
}

export const useCompositeStore = create<CompositeState>((set) => ({
  composites: [],
  isLoading: false,
  error: null,

  fetchComposites: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = useAuthStore.getState().token;
      const response = await axios.get(`${BASE_URL}/admin/management/composites` , {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const filteredComposites = response.data.data.composites.filter(
        (c: Composite) => c._id !== "68e91d12c5c21b687f910057"
      );

      set({ composites: filteredComposites, isLoading: false });
      console.log({ "composites": filteredComposites});
      
    } catch (err) {
      set({ error: 'Failed to fetch composites.', isLoading: false });
    }
  },
}));