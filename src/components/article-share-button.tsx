import { useEffect, useRef, useState } from "react";
import { Check, Share2 } from "lucide-react";

import { Button } from "@/components/ui/button";

export function ArticleShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  async function share() {
    const url = window.location.href;
    const isMobile = window.matchMedia("(pointer: coarse)").matches;

    if (isMobile && navigator.share) {
      try {
        await navigator.share({ title: `${title} — Telyra`, url });
        return;
      } catch (error) {
        if (error instanceof DOMException && error.name === "AbortError") return;
      }
    }

    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("textarea");
      input.value = url;
      input.style.position = "fixed";
      input.style.opacity = "0";
      document.body.appendChild(input);
      input.select();
      document.execCommand("copy");
      input.remove();
    }

    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 1800);
  }

  return (
    <span className="relative ml-auto inline-flex shrink-0">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="size-8 rounded-full border border-foreground/10 text-muted-foreground hover:text-foreground"
        onClick={share}
        aria-label="Share this article"
      >
        {copied ? <Check aria-hidden /> : <Share2 aria-hidden />}
      </Button>
      <span
        role="status"
        aria-live="polite"
        className={`share-tooltip ${copied ? "share-tooltip-visible" : ""}`}
      >
        Link copied!
      </span>
    </span>
  );
}