import React, { useState } from 'react';
import { User } from '../types';
import {
  X,
  Mail,
  Lock,
  User as UserIcon,
  Phone,
  Coffee,
  Eye,
  EyeOff,
  ShieldCheck,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  KeyRound,
  UserPlus,
  LogIn,
} from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthSuccess: (user: User, token: string) => void;
  initialMode?: 'login' | 'register';
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onAuthSuccess,
  initialMode = 'login',
}) => {
  if (!isOpen) return null;

  const [mode, setMode] = useState<'login' | 'register'>(initialMode);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [favoriteDrink, setFavoriteDrink] = useState('');

  // UI States
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  // Password strength checker
  const getPasswordStrength = (pass: string) => {
    if (!pass) return { score: 0, label: '', color: '' };
    let score = 0;
    if (pass.length >= 6) score += 1;
    if (pass.length >= 10) score += 1;
    if (/[A-Z]/.test(pass)) score += 1;
    if (/[0-9]/.test(pass)) score += 1;
    if (/[^A-Za-z0-9]/.test(pass)) score += 1;

    if (score <= 1) return { score: 1, label: 'Weak', color: 'bg-rose-500' };
    if (score <= 3) return { score: 2, label: 'Medium', color: 'bg-amber-500' };
    return { score: 3, label: 'Strong & Secure', color: 'bg-emerald-500' };
  };

  const strength = getPasswordStrength(password);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');
    setSuccessMsg('');
    setIsLoading(true);

    const endpoint = mode === 'login' ? '/api/auth/login' : '/api/auth/register';
    const payload =
      mode === 'login'
        ? { email, password }
        : { name, email, password, phone, favoriteDrink };

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (data.success && data.user && data.token) {
        setSuccessMsg(data.message || 'Authentication successful!');
        setTimeout(() => {
          onAuthSuccess(data.user, data.token);
          onClose();
        }, 800);
      } else {
        setErrorMsg(data.error || 'Authentication failed. Please check your input.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Network connection failed');
    } finally {
      setIsLoading(false);
    }
  };

  // Quick Autofill Demo Credentials
  const handleAutofillDemo = (type: 'customer' | 'admin') => {
    setErrorMsg('');
    if (type === 'customer') {
      setMode('login');
      setEmail('sarah.crave@example.com');
      setPassword('coffee123');
    } else {
      setMode('login');
      setEmail('admin@cravecups.com');
      setPassword('admin123');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-fade-in">
      <div className="relative w-full max-w-md bg-[#1F1A17] border border-[#3A312B] rounded-3xl overflow-hidden shadow-2xl flex flex-col">
        {/* Top Header */}
        <div className="p-5 bg-[#15110F] border-b border-[#3A312B] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#E65F2B] to-[#D4A373] p-0.5 shadow-md shadow-[#E65F2B]/30 flex items-center justify-center">
              <div className="w-full h-full bg-[#1F1A17] rounded-[14px] flex items-center justify-center">
                <Coffee className="w-5 h-5 text-[#E65F2B]" />
              </div>
            </div>
            <div>
              <h3 className="text-base font-extrabold text-white flex items-center gap-1.5">
                <span>Crave<span className="text-[#E65F2B]">Cups</span> Account</span>
              </h3>
              <p className="text-xs text-[#D4A373]">
                {mode === 'login' ? 'Sign in to your member account' : 'Create a new CraveCups account'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-stone-400 hover:text-white rounded-full bg-[#2D2521] border border-[#3A312B] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selector: Sign In vs Create Account */}
        <div className="p-3 bg-[#15110F] border-b border-[#3A312B]">
          <div className="bg-[#2D2521] p-1 rounded-2xl border border-[#3A312B] flex gap-1">
            <button
              type="button"
              onClick={() => {
                setMode('login');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                mode === 'login'
                  ? 'bg-[#E65F2B] text-white shadow border border-[#E65F2B]'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('register');
                setErrorMsg('');
              }}
              className={`flex-1 py-2 rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition-all ${
                mode === 'register'
                  ? 'bg-[#E65F2B] text-white shadow border border-[#E65F2B]'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <UserPlus className="w-4 h-4" />
              <span>Register</span>
            </button>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-5 space-y-4 max-h-[75vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3 bg-rose-950/70 border border-rose-800 text-rose-300 text-xs rounded-2xl flex items-center gap-2.5 animate-shake">
              <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-3 bg-emerald-950/70 border border-emerald-800 text-emerald-300 text-xs rounded-2xl flex items-center gap-2.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3 text-xs">
            {mode === 'register' && (
              <>
                <div>
                  <label className="text-stone-300 font-semibold block mb-1">Full Name *</label>
                  <div className="relative">
                    <UserIcon className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Alex Morgan"
                      className="w-full bg-[#2D2521] border border-[#3A312B] focus:border-[#E65F2B] text-white p-2.5 pl-9 rounded-xl outline-none transition-colors"
                    />
                  </div>
                </div>
              </>
            )}

            <div>
              <label className="text-stone-300 font-semibold block mb-1">Email Address *</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. alex@example.com"
                  className="w-full bg-[#2D2521] border border-[#3A312B] focus:border-[#E65F2B] text-white p-2.5 pl-9 rounded-xl outline-none transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="text-stone-300 font-semibold block mb-1">Password *</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-stone-500 absolute left-3 top-3" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={mode === 'register' ? 'Min 6 characters' : 'Enter your password'}
                  className="w-full bg-[#2D2521] border border-[#3A312B] focus:border-[#E65F2B] text-white p-2.5 pl-9 pr-9 rounded-xl outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-3 text-stone-500 hover:text-white"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>

              {/* Password strength indicator on register */}
              {mode === 'register' && password && (
                <div className="mt-1.5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-stone-400">
                    <span>Security strength:</span>
                    <span className="font-bold text-stone-200">{strength.label}</span>
                  </div>
                  <div className="w-full h-1 bg-[#2D2521] rounded-full overflow-hidden flex gap-1">
                    <div className={`h-full flex-1 ${strength.score >= 1 ? strength.color : 'bg-stone-700'}`} />
                    <div className={`h-full flex-1 ${strength.score >= 2 ? strength.color : 'bg-stone-700'}`} />
                    <div className={`h-full flex-1 ${strength.score >= 3 ? strength.color : 'bg-stone-700'}`} />
                  </div>
                </div>
              )}
            </div>

            {mode === 'register' && (
              <>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-stone-300 font-semibold block mb-1">Phone (Optional)</label>
                    <div className="relative">
                      <Phone className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-3" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="(555) 000-0000"
                        className="w-full bg-[#2D2521] border border-[#3A312B] focus:border-[#E65F2B] text-white p-2.5 pl-8 rounded-xl outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-stone-300 font-semibold block mb-1">Favorite Drink</label>
                    <div className="relative">
                      <Coffee className="w-3.5 h-3.5 text-stone-500 absolute left-2.5 top-3" />
                      <input
                        type="text"
                        value={favoriteDrink}
                        onChange={(e) => setFavoriteDrink(e.target.value)}
                        placeholder="e.g. Cold Brew"
                        className="w-full bg-[#2D2521] border border-[#3A312B] focus:border-[#E65F2B] text-white p-2.5 pl-8 rounded-xl outline-none"
                      />
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full mt-2 bg-gradient-to-r from-[#E65F2B] to-[#D14F1D] hover:from-[#f06e3a] hover:to-[#e15926] text-white font-extrabold text-sm py-3 rounded-2xl shadow-xl shadow-[#E65F2B]/30 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95 disabled:bg-stone-700"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : mode === 'login' ? (
                <>
                  <LogIn className="w-4 h-4" />
                  <span>Sign In to Account</span>
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4" />
                  <span>Create Account Now</span>
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials Assistant */}
          <div className="pt-3 border-t border-[#3A312B]/80 space-y-2">
            <span className="text-[11px] text-stone-400 font-bold uppercase tracking-wider block text-center">
              ⚡ Quick Test Credentials
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleAutofillDemo('customer')}
                className="py-2 px-3 bg-[#2D2521] hover:bg-[#3A312B] text-stone-300 text-[11px] font-semibold rounded-xl border border-[#3A312B] transition-colors flex items-center justify-center gap-1.5"
              >
                <UserIcon className="w-3.5 h-3.5 text-[#D4A373]" />
                <span>Demo Customer</span>
              </button>
              <button
                type="button"
                onClick={() => handleAutofillDemo('admin')}
                className="py-2 px-3 bg-[#2D2521] hover:bg-[#3A312B] text-stone-300 text-[11px] font-semibold rounded-xl border border-[#3A312B] transition-colors flex items-center justify-center gap-1.5"
              >
                <KeyRound className="w-3.5 h-3.5 text-[#E65F2B]" />
                <span>Demo Admin</span>
              </button>
            </div>
          </div>
        </div>

        {/* Security Footer */}
        <div className="p-3 bg-[#15110F] border-t border-[#3A312B] flex items-center justify-center gap-1.5 text-[10px] text-stone-400">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>Secured with SHA-512 salted password hashing & session token</span>
        </div>
      </div>
    </div>
  );
};
