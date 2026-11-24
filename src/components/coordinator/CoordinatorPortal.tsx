import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  CreditCard,
  Database,
  ExternalLink,
  FileSpreadsheet,
  FileText,
  ImagePlus,
  LayoutDashboard,
  ListChecks,
  LogOut,
  Menu,
  QrCode,
  RefreshCw,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react';
import { DEFAULT_POSTER_CONFIG, DEFAULT_QR_CONFIG } from '../../data/hackathonData';
import {
  FIREBASE_PROJECT_ID,
  FIRESTORE_DATABASE_ID,
  auth,
  saveActivePosterToFirestore,
  saveActiveQrToFirestore,
  subscribeAllRegistrationsAdmin,
  updateRegistrationInFirestore,
} from '../../firebase';
import {
  auditPaymentApi,
  deletePosterConfigApi,
  downloadCoordinatorCsvApi,
  fetchCoordinatorDataApi,
  getStoredCoordinatorToken,
  setStoredCoordinatorToken,
  updatePosterConfigApi,
  updateQrConfigApi,
  updateReviewStatusApi,
  verifyCoordinatorSessionApi,
} from '../../services/portalApi';
import type {
  CoordinatorTab,
  CsvExportMode,
  PaymentQrConfig,
  PosterConfig,
  ReviewStatus,
  TeamRegistration,
} from '../../types/hackathon';
import { computeDashboardMetrics } from '../../utils/hackathonLogic';
import { CoordinatorLogin } from './CoordinatorLogin';
import { ExecutiveDashboardView, RegistrationsView } from './CoordinatorDashboardViews';
import {
  AbstractsView,
  CsvExportView,
  ParticipantsRosterView,
  PaymentsAuditView,
  PosterSettingsView,
  QrSettingsView,
} from './CoordinatorOperationsViews';

interface CoordinatorPortalProps {
  activeTab: CoordinatorTab;
  onSelectTab: (tab: CoordinatorTab) => void;
  onOpenPublicSite: () => void;
}

