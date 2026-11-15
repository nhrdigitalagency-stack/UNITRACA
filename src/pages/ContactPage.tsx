import React, { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.tsx';
import { apiRequest } from '../lib/api.ts';
import { PageMeta } from '../components/PageMeta.tsx';
import { EthicalNotice } from '../components/EthicalNotice.tsx';

export function ContactPage() {
  const { lang, settings } = useApp();
  const [searchParams] = useSearchParams();
  const initialType = (searchParams.get('type') as 'general' | 'media_correction' | 'media_removal' | 'validation') || 'general';
  const initialRef = searchParams.get('ref') || '';

  const [requestType, setRequestType] = useState<'general' | 'media_correction' | 'media_removal' | 'validation'>(initialType);
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [subject, setSubject] = useState(initialRef ? `Référence : ${initialRef}` : '');
  const [relatedUrl, setRelatedUrl] = useState(initialRef);
  const [message, setMessage] = useState('');
  const [consentData, setConsentData] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [sentId, setSentId] = useState<number | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await apiRequest<{ id: number }>('/api/contact', {
        method: 'POST',
        body: JSON.stringify({
          request_type: requestType,
          sender_name: senderName,
          sender_email: senderEmail,
          subject,
          related_url: relatedUrl,
          message,
          consent_data: consentData,
        }),
      });
      setSentId(res.id);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageMeta
        titleFr="Contact et demandes de rectification | UNITRACA"
        titleEn="Contact & Correction Requests | UNITRACA"
        descriptionFr="Contacter UNITRACA, vérifier les canaux numériques ou soumettre une demande de correction ou de retrait de média."
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-12">
        <header className="max-w-3xl space-y-4 border-b border-[var(--color-ivory-border)] pb-8">
          <p className="text-xs uppercase tracking-widest text-[var(--color-terracotta)]">
            {lang === 'en' ? 'Contact & Governance' : 'Contact & Rectification'}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[var(--color-earth-dark)]">
            {lang === 'en' ? 'Contact & Media Rights Requests' : 'Contacter UNITRACA'}
          </h1>
          <p className="text-base leading-relaxed text-[var(--color-ink)]/85">
            {lang === 'en'
              ? 'Only verified channels provided in source communications are listed. No unverified phone number, street address, or social profile is displayed.'
              : 'Seuls les liens fournis dans les communications transmises sont affichés. Aucun numéro de téléphone, adresse physique, compte Instagram ou WhatsApp non validé n’est inventé.'}
          </p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-5 space-y-6">
            <div className="border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)] p-6 space-y-4">
              <h2 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
                {lang === 'en' ? 'Provided Digital Channels' : 'Canaux numériques transmis'}
              </h2>
              <ul className="space-y-3 text-sm">
                {settings?.social.youtube_url && (
                  <li>
                    <span className="block text-xs text-[var(--color-muted)]">YouTube</span>
                    <a
                      href={settings.social.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-terracotta)] hover:underline break-all"
                    >
                      {settings.social.youtube_url}
                    </a>
                  </li>
                )}
                {settings?.social.facebook_url && (
                  <li>
                    <span className="block text-xs text-[var(--color-muted)]">Facebook</span>
                    <a
                      href={settings.social.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-terracotta)] hover:underline break-all"
                    >
                      {settings.social.facebook_url}
                    </a>
                  </li>
                )}
              </ul>
              <p className="text-xs text-[var(--color-muted)] leading-relaxed pt-2 border-t border-[var(--color-ivory-border)]">
                {lang === 'en'
                  ? 'Links pending confirmation with UNITRACA. Physical location map is hidden because no official address has been authenticated yet.'
                  : 'Ces deux liens doivent être vérifiés avec l’organisation avant publication finale. Aucune carte géographique n’est affichée en l’absence d’adresse physique authentifiée.'}
              </p>
            </div>

            <EthicalNotice
              variant="provisional"
              customText={
                lang === 'en'
                  ? 'Knowledge holders or depicted individuals can request the immediate correction or removal of any text or media via this form.'
                  : 'Tout détenteur de droits, communauté ou personne représentée peut demander la rectification ou le retrait immédiat d’un contenu ou d’une image via ce formulaire.'
              }
            />
          </div>

          <div className="lg:col-span-7">
            {sentId ? (
              <div className="border border-[var(--color-forest)] bg-[var(--color-ivory-soft)] p-8 space-y-3">
                <p className="text-xs uppercase tracking-widest text-[var(--color-forest)] font-medium">
                  {lang === 'en' ? 'Message Saved' : 'Message enregistré'}
                </p>
                <h2 className="font-display text-3xl font-semibold text-[var(--color-earth-dark)]">
                  {lang === 'en' ? `Ticket #${sentId} recorded` : `Demande n° ${sentId} enregistrée`}
                </h2>
                <p className="text-sm text-[var(--color-ink)]/85">
                  {lang === 'en'
                    ? 'Your message has been stored securely for review by UNITRACA administrators.'
                    : 'Votre message a bien été enregistré et transmis au tableau de suivi de l’administration UNITRACA.'}
                </p>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)]/30 p-6 sm:p-8 space-y-5">
                {error && (
                  <div role="alert" className="border border-[var(--color-terracotta)] bg-[var(--color-terracotta)]/10 p-4 text-sm text-[var(--color-terracotta)]">
                    {error}
                  </div>
                )}

                <div>
                  <label htmlFor="contact-type" className="block text-xs font-medium text-[var(--color-earth-dark)] mb-1.5">
                    {lang === 'en' ? 'Request type' : 'Nature de la demande'}
                  </label>
                  <select
                    id="contact-type"
                    value={requestType}
                    onChange={(e) => setRequestType(e.target.value as typeof requestType)}
                    className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                  >
                    <option value="general">{lang === 'en' ? 'General inquiry' : 'Renseignement général'}</option>
                    <option value="validation">{lang === 'en' ? 'Official organizational validation' : 'Validation officielle de données UNITRACA'}</option>
                    <option value="media_correction">{lang === 'en' ? 'Content or attribution correction' : 'Demande de correction ou précision'}</option>
                    <option value="media_removal">{lang === 'en' ? 'Media or image removal request' : 'Demande de retrait de média ou d’image'}</option>
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-medium text-[var(--color-earth-dark)] mb-1.5">
                      {lang === 'en' ? 'Full name *' : 'Nom complet *'}
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      required
                      value={senderName}
                      onChange={(e) => setSenderName(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                    />
                  </div>
                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-medium text-[var(--color-earth-dark)] mb-1.5">
                      {lang === 'en' ? 'Email *' : 'E-mail *'}
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      required
                      value={senderEmail}
                      onChange={(e) => setSenderEmail(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block text-xs font-medium text-[var(--color-earth-dark)] mb-1.5">
                    {lang === 'en' ? 'Subject *' : 'Objet *'}
                  </label>
                  <input
                    id="contact-subject"
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                  />
                </div>

                <div>
                  <label htmlFor="contact-ref" className="block text-xs font-medium text-[var(--color-earth-dark)] mb-1.5">
                    {lang === 'en' ? 'Concerned page or media reference (optional)' : 'Page ou média concerné (facultatif)'}
                  </label>
                  <input
                    id="contact-ref"
                    type="text"
                    value={relatedUrl}
                    onChange={(e) => setRelatedUrl(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                  />
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-medium text-[var(--color-earth-dark)] mb-1.5">
                    {lang === 'en' ? 'Message *' : 'Message *'}
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                  />
                </div>

                <label className="flex items-start gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={consentData}
                    onChange={(e) => setConsentData(e.target.checked)}
                    required
                    className="mt-1"
                  />
                  <span className="text-xs leading-relaxed text-[var(--color-ink)]/85">
                    {lang === 'en'
                      ? 'I agree that this information is recorded to process my request.'
                      : 'J’accepte que ces informations soient enregistrées pour le traitement de ma demande.'}
                  </span>
                </label>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-3 text-sm font-medium bg-[var(--color-earth-dark)] text-[var(--color-ivory)] hover:bg-[var(--color-terracotta)] transition-colors disabled:opacity-50"
                >
                  {submitting
                    ? lang === 'en'
                      ? 'Sending…'
                      : 'Envoi en cours…'
                    : lang === 'en'
                      ? 'Send message'
                      : 'Envoyer la demande'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
