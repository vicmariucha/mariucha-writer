import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { Eye, ExternalLink, Heart, Inbox, LogOut, MessageSquare, Pencil, Plus, Star, Trash2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { RichTextEditor } from "@/components/rich-text-editor";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { supabase } from "@/integrations/supabase/client";
import { adminPostsQuery, formatDate, formatDateTime, parseColor, slugify, tagColorOptions, tagsQuery, tagVisual, type Post, type Tag } from "@/lib/blog";
import { adminCommentsQuery, adminReplyToComment, contactMessagesQuery, createPost, createTag, deleteComment, deleteContactMessage, deletePost, deleteTag, markCommentReviewed, moderateComment, setContactHandled, setFeatured, updateCommentBody, updatePost, updateTag, uploadImage, type AdminComment, type CommentStatus, type ContactMessage, type PostInput } from "@/lib/blog-admin";

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

const field = "w-full rounded-sm border border-border bg-card px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent";
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
        <p className="text-muted-foreground">You're signed in, but this account isn't the site owner.</p>
        <button type="button" onClick={() => supabase.auth.signOut()} className="mt-6 rounded-full border border-border px-5 py-2 text-sm">
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
    void supabase.rpc("owner_exists")
      .then(({ data }) => { if (active) setOwnerExists(Boolean(data)); })
      .catch(() => { if (active) setOwnerExists(true); });
    return () => { active = false; };
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
      <p className="mt-3 text-sm text-muted-foreground">Where the articles get written, edited and occasionally deleted at 2am.</p>
      <form onSubmit={submit} className="mt-8 space-y-3">
        <input className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
        <input className={field} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" minLength={8} required />
        {error && <p className="text-sm text-destructive">{error}</p>}
        <button type="submit" disabled={busy} className="w-full rounded-full bg-foreground px-6 py-2.5 text-sm text-background transition-colors hover:bg-accent disabled:opacity-40">
          {busy ? "…" : mode === "in" || !canClaim ? "Sign in" : "Create owner account"}
        </button>
      </form>
      {canClaim ? (
        <button type="button" onClick={() => setMode(mode === "in" ? "up" : "in")} className="link-underline mt-6 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground">
          {mode === "in" ? "First time? Create the owner account" : "Already have an account? Sign in"}
        </button>
      ) : (
        <p className="mt-6 text-xs uppercase tracking-[0.18em] text-muted-foreground">Owner account only — no sign-ups</p>
      )}
    </section>
  );
}

