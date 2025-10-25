import React, { Suspense, lazy, useEffect } from "react"; // Import Suspense and lazy
import { Routes, Route, Navigate } from "react-router-dom";
import { ChartProvider } from "./context/ChartContext";
import { Toaster } from 'react-hot-toast'; // ✅ 1. Import Toaster
// --- Dynamically import Layouts and Pages ---
import { Layout } from "./components/layout/Layout";
const ManagementLayout = lazy(() => import("./pages/management/ManagementLayout"));
const LoginPage = lazy(() => import("./pages/LoginPage"));
const CompositePage = lazy(() => import("./pages/CompositePage"));
const CompositesPageMngt = lazy(() => import("./pages/management/CompositesPageMngt"));
const QuestionsPage = lazy(() => import("./pages/management/QuestionsPage"));
const UsersPage = lazy(() => import("./pages/management/UsersPage"));
const GuestIssuesPage = lazy(() => import("./pages/management/GuestIssuesPage"));
const SelectCategoryPage = lazy(() => import("./pages/review/SelectCategoryPage"));
const ReviewPage = lazy(() => import("./pages/review/ReviewPage"));
// --- End Dynamic Imports ---

import ProtectedRoute from "./components/auth/ProtectedRoute";
import { useCompositeStore } from "./stores/compositeStore";
import { useFilterStore } from "./stores/filterStore";
import { slugify } from "./utils/slugify";

// Loading component to show during dynamic import loading
const LoadingFallback: React.FC = () => (
  <div className="flex items-center justify-center h-screen w-screen bg-gray-100">
    <p className="text-xl text-primary animate-pulse">Loading Page...</p>
    {/* You could replace this text with a more sophisticated spinner component */}
  </div>
);

// IndexRedirect component remains the same
const IndexRedirect: React.FC = () => {
    const { composites, fetchComposites, isLoading } = useCompositeStore();
    const initialCategory = useFilterStore.getState().category;

    useEffect(() => {
        // Fetch composites only if needed and not already loading
        if (composites.length === 0 && !isLoading) {
            fetchComposites();
        }
    }, [composites, fetchComposites, isLoading]);

    if (isLoading || composites.length === 0) {
        return <LoadingFallback />; // Show fallback while loading composites
    }

    let firstComposite = composites.find(c => c.category === initialCategory);
    if (!firstComposite) {
        firstComposite = composites[0];
    }
    if (!firstComposite) {
        return <div>No composites available. Please create one in Management.</div>;
    }

    const firstCompositeSlug = slugify(firstComposite.name);
    return <Navigate to={`/composites/${firstCompositeSlug}`} replace />;
};


function App() {
  return (
    <ChartProvider>
      <Toaster position="top-center" reverseOrder={false} />
      {/* Wrap all routes in Suspense */}
      <Suspense fallback={<LoadingFallback />}>
        <Routes>
          {/* Public Login Route */}
          <Route path="/login" element={<LoginPage />} />

          {/* Admin & Viewer Routes */}
          <Route element={<ProtectedRoute allowedRoles={['admin', 'viewer']} />}>
            <Route path="/" element={<Layout />}>
              <Route index element={<IndexRedirect />} />
              <Route path="/composites/:compositeSlug" element={<CompositePage />} />
            </Route>

            {/* Management routes, only for 'admin' */}
            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
              <Route path="/management" element={<ManagementLayout />}>
                <Route path="composites" element={<CompositesPageMngt />} />
                <Route path="questions" element={<QuestionsPage />} />
                <Route path="users" element={<UsersPage />} />
                <Route path="issues" element={<GuestIssuesPage />} />
              </Route>
            </Route>
          </Route>

          {/* Staff Review Routes */}
          <Route element={<ProtectedRoute allowedRoles={['staff']} />}>
            <Route path="/review/select" element={<SelectCategoryPage />} />
            <Route path="/review/:category" element={<ReviewPage />} />
            <Route path="/review" element={<Navigate to="/review/select" replace />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/login" replace />} />

        </Routes>
      </Suspense>
    </ChartProvider>
  );
}

export default App;

