import { useState } from "react";
import fallbackAi from "@/assets/fallback-ai.jpg";
import fallbackCommerce from "@/assets/fallback-commerce.jpg";
import fallbackHardware from "@/assets/fallback-hardware.jpg";
import fallbackInfrastructure from "@/assets/fallback-infrastructure.jpg";
import fallbackSecurity from "@/assets/fallback-security.jpg";

const FALLBACKS = {
  AI: fallbackAi,
  Security: fallbackSecurity,
  Hardware: fallbackHardware,
  Commerce: fallbackCommerce,
  Infrastructure: fallbackInfrastructure,
} as const;

type FallbackCategory = keyof typeof FALLBACKS;

const KEYWORDS: Record<FallbackCategory, readonly string[]> = {
  AI: ["ai", "artificial intelligence", "machine learning", "model", "llm", "agent", "robot"],
  Security: ["security", "cyber", "privacy", "breach", "malware", "ransomware", "encryption", "hack"],
  Hardware: ["hardware", "chip", "processor", "gpu", "semiconductor", "device", "computer", "phone"],
  Commerce: ["commerce", "business", "startup", "funding", "market", "finance", "fintech", "retail", "revenue"],
  Infrastructure: ["infrastructure", "cloud", "server", "database", "network", "data center", "platform", "developer", "software"],
};

function fallbackFor(label: string, category?: string) {
  const searchable = `${category ?? ""} ${label}`.toLowerCase();
  const match = (Object.keys(KEYWORDS) as FallbackCategory[]).find((key) =>
    KEYWORDS[key].some((keyword) => searchable.includes(keyword)),
  );

  if (match) return FALLBACKS[match];
  if (category === "Business") return FALLBACKS.Commerce;
  if (category === "World") return FALLBACKS.Security;
  if (category === "Culture") return FALLBACKS.AI;
  return FALLBACKS.Infrastructure;
}

/** Renders exactly one image per story; falls back to the abstract graphic if missing or broken. */
export function ArticleImage({
  src, alt, category, width, height, className, lazy,
}: { src: string; alt: string; seed: string; category?: string; width: number; height: number; className?: string; lazy?: boolean }) {
  const [failed, setFailed] = useState(false);
  const imageSrc = !src || failed ? fallbackFor(alt, category) : src;

  return (
    <img
      src={imageSrc}
      alt={alt}
      width={width}
      height={height}
      loading={lazy ? "lazy" : undefined}
      onError={() => setFailed(true)}
      className={`object-cover ${className ?? ""}`}
    />
  );
}
