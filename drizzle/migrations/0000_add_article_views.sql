ALTER TABLE public.articles ADD COLUMN views integer NOT NULL DEFAULT 0;

CREATE OR REPLACE FUNCTION public.increment_article_views(_id uuid)
RETURNS integer
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  UPDATE public.articles
  SET views = views + 1
  WHERE id = _id AND status = 'approved'
  RETURNING views
$$;

GRANT EXECUTE ON FUNCTION public.increment_article_views(uuid) TO anon;
GRANT EXECUTE ON FUNCTION public.increment_article_views(uuid) TO authenticated;