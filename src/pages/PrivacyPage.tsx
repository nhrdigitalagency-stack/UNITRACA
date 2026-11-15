import { useApp } from '../context/AppContext.tsx';
import { PageMeta } from '../components/PageMeta.tsx';

export function PrivacyPage() {
  const { lang } = useApp();

  return (
    <>
      <PageMeta
        titleFr="Confidentialité et protection des données | UNITRACA"
        titleEn="Privacy Notice | UNITRACA"
        descriptionFr="Notice sur la collecte minimale des données, les consentements et la protection des convictions spirituelles."
      />
      <div className="max-w-[820px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-8">
        <header className="space-y-3 border-b border-[var(--color-ivory-border)] pb-8">
          <p className="text-xs uppercase tracking-widest text-[var(--color-terracotta)]">
            {lang === 'en' ? 'Data Protection' : 'Protection des données'}
          </p>
          <h1 className="font-display text-4xl font-semibold text-[var(--color-earth-dark)]">
            {lang === 'en' ? 'Privacy Notice' : 'Notice de confidentialité'}
          </h1>
        </header>

        <div className="space-y-6 text-sm leading-relaxed text-[var(--color-ink)]/90">
          <section className="space-y-2">
            <h2 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
              {lang === 'en' ? '1. Strict Data Minimization' : '1. Collecte strictement limitée'}
            </h2>
            <p>
              {lang === 'en'
                ? 'Enrollment and account forms only collect identification, city/country, language preference, and requested teaching. No medical diagnosis, health records, intimate confessions, or family member identities are collected.'
                : 'Les formulaires d’inscription et de création de compte ne collectent que les informations strictement nécessaires (nom, prénom ou nom d’usage, pays, ville, e-mail, langue et format souhaités). Aucun diagnostic médical, document de santé, confession détaillée ou identité de proches n’est demandé.'}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
              {lang === 'en' ? '2. Sensitive Spiritual Information' : '2. Protection des convictions et affiliations'}
            </h2>
            <p>
              {lang === 'en'
                ? 'Participant lists are never published publicly. Religious, philosophical, or spiritual affiliations are treated as sensitive personal data accessible strictly to authorized administrators.'
                : 'Les listes de participants ne sont jamais rendues publiques. Les démarches spirituelles ou convictions relèvent de données sensibles strictement réservées aux responsables habilités.'}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
              {lang === 'en' ? '3. Security & Consent Logging' : '3. Sécurité des sessions et consentements'}
            </h2>
            <p>
              {lang === 'en'
                ? 'Passwords are salted and hashed with scrypt. Sessions use HttpOnly cookies, and explicit consent timestamps are logged on account creation, registration requests, and contact messages.'
                : 'Les mots de passe sont hachés côté serveur (scrypt avec sel aléatoire). Les sessions reposent sur des cookies HttpOnly, et chaque consentement explicite est journalisé.'}
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
