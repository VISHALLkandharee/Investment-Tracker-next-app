// src/app/api/auth/register/route.ts
import { prisma } from "@/lib/db/prisma";
import { NextRequest, NextResponse } from "next/server";
import { hashPassword } from "@/lib/utils/auth";
import { registerSchema, formatZodErrors } from "@/lib/validators/schemas";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Validate with Zod
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { success: false, message: formatZodErrors(parsed.error) },
        { status: 400 }
      );
    }

    const { name, email, password } = parsed.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });

    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "An account with this email already exists" },
        { status: 409 } // 409 Conflict is more accurate than 404
      );
    }

    const hashedPassword = await hashPassword(password);

    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: "Account created successfully",
        user,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      { success: false, message: "Failed to create account" },
      { status: 500 }
    );
  }
}
