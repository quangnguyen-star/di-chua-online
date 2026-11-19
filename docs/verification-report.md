# Verification report (DCO-43, T12)

Scope: the new temple journey on `main` after DCO-31 to DCO-42 and DCO-44. This ticket changes no app
code. It replaces the obsolete `qa/suites/temple-*.json` (which targeted removed pages) with suites for the
new journey, adds node-runnable state tests, and records findings and what could not be measured.

## 1. What was and was not run

| Item | Status |
| --- | --- |
| `qa/suites/*.json` written against the source of each page | Written and parsed as valid JSON. **Not executed**: this session has no QA runner, no running build and no `qa_validate` endpoint. Run `qa_validate` on each stem before first use. |
| `qa/suites/state.test.ts` (node) | Run once in this session: 8 tests, 8 pass. Not wired into `npm test`. |
| Locators | Taken from the JSX `data-testid`, role and label strings, **not** from `browser_snapshot` on the running page, which SUITES.md section 10 asks for. Treat a locator miss on first run as a suite defect to correct. |
| Frame time, audio, on-device checks | **Not measured.** See section 5. |

## 2. Suites (qa/suites)

| File | Area | Notes |
| --- | --- | --- |
| `temple-map.json` | map hotspots, text place list, nav map icon | one scenario per place for both the map and the text list |
| `temple-legacy-and-404.json` | legacy URLs, AC-5 variants, 404 | scenarios tagged known-defect assert the intended outcome and are expected to fail today |
| `temple-hall.json` | hall states by keyboard, sticks, variants, spent note | |
| `temple-courtyard.json` | sweeping, closing line, next place | |
| `temple-lantern.json` | release flow, skip, exit | lantern text privacy is not automated, see section 6 |
| `temple-tea.json` | seven steps, steep wait, 180 s drink, sips | full 180 s completion is a manual trace |
| `temple-appearance.json` | Auto / Day / Evening select persists across reload | `html[data-theme]` is not readable by a suite target, see section 6 |
| `temple-sound.json` | sound off by default, panel status, toggle | silent-on-load request scan not automated, see section 6 |
| `temple-word.json` | booth open/reveal, month grid, .ics button, 360 px | stable-word and .ics content are node-side only |
| `temple-tour.json` | six stops, skip walk, pause, exit, 360 px | full 300 s run is a manual trace |
| `temple-about-privacy.json` | About and Privacy sections | structure only; wording needs a human read |
| `temple-layout.json` | 360 px overflow on ten routes | uses `browser_probe.sh overflow`, the only probe mode that still matches the app |

Scenarios whose only honest check needs a probe mode that does not exist were left out rather than written
to fail for tooling reasons (section 6).

`qa/suites/state.test.ts` checks: the tour is six stops totalling 300 s in route order; hall sticks and
variant defaults; the keyboard-reachable hall state sequence and burn-out to spent; a sweep pass clears 8 leaves
and shows the closing line; auto appearance flips at 06:00 and 18:00 Vietnam time; the daily word is stable
within a Vietnam day, changes at midnight and cycles through every word; the .ics is a VCALENDAR with 24 to 26
events. Run: `node --test --experimental-strip-types qa/suites/state.test.ts`.

## 3. Findings (each confirmed from source)

1. **AC-5 not met: legacy practice URLs do not open the matching variant.** `src/content/routes.ts` redirects
   `/practices/breathing` to `/practices/tho-2-phut` (the old practice page, although the route table lists
   `/practices/breathing` as the canonical href of the gate) and `/practices/sitting` to `/places/hall` with
   no query. The hall picks its variant from `?variant=` (`parseVariant` in `src/app/places/hall/incense.ts`);
   `variant=sitting` is what gives the "Ngồi yên bên nén hương" title, natural breathing and the 300 s stick.
   Plain `/places/hall` is the incense variant: 300 s happens to be its default, but the sitting title and mode
   are not applied. Scenarios: the two `AC-5` entries in `temple-legacy-and-404.json`.
2. **Redirects are permanent.** `next.config.ts` maps every route-table redirect with `permanent: true`
   (308). Browsers cache 308 responses, so a destination changed later keeps being served from cache to
   returning visitors while routes are still evolving. `permanent: false` until routes settle.
3. **Home map hotspot positions are unverified.** `spots` in `src/components/temple/map/TempleMap.tsx` is a
   table of literal percentages. Nothing in the repo records them being checked against the art on a
   screen, and this session did not render the map. Whether the six links sit on their buildings, and whether
   they overlap at 360 px, is unknown. The text place list on the home page is the non-pointer path and is
   covered by `temple-map.json`.
4. **Pixi was not adopted.** `docs/dependency-vetting.md` rules it out (size, `new Function` shader codegen
   against the CSP). The river is SVG and CSS (`src/components/temple/river`) and `package.json` has no
   `pixi.js`. This is a deliberate deviation from any plan that assumed a Pixi scene. Consequence: there is no
   GPU or WebGL path to measure; frame time depends on SVG/CSS animation cost.
5. **Audio is synthesised.** `public/audio/ASSETS.md` states no recordings ship; every sound is produced at
   runtime by `src/lib/audio/engine.ts`, and it records no audible-quality check. Nothing here claims the sound
   is good, balanced or free of clipping.
