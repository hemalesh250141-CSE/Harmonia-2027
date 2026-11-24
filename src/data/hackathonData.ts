import type { HackathonTrack, PaymentQrConfig, PosterConfig, TeamRegistration } from '../types/hackathon';

export const EVENT_START_DATE = '2027-02-03T09:00:00+05:30';
export const EVENT_END_DATE = '2027-02-04T16:00:00+05:30';
export const TOTAL_PRIZE_POOL_INR = 50_000;
export const TOTAL_PRIZE_POOL_LABEL = '₹50,000';

export const HACKATHON_TRACKS: HackathonTrack[] = [
  {
    id: 'linguaverse',
    code: 'Track 01',
    title: 'Linguaverse — AI for Every Language',
    shortTitle: 'Linguaverse',
    sponsor: 'iDataMind & RIT CSE NLP Lab',
    tagline: 'AI for Every Language',
    description:
      'Build inclusive multilingual NLP, speech-to-speech translation, sign-to-text, or low-resource Indic & global dialect systems that bridge communication divides.',
    deliverables: [
      'Working multilingual model or conversational interface',
      'Latency & accuracy benchmark on regional dialects',
      'Accessible UI with voice or script fallback',
    ],
    accentHex: '#6B1FE0',
    gradientClass: 'from-violet-600/90 via-purple-600/85 to-indigo-600/90',
    badgeClass: 'bg-purple-50 text-[#6B1FE0] border-purple-200',
  },
  {
    id: 'abilityx',
    code: 'Track 02',
    title: 'AbilityX — Technology Without Barriers',
    shortTitle: 'AbilityX',
    sponsor: 'IEEE Sight & Assistive Engineering',
    tagline: 'Technology Without Barriers',
    description:
      'Design assistive hardware/software tools, adaptive navigation, neurodiverse learning companions, and screen-free interfaces for persons with disabilities.',
    deliverables: [
      'Assistive prototype validated against WCAG / accessibility norms',
      'Low-cost deployment blueprint for community adoption',
      'Live human-centered interaction demonstration',
    ],
    accentHex: '#E11D48',
    gradientClass: 'from-rose-500/90 via-pink-500/85 to-red-500/90',
    badgeClass: 'bg-rose-50 text-rose-700 border-rose-200',
  },
  {
    id: 'roots',
    code: 'Track 03',
    title: 'Roots to Futures — Innovating for Communities',
    shortTitle: 'Roots to Futures',
    sponsor: 'HARMONIA Global Inclusion',
    tagline: 'Innovating for Communities',
    description:
      'Craft grassroots digital public goods for rural healthcare, precision agritech, clean water stewardship, and equitable civic micro-finance.',
    deliverables: [
      'Offline-resilient web, SMS, or edge-first application',
      'Measurable community impact & adoption metric model',
      'Field-ready deployment workflow',
    ],
    accentHex: '#059669',
    gradientClass: 'from-emerald-500/90 via-teal-500/85 to-green-600/90',
    badgeClass: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  },
  {
    id: 'flowforge',
    code: 'Track 04',
    title: 'FlowForge — Intelligent Logistics and Supply Chains',
    shortTitle: 'FlowForge',
    sponsor: 'iDataMind Intelligence',
    tagline: 'Intelligent Logistics and Supply Chains',
    description:
      'Optimize cold-chain food/vaccine routing, predictive demand forecasting, port/fleet orchestration, and transparent ethical sourcing.',
    deliverables: [
      'Real-time route or inventory optimization engine',
      'Interactive telemetry & bottleneck simulation view',
      'Carbon & cost-reduction impact projection',
    ],
    accentHex: '#D97706',
    gradientClass: 'from-amber-500/90 via-orange-500/85 to-yellow-600/90',
    badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
  },
  {
    id: 'iotverse',
    code: 'Track 05',
    title: 'IoTVerse — Connecting the Intelligent World',
    shortTitle: 'IoTVerse',
    sponsor: 'RIT Sensor Networks & IEEE',
    tagline: 'Connecting the Intelligent World',
    description:
      'Engineer smart energy microgrids, urban environmental sensing, Edge-AI industrial safety nodes, and resilient V2X / campus IoT meshes.',
    deliverables: [
      'Sensor-to-cloud pipeline (hardware or faithful digital twin)',
      'Edge anomaly detection or energy-saving control loop',
      'Secure device provisioning & telemetry dashboard',
    ],
    accentHex: '#0284C7',
    gradientClass: 'from-sky-500/90 via-blue-600/85 to-cyan-600/90',
    badgeClass: 'bg-sky-50 text-sky-700 border-sky-200',
  },
];

