# Telyra production pre-flight plan

## 1. Deployment setup: already clean, but not a plain SPA
- The build settings match Lovable's standard setup. There is no Vercel adapter and no routing workaround file.
- **Correction to the brief:** Telyra runs on TanStack Start with server rendering. Lovable requires this setup, and it is also why refreshing any page never gives a 404. Removing server rendering and Nitro would break the build, sign-in and the story fetcher. **No change.**
- Hosting on Vercel is outside what Lovable supports. The native route is Lovable's Publish button, which works with no extra settings.

## 2. Database access rules
The rules below already cover most of this. Tightened rules:

| Table | Public visitors | Signed-in admin | Automation pipeline (service role) |
|---|---|---|---|
| articles | Read published stories only | Read, add, edit, delete | Full access |
| review_queue | No access | Read, add, edit, delete | Full access |

- The service role always skips access rules. Its "full access" is automatic, so no policy is needed for it.
- The admin rules stay in place. Without them, the Approve button and the affiliate boxes on /admin would stop working.
- Changes: drop any leftover broad rules, and remove the public role's permission to add, edit or delete. The public role keeps read access to articles only. No columns or tables change.

## 3. Page titles, descriptions and links
- Article pages already set their own title and description from the story's headline and summary. I will also add a canonical link and og:url.
- **Tags:** there is no tags column, and the brief rules out schema changes. I will skip tags unless you approve adding a column.
- **Clean links:** today a live story's link looks like `/article/live-<id>`. New format: `/news/<headline-slug>-<short-id>`, for example `/news/openai-ships-new-agent-a1b2c3d4`. The short id lets the page find the story without a new column. Old `/article/...` links will redirect. A fully id-free slug would need a new `slug` column.

## 4. Separating the pipeline
- The story fetcher (RSS feeds + Gemini) runs on the server, never in visitors' browsers. Public pages only read published stories.
- For "Zero Human Touch": keep the protected `POST /api/public/ingest` endpoint for an external scheduler, such as cron-job.org or a scheduled database job. Keep the manual "Fetch new stories" button on /admin as a backup. If you prefer, I can remove the button.

## Checks
- The build finishes with zero errors.
- In a real browser: new links open, old links redirect, and the page title and description match the story.
- A public read works, while a public write is rejected.
- Admin sign-in and the Approve button still work.

## Technical details
- Migration: `REVOKE INSERT, UPDATE, DELETE ON public.articles FROM anon; REVOKE ALL ON public.review_queue FROM anon;` and re-create the policies: `articles` SELECT for anon/authenticated `USING (status='published')`, admin ALL via `has_role`, and `review_queue` admin ALL only.
- New route `src/routes/news.$slug.tsx`. It parses the trailing 8-character hex id and matches the UUID prefix in `getLiveArticle` (`id::text LIKE 'xxxxxxxx%'`, via a text-cast filter or an RPC). `article.$slug.tsx` will throw a redirect for live slugs. `toArticle` builds the new slug.
- No changes to UI, styling, components, `package.json` or `vite.config.ts`.
