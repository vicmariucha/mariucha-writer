-- 1. Featured flag
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS featured boolean NOT NULL DEFAULT false;

-- 2. Scheduled publishing: public sees only published posts whose date has arrived
DROP POLICY IF EXISTS "posts public read published" ON public.posts;
CREATE POLICY "posts public read published" ON public.posts
  FOR SELECT TO anon, authenticated
  USING (published = true AND published_at <= now());

CREATE OR REPLACE FUNCTION public.increment_post_views(_slug text)
RETURNS integer LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  UPDATE public.posts SET views = views + 1
  WHERE slug = _slug AND published = true AND published_at <= now() RETURNING views;
$$;

CREATE OR REPLACE FUNCTION public.increment_post_likes(_slug text, _delta integer)
RETURNS integer LANGUAGE sql SECURITY DEFINER SET search_path TO 'public' AS $$
  UPDATE public.posts SET likes = GREATEST(0, likes + LEAST(1, GREATEST(-1, _delta)))
  WHERE slug = _slug AND published = true AND published_at <= now() RETURNING likes;
$$;

-- 3. Multiple tags per post
CREATE TABLE IF NOT EXISTS public.post_tags (
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  tag_id uuid NOT NULL REFERENCES public.tags(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (post_id, tag_id)
);
GRANT SELECT ON public.post_tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.post_tags TO authenticated;
GRANT ALL ON public.post_tags TO service_role;
ALTER TABLE public.post_tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "post_tags public read" ON public.post_tags
  FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "post_tags admin write" ON public.post_tags
  FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

INSERT INTO public.post_tags (post_id, tag_id)
SELECT id, tag_id FROM public.posts WHERE tag_id IS NOT NULL
ON CONFLICT DO NOTHING;

-- 4. Comment replies + admin moderation, and hide commenter emails from visitors
ALTER TABLE public.comments
  ADD COLUMN IF NOT EXISTS reply_body text,
  ADD COLUMN IF NOT EXISTS replied_at timestamptz,
  ADD COLUMN IF NOT EXISTS reply_notified_at timestamptz;

CREATE POLICY "comments admin update" ON public.comments
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

REVOKE SELECT ON public.comments FROM anon;
GRANT SELECT (id, post_id, name, body, reply_body, replied_at, created_at) ON public.comments TO anon;
GRANT SELECT (id, post_id, name, body, reply_body, replied_at, created_at) ON public.comments TO authenticated;
GRANT SELECT ON public.comments TO service_role;

-- 5. Contact form messages
CREATE TABLE public.contact_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  email text NOT NULL,
  subject text NOT NULL DEFAULT '',
  message text NOT NULL,
  handled boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.contact_messages TO anon, authenticated;
GRANT SELECT, UPDATE, DELETE ON public.contact_messages TO authenticated;
GRANT ALL ON public.contact_messages TO service_role;
ALTER TABLE public.contact_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "contact insert public" ON public.contact_messages
  FOR INSERT TO anon, authenticated
  WITH CHECK (
    length(name) BETWEEN 1 AND 120
    AND length(email) BETWEEN 3 AND 200
    AND length(subject) <= 200
    AND length(message) BETWEEN 1 AND 5000
  );
CREATE POLICY "contact admin read" ON public.contact_messages
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "contact admin manage" ON public.contact_messages
  FOR UPDATE TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE POLICY "contact admin delete" ON public.contact_messages
  FOR DELETE TO authenticated USING (public.is_admin());