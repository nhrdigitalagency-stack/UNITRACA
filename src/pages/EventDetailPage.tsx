import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { apiRequest } from '../lib/api.ts';
import { formatLocalizedDate, getT } from '../i18n/translations.ts';
import { PageMeta } from '../components/PageMeta.tsx';
import type { EventItem } from '../types/unitraca.ts';

export function EventDetailPage() {
  const { slug } = useParams();
  const { lang } = useApp();
  const t = getT(lang);
  const [ev, setEv] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    apiRequest<EventItem>(`/api/events/${slug}`)
      .then((data) => {
        setEv(data);
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

  if (error || !ev) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-4">
        <p className="text-base text-[var(--color-terracotta)]">{error || 'Événement introuvable.'}</p>
        <Link to="/agenda" className="text-sm font-medium underline">
          {t.nav.agenda}
        </Link>
      </div>
    );
  }

  const title = lang === 'en' ? ev.title_en : ev.title_fr;

  return (
    <>
      <PageMeta
        titleFr={`${title} | Agenda UNITRACA`}
        descriptionFr={lang === 'en' ? ev.description_en : ev.description_fr}
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-10">
        <nav aria-label="Breadcrumb" className="text-xs text-[var(--color-muted)]">
          <Link to="/agenda" className="hover:underline">
            {t.nav.agenda}
          </Link>{' '}
          / <span>{title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <header className="space-y-4 border-b border-[var(--color-ivory-border)] pb-8">
              <p className="text-xs uppercase tracking-widest text-[var(--color-terracotta)]">
                {ev.organizer_entity} · {ev.format}
              </p>
              <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[var(--color-earth-dark)]">
                {title}
              </h1>
              <p className="text-base leading-relaxed text-[var(--color-ink)]/90">
                {lang === 'en' ? ev.description_en : ev.description_fr}
              </p>
            </header>

            <section className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
                {lang === 'en' ? 'Program' : 'Programme prévisionnel'}
              </h2>
              <p className="text-sm leading-loose text-[var(--color-ink)]/85 whitespace-pre-line tabular-nums">
                {lang === 'en' ? ev.program_en : ev.program_fr}
              </p>
            </section>

            <section className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
                {lang === 'en' ? 'Participation Conditions & Accessibility' : 'Conditions et accessibilité'}
              </h2>
              <p className="text-sm text-[var(--color-ink)]/85 leading-relaxed">
                {lang === 'en' ? ev.conditions_en : ev.conditions_fr}
              </p>
              <p className="text-sm text-[var(--color-muted)] leading-relaxed">
                {lang === 'en' ? ev.accessibility_en : ev.accessibility_fr}
              </p>
            </section>
          </div>

          <aside className="lg:col-span-4">
            <div className="border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)] p-6 space-y-5">
              <h2 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
                {lang === 'en' ? 'Schedule & Venue' : 'Date, fuseau et lieu'}
              </h2>
              <dl className="divide-y divide-[var(--color-ivory-border)] text-sm">
                <div className="py-2.5">
                  <dt className="text-xs text-[var(--color-muted)]">{lang === 'en' ? 'Date' : 'Date'}</dt>
                  <dd className="font-medium tabular-nums">{formatLocalizedDate(ev.event_date, lang)}</dd>
                </div>
                <div className="py-2.5">
                  <dt className="text-xs text-[var(--color-muted)]">{lang === 'en' ? 'Time' : 'Horaire'}</dt>
                  <dd className="tabular-nums">
                    {ev.start_time} – {ev.end_time} ({ev.timezone})
                  </dd>
                </div>
                <div className="py-2.5">
                  <dt className="text-xs text-[var(--color-muted)]">{lang === 'en' ? 'Venue' : 'Lieu'}</dt>
                  <dd>{ev.validated_location}</dd>
                </div>
                <div className="py-2.5">
                  <dt className="text-xs text-[var(--color-muted)]">{lang === 'en' ? 'Speakers' : 'Intervenants'}</dt>
                  <dd>{ev.speakers.join(' · ')}</dd>
                </div>
              </dl>

              <a
                href={`/api/events/${ev.slug}/calendar.ics`}
                className="w-full inline-flex justify-center items-center gap-2 px-4 py-3 text-sm font-medium bg-[var(--color-forest)] text-[var(--color-ivory)] hover:bg-[var(--color-earth-dark)] transition-colors"
              >
                <Calendar className="w-4 h-4" />
                {t.common.exportIcs}
              </a>

              {ev.registration_open && (
                <Link
                  to="/inscription"
                  className="w-full inline-flex justify-center items-center px-4 py-3 text-sm font-medium border border-[var(--color-earth-dark)] text-[var(--color-earth-dark)] hover:bg-[var(--color-ivory)] transition-colors"
                >
                  {t.common.requestEnrollment}
                </Link>
              )}
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
