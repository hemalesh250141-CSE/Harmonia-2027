import type {
  CsvExportMode,
  EventCountdownState,
  ParticipantProfile,
  PaymentStatus,
  PosterConfig,
  RegistrationFormInput,
  ReviewStatus,
  TeamRegistration,
  TrackId,
  ValidationResult,
} from '../types/hackathon';

export const VALID_TRACK_IDS: TrackId[] = [
  'linguaverse',
  'abilityx',
  'roots',
  'flowforge',
  'iotverse',
];

export const VALID_REVIEW_STATUSES: ReviewStatus[] = [
  'Submitted',
  'Under Review',
  'Shortlisted',
  'Finalist',
  'Rejected',
];

export const VALID_PAYMENT_STATUSES: PaymentStatus[] = ['PENDING', 'VERIFIED', 'REJECTED'];

export const FEE_SCHEDULE: Record<1 | 2 | 3 | 4, number> = {
  1: 150,
  2: 300,
  3: 450,
  4: 500,
};

export const INDIAN_MOBILE_REGEX = /^[6-9]\d{9}$/;
export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const REG_ID_REGEX = /^HAR-2027-[A-Z0-9]{5}$/;

export function calculateRegistrationFee(memberCount: number): number {
  if (memberCount === 1 || memberCount === 2 || memberCount === 3 || memberCount === 4) {
    return FEE_SCHEDULE[memberCount];
  }
  throw new Error(`Invalid team size: ${memberCount}. Allowed team size is 1 to 4 members.`);
}

export function normalizeIndianMobile(raw: string): string {
  const digits = raw.replace(/\D/g, '');
  if (digits.length === 12 && digits.startsWith('91')) {
    return digits.slice(2);
  }
  if (digits.length === 11 && digits.startsWith('0')) {
    return digits.slice(1);
  }
  return digits;
}

export function generateRegistrationId(randomBytes?: Uint8Array): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 5; i += 1) {
    const idx = randomBytes
      ? randomBytes[i % randomBytes.length] % alphabet.length
      : Math.floor(Math.random() * alphabet.length);
    suffix += alphabet[idx];
  }
  return `HAR-2027-${suffix}`;
}

export function validateParticipantProfile(
  profile: Omit<ParticipantProfile, 'uid' | 'updatedAt'>
): ValidationResult {
  const errors: Record<string, string> = {};
  if (!profile.fullName || profile.fullName.trim().length < 2) {
    errors.fullName = 'Full name must be at least 2 characters.';
  }
  if (!profile.email || !EMAIL_REGEX.test(profile.email.trim())) {
    errors.email = 'Enter a valid email address.';
  }
  const mobile = normalizeIndianMobile(profile.mobile || '');
  if (!INDIAN_MOBILE_REGEX.test(mobile)) {
    errors.mobile = 'Enter a valid 10-digit Indian mobile number (+91).';
  }
  const whatsapp = normalizeIndianMobile(profile.whatsapp || '');
  if (!INDIAN_MOBILE_REGEX.test(whatsapp)) {
    errors.whatsapp = 'Enter a valid 10-digit WhatsApp number.';
  }
  if (!profile.department || profile.department.trim().length < 2) {
    errors.department = 'Enter your department and year (e.g., CSE - III Year).';
  }
  if (!profile.institution || profile.institution.trim().length < 2) {
    errors.institution = 'Enter your institution or college name.';
  }
  return { valid: Object.keys(errors).length === 0, errors };
}

