import { create } from 'zustand';

// ✅ ADDED 'cfc'
export type Category = 'room' | 'f&b' | 'cfc';

interface FilterState {
  category: Category;
  setCategory: (category: Category) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  category: 'room', // Default to 'room'
  setCategory: (category) => set({ category }),
}));
