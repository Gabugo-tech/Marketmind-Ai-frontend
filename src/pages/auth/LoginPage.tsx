import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, ArrowRight, Sun, Moon } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore } from '@/store/theme.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    if (!form.email) return setErrors({ email: 'Email is required' });
    if (!form.password) return setErrors({ password: 'Password is required' });
    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      const { user, accessToken, refreshToken } = data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success(`Welcome back, ${user.firstName}!`);
      navigate('/dashboard');
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message || 'Login failed. Check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-6">
      {/* Theme toggle top right */}
      <div className="fixed top-4 right-4">
        <button
          onClick={toggle}
          className="p-2 rounded-lg text-navy-400 hover:text-white hover:bg-navy-800 transition-colors"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-10">
          <Link to="/" className="flex items-center gap-2.5 mb-2">
            <div className="w-11 h-11 bg-brand-500 rounded-2xl flex items-center justify-center shadow-glow-brand">
              <Zap size={22} className="text-white" fill="white" />
            </div>
            <div>
              <span className="text-xl font-bold text-white">MarketMind</span>
              <span className="text-brand-400 text-xl font-bold"> AI</span>
            </div>
          </Link>
          <p className="text-xs text-navy-500">Smart inventory for Onitsha traders</p>
        </div>

        {/* Card */}
        <div className="bg-navy-800 border border-navy-700 rounded-2xl p-7 shadow-card-lg">
          <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-navy-400 text-sm mb-6">Sign in to manage your business</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="trader@business.ng"
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              error={errors.email}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              error={errors.password}
              required
              autoComplete="current-password"
              rightElement={
                <button type="button" onClick={() => setShowPass(!showPass)} className="text-navy-400 hover:text-navy-200 transition-colors">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <Button type="submit" loading={loading} className="w-full" size="lg" iconRight={<ArrowRight size={18} />}>
              Sign in
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-navy-400 mt-5">
          New to MarketMind AI?{' '}
          <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
            Create account
          </Link>
        </p>

        <p className="text-center mt-3">
          <Link to="/" className="text-xs text-navy-500 hover:text-navy-300 transition-colors">
            ← Back to homepage
          </Link>
        </p>
      </div>
    </div>
  );
};
