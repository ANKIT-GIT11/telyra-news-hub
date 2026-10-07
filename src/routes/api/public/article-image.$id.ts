import { createFileRoute } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { z } from "zod";
import type { Database } from "@/integrations/supabase/types";

export const Route = createFileRoute("/api/public/article-image/$id")({
  server: { handlers: { GET: async ({ params }) => {
    if (!z.string().uuid().safeParse(params.id).success) return new Response("Not found", { status: 404 });
    const key = process.env["SUPABASE_PUBLISHABLE_KEY"]!;
    const client = createClient<Database>(process.env["SUPABASE_URL"]!, key, { auth: { persistSession: false }, global: { fetch: (input, init) => {
      const headers = new Headers(init?.headers);
      if (key.startsWith("sb_") && headers.get("Authorization") === `Bearer ${key}`) headers.delete("Authorization");
      headers.set("apikey", key);
      return fetch(input, { ...init, headers });
    } } });
    const { data: row, error } = await client.from("articles").select("image_path").eq("status","approved").eq("image_url",`/api/public/article-image/${params.id}`).maybeSingle();
    if (error) return new Response("Image unavailable", { status: 503 });
    if (!row?.image_path) return new Response("Not found", { status: 404 });
    // Public policy above authorizes this exact published asset, never arbitrary storage paths.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: file, error: downloadError } = await supabaseAdmin.storage.from("article-images").download(row.image_path);
    if (downloadError || !file) return new Response("Not found", { status: 404 });
    return new Response(file, { headers: { "Content-Type": file.type, "Cache-Control": "no-cache", "X-Content-Type-Options": "nosniff" } });
  } } },
});