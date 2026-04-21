import Image from 'next/image';
import Link from 'next/link';
import CircleHome6TrailersClient from './CircleHome6TrailersClient';
import CircleHome6Header from './CircleHome6Header';
import CircleHome6AboutSection from './CircleHome6AboutSection';
import { CircleHome6HeroVideo } from './CircleHome6HeroVideo';
import { filmTw } from './filmDesignTokens';
import { filmNunito, filmPlayfair } from './filmFonts';
import GiventaCreditLines from '@/components/GiventaCreditLines';
import {
  RB_LOGO_WITHOUT_BG_PNG,
  MOVIE_POSTER_RECREATED_1_JPG,
  MOVIE_POSTER_RECREATED_2_JPG,
  MOVIE_POSTER_RECREATED_3_JPG,
  MOVIE_POSTER_RECREATED_4_JPG,
  MOVIE_POSTER_RECREATED_5_JPG,
  MOVIE_POSTER_RECREATED_6_JPG,
  RB_HERO_LOOP_MP4,
  RB_HERO_POSTER_JPG,
  ROY_BINDHU_NADHIRSHAH_FILM_STRIP_JPG,
  VIDEO_BRISBANE_THUMBNAIL_JPG,
} from './rbHeroMedia';

/** Demo CDN — theme snapshot has no local wp-content/uploads; mirror uses live demo URLs. */
const U = 'https://demo.harutheme.com/circle/wp-content/uploads';

/** Current Projects strip — three posters only. */
const NOW_PLAYING = [
  { src: MOVIE_POSTER_RECREATED_1_JPG, title: 'Yatra', rating: '8.7', cats: 'Action / Drama', label: 'Hot' as const },
  { src: MOVIE_POSTER_RECREATED_2_JPG, title: 'Azhangalilekk', rating: '8.7', cats: 'Comedy / Historycal', label: 'Trend' as const },
  { src: MOVIE_POSTER_RECREATED_3_JPG, title: 'Kadal', rating: '8.7', cats: 'Comedy / Drama' },
];

const THEATER = [
  { src: MOVIE_POSTER_RECREATED_4_JPG, title: 'Wynonna', rating: '8.7', label: 'Hot' as const },
  { src: MOVIE_POSTER_RECREATED_5_JPG, title: 'War is Coming', rating: '8.7', label: 'Trend' as const },
  { src: MOVIE_POSTER_RECREATED_6_JPG, title: 'Red Sonja', rating: '8.7' },
  { src: `${U}/2017/08/drive-angry.jpg`, title: 'Drive Angry', rating: '8.7' },
  { src: `${U}/2017/08/eiskonigin.jpg`, title: 'Last Christmas', rating: '8.7', label: 'New' as const },
  { src: `${U}/2017/08/better-call-saul.jpg`, title: 'Film Studio', rating: '8.7' },
  { src: `${U}/2017/08/after-earth.jpg`, title: 'Awesome Film Maker', rating: '10' },
  { src: `${U}/2017/08/leaf.jpg`, title: 'Leaf', rating: '8.0' },
];

/** Trailers strip: only two thumbnail buttons (matches section Trailers UI). */
const TRAILERS = [
  {
    img: VIDEO_BRISBANE_THUMBNAIL_JPG,
    title: 'Brisbane inauguration',
    cats: 'R&B Productions',
  },
  { img: `${U}/2017/08/trailer-wonder-2.jpg`, title: 'Awesome Film Maker', cats: 'Action / Horror' },
];

const CELEBS = [
  { thumb: `${U}/2017/07/abbie-ferguson.jpg`, name: 'Peter Spider', views: '964 views', role: 'Actor' },
  { thumb: `${U}/2017/07/alex-ferguson.jpg`, name: 'Thomas Mane', views: '735 views', role: 'Director' },
  { thumb: `${U}/2017/08/helena-james.jpg`, name: 'Helena James', views: '462 views', role: 'Actor' },
  { thumb: `${U}/2017/08/corlenia-lewis.jpg`, name: 'Corlenia Lewis', views: '347 views', role: 'Actor' },
  { thumb: `${U}/2017/07/austin-aguilar.jpg`, name: 'Diana Angel', views: '345 views', role: 'Actor' },
];

