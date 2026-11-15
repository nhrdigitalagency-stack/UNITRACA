import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Calendar } from 'lucide-react';
import { useApp } from '../context/AppContext.tsx';
import { formatLocalizedDate, getT } from '../i18n/translations.ts';
import { apiRequest } from '../lib/api.ts';
import { PageMeta } from '../components/PageMeta.tsx';
import { ResilientImage } from '../components/ResilientImage.tsx';
import { EthicalNotice } from '../components/EthicalNotice.tsx';
import { HeroCarousel } from '../components/HeroCarousel.tsx';
import { Testimonials } from '../components/Testimonials.tsx';
import { FAQ } from '../components/FAQ.tsx';
import { FadeIn, StaggerContainer, StaggerItem } from '../components/MotionReveal.tsx';
import type {
  EventItem,
  FaqItem,
  FounderProfile,
  HeritageDossier,
  MediaResourceItem,
  TeachingItem,
  TestimonialItem,
} from '../types/unitraca.ts';

export function HomePage() {
  const { lang, settings } = useApp();
  const t = getT(lang);

  const [founder, setFounder] = useState<FounderProfile | null>(null);
  const [teachings, setTeachings] = useState<TeachingItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [media, setMedia] = useState<MediaResourceItem[]>([]);
  const [dossiers, setDossiers] = useState<HeritageDossier[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [testimonials, setTestimonials] = useState<TestimonialItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    Promise.all([
      apiRequest<FounderProfile>('/api/founder').catch(() => null),
      apiRequest<TeachingItem[]>('/api/teachings').catch(() => []),
      apiRequest<EventItem[]>('/api/events').catch(() => []),
      apiRequest<MediaResourceItem[]>('/api/mediatheque').catch(() => []),
      apiRequest<HeritageDossier[]>('/api/patrimoines').catch(() => []),
      apiRequest<FaqItem[]>('/api/faq').catch(() => []),
      apiRequest<TestimonialItem[]>('/api/testimonials').catch(() => []),
    ]).then(([f, te, ev, me, dox, fq, testm]) => {
      if (!active) return;
      setFounder(f);
      setTeachings(te);
      setEvents(ev);
      setMedia(me);
      setDossiers(dox);
      setFaqs(fq);
      setTestimonials(testm);
      setLoading(false);
    });
    return () => {
      active = false;
    };
  }, []);

  const hero = settings?.hero;
  const heroLabel = (lang === 'en' ? hero?.label_en : hero?.label_fr) || 'Transmission · Culture · Traditions';
  const heroTitle =
    (lang === 'en' ? hero?.title_en : hero?.title_fr) ||
    'Comprendre nos héritages. Faire vivre la transmission.';
  const heroSubtitle =
    (lang === 'en' ? hero?.subtitle_en : hero?.subtitle_fr) ||
    'Univers Initiatique aux Traditions et à la Culture Africaine';
  const heroText =
    (lang === 'en' ? hero?.text_en : hero?.text_fr) ||
    'Un espace de découverte, d’échange et de transmission autour des traditions et des cultures africaines, selon la démarche et les enseignements portés par UNITRACA.';
  const heroNotice =
    (lang === 'en' ? hero?.editorial_notice_en : hero?.editorial_notice_fr) ||
    'Proposition éditoriale et charte visuelle harmonisée sur le logo officiel UNITRACA.';

  const transmissionAxes =
    lang === 'en'
      ? [
          {
            num: '01',
            title: 'Understanding traditions in context',
            desc: 'Situating every practice, language, and history within its specific community rather than speaking of an undifferentiated tradition.',
          },
          {
            num: '02',
            title: 'Transmitting cultural knowledge',
            desc: 'Proposing structured theoretical and practical courses, with remote participation options for learners abroad.',
          },
          {
            num: '03',
            title: 'Fostering intergenerational dialogue',
            desc: 'Connecting elders, knowledge holders, researchers, and younger generations around living memory.',
          },
          {
            num: '04',
            title: 'Documenting authorized words and practices',
            desc: 'Recording verifiable provenance, original terminology, and rights-holder consent prior to public circulation.',
          },
          {
            num: '05',
            title: 'Presenting UNITRACA’s spiritual framework',
            desc: 'Explaining the organization’s beliefs with dignity while strictly avoiding medical or supernatural promises.',
          },
          {
            num: '06',
            title: 'Providing access to published teachings',
            desc: 'Separating public materials, authenticated member resources, and restricted-access archives.',
          },
        ]
      : [
          {
            num: '01',
            title: 'Comprendre les traditions dans leur contexte',
            desc: 'Situer chaque pratique, langue et histoire dans sa communauté précise plutôt que d’assimiler l’Afrique à un modèle unique.',
          },
          {
            num: '02',
            title: 'Transmettre des savoirs culturels',
            desc: 'Structurer des cours théoriques et pratiques, avec possibilité de suivi à distance pour les personnes à l’étranger.',
          },
          {
            num: '03',
            title: 'Favoriser les échanges entre générations',
            desc: 'Rapprocher les détenteurs du savoir, les chercheurs et les jeunes générations autour d’une mémoire vivante.',
          },
          {
            num: '04',
            title: 'Documenter des paroles et pratiques autorisées',
            desc: 'Consigner la provenance, les termes originaux et l’autorisation des détenteurs avant toute diffusion.',
          },
          {
            num: '05',
            title: 'Présenter la démarche spirituelle de l’organisation',
            desc: 'Exposer le cadre de convictions d’UNITRACA avec respect, sans promesse de guérison ni pression morale.',
          },
          {
            num: '06',
            title: 'Permettre l’accès à des enseignements publiés',
            desc: 'Distinguer les contenus publics, les ressources réservées aux membres et les archives à accès restreint.',
          },
        ];

  return (
    <>
      <PageMeta
        titleFr="UNITRACA | Traditions, cultures et transmission"
        titleEn="UNITRACA | Traditions, Cultures, and Transmission"
        descriptionFr="Découvrez UNITRACA, ses publications, ses rencontres et ses enseignements consacrés aux traditions et aux cultures africaines."
        descriptionEn="Discover UNITRACA, its publications, gatherings, and teachings dedicated to African traditions and cultures."
      />

      {/* FULL-WIDTH HERO CAROUSEL COMPONENT */}
      <HeroCarousel
        heroLabel={heroLabel}
        heroTitle={heroTitle}
        heroSubtitle={heroSubtitle}
        heroText={heroText}
        heroNotice={heroNotice}
      />

      {/* SECTION 1: PRESENTATION INSTITUTIONNELLE */}
      <section className="py-14 sm:py-16 md:py-24 border-b border-[var(--color-ivory-border)] hairline-grid-bg">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
          <FadeIn className="lg:col-span-5 space-y-3 sm:space-y-4">
            <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-logo-red)] font-semibold">
              01 · {t.nav.organization}
            </p>
            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-[var(--color-earth-dark)]">
              {t.home.secOrgTitle}
            </h2>
            <p className="text-sm text-[var(--color-logo-red)] font-medium">
              {lang === 'en'
                ? 'Rigorous transmission of African traditions and cultural memory'
                : 'Transmission structurée des traditions et de la mémoire culturelle africaine'}
            </p>
          </FadeIn>

          <FadeIn delay={0.1} className="lg:col-span-7 space-y-6">
            <p className="text-base sm:text-lg leading-relaxed text-[var(--color-ink)]">
              {t.home.secOrgLead}
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              <div className="glass-surface rounded-2xl p-6 card-interactive space-y-2">
                <p className="text-xs uppercase tracking-widest text-[var(--color-logo-red)] font-semibold">
                  {lang === 'en' ? 'Documented Sources' : 'Axes documentés'}
                </p>
                <h3 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
                  {lang === 'en' ? 'Theory, Practice & Diaspora' : 'Théorie, pratique & international'}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                  {lang === 'en'
                    ? 'Public videos and notices describe theoretical and practical teachings, distance participation for people abroad, conferences on traditions, and a Pan-African orientation.'
                    : 'Les communications accessibles décrivent des cours théoriques et pratiques, une ouverture en ligne pour les personnes à l’étranger, des conférences et une démarche panafricaine.'}
                </p>
              </div>
              <div className="glass-surface rounded-2xl p-6 card-interactive space-y-2">
                <p className="text-xs uppercase tracking-widest text-[var(--color-logo-red)] font-semibold">
                  {lang === 'en' ? 'Institutional Integrity' : 'Rigueur & Transparence'}
                </p>
                <h3 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
                  {lang === 'en' ? 'Zero Fabricated Claims' : 'Aucune donnée inventée'}
                </h3>
                <p className="text-sm leading-relaxed text-[var(--color-muted)]">
                  {lang === 'en'
                    ? 'Legal status, physical address, official phone/email, verified fee schedule, and detailed curriculum remain open until formally validated by UNITRACA.'
                    : 'Statut juridique, adresse physique, téléphone et e-mail officiels, tarifs et programme détaillé restent ouverts à validation par UNITRACA.'}
                </p>
              </div>
            </div>
            <div className="pt-2">
              <Link
                to="/unitraca"
                className="group inline-flex items-center gap-2 text-sm font-semibold text-[var(--color-logo-red)] hover:underline"
              >
                {lang === 'en'
                  ? 'Read full organization overview'
                  : 'Consulter la présentation complète d’UNITRACA'}
                <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* SECTION 2: ENSEIGNEMENTS PUBLIÉS (AVEC VISUELS GÉNÉRÉS & CARTES INTERACTIVES) */}
      <section className="py-14 sm:py-16 md:py-24 border-b border-[var(--color-ivory-border)]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
          <FadeIn className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-logo-red)] font-semibold">
                02 · {t.nav.teachings}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-[var(--color-earth-dark)]">
                {t.home.secTeachingsTitle}
              </h2>
              <p className="text-sm text-[var(--color-logo-red)] font-medium">
                {lang === 'en'
                  ? 'Theoretical and practical pathways — On-site and international online access'
                  : 'Parcours théoriques et pratiques — Suivi en présentiel et à distance pour l’étranger'}
              </p>
            </div>
            <Link
              to="/enseignements"
              className="group inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-semibold bg-[var(--color-earth-dark)] text-[var(--color-ivory)] hover:bg-[var(--color-logo-red)] transition-all whitespace-nowrap self-start md:self-auto"
            >
              {lang === 'en' ? 'Browse full catalog' : 'Explorer tout le catalogue'}
              <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
            </Link>
          </FadeIn>

          {loading ? (
            <p className="text-sm text-[var(--color-muted)]">{t.common.loading}</p>
          ) : teachings.length === 0 ? (
            <p className="text-sm text-[var(--color-muted)]">{t.common.noResults}</p>
          ) : (
            <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8">
              {teachings.map((item) => (
                <StaggerItem key={item.id}>
                  <article className="h-full group rounded-2xl overflow-hidden glass-surface card-interactive flex flex-col justify-between">
                    <div>
                      <div className="relative overflow-hidden aspect-[16/10] bg-[var(--color-ivory-soft)]">
                        <img
                          src={
                            item.cover_image ||
                            '/src/assets/images/teaching_transmission_culturelle_1794685227484.jpg'
                          }
                          alt={lang === 'en' ? item.title_en : item.title_fr}
                          referrerPolicy="no-referrer"
                          loading="lazy"
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                        <div className="absolute bottom-3.5 left-4 right-4 sm:bottom-4 sm:left-5 sm:right-5 flex flex-wrap items-center justify-between gap-2 text-xs text-white/95">
                          <span className="font-medium tracking-wider uppercase">
                            {item.format} · {item.language_offered.split('(')[0].trim()}
                          </span>
                          <span className="font-semibold text-[#FF7A7A]">
                            {item.enrollment_status === 'open'
                              ? lang === 'en'
                                ? 'Requests open'
                                : 'Demandes ouvertes'
                              : lang === 'en'
                                ? 'To be announced'
                                : 'À annoncer'}
                          </span>
                        </div>
                      </div>

                      <div className="p-5 sm:p-7 space-y-3">
                        <p className="text-xs font-semibold text-[var(--color-logo-red)]">
                          {item.tradition_context}
                        </p>
                        <h3 className="font-display text-2xl sm:text-3xl font-semibold text-[var(--color-earth-dark)] group-hover:text-[var(--color-logo-red)] transition-colors">
                          <Link to={`/enseignements/${item.slug}`}>
                            {lang === 'en' ? item.title_en : item.title_fr}
                          </Link>
                        </h3>
                        <p className="text-sm text-[var(--color-ink)]/85 leading-relaxed">
                          {lang === 'en' ? item.summary_en : item.summary_fr}
                        </p>
                      </div>
                    </div>

                    <div className="px-5 sm:px-7 py-4 border-t border-[var(--color-ivory-border)] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <span className="text-xs text-[var(--color-muted)]">
                        {lang === 'en' ? 'Speaker:' : 'Intervenant :'} {item.speaker}
                      </span>
                      <div className="flex items-center justify-between sm:justify-end gap-3">
                        <Link
                          to={`/enseignements/${item.slug}`}
                          className="text-xs font-semibold text-[var(--color-earth-dark)] hover:text-[var(--color-logo-red)]"
                        >
                          {t.common.readMore}
                        </Link>
                        <Link
                          to={`/inscription?teaching=${item.id}`}
                          className="px-3.5 py-2 rounded-lg text-xs font-medium bg-[var(--color-logo-red)] text-white hover:bg-[var(--color-earth-dark)] active:scale-95 transition-all whitespace-nowrap"
                        >
                          {t.common.requestEnrollment}
                        </Link>
                      </div>
                    </div>
                  </article>
                </StaggerItem>
              ))}
            </StaggerContainer>
          )}
        </div>
      </section>

      {/* SECTION 3: AXES DE TRANSMISSION */}
      <section className="py-14 sm:py-16 md:py-24 bg-[var(--color-earth-dark)] text-[var(--color-ivory)]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 space-y-10 sm:space-y-12">
          <FadeIn className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div className="space-y-2 max-w-2xl">
              <p className="text-xs uppercase tracking-[0.2em] text-[#FF5A5A] font-semibold">
                03 · {lang === 'en' ? 'Core Pillars' : 'Piliers & Axes de transmission'}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-white">
                {t.home.secAxesTitle}
              </h2>
              <p className="text-sm text-[#FF6B6B] font-medium">
                {lang === 'en'
                  ? 'Six foundational commitments guiding UNITRACA’s cultural and spiritual work'
                  : 'Six engagements structurants au service du patrimoine culturel et spirituel africain'}
              </p>
            </div>
            <Link
              to="/vision-et-valeurs"
              className="text-sm font-medium text-[var(--color-brass)] hover:underline"
            >
              {lang === 'en' ? 'Explore full charter →' : 'Consulter la charte complète →'}
            </Link>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {transmissionAxes.map((axis) => (
              <StaggerItem key={axis.num}>
                <div className="h-full glass-dark rounded-2xl p-6 space-y-3 hover:-translate-y-1 transition-transform duration-200">
                  <p className="text-xs font-semibold tracking-widest text-[#FF5A5A] tabular-nums">
                    {axis.num}
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-white">{axis.title}</h3>
                  <p className="text-sm leading-relaxed text-[var(--color-ivory)]/80">
                    {axis.desc}
                  </p>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* SECTION 4: FONDATEUR */}
      {founder && (
        <section className="py-14 sm:py-16 md:py-24 bg-[var(--color-ivory-soft)] border-b border-[var(--color-ivory-border)]">
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            <FadeIn className="lg:col-span-5">
              <div className="rounded-2xl overflow-hidden shadow-xl border border-[var(--color-ivory-border)] bg-[var(--color-ivory)] p-3">
                <ResilientImage
                  src="/assets/aistudio/images_7a6644fd.jpg"
                  alt={founder.display_name}
                  caption={founder.portrait_credit}
                  aspectClass="aspect-[4/5]"
                />
              </div>
            </FadeIn>
            <FadeIn delay={0.12} className="lg:col-span-7 space-y-5">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-logo-red)] font-semibold">
                04 · {t.nav.founder}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-[var(--color-earth-dark)]">
                {founder.display_name}
              </h2>
              <p className="text-sm font-semibold text-[var(--color-logo-red)]">
                Luminaire Ndia · Ndīā Shugaíntō II · {founder.author_attribution}
              </p>
              <p className="text-base leading-relaxed text-[var(--color-ink)]/90 whitespace-pre-line">
                {lang === 'en' ? founder.bio_en : founder.bio_fr}
              </p>
              <EthicalNotice
                variant="provisional"
                customText={lang === 'en' ? founder.oral_tradition_note_en : founder.oral_tradition_note_fr}
              />
              <div className="pt-2">
                <Link
                  to="/fondateur"
                  className="group inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-medium bg-[var(--color-logo-red)] text-white hover:bg-[var(--color-earth-dark)] active:scale-95 transition-all"
                >
                  {lang === 'en'
                    ? 'View founder biography & portrait gallery'
                    : 'Découvrir la biographie et les archives du fondateur'}
                  <ArrowRight className="w-4 h-4 transition-transform duration-200 group-hover:translate-x-1" />
                </Link>
              </div>
            </FadeIn>
          </div>
        </section>
      )}

      {/* SECTION 5: GRID-BASED TESTIMONIALS COMPONENT (IVORY & BRASS PALETTE) */}
      <section className="py-14 sm:py-16 md:py-24 border-b border-[var(--color-ivory-border)] hairline-grid-bg">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <Testimonials items={testimonials} loading={loading} sectionNumber="05" />
        </div>
      </section>

      {/* SECTION 6: AGENDA & DOSSIERS CULTURELS */}
      <section className="py-14 sm:py-16 md:py-24 border-b border-[var(--color-ivory-border)]">
        <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12">
          {/* Agenda */}
          <FadeIn className="lg:col-span-6 space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-logo-red)] font-semibold">
                  06 · {t.nav.agenda}
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--color-earth-dark)]">
                  {t.home.secAgendaTitle}
                </h2>
              </div>
              <a
                href="/api/events/calendar.ics"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--color-forest)] hover:underline"
              >
                <Calendar className="w-3.5 h-3.5" />
                {t.common.exportAllIcs}
              </a>
            </div>

            <div className="space-y-4">
              {events.map((ev) => (
                <div
                  key={ev.id}
                  className="rounded-2xl glass-surface p-5 sm:p-6 card-interactive space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                    <span className="font-semibold text-[var(--color-logo-red)] tabular-nums">
                      {formatLocalizedDate(ev.event_date, lang)} · {ev.start_time}–{ev.end_time}
                    </span>
                    <span className="text-[var(--color-muted)]">{ev.organizer_entity}</span>
                  </div>
                  <h3 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
                    <Link to={`/agenda/${ev.slug}`} className="hover:text-[var(--color-logo-red)]">
                      {lang === 'en' ? ev.title_en : ev.title_fr}
                    </Link>
                  </h3>
                  <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                    {lang === 'en' ? ev.description_en : ev.description_fr}
                  </p>
                </div>
              ))}
            </div>
          </FadeIn>

          {/* Patrimoines & Médiathèque */}
          <FadeIn delay={0.12} className="lg:col-span-6 space-y-6">
            <div className="flex flex-wrap items-end justify-between gap-2">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-logo-red)] font-semibold">
                  07 · {t.nav.heritage} & {t.nav.media}
                </p>
                <h2 className="font-display text-3xl sm:text-4xl font-semibold text-[var(--color-earth-dark)]">
                  {t.home.secDossiersTitle}
                </h2>
              </div>
              <Link
                to="/patrimoines"
                className="text-xs font-semibold text-[var(--color-logo-red)] hover:underline"
              >
                {lang === 'en' ? 'All dossiers →' : 'Tous les dossiers →'}
              </Link>
            </div>

            <div className="space-y-4">
              {dossiers.slice(0, 2).map((d) => (
                <article
                  key={d.id}
                  className="rounded-2xl glass-surface p-5 sm:p-6 card-interactive space-y-2"
                >
                  <p className="text-xs uppercase tracking-wider text-[var(--color-logo-red)] font-semibold">
                    {d.region} · {d.community_or_tradition}
                  </p>
                  <h3 className="font-display text-2xl font-semibold text-[var(--color-earth-dark)]">
                    <Link
                      to={`/patrimoines/${d.slug}`}
                      className="hover:text-[var(--color-logo-red)]"
                    >
                      {lang === 'en' ? d.title_en : d.title_fr}
                    </Link>
                  </h3>
                  <p className="text-xs text-[var(--color-muted)] leading-relaxed">
                    {lang === 'en' ? d.summary_en : d.summary_fr}
                  </p>
                </article>
              ))}
              {media.slice(0, 1).map((m) => (
                <article
                  key={m.id}
                  className="rounded-2xl border border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)]/60 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--color-logo-red)] font-semibold">
                      {t.nav.media} · {m.category}
                    </p>
                    <h3 className="font-display text-xl font-semibold text-[var(--color-earth-dark)]">
                      <Link
                        to={`/mediatheque/${m.slug}`}
                        className="hover:text-[var(--color-logo-red)]"
                      >
                        {lang === 'en' ? m.title_en : m.title_fr}
                      </Link>
                    </h3>
                  </div>
                  <Link
                    to="/mediatheque"
                    className="px-3.5 py-2 rounded-lg text-xs font-medium bg-[var(--color-earth-dark)] text-[var(--color-ivory)] whitespace-nowrap self-start sm:self-auto"
                  >
                    {lang === 'en' ? 'Media Library' : 'Médiathèque'}
                  </Link>
                </article>
              ))}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* SECTION 8: EXPANDABLE FAQ ACCORDION COMPONENT */}
      <section className="py-14 sm:py-16 md:py-24 border-b border-[var(--color-ivory-border)] bg-[var(--color-ivory-soft)]/50">
        <div className="max-w-[1024px] mx-auto px-4 sm:px-6 lg:px-8">
          <FAQ
            items={faqs}
            loading={loading}
            showHeader={true}
            showSearch={false}
            maxItems={6}
            sectionNumber="08"
          />
        </div>
      </section>

      {/* SECTION 9: INVITATION AU CONTACT */}
      <section className="py-14 sm:py-16 md:py-24">
        <FadeIn className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-3xl glass-surface p-6 sm:p-8 md:p-14 flex flex-col md:flex-row items-start md:items-center justify-between gap-8 shadow-xl">
            <div className="space-y-3 max-w-2xl">
              <p className="text-xs uppercase tracking-[0.2em] text-[var(--color-logo-red)] font-semibold">
                09 · {t.nav.contact}
              </p>
              <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-semibold text-[var(--color-earth-dark)]">
                {t.home.secContactTitle}
              </h2>
              <p className="text-sm sm:text-base text-[var(--color-ink)]/85 leading-relaxed">
                {t.home.secContactText}
              </p>
            </div>
            <div className="flex flex-wrap gap-4 shrink-0 w-full md:w-auto">
              <Link
                to="/inscription"
                className="flex-1 md:flex-initial text-center px-6 py-3.5 rounded-xl text-sm font-medium bg-[var(--color-logo-red)] text-white hover:bg-[var(--color-earth-dark)] active:scale-95 transition-all shadow-md whitespace-nowrap"
              >
                {t.common.requestEnrollment}
              </Link>
              <Link
                to="/contact"
                className="flex-1 md:flex-initial text-center px-6 py-3.5 rounded-xl text-sm font-medium border border-[var(--color-earth-dark)] text-[var(--color-earth-dark)] hover:bg-[var(--color-ivory-soft)] active:scale-95 transition-all whitespace-nowrap"
              >
                {t.nav.contact}
              </Link>
            </div>
          </div>
        </FadeIn>
      </section>
    </>
  );
}
