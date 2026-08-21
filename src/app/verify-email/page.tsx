import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { EmailVerificationForm } from "@/components/auth/email-verification-form";

export const metadata: Metadata = {
  title: "Confirm email",
  description: "Verify your email address to unlock FlowForge AI workspace access.",
};

export default function VerifyEmailPage() {
  return (
    <AuthShell
      title="Verify your email"
      subtitle="Confirming your email address."
      footerText="Need a new link?"
      footerLinkHref="/resend-verification"
      footerLinkLabel="Resend verification"
    >
      <EmailVerificationForm />
    </AuthShell>
  );
}
