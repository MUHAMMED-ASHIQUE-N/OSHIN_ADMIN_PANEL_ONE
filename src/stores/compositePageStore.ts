import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';
import { useFilterControlStore } from './filterControlStore'; // Use correct store name
import { useFilterStore } from './filterStore';

const BASE_URL = import.meta.env.VITE_API_URL;
type ChartDataPoint = { name: string; value: number };

// Interface for backend response from /composite-averages (lacks compositeId)
interface CompositeAverageResponseItem {
  name: string;
  value: number;
  compositeId?: string; // Optional if backend adds it later
}

interface CompositePageState {
  mainChartData: ChartDataPoint[];
  breakdownData: ChartDataPoint[];
  isLoadingMain: boolean;
  isLoadingBreakdown: boolean;
  error: string | null;
  // Accept compositeId AND compositeName
  fetchCompositePageData: (compositeId: string, compositeName: string) => Promise<void>;
}

export const useCompositePageStore = create<CompositePageState>((set) => ({
  mainChartData: [],
  breakdownData: [],
  isLoadingMain: true,
  isLoadingBreakdown: true,
  error: null,

  fetchCompositePageData: async (compositeId, compositeName) => { // Added compositeName parameter
    set({
        isLoadingMain: true, isLoadingBreakdown: true, error: null,
        mainChartData: [], breakdownData: []
    });

    const { selectedYear, selectedPeriod, selectedMonth, startDate, endDate } = useFilterControlStore.getState();
    const token = useAuthStore.getState().token;
    const { category } = useFilterStore.getState();

    if (!token) {
        set({ error: 'Authentication token not found.', isLoadingMain: false, isLoadingBreakdown: false });
        console.error("Auth token missing in fetchCompositePageData");
        return;
    }

    const config = { headers: { Authorization: `Bearer ${token}` } };
    console.log(`Fetching data for Composite: ${compositeName} (ID: ${compositeId}), Period: ${selectedPeriod}, Category: ${category}`);

    try {
      let mainChartPromise: Promise<any>;
      let breakdownParams: any;

      // --- Determine API calls based on period ---

      if (selectedPeriod === 'Yearly' || selectedPeriod === 'Custom') { // Group Yearly and Custom
        let mainChartStartDate: string | null = null;
        let mainChartEndDate: string | null = null;

        if (selectedPeriod === 'Yearly') {
            mainChartStartDate = `${selectedYear}-01-01`;
            mainChartEndDate = `${selectedYear}-12-31`;
            console.log(`Yearly/Custom: Calling /composite-averages with startDate=${mainChartStartDate}, endDate=${mainChartEndDate}`);
        } else { // Custom
            mainChartStartDate = startDate; // Use custom dates
            mainChartEndDate = endDate;
            console.log(`Yearly/Custom: Calling /composite-averages with startDate=${mainChartStartDate}, endDate=${mainChartEndDate}`);
        }

        // Check if dates are valid before making the call
        if (!mainChartStartDate || !mainChartEndDate) {
             console.error("Start or end date is missing for Yearly/Custom fetch.");
             mainChartPromise = Promise.resolve(null); // Avoid making the call with invalid dates
        } else {
            mainChartPromise = axios.get<{ data: CompositeAverageResponseItem[] }>(
              `${BASE_URL}/analytics/composite-averages`, {
                ...config,
                params: { startDate: mainChartStartDate, endDate: mainChartEndDate, category: category }
              });
        }
        // Set breakdown params based on period
         breakdownParams = {
              startDate: mainChartStartDate, // Use the same range for breakdown
              endDate: mainChartEndDate,
              compositeId: compositeId,
              category: category,
          };

      } else { // Monthly or Weekly
         console.log(`Monthly/Weekly: Calling /composite-over-time...`);
        mainChartPromise = axios.get(`${BASE_URL}/analytics/composite-over-time`, {
             ...config,
            params: { year: selectedYear, period: selectedPeriod, month: selectedPeriod === 'Weekly' ? selectedMonth : undefined, compositeId: compositeId, category: category }
         });
        breakdownParams = {
             startDate: `${selectedYear}-01-01`,
             endDate: `${selectedYear}-12-31`,
             compositeId: compositeId,
             category: category
         };
      }

      // --- Fetch data ---
      const breakdownPromise = axios.get(`${BASE_URL}/analytics/question-averages`, { ...config, params: breakdownParams });
      const [mainChartRes, breakdownRes] = await Promise.all([mainChartPromise, breakdownPromise]);

      // --- Process main chart data ---
      let formattedMainData: ChartDataPoint[] = [];
      if (mainChartRes) {
        // Handle both Yearly and Custom using /composite-averages response
        if (selectedPeriod === 'Yearly' || selectedPeriod === 'Custom') {
            console.log(`${selectedPeriod} response data received:`, mainChartRes.data.data);
            const allAverages: CompositeAverageResponseItem[] = mainChartRes.data.data || [];
            const periodData = allAverages.find((c) => c.name === compositeName); // Find by name
            const periodLabel = selectedPeriod === 'Yearly' ? `${selectedYear} Avg` : 'Custom Avg';
            console.log(`Searching for NAME "${compositeName}" in ${selectedPeriod} data. Found:`, periodData);
            if (periodData) {
                formattedMainData = [{ name: periodLabel, value: periodData.value }];
            } else {
                 console.warn(`${selectedPeriod} data object NOT FOUND for composite NAME ${compositeName}.`);
                 formattedMainData = [];
            }
        } else { // Monthly or Weekly
            console.log("Monthly/Weekly response data received:", mainChartRes.data.data);
            const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
            formattedMainData = mainChartRes.data.data.map((item: { name: string, value: number }) => {
                if (selectedPeriod === 'Monthly') {
                    const monthIndex = parseInt(item.name) - 1;
                    return { ...item, name: months[monthIndex] ?? `M${item.name}` };
                }
                if (selectedPeriod === 'Weekly') {
                   const weekNum = parseInt(item.name);
                   return { ...item, name: `W${!isNaN(weekNum) ? weekNum + 1 : item.name}` };
                }
                return item; // Should ideally not be reached
            });
        }
      }
       console.log("Setting mainChartData:", formattedMainData);
      set({ mainChartData: formattedMainData, isLoadingMain: false });


      // --- Set breakdown data ---
       console.log("Setting breakdownData:", breakdownRes?.data?.data ?? []);
      set({ breakdownData: breakdownRes?.data?.data ?? [], isLoadingBreakdown: false });


    } catch (err) {
        console.error("Fetch composite page data error:", err);
        let errorMsg = 'Failed to fetch composite data.';
        if (axios.isAxiosError(err) && err.response?.data?.message) { errorMsg = err.response.data.message; }
        else if (err instanceof Error) { errorMsg = err.message; }
        set({ error: errorMsg, isLoadingMain: false, isLoadingBreakdown: false });
    }
  },
}));