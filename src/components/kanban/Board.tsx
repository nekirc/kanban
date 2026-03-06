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
import { FilterBar } from './FilterBar';
import { Analytics } from './Analytics';
import { createPortal } from 'react-dom';
import { useParams, useSearchParams } from 'next/navigation';
import { AnimatePresence, motion } from 'framer-motion';

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  order: number;
  columnId: string;
  creatorId: string;
  creator?: { name: string; email: string };
  tags?: any[];
  checklists?: any[];
  attachments?: any[];
  storyPoints: number;
  createdAt: string;
}

interface ColumnData {
  id: string;
  title: string;
  order: number;
  wipLimit: number | null;
  tasks: Task[];
}

function BoardContent({ initialData }: { initialData: ColumnData[] }) {
  const [columns, setColumns] = useState<ColumnData[]>(initialData);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isMounted, setIsMounted] = useState(false);
  const [filters, setFilters] = useState({ priority: null });
  const [swimlaneBy, setSwimlaneBy] = useState<'none' | 'priority'>('none');
  const [showAnalytics, setShowAnalytics] = useState(false);
  const { id: boardId } = useParams();
  const searchParams = useSearchParams();
  const searchQuery = searchParams.get('q')?.toLowerCase() || '';

  useEffect(() => {
    setIsMounted(true);

    const channel = new BroadcastChannel(`board-${boardId}`);
    channel.onmessage = (event) => {
        if (event.data.type === 'REFRESH') {
            fetchBoardData();
        }
    };

    return () => channel.close();
  }, [boardId]);

  const fetchBoardData = async () => {
      const res = await fetch(`/api/boards/${boardId}`);
      if (res.ok) {
          const data = await res.json();
          setColumns(data.columns);
      }
  };

  const broadcastChange = () => {
      const channel = new BroadcastChannel(`board-${boardId}`);
      channel.postMessage({ type: 'REFRESH' });
      channel.close();
  };

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
    let overId = over.id as string;

    if (activeId === overId) return;

    const isActiveATask = active.data.current?.type === 'Task';
    const isOverATask = over.data.current?.type === 'Task';

    if (!isActiveATask) return;

    // Handle Swimlane Drop Zone IDs
    let targetColumnId = overId;
    let targetPriority = null;
    if (overId.includes(':')) {
        [targetColumnId, targetPriority] = overId.split(':');
    }

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
        const overColumn = prev.find((col) => col.id === targetColumnId);

        if (!activeColumn || !overColumn) return prev;

        const activeTaskIndex = activeColumn.tasks.findIndex((t) => t.id === activeId);

        if (activeColumn.id !== overColumn.id || (targetPriority && activeColumn.tasks[activeTaskIndex].priority !== targetPriority)) {
          const newColumns = JSON.parse(JSON.stringify(prev));
          const actualActiveCol = newColumns.find((c: any) => c.id === activeColumn.id);
          const actualOverCol = newColumns.find((c: any) => c.id === overColumn.id);

          const [movedTask] = actualActiveCol.tasks.splice(activeTaskIndex, 1);
          movedTask.columnId = overColumn.id;
          if (targetPriority) movedTask.priority = targetPriority;
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
            const currentTask = currentColumn.tasks[index];

            await fetch(`/api/tasks/${task.id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    columnId: currentColumn.id,
                    order: index,
                    priority: currentTask.priority
                })
            });
            broadcastChange();
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
          setColumns(prev => prev.map(col => col.id === columnId ? { ...col, tasks: [...col.tasks, { ...newTask, checklists: [], attachments: [] }] } : col));
          broadcastChange();
      }
  };

  const handleDeleteTask = async (taskId: string) => {
      const res = await fetch(`/api/tasks/${taskId}`, { method: 'DELETE' });
      if (res.ok) {
          setColumns(prev => prev.map(col => ({
              ...col,
              tasks: col.tasks.filter(t => t.id !== taskId)
          })));
          broadcastChange();
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
          broadcastChange();
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
          broadcastChange();
      }
  };

  const handleDeleteColumn = async (columnId: string) => {
      const res = await fetch(`/api/columns/${columnId}`, { method: 'DELETE' });
      if (res.ok) {
          setColumns(prev => prev.filter(c => c.id !== columnId));
          broadcastChange();
      }
  };

  const handleUpdateColumn = async (columnId: string, data: any) => {
      const res = await fetch(`/api/columns/${columnId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data)
      });
      if (res.ok) {
          setColumns(prev => prev.map(c => c.id === columnId ? { ...c, ...data } : c));
          broadcastChange();
      }
  };

  if (!isMounted) return null;

  const filteredColumns = columns.map(col => ({
      ...col,
      tasks: col.tasks.filter(t => {
        const matchesSearch = t.title.toLowerCase().includes(searchQuery) ||
                            t.description?.toLowerCase().includes(searchQuery);
        const matchesPriority = !filters.priority || t.priority === filters.priority;
        return matchesSearch && matchesPriority;
      })
  }));

  const priorities = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'];

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex-1 flex flex-col min-w-0 transition-colors">
          <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <FilterBar onFilterChange={(newFilters) => setFilters(prev => ({ ...prev, ...newFilters }))} />
                <div className="flex items-center gap-2 mb-6 bg-white/5 px-3 py-1.5 rounded-xl border border-white/5">
                    <span className="text-[10px] font-black uppercase tracking-widest opacity-30 text-foreground">Swimlane:</span>
                    <select
                        value={swimlaneBy}
                        onChange={(e) => setSwimlaneBy(e.target.value as any)}
                        className="bg-transparent text-foreground text-[10px] font-bold outline-none border-none cursor-pointer"
                    >
                        <option value="none" className="bg-surface-card">None</option>
                        <option value="priority" className="bg-surface-card">Priority</option>
                    </select>
                </div>
              </div>
              <button
                onClick={() => setShowAnalytics(!showAnalytics)}
                className={`mb-6 px-4 py-2 rounded-xl text-xs font-bold transition-all ${showAnalytics ? 'bg-primary text-white' : 'bg-white/5 text-foreground opacity-60 hover:opacity-100 hover:bg-white/10'}`}
              >
                  {showAnalytics ? 'Hide Analytics' : 'Show Analytics'}
              </button>
          </div>

          <AnimatePresence>
            {showAnalytics && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                >
                    <Analytics columns={columns} />
                </motion.div>
            )}
          </AnimatePresence>

          <div className="flex-1 h-[calc(100vh-140px)] overflow-auto custom-scrollbar bg-surface-board rounded-tl-3xl shadow-inner pt-8 px-8 transition-colors">
            {swimlaneBy === 'none' ? (
                <div className="flex gap-6 items-start pb-8">
                    {filteredColumns.map((col) => (
                    <Column
                        key={col.id}
                        id={col.id}
                        title={col.title}
                        tasks={col.tasks}
                        wipLimit={col.wipLimit}
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
                        className="w-[300px] flex-shrink-0 h-[48px] rounded-column border-2 border-dashed border-white/10 flex items-center justify-center gap-2 text-xs font-bold opacity-40 hover:opacity-100 hover:border-primary hover:text-primary transition-all text-foreground"
                    >
                    <Plus size={14} /> Add Column
                    </button>
                </div>
            ) : (
                <div className="flex flex-col gap-12 pb-8">
                    {priorities.map(priority => (
                        <div key={priority} className="flex flex-col gap-4">
                            <div className="flex items-center gap-3">
                                <div className={`w-3 h-3 rounded-full ${
                                    priority === 'URGENT' ? 'bg-red-500' :
                                    priority === 'HIGH' ? 'bg-orange-500' :
                                    priority === 'MEDIUM' ? 'bg-blue-500' : 'bg-green-500'
                                }`} />
                                <h2 className="text-xs font-black uppercase tracking-[0.2em] text-foreground opacity-50">{priority}</h2>
                                <div className="flex-1 h-[1px] bg-white/5" />
                            </div>
                            <div className="flex gap-6 items-start">
                                {filteredColumns.map(col => (
                                    <Column
                                        key={`${col.id}-${priority}`}
                                        id={`${col.id}:${priority}`}
                                        title={col.title}
                                        tasks={col.tasks.filter(t => t.priority === priority)}
                                        wipLimit={null}
                                        onAddTask={(cid) => handleAddTask(cid.split(':')[0])}
                                        onDeleteTask={handleDeleteTask}
                                        onUpdateTask={handleUpdateTask}
                                        onDeleteColumn={() => {}}
                                        onUpdateColumn={() => {}}
                                        onTaskClick={(task) => setSelectedTask(task)}
                                        isSwimlane
                                    />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
          </div>
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
