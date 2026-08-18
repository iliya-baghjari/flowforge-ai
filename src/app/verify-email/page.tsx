import { AuthShell } from "@/components/auth/auth-shell";
import { EmailVerificationForm } from "@/components/auth/email-verification-form";

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
