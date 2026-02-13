import { prisma } from "@/lib/db/prisma";
import { NextRequest, NextResponse } from "next/server";
import { generateRefreshToken, hashPassword } from "@/lib/utils/auth";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, password } = body;

    if (!name || !email || !password)
      return NextResponse.json(
        { message: "all fields required!" },
        { status: 400 },
      );

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser)
      return NextResponse.json(
        { message: "User already exists" },
        { status: 404 },
      );

    const hashedPassword = await hashPassword(password);
    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        portfolios:true
      },
    });

    const refreshToken = generateRefreshToken({
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        token: refreshToken,
        user,
      },
      { status: 201 },
    );
  } catch (error) {

    console.log(error)

    return NextResponse.json(
      {
        success: false,
        message: "failed creating the user!",
      },
      { status: 500 },
    );
  }
}
