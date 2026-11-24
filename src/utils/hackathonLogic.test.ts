import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildUpiPaymentUri,
  calculateRegistrationFee,
  computeDashboardMetrics,
  computeEventCountdown,
  filterAndSearchRegistrations,
  generateCsvContent,
  generateRegistrationId,
  normalizeIndianMobile,
  REG_ID_REGEX,
  validateParticipantProfile,
  validatePosterConfigInput,
  validateTeamRegistration,
} from './hackathonLogic';
import type { RegistrationFormInput, TeamRegistration } from '../types/hackathon';

test('calculateRegistrationFee returns exact INR tiers for sizes 1-4', () => {
  assert.equal(calculateRegistrationFee(1), 150);
  assert.equal(calculateRegistrationFee(2), 300);
  assert.equal(calculateRegistrationFee(3), 450);
  assert.equal(calculateRegistrationFee(4), 500);
  assert.throws(() => calculateRegistrationFee(0));
  assert.throws(() => calculateRegistrationFee(5));
});

test('normalizeIndianMobile strips +91 and leading 0 cleanly', () => {
  assert.equal(normalizeIndianMobile('+91 98765 43210'), '9876543210');
  assert.equal(normalizeIndianMobile('09876543210'), '9876543210');
  assert.equal(normalizeIndianMobile('9876543210'), '9876543210');
});

test('generateRegistrationId conforms to HAR-2027-XXXXX format', () => {
  const id = generateRegistrationId(new Uint8Array([1, 2, 3, 4, 5]));
  assert.match(id, REG_ID_REGEX);
});

test('validateParticipantProfile validates required fields and mobile format', () => {
  const bad = validateParticipantProfile({
    fullName: 'A',
    email: 'invalid',
    mobile: '12345',
    whatsapp: '12345',
    department: '',
    institution: '',
  });
  assert.equal(bad.valid, false);
  assert.ok(bad.errors.fullName);
  assert.ok(bad.errors.mobile);

  const good = validateParticipantProfile({
    fullName: 'Ananya Sundaram',
    email: 'ananya@ritchennai.edu.in',
    mobile: '9876543210',
    whatsapp: '+91 9876543211',
    department: 'CSE - III Year',
    institution: 'Rajalakshmi Institute of Technology',
  });
  assert.equal(good.valid, true);
});

test('validateTeamRegistration enforces dynamic member counts accurately', () => {
  const baseInput: RegistrationFormInput = {
    teamName: 'BhashaBridge',
    trackId: 'linguaverse',
    leaderName: 'Karthik Rajan',
    leaderEmail: 'karthik@ritchennai.edu.in',
    leaderMobile: '9840112233',
    institution: 'Rajalakshmi Institute of Technology',
    memberCount: 1,
    members: [],
    projectTitle: 'Real-Time Dialect Voice Assistant',
    abstract:
      'Multilingual speech-to-speech pipeline supporting Tamil, Telugu, and regional rural dialects offline.',
    inclusionImpact: 'Enables rural healthcare clinics to communicate without language barriers.',
    paymentScreenshotUrl: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/',
  };

  // Solo team (size 1) passes with 0 additional members
  assert.equal(validateTeamRegistration(baseInput).valid, true);

  // Size 3 team fails if only 1 extra member provided
  const size3Missing = validateTeamRegistration({
    ...baseInput,
    memberCount: 3,
    members: [{ name: 'Priya S', email: 'priya@rit.edu', mobile: '9876501234' }],
  });
  assert.equal(size3Missing.valid, false);

  // Size 3 team passes when Member #2 and Member #3 are complete
  const size3Valid = validateTeamRegistration({
    ...baseInput,
    memberCount: 3,
    members: [
      { name: 'Priya S', email: 'priya@rit.edu', mobile: '9876501234' },
      { name: 'Vikram K', email: 'vikram@rit.edu', mobile: '9876505678' },
    ],
  });
  assert.equal(size3Valid.valid, true);
});

