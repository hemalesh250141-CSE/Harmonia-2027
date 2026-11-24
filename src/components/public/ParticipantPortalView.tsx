import React, { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  FileText,
  Loader2,
  LogIn,
  LogOut,
  Search,
  Sparkles,
  Upload,
  UserCheck,
  Users,
} from 'lucide-react';
import { OFFICIAL_ASSETS, TRACK_MAP } from '../../data/hackathonData';
import {
  auth,
  fetchParticipantProfile,
  fetchUserRegistrationsFromFirestore,
  signInWithGooglePopup,
  signOutFirebase,
  updateRegistrationInFirestore,
} from '../../firebase';
import {
  fetchMyRegistrationsApi,
  lookupTeamByIdAndEmail,
  reuploadPaymentProofApi,
} from '../../services/portalApi';
import type { ParticipantProfile, TeamRegistration } from '../../types/hackathon';
import { compressImageToUnder150KB } from '../../utils/imageCompression';
import { ParticipantProfileModal } from './ParticipantProfileModal';
import { HARMONIA_EASE } from '../motion/MotionPrimitives';

interface ParticipantPortalViewProps {
  onBackToHome: () => void;
  onGoToRegister: () => void;
}

export const ParticipantPortalView: React.FC<ParticipantPortalViewProps> = ({
  onBackToHome,
  onGoToRegister,
}) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<ParticipantProfile | null>(null);
  const [profileModalOpen, setProfileModalOpen] = useState(false);

  const [teams, setTeams] = useState<TeamRegistration[]>([]);
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [lookupId, setLookupId] = useState('');
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [reuploadingId, setReuploadingId] = useState<string | null>(null);

  const loadUserTeams = useCallback(async (user: User | null) => {
    if (!user) return;
    setLoadingTeams(true);
    try {
      const [apiRows, fsRows] = await Promise.all([
        fetchMyRegistrationsApi(user.email, user.uid),
        fetchUserRegistrationsFromFirestore(user.uid).catch(() => []),
      ]);
      const map = new Map<string, TeamRegistration>();
      for (const row of [...apiRows, ...fsRows]) {
        map.set(row.id, row);
      }
      setTeams(Array.from(map.values()));
    } catch {
      // ignore
    } finally {
      setLoadingTeams(false);
    }
  }, []);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const prof = await fetchParticipantProfile(user.uid);
          setProfile(prof);
        } catch {
          // ignore
        }
        await loadUserTeams(user);
      } else {
        setProfile(null);
      }
    });
    return () => unsub();
  }, [loadUserTeams]);

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      await signInWithGooglePopup();
    } catch (err) {
      setAuthError(err instanceof Error ? err.message : 'Google Sign-In failed.');
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    if (!lookupId.trim() || !lookupEmail.trim()) {
      setLookupError('Enter both HAR-2027 Registration ID and Team Lead Email.');
      return;
    }
    setLoadingTeams(true);
    try {
      const reg = await lookupTeamByIdAndEmail(lookupId.trim(), lookupEmail.trim());
      setTeams((prev) => [reg, ...prev.filter((t) => t.id !== reg.id)]);
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : 'No matching team found.');
    } finally {
      setLoadingTeams(false);
    }
  };

  const handleReupload = async (team: TeamRegistration, file: File | undefined) => {
    if (!file) return;
    setReuploadingId(team.id);
    setLookupError('');
    try {
      const compressed = await compressImageToUnder150KB(file);
      const updated = await reuploadPaymentProofApi(
        team.id,
        team.leaderEmail,
        compressed.dataUrl
      );
      if (firebaseUser) {
        await updateRegistrationInFirestore(team.id, {
          paymentScreenshotUrl: compressed.dataUrl,
          paymentUploadedAt: updated.paymentUploadedAt,
          paymentStatus: 'PENDING',
          updatedAt: updated.updatedAt,
        }).catch(() => {});
      }
      setTeams((prev) => prev.map((t) => (t.id === updated.id ? updated : t)));
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : 'Failed to upload screenshot.');
    } finally {
      setReuploadingId(null);
    }
  };

  return (
    <div className="min-h-screen harmonia-midnight-canvas text-slate-100">
      {/* Dedicated Participant Header */}
      <header className="sticky top-0 z-40 bg-[#060A18]/90 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <img
              src={OFFICIAL_ASSETS.ritEmblem}
              alt="RIT Crest"
              className="w-8 h-8 rounded-full bg-white object-cover"
              referrerPolicy="no-referrer"
            />
            <div>
              <p className="font-display font-extrabold text-sm sm:text-base text-white leading-none">
                HARMONIA <span className="text-amber-400">2027</span>
              </p>
              <p className="text-[11px] font-mono text-cyan-300 uppercase tracking-wider">
                Participant Workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={onGoToRegister}
              className="hidden sm:inline-flex px-3.5 py-2 rounded-xl text-xs font-bold cta-gold-btn cursor-pointer"
            >
              Register Team
            </button>
            <button
              type="button"
              onClick={onBackToHome}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-white bg-white/8 hover:bg-white/15 border border-white/15 cursor-pointer"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Public Website
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-4 sm:px-6 py-10 sm:py-14 space-y-8">
        {/* Participant Profile / Sign-In Hero Card */}
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: HARMONIA_EASE }}
          className="obsidian-glass rounded-3xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6"
        >
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-[0.2em] text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Participant Dashboard</span>
            </div>
            <h1 className="font-display text-2xl sm:text-3xl font-extrabold text-white">
              {firebaseUser
                ? `Welcome, ${profile?.fullName || firebaseUser.displayName || 'Innovator'}`
                : 'Track Your Team & Submission'}
            </h1>
            <p className="text-sm text-slate-300 max-w-2xl">
              {firebaseUser
                ? `Signed in with ${firebaseUser.email}. View real-time coordinator review status, payment audit updates, and abstract details.`
                : 'Sign in with Google to load your saved participant profile and teams, or track any team instantly using your HAR-2027 Registration ID.'}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 shrink-0">
            {firebaseUser ? (
              <>
                <button
                  type="button"
                  onClick={() => setProfileModalOpen(true)}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-amber-300 bg-amber-400/12 hover:bg-amber-400/20 border border-amber-400/35 cursor-pointer min-h-[42px]"
                >
                  <UserCheck className="w-4 h-4" />
                  {profile ? 'Edit Profile' : 'Complete Profile'}
                </button>
                <button
                  type="button"
                  onClick={() => void signOutFirebase()}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-400/30 cursor-pointer min-h-[42px]"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleGoogleSignIn}
                disabled={authLoading}
                className="inline-flex items-center gap-2 px-5 py-3 rounded-xl text-xs font-bold cta-gold-btn cursor-pointer min-h-[44px]"
              >
                {authLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <LogIn className="w-4 h-4" />
                )}
                Sign in with Google
              </button>
            )}
          </div>
        </motion.div>

        {authError && (
          <div className="rounded-xl bg-amber-500/15 border border-amber-400/40 px-4 py-3 text-xs text-amber-200">
            {authError}
          </div>
        )}

        {/* Quick Team ID Lookup */}
        <div className="obsidian-card rounded-3xl p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h2 className="font-display text-lg font-bold text-white">
                Direct Team Status Lookup
              </h2>
              <p className="text-xs text-slate-400">
                Works even without Google login using your Registration ID &amp; Lead Email.
              </p>
            </div>
          </div>

          <form onSubmit={handleLookup} className="grid grid-cols-1 sm:grid-cols-12 gap-3">
            <input
              type="text"
              value={lookupId}
              onChange={(e) => setLookupId(e.target.value)}
              placeholder="HAR-2027-K9M4P"
              aria-label="Registration ID"
              className="sm:col-span-4 px-4 py-3 rounded-xl bg-[#060A18] border border-white/15 text-sm font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
            <input
              type="email"
              value={lookupEmail}
              onChange={(e) => setLookupEmail(e.target.value)}
              placeholder="Team Lead Email"
              aria-label="Team Lead Email"
              className="sm:col-span-5 px-4 py-3 rounded-xl bg-[#060A18] border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="submit"
              disabled={loadingTeams}
              className="sm:col-span-3 inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl text-xs font-bold cta-violet-btn cursor-pointer"
            >
              {loadingTeams ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Search className="w-4 h-4" />
              )}
              Fetch Team Status
            </button>
          </form>

          {lookupError && (
            <div className="rounded-xl bg-rose-500/15 border border-rose-400/40 p-3 text-xs text-rose-200">
              {lookupError}
            </div>
          )}
        </div>

        {/* Registered Teams Display */}
        {teams.length === 0 ? (
          <div className="obsidian-card rounded-3xl p-10 text-center space-y-3">
            <Users className="w-8 h-8 text-slate-400 mx-auto" />
            <h3 className="font-display text-lg font-bold text-white">No Teams Loaded Yet</h3>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto">
              Enter your <span className="font-mono text-amber-300">HAR-2027</span> Registration ID
              above or register a new team to track verification status here.
            </p>
          </div>
        ) : (
          <div className="space-y-5">
            {teams.map((team) => (
              <div key={team.id} className="obsidian-card rounded-3xl p-6 sm:p-7 space-y-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5 text-xs font-mono font-bold">
                      <span className="text-amber-300">{team.id}</span>
                      <span className="text-white/25">·</span>
                      <span className="text-cyan-300">{TRACK_MAP[team.trackId]?.title}</span>
                    </div>
                    <h3 className="font-display text-2xl font-extrabold text-white">
                      {team.teamName}
                    </h3>
                    <p className="text-sm font-semibold text-slate-200">{team.projectTitle}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border ${
                        team.paymentStatus === 'VERIFIED'
                          ? 'bg-emerald-500/15 text-emerald-300 border-emerald-400/35'
                          : team.paymentStatus === 'REJECTED'
                            ? 'bg-rose-500/15 text-rose-300 border-rose-400/35'
                            : 'bg-amber-500/15 text-amber-300 border-amber-400/35'
                      }`}
                    >
                      {team.paymentStatus === 'VERIFIED' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : team.paymentStatus === 'REJECTED' ? (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      Payment: {team.paymentStatus}
                    </span>

                    <span className="px-3 py-1.5 rounded-xl text-xs font-bold bg-white/10 border border-white/15 text-white">
                      Review: {team.status}
                    </span>
                  </div>
                </div>

                <div className="rounded-2xl bg-[#060A18]/80 border border-white/10 p-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-slate-400">
                    <FileText className="w-3.5 h-3.5 text-cyan-300" />
                    <span>Technical Abstract</span>
                  </div>
                  <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                    {team.abstract}
                  </p>
                </div>

                {team.paymentRejectionReason && (
                  <div className="rounded-xl bg-rose-500/15 border border-rose-400/40 p-3.5 text-xs text-rose-200">
                    <strong>Coordinator Note:</strong> {team.paymentRejectionReason}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-white/10 text-xs text-slate-300">
                  <div className="flex flex-wrap items-center gap-4">
                    <span>
                      Lead: <strong className="text-white">{team.leaderName}</strong>
                    </span>
                    <span>
                      Institution: <strong className="text-white">{team.institution}</strong>
                    </span>
                    <span>
                      Size: <strong className="font-mono text-white">{team.memberCount}</strong>
                    </span>
                    <span>
                      Fee:{' '}
                      <strong className="font-mono text-amber-300">
                        ₹{team.registrationFee}
                      </strong>
                    </span>
                  </div>

                  {team.paymentStatus !== 'VERIFIED' && (
                    <label className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-violet-500/20 border border-violet-400/35 hover:bg-violet-500/30 text-violet-200 font-bold cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      {reuploadingId === team.id ? 'Uploading...' : 'Re-upload Payment Proof'}
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => void handleReupload(team, e.target.files?.[0])}
                      />
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <ParticipantProfileModal
        open={profileModalOpen}
        firebaseUser={firebaseUser}
        existingProfile={profile}
        onClose={() => setProfileModalOpen(false)}
        onSaved={(prof) => setProfile(prof)}
      />
    </div>
  );
};
