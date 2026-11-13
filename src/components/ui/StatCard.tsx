import React from 'react';
import { cn } from '@/lib/utils';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: { value: number; label?: string };
  icon?: React.ReactNode;
  iconBg?: string;
  className?: string;
  loading?: boolean;
}

export const StatCard: React.FC<StatCardProps> = ({
  title, value, subtitle, trend, icon, iconBg, className, loading
}) => {
  const trendPositive = trend && trend.value > 0;
  const trendNeutral = trend && trend.value === 0;

  return (
    <div className={cn(
      'bg-navy-800 border border-navy-700 rounded-xl p-5 flex flex-col gap-3',
      'hover:border-navy-600 transition-colors duration-200',
      className
    )}>
      <div className="flex items-start justify-between">
        <p className="text-xs font-semibold text-navy-400 uppercase tracking-wider">{title}</p>
        {icon && (
          <div className={cn('p-2 rounded-lg', iconBg || 'bg-brand-500/15')}>
            <div className="text-brand-400">{icon}</div>
          </div>
        )}
      </div>

      {loading ? (
        <div className="h-7 w-32 bg-navy-700 rounded-md animate-pulse" />
      ) : (
        <p className="text-2xl font-bold text-white tracking-tight">{value}</p>
      )}

      <div className="flex items-center gap-2">
        {trend && (
          <span className={cn(
            'flex items-center gap-0.5 text-xs font-medium',
            trendNeutral ? 'text-navy-400' : trendPositive ? 'text-emerald-400' : 'text-red-400'
          )}>
            {trendNeutral ? <Minus size={12} /> : trendPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
            {Math.abs(trend.value)}%
          </span>
        )}
        {subtitle && <p className="text-xs text-navy-400">{subtitle}</p>}
      </div>
    </div>
  );
};
