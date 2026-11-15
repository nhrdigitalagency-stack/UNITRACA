import React, { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Calendar,
  Film,
  Home,
  Menu,
  User,
  X,
} from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { getT } from '../i18n/translations.ts';
import { SplashScreen } from './SplashScreen.tsx';
import { WhatsAppFab } from './WhatsAppFab.tsx';
import { PageTransition } from './MotionReveal.tsx';

export function Layout({ children }: { children: React.ReactNode }) {
  const { lang, setLang, user, settings } = useApp();
  const t = getT(lang);
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeBtnRef = useRef<HTMLButtonElement>(null);
  const openBtnRef = useRef<HTMLButtonElement>(null);

  const isHomePage = location.pathname === '/';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    setDrawerOpen(false);
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior });
  }, [location.pathname]);

  useEffect(() => {
    if (!drawerOpen) return;
    closeBtnRef.current?.focus();
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setDrawerOpen(false);
        openBtnRef.current?.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [drawerOpen]);

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `whitespace-nowrap shrink-0 text-sm transition-colors duration-150 pb-1 border-b ${
      isActive
        ? 'text-[var(--color-logo-red)] border-[var(--color-logo-red)] font-semibold'
        : isHomePage && !scrolled
          ? 'text-[var(--color-ivory)]/95 border-transparent hover:text-[var(--color-brass)] hover:border-[var(--color-brass)]'
          : 'text-[var(--color-earth-dark)] border-transparent hover:text-[var(--color-logo-red)] hover:border-[var(--color-logo-red)]'
    }`;

  const social = settings?.social;

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-ivory)] text-[var(--color-ink)]">
      {/* Initial Site Launch Splash Screen: Official Logo + Uppercase UNITRACA */}
      <SplashScreen />

      {/* Skip link for keyboard accessibility */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-50 focus:bg-[var(--color-earth-dark)] focus:text-[var(--color-ivory)] focus:px-4 focus:py-2 focus:text-sm"
      >
        {lang === 'en' ? 'Skip to main content' : 'Aller au contenu principal'}
      </a>

      {/* Floating Rounded Glass Header: backdrop-blur(16px), 85% opacity, border-radius: 1rem */}
      <div className="sticky top-0 z-40 px-2.5 sm:px-6 lg:px-8 pt-2.5 sm:pt-3 pointer-events-none">
        <header
          className={`max-w-[1280px] mx-auto px-3.5 sm:px-6 h-15 sm:h-16 md:h-[68px] flex items-center justify-between gap-3 lg:gap-6 transition-all duration-300 pointer-events-auto shadow-lg ${
            isHomePage && !scrolled
              ? 'header-glassmorphism-hero'
              : 'header-glassmorphism'
          }`}
        >
          {/* Zone 1: Brand Mark (official logo + uppercase wordmark, single line) */}
          <Link
            to="/"
            className="flex items-center gap-2.5 sm:gap-3 whitespace-nowrap shrink-0 group"
            aria-label="UNITRACA — Accueil"
          >
            <img
              src="/assets/aistudio/channels4_profile_71e826b0.jpg"
              alt="Logo officiel UNITRACA"
              referrerPolicy="no-referrer"
              className="w-9 h-9 sm:w-10 sm:h-10 object-cover rounded-lg border border-[var(--color-logo-red)]/60 shadow-xs group-hover:scale-105 transition-transform"
            />
            <span
              className={`font-display text-xl sm:text-2xl font-bold uppercase tracking-wider transition-colors ${
                isHomePage && !scrolled
                  ? 'text-[var(--color-ivory)]'
                  : 'text-[var(--color-logo-red)]'
              }`}
            >
              UNITRACA
            </span>
          </Link>

          {/* Zone 2: Primary Single-Line Nav Links */}
          <nav
            aria-label={lang === 'en' ? 'Primary navigation' : 'Navigation principale'}
            className="hidden lg:flex items-center gap-6 xl:gap-7"
          >
            <NavLink to="/unitraca" className={navLinkClass}>
              {t.nav.organization}
            </NavLink>
            <NavLink to="/enseignements" className={navLinkClass}>
              {t.nav.teachings}
            </NavLink>
            <NavLink to="/agenda" className={navLinkClass}>
              {t.nav.agenda}
            </NavLink>
            <NavLink to="/mediatheque" className={navLinkClass}>
              {t.nav.media}
            </NavLink>
            <NavLink to="/faq" className={navLinkClass}>
              FAQ
            </NavLink>
            <NavLink to="/contact" className={navLinkClass}>
              {t.nav.contact}
            </NavLink>
          </nav>

          {/* Zone 3: Language selector + Primary Action */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <div
              role="group"
              aria-label={lang === 'en' ? 'Language' : 'Langue'}
              className={`hidden sm:flex items-center rounded-lg p-0.5 border ${
                isHomePage && !scrolled
                  ? 'border-white/25 bg-black/30'
                  : 'border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)]/80'
              }`}
            >
              <button
                type="button"
                onClick={() => setLang('fr')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  lang === 'fr'
                    ? 'bg-[var(--color-logo-red)] text-white shadow-xs'
                    : isHomePage && !scrolled
                      ? 'text-white/80 hover:text-white'
                      : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                }`}
              >
                FR
              </button>
              <button
                type="button"
                onClick={() => setLang('en')}
                className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap transition-colors ${
                  lang === 'en'
                    ? 'bg-[var(--color-logo-red)] text-white shadow-xs'
                    : isHomePage && !scrolled
                      ? 'text-white/80 hover:text-white'
                      : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                }`}
              >
                EN
              </button>
            </div>

            <Link
              to="/enseignements"
              className="hidden md:inline-flex items-center px-4 py-2 text-xs font-medium rounded-lg bg-[var(--color-logo-red)] text-white hover:bg-[var(--color-earth-dark)] transition-all shadow-xs whitespace-nowrap shrink-0"
            >
              {t.nav.ctaDiscover}
            </Link>

            <Link
              to="/espace-membre"
              className={`lg:hidden inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg border ${
                isHomePage && !scrolled
                  ? 'border-white/25 text-white'
                  : 'border-[var(--color-ivory-border)] text-[var(--color-earth-dark)]'
              }`}
              aria-label={t.nav.memberSpace}
            >
              <User className="w-4 h-4" />
            </Link>

            <button
              ref={openBtnRef}
              type="button"
              onClick={() => setDrawerOpen(true)}
              aria-expanded={drawerOpen}
              aria-controls="mobile-nav-drawer"
              aria-label={t.nav.menuOpen}
              className={`lg:hidden inline-flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg border ${
                isHomePage && !scrolled
                  ? 'border-white/25 bg-black/30 text-white'
                  : 'border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)] text-[var(--color-earth-dark)]'
              }`}
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </header>
      </div>

      {/* Accessible Drawer Menu (Mobile & Tablet) */}
      {drawerOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex justify-end bg-black/60 backdrop-blur-xs">
          <div
            id="mobile-nav-drawer"
            role="dialog"
            aria-modal="true"
            aria-label={lang === 'en' ? 'Navigation menu' : 'Menu de navigation'}
            className="w-full max-w-sm bg-[var(--color-ivory)] text-[var(--color-ink)] h-full overflow-y-auto p-6 flex flex-col justify-between border-l border-[var(--color-ivory-border)]"
          >
            <div>
              <div className="flex items-center justify-between pb-5 border-b border-[var(--color-ivory-border)]">
                <div className="flex items-center gap-2.5">
                  <img
                    src="/assets/aistudio/channels4_profile_71e826b0.jpg"
                    alt="Logo UNITRACA"
                    referrerPolicy="no-referrer"
                    className="w-9 h-9 object-cover rounded-lg border border-[var(--color-logo-red)]/60"
                  />
                  <span className="font-display text-2xl font-bold uppercase text-[var(--color-logo-red)]">
                    UNITRACA
                  </span>
                </div>
                <button
                  ref={closeBtnRef}
                  type="button"
                  onClick={() => {
                    setDrawerOpen(false);
                    openBtnRef.current?.focus();
                  }}
                  aria-label={t.nav.menuClose}
                  className="w-10 h-10 inline-flex items-center justify-center rounded-lg border border-[var(--color-ivory-border)] text-[var(--color-earth-dark)]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="py-4 flex items-center gap-2 border-b border-[var(--color-ivory-border)]">
                <span className="text-xs text-[var(--color-muted)] mr-2">
                  {lang === 'en' ? 'Language:' : 'Langue :'}
                </span>
                <button
                  type="button"
                  onClick={() => setLang('fr')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                    lang === 'fr'
                      ? 'bg-[var(--color-logo-red)] text-white'
                      : 'border border-[var(--color-ivory-border)]'
                  }`}
                >
                  Français
                </button>
                <button
                  type="button"
                  onClick={() => setLang('en')}
                  className={`px-3 py-1.5 text-xs font-medium rounded-md ${
                    lang === 'en'
                      ? 'bg-[var(--color-logo-red)] text-white'
                      : 'border border-[var(--color-ivory-border)]'
                  }`}
                >
                  English
                </button>
              </div>

              <nav className="py-5 flex flex-col gap-2">
                {[
                  { to: '/', label: t.nav.home },
                  { to: '/unitraca', label: t.nav.organization },
                  { to: '/fondateur', label: t.nav.founder },
                  { to: '/vision-et-valeurs', label: t.nav.vision },
                  { to: '/enseignements', label: t.nav.teachings },
                  { to: '/agenda', label: t.nav.agenda },
                  { to: '/mediatheque', label: t.nav.media },
                  { to: '/patrimoines', label: t.nav.heritage },
                  { to: '/faq', label: t.footer.faq },
                  { to: '/inscription', label: t.footer.enrollment },
                  { to: '/espace-membre', label: t.nav.memberSpace },
                  { to: '/contact', label: t.nav.contact },
                  { to: '/admin', label: t.nav.admin },
                ].map((item) => (
                  <Link
                    key={item.to}
                    to={item.to}
                    className="py-2 text-base font-medium text-[var(--color-earth-dark)] hover:text-[var(--color-logo-red)] border-b border-[var(--color-ivory-border)]/50"
                  >
                    {item.label}
                  </Link>
                ))}
              </nav>
            </div>

            <div className="pt-4">
              <Link
                to="/enseignements"
                className="w-full inline-flex justify-center items-center px-4 py-3 rounded-lg text-sm font-medium bg-[var(--color-logo-red)] text-white"
              >
                {t.nav.ctaDiscover}
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main id="main-content" className="flex-1 pb-20 md:pb-0">
        <PageTransition routeKey={location.pathname}>{children}</PageTransition>
      </main>

      {/* Persistent Floating Action Button (FAB) in Bottom-Right with WhatsApp Icon & 'Service client' Tooltip */}
      <WhatsAppFab />

      {/* Institutional Editorial Footer */}
      <footer className="bg-[var(--color-earth-dark)] text-[var(--color-ivory)] border-t border-[var(--color-brass)]/30 mt-16 pb-20 md:pb-0">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-14">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-10 border-b border-[var(--color-ivory)]/15">
            <div className="sm:col-span-2 lg:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <img
                  src="/assets/aistudio/channels4_profile_71e826b0.jpg"
                  alt="Logo UNITRACA"
                  referrerPolicy="no-referrer"
                  className="w-12 h-12 object-cover rounded-lg border border-[var(--color-logo-red)]/60"
                />
                <div>
                  <p className="font-display text-2xl font-bold uppercase tracking-wide text-[var(--color-ivory)]">
                    UNITRACA
                  </p>
                  <p className="text-xs text-[var(--color-brass)]">{t.brandFull}</p>
                </div>
              </div>
              <p className="text-sm leading-relaxed text-[var(--color-ivory)]/80 max-w-md">
                {t.footer.summary}
              </p>
              <p className="text-xs text-[var(--color-brass)] leading-relaxed max-w-md">
                {t.footer.provisional}
              </p>
            </div>

            <div className="lg:col-span-2 space-y-3">
              <h2 className="font-display text-lg font-semibold text-[var(--color-brass)]">
                {t.footer.linksNav}
              </h2>
              <ul className="space-y-2 text-sm text-[var(--color-ivory)]/85">
                <li><Link to="/unitraca" className="hover:text-[var(--color-brass)]">{t.nav.organization}</Link></li>
                <li><Link to="/fondateur" className="hover:text-[var(--color-brass)]">{t.nav.founder}</Link></li>
                <li><Link to="/vision-et-valeurs" className="hover:text-[var(--color-brass)]">{t.nav.vision}</Link></li>
                <li><Link to="/enseignements" className="hover:text-[var(--color-brass)]">{t.nav.teachings}</Link></li>
                <li><Link to="/agenda" className="hover:text-[var(--color-brass)]">{t.nav.agenda}</Link></li>
                <li><Link to="/mediatheque" className="hover:text-[var(--color-brass)]">{t.nav.media}</Link></li>
                <li><Link to="/patrimoines" className="hover:text-[var(--color-brass)]">{t.nav.heritage}</Link></li>
              </ul>
            </div>

            <div className="lg:col-span-2 space-y-3">
              <h2 className="font-display text-lg font-semibold text-[var(--color-brass)]">
                {t.footer.linksLegal}
              </h2>
              <ul className="space-y-2 text-sm text-[var(--color-ivory)]/85">
                <li><Link to="/inscription" className="hover:text-[var(--color-brass)]">{t.footer.enrollment}</Link></li>
                <li>
                  <Link to="/espace-membre" className="hover:text-[var(--color-brass)]">
                    {user ? `${t.nav.memberSpace} (${user.preferred_name || user.full_name})` : t.nav.memberSpace}
                  </Link>
                </li>
                <li><Link to="/faq" className="hover:text-[var(--color-brass)]">{t.footer.faq}</Link></li>
                <li><Link to="/confidentialite" className="hover:text-[var(--color-brass)]">{t.footer.privacy}</Link></li>
                <li><Link to="/conditions" className="hover:text-[var(--color-brass)]">{t.footer.terms}</Link></li>
                <li><Link to="/admin" className="hover:text-[var(--color-brass)]">{t.nav.admin}</Link></li>
              </ul>
            </div>

            <div className="sm:col-span-2 lg:col-span-3 space-y-3">
              <h2 className="font-display text-lg font-semibold text-[var(--color-brass)]">
                {t.footer.linksSocial}
              </h2>
              <div className="space-y-2 text-sm">
                {social?.youtube_url && (
                  <a
                    href={social.youtube_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-[var(--color-ivory)]/90 hover:text-[var(--color-brass)] underline underline-offset-4"
                  >
                    YouTube — UNITRACA
                  </a>
                )}
                {social?.facebook_url && (
                  <a
                    href={social.facebook_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-[var(--color-ivory)]/90 hover:text-[var(--color-brass)] underline underline-offset-4"
                  >
                    Facebook — UNITRACA
                  </a>
                )}
              </div>
              <p className="text-xs text-[var(--color-ivory)]/65 leading-relaxed">
                {t.footer.socialPending}
              </p>
              <p className="text-xs text-[var(--color-ivory)]/65 leading-relaxed">
                {t.footer.noOtherContacts}
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[var(--color-ivory)]/65">
            <p>© {new Date().getFullYear()} UNITRACA — Univers Initiatique aux Traditions et à la Culture Africaine.</p>
            <p>{lang === 'en' ? 'French & English · African language architecture ready' : 'Français & Anglais · Architecture prête pour les langues africaines'}</p>
          </div>
        </div>
      </footer>

      {/* Mobile Bottom Navigation Bar (5 real routes, <= 12% viewport height) */}
      <nav
        aria-label={lang === 'en' ? 'Mobile quick navigation' : 'Navigation rapide mobile'}
        className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-[var(--color-ivory)]/95 backdrop-blur-md border-t border-[var(--color-ivory-border)] pb-safe"
      >
        <div className="grid grid-cols-5 h-14">
          {[
            { to: '/', label: t.nav.home, icon: Home },
            { to: '/enseignements', label: t.nav.teachings, icon: BookOpen },
            { to: '/agenda', label: t.nav.agenda, icon: Calendar },
            { to: '/mediatheque', label: t.nav.media, icon: Film },
            { to: '/espace-membre', label: t.nav.account, icon: User },
          ].map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 text-[11px] font-medium whitespace-nowrap px-1 ${
                    isActive
                      ? 'text-[var(--color-logo-red)]'
                      : 'text-[var(--color-muted)] hover:text-[var(--color-ink)]'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span className="truncate max-w-full">{item.label}</span>
              </NavLink>
            );
          })}
        </div>
      </nav>
    </div>
  );
}
