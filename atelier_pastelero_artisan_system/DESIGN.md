---
name: Atelier Pastelero Artisan System
colors:
  surface: '#fff8f5'
  surface-dim: '#eed5c8'
  surface-bright: '#fff8f5'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#fff1eb'
  surface-container: '#ffeae0'
  surface-container-high: '#fde3d6'
  surface-container-highest: '#f7ddd1'
  on-surface: '#261911'
  on-surface-variant: '#57423a'
  inverse-surface: '#3c2d25'
  inverse-on-surface: '#ffede5'
  outline: '#8a7268'
  outline-variant: '#dec0b5'
  surface-tint: '#a14009'
  primary: '#9f3e07'
  on-primary: '#ffffff'
  primary-container: '#c05621'
  on-primary-container: '#fffeff'
  inverse-primary: '#ffb596'
  secondary: '#74584c'
  on-secondary: '#ffffff'
  secondary-container: '#fdd8c8'
  on-secondary-container: '#795c50'
  tertiary: '#006867'
  on-tertiary: '#ffffff'
  tertiary-container: '#0e8381'
  on-tertiary-container: '#fbfffe'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#ffdbcd'
  primary-fixed-dim: '#ffb596'
  on-primary-fixed: '#360f00'
  on-primary-fixed-variant: '#7d2d00'
  secondary-fixed: '#ffdbcc'
  secondary-fixed-dim: '#e3bfb0'
  on-secondary-fixed: '#2a170e'
  on-secondary-fixed-variant: '#5a4136'
  tertiary-fixed: '#94f2f0'
  tertiary-fixed-dim: '#77d6d3'
  on-tertiary-fixed: '#00201f'
  on-tertiary-fixed-variant: '#00504e'
  background: '#fff8f5'
  on-background: '#261911'
  surface-variant: '#f7ddd1'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.01em
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 26px
    fontWeight: '600'
    lineHeight: 34px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Playfair Display
    fontSize: 22px
    fontWeight: '600'
    lineHeight: 28px
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 18px
    fontWeight: '600'
    lineHeight: 24px
  title-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 17px
    fontWeight: '700'
    lineHeight: 24px
    letterSpacing: -0.01em
  title-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 15px
    fontWeight: '600'
    lineHeight: 20px
  body-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  body-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
  body-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 16px
  label-lg:
    fontFamily: Plus Jakarta Sans
    fontSize: 14px
    fontWeight: '600'
    lineHeight: 18px
  label-md:
    fontFamily: Plus Jakarta Sans
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: Plus Jakarta Sans
    fontSize: 10px
    fontWeight: '700'
    lineHeight: 12px
    letterSpacing: 0.04em
rounded:
  sm: 0.25rem
  DEFAULT: 0.5rem
  md: 0.75rem
  lg: 1rem
  xl: 1.5rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-sm: 0.75rem
  gutter-lg: 1.25rem
  margin: 1rem
  margin-tablet: 1.5rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2rem
---

## Brand & Style

This design system expresses the balance between high-end pastry craftsmanship and robust operational control. Built for artisanal bakeries and pastry ateliers, the interface blends editorial warmth with high-utility ERP ergonomics. 

### Design Philosophy
- **Artisanal Rigor:** The interface reflects the precision of patisserie—exact measurements, controlled temperatures, and elegant presentation—translated into structured data hierarchies and tactile surface layers.
- **Warm Tactility:** Surfaces evoke natural bakery elements (flour-dusted parchment, glazed confections, whipped creams, raw chocolate) without slipping into novelty skeuomorphism.
- **Operational Clarity:** High-tempo kitchen and counter environments require instant legibility, unambiguous production states, and generous touch targets that resist accidental input during active service.

## Colors

The palette establishes an organic, warm-cast atmosphere using culinary-inspired tones calibrated for high readability and operational distinction.

### Surface Hierarchy
- **Canvas Base:** `#FDFBF7` (soft warm ivory parchment).
- **Surface Level 1 (Cards, Sheets):** `#FFFFFF` with a slight warm undertone against the ivory canvas.
- **Surface Level 2 (Elevated Badges, Inputs):** `#F8F4EE` (clotted cream container).
- **Surface Level 3 (Nested Containers):** `#EFE9DF` (warm linen tint for nested order breakdown cards).

### Primary & Dark Brand Tones
- **Primary Action (Terracotta/Cinnamon):** `#C05621` (active elements, primary triggers, hero buttons).
- **Primary Interactive Hover/Active:** `#9C4215`.
- **Primary Subdued:** `#FEEBC8` (subtle terracotta surface).
- **Cacao Deep (Text Primary & Structural Chrome):** `#3D271D` (chocolate brown, replacing harsh carbon blacks).
- **Cacao Medium (Text Secondary):** `#705D53` (softened cocoa powder).
- **Cacao Hairlines (Borders):** `#E8DFC8` and `#DFD2BD`.

### State & Kitchen Badging System
- **Ready / Delivered / In Stock (Sage Mint):** Foreground `#234E52`, Border `#81E6D9`, Background `#E6FFFA`.
- **In Preparation / Progress (Warm Honey/Vanilla):** Foreground `#744210`, Border `#F6E05E`, Background `#FEFCBF`.
- **Low Stock / Expiry Warning (Caramel/Amber):** Foreground `#975A16`, Border `#FBD38D`, Background `#FEEBC8`.
- **Cancelled / Critical / Waste (Raspberry / Soft Cherry):** Foreground `#9B2C2C`, Border `#FEB2B2`, Background `#FFF5F5`.
- **Pending / In Queue (Dusted Neutral):** Foreground `#4A3E38`, Border `#D6C7B2`, Background `#F4EFEA`.