export const TRACK_MAP: Record<string, HackathonTrack> = Object.fromEntries(
  HACKATHON_TRACKS.map((t) => [t.id, t])
);

export const OFFICIAL_ASSETS = {
  harmoniaLogo3D:
    '/assets/aistudio/Screenshot_2026-11-23_150717-Picsart-BackgroundRemover-Picsart-AiImageEnhancer_11db3aac.png',
  ritWhiteLogo:
    '/assets/aistudio/WhatsApp_Image_2026-11-23_at_2_56_19_PM-Picsart-BackgroundRemover_808bbbaf.jpeg',
  ritDarkLogo: '/assets/logos/rit-logo.png',
  ritEmblem: '/assets/logos/rit-emblem.png',
  accreditations: '/assets/logos/accreditations-logo.png',
  ieeeBlueLogo: '/assets/aistudio/IMG_3d102db4-a155-4cd1-91f8-6389e513056c_87e99980.png',
  ieeeCisLogo: '/assets/aistudio/IMG_4cdac4ae-329c-445c-b334-7abe36f63f99.jpg_0a6db44c.jpeg',
  ieeeCsCrop: '/assets/logos/ieee-logo.png',
  idatamindWebp: '/assets/aistudio/ll_6ea303a4.webp',
  idatamindCrop: '/assets/logos/idatamind-logo.png',
  officialPoster: '/assets/aistudio/WhatsApp_Image_2026-11-23_at_1.23.00_PM_5ad45200.jpeg',
};

export const DEFAULT_POSTER_CONFIG: PosterConfig = {
  posterImageUrl: OFFICIAL_ASSETS.officialPoster,
  title: 'HARMONIA 2027 — Official Event Poster',
  caption: 'Rajalakshmi Institute of Technology · Feb 3 & 4, 2027 · Prize Pool ₹50,000',
  isHidden: false,
  isCustom: false,
  updatedAt: '2026-11-23T08:00:00.000Z',
  updatedBy: 'Ms. B. Harshana',
};

export const TIMELINE_EVENTS = [
  {
    phase: 'Phase 01',
    date: 'Nov 25, 2026 – Jan 18, 2027',
    title: 'Registration & Proposal Submission',
    description:
      'Form teams of 1–4 members, select one of the 5 global tracks, submit your technical abstract, and upload UPI registration proof.',
  },
  {
    phase: 'Phase 02',
    date: 'Jan 22, 2027',
    title: 'Shortlist & Mentor Pairing',
    description:
      'IEEE & iDataMind technical panels screen abstracts for novelty, feasibility, and inclusion impact. Shortlisted teams receive mentor slots.',
  },
  {
    phase: 'Phase 03',
    date: 'Feb 3, 2027 · 09:00 AM IST',
    title: 'Opening Ceremony & 24-Hour Build Sprint',
    description:
      'Inauguration at RIT Chennai Campus, problem deep-dives, hardware/cloud kit onboarding, and continuous 24-hour engineering sprint.',
  },
  {
    phase: 'Phase 04',
    date: 'Feb 4, 2027 · 09:00 AM – 04:00 PM IST',
    title: 'Code Freeze, Grand Jury & Valedictory',
    description:
      'Live prototype demonstrations before international industry & academic jury, prize distribution, and iDataMind internship offers.',
  },
];

