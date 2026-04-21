# Page overrides — Home 6 Film Online (Circle / Haru)

> **Overrides `design-system/MASTER.md` for this page only.**  
> **Source:** `demo.harutheme.com/circle/home-6/index.html`

---

## Layout

- **Header:** Sticky / mobile fly-out menu pattern; logo left; search icon; full nav on desktop.
- **Width:** Theme uses **wide** layout (`layout-wide`); content often centered in Bootstrap-style containers while **backgrounds are full-bleed**.
- **Hero:** Revolution Slider–style hero (video/film imagery); treat as **full viewport width**, min-height generous for “cinema” feel.

## Section rhythm (typical Home 6 stack)

1. **Hero** — full-width slider / video stills; dark overlay; title + optional CTA.
2. **Feature / trailer band** — `#161616` or image background (`trailer-bg-6.jpg` class of reference); padding ~3% vertical (theme uses VC padding).
3. **Content grids** — film cards, thumbnails, meta (title, category).
4. **Mid-page** — alternating `#1e1e1e` / `#232323` blocks; some rows use **background-image** + cover.
5. **Bottom CTA / download** — full-bleed image section (`download-bg.jpg` pattern); strong CTA.
6. **Footer** — darker band (`#232323`), top border `#333`.

## Typography overrides (page-specific)

- **Hero headline:** Playfair Display, large (theme uses big display type for impact); can be **italic** for subtitle if matching “Film Online” vibe.
- **Section titles:** Playfair Display **700**; spacing: margin below title before grid content.

## Color / atmosphere

- Prefer **§2 Master** surface tokens (`#1e1e1e`, `#161616`, `#232323`) over pure black for large areas — matches export and reduces harsh banding.
- **CTA red** `#E11D48` (from Master) for “Watch / Buy / Subscribe” unless brand dictates otherwise.

## Components specific to this page

- **Film / video cards:** 16:9 or 2:1 thumbnails; play icon overlay on hover; title below in Nunito Sans.
- **Slider arrows:** Visible on desktop; touch-friendly on mobile; do not rely on hover-only.

## WooCommerce (if ported)

- Reference export includes WooCommerce assets; product grids should keep **dark cards** and **clear price** contrast.

## Do not (this page)

- Light gray **body** text on `#161616` (fails WCAG).
- Thin hairline borders only — use **#333** or rgba white for separation on dark.
- Replacing Playfair/Nunito with unrelated geometric sans for headings (breaks demo parity).
