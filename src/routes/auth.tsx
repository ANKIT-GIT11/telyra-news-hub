import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { SiteHeader } from "@/components/site-header";

export const Route = createFileRoute("/auth")({
  head: () => ({
    meta: [
      { title: "Sign in — Telyra" },
      { name: "description", content: "Sign in to the Telyra editorial desk." },
      { property: "og:title", content: "Sign in — Telyra" },
      { property: "og:description", content: "Sign in to the Telyra editorial desk." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: AuthPage,
});

function AuthPage() {
  const navigate = useNavigate();
  const [mode, setMode] = useState<"in" | "up">("in");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    if (mode === "in") {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setMsg(error.message);
      else navigate({ to: "/admin" });
    } else {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { emailRedirectTo: `${window.location.origin}/auth` },
      });
      setMsg(error ? error.message : "Check your inbox to confirm your email, then sign in.");
    }
    setBusy(false);
  }

  return (
    <div className="min-h-screen font-sans text-foreground antialiased">
      <SiteHeader />
      <main className="mx-auto max-w-md px-6 py-16">
        <form onSubmit={submit} className="glass rounded-[20px] p-8 ring-1 ring-foreground/10 animate-rise">
          <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-primary">Editorial desk</p>
          <h1 className="mt-2 font-display text-3xl font-bold">{mode === "in" ? "Sign in" : "Create account"}</h1>
          <input
            type="email" required placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)}
            className="mt-6 w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-sm"
          />
          <input
            type="password" required minLength={6} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
            className="mt-3 w-full rounded-xl border border-input bg-background/60 px-4 py-3 text-sm"
          />
          {msg && <p className="mt-3 text-sm text-muted-foreground">{msg}</p>}
          <button
            disabled={busy}
            className="mt-6 w-full rounded-full bg-foreground px-5 py-3 text-[11px] font-medium uppercase tracking-[0.15em] text-background hover:bg-primary hover:text-primary-foreground disabled:opacity-50"
          >
            {busy ? "…" : mode === "in" ? "Sign in" : "Sign up"}
          </button>
          <button
            type="button" onClick={() => setMode(mode === "in" ? "up" : "in")}
            className="mt-4 w-full font-mono text-[11px] uppercase tracking-[0.15em] text-muted-foreground hover:text-foreground"
          >
            {mode === "in" ? "Need an account? Sign up" : "Have an account? Sign in"}
          </button>
        </form>
      </main>
    </div>
  );
}
