import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="min-h-screen bg-background">
      <header className="fixed inset-x-0 top-0 z-40 border-b border-border/60 bg-background/80 px-4 py-4 backdrop-blur-xl sm:px-6 lg:px-8">
        <div className="mx-auto flex max-w-7xl items-center justify-between">
          <div className="flex items-center gap-3">
            <Skeleton className="h-10 w-10 rounded-full" />
            <div className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-10 w-24 rounded-full" />
            <Skeleton className="h-10 w-10 rounded-full" />
          </div>
        </div>
      </header>

      <div className="flex">
        <aside className="hidden w-64 flex-col border-r border-border/60 bg-background/70 px-4 py-20 lg:flex">
          <Skeleton className="h-16 w-full rounded-xl" />
          <div className="mt-6 space-y-2">
            {Array.from({ length: 4 }).map((_, index) => (
              <Skeleton key={index} className="h-10 w-full rounded-lg" />
            ))}
          </div>
        </aside>

        <main className="flex-1 px-4 py-20 sm:px-6 lg:px-8">
          <div className="mx-auto flex max-w-7xl flex-col gap-4">
            <Skeleton className="h-48 w-full rounded-2xl" />
            <div className="grid gap-4 xl:grid-cols-[1.7fr_1fr]">
              <Skeleton className="h-40 w-full rounded-2xl" />
              <Skeleton className="h-40 w-full rounded-2xl" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
