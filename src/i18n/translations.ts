import type { LanguageCode } from '../types/unitraca.ts';

export const TRANSLATIONS = {
  fr: {
    brandName: 'UNITRACA',
    brandFull: 'Univers Initiatique aux Traditions et à la Culture Africaine',
    nav: {
      home: 'Accueil',
      organization: 'Organisation',
      founder: 'Fondateur',
      vision: 'Vision & valeurs',
      teachings: 'Enseignements',
      agenda: 'Agenda',
      media: 'Médiathèque',
      heritage: 'Patrimoines',
      contact: 'Contact',
      account: 'Compte',
      memberSpace: 'Espace membre',
      admin: 'Administration',
      ctaDiscover: 'Découvrir les enseignements',
      menuOpen: 'Ouvrir le menu',
      menuClose: 'Fermer le menu',
    },
    common: {
      readMore: 'Lire la suite',
      backToList: 'Retour au catalogue',
      requestEnrollment: 'Demander une inscription',
      exportIcs: 'Exporter (.ics)',
      exportAllIcs: 'Exporter tout l’agenda (.ics)',
      toConfirm: 'À confirmer par UNITRACA',
      provisionalNotice: 'Mentions & validation',
      loading: 'Chargement des données…',
      errorGeneric: 'Une erreur est survenue lors du chargement.',
      retry: 'Réessayer',
      noResults: 'Aucun élément publié ne correspond à votre recherche.',
      publicAccess: 'Public',
      memberAccess: 'Membres autorisés',
      restrictedAccess: 'Accès restreint',
      healthWarningTitle: 'Garde-fou éthique et santé',
      healthWarningText:
        'Les contenus relatifs aux traditions et à la spiritualité relèvent du cadre de convictions d’UNITRACA. Ils ne constituent ni un diagnostic, ni un avis médical, ni une promesse de guérison et ne remplacent jamais une consultation auprès d’un professionnel de santé qualifié.',
    },
    home: {
      btnDiscoverOrg: 'Découvrir UNITRACA',
      btnExploreTeachings: 'Explorer les enseignements',
      secOrgTitle: 'Une maison de transmission et de patrimoine vivant',
      secOrgLead:
        'UNITRACA se présente dans ses communications comme une école consacrée aux traditions, à la culture et à la spiritualité africaines.',
      secVisionTitle: 'Démarche éditoriale et clarté des cadres',
      secAxesTitle: 'Axes de transmission documentés',
      secFounderTitle: 'Le fondateur et ses appellations publiques',
      secTeachingsTitle: 'Enseignements publiés',
      secAgendaTitle: 'Agenda et rencontres',
      secMediaTitle: 'Médiathèque et ressources',
      secDossiersTitle: 'Dossiers culturels et patrimoines',
      secContactTitle: 'Dialoguer avec UNITRACA',
      secContactText:
        'Pour toute demande de renseignement, de validation éditoriale, de rectification ou de retrait de média, utilisez notre espace de contact.',
    },
    footer: {
      summary:
        'Portail institutionnel, culturel, éditorial et pédagogique consacré à la transmission des traditions et des cultures africaines.',
      provisional:
        'Direction artistique et textes d’orientation proposés pour validation officielle par UNITRACA.',
      linksNav: 'Navigation',
      linksLegal: 'Cadre & conformité',
      linksSocial: 'Présence vérifiée à confirmer',
      privacy: 'Confidentialité',
      terms: 'Conditions d’utilisation',
      faq: 'Questions fréquentes',
      enrollment: 'Demande d’inscription',
      socialPending: 'Liens issus des sources transmises — à confirmer avec l’organisation avant publication finale.',
      noOtherContacts: 'Aucun autre canal (téléphone, adresse physique, WhatsApp, Instagram) n’est affiché tant qu’il n’est pas validé.',
    },
  },
  en: {
    brandName: 'UNITRACA',
    brandFull: 'Univers Initiatique aux Traditions et à la Culture Africaine',
    nav: {
      home: 'Home',
      organization: 'Organization',
      founder: 'Founder',
      vision: 'Vision & Values',
      teachings: 'Teachings',
      agenda: 'Agenda',
      media: 'Media Library',
      heritage: 'Heritage',
      contact: 'Contact',
      account: 'Account',
      memberSpace: 'Member Space',
      admin: 'Administration',
      ctaDiscover: 'Discover Teachings',
      menuOpen: 'Open menu',
      menuClose: 'Close menu',
    },
    common: {
      readMore: 'Read more',
      backToList: 'Back to catalog',
      requestEnrollment: 'Request enrollment',
      exportIcs: 'Export (.ics)',
      exportAllIcs: 'Export full calendar (.ics)',
      toConfirm: 'To be confirmed by UNITRACA',
      provisionalNotice: 'Notices & validation',
      loading: 'Loading data…',
      errorGeneric: 'An error occurred while loading.',
      retry: 'Retry',
      noResults: 'No published items match your search.',
      publicAccess: 'Public',
      memberAccess: 'Authorized Members',
      restrictedAccess: 'Restricted Access',
      healthWarningTitle: 'Ethical & Health Safeguard',
      healthWarningText:
        'Content regarding traditions and spirituality reflects UNITRACA’s belief framework. It does not constitute medical diagnosis, advice, or a promise of healing, and never replaces consultation with a qualified healthcare professional.',
    },
    home: {
      btnDiscoverOrg: 'Discover UNITRACA',
      btnExploreTeachings: 'Explore Teachings',
      secOrgTitle: 'A House of Transmission and Living Heritage',
      secOrgLead:
        'UNITRACA presents itself in public communications as a school dedicated to African traditions, culture, and spirituality.',
      secVisionTitle: 'Editorial Approach & Clear Frameworks',
      secAxesTitle: 'Documented Areas of Transmission',
      secFounderTitle: 'The Founder and Public Titles',
      secTeachingsTitle: 'Published Teachings',
      secAgendaTitle: 'Agenda & Gatherings',
      secMediaTitle: 'Media Library & Resources',
      secDossiersTitle: 'Cultural Heritage Dossiers',
      secContactTitle: 'Connect with UNITRACA',
      secContactText:
        'For inquiries, editorial validation, content corrections, or media removal requests, please use our dedicated contact page.',
    },
    footer: {
      summary:
        'Institutional, cultural, editorial, and educational portal dedicated to the transmission of African traditions and cultures.',
      provisional:
        'Visual direction and introductory texts proposed for official validation by UNITRACA.',
      linksNav: 'Navigation',
      linksLegal: 'Governance & Compliance',
      linksSocial: 'Channels pending confirmation',
      privacy: 'Privacy Policy',
      terms: 'Terms of Use',
      faq: 'FAQ',
      enrollment: 'Enrollment Request',
      socialPending: 'Links from provided sources — to be confirmed with the organization before final release.',
      noOtherContacts: 'No other channels (phone, physical address, WhatsApp, Instagram) are displayed until officially validated.',
    },
  },
} as const;

export function getT(lang: LanguageCode) {
  return TRANSLATIONS[lang] || TRANSLATIONS.fr;
}

export function formatLocalizedDate(dateStr: string, lang: LanguageCode): string {
  if (!dateStr) return '';
  const parsed = new Date(dateStr.includes('T') ? dateStr : `${dateStr}T12:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateStr;
  return new Intl.DateTimeFormat(lang === 'en' ? 'en-US' : 'fr-FR', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(parsed);
}
