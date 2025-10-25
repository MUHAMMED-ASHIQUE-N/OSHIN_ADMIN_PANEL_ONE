// src/stores/managementStore.ts
import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';
import { useCompositeStore } from './compositeStore';
const BASE_URL = import.meta.env.VITE_API_URL;

// --- UPDATED INTERFACES ---

export interface Question {
  _id: string;
  text: string;
  category: 'room' | 'f&b';
  questionType: 'rating' | 'yes_no';
}

export interface Composite {
  _id: string;
  name: string;
  questions: string[]; // Array of question IDs
  category: 'room' | 'f&b';
}

// Renamed from Staff to ManagementUser
export interface ManagementUser {
  _id: string;
  fullName: string;
  username: string;
  isActive: boolean;
  role: 'admin' | 'staff' | 'viewer';
}

type UserRole = 'admin' | 'staff' | 'viewer';

type CreateUserPayload = {
  fullName: string;
  username: string;
  password?: string; // Optional for updates
  role: UserRole;
};

type UpdateUserPayload = {
  fullName: string;
  username: string;
  role: UserRole;
};

// --- UPDATED STATE ---

interface ManagementState {
  // State for each entity
  composites: Composite[];
  questions: Question[];
  users: ManagementUser[]; // Renamed from staff
  isLoading: boolean;
  error: string | null;

  // Composite Actions
  fetchComposites: () => Promise<void>;
  createComposite: (data: { name: string, questions: string[], category: 'room' | 'f&b' }) => Promise<void>; // Updated signature
  updateComposite: (id: string, data: { name: string, questions: string[], category: 'room' | 'f&b' }) => Promise<void>; // Updated signature
  deleteComposite: (id: string) => Promise<void>;

  // Question Actions
  fetchQuestions: () => Promise<void>;
  createQuestion: (data: { text: string, category: 'room' | 'f&b', questionType: 'rating' | 'yes_no' }) => Promise<void>; // Updated signature
  updateQuestion: (id: string, data: { text: string, category: 'room' | 'f&b', questionType: 'rating' | 'yes_no' }) => Promise<void>; // Updated signature
  deleteQuestion: (id: string) => Promise<void>;

  // User Actions (Renamed from Staff)
  fetchUsers: () => Promise<void>;
  createUser: (data: CreateUserPayload) => Promise<void>;
  updateUser: (id: string, data: UpdateUserPayload) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export const useManagementStore = create<ManagementState>((set, get) => ({
  composites: [],
  questions: [],
  users: [], // Renamed from staff
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
      console.log({ "composites": res.data.data.composites});
      // Also update the main composite store for the sidebar
      useCompositeStore.getState().fetchComposites();
    } catch (err) {
      set({ error: 'Failed to fetch composites', isLoading: false });
    }
  },

  createComposite: async (data) => { // Data now includes category
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      await axios.post(`${BASE_URL}/admin/management/composites`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      get().fetchComposites();
    } catch (err) {
      set({ error: 'Failed to create composite', isLoading: false });
    }
  },
  updateComposite: async (id, data) => { // Data now includes category
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      await axios.put(`${BASE_URL}/admin/management/composites/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      get().fetchComposites();
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
      get().fetchComposites();
    } catch (err) {
      set({ error: 'Failed to delete composite' });
    }
  },

  // --- QUESTION ACTIONS ---
  fetchQuestions: async () => {
    // if (get().questions.length > 0) return; // Allow refetching
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      const res = await axios.get(`${BASE_URL}/admin/management/questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ questions: res.data.data.questions, isLoading: false });
      console.log({ "questions": res.data.data.questions});
    } catch (err) {
      set({ error: 'Failed to fetch questions', isLoading: false });
    }
  },

  createQuestion: async (data) => { // Data now includes category/type
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      await axios.post(`${BASE_URL}/admin/management/questions`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      get().fetchQuestions();
    } catch (err) {
      set({ error: 'Failed to create question', isLoading: false });
    }
  },

  updateQuestion: async (id, data) => { // Data now includes category/type
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      await axios.put(`${BASE_URL}/admin/management/questions/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      get().fetchQuestions();
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
      set(state => ({
        questions: state.questions.filter(q => q._id !== id)
      }));
    } catch (err) {
      set({ error: 'Failed to delete question' });
      get().fetchQuestions();
    }
  },
  
  // --- USER ACTIONS (Renamed from Staff) ---
  fetchUsers: async () => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      // Fetch ALL users, not just staff
      const res = await axios.get(`${BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ users: res.data.data.users, isLoading: false });
    } catch (err) {
      set({ error: 'Failed to fetch users', isLoading: false });
    }
  },

  createUser: async (data) => { // Data now includes role
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      await axios.post(`${BASE_URL}/admin/users`, data, { // Pass full data object
        headers: { Authorization: `Bearer ${token}` }
      });
      get().fetchUsers(); // Refetch to update the list
    } catch (err) {
      set({ error: 'Failed to create user', isLoading: false });
    }
  },

  updateUser: async (id, data) => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      await axios.put(`${BASE_URL}/admin/users/${id}`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      get().fetchUsers(); // Refetch to update the list
    } catch (err) {
      set({ error: 'Failed to update user', isLoading: false });
    }
  },

  deleteUser: async (id) => { // This is a soft delete (deactivate)
    try {
      const token = useAuthStore.getState().token;
      await axios.delete(`${BASE_URL}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      get().fetchUsers(); // Refetch to show the updated 'isActive' status
    } catch (err) {
      set({ error: 'Failed to deactivate user' });
    }
  },
}));