import compression from 'compression';
import crypto from 'node:crypto';
import express, { type NextFunction, type Request, type Response } from 'express';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createServer as createViteServer } from 'vite';
import {
  DEFAULT_POSTER_CONFIG,
  DEFAULT_QR_CONFIG,
  SEED_REGISTRATIONS,
} from './src/data/hackathonData.ts';
import type {
  CsvExportMode,
  PaymentQrConfig,
  PosterConfig,
  ReviewStatus,
  TeamRegistration,
} from './src/types/hackathon.ts';
import {
  calculateRegistrationFee,
  computeDashboardMetrics,
  generateCsvContent,
  generateRegistrationId,
  normalizeIndianMobile,
  VALID_REVIEW_STATUSES,
  validatePosterConfigInput,
  validateTeamRegistration,
} from './src/utils/hackathonLogic.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PORT = Number(process.env.PORT || 3000);
const IS_PROD = process.env.NODE_ENV === 'production';
const DATA_DIR = path.resolve(__dirname, 'workspace');
const STORE_PATH = path.join(DATA_DIR, 'harmonia-store.json');

const COORDINATOR_USERNAME = process.env.COORDINATOR_USERNAME || 'Harshana';
const COORDINATOR_PASSWORD = process.env.COORDINATOR_PASSWORD || 'Rit@1432#';
const SESSION_SECRET =
  process.env.SESSION_SECRET || crypto.randomBytes(32).toString('hex');

interface StoreState {
  registrations: TeamRegistration[];
  qrConfig: PaymentQrConfig;
  posterConfig: PosterConfig;
  version: number;
}

let store: StoreState = {
  registrations: [...SEED_REGISTRATIONS],
  qrConfig: { ...DEFAULT_QR_CONFIG },
  posterConfig: { ...DEFAULT_POSTER_CONFIG },
  version: 1,
};

// Load persisted store if available
function loadStoreFromDisk(): void {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
    if (fs.existsSync(STORE_PATH)) {
      const raw = fs.readFileSync(STORE_PATH, 'utf8');
      const parsed = JSON.parse(raw) as Partial<StoreState>;
      if (Array.isArray(parsed.registrations) && parsed.registrations.length > 0) {
        store.registrations = parsed.registrations;
      }
      if (parsed.qrConfig && parsed.qrConfig.upiId) {
        store.qrConfig = parsed.qrConfig;
      }
      if (parsed.posterConfig && typeof parsed.posterConfig.isHidden === 'boolean') {
        store.posterConfig = parsed.posterConfig;
      }
      if (typeof parsed.version === 'number') {
        store.version = parsed.version;
      }
    } else {
      fs.writeFileSync(STORE_PATH, JSON.stringify(store, null, 2), 'utf8');
    }
  } catch (err) {
    console.error('Store initialization warning, using in-memory defaults:', err);
  }
}

loadStoreFromDisk();

// Coalesced non-blocking atomic persistence queue for high concurrency
let flushPending = false;
let flushInFlight = false;

async function schedulePersist(): Promise<void> {
  store.version += 1;
  invalidateBootstrapCache();
  flushPending = true;
  if (flushInFlight) return;

  flushInFlight = true;
  try {
    while (flushPending) {
      flushPending = false;
      const snapshot = JSON.stringify(store);
      const tmpPath = `${STORE_PATH}.tmp`;
      await fs.promises.writeFile(tmpPath, snapshot, 'utf8');
      await fs.promises.rename(tmpPath, STORE_PATH);
    }
  } catch (err) {
    console.error('Async store flush error:', err);
  } finally {
    flushInFlight = false;
  }
}

// Fast ETag in-memory cache for /api/public/bootstrap (10k concurrent read optimization)
let bootstrapCache: { payload: string; etag: string } | null = null;

function invalidateBootstrapCache(): void {
  bootstrapCache = null;
}

function getBootstrapCache(): { payload: string; etag: string } {
  if (bootstrapCache) {
    return bootstrapCache;
  }
  const metrics = computeDashboardMetrics(store.registrations);
  const body = {
    qrConfig: store.qrConfig,
    posterConfig: store.posterConfig,
    publicStats: {
      totalTeams: metrics.totalTeams,
      totalInnovators: metrics.totalInnovators,
      trackCounts: metrics.trackCounts,
    },
    version: store.version,
  };
  const payload = JSON.stringify(body);
  const etag = `"${crypto.createHash('sha1').update(payload).digest('hex')}"`;
  bootstrapCache = { payload, etag };
  return bootstrapCache;
}

