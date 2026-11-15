import { useEffect, useState } from 'react';
import { useApp } from '../context/AppContext.tsx';
import { apiRequest } from '../lib/api.ts';
import { PageMeta } from '../components/PageMeta.tsx';
import { ResilientImage } from '../components/ResilientImage.tsx';
import { EthicalNotice } from '../components/EthicalNotice.tsx';
import type { FounderProfile } from '../types/unitraca.ts';

export function FounderPage() {
  const { lang } = useApp();
  const [founder, setFounder] = useState<FounderProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    apiRequest<FounderProfile>('/api/founder')
      .then((data) => {
        setFounder(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 text-sm text-[var(--color-muted)]">
        {lang === 'en' ? 'Loading profile…' : 'Chargement de la fiche fondateur…'}
      </div>
    );
  }

  if (error || !founder) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 text-sm text-[var(--color-terracotta)]">
        {error || 'Fiche fondateur indisponible.'}
      </div>
    );
  }

  return (
    <>
      <PageMeta
        titleFr={`${founder.display_name} | Fondateur d’UNITRACA`}
        titleEn={`${founder.display_name} | Founder of UNITRACA`}
        descriptionFr="Biographie publique, titres présentés, publications et interventions associés à Fo’o Tchamaleu (Luminaire Ndia, Ndīā Shugaíntō II)."
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-16">
        {/* Hero */}
        <header className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start border-b border-[var(--color-ivory-border)] pb-12">
          <div className="lg:col-span-5">
            <ResilientImage
              src={founder.portrait_url}
              alt={founder.display_name}
              caption={founder.portrait_credit}
              aspectClass="aspect-[3/4]"
              loading="eager"
            />
          </div>

          <div className="lg:col-span-7 space-y-6">
            <p className="text-xs uppercase tracking-widest text-[var(--color-terracotta)]">
              {lang === 'en' ? 'Founder Profile & Public Names' : 'Fondateur et appellations publiques'}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[var(--color-earth-dark)]">
              {founder.display_name}
            </h1>

            <div className="space-y-2 border-y border-[var(--color-ivory-border)] py-4">
              <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">
                {lang === 'en' ? 'Validated / Public Appellations' : 'Titres et appellations présentés publiquement'}
              </p>
              <ul className="space-y-1.5 text-sm text-[var(--color-ink)]">
                {founder.titles.map((title) => (
                  <li key={title}>· {title}</li>
                ))}
                {founder.author_attribution && <li>· {founder.author_attribution}</li>}
              </ul>
            </div>

            <div className="prose-editorial space-y-4 text-base leading-relaxed text-[var(--color-ink)]/90 whitespace-pre-line max-w-2xl editorial-dropcap">
              {lang === 'en' ? founder.bio_en : founder.bio_fr}
            </div>

            <EthicalNotice
              variant="provisional"
              customText={lang === 'en' ? founder.oral_tradition_note_en : founder.oral_tradition_note_fr}
            />
          </div>
        </header>

        {/* Public Journey & Personal Message */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <div className="lg:col-span-7 space-y-5">
            <h2 className="font-display text-3xl font-semibold text-[var(--color-earth-dark)]">
              {lang === 'en' ? 'Documented Public Journey' : 'Parcours public documenté'}
            </h2>
            <p className="text-base leading-relaxed text-[var(--color-ink)]/85 whitespace-pre-line">
              {lang === 'en' ? founder.public_journey_en : founder.public_journey_fr}
            </p>
          </div>

          <div className="lg:col-span-5">
            <div className="border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)] p-7 space-y-4">
              <p className="text-xs uppercase tracking-widest text-[var(--color-terracotta)]">
                {lang === 'en' ? 'Personal Message (Pending Validation)' : 'Message personnel (à valider)'}
              </p>
              <blockquote className="font-display text-2xl italic leading-snug text-[var(--color-earth-dark)]">
                {lang === 'en' ? founder.personal_message_en : founder.personal_message_fr}
              </blockquote>
            </div>
          </div>
        </section>

        {/* Publications & Interventions */}
        <section className="grid grid-cols-1 lg:grid-cols-2 gap-10 border-t border-[var(--color-ivory-border)] pt-12">
          <div className="space-y-5">
            <h2 className="font-display text-3xl font-semibold text-[var(--color-earth-dark)]">
              {lang === 'en' ? 'Referenced Publications' : 'Publications et notices indexées'}
            </h2>
            <div className="space-y-4">
              {founder.publications.map((pub) => (
                <div key={pub.title} className="border border-[var(--color-ivory-border)] p-5 space-y-2">
                  <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">{pub.source}</p>
                  <h3 className="font-display text-xl font-semibold text-[var(--color-earth-dark)]">{pub.title}</h3>
                  <p className="text-sm text-[var(--color-ink)]/80 leading-relaxed">
                    {lang === 'en' ? pub.note_en : pub.note_fr}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-5">
            <h2 className="font-display text-3xl font-semibold text-[var(--color-earth-dark)]">
              {lang === 'en' ? 'Public Interventions' : 'Interventions et prises de parole'}
            </h2>
            <div className="space-y-4">
              {founder.interventions.map((inv) => (
                <div key={inv.title_fr} className="border border-[var(--color-ivory-border)] p-5 space-y-2">
                  <h3 className="font-display text-xl font-semibold text-[var(--color-earth-dark)]">
                    {lang === 'en' ? inv.title_en : inv.title_fr}
                  </h3>
                  <p className="text-sm text-[var(--color-ink)]/80 leading-relaxed">
                    {lang === 'en' ? inv.context_en : inv.context_fr}
                  </p>
                  <p className="text-xs text-[var(--color-muted)] pt-1">{inv.organizer_note}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Visual Archive Gallery */}
        {founder.gallery?.length > 0 && (
          <section className="space-y-6 border-t border-[var(--color-ivory-border)] pt-12">
            <div className="space-y-1">
              <h2 className="font-display text-3xl font-semibold text-[var(--color-earth-dark)]">
                {lang === 'en' ? 'Submitted Portrait Archives' : 'Archives visuelles soumises'}
              </h2>
              <p className="text-sm text-[var(--color-muted)]">
                {lang === 'en'
                  ? 'Captions, credits, and usage rights remain editable in the administration workspace.'
                  : 'Les légendes, crédits photographiques et autorisations d’usage restent modifiables dans l’administration.'}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {founder.gallery.map((item, idx) => (
                <ResilientImage
                  key={item.url}
                  src={item.url}
                  alt={lang === 'en' ? item.caption_en : item.caption_fr}
                  caption={`Fig. ${idx + 1} — ${lang === 'en' ? item.caption_en : item.caption_fr} (${item.credit})`}
                  aspectClass="aspect-[3/4]"
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}
