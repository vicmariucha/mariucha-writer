import { queryOptions } from "@tanstack/react-query";
import type { CSSProperties } from "react";
import { supabase } from "@/integrations/supabase/client";

export type Tag = {
  id: string;
  name: string;
  slug: string;
  color: string;
};

export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  body_html: string;
  cover_image_url: string | null;
  cover_image_alt: string | null;
  tag_id: string | null;
  publication: string;
  published: boolean;
  featured: boolean;
  published_at: string;
  updated_at: string;
  views: number;
  likes: number;
  tags?: Tag | null;
  tagList: Tag[];
};

const POST_COLUMNS =
  "id, slug, title, excerpt, body_html, cover_image_url, cover_image_alt, tag_id, publication, published, featured, published_at, updated_at, views, likes, tags!posts_tag_id_fkey(id, name, slug, color), post_tags(tags(id, name, slug, color))";

type RawPost = Omit<Post, "tagList"> & {
  post_tags?: { tags: Tag | null }[] | null;
};

function normalize(rows: unknown): Post[] {
  return ((rows ?? []) as RawPost[]).map((row) => {
    const linked = (row.post_tags ?? []).map((l) => l.tags).filter(Boolean) as Tag[];
    const tagList = linked.length > 0 ? linked : row.tags ? [row.tags] : [];
    return { ...row, tagList, tags: tagList[0] ?? null } as Post;
  });
}

export const tagTone: Record<string, string> = {
  cobalt: "text-cobalt border-cobalt/40 bg-cobalt/8",
  plum: "text-plum border-plum/40 bg-plum/8",
  foreground: "text-foreground border-foreground/30 bg-foreground/5",
  accent: "text-accent border-accent/40 bg-accent/8",
  amber: "text-amber border-amber/50 bg-amber/10",
  terracotta: "text-terracotta border-terracotta/40 bg-terracotta/8",
};

export const tagColorOptions = Object.keys(tagTone);

/** A stored colour is either a preset token, a hex value, or "#hex|Custom name". */
export function parseColor(color?: string | null) {
  const value = color ?? "accent";
  const [raw, label] = value.split("|");
  const hex = raw?.startsWith("#") ? raw : null;
  return { raw: raw ?? "accent", hex, label: label ?? (hex ? "Custom" : (raw ?? "accent")) };
}

export function toneFor(color?: string | null) {
  const { raw } = parseColor(color);
  return tagTone[raw] ?? tagTone["accent"]!;
}

/** Class name + inline style so preset tokens and custom hex colours both render. */
export function tagVisual(color?: string | null): { className: string; style?: CSSProperties } {
  const { hex } = parseColor(color);
  if (!hex) return { className: toneFor(color) };
  return {
    className: "",
    style: { color: hex, borderColor: `${hex}66`, backgroundColor: `${hex}14` },
  };
}

export function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    timeZone: "UTC",
  });
}

/** Date + time (viewer's local time zone) — used for comments, where "when exactly" matters. */
export function formatDateTime(value: string | null | undefined) {
  if (!value) return "unknown date";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "unknown date";
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export function readTime(html: string) {
  const words = html
    .replace(/<[^>]*>/g, " ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;
  return `${Math.max(1, Math.round(words / 200))} min read`;
}

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function fetchPublishedPosts(): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_COLUMNS)
    .eq("published", true)
    .lte("published_at", new Date().toISOString())
    .order("published_at", { ascending: false });
  if (error) throw error;
  return normalize(data);
}

export async function fetchPostBySlug(slug: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_COLUMNS)
    .eq("slug", slug)
    .eq("published", true)
    .lte("published_at", new Date().toISOString())
    .maybeSingle();
  if (error) throw error;
  return normalize(data ? [data] : [])[0] ?? null;
}

export async function fetchAllPostsForAdmin(): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select(POST_COLUMNS)
    .order("published_at", { ascending: false });
  if (error) throw error;
  return normalize(data);
}

export async function fetchTags(): Promise<Tag[]> {
  const { data, error } = await supabase.from("tags").select("id, name, slug, color").order("name");
  if (error) throw error;
  return (data ?? []) as Tag[];
}

export type Comment = {
  id: string;
  post_id: string;
  parent_id: string | null;
  name: string;
  body: string;
  is_admin_reply: boolean;
  created_at: string;
};

/** A top-level comment with its replies attached (always one level deep — a
 * reply to a reply is folded into the same thread, like YouTube/Instagram). */
export type CommentThread = Comment & { replies: Comment[] };

export async function fetchComments(postId: string): Promise<Comment[]> {
  const { data, error } = await supabase
    .from("comments_public")
    .select("id, post_id, parent_id, name, body, is_admin_reply, created_at")
    .eq("post_id", postId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data ?? []) as Comment[];
}

/** Groups a flat list of comments into threads: top-level comments (newest
 * first), each carrying its replies (oldest first, i.e. reading order). A
 * reply whose parent isn't in the list (e.g. parent still pending) is shown
 * as its own standalone thread instead of being dropped. */
export function buildCommentThreads(comments: Comment[]): CommentThread[] {
  const byId = new Map(comments.map((c) => [c.id, c]));
  const roots: CommentThread[] = [];
  const repliesByRoot = new Map<string, Comment[]>();

  for (const c of comments) {
    const isOrphanReply = c.parent_id !== null && !byId.has(c.parent_id);
    if (c.parent_id === null || isOrphanReply) continue;
    const list = repliesByRoot.get(c.parent_id) ?? [];
    list.push(c);
    repliesByRoot.set(c.parent_id, list);
  }

  for (const c of comments) {
    const isOrphanReply = c.parent_id !== null && !byId.has(c.parent_id);
    if (c.parent_id !== null && !isOrphanReply) continue;
    roots.push({ ...c, replies: repliesByRoot.get(c.id) ?? [] });
  }

  return roots.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
}


export const postsQuery = queryOptions({
  queryKey: ["posts", "published"],
  queryFn: fetchPublishedPosts,
});

export const tagsQuery = queryOptions({ queryKey: ["tags"], queryFn: fetchTags });

export const postQuery = (slug: string) =>
  queryOptions({ queryKey: ["post", slug], queryFn: () => fetchPostBySlug(slug) });

export const commentsQuery = (postId: string) =>
  queryOptions({ queryKey: ["comments", postId], queryFn: () => fetchComments(postId) });

export const adminPostsQuery = queryOptions({
  queryKey: ["posts", "admin"],
  queryFn: fetchAllPostsForAdmin,
});
