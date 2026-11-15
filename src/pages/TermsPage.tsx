import { useApp } from '../context/AppContext.tsx';
import { PageMeta } from '../components/PageMeta.tsx';

export function TermsPage() {
  const { lang } = useApp();

  return (
    <>
      <PageMeta
        titleFr="Conditions d’utilisation | UNITRACA"
        titleEn="Terms of Use | UNITRACA"
        descriptionFr="Conditions générales d’utilisation du portail UNITRACA, limites des enseignements et respect des droits culturels."
      />
      <div className="max-w-[820px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-8">
        <header className="space-y-3 border-b border-[var(--color-ivory-border)] pb-8">
          <p className="text-xs uppercase tracking-widest text-[var(--color-terracotta)]">
            {lang === 'en' ? 'Governance' : 'Cadre d’utilisation'}
          </p>
          <h1 className="font-display text-4xl font-semibold text-[var(--color-earth-dark)]">
            {lang === 'en' ? 'Terms of Use & Service Boundaries' : 'Conditions d’utilisation et limites du service'}
          </h1>
        </header>

        <div className="space-y-6 text-sm leading-relaxed text-[var(--color-ink)]/90">
          <section className="space-y-2">
            <h2 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
              {lang === 'en' ? '1. Nature of Teachings' : '1. Nature des enseignements et absence de diplôme d’État'}
            </h2>
            <p>
              {lang === 'en'
                ? 'UNITRACA’s offerings are cultural and spiritual teachings. No state-recognized academic diploma or professional qualification is claimed. Any attendance certificate remains distinct from an academic degree.'
                : 'Les activités présentées relèvent de la transmission culturelle et spirituelle selon la démarche d’UNITRACA. Aucun diplôme reconnu par l’État ou titre universitaire n’est revendiqué.'}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
              {lang === 'en' ? '2. Non-Medical Disclaimer' : '2. Garde-fou médical et éthique'}
            </h2>
            <p>
              {lang === 'en'
                ? 'Nothing published on this portal constitutes a medical diagnosis, therapy, or guarantee of healing. Users must consult qualified healthcare professionals for any medical condition.'
                : 'Aucun texte, enseignement ou témoignage publié sur ce site ne constitue un diagnostic médical, un traitement ou une promesse de guérison. Il ne doit jamais inciter à interrompre un suivi médical.'}
            </p>
          </section>

          <section className="space-y-2">
            <h2 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
              {lang === 'en' ? '3. Media Rights & Takedown Procedure' : '3. Droits sur les médias et retrait'}
            </h2>
            <p>
              {lang === 'en'
                ? 'Rights holders or depicted persons may request correction or removal of any resource via the Contact page. Access to member or restricted resources is personal and non-transferable.'
                : 'Tout détenteur de droits ou personne concernée peut demander la rectification ou le retrait d’un contenu via la page Contact. L’accès aux ressources réservées est strictement personnel.'}
            </p>
          </section>
        </div>
      </div>
    </>
  );
}
