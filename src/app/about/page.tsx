import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import CircleHome6Header from '@/components/circle-home-6/CircleHome6Header';
import CircleHome6AboutSection from '@/components/circle-home-6/CircleHome6AboutSection';
import { RB_HERO_POSTER_JPG, ROYS_FAMILY_CHILDREN_JPG } from '@/components/circle-home-6/rbHeroMedia';
import { filmTw } from '@/components/circle-home-6/filmDesignTokens';
import { filmNunito, filmPlayfair } from '@/components/circle-home-6/filmFonts';
import GiventaCreditLines from '@/components/GiventaCreditLines';

export const metadata: Metadata = {
  title: 'About — R&B Productions',
  description:
    'R&B Productions — digital entertainment with soulful stories from Kerala to the world. Brisbane-based Malayalam film funding and production.',
};

/** Standalone About page — same copy and cards as the About section on the home page. */
export default function AboutPage() {
  return (
    <div
      className={`min-h-screen bg-[#161616] text-white ${filmNunito.className} ${filmNunito.variable} ${filmPlayfair.variable}`}
    >
      <CircleHome6Header />
      <main>
        <CircleHome6AboutSection compact={false} />
        <section
          className={`border-t ${filmTw.borderSubtle} bg-gradient-to-b from-[#161616] to-[#141414] py-12 md:py-16`}
          aria-label="Gallery"
        >
          <div className="mx-auto max-w-7xl space-y-10 px-4 lg:px-8">
            <div className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-[#1e1e1e] shadow-lg">
              <Image
                src={RB_HERO_POSTER_JPG}
                alt="R&amp;B Productions"
                width={1600}
                height={900}
                className="h-auto w-full object-contain"
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
            </div>
            {/* Hidden for now: second gallery image (main > section Gallery > div > div[2] > img) */}
            <div className="relative hidden w-full overflow-hidden rounded-xl border border-white/10 bg-[#1e1e1e] shadow-lg">
              <Image
                src={ROYS_FAMILY_CHILDREN_JPG}
                alt="Roy&apos;s family"
                width={1600}
                height={900}
                className="h-auto w-full object-contain"
                sizes="(max-width: 1280px) 100vw, 1280px"
              />
            </div>
          </div>
        </section>
      </main>
      <footer className={`${filmTw.footer} py-10`}>
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
          <Link
            href="/"
            className={`inline-flex items-center justify-center rounded-lg border border-white/35 px-6 py-3 text-sm font-semibold text-white transition hover:bg-white/[0.06] ${filmTw.accentHover}`}
          >
            ← Back to home
          </Link>
          <p className={`mt-6 text-sm ${filmTw.muted}`}>
            Copyright © {new Date().getFullYear()}{' '}
            <span className="font-semibold text-[#e2e8f0]">R&amp;B Productions</span> — All Rights Reserved
          </p>
          <div className={`mx-auto mt-6 max-w-7xl border-t ${filmTw.borderSubtle} px-4 pt-6 text-center text-xs leading-relaxed ${filmTw.muted} lg:px-8`}>
            <GiventaCreditLines variant="rbDark" />
          </div>
        </div>
      </footer>
    </div>
  );
}
