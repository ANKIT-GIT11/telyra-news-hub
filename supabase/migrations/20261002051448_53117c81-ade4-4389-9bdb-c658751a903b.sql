UPDATE public.articles SET status='approved' WHERE status='published';
ALTER TABLE public.articles ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE public.articles ADD CONSTRAINT articles_status_check CHECK (status IN ('pending','approved','rejected','archived'));
ALTER TABLE public.articles ADD COLUMN archived_at timestamptz;

DROP POLICY IF EXISTS "Public reads published" ON public.articles;
CREATE POLICY "Public reads approved" ON public.articles FOR SELECT TO anon, authenticated USING (status = 'approved');

CREATE OR REPLACE FUNCTION public.approve_draft(_id uuid)
 RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE new_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  INSERT INTO public.articles (title, subheadline, content, source_url, category, published_at, status, affiliate_title, affiliate_url, editor_note)
  SELECT title, subheadline, content, source_url, category, now(), 'approved', affiliate_title, affiliate_url, editor_note FROM public.review_queue WHERE id=_id
  RETURNING id INTO new_id;
  IF new_id IS NULL THEN RAISE EXCEPTION 'Draft not found'; END IF;
  DELETE FROM public.review_queue WHERE id=_id;
  RETURN new_id;
END; $function$;

ALTER TABLE public.articles REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.articles;