export const JOURNEY_MILESTONES = [
  {
    step: '01',
    label: 'Registration',
    window: 'Opens Nov 25, 2026',
    detail: 'Create your participant profile and unlock your HAR-2027 slot.',
  },
  {
    step: '02',
    label: 'Team Formation',
    window: '1–4 Members',
    detail: 'Assemble cross-disciplinary solo or squad rosters across institutions.',
  },
  {
    step: '03',
    label: 'Idea Submission',
    window: 'Until Jan 18, 2027',
    detail: 'Pick 1 of 5 tracks, submit abstract & inclusion impact with UPI proof.',
  },
  {
    step: '04',
    label: 'Selection',
    window: 'Jan 22, 2027',
    detail: 'IEEE & iDataMind screening shortlist + technical mentor pairing.',
  },
  {
    step: '05',
    label: 'Hackathon',
    window: 'Feb 3–4, 2027 · 24 Hrs',
    detail: 'Continuous on-campus build sprint at RIT Chennai CSE Innovation Labs.',
  },
  {
    step: '06',
    label: 'Evaluation',
    window: 'Feb 4 · 09:30 AM IST',
    detail: 'Live prototype jury demo across technical depth & real-world inclusion.',
  },
  {
    step: '07',
    label: 'Results',
    window: 'Feb 4 · 02:30 PM IST',
    detail: 'Grand Champion awards, Track honors & iDataMind internship offers.',
  },
];

export const PROGRAMME_SCHEDULE = [
  {
    dayId: 'day1' as const,
    dayBadge: 'Day 01',
    dateLabel: 'Wednesday · 03 February 2027',
    summary: 'Inauguration, Problem Briefings & Continuous Overnight Build',
    sessions: [
      {
        index: '01',
        title: 'Team Check-In, Kit Distribution & Lab Onboarding',
        format: 'All Registered Teams (1–4 Members)',
        timing: '08:00 AM – 09:00 AM IST',
        venue: 'RIT Main Auditorium Lobby',
      },
      {
        index: '02',
        title: 'Opening Ceremony & Keynote: Ideas Beyond Borders',
        format: 'RIT Leadership, IEEE CS & iDataMind',
        timing: '09:00 AM – 10:15 AM IST',
        venue: 'RIT Auditorium, Chennai',
      },
      {
        index: '03',
        title: '24-Hour Hackathon Build Sprint Begins',
        format: 'Linguaverse · AbilityX · Roots · FlowForge · IoTVerse',
        timing: '10:30 AM IST Onwards',
        venue: 'CSE Innovation & IoT Sensor Labs',
      },
      {
        index: '04',
        title: 'Checkpoint 1: Architecture & Inclusion Mentor Clinic',
        format: 'IEEE & iDataMind Mentor Panels',
        timing: '04:30 PM – 07:00 PM IST',
        venue: 'Track Pods (CSE Block)',
      },
      {
        index: '05',
        title: 'Midnight Code Sprint & Hardware Bench Support',
        format: '24h Workspace + Refreshments',
        timing: '11:30 PM – 06:00 AM IST',
        venue: 'RIT 24h Hackathon Arena',
      },
    ],
  },
  {
    dayId: 'day2' as const,
    dayBadge: 'Day 02',
    dateLabel: 'Thursday · 04 February 2027',
    summary: 'Code Freeze, Grand Jury Pitching & Valedictory Awards',
    sessions: [
      {
        index: '01',
        title: 'Checkpoint 2: Final Integration & Accessibility Verification',
        format: 'Technical Mentors & Lab Coordinators',
        timing: '06:30 AM – 08:30 AM IST',
        venue: 'CSE Innovation Labs',
      },
      {
        index: '02',
        title: 'Official Code Freeze & Repository Lock',
        format: 'All 5 Innovation Tracks',
        timing: '09:00 AM IST Sharp',
        venue: 'Portal & Git Submission',
      },
      {
        index: '03',
        title: 'Track Jury Demonstrations & Live Q&A',
        format: '7 min Live Demo + 3 min Jury Defense',
        timing: '09:30 AM – 12:30 PM IST',
        venue: 'Track Jury Rooms (CSE Block)',
      },
      {
        index: '04',
        title: 'Top Finalist Stage Showcase',
        format: 'Grand Jury Panel',
        timing: '01:30 PM – 02:30 PM IST',
        venue: 'RIT Main Auditorium',
      },
      {
        index: '05',
        title: 'Valedictory, ₹50,000 Prize Awards & Internship Fast-Track',
        format: 'Winners, Track Honors & Certificates',
        timing: '02:30 PM – 04:00 PM IST',
        venue: 'RIT Main Auditorium',
      },
    ],
  },
];

