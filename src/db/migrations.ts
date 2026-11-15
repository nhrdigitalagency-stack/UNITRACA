import type Database from 'better-sqlite3';

export interface Migration {
  version: string;
  description: string;
  up: (db: Database.Database) => void;
}

export const migrations: Migration[] = [
  {
    version: '001_initial_schema',
    description: 'Create core tables for accounts, sessions, CMS, teachings, events, media rights, heritage, registrations, and audit logs.',
    up: (db) => {
      db.exec(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          version TEXT PRIMARY KEY,
          applied_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS users (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          email TEXT NOT NULL UNIQUE COLLATE NOCASE,
          password_hash TEXT NOT NULL,
          full_name TEXT NOT NULL,
          preferred_name TEXT NOT NULL DEFAULT '',
          country TEXT NOT NULL DEFAULT '',
          city TEXT NOT NULL DEFAULT '',
          role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('member', 'editor', 'admin')),
          preferred_language TEXT NOT NULL DEFAULT 'fr' CHECK (preferred_language IN ('fr', 'en')),
          is_active INTEGER NOT NULL DEFAULT 1,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS sessions (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          token_hash TEXT NOT NULL UNIQUE,
          expires_at TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS site_settings (
          key TEXT PRIMARY KEY,
          value_json TEXT NOT NULL,
          updated_by INTEGER REFERENCES users(id),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS founder_profile (
          id INTEGER PRIMARY KEY CHECK (id = 1),
          display_name TEXT NOT NULL,
          titles_json TEXT NOT NULL,
          author_attribution TEXT NOT NULL DEFAULT '',
          portrait_url TEXT NOT NULL,
          portrait_credit TEXT NOT NULL DEFAULT '',
          gallery_json TEXT NOT NULL DEFAULT '[]',
          bio_fr TEXT NOT NULL,
          bio_en TEXT NOT NULL,
          public_journey_fr TEXT NOT NULL,
          public_journey_en TEXT NOT NULL,
          publications_json TEXT NOT NULL DEFAULT '[]',
          interventions_json TEXT NOT NULL DEFAULT '[]',
          personal_message_fr TEXT NOT NULL DEFAULT '',
          personal_message_en TEXT NOT NULL DEFAULT '',
          oral_tradition_note_fr TEXT NOT NULL DEFAULT '',
          oral_tradition_note_en TEXT NOT NULL DEFAULT '',
          workflow_status TEXT NOT NULL DEFAULT 'published' CHECK (workflow_status IN ('draft', 'validation', 'published', 'archived')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS teachings (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          slug TEXT NOT NULL UNIQUE,
          title_fr TEXT NOT NULL,
          title_en TEXT NOT NULL,
          summary_fr TEXT NOT NULL,
          summary_en TEXT NOT NULL,
          objectives_fr TEXT NOT NULL,
          objectives_en TEXT NOT NULL,
          speaker TEXT NOT NULL,
          tradition_context TEXT NOT NULL,
          language_offered TEXT NOT NULL,
          format TEXT NOT NULL,
          duration TEXT NOT NULL DEFAULT '',
          target_audience_fr TEXT NOT NULL,
          target_audience_en TEXT NOT NULL,
          prerequisites_fr TEXT NOT NULL,
          prerequisites_en TEXT NOT NULL,
          schedule_note_fr TEXT NOT NULL,
          schedule_note_en TEXT NOT NULL,
          location_or_mode TEXT NOT NULL,
          price_validated INTEGER NOT NULL DEFAULT 0,
          price_display TEXT NOT NULL DEFAULT '',
          conditions_fr TEXT NOT NULL,
          conditions_en TEXT NOT NULL,
          limits_notice_fr TEXT NOT NULL,
          limits_notice_en TEXT NOT NULL,
          enrollment_status TEXT NOT NULL DEFAULT 'to_announce' CHECK (enrollment_status IN ('to_announce', 'open', 'full', 'finished', 'cancelled')),
          workflow_status TEXT NOT NULL DEFAULT 'draft' CHECK (workflow_status IN ('draft', 'validation', 'published', 'archived')),
          is_featured INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS events (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          slug TEXT NOT NULL UNIQUE,
          title_fr TEXT NOT NULL,
          title_en TEXT NOT NULL,
          description_fr TEXT NOT NULL,
          description_en TEXT NOT NULL,
          organizer_entity TEXT NOT NULL DEFAULT 'UNITRACA',
          event_date TEXT NOT NULL,
          start_time TEXT NOT NULL,
          end_time TEXT NOT NULL,
          timezone TEXT NOT NULL DEFAULT 'Africa/Douala',
          format TEXT NOT NULL,
          validated_location TEXT NOT NULL DEFAULT '',
          location_verified INTEGER NOT NULL DEFAULT 0,
          speakers_json TEXT NOT NULL DEFAULT '[]',
          program_fr TEXT NOT NULL DEFAULT '',
          program_en TEXT NOT NULL DEFAULT '',
          conditions_fr TEXT NOT NULL DEFAULT '',
          conditions_en TEXT NOT NULL DEFAULT '',
          accessibility_fr TEXT NOT NULL DEFAULT '',
          accessibility_en TEXT NOT NULL DEFAULT '',
          registration_open INTEGER NOT NULL DEFAULT 0,
          workflow_status TEXT NOT NULL DEFAULT 'draft' CHECK (workflow_status IN ('draft', 'validation', 'published', 'archived')),
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS media_resources (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          slug TEXT NOT NULL UNIQUE,
          title_fr TEXT NOT NULL,
          title_en TEXT NOT NULL,
          category TEXT NOT NULL CHECK (category IN ('video', 'article', 'interview', 'audio', 'gallery', 'document')),
          theme TEXT NOT NULL,
          speaker TEXT NOT NULL,
          language TEXT NOT NULL,
          community_context TEXT NOT NULL,
          holder_or_author TEXT NOT NULL,
          authorization_status TEXT NOT NULL DEFAULT 'pending_validation' CHECK (authorization_status IN ('pending_validation', 'authorized', 'restricted_rights')),
          diffusion_conditions TEXT NOT NULL,
          credit TEXT NOT NULL,
          published_date TEXT NOT NULL,
          access_level TEXT NOT NULL DEFAULT 'public' CHECK (access_level IN ('public', 'member', 'restricted')),
          thumbnail_url TEXT NOT NULL DEFAULT '',
          embed_url TEXT NOT NULL DEFAULT '',
          summary_fr TEXT NOT NULL,
          summary_en TEXT NOT NULL,
          body_fr TEXT NOT NULL,
          body_en TEXT NOT NULL,
          transcript_fr TEXT NOT NULL DEFAULT '',
          transcript_en TEXT NOT NULL DEFAULT '',
          subtitles_available INTEGER NOT NULL DEFAULT 0,
          health_disclaimer_required INTEGER NOT NULL DEFAULT 0,
          workflow_status TEXT NOT NULL DEFAULT 'draft' CHECK (workflow_status IN ('draft', 'validation', 'published', 'archived')),
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS heritage_dossiers (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          slug TEXT NOT NULL UNIQUE,
          title_fr TEXT NOT NULL,
          title_en TEXT NOT NULL,
          community_or_tradition TEXT NOT NULL,
          region TEXT NOT NULL,
          summary_fr TEXT NOT NULL,
          summary_en TEXT NOT NULL,
          documented_context_fr TEXT NOT NULL,
          documented_context_en TEXT NOT NULL,
          oral_tradition_fr TEXT NOT NULL,
          oral_tradition_en TEXT NOT NULL,
          interpretation_fr TEXT NOT NULL,
          interpretation_en TEXT NOT NULL,
          sources_json TEXT NOT NULL DEFAULT '[]',
          margin_notes_json TEXT NOT NULL DEFAULT '[]',
          cover_image TEXT NOT NULL DEFAULT '',
          image_credit TEXT NOT NULL DEFAULT '',
          workflow_status TEXT NOT NULL DEFAULT 'draft' CHECK (workflow_status IN ('draft', 'validation', 'published', 'archived')),
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS faq_items (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          category TEXT NOT NULL,
          question_fr TEXT NOT NULL,
          question_en TEXT NOT NULL,
          answer_fr TEXT NOT NULL,
          answer_en TEXT NOT NULL,
          sort_order INTEGER NOT NULL DEFAULT 0,
          workflow_status TEXT NOT NULL DEFAULT 'published' CHECK (workflow_status IN ('draft', 'validation', 'published', 'archived')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS registration_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          teaching_id INTEGER REFERENCES teachings(id) ON DELETE SET NULL,
          last_name TEXT NOT NULL,
          first_name TEXT NOT NULL,
          country TEXT NOT NULL,
          city TEXT NOT NULL,
          email TEXT NOT NULL,
          phone TEXT NOT NULL DEFAULT '',
          requested_language TEXT NOT NULL,
          requested_format TEXT NOT NULL,
          message TEXT NOT NULL DEFAULT '',
          is_adult INTEGER NOT NULL DEFAULT 1,
          minor_guardian_note TEXT NOT NULL DEFAULT '',
          consent_data INTEGER NOT NULL DEFAULT 0,
          consent_rules INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'under_review', 'accepted', 'declined', 'cancelled')),
          admin_notes TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          updated_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS resource_access_grants (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          resource_id INTEGER NOT NULL REFERENCES media_resources(id) ON DELETE CASCADE,
          granted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
          reason TEXT NOT NULL DEFAULT '',
          expires_at TEXT DEFAULT NULL,
          created_at TEXT NOT NULL DEFAULT (datetime('now')),
          UNIQUE(user_id, resource_id)
        );

        CREATE TABLE IF NOT EXISTS admin_messages (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          recipient_user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
          sender_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          subject TEXT NOT NULL,
          body TEXT NOT NULL,
          is_read INTEGER NOT NULL DEFAULT 0,
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS contact_requests (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          request_type TEXT NOT NULL DEFAULT 'general' CHECK (request_type IN ('general', 'media_correction', 'media_removal', 'validation')),
          sender_name TEXT NOT NULL,
          sender_email TEXT NOT NULL,
          subject TEXT NOT NULL,
          related_url TEXT NOT NULL DEFAULT '',
          message TEXT NOT NULL,
          consent_data INTEGER NOT NULL DEFAULT 0,
          status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'in_review', 'resolved')),
          admin_response TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS consent_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          email TEXT NOT NULL,
          consent_type TEXT NOT NULL,
          granted INTEGER NOT NULL,
          ip_hint TEXT NOT NULL DEFAULT '',
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS audit_logs (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          actor_user_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
          actor_email TEXT NOT NULL DEFAULT '',
          action TEXT NOT NULL,
          entity_type TEXT NOT NULL,
          entity_id TEXT NOT NULL,
          details_json TEXT NOT NULL DEFAULT '{}',
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );

        CREATE INDEX IF NOT EXISTS idx_sessions_token_hash ON sessions(token_hash);
        CREATE INDEX IF NOT EXISTS idx_teachings_slug ON teachings(slug);
        CREATE INDEX IF NOT EXISTS idx_events_slug ON events(slug);
        CREATE INDEX IF NOT EXISTS idx_media_slug ON media_resources(slug);
        CREATE INDEX IF NOT EXISTS idx_dossiers_slug ON heritage_dossiers(slug);
        CREATE INDEX IF NOT EXISTS idx_reg_email ON registration_requests(email);
        CREATE INDEX IF NOT EXISTS idx_reg_user ON registration_requests(user_id);
      `);
    },
  },
  {
    version: '002_cover_image_and_testimonials',
    description: 'Add cover_image column to teachings and create testimonials table.',
    up: (db) => {
      const cols = db.prepare('PRAGMA table_info(teachings)').all() as Array<{ name: string }>;
      if (!cols.some((c) => c.name === 'cover_image')) {
        db.exec(`ALTER TABLE teachings ADD COLUMN cover_image TEXT NOT NULL DEFAULT '';`);
      }

      db.exec(`
        CREATE TABLE IF NOT EXISTS testimonials (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          author_name TEXT NOT NULL,
          author_role_fr TEXT NOT NULL,
          author_role_en TEXT NOT NULL,
          location TEXT NOT NULL DEFAULT '',
          quote_fr TEXT NOT NULL,
          quote_en TEXT NOT NULL,
          context_fr TEXT NOT NULL DEFAULT '',
          context_en TEXT NOT NULL DEFAULT '',
          is_verified INTEGER NOT NULL DEFAULT 0,
          workflow_status TEXT NOT NULL DEFAULT 'published' CHECK (workflow_status IN ('draft', 'validation', 'published', 'archived')),
          created_at TEXT NOT NULL DEFAULT (datetime('now'))
        );
      `);
    },
  },
];

export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  const applied = new Set<string>(
    db
      .prepare('SELECT version FROM schema_migrations')
      .all()
      .map((row) => (row as { version: string }).version)
  );

  for (const migration of migrations) {
    if (!applied.has(migration.version)) {
      const tx = db.transaction(() => {
        migration.up(db);
        db.prepare('INSERT INTO schema_migrations (version) VALUES (?)').run(migration.version);
      });
      tx();
    }
  }
}
