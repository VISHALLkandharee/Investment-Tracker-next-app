import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { comparePassword, generateAccessToken } from "@/lib/utils/auth";

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password)
      return NextResponse.json(
        { message: "Email and password are required!" },
        { status: 400 },
      );

    const user = await prisma.user.findFirst({
      where: { email },

    });

    if (!user)
      return NextResponse.json(
        { message: "User not found with these credentials" },
        { status: 404 },
      );

    const checkPAssword = await comparePassword(password, user.password);

    if (!checkPAssword)
      return NextResponse.json(
        { message: "Invalid credentials" },
        { status: 401 },
      );


    const accessToken = generateAccessToken({
      userId: user.id,
      email: user.email,
    });

    return NextResponse.json({
      message: "Logged in successfully",
      success: true,
      token: accessToken,
      user,
    });
  } catch (error) {
    console.log("Failed loggin user in..", error);
    return NextResponse.json(
      { message: "Failed loggin user in.." },
      { status: 500 },
    );
  }
}
