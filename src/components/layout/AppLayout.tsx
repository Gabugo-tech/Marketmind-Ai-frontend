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

  const isAssistant = location.pathname.startsWith('/assistant');

  return (
    // h-[100dvh] = dynamic viewport height — iOS Safari correctly excludes
    // the address bar and bottom browser chrome, preventing overflow.
    <div className="flex bg-navy-950 overflow-hidden" style={{ height: '100dvh' }}>
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
        <TopBar onMenuClick={() => setMobileOpen(true)} title={title} />

        {isAssistant ? (
          /*
           * Assistant gets its own flex-1 slot that is NOT a scroll container.
           * The page component manages its own internal scroll (messages area)
           * and input anchoring. This prevents iOS from clipping the input
           * behind the BottomNav / safe-area.
           */
          <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
            <Outlet />
          </div>
        ) : (
          /* Every other page lives inside a normal scroll container */
          <main className="flex-1 overflow-y-auto pb-24 lg:pb-0">
            <div className="p-3 sm:p-4 lg:p-6 max-w-screen-2xl mx-auto">
              <Outlet />
            </div>
          </main>
        )}
      </div>

      <BottomNav />
    </div>
  );
};
