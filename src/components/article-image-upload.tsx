import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Upload, Check } from "lucide-react";
import { uploadArticleImage } from "@/lib/article-images.functions";

export function ArticleImageUpload({ id, target, hasImage, onSaved }: { id: string; target: "articles" | "review_queue"; hasImage: boolean; onSaved: () => void }) {
  const upload = useServerFn(uploadArticleImage);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  return <div className="min-w-0">
    <label className="inline-flex cursor-pointer items-center gap-2 rounded-md border border-input px-3 py-2 text-xs text-muted-foreground focus-within:ring-2 focus-within:ring-primary">
      {hasImage ? <Check size={14} /> : <Upload size={14} />}
      {busy ? "Uploading…" : hasImage ? "Replace image" : "Upload header image"}
      <input aria-label="Upload header image" type="file" accept="image/jpeg,image/png,image/webp" disabled={busy} className="sr-only" onChange={async (event) => {
        const file = event.target.files?.[0];
        if (!file) return;
        const input = event.target;
        setError(""); setBusy(true);
        try {
          if (file.size > 6 * 1024 * 1024) throw new Error("Image must be smaller than 6 MB");
          const bitmap = await createImageBitmap(file);
          const valid = bitmap.width >= 1200 && bitmap.width / bitmap.height >= 1.4 && bitmap.width / bitmap.height <= 2.4;
          bitmap.close();
          if (!valid) throw new Error("Choose a landscape image at least 1200 pixels wide");
          const bytes = new Uint8Array(await file.arrayBuffer());
          let binary = "";
          for (let i=0; i<bytes.length; i+=8192) binary += String.fromCharCode(...bytes.subarray(i,i+8192));
          await upload({ data: { id, target, bytes: btoa(binary) } });
          onSaved();
        } catch (e) { setError(e instanceof Error ? e.message : "Upload failed"); }
        finally { setBusy(false); input.value=""; }
      }} />
    </label>
    {error && <p role="alert" className="mt-2 max-w-sm text-xs text-destructive">{error}</p>}
  </div>;
}