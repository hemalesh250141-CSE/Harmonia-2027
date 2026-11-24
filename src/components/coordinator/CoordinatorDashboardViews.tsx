import React, { useDeferredValue, useMemo, useState } from 'react';
import {
  ArrowRight,
  Clock,
  CreditCard,
  Download,
  Eye,
  FileText,
  IndianRupee,
  LayoutGrid,
  List,
  Search,
  Users,
  X,
} from 'lucide-react';
import { HACKATHON_TRACKS, TRACK_MAP } from '../../data/hackathonData';
import type {
  CoordinatorTab,
  ReviewStatus,
  TeamRegistration,
  TrackId,
} from '../../types/hackathon';
import {
  computeDashboardMetrics,
  filterAndSearchRegistrations,
  VALID_REVIEW_STATUSES,
} from '../../utils/hackathonLogic';

/* -------------------------------------------------------------------------- */
/* 1. Executive Dashboard Sub-View                                            */
/* -------------------------------------------------------------------------- */
interface ExecutiveDashboardViewProps {
  registrations: TeamRegistration[];
  onNavigateTab: (tab: CoordinatorTab) => void;
}

export const ExecutiveDashboardView: React.FC<ExecutiveDashboardViewProps> = ({
  registrations,
  onNavigateTab,
}) => {
  const metrics = useMemo(() => computeDashboardMetrics(registrations), [registrations]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-[#13354B] tracking-tight">
          Executive Dashboard
        </h2>
        <p className="text-sm text-slate-500">
          Real-time registration, participant volume, and fee verification overview.
        </p>
      </div>

      {/* 4 Vibrant KPI Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        <div className="rounded-2xl p-5 bg-gradient-to-br from-[#13354B] to-[#1E5070] text-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-white/90">Total Teams</span>
            <Users className="w-4 h-4 text-white/90" />
          </div>
          <p className="font-mono text-3xl font-extrabold tabular-nums">{metrics.totalTeams}</p>
          <p className="text-xs text-white/90 mt-1">
            {metrics.shortlistedOrFinalistCount} Shortlisted / Finalist
          </p>
        </div>

        <div className="rounded-2xl p-5 bg-gradient-to-br from-[#6B1FE0] to-[#7C3AED] text-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-white/90">Total Innovators</span>
            <Users className="w-4 h-4 text-white/90" />
          </div>
          <p className="font-mono text-3xl font-extrabold tabular-nums">
            {metrics.totalInnovators}
          </p>
          <p className="text-xs text-white/90 mt-1">Across 1–4 member rosters</p>
        </div>

        <div className="rounded-2xl p-5 bg-gradient-to-br from-emerald-600 to-teal-700 text-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-white/90">Verified Collections</span>
            <IndianRupee className="w-4 h-4 text-white/90" />
          </div>
          <p className="font-mono text-3xl font-extrabold tabular-nums">
            ₹{metrics.verifiedCollectionsInr.toLocaleString('en-IN')}
          </p>
          <p className="text-xs text-white/90 mt-1">{metrics.verifiedCount} verified receipts</p>
        </div>

        <div className="rounded-2xl p-5 bg-gradient-to-br from-amber-600 to-orange-700 text-white shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-white/90">Pending Proofs</span>
            <Clock className="w-4 h-4 text-white/90" />
          </div>
          <p className="font-mono text-3xl font-extrabold tabular-nums">
            {metrics.pendingProofsCount}
          </p>
          <p className="text-xs text-white/90 mt-1">
            ₹{metrics.pendingCollectionsInr.toLocaleString('en-IN')} awaiting verification
          </p>
        </div>
      </div>

      {/* Track Breakdown: 5 Mini Cards */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5">
        <h3 className="font-display text-base font-bold text-[#13354B] mb-4">
          Track Breakdown
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
          {HACKATHON_TRACKS.map((track) => (
            <div
              key={track.id}
              className="rounded-xl border border-slate-200 bg-slate-50/70 p-4 flex flex-col justify-between"
            >
              <div>
                <p className="text-xs font-bold text-[#6B1FE0]">{track.code}</p>
                <p className="font-display text-sm font-bold text-[#13354B] mt-0.5">
                  {track.shortTitle}
                </p>
              </div>
              <p className="font-mono text-2xl font-extrabold text-[#13354B] tabular-nums mt-3">
                {metrics.trackCounts[track.id]}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Jump Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <button
          type="button"
          onClick={() => onNavigateTab('payments')}
          className="text-left bg-white hover:border-[#6B1FE0] border border-slate-200 rounded-2xl p-5 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <CreditCard className="w-5 h-5 text-amber-600" />
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#6B1FE0]" />
          </div>
          <p className="font-display font-bold text-[#13354B]">Payment Verification Queue</p>
          <p className="text-xs text-slate-500 mt-1">
            Audit {metrics.pendingProofsCount} pending UPI receipts with zoom preview.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('registrations')}
          className="text-left bg-white hover:border-[#6B1FE0] border border-slate-200 rounded-2xl p-5 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <FileText className="w-5 h-5 text-[#6B1FE0]" />
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#6B1FE0]" />
          </div>
          <p className="font-display font-bold text-[#13354B]">Registrations &amp; Reviews</p>
          <p className="text-xs text-slate-500 mt-1">
            Search, filter, and shortlist teams across all 5 tracks.
          </p>
        </button>

        <button
          type="button"
          onClick={() => onNavigateTab('export')}
          className="text-left bg-white hover:border-[#6B1FE0] border border-slate-200 rounded-2xl p-5 transition-colors cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-2">
            <Download className="w-5 h-5 text-emerald-600" />
            <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-[#6B1FE0]" />
          </div>
          <p className="font-display font-bold text-[#13354B]">CSV Data Export Center</p>
          <p className="text-xs text-slate-500 mt-1">
            Download UTF-8 rosters, verified ledgers, and abstracts.
          </p>
        </button>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 2. Registrations & Submissions Sub-View                                    */
/* -------------------------------------------------------------------------- */
interface RegistrationsViewProps {
  registrations: TeamRegistration[];
  onUpdateStatus: (regId: string, nextStatus: ReviewStatus) => Promise<void>;
}

export const RegistrationsView: React.FC<RegistrationsViewProps> = ({
  registrations,
  onUpdateStatus,
}) => {
  const [viewMode, setViewMode] = useState<'table' | 'card'>('table');
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);
  const [trackFilter, setTrackFilter] = useState<TrackId | 'ALL'>('ALL');
  const [statusFilter, setStatusFilter] = useState<ReviewStatus | 'ALL'>('ALL');
  const [sizeFilter, setSizeFilter] = useState<0 | 1 | 2 | 3 | 4>(0);

  const [pendingStatusChange, setPendingStatusChange] = useState<{
    reg: TeamRegistration;
    nextStatus: ReviewStatus;
  } | null>(null);
  const [updating, setUpdating] = useState(false);
  const [abstractModalReg, setAbstractModalReg] = useState<TeamRegistration | null>(null);

  const filtered = useMemo(
    () =>
      filterAndSearchRegistrations(registrations, {
        search: deferredSearch,
        trackId: trackFilter,
        status: statusFilter,
        memberCount: sizeFilter,
      }),
    [registrations, deferredSearch, trackFilter, statusFilter, sizeFilter]
  );

  const confirmStatusUpdate = async () => {
    if (!pendingStatusChange) return;
    setUpdating(true);
    try {
      await onUpdateStatus(pendingStatusChange.reg.id, pendingStatusChange.nextStatus);
      setPendingStatusChange(null);
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-[#13354B]">
            Registrations &amp; Submissions
          </h2>
          <p className="text-sm text-slate-500">
            Showing <span className="font-mono font-bold text-[#13354B]">{filtered.length}</span>{' '}
            of {registrations.length} registered teams.
          </p>
        </div>

        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start">
          <button
            type="button"
            onClick={() => setViewMode('table')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
              viewMode === 'table'
                ? 'bg-white text-[#13354B] shadow-xs'
                : 'text-slate-600 hover:text-[#13354B]'
            }`}
          >
            <List className="w-3.5 h-3.5" />
            Table
          </button>
          <button
            type="button"
            onClick={() => setViewMode('card')}
            className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold cursor-pointer ${
              viewMode === 'card'
                ? 'bg-white text-[#13354B] shadow-xs'
                : 'text-slate-600 hover:text-[#13354B]'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            Cards
          </button>
        </div>
      </div>

      {/* Multi-Field Search & Filters */}
      <div className="bg-white rounded-2xl border border-slate-200 p-4 grid grid-cols-1 md:grid-cols-12 gap-3">
        <div className="md:col-span-5 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search team, lead, email, mobile, or abstract..."
            aria-label="Search registrations"
            className="w-full pl-10 pr-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[#13354B]"
          />
        </div>

        <select
          aria-label="Filter by Track"
          value={trackFilter}
          onChange={(e) => setTrackFilter(e.target.value as TrackId | 'ALL')}
          className="md:col-span-3 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[#13354B]"
        >
          <option value="ALL">All 5 Tracks</option>
          {HACKATHON_TRACKS.map((t) => (
            <option key={t.id} value={t.id}>
              {t.shortTitle}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by Review Status"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as ReviewStatus | 'ALL')}
          className="md:col-span-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[#13354B]"
        >
          <option value="ALL">All Statuses</option>
          {VALID_REVIEW_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>

        <select
          aria-label="Filter by Team Size"
          value={sizeFilter}
          onChange={(e) => setSizeFilter(Number(e.target.value) as 0 | 1 | 2 | 3 | 4)}
          className="md:col-span-2 px-3 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[#13354B]"
        >
          <option value={0}>All Sizes</option>
          <option value={1}>1 Member</option>
          <option value={2}>2 Members</option>
          <option value={3}>3 Members</option>
          <option value={4}>4 Members</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <p className="font-display font-bold text-[#13354B]">No matching teams found</p>
          <p className="text-xs text-slate-500 mt-1">
            Try clearing your search query or adjusting track/status filters.
          </p>
        </div>
      ) : viewMode === 'table' ? (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                  <th className="py-3 px-4">Team &amp; ID</th>
                  <th className="py-3 px-3">Track</th>
                  <th className="py-3 px-3">Leader Contact</th>
                  <th className="py-3 px-3">College</th>
                  <th className="py-3 px-3 text-right">Size</th>
                  <th className="py-3 px-3 text-right">Fee</th>
                  <th className="py-3 px-3">Payment</th>
                  <th className="py-3 px-3">Review Status</th>
                  <th className="py-3 px-4 text-right">Abstract</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((reg) => (
                  <tr key={reg.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4">
                      <p className="font-bold text-[#13354B]">{reg.teamName}</p>
                      <p className="font-mono text-xs text-[#6B1FE0]">{reg.id}</p>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold border whitespace-nowrap ${
                          TRACK_MAP[reg.trackId]?.badgeClass || 'bg-slate-100'
                        }`}
                      >
                        {TRACK_MAP[reg.trackId]?.shortTitle}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <p className="font-medium text-[#13354B]">{reg.leaderName}</p>
                      <p className="font-mono text-xs text-slate-500">+91 {reg.leaderMobile}</p>
                    </td>
                    <td className="py-3 px-3 max-w-[180px] truncate text-slate-600">
                      {reg.institution}
                    </td>
                    <td className="py-3 px-3 text-right font-mono tabular-nums">
                      {reg.memberCount}
                    </td>
                    <td className="py-3 px-3 text-right font-mono font-bold tabular-nums text-[#13354B]">
                      ₹{reg.registrationFee}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold ${
                          reg.paymentStatus === 'VERIFIED'
                            ? 'bg-emerald-50 text-emerald-700'
                            : reg.paymentStatus === 'REJECTED'
                              ? 'bg-rose-50 text-rose-700'
                              : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {reg.paymentStatus}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <select
                        aria-label={`Review status for ${reg.teamName}`}
                        value={reg.status}
                        onChange={(e) =>
                          setPendingStatusChange({
                            reg,
                            nextStatus: e.target.value as ReviewStatus,
                          })
                        }
                        className="px-2.5 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-[#13354B] cursor-pointer"
                      >
                        {VALID_REVIEW_STATUSES.map((st) => (
                          <option key={st} value={st}>
                            {st}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <button
                        type="button"
                        onClick={() => setAbstractModalReg(reg)}
                        aria-label={`View abstract for ${reg.teamName}`}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-purple-50 text-xs font-semibold text-[#13354B] hover:text-[#6B1FE0] cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map((reg) => (
            <div
              key={reg.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 space-y-3"
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <p className="font-mono text-xs font-bold text-[#6B1FE0]">{reg.id}</p>
                  <h3 className="font-display text-base font-bold text-[#13354B]">
                    {reg.teamName}
                  </h3>
                  <p className="text-xs text-slate-500">{reg.institution}</p>
                </div>
                <span className="font-mono text-sm font-extrabold text-[#13354B] tabular-nums">
                  ₹{reg.registrationFee}
                </span>
              </div>
              <p className="text-xs font-semibold text-[#1E5070]">{reg.projectTitle}</p>
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <span className="text-xs text-slate-600">
                  {reg.leaderName} · {reg.memberCount} Member(s)
                </span>
                <div className="flex items-center gap-2">
                  <select
                    aria-label={`Review status for ${reg.teamName}`}
                    value={reg.status}
                    onChange={(e) =>
                      setPendingStatusChange({
                        reg,
                        nextStatus: e.target.value as ReviewStatus,
                      })
                    }
                    className="px-2.5 py-1 rounded-lg border border-slate-200 text-xs font-semibold"
                  >
                    {VALID_REVIEW_STATUSES.map((st) => (
                      <option key={st} value={st}>
                        {st}
                      </option>
                    ))}
                  </select>
                  <button
                    type="button"
                    onClick={() => setAbstractModalReg(reg)}
                    className="px-2.5 py-1 rounded-lg bg-slate-100 text-xs font-semibold text-[#13354B] cursor-pointer"
                  >
                    Abstract
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Confirmation Modal for Inline Status Update */}
      {pendingStatusChange && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Confirm Status Update"
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl">
            <h3 className="font-display text-lg font-bold text-[#13354B] mb-2">
              Confirm Review Status Change
            </h3>
            <p className="text-sm text-slate-600 mb-5">
              Update <strong>{pendingStatusChange.reg.teamName}</strong> ({pendingStatusChange.reg.id})
              from <span className="font-semibold">{pendingStatusChange.reg.status}</span> to{' '}
              <span className="font-bold text-[#6B1FE0]">{pendingStatusChange.nextStatus}</span>?
            </p>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => setPendingStatusChange(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={updating}
                onClick={() => void confirmStatusUpdate()}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#6B1FE0] text-white cursor-pointer disabled:opacity-60"
              >
                {updating ? 'Syncing...' : 'Confirm & Sync'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Abstract Quick-View Modal */}
      {abstractModalReg && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Abstract for ${abstractModalReg.teamName}`}
          className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 border border-slate-200 shadow-xl relative max-h-[85vh] overflow-y-auto">
            <button
              type="button"
              onClick={() => setAbstractModalReg(null)}
              aria-label="Close abstract modal"
              className="absolute top-4 right-4 w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
            <p className="font-mono text-xs font-bold text-[#6B1FE0]">
              {abstractModalReg.id} · {TRACK_MAP[abstractModalReg.trackId]?.shortTitle}
            </p>
            <h3 className="font-display text-xl font-bold text-[#13354B] mt-1 mb-3">
              {abstractModalReg.projectTitle}
            </h3>
            <div className="space-y-4 text-sm text-slate-700">
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">Technical Abstract</p>
                <p className="leading-relaxed">{abstractModalReg.abstract}</p>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 mb-1">Inclusion Impact</p>
                <p className="leading-relaxed">{abstractModalReg.inclusionImpact}</p>
              </div>
              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500">
                Lead: {abstractModalReg.leaderName} ({abstractModalReg.leaderEmail} · +91{' '}
                {abstractModalReg.leaderMobile})
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
