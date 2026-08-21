import * as Sentry from "@sentry/nextjs";

const sentryDsn =
  process.env.NEXT_PUBLIC_SENTRY_DSN ?? process.env.SENTRY_DSN ?? "";

export function reportError(
  error: unknown,
  context?: Record<string, unknown>,
): void {
  if (!sentryDsn) {
    console.error("Unhandled app error:", error, context ?? {});
    return;
  }

  Sentry.captureException(error, {
    extra: context,
  });
}
