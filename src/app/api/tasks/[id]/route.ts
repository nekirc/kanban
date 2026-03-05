import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { logActivity } from "@/lib/activity";

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, columnId, order, priority, storyPoints, tags } = await req.json();

  const data: any = {
    title,
    description,
    columnId,
    order,
    priority,
    storyPoints: storyPoints !== undefined ? parseInt(storyPoints) : undefined
  };

  // Simple tag management for MVP
  if (tags) {
      data.tags = {
          set: [], // Clear existing
          connectOrCreate: tags.map((t: any) => ({
              where: { id: t.id || 'new-tag' },
              create: { name: t.name, color: t.color || '#5B6CFF' }
          }))
      };
  }

  const task = await prisma.task.update({
    where: {
      id: params.id,
      column: { board: { userId: (session.user as any).id } }
    },
    data,
    include: {
        tags: true
    }
  });

  await logActivity((session.user as any).id, "UPDATE", "TASK", task.id, `Updated task: ${task.title}`);

  return NextResponse.json(task);
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.task.delete({
    where: {
      id: params.id,
      column: { board: { userId: (session.user as any).id } }
    }
  });

  return NextResponse.json({ success: true });
}
