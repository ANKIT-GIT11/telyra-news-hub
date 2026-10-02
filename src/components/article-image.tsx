import { useState } from "react";

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

/** Minimal abstract "circuit" graphic, varied per story so cards don't look identical. */
function TechFallback({ seed, label }: { seed: string; label: string }) {
  const h = hash(seed);
  const nodes = Array.from({ length: 7 }, (_, i) => ({
    x: 60 + ((h >> i) % 9) * 60 + i * 20,
    y: 50 + ((h >> (i + 3)) % 5) * 55,
  }));
  return (
    <svg viewBox="0 0 640 400" role="img" aria-label={label} preserveAspectRatio="xMidYMid slice" className="h-full w-full bg-secondary text-primary">
      <defs>
        <pattern id={`g-${h}`} width="32" height="32" patternUnits="userSpaceOnUse">
          <path d="M32 0H0V32" fill="none" stroke="currentColor" strokeOpacity="0.08" />
        </pattern>
      </defs>
      <rect width="640" height="400" fill={`url(#g-${h})`} />
      <circle cx={420 + (h % 120)} cy={140 + (h % 90)} r="160" fill="currentColor" fillOpacity="0.08" />
      <polyline points={nodes.map((n) => `${n.x},${n.y}`).join(" ")} fill="none" stroke="currentColor" strokeOpacity="0.45" strokeWidth="1.5" />
      {nodes.map((n, i) => (
        <circle key={i} cx={n.x} cy={n.y} r={i % 3 === 0 ? 5 : 3} fill="currentColor" fillOpacity="0.7" />
      ))}
    </svg>
  );
}

/** Renders exactly one image per story; falls back to the abstract graphic if missing or broken. */
export function ArticleImage({
  src, alt, seed, width, height, className, lazy,
}: { src: string; alt: string; seed: string; width: number; height: number; className?: string; lazy?: boolean }) {
  const [failed, setFailed] = useState(false);
  if (!src || failed) {
    return <div className={`overflow-hidden ${className ?? ""}`}><TechFallback seed={seed} label={alt} /></div>;
  }
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      loading={lazy ? "lazy" : undefined}
      onError={() => setFailed(true)}
      className={`object-cover ${className ?? ""}`}
    />
  );
}
