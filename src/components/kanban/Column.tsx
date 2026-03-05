'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus, Trash2, Check, X, AlertCircle } from 'lucide-react';
import { Card } from './Card';
import { useState } from 'react';

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
  wipLimit: number | null;
  onAddTask: (columnId: string) => void;
  onDeleteTask: (id: string) => void;
  onUpdateTask: (id: string, data: Partial<Task>) => void;
  onDeleteColumn: (id: string) => void;
  onUpdateColumn: (id: string, data: any) => void;
  onTaskClick: (task: any) => void;
}

export function Column({
    id,
    title,
    tasks,
    wipLimit,
    onAddTask,
    onDeleteTask,
    onUpdateTask,
    onDeleteColumn,
    onUpdateColumn,
    onTaskClick
}: ColumnProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(title);
  const [editWip, setEditWip] = useState(wipLimit?.toString() || '');

  const { setNodeRef } = useDroppable({
    id,
    data: {
      type: 'Column',
    },
  });

  const taskIds = tasks.map((t) => t.id);
  const isOverWip = wipLimit !== null && tasks.length > wipLimit;

  const statusColor = {
    'To Do': 'bg-[#9AA4B2]',
    'In Progress': 'bg-[#4C82F7]',
    'Done': 'bg-[#2FBF71]',
    'Review': 'bg-[#F5A524]',
    'Blocked': 'bg-[#E5484D]',
  }[title] || 'bg-primary';

  const handleUpdate = () => {
    onUpdateColumn(id, { title: editTitle, wipLimit: editWip === '' ? null : parseInt(editWip) });
    setIsEditing(false);
  };

  return (
    <div className={`w-[300px] flex-shrink-0 flex flex-col max-h-full bg-white/5 dark:bg-white/[0.02] rounded-column transition-all border-2 ${isOverWip ? 'border-red-500/50 bg-red-500/5' : 'border-transparent'}`}>
      <div className="flex items-center justify-between px-4 py-4 sticky top-0 z-10">
        <div className="flex flex-col gap-1 flex-1 mr-2">
          <div className="flex items-center gap-2">
            <div className={`w-2 h-2 rounded-full ${statusColor}`} />
            {isEditing ? (
              <input
                autoFocus
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                className="bg-[#1A1C21] text-white text-sm font-bold outline-none border-b border-primary flex-1"
              />
            ) : (
              <h3
                  onClick={() => setIsEditing(true)}
                  className="font-bold text-sm tracking-tight text-white cursor-pointer hover:text-primary transition-colors truncate max-w-[150px]"
              >
                  {title}
              </h3>
            )}
            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${isOverWip ? 'bg-red-500 text-white animate-pulse' : 'opacity-30 text-white bg-white/10'}`}>
              {tasks.length}{wipLimit ? ` / ${wipLimit}` : ''}
            </span>
          </div>

          {isEditing && (
            <div className="flex items-center gap-2 mt-2">
                <span className="text-[9px] font-black uppercase opacity-30 text-white">WIP Limit:</span>
                <input
                    type="number"
                    value={editWip}
                    onChange={(e) => setEditWip(e.target.value)}
                    className="w-12 bg-[#1A1C21] text-white text-[10px] font-bold outline-none border-b border-primary"
                    placeholder="∞"
                />
                <button onClick={handleUpdate} className="text-green-500 ml-auto"><Check size={12} /></button>
                <button onClick={() => setIsEditing(false)} className="text-red-500"><X size={12} /></button>
            </div>
          )}
        </div>

        <div className="flex items-center gap-1 self-start pt-1">
          <button
            onClick={() => onAddTask(id)}
            className="p-1.5 opacity-40 hover:opacity-100 hover:bg-white/10 rounded-md transition-all text-white"
          >
            <Plus size={14} />
          </button>
          <button
            onClick={() => {
                if (confirm('Delete this column and all its tasks?')) onDeleteColumn(id);
            }}
            className="p-1.5 opacity-40 hover:opacity-100 hover:text-red-500 hover:bg-red-500/10 rounded-md transition-all text-white"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {isOverWip && (
        <div className="px-4 pb-2 flex items-center gap-2 text-[10px] font-bold text-red-500 uppercase tracking-widest">
            <AlertCircle size={12} />
            <span>WIP Limit Exceeded</span>
        </div>
      )}

      <div
        ref={setNodeRef}
        className="flex-1 overflow-y-auto px-3 pb-4 min-h-[200px] custom-scrollbar"
      >
        <SortableContext items={taskIds} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <Card
                key={task.id}
                task={task}
                onDelete={onDeleteTask}
                onUpdate={onUpdateTask}
                onClick={() => onTaskClick(task)}
            />
          ))}
        </SortableContext>

        <button
          onClick={() => onAddTask(id)}
          className="w-full py-2 flex items-center justify-center gap-2 text-xs font-bold opacity-0 hover:opacity-40 transition-opacity mt-2 text-white"
        >
          <Plus size={12} /> Add Card
        </button>
      </div>
    </div>
  );
}
