# Temple art layer

Original SVG art, first-party only (see `public/art/ASSETS.md`). Import from `@/components/temple/art` (or the
relative path). **The props below are frozen**: later tickets build on them, so add optional props only; never
rename or remove one.

Colours come from the `--art-*` tokens in `src/styles/tokens.css`. Day and night switch with the site theme
(`html[data-theme]` or the system setting); `variant` pins one regardless.

## Shared types

- `ArtVariant = "auto" | "day" | "night"`. `"auto"` follows the theme.

## Scenes (all take `ArtSceneProps`)

| Component | Default variant | Default `testId` |
| --- | --- | --- |
| `TamQuanStill` | auto | `art-tam-quan` |
| `IncenseAnimation` | auto | `art-incense` |
| `NightRiver` | night | `art-night-river` |

`ArtSceneProps`: `variant?: ArtVariant`, `label?: string` (accessible name, a Vietnamese default is provided),
`className?: string`, `testId?: string`. Each renders an `svg` with `role="img"`, scaling to its container width
(viewBox 400x240). `IncenseAnimation` is CSS-animated and static under `prefers-reduced-motion: reduce`.
`TamQuanStill` has three passages and layered curved tile roofs.

## Building blocks

- `ArtCanvas`: `{ viewBox?: string = "0 0 400 240", variant?, label?, className?, testId?, children }`. Without
  `label` the svg is `aria-hidden`.
- `Sky`: `LayerProps` `{ x?, y?, width?, height? }`, default fills 400x240; vertical gradient.
- `Ground`: `LayerProps`, default `y=190 height=50`.
- `Mist`: `LayerProps & { opacity?: number = 0.5 }`, default `y=150 height=60`.
- `PaperTexture`: `{ className?, children }`; a wrapper `div` that overlays `/art/paper.svg` grain
  (`data-testid="art-paper"`, overlay is `aria-hidden` and ignores pointer events).

Layers (`Sky`, `Ground`, `Mist`) are SVG fragments: render them inside an `ArtCanvas`/`svg`.

## Text and controls on art

Use `--art-text`, `--art-text-muted`, `--art-control-bg`, `--art-control-text`. Every pair is asserted at
>= 4.5:1 in day and night by `src/components/theme/contrast.test.ts`.
