'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Layout, ArrowRight } from 'lucide-react';
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
    <div className="min-h-screen bg-[#e0e5ec] text-[#31344b]">
      <Navbar />

      <main className="max-w-7xl mx-auto px-6 py-8">
        <header className="flex justify-between items-center mb-12">
          <div>
            <h1 className="text-4xl font-black tracking-tight mb-2">My Boards</h1>
            <p className="opacity-60">Manage your high-performance workflows.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="p-4 neumorphic flex items-center gap-2 font-bold hover:scale-105 transition-transform active:scale-95"
          >
            <Plus size={20} />
            <span>Create Board</span>
          </button>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#31344b]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {boards.map((board) => (
              <motion.div
                key={board.id}
                whileHover={{ y: -5 }}
                className="neumorphic p-6 flex flex-col h-48 group relative overflow-hidden"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-3 neumorphic-inset rounded-xl">
                    <Layout size={24} className="opacity-60" />
                  </div>
                  <span className="text-[10px] opacity-40 font-mono">
                    {new Date(board.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h3 className="text-xl font-bold mb-2">{board.title}</h3>
                <p className="text-sm opacity-50 line-clamp-2 mb-4">
                  {board.description || "No description provided."}
                </p>

                <Link
                  href={`/board/${board.id}`}
                  className="mt-auto flex items-center gap-2 text-sm font-black opacity-40 group-hover:opacity-100 transition-opacity"
                >
                  Enter Board <ArrowRight size={14} />
                </Link>
              </motion.div>
            ))}

            {boards.length === 0 && (
              <div className="col-span-full neumorphic-inset p-20 text-center opacity-40">
                <p className="text-xl">No boards found. Create your first board to get started!</p>
              </div>
            )}
          </div>
        )}
      </main>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="neumorphic p-8 w-full max-w-md"
          >
            <h2 className="text-2xl font-bold mb-6">Create New Board</h2>
            <form onSubmit={createBoard} className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-2">Board Title</label>
                <input
                  type="text"
                  value={newBoardTitle}
                  onChange={(e) => setNewBoardTitle(e.target.value)}
                  className="w-full p-3 neumorphic-inset bg-transparent outline-none"
                  placeholder="e.g. ZenFlow Launch"
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="flex-1 py-3 neumorphic font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 neumorphic font-bold text-blue-600"
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
