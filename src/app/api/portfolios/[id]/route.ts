import { prisma } from "@/lib/db/prisma";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils/auth.config";

//update
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
       return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const { id } = await params;

    const { name } = await request.json();

    if (!name || name.trim() === "") {
      return NextResponse.json(
        { error: "Portfolio name is required" },
        { status: 400 },
      );
    }

    const existing = await prisma.portfolio.findUnique({
      where: {
        id: id,
        userId: userId as string,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Portfolio not found" },
        { status: 404 },
      );
    }

    const portfolio = await prisma.portfolio.update({
      where: { id: id },
      data: { name: name.trim() },
      include: { investments: true },
    });

    return NextResponse.json({
      success: true,
      message: "Portfolio updated successfully",
      portfolio,
    });
  } catch (error) {
    console.error("Update portfolio error:", error);
    return NextResponse.json(
      { error: "Failed updating portfolio | server error" },
      { status: 500 },
    );
  }
}

//get porfolio --one
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
       return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const { id } = await params;

    const portfolio = await prisma.portfolio.findUnique({
      where: {
        id: id,
        userId: userId as string,
      },
      include: {
        investments: {
          orderBy: { purchaseDate: "desc" },
        },
      },
    });

    if (!portfolio) {
      return NextResponse.json(
        { error: "Portfolio not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ id: id, success: true, portfolio });
  } catch (error) {
    console.error("Get portfolio error:", error);
    return NextResponse.json(
      { error: "Failed getting the portfolio | server error" },
      { status: 500 },
    );
  }
}

//delete portfolio --one
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);

    if (!session || !session.user || !session.user.id) {
       return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    const { id } = await params;

    const portfolio = await prisma.portfolio.findUnique({
      where: {
        userId: userId as string,
        id: id,
      },
    });

    if (!portfolio)
      return NextResponse.json(
        {
          success: false,
          message: "porfolio not found",
        },
        { status: 404 },
      );

    console.log("found existing Portfolio");

    await prisma.portfolio.delete({
      where: { id: id, userId: userId as string },
    });

    return NextResponse.json({
      success: true,
      message: "Portfolio deleted successfully",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed deleting the portfolio | server error" },
      { status: 500 },
    );
  }
}
