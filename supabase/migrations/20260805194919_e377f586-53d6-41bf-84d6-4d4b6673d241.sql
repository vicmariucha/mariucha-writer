
CREATE TYPE public.app_role AS ENUM ('admin');

CREATE TABLE public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  role public.app_role NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);
GRANT SELECT ON public.user_roles TO authenticated;
GRANT ALL ON public.user_roles TO service_role;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
CREATE POLICY "users read own roles" ON public.user_roles FOR SELECT TO authenticated USING (user_id = auth.uid());

CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT public.has_role(auth.uid(), 'admin'::public.app_role);
$$;

CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

CREATE TABLE public.tags (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  slug text NOT NULL UNIQUE,
  color text NOT NULL DEFAULT 'accent',
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.tags TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.tags TO authenticated;
GRANT ALL ON public.tags TO service_role;
ALTER TABLE public.tags ENABLE ROW LEVEL SECURITY;
CREATE POLICY "tags public read" ON public.tags FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "tags admin write" ON public.tags FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE TABLE public.posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text NOT NULL UNIQUE,
  title text NOT NULL,
  excerpt text NOT NULL DEFAULT '',
  body_html text NOT NULL DEFAULT '',
  cover_image_url text,
  cover_image_alt text,
  tag_id uuid REFERENCES public.tags(id) ON DELETE SET NULL,
  publication text NOT NULL DEFAULT '',
  published boolean NOT NULL DEFAULT false,
  published_at timestamptz NOT NULL DEFAULT now(),
  views integer NOT NULL DEFAULT 0,
  likes integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.posts TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.posts TO authenticated;
GRANT ALL ON public.posts TO service_role;
ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "posts public read published" ON public.posts FOR SELECT TO anon, authenticated USING (published = true);
CREATE POLICY "posts admin read all" ON public.posts FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "posts admin write" ON public.posts FOR ALL TO authenticated USING (public.is_admin()) WITH CHECK (public.is_admin());
CREATE TRIGGER posts_updated_at BEFORE UPDATE ON public.posts FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.posts(id) ON DELETE CASCADE,
  name text NOT NULL,
  email text NOT NULL,
  body text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT (id, post_id, name, body, created_at) ON public.comments TO anon;
GRANT INSERT ON public.comments TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.comments TO authenticated;
GRANT ALL ON public.comments TO service_role;
ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "comments public read" ON public.comments FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "comments public insert" ON public.comments FOR INSERT TO anon, authenticated WITH CHECK (
  length(name) BETWEEN 1 AND 80 AND length(email) BETWEEN 3 AND 200 AND length(body) BETWEEN 1 AND 3000
);
CREATE POLICY "comments admin delete" ON public.comments FOR DELETE TO authenticated USING (public.is_admin());

CREATE OR REPLACE FUNCTION public.increment_post_views(_slug text)
RETURNS integer LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.posts SET views = views + 1 WHERE slug = _slug AND published = true RETURNING views;
$$;
GRANT EXECUTE ON FUNCTION public.increment_post_views(text) TO anon, authenticated;

CREATE OR REPLACE FUNCTION public.increment_post_likes(_slug text, _delta integer)
RETURNS integer LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = public AS $$
  UPDATE public.posts SET likes = GREATEST(0, likes + LEAST(1, GREATEST(-1, _delta)))
  WHERE slug = _slug AND published = true RETURNING likes;
$$;
GRANT EXECUTE ON FUNCTION public.increment_post_likes(text, integer) TO anon, authenticated;

CREATE POLICY "post images read" ON storage.objects FOR SELECT TO anon, authenticated USING (bucket_id = 'post-images');
CREATE POLICY "post images admin write" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'post-images' AND public.is_admin());
CREATE POLICY "post images admin delete" ON storage.objects FOR DELETE TO authenticated USING (bucket_id = 'post-images' AND public.is_admin());

INSERT INTO public.tags (name, slug, color) VALUES
  ('Code','code','cobalt'),
  ('AI','ai','plum'),
  ('Space','space','foreground'),
  ('Science','science','accent'),
  ('Web Dev','web-dev','amber'),
  ('Spider-Man','spider-man','terracotta');
