//stores/reportStore.ts

import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';
import { generateYearlyReportPDF, FullReportData } from '../utils/pdfReportGenerator';
import toast from 'react-hot-toast';

const BASE_URL = import.meta.env.VITE_API_URL;

// --- Interfaces for the API response ---
// This is the "flat" data your API sends
interface ApiDailyBreakdown {
  date: string;
  overallAverage: number;
  totalReviews: number;
}
interface ApiMonthlyQuestionAvg {
  questionId: string;
  questionText: string;
  averages: number[];
}
interface ApiYearlyQuestionAvg {
  questionId: string;
  questionText: string;
  yearlyAverage: number;
  totalReviews: number;
}
interface ApiMonthlyCompositeAvg {
  compositeId: string;
  compositeName: string;
  averages: number[];
}
interface ApiYearlyCompositeAvg {
  compositeId: string;
  compositeName: string;
  yearlyAverage: number;
}

// This is the raw, flat response from your API
interface ApiDashboardResponse {
  dailyBreakdown: ApiDailyBreakdown[];
  monthlyQuestionAverages: ApiMonthlyQuestionAvg[];
  yearlyQuestionAverages: ApiYearlyQuestionAvg[];
  monthlyCompositeAverages: ApiMonthlyCompositeAvg[];
  yearlyCompositeAverages: ApiYearlyCompositeAvg[];
}

// --- Zustand Store ---

interface ReportState {
  isModalOpen: boolean;
  isLoadingYears: boolean;
  isLoadingReport: boolean;
  availableYears: number[];
  error: string | null;
  openModal: () => void;
  closeModal: () => void;
  fetchAvailableYears: (category: 'room' | 'f&b') => Promise<void>;
  downloadReport: (year: number, category: 'room' | 'f&b') => Promise<void>;
  clearYears: () => void;
}

export const useReportStore = create<ReportState>((set) => ({
  isModalOpen: false,
  isLoadingYears: false,
  isLoadingReport: false,
  availableYears: [],
  error: null,

  openModal: () => set({ isModalOpen: true, error: null, availableYears: [] }),
  closeModal: () => set({ isModalOpen: false }),
  clearYears: () => set({ availableYears: [] }),

  fetchAvailableYears: async (category) => {
    // ... (This function was correct, no changes needed)
    set({ isLoadingYears: true, error: null });
    const token = useAuthStore.getState().token;
    if (!token) {
      set({ isLoadingYears: false, error: 'Not authenticated' });
      return;
    }
    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: { category },
      };
      const response = await axios.get<number[]>(
        `${BASE_URL}/analytics/years`,
        config
      );
      set({ availableYears: response.data || [], isLoadingYears: false });
    } catch (err) {
      console.error('Failed to fetch available years:', err);
      set({ error: 'Could not load years.', isLoadingYears: false });
    }
  },

  downloadReport: async (year, category) => {
    set({ isLoadingReport: true, error: null });
    const token = useAuthStore.getState().token;
    const toastId = toast.loading('Generating report... This may take a moment.');

    try {
      const config = {
        headers: { Authorization: `Bearer ${token}` },
        params: { year, category },
      };

      // 1. Fetch the raw, flat data from the API
      const response = await axios.get<ApiDashboardResponse>(
        `${BASE_URL}/analytics/full-yearly-report`,
        config
      );

      const apiData = response.data;
      if (!apiData) {
        throw new Error('No data received from server.');
      }

      // 2. Transform the flat API data into the nested FullReportData structure
      const transformedData: FullReportData = {
        // Create questionHeaders from the yearly questions list
        questionHeaders: apiData.yearlyQuestionAverages.map((q) => ({
          id: q.questionId,
          text: q.questionText,
        })),

        // This is the new field for the modified PDF generator
        dailyBreakdown: apiData.dailyBreakdown,
        
        // The PDF gen expects dailyData, but our API doesn't send this.
        // We'll send an empty array and use dailyBreakdown in the PDF gen instead.
        dailyData: [], 

        monthlyData: {
          questions: apiData.monthlyQuestionAverages.map((q) => ({
            name: q.questionText, // Rename
            // Format numbers to 2 decimal places, keep 0 as "N/A"
            averages: q.averages.map(avg => avg === 0 ? "N/A" : avg.toFixed(2)),
          })),
          composites: apiData.monthlyCompositeAverages.map((c) => ({
            name: c.compositeName, // Rename
            averages: c.averages.map(avg => avg === 0 ? "N/A" : avg.toFixed(2)),
          })),
        },
        
        yearlyData: {
          questions: apiData.yearlyQuestionAverages.map((q) => ({
            name: q.questionText, // Rename
            value: q.yearlyAverage, // Rename
          })),
          composites: apiData.yearlyCompositeAverages.map((c) => ({
            name: c.compositeName, // Rename
            value: c.yearlyAverage, // Rename
          })),
        },
      };

      // 3. Pass the correctly shaped data to the PDF generator
      generateYearlyReportPDF(transformedData, year, category);

      toast.success('Report downloaded successfully!', { id: toastId });
      set({ isLoadingReport: false, isModalOpen: false });
    } catch (err) {
      let errorMsg = 'Failed to generate report.';
      if (axios.isAxiosError(err) && err.response?.data?.message) {
        errorMsg = err.response.data.message;
      } else if (err instanceof Error) {
        errorMsg = err.message;
      }
      console.error('Failed to download report:', err);
      toast.error(errorMsg, { id: toastId });
      set({ error: errorMsg, isLoadingReport: false });
    }
  },
}));
