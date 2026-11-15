import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { getT } from '../i18n/translations.ts';
import { EASE_OUT_EXPO } from './MotionReveal.tsx';

export interface HeroSlide {
  src: string;
  captionFr: string;
  captionEn: string;
}

export const HERO_CAROUSEL_SLIDES: HeroSlide[] = [
  {
    src: '/assets/aistudio/images__1__26f818f9.jpg',
    captionFr: 'Fo’o Tchamaleu (Luminaire Ndia · Ndīā Shugaíntō II) — Fondateur d’UNITRACA',
    captionEn: 'Fo’o Tchamaleu (Luminaire Ndia · Ndīā Shugaíntō II) — Founder of UNITRACA',
  },
  {
    src: '/assets/aistudio/images_7a6644fd.jpg',
    captionFr: 'Patrimoine vivant et transmission des savoirs traditionnels africains',
    captionEn: 'Living heritage and transmission of African traditional knowledge',
  },
  {
    src: '/assets/aistudio/images__3__a2cc7dd5.jpg',
    captionFr: 'Rencontres, distinctions et dialogues autour des traditions',
    captionEn: 'Gatherings, distinctions, and dialogue around traditions',
  },
  {
    src: '/assets/aistudio/images__4__d3c9a0a1.jpg',
    captionFr: 'Ancrage culturel et continuité intergénérationnelle',
    captionEn: 'Cultural grounding and intergenerational continuity',
  },
  {
    src: '/assets/aistudio/images__2__80586b9c.jpg',
    captionFr: 'Orientation panafricaine et réappropriation des héritages',
    captionEn: 'Pan-African orientation and cultural heritage reclamation',
  },
];

interface HeroCarouselProps {
  heroLabel: string;
  heroTitle: string;
  heroSubtitle: string;
  heroText: string;
  heroNotice: string;
}

