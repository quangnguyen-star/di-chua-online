# V2 verification report (DCO-57, A2)

Scope: the v2 visit (shell DCO-48, stage DCO-49, stops DCO-50..55, audio DCO-56) on `main`. This ticket
changes no app code. It is a static read of the source plus rewritten `qa/suites`. Nothing here was run in a
browser: no screenshots, no audio, no frame trace, no network throttle. Every "met" below means "the code
does it", not "I saw it".

## 1. What was and was not done

| Item | Status |
| --- | --- |
| Source read of shell, reducer, stage, six stops, audio, CSS | Done. Line references below. |
| `qa/suites/*.json` rewritten for v2 | Done, parsed as valid JSON. **Not executed** (no runner in this session). Locators come from the JSX, not from `browser_snapshot`; a locator miss on first run is a suite defect. |
| `npm test`, typecheck | Not run (disabled in this session). No file under `src/` or `tests/` was touched; `tests/` and `src/` do not reference `qa/suites`, so the suite edits cannot affect them. |
| Browser captures (six stops x day/night, reduced motion, no-WebGL, failure states) | **Not taken.** |
| 30 s frame trace, p95 vs 16.7 ms, 60 fps desktop / 30 fps mid-range mobile | **Not measured.** No device. |
| Stop 1 enterable in under 2 s on 4G | **Not measured.** |
| ~1.5 MB per-stop asset budget | Only the static part computed (section 4). Built bundle size **unknown**: no `.next` and `node_modules` is not installed (no `pixi.js`), so no build could be inspected. |

The acceptance-criteria list (AC-1..AC-17) is not in the repo or in the brief I was given. The only AC text I
have is AC-17 ("go on with the right arrow or a horizontal swipe") and that this ticket delivers AC-1, AC-15
and AC-17. I therefore did not invent a per-AC mapping for the other numbers; section 2 is organised by the
ticket's own verification list and says which behaviour each row covers. Please map AC numbers onto it.

## 2. Audit by reading

### 2.1 Keyboard route for every gesture

| Stop | Gesture | Keyboard / non-pointer route | Where |
| --- | --- | --- | --- |
| Gate | press and hold to breathe | hold Space (`e.code === "Space"`, ignored on buttons); "Bước qua cổng" button once ready | `src/components/temple/scenes/Gate.tsx:133-148`, `:202` |
| Courtyard | drag broom | ArrowLeft / ArrowRight (reduced motion: one discrete hop per press) | `src/app/places/courtyard/sweeping/Sweeping.tsx:137-170` |
| Hall | pull stick | `hall-stick` is a `<button>` (Enter/Space) | `src/app/places/hall/IncenseHall.tsx:~240` |
| Hall | hold stick at lamp | "Thắp nhang" button (`incense-light`) | `IncenseHall.tsx:~258` |
| Hall | place stick in bowl | `hall-bowl` button and "Đặt nhang vào lư" | `IncenseHall.tsx:~228, ~268` |
| Pond | light, drag lantern to water | `river-lantern-draft` button lights on click; "Gấp thành đèn và thả" / "Bỏ qua, chỉ thả đèn" release without dragging | `src/components/temple/river/RiverScene.tsx:~190`, `src/app/places/pond/lantern/LanternFlow.tsx:~128-140` |
| Veranda | hold to pour, lift | Space (hold), `L`, and "tea-lift" button | `src/app/practices/[slug]/TeaPreparation.tsx:147-165`, `:243` |
| Outside | open word, hold to pocket | `word-open` button; "Cất vào túi" button | `src/app/places/word/WordBooth.tsx:~143-149` |
| Shell | leave | Esc anywhere; "Thoát" button | `src/components/visit/VisitShell.tsx:148-151`, `:256` |
| Shell | go on / back | Right / Left arrow, **only while the nudge is up** (finding F1) | `VisitShell.tsx:143-163` |

Result: every gesture I found has a non-pointer route. The Pond drag has no keyboard drag, but the release
buttons do the same thing. Verified by reading only; focus order and visible focus rings were not checked.

### 2.2 Reduced motion

