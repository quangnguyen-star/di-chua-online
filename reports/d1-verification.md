# D1 verification pass (DCO-70)

Scope: B1-B4 and C1-C6 as on `main`. No feature code changed. Added `tests/verification.test.ts`,
`qa/suites/temple-stage-zones.json` and this report; fixed one stale locator in `qa/suites/temple-tour.json`.

## 1. What was and was not run

| Item | Status |
| --- | --- |
| `tests/verification.test.ts` | One local run of this file with the Node test runner passed 7/7 (the session later blocked further test runs). It is a source-level test, not a live scene. |
| Rest of `npm test`, typecheck, lint | Not run by me. CI is the check. |
| Leak test via `SceneHandle.layers()` on a live scene, day and night | **Not possible** (no browser, no WebGL). Replaced by a static test: declared `layers` of every non-pond scene, every `ctx.layer` / `ctx.depthLayer` call in `scenes/<place>.ts` and `backdrop.ts`, and no lighting-conditional layer. Runtime `layers()` for six stops x day/night still needs a browser. |
| B2 geometry over all stops, desktop and mobile | Already in `tests/stage-zones.test.ts` (six stops x 1280x720 and 390x844, band percentages read from `visit.module.css`). It is arithmetic on CSS percentages, not measured boxes: wrapped Vietnamese text, safe-area insets and the on-screen keyboard are unverified. |
| Home gate and stop 1 render the same TamQuanStill | Static only: both import `TamQuanStill` from `../art` and use it once. A pixel comparison needs a browser. See finding 5. |
| Captures (six stops x day/night, reduced motion, no-WebGL), frame rate (60 fps desktop / 30 fps mobile), 4G load, bundle budget | **Not verifiable here.** None taken. |
| `qa/suites/*.json` | Valid JSON, **not executed**. Locators come from source, not from `browser_snapshot`. A scan of every `testid` in the suites against `src/` found no removed id still asserted visible, apart from the one fixed below. |

Suite changes: `temple-tour.json` asserted `gate-hint` visible; the gate now shows its line as `instruction-text`
in the instruction zone, so the locator and intent were updated. `temple-courtyard.json` asserts `sweep-pass`,
`sweep-status` and `sweep-complete` as **hidden** (removed behaviour stays absent); that is correct and was left
alone. `temple-stage-zones.json` is new (gate, home map, courtyard, outside).

## 2. Before / after per reported issue

The plan text with the seven issues is not in the repo or the brief. Five are named in the ticket; I could not
recover the other two and did not invent them. "After" is what the code does, not what was seen.

| Issue | Before | After (code) | Checked by |
| --- | --- | --- | --- |
| River leak | Lantern, water, lily, mote layers appeared in other places | One `PlaceScene` per place; only `pond.ts` draws water, lanterns, motes | `tests/verification.test.ts`, `scenes.test.ts` (static only) |
| Lantern look | Lantern drawn in several styles | One shared `LotusLantern` / `bake.ts`; the pond scene owns the lantern | Not visually checked |
| Overlapping text | Prompt, hint and controls drew over each other and the interaction | Fixed bands in `visit.module.css`: instruction 10-18%, interaction 22-72%, actions 76-88%, subtitle 90-98% | `tests/stage-zones.test.ts` (arithmetic only) |
| Two gates | Home and stop 1 drew different gates | Both use `TamQuanStill` | static test; finding 5 |
| Smoke | Per-stop ad hoc smoke | One shared `Smoke` primitive, used by hall and tea | Not visually checked; frame cost unmeasured |

## 3. Findings: shell zones vs stops (no fix made)

1. **Pond handle never reaches `LanternFlow` inside the tour.** `VisitShell.tsx` mounts
   `<SceneStage place={stage.id} paused={frozen} />` with no `onHandle`, and `setStageHandle` is only ever called
   with `null`. `LanternFlow` in `embed` mode reads `shell.handle`, so `pond` is always `null` there: `setLantern`,
   `light`, `lower`, `setDrift`, `pullBack` and `ripple` do nothing in `/visit`. Only the standalone
   `/places/pond/lantern` page wires `onHandle={setLocalHandle}`. This is the largest mismatch and likely breaks the
   C4 release sequence in the tour. (The shell's `StageHandle` type is also a local stub, not `SceneHandle`.)
2. **Veranda draws two stages in the tour.** `TeaPreparation` in embed mode renders its own
   `<SceneStage place="veranda">` while the shell already renders one for the stop. The other five embedded stops do
   not. That means two canvases and two ticker loops against the mobile budget, and two `scene-stage` test ids.
3. **Not every stop uses `useInstruction`.** Gate, courtyard, hall and outside do. Pond builds a literal
   `instruction` object (`visible: true`, no-op `replay`, no auto-hide), so its line never fades and the hint button
   never appears. Tea passes no instruction to `StageZones` and puts `tea-cue` and `tea-hint` text inside the
   interaction band. All six do use `StageZones`.
4. **Text in the interaction band.** Pond: a `<label>` sentence and a `<textarea>` (`lantern-thought`) are the
   interaction content, plus the "Ngọn đèn đã trôi đi" heading and sentence after release. Tea: cue and hint
   paragraphs (finding 3). Word: the word card is text inside a button. The geometry test cannot see these. They
   sit inside the 22-72% band by design, but "no text boxes in the interaction band" is not literally true for them;
   this needs a decision.
5. **Gate: shell scene plus its own art.** In `/visit?stop=gate` the shell renders `SceneStage place="gate"` and
   `Gate.tsx` also draws `TamQuanStill` (`gate-art`) on top. The home map uses `TamQuanStill testId="map-art"` with
   the default label and variant; the gate passes `label=""` and a class. Same component and SVG geometry, but
   different testid, label and wrapper CSS, so identical framing is unverified.
6. **Standalone pages render their own `SceneStage`** (courtyard, hall, pond, veranda non-embed) with the same
   `scene-stage` test id, so a suite asserting it must be pinned to a URL (the new suite is).
7. **Possible double announcement on pond.** `LanternFlow` has a `lantern-announcement` status region and
   `StageZones` has an `aria-live` instruction paragraph carrying the same `STEP_TEXT`.
