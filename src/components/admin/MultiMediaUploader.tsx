"use client";

import { useRef, useState } from "react";

export interface UploadedMedia {
  url: string;
  type: "image" | "video";
}

/**
 * Lets the admin select or drop MULTIPLE files in a single action — each
 * one uploads (in parallel) and is appended to the list via onUpload,
 * instead of the old pattern of adding one empty slot and uploading into
 * it at a time.
 */
export function MultiMediaUploader({
  onUpload,
  accept = "image/*,video/mp4,video/webm,video/quicktime",
  label = "Click or drop images / videos — select as many as you like",
}: {
  onUpload: (media: UploadedMedia[]) => void;
  accept?: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState<{ done: number; total: number } | null>(null);
  const [error, setError] = useState<string | null>(null);

  const uploadOne = async (file: File): Promise<UploadedMedia | null> => {
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || `Failed: ${file.name}`);
      return { url: data.url, type: data.type };
    } catch (e: any) {
      setError((prev) => prev ? `${prev}; ${e.message}` : e.message);
      return null;
    }
  };

  const handleFiles = async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    if (files.length === 0) return;
    setUploading(true);
    setError(null);
    setProgress({ done: 0, total: files.length });

    // Upload in parallel but keep results in selection order.
    let done = 0;
    const results = await Promise.all(
      files.map(async (file) => {
        const r = await uploadOne(file);
        done += 1;
        setProgress({ done, total: files.length });
        return r;
      }),
    );

    const successful = results.filter((r): r is UploadedMedia => r !== null);
    if (successful.length) onUpload(successful);

    setUploading(false);
    setProgress(null);
  };

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDrop={(e) => {
          e.preventDefault();
          if (e.dataTransfer.files?.length) void handleFiles(e.dataTransfer.files);
        }}
        onDragOver={(e) => e.preventDefault()}
        className="flex h-28 w-full cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed border-[#d6d9db] bg-[#f7f8f9] text-center hover:border-sage-400"
      >
        {uploading ? (
          <span className="text-xs text-[#9ca3af]">
            Uploading {progress ? `${progress.done}/${progress.total}…` : "…"}
          </span>
        ) : (
          <span className="px-4 text-xs text-[#9ca3af]">{label}</span>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        multiple
        accept={accept}
        className="hidden"
        onChange={(e) => {
          if (e.target.files?.length) void handleFiles(e.target.files);
          e.target.value = "";
        }}
      />
      {error && <p className="mt-1 text-[10px] text-red-500">{error}</p>}
    </div>
  );
}
