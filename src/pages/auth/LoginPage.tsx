import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Zap, ArrowRight, Sun, Moon, AlertTriangle, MessageCircle, Lock } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { useThemeStore } from '@/store/theme.store';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import toast from 'react-hot-toast';

// WhatsApp support link — clicking this opens a DM to the support number
const WHATSAPP_NUMBER = '2349167240883'; // 234 = Nigeria country code, no leading 0
const WHATSAPP_URL = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
  'Hello, my MarketMind AI account has been suspended. I would like to appeal.'
)}`;

type ErrorType = 'generic' | 'wrong_password' | 'suspended' | 'rate_limited' | null;

interface SuspendedInfo {
  reason?: string;
}

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const { isDark, toggle } = useThemeStore();
  const [loading, setLoading] = useState(false);
  const [showPass, setShowPass] = useState(false);
  const [form, setForm] = useState({ email: '', password: '' });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [errorType, setErrorType] = useState<ErrorType>(null);
  const [suspendedInfo, setSuspendedInfo] = useState<SuspendedInfo>({});
  const [attemptsLeft, setAttemptsLeft] = useState<number | null>(null);

  const clearErrors = () => {
    setErrorType(null);
    setSuspendedInfo({});
    setFieldErrors({});
    setAttemptsLeft(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    clearErrors();

    if (!form.email) return setFieldErrors({ email: 'Email address is required' });
    if (!form.password) return setFieldErrors({ password: 'Password is required' });

    setLoading(true);
    try {
      const { data } = await api.post('/auth/login', form);
      const { user, accessToken, refreshToken } = data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success(`Welcome back, ${user.firstName}!`);
      navigate('/dashboard');
    } catch (err: unknown) {
      const error = err as { response?: { status?: number; data?: { message?: string } } };
      const status = error.response?.status;
      const message = error.response?.data?.message ?? '';

      if (status === 429) {
        setErrorType('rate_limited');
      } else if (message.toLowerCase().includes('suspended')) {
        setErrorType('suspended');
        // Extract reason from message: "Your account has been suspended: <reason>"
        const reasonMatch = message.match(/suspended[:\s]+(.+)/i);
        setSuspendedInfo({ reason: reasonMatch?.[1] });
      } else if (status === 401) {
        setErrorType('wrong_password');
      } else {
        setErrorType('generic');
        toast.error(message || 'Something went wrong. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-4 sm:p-6">
      {/* Theme toggle */}
      <div className="fixed top-4 right-4 z-10">
        <button
          onClick={toggle}
          className="p-2 rounded-lg text-navy-400 hover:text-white hover:bg-navy-800 transition-colors touch-manipulation"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>
      </div>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8 sm:mb-10">
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

        {/* ── Suspended account banner ─────────────────────────────────────── */}
        {errorType === 'suspended' && (
          <div className="mb-5 bg-red-500/10 border border-red-500/30 rounded-2xl p-5">
            <div className="flex items-start gap-3 mb-4">
              <Lock size={18} className="text-red-400 mt-0.5 shrink-0" />
              <div>
                <p className="text-sm font-bold text-red-400 mb-1">Account Suspended</p>
                {suspendedInfo.reason ? (
                  <p className="text-xs text-red-300 leading-relaxed">
                    Reason: <span className="font-medium">{suspendedInfo.reason}</span>
                  </p>
                ) : (
                  <p className="text-xs text-red-300">
                    Your account has been suspended by an administrator.
                  </p>
                )}
              </div>
            </div>

            {/* Support instructions */}
            <div className="bg-red-500/10 rounded-xl p-4 space-y-2">
              <p className="text-xs font-semibold text-red-300">How to contact support:</p>
              <ol className="text-xs text-red-200 space-y-1.5 list-none">
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 bg-red-500/30 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">1</span>
                  Click the WhatsApp button below to open a direct message
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 bg-red-500/30 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">2</span>
                  Provide your registered email address: <strong className="text-red-300">{form.email}</strong>
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 bg-red-500/30 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">3</span>
                  Explain why you believe the suspension should be lifted
                </li>
                <li className="flex items-start gap-2">
                  <span className="w-4 h-4 bg-red-500/30 rounded-full text-[10px] font-bold flex items-center justify-center shrink-0 mt-0.5">4</span>
                  Our team will review and respond within 24 hours
                </li>
              </ol>
            </div>

            <a
              href={WHATSAPP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold rounded-xl transition-colors touch-manipulation"
            >
              <MessageCircle size={18} />
              Contact Support on WhatsApp
            </a>
            <p className="text-[10px] text-red-400/70 text-center mt-2">
              WhatsApp: +234 916 724 0883
            </p>
          </div>
        )}

        {/* ── Rate-limited banner ───────────────────────────────────────────── */}
        {errorType === 'rate_limited' && (
          <div className="mb-5 flex items-start gap-3 p-4 bg-amber-500/10 border border-amber-500/30 rounded-xl">
            <AlertTriangle size={16} className="text-amber-400 mt-0.5 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-amber-400 mb-0.5">Too many failed attempts</p>
              <p className="text-xs text-amber-300">
                Your device has been temporarily blocked due to too many failed login attempts.
                Please wait <strong>15 minutes</strong> before trying again.
              </p>
            </div>
          </div>
        )}

        {/* ── Wrong password inline error ───────────────────────────────────── */}
        {errorType === 'wrong_password' && (
          <div className="mb-4 flex items-start gap-3 p-3.5 bg-red-500/10 border border-red-500/20 rounded-xl">
            <AlertTriangle size={15} className="text-red-400 mt-0.5 shrink-0" />
            <p className="text-xs text-red-300">
              <strong>Incorrect password.</strong> Please check your password and try again.
              If you've forgotten it, contact support via WhatsApp:{' '}
              <a
                href={WHATSAPP_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 underline font-medium"
              >
                +234 916 724 0883
              </a>
            </p>
          </div>
        )}

        {/* Login card */}
        <div className="bg-navy-800 border border-navy-700 rounded-2xl p-5 sm:p-7 shadow-card-lg">
          <h2 className="text-xl font-bold text-white mb-1">Welcome back</h2>
          <p className="text-navy-400 text-sm mb-6">Sign in to manage your business</p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="trader@business.ng"
              value={form.email}
              onChange={(e) => { setForm({ ...form, email: e.target.value }); clearErrors(); }}
              error={fieldErrors.email}
              required
              autoComplete="email"
            />
            <Input
              label="Password"
              type={showPass ? 'text' : 'password'}
              placeholder="••••••••"
              value={form.password}
              onChange={(e) => { setForm({ ...form, password: e.target.value }); clearErrors(); }}
              error={fieldErrors.password}
              required
              autoComplete="current-password"
              rightElement={
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="text-navy-400 hover:text-navy-200 transition-colors touch-manipulation"
                  aria-label={showPass ? 'Hide password' : 'Show password'}
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              }
            />
            <Button
              type="submit"
              loading={loading}
              disabled={errorType === 'rate_limited'}
              className="w-full"
              size="lg"
              iconRight={!loading ? <ArrowRight size={18} /> : undefined}
            >
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
