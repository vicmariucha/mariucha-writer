import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

const slugSchema = z.object({ slug: z.string().min(1).max(200) });
const likeSchema = z.object({ slug: z.string().min(1).max(200), delta: z.union([z.literal(1), z.literal(-1)]) });

export const ownerExists = createServerFn({ method: "GET" }).handler(async () => {
  const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
  const { data, error } = await supabaseAdmin.rpc("owner_exists");
  if (error) throw new Error("Unable to check owner status");
  return { exists: data !== false };
});

export const incrementPostViews = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => slugSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: views, error } = await supabaseAdmin.rpc("increment_post_views", { _slug: data.slug });
    if (error) throw new Error("Unable to record view");
    return { views: views ?? null };
  });

export const incrementPostLikes = createServerFn({ method: "POST" })
  .inputValidator((data: unknown) => likeSchema.parse(data))
  .handler(async ({ data }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data: likes, error } = await supabaseAdmin.rpc("increment_post_likes", {
      _slug: data.slug,
      _delta: data.delta,
    });
    if (error) throw new Error("Unable to record like");
    return { likes: likes ?? null };
  });

/** Full comment rows (including commenter email) — admin only. */
export const listAdminComments = createServerFn({ method: "GET" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { data: isAdmin, error: roleError } = await context.supabase.rpc("is_admin");
    if (roleError || !isAdmin) throw new Error("Forbidden");

    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { data, error } = await supabaseAdmin
      .from("comments")
      .select(
        "id, post_id, name, email, body, reply_body, replied_at, reply_notified_at, created_at, posts(title, slug)",
      )
      .order("created_at", { ascending: false });
    if (error) throw new Error("Unable to load comments");
    return data ?? [];
  });
