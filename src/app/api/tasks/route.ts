import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description, columnId, order, priority } = await req.json();

  const column = await prisma.column.findFirst({
    where: {
      id: columnId,
      board: { userId: (session.user as any).id }
    }
  });

  if (!column) {
    return NextResponse.json({ error: "Column not found or unauthorized" }, { status: 404 });
  }

  const task = await prisma.task.create({
    data: {
      title,
      description,
      columnId,
      order: order ?? 0,
      priority: priority ?? "MEDIUM",
    }
  });

  return NextResponse.json(task);
}
