"use client";

import { useState, useEffect } from "react";
import TaskForm from "../components/TaskForm";
import TaskList from "../components/TaskList";
import LoginButton from "../components/LoginButton";
import LoadingSpinner from "../components/LoadingSpinner";
import ErrorMessage from "../components/ErrorMessage";
import ThemeToggle from "../components/ThemeToggle";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";

export default function Home() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [filter, setFilter] = useState("all"); // 'all', 'active', 'completed'

  // Verificar si el usuario está autenticado
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      // Recargar las tareas al cambiar de usuario
      fetchTasks(currentUser);
    });

    return () => unsubscribe();
  }, []);

  // Cargar tareas desde la API basado en el estado de autenticación
  const fetchTasks = async (currentUser = user) => {
    try {
      setLoading(true);

      // Si no hay usuario, no cargar tareas y establecer un array vacío
      if (!currentUser) {
        setTasks([]);
        setLoading(false);
        return;
      }

      const url = `/api/tasks?userId=${currentUser.uid}`;
      console.log("Fetching tasks from:", url);
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error("Error al cargar las tareas");
      }

      const data = await response.json();
      setTasks(data);
      setError(null);
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar tareas según el filtro seleccionado
  const filteredTasks = tasks.filter((task) => {
    if (filter === "active") return !task.completed;
    if (filter === "completed") return task.completed;
    return true; // 'all'
  });

  // Agregar nueva tarea
  const addTask = async (title) => {
    try {
      // Si no hay usuario autenticado, mostrar error y no continuar
      if (!user) {
        setError("Debes iniciar sesión para crear tareas");
        return;
      }

      // Preparar los datos de la tarea con el usuario obligatorio
      // Incluir también el email para crear el usuario si no existe
      const taskData = {
        title,
        userId: user.uid,
        userEmail: user.email, // Añadir email para creación automática de usuario
      };

      console.log("Creando tarea con datos:", taskData);

      const response = await fetch("/api/tasks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(taskData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Error al crear la tarea");
      }

      const newTask = await response.json();
      setTasks([newTask, ...tasks]);
      setError(null);
    } catch (err) {
      console.error("Error al crear tarea:", err);
      setError(err.message);
    }
  };

  // Eliminar tarea
  const deleteTask = async (id) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar la tarea");
      }

      setTasks(tasks.filter((task) => task.id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Actualizar tarea
  const updateTask = async (id, updates) => {
    try {
      const response = await fetch(`/api/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error("Error al actualizar la tarea");
      }

      const updatedTask = await response.json();

      setTasks(tasks.map((task) => (task.id === id ? updatedTask : task)));
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  };

  // Eliminar todas las tareas completadas
  const clearCompletedTasks = async () => {
    try {
      const completedTasks = tasks.filter((task) => task.completed);

      if (completedTasks.length === 0) return;

      // Si no hay usuario autenticado, mostrar error y no continuar
      if (!user) {
        setError("Debes iniciar sesión para eliminar tareas");
        return;
      }

      setLoading(true);

      const url = `/api/tasks?clearCompleted=true&userId=${user.uid}`;

      const response = await fetch(url, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Error al eliminar las tareas completadas");
      }

      // Refrescar la lista de tareas
      fetchTasks();
    } catch (err) {
      setError("Error al eliminar las tareas completadas");
      setLoading(false);
    }
  };

  // Calcular estadísticas de tareas
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((task) => task.completed).length;
  const activeTasks = totalTasks - completedTasks;
  const completionPercentage =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Función para refrescar las tareas manualmente
  const refreshTasks = () => {
    fetchTasks();
  };

  return (
    <main className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white">
          Gestor de Tareas
        </h1>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LoginButton />
        </div>
      </div>

      {/* Información de usuario y tipo de tareas mostradas */}
      <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900 rounded-lg">
        {user ? (
          <div>
            <p className="text-sm dark:text-blue-100">
              Conectado como: {user.email}
            </p>
            <p className="text-xs text-blue-600 dark:text-blue-200 mt-1">
              Mostrando tus tareas personales
            </p>
          </div>
        ) : (
          <div>
            <p className="text-sm dark:text-blue-100">No has iniciado sesión</p>
            <p className="text-xs text-blue-600 dark:text-blue-200 mt-1">
              Debes iniciar sesión para crear y ver tareas
            </p>
          </div>
        )}
        {user && (
          <button
            onClick={refreshTasks}
            className="mt-2 text-xs bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 rounded"
          >
            Refrescar tareas
          </button>
        )}
      </div>

      {error && <ErrorMessage message={error} onClose={() => setError(null)} />}

      {/* Mostrar mensaje si no hay usuario */}
      {!user && (
        <div className="my-8 p-6 bg-yellow-50 dark:bg-yellow-900 rounded-lg text-center">
          <p className="text-lg font-medium text-yellow-800 dark:text-yellow-200">
            Inicia sesión para usar el gestor de tareas
          </p>
          <p className="text-sm text-yellow-600 dark:text-yellow-300 mt-2">
            Necesitas una cuenta para crear y gestionar tus tareas
          </p>
        </div>
      )}

      {/* Mostrar resto de la interfaz solo si hay usuario */}
      {user && (
        <>
          {/* Estadísticas */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Total de Tareas
              </h3>
              <p className="text-2xl font-bold text-gray-800 dark:text-white">
                {totalTasks}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Tareas Pendientes
              </h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {activeTasks}
              </p>
            </div>
            <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-sm">
              <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">
                Completadas
              </h3>
              <div className="flex items-center gap-2">
                <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                  {completedTasks}
                </p>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  ({completionPercentage}%)
                </span>
              </div>
            </div>
          </div>

          <TaskForm onAddTask={addTask} />

          {/* Filtros */}
          <div className="mt-6 mb-4 flex justify-between items-center">
            <div className="flex gap-2">
              <button
                onClick={() => setFilter("all")}
                className={`px-3 py-1 rounded text-sm ${
                  filter === "all"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                }`}
              >
                Todas ({totalTasks})
              </button>
              <button
                onClick={() => setFilter("active")}
                className={`px-3 py-1 rounded text-sm ${
                  filter === "active"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                }`}
              >
                Pendientes ({activeTasks})
              </button>
              <button
                onClick={() => setFilter("completed")}
                className={`px-3 py-1 rounded text-sm ${
                  filter === "completed"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200"
                }`}
              >
                Completadas ({completedTasks})
              </button>
            </div>

            {completedTasks > 0 && (
              <button
                onClick={clearCompletedTasks}
                className="text-sm text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300"
              >
                Eliminar completadas
              </button>
            )}
          </div>

          <div className="mt-4">
            {loading ? (
              <LoadingSpinner />
            ) : (
              <TaskList
                tasks={filteredTasks}
                onDeleteTask={deleteTask}
                onUpdateTask={updateTask}
              />
            )}
          </div>
        </>
      )}
    </main>
  );
}