| Piece | Behaviour in code | Where |
| --- | --- | --- |
| Gate | still camera: zoom 0 and dolly duration 1 ms | `Gate.tsx:21,54-58,91`; `gate.module.css:21-24` |
| Courtyard | leaves appear on the ground, no physics loop; arrow hop | `Sweeping.tsx:100-134`; `sweeping.module.css:49` |
| Hall | no smoke canvas loop, lighting hold 0 ms | `IncenseHall.tsx:105,133`; `hall.module.css:52` |
| Pond | no lantern drift, fixed lantern positions, animations off | `RiverScene.tsx:62,76,125,178`; `river.module.css:20` |
| Veranda | transitions and animations off | `TeaPreparation.module.css:27` |
| Outside | camera transition and word animation off | `word.module.css:11,25` |
| Stage (WebGL) | `running = !paused && !motionReduced`: the whole Pixi loop is stopped, so **no parallax and no particle motion** | `SceneStage.tsx:21-32,109-111` |
| Shell | cross-fade and HUD fade shortened | `visit.module.css:37-40` |

Findings against the ticket ("slow particles and cross-fade stay"):

- **F2: reduced motion also stops the particles.** `SceneStage.tsx:32` freezes the scene entirely; the ticket
  asks for slow particles to stay. Also the `reduced` prop is never passed by the shell, so it always follows
  the media query.
- **F3: the cross-fade is probably not kept.** `src/styles/globals.css:128-134` sets
  `animation-duration: 0.01ms !important` and `transition-duration: 0.01ms !important` under reduced motion.
  `visit.module.css:38` sets 600 ms without `!important`, so the global rule should win and the cross-fade and
  HUD fade become instant. From reading the cascade only; not observed.

### 2.3 Captions

- Real text, not canvas or image: `<p aria-live="polite" data-testid="visit-subtitle">{stage.prompt}</p>`,
  `VisitShell.tsx:220-224`. It carries the stop prompt only; stop-specific status lines (e.g. `gate-cue`
  `Gate.tsx:193`, `incense-state`, `tea-cue`) are separate live regions.
- Contrast (computed from the CSS colours; the background behind the gradient is a Pixi/SVG scene that I did
  not render): text `#f6efdd` on the shell base `#0e0d0b` = 16.9:1; on `rgba(10,8,6,.75)` over black = 17.4:1;
  `#f6efdd` on the primary nudge button `#7a2e22` = 8.2:1 (all above 4.5:1). The caption gradient fades to
  transparent at its top (`visit.module.css:20`), so contrast over the bright part of a day scene is
  **unmeasured**. Needs a capture.
- Not every stop's own hint is as protected: `.fullscreen .hint` uses `#f4ead8` with a text shadow only
  (`sweeping.module.css:44`).

### 2.4 HUD fade and progress bar

- HUD hides after 3 s of no pointer input (`HUD_IDLE_MS`, `VisitShell.tsx:14,56-60`) via `opacity` 600 ms
  (`visit.module.css:7-8`). It is `pointer-events: none` only on the container, children stay clickable, and
  `onFocus={poke}` (`:242`) reveals it for keyboard users. There is no `visibility:hidden`, so a faded HUD
  button can still be tabbed to and will reappear on focus. Note it does not poke on key presses, only on
  focus, pointer and touch.
- Six-segment bar: `<ol>` with six `<li>`, grid `repeat(6, 1fr)`, fill is `scaleX(activeMs / stop length)`
  (`VisitShell.tsx:261-270`, `visit.module.css:16-18`). Bar fill vs track is about 5.8:1 (approximate, track
  is translucent). The `<ol>` has an aria-label but the fill is not exposed to assistive tech.

### 2.5 Nudge

- One nudge per stop; never advances on its own: `reduce` sets `due` once at the stop length
  (`src/lib/visit/reducer.ts:55-58`), full prompt for 8 s (`NUDGE_SHOWN_MS`, `:29`, `:59`), then a faint
  arrow; "Ở lại thêm chút" moves shown to faded to done (`:74-78`). `tick` never changes `stageIndex`.
  Covered by `tests/visit-shell.test.ts` (first two tests).
- Small bell only at nudge: `VisitShell.tsx:106-110`.

## 3. Findings

