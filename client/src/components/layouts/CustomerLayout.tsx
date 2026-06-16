import { useState, useEffect, useRef } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'motion/react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import {
  Heart, User, Menu, X, ChevronDown,
  Home, LayoutGrid, Package, LogOut, Settings, Zap,
  MapPin, Phone, Mail as MailIcon, Bell, ShoppingBag, Info, Search as SearchLucide,
  Leaf,
} from 'lucide-react';
import { Logo }            from '../common/Logo';
import { CartDrawer }      from '../CartDrawer';
import { CustomerSidebar } from './CustomerSidebar';
import { TopLoadingBar }   from '../ui/TopLoadingBar';
import { CursorFollower }  from '../common/CursorFollower';
import { SearchIcon, BasketIcon, ArrowRightIcon } from '../common/HandIcon';
import { cn, formatPaisa } from '../../lib/utils';
import { thumb }           from '../../lib/cloudinary';
import { sanitizeText }    from '../../lib/sanitize';
import { ThemeToggle }     from '../common/ThemeToggle';
import { useCartStore }    from '../../store/cartStore';
import { useAuthStore }    from '../../store/authStore';
import { fetchCategories } from '../../services/categories';
import { fetchAutocomplete, type AutocompleteHit } from '../../services/products';
import {
  fetchUnreadCount,
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
} from '../../services/notifications';
import type { ApiCategory, ApiNotification } from '../../types/api';

// ─── Category emoji helper ────────────────────────────────────────────────────

function getCategoryEmoji(slug: string): string {
  const map: Record<string, string> = {
    fruits: '🥭', vegetables: '🥬', dairy: '🥛', meat: '🥩',
    fish: '🐟', bakery: '🥐', beverages: '☕', snacks: '🍿',
    grocery: '🛒', cleaning: '🧹', personal: '🧴', electronics: '📱',
    clothing: '👕', household: '🏠', baby: '🧸', health: '💊',
  };
  for (const [key, emoji] of Object.entries(map)) {
    if (slug.includes(key)) return emoji;
  }
  return '📦';
}

// ─── Floating leaf background decorations ────────────────────────────────────