function toLocalInput(iso: string) {
  const d = new Date(iso);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function emptyPost(): PostInput {
  return { slug: "", title: "", excerpt: "", body_html: "<p></p>", cover_image_url: null, cover_image_alt: null, publication: "", published: false, featured: false, published_at: toLocalInput(new Date().toISOString()), tag_ids: [] };
}

function toInput(p: Post): PostInput {
  return { slug: p.slug, title: p.title, excerpt: p.excerpt, body_html: p.body_html, cover_image_url: p.cover_image_url, cover_image_alt: p.cover_image_alt, publication: p.publication, published: p.published, featured: p.featured, published_at: toLocalInput(p.published_at), tag_ids: p.tagList.map((t) => t.id) };
}

type PanelTab = "posts" | "comments" | "inbox";

function Dashboard() {
  const queryClient = useQueryClient();
  const { data: posts = [] } = useQuery(adminPostsQuery);
  const { data: tags = [] } = useQuery(tagsQuery);
  const { data: comments = [] } = useQuery(adminCommentsQuery);
  // Anything actually pending (spam-suspect) or simply never looked at yet
  // (auto-approved and already live, but new) needs the admin's attention.
  const needsAttentionCount = comments.filter((c) => c.status === "pending" || !c.reviewed).length;
  const [editing, setEditing] = useState<{ id: string | null; input: PostInput } | null>(null);
  const [showTags, setShowTags] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [tab, setTab] = useState<PanelTab>("posts");
  const [pendingDelete, setPendingDelete] = useState<Post | null>(null);

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: ["posts"] });
    void queryClient.invalidateQueries({ queryKey: ["tags"] });
  };

  const remove = useMutation({ mutationFn: (id: string) => deletePost(id), onSuccess: invalidate });
  const feature = useMutation({ mutationFn: ({ id, value }: { id: string; value: boolean }) => setFeatured(id, value), onSuccess: invalidate });

  if (editing) {
    return (
      <PostForm
        tags={tags}
        initial={editing.input}
        id={editing.id}
        onCancel={() => setEditing(null)}
        onSaved={() => { invalidate(); setEditing(null); }}
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
          <button type="button" onClick={() => setShowTags(true)} className="rounded-full border border-border px-5 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground">
            Manage tags
          </button>
          <button type="button" onClick={() => setShowPassword(true)} className="rounded-full border border-border px-5 py-2 text-sm text-muted-foreground transition-colors hover:border-foreground/40 hover:text-foreground">
            Change password
          </button>
          <button type="button" onClick={() => setEditing({ id: null, input: emptyPost() })} className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm text-background transition-colors hover:bg-terracotta">
            <Plus className="h-4 w-4" />
            New article
          </button>
          <button type="button" onClick={() => supabase.auth.signOut()} title="Sign out" aria-label="Sign out" className="rounded-full border border-border p-2.5 text-muted-foreground transition-colors hover:text-foreground">
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="mt-6 flex flex-wrap gap-2">
        {([["posts", "Articles", Pencil], ["comments", "Comments", MessageSquare], ["inbox", "Contact inbox", Inbox]] as const).map(([key, text, Icon]) => (
          <button
            key={key}
            type="button"
            onClick={() => setTab(key)}
            className={`inline-flex items-center gap-2 rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.14em] transition-colors ${
              tab === key ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground"
            }`}
          >
            <Icon className="h-3.5 w-3.5" />
            {text}
            {key === "comments" && needsAttentionCount > 0 && (
              <span className={`rounded-full px-1.5 py-0.5 text-[0.6rem] ${tab === key ? "bg-background text-foreground" : "bg-amber/20 text-amber"}`}>
                {needsAttentionCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "posts" && (
        <ul className="mt-8 divide-y divide-border border-b border-border">
          {posts.map((p: Post) => {
            const scheduled = p.published && new Date(p.published_at) > new Date();
            return (
              <li key={p.id} className="flex flex-wrap items-center gap-4 py-5">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    {p.tagList.map((t) => {
                      const v = tagVisual(t.color);
                      return (
                        <span key={t.id} style={v.style} className={`rounded-full border px-3 py-0.5 text-[0.6rem] uppercase tracking-[0.18em] ${v.className}`}>
                          {t.name}
                        </span>
                      );
                    })}
                    {!p.published && (
                      <span className="rounded-full border border-border px-3 py-0.5 text-[0.6rem] uppercase tracking-[0.18em] text-muted-foreground">Draft</span>
                    )}
                    {scheduled && (
                      <span className="rounded-full border border-cobalt/40 bg-cobalt/8 px-3 py-0.5 text-[0.6rem] uppercase tracking-[0.18em] text-cobalt">Scheduled</span>
                    )}
                  </div>
                  <p className="mt-2 truncate font-display text-xl">{p.title}</p>
                  <p className="mt-1 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                    {formatDate(p.published_at)}
                    <span className="inline-flex items-center gap-1"><Eye className="h-3.5 w-3.5" /> {p.views}</span>
                    <span className="inline-flex items-center gap-1"><Heart className="h-3.5 w-3.5" /> {p.likes}</span>
                  </p>
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    title={p.featured ? "Remove from featured" : "Mark as featured"}
                    aria-pressed={p.featured}
                    aria-label={`Feature ${p.title}`}
                    onClick={() => feature.mutate({ id: p.id, value: !p.featured })}
                    className={`rounded-full border p-2.5 transition-colors ${
                      p.featured ? "border-amber/60 bg-amber/10 text-amber" : "border-border text-muted-foreground hover:border-amber/50 hover:text-amber"
                    }`}
                  >
                    <Star className={`h-4 w-4 ${p.featured ? "fill-current" : ""}`} />
                  </button>
                  <button type="button" title="Edit" aria-label={`Edit ${p.title}`} onClick={() => setEditing({ id: p.id, input: toInput(p) })} className="rounded-full border border-border p-2.5 text-muted-foreground transition-colors hover:border-cobalt/50 hover:text-cobalt">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button type="button" title="Delete" aria-label={`Delete ${p.title}`} onClick={() => setPendingDelete(p)} className="rounded-full border border-border p-2.5 text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {tab === "comments" && <CommentsPanel />}
      {tab === "inbox" && <InboxPanel />}

      {showTags && <TagManager tags={tags} onClose={() => setShowTags(false)} onChanged={invalidate} />}
      {showPassword && <ChangePasswordModal onClose={() => setShowPassword(false)} />}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this article?"
        description={pendingDelete ? `"${pendingDelete.title}" and its comments will be permanently removed. This cannot be undone.` : ""}
        confirmLabel="Delete article"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => { if (pendingDelete) remove.mutate(pendingDelete.id); setPendingDelete(null); }}
      />
    </section>
  );
}

function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [busy, setBusy] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (password !== confirm) return setError("Passwords don't match");
    if (password.length < 8) return setError("Use at least 8 characters");
    setBusy(true);
    setError(null);
    const { error: err } = await supabase.auth.updateUser({ password });
    if (err) setError(err.message);
    else setSuccess(true);
    setBusy(false);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-foreground/40 p-4">
      <div className="w-full max-w-sm rounded-sm border border-border bg-card p-6 shadow-elevate">
        <h3 className="font-display text-2xl">Change password</h3>
        {success ? (
          <>
            <p className="mt-4 text-sm text-accent">Password updated successfully.</p>
            <button type="button" onClick={onClose} className="mt-6 rounded-full bg-foreground px-5 py-2.5 text-sm text-background">Close</button>
          </>
        ) : (
          <form onSubmit={submit} className="mt-5 space-y-3">
            <input className={field} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="New password" minLength={8} required />
            <input className={field} type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Confirm new password" minLength={8} required />
            {error && <p className="text-sm text-destructive">{error}</p>}
            <div className="flex gap-3 pt-2">
              <button type="button" onClick={onClose} className="rounded-full border border-border px-5 py-2 text-sm text-muted-foreground hover:text-foreground">Cancel</button>
              <button type="submit" disabled={busy} className="rounded-full bg-foreground px-5 py-2 text-sm text-background disabled:opacity-40">{busy ? "…" : "Update password"}</button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

/* ---------------- Post form ---------------- */

const AUTOSAVE_MS = 3 * 60 * 1000;

function PostForm({ initial, id, tags, onCancel, onSaved }: { initial: PostInput; id: string | null; tags: Tag[]; onCancel: () => void; onSaved: () => void }) {
  const draftKey = `studio-draft:${id ?? "new"}`;
  const [form, setForm] = useState<PostInput>(initial);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [autosavedAt, setAutosavedAt] = useState<string | null>(null);
  const [recovered, setRecovered] = useState<PostInput | null>(null);
  const formRef = useRef(form);
  formRef.current = form;

  // Look for a local draft left behind by a crash / lost connection.
  useEffect(() => {
    const stored = window.localStorage.getItem(draftKey);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as { savedAt: string; input: PostInput };
      if (JSON.stringify(parsed.input) !== JSON.stringify(initial)) setRecovered(parsed.input);
    } catch {
      window.localStorage.removeItem(draftKey);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave every 3 minutes: always locally, and to the database for saved posts.
  useEffect(() => {
    const timer = window.setInterval(() => {
      const current = formRef.current;
      if (!current.title.trim()) return;
      window.localStorage.setItem(draftKey, JSON.stringify({ savedAt: new Date().toISOString(), input: current }));
      const stamp = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      if (id) {
        void updatePost(id, normalizeInput(current))
          .then(() => setAutosavedAt(`${stamp} (saved to your site)`))
          .catch(() => setAutosavedAt(`${stamp} (saved on this device)`));
      } else {
        setAutosavedAt(`${stamp} (saved on this device)`);
      }
    }, AUTOSAVE_MS);
    return () => window.clearInterval(timer);
  }, [draftKey, id]);

  const set = <K extends keyof PostInput>(key: K, value: PostInput[K]) => setForm((f) => ({ ...f, [key]: value }));

  function normalizeInput(input: PostInput): PostInput {
    return { ...input, slug: input.slug.trim() || slugify(input.title), published_at: new Date(input.published_at).toISOString() };
  }

  const save = useMutation({
    mutationFn: async () => {
      const payload = normalizeInput(form);
      if (id) await updatePost(id, payload);
      else await createPost(payload);
      window.localStorage.removeItem(draftKey);
    },
    onSuccess: onSaved,
    onError: (e) => setError(e instanceof Error ? e.message : "Could not save"),
  });

  const scheduled = form.published && new Date(form.published_at) > new Date();

  return (
    <section className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-20">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <h1 className="font-display text-3xl">{id ? "Edit article" : "New article"}</h1>
        <div className="flex items-center gap-3">
          {autosavedAt && <span className="text-xs text-muted-foreground">Autosaved {autosavedAt}</span>}
          <button type="button" onClick={onCancel} className="rounded-full border border-border px-5 py-2 text-sm text-muted-foreground hover:text-foreground">
            Cancel
          </button>
          <button type="button" disabled={!form.title.trim() || save.isPending} onClick={() => save.mutate()} className="rounded-full bg-foreground px-6 py-2 text-sm text-background transition-colors hover:bg-terracotta disabled:opacity-40">
            {save.isPending ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      {recovered && (
        <div className="mt-4 flex flex-wrap items-center gap-3 rounded-sm border border-amber/40 bg-amber/8 px-4 py-3 text-sm">
          <span>An unsaved autosave from this device was found.</span>
          <button type="button" className="link-underline text-amber" onClick={() => { setForm(recovered); setRecovered(null); }}>
            Restore it
          </button>
          <button type="button" className="link-underline text-muted-foreground" onClick={() => { window.localStorage.removeItem(draftKey); setRecovered(null); }}>
            Discard
          </button>
        </div>
      )}

      {error && <p className="mt-4 text-sm text-destructive">{error}</p>}

      <div className="mt-8 space-y-5">
        <div>
          <span className={label}>Title</span>
          <input
            className={`${field} mt-2 font-display text-lg`}
            value={form.title}
            onChange={(e) => {
              const title = e.target.value;
              setForm((f) => ({ ...f, title, slug: !id && (!f.slug || f.slug === slugify(f.title)) ? slugify(title) : f.slug }));
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
            <span className={label}>Publication date & time</span>
            <input type="datetime-local" className={`${field} mt-2`} value={form.published_at} onChange={(e) => set("published_at", e.target.value)} />
            <p className="mt-1 text-xs text-muted-foreground">
              {scheduled ? "Scheduled — it goes live automatically at this date and time." : "Set a future date and keep “Published” on to schedule it."}
            </p>
          </div>
        </div>

        <div>
          <span className={label}>Tags</span>
          <div className="mt-2 flex flex-wrap gap-2">
            {tags.map((t) => {
              const active = form.tag_ids.includes(t.id);
              const v = tagVisual(t.color);
              return (
                <button
                  key={t.id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => set("tag_ids", active ? form.tag_ids.filter((x) => x !== t.id) : [...form.tag_ids, t.id])}
                  style={active ? v.style : undefined}
                  className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.14em] transition-colors ${
                    active ? `${v.className} font-medium` : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {t.name}
                </button>
              );
            })}
            {tags.length === 0 && <p className="text-sm text-muted-foreground">No tags yet — create some in “Manage tags”.</p>}
          </div>
        </div>

        <div>
          <span className={label}>Publication</span>
          <input className={`${field} mt-2`} value={form.publication} onChange={(e) => set("publication", e.target.value)} placeholder="My blog (aka this website)" />
        </div>

        <div>
          <span className={label}>Excerpt</span>
          <textarea className={`${field} mt-2 min-h-24 resize-y`} value={form.excerpt} onChange={(e) => set("excerpt", e.target.value)} />
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div>
            <span className={label}>Cover image URL</span>
            <input className={`${field} mt-2`} value={form.cover_image_url ?? ""} onChange={(e) => set("cover_image_url", e.target.value || null)} />
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
            <input className={`${field} mt-2`} value={form.cover_image_alt ?? ""} onChange={(e) => set("cover_image_alt", e.target.value || null)} />
          </div>
        </div>

        {form.cover_image_url && (
          <img src={form.cover_image_url} alt={form.cover_image_alt ?? "Cover preview"} className="max-h-56 w-full rounded-sm object-cover" />
        )}

        <div className="flex flex-wrap gap-6">
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={form.published} onChange={(e) => set("published", e.target.checked)} />
            Published (visible on the site)
          </label>
          <label className="flex items-center gap-3 text-sm">
            <input type="checkbox" checked={form.featured} onChange={(e) => set("featured", e.target.checked)} />
            Featured
          </label>
        </div>

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

/* ---------------- Comments ---------------- */

type CommentFilter = "all" | CommentStatus | "needsReview";

const STATUS_TABS: { key: CommentFilter; label: string }[] = [
  { key: "needsReview", label: "Needs review" },
  { key: "pending", label: "Pending" },
  { key: "approved", label: "Approved" },
  { key: "rejected", label: "Rejected" },
  { key: "all", label: "All" },
];

const STATUS_BADGE: Record<CommentStatus, string> = {
  pending: "border-amber/50 bg-amber/10 text-amber",
  approved: "border-accent/50 bg-accent/10 text-accent",
  rejected: "border-destructive/40 bg-destructive/10 text-destructive",
};

function CommentsPanel() {
  const queryClient = useQueryClient();
  const { data: comments = [] } = useQuery(adminCommentsQuery);
  const [pendingDelete, setPendingDelete] = useState<AdminComment | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  // Lives here, not on the row: approving/dismissing/etc. often makes the
  // row itself vanish from the current filter the instant it succeeds, so a
  // confirmation shown *on the row* would disappear before anyone saw it.
  const [actionMessage, setActionMessage] = useState<string | null>(null);
  const [filter, setFilter] = useState<CommentFilter>("needsReview");
  const [query, setQuery] = useState("");

  const notifySuccess = (text: string) => {
    setActionError(null);
    setActionMessage(text);
    window.setTimeout(() => setActionMessage((current) => (current === text ? null : current)), 4000);
  };
  const notifyError = (message: string) => {
    setActionMessage(null);
    setActionError(message);
  };

  const refresh = () => { void queryClient.invalidateQueries({ queryKey: ["comments"] }); };
  const remove = useMutation({
    mutationFn: (id: string) => deleteComment(id),
    onSuccess: () => { notifySuccess("Comment deleted"); refresh(); },
    onError: (err: Error) => notifyError(err.message),
  });

  const byId = new Map(comments.map((c) => [c.id, c]));
  const counts: Record<CommentFilter, number> = {
    all: comments.length,
    needsReview: comments.filter((c) => !c.reviewed).length,
    pending: comments.filter((c) => c.status === "pending").length,
    approved: comments.filter((c) => c.status === "approved").length,
    rejected: comments.filter((c) => c.status === "rejected").length,
  };

  const q = query.trim().toLowerCase();
  const filtered = comments
    .filter((c) => (filter === "all" ? true : filter === "needsReview" ? !c.reviewed : c.status === filter))
    .filter(
      (c) =>
        !q ||
        c.name.toLowerCase().includes(q) ||
        c.email.toLowerCase().includes(q) ||
        c.body.toLowerCase().includes(q) ||
        (c.post_title ?? "").toLowerCase().includes(q),
    )
    .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  if (comments.length === 0) return <p className="mt-10 text-sm text-muted-foreground">No comments yet.</p>;

  return (
    <>
      <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-5">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setFilter(tab.key)}
            className={`rounded-sm border px-4 py-3 text-left transition-colors ${
              filter === tab.key ? "border-foreground bg-foreground/5" : "border-border hover:border-foreground/40"
            }`}
          >
            <span className="block font-display text-2xl">{counts[tab.key]}</span>
            <span className="text-xs uppercase tracking-[0.14em] text-muted-foreground">{tab.label}</span>
          </button>
        ))}
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Comments now publish instantly and are open for anyone to reply to. "Needs review" covers both that quick
        after-the-fact check and anything our spam filter held back on its own.
      </p>

      <input
        type="search"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search by name, email, article or text"
        aria-label="Search comments"
        className={`${field} mt-4`}
      />

      {actionMessage && <p className="mt-4 text-sm text-accent">{actionMessage}</p>}
      {actionError && <p className="mt-4 text-sm text-destructive">{actionError}</p>}

      {filtered.length === 0 ? (
        <p className="mt-10 text-sm text-muted-foreground">No comments match this filter.</p>
      ) : (
        <ul className="mt-6 divide-y divide-border border-b border-border">
          {filtered.map((c) => (
            <AdminCommentRow
              key={c.id}
              comment={c}
              parent={c.parent_id ? byId.get(c.parent_id) ?? null : null}
              onChanged={refresh}
              onDelete={() => setPendingDelete(c)}
              onSuccess={notifySuccess}
              onError={notifyError}
            />
          ))}
        </ul>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this comment?"
        description={
          pendingDelete
            ? `The comment by ${pendingDelete.name} will be removed permanently${pendingDelete.is_admin_reply ? "" : ", along with any replies to it"}.`
            : ""
        }
        confirmLabel="Delete comment"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => { if (pendingDelete) remove.mutate(pendingDelete.id); setPendingDelete(null); }}
      />
    </>
  );
}

function AdminCommentRow({
  comment,
  parent,
  onChanged,
  onDelete,
  onSuccess,
  onError,
}: {
  comment: AdminComment;
  parent: AdminComment | null;
  onChanged: () => void;
  onDelete: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}) {
  // Only your own replies can be edited — the database enforces this too
  // (a body edit on anything else is rejected), this just keeps the UI
  // from offering a control that would fail.
  const editable = comment.is_admin_reply;
  const [body, setBody] = useState(comment.body);
  const [replying, setReplying] = useState(false);
  const [reply, setReply] = useState("");

  const saveBody = useMutation({
    mutationFn: () => updateCommentBody(comment.id, body.trim()),
    onSuccess: () => { onSuccess("Reply updated"); onChanged(); },
    onError: (err: Error) => onError(err.message),
  });
  const moderate = useMutation({
    mutationFn: (next: CommentStatus) => moderateComment(comment.id, next),
    onSuccess: (_data, next) => { onSuccess(`Marked as ${next}`); onChanged(); },
    onError: (err: Error) => onError(err.message),
  });
  const dismiss = useMutation({
    mutationFn: () => markCommentReviewed(comment.id),
    onSuccess: () => { onSuccess("Marked as reviewed"); onChanged(); },
    onError: (err: Error) => onError(err.message),
  });
  const sendReply = useMutation({
    mutationFn: () => adminReplyToComment(comment.id, reply.trim()),
    onSuccess: () => { setReply(""); setReplying(false); onSuccess("Reply published"); onChanged(); },
    onError: (err: Error) => onError(err.message),
  });

  const anchor = `comment-${comment.id}`;
  const articleLink = comment.post_slug ? (
    <Link
      to="/articles/$slug"
      params={{ slug: comment.post_slug }}
      hash={anchor}
      target="_blank"
      className="link-underline inline-flex items-center gap-1 text-foreground"
    >
      {comment.post_title ?? "View article"}
      <ExternalLink className="h-3 w-3" />
    </Link>
  ) : (
    "Unknown article"
  );

  return (
    <li id={`admin-comment-${comment.id}`} className="scroll-mt-24 py-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm">
            <span className="font-medium">{comment.name}</span>{" "}
            <span className="text-muted-foreground">· {comment.email}</span>
            {comment.is_admin_reply && (
              <span className="ml-2 rounded-full bg-accent/15 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.14em] text-accent">
                Your reply
              </span>
            )}
            {!comment.reviewed && (
              <span className="ml-2 rounded-full bg-cobalt/15 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.14em] text-cobalt">
                New
              </span>
            )}
            {comment.auto_flagged && (
              <span className="ml-2 rounded-full bg-destructive/15 px-2 py-0.5 text-[0.6rem] uppercase tracking-[0.14em] text-destructive">
                Possible spam
              </span>
            )}
          </p>
          {parent && (
            <a href={`#admin-comment-${parent.id}`} className="link-underline mt-1 inline-block text-xs text-muted-foreground">
              ↳ in reply to {parent.name}
            </a>
          )}
          <p className="mt-1 text-xs text-muted-foreground">
            {articleLink} · {formatDateTime(comment.created_at)}
            {comment.edited_at && " · edited"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`rounded-full border px-3 py-1 text-[0.65rem] uppercase tracking-[0.14em] ${STATUS_BADGE[comment.status]}`}>
            {comment.status}
          </span>
          <button type="button" onClick={onDelete} aria-label="Delete comment" className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive">
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {editable ? (
        <>
          <textarea className={`${field} mt-3 min-h-20 resize-y`} value={body} onChange={(e) => setBody(e.target.value)} aria-label="Your reply text" />
          <div className="mt-2">
            <button type="button" disabled={body.trim() === comment.body || saveBody.isPending} onClick={() => saveBody.mutate()} className="rounded-full border border-border px-4 py-1.5 text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground disabled:opacity-40">
              Save edit
            </button>
          </div>
        </>
      ) : (
        <p className="mt-3 whitespace-pre-line rounded-sm border border-border bg-foreground/[0.02] p-3 text-sm leading-relaxed text-muted-foreground">
          {comment.body}
        </p>
      )}
      <div className="mt-2 flex flex-wrap items-center gap-3">
        {!comment.is_admin_reply && (
          <>
            <button
              type="button"
              disabled={comment.status === "approved" || moderate.isPending}
              onClick={() => moderate.mutate("approved")}
              className="rounded-full border border-accent/50 px-4 py-1.5 text-xs uppercase tracking-[0.14em] text-accent hover:bg-accent/10 disabled:opacity-40"
            >
              Approve
            </button>
            <button
              type="button"
              disabled={comment.status === "rejected" || moderate.isPending}
              onClick={() => moderate.mutate("rejected")}
              className="rounded-full border border-destructive/40 px-4 py-1.5 text-xs uppercase tracking-[0.14em] text-destructive hover:bg-destructive/10 disabled:opacity-40"
            >
              Reject
            </button>
            {!comment.reviewed && (
              <button
                type="button"
                disabled={dismiss.isPending}
                onClick={() => dismiss.mutate()}
                title="Dismiss the “new” signal without approving or rejecting"
                className="rounded-full border border-border px-4 py-1.5 text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground disabled:opacity-40"
              >
                Mark reviewed
              </button>
            )}
          </>
        )}

        <button type="button" onClick={() => setReplying((v) => !v)} className="rounded-full bg-foreground px-4 py-1.5 text-xs uppercase tracking-[0.14em] text-background">
          {replying ? "Cancel reply" : "Reply"}
        </button>
      </div>

      {replying && (
        <div className="mt-3">
          <textarea
            className={`${field} min-h-20 resize-y`}
            value={reply}
            onChange={(e) => setReply(e.target.value)}
            placeholder={`Reply to ${comment.name} (published immediately, with today's date and time)`}
            aria-label="Your reply"
          />
          <div className="mt-2 flex items-center gap-3">
            <button
              type="button"
              disabled={!reply.trim() || sendReply.isPending}
              onClick={() => sendReply.mutate()}
              className="rounded-full bg-foreground px-4 py-1.5 text-xs uppercase tracking-[0.14em] text-background disabled:opacity-40"
            >
              {sendReply.isPending ? "Publishing…" : "Publish reply"}
            </button>
          </div>
        </div>
      )}
    </li>
  );
}

/* ---------------- Contact inbox ---------------- */

function InboxPanel() {
  const queryClient = useQueryClient();
  const { data: messages = [] } = useQuery(contactMessagesQuery);
  const [pendingDelete, setPendingDelete] = useState<ContactMessage | null>(null);

  const refresh = () => { void queryClient.invalidateQueries({ queryKey: ["contact-messages"] }); };
  const handled = useMutation({ mutationFn: ({ id, value }: { id: string; value: boolean }) => setContactHandled(id, value), onSuccess: refresh });
  const remove = useMutation({ mutationFn: (id: string) => deleteContactMessage(id), onSuccess: refresh });

  if (messages.length === 0) return <p className="mt-10 text-sm text-muted-foreground">No messages yet.</p>;

  return (
    <>
      <ul className="mt-8 divide-y divide-border border-b border-border">
        {messages.map((m) => (
          <li key={m.id} className="py-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm">
                <span className="font-medium">{m.name}</span>{" "}
                <a href={`mailto:${m.email}`} className="link-underline text-muted-foreground">{m.email}</a>
              </p>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">{formatDate(m.created_at)}</span>
                <button
                  type="button"
                  onClick={() => handled.mutate({ id: m.id, value: !m.handled })}
                  className={`rounded-full border px-4 py-1.5 text-xs uppercase tracking-[0.14em] transition-colors ${
                    m.handled ? "border-accent/50 bg-accent/10 text-accent" : "border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {m.handled ? "Replied" : "Mark replied"}
                </button>
                <button type="button" onClick={() => setPendingDelete(m)} aria-label="Delete message" className="rounded-full border border-border p-2 text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            {m.subject && <p className="mt-2 font-display text-lg">{m.subject}</p>}
            <p className="mt-2 whitespace-pre-line text-sm leading-relaxed text-muted-foreground">{m.message}</p>
          </li>
        ))}
      </ul>
      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this message?"
        description={pendingDelete ? `The message from ${pendingDelete.name} will be removed permanently.` : ""}
        confirmLabel="Delete message"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => { if (pendingDelete) remove.mutate(pendingDelete.id); setPendingDelete(null); }}
      />
    </>
  );
}

/* ---------------- Tag manager ---------------- */

const presetSwatch: Record<string, string> = {
  cobalt: "#2f5fd8",
  plum: "#7b3fa0",
  foreground: "#221f1c",
  accent: "#c2418a",
  amber: "#d99a2b",
  terracotta: "#c25b3f",
};

function ColorPicker({ value, onChange }: { value: string; onChange: (value: string) => void }) {
  const { hex, label: colorLabel } = parseColor(value);
  const [customHex, setCustomHex] = useState(hex ?? "#7b3fa0");
  const [customName, setCustomName] = useState(hex ? colorLabel : "");

  return (
    <div className="w-full space-y-2">
      <div className="flex flex-wrap gap-2">
        {tagColorOptions.map((c) => (
          <button
            key={c}
            type="button"
            title={c}
            aria-label={`Use ${c}`}
            aria-pressed={value === c}
            onClick={() => onChange(c)}
            style={{ backgroundColor: presetSwatch[c] }}
            className={`h-7 w-7 rounded-full border-2 transition-transform ${value === c ? "scale-110 border-foreground" : "border-transparent hover:scale-105"}`}
          />
        ))}
        <span className="inline-flex items-center rounded-full border px-3 py-0.5 text-[0.6rem] uppercase tracking-[0.18em]" style={hex ? { color: hex, borderColor: `${hex}66`, backgroundColor: `${hex}14` } : undefined}>
          <span className={hex ? "" : toneClassFallback(value)}>{colorLabel}</span>
        </span>
      </div>
      <div className="flex flex-wrap items-center gap-2">
        <input type="color" value={customHex} onChange={(e) => setCustomHex(e.target.value)} aria-label="Custom colour shade" className="h-9 w-12 cursor-pointer rounded-sm border border-border bg-card" />
        <input className={`${field} w-40`} value={customName} onChange={(e) => setCustomName(e.target.value)} placeholder="Colour name" aria-label="Custom colour name" />
        <button type="button" onClick={() => onChange(`${customHex}|${customName.trim() || "Custom"}`)} className="rounded-full border border-border px-4 py-1.5 text-xs uppercase tracking-[0.14em] text-muted-foreground hover:text-foreground">
          Use this colour
        </button>
      </div>
    </div>
  );
}

function toneClassFallback(value: string) {
  const { raw } = parseColor(value);
  return `text-${raw === "foreground" ? "foreground" : raw}`;
}

function TagManager({ tags, onClose, onChanged }: { tags: Tag[]; onClose: () => void; onChanged: () => void }) {
  const [name, setName] = useState("");
  const [color, setColor] = useState("accent");
  const [error, setError] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Tag | null>(null);

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

        <ul className="mt-5 space-y-5">
          {tags.map((t) => (
            <li key={t.id} className="space-y-2 border-b border-border pb-4">
              <div className="flex flex-wrap items-center gap-2">
                <input
                  className={`${field} flex-1`}
                  defaultValue={t.name}
                  onBlur={(e) => {
                    const value = e.target.value.trim();
                    if (value && value !== t.name) void run(() => updateTag(t.id, value, slugify(value), t.color));
                  }}
                />
                <button type="button" aria-label={`Delete tag ${t.name}`} onClick={() => setPendingDelete(t)} className="rounded-full border border-border p-2.5 text-muted-foreground hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
              <ColorPicker value={t.color} onChange={(c) => void run(() => updateTag(t.id, t.name, t.slug, c))} />
            </li>
          ))}
        </ul>

        <div className="mt-6 space-y-3 border-t border-border pt-5">
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="New tag name" />
          <ColorPicker value={color} onChange={setColor} />
          <button
            type="button"
            disabled={!name.trim()}
            onClick={() => void run(async () => { await createTag(name.trim(), slugify(name), color); setName(""); })}
            className="rounded-full bg-foreground px-5 py-2.5 text-sm text-background disabled:opacity-40"
          >
            Add tag
          </button>
        </div>

        <button type="button" onClick={onClose} className="mt-6 text-xs uppercase tracking-[0.18em] text-muted-foreground hover:text-foreground">
          Close
        </button>
      </div>

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete this tag?"
        description={pendingDelete ? `“${pendingDelete.name}” will be removed from every article.` : ""}
        confirmLabel="Delete tag"
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => { if (pendingDelete) void run(() => deleteTag(pendingDelete.id)); setPendingDelete(null); }}
      />
    </div>
  );
}