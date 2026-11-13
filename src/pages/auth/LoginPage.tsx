import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleDemoLogin = () => {
    setForm({ email: 'demo@marketmind.ai', password: 'Demo1234!' });
  };

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
    <div className="min-h-screen bg-navy-950 flex">
      {/* Left — Branding */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 bg-gradient-to-br from-navy-900 via-navy-800 to-navy-900 border-r border-navy-700 p-12">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-brand-500 rounded-xl flex items-center justify-center">
            <Zap size={20} className="text-white" fill="white" />
          </div>
          <div>
            <span className="text-lg font-bold text-white">MarketMind</span>
            <span className="text-brand-400 text-lg font-bold"> AI</span>
          </div>
        </div>

        <div>
          <h2 className="text-4xl font-bold text-white leading-snug mb-4">
            Know Your Stock.<br />
            <span className="text-brand-400">Predict Your Sales.</span><br />
            Grow Your Business.
          </h2>
          <p className="text-navy-300 text-lg leading-relaxed">
            The intelligent inventory platform built for traders in Onitsha, Anambra State.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {[
            { label: 'AI Sales Forecasting', desc: 'Predict demand before it happens' },
            { label: 'Smart Restocking', desc: 'Know exactly what to buy, when' },
            { label: 'Real-time Analytics', desc: 'Live insights on your business' },
            { label: 'AI Assistant', desc: 'Ask questions in plain English' },
          ].map((f) => (
            <div key={f.label} className="p-4 bg-navy-700/50 rounded-xl border border-navy-600">
              <p className="text-sm font-semibold text-white">{f.label}</p>
              <p className="text-xs text-navy-400 mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right — Form */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="w-full max-w-sm">
          {/* Mobile logo */}
          <div className="flex items-center gap-2 justify-center mb-8 lg:hidden">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" fill="white" />
            </div>
            <span className="text-lg font-bold text-white">MarketMind <span className="text-brand-400">AI</span></span>
          </div>

          <h1 className="text-2xl font-bold text-white mb-1">Welcome back</h1>
          <p className="text-navy-400 text-sm mb-8">Sign in to manage your business</p>

          {/* Demo banner */}
          <div className="mb-6 p-3 bg-brand-500/10 border border-brand-500/20 rounded-xl flex items-center justify-between">
            <div>
              <p className="text-xs font-semibold text-brand-400">🎯 Hackathon Demo</p>
              <p className="text-xs text-navy-300 mt-0.5">Try with our pre-loaded sample business</p>
            </div>
            <Button size="xs" variant="secondary" onClick={handleDemoLogin}>
              Use Demo
            </Button>
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
                <button type="button" onClick={() => setShowPass(!showPass)} className="text-navy-400 hover:text-navy-200">
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
            <Link to="/register" className="text-brand-400 hover:text-brand-300 font-medium">
              Create account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};
