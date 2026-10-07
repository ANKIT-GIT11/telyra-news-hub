import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const uploadArticleImage = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input: unknown) => z.object({
    id: z.string().uuid(), target: z.enum(["articles", "review_queue"]),
    bytes: z.string().max(8_388_608),
  }).parse(input))
  .handler(async ({ data, context }) => {
    const { data: admin } = await context.supabase.rpc("has_role", { _user_id: context.userId, _role: "admin" });
    if (!admin) throw new Error("Admin access required");
    const bytes = Uint8Array.from(atob(data.bytes), (c) => c.charCodeAt(0));
    if (bytes.length < 16 || bytes.length > 6 * 1024 * 1024) throw new Error("Choose an image smaller than 6 MB");
    const jpg = bytes[0] === 255 && bytes[1] === 216 && bytes[2] === 255;
    const png = [137,80,78,71,13,10,26,10].every((n, i) => bytes[i] === n);
    const webp = String.fromCharCode(...bytes.slice(0,4)) === "RIFF" && String.fromCharCode(...bytes.slice(8,12)) === "WEBP";
    if (!jpg && !png && !webp) throw new Error("Choose a JPEG, PNG or WebP image");
    const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)), (n) => n.toString(16).padStart(2,"0")).join("");
    const path = `${data.id}/${hash}.${jpg ? "jpg" : png ? "png" : "webp"}`;
    const { data: existing, error: readError } = await context.supabase.from(data.target).select("id").eq("id",data.id).single();
    if (readError || !existing) throw new Error("Story not found");
    const { error: uploadError } = await context.supabase.storage.from("article-images").upload(path, bytes, { contentType: jpg ? "image/jpeg" : png ? "image/png" : "image/webp", upsert: false });
    if (uploadError && !/already exists|duplicate/i.test(uploadError.message)) throw new Error(uploadError.message);
    const imageUrl = `/api/public/article-image/${crypto.randomUUID()}`;
    const { error } = await context.supabase.from(data.target).update({ image_path: path, image_url: imageUrl }).eq("id",data.id).select("id").single();
    if (error) throw new Error(error.message.includes("unique") || error.message.includes("already belongs") ? "This image is already used by another story. Choose a unique image." : error.message);
    return { imageUrl };
  });