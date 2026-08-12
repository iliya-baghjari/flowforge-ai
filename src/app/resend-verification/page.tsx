import { AuthShell } from "@/components/auth/auth-shell";
import { ResendVerificationForm } from "@/components/auth/resend-verification-form";

export default function ResendVerificationPage() {
  return (
    <AuthShell>
      <ResendVerificationForm />
    </AuthShell>
  );
}
