import { create } from 'zustand';

// This type is correct and includes all categories
export type Category = 'room' | 'f&b' | 'cfc';

interface FilterState {
  category: Category;
  setCategory: (category: Category) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  category: 'room', // Default to 'room'
  setCategory: (category) => set({ category }),
}));