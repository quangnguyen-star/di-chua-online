# V2 verification report (DCO-57, A2)

Scope: the v2 visit on `main` at the time of writing: shell (`src/components/visit/*`), per-place Pixi scenes
(`src/components/temple/stage/*`), the six stops, audio. No app code was changed. This is a static read plus
edits to `qa/suites`. **Nothing here was run or observed**: no browser, no screenshot, no audio, no frame trace,
no network throttle, no `npm test` or typecheck run (disabled in this session). "Met" below means "the code does
it", never "I saw it". This report replaces an earlier one that predated DCO-58 (AC-17 fix) and the per-place
scenes (B1/C1-C6); several of its findings are now fixed or wrong and are re-derived here.

## 1. What was and was not done

| Item | Status |
| --- | --- |
| Source read of shell, reducer, stage, six stops, CSS | Done, line references below |
| `qa/suites/*.json` stale content removed, AC-17 scenario added | Done, JSON parses. **Not executed**; locators come from the JSX, not `browser_snapshot` |
| `npm test` / typecheck | Not run. Only `qa/suites/*.json` changed, and nothing in `src/`, `tests/` or `package.json` reads `qa/suites` (grepped), so neither can be affected |
| Browser captures: six stops x day/night, reduced motion, no-WebGL, failure states | **Not taken. Not verifiable here** |
| 30 s frame trace, p95 vs 16.7 ms, 60 fps desktop / 30 fps mid-range mobile | **Not measured. Needs a device** |
| Stop 1 enterable in under 2 s on 4G | **Not measured** |
| ~1.5 MB per-stop budget, smaller mobile textures | Static part only (section 5). Shipped bundle size unknown: no `.next`, no `node_modules` |

## 2. AC-1 .. AC-17

The AC list itself is not in the repo or in the brief. The only AC text I have is AC-5 (legacy practice URLs,
from `docs/verification-report.md`) and AC-17 ("go on with the right arrow or a horizontal swipe"), plus that
this ticket delivers AC-1, AC-15 and AC-17. I will not invent text for the others. So the table maps each
**ticket verification topic** to code, and the AC column is blank where I cannot know it. Whoever owns the AC
list should fill the column; every row has its status.

| Topic | AC | Met in code? | Where | Needs browser/device? |
| --- | --- | --- | --- | --- |
| Right arrow / swipe go on (tour) | AC-17 | **Yes, except the Courtyard** (F1) | `VisitShell.tsx:144-187` (keys), `:196-211` (swipe), `:142-143` (`canNavigate`) | Yes: press at 5 s, swipe on a phone |
| Left arrow / swipe back | AC-17 | Yes, no visible control (F1) | `VisitShell.tsx:178-180`, `:209-210` | Yes |
| Esc leaves, Thoat button | | Yes | `VisitShell.tsx:170-173`, `:284` | Yes |
| Every gesture has a keyboard route | AC-1? | Yes (2.1) | per stop, below | Focus order/rings not checked |
| Reduced motion: no dolly/parallax | | Yes, but also stops particles (F2) | 2.2 | Yes |
| Reduced motion: cross-fade stays | | **No** (F3) | `globals.css:128-134` vs `visit.module.css:3-4,47-51` | Yes |
| Captions real text, live region | | Yes | `VisitShell.tsx:248-252`, `StageZones.tsx:40` | Screen reader not run |
| Caption contrast | | Shell colours pass (2.3); over the rendered scene **unmeasured** | `visit.module.css:29-31` | Yes: capture |
| HUD fade, six-segment bar | | Yes | `visit.module.css:7-8,16-18`, `VisitShell.tsx:270-298` | Yes |
| One nudge, never auto-advances | | Yes | `reducer.ts:48-61,74-78`, `VisitShell.tsx:254-268` | Timing not observed |
| Legacy URLs land in `/visit` | AC-5 | Suite asserts it | `qa/suites/temple-legacy-and-404.json` | Suite not run |
| Per-stop asset budget, 4G, frame rate | AC-15? | **Unverified** | section 5 | Yes: all of it |
| Browser captures day/night, no-WebGL, failures | | **Not taken** | `SceneStage.tsx:49,120-121` (fallback), `VisitErrorBoundary.tsx` | Yes |

