import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { unlink } from "fs/promises";
import { join } from "path";

export async function DELETE(req: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  const session = await getServerSession(authOptions);
  if (!session || !session.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const attachment = await prisma.attachment.findUnique({
      where: { id: params.id },
    });

    if (!attachment) {
      return NextResponse.json({ error: "Attachment not found" }, { status: 404 });
    }

    // Delete from filesystem
    const filename = attachment.url.split('/').pop();
    if (filename) {
        const filePath = join(process.cwd(), "private", "uploads", filename);
        try {
            await unlink(filePath);
        } catch (e) {
            console.error("File deletion failed:", e);
        }
    }

    // Delete from database
    await prisma.attachment.delete({
      where: { id: params.id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Deletion error:", error);
    return NextResponse.json({ error: "Deletion failed" }, { status: 500 });
  }
}