export const PRIZE_TIERS = [
  {
    tier: 'Total Cash Prize Pool',
    amount: '₹50,000',
    subtitle: 'Official HARMONIA 2027 Award Purse',
    perks: [
      'Awarded to top-performing solutions at RIT Chennai',
      'Judged across originality, impact, and engineering depth',
      'Official trophies, medallions & merit certificates',
    ],
    highlight: true,
  },
  {
    tier: 'Industry Fast-Track',
    amount: 'iDataMind',
    subtitle: 'Placement & Internship Opportunities',
    perks: [
      'Direct technical interview fast-track with iDataMind',
      'Industry mentorship from practicing AI & data architects',
      'Real-world deployment guidance beyond the 24-hour sprint',
    ],
    highlight: false,
  },
  {
    tier: 'Track Recognition',
    amount: '05 Tracks',
    subtitle: 'Linguaverse to IoTVerse Honors',
    perks: [
      'IEEE Computer Society & RIT CSE official excellence citations',
      'IEEE Women in Engineering & inclusion recognition',
      'Verified digital certificates for all participating innovators',
    ],
    highlight: false,
  },
];

export const POSTER_COORDINATORS = {
  student: [
    { name: 'Sathish MS', phone: '9384579988' },
    { name: 'Mohamed jamel S', phone: '8825455681' },
    { name: 'Siva Visveshwar VJ', phone: '8610645763' },
    { name: 'Harshini A', phone: '7305024560' },
    { name: 'Abina Jerlin M', phone: '8015183954', displayPhone: '80151 83954' },
  ],
  faculty: [
    { name: 'Ms. B. Harshana', role: 'AP/CSE', phone: '9952113855' },
    { name: 'Mr. P. Murugan', role: 'AP/CSE', phone: '9095324739' },
    { name: 'Mrs. T. Kavitha', role: 'AP/CSE', phone: '8754112325' },
    { name: 'Mr. Sabari Bala sundar. S', role: 'AP/CSE', phone: '8124932077' },
  ],
  leadership: [
    { name: 'Dr. Indumathi. N', role: 'Organizer' },
    { name: 'Dr. Uma. S', role: 'HoD/CSE' },
    { name: 'Dr. Neduncheliyan. S', role: 'DEAN/CSE' },
    { name: 'Dr. Maheswari. R', role: 'Principal' },
  ],
};

