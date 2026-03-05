import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const entityId = searchParams.get('entityId');

  const activities = await prisma.activityLog.findMany({
    where: {
        entityId: entityId || undefined,
        userId: (session.user as any).id
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  return NextResponse.json(activities);
}
