import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext.tsx';
import { PageMeta } from '../components/PageMeta.tsx';
import { EthicalNotice } from '../components/EthicalNotice.tsx';
import { ResilientImage } from '../components/ResilientImage.tsx';

export function OrganizationPage() {
  const { lang, settings } = useApp();

  const documentedAxes =
    lang === 'en'
      ? [
          {
            axis: 'Cultural & spiritual transmission',
            source: 'UNITRACA is presented as a school dedicated to African traditions, culture, and spirituality.',
          },
          {
            axis: 'Theoretical & practical teachings',
            source: 'An indexed channel video announces both theoretical and practical courses, mentioning remote participation for people living abroad.',
          },
          {
            axis: 'Initiatory pathway',
            source: 'Public communications describe progression through teachings and initiation into spiritual knowledge within the organization’s belief framework.',
          },
          {
            axis: 'Audiovisual dissemination',
            source: 'The channel publishes talks on traditions, spirituality, ancestors, and the place of culture in contemporary life.',
          },
          {
            axis: 'Conferences & gatherings',
            source: 'Talks address traditions and Africa’s development; each event must be verified individually to confirm direct UNITRACA organization.',
          },
        ]
      : [
          {
            axis: 'Transmission culturelle et spirituelle',
            source: 'UNITRACA est présentée comme une école consacrée aux traditions, à la culture et à la spiritualité africaines.',
          },
          {
            axis: 'Enseignements théoriques et pratiques',
            source: 'Une vidéo de la chaîne annonce des cours à la fois théoriques et pratiques, avec une possibilité de suivi en ligne pour les personnes à l’étranger.',
          },
          {
            axis: 'Parcours initiatique',
            source: 'Les communications présentent une progression dans les enseignements et une initiation à des savoirs spirituels relevant du cadre de croyances de l’organisation.',
          },
          {
            axis: 'Diffusion audiovisuelle',
            source: 'La chaîne publie des interventions consacrées aux traditions, à la spiritualité, aux ancêtres et à la place de la culture dans la vie contemporaine.',
          },
          {
            axis: 'Conférences et rencontres',
            source: 'Une intervention présente des prises de parole autour du rôle des traditions et du développement de l’Afrique ; chaque événement doit être vérifié individuellement.',
          },
        ];

  const missingItems =
    lang === 'en'
      ? [
          'Legal entity name and official registration status',
          'Verified current physical address',
          'Complete official telephone number and institutional email',
          'Validated fee schedule and enrollment terms',
          'Detailed current curriculum and schedules',
          'Any official recognition or accreditation of courses',
          'Official graphic charter and media rights confirmations',
          'Legal relationship between UNITRACA and other founder initiatives',
        ]
      : [
          'Dénomination juridique et statut officiel de l’organisation',
          'Adresse physique actuelle vérifiée',
          'Téléphone et adresse e-mail officiels complets',
          'Tarifs validés et conditions financières d’inscription',
          'Programme pédagogique détaillé et calendrier actuel',
          'Éventuelle reconnaissance officielle des formations',
          'Charte graphique officielle définitive et droits sur les médias',
          'Lien juridique entre UNITRACA et les autres initiatives du fondateur',
        ];

  return (
    <>
      <PageMeta
        titleFr="UNITRACA | L’organisation et ses axes documentés"
        titleEn="UNITRACA | Organization & Documented Overview"
        descriptionFr="Présentation institutionnelle d’UNITRACA (Univers Initiatique aux Traditions et à la Culture Africaine) : axes documentés et informations en attente de validation."
      />

      <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-16 space-y-14">
        <header className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center border-b border-[var(--color-ivory-border)] pb-12">
          <div className="lg:col-span-8 space-y-4">
            <p className="text-xs uppercase tracking-widest text-[var(--color-terracotta)]">
              {lang === 'en' ? 'Institutional Presentation' : 'Présentation institutionnelle'}
            </p>
            <h1 className="font-display text-4xl sm:text-5xl font-semibold text-[var(--color-earth-dark)]">
              UNITRACA — Univers Initiatique aux Traditions et à la Culture Africaine
            </h1>
            <p className="text-base leading-relaxed text-[var(--color-ink)]/85 max-w-3xl">
              {lang === 'en'
                ? 'UNITRACA is associated with Fo’o Tchamaleu (also publicly presented as Luminaire Ndia and Ndīā Shugaíntō II). This page separates publicly documented elements from organizational details awaiting formal confirmation.'
                : 'UNITRACA est associée à Fo’o Tchamaleu (également présenté publiquement sous les appellations Luminaire Ndia et Ndīā Shugaíntō II). Cette page distingue les éléments documentés dans les communications publiques des données en attente de confirmation officielle.'}
            </p>
          </div>
          <div className="lg:col-span-4 flex justify-start lg:justify-end">
            <div className="w-48">
              <ResilientImage
                src="/assets/aistudio/channels4_profile_71e826b0.jpg"
                alt="Logo officiel UNITRACA"
                caption={lang === 'en' ? 'Official logo supplied from channel profile' : 'Visuel officiel issu du profil de la chaîne'}
                aspectClass="aspect-square"
              />
            </div>
          </div>
        </header>

        <section className="space-y-6">
          <h2 className="font-display text-3xl font-semibold text-[var(--color-earth-dark)]">
            {lang === 'en' ? 'Documented Goals and Activities' : 'Objectifs et activités documentés'}
          </h2>
          <div className="overflow-x-auto border border-[var(--color-ivory-border)]">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-[var(--color-ivory-soft)] border-b border-[var(--color-ivory-border)]">
                  <th className="py-3.5 px-5 font-semibold text-[var(--color-earth-dark)] w-1/3">
                    {lang === 'en' ? 'Area' : 'Axe'}
                  </th>
                  <th className="py-3.5 px-5 font-semibold text-[var(--color-earth-dark)]">
                    {lang === 'en' ? 'What public sources show' : 'Ce que montrent les sources'}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--color-ivory-border)]">
                {documentedAxes.map((row) => (
                  <tr key={row.axis}>
                    <td className="py-4 px-5 font-medium text-[var(--color-earth-dark)] align-top">{row.axis}</td>
                    <td className="py-4 px-5 text-[var(--color-ink)]/85 leading-relaxed">{row.source}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          <div className="lg:col-span-7 space-y-4">
            <h2 className="font-display text-3xl font-semibold text-[var(--color-earth-dark)]">
              {lang === 'en'
                ? 'Information Left Open Until Confirmed'
                : 'Informations maintenues à compléter (non inventées)'}
            </h2>
            <p className="text-sm text-[var(--color-muted)] leading-relaxed">
              {lang === 'en'
                ? 'To guarantee institutional accuracy, none of the following items are fabricated on this portal:'
                : 'Par exigence de véracité, aucun des éléments suivants n’est inventé sur ce portail tant qu’il n’a pas été authentifié par UNITRACA :'}
            </p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm text-[var(--color-ink)]/85 pt-2">
              {missingItems.map((item) => (
                <li key={item} className="border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)]/50 px-4 py-3">
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="lg:col-span-5 space-y-5">
            <EthicalNotice variant="health" />
            <div className="border border-[var(--color-ivory-border)] p-6 space-y-4">
              <h3 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
                {lang === 'en' ? 'Digital Channels' : 'Présence numérique transmise'}
              </h3>
              <ul className="space-y-2 text-sm">
                {settings?.social.youtube_url && (
                  <li>
                    <a
                      href={settings.social.youtube_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-terracotta)] hover:underline"
                    >
                      Chaîne YouTube UNITRACA
                    </a>
                  </li>
                )}
                {settings?.social.facebook_url && (
                  <li>
                    <a
                      href={settings.social.facebook_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[var(--color-terracotta)] hover:underline"
                    >
                      Page Facebook UNITRACA
                    </a>
                  </li>
                )}
              </ul>
              <p className="text-xs text-[var(--color-muted)]">
                {lang === 'en'
                  ? 'Links pending confirmation with the organization. Past enrollment announcements (such as March 29, 2026) and incomplete phone transcripts are deliberately omitted.'
                  : 'Liens à vérifier avec l’organisation avant publication finale. Les annonces passées (ex. rentrée du 29 mars) et numéros incomplets ne sont pas repris.'}
              </p>
              <Link
                to="/contact"
                className="inline-block text-sm font-medium text-[var(--color-forest)] hover:underline"
              >
                {lang === 'en' ? 'Submit official validation details →' : 'Transmettre une validation officielle →'}
              </Link>
            </div>
          </div>
        </section>
      </div>
    </>
  );
}