## 3. Audit by reading

### 3.1 Keyboard route for every gesture

| Stop | Gesture | Non-pointer route | Where |
| --- | --- | --- | --- |
| Gate | hold to breathe | hold Space (ignored on buttons); step-through button | `Gate.tsx:143-160`, `:217` |
| Courtyard | drag broom | ArrowLeft/ArrowRight; reduced motion: one hop of 8% per press | `Sweeping.tsx:174-204` |
| Hall | pull stick, light, place | `hall-stick`, `incense-light`, `incense-place` are `<button>` | `IncenseHall.tsx:188,201,211` |
| Pond | light, release lantern | `lantern-release` and the skip button are `<button>` | `LanternFlow.tsx:178-181` |
| Veranda | hold to pour, lift | Space, `KeyL`, `tea-lift` button | `TeaPreparation.tsx:151-159,226` |
| Outside | open, hold to pocket | `word-open` and pocket are `<button>` | `WordBooth.tsx:136,163,185` |
| Shell | leave / go on / back | Esc, ArrowRight, ArrowLeft, buttons | `VisitShell.tsx:168-187` |

Every gesture I found has a route. The Pond has no keyboard drag; the release buttons do the same job. Not
checked: tab order, focus rings, whether Space in the Gate and Veranda conflicts with a focused button.

### 3.2 Reduced motion, per stop

| Stop | Path | Where |
| --- | --- | --- |
| Gate | still camera and mist steps by breath count | `Gate.tsx:62,80` |
| Courtyard | no physics loop; leaves relocate per key; scene `still` | `Sweeping.tsx:135,163-171`, `stage/scenes/courtyard.ts:90` |
| Hall | light after 0 ms hold; smoke draws no loop | `IncenseHall.tsx:102`, `smoke/Smoke.tsx:24-26` |
| Pond | `nextStep(.., reduced)` goes straight to the settled river | `river/sequence.ts:38-57`, `LanternFlow.tsx:89-98` |
| Veranda | rain drops return early | `stage/scenes/veranda.ts:46-51` |
| Outside | transitions off in CSS | `word.module.css` |
| Stage | `running = !paused && !motionReduced`: whole Pixi loop stopped | `SceneStage.tsx:34,44` |
| Shell | closing, nudge, arrow 600 ms; HUD 300 ms | `visit.module.css:47-51` |

Every stop has a reduced-motion path. Findings:

- **F2: reduced motion stops all particles.** The ticket says slow particles stay. `SceneStage.tsx:34` freezes
  the scene whenever the media query matches. Not a bug in the tour's logic, but contrary to the ticket.
- **F3: the cross-fade is instant under reduced motion.** `globals.css:128-134` forces
  `animation-duration: 0.01ms !important` on `*`. `visit.module.css:47-49` re-sets duration with `!important`
  only for `.closing, .nudge, .arrow`; `.enter, .leave` (`:3-4`, 1800 ms) only get a timing function. So the
  1800 ms cross-fade collapses. Fix: add `.enter, .leave` to the 600 ms `!important` rule. By the cascade only.

### 3.3 Captions

- Real text in a polite live region: `<p aria-live="polite" data-testid="visit-subtitle">{stage.prompt}</p>`,
  `VisitShell.tsx:248-252`. It fades to opacity 0 after 6 s or on first input (`:101-107`) but stays in the DOM.
  Stop instruction lines are also live text, kept in the DOM when faded (`StageZones.tsx:40`, `useInstruction.ts`).
- Contrast, computed from the CSS colours only: `#f6efdd` on `#0e0d0b` about 16.9:1; on the primary buttons
  `#7a2e22` about 8.2:1. Captions have a text-shadow but **no backing panel** (`visit.module.css:22-23,31`), so
  contrast against a bright day scene is **unmeasured** and could fail. This is the main accessibility risk to
  capture. Sweeping's `.hint` is the same: colour plus shadow only.