export const FAQ_ITEMS = [
  {
    q: 'Who can participate in HARMONIA 2027?',
    a: 'Undergraduate, postgraduate, and research students from any recognized university or engineering institution worldwide can form teams of 1 to 4 members. Inter-college and cross-disciplinary teams are warmly encouraged.',
  },
  {
    q: 'How is the registration fee structured?',
    a: 'Fees scale transparently by team size: Solo (1 Member) is ₹150, Duo (2 Members) is ₹300, Trio (3 Members) is ₹450, and Squad (4 Members) is ₹500. The fee covers hackathon kits, 24-hour workspace access, meals/refreshments at RIT Chennai, and official IEEE/iDataMind participation certificates.',
  },
  {
    q: 'How do I verify my payment and track my team status?',
    a: 'After scanning the official UPI QR code and uploading your payment screenshot, you receive a unique HAR-2027-XXXXX Registration ID. Faculty coordinators verify proofs in real time—check your live status anytime via the Team Dashboard button in the top navigation.',
  },
  {
    q: 'Can hardware or IoT teams bring microcontrollers?',
    a: 'Yes! IoTVerse and AbilityX teams are welcome to bring ESP32, Raspberry Pi, sensors, or assistive peripherals. High-speed Wi-Fi, power strips, and RIT Sensor Network lab benches will be provided on campus.',
  },
  {
    q: 'What if our payment proof is flagged or rejected?',
    a: 'If a screenshot is blurry or missing a UTR reference, coordinators add a specific rejection reason visible in your Team Dashboard so you can re-upload a clear receipt without losing your slot.',
  },
];

