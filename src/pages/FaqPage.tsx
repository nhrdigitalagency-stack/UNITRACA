import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BookOpen, Globe, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { apiRequest } from '../lib/api.ts';
import { PageMeta } from '../components/PageMeta.tsx';
import { EthicalNotice } from '../components/EthicalNotice.tsx';
import { FAQ } from '../components/FAQ.tsx';
import type { FaqItem } from '../types/unitraca.ts';

export function FaqPage() {
  const { lang } = useApp();
  const [items, setItems] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<FaqItem[]>('/api/faq')
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <PageMeta
        titleFr="Questions fréquentes (FAQ) | UNITRACA"
        titleEn="Frequently Asked Questions | UNITRACA"
        descriptionFr="Réponses transparentes sur le fonctionnement d’UNITRACA, les demandes d’inscription, la protection des savoirs et l’absence de promesses médicales."
        descriptionEn="Transparent answers regarding UNITRACA’s operations, enrollment requests, cultural knowledge protection, and healthcare safeguards."
      />

      <div className="max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 md:py-18 space-y-12">
        {/* Institutional Header */}
        <header className="space-y-4 border-b border-[var(--color-ivory-border)] pb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-logo-red)] font-semibold">
            {lang === 'en' ? 'Frequently Asked Questions' : 'Foire Aux Questions (FAQ)'}
          </p>
          <h1 className="font-display text-3xl sm:text-5xl font-semibold text-[var(--color-earth-dark)]">
            {lang === 'en'
              ? 'Questions & Official Landmarks on UNITRACA'
              : 'Questions fréquentes et repères officiels'}
          </h1>
          <p className="text-sm sm:text-base font-medium text-[var(--color-logo-red)] max-w-2xl">
            {lang === 'en'
              ? 'Clear explanations on courses, remote access for the diaspora, cultural protection, and health safeguards'
              : 'Tout comprendre sur les enseignements, l’inscription à distance pour la diaspora, la protection culturelle et l’éthique'}
          </p>
        </header>

        {/* Key Institutional Pillars Summary Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="rounded-2xl glass-surface p-5 space-y-2 border border-[var(--color-ivory-border)]">
            <BookOpen className="w-5 h-5 text-[var(--color-logo-red)]" />
            <h2 className="font-display text-xl font-semibold text-[var(--color-earth-dark)]">
              {lang === 'en' ? 'Non-Academic Status' : 'Statut des enseignements'}
            </h2>
            <p className="text-xs leading-relaxed text-[var(--color-muted)]">
              {lang === 'en'
                ? 'UNITRACA’s cycles belong to cultural and spiritual transmission and do not award state-accredited diplomas.'
                : 'Les cycles relèvent de la transmission culturelle et spirituelle et ne délivrent aucun diplôme d’État.'}
            </p>
          </div>

          <div className="rounded-2xl glass-surface p-5 space-y-2 border border-[var(--color-ivory-border)]">
            <Globe className="w-5 h-5 text-[var(--color-logo-red)]" />
            <h2 className="font-display text-xl font-semibold text-[var(--color-earth-dark)]">
              {lang === 'en' ? 'Diaspora & Remote Access' : 'Suivi depuis l’étranger'}
            </h2>
            <p className="text-xs leading-relaxed text-[var(--color-muted)]">
              {lang === 'en'
                ? 'Remote theoretical and practical modules are available upon validated registration request.'
                : 'Des cours théoriques et pratiques sont accessibles à distance après validation du dossier d’inscription.'}
            </p>
          </div>

          <div className="rounded-2xl glass-surface p-5 space-y-2 border border-[var(--color-ivory-border)]">
            <ShieldCheck className="w-5 h-5 text-[var(--color-forest)]" />
            <h2 className="font-display text-xl font-semibold text-[var(--color-earth-dark)]">
              {lang === 'en' ? 'Medical Safeguards' : 'Garde-fous de santé'}
            </h2>
            <p className="text-xs leading-relaxed text-[var(--color-muted)]">
              {lang === 'en'
                ? 'Spiritual teachings never replace medical diagnosis, treatment, or consultation with a qualified doctor.'
                : 'Les enseignements spirituels ne remplacent jamais un diagnostic ou un traitement médical.'}
            </p>
          </div>
        </div>

        {/* Reusable Expandable FAQ Accordion Component with Search & All Categories */}
        <FAQ
          items={items}
          loading={loading}
          showHeader={false}
          showSearch={true}
        />

        <EthicalNotice variant="health" />

        {/* Direct Inquiry Card */}
        <div className="rounded-2xl glass-surface p-6 sm:p-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 border border-[var(--color-ivory-border)]">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-widest text-[var(--color-logo-red)] font-semibold">
              {lang === 'en' ? 'Direct Assistance' : 'Accompagnement & Renseignements'}
            </p>
            <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--color-earth-dark)]">
              {lang === 'en' ? 'Have another question?' : 'Vous avez une autre question ?'}
            </h3>
            <p className="text-xs sm:text-sm text-[var(--color-muted)]">
              {lang === 'en'
                ? 'Write directly to UNITRACA’s editorial and administrative team.'
                : 'Écrivez directement à l’équipe éditoriale et administrative d’UNITRACA.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-3 w-full sm:w-auto">
            <Link
              to="/contact"
              className="flex-1 sm:flex-initial text-center px-5 py-3 rounded-xl text-xs font-semibold bg-[var(--color-logo-red)] text-white hover:bg-[var(--color-earth-dark)] transition-colors whitespace-nowrap"
            >
              {lang === 'en' ? 'Contact UNITRACA' : 'Poser une question'}
            </Link>
            <Link
              to="/enseignements"
              className="flex-1 sm:flex-initial text-center px-5 py-3 rounded-xl text-xs font-semibold border border-[var(--color-earth-dark)] text-[var(--color-earth-dark)] hover:bg-[var(--color-ivory-soft)] transition-colors whitespace-nowrap"
            >
              {lang === 'en' ? 'View Teachings' : 'Voir les enseignements'}
            </Link>
          </div>
        </div>
      </div>
    </>
  );
}
