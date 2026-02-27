'use client';

import { useState, useEffect, Suspense } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragOverEvent,
  DragEndEvent,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { Column } from './Column';
import { Card } from './Card';
import { TaskModal } from './TaskModal';
import { createPortal } from 'react-dom';
import { useParams, useSearchParams } from 'next/navigation';
import { AnimatePresence } from 'framer-motion';

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  order: number;
  columnId: string;
  tags?: any[];
}

interface ColumnData {
  id: string;
  title: string;
  order: number;
  tasks: Task[];
}

function BoardContent({ initialData }: { initialData: ColumnData[] }) {
  const [columns, setColumns] = useState<ColumnData[]>(initialData);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const { id: boardId } = useParams();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q')?.toLowerCase() || '';

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const onDragStart = (event: DragStartEvent) => {
    if (event.active.data.current?.type === 'Task') {
      setActiveTask(event.active.data.current.task);
    }
  };

  const onDragOver = (event: DragOverEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === 'Task';
    const isOverATask = over.data.current?.type === 'Task';

    if (!isActiveATask) return;

    if (isActiveATask && isOverATask) {
      setColumns((prev) => {
        const activeColumn = prev.find((col) => col.tasks.some((t) => t.id === activeId));
        const overColumn = prev.find((col) => col.tasks.some((t) => t.id === overId));

        if (!activeColumn || !overColumn) return prev;

        if (activeColumn.id !== overColumn.id) {
          const activeTaskIndex = activeColumn.tasks.findIndex((t) => t.id === activeId);
          const overTaskIndex = overColumn.tasks.findIndex((t) => t.id === overId);

          const newColumns = JSON.parse(JSON.stringify(prev));
          const actualActiveCol = newColumns.find((c: any) => c.id === activeColumn.id);
          const actualOverCol = newColumns.find((c: any) => c.id === overColumn.id);

          const [movedTask] = actualActiveCol.tasks.splice(activeTaskIndex, 1);
          movedTask.columnId = overColumn.id;
          actualOverCol.tasks.splice(overTaskIndex, 0, movedTask);

          return newColumns;
        }
        return prev;
      });
    }

    const isOverAColumn = over.data.current?.type === 'Column';
    if (isActiveATask && isOverAColumn) {
      setColumns((prev) => {
        const activeColumn = prev.find((col) => col.tasks.some((t) => t.id === activeId));
        const overColumn = prev.find((col) => col.id === overId);

        if (!activeColumn || !overColumn) return prev;

        if (activeColumn.id !== overColumn.id) {
          const activeTaskIndex = activeColumn.tasks.findIndex((t) => t.id === activeId);
          const newColumns = JSON.parse(JSON.stringify(prev));
          const actualActiveCol = newColumns.find((c: any) => c.id === activeColumn.id);
          const actualOverCol = newColumns.find((c: any) => c.id === overColumn.id);

          const [movedTask] = actualActiveCol.tasks.splice(activeTaskIndex, 1);
          movedTask.columnId = overColumn.id;
          actualOverCol.tasks.push(movedTask);

          return newColumns;
        }
        return prev;
      });
    }
  };

  const onDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id;
    const overId = over.id;

    const isActiveATask = active.data.current?.type === 'Task';
    const isOverATask = over.data.current?.type === 'Task';

    if (isActiveATask && isOverATask) {
        const activeColumn = columns.find((col) => col.tasks.some((t) => t.id === activeId));
        const overColumn = columns.find((col) => col.tasks.some((t) => t.id === overId));

        if (activeColumn && overColumn && activeColumn.id === overColumn.id) {
            const oldIndex = activeColumn.tasks.findIndex((t) => t.id === activeId);
            const newIndex = activeColumn.tasks.findIndex((t) => t.id === overId);

            if (oldIndex !== newIndex) {
                const newTasks = arrayMove(activeColumn.tasks, oldIndex, newIndex);
                setColumns(prev => prev.map(col => col.id === activeColumn.id ? { ...col, tasks: newTasks } : col));
            }
        }
    }

    setActiveTask(null);

    const task = active.data.current?.task;
    if (task) {
        const currentColumn = columns.find(col => col.tasks.some(t => t.id === task.id));
        if (currentColumn) {
            const index = currentColumn.tasks.findIndex(t => t.id === task.id);

            await fetch(`/api/tasks/${task.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    columnId: currentColumn.id,
                    order: index
                })
            });
        }
    }
  };

  const handleAddTask = async (columnId: string) => {
      const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              title: 'New Task',
              columnId,
              order: columns.find(c => c.id === columnId)?.tasks.length || 0
          })
      });
      if (res.ok) {
          const newTask = await res.json();
          setColumns(prev => prev.map(col => col.id === columnId ? { ...col, tasks: [...col.tasks, newTask] } : col));
      }
  };

  const handleDeleteTask = async (taskId: string) => {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (res.ok) {
          setColumns(prev => prev.map(col => ({
              ...col,
              tasks: col.tasks.filter(t => t.id !== taskId)
          })));
      }
  };

  const handleUpdateTask = async (taskId: string, data: Partial<Task>) => {
      const res = await fetch(`/api/tasks/${taskId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
      });
      if (res.ok) {
          const updatedTask = await res.json();
          setColumns(prev => prev.map(col => ({
              ...col,
              tasks: col.tasks.map(t => t.id === taskId ? { ...t, ...updatedTask } : t)
          })));
      }
  };

  const handleAddColumn = async () => {
      const res = await fetch('/api/columns', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              title: 'New Column',
              boardId: boardId,
              order: columns.length
          })
      });
      if (res.ok) {
          const newColumn = await res.json();
          setColumns(prev => [...prev, { ...newColumn, tasks: [] }]);
      }
  };

  const handleDeleteColumn = async (columnId: string) => {
      const res = await fetch(`/api/columns/${columnId}`, { method: 'DELETE' });
      if (res.ok) {
          setColumns(prev => prev.filter(c => c.id !== columnId));
      }
  };

  const handleUpdateColumn = async (columnId: string, title: string) => {
      const res = await fetch(`/api/columns/${columnId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title })
      });
      if (res.ok) {
          setColumns(prev => prev.map(c => c.id === columnId ? { ...c, title } : c));
      }
  };

  if (!isMounted) return null;

  const filteredColumns = columns.map(col => ({
      ...col,
      tasks: col.tasks.filter(t =>
        t.title.toLowerCase().includes(searchQuery) ||
        t.description?.toLowerCase().includes(searchQuery)
      )
  }));

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-6 items-start h-[calc(100vh-140px)] overflow-x-auto pb-8 px-8 custom-scrollbar bg-surface-board rounded-tl-3xl shadow-inner pt-8">
        {filteredColumns.map((col) => (
          <Column
            key={col.id}
            id={col.id}
            title={col.title}
            tasks={col.tasks}
            onAddTask={handleAddTask}
            onDeleteTask={handleDeleteTask}
            onUpdateTask={handleUpdateTask}
            onDeleteColumn={handleDeleteColumn}
            onUpdateColumn={handleUpdateColumn}
            onTaskClick={(task) => setSelectedTask(task)}
          />
        ))}

        <button
            onClick={handleAddColumn}
            className="w-[300px] flex-shrink-0 h-[48px] rounded-column border-2 border-dashed border-white/10 flex items-center justify-center gap-2 text-xs font-bold opacity-40 hover:opacity-100 hover:border-primary hover:text-primary transition-all text-white"
        >
           <Plus size={14} /> Add Column
        </button>
      </div>

      <AnimatePresence>
        {selectedTask && (
          <TaskModal
            task={selectedTask}
            onClose={() => setSelectedTask(null)}
            onUpdate={handleUpdateTask}
          />
        )}
      </AnimatePresence>

      {createPortal(
        <DragOverlay dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
                styles: {
                    active: {
                        opacity: '0.4',
                    },
                },
            }),
        }}>
          {activeTask ? (
            <div style={{ transform: 'rotate(1deg)' }} className="scale-[1.02] shadow-card">
              <Card
                task={activeTask}
                onDelete={() => {}}
                onUpdate={() => {}}
                onClick={() => {}}
              />
            </div>
          ) : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}

export function Board({ initialData }: { initialData: ColumnData[] }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <BoardContent initialData={initialData} />
        </Suspense>
    );
}
