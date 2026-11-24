import React, { useEffect, useState } from 'react';
import type { User } from 'firebase/auth';
import { motion } from 'motion/react';
import {
  AlertTriangle,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  Loader2,
  Search,
  Upload,
  X,
} from 'lucide-react';
import { TRACK_MAP } from '../../data/hackathonData';
import { fetchUserRegistrationsFromFirestore, updateRegistrationInFirestore } from '../../firebase';
import {
  fetchMyRegistrationsApi,
  lookupTeamByIdAndEmail,
  reuploadPaymentProofApi,
} from '../../services/portalApi';
import type { TeamRegistration } from '../../types/hackathon';
import { compressImageToUnder150KB } from '../../utils/imageCompression';
import { HARMONIA_EASE } from '../motion/MotionPrimitives';

interface TeamDashboardModalProps {
  open: boolean;
  firebaseUser: User | null;
  recentRegistrations: TeamRegistration[];
  onClose: () => void;
  onOpenParticipantPortal?: () => void;
}

export const TeamDashboardModal: React.FC<TeamDashboardModalProps> = ({
  open,
  firebaseUser,
  recentRegistrations,
  onClose,
  onOpenParticipantPortal,
}) => {
  const [teams, setTeams] = useState<TeamRegistration[]>([]);
  const [loading, setLoading] = useState(false);
  const [lookupId, setLookupId] = useState('');
  const [lookupEmail, setLookupEmail] = useState('');
  const [lookupError, setLookupError] = useState('');
  const [reuploadingId, setReuploadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    let active = true;

    async function loadMine() {
      setLoading(true);
      const merged = new Map<string, TeamRegistration>();
      for (const r of recentRegistrations) {
        merged.set(r.id, r);
      }

      if (firebaseUser) {
        try {
          const [apiRows, fsRows] = await Promise.all([
            fetchMyRegistrationsApi(firebaseUser.email, firebaseUser.uid),
            fetchUserRegistrationsFromFirestore(firebaseUser.uid).catch(() => []),
          ]);
          for (const row of [...apiRows, ...fsRows]) {
            merged.set(row.id, row);
          }
        } catch {
          // ignore
        }
      }

      if (active) {
        setTeams(Array.from(merged.values()));
        setLoading(false);
      }
    }

    void loadMine();
    return () => {
      active = false;
    };
  }, [open, firebaseUser, recentRegistrations]);

  if (!open) return null;

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLookupError('');
    if (!lookupId.trim() || !lookupEmail.trim()) {
      setLookupError('Enter both Registration ID (e.g. HAR-2027-K9M4P) and Team Lead email.');
      return;
    }
    setLoading(true);
    try {
      const reg = await lookupTeamByIdAndEmail(lookupId.trim(), lookupEmail.trim());
      setTeams((prev) => {
        const without = prev.filter((item) => item.id !== reg.id);
        return [reg, ...without];
      });
    } catch (err) {
      setLookupError(err instanceof Error ? err.message : 'Team not found.');
    } finally {
      setLoading(false);
    }
  };

  const handleReuploadProof = async (team: TeamRegistration, file: File | undefined) => {
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
      setLookupError(err instanceof Error ? err.message : 'Unable to re-upload proof.');
    } finally {
      setReuploadingId(null);
    }
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Participant Team Dashboard"
      className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.94, opacity: 0, y: 12 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ duration: 0.24, ease: HARMONIA_EASE }}
        className="obsidian-glass rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative max-h-[90vh] overflow-y-auto"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close Team Dashboard"
          className="absolute top-5 right-5 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="mb-6 flex flex-wrap items-end justify-between gap-3 pr-10">
          <div>
            <p className="text-xs font-mono uppercase tracking-[0.2em] text-amber-400">
              HARMONIA 2027
            </p>
            <h3 className="font-display text-2xl font-extrabold text-white">
              Team Submission &amp; Payment Status
            </h3>
            <p className="text-sm text-slate-300 mt-1">
              Look up your team by Registration ID and Lead Email, or inspect submitted teams.
            </p>
          </div>
          {onOpenParticipantPortal && (
            <button
              type="button"
              onClick={() => {
                onClose();
                onOpenParticipantPortal();
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 cursor-pointer"
            >
              <span>Full Participant Portal</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        <form onSubmit={handleLookup} className="grid grid-cols-1 sm:grid-cols-12 gap-3 mb-6">
          <input
            type="text"
            value={lookupId}
            onChange={(e) => setLookupId(e.target.value)}
            placeholder="HAR-2027-XXXXX"
            aria-label="Registration ID"
            className="sm:col-span-4 px-3.5 py-2.5 rounded-xl bg-[#060A18] border border-white/15 text-sm font-mono text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
          <input
            type="email"
            value={lookupEmail}
            onChange={(e) => setLookupEmail(e.target.value)}
            placeholder="Team Lead Email"
            aria-label="Team Lead Email"
            className="sm:col-span-5 px-3.5 py-2.5 rounded-xl bg-[#060A18] border border-white/15 text-sm text-white placeholder:text-slate-500 focus:outline-none focus:border-amber-400"
          />
          <button
            type="submit"
            disabled={loading}
            className="sm:col-span-3 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold cta-gold-btn cursor-pointer min-h-[42px]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
            Track Team
          </button>
        </form>

        {lookupError && (
          <div className="rounded-xl bg-rose-500/15 border border-rose-400/40 p-3 text-xs text-rose-200 mb-4">
            {lookupError}
          </div>
        )}

        {teams.length === 0 ? (
          <div className="rounded-2xl bg-[#070B18] border border-white/10 p-8 text-center">
            <p className="text-sm font-bold text-white mb-1">No team loaded yet</p>
            <p className="text-xs text-slate-400">
              Enter your HAR-2027 Registration ID and Team Lead Email above (for example,{' '}
              <span className="font-mono text-amber-300">HAR-2027-K9M4P</span> /{' '}
              <span className="font-mono text-cyan-300">ananya.s@ritchennai.edu.in</span>).
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {teams.map((team) => (
              <div
                key={team.id}
                className="rounded-2xl border border-white/12 bg-[#070B18]/85 p-5 space-y-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-300">
                      <span>{team.id}</span>
                      <span aria-hidden="true">·</span>
                      <span className="text-cyan-300">{TRACK_MAP[team.trackId]?.shortTitle}</span>
                    </div>
                    <h4 className="font-display text-lg font-bold text-white mt-0.5">
                      {team.teamName}
                    </h4>
                    <p className="text-xs text-slate-300">{team.projectTitle}</p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold border ${
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
                    <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-white/8 border border-white/15 text-slate-200">
                      Review: {team.status}
                    </span>
                  </div>
                </div>

                {team.paymentRejectionReason && (
                  <div className="rounded-xl bg-rose-500/15 border border-rose-400/40 p-3 text-xs text-rose-200">
                    <strong>Coordinator Note:</strong> {team.paymentRejectionReason}
                  </div>
                )}

                <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-slate-300 pt-2 border-t border-white/10">
                  <span>
                    Lead: <strong className="text-white">{team.leaderName}</strong> · Size:{' '}
                    <strong className="font-mono text-white">{team.memberCount}</strong> · Fee:{' '}
                    <strong className="font-mono text-amber-300">₹{team.registrationFee}</strong>
                  </span>
                  {team.paymentStatus !== 'VERIFIED' && (
                    <label className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-500/20 border border-violet-400/35 hover:bg-violet-500/30 text-violet-200 font-bold cursor-pointer">
                      <Upload className="w-3.5 h-3.5" />
                      {reuploadingId === team.id ? 'Uploading...' : 'Re-upload Payment Proof'}
                      <input
                        type="file"
                        accept="image/*"
                        className="sr-only"
                        onChange={(e) => void handleReuploadProof(team, e.target.files?.[0])}
                      />
                    </label>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </div>
  );
};
