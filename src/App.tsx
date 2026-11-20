import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import { AppLayout } from './components/layout/AppLayout';
import { LoadingSpinner } from './components/ui/LoadingSpinner';

// ── Eagerly loaded (needed immediately on first visit) ──────────────────────
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';

// ── Lazily loaded (only when the user navigates to these routes) ────────────
// Each lazy() call creates a separate JS chunk. Recharts (≈200KB) lives only
// in the analytics/forecasting/dashboard chunks, so it is NOT part of the
// initial bundle any more.
const InstallPage      = lazy(() => import('./pages/landing/InstallPage').then(m => ({ default: m.InstallPage })));
const DashboardPage    = lazy(() => import('./pages/dashboard/DashboardPage').then(m => ({ default: m.DashboardPage })));
const InventoryPage    = lazy(() => import('./pages/inventory/InventoryPage').then(m => ({ default: m.InventoryPage })));
const SalesPage        = lazy(() => import('./pages/sales/SalesPage').then(m => ({ default: m.SalesPage })));
const PurchasesPage    = lazy(() => import('./pages/purchases/PurchasesPage').then(m => ({ default: m.PurchasesPage })));
const AnalyticsPage    = lazy(() => import('./pages/analytics/AnalyticsPage').then(m => ({ default: m.AnalyticsPage })));
const ForecastingPage  = lazy(() => import('./pages/forecasting/ForecastingPage').then(m => ({ default: m.ForecastingPage })));
const AssistantPage    = lazy(() => import('./pages/assistant/AssistantPage').then(m => ({ default: m.AssistantPage })));
const NotificationsPage = lazy(() => import('./pages/notifications/NotificationsPage').then(m => ({ default: m.NotificationsPage })));

// ── Full-screen loading fallback shown while a chunk is downloading ──────────
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
          {/* Public — LandingPage and auth pages are eagerly loaded */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/install" element={<InstallPage />} />
          <Route path="/login"    element={<AuthRoute><LoginPage /></AuthRoute>} />
          <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />

          {/* Protected — each page is a separate lazy chunk */}
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

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}