function SectionHead({
  title,
  rightHref = '#',
  showViewAll = true,
}: {
  title: string;
  rightHref?: string;
  showViewAll?: boolean;
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <h2 className={`${filmPlayfair.className} text-2xl text-white sm:text-3xl`}>{title}</h2>
      {showViewAll && (
        <Link
          href={rightHref}
          className={`self-start rounded-full border border-white/35 px-5 py-2 text-sm font-semibold text-white/90 transition hover:bg-white/[0.06] sm:self-auto ${filmTw.accentHover}`}
        >
          View all
        </Link>
      )}
    </div>
  );
}

function FilmPoster({
  src,
  title,
  rating,
  cats,
  label,
  compact,
}: {
  src: string;
  title: string;
  rating: string;
  cats?: string;
  label?: 'Hot' | 'Trend' | 'New';
  compact?: boolean;
}) {
  const labelCls =
    label === 'Hot'
      ? 'bg-orange-600'
      : label === 'Trend'
        ? 'bg-emerald-600'
        : label === 'New'
          ? 'bg-violet-600'
          : '';

  return (
    <div className="group w-[160px] flex-shrink-0 sm:w-[200px] lg:w-[220px]">
      <div className="relative overflow-hidden rounded-xl bg-[#232323] shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
        <div className="relative aspect-[270/390] w-full">
          <Image src={src} alt={title} fill className="object-cover transition duration-300 group-hover:scale-105" sizes="220px" />
        </div>
        {label && (
          <span className={`absolute left-2 top-2 rounded px-2 py-0.5 text-xs font-bold text-white ${labelCls}`}>{label}</span>
        )}
        <div className="absolute inset-0 flex items-center justify-center bg-black/0 opacity-0 transition group-hover:bg-black/40 group-hover:opacity-100">
          <span className="rounded-full bg-white/20 px-4 py-2 text-xs font-semibold text-white backdrop-blur">Play</span>
        </div>
      </div>
        <div className="mt-3">
        <div className={`flex items-baseline gap-1 ${filmTw.accent}`}>
          <span className="text-lg font-bold">{rating}</span>
          <span className="text-sm text-white/50">/10</span>
        </div>
        <h3 className="mt-1 font-semibold text-white">{title}</h3>
        {cats && !compact && <p className="mt-1 text-xs text-white/50">{cats}</p>}
      </div>
    </div>
  );
}

function FilmGridCard({
  src,
  title,
  rating,
  label,
}: {
  src: string;
  title: string;
  rating: string;
  label?: 'Hot' | 'Trend' | 'New';
}) {
  const labelCls =
    label === 'Hot'
      ? 'bg-orange-600'
      : label === 'Trend'
        ? 'bg-emerald-600'
        : label === 'New'
          ? 'bg-violet-600'
          : '';

  return (
    <div className="group">
      <div className="relative overflow-hidden rounded-xl bg-[#232323] shadow-[0_8px_24px_rgba(0,0,0,0.35)]">
        <div className="relative aspect-[270/390] w-full">
          <Image src={src} alt={title} fill className="object-cover transition group-hover:scale-105" sizes="(max-width:768px) 45vw, 220px" />
        </div>
        {label && (
          <span className={`absolute left-2 top-2 rounded px-2 py-0.5 text-xs font-bold text-white ${labelCls}`}>{label}</span>
        )}
        <div className="absolute bottom-2 right-2 rounded bg-black/70 px-2 py-1 text-xs text-white">
          <span className={`font-bold ${filmTw.accent}`}>{rating}</span>
          <span className="text-white/60">/10</span>
        </div>
      </div>
      <h3 className="mt-3 text-center font-semibold text-white">{title}</h3>
    </div>
  );
}

