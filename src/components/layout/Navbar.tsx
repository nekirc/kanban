'use client';

import { signOut, useSession } from 'next-auth/react';
import Link from 'next/link';

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="p-4 flex justify-between items-center neumorphic mb-8 mx-4 mt-4">
      <Link href="/dashboard" className="text-2xl font-bold tracking-tighter">
        ZenFlow
      </Link>
      <div className="flex items-center gap-4">
        <span className="text-sm opacity-70 hidden sm:inline">{session?.user?.email}</span>
        <button
          onClick={() => signOut({ callbackUrl: '/login' })}
          className="px-4 py-2 neumorphic text-sm font-bold active:shadow-none"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
