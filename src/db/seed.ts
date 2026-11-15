import type Database from 'better-sqlite3';
import type { SiteSettings } from '../types/unitraca.ts';

export const DEFAULT_SITE_SETTINGS: SiteSettings = {
  theme: {
    earthDark: '#2D211B',
    ivory: '#F8F1E5',
    terracotta: '#C81E1E',
    forest: '#24483B',
    brass: '#B18A47',
    ink: '#191714',
    muted: '#776B5E',
  },
  hero: {
    label_fr: 'Transmission · Culture · Traditions',
    label_en: 'Transmission · Culture · Traditions',
    title_fr: 'Comprendre nos héritages. Faire vivre la transmission.',
    title_en: 'Understanding our heritage. Keeping transmission alive.',
    subtitle_fr: 'Univers Initiatique aux Traditions et à la Culture Africaine',
    subtitle_en: 'Initiatory Universe for African Traditions and Culture',
    text_fr:
      'Un espace de découverte, d’échange et de transmission autour des traditions et des cultures africaines, selon la démarche et les enseignements portés par UNITRACA.',
    text_en:
      'A space for discovery, dialogue, and transmission devoted to African traditions and cultures, following the approach and teachings carried by UNITRACA.',
    editorial_notice_fr:
      'Direction éditoriale et charte visuelle harmonisée sur les couleurs du logo officiel UNITRACA.',
    editorial_notice_en:
      'Editorial direction and visual palette harmonized with the official UNITRACA logo.',
  },
  social: {
    youtube_url: 'https://www.youtube.com/channel/UCQdtVms0j7OcSEXRylmDSOw',
    facebook_url: 'https://www.facebook.com/UNITRACA/',
    whatsapp_number: '',
    verified_with_org: false,
  },
  payments: {
    enabled: false,
    reason_fr:
      'Les contributions et paiements en ligne sont désactivés tant que les tarifs, le bénéficiaire juridique et les conditions d’annulation n’ont pas été officiellement validés par UNITRACA.',
    reason_en:
      'Online payments and contributions remain disabled until fees, legal beneficiary details, and cancellation terms are officially validated by UNITRACA.',
  },
  languages: {
    active: ['fr', 'en'],
    planned_african_languages: [
      { code: 'ghomala', label: 'Ghɔmálá’ (Ouest-Cameroun)', status: 'En attente de traductions validées' },
      { code: 'feefe', label: 'Fe’efe’e (Ouest-Cameroun)', status: 'En attente de traductions validées' },
      { code: 'medumba', label: 'Mə̀dʉ̂mbɑ̀ (Ouest-Cameroun)', status: 'En attente de traductions validées' },
      { code: 'sw', label: 'Kiswahili', status: 'Architecture prête' },
    ],
  },
};

