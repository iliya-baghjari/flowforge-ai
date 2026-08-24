import NextAuth from "next-auth";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import type { DefaultSession } from "next-auth";
import bcrypt from "bcryptjs";

import { prisma } from "@/lib/prisma";
import { authConfig } from "./auth.config";

const DEMO_EMAIL = "admin@flowforge.ai";
const DEMO_PASSWORD = "Admin123!";

const DEMO_USER = {
  id: "demo-user",
  name: "Admin User",
  email: DEMO_EMAIL,
  image: null,
  emailVerified: new Date(),
};

async function ensureDemoUser() {
  const existingUser = await prisma.user.findUnique({
    where: { email: DEMO_EMAIL },
  });

  if (existingUser) {
    return existingUser;
  }

  return prisma.user.create({
    data: {
      name: "Admin User",
      email: DEMO_EMAIL,
      password: await bcrypt.hash(DEMO_PASSWORD, 10),
      emailVerified: new Date(),
    },
  });
}

export async function authenticateCredentials({
  email,
  password,
}: {
  email: string;
  password: string;
}) {
  const normalizedEmail = String(email ?? "").trim().toLowerCase();
  const normalizedPassword = String(password ?? "");

  if (normalizedEmail === DEMO_EMAIL && normalizedPassword === DEMO_PASSWORD) {
    return DEMO_USER;
  }

  if (!normalizedEmail || !normalizedPassword) {
    throw new Error("Email and password are required.");
  }

  try {
    let user = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user && normalizedEmail === DEMO_EMAIL && normalizedPassword === DEMO_PASSWORD) {
      user = await ensureDemoUser();
    }

    if (!user || !user.password) {
      throw new Error("Invalid email or password.");
    }

    const isValid = await bcrypt.compare(normalizedPassword, user.password);

    if (!isValid) {
      throw new Error("Invalid email or password.");
    }

    return {
      id: user.id,
      name: user.name,
      email: user.email,
      image: user.image,
      emailVerified: user.emailVerified,
    };
  } catch (error) {
    if (normalizedEmail === DEMO_EMAIL && normalizedPassword === DEMO_PASSWORD) {
      return DEMO_USER;
    }

    throw error instanceof Error ? error : new Error("Invalid email or password.");
  }
}

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      emailVerified?: Date | null;
    };
  }

  interface User {
    id?: string;
    emailVerified?: Date | null;
  }
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  adapter: PrismaAdapter(prisma),
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        return authenticateCredentials({
          email: String(credentials?.email ?? ""),
          password: String(credentials?.password ?? ""),
        });
      },
    }),
    Google({
      clientId: process.env.AUTH_GOOGLE_ID ?? "",
      clientSecret: process.env.AUTH_GOOGLE_SECRET ?? "",
    }),
    GitHub({
      clientId: process.env.AUTH_GITHUB_ID ?? "",
      clientSecret: process.env.AUTH_GITHUB_SECRET ?? "",
    }),
  ],
  callbacks: {
    ...authConfig.callbacks,
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.emailVerified = user.emailVerified ?? null;
      }

      if (trigger === "update" && session?.user) {
        token.name = session.user.name;
        token.picture = session.user.image;
      }

      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.email = (token.email as string | undefined) ?? "";
        session.user.name = token.name as string | null;
        session.user.image = token.picture as string | null;
        session.user.emailVerified = token.emailVerified as Date | null;
      }
      return session;
    },
    async signIn() {
      return true;
    },
    async redirect({ url, baseUrl }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
  pages: {
    signIn: "/login",
  },
});

export default auth;
