# FreshBhoj Design System

The rule for every screen: **reference a token, never a literal.** No new hex
values, font names, radii or spacing numbers in feature code.

## Where things live

| Concern | File |
|---|---|
| Colour scales | [src/app/theme/palette.ts](src/app/theme/palette.ts) |
| Semantic tokens + elevation | [src/app/theme/colors.ts](src/app/theme/colors.ts) |
| Type scale | [src/app/theme/typography.ts](src/app/theme/typography.ts) |
| Spacing, radii, layout | [src/app/theme/spacing.ts](src/app/theme/spacing.ts) |
| Component library | [src/components/ui/](src/components/ui/) |

Everything is reachable through one import:

```ts
import { theme } from '@app/theme/index';

theme.colors.primary[600]     // brand CTA fill
theme.colors.accent[600]      // health / verified green
theme.colors.text.secondary   // semantic text colour
theme.text.h2                 // composed text style
theme.spacing.lg              // 16
theme.radius.card             // 20
theme.elevation.sm            // soft layered shadow
theme.layout.screenPadding    // 20 — the screen gutter
```

## Colour

**Primary (red/coral)** — the existing brand gradient is preserved exactly:
`400 #FF6B6B → 700 #BA2121 → 900 #670000` are the three stops already in the
logo, splash and CTAs. `600 #E2121D` is the flat CTA fill.

**Accent (green)** — health tags, nutrition chips, verified badges, success,
completed tracking steps. Deliberately **never** a call-to-action colour: red
is the only thing on screen allowed to ask for a tap.

**Neutral** — the greys the app was already using ad hoc (`#0F172A`, `#94A3B8`,
`#F1F5F9`, `#E2E8F0`…), now formalised into a 0–900 ramp.

`foodType` is separate and unthemed: the veg/non-veg square is a regulated
convention, so `VEG` green and `NON_VEG` red are fixed.

Named gradients (`gradients.brand`, `brandSoft`, `blush`, `imageScrim`) mean no
screen re-declares a colour stop array.

## Typography

Plus Jakarta Sans throughout — already bundled in `assets/fonts`, so no new font
files. Headlines use Bold/ExtraBold with negative tracking for the tight modern
look; body copy is Regular/Medium of the same family, so the app reads as one
voice.

`displayLarge · displayMedium · displaySmall · h1–h4 · bodyLarge · body ·
bodyMedium · bodySmall · label · caption · overline · button · buttonSmall · numeric`

## Radii, spacing, elevation

Radii lean large — `control` 14, `card` 20, `button` 18, `sheet` 28, `pill` full.
Spacing runs `xxs 2 → giant 100`, all `moderateScale`d for device sizes, with
`layout.screenPadding` (20) as the single screen gutter.

Elevation is soft and layered (`xs → lg`), plus `bar` (upward shadow for sticky
footers) and `primary` (brand-tinted glow under primary CTAs). Low opacity, wide
radius — cards lift rather than drop a hard shadow.

## Component library

| Component | Notes |
|---|---|
| `Button` | `primary` (brand gradient + glow) / `secondary` / `ghost` / `outline` / `danger`; `sm`/`md`/`lg`; loading and press states. |
| `Card` | Base surface. Elevation and padding as tokens, optional press state. |
| `Badge`, `VerifiedBadge` | Dietary tags, status pills, the curated-kitchen trust signal. |
| `Input` | Rounded, top label, error/helper, icon and prefix slots. |
| `Chip`, `ChipRow` | Goal filters. Selected state is **accent green**, never red. |
| `AppBar`, `AppBarAction` | Top bar; owns the safe-area inset. `transparent` sits over hero imagery. |
| `Screen` | Screen shell: background token, safe-area edges, status-bar style. |
| `StickyBar` | Bottom action bar; owns the bottom inset. |
| `Sheet` | Bottom sheet with the standard handle and header. |
| `QuantityStepper` | −/+ with a bin icon at the minimum for cart rows. |
| `NutritionBadgeRow` | Calories + protein at a glance — the core trust promise. |
| `FoodTypeDot` | The veg/non-veg square. |
| `RatingPill`, `StarRow` | Read-only and interactive ratings. |
| `SummaryRow`, `Divider` | Bill lines; identical on cart, checkout and order detail. |
| `ListItem`, `Avatar` | Settings rows and profile pictures with initials fallback. |
| `Skeleton` + `MealCardSkeleton` / `KitchenCardSkeleton` | Rounded-card loading states, never bare spinners. |
| `EmptyState` | Every "nothing here" moment, so none reads as a dead end. |

Two shared domain cards sit one level up because they are reused across
features: [MealCard](src/components/MealCard.tsx) and
[KitchenCard](src/components/KitchenCard.tsx).

## Bottom navigation

Home · Search · **Food Feed** (raised gradient centre button) · Orders · Profile.
Icons are lucide so the whole bar shares one stroke weight and tints from tokens.
