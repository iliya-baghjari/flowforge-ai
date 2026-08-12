import NextAuth, { type DefaultSession } from "next-auth";
import { getServerSession } from "next-auth/next";
import { PrismaAdapter } from "@auth/prisma-adapter";
import Google from "next-auth/providers/google";
import GitHub from "next-auth/providers/github";
import Credentials from "next-auth/providers/credentials";
import bcrypt from "bcryptjs";

import { getPrisma } from "@/lib/prisma";

declare module "next-auth" {
  interface Session {
    user: DefaultSession["user"] & {
      id: string;
      emailVerified?: Date | null;
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    id?: string;
    accessToken?: string;
    provider?: string;
    emailVerified?: Date | null;
  }
}

const prisma = getPrisma();

export const authConfig = {
  adapter: prisma ? PrismaAdapter(prisma) : undefined,
  session: { strategy: "jwt" as const },
  providers: [
    Credentials({
      name: "Credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials.password) {
          throw new Error("Email and password are required.");
        }

        if (!prisma) {
          throw new Error("Database is not configured yet. Please configure DATABASE_URL first.");
        }

        const user = await prisma.user.findUnique({
          where: { email: String(credentials.email) },
        });

        if (!user?.password) {
          throw new Error("Invalid email or password.");
        }

        const validPassword = await bcrypt.compare(
          String(credentials.password),
          user.password,
        );

        if (!validPassword) {
          throw new Error("Invalid email or password.");
        }

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          image: user.image,
        };
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
    async jwt({ token, user, trigger }: { token: any; user?: any; trigger?: string }) {
      if (user) {
        token.id = user.id;
        token.email = user.email;
        token.name = user.name;
        token.picture = user.image;
        token.emailVerified = user.emailVerified;
      }

      if (trigger === "update") {
        if (!prisma) {
          return token;
        }

        const email = typeof token.email === "string" ? token.email : undefined;
        const dbUser = await prisma.user.findUnique({
          where: { email },
        });

        if (dbUser) {
          token.id = dbUser.id;
          token.email = dbUser.email;
          token.name = dbUser.name;
          token.picture = dbUser.image;
          token.emailVerified = dbUser.emailVerified;
        }
      }

      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (session.user) {
        session.user.id = token.id as string;
        session.user.name = token.name as string | null;
        session.user.emailVerified = token.emailVerified as Date | null;
        session.user.email = token.email as string | null;
        session.user.image = token.picture as string | null;
      }

      return session;
    },
    async signIn() {
      return true;
    },
    async redirect({ url, baseUrl }: { url: string; baseUrl: string }) {
      if (url.startsWith("/")) return `${baseUrl}${url}`;
      if (new URL(url).origin === baseUrl) return url;
      return baseUrl;
    },
  },
};

const authHandler = NextAuth(authConfig);

export const auth = () => getServerSession(authConfig);

export async function signOut() {
  return await auth();
}

export const { GET, POST } = authHandler as unknown as {
  GET: typeof authHandler;
  POST: typeof authHandler;
};