test('filterAndSearchRegistrations, computeDashboardMetrics, and generateCsvContent work coherently', () => {
  const sample: TeamRegistration[] = [
    {
      id: 'HAR-2027-A1B2C',
      teamName: 'LinguaSpark',
      leaderName: 'Divya M',
      leaderEmail: 'divya@rit.edu',
      leaderMobile: '9876543210',
      institution: 'RIT Chennai',
      trackId: 'linguaverse',
      memberCount: 4,
      members: [
        { name: 'M2', email: 'm2@rit.edu', mobile: '9876543211' },
        { name: 'M3', email: 'm3@rit.edu', mobile: '9876543212' },
        { name: 'M4', email: 'm4@rit.edu', mobile: '9876543213' },
      ],
      projectTitle: 'Dialect Neural Mesh',
      abstract: 'Low-resource speech synthesis for inclusive education across South India.',
      inclusionImpact: 'Empowers 50k+ first-generation learners.',
      registrationFee: 500,
      paymentStatus: 'VERIFIED',
      paymentScreenshotUrl: 'data:image/png;base64,abc',
      paymentUploadedAt: '2026-11-23T08:00:00Z',
      paymentVerifiedAt: '2026-11-23T09:00:00Z',
      paymentVerifiedBy: 'Ms. B. Harshana',
      status: 'Shortlisted',
      createdAt: '2026-11-23T08:00:00Z',
      updatedAt: '2026-11-23T09:00:00Z',
    },
    {
      id: 'HAR-2027-D3E4F',
      teamName: 'SenseGrid',
      leaderName: 'Arjun P',
      leaderEmail: 'arjun@annauniv.edu',
      leaderMobile: '9123456789',
      institution: 'CEG Anna University',
      trackId: 'iotverse',
      memberCount: 2,
      members: [{ name: 'Sana R', email: 'sana@annauniv.edu', mobile: '9123456780' }],
      projectTitle: 'Campus Flood Telemetry',
      abstract: 'LoRaWAN ultrasonic water-level nodes for proactive urban flood alerts.',
      inclusionImpact: 'Protects low-lying neighbourhoods during monsoon surges.',
      registrationFee: 300,
      paymentStatus: 'PENDING',
      paymentScreenshotUrl: 'data:image/png;base64,xyz',
      paymentUploadedAt: '2026-11-23T10:00:00Z',
      status: 'Submitted',
      createdAt: '2026-11-23T10:00:00Z',
      updatedAt: '2026-11-23T10:00:00Z',
    },
  ];

  const metrics = computeDashboardMetrics(sample);
  assert.equal(metrics.totalTeams, 2);
  assert.equal(metrics.totalInnovators, 6);
  assert.equal(metrics.verifiedCollectionsInr, 500);
  assert.equal(metrics.pendingProofsCount, 1);
  assert.equal(metrics.trackCounts.linguaverse, 1);
  assert.equal(metrics.trackCounts.iotverse, 1);

  assert.equal(
    filterAndSearchRegistrations(sample, { search: 'LoRaWAN', memberCount: 2 }).length,
    1
  );
  assert.equal(
    filterAndSearchRegistrations(sample, { trackId: 'linguaverse', status: 'Shortlisted' }).length,
    1
  );

  const rosterCsv = generateCsvContent(sample, 'participants_roster');
  assert.ok(rosterCsv.includes('Team Lead'));
  assert.ok(rosterCsv.includes('Member #4'));
  assert.ok(rosterCsv.includes('Sana R'));

  const upiUri = buildUpiPaymentUri(450, 'SenseGrid', 'HAR-2027-D3E4F');
  assert.ok(upiUri.startsWith('upi://pay?'));
  assert.ok(upiUri.includes('am=450'));
});

test('computeEventCountdown computes UPCOMING, LIVE, and COMPLETED states accurately', () => {
  const start = Date.parse('2027-02-03T09:00:00+05:30');
  const end = Date.parse('2027-02-04T16:00:00+05:30');

  // 2 days, 3 hours, 4 minutes, 5 seconds before start
  const deltaBefore = ((2 * 86400) + (3 * 3600) + (4 * 60) + 5) * 1000;
  const upcoming = computeEventCountdown(start - deltaBefore, start, end);
  assert.equal(upcoming.status, 'UPCOMING');
  assert.equal(upcoming.days, 2);
  assert.equal(upcoming.hours, 3);
  assert.equal(upcoming.minutes, 4);
  assert.equal(upcoming.seconds, 5);

  // Mid-hackathon (10 hours, 15 minutes remaining to end)
  const deltaLive = ((10 * 3600) + (15 * 60) + 30) * 1000;
  const live = computeEventCountdown(end - deltaLive, start, end);
  assert.equal(live.status, 'LIVE');
  assert.equal(live.days, 0);
  assert.equal(live.hours, 10);
  assert.equal(live.minutes, 15);
  assert.equal(live.seconds, 30);

  // Completed after end timestamp
  const done = computeEventCountdown(end + 5000, start, end);
  assert.equal(done.status, 'COMPLETED');
  assert.equal(done.days, 0);
  assert.equal(done.hours, 0);
  assert.equal(done.minutes, 0);
  assert.equal(done.seconds, 0);
});

test('validatePosterConfigInput accepts valid posters or hidden state and rejects invalid schemes', () => {
  assert.equal(
    validatePosterConfigInput({
      posterImageUrl: '/assets/aistudio/poster.jpeg',
      title: 'HARMONIA 2027 Official Poster',
      caption: 'RIT Chennai',
      isHidden: false,
    }).valid,
    true
  );
  assert.equal(
    validatePosterConfigInput({
      posterImageUrl: '',
      isHidden: true,
    }).valid,
    true
  );
  assert.equal(
    validatePosterConfigInput({
      posterImageUrl: 'javascript:alert(1)',
      isHidden: false,
    }).valid,
    false
  );
});
