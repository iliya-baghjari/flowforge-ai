"use client";

import * as React from "react";

import { Button } from "@/components/ui/button";
import { reportError } from "@/lib/error-reporting";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  React.useEffect(() => {
    reportError(error, {
      source: "global-error",
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen items-center justify-center bg-background px-4 py-10">
        <div className="w-full max-w-lg rounded-2xl border border-border/60 bg-card p-8 text-center shadow-sm">
          <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
            Error
          </p>
          <h2 className="mt-4 text-3xl font-semibold text-foreground">
            Something went wrong
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            The app hit an unexpected issue while loading this page. You can retry to recover it.
          </p>
          <Button className="mt-6" onClick={() => reset()}>
            Try again
          </Button>
        </div>
      </body>
    </html>
  );
}
