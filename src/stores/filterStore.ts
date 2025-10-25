// src/stores/filterStore.ts
import { create } from 'zustand';

type Category = 'room' | 'f&b';

interface FilterState {
  category: Category;
  setCategory: (category: Category) => void;
}

export const useFilterStore = create<FilterState>((set) => ({
  category: 'room', // Default to 'room'
  setCategory: (category) => set({ category }),
}));