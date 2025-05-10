import { NextResponse } from "next/server";
import { prisma } from "../../../../lib/db";

// GET - Obtener una tarea específica
export async function GET(request, { params }) {
  try {
    const { id } = params;

    const task = await prisma.task.findUnique({
      where: { id },
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

    if (!task) {
      return NextResponse.json(
        { error: "Tarea no encontrada" },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error al obtener la tarea:", error);
    return NextResponse.json(
      { error: "Error al obtener la tarea" },
      { status: 500 }
    );
  }
}

// PUT - Actualizar una tarea
export async function PUT(request, { params }) {
  try {
    const { id } = params;
    const data = await request.json();

    // Verificar si la tarea existe
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: "Tarea no encontrada" },
        { status: 404 }
      );
    }

    // Preparar los datos para la actualización
    const updateData = { ...data };

    // Procesar campos específicos si están presentes
    if (data.dueDate) {
      updateData.dueDate = new Date(data.dueDate);
    }

    // Actualizar la tarea
    const updatedTask = await prisma.task.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updatedTask);
  } catch (error) {
    console.error("Error al actualizar la tarea:", error);
    return NextResponse.json(
      { error: "Error al actualizar la tarea" },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar una tarea
export async function DELETE(request, { params }) {
  try {
    const { id } = params;

    // Verificar si la tarea existe
    const existingTask = await prisma.task.findUnique({
      where: { id },
    });

    if (!existingTask) {
      return NextResponse.json(
        { error: "Tarea no encontrada" },
        { status: 404 }
      );
    }

    // Eliminar la tarea
    await prisma.task.delete({
      where: { id },
    });

    return NextResponse.json({
      success: true,
      message: "Tarea eliminada correctamente",
    });
  } catch (error) {
    console.error("Error al eliminar la tarea:", error);
    return NextResponse.json(
      { error: "Error al eliminar la tarea" },
      { status: 500 }
    );
  }
}