// Lightweight crisp SVG receipt preview used for seeded sample teams (<3KB)
function createSampleReceiptDataUrl(regId: string, utr: string, amount: number): string {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="420" height="260" viewBox="0 0 420 260">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0%" stop-color="#f8fafc"/><stop offset="100%" stop-color="#eef2ff"/></linearGradient></defs>
    <rect width="420" height="260" rx="16" fill="url(#g)" stroke="#cbd5e1"/>
    <rect x="20" y="20" width="380" height="52" rx="10" fill="#13354B"/>
    <text x="36" y="51" font-family="sans-serif" font-size="16" font-weight="700" fill="#ffffff">UPI PAYMENT RECEIPT</text>
    <text x="320" y="51" font-family="monospace" font-size="14" font-weight="700" fill="#34d399">SUCCESS</text>
    <text x="30" y="108" font-family="sans-serif" font-size="13" fill="#475569">Paid To: HARMONIA 2027 RIT CSE</text>
    <text x="30" y="138" font-family="sans-serif" font-size="26" font-weight="800" fill="#13354B">INR ${amount}.00</text>
    <text x="30" y="175" font-family="monospace" font-size="13" fill="#334155">UTR Ref: ${utr}</text>
    <text x="30" y="200" font-family="monospace" font-size="13" fill="#6B1FE0">Team Ref: ${regId}</text>
    <text x="30" y="232" font-family="sans-serif" font-size="11" fill="#64748b">Verified via Unified Payments Interface (NPCI)</text>
  </svg>`;
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

export const DEFAULT_QR_CONFIG: PaymentQrConfig = {
  qrImageUrl: '',
  upiId: 'harmonia2027.rit@okicici',
  payeeName: 'HARMONIA 2027 — RIT CSE',
  updatedAt: '2026-11-23T08:00:00.000Z',
  updatedBy: 'Ms. B. Harshana',
};

export const SEED_REGISTRATIONS: TeamRegistration[] = [
  {
    id: 'HAR-2027-K9M4P',
    teamName: 'VaniBridge AI',
    leaderName: 'Ananya Sundaram',
    leaderEmail: 'ananya.s@ritchennai.edu.in',
    leaderMobile: '9840123456',
    institution: 'Rajalakshmi Institute of Technology, Chennai',
    trackId: 'linguaverse',
    memberCount: 4,
    members: [
      { name: 'Karthik Narayanan', email: 'karthik.n@ritchennai.edu.in', mobile: '9840123457' },
      { name: 'Meera Krishnan', email: 'meera.k@ritchennai.edu.in', mobile: '9840123458' },
      { name: 'Rohan Dev', email: 'rohan.d@ritchennai.edu.in', mobile: '9840123459' },
    ],
    projectTitle: 'Offline Tamil-to-Sign Real-Time Avatar',
    abstract:
      'A quantized on-device neural speech pipeline converting regional Tamil and Hindi dialects into 3D Indian Sign Language skeletal animations in under 120ms without cloud connectivity.',
    inclusionImpact:
      'Empowers deaf and hard-of-hearing commuters at railway and hospital helpdesks across Tier-2/3 cities.',
    ieeeMemberId: 'IEEE-98234112',
    registrationFee: 500,
    paymentStatus: 'VERIFIED',
    paymentScreenshotUrl: createSampleReceiptDataUrl('HAR-2027-K9M4P', 'UTR432198004112', 500),
    paymentUploadedAt: '2026-11-20T09:15:00.000Z',
    paymentVerifiedAt: '2026-11-20T11:30:00.000Z',
    paymentVerifiedBy: 'Ms. B. Harshana',
    status: 'Shortlisted',
    createdAt: '2026-11-20T09:15:00.000Z',
    updatedAt: '2026-11-20T11:30:00.000Z',
  },
  {
    id: 'HAR-2027-T7Q2W',
    teamName: 'TactilePulse',
    leaderName: 'Pranav Venkatesh',
    leaderEmail: 'pranav.v@ceg.annauniv.edu',
    leaderMobile: '9789012345',
    institution: 'College of Engineering Guindy, Anna University',
    trackId: 'abilityx',
    memberCount: 3,
    members: [
      { name: 'Shruti Iyer', email: 'shruti.i@ceg.annauniv.edu', mobile: '9789012346' },
      { name: 'Deepak Balaji', email: 'deepak.b@ceg.annauniv.edu', mobile: '9789012347' },
    ],
    projectTitle: 'Haptic LiDAR Wristband for Low-Vision Mobility',
    abstract:
      'Wearable ESP32-S3 haptic array paired with micro-ToF depth sensors that translates overhead obstacles and wet floor hazards into directional vibration patterns.',
    inclusionImpact:
      'Reduces navigation collisions by 74% for visually impaired students in crowded campus corridors at under ₹1,800 BOM cost.',
    ieeeMemberId: 'IEEE-99012744',
    registrationFee: 450,
    paymentStatus: 'PENDING',
    paymentScreenshotUrl: createSampleReceiptDataUrl('HAR-2027-T7Q2W', 'UTR432287651009', 450),
    paymentUploadedAt: '2026-11-22T14:20:00.000Z',
    status: 'Submitted',
    createdAt: '2026-11-22T14:20:00.000Z',
    updatedAt: '2026-11-22T14:20:00.000Z',
  },
  {
    id: 'HAR-2027-R5X8N',
    teamName: 'KaveriMesh',
    leaderName: 'Nandhini Selvam',
    leaderEmail: 'nandhini@psgtech.ac.in',
    leaderMobile: '9443123456',
    institution: 'PSG College of Technology, Coimbatore',
    trackId: 'roots',
    memberCount: 2,
    members: [
      { name: 'Harish Kumar G', email: 'harish.g@psgtech.ac.in', mobile: '9443123457' },
    ],
    projectTitle: 'SMS-First Soil Moisture & Micro-Irrigation Advisor',
    abstract:
      'Edge telemetry aggregator syncing solar moisture probes with vernacular Tamil/Kannada SMS advisories and cooperative pump scheduling for smallholder paddy farms.',
    inclusionImpact:
      'Saves up to 28% groundwater usage for farmers without requiring smartphones or 4G coverage.',
    registrationFee: 300,
    paymentStatus: 'VERIFIED',
    paymentScreenshotUrl: createSampleReceiptDataUrl('HAR-2027-R5X8N', 'UTR432110992341', 300),
    paymentUploadedAt: '2026-11-21T07:40:00.000Z',
    paymentVerifiedAt: '2026-11-21T10:05:00.000Z',
    paymentVerifiedBy: 'Ms. B. Harshana',
    status: 'Finalist',
    createdAt: '2026-11-21T07:40:00.000Z',
    updatedAt: '2026-11-21T10:05:00.000Z',
  },
  {
    id: 'HAR-2027-F4L9C',
    teamName: 'ColdChainTwin',
    leaderName: 'Siddharth Menon',
    leaderEmail: 'siddharth@vit.ac.in',
    leaderMobile: '9962011223',
    institution: 'VIT Vellore',
    trackId: 'flowforge',
    memberCount: 4,
    members: [
      { name: 'Aishwarya Nair', email: 'aishwarya.n@vit.ac.in', mobile: '9962011224' },
      { name: 'Vikramaditya Rao', email: 'vikram.r@vit.ac.in', mobile: '9962011225' },
      { name: 'Neha Sharma', email: 'neha.s@vit.ac.in', mobile: '9962011226' },
    ],
    projectTitle: 'Predictive Perishable Cold-Chain Rerouting Engine',
    abstract:
      'Graph-neural ETA & thermal-excursion predictor integrating reefers telemetry and highway congestion feeds to dynamically re-route vaccine and produce shipments before spoilage.',
    inclusionImpact:
      'Prevents 18% rural primary health center vaccine wastage across tropical transit corridors.',
    ieeeMemberId: 'IEEE-97551203',
    registrationFee: 500,
    paymentStatus: 'PENDING',
    paymentScreenshotUrl: createSampleReceiptDataUrl('HAR-2027-F4L9C', 'UTR432299014411', 500),
    paymentUploadedAt: '2026-11-22T19:10:00.000Z',
    status: 'Under Review',
    createdAt: '2026-11-22T19:10:00.000Z',
    updatedAt: '2026-11-22T20:00:00.000Z',
  },
  {
    id: 'HAR-2027-V8Z3J',
    teamName: 'AeroGrid Solo',
    leaderName: 'Lakshmi Narayanan S',
    leaderEmail: 'lakshmi.s@nitt.edu',
    leaderMobile: '9894567890',
    institution: 'NIT Tiruchirappalli',
    trackId: 'iotverse',
    memberCount: 1,
    members: [],
    projectTitle: 'Self-Healing Campus Solar Microgrid Node',
    abstract:
      'LoRaWAN smart inverter watchdog predicting battery thermal drift and autonomously balancing DC microgrid loads across campus hostels during grid brownouts.',
    inclusionImpact:
      'Guarantees uninterrupted lighting and assistive charging stations in rural community colleges.',
    registrationFee: 150,
    paymentStatus: 'VERIFIED',
    paymentScreenshotUrl: createSampleReceiptDataUrl('HAR-2027-V8Z3J', 'UTR432188776612', 150),
    paymentUploadedAt: '2026-11-19T16:45:00.000Z',
    paymentVerifiedAt: '2026-11-20T08:15:00.000Z',
    paymentVerifiedBy: 'Ms. B. Harshana',
    status: 'Under Review',
    createdAt: '2026-11-19T16:45:00.000Z',
    updatedAt: '2026-11-20T08:15:00.000Z',
  },
  {
    id: 'HAR-2027-M2P6H',
    teamName: 'BrailleCanvas',
    leaderName: 'Keerthana Raj',
    leaderEmail: 'keerthana@ssn.edu.in',
    leaderMobile: '9884223344',
    institution: 'SSN College of Engineering, Chennai',
    trackId: 'abilityx',
    memberCount: 2,
    members: [
      { name: 'Tarun Prasad', email: 'tarun.p@ssn.edu.in', mobile: '9884223345' },
    ],
    projectTitle: 'STEM Diagram Tactile Audio Explorer',
    abstract:
      'Converts uploaded STEM circuit schematics and math graphs into interactive spatial audio cues paired with refreshable tactile grid coordinates for blind learners.',
    inclusionImpact:
      'Makes engineering physics & calculus diagrams accessible independently without sighted scribes.',
    registrationFee: 300,
    paymentStatus: 'PENDING',
    paymentScreenshotUrl: createSampleReceiptDataUrl('HAR-2027-M2P6H', 'UTR432291122033', 300),
    paymentUploadedAt: '2026-11-23T06:12:00.000Z',
    status: 'Submitted',
    createdAt: '2026-11-23T06:12:00.000Z',
    updatedAt: '2026-11-23T06:12:00.000Z',
  },
];
