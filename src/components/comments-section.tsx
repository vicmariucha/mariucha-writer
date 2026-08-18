import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { CornerDownRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { buildCommentThreads, commentsQuery, formatDateTime, type Comment } from "@/lib/blog";

const field =
  "w-full rounded-sm border border-border bg-card px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent";

type Draft = { name: string; email: string; body: string };
const EMPTY_DRAFT: Draft = { name: "", email: "", body: "" };

export function CommentsSection({ postId }: { postId: string }) {
  const { data: comments = [] } = useQuery(commentsQuery(postId));
  const threads = buildCommentThreads(comments);
  const total = comments.length;

  return (
    <section className="mt-16 border-t border-border pt-10">
      <p className="eyebrow">Comments</p>
      <h2 className="mt-3 font-display text-2xl sm:text-3xl">
        {total === 0 ? "Be the first to say something" : `${total} ${total === 1 ? "thought" : "thoughts"} so far`}
      </h2>

      <CommentForm postId={postId} parentId={null} />

      <ul className="mt-10 space-y-8">
        {threads.map((thread) => (
          <li key={thread.id} id={`comment-${thread.id}`} className="scroll-mt-24 border-l-2 border-plum/40 pl-5">
            <CommentBody comment={thread} />
            <ReplyToggle postId={postId} rootId={thread.id} />

            {thread.replies.length > 0 && (
              <ul className="mt-5 space-y-5 border-l border-border/70 pl-5">
                {thread.replies.map((reply) => (
                  <li key={reply.id} id={`comment-${reply.id}`} className="scroll-mt-24">
                    <CommentBody comment={reply} />
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}

function CommentBody({ comment }: { comment: Comment }) {
  return (
    <div className={comment.is_admin_reply ? "rounded-sm border border-accent/30 bg-accent/5 p-4" : ""}>
      <p className="flex items-center gap-2 text-sm font-medium">
        {comment.name}
        {comment.is_admin_reply && (
          <span className="rounded-full bg-accent/15 px-2 py-0.5 text-[0.65rem] uppercase tracking-[0.14em] text-accent">
            Vic replied
          </span>
        )}
      </p>
      <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(comment.created_at)}</p>
      <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">{comment.body}</p>
    </div>
  );
}

function ReplyToggle({ postId, rootId }: { postId: string; rootId: string }) {
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mt-3 inline-flex items-center gap-1.5 text-xs uppercase tracking-[0.14em] text-muted-foreground transition-colors hover:text-foreground"
      >
        <CornerDownRight className="h-3.5 w-3.5" />
        Reply
      </button>
    );
  }

  return (
    <div className="mt-4">
      <CommentForm postId={postId} parentId={rootId} onPosted={() => setOpen(false)} compact />
    </div>
  );
}

function CommentForm({
  postId,
  parentId,
  onPosted,
  compact,
}: {
  postId: string;
  parentId: string | null;
  onPosted?: () => void;
  compact?: boolean;
}) {
  const queryClient = useQueryClient();
  const [draft, setDraft] = useState<Draft>(EMPTY_DRAFT);
  const [doneMessage, setDoneMessage] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: async () => {
      // A dedicated function instead of a plain insert: it decides and
      // reports the comment's status (published instantly, or briefly
      // held for a spam check) without ever needing to read moderation
      // fields the visitor otherwise couldn't see.
      const { data, error } = await supabase.rpc("post_comment", {
        _post_id: postId,
        _parent_id: parentId,
        _name: draft.name.trim(),
        _email: draft.email.trim(),
        _body: draft.body.trim(),
      });
      if (error) throw error;
      return data;
    },
    onSuccess: async (data) => {
      setDraft(EMPTY_DRAFT);
      const heldBack = (data as { status?: string } | null)?.status === "pending";
      setDoneMessage(
        heldBack
          ? "Thanks! Your comment is going through a quick spam check and will appear shortly if it clears."
          : "Thanks! Your comment is live.",
      );
      setTimeout(() => setDoneMessage(null), 6000);
      onPosted?.();
      await queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  const emailTouched = draft.email.trim().length > 0;
  const emailValid = /^\S+@\S+\.\S+$/.test(draft.email.trim());
  const valid = draft.name.trim().length > 0 && emailValid && draft.body.trim().length > 0;

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) mutation.mutate();
      }}
      className={compact ? "space-y-3" : "mt-6 space-y-3"}
    >
      <div className="grid gap-3 sm:grid-cols-2">
        <input
          className={field}
          value={draft.name}
          onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))}
          placeholder="Your name"
          maxLength={80}
          aria-label="Your name"
        />
        <div>
          <input
            className={field}
            type="email"
            value={draft.email}
            onChange={(e) => setDraft((d) => ({ ...d, email: e.target.value }))}
            placeholder="Your email (not published)"
            maxLength={200}
            aria-label="Your email"
          />
          {emailTouched && !emailValid && <p className="mt-1 text-xs text-destructive">Enter a valid email address.</p>}
        </div>
      </div>
      <textarea
        className={`${field} resize-y ${compact ? "min-h-20" : "min-h-28"}`}
        value={draft.body}
        onChange={(e) => setDraft((d) => ({ ...d, body: e.target.value }))}
        placeholder={parentId ? "Write your reply" : "Say something kind, curious or mildly critical"}
        maxLength={3000}
        aria-label={parentId ? "Your reply" : "Your comment"}
      />
      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          disabled={!valid || mutation.isPending}
          className="rounded-full bg-foreground px-6 py-2.5 text-sm text-background transition-all duration-300 hover:bg-terracotta disabled:opacity-40"
        >
          {mutation.isPending ? "Posting…" : parentId ? "Post reply" : "Post comment"}
        </button>
        {doneMessage && <span className="text-sm text-accent">{doneMessage}</span>}
        {mutation.isError && <span className="text-sm text-destructive">Something went wrong. Try again?</span>}
      </div>
    </form>
  );
}
