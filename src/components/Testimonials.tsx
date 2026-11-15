import React, { useMemo, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CheckCircle2, MapPin, MessageSquarePlus, Quote, ShieldCheck, X } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { apiRequest } from '../lib/api.ts';
import { EASE_OUT_EXPO } from './MotionReveal.tsx';
import type { TestimonialItem } from '../types/unitraca.ts';

export interface TestimonialsProps {
  items: TestimonialItem[];
  loading?: boolean;
  sectionNumber?: string;
}

export function Testimonials({
  items,
  loading = false,
  sectionNumber = '05',
}: TestimonialsProps) {
  const { lang } = useApp();
  const prefersReduced = useReducedMotion();
  const [filterMode, setFilterMode] = useState<'all' | 'verified' | 'editorial'>('all');
  const [submitModalOpen, setSubmitModalOpen] = useState(false);

  // Submission form state
  const [authorName, setAuthorName] = useState('');
  const [authorRole, setAuthorRole] = useState('');
  const [location, setLocation] = useState('');
  const [quoteText, setQuoteText] = useState('');
  const [contextNote, setContextNote] = useState('');
  const [consentCharter, setConsentCharter] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  const filteredItems = useMemo(() => {
    if (filterMode === 'verified') return items.filter((i) => i.is_verified);
    if (filterMode === 'editorial') return items.filter((i) => !i.is_verified);
    return items;
  }, [items, filterMode]);

  async function handleSubmitTestimonial(e: React.FormEvent) {
    e.preventDefault();
    setSubmitError('');

    if (!authorName.trim() || !quoteText.trim() || !location.trim()) {
      setSubmitError(
        lang === 'en'
          ? 'Please fill in your name, location, and testimony.'
          : 'Veuillez renseigner votre nom, votre localisation et votre témoignage.'
      );
      return;
    }

    if (!consentCharter) {
      setSubmitError(
        lang === 'en'
          ? 'Please confirm compliance with the UNITRACA ethical charter.'
          : 'Veuillez confirmer le respect de la charte éthique d’UNITRACA.'
      );
      return;
    }

    setSubmitting(true);
    try {
      await apiRequest('/api/testimonials', {
        method: 'POST',
        body: JSON.stringify({
          author_name: authorName.trim(),
          author_role_fr: authorRole.trim() || 'Auditeur / Participant',
          author_role_en: authorRole.trim() || 'Participant / Learner',
          location: location.trim(),
          quote_fr: `« ${quoteText.trim().replace(/^[«"]+|[»"]+$/g, '')} »`,
          quote_en: `"${quoteText.trim().replace(/^[«"]+|[»"]+$/g, '')}"`,
          context_fr: contextNote.trim() || 'Retour d’expérience soumis pour validation éditoriale.',
          context_en: contextNote.trim() || 'Feedback submitted for editorial validation.',
          consent_charter: true,
        }),
      });
      setSubmitSuccess(true);
      setAuthorName('');
      setAuthorRole('');
      setLocation('');
      setQuoteText('');
      setContextNote('');
      setConsentCharter(false);
    } catch (err) {
      setSubmitError(
        err instanceof Error
          ? err.message
          : lang === 'en'
            ? 'Unable to submit your testimony right now.'
            : 'Impossible d’enregistrer votre témoignage pour le moment.'
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-10">
      {/* Header & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
        <div className="max-w-3xl space-y-2">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-logo-red)] font-semibold">
            {sectionNumber} ·{' '}
            {lang === 'en'
              ? 'Voices & Attributed Reflections'
              : 'Témoignages & Paroles attribuées'}
          </p>
          <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-[var(--color-earth-dark)]">
            {lang === 'en'
              ? 'Echoes of Cultural Transmission'
              : 'Échos et retours autour de la démarche'}
          </h2>
          <p className="text-sm text-[var(--color-logo-red)] font-medium">
            {lang === 'en'
              ? 'Attributed quotes and participant reflections — strictly framed without medical or supernatural promises'
              : 'Paroles attribuées et retours d’expérience — dans le strict respect de la charte éthique (sans promesse médicale)'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5 shrink-0">
          <div
            role="group"
            aria-label={lang === 'en' ? 'Filter testimonials' : 'Filtrer les témoignages'}
            className="inline-flex rounded-xl p-1 border border-[var(--color-brass)]/45 bg-[var(--color-ivory)] shadow-2xs"
          >
            {[
              { id: 'all', labelFr: 'Tous', labelEn: 'All' },
              { id: 'verified', labelFr: 'Sources attribuées', labelEn: 'Attributed' },
              { id: 'editorial', labelFr: 'Cadre & Échos', labelEn: 'Editorial' },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setFilterMode(tab.id as typeof filterMode)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 active:scale-95 ${
                  filterMode === tab.id
                    ? 'bg-[var(--color-brass)] text-white shadow-xs'
                    : 'text-[var(--color-earth-dark)] hover:text-[var(--color-brass)]'
                }`}
              >
                {lang === 'en' ? tab.labelEn : tab.labelFr}
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={() => {
              setSubmitSuccess(false);
              setSubmitError('');
              setSubmitModalOpen(true);
            }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold bg-[var(--color-earth-dark)] text-[var(--color-ivory)] border border-[var(--color-brass)]/50 hover:bg-[var(--color-brass)] hover:text-white active:scale-95 transition-all shadow-xs"
          >
            <MessageSquarePlus className="w-3.5 h-3.5" />
            {lang === 'en' ? 'Submit feedback' : 'Proposer un témoignage'}
          </button>
        </div>
      </div>

      {/* Responsive Grid Layout with Ivory & Brass Testimonial Cards */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-72 rounded-2xl border border-[var(--color-brass)]/35 bg-[var(--color-ivory)] animate-pulse"
            />
          ))}
        </div>
      ) : (
        <motion.div
          layout={!prefersReduced}
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8"
        >
          <AnimatePresence mode="popLayout">
            {filteredItems.map((item, idx) => {
              const initials = item.author_name
                .split(' ')
                .filter(Boolean)
                .slice(0, 2)
                .map((part) => part[0]?.toUpperCase() || '')
                .join('');

              return (
                <motion.blockquote
                  key={item.id}
                  layout={!prefersReduced}
                  initial={prefersReduced ? false : { opacity: 0, y: 18, scale: 0.98 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.96 }}
                  transition={{
                    duration: 0.45,
                    delay: Math.min(idx * 0.06, 0.3),
                    ease: EASE_OUT_EXPO,
                  }}
                  className="group relative rounded-2xl bg-[var(--color-ivory)] p-6 sm:p-7 flex flex-col justify-between gap-6 border border-[var(--color-brass)]/45 hover:border-[var(--color-brass)] shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
                >
                  {/* Subtle Top Brass Accent Bar */}
                  <span
                    aria-hidden="true"
                    className="absolute top-0 inset-x-6 h-0.5 bg-gradient-to-r from-transparent via-[var(--color-brass)] to-transparent opacity-75"
                  />

                  <div className="space-y-4">
                    {/* Top Bar: Brass Quote Emblem & Ivory/Brass Attribution Badge */}
                    <div className="flex items-center justify-between gap-2">
                      <div className="w-10 h-10 rounded-xl bg-[var(--color-ivory-soft)] border border-[var(--color-brass)]/50 flex items-center justify-center text-[var(--color-brass)] transition-transform duration-300 group-hover:scale-105">
                        <Quote className="w-5 h-5" />
                      </div>

                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[11px] font-semibold ${
                          item.is_verified
                            ? 'bg-[var(--color-brass)]/18 text-[var(--color-earth-dark)] border border-[var(--color-brass)]/50'
                            : 'bg-[var(--color-ivory-soft)] text-[var(--color-muted)] border border-[var(--color-brass)]/30'
                        }`}
                      >
                        <ShieldCheck className="w-3.5 h-3.5 text-[var(--color-brass)] shrink-0" />
                        {item.is_verified
                          ? lang === 'en'
                            ? 'Attributed Source'
                            : 'Source attribuée'
                          : lang === 'en'
                            ? 'Editorial Slot'
                            : 'Cadre éditorial'}
                      </span>
                    </div>

                    {/* Quote Text */}
                    <p className="font-display text-xl sm:text-[1.35rem] italic leading-relaxed text-[var(--color-earth-dark)]">
                      {lang === 'en' ? item.quote_en : item.quote_fr}
                    </p>
                  </div>

                  {/* Author Attribution Footer in Ivory & Brass */}
                  <footer className="pt-4 border-t border-[var(--color-brass)]/30 space-y-3">
                    <div className="flex items-center gap-3">
                      <div
                        aria-hidden="true"
                        className="w-10 h-10 rounded-xl bg-[var(--color-earth-dark)] text-[var(--color-ivory)] font-display text-base font-bold flex items-center justify-center shrink-0 border border-[var(--color-brass)]"
                      >
                        {initials || 'UN'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[var(--color-earth-dark)] truncate">
                          {item.author_name}
                        </p>
                        <p className="text-xs font-medium text-[var(--color-brass)] truncate">
                          {lang === 'en' ? item.author_role_en : item.author_role_fr}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col gap-1 text-[11px] text-[var(--color-muted)] bg-[var(--color-ivory-soft)] rounded-xl px-3 py-2 border border-[var(--color-brass)]/30">
                      <span className="inline-flex items-center gap-1 font-medium text-[var(--color-earth-dark)]">
                        <MapPin className="w-3 h-3 text-[var(--color-brass)] shrink-0" />
                        {item.location}
                      </span>
                      <span className="leading-snug">
                        {lang === 'en' ? item.context_en : item.context_fr}
                      </span>
                    </div>
                  </footer>
                </motion.blockquote>
              );
            })}
          </AnimatePresence>
        </motion.div>
      )}

      {/* Modal to Submit a Testimonial for Editorial Validation */}
      <AnimatePresence>
        {submitModalOpen && (
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-label={
              lang === 'en' ? 'Submit a testimony to UNITRACA' : 'Proposer un témoignage à UNITRACA'
            }
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs"
          >
            <motion.div
              initial={prefersReduced ? false : { opacity: 0, scale: 0.96, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 10 }}
              transition={{ duration: 0.25, ease: EASE_OUT_EXPO }}
              className="w-full max-w-lg rounded-2xl bg-[var(--color-ivory)] text-[var(--color-ink)] border border-[var(--color-brass)]/60 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto space-y-5"
            >
              <div className="flex items-start justify-between gap-4 border-b border-[var(--color-brass)]/30 pb-4">
                <div>
                  <p className="text-xs uppercase tracking-widest text-[var(--color-brass)] font-semibold">
                    {lang === 'en' ? 'Editorial Contribution' : 'Contribution éditoriale'}
                  </p>
                  <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--color-earth-dark)]">
                    {lang === 'en'
                      ? 'Share Your Reflection'
                      : 'Partager un retour d’expérience'}
                  </h3>
                </div>
                <button
                  type="button"
                  onClick={() => setSubmitModalOpen(false)}
                  aria-label={lang === 'en' ? 'Close' : 'Fermer'}
                  className="w-9 h-9 rounded-lg border border-[var(--color-brass)]/40 flex items-center justify-center text-[var(--color-earth-dark)] hover:bg-[var(--color-ivory-soft)]"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {submitSuccess ? (
                <div className="rounded-2xl bg-[var(--color-ivory-soft)] border border-[var(--color-brass)]/50 p-5 space-y-3 text-center">
                  <CheckCircle2 className="w-8 h-8 text-[var(--color-brass)] mx-auto" />
                  <h4 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
                    {lang === 'en'
                      ? 'Thank you for your contribution'
                      : 'Témoignage transmis pour validation'}
                  </h4>
                  <p className="text-xs leading-relaxed text-[var(--color-ink)]/85">
                    {lang === 'en'
                      ? 'Your reflection has been recorded with "validation" status. It will appear publicly once verified by the UNITRACA editorial team.'
                      : 'Votre retour a bien été enregistré avec le statut « en validation ». Conformément à notre charte, il sera publié après vérification par l’équipe éditoriale d’UNITRACA.'}
                  </p>
                  <button
                    type="button"
                    onClick={() => setSubmitModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[var(--color-brass)] text-white"
                  >
                    {lang === 'en' ? 'Close window' : 'Fermer'}
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmitTestimonial} className="space-y-4">
                  {submitError && (
                    <div className="p-3 rounded-xl bg-[var(--color-logo-red)]/10 border border-[var(--color-logo-red)]/30 text-xs text-[var(--color-logo-red)] font-medium">
                      {submitError}
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-earth-dark)] mb-1">
                        {lang === 'en' ? 'Full name or attribution *' : 'Nom ou attribution *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={authorName}
                        onChange={(e) => setAuthorName(e.target.value)}
                        placeholder="Ex. K. Ndiaye"
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-[var(--color-brass)]/40 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-earth-dark)] mb-1">
                        {lang === 'en' ? 'City / Country *' : 'Ville / Pays *'}
                      </label>
                      <input
                        type="text"
                        required
                        value={location}
                        onChange={(e) => setLocation(e.target.value)}
                        placeholder="Ex. Douala / Paris / Montréal"
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-[var(--color-brass)]/40 bg-white"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-earth-dark)] mb-1">
                        {lang === 'en' ? 'Role / Capacity' : 'Qualité / Rôle'}
                      </label>
                      <input
                        type="text"
                        value={authorRole}
                        onChange={(e) => setAuthorRole(e.target.value)}
                        placeholder={
                          lang === 'en'
                            ? 'E.g. Conference participant'
                            : 'Ex. Auditeur des conférences'
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-[var(--color-brass)]/40 bg-white"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-[var(--color-earth-dark)] mb-1">
                        {lang === 'en' ? 'Teaching / Event context' : 'Contexte (cours ou rencontre)'}
                      </label>
                      <input
                        type="text"
                        value={contextNote}
                        onChange={(e) => setContextNote(e.target.value)}
                        placeholder={
                          lang === 'en'
                            ? 'E.g. Online session'
                            : 'Ex. Cycle de transmission à distance'
                        }
                        className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-[var(--color-brass)]/40 bg-white"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-[var(--color-earth-dark)] mb-1">
                      {lang === 'en' ? 'Your reflection *' : 'Votre témoignage *'}
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={quoteText}
                      onChange={(e) => setQuoteText(e.target.value)}
                      placeholder={
                        lang === 'en'
                          ? 'Share your cultural or educational reflection…'
                          : 'Partagez votre retour sur la démarche culturelle et pédagogique…'
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl text-xs border border-[var(--color-brass)]/40 bg-white"
                    />
                  </div>

                  <label className="flex items-start gap-2.5 text-xs text-[var(--color-muted)] cursor-pointer">
                    <input
                      type="checkbox"
                      checked={consentCharter}
                      onChange={(e) => setConsentCharter(e.target.checked)}
                      className="mt-0.5 accent-[var(--color-brass)]"
                    />
                    <span>
                      {lang === 'en'
                        ? 'I confirm that this testimony is genuine, contains no medical healing claims, and is submitted for editorial review prior to publication.'
                        : 'Je confirme que ce témoignage est sincère, ne comporte aucune promesse de guérison médicale et est soumis à validation éditoriale avant publication.'}
                    </span>
                  </label>

                  <div className="flex items-center justify-end gap-3 pt-2">
                    <button
                      type="button"
                      onClick={() => setSubmitModalOpen(false)}
                      className="px-4 py-2.5 rounded-xl text-xs font-medium border border-[var(--color-brass)]/40 text-[var(--color-earth-dark)]"
                    >
                      {lang === 'en' ? 'Cancel' : 'Annuler'}
                    </button>
                    <button
                      type="submit"
                      disabled={submitting}
                      className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-[var(--color-brass)] text-white hover:bg-[var(--color-earth-dark)] transition-colors disabled:opacity-50"
                    >
                      {submitting
                        ? lang === 'en'
                          ? 'Submitting…'
                          : 'Envoi en cours…'
                        : lang === 'en'
                          ? 'Submit for validation'
                          : 'Envoyer pour validation'}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
