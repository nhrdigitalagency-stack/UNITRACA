import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import type http from 'node:http';
import { createApp } from '../server.ts';
import { resetDbInstanceForTests } from '../src/db/database.ts';

let server: http.Server;
let baseUrl: string;
let tmpDbPath: string;

async function reqJson(
  urlPath: string,
  options: { method?: string; body?: unknown; cookie?: string } = {}
): Promise<{ status: number; headers: Headers; data: any; rawText: string; setCookie: string }> {
  const headers: Record<string, string> = {};
  if (options.body !== undefined) {
    headers['Content-Type'] = 'application/json';
  }
  if (options.cookie) {
    headers['Cookie'] = options.cookie;
  }

  const res = await fetch(`${baseUrl}${urlPath}`, {
    method: options.method || 'GET',
    headers,
    body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
  });

  const rawText = await res.text();
  let data: any = null;
  try {
    data = JSON.parse(rawText);
  } catch {
    data = null;
  }
  const setCookieHeader = res.headers.get('set-cookie') || '';
  const cookiePair = setCookieHeader.split(';')[0] || '';
  return { status: res.status, headers: res.headers, data, rawText, setCookie: cookiePair };
}

test.before(async () => {
  process.env.NODE_ENV = 'test';
  resetDbInstanceForTests();
  const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'unitraca-test-'));
  tmpDbPath = path.join(tmpDir, 'test.db');
  const { app } = await createApp(tmpDbPath);
  await new Promise<void>((resolve) => {
    server = app.listen(0, '127.0.0.1', () => {
      const addr = server.address() as { port: number };
      baseUrl = `http://127.0.0.1:${addr.port}`;
      resolve();
    });
  });
});

test.after(async () => {
  await new Promise<void>((resolve) => server.close(() => resolve()));
  resetDbInstanceForTests();
  if (tmpDbPath && fs.existsSync(tmpDbPath)) {
    fs.rmSync(path.dirname(tmpDbPath), { recursive: true, force: true });
  }
});

test('Public catalog, founder diacritics, sitemap, and .ics calendar export work with truthful content', async () => {
  const founder = await reqJson('/api/founder');
  assert.equal(founder.status, 200);
  assert.equal(founder.data.display_name, 'Fo’o Tchamaleu');
  assert.ok(founder.data.titles.some((t: string) => t.includes('Ndīā Shugaíntō II')));

  const teachings = await reqJson('/api/teachings');
  assert.equal(teachings.status, 200);
  assert.ok(Array.isArray(teachings.data) && teachings.data.length >= 2);
  // Ensure past March 29 enrollment date is NOT republished
  assert.equal(JSON.stringify(teachings.data).includes('29 mars'), false);

  const ics = await reqJson('/api/events/calendar.ics');
  assert.equal(ics.status, 200);
  assert.ok(ics.rawText.includes('BEGIN:VCALENDAR'));
  assert.ok(ics.rawText.includes('BEGIN:VEVENT'));

  const sitemap = await reqJson('/sitemap.xml');
  assert.equal(sitemap.status, 200);
  assert.ok(sitemap.rawText.includes('/fondateur'));
  assert.equal(sitemap.rawText.includes('/admin'), false);
});

test('Server-side media gating prevents leaking member/restricted bodies to public clients', async () => {
  const list = await reqJson('/api/mediatheque');
  assert.equal(list.status, 200);

  const memberItem = list.data.find((m: any) => m.access_level === 'member');
  const restrictedItem = list.data.find((m: any) => m.access_level === 'restricted');
  assert.ok(memberItem && restrictedItem);
  assert.equal(memberItem.access_granted, false);
  assert.equal(memberItem.body_fr, undefined);
  assert.equal(restrictedItem.access_granted, false);
  assert.equal(restrictedItem.body_fr, undefined);

  const memberDetail = await reqJson(`/api/mediatheque/${memberItem.slug}`);
  assert.equal(memberDetail.data.access_granted, false);
  assert.equal(memberDetail.data.body_fr, undefined);
});

test('Member registration enforces role=member, rejects privilege escalation, and unlocks member-only content', async () => {
  const reg = await reqJson('/api/auth/register', {
    method: 'POST',
    body: {
      email: 'membre@example.org',
      password: 'Password123!',
      full_name: 'Amina Kouyaté',
      country: 'Cameroun',
      city: 'Douala',
      role: 'admin', // Attempted escalation must be ignored!
      consent_data: true,
    },
  });
  assert.equal(reg.status, 201);
  assert.equal(reg.data.user.role, 'member');
  const memberCookie = reg.setCookie;
  assert.ok(memberCookie.includes('unitraca_session='));

  // Member can now read member-tier resource, still NOT restricted resource
  const memberRes = await reqJson('/api/mediatheque/guide-methodologique-membre-ecoute-savoirs', {
    cookie: memberCookie,
  });
  assert.equal(memberRes.data.access_granted, true);
  assert.ok(memberRes.data.body_fr.length > 20);

  const restrictedRes = await reqJson('/api/mediatheque/protocole-savoirs-restreints-detenteurs', {
    cookie: memberCookie,
  });
  assert.equal(restrictedRes.data.access_granted, false);
  assert.equal(restrictedRes.data.body_fr, undefined);

  // Member is strictly blocked from admin API
  const adminBlocked = await reqJson('/api/admin/overview', { cookie: memberCookie });
  assert.equal(adminBlocked.status, 403);
});

