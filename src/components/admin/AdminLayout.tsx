import React, { useState, useEffect } from 'react';
import { Outlet, NavLink, useLocation, Navigate } from 'react-router-dom';
import { useAdminStore } from '@/store/admin.store';
import { useAdminThemeStore } from '@/store/adminTheme.store';
import {
  LayoutDashboard, Users, Store, LogOut, Menu, X, Shield, Sun, Moon
} from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { to: '/admin/dashboard',   icon: LayoutDashboard, label: 'Overview' },
  { to: '/admin/users',       icon: Users,           label: 'Users' },
  { to: '/admin/businesses',  icon: Store,           label: 'Businesses' },
];

export const AdminLayout: React.FC = () => {
  const { isAuthenticated, admin, logout } = useAdminStore();
  const { isDark, toggle } = useAdminThemeStore();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const location = useLocation();

  // Apply admin theme attribute whenever it changes
  useEffect(() => {
    document.documentElement.setAttribute('data-admin-theme', isDark ? 'dark' : 'light');
    return () => {
      // Clean up when navigating away from admin area
      document.documentElement.removeAttribute('data-admin-theme');
    };
  }, [isDark]);

  if (!isAuthenticated) return <Navigate to="/admin/login" replace />;

  // Theme-aware class helpers
  const bg       = isDark ? 'bg-slate-950' : 'bg-slate-100';
  const surface  = isDark ? 'bg-slate-900' : 'bg-white';
  const border   = isDark ? 'border-red-900/30' : 'border-slate-200';
  const textPrim = isDark ? 'text-white' : 'text-slate-900';
  const textMut  = isDark ? 'text-slate-400' : 'text-slate-500';
  const hover    = isDark ? 'hover:bg-slate-700 hover:text-white' : 'hover:bg-slate-100 hover:text-slate-900';
  const activeNav = isDark
    ? 'bg-red-600/20 text-red-400 border border-red-600/30'
    : 'bg-red-50 text-red-600 border border-red-200';
  const inactiveNav = isDark
    ? `text-slate-400 ${hover} border border-transparent`
    : `text-slate-500 ${hover} border border-transparent`;

  const sidebar = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className={cn('flex items-center gap-3 px-5 py-5 border-b', border)}>
        <div className="w-8 h-8 bg-red-600 rounded-lg flex items-center justify-center shrink-0">
          <Shield size={16} className="text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <span className={cn('text-sm font-bold', textPrim)}>MarketMind</span>
          <span className="text-red-400 text-sm font-bold"> Admin</span>
        </div>
        <button
          onClick={() => setDrawerOpen(false)}
          className={cn('lg:hidden', textMut, 'hover:text-red-400 transition-colors')}
        >
          <X size={20} />
        </button>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = location.pathname.startsWith(to);
          return (
            <NavLink
              key={to}
              to={to}
              onClick={() => setDrawerOpen(false)}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all',
                active ? activeNav : inactiveNav
              )}
            >
              <Icon size={18} />
              {label}
            </NavLink>
          );
        })}
      </nav>

      {/* Admin user + sign out */}
      <div className={cn('px-3 py-4 border-t', border)}>
        <div className="flex items-center gap-3 px-2 py-2 mb-2 min-w-0">
          <div className="w-8 h-8 bg-red-600/20 rounded-full flex items-center justify-center text-xs font-bold text-red-400 shrink-0">
            {admin?.firstName?.[0]}{admin?.lastName?.[0]}
          </div>
          <div className="min-w-0 flex-1">
            <p className={cn('text-xs font-semibold truncate', textPrim)}>
              {admin?.firstName} {admin?.lastName}
            </p>
            <p className={cn('text-[10px] truncate', textMut)}>{admin?.email}</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); window.location.href = '/admin/login'; }}
          className={cn(
            'w-full flex items-center gap-2 px-3 py-2 text-sm rounded-xl transition-colors touch-manipulation',
            textMut, 'hover:text-red-400 hover:bg-red-500/10'
          )}
        >
          <LogOut size={15} /> Sign out
        </button>
      </div>
    </div>
  );

  return (
    <div className={cn('flex overflow-hidden', bg)} style={{ height: '100dvh' }}>
      {/* Desktop sidebar */}
      <aside className={cn('hidden lg:flex flex-col w-56 border-r shrink-0', surface, border)}>
        {sidebar}
      </aside>

      {/* Mobile drawer */}
      {drawerOpen && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/60 lg:hidden"
            onClick={() => setDrawerOpen(false)}
          />
          <aside className={cn(
            'fixed left-0 top-0 bottom-0 z-50 w-64 border-r lg:hidden overflow-y-auto',
            surface, border
          )}>
            {sidebar}
          </aside>
        </>
      )}

      {/* Main content column */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className={cn(
          'sticky top-0 z-30 backdrop-blur-xl border-b px-4 lg:px-6 py-3.5 flex items-center gap-3',
          isDark ? 'bg-slate-900/80' : 'bg-white/80',
          border
        )}>
          <button
            onClick={() => setDrawerOpen(true)}
            className={cn(
              'p-2 rounded-lg transition-colors lg:hidden touch-manipulation',
              textMut, hover
            )}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <div className="flex items-center gap-2 flex-1 min-w-0">
            <Shield size={16} className="text-red-400 shrink-0" />
            <h1 className={cn('text-sm font-semibold truncate', textPrim)}>Admin Panel</h1>
          </div>

          {/* Theme toggle */}
          <button
            onClick={toggle}
            className={cn(
              'p-2 rounded-lg transition-colors touch-manipulation shrink-0',
              textMut, hover
            )}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            title={isDark ? 'Light mode' : 'Dark mode'}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

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
