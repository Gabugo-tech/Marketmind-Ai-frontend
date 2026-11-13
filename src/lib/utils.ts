import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { format, formatDistanceToNow, parseISO } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency = 'NGN'): string {
  if (currency === 'NGN') {
    return `₦${amount.toLocaleString('en-NG', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  }
  return new Intl.NumberFormat('en-NG', { style: 'currency', currency }).format(amount);
}

export function formatNumber(num: number): string {
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString();
}

export function formatDate(date: string | Date, fmt = 'dd MMM yyyy'): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return format(d, fmt);
}

export function formatRelative(date: string | Date): string {
  const d = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceToNow(d, { addSuffix: true });
}

export function formatDateTime(date: string | Date): string {
  return formatDate(date, 'dd MMM yyyy, hh:mm a');
}

export function getStockStatusColor(status: string): string {
  switch (status) {
    case 'OUT_OF_STOCK': return 'text-red-400 bg-red-400/10';
    case 'CRITICAL_STOCK': return 'text-orange-400 bg-orange-400/10';
    case 'LOW_STOCK': return 'text-amber-400 bg-amber-400/10';
    case 'IN_STOCK': return 'text-emerald-400 bg-emerald-400/10';
    default: return 'text-gray-400 bg-gray-400/10';
  }
}

export function getStockStatusLabel(status: string): string {
  switch (status) {
    case 'OUT_OF_STOCK': return 'Out of Stock';
    case 'CRITICAL_STOCK': return 'Critical';
    case 'LOW_STOCK': return 'Low Stock';
    case 'IN_STOCK': return 'In Stock';
    default: return status;
  }
}

export function getUrgencyColor(urgency: 'IMMEDIATE' | 'SOON' | 'SUFFICIENT'): string {
  switch (urgency) {
    case 'IMMEDIATE': return 'text-red-400 bg-red-400/10 border-red-400/20';
    case 'SOON': return 'text-amber-400 bg-amber-400/10 border-amber-400/20';
    case 'SUFFICIENT': return 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20';
  }
}

export function truncate(str: string, length = 30): string {
  return str.length > length ? str.slice(0, length) + '…' : str;
}

export function debounce<T extends (...args: unknown[]) => void>(fn: T, ms = 300) {
  let timer: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timer);
    timer = setTimeout(() => fn(...args), ms);
  };
}
