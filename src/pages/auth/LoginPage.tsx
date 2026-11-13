import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Eye, EyeOff, Zap, ArrowRight, TrendingUp, Package,
  BarChart3, Bot, CheckCircle, Sun, Moon, Star, Users, ShieldCheck, Award
} from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore } from '@/store/theme.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

const features = [
  { icon: TrendingUp, label: 'AI Sales Forecasting', desc: 'Predict demand 7–30 days ahead using real sales history' },
  { icon: Package, label: 'Smart Restocking', desc: 'Know exactly what to reorder and when — before you run out' },
  { icon: BarChart3, label: 'Real-time Analytics', desc: 'Live revenue, profit and product performance insights' },
  { icon: Bot, label: 'AI Business Assistant', desc: 'Ask questions about your business in plain English' },
];

const socialProof = [
  { icon: Users, value: '500+', label: 'Traders in Onitsha' },
  { icon: TrendingUp, value: '₦2.5M+', label: 'Monthly Losses Prevented' },
  { icon: Star, value: '4.9/5', label: 'Satisfaction Rate' },
  { icon: Award, value: '#1', label: 'Market Intelligence Tool' },
];

const testimonials = [
  {
    name: 'Chukwuemeka O.',
    role: 'Electronics Dealer, Onitsha',
    text: 'MarketMind AI helped me stop running out of Samsung earphones every weekend. My sales went up 30% in one month.',
  },
  {
    name: 'Adaeze N.',
    role: 'Cosmetics Retailer, Main Market',
    text: 'The AI told me to restock body creams before the festive season. I made more profit than ever.',
  },
];

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
    <div className="min-h-screen bg-navy-950 flex flex-col lg:flex-row">

      {/* ── Left branding panel ──────────────────────────────────── */}
      <div className="hidden lg:flex flex-col w-[58%] relative overflow-hidden bg-navy-900">
        {/* Glow blobs */}
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-brand-500/8 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500/8 rounded-full blur-3xl translate-x-1/3 translate-y-1/3 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-brand-400/5 rounded-full blur-2xl -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="relative z-10 flex flex-col h-full px-12 py-10 overflow-y-auto">
          {/* Logo + theme toggle */}
          <div className="flex items-center gap-3 mb-12">
            <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center shadow-glow-brand">
              <Zap size={20} className="text-white" fill="white" />
            </div>
            <div>
              <span className="text-lg font-bold text-white">MarketMind</span>
              <span className="text-brand-400 text-lg font-bold"> AI</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-brand-500/20 text-brand-400 rounded-full border border-brand-500/30">
              BETA
            </span>
            <button
              onClick={toggle}
              className="ml-auto p-2 rounded-lg text-navy-400 hover:text-white hover:bg-navy-700/50 transition-colors"
              title={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
          </div>

          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-brand-500/10 border border-brand-500/20 rounded-full text-xs font-semibold text-brand-400 mb-5 w-fit">
            <span className="w-1.5 h-1.5 bg-brand-400 rounded-full animate-pulse" />
            Built for Onitsha, Anambra State
          </div>

          {/* Hero text */}
          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Know Your Stock.<br />
            <span className="text-brand-400">Predict Your Sales.</span><br />
            Grow Your Business.
          </h1>
          <p className="text-navy-300 text-base leading-relaxed max-w-md mb-8">
            The intelligent inventory and sales forecasting platform designed
            specifically for traders in Onitsha's markets.
          </p>

          {/* Social proof stats */}
          <div className="grid grid-cols-4 gap-3 mb-8">
            {socialProof.map((s) => (
              <div key={s.label} className="p-3 bg-navy-800/50 rounded-xl border border-navy-700 text-center">
                <s.icon size={16} className="text-brand-400 mx-auto mb-1.5" />
                <p className="text-lg font-bold text-white">{s.value}</p>
                <p className="text-[10px] text-navy-400 leading-tight mt-0.5">{s.label}</p>
              </div>
            ))}
          </div>

          {/* Feature cards */}
          <div className="grid grid-cols-2 gap-3 mb-8">
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

          {/* Testimonials */}
          <div className="space-y-3 mb-8">
            {testimonials.map((t) => (
              <div key={t.name} className="p-4 bg-navy-800/40 rounded-xl border border-navy-700/50">
                <div className="flex gap-0.5 mb-2">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={11} className="text-amber-400 fill-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-navy-300 italic leading-relaxed mb-2">"{t.text}"</p>
                <div>
                  <p className="text-xs font-semibold text-white">{t.name}</p>
                  <p className="text-[10px] text-navy-500">{t.role}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Trust footer */}
          <div className="pt-5 border-t border-navy-700/50 flex items-center gap-4 mt-auto">
            <div className="flex items-center gap-1.5">
              <ShieldCheck size={13} className="text-brand-400" />
              <span className="text-xs text-navy-400">Bank-grade security</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle size={13} className="text-brand-400" />
              <span className="text-xs text-navy-400">Your data is private</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Zap size={13} className="text-brand-400" />
              <span className="text-xs text-navy-400">Real-time updates</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Right form panel ─────────────────────────────────────── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 lg:p-10">

        {/* Mobile header */}
        <div className="w-full max-w-sm mb-8 lg:hidden">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
                <Zap size={18} className="text-white" fill="white" />
              </div>
              <div>
                <span className="text-lg font-bold text-white">MarketMind</span>
                <span className="text-brand-400 text-lg font-bold"> AI</span>
              </div>
            </div>
            <button
              onClick={toggle}
              className="p-2 rounded-lg text-navy-400 hover:text-white hover:bg-navy-700 transition-colors"
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
          {/* Mobile social proof */}
          <div className="grid grid-cols-2 gap-2">
            {socialProof.map((s) => (
              <div key={s.label} className="p-2.5 bg-navy-800 rounded-xl border border-navy-700 flex items-center gap-2">
                <s.icon size={14} className="text-brand-400 shrink-0" />
                <div>
                  <p className="text-sm font-bold text-white">{s.value}</p>
                  <p className="text-[10px] text-navy-400">{s.label}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="w-full max-w-sm">
          <div className="mb-7">
            <h2 className="text-2xl font-bold text-white mb-1">Welcome back</h2>
            <p className="text-navy-400 text-sm">Sign in to manage your business</p>
          </div>

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

          <p className="text-center text-sm text-navy-400 mt-5">
            New to MarketMind AI?{' '}
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium transition-colors">
              Create account
            </Link>
          </p>

          {/* Mobile features */}
          <div className="mt-8 lg:hidden grid grid-cols-2 gap-2.5">
            {features.map((f) => (
              <div key={f.label} className="p-3 bg-navy-800 rounded-xl border border-navy-700 text-center">
                <f.icon size={16} className="text-brand-400 mx-auto mb-1.5" />
                <p className="text-xs font-semibold text-white">{f.label}</p>
                <p className="text-[10px] text-navy-400 mt-0.5">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
