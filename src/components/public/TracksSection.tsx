import React, { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  ArrowRight,
  ArrowUpRight,
  Box,
  CheckCircle2,
  ChevronDown,
  Code2,
  Eye,
  Globe,
  Sprout,
  Wifi,
  X,
} from 'lucide-react';
import { HACKATHON_TRACKS } from '../../data/hackathonData';
import type { HackathonTrack, TrackId } from '../../types/hackathon';
import { HARMONIA_EASE, RevealSection } from '../motion/MotionPrimitives';
import { InteractiveWaveform } from '../motion/MusicalMotionPrimitives';

interface TracksSectionProps {
  selectedTrackId: TrackId;
  trackCounts: Record<TrackId, number>;
  onSelectTrackForRegistration: (trackId: TrackId) => void;
}

const TRACK_THEME: Record<
  TrackId,
  {
    icon: React.ReactNode;
    accentText: string;
    borderGlow: string;
    btnClass: string;
    categoryLabel: string;
    surfaceBg: string;
    waveTone: 'violet' | 'cyan' | 'amber';
  }
> = {
  linguaverse: {
    icon: <Globe className="w-4 h-4 sm:w-5 sm:h-5 text-violet-300" />,
    accentText: 'text-violet-300',
    borderGlow: 'border-violet-400/55 shadow-[0_0_28px_-10px_rgba(139,92,246,0.5)]',
    btnClass: 'bg-violet-500 hover:bg-violet-400 text-white',
    categoryLabel: 'CH 01 · MULTILINGUAL NLP',
    surfaceBg: 'from-violet-950/90 via-[#0E132B] to-[#080C1B]',
    waveTone: 'violet',
  },
  abilityx: {
    icon: <Code2 className="w-4 h-4 sm:w-5 sm:h-5 text-rose-300" />,
    accentText: 'text-rose-300',
    borderGlow: 'border-rose-400/55 shadow-[0_0_28px_-10px_rgba(244,63,94,0.45)]',
    btnClass: 'bg-rose-500 hover:bg-rose-400 text-white',
    categoryLabel: 'CH 02 · ASSISTIVE TECH',
    surfaceBg: 'from-rose-950/90 via-[#191025] to-[#080C1B]',
    waveTone: 'violet',
  },
  roots: {
    icon: <Sprout className="w-4 h-4 sm:w-5 sm:h-5 text-emerald-300" />,
    accentText: 'text-emerald-300',
    borderGlow: 'border-emerald-400/55 shadow-[0_0_28px_-10px_rgba(16,185,129,0.45)]',
    btnClass: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950',
    categoryLabel: 'CH 03 · CIVIC RESILIENCE',
    surfaceBg: 'from-emerald-950/90 via-[#0C1D24] to-[#080C1B]',
    waveTone: 'cyan',
  },
  flowforge: {
    icon: <Box className="w-4 h-4 sm:w-5 sm:h-5 text-amber-300" />,
    accentText: 'text-amber-300',
    borderGlow: 'border-amber-400/55 shadow-[0_0_28px_-10px_rgba(245,158,11,0.45)]',
    btnClass: 'bg-amber-400 hover:bg-amber-300 text-slate-950',
    categoryLabel: 'CH 04 · SMART LOGISTICS',
    surfaceBg: 'from-amber-950/85 via-[#1C161E] to-[#080C1B]',
    waveTone: 'amber',
  },
  iotverse: {
    icon: <Wifi className="w-4 h-4 sm:w-5 sm:h-5 text-cyan-300" />,
    accentText: 'text-cyan-300',
    borderGlow: 'border-cyan-400/55 shadow-[0_0_28px_-10px_rgba(34,211,238,0.45)]',
    btnClass: 'bg-cyan-400 hover:bg-cyan-300 text-slate-950',
    categoryLabel: 'CH 05 · EDGE IOT MESH',
    surfaceBg: 'from-cyan-950/90 via-[#0A182D] to-[#080C1B]',
    waveTone: 'cyan',
  },
};