**F1 (AC-17 likely NOT met): right arrow / horizontal swipe only work while the nudge is on screen.**
`atNudge = !single && !untimed && due && (nudge === "shown" || nudge === "faded")` (`VisitShell.tsx:143`)
gates both the key handler (`:152`) and the swipe handler (`:174,179`). So:
 1. Before the stop is due (30 to 120 s), ArrowRight and a swipe do nothing.
 2. After "Ở lại thêm chút" is used twice, `nudge` is `done`, `atNudge` is false: the arrow button is gone
    and keys/swipe are dead. The only ways out are Esc / Thoát.
 3. In single-stop mode (`?stop=`) neither works at all (the end choices appear instead).
 4. Left arrow goes back (`prev`) with no visible control anywhere.
 5. **Courtyard conflict:** the Courtyard's own window keydown handler (`Sweeping.tsx:137-162`) is registered
    before the shell's and calls `preventDefault()` on both arrows; the shell returns on
    `e.defaultPrevented` (`VisitShell.tsx:147`). So at the nudge, ArrowRight in the Courtyard sweeps and does
    not advance. Based on effect order (child effects register first, and the shell re-registers after each
    `atNudge` change); not run.
 Smallest fix (not applied, no feature code in this ticket): drop `due && nudge` from the key/swipe guard so it
 is `!single && !untimed && phase === "running"`; show the existing faint arrow whenever `due` (keep the
 nudge-prompt logic as is) so `done` still has a visible control; and in the shell handler, run in the capture
 phase (`addEventListener("keydown", onKey, true)`) or let the Courtyard skip arrows when the nudge is up.
 Whether free-roaming arrows are wanted before the stop is due is a product decision: if "never before due" is
 intended, the minimum is point 2 (keep the arrow after `done`) and point 5.

**F2** reduced motion freezes particles (section 2.2). **F3** global reduced-motion CSS likely zeroes the
cross-fade (section 2.2).

**F4: every stop renders the same Pixi scene.** `SceneStage` receives `place` but only uses it for the
resolve-lighting call and a `data-place` attribute (`SceneStage.tsx:38,116`; `scene.ts` has no per-place
branch). Only the pond is forced to night (`lighting.ts:17`). Stops differ by the activity overlay and
lighting only. Whether that matches the design is for the design owner; stated, not judged.

**F5: `.stage` is `aspect-ratio: 16/9`** (`stage.module.css:1`) while the shell layer is `inset: 0` full
viewport. On portrait phones the scene may not fill the viewport. Unobserved; check in the 360 px capture.

**F6: shell prefetch pulls Pixi on every stop change.** `void import("pixi.js")` runs in an effect keyed on
`stageIndex` (`VisitShell.tsx:102-104`); fine once cached, but it starts the Pixi download on page load,
competing with the 2 s enterable target for stop 1. Needs the network trace.

**F7: 404 "Về bản đồ" links to `/visit`, not `/`** (`src/app/not-found.tsx:19`), so it starts the tour. The
old suite carried this as a known defect; it is no longer asserted in either direction.

**F8: redirects are `permanent: true`** (`next.config.ts:20`, 308, cached by browsers) while routes are still
changing. Carried over from DCO-43.

**F9: dead standalone pages.** `src/app/places/{hall,courtyard/sweeping,pond/lantern,word,veranda}/page.tsx`
are shadowed by the redirects and still carry the `!embed` branches (map links, `lantern-next`, `sweep-map`,
`incense-leave`, month calendar and .ics on the word booth). Not reachable in the browser, so the suites no
longer target them. `tests/scene-links.test.ts` and `tests/tour.test.ts` still assert on them.

**F10: `VisitShell.tsx` pause on `hidden` only.** `useVisit` pauses on `visibilitychange`
(`src/lib/visit/useVisit.ts:41-52`); there is no pause on window blur. Fine, noted for the trace.

## 4. Statically computed sizes

Static repository assets (`public/`): `art/paper.svg` 406 B; `art/ASSETS.md`, `audio/ASSETS.md` are docs.
**No audio files, no raster images, no fonts in `public/`.** All art is inline SVG/CSS or drawn at runtime by
Pixi (`art.ts` bakes textures at runtime), and audio is synthesised at runtime (`public/audio/ASSETS.md`).
So the per-stop asset list is the same for every stop: `paper.svg` plus the lazily imported `pixi.js` chunk.

Source size per stop (uncompressed TypeScript/CSS bytes, not shipped bytes):

