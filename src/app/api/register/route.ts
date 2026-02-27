import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { generateTwoFactorSecret } from "@/lib/totp";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: "User already exists" }, { status: 400 });
    }

    const hashedPassword = await hashPassword(password);
    const twoFactorSecret = generateTwoFactorSecret();

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        twoFactorSecret,
      },
    });

    return NextResponse.json({
      message: "User created successfully",
      userId: user.id
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
