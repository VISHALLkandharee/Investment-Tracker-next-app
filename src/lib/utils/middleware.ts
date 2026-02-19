import { NextRequest, NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export async function authMiddleware(
  request: NextRequest,
): Promise<{ userId: string; email: string } | NextResponse> {
  try {
    console.log("API middleware running...");

    // ✅ Get NextAuth token instead of Bearer token
    const token = await getToken({ 
      req: request,
      secret: process.env.NEXTAUTH_SECRET 
    });

    console.log("NextAuth token:", token);

    if (!token || !token.email) {
      return NextResponse.json(
        { error: "Unauthorized - Please login" },
        { status: 401 },
      );
    }

    // Return user info from NextAuth token
    return {
      userId: token.id as string,
      email: token.email as string,
    };

  } catch (error) {
    console.error("API Middleware error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Authentication failed",
      },
      { status: 500 },
    );
  }
}



interface CustomError extends Error {
  statusCode?: number;
}

export const errorHandlerMiddleware = async (
  err: CustomError,
) => {
  const statusCode = err.statusCode || 500;
  const message =
    err.message || "An error occurred while processing the request.";

  console.error("Error in middleware:", err);
  return NextResponse.json(
    {
      success: false,
      message,
    },
    { status: statusCode },
  );
};