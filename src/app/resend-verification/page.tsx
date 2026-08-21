import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { ResendVerificationForm } from "@/components/auth/resend-verification-form";

export const metadata: Metadata = {
  title: "Verify email",
  description: "Resend your FlowForge AI email verification link to continue accessing your workspace.",
};

export default function ResendVerificationPage() {
  return (
    <AuthShell
      title="Resend verification email"
      subtitle="Enter your email and we'll send a new verification link."
      footerText="Already verified?"
      footerLinkHref="/login"
      footerLinkLabel="Sign in"
    >
      <ResendVerificationForm />
    </AuthShell>
  );
}
