import type {
  CsvExportMode,
  PaymentQrConfig,
  PosterConfig,
  RegistrationFormInput,
  ReviewStatus,
  TeamRegistration,
  TrackId,
} from '../types/hackathon';
import { DEFAULT_POSTER_CONFIG, DEFAULT_QR_CONFIG } from '../data/hackathonData';

export interface PublicBootstrapResponse {
  qrConfig: PaymentQrConfig;
  posterConfig: PosterConfig;
  publicStats: {
    totalTeams: number;
    totalInnovators: number;
    trackCounts: Record<TrackId, number>;
  };
  version: number;
}

const COORD_TOKEN_KEY = 'harmonia_2027_coord_token';

export function getStoredCoordinatorToken(): string | null {
  try {
    return window.sessionStorage.getItem(COORD_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredCoordinatorToken(token: string | null): void {
  try {
    if (token) {
      window.sessionStorage.setItem(COORD_TOKEN_KEY, token);
    } else {
      window.sessionStorage.removeItem(COORD_TOKEN_KEY);
    }
  } catch {
    // ignore storage errors
  }
}

export async function fetchPublicBootstrap(): Promise<PublicBootstrapResponse> {
  const res = await fetch('/api/public/bootstrap', { cache: 'no-cache' });
  if (!res.ok) {
    return {
      qrConfig: DEFAULT_QR_CONFIG,
      posterConfig: DEFAULT_POSTER_CONFIG,
      publicStats: {
        totalTeams: 0,
        totalInnovators: 0,
        trackCounts: {
          linguaverse: 0,
          abilityx: 0,
          roots: 0,
          flowforge: 0,
          iotverse: 0,
        },
      },
      version: 0,
    };
  }
  const json = (await res.json()) as Partial<PublicBootstrapResponse>;
  return {
    qrConfig: json.qrConfig || DEFAULT_QR_CONFIG,
    posterConfig: json.posterConfig || DEFAULT_POSTER_CONFIG,
    publicStats: json.publicStats || {
      totalTeams: 0,
      totalInnovators: 0,
      trackCounts: {
        linguaverse: 0,
        abilityx: 0,
        roots: 0,
        flowforge: 0,
        iotverse: 0,
      },
    },
    version: json.version || 0,
  };
}

export async function submitTeamRegistrationApi(
  input: RegistrationFormInput & { id?: string }
): Promise<TeamRegistration> {
  const res = await fetch('/api/registrations', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(input),
  });
  const data = (await res.json()) as {
    registration?: TeamRegistration;
    error?: string;
    errors?: Record<string, string>;
  };
  if (!res.ok || !data.registration) {
    const firstFieldError = data.errors ? Object.values(data.errors)[0] : undefined;
    throw new Error(firstFieldError || data.error || 'Failed to submit registration.');
  }
  return data.registration;
}

export async function lookupTeamByIdAndEmail(
  id: string,
  email: string
): Promise<TeamRegistration> {
  const params = new URLSearchParams({ id, email });
  const res = await fetch(`/api/registrations/lookup?${params.toString()}`);
  const data = (await res.json()) as { registration?: TeamRegistration; error?: string };
  if (!res.ok || !data.registration) {
    throw new Error(data.error || 'Team registration not found.');
  }
  return data.registration;
}

export async function fetchMyRegistrationsApi(
  email?: string | null,
  uid?: string | null
): Promise<TeamRegistration[]> {
  const params = new URLSearchParams();
  if (email) params.set('email', email);
  if (uid) params.set('uid', uid);
  const res = await fetch(`/api/registrations/mine?${params.toString()}`);
  if (!res.ok) return [];
  const data = (await res.json()) as { registrations?: TeamRegistration[] };
  return data.registrations || [];
}

export async function reuploadPaymentProofApi(
  regId: string,
  leaderEmail: string,
  paymentScreenshotUrl: string
): Promise<TeamRegistration> {
  const res = await fetch(`/api/registrations/${encodeURIComponent(regId)}/proof`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ leaderEmail, paymentScreenshotUrl }),
  });
  const data = (await res.json()) as { registration?: TeamRegistration; error?: string };
  if (!res.ok || !data.registration) {
    throw new Error(data.error || 'Failed to re-upload payment proof.');
  }
  return data.registration;
}

