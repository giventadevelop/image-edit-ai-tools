'use client';

import Image from 'next/image';
import { useMemo, useState } from 'react';
import { filmTw } from './filmDesignTokens';
import { BRISBANE_INAUGURATION_MP4 } from './rbHeroMedia';

export type TrailerItem = { img: string; title: string; cats: string };

export default function CircleHome6TrailersClient({
  trailers,
  playfairClassName,
}: {
  trailers: TrailerItem[];
  playfairClassName: string;
}) {
  const [trailerIdx, setTrailerIdx] = useState(0);
  const active = useMemo(() => trailers[trailerIdx] ?? trailers[0], [trailerIdx, trailers]);

  return (
    <div className={`overflow-hidden rounded-xl border ${filmTw.borderSubtle} bg-black/40 shadow-[0_8px_24px_rgba(0,0,0,0.35)] backdrop-blur-sm`}>
      <div className="relative aspect-[1170/570] w-full max-h-[70vh]">
        <video
          className="absolute inset-0 h-full w-full object-cover"
          src={BRISBANE_INAUGURATION_MP4}
          controls
          playsInline
          preload="metadata"
          poster={active.img}
        >
          Your browser does not support the video tag.
        </video>
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
        <div className="pointer-events-none absolute bottom-0 left-0 right-0 p-6">
          <h3 className={`text-xl font-bold text-white ${playfairClassName}`}>{active.title}</h3>
          <p className="text-sm text-white/70">{active.cats}</p>
        </div>
      </div>
      <div className="flex gap-3 overflow-x-auto p-4">
        {trailers.map((t, i) => (
          <button
            key={t.title}
            type="button"
            onClick={() => setTrailerIdx(i)}
            className={`flex w-32 flex-shrink-0 flex-col gap-2 rounded-lg border-2 p-1 text-left transition ${
              i === trailerIdx ? 'border-[#E11D48] bg-white/5' : 'border-transparent hover:border-white/25'
            }`}
          >
            <div className="relative aspect-video w-full overflow-hidden rounded">
              <Image src={t.img} alt="" fill className="object-cover" sizes="128px" />
            </div>
            <span className="truncate px-1 text-xs font-medium text-white/90">{t.title}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
