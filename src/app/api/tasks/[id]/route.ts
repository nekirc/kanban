import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, { params }: { params: { id: string } }) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, columnId, order, priority } = await req.json();

  const task = await prisma.task.update({
    where: {
      id: params.id,
      column: { board: { userId: (session.user as any).id } }
    },
    data: {
      title,
      description,
      columnId,
      order,
      priority
    }
  });

  return NextResponse.json(task);
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
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
