ALTER VIEW public.comments_public SET (security_invoker = on);

CREATE POLICY "comments public read safe" ON public.comments
  FOR SELECT TO anon, authenticated
  USING (true);

REVOKE SELECT ON public.comments FROM anon, authenticated;
GRANT SELECT (id, post_id, name, body, reply_body, replied_at, created_at)
  ON public.comments TO anon, authenticated;
GRANT SELECT ON public.comments TO service_role;