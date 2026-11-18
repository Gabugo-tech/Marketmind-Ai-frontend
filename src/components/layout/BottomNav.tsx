import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, ShoppingCart, TrendingUp, Bot } from 'lucide-react';
import { cn } from '@/lib/utils';

const items = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { to: '/inventory', icon: Package, label: 'Inventory' },
  { to: '/sales', icon: ShoppingCart, label: 'Sales' },
  { to: '/forecasting', icon: TrendingUp, label: 'Forecast' },
  { to: '/assistant', icon: Bot, label: 'AI' },
];

export const BottomNav: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-navy-900/95 backdrop-blur-xl border-t border-navy-700 safe-area-pb">
      <div className="flex items-center justify-around px-2 py-2">
        {items.map((item) => {
          const active = location.pathname.startsWith(item.to);
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={cn(
                'flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-xl transition-all min-w-0',
                active ? 'text-brand-400' : 'text-navy-500 hover:text-navy-300'
              )}
            >
              <div className={cn(
                'p-1.5 rounded-lg transition-colors',
                active ? 'bg-brand-500/20' : ''
              )}>
                <item.icon size={20} />
              </div>
              <span className={cn('text-[10px] font-medium truncate', active ? 'text-brand-400' : 'text-navy-500')}>
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
