// src/stores/compositePageStore.ts
import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';
import { useDashboardStore } from './dashboardStore'; // We'll use its filter state
import { useFilterStore } from './filterStore'; // ✅ 1. Import the new filter store

const BASE_URL = import.meta.env.VITE_API_URL;
type ChartDataPoint = { name: string; value: number };

interface CompositePageState {
  mainChartData: ChartDataPoint[];
  breakdownData: ChartDataPoint[];
  isLoadingMain: boolean;
  isLoadingBreakdown: boolean;
  error: string | null;
  fetchCompositePageData: (compositeId: string) => Promise<void>;
}

export const useCompositePageStore = create<CompositePageState>((set) => ({
  mainChartData: [],
  breakdownData: [],
  isLoadingMain: true,
  isLoadingBreakdown: true,
  error: null,

  fetchCompositePageData: async (compositeId) => {
    set({ isLoadingMain: true, isLoadingBreakdown: true, error: null });

    // Get all required state from other stores
    const { selectedYear, selectedPeriod, selectedMonth } = useDashboardStore.getState();
    const token = useAuthStore.getState().token;
    const { category } = useFilterStore.getState(); // ✅ 2. Get the current category
    
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      // --- Fetch data for both charts in parallel for speed ---
      const [mainChartRes, breakdownRes] = await Promise.all([
        // 1. Fetch main chart data (yearly, monthly, weekly average of the composite)
        axios.get(`${BASE_URL}/analytics/composite-over-time`, {
          ...config,
          params: {
            year: selectedYear,
            period: selectedPeriod,
            month: selectedMonth,
            compositeId: compositeId,
            category: category, // ✅ 3. Add category to params
          }
        }),
        // 2. Fetch breakdown data (average of each question in the composite for the year)
        axios.get(`${BASE_URL}/analytics/question-averages`, {
          ...config,
          params: {
            startDate: `${selectedYear}-01-01`,
            endDate: `${selectedYear}-12-31`,
            compositeId: compositeId,
            category: category, // ✅ 3. Add category to params
          }
        })
      ]);

      // --- Process and set main chart data ---
      const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
      const formattedMainData = mainChartRes.data.data.map((item: { name: string, value: number }) => {
        if (selectedPeriod === 'Monthly') {
          return { ...item, name: months[parseInt(item.name) - 1] };
        }
        if (selectedPeriod === 'Weekly') {
            return { ...item, name: `W${parseInt(item.name) + 1}` };
        }
        return item;
      });
      set({ mainChartData: formattedMainData, isLoadingMain: false });

      // --- Set breakdown data ---
      set({ breakdownData: breakdownRes.data.data, isLoadingBreakdown: false });
console.log({"breakdownData": breakdownRes.data.data},{"mainChartData": formattedMainData });

    } catch (err) {
      set({ error: 'Failed to fetch composite data.', isLoadingMain: false, isLoadingBreakdown: false });
    }
  },
}));