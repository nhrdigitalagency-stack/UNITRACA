import express from 'express';
import type Database from 'better-sqlite3';
import {
  type AuthenticatedRequest,
  clearSessionCookie,
  createSession,
  deleteSessionByToken,
  hashPassword,
  parseCookies,
  rateLimit,
  requireAuth,
  requireRole,
  SESSION_COOKIE_NAME,
  setSessionCookie,
  verifyPassword,
  writeAuditLog,
} from './auth.ts';
import type {
  AccessLevel,
  MediaResourceItem,
  RegistrationStatus,
  SiteSettings,
  UserRole,
  WorkflowStatus,
} from '../types/unitraca.ts';

function slugify(input: string): string {
  return input
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) && email.length <= 180;
}

function escapeIcsText(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/,/g, '\\,')
    .replace(/;/g, '\\;');
}

function formatIcsDateTime(dateStr: string, timeStr: string): string {
  const cleanDate = dateStr.replace(/-/g, '');
  const cleanTime = (timeStr || '09:00').replace(/:/g, '') + '00';
  return `${cleanDate}T${cleanTime}`;
}

function escapeCsvCell(value: unknown): string {
  const str = String(value ?? '');
  const safe = /^[=+\-@\t\r]/.test(str) ? `'${str}` : str;
  return `"${safe.replace(/"/g, '""')}"`;
}

function getSiteSettings(db: Database.Database): SiteSettings {
  const row = db.prepare('SELECT value_json FROM site_settings WHERE key = ?').get('main') as
    | { value_json: string }
    | undefined;
  return row ? (JSON.parse(row.value_json) as SiteSettings) : ({} as SiteSettings);
}

function userHasResourceAccess(
  db: Database.Database,
  user: AuthenticatedRequest['currentUser'],
  resourceId: number,
  accessLevel: AccessLevel
): boolean {
  if (accessLevel === 'public') return true;
  if (!user) return false;
  if (user.role === 'admin' || user.role === 'editor') return true;
  if (accessLevel === 'member') return true;
  // restricted level requires explicit server grant
  const grant = db
    .prepare(
      `SELECT id, expires_at FROM resource_access_grants WHERE user_id = ? AND resource_id = ?`
    )
    .get(user.id, resourceId) as { id: number; expires_at: string | null } | undefined;
  if (!grant) return false;
  if (grant.expires_at && new Date(grant.expires_at).getTime() < Date.now()) {
    return false;
  }
  return true;
}

function serializeMediaResource(
  row: Record<string, unknown>,
  accessGranted: boolean
): MediaResourceItem {
  const base: MediaResourceItem = {
    id: row.id as number,
    slug: row.slug as string,
    title_fr: row.title_fr as string,
    title_en: row.title_en as string,
    category: row.category as MediaResourceItem['category'],
    theme: row.theme as string,
    speaker: row.speaker as string,
    language: row.language as string,
    community_context: row.community_context as string,
    holder_or_author: row.holder_or_author as string,
    authorization_status: row.authorization_status as MediaResourceItem['authorization_status'],
    diffusion_conditions: row.diffusion_conditions as string,
    credit: row.credit as string,
    published_date: row.published_date as string,
    access_level: row.access_level as AccessLevel,
    thumbnail_url: row.thumbnail_url as string,
    embed_url: accessGranted ? (row.embed_url as string) : '',
    summary_fr: row.summary_fr as string,
    summary_en: row.summary_en as string,
    subtitles_available: Boolean(row.subtitles_available),
    health_disclaimer_required: Boolean(row.health_disclaimer_required),
    workflow_status: row.workflow_status as WorkflowStatus,
    access_granted: accessGranted,
    created_at: row.created_at as string,
    updated_at: row.updated_at as string,
  };

  if (accessGranted) {
    base.body_fr = row.body_fr as string;
    base.body_en = row.body_en as string;
    base.transcript_fr = row.transcript_fr as string;
    base.transcript_en = row.transcript_en as string;
  }

  return base;
}

