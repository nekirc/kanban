'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Plus, Layout, ArrowRight, MoreVertical, Edit2, Trash2 } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { useSearchParams } from 'next/navigation';

interface Board {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
}

function DashboardContent() {
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState('');

  const [editingBoard, setEditingBoard] = useState<Board | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q')?.toLowerCase() || '';

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

  const deleteBoard = async (id: string) => {
      if (!confirm('Are you sure you want to delete this workspace?')) return;
      const res = await fetch(`/api/boards/${id}`, { method: 'DELETE' });
      if (res.ok) fetchBoards();
  };

  const updateBoard = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!editingBoard) return;
      const res = await fetch(`/api/boards/${editingBoard.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title: editTitle })
      });
      if (res.ok) {
          setEditingBoard(null);
          fetchBoards();
      }
  };

  const filteredBoards = boards.filter(b => b.title.toLowerCase().includes(searchQuery));

  return (
    <div className="min-h-screen bg-background transition-colors">
      <Navbar />

      <main className="max-w-7xl mx-auto px-8 py-12">
        <header className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-2xl font-bold tracking-tight mb-2 text-foreground">My Workspaces</h1>
            <p className="text-sm opacity-50 font-medium tracking-tight text-foreground">Access your high-performance Kanban boards.</p>
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
            {filteredBoards.map((board) => (
              <motion.div
                key={board.id}
                whileHover={{ y: -4, boxShadow: 'var(--shadow-card)' }}
                className="bg-surface-card p-6 rounded-column flex flex-col h-48 group relative shadow-soft border border-gray-100/50 dark:border-white/5 transition-all"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="p-2.5 bg-[#F6F8FB] dark:bg-[#171A21] rounded-xl text-primary">
                    <Layout size={20} />
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => {
                            setEditingBoard(board);
                            setEditTitle(board.title);
                        }}
                        className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded-lg text-primary transition-colors"
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => deleteBoard(board.id)}
                        className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-lg text-red-500 transition-colors"
                      >
                        <Trash2 size={14} />
                      </button>
                  </div>
                </div>
                <h3 className="text-lg font-bold mb-1 tracking-tight text-foreground">{board.title}</h3>
                <p className="text-[11px] opacity-40 font-medium line-clamp-2 mb-4 text-foreground">
                  {board.description || "Updated 2 hours ago • Agile Workflow"}
                </p>

                <Link
                  href={`/board/${board.id}`}
                  className="mt-auto flex items-center gap-1.5 text-xs font-bold text-primary opacity-60 group-hover:opacity-100 transition-all transform translate-y-0"
                >
                  Enter Workspace <ArrowRight size={12} />
                </Link>
              </motion.div>
            ))}

            {filteredBoards.length === 0 && (
              <div className="col-span-full py-20 flex flex-col items-center justify-center opacity-30 text-foreground">
                <Layout size={48} className="mb-4" />
                <p className="text-lg font-bold">No workspaces found</p>
                <p className="text-sm font-medium">Try a different search query or create a new board.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {(showCreateModal || editingBoard) && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white dark:bg-[#1E222B] p-8 w-full max-w-md rounded-2xl shadow-card"
          >
            <h2 className="text-xl font-bold mb-6 tracking-tight text-foreground">
                {editingBoard ? 'Edit Workspace' : 'Create New Board'}
            </h2>
            <form onSubmit={editingBoard ? updateBoard : createBoard} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider opacity-40 mb-2 text-foreground">Board Title</label>
                <input
                  type="text"
                  value={editingBoard ? editTitle : newBoardTitle}
                  onChange={(e) => editingBoard ? setEditTitle(e.target.value) : setNewBoardTitle(e.target.value)}
                  className="w-full p-3 bg-[#F6F8FB] dark:bg-[#171A21] border-none rounded-xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm text-foreground font-medium"
                  placeholder="e.g. ZenFlow Launch"
                  required
                  autoFocus
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => {
                      setShowCreateModal(false);
                      setEditingBoard(null);
                  }}
                  className="flex-1 py-3 text-sm font-bold opacity-50 hover:opacity-100 transition-opacity text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-3 bg-primary text-white rounded-xl text-sm font-bold shadow-soft hover:bg-primary-hover transition-all active:scale-95"
                >
                  {editingBoard ? 'Save Changes' : 'Create'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DashboardContent />
        </Suspense>
    );
}
