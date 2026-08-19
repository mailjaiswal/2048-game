---
name: Grid Logic Evolution
colors:
  surface: '#141218'
  surface-dim: '#141218'
  surface-bright: '#3b383e'
  surface-container-lowest: '#0f0d13'
  surface-container-low: '#1d1b20'
  surface-container: '#211f24'
  surface-container-high: '#2b292f'
  surface-container-highest: '#36343a'
  on-surface: '#e6e0e9'
  on-surface-variant: '#cbc4d2'
  inverse-surface: '#e6e0e9'
  inverse-on-surface: '#322f35'
  outline: '#948e9c'
  outline-variant: '#494551'
  surface-tint: '#cfbcff'
  primary: '#cfbcff'
  on-primary: '#381e72'
  primary-container: '#6750a4'
  on-primary-container: '#e0d2ff'
  inverse-primary: '#6750a4'
  secondary: '#cdc0e9'
  on-secondary: '#342b4b'
  secondary-container: '#4d4465'
  on-secondary-container: '#bfb2da'
  tertiary: '#e7c365'
  on-tertiary: '#3e2e00'
  tertiary-container: '#c9a74d'
  on-tertiary-container: '#503d00'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#e9ddff'
  primary-fixed-dim: '#cfbcff'
  on-primary-fixed: '#22005d'
  on-primary-fixed-variant: '#4f378a'
  secondary-fixed: '#e9ddff'
  secondary-fixed-dim: '#cdc0e9'
  on-secondary-fixed: '#1f1635'
  on-secondary-fixed-variant: '#4b4263'
  tertiary-fixed: '#ffdf93'
  tertiary-fixed-dim: '#e7c365'
  on-tertiary-fixed: '#241a00'
  on-tertiary-fixed-variant: '#594400'
  background: '#141218'
  on-background: '#e6e0e9'
  surface-variant: '#36343a'
typography:
  tile-number-lg:
    fontFamily: Sora
    fontSize: 48px
    fontWeight: '800'
    lineHeight: 48px
    letterSpacing: -0.02em
  tile-number-md:
    fontFamily: Sora
    fontSize: 36px
    fontWeight: '800'
    lineHeight: 36px
  score-label:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.05em
  score-value:
    fontFamily: Sora
    fontSize: 24px
    fontWeight: '700'
    lineHeight: 24px
  ui-button:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '600'
    lineHeight: 24px
  modal-title:
    fontFamily: Sora
    fontSize: 32px
    fontWeight: '800'
    lineHeight: 40px
  body-text:
    fontFamily: Hanken Grotesk
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  grid-gap: 12px
  grid-padding: 12px
  container-max: 500px
  tile-size: calc((100% - 36px) / 4)
  stack-sm: 8px
  stack-md: 16px
  stack-lg: 32px
---

## Brand & Style
The design system focuses on a high-focus, addictive puzzle experience that balances mathematical precision with sensory satisfaction. The brand personality is "Tactile Logic"—feeling both intellectually sharp and physically responsive.

The aesthetic utilizes a **Modern-Tactile** hybrid style. It combines the clean layouts of Minimalism with the physical responsiveness of Neomorphism (subtle depth) and the vibrant energy of High-Contrast design. The interface must feel "springy" and alive, reacting to every swipe with fluid motion. By offering five distinct visual "moods," the design system allows the user to transform their environment from a high-energy "Cyberpunk" arcade to a calm "Forest Fresh" retreat without changing the core mechanics.

## Colors
The system employs a multi-theme architecture. Each theme is defined by its background (the game board area), surface (the empty tile slots), and primary/secondary accents (the high-value tiles).

- **Primary Color:** Used for the "2048" goal tile and primary action buttons (New Game).
- **Secondary Color:** Reserved for mid-tier tiles to create visual progression.
- **Surface Color:** Represents the "void" or empty grid cells, providing a consistent container for the gameplay.
- **Status Colors:** Use standard semantic success (green) for winning and error (red) for game over, adjusted in saturation to match the active theme.

## Typography
The typography strategy creates a clear distinction between **Game Data** and **UI Controls**.

- **Tiles:** Use **Sora** for its bold, geometric, and high-impact numerals. As tile values increase (e.g., 1024), font size should scale down using the `tile-number-md` token to remain centered.
- **Scores:** Use **JetBrains Mono** for labels to evoke a sense of "calculation" and data tracking, paired with **Sora** for the actual numbers to maintain excitement.
- **UI & Navigation:** Use **Hanken Grotesk** for its extreme legibility and professional feel, ensuring the menus don't distract from the game grid.

## Layout & Spacing
The layout is centered around a fixed-aspect ratio grid. The "Game Container" should never exceed 500px in width to ensure players can track movement with a single glance.

- **The Grid:** A strict 4x4 matrix using `grid-gap` for gutters. The padding around the outside of the grid should match the internal gutters.
- **Mobile Reflow:** On screens smaller than 480px, the grid should scale to 95vw. Scores move from the side of the title to a stacked position above the grid.
- **Motion:** Movement is near-instant (100ms) to allow for rapid-fire play. The `tile-pop` animation (a slight scale-up beyond 100% and back) is triggered only when two tiles merge, providing essential visual feedback.

## Elevation & Depth
Depth is used to distinguish the "playing field" from the "pieces."

- **The Board:** Set at the lowest elevation (Background). Use a slight inner shadow or a darker tint of the background color to create a "recessed" look where tiles sit.
- **The Tiles:** Use subtle ambient shadows (0px 4px 8px, 10% opacity) to make them appear as if they are floating slightly above the board. In the Cyberpunk theme, replace shadows with an outer glow (bloom).
- **Modals:** Use a heavy backdrop blur (20px) and a higher elevation shadow (0px 20px 40px, 25% opacity) to completely isolate the game state during a "Game Over" or "Settings" event.

## Shapes
The design system uses a **Rounded** language (8px/0.5rem base) to make the tiles feel friendly and touch-optimized.

- **Tiles:** Use `rounded-lg` (16px) for the standard tile shape to give them a premium, stone-like feel.
- **Buttons:** Use `rounded-xl` (24px) or full pill-shape for primary actions to distinguish them from the square-ish tiles.
- **Container:** The main board container should match the tile's `rounded-lg` to create a cohesive nested-radius effect.

## Components

### Game Tiles
The core component. Every tile level (2, 4, 8, etc.) should have a unique background color. Text color should flip between dark and light based on the tile color's luminance for accessibility.

### Score Cards
A two-tier component. The top contains the "SCORE" or "BEST" label in `score-label` style, and the bottom contains the number. The background should be a semi-transparent version of the theme's `surface` color.

### Control Buttons
Buttons should have a subtle 2px bottom border (offset) to provide a "pressable" tactile feel. Upon interaction, the button should translate 1px downward to simulate a physical click.

### The Modal (Game Over / Settings)
A full-screen overlay. The content card should be centered, utilizing `rounded-xl` and a clear high-contrast primary button to "Try Again." 

### Feedback Toasts
Small, floating chips that appear when a high-value tile (1024+) is created. These use the `accent` color and a quick `fade-in` + `upward-slide` animation.