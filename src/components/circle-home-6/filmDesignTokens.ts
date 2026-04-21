/**
 * Haru Circle Home 6 / UI UX Pro Max alignment — see design-system/MASTER.md
 * CTA accent #E11D48; surfaces #161616 / #1e1e1e / #232323; border #333333
 */
export const FILM_ACCENT = '#E11D48';

/** Tailwind arbitrary color classes (single source for grep/refactor). */
export const filmTw = {
  accent: 'text-[#E11D48]',
  accentBorder: 'border-[#E11D48]',
  accentHover: 'hover:text-[#E11D48] hover:border-[#E11D48]',
  accentBg: 'bg-[#E11D48]',
  accentHoverBg: 'hover:bg-[#E11D48]/90',
  borderSubtle: 'border-[#333333]',
  surfaceDefault: 'bg-[#1e1e1e]',
  surfaceElevated: 'bg-[#232323]',
  surfaceDeep: 'bg-[#161616]',
  muted: 'text-[#94a3b8]',
  footer: 'border-t border-[#333333] bg-[#232323]',
} as const;
