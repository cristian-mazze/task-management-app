"use client";

import TaskItem from "./TaskItem";

export default function TaskList({
  tasks,
  loading,
  onDeleteTask,
  onUpdateTask,
}) {
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-lg font-medium text-gray-600">
          Cargando tareas...
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center p-8 bg-gray-50 rounded">
        <p className="text-gray-500">
          No hay tareas disponibles. ¡Agrega una nueva!
        </p>
      </div>
    );
  }

  return (
    <ul className="space-y-3 bg-white text-black dark:bg-black ">
      {tasks.map((task) => (
        <TaskItem
          key={task.id}
          task={task}
          onDelete={onDeleteTask}
          onUpdate={onUpdateTask}
        />
      ))}
    </ul>
  );
}
