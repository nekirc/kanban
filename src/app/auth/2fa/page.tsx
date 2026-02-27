'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function TwoFactorPage() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [isEnabled, setIsEnabled] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/2fa')
      .then(res => res.json())
      .then(data => {
        if (data.qrCode) setQrCode(data.qrCode);
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
    <div className="min-h-screen flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="neumorphic p-8 w-full max-w-md"
      >
        <h1 className="text-3xl font-bold mb-2 text-center">Two-Factor Authentication</h1>
        <p className="text-center text-sm mb-6 opacity-70">
          {isEnabled
            ? "Enter the 6-digit code from your authenticator app."
            : "Scan the QR code below with your authenticator app to set up 2FA."}
        </p>

        {qrCode && !isEnabled && (
          <div className="mb-6 flex flex-col items-center">
             <div className="p-4 neumorphic-inset rounded-2xl bg-white/50 backdrop-blur-sm mb-4">
                <img src={qrCode} alt="2FA QR Code" className="w-48 h-48" />
             </div>
             <p className="text-[10px] opacity-40 uppercase font-black tracking-widest text-center">
                Scan with Google Authenticator
             </p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <input
              type="text"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              className="w-full p-4 neumorphic-inset bg-transparent outline-none text-center text-2xl tracking-[1em]"
              placeholder="000000"
              maxLength={6}
              required
              autoFocus
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center font-bold">{error}</p>}
          <button
            type="submit"
            disabled={loading || token.length !== 6}
            className="w-full py-3 neumorphic font-bold active:shadow-none transition-shadow disabled:opacity-50"
          >
            {loading ? 'Verifying...' : 'Verify & Continue'}
          </button>
        </form>
      </motion.div>
    </div>
  );
}
