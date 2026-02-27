'use client';

import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { MoreHorizontal, Tag } from 'lucide-react';
import { motion } from 'framer-motion';

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
}

export function Card({ task }: { task: Task }) {
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
    LOW: 'bg-green-500',
    MEDIUM: 'bg-yellow-500',
    HIGH: 'bg-orange-500',
    URGENT: 'bg-red-500',
  }[task.priority] || 'bg-blue-500';

  return (
    <motion.div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      whileHover={{ scale: 1.02 }}
      className={`neumorphic p-4 mb-4 cursor-grab active:cursor-grabbing group relative ${
        isDragging ? 'opacity-30' : ''
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <div className={`h-1.5 w-8 rounded-full ${priorityColor}`} />
        <button className="opacity-0 group-hover:opacity-40 transition-opacity">
          <MoreHorizontal size={14} />
        </button>
      </div>
      <h4 className="font-bold text-sm mb-1 leading-tight">{task.title}</h4>
      {task.description && (
        <p className="text-[11px] opacity-50 line-clamp-2">{task.description}</p>
      )}
      <div className="mt-3 flex items-center gap-2">
        <Tag size={10} className="opacity-30" />
        <div className="w-6 h-6 rounded-full neumorphic-inset flex items-center justify-center text-[8px] font-bold">
          JD
        </div>
      </div>
    </motion.div>
  );
}
