# V2 real verification report from CI (DCO-99)

Scope: CI on final `main` (`977a95f`, DCO-100). No feature code was changed. Every result below is read from a GitHub
Actions run, not from a static read of the source. Where CI produced nothing, the item is marked not run.

**Verdict: main is not verified.** CI on final main is red at lint. Test, build and the whole capture job were skipped by that failure, so there are no captures, no side-by-side sheets and no trace.

## 1. CI run on final main

Run: https://github.com/quangnguyen-star/di-chua-online/actions/runs/46042071756 (push, `977a95f`, workflow `CI`).

| Step | Result |
| --- | --- |
| `npm install` | Pass |
| `npm run typecheck` (`tsc --noEmit`) | Pass |
| `npm run lint` (`eslint`) | **Fail**: 45 problems, 33 errors and 12 warnings |
| `npm test` | Not run (skipped after the lint failure) |
| `npm run build` | Not run (skipped after the lint failure) |
| Job `capture` (build, Playwright matrix, upload, publish to `ci-captures`) | Not run (`needs: verify`) |

Lint errors are the React compiler rules in `eslint-plugin-react-hooks`, mostly `react-hooks/refs` ("Cannot access refs during render" and "Cannot update ref during render"). They sit in:

- `src/lib/visit/useVisit.ts` (lines 15, 17, 21, 23)
- `src/lib/useActiveTimer.ts` (lines 11, 16, 25, 34)
- `src/lib/activity/useActivity.ts` (line 13)
- `src/components/visit/useInstruction.ts` (line 30)
- `src/components/visit/VisitShell.tsx` (lines 74, 83)
- `src/components/temple/stage/SceneStage.tsx` (lines 33, 36, 40, 44)
- `src/components/temple/scenes/Gate.tsx` (lines 51, 57, 62)

The warnings are `@typescript-eslint/no-unused-vars` (8), `react-hooks/exhaustive-deps` (3) and `@next/next/no-img-element` (1).

This ticket owns only `reports/**` and `qa/suites/*.json`, so the lint errors are not fixed here. They need a fix ticket against the files above, or a deliberate decision to downgrade the rule in `eslint.config.mjs`.

## 2. CI history on main (all red)

| Run | Commit | Result |
| --- | --- | --- |
| https://github.com/quangnguyen-star/di-chua-online/actions/runs/46042071756 | `977a95f` DCO-100 | Fail |
| https://github.com/quangnguyen-star/di-chua-online/actions/runs/46041921085 | `772a3bb` DCO-98 | Fail |
| https://github.com/quangnguyen-star/di-chua-online/actions/runs/46041561456 | `14e555f` DCO-90 | Fail |
| https://github.com/quangnguyen-star/di-chua-online/actions/runs/46041449713 | `66895a1` DCO-92 | Fail |
| https://github.com/quangnguyen-star/di-chua-online/actions/runs/46041318123 | `49be31c` DCO-97 | Fail |
| https://github.com/quangnguyen-star/di-chua-online/actions/runs/46041202755 | `1ea61aa` DCO-96 | Fail |

I read the step detail only for the run on final main. The others are listed as failed and I did not check which step failed in each.

## 3. Capture matrix and side-by-side sheets

Not produced. The `capture` job never started, and the `ci-captures` branch does not exist on the remote (the GitHub API returns "Branch not found"). So this report has no final capture matrix and no side-by-side sheets. Nothing was re-run locally in place of CI.

## 4. `qa/suites/*.json` through the browser probe

Not run. The repo has 15 suite files and none was executed. `qa/scripts/browser_probe.py` needs a running app at `QA_BASE_URL`. CI never built or started one, and this session cannot install or start it. No suite file was edited.

## 5. Frame time

Not measured. There is no 30-second headless trace: `tests/visual/capture.spec.ts` has no trace or p95 code, and the capture job never ran. When it is measured, it must be labeled software-GL (SwiftShader, which is what `playwright.config.ts` forces) and NOT a phone result.

## 6. Still unverified, honestly

- Build: `npm run build` has not passed on CI for main.
- Unit and node tests: `npm test` has not run on CI for main.
- The six stops, day and night, reduced motion, no-WebGL failure state: no captures.
- Side-by-side comparison sheets against the references: none.
- p95 frame time against 16.7 ms: not measured at all, on any device.
- 60 fps desktop and 30 fps mid-range mobile targets: unverified.
- Stop 1 enterable in under 2 s on 4G: unverified.
- The ~1.5 MB per-stop asset budget: built bundle never inspected.
- All 15 `qa/suites/*.json`: not executed.
- Audio, swipe and arrow navigation on real input: unverified.
- The AC-1..AC-17 list is not in the repo, so there is no per-AC mapping.
- The lint failures may point at real defects (refs written during render in `useVisit`, `useActiveTimer`, `SceneStage`, `Gate`). They are unreviewed.

## 7. Next step

1. Fix the 33 lint errors, or relax the rule on purpose, in a ticket that owns those source files.
2. Re-run `CI` on main.
3. If it is green, update this report from the `captures` artifact and the `ci-captures` branch. Add a 30 s trace step to the capture job before quoting any p95.
