import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AdminThemeState {
  isDark: boolean;
  toggle: () => void;
}

export const useAdminThemeStore = create<AdminThemeState>()(
  persist(
    (set, get) => ({
      isDark: true,
      toggle: () => {
        const next = !get().isDark;
        set({ isDark: next });
        // Admin uses a dedicated HTML class so it doesn't conflict with the
        // trader app theme which manages 'dark' on <html>
        if (next) {
          document.documentElement.setAttribute('data-admin-theme', 'dark');
        } else {
          document.documentElement.setAttribute('data-admin-theme', 'light');
        }
      },
    }),
    { name: 'marketmind-admin-theme' }
  )
);