| Stop | Files | Bytes |
| --- | --- | --- |
| Gate | `Gate.tsx`, `gate.module.css` | 10,576 |
| Courtyard | `Sweeping.tsx`, `logic.ts`, `sweeping.module.css` | 18,647 |
| Hall | `IncenseHall.tsx`, `incense.ts`, `hall.module.css` | 19,578 |
| Pond | `LanternFlow.tsx`, `lantern.module.css`, `RiverScene.tsx`, `river.module.css` | 18,935 |
| Veranda | `TeaPreparation.tsx`, `.module.css` | 12,916 |
| Outside | `WordBooth.tsx`, `storyCard.ts`, `wordPick.ts`, `word.module.css` | 13,093 |
| Shared stage | `src/components/temple/stage/*` (excl. tests) | 33,385 |
| Shared audio | `src/lib/audio/*` (excl. tests) | 18,248 |

Whole `src/` is about 600 KB of source. This says nothing about shipped bytes, which are dominated by
`pixi.js` and React and were **not measured**. The ~1.5 MB per-stop budget, smaller mobile textures and the
4G timing are therefore **unverified**. Static facts that bear on them: DPR is capped at 2 (`SceneStage.tsx:10`),
`quality="low"` starts at DPR 1 with half the particles and 8 lanterns (`scene.ts:12-16,201`), at most 24
particles and 14 lanterns, adaptive step-down after 90 sampled frames (`scene.ts:16,157`). Nothing in the code
picks a smaller texture set for mobile: `quality` is `"auto"` unless a caller passes `"low"`, and the shell
never does. Not a measured shortfall, a gap in the code.

## 5. Not verifiable without a browser or device (to do by a person)

1. Captures: six stops in day and night; reduced motion; no-WebGL (static SVG fallback,
   `data-mode="static"`); failure states (`VisitFailure` / error boundary; audio blocked message).
2. 30 s frame trace per stop; p95 frame time against 16.7 ms on desktop, 30 fps floor on a mid-range phone;
   record device, particle count and DPR.
3. Stop 1 enterable in under 2 s on throttled 4G (cold cache), including whether the Pixi import (F6) delays it.
4. Built bundle and per-stop transfer size against ~1.5 MB.
5. Caption contrast over the day scenes (2.3), HUD reveal by keyboard, focus visibility, screen-reader
   announcement of the caption and the nudge.
6. Audio: whether anything is audible, cue timing, mixer labels. Only synthesised sound exists
   (`src/lib/audio/engine.ts`); no audible-quality claim is made.
7. F1 and F3 are code-reading conclusions; confirm in a browser (arrow at 10 s, after dismissing the nudge,
   in the Courtyard; reduced-motion cross-fade).

## 6. Suites (`qa/suites`)

Rewritten, because the old ones targeted removed behaviour:

| File | Change |
| --- | --- |
| `temple-tour.json` | Was `visit-begin` / `visit-skip` / `visit-stage` (removed). Now: shell opens on stop 1 with six progress segments; each `?stop=` deep link runs that stop with its caption text; unknown stop falls back; Esc and Thoát leave; sound off by default; gate, veranda and outside keyboard-route checks. |
| `temple-legacy-and-404.json` | Removed the two AC-5 variant scenarios (hall variants no longer exist) and the 404 known-defect scenario. All 17 legacy URLs now assert the `/visit` target and that the shell opened. |
| `temple-map.json` | Hotspot and list targets are `/visit?stop=<id>`; nav map scenario starts from `/about` because the shell covers the nav. |
| `temple-layout.json` | 360 px probes target `/visit?stop=<id>`; duplicates removed. |
| `temple-hall.json`, `temple-courtyard.json`, `temple-lantern.json`, `temple-word.json` | Open via `/visit?stop=`; exit by `visit-exit`; dropped `incense-leave`, `sweep-map`, `lantern-next` and the month-calendar/.ics scenarios (not in the embedded stop). `sweep-pass` is still asserted **hidden**; that is the absence of the removed "Quét một lượt" button, not its behaviour. |

Unchanged and still valid: `temple-about-privacy`, `temple-appearance`, `temple-sound` (home page),
`state.test.ts` (node tests of v2 logic; not part of `npm test`).

Not scripted: anything that needs 30 s or more of waiting (due, nudge, 8 s fade, arrow/swipe at the nudge,
closing screen), because I do not know that the suite format has a safe wait step. Covered by
`tests/visit-shell.test.ts` at reducer level only. Once F1 is decided, add a scenario that presses ArrowRight
and expects the next stop.
