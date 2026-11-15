import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { apiRequest } from '../lib/api.ts';
import { formatLocalizedDate, getT } from '../i18n/translations.ts';
import { PageMeta } from '../components/PageMeta.tsx';
import { EthicalNotice } from '../components/EthicalNotice.tsx';
import type { EventItem } from '../types/unitraca.ts';

export function AgendaPage() {
  const { lang } = useApp();
  const t = getT(lang);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<EventItem[]>('/api/events')
      .then((data) => {
        setEvents(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <PageMeta
        titleFr="Agenda et rencontres | UNITRACA"
        titleEn="Agenda & Gatherings | UNITRACA"
        descriptionFr="Calendrier des rencontres, conférences et tables rondes d’UNITRACA avec export .ics réel."
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-10">
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 border-b border-[var(--color-ivory-border)] pb-8">
          <div className="space-y-3 max-w-2xl">
            <p className="text-xs uppercase tracking-widest text-[var(--color-terracotta)]">{t.nav.agenda}</p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[var(--color-earth-dark)]">
              {lang === 'en' ? 'Confirmed & Proposed Events' : 'Agenda des rencontres et conférences'}
            </h1>
            <p className="text-base text-[var(--color-ink)]/85 leading-relaxed">
              {lang === 'en'
                ? 'Events organized by UNITRACA are explicitly distinguished from external appearances by the founder or partner initiatives. Maps are omitted until an exact physical venue is validated.'
                : 'Les événements organisés directement par UNITRACA sont distingués des interventions externes du fondateur. Aucune carte géographique n’est affichée tant qu’un lieu physique exact n’est pas validé.'}
            </p>
          </div>
          <a
            href="/api/events/calendar.ics"
            className="inline-flex items-center gap-2 px-5 py-3 text-sm font-medium bg-[var(--color-forest)] text-[var(--color-ivory)] hover:bg-[var(--color-earth-dark)] transition-colors whitespace-nowrap shrink-0"
          >
            <Calendar className="w-4 h-4" />
            {t.common.exportAllIcs}
          </a>
        </header>

        <EthicalNotice
          variant="provisional"
          customText={
            lang === 'en'
              ? 'Past announcements from social channels (such as March 29, 2026) are never republished as current schedules. Exported .ics files reflect live database records only.'
              : 'Les annonces passées (ex. rentrée du 29 mars) ne sont pas reconduites automatiquement. Les fichiers .ics sont générés dynamiquement depuis les données enregistrées.'}
        />

        {loading ? (
          <p className="text-sm text-[var(--color-muted)]">{t.common.loading}</p>
        ) : events.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">{t.common.noResults}</p>
        ) : (
          <div className="space-y-6">
            {events.map((ev) => (
              <article
                key={ev.id}
                className="border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)]/35 p-6 md:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 items-start"
              >
                <div className="lg:col-span-3 space-y-1">
                  <p className="text-lg font-semibold text-[var(--color-terracotta)] tabular-nums">
                    {formatLocalizedDate(ev.event_date, lang)}
                  </p>
                  <p className="text-sm text-[var(--color-muted)] tabular-nums">
                    {ev.start_time} – {ev.end_time} ({ev.timezone})
                  </p>
                  <p className="text-xs text-[var(--color-forest)] pt-2">{ev.format}</p>
                </div>

                <div className="lg:col-span-6 space-y-2">
                  <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">
                    {lang === 'en' ? 'Organizer: ' : 'Entité : '}
                    {ev.organizer_entity}
                  </p>
                  <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--color-earth-dark)]">
                    <Link to={`/agenda/${ev.slug}`} className="hover:text-[var(--color-terracotta)]">
                      {lang === 'en' ? ev.title_en : ev.title_fr}
                    </Link>
                  </h2>
                  <p className="text-sm text-[var(--color-ink)]/85 leading-relaxed">
                    {lang === 'en' ? ev.description_en : ev.description_fr}
                  </p>
                  <p className="text-xs text-[var(--color-muted)] pt-1">
                    {lang === 'en' ? 'Venue: ' : 'Lieu : '}
                    {ev.validated_location}
                  </p>
                </div>

                <div className="lg:col-span-3 flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end">
                  <Link
                    to={`/agenda/${ev.slug}`}
                    className="px-4 py-2.5 text-xs font-medium bg-[var(--color-earth-dark)] text-[var(--color-ivory)] text-center hover:bg-[var(--color-terracotta)] transition-colors whitespace-nowrap"
                  >
                    {lang === 'en' ? 'View program' : 'Voir le programme'}
                  </Link>
                  <a
                    href={`/api/events/${ev.slug}/calendar.ics`}
                    className="px-4 py-2.5 text-xs font-medium border border-[var(--color-earth-dark)] text-[var(--color-earth-dark)] text-center hover:bg-[var(--color-ivory-soft)] transition-colors whitespace-nowrap"
                  >
                    {t.common.exportIcs}
                  </a>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
