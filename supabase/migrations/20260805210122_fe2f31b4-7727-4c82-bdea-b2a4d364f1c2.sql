-- 1) Comments: stop exposing email publicly
DROP POLICY IF EXISTS "comments public read" ON public.comments;

CREATE POLICY "comments admin read" ON public.comments
  FOR SELECT TO authenticated
  USING (public.is_admin());

CREATE OR REPLACE VIEW public.comments_public
WITH (security_invoker = off) AS
  SELECT id, post_id, name, body, reply_body, replied_at, created_at
  FROM public.comments;

GRANT SELECT ON public.comments_public TO anon, authenticated;

-- 2) Role helpers become SECURITY INVOKER (self role checks respect RLS)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path TO 'public' AS $$
  SELECT EXISTS (SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role);
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean LANGUAGE sql STABLE SECURITY INVOKER SET search_path TO 'public' AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles
    WHERE user_id = auth.uid() AND role = 'admin'::public.app_role
  );
$$;

-- 3) Lock down remaining SECURITY DEFINER functions
REVOKE EXECUTE ON FUNCTION public.owner_exists() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_post_views(text) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.increment_post_likes(text, integer) FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.grant_first_admin() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;

GRANT EXECUTE ON FUNCTION public.owner_exists() TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_post_views(text) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_post_likes(text, integer) TO service_role;