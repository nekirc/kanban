import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function PATCH(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { title, order, wipLimit } = await req.json();

  const column = await prisma.column.update({
    where: {
      id: params.id,
      board: { userId: (session.user as any).id }
    },
    data: { title, order, wipLimit }
  });

  return NextResponse.json(column);
}

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await prisma.column.delete({
    where: {
      id: params.id,
      board: { userId: (session.user as any).id }
    }
  });

  return NextResponse.json({ success: true });
}
