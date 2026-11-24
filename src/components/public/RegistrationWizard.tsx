import React, { useEffect, useMemo, useRef, useState } from 'react';
import type { User } from 'firebase/auth';
import QRCode from 'qrcode';
import { AnimatePresence, motion } from 'motion/react';
import {
  AlertCircle,
  CheckCircle2,
  CreditCard,
  FileText,
  ImagePlus,
  Loader2,
  LogIn,
  Printer,
  QrCode,
  ShieldCheck,
  Sparkles,
  Upload,
  UserCheck,
  Users,
  X,
} from 'lucide-react';
import { HACKATHON_TRACKS, TRACK_MAP } from '../../data/hackathonData';
import { saveRegistrationToFirestore } from '../../firebase';
import { submitTeamRegistrationApi } from '../../services/portalApi';
import type {
  ParticipantProfile,
  PaymentQrConfig,
  TeamMember,
  TeamRegistration,
  TrackId,
} from '../../types/hackathon';
import {
  buildUpiPaymentUri,
  calculateRegistrationFee,
  generateRegistrationId,
  normalizeIndianMobile,
  validateTeamRegistration,
} from '../../utils/hackathonLogic';
import { compressImageToUnder150KB } from '../../utils/imageCompression';
import { HARMONIA_EASE, RevealSection } from '../motion/MotionPrimitives';

interface RegistrationWizardProps {
  selectedTrackId: TrackId;
  onTrackChange: (trackId: TrackId) => void;
  firebaseUser: User | null;
  participantProfile: ParticipantProfile | null;
  qrConfig: PaymentQrConfig;
  onGoogleSignIn: () => void;
  onOpenProfileModal: () => void;
  onRegistrationComplete: (reg: TeamRegistration) => void;
  onOpenTeamDashboard: () => void;
}

const TEAM_SIZES: Array<{
  size: 1 | 2 | 3 | 4;
  tier: string;
  label: string;
  fee: number;
  note: string;
}> = [
  { size: 1, tier: 'SOLO', label: '1 Member', fee: 150, note: 'Individual builder' },
  { size: 2, tier: 'DUO', label: '2 Members', fee: 300, note: 'Compact pair' },
  { size: 3, tier: 'TRIO', label: '3 Members', fee: 450, note: 'Balanced squad' },
  { size: 4, tier: 'SQUAD', label: '4 Members', fee: 500, note: 'Best value · ₹125/head' },
];

