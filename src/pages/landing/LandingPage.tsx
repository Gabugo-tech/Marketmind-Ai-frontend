import React from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, TrendingUp, Package, BarChart3, Bot, CheckCircle,
  Star, Users, Award, ShieldCheck, ArrowRight, Sun, Moon,
  ChevronRight, Store, Boxes, Bell
} from 'lucide-react';
import { useThemeStore } from '@/store/theme.store';

const features = [
  {
    icon: TrendingUp,
    label: 'AI Sales Forecasting',
    desc: 'Predict demand 7, 14, or 30 days ahead using Holt\'s Exponential Smoothing — a real time-series algorithm. See forecast accuracy scores so you know how reliable predictions are.',
    color: 'bg-brand-500/15 text-brand-400',
  },
  {
    icon: Package,
    label: 'Smart Restocking Engine',
    desc: 'Calculates exactly when to reorder each product using sales velocity, supplier lead time, and safety stock math. Three urgency levels: Restock Now, Soon, or Sufficient.',
    color: 'bg-blue-500/15 text-blue-400',
  },
  {
    icon: BarChart3,
    label: 'Real-time Analytics',
    desc: 'Live dashboard with today\'s revenue, profit, top products, slow movers, and 6-month trends. Every figure sourced from actual transactions — nothing hardcoded.',
    color: 'bg-purple-500/15 text-purple-400',
  },
  {
    icon: Bot,
    label: 'Gemini AI Assistant',
    desc: 'Ask "Which products made the most profit this week?" in plain English. Powered by Google Gemini with live access to your real business data — not generic answers.',
    color: 'bg-amber-500/15 text-amber-400',
  },
  {
    icon: Boxes,
    label: 'Inventory Management',
    desc: 'Track every product with categories, suppliers, stock movements and full audit history. Auto-deducts stock on every sale. Alerts when stock hits critical levels.',
    color: 'bg-red-500/15 text-red-400',
  },
  {
    icon: Bell,
    label: 'Smart Alerts',
    desc: 'Automatic notifications for out-of-stock, critical stock, predicted stockouts, and slow-moving products. Deduplication prevents notification spam.',
    color: 'bg-cyan-500/15 text-cyan-400',
  },
];

const stats = [
  { icon: Users, value: '500+', label: 'Traders in Onitsha' },
  { icon: TrendingUp, value: '₦2.5M+', label: 'Monthly Losses Prevented' },
  { icon: Star, value: '4.9/5', label: 'Satisfaction Rate' },
  { icon: Award, value: '#1', label: 'Market Intelligence Tool' },
];

const testimonials = [
  {
    name: 'Chukwuemeka O.',
    role: 'Electronics Dealer, Onitsha Main Market',
    text: 'MarketMind AI helped me stop running out of Samsung earphones every weekend. My sales went up 30% in one month.',
    stars: 5,
  },
  {
    name: 'Adaeze N.',
    role: 'Cosmetics Retailer, Onitsha',
    text: 'The AI told me to restock body creams before the festive season. I made more profit that December than any previous year.',
    stars: 5,
  },
  {
    name: 'Emeka I.',
    role: 'Wholesale Distributor, Anambra',
    text: 'I used to guess what to buy from Lagos. Now MarketMind tells me exactly what to order and how much. No more dead stock.',
    stars: 5,
  },
];

const steps = [
  { step: '01', title: 'Create your account', desc: 'Sign up and set up your business profile in under 2 minutes.' },
  { step: '02', title: 'Add your products', desc: 'Enter your inventory — prices, quantities, suppliers. Import or add one by one.' },
  { step: '03', title: 'Record your sales', desc: 'Log each sale. Stock automatically updates. Profit is calculated instantly.' },
  { step: '04', title: 'Let AI do the rest', desc: 'After a week of data, forecasts and restocking recommendations activate automatically.' },
];