export function validateTeamRegistration(input: RegistrationFormInput): ValidationResult {
  const errors: Record<string, string> = {};

  if (!input.teamName || input.teamName.trim().length < 3 || input.teamName.trim().length > 80) {
    errors.teamName = 'Team name must be between 3 and 80 characters.';
  }
  if (!VALID_TRACK_IDS.includes(input.trackId)) {
    errors.trackId = 'Please select one of the 5 official hackathon tracks.';
  }
  if (!input.leaderName || input.leaderName.trim().length < 2) {
    errors.leaderName = 'Team lead full name is required.';
  }
  if (!input.leaderEmail || !EMAIL_REGEX.test(input.leaderEmail.trim())) {
    errors.leaderEmail = 'Team lead valid email is required.';
  }
  const leadMobile = normalizeIndianMobile(input.leaderMobile || '');
  if (!INDIAN_MOBILE_REGEX.test(leadMobile)) {
    errors.leaderMobile = 'Team lead 10-digit Indian mobile (+91) is required.';
  }
  if (!input.institution || input.institution.trim().length < 2) {
    errors.institution = 'Institution / college name is required.';
  }

  if (![1, 2, 3, 4].includes(input.memberCount)) {
    errors.memberCount = 'Team size must be 1, 2, 3, or 4 members.';
  } else {
    const expectedExtraMembers = input.memberCount - 1;
    const providedMembers = input.members.slice(0, expectedExtraMembers);
    if (providedMembers.length !== expectedExtraMembers) {
      errors.members = `Please complete details for all ${expectedExtraMembers} additional team member(s).`;
    } else {
      providedMembers.forEach((member, idx) => {
        const num = idx + 2;
        if (!member.name || member.name.trim().length < 2) {
          errors[`member_${num}_name`] = `Member #${num} full name is required.`;
        }
        if (!member.email || !EMAIL_REGEX.test(member.email.trim())) {
          errors[`member_${num}_email`] = `Member #${num} valid email is required.`;
        }
        const mPhone = normalizeIndianMobile(member.mobile || '');
        if (!INDIAN_MOBILE_REGEX.test(mPhone)) {
          errors[`member_${num}_mobile`] = `Member #${num} valid 10-digit mobile is required.`;
        }
      });
    }
  }

  if (
    !input.projectTitle ||
    input.projectTitle.trim().length < 6 ||
    input.projectTitle.trim().length > 140
  ) {
    errors.projectTitle = 'Proposed project title must be between 6 and 140 characters.';
  }

  if (!input.abstract || input.abstract.trim().length < 20 || input.abstract.trim().length > 2500) {
    errors.abstract = 'Technical abstract must be between 20 and 2500 characters.';
  }

  if (!input.inclusionImpact || input.inclusionImpact.trim().length < 15) {
    errors.inclusionImpact = 'Inclusion impact statement must be at least 15 characters.';
  }

  if (!input.paymentScreenshotUrl || input.paymentScreenshotUrl.trim().length < 10) {
    errors.paymentScreenshotUrl = 'Please upload your UPI payment proof screenshot.';
  } else if (input.paymentScreenshotUrl.length > 220_000) {
    errors.paymentScreenshotUrl =
      'Compressed payment screenshot exceeds 150 KB limit. Please choose a smaller image.';
  }

  return {
    valid: Object.keys(errors).length === 0,
    errors,
  };
}

export function buildUpiPaymentUri(fee: number, teamName: string, regRef: string): string {
  const safeTeam = teamName.trim().slice(0, 24) || 'Team';
  const params = new URLSearchParams({
    pa: 'harmonia2027.rit@okicici',
    pn: 'HARMONIA 2027 RIT CSE',
    am: String(fee),
    cu: 'INR',
    tn: `HARMONIA27 ${safeTeam} ${regRef}`.trim(),
  });
  return `upi://pay?${params.toString()}`;
}

export interface RegistrationFilterOptions {
  search?: string;
  trackId?: TrackId | 'ALL';
  status?: ReviewStatus | 'ALL';
  paymentStatus?: PaymentStatus | 'ALL';
  memberCount?: 0 | 1 | 2 | 3 | 4;
}