export function HeroCarousel({
  heroLabel,
  heroTitle,
  heroSubtitle,
  heroText,
  heroNotice,
}: HeroCarouselProps) {
  const { lang } = useApp();
  const t = getT(lang);
  const prefersReduced = useReducedMotion();
  const [slideIndex, setSlideIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (prefersReduced || isPaused) return;
    const timer = window.setInterval(() => {
      setSlideIndex((prev) => (prev + 1) % HERO_CAROUSEL_SLIDES.length);
    }, 5500);
    return () => window.clearInterval(timer);
  }, [prefersReduced, isPaused]);

  const currentSlide = HERO_CAROUSEL_SLIDES[slideIndex];

  return (
    <section
      aria-label={lang === 'en' ? 'Featured Heritage Carousel' : 'Carrousel principal UNITRACA'}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      className="relative -mt-18 sm:-mt-20 w-full min-h-[620px] sm:min-h-[680px] lg:min-h-[760px] flex items-center overflow-hidden bg-[#191714] text-[var(--color-ivory)]"
    >
      {/* Full-width Slide Imagery Layer with Smooth Crossfade & Absolute Black Overlay (opacity 0.4) */}
      <div className="absolute inset-0 z-0">
        <AnimatePresence mode="sync">
          <motion.div
            key={currentSlide.src}
            initial={prefersReduced ? { opacity: 0 } : { opacity: 0, scale: 1.05 }}
            animate={prefersReduced ? { opacity: 1 } : { opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.95, ease: EASE_OUT_EXPO }}
            className="absolute inset-0"
          >
            <img
              src={currentSlide.src}
              alt={lang === 'en' ? currentSlide.captionEn : currentSlide.captionFr}
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover object-top"
            />
            {/* Absolute-positioned black overlay (opacity 0.4) + directional legibility scrim */}
            <div className="absolute inset-0 bg-black/40" aria-hidden="true" />
            <div
              className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#191714]/90 via-[#191714]/60 to-[#191714]/25"
              aria-hidden="true"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Hero Foreground Content with Staggered Entrance */}
      <div className="relative z-10 max-w-[1280px] mx-auto w-full px-4 sm:px-6 lg:px-8 pt-26 sm:pt-30 pb-12 sm:pb-16 md:py-32">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-end">
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: EASE_OUT_EXPO }}
            className="lg:col-span-8 space-y-5 sm:space-y-6"
          >
            <p className="text-[11px] sm:text-xs uppercase tracking-[0.22em] sm:tracking-[0.25em] text-[#FF5A5A] font-semibold drop-shadow-xs">
              {heroLabel}
            </p>

            <div className="space-y-2.5 sm:space-y-3">
              <h1 className="font-display text-3xl sm:text-5xl lg:text-[4rem] font-semibold leading-[1.08] text-white tracking-wide drop-shadow-sm">
                {heroTitle}
              </h1>
              <p className="text-sm sm:text-lg font-medium text-[var(--color-brass)] tracking-wide drop-shadow-xs">
                UNITRACA — {heroSubtitle}
              </p>
            </div>

            <p className="text-sm sm:text-lg leading-relaxed text-white/95 max-w-2xl drop-shadow-xs">
              {heroText}
            </p>

            <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center gap-3 sm:gap-4 pt-2 sm:pt-3">
              <Link
                to="/unitraca"
                className="group inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-xl text-sm font-medium bg-[var(--color-logo-red)] text-white hover:bg-[#a51717] transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] shadow-lg whitespace-nowrap"
              >
                {t.home.btnDiscoverOrg}
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
              <Link
                to="/enseignements"
                className="inline-flex items-center justify-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-xl text-sm font-medium glass-dark text-[var(--color-ivory)] hover:bg-white/15 transition-all duration-200 hover:-translate-y-0.5 active:scale-[0.98] whitespace-nowrap"
              >
                {t.home.btnExploreTeachings}
              </Link>
            </div>

            <p className="text-xs text-white/80 pt-2 sm:pt-4 max-w-xl drop-shadow-xs">
              {heroNotice}
            </p>
          </motion.div>

          {/* Glassmorphic Carousel Controls & Caption Box */}
          <motion.div
            initial={prefersReduced ? false : { opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.15, ease: EASE_OUT_EXPO }}
            className="lg:col-span-4"
          >
            <div className="header-glassmorphism-hero p-5 sm:p-6 space-y-3.5 sm:space-y-4 shadow-xl">
              <div className="flex items-center justify-between gap-3">
                <span className="text-xs uppercase tracking-widest text-[#FF5A5A] font-semibold tabular-nums">
                  0{slideIndex + 1} / 0{HERO_CAROUSEL_SLIDES.length}
                </span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setSlideIndex(
                        (prev) => (prev - 1 + HERO_CAROUSEL_SLIDES.length) % HERO_CAROUSEL_SLIDES.length
                      )
                    }
                    aria-label={lang === 'en' ? 'Previous slide' : 'Image précédente'}
                    className="w-9 h-9 rounded-lg border border-white/25 flex items-center justify-center text-white hover:bg-white/15 active:scale-95 transition-all"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setSlideIndex((prev) => (prev + 1) % HERO_CAROUSEL_SLIDES.length)}
                    aria-label={lang === 'en' ? 'Next slide' : 'Image suivante'}
                    className="w-9 h-9 rounded-lg border border-white/25 flex items-center justify-center text-white hover:bg-white/15 active:scale-95 transition-all"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="min-h-[3.5rem] flex items-center">
                <AnimatePresence mode="wait">
                  <motion.p
                    key={currentSlide.src}
                    initial={prefersReduced ? false : { opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    transition={{ duration: 0.3, ease: EASE_OUT_EXPO }}
                    className="font-display text-lg sm:text-xl italic text-white leading-snug"
                  >
                    {lang === 'en' ? currentSlide.captionEn : currentSlide.captionFr}
                  </motion.p>
                </AnimatePresence>
              </div>

              <div className="flex items-center gap-2 pt-1">
                {HERO_CAROUSEL_SLIDES.map((s, idx) => (
                  <button
                    key={s.src}
                    type="button"
                    onClick={() => setSlideIndex(idx)}
                    aria-label={`Slide ${idx + 1}`}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      idx === slideIndex
                        ? 'w-8 bg-[var(--color-logo-red)]'
                        : 'w-2 bg-white/40 hover:bg-white/70'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
