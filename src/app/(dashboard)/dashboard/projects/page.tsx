import { ProjectManager } from "@/components/project/project-manager";

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Projects</h1>
        <p className="text-muted-foreground mt-2">
          Create, edit, and archive projects without losing their data.
        </p>
      </div>

      <ProjectManager />
    </div>
  );
}
