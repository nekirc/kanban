'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { Search, Bell, User } from 'lucide-react';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="h-16 flex items-center justify-between px-6 bg-white dark:bg-[#171A21] shadow-soft sticky top-0 z-40 transition-colors">
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight text-primary">
          ZenFlow
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium opacity-60">
          <Link href="/dashboard" className="hover:opacity-100 transition-opacity">Workspaces</Link>
          <Link href="/dashboard" className="hover:opacity-100 transition-opacity">Projects</Link>
          <Link href="/dashboard" className="hover:opacity-100 transition-opacity">Teams</Link>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-8 hidden sm:block">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={16} />
          <input
            type="text"
            placeholder="Search tasks, boards..."
            className="w-full bg-[#F1F3F6] dark:bg-[#1E222B] border-none rounded-full py-2 pl-10 pr-4 text-xs focus:ring-2 focus:ring-primary/20 outline-none transition-all"
          />
        </div>
      </div>

      <div className="flex items-center gap-4">
        <button className="p-2 opacity-60 hover:opacity-100 hover:bg-[#F1F3F6] dark:hover:bg-[#1E222B] rounded-full transition-all">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-3 pl-2 border-l border-gray-100 dark:border-gray-800">
          <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
            {session?.user?.name?.[0] || <User size={14} />}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-xs font-bold text-primary hover:underline"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
