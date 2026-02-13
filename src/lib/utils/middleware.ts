import { NextRequest, NextResponse } from "next/server";
import { verifyAccessToken } from "./auth";

export async function authMiddleware(
  request: NextRequest,
): Promise<{ userId: string; email: string } | NextResponse> {
  try {
    console.log("middleware running...");

    const authHeader = request.headers.get("authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return NextResponse.json(
        { error: "Authorization header missing" },
        { status: 401 },
      );
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return NextResponse.json(
        { error: "Token not provided" },
        { status: 401 },
      );
    }

    const decoded = verifyAccessToken(token);

    console.log(decoded);

    if (!decoded) {
      return NextResponse.json(
        { error: "Invalid or expired token" },
        { status: 401 },
      );
    }

    return decoded;

    // const requestHeaders = new Headers(request.headers);
    // requestHeaders.set("userId", decoded.userId.toString());
    // requestHeaders.set("email", decoded.email);

    // return NextResponse.next({
    //   request: {
    //     headers: requestHeaders,
    //   },
    // });
  } catch (error) {
    console.error("Middleware error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed authenticating the user!",
      },
      { status: 500 },
    );
  }
}

export const config = {
  matcher: [
    "/api/portfolios/:path*",
    "api/investments/:path*",
    "api/investments/:path*",
    "api/dashboard/:path*",
    "api/search/:path*",
  ],
};

interface customError extends Error {
  statusCode?: number;
}

export const errorHandlerMiddleware = async (
  err: customError,
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
