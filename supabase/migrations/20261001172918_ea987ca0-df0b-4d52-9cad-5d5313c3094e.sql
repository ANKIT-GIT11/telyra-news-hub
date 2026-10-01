ALTER TABLE public.review_queue ADD COLUMN editor_note text;
ALTER TABLE public.articles ADD COLUMN editor_note text;

CREATE TABLE public.subscribers (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email text NOT NULL UNIQUE CHECK (char_length(email) BETWEEN 5 AND 255 AND email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  created_at timestamptz NOT NULL DEFAULT now()
);
GRANT INSERT ON public.subscribers TO anon, authenticated;
GRANT SELECT, DELETE ON public.subscribers TO authenticated;
GRANT ALL ON public.subscribers TO service_role;
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can subscribe" ON public.subscribers FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "Admins read subscribers" ON public.subscribers FOR SELECT TO authenticated USING (public.has_role(auth.uid(),'admin'));
CREATE POLICY "Admins delete subscribers" ON public.subscribers FOR DELETE TO authenticated USING (public.has_role(auth.uid(),'admin'));

CREATE OR REPLACE FUNCTION public.approve_draft(_id uuid)
 RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public'
AS $function$
DECLARE new_id uuid;
BEGIN
  IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
  INSERT INTO public.articles (title, subheadline, content, source_url, category, published_at, status, affiliate_title, affiliate_url, editor_note)
  SELECT title, subheadline, content, source_url, category, now(), 'published', affiliate_title, affiliate_url, editor_note FROM public.review_queue WHERE id=_id
  RETURNING id INTO new_id;
  IF new_id IS NULL THEN RAISE EXCEPTION 'Draft not found'; END IF;
  DELETE FROM public.review_queue WHERE id=_id;
  RETURN new_id;
END; $function$;