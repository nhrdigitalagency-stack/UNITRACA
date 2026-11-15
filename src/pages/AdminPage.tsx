import React, { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.tsx';
import { apiRequest } from '../lib/api.ts';
import { PageMeta } from '../components/PageMeta.tsx';
import type {
  AccessLevel,
  AuditLogItem,
  ContactRequestItem,
  EnrollmentStatus,
  EventItem,
  FounderProfile,
  HeritageDossier,
  MediaResourceItem,
  RegistrationRequestItem,
  RegistrationStatus,
  SiteSettings,
  TeachingItem,
  UserProfile,
  UserRole,
  WorkflowStatus,
} from '../types/unitraca.ts';

interface GrantItem {
  id: number;
  user_id: number;
  resource_id: number;
  user_email: string;
  user_name: string;
  resource_title: string;
  reason: string;
  created_at: string;
}

interface AdminOverview {
  settings: SiteSettings;
  founder: FounderProfile;
  teachings: TeachingItem[];
  events: EventItem[];
  media: MediaResourceItem[];
  dossiers: HeritageDossier[];
  registrations: RegistrationRequestItem[];
  contacts: ContactRequestItem[];
  grants: GrantItem[];
  users: UserProfile[];
  auditLogs: AuditLogItem[];
}

type AdminTab =
  | 'registrations'
  | 'teachings'
  | 'events'
  | 'media'
  | 'heritage'
  | 'access'
  | 'settings'
  | 'audit';

export function AdminPage() {
  const { user, authLoading, refreshUser, refreshSettings } = useApp();
  const [needsSetup, setNeedsSetup] = useState(false);
  const [setupChecked, setSetupChecked] = useState(false);

  const [setupForm, setSetupForm] = useState({ full_name: '', email: '', password: '' });
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [authError, setAuthError] = useState('');

  const [tab, setTab] = useState<AdminTab>('registrations');
  const [data, setData] = useState<AdminOverview | null>(null);
  const [loadingData, setLoadingData] = useState(false);
  const [feedback, setFeedback] = useState('');

  // Quick creation forms
  const [newTeaching, setNewTeaching] = useState({
    title_fr: '',
    title_en: '',
    format: 'Atelier',
    language_offered: 'Français',
    speaker: 'Fo’o Tchamaleu (à confirmer)',
    summary_fr: '',
    workflow_status: 'draft' as WorkflowStatus,
    enrollment_status: 'to_announce' as EnrollmentStatus,
  });

  const [newEvent, setNewEvent] = useState({
    title_fr: '',
    event_date: '2027-04-10',
    start_time: '15:00',
    end_time: '17:00',
    organizer_entity: 'UNITRACA',
    format: 'Rencontre',
    validated_location: 'À confirmer par UNITRACA',
    description_fr: '',
    workflow_status: 'draft' as WorkflowStatus,
  });

  const [newMedia, setNewMedia] = useState({
    title_fr: '',
    category: 'article' as MediaResourceItem['category'],
    theme: 'Traditions',
    speaker: 'UNITRACA',
    language: 'Français',
    community_context: 'Contexte à préciser',
    holder_or_author: 'UNITRACA',
    credit: 'Crédit à confirmer',
    access_level: 'public' as AccessLevel,
    summary_fr: '',
    body_fr: '',
    workflow_status: 'draft' as WorkflowStatus,
  });

  const [newDossier, setNewDossier] = useState({
    title_fr: '',
    community_or_tradition: '',
    region: '',
    summary_fr: '',
    documented_context_fr: '',
    oral_tradition_fr: '',
    workflow_status: 'draft' as WorkflowStatus,
  });

  const [grantForm, setGrantForm] = useState({ user_id: '', resource_id: '', reason: '' });
  const [messageForm, setMessageForm] = useState({ recipient_user_id: '', subject: '', body: '' });
  const [settingsDraft, setSettingsDraft] = useState<SiteSettings | null>(null);
  const [founderMsgDraft, setFounderMsgDraft] = useState('');

  useEffect(() => {
    apiRequest<{ needsAdminSetup: boolean }>('/api/auth/bootstrap-status')
      .then((res) => {
        setNeedsSetup(res.needsAdminSetup);
        setSetupChecked(true);
      })
      .catch(() => setSetupChecked(true));
  }, [user]);

  const loadAdminOverview = useCallback(async () => {
    if (!user || (user.role !== 'admin' && user.role !== 'editor')) return;
    setLoadingData(true);
    try {
      const overview = await apiRequest<AdminOverview>('/api/admin/overview');
      setData(overview);
      setSettingsDraft(overview.settings);
      setFounderMsgDraft(overview.founder?.personal_message_fr || '');
    } catch (err) {
      setFeedback((err as Error).message);
    } finally {
      setLoadingData(false);
    }
  }, [user]);

  useEffect(() => {
    loadAdminOverview();
  }, [loadAdminOverview]);

  async function handleBootstrapAdmin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError('');
    try {
      await apiRequest('/api/auth/bootstrap-admin', {
        method: 'POST',
        body: JSON.stringify(setupForm),
      });
      setNeedsSetup(false);
      await refreshUser();
    } catch (err) {
      setAuthError((err as Error).message);
    }
  }

  async function handleAdminLogin(e: React.FormEvent) {
    e.preventDefault();
    setAuthError('');
    try {
      await apiRequest('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify(loginForm),
      });
      await refreshUser();
    } catch (err) {
      setAuthError((err as Error).message);
    }
  }

  async function updateRegistrationStatus(id: number, status: RegistrationStatus, admin_notes: string) {
    setFeedback('');
    await apiRequest(`/api/admin/registrations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status, admin_notes }),
    });
    setFeedback(`Demande #${id} mise à jour (${status}).`);
    await loadAdminOverview();
  }

  async function updateTeachingWorkflow(id: number, workflow_status: WorkflowStatus, enrollment_status?: EnrollmentStatus) {
    await apiRequest(`/api/admin/teachings/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ workflow_status, enrollment_status }),
    });
    setFeedback(`Enseignement #${id} mis à jour.`);
    await loadAdminOverview();
  }

  async function updateEventWorkflow(id: number, workflow_status: WorkflowStatus) {
    await apiRequest(`/api/admin/events/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ workflow_status }),
    });
    setFeedback(`Événement #${id} mis à jour.`);
    await loadAdminOverview();
  }

  async function updateMediaRights(
    id: number,
    patch: Partial<{
      workflow_status: WorkflowStatus;
      access_level: AccessLevel;
      authorization_status: MediaResourceItem['authorization_status'];
    }>
  ) {
    await apiRequest(`/api/admin/mediatheque/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(patch),
    });
    setFeedback(`Ressource média #${id} mise à jour.`);
    await loadAdminOverview();
  }

  async function updateDossierWorkflow(id: number, workflow_status: WorkflowStatus) {
    await apiRequest(`/api/admin/patrimoines/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ workflow_status }),
    });
    setFeedback(`Dossier #${id} mis à jour.`);
    await loadAdminOverview();
  }

  async function createTeaching(e: React.FormEvent) {
    e.preventDefault();
    await apiRequest('/api/admin/teachings', { method: 'POST', body: JSON.stringify(newTeaching) });
    setNewTeaching({
      title_fr: '',
      title_en: '',
      format: 'Atelier',
      language_offered: 'Français',
      speaker: 'Fo’o Tchamaleu (à confirmer)',
      summary_fr: '',
      workflow_status: 'draft',
      enrollment_status: 'to_announce',
    });
    setFeedback('Enseignement créé en base.');
    await loadAdminOverview();
  }

  async function createEvent(e: React.FormEvent) {
    e.preventDefault();
    await apiRequest('/api/admin/events', { method: 'POST', body: JSON.stringify(newEvent) });
    setNewEvent({
      title_fr: '',
      event_date: '2027-04-10',
      start_time: '15:00',
      end_time: '17:00',
      organizer_entity: 'UNITRACA',
      format: 'Rencontre',
      validated_location: 'À confirmer par UNITRACA',
      description_fr: '',
      workflow_status: 'draft',
    });
    setFeedback('Événement créé en base.');
    await loadAdminOverview();
  }

  async function createMedia(e: React.FormEvent) {
    e.preventDefault();
    await apiRequest('/api/admin/mediatheque', { method: 'POST', body: JSON.stringify(newMedia) });
    setNewMedia({
      title_fr: '',
      category: 'article',
      theme: 'Traditions',
      speaker: 'UNITRACA',
      language: 'Français',
      community_context: 'Contexte à préciser',
      holder_or_author: 'UNITRACA',
      credit: 'Crédit à confirmer',
      access_level: 'public',
      summary_fr: '',
      body_fr: '',
      workflow_status: 'draft',
    });
    setFeedback('Ressource créée en base.');
    await loadAdminOverview();
  }

  async function createDossier(e: React.FormEvent) {
    e.preventDefault();
    await apiRequest('/api/admin/patrimoines', { method: 'POST', body: JSON.stringify(newDossier) });
    setNewDossier({
      title_fr: '',
      community_or_tradition: '',
      region: '',
      summary_fr: '',
      documented_context_fr: '',
      oral_tradition_fr: '',
      workflow_status: 'draft',
    });
    setFeedback('Dossier culturel créé.');
    await loadAdminOverview();
  }

  async function saveFounderMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!data?.founder) return;
    await apiRequest('/api/admin/founder', {
      method: 'PUT',
      body: JSON.stringify({ ...data.founder, personal_message_fr: founderMsgDraft }),
    });
    setFeedback('Fiche fondateur mise à jour.');
    await loadAdminOverview();
  }

  async function handleGrantSubmit(e: React.FormEvent) {
    e.preventDefault();
    await apiRequest('/api/admin/grants', {
      method: 'POST',
      body: JSON.stringify({
        user_id: Number(grantForm.user_id),
        resource_id: Number(grantForm.resource_id),
        reason: grantForm.reason,
      }),
    });
    setGrantForm({ user_id: '', resource_id: '', reason: '' });
    setFeedback('Accès restreint attribué.');
    await loadAdminOverview();
  }

  async function handleRevokeGrant(id: number) {
    await apiRequest(`/api/admin/grants/${id}`, { method: 'DELETE' });
    setFeedback('Accès révoqué.');
    await loadAdminOverview();
  }

  async function handleRoleChange(userId: number, role: UserRole) {
    await apiRequest(`/api/admin/users/${userId}/role`, {
      method: 'PATCH',
      body: JSON.stringify({ role }),
    });
    setFeedback(`Rôle utilisateur #${userId} modifié (${role}).`);
    await loadAdminOverview();
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    await apiRequest('/api/admin/messages', {
      method: 'POST',
      body: JSON.stringify({
        recipient_user_id: Number(messageForm.recipient_user_id),
        subject: messageForm.subject,
        body: messageForm.body,
      }),
    });
    setMessageForm({ recipient_user_id: '', subject: '', body: '' });
    setFeedback('Message administratif envoyé.');
  }

  async function saveSettings(e: React.FormEvent) {
    e.preventDefault();
    if (!settingsDraft) return;
    await apiRequest('/api/admin/site-settings', {
      method: 'PUT',
      body: JSON.stringify(settingsDraft),
    });
    await refreshSettings();
    setFeedback('Paramètres et palette centralisée enregistrés.');
  }

  async function updateContactStatus(id: number, status: 'new' | 'in_review' | 'resolved') {
    await apiRequest(`/api/admin/contact/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
    setFeedback(`Ticket contact #${id} mis à jour.`);
    await loadAdminOverview();
  }

  if (authLoading || !setupChecked) {
    return (
      <div className="max-w-[1280px] mx-auto px-4 py-16 text-sm text-[var(--color-muted)]">
        Chargement de l’espace d’administration…
      </div>
    );
  }

  return (
    <>
      <PageMeta
        titleFr="Administration & CMS | UNITRACA"
        titleEn="Administration & CMS | UNITRACA"
        descriptionFr="Administration sécurisée du portail UNITRACA."
        noIndex
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-8">
        <header className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[var(--color-ivory-border)] pb-6">
          <div>
            <p className="text-xs uppercase tracking-widest text-[var(--color-terracotta)]">
              Administration & CMS
            </p>
            <h1 className="font-display text-4xl font-semibold text-[var(--color-earth-dark)]">
              Gouvernance éditoriale UNITRACA
            </h1>
          </div>
          {user && (
            <p className="text-xs text-[var(--color-muted)]">
              Connecté : <strong>{user.email}</strong> · Rôle : <strong>{user.role}</strong>
            </p>
          )}
        </header>

        {/* First-time secure admin initialization (only when zero admins exist in DB) */}
        {needsSetup && !user && (
          <div className="max-w-lg mx-auto border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)] p-6 sm:p-8 space-y-5">
            <h2 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
              Initialisation du premier administrateur
            </h2>
            <p className="text-xs text-[var(--color-muted)] leading-relaxed">
              Aucun compte administrateur n’est encore configuré dans la base. Cette initialisation unique crée le premier compte administrateur avec chiffrement scrypt, puis se verrouille définitivement.
            </p>
            {authError && <p className="text-xs text-[var(--color-terracotta)]">{authError}</p>}
            <form onSubmit={handleBootstrapAdmin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">Nom complet</label>
                <input
                  type="text"
                  required
                  value={setupForm.full_name}
                  onChange={(e) => setSetupForm({ ...setupForm, full_name: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">E-mail administrateur</label>
                <input
                  type="email"
                  required
                  value={setupForm.email}
                  onChange={(e) => setSetupForm({ ...setupForm, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Mot de passe (10 caractères min.)</label>
                <input
                  type="password"
                  minLength={10}
                  required
                  value={setupForm.password}
                  onChange={(e) => setSetupForm({ ...setupForm, password: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 text-sm font-medium bg-[var(--color-earth-dark)] text-[var(--color-ivory)]"
              >
                Créer l’administrateur principal
              </button>
            </form>
          </div>
        )}

        {/* Login for existing admins/editors */}
        {!needsSetup && !user && (
          <div className="max-w-md mx-auto border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)] p-6 sm:p-8 space-y-5">
            <h2 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
              Connexion responsable
            </h2>
            <p className="text-xs text-[var(--color-muted)]">
              Aucune inscription publique d’administrateur n’est autorisée.
            </p>
            {authError && <p className="text-xs text-[var(--color-terracotta)]">{authError}</p>}
            <form onSubmit={handleAdminLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-medium mb-1">E-mail</label>
                <input
                  type="email"
                  required
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                />
              </div>
              <div>
                <label className="block text-xs font-medium mb-1">Mot de passe</label>
                <input
                  type="password"
                  required
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full px-3.5 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                />
              </div>
              <button
                type="submit"
                className="w-full py-2.5 text-sm font-medium bg-[var(--color-earth-dark)] text-[var(--color-ivory)]"
              >
                Se connecter
              </button>
            </form>
          </div>
        )}

        {/* Forbidden notice for regular member accounts */}
        {user && user.role === 'member' && (
          <div className="border border-[var(--color-terracotta)] bg-[var(--color-ivory-soft)] p-8 space-y-3">
            <h2 className="font-display text-2xl font-semibold text-[var(--color-terracotta)]">
              Accès restreint aux responsables éditoriaux et administrateurs
            </h2>
            <p className="text-sm text-[var(--color-ink)]/85">
              Votre compte possède le rôle « member ». Les droits sont vérifiés côté serveur.
            </p>
            <Link to="/espace-membre" className="inline-block text-sm font-medium underline">
              Retourner à l’Espace membre
            </Link>
          </div>
        )}

        {/* Full Admin / Editor Console */}
        {user && (user.role === 'admin' || user.role === 'editor') && (
          <div className="space-y-8">
            {feedback && (
              <div role="status" className="border border-[var(--color-forest)] bg-[var(--color-ivory-soft)] px-4 py-3 text-sm text-[var(--color-forest)]">
                {feedback}
              </div>
            )}

            {/* Admin Navigation Tabs */}
            <div className="flex flex-wrap gap-2 border-b border-[var(--color-ivory-border)] pb-4">
              {(
                [
                  ['registrations', 'Inscriptions & Messages'],
                  ['teachings', 'Enseignements'],
                  ['events', 'Agenda'],
                  ['media', 'Médiathèque & Droits'],
                  ['heritage', 'Patrimoines & Fondateur'],
                  ...(user.role === 'admin'
                    ? [
                        ['access', 'Accès restreints & Rôles'],
                        ['settings', 'Paramètres & Charte'],
                      ]
                    : []),
                  ['audit', 'Rectifications & Journal'],
                ] as Array<[AdminTab, string]>
              ).map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  className={`px-3.5 py-2 text-xs font-medium whitespace-nowrap ${
                    tab === key
                      ? 'bg-[var(--color-earth-dark)] text-[var(--color-ivory)]'
                      : 'border border-[var(--color-ivory-border)] hover:bg-[var(--color-ivory-soft)]'
                  }`}
                >
                  {label}
                </button>
              ))}
            </div>

            {loadingData || !data ? (
              <p className="text-sm text-[var(--color-muted)]">Chargement des modules…</p>
            ) : (
              <>
                {/* TAB 1: REGISTRATIONS & MESSAGES */}
                {tab === 'registrations' && (
                  <div className="space-y-8">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <h2 className="font-display text-2xl font-semibold">
                        Demandes d’inscription ({data.registrations.length})
                      </h2>
                      {user.role === 'admin' && (
                        <a
                          href="/api/admin/export/registrations.csv"
                          className="px-4 py-2 text-xs font-medium bg-[var(--color-forest)] text-[var(--color-ivory)]"
                        >
                          Exporter les inscriptions (.csv)
                        </a>
                      )}
                    </div>

                    <div className="space-y-4">
                      {data.registrations.map((reg) => (
                        <div key={reg.id} className="border border-[var(--color-ivory-border)] p-5 space-y-3">
                          <div className="flex flex-wrap justify-between gap-2 text-xs text-[var(--color-muted)] tabular-nums">
                            <span>
                              #{reg.id} · {reg.first_name} {reg.last_name} ({reg.email}) · {reg.city}, {reg.country}
                            </span>
                            <span>{reg.is_adult ? 'Majeur' : `Mineur (${reg.minor_guardian_note})`}</span>
                          </div>
                          <p className="text-sm font-medium text-[var(--color-earth-dark)]">
                            {reg.teaching_title || 'Demande générale'} — {reg.requested_language} / {reg.requested_format}
                          </p>
                          {reg.message && <p className="text-xs text-[var(--color-ink)]/80">{reg.message}</p>}
                          <div className="flex flex-wrap items-center gap-2 pt-2">
                            {(['pending', 'under_review', 'accepted', 'declined', 'cancelled'] as RegistrationStatus[]).map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => updateRegistrationStatus(reg.id, st, reg.admin_notes || '')}
                                className={`px-2.5 py-1 text-xs ${
                                  reg.status === st
                                    ? 'bg-[var(--color-terracotta)] text-white'
                                    : 'border border-[var(--color-ivory-border)] hover:bg-[var(--color-ivory-soft)]'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={handleSendMessage} className="border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)]/50 p-6 space-y-4 max-w-2xl">
                      <h3 className="font-display text-xl font-semibold">Envoyer un message administratif</h3>
                      <select
                        required
                        value={messageForm.recipient_user_id}
                        onChange={(e) => setMessageForm({ ...messageForm, recipient_user_id: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                      >
                        <option value="">Choisir un compte membre…</option>
                        {data.users.map((u) => (
                          <option key={u.id} value={u.id}>
                            {u.full_name} ({u.email})
                          </option>
                        ))}
                      </select>
                      <input
                        type="text"
                        required
                        placeholder="Objet du message"
                        value={messageForm.subject}
                        onChange={(e) => setMessageForm({ ...messageForm, subject: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                      />
                      <textarea
                        rows={3}
                        required
                        placeholder="Contenu du message administratif"
                        value={messageForm.body}
                        onChange={(e) => setMessageForm({ ...messageForm, body: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                      />
                      <button type="submit" className="px-4 py-2 text-xs font-medium bg-[var(--color-earth-dark)] text-[var(--color-ivory)]">
                        Envoyer au membre
                      </button>
                    </form>
                  </div>
                )}

                {/* TAB 2: TEACHINGS CMS */}
                {tab === 'teachings' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-7 space-y-4">
                      <h2 className="font-display text-2xl font-semibold">Enseignements (Workflow éditorial)</h2>
                      {data.teachings.map((item) => (
                        <div key={item.id} className="border border-[var(--color-ivory-border)] p-5 space-y-3">
                          <div className="flex justify-between gap-2 text-xs text-[var(--color-muted)]">
                            <span>{item.format} · {item.slug}</span>
                            <span>Publication : <strong>{item.workflow_status}</strong></span>
                          </div>
                          <h3 className="font-display text-xl font-semibold">{item.title_fr}</h3>
                          <div className="flex flex-wrap gap-1.5">
                            {(['draft', 'validation', 'published', 'archived'] as WorkflowStatus[]).map((wf) => (
                              <button
                                key={wf}
                                type="button"
                                onClick={() => updateTeachingWorkflow(item.id, wf)}
                                className={`px-2.5 py-1 text-xs ${
                                  item.workflow_status === wf
                                    ? 'bg-[var(--color-forest)] text-white'
                                    : 'border border-[var(--color-ivory-border)]'
                                }`}
                              >
                                {wf}
                              </button>
                            ))}
                          </div>
                          <div className="flex flex-wrap gap-1.5 pt-1">
                            {(['to_announce', 'open', 'full', 'finished', 'cancelled'] as EnrollmentStatus[]).map((es) => (
                              <button
                                key={es}
                                type="button"
                                onClick={() => updateTeachingWorkflow(item.id, item.workflow_status, es)}
                                className={`px-2.5 py-1 text-xs ${
                                  item.enrollment_status === es
                                    ? 'bg-[var(--color-terracotta)] text-white'
                                    : 'border border-[var(--color-ivory-border)]'
                                }`}
                              >
                                {es}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={createTeaching} className="lg:col-span-5 border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)]/50 p-6 space-y-4 self-start">
                      <h3 className="font-display text-xl font-semibold">Nouvel enseignement</h3>
                      <input
                        type="text"
                        required
                        placeholder="Titre (FR) *"
                        value={newTeaching.title_fr}
                        onChange={(e) => setNewTeaching({ ...newTeaching, title_fr: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                      />
                      <input
                        type="text"
                        placeholder="Title (EN)"
                        value={newTeaching.title_en}
                        onChange={(e) => setNewTeaching({ ...newTeaching, title_en: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                      />
                      <select
                        value={newTeaching.format}
                        onChange={(e) => setNewTeaching({ ...newTeaching, format: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                      >
                        <option value="Conférence">Conférence</option>
                        <option value="Atelier">Atelier</option>
                        <option value="Cycle de transmission">Cycle de transmission</option>
                        <option value="Rencontre">Rencontre</option>
                        <option value="Cours en ligne">Cours en ligne</option>
                      </select>
                      <textarea
                        rows={3}
                        placeholder="Présentation"
                        value={newTeaching.summary_fr}
                        onChange={(e) => setNewTeaching({ ...newTeaching, summary_fr: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                      />
                      <select
                        value={newTeaching.workflow_status}
                        onChange={(e) => setNewTeaching({ ...newTeaching, workflow_status: e.target.value as WorkflowStatus })}
                        className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                      >
                        <option value="draft">Brouillon (draft)</option>
                        <option value="validation">En validation</option>
                        <option value="published">Publié</option>
                      </select>
                      <button type="submit" className="w-full py-2.5 text-xs font-medium bg-[var(--color-earth-dark)] text-[var(--color-ivory)]">
                        Enregistrer l’enseignement
                      </button>
                    </form>
                  </div>
                )}

                {/* TAB 3: EVENTS CMS */}
                {tab === 'events' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-7 space-y-4">
                      <h2 className="font-display text-2xl font-semibold">Événements & Agenda</h2>
                      {data.events.map((ev) => (
                        <div key={ev.id} className="border border-[var(--color-ivory-border)] p-5 space-y-3">
                          <p className="text-xs text-[var(--color-muted)] tabular-nums">
                            {ev.event_date} · {ev.start_time}–{ev.end_time} · {ev.organizer_entity}
                          </p>
                          <h3 className="font-display text-xl font-semibold">{ev.title_fr}</h3>
                          <div className="flex flex-wrap gap-1.5">
                            {(['draft', 'validation', 'published', 'archived'] as WorkflowStatus[]).map((wf) => (
                              <button
                                key={wf}
                                type="button"
                                onClick={() => updateEventWorkflow(ev.id, wf)}
                                className={`px-2.5 py-1 text-xs ${
                                  ev.workflow_status === wf
                                    ? 'bg-[var(--color-forest)] text-white'
                                    : 'border border-[var(--color-ivory-border)]'
                                }`}
                              >
                                {wf}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={createEvent} className="lg:col-span-5 border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)]/50 p-6 space-y-4 self-start">
                      <h3 className="font-display text-xl font-semibold">Nouvel événement</h3>
                      <input
                        type="text"
                        required
                        placeholder="Titre (FR) *"
                        value={newEvent.title_fr}
                        onChange={(e) => setNewEvent({ ...newEvent, title_fr: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                      />
                      <input
                        type="date"
                        required
                        value={newEvent.event_date}
                        onChange={(e) => setNewEvent({ ...newEvent, event_date: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                      />
                      <input
                        type="text"
                        placeholder="Entité organisatrice (ex: UNITRACA)"
                        value={newEvent.organizer_entity}
                        onChange={(e) => setNewEvent({ ...newEvent, organizer_entity: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                      />
                      <input
                        type="text"
                        placeholder="Lieu validé ou À confirmer"
                        value={newEvent.validated_location}
                        onChange={(e) => setNewEvent({ ...newEvent, validated_location: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                      />
                      <textarea
                        rows={3}
                        placeholder="Description"
                        value={newEvent.description_fr}
                        onChange={(e) => setNewEvent({ ...newEvent, description_fr: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                      />
                      <button type="submit" className="w-full py-2.5 text-xs font-medium bg-[var(--color-earth-dark)] text-[var(--color-ivory)]">
                        Enregistrer l’événement
                      </button>
                    </form>
                  </div>
                )}

                {/* TAB 4: MEDIA & RIGHTS */}
                {tab === 'media' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-7 space-y-4">
                      <h2 className="font-display text-2xl font-semibold">Médiathèque & Droits</h2>
                      {data.media.map((m) => (
                        <div key={m.id} className="border border-[var(--color-ivory-border)] p-5 space-y-3">
                          <p className="text-xs text-[var(--color-muted)]">
                            {m.category} · Détenteur : {m.holder_or_author} · Crédit : {m.credit}
                          </p>
                          <h3 className="font-display text-xl font-semibold">{m.title_fr}</h3>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span>Accès :</span>
                            {(['public', 'member', 'restricted'] as AccessLevel[]).map((lvl) => (
                              <button
                                key={lvl}
                                type="button"
                                onClick={() => updateMediaRights(m.id, { access_level: lvl })}
                                className={`px-2 py-1 ${
                                  m.access_level === lvl ? 'bg-[var(--color-terracotta)] text-white' : 'border border-[var(--color-ivory-border)]'
                                }`}
                              >
                                {lvl}
                              </button>
                            ))}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span>Droits :</span>
                            {(['pending_validation', 'authorized', 'restricted_rights'] as const).map((authSt) => (
                              <button
                                key={authSt}
                                type="button"
                                onClick={() => updateMediaRights(m.id, { authorization_status: authSt })}
                                className={`px-2 py-1 ${
                                  m.authorization_status === authSt
                                    ? 'bg-[var(--color-earth-dark)] text-white'
                                    : 'border border-[var(--color-ivory-border)]'
                                }`}
                              >
                                {authSt}
                              </button>
                            ))}
                          </div>
                          <div className="flex flex-wrap items-center gap-2 text-xs">
                            <span>Workflow :</span>
                            {(['draft', 'validation', 'published', 'archived'] as WorkflowStatus[]).map((wf) => (
                              <button
                                key={wf}
                                type="button"
                                onClick={() => updateMediaRights(m.id, { workflow_status: wf })}
                                className={`px-2 py-1 ${
                                  m.workflow_status === wf ? 'bg-[var(--color-forest)] text-white' : 'border border-[var(--color-ivory-border)]'
                                }`}
                              >
                                {wf}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    <form onSubmit={createMedia} className="lg:col-span-5 border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)]/50 p-6 space-y-3 self-start">
                      <h3 className="font-display text-xl font-semibold">Ajouter une ressource</h3>
                      <input
                        type="text"
                        required
                        placeholder="Titre (FR) *"
                        value={newMedia.title_fr}
                        onChange={(e) => setNewMedia({ ...newMedia, title_fr: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                      />
                      <select
                        value={newMedia.category}
                        onChange={(e) => setNewMedia({ ...newMedia, category: e.target.value as MediaResourceItem['category'] })}
                        className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                      >
                        <option value="article">Article</option>
                        <option value="video">Vidéo</option>
                        <option value="interview">Entretien</option>
                        <option value="audio">Audio</option>
                        <option value="gallery">Galerie</option>
                        <option value="document">Document</option>
                      </select>
                      <select
                        value={newMedia.access_level}
                        onChange={(e) => setNewMedia({ ...newMedia, access_level: e.target.value as AccessLevel })}
                        className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                      >
                        <option value="public">Public</option>
                        <option value="member">Membres autorisés</option>
                        <option value="restricted">Accès restreint</option>
                      </select>
                      <input
                        type="text"
                        placeholder="Communauté ou contexte"
                        value={newMedia.community_context}
                        onChange={(e) => setNewMedia({ ...newMedia, community_context: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                      />
                      <input
                        type="text"
                        placeholder="Crédit et détenteur"
                        value={newMedia.credit}
                        onChange={(e) => setNewMedia({ ...newMedia, credit: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                      />
                      <textarea
                        rows={2}
                        placeholder="Résumé"
                        value={newMedia.summary_fr}
                        onChange={(e) => setNewMedia({ ...newMedia, summary_fr: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                      />
                      <textarea
                        rows={3}
                        placeholder="Contenu complet"
                        value={newMedia.body_fr}
                        onChange={(e) => setNewMedia({ ...newMedia, body_fr: e.target.value })}
                        className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                      />
                      <button type="submit" className="w-full py-2.5 text-xs font-medium bg-[var(--color-earth-dark)] text-[var(--color-ivory)]">
                        Créer la ressource
                      </button>
                    </form>
                  </div>
                )}

                {/* TAB 5: HERITAGE & FOUNDER */}
                {tab === 'heritage' && (
                  <div className="space-y-10">
                    <form onSubmit={saveFounderMessage} className="border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)]/40 p-6 space-y-4">
                      <h2 className="font-display text-2xl font-semibold">Message personnel du fondateur</h2>
                      <textarea
                        rows={3}
                        value={founderMsgDraft}
                        onChange={(e) => setFounderMsgDraft(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                      />
                      <button type="submit" className="px-4 py-2 text-xs font-medium bg-[var(--color-earth-dark)] text-[var(--color-ivory)]">
                        Mettre à jour la fiche fondateur
                      </button>
                    </form>

                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                      <div className="lg:col-span-7 space-y-4">
                        <h2 className="font-display text-2xl font-semibold">Dossiers culturels</h2>
                        {data.dossiers.map((d) => (
                          <div key={d.id} className="border border-[var(--color-ivory-border)] p-5 space-y-3">
                            <p className="text-xs text-[var(--color-muted)]">{d.region} · {d.community_or_tradition}</p>
                            <h3 className="font-display text-xl font-semibold">{d.title_fr}</h3>
                            <div className="flex flex-wrap gap-1.5">
                              {(['draft', 'validation', 'published', 'archived'] as WorkflowStatus[]).map((wf) => (
                                <button
                                  key={wf}
                                  type="button"
                                  onClick={() => updateDossierWorkflow(d.id, wf)}
                                  className={`px-2.5 py-1 text-xs ${
                                    d.workflow_status === wf ? 'bg-[var(--color-forest)] text-white' : 'border border-[var(--color-ivory-border)]'
                                  }`}
                                >
                                  {wf}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>

                      <form onSubmit={createDossier} className="lg:col-span-5 border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)]/50 p-6 space-y-3 self-start">
                        <h3 className="font-display text-xl font-semibold">Nouveau dossier culturel</h3>
                        <input
                          type="text"
                          required
                          placeholder="Titre du dossier *"
                          value={newDossier.title_fr}
                          onChange={(e) => setNewDossier({ ...newDossier, title_fr: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Communauté / tradition identifiée *"
                          value={newDossier.community_or_tradition}
                          onChange={(e) => setNewDossier({ ...newDossier, community_or_tradition: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                        />
                        <input
                          type="text"
                          required
                          placeholder="Région *"
                          value={newDossier.region}
                          onChange={(e) => setNewDossier({ ...newDossier, region: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                        />
                        <textarea
                          rows={2}
                          placeholder="Résumé"
                          value={newDossier.summary_fr}
                          onChange={(e) => setNewDossier({ ...newDossier, summary_fr: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                        />
                        <textarea
                          rows={2}
                          placeholder="Repères documentés"
                          value={newDossier.documented_context_fr}
                          onChange={(e) => setNewDossier({ ...newDossier, documented_context_fr: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                        />
                        <textarea
                          rows={2}
                          placeholder="Tradition orale attribuée"
                          value={newDossier.oral_tradition_fr}
                          onChange={(e) => setNewDossier({ ...newDossier, oral_tradition_fr: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                        />
                        <button type="submit" className="w-full py-2.5 text-xs font-medium bg-[var(--color-earth-dark)] text-[var(--color-ivory)]">
                          Créer le dossier
                        </button>
                      </form>
                    </div>
                  </div>
                )}

                {/* TAB 6: RESTRICTED ACCESS & ROLES (ADMIN ONLY) */}
                {tab === 'access' && user.role === 'admin' && (
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    <div className="lg:col-span-6 space-y-6">
                      <form onSubmit={handleGrantSubmit} className="border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)]/50 p-6 space-y-4">
                        <h2 className="font-display text-2xl font-semibold">Attribuer un accès restreint</h2>
                        <select
                          required
                          value={grantForm.user_id}
                          onChange={(e) => setGrantForm({ ...grantForm, user_id: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                        >
                          <option value="">Sélectionner un utilisateur…</option>
                          {data.users.map((u) => (
                            <option key={u.id} value={u.id}>
                              {u.full_name} ({u.email})
                            </option>
                          ))}
                        </select>
                        <select
                          required
                          value={grantForm.resource_id}
                          onChange={(e) => setGrantForm({ ...grantForm, resource_id: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                        >
                          <option value="">Sélectionner une ressource restreinte…</option>
                          {data.media
                            .filter((m) => m.access_level === 'restricted')
                            .map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.title_fr}
                              </option>
                            ))}
                        </select>
                        <input
                          type="text"
                          placeholder="Motif de l’autorisation"
                          value={grantForm.reason}
                          onChange={(e) => setGrantForm({ ...grantForm, reason: e.target.value })}
                          className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                        />
                        <button type="submit" className="px-4 py-2 text-xs font-medium bg-[var(--color-forest)] text-[var(--color-ivory)]">
                          Accorder l’accès
                        </button>
                      </form>

                      <div className="space-y-3">
                        <h3 className="font-display text-xl font-semibold">Autorisations actives ({data.grants.length})</h3>
                        {data.grants.map((g) => (
                          <div key={g.id} className="border border-[var(--color-ivory-border)] p-4 flex items-center justify-between gap-4 text-xs">
                            <div>
                              <p className="font-medium text-sm">{g.user_name} ({g.user_email})</p>
                              <p className="text-[var(--color-muted)]">{g.resource_title} — {g.reason}</p>
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRevokeGrant(g.id)}
                              className="px-2.5 py-1 border border-[var(--color-terracotta)] text-[var(--color-terracotta)]"
                            >
                              Révoquer
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="lg:col-span-6 space-y-4">
                      <h2 className="font-display text-2xl font-semibold">Comptes & Rôles</h2>
                      <div className="divide-y divide-[var(--color-ivory-border)] border border-[var(--color-ivory-border)]">
                        {data.users.map((u) => (
                          <div key={u.id} className="p-4 flex flex-wrap items-center justify-between gap-3 text-sm">
                            <div>
                              <p className="font-medium">{u.full_name}</p>
                              <p className="text-xs text-[var(--color-muted)]">{u.email}</p>
                            </div>
                            <div className="flex gap-1.5">
                              {(['member', 'editor', 'admin'] as UserRole[]).map((r) => (
                                <button
                                  key={r}
                                  type="button"
                                  disabled={u.id === user.id}
                                  onClick={() => handleRoleChange(u.id, r)}
                                  className={`px-2.5 py-1 text-xs ${
                                    u.role === r ? 'bg-[var(--color-earth-dark)] text-white' : 'border border-[var(--color-ivory-border)]'
                                  } disabled:opacity-40`}
                                >
                                  {r}
                                </button>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* TAB 7: SETTINGS & PALETTE */}
                {tab === 'settings' && user.role === 'admin' && settingsDraft && (
                  <form onSubmit={saveSettings} className="space-y-8 max-w-3xl">
                    <div className="border border-[var(--color-ivory-border)] p-6 space-y-4">
                      <h2 className="font-display text-2xl font-semibold">Palette centralisée (provisoire et modifiable)</h2>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {(
                          [
                            ['earthDark', 'Terre sombre'],
                            ['ivory', 'Ivoire'],
                            ['terracotta', 'Terre cuite'],
                            ['forest', 'Vert profond'],
                            ['brass', 'Laiton'],
                            ['ink', 'Noir doux'],
                            ['muted', 'Texte secondaire'],
                          ] as Array<[keyof SiteSettings['theme'], string]>
                        ).map(([key, label]) => (
                          <div key={key}>
                            <label className="block text-xs mb-1">{label}</label>
                            <input
                              type="color"
                              value={settingsDraft.theme[key]}
                              onChange={(e) =>
                                setSettingsDraft({
                                  ...settingsDraft,
                                  theme: { ...settingsDraft.theme, [key]: e.target.value },
                                })
                              }
                              className="w-full h-10 border border-[var(--color-ivory-border)]"
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border border-[var(--color-ivory-border)] p-6 space-y-4">
                      <h2 className="font-display text-2xl font-semibold">Textes Hero modifiables</h2>
                      <div>
                        <label className="block text-xs mb-1">Titre principal (FR)</label>
                        <input
                          type="text"
                          value={settingsDraft.hero.title_fr}
                          onChange={(e) =>
                            setSettingsDraft({
                              ...settingsDraft,
                              hero: { ...settingsDraft.hero, title_fr: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">Texte d’introduction (FR)</label>
                        <textarea
                          rows={3}
                          value={settingsDraft.hero.text_fr}
                          onChange={(e) =>
                            setSettingsDraft({
                              ...settingsDraft,
                              hero: { ...settingsDraft.hero, text_fr: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs mb-1">
                          Numéro WhatsApp officiel (facultatif — uniquement après validation par UNITRACA)
                        </label>
                        <input
                          type="text"
                          placeholder="Ex: +237..."
                          value={settingsDraft.social.whatsapp_number || ''}
                          onChange={(e) =>
                            setSettingsDraft({
                              ...settingsDraft,
                              social: { ...settingsDraft.social, whatsapp_number: e.target.value },
                            })
                          }
                          className="w-full px-3 py-2 text-sm border border-[var(--color-ivory-border)] bg-[var(--color-ivory)]"
                        />
                      </div>
                      <label className="flex items-center gap-2 text-xs">
                        <input
                          type="checkbox"
                          checked={settingsDraft.social.verified_with_org}
                          onChange={(e) =>
                            setSettingsDraft({
                              ...settingsDraft,
                              social: { ...settingsDraft.social, verified_with_org: e.target.checked },
                            })
                          }
                        />
                        <span>Liens YouTube / Facebook confirmés avec UNITRACA</span>
                      </label>
                    </div>

                    <button type="submit" className="px-6 py-3 text-sm font-medium bg-[var(--color-forest)] text-[var(--color-ivory)]">
                      Enregistrer la configuration
                    </button>
                  </form>
                )}

                {/* TAB 8: CONTACT / MEDIA TAKEDOWNS & AUDIT LOGS */}
                {tab === 'audit' && (
                  <div className="space-y-10">
                    <div className="space-y-4">
                      <h2 className="font-display text-2xl font-semibold">
                        Demandes de contact, corrections & retraits ({data.contacts.length})
                      </h2>
                      {data.contacts.map((c) => (
                        <div key={c.id} className="border border-[var(--color-ivory-border)] p-5 space-y-2">
                          <div className="flex flex-wrap justify-between gap-2 text-xs text-[var(--color-muted)]">
                            <span>[{c.request_type}] {c.sender_name} ({c.sender_email})</span>
                            <span className="tabular-nums">{c.created_at}</span>
                          </div>
                          <p className="font-medium text-sm">{c.subject}</p>
                          {c.related_url && <p className="text-xs text-[var(--color-terracotta)]">Réf : {c.related_url}</p>}
                          <p className="text-sm text-[var(--color-ink)]/85">{c.message}</p>
                          <div className="flex gap-2 pt-2">
                            {(['new', 'in_review', 'resolved'] as const).map((st) => (
                              <button
                                key={st}
                                type="button"
                                onClick={() => updateContactStatus(c.id, st)}
                                className={`px-2.5 py-1 text-xs ${
                                  c.status === st ? 'bg-[var(--color-forest)] text-white' : 'border border-[var(--color-ivory-border)]'
                                }`}
                              >
                                {st}
                              </button>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>

                    {user.role === 'admin' && (
                      <div className="space-y-4">
                        <h2 className="font-display text-2xl font-semibold">Journal d’audit serveur</h2>
                        <div className="overflow-x-auto border border-[var(--color-ivory-border)]">
                          <table className="w-full text-left text-xs">
                            <thead className="bg-[var(--color-ivory-soft)] border-b border-[var(--color-ivory-border)]">
                              <tr>
                                <th className="p-3">Date</th>
                                <th className="p-3">Acteur</th>
                                <th className="p-3">Action</th>
                                <th className="p-3">Entité</th>
                              </tr>
                            </thead>
                            <tbody className="divide-y divide-[var(--color-ivory-border)] tabular-nums">
                              {data.auditLogs.map((log) => (
                                <tr key={log.id}>
                                  <td className="p-3">{log.created_at}</td>
                                  <td className="p-3">{log.actor_email}</td>
                                  <td className="p-3 font-medium">{log.action}</td>
                                  <td className="p-3">{log.entity_type} #{log.entity_id}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
