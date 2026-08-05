import Link from "next/link";
import { ArrowLeft, Compass } from "lucide-react";

import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg rounded-2xl border border-border/60 bg-card p-8 text-center shadow-sm">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Compass className="h-7 w-7" />
        </div>
        <p className="mt-6 text-sm font-semibold uppercase tracking-[0.25em] text-muted-foreground">
          404
        </p>
        <h2 className="mt-2 text-3xl font-semibold text-foreground">
          We could not find that page
        </h2>
        <p className="mt-3 text-sm leading-7 text-muted-foreground">
          The route you requested may have moved, or it never existed. Return to the dashboard to continue working.
        </p>
        <Link href="/dashboard">
          <Button className="mt-6">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to dashboard
          </Button>
        </Link>
      </div>
    </div>
  );
}
