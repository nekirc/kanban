'use client';

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Lock, CheckCircle2 } from 'lucide-react';
import { Suspense } from 'react';

function ResetPasswordContent() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get('token');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => router.push('/login'), 3000);
      } else {
        const data = await res.json();
        setError(data.error || 'Failed to reset password');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  if (!token) return <div className="text-center p-20">Invalid Reset Link</div>;

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1E222B] p-10 w-full max-w-md rounded-3xl shadow-card border border-gray-100/50 dark:border-white/5"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
            <Lock size={24} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Set New Password</h1>
          <p className="text-sm font-medium opacity-40 text-foreground">Please enter your new secure password.</p>
        </div>

        {success ? (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
                <CheckCircle2 size={48} className="text-green-500" />
            </div>
            <p className="text-sm font-medium text-foreground">
                Password reset successfully! Redirecting to login...
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest opacity-30 mb-2 ml-1 text-foreground">New Password</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-4 bg-[#F6F8FB] dark:bg-[#171A21] border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-foreground"
                placeholder="••••••••"
                required
              />
            </div>
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest opacity-30 mb-2 ml-1 text-foreground">Confirm Password</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-4 bg-[#F6F8FB] dark:bg-[#171A21] border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-foreground"
                placeholder="••••••••"
                required
              />
            </div>
            {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-medium hover:bg-primary-hover transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? 'Updating...' : 'Reset Password'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ResetPasswordContent />
        </Suspense>
    );
}
