import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, ArrowRight, ArrowLeft } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuthStore } from '@/store/auth.store';
import { Button } from '@/components/ui/Button';
import { Input, Select } from '@/components/ui/Input';
import toast from 'react-hot-toast';

const BUSINESS_CATEGORIES = [
  { value: '', label: 'Select business type...' },
  { value: 'ELECTRONICS', label: 'Electronics & Gadgets' },
  { value: 'CLOTHING_FASHION', label: 'Clothing & Fashion' },
  { value: 'FOODSTUFF', label: 'Foodstuff & Provisions' },
  { value: 'COSMETICS', label: 'Cosmetics & Beauty' },
  { value: 'GENERAL_MERCHANDISE', label: 'General Merchandise' },
  { value: 'WHOLESALE', label: 'Wholesale Distribution' },
  { value: 'PHARMACEUTICALS', label: 'Pharmacy & Drugs' },
  { value: 'BUILDING_MATERIALS', label: 'Building Materials' },
  { value: 'AUTOMOTIVE', label: 'Automotive Parts' },
  { value: 'RETAIL', label: 'Retail Store' },
  { value: 'OTHER', label: 'Other' },
];

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '', phone: '', password: '',
    businessName: '', businessCategory: '', businessLocation: 'Onitsha, Anambra State', businessAddress: '',
  });

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await api.post('/auth/register', form);
      const { user, accessToken, refreshToken } = data.data;
      setAuth(user, accessToken, refreshToken);
      toast.success('Welcome to MarketMind AI! 🎉');
      navigate('/dashboard');
    } catch (error: unknown) {
      const msg = (error as { response?: { data?: { message?: string } } })
        ?.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-navy-950 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex items-center gap-2 justify-center mb-8">
          <div className="w-9 h-9 bg-brand-500 rounded-xl flex items-center justify-center">
            <Zap size={18} className="text-white" fill="white" />
          </div>
          <span className="text-xl font-bold text-white">MarketMind <span className="text-brand-400">AI</span></span>
        </div>

        <div className="bg-navy-800 border border-navy-700 rounded-2xl p-7">
          {/* Step indicator */}
          <div className="flex items-center gap-2 mb-6">
            {[1, 2].map((s) => (
              <React.Fragment key={s}>
                <div className={`flex-1 h-1 rounded-full transition-colors ${s <= step ? 'bg-brand-500' : 'bg-navy-600'}`} />
              </React.Fragment>
            ))}
          </div>

          <h1 className="text-xl font-bold text-white mb-1">
            {step === 1 ? 'Create your account' : 'Your business details'}
          </h1>
          <p className="text-navy-400 text-sm mb-6">
            {step === 1 ? 'Start managing your business smarter' : 'Tell us about your business in Onitsha'}
          </p>

          <form onSubmit={step === 2 ? handleSubmit : (e) => { e.preventDefault(); setStep(2); }}>
            {step === 1 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <Input label="First name" value={form.firstName} onChange={set('firstName')} required placeholder="Chukwuemeka" />
                  <Input label="Last name" value={form.lastName} onChange={set('lastName')} required placeholder="Okafor" />
                </div>
                <Input label="Email address" type="email" value={form.email} onChange={set('email')} required placeholder="you@business.ng" />
                <Input label="Phone number" type="tel" value={form.phone} onChange={set('phone')} placeholder="+234..." />
                <Input
                  label="Password"
                  type="password"
                  value={form.password}
                  onChange={set('password')}
                  required
                  placeholder="Minimum 8 characters"
                  hint="At least 8 characters"
                />
                <Button type="submit" className="w-full" size="lg" iconRight={<ArrowRight size={18} />}>
                  Continue
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <Input label="Business name" value={form.businessName} onChange={set('businessName')} required placeholder="e.g. Okafor Electronics" />
                <Select
                  label="Business category"
                  value={form.businessCategory}
                  onChange={set('businessCategory')}
                  options={BUSINESS_CATEGORIES}
                  required
                />
                <Input label="Business location" value={form.businessLocation} onChange={set('businessLocation')} required placeholder="Onitsha, Anambra State" />
                <Input label="Shop address (optional)" value={form.businessAddress} onChange={set('businessAddress')} placeholder="Shop number, market, street" />
                <div className="flex gap-3">
                  <Button type="button" variant="secondary" onClick={() => setStep(1)} icon={<ArrowLeft size={16} />} className="flex-1">
                    Back
                  </Button>
                  <Button type="submit" loading={loading} className="flex-1">
                    Create Account
                  </Button>
                </div>
              </div>
            )}
          </form>
        </div>

        <p className="text-center text-sm text-navy-400 mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-brand-400 hover:text-brand-300 font-medium">Sign in</Link>
        </p>
      </div>
    </div>
  );
};
