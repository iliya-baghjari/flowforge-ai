import { AuthShell } from "@/components/auth/auth-shell";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthShell
      title="Forgot your password?"
      subtitle="Enter your email and we'll send you a reset link."
      footerText="Remember your password?"
      footerLinkHref="/login"
      footerLinkLabel="Sign in"
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
