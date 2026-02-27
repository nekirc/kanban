import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTwoFactorToken } from "@/lib/totp";

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { token } = await req.json();
    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
    });

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ error: "2FA not set up" }, { status: 400 });
    }

    const isValid = verifyTwoFactorToken(token, user.twoFactorSecret);

    if (!isValid) {
      return NextResponse.json({ error: "Invalid 2FA code" }, { status: 400 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: (session.user as any).id },
      select: { twoFactorSecret: true, email: true }
    });

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    return NextResponse.json({
      secret: user.twoFactorSecret,
      email: user.email
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
