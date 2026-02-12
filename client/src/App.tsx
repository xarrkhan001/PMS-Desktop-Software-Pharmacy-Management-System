import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import DashboardPage from "./modules/dashboard/DashboardPage";
import InventoryPage from "./modules/inventory/InventoryPage";
import FinancePage from "./modules/finance/FinancePage";
import BillingPage from "./modules/billing/BillingPage";
import SuppliersPage from "./modules/suppliers/SuppliersPage";
import CustomersPage from "./modules/customers/CustomersPage";
import ReportsPage from "./modules/reports/ReportsPage";
import AdminPage from "./modules/admin/AdminPage";
import LandingPage from "./modules/auth/LandingPage";
import { Toaster } from "@/components/ui/toaster";

// Simple Protected Route Component
const ProtectedRoute = () => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/login" element={<LandingPage />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<MainLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="inventory" element={<InventoryPage />} />
            <Route path="billing" element={<BillingPage />} />
            <Route path="suppliers" element={<SuppliersPage />} />
            <Route path="customers" element={<CustomersPage />} />
            <Route path="finance" element={<FinancePage />} />
            <Route path="reports" element={<ReportsPage />} />
            <Route path="admin" element={<AdminPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <Toaster />
    </Router>
  );
}

export default App;
