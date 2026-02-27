'use client';

import { useState, useEffect } from 'react';
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
  horizontalListSortingStrategy,
} from '@dnd-kit/sortable';
import { Column } from './Column';
import { Card } from './Card';
import { createPortal } from 'react-dom';

interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: string;
  order: number;
  columnId: string;
}

interface ColumnData {
  id: string;
  title: string;
  order: number;
  tasks: Task[];
}

export function Board({ initialData }: { initialData: ColumnData[] }) {
  const [columns, setColumns] = useState<ColumnData[]>(initialData);
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isMounted, setIsMounted] = useState(false);

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

    // Im dropping a Task over another Task
    if (isActiveATask && isOverATask) {
      setColumns((prev) => {
        const activeColumn = prev.find((col) => col.tasks.some((t) => t.id === activeId));
        const overColumn = prev.find((col) => col.tasks.some((t) => t.id === overId));

        if (!activeColumn || !overColumn) return prev;

        if (activeColumn.id !== overColumn.id) {
          const activeTaskIndex = activeColumn.tasks.findIndex((t) => t.id === activeId);
          const overTaskIndex = overColumn.tasks.findIndex((t) => t.id === overId);

          const newColumns = [...prev];
          const [movedTask] = activeColumn.tasks.splice(activeTaskIndex, 1);
          movedTask.columnId = overColumn.id;
          overColumn.tasks.splice(overTaskIndex, 0, movedTask);

          return newColumns;
        }
        return prev;
      });
    }

    // Im dropping a Task over a column
    const isOverAColumn = over.data.current?.type === 'Column';
    if (isActiveATask && isOverAColumn) {
      setColumns((prev) => {
        const activeColumn = prev.find((col) => col.tasks.some((t) => t.id === activeId));
        const overColumn = prev.find((col) => col.id === overId);

        if (!activeColumn || !overColumn) return prev;

        if (activeColumn.id !== overColumn.id) {
          const activeTaskIndex = activeColumn.tasks.findIndex((t) => t.id === activeId);
          const newColumns = [...prev];
          const [movedTask] = activeColumn.tasks.splice(activeTaskIndex, 1);
          movedTask.columnId = overColumn.id;
          overColumn.tasks.push(movedTask);

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

    // Persist changes to backend
    const task = active.data.current?.task;
    if (task) {
        // Find current state of the task
        const currentColumn = columns.find(col => col.tasks.some(t => t.id === task.id));
        if (currentColumn) {
            const taskInCol = currentColumn.tasks.find(t => t.id === task.id);
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

  if (!isMounted) return null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragEnd={onDragEnd}
    >
      <div className="flex gap-8 items-start h-[calc(100vh-200px)] overflow-x-auto pb-8 px-4 custom-scrollbar">
        {columns.map((col) => (
          <Column key={col.id} id={col.id} title={col.title} tasks={col.tasks} onAddTask={handleAddTask} />
        ))}
      </div>

      {createPortal(
        <DragOverlay dropAnimation={{
            sideEffects: defaultDropAnimationSideEffects({
                styles: {
                    active: {
                        opacity: '0.5',
                    },
                },
            }),
        }}>
          {activeTask ? <Card task={activeTask} /> : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );
}
