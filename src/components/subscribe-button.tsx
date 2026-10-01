import { useState } from "react";
import { z } from "zod";
import { toast } from "sonner";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { supabase } from "@/integrations/supabase/client";

const emailSchema = z.string().trim().email().max(255);

export function SubscribeButton() {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) { toast.error("Please enter a valid email address."); return; }
    setBusy(true);
    const { error } = await supabase.from("subscribers").insert({ email: parsed.data.toLowerCase() });
    setBusy(false);
    if (error && error.code !== "23505") { toast.error("Couldn't subscribe right now. Please try again."); return; }
    toast.success(error ? "You're already on the list." : "You're subscribed — welcome to Telyra.");
    setEmail("");
    setOpen(false);
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="rounded-full bg-foreground px-4 py-2 text-[11px] font-medium uppercase tracking-[0.15em] text-background transition-colors hover:bg-primary hover:text-primary-foreground"
        >
          Subscribe
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="glass w-80 rounded-2xl">
        <form onSubmit={submit} className="grid gap-3">
          <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-primary">The Telyra briefing</p>
          <p className="text-sm text-muted-foreground">The day's essential tech and AI stories, in your inbox.</p>
          <input
            type="email"
            required
            maxLength={255}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            aria-label="Email address"
            className="rounded-lg border border-input bg-background px-3 py-2 text-sm outline-none focus:border-primary"
          />
          <button
            disabled={busy}
            className="rounded-full bg-primary px-4 py-2 text-[11px] font-medium uppercase tracking-[0.15em] text-primary-foreground disabled:opacity-50"
          >
            {busy ? "Saving…" : "Subscribe"}
          </button>
        </form>
      </PopoverContent>
    </Popover>
  );
}
