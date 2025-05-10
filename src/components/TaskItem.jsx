"use client";

import { useState } from "react";
import { Trash2, Edit, Save, X, CheckCircle } from "lucide-react";

export default function TaskItem({ task, onDelete, onUpdate }) {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);

  const handleToggleComplete = () => {
    onUpdate(task.id, { completed: !task.completed });
  };

  const handleStartEdit = () => {
    setIsEditing(true);
    setEditTitle(task.title);
  };

  const handleSaveEdit = () => {
    if (!editTitle.trim()) return;

    onUpdate(task.id, { title: editTitle });
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(task.title);
  };

  return (
    <li
      className={`p-4 border rounded shadow-sm  ${
        task.completed
          ? "bg-green-50 border-green-200 dark:text-white"
          : "bg-white dark:bg-gray-800  dark:text-white"
      }`}
    >
      {isEditing ? (
        <div className="flex gap-2 ">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            className="flex-1 p-2 border border-gray-300 rounded"
            autoFocus
          />
          <button
            onClick={handleSaveEdit}
            className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded"
          >
            <Save className="h-5 w-5" />
          </button>
          <button
            onClick={handleCancelEdit}
            className="bg-gray-400 hover:bg-gray-500 text-white px-3 py-1 rounded"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      ) : (
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={handleToggleComplete}
              className={`flex-shrink-0 rounded-full p-1 focus:outline-none ${
                task.completed
                  ? "text-green-600 hover:text-green-700"
                  : "text-gray-400 hover:text-gray-600"
              }`}
            >
              <CheckCircle className="h-5 w-5" />
            </button>
            <span
              className={task.completed ? "line-through text-gray-500" : ""}
            >
              {task.title}
            </span>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={handleStartEdit}
              className="text-blue-500 hover:text-blue-700"
            >
              <Edit className="h-5 w-5" />
            </button>
            <button
              onClick={() => onDelete(task.id)}
              className="text-red-500 hover:text-red-700"
            >
              <Trash2 className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </li>
  );
}
