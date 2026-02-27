import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const boards = await prisma.board.findMany({
    where: { userId: (session.user as any).id },
    include: {
      columns: {
        include: {
          tasks: {
            orderBy: { order: 'asc' }
          }
        },
        orderBy: { order: 'asc' }
      }
    }
  });

  return NextResponse.json(boards);
}

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, description } = await req.json();

  const board = await prisma.board.create({
    data: {
      title,
      description,
      userId: (session.user as any).id,
      columns: {
        create: [
          { title: "To Do", order: 0 },
          { title: "In Progress", order: 1 },
          { title: "Done", order: 2 },
        ]
      }
    }
  });

  return NextResponse.json(board);
}
