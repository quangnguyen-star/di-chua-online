# V1 parity verification (DCO-86)

Scope: `main` (DCO-77 destinations, DCO-78 home, DCO-79 motifs, DCO-80..85 six scenes) against
`reference/di-chua-online-site/`. No feature code; `src/**` and `reference/**` untouched. Added `tests/parity.test.ts`
(picked up by the package test script through `tests/*.test.ts`) and this report. No new suite under `qa/suites/`: nothing
here needs a browser beyond what the existing suites already drive, and a suite I cannot execute would only add an
unverified contract.

## 1. What was and was not run

| Command / check | Result |
| --- | --- |
| `npm run typecheck` | **Not run successfully.** `sh: 1: tsc: not found`. `node_modules` is absent and installing is disabled. |
| `npm run lint` | **Not run successfully.** `ESLint output (JSON parse failed: EOF while parsing a value at line 1 column 0)`; eslint is not installed. |
| `npm run build` | **Not run successfully.** `sh: 1: next: not found`. |
| The full test script | **Blocked.** A session hook refused it: "Running tests here is disabled - verification is GitHub CI's job now". |
| `tests/parity.test.ts` | One early run of this file with the Node test runner: checks for route files, titles, h1, test ids, static-page copy, privacy storage and checklist layers passed. Two failed because of bugs in the test itself (lantern colours read from the wrong module; layer names declared through `MOTIF_LAYERS` in `common.ts`). Both were fixed afterwards and **the fixed file was not re-run to a result**; the `lanternColors` import path (`river/sequence.ts`) is the least certain part. CI is the check. |
| Side-by-side captures at 640x360 against the stills | **Not taken.** No browser session and no built app (no dependencies installed). No acceptance item that depends on how a stop looks is verified. |

## 2. Route and content check (source level)

`tests/parity.test.ts` checks, for the 12 reference pages (home, /places, /places/hall, /places/hall/incense,
/places/courtyard/sweeping, /places/pond/lantern, /places/veranda, /places/word, /visit, /about, /privacy, 404):

- a page file exists on main for each;
- the reference `<title>` and `<h1>` strings occur in `src/`;
- every `data-testid` in the reference HTML is produced by main, either as a literal or through a template prefix
  (`map-place-`, `place-card-`, `lantern-color-`, `sound-`), and those families cover the same ids (six places, the
  lantern colours, ambience/cues/music);
- every heading, paragraph and list item in the `<main>` of about, privacy and 404 occurs verbatim in `src/`.

A throwaway script with the same logic found every reference id on main except `sweep-pile-0` (see section 4).
Not checked: layout, CSS, visual order, the body text of the other pages (only titles and headings were compared), and
`/visit`, whose reference page is a shell with no h1 or test ids of its own.

## 3. Named layers per stop

Declared layers (`SCENES[place].layers`, bottom to top):

- gate: sky, moon, mist, ridges, ground, umbrella-trees, tam-quan, hanging-lamps, stairs, stair-lamps, foliage, wash, crackle
- courtyard: sky, moon, mist, hall, hanging-lamps, ground, tiles, banyans, planters, fallen-leaves, broom, sweepers, drifting-leaves, wash, crackle
- hall: sky, orb, mist, ground, wash, crackle, columns, halo, statue, hanging-lamps, altar, altarGlow, oil-lamp, incense-bowl, incense-stick
- pond: sky, moon, ridges, mist, bank-and-gate, umbrella-trees, water, lily-pads, boat, lanterns, reeds, motes, wash, crackle
- veranda: sky, moon, ridges, mist, ground, pads, candles, boat, window-frame, table, teapot, cup, railing, rain, wash, crackle
- outside: sky, mist, ground, wash, crackle, moon, mountains, skyline, rocks, umbrella-trees, stairway, path-lamps

The gate declares all seven checklist items (moon, ridges, umbrella trees, tam quan, hanging lamps, stairs, stair lamps).
The hall declares the statue. Only the pond declares water, lantern, lily or mote layers. The test asserts these.
The ticket plan itself is not in the repo or the brief, so the checklists for courtyard, hall, pond, veranda and outside
in the test are my reading of the scene files; a person should compare them with the plan. "Declared" is not "visible":
whether a layer draws something recognisable at 640x360, day and night, was **not verified** (no WebGL here).

## 4. Where main intentionally differs from the reference

| Difference | Why |
| --- | --- |
| Reference is static HTML with no CSS or JS; main has Pixi scenes, parallax, timers, the lantern flow, sweeping, incense | The reference cannot show behaviour. Parity is for routes, copy and test ids, not motion. |
| `sweep-pile-0` in the reference is `sweep-pile` on main | An index-keyed test id is against the coding rules; there is one pile. |
| Reference has no sound and sends no events (its README says so) | Main has sound (off by default, generated on the device) and anonymous events to `/api/events`. |
| Privacy wording is word for word the reference text and must stay true | Main writes exactly two `localStorage` keys, `dc.word` and `dc.incense.spent` (asserted by the new test); no cookies, session storage or IndexedDB. A third key means the privacy page and the test change together. |
| Main also has `home-place-*` links and redirects from `/practices/*`, `/places/gate`, `/places/pond`, `/places/river` | Older URLs keep resolving (`src/content/routes.ts`); the reference has no page for them. |
| Reference lantern page lists seven colours (pink, gold, white, red, violet, blue, green); main's `lanternColors` has three (pink, gold, white) | Not a decision I can trace to a ticket; red, violet, blue and green test ids are therefore **not produced as separate buttons** by main. The test only requires main's colours to be a subset, so this gap needs a person to decide. |
| The tour embeds the same activities inside the shell | Known from D1: the pond handle does not reach `LanternFlow` in the tour and veranda draws two stages (`reports/d1-verification.md`, findings 1 and 2). Not re-checked and not fixed here. |

## 5. Acceptance items not verified

- Typecheck, lint, build, full test script: not run (section 1).
- 640x360 captures of all six stops against `reference/di-chua-online-site/art/stops/*.jpg`, day and night: not taken.
- Visual match of any layer (position, colour, the statue's shape, lamps lit): not verified.
- Frame rate, bundle size, reduced motion and the no-WebGL fallback (`StaticScene`): not verified.
- Whether the existing `qa/suites/*.json` files pass: not executed.
- Runtime `SceneHandle.layers()` per stop: not read from a live scene, only the declared lists.
- The ticket plan's own checklist text: not available to me.
