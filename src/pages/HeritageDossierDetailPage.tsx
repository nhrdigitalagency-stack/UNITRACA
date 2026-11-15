import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.tsx';
import { apiRequest } from '../lib/api.ts';
import { getT } from '../i18n/translations.ts';
import { PageMeta } from '../components/PageMeta.tsx';
import { ResilientImage } from '../components/ResilientImage.tsx';
import type { HeritageDossier } from '../types/unitraca.ts';

export function HeritageDossierDetailPage() {
  const { slug } = useParams();
  const { lang } = useApp();
  const t = getT(lang);
  const [dossier, setDossier] = useState<HeritageDossier | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    apiRequest<HeritageDossier>(`/api/patrimoines/${slug}`)
      .then((data) => {
        setDossier(data);
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

  if (error || !dossier) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-16 space-y-4">
        <p className="text-base text-[var(--color-terracotta)]">{error || 'Dossier introuvable.'}</p>
        <Link to="/patrimoines" className="text-sm font-medium underline">
          {t.nav.heritage}
        </Link>
      </div>
    );
  }

  const title = lang === 'en' ? dossier.title_en : dossier.title_fr;

  return (
    <>
      <PageMeta
        titleFr={`${title} | Patrimoines UNITRACA`}
        descriptionFr={lang === 'en' ? dossier.summary_en : dossier.summary_fr}
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
        <nav aria-label="Breadcrumb" className="text-xs text-[var(--color-muted)]">
          <Link to="/patrimoines" className="hover:underline">
            {t.nav.heritage}
          </Link>{' '}
          / <span>{title}</span>
        </nav>

        <header className="max-w-3xl space-y-4 border-b border-[var(--color-ivory-border)] pb-8">
          <p className="text-xs uppercase tracking-widest text-[var(--color-forest)]">
            {dossier.region} · {dossier.community_or_tradition}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[var(--color-earth-dark)]">
            {title}
          </h1>
          <p className="text-base leading-relaxed text-[var(--color-ink)]/90">
            {lang === 'en' ? dossier.summary_en : dossier.summary_fr}
          </p>
        </header>

        {/* Asymmetric Reading Canvas with Margin Notes (70% / 30%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          <article className="lg:col-span-8 space-y-10 max-w-2xl">
            {dossier.cover_image && (
              <ResilientImage
                src={dossier.cover_image}
                alt={title}
                caption={dossier.image_credit}
                aspectClass="aspect-[16/10]"
              />
            )}

            <section className="space-y-3">
              <h2 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
                {lang === 'en' ? '01. Documented Context' : '01. Repères documentés'}
              </h2>
              <p className="text-base leading-relaxed text-[var(--color-ink)]/90 whitespace-pre-line editorial-dropcap">
                {lang === 'en' ? dossier.documented_context_en : dossier.documented_context_fr}
              </p>
            </section>

            <section className="space-y-3 border-t border-[var(--color-ivory-border)] pt-8">
              <h2 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
                {lang === 'en' ? '02. Attributed Oral Tradition' : '02. Tradition orale attribuée'}
              </h2>
              <p className="text-base leading-relaxed text-[var(--color-ink)]/90 whitespace-pre-line">
                {lang === 'en' ? dossier.oral_tradition_en : dossier.oral_tradition_fr}
              </p>
            </section>

            <section className="space-y-3 border-t border-[var(--color-ivory-border)] pt-8">
              <h2 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
                {lang === 'en' ? '03. Contemporary Interpretation' : '03. Lecture contemporaine et transmission'}
              </h2>
              <p className="text-base leading-relaxed text-[var(--color-ink)]/90 whitespace-pre-line">
                {lang === 'en' ? dossier.interpretation_en : dossier.interpretation_fr}
              </p>
            </section>
          </article>

          <aside className="lg:col-span-4 space-y-6">
            {dossier.margin_notes?.length > 0 && (
              <div className="border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)] p-6 space-y-5">
                <h2 className="font-display text-xl font-semibold text-[var(--color-earth-dark)]">
                  {lang === 'en' ? 'Editorial Margin Notes' : 'Notes de méthode en marge'}
                </h2>
                <div className="divide-y divide-[var(--color-ivory-border)]">
                  {dossier.margin_notes.map((note) => (
                    <div key={note.ref} className="py-3 space-y-1">
                      <p className="text-xs uppercase tracking-wider text-[var(--color-terracotta)]">
                        {note.ref} · {lang === 'en' ? note.title_en : note.title_fr}
                      </p>
                      <p className="text-xs leading-relaxed text-[var(--color-ink)]/85">
                        {lang === 'en' ? note.body_en : note.body_fr}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="border border-[var(--color-ivory-border)] p-6 space-y-3">
              <h2 className="font-display text-xl font-semibold text-[var(--color-earth-dark)]">
                {lang === 'en' ? 'Sources & References' : 'Sources et mentions'}
              </h2>
              <ul className="space-y-2 text-xs text-[var(--color-muted)]">
                {dossier.sources.map((src) => (
                  <li key={src}>· {src}</li>
                ))}
              </ul>
              <div className="pt-3 border-t border-[var(--color-ivory-border)]">
                <Link
                  to={`/contact?type=media_correction&ref=${encodeURIComponent(dossier.slug)}`}
                  className="text-xs font-medium text-[var(--color-terracotta)] hover:underline"
                >
                  {lang === 'en' ? 'Suggest a correction or source →' : 'Proposer une précision ou correction →'}
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