export function createApiRouter(db: Database.Database): express.Router {
  const router = express.Router();

  // ---------------- AUTHENTICATION ----------------

  router.get('/auth/me', (req: AuthenticatedRequest, res) => {
    res.json({ user: req.currentUser || null });
  });

  router.get('/auth/bootstrap-status', (_req, res) => {
    const adminCount = (db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'admin'").get() as { c: number }).c;
    res.json({ needsAdminSetup: adminCount === 0 });
  });

  router.post('/auth/bootstrap-admin', rateLimit('bootstrap', 10, 60_000), (req: AuthenticatedRequest, res) => {
    const adminCount = (db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'admin'").get() as { c: number }).c;
    if (adminCount > 0) {
      return res.status(403).json({ error: 'Un administrateur principal existe déjà.' });
    }

    const { email, password, full_name } = req.body || {};
    if (!isValidEmail(String(email || '')) || String(password || '').length < 10 || !String(full_name || '').trim()) {
      return res.status(400).json({
        error: 'Veuillez saisir un nom complet, un e-mail valide et un mot de passe d’au moins 10 caractères.',
      });
    }

    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(String(email).trim());
    if (existing) {
      return res.status(409).json({ error: 'Cet e-mail est déjà enregistré.' });
    }

    const passwordHash = hashPassword(String(password));
    const result = db
      .prepare(
        `INSERT INTO users (email, password_hash, full_name, preferred_name, role, preferred_language)
         VALUES (?, ?, ?, ?, 'admin', 'fr')`
      )
      .run(String(email).trim().toLowerCase(), passwordHash, String(full_name).trim(), String(full_name).trim());

    const userId = Number(result.lastInsertRowid);
    const { rawToken } = createSession(db, userId);
    setSessionCookie(res, rawToken, req);

    const createdUser = db
      .prepare('SELECT id, email, full_name, preferred_name, country, city, role, preferred_language, is_active, created_at FROM users WHERE id = ?')
      .get(userId) as Record<string, unknown>;

    writeAuditLog(db, { id: userId, email: String(email).trim().toLowerCase() } as AuthenticatedRequest['currentUser'], 'BOOTSTRAP_ADMIN', 'user', userId);
    res.status(201).json({
      user: {
        ...createdUser,
        is_active: Boolean(createdUser.is_active),
      },
    });
  });

  router.post('/auth/register', rateLimit('register', 15, 60_000), (req: AuthenticatedRequest, res) => {
    const { email, password, full_name, preferred_name, country, city, preferred_language, consent_data } = req.body || {};
    if (!isValidEmail(String(email || '')) || String(password || '').length < 8 || !String(full_name || '').trim()) {
      return res.status(400).json({
        error: 'Nom complet, adresse e-mail valide et mot de passe (8 caractères minimum) requis.',
      });
    }
    if (!consent_data) {
      return res.status(400).json({
        error: 'Le consentement au traitement des données de compte est obligatoire.',
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(normalizedEmail);
    if (existing) {
      return res.status(409).json({ error: 'Un compte existe déjà avec cette adresse e-mail.' });
    }

    const lang = preferred_language === 'en' ? 'en' : 'fr';
    const passwordHash = hashPassword(String(password));
    const result = db
      .prepare(
        `INSERT INTO users (email, password_hash, full_name, preferred_name, country, city, role, preferred_language)
         VALUES (?, ?, ?, ?, ?, ?, 'member', ?)`
      )
      .run(
        normalizedEmail,
        passwordHash,
        String(full_name).trim(),
        String(preferred_name || full_name).trim(),
        String(country || '').trim(),
        String(city || '').trim(),
        lang
      );

    const userId = Number(result.lastInsertRowid);
    db.prepare(
      'INSERT INTO consent_logs (user_id, email, consent_type, granted) VALUES (?, ?, ?, 1)'
    ).run(userId, normalizedEmail, 'account_creation');

    // Link prior registration requests matching this email
    db.prepare('UPDATE registration_requests SET user_id = ? WHERE email = ? AND user_id IS NULL').run(
      userId,
      normalizedEmail
    );

    const { rawToken } = createSession(db, userId);
    setSessionCookie(res, rawToken, req);

    const createdUser = db
      .prepare('SELECT id, email, full_name, preferred_name, country, city, role, preferred_language, is_active, created_at FROM users WHERE id = ?')
      .get(userId) as Record<string, unknown>;

    writeAuditLog(db, { id: userId, email: normalizedEmail } as AuthenticatedRequest['currentUser'], 'REGISTER_MEMBER', 'user', userId);

    res.status(201).json({
      user: {
        ...createdUser,
        is_active: Boolean(createdUser.is_active),
      },
    });
  });

  router.post('/auth/login', rateLimit('login', 20, 60_000), (req: AuthenticatedRequest, res) => {
    const { email, password } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'E-mail et mot de passe requis.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const userRow = db
      .prepare('SELECT * FROM users WHERE email = ?')
      .get(normalizedEmail) as (Record<string, unknown> & { password_hash: string; is_active: number }) | undefined;

    if (!userRow || !verifyPassword(String(password), userRow.password_hash)) {
      return res.status(401).json({ error: 'Identifiants invalides.' });
    }

    if (userRow.is_active !== 1) {
      return res.status(403).json({ error: 'Ce compte est actuellement désactivé.' });
    }

    const { rawToken } = createSession(db, userRow.id as number);
    setSessionCookie(res, rawToken, req);

    writeAuditLog(
      db,
      { id: userRow.id as number, email: normalizedEmail } as AuthenticatedRequest['currentUser'],
      'LOGIN',
      'user',
      userRow.id as number
    );

    res.json({
      user: {
        id: userRow.id,
        email: userRow.email,
        full_name: userRow.full_name,
        preferred_name: userRow.preferred_name,
        country: userRow.country,
        city: userRow.city,
        role: userRow.role,
        preferred_language: userRow.preferred_language,
        is_active: true,
        created_at: userRow.created_at,
      },
    });
  });

  router.post('/auth/logout', (req: AuthenticatedRequest, res) => {
    const cookies = parseCookies(req.headers.cookie);
    const rawToken = cookies[SESSION_COOKIE_NAME];
    if (rawToken) {
      deleteSessionByToken(db, rawToken);
    }
    clearSessionCookie(res);
    res.json({ ok: true });
  });

  router.patch('/auth/profile', requireAuth, (req: AuthenticatedRequest, res) => {
    const user = req.currentUser!;
    const { full_name, preferred_name, country, city, preferred_language } = req.body || {};
    if (!String(full_name || '').trim()) {
      return res.status(400).json({ error: 'Le nom complet est requis.' });
    }
    const lang = preferred_language === 'en' ? 'en' : 'fr';
    db.prepare(
      `UPDATE users SET full_name = ?, preferred_name = ?, country = ?, city = ?, preferred_language = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(
      String(full_name).trim(),
      String(preferred_name || '').trim(),
      String(country || '').trim(),
      String(city || '').trim(),
      lang,
      user.id
    );
    const updated = db
      .prepare('SELECT id, email, full_name, preferred_name, country, city, role, preferred_language, is_active, created_at FROM users WHERE id = ?')
      .get(user.id) as Record<string, unknown>;
    res.json({ user: { ...updated, is_active: Boolean(updated.is_active) } });
  });

  // ---------------- PUBLIC CONTENT ----------------

  router.get('/site-settings', (_req, res) => {
    res.json(getSiteSettings(db));
  });

  router.get('/founder', (_req, res) => {
    const row = db.prepare("SELECT * FROM founder_profile WHERE id = 1 AND workflow_status = 'published'").get() as
      | Record<string, unknown>
      | undefined;
    if (!row) return res.status(404).json({ error: 'Fiche fondateur indisponible.' });
    res.json({
      id: row.id,
      display_name: row.display_name,
      titles: JSON.parse(row.titles_json as string),
      author_attribution: row.author_attribution,
      portrait_url: row.portrait_url,
      portrait_credit: row.portrait_credit,
      gallery: JSON.parse(row.gallery_json as string),
      bio_fr: row.bio_fr,
      bio_en: row.bio_en,
      public_journey_fr: row.public_journey_fr,
      public_journey_en: row.public_journey_en,
      publications: JSON.parse(row.publications_json as string),
      interventions: JSON.parse(row.interventions_json as string),
      personal_message_fr: row.personal_message_fr,
      personal_message_en: row.personal_message_en,
      oral_tradition_note_fr: row.oral_tradition_note_fr,
      oral_tradition_note_en: row.oral_tradition_note_en,
      workflow_status: row.workflow_status,
      updated_at: row.updated_at,
    });
  });

  router.get('/teachings', (_req, res) => {
    const rows = db
      .prepare("SELECT * FROM teachings WHERE workflow_status = 'published' ORDER BY is_featured DESC, id ASC")
      .all() as Array<Record<string, unknown>>;
    res.json(
      rows.map((r) => ({
        ...r,
        price_validated: Boolean(r.price_validated),
        is_featured: Boolean(r.is_featured),
      }))
    );
  });

  router.get('/teachings/:slug', (req, res) => {
    const row = db
      .prepare("SELECT * FROM teachings WHERE slug = ? AND workflow_status = 'published'")
      .get(req.params.slug) as Record<string, unknown> | undefined;
    if (!row) return res.status(404).json({ error: 'Enseignement introuvable.' });
    res.json({
      ...row,
      price_validated: Boolean(row.price_validated),
      is_featured: Boolean(row.is_featured),
    });
  });

  router.get('/events', (_req, res) => {
    const rows = db
      .prepare("SELECT * FROM events WHERE workflow_status = 'published' ORDER BY event_date ASC")
      .all() as Array<Record<string, unknown>>;
    res.json(
      rows.map((r) => ({
        ...r,
        speakers: JSON.parse(r.speakers_json as string),
        location_verified: Boolean(r.location_verified),
        registration_open: Boolean(r.registration_open),
      }))
    );
  });

  router.get('/events/calendar.ics', (_req, res) => {
    const rows = db
      .prepare("SELECT * FROM events WHERE workflow_status = 'published' ORDER BY event_date ASC")
      .all() as Array<Record<string, unknown>>;
    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//UNITRACA//Agenda Officiel//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
    ];
    for (const ev of rows) {
      lines.push(
        'BEGIN:VEVENT',
        `UID:unitraca-event-${ev.id}@unitraca`,
        `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
        `DTSTART;TZID=${ev.timezone || 'Africa/Douala'}:${formatIcsDateTime(ev.event_date as string, ev.start_time as string)}`,
        `DTEND;TZID=${ev.timezone || 'Africa/Douala'}:${formatIcsDateTime(ev.event_date as string, ev.end_time as string)}`,
        `SUMMARY:${escapeIcsText(ev.title_fr as string)}`,
        `DESCRIPTION:${escapeIcsText(`${ev.description_fr}\nOrganisateur : ${ev.organizer_entity}`)}`,
        `LOCATION:${escapeIcsText((ev.validated_location as string) || 'À confirmer par UNITRACA')}`,
        'END:VEVENT'
      );
    }
    lines.push('END:VCALENDAR');
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="unitraca-agenda.ics"');
    res.send(lines.join('\r\n'));
  });

  router.get('/events/:slug', (req, res) => {
    const row = db
      .prepare("SELECT * FROM events WHERE slug = ? AND workflow_status = 'published'")
      .get(req.params.slug) as Record<string, unknown> | undefined;
    if (!row) return res.status(404).json({ error: 'Événement introuvable.' });
    res.json({
      ...row,
      speakers: JSON.parse(row.speakers_json as string),
      location_verified: Boolean(row.location_verified),
      registration_open: Boolean(row.registration_open),
    });
  });

  router.get('/events/:slug/calendar.ics', (req, res) => {
    const ev = db
      .prepare("SELECT * FROM events WHERE slug = ? AND workflow_status = 'published'")
      .get(req.params.slug) as Record<string, unknown> | undefined;
    if (!ev) return res.status(404).json({ error: 'Événement introuvable.' });

    const lines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//UNITRACA//Agenda Officiel//FR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'BEGIN:VEVENT',
      `UID:unitraca-event-${ev.id}@unitraca`,
      `DTSTAMP:${new Date().toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      `DTSTART;TZID=${ev.timezone || 'Africa/Douala'}:${formatIcsDateTime(ev.event_date as string, ev.start_time as string)}`,
      `DTEND;TZID=${ev.timezone || 'Africa/Douala'}:${formatIcsDateTime(ev.event_date as string, ev.end_time as string)}`,
      `SUMMARY:${escapeIcsText(ev.title_fr as string)}`,
      `DESCRIPTION:${escapeIcsText(`${ev.description_fr}\nOrganisateur : ${ev.organizer_entity}`)}`,
      `LOCATION:${escapeIcsText((ev.validated_location as string) || 'À confirmer par UNITRACA')}`,
      'END:VEVENT',
      'END:VCALENDAR',
    ];
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${ev.slug}.ics"`);
    res.send(lines.join('\r\n'));
  });

  router.get('/mediatheque', (req: AuthenticatedRequest, res) => {
    const rows = db
      .prepare("SELECT * FROM media_resources WHERE workflow_status = 'published' ORDER BY published_date DESC, id DESC")
      .all() as Array<Record<string, unknown>>;

    const result = rows.map((row) => {
      const hasAccess = userHasResourceAccess(
        db,
        req.currentUser,
        row.id as number,
        row.access_level as AccessLevel
      );
      return serializeMediaResource(row, hasAccess);
    });

    res.json(result);
  });

  router.get('/mediatheque/:slug', (req: AuthenticatedRequest, res) => {
    const row = db
      .prepare("SELECT * FROM media_resources WHERE slug = ? AND workflow_status = 'published'")
      .get(req.params.slug) as Record<string, unknown> | undefined;
    if (!row) return res.status(404).json({ error: 'Ressource introuvable.' });

    const hasAccess = userHasResourceAccess(
      db,
      req.currentUser,
      row.id as number,
      row.access_level as AccessLevel
    );
    res.json(serializeMediaResource(row, hasAccess));
  });

  router.get('/patrimoines', (_req, res) => {
    const rows = db
      .prepare("SELECT * FROM heritage_dossiers WHERE workflow_status = 'published' ORDER BY id ASC")
      .all() as Array<Record<string, unknown>>;
    res.json(
      rows.map((r) => ({
        ...r,
        sources: JSON.parse(r.sources_json as string),
        margin_notes: JSON.parse(r.margin_notes_json as string),
      }))
    );
  });

  router.get('/patrimoines/:slug', (req, res) => {
    const row = db
      .prepare("SELECT * FROM heritage_dossiers WHERE slug = ? AND workflow_status = 'published'")
      .get(req.params.slug) as Record<string, unknown> | undefined;
    if (!row) return res.status(404).json({ error: 'Dossier culturel introuvable.' });
    res.json({
      ...row,
      sources: JSON.parse(row.sources_json as string),
      margin_notes: JSON.parse(row.margin_notes_json as string),
    });
  });

  router.get('/faq', (_req, res) => {
    const rows = db
      .prepare("SELECT * FROM faq_items WHERE workflow_status = 'published' ORDER BY sort_order ASC, id ASC")
      .all();
    res.json(rows);
  });

  router.get('/testimonials', (_req, res) => {
    const rows = db
      .prepare("SELECT * FROM testimonials WHERE workflow_status = 'published' ORDER BY id ASC")
      .all() as Array<Record<string, unknown>>;
    res.json(
      rows.map((r) => ({
        ...r,
        is_verified: Boolean(r.is_verified),
      }))
    );
  });

  router.post('/testimonials', rateLimit('testimonials', 8, 60_000), (req: AuthenticatedRequest, res) => {
    const {
      author_name,
      author_role_fr,
      author_role_en,
      location,
      quote_fr,
      quote_en,
      context_fr,
      context_en,
      consent_charter,
    } = req.body || {};

    if (
      !String(author_name || '').trim() ||
      !String(location || '').trim() ||
      !String(quote_fr || '').trim()
    ) {
      return res.status(400).json({
        error: 'Veuillez renseigner votre nom, votre localisation et votre témoignage.',
      });
    }

    if (!consent_charter) {
      return res.status(400).json({
        error: 'Le respect de la charte éthique (absence de promesse médicale) est obligatoire.',
      });
    }

    const result = db
      .prepare(
        `INSERT INTO testimonials (
          author_name, author_role_fr, author_role_en, location,
          quote_fr, quote_en, context_fr, context_en, is_verified, workflow_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 0, 'validation')`
      )
      .run(
        String(author_name).trim().slice(0, 120),
        String(author_role_fr || 'Auditeur / Participant').trim().slice(0, 140),
        String(author_role_en || author_role_fr || 'Participant').trim().slice(0, 140),
        String(location).trim().slice(0, 120),
        String(quote_fr).trim().slice(0, 800),
        String(quote_en || quote_fr).trim().slice(0, 800),
        String(context_fr || 'Soumis pour validation éditoriale').trim().slice(0, 240),
        String(context_en || context_fr || 'Submitted for editorial validation').trim().slice(0, 240)
      );

    const newId = Number(result.lastInsertRowid);
    writeAuditLog(db, req.currentUser, 'SUBMIT_TESTIMONIAL', 'testimonial', newId);
    res.status(201).json({ id: newId, workflow_status: 'validation' });
  });

  // ---------------- PUBLIC SUBMISSIONS ----------------

  router.post('/registrations', rateLimit('registrations', 10, 60_000), (req: AuthenticatedRequest, res) => {
    const {
      teaching_id,
      last_name,
      first_name,
      country,
      city,
      email,
      phone,
      requested_language,
      requested_format,
      message,
      is_adult,
      minor_guardian_note,
      consent_data,
      consent_rules,
    } = req.body || {};

    if (
      !String(last_name || '').trim() ||
      !String(first_name || '').trim() ||
      !String(country || '').trim() ||
      !String(city || '').trim() ||
      !isValidEmail(String(email || '')) ||
      !String(requested_language || '').trim() ||
      !String(requested_format || '').trim()
    ) {
      return res.status(400).json({ error: 'Veuillez renseigner tous les champs obligatoires.' });
    }

    if (!consent_data || !consent_rules) {
      return res.status(400).json({
        error: 'Les consentements relatifs aux données et au cadre de participation sont requis.',
      });
    }

    const adultFlag = Boolean(is_adult);
    if (!adultFlag && !String(minor_guardian_note || '').trim()) {
      return res.status(400).json({
        error: 'Pour une personne mineure, les coordonnées et l’accord du représentant légal doivent être précisés.',
      });
    }

    let validTeachingId: number | null = null;
    if (teaching_id) {
      const t = db.prepare("SELECT id FROM teachings WHERE id = ? AND workflow_status = 'published'").get(Number(teaching_id));
      if (!t) {
        return res.status(400).json({ error: 'L’enseignement sélectionné n’est pas valide.' });
      }
      validTeachingId = Number(teaching_id);
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const result = db
      .prepare(
        `INSERT INTO registration_requests (
          user_id, teaching_id, last_name, first_name, country, city, email, phone,
          requested_language, requested_format, message, is_adult, minor_guardian_note,
          consent_data, consent_rules, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, 1, 'pending')`
      )
      .run(
        req.currentUser?.id ?? null,
        validTeachingId,
        String(last_name).trim(),
        String(first_name).trim(),
        String(country).trim(),
        String(city).trim(),
        normalizedEmail,
        String(phone || '').trim(),
        String(requested_language).trim(),
        String(requested_format).trim(),
        String(message || '').trim().slice(0, 2000),
        adultFlag ? 1 : 0,
        String(minor_guardian_note || '').trim().slice(0, 500)
      );

    const requestId = Number(result.lastInsertRowid);
    db.prepare('INSERT INTO consent_logs (user_id, email, consent_type, granted) VALUES (?, ?, ?, 1)').run(
      req.currentUser?.id ?? null,
      normalizedEmail,
      'registration_request'
    );

    writeAuditLog(db, req.currentUser, 'CREATE_REGISTRATION_REQUEST', 'registration_request', requestId, {
      teaching_id: validTeachingId,
    });

    res.status(201).json({
      id: requestId,
      status: 'pending',
      created_at: new Date().toISOString(),
    });
  });

  router.post('/contact', rateLimit('contact', 10, 60_000), (req: AuthenticatedRequest, res) => {
    const { request_type, sender_name, sender_email, subject, related_url, message, consent_data } = req.body || {};
    const allowedTypes = ['general', 'media_correction', 'media_removal', 'validation'];
    const safeType = allowedTypes.includes(request_type) ? request_type : 'general';

    if (
      !String(sender_name || '').trim() ||
      !isValidEmail(String(sender_email || '')) ||
      !String(subject || '').trim() ||
      !String(message || '').trim()
    ) {
      return res.status(400).json({ error: 'Veuillez compléter votre nom, e-mail, objet et message.' });
    }

    if (!consent_data) {
      return res.status(400).json({ error: 'Le consentement au traitement de votre message est requis.' });
    }

    const normalizedEmail = String(sender_email).trim().toLowerCase();
    const result = db
      .prepare(
        `INSERT INTO contact_requests (request_type, sender_name, sender_email, subject, related_url, message, consent_data, status)
         VALUES (?, ?, ?, ?, ?, ?, 1, 'new')`
      )
      .run(
        safeType,
        String(sender_name).trim(),
        normalizedEmail,
        String(subject).trim().slice(0, 200),
        String(related_url || '').trim().slice(0, 400),
        String(message).trim().slice(0, 3000)
      );

    db.prepare('INSERT INTO consent_logs (user_id, email, consent_type, granted) VALUES (?, ?, ?, 1)').run(
      req.currentUser?.id ?? null,
      normalizedEmail,
      `contact_${safeType}`
    );

    const contactId = Number(result.lastInsertRowid);
    writeAuditLog(db, req.currentUser, 'CREATE_CONTACT_REQUEST', 'contact_request', contactId, { type: safeType });

    res.status(201).json({ id: contactId, status: 'new' });
  });

  // ---------------- MEMBER SPACE ----------------

  router.get('/member/overview', requireAuth, (req: AuthenticatedRequest, res) => {
    const user = req.currentUser!;

    const registrations = db
      .prepare(
        `SELECT r.*, t.title_fr as teaching_title
         FROM registration_requests r
         LEFT JOIN teachings t ON t.id = r.teaching_id
         WHERE r.user_id = ? OR LOWER(r.email) = LOWER(?)
         ORDER BY r.created_at DESC`
      )
      .all(user.id, user.email) as Array<Record<string, unknown>>;

    const mediaRows = db
      .prepare("SELECT * FROM media_resources WHERE workflow_status = 'published' AND access_level IN ('member', 'restricted') ORDER BY published_date DESC")
      .all() as Array<Record<string, unknown>>;

    const accessibleResources = mediaRows
      .filter((row) => userHasResourceAccess(db, user, row.id as number, row.access_level as AccessLevel))
      .map((row) => serializeMediaResource(row, true));

    const messages = db
      .prepare(
        `SELECT m.*, u.full_name as sender_name
         FROM admin_messages m
         LEFT JOIN users u ON u.id = m.sender_user_id
         WHERE m.recipient_user_id = ?
         ORDER BY m.created_at DESC`
      )
      .all(user.id) as Array<Record<string, unknown>>;

    const events = db
      .prepare("SELECT * FROM events WHERE workflow_status = 'published' ORDER BY event_date ASC")
      .all() as Array<Record<string, unknown>>;

    res.json({
      registrations: registrations.map((r) => ({
        ...r,
        is_adult: Boolean(r.is_adult),
        consent_data: Boolean(r.consent_data),
        consent_rules: Boolean(r.consent_rules),
      })),
      accessibleResources,
      messages: messages.map((m) => ({
        ...m,
        is_read: Boolean(m.is_read),
      })),
      calendarEvents: events.map((e) => ({
        ...e,
        speakers: JSON.parse(e.speakers_json as string),
        location_verified: Boolean(e.location_verified),
        registration_open: Boolean(e.registration_open),
      })),
    });
  });

  router.patch('/member/registrations/:id/cancel', requireAuth, (req: AuthenticatedRequest, res) => {
    const user = req.currentUser!;
    const reg = db.prepare('SELECT * FROM registration_requests WHERE id = ?').get(Number(req.params.id)) as
      | (Record<string, unknown> & { user_id: number | null; email: string; status: RegistrationStatus })
      | undefined;

    if (!reg) return res.status(404).json({ error: 'Demande introuvable.' });
    if (reg.user_id !== user.id && reg.email.toLowerCase() !== user.email.toLowerCase()) {
      return res.status(403).json({ error: 'Action non autorisée sur cette demande.' });
    }
    if (!['pending', 'under_review'].includes(reg.status)) {
      return res.status(400).json({ error: 'Seule une demande en attente ou en cours d’examen peut être annulée.' });
    }

    db.prepare("UPDATE registration_requests SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?").run(reg.id);
    writeAuditLog(db, user, 'CANCEL_REGISTRATION', 'registration_request', reg.id as number);
    res.json({ ok: true, status: 'cancelled' });
  });

  router.patch('/member/messages/:id/read', requireAuth, (req: AuthenticatedRequest, res) => {
    const user = req.currentUser!;
    const msg = db.prepare('SELECT id, recipient_user_id FROM admin_messages WHERE id = ?').get(Number(req.params.id)) as
      | { id: number; recipient_user_id: number }
      | undefined;
    if (!msg) return res.status(404).json({ error: 'Message introuvable.' });
    if (msg.recipient_user_id !== user.id) {
      return res.status(403).json({ error: 'Accès refusé.' });
    }
    db.prepare('UPDATE admin_messages SET is_read = 1 WHERE id = ?').run(msg.id);
    res.json({ ok: true });
  });

  // ---------------- ADMIN & EDITORIAL CMS ----------------

  router.get('/admin/overview', requireRole(['admin', 'editor']), (req: AuthenticatedRequest, res) => {
    const isAdmin = req.currentUser!.role === 'admin';
    const teachings = db.prepare('SELECT * FROM teachings ORDER BY updated_at DESC').all() as Array<Record<string, unknown>>;
    const events = db.prepare('SELECT * FROM events ORDER BY event_date ASC').all() as Array<Record<string, unknown>>;
    const media = db.prepare('SELECT * FROM media_resources ORDER BY updated_at DESC').all() as Array<Record<string, unknown>>;
    const dossiers = db.prepare('SELECT * FROM heritage_dossiers ORDER BY updated_at DESC').all() as Array<Record<string, unknown>>;
    const faqs = db.prepare('SELECT * FROM faq_items ORDER BY sort_order ASC').all();
    const registrations = db
      .prepare(
        `SELECT r.*, t.title_fr as teaching_title
         FROM registration_requests r
         LEFT JOIN teachings t ON t.id = r.teaching_id
         ORDER BY r.created_at DESC`
      )
      .all() as Array<Record<string, unknown>>;
    const contacts = db.prepare('SELECT * FROM contact_requests ORDER BY created_at DESC').all();
    const grants = db
      .prepare(
        `SELECT g.*, u.email as user_email, u.full_name as user_name, m.title_fr as resource_title
         FROM resource_access_grants g
         JOIN users u ON u.id = g.user_id
         JOIN media_resources m ON m.id = g.resource_id
         ORDER BY g.created_at DESC`
      )
      .all();
    const founderRow = db.prepare('SELECT * FROM founder_profile WHERE id = 1').get() as Record<string, unknown>;
    const users = isAdmin
      ? (db
          .prepare('SELECT id, email, full_name, preferred_name, country, city, role, preferred_language, is_active, created_at FROM users ORDER BY created_at DESC')
          .all() as Array<Record<string, unknown>>)
      : (db
          .prepare('SELECT id, email, full_name, role FROM users WHERE is_active = 1 ORDER BY full_name ASC')
          .all() as Array<Record<string, unknown>>);
    const auditLogs = isAdmin
      ? db.prepare('SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 80').all()
      : [];

    res.json({
      settings: getSiteSettings(db),
      founder: founderRow
        ? {
            ...founderRow,
            titles: JSON.parse(founderRow.titles_json as string),
            gallery: JSON.parse(founderRow.gallery_json as string),
            publications: JSON.parse(founderRow.publications_json as string),
            interventions: JSON.parse(founderRow.interventions_json as string),
          }
        : null,
      teachings: teachings.map((t) => ({ ...t, price_validated: Boolean(t.price_validated), is_featured: Boolean(t.is_featured) })),
      events: events.map((e) => ({
        ...e,
        speakers: JSON.parse(e.speakers_json as string),
        location_verified: Boolean(e.location_verified),
        registration_open: Boolean(e.registration_open),
      })),
      media: media.map((m) => serializeMediaResource(m, true)),
      dossiers: dossiers.map((d) => ({
        ...d,
        sources: JSON.parse(d.sources_json as string),
        margin_notes: JSON.parse(d.margin_notes_json as string),
      })),
      faqs,
      registrations: registrations.map((r) => ({
        ...r,
        is_adult: Boolean(r.is_adult),
        consent_data: Boolean(r.consent_data),
        consent_rules: Boolean(r.consent_rules),
      })),
      contacts,
      grants,
      users: users.map((u) => ({ ...u, is_active: u.is_active === undefined ? true : Boolean(u.is_active) })),
      auditLogs,
    });
  });

  router.put('/admin/site-settings', requireRole(['admin']), (req: AuthenticatedRequest, res) => {
    const incoming = req.body as Partial<SiteSettings>;
    const current = getSiteSettings(db);
    const merged: SiteSettings = {
      ...current,
      ...incoming,
      theme: { ...current.theme, ...(incoming.theme || {}) },
      hero: { ...current.hero, ...(incoming.hero || {}) },
      social: { ...current.social, ...(incoming.social || {}) },
      payments: { ...current.payments, ...(incoming.payments || {}) },
      languages: { ...current.languages, ...(incoming.languages || {}) },
    };

    db.prepare(
      `UPDATE site_settings SET value_json = ?, updated_by = ?, updated_at = datetime('now') WHERE key = 'main'`
    ).run(JSON.stringify(merged), req.currentUser!.id);

    writeAuditLog(db, req.currentUser, 'UPDATE_SITE_SETTINGS', 'site_settings', 'main');
    res.json(merged);
  });

  router.put('/admin/founder', requireRole(['admin', 'editor']), (req: AuthenticatedRequest, res) => {
    const b = req.body || {};
    const allowedStatuses: WorkflowStatus[] = ['draft', 'validation', 'published', 'archived'];
    const wfStatus = allowedStatuses.includes(b.workflow_status) ? b.workflow_status : 'published';

    db.prepare(
      `UPDATE founder_profile SET
        display_name = ?, titles_json = ?, author_attribution = ?, portrait_url = ?, portrait_credit = ?,
        gallery_json = ?, bio_fr = ?, bio_en = ?, public_journey_fr = ?, public_journey_en = ?,
        publications_json = ?, interventions_json = ?, personal_message_fr = ?, personal_message_en = ?,
        oral_tradition_note_fr = ?, oral_tradition_note_en = ?, workflow_status = ?, updated_at = datetime('now')
       WHERE id = 1`
    ).run(
      String(b.display_name || 'Fo’o Tchamaleu'),
      JSON.stringify(Array.isArray(b.titles) ? b.titles : []),
      String(b.author_attribution || ''),
      String(b.portrait_url || '/assets/aistudio/images__1__26f818f9.jpg'),
      String(b.portrait_credit || ''),
      JSON.stringify(Array.isArray(b.gallery) ? b.gallery : []),
      String(b.bio_fr || ''),
      String(b.bio_en || ''),
      String(b.public_journey_fr || ''),
      String(b.public_journey_en || ''),
      JSON.stringify(Array.isArray(b.publications) ? b.publications : []),
      JSON.stringify(Array.isArray(b.interventions) ? b.interventions : []),
      String(b.personal_message_fr || ''),
      String(b.personal_message_en || ''),
      String(b.oral_tradition_note_fr || ''),
      String(b.oral_tradition_note_en || ''),
      wfStatus
    );

    writeAuditLog(db, req.currentUser, 'UPDATE_FOUNDER_PROFILE', 'founder_profile', 1, { workflow_status: wfStatus });
    res.json({ ok: true });
  });

  // Teachings CRUD
  router.post('/admin/teachings', requireRole(['admin', 'editor']), (req: AuthenticatedRequest, res) => {
    const b = req.body || {};
    if (!String(b.title_fr || '').trim()) {
      return res.status(400).json({ error: 'Le titre en français est obligatoire.' });
    }
    const baseSlug = slugify(b.slug || b.title_fr) || `enseignement-${Date.now()}`;
    const exists = db.prepare('SELECT id FROM teachings WHERE slug = ?').get(baseSlug);
    const finalSlug = exists ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

    const result = db
      .prepare(
        `INSERT INTO teachings (
          slug, title_fr, title_en, summary_fr, summary_en, objectives_fr, objectives_en,
          speaker, tradition_context, language_offered, format, duration,
          target_audience_fr, target_audience_en, prerequisites_fr, prerequisites_en,
          schedule_note_fr, schedule_note_en, location_or_mode, price_validated, price_display,
          conditions_fr, conditions_en, limits_notice_fr, limits_notice_en, cover_image,
          enrollment_status, workflow_status, is_featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        finalSlug,
        String(b.title_fr).trim(),
        String(b.title_en || b.title_fr).trim(),
        String(b.summary_fr || ''),
        String(b.summary_en || b.summary_fr || ''),
        String(b.objectives_fr || ''),
        String(b.objectives_en || b.objectives_fr || ''),
        String(b.speaker || 'À confirmer'),
        String(b.tradition_context || 'Contexte à préciser'),
        String(b.language_offered || 'Français'),
        String(b.format || 'Atelier'),
        String(b.duration || 'À confirmer'),
        String(b.target_audience_fr || 'Adultes'),
        String(b.target_audience_en || 'Adults'),
        String(b.prerequisites_fr || 'Aucun prérequis académique'),
        String(b.prerequisites_en || 'No academic prerequisites'),
        String(b.schedule_note_fr || 'À annoncer'),
        String(b.schedule_note_en || 'To be announced'),
        String(b.location_or_mode || 'À confirmer'),
        b.price_validated ? 1 : 0,
        String(b.price_display || 'Tarifs à valider par UNITRACA'),
        String(b.conditions_fr || 'Demande soumise à validation administrative.'),
        String(b.conditions_en || 'Request subject to administrative review.'),
        String(b.limits_notice_fr || 'Aucun diplôme reconnu ni promesse médicale.'),
        String(b.limits_notice_en || 'No recognized academic degree or medical promise.'),
        String(b.cover_image || '/src/assets/images/teaching_transmission_culturelle_1794685227484.jpg'),
        b.enrollment_status || 'to_announce',
        b.workflow_status || 'draft',
        b.is_featured ? 1 : 0
      );

    const newId = Number(result.lastInsertRowid);
    writeAuditLog(db, req.currentUser, 'CREATE_TEACHING', 'teaching', newId, { slug: finalSlug });
    res.status(201).json({ id: newId, slug: finalSlug });
  });

  router.patch('/admin/teachings/:id', requireRole(['admin', 'editor']), (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM teachings WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!existing) return res.status(404).json({ error: 'Enseignement introuvable.' });

    const b = req.body || {};
    db.prepare(
      `UPDATE teachings SET
        title_fr = ?, title_en = ?, summary_fr = ?, summary_en = ?, objectives_fr = ?, objectives_en = ?,
        speaker = ?, tradition_context = ?, language_offered = ?, format = ?, duration = ?,
        target_audience_fr = ?, target_audience_en = ?, prerequisites_fr = ?, prerequisites_en = ?,
        schedule_note_fr = ?, schedule_note_en = ?, location_or_mode = ?, price_validated = ?, price_display = ?,
        conditions_fr = ?, conditions_en = ?, limits_notice_fr = ?, limits_notice_en = ?, cover_image = ?,
        enrollment_status = ?, workflow_status = ?, is_featured = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).run(
      b.title_fr ?? existing.title_fr,
      b.title_en ?? existing.title_en,
      b.summary_fr ?? existing.summary_fr,
      b.summary_en ?? existing.summary_en,
      b.objectives_fr ?? existing.objectives_fr,
      b.objectives_en ?? existing.objectives_en,
      b.speaker ?? existing.speaker,
      b.tradition_context ?? existing.tradition_context,
      b.language_offered ?? existing.language_offered,
      b.format ?? existing.format,
      b.duration ?? existing.duration,
      b.target_audience_fr ?? existing.target_audience_fr,
      b.target_audience_en ?? existing.target_audience_en,
      b.prerequisites_fr ?? existing.prerequisites_fr,
      b.prerequisites_en ?? existing.prerequisites_en,
      b.schedule_note_fr ?? existing.schedule_note_fr,
      b.schedule_note_en ?? existing.schedule_note_en,
      b.location_or_mode ?? existing.location_or_mode,
      b.price_validated === undefined ? existing.price_validated : b.price_validated ? 1 : 0,
      b.price_display ?? existing.price_display,
      b.conditions_fr ?? existing.conditions_fr,
      b.conditions_en ?? existing.conditions_en,
      b.limits_notice_fr ?? existing.limits_notice_fr,
      b.limits_notice_en ?? existing.limits_notice_en,
      b.cover_image ?? existing.cover_image,
      b.enrollment_status ?? existing.enrollment_status,
      b.workflow_status ?? existing.workflow_status,
      b.is_featured === undefined ? existing.is_featured : b.is_featured ? 1 : 0,
      id
    );

    writeAuditLog(db, req.currentUser, 'UPDATE_TEACHING', 'teaching', id, {
      workflow_status: b.workflow_status ?? existing.workflow_status,
      enrollment_status: b.enrollment_status ?? existing.enrollment_status,
    });
    res.json({ ok: true });
  });

  // Events CRUD
  router.post('/admin/events', requireRole(['admin', 'editor']), (req: AuthenticatedRequest, res) => {
    const b = req.body || {};
    if (!String(b.title_fr || '').trim() || !String(b.event_date || '').trim()) {
      return res.status(400).json({ error: 'Titre et date de l’événement requis.' });
    }
    const baseSlug = slugify(b.slug || b.title_fr) || `evenement-${Date.now()}`;
    const exists = db.prepare('SELECT id FROM events WHERE slug = ?').get(baseSlug);
    const finalSlug = exists ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

    const result = db
      .prepare(
        `INSERT INTO events (
          slug, title_fr, title_en, description_fr, description_en, organizer_entity,
          event_date, start_time, end_time, timezone, format, validated_location,
          location_verified, speakers_json, program_fr, program_en, conditions_fr, conditions_en,
          accessibility_fr, accessibility_en, registration_open, workflow_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        finalSlug,
        String(b.title_fr).trim(),
        String(b.title_en || b.title_fr).trim(),
        String(b.description_fr || ''),
        String(b.description_en || b.description_fr || ''),
        String(b.organizer_entity || 'UNITRACA'),
        String(b.event_date),
        String(b.start_time || '15:00'),
        String(b.end_time || '17:00'),
        String(b.timezone || 'Africa/Douala'),
        String(b.format || 'Rencontre'),
        String(b.validated_location || 'Lieu à confirmer'),
        b.location_verified ? 1 : 0,
        JSON.stringify(Array.isArray(b.speakers) ? b.speakers : ['Intervenant à confirmer']),
        String(b.program_fr || ''),
        String(b.program_en || ''),
        String(b.conditions_fr || ''),
        String(b.conditions_en || ''),
        String(b.accessibility_fr || ''),
        String(b.accessibility_en || ''),
        b.registration_open ? 1 : 0,
        b.workflow_status || 'draft'
      );

    const newId = Number(result.lastInsertRowid);
    writeAuditLog(db, req.currentUser, 'CREATE_EVENT', 'event', newId, { slug: finalSlug });
    res.status(201).json({ id: newId, slug: finalSlug });
  });

  router.patch('/admin/events/:id', requireRole(['admin', 'editor']), (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM events WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!existing) return res.status(404).json({ error: 'Événement introuvable.' });

    const b = req.body || {};
    db.prepare(
      `UPDATE events SET
        title_fr = ?, title_en = ?, description_fr = ?, description_en = ?, organizer_entity = ?,
        event_date = ?, start_time = ?, end_time = ?, timezone = ?, format = ?, validated_location = ?,
        location_verified = ?, speakers_json = ?, program_fr = ?, program_en = ?, conditions_fr = ?, conditions_en = ?,
        accessibility_fr = ?, accessibility_en = ?, registration_open = ?, workflow_status = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).run(
      b.title_fr ?? existing.title_fr,
      b.title_en ?? existing.title_en,
      b.description_fr ?? existing.description_fr,
      b.description_en ?? existing.description_en,
      b.organizer_entity ?? existing.organizer_entity,
      b.event_date ?? existing.event_date,
      b.start_time ?? existing.start_time,
      b.end_time ?? existing.end_time,
      b.timezone ?? existing.timezone,
      b.format ?? existing.format,
      b.validated_location ?? existing.validated_location,
      b.location_verified === undefined ? existing.location_verified : b.location_verified ? 1 : 0,
      b.speakers ? JSON.stringify(b.speakers) : existing.speakers_json,
      b.program_fr ?? existing.program_fr,
      b.program_en ?? existing.program_en,
      b.conditions_fr ?? existing.conditions_fr,
      b.conditions_en ?? existing.conditions_en,
      b.accessibility_fr ?? existing.accessibility_fr,
      b.accessibility_en ?? existing.accessibility_en,
      b.registration_open === undefined ? existing.registration_open : b.registration_open ? 1 : 0,
      b.workflow_status ?? existing.workflow_status,
      id
    );

    writeAuditLog(db, req.currentUser, 'UPDATE_EVENT', 'event', id, { workflow_status: b.workflow_status ?? existing.workflow_status });
    res.json({ ok: true });
  });

  // Media Resources CRUD + Rights Management
  router.post('/admin/mediatheque', requireRole(['admin', 'editor']), (req: AuthenticatedRequest, res) => {
    const b = req.body || {};
    if (!String(b.title_fr || '').trim()) {
      return res.status(400).json({ error: 'Le titre en français est obligatoire.' });
    }
    const baseSlug = slugify(b.slug || b.title_fr) || `ressource-${Date.now()}`;
    const exists = db.prepare('SELECT id FROM media_resources WHERE slug = ?').get(baseSlug);
    const finalSlug = exists ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

    const result = db
      .prepare(
        `INSERT INTO media_resources (
          slug, title_fr, title_en, category, theme, speaker, language,
          community_context, holder_or_author, authorization_status, diffusion_conditions,
          credit, published_date, access_level, thumbnail_url, embed_url,
          summary_fr, summary_en, body_fr, body_en, transcript_fr, transcript_en,
          subtitles_available, health_disclaimer_required, workflow_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        finalSlug,
        String(b.title_fr).trim(),
        String(b.title_en || b.title_fr).trim(),
        b.category || 'article',
        String(b.theme || 'Traditions'),
        String(b.speaker || 'UNITRACA'),
        String(b.language || 'Français'),
        String(b.community_context || 'Contexte à préciser'),
        String(b.holder_or_author || 'UNITRACA'),
        b.authorization_status || 'pending_validation',
        String(b.diffusion_conditions || 'Droits en cours de vérification.'),
        String(b.credit || 'Crédit à confirmer'),
        String(b.published_date || new Date().toISOString().slice(0, 10)),
        b.access_level || 'public',
        String(b.thumbnail_url || ''),
        String(b.embed_url || ''),
        String(b.summary_fr || ''),
        String(b.summary_en || b.summary_fr || ''),
        String(b.body_fr || ''),
        String(b.body_en || b.body_fr || ''),
        String(b.transcript_fr || ''),
        String(b.transcript_en || ''),
        b.subtitles_available ? 1 : 0,
        b.health_disclaimer_required ? 1 : 0,
        b.workflow_status || 'draft'
      );

    const newId = Number(result.lastInsertRowid);
    writeAuditLog(db, req.currentUser, 'CREATE_MEDIA_RESOURCE', 'media_resource', newId, {
      access_level: b.access_level || 'public',
    });
    res.status(201).json({ id: newId, slug: finalSlug });
  });

  router.patch('/admin/mediatheque/:id', requireRole(['admin', 'editor']), (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM media_resources WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!existing) return res.status(404).json({ error: 'Ressource introuvable.' });

    const b = req.body || {};
    db.prepare(
      `UPDATE media_resources SET
        title_fr = ?, title_en = ?, category = ?, theme = ?, speaker = ?, language = ?,
        community_context = ?, holder_or_author = ?, authorization_status = ?, diffusion_conditions = ?,
        credit = ?, published_date = ?, access_level = ?, thumbnail_url = ?, embed_url = ?,
        summary_fr = ?, summary_en = ?, body_fr = ?, body_en = ?, transcript_fr = ?, transcript_en = ?,
        subtitles_available = ?, health_disclaimer_required = ?, workflow_status = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).run(
      b.title_fr ?? existing.title_fr,
      b.title_en ?? existing.title_en,
      b.category ?? existing.category,
      b.theme ?? existing.theme,
      b.speaker ?? existing.speaker,
      b.language ?? existing.language,
      b.community_context ?? existing.community_context,
      b.holder_or_author ?? existing.holder_or_author,
      b.authorization_status ?? existing.authorization_status,
      b.diffusion_conditions ?? existing.diffusion_conditions,
      b.credit ?? existing.credit,
      b.published_date ?? existing.published_date,
      b.access_level ?? existing.access_level,
      b.thumbnail_url ?? existing.thumbnail_url,
      b.embed_url ?? existing.embed_url,
      b.summary_fr ?? existing.summary_fr,
      b.summary_en ?? existing.summary_en,
      b.body_fr ?? existing.body_fr,
      b.body_en ?? existing.body_en,
      b.transcript_fr ?? existing.transcript_fr,
      b.transcript_en ?? existing.transcript_en,
      b.subtitles_available === undefined ? existing.subtitles_available : b.subtitles_available ? 1 : 0,
      b.health_disclaimer_required === undefined ? existing.health_disclaimer_required : b.health_disclaimer_required ? 1 : 0,
      b.workflow_status ?? existing.workflow_status,
      id
    );

    writeAuditLog(db, req.currentUser, 'UPDATE_MEDIA_RESOURCE', 'media_resource', id, {
      access_level: b.access_level ?? existing.access_level,
      authorization_status: b.authorization_status ?? existing.authorization_status,
      workflow_status: b.workflow_status ?? existing.workflow_status,
    });
    res.json({ ok: true });
  });

  // Heritage Dossiers CRUD
  router.post('/admin/patrimoines', requireRole(['admin', 'editor']), (req: AuthenticatedRequest, res) => {
    const b = req.body || {};
    if (!String(b.title_fr || '').trim()) {
      return res.status(400).json({ error: 'Le titre du dossier est obligatoire.' });
    }
    const baseSlug = slugify(b.slug || b.title_fr) || `dossier-${Date.now()}`;
    const exists = db.prepare('SELECT id FROM heritage_dossiers WHERE slug = ?').get(baseSlug);
    const finalSlug = exists ? `${baseSlug}-${Date.now().toString().slice(-4)}` : baseSlug;

    const result = db
      .prepare(
        `INSERT INTO heritage_dossiers (
          slug, title_fr, title_en, community_or_tradition, region,
          summary_fr, summary_en, documented_context_fr, documented_context_en,
          oral_tradition_fr, oral_tradition_en, interpretation_fr, interpretation_en,
          sources_json, margin_notes_json, cover_image, image_credit, workflow_status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .run(
        finalSlug,
        String(b.title_fr).trim(),
        String(b.title_en || b.title_fr).trim(),
        String(b.community_or_tradition || 'Communauté à préciser'),
        String(b.region || 'Région à préciser'),
        String(b.summary_fr || ''),
        String(b.summary_en || b.summary_fr || ''),
        String(b.documented_context_fr || ''),
        String(b.documented_context_en || ''),
        String(b.oral_tradition_fr || ''),
        String(b.oral_tradition_en || ''),
        String(b.interpretation_fr || ''),
        String(b.interpretation_en || ''),
        JSON.stringify(Array.isArray(b.sources) ? b.sources : []),
        JSON.stringify(Array.isArray(b.margin_notes) ? b.margin_notes : []),
        String(b.cover_image || ''),
        String(b.image_credit || ''),
        b.workflow_status || 'draft'
      );

    const newId = Number(result.lastInsertRowid);
    writeAuditLog(db, req.currentUser, 'CREATE_HERITAGE_DOSSIER', 'heritage_dossier', newId);
    res.status(201).json({ id: newId, slug: finalSlug });
  });

  router.patch('/admin/patrimoines/:id', requireRole(['admin', 'editor']), (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    const existing = db.prepare('SELECT * FROM heritage_dossiers WHERE id = ?').get(id) as Record<string, unknown> | undefined;
    if (!existing) return res.status(404).json({ error: 'Dossier introuvable.' });

    const b = req.body || {};
    db.prepare(
      `UPDATE heritage_dossiers SET
        title_fr = ?, title_en = ?, community_or_tradition = ?, region = ?,
        summary_fr = ?, summary_en = ?, documented_context_fr = ?, documented_context_en = ?,
        oral_tradition_fr = ?, oral_tradition_en = ?, interpretation_fr = ?, interpretation_en = ?,
        workflow_status = ?, updated_at = datetime('now')
       WHERE id = ?`
    ).run(
      b.title_fr ?? existing.title_fr,
      b.title_en ?? existing.title_en,
      b.community_or_tradition ?? existing.community_or_tradition,
      b.region ?? existing.region,
      b.summary_fr ?? existing.summary_fr,
      b.summary_en ?? existing.summary_en,
      b.documented_context_fr ?? existing.documented_context_fr,
      b.documented_context_en ?? existing.documented_context_en,
      b.oral_tradition_fr ?? existing.oral_tradition_fr,
      b.oral_tradition_en ?? existing.oral_tradition_en,
      b.interpretation_fr ?? existing.interpretation_fr,
      b.interpretation_en ?? existing.interpretation_en,
      b.workflow_status ?? existing.workflow_status,
      id
    );

    writeAuditLog(db, req.currentUser, 'UPDATE_HERITAGE_DOSSIER', 'heritage_dossier', id, {
      workflow_status: b.workflow_status ?? existing.workflow_status,
    });
    res.json({ ok: true });
  });

  // Registration review
  router.patch('/admin/registrations/:id', requireRole(['admin', 'editor']), (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    const reg = db.prepare('SELECT * FROM registration_requests WHERE id = ?').get(id) as
      | (Record<string, unknown> & { user_id: number | null; first_name: string; last_name: string })
      | undefined;
    if (!reg) return res.status(404).json({ error: 'Demande introuvable.' });

    const { status, admin_notes, notify_member_message } = req.body || {};
    const allowed: RegistrationStatus[] = ['pending', 'under_review', 'accepted', 'declined', 'cancelled'];
    if (!allowed.includes(status)) {
      return res.status(400).json({ error: 'Statut de demande invalide.' });
    }

    db.prepare(
      `UPDATE registration_requests SET status = ?, admin_notes = ?, updated_at = datetime('now') WHERE id = ?`
    ).run(status, String(admin_notes ?? reg.admin_notes ?? ''), id);

    if (notify_member_message && reg.user_id) {
      db.prepare(
        'INSERT INTO admin_messages (recipient_user_id, sender_user_id, subject, body) VALUES (?, ?, ?, ?)'
      ).run(
        reg.user_id,
        req.currentUser!.id,
        `Suivi de votre demande d’inscription (#${id})`,
        String(notify_member_message).trim()
      );
    }

    writeAuditLog(db, req.currentUser, 'REVIEW_REGISTRATION', 'registration_request', id, { status });
    res.json({ ok: true });
  });

  // Contact / Media rights requests review
  router.patch('/admin/contact/:id', requireRole(['admin', 'editor']), (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    const { status, admin_response } = req.body || {};
    if (!['new', 'in_review', 'resolved'].includes(status)) {
      return res.status(400).json({ error: 'Statut invalide.' });
    }
    db.prepare('UPDATE contact_requests SET status = ?, admin_response = ? WHERE id = ?').run(
      status,
      String(admin_response || ''),
      id
    );
    writeAuditLog(db, req.currentUser, 'UPDATE_CONTACT_REQUEST', 'contact_request', id, { status });
    res.json({ ok: true });
  });

  // Restricted resource access grants (admin only)
  router.post('/admin/grants', requireRole(['admin']), (req: AuthenticatedRequest, res) => {
    const { user_id, resource_id, reason } = req.body || {};
    if (!user_id || !resource_id) {
      return res.status(400).json({ error: 'Utilisateur et ressource requis.' });
    }
    db.prepare(
      `INSERT INTO resource_access_grants (user_id, resource_id, granted_by, reason)
       VALUES (?, ?, ?, ?)
       ON CONFLICT(user_id, resource_id) DO UPDATE SET granted_by = excluded.granted_by, reason = excluded.reason`
    ).run(Number(user_id), Number(resource_id), req.currentUser!.id, String(reason || '').trim());

    writeAuditLog(db, req.currentUser, 'GRANT_RESTRICTED_ACCESS', 'resource_access_grant', `${user_id}:${resource_id}`, {
      reason,
    });
    res.status(201).json({ ok: true });
  });

  router.delete('/admin/grants/:id', requireRole(['admin']), (req: AuthenticatedRequest, res) => {
    const id = Number(req.params.id);
    db.prepare('DELETE FROM resource_access_grants WHERE id = ?').run(id);
    writeAuditLog(db, req.currentUser, 'REVOKE_RESTRICTED_ACCESS', 'resource_access_grant', id);
    res.json({ ok: true });
  });

  // Administrative messages to members
  router.post('/admin/messages', requireRole(['admin', 'editor']), (req: AuthenticatedRequest, res) => {
    const { recipient_user_id, subject, body } = req.body || {};
    if (!recipient_user_id || !String(subject || '').trim() || !String(body || '').trim()) {
      return res.status(400).json({ error: 'Destinataire, objet et message requis.' });
    }
    const result = db
      .prepare('INSERT INTO admin_messages (recipient_user_id, sender_user_id, subject, body) VALUES (?, ?, ?, ?)')
      .run(Number(recipient_user_id), req.currentUser!.id, String(subject).trim(), String(body).trim());

    writeAuditLog(db, req.currentUser, 'SEND_ADMIN_MESSAGE', 'admin_message', Number(result.lastInsertRowid), {
      recipient_user_id,
    });
    res.status(201).json({ id: Number(result.lastInsertRowid) });
  });

  // User role & activation management (admin only)
  router.patch('/admin/users/:id/role', requireRole(['admin']), (req: AuthenticatedRequest, res) => {
    const targetId = Number(req.params.id);
    const { role, is_active } = req.body || {};
    const allowedRoles: UserRole[] = ['member', 'editor', 'admin'];
    if (role && !allowedRoles.includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide.' });
    }
    if (targetId === req.currentUser!.id && (role !== 'admin' || is_active === false)) {
      return res.status(400).json({ error: 'Vous ne pouvez pas rétrograder ou désactiver votre propre compte administrateur.' });
    }

    const existing = db.prepare('SELECT role, is_active FROM users WHERE id = ?').get(targetId) as
      | { role: UserRole; is_active: number }
      | undefined;
    if (!existing) return res.status(404).json({ error: 'Compte introuvable.' });

    db.prepare(`UPDATE users SET role = ?, is_active = ?, updated_at = datetime('now') WHERE id = ?`).run(
      role || existing.role,
      is_active === undefined ? existing.is_active : is_active ? 1 : 0,
      targetId
    );
    writeAuditLog(db, req.currentUser, 'UPDATE_USER_ROLE', 'user', targetId, { role, is_active });
    res.json({ ok: true });
  });

  // Authorized CSV export (admin only)
  router.get('/admin/export/registrations.csv', requireRole(['admin']), (req: AuthenticatedRequest, res) => {
    const rows = db
      .prepare(
        `SELECT r.id, r.created_at, r.status, r.last_name, r.first_name, r.email, r.country, r.city,
                r.requested_language, r.requested_format, r.is_adult, t.title_fr as teaching_title
         FROM registration_requests r
         LEFT JOIN teachings t ON t.id = r.teaching_id
         ORDER BY r.created_at DESC`
      )
      .all() as Array<Record<string, unknown>>;

    const headers = [
      'ID',
      'Date',
      'Statut',
      'Nom',
      'Prenom',
      'Email',
      'Pays',
      'Ville',
      'Langue',
      'Format',
      'Majeur',
      'Enseignement',
    ];
    const lines = [headers.join(',')];
    for (const r of rows) {
      lines.push(
        [
          r.id,
          r.created_at,
          r.status,
          r.last_name,
          r.first_name,
          r.email,
          r.country,
          r.city,
          r.requested_language,
          r.requested_format,
          r.is_adult ? 'Oui' : 'Mineur_encadre',
          r.teaching_title || 'General',
        ]
          .map(escapeCsvCell)
          .join(',')
      );
    }

    writeAuditLog(db, req.currentUser, 'EXPORT_REGISTRATIONS_CSV', 'registration_request', 'all', {
      count: rows.length,
    });

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', 'attachment; filename="unitraca-inscriptions.csv"');
    res.send(lines.join('\r\n'));
  });

  return router;
}
