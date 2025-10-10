import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';
const BASE_URL = import.meta.env.VITE_API_URL
interface Stats {
  totalReviews: number;
  totalStaff: number;
  activeStaff: number;
}

interface StatsState {
  stats: Stats;
  isLoading: boolean;
  fetchStats: () => Promise<void>;
}

export const useStatsStore = create<StatsState>((set) => ({
  stats: { totalReviews: 0, totalStaff: 0, activeStaff: 0 },
  isLoading: true,
  fetchStats: async () => {
    set({ isLoading: true });
    const token = useAuthStore.getState().token;
    const config = { headers: { Authorization: `Bearer ${token}` } };

    try {
      // Fetch both sets of stats in parallel
      const [reviewStatsRes, userStatsRes] = await Promise.all([
        axios.get( `${BASE_URL}/admin/analytics/stats`, config),
        axios.get(`${BASE_URL}/admin/users/stats`, config)
      ]);

      set({
        stats: {
          totalReviews: reviewStatsRes.data.data.totalSubmissions || 0,
          totalStaff: userStatsRes.data.data.totalStaff || 0,
          activeStaff: userStatsRes.data.data.activeStaff || 0,
        },
        isLoading: false
      });
    } catch (error) {
      console.error("Failed to fetch stats", error);
      set({ isLoading: false });
    }
  },
}));