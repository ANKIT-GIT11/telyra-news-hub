import { useState } from "react";

/** Renders exactly one image per story; falls back to the abstract graphic if missing or broken. */
export function ArticleImage({
  src, alt, width, height, className, lazy,
}: { src: string; alt: string; seed: string; category?: string; width: number; height: number; className?: string; lazy?: boolean }) {
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  if (!src || failedSrc === src) return <div role="status" className={`flex items-center justify-center bg-muted text-xs text-muted-foreground ${className ?? ""}`}>Image unavailable</div>;

  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={lazy ? "lazy" : undefined}
      onError={() => setFailedSrc(src)}
      className={`object-cover ${className ?? ""}`}
    />
  );
}
