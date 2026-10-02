import { useEffect } from "react";
import type { QueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const LIVE_SYNC_CHANNEL = "telyra-live-sync";

/**
 * Keeps public pages in step with the newsroom. Database change events cover new/updated approved
 * stories; a broadcast from the desk covers archives, which visitors can no longer read and so
 * would never receive as a database event.
 */
export function useLiveSync(queryClient: QueryClient) {
  const router = useRouter();
  useEffect(() => {
    const refresh = () => {
      queryClient.invalidateQueries({ queryKey: ["live-articles"] });
      router.invalidate();
    };
    const channel = supabase
      .channel(LIVE_SYNC_CHANNEL)
      .on("postgres_changes", { event: "*", schema: "public", table: "articles" }, refresh)
      .on("broadcast", { event: "articles-changed" }, refresh)
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
  }, [queryClient, router]);
}

/** Called by the editorial desk after approve/archive so every open page refreshes. */
export async function announceArticlesChanged() {
  const ch = supabase.channel(LIVE_SYNC_CHANNEL);
  await ch.httpSend("articles-changed", {}).catch(() => ch.send({ type: "broadcast", event: "articles-changed", payload: {} }));
  supabase.removeChannel(ch);
}