const TrackVisualPlate: React.FC<{ trackId: TrackId }> = ({ trackId }) => {
  switch (trackId) {
    case 'linguaverse':
      return (
        <svg viewBox="0 0 360 130" className="w-full h-full" fill="none" aria-hidden="true">
          <defs>
            <radialGradient id="lgGlow" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#8B5CF6" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#090D1F" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="360" height="130" fill="url(#lgGlow)" />
          <path d="M25 70 Q90 24 180 65 T335 58" stroke="#A78BFA" strokeWidth="1.8" strokeOpacity="0.85" />
          <path d="M25 82 Q110 112 185 68 T335 78" stroke="#22D3EE" strokeWidth="1.4" strokeOpacity="0.65" />
          <circle cx="95" cy="48" r="5" fill="#C4B5FD" />
          <circle cx="180" cy="65" r="7" fill="#FBBF24" />
          <circle cx="268" cy="56" r="5" fill="#22D3EE" />
          <text x="68" y="38" fill="#DDD6FE" fontSize="11" fontFamily="monospace">தமிழ்</text>
          <text x="164" y="40" fill="#FDE68A" fontSize="11" fontFamily="monospace">EN · NLP</text>
          <text x="252" y="38" fill="#A5F3FC" fontSize="11" fontFamily="monospace">हिन्दी</text>
        </svg>
      );
    case 'abilityx':
      return (
        <svg viewBox="0 0 360 130" className="w-full h-full" fill="none" aria-hidden="true">
          <defs>
            <radialGradient id="abGlow" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#F43F5E" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#090D1F" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="360" height="130" fill="url(#abGlow)" />
          <circle cx="180" cy="65" r="44" stroke="#FDA4AF" strokeWidth="1" strokeDasharray="4 4" />
          <circle cx="180" cy="65" r="28" stroke="#FB7185" strokeWidth="1.5" />
          <circle cx="180" cy="65" r="9" fill="#F43F5E" />
          <path d="M236 65 H315 M256 50 L295 50 M256 80 L295 80" stroke="#FDA4AF" strokeWidth="1.6" strokeLinecap="round" />
        </svg>
      );
    case 'roots':
      return (
        <svg viewBox="0 0 360 130" className="w-full h-full" fill="none" aria-hidden="true">
          <defs>
            <radialGradient id="rtGlow" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#10B981" stopOpacity="0.42" />
              <stop offset="100%" stopColor="#090D1F" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="360" height="130" fill="url(#rtGlow)" />
          <path d="M180 108 V56" stroke="#34D399" strokeWidth="2.5" strokeLinecap="round" />
          <path d="M180 68 C154 68 134 50 142 30 C164 30 180 46 180 68 Z" fill="#10B981" fillOpacity="0.45" stroke="#6EE7B7" />
          <path d="M180 60 C206 60 226 42 218 22 C196 22 180 38 180 60 Z" fill="#22D3EE" fillOpacity="0.3" stroke="#6EE7B7" />
          <path d="M75 96 L180 80 L285 96" stroke="#6EE7B7" strokeWidth="1.2" strokeDasharray="4 4" />
        </svg>
      );
    case 'flowforge':
      return (
        <svg viewBox="0 0 360 130" className="w-full h-full" fill="none" aria-hidden="true">
          <defs>
            <radialGradient id="ffGlow" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity="0.42" />
              <stop offset="100%" stopColor="#090D1F" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="360" height="130" fill="url(#ffGlow)" />
          <path d="M55 88 L128 46 L222 74 L305 36" stroke="#FBBF24" strokeWidth="2" strokeDasharray="5 4" />
          <polygon points="180,32 214,48 180,64 146,48" fill="#F59E0B" fillOpacity="0.35" stroke="#FDE68A" />
          <polygon points="146,48 180,64 180,94 146,78" fill="#D97706" fillOpacity="0.3" stroke="#FCD34D" />
          <polygon points="214,48 180,64 180,94 214,78" fill="#B45309" fillOpacity="0.35" stroke="#FCD34D" />
        </svg>
      );
    case 'iotverse':
      return (
        <svg viewBox="0 0 360 130" className="w-full h-full" fill="none" aria-hidden="true">
          <defs>
            <radialGradient id="ioGlow" cx="50%" cy="50%" r="55%">
              <stop offset="0%" stopColor="#22D3EE" stopOpacity="0.42" />
              <stop offset="100%" stopColor="#090D1F" stopOpacity="0" />
            </radialGradient>
          </defs>
          <rect width="360" height="130" fill="url(#ioGlow)" />
          <circle cx="180" cy="74" r="9" fill="#22D3EE" />
          <path d="M148 56 A42 42 0 0 1 212 56" stroke="#67E8F9" strokeWidth="2" strokeLinecap="round" />
          <path d="M126 42 A68 68 0 0 1 234 42" stroke="#22D3EE" strokeWidth="1.6" strokeOpacity="0.8" strokeLinecap="round" />
          <line x1="76" y1="96" x2="180" y2="74" stroke="#67E8F9" strokeOpacity="0.45" />
          <line x1="284" y1="96" x2="180" y2="74" stroke="#67E8F9" strokeOpacity="0.45" />
        </svg>
      );
  }
};

