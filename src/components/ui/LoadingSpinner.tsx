import React from 'react';
import { cn } from '@/lib/utils';

interface SpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const LoadingSpinner: React.FC<SpinnerProps> = ({ size = 'md', className }) => {
  const sizes = { sm: 'w-4 h-4', md: 'w-6 h-6', lg: 'w-8 h-8' };
  return (
    <div className={cn('inline-flex items-center justify-center', className)}>
      <div className={cn(
        'border-2 border-navy-600 border-t-brand-500 rounded-full animate-spin',
        sizes[size]
      )} />
    </div>
  );
};

export const PageLoader: React.FC = () => (
  <div className="min-h-screen bg-navy-950 flex items-center justify-center">
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <div className="w-12 h-12 border-2 border-navy-700 rounded-full" />
        <div className="absolute inset-0 w-12 h-12 border-2 border-transparent border-t-brand-500 rounded-full animate-spin" />
      </div>
      <p className="text-sm text-navy-400 animate-pulse">Loading MarketMind AI...</p>
    </div>
  </div>
);

export const EmptyState: React.FC<{
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}> = ({ icon, title, description, action }) => (
  <div className="flex flex-col items-center justify-center py-16 px-6 text-center">
    {icon && <div className="mb-4 p-4 bg-navy-800 rounded-2xl text-navy-400">{icon}</div>}
    <h3 className="text-base font-semibold text-navy-200 mb-2">{title}</h3>
    {description && <p className="text-sm text-navy-400 max-w-sm mb-6">{description}</p>}
    {action}
  </div>
);
