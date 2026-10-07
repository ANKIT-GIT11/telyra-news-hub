ALTER TABLE public.articles ADD COLUMN image_url text, ADD COLUMN image_path text;
ALTER TABLE public.review_queue ADD COLUMN image_url text, ADD COLUMN image_path text;
CREATE UNIQUE INDEX articles_unique_image_url ON public.articles(image_url) WHERE image_url IS NOT NULL;
CREATE UNIQUE INDEX articles_unique_image_path ON public.articles(image_path) WHERE image_path IS NOT NULL;
CREATE UNIQUE INDEX queue_unique_image_url ON public.review_queue(image_url) WHERE image_url IS NOT NULL;
CREATE UNIQUE INDEX queue_unique_image_path ON public.review_queue(image_path) WHERE image_path IS NOT NULL;
CREATE OR REPLACE FUNCTION public.validate_article_image() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NEW.image_url IS NOT NULL OR NEW.image_path IS NOT NULL THEN
   IF NEW.image_url IS NULL OR NEW.image_path IS NULL OR NEW.image_url !~ '^/api/public/article-image/[0-9a-f-]{36}$' OR NEW.image_path !~ '^[0-9a-f-]{36}/[0-9a-f]{64}\.(jpg|png|webp)$' THEN RAISE EXCEPTION 'A dedicated uploaded header image is required'; END IF;
   IF NOT EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id='article-images' AND name=NEW.image_path) THEN RAISE EXCEPTION 'Header image upload not found'; END IF;
   IF TG_TABLE_NAME='review_queue' AND EXISTS(SELECT 1 FROM public.articles WHERE image_path=NEW.image_path OR image_url=NEW.image_url) THEN RAISE EXCEPTION 'This header image already belongs to a published article'; END IF;
 END IF;
 IF TG_TABLE_NAME='articles' AND NEW.status='approved' AND (NEW.image_url IS NULL OR NEW.image_path IS NULL) THEN RAISE EXCEPTION 'Upload a unique header image before approving'; END IF;
 RETURN NEW;
END; $$;
CREATE TRIGGER validate_article_header BEFORE INSERT OR UPDATE OF image_url,image_path,status ON public.articles FOR EACH ROW EXECUTE FUNCTION public.validate_article_image();
CREATE TRIGGER validate_draft_header BEFORE INSERT OR UPDATE OF image_url,image_path ON public.review_queue FOR EACH ROW EXECUTE FUNCTION public.validate_article_image();
DROP POLICY "Public reads approved" ON public.articles;
CREATE POLICY "Public reads approved" ON public.articles FOR SELECT TO anon,authenticated USING(status='approved' AND image_url IS NOT NULL AND image_path IS NOT NULL);
CREATE OR REPLACE FUNCTION public.approve_draft(_id uuid) RETURNS uuid LANGUAGE plpgsql SECURITY DEFINER SET search_path=public AS $$
DECLARE new_id uuid;
BEGIN
 IF NOT public.has_role(auth.uid(),'admin') THEN RAISE EXCEPTION 'Forbidden'; END IF;
 INSERT INTO public.articles(title,subheadline,content,source_url,category,published_at,status,affiliate_title,affiliate_url,editor_note,image_url,image_path)
 SELECT title,subheadline,content,source_url,category,now(),'approved',affiliate_title,affiliate_url,editor_note,image_url,image_path FROM public.review_queue WHERE id=_id RETURNING id INTO new_id;
 IF new_id IS NULL THEN RAISE EXCEPTION 'Draft not found'; END IF;
 DELETE FROM public.review_queue WHERE id=_id;
 RETURN new_id;
END; $$;
CREATE POLICY "Editors upload article images" ON storage.objects FOR INSERT TO authenticated WITH CHECK(bucket_id='article-images' AND public.has_role(auth.uid(),'admin'));
CREATE POLICY "Editors read article images" ON storage.objects FOR SELECT TO authenticated USING(bucket_id='article-images' AND public.has_role(auth.uid(),'admin'));
