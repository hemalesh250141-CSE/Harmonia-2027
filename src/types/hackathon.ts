export type TrackId = 'linguaverse' | 'abilityx' | 'roots' | 'flowforge' | 'iotverse';

export type PaymentStatus = 'PENDING' | 'VERIFIED' | 'REJECTED';

export type ReviewStatus =
  | 'Submitted'
  | 'Under Review'
  | 'Shortlisted'
  | 'Finalist'
  | 'Rejected';

export interface TeamMember {
  name: string;
  email: string;
  mobile: string;
}

export interface ParticipantProfile {
  uid: string;
  fullName: string;
  email: string;
  mobile: string;
  whatsapp: string;
  department: string;
  institution: string;
  updatedAt: string;
}

export interface TeamRegistration {
  id: string;
  teamName: string;
  leaderUid?: string;
  leaderName: string;
  leaderEmail: string;
  leaderMobile: string;
  institution: string;
  trackId: TrackId;
  memberCount: 1 | 2 | 3 | 4;
  members: TeamMember[];
  projectTitle: string;
  abstract: string;
  inclusionImpact: string;
  ieeeMemberId?: string;
  registrationFee: number;
  paymentStatus: PaymentStatus;
  paymentScreenshotUrl: string;
  paymentUploadedAt: string;
  paymentVerifiedAt?: string;
  paymentVerifiedBy?: string;
  paymentRejectionReason?: string;
  status: ReviewStatus;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentQrConfig {
  qrImageUrl: string;
  upiId: string;
  payeeName: string;
  updatedAt: string;
  updatedBy: string;
}

export interface PosterConfig {
  posterImageUrl: string;
  title: string;
  caption: string;
  isHidden: boolean;
  isCustom: boolean;
  updatedAt: string;
  updatedBy: string;
}

export type EventLifecycleStatus = 'UPCOMING' | 'LIVE' | 'COMPLETED';

export interface EventCountdownState {
  status: EventLifecycleStatus;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  totalRemainingMs: number;
}

export interface HackathonTrack {
  id: TrackId;
  code: string;
  title: string;
  shortTitle: string;
  sponsor: string;
  tagline: string;
  description: string;
  deliverables: string[];
  accentHex: string;
  gradientClass: string;
  badgeClass: string;
}

export interface RegistrationFormInput {
  teamName: string;
  trackId: TrackId;
  leaderUid?: string;
  leaderName: string;
  leaderEmail: string;
  leaderMobile: string;
  institution: string;
  memberCount: 1 | 2 | 3 | 4;
  members: TeamMember[];
  projectTitle: string;
  ieeeMemberId?: string;
  abstract: string;
  inclusionImpact: string;
  paymentScreenshotUrl: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export type CoordinatorTab =
  | 'dashboard'
  | 'registrations'
  | 'payments'
  | 'abstracts'
  | 'participants'
  | 'qr-settings'
  | 'poster-settings'
  | 'export';

export type CsvExportMode =
  | 'all'
  | 'verified_payments'
  | 'pending_payments'
  | 'participants_roster';
