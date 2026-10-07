import { useEffect, useRef, useState } from "react";
import { Check, Share2, Copy, Mail, MessageCircle, Send, Linkedin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";

export function ArticleShareButton({ title }: { title: string }) {
  const [copied, setCopied] = useState(false);
  const [url, setUrl] = useState("");
  const [error, setError] = useState("");
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
  }, []);

  async function copyLink() {
    setError("");
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      const input = document.createElement("textarea");
      input.value = url;
      input.className = "sr-only";
      document.body.appendChild(input);
      input.select();
      const success = document.execCommand("copy");
      input.remove();
      if (!success) { setError("Couldn't copy the link. Select and copy it below."); return; }
    }

    setCopied(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setCopied(false), 1800);
  }

  const text = `${title} — Telyra`;
  const destinations = [
    { label: "X / Twitter", icon: <span aria-hidden className="text-base font-semibold">𝕏</span>, href: `https://twitter.com/intent/tweet?${new URLSearchParams({ text, url })}` },
    { label: "LinkedIn", icon: <Linkedin aria-hidden />, href: `https://www.linkedin.com/sharing/share-offsite/?${new URLSearchParams({ url })}` },
    { label: "WhatsApp", icon: <MessageCircle aria-hidden />, href: `https://wa.me/?${new URLSearchParams({ text: `${text}\n${url}` })}` },
    { label: "Telegram", icon: <Send aria-hidden />, href: `https://t.me/share/url?${new URLSearchParams({ url, text })}` },
    { label: "Gmail", icon: <Mail aria-hidden />, href: `https://mail.google.com/mail/?${new URLSearchParams({ view: "cm", fs: "1", su: text, body: `${text}\n\n${url}` })}` },
  ];

  return (
    <Dialog onOpenChange={(open) => { if (open) { setUrl(window.location.href); setCopied(false); setError(""); } }}>
    <DialogTrigger asChild>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="ml-auto size-8 rounded-full border border-foreground/10 text-muted-foreground hover:text-foreground"
        aria-label="Share this article"
      >
        <Share2 aria-hidden />
      </Button>
    </DialogTrigger>
    <DialogContent className="dark share-modal max-w-[calc(100%-2rem)] rounded-lg border-border bg-popover text-popover-foreground sm:max-w-md">
      <DialogHeader className="pr-6 text-left">
        <DialogTitle className="font-display text-2xl tracking-normal">Share this story</DialogTitle>
        <DialogDescription className="mt-2 line-clamp-3 text-sm leading-relaxed">{title}</DialogDescription>
      </DialogHeader>
      <div className="grid grid-cols-2 gap-2">
        {destinations.map((destination) => <Button key={destination.label} asChild variant="outline" className="h-12 justify-start border-border bg-secondary text-secondary-foreground hover:bg-accent">
          <a href={destination.href} target="_blank" rel="noopener noreferrer">{destination.icon}{destination.label}</a>
        </Button>)}
      </div>
      <div className="border-t border-border pt-4">
        <input aria-label="Article URL" readOnly value={url} onFocus={(e) => e.target.select()} className="mb-3 w-full rounded-md border border-input bg-background p-3 text-xs text-muted-foreground" />
        <div className="relative">
          <Button onClick={copyLink} className="w-full">{copied ? <Check aria-hidden /> : <Copy aria-hidden />}Copy Link</Button>
      <span
        role="status"
        aria-live="polite"
        className={`share-tooltip ${copied ? "share-tooltip-visible" : ""}`}
      >
        Link copied!
      </span>
        </div>
        {error && <p role="alert" className="mt-2 text-xs text-destructive">{error}</p>}
      </div>
    </DialogContent>
    </Dialog>
  );
}