import React, { useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  ShieldCheck,
} from 'lucide-react';
import { loginCoordinatorApi } from '../../services/portalApi';

interface CoordinatorLoginProps {
  onLoginSuccess: (token: string) => void;
  onBackToPublic: () => void;
}

export const CoordinatorLogin: React.FC<CoordinatorLoginProps> = ({
  onLoginSuccess,
  onBackToPublic,
}) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!username.trim() || !password) {
      setError('Enter both coordinator username and password.');
      return;
    }
    setLoading(true);
    try {
      const result = await loginCoordinatorApi(username.trim(), password);
      onLoginSuccess(result.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Invalid coordinator credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#F5F3FF] via-[#F8FAFC] to-[#EFF6FF] flex flex-col items-center justify-center p-4 sm:p-6">
      <div className="w-full max-w-md">
        <button
          type="button"
          onClick={onBackToPublic}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-[#13354B] mb-6 cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Public Portal
        </button>

        <div className="bg-white rounded-3xl border border-slate-200/90 shadow-[0_20px_50px_-15px_rgba(19,53,75,0.12)] p-7 sm:p-9">
          {/* RIT + Harmonia Branding */}
          <div className="flex items-center justify-between gap-3 pb-5 mb-6 border-b border-slate-100">
            <img
              src="/assets/logos/rit-logo.png"
              alt="Rajalakshmi Institute of Technology"
              className="h-9 w-auto object-contain"
              referrerPolicy="no-referrer"
            />
            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-purple-50 text-[#6B1FE0] text-xs font-bold border border-purple-200/70">
              <ShieldCheck className="w-3.5 h-3.5" />
              Restricted
            </span>
          </div>

          <div className="mb-6">
            <h1 className="font-display text-2xl font-extrabold text-[#13354B] tracking-tight">
              Coordinator Portal
            </h1>
            <p className="text-sm text-slate-500 mt-1">
              HARMONIA 2027 Administrative Console · Department of CSE
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="coord-username"
                className="block text-xs font-bold text-[#13354B] mb-1.5"
              >
                Coordinator Username
              </label>
              <input
                id="coord-username"
                type="text"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Enter username"
                className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-[#13354B] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#6B1FE0]/30 focus:border-[#6B1FE0]"
              />
            </div>

            <div>
              <label
                htmlFor="coord-password"
                className="block text-xs font-bold text-[#13354B] mb-1.5"
              >
                Access Password
              </label>
              <div className="relative">
                <input
                  id="coord-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="w-full pl-4 pr-11 py-3 rounded-xl bg-slate-50 border border-slate-200 text-sm text-[#13354B] focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#6B1FE0]/30 focus:border-[#6B1FE0]"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div
                role="alert"
                className="rounded-xl bg-rose-50 border border-rose-200 px-3.5 py-2.5 text-xs text-rose-700 flex items-center gap-2"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 px-5 py-3.5 rounded-xl text-sm font-bold text-white bg-[#13354B] hover:bg-[#1E5070] transition-colors cursor-pointer disabled:opacity-60 min-h-[46px]"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Verifying Credentials...
                </>
              ) : (
                <>
                  <Lock className="w-4 h-4" />
                  Sign In to Dashboard
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
