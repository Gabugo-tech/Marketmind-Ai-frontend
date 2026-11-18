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

  return (
    <div className="flex h-screen bg-navy-950 overflow-hidden">
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar onMenuClick={() => setMobileOpen(true)} title={title} />
        <main className="flex-1 overflow-y-auto pb-20 lg:pb-0">
          <div className="p-3 sm:p-4 lg:p-6 max-w-screen-2xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
      <BottomNav />
    </div>
  );
};
