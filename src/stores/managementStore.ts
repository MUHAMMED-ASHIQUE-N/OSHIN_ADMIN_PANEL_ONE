import { create } from 'zustand';
import axios from 'axios';
import { useAuthStore } from './authStore';
const BASE_URL = import.meta.env.VITE_API_URL;

// --- UPDATED INTERFACES ---
export interface Question {
  _id: string;
  text: string;
  // ✅ ADDED 'cfc'
  category: 'room' | 'f&b' | 'cfc';
  questionType: 'rating' | 'yes_no';
  order: number;
  isActive: boolean; // ✅ ADDED
}

export interface Composite {
  _id: string;
  name: string;
  questions: string[];
  // ✅ ADDED 'cfc'
  category: 'room' | 'f&b' | 'cfc';
  order: number;
  isActive: boolean; // ✅ ADDED
}

export interface ManagementUser {
  _id: string;
  fullName: string;
  username: string;
  isActive: boolean;
  // ✅ ADDED 'staff_cfc'
  role: "admin" | "staff" | "viewer" | "staff_room" | "staff_f&b" | "staff_cfc";
}

// ✅ ADDED 'staff_cfc'
type UserRole = "admin" | "staff" | "viewer" | "staff_room" | "staff_f&b" | "staff_cfc";

type CreateUserPayload = {
  fullName: string;
  username: string;
  password?: string;
  role: UserRole;
};

type UpdateUserPayload = {
  fullName: string;
  username: string;
  role: UserRole;
};

// ✅ ADDED 'cfc'
type Category = 'room' | 'f&b' | 'cfc';

// ✅ UPDATED Signatures
interface ManagementState {
  composites: Composite[];
  questions: Question[];
  users: ManagementUser[];
  isLoading: boolean;
  error: string | null;

  fetchComposites: (force?: boolean) => Promise<void>; // Added force
  createComposite: (data: { name: string, questions: string[], category: Category, order: number }) => Promise<void>;
  updateComposite: (id: string, data: Partial<Composite>) => Promise<void>; // ✅ Use Partial
  deleteComposite: (id: string) => Promise<void>;
toggleCompositeActive: (composite: Composite) => Promise<void>;

  fetchQuestions: (force?: boolean) => Promise<void>; // Added force
  createQuestion: (data: Partial<Question>) => Promise<void>; // Use Partial for flexibility
  updateQuestion: (id: string, data: Partial<Question>) => Promise<void>;
  deleteQuestion: (id: string) => Promise<void>;
  toggleQuestionActive: (question: Question) => Promise<void>; // ✅ ADDED

  fetchUsers: (force?: boolean) => Promise<void>; // Added force
  createUser: (data: CreateUserPayload) => Promise<void>;
  updateUser: (id: string, data: UpdateUserPayload) => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
}

export const useManagementStore = create<ManagementState>((set, get) => ({
  composites: [],
  questions: [],
  users: [],
  isLoading: false,
  error: null,

  // --- COMPOSITE ACTIONS ---
  fetchComposites: async (force = false) => {
    // Keep cache check, but allow forcing a refresh
    if (get().composites.length > 0 && !force) return; 

    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      const res = await axios.get(`${BASE_URL}/admin/management/composites`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ composites: res.data.data.composites || [], isLoading: false });
      console.log({ "composites": res.data.data.composites});
    } catch (err) {
      set({ error: 'Failed to fetch composites.', isLoading: false });
    }
  },

  createComposite: async (data) => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      await axios.post(`${BASE_URL}/admin/management/composites`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      get().fetchComposites(true); // ✅ Force refetch
    } catch (err) {
      set({ error: 'Failed to create composite', isLoading: false });
    }
  },
updateComposite: async (id, data) => { // ✅ Data is now Partial<Composite>
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      await axios.put(`${BASE_URL}/admin/management/composites/${id}`, data, { // data is now partial
        headers: { Authorization: `Bearer ${token}` }
      });
      get().fetchComposites(true); 
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
      get().fetchComposites(true); // ✅ Force refetch
    } catch (err) {
      set({ error: 'Failed to delete composite' });
    }
  },
toggleCompositeActive: async (composite) => {
    // Optimistically update UI
    set(state => ({
      composites: state.composites.map(c =>
        c._id === composite._id ? { ...c, isActive: !c.isActive } : c
      ),
    }));
    // Call update with just the toggled status
    get().updateComposite(composite._id, { isActive: !composite.isActive });
  },

  // --- QUESTION ACTIONS ---
  fetchQuestions: async (force = false) => {
    if (get().questions.length > 0 && !force) return; 
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      const res = await axios.get(`${BASE_URL}/admin/management/questions`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ questions: res.data.data.questions || [], isLoading: false, error: null });
      console.log("managementStore: Fetched Questions from API:", res.data.data.questions);
    } catch (err) {
      console.error("managementStore: Failed to fetch questions", err);
      let errorMsg = 'Failed to fetch questions';
      set({ error: errorMsg, isLoading: false, questions: [] });
    }
  },
  createQuestion: async (data) => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      await axios.post(`${BASE_URL}/admin/management/questions`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      get().fetchQuestions(true); // ✅ Force refetch
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
      get().fetchQuestions(true); // ✅ Force refetch
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
      get().fetchQuestions(true); // ✅ Force refetch
    } catch (err) {
      set({ error: 'Failed to delete question' });
    }
  },
  toggleQuestionActive: async (question) => {
    // Optimistically update UI
    set(state => ({
      questions: state.questions.map(q =>
        q._id === question._id ? { ...q, isActive: !q.isActive } : q
      ),
    }));
    // Call update with just the toggled status
    get().updateQuestion(question._id, { isActive: !question.isActive });
  },
  // --- USER ACTIONS ---
  fetchUsers: async (force = false) => {
    if (get().users.length > 0 && !force) return;
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      const res = await axios.get(`${BASE_URL}/admin/users`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ users: res.data.data.users, isLoading: false });
    } catch (err) {
      set({ error: 'Failed to fetch users', isLoading: false });
    }
  },
  createUser: async (data) => {
    set({ isLoading: true });
    try {
      const token = useAuthStore.getState().token;
      await axios.post(`${BASE_URL}/admin/users`, data, {
        headers: { Authorization: `Bearer ${token}` }
      });
      get().fetchUsers(true); // ✅ Force refetch
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
      get().fetchUsers(true); // ✅ Force refetch
    } catch (err) {
      set({ error: 'Failed to update user', isLoading: false });
    }
  },
  deleteUser: async (id) => {
    try {
      const token = useAuthStore.getState().token;
      await axios.delete(`${BASE_URL}/admin/users/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      get().fetchUsers(true); // ✅ Force refetch
    } catch (err) {
      set({ error: 'Failed to deactivate user' });
    }
  },
}));