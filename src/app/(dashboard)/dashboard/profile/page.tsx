"use client";

import { useSession } from "next-auth/react";
import { AvatarUpload } from "@/components/auth/avatar-upload";

export default function ProfilePage() {
  const { data: session } = useSession();

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground mt-2">View and edit your profile information</p>
      </div>

      <div className="space-y-4 max-w-2xl">
        <div className="rounded-lg border border-border/60 bg-card p-6">
          <h3 className="font-semibold mb-4">Avatar</h3>
          <AvatarUpload
            currentImage={session?.user?.image}
            onUpload={async (file) => {
              // Upload avatar to your server
              const formData = new FormData();
              formData.append("avatar", file);
              
              const response = await fetch("/api/user/avatar", {
                method: "POST",
                body: formData,
              });

              if (!response.ok) {
                throw new Error("Failed to upload avatar");
              }
            }}
          />
        </div>

        <div className="rounded-lg border border-border/60 bg-card p-6">
          <h3 className="font-semibold mb-4">Personal Information</h3>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Full Name</label>
              <p className="text-sm text-muted-foreground mt-1">{session?.user?.name || "Not provided"}</p>
            </div>
            <div>
              <label className="text-sm font-medium">Email</label>
              <p className="text-sm text-muted-foreground mt-1">{session?.user?.email}</p>
            </div>
            {session?.user?.emailVerified && (
              <div>
                <label className="text-sm font-medium">Email Verified</label>
                <p className="text-sm text-emerald-600 mt-1">✓ Verified on {new Date(session.user.emailVerified).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
