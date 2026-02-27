'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { ArrowRight, Shield, Zap, Layout } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-8 overflow-hidden font-sans">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center max-w-4xl"
      >
        <div className="mb-10 inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-[#1E222B] shadow-soft rounded-full">
           <div className="w-2 h-2 rounded-full bg-primary animate-pulse" />
           <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-60">Version 1.0 Live</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 bg-gradient-to-br from-foreground to-foreground/60 bg-clip-text text-transparent">
          ZenFlow
        </h1>

        <p className="text-xl md:text-2xl font-medium mb-12 opacity-40 leading-relaxed max-w-2xl mx-auto">
          The premium Kanban engine for high-performance teams. Experience deep work with refined elegance.
        </p>

        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Link href="/login">
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-10 py-4 bg-primary text-white font-bold text-lg rounded-full shadow-medium flex items-center gap-2 group"
            >
              Get Started <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </motion.div>
          </Link>
          <Link href="/register">
             <div className="text-sm font-bold opacity-30 hover:opacity-100 transition-opacity uppercase tracking-widest">
                Create account
             </div>
          </Link>
        </div>
      </motion.div>

      <div className="mt-32 grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl w-full">
        <div className="bg-white dark:bg-[#1E222B] p-8 rounded-2xl shadow-soft border border-gray-100/50 dark:border-white/5">
          <div className="w-10 h-10 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl flex items-center justify-center text-indigo-600 mb-6">
            <Shield size={20} />
          </div>
          <h3 className="font-bold text-lg mb-2">Enterprise Security</h3>
          <p className="text-sm opacity-40 font-medium leading-relaxed">Mandatory TOTP 2FA and AES-256 encryption at rest protecting your team's IP.</p>
        </div>
        <div className="bg-white dark:bg-[#1E222B] p-8 rounded-2xl shadow-soft border border-gray-100/50 dark:border-white/5">
          <div className="w-10 h-10 bg-teal-50 dark:bg-teal-900/20 rounded-xl flex items-center justify-center text-teal-600 mb-6">
            <Zap size={20} />
          </div>
          <h3 className="font-bold text-lg mb-2">Instant Interaction</h3>
          <p className="text-sm opacity-40 font-medium leading-relaxed">Zero-lag drag and drop powered by dnd-kit. Optimized for large boards with 500+ cards.</p>
        </div>
        <div className="bg-white dark:bg-[#1E222B] p-8 rounded-2xl shadow-soft border border-gray-100/50 dark:border-white/5">
          <div className="w-10 h-10 bg-purple-50 dark:bg-purple-900/20 rounded-xl flex items-center justify-center text-purple-600 mb-6">
            <Layout size={20} />
          </div>
          <h3 className="font-bold text-lg mb-2">Refined UI</h3>
          <p className="text-sm opacity-40 font-medium leading-relaxed">Minimalist workspace designed to reduce cognitive load and facilitate flow-state productivity.</p>
        </div>
      </div>
    </div>
  );
}
