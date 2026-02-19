// src/lib/utils/apiAuth.ts
// A reusable helper to extract the authenticated user from the session.
// Eliminates the repetitive 4-line auth check boilerplate from every route.

import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils/auth.config";
import { NextResponse } from "next/server";

/**
 * Gets the authenticated user's ID from the session.
 * Returns the userId string if authenticated, or a NextResponse 401 error if not.
 *
 * Usage in API routes:
 * ```ts
 * const authResult = await getAuthUserId();
 * if (authResult instanceof NextResponse) return authResult; // 401
 * const userId = authResult; // string
 * ```
 */
export async function getAuthUserId(): Promise<string | NextResponse> {
  const session = await getServerSession(authOptions);

  if (!session || !session.user || !session.user.id) {
    return NextResponse.json(
      { success: false, error: "Unauthorized" },
      { status: 401 }
    );
  }

  return session.user.id;
}
