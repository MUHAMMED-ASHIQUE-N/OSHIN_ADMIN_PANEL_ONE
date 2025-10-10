import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';
import {  useCompositeStore } from './compositeStore'; // Reuse the Composite type
const BASE_URL = import.meta.env.VITE_API_URL
// Define types for Question and Staff
export interface Question {
  _id: string;
  text: string;
}
export interface Staff {
  _id: string;
  fullName: string;
  username: string;
  isActive: boolean;
}
type CreateStaffPayload = {
    fullName: string;
    username: string;
    password?: string; // Optional for updates
};
export interface Composite {
  _id: string;
  name: string;
  questions: string[]; // Array of question IDs
}
interface ManagementState {
  // State for each entity
  composites: Composite[];
  questions: Question[];
  staff: Staff[];
  isLoading: boolean;
  error: string | null;
  
 fetchComposites: () => Promise<void>;
  // ✅ Update the function signatures to include the full data payload
  createComposite: (data: { name: string, questions: string[] }) => Promise<void>;
  updateComposite: (id: string, data: { name:string, questions: string[] }) => Promise<void>;
  deleteComposite: (id: string) => Promise<void>;

  

// Actions for Questions
  fetchQuestions: () => Promise<void>;
  createQuestion: (data: { text: string }) => Promise<void>;
  updateQuestion: (id: string, data: { text: string }) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;

    // Actions for Staff
    fetchStaff: () => Promise<void>;
  createStaff: (data: CreateStaffPayload) => Promise<void>;
  updateStaff: (id: string, data: CreateStaffPayload) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
}



export const useManagementStore = create<ManagementState>((set, get) => ({
  composites: [],
  questions: [],
  staff: [],
  isLoading: false,
  error: null,

  // --- COMPOSITE ACTIONS ---
  fetchComposites: async () => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      const res = await axios.get(`${BASE_URL}/admin/management/composites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ composites: res.data.data.composites, isLoading: false });
      // Also update the main composite store for the sidebar
      useCompositeStore.getState().fetchComposites(); 
    } catch (err) {
      set({ error: 'Failed to fetch composites', isLoading: false });
    }
  },

  createComposite: async (data) => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      await axios.post(`${BASE_URL}/admin/management/composites`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      get().fetchComposites(); // Refetch the list to show the new item
    } catch (err) {
      set({ error: 'Failed to create composite', isLoading: false });
    }
  },
 updateComposite: async (id, data) => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      await axios.put(`${BASE_URL}/admin/management/composites/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      get().fetchComposites(); // Refetch the list to show the updated item
    } catch (err) {
      set({ error: 'Failed to update composite', isLoading: false });
    }
  },

  deleteComposite: async (id) => {
    try {
      const token = useAuthStore.getState().token;
      await axios.delete(`${BASE_URL}/admin/management/composites/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      get().fetchComposites(); // Refetch the list after deleting
    } catch (err) {
      set({ error: 'Failed to delete composite' });
    }
  },

  // --- QUESTION ACTIONS ---
  fetchQuestions: async () => {
    if (get().questions.length > 0) return; // Don't refetch if we already have them
    set({ isLoading: true });
    try {
        const token = useAuthStore.getState().token;
        const res = await axios.get(`${BASE_URL}/admin/management/questions`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        set({ questions: res.data.data.questions, isLoading: false });
    } catch (err) {
        set({ error: 'Failed to fetch questions', isLoading: false });
    }
  },


// --- QUESTION ACTIONS ---
  createQuestion: async (data) => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      await axios.post(`${BASE_URL}/admin/management/questions`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      get().fetchQuestions(); // Refetch the list to show the new question
    } catch (err) {
      set({ error: 'Failed to create question', isLoading: false });
    }
  },

  updateQuestion: async (id, data) => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      await axios.put(`${BASE_URL}/admin/management/questions/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      get().fetchQuestions(); // Refetch the list to show the updated question
    } catch (err) {
      set({ error: 'Failed to update question', isLoading: false });
    }
  },

  deleteQuestion: async (id) => {
    try {
      const token = useAuthStore.getState().token;
      await axios.delete(`${BASE_URL}/admin/management/questions/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      // Optimistically remove the question from state for a faster UI response
      set(state => ({
        questions: state.questions.filter(q => q._id !== id)
      }));
    } catch (err) {
      set({ error: 'Failed to delete question' });
      // If the API call fails, we should probably refetch to revert the optimistic update
      get().fetchQuestions();
    }
  },
  // --- STAFF ACTIONS ---
  fetchStaff: async () => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      const res = await axios.get(`${BASE_URL}/admin/users?role=staff`, { // Assuming an endpoint to filter by role
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ staff: res.data.data.users, isLoading: false });
    } catch (err) {
      set({ error: 'Failed to fetch staff', isLoading: false });
    }
  },

  createStaff: async (data) => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      // The role is hardcoded to 'staff' for this action
      await axios.post(`${BASE_URL}/admin/users`, { ...data, role: 'staff' }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      get().fetchStaff(); // Refetch to update the list
    } catch (err) {
      set({ error: 'Failed to create staff member', isLoading: false });
    }
  },

  updateStaff: async (id, data) => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      // Do not send password on update
      const { password, ...updateData } = data;
      await axios.put(`${BASE_URL}/admin/users/${id}`, updateData, {
        headers: { Authorization: `Bearer ${token}` }
      });
      get().fetchStaff(); // Refetch to update the list
    } catch (err) {
      set({ error: 'Failed to update staff member', isLoading: false });
    }
  },

  // This is a soft delete (deactivates the user)
  deleteStaff: async (id) => {
    try {
      const token = useAuthStore.getState().token;
      await axios.delete(`${BASE_URL}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      get().fetchStaff(); // Refetch to show the updated 'isActive' status
    } catch (err) {
      set({ error: 'Failed to deactivate staff member' });
    }
  },

}));