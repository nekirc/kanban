'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, Tag as TagIcon, Clock, CheckSquare, Edit2, Trash2, X, Check } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useState } from 'react';

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
}

interface CardProps {
  task: Task;
  onDelete: (id: string) => void;
  onUpdate: (id: string, data: Partial<Task>) => void;
}

export function Card({ task, onDelete, onUpdate }: CardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [showActions, setShowActions] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: task.id,
    disabled: isEditing,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transition,
    transform: CSS.Translate.toString(transform),
  };

  const priorityColor = {
    LOW: 'bg-green-500',
    MEDIUM: 'bg-yellow-500',
    HIGH: 'bg-orange-500',
    URGENT: 'bg-red-500',
  }[task.priority] || 'bg-blue-500';

  const handleUpdate = () => {
    onUpdate(task.id, { title: editTitle });
    setIsEditing(false);
  };

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      whileHover={{ y: -2, boxShadow: 'var(--shadow-medium)' }}
      onHoverStart={() => setShowActions(true)}
      onHoverEnd={() => setShowActions(false)}
      className={`bg-surface-card p-4 rounded-card shadow-soft mb-3 cursor-grab active:cursor-grabbing group relative border border-gray-100/50 dark:border-white/5 transition-all ${
        isDragging ? 'opacity-30' : ''
      }`}
    >
      <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${priorityColor}`} />

      <div className="flex justify-between items-start mb-2 pl-1">
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black uppercase tracking-wider opacity-30">ZF-{task.id.slice(-3).toUpperCase()}</span>
        </div>

        <div className="flex items-center gap-1">
           <AnimatePresence>
             {showActions && !isEditing && (
               <motion.div
                 initial={{ opacity: 0, x: 5 }}
                 animate={{ opacity: 1, x: 0 }}
                 exit={{ opacity: 0, x: 5 }}
                 className="flex items-center gap-1"
               >
                 <button
                   onClick={(e) => {
                     e.stopPropagation();
                     setIsEditing(true);
                   }}
                   className="p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded transition-colors text-primary"
                 >
                   <Edit2 size={12} />
                 </button>
                 <button
                   onClick={(e) => {
                     e.stopPropagation();
                     onDelete(task.id);
                   }}
                   className="p-1 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors text-red-500"
                 >
                   <Trash2 size={12} />
                 </button>
               </motion.div>
             )}
           </AnimatePresence>
           <button className="opacity-20">
             <MoreHorizontal size={14} />
           </button>
        </div>
      </div>

      {isEditing ? (
        <div className="px-1 py-1" onPointerDown={(e) => e.stopPropagation()}>
          <input
            autoFocus
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="w-full bg-[#F6F8FB] dark:bg-[#171A21] p-2 rounded-lg text-sm font-semibold outline-none focus:ring-2 focus:ring-primary/20 mb-2"
          />
          <div className="flex justify-end gap-2">
            <button onClick={() => setIsEditing(false)} className="p-1.5 hover:bg-gray-100 dark:hover:bg-white/10 rounded">
              <X size={14} className="opacity-40" />
            </button>
            <button onClick={handleUpdate} className="p-1.5 bg-primary text-white rounded">
              <Check size={14} />
            </button>
          </div>
        </div>
      ) : (
        <>
          <h4 className="font-semibold text-sm mb-2 leading-snug tracking-tight px-1">{task.title}</h4>

          {task.description && (
            <p className="text-[11px] opacity-40 font-medium line-clamp-2 mb-3 px-1">{task.description}</p>
          )}

          <div className="flex flex-wrap gap-1.5 mb-4 px-1">
            <div className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/20 text-[10px] font-bold text-blue-600 flex items-center gap-1">
               <div className="w-1 h-1 rounded-full bg-blue-600" />
               Design
            </div>
            <div className="px-2 py-0.5 rounded-full bg-purple-50 dark:bg-purple-900/20 text-[10px] font-bold text-purple-600 flex items-center gap-1">
               <div className="w-1 h-1 rounded-full bg-purple-600" />
               Feature
            </div>
          </div>

          <div className="mt-auto pt-3 border-t border-gray-50 dark:border-white/5 flex items-center justify-between px-1">
            <div className="flex items-center gap-3 opacity-30">
              <div className="flex items-center gap-1 text-[10px] font-bold">
                <CheckSquare size={10} />
                <span>2/5</span>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-bold">
                <Clock size={10} />
                <span>Mar 12</span>
              </div>
            </div>
            <div className="w-6 h-6 rounded-full bg-primary/10 border border-white dark:border-[#1E222B] flex items-center justify-center text-[10px] font-black text-primary">
              JD
            </div>
          </div>
        </>
      )}
    </motion.div>
  );
}
