import CircleHome6Page from '@/components/circle-home-6/CircleHome6Page';

/**
 * Home route: static Haru Circle “Home 6” mirror (Tailwind), based on
 * `primary_theme/demo.harutheme.com/circle/home-6/index.html`.
 * No backend / proxy calls — demo images load from demo.harutheme.com CDN.
 *
 * Previous FC United static home: `/fc-united` (see `src/app/fc-united/page.tsx`).
 *
 * Older dynamic featured-events home is kept in:
 * - `src/app/HomePageClient.tsx`
 * - `src/lib/homepage/fetchFeaturedEventsServer.ts`
 */
export default function HomePage() {
  return <CircleHome6Page />;
}
