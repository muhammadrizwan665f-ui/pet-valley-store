"use client";

import { useRef, useState } from "react";

export function MediaUploader({
  value,
  onChange,
  accept = "image/*,video/mp4,video/webm,video/quicktime",
  className = "",
}: {
  value?: { url: string; type: "image" | "video" };
  onChange: (media: { url: string; type: "image" | "video" }) => void;
  accept?: string;
  className?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange({ url: data.url, type: data.type });
    } catch (e: any) {
      setError(e.message || "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={className}>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={(e) => {
          e.preventDefault();
          const file = e.dataTransfer.files?.[0];
          if (file) void handleFile(file);
        }}
        onDragOver={(e) => e.preventDefault()}
        className="flex h-28 w-28 shrink-0 cursor-pointer flex-col items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-[#d6d9db] bg-[#f7f8f9] text-center hover:border-sage-400"
      >
        {uploading ? (
          <span className="text-xs text-[#9ca3af]">Uploading…</span>
        ) : value?.url ? (
          value.type === "video" ? (
            <video src={value.url} className="h-full w-full object-cover" muted />
          ) : (
            <img src={value.url} alt="" className="h-full w-full object-cover" />
          )
        ) : (
          <span className="px-2 text-xs text-[#9ca3af]">Click or drop image / video</span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void handleFile(file);
          e.target.value = "";
        }}
      />
      {error && <p className="mt-1 max-w-[7rem] text-[10px] text-red-500">{error}</p>}
    </div>
  );
}
