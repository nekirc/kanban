'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, MoreVertical } from 'lucide-react';
import { Card } from './Card';

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  order: number;
}

interface ColumnProps {
  id: string;
  title: string;
  tasks: Task[];
  onAddTask: (columnId: string) => void;
}

export function Column({ id, title, tasks, onAddTask }: ColumnProps) {
  const { setNodeRef } = useDroppable({
    id,
    data: {
      type: 'Column',
    },
  });

  const taskIds = tasks.map((t) => t.id);

  return (
    <div className="w-80 flex-shrink-0 flex flex-col max-h-full">
      <div className="flex items-center justify-between px-4 mb-6">
        <div className="flex items-center gap-2">
          <h3 className="font-black text-sm uppercase tracking-widest">{title}</h3>
          <span className="neumorphic-inset px-2 py-0.5 rounded-full text-[10px] font-bold opacity-50">
            {tasks.length}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={() => onAddTask(id)}
            className="p-1 neumorphic hover:scale-110 transition-transform active:scale-90"
          >
            <Plus size={14} />
          </button>
          <button className="p-1 opacity-30 hover:opacity-100 transition-opacity">
            <MoreVertical size={14} />
          </button>
        </div>
      </div>

      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto px-2 min-h-[200px]"
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <Card key={task.id} task={task} />
          ))}
        </SortableContext>
      </div>
    </div>
  );
}