function FloatingLeaves() {
  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden select-none"
    >
      {/* ── MONSTERA LEAF — large, left edge, animated sway ──────────────── */}
      <div
        className="absolute -left-16 top-20 h-[280px] w-[240px] text-sage opacity-[0.10]"
        style={{ animation: 'leaf-sway 9s ease-in-out infinite', animationDelay: '0s', willChange: 'transform' }}
      >
        <svg viewBox="0 0 200 230" fill="none" stroke="currentColor" strokeWidth="1" xmlns="http://www.w3.org/2000/svg">
          <path d="M100 225 C70 195,20 165,15 115 C10 65,50 30,80 18 C95 12,105 12,120 18 C150 30,190 65,185 115 C180 165,130 195,100 225Z"
            fill="currentColor" fillOpacity="0.1" />
          {/* Monstera characteristic holes */}
          <path d="M64 84 C72 66,92 66,92 84 C92 102,72 102,64 84Z" fill="hsl(var(--bg))" stroke="none" />
          <path d="M110 70 C118 52,140 54,140 72 C140 90,118 90,110 70Z" fill="hsl(var(--bg))" stroke="none" />
          <path d="M40 132 C44 116,64 116,64 132 C64 148,44 148,40 132Z" fill="hsl(var(--bg))" stroke="none" />
          {/* Veins */}
          <line x1="100" y1="225" x2="100" y2="18" strokeDasharray="4 5" opacity="0.4" />
          <path d="M100 100 Q130 80 155 88" opacity="0.35" />
          <path d="M100 120 Q68 100 44 108" opacity="0.35" />
          <path d="M100 148 Q136 128 160 136" opacity="0.28" />
          <path d="M100 168 Q62 148 38 156" opacity="0.28" />
        </svg>
      </div>

      {/* ── PALM FROND — right edge, animated sway ───────────────────────── */}
      <div
        className="absolute -right-10 top-36 h-[240px] w-[210px] text-sage opacity-[0.085]"
        style={{ animation: 'leaf-sway 12s ease-in-out infinite', animationDelay: '2.4s', willChange: 'transform' }}
      >
        <svg viewBox="0 0 180 210" fill="none" stroke="currentColor" strokeWidth="0.9" xmlns="http://www.w3.org/2000/svg">
          <path d="M90 200 C90 165,96 122,102 82 S110 42,112 12" strokeWidth="1.5" opacity="0.5" />
          <path d="M98 155 C80 136,54 130,38 142" /><path d="M100 134 C78 112,50 106,32 118" />
          <path d="M102 113 C82 88,54 82,34 90"  /><path d="M104 92 C86 66,60 60,40 68"  />
          <path d="M106 72 C92 46,68 38,50 44"  /><path d="M108 52 C96 28,74 22,58 28"  />
          <path d="M100 155 C118 136,144 130,160 142" /><path d="M102 134 C124 112,152 106,170 118" />
          <path d="M104 113 C126 88,154 82,172 90"  /><path d="M106 92 C128 66,154 60,172 68"  />
          <path d="M108 72 C128 46,152 38,168 44"  /><path d="M110 52 C130 28,154 22,168 28"  />
        </svg>
      </div>

      {/* ── SMALL BOTANICAL LEAVES — mid-page ───────────────────────────── */}
      <div
        className="absolute -left-4 top-[52%] h-[105px] w-[105px] text-sage opacity-[0.085]"
        style={{ animation: 'leaf-sway 7s ease-in-out infinite', animationDelay: '1.4s', willChange: 'transform' }}
      >
        <svg viewBox="0 0 100 105" fill="none" stroke="currentColor" strokeWidth="1" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 100 C34 82,6 62,8 36 C10 12,36 4,50 3 C64 4,90 12,92 36 C94 62,66 82,50 100Z" fill="currentColor" fillOpacity="0.08" />
          <line x1="50" y1="100" x2="50" y2="4" strokeDasharray="3 4" opacity="0.5" />
          <path d="M50 40 Q65 30 76 36" opacity="0.4" /><path d="M50 56 Q35 46 24 52" opacity="0.4" />
          <path d="M50 72 Q67 62 78 68" opacity="0.32" />
        </svg>
      </div>
      <div
        className="absolute right-6 top-[65%] h-[85px] w-[85px] text-sage opacity-[0.07]"
        style={{ animation: 'leaf-sway 10s ease-in-out infinite', animationDelay: '3.2s', willChange: 'transform' }}
      >
        <svg viewBox="0 0 100 105" fill="none" stroke="currentColor" strokeWidth="1" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 100 C34 82,6 62,8 36 C10 12,36 4,50 3 C64 4,90 12,92 36 C94 62,66 82,50 100Z" />
          <line x1="50" y1="100" x2="50" y2="4" strokeDasharray="3 4" opacity="0.5" />
        </svg>
      </div>
      <div
        className="absolute -right-14 bottom-28 h-[165px] w-[165px] text-sage opacity-[0.09]"
        style={{ animation: 'leaf-sway 13s ease-in-out infinite', animationDelay: '0.9s', willChange: 'transform' }}
      >
        <svg viewBox="0 0 100 105" fill="none" stroke="currentColor" strokeWidth="1" xmlns="http://www.w3.org/2000/svg">
          <path d="M50 100 C34 82,6 62,8 36 C10 12,36 4,50 3 C64 4,90 12,92 36 C94 62,66 82,50 100Z" fill="currentColor" fillOpacity="0.08" />
          <line x1="50" y1="100" x2="50" y2="4" strokeDasharray="3 4" opacity="0.5" />
          <path d="M50 40 Q65 30 76 36" opacity="0.4" /><path d="M50 56 Q35 46 24 52" opacity="0.4" />
          <path d="M50 72 Q67 62 78 68" opacity="0.32" /><path d="M50 86 Q33 76 22 82" opacity="0.28" />
        </svg>
      </div>

      {/* ── WHEAT STALK — harvest/grain motif, mid-left ──────────────────── */}
      <div className="absolute left-[5%] top-[56%] h-56 w-16 text-sage opacity-[0.08] rotate-[6deg]">
        <svg viewBox="0 0 60 220" fill="none" stroke="currentColor" strokeWidth="0.9" xmlns="http://www.w3.org/2000/svg">
          <line x1="30" y1="215" x2="30" y2="12" strokeWidth="1.4" />
          <path d="M30 165 C18 157,8 148,14 140 C20 132,30 165,30 165Z" />
          <path d="M30 165 C42 157,52 148,46 140 C40 132,30 165,30 165Z" />
          <path d="M30 145 C18 137,8 128,14 120 C20 112,30 145,30 145Z" />
          <path d="M30 145 C42 137,52 128,46 120 C40 112,30 145,30 145Z" />
          <path d="M30 125 C18 117,8 108,14 100 C20 92,30 125,30 125Z" />
          <path d="M30 125 C42 117,52 108,46 100 C40 92,30 125,30 125Z" />
          <path d="M30 105 C18 97,8 88,14 80 C20 72,30 105,30 105Z" />
          <path d="M30 105 C42 97,52 88,46 80 C40 72,30 105,30 105Z" />
          <path d="M30 85 C18 77,8 68,14 60 C20 52,30 85,30 85Z" />
          <path d="M30 85 C42 77,52 68,46 60 C40 52,30 85,30 85Z" />
          <path d="M30 65 C18 57,8 48,14 40 C20 32,30 65,30 65Z" />
          <path d="M30 65 C42 57,52 48,46 40 C40 32,30 65,30 65Z" />
          <path d="M30 40 C24 26,22 16,26 8 C30 2,30 40,30 40Z" />
          <path d="M30 40 C36 26,38 16,34 8 C30 2,30 40,30 40Z" />
        </svg>
      </div>

      {/* ── SHOPPING CART WATERMARK — right side, superstore motif ──────── */}
      <div className="absolute right-[4%] top-[38%] h-32 w-32 text-coral opacity-[0.07]">
        <svg viewBox="0 0 100 100" fill="none" stroke="currentColor" strokeWidth="1.2" xmlns="http://www.w3.org/2000/svg">
          <path d="M6 16 L18 16 L28 62 L78 62 L90 28 L26 28" strokeLinecap="round" strokeLinejoin="round" />
          <line x1="30" y1="36" x2="78" y2="36" opacity="0.6" />
          <line x1="32" y1="44" x2="76" y2="44" opacity="0.6" />
          <line x1="34" y1="52" x2="74" y2="52" opacity="0.6" />
          <line x1="46" y1="28" x2="49" y2="62" opacity="0.5" />
          <line x1="62" y1="28" x2="64" y2="62" opacity="0.5" />
          <circle cx="36" cy="72" r="6" /><circle cx="70" cy="72" r="6" />
          <circle cx="36" cy="72" r="2.2" fill="currentColor" opacity="0.5" />
          <circle cx="70" cy="72" r="2.2" fill="currentColor" opacity="0.5" />
          <path d="M36 28 C36 22,42 20,42 28" opacity="0.45" />
          <path d="M56 28 C56 21,64 19,64 28" opacity="0.45" />
        </svg>
      </div>

      {/* ── ORGANIC BADGE WATERMARK — lower-left ─────────────────────────── */}
      <div className="absolute left-[2%] top-[80%] h-40 w-40 text-sage opacity-[0.075] -rotate-[10deg]">
        <svg viewBox="0 0 140 140" fill="none" stroke="currentColor" strokeWidth="1" xmlns="http://www.w3.org/2000/svg">
          <circle cx="70" cy="70" r="62" strokeDasharray="3 5" />
          <circle cx="70" cy="70" r="54" />
          <path d="M70 90 C57 76,42 60,46 42 C50 26,67 20,70 18 C73 20,90 26,94 42 C98 60,83 76,70 90Z"
            fill="currentColor" fillOpacity="0.12" />
          <line x1="70" y1="90" x2="70" y2="20" strokeDasharray="2 4" opacity="0.6" />
          <path d="M70 52 Q81 42,88 47" opacity="0.5" /><path d="M70 64 Q59 54,52 59" opacity="0.5" />
          {[0,30,60,90,120,150,180,210,240,270,300,330].map((deg) => (
            <circle
              key={deg}
              cx={70 + 46 * Math.cos((deg - 90) * Math.PI / 180)}
              cy={70 + 46 * Math.sin((deg - 90) * Math.PI / 180)}
              r="1.2" fill="currentColor" opacity="0.65"
            />
          ))}
        </svg>
      </div>

      {/* ── ORGANIC MANDALA RING — mid-page ──────────────────────────────── */}
      <div className="absolute left-[4%] top-[40%] h-48 w-48 text-sage opacity-[0.07]">
        <svg viewBox="0 0 160 160" fill="none" stroke="currentColor" strokeWidth="0.8" xmlns="http://www.w3.org/2000/svg">
          <circle cx="80" cy="80" r="70" strokeDasharray="4 7" />
          <circle cx="80" cy="80" r="52" strokeDasharray="2 9" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map((deg) => (
            <path key={deg} transform={`rotate(${deg} 80 80)`} d="M80 10 C85 25 85 40 80 50 C75 40 75 25 80 10Z" />
          ))}
        </svg>
      </div>

      {/* ── BOTANICAL CLUSTER — lower-right ──────────────────────────────── */}
      <div className="absolute right-[3%] top-[72%] h-36 w-36 rotate-[20deg] text-plum opacity-[0.075]">
        <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="1" xmlns="http://www.w3.org/2000/svg">
          <path d="M60 105 C60 105 18 72 23 34 C28 8 60 4 60 4 C60 4 92 8 97 34 C102 72 60 105 60 105Z" />
          <path d="M60 105 C60 105 8 82 16 44 C23 16 54 14 60 4 C66 14 97 16 104 44 C112 82 60 105 60 105Z" opacity="0.45" />
          <line x1="60" y1="105" x2="60" y2="6" strokeDasharray="3 5" />
          <path d="M60 42 Q76 32 87 38" /><path d="M60 54 Q44 44 33 50" /><path d="M60 66 Q79 56 90 62" />
        </svg>
      </div>

      {/* ══ LIGHT-MODE ARTISTIC SCENE ═══════════════════════════════════════
          Controlled by .light-scene CSS toggle in globals.css:
            opacity:0 (dark)  →  opacity:1 (light, 0.65s ease fade-in)
          No JS hook needed — pure CSS theme-switch.

          Palette sampled from hero-bg-light.avif (Ayra bag + produce + mountains):
            ① hsl(42/48)  — golden morning sun / warm produce glow
            ② hsl(140/158)— sage herb / fresh emerald green
            ③ hsl(200)    — mountain-mist blue / distant hills
            ④ hsl(35)     — harvest amber / warm earth
            ⑤ hsl(25)     — spiced terra / produce tones

          Elements (bottom to top in z-order):
            · Five atmospheric colour-pool orbs  — painterly depth
            · Mountain-horizon 3-layer silhouette — foot of page
            · Rice-paddy sine-wave rows          — Bengali field motif
            · Topographic contour rings (×2)     — mountain-map motif
            · Sunburst                           — upper-right corner   */}
      <div className="light-scene absolute inset-0">

        {/* ── Five atmospheric colour-pool orbs ───────────────────────────
            Large, heavily-blurred radials layered to create a living,
            painterly depth — coloured light through morning farm mist.  */}

        {/* ① Golden morning sun — upper-right corner bleed */}
        <div
          aria-hidden
          className="absolute -right-32 -top-32 h-[560px] w-[560px] rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(42 92% 80% / 0.44) 0%, hsl(48 86% 88% / 0.18) 50%, transparent 72%)',
            filter: 'blur(72px)',
          }}
        />
        {/* ② Sage herb pool — left-mid edge */}
        <div
          aria-hidden
          className="absolute -left-36 top-[30%] h-[480px] w-[480px] rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(140 55% 76% / 0.36) 0%, hsl(158 58% 84% / 0.14) 52%, transparent 72%)',
            filter: 'blur(82px)',
          }}
        />
        {/* ③ Mountain-mist blue — top-centre horizon */}
        <div
          aria-hidden
          className="absolute left-[20%] -top-28 h-[420px] w-[580px] rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(200 45% 85% / 0.26) 0%, transparent 65%)',
            filter: 'blur(96px)',
          }}
        />
        {/* ④ Harvest amber — lower-right corner bleed */}
        <div
          aria-hidden
          className="absolute -right-24 bottom-0 h-[430px] w-[430px] rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(35 88% 78% / 0.32) 0%, transparent 66%)',
            filter: 'blur(86px)',
          }}
        />
        {/* ⑤ Fresh emerald — lower-left corner bleed */}
        <div
          aria-hidden
          className="absolute -left-20 bottom-0 h-[370px] w-[370px] rounded-full"
          style={{
            background: 'radial-gradient(circle, hsl(158 62% 74% / 0.28) 0%, transparent 66%)',
            filter: 'blur(90px)',
          }}
        />

        {/* ── Mountain-horizon silhouette ──────────────────────────────────
            Three-layer landscape echoing the mountain backdrop in the hero.
            Distant peaks (cool blue) → rolling hills (sage green)
            → foreground field edge (emerald). A quiet horizon line
            anchoring the bottom of every page.                          */}
        <svg
          aria-hidden
          className="absolute bottom-0 left-0 w-full"
          viewBox="0 0 1400 240"
          preserveAspectRatio="xMidYMax slice"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Distant mountain range — cool blue-grey */}
          <path
            d="M0 240 L0 150 C60 138,120 112,200 134 C255 110,315 78,395 118 C450 72,515 88,588 116 C648 52,715 68,788 112 C850 58,916 74,990 108 C1055 64,1122 80,1198 122 C1252 96,1316 110,1400 122 L1400 240 Z"
            fill="hsl(205 40% 72%)"
            opacity="0.055"
          />
          {/* Mid rolling hills — sage green */}
          <path
            d="M0 240 L0 178 C100 162,220 146,360 172 C460 155,565 138,696 168 C808 150,930 142,1055 168 C1152 155,1278 148,1400 162 L1400 240 Z"
            fill="hsl(140 46% 66%)"
            opacity="0.065"
          />
          {/* Foreground field edge — fresh emerald */}
          <path
            d="M0 240 L0 210 Q170 200,340 208 Q510 196,680 206 Q855 196,1030 204 Q1200 196,1400 204 L1400 240 Z"
            fill="hsl(158 56% 60%)"
            opacity="0.058"
          />
        </svg>

        {/* ── Rice-paddy sine-wave rows — Bengali agricultural motif ───────
            Six rows of smooth C-curves spaced 18 px apart, overlapping
            the mountain silhouette in the lower viewport.
            Evokes the regimented paddy rows of Bangladesh's farmland
            when viewed from a gentle hillside — same landscape as the hero. */}
        <svg
          aria-hidden
          className="absolute bottom-[7%] left-0 w-full opacity-[0.042]"
          viewBox="0 0 1400 108"
          preserveAspectRatio="xMidYMid meet"
          xmlns="http://www.w3.org/2000/svg"
        >
          {[0, 18, 36, 54, 72, 90].map((y, i) => (
            <path
              key={i}
              d={`M0,${y} C117,${y - 6} 233,${y + 6} 350,${y} C467,${y - 6} 583,${y + 6} 700,${y} C817,${y - 6} 933,${y + 6} 1050,${y} C1167,${y - 6} 1283,${y + 6} 1400,${y}`}
              fill="none"
              stroke="hsl(140 52% 36%)"
              strokeWidth={i < 2 ? 0.7 : 0.5}
              opacity={0.9 - i * 0.1}
            />
          ))}
        </svg>

        {/* ── Topographic contour rings — cartographic mountain motif ─────
            Concentric ellipses read like a topo-map of a mountain peak.
            Two clusters placed at mid-right and lower-left for page rhythm.
            Echoes the mountain topography visible in hero-bg-light.avif. */}
        <div
          aria-hidden
          className="absolute right-[5%] top-[20%] h-[200px] w-[200px] opacity-[0.055]"
        >
          <svg viewBox="0 0 180 180" fill="none" stroke="hsl(140 50% 30%)" strokeWidth="0.85" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="90" cy="90" rx="82" ry="60" />
            <ellipse cx="90" cy="90" rx="65" ry="48" />
            <ellipse cx="90" cy="90" rx="48" ry="36" />
            <ellipse cx="90" cy="90" rx="31" ry="23" />
            <ellipse cx="90" cy="90" rx="15" ry="11" />
            <ellipse cx="90" cy="90" rx="5"  ry="4"  fill="hsl(140 50% 30%)" opacity="0.35" />
          </svg>
        </div>
        <div
          aria-hidden
          className="absolute left-[9%] top-[60%] h-[148px] w-[148px] rotate-[22deg] opacity-[0.048]"
        >
          <svg viewBox="0 0 140 140" fill="none" stroke="hsl(35 75% 36%)" strokeWidth="0.9" xmlns="http://www.w3.org/2000/svg">
            <ellipse cx="70" cy="70" rx="62" ry="44" />
            <ellipse cx="70" cy="70" rx="47" ry="33" />
            <ellipse cx="70" cy="70" rx="32" ry="22" />
            <ellipse cx="70" cy="70" rx="17" ry="12" />
            <ellipse cx="70" cy="70" rx="6"  ry="4"  fill="hsl(35 75% 36%)" opacity="0.32" />
          </svg>
        </div>

        {/* ── Sunburst — upper-right corner ────────────────────────────────
            16 rotating SVG rays + 3 concentric glow circles.
            Element bleeds off the top-right corner so only the
            lower-left quadrant shows — a rising sun cresting the horizon.
            Amber/gold palette matches morning produce market warmth.     */}
        <svg
          aria-hidden
          className="absolute -right-10 -top-10 h-[280px] w-[280px]"
          viewBox="0 0 200 200"
          xmlns="http://www.w3.org/2000/svg"
        >
          {[0,22.5,45,67.5,90,112.5,135,157.5,180,202.5,225,247.5,270,292.5,315,337.5].map((deg, i) => (
            <line
              key={i}
              x1={100} y1={i % 4 === 0 ? 44 : 50}
              x2={100} y2={i % 4 === 0 ? 20 : 28}
              stroke="hsl(42 88% 58%)"
              strokeWidth={i % 2 === 0 ? 1.8 : 1.2}
              opacity={i % 4 === 0 ? 0.42 : 0.26}
              transform={`rotate(${deg} 100 100)`}
            />
          ))}
          <circle cx={100} cy={100} r={50} fill="hsl(48 95% 78%)" opacity={0.10} />
          <circle cx={100} cy={100} r={34} fill="hsl(42 92% 72%)" opacity={0.14} />
          <circle cx={100} cy={100} r={20} fill="hsl(38 95% 65%)" opacity={0.18} />
        </svg>

      </div>
    </div>
  );
}

