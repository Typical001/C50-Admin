import React, { useState } from 'react';
import { supabase } from '../lib/supabaseClient';
import { ShieldAlert, KeyRound, Mail, Sparkles } from 'lucide-react';

interface LoginProps {
  onLoginSuccess: (user: any) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (authError) throw authError;
      if (!data.user) throw new Error('No user data returned');

      // Verify if user is admin
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        throw new Error('Failed to retrieve profile record.');
      }

      if (profile?.role !== 'admin') {
        await supabase.auth.signOut();
        throw new Error('Access denied. Administrator credentials required.');
      }

      onLoginSuccess(data.user);
    } catch (err: any) {
      console.error('Login error:', err);
      setError(err.message || 'Incorrect email/password or unauthorized access.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4">
      <div className="max-w-md w-full bg-white rounded-3xl border border-gray-100 shadow-xl shadow-gray-100/40 p-8 relative overflow-hidden">
        {/* Decorative subtle background gradient */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="text-center mb-8 relative">
          <div className="inline-flex p-3 bg-indigo-50 rounded-2xl text-indigo-600 mb-4 animate-pulse">
            <Sparkles className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-extrabold text-gray-900 tracking-tight">C50 Academy Admin</h2>
          <p className="text-gray-400 text-sm mt-1">Authenticate to manage batches and homepage content</p>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 text-xs rounded-2xl flex items-start gap-2.5">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Email Address</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50/50 focus:bg-white border border-gray-100 focus:border-indigo-500 rounded-2xl text-sm focus:outline-none transition-all"
                placeholder="admin@carrier50.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-500 mb-1.5 uppercase tracking-wider">Password</label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 flex items-center pl-3.5 text-gray-400">
                <KeyRound className="w-4 h-4" />
              </span>
              <input
                type="password"
                required
                className="w-full pl-10 pr-4 py-3 bg-gray-50/50 focus:bg-white border border-gray-100 focus:border-indigo-500 rounded-2xl text-sm focus:outline-none transition-all"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 py-3.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 disabled:bg-indigo-400 text-white font-semibold rounded-2xl text-sm shadow-lg shadow-indigo-600/20 active:shadow-none transition-all cursor-pointer"
          >
            {loading ? 'Signing in...' : 'Sign In as Admin'}
          </button>
        </form>

        <div className="mt-8 text-center border-t border-gray-50 pt-6">
          <p className="text-gray-400 text-xs">
            Demo credentials: <code className="bg-gray-50 px-1.5 py-0.5 rounded font-mono text-gray-600">admin@carrier50.com</code> / <code className="bg-gray-50 px-1.5 py-0.5 rounded font-mono text-gray-600">admin123</code>
          </p>
        </div>
      </div>
    </div>
  );
}
