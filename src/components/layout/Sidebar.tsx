import React, { useState, useEffect } from 'react';
import { NavLink, useLocation, Link } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore } from '@/store/theme.store';
import {
  LayoutDashboard, Package, ShoppingCart, TruckIcon, BarChart3,
  TrendingUp, Bot, Bell, LogOut, Menu, X, Zap, ChevronRight, Store,
  Sun, Moon, Download, Shield
} from 'lucide-react';
import { useNotifications } from '@/hooks/useNotifications';
import { usePWAInstall } from '@/hooks/usePWAInstall';

// ADMIN_EMAIL — only this account sees the Admin Panel entry in the sidebar.
// The actual admin API is still protected server-side by requireAdmin middleware.
const ADMIN_EMAIL = 'nnanwubagabriel@gmail.com';

const navItems = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/sales', icon: ShoppingCart, label: 'Sales' },
  { to: '/purchases', icon: TruckIcon, label: 'Purchases' },
  { to: '/analytics', icon: BarChart3, label: 'Analytics' },
  { to: '/forecasting', icon: TrendingUp, label: 'AI Forecasting', badge: 'AI' },
  { to: '/assistant', icon: Bot, label: 'AI Assistant', badge: 'AI' },
  { to: '/notifications', icon: Bell, label: 'Alerts' },
];

