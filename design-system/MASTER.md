# Design System — Master

> **Hierarchy:** When building a page, read `design-system/pages/<page>.md` first. If it exists, its rules **override** this file; otherwise follow Master only.

---

## Reference source (this exercise)

- **Demo:** Haru **Circle** WordPress theme — **Home 6 – Film Online**
- **Local static export:** `demo.harutheme.com/circle/home-6/index.html`
- **Live demo (original):** `https://demo.harutheme.com/circle/home-6/`
- **Product type:** Video / film / streaming landing (dark cinematic UI, hero slider, full-bleed image sections)

---

## 1. UI UX Pro Max — generated baseline (search index)

_Generated via `search.py --design-system` (category: video streaming / OTT). Use as strategic guidance; **§2 overrides typography and surfaces** to match the demo HTML._

| Role | Hex (generated) | Notes |
|------|-----------------|--------|
| Primary | `#0F0F23` | Deep cinema navy |
| Secondary | `#1E1B4B` | Indigo support |
| CTA / accent | `#E11D48` | “Play” red — use for primary buttons, key links |
| Background | `#000000` | OLED-style black |
| Text on dark | `#F8FAFC` | Body on hero / overlays |

**Pattern:** Video-first hero — video or full-bleed hero, dark overlay (~60%), CTA on overlay + repeated CTA in lower sections.  
**Style keywords:** Dark mode (OLED), high contrast, entertainment, low eye strain.

**Anti-patterns (Pro Max):** static hero with no motion where video is expected; uncompressed or uncaptioned video; slow player startup.

---

## 2. Demo fidelity — tokens from `index.html` (use for visual parity)

These values come from the theme’s dynamic CSS in the exported page (WPBakery / Redux). **Prefer these for Next.js rebuilds** of Home 6.

### Typography

| Role | Family | Weights | Size (reference) |
|------|--------|---------|------------------|
| **Body** | **Nunito Sans** | 400 (base), 600–800 for emphasis | `14px` base |
| **Headings (H1–H6)** | **Playfair Display** | 700 | H1 example `36px` (page title), scale down for H2–H6 |
| **Page title (hero)** | Playfair Display | 400 | `36px` (see `.page-title-inner h1` in export) |

**Google Fonts (match export):**

```css
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:ital,wght@0,200..900;1,200..900&family=Playfair+Display:ital,wght@0,400..900;1,400..900&display=swap');
```

**CSS variables (suggested):**

```css
:root {
  --font-body: "Nunito Sans", system-ui, sans-serif;
  --font-heading: "Playfair Display", Georgia, serif;
}
```

> **Note:** UI Pro Max suggested Outfit + Work Sans for generic “modern landing” pairs. For **this** reference, **Nunito Sans + Playfair Display** are authoritative.

### Surfaces & lines (from VC section backgrounds)

| Token | Hex | Usage |
|-------|-----|--------|
| `--surface-elevated` | `#232323` | Footer / band sections |
| `--surface-default` | `#1e1e1e` | Main dark sections |
| `--surface-deep` | `#161616` | Alternate blocks, trailer area |
| `--border-subtle` | `#333333` | 1px top borders between bands |

Full-bleed **background images** appear on several rows (e.g. `trailer-bg-6.jpg`, `bottom-background-6.jpg`, `download-bg.jpg`) — keep **background-size: cover**, **center**, low overlay if text sits on top.

### Content colors

- Default text on dark: **white / near-white** (`#fff`, `#F8FAFC`, or rgba white at ~0.85–1 for secondary).
- Muted copy: **cool gray** (~`#a3a3a3` / `#94a3b8`), not low-contrast mid-gray on `#161616`.

### Motion

- Theme uses **Slider Revolution** + carousels; in Next.js prefer **CSS or Framer Motion** with **`prefers-reduced-motion`** reducing autoplay and parallax.

---

## 3. Components (dark theme — reconcile with §1–2)

### Primary button (CTA)

- Background: **`#E11D48`** (Pro Max accent) **or** theme primary if brand differs.
- Text: white; **padding** `12px 24px` min; **border-radius** `8px`.
- **Hover:** `opacity: 0.92` or lighten 5%; **transition** `150–200ms ease`.
- **`cursor-pointer`**; visible **`:focus-visible`** ring (e.g. 2px white or accent).

### Secondary / ghost (on dark)

- Border: `1px solid rgba(255,255,255,0.35)`; background transparent; text white.
- Hover: slightly brighter border / `background: rgba(255,255,255,0.06)`.

### Cards (film / video tiles)

- Background: `#1e1e1e` or `#232323`; **radius** `12px`; shadow subtle `0 8px 24px rgba(0,0,0,0.35)`.
- Hover: lift `translateY(-2px)` + stronger shadow; **no** layout-breaking scale on grid.

### Inputs (newsletter / contact)

- Background: `#0f0f0f` or `#1a1a1a`; border `1px solid #333`; text white.
- Focus: border accent or white at 50%; focus ring for a11y.

---

## 4. Next.js implementation notes (stack hints)

- Enable **`reactStrictMode: true`** in `next.config`.
- Hero / above-the-fold stills: Next.js **`<Image priority />`** for LCP; do **not** mark every image `priority`.
- Video: prefer **poster** image + lazy `preload="metadata"`; offer **captions** where applicable.

---

## 5. Global anti-patterns

- Emojis as icons — use **SVG** (Heroicons / Lucide).
- Missing **`cursor-pointer`** on clickable elements.
- **Contrast** below **4.5:1** for body text on `#161616` / `#1e1e1e`.
- Autoplay video with sound; respect **reduced motion** and **pause when off-screen** where possible.

---

## 6. Pre-delivery checklist

- [ ] Fonts: Nunito Sans (body) + Playfair Display (headings) loaded once (subset weights in use).
- [ ] Surfaces use palette in §2; accents consistent with §1 CTA.
- [ ] Hero video or image has overlay for text readability.
- [ ] Hover/focus states on interactive elements; keyboard focus visible.
- [ ] Responsive: `375`, `768`, `1024`, `1440` — no horizontal scroll.
- [ ] `prefers-reduced-motion` respected for sliders/parallax.

---

**Project label:** Circle Home 6 Film Online (Haru reference)  
**Last updated:** 2026-04-02  
**Skill:** UI UX Pro Max (`search.py --design-system --persist`) + manual extraction from demo `index.html`
