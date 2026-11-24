import React, { useDeferredValue, useMemo, useRef, useState } from 'react';
import {
  Check,
  CheckCircle2,
  Copy,
  Download,
  Eye,
  EyeOff,
  FileSpreadsheet,
  ImagePlus,
  Loader2,
  QrCode,
  RotateCcw,
  Search,
  Trash2,
  Upload,
  X,
  XCircle,
  ZoomIn,
} from 'lucide-react';
import { DEFAULT_POSTER_CONFIG, TRACK_MAP } from '../../data/hackathonData';
import type {
  CsvExportMode,
  PaymentQrConfig,
  PaymentStatus,
  PosterConfig,
  TeamRegistration,
} from '../../types/hackathon';
import { compressImageToUnder150KB, compressPosterImage } from '../../utils/imageCompression';

/* -------------------------------------------------------------------------- */
/* 3. Payment Verification & Audit Sub-View                                   */
/* -------------------------------------------------------------------------- */
interface PaymentsAuditViewProps {
  registrations: TeamRegistration[];
  onAuditPayment: (
    regId: string,
    action: 'VERIFY' | 'REJECT',
    reason?: string
  ) => Promise<void>;
}

const REJECTION_REASONS = [
  'Blurry or unreadable transaction screenshot',
  'Missing 12-digit UTR / UPI Reference ID',
  'Incorrect fee amount transferred for team size',
  'Duplicate payment receipt already used by another team',
];

