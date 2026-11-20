import React, { useState } from 'react';
import { Outlet, NavLink, useLocation, Navigate } from 'react-router-dom';
import { useAdminStore } from '@/store/admin.store';
import {
  LayoutDashboard, Users, Store, LogOut, Zap, Menu, X, TrendingUp, Shield
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/admin/dashboard', icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/users',     icon: Users,           label: 'Users' },
  { to: '/admin/businesses',icon: Store,           label: 'Businesses' },
];

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, admin, logout } = useAdminStore();
  const [open, setOpen] = useState(false);
  const location = useLocation();

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-red-900/40">
        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shrink-0">
          <Shield size={16} className="text-white" />
        </div>
        <div className="min-w-0">
          <span className="text-sm font-bold text-white">MarketMind</span>
          <span className="text-red-400 text-sm font-bold"> Admin</span>
        </div>
        <button onClick={() => setOpen(false)} className="lg:hidden ml-auto text-slate-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              onClick={() => setOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active
                  ? 'bg-red-600/20 text-red-400 border border-red-600/30'
                  : 'text-slate-400 hover:text-white hover:bg-slate-700 border border-transparent'
              )}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          );
        })}
      </nav>

      {/* Admin user */}
      <div className="px-3 py-4 border-t border-red-900/40">
        <div className="flex items-center gap-3 px-2 py-2 mb-2 min-w-0">
          <div className="w-8 h-8 bg-red-600/20 rounded-full flex items-center justify-center text-xs font-bold text-red-400 shrink-0">
            {admin?.firstName?.[0]}{admin?.lastName?.[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-white truncate">{admin?.firstName} {admin?.lastName}</p>
            <p className="text-[10px] text-slate-500 truncate">{admin?.email}</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); window.location.href = '/admin/login'; }}
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors touch-manipulation"
        >
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex bg-slate-950 overflow-hidden" style={{ height: '100dvh' }}>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-56 bg-slate-900 border-r border-red-900/30 shrink-0">
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {open && (
        <>
          <div className="fixed inset-0 z-40 bg-black/70 lg:hidden" onClick={() => setOpen(false)} />
          <aside className="fixed left-0 top-0 bottom-0 z-50 w-64 bg-slate-900 border-r border-red-900/30 lg:hidden overflow-y-auto">
            {sidebar}
          </aside>
        </>
      )}

      {/* Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-slate-900/80 backdrop-blur-xl border-b border-red-900/30 px-4 lg:px-6 py-3.5 flex items-center gap-3">
          <button
            onClick={() => setOpen(true)}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-700 transition-colors lg:hidden touch-manipulation"
          >
            <Menu size={20} />
          </button>
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Shield size={16} className="text-red-400 shrink-0" />
            <h1 className="text-sm font-semibold text-white truncate">Admin Panel</h1>
          </div>
          <span className="text-xs px-2 py-1 bg-red-600/20 text-red-400 border border-red-600/30 rounded-full font-medium shrink-0">
            ADMIN
          </span>
        </header>

        <main className="flex-1 overflow-y-auto">
          <div className="p-3 sm:p-4 lg:p-6 max-w-screen-2xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
