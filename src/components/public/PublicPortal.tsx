import React, { useCallback, useEffect, useState } from 'react';
import { onAuthStateChanged, type User } from 'firebase/auth';
import {
  auth,
  fetchParticipantProfile,
  signInWithGooglePopup,
  signOutFirebase,
  subscribeActivePosterFromFirestore,
  subscribeActiveQrFromFirestore,
} from '../../firebase';
import { DEFAULT_POSTER_CONFIG, DEFAULT_QR_CONFIG } from '../../data/hackathonData';
import { fetchPublicBootstrap } from '../../services/portalApi';
import type {
  ParticipantProfile,
  PaymentQrConfig,
  PosterConfig,
  TeamRegistration,
  TrackId,
} from '../../types/hackathon';
import { ScrollProgressBar } from '../motion/MotionPrimitives';
import { PointerGlowOverlay, TouchRippleLayer } from '../motion/MusicalMotionPrimitives';
import { AnnouncementBar } from './AnnouncementBar';
import { PublicHeader } from './PublicHeader';
import { HeroSection } from './HeroSection';
import { AboutStatsSection } from './AboutStatsSection';
import { GlobalConnectionSection } from './GlobalConnectionSection';
import { TracksSection } from './TracksSection';
import { TimelinePrizesSection } from './TimelinePrizesSection';
import { RegistrationWizard } from './RegistrationWizard';
import { PartnerEcosystemSection } from './PartnerEcosystemSection';
import { FaqContactSection } from './FaqContactSection';
import { ParticipantProfileModal } from './ParticipantProfileModal';
import { TeamDashboardModal } from './TeamDashboardModal';

interface PublicPortalProps {
  onOpenCoordinatorPortal: () => void;
  onOpenParticipantPortal: () => void;
  initialFocusRegister?: boolean;
}

