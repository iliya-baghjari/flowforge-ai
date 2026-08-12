import { AuthShell } from "@/components/auth/auth-shell";
import { EmailVerificationForm } from "@/components/auth/email-verification-form";

export default function VerifyEmailPage() {
  return (
    <AuthShell>
      <EmailVerificationForm />
    </AuthShell>
  );
}
