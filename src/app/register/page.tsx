'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { UserPlus, Sparkles } from 'lucide-react';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/login');
      } else {
        setError(data.error || 'Something went wrong');
      }
    } catch (err) {
      setError('An error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6 transition-colors">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white dark:bg-[#1E222B] p-10 w-full max-w-md rounded-3xl shadow-card border border-gray-100/50 dark:border-white/5"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
            <UserPlus size={24} />
          </div>
          <h1 className="text-3xl font-bold tracking-tight mb-2 text-primary">Join ZenFlow</h1>
          <p className="text-sm font-medium opacity-40">Start your flow-state productivity journey</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest opacity-30 mb-2 ml-1">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-4 bg-[#F6F8FB] dark:bg-[#171A21] border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              placeholder="Elon Musk"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest opacity-30 mb-2 ml-1">Work Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-4 bg-[#F6F8FB] dark:bg-[#171A21] border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              placeholder="elon@spacex.com"
              required
            />
          </div>
          <div>
            <label className="block text-[10px] font-black uppercase tracking-widest opacity-30 mb-2 ml-1">Secure Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-4 bg-[#F6F8FB] dark:bg-[#171A21] border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all font-medium"
              placeholder="••••••••"
              required
            />
          </div>
          {error && (
            <p className="text-red-500 text-xs font-bold text-center bg-red-50 dark:bg-red-900/10 py-3 rounded-xl border border-red-100 dark:border-red-900/20">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-medium hover:bg-primary-hover transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {loading ? 'Creating Account...' : 'Get Started'}
            {!loading && <Sparkles size={18} />}
          </button>
        </form>

        <p className="mt-10 text-center text-[10px] font-black opacity-30 uppercase tracking-widest">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Log In
          </Link>
        </p>
      </motion.div>
    </div>
  );
}
