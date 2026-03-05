'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';
import { Search, Bell, User, Sun, Moon, Zap } from 'lucide-react';
import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function NavbarContent() {
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [search, setSearch] = useState(searchParams.get('q') || '');
  const [theme, setTheme] = useState<'light' | 'dark' | 'oled'>('light');

  useEffect(() => {
    const savedTheme = localStorage.getItem('zenflow-theme') as any;
    if (savedTheme) {
        setTheme(savedTheme);
        document.documentElement.setAttribute('data-theme', savedTheme);
        if (savedTheme === 'dark' || savedTheme === 'oled') {
            document.documentElement.classList.add('dark');
        } else {
            document.documentElement.classList.remove('dark');
        }
    }
  }, []);

  const toggleTheme = () => {
    const themes: ('light' | 'dark' | 'oled')[] = ['light', 'dark', 'oled'];
    const nextTheme = themes[(themes.indexOf(theme) + 1) % themes.length];
    setTheme(nextTheme);
    localStorage.setItem('zenflow-theme', nextTheme);
    document.documentElement.setAttribute('data-theme', nextTheme);
    if (nextTheme === 'dark' || nextTheme === 'oled') {
        document.documentElement.classList.add('dark');
    } else {
        document.documentElement.classList.remove('dark');
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (search) {
        params.set('q', search);
      } else {
        params.delete('q');
      }
      router.push(`?${params.toString()}`);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, router, searchParams]);

  return (
    <nav className="h-16 flex items-center justify-between px-6 bg-white dark:bg-[#171A21] oled:bg-black shadow-soft sticky top-0 z-40 transition-colors">
      <div className="flex items-center gap-8">
        <Link href="/dashboard" className="text-xl font-bold tracking-tight text-primary">
          ZenFlow
        </Link>
        <div className="hidden md:flex items-center gap-6 text-sm font-medium opacity-60">
          <Link href="/dashboard" className="hover:opacity-100 transition-opacity">Workspaces</Link>
          <Link href="/dashboard" className="hover:opacity-100 transition-opacity">Projects</Link>
        </div>
      </div>

      <div className="flex-1 max-w-md mx-4 sm:mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={16} />
          <input
            type="text"
            placeholder="Search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#F1F3F6] dark:bg-[#1E222B] oled:bg-[#0A0A0A] border-none rounded-full py-2 pl-10 pr-4 text-[11px] focus:ring-2 focus:ring-primary/20 outline-none transition-all text-foreground"
          />
        </div>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button
            onClick={toggleTheme}
            className="p-2 opacity-60 hover:opacity-100 hover:bg-[#F1F3F6] dark:hover:bg-[#1E222B] oled:hover:bg-white/5 rounded-full transition-all text-foreground"
        >
          {theme === 'light' && <Sun size={18} />}
          {theme === 'dark' && <Moon size={18} />}
          {theme === 'oled' && <Zap size={18} className="text-yellow-500" />}
        </button>
        <button className="p-2 opacity-60 hover:opacity-100 hover:bg-[#F1F3F6] dark:hover:bg-[#1E222B] oled:hover:bg-white/5 rounded-full transition-all text-foreground hidden xs:block">
          <Bell size={18} />
        </button>
        <div className="flex items-center gap-2 sm:gap-3 pl-1 sm:pl-2 border-l border-gray-100 dark:border-gray-800">
          <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-[10px] sm:text-xs">
            {session?.user?.name ? session.user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : <User size={14} />}
          </div>
          <button
            onClick={() => signOut({ callbackUrl: '/login' })}
            className="text-[10px] sm:text-xs font-bold text-primary hover:underline hidden sm:block"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}

export default function Navbar() {
    return (
        <Suspense fallback={<div className="h-16 bg-white dark:bg-[#171A21]" />}>
            <NavbarContent />
        </Suspense>
    );
}
