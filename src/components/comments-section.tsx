import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { commentsQuery, formatDateTime } from "@/lib/blog";

const field = "w-full rounded-sm border border-border bg-card px-4 py-2.5 text-sm outline-none transition-colors placeholder:text-muted-foreground focus:border-accent";

export function CommentsSection({ postId }: { postId: string }) {
  const queryClient = useQueryClient();
  const { data: comments = [] } = useQuery(commentsQuery(postId));
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [body, setBody] = useState("");
  const [done, setDone] = useState(false);

  const mutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("comments").insert({ post_id: postId, name: name.trim(), email: email.trim(), body: body.trim() });
      if (error) throw error;
    },
    onSuccess: async () => {
      setName("");
      setEmail("");
      setBody("");
      setDone(true);
      setTimeout(() => setDone(false), 4000);
      await queryClient.invalidateQueries({ queryKey: ["comments", postId] });
    },
  });

  const emailTouched = email.trim().length > 0;
  const emailValid = /^\S+@\S+\.\S+$/.test(email.trim());
  const valid = name.trim().length > 0 && emailValid && body.trim().length > 0;

  return (
    <section className="mt-16 border-t border-border pt-10">
      <p className="eyebrow">Comments</p>
      <h2 className="mt-3 font-display text-2xl sm:text-3xl">
        {comments.length === 0 ? "Be the first to say something" : `${comments.length} thoughts so far`}
      </h2>

      <form onSubmit={(e) => { e.preventDefault(); if (valid) mutation.mutate(); }} className="mt-6 space-y-3">
        <div className="grid gap-3 sm:grid-cols-2">
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" maxLength={80} aria-label="Your name" />
          <div>
            <input className={field} type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email (not published)" maxLength={200} aria-label="Your email" />
            {emailTouched && !emailValid && <p className="mt-1 text-xs text-destructive">Enter a valid email address.</p>}
          </div>
        </div>
        <textarea className={`${field} min-h-28 resize-y`} value={body} onChange={(e) => setBody(e.target.value)} placeholder="Say something kind, curious or mildly critical" maxLength={3000} aria-label="Your comment" />
        <div className="flex flex-wrap items-center gap-4">
          <button type="submit" disabled={!valid || mutation.isPending} className="rounded-full bg-foreground px-6 py-2.5 text-sm text-background transition-all duration-300 hover:bg-terracotta disabled:opacity-40">
            {mutation.isPending ? "Posting…" : "Post comment"}
          </button>
          {done && <span className="text-sm text-accent">Thank you — it's live.</span>}
          {mutation.isError && <span className="text-sm text-destructive">Something went wrong. Try again?</span>}
        </div>
      </form>

      <ul className="mt-10 space-y-6">
        {comments.map((c) => (
          <li key={c.id} id={`comment-${c.id}`} className="scroll-mt-24 border-l-2 border-plum/40 pl-5">
            <p className="text-sm font-medium">{c.name}</p>
            <p className="mt-1 text-xs text-muted-foreground">{formatDateTime(c.created_at)}</p>
            <p className="mt-3 whitespace-pre-line leading-relaxed text-muted-foreground">{c.body}</p>
            {c.reply_body && (
              <div className="mt-4 rounded-sm border border-accent/30 bg-accent/5 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-accent">Vic replied</p>
                <p className="mt-2 whitespace-pre-line text-sm leading-relaxed">{c.reply_body}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </section>
  );
}