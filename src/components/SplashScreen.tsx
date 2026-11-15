import { useEffect, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { useApp } from '../context/AppContext.tsx';
import { EASE_OUT_EXPO } from './MotionReveal.tsx';

export function SplashScreen() {
  const { lang } = useApp();
  const prefersReduced = useReducedMotion();
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const duration = prefersReduced ? 450 : 2250;
    const timer = window.setTimeout(() => {
      setVisible(false);
    }, duration);

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' || e.key === 'Enter' || e.key === ' ') {
        setVisible(false);
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => {
      window.clearTimeout(timer);
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [prefersReduced]);

  return (
    <AnimatePresence>
      {visible && (
        <motion.div
          role="status"
          aria-live="polite"
          aria-label="UNITRACA — Chargement du portail"
          onClick={() => setVisible(false)}
          initial={{ opacity: 1 }}
          exit={{
            opacity: 0,
            scale: 1.03,
            filter: 'blur(6px)',
            transition: { duration: 0.55, ease: EASE_OUT_EXPO },
          }}
          className="fixed inset-0 z-[100] flex flex-col items-center justify-center px-6 bg-[#191714] text-[var(--color-ivory)] select-none cursor-pointer overflow-hidden"
        >
          {/* Ambient Radial Illumination */}
          <motion.div
            aria-hidden="true"
            initial={{ opacity: 0, scale: 0.85 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, ease: EASE_OUT_EXPO }}
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'radial-gradient(circle at 50% 42%, rgba(200, 30, 30, 0.24) 0%, rgba(177, 138, 71, 0.11) 35%, rgba(25, 23, 20, 0.98) 75%)',
            }}
          />

          {/* Centered Logo & Uppercase UNITRACA Wordmark */}
          <div className="relative z-10 flex flex-col items-center text-center max-w-lg w-full">
            {/* Stage 1: Official Logo Emblem */}
            <motion.div
              initial={{ opacity: 0, scale: 0.78, y: 18 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{
                type: 'spring',
                stiffness: 240,
                damping: 22,
                mass: 0.9,
              }}
              className="relative p-2.5 rounded-3xl bg-gradient-to-b from-[var(--color-brass)]/45 via-[var(--color-logo-red)]/55 to-[#2D211B] shadow-2xl"
            >
              <div className="relative w-28 h-28 sm:w-36 sm:h-36 rounded-2xl overflow-hidden bg-[#F8F1E5] border-2 border-[var(--color-ivory)]/85 shadow-inner">
                <img
                  src="/assets/aistudio/channels4_profile_71e826b0.jpg"
                  alt="Logo officiel UNITRACA"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
              </div>
            </motion.div>

            {/* Stage 2: UNITRACA in Uppercase Below Logo */}
            <div className="mt-7 space-y-3">
              <motion.p
                initial={{ opacity: 0, y: 16, letterSpacing: '0.12em' }}
                animate={{ opacity: 1, y: 0, letterSpacing: '0.28em' }}
                transition={{ duration: 0.75, delay: 0.22, ease: EASE_OUT_EXPO }}
                className="font-display text-4xl sm:text-5xl md:text-6xl font-bold uppercase text-white pl-[0.28em]"
              >
                UNITRACA
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.65, delay: 0.42, ease: EASE_OUT_EXPO }}
                className="flex flex-col items-center space-y-2.5"
              >
                <motion.span
                  initial={{ scaleX: 0 }}
                  animate={{ scaleX: 1 }}
                  transition={{ duration: 0.6, delay: 0.5, ease: EASE_OUT_EXPO }}
                  className="w-16 h-0.5 bg-[var(--color-logo-red)] rounded-full origin-center"
                />
                <p className="text-[11px] sm:text-xs uppercase tracking-[0.2em] text-[var(--color-brass)] font-medium max-w-md leading-relaxed">
                  {lang === 'en'
                    ? 'INITIATORY UNIVERSE FOR AFRICAN TRADITIONS AND CULTURE'
                    : 'UNIVERS INITIATIQUE AUX TRADITIONS ET À LA CULTURE AFRICAINE'}
                </p>
              </motion.div>
            </div>

            {/* Stage 3: Smooth Progress Bar */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.45, duration: 0.4 }}
              className="mt-9 w-48 sm:w-56 h-1 rounded-full bg-white/10 overflow-hidden"
            >
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 1.75, delay: 0.45, ease: EASE_OUT_EXPO }}
                className="h-full w-full origin-left bg-gradient-to-r from-[var(--color-brass)] via-[var(--color-logo-red)] to-[var(--color-brass)]"
              />
            </motion.div>

            <motion.button
              type="button"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.65, duration: 0.4 }}
              onClick={(e) => {
                e.stopPropagation();
                setVisible(false);
              }}
              className="mt-6 text-[11px] uppercase tracking-[0.18em] text-white/60 hover:text-white transition-colors"
            >
              {lang === 'en' ? 'Enter Portal →' : 'Entrer sur le portail →'}
            </motion.button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
