"use client"; // ✅ This makes it a Client Component

import { SessionProvider } from "next-auth/react";

export default function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any; // or use the Session type from next-auth
}) {
  return <SessionProvider session={session}>{children}</SessionProvider>;
}