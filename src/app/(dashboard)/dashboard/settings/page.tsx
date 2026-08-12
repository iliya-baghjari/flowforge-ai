export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground mt-2">Manage your account and preferences</p>
      </div>

      <div className="space-y-4 max-w-2xl">
        <div className="rounded-lg border border-border/60 bg-card p-6">
          <h3 className="font-semibold">Account Settings</h3>
          <p className="text-sm text-muted-foreground mt-2">Configure your account preferences</p>
        </div>

        <div className="rounded-lg border border-border/60 bg-card p-6">
          <h3 className="font-semibold">Notifications</h3>
          <p className="text-sm text-muted-foreground mt-2">Manage notification preferences</p>
        </div>

        <div className="rounded-lg border border-border/60 bg-card p-6">
          <h3 className="font-semibold">Privacy & Security</h3>
          <p className="text-sm text-muted-foreground mt-2">Control your privacy settings</p>
        </div>
      </div>
    </div>
  );
}
