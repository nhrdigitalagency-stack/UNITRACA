import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ExternalLink, Lock } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { apiRequest } from '../lib/api.ts';
import { formatLocalizedDate, getT } from '../i18n/translations.ts';
import { PageMeta } from '../components/PageMeta.tsx';
import { EthicalNotice } from '../components/EthicalNotice.tsx';
import { ResilientImage } from '../components/ResilientImage.tsx';
import type { MediaResourceItem } from '../types/unitraca.ts';

export function MediaDetailPage() {
  const { slug } = useParams();
  const { lang, user } = useApp();
  const t = getT(lang);
  const [item, setItem] = useState<MediaResourceItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showTranscript, setShowTranscript] = useState(false);

  useEffect(() => {
    if (!slug) return;
    apiRequest<MediaResourceItem>(`/api/mediatheque/${slug}`)
      .then((data) => {
        setItem(data);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message);
        setLoading(false);
      });
  }, [slug, user]);

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
        <p className="text-base text-[var(--color-terracotta)]">{error || 'Ressource introuvable.'}</p>
        <Link to="/mediatheque" className="text-sm font-medium underline">
          {t.nav.media}
        </Link>
      </div>
    );
  }

  const title = lang === 'en' ? item.title_en : item.title_fr;
  const summary = lang === 'en' ? item.summary_en : item.summary_fr;
  const body = lang === 'en' ? item.body_en : item.body_fr;
  const transcript = lang === 'en' ? item.transcript_en : item.transcript_fr;

  const isYoutubeVideoEmbed =
    item.embed_url &&
    (item.embed_url.includes('youtube.com/embed/') || item.embed_url.includes('youtu.be/'));

  return (
    <>
      <PageMeta titleFr={`${title} | Médiathèque UNITRACA`} descriptionFr={summary} />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-10">
        <nav aria-label="Breadcrumb" className="text-xs text-[var(--color-muted)]">
          <Link to="/mediatheque" className="hover:underline">
            {t.nav.media}
          </Link>{' '}
          / <span>{title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-8 space-y-8">
            <header className="space-y-4 border-b border-[var(--color-ivory-border)] pb-8">
              <p className="text-xs uppercase tracking-widest text-[var(--color-terracotta)] tabular-nums">
                {item.category} · {item.theme} · {formatLocalizedDate(item.published_date, lang)}
              </p>
              <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[var(--color-earth-dark)]">
                {title}
              </h1>
              <p className="text-base leading-relaxed text-[var(--color-ink)]/90">{summary}</p>
            </header>

            {item.health_disclaimer_required && <EthicalNotice variant="health" />}

            {!item.access_granted ? (
              <div className="border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)] p-8 space-y-5">
                <div className="flex items-center gap-3 text-[var(--color-terracotta)]">
                  <Lock className="w-5 h-5" />
                  <h2 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
                    {item.access_level === 'member'
                      ? lang === 'en'
                        ? 'Member Authentication Required'
                        : 'Contenu réservé aux membres autorisés'
                      : lang === 'en'
                        ? 'Restricted Access — Administrator Approval Required'
                        : 'Accès restreint — Autorisation d’un responsable requise'}
                  </h2>
                </div>
                <p className="text-sm leading-relaxed text-[var(--color-ink)]/85">
                  {item.access_level === 'member'
                    ? lang === 'en'
                      ? 'This resource is not exposed in public payloads. Sign in to your UNITRACA member account to view it.'
                      : 'Ce contenu protégé n’est pas transmis publiquement. Connectez-vous à votre espace membre pour y accéder.'
                    : lang === 'en'
                      ? 'This archive is restricted by cultural protection governance. Only accounts explicitly authorized by an administrator can load its content from the server.'
                      : 'Cette archive relève de la gouvernance de protection des savoirs. Seuls les comptes ayant reçu une autorisation nominative d’un responsable peuvent la charger depuis le serveur.'}
                </p>
                <div className="flex flex-wrap gap-3">
                  <Link
                    to="/espace-membre"
                    className="px-5 py-2.5 text-sm font-medium bg-[var(--color-forest)] text-[var(--color-ivory)] hover:bg-[var(--color-earth-dark)] transition-colors"
                  >
                    {t.nav.memberSpace}
                  </Link>
                  <Link
                    to="/contact"
                    className="px-5 py-2.5 text-sm font-medium border border-[var(--color-earth-dark)] text-[var(--color-earth-dark)] hover:bg-[var(--color-ivory)] transition-colors"
                  >
                    {lang === 'en' ? 'Request access' : 'Demander une autorisation'}
                  </Link>
                </div>
              </div>
            ) : (
              <div className="space-y-8">
                {item.thumbnail_url && !isYoutubeVideoEmbed && (
                  <ResilientImage
                    src={item.thumbnail_url}
                    alt={title}
                    caption={item.credit}
                    aspectClass="aspect-[16/9]"
                  />
                )}

                {isYoutubeVideoEmbed && (
                  <div className="aspect-video border border-[var(--color-ivory-border)] bg-black">
                    <iframe
                      src={item.embed_url}
                      title={title}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                )}

                {item.embed_url && !isYoutubeVideoEmbed && (
                  <div className="border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)]/60 p-5 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <p className="text-xs uppercase tracking-wider text-[var(--color-muted)]">
                        {lang === 'en' ? 'Authorized external channel' : 'Lien externe référencé'}
                      </p>
                      <p className="text-sm font-medium text-[var(--color-earth-dark)]">{item.embed_url}</p>
                    </div>
                    <a
                      href={item.embed_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 text-xs font-medium bg-[var(--color-earth-dark)] text-[var(--color-ivory)] hover:bg-[var(--color-terracotta)] transition-colors"
                    >
                      {lang === 'en' ? 'Open official link' : 'Ouvrir sur la plateforme'}
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>
                )}

                {body && (
                  <div className="space-y-4 text-base leading-relaxed text-[var(--color-ink)]/90 whitespace-pre-line max-w-2xl">
                    {body}
                  </div>
                )}

                {transcript && (
                  <div className="border-t border-[var(--color-ivory-border)] pt-6 space-y-3">
                    <button
                      type="button"
                      onClick={() => setShowTranscript((v) => !v)}
                      aria-expanded={showTranscript}
                      className="px-4 py-2 text-xs font-medium border border-[var(--color-earth-dark)] text-[var(--color-earth-dark)] hover:bg-[var(--color-ivory-soft)]"
                    >
                      {showTranscript
                        ? lang === 'en'
                          ? 'Hide transcript'
                          : 'Masquer la transcription'
                        : lang === 'en'
                          ? 'Show transcript'
                          : 'Afficher la transcription'}
                    </button>
                    {showTranscript && (
                      <div className="p-5 border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)]/50 text-sm leading-relaxed whitespace-pre-line">
                        {transcript}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Cultural Protection & Rights Accession Grid */}
          <aside className="lg:col-span-4 space-y-6">
            <div className="border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)] p-6 space-y-4">
              <h2 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
                {lang === 'en' ? 'Rights & Provenance' : 'Droits et provenance'}
              </h2>
              <dl className="divide-y divide-[var(--color-ivory-border)] text-sm">
                <div className="py-2.5">
                  <dt className="text-xs text-[var(--color-muted)]">{lang === 'en' ? 'Author / Holder' : 'Auteur ou détenteur'}</dt>
                  <dd className="font-medium">{item.holder_or_author}</dd>
                </div>
                <div className="py-2.5">
                  <dt className="text-xs text-[var(--color-muted)]">{lang === 'en' ? 'Community / Context' : 'Communauté ou contexte'}</dt>
                  <dd>{item.community_context}</dd>
                </div>
                <div className="py-2.5">
                  <dt className="text-xs text-[var(--color-muted)]">{lang === 'en' ? 'Language' : 'Langue'}</dt>
                  <dd>{item.language}</dd>
                </div>
                <div className="py-2.5">
                  <dt className="text-xs text-[var(--color-muted)]">{lang === 'en' ? 'Authorization' : 'Autorisation'}</dt>
                  <dd className="text-[var(--color-terracotta)] font-medium">
                    {item.authorization_status === 'authorized'
                      ? lang === 'en'
                        ? 'Authorized'
                        : 'Autorisée'
                      : item.authorization_status === 'restricted_rights'
                        ? lang === 'en'
                          ? 'Restricted rights'
                          : 'Droits restreints'
                        : lang === 'en'
                          ? 'Pending validation'
                          : 'En attente de validation'}
                  </dd>
                </div>
                <div className="py-2.5">
                  <dt className="text-xs text-[var(--color-muted)]">{lang === 'en' ? 'Diffusion terms' : 'Conditions de diffusion'}</dt>
                  <dd className="text-xs leading-relaxed">{item.diffusion_conditions}</dd>
                </div>
                <div className="py-2.5">
                  <dt className="text-xs text-[var(--color-muted)]">{lang === 'en' ? 'Credit' : 'Crédit'}</dt>
                  <dd>{item.credit}</dd>
                </div>
              </dl>

              <div className="pt-2 border-t border-[var(--color-ivory-border)]">
                <Link
                  to={`/contact?type=media_removal&ref=${encodeURIComponent(item.slug)}`}
                  className="text-xs font-medium text-[var(--color-terracotta)] hover:underline"
                >
                  {lang === 'en'
                    ? 'Request correction or removal of this media →'
                    : 'Demander une rectification ou un retrait de ce média →'}
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </>
  );
}