// Sliding-window rate limiter (memory-efficient)
function createRateLimiter(maxRequests: number, windowMs: number) {
  const hits = new Map<string, { count: number; resetAt: number }>();

  // Periodic cleanup every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of hits.entries()) {
      if (entry.resetAt <= now) {
        hits.delete(key);
      }
    }
  }, 300_000).unref();

  return (req: Request, res: Response, next: NextFunction): void => {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const current = hits.get(ip);
    if (!current || current.resetAt <= now) {
      hits.set(ip, { count: 1, resetAt: now + windowMs });
      next();
      return;
    }
    if (current.count >= maxRequests) {
      res.status(429).json({
        error: 'Too many requests from this network. Please retry in a few seconds.',
      });
      return;
    }
    current.count += 1;
    next();
  };
}

// HMAC-SHA256 Coordinator Session Tokens
function signCoordinatorToken(username: string): string {
  const payload = Buffer.from(
    JSON.stringify({
      sub: username,
      name: 'Ms. B. Harshana',
      role: 'coordinator',
      exp: Date.now() + 1000 * 60 * 60 * 12,
    })
  ).toString('base64url');
  const sig = crypto.createHmac('sha256', SESSION_SECRET).update(payload).digest('base64url');
  return `${payload}.${sig}`;
}

function verifyCoordinatorToken(token: string | undefined): { valid: boolean; name?: string } {
  if (!token || !token.includes('.')) {
    return { valid: false };
  }
  const [payloadB64, sig] = token.split('.');
  if (!payloadB64 || !sig) {
    return { valid: false };
  }
  const expectedSig = crypto
    .createHmac('sha256', SESSION_SECRET)
    .update(payloadB64)
    .digest('base64url');
  const sigBuf = Buffer.from(sig);
  const expBuf = Buffer.from(expectedSig);
  if (sigBuf.length !== expBuf.length || !crypto.timingSafeEqual(sigBuf, expBuf)) {
    return { valid: false };
  }
  try {
    const parsed = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8')) as {
      exp?: number;
      name?: string;
      role?: string;
    };
    if (!parsed.exp || parsed.exp < Date.now() || parsed.role !== 'coordinator') {
      return { valid: false };
    }
    return { valid: true, name: parsed.name || 'Ms. B. Harshana' };
  } catch {
    return { valid: false };
  }
}

function requireCoordinator(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;
  const bearer = authHeader?.startsWith('Bearer ') ? authHeader.slice(7).trim() : undefined;
  const verified = verifyCoordinatorToken(bearer);
  if (!verified.valid) {
    res.status(401).json({ error: 'Coordinator session expired or unauthorized.' });
    return;
  }
  next();
}

function safeEqualString(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return crypto.timingSafeEqual(bufA, bufB);
}

