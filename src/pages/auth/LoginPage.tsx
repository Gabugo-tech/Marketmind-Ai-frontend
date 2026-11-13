import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, ArrowRight, TrendingUp, Package, BarChart3, Bot, CheckCircle } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

const features = [
  { icon: TrendingUp, label: 'AI Sales Forecasting', desc: 'Predict demand 7–30 days ahead using real sales history' },
  { icon: Package, label: 'Smart Restocking', desc: 'Know exactly what to reorder and when — before you run out' },
  { icon: BarChart3, label: 'Real-time Analytics', desc: 'Live revenue, profit, and product performance insights' },
  { icon: Bot, label: 'AI Business Assistant', desc: 'Ask questions about your business in plain English' },
];

const stats = [
  { value: '90 Days', label: 'History Analysis' },
  { value: 'Real-time', label: 'Stock Updates' },
  { value: 'Gemini AI', label: 'Powered' },
];

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
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
    <div className="min-h-screen bg-navy-950 flex flex-col lg:flex-row">

      {/* ── Left branding panel ──────────────────────────────── */}
      <div className="hidden lg:flex flex-col w-[55%] relative overflow-hidden bg-navy-900">
        {/* Glow blobs */}
        <div className="absolute top-0 left-0 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-80 h-80 bg-blue-500/8 rounded-full blur-3xl translate-x-1/2 translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full p-12">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-glow-brand">
              <Zap size={20} className="text-white" fill="white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">MarketMind</span>
              <span className="text-brand-400 text-lg font-bold"> AI</span>
            </div>
            <span className="ml-2 text-[10px] font-bold px-2 py-0.5 bg-brand-500/20 text-brand-400 rounded-full border border-brand-500/30">
              BETA
            </span>
          </div>

          {/* Hero */}
          <div className="mt-16 mb-10">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-500/10 border border-brand-500/20 rounded-full text-xs font-semibold text-brand-400 mb-6">
              <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
              Built for Onitsha, Anambra State
            </div>
            <h1 className="text-5xl font-bold text-white leading-tight mb-5">
              Know Your Stock.<br />
              <span className="text-brand-400">Predict Your Sales.</span><br />
              Grow Your Business.
            </h1>
            <p className="text-navy-300 text-lg leading-relaxed max-w-md">
              The intelligent inventory and sales forecasting platform designed
              specifically for traders in Onitsha's markets.
            </p>
          </div>

          {/* Stats */}
          <div className="flex gap-8 mb-10">
            {stats.map((s) => (
              <div key={s.label}>
                <p className="text-xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-navy-400 mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Feature grid */}
          <div className="grid grid-cols-2 gap-3 mt-auto">
            {features.map((f) => (
              <div key={f.label} className="p-4 bg-navy-800/60 rounded-xl border border-navy-700 hover:border-brand-500/30 transition-colors group">
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-7 h-7 bg-brand-500/15 rounded-lg flex items-center justify-center group-hover:bg-brand-500/25 transition-colors">
                    <f.icon size={14} className="text-brand-400" />
                  </div>
                  <p className="text-sm font-semibold text-white">{f.label}</p>
                </div>
                <p className="text-xs text-navy-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Footer trust line */}
          <div className="mt-8 pt-6 border-t border-navy-700/50 flex items-center gap-2">
            <CheckCircle size={14} className="text-brand-400" />
            <p className="text-xs text-navy-400">Secure · Private · Your data belongs to you</p>
          </div>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-12">

        {/* Mobile logo */}
        <div className="flex flex-col items-center gap-3 mb-10 lg:hidden">
          <div className="w-12 h-12 bg-brand-500 rounded-2xl flex items-center justify-center shadow-glow-brand">
            <Zap size={22} className="text-white" fill="white" />
          </div>
          <div className="text-center">
            <span className="text-xl font-bold text-white">MarketMind</span>
            <span className="text-brand-400 text-xl font-bold"> AI</span>
            <p className="text-xs text-navy-400 mt-1">Smart inventory for Onitsha traders</p>
          </div>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-navy-400 text-sm">Sign in to manage your business</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
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

          <p className="text-center text-sm text-navy-400 mt-6">
            New to MarketMind AI?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Create account
            </Link>
          </p>

          {/* Mobile features */}
          <div className="mt-10 lg:hidden grid grid-cols-2 gap-3">
            {features.map((f) => (
              <div key={f.label} className="p-3 bg-navy-800 rounded-xl border border-navy-700 text-center">
                <f.icon size={18} className="text-brand-400 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-white">{f.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
