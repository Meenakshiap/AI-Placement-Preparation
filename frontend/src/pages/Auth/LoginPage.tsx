import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.js';
import { BrainCircuit, Sparkles, ArrowRight, Lock, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';

export const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    const res = await login(email, password);
    setIsSubmitting(false);

    if (res.success) {
      navigate('/');
    } else {
      setError(res.message || 'Invalid credentials');
    }
  };

  const handleDemoLogin = async () => {
    setError(null);
    setIsSubmitting(true);
    const res = await demoLogin();
    setIsSubmitting(false);
    if (res.success) {
      navigate('/');
    } else {
      setError(res.message || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Card Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-amber-500 shadow-soft mb-4">
            <BrainCircuit className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-ink-900 tracking-tight">Welcome Back</h1>
          <p className="text-sm text-ink-500 mt-1">Sign in to resume your adaptive placement training</p>
        </div>

        {/* Card Body */}
        <div className="panel rounded-2xl p-6 sm:p-8">
          {error && (
            <div className="mb-6 p-3.5 rounded-xl bg-warn-100 border border-warn-500/20 text-warn-500 text-xs flex items-center space-x-2.5">
              <AlertCircle className="w-4 h-4 shrink-0 text-warn-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo One-Click Access Button */}
          <button
            type="button"
            onClick={handleDemoLogin}
            disabled={isSubmitting}
            className="w-full mb-6 py-3 px-4 rounded-xl bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-700 text-xs font-semibold flex items-center justify-center space-x-2 transition-all group"
          >
            <Sparkles className="w-4 h-4 text-amber-600 group-hover:rotate-12 transition-transform" />
            <span>Try Instant Demo Account (1-Click)</span>
          </button>

          <div className="relative flex py-2 items-center mb-6">
            <div className="flex-grow border-t border-line-100"></div>
            <span className="flex-shrink mx-4 text-xs uppercase tracking-wider text-ink-500 font-semibold">Or sign in with email</span>
            <div className="flex-grow border-t border-line-100"></div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-ink-700 mb-1.5">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-ink-400 absolute left-3.5 top-3.5" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="student@university.edu"
                  className="w-full bg-white border border-line-100 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-1 focus:ring-amber-200 transition"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1.5">
                <label className="block text-xs font-medium text-ink-700">Password</label>
              </div>
              <div className="relative">
                <Lock className="w-4 h-4 text-ink-400 absolute left-3.5 top-3.5" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-line-100 focus:border-amber-500 rounded-xl pl-10 pr-4 py-2.5 text-sm text-ink-900 placeholder-ink-400 focus:outline-none focus:ring-1 focus:ring-amber-200 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="btn-primary w-full mt-2 py-3 px-4 rounded-xl text-sm font-semibold flex items-center justify-center space-x-2 transition disabled:opacity-50"
            >
              {isSubmitting ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center text-xs text-ink-500">
            Don't have an account yet?{' '}
            <Link to="/register" className="text-amber-700 hover:text-amber-800 font-semibold ml-1">
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