interface SidebarProps {
  mobileOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ mobileOpen, onClose }) => {
  const { user, logout, currentBusiness } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const business = currentBusiness();
  const location = useLocation();
  const unreadCount = useNotifications();
  const [showSignoutWarning, setShowSignoutWarning] = useState(false);

  // Apply theme on mount
  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const handleLogout = () => {
    logout();
    window.location.href = '/';
  };

  const NavItem = ({ item }: { item: typeof navItems[0] }) => {
    const active = location.pathname.startsWith(item.to);
    return (
      <NavLink
        to={item.to}
        onClick={onClose}
        className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150',
          'group relative',
          active
            ? 'bg-brand-500/15 text-brand-400 border border-brand-500/20'
            : 'text-navy-400 hover:text-navy-100 hover:bg-navy-700 border border-transparent'
        )}
      >
        <item.icon size={18} className={cn(active ? 'text-brand-400' : 'text-navy-500 group-hover:text-navy-300')} />
        <span className="flex-1">{item.label}</span>
        {item.badge && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-brand-500/20 text-brand-400">
            {item.badge}
          </span>
        )}
        {item.to === '/notifications' && (unreadCount.data ?? 0) > 0 && (
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full bg-red-500 text-white min-w-[18px] text-center">
            {unreadCount.data}
          </span>
        )}
        {active && <ChevronRight size={14} className="text-brand-500" />}
      </NavLink>
    );
  };

  const content = (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-navy-700">
        <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
          <Zap size={16} className="text-white" fill="white" />
        </div>
        <div>
          <span className="text-sm font-bold text-white">MarketMind</span>
          <span className="text-brand-400 text-sm font-bold"> AI</span>
        </div>
        {/* Theme toggle */}
        <button
          onClick={toggle}
          className="ml-auto p-1.5 rounded-lg text-navy-400 hover:text-white hover:bg-navy-700 transition-colors"
          title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        <button onClick={onClose} className="lg:hidden text-navy-400 hover:text-white">
          <X size={20} />
        </button>
      </div>

      {/* Business info */}
      {business && (
        <div className="px-4 py-3 border-b border-navy-700">
          <div className="flex items-center gap-2.5 px-2 py-2 rounded-lg bg-navy-700/50">
            <div className="w-7 h-7 bg-brand-500/20 rounded-lg flex items-center justify-center shrink-0">
              <Store size={14} className="text-brand-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs font-semibold text-white truncate">{business.name}</p>
              <p className="text-[10px] text-navy-400 truncate">{business.location}</p>
            </div>
          </div>
        </div>
      )}

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => <NavItem key={item.to} item={item} />)}

        {/* Admin Panel — only visible to the designated admin account */}
        {user?.email === ADMIN_EMAIL && (
          <>
            <div className="pt-3 pb-1">
              <p className="px-3 text-[10px] font-semibold text-navy-600 uppercase tracking-widest">
                Administration
              </p>
            </div>
            <Link
              to="/admin/dashboard"
              onClick={onClose}
              className={cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-150 border',
                'bg-red-600/10 text-red-400 border-red-600/20 hover:bg-red-600/20'
              )}
            >
              <Shield size={18} className="text-red-400 shrink-0" />
              <span className="flex-1">Admin Panel</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-red-600/20 text-red-400">
                ADMIN
              </span>
            </Link>
          </>
        )}
      </nav>

      {/* User */}
      <div className="px-3 py-4 border-t border-navy-700">
        <div className="flex items-center gap-3 px-2 py-2 mb-1 min-w-0">
          <div className="w-8 h-8 bg-navy-600 rounded-full flex items-center justify-center text-xs font-bold text-navy-200 shrink-0">
            {user?.firstName?.[0]}{user?.lastName?.[0]}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-semibold text-white truncate">{user?.firstName} {user?.lastName}</p>
            <p className="text-[10px] text-navy-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => setShowSignoutWarning(true)}
          className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-navy-400 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-colors touch-manipulation"
        >
          <LogOut size={16} className="shrink-0" />
          Sign out
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex flex-col w-60 bg-navy-900 border-r border-navy-700 h-screen sticky top-0 shrink-0">
        {content}
      </aside>

      {/* Mobile drawer */}
      {mobileOpen && (
        <>
          <div className="fixed inset-0 z-40 bg-black/60 lg:hidden" onClick={onClose} />
          {/* w-[min(18rem,85vw)] ensures drawer never exceeds 85% of viewport width on tiny screens */}
          <aside className="fixed left-0 top-0 bottom-0 z-50 w-[min(18rem,85vw)] bg-navy-900 border-r border-navy-700 lg:hidden animate-slide-in overflow-y-auto">
            {content}
          </aside>
        </>
      )}

      {/* Sign-out confirmation — rendered ONCE outside both sidebar instances
          so it never duplicates and always sits above everything at z-[60] */}
      {showSignoutWarning && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setShowSignoutWarning(false)}
          />
          <div className="relative bg-navy-800 border border-navy-700 rounded-2xl p-5 sm:p-6 w-full max-w-sm shadow-card-lg animate-slide-up">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-red-500/15 rounded-xl flex items-center justify-center shrink-0">
                <LogOut size={18} className="text-red-400" />
              </div>
              <div className="min-w-0">
                <h3 className="text-base font-bold text-white">Sign out?</h3>
                <p className="text-xs text-navy-400">You'll need to log back in to access your business</p>
              </div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowSignoutWarning(false)}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-navy-200 bg-navy-700 hover:bg-navy-600 rounded-xl transition-colors touch-manipulation"
              >
                Cancel
              </button>
              <button
                onClick={handleLogout}
                className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors touch-manipulation"
              >
                Yes, sign out
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export const TopBar: React.FC<{ onMenuClick: () => void; title: string }> = ({ onMenuClick, title }) => {
  const unreadCount = useNotifications();
  const { isInstallable, install } = usePWAInstall();
  return (
    <header className="sticky top-0 z-30 bg-navy-900/80 backdrop-blur-xl border-b border-navy-700 px-4 lg:px-6 py-3.5 flex items-center gap-3">
      <button
        onClick={onMenuClick}
        className="p-2 rounded-lg text-navy-400 hover:text-white hover:bg-navy-700 transition-colors lg:hidden touch-manipulation shrink-0"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>
      <h1 className="text-base font-semibold text-white flex-1 truncate">{title}</h1>
      {/* PWA install button */}
      {isInstallable && (
        <button
          onClick={install}
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-brand-500/15 hover:bg-brand-500/25 text-brand-400 border border-brand-500/20 rounded-lg transition-colors shrink-0 touch-manipulation"
        >
          <Download size={13} />
          Install App
        </button>
      )}
      {/* Notification bell with unread badge */}
      <Link
        to="/notifications"
        className="relative p-2 rounded-lg text-navy-400 hover:text-white hover:bg-navy-700 transition-colors touch-manipulation shrink-0"
        aria-label="Notifications"
      >
        <Bell size={18} />
        {(unreadCount.data ?? 0) > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
            {(unreadCount.data ?? 0) > 9 ? '9+' : unreadCount.data}
          </span>
        )}
      </Link>
    </header>
  );
};