export function filterAndSearchRegistrations(
  registrations: TeamRegistration[],
  filters: RegistrationFilterOptions
): TeamRegistration[] {
  const query = (filters.search || '').trim().toLowerCase();

  return registrations.filter((reg) => {
    if (filters.trackId && filters.trackId !== 'ALL' && reg.trackId !== filters.trackId) {
      return false;
    }
    if (filters.status && filters.status !== 'ALL' && reg.status !== filters.status) {
      return false;
    }
    if (
      filters.paymentStatus &&
      filters.paymentStatus !== 'ALL' &&
      reg.paymentStatus !== filters.paymentStatus
    ) {
      return false;
    }
    if (filters.memberCount && filters.memberCount > 0 && reg.memberCount !== filters.memberCount) {
      return false;
    }
    if (!query) {
      return true;
    }
    const haystack = [
      reg.id,
      reg.teamName,
      reg.leaderName,
      reg.leaderEmail,
      reg.leaderMobile,
      reg.institution,
      reg.projectTitle,
      reg.abstract,
      reg.inclusionImpact,
      ...reg.members.map((m) => `${m.name} ${m.email} ${m.mobile}`),
    ]
      .join(' ')
      .toLowerCase();
    return haystack.includes(query);
  });
}

export interface DashboardMetrics {
  totalTeams: number;
  totalInnovators: number;
  verifiedCollectionsInr: number;
  pendingCollectionsInr: number;
  pendingProofsCount: number;
  verifiedCount: number;
  rejectedCount: number;
  shortlistedOrFinalistCount: number;
  trackCounts: Record<TrackId, number>;
}

export function computeDashboardMetrics(registrations: TeamRegistration[]): DashboardMetrics {
  const trackCounts: Record<TrackId, number> = {
    linguaverse: 0,
    abilityx: 0,
    roots: 0,
    flowforge: 0,
    iotverse: 0,
  };

  let totalInnovators = 0;
  let verifiedCollectionsInr = 0;
  let pendingCollectionsInr = 0;
  let pendingProofsCount = 0;
  let verifiedCount = 0;
  let rejectedCount = 0;
  let shortlistedOrFinalistCount = 0;

  for (const reg of registrations) {
    totalInnovators += reg.memberCount;
    if (reg.trackId in trackCounts) {
      trackCounts[reg.trackId] += 1;
    }
    if (reg.paymentStatus === 'VERIFIED') {
      verifiedCollectionsInr += reg.registrationFee;
      verifiedCount += 1;
    } else if (reg.paymentStatus === 'PENDING') {
      pendingCollectionsInr += reg.registrationFee;
      pendingProofsCount += 1;
    } else if (reg.paymentStatus === 'REJECTED') {
      rejectedCount += 1;
    }
    if (reg.status === 'Shortlisted' || reg.status === 'Finalist') {
      shortlistedOrFinalistCount += 1;
    }
  }

  return {
    totalTeams: registrations.length,
    totalInnovators,
    verifiedCollectionsInr,
    pendingCollectionsInr,
    pendingProofsCount,
    verifiedCount,
    rejectedCount,
    shortlistedOrFinalistCount,
    trackCounts,
  };
}

