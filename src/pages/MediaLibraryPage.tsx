import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { Lock, Search } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { apiRequest } from '../lib/api.ts';
import { formatLocalizedDate, getT } from '../i18n/translations.ts';
import { PageMeta } from '../components/PageMeta.tsx';
import { ResilientImage } from '../components/ResilientImage.tsx';
import type { MediaResourceItem } from '../types/unitraca.ts';

const PAGE_SIZE = 6;

export function MediaLibraryPage() {
  const { lang } = useApp();
  const t = getT(lang);
  const [items, setItems] = useState<MediaResourceItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  const [accessFilter, setAccessFilter] = useState('all');
  const [page, setPage] = useState(1);

  useEffect(() => {
    apiRequest<MediaResourceItem[]>('/api/mediatheque')
      .then((data) => {
        setItems(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const languages = useMemo(() => ['all', ...Array.from(new Set(items.map((i) => i.language)))], [items]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return items.filter((item) => {
      if (category !== 'all' && item.category !== category) return false;
      if (languageFilter !== 'all' && item.language !== languageFilter) return false;
      if (accessFilter !== 'all' && item.access_level !== accessFilter) return false;
      if (!q) return true;
      return (
        item.title_fr.toLowerCase().includes(q) ||
        item.title_en.toLowerCase().includes(q) ||
        item.theme.toLowerCase().includes(q) ||
        item.speaker.toLowerCase().includes(q) ||
        item.language.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
      );
    });
  }, [items, query, category, languageFilter, accessFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  useEffect(() => {
    setPage(1);
  }, [query, category, languageFilter, accessFilter]);

  return (
    <>
      <PageMeta
        titleFr="Médiathèque et ressources | UNITRACA"
        titleEn="Media Library & Resources | UNITRACA"
        descriptionFr="Vidéos, articles, entretiens, galeries et documents documentés et contextualisés par UNITRACA."
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-10">
        <header className="max-w-3xl space-y-4 border-b border-[var(--color-ivory-border)] pb-8">
          <p className="text-xs uppercase tracking-widest text-[var(--color-terracotta)]">{t.nav.media}</p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[var(--color-earth-dark)]">
            {lang === 'en' ? 'Media Library & Archives' : 'Médiathèque et ressources'}
          </h1>
          <p className="text-base leading-relaxed text-[var(--color-ink)]/85">
            {lang === 'en'
              ? 'Resources indicate their author or rights holder, community context, language, authorization status, and access tier (Public, Authorized Members, or Restricted).'
              : 'Chaque ressource mentionne son détenteur, son contexte communautaire, sa langue, son statut d’autorisation et son niveau d’accès (Public, Membres autorisés ou Accès restreint).'}
          </p>
        </header>

        {/* Search & Filters */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4 border-b border-[var(--color-ivory-border)] pb-6">
          <div className="md:col-span-5 relative">
            <label htmlFor="media-search" className="sr-only">
              {lang === 'en' ? 'Search resources' : 'Rechercher une ressource'}
            </label>
            <Search className="w-4 h-4 text-[var(--color-muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              id="media-search"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={
                lang === 'en'
                  ? 'Search by title, theme, speaker, language…'
                  : 'Rechercher par titre, thème, intervenant, langue…'
              }
              className="w-full pl-10 pr-4 py-2.5 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)] text-[var(--color-ink)]"
            />
          </div>

          <div className="md:col-span-3">
            <select
              aria-label={lang === 'en' ? 'Format filter' : 'Format'}
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
            >
              <option value="all">{lang === 'en' ? 'All formats' : 'Tous les formats'}</option>
              <option value="video">{lang === 'en' ? 'Videos' : 'Vidéos'}</option>
              <option value="article">{lang === 'en' ? 'Articles' : 'Articles'}</option>
              <option value="interview">{lang === 'en' ? 'Interviews' : 'Entretiens'}</option>
              <option value="audio">Audio</option>
              <option value="gallery">{lang === 'en' ? 'Galleries' : 'Galeries'}</option>
              <option value="document">Documents</option>
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              aria-label={lang === 'en' ? 'Language filter' : 'Langue'}
              value={languageFilter}
              onChange={(e) => setLanguageFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
            >
              {languages.map((l) => (
                <option key={l} value={l}>
                  {l === 'all' ? (lang === 'en' ? 'All languages' : 'Toutes langues') : l}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <select
              aria-label={lang === 'en' ? 'Access level' : 'Niveau d’accès'}
              value={accessFilter}
              onChange={(e) => setAccessFilter(e.target.value)}
              className="w-full px-3 py-2.5 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
            >
              <option value="all">{lang === 'en' ? 'All access' : 'Tous accès'}</option>
              <option value="public">{t.common.publicAccess}</option>
              <option value="member">{t.common.memberAccess}</option>
              <option value="restricted">{t.common.restrictedAccess}</option>
            </select>
          </div>
        </div>

        {loading ? (
          <p className="text-sm text-[var(--color-muted)]">{t.common.loading}</p>
        ) : paginated.length === 0 ? (
          <p className="text-sm text-[var(--color-muted)]">{t.common.noResults}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginated.map((m) => (
              <article
                key={m.id}
                className="border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)]/30 flex flex-col justify-between"
              >
                <div>
                  {m.thumbnail_url ? (
                    <ResilientImage
                      src={m.thumbnail_url}
                      alt={lang === 'en' ? m.title_en : m.title_fr}
                      aspectClass="aspect-[16/10]"
                    />
                  ) : (
                    <div className="aspect-[16/10] bg-[var(--color-ivory-soft)] border-b border-[var(--color-ivory-border)] flex flex-col justify-between p-5 hairline-grid-bg">
                      <span className="text-xs uppercase tracking-widest text-[var(--color-muted)]">
                        {m.category} · {m.theme}
                      </span>
                      <span className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
                        {m.access_level === 'public'
                          ? t.common.publicAccess
                          : m.access_level === 'member'
                            ? t.common.memberAccess
                            : t.common.restrictedAccess}
                      </span>
                    </div>
                  )}

                  <div className="p-6 space-y-3">
                    <p className="text-xs uppercase tracking-wider text-[var(--color-muted)] tabular-nums">
                      {m.category} · {m.language} · {formatLocalizedDate(m.published_date, lang)}
                    </p>
                    <h2 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
                      <Link to={`/mediatheque/${m.slug}`} className="hover:text-[var(--color-terracotta)]">
                        {lang === 'en' ? m.title_en : m.title_fr}
                      </Link>
                    </h2>
                    <p className="text-sm text-[var(--color-ink)]/80 leading-relaxed">
                      {lang === 'en' ? m.summary_en : m.summary_fr}
                    </p>
                  </div>
                </div>

                <div className="px-6 py-4 border-t border-[var(--color-ivory-border)] flex items-center justify-between text-xs">
                  <span className="inline-flex items-center gap-1.5 text-[var(--color-terracotta)] font-medium">
                    {!m.access_granted && <Lock className="w-3.5 h-3.5" />}
                    {m.access_level === 'public'
                      ? t.common.publicAccess
                      : m.access_level === 'member'
                        ? t.common.memberAccess
                        : t.common.restrictedAccess}
                  </span>
                  <Link
                    to={`/mediatheque/${m.slug}`}
                    className="font-medium text-[var(--color-earth-dark)] hover:underline"
                  >
                    {m.access_granted
                      ? lang === 'en'
                        ? 'Open resource'
                        : 'Consulter'
                      : lang === 'en'
                        ? 'Access conditions'
                        : 'Conditions d’accès'}
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 pt-4">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setPage(n)}
                className={`w-9 h-9 text-xs font-medium tabular-nums ${
                  n === page
                    ? 'bg-[var(--color-earth-dark)] text-[var(--color-ivory)]'
                    : 'border border-[var(--color-ivory-border)] hover:bg-[var(--color-ivory-soft)]'
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        )}
      </div>
    </>
  );
}
