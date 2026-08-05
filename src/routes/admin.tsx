import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { Eye, Heart, LogOut, Pencil, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";
import { RichTextEditor } from "@/components/rich-text-editor";
import { supabase } from "@/integrations/supabase/client";
import {
  adminPostsQuery,
  formatDate,
  slugify,
  tagColorOptions,
  tagsQuery,
  toneFor,
  type Post,
  type Tag,
} from "@/lib/blog";
import {
  createPost,
  createTag,
  deletePost,
  deleteTag,
  updatePost,
  updateTag,
  uploadImage,
  type PostInput,
} from "@/lib/blog-admin";

export const Route = createFileRoute("/admin")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Admin – Victória Mariucha" },
      { name: "description", content: "Private dashboard for managing articles." },
      { name: "robots", content: "noindex, nofollow" },
    ],
  }),
  component: AdminPage,
});

const field =
  "w-full rounded-sm border border-border bg-card px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent";
const label = "block text-[0.65rem] uppercase tracking-[0.18em] text-muted-foreground";

function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [ready, setReady] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => sub.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!session) {
      setIsAdmin(false);
      return;
    }
    supabase.rpc("is_admin").then(({ data }) => setIsAdmin(Boolean(data)));
  }, [session]);

  if (!ready) return <Shell>Loading…</Shell>;
  if (!session) return <AuthScreen />;
  if (!isAdmin)
    return (
      <Shell>
        <p className="text-muted-foreground">
          You're signed in, but this account isn't the site owner.
        </p>
        <button
          type="button"
          onClick={() => supabase.auth.signOut()}
          className="mt-6 rounded-full border border-border px-5 py-2 text-sm"
        >
          Sign out
        </button>
      </Shell>
    );

  return <Dashboard />;
}

function Shell({ children }: { children: React.ReactNode }) {
  return <section className="mx-auto max-w-md px-5 py-24 text-center sm:px-8">{children}</section>;
}

function AuthScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [mode, setMode] = useState<"in" | "up">("in");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [ownerExists, setOwnerExists] = useState<boolean | null>(null);

  useEffect(() => {
    let active = true;
    void supabase.rpc("owner_exists").then(({ data }) => {
      if (active) setOwnerExists(data !== false);
    });
    return () => {
      active = false;
    };
  }, []);

  const canClaim = ownerExists === false;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const fn =
      mode === "in" || !canClaim
        ? supabase.auth.signInWithPassword({ email, password })
        : supabase.auth.signUp({ email, password, options: { emailRedirectTo: window.location.href } });
    const { error: err } = await fn;
    if (err) setError(err.message);
    setBusy(false);
  }

  return (
    <section className="mx-auto max-w-md px-5 py-24 sm:px-8">
      <p className="eyebrow">Private</p>
      <h1 className="mt-4 font-display text-4xl">Studio</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        Where the articles get written, edited and occasionally deleted at 2am.
      </p>
      <form onSubmit={submit} className="mt-8 space-y-3">
        <input
          className={field}
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          className={field}
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Password"
          minLength={8}
          required
        />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-full bg-foreground px-6 py-2.5 text-sm text-background transition-colors hover:bg-accent disabled:opacity-40"
        >
          {busy ? "…" : mode === "in" || !canClaim ? "Sign in" : "Create owner account"}
        </button>
      </form>
      {canClaim ? (
        <button
          type="button"
          onClick={() => setMode(mode === "in" ? "up" : "in")}
          className="link-underline mt-6 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          {mode === "in" ? "First time? Create the owner account" : "Already have an account? Sign in"}
        </button>
      ) : (
        <p className="mt-6 text-xs uppercase tracking-[0.18em] text-muted-foreground">
          Owner account only — no sign-ups
        </p>
      )}
    </section>
  );
}


function emptyPost(): PostInput {
  return {
    slug: "",
    title: "",
    excerpt: "",
    body_html: "<p></p>",
    cover_image_url: null,
    cover_image_alt: null,
    tag_id: null,
    publication: "",
    published: false,
    published_at: new Date().toISOString().slice(0, 10),
  };
}