const SIDEBAR_ITEMS: Array<{
  id: CoordinatorTab;
  label: string;
  icon: React.ReactNode;
}> = [
  { id: 'dashboard', label: 'Executive Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
  { id: 'registrations', label: 'Registrations', icon: <ListChecks className="w-4 h-4" /> },
  { id: 'payments', label: 'Payment Audit', icon: <CreditCard className="w-4 h-4" /> },
  { id: 'abstracts', label: 'Abstracts & Proposals', icon: <FileText className="w-4 h-4" /> },
  { id: 'participants', label: 'Participant Roster', icon: <Users className="w-4 h-4" /> },
  { id: 'qr-settings', label: 'Payment QR Settings', icon: <QrCode className="w-4 h-4" /> },
  { id: 'poster-settings', label: 'Official Poster', icon: <ImagePlus className="w-4 h-4" /> },
  { id: 'export', label: 'CSV Export Center', icon: <FileSpreadsheet className="w-4 h-4" /> },
];

export const CoordinatorPortal: React.FC<CoordinatorPortalProps> = ({
  activeTab,
  onSelectTab,
  onOpenPublicSite,
}) => {
  const [token, setToken] = useState<string | null>(() => getStoredCoordinatorToken());
  const [checkingSession, setCheckingSession] = useState(Boolean(getStoredCoordinatorToken()));
  const [registrations, setRegistrations] = useState<TeamRegistration[]>([]);
  const [qrConfig, setQrConfig] = useState<PaymentQrConfig>(DEFAULT_QR_CONFIG);
  const [posterConfig, setPosterConfig] = useState<PosterConfig>(DEFAULT_POSTER_CONFIG);
  const [lastSyncedAt, setLastSyncedAt] = useState<string>(new Date().toISOString());
  const [refreshing, setRefreshing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const loadData = useCallback(async (activeToken: string) => {
    setRefreshing(true);
    try {
      const data = await fetchCoordinatorDataApi(activeToken);
      setRegistrations(data.registrations);
      setQrConfig(data.qrConfig);
      setPosterConfig(data.posterConfig);
      setLastSyncedAt(data.syncedAt);
    } catch {
      setStoredCoordinatorToken(null);
      setToken(null);
    } finally {
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    let active = true;
    async function verify() {
      if (!token) {
        setCheckingSession(false);
        return;
      }
      const ok = await verifyCoordinatorSessionApi(token);
      if (!active) return;
      if (!ok) {
        setStoredCoordinatorToken(null);
        setToken(null);
      } else {
        await loadData(token);
      }
      setCheckingSession(false);
    }
    void verify();
    return () => {
      active = false;
    };
  }, [token, loadData]);

  // Also subscribe to Firestore real-time stream if signed in as Firebase Admin
  useEffect(() => {
    if (!token || !auth.currentUser) return;
    const unsub = subscribeAllRegistrationsAdmin(
      (fsRows) => {
        if (fsRows.length > 0) {
          setRegistrations((prev) => {
            const byId = new Map(prev.map((r) => [r.id, r]));
            for (const row of fsRows) {
              byId.set(row.id, row);
            }
            return Array.from(byId.values());
          });
          setLastSyncedAt(new Date().toISOString());
        }
      },
      () => {
        // Admin not signed into Google Admin account; backend API remains primary live source
      }
    );
    return () => unsub();
  }, [token]);

  const metrics = useMemo(() => computeDashboardMetrics(registrations), [registrations]);

  const handleUpdateStatus = async (regId: string, nextStatus: ReviewStatus) => {
    if (!token) return;
    const updated = await updateReviewStatusApi(token, regId, nextStatus);
    setRegistrations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setLastSyncedAt(new Date().toISOString());
    if (auth.currentUser) {
      await updateRegistrationInFirestore(regId, {
        status: updated.status,
        updatedAt: updated.updatedAt,
      }).catch(() => {});
    }
  };

  const handleAuditPayment = async (
    regId: string,
    action: 'VERIFY' | 'REJECT',
    reason?: string
  ) => {
    if (!token) return;
    const updated = await auditPaymentApi(token, regId, action, reason);
    setRegistrations((prev) => prev.map((r) => (r.id === updated.id ? updated : r)));
    setLastSyncedAt(new Date().toISOString());
    if (auth.currentUser) {
      await updateRegistrationInFirestore(regId, {
        paymentStatus: updated.paymentStatus,
        paymentVerifiedAt: updated.paymentVerifiedAt,
        paymentVerifiedBy: updated.paymentVerifiedBy,
        paymentRejectionReason: updated.paymentRejectionReason,
        updatedAt: updated.updatedAt,
      }).catch(() => {});
    }
  };

  const handleSaveQrConfig = async (next: {
    qrImageUrl: string;
    upiId: string;
    payeeName: string;
  }) => {
    if (!token) return;
    const saved = await updateQrConfigApi(token, next);
    setQrConfig(saved);
    setLastSyncedAt(new Date().toISOString());
    if (auth.currentUser) {
      await saveActiveQrToFirestore(saved).catch(() => {});
    }
  };

  const handleSavePosterConfig = async (next: Partial<PosterConfig>) => {
    if (!token) return;
    const saved = await updatePosterConfigApi(token, next);
    setPosterConfig(saved);
    setLastSyncedAt(new Date().toISOString());
    if (auth.currentUser) {
      await saveActivePosterToFirestore(saved).catch(() => {});
    }
  };

  const handleDeletePosterConfig = async () => {
    if (!token) return;
    const saved = await deletePosterConfigApi(token);
    setPosterConfig(saved);
    setLastSyncedAt(new Date().toISOString());
    if (auth.currentUser) {
      await saveActivePosterToFirestore(saved).catch(() => {});
    }
  };

  const handleExportCsv = async (mode: CsvExportMode) => {
    if (!token) return;
    await downloadCoordinatorCsvApi(token, mode);
  };

  const handleSignOut = () => {
    setStoredCoordinatorToken(null);
    setToken(null);
  };

  if (checkingSession) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-sm font-semibold text-[#13354B]">
        Verifying coordinator session...
      </div>
    );
  }

  if (!token) {
    return (
      <CoordinatorLogin
        onLoginSuccess={(newToken) => {
          setToken(newToken);
          void loadData(newToken);
        }}
        onBackToPublic={onOpenPublicSite}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#13354B] flex flex-col">
      {/* Top Administrative Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => setSidebarOpen((p) => !p)}
            aria-label="Toggle coordinator sidebar"
            className="lg:hidden p-2 rounded-xl bg-slate-100 text-[#13354B] cursor-pointer"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <img
            src="/assets/logos/rit-emblem.png"
            alt="RIT Crest"
            className="w-8 h-8 rounded-full shrink-0"
            referrerPolicy="no-referrer"
          />

          <div className="flex items-center gap-2.5 min-w-0">
            <span className="font-display font-extrabold text-sm sm:text-base text-[#13354B] truncate">
              Coordinator Administrative Portal
            </span>
            <span className="hidden md:inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-bold text-emerald-700 whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live Sync Active
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0">
          <div className="hidden xl:block text-right pr-2 border-r border-slate-200">
            <p className="text-xs font-bold text-[#13354B]">Ms. B. Harshana</p>
            <p className="font-mono text-[11px] text-slate-500 tabular-nums">
              Synced {new Date(lastSyncedAt).toLocaleTimeString()}
            </p>
          </div>

          <button
            type="button"
            onClick={() => void loadData(token)}
            disabled={refreshing}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-slate-100 hover:bg-slate-200 text-[#13354B] cursor-pointer whitespace-nowrap min-h-[38px]"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Force Refresh</span>
          </button>

          <button
            type="button"
            onClick={onOpenPublicSite}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-purple-50 hover:bg-purple-100 text-[#6B1FE0] border border-purple-200/80 cursor-pointer whitespace-nowrap min-h-[38px]"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Open Public Site</span>
          </button>

          <button
            type="button"
            onClick={handleSignOut}
            className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 cursor-pointer whitespace-nowrap min-h-[38px]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      <div className="flex-1 flex relative">
        {/* Persistent Left Sidebar */}
        <aside
          className={`${
            sidebarOpen ? 'fixed inset-y-16 left-0 z-30 block' : 'hidden'
          } lg:block w-64 shrink-0 bg-white border-r border-slate-200 p-4 flex flex-col justify-between`}
        >
          <div className="space-y-1.5">
            <p className="px-3 py-1 text-[11px] font-bold text-slate-400">
              HARMONIA 2027 ADMIN
            </p>
            {SIDEBAR_ITEMS.map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    onSelectTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    active
                      ? 'bg-purple-50 text-[#6B1FE0]'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-[#13354B]'
                  }`}
                >
                  <span className="flex items-center gap-2.5 truncate">
                    {item.icon}
                    <span className="truncate">{item.label}</span>
                  </span>

                  {item.id === 'registrations' && (
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded-md bg-slate-100 text-[#13354B] tabular-nums">
                      {metrics.totalTeams}
                    </span>
                  )}

                  {item.id === 'payments' && metrics.pendingProofsCount > 0 && (
                    <span className="font-mono text-[11px] px-1.5 py-0.5 rounded-md bg-amber-100 text-amber-800 animate-pulse tabular-nums">
                      {metrics.pendingProofsCount}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Live Cloud Firestore Connection Card */}
          <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs font-bold text-[#13354B]">
              <Database className="w-4 h-4 text-[#6B1FE0]" />
              <span>Cloud Firestore</span>
            </div>
            <p className="font-mono text-[11px] text-slate-600 break-all">
              {FIREBASE_PROJECT_ID}
            </p>
            <p className="font-mono text-[10px] text-slate-400 truncate">
              DB: {FIRESTORE_DATABASE_ID}
            </p>
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 pt-1">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Rules Hardened &amp; Active</span>
            </div>
          </div>
        </aside>

        {/* Main Viewport for Active Sub-View */}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 max-w-7xl">
          {activeTab === 'dashboard' && (
            <ExecutiveDashboardView
              registrations={registrations}
              onNavigateTab={onSelectTab}
            />
          )}
          {activeTab === 'registrations' && (
            <RegistrationsView
              registrations={registrations}
              onUpdateStatus={handleUpdateStatus}
            />
          )}
          {activeTab === 'payments' && (
            <PaymentsAuditView
              registrations={registrations}
              onAuditPayment={handleAuditPayment}
            />
          )}
          {activeTab === 'abstracts' && <AbstractsView registrations={registrations} />}
          {activeTab === 'participants' && (
            <ParticipantsRosterView registrations={registrations} />
          )}
          {activeTab === 'qr-settings' && (
            <QrSettingsView qrConfig={qrConfig} onSaveQrConfig={handleSaveQrConfig} />
          )}
          {activeTab === 'poster-settings' && (
            <PosterSettingsView
              posterConfig={posterConfig}
              onSavePosterConfig={handleSavePosterConfig}
              onDeletePosterConfig={handleDeletePosterConfig}
            />
          )}
          {activeTab === 'export' && (
            <CsvExportView registrations={registrations} onExportCsv={handleExportCsv} />
          )}
        </main>
      </div>
    </div>
  );
};
