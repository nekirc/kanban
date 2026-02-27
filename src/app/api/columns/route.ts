import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, boardId, order } = await req.json();

  const board = await prisma.board.findUnique({
    where: { id: boardId, userId: (session.user as any).id }
  });

  if (!board) {
    return NextResponse.json({ error: "Board not found or unauthorized" }, { status: 404 });
  }

  const column = await prisma.column.create({
    data: {
      title,
      boardId,
      order: order ?? 0,
    }
  });

  return NextResponse.json(column);
}
