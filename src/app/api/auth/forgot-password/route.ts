import { NextRequest, NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";
import { generatePasswordResetToken, sendPasswordResetEmail } from "@/lib/email";

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    const prisma = getPrisma();
    if (!prisma) {
      return NextResponse.json(
        { error: "Database not configured" },
        { status: 500 }
      );
    }

    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { email },
    });

    // Always return success for security reasons (don't reveal if email exists)
    if (!user) {
      return NextResponse.json(
        { 
          success: true,
          message: "If an account exists with this email, you will receive a password reset link." 
        },
        { status: 200 }
      );
    }

    // Generate and send reset token
    const token = await generatePasswordResetToken(email);
    await sendPasswordResetEmail(email, token);

    return NextResponse.json(
      { 
        success: true,
        message: "If an account exists with this email, you will receive a password reset link." 
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      { error: "An error occurred. Please try again." },
      { status: 500 }
    );
  }
}
