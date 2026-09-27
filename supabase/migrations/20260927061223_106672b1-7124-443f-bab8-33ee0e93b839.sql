ALTER TABLE public.articles ADD COLUMN affiliate_title text, ADD COLUMN affiliate_url text;
ALTER TABLE public.review_queue ADD COLUMN affiliate_title text, ADD COLUMN affiliate_url text;

CREATE OR REPLACE FUNCTION public.approve_draft(_id uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE new_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  INSERT INTO public.articles (title, subheadline, content, source_url, category, published_at, status, affiliate_title, affiliate_url)
  SELECT title, subheadline, content, source_url, category, now(), 'published', affiliate_title, affiliate_url FROM public.review_queue WHERE id=_id
  RETURNING id INTO new_id;
  IF new_id IS NULL THEN RAISE EXCEPTION 'Draft not found'; END IF;
  DELETE FROM public.review_queue WHERE id=_id;
  RETURN new_id;
END; $$;
REVOKE EXECUTE ON FUNCTION public.approve_draft(uuid) FROM public, anon;
GRANT EXECUTE ON FUNCTION public.approve_draft(uuid) TO authenticated;