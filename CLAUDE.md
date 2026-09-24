@AGENTS.md

# Crawl — "Last Call" UI style

Build the UI in a retro dive-bar print style: cream paper, hard black borders, offset shadows, chunky slab display type. Looks screen-printed, not glassy. No gradients, no soft shadows, no rounded corners.

## Color
- Paper `#f4ece0` (app bg) · Raised paper `#fff8ec` (cards/inputs) · Bar/footer `#eadfcd`
- Ink `#241d18` (text, all borders) · Ink muted `#8a7a63` · Ink body `#5d5044`
- Oxblood `#8c2f24` — primary actions, "you are here", live route line
- Mustard `#d9a026` — highlights, badges, progress, secondary buttons
- Slate green `#3f6b5f` — avatars only
- Inverted screens (evening report): bg `#241d18`, text `#f4ece0`, mustard as accent.

## Type
- Display: **Alfa Slab One**, always `text-transform: uppercase`, `line-height: 1–1.1`. Screen titles 28–36px, card titles 18–26px, stat numbers 20–26px.
- UI/body: **DM Sans**. Body 13–16px. Buttons/labels 11–15px `700`, `letter-spacing: .06–.2em`, uppercase.
- Eyebrow labels: 10–11px, 700, `letter-spacing: .2em`, uppercase, oxblood or muted ink.
- Numbers-as-data always in Alfa Slab One; never in DM Sans.

## Surfaces & components
- Card: `background: #fff8ec; border: 3px solid #241d18;` no radius. Emphasis card adds `box-shadow: 5px 5px 0 #241d18` (or `#8c2f24` on dark screens).
- Placeholder/optional card: `border: 3px dashed #241d18`.
- Primary button: solid oxblood, cream text, 13–15px 700 uppercase, no radius, full-width in footers.
- Secondary button: transparent, `3px solid #241d18`, ink text.
- Small square buttons/icon chips: 34–40px, mustard fill, `3px solid #241d18`, `box-shadow: 3px 3px 0 #241d18`.
- Chips/filters: selected = ink fill + cream text; unselected = `2px solid #241d18`, transparent.
- Badges: mustard fill, `3px solid #241d18`, 10px 700 uppercase.
- List rows: `1px solid rgba(36,29,24,.2)` dividers inside cards; `3px solid #241d18` for structural section splits.
- Avatars: circles, 26–42px, `2px solid` the surface behind them, overlapped `-8px`, initials 11–14px 700.
- Stamps (confirmation moments): text in a `4px solid #8c2f24` box, `transform: rotate(-4deg)`, oxblood text.
- Screen chrome: header block ends with `3px solid #241d18`; footer tab bar on `#eadfcd` with the same 3px top border, labels 11px 700 uppercase `.12em`, active in oxblood, others `opacity .5`.
- Bottom sheet: `#fff8ec`, 3px ink borders top and bottom, 16–20px padding. No handle, no radius.
- Imagery: use diagonal striped placeholders until real photos exist — `repeating-linear-gradient(135deg,#e1d3ba 0 10px,#ece0cb 10px 20px)`.
- Layout: flex/grid with `gap`. Screen padding 20px, card padding 14–18px. Hit targets ≥44px.

## The map (the core screen)
Leaflet + OpenStreetMap tiles (`https://tile.openstreetmap.org/{z}/{x}/{y}.png`, attribution required), tinted into the palette with a CSS filter on the tile layer:

```css
.crawl-tiles { filter: sepia(.42) saturate(.62) contrast(1.04) brightness(1.05); }
.leaflet-container { background: #f4ece0; }
```

Route rendered A→B like a directions route, one polyline pair per leg:
- Casing under every leg: `color:#241d18, weight:9, opacity:.18, lineCap:round`
- Walked legs: `#241d18`, weight 5, `opacity:.5`
- Current leg: `#8c2f24`, weight 5, solid
- Upcoming legs: `#8c2f24`, weight 5, `dashArray:'2 9'`

Stop pins are `L.divIcon` circles, `3px solid #241d18`, `box-shadow: 2px 2px 0 #241d18`, Alfa Slab One number inside:
- done: ink fill, cream `✓`, 30px
- current: oxblood fill, cream number, 40px, `4px solid #d9a026`
- upcoming: cream fill, ink number, 30px, `3px dashed` acceptable

Current stop also gets a cream label plate: `2px solid #241d18`, `box-shadow: 2px 2px 0 #241d18`, 11px 700 uppercase.

Map screen composition: map fills the top ~50%, floating cream info card top-left (stop count + crawl name) and stacked square map controls top-right; a bottom sheet with the current bar, group avatars and Check in / Rate / Info; then a single "next stop" row with walk time; then the tab bar. Turn-by-turn directions is a shorter leg-only map (fixed ~300px, dragging off) over numbered step rows with mustard/outlined arrow squares.

Hide Leaflet's zoom control, disable scroll-wheel zoom, keep attribution at 9px on a translucent cream background.

## Copy
Straightforward and specific — "Stop 3 of 5", "9 min walk · Brunnenstr. → Invalidenstr.", "Sam is 4 min behind". No hype, no emoji, no exclamation marks.
