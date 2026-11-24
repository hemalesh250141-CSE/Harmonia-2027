import React, { Suspense, useCallback, useEffect, useState } from 'react';
import { ErrorBoundary } from './components/ErrorBoundary';
import { PublicPortal } from './components/public/PublicPortal';
import type { CoordinatorTab } from './types/hackathon';

const CoordinatorPortal = React.lazy(() =>
  import('./components/coordinator/CoordinatorPortal').then((mod) => ({
    default: mod.CoordinatorPortal,
  }))
);

const ParticipantPortalView = React.lazy(() =>
  import('./components/public/ParticipantPortalView').then((mod) => ({
    default: mod.ParticipantPortalView,
  }))
);

const TAB_TO_PATH: Record<CoordinatorTab, string> = {
  dashboard: '/coordinator/dashboard',
  registrations: '/coordinator/registrations',
  payments: '/coordinator/payments',
  abstracts: '/coordinator/abstracts',
  participants: '/coordinator/participants',
  'qr-settings': '/coordinator/qr-settings',
  'poster-settings': '/coordinator/poster-settings',
  export: '/coordinator/export',
};

function parseRoute(pathname: string): {
  mode: 'public' | 'participant' | 'coordinator';
  coordTab: CoordinatorTab;
  focusRegister: boolean;
} {
  const normalized = pathname.toLowerCase().replace(/\/+$/, '') || '/';
  if (normalized === '/coordinator' || normalized.startsWith('/coordinator/')) {
    const sub = normalized.replace(/^\/coordinator\/?/, '');
    const matched = (Object.keys(TAB_TO_PATH) as CoordinatorTab[]).find((tab) => tab === sub);
    return {
      mode: 'coordinator',
      coordTab: matched || 'dashboard',
      focusRegister: false,
    };
  }
  if (normalized === '/participant/login' || normalized === '/participant/dashboard') {
    return {
      mode: 'participant',
      coordTab: 'dashboard',
      focusRegister: false,
    };
  }
  return {
    mode: 'public',
    coordTab: 'dashboard',
    focusRegister: normalized === '/register',
  };
}

export default function App() {
  const [route, setRoute] = useState(() => parseRoute(window.location.pathname));

  useEffect(() => {
    const onPopState = () => {
      setRoute(parseRoute(window.location.pathname));
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const navigate = useCallback((path: string) => {
    if (window.location.pathname !== path) {
      window.history.pushState({}, '', path);
    }
    setRoute(parseRoute(path));
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, []);

  return (
    <ErrorBoundary>
      {route.mode === 'coordinator' ? (
        <Suspense
          fallback={
            <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center text-sm font-semibold text-[#13354B]">
              Loading Coordinator Administrative Portal...
            </div>
          }
        >
          <CoordinatorPortal
            activeTab={route.coordTab}
            onSelectTab={(tab) => navigate(TAB_TO_PATH[tab])}
            onOpenPublicSite={() => navigate('/')}
          />
        </Suspense>
      ) : route.mode === 'participant' ? (
        <Suspense
          fallback={
            <div className="min-h-screen bg-[#050814] flex items-center justify-center text-sm font-semibold text-amber-300">
              Loading Participant Workspace...
            </div>
          }
        >
          <ParticipantPortalView
            onBackToHome={() => navigate('/')}
            onGoToRegister={() => navigate('/register')}
          />
        </Suspense>
      ) : (
        <PublicPortal
          initialFocusRegister={route.focusRegister}
          onOpenCoordinatorPortal={() => navigate('/coordinator/dashboard')}
          onOpenParticipantPortal={() => navigate('/participant/dashboard')}
        />
      )}
    </ErrorBoundary>
  );
}