// ─── Announcement bar — tiny, saffron, single line ───────────────────────────

function AnnouncementBar() {
  return (
    <div className="overflow-hidden border-b border-line/40 bg-gradient-to-r from-bg via-surface/40 to-bg py-2">
      <div className="flex whitespace-nowrap text-[11px] tracking-[0.18em] animate-marquee-x-slow">
        {[0, 1].map((i) => (
          <span key={i} className="mx-4 inline-flex items-center gap-6 text-cream/60">
            <span className="flex items-center gap-2">
              <span className="h-1.5 w-1.5 rounded-full bg-saffron animate-pulse" />
              <span>FREE DELIVERY ABOVE ৳1,500</span>
            </span>
            <span className="opacity-40">/</span>
            <span className="flex items-center gap-2">
              <span>USE</span>
              <span className="rounded-md bg-coral/15 px-2 py-0.5 font-bold text-coral">WELCOME10</span>
              <span>FOR 10% OFF</span>
            </span>
            <span className="opacity-40">/</span>
            <span className="flex items-center gap-2">
              <span>EXPRESS DELIVERY IN 60 MIN</span>
            </span>
            <span className="opacity-40">/</span>
            <span className="flex items-center gap-2">
              <span className="font-bangla normal-case tracking-normal text-cream/85">তাজা পণ্য, প্রতিদিন</span>
              <span className="opacity-50">·</span>
              <span>FRESH, DAILY</span>
            </span>
            <span className="mr-4 opacity-40">/</span>
          </span>
        ))}
      </div>
    </div>
  );
}

