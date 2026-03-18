"use client";

import { useRef, useState, useEffect } from "react";

const STORAGE_KEY = "automarketer_profile_image";

export default function ProfileImage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setImageUrl(stored);
    }
  }, []);

  async function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("image", file);

      const res = await fetch("/api/profile/image", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? `Upload failed (${res.status})`);
      }

      localStorage.setItem(STORAGE_KEY, data.imageUrl);
      setImageUrl(data.imageUrl);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Upload failed.");
    } finally {
      setUploading(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  return (
    <div className="relative flex flex-col items-center gap-1">
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="group relative w-10 h-10 rounded-full overflow-hidden border-2 border-violet-500/60 hover:border-violet-400 focus:outline-none focus:ring-2 focus:ring-violet-500 transition-colors disabled:opacity-60"
        aria-label="Update profile image"
        title="Click to update profile image"
      >
        {imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={imageUrl}
            alt="Profile"
            className="w-full h-full object-cover"
          />
        ) : (
          <span className="flex items-center justify-center w-full h-full bg-violet-900/60 text-violet-300 text-sm font-bold select-none">
            U
          </span>
        )}
        <span className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity text-white text-xs font-medium">
          {uploading ? "…" : "Edit"}
        </span>
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/gif,image/webp"
        className="sr-only"
        onChange={handleFileChange}
        aria-hidden="true"
      />

      {error && (
        <p className="absolute top-12 right-0 w-48 text-xs text-red-400 bg-[#1c1c2e] border border-red-700/50 rounded-lg px-2 py-1 shadow-lg z-10">
          {error}
        </p>
      )}
    </div>
  );
}
