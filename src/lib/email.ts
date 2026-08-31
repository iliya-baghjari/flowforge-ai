import crypto from "crypto";
import nodemailer from "nodemailer";

import { prisma } from "@/lib/prisma";

function getBaseUrl() {
  return (
    process.env.NEXTAUTH_URL ??
    process.env.AUTH_URL ??
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    "http://localhost:3000"
  ).replace(/\/$/, "");
}

function getSmtpTransport() {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const password = process.env.SMTP_PASSWORD;

  if (!host || !user || !password) {
    if (process.env.NODE_ENV === "production") {
      throw new Error(
        "SMTP configuration is missing. Set SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD, and SMTP_FROM before sending emails."
      );
    }

    return null;
  }

  return nodemailer.createTransport({
    host,
    port: Number(process.env.SMTP_PORT ?? "587"),
    secure: process.env.SMTP_SECURE === "true",
    auth: {
      user,
      pass: password,
    },
  });
}

async function sendAuthEmail({
  email,
  token,
  subject,
  path,
  title,
}: {
  email: string;
  token: string;
  subject: string;
  path: string;
  title: string;
}) {
  const url = `${getBaseUrl()}/${path}?token=${token}`;
  const from = process.env.SMTP_FROM ?? process.env.SMTP_USER ?? "noreply@localhost";
  const transporter = getSmtpTransport();

  if (!transporter) {
    console.warn(
      `Email delivery is not configured. ${title} link for ${email}: ${url}`
    );
    return true;
  }

  await transporter.sendMail({
    from,
    to: email,
    subject,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #111827;">
        <p>Hello,</p>
        <p>Click the link below to ${title.toLowerCase()}:</p>
        <p><a href="${url}">${url}</a></p>
        <p>If you did not request this, you can ignore this email.</p>
      </div>
    `,
  });

  return true;
}

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

export async function sendVerificationEmail(email: string, token: string) {
  return sendAuthEmail({
    email,
    token,
    subject: "Verify your email",
    path: "verify-email",
    title: "verify your email",
  });
}

export async function sendPasswordResetEmail(email: string, token: string) {
  return sendAuthEmail({
    email,
    token,
    subject: "Reset your password",
    path: "reset-password",
    title: "reset your password",
  });
}
