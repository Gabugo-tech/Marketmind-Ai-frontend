import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore } from './store/auth.store';
import { AppLayout } from './components/layout/AppLayout';

// Pages
import { LandingPage } from './pages/landing/LandingPage';
import { LoginPage } from './pages/auth/LoginPage';
import { RegisterPage } from './pages/auth/RegisterPage';
import { DashboardPage } from './pages/dashboard/DashboardPage';
import { InventoryPage } from './pages/inventory/InventoryPage';
import { SalesPage } from './pages/sales/SalesPage';
import { PurchasesPage } from './pages/purchases/PurchasesPage';
import { AnalyticsPage } from './pages/analytics/AnalyticsPage';
import { ForecastingPage } from './pages/forecasting/ForecastingPage';
import { AssistantPage } from './pages/assistant/AssistantPage';
import { NotificationsPage } from './pages/notifications/NotificationsPage';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return <>{children}</>;
};

// Public auth routes redirect logged-in users to dashboard
const AuthRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/dashboard" replace />;
  return <>{children}</>;
};

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page — always accessible */}
        <Route path="/" element={<LandingPage />} />

        {/* Auth pages */}
        <Route path="/login" element={<AuthRoute><LoginPage /></AuthRoute>} />
        <Route path="/register" element={<AuthRoute><RegisterPage /></AuthRoute>} />

        {/* App — protected */}
        <Route path="/dashboard" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<DashboardPage />} />
        </Route>
        <Route path="/inventory" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<InventoryPage />} />
        </Route>
        <Route path="/sales" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<SalesPage />} />
        </Route>
        <Route path="/purchases" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<PurchasesPage />} />
        </Route>
        <Route path="/analytics" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<AnalyticsPage />} />
        </Route>
        <Route path="/forecasting" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<ForecastingPage />} />
        </Route>
        <Route path="/assistant" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<AssistantPage />} />
        </Route>
        <Route path="/notifications" element={<ProtectedRoute><AppLayout /></ProtectedRoute>}>
          <Route index element={<NotificationsPage />} />
        </Route>

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
