import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export const metadata: Metadata = {
  title: "New password",
  description: "Set a new secure password for your FlowForge AI account.",
};

export default function ResetPasswordPage() {
  return (
    <AuthShell
      title="Set a new password"
      subtitle="Choose a strong password for your account."
      footerText="Back to"
      footerLinkHref="/login"
      footerLinkLabel="Sign in"
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
