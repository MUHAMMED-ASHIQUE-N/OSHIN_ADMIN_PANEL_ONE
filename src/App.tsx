//App.tsx
import React, { Suspense, lazy, useEffect } from "react";
import { Routes, Route, Navigate, useNavigate } from "react-router-dom"; // Added useNavigate
import { ChartProvider } from "./context/ChartContext";
import { Toaster } from 'react-hot-toast';

// --- Lazy Imports ---
import { Layout } from "./components/layout/Layout";
const AnalyticsDisplayPage = lazy(() => import("./pages/AnalyticsDisplayPage")); // Use the display page
const LoginPage = lazy(() => import("./pages/LoginPage"));
const ManagementLayout = lazy(() => import("./pages/management/ManagementLayout"));
const CompositesPageMngt = lazy(() => import("./pages/management/CompositesPageMngt"));
const QuestionsPage = lazy(() => import("./pages/management/QuestionsPage"));
const UsersPage = lazy(() => import("./pages/management/UsersPage"));
const GuestIssuesPage = lazy(() => import("./pages/management/YesNoResponsesPage")); // Kept for now, rename if needed
const SelectCategoryPage = lazy(() => import("./pages/review/SelectCategoryPage"));
const ReviewPage = lazy(() => import("./pages/review/ReviewPage"));
const ComparePage = lazy(()=> import("./pages/ComparePage") )
const ProtectedRoute = lazy(()=>import("./components/auth/ProtectedRoute"))
import { useCompositeStore } from "./stores/compositeStore";
import { useFilterStore } from "./stores/filterStore";
import { useAnalyticsStore } from "./stores/analyticsStore";


// Loading Fallback
const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-screen w-screen bg-gray-100">
    <p className="text-xl text-primary animate-pulse">Loading Page...</p>
  </div>
);

// Index Redirect Logic
const IndexRedirect: React.FC = () => {
    const navigate = useNavigate();
    const { composites, fetchComposites, isLoading: isLoadingComposites } = useCompositeStore();
    const initialCategory = useFilterStore.getState().category;
    const resetAnalytics = useAnalyticsStore((state) => state.resetSelection);

    useEffect(() => {
        resetAnalytics();
        if (composites.length === 0 && !isLoadingComposites) {
            fetchComposites();
        }
    }, [composites, fetchComposites, isLoadingComposites, resetAnalytics]);

    useEffect(() => {
        if (!isLoadingComposites && composites.length > 0) {
            let firstComposite = composites.find(c => c.category === initialCategory);
            if (!firstComposite) firstComposite = composites[0]; // Fallback

            if (firstComposite) {
                 navigate(`/view/${firstComposite._id}`, { replace: true });
            } else {
                 console.warn("No composites found for initial redirect.");
                 // Optionally redirect to management or show message
            }
        }
    }, [isLoadingComposites, composites, initialCategory, navigate]);

    return <LoadingFallback />;
};


function App() {
  return (
    <ChartProvider>
      <Toaster position="top-center" reverseOrder={false} />
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          <Route path="/login" element={<LoginPage />} />

          {/* Admin & Viewer Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'viewer']} />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<IndexRedirect />} />
              {/* Updated Route Path */}
              <Route path="/view/:itemId" element={<AnalyticsDisplayPage />} />
            </Route>
    <Route path="/compare/:category" element={<ComparePage />} />
            {/* Management Routes */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/management" element={<ManagementLayout />}>
                <Route path="composites" element={<CompositesPageMngt />} />
                <Route path="questions" element={<QuestionsPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="responses" element={<GuestIssuesPage />} /> {/* Renamed route */}
              </Route>
            </Route>
          </Route>

          {/* Staff Routes */}
          <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
            <Route path="/review/select" element={<SelectCategoryPage />} />
            <Route path="/review/:category" element={<ReviewPage />} />
            <Route path="/review" element={<Navigate to="/review/select" replace />} />
          </Route>

          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </Suspense>
    </ChartProvider>
  );
}

export default App;