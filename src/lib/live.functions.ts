import { createServerFn } from "@tanstack/react-start";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export type LiveRow = {
  id: string;
  title: string;
  subheadline: string | null;
  content: string;
  source_url: string | null;
  category: string;
  published_at: string;
  affiliate_title: string | null;
  affiliate_url: string | null;
  editor_note: string | null;
};

function publicClient() {
  const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
  return createClient<Database>(process.env["SUPABASE_URL"]!, key, {
    auth: { persistSession: false, autoRefreshToken: false, storage: undefined },
    global: {
      fetch: (input, init) => {
        const h = new Headers(init?.headers);
        if (key.startsWith("sb_") && h.get("Authorization") === `Bearer ${key}`) h.delete("Authorization");
        h.set("apikey", key);
        return fetch(input, { ...init, headers: h });
      },
    },
  });
}

const COLS = "id, title, subheadline, content, source_url, category, published_at, affiliate_title, affiliate_url, editor_note";

export const listLiveArticles = createServerFn({ method: "GET" }).handler(async (): Promise<LiveRow[]> => {
  const { data, error } = await publicClient()
    .from("articles")
    .select(COLS)
    .eq("status", "approved")
    .order("published_at", { ascending: false })
    .limit(30);
  if (error) throw new Error(error.message);
  return data ?? [];
});

export const getLiveArticle = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) => z.object({ id: z.string().uuid() }).parse(d))
  .handler(async ({ data }): Promise<LiveRow | null> => {
    const { data: row, error } = await publicClient()
      .from("articles")
      .select(COLS)
      .eq("id", data.id)
      .eq("status", "approved")
      .maybeSingle();
    if (error) throw new Error(error.message);
    return row;
  });

export const listRelatedLiveArticles = createServerFn({ method: "GET" })
  .inputValidator((d: unknown) =>
    z.object({ id: z.string().uuid(), category: z.string().min(1).max(80) }).parse(d),
  )
  .handler(async ({ data }): Promise<LiveRow[]> => {
    const { data: rows, error } = await publicClient()
      .from("articles")
      .select(COLS)
      .eq("status", "approved")
      .eq("category", data.category)
      .neq("id", data.id)
      .order("published_at", { ascending: false })
      .limit(3);
    if (error) throw new Error(error.message);
    return rows ?? [];
  });