6. **404 Map button goes to the tour, not the map.** `src/app/not-found.tsx` renders "Về bản đồ" with
   `href="/visit"`, and `/visit` is the tour start; the map is `/`. Scenario in `temple-legacy-and-404.json`
   (known-defect, expected to fail).
7. **Stale QA probes.** `qa/scripts/browser_probe.py` modes `privacy`, `breathing`, `reduced-motion` and
   `audio-gesture` drive the removed visit flow (`Dâng hương`, `breathing-timer`, `/api/audio/`) and will fail
   against the current app. Only `overflow` still applies and is the only mode the new suites use.

## 4. Browser-capture checklist

For every row capture one screenshot per cell and record pass/fail with notes. Day = Ban ngày selected;
evening = Buổi tối selected (do not rely on the clock). Desktop 1280x800; mobile 360x740 touch, with a second
pass at 390x844. Repeat the courtyard, river and tour once with `prefers-reduced-motion: reduce`.

| Feature (route) | Check | Day desktop | Day mobile | Evening desktop | Evening mobile |
| --- | --- | --- | --- | --- | --- |
| Home map (`/`) | six hotspots sit on their buildings; no overlap; text list below; daily word, lunar note | | | | |
| Gate (`/practices/tho-2-phut`) | breathing runs, pause/resume | | | | |
| Courtyard (`/places/courtyard/sweeping`) | drag sweep, Quét một nhịp, leaf pile, line | | | | |
| Hall (`/places/hall`) | sticks, light, pause, extinguish, place; smoke and ember; three variants | | | | |
| River (`/places/pond/lantern`) | write, release, drift 4 s, released state | | | | |
| Veranda (`/places/veranda`) | seven steps, steep clock, drink 3:00, three sips | | | | |
| Word booth (`/places/word`) | open, word, calendar marks mùng một and rằm, PNG save, .ics | | | | |
| Tour (`/visit`) | six stops, progress, skip, pause, completion | | | | |
| About, Privacy | readable, no overflow, contrast | | | | |
| 404 | closed gate, Map button destination | | | | |
| Settings and sound popovers | open, close, focus order, status line | | | | |

Also record: a keyboard-only pass of every row, 200% zoom, and a screen-reader read of the hall and tea states.
Token-level contrast is asserted by `src/components/theme/contrast.test.ts`; that is not a screenshot check.

## 5. Performance: 30 s trace procedure

Not run in this session. No device, no Chromium trace and no build were available, so there is **no measured
frame time, long-task count or memory figure, and none is claimed**.

Procedure, per scene (home map, courtyard mid-sweep, hall burning, river releasing, veranda drinking, tour):

1. Device: name the model, OS and Chrome version in the table below. Use a midrange Android phone (for example a
   Snapdragon 6-series or MediaTek Helio class, 4 GB RAM), battery saver off, plugged in, screen on, brightness
   fixed, no other apps. A desktop run with 4x CPU throttle is a supplement, not a substitute.
2. `npm run build && npm run start`; load the page over the LAN from the device with remote debugging
   (`chrome://inspect`). Production build only.
3. DevTools Performance: record 30 s while exercising the scene (drag the broom, keep the stick burning,
   release a lantern). Start with the scene already loaded.
4. Export the trace. From the Frames track compute **p50, p95 and max frame time**, dropped-frame percentage and
   long tasks over 50 ms. Compare p95 with the **16.7 ms** budget (60 Hz); on a 90 or 120 Hz panel state the
   refresh rate and use its own budget.
5. Repeat in day and evening, once with sound on (synth engine running) and once off.
6. A scene passes only if p95 <= 16.7 ms; otherwise record the number and the dominant cost from the trace.

| Scene | Device | Mode | p50 ms | p95 ms | max ms | Long tasks | Verdict |
| --- | --- | --- | --- | --- | --- | --- | --- |
| Home map | not measured | | | | | | |
| Courtyard | not measured | | | | | | |
| Hall | not measured | | | | | | |
| River | not measured | | | | | | |
| Veranda | not measured | | | | | | |
| Tour | not measured | | | | | | |

Audio: nothing has been listened to or measured. Open before any audio claim: that no sound starts before a user
gesture (Network panel and `AudioContext.state` on load), loudness at default volumes, absence of clicks at cue
boundaries, and behaviour when the tab is hidden.

## 6. Not measured or not automated

- Everything in section 5, and all audible quality.
- Suite execution: no scenario in section 2 has been run by the QA runner.
- Lantern text absent from requests and storage: needs a probe that types a marker, releases, and scans requests,
  storage, cookies and the DOM (the old `privacy` mode did this for the removed intention field). That needs a new
  `browser_probe.py` mode; `qa/scripts` is outside this ticket's ownership.
- Resolved `html[data-theme]` under a faked Vietnam clock, sound silent on load (no audio request, no running
  `AudioContext`), stable word across a reload and a new word on the next day in the booth, `.ics` download
  content, and 300 s tour / 180 s tea completion: each needs a new probe mode or a clock-controlled browser
  context. The node tests cover the pure logic behind them, not the browser behaviour.
- Hotspot placement and overlap (finding 3).
- Cross-browser: only Chromium is available to the QA runner.
