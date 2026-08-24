"use client";

import type { Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

export default function AuthProvider({
  children,
  session,
}: {
  children: React.ReactNode;
  session: Session | null;
}) {
  return (
    <SessionProvider
      session={session ?? undefined}
      refetchOnWindowFocus={false}
      refetchWhenOffline={false}
      refetchInterval={0}
    >
      {children}
    </SessionProvider>
  );
}