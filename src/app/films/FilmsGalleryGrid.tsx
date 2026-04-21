'use client';

import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import Image from 'next/image';
import type { FilmsGalleryImage } from '@/data/filmsGalleryImages';

type Props = {
  items: FilmsGalleryImage[];
};

/** Matches requested lightbox dim: `background-color: rgba(0, 0, 0, .8)` */
const LIGHTBOX_DIM_BG = 'rgba(0, 0, 0, 0.8)';

export default function FilmsGalleryGrid({ items }: Props) {
  const cardRefs = useRef<Array<HTMLElement | null>>([]);
  const lightboxRef = useRef<HTMLDivElement>(null);
  const [openIndex, setOpenIndex] = useState<number | null>(null);
  const [zoomed, setZoomed] = useState(false);

  const open = useCallback((i: number) => {
    setOpenIndex(i);
    setZoomed(false);
  }, []);

  const close = useCallback(() => {
    setOpenIndex(null);
    setZoomed(false);
  }, []);

  const goPrev = useCallback(() => {
    setOpenIndex((idx) => {
      if (idx === null) return idx;
      return idx <= 0 ? items.length - 1 : idx - 1;
    });
  }, [items.length]);

  const goNext = useCallback(() => {
    setOpenIndex((idx) => {
      if (idx === null) return idx;
      return idx >= items.length - 1 ? 0 : idx + 1;
    });
  }, [items.length]);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -8% 0px' }
    );

    cardRefs.current.forEach((card) => {
      if (card) observer.observe(card);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (openIndex === null) return;

    const html = document.documentElement;
    const body = document.body;
    const prevHtmlBg = html.style.backgroundColor;
    const prevBodyBg = body.style.backgroundColor;
    const prevOverflow = body.style.overflow;

    html.style.backgroundColor = LIGHTBOX_DIM_BG;
    body.style.backgroundColor = LIGHTBOX_DIM_BG;
    body.style.overflow = 'hidden';

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      if (e.key === 'ArrowLeft') goPrev();
      if (e.key === 'ArrowRight') goNext();
    };
    document.addEventListener('keydown', onKey);

    return () => {
      document.removeEventListener('keydown', onKey);
      html.style.backgroundColor = prevHtmlBg;
      body.style.backgroundColor = prevBodyBg;
      body.style.overflow = prevOverflow;
    };
  }, [openIndex, close, goPrev, goNext]);

  const handleFullscreen = () => {
    const el = lightboxRef.current;
    if (!el) return;
    if (!document.fullscreenElement) {
      void el.requestFullscreen?.().catch(() => {});
    } else {
      void document.exitFullscreen?.().catch(() => {});
    }
  };

  const handleShare = async () => {
    const url = typeof window !== 'undefined' ? window.location.href : '';
    try {
      if (navigator.share) {
        await navigator.share({ title: 'R&B Productions — Films', url });
      } else {
        await navigator.clipboard.writeText(url);
      }
    } catch {
      try {
        await navigator.clipboard.writeText(url);
      } catch {
        /* ignore */
      }
    }
  };

  const current = openIndex !== null ? items[openIndex] : null;

  return (
    <>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item, i) => (
          <figure
            key={item.src}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            role="button"
            tabIndex={0}
            className="film-card group cursor-pointer overflow-hidden rounded-xl border border-[#333333] bg-[#1e1e1e] shadow-[0_8px_24px_rgba(0,0,0,0.35)]"
            style={{ transitionDelay: `${Math.min(i * 60, 360)}ms` }}
            onClick={() => open(i)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                open(i);
              }
            }}
          >
            <div className="relative aspect-[3/2] w-full overflow-hidden">
              <Image
                src={item.src}
                alt={item.alt}
                width={1536}
                height={1025}
                className="h-full w-full object-cover object-top transition duration-500 ease-out group-hover:scale-[1.02]"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                loading={i < 6 ? 'eager' : 'lazy'}
                priority={i < 3}
              />
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent opacity-0 transition duration-500 group-hover:opacity-100" />
            </div>
          </figure>
        ))}

        <style jsx>{`
          .film-card {
            opacity: 0;
            transform: translateY(28px) scale(0.985);
            transition:
              opacity 700ms ease,
              transform 200ms ease,
              box-shadow 200ms ease;
            will-change: transform, opacity;
          }
          .film-card.is-visible {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
          .film-card.is-visible:hover {
            transform: translateY(-2px) scale(1);
            box-shadow:
              0 12px 28px -12px rgba(0, 0, 0, 0.55),
              0 0 0 1px rgba(225, 29, 72, 0.2);
          }
        `}</style>
      </div>

      {current && openIndex !== null && (
        <div
          ref={lightboxRef}
          className="fixed inset-0 z-[100]"
          role="dialog"
          aria-modal="true"
          aria-label="Gallery image viewer"
        >
          <button
            type="button"
            className="absolute inset-0"
            style={{ backgroundColor: LIGHTBOX_DIM_BG }}
            aria-label="Close gallery"
            onClick={close}
          />
          <div className="relative z-10 flex h-full min-h-0 flex-col pointer-events-none">
          <div className="pointer-events-auto flex w-full shrink-0 items-start justify-between gap-4 bg-black px-4 py-3 sm:px-6 sm:py-3.5">
            <p className="text-sm font-medium tabular-nums text-white">
              {openIndex + 1} / {items.length}
            </p>
            <div className="flex items-center gap-1 sm:gap-2">
              <IconButton
                title="Fullscreen"
                aria-label="Fullscreen"
                onClick={(e) => {
                  e.stopPropagation();
                  handleFullscreen();
                }}
              >
                <IconFullscreen />
              </IconButton>
              <IconButton
                title={zoomed ? 'Zoom out' : 'Zoom in'}
                aria-label={zoomed ? 'Zoom out' : 'Zoom in'}
                onClick={(e) => {
                  e.stopPropagation();
                  setZoomed((z) => !z);
                }}
              >
                <IconZoom />
              </IconButton>
              <IconButton
                title="Share"
                aria-label="Share"
                onClick={(e) => {
                  e.stopPropagation();
                  void handleShare();
                }}
              >
                <IconShare />
              </IconButton>
              <IconButton
                title="Close"
                aria-label="Close"
                onClick={(e) => {
                  e.stopPropagation();
                  close();
                }}
              >
                <IconClose />
              </IconButton>
            </div>
          </div>

          <div className="relative flex min-h-0 flex-1 items-center justify-center px-14 py-4 sm:px-20">
            <button
              type="button"
              className="pointer-events-auto absolute left-2 top-1/2 z-[1] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white shadow-sm ring-1 ring-white/10 transition hover:bg-black/55 sm:left-4 sm:h-14 sm:w-14"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
              title="Previous image"
              aria-label="Previous image"
            >
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            <button
              type="button"
              className="pointer-events-auto absolute right-2 top-1/2 z-[1] flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-black/45 text-white shadow-sm ring-1 ring-white/10 transition hover:bg-black/55 sm:right-4 sm:h-14 sm:w-14"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
              title="Next image"
              aria-label="Next image"
            >
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.75} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <div
              className="pointer-events-auto relative flex max-h-[min(78vh,900px)] max-w-[min(92vw,1400px)] items-center justify-center"
              onClick={(e) => e.stopPropagation()}
            >
              <Image
                src={current.src}
                alt={current.alt}
                width={1536}
                height={1025}
                className={`max-h-[min(78vh,900px)] w-auto max-w-full object-contain transition-transform duration-300 ${
                  zoomed ? 'scale-[1.35] cursor-zoom-out' : 'cursor-zoom-in'
                }`}
                sizes="(max-width: 1400px) 92vw, 1400px"
                priority
                onClick={() => setZoomed((z) => !z)}
              />
            </div>
          </div>
          </div>
        </div>
      )}
    </>
  );
}

function IconButton({
  children,
  title,
  'aria-label': ariaLabel,
  onClick,
}: {
  children: ReactNode;
  title: string;
  'aria-label': string;
  onClick: (e: React.MouseEvent) => void;
}) {
  return (
    <button
      type="button"
      title={title}
      aria-label={ariaLabel}
      onClick={onClick}
      className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg text-white transition hover:bg-white/10"
    >
      {children}
    </button>
  );
}

function IconFullscreen() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
    </svg>
  );
}

function IconZoom() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
    </svg>
  );
}

function IconShare() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
    </svg>
  );
}