function Dashboard() {
  const queryClient = useQueryClient();
  const { data: posts = [] } = useQuery(adminPostsQuery);
  const { data: tags = [] } = useQuery(tagsQuery);
  const [editing, setEditing] = useState<{ id: string | null; input: PostInput } | null>(null);
  const [showTags, setShowTags] = useState(false);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["posts"] });
    void queryClient.invalidateQueries({ queryKey: ["tags"] });
  };

  const remove = useMutation({
    mutationFn: (id: string) => deletePost(id),
    onSuccess: invalidate,
  });

  if (editing) {
    return (
      <PostForm
        tags={tags}
        initial={editing.input}
        id={editing.id}
        onCancel={() => setEditing(null)}
        onSaved={() => {
          invalidate();
          setEditing(null);
        }}
      />
    );
  }

  return (
    <section className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
      <div className="flex flex-wrap items-end justify-between gap-4 border-b border-border pb-5">
        <div>
          <p className="eyebrow">Studio</p>
          <h1 className="mt-3 font-display text-4xl">Your articles</h1>
        </div>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => setShowTags(true)}
            className="rounded-full border border-border px-5 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground"
          >
            Manage tags
          </button>
          <button
            type="button"
            onClick={() => setEditing({ id: null, input: emptyPost() })}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm text-background transition-colors hover:bg-terracotta"
          >
            <Plus className="h-4 w-4" />
            New article
          </button>
          <button
            type="button"
            onClick={() => supabase.auth.signOut()}
            title="Sign out"
            aria-label="Sign out"
            className="rounded-full border border-border p-2.5 text-muted-foreground transition-colors hover:text-foreground"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      <ul className="mt-8 divide-y divide-border border-b border-border">
        {posts.map((p: Post) => (
          <li key={p.id} className="flex flex-wrap items-center gap-4 py-5">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                {p.tags && (
                  <span
                    className={`rounded-full border px-3 py-0.5 text-[0.6rem] uppercase tracking-[0.18em] ${toneFor(p.tags.color)}`}
                  >
                    {p.tags.name}
                  </span>
                )}
                {!p.published && (
                  <span className="rounded-full border border-border px-3 py-0.5 text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">
                    Draft
                  </span>
                )}
              </div>
              <p className="mt-2 truncate font-display text-xl">{p.title}</p>
              <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                {formatDate(p.published_at)}
                <span className="inline-flex items-center gap-1">
                  <Eye className="h-3.5 w-3.5" /> {p.views}
                </span>
                <span className="inline-flex items-center gap-1">
                  <Heart className="h-3.5 w-3.5" /> {p.likes}
                </span>
              </p>
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                title="Edit"
                aria-label={`Edit ${p.title}`}
                onClick={() =>
                  setEditing({
                    id: p.id,
                    input: {
                      slug: p.slug,
                      title: p.title,
                      excerpt: p.excerpt,
                      body_html: p.body_html,
                      cover_image_url: p.cover_image_url,
                      cover_image_alt: p.cover_image_alt,
                      tag_id: p.tag_id,
                      publication: p.publication,
                      published: p.published,
                      published_at: p.published_at.slice(0, 10),
                    },
                  })
                }
                className="rounded-full border border-border p-2.5 text-muted-foreground transition-colors hover:border-cobalt/50 hover:text-cobalt"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                type="button"
                title="Delete"
                aria-label={`Delete ${p.title}`}
                onClick={() => {
                  if (window.confirm(`Delete "${p.title}"? This cannot be undone.`)) remove.mutate(p.id);
                }}
                className="rounded-full border border-border p-2.5 text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </li>
        ))}
      </ul>

      {showTags && <TagManager tags={tags} onClose={() => setShowTags(false)} onChanged={invalidate} />}
    </section>
  );
}

