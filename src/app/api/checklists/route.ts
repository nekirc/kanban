import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { content, taskId } = await req.json();

  const item = await prisma.checklistItem.create({
    data: {
      content,
      taskId
    }
  });

  return NextResponse.json(item);
}