async function startServer(): Promise<void> {
  const app = express();
  app.set('trust proxy', 1);
  app.use(compression());
  app.use(express.json({ limit: '2mb' }));

  const writeLimiter = createRateLimiter(120, 60_000);
  const loginLimiter = createRateLimiter(30, 60_000);

  app.get('/api/health', (_req, res) => {
    res.json({ ok: true, timestamp: new Date().toISOString(), teams: store.registrations.length });
  });

  // High-throughput ETag-cached bootstrap endpoint
  app.get('/api/public/bootstrap', (req, res) => {
    const { payload, etag } = getBootstrapCache();
    res.setHeader('ETag', etag);
    res.setHeader('Cache-Control', 'no-cache');
    if (req.headers['if-none-match'] === etag) {
      res.status(304).end();
      return;
    }
    res.setHeader('Content-Type', 'application/json');
    res.send(payload);
  });

  // Lookup specific team status (for Team Dashboard guest/ID lookup)
  app.get('/api/registrations/lookup', (req, res) => {
    const id = String(req.query.id || '').trim().toUpperCase();
    const email = String(req.query.email || '').trim().toLowerCase();
    if (!id || !email) {
      res.status(400).json({ error: 'Both Registration ID and Team Lead email are required.' });
      return;
    }
    const found = store.registrations.find(
      (r) => r.id.toUpperCase() === id && r.leaderEmail.toLowerCase() === email
    );
    if (!found) {
      res.status(404).json({ error: 'No matching team registration found for that ID and email.' });
      return;
    }
    res.json({ registration: found });
  });

  // Lookup all registrations for an authenticated email
  app.get('/api/registrations/mine', (req, res) => {
    const email = String(req.query.email || '').trim().toLowerCase();
    const uid = String(req.query.uid || '').trim();
    if (!email && !uid) {
      res.status(400).json({ error: 'Email or UID is required.' });
      return;
    }
    const matches = store.registrations.filter(
      (r) => (uid && r.leaderUid === uid) || (email && r.leaderEmail.toLowerCase() === email)
    );
    res.json({ registrations: matches });
  });

  // Submit new team registration
  app.post('/api/registrations', writeLimiter, async (req, res) => {
    const body = req.body as Partial<TeamRegistration>;
    const validation = validateTeamRegistration({
      teamName: body.teamName || '',
      trackId: body.trackId as TeamRegistration['trackId'],
      leaderUid: body.leaderUid,
      leaderName: body.leaderName || '',
      leaderEmail: body.leaderEmail || '',
      leaderMobile: body.leaderMobile || '',
      institution: body.institution || '',
      memberCount: Number(body.memberCount) as 1 | 2 | 3 | 4,
      members: Array.isArray(body.members) ? body.members : [],
      projectTitle: body.projectTitle || '',
      ieeeMemberId: body.ieeeMemberId,
      abstract: body.abstract || '',
      inclusionImpact: body.inclusionImpact || '',
      paymentScreenshotUrl: body.paymentScreenshotUrl || '',
    });

    if (!validation.valid) {
      res.status(400).json({ error: 'Validation failed', errors: validation.errors });
      return;
    }

    const memberCount = Number(body.memberCount) as 1 | 2 | 3 | 4;
    const fee = calculateRegistrationFee(memberCount);
    const now = new Date().toISOString();

    let regId = body.id && /^HAR-2027-[A-Z0-9]{5}$/.test(body.id)
      ? body.id
      : generateRegistrationId(crypto.randomBytes(6));

    // Ensure uniqueness under concurrency
    const existingIds = new Set(store.registrations.map((r) => r.id));
    if (existingIds.has(regId)) {
      regId = generateRegistrationId(crypto.randomBytes(6));
    }

    const sanitized: TeamRegistration = {
      id: regId,
      teamName: String(body.teamName).trim(),
      leaderUid: body.leaderUid ? String(body.leaderUid).trim() : undefined,
      leaderName: String(body.leaderName).trim(),
      leaderEmail: String(body.leaderEmail).trim(),
      leaderMobile: normalizeIndianMobile(String(body.leaderMobile)),
      institution: String(body.institution).trim(),
      trackId: body.trackId as TeamRegistration['trackId'],
      memberCount,
      members: (body.members || []).slice(0, memberCount - 1).map((m) => ({
        name: String(m.name).trim(),
        email: String(m.email).trim(),
        mobile: normalizeIndianMobile(String(m.mobile)),
      })),
      projectTitle: String(body.projectTitle).trim(),
      abstract: String(body.abstract).trim(),
      inclusionImpact: String(body.inclusionImpact).trim(),
      ieeeMemberId: body.ieeeMemberId ? String(body.ieeeMemberId).trim() : '',
      registrationFee: fee,
      paymentStatus: 'PENDING',
      paymentScreenshotUrl: String(body.paymentScreenshotUrl),
      paymentUploadedAt: now,
      status: 'Submitted',
      createdAt: now,
      updatedAt: now,
    };

    store.registrations = [sanitized, ...store.registrations];
    await schedulePersist();

    res.status(201).json({ registration: sanitized });
  });

  // Re-upload payment proof for a pending/rejected registration
  app.patch('/api/registrations/:id/proof', writeLimiter, async (req, res) => {
    const id = req.params.id;
    const { paymentScreenshotUrl, leaderEmail } = req.body as {
      paymentScreenshotUrl?: string;
      leaderEmail?: string;
    };
    const idx = store.registrations.findIndex((r) => r.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Registration not found.' });
      return;
    }
    const existing = store.registrations[idx];
    if (
      !leaderEmail ||
      existing.leaderEmail.toLowerCase() !== String(leaderEmail).trim().toLowerCase()
    ) {
      res.status(403).json({ error: 'Only the registered Team Lead can update payment proof.' });
      return;
    }
    if (existing.paymentStatus === 'VERIFIED') {
      res.status(400).json({ error: 'Payment is already verified and locked.' });
      return;
    }
    if (!paymentScreenshotUrl || paymentScreenshotUrl.length > 220_000) {
      res.status(400).json({ error: 'Valid compressed screenshot (<150 KB) is required.' });
      return;
    }
    const now = new Date().toISOString();
    const updated: TeamRegistration = {
      ...existing,
      paymentScreenshotUrl,
      paymentUploadedAt: now,
      paymentStatus: 'PENDING',
      paymentRejectionReason: undefined,
      updatedAt: now,
    };
    store.registrations[idx] = updated;
    await schedulePersist();
    res.json({ registration: updated });
  });

  // Coordinator Authentication
  app.post('/api/coordinator/login', loginLimiter, (req, res) => {
    const { username, password } = req.body as { username?: string; password?: string };
    if (
      !username ||
      !password ||
      !safeEqualString(username.trim(), COORDINATOR_USERNAME) ||
      !safeEqualString(password, COORDINATOR_PASSWORD)
    ) {
      res.status(401).json({ error: 'Invalid coordinator username or password.' });
      return;
    }
    const token = signCoordinatorToken(COORDINATOR_USERNAME);
    res.json({
      token,
      coordinator: {
        username: COORDINATOR_USERNAME,
        displayName: 'Ms. B. Harshana',
        role: 'Faculty Coordinator · AP/CSE',
      },
    });
  });

  app.get('/api/coordinator/session', requireCoordinator, (_req, res) => {
    res.json({
      authenticated: true,
      coordinator: {
        username: COORDINATOR_USERNAME,
        displayName: 'Ms. B. Harshana',
        role: 'Faculty Coordinator · AP/CSE',
      },
    });
  });

  // Coordinator Registrations List
  app.get('/api/coordinator/registrations', requireCoordinator, (_req, res) => {
    res.json({
      registrations: store.registrations,
      qrConfig: store.qrConfig,
      posterConfig: store.posterConfig,
      syncedAt: new Date().toISOString(),
    });
  });

  // Coordinator Update Review Status
  app.patch('/api/coordinator/registrations/:id/status', requireCoordinator, async (req, res) => {
    const id = req.params.id;
    const { status } = req.body as { status?: ReviewStatus };
    if (!status || !VALID_REVIEW_STATUSES.includes(status)) {
      res.status(400).json({ error: 'Invalid review status.' });
      return;
    }
    const idx = store.registrations.findIndex((r) => r.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Registration not found.' });
      return;
    }
    const now = new Date().toISOString();
    const updated: TeamRegistration = {
      ...store.registrations[idx],
      status,
      updatedAt: now,
    };
    store.registrations[idx] = updated;
    await schedulePersist();
    res.json({ registration: updated });
  });

  // Coordinator Verify or Reject Payment
  app.patch('/api/coordinator/registrations/:id/payment', requireCoordinator, async (req, res) => {
    const id = req.params.id;
    const { action, reason } = req.body as { action?: 'VERIFY' | 'REJECT'; reason?: string };
    if (action !== 'VERIFY' && action !== 'REJECT') {
      res.status(400).json({ error: 'Action must be VERIFY or REJECT.' });
      return;
    }
    const idx = store.registrations.findIndex((r) => r.id === id);
    if (idx === -1) {
      res.status(404).json({ error: 'Registration not found.' });
      return;
    }
    const now = new Date().toISOString();
    const existing = store.registrations[idx];
    const updated: TeamRegistration =
      action === 'VERIFY'
        ? {
            ...existing,
            paymentStatus: 'VERIFIED',
            paymentVerifiedAt: now,
            paymentVerifiedBy: 'Ms. B. Harshana',
            paymentRejectionReason: undefined,
            updatedAt: now,
          }
        : {
            ...existing,
            paymentStatus: 'REJECTED',
            paymentVerifiedAt: undefined,
            paymentVerifiedBy: 'Ms. B. Harshana',
            paymentRejectionReason:
              (reason || '').trim() || 'Payment proof could not be verified. Please re-upload.',
            updatedAt: now,
          };

    store.registrations[idx] = updated;
    await schedulePersist();
    res.json({ registration: updated });
  });

  // Coordinator Update Active Payment QR
  app.put('/api/coordinator/qr-config', requireCoordinator, async (req, res) => {
    const { qrImageUrl, upiId, payeeName } = req.body as Partial<PaymentQrConfig>;
    if (typeof qrImageUrl !== 'string' || qrImageUrl.length > 220_000) {
      res.status(400).json({ error: 'QR image payload exceeds 150 KB limit or is invalid.' });
      return;
    }
    store.qrConfig = {
      qrImageUrl,
      upiId: (upiId || store.qrConfig.upiId).trim(),
      payeeName: (payeeName || store.qrConfig.payeeName).trim(),
      updatedAt: new Date().toISOString(),
      updatedBy: 'Ms. B. Harshana',
    };
    await schedulePersist();
    res.json({ qrConfig: store.qrConfig });
  });

  // Coordinator Update Official Poster
  app.put('/api/coordinator/poster-config', requireCoordinator, async (req, res) => {
    const body = req.body as Partial<PosterConfig>;
    const validation = validatePosterConfigInput(body);
    if (!validation.valid) {
      res.status(400).json({ error: validation.error || 'Invalid poster configuration.' });
      return;
    }

    const isHidden = Boolean(body.isHidden);
    const posterImageUrl = isHidden
      ? ''
      : typeof body.posterImageUrl === 'string' && body.posterImageUrl.trim()
        ? body.posterImageUrl.trim()
        : store.posterConfig.posterImageUrl || DEFAULT_POSTER_CONFIG.posterImageUrl;

    store.posterConfig = {
      posterImageUrl,
      title: (body.title || store.posterConfig.title || DEFAULT_POSTER_CONFIG.title).trim(),
      caption: (body.caption || store.posterConfig.caption || DEFAULT_POSTER_CONFIG.caption).trim(),
      isHidden,
      isCustom:
        !isHidden && posterImageUrl !== DEFAULT_POSTER_CONFIG.posterImageUrl,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Ms. B. Harshana',
    };
    await schedulePersist();
    res.json({ posterConfig: store.posterConfig });
  });

  // Coordinator Remove Official Poster (hide from homepage)
  app.delete('/api/coordinator/poster-config', requireCoordinator, async (_req, res) => {
    store.posterConfig = {
      ...store.posterConfig,
      posterImageUrl: '',
      isHidden: true,
      isCustom: false,
      updatedAt: new Date().toISOString(),
      updatedBy: 'Ms. B. Harshana',
    };
    await schedulePersist();
    res.json({ posterConfig: store.posterConfig });
  });

  // Coordinator CSV Streaming Export
  app.get('/api/coordinator/export', requireCoordinator, (req, res) => {
    const mode = (req.query.type as CsvExportMode) || 'all';
    if (!['all', 'verified_payments', 'pending_payments', 'participants_roster'].includes(mode)) {
      res.status(400).json({ error: 'Unsupported CSV export mode.' });
      return;
    }
    const csv = generateCsvContent(store.registrations, mode);
    const filename = `harmonia-2027-${mode}-${new Date().toISOString().slice(0, 10)}.csv`;
    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
    res.send(csv);
  });

  if (!IS_PROD) {
    const vite = await createViteServer({
      server: { middlewareMode: true, allowedHosts: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distDir = path.resolve(__dirname, 'dist');
    app.use(
      express.static(distDir, {
        maxAge: '365d',
        setHeaders: (res, filePath) => {
          if (filePath.endsWith('.html')) {
            res.setHeader('Cache-Control', 'no-cache');
          }
        },
      })
    );
    app.get('*', (_req, res) => {
      res.sendFile(path.join(distDir, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`HARMONIA 2027 portal server listening on http://0.0.0.0:${PORT}`);
  });
}

void startServer();
