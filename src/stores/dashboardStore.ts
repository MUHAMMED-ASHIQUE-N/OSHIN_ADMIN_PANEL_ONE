
// src/stores/dashboardStore.ts
import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';
import { useFilterStore } from './filterStore'; // 1. Import filter store
const BASE_URL = import.meta.env.VITE_API_URL
// Type for our chart data points
type ChartDataPoint = { name: string; value: number };

// The state and actions for our store
interface DashboardState {
  dashboardData: ChartDataPoint[];
  isLoading: boolean;
  error: string | null;
  selectedYear: number;
  selectedPeriod: 'Yearly' | 'Monthly' | 'Weekly';
  selectedMonth: number; // 0-11 for Jan-Dec
  availableYears: number[];
  setYear: (year: number) => void;
  setPeriod: (period: 'Yearly' | 'Monthly' | 'Weekly') => void;
  setMonth: (month: number) => void;
  fetchDashboardData: () => Promise<void>;
}
type YearlyCompositeData = {
  compositeId: string;
  name: string;
  averageRating: number;
};

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export const useDashboardStore = create<DashboardState>((set, get) => ({
  dashboardData: [],
  isLoading: false,
  error: null,
  selectedYear: new Date().getFullYear(),
  selectedPeriod: 'Monthly', // Default to monthly view
  selectedMonth: new Date().getMonth(),
  availableYears: [2025, 2024, 2023], // Example years, you could fetch this too
  
  // Simple state setters
  setYear: (year) => set({ selectedYear: year }),
  setPeriod: (period) => set({ selectedPeriod: period }),
  setMonth: (month) => set({ selectedMonth: month }),

  // Main data fetching action
  fetchDashboardData: async () => {
    set({ isLoading: true, error: null });
    const { selectedYear, selectedPeriod, selectedMonth } = get();
    const token = useAuthStore.getState().token;
    const overallSatisfactionId = "68e91d12c5c21b687f910057"; // Your specific ID
const { category } = useFilterStore.getState(); // 2. Get the category
    try {
      let response;
      const config = { headers: { Authorization: `Bearer ${token}` } };
      
      // The logic to call the correct API endpoint based on the selected filter
      if (selectedPeriod === 'Yearly') {
        // For 'Yearly', we want a single value, so we use the old endpoint
        const startDate = `${selectedYear}-01-01`;
        const endDate = `${selectedYear}-12-31`;
      response = await axios.get<{ data: YearlyCompositeData[] }>(
          `${BASE_URL}/admin/analytics/composite-averages?startDate=${startDate}&endDate=${endDate}&category=${category}`, 
          config
        );
        // We need to format this response to match our chart data structure
        const yearlyData = response.data.data.find(c => c.compositeId === overallSatisfactionId);
        const formattedData = yearlyData ? [{ name: `${selectedYear} Avg`, value: yearlyData.averageRating }] : [];
        set({ dashboardData: formattedData });

      } else {
        // For 'Monthly' and 'Weekly', we use our new, efficient endpoint
        const params = new URLSearchParams({
            year: selectedYear.toString(),
            period: selectedPeriod,
            month: selectedMonth.toString(),
            compositeId: overallSatisfactionId,
            category: category // 3. Include category in the request
        });
        response = await axios.get(`${BASE_URL}/admin/analytics/composite-over-time?${params.toString()}`, config);
        
        // We need to format the names (e.g., from "01" to "Jan")
        const formattedData = response.data.data.map((item: { name: string, value: number }) => {
            if (selectedPeriod === 'Monthly') {
                return { ...item, name: months[parseInt(item.name) - 1] };
            }
            // Add weekly formatting if needed, e.g., "Week 1", "Week 2"
            return { ...item, name: `W${parseInt(item.name) + 1}` };
        });
        set({ dashboardData: formattedData });
        console.log({" dashboardData": formattedData });
        
      }

    } catch (err) {
      set({ error: 'Failed to fetch dashboard data.' });
    } finally {
      set({ isLoading: false });
    }
  },
}));