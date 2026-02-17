import { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate } from "react-router-dom";
import MainLayout from "./components/layout/MainLayout";
import DashboardPage from "./modules/dashboard/DashboardPage";
import InventoryPage from "./modules/inventory/InventoryPage";
import FinancePage from "./modules/finance/FinancePage";
import BillingPage from "./modules/billing/BillingPage";
import SalesHistoryPage from "./modules/billing/SalesHistoryPage";
import SuppliersPage from "./modules/suppliers/SuppliersPage";
import PurchasesPage from "./modules/purchases/PurchasesPage";
import CustomersPage from "./modules/customers/CustomersPage";
import ReportsPage from "./modules/reports/ReportsPage";
import AdminPage from "./modules/admin/AdminPage";
import SuperAdminDashboard from "./modules/super-admin/SuperAdminDashboard";
import ManagedPharmacies from "./modules/super-admin/ManagedPharmacies";
import TerminalControl from "./modules/super-admin/TerminalControl";
import PharmacyActivityMonitor from "./modules/super-admin/PharmacyActivityMonitor";
import LandingPage from "./modules/auth/LandingPage";
import ProfilePage from "./modules/profile/ProfilePage";
import SystemLogsPage from "./modules/logs/SystemLogsPage";
import { Toaster } from "@/components/ui/toaster";

// Real-time Session Guard (Redirects if account is deleted)
const RealTimeGuard = ({ children }: { children: React.ReactNode }) => {
  const navigate = useNavigate();
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";

  useEffect(() => {
    if (!isAuthenticated) return;

    const checkStatus = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/status", {
          headers: { "Authorization": `Bearer ${localStorage.getItem("token")}` }
        });

        if (response.status === 401 || response.status === 403) {
          localStorage.clear();
          navigate("/login", {
            replace: true,
            state: { message: "Security Update: Your credentials have been changed. Please login with new details." }
          });
        }
      } catch (err: any) {
        console.warn("Session check offline or failed:", err.message);
      }
    };

    // Check periodically for system purge / account removal
    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, navigate]);

  return <>{children}</>;
};

// Simple Protected Route Component
const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: string[] }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const userRole = localStorage.getItem("userRole")?.toUpperCase();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(userRole || "")) {
    return <Navigate to={userRole === "SUPER_ADMIN" ? "/super-admin" : "/"} replace />;
  }
  return <Outlet />;
};

function App() {
  const userRole = localStorage.getItem("userRole")?.toUpperCase();

  return (
    <Router>
      <RealTimeGuard>
        <Routes>
          <Route path="/login" element={<LandingPage />} />

          {/* Protected Routes */}
          <Route element={<ProtectedRoute />}>
            <Route path="/" element={<MainLayout />}>
              <Route index element={
                userRole === "SUPER_ADMIN"
                  ? <Navigate to="/super-admin" replace />
                  : <DashboardPage />
              } />

              {/* Pharmacy Specific Routes */}
              <Route element={<ProtectedRoute allowedRoles={["ADMIN", "PHARMACIST", "STAFF"]} />}>
                <Route path="inventory" element={<InventoryPage />} />
                <Route path="billing" element={<BillingPage />} />
                <Route path="sales-history" element={<SalesHistoryPage />} />
                <Route path="suppliers" element={<SuppliersPage />} />
                <Route path="purchases" element={<PurchasesPage />} />
                <Route path="customers" element={<CustomersPage />} />
                <Route path="finance" element={<FinancePage />} />
                <Route path="reports" element={<ReportsPage />} />
                <Route path="admin" element={<AdminPage />} />
                <Route path="profile" element={<ProfilePage />} />
                <Route path="logs" element={<SystemLogsPage />} />
              </Route>

              {/* Super Admin Specific Routes */}
              <Route element={<ProtectedRoute allowedRoles={["SUPER_ADMIN"]} />}>
                <Route path="super-admin" element={<SuperAdminDashboard />} />
                <Route path="super-pharmacies" element={<ManagedPharmacies />} />
                <Route path="super-activity" element={<PharmacyActivityMonitor />} />
                <Route path="super-terminal" element={<TerminalControl />} />
              </Route>
            </Route>
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </RealTimeGuard>
      <Toaster />
    </Router>
  );
}

export default App;
