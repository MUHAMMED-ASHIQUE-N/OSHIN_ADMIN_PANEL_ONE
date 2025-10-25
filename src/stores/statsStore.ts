// src/stores/statsStore.ts
import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';

const BASE_URL = import.meta.env.VITE_API_URL;
interface Stats {
  totalReviews: number;
  totalStaff: number;
  activeStaff: number;
}

interface StatsState {
  stats: Stats;
  isLoading: boolean;
  // ✅ 1. Modify fetchStats to accept the category
  fetchStats: (category: 'room' | 'f&b') => Promise<void>;
}
export const useStatsStore = create<StatsState>((set) => ({
  stats: { totalReviews: 0, totalStaff: 0, activeStaff: 0 },
  isLoading: true,
  fetchStats: async (category) => {
    set({ isLoading: true });
    
    // Get all required state from other stores
    const token = useAuthStore.getState().token;
    // const { category } = useFilterStore.getState(); // ✅ 2. Get the current category
    
const config = { headers: { Authorization: `Bearer ${token}` } };
    const reviewStatsConfig = {
      ...config,
      params: { category: category } // ✅ 3. Use the provided category
    };

    try {
      // Fetch both sets of stats in parallel
      const [reviewStatsRes, userStatsRes] = await Promise.all([
        // This call gets review stats AND needs the category filter
        axios.get( `${BASE_URL}/analytics/stats`, reviewStatsConfig), 
        // This call gets user stats and does NOT need the category filter
        axios.get(`${BASE_URL}/users/stats`, config) 
      ]);

      set({
        stats: {
          totalReviews: reviewStatsRes.data.data.totalSubmissions || 0,
          totalStaff: userStatsRes.data.data.totalStaff || 0,
          activeStaff: userStatsRes.data.data.activeStaff || 0,
        },
        isLoading: false
      });
      console.log({"stats": {
        totalReviews: reviewStatsRes.data.data.totalSubmissions || 0,
        totalStaff: userStatsRes.data.data.totalStaff || 0,
        activeStaff: userStatsRes.data.data.activeStaff || 0,
      }});
    } catch (error) {
      console.error("Failed to fetch stats", error);
      set({ isLoading: false });
    }
  },
}));