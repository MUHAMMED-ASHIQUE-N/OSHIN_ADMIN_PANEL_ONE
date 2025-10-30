//store/analyticsStore.ts

import { create } from 'zustand';
import axios, { AxiosResponse } from 'axios';
import { useAuthStore } from './authStore';
import { useFilterControlStore } from './filterControlStore';
import { useFilterStore } from './filterStore';

// Ensure VITE_API_URL is correctly set in your .env file
const BASE_URL = import.meta.env.VITE_API_URL;

export type AnalyticsItemType = 'composite' | 'question';
export type ChartDataPoint = { name: string; value: number };

// Interface for backend response from average endpoints
interface AverageResponseItem {
  name: string;
  value: number;
  compositeId?: string; // ID for composites
  questionId?: string; // ID for questions (if backend provides)
}

interface AnalyticsState {
  currentItemId: string | null;
  currentItemName: string | null;
  currentItemType: AnalyticsItemType | null;
  mainChartData: ChartDataPoint[];
  breakdownData: ChartDataPoint[]; // Only for composites
  isLoadingMain: boolean;
  isLoadingBreakdown: boolean;
  error: string | null;
  fetchAnalyticsData: (
      itemId: string,
      itemName: string,
      itemType: AnalyticsItemType
  ) => Promise<void>;
  resetSelection: () => void;
}

