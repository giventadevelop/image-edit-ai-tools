import type { CSSProperties, ReactNode } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { mdStrikersBrand as b } from './mdStrikersBrand';
import type { FcNavKey } from './fcUnitedNavLinks';
import { FC_UNITED_NAV_LINKS } from './fcUnitedNavLinks';
import { FcUnitedMobileNav } from './FcUnitedMobileNav';

/** Matches mdStrikersBrand.accent — full class strings for Tailwind JIT */
const navHoverActive = 'transition-colors duration-200 hover:text-[#e31837]';
const navActive = 'text-[#e31837]';

export type { FcNavKey };

function Shell({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('mx-auto w-full max-w-[1308px] px-3 sm:px-4 md:px-7 lg:px-12', className)}>{children}</div>
  );
}

export function FcUnitedHeader({ active }: { active?: FcNavKey }) {
  const headerStyle: CSSProperties = {
    backgroundColor: b.navy,
    ['--md-accent' as string]: b.accent,
    ['--md-gold' as string]: b.gold,
    ['--md-text' as string]: b.text,
    ['--md-text-muted' as string]: b.textMuted,
  };

  return (
    <header
      className="md-strikers-header relative z-50 border-b border-white/[0.06] text-[var(--md-text-muted)] shadow-[0_4px_24px_rgba(0,0,0,0.35)] backdrop-blur-sm"
      style={headerStyle}
    >
      <Shell className="flex min-h-[calc(3.25rem+1.5rem)] items-center justify-between gap-3 py-3 sm:min-h-[calc(4rem+1.5rem)] sm:gap-5 sm:py-3.5 md:min-h-[calc(4.5rem+1.75rem)] md:gap-6 lg:min-h-[calc(5.25rem+1.75rem)] xl:min-h-[calc(5.75rem+1.75rem)]">
        <Link
          href="/"
          className="group flex min-w-0 flex-1 items-center gap-2.5 sm:gap-3 md:gap-4 lg:gap-5"
          aria-label="Maryland Strikers — Home"
        >
          <div className="relative flex h-[3.25rem] w-[3.25rem] flex-shrink-0 items-center justify-center sm:h-16 sm:w-16 md:h-[4.5rem] md:w-[4.5rem] lg:h-[5.25rem] lg:w-[5.25rem] xl:h-[5.75rem] xl:w-[5.75rem]">
            <Image
              src="/images/logo/roy_and_bindu_prod_logo_transparent.png"
              alt="Roy and Bindu Productions"
              width={280}
              height={280}
              sizes="(max-width: 640px) 160px, (max-width: 768px) 176px, (max-width: 1024px) 192px, 236px"
              className="h-full w-full object-contain object-center drop-shadow-[0_2px_8px_rgba(0,0,0,0.45)] transition-transform duration-300 group-hover:scale-[1.02]"
              priority
            />
          </div>
          <div className="flex min-w-0 flex-col justify-center leading-none">
            <span
              className={cn(
                'font-bold tracking-tight text-white',
                'text-[1.125rem] leading-tight sm:text-[1.1875rem] md:text-[1.4375rem] lg:text-[1.6875rem] xl:text-[1.8125rem]',
                '[text-shadow:0_1px_2px_rgba(0,0,0,0.55)]',
              )}
            >
              <span className="inline sm:hidden">MD Strikers</span>
              <span className="hidden sm:inline">Maryland Strikers</span>
            </span>
            <span
              className={cn(
                'mt-1 font-semibold uppercase tracking-[0.18em] sm:mt-1.5',
                'text-[0.625rem] sm:text-[0.6875rem] md:text-[0.8125rem]',
              )}
              style={{ color: b.gold }}
            >
              Sports Club
            </span>
          </div>
        </Link>
        <div className="flex flex-shrink-0 items-center gap-0">
          <nav
            className="hidden items-center gap-5 text-sm font-semibold text-white md:flex lg:gap-8 lg:text-[0.9375rem]"
            aria-label="Primary"
          >
            {FC_UNITED_NAV_LINKS.map(({ href, label, key }) => (
              <Link key={key} href={href} className={cn(navHoverActive, active === key && navActive)}>
                {label}
              </Link>
            ))}
          </nav>
          <FcUnitedMobileNav active={active} />
        </div>
      </Shell>
    </header>
  );
}
