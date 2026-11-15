import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.tsx';
import { apiRequest } from '../lib/api.ts';
import { getT } from '../i18n/translations.ts';
import { PageMeta } from '../components/PageMeta.tsx';
import { ResilientImage } from '../components/ResilientImage.tsx';
import type { HeritageDossier } from '../types/unitraca.ts';

export function HeritageDossiersPage() {
  const { lang } = useApp();
  const t = getT(lang);
  const [dossiers, setDossiers] = useState<HeritageDossier[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiRequest<HeritageDossier[]>('/api/patrimoines')
      .then((data) => {
        setDossiers(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <>
      <PageMeta
        titleFr="Patrimoines et dossiers culturels | UNITRACA"
        titleEn="Heritage & Cultural Dossiers | UNITRACA"
        descriptionFr="Dossiers culturels documentés distinguant faits historiques, traditions orales attribuées et communautés concernées."
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-10">
        <header className="max-w-3xl space-y-4 border-b border-[var(--color-ivory-border)] pb-8">
          <p className="text-xs uppercase tracking-widest text-[var(--color-terracotta)]">
            {t.nav.heritage}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[var(--color-earth-dark)]">
            {lang === 'en' ? 'Cultural Heritage Dossiers' : 'Dossiers culturels et patrimoines'}
          </h1>
          <p className="text-base leading-relaxed text-[var(--color-ink)]/85">
            {lang === 'en'
              ? 'Each dossier identifies the specific community or region concerned and separates documented context, attributed oral tradition, and contemporary interpretation.'
              : 'Chaque dossier identifie les communautés ou régions concernées et distingue systématiquement contexte documenté, tradition orale attribuée et interprétation contemporaine.'}
          </p>
        </header>

        {loading ? (
          <p className="text-sm text-[var(--color-muted)]">{t.common.loading}</p>
        ) : dossiers.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">{t.common.noResults}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {dossiers.map((d) => (
              <article
                key={d.id}
                className="border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)]/35 flex flex-col justify-between"
              >
                <div>
                  <ResilientImage
                    src={d.cover_image}
                    alt={lang === 'en' ? d.title_en : d.title_fr}
                    aspectClass="aspect-[4/3]"
                  />
                  <div className="p-6 space-y-3">
                    <p className="text-xs uppercase tracking-wider text-[var(--color-forest)]">
                      {d.region} · {d.community_or_tradition}
                    </p>
                    <h2 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
                      <Link to={`/patrimoines/${d.slug}`} className="hover:text-[var(--color-terracotta)]">
                        {lang === 'en' ? d.title_en : d.title_fr}
                      </Link>
                    </h2>
                    <p className="text-sm text-[var(--color-ink)]/85 leading-relaxed">
                      {lang === 'en' ? d.summary_en : d.summary_fr}
                    </p>
                  </div>
                </div>
                <div className="px-6 py-4 border-t border-[var(--color-ivory-border)]">
                  <Link
                    to={`/patrimoines/${d.slug}`}
                    className="text-sm font-medium text-[var(--color-terracotta)] hover:underline"
                  >
                    {lang === 'en' ? 'Read full dossier →' : 'Consulter le dossier →'}
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
