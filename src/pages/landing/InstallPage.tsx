import React from 'react';
import { Link } from 'react-router-dom';
import { Zap, Smartphone, Chrome, ArrowLeft, Download, CheckCircle } from 'lucide-react';
import { usePWAInstall } from '@/hooks/usePWAInstall';

export const InstallPage: React.FC = () => {
  const { isInstallable, install } = usePWAInstall();

  return (
    <div className="min-h-screen bg-navy-950 flex flex-col items-center justify-center p-6">
      {/* Back */}
      <div className="w-full max-w-lg mb-6">
        <Link to="/" className="flex items-center gap-2 text-sm text-navy-400 hover:text-white transition-colors">
          <ArrowLeft size={16} /> Back to home
        </Link>
      </div>

      <div className="w-full max-w-lg">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="w-16 h-16 bg-brand-500 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-glow-brand">
            <Zap size={28} className="text-white" fill="white" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Install MarketMind AI</h1>
          <p className="text-navy-400 text-sm">Add to your phone's home screen for the best experience</p>
        </div>

        {/* Auto install if supported */}
        {isInstallable && (
          <button
            onClick={install}
            className="w-full flex items-center justify-center gap-3 bg-brand-500 hover:bg-brand-600 text-white font-bold py-4 rounded-xl mb-8 transition-all shadow-glow-brand"
          >
            <Download size={20} />
            Install App Now
          </button>
        )}

        {/* Android instructions */}
        <div className="bg-navy-800 border border-navy-700 rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-green-500/15 rounded-xl flex items-center justify-center">
              <Smartphone size={18} className="text-green-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Android (Chrome)</p>
              <p className="text-xs text-navy-400">Recommended browser</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              'Open marketmindai-sigma.vercel.app in Chrome',
              'Tap the 3-dot menu (⋮) in the top right',
              'Tap "Add to Home Screen"',
              'Tap "Add" to confirm',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 bg-brand-500/20 text-brand-400 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-sm text-navy-300">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* iPhone instructions */}
        <div className="bg-navy-800 border border-navy-700 rounded-2xl p-6 mb-4">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-blue-500/15 rounded-xl flex items-center justify-center">
              <Smartphone size={18} className="text-blue-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">iPhone / iPad (Safari)</p>
              <p className="text-xs text-navy-400">Must use Safari browser</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              'Open marketmindai-sigma.vercel.app in Safari',
              'Tap the Share button (□↑) at the bottom',
              'Scroll down and tap "Add to Home Screen"',
              'Tap "Add" in the top right corner',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 bg-brand-500/20 text-brand-400 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-sm text-navy-300">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Desktop */}
        <div className="bg-navy-800 border border-navy-700 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 bg-amber-500/15 rounded-xl flex items-center justify-center">
              <Chrome size={18} className="text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Desktop (Chrome / Edge)</p>
              <p className="text-xs text-navy-400">Windows, Mac, Linux</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              'Open the site in Chrome or Edge',
              'Look for the install icon (⊕) in the address bar',
              'Click it and select "Install"',
            ].map((step, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="w-5 h-5 bg-brand-500/20 text-brand-400 rounded-full text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">{i + 1}</span>
                <p className="text-sm text-navy-300">{step}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits */}
        <div className="bg-brand-500/10 border border-brand-500/20 rounded-2xl p-5 mb-6">
          <p className="text-sm font-semibold text-brand-400 mb-3">Why install the app?</p>
          <div className="space-y-2">
            {[
              'Works faster than the browser',
              'Full screen experience, no browser bar',
              'Quick access from your home screen',
              'Works even with slow internet',
            ].map((b) => (
              <div key={b} className="flex items-center gap-2">
                <CheckCircle size={13} className="text-brand-400 shrink-0" />
                <p className="text-xs text-navy-300">{b}</p>
              </div>
            ))}
          </div>
        </div>

        <Link to="/register" className="w-full flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 text-white font-semibold py-3.5 rounded-xl transition-all">
          Create Free Account
        </Link>
      </div>
    </div>
  );
};
