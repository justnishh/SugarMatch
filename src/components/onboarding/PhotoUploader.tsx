"use client";

import { useRef } from "react";
import { Plus, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface PhotoUploaderProps {
  photos: File[];
  onAdd: (files: File[]) => void;
  onRemove: (index: number) => void;
  maxPhotos?: number;
}

export function PhotoUploader({
  photos,
  onAdd,
  onRemove,
  maxPhotos = 6,
}: PhotoUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    const remaining = maxPhotos - photos.length;
    onAdd(files.slice(0, remaining));
    if (inputRef.current) inputRef.current.value = "";
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-muted-foreground">
        Add at least 2 photos (max {maxPhotos})
      </p>
      <div className="grid grid-cols-3 gap-3">
        {photos.map((photo, i) => (
          <div key={i} className="relative aspect-[3/4] rounded-xl overflow-hidden bg-muted">
            <img
              src={URL.createObjectURL(photo)}
              alt={`Photo ${i + 1}`}
              className="w-full h-full object-cover"
            />
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute top-1.5 right-1.5 w-7 h-7 bg-black/50 rounded-full flex items-center justify-center"
            >
              <X className="w-4 h-4 text-white" />
            </button>
            {i === 0 && (
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent p-2">
                <span className="text-white text-xs font-medium">Main photo</span>
              </div>
            )}
          </div>
        ))}

        {photos.length < maxPhotos && (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            className={cn(
              "aspect-[3/4] rounded-xl border-2 border-dashed border-rose-200 flex flex-col items-center justify-center gap-2 hover:border-rose-400 hover:bg-rose-50/50 transition-all",
              photos.length < 2 && "border-rose-300 animate-pulse"
            )}
          >
            <Plus className="w-8 h-8 text-rose-400" />
            <span className="text-xs text-muted-foreground">Add photo</span>
          </button>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
