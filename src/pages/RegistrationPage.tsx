import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useApp } from '../context/AppContext.tsx';
import { apiRequest } from '../lib/api.ts';
import { PageMeta } from '../components/PageMeta.tsx';
import { EthicalNotice } from '../components/EthicalNotice.tsx';
import type { TeachingItem } from '../types/unitraca.ts';

export function RegistrationPage() {
  const { lang, user } = useApp();
  const [searchParams] = useSearchParams();
  const initialTeachingId = searchParams.get('teaching') || '';

  const [teachings, setTeachings] = useState<TeachingItem[]>([]);
  const [teachingId, setTeachingId] = useState(initialTeachingId);
  const [lastName, setLastName] = useState('');
  const [firstName, setFirstName] = useState(user?.preferred_name || user?.full_name || '');
  const [country, setCountry] = useState(user?.country || '');
  const [city, setCity] = useState(user?.city || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState('');
  const [requestedLanguage, setRequestedLanguage] = useState(lang === 'en' ? 'English' : 'Français');
  const [requestedFormat, setRequestedFormat] = useState('En ligne');
  const [message, setMessage] = useState('');
  const [isAdult, setIsAdult] = useState(true);
  const [minorGuardianNote, setMinorGuardianNote] = useState('');
  const [consentData, setConsentData] = useState(false);
  const [consentRules, setConsentRules] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [submittedRecord, setSubmittedRecord] = useState<{ id: number; status: string } | null>(null);

  useEffect(() => {
    apiRequest<TeachingItem[]>('/api/teachings')
      .then(setTeachings)
      .catch(() => {});
  }, []);

  useEffect(() => {
    if (user) {
      if (!email) setEmail(user.email);
      if (!firstName) setFirstName(user.preferred_name || user.full_name);
      if (!country) setCountry(user.country);
      if (!city) setCity(user.city);
    }
  }, [user]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSubmitting(true);
    try {
      const res = await apiRequest<{ id: number; status: string }>('/api/registrations', {
        method: 'POST',
        body: JSON.stringify({
          teaching_id: teachingId ? Number(teachingId) : null,
          last_name: lastName,
          first_name: firstName,
          country,
          city,
          email,
          phone,
          requested_language: requestedLanguage,
          requested_format: requestedFormat,
          message,
          is_adult: isAdult,
          minor_guardian_note: isAdult ? '' : minorGuardianNote,
          consent_data: consentData,
          consent_rules: consentRules,
        }),
      });
      setSubmittedRecord(res);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <>
      <PageMeta
        titleFr="Demande d’inscription | UNITRACA"
        titleEn="Enrollment Request | UNITRACA"
        descriptionFr="Formulaire de demande d’inscription aux enseignements d’UNITRACA. Collecte minimale de données et examen par l’équipe responsable."
      />

      <div className="max-w-[960px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-8">
        <header className="space-y-3 border-b border-[var(--color-ivory-border)] pb-8">
          <p className="text-xs uppercase tracking-widest text-[var(--color-terracotta)]">
            {lang === 'en' ? 'Enrollment Procedure' : 'Procédure d’inscription'}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[var(--color-earth-dark)]">
            {lang === 'en' ? 'Submit an Enrollment Request' : 'Demande d’inscription'}
          </h1>
          <p className="text-sm sm:text-base text-[var(--color-ink)]/85 leading-relaxed">
            {lang === 'en'
              ? 'Submitting this form records a pending request. It does not constitute confirmed admission, and no sensitive medical or intimate personal details are ever requested.'
              : 'L’envoi de ce formulaire enregistre une demande en attente d’examen. Il ne vaut pas admission confirmée. Aucun diagnostic médical ni aucune information intime n’est demandé.'}
          </p>
        </header>

        <EthicalNotice
          variant="provisional"
          customText={
            lang === 'en'
              ? 'No online payment is collected on this form while fee schedules remain to be validated by UNITRACA.'
              : 'Aucun paiement n’est demandé via ce formulaire tant que les tarifs et modalités n’ont pas été validés par UNITRACA.'
          }
        />

        {submittedRecord ? (
          <div className="border border-[var(--color-forest)] bg-[var(--color-ivory-soft)] p-8 space-y-4">
            <p className="text-xs uppercase tracking-widest text-[var(--color-forest)] font-semibold">
              {lang === 'en' ? 'Request Recorded' : 'Demande enregistrée'}
            </p>
            <h2 className="font-display text-3xl font-semibold text-[var(--color-earth-dark)]">
              {lang === 'en'
                ? `Reference #${submittedRecord.id} — Status: Pending review`
                : `Dossier n° ${submittedRecord.id} — Statut : En attente d’examen`}
            </h2>
            <p className="text-sm leading-relaxed text-[var(--color-ink)]/85">
              {lang === 'en'
                ? 'Your request has been saved in our database. An administrator will review it and update its status. You can track your requests in your Member Space if you sign in with the same email.'
                : 'Votre demande a bien été enregistrée en base de données. Elle sera examinée par un responsable d’UNITRACA. Vous pouvez en suivre l’évolution dans votre Espace membre avec la même adresse e-mail.'}
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/espace-membre"
                className="px-5 py-2.5 text-sm font-medium bg-[var(--color-forest)] text-[var(--color-ivory)]"
              >
                {lang === 'en' ? 'Go to Member Space' : 'Accéder à l’Espace membre'}
              </Link>
              <Link
                to="/enseignements"
                className="px-5 py-2.5 text-sm font-medium border border-[var(--color-earth-dark)] text-[var(--color-earth-dark)]"
              >
                {lang === 'en' ? 'Back to Teachings' : 'Retour aux enseignements'}
              </Link>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)]/30 p-6 sm:p-8">
            {error && (
              <div role="alert" className="border border-[var(--color-terracotta)] bg-[var(--color-terracotta)]/10 p-4 text-sm text-[var(--color-terracotta)]">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="reg-last-name" className="block text-xs font-medium text-[var(--color-earth-dark)] mb-1.5">
                  {lang === 'en' ? 'Last name *' : 'Nom *'}
                </label>
                <input
                  id="reg-last-name"
                  type="text"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                />
              </div>
              <div>
                <label htmlFor="reg-first-name" className="block text-xs font-medium text-[var(--color-earth-dark)] mb-1.5">
                  {lang === 'en' ? 'First name or preferred name *' : 'Prénom ou nom d’usage *'}
                </label>
                <input
                  id="reg-first-name"
                  type="text"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="reg-country" className="block text-xs font-medium text-[var(--color-earth-dark)] mb-1.5">
                  {lang === 'en' ? 'Country *' : 'Pays *'}
                </label>
                <input
                  id="reg-country"
                  type="text"
                  required
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                />
              </div>
              <div>
                <label htmlFor="reg-city" className="block text-xs font-medium text-[var(--color-earth-dark)] mb-1.5">
                  {lang === 'en' ? 'City *' : 'Ville *'}
                </label>
                <input
                  id="reg-city"
                  type="text"
                  required
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label htmlFor="reg-email" className="block text-xs font-medium text-[var(--color-earth-dark)] mb-1.5">
                  {lang === 'en' ? 'Email *' : 'E-mail *'}
                </label>
                <input
                  id="reg-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                />
              </div>
              <div>
                <label htmlFor="reg-phone" className="block text-xs font-medium text-[var(--color-earth-dark)] mb-1.5">
                  {lang === 'en' ? 'Phone (optional)' : 'Téléphone (facultatif)'}
                </label>
                <input
                  id="reg-phone"
                  type="tel"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
              <div className="sm:col-span-1">
                <label htmlFor="reg-teaching" className="block text-xs font-medium text-[var(--color-earth-dark)] mb-1.5">
                  {lang === 'en' ? 'Requested teaching' : 'Enseignement demandé'}
                </label>
                <select
                  id="reg-teaching"
                  value={teachingId}
                  onChange={(e) => setTeachingId(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                >
                  <option value="">{lang === 'en' ? 'General inquiry' : 'Demande générale d’orientation'}</option>
                  {teachings.map((item) => (
                    <option key={item.id} value={item.id}>
                      {lang === 'en' ? item.title_en : item.title_fr}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="reg-lang" className="block text-xs font-medium text-[var(--color-earth-dark)] mb-1.5">
                  {lang === 'en' ? 'Language *' : 'Langue souhaitée *'}
                </label>
                <select
                  id="reg-lang"
                  value={requestedLanguage}
                  onChange={(e) => setRequestedLanguage(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                >
                  <option value="Français">Français</option>
                  <option value="English">English</option>
                </select>
              </div>
              <div>
                <label htmlFor="reg-format" className="block text-xs font-medium text-[var(--color-earth-dark)] mb-1.5">
                  {lang === 'en' ? 'Preferred format *' : 'Format souhaité *'}
                </label>
                <select
                  id="reg-format"
                  value={requestedFormat}
                  onChange={(e) => setRequestedFormat(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                >
                  <option value="En ligne">{lang === 'en' ? 'Online' : 'En ligne'}</option>
                  <option value="Présentiel (si confirmé)">
                    {lang === 'en' ? 'In-person (once confirmed)' : 'Présentiel (si confirmé)'}
                  </option>
                  <option value="Indifférent">{lang === 'en' ? 'Either' : 'Indifférent'}</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="reg-message" className="block text-xs font-medium text-[var(--color-earth-dark)] mb-1.5">
                {lang === 'en'
                  ? 'Optional message (please do not enter health or confidential family details)'
                  : 'Message facultatif (merci de ne mentionner aucune donnée médicale ou confidentielle)'}
              </label>
              <textarea
                id="reg-message"
                rows={4}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
              />
            </div>

            {/* Age & Minor guardian procedure */}
            <div className="border-t border-[var(--color-ivory-border)] pt-5 space-y-3">
              <p className="text-xs font-medium text-[var(--color-earth-dark)]">
                {lang === 'en' ? 'Age eligibility' : 'Condition d’âge'}
              </p>
              <div className="flex flex-wrap gap-6 text-sm">
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="age_mode" checked={isAdult} onChange={() => setIsAdult(true)} />
                  <span>{lang === 'en' ? 'I am an adult (18+)' : 'Je suis majeur(e) (18 ans ou plus)'}</span>
                </label>
                <label className="inline-flex items-center gap-2 cursor-pointer">
                  <input type="radio" name="age_mode" checked={!isAdult} onChange={() => setIsAdult(false)} />
                  <span>
                    {lang === 'en'
                      ? 'Minor applicant (requires legal guardian procedure)'
                      : 'Personne mineure (procédure avec représentant légal)'}
                  </span>
                </label>
              </div>

              {!isAdult && (
                <div>
                  <label htmlFor="reg-guardian" className="block text-xs font-medium text-[var(--color-terracotta)] mb-1.5">
                    {lang === 'en'
                      ? 'Legal guardian full name and explicit authorization note *'
                      : 'Identité du représentant légal et précision sur l’autorisation parentale *'}
                  </label>
                  <input
                    id="reg-guardian"
                    type="text"
                    required={!isAdult}
                    value={minorGuardianNote}
                    onChange={(e) => setMinorGuardianNote(e.target.value)}
                    placeholder={
                      lang === 'en'
                        ? 'Full name of legal guardian and contact email'
                        : 'Nom du parent ou tuteur légal et e-mail de confirmation'
                    }
                    className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                  />
                </div>
              )}
            </div>

            {/* Consents */}
            <div className="border-t border-[var(--color-ivory-border)] pt-5 space-y-3 text-sm">
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
                    ? 'I consent to UNITRACA processing this minimal request data solely to review my enrollment inquiry, in accordance with the Privacy Policy.'
                    : 'J’accepte que mes données strictement nécessaires soient enregistrées pour l’examen de ma demande, conformément à la notice de confidentialité.'}
                </span>
              </label>

              <label className="flex items-start gap-2.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={consentRules}
                  onChange={(e) => setConsentRules(e.target.checked)}
                  required
                  className="mt-1"
                />
                <span className="text-xs leading-relaxed text-[var(--color-ink)]/85">
                  {lang === 'en'
                    ? 'I acknowledge that submitting a request does not guarantee admission, awards no state-recognized diploma, and does not constitute medical advice.'
                    : 'Je reconnais que cette demande ne vaut pas admission confirmée, ne délivre aucun diplôme reconnu et ne constitue aucun avis médical.'}
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-3 text-sm font-medium bg-[var(--color-forest)] text-[var(--color-ivory)] hover:bg-[var(--color-earth-dark)] transition-colors disabled:opacity-50"
            >
              {submitting
                ? lang === 'en'
                  ? 'Saving request…'
                  : 'Enregistrement en cours…'
                : lang === 'en'
                  ? 'Submit enrollment request'
                  : 'Enregistrer ma demande'}
            </button>
          </form>
        )}
      </div>
    </>
  );
}
