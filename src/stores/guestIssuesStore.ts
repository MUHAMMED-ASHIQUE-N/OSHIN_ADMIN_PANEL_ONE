// src/stores/guestIssuesStore.ts
import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

const BASE_URL = import.meta.env.VITE_API_URL;

export interface GuestIssue {
  _id: string;
  createdAt: string; // ISO date string
  description?: string;
  roomGuestInfo?: {
    name?: string;
    phone?: string;
    roomNumber?: string;
  };
  // Add triggeringQuestionText if you implement that on the backend
}

interface GuestIssuesState {
  issues: GuestIssue[];
  isLoading: boolean;
  error: string | null;
  fetchIssues: (category: 'room' | 'f&b', startDate?: string, endDate?: string) => Promise<void>;
}

export const useGuestIssuesStore = create<GuestIssuesState>((set) => ({
  issues: [],
  isLoading: false,
  error: null,

  fetchIssues: async (category, startDate, endDate) => {
    set({ isLoading: true, error: null, issues: [] }); // Clear previous issues
    const token = useAuthStore.getState().token;
    const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: { category } as any // Type assertion for params
    };

    // Add dates to params if they exist
    if (startDate) config.params.startDate = startDate;
    if (endDate) config.params.endDate = endDate;


    try {
      const response = await axios.get<{ data: GuestIssue[] }>(
        `${BASE_URL}/analytics/issues`,
        config
      );
      set({ issues: response.data.data, isLoading: false });
        console.log({ "issues": response.data.data });
    } catch (err) {
      console.error("Failed to fetch guest issues:", err);
      const errorMsg = axios.isAxiosError(err) && err.response?.data?.message
                       ? err.response.data.message
                       : 'Failed to load issues.';
      set({ error: errorMsg, isLoading: false });
    }
  },
}));