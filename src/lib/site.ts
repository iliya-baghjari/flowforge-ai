export const DEFAULT_SITE_NAME = "FlowForge AI";
export const DEFAULT_SITE_DESCRIPTION =
  "FlowForge AI is an AI workspace for product teams to plan, ship, and track work with clarity.";

export function getSiteUrl() {
  const configuredUrl =
    process.env.NEXT_PUBLIC_APP_URL ??
    process.env.APP_URL ??
    process.env.VERCEL_URL ??
    "http://localhost:3000";

  const normalizedUrl = configuredUrl.startsWith("http")
    ? configuredUrl
    : `https://${configuredUrl}`;

  return normalizedUrl.replace(/\/$/, "");
}

export function getPublicRoutes() {
  return [
    "/",
    "/login",
    "/register",
    "/forgot-password",
    "/reset-password",
    "/verify-email",
    "/resend-verification",
  ];
}