## Typography

The type scale combines the editorial elegance of `Playfair Display` with the geometric clarity of `Plus Jakarta Sans`. 

### Hierarchy Guidelines
- **Editorial Voice (Playfair Display):** Reserved for screen titles, revenue/order overview summaries, modal titles, and artisan product naming. Never used for dense data tables, kitchen inventory lines, or sub-16px text.
- **System Interface (Plus Jakarta Sans):** Governs operational inputs, order cards, batch recipes, measurement values, time counters, and state tags.
- **Numbers & Metrics:** Quantities and batch weights leverage tabular figures (`tnum`) in Plus Jakarta Sans to prevent layout jitter during kitchen stock updates.

## Layout & Spacing

A fluid single-column layout optimized for hand-held mobile devices with safe zones reserved for dynamic thumb-reach actions.

### Mobile Grid & Layout Principles
- **Grid Architecture:** 4-column fluid layout on mobile screens (`< 600px`), expanding to an 8-column layout on tablets and POS displays.
- **Screen Margins:** Fixed `16px` (`margin`) outer edge gutters on mobile to maximize card surface area while preventing edge-clipping.
- **Operational Ergonomics:** Interactive primary targets adhere strictly to minimum heights of `48px` to facilitate single-handed navigation on handheld counter tablets and kitchen phones.

## Elevation & Depth

This design system uses warm ambient diffusion paired with soft hairline frames to evoke fine bakery packaging rather than cold software planes.

### Shadow Styles
- **Resting Surface (Cards & List Items):** `0 1px 3px rgba(61, 39, 29, 0.04), 0 4px 12px rgba(61, 39, 29, 0.03)`.
- **Floating Kitchen Drawer / Action Sheet:** `0 8px 24px rgba(61, 39, 29, 0.08), 0 2px 6px rgba(61, 39, 29, 0.04)`.
- **Active / Dragged Ticket:** `0 12px 32px rgba(61, 39, 29, 0.12), 0 4px 8px rgba(61, 39, 29, 0.06)`.

### Border Rationale
To guarantee readability in bright kitchen lighting, elevations are always reinforced with a 1px border colored `#EFE8DD`. This prevents cards from bleeding into the `#FDFBF7` canvas.

## Shapes

The geometry reflects warm, handcrafted pastry craft: dough rounds, smooth glazes, and scalloped edges.

- **Primary Container Radii:** Standard cards, bottom sheets, and modal frames use `rounded-2xl` (`1rem` / `16px`) to produce soft corners that feel natural and tactile.
- **Micro-Badges & Tags:** Fully rounded pill shapes (`rounded-full`) are applied strictly to status badges, categorizing orders without conflicting with card envelopes.
- **Buttons & Form Fields:** Standardized on `rounded-xl` (`0.75rem` / `12px`) for precise tactile boundaries that retain clean ergonomic balance alongside `rounded-2xl` cards.

## Components

### Buttons
- **Primary (Terracotta Action):** Background `#C05621`, text `#FFFFFF`, radius `12px`. Height `48px`. Pressed state scales to `0.98` with background `#9C4215`.
- **Secondary (Cacao Outline):** Background transparent, border `1.5px solid #3D271D`, text `#3D271D`, font weight 600.
- **Auxiliary Kitchen Action:** Background `#F8F4EE`, border `1px solid #DFD2BD`, text `#705D53`.

### Order & Inventory Cards
- **Base Style:** Background `#FFFFFF`, border `1px solid #EFE8DD`, radius `16px`, padding `16px`.
- **Structure:** 
  1. *Top Header:* Monospace or tabular order ID `#1042`, elapsed timer, and status micro-badge.
  2. *Body:* Product name in `title-md` (Plus Jakarta Sans Bold), quantity pill indicator, special bakery modifiers (e.g., "Sin Gluten", "Extra Praliné") in subtle italicized secondary cacao.
  3. *Footer:* Total value, payment status, and single tap primary step action (e.g., "Mover a Horno").

### Status Micro-Badges
- Micro-badges feature a compact padding of `4px 8px`, `rounded-full`, with uppercase tracking (`label-sm`).
- Include an inline `6px` tinted dot preceding the status label:
  - **Listo para Entrega:** Green dot (`#38A169`), `#E6FFFA` fill, `#234E52` text.
  - **En Preparación:** Honey dot (`#D69E2E`), `#FEFCBF` fill, `#744210` text.
  - **Pendiente:** Warm grey dot (`#A0AEC0`), `#F4EFEA` fill, `#4A3E38` text.
  - **Stock Bajo / Caducidad:** Amber/Raspberry dot (`#E53E3E`), `#FFF5F5` fill, `#9B2C2C` text.

### Form Inputs & Quantity Pickers
- **Text Inputs:** Height `48px`, background `#FDFBF7`, border `1.5px solid #DFD2BD`, text `#3D271D`. Focus state uses `#C05621` ring with 0 offset.
- **Recipe Gram/Kilo Stepper:** Three-part component with sunken `#F8F4EE` middle readout and dual chunky `+` / `-` buttons minimum `44px` square to accommodate pastry production workflows.

### Inventory Stock Level Progress
- Track: Height `6px`, background `#EFE8DD`, `rounded-full`.
- Indicators shift contextually: `#48BB78` (Optimal), `#ECC94B` (Restock Soon), `#E53E3E` (Critical Level).