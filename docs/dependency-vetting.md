# Dependency vetting

Nothing here is added by DCO-31 (workers cannot install packages). This records the recommendation for later waves.

Constraints: CSP is `img-src 'self' data:`, `media-src 'self'`, `connect-src 'self'`, no `worker-src`, no `blob:`, `script-src 'self' 'unsafe-inline'`. The site is a quiet, low-bandwidth reading experience; bundle cost matters.

Sizes and licences below are from memory of the published packages and must be re-checked with `npm view` and a bundle analyser before adoption.

| Option | Licence | Bundle cost | CSP fit | Recommendation |
| --- | --- | --- | --- | --- |
| `@rive-app/canvas` | MIT | Runtime ships a WASM binary (roughly 150-200 KB gzipped) plus `.riv` assets | Default loader fetches WASM from a CDN (blocked by `connect-src 'self'`); self-hosting the WASM needs `wasm-unsafe-eval` in `script-src`, which the policy does not grant. Rive can also spin up workers in some builds | Do not adopt. Use CSS/SVG animation |
| `pixi.js` (v8) | MIT | Large (several hundred KB min even tree-shaken), WebGL/WebGPU | Works on canvas without network, but v8 uses workers/`ImageBitmap` paths and blob URLs for some asset loading and `new Function`-based shader code generation (needs `unsafe-eval` unless the unsafe-eval build is used) | Do not adopt. A handful of lanterns and leaves does not justify a renderer; use inline SVG or 2D canvas |
| `gsap` | Standard "no charge" licence (not OSI); free for this use since 2025 but with usage restrictions | Core roughly 25-30 KB gzipped | No network, workers or eval; fits the CSP | Not needed. CSS keyframes and `prefers-reduced-motion` cover the current motion. Adopt only if sequenced timelines become unmanageable, after a legal read of the licence |
| `.ics` calendar export | n/a | Zero dependencies | A `data:` or same-origin `text/calendar` download needs no CSP change (`data:` is allowed for images only, so serve from a `/api` route or generate a Blob-free link) | Hand-write the small VCALENDAR text (RFC 5545: CRLF line endings, UID, DTSTAMP, DTSTART, SUMMARY) and serve it from a same-origin route. No library |

## Summary

- Adopt nothing. Prefer CSS and inline SVG; use plain 2D `<canvas>` only where per-frame drawing is genuinely needed.
- If motion needs grow, revisit gsap first (cheapest, CSP-clean).
- Rive and Pixi each break or strain the CSP and cost far more than the scenes need.
