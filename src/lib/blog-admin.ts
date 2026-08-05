import { supabase } from "@/integrations/supabase/client";
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
  tag_id: string | null;
  publication: string;
  published: boolean;
  published_at: string;
};

export async function createPost(input: PostInput): Promise<Post> {
  const { data, error } = await supabase.from("posts").insert(input).select("*").single();
  if (error) throw error;
  return data as unknown as Post;
}

export async function updatePost(id: string, input: PostInput): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .update(input)
    .eq("id", id)
    .select("*")
    .single();
  if (error) throw error;
  return data as unknown as Post;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", id);
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
