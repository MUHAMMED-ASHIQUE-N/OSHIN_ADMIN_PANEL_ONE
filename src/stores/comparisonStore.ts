//stores/comparisonStore.ts

import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';
import { AnalyticsItemType, ChartDataPoint } from './analyticsStore'; // Reuse types

const BASE_URL = import.meta.env.VITE_API_URL;

// Helper to get default dates
const getISODate = (offsetDays: number = 0): string => {
  const date = new Date();
  date.setDate(date.getDate() + offsetDays);
  return date.toISOString().split('T')[0];
};

interface ComparisonItem {
  id: string;
  name: string;
  type: AnalyticsItemType;
}

interface DateRange {
  start: string;
  end: string;
}

// Interface for the backend's single-average response
interface AverageResponseItem {
  name: string;
  value: number;
}

interface ComparisonState {
  selectedItem: ComparisonItem | null;
  dateRangeA: DateRange;
  dateRangeB: DateRange;
  comparisonData: ChartDataPoint[] | null; // Will hold [{name: 'Period A', ...}, {name: 'Period B', ...}]
  isLoading: boolean;
  error: string | null;
  setSelectedItem: (item: ComparisonItem | null) => void;
  setDateRangeA: (range: DateRange) => void;
  setDateRangeB: (range: DateRange) => void;
  fetchComparisonData: (category: 'room' | 'f&b') => Promise<void>;
}

export const useComparisonStore = create<ComparisonState>((set, get) => ({
  selectedItem: null,
  // Default: Last 7 days vs 7 days before that
  dateRangeA: { start: getISODate(-7), end: getISODate(0) },
  dateRangeB: { start: getISODate(-14), end: getISODate(-8) },
  comparisonData: null,
  isLoading: false,
  error: null,

  setSelectedItem: (item) => set({ selectedItem: item, comparisonData: null, error: null }), // Reset data on item change
  setDateRangeA: (range) => set({ dateRangeA: range, comparisonData: null }), // Reset data on date change
  setDateRangeB: (range) => set({ dateRangeB: range, comparisonData: null }), // Reset data on date change

  fetchComparisonData: async (category) => {
    const { selectedItem, dateRangeA, dateRangeB } = get();
    const token = useAuthStore.getState().token;

    if (!selectedItem) {
      set({ error: "No item selected." });
      return;
    }
    if (!token) {
       set({ error: "Not authenticated." });
       return;
    }

    set({ isLoading: true, error: null, comparisonData: null });

    const config = { headers: { Authorization: `Bearer ${token}` } };
    
    // Determine which endpoint to call
    const endpoint = selectedItem.type === 'composite'
      ? `${BASE_URL}/analytics/composite-averages`
      : `${BASE_URL}/analytics/question-average`;

    // Function to make one API call
    const fetchDataForRange = async (range: DateRange): Promise<AverageResponseItem | null> => {
        const params: any = {
            startDate: range.start,
            endDate: range.end,
            category: category,
        };
        // Add ID based on item type
        if (selectedItem.type === 'composite') {
            // composite-averages returns an array, we'll find our item
        } else { // question
             params.questionId = selectedItem.id;
        }

        const response = await axios.get<{ data: any }>(endpoint, { ...config, params });
        const responseData = response.data.data;

        if (!responseData) return null;

        // Find the specific item's data
        if (selectedItem.type === 'composite') {
            return (responseData as AverageResponseItem[]).find(c => c.name === selectedItem.name) || null;
        } else { // Question endpoint returns a single object
            return responseData as AverageResponseItem;
        }
    };

    try {
      // Call the API twice, once for each date range
      const [resultA, resultB] = await Promise.all([
        fetchDataForRange(dateRangeA),
        fetchDataForRange(dateRangeB)
      ]);

      const dataA = resultA?.value ?? 0; // Default to 0 if null/undefined
      const dataB = resultB?.value ?? 0;

      set({
        comparisonData: [
          { name: `Period A (${dateRangeA.start} to ${dateRangeA.end})`, value: dataA },
          { name: `Period B (${dateRangeB.start} to ${dateRangeB.end})`, value: dataB },
        ],
        isLoading: false,
      });

    } catch (err) {
      console.error("Failed to fetch comparison data:", err);
       let errorMsg = 'Failed to load comparison data.';
       if (axios.isAxiosError(err) && err.response?.data?.message) { errorMsg = err.response.data.message; }
       else if (err instanceof Error) { errorMsg = err.message; }
      set({ error: errorMsg, isLoading: false });
    }
  },
}));