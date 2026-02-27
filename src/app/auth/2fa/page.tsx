'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';

export default function TwoFactorPage() {
  const [token, setToken] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [secret, setSecret] = useState('');
  const router = useRouter();

  useEffect(() => {
    fetch('/api/auth/2fa')
      .then(res => res.json())
      .then(data => {
        if (data.secret) setSecret(data.secret);
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
          Enter the 6-digit code from your authenticator app.
        </p>

        {secret && (
          <div className="mb-6 p-4 neumorphic-inset text-xs break-all text-center">
            <p className="font-bold mb-1">Demo Mode - Your Secret:</p>
            <code>{secret}</code>
            <p className="mt-2 text-gray-500">(Normally this would be a QR code during setup)</p>
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
            />
          </div>
          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
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
