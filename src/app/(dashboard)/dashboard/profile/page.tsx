export default function ProfilePage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-2">View and edit your profile information</p>
      </div>

      <div className="space-y-4 max-w-2xl">
        <div className="rounded-lg border border-border/60 bg-card p-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
              <span className="text-2xl font-semibold text-primary">U</span>
            </div>
            <div>
              <h3 className="font-semibold">User Profile</h3>
              <p className="text-sm text-muted-foreground">user@example.com</p>
            </div>
          </div>
        </div>

        <div className="rounded-lg border border-border/60 bg-card p-6">
          <h3 className="font-semibold mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <p className="text-sm text-muted-foreground mt-1">Your full name</p>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-sm text-muted-foreground mt-1">user@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
