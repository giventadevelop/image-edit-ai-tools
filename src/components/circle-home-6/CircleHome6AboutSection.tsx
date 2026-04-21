import Link from 'next/link';
import { filmTw } from './filmDesignTokens';
import { filmNunito, filmPlayfair } from './filmFonts';

/**
 * Shared About copy for R&B Productions — used on home (#about) and /about.
 */
export default function CircleHome6AboutSection({ compact = true }: { compact?: boolean }) {
  return (
    <section
      id="about"
      className={`scroll-mt-24 border-t ${filmTw.borderSubtle} bg-gradient-to-b from-[#1e1e1e] to-[#161616] py-16 md:py-20 ${filmNunito.className} ${filmNunito.variable} ${filmPlayfair.variable}`}
    >
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <h2 className={`${filmPlayfair.className} mb-4 text-4xl font-bold leading-tight text-white sm:text-5xl md:text-[2.75rem]`}>
          About R&amp;B Productions
        </h2>
        <p className={`max-w-3xl text-xl font-semibold leading-snug sm:text-2xl md:text-[1.65rem] ${filmTw.accent}`}>
          Digital entertainment with soulful stories — from Kerala to the world.
        </p>
        <p className="mt-8 max-w-4xl text-base leading-relaxed text-white/80 sm:text-lg md:text-xl md:leading-relaxed">
          <span className="font-semibold text-white/90">&ldquo;An initiative by Roy and Bindu&rdquo;</span> is a solid and professional choice, as it
          clearly highlights the personal involvement of the owners. For a film production company in the Malayalam industry, where family-run or
          partnership-based houses are common, this tagline adds a touch of authenticity.
        </p>
        {compact ? (
          <div className="mt-10">
            <Link
              href="/about"
              className={`inline-flex items-center justify-center rounded-full border border-white/35 px-6 py-2.5 text-sm font-semibold text-white/90 transition hover:bg-white/[0.06] ${filmTw.accentHover}`}
            >
              Read More
            </Link>
          </div>
        ) : (
          <>
            <div className="mt-10 max-w-4xl space-y-6 text-base leading-relaxed text-white/85 sm:text-lg md:text-xl md:leading-relaxed">
              <p>
                <strong className="text-white">R&amp;B Productions</strong> is a digital entertainment company owned by{' '}
                <strong className="text-white">Roy and Bindu</strong>. Roy and Bindu are based in{' '}
                <strong className="text-white">Brisbane, Australia</strong>. The company is headquartered in{' '}
                <strong className="text-white">Brisbane</strong>, <strong className="text-white">funding and producing Malayalam films</strong> while
                building promotions, digital content, and distribution that reach audiences globally.
              </p>
              <p>
                We partner with acclaimed Malayalam talent: directors <strong className="text-white">Dileesh Pothan</strong> and{' '}
                <strong className="text-white">Nadirshah</strong>, actor <strong className="text-white">Fahadh Faasil</strong>, and scenarist{' '}
                <strong className="text-white">Syam Pushkaran</strong>. Our work spans{' '}
                <strong className="text-white">movie production</strong>, <strong className="text-white">movie promotions</strong>,{' '}
                <strong className="text-white">digital content creation</strong>, and <strong className="text-white">distribution</strong>.
              </p>
              <p className="text-white/80">
                We create soulful content that explores local flavours and serves it to audiences all around the globe — combining cinematic craft with a
                modern digital footprint.
              </p>
            </div>
            <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              <div className={`rounded-xl border ${filmTw.borderSubtle} bg-[#232323]/90 p-7 shadow-[0_8px_24px_rgba(0,0,0,0.35)] sm:p-8`}>
                <h3 className={`mb-3 text-base font-bold uppercase tracking-wider sm:text-lg ${filmTw.accent}`}>Where we are</h3>
                <p className="text-base leading-relaxed text-white/85 sm:text-lg md:text-xl">
                  Brisbane, Australia — home base for Roy, Bindu, and R&amp;B Productions.
                </p>
              </div>
              <div className={`rounded-xl border ${filmTw.borderSubtle} bg-[#232323]/90 p-7 shadow-[0_8px_24px_rgba(0,0,0,0.35)] sm:p-8`}>
                <h3 className={`mb-3 text-base font-bold uppercase tracking-wider sm:text-lg ${filmTw.accent}`}>Focus</h3>
                <p className="text-base leading-relaxed text-white/85 sm:text-lg md:text-xl">
                  Malayalam cinema — funding and producing films — plus digital storytelling and promotions.
                </p>
              </div>
              <div className={`rounded-xl border ${filmTw.borderSubtle} bg-[#232323]/90 p-7 shadow-[0_8px_24px_rgba(0,0,0,0.35)] sm:col-span-2 sm:p-8 lg:col-span-1`}>
                <h3 className={`mb-3 text-base font-bold uppercase tracking-wider sm:text-lg ${filmTw.accent}`}>Partners</h3>
                <p className="text-base leading-relaxed text-white/85 sm:text-lg md:text-xl">
                  Dileesh Pothan · Nadirshah · Fahadh Faasil · Syam Pushkaran
                </p>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  );
}