export const PaymentsAuditView: React.FC<PaymentsAuditViewProps> = ({
  registrations,
  onAuditPayment,
}) => {
  const [filter, setFilter] = useState<'ALL' | PaymentStatus>('ALL');
  const [zoomReg, setZoomReg] = useState<TeamRegistration | null>(null);
  const [rejectModalReg, setRejectModalReg] = useState<TeamRegistration | null>(null);
  const [selectedReason, setSelectedReason] = useState(REJECTION_REASONS[0]);
  const [customReason, setCustomReason] = useState('');
  const [processingId, setProcessingId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    if (filter === 'ALL') return registrations;
    return registrations.filter((r) => r.paymentStatus === filter);
  }, [registrations, filter]);

  const handleVerify = async (regId: string) => {
    setProcessingId(regId);
    try {
      await onAuditPayment(regId, 'VERIFY');
    } finally {
      setProcessingId(null);
    }
  };

  const handleRejectSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rejectModalReg) return;
    setProcessingId(rejectModalReg.id);
    const finalReason = customReason.trim() || selectedReason;
    try {
      await onAuditPayment(rejectModalReg.id, 'REJECT', finalReason);
      setRejectModalReg(null);
      setCustomReason('');
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-[#13354B]">
            Payment Verification &amp; Audit
          </h2>
          <p className="text-sm text-slate-500">
            Inspect UPI screenshots in full resolution and verify or reject fee receipts.
          </p>
        </div>

        <div className="inline-flex items-center gap-1 p-1 bg-slate-100 rounded-xl self-start">
          {(['ALL', 'PENDING', 'VERIFIED', 'REJECTED'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setFilter(tab)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors cursor-pointer ${
                filter === tab
                  ? 'bg-white text-[#13354B] shadow-xs'
                  : 'text-slate-600 hover:text-[#13354B]'
              }`}
            >
              {tab === 'ALL' ? 'All' : tab.charAt(0) + tab.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-200 p-10 text-center">
          <p className="font-display font-bold text-[#13354B]">No receipts in this category</p>
          <p className="text-xs text-slate-500 mt-1">
            Switch filter pills above to inspect other payment states.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
          {filtered.map((reg) => (
            <div
              key={reg.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between gap-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div>
                    <p className="font-mono text-xs font-bold text-[#6B1FE0]">{reg.id}</p>
                    <h3 className="font-display text-base font-bold text-[#13354B]">
                      {reg.teamName}
                    </h3>
                    <p className="text-xs text-slate-500">
                      {reg.leaderName} · +91 {reg.leaderMobile}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-lg font-extrabold text-[#13354B] tabular-nums">
                      ₹{reg.registrationFee}
                    </p>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-[11px] font-bold ${
                        reg.paymentStatus === 'VERIFIED'
                          ? 'bg-emerald-50 text-emerald-700'
                          : reg.paymentStatus === 'REJECTED'
                            ? 'bg-rose-50 text-rose-700'
                            : 'bg-amber-50 text-amber-800'
                      }`}
                    >
                      {reg.paymentStatus}
                    </span>
                  </div>
                </div>

                {/* Clickable Proof Thumbnail */}
                <button
                  type="button"
                  onClick={() => setZoomReg(reg)}
                  aria-label={`Zoom payment proof for ${reg.teamName}`}
                  className="relative w-full h-40 rounded-xl border border-slate-200 bg-slate-50 overflow-hidden group cursor-pointer"
                >
                  <img
                    src={reg.paymentScreenshotUrl}
                    alt={`Payment receipt for ${reg.teamName}`}
                    className="w-full h-full object-contain"
                  />
                  <span className="absolute inset-0 bg-slate-950/0 group-hover:bg-slate-950/30 transition-colors flex items-center justify-center">
                    <span className="opacity-0 group-hover:opacity-100 inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white text-xs font-bold text-[#13354B] shadow">
                      <ZoomIn className="w-3.5 h-3.5" />
                      Zoom Proof
                    </span>
                  </span>
                </button>

                {reg.paymentVerifiedAt && (
                  <p className="text-xs text-emerald-700 mt-2">
                    Verified by {reg.paymentVerifiedBy} ·{' '}
                    {new Date(reg.paymentVerifiedAt).toLocaleDateString()}
                  </p>
                )}
                {reg.paymentRejectionReason && (
                  <p className="text-xs text-rose-700 mt-2 bg-rose-50 rounded-lg p-2">
                    Reason: {reg.paymentRejectionReason}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  disabled={processingId === reg.id || reg.paymentStatus === 'VERIFIED'}
                  onClick={() => void handleVerify(reg.id)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-700 text-white disabled:opacity-45 cursor-pointer min-h-[40px]"
                >
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Verify Payment
                </button>
                <button
                  type="button"
                  disabled={processingId === reg.id}
                  onClick={() => setRejectModalReg(reg)}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 disabled:opacity-45 cursor-pointer min-h-[40px]"
                >
                  <XCircle className="w-3.5 h-3.5" />
                  Reject
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* High-Resolution Zoom Proof Modal */}
      {zoomReg && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={`Payment Proof Zoom for ${zoomReg.teamName}`}
          className="fixed inset-0 z-50 bg-slate-950/75 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setZoomReg(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full p-5 shadow-2xl relative"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-3">
              <div>
                <p className="font-mono text-xs font-bold text-[#6B1FE0]">{zoomReg.id}</p>
                <h3 className="font-display text-lg font-bold text-[#13354B]">
                  {zoomReg.teamName} — ₹{zoomReg.registrationFee}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setZoomReg(null)}
                aria-label="Close zoom modal"
                className="w-9 h-9 rounded-full bg-slate-100 flex items-center justify-center cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <img
              src={zoomReg.paymentScreenshotUrl}
              alt={`High-res proof for ${zoomReg.teamName}`}
              className="w-full max-h-[70vh] object-contain rounded-2xl border border-slate-200 bg-slate-50"
            />
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {rejectModalReg && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Reject Payment Proof"
          className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-xs flex items-center justify-center p-4"
        >
          <form
            onSubmit={handleRejectSubmit}
            className="bg-white rounded-2xl max-w-md w-full p-6 border border-slate-200 shadow-xl space-y-4"
          >
            <h3 className="font-display text-lg font-bold text-[#13354B]">
              Reject Payment — {rejectModalReg.teamName}
            </h3>
            <p className="text-xs text-slate-500">
              Select or enter a clear reason so the team can upload a valid receipt.
            </p>
            <div className="space-y-2">
              {REJECTION_REASONS.map((reason) => (
                <label
                  key={reason}
                  className="flex items-start gap-2.5 p-2.5 rounded-xl border border-slate-200 text-xs text-[#13354B] cursor-pointer hover:bg-slate-50"
                >
                  <input
                    type="radio"
                    name="rejection-reason"
                    checked={selectedReason === reason}
                    onChange={() => setSelectedReason(reason)}
                    className="mt-0.5"
                  />
                  <span>{reason}</span>
                </label>
              ))}
            </div>
            <div>
              <label htmlFor="custom-reject-msg" className="block text-xs font-bold mb-1">
                Custom Message (Optional)
              </label>
              <input
                id="custom-reject-msg"
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="Override with specific note..."
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 text-xs"
              />
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setRejectModalReg(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-100 text-slate-600 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={processingId === rejectModalReg.id}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-rose-600 text-white cursor-pointer"
              >
                Confirm Rejection
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 4. Technical Abstracts & Proposals Sub-View                                */
/* -------------------------------------------------------------------------- */
export const AbstractsView: React.FC<{ registrations: TeamRegistration[] }> = ({
  registrations,
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const handleCopy = async (reg: TeamRegistration) => {
    const text = `[${reg.id}] ${reg.teamName} (${TRACK_MAP[reg.trackId]?.title})\nProject: ${reg.projectTitle}\nAbstract: ${reg.abstract}\nInclusion Impact: ${reg.inclusionImpact}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(reg.id);
      setTimeout(() => setCopiedId((curr) => (curr === reg.id ? null : curr)), 2000);
    } catch {
      // ignore clipboard restrictions
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-[#13354B]">
          Technical Abstracts &amp; Proposals
        </h2>
        <p className="text-sm text-slate-500">
          Review full problem statements, inclusion impact, and copy proposals for jury packets.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {registrations.map((reg) => {
          const isCopied = copiedId === reg.id;
          return (
            <article
              key={reg.id}
              className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between gap-4"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-xs font-semibold border mb-1.5 ${
                        TRACK_MAP[reg.trackId]?.badgeClass || 'bg-slate-100'
                      }`}
                    >
                      {TRACK_MAP[reg.trackId]?.shortTitle}
                    </span>
                    <h3 className="font-display text-lg font-bold text-[#13354B]">
                      {reg.projectTitle}
                    </h3>
                    <p className="text-xs font-mono text-[#6B1FE0]">
                      {reg.teamName} · {reg.id}
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => void handleCopy(reg)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer shrink-0 ${
                      isCopied
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : 'bg-slate-50 hover:bg-purple-50 text-[#13354B] hover:text-[#6B1FE0] border-slate-200'
                    }`}
                  >
                    {isCopied ? (
                      <>
                        <Check className="w-3.5 h-3.5" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        Copy Abstract
                      </>
                    )}
                  </button>
                </div>

                <p className="text-sm text-slate-700 leading-relaxed">{reg.abstract}</p>

                <div className="rounded-xl bg-slate-50 border border-slate-100 p-3 text-xs text-slate-600">
                  <strong className="text-[#13354B]">Inclusion Impact:</strong>{' '}
                  {reg.inclusionImpact}
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 flex flex-wrap justify-between gap-2">
                <span>
                  Lead: <strong className="text-[#13354B]">{reg.leaderName}</strong> (
                  {reg.leaderEmail})
                </span>
                <span className="font-mono">+91 {reg.leaderMobile}</span>
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 5. Participant Directory & Roster Sub-View                                 */
/* -------------------------------------------------------------------------- */
export const ParticipantsRosterView: React.FC<{ registrations: TeamRegistration[] }> = ({
  registrations,
}) => {
  const [search, setSearch] = useState('');
  const deferredSearch = useDeferredValue(search);

  const roster = useMemo(() => {
    const rows: Array<{
      key: string;
      name: string;
      role: string;
      isLead: boolean;
      email: string;
      mobile: string;
      teamName: string;
      regId: string;
      institution: string;
      trackShort: string;
    }> = [];

    for (const reg of registrations) {
      const trackShort = TRACK_MAP[reg.trackId]?.shortTitle || reg.trackId;
      rows.push({
        key: `${reg.id}-lead`,
        name: reg.leaderName,
        role: 'Team Lead',
        isLead: true,
        email: reg.leaderEmail,
        mobile: reg.leaderMobile,
        teamName: reg.teamName,
        regId: reg.id,
        institution: reg.institution,
        trackShort,
      });
      reg.members.slice(0, Math.max(0, reg.memberCount - 1)).forEach((m, idx) => {
        rows.push({
          key: `${reg.id}-m${idx + 2}`,
          name: m.name,
          role: `Member #${idx + 2}`,
          isLead: false,
          email: m.email,
          mobile: m.mobile,
          teamName: reg.teamName,
          regId: reg.id,
          institution: reg.institution,
          trackShort,
        });
      });
    }

    const q = deferredSearch.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) =>
      `${r.name} ${r.email} ${r.mobile} ${r.teamName} ${r.institution} ${r.trackShort}`
        .toLowerCase()
        .includes(q)
    );
  }, [registrations, deferredSearch]);

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-2xl font-extrabold text-[#13354B]">
            Participant Directory &amp; Roster
          </h2>
          <p className="text-sm text-slate-500">
            <span className="font-mono font-bold text-[#13354B]">{roster.length}</span>{' '}
            individual innovators across all registered teams.
          </p>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Filter participants..."
            aria-label="Filter participant roster"
            className="w-full pl-10 pr-3.5 py-2 rounded-xl bg-white border border-slate-200 text-xs sm:text-sm"
          />
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs sm:text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                <th className="py-3 px-4">Participant</th>
                <th className="py-3 px-3">Role</th>
                <th className="py-3 px-3">Email</th>
                <th className="py-3 px-3">Mobile (+91)</th>
                <th className="py-3 px-3">Team</th>
                <th className="py-3 px-3">College</th>
                <th className="py-3 px-4">Track</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {roster.map((row) => (
                <tr
                  key={row.key}
                  className={row.isLead ? 'bg-purple-50/45' : 'hover:bg-slate-50/70'}
                >
                  <td className="py-3 px-4 font-bold text-[#13354B]">{row.name}</td>
                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2 py-0.5 rounded-md text-xs font-bold ${
                        row.isLead
                          ? 'bg-purple-100 text-[#6B1FE0]'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {row.role}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{row.email}</td>
                  <td className="py-3 px-3 font-mono text-[#13354B]">+91 {row.mobile}</td>
                  <td className="py-3 px-3">
                    <span className="font-semibold text-[#13354B]">{row.teamName}</span>
                    <span className="block font-mono text-[11px] text-slate-400">{row.regId}</span>
                  </td>
                  <td className="py-3 px-3 max-w-[180px] truncate text-slate-600">
                    {row.institution}
                  </td>
                  <td className="py-3 px-4 font-semibold text-[#1E5070]">{row.trackShort}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 6. Payment QR Code Settings Sub-View                                       */
/* -------------------------------------------------------------------------- */
interface QrSettingsViewProps {
  qrConfig: PaymentQrConfig;
  onSaveQrConfig: (next: {
    qrImageUrl: string;
    upiId: string;
    payeeName: string;
  }) => Promise<void>;
}

export const QrSettingsView: React.FC<QrSettingsViewProps> = ({
  qrConfig,
  onSaveQrConfig,
}) => {
  const [previewUrl, setPreviewUrl] = useState(qrConfig.qrImageUrl);
  const [upiId, setUpiId] = useState(qrConfig.upiId);
  const [payeeName, setPayeeName] = useState(qrConfig.payeeName);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handleFile = async (file: File | undefined) => {
    if (!file) return;
    setStatusMessage('');
    try {
      const compressed = await compressImageToUnder150KB(file);
      setPreviewUrl(compressed.dataUrl);
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Unable to process QR image.');
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage('');
    try {
      await onSaveQrConfig({
        qrImageUrl: previewUrl,
        upiId: upiId.trim(),
        payeeName: payeeName.trim(),
      });
      setStatusMessage('Active UPI QR configuration published to the public registration portal.');
    } catch (err) {
      setStatusMessage(err instanceof Error ? err.message : 'Failed to save QR settings.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-[#13354B]">
          Payment QR Code Settings
        </h2>
        <p className="text-sm text-slate-500">
          Upload a custom official UPI QR image or use dynamic fee-encoded QR generation.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white rounded-2xl border border-slate-200 p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start"
      >
        <div className="md:col-span-5 rounded-2xl bg-slate-50 border border-slate-200 p-5 flex flex-col items-center text-center">
          <p className="text-xs font-bold text-[#13354B] mb-3 flex items-center gap-1.5">
            <QrCode className="w-4 h-4 text-[#6B1FE0]" />
            Live Public QR Preview
          </p>
          {previewUrl ? (
            <img
              src={previewUrl}
              alt="Custom Official UPI QR Preview"
              className="w-48 h-48 rounded-xl border border-slate-200 bg-white object-contain p-2 mb-3"
            />
          ) : (
            <div className="w-48 h-48 rounded-xl border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center p-4 text-xs text-slate-500 mb-3">
              <QrCode className="w-8 h-8 text-[#6B1FE0] mb-2" />
              <span>Dynamic fee-encoded UPI QR active</span>
            </div>
          )}
          <p className="text-xs font-semibold text-[#13354B]">{payeeName}</p>
          <p className="font-mono text-xs text-[#6B1FE0]">{upiId}</p>
        </div>

        <div className="md:col-span-7 space-y-4">
          <div>
            <label htmlFor="qr-payee-name" className="block text-xs font-bold text-[#13354B] mb-1">
              Payee Display Name
            </label>
            <input
              id="qr-payee-name"
              type="text"
              value={payeeName}
              onChange={(e) => setPayeeName(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label htmlFor="qr-upi-id" className="block text-xs font-bold text-[#13354B] mb-1">
              Official UPI ID
            </label>
            <input
              id="qr-upi-id"
              type="text"
              value={upiId}
              onChange={(e) => setUpiId(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm font-mono"
            />
          </div>

          <div>
            <span className="block text-xs font-bold text-[#13354B] mb-1.5">
              Upload Replacement QR Image (Optional)
            </span>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => void handleFile(e.target.files?.[0])}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-[#13354B] cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                Upload QR Image
              </button>
              {previewUrl && (
                <button
                  type="button"
                  onClick={() => setPreviewUrl('')}
                  className="px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 cursor-pointer"
                >
                  Revert to Dynamic UPI QR
                </button>
              )}
            </div>
          </div>

          {statusMessage && (
            <div className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs text-emerald-800">
              {statusMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-[#6B1FE0] hover:bg-[#5815C7] cursor-pointer disabled:opacity-60"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            Confirm &amp; Publish Active QR
          </button>
        </div>
      </form>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 6B. Official Poster Management Sub-View                                    */
/* -------------------------------------------------------------------------- */
interface PosterSettingsViewProps {
  posterConfig: PosterConfig;
  onSavePosterConfig: (next: Partial<PosterConfig>) => Promise<void>;
  onDeletePosterConfig: () => Promise<void>;
}

export const PosterSettingsView: React.FC<PosterSettingsViewProps> = ({
  posterConfig,
  onSavePosterConfig,
  onDeletePosterConfig,
}) => {
  const [posterImageUrl, setPosterImageUrl] = useState(posterConfig.posterImageUrl);
  const [title, setTitle] = useState(posterConfig.title);
  const [caption, setCaption] = useState(posterConfig.caption);
  const [isHidden, setIsHidden] = useState(posterConfig.isHidden);
  const [compressing, setCompressing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const fileRef = useRef<HTMLInputElement | null>(null);

  const handlePosterFile = async (file: File | undefined) => {
    if (!file) return;
    setStatusMessage('');
    setErrorMessage('');
    setCompressing(true);
    try {
      const result = await compressPosterImage(file);
      setPosterImageUrl(result.dataUrl);
      setIsHidden(false);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Unable to process poster image.');
    } finally {
      setCompressing(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMessage('');
    setErrorMessage('');
    try {
      await onSavePosterConfig({
        posterImageUrl,
        title: title.trim() || DEFAULT_POSTER_CONFIG.title,
        caption: caption.trim() || DEFAULT_POSTER_CONFIG.caption,
        isHidden,
      });
      setStatusMessage('Official poster updated successfully.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to save poster configuration.');
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    setSaving(true);
    setStatusMessage('');
    setErrorMessage('');
    try {
      await onDeletePosterConfig();
      setPosterImageUrl('');
      setIsHidden(true);
      setStatusMessage('Official poster updated successfully.');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Failed to remove official poster.');
    } finally {
      setSaving(false);
    }
  };

  const handleRestoreDefault = () => {
    setStatusMessage('');
    setErrorMessage('');
    setPosterImageUrl(DEFAULT_POSTER_CONFIG.posterImageUrl);
    setTitle(DEFAULT_POSTER_CONFIG.title);
    setCaption(DEFAULT_POSTER_CONFIG.caption);
    setIsHidden(false);
  };

  return (
    <div className="space-y-5 max-w-4xl">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-[#13354B]">
          Official Poster Management
        </h2>
        <p className="text-sm text-slate-500">
          Upload, replace, preview, or remove the official HARMONIA 2027 event poster displayed on
          the public homepage.
        </p>
      </div>

      <form
        onSubmit={handleSave}
        className="bg-white rounded-2xl border border-slate-200 p-5 sm:p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-start"
      >
        {/* Left: Live Public Poster Preview */}
        <div className="md:col-span-5 rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-col items-center text-center">
          <div className="w-full flex items-center justify-between text-xs font-bold text-[#13354B] mb-3">
            <span className="flex items-center gap-1.5">
              <ImagePlus className="w-4 h-4 text-[#6B1FE0]" />
              Homepage Preview
            </span>
            <span
              className={`px-2 py-0.5 rounded-md text-[11px] font-bold ${
                isHidden || !posterImageUrl
                  ? 'bg-slate-200 text-slate-600'
                  : 'bg-emerald-50 text-emerald-700'
              }`}
            >
              {isHidden || !posterImageUrl ? 'Hidden' : 'Visible Live'}
            </span>
          </div>

          {!isHidden && posterImageUrl ? (
            <img
              src={posterImageUrl}
              alt="Official HARMONIA 2027 Poster Preview"
              className="w-full max-h-80 rounded-xl border border-slate-200 bg-white object-contain p-1.5 mb-3"
            />
          ) : (
            <div className="w-full h-56 rounded-xl border border-dashed border-slate-300 bg-white flex flex-col items-center justify-center p-4 text-xs text-slate-500 mb-3">
              <EyeOff className="w-8 h-8 text-slate-400 mb-2" />
              <span className="font-semibold text-[#13354B]">Poster Currently Removed</span>
              <span className="text-[11px] text-slate-400 mt-1">
                Upload a new poster or restore default to publish on homepage.
              </span>
            </div>
          )}

          <p className="text-xs font-bold text-[#13354B]">{title}</p>
          <p className="text-[11px] text-slate-500 mt-0.5">{caption}</p>
        </div>

        {/* Right: Controls */}
        <div className="md:col-span-7 space-y-4">
          <div>
            <label htmlFor="poster-title" className="block text-xs font-bold text-[#13354B] mb-1">
              Poster Headline
            </label>
            <input
              id="poster-title"
              type="text"
              maxLength={120}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <label htmlFor="poster-caption" className="block text-xs font-bold text-[#13354B] mb-1">
              Poster Caption
            </label>
            <input
              id="poster-caption"
              type="text"
              maxLength={220}
              value={caption}
              onChange={(e) => setCaption(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 text-sm"
            />
          </div>

          <div>
            <span className="block text-xs font-bold text-[#13354B] mb-1.5">
              Upload / Replace Official Poster (Aspect Ratio Preserved)
            </span>
            <input
              ref={fileRef}
              id="poster-file-input"
              type="file"
              accept="image/*"
              className="sr-only"
              onChange={(e) => void handlePosterFile(e.target.files?.[0])}
            />
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={compressing}
                onClick={() => fileRef.current?.click()}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold bg-slate-100 hover:bg-slate-200 text-[#13354B] cursor-pointer min-h-[42px]"
              >
                {compressing ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {posterImageUrl ? 'Replace Poster' : 'Upload Poster'}
              </button>

              <button
                type="button"
                onClick={handleRestoreDefault}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-[#6B1FE0] cursor-pointer min-h-[42px]"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Restore Default Poster
              </button>

              <button
                type="button"
                onClick={() => setIsHidden((p) => !p)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 cursor-pointer min-h-[42px]"
              >
                {isHidden ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                {isHidden ? 'Show Poster' : 'Hide Temporarily'}
              </button>

              {!isHidden && posterImageUrl && (
                <button
                  type="button"
                  disabled={saving}
                  onClick={() => void handleRemove()}
                  className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 cursor-pointer min-h-[42px]"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Remove Poster
                </button>
              )}
            </div>
          </div>

          {errorMessage && (
            <div
              role="alert"
              className="rounded-xl bg-rose-50 border border-rose-200 p-3 text-xs text-rose-700"
            >
              {errorMessage}
            </div>
          )}

          {statusMessage && (
            <div
              role="status"
              className="rounded-xl bg-emerald-50 border border-emerald-200 p-3 text-xs font-semibold text-emerald-800"
            >
              {statusMessage}
            </div>
          )}

          <button
            type="submit"
            disabled={saving || compressing}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold text-white bg-[#6B1FE0] hover:bg-[#5815C7] cursor-pointer disabled:opacity-60 min-h-[44px]"
          >
            {saving ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <CheckCircle2 className="w-4 h-4" />
            )}
            Save Official Poster
          </button>
        </div>
      </form>
    </div>
  );
};

/* -------------------------------------------------------------------------- */
/* 7. CSV Data Export Center Sub-View                                         */
/* -------------------------------------------------------------------------- */
interface CsvExportViewProps {
  registrations: TeamRegistration[];
  onExportCsv: (mode: CsvExportMode) => Promise<void>;
}

export const CsvExportView: React.FC<CsvExportViewProps> = ({
  registrations,
  onExportCsv,
}) => {
  const [exportingMode, setExportingMode] = useState<CsvExportMode | null>(null);

  const verifiedCount = registrations.filter((r) => r.paymentStatus === 'VERIFIED').length;
  const pendingCount = registrations.filter((r) => r.paymentStatus === 'PENDING').length;
  const totalParticipants = registrations.reduce((acc, r) => acc + r.memberCount, 0);

  const cards: Array<{
    mode: CsvExportMode;
    title: string;
    desc: string;
    countLabel: string;
  }> = [
    {
      mode: 'all',
      title: 'All Teams & Proposals CSV',
      desc: 'Complete team metadata, tracks, project titles, technical abstracts, and review statuses.',
      countLabel: `${registrations.length} Teams`,
    },
    {
      mode: 'verified_payments',
      title: 'Verified Payments CSV',
      desc: 'Financial audit ledger of teams with verified UPI receipts, amounts (₹), and timestamps.',
      countLabel: `${verifiedCount} Verified`,
    },
    {
      mode: 'pending_payments',
      title: 'Pending Payments CSV',
      desc: 'Follow-up export of teams awaiting payment verification along with lead phone numbers.',
      countLabel: `${pendingCount} Pending`,
    },
    {
      mode: 'participants_roster',
      title: 'Complete Participants Roster CSV',
      desc: 'Flattened directory with every Team Lead and Member #2–#4 email & +91 mobile number.',
      countLabel: `${totalParticipants} Innovators`,
    },
  ];

  const handleDownload = async (mode: CsvExportMode) => {
    setExportingMode(mode);
    try {
      await onExportCsv(mode);
    } finally {
      setExportingMode(null);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h2 className="font-display text-2xl font-extrabold text-[#13354B]">
          CSV Data Export Center
        </h2>
        <p className="text-sm text-slate-500">
          Generate UTF-8 BOM Excel-compatible CSV spreadsheets directly from live portal state.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {cards.map((card) => (
          <div
            key={card.mode}
            className="bg-white rounded-2xl border border-slate-200 p-6 flex flex-col justify-between gap-4"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className="w-10 h-10 rounded-xl bg-purple-50 text-[#6B1FE0] flex items-center justify-center">
                  <FileSpreadsheet className="w-5 h-5" />
                </div>
                <span className="font-mono text-xs font-bold text-[#13354B] bg-slate-100 px-2.5 py-1 rounded-lg tabular-nums">
                  {card.countLabel}
                </span>
              </div>
              <h3 className="font-display text-lg font-bold text-[#13354B] mb-1">
                {card.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed">{card.desc}</p>
            </div>

            <button
              type="button"
              disabled={exportingMode === card.mode}
              onClick={() => void handleDownload(card.mode)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-[#13354B] hover:bg-[#1E5070] transition-colors cursor-pointer disabled:opacity-60 min-h-[42px]"
            >
              {exportingMode === card.mode ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
              Download UTF-8 CSV
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
