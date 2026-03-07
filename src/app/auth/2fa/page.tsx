'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ShieldCheck, Smartphone } from 'lucide-react';

export default function TwoFactorPage() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/2fa')
      .then(res => res.json())
      .then(data => {
        if (data.qrCode) setQrCode(data.qrCode);
        if (data.secret) setSecret(data.secret);
        if (data.isEnabled) setIsEnabled(true);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/2fa', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await res.json();

      if (res.ok) {
        router.push('/dashboard');
      } else {
        setError(data.error || 'Invalid code');
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
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white dark:bg-[#1E222B] p-10 w-full max-w-md rounded-3xl shadow-card border border-gray-100/50 dark:border-white/5"
      >
        <div className="flex flex-col items-center text-center mb-10">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6">
            <ShieldCheck size={24} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight mb-2">Secure Verification</h1>
          <p className="text-sm font-medium opacity-40 px-6">
            {isEnabled
              ? "Enter the 6-digit code from your authenticator app."
              : "Scan the QR code below to link your account."}
          </p>
        </div>

        {qrCode && !isEnabled && (
          <div className="mb-10 flex flex-col items-center">
             <div className="p-4 bg-[#F6F8FB] dark:bg-[#171A21] rounded-3xl mb-4 border border-gray-100 dark:border-white/5">
                <img src={qrCode} alt="2FA QR Code" className="w-40 h-40 mix-blend-multiply dark:mix-blend-normal opacity-80" />
             </div>

             {secret && (
               <div className="mb-6 w-full px-8">
                  <p className="text-[10px] font-black opacity-30 uppercase tracking-widest text-center mb-2">Can't scan? Use code:</p>
                  <div className="p-3 bg-[#F6F8FB] dark:bg-[#171A21] rounded-xl border border-gray-100 dark:border-white/5 text-center font-mono text-xs font-bold tracking-widest select-all">
                    {secret.match(/.{1,4}/g)?.join(' ') || secret}
                  </div>
               </div>
             )}

             <div className="flex items-center gap-2 text-[10px] font-black opacity-30 uppercase tracking-[0.2em]">
                <Smartphone size={12} />
                <span>Google Authenticator</span>
             </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="flex justify-center">
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full p-5 bg-[#F6F8FB] dark:bg-[#171A21] border-none rounded-2xl outline-none text-center text-3xl font-black tracking-[0.5em] focus:ring-4 focus:ring-primary/10 transition-all"
              placeholder="000000"
              maxLength={6}
              required
              autoFocus
            />
          </div>
          {error && (
            <p className="text-red-500 text-xs font-bold text-center bg-red-50 dark:bg-red-900/10 py-3 rounded-xl border border-red-100 dark:border-red-900/20">{error}</p>
          )}
          <button
            type="submit"
            disabled={loading || token.length !== 6}
            className="w-full py-4 bg-primary text-white rounded-2xl font-bold shadow-medium hover:bg-primary-hover transition-all active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Authenticate'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
