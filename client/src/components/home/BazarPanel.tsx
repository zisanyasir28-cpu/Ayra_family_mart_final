import { CategoryStrip }   from './CategoryStrip';
import { FeatureBanners }  from './FeatureBanners';

// ─── BazarPanel ───────────────────────────────────────────────────────────────
// Single glass-shell container that wraps the Shop-By-Category grid + the three
// large feature banners. Pearl-shimmer outer ring, glass shine, ambient orbs.

export function BazarPanel() {
  return (
    <section className="bg-bg py-10 sm:py-14">
      <div className="container">

        {/* ── Outer pearl-shimmer ring ──────────────────────────────────── */}
        <div
          className="relative p-[1.5px] rounded-2xl bg-gradient-to-br from-white/40 via-saffron/22 to-plum/15"
          style={{ boxShadow: '0 30px 90px -32px hsl(var(--saffron) / 0.32), 0 12px 36px -16px hsl(var(--plum) / 0.28)' }}
        >
          {/* ── Inner glass shell ───────────────────────────────────────── */}
          <div className="relative overflow-hidden rounded-[calc(1rem-1.5px)] bg-gradient-to-br from-surface/85 via-bg/75 to-surface/85 p-4 backdrop-blur-md sm:p-6 lg:p-8">

            {/* Ambient glow orbs */}
            <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
              <div className="absolute -left-40 -top-32 h-[420px] w-[420px] rounded-full bg-saffron/9 blur-3xl" />
              <div className="absolute -right-40 -top-24 h-[380px] w-[380px] rounded-full bg-plum/9 blur-3xl" />
              <div className="absolute left-1/2 bottom-0 h-[320px] w-[320px] -translate-x-1/2 translate-y-1/3 rounded-full bg-coral/7 blur-3xl" />
              <div className="absolute left-1/4 top-1/2 h-[220px] w-[220px] -translate-y-1/2 rounded-full bg-sage/6 blur-3xl" />
            </div>

            {/* Glass shine diagonal */}
            <div
              aria-hidden
              className="pointer-events-none absolute inset-0 bg-[linear-gradient(135deg,hsl(0_0%_100%/0.10)_0%,transparent_38%)]"
            />

            {/* Decorative sparkle dots scattered */}
            <div aria-hidden className="pointer-events-none absolute right-12 top-6  h-1   w-1   rounded-full bg-white/60 shadow-[0_0_8px_2px_rgba(255,255,255,0.5)]" />
            <div aria-hidden className="pointer-events-none absolute left-16  top-12 h-1.5 w-1.5 rounded-full bg-saffron/70 shadow-[0_0_10px_2px_hsl(var(--saffron)/0.55)]" />
            <div aria-hidden className="pointer-events-none absolute right-24 bottom-10 h-1 w-1 rounded-full bg-plum/70 shadow-[0_0_8px_2px_hsl(var(--plum)/0.5)]" />
            <div aria-hidden className="pointer-events-none absolute left-1/2 bottom-6 h-1 w-1 rounded-full bg-white/50 shadow-[0_0_6px_1px_rgba(255,255,255,0.4)]" />

            {/* Content */}
            <div className="relative">
              <CategoryStrip />

              <div className="mt-7 sm:mt-9 lg:mt-10">
                <FeatureBanners />
              </div>
            </div>

          </div>
        </div>

      </div>
    </section>
  );
}
