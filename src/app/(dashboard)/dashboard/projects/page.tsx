export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground mt-2">Manage and view all your projects</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* Placeholder for projects */}
        <div className="rounded-lg border border-border/60 bg-card p-6">
          <h3 className="font-semibold">Project 1</h3>
          <p className="text-sm text-muted-foreground mt-2">Coming soon...</p>
        </div>
      </div>
    </div>
  );
}
