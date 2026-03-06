'use client';

import { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Layout, ArrowRight, MoreVertical, Edit2, Trash2, Folder, Briefcase, ListTodo } from 'lucide-react';
import Navbar from '@/components/layout/Navbar';
import { useSearchParams } from 'next/navigation';

interface Board {
  id: string;
  title: string;
  description: string | null;
  createdAt: string;
  _count: {
    columns: number;
  };
  taskCount?: number;
}

function ProjectsContent() {
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

        // Fetch task counts for each board
        const boardsWithTasks = await Promise.all(data.map(async (board: any) => {
            const boardRes = await fetch(`/api/boards/${board.id}`);
            if (boardRes.ok) {
                const boardData = await boardRes.json();
                const taskCount = boardData.columns.reduce((acc: number, col: any) => acc + col.tasks.length, 0);
                return { ...board, taskCount };
            }
            return { ...board, taskCount: 0 };
        }));

        setBoards(boardsWithTasks);
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
      if (!confirm('Are you sure you want to delete this project?')) return;
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
        <header className="flex justify-between items-end mb-12 border-b border-white/5 pb-8">
          <div>
            <h1 className="text-3xl font-black tracking-tight mb-2 text-foreground flex items-center gap-3">
               <Briefcase className="text-primary" size={32} />
               Projects
            </h1>
            <p className="text-sm opacity-50 font-medium tracking-tight text-foreground">Manage and monitor all your enterprise projects.</p>
          </div>
          <button
            onClick={() => setShowCreateModal(true)}
            className="h-12 px-6 bg-primary hover:bg-primary-hover text-white rounded-2xl flex items-center gap-2 text-sm font-bold shadow-soft transition-all active:scale-95"
          >
            <Plus size={18} />
            <span>New Project</span>
          </button>
        </header>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4">
            <div className="grid grid-cols-12 px-6 py-4 text-[10px] font-black uppercase tracking-widest opacity-30">
                <div className="col-span-6">Project Name</div>
                <div className="col-span-2 text-center">Tasks</div>
                <div className="col-span-2 text-center">Created</div>
                <div className="col-span-2 text-right">Actions</div>
            </div>

            {filteredBoards.map((board) => (
              <motion.div
                key={board.id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-surface-card p-6 rounded-2xl flex items-center grid grid-cols-12 group shadow-soft border border-gray-100/50 dark:border-white/5 transition-all hover:border-primary/20"
              >
                <div className="col-span-6 flex items-center gap-4">
                  <div className="p-3 bg-primary/10 rounded-xl text-primary">
                    <Folder size={20} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold tracking-tight text-foreground">{board.title}</h3>
                    <p className="text-[10px] opacity-40 font-medium uppercase tracking-widest">Enterprise Workflow</p>
                  </div>
                </div>

                <div className="col-span-2 flex flex-col items-center">
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-white/5 rounded-full border border-white/5">
                        <ListTodo size={12} className="text-primary" />
                        <span className="text-xs font-bold">{board.taskCount || 0}</span>
                    </div>
                </div>

                <div className="col-span-2 text-center text-xs font-medium opacity-40">
                    {new Date(board.createdAt).toLocaleDateString()}
                </div>

                <div className="col-span-2 flex items-center justify-end gap-2">
                    <button
                        onClick={() => {
                            setEditingBoard(board);
                            setEditTitle(board.title);
                        }}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-white/10 rounded-xl text-primary transition-colors"
                    >
                        <Edit2 size={16} />
                    </button>
                    <button
                        onClick={() => deleteBoard(board.id)}
                        className="p-2 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl text-red-500 transition-colors"
                    >
                        <Trash2 size={16} />
                    </button>
                    <Link
                        href={`/board/${board.id}`}
                        className="p-2 bg-primary/10 hover:bg-primary text-primary hover:text-white rounded-xl transition-all"
                    >
                        <ArrowRight size={16} />
                    </Link>
                </div>
              </motion.div>
            ))}

            {filteredBoards.length === 0 && (
              <div className="py-20 flex flex-col items-center justify-center opacity-30 text-foreground">
                <Folder size={64} className="mb-4" />
                <p className="text-xl font-bold">No projects found</p>
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
            className="bg-white dark:bg-[#1E222B] p-8 w-full max-w-md rounded-3xl shadow-card"
          >
            <h2 className="text-xl font-bold mb-6 tracking-tight text-foreground">
                {editingBoard ? 'Edit Project' : 'Launch New Project'}
            </h2>
            <form onSubmit={editingBoard ? updateBoard : createBoard} className="space-y-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider opacity-40 mb-2 text-foreground">Project Title</label>
                <input
                  type="text"
                  value={editingBoard ? editTitle : newBoardTitle}
                  onChange={(e) => editingBoard ? setEditTitle(e.target.value) : setNewBoardTitle(e.target.value)}
                  className="w-full p-4 bg-[#F6F8FB] dark:bg-[#171A21] border-none rounded-2xl outline-none focus:ring-2 focus:ring-primary/20 transition-all text-sm text-foreground font-medium"
                  placeholder="e.g. ZenFlow Redesign"
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
                  className="flex-1 py-4 text-sm font-bold opacity-50 hover:opacity-100 transition-opacity text-foreground"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-4 bg-primary text-white rounded-2xl text-sm font-bold shadow-soft hover:bg-primary-hover transition-all active:scale-95"
                >
                  {editingBoard ? 'Save Changes' : 'Create Project'}
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}

export default function ProjectsPage() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <ProjectsContent />
        </Suspense>
    );
}