export default function CircleHome6Page() {
  return (
    <div
      className={`min-h-screen bg-[#161616] text-white ${filmNunito.className} ${filmNunito.variable} ${filmPlayfair.variable}`}
    >
      <CircleHome6Header />

      {/* Hero — 16:9 box (encode target); object-contain shows full frame — no head crop from object-cover */}
      <section className="relative w-full overflow-hidden bg-[#161616]">
        <div className="relative aspect-video w-full">
          <CircleHome6HeroVideo
            src={RB_HERO_LOOP_MP4}
            poster={RB_HERO_POSTER_JPG}
            className="absolute inset-0 h-full w-full bg-[#161616] object-contain object-center"
          />
        </div>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-black/35 to-black/25" />
        <div className="absolute bottom-0 left-0 z-10 max-w-4xl px-4 pb-10 pt-8 text-left lg:px-8 lg:pb-14">
          <p
            className={`${filmPlayfair.className} text-2xl font-normal leading-snug text-white sm:text-3xl md:text-4xl`}
          >
            An initiative by Roy and Bindu
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-sm text-white/90 sm:text-base">
            <span>Brisbane, Australia</span>
            <span className="text-white/40">|</span>
            <span>Malayalam cinema &amp; digital entertainment</span>
          </div>
        </div>
      </section>

      {/* Film strip graphic — Roy, Bindhu & Nadirshah (inner card: no vertical padding on mobile; sm+ restores spacing) */}
      <section className="border-t border-white/5 bg-[#1b1b1b] py-12 sm:py-16 lg:py-20">
        <div className="mx-auto max-w-7xl px-6 sm:px-10 lg:px-14">
          <div className="rounded-2xl border border-white/10 bg-[#161616]/60 px-5 py-0 shadow-inner sm:px-10 sm:py-12 lg:px-14 lg:py-16">
            <Image
              src={ROY_BINDHU_NADHIRSHAH_FILM_STRIP_JPG}
              alt="Roy, Bindhu, and Nadirshah — film strip"
              width={3840}
              height={1600}
              className="mx-auto h-auto w-full max-w-full object-contain"
              sizes="(max-width: 1280px) calc(100vw - 3rem), 80rem"
              priority
            />
          </div>
        </div>
      </section>

      <CircleHome6AboutSection />

      {/* Current Projects */}
      <section className={`border-t ${filmTw.borderSubtle} bg-[#1e1e1e] py-14`}>
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHead title="Current Projects" showViewAll={false} />
          <div className="-mx-4 flex gap-6 overflow-x-auto pb-4 pl-4 pr-4 scrollbar-thin lg:mx-0 lg:pl-0">
            {NOW_PLAYING.map((f) => (
              <FilmPoster key={f.title} {...f} />
            ))}
          </div>
        </div>
      </section>

      {/* Movies in theater + sidebar — hidden (restore: remove `hidden` from className) */}
      <section className={`hidden border-t ${filmTw.borderSubtle} bg-[#232323] py-14`}>
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <SectionHead title="Movies in theater" showViewAll={false} />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {THEATER.map((f) => (
                  <FilmGridCard key={f.title + f.src} {...f} />
                ))}
              </div>
            </div>
            <aside className="space-y-8 lg:col-span-4">
              <div className="overflow-hidden rounded-lg border border-white/10">
                <Image
                  src={`${U}/2017/08/banner-ads.jpg`}
                  alt="Advertisement"
                  width={400}
                  height={240}
                  className="h-auto w-full object-cover"
                />
              </div>
              <div className="rounded-lg border border-white/10 bg-[#1e1e1e] p-5">
                <h3 className="mb-4 text-lg font-bold text-white">Top View</h3>
                <ul className="space-y-4">
                  {['HaruTheme Introduction', 'War is Coming', 'Wynonna', 'Red Sonja'].map((name, i) => (
                    <li key={name} className="flex gap-3">
                      <span className="text-2xl font-bold text-[#E11D48]/85">0{i + 1}</span>
                      <div>
                        <p className="font-medium text-white">{name}</p>
                        <p className="text-xs text-white/45">{(1010 - i * 100).toString()} views</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* Trailers */}
      <section className={`border-t ${filmTw.borderSubtle} bg-[#161616] py-14`}>
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <SectionHead title="Trailers & Videos" showViewAll={false} />
          <CircleHome6TrailersClient trailers={TRAILERS} playfairClassName={filmPlayfair.className} />
        </div>
      </section>

      {/* Film series + celebrities */}
      <section className={`border-t ${filmTw.borderSubtle} bg-[#1e1e1e] py-14`}>
        <div className="mx-auto max-w-7xl px-4 lg:px-8">
          <div className="grid gap-10 lg:grid-cols-12">
            <div className="lg:col-span-8">
              <SectionHead title="Film Series" showViewAll={false} />
              <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4">
                {THEATER.slice(0, 3).map((f) => (
                  <FilmGridCard key={`series-${f.title}`} {...f} />
                ))}
              </div>
            </div>
            <aside className="lg:col-span-4">
              <div className="overflow-hidden rounded-lg border border-white/10">
                <Image
                  src={`${U}/2017/08/banner-ads-2.jpg`}
                  alt=""
                  width={400}
                  height={240}
                  className="h-auto w-full object-cover"
                />
              </div>
              <div className="mt-8 rounded-lg border border-white/10 bg-[#232323] p-5">
                <h3 className="mb-4 text-lg font-bold text-white">Spotlight Celebrities</h3>
                <ul className="space-y-4">
                  {CELEBS.map((c) => (
                    <li key={c.name} className="flex gap-3">
                      <div className="relative h-16 w-14 flex-shrink-0 overflow-hidden rounded">
                        <Image src={c.thumb} alt={c.name} fill className="object-cover" sizes="56px" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-white">{c.name}</p>
                        <p className="text-xs text-white/45">{c.views}</p>
                        <p className={`text-xs ${filmTw.accent}`}>{c.role}</p>
                      </div>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className={`border-t ${filmTw.borderSubtle} bg-gradient-to-br from-[#1a0a12]/95 via-[#161616] to-[#0f0f0f] py-16`}>
        <div className="mx-auto max-w-7xl px-4 text-center lg:px-8">
          <h2 className={`${filmPlayfair.className} mx-auto max-w-xl text-2xl text-white md:text-3xl`}>
            Let&apos;s make great things together!
          </h2>
        </div>
      </section>

      <footer className={`${filmTw.footer} py-14`}>
        <div className="mx-auto grid max-w-7xl gap-10 px-4 md:grid-cols-2 lg:grid-cols-3 lg:px-8">
          <div>
            <h5 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Contact</h5>
            <ul className={`space-y-2 text-sm ${filmTw.muted}`}>
              <li>Brisbane, Queensland, Australia</li>
              <li>R&amp;B Productions — Malayalam film funding &amp; production</li>
            </ul>
          </div>
          <div>
            <h5 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Services</h5>
            <ul className={`space-y-2 text-sm ${filmTw.muted}`}>
              <li>Movie production</li>
              <li>Movie promotions</li>
              <li>Digital content creation</li>
              <li>Distribution</li>
            </ul>
          </div>
          <div>
            <h5 className="mb-4 text-sm font-bold uppercase tracking-wider text-white">Social</h5>
            <ul className={`flex flex-wrap gap-4 text-sm ${filmTw.muted}`}>
              <li>Facebook</li>
              <li>Twitter</li>
              <li>Instagram</li>
            </ul>
          </div>
        </div>
        <div className="mx-auto flex w-full max-w-7xl justify-center px-4 pb-0 pt-4 leading-none sm:pt-5 lg:px-8">
          <Image
            src={RB_LOGO_WITHOUT_BG_PNG}
            alt="R&amp;B Productions"
            width={2000}
            height={1000}
            className="mx-auto block h-auto w-full max-w-full object-contain object-center max-h-96 sm:max-h-[28rem] md:max-h-[32rem] lg:max-h-[min(36rem,65vh)] xl:max-h-[min(40rem,70vh)]"
            sizes="(max-width: 768px) 100vw, (max-width: 1280px) 92vw, min(80rem, 100vw)"
          />
        </div>
        <div className={`mx-auto mt-5 max-w-7xl border-t ${filmTw.borderSubtle} px-4 pt-5 text-center lg:px-8 lg:text-left`}>
          <p className={`text-center text-sm italic ${filmTw.muted}`}>
            <span>Copyright © {new Date().getFullYear()}</span>
            <span className="ml-2 font-bold not-italic text-[#e2e8f0] sm:ml-3">R&amp;B Productions</span>
            <span> — All Rights Reserved</span>
          </p>
        </div>
        <div className={`mx-auto mt-6 max-w-7xl border-t ${filmTw.borderSubtle} px-4 pt-6 text-center text-xs leading-relaxed ${filmTw.muted} lg:px-8`}>
          <GiventaCreditLines variant="rbDark" />
        </div>
      </footer>
    </div>
  );
}
