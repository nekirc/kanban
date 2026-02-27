'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Board } from '@/components/kanban/Board';
import Navbar from '@/components/layout/Navbar';
import { ChevronLeft, Settings, Users, Share2 } from 'lucide-react';
import Link from 'next/link';
import { motion } from 'framer-motion';

export default function BoardPage() {
  const { id } = useParams();
  const [board, setBoard] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    if (id) {
      fetch(`/api/boards/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error('Board not found');
          return res.json();
        })
        .then((data) => {
          setBoard(data);
          setLoading(false);
        })
        .catch(() => {
          router.push('/dashboard');
        });
    }
  }, [id, router]);

  if (loading) return (
    <div className="min-h-screen bg-[#e0e5ec] flex items-center justify-center">
      <div className="animate-pulse neumorphic p-8 rounded-full">
        <div className="w-12 h-12 rounded-full border-4 border-[#31344b] border-t-transparent animate-spin"></div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-[#e0e5ec] flex flex-col overflow-hidden">
      <Navbar />

      <main className="flex-1 flex flex-col px-8 overflow-hidden">
        <header className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="p-2 neumorphic rounded-full hover:scale-110 transition-transform active:scale-90">
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tight">{board.title}</h1>
              <div className="flex items-center gap-4 mt-1 opacity-40 text-xs font-bold uppercase tracking-widest">
                <span>Personal Workspace</span>
                <span>•</span>
                <span>{board.columns.length} Columns</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button className="p-3 neumorphic rounded-xl flex items-center gap-2 text-xs font-bold hover:scale-105 transition-transform active:scale-95">
                <Users size={16} />
                <span>Invite</span>
             </button>
             <button className="p-3 neumorphic rounded-xl flex items-center gap-2 text-xs font-bold hover:scale-105 transition-transform active:scale-95">
                <Share2 size={16} />
                <span>Share</span>
             </button>
             <button className="p-3 neumorphic rounded-xl hover:scale-105 transition-transform active:scale-95">
                <Settings size={16} />
             </button>
          </div>
        </header>

        <Board initialData={board.columns} />
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          height: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #e0e5ec;
          box-shadow: inset 2px 2px 5px #bebebe, inset -2px -2px 5px #ffffff;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e0e5ec;
          box-shadow: 2px 2px 5px #bebebe, -2px -2px 5px #ffffff;
          border-radius: 10px;
        }
      `}</style>
    </div>
  );
}