### 3.4 HUD fade and progress bar

- HUD fades to opacity 0 after 3 s without pointer input (`VisitShell.tsx:17,67-71`, `visit.module.css:7-8`).
  `pointer-events` stay on children, and `onFocus={poke}` (`:270`) reveals it by keyboard focus. Key presses do
  not poke it.
- Bar: `<ol>` of six `<li>` (`:289-298`), grid `repeat(6, 1fr)` (`visit.module.css:16`), fill is
  `scaleX(activeMs / stop seconds)`. The fill is not exposed to assistive tech.

### 3.5 Nudge

Once per stop, never advances: `tick` sets `due`/`shown` at the stop length and `faded` 8 s later
(`reducer.ts:48-61`); `stay` goes shown, faded, done (`:74-78`); nothing in `tick` changes `stageIndex`. The
shell shows the full prompt only while `shown` (`VisitShell.tsx:143`) and a faint arrow after (`:144`). Small
bell only at the nudge (`:125-129`). Reducer is covered by `tests/visit-shell.test.ts`.

## 4. Findings

**F1 (AC-17): mostly met since DCO-58, not in the Courtyard.** The old gate on the nudge is gone:
`canNavigate = !single && !untimed && phase === "running"` (`VisitShell.tsx:142`), so ArrowRight and a
horizontal swipe go on at any time in the tour, and a labelled "Di tiep" arrow stays once the stop is due
(`:144`). Remaining gaps:
 1. **Courtyard:** `claimsArrows` (`:143`) turns swipe off (`:200`) and `Sweeping.tsx:174-204` calls
    `preventDefault()` on both arrows, which the shell respects (`:165`). So neither ArrowRight nor a swipe
    goes on there; only the always-shown arrow button does (`:144`). This contradicts the literal AC-17 text.
    Whether it is the intended trade-off is a design decision (the code comment at `:31-35` says it is).
    Smallest fix if AC-17 must hold there: in `Sweeping.tsx` let the arrows sweep only while focus is inside the
    yard, or advance on Shift+ArrowRight; the shell then keeps plain arrows for everywhere else.
 2. **Single-stop mode (`?stop=`):** keys and swipe are off by design; the end-of-stop choices appear instead.
 3. **ArrowLeft** goes back with no visible control anywhere.
 4. Which listener runs first in the Courtyard depends on effect registration order; not run.

**F2, F3:** reduced motion (3.2).

**F4: caption contrast over the scene is unproven** (3.3). Smallest fix: a dark gradient behind the caption band.

**F5: shell prefetches Pixi on every stop change** (`VisitShell.tsx:121-123`). It starts the Pixi download on
load, in competition with the 2 s stop-1 target. Needs the network trace.

**F6: `.top` HUD has no backdrop beyond a 60% gradient** (`visit.module.css:10`); unmeasured over bright scenes.

**F7: dead standalone pages.** `src/app/places/**/page.tsx` and `practices/[slug]` still carry non-embedded
branches (`sweep-map`, `lantern-next`, `incense-leave`, calendar and .ics) that the redirects make unreachable.
`tests/scene-links.test.ts` and `tests/tour.test.ts` still assert on them.

**F8: permanent redirects.** `next.config.ts` uses `permanent: true` (308, cached by browsers) while routes
still change. Carried over.

**F9: pause only on `visibilitychange`**, not window blur (`useVisit.ts`). Noted for the trace.

Fixed since the earlier report, so no longer findings: stage no longer renders one scene for all stops (per-place
registry, `stage/scenes/registry.ts`); the 404 Map link; the arrow gate.

## 5. Statically computed sizes

`public/` holds `art/paper.svg` (406 B) and two ASSETS.md notes. **No audio files, raster images or fonts.**
Art is inline SVG/CSS or baked at runtime by Pixi (`stage/art.ts`); sound is synthesised (`src/lib/audio`). So the
per-stop asset list is the same for every stop: `paper.svg` plus the lazily imported `pixi.js` chunk and that
stop's scene module. There are no per-stop network assets to sum except the JS.