function escapeCsvCell(value: string | number | undefined | null): string {
  const str = String(value ?? '');
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export function generateCsvContent(
  registrations: TeamRegistration[],
  mode: CsvExportMode
): string {
  const UTF8_BOM = '\uFEFF';

  if (mode === 'participants_roster') {
    const headers = [
      'Registration ID',
      'Team Name',
      'Role',
      'Participant Name',
      'Email',
      'Mobile (+91)',
      'Institution',
      'Track ID',
      'Payment Status',
      'Review Status',
    ];
    const rows: string[][] = [];
    for (const reg of registrations) {
      rows.push([
        reg.id,
        reg.teamName,
        'Team Lead',
        reg.leaderName,
        reg.leaderEmail,
        reg.leaderMobile,
        reg.institution,
        reg.trackId,
        reg.paymentStatus,
        reg.status,
      ]);
      reg.members.slice(0, Math.max(0, reg.memberCount - 1)).forEach((member, idx) => {
        rows.push([
          reg.id,
          reg.teamName,
          `Member #${idx + 2}`,
          member.name,
          member.email,
          member.mobile,
          reg.institution,
          reg.trackId,
          reg.paymentStatus,
          reg.status,
        ]);
      });
    }
    return (
      UTF8_BOM +
      [headers, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\r\n')
    );
  }

  const filtered =
    mode === 'verified_payments'
      ? registrations.filter((r) => r.paymentStatus === 'VERIFIED')
      : mode === 'pending_payments'
        ? registrations.filter((r) => r.paymentStatus === 'PENDING')
        : registrations;

  const headers = [
    'Registration ID',
    'Team Name',
    'Track ID',
    'Team Size',
    'Fee (INR)',
    'Payment Status',
    'Review Status',
    'Team Lead Name',
    'Team Lead Email',
    'Team Lead Mobile',
    'Institution',
    'Project Title',
    'Abstract',
    'Inclusion Impact',
    'IEEE Member ID',
    'Verified By',
    'Verified At',
    'Created At',
  ];

  const rows = filtered.map((reg) => [
    reg.id,
    reg.teamName,
    reg.trackId,
    reg.memberCount,
    reg.registrationFee,
    reg.paymentStatus,
    reg.status,
    reg.leaderName,
    reg.leaderEmail,
    reg.leaderMobile,
    reg.institution,
    reg.projectTitle,
    reg.abstract,
    reg.inclusionImpact,
    reg.ieeeMemberId || '',
    reg.paymentVerifiedBy || '',
    reg.paymentVerifiedAt || '',
    reg.createdAt,
  ]);

  return (
    UTF8_BOM +
    [headers, ...rows].map((row) => row.map(escapeCsvCell).join(',')).join('\r\n')
  );
}

export function computeEventCountdown(
  nowMs: number,
  startMs: number,
  endMs: number
): EventCountdownState {
  if (!Number.isFinite(nowMs) || !Number.isFinite(startMs) || !Number.isFinite(endMs)) {
    return { status: 'UPCOMING', days: 0, hours: 0, minutes: 0, seconds: 0, totalRemainingMs: 0 };
  }

  if (nowMs >= endMs) {
    return { status: 'COMPLETED', days: 0, hours: 0, minutes: 0, seconds: 0, totalRemainingMs: 0 };
  }

  if (nowMs >= startMs) {
    const remainingToEnd = Math.max(0, endMs - nowMs);
    const totalSecs = Math.floor(remainingToEnd / 1000);
    const hours = Math.floor(totalSecs / 3600);
    const minutes = Math.floor((totalSecs % 3600) / 60);
    const seconds = totalSecs % 60;
    return {
      status: 'LIVE',
      days: 0,
      hours,
      minutes,
      seconds,
      totalRemainingMs: remainingToEnd,
    };
  }

  const diffMs = Math.max(0, startMs - nowMs);
  const totalSeconds = Math.floor(diffMs / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    status: 'UPCOMING',
    days,
    hours,
    minutes,
    seconds,
    totalRemainingMs: diffMs,
  };
}

export function validatePosterConfigInput(
  input: Partial<PosterConfig>
): { valid: boolean; error?: string } {
  const isHidden = Boolean(input.isHidden);
  const url = typeof input.posterImageUrl === 'string' ? input.posterImageUrl.trim() : '';
  if (!isHidden) {
    if (!url) {
      return { valid: false, error: 'Poster image is required when poster visibility is enabled.' };
    }
    const isAllowedScheme =
      url.startsWith('/assets/') ||
      url.startsWith('data:image/') ||
      url.startsWith('https://');
    if (!isAllowedScheme) {
      return { valid: false, error: 'Poster image must be a valid image asset or data URL.' };
    }
    if (url.length > 900_000) {
      return { valid: false, error: 'Compressed poster payload exceeds maximum size limit.' };
    }
  }
  const title = typeof input.title === 'string' ? input.title.trim() : '';
  if (title.length > 120) {
    return { valid: false, error: 'Poster title must be 120 characters or fewer.' };
  }
  const caption = typeof input.caption === 'string' ? input.caption.trim() : '';
  if (caption.length > 220) {
    return { valid: false, error: 'Poster caption must be 220 characters or fewer.' };
  }
  return { valid: true };
}

