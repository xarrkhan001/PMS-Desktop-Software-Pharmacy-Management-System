import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, Outlet, useNavigate, useLocation } from "react-router-dom";
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
import LicenseLockPage from "./modules/auth/LicenseLockPage";
import { Toaster } from "@/components/ui/toaster";

// ─────────────────────────────────────────────────────────────────────────────
// LICENSE GUARD
// Only runs AFTER login. Reads licenseStatus from localStorage.
// Super Admin is NEVER blocked.
// ─────────────────────────────────────────────────────────────────────────────
const LicenseGuard = ({ children }: { children: React.ReactNode }) => {
  const location = useLocation();
  const [locked, setLocked] = useState(false);
  const [lockReason, setLockReason] = useState("");
  const [lockCode, setLockCode] = useState("");

  const checkLicense = () => {
    const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
    const userRole = localStorage.getItem("userRole")?.toUpperCase();

    // 1. Not logged in → no lock (login page will handle redirect)
    if (!isAuthenticated) {
      setLocked(false);
      return;
    }

    // 2. Super Admin → NEVER lock
    if (userRole === "SUPER_ADMIN") {
      setLocked(false);
      return;
    }

    // 3. Read license status saved during login
    const licenseStatusRaw = localStorage.getItem("licenseStatus");
    if (!licenseStatusRaw) {
      // No license info saved → lock
      setLocked(true);
      setLockReason("No license found. Please contact your administrator.");
      setLockCode("LICENSE_MISSING");
      return;
    }

    try {
      const licenseStatus = JSON.parse(licenseStatusRaw);

      // 4. Account suspended
      if (!licenseStatus.isActive) {
        setLocked(true);
        setLockReason("Your pharmacy account has been suspended. Please contact support.");
        setLockCode("ACCOUNT_SUSPENDED");
        return;
      }

      // 5. License expired check
      const now = new Date();
      const expiryDate = licenseStatus.expiresAt ? new Date(licenseStatus.expiresAt) : null;

      if (licenseStatus.isExpired || (expiryDate && expiryDate < now)) {
        // If not already marked as expired in storage, mark it now
        if (!licenseStatus.isExpired) {
          licenseStatus.isExpired = true;
          localStorage.setItem("licenseStatus", JSON.stringify(licenseStatus));
        }

        const expiredOn = expiryDate
          ? expiryDate.toLocaleDateString("en-PK", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" })
          : "an unknown date";

        setLocked(true);
        setLockReason(`Your subscription expired on ${expiredOn}. Please make payment to renew access.`);
        setLockCode("LICENSE_EXPIRED");
        return;
      }

      // 6. No license key
      if (!licenseStatus.licenseNo) {
        setLocked(true);
        setLockReason("No license key found. Please contact your administrator for activation.");
        setLockCode("LICENSE_MISSING");
        return;
      }

      // All good!
      setLocked(false);
    } catch {
      setLocked(false);
    }
  };

  useEffect(() => {
    // Initial check
    checkLicense();

    // Check every 10 seconds for real-time lock (perfect for 2-min testing)
    const interval = setInterval(checkLicense, 10000);

    return () => clearInterval(interval);
  }, [location.pathname]); // Re-evaluate on every route change

  // Show lock screen (but NOT on login page)
  if (locked && location.pathname !== "/login") {
    return (
      <LicenseLockPage
        reason={lockReason}
        code={lockCode}
        onActivated={() => {
          // After activation, reload to re-check
          window.location.reload();
        }}
      />
    );
  }

  return <>{children}</>;
};

// ─────────────────────────────────────────────────────────────────────────────
// REAL-TIME SESSION GUARD
// Checks every 10s if the user's account still exists on the server.
// ─────────────────────────────────────────────────────────────────────────────
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

        if (response.status === 401) {
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

    const interval = setInterval(checkStatus, 10000);
    return () => clearInterval(interval);
  }, [isAuthenticated, navigate]);

  return <>{children}</>;
};

// ─────────────────────────────────────────────────────────────────────────────
// PROTECTED ROUTE
// ─────────────────────────────────────────────────────────────────────────────
const ProtectedRoute = ({ allowedRoles }: { allowedRoles?: string[] }) => {
  const isAuthenticated = localStorage.getItem("isAuthenticated") === "true";
  const userRole = localStorage.getItem("userRole")?.toUpperCase();

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(userRole || "")) {
    return <Navigate to={userRole === "SUPER_ADMIN" ? "/super-admin" : "/"} replace />;
  }
  return <Outlet />;
};

// ─────────────────────────────────────────────────────────────────────────────
// APP
// ─────────────────────────────────────────────────────────────────────────────
function App() {
  const userRole = localStorage.getItem("userRole")?.toUpperCase();

  return (
    <Router>
      <LicenseGuard>
        <RealTimeGuard>
          <Routes>
            {/* Public Route - Always accessible */}
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
      </LicenseGuard>
      <Toaster />
    </Router>
  );
}

export default App;
