import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { filename, url, size, type, taskId } = await req.json();

  const attachment = await prisma.attachment.create({
    data: {
      filename,
      url,
      size,
      type,
      taskId
    }
  });

  return NextResponse.json(attachment);
}
