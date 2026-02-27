'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Type, AlignLeft, BarChart2, Tag as TagIcon, Check } from 'lucide-react';

interface TaskModalProps {
  task: any;
  onClose: () => void;
  onUpdate: (id: string, data: any) => void;
}

export function TaskModal({ task, onClose, onUpdate }: TaskModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || '');
  const [priority, setPriority] = useState(task.priority);

  const priorities = ['LOW', 'MEDIUM', 'HIGH', 'URGENT'];

  const handleSave = () => {
    onUpdate(task.id, { title, description, priority });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        className="bg-white dark:bg-[#1E222B] w-full max-w-2xl rounded-3xl shadow-card overflow-hidden text-foreground"
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2 text-[10px] font-black opacity-30 tracking-[0.2em] uppercase">
            <Type size={14} />
            <span>Task Details</span>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-all">
            <X size={20} />
          </button>
        </div>

        <div className="p-8 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
          {/* Title */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest opacity-30 mb-3 ml-1">Task Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-[#F6F8FB] dark:bg-[#171A21] border-none rounded-2xl p-4 text-xl font-bold outline-none focus:ring-2 focus:ring-primary/20 transition-all"
              placeholder="What needs to be done?"
            />
          </div>

          {/* Criticality / Priority */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest opacity-30 mb-3 ml-1 flex items-center gap-2">
                <BarChart2 size={12} /> Criticality
            </label>
            <div className="flex flex-wrap gap-2">
              {priorities.map((p) => (
                <button
                  key={p}
                  onClick={() => setPriority(p)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                    priority === p
                      ? 'bg-primary text-white shadow-medium scale-105'
                      : 'bg-[#F6F8FB] dark:bg-[#171A21] opacity-40 hover:opacity-100'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest opacity-30 mb-3 ml-1 flex items-center gap-2">
                <AlignLeft size={12} /> Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={4}
              className="w-full bg-[#F6F8FB] dark:bg-[#171A21] border-none rounded-2xl p-4 text-sm font-medium outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none"
              placeholder="Add more details about this task..."
            />
          </div>

          {/* Labels / Tags Placeholder */}
          <div>
             <label className="block text-xs font-bold uppercase tracking-widest opacity-30 mb-3 ml-1 flex items-center gap-2">
                <TagIcon size={12} /> Labels
            </label>
            <div className="flex flex-wrap gap-2">
               <div className="px-3 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[10px] font-bold text-blue-600 flex items-center gap-1 border border-blue-100 dark:border-blue-900/40">
                  <div className="w-1 h-1 rounded-full bg-blue-600" />
                  Design
               </div>
               <div className="px-3 py-1.5 rounded-full bg-purple-50 dark:bg-purple-900/20 text-[10px] font-bold text-purple-600 flex items-center gap-1 border border-purple-100 dark:border-purple-900/40">
                  <div className="w-1 h-1 rounded-full bg-purple-600" />
                  Feature
               </div>
               <button className="px-3 py-1.5 rounded-full border border-dashed border-gray-200 dark:border-white/10 text-[10px] font-bold opacity-40 hover:opacity-100 transition-all">
                  + Add Label
               </button>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-100 dark:border-white/5 flex justify-end gap-4">
            <button
                onClick={onClose}
                className="px-6 py-3 text-sm font-bold opacity-40 hover:opacity-100 transition-opacity"
            >
                Cancel
            </button>
            <button
                onClick={handleSave}
                className="px-8 py-3 bg-primary text-white rounded-2xl font-bold shadow-medium hover:bg-primary-hover transition-all active:scale-95 flex items-center gap-2"
            >
                <Check size={18} />
                Save Changes
            </button>
        </div>
      </motion.div>
    </div>
  );
}