Source bytes (uncompressed TS/CSS, not shipped bytes):

| Stop | Files | Bytes |
| --- | --- | --- |
| Gate | `Gate.tsx`, `gate.module.css`, `scenes/gate.ts` | 10,158 |
| Courtyard | `Sweeping.tsx`, `logic.ts`, css, `scenes/courtyard.ts` | 24,711 |
| Hall | `IncenseHall.tsx`, `incense.ts`, css, `scenes/hall.ts`, smoke (3 files) | 21,984 |
| Pond | `LanternFlow.tsx`, css, `river/{sequence,effects}.ts`, `scenes/pond.ts`, lantern (2 files) | 28,912 |
| Veranda | `TeaPreparation.tsx`, css, `scenes/veranda.ts` | 14,516 |
| Outside | `WordBooth.tsx`, `storyCard.ts`, `wordPick.ts`, css, `scenes/outside.ts` | 13,943 |
| Shared stage | `scene.ts`, `art.ts`, `lighting.ts`, `waterFilter.ts`, `SceneStage.tsx`, `StaticScene.tsx`, `scenes/{backdrop,registry,types}.ts` | 36,010 |
| Audio | `engine.ts`, `mix.ts`, `mixer.ts` | 18,248 |

These say nothing about shipped bytes, dominated by `pixi.js` and React, **not measured**. So the ~1.5 MB
budget, smaller mobile textures and 4G timing are **unverified**. Static facts: DPR capped at 2
(`SceneStage.tsx:10`); `quality="low"` uses DPR 1 and half the particles (`scene.ts:95`); Pond caps 24 particles
and 14 lanterns (8 when low) (`scenes/pond.ts:11-13,70,131`); adaptive step-down after sampled frames
(`scene.ts:74`). The shell never passes `quality="low"` (`VisitShell.tsx:234,238`), so nothing selects a smaller
texture set for mobile. That is a code gap, not a measured shortfall.

## 6. Not verifiable without a browser or device

1. Captures: six stops x day/night; reduced motion; no-WebGL (`data-mode="static"`, `SceneStage.tsx:120`);
   failure states (`VisitFailure`, audio blocked).
2. 30 s trace per stop; p95 vs 16.7 ms desktop, 30 fps floor on a mid-range phone; record device, DPR, particles.
3. Stop 1 enterable under 2 s on throttled 4G, cold cache, including the Pixi import (F5).
4. Built bundle and per-stop transfer vs ~1.5 MB.
5. Caption contrast over day scenes, HUD reveal by keyboard, focus visibility, screen-reader output.
6. Audio: anything audible, cue timing. No audible claim is made.
7. F1, F2, F3 are cascade/code-reading conclusions; confirm: ArrowRight at 5 s in each stop (Courtyard expected
   to sweep), swipe on a phone, reduced-motion cross-fade.

## 7. Suites (`qa/suites`)

Already v2 from the earlier pass: `temple-tour`, `temple-legacy-and-404` (all legacy URLs assert `/visit`),
`temple-map`, `temple-layout`, `temple-hall`, `temple-lantern`, `temple-word`, all via `/visit?stop=`. Not
touched: `temple-about-privacy`, `temple-appearance`, `temple-sound`, `temple-stage-zones`.

Changed in this pass:

- `temple-courtyard.json`: removed the three `hidden` assertions on `sweep-pass`, `sweep-status` and
  `sweep-complete`. None of those test ids exist in `src/`, so they asserted removed behaviour (the "Quet mot
  luot" button, counter, clean state). Renamed the first scenario accordingly.
- `temple-tour.json`: added "ArrowRight goes on from the gate to the courtyard (AC-17)": open `/visit`, press
  ArrowRight, expect `sweep-yard` visible. It is not run; it passes only if the Gate does not swallow ArrowRight
  (it handles Space only, `Gate.tsx:144`).

Not scripted: anything needing 30 s or more (nudge, 8 s fade, closing screen), and the Courtyard arrow case, since
it depends on F1.1. Both are covered only at reducer level by `tests/visit-shell.test.ts`.
