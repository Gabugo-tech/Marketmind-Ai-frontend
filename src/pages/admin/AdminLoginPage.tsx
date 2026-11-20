import React, { useState } from 'react';
import { useNavigate, Navigate, useSearchParams } from 'react-router-dom';
import { Shield, Eye, EyeOff, Lock } from 'lucide-react';
import { adminApi } from '@/lib/adminApi';
import { useAdminStore } from '@/store/admin.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

// Secret access token — the page only renders when ?access=<this value> is present.
// Without it, visitors are silently redirected to the homepage.
// To access admin login: /admin/login?access=mm-admin-2026
const ACCESS_TOKEN = 'mm-admin-2026';

export const AdminLoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { isAuthenticated, setAuth } = useAdminStore();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  // Already logged in → go to dashboard
  if (isAuthenticated) return <Navigate to="/admin/dashboard" replace />;

  // No valid access token → silently redirect to homepage (no error message,
  // no hint that an admin panel exists)
  if (searchParams.get('access') !== ACCESS_TOKEN) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.email || !form.password) return;
    setLoading(true);
    try {
      const { data } = await adminApi.post('/login', form);
      const { token, admin } = data.data;
      setAuth(admin, token);
      toast.success(`Welcome, ${admin.firstName}`);
      navigate('/admin/dashboard');
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ||
        'Invalid credentials';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 bg-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-900/40">
            <Shield size={28} className="text-white" />
          </div>
          <h1 className="text-xl font-bold text-white">Admin Access</h1>
          <p className="text-xs text-slate-500 mt-1">MarketMind AI — Restricted Area</p>
        </div>

        {/* Warning banner */}
        <div className="flex items-start gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-xl mb-6">
          <Lock size={14} className="text-red-400 mt-0.5 shrink-0" />
          <p className="text-xs text-red-300">
            This area is restricted to authorised administrators only. Unauthorised access is prohibited.
          </p>
        </div>

        {/* Form */}
        <div className="bg-slate-900 border border-red-900/30 rounded-2xl p-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Admin email"
              type="email"
              placeholder="admin@example.com"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              required
              autoComplete="current-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-slate-400 hover:text-slate-200 transition-colors touch-manipulation"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <Button
              type="submit"
              loading={loading}
              className="w-full !bg-red-600 hover:!bg-red-700 !border-red-700"
              size="lg"
            >
              Sign in to Admin Panel
            </Button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-600 mt-4">
          All access attempts are logged and monitored.
        </p>
      </div>
    </div>
  );
};
