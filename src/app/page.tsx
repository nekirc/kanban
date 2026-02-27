'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#e0e5ec] text-[#31344b] flex flex-col items-center justify-center p-6 overflow-hidden">
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8 }}
        className="text-center"
      >
        <div className="mb-8 inline-block p-6 neumorphic rounded-3xl">
          <h1 className="text-6xl font-black tracking-tighter mb-2">ZenFlow</h1>
          <p className="text-xs font-bold uppercase tracking-[0.4em] opacity-40 text-center">Flow-State Productivity</p>
        </div>

        <h2 className="text-2xl md:text-4xl font-bold mb-12 max-w-2xl mx-auto leading-tight">
          Experience the most elegant and secure Kanban application for high-performance teams.
        </h2>

        <div className="flex flex-col md:flex-row gap-8 justify-center items-center">
          <Link href="/login">
            <motion.div
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-10 py-5 neumorphic font-black text-xl tracking-tight"
            >
              Get Started
            </motion.div>
          </Link>
          <Link href="/register">
             <div className="opacity-40 font-bold hover:opacity-100 transition-opacity">
                Create an account
             </div>
          </Link>
        </div>
      </motion.div>

      <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-12 max-w-5xl">
        <div className="neumorphic-inset p-8 text-center">
          <h3 className="font-bold mb-2">Enterprise Security</h3>
          <p className="text-sm opacity-50">Mandatory 2FA and AES-256 encryption for your IP.</p>
        </div>
        <div className="neumorphic-inset p-8 text-center">
          <h3 className="font-bold mb-2">Glassmorphic UI</h3>
          <p className="text-sm opacity-50">Beautiful, distraction-free interface for deep work.</p>
        </div>
        <div className="neumorphic-inset p-8 text-center">
          <h3 className="font-bold mb-2">Real-time Flow</h3>
          <p className="text-sm opacity-50">Seamless drag-and-drop with micro-animations.</p>
        </div>
      </div>
    </div>
  );
}
