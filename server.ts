import express from 'express';
import path from 'node:path';
import fs from 'node:fs';
import { createServer as createViteServer } from 'vite';
import { getDb } from './src/db/database.ts';
import { attachCurrentUser, hashPassword } from './src/server/auth.ts';
import { createApiRouter } from './src/server/api.ts';

export async function createApp(customDbPath?: string) {
  const db = getDb(customDbPath);

  // Optional env-based admin bootstrap (never hardcoded password)
  const envAdminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const envAdminPass = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (envAdminEmail && envAdminPass && envAdminPass.length >= 10) {
    const adminCount = (db.prepare("SELECT COUNT(*) as c FROM users WHERE role = 'admin'").get() as { c: number }).c;
    if (adminCount === 0) {
      const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(envAdminEmail);
      if (!existing) {
        db.prepare(
          `INSERT INTO users (email, password_hash, full_name, preferred_name, role, preferred_language)
           VALUES (?, ?, 'Administrateur UNITRACA', 'Admin', 'admin', 'fr')`
        ).run(envAdminEmail, hashPassword(envAdminPass));
      }
    }
  }

  const app = express();

  app.disable('x-powered-by');
  app.use((_req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('Referrer-Policy', 'strict-origin-when-cross-origin');
    res.setHeader('X-Frame-Options', 'SAMEORIGIN');
    next();
  });

  app.use(express.json({ limit: '1mb' }));
  app.use(attachCurrentUser(db));

  // API Routes
  app.use('/api', createApiRouter(db));

  // Public robots.txt (blocking private routes from search indexing)
  app.get('/robots.txt', (req, res) => {
    const baseUrl = process.env.APP_URL || `${req.protocol}://${req.get('host')}`;
    res.type('text/plain').send(
      [
        'User-agent: *',
        'Allow: /',
        'Disallow: /admin',
        'Disallow: /espace-membre',
        'Disallow: /api/',
        `Sitemap: ${baseUrl.replace(/\/$/, '')}/sitemap.xml`,
      ].join('\n')
    );
  });

  // Dynamic public sitemap.xml
  app.get('/sitemap.xml', (req, res) => {
    const baseUrl = (process.env.APP_URL || `${req.protocol}://${req.get('host')}`).replace(/\/$/, '');
    const staticRoutes = [
      '/',
      '/unitraca',
      '/fondateur',
      '/vision-et-valeurs',
      '/enseignements',
      '/agenda',
      '/mediatheque',
      '/patrimoines',
      '/inscription',
      '/contact',
      '/faq',
      '/confidentialite',
      '/conditions',
    ];

    const teachings = db.prepare("SELECT slug FROM teachings WHERE workflow_status = 'published'").all() as Array<{ slug: string }>;
    const events = db.prepare("SELECT slug FROM events WHERE workflow_status = 'published'").all() as Array<{ slug: string }>;
    const media = db
      .prepare("SELECT slug FROM media_resources WHERE workflow_status = 'published' AND access_level = 'public'")
      .all() as Array<{ slug: string }>;
    const dossiers = db.prepare("SELECT slug FROM heritage_dossiers WHERE workflow_status = 'published'").all() as Array<{ slug: string }>;

    const urls = [
      ...staticRoutes,
      ...teachings.map((t) => `/enseignements/${t.slug}`),
      ...events.map((e) => `/agenda/${e.slug}`),
      ...media.map((m) => `/mediatheque/${m.slug}`),
      ...dossiers.map((d) => `/patrimoines/${d.slug}`),
    ];

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${baseUrl}${u}</loc></url>`).join('\n')}
</urlset>`;

    res.type('application/xml').send(xml);
  });

  if (process.env.NODE_ENV !== 'production' && process.env.VITEST !== 'true') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else if (process.env.VITEST !== 'true') {
    const distPath = path.resolve(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      const indexHtml = path.join(distPath, 'index.html');
      if (fs.existsSync(indexHtml)) {
        res.sendFile(indexHtml);
      } else {
        res.status(404).send('Build frontend introuvable. Exécutez npm run build.');
      }
    });
  }

  return { app, db };
}

if (process.env.VITEST !== 'true' && process.env.NODE_ENV !== 'test') {
  const PORT = Number(process.env.PORT || 3000);
  createApp().then(({ app }) => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`UNITRACA server listening on http://0.0.0.0:${PORT}`);
    });
  });
}
