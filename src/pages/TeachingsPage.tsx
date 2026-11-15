import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { apiRequest } from '../lib/api.ts';
import { getT } from '../i18n/translations.ts';
import { PageMeta } from '../components/PageMeta.tsx';
import { EthicalNotice } from '../components/EthicalNotice.tsx';
import type { EnrollmentStatus, TeachingItem } from '../types/unitraca.ts';

function statusLabel(status: EnrollmentStatus, lang: 'fr' | 'en'): string {
  const map: Record<EnrollmentStatus, { fr: string; en: string }> = {
    to_announce: { fr: 'À annoncer', en: 'To be announced' },
    open: { fr: 'Inscriptions ouvertes', en: 'Requests open' },
    full: { fr: 'Complet', en: 'Full' },
    finished: { fr: 'Terminé', en: 'Finished' },
    cancelled: { fr: 'Annulé', en: 'Cancelled' },
  };
  return map[status]?.[lang] || status;
}

export function TeachingsPage() {
  const { lang, settings } = useApp();
  const t = getT(lang);
  const [items, setItems] = useState<TeachingItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [formatFilter, setFormatFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    apiRequest<TeachingItem[]>('/api/teachings')
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const formats = useMemo(() => ['all', ...Array.from(new Set(items.map((i) => i.format)))], [items]);

  const filtered = useMemo(() => {
    return items.filter((item) => {
      if (formatFilter !== 'all' && item.format !== formatFilter) return false;
      if (statusFilter !== 'all' && item.enrollment_status !== statusFilter) return false;
      return true;
    });
  }, [items, formatFilter, statusFilter]);

  return (
    <>
      <PageMeta
        titleFr="Enseignements | UNITRACA"
        titleEn="Teachings | UNITRACA"
        descriptionFr="Catalogue des enseignements, cycles de transmission et rencontres proposés par UNITRACA, avec modalités, prérequis et limites du service."
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-10">
        <header className="max-w-3xl space-y-3 border-b border-[var(--color-ivory-border)] pb-8">
          <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-logo-red)] font-semibold">
            {t.nav.teachings}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[var(--color-earth-dark)]">
            {lang === 'en' ? 'Published Teachings & Cycles' : 'Catalogue des enseignements'}
          </h1>
          <p className="text-sm font-semibold text-[var(--color-logo-red)]">
            {lang === 'en'
              ? 'Theoretical and practical pathways — On-site and international remote participation'
              : 'Enseignements théoriques et pratiques — Participation en présentiel et en ligne depuis l’étranger'}
          </p>
          <p className="text-base leading-relaxed text-[var(--color-ink)]/85">
            {lang === 'en'
              ? 'Each listing specifies what is public, what requires member review, its prerequisites, and the limits of the service. No academic degree is claimed.'
              : 'Chaque fiche précise ce qui est proposé, ce qui est public ou réservé, les conditions de participation et les limites du service. Aucun diplôme reconnu par l’État n’est revendiqué.'}
          </p>
        </header>

        {settings && !settings.payments.enabled && (
          <EthicalNotice
            variant="provisional"
            customText={lang === 'en' ? settings.payments.reason_en : settings.payments.reason_fr}
          />
        )}

        {/* Interactive Filter Bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[var(--color-ivory-border)] pb-5">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Filtrer par format">
            {formats.map((f) => (
              <button
                key={f}
                type="button"
                onClick={() => setFormatFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition-colors ${
                  formatFilter === f
                    ? 'bg-[var(--color-logo-red)] text-white shadow-xs'
                    : 'glass-surface text-[var(--color-ink)] hover:bg-[var(--color-ivory-soft)]'
                }`}
              >
                {f === 'all' ? (lang === 'en' ? 'All formats' : 'Tous les formats') : f}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <label htmlFor="status-filter" className="text-xs font-medium text-[var(--color-muted)]">
              {lang === 'en' ? 'Status:' : 'Statut :'}
            </label>
            <select
              id="status-filter"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="rounded-xl border border-[var(--color-ivory-border)] bg-[var(--color-ivory)] px-3.5 py-2 text-xs text-[var(--color-ink)]"
            >
              <option value="all">{lang === 'en' ? 'All statuses' : 'Tous les statuts'}</option>
              <option value="open">{statusLabel('open', lang)}</option>
              <option value="to_announce">{statusLabel('to_announce', lang)}</option>
              <option value="full">{statusLabel('full', lang)}</option>
              <option value="finished">{statusLabel('finished', lang)}</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-[var(--color-muted)]">{t.common.loading}</p>
        ) : filtered.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">{t.common.noResults}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filtered.map((item) => (
              <article
                key={item.id}
                className="group rounded-2xl overflow-hidden glass-surface card-interactive flex flex-col justify-between"
              >
                <div>
                  <div className="relative overflow-hidden aspect-[16/10] bg-[var(--color-ivory-soft)]">
                    <img
                      src={
                        item.cover_image ||
                        '/src/assets/images/teaching_transmission_culturelle_1794685227484.jpg'
                      }
                      alt={lang === 'en' ? item.title_en : item.title_fr}
                      referrerPolicy="no-referrer"
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                    <div className="absolute bottom-4 left-5 right-5 flex items-center justify-between text-xs text-white">
                      <span className="uppercase tracking-wider font-medium">
                        {item.format} · {item.location_or_mode}
                      </span>
                      <span className="font-semibold text-[#FF7A7A]">
                        {statusLabel(item.enrollment_status, lang)}
                      </span>
                    </div>
                  </div>

                  <div className="p-6 sm:p-7 space-y-4">
                    <p className="text-xs font-semibold text-[var(--color-logo-red)]">
                      {item.tradition_context}
                    </p>
                    <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--color-earth-dark)] group-hover:text-[var(--color-logo-red)] transition-colors">
                      <Link to={`/enseignements/${item.slug}`}>
                        {lang === 'en' ? item.title_en : item.title_fr}
                      </Link>
                    </h2>
                    <p className="text-sm text-[var(--color-ink)]/85 leading-relaxed">
                      {lang === 'en' ? item.summary_en : item.summary_fr}
                    </p>
                    <dl className="pt-3 border-t border-[var(--color-ivory-border)] space-y-1.5 text-xs text-[var(--color-muted)]">
                      <div className="flex justify-between gap-2">
                        <dt>{lang === 'en' ? 'Speaker' : 'Intervenant'}</dt>
                        <dd className="text-[var(--color-ink)] font-medium text-right">{item.speaker}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt>{lang === 'en' ? 'Language' : 'Langue'}</dt>
                        <dd className="text-[var(--color-ink)] text-right">{item.language_offered}</dd>
                      </div>
                      <div className="flex justify-between gap-2">
                        <dt>{lang === 'en' ? 'Fee status' : 'Tarif'}</dt>
                        <dd className="text-[var(--color-logo-red)] font-medium text-right">{item.price_display}</dd>
                      </div>
                    </dl>
                  </div>
                </div>

                <div className="px-6 sm:px-7 py-4 border-t border-[var(--color-ivory-border)] flex items-center justify-between gap-3">
                  <Link
                    to={`/enseignements/${item.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-[var(--color-earth-dark)] hover:text-[var(--color-logo-red)]"
                  >
                    {lang === 'en' ? 'Full program sheet' : 'Consulter la fiche'}
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                  <Link
                    to={`/inscription?teaching=${item.id}`}
                    className="px-4 py-2.5 rounded-xl text-xs font-medium bg-[var(--color-logo-red)] text-white hover:bg-[var(--color-earth-dark)] transition-colors whitespace-nowrap"
                  >
                    {t.common.requestEnrollment}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
