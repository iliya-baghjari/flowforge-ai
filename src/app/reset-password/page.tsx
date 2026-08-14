import { AuthShell } from "@/components/auth/auth-shell";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

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
