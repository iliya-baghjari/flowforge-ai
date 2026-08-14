import crypto from "crypto";
import { prisma } from "./prisma";

const prisma = prisma();

export async function generateVerificationToken(email: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours

  if (!prisma) {
    throw new Error("Database not configured");
  }

  await prisma.emailVerificationToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return token;
}

export async function generatePasswordResetToken(email: string) {
  const token = crypto.randomBytes(32).toString("hex");
  const expires = new Date(Date.now() + 1 * 60 * 60 * 1000); // 1 hour

  if (!prisma) {
    throw new Error("Database not configured");
  }

  await prisma.passwordResetToken.create({
    data: {
      email,
      token,
      expires,
    },
  });

  return token;
}

export async function verifyToken(token: string, type: "verification" | "reset") {
  if (!prisma) {
    throw new Error("Database not configured");
  }

  if (type === "verification") {
    const verificationToken = await prisma.emailVerificationToken.findUnique({
      where: { token },
    });

    if (!verificationToken) {
      return null;
    }

    if (new Date() > verificationToken.expires) {
      await prisma.emailVerificationToken.delete({
        where: { token },
      });
      return null;
    }

    return verificationToken;
  }

  if (type === "reset") {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return null;
    }

    if (new Date() > resetToken.expires) {
      await prisma.passwordResetToken.delete({
        where: { token },
      });
      return null;
    }

    return resetToken;
  }

  return null;
}

export async function deleteToken(token: string, type: "verification" | "reset") {
  if (!prisma) {
    throw new Error("Database not configured");
  }

  if (type === "verification") {
    await prisma.emailVerificationToken.delete({
      where: { token },
    });
  } else if (type === "reset") {
    await prisma.passwordResetToken.delete({
      where: { token },
    });
  }
}

// Email sending utility (using environment variables for SMTP or similar service)
export async function sendVerificationEmail(email: string, token: string) {
  const verifyUrl = `${process.env.NEXTAUTH_URL}/verify-email?token=${token}`;

  // Mock implementation - Replace with actual email service
  console.log(`Verification email would be sent to ${email}: ${verifyUrl}`);

  // Example using nodemailer (uncomment if installed):
  // const transporter = nodemailer.createTransport({
  //   host: process.env.SMTP_HOST,
  //   port: parseInt(process.env.SMTP_PORT || "587"),
  //   secure: process.env.SMTP_SECURE === "true",
  //   auth: {
  //     user: process.env.SMTP_USER,
  //     pass: process.env.SMTP_PASSWORD,
  //   },
  // });
  //
  // await transporter.sendMail({
  //   from: process.env.SMTP_FROM,
  //   to: email,
  //   subject: "Verify your email",
  //   html: `<a href="${verifyUrl}">Verify your email</a>`,
  // });

  return true;
}

export async function sendPasswordResetEmail(email: string, token: string) {
  const resetUrl = `${process.env.NEXTAUTH_URL}/reset-password?token=${token}`;

  // Mock implementation - Replace with actual email service
  console.log(`Password reset email would be sent to ${email}: ${resetUrl}`);

  return true;
}
