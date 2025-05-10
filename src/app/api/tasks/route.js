import { NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET - Obtener tareas con filtros
export async function GET(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const unassigned = url.searchParams.get("unassigned") === "true";
    const status = url.searchParams.get("status"); // "completed", "pending", "all"

    // Construir las condiciones de filtrado
    let whereCondition = {};

    // Filtro por usuario o tareas sin asignar
    if (userId) {
      whereCondition.userId = userId;
    } else if (unassigned) {
      whereCondition.userId = null;
    }

    // Filtro por estado de completado
    if (status === "completed") {
      whereCondition.completed = true;
    } else if (status === "pending") {
      whereCondition.completed = false;
    }

    const tasks = await prisma.task.findMany({
      where: whereCondition,
      orderBy: {
        createdAt: "desc",
      },
      include: {
        // Incluir información básica del usuario si está disponible
        user: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error("Error al obtener tareas:", error);
    return NextResponse.json(
      { error: "Error al obtener las tareas" },
      { status: 500 }
    );
  }
}

// POST - Crear una nueva tarea
export async function POST(request) {
  try {
    const data = await request.json();
    const { title, userId, dueDate, priority, category, userEmail } = data;

    if (!title || title.trim() === "") {
      return NextResponse.json(
        { error: "El título de la tarea es requerido" },
        { status: 400 }
      );
    }

    // No permitir crear tareas sin usuario asociado
    if (!userId) {
      return NextResponse.json(
        { error: "Se requiere un usuario para crear una tarea" },
        { status: 401 }
      );
    }

    // Verificar si el usuario existe
    let user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
    });

    // Si el usuario no existe, crearlo automáticamente
    if (!user && userEmail) {
      try {
        user = await prisma.user.create({
          data: {
            id: userId, // Usar el ID de Firebase como ID en la base de datos
            email: userEmail, // Usar el email que viene de Firebase
            name: userEmail.split("@")[0] || "Usuario", // Nombre provisional basado en el email
          },
        });
        console.log(`Usuario creado automáticamente: ${userId} - ${userEmail}`);
      } catch (userCreateError) {
        console.error(
          "Error al crear usuario automáticamente:",
          userCreateError
        );
        return NextResponse.json(
          { error: "No se pudo crear el usuario automáticamente" },
          { status: 500 }
        );
      }
    } else if (!user) {
      return NextResponse.json(
        {
          error:
            "El usuario especificado no existe y falta información para crearlo",
        },
        { status: 400 }
      );
    }

    // Preparar los datos de la tarea con usuario obligatorio
    const taskData = {
      title: title.trim(),
      completed: false,
      dueDate: dueDate ? new Date(dueDate) : null,
      priority: priority || "normal", // 'low', 'normal', 'high'
      category: category || "general",
      userId: userId, // Usuario obligatorio
    };

    // Crear la tarea con los datos validados
    const newTask = await prisma.task.create({
      data: taskData,
    });

    return NextResponse.json(newTask, { status: 201 });
  } catch (error) {
    console.error("Error al crear tarea:", error);
    return NextResponse.json(
      { error: `Error al crear la tarea: ${error.message}` },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar todas las tareas completadas
export async function DELETE(request) {
  try {
    const url = new URL(request.url);
    const userId = url.searchParams.get("userId");
    const clearCompleted = url.searchParams.get("clearCompleted") === "true";

    if (!clearCompleted) {
      return NextResponse.json(
        { error: "Operación no soportada" },
        { status: 400 }
      );
    }

    // Construir condiciones para eliminar
    let whereCondition = { completed: true };

    // Si se proporciona un userId, solo eliminar las tareas completadas de ese usuario
    if (userId) {
      whereCondition.userId = userId;
    }

    // Eliminar tareas completadas que cumplan la condición
    const result = await prisma.task.deleteMany({
      where: whereCondition,
    });

    return NextResponse.json({
      success: true,
      deletedCount: result.count,
      message: `Se eliminaron ${result.count} tareas completadas`,
    });
  } catch (error) {
    console.error("Error al eliminar tareas completadas:", error);
    return NextResponse.json(
      { error: "Error al eliminar las tareas completadas" },
      { status: 500 }
    );
  }
}
