CREATE UNIQUE INDEX articles_unique_image_content ON public.articles ((split_part(image_path,'/',2))) WHERE image_path IS NOT NULL;
CREATE UNIQUE INDEX queue_unique_image_content ON public.review_queue ((split_part(image_path,'/',2))) WHERE image_path IS NOT NULL;
CREATE OR REPLACE FUNCTION public.validate_article_image() RETURNS trigger LANGUAGE plpgsql SET search_path=public AS $$
BEGIN
 IF NEW.image_url IS NOT NULL OR NEW.image_path IS NOT NULL THEN
   IF NEW.image_url IS NULL OR NEW.image_path IS NULL OR NEW.image_url !~ '^/api/public/article-image/[0-9a-f-]{36}$' OR NEW.image_path !~ '^[0-9a-f-]{36}/[0-9a-f]{64}\.(jpg|png|webp)$' THEN RAISE EXCEPTION 'A dedicated uploaded header image is required'; END IF;
   IF NOT EXISTS (SELECT 1 FROM storage.objects WHERE bucket_id='article-images' AND name=NEW.image_path) THEN RAISE EXCEPTION 'Header image upload not found'; END IF;
   IF TG_TABLE_NAME='review_queue' AND EXISTS(SELECT 1 FROM public.articles WHERE split_part(image_path,'/',2)=split_part(NEW.image_path,'/',2) OR image_url=NEW.image_url) THEN RAISE EXCEPTION 'This header image already belongs to a published article'; END IF;
   IF TG_TABLE_NAME='articles' AND EXISTS(SELECT 1 FROM public.review_queue WHERE split_part(image_path,'/',2)=split_part(NEW.image_path,'/',2) AND image_path<>NEW.image_path) THEN RAISE EXCEPTION 'This image belongs to another draft'; END IF;
 END IF;
 IF TG_TABLE_NAME='articles' AND NEW.status='approved' AND (NEW.image_url IS NULL OR NEW.image_path IS NULL) THEN RAISE EXCEPTION 'Upload a unique header image before approving'; END IF;
 RETURN NEW;
END; $$;