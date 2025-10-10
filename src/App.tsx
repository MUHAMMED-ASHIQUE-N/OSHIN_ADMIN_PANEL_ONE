import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/layout/Layout";
import Dashboard from "./pages/Dashboard";
import CompositePage from "./pages/CompositePage"; // ✅ Import the new reusable page

import ProtectedRoute from "./components/auth/ProtectedRoute";
import LoginPage from "./pages/LoginPage";
import { ChartProvider } from "./context/ChartContext";
import ManagementLayout from "./pages/management/ManagementLayout";
import CompositesPageMngt from "./pages/management/CompositesPageMngt";
import QuestionsPage from "./pages/management/QuestionsPage";
import StaffPage from "./pages/management/StaffPage";

function App() {
  return (
    <ChartProvider>
  <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<ProtectedRoute />}>
        {/* Main Dashboard Routes */}
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/composites/:compositeSlug" element={<CompositePage />} />
        </Route>

        {/* ✅ New Management Routes */}
        <Route path="/management" element={<ManagementLayout />}>
            <Route path="composites" element={<CompositesPageMngt />} />
            <Route path="questions" element={<QuestionsPage />} />
            <Route path="staff" element={<StaffPage />} />
        </Route>
      </Route>
    </Routes>
    </ChartProvider>
  );
}

export default App;