export async function loginCoordinatorApi(
  username: string,
  password: string
): Promise<{ token: string; displayName: string; role: string }> {
  const res = await fetch('/api/coordinator/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  const data = (await res.json()) as {
    token?: string;
    coordinator?: { displayName: string; role: string };
    error?: string;
  };
  if (!res.ok || !data.token) {
    throw new Error(data.error || 'Invalid coordinator credentials.');
  }
  setStoredCoordinatorToken(data.token);
  return {
    token: data.token,
    displayName: data.coordinator?.displayName || 'Ms. B. Harshana',
    role: data.coordinator?.role || 'Faculty Coordinator · AP/CSE',
  };
}

export async function verifyCoordinatorSessionApi(token: string): Promise<boolean> {
  const res = await fetch('/api/coordinator/session', {
    headers: { Authorization: `Bearer ${token}` },
  });
  return res.ok;
}

export async function fetchCoordinatorDataApi(token: string): Promise<{
  registrations: TeamRegistration[];
  qrConfig: PaymentQrConfig;
  posterConfig: PosterConfig;
  syncedAt: string;
}> {
  const res = await fetch('/api/coordinator/registrations', {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error('Coordinator session unauthorized or expired.');
  }
  const data = (await res.json()) as {
    registrations: TeamRegistration[];
    qrConfig: PaymentQrConfig;
    posterConfig?: PosterConfig;
    syncedAt: string;
  };
  return {
    registrations: data.registrations,
    qrConfig: data.qrConfig,
    posterConfig: data.posterConfig || DEFAULT_POSTER_CONFIG,
    syncedAt: data.syncedAt,
  };
}

export async function updateReviewStatusApi(
  token: string,
  regId: string,
  status: ReviewStatus
): Promise<TeamRegistration> {
  const res = await fetch(`/api/coordinator/registrations/${encodeURIComponent(regId)}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ status }),
  });
  const data = (await res.json()) as { registration?: TeamRegistration; error?: string };
  if (!res.ok || !data.registration) {
    throw new Error(data.error || 'Failed to update review status.');
  }
  return data.registration;
}

export async function auditPaymentApi(
  token: string,
  regId: string,
  action: 'VERIFY' | 'REJECT',
  reason?: string
): Promise<TeamRegistration> {
  const res = await fetch(`/api/coordinator/registrations/${encodeURIComponent(regId)}/payment`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ action, reason }),
  });
  const data = (await res.json()) as { registration?: TeamRegistration; error?: string };
  if (!res.ok || !data.registration) {
    throw new Error(data.error || 'Failed to update payment status.');
  }
  return data.registration;
}

export async function updateQrConfigApi(
  token: string,
  config: { qrImageUrl: string; upiId: string; payeeName: string }
): Promise<PaymentQrConfig> {
  const res = await fetch('/api/coordinator/qr-config', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(config),
  });
  const data = (await res.json()) as { qrConfig?: PaymentQrConfig; error?: string };
  if (!res.ok || !data.qrConfig) {
    throw new Error(data.error || 'Failed to save QR configuration.');
  }
  return data.qrConfig;
}

export async function updatePosterConfigApi(
  token: string,
  config: Partial<PosterConfig>
): Promise<PosterConfig> {
  const res = await fetch('/api/coordinator/poster-config', {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(config),
  });
  const data = (await res.json()) as { posterConfig?: PosterConfig; error?: string };
  if (!res.ok || !data.posterConfig) {
    throw new Error(data.error || 'Failed to save official poster configuration.');
  }
  return data.posterConfig;
}

export async function deletePosterConfigApi(token: string): Promise<PosterConfig> {
  const res = await fetch('/api/coordinator/poster-config', {
    method: 'DELETE',
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = (await res.json()) as { posterConfig?: PosterConfig; error?: string };
  if (!res.ok || !data.posterConfig) {
    throw new Error(data.error || 'Failed to remove official poster.');
  }
  return data.posterConfig;
}

export async function downloadCoordinatorCsvApi(
  token: string,
  mode: CsvExportMode
): Promise<void> {
  const res = await fetch(`/api/coordinator/export?type=${encodeURIComponent(mode)}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error('Failed to export CSV.');
  }
  const blob = await res.blob();
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `harmonia-2027-${mode}-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
