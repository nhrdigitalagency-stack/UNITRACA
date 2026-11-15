import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.tsx';
import { apiRequest } from '../lib/api.ts';
import { formatLocalizedDate, getT } from '../i18n/translations.ts';
import { PageMeta } from '../components/PageMeta.tsx';
import type {
  AdminMessageItem,
  EventItem,
  MediaResourceItem,
  RegistrationRequestItem,
  UserProfile,
} from '../types/unitraca.ts';

interface MemberOverviewData {
  registrations: RegistrationRequestItem[];
  accessibleResources: MediaResourceItem[];
  messages: AdminMessageItem[];
  calendarEvents: EventItem[];
}

export function MemberSpacePage() {
  const { lang, user, authLoading, refreshUser, logout } = useApp();
  const t = getT(lang);

  const [authTab, setAuthTab] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [preferredName, setPreferredName] = useState('');
  const [country, setCountry] = useState('');
  const [city, setCity] = useState('');
  const [consentData, setConsentData] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authBusy, setAuthBusy] = useState(false);

  const [overview, setOverview] = useState<MemberOverviewData | null>(null);
  const [loadingOverview, setLoadingOverview] = useState(false);

  const [profileForm, setProfileForm] = useState({
    full_name: '',
    preferred_name: '',
    country: '',
    city: '',
    preferred_language: 'fr' as 'fr' | 'en',
  });
  const [profileNotice, setProfileNotice] = useState('');

  const loadOverview = useCallback(async () => {
    if (!user) return;
    setLoadingOverview(true);
    try {
      const data = await apiRequest<MemberOverviewData>('/api/member/overview');
      setOverview(data);
    } catch {
      setOverview(null);
    } finally {
      setLoadingOverview(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      setProfileForm({
        full_name: user.full_name,
        preferred_name: user.preferred_name,
        country: user.country,
        city: user.city,
        preferred_language: user.preferred_language,
      });
      loadOverview();
    } else {
      setOverview(null);
    }
  }, [user, loadOverview]);

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError('');
    setAuthBusy(true);
    try {
      await apiRequest<{ user: UserProfile }>('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password }),
      });
      await refreshUser();
    } catch (err) {
      setAuthError((err as Error).message);
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();
    setAuthError('');
    setAuthBusy(true);
    try {
      await apiRequest<{ user: UserProfile }>('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({
          email,
          password,
          full_name: fullName,
          preferred_name: preferredName,
          country,
          city,
          preferred_language: lang,
          consent_data: consentData,
        }),
      });
      await refreshUser();
    } catch (err) {
      setAuthError((err as Error).message);
    } finally {
      setAuthBusy(false);
    }
  }

  async function handleProfileUpdate(e: React.FormEvent) {
    e.preventDefault();
    setProfileNotice('');
    try {
      await apiRequest('/api/auth/profile', {
        method: 'PATCH',
        body: JSON.stringify(profileForm),
      });
      await refreshUser();
      setProfileNotice(lang === 'en' ? 'Profile updated.' : 'Profil mis à jour.');
    } catch (err) {
      setProfileNotice((err as Error).message);
    }
  }

  async function handleCancelRegistration(id: number) {
    await apiRequest(`/api/member/registrations/${id}/cancel`, { method: 'PATCH' });
    await loadOverview();
  }

  async function handleMarkRead(id: number) {
    await apiRequest(`/api/member/messages/${id}/read`, { method: 'PATCH' });
    await loadOverview();
  }

  return (
    <>
      <PageMeta
        titleFr="Espace membre | UNITRACA"
        titleEn="Member Space | UNITRACA"
        descriptionFr="Espace privé des membres UNITRACA : suivi des demandes, ressources autorisées, calendrier et messages administratifs."
        noIndex
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-10">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--color-ivory-border)] pb-8">
          <div className="space-y-2">
            <p className="text-xs uppercase tracking-widest text-[var(--color-terracotta)]">
              {t.nav.memberSpace}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[var(--color-earth-dark)]">
              {user
                ? `${lang === 'en' ? 'Welcome,' : 'Bienvenue,'} ${user.preferred_name || user.full_name}`
                : lang === 'en'
                  ? 'Member Authentication'
                  : 'Connexion à l’espace membre'}
            </h1>
          </div>

          {user && (
            <div className="flex flex-wrap items-center gap-3">
              {(user.role === 'admin' || user.role === 'editor') && (
                <Link
                  to="/admin"
                  className="px-4 py-2 text-xs font-medium bg-[var(--color-earth-dark)] text-[var(--color-ivory)]"
                >
                  {t.nav.admin}
                </Link>
              )}
              <button
                type="button"
                onClick={logout}
                className="px-4 py-2 text-xs font-medium border border-[var(--color-earth-dark)] text-[var(--color-earth-dark)] hover:bg-[var(--color-ivory-soft)]"
              >
                {lang === 'en' ? 'Sign out' : 'Se déconnecter'}
              </button>
            </div>
          )}
        </header>

        {authLoading ? (
          <p className="text-sm text-[var(--color-muted)]">{t.common.loading}</p>
        ) : !user ? (
          <div className="max-w-lg mx-auto border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)]/40 p-6 sm:p-8 space-y-6">
            <div className="flex border-b border-[var(--color-ivory-border)]">
              <button
                type="button"
                onClick={() => {
                  setAuthTab('login');
                  setAuthError('');
                }}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  authTab === 'login'
                    ? 'border-[var(--color-terracotta)] text-[var(--color-earth-dark)]'
                    : 'border-transparent text-[var(--color-muted)]'
                }`}
              >
                {lang === 'en' ? 'Sign in' : 'Se connecter'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setAuthTab('register');
                  setAuthError('');
                }}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors ${
                  authTab === 'register'
                    ? 'border-[var(--color-terracotta)] text-[var(--color-earth-dark)]'
                    : 'border-transparent text-[var(--color-muted)]'
                }`}
              >
                {lang === 'en' ? 'Create member account' : 'Créer un compte membre'}
              </button>
            </div>

            {authError && (
              <div role="alert" className="border border-[var(--color-terracotta)] bg-[var(--color-terracotta)]/10 p-3 text-sm text-[var(--color-terracotta)]">
                {authError}
              </div>
            )}

            {authTab === 'login' ? (
              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label htmlFor="login-email" className="block text-xs font-medium mb-1">
                    E-mail
                  </label>
                  <input
                    id="login-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                  />
                </div>
                <div>
                  <label htmlFor="login-password" className="block text-xs font-medium mb-1">
                    {lang === 'en' ? 'Password' : 'Mot de passe'}
                  </label>
                  <input
                    id="login-password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={authBusy}
                  className="w-full py-3 text-sm font-medium bg-[var(--color-forest)] text-[var(--color-ivory)] hover:bg-[var(--color-earth-dark)] transition-colors"
                >
                  {authBusy ? '…' : lang === 'en' ? 'Sign in' : 'Connexion'}
                </button>
              </form>
            ) : (
              <form onSubmit={handleRegister} className="space-y-4">
                <div>
                  <label htmlFor="reg-fullname" className="block text-xs font-medium mb-1">
                    {lang === 'en' ? 'Full name *' : 'Nom complet *'}
                  </label>
                  <input
                    id="reg-fullname"
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                  />
                </div>
                <div>
                  <label htmlFor="reg-prefname" className="block text-xs font-medium mb-1">
                    {lang === 'en' ? 'Preferred name' : 'Nom d’usage'}
                  </label>
                  <input
                    id="reg-prefname"
                    type="text"
                    value={preferredName}
                    onChange={(e) => setPreferredName(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label htmlFor="m-country" className="block text-xs font-medium mb-1">
                      {lang === 'en' ? 'Country' : 'Pays'}
                    </label>
                    <input
                      id="m-country"
                      type="text"
                      value={country}
                      onChange={(e) => setCountry(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                    />
                  </div>
                  <div>
                    <label htmlFor="m-city" className="block text-xs font-medium mb-1">
                      {lang === 'en' ? 'City' : 'Ville'}
                    </label>
                    <input
                      id="m-city"
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                    />
                  </div>
                </div>
                <div>
                  <label htmlFor="r-email" className="block text-xs font-medium mb-1">
                    E-mail *
                  </label>
                  <input
                    id="r-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                  />
                </div>
                <div>
                  <label htmlFor="r-pass" className="block text-xs font-medium mb-1">
                    {lang === 'en' ? 'Password (min 8 chars) *' : 'Mot de passe (8 caractères min.) *'}
                  </label>
                  <input
                    id="r-pass"
                    type="password"
                    minLength={8}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-3.5 py-2.5 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                  />
                </div>
                <label className="flex items-start gap-2 text-xs cursor-pointer">
                  <input
                    type="checkbox"
                    required
                    checked={consentData}
                    onChange={(e) => setConsentData(e.target.checked)}
                    className="mt-0.5"
                  />
                  <span>
                    {lang === 'en'
                      ? 'I accept account data processing under the Privacy Notice. Public registration creates a standard member account only.'
                      : 'J’accepte le traitement de mes données conformément à la notice de confidentialité.'}
                  </span>
                </label>
                <button
                  type="submit"
                  disabled={authBusy}
                  className="w-full py-3 text-sm font-medium bg-[var(--color-forest)] text-[var(--color-ivory)] hover:bg-[var(--color-earth-dark)] transition-colors"
                >
                  {authBusy ? '…' : lang === 'en' ? 'Create account' : 'Créer mon compte'}
                </button>
              </form>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left column: Registrations, Authorized Resources, Messages */}
            <div className="lg:col-span-8 space-y-10">
              {/* Enrollment Requests & Validated Enrollments */}
              <section className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
                    {lang === 'en' ? 'My Requests & Validated Enrollments' : 'Mes demandes et inscriptions validées'}
                  </h2>
                  <Link to="/inscription" className="text-xs font-medium text-[var(--color-terracotta)] hover:underline">
                    {lang === 'en' ? '+ New request' : '+ Nouvelle demande'}
                  </Link>
                </div>

                {loadingOverview ? (
                  <p className="text-sm text-[var(--color-muted)]">{t.common.loading}</p>
                ) : !overview || overview.registrations.length === 0 ? (
                  <p className="text-sm text-[var(--color-muted)] border border-[var(--color-ivory-border)] p-5">
                    {lang === 'en' ? 'No enrollment requests linked to this account yet.' : 'Aucune demande d’inscription enregistrée pour ce compte.'}
                  </p>
                ) : (
                  <div className="divide-y divide-[var(--color-ivory-border)] border border-[var(--color-ivory-border)]">
                    {overview.registrations.map((reg) => (
                      <div key={reg.id} className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="space-y-1">
                          <p className="text-xs uppercase tracking-wider text-[var(--color-muted)] tabular-nums">
                            #{reg.id} · {formatLocalizedDate(reg.created_at, lang)} · {reg.requested_format}
                          </p>
                          <h3 className="font-display text-xl font-semibold text-[var(--color-earth-dark)]">
                            {reg.teaching_title || (lang === 'en' ? 'General inquiry' : 'Demande générale')}
                          </h3>
                          <p className="text-xs font-medium text-[var(--color-terracotta)]">
                            {lang === 'en' ? 'Status: ' : 'Statut : '}
                            {reg.status}
                          </p>
                          {reg.admin_notes && (
                            <p className="text-xs text-[var(--color-ink)]/80 pt-1">{reg.admin_notes}</p>
                          )}
                        </div>
                        {['pending', 'under_review'].includes(reg.status) && (
                          <button
                            type="button"
                            onClick={() => handleCancelRegistration(reg.id)}
                            className="px-3 py-1.5 text-xs border border-[var(--color-terracotta)] text-[var(--color-terracotta)] hover:bg-[var(--color-terracotta)]/10 self-start"
                          >
                            {lang === 'en' ? 'Cancel request' : 'Annuler la demande'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Authorized Member & Restricted Resources */}
              <section className="space-y-4">
                <h2 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
                  {lang === 'en' ? 'Authorized Resources & Documents' : 'Ressources et documents autorisés'}
                </h2>
                {!overview || overview.accessibleResources.length === 0 ? (
                  <p className="text-sm text-[var(--color-muted)] border border-[var(--color-ivory-border)] p-5">
                    {lang === 'en' ? 'No member resources unlocked yet.' : 'Aucune ressource réservée disponible.'}
                  </p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                    {overview.accessibleResources.map((res) => (
                      <div key={res.id} className="border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)]/50 p-5 space-y-2">
                        <p className="text-xs uppercase tracking-wider text-[var(--color-forest)]">
                          {res.access_level === 'restricted' ? t.common.restrictedAccess : t.common.memberAccess} · {res.category}
                        </p>
                        <h3 className="font-display text-xl font-semibold text-[var(--color-earth-dark)]">
                          <Link to={`/mediatheque/${res.slug}`} className="hover:text-[var(--color-terracotta)]">
                            {lang === 'en' ? res.title_en : res.title_fr}
                          </Link>
                        </h3>
                        <p className="text-xs text-[var(--color-muted)]">{lang === 'en' ? res.summary_en : res.summary_fr}</p>
                      </div>
                    ))}
                  </div>
                )}
              </section>

              {/* Administrative Messages */}
              <section className="space-y-4">
                <h2 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
                  {lang === 'en' ? 'Administrative Messages' : 'Messages administratifs'}
                </h2>
                {!overview || overview.messages.length === 0 ? (
                  <p className="text-sm text-[var(--color-muted)] border border-[var(--color-ivory-border)] p-5">
                    {lang === 'en' ? 'No administrative messages.' : 'Aucun message administratif reçu.'}
                  </p>
                ) : (
                  <div className="divide-y divide-[var(--color-ivory-border)] border border-[var(--color-ivory-border)]">
                    {overview.messages.map((msg) => (
                      <div key={msg.id} className="p-5 space-y-2">
                        <div className="flex items-center justify-between gap-4">
                          <h3 className="font-medium text-sm text-[var(--color-earth-dark)]">{msg.subject}</h3>
                          <span className="text-xs text-[var(--color-muted)] tabular-nums">
                            {formatLocalizedDate(msg.created_at, lang)}
                          </span>
                        </div>
                        <p className="text-sm text-[var(--color-ink)]/85 whitespace-pre-line">{msg.body}</p>
                        {!msg.is_read && (
                          <button
                            type="button"
                            onClick={() => handleMarkRead(msg.id)}
                            className="text-xs text-[var(--color-forest)] hover:underline"
                          >
                            {lang === 'en' ? 'Mark as read' : 'Marquer comme lu'}
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>
            </div>

            {/* Right column: Profile & Calendar */}
            <aside className="lg:col-span-4 space-y-8">
              <div className="border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)] p-6 space-y-4">
                <h2 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
                  {lang === 'en' ? 'My Profile' : 'Mon profil'}
                </h2>
                <p className="text-xs text-[var(--color-muted)]">
                  {user.email} · {lang === 'en' ? 'Role:' : 'Rôle :'} {user.role}
                </p>
                {profileNotice && <p className="text-xs text-[var(--color-forest)]">{profileNotice}</p>}
                <form onSubmit={handleProfileUpdate} className="space-y-3 text-sm">
                  <div>
                    <label className="block text-xs mb-1">{lang === 'en' ? 'Full name' : 'Nom complet'}</label>
                    <input
                      type="text"
                      required
                      value={profileForm.full_name}
                      onChange={(e) => setProfileForm({ ...profileForm, full_name: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs mb-1">{lang === 'en' ? 'Preferred name' : 'Nom d’usage'}</label>
                    <input
                      type="text"
                      value={profileForm.preferred_name}
                      onChange={(e) => setProfileForm({ ...profileForm, preferred_name: e.target.value })}
                      className="w-full px-3 py-2 border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-xs mb-1">{lang === 'en' ? 'Country' : 'Pays'}</label>
                      <input
                        type="text"
                        value={profileForm.country}
                        onChange={(e) => setProfileForm({ ...profileForm, country: e.target.value })}
                        className="w-full px-3 py-2 border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">{lang === 'en' ? 'City' : 'Ville'}</label>
                      <input
                        type="text"
                        value={profileForm.city}
                        onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })}
                        className="w-full px-3 py-2 border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                      />
                    </div>
                  </div>
                  <button
                    type="submit"
                    className="w-full py-2.5 text-xs font-medium bg-[var(--color-earth-dark)] text-[var(--color-ivory)] hover:bg-[var(--color-terracotta)] transition-colors"
                  >
                    {lang === 'en' ? 'Save profile' : 'Enregistrer le profil'}
                  </button>
                </form>
              </div>

              <div className="border border-[var(--color-ivory-border)] p-6 space-y-4">
                <h2 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
                  {lang === 'en' ? 'Calendar' : 'Mon calendrier'}
                </h2>
                <ul className="space-y-3 text-sm divide-y divide-[var(--color-ivory-border)]">
                  {overview?.calendarEvents.map((ev) => (
                    <li key={ev.id} className="pt-2.5">
                      <p className="text-xs text-[var(--color-terracotta)] tabular-nums">
                        {formatLocalizedDate(ev.event_date, lang)} · {ev.start_time}
                      </p>
                      <Link to={`/agenda/${ev.slug}`} className="font-medium hover:underline">
                        {lang === 'en' ? ev.title_en : ev.title_fr}
                      </Link>
                    </li>
                  ))}
                </ul>
                <a
                  href="/api/events/calendar.ics"
                  className="block text-center py-2 text-xs font-medium border border-[var(--color-forest)] text-[var(--color-forest)] hover:bg-[var(--color-ivory-soft)]"
                >
                  {t.common.exportAllIcs}
                </a>
              </div>
            </aside>
          </div>
        )}
      </div>
    </>
  );
}