export const useAnalyticsStore = create<AnalyticsState>((set, _) => ({
  currentItemId: null,
  currentItemName: null,
  currentItemType: null,
  mainChartData: [],
  breakdownData: [],
  isLoadingMain: false,
  isLoadingBreakdown: false,
  error: null,

  resetSelection: () => {
     set({
        currentItemId: null, currentItemName: null, currentItemType: null,
        mainChartData: [], breakdownData: [],
        isLoadingMain: false, isLoadingBreakdown: false, error: null,
     });
  },

  fetchAnalyticsData: async (itemId, itemName, itemType) => {
    set({
      currentItemId: itemId, currentItemName: itemName, currentItemType: itemType,
      isLoadingMain: true, isLoadingBreakdown: itemType === 'composite',
      error: null, mainChartData: [], breakdownData: []
    });

    const { selectedYear, selectedPeriod, selectedMonth, startDate, endDate } = useFilterControlStore.getState();
    const token = useAuthStore.getState().token;
    const { category } = useFilterStore.getState();

    if (!token) {
        set({ error: 'Auth token missing.', isLoadingMain: false, isLoadingBreakdown: false });
        console.error("Auth token missing in fetchAnalyticsData");
        return;
    }

    const config = { headers: { Authorization: `Bearer ${token}` } };
    console.log(`Fetching Analytics: Type=${itemType}, Name=${itemName}, Period=${selectedPeriod}, Category=${category}`);

    try {
      let mainChartPromise: Promise<AxiosResponse | null>;
      let breakdownPromise: Promise<AxiosResponse | null> = Promise.resolve(null); // Default to null (only composites fetch breakdown)

      let mainChartStartDate: string | null = null;
      let mainChartEndDate: string | null = null;
      let breakdownStartDate: string | null = null;
      let breakdownEndDate: string | null = null;

      let mainChartEndpoint = '';
      let mainChartParams: any = {};
      let needsAverageEndpoint = false; // Flag for Yearly/Custom periods

      // Determine date ranges and API endpoints based on the selected period
      if (selectedPeriod === 'Yearly' || selectedPeriod === 'Custom') {
          needsAverageEndpoint = true;
          mainChartStartDate = selectedPeriod === 'Yearly' ? `${selectedYear}-01-01` : startDate;
          mainChartEndDate = selectedPeriod === 'Yearly' ? `${selectedYear}-12-31` : endDate;
          breakdownStartDate = mainChartStartDate; // Use same date range for breakdown
          breakdownEndDate = mainChartEndDate;

          // Validate dates
          if (!mainChartStartDate || !mainChartEndDate) {
              throw new Error("Start or End date is missing for Yearly/Custom period.");
          }

          // Select endpoint based on item type
          if (itemType === 'composite') {
              mainChartEndpoint = `${BASE_URL}/analytics/composite-averages`;
              mainChartParams = { startDate: mainChartStartDate, endDate: mainChartEndDate, category };
              console.log(`Yearly/Custom: Calling ${mainChartEndpoint} for Composite`);
          } else { // Question
              // ⚠️ NEW BACKEND ENDPOINT NEEDED ⚠️
              mainChartEndpoint = `${BASE_URL}/analytics/question-average`; // Assumed endpoint name
              mainChartParams = { startDate: mainChartStartDate, endDate: mainChartEndDate, category, questionId: itemId };
              console.log(`Yearly/Custom: Calling ${mainChartEndpoint} for Question`);
          }

      } else { // Monthly or Weekly
          mainChartStartDate = `${selectedYear}-01-01`; // Full year needed for breakdown
          mainChartEndDate = `${selectedYear}-12-31`;
          breakdownStartDate = mainChartStartDate;
          breakdownEndDate = mainChartEndDate;

           // Select endpoint based on item type
           if (itemType === 'composite') {
              mainChartEndpoint = `${BASE_URL}/analytics/composite-over-time`;
              mainChartParams = { year: selectedYear, period: selectedPeriod, month: selectedPeriod === 'Weekly' ? selectedMonth : undefined, compositeId: itemId, category };
              console.log(`Monthly/Weekly: Calling ${mainChartEndpoint} for Composite`);
          } else { // Question
               // ⚠️ NEW BACKEND ENDPOINT NEEDED ⚠️
              mainChartEndpoint = `${BASE_URL}/analytics/question-over-time`; // Assumed endpoint name
              mainChartParams = { year: selectedYear, period: selectedPeriod, month: selectedPeriod === 'Weekly' ? selectedMonth : undefined, questionId: itemId, category };
              console.log(`Monthly/Weekly: Calling ${mainChartEndpoint} for Question`);
          }
      }

       // Set up the main chart API call promise
       mainChartPromise = axios.get(mainChartEndpoint, { ...config, params: mainChartParams });

      // Set up the breakdown API call promise ONLY if the item is a composite
      if (itemType === 'composite') {
          console.log(`Fetching Breakdown for composite ${itemId} using dates: ${breakdownStartDate} to ${breakdownEndDate}`);
          const breakdownConfig = {
               ...config,
               params: { startDate: breakdownStartDate, endDate: breakdownEndDate, category, compositeId: itemId }
          };
          breakdownPromise = axios.get(`${BASE_URL}/analytics/question-averages`, breakdownConfig);
      } else {
          // If it's a question, ensure breakdown loading is set to false immediately
          set({ isLoadingBreakdown: false });
      }


      // --- Fetch data concurrently ---
      const [mainChartRes, breakdownRes] = await Promise.all([mainChartPromise, breakdownPromise]);

      // --- Process main chart data ---
      let formattedMainData: ChartDataPoint[] = []; // Initialize as empty array
      // Check if the response exists, has data, and data is an array (or object for single question avg)
      if (mainChartRes?.data?.data) {
          const responseData = mainChartRes.data.data;

          if (needsAverageEndpoint) { // Yearly or Custom
               const periodLabel = selectedPeriod === 'Yearly' ? `${selectedYear} Avg` : 'Custom Avg';
               let foundData: AverageResponseItem | undefined;

               if (itemType === 'composite') {
                   // Ensure responseData is treated as an array and items are valid
                  foundData = (responseData as AverageResponseItem[]).find(c => c && c.name === itemName);
               } else { // Question average endpoint might return single object or array[0]
                  foundData = Array.isArray(responseData) ? responseData[0] : responseData;
               }

               console.log(`Searching for "${itemName}" in ${selectedPeriod} data. Found:`, foundData);
               // Ensure foundData and its value are valid before creating the data point
               if (foundData && typeof foundData.value === 'number') {
                   formattedMainData = [{ name: periodLabel, value: foundData.value }];
               } else {
                   console.warn(`${selectedPeriod} data object NOT FOUND or invalid for ${itemType} NAME ${itemName}. Response Data:`, responseData);
                   formattedMainData = []; // Ensure empty array if not found or invalid
               }

          } else { // Monthly or Weekly
                console.log("Monthly/Weekly response data received:", responseData);
                const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
                // Use .reduce for safe mapping, filtering out invalid items
                formattedMainData = (responseData as any[]).reduce((acc: ChartDataPoint[], item: any) => {
                    if (item && typeof item.name === 'string' && typeof item.value === 'number') {
                        let name = item.name;
                        if (selectedPeriod === 'Monthly') {
                            const monthIndex = parseInt(item.name) - 1;
                            name = (monthIndex >= 0 && monthIndex < 12) ? months[monthIndex] : `M${item.name}`;
                        } else if (selectedPeriod === 'Weekly') {
                           const weekNum = parseInt(item.name);
                           name = !isNaN(weekNum) ? `W${weekNum + 1}` : `W${item.name}`;
                        }
                        acc.push({ name: name, value: item.value });
                    } else {
                        console.warn("Invalid item structure in Monthly/Weekly response:", item);
                    }
                    return acc;
                }, []);
          }
      } else if (mainChartRes) { // Response received but data field is missing/null
            console.log(`Main chart response received, but data property missing/null for ${itemType} ${itemName}:`, mainChartRes.data);
            formattedMainData = []; // Ensure empty
      } else { // mainChartPromise resolved to null (shouldn't happen with current logic unless error occurred)
            console.log(`Main chart promise resolved to null for ${itemType} ${itemName}.`);
            formattedMainData = []; // Ensure empty
      }

      console.log(">>> FINAL formattedMainData before setting state:", formattedMainData);
      set({ mainChartData: formattedMainData, isLoadingMain: false });

      // --- Process and set breakdown data ---
      // Ensure breakdownRes exists and has data.data before accessing it
      const breakdownResultData = breakdownRes?.data?.data ?? [];
      console.log("Setting breakdownData:", breakdownResultData);
      // Ensure isLoadingBreakdown is set correctly even if breakdownPromise resolved to null
      set({ breakdownData: breakdownResultData, isLoadingBreakdown: false });


    } catch (err) {
      console.error(`Fetch analytics error for ${itemType} ${itemName}:`, err);
      let errorMsg = `Failed to fetch data for ${itemName}.`;
      if (axios.isAxiosError(err)) {
          // Include response details if available
          errorMsg = err.response?.data?.message || err.message || errorMsg;
          console.error("Axios Error Details:", err.response?.status, err.response?.data);
      } else if (err instanceof Error) {
          errorMsg = err.message;
      }
      // Set error and ensure both loading states are false, clear data
      set({ error: errorMsg, isLoadingMain: false, isLoadingBreakdown: false, mainChartData: [], breakdownData: [] });
    }
  },
}));