function PostForm({
  initial,
  id,
  tags,
  onCancel,
  onSaved,
}: {
  initial: PostInput;
  id: string | null;
  tags: Tag[];
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState<PostInput>(initial);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);

  const set = <K extends keyof PostInput>(key: K, value: PostInput[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const save = useMutation({
    mutationFn: async () => {
      const payload: PostInput = {
        ...form,
        slug: form.slug.trim() || slugify(form.title),
        published_at: new Date(`${form.published_at}T12:00:00Z`).toISOString(),
      };
      if (id) await updatePost(id, payload);
      else await createPost(payload);
    },
    onSuccess: onSaved,
    onError: (e) => setError(e instanceof Error ? e.message : "Could not save"),
  });

  return (
    <section className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <h1 className="font-display text-3xl">{id ? "Edit article" : "New article"}</h1>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-full border border-border px-5 py-2 text-sm text-muted-foreground hover:text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!form.title.trim() || save.isPending}
            onClick={() => save.mutate()}
            className="rounded-full bg-foreground px-6 py-2 text-sm text-background transition-colors hover:bg-terracotta disabled:opacity-40"
          >
            {save.isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-8 space-y-5">
        <div>
          <span className={label}>Title</span>
          <input
            className={`${field} mt-2 font-display text-lg`}
            value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              setForm((f) => ({
                ...f,
                title,
                slug: !id && (!f.slug || f.slug === slugify(f.title)) ? slugify(title) : f.slug,
              }));
            }}
            placeholder="An extremely detailed tangent"
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <span className={label}>URL slug</span>
            <input className={`${field} mt-2`} value={form.slug} onChange={(e) => set("slug", e.target.value)} />
          </div>
          <div>
            <span className={label}>Publication date</span>
            <input
              type="date"
              className={`${field} mt-2`}
              value={form.published_at.slice(0, 10)}
              onChange={(e) => set("published_at", e.target.value)}
            />
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <span className={label}>Tag</span>
            <select
              className={`${field} mt-2`}
              value={form.tag_id ?? ""}
              onChange={(e) => set("tag_id", e.target.value || null)}
            >
              <option value="">No tag</option>
              {tags.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <span className={label}>Publication</span>
            <input
              className={`${field} mt-2`}
              value={form.publication}
              onChange={(e) => set("publication", e.target.value)}
              placeholder="My blog (aka this website)"
            />
          </div>
        </div>

        <div>
          <span className={label}>Excerpt</span>
          <textarea
            className={`${field} mt-2 min-h-24 resize-y`}
            value={form.excerpt}
            onChange={(e) => set("excerpt", e.target.value)}
          />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <span className={label}>Cover image URL</span>
            <input
              className={`${field} mt-2`}
              value={form.cover_image_url ?? ""}
              onChange={(e) => set("cover_image_url", e.target.value || null)}
            />
            <input
              type="file"
              accept="image/*"
              disabled={uploading}
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file) return;
                setUploading(true);
                try {
                  set("cover_image_url", await uploadImage(file));
                } catch (err) {
                  setError(err instanceof Error ? err.message : "Upload failed");
                } finally {
                  setUploading(false);
                }
              }}
              className="mt-2 block w-full text-xs text-muted-foreground"
            />
          </div>
          <div>
            <span className={label}>Cover ALT text (SEO)</span>
            <input
              className={`${field} mt-2`}
              value={form.cover_image_alt ?? ""}
              onChange={(e) => set("cover_image_alt", e.target.value || null)}
            />
          </div>
        </div>

        {form.cover_image_url && (
          <img
            src={form.cover_image_url}
            alt={form.cover_image_alt ?? "Cover preview"}
            className="max-h-56 w-full rounded-sm object-cover"
          />
        )}

        <label className="flex items-center gap-3 text-sm">
          <input
            type="checkbox"
            checked={form.published}
            onChange={(e) => set("published", e.target.checked)}
          />
          Published (visible on the site)
        </label>

        <div>
          <span className={label}>Body</span>
          <div className="mt-2">
            <RichTextEditor value={form.body_html} onChange={(html) => set("body_html", html)} />
          </div>
        </div>
      </div>
    </section>
  );
}

function TagManager({
  tags,
  onClose,
  onChanged,
}: {
  tags: Tag[];
  onClose: () => void;
  onChanged: () => void;
}) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("accent");
  const [error, setError] = useState<string | null>(null);

  async function run(fn: () => Promise<unknown>) {
    try {
      setError(null);
      await fn();
      onChanged();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-sm border border-border bg-card p-6 shadow-elevate">
        <h3 className="font-display text-2xl">Tags</h3>
        {error && <p className="mt-3 text-sm text-destructive">{error}</p>}

        <ul className="mt-5 space-y-3">
          {tags.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center gap-2">
              <input
                className={`${field} flex-1`}
                defaultValue={t.name}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  if (value && value !== t.name) void run(() => updateTag(t.id, value, slugify(value), t.color));
                }}
              />
              <select
                className={`${field} w-36`}
                defaultValue={t.color}
                onChange={(e) => void run(() => updateTag(t.id, t.name, t.slug, e.target.value))}
              >
                {tagColorOptions.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <button
                type="button"
                aria-label={`Delete tag ${t.name}`}
                onClick={() => {
                  if (window.confirm(`Delete tag "${t.name}"?`)) void run(() => deleteTag(t.id));
                }}
                className="rounded-full border border-border p-2.5 text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>

        <div className="mt-6 flex flex-wrap items-center gap-2 border-t border-border pt-5">
          <input
            className={`${field} flex-1`}
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="New tag name"
          />
          <select className={`${field} w-36`} value={color} onChange={(e) => setColor(e.target.value)}>
            {tagColorOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button
            type="button"
            disabled={!name.trim()}
            onClick={() =>
              void run(async () => {
                await createTag(name.trim(), slugify(name), color);
                setName("");
              })
            }
            className="rounded-full bg-foreground px-5 py-2.5 text-sm text-background disabled:opacity-40"
          >
            Add
          </button>
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-6 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground"
        >
          Close
        </button>
      </div>
    </div>
  );
}