test('Admin bootstrap locks after first admin, manages registrations, grants restricted access, and records audit logs', async () => {
  const statusBefore = await reqJson('/api/auth/bootstrap-status');
  assert.equal(statusBefore.data.needsAdminSetup, true);

  const boot = await reqJson('/api/auth/bootstrap-admin', {
    method: 'POST',
    body: {
      full_name: 'Responsable UNITRACA',
      email: 'admin@unitraca.org',
      password: 'SecureAdminPassword2026!',
    },
  });
  assert.equal(boot.status, 201);
  assert.equal(boot.data.user.role, 'admin');
  const adminCookie = boot.setCookie;

  // Second bootstrap attempt MUST fail
  const bootAgain = await reqJson('/api/auth/bootstrap-admin', {
    method: 'POST',
    body: {
      full_name: 'Intruder',
      email: 'intruder@example.org',
      password: 'IntruderPassword123!',
    },
  });
  assert.equal(bootAgain.status, 403);

  // Submit a registration request as public user (rejects missing consent)
  const badReg = await reqJson('/api/registrations', {
    method: 'POST',
    body: {
      last_name: 'Ndi',
      first_name: 'Paul',
      country: 'France',
      city: 'Lyon',
      email: 'membre@example.org',
      requested_language: 'Français',
      requested_format: 'En ligne',
      is_adult: true,
      consent_data: false,
      consent_rules: true,
    },
  });
  assert.equal(badReg.status, 400);

  const goodReg = await reqJson('/api/registrations', {
    method: 'POST',
    body: {
      teaching_id: 1,
      last_name: 'Kouyaté',
      first_name: 'Amina',
      country: 'Cameroun',
      city: 'Douala',
      email: 'membre@example.org',
      requested_language: 'Français',
      requested_format: 'En ligne',
      is_adult: true,
      consent_data: true,
      consent_rules: true,
    },
  });
  assert.equal(goodReg.status, 201);
  assert.equal(goodReg.data.status, 'pending');

  // Admin reviews registration & grants restricted resource access to member
  const adminOverview = await reqJson('/api/admin/overview', { cookie: adminCookie });
  assert.equal(adminOverview.status, 200);
  const memberUser = adminOverview.data.users.find((u: any) => u.email === 'membre@example.org');
  const restrictedResource = adminOverview.data.media.find((m: any) => m.access_level === 'restricted');
  assert.ok(memberUser && restrictedResource);

  const reviewRes = await reqJson(`/api/admin/registrations/${goodReg.data.id}`, {
    method: 'PATCH',
    cookie: adminCookie,
    body: { status: 'accepted', admin_notes: 'Dossier validé pour la session en ligne.' },
  });
  assert.equal(reviewRes.status, 200);

  const grantRes = await reqJson('/api/admin/grants', {
    method: 'POST',
    cookie: adminCookie,
    body: {
      user_id: memberUser.id,
      resource_id: restrictedResource.id,
      reason: 'Membre autorisé pour étude documentaire',
    },
  });
  assert.equal(grantRes.status, 201);

  // Re-login as member and verify restricted resource is now accessible
  const memberLogin = await reqJson('/api/auth/login', {
    method: 'POST',
    body: { email: 'membre@example.org', password: 'Password123!' },
  });
  assert.equal(memberLogin.status, 200);
  const memberCookie = memberLogin.setCookie;

  const unlockedRestricted = await reqJson(`/api/mediatheque/${restrictedResource.slug}`, {
    cookie: memberCookie,
  });
  assert.equal(unlockedRestricted.data.access_granted, true);
  assert.ok(unlockedRestricted.data.body_fr.includes('accès restreint'));

  // Verify CSV export works for admin and is forbidden for member
  const csvMember = await reqJson('/api/admin/export/registrations.csv', { cookie: memberCookie });
  assert.equal(csvMember.status, 403);

  const csvAdmin = await reqJson('/api/admin/export/registrations.csv', { cookie: adminCookie });
  assert.equal(csvAdmin.status, 200);
  assert.ok(csvAdmin.rawText.includes('membre@example.org'));
});
