import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff, Loader2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-hot-toast';
import { MotherflameLogo } from '../components/MotherflameLogo';

export const Login: React.FC = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Retrieve redirect path from location state, defaulting to Home '/'
  const from = (location.state as any)?.from?.pathname || '/';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error('Please fill in all fields');
    }

    setLoading(true);
    try {
      await login(email, password);
      toast.success('Logged in successfully!');
      navigate(from, { replace: true });
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || 'Failed to login. Please check your credentials.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="bg-white p-8 rounded-2xl border border-slate-200 shadow-xl w-full max-w-md space-y-6 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col items-center text-center space-y-2">
          <MotherflameLogo size={64} className="mb-2" />
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">
            Welcome back
          </h2>
          <p className="text-slate-500 text-sm">
            Sign in to access your orders and account.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail size={16} />
              </span>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="name@example.com"
                required
                className="w-full pl-9 pr-4 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white rounded-xl text-sm transition-colors outline-hidden"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1.5">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock size={16} />
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full pl-9 pr-10 py-2.5 bg-slate-50 border border-slate-200 hover:border-slate-300 focus:border-blue-600 focus:ring-1 focus:ring-blue-600 focus:bg-white rounded-xl text-sm transition-colors outline-hidden"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-blue-600"
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-blue-100/50 flex items-center justify-center gap-2"
          >
            {loading ? (
              <Loader2 className="animate-spin" size={18} />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <hr className="border-slate-100" />

        {/* Footer */}
        <p className="text-center text-sm text-slate-500">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="font-bold text-blue-600 hover:underline"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};