export const TracksSection: React.FC<TracksSectionProps> = ({
  selectedTrackId,
  trackCounts,
  onSelectTrackForRegistration,
}) => {
  const [focusedTrackId, setFocusedTrackId] = useState<TrackId>(selectedTrackId);
  const [expandedMobileTrack, setExpandedMobileTrack] = useState<TrackId | null>('linguaverse');
  const [modalTrack, setModalTrack] = useState<HackathonTrack | null>(null);
  const shouldReduceMotion = useReducedMotion();

  const activeTrack =
    HACKATHON_TRACKS.find((t) => t.id === focusedTrackId) || HACKATHON_TRACKS[0];

  return (
    <section id="tracks" className="relative py-12 sm:py-16 lg:py-20 border-t border-white/8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 space-y-6 sm:space-y-8">
        <RevealSection className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="max-w-2xl">
            <p className="text-[11px] sm:text-xs font-mono uppercase tracking-[0.18em] text-amber-400 mb-1.5">
              5 Frequency Channels · HARMONIA 2027
            </p>
            <h2 className="font-display text-2xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight text-balance">
              Tune Into Your{' '}
              <span className="text-amber-300">Innovation Channel.</span>
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-slate-300 max-w-md leading-relaxed">
            Five official hackathon domains co-curated by RIT CSE labs, IEEE, and iDataMind.
            Tap any track to expand deliverables or register directly.
          </p>
        </RevealSection>

        {/* Horizontal Touch-Friendly Frequency Filter Bar */}
        <div
          role="tablist"
          aria-label="Frequency Channel Selector"
          className="flex items-center justify-between gap-3 border-b border-white/10 pb-4 overflow-x-auto"
        >
          <div className="flex items-center gap-2 shrink-0">
            {HACKATHON_TRACKS.map((track) => {
              const isFocused = focusedTrackId === track.id;
              return (
                <button
                  key={track.id}
                  type="button"
                  role="tab"
                  aria-selected={isFocused}
                  onClick={() => {
                    setFocusedTrackId(track.id);
                    setExpandedMobileTrack(track.id);
                  }}
                  className={`relative px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer whitespace-nowrap min-h-[42px] shrink-0 ${
                    isFocused
                      ? 'text-slate-950'
                      : 'text-slate-300 bg-white/5 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {isFocused && (
                    <motion.span
                      layoutId="trackArenaPill"
                      transition={{ type: 'spring', stiffness: 400, damping: 32 }}
                      className="absolute inset-0 rounded-xl bg-amber-300"
                    />
                  )}
                  <span className="relative z-10 flex items-center gap-1.5">
                    <span className="font-mono">{track.code}</span>
                    <span>·</span>
                    <span>{track.shortTitle}</span>
                  </span>
                </button>
              );
            })}
          </div>

          <p className="hidden sm:block text-xs font-mono text-slate-400 whitespace-nowrap shrink-0">
            05 Active Channels
          </p>
        </div>

        {/* Interactive Frequency Channel Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-5">
          {HACKATHON_TRACKS.map((track, idx) => {
            const theme = TRACK_THEME[track.id];
            const isSelected = selectedTrackId === track.id;
            const isFocused = focusedTrackId === track.id;
            const isMobileExpanded = expandedMobileTrack === track.id;
            const teamCount = trackCounts[track.id] || 0;

            return (
              <motion.article
                key={track.id}
                onMouseEnter={() => setFocusedTrackId(track.id)}
                initial={shouldReduceMotion ? false : { opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.08 }}
                transition={{ duration: 0.4, delay: idx * 0.04, ease: HARMONIA_EASE }}
                whileHover={shouldReduceMotion ? undefined : { y: -4 }}
                className={`group rounded-2xl border bg-gradient-to-b ${theme.surfaceBg} overflow-hidden flex flex-col justify-between transition-all duration-300 ${
                  idx === 0 ? 'xl:col-span-2' : ''
                } ${
                  isFocused || isSelected
                    ? theme.borderGlow
                    : 'border-white/10 opacity-95 hover:opacity-100'
                }`}
              >
                <div>
                  {/* Compact Visual Spectrum Plate */}
                  <div className="relative h-32 sm:h-36 bg-[#070B18] border-b border-white/10 overflow-hidden">
                    <div className="w-full h-full transition-transform duration-500 group-hover:scale-105">
                      <TrackVisualPlate trackId={track.id} />
                    </div>

                    <div className="absolute top-3 left-3.5 right-3.5 flex items-center justify-between gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-slate-950/85 border border-white/15 text-[10px] font-mono tracking-wider text-slate-200 truncate">
                        {theme.categoryLabel}
                      </span>
                      <div className="flex items-center gap-2 shrink-0">
                        <InteractiveWaveform bars={5} tone={theme.waveTone} compact />
                        <span className="font-mono text-[11px] font-bold text-slate-300 whitespace-nowrap">
                          {teamCount} {teamCount === 1 ? 'Team' : 'Teams'}
                        </span>
                      </div>
                    </div>

                    <div className="absolute bottom-2.5 left-3.5 right-3.5 flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg bg-slate-950/90 border border-white/15 flex items-center justify-center shrink-0">
                        {theme.icon}
                      </div>
                      <span className={`text-xs font-semibold truncate ${theme.accentText}`}>
                        {track.sponsor}
                      </span>
                    </div>
                  </div>

                  {/* Card Body */}
                  <div className="p-4 sm:p-5 space-y-3">
                    <div>
                      <h3 className="font-display text-base sm:text-lg font-bold text-white leading-snug mb-1.5">
                        {track.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
                        {track.description}
                      </p>
                    </div>

                    {/* Touch-to-Expand Deliverables on Mobile; Visible on md+ */}
                    <button
                      type="button"
                      onClick={() =>
                        setExpandedMobileTrack(isMobileExpanded ? null : track.id)
                      }
                      aria-expanded={isMobileExpanded}
                      className="md:hidden w-full flex items-center justify-between pt-2 border-t border-white/10 text-xs font-semibold text-amber-300 min-h-[38px] cursor-pointer"
                    >
                      <span>{isMobileExpanded ? 'Hide Deliverables' : 'View Key Deliverables'}</span>
                      <ChevronDown
                        className={`w-4 h-4 transition-transform ${
                          isMobileExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    <ul
                      className={`space-y-1.5 pt-2 border-t border-white/8 ${
                        isMobileExpanded ? 'block' : 'hidden md:block'
                      }`}
                    >
                      {track.deliverables.map((deliv) => (
                        <li
                          key={deliv}
                          className="flex items-start gap-2 text-xs text-slate-300"
                        >
                          <CheckCircle2 className={`w-3.5 h-3.5 shrink-0 mt-0.5 ${theme.accentText}`} />
                          <span>{deliv}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Action Footer (>= 44px touch targets) */}
                <div className="px-4 sm:px-5 pb-4 sm:pb-5 pt-1 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectTrackForRegistration(track.id)}
                    className={`flex-1 inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all cursor-pointer min-h-[44px] ${theme.btnClass}`}
                  >
                    <span>{isSelected ? 'Selected for Team' : 'Select & Register'}</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    onClick={() => setModalTrack(track)}
                    aria-label={`Inspect ${track.shortTitle} track details`}
                    className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-slate-200 bg-white/8 hover:bg-white/15 border border-white/12 cursor-pointer min-h-[44px]"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Brief</span>
                  </button>
                </div>
              </motion.article>
            );
          })}
        </div>

        {/* Active Channel Strip */}
        <div className="obsidian-card rounded-2xl px-4 py-3.5 flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="font-mono text-xs font-bold text-amber-300 shrink-0">
              {activeTrack.code}
            </span>
            <span className="text-xs sm:text-sm font-semibold text-white truncate">
              {activeTrack.title}
            </span>
          </div>
          <button
            type="button"
            onClick={() => onSelectTrackForRegistration(activeTrack.id)}
            className="inline-flex items-center gap-1.5 text-xs font-bold text-amber-300 hover:text-amber-200 cursor-pointer whitespace-nowrap min-h-[36px]"
          >
            <span>Register for {activeTrack.shortTitle}</span>
            <ArrowUpRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Track Brief Modal */}
      <AnimatePresence>
        {modalTrack && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            role="dialog"
            aria-modal="true"
            aria-label={`${modalTrack.shortTitle} Track Brief`}
            className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4"
            onClick={() => setModalTrack(null)}
          >
            <motion.div
              initial={{ scale: 0.94, opacity: 0, y: 10 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ duration: 0.22, ease: HARMONIA_EASE }}
              className="obsidian-glass rounded-3xl max-w-xl w-full p-5 sm:p-7 relative text-white max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <button
                type="button"
                onClick={() => setModalTrack(null)}
                aria-label="Close track details"
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="h-32 rounded-2xl overflow-hidden bg-[#070B18] border border-white/10 mb-4">
                <TrackVisualPlate trackId={modalTrack.id} />
              </div>

              <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-amber-300 mb-2">
                <span>{modalTrack.code}</span>
                <span>·</span>
                <span>{modalTrack.sponsor}</span>
                <span>·</span>
                <span>{trackCounts[modalTrack.id] || 0} Registered Teams</span>
              </div>

              <h3 className="font-display text-xl sm:text-2xl font-extrabold text-white mb-2.5">
                {modalTrack.title}
              </h3>

              <p className="text-sm text-slate-300 leading-relaxed mb-4">
                {modalTrack.description}
              </p>

              <div className="rounded-2xl bg-white/5 border border-white/10 p-4 mb-5">
                <p className="text-xs font-mono uppercase tracking-wider text-cyan-300 mb-2.5">
                  Required Hackathon Deliverables
                </p>
                <ul className="space-y-2">
                  {modalTrack.deliverables.map((d) => (
                    <li key={d} className="flex items-start gap-2 text-xs sm:text-sm text-slate-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      <span>{d}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <button
                type="button"
                onClick={() => {
                  const id = modalTrack.id;
                  setModalTrack(null);
                  onSelectTrackForRegistration(id);
                }}
                className="w-full inline-flex items-center justify-center gap-2 px-5 py-3 rounded-xl text-sm font-bold cta-gold-btn cursor-pointer min-h-[48px]"
              >
                <span>Select {modalTrack.shortTitle} &amp; Register</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
};
