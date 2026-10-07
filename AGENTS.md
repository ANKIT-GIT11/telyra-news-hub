<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

# Design system

- Telyra uses the "Frosted editorial" system: Playfair Display headlines, Inter body, JetBrains Mono labels; all colors are oklch tokens in src/styles.css and glass surfaces come from the `glass` / `glass-soft` utilities. Never hardcode colors in components.
- Article images live in src/assets and are imported in src/lib/news-data.ts (single source of demo content). Why: keeps the whole demo newsroom editable in one file.
- Published articles require unique images in the private article-images bucket, served through a public endpoint that first verifies approved-row visibility; uploads are admin-only and content-hash uniqueness prevents byte-identical reuse. Why: private storage remains protected while approved images are shareable.
- Public content never substitutes demo articles or shared fallback images. Why: only reviewed, uniquely illustrated stories may appear live.
- Live news: `articles` (public published) and `review_queue` (admin-only) tables; RSS→Gemini ingestion lives in src/lib/ingest.server.ts, triggered from /admin or POST /api/public/ingest (cron secret). Why: TanStack server functions/routes replace Edge Functions in this stack.
- Admins are granted via the `user_roles` table; approval runs the `approve_draft` database function so move+delete is atomic.
- Site-wide trending content is read from approved articles ordered by views through a public server function. Why: one RLS-respecting source keeps the ticker consistent on every route.
