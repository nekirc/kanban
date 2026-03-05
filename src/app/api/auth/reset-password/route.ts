import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { comparePassword, hashPassword } from "@/lib/password";
import { randomBytes } from "crypto";

export async function POST(req: Request) {
  try {
    const { email } = await req.json();

    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      // Return success even if user not found for security
      return NextResponse.json({ success: true });
    }

    const token = randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 3600000); // 1 hour

    await prisma.resetToken.create({
      data: {
        token,
        userId: user.id,
        expiresAt
      }
    });

    // In a real app, send email here
    console.log(`Password reset token for ${email}: ${token}`);

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
    try {
        const { token, password } = await req.json();

        const resetToken = await prisma.resetToken.findUnique({
            where: { token },
            include: { user: true }
        });

        if (!resetToken || resetToken.expiresAt < new Date()) {
            return NextResponse.json({ error: "Invalid or expired token" }, { status: 400 });
        }

        const hashedPassword = await hashPassword(password);

        await prisma.user.update({
            where: { id: resetToken.userId },
            data: { password: hashedPassword }
        });

        await prisma.resetToken.delete({
            where: { id: resetToken.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        return NextResponse.json({ error: "Internal server error" }, { status: 500 });
    }
}
