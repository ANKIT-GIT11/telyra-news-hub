# Telyra clean-up plan

## What the audit found

1. **Build settings: already fixed.** The build settings and build commands are back to Lovable's normal setup. The Vercel adapter is gone, and builds write to the right folder again. No further changes are needed here.
2. **Sign-in connection: broken (this is the real problem).** The file that connects the site to your backend was edited by hand. It now points to a different backend with an old key. That is why the editorial desk shows "invalid API" on login. Your admin account exists only on your real backend.
3. **Pages: fine.** Every link points to a page that exists, and the page index is generated automatically. The 404s came from the broken build, which is now fixed.
4. **One correction to the brief.** This app is not plain Vite. Lovable builds it with TanStack Start, which is the required setup here. Removing it would break the site, so it stays.

## Proposed fix

- Restore the backend connection file to its original automatic version. It will read your project's own address and key again, and it will get back its key-handling code.
- Change nothing else: no page designs, styling, article cards or data.

## How I will check it

- Confirm the build finishes with zero errors.
- Open the front page, an article and /auth in a real browser.
- Sign in as the admin and confirm /admin loads the review queue.

## Technical details

- File: `src/integrations/supabase/client.ts`. Swap the hardcoded `drvjypkhhwgmslrcelem` URL and old `sb_publishable_01Nt…` key for `import.meta.env.VITE_SUPABASE_URL` / `VITE_SUPABASE_PUBLISHABLE_KEY` (SSR fallback `process.env`). Restore the `sb_` Authorization-stripping fetch wrapper from the last good git version.
- No change to `package.json`, `vite.config.ts`, routes, migrations or components.
