import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.tsx';
import { apiRequest } from '../lib/api.ts';
import { getT } from '../i18n/translations.ts';
import { PageMeta } from '../components/PageMeta.tsx';
import { EthicalNotice } from '../components/EthicalNotice.tsx';
import type { TeachingItem } from '../types/unitraca.ts';

export function TeachingDetailPage() {
  const { slug } = useParams();
  const { lang } = useApp();
  const t = getT(lang);
  const [item, setItem] = useState<TeachingItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    apiRequest<TeachingItem>(`/api/teachings/${slug}`)
      .then((data) => {
        setItem(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 text-sm text-[var(--color-muted)]">
        {t.common.loading}
      </div>
    );
  }

  if (error || !item) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-4">
        <p className="text-base text-[var(--color-terracotta)]">{error || 'Enseignement introuvable.'}</p>
        <Link to="/enseignements" className="text-sm font-medium underline">
          {t.common.backToList}
        </Link>
      </div>
    );
  }

  const title = lang === 'en' ? item.title_en : item.title_fr;
  const summary = lang === 'en' ? item.summary_en : item.summary_fr;

  return (
    <>
      <PageMeta titleFr={`${title} | Enseignements UNITRACA`} descriptionFr={summary} />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-10">
        <nav aria-label="Breadcrumb" className="text-xs text-[var(--color-muted)]">
          <Link to="/enseignements" className="hover:underline">
            {t.nav.teachings}
          </Link>{' '}
          / <span>{title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <header className="space-y-5 border-b border-[var(--color-ivory-border)] pb-8">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-logo-red)] font-semibold">
                {item.format} · {item.language_offered}
              </p>
              <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[var(--color-earth-dark)]">
                {title}
              </h1>
              <p className="text-base leading-relaxed text-[var(--color-ink)]/90">{summary}</p>
              {item.cover_image && (
                <div className="rounded-2xl overflow-hidden border border-[var(--color-ivory-border)] shadow-md aspect-[16/9]">
                  <img
                    src={item.cover_image}
                    alt={title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
            </header>

            <section className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
                {lang === 'en' ? 'Objectives & Scope' : 'Objectifs pédagogiques et cadre'}
              </h2>
              <p className="text-sm leading-relaxed text-[var(--color-ink)]/85 whitespace-pre-line">
                {lang === 'en' ? item.objectives_en : item.objectives_fr}
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
                {lang === 'en' ? 'Target Audience & Prerequisites' : 'Public concerné et prérequis'}
              </h2>
              <p className="text-sm leading-relaxed text-[var(--color-ink)]/85">
                <strong>{lang === 'en' ? 'Audience: ' : 'Public : '}</strong>
                {lang === 'en' ? item.target_audience_en : item.target_audience_fr}
              </p>
              <p className="text-sm leading-relaxed text-[var(--color-ink)]/85">
                <strong>{lang === 'en' ? 'Prerequisites: ' : 'Prérequis : '}</strong>
                {lang === 'en' ? item.prerequisites_en : item.prerequisites_fr}
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
                {lang === 'en' ? 'Participation Terms & Service Boundaries' : 'Conditions et limites du service'}
              </h2>
              <p className="text-sm leading-relaxed text-[var(--color-ink)]/85">
                {lang === 'en' ? item.conditions_en : item.conditions_fr}
              </p>
              <EthicalNotice
                variant="health"
                customText={lang === 'en' ? item.limits_notice_en : item.limits_notice_fr}
              />
            </section>
          </div>

          <aside className="lg:col-span-4 space-y-6">
            <div className="border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)] p-6 space-y-5">
              <h2 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
                {lang === 'en' ? 'Practical Information' : 'Fiche pratique'}
              </h2>
              <dl className="divide-y divide-[var(--color-ivory-border)] text-sm">
                <div className="py-2.5">
                  <dt className="text-xs text-[var(--color-muted)]">{lang === 'en' ? 'Speaker' : 'Intervenant'}</dt>
                  <dd className="font-medium text-[var(--color-ink)]">{item.speaker}</dd>
                </div>
                <div className="py-2.5">
                  <dt className="text-xs text-[var(--color-muted)]">{lang === 'en' ? 'Cultural context' : 'Contexte culturel'}</dt>
                  <dd className="text-[var(--color-ink)]">{item.tradition_context}</dd>
                </div>
                <div className="py-2.5">
                  <dt className="text-xs text-[var(--color-muted)]">{lang === 'en' ? 'Duration' : 'Durée'}</dt>
                  <dd className="text-[var(--color-ink)]">{item.duration}</dd>
                </div>
                <div className="py-2.5">
                  <dt className="text-xs text-[var(--color-muted)]">{lang === 'en' ? 'Schedule' : 'Calendrier'}</dt>
                  <dd className="text-[var(--color-ink)]">{lang === 'en' ? item.schedule_note_en : item.schedule_note_fr}</dd>
                </div>
                <div className="py-2.5">
                  <dt className="text-xs text-[var(--color-muted)]">{lang === 'en' ? 'Format / Venue' : 'Lieu ou modalité'}</dt>
                  <dd className="text-[var(--color-ink)]">{item.location_or_mode}</dd>
                </div>
                <div className="py-2.5">
                  <dt className="text-xs text-[var(--color-muted)]">{lang === 'en' ? 'Fees' : 'Tarifs'}</dt>
                  <dd className="text-[var(--color-terracotta)] font-medium">{item.price_display}</dd>
                </div>
              </dl>

              <Link
                to={`/inscription?teaching=${item.id}`}
                className="w-full inline-flex justify-center items-center px-5 py-3 text-sm font-medium bg-[var(--color-forest)] text-[var(--color-ivory)] hover:bg-[var(--color-earth-dark)] transition-colors"
              >
                {t.common.requestEnrollment}
              </Link>
              <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                {lang === 'en'
                  ? 'Sending a request does not guarantee admission. Each request is reviewed by UNITRACA.'
                  : 'L’envoi d’une demande ne vaut pas admission confirmée. Chaque dossier est examiné par l’équipe responsable.'}
              </p>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