// ─── All Categories dropdown ──────────────────────────────────────────────────

function AllCategoriesDropdown() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { data: cats = [] } = useQuery({
    queryKey: ['categories'],
    queryFn:  fetchCategories,
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div ref={ref} className="relative shrink-0">
      <button
        onClick={() => setOpen((o) => !o)}
        className="btn-grad flex items-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold transition active:scale-95"
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="hidden lg:block">All Categories</span>
        <ChevronDown
          className={cn('h-3.5 w-3.5 transition-transform duration-200', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{    opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-surface shadow-lift"
          >
            <div className="p-1.5">
              <Link
                to="/products"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-cream transition hover:bg-surface-2"
              >
                <LayoutGrid className="h-4 w-4 text-saffron" strokeWidth={1.8} />
                All Products
              </Link>
              {cats.slice(0, 12).map((cat) => (
                <Link
                  key={cat.id}
                  to={`/products?categoryId=${cat.id}`}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm text-cream transition hover:bg-surface-2"
                >
                  <span className="text-base leading-none">{getCategoryEmoji(cat.slug)}</span>
                  <span className="flex-1 truncate">{cat.name}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Location selector ────────────────────────────────────────────────────────

function LocationSelector() {
  return (
    <div className="hidden xl:flex shrink-0 cursor-pointer items-center gap-2 rounded-full border border-line/50 bg-surface/50 px-3.5 py-2 transition hover:border-saffron/40">
      <MapPin className="h-3.5 w-3.5 shrink-0 text-saffron" />
      <div className="leading-tight">
        <p className="text-[9px] uppercase tracking-[0.16em] text-cream/40">Deliver to</p>
        <p className="text-xs font-semibold text-cream">Dhaka, Bangladesh</p>
      </div>
    </div>
  );
}

// ─── Gold Member badge ────────────────────────────────────────────────────────

function GoldMemberBadge() {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) return null;
  // Membership isn't built yet — show it as an upcoming perk, not a status the
  // user already holds (that would be false). See PromoStrip "Coming soon" cards.
  return (
    <span
      className="hidden xl:flex shrink-0 items-center gap-1.5 rounded-full border border-coral/40 bg-coral/10 px-3.5 py-1.5"
      title="Membership rewards are coming soon"
    >
      <span className="text-[13px] leading-none">👑</span>
      <span className="text-[11px] font-bold text-coral">Gold · Soon</span>
    </span>
  );
}

// ─── Search bar ───────────────────────────────────────────────────────────────

function SearchBar() {
  const [query,    setQuery]    = useState('');
  const [debounced, setDebounced] = useState('');
  const [focused,  setFocused]  = useState(false);
  const navigate = useNavigate();
  const containerRef = useRef<HTMLFormElement>(null);

  // Debounce the search query for autocomplete
  useEffect(() => {
    const id = setTimeout(() => setDebounced(query.trim()), 250);
    return () => clearTimeout(id);
  }, [query]);

  const { data: hits = [] } = useQuery<AutocompleteHit[]>({
    queryKey: ['autocomplete', debounced],
    queryFn:  () => fetchAutocomplete(debounced),
    enabled:  debounced.length >= 2,
    staleTime: 30_000,
  });

  // Close dropdown on outside click
  useEffect(() => {
    function onDown(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setFocused(false);
      }
    }
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, []);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = query.trim();
    if (q) {
      setFocused(false);
      navigate(`/products?search=${encodeURIComponent(q)}`);
    }
  }

  const showDropdown = focused && debounced.length >= 2 && hits.length > 0;

  return (
    <form ref={containerRef} onSubmit={handleSubmit} className="relative flex-1">
      <div
        className={cn(
          'relative flex items-center rounded-full border bg-surface/80 pl-4 pr-1.5 transition-all duration-300',
          focused
            ? 'border-saffron ring-2 ring-saffron/30 shadow-[0_0_24px_-6px_hsl(var(--saffron)/0.45)]'
            : 'border-line hover:border-saffron/40',
        )}
      >
        <SearchIcon
          size={16}
          className={cn('shrink-0 transition-colors', focused ? 'text-saffron' : 'text-cream/45')}
        />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setFocused(true)}
          placeholder="Search products, brands and more…"
          className="w-full bg-transparent py-2.5 pl-3 pr-2 text-sm text-cream placeholder:text-cream/35 focus:outline-none"
        />
        <button
          type="submit"
          aria-label="Search"
          className={cn(
            'grid h-8 w-8 shrink-0 place-items-center rounded-full transition-all duration-200',
            query.length > 0
              ? 'bg-saffron text-bg shadow-[0_0_16px_-4px_hsl(var(--saffron)/0.7)] hover:scale-105'
              : 'bg-saffron/15 text-saffron hover:bg-saffron/25',
          )}
        >
          <SearchLucide className="h-4 w-4" strokeWidth={2.4} />
        </button>
      </div>

      {/* Autocomplete dropdown */}
      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{    opacity: 0, y: -4 }}
            transition={{ duration: 0.12 }}
            className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-2xl border border-line bg-surface shadow-lift"
          >
            <ul className="max-h-80 overflow-y-auto">
              {hits.map((hit) => (
                <li key={hit.id}>
                  <Link
                    to={`/products/${hit.slug}`}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => { setFocused(false); setQuery(''); }}
                    className="flex items-center gap-3 px-3 py-2.5 transition hover:bg-surface-2"
                  >
                    <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-surface-2">
                      {hit.imageUrl ? (
                        <img src={thumb(hit.imageUrl)} alt="" className="h-full w-full object-cover" loading="lazy" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center text-xl opacity-30">🛒</div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm text-cream">{hit.name}</p>
                      <p className="text-[11px] text-cream/55">{formatPaisa(hit.priceInPaisa)}</p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
            <button
              type="submit"
              onMouseDown={(e) => e.preventDefault()}
              className="block w-full border-t border-line bg-surface-2 py-2 text-center text-[11px] uppercase tracking-[0.15em] text-saffron hover:bg-bg/30"
            >
              See all results for "{debounced}"
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </form>
  );
}

// ─── Mobile search (icon + full-screen modal) ─────────────────────────────────

function MobileSearch() {
  const [open, setOpen] = useState(false);
  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex h-9 w-9 items-center justify-center rounded-full text-cream/70 transition hover:bg-saffron/10 hover:text-saffron md:hidden"
        aria-label="Search"
      >
        <SearchLucide className="h-5 w-5" />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{    opacity: 0 }}
            className="fixed inset-0 z-[55] flex flex-col bg-bg p-4"
          >
            <div className="flex items-center gap-2">
              <button
                onClick={() => setOpen(false)}
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full transition hover:bg-cream/5 active:scale-90"
                aria-label="Close"
              >
                <X className="h-5 w-5 text-cream" />
              </button>
              <div className="flex-1" onClick={() => setOpen(false)}>
                <SearchBar />
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Cart button ──────────────────────────────────────────────────────────────

function CartButton({ onClick }: { onClick: () => void }) {
  const { itemCount } = useCartStore();
  const count = itemCount();

  return (
    <button
      onClick={onClick}
      className="relative flex items-center gap-2 rounded-full p-2.5 text-cream transition hover:bg-saffron/10 hover:text-saffron"
      aria-label={`Cart (${count} items)`}
    >
      <BasketIcon size={20} strokeWidth={1.5} />
      <AnimatePresence>
        {count > 0 && (
          <motion.span
            key={count}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{    scale: 0, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 350, damping: 18 }}
            className="absolute -right-0.5 -top-0.5 flex h-5 w-5 items-center justify-center rounded-full bg-saffron font-display text-[10px] font-extrabold text-bg ring-2 ring-bg"
          >
            {count > 99 ? '99+' : count}
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}

// ─── Notification Bell ────────────────────────────────────────────────────────

function relativeTime(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1)  return 'just now';
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function notifIcon(type: string) {
  if (type === 'ORDER_STATUS' || type === 'ORDER_CREATED') return ShoppingBag;
  return Info;
}

function NotificationBell() {
  const { isAuthenticated } = useAuthStore();
  const [open, setOpen]     = useState(false);
  const [items, setItems]   = useState<ApiNotification[]>([]);
  const ref                 = useRef<HTMLDivElement>(null);
  const qc                  = useQueryClient();

  const { data: unreadCount = 0 } = useQuery({
    queryKey:       ['notifications', 'unread-count'],
    queryFn:        fetchUnreadCount,
    refetchInterval: 30_000,
    enabled:        isAuthenticated,
  });

  // Load notifications when dropdown opens
  useEffect(() => {
    if (!open) return;
    fetchNotifications({ limit: 10 }).then((r) => setItems(r.data));
  }, [open]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!isAuthenticated) return null;

  async function handleMarkAll() {
    await markAllNotificationsRead();
    setItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    void qc.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
  }

  async function handleMarkOne(id: string) {
    await markNotificationRead(id);
    setItems((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    void qc.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
  }

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="relative flex h-9 w-9 items-center justify-center rounded-full text-cream/70 transition hover:bg-saffron/10 hover:text-saffron"
        aria-label="Notifications"
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-coral font-display text-[9px] font-extrabold text-bg ring-2 ring-bg">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{    opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-80 overflow-hidden rounded-2xl border border-line bg-surface shadow-lift"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-line bg-surface-2 px-4 py-3">
              <span className="font-display text-sm font-bold text-cream">Notifications</span>
              {items.some((n) => !n.isRead) && (
                <button
                  onClick={handleMarkAll}
                  className="text-[11px] text-saffron hover:underline"
                >
                  Mark all read
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-80 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex flex-col items-center gap-2 py-10 text-center">
                  <Bell className="h-8 w-8 text-cream/20" />
                  <p className="text-sm text-cream/45">No notifications yet</p>
                </div>
              ) : (
                items.map((n) => {
                  const Icon = notifIcon(n.type);
                  return (
                    <button
                      key={n.id}
                      onClick={() => { void handleMarkOne(n.id); setOpen(false); }}
                      className={cn(
                        'flex w-full gap-3 px-4 py-3 text-left transition hover:bg-surface-2',
                        !n.isRead && 'bg-saffron/5',
                      )}
                    >
                      <div className={cn(
                        'mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                        n.type === 'ORDER_STATUS' || n.type === 'ORDER_CREATED'
                          ? 'bg-saffron/15 text-saffron'
                          : 'bg-cream/10 text-cream/60',
                      )}>
                        <Icon className="h-4 w-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate font-display text-xs font-semibold text-cream">
                          {sanitizeText(n.title)}
                          {!n.isRead && (
                            <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-coral align-middle" />
                          )}
                        </p>
                        <p className="line-clamp-2 text-[11px] text-cream/55">{sanitizeText(n.message)}</p>
                        <p className="mt-0.5 text-[10px] text-cream/35">{relativeTime(n.createdAt)}</p>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── User menu ────────────────────────────────────────────────────────────────

function UserMenu() {
  const { user, isAuthenticated, clearAuth } = useAuthStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  if (!isAuthenticated) {
    return (
      <Link
        to="/login"
        className="hidden items-center gap-1.5 rounded-full border border-line px-4 py-2 text-sm text-cream transition hover:border-saffron hover:text-saffron sm:inline-flex"
      >
        Sign in
      </Link>
    );
  }

  const initials = user?.name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase() ?? '?';

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-full p-1 transition hover:bg-cream/5"
      >
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-saffron font-display text-xs font-extrabold text-bg">
          {initials}
        </div>
        <ChevronDown
          className={cn('hidden h-3.5 w-3.5 text-cream/45 transition-transform duration-200 sm:block', open && 'rotate-180')}
        />
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: -8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{    opacity: 0, y: -8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 top-full z-50 mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-surface shadow-lift"
          >
            <div className="border-b border-line bg-surface-2 px-4 py-3.5">
              <p className="font-display text-sm font-bold text-cream">{user?.name}</p>
              <p className="truncate text-xs text-cream/55">{user?.email}</p>
            </div>

            <nav className="p-1.5">
              {[
                { to: '/account', icon: Settings, label: 'My Account' },
                { to: '/orders',  icon: Package,  label: 'My Orders'  },
              ].map(({ to, icon: Icon, label }) => (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm text-cream transition hover:bg-surface-2"
                >
                  <Icon className="h-4 w-4 text-cream/55" />
                  {label}
                </Link>
              ))}
              <div className="my-1.5 h-px bg-line" />
              <div className="px-3.5 py-2">
                <p className="mb-1.5 text-[10px] uppercase tracking-[0.18em] text-cream/45">Theme</p>
                <ThemeToggle compact />
              </div>
              <div className="my-1.5 h-px bg-line" />
              <button
                onClick={() => { clearAuth(); setOpen(false); }}
                className="flex w-full items-center gap-2.5 rounded-xl px-3.5 py-2.5 text-sm text-coral transition hover:bg-coral/10"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Mobile drawer ────────────────────────────────────────────────────────────

interface MobileDrawerProps {
  open:       boolean;
  onClose:    () => void;
  categories: ApiCategory[];
}

function MobileDrawer({ open, onClose, categories }: MobileDrawerProps) {
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-bg/70 backdrop-blur-sm"
          />
          <motion.aside
            initial={{ x: '-100%' }}
            animate={{ x: 0 }}
            exit={{ x: '-100%' }}
            transition={{ type: 'spring', damping: 28, stiffness: 280 }}
            className="fixed inset-y-0 left-0 z-50 flex w-[280px] max-w-[85vw] flex-col overflow-hidden bg-surface"
          >
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <Logo size="sm" />
              <button
                onClick={onClose}
                className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-cream/5 active:scale-90"
              >
                <X className="h-4 w-4 text-cream" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-4">
              <p className="mb-2 px-3 text-[10px] uppercase tracking-[0.22em] text-cream/45">
                Browse
              </p>
              <nav className="space-y-0.5">
                <Link
                  to="/products"
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-saffron transition hover:bg-saffron/10"
                >
                  <LayoutGrid className="h-4 w-4" />
                  All Products
                </Link>
                <Link
                  to="/products?deals=true"
                  onClick={onClose}
                  className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold text-coral transition hover:bg-coral/10"
                >
                  <Zap className="h-4 w-4" />
                  Flash Deals
                  <span className="ml-auto rounded-full bg-coral px-1.5 py-0.5 text-[10px] font-bold text-bg">HOT</span>
                </Link>
                {categories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/products?categoryId=${cat.id}`}
                    onClick={onClose}
                    className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-cream transition hover:bg-cream/5"
                  >
                    <span className="text-lg leading-none">{getCategoryEmoji(cat.slug)}</span>
                    <span className="flex-1">{cat.name}</span>
                    <span className="text-[11px] text-cream/45">{cat._count.products}</span>
                  </Link>
                ))}
              </nav>
            </div>

            <div className="border-t border-line px-5 py-4 text-xs text-cream/55">
              <span>+880 1700-000000</span>
              <br />
              <span>hello@ayrafamilymart.com.bd</span>
            </div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}

// ─── Secondary nav ────────────────────────────────────────────────────────────

function CategoryNav({ categories }: { categories: ApiCategory[] }) {
  return (
    <div className="border-y border-line/50 bg-bg/85 backdrop-blur-xl">
      <div className="container flex items-center gap-1 overflow-x-auto scrollbar-hide py-2">
        <NavLink
          to="/products"
          end
          className={({ isActive }) =>
            cn(
              'group relative shrink-0 px-3 py-1 text-sm transition-colors',
              isActive ? 'text-saffron' : 'text-cream/65 hover:text-saffron',
            )
          }
        >
          {({ isActive }) => (
            <>
              All
              {isActive && (
                <motion.span
                  layoutId="cat-underline"
                  className="absolute -bottom-0.5 left-3 right-3 h-[3px] rounded-full bg-saffron shadow-[0_0_8px_hsl(var(--saffron)/0.6)]"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                />
              )}
            </>
          )}
        </NavLink>

        <NavLink
          to="/products?deals=true"
          className="group relative flex shrink-0 items-center gap-1.5 px-3 py-1 text-sm font-semibold text-coral transition hover:text-saffron"
        >
          <Zap className="h-3.5 w-3.5" />
          <span>Deals</span>
        </NavLink>

        {categories.slice(0, 12).map((cat) => (
          <NavLink
            key={cat.id}
            to={`/products?categoryId=${cat.id}`}
            className={({ isActive }) =>
              cn(
                'group relative flex shrink-0 items-center gap-1.5 px-3 py-1 text-sm transition-colors',
                isActive ? 'text-saffron' : 'text-cream/65 hover:text-saffron',
              )
            }
          >
            {({ isActive }) => (
              <>
                <span className="text-sm leading-none">{getCategoryEmoji(cat.slug)}</span>
                <span>{cat.name}</span>
                {isActive && (
                  <motion.span
                    layoutId="cat-underline"
                    className="absolute -bottom-0.5 left-3 right-3 h-[3px] rounded-full bg-saffron shadow-[0_0_8px_hsl(var(--saffron)/0.6)]"
                    transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </div>
  );
}

// ─── Footer ───────────────────────────────────────────────────────────────────

// Inline SVG brand icons — lucide v1 dropped brand marks for trademark reasons.
function FacebookIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.99 3.657 9.128 8.438 9.879V14.89H7.898V12h2.54V9.797c0-2.506 1.492-3.89 3.776-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.563V12h2.773l-.443 2.89h-2.33v6.99C18.343 21.128 22 16.991 22 12z" />
    </svg>
  );
}
function InstagramIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round" {...props}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
    </svg>
  );
}
function YoutubeIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.546 15.568V8.432L15.818 12l-6.272 3.568z" />
    </svg>
  );
}
function TiktokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" {...props}>
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5.8 20.1a6.34 6.34 0 0 0 10.86-4.43V8.7a8.16 8.16 0 0 0 4.77 1.52V6.78a4.85 4.85 0 0 1-1.84-.09z" />
    </svg>
  );
}

function Footer() {
  const socials: { label: string; href: string; Icon: (p: React.SVGProps<SVGSVGElement>) => React.ReactElement }[] = [
    { label: 'Facebook',  href: '#', Icon: FacebookIcon  },
    { label: 'Instagram', href: '#', Icon: InstagramIcon },
    { label: 'YouTube',   href: '#', Icon: YoutubeIcon   },
    { label: 'TikTok',    href: '#', Icon: TiktokIcon    },
  ];

  return (
    <footer className="relative overflow-hidden border-t border-line/50 bg-gradient-to-b from-surface/30 via-bg to-bg">

      {/* Ambient glows */}
      <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-40 -top-16 h-[400px] w-[400px] rounded-full bg-saffron/7 blur-3xl" />
        <div className="absolute -right-32 top-1/3 h-[350px] w-[350px] rounded-full bg-plum/8 blur-3xl" />
        <div className="absolute left-1/2 bottom-0 h-[280px] w-[280px] -translate-x-1/2 rounded-full bg-coral/6 blur-3xl" />
      </div>

      <div className="container relative py-16">
        {/* Brand line */}
        <div className="border-b border-line/60 pb-10">
          <h2 className="display-xl select-none text-cream/95">
            Ayra<span className="text-saffron [text-shadow:0_0_24px_hsl(var(--saffron)/0.65)]">.</span>
          </h2>
          <p className="mt-4 max-w-2xl font-display text-base italic text-cream/55 sm:text-lg">
            A family-run Bengali marketplace, brought to your screen.
          </p>
        </div>

        {/* 4-col grid */}
        <div className="grid grid-cols-2 gap-8 pt-10 md:grid-cols-4 md:gap-10">
          {/* Col 1 — About + socials + contact */}
          <div className="col-span-2 md:col-span-1">
            <h4 className="mb-4 text-[10px] uppercase tracking-[0.22em] text-cream/40">Ayra Family Mart</h4>
            <p className="mb-5 text-sm leading-relaxed text-cream/70">
              <span className="font-bangla normal-case">তাজা পণ্য, সুন্দর জীবন</span>
              <span className="mx-1.5 text-cream/30">·</span>
              Fresh groceries delivered fast across Bangladesh.
            </p>
            <ul className="mb-6 space-y-2.5 text-xs text-cream/65">
              <li className="flex items-start gap-2.5">
                <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-saffron" />
                <span>Vasani Road, Sirajganj 6700</span>
              </li>
              <li className="flex items-center gap-2.5">
                <Phone className="h-3.5 w-3.5 shrink-0 text-saffron" />
                01710641516
              </li>
              <li className="flex items-center gap-2.5">
                <MailIcon className="h-3.5 w-3.5 shrink-0 text-saffron" />
                help@ayra-family.bd
              </li>
            </ul>
            <div className="flex gap-2">
              {socials.map(({ label, href, Icon }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="grid h-9 w-9 place-items-center rounded-full bg-surface-2/80 text-cream/70 transition hover:bg-saffron hover:text-bg hover:shadow-[0_0_16px_-2px_hsl(var(--saffron)/0.6)]"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Col 2 — Shop */}
          <div>
            <h4 className="mb-4 text-[10px] uppercase tracking-[0.22em] text-cream/40">Shop</h4>
            <ul className="space-y-3">
              {[
                { label: 'Home',          to: '/'                          },
                { label: 'All Products',  to: '/products'                  },
                { label: 'Flash Deals',   to: '/products?deals=true'       },
                { label: 'New Arrivals',  to: '/products?sortBy=newest'     },
                { label: 'Best Sellers',  to: '/products?collection=best-sellers' },
                { label: 'Wishlist',      to: '/wishlist'                  },
              ].map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className="group inline-flex items-center gap-1.5 text-sm text-cream/70 transition-colors hover:text-saffron"
                  >
                    {l.label}
                    <ArrowRightIcon size={11} className="opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3 — Help */}
          <div>
            <h4 className="mb-4 text-[10px] uppercase tracking-[0.22em] text-cream/40">Help</h4>
            <ul className="space-y-3">
              {[
                { label: 'Help Center', to: '/help' },
                { label: 'Track Order', to: '/orders' },
                { label: 'Returns',     to: '/returns' },
                { label: 'Privacy',     to: '#' },
                { label: 'Terms',       to: '#' },
                { label: 'Contact Us',  to: '/help' },
              ].map((l) => (
                <li key={l.label}>
                  {l.to === '#' ? (
                    <a
                      href="#"
                      className="group inline-flex items-center gap-1.5 text-sm text-cream/70 transition-colors hover:text-saffron"
                    >
                      {l.label}
                      <ArrowRightIcon size={11} className="opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                    </a>
                  ) : (
                    <Link
                      to={l.to}
                      className="group inline-flex items-center gap-1.5 text-sm text-cream/70 transition-colors hover:text-saffron"
                    >
                      {l.label}
                      <ArrowRightIcon size={11} className="opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
                    </Link>
                  )}
                </li>
              ))}
            </ul>
          </div>

          {/* Col 4 — Get the App */}
          <div>
            <h4 className="mb-4 text-[10px] uppercase tracking-[0.22em] text-cream/40">Get the App</h4>
            <p className="mb-4 text-sm text-cream/65">
              Shop faster · earn points · track orders.
            </p>
            <div className="flex flex-col gap-2.5">
              <a
                href="#"
                aria-label="Get it on Google Play"
                className="group flex items-center gap-3 rounded-2xl border border-line/60 bg-surface-2/60 px-3.5 py-2.5 transition hover:border-saffron/50 hover:bg-saffron/5 hover:shadow-[0_0_16px_-6px_hsl(var(--saffron)/0.4)]"
              >
                <svg viewBox="0 0 32 32" fill="none" className="h-6 w-6 shrink-0">
                  <path d="M5 4.5L18 16 5 27.5V4.5z" fill="hsl(var(--saffron))" />
                  <path d="M5 4.5L23 14 18 16 5 4.5z" fill="hsl(var(--sage))" />
                  <path d="M5 27.5L23 18 18 16 5 27.5z" fill="hsl(var(--coral))" />
                  <path d="M23 14L28 16 23 18 18 16z" fill="hsl(var(--plum))" />
                </svg>
                <div className="leading-tight">
                  <p className="text-[9px] uppercase tracking-wider text-cream/45">Get it on</p>
                  <p className="font-display text-sm font-bold text-cream">Google Play</p>
                </div>
              </a>
              <a
                href="#"
                aria-label="Download on the App Store"
                className="group flex items-center gap-3 rounded-2xl border border-line/60 bg-surface-2/60 px-3.5 py-2.5 transition hover:border-saffron/50 hover:bg-saffron/5 hover:shadow-[0_0_16px_-6px_hsl(var(--saffron)/0.4)]"
              >
                <svg viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6 shrink-0 text-cream">
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                <div className="leading-tight">
                  <p className="text-[9px] uppercase tracking-wider text-cream/45">Download on the</p>
                  <p className="font-display text-sm font-bold text-cream">App Store</p>
                </div>
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-line/50 bg-surface/20 py-5">
        <div className="container flex flex-col items-center justify-between gap-3 text-xs text-cream/45 sm:flex-row">
          <span>
            © {new Date().getFullYear()} Ayra Family Mart · All rights reserved.
          </span>
          <div className="flex flex-wrap items-center gap-2">
            {['SSLCommerz', 'bKash', 'Nagad', 'Rocket', 'COD'].map((p) => (
              <span
                key={p}
                className="rounded-full border border-line/60 bg-surface-2/50 px-2.5 py-0.5 text-[10px] font-semibold text-cream/65"
              >
                {p}
              </span>
            ))}
          </div>
          <span className="flex flex-col items-center gap-0.5 sm:items-end">
            <span className="flex items-center gap-1.5">
              Made with <span className="text-saffron">♥</span> in <span className="font-bangla normal-case text-cream/70">বাংলাদেশ</span>
            </span>
            <span className="text-cream/30">Developed by — Zisan Yasir</span>
          </span>
        </div>
      </div>
    </footer>
  );
}

// ─── Bottom mobile tab bar ────────────────────────────────────────────────────

function BottomTabBar({ onCartClick }: { onCartClick: () => void }) {
  const { itemCount }       = useCartStore();
  const { isAuthenticated } = useAuthStore();
  const navigate            = useNavigate();
  const qc                  = useQueryClient();
  const count               = itemCount();

  const [notifOpen,  setNotifOpen]  = useState(false);
  const [notifItems, setNotifItems] = useState<ApiNotification[]>([]);

  const { data: unreadCount = 0 } = useQuery({
    queryKey:        ['notifications', 'unread-count'],
    queryFn:         fetchUnreadCount,
    refetchInterval: 30_000,
    enabled:         isAuthenticated,
  });

  useEffect(() => {
    if (!notifOpen || !isAuthenticated) return;
    fetchNotifications({ limit: 20 }).then((r) => setNotifItems(r.data));
  }, [notifOpen, isAuthenticated]);

  async function handleMarkAll() {
    await markAllNotificationsRead();
    setNotifItems((prev) => prev.map((n) => ({ ...n, isRead: true })));
    void qc.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
  }

  async function handleMarkOne(id: string) {
    await markNotificationRead(id);
    setNotifItems((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n));
    void qc.invalidateQueries({ queryKey: ['notifications', 'unread-count'] });
  }

  const leftTabs = [
    { icon: Home,       label: 'Home',   to: '/',         end: true  },
    { icon: LayoutGrid, label: 'Browse', to: '/products', end: false },
  ] as const;

  return (
    <>
      <nav className="fixed inset-x-0 bottom-0 z-40 flex border-t border-line bg-bg/95 backdrop-blur-xl ring-1 ring-saffron/10 pb-[env(safe-area-inset-bottom,0px)] lg:hidden">
        {/* Home + Browse */}
        {leftTabs.map(({ icon: Icon, label, to, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              cn(
                'flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] uppercase tracking-[0.15em] transition-colors',
                isActive ? 'text-saffron' : 'text-cream/55',
              )
            }
          >
            {({ isActive }) => (
              <>
                <Icon className={cn('h-5 w-5 transition-transform', isActive && 'scale-110')} />
                {label}
              </>
            )}
          </NavLink>
        ))}

        {/* Cart */}
        <button
          onClick={onCartClick}
          className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] uppercase tracking-[0.15em] text-cream/55 transition hover:text-saffron"
        >
          <div className="relative">
            <BasketIcon size={20} strokeWidth={1.5} />
            <AnimatePresence>
              {count > 0 && (
                <motion.span
                  key={count}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  exit={{ scale: 0 }}
                  className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-saffron font-display text-[9px] font-extrabold text-bg"
                >
                  {count > 9 ? '9+' : count}
                </motion.span>
              )}
            </AnimatePresence>
          </div>
          Cart
        </button>

        {/* Notification Bell */}
        <button
          onClick={() => isAuthenticated ? setNotifOpen(true) : navigate('/login')}
          className="relative flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] uppercase tracking-[0.15em] text-cream/55 transition hover:text-saffron"
          aria-label="Notifications"
        >
          <div className="relative">
            <Bell className="h-5 w-5 transition-transform" />
            {isAuthenticated && unreadCount > 0 && (
              <span className="absolute -right-1.5 -top-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-coral font-display text-[9px] font-extrabold text-bg ring-2 ring-bg">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </div>
          Alerts
        </button>

        {/* Account */}
        <NavLink
          to="/account"
          className={({ isActive }) =>
            cn(
              'flex flex-1 flex-col items-center justify-center gap-1 py-2.5 text-[10px] uppercase tracking-[0.15em] transition-colors',
              isActive ? 'text-saffron' : 'text-cream/55',
            )
          }
        >
          {({ isActive }) => (
            <>
              <User className={cn('h-5 w-5 transition-transform', isActive && 'scale-110')} />
              Account
            </>
          )}
        </NavLink>
      </nav>

      {/* Mobile notifications bottom sheet */}
      <AnimatePresence>
        {notifOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNotifOpen(false)}
              className="fixed inset-0 z-[54] bg-bg/60 backdrop-blur-sm lg:hidden"
            />
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 280 }}
              className="fixed inset-x-0 bottom-0 z-[55] flex max-h-[78vh] flex-col overflow-hidden rounded-t-2xl border-t border-line bg-surface shadow-lift lg:hidden"
              style={{ paddingBottom: 'env(safe-area-inset-bottom, 0px)' }}
            >
              {/* Drag handle */}
              <div className="flex shrink-0 justify-center pt-3 pb-1">
                <div className="h-1 w-10 rounded-full bg-cream/20" />
              </div>

              {/* Sheet header */}
              <div className="flex shrink-0 items-center justify-between border-b border-line px-4 pb-3">
                <span className="font-display text-base font-bold text-cream">Notifications</span>
                <div className="flex items-center gap-3">
                  {notifItems.some((n) => !n.isRead) && (
                    <button
                      onClick={handleMarkAll}
                      className="text-[11px] text-saffron hover:underline"
                    >
                      Mark all read
                    </button>
                  )}
                  <button
                    onClick={() => setNotifOpen(false)}
                    className="flex h-8 w-8 items-center justify-center rounded-full transition hover:bg-cream/5"
                    aria-label="Close"
                  >
                    <X className="h-4 w-4 text-cream" />
                  </button>
                </div>
              </div>

              {/* Notification list */}
              <div className="flex-1 overflow-y-auto">
                {notifItems.length === 0 ? (
                  <div className="flex flex-col items-center gap-3 py-16 text-center">
                    <Bell className="h-10 w-10 text-cream/20" />
                    <p className="text-sm text-cream/45">No notifications yet</p>
                  </div>
                ) : (
                  notifItems.map((n) => {
                    const Icon = notifIcon(n.type);
                    return (
                      <button
                        key={n.id}
                        onClick={() => { void handleMarkOne(n.id); setNotifOpen(false); }}
                        className={cn(
                          'flex w-full gap-3 px-4 py-3 text-left transition active:bg-surface-2',
                          !n.isRead && 'bg-saffron/5',
                        )}
                      >
                        <div className={cn(
                          'mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-full',
                          n.type === 'ORDER_STATUS' || n.type === 'ORDER_CREATED'
                            ? 'bg-saffron/15 text-saffron'
                            : 'bg-cream/10 text-cream/60',
                        )}>
                          <Icon className="h-4 w-4" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-display text-xs font-semibold text-cream">
                            {sanitizeText(n.title)}
                            {!n.isRead && (
                              <span className="ml-1.5 inline-block h-1.5 w-1.5 rounded-full bg-coral align-middle" />
                            )}
                          </p>
                          <p className="line-clamp-2 text-[11px] leading-relaxed text-cream/55">
                            {sanitizeText(n.message)}
                          </p>
                          <p className="mt-0.5 text-[10px] text-cream/35">{relativeTime(n.createdAt)}</p>
                        </div>
                      </button>
                    );
                  })
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

// ─── Main layout ──────────────────────────────────────────────────────────────

export default function CustomerLayout() {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [cartOpen,   setCartOpen]   = useState(false);
  const [scrolled,   setScrolled]   = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn:  fetchCategories,
    staleTime: 1000 * 60 * 10,
  });

  useEffect(() => {
    function onScroll() { setScrolled(window.scrollY > 12); }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className="flex min-h-screen flex-col bg-bg">
      <TopLoadingBar />
      <CursorFollower />
      <FloatingLeaves />

      <AnnouncementBar />

      {/* Sticky header — purple glass with pink glow on scroll */}
      <header
        className={cn(
          'sticky top-0 z-30 transition-all duration-300',
          scrolled
            ? 'bg-bg/85 backdrop-blur-xl ring-1 ring-line/50 shadow-[0_8px_32px_-12px_hsl(var(--saffron)/0.25)]'
            : 'bg-bg',
        )}
      >
        <div className="container flex items-center gap-3 py-3.5">
          {/* Hamburger — mobile only */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full transition hover:bg-saffron/10 hover:text-saffron active:scale-90 lg:hidden"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5 text-cream" />
          </button>

          <Logo size="sm" className="shrink-0" />

          {/* All Categories + Search — md+ */}
          <div className="hidden flex-1 items-center gap-3 md:flex">
            <AllCategoriesDropdown />
            <SearchBar />
          </div>

          {/* Location + Gold Member — xl+ */}
          <LocationSelector />
          <GoldMemberBadge />

          {/* Right actions */}
          <div className="ml-auto flex items-center gap-1.5 md:ml-0">
            <MobileSearch />
            <Link
              to="/wishlist"
              className="hidden h-9 w-9 items-center justify-center rounded-full text-cream/70 transition hover:bg-saffron/10 hover:text-saffron sm:flex"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
            </Link>
            {/* Theme toggle — visible in header on sm+ for quick access */}
            <div className="hidden sm:flex">
              <ThemeToggle compact />
            </div>
            <NotificationBell />
            <CartButton onClick={() => setCartOpen(true)} />
            <UserMenu />
          </div>
        </div>

        <CategoryNav categories={categories} />
      </header>

      <MobileDrawer
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        categories={categories}
      />

      <CartDrawer open={cartOpen} onClose={() => setCartOpen(false)} />

      <div className="flex flex-1">
        <CustomerSidebar />
        <main className="min-w-0 flex-1 customer-main">
          <Outlet />
        </main>
      </div>

      <Footer />

      <BottomTabBar onCartClick={() => setCartOpen(true)} />
    </div>
  );
}
