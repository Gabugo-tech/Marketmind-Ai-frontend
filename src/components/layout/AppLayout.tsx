import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar, TopBar } from './Sidebar';
import { BottomNav } from './BottomNav';

const pageTitles: Record<string, string> = {
  '/dashboard': 'Dashboard',
  '/inventory': 'Inventory',
  '/sales': 'Sales',
  '/purchases': 'Purchases',
  '/analytics': 'Analytics',
  '/forecasting': 'AI Forecasting',
  '/assistant': 'AI Assistant',
  '/notifications': 'Alerts',
};

export const AppLayout: React.FC = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();

  const title = Object.entries(pageTitles).find(([path]) =>
    location.pathname.startsWith(path)
  )?.[1] ?? 'MarketMind AI';

  // The AI Assistant page manages its own full-height layout and needs no
  // container padding — it bleeds edge-to-edge inside the content column.
  const isAssistant = location.pathname.startsWith('/assistant');

  return (
    <div className="flex h-screen bg-navy-950 overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <TopBar onMenuClick={() => setMobileOpen(true)} title={title} />
        {/* pb-24 on mobile gives 96px clearance for BottomNav (≈56px) + iOS safe-area (≈34px) */}
        <main className="flex-1 overflow-y-auto pb-24 lg:pb-0">
          {isAssistant ? (
            /* Assistant gets full-bleed: no padding, no max-width wrapper */
            <Outlet />
          ) : (
            <div className="p-3 sm:p-4 lg:p-6 max-w-screen-2xl mx-auto">
              <Outlet />
            </div>
          )}
        </main>
      </div>
      <BottomNav />
    </div>
  );
};
