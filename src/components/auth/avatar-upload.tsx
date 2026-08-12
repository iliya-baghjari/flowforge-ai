"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Upload, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface AvatarUploadProps {
  currentImage?: string | null;
  onUpload?: (file: File) => Promise<void>;
  disabled?: boolean;
}

export function AvatarUpload({ currentImage, onUpload, disabled }: AvatarUploadProps) {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("File size must be less than 5MB");
      return;
    }

    // Validate file type
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
      setError("Only JPEG, PNG, and WebP images are allowed");
      return;
    }

    // Create preview
    const reader = new FileReader();
    reader.onload = (event) => {
      setPreview(event.target?.result as string);
      setError("");

      // Upload if handler provided
      if (onUpload) {
        uploadFile(file);
      }
    };
    reader.readAsDataURL(file);
  };

  async function uploadFile(file: File) {
    setLoading(true);
    try {
      if (onUpload) {
        await onUpload(file);
      }
    } catch (err) {
      setError("Upload failed. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  const displayImage = preview || currentImage;

  return (
    <div className="space-y-4">
      <div className="flex flex-col items-center gap-4">
        {displayImage ? (
          <div className="relative h-32 w-32">
            <Image
              src={displayImage}
              alt="Avatar"
              fill
              className="rounded-full object-cover"
            />
            {!loading && (
              <button
                type="button"
                onClick={() => setPreview(null)}
                className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-white hover:bg-destructive/90"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
        ) : (
          <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center">
            <Upload className="h-8 w-8 text-muted-foreground" />
          </div>
        )}

        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          onChange={handleFileSelect}
          className="hidden"
          disabled={disabled || loading}
        />

        <Button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled || loading}
          variant="outline"
        >
          {loading ? "Uploading..." : "Upload Avatar"}
        </Button>
      </div>

      {error && (
        <div className="rounded-lg bg-destructive/10 p-3 text-sm text-destructive text-center">
          {error}
        </div>
      )}

      <div className="text-center text-xs text-muted-foreground">
        <p>JPEG, PNG, or WebP • Max 5MB</p>
      </div>
    </div>
  );
}