export function seedInitialContent(db: Database.Database): void {
  const existingSettings = db.prepare('SELECT key, value_json FROM site_settings WHERE key = ?').get('main') as
    | { key: string; value_json: string }
    | undefined;
  if (!existingSettings) {
    db.prepare('INSERT INTO site_settings (key, value_json) VALUES (?, ?)').run(
      'main',
      JSON.stringify(DEFAULT_SITE_SETTINGS)
    );
  } else {
    try {
      const parsed = JSON.parse(existingSettings.value_json) as SiteSettings;
      if (parsed.theme?.terracotta === '#A64B35') {
        parsed.theme.terracotta = '#C81E1E';
        db.prepare('UPDATE site_settings SET value_json = ? WHERE key = ?').run(JSON.stringify(parsed), 'main');
      }
    } catch {
      // ignore
    }
  }

  const existingFounder = db.prepare('SELECT id FROM founder_profile WHERE id = 1').get();
  if (!existingFounder) {
    db.prepare(`
      INSERT INTO founder_profile (
        id, display_name, titles_json, author_attribution, portrait_url, portrait_credit, gallery_json,
        bio_fr, bio_en, public_journey_fr, public_journey_en, publications_json, interventions_json,
        personal_message_fr, personal_message_en, oral_tradition_note_fr, oral_tradition_note_en, workflow_status
      ) VALUES (1, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')
    `).run(
      'Fo’o Tchamaleu',
      JSON.stringify([
        'Fo’o Tchamaleu (appellation publique principale)',
        'Luminaire Ndia (appellation utilisée dans les publications associées)',
        'Ndīā Shugaíntō II (appellation publique traditionnelle)',
        'Présenté sur la chaîne indexée comme chef traditionnel de Banwa et fondateur d’UNITRACA',
      ]),
      'Tchamaleu G. B. (notice d’auteur Write Africa)',
      '/assets/aistudio/images__1__26f818f9.jpg',
      'Portrait soumis pour le portail — droits, date et légende officielle à confirmer par UNITRACA.',
      JSON.stringify([
        {
          url: '/assets/aistudio/images__1__26f818f9.jpg',
          caption_fr: 'Portrait assis en tenue traditionnelle bleue et dorée, avec canne sculptée.',
          caption_en: 'Seated portrait in traditional blue and gold attire with carved staff.',
          credit: 'Source soumise — validation des droits en attente',
        },
        {
          url: '/assets/aistudio/images__2__80586b9c.jpg',
          caption_fr: 'Portrait en pied en tenue brodée portant la mention « AFRICA » et une représentation du continent.',
          caption_en: 'Full-length portrait in embroidered regalia featuring "AFRICA" and a continent motif.',
          credit: 'Source soumise — validation des droits en attente',
        },
        {
          url: '/assets/aistudio/images__3__a2cc7dd5.jpg',
          caption_fr: 'Remise de distinction devant un textile traditionnel bleu et blanc ; contexte exact et identité des personnes présentes à confirmer.',
          caption_en: 'Award presentation in front of a blue-and-white traditional cloth; exact context and co-attendees pending confirmation.',
          credit: 'Source soumise — validation des droits en attente',
        },
        {
          url: '/assets/aistudio/images__4__d3c9a0a1.jpg',
          caption_fr: 'Portrait assis en extérieur dans un cadre végétal ; lieu et circonstances exacts à documenter.',
          caption_en: 'Outdoor seated portrait in natural surroundings; exact venue and occasion to be documented.',
          credit: 'Source soumise — validation des droits en attente',
        },
        {
          url: '/assets/aistudio/images_7a6644fd.jpg',
          caption_fr: 'Portrait en tenue d’apparat traditionnelle avec attributs artisanaux ; contexte symbolique à préciser par les détenteurs du savoir.',
          caption_en: 'Portrait in traditional ceremonial attire with crafted regalia; symbolic context to be specified by knowledge holders.',
          credit: 'Source soumise — validation des droits en attente',
        },
      ]),
      `Les communications publiques associées à UNITRACA présentent Fo’o Tchamaleu — également désigné sous les appellations Luminaire Ndia et Ndīā Shugaíntō II — comme le fondateur d’UNITRACA (« Univers Initiatique aux Traditions et à la Culture Africaine »). Une présentation indexée de la chaîne vidéo le décrit également comme chef traditionnel de Banwa.\n\nPar souci de rigueur éditoriale, ce portail distingue les présentations publiques disponibles des vérifications administratives ou historiques qui restent à compléter directement avec l’organisation.`,
      `Public communications associated with UNITRACA introduce Fo’o Tchamaleu — also presented under the names Luminaire Ndia and Ndīā Shugaíntō II — as the founder of UNITRACA ("Univers Initiatique aux Traditions et à la Culture Africaine"). An indexed presentation of the video channel also describes him as traditional chief of Banwa.\n\nIn keeping with editorial rigor, this portal distinguishes publicly available introductions from administrative or historical verifications that remain to be completed directly with the organization.`,
      `Les éléments publics consultés font état d’interventions audiovisuelles, de prises de parole autour des traditions africaines, de la place des ancêtres dans la vie contemporaine et du développement culturel du continent. Une notice d’auteur publiée sous le nom Tchamaleu G. B. sur Write Africa souligne une orientation panafricaniste, kamite et animiste.\n\nLes précisions biographiques complémentaires (parcours détaillé, dates vérifiées, distinctions et affiliations exactes) seront publiées ici après validation écrite du fondateur.`,
      `Publicly indexed communications include audiovisual talks and public addresses centered on African traditions, ancestral memory in contemporary life, and cultural development. An author note published under the name Tchamaleu G. B. on Write Africa highlights a Pan-Africanist, Kamite, and animist orientation.\n\nFurther biographical details (verified timeline, distinctions, and exact institutional affiliations) will be published here upon written confirmation from the founder.`,
      JSON.stringify([
        {
          title: 'Notice d’auteur — Tchamaleu G. B.',
          source: 'Write Africa (référence indexée)',
          note_fr: 'Présente une orientation panafricaniste, kamite et animiste. Les éléments généalogiques ou spirituels mentionnés dans cette notice relèvent de la tradition revendiquée ou de la croyance et ne sont pas présentés comme des faits scientifiquement établis.',
          note_en: 'Highlights a Pan-Africanist, Kamite, and animist perspective. Genealogical or spiritual statements in that notice belong to claimed tradition or belief and are not presented as scientifically established facts.',
        },
        {
          title: 'Interventions sur la chaîne YouTube UNITRACA',
          source: 'YouTube — Chaîne UNITRACA',
          note_fr: 'Prises de parole publiques sur les traditions, la culture et la spiritualité africaines.',
          note_en: 'Public addresses on African traditions, culture, and spirituality.',
        },
      ]),
      JSON.stringify([
        {
          title_fr: 'Prises de parole sur le rôle des traditions et le développement de l’Afrique',
          title_en: 'Talks on the role of traditions and Africa’s development',
          context_fr: 'Interventions indexées consacrées au dialogue entre héritage culturel et société contemporaine.',
          context_en: 'Indexed talks dedicated to dialogue between cultural heritage and contemporary society.',
          organizer_note: 'À vérifier événement par événement pour distinguer les rencontres organisées directement par UNITRACA des invitations externes.',
        },
        {
          title_fr: 'Annonces d’enseignements théoriques et pratiques',
          title_en: 'Announcements of theoretical and practical teachings',
          context_fr: 'Communications évoquant une transmission structurée et la possibilité d’un suivi à distance pour la diaspora.',
          context_en: 'Communications mentioning structured transmission and remote participation options for people abroad.',
          organizer_note: 'Calendrier actuel et modalités d’inscription en attente de confirmation par UNITRACA.',
        },
      ]),
      '« Espace réservé au message personnel validé par Fo’o Tchamaleu / Luminaire Ndia / Ndīā Shugaíntō II. Ce texte doit être rédigé ou approuvé directement par le fondateur avant publication définitive. »',
      '"Space reserved for the personal message validated by Fo’o Tchamaleu / Luminaire Ndia / Ndīā Shugaíntō II. This text must be written or directly approved by the founder prior to final publication."',
      'Note de méthode : conformément aux principes éditoriaux du portail, les titres traditionnels, récits de lignée et éléments issus de la tradition orale sont attribués à leur cadre communautaire ou aux communications publiques de l’auteur. Ils ne valent ni certification administrative étatique ni titre universitaire ou médical.',
      'Methodological note: in accordance with the portal’s editorial charter, traditional titles, lineage accounts, and oral tradition narratives are attributed to their community context or the author’s public statements. They do not constitute state administrative certification or academic/medical credentials.',
    );
  }

  const teachingsCount = (db.prepare('SELECT COUNT(*) as c FROM teachings').get() as { c: number }).c;
  if (teachingsCount === 0) {
    const insertTeaching = db.prepare(`
      INSERT INTO teachings (
        slug, title_fr, title_en, summary_fr, summary_en, objectives_fr, objectives_en,
        speaker, tradition_context, language_offered, format, duration,
        target_audience_fr, target_audience_en, prerequisites_fr, prerequisites_en,
        schedule_note_fr, schedule_note_en, location_or_mode, price_validated, price_display,
        conditions_fr, conditions_en, limits_notice_fr, limits_notice_en, cover_image,
        enrollment_status, workflow_status, is_featured
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertTeaching.run(
      'transmission-culturelle-et-spirituelle',
      'Introduction à la démarche culturelle et spirituelle d’UNITRACA',
      'Introduction to UNITRACA’s Cultural and Spiritual Approach',
      'Présentation structurée des repères culturels, de la mémoire des traditions et du cadre spirituel porté par UNITRACA, à la croisée des apports théoriques et des échanges.',
      'Structured presentation of cultural landmarks, traditional memory, and the spiritual framework carried by UNITRACA, combining theoretical input and dialogue.',
      'Comprendre les fondements de la démarche de réappropriation culturelle ; situer les traditions étudiées dans leur contexte communautaire et historique ; distinguer savoirs documentés et convictions spirituelles.',
      'Understand the foundations of cultural reclamation; situate studied traditions in their community and historical context; distinguish documented history from spiritual beliefs.',
      'Fo’o Tchamaleu (à confirmer selon session)',
      'Orientation panafricaniste et traditions d’Afrique centrale / Ouest-Cameroun (contexte précisé à chaque séance)',
      'Français (ouverture possible vers l’anglais et langues africaines selon intervenants)',
      'Cycle de transmission',
      'À confirmer par UNITRACA',
      'Adultes souhaitant découvrir les traditions et la démarche d’UNITRACA dans un cadre respectueux et structuré.',
      'Adults wishing to discover African traditions and UNITRACA’s approach in a respectful, structured framework.',
      'Aucun prérequis académique. Engagement de respect envers les communautés et les règles de confidentialité des échanges.',
      'No academic prerequisites. Commitment to respect communities and confidentiality guidelines.',
      'Prochaine session à annoncer par l’organisation (les dates antérieures ne sont pas reconduites automatiquement).',
      'Upcoming session to be announced by the organization (past dates are not carried over automatically).',
      'Présentiel et participation en ligne à confirmer',
      0,
      'Tarifs non encore validés par UNITRACA',
      'Une demande d’inscription en ligne ne vaut pas admission définitive. Participation réservée aux personnes majeures sauf autorisation parentale encadrée.',
      'Submitting a registration request does not guarantee admission. Participation is restricted to adults unless governed by an approved guardian procedure.',
      'Ce cycle relève d’une démarche culturelle et spirituelle propre à UNITRACA. Il ne délivre aucun diplôme reconnu par l’État, ne constitue pas une formation médicale et ne promet ni guérison ni résultat matériel ou surnaturel.',
      'This cycle reflects UNITRACA’s cultural and spiritual framework. It awards no state-recognized degree, does not constitute medical training, and makes no promise of healing or supernatural outcomes.',
      '/src/assets/images/teaching_transmission_culturelle_1794685227484.jpg',
      'to_announce',
      'published',
      1
    );

    insertTeaching.run(
      'cours-theoriques-et-pratiques-distance',
      'Cours théoriques et pratiques : participation à l’étranger',
      'Theoretical and Practical Courses: International Online Participation',
      'Dispositif annoncé dans les communications de la chaîne UNITRACA pour permettre aux personnes résidant hors du pays d’origine de suivre les enseignements théoriques et les ateliers encadrés.',
      'Format announced in UNITRACA channel communications enabling participants living abroad to follow theoretical lessons and supervised workshops.',
      'Permettre un accès structuré à distance aux enseignements publiés ; distinguer clairement les séances publiques des modules réservés aux membres admis.',
      'Enable structured remote access to published teachings; clearly distinguish public sessions from modules reserved for admitted members.',
      'Intervenants désignés par UNITRACA (liste à valider)',
      'Cadre culturel UNITRACA — communautés précisées par module',
      'Français / Anglais (selon cohorte)',
      'Cours en ligne',
      'À définir dans le programme pédagogique validé',
      'Personnes de la diaspora et auditeurs internationaux majeurs.',
      'Diaspora participants and international adult learners.',
      'Dossier de demande d’inscription validé et acceptation des conditions de diffusion des contenus.',
      'Approved registration request and acceptance of content distribution guidelines.',
      'Ouvert au recensement des demandes d’intérêt — calendrier précis communiqué après validation administrative.',
      'Open for interest requests — exact schedule communicated after administrative review.',
      'En ligne (modalités techniques communiquées après validation)',
      0,
      'À confirmer après validation administrative',
      'Aucun paiement n’est demandé sur cette plateforme tant que les tarifs et conditions d’annulation ne sont pas publiés.',
      'No payment is collected on this platform until fees and cancellation policies are officially published.',
      'Une éventuelle attestation de suivi délivrée par UNITRACA ne peut en aucun cas être assimilée à un titre universitaire, professionnel ou thérapeutique.',
      'Any certificate of attendance issued by UNITRACA must not be equated with an academic, professional, or therapeutic credential.',
      '/src/assets/images/teaching_cours_distance_1794685228457.jpg',
      'open',
      'published',
      1
    );

    insertTeaching.run(
      'parcours-initiatique-cadre-et-limites',
      'Parcours initiatique : présentation du cadre et des conditions d’accès',
      'Initiatory Pathway: Framework and Access Conditions',
      'Présentation transparente de ce que recouvre la notion de parcours initiatique au sein d’UNITRACA : séparation stricte entre contenus publics, espaces membres et savoirs à accès restreint.',
      'Transparent overview of what the initiatory pathway covers within UNITRACA: strict separation between public content, member areas, and restricted-access knowledge.',
      'Expliquer les étapes de progression proposées dans le cadre de croyances de l’organisation ; informer clairement sur les limites du service et la liberté de retrait du participant.',
      'Explain the progression stages proposed within the organization’s belief framework; clearly state service boundaries and participant freedom to withdraw.',
      'Responsables désignés par UNITRACA',
      'Traditions et cadre spirituel portés par UNITRACA (sources précisées lors de l’entretien d’orientation)',
      'Français',
      'Rencontre',
      'Sur entretien et calendrier validé',
      'Adultes uniquement (18 ans et plus).',
      'Adults only (18+).',
      'Demande préalable examinée par l’équipe responsable ; aucune information médicale ou confession intime n’est exigée dans le formulaire.',
      'Prior request reviewed by the responsible team; no medical records or intimate confessions are requested on the form.',
      'Rencontres d’information programmées sur demande.',
      'Information meetings scheduled upon request.',
      'Selon validation de l’organisation',
      0,
      'Conditions à valider directement avec UNITRACA',
      'Liberté totale d’adhésion et de retrait ; aucune pression morale ou promesse de protection surnaturelle.',
      'Complete freedom to join or withdraw; zero moral pressure or promises of supernatural protection.',
      'La spiritualité est présentée comme le cadre de convictions d’UNITRACA. Elle ne remplace jamais un avis ou un suivi médical, psychologique ou juridique professionnel.',
      'Spirituality is presented as UNITRACA’s framework of beliefs. It never replaces professional medical, psychological, or legal care.',
      '/src/assets/images/teaching_parcours_initiatique_1794685229946.jpg',
      'to_announce',
      'published',
      1
    );

    insertTeaching.run(
      'conferences-traditions-et-developpement-afrique',
      'Conférences : Traditions africaines, mémoire et enjeux contemporains',
      'Conferences: African Traditions, Memory, and Contemporary Issues',
      'Cycle de prises de parole et d’échanges autour de la place du patrimoine culturel, de la mémoire des ancêtres et du développement contemporain du continent africain.',
      'Series of talks and exchanges around cultural heritage, ancestral memory, and the contemporary development of the African continent.',
      'Mettre en dialogue les héritages culturels documentés et les défis contemporains ; distinguer les conférences organisées par UNITRACA des invitations externes.',
      'Bring documented cultural heritage into dialogue with contemporary challenges; distinguish UNITRACA conferences from external invitations.',
      'Fo’o Tchamaleu / Luminaire Ndia',
      'Approche panafricaine et études comparées (communautés précisées par conférence)',
      'Français / Anglais',
      'Conférence',
      'Séances de 2 heures',
      'Tout public majeur intéressé par le patrimoine culturel africain.',
      'General adult audience interested in African cultural heritage.',
      'Inscription préalable souhaitée pour recevoir le lien ou les informations d’accès.',
      'Prior registration recommended to receive access details.',
      'Dates publiées dans la rubrique Agenda au fur et à mesure de leur confirmation.',
      'Dates published in the Agenda section as they are confirmed.',
      'Hybride (en ligne et présentiel selon événement)',
      0,
      'Entrée selon modalités de chaque rencontre',
      'Respect de la charte d’écoute et d’échange.',
      'Compliance with dialogue and listening guidelines.',
      'Les propos tenus en conférence engagent leurs auteurs dans leur cadre culturel et philosophique ; ils ne constituent pas des prescriptions médicales.',
      'Statements made during conferences reflect the authors’ cultural and philosophical perspectives and do not constitute medical prescriptions.',
      '/src/assets/images/teaching_philosophie_panafricaine_1794685230415.jpg',
      'open',
      'published',
      1
    );
  } else {
    // Ensure existing teachings have their generated cover images populated
    db.prepare(`UPDATE teachings SET cover_image = ? WHERE slug = ? AND (cover_image = '' OR cover_image IS NULL)`).run(
      '/src/assets/images/teaching_transmission_culturelle_1794685227484.jpg',
      'transmission-culturelle-et-spirituelle'
    );
    db.prepare(`UPDATE teachings SET cover_image = ? WHERE slug = ? AND (cover_image = '' OR cover_image IS NULL)`).run(
      '/src/assets/images/teaching_cours_distance_1794685228457.jpg',
      'cours-theoriques-et-pratiques-distance'
    );
    db.prepare(`UPDATE teachings SET cover_image = ? WHERE slug = ? AND (cover_image = '' OR cover_image IS NULL)`).run(
      '/src/assets/images/teaching_parcours_initiatique_1794685229946.jpg',
      'parcours-initiatique-cadre-et-limites'
    );
    const hasFourth = db.prepare(`SELECT id FROM teachings WHERE slug = 'conferences-traditions-et-developpement-afrique'`).get();
    if (!hasFourth) {
      db.prepare(`
        INSERT INTO teachings (
          slug, title_fr, title_en, summary_fr, summary_en, objectives_fr, objectives_en,
          speaker, tradition_context, language_offered, format, duration,
          target_audience_fr, target_audience_en, prerequisites_fr, prerequisites_en,
          schedule_note_fr, schedule_note_en, location_or_mode, price_validated, price_display,
          conditions_fr, conditions_en, limits_notice_fr, limits_notice_en, cover_image,
          enrollment_status, workflow_status, is_featured
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(
        'conferences-traditions-et-developpement-afrique',
        'Conférences : Traditions africaines, mémoire et enjeux contemporains',
        'Conferences: African Traditions, Memory, and Contemporary Issues',
        'Cycle de prises de parole et d’échanges autour de la place du patrimoine culturel, de la mémoire des ancêtres et du développement contemporain du continent africain.',
        'Series of talks and exchanges around cultural heritage, ancestral memory, and the contemporary development of the African continent.',
        'Mettre en dialogue les héritages culturels documentés et les défis contemporains ; distinguer les conférences organisées par UNITRACA des invitations externes.',
        'Bring documented cultural heritage into dialogue with contemporary challenges; distinguish UNITRACA conferences from external invitations.',
        'Fo’o Tchamaleu / Luminaire Ndia',
        'Approche panafricaine et études comparées (communautés précisées par conférence)',
        'Français / Anglais',
        'Conférence',
        'Séances de 2 heures',
        'Tout public majeur intéressé par le patrimoine culturel africain.',
        'General adult audience interested in African cultural heritage.',
        'Inscription préalable souhaitée pour recevoir le lien ou les informations d’accès.',
        'Prior registration recommended to receive access details.',
        'Dates publiées dans la rubrique Agenda au fur et à mesure de leur confirmation.',
        'Dates published in the Agenda section as they are confirmed.',
        'Hybride (en ligne et présentiel selon événement)',
        0,
        'Entrée selon modalités de chaque rencontre',
        'Respect de la charte d’écoute et d’échange.',
        'Compliance with dialogue and listening guidelines.',
        'Les propos tenus en conférence engagent leurs auteurs dans leur cadre culturel et philosophique ; ils ne constituent pas des prescriptions médicales.',
        'Statements made during conferences reflect the authors’ cultural and philosophical perspectives and do not constitute medical prescriptions.',
        '/src/assets/images/teaching_philosophie_panafricaine_1794685230415.jpg',
        'open',
        'published',
        1
      );
    }
  }

  const eventsCount = (db.prepare('SELECT COUNT(*) as c FROM events').get() as { c: number }).c;
  if (eventsCount === 0) {
    const insertEvent = db.prepare(`
      INSERT INTO events (
        slug, title_fr, title_en, description_fr, description_en, organizer_entity,
        event_date, start_time, end_time, timezone, format, validated_location,
        location_verified, speakers_json, program_fr, program_en, conditions_fr, conditions_en,
        accessibility_fr, accessibility_en, registration_open, workflow_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertEvent.run(
      'rencontre-dialogue-traditions-contemporaines',
      'Rencontre d’information : Traditions africaines et société contemporaine',
      'Information Session: African Traditions and Contemporary Society',
      'Séance publique d’échange destinée à présenter les axes culturels, éditoriaux et pédagogiques d’UNITRACA, et à recueillir les questions du public.',
      'Public dialogue session introducing UNITRACA’s cultural, editorial, and educational areas of work and addressing audience questions.',
      'UNITRACA',
      '2027-02-20',
      '16:00',
      '18:00',
      'Africa/Douala',
      'En ligne (lien envoyé après validation)',
      'Lieu en ligne à confirmer — aucune adresse physique validée pour cette séance',
      0,
      JSON.stringify(['Fo’o Tchamaleu (à confirmer)', 'Équipe éditoriale UNITRACA']),
      '16:00 — Mot d’ouverture et présentation du cadre\n16:30 — Échanges sur la transmission intergénérationnelle\n17:30 — Questions du public et modalités d’inscription',
      '16:00 — Opening remarks and framework presentation\n16:30 — Dialogue on intergenerational transmission\n17:30 — Public Q&A and enrollment procedure',
      'Accès gratuit sur demande préalable. Aucune donnée de santé demandée.',
      'Free access upon prior request. No health data requested.',
      'Sous-titrage ou compte-rendu écrit prévu après la séance si validé.',
      'Written summary or captions planned after the session once validated.',
      1,
      'published'
    );

    insertEvent.run(
      'colloque-memoire-culturelle-afrique',
      'Table ronde éditoriale : Documenter les patrimoines sans les figer',
      'Editorial Roundtable: Documenting Heritage Without Freezing It',
      'Rencontre consacrée aux méthodes de documentation respectueuse des savoirs oraux, aux droits des détenteurs du savoir et à la distinction entre traditions régionales.',
      'Roundtable focused on respectful documentation of oral knowledge, rights of knowledge holders, and distinguishing regional traditions.',
      'UNITRACA (en dialogue avec intervenants invités — partenariats à confirmer)',
      '2027-03-14',
      '15:00',
      '17:00',
      'Africa/Douala',
      'Hybride / Modalités à confirmer',
      'Lieu exact non encore validé (carte masquée)',
      0,
      JSON.stringify(['Intervenants à confirmer par UNITRACA']),
      '15:00 — Pluralité des traditions africaines\n15:45 — Protection des images et consentement des communautés\n16:30 — Discussion ouverte',
      '15:00 — Plurality of African traditions\n15:45 — Media protection and community consent\n16:30 — Open discussion',
      'Programme indicatif soumis à confirmation officielle de l’organisation.',
      'Indicative program subject to official confirmation by the organization.',
      'Accessibilité physique à préciser dès validation du lieu.',
      'Physical accessibility details to be added once a venue is confirmed.',
      0,
      'published'
    );
  }

  const mediaCount = (db.prepare('SELECT COUNT(*) as c FROM media_resources').get() as { c: number }).c;
  if (mediaCount === 0) {
    const insertMedia = db.prepare(`
      INSERT INTO media_resources (
        slug, title_fr, title_en, category, theme, speaker, language,
        community_context, holder_or_author, authorization_status, diffusion_conditions,
        credit, published_date, access_level, thumbnail_url, embed_url,
        summary_fr, summary_en, body_fr, body_en, transcript_fr, transcript_en,
        subtitles_available, health_disclaimer_required, workflow_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertMedia.run(
      'presentation-chaine-audiovisuelle-unitraca',
      'Chaîne audiovisuelle UNITRACA : repères de diffusion officielle',
      'UNITRACA Audiovisual Channel: Official Broadcast Guidelines',
      'video',
      'Diffusion audiovisuelle',
      'Fo’o Tchamaleu / Luminaire Ndia',
      'Français',
      'Communications publiques d’UNITRACA (liens officiels à vérifier avec l’organisation)',
      'UNITRACA',
      'pending_validation',
      'Intégration des seules vidéos explicitement autorisées ; aucune copie automatique depuis les réseaux.',
      'Chaîne YouTube UNITRACA (UCQdtVms0j7OcSEXRylmDSOw)',
      '2026-11-01',
      'public',
      '/assets/aistudio/channels4_profile_71e826b0.jpg',
      'https://www.youtube.com/channel/UCQdtVms0j7OcSEXRylmDSOw',
      'Présentation de la politique de diffusion audiovisuelle d’UNITRACA : accès direct vers la chaîne indexée et règles de contextualisation des interventions.',
      'Overview of UNITRACA’s audiovisual policy: direct link to the indexed channel and contextualization guidelines for talks.',
      'La médiathèque UNITRACA privilégie les intégrations officielles et les fichiers autorisés par leurs détenteurs. Les vidéos publiées sur la chaîne YouTube indexée abordent la culture, la mémoire ancestrale et la spiritualité dans le cadre propre à l’organisation.\n\nLes vidéos individuelles seront intégrées au lecteur du portail au fur et à mesure de la validation écrite de leurs crédits, transcriptions et sous-titres par l’équipe éditoriale.',
      'The UNITRACA media library prioritizes official embeds and files authorized by rights holders. Videos on the indexed YouTube channel address culture, ancestral memory, and spirituality within the organization’s framework.\n\nIndividual videos will be embedded in the portal player as credits, transcripts, and captions receive written editorial approval.',
      'Transcription complète disponible dès ajout des vidéos individuelles validées.',
      'Full transcript available once individual validated videos are added.',
      0,
      1,
      'published'
    );

    insertMedia.run(
      'galerie-portraits-et-archives-soumises',
      'Archives visuelles soumises pour validation éditoriale',
      'Visual Archives Submitted for Editorial Validation',
      'gallery',
      'Patrimoine iconographique',
      'Fo’o Tchamaleu',
      'Français / Anglais',
      'Portraits du fondateur et tenues traditionnelles (légendes et droits à confirmer)',
      'Archives soumises — UNITRACA',
      'pending_validation',
      'Diffusion conditionnée à la confirmation des auteurs des photographies et de l’accord des personnes représentées.',
      'Fonds visuel soumis lors de la conception du portail',
      '2026-11-05',
      'public',
      '/assets/aistudio/images_7a6644fd.jpg',
      '',
      'Ensemble de portraits fournis pour documenter l’identité visuelle du fondateur et préparer la validation des légendes culturelles.',
      'Collection of portraits provided to document the founder’s visual identity and prepare validation of cultural captions.',
      'Chaque image présentée dans cette galerie provient des visuels fournis pour la construction du portail. Avant publication définitive, l’administration permet de renseigner pour chaque cliché : le photographe ou détenteur des droits, la date et le lieu exacts, le contexte rituel ou institutionnel autorisé, ainsi qu’une éventuelle demande de retrait.',
      'Each image presented in this gallery comes from the visuals supplied for building the portal. Before final publication, the admin panel allows documenting the photographer or rights holder, exact date and location, authorized ceremonial or institutional context, and any removal request.',
      '',
      '',
      0,
      0,
      'published'
    );

    insertMedia.run(
      'cadre-croyances-et-sante-notice-ethique',
      'Distinction entre démarche spirituelle et soins de santé',
      'Distinguishing Spiritual Practice from Medical Healthcare',
      'article',
      'Éthique & Éditorial',
      'Comité éditorial UNITRACA',
      'Français',
      'Cadre institutionnel UNITRACA',
      'UNITRACA',
      'authorized',
      'Document public d’information et de protection des usagers.',
      'Rédaction UNITRACA',
      '2026-11-10',
      'public',
      '/src/assets/images/teaching_transmission_culturelle_1794685227484.jpg',
      '',
      'Pourquoi UNITRACA distingue clairement ses enseignements spirituels de toute promesse médicale, diagnostique ou thérapeutique.',
      'Why UNITRACA clearly separates its spiritual teachings from any medical, diagnostic, or therapeutic promises.',
      'Les traditions spirituelles africaines s’inscrivent dans des systèmes de sens, de transmission morale et de lien communautaire qui méritent respect et précision. Toutefois, aucune prise de parole ou pratique présentée sur ce portail ne constitue un acte médical.\n\nLes propos d’intervenants évoquant des expériences spirituelles relèvent de leurs convictions ou de leur témoignage personnel. Ils ne doivent jamais conduire à interrompre un traitement prescrit ni à différer une consultation auprès d’un professionnel de santé qualifié.',
      'African spiritual traditions belong to systems of meaning, moral transmission, and community belonging deserving respect and accuracy. However, no talk or practice presented on this portal constitutes a medical act.\n\nStatements by speakers referencing spiritual experiences belong to their personal convictions or testimony. They must never lead anyone to stop prescribed treatment or delay consulting a qualified healthcare professional.',
      '',
      '',
      0,
      1,
      'published'
    );

    insertMedia.run(
      'guide-methodologique-membre-ecoute-savoirs',
      'Guide méthodologique : contextualiser un savoir oral (Espace Membres)',
      'Methodological Guide: Contextualizing Oral Knowledge (Members)',
      'document',
      'Méthodologie',
      'Comité pédagogique UNITRACA',
      'Français',
      'Document réservé aux comptes membres authentifiés',
      'UNITRACA',
      'authorized',
      'Accès réservé aux membres connectés ; reproduction interdite sans accord écrit.',
      'Document pédagogique interne UNITRACA',
      '2026-11-08',
      'member',
      '/src/assets/images/teaching_cours_distance_1794685228457.jpg',
      '',
      'Ressource réservée aux membres connectés expliquant comment noter la provenance, la langue et les limites d’interprétation d’un récit traditionnel.',
      'Resource reserved for signed-in members explaining how to record provenance, language, and interpretation boundaries of a traditional account.',
      '1. Toujours relever le nom exact de la communauté, du village ou du groupe linguistique d’origine.\n2. Consigner les termes dans leur graphie d’origine (avec tons et signes diacritiques lorsque connus) avant toute traduction.\n3. Distinguer systématiquement trois strates : le fait historique vérifiable, le récit transmis par tradition orale, et l’interprétation spirituelle contemporaine.\n4. Vérifier auprès du détenteur du savoir si la diffusion publique est autorisée ou si le contenu doit demeurer dans le cercle restreint.',
      '1. Always record the exact name of the community, village, or linguistic group of origin.\n2. Preserve terms in their original orthography (including tones and diacritics when known) prior to translation.\n3. Systematically distinguish three layers: verifiable historical fact, oral tradition narrative, and contemporary spiritual interpretation.\n4. Confirm with the knowledge holder whether public sharing is authorized or whether the content must remain restricted.',
      '',
      '',
      0,
      0,
      'published'
    );

    insertMedia.run(
      'protocole-savoirs-restreints-detenteurs',
      'Protocole d’accès restreint et gouvernance des archives sensibles',
      'Restricted Access Protocol and Sensitive Archive Governance',
      'document',
      'Protection culturelle',
      'Conseil de validation (à nommer)',
      'Français',
      'Gouvernance interne des savoirs sensibles',
      'Détenteurs du savoir & UNITRACA',
      'restricted_rights',
      'Accès individuel accordé uniquement par un responsable administrateur.',
      'Protocole de protection culturelle UNITRACA',
      '2026-11-12',
      'restricted',
      '/src/assets/images/teaching_parcours_initiatique_1794685229946.jpg',
      '',
      'Document de gouvernance accessible uniquement après autorisation explicite attribuée par un responsable UNITRACA.',
      'Governance document accessible only after explicit authorization granted by a UNITRACA administrator.',
      'Ce document décrit la procédure de classification des contenus à accès restreint :\n- Aucun média sensible n’est stocké dans un répertoire public ou livré dans les réponses API publiques.\n- Chaque attribution d’accès est nominative, motivée et tracée dans le journal d’audit.\n- Toute demande de retrait formulée par un détenteur légitime ou une communauté concernée entraîne la suspension immédiate de la diffusion en attente de réexamen.',
      'This document outlines the classification procedure for restricted-access content:\n- No sensitive media is stored in a public directory or returned in public API payloads.\n- Every access grant is nominative, justified, and logged in the audit trail.\n- Any removal request submitted by a legitimate holder or concerned community triggers immediate suspension pending review.',
      '',
      '',
      0,
      0,
      'published'
    );
  }

  const dossiersCount = (db.prepare('SELECT COUNT(*) as c FROM heritage_dossiers').get() as { c: number }).c;
  if (dossiersCount === 0) {
    const insertDossier = db.prepare(`
      INSERT INTO heritage_dossiers (
        slug, title_fr, title_en, community_or_tradition, region,
        summary_fr, summary_en, documented_context_fr, documented_context_en,
        oral_tradition_fr, oral_tradition_en, interpretation_fr, interpretation_en,
        sources_json, margin_notes_json, cover_image, image_credit, workflow_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    insertDossier.run(
      'banwa-et-traditions-ouest-cameroun',
      'Banwa et traditions de l’Ouest-Cameroun : repères contextuels',
      'Banwa and Western Cameroon Traditions: Contextual Landmarks',
      'Communautés Bamiléké / Banwa (contexte à enrichir avec les détenteurs locaux)',
      'Ouest-Cameroun',
      'Dossier introductif situant la mention de Banwa dans les communications associées au fondateur, tout en séparant histoire documentée et tradition orale.',
      'Introductory dossier situating the reference to Banwa in communications associated with the founder, separating documented history from oral tradition.',
      'Dans les présentations publiques indexées de la chaîne UNITRACA, le fondateur Fo’o Tchamaleu est décrit comme chef traditionnel de Banwa. Les traditions de l’Ouest-Cameroun reposent sur des institutions communautaires anciennes, des chefferies structurées, des arts textiles (tels que le Ndop, dont l’usage et les motifs obéissent à des codes précis) et des langues nationales vivantes.\n\nCe portail ne substitue aucune enquête historique ou administrative à la parole des institutions locales compétentes ; les éléments historiques détaillés sur Banwa seront intégrés après validation documentaire.',
      'In publicly indexed UNITRACA channel introductions, founder Fo’o Tchamaleu is described as traditional chief of Banwa. Western Cameroon traditions rest on longstanding community institutions, structured chieftaincies, textile arts (such as Ndop, whose use and motifs follow specific codes), and living national languages.\n\nThis portal does not replace local historical or administrative records; detailed historical notes on Banwa will be integrated upon documentary validation.',
      'Selon les présentations orales et communications associées à Fo’o Tchamaleu (Ndīā Shugaíntō II), la transmission des savoirs s’inscrit dans une continuité ancestrale et coutumière. Conformément à la charte éditoriale, ces mentions lignagères et coutumières sont présentées comme relevant de la tradition revendiquée et de la parole transmise par l’auteur.',
      'According to oral presentations and communications associated with Fo’o Tchamaleu (Ndīā Shugaíntō II), knowledge transmission is rooted in ancestral and customary continuity. Per the editorial charter, lineage and customary statements are presented as claimed tradition and author-attributed oral accounts.',
      'UNITRACA propose une lecture contemporaine visant à rapprocher les jeunes générations et la diaspora de leur mémoire culturelle, sans réduire la diversité des chefferies de l’Ouest-Cameroun à un modèle unique.',
      'UNITRACA proposes a contemporary reading aimed at reconnecting younger generations and the diaspora with cultural memory, without reducing the diversity of Western Cameroon chieftaincies to a single template.',
      JSON.stringify([
        'Présentation indexée de la chaîne YouTube UNITRACA',
        'Références contextuelles à documenter avec les notables et chercheurs locaux',
      ]),
      JSON.stringify([
        {
          ref: 'Note 1',
          title_fr: 'Précaution terminologique',
          title_en: 'Terminological caution',
          body_fr: 'Les motifs textiles ou attributs visibles sur les photographies ne doivent jamais être renommés arbitrairement sans validation des détenteurs du savoir.',
          body_en: 'Textile motifs or regalia visible in photographs must never be arbitrarily renamed without validation by knowledge holders.',
        },
        {
          ref: 'Note 2',
          title_fr: 'Statut administratif',
          title_en: 'Administrative status',
          body_fr: 'Les recherches publiques disponibles ne constituent pas une vérification administrative de succession traditionnelle.',
          body_en: 'Available public records do not constitute administrative verification of traditional succession.',
        },
      ]),
      '/assets/aistudio/images__4__d3c9a0a1.jpg',
      'Photographie fournie pour le portail — lieu et date à préciser.',
      'published'
    );

    insertDossier.run(
      'panafricanisme-memoire-et-reappropriation',
      'Panafricanisme, figures historiques et réappropriation culturelle',
      'Pan-Africanism, Historical Figures, and Cultural Reclamation',
      'Mouvements culturels panafricains contemporains',
      'Afrique & Diaspora',
      'Analyse éditoriale de l’orientation panafricaniste revendiquée dans les communications du fondateur et de son articulation avec la transmission culturelle.',
      'Editorial overview of the Pan-Africanist orientation expressed in the founder’s communications and how it connects with cultural transmission.',
      'La notice d’auteur de Tchamaleu G. B. sur Write Africa mentionne une orientation panafricaniste, kamite et animiste. Sur l’un des portraits soumis pour le portail, apparaissent en arrière-plan des portraits encadrés de figures majeures de l’histoire politique africaine du XXe siècle : Patrice Émery Lumumba (1925–1961) et Marthe Moumié (1931–2009).\n\nLa présence de ces références historiques illustre un ancrage mémoriel reliant souveraineté culturelle, histoire des indépendances et valorisation des héritages africains.',
      'The author profile for Tchamaleu G. B. on Write Africa cites a Pan-Africanist, Kamite, and animist orientation. One of the portraits submitted for the portal shows framed images of major 20th-century African historical figures in the background: Patrice Émery Lumumba (1925–1961) and Marthe Moumié (1931–2009).\n\nThese historical references illustrate a memorial grounding linking cultural sovereignty, independence history, and African heritage.',
      'Dans les interventions audiovisuelles liées à UNITRACA, l’histoire des luttes africaines est fréquemment mise en dialogue avec la reconquête de la dignité culturelle et la transmission de valeurs spirituelles endogènes.',
      'In audiovisual talks linked to UNITRACA, the history of African struggles is frequently brought into dialogue with reclaiming cultural dignity and transmitting endogenous spiritual values.',
      'Il convient de distinguer clairement les faits historiques établis concernant les figures du panafricanisme des lectures spirituelles contemporaines qui leur sont parfois associées.',
      'Established historical facts regarding Pan-Africanist figures should be clearly distinguished from contemporary spiritual interpretations sometimes associated with them.',
      JSON.stringify([
        'Notice d’auteur Write Africa — Tchamaleu G. B.',
        'Iconographie soumise (/assets/aistudio/images__1__26f818f9.jpg)',
      ]),
      JSON.stringify([
        {
          ref: 'Note 1',
          title_fr: 'Diversité des courants',
          title_en: 'Diversity of currents',
          body_fr: 'Les courants panafricaniste, kamite et animiste regroupent des approches variées qui ne font pas l’unanimité historique ou philosophique.',
          body_en: 'Pan-Africanist, Kamite, and animist currents encompass varied approaches with diverse historical and philosophical perspectives.',
        },
      ]),
      '/assets/aistudio/images__1__26f818f9.jpg',
      'Portrait fourni pour le portail — droits à confirmer.',
      'published'
    );

    insertDossier.run(
      'pluralite-des-traditions-africaines',
      'Pluralité des cultures africaines : refuser l’homogénéisation',
      'Plurality of African Cultures: Rejecting Homogenization',
      'Approche transversale et comparative',
      'Continent africain (multi-régional)',
      'Charte de méthode expliquant pourquoi aucune tradition particulière ne saurait parler au nom de toute l’Afrique.',
      'Methodological charter explaining why no single tradition can speak on behalf of the entire African continent.',
      'Le continent africain rassemble plus de deux mille langues vivantes, des systèmes politiques historiques très variés, et des traditions religieuses, philosophiques et initiatiques distinctes selon les régions, les lignages et les époques.\n\nParler de « la tradition africaine » au singulier sans préciser la communauté concernée expose au risque de simplification ou d’invention de symboles hybrides.',
      'The African continent encompasses over two thousand living languages, highly diverse historical political systems, and distinct religious, philosophical, and initiatory traditions across regions, lineages, and eras.\n\nReferring to "African tradition" in the singular without naming the specific community risks oversimplification or inventing hybrid symbols.',
      'Les détenteurs du savoir insistent généralement sur la spécificité de chaque terroir, de chaque langue et de chaque rite d’initiation, qui ne sont pas interchangeables d’une région à l’autre.',
      'Knowledge holders generally emphasize the specificity of each locality, language, and initiatory rite, which are not interchangeable across regions.',
      'Sur ce portail, chaque dossier culturel et chaque ressource indique obligatoirement la communauté, la langue ou le cadre géographique lorsqu’il est documenté, ou précise explicitement que l’information reste à renseigner.',
      'On this portal, every cultural dossier and resource explicitly states the community, language, or geographical context when documented, or notes that the information remains to be confirmed.',
      JSON.stringify(['Charte éditoriale UNITRACA (en cours de validation)']),
      JSON.stringify([]),
      '/assets/aistudio/images__2__80586b9c.jpg',
      'Portrait fourni pour le portail — droits à confirmer.',
      'published'
    );
  }

  const faqCount = (db.prepare('SELECT COUNT(*) as c FROM faq_items').get() as { c: number }).c;
  if (faqCount < 8) {
    db.prepare('DELETE FROM faq_items').run();
    const insertFaq = db.prepare(`
      INSERT INTO faq_items (category, question_fr, question_en, answer_fr, answer_en, sort_order, workflow_status)
      VALUES (?, ?, ?, ?, ?, ?, 'published')
    `);

    insertFaq.run(
      'Organisation',
      'Qu’est-ce qu’UNITRACA et quelle est sa vocation ?',
      'What is UNITRACA and what is its mission?',
      'UNITRACA signifie « Univers Initiatique aux Traditions et à la Culture Africaine ». Dans les communications publiques consultées, l’initiative est présentée comme une école et une maison de transmission consacrée aux traditions, à la culture et à la spiritualité africaines.',
      'UNITRACA stands for "Univers Initiatique aux Traditions et à la Culture Africaine". In publicly available communications, it is presented as a school and house of transmission dedicated to African traditions, culture, and spirituality.',
      1
    );
    insertFaq.run(
      'Fondateur',
      'Qui est le fondateur d’UNITRACA et que signifient ses titres ?',
      'Who is the founder of UNITRACA and what do his titles mean?',
      'Le fondateur est présenté publiquement sous les appellations Fo’o Tchamaleu, Luminaire Ndia et Ndīā Shugaíntō II, ainsi que sous le nom d’auteur Tchamaleu G. B. Une présentation indexée de la chaîne le décrit comme chef traditionnel de Banwa. Ces mentions reflètent sa présentation publique et la tradition revendiquée.',
      'The founder is publicly introduced under the names Fo’o Tchamaleu, Luminaire Ndia, and Ndīā Shugaíntō II, as well as the author name Tchamaleu G. B. An indexed channel profile describes him as traditional chief of Banwa. These titles reflect his public presentation and claimed tradition.',
      2
    );
    insertFaq.run(
      'Enseignements',
      'Peut-on suivre les enseignements à distance depuis la diaspora ou l’étranger ?',
      'Can teachings be followed remotely from abroad or the diaspora?',
      'Oui. Les communications de la chaîne UNITRACA annoncent explicitement des cours théoriques et pratiques assortis d’une modalité de participation en ligne pour les personnes résidant à l’étranger, après validation de leur demande d’inscription.',
      'Yes. UNITRACA channel communications explicitly announce theoretical and practical courses with online participation options for learners living abroad, following review of their enrollment request.',
      3
    );
    insertFaq.run(
      'Inscriptions',
      'Une demande d’inscription en ligne garantit-elle une admission immédiate ?',
      'Does an online registration request guarantee immediate admission?',
      'Non. L’envoi du formulaire enregistre une demande avec le statut « en attente » (pending). Chaque dossier est examiné par les responsables d’UNITRACA avant toute confirmation d’admission ou attribution d’accès.',
      'No. Submitting the form records a request with "pending" status. Every application is reviewed by UNITRACA administrators prior to confirmed admission or access grant.',
      4
    );
    insertFaq.run(
      'Formations',
      'Les cycles proposés délivrent-ils un diplôme reconnu par l’État ?',
      'Do the programs award a state-recognized diploma?',
      'Non. Aucune reconnaissance académique officielle ou accréditation étatique n’est revendiquée. Toute attestation éventuelle de participation remise par UNITRACA demeure clairement distincte d’un titre universitaire ou professionnel.',
      'No. No official academic recognition or state accreditation is claimed. Any participation certificate issued by UNITRACA remains clearly distinct from an academic or professional degree.',
      5
    );
    insertFaq.run(
      'Paiements & Tarifs',
      'Pourquoi aucun tarif ni paiement en ligne n’est exigé sur le site actuellement ?',
      'Why are no fees or online payments collected on the site right now?',
      'Par transparence, le module de paiement reste désactivé tant que les grilles tarifaires, l’entité juridique bénéficiaire et les conditions de remboursement n’ont pas été formellement validées par UNITRACA.',
      'For transparency, online payment remains disabled until fee schedules, the legal beneficiary entity, and refund terms are formally validated by UNITRACA.',
      6
    );
    insertFaq.run(
      'Éthique & Santé',
      'Les enseignements spirituels remplacent-ils une consultation médicale ?',
      'Do spiritual teachings replace medical consultation?',
      'Jamais. Les enseignements et propos évoquant la spiritualité relèvent du cadre de convictions d’UNITRACA. Ils ne constituent ni un diagnostic, ni un traitement, ni une promesse de guérison et ne doivent jamais conduire à arrêter un suivi médical auprès d’un professionnel de santé qualifié.',
      'Never. Teachings and statements concerning spirituality belong to UNITRACA’s belief framework. They do not constitute diagnosis, treatment, or a promise of healing, and must never replace care from a qualified healthcare professional.',
      7
    );
    insertFaq.run(
      'Protection culturelle',
      'Comment sont protégés les contenus culturels et comment demander un retrait ?',
      'How is cultural content protected and how can a removal be requested?',
      'Les ressources sont classées selon trois niveaux : Public, Membres autorisés et Accès restreint validé par un responsable. Tout détenteur du savoir ou personne concernée peut demander la rectification ou le retrait d’un média via la page Contact.',
      'Resources are organized into three tiers: Public, Authorized Members, and Restricted Access approved by an administrator. Any knowledge holder or depicted person may request correction or removal via the Contact page.',
      8
    );
  }

  const testimonialsCount = (db.prepare('SELECT COUNT(*) as c FROM testimonials').get() as { c: number }).c;
  if (testimonialsCount < 6) {
    db.prepare("DELETE FROM testimonials WHERE workflow_status = 'published'").run();
    const insertTestimonial = db.prepare(`
      INSERT INTO testimonials (
        author_name, author_role_fr, author_role_en, location,
        quote_fr, quote_en, context_fr, context_en, is_verified, workflow_status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'published')
    `);

    insertTestimonial.run(
      'Fo’o Tchamaleu (Luminaire Ndia)',
      'Fondateur d’UNITRACA — Extrait des communications publiques',
      'Founder of UNITRACA — Excerpt from public communications',
      'Banwa / Cameroun',
      '« La transmission authentique de nos traditions et de notre culture africaine demande un cadre d’étude rigoureux, à la fois théorique et pratique, capable de relier les générations du continent et de la diaspora. »',
      '"Authentic transmission of our African traditions and culture calls for a rigorous theoretical and practical study framework capable of connecting generations across the continent and the diaspora."',
      'Propos issus de la présentation publique de la démarche UNITRACA (cadre culturel et spirituel de l’organisation).',
      'Statement drawn from the public presentation of UNITRACA’s mission (cultural and spiritual framework of the organization).',
      1
    );

    insertTestimonial.run(
      'Tchamaleu G. B.',
      'Auteur & Conférencier — Notice Write Africa',
      'Author & Speaker — Write Africa Profile',
      'Afrique centrale & Diaspora',
      '« Réconcilier la jeunesse contemporaine avec la profondeur philosophique, linguistique et historique des héritages africains constitue le socle de toute souveraineté culturelle durable. »',
      '"Reconciling contemporary youth with the philosophical, linguistic, and historical depth of African heritage forms the bedrock of lasting cultural sovereignty."',
      'Orientation panafricaniste et culturelle documentée dans les publications publiques de l’auteur.',
      'Pan-Africanist and cultural orientation documented in the author’s public publications.',
      1
    );

    insertTestimonial.run(
      'Comité Éditorial & Patrimonial UNITRACA',
      'Charte de documentation des savoirs oraux',
      'Oral Knowledge Documentation Charter',
      'Ouest-Cameroun & Multi-régional',
      '« Distinguer l’histoire documentée, la tradition orale attribuée aux détenteurs du savoir et le cadre de convictions spirituelles permet d’honorer nos héritages sans jamais les dénaturer. »',
      '"Distinguishing documented history, oral tradition attributed to knowledge holders, and spiritual belief frameworks honors our heritage without distorting it."',
      'Méthodologie appliquée à chaque dossier culturel et ressource de la médiathèque.',
      'Methodology applied to every cultural dossier and media library resource.',
      1
    );

    insertTestimonial.run(
      'Auditeur de la diaspora (Emplacement réservé)',
      'Suivi des cours théoriques et pratiques à distance',
      'Remote Theoretical and Practical Course Participant',
      'Diaspora (Europe / Amérique du Nord)',
      '« Le dispositif de suivi en ligne permet aux personnes résidant à l’étranger d’étudier les textes, les contextes communautaires et les enseignements publiés dans un cadre structuré et respectueux. »',
      '"The online participation format enables learners living abroad to study texts, community contexts, and published teachings within a structured, respectful environment."',
      'Espace réservé aux retours nominatifs autorisés après validation dans /admin.',
      'Slot reserved for named participant feedback authorized via /admin.',
      0
    );

    insertTestimonial.run(
      'Pôle Protection Culturelle & Droits',
      'Gouvernance des archives et consentement communautaire',
      'Archive Governance & Community Consent',
      'Portail Institutionnel UNITRACA',
      '« Aucun attribut rituel, textile traditionnel ou récit lignager n’est diffusé sans mention de sa communauté d’origine et sans possibilité permanente de rectification par les détenteurs légitimes. »',
      '"No ceremonial regalia, traditional textile, or lineage account is shared without naming its community of origin and providing a permanent right of correction by legitimate holders."',
      'Engagement de transparence et de respect du droit à l’image et des savoirs sensibles.',
      'Commitment to transparency, image rights, and sensitive knowledge protection.',
      1
    );

    insertTestimonial.run(
      'Participant aux Rencontres & Conférences (Emplacement réservé)',
      'Dialogues intergénérationnels sur les traditions',
      'Intergenerational Dialogue on Traditions',
      'Cameroun & International',
      '« La clarté du cadre éthique — qui sépare strictement la démarche spirituelle et culturelle de toute promesse médicale — inspire confiance et favorise un dialogue serein entre générations. »',
      '"The clarity of the ethical framework — strictly separating spiritual and cultural practice from any medical promises — builds trust and fosters serene intergenerational dialogue."',
      'Témoignage encadré par la charte éthique — Vous pouvez soumettre votre retour via le bouton ci-dessus.',
      'Testimony governed by the ethical charter — You can submit your own reflection using the button above.',
      0
    );
  }
}
