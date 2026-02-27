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
    <div className="min-h-screen bg-[#1A1C21] flex items-center justify-center">
      <div className="animate-pulse p-8 rounded-full">
        <div className="w-12 h-12 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
      </div>
    </div>
  );

  return (
    <div className="h-screen bg-[#1A1C21] flex flex-col overflow-hidden text-white">
      <Navbar />

      <main className="flex-1 flex flex-col px-8 overflow-hidden">
        <header className="flex justify-between items-center py-8">
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="p-2 bg-white/5 hover:bg-white/10 rounded-full transition-all">
              <ChevronLeft size={20} />
            </Link>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-white">{board.title}</h1>
              <div className="flex items-center gap-4 mt-1 opacity-40 text-xs font-bold uppercase tracking-widest text-white">
                <span>Personal Workspace</span>
                <span>•</span>
                <span>{board.columns.length} Columns</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
             <button className="p-3 bg-white/5 rounded-xl flex items-center gap-2 text-xs font-bold hover:bg-white/10 transition-all text-white">
                <Users size={16} />
                <span>Invite</span>
             </button>
             <button className="p-3 bg-white/5 rounded-xl flex items-center gap-2 text-xs font-bold hover:bg-white/10 transition-all text-white">
                <Share2 size={16} />
                <span>Share</span>
             </button>
             <button className="p-3 bg-white/5 rounded-xl hover:bg-white/10 transition-all text-white">
                <Settings size={16} />
             </button>
          </div>
        </header>

        <Board initialData={board.columns} />
      </main>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
          height: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.2);
        }
      `}</style>
    </div>
  );
}
