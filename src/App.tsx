import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import { AppLayout } from './components/layout/AppLayout';
import { AdminLayout } from './components/admin/AdminLayout';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

// ── Eagerly loaded ──────────────────────────────────────────────────────────
import { LandingPage }    from './pages/landing/LandingPage';
import { LoginPage }      from './pages/auth/LoginPage';
import { RegisterPage }   from './pages/auth/RegisterPage';
import { AdminLoginPage } from './pages/admin/AdminLoginPage';

// ── Lazily loaded (trader app) ──────────────────────────────────────────────
const InstallPage       = lazy(() => import('./pages/landing/InstallPage').then(m => ({ default: m.InstallPage })));
const DashboardPage     = lazy(() => import('./pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const InventoryPage     = lazy(() => import('./pages/inventory/InventoryPage').then(m => ({ default: m.InventoryPage })));
const SalesPage         = lazy(() => import('./pages/sales/SalesPage').then(m => ({ default: m.SalesPage })));
const PurchasesPage     = lazy(() => import('./pages/purchases/PurchasesPage').then(m => ({ default: m.PurchasesPage })));
const AnalyticsPage     = lazy(() => import('./pages/analytics/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const ForecastingPage   = lazy(() => import('./pages/forecasting/ForecastingPage').then(m => ({ default: m.ForecastingPage })));
const AssistantPage     = lazy(() => import('./pages/assistant/AssistantPage').then(m => ({ default: m.AssistantPage })));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage').then(m => ({ default: m.NotificationsPage })));

// ── Lazily loaded (admin app) ───────────────────────────────────────────────
const AdminOverviewPage   = lazy(() => import('./pages/admin/AdminOverviewPage').then(m => ({ default: m.AdminOverviewPage })));
const AdminUsersPage      = lazy(() => import('./pages/admin/AdminUsersPage').then(m => ({ default: m.AdminUsersPage })));
const AdminBusinessesPage = lazy(() => import('./pages/admin/AdminBusinessesPage').then(m => ({ default: m.AdminBusinessesPage })));

const PageLoader: React.FC = () => (
  <div className="flex h-full items-center justify-center min-h-[200px]">
    <LoadingSpinner size="lg" />
  </div>
);

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <AppLayout />;
};

const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public */}
          <Route path="/"        element={<LandingPage />} />
          <Route path="/install" element={<InstallPage />} />
          <Route path="/login"    element={<AuthRoute><LoginPage /></AuthRoute>} />
          <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />

          {/* Trader app — protected */}
          <Route element={<ProtectedLayout />}>
            <Route path="/dashboard"     element={<DashboardPage />} />
            <Route path="/inventory"     element={<InventoryPage />} />
            <Route path="/sales"         element={<SalesPage />} />
            <Route path="/purchases"     element={<PurchasesPage />} />
            <Route path="/analytics"     element={<AnalyticsPage />} />
            <Route path="/forecasting"   element={<ForecastingPage />} />
            <Route path="/assistant"     element={<AssistantPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
          </Route>

          {/* Admin app — completely separate layout + auth */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<AdminLayout />}>
            <Route path="/admin/dashboard"  element={<AdminOverviewPage />} />
            <Route path="/admin/users"      element={<AdminUsersPage />} />
            <Route path="/admin/businesses" element={<AdminBusinessesPage />} />
          </Route>
          <Route path="/admin" element={<Navigate to="/admin/dashboard" replace />} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
