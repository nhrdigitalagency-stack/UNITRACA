export type LanguageCode = 'fr' | 'en';

export type UserRole = 'member' | 'editor' | 'admin';

export type WorkflowStatus = 'draft' | 'validation' | 'published' | 'archived';

export type EnrollmentStatus = 'to_announce' | 'open' | 'full' | 'finished' | 'cancelled';

export type TeachingFormat =
  | 'Conférence'
  | 'Atelier'
  | 'Cycle de transmission'
  | 'Rencontre'
  | 'Cours en ligne';

export type AccessLevel = 'public' | 'member' | 'restricted';

export type MediaCategory = 'video' | 'article' | 'interview' | 'audio' | 'gallery' | 'document';

export type RegistrationStatus = 'pending' | 'under_review' | 'accepted' | 'declined' | 'cancelled';

export interface UserProfile {
  id: number;
  email: string;
  full_name: string;
  preferred_name: string;
  country: string;
  city: string;
  role: UserRole;
  preferred_language: LanguageCode;
  is_active: boolean;
  created_at: string;
}

export interface SiteThemeTokens {
  earthDark: string;
  ivory: string;
  terracotta: string;
  forest: string;
  brass: string;
  ink: string;
  muted: string;
}

export interface SiteSettings {
  theme: SiteThemeTokens;
  hero: {
    label_fr: string;
    label_en: string;
    title_fr: string;
    title_en: string;
    subtitle_fr: string;
    subtitle_en: string;
    text_fr: string;
    text_en: string;
    editorial_notice_fr: string;
    editorial_notice_en: string;
  };
  social: {
    youtube_url: string;
    facebook_url: string;
    whatsapp_number?: string;
    verified_with_org: boolean;
  };
  payments: {
    enabled: boolean;
    reason_fr: string;
    reason_en: string;
  };
  languages: {
    active: LanguageCode[];
    planned_african_languages: Array<{ code: string; label: string; status: string }>;
  };
}

export interface FounderProfile {
  id: number;
  display_name: string;
  titles: string[];
  author_attribution: string;
  portrait_url: string;
  portrait_credit: string;
  gallery: Array<{ url: string; caption_fr: string; caption_en: string; credit: string }>;
  bio_fr: string;
  bio_en: string;
  public_journey_fr: string;
  public_journey_en: string;
  publications: Array<{ title: string; source: string; note_fr: string; note_en: string }>;
  interventions: Array<{ title_fr: string; title_en: string; context_fr: string; context_en: string; organizer_note: string }>;
  personal_message_fr: string;
  personal_message_en: string;
  oral_tradition_note_fr: string;
  oral_tradition_note_en: string;
  workflow_status: WorkflowStatus;
  updated_at: string;
}

export interface TeachingItem {
  id: number;
  slug: string;
  title_fr: string;
  title_en: string;
  summary_fr: string;
  summary_en: string;
  objectives_fr: string;
  objectives_en: string;
  speaker: string;
  tradition_context: string;
  language_offered: string;
  format: TeachingFormat;
  duration: string;
  target_audience_fr: string;
  target_audience_en: string;
  prerequisites_fr: string;
  prerequisites_en: string;
  schedule_note_fr: string;
  schedule_note_en: string;
  location_or_mode: string;
  price_validated: boolean;
  price_display: string;
  conditions_fr: string;
  conditions_en: string;
  limits_notice_fr: string;
  limits_notice_en: string;
  cover_image: string;
  enrollment_status: EnrollmentStatus;
  workflow_status: WorkflowStatus;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface TestimonialItem {
  id: number;
  author_name: string;
  author_role_fr: string;
  author_role_en: string;
  location: string;
  quote_fr: string;
  quote_en: string;
  context_fr: string;
  context_en: string;
  is_verified: boolean;
  workflow_status: WorkflowStatus;
  created_at: string;
}

export interface EventItem {
  id: number;
  slug: string;
  title_fr: string;
  title_en: string;
  description_fr: string;
  description_en: string;
  organizer_entity: string;
  event_date: string;
  start_time: string;
  end_time: string;
  timezone: string;
  format: string;
  validated_location: string;
  location_verified: boolean;
  speakers: string[];
  program_fr: string;
  program_en: string;
  conditions_fr: string;
  conditions_en: string;
  accessibility_fr: string;
  accessibility_en: string;
  registration_open: boolean;
  workflow_status: WorkflowStatus;
  created_at: string;
  updated_at: string;
}

export interface MediaResourceItem {
  id: number;
  slug: string;
  title_fr: string;
  title_en: string;
  category: MediaCategory;
  theme: string;
  speaker: string;
  language: string;
  community_context: string;
  holder_or_author: string;
  authorization_status: 'pending_validation' | 'authorized' | 'restricted_rights';
  diffusion_conditions: string;
  credit: string;
  published_date: string;
  access_level: AccessLevel;
  thumbnail_url: string;
  embed_url: string;
  summary_fr: string;
  summary_en: string;
  body_fr?: string;
  body_en?: string;
  transcript_fr?: string;
  transcript_en?: string;
  subtitles_available: boolean;
  health_disclaimer_required: boolean;
  workflow_status: WorkflowStatus;
  access_granted: boolean;
  created_at: string;
  updated_at: string;
}

export interface HeritageDossier {
  id: number;
  slug: string;
  title_fr: string;
  title_en: string;
  community_or_tradition: string;
  region: string;
  summary_fr: string;
  summary_en: string;
  documented_context_fr: string;
  documented_context_en: string;
  oral_tradition_fr: string;
  oral_tradition_en: string;
  interpretation_fr: string;
  interpretation_en: string;
  sources: string[];
  margin_notes: Array<{ ref: string; title_fr: string; title_en: string; body_fr: string; body_en: string }>;
  cover_image: string;
  image_credit: string;
  workflow_status: WorkflowStatus;
  created_at: string;
  updated_at: string;
}

export interface FaqItem {
  id: number;
  category: string;
  question_fr: string;
  question_en: string;
  answer_fr: string;
  answer_en: string;
  sort_order: number;
  workflow_status: WorkflowStatus;
  updated_at: string;
}

export interface RegistrationRequestItem {
  id: number;
  user_id: number | null;
  teaching_id: number | null;
  teaching_title?: string;
  last_name: string;
  first_name: string;
  country: string;
  city: string;
  email: string;
  phone: string;
  requested_language: string;
  requested_format: string;
  message: string;
  is_adult: boolean;
  minor_guardian_note: string;
  consent_data: boolean;
  consent_rules: boolean;
  status: RegistrationStatus;
  admin_notes: string;
  created_at: string;
  updated_at: string;
}

export interface AdminMessageItem {
  id: number;
  recipient_user_id: number;
  sender_user_id: number | null;
  sender_name?: string;
  subject: string;
  body: string;
  is_read: boolean;
  created_at: string;
}

export interface ContactRequestItem {
  id: number;
  request_type: 'general' | 'media_correction' | 'media_removal' | 'validation';
  sender_name: string;
  sender_email: string;
  subject: string;
  related_url: string;
  message: string;
  consent_data: boolean;
  status: 'new' | 'in_review' | 'resolved';
  admin_response: string;
  created_at: string;
}

export interface AuditLogItem {
  id: number;
  actor_user_id: number | null;
  actor_email: string;
  action: string;
  entity_type: string;
  entity_id: string;
  details_json: string;
  created_at: string;
}