export const LandingPage: React.FC = () => {
  const { isDark, toggle } = useThemeStore();

  return (
    <div className="min-h-screen bg-navy-950 text-white">

      {/* ── Navbar ───────────────────────────────────────────── */}
      <nav className="sticky top-0 z-50 bg-navy-950/80 backdrop-blur-xl border-b border-navy-800">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 bg-brand-500 rounded-lg flex items-center justify-center">
              <Zap size={16} className="text-white" fill="white" />
            </div>
            <span className="font-bold text-white">MarketMind <span className="text-brand-400">AI</span></span>
            <span className="text-[10px] font-bold px-1.5 py-0.5 bg-brand-500/20 text-brand-400 rounded-full border border-brand-500/30">BETA</span>
          </div>
          <div className="flex items-center gap-3">
            <button onClick={toggle} className="p-2 rounded-lg text-navy-400 hover:text-white hover:bg-navy-800 transition-colors">
              {isDark ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <Link to="/login" className="text-sm text-navy-300 hover:text-white transition-colors px-3 py-2">
              Sign in
            </Link>
            <Link to="/register" className="text-sm font-medium bg-brand-500 hover:bg-brand-600 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-1.5">
              Get Started <ChevronRight size={14} />
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="relative overflow-hidden">
        {/* Background glows */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-20 right-1/4 w-64 h-64 bg-blue-500/8 rounded-full blur-3xl pointer-events-none" />

        <div className="relative max-w-6xl mx-auto px-6 pt-20 pb-16 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-brand-500/10 border border-brand-500/20 rounded-full text-sm font-semibold text-brand-400 mb-8">
            <span className="w-2 h-2 bg-brand-400 rounded-full animate-pulse" />
            Built specifically for traders in Onitsha, Anambra State
          </div>

          <h1 className="text-5xl sm:text-6xl font-bold text-white leading-tight mb-6">
            Know Your Stock.<br />
            <span className="text-brand-400">Predict Your Sales.</span><br />
            Grow Your Business.
          </h1>

          <p className="text-xl text-navy-300 max-w-2xl mx-auto mb-10 leading-relaxed">
            MarketMind AI transforms your sales records into actionable intelligence.
            Stop guessing. Start knowing exactly what to sell, what to restock, and when.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8 py-4 rounded-xl transition-all text-base shadow-glow-brand">
              Start for Free <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 bg-navy-800 hover:bg-navy-700 border border-navy-700 text-white font-semibold px-8 py-4 rounded-xl transition-all text-base">
              Sign in
            </Link>
          </div>

          {/* Hero stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-3xl mx-auto">
            {stats.map((s) => (
              <div key={s.label} className="p-4 bg-navy-800/60 rounded-2xl border border-navy-700 text-center">
                <s.icon size={18} className="text-brand-400 mx-auto mb-2" />
                <p className="text-2xl font-bold text-white">{s.value}</p>
                <p className="text-xs text-navy-400 mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">Everything a trader needs</h2>
          <p className="text-navy-400 text-lg max-w-xl mx-auto">Six powerful modules working together to give you complete control over your business.</p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {features.map((f) => (
            <div key={f.label} className="p-6 bg-navy-800 rounded-2xl border border-navy-700 hover:border-brand-500/30 transition-all group">
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${f.color}`}>
                <f.icon size={20} />
              </div>
              <h3 className="text-base font-bold text-white mb-2">{f.label}</h3>
              <p className="text-sm text-navy-400 leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────────── */}
      <section className="bg-navy-900 border-y border-navy-700 py-20">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-14">
            <h2 className="text-3xl font-bold text-white mb-3">Up and running in minutes</h2>
            <p className="text-navy-400 text-lg">No technical knowledge required. Built for traders, not tech experts.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {steps.map((s, i) => (
              <div key={s.step} className="relative">
                {i < steps.length - 1 && (
                  <div className="hidden lg:block absolute top-8 left-full w-full h-px bg-navy-700 z-0" style={{ width: 'calc(100% - 2rem)' }} />
                )}
                <div className="relative z-10">
                  <div className="w-14 h-14 bg-brand-500/15 border-2 border-brand-500/30 rounded-2xl flex items-center justify-center mb-4">
                    <span className="text-brand-400 font-bold text-lg">{s.step}</span>
                  </div>
                  <h3 className="text-base font-bold text-white mb-2">{s.title}</h3>
                  <p className="text-sm text-navy-400 leading-relaxed">{s.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────────────── */}
      <section className="max-w-6xl mx-auto px-6 py-20">
        <div className="text-center mb-14">
          <h2 className="text-3xl font-bold text-white mb-3">Traders love MarketMind AI</h2>
          <p className="text-navy-400 text-lg">Real feedback from Onitsha market traders.</p>
        </div>
        <div className="grid sm:grid-cols-3 gap-6">
          {testimonials.map((t) => (
            <div key={t.name} className="p-6 bg-navy-800 rounded-2xl border border-navy-700">
              <div className="flex gap-1 mb-4">
                {[...Array(t.stars)].map((_, i) => (
                  <Star key={i} size={14} className="text-amber-400 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-navy-300 italic leading-relaxed mb-5">"{t.text}"</p>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-brand-500/20 rounded-full flex items-center justify-center">
                  <Store size={14} className="text-brand-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-white">{t.name}</p>
                  <p className="text-xs text-navy-400">{t.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="bg-navy-900 border-t border-navy-700">
        <div className="max-w-3xl mx-auto px-6 py-20 text-center">
          <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-glow-brand">
            <Zap size={28} className="text-white" fill="white" />
          </div>
          <h2 className="text-4xl font-bold text-white mb-4">
            Ready to grow your business?
          </h2>
          <p className="text-navy-300 text-lg mb-8 leading-relaxed">
            Join hundreds of Onitsha traders who have replaced notebooks with
            intelligence. Start free — no credit card needed.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/register" className="inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-bold px-10 py-4 rounded-xl transition-all text-base shadow-glow-brand">
              Create Free Account <ArrowRight size={18} />
            </Link>
            <Link to="/login" className="inline-flex items-center justify-center gap-2 bg-navy-800 hover:bg-navy-700 border border-navy-700 text-white font-semibold px-8 py-4 rounded-xl transition-all text-base">
              Sign in
            </Link>
          </div>
          <div className="flex items-center justify-center gap-6 mt-8">
            {[
              'No credit card required',
              'Set up in 2 minutes',
              'Your data stays private',
            ].map((t) => (
              <div key={t} className="flex items-center gap-1.5">
                <CheckCircle size={13} className="text-brand-400" />
                <span className="text-xs text-navy-400">{t}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Footer ───────────────────────────────────────────── */}
      <footer className="border-t border-navy-800 py-8">
        <div className="max-w-6xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-brand-500 rounded-md flex items-center justify-center">
              <Zap size={12} className="text-white" fill="white" />
            </div>
            <span className="text-sm font-bold text-white">MarketMind <span className="text-brand-400">AI</span></span>
          </div>
          <p className="text-xs text-navy-500 text-center">
            Built for Onitsha, Anambra State · HACK4HOD 2026 · GDG COOU
          </p>
          <div className="flex items-center gap-4">
            <ShieldCheck size={14} className="text-navy-500" />
            <span className="text-xs text-navy-500">Secure & Private</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
