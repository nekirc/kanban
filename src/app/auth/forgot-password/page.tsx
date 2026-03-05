'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { KeyRound, Mail, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        setError('Failed to send reset email');
      }
    } catch (err) {
      setError('An error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1E222B] p-10 w-full max-w-md rounded-3xl shadow-card border border-gray-100/50 dark:border-white/5"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
            <KeyRound size={24} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-foreground">Forgot Password?</h1>
          <p className="text-sm font-medium opacity-40 text-foreground">No worries, we'll send you reset instructions.</p>
        </div>

        {success ? (
          <div className="text-center space-y-6">
            <div className="flex justify-center">
                <CheckCircle2 size={48} className="text-green-500" />
            </div>
            <p className="text-sm font-medium text-foreground">
                If an account exists for {email}, you will receive a password reset link shortly.
            </p>
            <Link href="/login" className="flex items-center justify-center gap-2 text-primary font-bold hover:underline">
                <ArrowLeft size={16} /> Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-[10px] font-black uppercase tracking-widest opacity-30 mb-2 ml-1 text-foreground">Work Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 opacity-30" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-4 pl-12 bg-[#F6F8FB] dark:bg-[#171A21] border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium text-foreground"
                  placeholder="elon@spacex.com"
                  required
                />
              </div>
            </div>
            {error && <p className="text-red-500 text-xs font-bold text-center">{error}</p>}
            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-medium hover:bg-primary-hover transition-all active:scale-[0.98] flex items-center justify-center gap-2"
            >
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
            <Link href="/login" className="flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest opacity-40 hover:opacity-100 transition-opacity text-foreground">
                <ArrowLeft size={14} /> Back to Login
            </Link>
          </form>
        )}
      </motion.div>
    </div>
  );
}
