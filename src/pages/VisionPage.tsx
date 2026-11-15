import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.tsx';
import { PageMeta } from '../components/PageMeta.tsx';
import { EthicalNotice } from '../components/EthicalNotice.tsx';

export function VisionPage() {
  const { lang } = useApp();

  const distinctions =
    lang === 'en'
      ? [
          {
            level: '01. Organizational presentation',
            desc: 'What UNITRACA states about its mission, courses, and cultural approach.',
          },
          {
            level: '02. Documented historical facts',
            desc: 'Dates, texts, and historical figures supported by verifiable external records.',
          },
          {
            level: '03. Attributed oral traditions',
            desc: 'Community narratives, lineages, and customary wisdom explicitly attributed to their holders.',
          },
          {
            level: '04. Beliefs and spiritual teachings',
            desc: 'Convictions and initiatory frameworks presented respectfully without being framed as scientific proof.',
          },
        ]
      : [
          {
            level: '01. Présentation de l’organisation',
            desc: 'Ce qu’UNITRACA déclare de sa mission, de ses cours et de sa démarche culturelle.',
          },
          {
            level: '02. Informations historiques documentées',
            desc: 'Faits, contextes et repères historiques appuyés sur des sources vérifiables.',
          },
          {
            level: '03. Traditions orales attribuées',
            desc: 'Récits lignagers, coutumes et paroles transmises, explicitement identifiés comme tradition orale.',
          },
          {
            level: '04. Croyances et enseignements spirituels',
            desc: 'Convictions et parcours spirituels exposés avec dignité, sans jamais les présenter comme des démonstrations scientifiques.',
          },
        ];

  const accessTiers =
    lang === 'en'
      ? [
          {
            tier: 'Public',
            desc: 'Editorial articles, institutional presentation, confirmed events, and duly authorized public media.',
          },
          {
            tier: 'Authorized Members',
            desc: 'Study guides, supplementary transcripts, and member calendar resources delivered only after server authentication.',
          },
          {
            tier: 'Restricted Access',
            desc: 'Sensitive protocols or community-restricted archives delivered solely after individual administrator grant.',
          },
        ]
      : [
          {
            tier: 'Public',
            desc: 'Articles éditoriaux, présentation institutionnelle, agenda confirmé et médias publics dûment autorisés.',
          },
          {
            tier: 'Membres autorisés',
            desc: 'Guides méthodologiques, supports d’étude et ressources réservées aux comptes authentifiés côté serveur.',
          },
          {
            tier: 'Accès restreint validé par un responsable',
            desc: 'Archives sensibles ou protocoles spécifiques accessibles uniquement sur autorisation nominative accordée par un administrateur.',
          },
        ];

  return (
    <>
      <PageMeta
        titleFr="Vision, valeurs et garde-fous | UNITRACA"
        titleEn="Vision, Values & Safeguards | UNITRACA"
        descriptionFr="Principes éditoriaux, protection des savoirs culturels à trois niveaux et garde-fous éthiques d’UNITRACA."
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-14">
        <header className="max-w-3xl space-y-4 border-b border-[var(--color-ivory-border)] pb-10">
          <p className="text-xs uppercase tracking-widest text-[var(--color-terracotta)]">
            {lang === 'en' ? 'Approach & Ethics' : 'Démarche & Éthique'}
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[var(--color-earth-dark)]">
            {lang === 'en' ? 'Vision, Values & Editorial Safeguards' : 'Vision, valeurs et garde-fous éditoriaux'}
          </h1>
          <p className="text-base leading-relaxed text-[var(--color-ink)]/85">
            {lang === 'en'
              ? 'Transmission requires respect for African cultural diversity, clarity toward learners, and strict protection against misleading spiritual or medical promises.'
              : 'La transmission exige le respect de la diversité des cultures africaines, la clarté des statuts vis-à-vis du public et l’absence de toute promesse médicale ou surnaturelle.'}
          </p>
        </header>

        <section className="space-y-6">
          <h2 className="font-display text-3xl font-semibold text-[var(--color-earth-dark)]">
            {lang === 'en' ? 'Four Distinct Levels of Discourse' : 'Quatre niveaux de lecture clairement séparés'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {distinctions.map((d) => (
              <div key={d.level} className="border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)]/50 p-6 space-y-2">
                <h3 className="font-display text-xl font-semibold text-[var(--color-earth-dark)]">{d.level}</h3>
                <p className="text-sm text-[var(--color-muted)] leading-relaxed">{d.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="space-y-6">
          <h2 className="font-display text-3xl font-semibold text-[var(--color-earth-dark)]">
            {lang === 'en' ? 'Three-Tier Cultural Content Protection' : 'Protection des contenus culturels à trois niveaux'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {accessTiers.map((tier) => (
              <div key={tier.tier} className="border border-[var(--color-ivory-border)] p-6 space-y-2">
                <p className="text-xs uppercase tracking-widest text-[var(--color-forest)] font-medium">{tier.tier}</p>
                <p className="text-sm leading-relaxed text-[var(--color-ink)]/85">{tier.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <EthicalNotice variant="health" />

        <div className="flex flex-wrap gap-4 pt-2">
          <Link
            to="/patrimoines"
            className="px-5 py-3 text-sm font-medium bg-[var(--color-earth-dark)] text-[var(--color-ivory)] hover:bg-[var(--color-terracotta)] transition-colors"
          >
            {lang === 'en' ? 'Explore Cultural Dossiers' : 'Consulter les dossiers culturels'}
          </Link>
          <Link
            to="/mediatheque"
            className="px-5 py-3 text-sm font-medium border border-[var(--color-earth-dark)] text-[var(--color-earth-dark)] hover:bg-[var(--color-ivory-soft)] transition-colors"
          >
            {lang === 'en' ? 'Open Media Library' : 'Accéder à la médiathèque'}
          </Link>
        </div>
      </div>
    </>
  );
}
