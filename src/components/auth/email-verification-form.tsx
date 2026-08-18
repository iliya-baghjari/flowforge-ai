"use client";

import { useCallback, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export function EmailVerificationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [verifying, setVerifying] = useState(true);
  const [verified, setVerified] = useState(false);
  const [error, setError] = useState("");

  const verifyEmail = useCallback(async (verificationToken: string) => {
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: verificationToken }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Verification failed");
        setVerifying(false);
        return;
      }

      setVerified(true);
      setTimeout(() => router.push("/login"), 2000);
    } catch (err) {
      setError("An error occurred during verification");
      console.error(err);
    } finally {
      setVerifying(false);
    }
  }, [router]);

  useEffect(() => {
    if (!token) {
      setVerifying(false);
      setError("Invalid or missing verification token");
      return;
    }

    void verifyEmail(token);
  }, [token, verifyEmail]);

  return (
    <div className="space-y-6 text-center">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold tracking-tight">Email Verification</h1>
      </div>

      {verifying && (
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
          </div>
          <p className="text-muted-foreground">Verifying your email...</p>
        </div>
      )}

      {verified && !verifying && (
        <div className="space-y-3">
          <div className="flex justify-center">
            <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <span className="text-2xl text-emerald-600">✓</span>
            </div>
          </div>
          <p className="text-emerald-600 font-medium">Email verified successfully!</p>
          <p className="text-muted-foreground text-sm">Redirecting to login...</p>
        </div>
      )}

      {error && !verifying && (
        <div className="space-y-3">
          <div className="rounded-lg bg-destructive/10 p-3 text-destructive">
            {error}
          </div>
          <div className="space-y-2">
            <p className="text-sm text-muted-foreground">
              Need a new verification link?
            </p>
            <Link href="/resend-verification" className="text-primary hover:underline">
              Resend verification email
            </Link>
          </div>
        </div>
      )}

      <Link href="/login" className="inline-block text-primary hover:underline text-sm">
        Back to Login
      </Link>
    </div>
  );
}
