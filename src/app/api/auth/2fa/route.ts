import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { verifyTwoFactorToken, generateOtpauthUrl, generateQrCodeDataURL } from "@/lib/totp";

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

    // If valid and not already enabled, enable it
    if (!user.twoFactorEnabled) {
      await prisma.user.update({
        where: { id: user.id },
        data: { twoFactorEnabled: true }
      });
    }

    const response = NextResponse.json({ success: true });

    // Set 2FA verified cookie
    response.cookies.set('zf_2fa_verified', 'true', {
        httpOnly: true,
        secure: process.env.NODE_VERSION === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24, // 24 hours
        path: '/',
    });

    return response;
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
      select: { twoFactorSecret: true, email: true, twoFactorEnabled: true }
    });

    if (!user || !user.twoFactorSecret) {
      return NextResponse.json({ error: "User not found" }, { status: 400 });
    }

    // If 2FA is already enabled, we don't show the secret/QR code
    if (user.twoFactorEnabled) {
      return NextResponse.json({ isEnabled: true });
    }

    const otpauthUrl = generateOtpauthUrl(user.email || "user@zenflow.com", user.twoFactorSecret);
    const qrCode = await generateQrCodeDataURL(otpauthUrl);

    return NextResponse.json({
      secret: user.twoFactorSecret,
      qrCode,
      isEnabled: false
    });
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
