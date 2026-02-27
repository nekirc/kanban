'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Layout, ArrowRight, MoreVertical } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';

interface Board {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
}

export default function Dashboard() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');

  useEffect(() => {
    fetchBoards();
  }, []);

  const fetchBoards = async () => {
    try {
      const res = await fetch('/api/boards');
      if (res.ok) {
        const data = await res.json();
        setBoards(data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const createBoard = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newBoardTitle }),
      });
      if (res.ok) {
        setNewBoardTitle('');
        setShowCreateModal(false);
        fetchBoards();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 py-12">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-2">My Workspaces</h1>
            <p className="text-sm opacity-50 font-medium tracking-tight">Access your high-performance Kanban boards.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-10 px-5 bg-primary hover:bg-primary-hover text-white rounded-full flex items-center gap-2 text-sm font-bold shadow-soft transition-all active:scale-95"
          >
            <Plus size={16} />
            <span>Create Board</span>
          </button>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {boards.map((board) => (
              <motion.div
                key={board.id}
                whileHover={{ y: -4, boxShadow: 'var(--shadow-card)' }}
                className="bg-surface-card p-6 rounded-column flex flex-col h-48 group relative shadow-soft border border-gray-100/50 dark:border-white/5 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 bg-[#F6F8FB] dark:bg-[#171A21] rounded-xl text-primary">
                    <Layout size={20} />
                  </div>
                  <button className="opacity-20 hover:opacity-100 transition-opacity">
                    <MoreVertical size={16} />
                  </button>
                </div>
                <h3 className="text-lg font-bold mb-1 tracking-tight">{board.title}</h3>
                <p className="text-xs opacity-40 font-medium line-clamp-2 mb-4">
                  {board.description || "Updated 2 hours ago • Agile Workflow"}
                </p>

                <Link
                  href={`/board/${board.id}`}
                  className="mt-auto flex items-center gap-1.5 text-xs font-bold text-primary opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0"
                >
                  Enter Workspace <ArrowRight size={12} />
                </Link>
              </motion.div>
            ))}

            {boards.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-30">
                <Layout size={48} className="mb-4" />
                <p className="text-lg font-bold">No boards found</p>
                <p className="text-sm font-medium">Create your first board to get started!</p>
              </div>
            )}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-[#1E222B] p-8 w-full max-w-md rounded-2xl shadow-card"
          >
            <h2 className="text-xl font-bold mb-6 tracking-tight">Create New Board</h2>
            <form onSubmit={createBoard} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider opacity-40 mb-2">Board Title</label>
                <input
                  type="text"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  className="w-full p-3 bg-[#F6F8FB] dark:bg-[#171A21] border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm"
                  placeholder="e.g. ZenFlow Launch"
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 text-sm font-bold opacity-50 hover:opacity-100 transition-opacity"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-soft hover:bg-primary-hover transition-all active:scale-95"
                >
                  Create
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
