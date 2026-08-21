import type { Metadata } from "next";

import { AuthShell } from "@/components/auth/auth-shell";
import { LoginForm } from "@/components/auth/login-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Access your FlowForge AI workspace, projects, and team activity.",
};

export default function LoginPage() {
  return (
    <AuthShell
      title="Sign in"
      subtitle="Access your workspace, projects, and team activity in one place."
      footerText="New here?"
      footerLinkHref="/register"
      footerLinkLabel="Create an account"
    >
      <LoginForm />
    </AuthShell>
  );
}
