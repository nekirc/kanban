'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Clock, CheckSquare, Trash2 } from 'lucide-react';
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
  onClick: () => void;
}

export function Card({ task, onDelete, onUpdate, onClick }: CardProps) {
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
    LOW: 'bg-status-todo',
    MEDIUM: 'bg-status-progress',
    HIGH: 'bg-status-review',
    URGENT: 'bg-status-blocked',
  }[task.priority] || 'bg-primary';

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      onClick={onClick}
      whileHover={{ y: -2, boxShadow: 'var(--shadow-medium)' }}
      onHoverStart={() => setShowActions(true)}
      onHoverEnd={() => setShowActions(false)}
      className={`bg-surface-card p-4 rounded-card shadow-soft mb-3 cursor-grab active:cursor-grabbing group relative border border-gray-100/50 dark:border-white/5 transition-all ${
        isDragging ? 'opacity-30' : ''
      }`}
    >
      {/* Priority Stripe */}
      <div className={`absolute left-0 top-3 bottom-3 w-0.5 rounded-full ${priorityColor}`} />

      <div className="flex justify-between items-start mb-2 pl-1">
        <div className="flex items-center gap-2">
           <span className="text-[10px] font-black uppercase tracking-wider opacity-20">ZF-{task.id.slice(-3).toUpperCase()}</span>
        </div>

        <div className="flex items-center gap-1">
           <AnimatePresence>
             {showActions && (
               <motion.button
                 initial={{ opacity: 0, scale: 0.8 }}
                 animate={{ opacity: 1, scale: 1 }}
                 exit={{ opacity: 0, scale: 0.8 }}
                 onClick={(e) => {
                     e.stopPropagation();
                     onDelete(task.id);
                 }}
                 className="p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg text-red-500 transition-colors"
               >
                 <Trash2 size={12} />
               </motion.button>
             )}
           </AnimatePresence>
        </div>
      </div>

      <h4 className="font-semibold text-sm mb-2 leading-snug tracking-tight px-1 text-foreground">{task.title}</h4>

      {task.description && (
        <p className="text-[11px] opacity-40 font-medium line-clamp-2 mb-3 px-1 text-foreground">{task.description}</p>
      )}

      <div className="flex flex-wrap gap-1.5 mb-4 px-1">
        <div className="px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-900/10 text-[9px] font-black uppercase tracking-wider text-blue-600 flex items-center gap-1 border border-blue-100 dark:border-blue-900/20">
           <div className="w-1 h-1 rounded-full bg-blue-600" />
           Design
        </div>
      </div>

      <div className="mt-auto pt-3 border-t border-gray-50 dark:border-white/5 flex items-center justify-between px-1">
        <div className="flex items-center gap-3 opacity-20">
          <div className="flex items-center gap-1 text-[10px] font-bold">
            <CheckSquare size={10} />
            <span>2/5</span>
          </div>
          <div className="flex items-center gap-1 text-[10px] font-bold">
            <Clock size={10} />
            <span>Mar 12</span>
          </div>
        </div>

        {/* Creator Initials in right bottom corner */}
        <div className="w-6 h-6 rounded-full bg-primary/10 border border-white dark:border-[#1E222B] flex items-center justify-center text-[9px] font-black text-primary">
          JD
        </div>
      </div>
    </motion.div>
  );
}
