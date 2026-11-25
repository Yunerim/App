# Publish Daily Cookie on the Google Play Store

Your app is now a tiny, installable PWA (~15 KB of files total). The cheapest way
to put it on Play is a **Trusted Web Activity (TWA)** — a wrapper that opens your
site in Chrome with no browser UI. The resulting APK/AAB is only a few hundred KB.

## 1. Host the app online (required)
Upload the folder (index.html, style.css, game.js, manifest.json, sw.js, icons/)
to any HTTPS host: GitHub Pages, Netlify, Firebase Hosting, Cloudflare Pages…
Note the exact URL, e.g. `https://yourname.github.io/daily-cookie/`.

## 2. Package it with Bubblewrap (official Google tool)
```bash
npm install -g @bubblewrap/cli
bubblewrap init --manifest https://YOUR-URL/manifest.json
bubblewrap build
```
You'll be asked for:
- **Package ID**: e.g. `com.yourname.dailycookie`
- **App name**: Daily Cookie
- **Signing key**: create a new one (Bubblewrap can generate it and a password)
- Output: `app-release-signed.aab` — this is the file you upload to Play Console.

## 3. Verify the site (one-time, required by Play)
- Add a **assetlinks.json**: `bubblewrap` prints the exact content to put at
  `https://YOUR-URL/.well-known/assetlinks.json`. Without it the app shows a
  URL bar.
- `manifest.json` must be reachable and valid; it already is.

## 4. Play Console
1. Create an app → set name "Daily Cookie".
2. Store listing: use `icons/icon-512.png` for the 512×512 store icon.
3. Screenshots: run the site on a phone (or browser DevTools mobile mode) and
   screenshot — you need at least 2 phone screenshots.
4. Upload the `.aab`, complete the data-safety form
   (nothing is collected — data stays in localStorage on the device).
5. Privacy policy: a simple page saying no data is collected or shared is enough
   for an offline app like this.

## Notes
- Keep the app lightweight: everything already loads from the service worker
  cache, so it opens instantly and works offline.
- To update later: change files on your host, bump `CACHE` version in `sw.js`,
  then rebuild with `bubblewrap build` (or just bump versionName) and re-upload.
- If you'd rather avoid hosting, alternatives are wrapping with Capacitor
  (`npx cap add android`) which bundles the HTML into the APK (~2–3 MB), or
  Cordova. Both accept your existing files as-is.
