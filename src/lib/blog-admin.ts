import { supabase } from "@/integrations/supabase/client";
import { queryOptions } from "@tanstack/react-query";
import type { Post, Tag } from "@/lib/blog";

const BUCKET = "post-images";
const TEN_YEARS = 60 * 60 * 24 * 3650;

export async function uploadImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop() ?? "jpg";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(path, file, {
    cacheControl: "31536000",
    upsert: false,
  });
  if (error) throw error;
  const { data, error: signError } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(path, TEN_YEARS);
  if (signError) throw signError;
  return data.signedUrl;
}

export type PostInput = {
  slug: string;
  title: string;
  excerpt: string;
  body_html: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  publication: string;
  published: boolean;
  featured: boolean;
  published_at: string;
  tag_ids: string[];
};

function toRow(input: PostInput) {
  const { tag_ids, ...row } = input;
  return { ...row, tag_id: tag_ids[0] ?? null };
}

async function syncTags(postId: string, tagIds: string[]) {
  const { error: delError } = await supabase.from("post_tags").delete().eq("post_id", postId);
  if (delError) throw delError;
  if (tagIds.length === 0) return;
  const { error } = await supabase
    .from("post_tags")
    .insert(tagIds.map((tag_id) => ({ post_id: postId, tag_id })));
  if (error) throw error;
}

export async function createPost(input: PostInput): Promise<Post> {
  const { data, error } = await supabase.from("posts").insert(toRow(input)).select("*").single();
  if (error) throw error;
  await syncTags(data.id, input.tag_ids);
  return data as unknown as Post;
}

export async function updatePost(id: string, input: PostInput): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .update(toRow(input))
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  await syncTags(id, input.tag_ids);
  return data as unknown as Post;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}

export async function setFeatured(id: string, featured: boolean): Promise<void> {
  const { error } = await supabase.from("posts").update({ featured }).eq("id", id);
  if (error) throw error;
}

export async function createTag(name: string, slug: string, color: string): Promise<Tag> {
  const { data, error } = await supabase.from("tags").insert({ name, slug, color }).select().single();
  if (error) throw error;
  return data as Tag;
}

export async function updateTag(id: string, name: string, slug: string, color: string): Promise<void> {
  const { error } = await supabase.from("tags").update({ name, slug, color }).eq("id", id);
  if (error) throw error;
}

export async function deleteTag(id: string): Promise<void> {
  const { error } = await supabase.from("tags").delete().eq("id", id);
  if (error) throw error;
}

/* ---------- Comments moderation ---------- */

export type AdminComment = {
  id: string;
  post_id: string;
  name: string;
  email: string;
  body: string;
  reply_body: string | null;
  replied_at: string | null;
  reply_notified_at: string | null;
  created_at: string;
  posts: { title: string; slug: string } | null;
};

export async function fetchAdminComments(): Promise<AdminComment[]> {
  const { data, error } = await supabase.rpc("list_admin_comments");
  if (error) throw error;
  return ((data ?? []) as any[]).map((row) => ({
    id: row.id, post_id: row.post_id, name: row.name, email: row.email, body: row.body,
    reply_body: row.reply_body, replied_at: row.replied_at, reply_notified_at: row.reply_notified_at,
    created_at: row.created_at,
    posts: row.post_title ? { title: row.post_title, slug: row.post_slug } : null,
  }));
}


export const adminCommentsQuery = queryOptions({
  queryKey: ["comments", "admin"],
  queryFn: fetchAdminComments,
});

/**
 * Supabase silently "succeeds" an update/delete that matches zero rows —
 * e.g. because a Row Level Security policy quietly filters the row out.
 * No `error` is raised, so without checking the returned rows a blocked
 * write looks identical to a real one. Every admin mutation below asks
 * for the affected row back and throws if none came back, so a missing
 * policy shows up as a visible error instead of a false "success".
 */
async function assertRowAffected(id: string, data: unknown[] | null, action: string): Promise<void> {
  if (!data || data.length === 0) {
    throw new Error(
      `${action} did not go through (comment ${id} was not modified). This usually means an admin permission is missing in Supabase — check the RLS policies on "comments".`,
    );
  }
}

export async function updateCommentBody(id: string, body: string): Promise<void> {
  const { data, error } = await supabase.from("comments").update({ body }).eq("id", id).select("id");
  if (error) throw error;
  await assertRowAffected(id, data, "Saving the comment edit");
}

export async function replyToComment(id: string, reply: string): Promise<void> {
  const { data, error } = await supabase
    .from("comments")
    .update({ reply_body: reply, replied_at: new Date().toISOString() })
    .eq("id", id)
    .select("id");
  if (error) throw error;
  await assertRowAffected(id, data, "Publishing the reply");
}

export async function deleteComment(id: string): Promise<void> {
  const { data, error } = await supabase.from("comments").delete().eq("id", id).select("id");
  if (error) throw error;
  await assertRowAffected(id, data, "Deleting the comment");
}

/* ---------- Contact inbox ---------- */

export type ContactMessage = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  handled: boolean;
  created_at: string;
};

export async function fetchContactMessages(): Promise<ContactMessage[]> {
  const { data, error } = await supabase
    .from("contact_messages")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []) as ContactMessage[];
}

export const contactMessagesQuery = queryOptions({
  queryKey: ["contact-messages"],
  queryFn: fetchContactMessages,
});

export async function setContactHandled(id: string, handled: boolean): Promise<void> {
  const { error } = await supabase.from("contact_messages").update({ handled }).eq("id", id);
  if (error) throw error;
}

export async function deleteContactMessage(id: string): Promise<void> {
  const { error } = await supabase.from("contact_messages").delete().eq("id", id);
  if (error) throw error;
}