export const RegistrationWizard: React.FC<RegistrationWizardProps> = ({
  selectedTrackId,
  onTrackChange,
  firebaseUser,
  participantProfile,
  qrConfig,
  onGoogleSignIn,
  onOpenProfileModal,
  onRegistrationComplete,
  onOpenTeamDashboard,
}) => {
  const [teamName, setTeamName] = useState('');
  const [leaderName, setLeaderName] = useState('');
  const [leaderEmail, setLeaderEmail] = useState('');
  const [leaderMobile, setLeaderMobile] = useState('');
  const [institution, setInstitution] = useState('');
  const [memberCount, setMemberCount] = useState<1 | 2 | 3 | 4>(2);
  const [members, setMembers] = useState<TeamMember[]>([
    { name: '', email: '', mobile: '' },
    { name: '', email: '', mobile: '' },
    { name: '', email: '', mobile: '' },
  ]);
  const [projectTitle, setProjectTitle] = useState('');
  const [ieeeMemberId, setIeeeMemberId] = useState('');
  const [abstract, setAbstract] = useState('');
  const [inclusionImpact, setInclusionImpact] = useState('');

  const [paymentScreenshotUrl, setPaymentScreenshotUrl] = useState('');
  const [compressionStats, setCompressionStats] = useState<{
    originalKB: number;
    compressedKB: number;
  } | null>(null);
  const [compressing, setCompressing] = useState(false);

  const [dynamicQrDataUrl, setDynamicQrDataUrl] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitError, setSubmitError] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successRegistration, setSuccessRegistration] = useState<TeamRegistration | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (participantProfile) {
      setLeaderName((prev) => prev || participantProfile.fullName);
      setLeaderEmail((prev) => prev || participantProfile.email);
      setLeaderMobile((prev) => prev || participantProfile.mobile);
      setInstitution((prev) => prev || participantProfile.institution);
    } else if (firebaseUser) {
      setLeaderName((prev) => prev || firebaseUser.displayName || '');
      setLeaderEmail((prev) => prev || firebaseUser.email || '');
    }
  }, [firebaseUser, participantProfile]);

  const currentFee = useMemo(() => calculateRegistrationFee(memberCount), [memberCount]);

  useEffect(() => {
    let active = true;
    const upiUri = buildUpiPaymentUri(currentFee, teamName || 'HARMONIA27', 'REG');
    QRCode.toDataURL(upiUri, {
      width: 240,
      margin: 2,
      color: { dark: '#0B1124', light: '#FFFFFF' },
    })
      .then((url) => {
        if (active) setDynamicQrDataUrl(url);
      })
      .catch(() => {
        // Fallback silently
      });
    return () => {
      active = false;
    };
  }, [currentFee, teamName]);

  const activeQrDisplayUrl = qrConfig.qrImageUrl || dynamicQrDataUrl;

  const extraMemberIndices = useMemo(() => {
    return Array.from({ length: memberCount - 1 }, (_, i) => i);
  }, [memberCount]);

  const stepCompletion = useMemo(() => {
    const s1 = teamName.trim().length >= 2;
    const s2 =
      leaderName.trim().length >= 2 &&
      leaderEmail.includes('@') &&
      normalizeIndianMobile(leaderMobile).length === 10 &&
      institution.trim().length >= 2 &&
      extraMemberIndices.every((idx) => {
        const m = members[idx];
        return (
          m.name.trim().length >= 2 &&
          m.email.includes('@') &&
          normalizeIndianMobile(m.mobile).length === 10
        );
      });
    const s3 =
      projectTitle.trim().length >= 6 &&
      abstract.trim().length >= 20 &&
      inclusionImpact.trim().length >= 10;
    const s4 = Boolean(paymentScreenshotUrl);
    return [s1, s2, s3, s4];
  }, [
    teamName,
    leaderName,
    leaderEmail,
    leaderMobile,
    institution,
    extraMemberIndices,
    members,
    projectTitle,
    abstract,
    inclusionImpact,
    paymentScreenshotUrl,
  ]);

  const handleMemberChange = (idx: number, field: keyof TeamMember, value: string) => {
    setMembers((prev) => {
      const next = [...prev];
      next[idx] = { ...next[idx], [field]: value };
      return next;
    });
  };

  const handleScreenshotSelect = async (
    file: File | undefined,
    inputEl?: HTMLInputElement | null
  ) => {
    if (!file) return;
    setSubmitError('');
    setCompressing(true);
    try {
      const compressed = await compressImageToUnder150KB(file);
      setPaymentScreenshotUrl(compressed.dataUrl);
      setCompressionStats({
        originalKB: Math.max(1, Math.round(compressed.originalBytes / 1024)),
        compressedKB: Math.max(1, Math.round(compressed.compressedBytes / 1024)),
      });
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next.paymentScreenshotUrl;
        return next;
      });
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Failed to compress image.');
    } finally {
      setCompressing(false);
      if (inputEl) {
        inputEl.value = '';
      }
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');

    const activeMembers = members.slice(0, memberCount - 1).map((m) => ({
      name: m.name.trim(),
      email: m.email.trim(),
      mobile: normalizeIndianMobile(m.mobile),
    }));

    const payload = {
      teamName: teamName.trim(),
      trackId: selectedTrackId,
      leaderUid: firebaseUser?.uid,
      leaderName: leaderName.trim(),
      leaderEmail: leaderEmail.trim(),
      leaderMobile: normalizeIndianMobile(leaderMobile),
      institution: institution.trim(),
      memberCount,
      members: activeMembers,
      projectTitle: projectTitle.trim(),
      ieeeMemberId: ieeeMemberId.trim(),
      abstract: abstract.trim(),
      inclusionImpact: inclusionImpact.trim(),
      paymentScreenshotUrl,
    };

    const validation = validateTeamRegistration(payload);
    if (!validation.valid) {
      setFieldErrors(validation.errors);
      setSubmitError('Please review the highlighted fields before submitting your team.');
      return;
    }

    setFieldErrors({});
    setSubmitting(true);

    try {
      const proposedId = generateRegistrationId();
      const saved = await submitTeamRegistrationApi({ ...payload, id: proposedId });

      if (firebaseUser) {
        try {
          await saveRegistrationToFirestore({
            ...saved,
            leaderUid: firebaseUser.uid,
          });
        } catch (fsErr) {
          console.warn('Firestore mirror warning:', fsErr);
        }
      }

      setSuccessRegistration(saved);
      onRegistrationComplete(saved);

      setTeamName('');
      setProjectTitle('');
      setAbstract('');
      setInclusionImpact('');
      setIeeeMemberId('');
      setPaymentScreenshotUrl('');
      setCompressionStats(null);
      setMembers([
        { name: '', email: '', mobile: '' },
        { name: '', email: '', mobile: '' },
        { name: '', email: '', mobile: '' },
      ]);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Unable to submit registration.');
    } finally {
      setSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-3.5 sm:px-4 py-3 rounded-xl bg-[#060A18]/90 border border-white/15 text-base sm:text-sm text-white placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-400/40 focus:border-amber-400 transition-colors min-h-[44px]';

  return (
    <section id="register" className="relative py-12 sm:py-16 lg:py-20 border-t border-white/8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
        <RevealSection className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
          <div className="max-w-2xl space-y-3">
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-amber-400">
              Official Registration Desk
            </p>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold text-white tracking-tight text-balance">
              Register Your Team &amp; Proposal
            </h2>
            <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
              Lock in your track, complete your 1–4 member roster, submit your technical abstract,
              and attach compressed UPI payment proof to receive an instant{' '}
              <span className="font-mono font-bold text-amber-300">HAR-2027</span> ID.
            </p>
          </div>

          <div className="obsidian-card rounded-2xl px-4 py-3 flex items-center gap-4 shrink-0">
            <div>
              <p className="text-[11px] font-mono uppercase tracking-wider text-slate-400">
                Active Pass Fee
              </p>
              <p className="font-mono text-2xl font-extrabold text-amber-300 tabular-nums">
                ₹{currentFee}
              </p>
            </div>
            <div className="h-9 w-px bg-white/10" aria-hidden="true" />
            <div className="text-xs text-slate-300">
              <p className="font-bold text-white">{memberCount} Member{memberCount > 1 ? 's' : ''}</p>
              <p className="text-slate-400">{TRACK_MAP[selectedTrackId]?.shortTitle}</p>
            </div>
          </div>
        </RevealSection>

        {/* Pass Tier Preview Strip (Synced with Team Size Selector) */}
        <RevealSection className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          {TEAM_SIZES.map((item) => {
            const active = memberCount === item.size;
            return (
              <button
                key={item.size}
                type="button"
                onClick={() => setMemberCount(item.size)}
                className={`rounded-2xl p-4 text-left border transition-all cursor-pointer ${
                  active
                    ? 'bg-gradient-to-br from-amber-500/20 via-[#0E1630] to-violet-500/20 border-amber-400/70 shadow-[0_14px_34px_-14px_rgba(245,158,11,0.45)]'
                    : 'bg-[#090F22]/80 border-white/10 hover:border-white/25'
                }`}
              >
                <div className="flex items-center justify-between gap-2 mb-1.5">
                  <span
                    className={`font-mono text-[11px] font-bold tracking-widest ${
                      active ? 'text-amber-300' : 'text-slate-400'
                    }`}
                  >
                    {item.tier}
                  </span>
                  <span className="font-mono text-lg font-extrabold text-white tabular-nums">
                    ₹{item.fee}
                  </span>
                </div>
                <p className="font-display text-sm font-bold text-white">{item.label}</p>
                <p className="text-xs text-slate-400 mt-0.5">{item.note}</p>
              </button>
            );
          })}
        </RevealSection>

        {/* Participant Auth & Profile Sync Banner */}
        <div className="obsidian-card rounded-3xl p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-violet-500/15 border border-violet-400/30 text-violet-300 flex items-center justify-center shrink-0">
              {firebaseUser ? <UserCheck className="w-5 h-5" /> : <Sparkles className="w-5 h-5" />}
            </div>
            <div>
              {firebaseUser ? (
                <>
                  <p className="text-sm font-bold text-white">
                    Signed in as {firebaseUser.displayName || firebaseUser.email}
                  </p>
                  <p className="text-xs text-slate-300 mt-0.5">
                    {participantProfile
                      ? `Profile verified (${participantProfile.department} · +91 ${participantProfile.mobile}). Lead fields pre-filled.`
                      : 'Complete your participant profile (+91 mobile, WhatsApp & department) to sync across devices.'}
                  </p>
                </>
              ) : (
                <>
                  <p className="text-sm font-bold text-white">
                    Optional Google Sign-In or Direct Team Registration
                  </p>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Sign in with Google to store your participant profile in Cloud Firestore and
                    auto-fill Team Lead details, or complete the form directly below.
                  </p>
                </>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2.5 shrink-0">
            {firebaseUser ? (
              <button
                type="button"
                onClick={onOpenProfileModal}
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-amber-300 bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 transition-colors cursor-pointer min-h-[42px] whitespace-nowrap"
              >
                {participantProfile ? 'Edit Profile' : 'Complete Profile'}
              </button>
            ) : (
              <button
                type="button"
                onClick={onGoogleSignIn}
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white cta-violet-btn cursor-pointer min-h-[42px] whitespace-nowrap"
              >
                <LogIn className="w-3.5 h-3.5" />
                Google Sign-In
              </button>
            )}
          </div>
        </div>

        {/* Interactive 4-Step Live Progress Indicator */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {[
            { num: '01', label: 'Team & Track', done: stepCompletion[0] },
            { num: '02', label: 'Member Roster', done: stepCompletion[1] },
            { num: '03', label: 'Abstract & Impact', done: stepCompletion[2] },
            { num: '04', label: 'UPI Payment Proof', done: stepCompletion[3] },
          ].map((step) => (
            <div
              key={step.num}
              className={`rounded-xl px-3.5 py-2.5 border flex items-center gap-2.5 transition-colors ${
                step.done
                  ? 'bg-emerald-500/12 border-emerald-400/35 text-emerald-200'
                  : 'bg-[#090F22]/75 border-white/10 text-slate-400'
              }`}
            >
              <span
                className={`w-6 h-6 rounded-lg font-mono text-[11px] font-bold flex items-center justify-center shrink-0 ${
                  step.done ? 'bg-emerald-400 text-slate-950' : 'bg-white/10 text-slate-300'
                }`}
              >
                {step.done ? '✓' : step.num}
              </span>
              <span className="text-xs font-semibold truncate">{step.label}</span>
            </div>
          ))}
        </div>

        {/* Main Multi-Step Obsidian Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="obsidian-glass rounded-2xl sm:rounded-3xl p-4 sm:p-7 lg:p-9 space-y-7 sm:space-y-9"
        >
          {/* Step 1: Team Identity, Track & Dynamic Size */}
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-amber-400 text-slate-950 font-mono text-xs font-extrabold flex items-center justify-center">
                  01
                </span>
                <h3 className="font-display text-base sm:text-lg font-bold text-white leading-snug">
                  Team Identity, Track &amp; Size
                </h3>
              </div>
              <span className="font-mono text-sm font-bold text-amber-300 tabular-nums">
                Fee: ₹{currentFee}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="reg-team-name" className="block text-xs font-bold text-slate-200 mb-1.5">
                  Team Name <span className="text-rose-400">*</span>
                </label>
                <input
                  id="reg-team-name"
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="e.g., BhashaBridge AI"
                  className={inputClass}
                />
                {fieldErrors.teamName && (
                  <p className="text-xs text-rose-400 mt-1">{fieldErrors.teamName}</p>
                )}
              </div>

              <div>
                <label htmlFor="reg-track" className="block text-xs font-bold text-slate-200 mb-1.5">
                  Problem Track <span className="text-rose-400">*</span>
                </label>
                <select
                  id="reg-track"
                  value={selectedTrackId}
                  onChange={(e) => onTrackChange(e.target.value as TrackId)}
                  className={inputClass}
                >
                  {HACKATHON_TRACKS.map((t) => (
                    <option key={t.id} value={t.id} className="bg-[#0B1124] text-white">
                      {t.code}: {t.title}
                    </option>
                  ))}
                </select>
                {fieldErrors.trackId && (
                  <p className="text-xs text-rose-400 mt-1">{fieldErrors.trackId}</p>
                )}
              </div>
            </div>

            {/* Dynamic Team Size Selector */}
            <div>
              <span className="block text-xs font-bold text-slate-200 mb-2">
                Select Team Size (1–4 Members) <span className="text-rose-400">*</span>
              </span>
              <div
                className="grid grid-cols-2 sm:grid-cols-4 gap-3"
                role="group"
                aria-label="Team Size Selector"
              >
                {TEAM_SIZES.map((item) => {
                  const active = memberCount === item.size;
                  return (
                    <button
                      key={item.size}
                      type="button"
                      onClick={() => setMemberCount(item.size)}
                      aria-pressed={active}
                      className={`px-4 py-3 rounded-2xl border text-left transition-all cursor-pointer min-h-[58px] ${
                        active
                          ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white border-violet-400 shadow-[0_10px_28px_-8px_rgba(124,58,237,0.6)]'
                          : 'bg-[#060A18]/85 text-slate-200 border-white/15 hover:border-amber-400/50'
                      }`}
                    >
                      <div className="text-xs font-bold">
                        {item.tier.charAt(0) + item.tier.slice(1).toLowerCase()} ({item.size})
                      </div>
                      <div
                        className={`font-mono text-sm font-extrabold tabular-nums mt-0.5 ${
                          active ? 'text-amber-300' : 'text-cyan-300'
                        }`}
                      >
                        ₹{item.fee}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Step 2: Team Lead & Dynamic Member Roster */}
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-cyan-400 text-slate-950 font-mono text-xs font-extrabold flex items-center justify-center">
                  02
                </span>
                <h3 className="font-display text-base sm:text-lg font-bold text-white leading-snug">
                  Team Lead &amp; Dynamic Member Roster
                </h3>
              </div>
              <span className="text-xs font-semibold text-slate-300 flex items-center gap-1.5 shrink-0">
                <Users className="w-3.5 h-3.5 text-cyan-300" />
                {memberCount} {memberCount === 1 ? 'Solo Innovator' : 'Total Members'}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="reg-lead-name" className="block text-xs font-bold text-slate-200 mb-1.5">
                  Team Lead Full Name <span className="text-rose-400">*</span>
                </label>
                <input
                  id="reg-lead-name"
                  type="text"
                  value={leaderName}
                  onChange={(e) => setLeaderName(e.target.value)}
                  placeholder="Full Name"
                  className={inputClass}
                />
                {fieldErrors.leaderName && (
                  <p className="text-xs text-rose-400 mt-1">{fieldErrors.leaderName}</p>
                )}
              </div>

              <div>
                <label htmlFor="reg-lead-email" className="block text-xs font-bold text-slate-200 mb-1.5">
                  Team Lead Email <span className="text-rose-400">*</span>
                </label>
                <input
                  id="reg-lead-email"
                  type="email"
                  value={leaderEmail}
                  onChange={(e) => setLeaderEmail(e.target.value)}
                  placeholder="leader@college.edu"
                  className={inputClass}
                />
                {fieldErrors.leaderEmail && (
                  <p className="text-xs text-rose-400 mt-1">{fieldErrors.leaderEmail}</p>
                )}
              </div>

              <div>
                <label htmlFor="reg-lead-mobile" className="block text-xs font-bold text-slate-200 mb-1.5">
                  Team Lead Mobile (+91 10 Digits) <span className="text-rose-400">*</span>
                </label>
                <input
                  id="reg-lead-mobile"
                  type="tel"
                  value={leaderMobile}
                  onChange={(e) => setLeaderMobile(e.target.value)}
                  placeholder="9876543210"
                  className={`${inputClass} font-mono`}
                />
                {fieldErrors.leaderMobile && (
                  <p className="text-xs text-rose-400 mt-1">{fieldErrors.leaderMobile}</p>
                )}
              </div>

              <div>
                <label htmlFor="reg-institution" className="block text-xs font-bold text-slate-200 mb-1.5">
                  Institution / College Name <span className="text-rose-400">*</span>
                </label>
                <input
                  id="reg-institution"
                  type="text"
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  placeholder="e.g., Rajalakshmi Institute of Technology, Chennai"
                  className={inputClass}
                />
                {fieldErrors.institution && (
                  <p className="text-xs text-rose-400 mt-1">{fieldErrors.institution}</p>
                )}
              </div>
            </div>

            {extraMemberIndices.length > 0 && (
              <div className="space-y-4 pt-2" data-testid="dynamic-members-container">
                {extraMemberIndices.map((idx) => {
                  const memberNumber = idx + 2;
                  const member = members[idx];
                  return (
                    <div
                      key={memberNumber}
                      className="rounded-2xl bg-[#070B1A]/80 border border-white/12 p-4 sm:p-5"
                    >
                      <p className="text-xs font-mono font-bold uppercase tracking-wider text-amber-300 mb-3">
                        Member #{memberNumber} Details
                      </p>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <label
                            htmlFor={`member-${memberNumber}-name`}
                            className="block text-xs font-semibold text-slate-300 mb-1"
                          >
                            Full Name <span className="text-rose-400">*</span>
                          </label>
                          <input
                            id={`member-${memberNumber}-name`}
                            type="text"
                            value={member.name}
                            onChange={(e) => handleMemberChange(idx, 'name', e.target.value)}
                            placeholder={`Member #${memberNumber} Name`}
                            className={inputClass}
                          />
                          {fieldErrors[`member_${memberNumber}_name`] && (
                            <p className="text-xs text-rose-400 mt-1">
                              {fieldErrors[`member_${memberNumber}_name`]}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor={`member-${memberNumber}-email`}
                            className="block text-xs font-semibold text-slate-300 mb-1"
                          >
                            Email Address <span className="text-rose-400">*</span>
                          </label>
                          <input
                            id={`member-${memberNumber}-email`}
                            type="email"
                            value={member.email}
                            onChange={(e) => handleMemberChange(idx, 'email', e.target.value)}
                            placeholder={`member${memberNumber}@college.edu`}
                            className={inputClass}
                          />
                          {fieldErrors[`member_${memberNumber}_email`] && (
                            <p className="text-xs text-rose-400 mt-1">
                              {fieldErrors[`member_${memberNumber}_email`]}
                            </p>
                          )}
                        </div>
                        <div>
                          <label
                            htmlFor={`member-${memberNumber}-mobile`}
                            className="block text-xs font-semibold text-slate-300 mb-1"
                          >
                            10-Digit Mobile <span className="text-rose-400">*</span>
                          </label>
                          <input
                            id={`member-${memberNumber}-mobile`}
                            type="tel"
                            value={member.mobile}
                            onChange={(e) => handleMemberChange(idx, 'mobile', e.target.value)}
                            placeholder="9876543210"
                            className={`${inputClass} font-mono`}
                          />
                          {fieldErrors[`member_${memberNumber}_mobile`] && (
                            <p className="text-xs text-rose-400 mt-1">
                              {fieldErrors[`member_${memberNumber}_mobile`]}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Step 3: Technical Proposal */}
          <div className="space-y-5">
            <div className="flex items-center gap-2.5 pb-3 border-b border-white/10 min-w-0">
              <span className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-violet-500 text-white font-mono text-xs font-extrabold flex items-center justify-center">
                03
              </span>
              <h3 className="font-display text-base sm:text-lg font-bold text-white leading-snug">
                Technical Proposal &amp; Inclusion Impact
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="md:col-span-2">
                <label
                  htmlFor="reg-project-title"
                  className="block text-xs font-bold text-slate-200 mb-1.5"
                >
                  Proposed Project Title <span className="text-rose-400">*</span>
                </label>
                <input
                  id="reg-project-title"
                  type="text"
                  value={projectTitle}
                  onChange={(e) => setProjectTitle(e.target.value)}
                  placeholder="Min 6 characters — clear descriptive solution title"
                  className={inputClass}
                />
                {fieldErrors.projectTitle && (
                  <p className="text-xs text-rose-400 mt-1">{fieldErrors.projectTitle}</p>
                )}
              </div>

              <div>
                <label htmlFor="reg-ieee-id" className="block text-xs font-bold text-slate-200 mb-1.5">
                  IEEE Member Number (Optional)
                </label>
                <input
                  id="reg-ieee-id"
                  type="text"
                  value={ieeeMemberId}
                  onChange={(e) => setIeeeMemberId(e.target.value)}
                  placeholder="e.g., IEEE-98234112"
                  className={`${inputClass} font-mono`}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="reg-abstract" className="block text-xs font-bold text-slate-200 mb-1.5">
                  Technical Abstract (Min 20 chars) <span className="text-rose-400">*</span>
                </label>
                <textarea
                  id="reg-abstract"
                  rows={4}
                  value={abstract}
                  onChange={(e) => setAbstract(e.target.value)}
                  placeholder="Describe your architecture, AI/IoT stack, and technical approach..."
                  className={inputClass}
                />
                {fieldErrors.abstract && (
                  <p className="text-xs text-rose-400 mt-1">{fieldErrors.abstract}</p>
                )}
              </div>

              <div>
                <label htmlFor="reg-impact" className="block text-xs font-bold text-slate-200 mb-1.5">
                  Inclusion &amp; Community Impact <span className="text-rose-400">*</span>
                </label>
                <textarea
                  id="reg-impact"
                  rows={4}
                  value={inclusionImpact}
                  onChange={(e) => setInclusionImpact(e.target.value)}
                  placeholder="Who benefits from this solution and how does it break barriers?"
                  className={inputClass}
                />
                {fieldErrors.inclusionImpact && (
                  <p className="text-xs text-rose-400 mt-1">{fieldErrors.inclusionImpact}</p>
                )}
              </div>
            </div>
          </div>

          {/* Step 4: Dynamic UPI Payment & Compressed Proof Upload */}
          <div className="space-y-5">
            <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5 min-w-0">
                <span className="shrink-0 w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-emerald-400 text-slate-950 font-mono text-xs font-extrabold flex items-center justify-center">
                  04
                </span>
                <h3 className="font-display text-base sm:text-lg font-bold text-white leading-snug">
                  UPI Fee Payment &amp; Proof Upload
                </h3>
              </div>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                <CreditCard className="w-4 h-4" />
                On-device compression &lt; 150 KB
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Dynamic UPI QR Card */}
              <div className="lg:col-span-5 rounded-2xl bg-[#070B18] border border-amber-400/25 p-5 flex flex-col items-center text-center">
                <div className="flex items-center gap-2 text-xs font-bold text-amber-300 mb-3">
                  <QrCode className="w-4 h-4" />
                  <span>Official HARMONIA 2027 UPI QR</span>
                </div>
                {activeQrDisplayUrl ? (
                  <div className="bg-white rounded-2xl p-2.5 mb-3 shadow-lg">
                    <img
                      src={activeQrDisplayUrl}
                      alt={`UPI QR Code for ₹${currentFee}`}
                      className="w-44 h-44 object-contain"
                      referrerPolicy="no-referrer"
                    />
                  </div>
                ) : (
                  <div className="w-48 h-48 rounded-xl bg-white/10 flex items-center justify-center mb-3">
                    <Loader2 className="w-6 h-6 animate-spin text-amber-300" />
                  </div>
                )}
                <p className="font-mono text-2xl font-extrabold text-white tabular-nums">
                  ₹{currentFee}.00
                </p>
                <p className="text-xs text-slate-300 mt-1">
                  Payee: <span className="font-semibold text-white">{qrConfig.payeeName}</span>
                </p>
                <p className="font-mono text-xs text-cyan-300 mt-0.5 select-all">
                  {qrConfig.upiId}
                </p>
              </div>

              {/* Payment Screenshot Upload Dropzone */}
              <div className="lg:col-span-7 space-y-4">
                <div className="rounded-2xl border-2 border-dashed border-white/20 bg-[#070B18]/75 p-6 text-center hover:border-amber-400/60 transition-colors">
                  <input
                    ref={fileInputRef}
                    id="reg-payment-proof"
                    type="file"
                    accept="image/*"
                    aria-label="Upload UPI Payment Screenshot"
                    className="sr-only"
                    onChange={(e) => void handleScreenshotSelect(e.target.files?.[0], e.currentTarget)}
                  />
                  {paymentScreenshotUrl ? (
                    <div className="space-y-3">
                      <img
                        src={paymentScreenshotUrl}
                        alt="Uploaded payment proof preview"
                        className="max-h-48 mx-auto rounded-xl border border-white/20 object-contain bg-white"
                      />
                      <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
                        <span className="inline-flex items-center gap-1 font-semibold text-emerald-300">
                          <CheckCircle2 className="w-4 h-4" />
                          Compressed &amp; Ready
                        </span>
                        {compressionStats && (
                          <span className="font-mono text-slate-300">
                            {compressionStats.originalKB} KB → {compressionStats.compressedKB} KB
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => fileInputRef.current?.click()}
                          className="text-amber-300 font-bold underline cursor-pointer"
                        >
                          Replace Screenshot
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="w-12 h-12 rounded-2xl bg-amber-400/15 border border-amber-400/30 text-amber-300 flex items-center justify-center mx-auto">
                        {compressing ? (
                          <Loader2 className="w-6 h-6 animate-spin" />
                        ) : (
                          <ImagePlus className="w-6 h-6" />
                        )}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">
                          Upload UPI Transaction Screenshot
                        </p>
                        <p className="text-xs text-slate-400 mt-1">
                          PNG, JPG, or WebP. Compressed automatically under 150 KB on-device.
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={compressing}
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold cta-violet-btn cursor-pointer min-h-[42px]"
                      >
                        <Upload className="w-4 h-4" />
                        {compressing ? 'Compressing...' : 'Choose Screenshot'}
                      </button>
                    </div>
                  )}
                </div>
                {fieldErrors.paymentScreenshotUrl && (
                  <p className="text-xs text-rose-400">{fieldErrors.paymentScreenshotUrl}</p>
                )}

                <div className="rounded-xl bg-[#070B18]/80 border border-white/10 p-3.5 text-xs text-slate-300 flex items-start gap-2.5">
                  <FileText className="w-4 h-4 text-amber-300 shrink-0 mt-0.5" />
                  <span>
                    Make sure the 12-digit UTR / Transaction ID and paid amount (₹{currentFee}) are
                    clearly visible. Faculty Coordinator Ms. B. Harshana verifies proofs as{' '}
                    <strong className="text-amber-300">PENDING</strong> →{' '}
                    <strong className="text-emerald-300">VERIFIED</strong>.
                  </span>
                </div>
              </div>
            </div>
          </div>

          {submitError && (
            <div
              role="alert"
              className="rounded-2xl bg-rose-500/15 border border-rose-400/40 px-4 py-3.5 text-sm text-rose-200 flex items-center gap-2.5"
            >
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-300" />
              <span>{submitError}</span>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-slate-300">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <span>
                Track: <strong className="text-white">{TRACK_MAP[selectedTrackId]?.title}</strong> ·
                Fee: <strong className="font-mono text-amber-300">₹{currentFee}</strong>
              </span>
            </div>
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl text-sm font-bold cta-gold-btn cursor-pointer disabled:opacity-60 min-h-[52px] whitespace-nowrap"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Submitting Team...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Submit Team Registration (₹{currentFee})
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Animated Registration Success Modal */}
      <AnimatePresence>
        {successRegistration && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label="Registration Confirmed"
            className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.92, opacity: 0, y: 16 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.28, ease: HARMONIA_EASE }}
              className="obsidian-glass rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl relative"
            >
              <button
                type="button"
                onClick={() => setSuccessRegistration(null)}
                aria-label="Close registration confirmation"
                className="no-print absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Animated SVG Confirmation Emblem */}
              <div className="relative w-16 h-16 mb-5 flex items-center justify-center">
                <motion.div
                  initial={{ scale: 0.7, opacity: 0.9 }}
                  animate={{ scale: 1.5, opacity: 0 }}
                  transition={{ duration: 1.4, repeat: Infinity, ease: 'easeOut' }}
                  className="absolute inset-0 rounded-full border-2 border-emerald-400"
                />
                <div className="w-14 h-14 rounded-2xl bg-emerald-500/20 border border-emerald-400/50 text-emerald-300 flex items-center justify-center">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
              </div>

              <p className="text-xs font-mono uppercase tracking-[0.2em] text-emerald-300 mb-1">
                HARMONIA 2027 · Registration Confirmed
              </p>
              <h3 className="font-display text-2xl font-extrabold text-white mb-2">
                {successRegistration.teamName}
              </h3>
              <p className="text-sm text-slate-300 mb-5">
                Your team proposal and payment proof are recorded for coordinator verification.
              </p>

              <div className="rounded-2xl bg-[#070B18] border border-white/12 p-4 space-y-2.5 text-sm mb-6">
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">Registration ID</span>
                  <span className="font-mono font-extrabold text-amber-300 select-all">
                    {successRegistration.id}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">Track</span>
                  <span className="font-semibold text-white text-right">
                    {TRACK_MAP[successRegistration.trackId]?.shortTitle}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">Team Size &amp; Fee</span>
                  <span className="font-mono font-bold text-cyan-300">
                    {successRegistration.memberCount} Member(s) · ₹
                    {successRegistration.registrationFee}
                  </span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">Team Lead</span>
                  <span className="font-medium text-white">{successRegistration.leaderName}</span>
                </div>
                <div className="flex justify-between gap-2">
                  <span className="text-slate-400">Payment Audit</span>
                  <span className="font-semibold text-amber-300">
                    {successRegistration.paymentStatus}
                  </span>
                </div>
              </div>

              <div className="no-print flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold text-white bg-white/10 hover:bg-white/15 border border-white/15 transition-colors cursor-pointer min-h-[44px]"
                >
                  <Printer className="w-4 h-4" />
                  Print Summary
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSuccessRegistration(null);
                    onOpenTeamDashboard();
                  }}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold cta-gold-btn cursor-pointer min-h-[44px]"
                >
                  Open Team Dashboard
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