export const PublicPortal: React.FC<PublicPortalProps> = ({
  onOpenCoordinatorPortal,
  onOpenParticipantPortal,
  initialFocusRegister = false,
}) => {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [participantProfile, setParticipantProfile] = useState<ParticipantProfile | null>(null);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  const [selectedTrackId, setSelectedTrackId] = useState<TrackId>('linguaverse');
  const [qrConfig, setQrConfig] = useState<PaymentQrConfig>(DEFAULT_QR_CONFIG);
  const [posterConfig, setPosterConfig] = useState<PosterConfig>(DEFAULT_POSTER_CONFIG);
  const [publicStats, setPublicStats] = useState<{
    totalTeams: number;
    totalInnovators: number;
    trackCounts: Record<TrackId, number>;
  }>({
    totalTeams: 6,
    totalInnovators: 16,
    trackCounts: {
      linguaverse: 1,
      abilityx: 2,
      roots: 1,
      flowforge: 1,
      iotverse: 1,
    },
  });

  const [profileModalOpen, setProfileModalOpen] = useState(false);
  const [teamDashboardOpen, setTeamDashboardOpen] = useState(false);
  const [recentRegistrations, setRecentRegistrations] = useState<TeamRegistration[]>([]);

  const loadBootstrap = useCallback(async () => {
    try {
      const data = await fetchPublicBootstrap();
      if (data.qrConfig) {
        setQrConfig(data.qrConfig);
      }
      if (data.posterConfig) {
        setPosterConfig(data.posterConfig);
      }
      if (data.publicStats && data.publicStats.totalTeams > 0) {
        setPublicStats(data.publicStats);
      }
    } catch {
      // Keep deterministic default state when offline
    }
  }, []);

  useEffect(() => {
    void loadBootstrap();
  }, [loadBootstrap]);

  useEffect(() => {
    if (initialFocusRegister) {
      const el = document.getElementById('register');
      if (el) {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  }, [initialFocusRegister]);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user) {
        try {
          const prof = await fetchParticipantProfile(user.uid);
          setParticipantProfile(prof);
          if (!prof) {
            setProfileModalOpen(true);
          }
        } catch {
          // ignore if offline
        }
      } else {
        setParticipantProfile(null);
      }
    });
    return () => unsub();
  }, []);

  useEffect(() => {
    const unsubQr = subscribeActiveQrFromFirestore((fsQr) => {
      if (fsQr && (fsQr.qrImageUrl || fsQr.upiId)) {
        setQrConfig(fsQr);
      }
    });
    const unsubPoster = subscribeActivePosterFromFirestore((fsPoster) => {
      if (fsPoster) {
        setPosterConfig(fsPoster);
      }
    });
    return () => {
      unsubQr();
      unsubPoster();
    };
  }, []);

  const handleGoogleSignIn = async () => {
    setAuthError('');
    setAuthLoading(true);
    try {
      await signInWithGooglePopup();
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Google Sign-In cancelled or failed.';
      setAuthError(msg);
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await signOutFirebase();
    setParticipantProfile(null);
  };

  const scrollToRegister = (trackId?: TrackId) => {
    if (trackId) {
      setSelectedTrackId(trackId);
    }
    const el = document.getElementById('register');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleRegistrationComplete = (reg: TeamRegistration) => {
    setRecentRegistrations((prev) => [reg, ...prev.filter((r) => r.id !== reg.id)]);
    void loadBootstrap();
  };

  return (
    <div className="min-h-screen harmonia-midnight-canvas text-slate-100 overflow-x-clip relative">
      <ScrollProgressBar />
      <TouchRippleLayer />
      <PointerGlowOverlay />
      <AnnouncementBar />

      <PublicHeader
        firebaseUser={firebaseUser}
        participantProfile={participantProfile}
        onGoogleSignIn={handleGoogleSignIn}
        onSignOut={handleSignOut}
        onOpenProfileModal={() => setProfileModalOpen(true)}
        onOpenTeamDashboard={() => setTeamDashboardOpen(true)}
        onOpenCoordinatorPortal={onOpenCoordinatorPortal}
        onOpenParticipantPortal={onOpenParticipantPortal}
        onRegisterClick={() => scrollToRegister()}
        authLoading={authLoading}
      />

      {authError && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-3">
          <div className="rounded-xl bg-amber-500/15 border border-amber-400/40 px-4 py-2.5 text-xs text-amber-200 flex items-center justify-between">
            <span>Google Sign-In note: {authError}</span>
            <button
              type="button"
              onClick={() => setAuthError('')}
              className="font-bold underline ml-3 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <main className="relative z-10">
        <HeroSection
          totalTeams={publicStats.totalTeams}
          totalInnovators={publicStats.totalInnovators}
          posterConfig={posterConfig}
          onRegisterClick={() => scrollToRegister()}
        />

        <AboutStatsSection
          totalTeams={publicStats.totalTeams}
          totalInnovators={publicStats.totalInnovators}
          posterConfig={posterConfig}
          onRegisterClick={() => scrollToRegister()}
        />

        <GlobalConnectionSection />

        <TracksSection
          selectedTrackId={selectedTrackId}
          trackCounts={publicStats.trackCounts}
          onSelectTrackForRegistration={(trackId) => scrollToRegister(trackId)}
        />

        <TimelinePrizesSection />

        <RegistrationWizard
          selectedTrackId={selectedTrackId}
          onTrackChange={setSelectedTrackId}
          firebaseUser={firebaseUser}
          participantProfile={participantProfile}
          qrConfig={qrConfig}
          onGoogleSignIn={handleGoogleSignIn}
          onOpenProfileModal={() => setProfileModalOpen(true)}
          onRegistrationComplete={handleRegistrationComplete}
          onOpenTeamDashboard={() => setTeamDashboardOpen(true)}
        />

        <PartnerEcosystemSection />

        <FaqContactSection
          onOpenCoordinatorPortal={onOpenCoordinatorPortal}
          onOpenTeamDashboard={() => setTeamDashboardOpen(true)}
          onOpenParticipantPortal={onOpenParticipantPortal}
        />
      </main>

      <ParticipantProfileModal
        open={profileModalOpen}
        firebaseUser={firebaseUser}
        existingProfile={participantProfile}
        onClose={() => setProfileModalOpen(false)}
        onSaved={(prof) => setParticipantProfile(prof)}
      />

      <TeamDashboardModal
        open={teamDashboardOpen}
        firebaseUser={firebaseUser}
        recentRegistrations={recentRegistrations}
        onClose={() => setTeamDashboardOpen(false)}
        onOpenParticipantPortal={onOpenParticipantPortal}
      />
    </div>
  );
};
